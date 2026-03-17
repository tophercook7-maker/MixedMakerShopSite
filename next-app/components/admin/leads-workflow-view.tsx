"use client";

import { useMemo, useState } from "react";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath } from "@/lib/lead-route";
import { getLeadPriorityBadges, leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";

const DEFAULT_SMS_TEMPLATE =
  "Hi, this is Topher with Topher's Web Design. I noticed a website opportunity that could help customers reach your business more easily. Want me to send you a quick example?";

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
  workspace_id?: string | null;
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
  best_contact_method?: "email" | "phone" | "contact_page" | "facebook" | "none" | null;
  primary_problem?: string | null;
  why_it_matters?: string | null;
  why_this_lead_is_here?: string | null;
  best_pitch_angle?: string | null;
  estimated_value?: "low" | "medium" | "high" | null;
  estimated_price_range?: "$" | "$$" | "$$$" | null;
  expected_close_probability?: number | null;
  email_pitch?: string | null;
  text_pitch?: string | null;
  door_pitch?: string | null;
  recommended_next_action?:
    | "Generate Email"
    | "Send First Touch"
    | "Open Contact Path"
    | "Save for Door-to-Door"
    | "Review Location"
    | "Review Website"
    | "Research Later"
    | "Skip For Now"
    | null;
  outreach_channel?: "email" | "contact" | "door_to_door" | "skip" | null;
  is_door_to_door_candidate?: boolean | null;
  website: string | null;
  email: string | null;
  email_source?: string | null;
  phone_from_site: string | null;
  contact_page: string | null;
  facebook_url?: string | null;
  google_review_count?: number | null;
  google_rating?: number | null;
  door_score?: number | null;
  distance_km?: number | null;
  contact_method: string;
  detected_issue_summary: string;
  detected_issues: string[];
  status:
    | "new"
    | "contacted"
    | "follow_up_due"
    | "replied"
    | "no_response"
    | "closed"
    | "closed_won"
    | "closed_lost"
    | "do_not_contact"
    | "research_later";
  created_at: string | null;
  screenshot_urls: string[];
  annotated_screenshot_url?: string | null;
  timeline: TimelineEntry[];
  notes: string[];
  is_hot_lead?: boolean | null;
  last_reply_at?: string | null;
  last_reply_preview?: string | null;
  conversion_score?: number | null;
  score_breakdown?: Record<string, unknown> | null;
  from_latest_scan?: boolean | null;
  is_archived?: boolean | null;
};

function leadHref(lead: Pick<WorkflowLead, "id" | "business_name">, query?: string): string {
  const base = buildLeadPath(lead.id, lead.business_name);
  return query ? `${base}?${query}` : base;
}

function actionDebug(action: string, payload: Record<string, unknown>) {
  console.info("[Action Debug]", action, payload);
}

function smsHref(rawPhone: string, businessName: string) {
  const phone = String(rawPhone || "").replace(/[^\d+]/g, "");
  const body = encodeURIComponent(
    DEFAULT_SMS_TEMPLATE.replace("a website opportunity", `a website opportunity for ${businessName || "your business"}`)
  );
  return `sms:${encodeURIComponent(phone)}?&body=${body}`;
}

function doorScoreClass(score: number | null | undefined): string {
  const s = Number(score || 0);
  if (s >= 80) return "admin-priority-door-green";
  if (s >= 60) return "admin-priority-door-yellow";
  if (s >= 40) return "admin-priority-door-orange";
  return "admin-priority-door-gray";
}

function valueClass(value: "low" | "medium" | "high" | null | undefined): string {
  if (value === "high") return "admin-priority-hot";
  if (value === "medium") return "admin-priority-easy";
  return "admin-priority-door-gray";
}

function conversionLabel(score: number | null | undefined): "High Conversion" | "Good Lead" | "Low Priority" | "Skip" {
  const s = Number(score || 0);
  if (s >= 80) return "High Conversion";
  if (s >= 60) return "Good Lead";
  if (s >= 40) return "Low Priority";
  return "Skip";
}

function websiteStatusDisplay(status: string | null | undefined): string {
  const s = String(status || "").trim().toLowerCase();
  if (s === "no_website") return "No Website";
  if (s === "broken_website" || s === "unreachable") return "Broken Website";
  if (s === "outdated_website") return "Outdated Design";
  if (s === "missing_contact_page") return "Missing Contact Info";
  if (s === "mobile_layout_issue") return "Not Mobile Friendly";
  if (s === "http_only") return "Insecure HTTP";
  if (s === "facebook_only") return "Facebook Only";
  return s ? s.replace(/_/g, " ") : "unknown";
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
    | "actionable_email"
    | "contact_available"
    | "door_to_door_candidates"
    | "low_priority"
    | "from_this_scan"
    | "archived"
    | "phone_leads"
    | "textable_leads"
    | "replies_waiting"
    | "no_website_email"
    | "broken_website_email"
    | "facebook_only_email"
    | "churches_email"
    | "no_email_research"
    | "all"
  >("actionable_email");
  const [error, setError] = useState<string | null>(null);
  const [selectedDoorLeadIds, setSelectedDoorLeadIds] = useState<string[]>([]);
  const [routePlan, setRoutePlan] = useState<WorkflowLead[]>([]);

  async function copyText(value: string, errorMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setError(null);
    } catch {
      setError(errorMessage);
    }
  }

  async function markTextSent(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    const existingNotes = Array.isArray(lead.notes) ? lead.notes : [];
    const nextNotes = [...existingNotes, `Text sent ${ts}`].join("\n");
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "contacted", notes: nextNotes }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(body.error || "Could not mark text as sent.");
      return;
    }
    setLeads((prev) =>
      prev.map((item) =>
        item.id === lead.id
          ? {
              ...item,
              status: "contacted",
              notes: [...existingNotes, `Text sent ${ts}`],
            }
          : item
      )
    );
    setError(null);
  }

  function mapDirectionsHref(lead: WorkflowLead): string {
    const target = [lead.business_name, lead.address || "", lead.city || ""]
      .map((v) => String(v || "").trim())
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
  }

  async function appendLeadNoteAndStatus(lead: WorkflowLead, note: string, status?: WorkflowLead["status"]) {
    const existingNotes = Array.isArray(lead.notes) ? lead.notes : [];
    const nextNotes = [...existingNotes, note].join("\n");
    const payload: Record<string, unknown> = { notes: nextNotes };
    if (status) payload.status = status;
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(body.error || "Could not update lead.");
      return;
    }
    setLeads((prev) =>
      prev.map((item) =>
        item.id === lead.id
          ? { ...item, notes: [...existingNotes, note], status: status || item.status }
          : item
      )
    );
    setError(null);
  }

  async function markVisited(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    await appendLeadNoteAndStatus(lead, `Door-to-door visited ${ts}`, "contacted");
  }

  async function markInterested(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    await appendLeadNoteAndStatus(lead, `Door-to-door interested ${ts}`, "follow_up_due");
  }

  async function addDoorNote(lead: WorkflowLead) {
    const note = window.prompt("Add note for this door-to-door lead:");
    if (!note || !note.trim()) return;
    await appendLeadNoteAndStatus(lead, `Door note: ${note.trim()}`);
  }

  function toggleDoorLeadSelection(leadId: string) {
    setSelectedDoorLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  }

  function buildRoute() {
    const selected = filtered.filter((lead) => selectedDoorLeadIds.includes(lead.id));
    const planned = [...selected].sort((a, b) => {
      const aDistance = Number((a as WorkflowLead & { distance_km?: number | null }).distance_km ?? Number.POSITIVE_INFINITY);
      const bDistance = Number((b as WorkflowLead & { distance_km?: number | null }).distance_km ?? Number.POSITIVE_INFINITY);
      if (Number.isFinite(aDistance) || Number.isFinite(bDistance)) return aDistance - bDistance;
      return Number(b.door_score || 0) - Number(a.door_score || 0);
    });
    setRoutePlan(planned);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bySegment = leads.filter((lead) => {
      const ws = String(lead.website_status || "").toLowerCase();
      const cat = String(lead.category || "").toLowerCase();
      const hasEmail = Boolean(String(lead.email || "").trim());
      const hasContactAvailable = Boolean(String(lead.contact_page || "").trim() || String(lead.facebook_url || "").trim());
      const archived = Boolean(lead.is_archived);
      const hasRequired = Boolean(
        String(lead.business_name || "").trim() &&
          String(lead.workspace_id || "").trim() &&
          String(lead.detected_issue_summary || "").trim() &&
          hasEmail
      );
      if (segment === "actionable_email") return hasRequired && !archived;
      if (segment === "contact_available") return !hasEmail && hasContactAvailable;
      if (segment === "door_to_door_candidates")
        return String(lead.outreach_channel || "").trim() === "door_to_door" || Boolean(lead.is_door_to_door_candidate);
      if (segment === "low_priority") return String(lead.outreach_channel || "").trim() === "skip";
      if (segment === "from_this_scan") return Boolean(lead.from_latest_scan) && !archived;
      if (segment === "archived") return archived || String(lead.outreach_channel || "").trim() === "skip";
      if (segment === "phone_leads") return Boolean(String(lead.phone_from_site || "").trim());
      if (segment === "textable_leads") return Boolean(String(lead.phone_from_site || "").trim()) && !hasEmail;
      if (segment === "replies_waiting") return lead.status === "replied" || Boolean(lead.is_hot_lead);
      if (segment === "no_website_email") return hasRequired && ws === "no_website";
      if (segment === "broken_website_email") return hasRequired && ws === "broken_website";
      if (segment === "facebook_only_email") return hasRequired && ws === "facebook_only";
      if (segment === "churches_email") return hasRequired && cat.includes("church");
      if (segment === "no_email_research") return !hasEmail || lead.status === "research_later";
      return true;
    });
    const searched = !q
      ? bySegment
      : bySegment.filter((lead) =>
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
    if (segment === "door_to_door_candidates") {
      return [...searched].sort((a, b) => Number(b.door_score || 0) - Number(a.door_score || 0));
    }
    return [...searched].sort((a, b) => {
      const conversionDelta = Number(b.conversion_score || 0) - Number(a.conversion_score || 0);
      if (conversionDelta !== 0) return conversionDelta;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [leads, search, segment]);

  const queueCounts = useMemo(() => {
    const counts = {
      totalStoredLeads: leads.length,
      actionableNow: 0,
      newToday: 0,
      fromThisScan: 0,
      researchLater: 0,
      doorToDoor: 0,
      archived: 0,
    };
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    for (const lead of leads) {
      const s = String(lead.status || "").toLowerCase();
      const hasEmail = Boolean(String(lead.email || "").trim());
      const isActionable = hasEmail && !Boolean(lead.is_archived);
      const isDoor =
        String(lead.outreach_channel || "").trim() === "door_to_door" || Boolean(lead.is_door_to_door_candidate);
      const createdAt = new Date(lead.created_at || 0).getTime();
      if (isActionable) counts.actionableNow += 1;
      if (createdAt >= todayStart.getTime()) counts.newToday += 1;
      if (Boolean(lead.from_latest_scan)) counts.fromThisScan += 1;
      if (s === "research_later") counts.researchLater += 1;
      if (isDoor) counts.doorToDoor += 1;
      if (Boolean(lead.is_archived) || String(lead.outreach_channel || "").trim() === "skip") counts.archived += 1;
    }
    return counts;
  }, [leads]);
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Total Stored Leads</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.totalStoredLeads}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Actionable Now</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.actionableNow}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>New Today</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.newToday}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>From This Scan</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.fromThisScan}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Archived</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.archived}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Research Later</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.researchLater}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Door-to-Door</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.doorToDoor}</p>
        </div>
      </section>

      {segment === "door_to_door_candidates" ? (
        <section className="admin-card">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="admin-btn-primary text-xs" onClick={buildRoute}>
              Build Route
            </button>
            <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Selected: {selectedDoorLeadIds.length}
            </span>
          </div>
          {routePlan.length > 0 ? (
            <ol className="mt-3 list-decimal pl-5 space-y-1 text-sm" style={{ color: "var(--admin-muted)" }}>
              {routePlan.map((lead) => (
                <li key={`route-${lead.id}`}>
                  {lead.business_name} - {lead.address || "No address"}{" "}
                  <a href={mapDirectionsHref(lead)} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                    Map
                  </a>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      ) : null}

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
              ["actionable_email", "Actionable Now"],
              ["from_this_scan", "From This Scan"],
              ["archived", "Archived"],
              ["contact_available", "Contact Available"],
              ["door_to_door_candidates", "Door-to-Door Candidates"],
              ["low_priority", "Low Priority / Skip"],
              ["phone_leads", "Phone Leads"],
              ["textable_leads", "Textable Leads"],
              ["replies_waiting", "Replies Waiting"],
              ["no_website_email", "No Website + Email"],
              ["broken_website_email", "Broken Website + Email"],
              ["facebook_only_email", "Facebook Only + Email"],
              ["churches_email", "Churches + Email"],
              ["no_email_research", "No Email / Research Later"],
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
              {leads.length > 0
                ? "Current filters hide all leads. Switch to All or clear search."
                : emptyStateReason || "Try a different search query."}
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
                      {lead.city || "—"} · {lead.category || "—"} · Score {lead.opportunity_score ?? "—"} · Website {websiteStatusDisplay(lead.website_status)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      <span className="font-semibold text-base">Conversion {Number(lead.conversion_score || 0)}</span> · {conversionLabel(lead.conversion_score)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`admin-badge ${leadStatusClass(lead.status)}`}>{prettyLeadStatus(lead.status)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getLeadPriorityBadges({
                    isHotLead: Boolean(lead.is_hot_lead),
                    bucket: lead.lead_bucket || null,
                    score: lead.opportunity_score,
                    email: lead.email,
                    phone: lead.phone_from_site,
                  }).map((badge) => (
                    <span key={`${lead.id}-${badge.key}`} className={`admin-priority-badge ${badge.className}`}>
                      {badge.label}
                    </span>
                  ))}
                  <span className={`admin-priority-badge ${valueClass(lead.estimated_value)}`}>
                    Value {String(lead.estimated_value || "low").toUpperCase()} {lead.estimated_price_range || "$"}
                  </span>
                </div>
                <div className="space-y-1 text-xs" style={{ color: "var(--admin-muted)" }}>
                  {(() => {
                    const latestInbound = (lead.timeline || []).find((item) => String(item.direction || "").toLowerCase() === "inbound");
                    const replyPreview =
                      String(lead.last_reply_preview || latestInbound?.body || "").replace(/\s+/g, " ").trim().slice(0, 160);
                    const replyAt = String(lead.last_reply_at || latestInbound?.occurred_at || "").trim();
                    if (!replyPreview && !replyAt) return null;
                    return (
                      <p>
                        <span className="font-semibold">Latest reply:</span> {replyPreview || "Reply received"} {replyAt ? `(${new Date(replyAt).toLocaleString()})` : ""}
                      </p>
                    );
                  })()}
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
                    <span className="font-semibold">Estimated value:</span> {lead.estimated_value || "low"} ({lead.estimated_price_range || "$"}) · Close {lead.expected_close_probability ?? "—"}%
                  </p>
                  <p>
                    <span className="font-semibold">What is wrong:</span> {lead.primary_problem || lead.detected_issue_summary || "Contact info is hard to find"}
                  </p>
                  <p>
                    <span className="font-semibold">Why it matters:</span> {lead.why_it_matters || "Visitors may leave before taking action."}
                  </p>
                  <p>
                    <span className="font-semibold">Why this lead is here:</span> {lead.why_this_lead_is_here || "Clear website improvement opportunity."}
                  </p>
                  <p>
                    <span className="font-semibold">Business profile:</span> {lead.category || "—"} · {lead.city || "—"} · {lead.address || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Website:</span> {lead.website || "—"} ({websiteStatusDisplay(lead.website_status)})
                  </p>
                  <p>
                    <span className="font-semibold">Best contact:</span> {lead.best_contact_method || lead.contact_method || "none"}
                  </p>
                  <p>
                    <span className="font-semibold">What to say:</span> {lead.best_pitch_angle || "Quick website improvements can help increase leads."}
                  </p>
                  <p>
                    <span className="font-semibold">What to do next:</span> {lead.recommended_next_action || "Review Website"}
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
                    <span className="font-semibold">Google reviews:</span> {lead.google_review_count ?? "—"} · Rating {lead.google_rating ?? "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {lead.email || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Email source:</span> {lead.email_source || "unknown"}
                  </p>
                  {!lead.email ? (
                    <p style={{ color: "#fca5a5" }}>No Email Found</p>
                  ) : null}
                  {!lead.email && !lead.contact_page && !lead.facebook_url && !lead.phone_from_site ? (
                    <p style={{ color: "#fca5a5" }}>No Contact Path</p>
                  ) : null}
                  {lead.outreach_channel === "door_to_door" ? (
                    <p style={{ color: "#5eead4" }}>
                      Worth a selective in-person check later.
                      {" "}
                      <span className={`admin-priority-badge ${doorScoreClass(lead.door_score)}`}>
                        Door Score {Number(lead.door_score || 0)}
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(() => {
                    const hasContactPath = Boolean(
                      lead.email || lead.contact_page || lead.facebook_url || lead.phone_from_site
                    );
                    return (
                      <>
                  <a href={leadHref(lead)} className="admin-btn-primary text-xs">
                    {lead.recommended_next_action || "Review Lead"}
                  </a>
                  <a
                    href={leadHref(lead)}
                    className="admin-btn-primary text-xs"
                    onClick={() => actionDebug("Open Lead clicked", { leadId: lead.id })}
                  >
                    Open Lead
                  </a>
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-ghost text-xs"
                      onClick={() => actionDebug("Open Website clicked", { leadId: lead.id, website: lead.website })}
                    >
                      Open Website
                    </a>
                  ) : (
                    <span className="admin-btn-ghost text-xs opacity-60 cursor-not-allowed">No website found</span>
                  )}
                  {lead.related_case_id ? (
                    <a
                      href={`/admin/cases/${encodeURIComponent(lead.related_case_id)}`}
                      className="admin-btn-ghost text-xs"
                      onClick={() => actionDebug("Open Case clicked", { leadId: lead.id, caseId: lead.related_case_id })}
                    >
                      Open Case
                    </a>
                  ) : (
                    <span className="admin-btn-ghost text-xs opacity-60 cursor-not-allowed">No case yet</span>
                  )}
                  <a
                    href={leadHref(lead, "generate=1")}
                    className="admin-btn-ghost text-xs"
                    aria-disabled={!hasContactPath}
                    onClick={(event) => {
                      if (!hasContactPath) {
                        event.preventDefault();
                        actionDebug("Generate Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                        return;
                      }
                      actionDebug("Generate Email clicked", { leadId: lead.id });
                    }}
                  >
                    Generate Email
                  </a>
                  <a
                    href={leadHref(lead, "compose=1")}
                    className="admin-btn-ghost text-xs"
                    aria-disabled={!hasContactPath}
                    onClick={(event) => {
                      if (!hasContactPath) {
                        event.preventDefault();
                        actionDebug("Send Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                        return;
                      }
                      actionDebug("Send Email clicked", { leadId: lead.id });
                    }}
                  >
                    Send Email
                  </a>
                  {lead.phone_from_site ? (
                    <>
                      <a
                        href={smsHref(lead.phone_from_site, lead.business_name)}
                        className="admin-btn-ghost text-xs"
                        onClick={() => actionDebug("Text from Mac clicked", { leadId: lead.id, phone: lead.phone_from_site })}
                      >
                        Text from Mac
                      </a>
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs"
                        onClick={() => void copyText(String(lead.phone_from_site || ""), "Could not copy number.")}
                      >
                        Copy Number
                      </button>
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs"
                        onClick={() =>
                          void copyText(
                            DEFAULT_SMS_TEMPLATE.replace(
                              "a website opportunity",
                              `a website opportunity for ${lead.business_name || "your business"}`
                            ),
                            "Could not copy text script."
                          )
                        }
                      >
                        Copy Text Script
                      </button>
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs"
                        onClick={() => void markTextSent(lead)}
                      >
                        Mark Text Sent
                      </button>
                    </>
                  ) : null}
                  {lead.outreach_channel === "door_to_door" ? (
                    <>
                      <a
                        href={mapDirectionsHref(lead)}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn-ghost text-xs"
                      >
                        Open Map / Directions
                      </a>
                      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void markVisited(lead)}>
                        Mark Visited
                      </button>
                      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void markInterested(lead)}>
                        Mark Interested
                      </button>
                      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void addDoorNote(lead)}>
                        Add Notes
                      </button>
                      <label className="admin-btn-ghost text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDoorLeadIds.includes(lead.id)}
                          onChange={() => toggleDoorLeadSelection(lead.id)}
                          style={{ marginRight: 6 }}
                        />
                        Select for Route
                      </label>
                    </>
                  ) : null}
                  {lead.status === "replied" || lead.is_hot_lead ? (
                    <>
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs"
                        onClick={() => {
                          const latestInbound = (lead.timeline || []).find((item) => String(item.direction || "").toLowerCase() === "inbound");
                          const text = String(lead.last_reply_preview || latestInbound?.body || "").trim();
                          if (!text) return;
                          navigator.clipboard.writeText(text).catch(() => undefined);
                        }}
                      >
                        Copy Reply
                      </button>
                      <a href={`/book?lead=${encodeURIComponent(lead.id)}`} className="admin-btn-ghost text-xs">
                        Send Booking Link
                      </a>
                    </>
                  ) : null}
                      </>
                    );
                  })()}
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
                  <th>Conversion</th>
                  <th>Lead Bucket</th>
                  <th>Opportunity Reason</th>
                  <th>Why It Matters</th>
                  <th>What To Say</th>
                  <th>Address</th>
                  <th>Website</th>
                  <th>Lead Type</th>
                  <th>Close Probability</th>
                  <th>Est. Value</th>
                  <th>Price</th>
                  <th>Close %</th>
                  <th>Phone</th>
                  <th>Contact Page</th>
                  <th>Facebook</th>
                  <th>Email</th>
                  <th>Email Source</th>
                  <th>Reviews</th>
                  <th>Rating</th>
                  <th>Door Score</th>
                  <th>Best Contact</th>
                  <th>Channel</th>
                  <th>Next Action</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    {(() => {
                      const hasContactPath = Boolean(
                        lead.email || lead.contact_page || lead.facebook_url || lead.phone_from_site
                      );
                      return (
                        <>
                    <td>{lead.business_name}</td>
                    <td>{lead.city || "—"}</td>
                    <td>{lead.category || "—"}</td>
                    <td>{websiteStatusDisplay(lead.website_status)}</td>
                    <td>{lead.opportunity_score ?? "—"}</td>
                    <td>{Number(lead.conversion_score || 0)} · {conversionLabel(lead.conversion_score)}</td>
                    <td>
                      <LeadBucketBadge bucket={lead.lead_bucket} score={lead.opportunity_score} />
                    </td>
                    <td>
                      {lead.primary_problem || lead.detected_issue_summary || "Contact info is hard to find"}
                    </td>
                    <td>
                      {lead.why_it_matters || "Visitors may leave before taking action."}
                    </td>
                    <td>
                      {lead.best_pitch_angle || "Quick website improvements can help increase leads."}
                    </td>
                    <td>{lead.address || "—"}</td>
                    <td>{lead.website || "—"}</td>
                    <td>{lead.lead_type || "Needs Review"}</td>
                    <td>{lead.close_probability || "medium"}</td>
                    <td>{lead.estimated_value || "low"}</td>
                    <td>{lead.estimated_price_range || "$"}</td>
                    <td>{lead.expected_close_probability ?? "—"}</td>
                    <td>{lead.phone_from_site || "—"}</td>
                    <td>{lead.contact_page || "—"}</td>
                    <td>{lead.facebook_url || "—"}</td>
                    <td>{lead.email || "No Email Found"}</td>
                    <td>{lead.email_source || "No Email Found"}</td>
                    <td>{lead.google_review_count ?? "—"}</td>
                    <td>{lead.google_rating ?? "—"}</td>
                    <td>
                      <span className={`admin-priority-badge ${doorScoreClass(lead.door_score)}`}>
                        {Number(lead.door_score || 0)}
                      </span>
                    </td>
                    <td>{lead.best_contact_method || lead.contact_method || "none"}</td>
                    <td>{lead.outreach_channel || "skip"}</td>
                    <td>{lead.recommended_next_action || "Review Website"}</td>
                    <td>
                      <span className={`admin-badge ${leadStatusClass(lead.status)}`}>{prettyLeadStatus(lead.status)}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getLeadPriorityBadges({
                          isHotLead: Boolean(lead.is_hot_lead),
                          bucket: lead.lead_bucket || null,
                          score: lead.opportunity_score,
                          email: lead.email,
                          phone: lead.phone_from_site,
                        }).map((badge) => (
                          <span key={`${lead.id}-table-${badge.key}`} className={`admin-priority-badge ${badge.className}`}>
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={leadHref(lead)}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={() => actionDebug("Open Lead clicked", { leadId: lead.id })}
                        >
                          Open Lead
                        </a>
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--admin-gold)] hover:underline text-xs"
                            onClick={() => actionDebug("Open Website clicked", { leadId: lead.id, website: lead.website })}
                          >
                            Open Website
                          </a>
                        ) : (
                          <span className="text-xs opacity-60">No website found</span>
                        )}
                        {lead.related_case_id ? (
                          <a
                            href={`/admin/cases/${encodeURIComponent(lead.related_case_id)}`}
                            className="text-[var(--admin-gold)] hover:underline text-xs"
                            onClick={() => actionDebug("Open Case clicked", { leadId: lead.id, caseId: lead.related_case_id })}
                          >
                            Open Case
                          </a>
                        ) : (
                          <span className="text-xs opacity-60">No case yet</span>
                        )}
                        <a
                          href={leadHref(lead, "generate=1")}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={(event) => {
                            if (!hasContactPath) {
                              event.preventDefault();
                              actionDebug("Generate Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                              return;
                            }
                            actionDebug("Generate Email clicked", { leadId: lead.id });
                          }}
                        >
                          Generate Email
                        </a>
                        <a
                          href={leadHref(lead, "compose=1")}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={(event) => {
                            if (!hasContactPath) {
                              event.preventDefault();
                              actionDebug("Send Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                              return;
                            }
                            actionDebug("Send Email clicked", { leadId: lead.id });
                          }}
                        >
                          Send Email
                        </a>
                        {lead.phone_from_site ? (
                          <>
                            <a
                              href={smsHref(lead.phone_from_site, lead.business_name)}
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                            >
                              Text from Mac
                            </a>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void copyText(String(lead.phone_from_site || ""), "Could not copy number.")}
                            >
                              Copy Number
                            </button>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() =>
                                void copyText(
                                  DEFAULT_SMS_TEMPLATE.replace(
                                    "a website opportunity",
                                    `a website opportunity for ${lead.business_name || "your business"}`
                                  ),
                                  "Could not copy text script."
                                )
                              }
                            >
                              Copy Text Script
                            </button>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void markTextSent(lead)}
                            >
                              Mark Text Sent
                            </button>
                          </>
                        ) : null}
                        {lead.outreach_channel === "door_to_door" ? (
                          <>
                            <a
                              href={mapDirectionsHref(lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                            >
                              Open Map / Directions
                            </a>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void markVisited(lead)}
                            >
                              Mark Visited
                            </button>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void markInterested(lead)}
                            >
                              Mark Interested
                            </button>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void addDoorNote(lead)}
                            >
                              Add Notes
                            </button>
                            <label className="text-[var(--admin-gold)] hover:underline text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedDoorLeadIds.includes(lead.id)}
                                onChange={() => toggleDoorLeadSelection(lead.id)}
                                style={{ marginRight: 6 }}
                              />
                              Select for Route
                            </label>
                          </>
                        ) : null}
                        {(lead.status === "replied" || lead.is_hot_lead) ? (
                          <button
                            type="button"
                            className="text-[var(--admin-gold)] hover:underline text-xs"
                            onClick={() => {
                              const latestInbound = (lead.timeline || []).find((item) => String(item.direction || "").toLowerCase() === "inbound");
                              const text = String(lead.last_reply_preview || latestInbound?.body || "").trim();
                              if (!text) return;
                              navigator.clipboard.writeText(text).catch(() => undefined);
                            }}
                          >
                            Copy Reply
                          </button>
                        ) : null}
                        {(lead.status === "replied" || lead.is_hot_lead) ? (
                          <a
                            href={`/book?lead=${encodeURIComponent(lead.id)}`}
                            className="text-[var(--admin-gold)] hover:underline text-xs"
                          >
                            Send Booking Link
                          </a>
                        ) : null}
                      </div>
                    </td>
                        </>
                      );
                    })()}
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

