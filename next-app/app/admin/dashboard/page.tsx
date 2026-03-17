import { createClient } from "@/lib/supabase/server";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath } from "@/lib/lead-route";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { canonicalLeadBucket } from "@/lib/lead-bucket";

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
  category?: string | null;
  city?: string | null;
  address?: string | null;
  opportunity_score?: number | null;
  lead_bucket?: string | null;
  opportunity_reason?: string | null;
};

type CaseContactRow = {
  id?: string | null;
  opportunity_id?: string | null;
  email?: string | null;
  phone_from_site?: string | null;
  contact_page?: string | null;
  contact_form_url?: string | null;
  facebook_url?: string | null;
  facebook?: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
};

type EmailDraftRow = {
  id: string;
  lead_id?: string | null;
  subject?: string | null;
  body?: string | null;
  created_at?: string | null;
};

type SearchParams = Record<string, string | string[] | undefined>;
type BootstrapIssue = { label: string; message: string };

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

async function runBootstrapTask<T>(
  label: string,
  fn: () => Promise<T>,
  issues: BootstrapIssue[],
  timeoutMs = 12000
): Promise<T | null> {
  console.info(`[Admin Bootstrap] ${label} started`);
  try {
    const result = (await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ])) as T;
    console.info(`[Admin Bootstrap] ${label} success`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : `${label} failed`;
    console.error(`[Admin Bootstrap] ${label} failed`, { message });
    if (issues.length === 0) {
      console.error(`[Admin Bootstrap] first failing request: ${label}`);
    }
    issues.push({ label, message });
    return null;
  }
}

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

export default async function DailyCommandCenterPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  console.info("[Admin Bootstrap] admin bootstrap started");
  const supabase = await createClient();
  const bootstrapIssues: BootstrapIssue[] = [];
  const authResult = await runBootstrapTask(
    "auth.getUser",
    async () => supabase.auth.getUser(),
    bootstrapIssues
  );
  const user = authResult?.data?.user ?? null;
  const ownerId = String(user?.id || "").trim();
  const fromLogin = firstParam(searchParams?.fromLogin) === "1";
  const minimalMode = firstParam(searchParams?.minimal) === "1";

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

  let topLeadResult:
    | {
        data: LeadRow[] | null;
        error: unknown;
      }
    | null = null;
  let allLeadsResult:
    | {
        data: LeadRow[] | null;
        error: unknown;
      }
    | null = null;
  let draftRows: EmailDraftRow[] = [];

  if (!minimalMode) {
    const [topLeadRaw, allLeadsRaw, draftRaw] = await Promise.all([
      runBootstrapTask(
        "leads.top-24h",
        async () =>
          (await supabase
            .from("leads")
            .select(
              "id,business_name,website,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at"
            )
            .eq("owner_id", ownerId)
            .gte("created_at", cutoff24h)
            .order("opportunity_score", { ascending: false, nullsFirst: false })
            .limit(40)) as { data: LeadRow[] | null; error: unknown },
        bootstrapIssues
      ),
      runBootstrapTask(
        "leads.all",
        async () =>
          (await supabase
            .from("leads")
            .select(
              "id,business_name,website,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at"
            )
            .eq("owner_id", ownerId)
            .order("created_at", { ascending: false })
            .limit(3000)) as { data: LeadRow[] | null; error: unknown },
        bootstrapIssues
      ),
      runBootstrapTask("email_messages.drafts", async () => fetchDraftMessages(supabase, ownerId), bootstrapIssues),
    ]);
    topLeadResult = topLeadRaw;
    allLeadsResult = allLeadsRaw;
    draftRows = draftRaw || [];
  }

  const topLeads = ((topLeadResult?.data || []) as unknown[]) as LeadRow[];
  const allLeads = ((allLeadsResult?.data || []) as unknown[]) as LeadRow[];
  const leadById = new Map(allLeads.map((lead) => [String(lead.id), lead]));

  const topLeadOppIds = topLeads
    .map((lead) => String(lead.linked_opportunity_id || "").trim())
    .filter(Boolean);
  const topLeadOppResult =
    topLeadOppIds.length && !minimalMode
      ? await runBootstrapTask(
          "opportunities.top-lead-joins",
          async () =>
            await supabase
              .from("opportunities")
              .select("id,business_name,website,category,city,address,opportunity_score,lead_bucket,opportunity_reason")
              .in("id", topLeadOppIds),
          bootstrapIssues
        )
      : { data: [] as Record<string, unknown>[] };
  const topLeadOppRows = topLeadOppResult?.data || [];
  const topLeadOppById = new Map(
    ((topLeadOppRows || []) as OpportunityRow[]).map((opp) => [String(opp.id), opp])
  );
  const topLeadCaseResult =
    topLeadOppIds.length && !minimalMode
      ? await runBootstrapTask(
          "case_files.top-lead-contact",
          async () =>
            await supabase
              .from("case_files")
              .select(
                "id,opportunity_id,email,phone_from_site,contact_page,contact_form_url,facebook_url,facebook,audit_issues,strongest_problems,created_at"
              )
              .in("opportunity_id", topLeadOppIds)
              .order("created_at", { ascending: false })
              .limit(500),
          bootstrapIssues
        )
      : { data: [] as Record<string, unknown>[] };
  const topLeadCases = ((topLeadCaseResult?.data || []) as unknown[]) as CaseContactRow[];
  const topLeadCaseByOppId = new Map<string, CaseContactRow>();
  for (const row of topLeadCases) {
    const oppId = String(row.opportunity_id || "").trim();
    if (!oppId || topLeadCaseByOppId.has(oppId)) continue;
    topLeadCaseByOppId.set(oppId, row);
  }

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
  const workToday = topLeads
    .map((lead) => {
      const leadId = String(lead.id || "").trim();
      const linkedOppId = String(lead.linked_opportunity_id || "").trim();
      const opp = linkedOppId ? topLeadOppById.get(linkedOppId) : null;
      const caseRow = linkedOppId ? topLeadCaseByOppId.get(linkedOppId) : null;
      const businessName = String(lead.business_name || opp?.business_name || "").trim();
      const reason = String(opp?.opportunity_reason || "").trim();
      const website = String(lead.website || opp?.website || "").trim();
      const issueList = [
        ...(Array.isArray(caseRow?.audit_issues) ? caseRow?.audit_issues || [] : []),
        ...(Array.isArray(caseRow?.strongest_problems) ? caseRow?.strongest_problems || [] : []),
      ]
        .map((v) => String(v || "").trim())
        .filter(Boolean);
      const assessment = buildLeadAssessment({
        website,
        opportunity_score: opp?.opportunity_score ?? lead.opportunity_score ?? null,
        category: opp?.category || null,
        issue_summary: reason,
        issue_list: issueList,
        email: caseRow?.email || null,
        phone: caseRow?.phone_from_site || null,
        contact_page: caseRow?.contact_page || caseRow?.contact_form_url || null,
        facebook_url: caseRow?.facebook_url || caseRow?.facebook || null,
        lead_status: lead.status || null,
      });
      const bestContact = String(assessment.best_contact_method || "").trim();
      const nextAction = String(assessment.recommended_next_action || "").trim();
      const qualified = Boolean(businessName && reason && bestContact && nextAction);
      if (!qualified) return null;
      return {
        id: leadId,
        businessName,
        city: String(opp?.city || "").trim() || "—",
        category: String(opp?.category || "").trim() || "—",
        leadBucket: canonicalLeadBucket(
          String(opp?.lead_bucket || "").trim(),
          opp?.opportunity_score ?? lead.opportunity_score ?? null
        ),
        leadType: assessment.lead_type,
        opportunityScore: Number(opp?.opportunity_score ?? lead.opportunity_score ?? 0),
        opportunityReason: reason,
        bestContactMethod: assessment.best_contact_method || "email",
        bestPitchAngle: assessment.best_pitch_angle,
        recommendedNextAction: assessment.recommended_next_action,
        whyThisLeadIsHere: assessment.why_this_lead_is_here,
        leadPath: buildLeadPath(leadId, businessName),
        casePath: String(caseRow?.id || "").trim()
          ? `/admin/cases/${encodeURIComponent(String(caseRow?.id || ""))}`
          : null,
        website,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 8);

  const emailsReady = draftRows
    .filter((row) => String(row.lead_id || "").trim())
    .slice(0, 12);
  const repliesWaiting = allLeads
    .filter((lead) => String(lead.status || "").toLowerCase() === "replied")
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
      {(fromLogin || bootstrapIssues.length > 0 || minimalMode) && (
        <section
          className="admin-card"
          style={{
            borderColor: "rgba(251, 191, 36, 0.45)",
            background: "rgba(146, 64, 14, 0.18)",
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "#fde68a" }}>
            {minimalMode
              ? "Minimal admin mode"
              : bootstrapIssues.length > 0
                ? "Signed in, but admin data failed to load"
                : "Signed in successfully"}
          </h2>
          <p className="text-sm mt-1" style={{ color: "#fde68a" }}>
            {minimalMode
              ? "Loaded with reduced bootstrap to keep admin available while background services recover."
              : bootstrapIssues.length > 0
                ? "Core shell loaded. Some dashboard data requests failed, but admin remains usable."
                : "Session handoff succeeded and admin shell loaded."}
          </p>
          {bootstrapIssues.length > 0 && (
            <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
              First failing request: {bootstrapIssues[0].label} - {bootstrapIssues[0].message}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/admin" className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center">
              Retry Admin Bootstrap
            </a>
            <a href="/admin/minimal?minimal=1&fromLogin=1" className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center">
              Continue Minimal Admin Mode
            </a>
          </div>
        </section>
      )}

      <section className="admin-card">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
          Daily Command Center
        </h1>
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3">Work Today</h2>
        {workToday.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            No actionable leads yet. Run Scout or backfill leads, then review Easy Wins.
          </p>
        ) : (
          <div className="space-y-3">
            {workToday.map((item) => (
              <div key={item.id} className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.businessName}</p>
                  <LeadBucketBadge bucket={item.leadBucket} score={item.opportunityScore} />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  {item.city} · {item.category} · {item.leadType} · Score {item.opportunityScore}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  <span className="font-semibold">Why this lead is here:</span> {item.whyThisLeadIsHere}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  <span className="font-semibold">Opportunity reason:</span> {item.opportunityReason}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  <span className="font-semibold">Best contact:</span> {item.bestContactMethod}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  <span className="font-semibold">What to say:</span> {item.bestPitchAngle}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  <span className="font-semibold">What to do next:</span> {item.recommendedNextAction}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={item.leadPath} className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center">
                    Open Lead
                  </a>
                  {item.website ? (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                    >
                      Open Website
                    </a>
                  ) : (
                    <span className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center opacity-60">
                      No website found
                    </span>
                  )}
                  {item.casePath ? (
                    <a href={item.casePath} className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center">
                      Open Case
                    </a>
                  ) : (
                    <span className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center opacity-60">
                      No case yet
                    </span>
                  )}
                  <a href={`${item.leadPath}?generate=1`} className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center">
                    Generate Email
                  </a>
                  <a href={`${item.leadPath}?compose=1`} className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center">
                    Send Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Easy Win</h2>
          <div className="space-y-3">
            {topLeads.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                No Easy Win leads in last 24h.
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
                const casePath = String(
                  topLeadCaseByOppId.get(String(lead.linked_opportunity_id || ""))?.id || ""
                ).trim();
                const leadBucket = String(
                  topLeadOppById.get(String(lead.linked_opportunity_id || ""))?.lead_bucket || ""
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
                      <LeadBucketBadge bucket={leadBucket} score={Number(lead.opportunity_score ?? 0)} />{" "}
                      {opportunityReason || "Contact info is hard to find"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={buildLeadPath(String(lead.id || ""), businessName)}
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
                      ) : (
                        <span className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center opacity-60">
                          No website found
                        </span>
                      )}
                      {casePath ? (
                        <a
                          href={`/admin/cases/${encodeURIComponent(casePath)}`}
                          className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                        >
                          Open Case
                        </a>
                      ) : (
                        <span className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center opacity-60">
                          No case yet
                        </span>
                      )}
                      <a
                        href={`${buildLeadPath(String(lead.id || ""), businessName)}?generate=1`}
                        className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                      >
                        Generate Email
                      </a>
                      <a
                        href={`${buildLeadPath(String(lead.id || ""), businessName)}?compose=1`}
                        className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                      >
                        Send Email
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
                        href={`${buildLeadPath(leadId, String(lead?.business_name || "Lead"))}?compose=1`}
                        className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                      >
                        Preview
                      </a>
                      <a
                        href={`${buildLeadPath(leadId, String(lead?.business_name || "Lead"))}?compose=1`}
                        className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                      >
                        Edit
                      </a>
                      <a
                        href={`${buildLeadPath(leadId, String(lead?.business_name || "Lead"))}?compose=1`}
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
          <h2 className="text-lg font-semibold mb-3">Replies Waiting</h2>
          <div className="space-y-3">
            {repliesWaiting.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                No unread replies.
              </p>
            ) : (
              repliesWaiting.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{String(lead.business_name || "Lead")}</p>
                    <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      replied
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={buildLeadPath(String(lead.id || ""), String(lead.business_name || "Lead"))}
                      className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center"
                    >
                      Reply
                    </a>
                  </div>
                </div>
              ))
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
                      href={`${buildLeadPath(String(lead.id || ""), String(lead.business_name || "Lead"))}?compose=1`}
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
