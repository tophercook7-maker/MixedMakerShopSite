"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath } from "@/lib/lead-route";
import { getLeadPriorityBadges, leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";
import { verifyLeadBeforeNavigation } from "@/lib/lead-navigation";
import { LeadForm } from "@/components/admin/lead-form";

const DEFAULT_SMS_TEMPLATE =
  "Hi, this is Topher with Topher's Web Design. I noticed a website opportunity that could help customers reach your business more easily. Want me to send you a quick example?";

type FollowUpStatus = "pending" | "completed";

const FOLLOW_UP_TEMPLATES: Record<number, string> = {
  1: "Hey, just wanted to follow up real quick — did you get a chance to check out that sample I sent?\n\nNo rush, just wanted to make sure it didn’t get buried 👍",
  2: "Hey, just circling back — even something simple like that sample can help you get more calls and make things easier for customers to reach you.\n\nIf you want, I can build it out pretty quickly.",
  3: "Hey, I’ll leave you alone after this 😄\n\nIf you ever want a site like that sample set up, just let me know — I can get it done quick.\n\nEither way, wishing you the best 👍",
};

function followUpDelayDaysForStage(stage: number): number {
  if (stage <= 1) return 2;
  if (stage === 2) return 5;
  return 10;
}

function nextFollowUpIsoFromStage(stage: number): string {
  const now = new Date();
  now.setDate(now.getDate() + followUpDelayDaysForStage(stage));
  return now.toISOString();
}

function clampFollowUpStage(value: unknown): number {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(3, Math.floor(num)));
}

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
  source?: "server" | "local" | "optimistic";
  isLocalOnly?: boolean;
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
  lead_bucket?: "Easy Win" | "High Value" | "Good Prospect" | "Needs Review" | "Low Priority" | "door_to_door" | null;
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
    | "follow_up"
    | "replied"
    | "won"
    | "no_response"
    | "not_interested"
    | "archived";
  created_at: string | null;
  screenshot_urls: string[];
  annotated_screenshot_url?: string | null;
  timeline: TimelineEntry[];
  notes: string[];
  is_hot_lead?: boolean | null;
  last_reply_at?: string | null;
  last_reply_preview?: string | null;
  last_contacted_at?: string | null;
  follow_up_stage?: number;
  next_follow_up_at?: string | null;
  follow_up_status?: FollowUpStatus;
  conversion_score?: number | null;
  score_breakdown?: Record<string, unknown> | null;
  from_latest_scan?: boolean | null;
  is_archived?: boolean | null;
  is_manual?: boolean | null;
  visual_business?: boolean | null;
  known_owner_name?: string | null;
  known_context?: string | null;
  door_status?: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost" | null;
  last_updated_at?: string | null;
};

function leadHref(lead: Pick<WorkflowLead, "id" | "business_name">, query?: string): string {
  const base = buildLeadPath(lead.id, lead.business_name);
  return query ? `${base}?${query}` : base;
}

function previewHref(lead: Pick<WorkflowLead, "id">): string {
  return `/preview/${encodeURIComponent(lead.id)}`;
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

function prettyDoorStatus(status: WorkflowLead["door_status"]): string {
  return String(status || "not_visited").replace(/_/g, " ");
}

function doorStatusRank(status: WorkflowLead["door_status"]): number {
  const normalized = String(status || "not_visited");
  if (normalized === "planned") return 0;
  if (normalized === "not_visited") return 1;
  if (normalized === "follow_up") return 2;
  if (normalized === "visited") return 3;
  if (normalized === "closed_won") return 4;
  if (normalized === "closed_lost") return 5;
  return 6;
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

function isLocalOnlyLead(lead: Pick<WorkflowLead, "id" | "source" | "isLocalOnly">): boolean {
  return (
    Boolean(lead.isLocalOnly) ||
    String(lead.source || "") === "local" ||
    String(lead.source || "") === "optimistic" ||
    String(lead.id || "").startsWith("local-") ||
    String(lead.id || "").startsWith("optimistic-")
  );
}

export function LeadsWorkflowView({
  initialLeads,
  emptyStateReason,
  initialAddOpen = false,
}: {
  initialLeads: WorkflowLead[];
  emptyStateReason?: string;
  initialAddOpen?: boolean;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<WorkflowLead[]>(initialLeads);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<
    | "new"
    | "follow_up"
    | "replied"
    | "closed"
    | "all"
  >("new");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [scoutQualityFilter, setScoutQualityFilter] = useState<
    "all" | "high_conversion" | "visual_business" | "no_website"
  >("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedDoorLeadIds, setSelectedDoorLeadIds] = useState<string[]>([]);
  const [routePlan, setRoutePlan] = useState<WorkflowLead[]>([]);
  const [adding, setAdding] = useState(false);
  const [addOpenHandled, setAddOpenHandled] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [optimisticLeads, setOptimisticLeads] = useState<WorkflowLead[]>([]);
  const [localFallbackLeads, setLocalFallbackLeads] = useState<WorkflowLead[]>([]);
  const LOCAL_WORKFLOW_LEADS_KEY = "mixedmakershop.local_workflow_leads";

  function withLeadSource(lead: WorkflowLead, source: "server" | "local" | "optimistic"): WorkflowLead {
    return {
      ...lead,
      source,
      isLocalOnly: source !== "server",
    };
  }

  useEffect(() => {
    setLeads(initialLeads.map((lead) => withLeadSource(lead, "server")));
    setSelectedDoorLeadIds([]);
    setRoutePlan([]);
  }, [initialLeads]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_WORKFLOW_LEADS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WorkflowLead[];
      if (Array.isArray(parsed)) {
        setLocalFallbackLeads(parsed.map((lead) => withLeadSource(lead, "local")));
      }
    } catch {
      // Ignore malformed fallback payloads.
    }
  }, []);

  useEffect(() => {
    console.info("[LeadsWorkflowView] Add Lead modal state changed", { isOpen: adding });
  }, [adding]);

  useEffect(() => {
    if (!initialAddOpen || addOpenHandled) return;
    console.info("[LeadsWorkflowView] Initial add=1 detected, opening Add Lead modal");
    setAdding(true);
    setAddOpenHandled(true);
    router.replace("/admin/leads");
  }, [addOpenHandled, initialAddOpen, router]);

  function persistFallbackLeads(nextLeads: WorkflowLead[]) {
    try {
      localStorage.setItem(LOCAL_WORKFLOW_LEADS_KEY, JSON.stringify(nextLeads));
    } catch {
      // Ignore storage write failures.
    }
  }

  function toWorkflowLeadFromPayload(
    payload: Record<string, unknown>,
    options?: {
      fallbackId?: string;
      source?: "server" | "local" | "optimistic";
    }
  ): WorkflowLead {
    const source = options?.source || "server";
    const now = new Date().toISOString();
    const statusRaw = String(payload.status || "new")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const normalizedStatus =
      statusRaw === "follow_up_due"
        ? "follow_up"
        : statusRaw === "closed_won"
          ? "won"
          : statusRaw === "closed_lost"
            ? "no_response"
            : statusRaw === "do_not_contact"
              ? "not_interested"
              : statusRaw === "research_later"
                ? "archived"
                : statusRaw;
    const status = (
      normalizedStatus === "new" ||
      normalizedStatus === "contacted" ||
      normalizedStatus === "follow_up" ||
      normalizedStatus === "replied" ||
      normalizedStatus === "won" ||
      normalizedStatus === "no_response" ||
      normalizedStatus === "not_interested" ||
      normalizedStatus === "archived"
        ? normalizedStatus
        : "new"
    ) as WorkflowLead["status"];
    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || payload.phone_from_site || "").trim();
    const contactPage = String(payload.contact_page || "").trim();
    const facebook = String(payload.facebook_url || "").trim();
    const hasEmail = Boolean(email);
    const hasContactAvailable = Boolean(contactPage || facebook || phone);
    return {
      id: String(payload.id || options?.fallbackId || `local-${Date.now()}`),
      source,
      isLocalOnly: source !== "server",
      workspace_id: String(payload.workspace_id || "").trim() || null,
      related_case_id: null,
      lead_source: String(payload.lead_source || "").trim() || "manual",
      opportunity_id: null,
      business_name: String(payload.business_name || "").trim() || "Untitled business",
      category: String(payload.category || payload.industry || "").trim() || null,
      city: String(payload.city || "").trim() || null,
      address: String(payload.address || "").trim() || null,
      website_status: String(payload.website_status || "").trim() || null,
      opportunity_score: payload.opportunity_score == null ? null : Number(payload.opportunity_score),
      lead_bucket: canonicalLeadBucket(String(payload.lead_bucket || "").trim() || null, payload.opportunity_score as number | null),
      close_probability: "medium",
      lead_type: hasEmail ? "Easy Win" : "Needs Review",
      best_contact_method: hasEmail ? "email" : hasContactAvailable ? "contact_page" : "none",
      primary_problem: null,
      why_it_matters: null,
      why_this_lead_is_here: null,
      best_pitch_angle: null,
      estimated_value: "low",
      estimated_price_range: "$",
      expected_close_probability: null,
      email_pitch: null,
      text_pitch: null,
      door_pitch: null,
      recommended_next_action: hasEmail ? "Generate Email" : hasContactAvailable ? "Open Contact Path" : "Research Later",
      outreach_channel: hasEmail ? "email" : hasContactAvailable ? "contact" : "skip",
      is_door_to_door_candidate: false,
      website: String(payload.website || "").trim() || null,
      email: email || null,
      email_source: String(payload.email_source || "").trim() || (email ? "manual" : "No Email Found"),
      phone_from_site: phone || null,
      contact_page: contactPage || null,
      facebook_url: facebook || null,
      google_review_count: null,
      google_rating: null,
      door_score: null,
      distance_km: null,
      contact_method: hasEmail ? "email" : hasContactAvailable ? "contact_available" : "No Contact Path",
      detected_issue_summary: String(payload.opportunity_reason || "").trim() || "Manual lead",
      detected_issues: [],
      status,
      created_at: String(payload.created_at || "").trim() || now,
      screenshot_urls: [],
      annotated_screenshot_url: null,
      timeline: [],
      notes: String(payload.notes || "").trim() ? [String(payload.notes).trim()] : [],
      is_hot_lead: false,
      last_reply_at: null,
      last_reply_preview: null,
      last_contacted_at: String(payload.last_contacted_at || "").trim() || null,
      follow_up_stage: clampFollowUpStage(payload.follow_up_stage),
      next_follow_up_at: String(payload.next_follow_up_at || "").trim() || null,
      follow_up_status:
        String(payload.follow_up_status || "").trim().toLowerCase() === "completed" ? "completed" : "pending",
      conversion_score: null,
      score_breakdown: null,
      from_latest_scan: false,
      is_archived: false,
      is_manual: true,
      visual_business: false,
      known_owner_name: String(payload.known_owner_name || "").trim() || null,
      known_context: String(payload.known_context || "").trim() || null,
      door_status:
        String(payload.door_status || "").trim() === "planned" ||
        String(payload.door_status || "").trim() === "visited" ||
        String(payload.door_status || "").trim() === "follow_up" ||
        String(payload.door_status || "").trim() === "closed_won" ||
        String(payload.door_status || "").trim() === "closed_lost"
          ? (String(payload.door_status).trim() as WorkflowLead["door_status"])
          : "not_visited",
      last_updated_at: now,
    };
  }

  async function createLead(payload: Record<string, unknown>) {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticLead = toWorkflowLeadFromPayload(payload, {
      fallbackId: optimisticId,
      source: "optimistic",
    });
    console.info("[LeadsWorkflowView] Add Lead save start", { optimistic_id: optimisticId, payload });
    setOptimisticLeads((prev) => [optimisticLead, ...prev.filter((lead) => lead.id !== optimisticId)]);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      console.info("[LeadsWorkflowView] Add Lead create response", {
        status: res.status,
        body,
      });
      if (!res.ok) {
        const backendError =
          typeof body.error === "string"
            ? body.error
            : body.error
              ? JSON.stringify(body.error)
              : "Unknown backend error";
        const localLead = toWorkflowLeadFromPayload(payload, {
          fallbackId: `local-${Date.now()}`,
          source: "local",
        });
        setLocalFallbackLeads((prev) => {
          const next = [localLead, ...prev.filter((lead) => lead.id !== localLead.id)];
          persistFallbackLeads(next);
          return next;
        });
        setOptimisticLeads((prev) => prev.filter((lead) => lead.id !== optimisticId));
        setAdding(false);
        setSubmitMessage(`Lead saved locally. Backend create failed (${res.status}): ${backendError}`);
        console.info("[LeadsWorkflowView] Add Lead fallback save used", {
          status: res.status,
          reason: body.reason || null,
          backend_error: backendError,
          local_lead_id: localLead.id,
          source: localLead.source,
        });
        return true;
      }
      const createdLead = toWorkflowLeadFromPayload(body, {
        fallbackId: String(body.id || `created-${Date.now()}`),
        source: "server",
      });
      setLeads((prev) => [createdLead, ...prev.filter((lead) => lead.id !== createdLead.id)]);
      setOptimisticLeads((prev) => prev.filter((lead) => lead.id !== optimisticId));
      setLocalFallbackLeads((prev) => {
        const next = prev.filter((lead) => lead.id !== createdLead.id);
        persistFallbackLeads(next);
        return next;
      });
      setAdding(false);
      setSubmitMessage("Lead added successfully (saved to backend).");
      console.info("[LeadsWorkflowView] Add Lead save succeeded", {
        leadId: createdLead.id,
        source: createdLead.source,
      });
      return true;
    } catch (error) {
      const localLead = toWorkflowLeadFromPayload(payload, {
        fallbackId: `local-${Date.now()}`,
        source: "local",
      });
      setLocalFallbackLeads((prev) => {
        const next = [localLead, ...prev.filter((lead) => lead.id !== localLead.id)];
        persistFallbackLeads(next);
        return next;
      });
      setOptimisticLeads((prev) => prev.filter((lead) => lead.id !== optimisticId));
      setAdding(false);
      setSubmitMessage("Lead saved locally (network issue).");
      console.info("[LeadsWorkflowView] Add Lead network fallback save used", {
        error: error instanceof Error ? error.message : "unknown_error",
        local_lead_id: localLead.id,
        source: localLead.source,
      });
      return true;
    }
  }

  function toCreatePayload(lead: WorkflowLead): Record<string, unknown> {
    return {
      business_name: String(lead.business_name || "").trim(),
      contact_name: undefined,
      email: String(lead.email || "").trim() || undefined,
      phone: String(lead.phone_from_site || "").trim() || undefined,
      website: String(lead.website || "").trim() || undefined,
      industry: String(lead.category || "").trim() || undefined,
      category: String(lead.category || "").trim() || undefined,
      city: String(lead.city || "").trim() || undefined,
      address: String(lead.address || "").trim() || undefined,
      lead_source: String(lead.lead_source || "manual_local").trim() || "manual_local",
      status: lead.status || "new",
      notes: Array.isArray(lead.notes) && lead.notes.length > 0 ? String(lead.notes[lead.notes.length - 1] || "").trim() : undefined,
      follow_up_date: undefined,
      last_contacted_at: lead.last_contacted_at || undefined,
      follow_up_stage: clampFollowUpStage(lead.follow_up_stage),
      next_follow_up_at: String(lead.next_follow_up_at || "").trim() || undefined,
      follow_up_status: lead.follow_up_status || "pending",
      is_manual: true,
      known_owner_name: String(lead.known_owner_name || "").trim() || undefined,
      known_context: String(lead.known_context || "").trim() || undefined,
      lead_bucket: String(lead.lead_bucket || "").trim() || undefined,
      door_status: lead.door_status || "not_visited",
    };
  }

  async function retrySaveLocalLead(lead: WorkflowLead) {
    if (!isLocalOnlyLead(lead)) {
      setSubmitMessage("Lead is already saved to backend.");
      return;
    }
    const payload = toCreatePayload(lead);
    console.info("[LeadsWorkflowView] Retry save requested", {
      lead_id: lead.id,
      source: lead.source || null,
      payload,
    });
    const success = await createLead(payload);
    if (!success) {
      setSubmitMessage("Retry save failed. Lead is still local only.");
      return;
    }
    setLocalFallbackLeads((prev) => {
      const next = prev.filter((item) => item.id !== lead.id);
      persistFallbackLeads(next);
      return next;
    });
    setOptimisticLeads((prev) => prev.filter((item) => item.id !== lead.id));
  }

  async function updateLeadStatusQuick(lead: WorkflowLead, nextStatus: WorkflowLead["status"]) {
    const mappedStatus =
      nextStatus === "follow_up"
        ? "follow_up"
        : nextStatus === "won"
          ? "won"
          : nextStatus;
    const shouldStopFollowUps =
      nextStatus === "replied" || nextStatus === "not_interested" || nextStatus === "won";
    const patchPayload: Record<string, unknown> = {
      status: mappedStatus,
    };
    if (shouldStopFollowUps) {
      patchPayload.follow_up_status = "completed";
      patchPayload.next_follow_up_at = null;
    }
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(body.error || "Could not update lead status.");
      return;
    }
    setLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              status: nextStatus,
              follow_up_status: shouldStopFollowUps ? "completed" : row.follow_up_status,
              next_follow_up_at: shouldStopFollowUps ? null : row.next_follow_up_at,
            }
          : row
      )
    );
    setLocalFallbackLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              status: nextStatus,
              follow_up_status: shouldStopFollowUps ? "completed" : row.follow_up_status,
              next_follow_up_at: shouldStopFollowUps ? null : row.next_follow_up_at,
            }
          : row
      )
    );
  }

  async function scheduleFollowUps(lead: WorkflowLead) {
    const nextStage = 1;
    const nextFollowUpAt = nextFollowUpIsoFromStage(nextStage);
    const patchPayload: Record<string, unknown> = {
      follow_up_stage: nextStage,
      follow_up_status: "pending",
      next_follow_up_at: nextFollowUpAt,
    };
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(body.error || "Could not schedule follow-ups.");
      return;
    }
    setLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              follow_up_stage: nextStage,
              follow_up_status: "pending",
              next_follow_up_at: nextFollowUpAt,
            }
          : row
      )
    );
    setLocalFallbackLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              follow_up_stage: nextStage,
              follow_up_status: "pending",
              next_follow_up_at: nextFollowUpAt,
            }
          : row
      )
    );
    setError(null);
    actionDebug("Schedule Follow-Ups", { leadId: lead.id, next_stage: nextStage, next_follow_up_at: nextFollowUpAt });
  }

  async function sendFollowUpForLead(lead: WorkflowLead) {
    const stage = clampFollowUpStage(lead.follow_up_stage || 1) || 1;
    const template = FOLLOW_UP_TEMPLATES[stage];
    if (!template) {
      setError("No follow-up template found for this stage.");
      return;
    }
    const sendRes = await fetch("/api/scout/outreach/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead.id,
        subject: `Quick follow-up for ${lead.business_name}`,
        body: template,
        message_type: "short",
      }),
    });
    const sendBody = (await sendRes.json().catch(() => ({}))) as { error?: string };
    if (!sendRes.ok) {
      setError(sendBody.error || "Could not send follow-up.");
      return;
    }
    const nowIso = new Date().toISOString();
    const nextStage = Math.min(3, stage + 1);
    const isCompleted = stage >= 3;
    const nextFollowUpAt = isCompleted ? null : nextFollowUpIsoFromStage(nextStage);
    const patchPayload: Record<string, unknown> = {
      last_contacted_at: nowIso,
      follow_up_stage: isCompleted ? 3 : nextStage,
      follow_up_status: isCompleted ? "completed" : "pending",
      next_follow_up_at: nextFollowUpAt,
      status: "follow_up",
    };
    const patchRes = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
    });
    const patchBody = (await patchRes.json().catch(() => ({}))) as { error?: string };
    if (!patchRes.ok) {
      setError(patchBody.error || "Follow-up sent but lead update failed.");
      return;
    }
    setLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              status: "follow_up",
              last_contacted_at: nowIso,
              follow_up_stage: isCompleted ? 3 : nextStage,
              follow_up_status: isCompleted ? "completed" : "pending",
              next_follow_up_at: nextFollowUpAt,
            }
          : row
      )
    );
    setLocalFallbackLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              status: "follow_up",
              last_contacted_at: nowIso,
              follow_up_stage: isCompleted ? 3 : nextStage,
              follow_up_status: isCompleted ? "completed" : "pending",
              next_follow_up_at: nextFollowUpAt,
            }
          : row
      )
    );
    setError(null);
    actionDebug("Send Follow-Up", { leadId: lead.id, sent_stage: stage, next_stage: isCompleted ? null : nextStage });
  }

  async function markFollowUpSent(lead: WorkflowLead) {
    const stage = clampFollowUpStage(lead.follow_up_stage || 1) || 1;
    const nowIso = new Date().toISOString();
    const nextStage = Math.min(3, stage + 1);
    const isCompleted = stage >= 3;
    const nextFollowUpAt = isCompleted ? null : nextFollowUpIsoFromStage(nextStage);
    const patchPayload: Record<string, unknown> = {
      last_contacted_at: nowIso,
      follow_up_stage: isCompleted ? 3 : nextStage,
      follow_up_status: isCompleted ? "completed" : "pending",
      next_follow_up_at: nextFollowUpAt,
      status: "follow_up",
    };
    const patchRes = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
    });
    const patchBody = (await patchRes.json().catch(() => ({}))) as { error?: string };
    if (!patchRes.ok) {
      setError(patchBody.error || "Could not mark follow-up as sent.");
      return;
    }
    setLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              status: "follow_up",
              last_contacted_at: nowIso,
              follow_up_stage: isCompleted ? 3 : nextStage,
              follow_up_status: isCompleted ? "completed" : "pending",
              next_follow_up_at: nextFollowUpAt,
            }
          : row
      )
    );
    setLocalFallbackLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              status: "follow_up",
              last_contacted_at: nowIso,
              follow_up_stage: isCompleted ? 3 : nextStage,
              follow_up_status: isCompleted ? "completed" : "pending",
              next_follow_up_at: nextFollowUpAt,
            }
          : row
      )
    );
    setError(null);
    actionDebug("Mark Follow-Up Sent", {
      leadId: lead.id,
      sent_stage: stage,
      next_stage: isCompleted ? null : nextStage,
    });
  }

  async function deleteLeadQuick(lead: WorkflowLead) {
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "DELETE",
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(body.error || "Could not delete lead.");
      return;
    }
    setLeads((prev) => prev.filter((row) => row.id !== lead.id));
    setLocalFallbackLeads((prev) => {
      const next = prev.filter((row) => row.id !== lead.id);
      persistFallbackLeads(next);
      return next;
    });
    setSelectedLeadIds((prev) => prev.filter((id) => id !== lead.id));
  }

  function toggleSelectedLead(leadId: string) {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  }

  async function bulkUpdateStatus(nextStatus: WorkflowLead["status"]) {
    const selected = filtered.filter((lead) => selectedLeadIds.includes(lead.id));
    await Promise.all(selected.map((lead) => updateLeadStatusQuick(lead, nextStatus)));
    setSelectedLeadIds([]);
  }

  async function bulkDeleteSelected() {
    const selected = filtered.filter((lead) => selectedLeadIds.includes(lead.id));
    await Promise.all(selected.map((lead) => deleteLeadQuick(lead)));
    setSelectedLeadIds([]);
  }

  async function copyText(value: string, errorMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setError(null);
    } catch {
      setError(errorMessage);
    }
  }

  async function navigateToLeadWithGuard(
    lead: Pick<WorkflowLead, "id" | "business_name" | "source" | "isLocalOnly">,
    query?: string
  ) {
    if (isLocalOnlyLead(lead)) {
      const message =
        "This lead is saved locally only and is not yet available in the full lead detail page.";
      setError(message);
      actionDebug("Lead navigation blocked", {
        leadId: lead.id,
        source: lead.source || null,
        isLocalOnly: true,
        reason: "local_only",
      });
      if (typeof window !== "undefined") window.alert(message);
      return;
    }
    const destination = leadHref(lead, query);
    const check = await verifyLeadBeforeNavigation(String(lead.id || ""));
    if (!check.ok) {
      setError(check.message);
      actionDebug("Lead navigation blocked", {
        leadId: lead.id,
        status: check.status,
        reason: check.reason,
        diagnostics: check.diagnostics || null,
      });
      if (typeof window !== "undefined") window.alert(check.message);
      return;
    }
    if (typeof window !== "undefined") window.location.assign(destination);
  }

  async function openPreviewWithGuard(lead: Pick<WorkflowLead, "id" | "source" | "isLocalOnly">) {
    if (isLocalOnlyLead(lead)) {
      setError("This lead is saved locally only and preview generation requires a backend-saved lead.");
      actionDebug("Preview blocked", {
        leadId: lead.id,
        source: lead.source || null,
        reason: "local_only",
      });
      return;
    }
    const check = await verifyLeadBeforeNavigation(String(lead.id || ""));
    if (!check.ok) {
      setError(check.message);
      actionDebug("Preview blocked", {
        leadId: lead.id,
        status: check.status,
        reason: check.reason,
        diagnostics: check.diagnostics || null,
      });
      return;
    }
    if (typeof window !== "undefined") window.open(previewHref(lead), "_blank", "noopener,noreferrer");
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
    actionDebug("Mark Text Sent response", { leadId: lead.id, status: res.status, body });
    if (!res.ok) {
      setError(res.status === 403 ? "Permission denied" : body.error || "API error");
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

  async function appendLeadNoteAndStatus(
    lead: WorkflowLead,
    note: string,
    status?: WorkflowLead["status"],
    doorStatus?: WorkflowLead["door_status"]
  ) {
    const existingNotes = Array.isArray(lead.notes) ? lead.notes : [];
    const nextNotes = [...existingNotes, note].join("\n");
    const nowIso = new Date().toISOString();
    const payload: Record<string, unknown> = { notes: nextNotes, last_updated_at: nowIso };
    if (status) payload.status = status;
    if (doorStatus) payload.door_status = doorStatus;
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    actionDebug("Lead PATCH response", { leadId: lead.id, status: res.status, body });
    if (!res.ok) {
      setError(res.status === 403 ? "Permission denied" : body.error || "API error");
      return;
    }
    setLeads((prev) =>
      prev.map((item) =>
        item.id === lead.id
          ? {
              ...item,
              notes: [...existingNotes, note],
              status: status || item.status,
              door_status: doorStatus || item.door_status,
              last_updated_at: nowIso,
            }
          : item
      )
    );
    setError(null);
  }

  async function markVisited(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    await appendLeadNoteAndStatus(lead, `Door-to-door visited ${ts}`, "contacted", "visited");
  }

  async function markInterested(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    await appendLeadNoteAndStatus(lead, `Door-to-door interested ${ts}`, "follow_up", "follow_up");
  }

  async function markDoorPlanned(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    await appendLeadNoteAndStatus(lead, `Door-to-door planned ${ts}`, undefined, "planned");
  }

  async function markDoorWon(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    await appendLeadNoteAndStatus(lead, `Door-to-door won ${ts}`, "won", "closed_won");
  }

  async function markDoorLost(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    await appendLeadNoteAndStatus(lead, `Door-to-door lost ${ts}`, "no_response", "closed_lost");
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

  const mergedLeads = useMemo(
    () =>
      [...optimisticLeads, ...localFallbackLeads, ...leads].filter(
        (lead, index, arr) => arr.findIndex((candidate) => candidate.id === lead.id) === index
      ),
    [leads, localFallbackLeads, optimisticLeads]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bySegment = mergedLeads.filter((lead) => {
      if (segment === "new") return lead.status === "new";
      if (segment === "follow_up") return lead.status === "follow_up" || lead.status === "contacted";
      if (segment === "replied") return lead.status === "replied";
      if (segment === "closed") {
        return (
          lead.status === "won" ||
          lead.status === "no_response" ||
          lead.status === "not_interested" ||
          lead.status === "archived"
        );
      }
      return true;
    });
    const byScoutQuality = bySegment.filter((lead) => {
      if (scoutQualityFilter === "high_conversion") {
        const score = Number(lead.conversion_score ?? lead.opportunity_score ?? 0);
        return score >= 60;
      }
      if (scoutQualityFilter === "visual_business") {
        const category = String(lead.category || "").toLowerCase();
        const visualByCategory =
          category.includes("detail") ||
          category.includes("pressure wash") ||
          category.includes("landscap");
        return Boolean(lead.visual_business) || visualByCategory;
      }
      if (scoutQualityFilter === "no_website") {
        const ws = String(lead.website_status || "").toLowerCase();
        return !String(lead.website || "").trim() || ws === "no_website";
      }
      return true;
    });
    const searched = !q
      ? byScoutQuality
      : byScoutQuality.filter((lead) =>
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
    return [...searched].sort((a, b) => {
      const conversionDelta = Number(b.conversion_score || 0) - Number(a.conversion_score || 0);
      if (conversionDelta !== 0) return conversionDelta;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [mergedLeads, scoutQualityFilter, search, segment]);

  const queueCounts = useMemo(() => {
    const counts = {
      totalStoredLeads: mergedLeads.length,
      actionableNow: 0,
      newToday: 0,
      followUp: 0,
      replied: 0,
      archived: 0,
    };
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    for (const lead of mergedLeads) {
      const s = String(lead.status || "").toLowerCase();
      const isActionable = s === "new";
      const createdAt = new Date(lead.created_at || 0).getTime();
      if (isActionable) counts.actionableNow += 1;
      if (createdAt >= todayStart.getTime()) counts.newToday += 1;
      if (s === "follow_up" || s === "contacted") counts.followUp += 1;
      if (s === "replied") counts.replied += 1;
      if (s === "archived" || Boolean(lead.is_archived)) counts.archived += 1;
    }
    return counts;
  }, [mergedLeads]);

  const pendingFollowUps = useMemo(() => {
    return [...mergedLeads]
      .filter((lead) => {
        const status = String(lead.status || "").toLowerCase();
        if (status === "replied" || status === "not_interested" || status === "won") return false;
        if (String(lead.follow_up_status || "pending").toLowerCase() !== "pending") return false;
        return Boolean(String(lead.next_follow_up_at || "").trim());
      })
      .sort((a, b) => {
        const aTime = new Date(String(a.next_follow_up_at || 0)).getTime();
        const bTime = new Date(String(b.next_follow_up_at || 0)).getTime();
        return aTime - bTime;
      });
  }, [mergedLeads]);
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Follow Up</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.followUp}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Replies Waiting</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.replied}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Archived</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.archived}</p>
        </div>
      </section>

      <section className="admin-card space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
            Follow-Up Panel
          </h2>
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Pending: {pendingFollowUps.length}
          </span>
        </div>
        {pendingFollowUps.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            No pending follow-ups right now.
          </p>
        ) : (
          <div className="space-y-2">
            {pendingFollowUps.slice(0, 20).map((lead) => {
              const stage = clampFollowUpStage(lead.follow_up_stage || 1) || 1;
              const previewMessage = FOLLOW_UP_TEMPLATES[stage] || FOLLOW_UP_TEMPLATES[1];
              return (
                <article
                  key={`followup-${lead.id}`}
                  className="rounded-lg border p-3 space-y-2"
                  style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.2)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{lead.business_name}</p>
                    <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                      Due {lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleString() : "—"}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    Stage {stage} · Status {lead.follow_up_status || "pending"}
                  </p>
                  <p className="text-xs whitespace-pre-wrap" style={{ color: "var(--admin-muted)" }}>
                    {previewMessage}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="admin-btn-primary text-xs"
                      onClick={() => void sendFollowUpForLead(lead)}
                    >
                      Send Follow-Up
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs"
                      onClick={() => void scheduleFollowUps(lead)}
                    >
                      Schedule Follow-Ups
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs"
                      onClick={() => void markFollowUpSent(lead)}
                    >
                      Mark as Sent
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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
              Showing {filtered.length} of {mergedLeads.length}
            </span>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              onClick={() =>
                setSelectedLeadIds((prev) =>
                  prev.length === filtered.length ? [] : filtered.map((lead) => lead.id)
                )
              }
            >
              {selectedLeadIds.length === filtered.length && filtered.length > 0 ? "Clear Selection" : "Select All"}
            </button>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                className={scoutQualityFilter === "all" ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}
                onClick={() => setScoutQualityFilter("all")}
              >
                All Quality
              </button>
              <button
                type="button"
                className={scoutQualityFilter === "high_conversion" ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}
                onClick={() => setScoutQualityFilter("high_conversion")}
              >
                High Conversion Only
              </button>
              <button
                type="button"
                className={scoutQualityFilter === "visual_business" ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}
                onClick={() => setScoutQualityFilter("visual_business")}
              >
                Visual Businesses
              </button>
              <button
                type="button"
                className={scoutQualityFilter === "no_website" ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}
                onClick={() => setScoutQualityFilter("no_website")}
              >
                No Website Only
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              ["new", "New"],
              ["follow_up", "Follow Up"],
              ["replied", "Replied"],
              ["closed", "Closed"],
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
            {selectedLeadIds.length > 0 ? (
              <>
                <button type="button" className="admin-btn-ghost" onClick={() => void bulkUpdateStatus("contacted")}>
                  Bulk Contacted
                </button>
                <button type="button" className="admin-btn-ghost" onClick={() => void bulkUpdateStatus("no_response")}>
                  Bulk No Response
                </button>
                <button type="button" className="admin-btn-ghost" onClick={() => void bulkUpdateStatus("archived")}>
                  Bulk Archive
                </button>
                <button type="button" className="admin-btn-danger" onClick={() => void bulkDeleteSelected()}>
                  Bulk Delete
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => {
                console.info("[LeadsWorkflowView] Add Lead button clicked");
                setAdding(true);
              }}
            >
              Add Lead
            </button>
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

        {submitMessage ? (
          <div className="mb-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}>
            {submitMessage}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">No leads found</div>
            <div className="admin-empty-desc">
              {mergedLeads.length > 0
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
                  const sourceLabel =
                    lead.source === "local"
                      ? "Local only"
                      : lead.source === "optimistic"
                        ? "Saving..."
                        : "Backend";
                  return (
                    <div className="flex items-center justify-between gap-2">
                      <LeadBucketBadge bucket={bucket} score={lead.opportunity_score} />
                      <span className="admin-badge admin-badge-progress">{sourceLabel}</span>
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
                  {lead.known_context ? (
                    <p>
                      <span className="font-semibold">Known context:</span> {lead.known_context}
                    </p>
                  ) : null}
                  {lead.notes?.length ? (
                    <p>
                      <span className="font-semibold">Notes:</span> {String(lead.notes[lead.notes.length - 1] || "").slice(0, 120)}
                    </p>
                  ) : null}
                  <p>
                    <span className="font-semibold">Door status:</span> {prettyDoorStatus(lead.door_status)}
                  </p>
                  <p>
                    <span className="font-semibold">Last updated:</span>{" "}
                    {lead.last_updated_at ? new Date(lead.last_updated_at).toLocaleString() : "—"}
                  </p>
                  {lead.address ? (
                    <p>
                      <a href={mapDirectionsHref(lead)} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline text-sm font-semibold">
                        {lead.address}
                      </a>
                    </p>
                  ) : null}
                  <p>
                    <span className="font-semibold">Website:</span> {lead.website || "—"} ({websiteStatusDisplay(lead.website_status)})
                  </p>
                  <p>
                    <span className="font-semibold">Best contact:</span> {lead.best_contact_method || lead.contact_method || "none"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {lead.email ? "Email Found" : "No Email Found"}
                  </p>
                  <p>
                    <span className="font-semibold">Contact Page:</span> {lead.contact_page ? "Contact Page Found" : "Not Found"}
                  </p>
                  <p>
                    <span className="font-semibold">Facebook:</span> {lead.facebook_url ? "Facebook Found" : "Not Found"}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {lead.phone_from_site ? "Phone Found" : "Not Found"}
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
                    const localOnly = isLocalOnlyLead(lead);
                    return (
                      <>
                  <label className="admin-btn-ghost text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={() => toggleSelectedLead(lead.id)}
                      style={{ marginRight: 6 }}
                    />
                    Select
                  </label>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "contacted")}>
                    Mark Contacted
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "follow_up")}>
                    Follow Up
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void scheduleFollowUps(lead)}>
                    Schedule Follow-Ups
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "no_response")}>
                    No Response
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "not_interested")}>
                    Not Interested
                  </button>
                  <button type="button" className="admin-btn-primary text-xs" onClick={() => void updateLeadStatusQuick(lead, "won")}>
                    Won
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "archived")}>
                    Archive
                  </button>
                  <button type="button" className="admin-btn-danger text-xs" onClick={() => void deleteLeadQuick(lead)}>
                    Delete
                  </button>
                  <a
                    href={leadHref(lead)}
                    className="admin-btn-primary text-xs"
                    onClick={(event) => {
                      event.preventDefault();
                      void navigateToLeadWithGuard(lead);
                    }}
                  >
                    {lead.recommended_next_action || "Review Lead"}
                  </a>
                  <a
                    href={leadHref(lead)}
                    className="admin-btn-primary text-xs"
                    onClick={(event) => {
                      event.preventDefault();
                      actionDebug("Open Lead clicked", {
                        leadId: lead.id,
                        source: lead.source || "server",
                        isLocalOnly: Boolean(lead.isLocalOnly),
                      });
                      void navigateToLeadWithGuard(lead);
                    }}
                  >
                    Open Lead
                  </a>
                  <a
                    href={leadHref(lead, "sample=1")}
                    className="admin-btn-ghost text-xs"
                    onClick={(event) => {
                      event.preventDefault();
                      actionDebug("Build Sample clicked", { leadId: lead.id });
                      void navigateToLeadWithGuard(lead, "sample=1");
                    }}
                  >
                    Build Sample
                  </a>
                  <a
                    href={previewHref(lead)}
                    className="admin-btn-ghost text-xs"
                    onClick={(event) => {
                      event.preventDefault();
                      actionDebug("Generate Client Site Draft clicked", { leadId: lead.id });
                      void openPreviewWithGuard(lead);
                    }}
                  >
                    Generate Client Site Draft
                  </a>
                  <a
                    href={leadHref(lead, "sample=1")}
                    className="admin-btn-ghost text-xs"
                    onClick={(event) => {
                      event.preventDefault();
                      actionDebug("Send Sample clicked", { leadId: lead.id });
                      void navigateToLeadWithGuard(lead, "sample=1");
                    }}
                  >
                    Send Sample
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
                    onClick={(event) => {
                      event.preventDefault();
                      if (localOnly) {
                        const message =
                          "This lead is saved locally only. Save it to the backend before generating email.";
                        setError(message);
                        actionDebug("Generate Email blocked", {
                          leadId: lead.id,
                          source: lead.source || "unknown",
                          reason: "local_only",
                        });
                        return;
                      }
                      if (!hasContactPath) {
                        setError("No data returned: no contact path available.");
                        actionDebug("Generate Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                        return;
                      }
                      actionDebug("Generate Email clicked", { leadId: lead.id });
                      void navigateToLeadWithGuard(lead, "generate=1");
                    }}
                  >
                    Generate Email
                  </a>
                  <a
                    href={leadHref(lead, "compose=1")}
                    className="admin-btn-ghost text-xs"
                    onClick={(event) => {
                      event.preventDefault();
                      if (localOnly) {
                        const message =
                          "This lead is saved locally only. Save it to the backend before generating email.";
                        setError(message);
                        actionDebug("Send Email blocked", {
                          leadId: lead.id,
                          source: lead.source || "unknown",
                          reason: "local_only",
                        });
                        return;
                      }
                      if (!hasContactPath) {
                        setError("No data returned: no contact path available.");
                        actionDebug("Send Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                        return;
                      }
                      actionDebug("Send Email clicked", { leadId: lead.id });
                      void navigateToLeadWithGuard(lead, "compose=1");
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
                      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void markDoorPlanned(lead)}>
                        Mark Planned
                      </button>
                      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void markInterested(lead)}>
                        Mark Follow Up
                      </button>
                      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void markDoorWon(lead)}>
                        Mark Won
                      </button>
                      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void markDoorLost(lead)}>
                        Mark Lost
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
                  {localOnly ? (
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs"
                      onClick={() => void retrySaveLocalLead(lead)}
                    >
                      Save to Backend
                    </button>
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
                  <th>Notes</th>
                  <th>Door Status</th>
                  <th>Last Updated</th>
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
                      const localOnly = isLocalOnlyLead(lead);
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
                    <td>
                      {lead.address ? (
                        <a href={mapDirectionsHref(lead)} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline font-semibold">
                          {lead.address}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{String(lead.notes?.[lead.notes.length - 1] || lead.known_context || "—").slice(0, 90)}</td>
                    <td>{prettyDoorStatus(lead.door_status)}</td>
                    <td>{lead.last_updated_at ? new Date(lead.last_updated_at).toLocaleString() : "—"}</td>
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
                      <div className="text-[10px] mt-1" style={{ color: "var(--admin-muted)" }}>
                        Source: {lead.source === "local" ? "local" : lead.source === "optimistic" ? "optimistic" : "server"}
                      </div>
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
                        <label className="text-[var(--admin-gold)] hover:underline text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(lead.id)}
                            onChange={() => toggleSelectedLead(lead.id)}
                            style={{ marginRight: 6 }}
                          />
                          Select
                        </label>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "contacted")}>
                          Mark Contacted
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "follow_up")}>
                          Follow Up
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void scheduleFollowUps(lead)}>
                          Schedule Follow-Ups
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "no_response")}>
                          No Response
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "not_interested")}>
                          Not Interested
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "won")}>
                          Won
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "archived")}>
                          Archive
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void deleteLeadQuick(lead)}>
                          Delete
                        </button>
                        <a
                          href={leadHref(lead)}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={(event) => {
                            event.preventDefault();
                            actionDebug("Open Lead clicked", { leadId: lead.id });
                            void navigateToLeadWithGuard(lead);
                          }}
                        >
                          Open Lead
                        </a>
                        <a
                          href={leadHref(lead, "sample=1")}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={(event) => {
                            event.preventDefault();
                            actionDebug("Build Sample clicked", { leadId: lead.id });
                            void navigateToLeadWithGuard(lead, "sample=1");
                          }}
                        >
                          Build Sample
                        </a>
                        <a
                          href={previewHref(lead)}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={(event) => {
                            event.preventDefault();
                            actionDebug("Generate Client Site Draft clicked", { leadId: lead.id });
                            void openPreviewWithGuard(lead);
                          }}
                        >
                          Generate Client Site Draft
                        </a>
                        <a
                          href={leadHref(lead, "sample=1")}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={(event) => {
                            event.preventDefault();
                            actionDebug("Send Sample clicked", { leadId: lead.id });
                            void navigateToLeadWithGuard(lead, "sample=1");
                          }}
                        >
                          Send Sample
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
                            event.preventDefault();
                            if (localOnly) {
                              setError("This lead is saved locally only. Save it to the backend before generating email.");
                              actionDebug("Generate Email blocked", {
                                leadId: lead.id,
                                source: lead.source || "unknown",
                                reason: "local_only",
                              });
                              return;
                            }
                            if (!hasContactPath) {
                              setError("No data returned: no contact path available.");
                              actionDebug("Generate Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                              return;
                            }
                            actionDebug("Generate Email clicked", { leadId: lead.id });
                            void navigateToLeadWithGuard(lead, "generate=1");
                          }}
                        >
                          Generate Email
                        </a>
                        <a
                          href={leadHref(lead, "compose=1")}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={(event) => {
                            event.preventDefault();
                            if (localOnly) {
                              setError("This lead is saved locally only. Save it to the backend before generating email.");
                              actionDebug("Send Email blocked", {
                                leadId: lead.id,
                                source: lead.source || "unknown",
                                reason: "local_only",
                              });
                              return;
                            }
                            if (!hasContactPath) {
                              setError("No data returned: no contact path available.");
                              actionDebug("Send Email blocked", { leadId: lead.id, reason: "no_contact_path" });
                              return;
                            }
                            actionDebug("Send Email clicked", { leadId: lead.id });
                            void navigateToLeadWithGuard(lead, "compose=1");
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
                              onClick={() => void markDoorPlanned(lead)}
                            >
                              Mark Planned
                            </button>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void markInterested(lead)}
                            >
                              Mark Follow Up
                            </button>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void markDoorWon(lead)}
                            >
                              Mark Won
                            </button>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() => void markDoorLost(lead)}
                            >
                              Mark Lost
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
                        {localOnly ? (
                          <button
                            type="button"
                            className="text-[var(--admin-gold)] hover:underline text-xs"
                            onClick={() => void retrySaveLocalLead(lead)}
                          >
                            Save to Backend
                          </button>
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

      {adding ? (
        <LeadForm
          onClose={() => setAdding(false)}
          onSave={(payload) => createLead(payload as Record<string, unknown>)}
        />
      ) : null}

      {error ? (
        <p className="text-sm" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

