"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
  website_status?: string | null;
  opportunity_score: number | null;
  close_probability?: "low" | "medium" | "high" | null;
  website: string | null;
  email: string | null;
  phone_from_site: string | null;
  contact_page: string | null;
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
  const error: string | null = null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) =>
      [
        lead.business_name,
        lead.category || "",
        lead.status,
        lead.website || "",
        lead.contact_method || "",
        lead.detected_issue_summary || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [leads, search]);

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
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{lead.business_name}</h3>
                    <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      {lead.category || "—"} · Score {lead.opportunity_score ?? "—"} · Website {lead.website_status || "unknown"}
                    </p>
                  </div>
                  <span className={badgeClass(lead.status)}>{prettyStatus(lead.status)}</span>
                </div>
                <div className="space-y-1 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <p>
                    <span className="font-semibold">Opportunity reason:</span> {lead.detected_issue_summary || "Website improvement opportunity"}
                  </p>
                  <p>
                    <span className="font-semibold">Best contact:</span> {lead.contact_method}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {lead.phone_from_site || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Contact page:</span> {lead.contact_page || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {lead.email || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/admin/leads/${encodeURIComponent(lead.id)}`} className="admin-btn-primary text-xs">
                    Open Lead
                  </Link>
                  {lead.related_case_id ? (
                    <Link href={`/admin/cases/${encodeURIComponent(lead.related_case_id)}`} className="admin-btn-ghost text-xs">
                      Open Case
                    </Link>
                  ) : (
                    <span className="admin-btn-ghost text-xs opacity-60 cursor-not-allowed">Open Case</span>
                  )}
                  <Link href={`/admin/leads/${encodeURIComponent(lead.id)}?generate=1`} className="admin-btn-ghost text-xs">
                    Generate Email
                  </Link>
                  <Link href={`/admin/leads/${encodeURIComponent(lead.id)}?compose=1`} className="admin-btn-ghost text-xs">
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
                  <th>Category</th>
                  <th>Website Status</th>
                  <th>Score</th>
                  <th>Opportunity Reason</th>
                  <th>Phone</th>
                  <th>Contact Page</th>
                  <th>Email</th>
                  <th>Best Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.business_name}</td>
                    <td>{lead.category || "—"}</td>
                    <td>{lead.website_status || "unknown"}</td>
                    <td>{lead.opportunity_score ?? "—"}</td>
                    <td>
                      {lead.detected_issue_summary || "Website improvement opportunity"}
                    </td>
                    <td>{lead.phone_from_site || "—"}</td>
                    <td>{lead.contact_page || "—"}</td>
                    <td>{lead.email || "—"}</td>
                    <td>{lead.contact_method}</td>
                    <td>{prettyStatus(lead.status)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/leads/${encodeURIComponent(lead.id)}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Open Lead
                        </Link>
                        {lead.related_case_id ? (
                          <Link href={`/admin/cases/${encodeURIComponent(lead.related_case_id)}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                            Open Case
                          </Link>
                        ) : (
                          <span className="text-xs opacity-60">Open Case</span>
                        )}
                        <Link href={`/admin/leads/${encodeURIComponent(lead.id)}?generate=1`} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Generate Email
                        </Link>
                        <Link href={`/admin/leads/${encodeURIComponent(lead.id)}?compose=1`} className="text-[var(--admin-gold)] hover:underline text-xs">
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

