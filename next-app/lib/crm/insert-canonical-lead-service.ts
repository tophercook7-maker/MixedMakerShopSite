import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canonicalizeLeadStatus,
  leadHasStandaloneWebsite,
  pickLeadInsertFields,
  pickLeadPatchFields,
} from "@/lib/crm-lead-schema";
import {
  findLeadDuplicate,
  normalizeBusinessName,
  normalizeEmail,
  normalizeFacebookUrl,
  normalizePhone,
  normalizeWebsiteUrl,
} from "@/lib/leads-dedup";

export type InboundLeadInsertResult =
  | { ok: true; lead_id: string; duplicate_skipped: false }
  | { ok: true; lead_id: string; duplicate_skipped: true; duplicate_reason: string | null }
  | { ok: false; error: string };

const REPEAT_NOTE_MAX = 12000;

/** Human-readable block appended to `notes` when the same person/business submits again (dedupe hit). */
function buildRepeatInboundNoteAppend(row: Record<string, unknown>, duplicateReason: string | null): string {
  const iso = new Date().toISOString();
  const lines: string[] = [`--- Repeat inbound (${iso}) ---`];
  if (duplicateReason) {
    lines.push(`Dedupe match: ${duplicateReason}`);
  }
  const src = row.source != null ? String(row.source).trim() : "";
  const lsrc = row.lead_source != null ? String(row.lead_source).trim() : "";
  if (src || lsrc) {
    lines.push(`Source: ${src || lsrc}${src && lsrc && src !== lsrc ? ` / ${lsrc}` : ""}`);
  }
  const contact = row.contact_name != null ? String(row.contact_name).trim() : "";
  if (contact) lines.push(`Contact: ${contact}`);
  const em = row.email != null ? String(row.email).trim() : "";
  if (em) lines.push(`Email: ${em}`);
  const ph = row.phone != null ? String(row.phone).trim() : "";
  if (ph) lines.push(`Phone: ${ph}`);
  const site = row.website != null ? String(row.website).trim() : "";
  if (site) lines.push(`Website: ${site}`);
  const fb = row.facebook_url != null ? String(row.facebook_url).trim() : "";
  if (fb) lines.push(`Facebook: ${fb}`);
  const why = row.why_this_lead_is_here != null ? String(row.why_this_lead_is_here).trim() : "";
  if (why) lines.push(`Context: ${why}`);
  const svc = row.service_type != null ? String(row.service_type).trim() : "";
  if (svc) lines.push(`Service: ${svc}`);
  const scout = row.scout_intake_reason != null ? String(row.scout_intake_reason).trim() : "";
  if (scout) lines.push(`Scout / intake: ${scout}`);
  const n = row.notes != null ? String(row.notes).trim() : "";
  if (n) lines.push(`Submission notes:\n${n}`);
  const firstMsg = row.first_outreach_message != null ? String(row.first_outreach_message).trim() : "";
  if (firstMsg) lines.push(`Message:\n${firstMsg}`);
  let block = lines.join("\n");
  if (block.length > REPEAT_NOTE_MAX) {
    block = `${block.slice(0, REPEAT_NOTE_MAX - 24)}\n… [truncated]`;
  }
  return block;
}

async function appendNotesToExistingLead(
  supabase: SupabaseClient,
  ownerId: string,
  leadId: string,
  appendBlock: string,
): Promise<void> {
  const { data: existing, error: fetchErr } = await supabase
    .from("leads")
    .select("notes")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (fetchErr) {
    console.error("[insertCanonicalInboundLead] duplicate: fetch notes failed", fetchErr);
    return;
  }

  const prev = String(existing?.notes ?? "").trimEnd();
  const merged = prev ? `${prev}\n\n${appendBlock}` : appendBlock;
  const patch = pickLeadPatchFields({
    notes: merged,
    last_updated_at: new Date().toISOString(),
  });
  const { error: upErr } = await supabase.from("leads").update(patch).eq("id", leadId).eq("owner_id", ownerId);
  if (upErr) {
    console.error("[insertCanonicalInboundLead] duplicate: note append failed", upErr);
  }
}

/**
 * Service-role path: insert (or skip on dedupe) a lead using the same shape as `/api/leads` POST.
 */
export async function insertCanonicalInboundLead(
  supabase: SupabaseClient,
  ownerId: string,
  row: Record<string, unknown>,
): Promise<InboundLeadInsertResult> {
  const websiteRaw = row.website != null ? String(row.website) : "";
  const fbRaw = row.facebook_url != null ? String(row.facebook_url) : "";

  const business_name = String(row.business_name || "").trim();
  if (!business_name) {
    return { ok: false, error: "business_name is required" };
  }

  const email = row.email != null ? String(row.email).trim() : "";
  const phone = row.phone != null ? String(row.phone).trim() : "";
  const source = String(row.source || row.lead_source || "inbound").trim() || "inbound";
  const status = canonicalizeLeadStatus(row.status ?? "new");

  const normalized_website = normalizeWebsiteUrl(websiteRaw) || undefined;
  const normalized_facebook_url = normalizeFacebookUrl(fbRaw) || undefined;
  const has_website = row.has_website != null ? Boolean(row.has_website) : leadHasStandaloneWebsite(websiteRaw);

  const dedup = await findLeadDuplicate({
    supabase,
    ownerId,
    businessName: business_name,
    email: email || null,
    phone: phone || null,
    website: websiteRaw || null,
    facebookUrl: fbRaw || null,
  });

  if (dedup.duplicate && dedup.matchedLeadId) {
    const leadId = String(dedup.matchedLeadId);
    const repeatNote = buildRepeatInboundNoteAppend(row, dedup.reason);
    await appendNotesToExistingLead(supabase, ownerId, leadId, repeatNote);
    return {
      ok: true,
      lead_id: leadId,
      duplicate_skipped: true,
      duplicate_reason: dedup.reason,
    };
  }

  const payload = pickLeadInsertFields({
    ...row,
    business_name,
    contact_name: row.contact_name != null ? String(row.contact_name).trim() || null : null,
    email: email || null,
    phone: phone || null,
    website: websiteRaw.trim() || null,
    facebook_url: fbRaw.trim() || null,
    has_website,
    normalized_website: normalized_website ?? null,
    normalized_facebook_url: normalized_facebook_url ?? null,
    source,
    lead_source: String(row.lead_source || source).trim() || source,
    status,
    owner_id: ownerId,
    normalized_business_name: normalizeBusinessName(business_name),
    normalized_email: normalizeEmail(email),
    normalized_phone: normalizePhone(phone),
  });

  const { data, error } = await supabase.from("leads").insert(payload).select("id").single();

  if (error || !data?.id) {
    return { ok: false, error: String(error?.message || "Lead insert failed") };
  }

  return { ok: true, lead_id: String(data.id), duplicate_skipped: false };
}
