import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  canonicalizeLeadStatus,
  leadHasStandaloneWebsite,
  pickLeadInsertFields,
} from "@/lib/crm-lead-schema";
import { findLeadDuplicate, normalizeBusinessName, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import { logCrmAutomationEvent } from "@/lib/crm/automation-log";

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
  const sourceRaw = trimStr(body.source) || "bookmarklet";
  const notesExtra = trimStr(body.notes);

  const hasValidSite = websiteRaw && isLikelyValidHttpUrl(websiteRaw) && leadHasStandaloneWebsite(websiteRaw);
  const websiteNormalized = hasValidSite
    ? (websiteRaw.startsWith("http") ? websiteRaw : `https://${websiteRaw}`)
    : "";

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
    return NextResponse.json({
      ok: true,
      leadId: dedup.matchedLeadId,
      created: false,
      message: "Lead already exists.",
    });
  }

  const scoreStrong = !hasValidSite ? 80 : 55;
  const baseNotes = `Captured via quick add (${sourceRaw}).`;
  const notesCombined = [baseNotes, notesExtra].filter(Boolean).join("\n\n");

  const tags: string[] = [];
  if (!hasValidSite) tags.push("no_website_opportunity");

  const insertPayload = pickLeadInsertFields({
    owner_id: ownerId,
    business_name: businessName,
    website: websiteNormalized || null,
    has_website: hasValidSite,
    normalized_website: normalizeWebsiteUrl(websiteNormalized) || null,
    status: canonicalizeLeadStatus("new"),
    lead_source: sourceRaw,
    conversion_score: scoreStrong,
    opportunity_score: scoreStrong,
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
    payload: { source: sourceRaw, has_website: hasValidSite },
  });

  return NextResponse.json({
    ok: true,
    leadId,
    created: true,
    message: "Lead added.",
  });
}
