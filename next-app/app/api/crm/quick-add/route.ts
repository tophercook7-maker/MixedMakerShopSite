import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  canonicalizeLeadStatus,
  leadHasStandaloneWebsite,
  pickLeadInsertFields,
  pickLeadPatchFields,
} from "@/lib/crm-lead-schema";
import { findLeadDuplicate, normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import { logCrmAutomationEvent } from "@/lib/crm/automation-log";
import { buildLeadPath } from "@/lib/lead-route";
import {
  extensionCaptureLabelFromUrl,
  normalizeQuickAddRequestSource,
} from "@/lib/crm/lead-source";

function trimStr(v: unknown): string {
  return String(v ?? "").trim();
}

function hostnameFromUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return "Business";
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    return u.hostname.replace(/^www\./, "") || "Business";
  } catch {
    return "Business";
  }
}

function isLikelyValidHttpUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    return Boolean(u.hostname && u.hostname.includes("."));
  } catch {
    return false;
  }
}

const SERVICE_KEYWORDS = [
  "roof",
  "roofing",
  "lawn",
  "landscaping",
  "plumb",
  "plumbing",
  "hvac",
  "heating",
  "cooling",
  "paint",
  "painting",
  "clean",
  "cleaning",
  "mobile",
  "repair",
  "mechanic",
  "contractor",
  "pressure washing",
  "tree service",
  "salon",
  "beauty",
  "barber",
] as const;

function isGenericLeadSource(s: string | null | undefined): boolean {
  const x = String(s || "").trim().toLowerCase();
  return !x || x === "quick_add" || x === "bookmarklet";
}

function mergeLeadTags(existing: unknown, toAdd: string[]): string[] {
  const prev: string[] = Array.isArray(existing)
    ? (existing as unknown[]).map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  const set = new Set(prev);
  for (const t of toAdd) {
    const u = String(t || "").trim();
    if (u) set.add(u);
  }
  return Array.from(set);
}

function detectServiceKeyword(name: string, notes: string, category: string): boolean {
  const haystack = [name, notes, category].filter(Boolean).join(" ").toLowerCase();
  if (!haystack) return false;
  return SERVICE_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

type QuickAddSignals = {
  isFacebook: boolean;
  hasExternalWebsite: boolean;
  noWebsite: boolean;
  hasValidSite: boolean;
  websiteNormalized: string;
  tagsToAdd: string[];
  conversionScore: number;
  opportunityLabel: string | null;
};

function computeQuickAddSignals(args: {
  source: string;
  websiteRaw: string;
  source_url: string | null;
  nameRaw: string;
  notesExtra: string;
  categoryRaw: string;
}): QuickAddSignals {
  const websiteStr = String(args.websiteRaw || "");
  const hasExternalWebsite =
    Boolean(trimStr(args.websiteRaw)) &&
    !websiteStr.toLowerCase().includes("facebook.com") &&
    !websiteStr.toLowerCase().includes("fb.com");

  const noWebsite = !hasExternalWebsite;

  const isFacebook =
    args.source === "extension" &&
    Boolean(
      args.source_url?.includes("facebook.com") || args.source_url?.includes("fb.com")
    );

  const hasValidSite =
    hasExternalWebsite &&
    isLikelyValidHttpUrl(args.websiteRaw) &&
    leadHasStandaloneWebsite(args.websiteRaw);

  const websiteNormalized = hasValidSite
    ? args.websiteRaw.startsWith("http")
      ? args.websiteRaw
      : `https://${args.websiteRaw}`
    : "";

  const tagsToAdd: string[] = [];
  if (isFacebook) tagsToAdd.push("facebook_lead");
  if (isFacebook && noWebsite) {
    tagsToAdd.push("facebook_only");
    tagsToAdd.push("no_website_opportunity");
  } else if (!isFacebook && noWebsite) {
    tagsToAdd.push("no_website_opportunity");
  }

  let conversionScore = 50;
  if (isFacebook && noWebsite) conversionScore = 90;
  else if (isFacebook) conversionScore = 75;

  const serviceHit = detectServiceKeyword(args.nameRaw, args.notesExtra, args.categoryRaw);
  if (serviceHit) conversionScore = Math.min(100, conversionScore + 5);

  let opportunityLabel: string | null = null;
  if (isFacebook && noWebsite) opportunityLabel = "No website (Facebook only)";
  else if (isFacebook) opportunityLabel = "Facebook business";

  return {
    isFacebook,
    hasExternalWebsite,
    noWebsite,
    hasValidSite,
    websiteNormalized,
    tagsToAdd,
    conversionScore,
    opportunityLabel,
  };
}

function shouldRaiseScore(existing: number | null | undefined, next: number): boolean {
  if (existing == null || existing === undefined) return true;
  const cur = Number(existing);
  if (Number.isNaN(cur)) return true;
  return next > cur;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ownerId = String(user.id || "").trim();

  const body = await request.json().catch(() => ({}));
  const websiteRaw = trimStr(body.website);
  const nameRaw = trimStr(body.name);
  const source = normalizeQuickAddRequestSource(trimStr(body.source) || "quick_add");
  const notesExtra = trimStr(body.notes);
  const categoryRaw = trimStr(body.category);

  const captureUrlRaw = trimStr(body.source_url) || websiteRaw;
  const source_url = captureUrlRaw || null;

  let source_label = trimStr(body.source_label) || null;
  if (!source_label && source === "extension") {
    source_label = extensionCaptureLabelFromUrl(source_url);
  }

  const sig = computeQuickAddSignals({
    source,
    websiteRaw,
    source_url,
    nameRaw,
    notesExtra,
    categoryRaw,
  });

  const businessName =
    nameRaw ||
    (sig.websiteNormalized ? hostnameFromUrl(sig.websiteNormalized) : "New business");

  const fbPageUrl =
    sig.isFacebook && source_url && isLikelyValidHttpUrl(source_url)
      ? source_url.startsWith("http")
        ? source_url
        : `https://${source_url}`
      : sig.isFacebook && source_url
        ? source_url
        : null;
  const normalizedFacebook = fbPageUrl ? normalizeFacebookUrl(fbPageUrl) : "";

  const supabase = await createClient();

  const dedup = await findLeadDuplicate({
    supabase,
    ownerId,
    businessName,
    email: null,
    phone: null,
    website: sig.websiteNormalized || null,
    facebookUrl: normalizedFacebook ? fbPageUrl : null,
  });

  if (dedup.duplicate && dedup.matchedLeadId) {
    const leadId = dedup.matchedLeadId;

    const selectVariants = [
      "id,lead_tags,conversion_score,opportunity_score,source,lead_source,source_url,source_label,why_this_lead_is_here,facebook_url,normalized_facebook_url,website,has_website,normalized_website",
      "id,lead_tags,conversion_score,opportunity_score,source,lead_source,source_url,why_this_lead_is_here,facebook_url,website,has_website",
    ];

    let existing: Record<string, unknown> | null = null;
    for (const sel of selectVariants) {
      const { data, error } = await supabase
        .from("leads")
        .select(sel)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .maybeSingle();
      if (!error && data) {
        existing = data as unknown as Record<string, unknown>;
        break;
      }
    }

    if (existing) {
      const patchRaw: Record<string, unknown> = {};

      const prevTags = existing.lead_tags;
      const prevList = Array.isArray(prevTags)
        ? (prevTags as unknown[]).map((x) => String(x ?? "").trim()).filter(Boolean)
        : [];
      const prevSet = new Set(prevList);
      if (sig.tagsToAdd.some((t) => !prevSet.has(t))) {
        patchRaw.lead_tags = mergeLeadTags(prevTags, sig.tagsToAdd);
      }

      const curConv = existing.conversion_score as number | null | undefined;
      if (shouldRaiseScore(curConv, sig.conversionScore)) {
        patchRaw.conversion_score = sig.conversionScore;
        patchRaw.opportunity_score = sig.conversionScore;
      }

      const why = String(existing.why_this_lead_is_here || "").trim();
      if (!why && sig.opportunityLabel) {
        patchRaw.why_this_lead_is_here = sig.opportunityLabel;
      }

      const exSrc = String(existing.source || "").trim();
      const exLeadSrc = String(existing.lead_source || "").trim();
      if (isGenericLeadSource(exSrc) && isGenericLeadSource(exLeadSrc)) {
        patchRaw.source = source;
        patchRaw.lead_source = source;
      }

      if (!String(existing.source_url || "").trim() && source_url) {
        patchRaw.source_url = source_url;
      }
      if (!String(existing.source_label || "").trim() && source_label) {
        patchRaw.source_label = source_label;
      }

      if (!String(existing.facebook_url || "").trim() && fbPageUrl) {
        patchRaw.facebook_url = fbPageUrl;
        patchRaw.normalized_facebook_url = normalizedFacebook || null;
      }

      const exWeb = String(existing.website || "").trim();
      if (!exWeb && sig.websiteNormalized) {
        patchRaw.website = sig.websiteNormalized;
        patchRaw.has_website = sig.hasValidSite;
        patchRaw.normalized_website = normalizeWebsiteUrl(sig.websiteNormalized) || null;
      }

      const patch = pickLeadPatchFields(patchRaw);
      if (Object.keys(patch).length > 0) {
        const { error: upErr } = await supabase.from("leads").update(patch).eq("id", leadId).eq("owner_id", ownerId);
        if (upErr) {
          console.warn("[quick-add] duplicate enrich failed", upErr.message);
        } else {
          await logCrmAutomationEvent(supabase, {
            owner_id: ownerId,
            lead_id: leadId,
            event_type: "quick_add_lead_duplicate_enrich",
            payload: {
              source,
              is_facebook_capture: sig.isFacebook,
              no_website: sig.noWebsite,
              tags_added: sig.tagsToAdd,
              conversion_score: sig.conversionScore,
            },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      leadId,
      created: false,
      destination: "leads",
      leadPath: buildLeadPath(leadId, businessName),
      message: "Saved to Leads (this business was already in your list).",
    });
  }

  const baseNotes = `Captured via quick add (${source}).`;
  const notesCombined = [baseNotes, notesExtra].filter(Boolean).join("\n\n");

  const insertPayload = pickLeadInsertFields({
    owner_id: ownerId,
    business_name: businessName,
    website: sig.websiteNormalized || null,
    facebook_url: fbPageUrl,
    normalized_facebook_url: normalizedFacebook || null,
    has_website: sig.hasValidSite,
    normalized_website: normalizeWebsiteUrl(sig.websiteNormalized) || null,
    status: canonicalizeLeadStatus("new"),
    source,
    lead_source: source,
    source_url,
    source_label,
    conversion_score: sig.conversionScore,
    opportunity_score: sig.conversionScore,
    why_this_lead_is_here: sig.opportunityLabel,
    category: categoryRaw || null,
    notes: notesCombined,
    lead_tags: sig.tagsToAdd,
    primary_contact_name: null,
  });

  const { data: inserted, error: insertError } = await supabase
    .from("leads")
    .insert(insertPayload)
    .select("id")
    .maybeSingle();

  if (insertError || !inserted?.id) {
    console.warn("[quick-add] insert failed", insertError?.message);
    return NextResponse.json(
      { ok: false, error: insertError?.message || "Could not create lead." },
      { status: 500 }
    );
  }

  const leadId = String(inserted.id);

  try {
    await supabase.from("website_reviews").upsert(
      {
        lead_id: leadId,
        owner_id: ownerId,
        website_url: sig.websiteNormalized || null,
        website_status: sig.hasValidSite ? "live" : "none",
        website_grade: null,
        mobile_friendly: "unknown",
        clear_cta: "weak",
        branding_quality: "average",
        website_notes: "Captured from quick add flow",
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: "lead_id" }
    );
  } catch (e) {
    console.warn("[quick-add] website_reviews upsert skipped", e);
  }

  await logCrmAutomationEvent(supabase, {
    owner_id: ownerId,
    lead_id: leadId,
    event_type: "quick_add_lead",
    payload: {
      source,
      has_website: sig.hasValidSite,
      no_website: sig.noWebsite,
      is_facebook_capture: sig.isFacebook,
      conversion_score: sig.conversionScore,
    },
  });

  return NextResponse.json({
    ok: true,
    leadId,
    created: true,
    destination: "leads",
    leadPath: buildLeadPath(leadId, businessName),
    message: "Saved to Leads.",
  });
}
