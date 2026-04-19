import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Compatibility: `/admin/leads` → web or print CRM while preserving query params. */
export default async function AdminLeadsCompatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  const crmRaw = Array.isArray(sp.crm_source) ? sp.crm_source[0] : sp.crm_source;
  const crm = String(crmRaw || "").toLowerCase();
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    const val = Array.isArray(v) ? v[0] : v;
    if (val != null && val !== "") qs.set(k, val);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  if (crm.includes("3d") || crm.includes("print")) {
    redirect(`/admin/crm/print${suffix}`);
  }
  redirect(`/admin/crm/web${suffix}`);
}
