import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toWorkflowLead, isMissingColumnError, type LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";
import { CRM_STAGE_LABELS } from "@/lib/crm/stages";
import { prettyLeadStatus } from "@/components/admin/lead-visuals";

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
    "id,business_name,status,email,phone,website,city,category,conversion_score,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview,last_reply_at,is_hot_lead",
    "id,business_name,status,email,phone,website,city,category,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview",
  ];
  for (const sel of selectVariants) {
    const { data, error } = await supabase.from("leads").select(sel).eq("owner_id", ownerId).order("created_at", { ascending: false }).limit(800);
    if (!error) {
      rows = (data || []) as LeadRowForWorkflow[];
      break;
    }
    if (!isMissingColumnError(String(error.message))) console.error("[Today] leads query", error);
  }

  const leads = rows.map(toWorkflowLead);

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

  const pipelineOrder = ["new", "contacted", "replied", "qualified", "proposal_sent", "won", "lost"] as const;
  const pipelineCounts = Object.fromEntries(pipelineOrder.map((s) => [s, leads.filter((l) => l.status === s).length])) as Record<
    (typeof pipelineOrder)[number],
    number
  >;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
          Today
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
          Web design sales — do the next right action.
        </p>
      </div>

      <section className="admin-stats-grid">
        {[
          { label: "New Leads", value: newLeads, href: "/admin/leads" },
          { label: "Replies Waiting", value: repliesWaiting, href: "/admin/conversations" },
          { label: "Follow-Ups Due", value: followUpsDue, href: "/admin/outreach" },
          { label: "Won This Month", value: wonThisMonth, href: "/admin/leads" },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="admin-stat-card block no-underline">
            <div className="admin-stat-label">{card.label}</div>
            <div className="admin-stat-value">{card.value}</div>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="admin-card space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              Action Queue
            </h2>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                First outreach
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
                    Nothing queued — nice work.
                  </p>
                ) : null}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                Follow-ups today
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
                    No follow-ups due today.
                  </p>
                ) : null}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                Leads with replies
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
                    No reply previews on file.
                  </p>
                ) : null}
              </ul>
            </div>
          </section>

          <section className="admin-card space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              Pipeline Snapshot
            </h2>
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
              Hot Leads
            </h2>
            <ul className="space-y-2 text-sm">
              {hot.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="text-[var(--admin-gold)] hover:underline">
                    {l.business_name}
                  </Link>
                </li>
              ))}
              {hot.length === 0 ? <li style={{ color: "var(--admin-muted)" }}>—</li> : null}
            </ul>
          </section>
          <section className="admin-card space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Recent Replies
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
              Drafts Ready
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
              Proposal follow-ups
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
    </div>
  );
}
