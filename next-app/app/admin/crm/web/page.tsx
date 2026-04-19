import { createClient } from "@/lib/supabase/server";
import { WebCrmDashboard } from "@/components/admin/crm/web-crm-dashboard";
import { parseWebCrmDashboardPreset } from "@/lib/crm/web-crm-dashboard-presets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCrmWebPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view leads.
        </p>
      </section>
    );
  }

  const sp = await searchParams;
  const preset = parseWebCrmDashboardPreset(sp);

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="admin-card">
        <p className="text-sm text-red-300">Could not load leads: {error.message}</p>
      </section>
    );
  }

  return (
    <WebCrmDashboard initialRows={(data || []) as Record<string, unknown>[]} initialPreset={preset} />
  );
}
