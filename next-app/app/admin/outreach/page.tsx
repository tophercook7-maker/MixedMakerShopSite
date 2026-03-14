import Link from "next/link";
import { Mail, MessageSquareMore, SearchCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import { EmailTestPanel } from "@/components/admin/email-test-panel";
import { getCurrentUser, getProfile } from "@/lib/auth";

type EmailEvent = {
  lead_id: string | null;
  message_type: string | null;
  send_status: string | null;
  sent_at: string | null;
};

export default async function AdminOutreachPage() {
  await refreshDueFollowUps();
  const supabase = await createClient();
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const showEmailTestPanel = ["owner", "admin"].includes(String(profile?.role || ""));

  const [{ data: leads }, { data: events }] = await Promise.all([
    supabase
      .from("leads")
      .select("id,business_name,status,next_follow_up_at,last_contacted_at")
      .in("status", ["contacted", "follow_up_due", "replied"])
      .order("next_follow_up_at", { ascending: true, nullsFirst: false })
      .limit(50),
    supabase
      .from("email_events")
      .select("lead_id,message_type,send_status,sent_at,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const latestEventByLead = new Map<string, EmailEvent>();
  for (const row of (events || []) as EmailEvent[]) {
    const leadId = row.lead_id || "";
    if (!leadId || latestEventByLead.has(leadId)) continue;
    latestEventByLead.set(leadId, row);
  }

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5" style={{ color: "var(--admin-gold)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Outreach
          </h1>
        </div>
        <p style={{ color: "var(--admin-muted)" }}>
          Message queue for contacted leads, follow-up scheduling, and send history.
        </p>
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3 inline-flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
          <MessageSquareMore className="h-4 w-4" style={{ color: "var(--admin-gold)" }} />
          Outreach queue
        </h2>
        {!(leads || []).length ? (
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">No outreach queue yet</div>
            <div className="admin-empty-desc">Send an email from a lead to start tracking follow-ups.</div>
          </div>
        ) : (
          <div className="admin-table-wrap overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Status</th>
                  <th>Last Email Type</th>
                  <th>Send Status</th>
                  <th>Last Email Sent</th>
                  <th>Next Follow-Up</th>
                </tr>
              </thead>
              <tbody>
                {(leads || []).map((lead) => {
                  const event = latestEventByLead.get(lead.id);
                  return (
                    <tr key={lead.id}>
                      <td>{lead.business_name}</td>
                      <td>{String(lead.status || "").replace("_", " ")}</td>
                      <td>{event?.message_type || "—"}</td>
                      <td>{event?.send_status || "—"}</td>
                      <td>{event?.sent_at ? new Date(event.sent_at).toLocaleString() : "—"}</td>
                      <td>{lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="admin-card">
          <h2 className="text-lg font-semibold mb-2 inline-flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
            <SearchCheck className="h-4 w-4" style={{ color: "var(--admin-gold)" }} />
            Lead linkage
          </h2>
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            Linked Scout opportunities are locked from reappearing as new while tracked in CRM.
          </p>
        </div>
        <div className="admin-card">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
            Fast actions
          </h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-[var(--admin-gold)] hover:underline">
            Open Leads to preview/send outreach →
          </Link>
        </div>
      </section>

      {showEmailTestPanel && <EmailTestPanel />}
    </div>
  );
}
