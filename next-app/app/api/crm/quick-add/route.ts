import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  canonicalizeLeadStatus,
  leadHasStandaloneWebsite,
  pickLeadInsertFields,
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

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ownerId = String(user.id || "").trim();

  const body = await request.json().catch(() => ({}));
  const websiteRaw = trimStr(body.website);
  const nameRaw = trimStr(body.name);
  const source = normalizeQuickAddRequestSource(trimStr(body.source) || "quick_add");
  const notesExtra = trimStr(body.notes);

  const hasValidSite = websiteRaw && isLikelyValidHttpUrl(websiteRaw) && leadHasStandaloneWebsite(websiteRaw);
  const websiteNormalized = hasValidSite
    ? (websiteRaw.startsWith("http") ? websiteRaw : `https://${websiteRaw}`)
    : "";

  const captureUrlRaw = trimStr(body.source_url) || websiteRaw;
  const source_url = captureUrlRaw || null;

  const isFacebook =
    source === "extension" &&
    (source_url?.includes("facebook.com") || source_url?.includes("fb.com"));

  let source_label = trimStr(body.source_label) || null;
  if (!source_label && source === "extension") {
    source_label = extensionCaptureLabelFromUrl(source_url);
  }

  const businessName =
    nameRaw ||
    (websiteNormalized ? hostnameFromUrl(websiteNormalized) : "New business");

  const supabase = await createClient();

  const dedup = await findLeadDuplicate({
    supabase,
    ownerId,
    businessName,
    email: null,
    phone: null,
    website: websiteNormalized || null,
    facebookUrl: null,
  });

  if (dedup.duplicate && dedup.matchedLeadId) {
    const leadId = dedup.matchedLeadId;
    return NextResponse.json({
      ok: true,
      leadId,
      created: false,
      destination: "leads",
      leadPath: buildLeadPath(leadId, businessName),
      message: "Saved to Leads (this business was already in your list).",
    });
  }

  let scoreStrong = !hasValidSite ? 80 : 55;
  if (isFacebook) scoreStrong = Math.max(scoreStrong, 88);

  const baseNotes = `Captured via quick add (${source}).`;
  const facebookAutoNote = isFacebook
    ? "Auto: Facebook page capture — prioritized as a web design lead (no standalone site)."
    : "";
  const notesCombined = [baseNotes, facebookAutoNote, notesExtra].filter(Boolean).join("\n\n");

  const tags: string[] = [];
  if (!hasValidSite) tags.push("no_website_opportunity");
  if (isFacebook) tags.push("facebook_capture");

  const fbPageUrl =
    isFacebook && source_url && isLikelyValidHttpUrl(source_url)
      ? source_url.startsWith("http")
        ? source_url
        : `https://${source_url}`
      : isFacebook && source_url
        ? source_url
        : null;
  const normalizedFacebook = fbPageUrl ? normalizeFacebookUrl(fbPageUrl) : "";

  const insertPayload = pickLeadInsertFields({
    owner_id: ownerId,
    business_name: businessName,
    website: websiteNormalized || null,
    facebook_url: fbPageUrl,
    normalized_facebook_url: normalizedFacebook || null,
    has_website: hasValidSite,
    normalized_website: normalizeWebsiteUrl(websiteNormalized) || null,
    status: canonicalizeLeadStatus("new"),
    source,
    lead_source: source,
    source_url,
    source_label,
    conversion_score: scoreStrong,
    opportunity_score: scoreStrong,
    why_this_lead_is_here: isFacebook
      ? "Facebook-only or Facebook-first presence — strong candidate for a proper website."
      : null,
    notes: notesCombined,
    lead_tags: tags,
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
        website_url: websiteNormalized || null,
        website_status: hasValidSite ? "live" : "none",
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
    payload: { source, has_website: hasValidSite, is_facebook_capture: isFacebook },
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
