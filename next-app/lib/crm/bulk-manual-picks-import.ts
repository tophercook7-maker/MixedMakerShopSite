import { z } from "zod";
import {
  canonicalizeLeadStatus,
  leadHasStandaloneWebsite,
  LEAD_FINGERPRINT_OPTIONAL_COLUMNS,
  pickLeadInsertFields,
} from "@/lib/crm-lead-schema";
import { MANUAL_PICK_SOURCE, mergeTopPickTags } from "@/lib/crm/manual-pick-leads";
import { findLeadDuplicate, normalizeBusinessName, normalizeEmail, normalizeFacebookUrl, normalizePhone, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import type { createClient } from "@/lib/supabase/server";

const emptyToUndef = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export const manualPickBulkRowSchema = z.object({
  business_name: z.string().min(1, "business_name required").max(200),
  category: z.string().max(200).optional().transform((v) => emptyToUndef(v) as string | undefined),
  location: z.string().max(200).optional().transform((v) => emptyToUndef(v) as string | undefined),
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((v) => emptyToUndef(v) as string | undefined),
  phone: z.string().max(50).optional().transform((v) => emptyToUndef(v) as string | undefined),
  facebook_url: z.string().max(500).optional().transform((v) => emptyToUndef(v) as string | undefined),
  website: z.string().max(500).optional().transform((v) => emptyToUndef(v) as string | undefined),
  city: z.string().max(120).optional().transform((v) => emptyToUndef(v) as string | undefined),
  state: z.string().max(32).optional().transform((v) => emptyToUndef(v) as string | undefined),
  notes: z.string().max(5000).optional().transform((v) => emptyToUndef(v) as string | undefined),
  lead_tags: z.array(z.string().max(120)).max(80).optional(),
  status: z.string().max(40).optional().transform((v) => emptyToUndef(v) as string | undefined),
});

export const manualPickBulkBodySchema = z.object({
  leads: z.array(manualPickBulkRowSchema).min(1).max(50),
});

export type ManualPickBulkRow = z.infer<typeof manualPickBulkRowSchema>;

export type ManualPickImportResult = {
  created: string[];
  skipped_duplicates: { business_name: string; id?: string; reason?: string }[];
  errors: { business_name: string; message: string }[];
};

/**
 * Insert manual_pick leads for one owner (dedup, fingerprints, canonical status/tags).
 */
export async function executeManualPickBulkImport(
  supabase: SupabaseServer,
  ownerId: string,
  rows: ManualPickBulkRow[]
): Promise<ManualPickImportResult> {
  const created: string[] = [];
  const skipped_duplicates: ManualPickImportResult["skipped_duplicates"] = [];
  const errors: ManualPickImportResult["errors"] = [];

  const fingerprintProbe = await supabase.from("leads").select("normalized_business_name").limit(1);
  const fingerprintFieldsAvailable = !fingerprintProbe.error;

  for (const row of rows) {
    const business_name = String(row.business_name || "").trim();
    const website = row.website ? String(row.website).trim() : undefined;
    const facebook_url = row.facebook_url ? String(row.facebook_url).trim() : undefined;
    const email = row.email ? String(row.email).trim() : undefined;
    const phone = row.phone ? String(row.phone).trim() : undefined;
    let city = row.city ? String(row.city).trim() : undefined;
    let state = row.state ? String(row.state).trim() : undefined;
    const loc = row.location ? String(row.location).trim() : "";
    if (loc && !city) {
      const m = loc.match(/^([^,]+)\s*,\s*([A-Za-z]{2})\s*$/);
      if (m) {
        city = m[1].trim();
        state = state || m[2].trim().toUpperCase();
      } else {
        city = loc;
      }
    }
    const category = row.category ? String(row.category).trim() : undefined;
    const industry = category;
    const notes = row.notes ? String(row.notes).trim() : undefined;
    if (!state && city && /hot springs/i.test(city)) {
      state = "AR";
    }
    const lead_tags = mergeTopPickTags(row.lead_tags);
    const status = canonicalizeLeadStatus(row.status ?? "new");

    const dedup = await findLeadDuplicate({
      supabase,
      ownerId,
      businessName: business_name,
      email: email || null,
      phone: phone || null,
      website: website || null,
      facebookUrl: facebook_url || null,
    });
    if (dedup.duplicate && dedup.matchedLeadId) {
      skipped_duplicates.push({
        business_name,
        id: dedup.matchedLeadId,
        reason: dedup.reason ?? undefined,
      });
      continue;
    }

    const candidatePayload = pickLeadInsertFields({
      business_name,
      status,
      email,
      phone,
      website,
      facebook_url,
      city,
      state,
      category,
      industry,
      notes,
      source: MANUAL_PICK_SOURCE,
      lead_source: MANUAL_PICK_SOURCE,
      source_label: "Owner Top Picks",
      lead_tags,
      has_website: leadHasStandaloneWebsite(website),
      normalized_website: normalizeWebsiteUrl(website) || undefined,
      normalized_facebook_url: normalizeFacebookUrl(facebook_url) || undefined,
      owner_id: ownerId,
      normalized_business_name: normalizeBusinessName(business_name),
      normalized_email: normalizeEmail(email || ""),
      normalized_phone: normalizePhone(phone || ""),
    });

    const fingerprintEntries: Record<string, unknown> = {};
    if (fingerprintFieldsAvailable) {
      for (const col of LEAD_FINGERPRINT_OPTIONAL_COLUMNS) {
        const v = candidatePayload[col as keyof typeof candidatePayload];
        if (v !== undefined) fingerprintEntries[col] = v;
      }
    }

    const safeInsertPayload = pickLeadInsertFields({
      ...candidatePayload,
      ...fingerprintEntries,
    });

    const { data, error } = await supabase.from("leads").insert(safeInsertPayload).select("id").maybeSingle();
    if (error || !data?.id) {
      errors.push({
        business_name,
        message: String(error?.message || "insert failed"),
      });
      continue;
    }
    created.push(String(data.id));
  }

  return { created, skipped_duplicates, errors };
}
