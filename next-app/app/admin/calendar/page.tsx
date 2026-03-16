import { createClient } from "@/lib/supabase/server";
import { AdminCalendarView } from "@/components/admin/admin-calendar-view";

type LeadLite = {
  id: string;
  business_name?: string | null;
};

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();

  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to use the calendar.
        </p>
      </section>
    );
  }

  const { data: leadsRaw } = await supabase
    .from("leads")
    .select("id,business_name")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1000);
  const leads = (leadsRaw || []) as LeadLite[];

  return <AdminCalendarView leads={leads} />;
}
