import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildLeadPath } from "@/lib/lead-route";
import { NewLeadActions } from "@/components/admin/crm/new-lead-actions";
import {
  buildLeadSummary,
  deriveLeadPriority,
  displayLeadSourceLabel,
  leadMatchesPriorityFilter,
  leadMatchesSourceDisplayFilter,
  type LeadPriority,
  type LeadSourceFilter,
} from "@/lib/crm/lead-display";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const INBOUND_SOURCES = [
  "captain_maker",
  "captain_maker_chat",
  "contact_form",
  "idea_lab",
  "quote_request",
  "ring_connect",
  "website_check",
  "ai_automation_inquiry",
  "digital_resource_request",
];

function formatDate(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "Unknown";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function text(value: unknown, fallback = "—"): string {
  const raw = String(value || "").trim();
  return raw || fallback;
}

function firstParam(value: string | string[] | undefined): string {
  return String(Array.isArray(value) ? value[0] : value || "")
    .trim()
    .toLowerCase();
}

export default async function NewLeadsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();

  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="admin-text-muted text-sm">
          Sign in to view new leads.
        </p>
      </section>
    );
  }

  const sp = await searchParams;
  const statusFilter = firstParam(sp.status);
  const dealStatusFilter = firstParam(sp.deal_status);
  const sourceFilterRaw = firstParam(sp.source);
  const priorityFilterRaw = firstParam(sp.priority);
  const sourceFilter: LeadSourceFilter =
    sourceFilterRaw === "captain_maker_chat" || sourceFilterRaw === "free_estimate_form" ? sourceFilterRaw : "all";
  const priorityFilter: LeadPriority | "all" =
    priorityFilterRaw === "hot" || priorityFilterRaw === "warm" || priorityFilterRaw === "browsing"
      ? priorityFilterRaw
      : "all";
  const allowedStatusFilter = ["new", "contacted", "replied", "no_response", "not_interested", "won", "archived"].includes(
    statusFilter,
  )
    ? statusFilter
    : "";

  let query = supabase
    .from("leads")
    .select("id,business_name,contact_name,email,phone,website,source,lead_source,status,deal_status,service_type,category,lead_bucket,notes,created_at")
    .eq("owner_id", ownerId)
    .in("lead_source", INBOUND_SOURCES)
    .order("created_at", { ascending: false })
    .limit(100);

  if (allowedStatusFilter) {
    query = query.eq("status", allowedStatusFilter);
  } else {
    query = query.neq("status", "archived");
  }

  if (dealStatusFilter === "proposal_sent") {
    query = query.eq("deal_status", "proposal_sent");
  }

  const { data, error } = await query;

  const leads = ((data || []) as Record<string, unknown>[]).filter((lead) =>
    leadMatchesSourceDisplayFilter(lead, sourceFilter) && leadMatchesPriorityFilter(lead, priorityFilter),
  );
  const newestCount = leads.filter((lead) => text(lead.status, "").toLowerCase() === "new").length;

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="admin-text-gold text-xs font-semibold uppercase tracking-[0.2em]">
              Free-first lead inbox
            </p>
            <h1 className="admin-text-fg mt-2 text-2xl font-bold">
              {dealStatusFilter === "proposal_sent"
                ? "Proposal sent leads"
                : allowedStatusFilter === "contacted"
                  ? "Contacted Mixed Maker Shop leads"
                  : "New Mixed Maker Shop leads"}
            </h1>
            <p className="admin-text-muted mt-2 max-w-2xl text-sm">
              Manual dashboard for form submissions and Captain Maker chat leads. No email, SMS, Zapier, Resend, or
              Twilio alerts are sent from this flow.
            </p>
          </div>
          <div className="admin-border-soft rounded-xl border px-4 py-3 text-sm">
            <div className="admin-text-fg text-2xl font-bold">
              {newestCount}
            </div>
            <div className="admin-text-muted">new leads</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/crm/web?queue=new" className="admin-btn-ghost text-xs">
            Open CRM pipeline
          </Link>
          <Link href="/admin/crm/hub" className="admin-btn-ghost text-xs">
            CRM hub
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            { label: "All", value: "all" },
            { label: "Captain Maker Chat", value: "captain_maker_chat" },
            { label: "Free Estimate Form", value: "free_estimate_form" },
          ].map((option) => {
            const active = sourceFilter === option.value;
            const href =
              option.value === "all"
                ? "/admin/crm/new-leads"
                : `/admin/crm/new-leads?source=${encodeURIComponent(option.value)}`;
            return (
              <Link key={option.value} href={href} className={active ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}>
                {option.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" },
            { label: "Hot", value: "hot" },
            { label: "Warm", value: "warm" },
            { label: "Browsing", value: "browsing" },
          ].map((option) => {
            const active = priorityFilter === option.value;
            const href =
              option.value === "all"
                ? "/admin/crm/new-leads"
                : `/admin/crm/new-leads?priority=${encodeURIComponent(option.value)}`;
            return (
              <Link key={option.value} href={href} className={active ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}>
                {option.label}
              </Link>
            );
          })}
        </div>
      </section>

      {error ? (
        <section className="admin-card">
          <p className="text-sm text-red-300">Could not load new leads: {error.message}</p>
        </section>
      ) : null}

      {!error && leads.length === 0 ? (
        <section className="admin-card">
          <h2 className="admin-text-fg text-lg font-semibold">
            No inbound leads yet
          </h2>
          <p className="admin-text-muted mt-2 text-sm">
            New form submissions and Captain Maker chat leads will appear here after they save to the CRM.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4">
        {leads.map((lead) => {
          const id = text(lead.id, "");
          const business = text(lead.business_name, "Untitled lead");
          const notePreview = text(lead.notes, "").slice(0, 260);
          const summary = buildLeadSummary(lead);
          const priority = deriveLeadPriority(lead);
          return (
            <article key={id} className="admin-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="admin-badge">{text(lead.status, "new")}</span>
                    <span className="admin-badge">{displayLeadSourceLabel(lead)}</span>
                    <span className={`admin-priority-badge ${priority.className}`}>
                      {priority.label}
                      {priority.isManual ? " (manual)" : ""}
                    </span>
                    <span className="admin-text-muted text-xs">
                      {formatDate(lead.created_at)}
                    </span>
                  </div>
                  <h2 className="admin-text-fg mt-3 text-lg font-semibold">
                    {business}
                  </h2>
                  <dl className="admin-text-muted mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="admin-text-fg font-semibold">
                        Contact
                      </dt>
                      <dd>{text(lead.contact_name)}</dd>
                    </div>
                    <div>
                      <dt className="admin-text-fg font-semibold">
                        Email
                      </dt>
                      <dd>{text(lead.email)}</dd>
                    </div>
                    <div>
                      <dt className="admin-text-fg font-semibold">
                        Phone
                      </dt>
                      <dd>{text(lead.phone)}</dd>
                    </div>
                    <div>
                      <dt className="admin-text-fg font-semibold">
                        Website
                      </dt>
                      <dd>{text(lead.website)}</dd>
                    </div>
                  </dl>
                  <div className="admin-border-soft mt-4 rounded-xl border p-3">
                    <h3 className="admin-text-fg text-sm font-semibold">Lead summary</h3>
                    <dl className="admin-text-muted mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="admin-text-fg font-semibold">Project type</dt>
                        <dd>{summary.projectType}</dd>
                      </div>
                      <div>
                        <dt className="admin-text-fg font-semibold">Budget range</dt>
                        <dd>{summary.budgetRange}</dd>
                      </div>
                      <div>
                        <dt className="admin-text-fg font-semibold">Timeline</dt>
                        <dd>{summary.timeline}</dd>
                      </div>
                      <div>
                        <dt className="admin-text-fg font-semibold">Source</dt>
                        <dd>{summary.source}</dd>
                      </div>
                      <div>
                        <dt className="admin-text-fg font-semibold">Submitted date</dt>
                        <dd>{formatDate(lead.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                  {notePreview ? (
                    <p className="admin-border-soft admin-text-muted mt-4 whitespace-pre-line rounded-xl border p-3 text-sm">
                      {notePreview}
                      {String(lead.notes || "").length > notePreview.length ? "…" : ""}
                    </p>
                  ) : null}
                  <NewLeadActions
                    leadId={id}
                    initialStatus={text(lead.status, "new")}
                    initialDealStatus={text(lead.deal_status, "")}
                    initialNotes={text(lead.notes, "")}
                  />
                </div>
                <Link href={buildLeadPath(id, business)} className="admin-btn-ghost shrink-0 text-sm">
                  Review in CRM
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
