"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath } from "@/lib/lead-route";

type TimelineEntry = {
  id: string;
  direction?: string | null;
  subject?: string | null;
  body?: string | null;
  occurred_at?: string | null;
  status?: string | null;
};

export type WorkflowLead = {
  id: string;
  related_case_id?: string | null;
  lead_source?: string | null;
  opportunity_id: string | null;
  business_name: string;
  category: string | null;
  city?: string | null;
  address?: string | null;
  website_status?: string | null;
  opportunity_score: number | null;
  lead_bucket?: "Easy Win" | "High Value" | "Good Prospect" | "Needs Review" | "Low Priority" | null;
  close_probability?: "low" | "medium" | "high" | null;
  lead_type?: "Easy Win" | "Active Business, Weak Website" | "Church Website Opportunity" | "Needs Review" | "Low Priority" | null;
  best_contact_method?: "email" | "phone" | "contact_page" | "facebook" | null;
  primary_problem?: string | null;
  why_it_matters?: string | null;
  why_this_lead_is_here?: string | null;
  best_pitch_angle?: string | null;
  recommended_next_action?: "Generate Email" | "Send First Touch" | "Review Site Manually" | "Skip For Now" | null;
  website: string | null;
  email: string | null;
  phone_from_site: string | null;
  contact_page: string | null;
  facebook_url?: string | null;
  contact_method: string;
  detected_issue_summary: string;
  detected_issues: string[];
  status: "new" | "contacted" | "follow_up_due" | "replied" | "closed_won" | "closed_lost" | "do_not_contact";
  created_at: string | null;
  screenshot_urls: string[];
  annotated_screenshot_url?: string | null;
  timeline: TimelineEntry[];
  notes: string[];
};

function leadHref(lead: Pick<WorkflowLead, "id" | "business_name">, query?: string): string {
  const base = buildLeadPath(lead.id, lead.business_name);
  return query ? `${base}?${query}` : base;
}

function prettyStatus(status: string) {
  return String(status || "new")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function badgeClass(status: WorkflowLead["status"]) {
  if (status === "replied" || status === "closed_won") return "admin-badge admin-badge-won";
  if (status === "closed_lost" || status === "do_not_contact") return "admin-badge admin-badge-lost";
  if (status === "contacted" || status === "follow_up_due") return "admin-badge admin-badge-progress";
  return "admin-badge admin-badge-new";
}

export function LeadsWorkflowView({
  initialLeads,
  emptyStateReason,
}: {
  initialLeads: WorkflowLead[];
  emptyStateReason?: string;
}) {
  const [leads, setLeads] = useState<WorkflowLead[]>(initialLeads);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<
    "easy_wins" | "no_website" | "broken_website" | "facebook_only" | "churches" | "needs_review" | "all"
  >("easy_wins");
  const error: string | null = null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bySegment = leads.filter((lead) => {
      const ws = String(lead.website_status || "").toLowerCase();
      const cat = String(lead.category || "").toLowerCase();
      if (segment === "easy_wins") return canonicalLeadBucket(lead.lead_bucket, lead.opportunity_score) === "Easy Win";
      if (segment === "no_website") return ws === "no_website";
      if (segment === "broken_website") return ws === "broken_website";
      if (segment === "facebook_only") return ws === "facebook_only";
      if (segment === "churches") return cat.includes("church");
      if (segment === "needs_review") return lead.lead_type === "Needs Review";
      return true;
    });
    if (!q) return bySegment;
    return bySegment.filter((lead) =>
      [
        lead.business_name,
        lead.category || "",
        lead.city || "",
        lead.address || "",
        lead.status,
        lead.website || "",
        lead.website_status || "",
        lead.contact_method || "",
        lead.detected_issue_summary || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [leads, search, segment]);

  const queueCounts = useMemo(() => {
    const counts = {
      newLeads: 0,
      repliesWaiting: 0,
      followUpsDue: 0,
      contacted: 0,
    };
    for (const lead of leads) {
      const s = String(lead.status || "").toLowerCase();
      if (s === "new") counts.newLeads += 1;
      if (s === "replied") counts.repliesWaiting += 1;
      if (s === "follow_up_due") counts.followUpsDue += 1;
      if (s === "contacted") counts.contacted += 1;
    }
    return counts;
  }, [leads]);
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>New Leads</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.newLeads}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Replies Waiting</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.repliesWaiting}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Follow Ups Due</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.followUpsDue}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Contacted</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.contacted}</p>
        </div>
      </section>

      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Search business, issue, category, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input h-9 w-80"
            />
            <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Showing {filtered.length} of {leads.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              ["easy_wins", "Easy Win"],
              ["no_website", "No Website"],
              ["broken_website", "Broken Website"],
              ["facebook_only", "Facebook Only"],
              ["churches", "Churches"],
              ["needs_review", "Needs Review"],
              ["all", "All"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={segment === id ? "admin-btn-primary" : "admin-btn-ghost"}
                onClick={() => setSegment(id as typeof segment)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              className={viewMode === "cards" ? "admin-btn-primary" : "admin-btn-ghost"}
              onClick={() => setViewMode("cards")}
            >
              Card View
            </button>
            <button
              type="button"
              className={viewMode === "table" ? "admin-btn-primary" : "admin-btn-ghost"}
              onClick={() => setViewMode("table")}
            >
              Table View
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">No leads found</div>
            <div className="admin-empty-desc">
              {emptyStateReason || "Try a different search query."}
            </div>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((lead) => (
              <article
                key={lead.id}
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.2)" }}
              >
                {(() => {
                  const bucket = canonicalLeadBucket(lead.lead_bucket, lead.opportunity_score);
                  return (
                    <div className="flex items-center justify-between gap-2">
                      <LeadBucketBadge bucket={bucket} score={lead.opportunity_score} />
                    </div>
                  );
                })()}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{lead.business_name}</h3>
                    <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      {lead.city || "—"} · {lead.category || "—"} · Score {lead.opportunity_score ?? "—"} · Website {lead.website_status || "unknown"}
                    </p>
                  </div>
                  <span className={badgeClass(lead.status)}>{prettyStatus(lead.status)}</span>
                </div>
                <div className="space-y-1 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <p>
                    <span className="font-semibold">Lead bucket:</span> {canonicalLeadBucket(lead.lead_bucket, lead.opportunity_score)}
                  </p>
                  <p>
                    <span className="font-semibold">Lead type:</span> {lead.lead_type || "Needs Review"}
                  </p>
                  <p>
                    <span className="font-semibold">Close probability:</span> {lead.close_probability || "medium"}
                  </p>
                  <p>
                    <span className="font-semibold">What is wrong:</span> {lead.primary_problem || lead.detected_issue_summary || "Website needs manual review"}
                  </p>
                  <p>
                    <span className="font-semibold">Why it matters:</span> {lead.why_it_matters || "Visitors may leave before taking action."}
                  </p>
                  <p>
                    <span className="font-semibold">Why this lead is here:</span> {lead.why_this_lead_is_here || "Clear website improvement opportunity."}
                  </p>
                  <p>
                    <span className="font-semibold">Best contact:</span> {lead.best_contact_method || lead.contact_method}
                  </p>
                  <p>
                    <span className="font-semibold">What to say:</span> {lead.best_pitch_angle || "Quick website improvements can help increase leads."}
                  </p>
                  <p>
                    <span className="font-semibold">What to do next:</span> {lead.recommended_next_action || "Review Site Manually"}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {lead.phone_from_site || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Contact page:</span> {lead.contact_page || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Facebook:</span> {lead.facebook_url || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {lead.email || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={leadHref(lead)} className="admin-btn-primary text-xs">
                    Open Lead
                  </Link>
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs">
                      Open Website
                    </a>
                  ) : (
                    <span className="admin-btn-ghost text-xs opacity-60 cursor-not-allowed">Open Website</span>
                  )}
                  {lead.related_case_id ? (
                    <Link href={`/admin/cases/${encodeURIComponent(lead.related_case_id)}`} className="admin-btn-ghost text-xs">
                      Open Case
                    </Link>
                  ) : (
                    <span className="admin-btn-ghost text-xs opacity-60 cursor-not-allowed">Open Case</span>
                  )}
                  <Link href={leadHref(lead, "generate=1")} className="admin-btn-ghost text-xs">
                    Generate Email
                  </Link>
                  <Link href={leadHref(lead, "compose=1")} className="admin-btn-ghost text-xs">
                    Send Email
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-table-wrap overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Website Status</th>
                  <th>Score</th>
                  <th>Lead Bucket</th>
                  <th>Opportunity Reason</th>
                  <th>Why It Matters</th>
                  <th>What To Say</th>
                  <th>Lead Type</th>
                  <th>Close Probability</th>
                  <th>Phone</th>
                  <th>Contact Page</th>
                  <th>Facebook</th>
                  <th>Email</th>
                  <th>Best Contact</th>
                  <th>Next Action</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.business_name}</td>
                    <td>{lead.city || "—"}</td>
                    <td>{lead.category || "—"}</td>
                    <td>{lead.website_status || "unknown"}</td>
                    <td>{lead.opportunity_score ?? "—"}</td>
                    <td>
                      <LeadBucketBadge bucket={lead.lead_bucket} score={lead.opportunity_score} />
                    </td>
                    <td>
                      {lead.primary_problem || lead.detected_issue_summary || "Website needs manual review"}
                    </td>
                    <td>
                      {lead.why_it_matters || "Visitors may leave before taking action."}
                    </td>
                    <td>
                      {lead.best_pitch_angle || "Quick website improvements can help increase leads."}
                    </td>
                    <td>{lead.lead_type || "Needs Review"}</td>
                    <td>{lead.close_probability || "medium"}</td>
                    <td>{lead.phone_from_site || "—"}</td>
                    <td>{lead.contact_page || "—"}</td>
                    <td>{lead.facebook_url || "—"}</td>
                    <td>{lead.email || "—"}</td>
                    <td>{lead.best_contact_method || lead.contact_method}</td>
                    <td>{lead.recommended_next_action || "Review Site Manually"}</td>
                    <td>{prettyStatus(lead.status)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link href={leadHref(lead)} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Open Lead
                        </Link>
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline text-xs">
                            Open Website
                          </a>
                        ) : (
                          <span className="text-xs opacity-60">Open Website</span>
                        )}
                        {lead.related_case_id ? (
                          <Link href={`/admin/cases/${encodeURIComponent(lead.related_case_id)}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                            Open Case
                          </Link>
                        ) : (
                          <span className="text-xs opacity-60">Open Case</span>
                        )}
                        <Link href={leadHref(lead, "generate=1")} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Generate Email
                        </Link>
                        <Link href={leadHref(lead, "compose=1")} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Send Email
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {error ? (
        <p className="text-sm" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

