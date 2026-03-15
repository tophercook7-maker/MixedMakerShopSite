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

export default async function AdminOutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  await refreshDueFollowUps();
  const supabase = await createClient();
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const showEmailTestPanel = ["owner", "admin", ""].includes(String(profile?.role || ""));

  const validStatuses = new Set(["contacted", "follow_up_due", "replied"]);
  let leadsQuery = supabase
    .from("leads")
    .select("id,business_name,status,next_follow_up_at,last_contacted_at")
    .in("status", ["contacted", "follow_up_due", "replied"])
    .order("next_follow_up_at", { ascending: true, nullsFirst: false })
    .limit(50);
  if (status && validStatuses.has(status)) {
    leadsQuery = leadsQuery.eq("status", status);
  }
  console.info("[Admin Outreach] navigating to detail page with filters", { status: status || null });
  const [{ data: leads }, { data: events }, { data: replyThreads }] = await Promise.all([
    leadsQuery,
    supabase
      .from("email_events")
      .select("lead_id,message_type,send_status,sent_at,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("email_threads")
      .select("id,lead_id,status,last_message_at,subject,contact_email")
      .eq("status", "active")
      .order("last_message_at", { ascending: false })
      .limit(30),
  ]);
  console.info("[Admin Outreach] detail query returned X rows", (leads || []).length);

  const latestEventByLead = new Map<string, EmailEvent>();
  for (const row of (events || []) as EmailEvent[]) {
    const leadId = row.lead_id || "";
    if (!leadId || latestEventByLead.has(leadId)) continue;
    latestEventByLead.set(leadId, row);
  }

  const replyLeadIds = (replyThreads || [])
    .map((thread) => thread.lead_id)
    .filter((id): id is string => Boolean(id));
  const { data: replyLeads } = replyLeadIds.length
    ? await supabase.from("leads").select("id,business_name").in("id", replyLeadIds)
    : { data: [] as { id: string; business_name: string }[] };
  const replyLeadMap = new Map((replyLeads || []).map((lead) => [lead.id, lead.business_name]));

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
            <div className="admin-empty-title">
              {status === "follow_up_due" ? "No follow-ups due right now" : "No outreach queue yet"}
            </div>
            <div className="admin-empty-desc">
              {status === "follow_up_due"
                ? "Leads with follow-up due status will appear here."
                : "Send an email from a lead to start tracking follow-ups."}
            </div>
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
                  <th>Actions</th>
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
                      <td>
                        <Link
                          href={`/admin/leads?lead=${encodeURIComponent(lead.id)}&focus=outreach&generate=1`}
                          className="text-xs font-semibold text-[var(--admin-gold)] hover:underline"
                        >
                          Generate Email
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3 inline-flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
          <MessageSquareMore className="h-4 w-4" style={{ color: "var(--admin-gold)" }} />
          New Replies
        </h2>
        {!(replyThreads || []).length ? (
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">No new replies</div>
            <div className="admin-empty-desc">Inbound replies will show here when they are matched to leads.</div>
          </div>
        ) : (
          <div className="admin-table-wrap overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Subject</th>
                  <th>Last Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(replyThreads || []).map((thread) => (
                  <tr key={thread.id}>
                    <td>{thread.lead_id ? replyLeadMap.get(thread.lead_id) || "Unknown lead" : "Unknown lead"}</td>
                    <td>{thread.contact_email || "—"}</td>
                    <td>{thread.subject || "—"}</td>
                    <td>{thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—"}</td>
                    <td>{String(thread.status || "").replace("_", " ") || "—"}</td>
                    <td>
                      {thread.lead_id ? (
                        <Link
                          href={`/admin/leads?lead=${encodeURIComponent(thread.lead_id)}&focus=outreach`}
                          className="text-xs font-semibold text-[var(--admin-gold)] hover:underline"
                        >
                          Open Timeline
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
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
