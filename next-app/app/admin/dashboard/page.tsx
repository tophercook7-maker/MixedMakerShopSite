import { createClient } from "@/lib/supabase/server";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath } from "@/lib/lead-route";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { getLeadPriorityBadges, leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";

type LeadRow = {
  id: string;
  business_name?: string | null;
  email?: string | null;
  website?: string | null;
  linked_opportunity_id?: string | null;
  opportunity_score?: number | null;
  status?: string | null;
  created_at?: string | null;
  follow_up_date?: string | null;
  next_follow_up_at?: string | null;
  is_hot_lead?: boolean | null;
  last_reply_at?: string | null;
  last_reply_preview?: string | null;
  recommended_next_action?: string | null;
  deal_status?: string | null;
  deal_value?: number | null;
  closed_at?: string | null;
  outreach_sent_at?: string | null;
  industry?: string | null;
  best_contact_method?: string | null;
  is_recurring_client?: boolean | null;
  monthly_value?: number | null;
  subscription_started_at?: string | null;
  referred_by?: string | null;
  referral_source?: string | null;
  is_referred_client?: boolean | null;
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
  email_source?: string | null;
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

type ReplyMessageRow = {
  id: string;
  lead_id?: string | null;
  recipient_email?: string | null;
  body?: string | null;
  received_at?: string | null;
  created_at?: string | null;
};

type FollowUpSentRow = {
  id: string;
  lead_id?: string | null;
  sent_at?: string | null;
  message_kind?: string | null;
};

type CalendarTodayRow = {
  id: string;
  title?: string | null;
  event_type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  lead_id?: string | null;
};

type SearchParams = Record<string, string | string[] | undefined>;
type BootstrapIssue = { label: string; message: string };

function missingOpportunityReasonColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_reason") || text.includes("column opportunity_reason");
}

function missingIsHotLeadColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("leads.is_hot_lead") || text.includes("column is_hot_lead");
}

function missingDealColumns(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("leads.deal_status") ||
    text.includes("leads.deal_value") ||
    text.includes("leads.closed_at") ||
    text.includes("column deal_status") ||
    text.includes("column deal_value") ||
    text.includes("column closed_at")
  );
}

function missingTrackingColumns(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("column outreach_sent_at") ||
    text.includes("column best_contact_method") ||
    text.includes("column industry") ||
    text.includes("column is_recurring_client") ||
    text.includes("column monthly_value") ||
    text.includes("column subscription_started_at") ||
    text.includes("column referred_by") ||
    text.includes("column referral_source") ||
    text.includes("column is_referred_client")
  );
}

function missingReplyDetectionColumns(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("leads.last_reply_at") ||
    text.includes("leads.last_reply_preview") ||
    text.includes("column last_reply_at") ||
    text.includes("column last_reply_preview")
  );
}

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

function calendarTypeColor(type: string | null | undefined): string {
  const t = String(type || "").toLowerCase();
  if (t === "appointment") return "#ef4444";
  if (t === "client_call") return "#3b82f6";
  if (t === "personal") return "#7c3aed";
  if (t === "followup") return "#f97316";
  if (t === "task") return "#eab308";
  if (t === "scout") return "#22c55e";
  if (t === "busy_block") return "#374151";
  if (t === "reminder") return "#14b8a6";
  return "#60a5fa";
}

function estimateBeginnerDealValue(lead: LeadRow): number {
  const score = Number(lead.opportunity_score || 0);
  // Beginner-friendly pricing: basic $150-$300, standard $300-$500.
  return score >= 75 ? 400 : 225;
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
  let replyMessageRows: ReplyMessageRow[] = [];
  let followUpSentRows: FollowUpSentRow[] = [];
  let calendarTodayRows: CalendarTodayRow[] = [];

  if (!minimalMode) {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const [topLeadRaw, allLeadsRaw, draftRaw, repliesRaw, followUpsRaw, calendarTodayRaw] = await Promise.all([
      runBootstrapTask(
        "leads.top-24h",
        async () => {
          let res = (await supabase
            .from("leads")
            .select(
              "id,business_name,website,email,industry,best_contact_method,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at,is_hot_lead,last_reply_at,last_reply_preview,recommended_next_action,deal_status,deal_value,closed_at,outreach_sent_at,is_recurring_client,monthly_value,subscription_started_at,referred_by,referral_source,is_referred_client"
            )
            .eq("owner_id", ownerId)
            .gte("created_at", cutoff24h)
            .order("opportunity_score", { ascending: false, nullsFirst: false })
            .limit(40)) as { data: LeadRow[] | null; error: { message?: string } | null };
          if (
            res.error?.message &&
            (missingIsHotLeadColumn(res.error.message) ||
              missingDealColumns(res.error.message) ||
              missingTrackingColumns(res.error.message) ||
              missingReplyDetectionColumns(res.error.message))
          ) {
            res = (await supabase
              .from("leads")
              .select(
                "id,business_name,website,email,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at,recommended_next_action"
              )
              .eq("owner_id", ownerId)
              .gte("created_at", cutoff24h)
              .order("opportunity_score", { ascending: false, nullsFirst: false })
              .limit(40)) as { data: LeadRow[] | null; error: { message?: string } | null };
          }
          return res as { data: LeadRow[] | null; error: unknown };
        },
        bootstrapIssues
      ),
      runBootstrapTask(
        "leads.all",
        async () => {
          let res = (await supabase
            .from("leads")
            .select(
              "id,business_name,website,email,industry,best_contact_method,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at,is_hot_lead,last_reply_at,last_reply_preview,recommended_next_action,deal_status,deal_value,closed_at,outreach_sent_at,is_recurring_client,monthly_value,subscription_started_at,referred_by,referral_source,is_referred_client"
            )
            .eq("owner_id", ownerId)
            .order("created_at", { ascending: false })
            .limit(3000)) as { data: LeadRow[] | null; error: { message?: string } | null };
          if (
            res.error?.message &&
            (missingIsHotLeadColumn(res.error.message) ||
              missingDealColumns(res.error.message) ||
              missingTrackingColumns(res.error.message) ||
              missingReplyDetectionColumns(res.error.message))
          ) {
            res = (await supabase
              .from("leads")
              .select(
                "id,business_name,website,email,linked_opportunity_id,opportunity_score,status,created_at,follow_up_date,next_follow_up_at,recommended_next_action"
              )
              .eq("owner_id", ownerId)
              .order("created_at", { ascending: false })
              .limit(3000)) as { data: LeadRow[] | null; error: { message?: string } | null };
          }
          return res as { data: LeadRow[] | null; error: unknown };
        },
        bootstrapIssues
      ),
      runBootstrapTask("email_messages.drafts", async () => fetchDraftMessages(supabase, ownerId), bootstrapIssues),
      runBootstrapTask(
        "email_messages.replies",
        async () =>
          (await supabase
            .from("email_messages")
            .select("id,lead_id,recipient_email,body,received_at,created_at,direction")
            .eq("owner_id", ownerId)
            .eq("direction", "inbound")
            .order("received_at", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false })
            .limit(500)) as { data: ReplyMessageRow[] | null; error: unknown },
        bootstrapIssues
      ),
      runBootstrapTask(
        "email_messages.followups",
        async () =>
          (await supabase
            .from("email_messages")
            .select("id,lead_id,sent_at,message_kind,direction")
            .eq("owner_id", ownerId)
            .eq("direction", "outbound")
            .like("message_kind", "follow_up_%")
            .order("sent_at", { ascending: false, nullsFirst: false })
            .limit(2000)) as { data: FollowUpSentRow[] | null; error: unknown },
        bootstrapIssues
      ),
      runBootstrapTask(
        "calendar.today",
        async () =>
          (await supabase
            .from("calendar_events")
            .select("id,title,event_type,start_time,end_time,lead_id")
            .eq("owner_id", ownerId)
            .gte("start_time", startOfDay)
            .lt("start_time", endOfDay)
            .order("start_time", { ascending: true })
            .limit(200)) as { data: CalendarTodayRow[] | null; error: unknown },
        bootstrapIssues
      ),
    ]);
    topLeadResult = topLeadRaw;
    allLeadsResult = allLeadsRaw;
    draftRows = draftRaw || [];
    replyMessageRows = (((repliesRaw as { data?: ReplyMessageRow[] | null })?.data || []) as ReplyMessageRow[]);
    followUpSentRows = (((followUpsRaw as { data?: FollowUpSentRow[] | null })?.data || []) as FollowUpSentRow[]);
    calendarTodayRows = (((calendarTodayRaw as { data?: CalendarTodayRow[] | null })?.data || []) as CalendarTodayRow[]);
  }

  const topLeads = ((topLeadResult?.data || []) as unknown[]) as LeadRow[];
  const topLeadsEmailReady = topLeads.filter((lead) => Boolean(String(lead.email || "").trim()));
  const allLeads = ((allLeadsResult?.data || []) as unknown[]) as LeadRow[];
  const leadById = new Map(allLeads.map((lead) => [String(lead.id), lead]));
  const latestReplyByLeadId = new Map<string, ReplyMessageRow>();
  for (const row of replyMessageRows || []) {
    const leadId = String(row.lead_id || "").trim();
    if (!leadId || latestReplyByLeadId.has(leadId)) continue;
    latestReplyByLeadId.set(leadId, row);
  }

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
  let topLeadOppRows = topLeadOppResult?.data || [];
  if (topLeadOppIds.length && (!topLeadOppRows || topLeadOppRows.length === 0)) {
    const columnError = bootstrapIssues.find(
      (issue) =>
        issue.label === "opportunities.top-lead-joins" &&
        missingOpportunityReasonColumn(issue.message)
    );
    if (columnError) {
      const fallbackOppResult = await runBootstrapTask(
        "opportunities.top-lead-joins.no-opportunity-reason",
        async () =>
          await supabase
            .from("opportunities")
            .select("id,business_name,website,category,city,address,opportunity_score,lead_bucket")
            .in("id", topLeadOppIds),
        bootstrapIssues
      );
      topLeadOppRows = (((fallbackOppResult?.data || []) as OpportunityRow[]) || []).map((row) => ({
        ...row,
        opportunity_reason: null,
      }));
    }
  }
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
                "id,opportunity_id,email,email_source,phone_from_site,contact_page,contact_form_url,facebook_url,facebook,audit_issues,strongest_problems,created_at"
              )
              .in("opportunity_id", topLeadOppIds)
              .order("created_at", { ascending: false })
              .limit(500),
          bootstrapIssues
        )
      : { data: [] as Record<string, unknown>[] };
  let topLeadCases = ((topLeadCaseResult?.data || []) as unknown[]) as CaseContactRow[];
  const caseEmailSourceError = bootstrapIssues.find(
    (issue) =>
      issue.label === "case_files.top-lead-contact" &&
      issue.message.toLowerCase().includes("email_source")
  );
  if (caseEmailSourceError && topLeadOppIds.length && !minimalMode) {
    const fallbackCaseResult = await runBootstrapTask(
      "case_files.top-lead-contact.no-email-source",
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
    );
    topLeadCases = ((fallbackCaseResult?.data || []) as unknown[]) as CaseContactRow[];
  }
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
      const email = String(lead.email || caseRow?.email || "").trim();
      const contactAvailable = Boolean(
        String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim() ||
          String(caseRow?.facebook_url || caseRow?.facebook || "").trim()
      );
      const signalEmailSource =
        issueList
          .find((signal) => signal.toLowerCase().startsWith("email_source:"))
          ?.split(":")[1]
          ?.trim() || "";
      const emailSource = email ? String(caseRow?.email_source || signalEmailSource || "unknown").trim() : null;
      const qualified = Boolean(
        businessName && reason && (email || contactAvailable) && nextAction
      );
      if (!qualified) return null;
      const tierRank = email ? 1 : 2;
      const bestContactMethod = email
        ? assessment.best_contact_method || "email"
        : String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim()
            ? "contact_page"
            : String(caseRow?.facebook_url || caseRow?.facebook || "").trim()
              ? "facebook"
              : bestContact || "none";
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
        email,
        emailSource,
        bestContactMethod,
        bestPitchAngle: assessment.best_pitch_angle,
        recommendedNextAction: assessment.recommended_next_action,
        whyThisLeadIsHere: assessment.why_this_lead_is_here,
        leadPath: buildLeadPath(leadId, businessName),
        tierRank,
        casePath: String(caseRow?.id || "").trim()
          ? `/admin/cases/${encodeURIComponent(String(caseRow?.id || ""))}`
          : null,
        website,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (a.tierRank !== b.tierRank) return a.tierRank - b.tierRank;
      return Number(b.opportunityScore || 0) - Number(a.opportunityScore || 0);
    })
    .slice(0, 8);

  const emailsReady = draftRows
    .filter((row) => String(row.lead_id || "").trim())
    .slice(0, 12);
  const repliesWaiting = allLeads
    .filter((lead) => {
      const status = String(lead.status || "").toLowerCase();
      return status === "replied" || Boolean(lead.is_hot_lead);
    })
    .sort((a, b) => {
      const aTs = new Date(
        String(
          a.last_reply_at ||
            latestReplyByLeadId.get(String(a.id || ""))?.received_at ||
            latestReplyByLeadId.get(String(a.id || ""))?.created_at ||
            0
        )
      ).getTime();
      const bTs = new Date(
        String(
          b.last_reply_at ||
            latestReplyByLeadId.get(String(b.id || ""))?.received_at ||
            latestReplyByLeadId.get(String(b.id || ""))?.created_at ||
            0
        )
      ).getTime();
      return bTs - aTs;
    })
    .slice(0, 12);
  const hotLeads = allLeads
    .filter((lead) => Boolean(lead.is_hot_lead) || String(lead.status || "").toLowerCase() === "replied")
    .sort((a, b) => Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0))
    .slice(0, 8);
  const easyWins = topLeadsEmailReady.filter((lead) => {
    const linkedOppId = String(lead.linked_opportunity_id || "").trim();
    const opp = linkedOppId ? topLeadOppById.get(linkedOppId) : null;
    const bucket = canonicalLeadBucket(String(opp?.lead_bucket || "").trim(), Number(lead.opportunity_score ?? 0));
    return bucket === "Easy Win";
  });
  const todayStartIso = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const repliesToday = (replyMessageRows || []).filter((row) => {
    const ts = String(row.received_at || row.created_at || "").trim();
    return ts && ts >= todayStartIso;
  }).length;

  const snapshot = {
    new: 0,
    contacted: 0,
    replied: 0,
    research_later: 0,
    closed: 0,
  };
  for (const lead of allLeads) {
    const status = String(lead.status || "").trim().toLowerCase();
    if (status === "new") snapshot.new += 1;
    else if (status === "contacted" || status === "follow_up_due") snapshot.contacted += 1;
    else if (status === "replied") snapshot.replied += 1;
    else if (status === "research_later") snapshot.research_later += 1;
    else if (status === "closed" || status === "closed_won" || status === "closed_lost") snapshot.closed += 1;
  }
  const dealsWon = allLeads.filter((lead) => {
    const dealStatus = String(lead.deal_status || "").trim().toLowerCase();
    const status = String(lead.status || "").trim().toLowerCase();
    return dealStatus === "won" || status === "closed_won";
  });
  const totalRevenue = dealsWon.reduce((sum, lead) => {
    const explicit = Number(lead.deal_value || 0);
    const value = Number.isFinite(explicit) && explicit > 0 ? explicit : estimateBeginnerDealValue(lead);
    return sum + value;
  }, 0);
  const recurringClients = allLeads.filter((lead) => Boolean(lead.is_recurring_client));
  const totalMrr = recurringClients.reduce((sum, lead) => sum + Number(lead.monthly_value || 0), 0);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newRecurringThisMonth = recurringClients.filter((lead) => {
    const ts = String(lead.subscription_started_at || "").trim();
    return ts && ts >= thisMonthStart;
  }).length;
  const referredClientCount = allLeads.filter(
    (lead) => Boolean(lead.is_referred_client) || Boolean(String(lead.referred_by || "").trim())
  ).length;
  const leadsContacted = allLeads.filter((lead) => {
    const status = String(lead.status || "").trim().toLowerCase();
    return status !== "new" && status !== "research_later" && status !== "do_not_contact";
  }).length;
  const repliesCount = allLeads.filter((lead) => String(lead.status || "").trim().toLowerCase() === "replied").length;
  const conversionRate = leadsContacted > 0 ? (dealsWon.length / leadsContacted) * 100 : 0;
  const contactedCount = allLeads.filter((lead) => Boolean(String(lead.outreach_sent_at || "").trim())).length;
  const repliedCount = allLeads.filter(
    (lead) =>
      Boolean(String(lead.last_reply_at || "").trim()) ||
      String(lead.status || "").trim().toLowerCase() === "replied"
  ).length;
  const interestedCount = allLeads.filter((lead) => {
    const dealStatus = String(lead.deal_status || "").trim().toLowerCase();
    return dealStatus === "interested" || dealStatus === "proposal_sent" || dealStatus === "won";
  }).length;
  const wonCount = dealsWon.length;
  const lostCount = allLeads.filter((lead) => {
    const dealStatus = String(lead.deal_status || "").trim().toLowerCase();
    const status = String(lead.status || "").trim().toLowerCase();
    return dealStatus === "lost" || status === "closed_lost";
  }).length;
  const contactedToRepliedRate = contactedCount > 0 ? (repliedCount / contactedCount) * 100 : 0;
  const repliedToInterestedRate = repliedCount > 0 ? (interestedCount / repliedCount) * 100 : 0;
  const interestedToWonRate = interestedCount > 0 ? (wonCount / interestedCount) * 100 : 0;
  const overallCloseRate = contactedCount > 0 ? (wonCount / contactedCount) * 100 : 0;

  const replyHourCounts = new Map<number, number>();
  for (const row of replyMessageRows) {
    const ts = String(row.received_at || row.created_at || "").trim();
    if (!ts) continue;
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) continue;
    const hour = date.getHours();
    replyHourCounts.set(hour, (replyHourCounts.get(hour) || 0) + 1);
  }
  const bestReplyHour =
    Array.from(replyHourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const bestReplyHourLabel =
    bestReplyHour === null
      ? "8am-11am (default)"
      : `${String(bestReplyHour).padStart(2, "0")}:00-${String((bestReplyHour + 1) % 24).padStart(2, "0")}:00`;

  const followUpDayStats = new Map<number, { sends: number; replied: number }>();
  for (const row of followUpSentRows) {
    const sent = String(row.sent_at || "").trim();
    if (!sent) continue;
    const date = new Date(sent);
    if (Number.isNaN(date.getTime())) continue;
    const day = date.getDay();
    const lead = leadById.get(String(row.lead_id || "").trim());
    const didReply = Boolean(
      lead &&
        (String(lead.last_reply_at || "").trim() ||
          String(lead.status || "").trim().toLowerCase() === "replied")
    );
    const current = followUpDayStats.get(day) || { sends: 0, replied: 0 };
    current.sends += 1;
    if (didReply) current.replied += 1;
    followUpDayStats.set(day, current);
  }
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bestFollowUpDay = Array.from(followUpDayStats.entries())
    .filter(([, stat]) => stat.sends > 0)
    .map(([day, stat]) => ({ day, rate: stat.replied / stat.sends, sends: stat.sends }))
    .sort((a, b) => b.rate - a.rate || b.sends - a.sends)[0];
  const bestFollowUpDayLabel = bestFollowUpDay ? weekday[bestFollowUpDay.day] : "Tue/Thu (default)";
  const hasEnoughTimingData = replyMessageRows.length >= 10 && followUpSentRows.length >= 10;

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

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="admin-card admin-section-hot">
          <h2 className="text-lg font-semibold mb-3">HOT LEADS</h2>
          {hotLeads.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>No hot leads yet.</p>
          ) : (
            <div className="space-y-2">
              {hotLeads.map((lead) => {
                const businessName = String(lead.business_name || "Lead");
                const leadPath = buildLeadPath(String(lead.id || ""), businessName);
                return (
                  <div key={lead.id} className="rounded-lg border px-3 py-2" style={{ borderColor: "rgba(74, 222, 128, 0.4)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{businessName}</p>
                      <span className={`admin-badge ${leadStatusClass(lead.status)}`}>{prettyLeadStatus(lead.status)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {getLeadPriorityBadges({
                        isHotLead: Boolean(lead.is_hot_lead),
                        bucket: null,
                        score: lead.opportunity_score ?? null,
                        email: lead.email || null,
                        phone: null,
                      }).map((badge) => (
                        <span key={`${lead.id}-${badge.key}`} className={`admin-priority-badge ${badge.className}`}>
                          {badge.label}
                        </span>
                      ))}
                    </div>
                    <a href={leadPath} className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center mt-2">Open Lead</a>
                  </div>
                );
              })}
            </div>
          )}
        </article>
        <article className="admin-card admin-section-today">
          <h2 className="text-lg font-semibold mb-3">TODAY</h2>
          {calendarTodayRows.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>No calendar events today.</p>
          ) : (
            <ul className="space-y-2">
              {calendarTodayRows.slice(0, 8).map((event) => {
                const eventLead = String(event.lead_id || "").trim() ? leadById.get(String(event.lead_id || "")) : null;
                return (
                  <li key={event.id} className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ width: 8, height: 8, borderRadius: 999, display: "inline-block", background: calendarTypeColor(event.event_type) }} />
                      <span>{fmtDate(event.start_time)}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{String(event.title || "Event")}</p>
                    <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      {String(event.event_type || "task")}
                      {eventLead ? ` · ${String(eventLead.business_name || "Lead")}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <a href="/admin/calendar" className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center mt-2">Open Calendar</a>
        </article>
        <article className="admin-card admin-section-easy">
          <h2 className="text-lg font-semibold mb-3">EASY WINS</h2>
          {easyWins.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>No easy wins right now.</p>
          ) : (
            <div className="space-y-2">
              {easyWins.slice(0, 8).map((lead) => {
                const businessName = String(lead.business_name || "Lead");
                const leadPath = buildLeadPath(String(lead.id || ""), businessName);
                return (
                  <div key={lead.id} className="rounded-lg border px-3 py-2" style={{ borderColor: "rgba(250, 204, 21, 0.35)" }}>
                    <p className="text-sm font-medium">{businessName}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="admin-priority-badge admin-priority-easy">⚡ Easy Win</span>
                    </div>
                    <a href={leadPath} className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center mt-2">Open Lead</a>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3">Work Today</h2>
        {workToday.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            No actionable email leads yet. Run Scout or backfill, then review Actionable Email Leads.
          </p>
        ) : (
          <div className="space-y-3">
            {workToday.map((item) => (
              <div key={item.id} className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.businessName}</p>
                  <LeadBucketBadge bucket={item.leadBucket} score={item.opportunityScore} />
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {getLeadPriorityBadges({
                    isHotLead: false,
                    bucket: item.leadBucket,
                    score: item.opportunityScore,
                    email: item.email,
                    phone: null,
                  }).map((badge) => (
                    <span key={`${item.id}-${badge.key}`} className={`admin-priority-badge ${badge.className}`}>
                      {badge.label}
                    </span>
                  ))}
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
                  <span className="font-semibold">Email:</span> {item.email} ({item.emailSource || "unknown"})
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
            {topLeadsEmailReady.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                No email-ready Easy Win leads in last 24h.
              </p>
            ) : (
              topLeadsEmailReady.slice(0, 12).map((lead) => {
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
                      <span className={`admin-badge ${leadStatusClass(lead.status)}`}>{prettyLeadStatus(lead.status)}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                      <LeadBucketBadge bucket={leadBucket} score={Number(lead.opportunity_score ?? 0)} />{" "}
                      {opportunityReason || "Contact info is hard to find"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {getLeadPriorityBadges({
                        isHotLead: Boolean(lead.is_hot_lead),
                        bucket: leadBucket,
                        score: Number(lead.opportunity_score ?? 0),
                        email: lead.email || null,
                        phone: null,
                      }).map((badge) => (
                        <span key={`${lead.id}-easy-${badge.key}`} className={`admin-priority-badge ${badge.className}`}>
                          {badge.label}
                        </span>
                      ))}
                    </div>
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
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            Replies today: {repliesToday}. Unmatched replies are logged in webhook diagnostics.
          </p>
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
                  {(() => {
                    const latestReply = latestReplyByLeadId.get(String(lead.id || ""));
                    const replyAt =
                      String(lead.last_reply_at || latestReply?.received_at || latestReply?.created_at || "").trim() || null;
                    const replyPreview =
                      String(lead.last_reply_preview || latestReply?.body || "")
                        .replace(/\s+/g, " ")
                        .trim()
                        .slice(0, 180) || "Reply received";
                    const fromEmail = String(lead.email || latestReply?.recipient_email || "").trim() || "unknown";
                    return (
                      <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{String(lead.business_name || "Lead")}</p>
                    <span className={`admin-badge ${leadStatusClass(lead.status)}`}>{prettyLeadStatus(lead.status)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {getLeadPriorityBadges({
                      isHotLead: Boolean(lead.is_hot_lead),
                      bucket: null,
                      score: lead.opportunity_score ?? null,
                      email: lead.email || null,
                      phone: null,
                    }).map((badge) => (
                      <span key={`${lead.id}-reply-${badge.key}`} className={`admin-priority-badge ${badge.className}`}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                    {fromEmail} · {fmtDate(replyAt)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                    "{replyPreview}"
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                    Status: {String(lead.status || "replied")} · Next action: {String(lead.recommended_next_action || "Reply to Lead")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={buildLeadPath(String(lead.id || ""), String(lead.business_name || "Lead"))}
                      className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center"
                    >
                      Open Lead
                    </a>
                    <a
                      href={buildLeadPath(String(lead.id || ""), String(lead.business_name || "Lead"))}
                      className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                    >
                      Copy Reply
                    </a>
                    <a
                      href={`/book?lead=${encodeURIComponent(String(lead.id || ""))}`}
                      className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                    >
                      Send Booking Link
                    </a>
                    <a
                      href={buildLeadPath(String(lead.id || ""), String(lead.business_name || "Lead"))}
                      className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center"
                    >
                      Mark Closed
                    </a>
                  </div>
                      </>
                    );
                  })()}
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
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>replied</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.replied}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>research_later</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.research_later}</p>
            </div>
            <div className="rounded-lg border px-3 py-3 col-span-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>closed</p>
              <p className="text-2xl font-semibold mt-1">{snapshot.closed}</p>
            </div>
          </div>
        </article>
        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Deals & Revenue</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>deals won</p>
              <p className="text-2xl font-semibold mt-1">{dealsWon.length}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>total revenue</p>
              <p className="text-2xl font-semibold mt-1">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                  totalRevenue
                )}
              </p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>leads contacted</p>
              <p className="text-2xl font-semibold mt-1">{leadsContacted}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>replies</p>
              <p className="text-2xl font-semibold mt-1">{repliesCount}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>mrr total</p>
              <p className="text-2xl font-semibold mt-1">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                  totalMrr
                )}
              </p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>active recurring clients</p>
              <p className="text-2xl font-semibold mt-1">{recurringClients.length}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>new recurring this month</p>
              <p className="text-2xl font-semibold mt-1">{newRecurringThisMonth}</p>
            </div>
            <div className="rounded-lg border px-3 py-3" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>referred clients</p>
              <p className="text-2xl font-semibold mt-1">{referredClientCount}</p>
            </div>
            <div className="rounded-lg border px-3 py-3 col-span-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>conversion rate</p>
              <p className="text-2xl font-semibold mt-1">{conversionRate.toFixed(1)}%</p>
              <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                Uses beginner pricing defaults when won deals have no value: basic $150-$300, standard $300-$500.
              </p>
            </div>
            <div className="rounded-lg border px-3 py-3 col-span-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>stage conversion rates</p>
              <p className="text-sm mt-1">Contacted → Replied: <strong>{contactedToRepliedRate.toFixed(1)}%</strong> ({repliedCount}/{contactedCount || 0})</p>
              <p className="text-sm mt-1">Replied → Interested: <strong>{repliedToInterestedRate.toFixed(1)}%</strong> ({interestedCount}/{repliedCount || 0})</p>
              <p className="text-sm mt-1">Interested → Won: <strong>{interestedToWonRate.toFixed(1)}%</strong> ({wonCount}/{interestedCount || 0})</p>
              <p className="text-sm mt-1">Overall close rate: <strong>{overallCloseRate.toFixed(1)}%</strong> ({wonCount}/{contactedCount || 0})</p>
            </div>
          </div>
        </article>
        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Timing Insights</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span style={{ color: "var(--admin-muted)" }}>Best time of day for replies:</span> {bestReplyHourLabel}
            </p>
            <p>
              <span style={{ color: "var(--admin-muted)" }}>Best day for follow-ups:</span> {bestFollowUpDayLabel}
            </p>
            {hasEnoughTimingData ? (
              <p style={{ color: "var(--admin-muted)" }}>
                Based on {replyMessageRows.length} replies and {followUpSentRows.length} follow-up sends.
              </p>
            ) : (
              <p style={{ color: "var(--admin-muted)" }}>
                Default schedule active while data grows: send between 8am-11am, follow-up at 2/5/8 days.
              </p>
            )}
          </div>
        </article>
        <article className="admin-card">
          <h2 className="text-lg font-semibold mb-3">Deal Pipeline</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>New: <strong>{snapshot.new}</strong></div>
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>Contacted: <strong>{snapshot.contacted}</strong></div>
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>Replied: <strong>{snapshot.replied}</strong></div>
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>Interested: <strong>{interestedCount}</strong></div>
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>Won: <strong>{wonCount}</strong></div>
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>Lost: <strong>{lostCount}</strong></div>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
            Won deal value: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalRevenue)}
          </p>
        </article>
      </section>
    </div>
  );
}
