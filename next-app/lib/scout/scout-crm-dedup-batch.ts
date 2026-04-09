import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeBusinessName,
  normalizeEmail,
  normalizeFacebookUrl,
  normalizePhone,
  normalizeWebsiteUrl,
} from "@/lib/leads-dedup";

export type LeadDedupRow = {
  id?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  normalized_website?: string | null;
  normalized_facebook_url?: string | null;
};

export async function fetchLeadRowsForDedup(supabase: SupabaseClient, ownerId: string): Promise<LeadDedupRow[]> {
  const selectVariants = [
    "id,business_name,email,phone,website,facebook_url,normalized_website,normalized_facebook_url",
    "id,business_name,email,phone,website,facebook_url",
    "id,business_name,email,phone",
  ];
  for (const sel of selectVariants) {
    const { data, error } = await supabase.from("leads").select(sel).eq("owner_id", ownerId).limit(5000);
    if (!error) return (data || []) as LeadDedupRow[];
  }
  return [];
}

export function findDuplicateLeadIdForScoutRow(
  leads: LeadDedupRow[],
  args: {
    businessName?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    facebookUrl?: string | null;
  }
): { duplicate: boolean; leadId: string | null } {
  const normalized_business_name = normalizeBusinessName(args.businessName);
  const normalized_email = normalizeEmail(args.email);
  const normalized_phone = normalizePhone(args.phone);
  const normalized_website = normalizeWebsiteUrl(args.website);
  const normalized_facebook_url = normalizeFacebookUrl(args.facebookUrl);

  for (const row of leads) {
    const existingId = String(row.id || "").trim();
    if (!existingId) continue;
    if (normalized_email && normalizeEmail(row.email) === normalized_email) {
      return { duplicate: true, leadId: existingId };
    }
    if (normalized_phone && normalizePhone(row.phone) === normalized_phone) {
      return { duplicate: true, leadId: existingId };
    }
    if (normalized_facebook_url) {
      const rowFb =
        String(row.normalized_facebook_url || "").trim() || normalizeFacebookUrl(row.facebook_url);
      if (rowFb && rowFb === normalized_facebook_url) {
        return { duplicate: true, leadId: existingId };
      }
    }
    if (normalized_website) {
      const rowSite =
        String(row.normalized_website || "").trim() || normalizeWebsiteUrl(row.website);
      if (rowSite && rowSite === normalized_website) {
        return { duplicate: true, leadId: existingId };
      }
    }
    if (normalized_business_name && normalizeBusinessName(row.business_name) === normalized_business_name) {
      return { duplicate: true, leadId: existingId };
    }
  }
  return { duplicate: false, leadId: null };
}
