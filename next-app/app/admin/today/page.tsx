import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toWorkflowLead, isMissingColumnError, type LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";
import { CRM_STAGE_LABELS } from "@/lib/crm/stages";
import { prettyLeadStatus } from "@/components/admin/lead-visuals";
import { computeWorkTodayLeads } from "@/lib/crm/work-today-leads";
import { TodayWorkspace } from "@/components/admin/today-workspace";
import { isThreeDPrintLead, normalizePrintPipelineStatus } from "@/lib/crm/three-d-print-lead";
import { resolvePrintUiLane } from "@/lib/crm/three-d-print-ui-lanes";
import { isFollowUpDueTodayUtc, simpleLeadStatusLabel } from "@/lib/crm/simple-lead-status-ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function dueDate(lead: { next_follow_up_at?: string | null }): Date | null {
  const raw = String(lead.next_follow_up_at || "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function TodayCommandPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view Today.
        </p>
      </section>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let rows: LeadRowForWorkflow[] = [];
  const selectVariants = [
    "id,business_name,status,email,phone,website,city,category,conversion_score,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview,last_reply_at,is_hot_lead,unread_reply_count,lead_tags,service_type,lead_source,source,print_pipeline_status,first_outreach_sent_at,email_sent,facebook_sent,text_sent",
    "id,business_name,status,email,phone,website,city,category,conversion_score,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview,last_reply_at,is_hot_lead,unread_reply_count,lead_tags",
    "id,business_name,status,email,phone,website,city,category,conversion_score,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview,last_reply_at,is_hot_lead,unread_reply_count",
    "id,business_name,status,email,phone,website,city,category,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview",
  ];
  for (const sel of selectVariants) {
    const { data, error } = await supabase.from("leads").select(sel).eq("owner_id", ownerId).order("created_at", { ascending: false }).limit(800);
    if (!error) {
      rows = (data || []) as unknown as LeadRowForWorkflow[];
      break;
    }
    if (!isMissingColumnError(String(error.message))) console.error("[Today] leads query", error);
  }

  const leads = rows.map(toWorkflowLead);
  const workTodayLeads = computeWorkTodayLeads(rows, now, 10);

  const newLeads = leads.filter((l) => l.status === "new").length;
  const repliesWaiting = leads.filter((l) => l.status === "replied").length;
  const followUpsDue = leads.filter((l) => {
    if (l.status === "won" || l.status === "lost" || l.status === "replied") return false;
    const d = dueDate(l);
    if (!d) return false;
    return d.getTime() <= now.getTime() && String(l.follow_up_status || "pending").toLowerCase() !== "completed";
  }).length;
  const wonThisMonth = leads.filter((l) => {
    if (l.status !== "won") return false;
    const c = l.created_at ? new Date(l.created_at).getTime() : 0;
    return c >= monthStart.getTime();
  }).length;

  const firstOutreach = leads.filter(
    (l) => l.status === "new" && !(l.email_sent || l.facebook_sent || l.text_sent)
  );
  const followUpToday = leads.filter((l) => {
    const d = dueDate(l);
    if (!d) return false;
    return (
      d.toDateString() === now.toDateString() &&
      l.status !== "won" &&
      l.status !== "lost" &&
      l.status !== "replied"
    );
  });
  const unreadish = leads.filter((l) => String(l.last_reply_preview || "").trim() && l.status === "replied");
  const hot = leads.filter((l) => l.is_hot_lead).slice(0, 8);
  const recentReplies = [...leads]
    .filter((l) => l.last_reply_preview)
    .sort((a, b) => new Date(b.last_reply_at || b.created_at || 0).getTime() - new Date(a.last_reply_at || a.created_at || 0).getTime())
    .slice(0, 6);

  let draftCount = 0;
  try {
    const d = await supabase
      .from("email_messages")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .eq("direction", "outbound")
      .eq("status", "draft");
    if (!d.error) draftCount = Number(d.count || 0);
  } catch {
    /* ignore */
  }

  const proposalFollowUps = leads.filter((l) => l.status === "proposal_sent").slice(0, 6);

  const todayQuiet =
    firstOutreach.length === 0 && followUpToday.length === 0 && unreadish.length === 0;

  const pipelineOrder = ["new", "contacted", "replied", "qualified", "proposal_sent", "won", "lost"] as const;
  const pipelineCounts = Object.fromEntries(pipelineOrder.map((s) => [s, leads.filter((l) => l.status === s).length])) as Record<
    (typeof pipelineOrder)[number],
    number
  >;

  const webFuToday = leads.filter(
    (l) =>
      !isThreeDPrintLead(l) &&
      isFollowUpDueTodayUtc(l.next_follow_up_at) &&
      l.status !== "won" &&
      l.status !== "lost" &&
      l.status !== "replied",
  ).length;
  const printFuToday = leads.filter(
    (l) =>
      isThreeDPrintLead(l) &&
      isFollowUpDueTodayUtc(l.next_follow_up_at) &&
      normalizePrintPipelineStatus(l.print_pipeline_status) !== "closed",
  ).length;
  const newMockupLeads = leads.filter((l) => {
    if (isThreeDPrintLead(l)) return false;
    const st = String(l.service_type || "").toLowerCase();
    const src = `${l.lead_source || ""} ${(l.lead_tags || []).join(" ")}`.toLowerCase();
    if (st === "web_design") return l.status === "new";
    return l.status === "new" && (src.includes("mockup") || src.includes("web_design"));
  }).length;
  const newPrintLeads = leads.filter(
    (l) => isThreeDPrintLead(l) && normalizePrintPipelineStatus(l.print_pipeline_status) === "new",
  ).length;
  const waitingOnReply = leads.filter((l) => {
    if (isThreeDPrintLead(l)) return false;
    return (
      simpleLeadStatusLabel({
        status: l.status,
        next_follow_up_at: l.next_follow_up_at,
        first_outreach_sent_at: l.first_outreach_sent_at,
      }) === "Waiting on Reply"
    );
  }).length;
  const waitingOnCustomer = leads.filter((l) => isThreeDPrintLead(l) && resolvePrintUiLane(l) === "waiting_customer").length;
  const wonOrCompleted =
    leads.filter((l) => l.status === "won").length +
    leads.filter(
      (l) => isThreeDPrintLead(l) && ["delivered", "closed"].includes(normalizePrintPipelineStatus(l.print_pipeline_status)),
    ).length;

  return (
    <TodayWorkspace workTodayLeads={workTodayLeads}>
      <section className="admin-card space-y-3 mb-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          At a glance
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Mix of web CRM and 3D print pipeline — counts are from your saved leads (this workspace).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {[
            { label: "Web F/U today", value: webFuToday, href: "/admin/leads?follow_up_today=1" },
            {
              label: "3D F/U today",
              value: printFuToday,
              href: "/admin/leads?crm_source=3d_printing&follow_up_today=1",
            },
            { label: "New mockup", value: newMockupLeads, href: "/admin/leads" },
            { label: "New print", value: newPrintLeads, href: "/admin/leads?crm_source=3d_printing&print_stage=new_print" },
            { label: "Waiting reply", value: waitingOnReply, href: "/admin/leads" },
            { label: "Waiting customer (3D)", value: waitingOnCustomer, href: "/admin/leads?crm_source=3d_printing&print_stage=waiting_customer" },
            { label: "Won / completed", value: wonOrCompleted, href: "/admin/leads" },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-lg border px-2 py-2 no-underline transition hover:opacity-95"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div className="text-[10px] leading-tight" style={{ color: "var(--admin-muted)" }}>
                {c.label}
              </div>
              <div className="text-lg font-bold tabular-nums" style={{ color: "var(--admin-gold)" }}>
                {c.value}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-stats-grid">
        {[
          { label: "New businesses to contact", value: newLeads, href: "/admin/leads" },
          { label: "Replies waiting on you", value: repliesWaiting, href: "/admin/conversations" },
          { label: "Follow-ups to send", value: followUpsDue, href: "/admin/outreach" },
          { label: "Hot opportunities (won this month)", value: wonThisMonth, href: "/admin/leads" },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="admin-stat-card block no-underline">
            <div className="admin-stat-label">{card.label}</div>
            <div className="admin-stat-value">{card.value}</div>
          </Link>
        ))}
      </section>

      {todayQuiet ? (
        <section className="admin-card space-y-2 text-sm" style={{ color: "var(--admin-muted)" }}>
          <p className="font-medium" style={{ color: "var(--admin-fg)" }}>
            Nothing urgent right now.
          </p>
          <p>
            Add a few businesses to get started — open{" "}
            <Link href="/admin/scout" className="text-[var(--admin-gold)] underline">
              Find businesses
            </Link>{" "}
            (Scout) and save a handful of leads.
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="admin-card space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              What to do next
            </h2>
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              These are the most important businesses to act on today.
            </p>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                New — say hello first
              </h3>
              <ul className="space-y-2">
                {firstOutreach.slice(0, 8).map((l) => (
                  <li key={l.id} className="flex justify-between gap-2 text-sm">
                    <Link href={`/admin/leads/${l.id}`} className="text-[var(--admin-gold)] hover:underline truncate">
                      {l.business_name}
                    </Link>
                    <span className="shrink-0 text-xs" style={{ color: "var(--admin-muted)" }}>
                      {l.email ? "email" : "no email"}
                    </span>
                  </li>
                ))}
                {firstOutreach.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    Nothing urgent here. Add a few businesses from Scout or the quick-add bookmark when you’re ready.
                  </p>
                ) : null}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                Follow-ups due today
              </h3>
              <ul className="space-y-2">
                {followUpToday.slice(0, 8).map((l) => (
                  <li key={l.id} className="flex justify-between gap-2 text-sm">
                    <Link href={`/admin/leads/${l.id}`} className="text-[var(--admin-gold)] hover:underline truncate">
                      {l.business_name}
                    </Link>
                    <span className="shrink-0 text-xs">{prettyLeadStatus(l.status)}</span>
                  </li>
                ))}
                {followUpToday.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    You’re caught up on dated follow-ups.
                  </p>
                ) : null}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                They replied — your turn
              </h3>
              <ul className="space-y-2">
                {unreadish.slice(0, 8).map((l) => (
                  <li key={l.id} className="text-sm">
                    <Link href={`/admin/conversations?leadId=${encodeURIComponent(l.id)}`} className="text-rose-200 font-medium hover:underline">
                      {l.business_name}
                    </Link>
                    <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "var(--admin-muted)" }}>
                      {l.last_reply_preview}
                    </p>
                  </li>
                ))}
                {unreadish.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    Nothing urgent right now.
                  </p>
                ) : null}
              </ul>
            </div>
          </section>

          <section className="admin-card space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              Where everyone sits
            </h2>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              A quick count by status — no need to memorize it.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {pipelineOrder.map((s) => (
                <div key={s} className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--admin-border)" }}>
                  <div className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    {CRM_STAGE_LABELS[s]}
                  </div>
                  <div className="text-xl font-bold" style={{ color: "var(--admin-gold)" }}>
                    {pipelineCounts[s]}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="admin-card space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Hot opportunities
            </h2>
            <ul className="space-y-2 text-sm">
              {hot.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="text-[var(--admin-gold)] hover:underline">
                    {l.business_name}
                  </Link>
                </li>
              ))}
              {hot.length === 0 ? (
                <li style={{ color: "var(--admin-muted)" }} className="text-xs">
                  None flagged hot yet.
                </li>
              ) : null}
            </ul>
          </section>
          <section className="admin-card space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Recent replies
            </h2>
            <ul className="space-y-2 text-xs">
              {recentReplies.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/conversations?leadId=${encodeURIComponent(l.id)}`} className="text-rose-200 hover:underline font-medium">
                    {l.business_name}
                  </Link>
                  <p className="line-clamp-2 mt-0.5" style={{ color: "var(--admin-muted)" }}>
                    {l.last_reply_preview}
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <section className="admin-card space-y-2">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Draft messages
            </h2>
            <p className="text-2xl font-bold" style={{ color: "var(--admin-gold)" }}>
              {draftCount}
            </p>
            <Link href="/admin/outreach" className="admin-btn-ghost text-xs inline-block">
              Open outreach
            </Link>
          </section>
          <section className="admin-card space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Proposals waiting
            </h2>
            <ul className="space-y-2 text-sm">
              {proposalFollowUps.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/proposals`} className="text-[var(--admin-gold)] hover:underline">
                    {l.business_name}
                  </Link>
                </li>
              ))}
              {proposalFollowUps.length === 0 ? <li style={{ color: "var(--admin-muted)" }}>—</li> : null}
            </ul>
          </section>
        </aside>
      </div>
    </TodayWorkspace>
  );
}
