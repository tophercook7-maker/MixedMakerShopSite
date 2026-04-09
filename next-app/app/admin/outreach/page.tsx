import { Mail, MessageSquareMore, SearchCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import { EmailTestPanel } from "@/components/admin/email-test-panel";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { buildLeadPath } from "@/lib/lead-route";
import { isManualOnlyMode } from "@/lib/manual-mode";

type EmailEvent = {
  lead_id: string | null;
  message_type: string | null;
  send_status: string | null;
  sent_at: string | null;
};

type ReplyThreadRow = {
  id: string;
  lead_id: string | null;
  status: string | null;
  last_message_at: string | null;
  subject: string | null;
  contact_email: string | null;
};

type QueueLead = {
  id: string;
  business_name: string;
  status: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  outreach_sent: boolean | null;
  follow_up_1_sent: boolean | null;
  follow_up_2_sent: boolean | null;
  follow_up_3_sent: boolean | null;
  automation_paused: boolean | null;
  last_outreach_sent_at: string | null;
  email: string | null;
  website: string | null;
  has_website: boolean | null;
};

type BucketKey =
  | "paused"
  | "first_contact"
  | "follow_up_1"
  | "follow_up_2"
  | "follow_up_3"
  | "sent_recently"
  | "other";

const BUCKET_ORDER: BucketKey[] = [
  "paused",
  "first_contact",
  "follow_up_1",
  "follow_up_2",
  "follow_up_3",
  "other",
  "sent_recently",
];

const BUCKET_LABEL: Record<BucketKey, string> = {
  paused: "Paused",
  first_contact: "First contact",
  follow_up_1: "Follow-up 1",
  follow_up_2: "Follow-up 2",
  follow_up_3: "Follow-up 3+",
  sent_recently: "Sent recently",
  other: "Custom / other",
};

function outreachBucket(lead: QueueLead, now: number): BucketKey {
  if (lead.automation_paused) return "paused";
  const lastSent = lead.last_outreach_sent_at ? new Date(lead.last_outreach_sent_at).getTime() : NaN;
  if (Number.isFinite(lastSent) && now - lastSent < 72 * 3600000) return "sent_recently";
  if (!lead.outreach_sent) return "first_contact";
  if (!lead.follow_up_1_sent) return "follow_up_1";
  if (!lead.follow_up_2_sent) return "follow_up_2";
  if (!lead.follow_up_3_sent) return "follow_up_3";
  return "other";
}

function websiteSummary(lead: QueueLead): string {
  if (lead.has_website === false) return "No website";
  if (lead.website) return "Has website";
  return "Website unknown";
}

function OutreachQueueCard({
  lead,
  event,
}: {
  lead: QueueLead;
  event: EmailEvent | undefined;
}) {
  return (
    <article
      className="rounded-xl border p-4 flex flex-col gap-2"
      style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.18)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold" style={{ color: "var(--admin-fg)" }}>
            {lead.business_name}
          </p>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Stage: {String(lead.status || "").replace(/_/g, " ") || "—"}
          </p>
        </div>
        <a
          href={`${buildLeadPath(lead.id, lead.business_name)}?generate=1`}
          className="text-xs font-bold text-[var(--admin-gold)] hover:underline shrink-0"
        >
          Edit / send
        </a>
      </div>
      <div className="text-xs grid gap-1 sm:grid-cols-2" style={{ color: "var(--admin-muted)" }}>
        <div>Message type: {event?.message_type || "—"}</div>
        <div>Send status: {event?.send_status || "—"}</div>
        <div>Scheduled / next: {lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleString() : "—"}</div>
        <div>Last sent: {event?.sent_at ? new Date(event.sent_at).toLocaleString() : "—"}</div>
        <div className="sm:col-span-2 font-medium text-[var(--admin-fg)]">Website: {websiteSummary(lead)}</div>
      </div>
    </article>
  );
}

export default async function AdminOutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (user && !isManualOnlyMode()) {
    await refreshDueFollowUps(supabase, user.id);
  }
  if (!user) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view outreach.
        </p>
      </section>
    );
  }
  const ownerId = String(user.id || "").trim();
  const profile = await getProfile(user.id);
  const showEmailTestPanel = ["owner", "admin", ""].includes(String(profile?.role || ""));

  const validStatuses = new Set(["new", "contacted", "replied", "qualified"]);
  let leadsQuery = supabase
    .from("leads")
    .select(
      "id,business_name,status,next_follow_up_at,last_contacted_at,outreach_sent,follow_up_1_sent,follow_up_2_sent,follow_up_3_sent,automation_paused,last_outreach_sent_at,email,website,has_website"
    )
    .eq("owner_id", ownerId)
    .in("status", ["new", "contacted", "replied", "qualified"])
    .order("next_follow_up_at", { ascending: true, nullsFirst: false })
    .limit(80);
  if (status && validStatuses.has(status)) {
    leadsQuery = leadsQuery.eq("status", status);
  }
  const [{ data: leads }, { data: events }, { data: replyThreadsRaw }] = await Promise.all([
    leadsQuery,
    supabase
      .from("email_events")
      .select("lead_id,message_type,send_status,sent_at,created_at")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("email_threads")
      .select("id,lead_id,status,last_message_at,subject,contact_email")
      .eq("owner_id", ownerId)
      .eq("status", "active")
      .order("last_message_at", { ascending: false })
      .limit(30),
  ]);
  const replyThreads = (replyThreadsRaw || []) as ReplyThreadRow[];

  const queueLeads = (leads || []) as QueueLead[];
  const now = Date.now();
  const bucketMap = new Map<BucketKey, QueueLead[]>();
  for (const k of BUCKET_ORDER) bucketMap.set(k, []);
  for (const lead of queueLeads) {
    const b = outreachBucket(lead, now);
    bucketMap.get(b)?.push(lead);
  }

  const latestEventByLead = new Map<string, EmailEvent>();
  for (const row of (events || []) as EmailEvent[]) {
    const leadId = row.lead_id || "";
    if (!leadId || latestEventByLead.has(leadId)) continue;
    latestEventByLead.set(leadId, row);
  }

  const replyLeadIds = replyThreads
    .map((thread: ReplyThreadRow) => thread.lead_id)
    .filter((id): id is string => Boolean(id));
  const { data: replyLeads } = replyLeadIds.length
    ? await supabase.from("leads").select("id,business_name").eq("owner_id", ownerId).in("id", replyLeadIds)
    : { data: [] as { id: string; business_name: string }[] };
  const replyLeadMap = new Map(
    (replyLeads || []).map((lead: { id: string; business_name: string }) => [lead.id, lead.business_name])
  );

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
          Queue by first touch and follow-up stage. Copy below matches your website-focused follow-ups.
        </p>
      </section>

      <section className="admin-card space-y-3">
        <h2 className="text-sm font-bold" style={{ color: "var(--admin-fg)" }}>
          Default follow-up templates
        </h2>
        <div className="grid gap-3 md:grid-cols-2 text-sm" style={{ color: "var(--admin-muted)" }}>
          <blockquote className="border-l-2 pl-3 italic" style={{ borderColor: "var(--admin-gold)" }}>
            “Hey, just wanted to follow up real quick — were you still interested in getting help with your website? If so,
            I’d be happy to put together a clean and affordable option for your business.”
          </blockquote>
          <blockquote className="border-l-2 pl-3 italic" style={{ borderColor: "var(--admin-gold)" }}>
            “Hey, just checking back in — are you still looking to improve your website or get one set up for your business?
            If that’s still on your radar, I can help with something clean, simple, and affordable.”
          </blockquote>
        </div>
      </section>

      <section className="space-y-8">
        {BUCKET_ORDER.map((key) => {
          const list = bucketMap.get(key) || [];
          if (!list.length) return null;
          return (
            <div key={key}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
                {BUCKET_LABEL[key]}
                <span className="text-sm font-normal ml-2" style={{ color: "var(--admin-muted)" }}>
                  ({list.length})
                </span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((lead) => (
                  <OutreachQueueCard key={lead.id} lead={lead} event={latestEventByLead.get(lead.id)} />
                ))}
              </div>
            </div>
          );
        })}
        {!queueLeads.length && (
          <section className="admin-card admin-empty !py-8">
            <div className="admin-empty-title">
              {status === "contacted" ? "No leads in this filter" : "No outreach queue yet"}
            </div>
            <div className="admin-empty-desc">
              Leads in New, Contacted, Replied, or Qualified appear here. Send from a lead to populate the queue.
            </div>
          </section>
        )}
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3 inline-flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
          <MessageSquareMore className="h-4 w-4" style={{ color: "var(--admin-gold)" }} />
          Active reply threads
        </h2>
        {!replyThreads.length ? (
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">No active threads</div>
            <div className="admin-empty-desc">Inbound replies will show here when matched to leads.</div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {replyThreads.map((thread: ReplyThreadRow) => (
              <article
                key={thread.id}
                className="rounded-xl border p-4 text-sm"
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.15)" }}
              >
                <p className="font-semibold" style={{ color: "var(--admin-fg)" }}>
                  {thread.lead_id
                    ? String(replyLeadMap.get(thread.lead_id) || "Unknown lead")
                    : "Unknown lead"}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  {thread.contact_email || "—"} · {thread.subject || "—"}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
                  Last: {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "—"}
                </p>
                {thread.lead_id ? (
                  <a
                    href={buildLeadPath(thread.lead_id, String(replyLeadMap.get(thread.lead_id) || "Lead"))}
                    className="inline-block mt-2 text-xs font-bold text-[var(--admin-gold)] hover:underline"
                  >
                    Open lead
                  </a>
                ) : null}
              </article>
            ))}
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
            Linked Scout opportunities stay out of duplicate intake while tracked in CRM.
          </p>
        </div>
        <div className="admin-card">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
            Fast actions
          </h2>
          <a href="/admin/leads" className="text-sm font-semibold text-[var(--admin-gold)] hover:underline">
            Open Leads →
          </a>
          <br />
          <a href="/admin/conversations" className="text-sm font-semibold text-[var(--admin-gold)] hover:underline mt-2 inline-block">
            Conversations →
          </a>
        </div>
      </section>

      {showEmailTestPanel && <EmailTestPanel />}
    </div>
  );
}
