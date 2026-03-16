import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type OpportunityRow = {
  id: string;
  workspace_id?: string | null;
  business_name?: string | null;
  category?: string | null;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  opportunity_score?: number | null;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
};

type LeadRow = {
  id: string;
  business_name?: string | null;
  linked_opportunity_id?: string | null;
  workspace_id?: string | null;
  status?: string | null;
  sequence_step?: number | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  opportunity_score?: number | null;
  created_at?: string | null;
  estimated_value?: number | null;
};

type EmailMessageRow = {
  id: string;
  lead_id?: string | null;
  direction?: string | null;
  body?: string | null;
  sent_at?: string | null;
  received_at?: string | null;
  created_at?: string | null;
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function monthKey(value: string | null | undefined): string {
  if (!value) return "Unknown";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
}

async function createLeadFromOpportunity(formData: FormData) {
  "use server";
  const opportunityId = String(formData.get("opportunity_id") || "").trim();
  if (!opportunityId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return;

  const { data: existingRows } = await supabase
    .from("leads")
    .select("id")
    .eq("owner_id", user.id)
    .eq("linked_opportunity_id", opportunityId)
    .limit(1);
  if ((existingRows || []).length > 0) {
    revalidatePath("/admin/dashboard");
    return;
  }

  const { data: opportunityRows } = await supabase
    .from("opportunities")
    .select(
      "id,workspace_id,business_name,category,website,address,phone,opportunity_score,opportunity_reason,opportunity_signals"
    )
    .eq("id", opportunityId)
    .limit(1);
  const opp = (opportunityRows || [])[0] as OpportunityRow | undefined;
  if (!opp?.id) return;

  const topIssue =
    String(opp.opportunity_reason || "").trim() ||
    (Array.isArray(opp.opportunity_signals) ? String(opp.opportunity_signals[0] || "").trim() : "") ||
    "Website issue detected";

  await supabase.from("leads").insert({
    owner_id: user.id,
    workspace_id: opp.workspace_id || null,
    linked_opportunity_id: opp.id,
    business_name: String(opp.business_name || "Unknown business"),
    contact_name: null,
    email: null,
    phone: opp.phone || null,
    website: opp.website || null,
    address: opp.address || null,
    industry: opp.category || null,
    lead_source: "scout-brain",
    opportunity_score: opp.opportunity_score ?? null,
    status: "new",
    notes: `Created from dashboard command center. Top issue: ${topIssue}`,
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
}

export default async function ScoutCrmCommandCenterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "#fca5a5" }}>
          You must be logged in to view the command center dashboard.
        </p>
      </section>
    );
  }

  const [
    { data: opportunityRowsRaw },
    { data: leadsRaw },
    { data: outreachLeadsRaw },
    { data: repliedLeadsRaw },
    winsWithEstimated,
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select(
        "id,workspace_id,business_name,category,website,address,phone,opportunity_score,opportunity_reason,opportunity_signals"
      )
      .order("opportunity_score", { ascending: false })
      .limit(400),
    supabase.from("leads").select("id,linked_opportunity_id").eq("owner_id", ownerId).limit(2000),
    supabase
      .from("leads")
      .select("id,business_name,status,sequence_step,last_contacted_at,next_follow_up_at")
      .eq("owner_id", ownerId)
      .in("status", ["contacted", "follow_up_due"])
      .order("next_follow_up_at", { ascending: true, nullsFirst: false })
      .limit(250),
    supabase
      .from("leads")
      .select("id,business_name,status")
      .eq("owner_id", ownerId)
      .eq("status", "replied")
      .order("created_at", { ascending: false })
      .limit(250),
    supabase
      .from("leads")
      .select("id,created_at,estimated_value,opportunity_score")
      .eq("owner_id", ownerId)
      .eq("status", "closed_won")
      .limit(2000),
  ]);

  const opportunityRows = (opportunityRowsRaw || []) as OpportunityRow[];
  const linkedLeadRows = (leadsRaw || []) as Array<{ id: string; linked_opportunity_id?: string | null }>;
  const linkedOppIds = new Set(
    linkedLeadRows.map((row) => String(row.linked_opportunity_id || "").trim()).filter(Boolean)
  );
  const newOpportunities = opportunityRows
    .filter((opp) => !linkedOppIds.has(String(opp.id || "").trim()))
    .map((opp) => ({
      ...opp,
      top_issue:
        String(opp.opportunity_reason || "").trim() ||
        (Array.isArray(opp.opportunity_signals) ? String(opp.opportunity_signals[0] || "").trim() : "") ||
        "Website issue detected",
    }))
    .slice(0, 50);

  const outreachLeads = (outreachLeadsRaw || []) as LeadRow[];
  const repliedLeads = (repliedLeadsRaw || []) as LeadRow[];

  const outreachLeadIds = outreachLeads.map((l) => l.id).filter(Boolean);
  const repliedLeadIds = repliedLeads.map((l) => l.id).filter(Boolean);

  const [{ data: outreachMsgsRaw }, { data: replyMsgsRaw }] = await Promise.all([
    outreachLeadIds.length
      ? supabase
          .from("email_messages")
          .select("id,lead_id,direction,sent_at,created_at")
          .in("lead_id", outreachLeadIds)
          .eq("direction", "outbound")
          .order("sent_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(2000)
      : ({ data: [] } as { data: Record<string, unknown>[] }),
    repliedLeadIds.length
      ? supabase
          .from("email_messages")
          .select("id,lead_id,direction,body,received_at,created_at")
          .in("lead_id", repliedLeadIds)
          .eq("direction", "inbound")
          .order("received_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(2000)
      : ({ data: [] } as { data: Record<string, unknown>[] }),
  ]);

  const outreachMsgs = (outreachMsgsRaw || []) as EmailMessageRow[];
  const replyMsgs = (replyMsgsRaw || []) as EmailMessageRow[];

  const lastOutboundByLead = new Map<string, string>();
  for (const msg of outreachMsgs) {
    const leadId = String(msg.lead_id || "").trim();
    if (!leadId || lastOutboundByLead.has(leadId)) continue;
    lastOutboundByLead.set(leadId, String(msg.sent_at || msg.created_at || ""));
  }

  const latestInboundByLead = new Map<string, EmailMessageRow>();
  for (const msg of replyMsgs) {
    const leadId = String(msg.lead_id || "").trim();
    if (!leadId || latestInboundByLead.has(leadId)) continue;
    latestInboundByLead.set(leadId, msg);
  }

  let winsRaw = (winsWithEstimated.data || []) as LeadRow[];
  if (winsWithEstimated.error) {
    const { data: winsFallback } = await supabase
      .from("leads")
      .select("id,created_at,opportunity_score")
      .eq("owner_id", ownerId)
      .eq("status", "closed_won")
      .limit(2000);
    winsRaw = (winsFallback || []) as LeadRow[];
  }
  const wins = winsRaw.map((row) => {
    const explicitValue = Number((row as { estimated_value?: number | null }).estimated_value ?? NaN);
    const scoreValue = Number(row.opportunity_score ?? 0);
    const estimatedValue = Number.isFinite(explicitValue) ? explicitValue : Math.max(0, scoreValue) * 50;
    return {
      id: row.id,
      created_at: row.created_at || null,
      estimated_value: estimatedValue,
    };
  });
  const totalEstimatedValue = wins.reduce((sum, w) => sum + Number(w.estimated_value || 0), 0);
  const monthlyTotalsMap = new Map<string, number>();
  for (const win of wins) {
    const key = monthKey(win.created_at);
    monthlyTotalsMap.set(key, Number(monthlyTotalsMap.get(key) || 0) + Number(win.estimated_value || 0));
  }
  const monthlyTotals = Array.from(monthlyTotalsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .reverse();

  const cards = [
    { label: "New Opportunities", value: newOpportunities.length },
    { label: "Leads In Outreach", value: outreachLeads.length },
    { label: "Replies", value: repliedLeads.length },
    { label: "Wins", value: wins.length },
  ];

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--admin-fg)" }}>
          Scout CRM Command Center
        </h1>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Daily control panel for the Scout pipeline: opportunities, outreach, replies, and wins.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="admin-card">
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              {card.label}
            </p>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--admin-fg)" }}>
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
          New Opportunities
        </h2>
        <div className="admin-table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>Website</th>
                <th>Score</th>
                <th>Top Issue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    No unmatched opportunities found.
                  </td>
                </tr>
              ) : (
                newOpportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td>{String(opp.business_name || "Unknown business")}</td>
                    <td>{String(opp.category || "—")}</td>
                    <td>
                      {opp.website ? (
                        <a href={opp.website} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{Number(opp.opportunity_score ?? 0)}</td>
                    <td>{opp.top_issue}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <form action={createLeadFromOpportunity}>
                          <input type="hidden" name="opportunity_id" value={opp.id} />
                          <button type="submit" className="admin-btn-primary text-xs h-8 px-3">
                            Create Lead
                          </button>
                        </form>
                        <a
                          href="/admin/cases"
                          className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                        >
                          Open Case
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
          Leads In Outreach
        </h2>
        <div className="admin-table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Sequence Step</th>
                <th>Last Contacted</th>
                <th>Last Email Sent</th>
                <th>Next Follow Up</th>
              </tr>
            </thead>
            <tbody>
              {outreachLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    No outreach leads currently in contacted/follow_up_due.
                  </td>
                </tr>
              ) : (
                outreachLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{String(lead.business_name || "Unknown business")}</td>
                    <td>{Math.max(1, Number(lead.sequence_step ?? 1))}</td>
                    <td>{formatDateTime(lead.last_contacted_at)}</td>
                    <td>{formatDateTime(lastOutboundByLead.get(lead.id))}</td>
                    <td>{formatDateTime(lead.next_follow_up_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="admin-card"
        style={{
          borderColor: "rgba(74, 222, 128, 0.45)",
          boxShadow: "0 0 0 1px rgba(74, 222, 128, 0.2), 0 16px 30px rgba(2, 6, 23, 0.22)",
          background: "linear-gradient(165deg, rgba(11, 35, 24, 0.95), rgba(8, 25, 18, 0.95))",
        }}
      >
        <h2 className="text-lg font-semibold mb-3" style={{ color: "#86efac" }}>
          Replies
        </h2>
        <div className="admin-table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Latest Email Message</th>
                <th>Reply Time</th>
              </tr>
            </thead>
            <tbody>
              {repliedLeads.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    No replies yet.
                  </td>
                </tr>
              ) : (
                repliedLeads.map((lead) => {
                  const msg = latestInboundByLead.get(lead.id);
                  const snippet = String(msg?.body || "").trim().slice(0, 160);
                  return (
                    <tr key={lead.id}>
                      <td>{String(lead.business_name || "Unknown business")}</td>
                      <td>{snippet || "Reply received"}</td>
                      <td>{formatDateTime(msg?.received_at || msg?.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
          Wins
        </h2>
        <div className="grid gap-3 md:grid-cols-3 mb-4">
          <article className="rounded-lg border px-4 py-3" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Count
            </p>
            <p className="text-xl font-semibold mt-1">{wins.length}</p>
          </article>
          <article className="rounded-lg border px-4 py-3" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Estimated Value
            </p>
            <p className="text-xl font-semibold mt-1">{currency(totalEstimatedValue)}</p>
          </article>
          <article className="rounded-lg border px-4 py-3" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Monthly Totals
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
              Last {Math.max(1, monthlyTotals.length)} months
            </p>
          </article>
        </div>
        <div className="admin-table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    No closed wins yet.
                  </td>
                </tr>
              ) : (
                monthlyTotals.map(([month, total]) => (
                  <tr key={month}>
                    <td>{month}</td>
                    <td>{currency(total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
