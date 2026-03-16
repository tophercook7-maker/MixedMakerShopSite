import { createClient } from "@/lib/supabase/server";

type LeadRow = {
  id: string;
  business_name?: string | null;
  website?: string | null;
  linked_opportunity_id?: string | null;
  opportunity_score?: number | null;
  status?: string | null;
  created_at?: string | null;
  follow_up_date?: string | null;
  next_follow_up_at?: string | null;
};

type OpportunityRow = {
  id: string;
  business_name?: string | null;
  website?: string | null;
  opportunity_reason?: string | null;
};

type EmailDraftRow = {
  id: string;
  lead_id?: string | null;
  subject?: string | null;
  body?: string | null;
  created_at?: string | null;
};

function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function dueAt(lead: LeadRow): Date | null {
  const raw = String(lead.next_follow_up_at || lead.follow_up_date || "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

async function fetchDraftMessages(supabase: Awaited<ReturnType<typeof createClient>>, ownerId: string) {
  const queryOptions = [
    "id,lead_id,subject,body,created_at,status,direction",
    "id,lead_id,subject,body,created_at,direction",
    "id,lead_id,subject,body,created_at",
  ];
  for (const select of queryOptions) {
    try {
      let q = supabase.from("email_messages").select(select).eq("owner_id", ownerId);
      if (select.includes("direction")) q = q.eq("direction", "outbound");
      if (select.includes("status")) q = q.eq("status", "draft");
      const res = await q.order("created_at", { ascending: false }).limit(300);
      if (!res.error) return ((res.data || []) as unknown[]) as EmailDraftRow[];
    } catch {
      // try fallback select
    }
  }
  return [] as EmailDraftRow[];
}

export default async function DailyCommandCenterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();

  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view the daily command center.
        </p>
      </section>
    );
  }

  const now = new Date();
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [topLeadResult, allLeadsResult, draftRows] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id,business_name,website,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at"
      )
      .eq("owner_id", ownerId)
      .gte("created_at", cutoff24h)
      .order("opportunity_score", { ascending: false, nullsFirst: false })
      .limit(40),
    supabase
      .from("leads")
      .select(
        "id,business_name,website,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at"
      )
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(3000),
    fetchDraftMessages(supabase, ownerId),
  ]);

  const topLeads = (topLeadResult.data || []) as LeadRow[];
  const allLeads = (allLeadsResult.data || []) as LeadRow[];
  const leadById = new Map(allLeads.map((lead) => [String(lead.id), lead]));

  const topLeadOppIds = topLeads
    .map((lead) => String(lead.linked_opportunity_id || "").trim())
    .filter(Boolean);
  const { data: topLeadOppRows } = topLeadOppIds.length
    ? await supabase.from("opportunities").select("id,business_name,website,opportunity_reason").in("id", topLeadOppIds)
    : { data: [] as Record<string, unknown>[] };
  const topLeadOppById = new Map(
    ((topLeadOppRows || []) as OpportunityRow[]).map((opp) => [String(opp.id), opp])
  );

  const followUpsDue = allLeads
    .filter((lead) => {
      const due = dueAt(lead);
      if (!due) return false;
      const status = String(lead.status || "").toLowerCase();
      if (["closed_won", "closed_lost", "closed", "do_not_contact"].includes(status)) return false;
      return due.getTime() <= now.getTime();
    })
    .sort((a, b) => {
      const ad = dueAt(a)?.getTime() || 0;
      const bd = dueAt(b)?.getTime() || 0;
      return ad - bd;
    })
    .slice(0, 12);

  const emailsReady = draftRows
    .filter((row) => String(row.lead_id || "").trim())
    .slice(0, 12);

  const snapshot = {
    new: 0,
    contacted: 0,
    interested: 0,
    proposal_sent: 0,
    closed: 0,
  };
  for (const lead of allLeads) {
    const status = String(lead.status || "").trim().toLowerCase();
    if (status === "new") snapshot.new += 1;
    else if (status === "contacted" || status === "follow_up_due" || status === "replied") snapshot.contacted += 1;
    else if (status === "interested") snapshot.interested += 1;
    else if (status === "proposal_sent") snapshot.proposal_sent += 1;
    else if (status === "closed" || status === "closed_won" || status === "closed_lost") snapshot.closed += 1;
  }

  return (
    <div className="space-y-4">
      <section className="admin-card">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
          Daily Command Center
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Today’s Top Leads</h2>
          <div className="space-y-3">
            {topLeads.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                No top leads in last 24h.
              </p>
            ) : (
              topLeads.slice(0, 12).map((lead) => {
                const website =
                  String(lead.website || "").trim() ||
                  String(topLeadOppById.get(String(lead.linked_opportunity_id || ""))?.website || "").trim();
                const businessName =
                  String(lead.business_name || "").trim() ||
                  String(topLeadOppById.get(String(lead.linked_opportunity_id || ""))?.business_name || "").trim() ||
                  "Lead";
                const opportunityReason = String(
                  topLeadOppById.get(String(lead.linked_opportunity_id || ""))?.opportunity_reason || ""
                ).trim();
                return (
                  <div
                    key={lead.id}
                    className="rounded-lg border px-3 py-2"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{businessName}</p>
                      <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                        Score {Number(lead.opportunity_score ?? 0)}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                      {opportunityReason || "Website improvement opportunity"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`/admin/leads/${encodeURIComponent(String(lead.id))}`}
                        className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center"
                      >
                        Open Lead
                      </a>
                      {website ? (
                        <a
                          href={website}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                        >
                          Open Website
                        </a>
                      ) : null}
                      <a
                        href={`/admin/leads/${encodeURIComponent(String(lead.id))}?generate=1`}
                        className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                      >
                        Generate Email
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Emails Ready To Send</h2>
          <div className="space-y-3">
            {emailsReady.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                No draft outreach emails.
              </p>
            ) : (
              emailsReady.map((draft) => {
                const leadId = String(draft.lead_id || "");
                const lead = leadById.get(leadId);
                return (
                  <div
                    key={draft.id}
                    className="rounded-lg border px-3 py-2"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{String(lead?.business_name || "Lead")}</p>
                      <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                        {fmtDate(draft.created_at)}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                      {String(draft.subject || "Draft outreach")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`/admin/leads/${encodeURIComponent(leadId)}?compose=1`}
                        className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                      >
                        Preview
                      </a>
                      <a
                        href={`/admin/leads/${encodeURIComponent(leadId)}?compose=1`}
                        className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                      >
                        Edit
                      </a>
                      <a
                        href={`/admin/leads/${encodeURIComponent(leadId)}?compose=1`}
                        className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center"
                      >
                        Send
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Follow Ups Due</h2>
          <div className="space-y-3">
            {followUpsDue.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                No follow ups due.
              </p>
            ) : (
              followUpsDue.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{String(lead.business_name || "Unknown business")}</p>
                    <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      {fmtDate((dueAt(lead) || null)?.toISOString() || null)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={`/admin/leads/${encodeURIComponent(String(lead.id))}?compose=1`}
                      className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center"
                    >
                      Send Follow Up
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Pipeline Snapshot</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>new</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.new}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>contacted</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.contacted}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>interested</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.interested}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>proposal_sent</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.proposal_sent}</p>
            </div>
            <div className="rounded-lg border px-3 py-3 col-span-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>closed</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.closed}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
