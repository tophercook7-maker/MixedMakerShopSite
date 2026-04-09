import "server-only";

import { createClient } from "@/lib/supabase/server";

export type PublicLeadSiteDraftRow = {
  id: string;
  business_name: string;
  category: string;
  city: string | null;
  phone: string | null;
  address: string | null;
};

type RpcRow = {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  phone: string | null;
  address: string | null;
};

function mapRow(r: RpcRow): PublicLeadSiteDraftRow {
  return {
    id: String(r.id || ""),
    business_name: String(r.business_name || ""),
    category: String(r.category || "").trim() || "professional service",
    city: r.city != null ? String(r.city) : null,
    phone: r.phone != null ? String(r.phone) : null,
    address: r.address != null ? String(r.address) : null,
  };
}

export async function fetchPublicLeadSiteDraftBySlug(slug: string): Promise<PublicLeadSiteDraftRow | null> {
  const s = String(slug || "").trim();
  if (!s) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_lead_site_draft_preview_by_slug", { p_slug: s });
  if (error) {
    console.error("[public-lead-site-draft] by_slug", error.message);
    return null;
  }
  const rows = data as RpcRow[] | null;
  if (!rows?.length) return null;
  return mapRow(rows[0]!);
}

export async function fetchPublicLeadSiteDraftById(leadId: string): Promise<PublicLeadSiteDraftRow | null> {
  const id = String(leadId || "").trim();
  if (!id) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_lead_site_draft_preview_by_id", { p_lead_id: id });
  if (error) {
    console.error("[public-lead-site-draft] by_id", error.message);
    return null;
  }
  const rows = data as RpcRow[] | null;
  if (!rows?.length) return null;
  return mapRow(rows[0]!);
}

export async function fetchSiteDraftSlugForLeadId(leadId: string): Promise<string | null> {
  const id = String(leadId || "").trim();
  if (!id) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_site_draft_preview_slug_for_lead", { p_lead_id: id });
  if (error) {
    console.error("[public-lead-site-draft] slug_for_lead", error.message);
    return null;
  }
  const slug = typeof data === "string" ? data.trim() : "";
  return slug || null;
}
