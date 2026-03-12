import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Settings</h1>
      <div className="admin-card max-w-xl space-y-4">
        <h2 className="font-semibold" style={{ color: "var(--admin-fg)" }}>Profile</h2>
        <dl className="text-sm space-y-1">
          <dt style={{ color: "var(--admin-muted)" }}>Email</dt>
          <dd style={{ color: "var(--admin-fg)" }}>{profile?.email ?? user.email ?? "—"}</dd>
          <dt className="mt-2" style={{ color: "var(--admin-muted)" }}>Display name</dt>
          <dd style={{ color: "var(--admin-fg)" }}>{profile?.full_name ?? "—"}</dd>
        </dl>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>Profile editing can be added here.</p>
      </div>
      <div className="admin-card max-w-xl space-y-2">
        <h2 className="font-semibold" style={{ color: "var(--admin-fg)" }}>Branding</h2>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>Logo, site name, and theme options (placeholder).</p>
      </div>
      <div className="admin-card max-w-xl space-y-2">
        <h2 className="font-semibold" style={{ color: "var(--admin-fg)" }}>Integrations</h2>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>Future: email, calendar, accounting (placeholder).</p>
      </div>
    </div>
  );
}
