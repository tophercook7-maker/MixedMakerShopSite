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
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-lg border bg-card p-4 max-w-xl space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <dl className="text-sm space-y-1">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{profile?.email ?? user.email ?? "—"}</dd>
          <dt className="text-muted-foreground mt-2">Display name</dt>
          <dd>{profile?.full_name ?? "—"}</dd>
        </dl>
        <p className="text-xs text-muted-foreground">Profile editing can be added here.</p>
      </div>
      <div className="rounded-lg border bg-card p-4 max-w-xl space-y-2">
        <h2 className="font-semibold">Branding</h2>
        <p className="text-sm text-muted-foreground">Logo, site name, and theme options (placeholder).</p>
      </div>
      <div className="rounded-lg border bg-card p-4 max-w-xl space-y-2">
        <h2 className="font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">Future: email, calendar, accounting (placeholder).</p>
      </div>
    </div>
  );
}
