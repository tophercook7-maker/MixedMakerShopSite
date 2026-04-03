"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath } from "@/lib/lead-route";
import { getLeadPriorityBadges, leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";
import { verifyLeadBeforeNavigation } from "@/lib/lead-navigation";
import type { ContactReadiness, CrmLeadLane } from "@/lib/crm/lead-lane";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";
import { LeadForm } from "@/components/admin/lead-form";
import { OutreachBadges } from "@/components/admin/outreach-badges";
import { appendEncodedSmsBody, cleanPhoneForSmsAndTel } from "@/lib/crm/lead-phone-link";
import { buildLeadSmsBody } from "@/lib/crm/lead-sms-body";
import { getTemplateSet } from "@/lib/crm-utils";

function formatLeadApiError(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const rec = body as Record<string, unknown>;
  if (typeof rec.error === "string") return rec.error;
  if (rec.error && typeof rec.error === "object") return JSON.stringify(rec.error);
  if (typeof rec.message === "string") return rec.message;
  return fallback;
}

type FollowUpStatus = "pending" | "completed";

function followUpMessageForLead(lead: Pick<WorkflowLead, "business_name" | "category">): string {
  return getTemplateSet({ businessName: lead.business_name, category: lead.category }).smsFollowUp;
}

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
  /** Client-only: whether this row came from the API, localStorage, or an optimistic create. */
  record_origin?: "server" | "local" | "optimistic";
  isLocalOnly?: boolean;
  workspace_id?: string | null;
  related_case_id?: string | null;
  lead_source?: string | null;
  /** DB `leads.source` capture channel when present — extension, quick_add, etc. */
  source?: string | null;
  source_url?: string | null;
  source_label?: string | null;
  /** web_design | 3d_printing */
  service_type?: string | null;
  first_outreach_message?: string | null;
  first_outreach_sent_at?: string | null;
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
  best_contact_method?:
    | "email"
    | "phone"
    | "contact_page"
    | "contact_form"
    | "website"
    | "facebook"
    | "none"
    | "research_later"
    | null;
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
  status: "new" | "contacted" | "replied" | "qualified" | "proposal_sent" | "won" | "lost";
  created_at: string | null;
  screenshot_urls: string[];
  annotated_screenshot_url?: string | null;
  timeline: TimelineEntry[];
  notes: string[];
  is_hot_lead?: boolean | null;
  last_reply_at?: string | null;
  last_reply_preview?: string | null;
  unread_reply_count?: number | null;
  last_contacted_at?: string | null;
  /** Web mockup funnel status — see migration leads_mockup_deal_status */
  mockup_deal_status?: string | null;
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
  last_outreach_channel?: "email" | "facebook" | "text" | null;
  last_outreach_status?: "draft" | "sending" | "sent" | "failed" | null;
  last_outreach_sent_at?: string | null;
  preview_sent?: boolean;
  email_sent?: boolean;
  facebook_sent?: boolean;
  text_sent?: boolean;
  has_website?: boolean | null;
  lead_tags?: string[] | null;
  opportunity_reason?: string | null;
  /** 3D print workflow — see `lib/crm/three-d-print-lead.ts` */
  print_pipeline_status?: string | null;
  print_request_type?: string | null;
  print_tags?: string[] | null;
  print_material?: string | null;
  print_dimensions?: string | null;
  print_quantity?: string | null;
  print_deadline?: string | null;
  print_attachment_url?: string | null;
  print_estimate_summary?: string | null;
  print_request_summary?: string | null;
  print_design_help_requested?: boolean | null;
  price_charged?: number | null;
  filament_cost?: number | null;
  filament_grams_used?: number | null;
  filament_cost_per_kg?: number | null;
  filament_use_weight_calc?: boolean | null;
  estimated_time_hours?: number | null;
  quoted_amount?: number | null;
  deposit_amount?: number | null;
  final_amount?: number | null;
  /** deposit | full — customer payment request framing */
  payment_request_type?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  payment_link?: string | null;
  paid_at?: string | null;
  last_response_at?: string | null;
  /** 3D print job timer — see `lib/crm/print-job-timer.ts` */
  print_timer_started_at?: string | null;
  print_timer_running?: boolean | null;
  print_tracked_minutes?: number | null;
  print_manual_time_minutes?: number | null;
  print_labor_level?: string | null;
  print_labor_cost?: number | null;
  /** Deterministic lane (no Google) — see `lib/crm/lead-lane.ts` */
  crm_lane?: CrmLeadLane | null;
  crm_lane_label?: string | null;
  contact_readiness_crm?: ContactReadiness | null;
  simplified_next_step_crm?: string | null;
  lane_summary_line?: string | null;
  contact_signals_line?: string | null;
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

function leadPrefilledSmsHref(
  lead: Pick<WorkflowLead, "phone_from_site" | "website" | "lead_tags" | "has_website" | "category" | "business_name">
): string | null {
  const phone = String(lead.phone_from_site || "").trim();
  if (!phone) return null;
  const links = cleanPhoneForSmsAndTel(phone);
  if (!links) return null;
  const body = buildLeadSmsBody({
    website: String(lead.website || ""),
    lead_tags: lead.lead_tags,
    has_website: lead.has_website,
    category: lead.category,
    businessName: lead.business_name,
  });
  return appendEncodedSmsBody(links.smsHref, body);
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

function isLocalOnlyLead(lead: Pick<WorkflowLead, "id" | "record_origin" | "isLocalOnly">): boolean {
  return (
    Boolean(lead.isLocalOnly) ||
    String(lead.record_origin || "") === "local" ||
    String(lead.record_origin || "") === "optimistic" ||
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
    "up_next" | "new" | "contacted" | "follow_up" | "replied" | "closed" | "all"
  >("up_next");
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
  const [saveToWorkspaceBlock, setSaveToWorkspaceBlock] = useState<{
    leadId: string;
    query?: string;
    reason?: string;
  } | null>(null);
  const [optimisticLeads, setOptimisticLeads] = useState<WorkflowLead[]>([]);
  const [localFallbackLeads, setLocalFallbackLeads] = useState<WorkflowLead[]>([]);
  const LOCAL_WORKFLOW_LEADS_KEY = "mixedmakershop.local_workflow_leads";

  function withLeadSource(lead: WorkflowLead, record_origin: "server" | "local" | "optimistic"): WorkflowLead {
    return {
      ...lead,
      record_origin,
      isLocalOnly: record_origin !== "server",
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
      record_origin?: "server" | "local" | "optimistic";
    }
  ): WorkflowLead {
    const record_origin = options?.record_origin || "server";
    const now = new Date().toISOString();
    const status = normalizeWorkflowLeadStatus(String(payload.status || "new")) as WorkflowLead["status"];
    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || payload.phone_from_site || "").trim();
    const contactPage = String(payload.contact_page || "").trim();
    const facebook = String(payload.facebook_url || "").trim();
    const hasEmail = Boolean(email);
    const hasContactAvailable = Boolean(contactPage || facebook || phone);
    return {
      id: String(payload.id || options?.fallbackId || `local-${Date.now()}`),
      record_origin,
      isLocalOnly: record_origin !== "server",
      workspace_id: String(payload.workspace_id || "").trim() || null,
      related_case_id: null,
      lead_source: String(payload.lead_source || "").trim() || "manual",
      source: String(payload.source || "").trim() || null,
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
      best_contact_method: hasEmail ? "email" : hasContactAvailable ? "contact_form" : "research_later",
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
      last_outreach_channel: (() => {
        const c = String(payload.last_outreach_channel || "").trim();
        if (c === "email" || c === "facebook" || c === "text") return c;
        return null;
      })(),
      last_outreach_status: (() => {
        const st = String(payload.last_outreach_status || "").trim();
        if (st === "draft" || st === "sending" || st === "sent" || st === "failed") return st;
        return null;
      })(),
      last_outreach_sent_at: String(payload.last_outreach_sent_at || "").trim() || null,
      preview_sent: Boolean(payload.preview_sent),
      email_sent: Boolean(payload.email_sent),
      facebook_sent: Boolean(payload.facebook_sent),
      text_sent: Boolean(payload.text_sent),
      last_reply_preview: String(payload.last_reply_preview || "").trim() || null,
    };
  }

  async function createLead(payload: Record<string, unknown>) {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticLead = toWorkflowLeadFromPayload(payload, {
      fallbackId: optimisticId,
      record_origin: "optimistic",
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
          record_origin: "local",
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
          record_origin: localLead.record_origin,
        });
        return true;
      }
      const createdLead = toWorkflowLeadFromPayload(body, {
        fallbackId: String(body.id || `created-${Date.now()}`),
        record_origin: "server",
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
        record_origin: createdLead.record_origin,
      });
      return true;
    } catch (error) {
      const localLead = toWorkflowLeadFromPayload(payload, {
        fallbackId: `local-${Date.now()}`,
        record_origin: "local",
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
        record_origin: localLead.record_origin,
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
      lead_source: String(lead.lead_source || "manual").trim() || "manual",
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
    const promoted = await promoteLeadToWorkspace(lead);
    if (!promoted) {
      setSubmitMessage("Save to backend failed. Lead is still local only.");
      return;
    }
    setSubmitMessage("Lead saved to backend workspace.");
  }

  async function promoteLeadToWorkspace(lead: WorkflowLead): Promise<WorkflowLead | null> {
    if (!isLocalOnlyLead(lead)) return lead;
    const payload = toCreatePayload(lead);
    console.info("[LeadsWorkflowView] backend save attempted", {
      lead_id: lead.id,
      record_origin: lead.record_origin || null,
      payload,
    });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        const backendError =
          typeof body.error === "string"
            ? body.error
            : body.error
              ? JSON.stringify(body.error)
              : "Unknown backend error";
        console.info("[LeadsWorkflowView] backend save failed", {
          lead_id: lead.id,
          status: res.status,
          error: backendError,
        });
        setError(`This lead must be saved to backend before continuing. ${backendError}`);
        return null;
      }
      const promotedLead = toWorkflowLeadFromPayload(body, {
        fallbackId: String(body.id || lead.id),
        record_origin: "server",
      });
      setLeads((prev) => [promotedLead, ...prev.filter((row) => row.id !== promotedLead.id && row.id !== lead.id)]);
      setLocalFallbackLeads((prev) => {
        const next = prev.filter((row) => row.id !== lead.id && row.id !== promotedLead.id);
        persistFallbackLeads(next);
        return next;
      });
      setOptimisticLeads((prev) => prev.filter((row) => row.id !== lead.id && row.id !== promotedLead.id));
      setSelectedLeadIds((prev) =>
        prev.map((id) => (id === lead.id ? promotedLead.id : id)).filter((id, idx, arr) => arr.indexOf(id) === idx)
      );
      setSelectedDoorLeadIds((prev) =>
        prev.map((id) => (id === lead.id ? promotedLead.id : id)).filter((id, idx, arr) => arr.indexOf(id) === idx)
      );
      setRoutePlan((prev) => prev.map((entry) => (entry.id === lead.id ? promotedLead : entry)));
      console.info("[LeadsWorkflowView] local lead promoted to server", {
        old_lead_id: lead.id,
        new_lead_id: promotedLead.id,
        status: res.status,
      });
      setError(null);
      return promotedLead;
    } catch (e) {
      const message = e instanceof Error ? e.message : "network error";
      console.info("[LeadsWorkflowView] backend save failed", {
        lead_id: lead.id,
        error: message,
      });
      setError(`This lead must be saved to backend before continuing. ${message}`);
      return null;
    }
  }

  async function updateLeadStatusQuick(lead: WorkflowLead, nextStatus: WorkflowLead["status"]) {
    if (isLocalOnlyLead(lead)) {
      setError("This lead isn’t saved to the server yet. Use Add Lead until it saves, then try again.");
      return;
    }
    const shouldStopFollowUps =
      nextStatus === "replied" || nextStatus === "lost" || nextStatus === "won";
    const patchPayload: Record<string, unknown> = {
      status: nextStatus,
    };
    let contactedFollowUpAt: string | null = null;
    if (nextStatus === "contacted") {
      const fu = new Date();
      fu.setDate(fu.getDate() + 2);
      contactedFollowUpAt = fu.toISOString();
      patchPayload.next_follow_up_at = contactedFollowUpAt;
      patchPayload.follow_up_status = "pending";
      patchPayload.last_contacted_at = new Date().toISOString();
    }
    if (shouldStopFollowUps) {
      patchPayload.follow_up_status = "completed";
      patchPayload.next_follow_up_at = null;
    }
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: unknown };
    if (!res.ok) {
      setError(formatLeadApiError(body, "Could not update lead status."));
      return;
    }
    setError(null);
    setLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id
          ? {
              ...row,
              status: nextStatus,
              follow_up_status: shouldStopFollowUps ? "completed" : nextStatus === "contacted" ? "pending" : row.follow_up_status,
              next_follow_up_at: shouldStopFollowUps ? null : contactedFollowUpAt ?? row.next_follow_up_at,
              last_contacted_at:
                nextStatus === "contacted" ? String(patchPayload.last_contacted_at || new Date().toISOString()) : row.last_contacted_at,
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
              follow_up_status: shouldStopFollowUps ? "completed" : nextStatus === "contacted" ? "pending" : row.follow_up_status,
              next_follow_up_at: shouldStopFollowUps ? null : contactedFollowUpAt ?? row.next_follow_up_at,
              last_contacted_at:
                nextStatus === "contacted" ? String(patchPayload.last_contacted_at || new Date().toISOString()) : row.last_contacted_at,
            }
          : row
      )
    );
  }

  async function logMessageSent(lead: WorkflowLead) {
    if (isLocalOnlyLead(lead)) {
      setError("Save this lead to the backend before logging outreach.");
      return;
    }
    const chRaw = window.prompt("Channel: facebook, email, or text", "facebook");
    if (!chRaw) return;
    const channel = chRaw.trim().toLowerCase();
    if (channel !== "facebook" && channel !== "email" && channel !== "text") {
      setError("Channel must be facebook, email, or text.");
      return;
    }
    const note = window.prompt("Optional note (optional)")?.trim() || undefined;
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}/log-outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, note }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string; lead?: Record<string, unknown> };
    if (!res.ok) {
      setError(body.error || "Could not log outreach.");
      return;
    }
    const row = body.lead || {};
    setLeads((prev) =>
      prev.map((rowLead) =>
        rowLead.id === lead.id
          ? {
              ...rowLead,
              status: "contacted",
              email_sent: Boolean(row.email_sent ?? rowLead.email_sent),
              facebook_sent: Boolean(row.facebook_sent ?? rowLead.facebook_sent),
              text_sent: Boolean(row.text_sent ?? rowLead.text_sent),
              last_outreach_channel:
                row.last_outreach_channel === "email" ||
                row.last_outreach_channel === "facebook" ||
                row.last_outreach_channel === "text"
                  ? row.last_outreach_channel
                  : rowLead.last_outreach_channel,
              last_outreach_status: "sent",
              last_outreach_sent_at: String(row.last_outreach_sent_at || new Date().toISOString()),
              next_follow_up_at: String(row.next_follow_up_at || rowLead.next_follow_up_at || ""),
              follow_up_status: "pending",
            }
          : rowLead
      )
    );
    setError(null);
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
    const template = followUpMessageForLead(lead);
    const sendRes = await fetch("/api/scout/outreach/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead.id,
        subject: `Quick follow-up for ${lead.business_name}`,
        body: `${template}\n\n— Topher`,
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
      status: "contacted",
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
              status: "contacted",
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
              status: "contacted",
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
      status: "contacted",
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
              status: "contacted",
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
              status: "contacted",
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
    lead: Pick<WorkflowLead, "id" | "business_name" | "record_origin" | "isLocalOnly">,
    query?: string,
    options?: { actionName?: string; showSaveBlockOnPromotionFailure?: boolean }
  ) {
    const actionName = String(options?.actionName || "Open Lead");
    console.info("[LeadsWorkflowView] navigation action clicked", {
      action: actionName,
      lead_id: lead.id,
      record_origin: lead.record_origin || "server",
      is_local_only: Boolean(lead.isLocalOnly),
      query: query || null,
    });
    let resolvedLead: Pick<WorkflowLead, "id" | "business_name" | "record_origin" | "isLocalOnly"> = lead;
    if (isLocalOnlyLead(lead)) {
      const candidate = mergedLeads.find((entry) => entry.id === lead.id);
      if (!candidate) {
        const message = "This lead must be saved to backend before continuing.";
        setError(message);
        if (options?.showSaveBlockOnPromotionFailure) {
          setSaveToWorkspaceBlock({
            leadId: lead.id,
            query,
            reason: "Local lead data could not be found. Save from the lead list and retry.",
          });
        } else if (typeof window !== "undefined") {
          window.alert(message);
        }
        return;
      }
      const promoted = await promoteLeadToWorkspace(candidate);
      if (!promoted) {
        if (options?.showSaveBlockOnPromotionFailure) {
          setSaveToWorkspaceBlock({
            leadId: candidate.id,
            query,
            reason:
              "This lead needs to be saved to your workspace before you can build a sample.",
          });
        } else if (typeof window !== "undefined") {
          window.alert("This lead must be saved to backend before continuing.");
        }
        return;
      }
      setSaveToWorkspaceBlock(null);
      resolvedLead = promoted;
    }
    const justPromoted = resolvedLead !== lead;
    const destination = leadHref(resolvedLead, query);
    if (!justPromoted) {
      const check = await verifyLeadBeforeNavigation(String(resolvedLead.id || ""));
      if (!check.ok) {
        actionDebug("Lead navigation blocked", {
          leadId: resolvedLead.id,
          status: check.status,
          reason: check.reason,
          diagnostics: check.diagnostics || null,
        });
        if (options?.showSaveBlockOnPromotionFailure) {
          setError(check.message);
          setSaveToWorkspaceBlock({
            leadId: resolvedLead.id,
            query,
            reason: check.message,
          });
        } else {
          setError(check.message);
          if (typeof window !== "undefined") window.alert(check.message);
        }
        return;
      }
    }
    console.info("[LeadsWorkflowView] final route opened", {
      action: actionName,
      lead_id: resolvedLead.id,
      destination,
      just_promoted: justPromoted,
    });
    if (typeof window !== "undefined") window.location.assign(destination);
  }

  async function continueBlockedSaveToWorkspace() {
    if (!saveToWorkspaceBlock) return;
    const candidate = mergedLeads.find((entry) => entry.id === saveToWorkspaceBlock.leadId);
    if (!candidate) {
      setError("Local lead data was not found. Go back to Leads and try again.");
      return;
    }
    const promoted = await promoteLeadToWorkspace(candidate);
    if (!promoted) return;
    setSaveToWorkspaceBlock(null);
    const destination = leadHref(promoted, saveToWorkspaceBlock.query);
    console.info("[LeadsWorkflowView] final route opened", {
      action: "Build Sample",
      lead_id: promoted.id,
      destination,
    });
    if (typeof window !== "undefined") window.location.assign(destination);
  }

  async function openPreviewWithGuard(lead: Pick<WorkflowLead, "id" | "record_origin" | "isLocalOnly">) {
    let resolvedLead = lead;
    if (isLocalOnlyLead(lead)) {
      const candidate = mergedLeads.find((entry) => entry.id === lead.id);
      if (!candidate) {
        setError("This lead must be saved to backend before continuing.");
        return;
      }
      const promoted = await promoteLeadToWorkspace(candidate);
      if (!promoted) {
        setError("This lead must be saved to backend before continuing.");
        return;
      }
      resolvedLead = promoted;
    }
    const check = await verifyLeadBeforeNavigation(String(resolvedLead.id || ""));
    if (!check.ok) {
      setError(check.message);
      actionDebug("Preview blocked", {
        leadId: resolvedLead.id,
        status: check.status,
        reason: check.reason,
        diagnostics: check.diagnostics || null,
      });
      return;
    }
    if (typeof window !== "undefined") window.open(previewHref(resolvedLead), "_blank", "noopener,noreferrer");
  }

  async function markTextSent(lead: WorkflowLead) {
    const ts = new Date().toISOString();
    const existingNotes = Array.isArray(lead.notes) ? lead.notes : [];
    const nextNotes = [...existingNotes, `Text sent ${ts}`].join("\n");
    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "contacted",
        notes: nextNotes,
        text_sent: true,
        last_contacted_at: ts,
        last_outreach_channel: "text",
        last_outreach_status: "sent",
        last_outreach_sent_at: ts,
      }),
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
              text_sent: true,
              last_outreach_channel: "text",
              last_outreach_status: "sent",
              last_outreach_sent_at: ts,
              last_contacted_at: ts,
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
    await appendLeadNoteAndStatus(lead, `Door-to-door interested ${ts}`, "contacted", "follow_up");
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
    await appendLeadNoteAndStatus(lead, `Door-to-door lost ${ts}`, "lost", "closed_lost");
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
    function anyChannelSent(lead: WorkflowLead) {
      return Boolean(lead.email_sent || lead.facebook_sent || lead.text_sent);
    }
    function isTerminal(lead: WorkflowLead) {
      const s = lead.status;
      return s === "won" || s === "lost";
    }
    const bySegment = mergedLeads.filter((lead) => {
      const s = lead.status;
      if (segment === "all") return true;
      if (segment === "new") return s === "new";
      if (segment === "contacted") {
        return s === "contacted" && !isTerminal(lead);
      }
      if (segment === "follow_up") {
        if (isTerminal(lead)) return false;
        if (s !== "contacted") return false;
        if (String(lead.follow_up_status || "pending").toLowerCase() === "completed") return false;
        return Boolean(String(lead.next_follow_up_at || "").trim());
      }
      if (segment === "replied") return s === "replied";
      if (segment === "closed") {
        return s === "won" || s === "lost";
      }
      // up_next — needs action: new, no outbound yet, failed send, or overdue follow-up
      if (s === "replied" || isTerminal(lead)) return false;
      if (lead.last_outreach_status === "failed") return true;
      if (s === "new") return true;
      if (!anyChannelSent(lead)) return true;
      const fu = lead.next_follow_up_at ? new Date(lead.next_follow_up_at).getTime() : NaN;
      if (
        Number.isFinite(fu) &&
        fu <= Date.now() &&
        String(lead.follow_up_status || "pending").toLowerCase() !== "completed"
      ) {
        return true;
      }
      return false;
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
      lost: 0,
    };
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    for (const lead of mergedLeads) {
      const s = String(lead.status || "").toLowerCase();
      const needs =
        s === "new" ||
        lead.last_outreach_status === "failed" ||
        !(lead.email_sent || lead.facebook_sent || lead.text_sent);
      const isActionable = needs && !["replied", "won", "lost"].includes(s);
      const createdAt = new Date(lead.created_at || 0).getTime();
      if (isActionable) counts.actionableNow += 1;
      if (createdAt >= todayStart.getTime()) counts.newToday += 1;
      if (s === "contacted" && String(lead.next_follow_up_at || "").trim()) counts.followUp += 1;
      if (s === "replied") counts.replied += 1;
      if (s === "lost" || Boolean(lead.is_archived)) counts.lost += 1;
    }
    return counts;
  }, [mergedLeads]);

  const pendingFollowUps = useMemo(() => {
    return [...mergedLeads]
      .filter((lead) => {
        const status = String(lead.status || "").toLowerCase();
        if (status === "replied" || status === "lost" || status === "won") return false;
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
      {error ? (
        <div
          className="admin-card flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: "rgba(252, 165, 165, 0.45)", background: "rgba(127, 29, 29, 0.2)" }}
          role="alert"
        >
          <p className="text-sm flex-1 min-w-[200px]" style={{ color: "#fecaca" }}>
            {error}
          </p>
          <button type="button" className="admin-btn-ghost text-xs shrink-0" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
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
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Lost</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.lost}</p>
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
              const previewMessage = followUpMessageForLead(lead);
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
              ["up_next", "Up next"],
              ["new", "New"],
              ["contacted", "Contacted"],
              ["follow_up", "Follow-up due"],
              ["replied", "Replies waiting"],
              ["closed", "Won / Lost"],
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
                <button type="button" className="admin-btn-ghost" onClick={() => void bulkUpdateStatus("lost")}>
                  Bulk Mark Lost
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
        {saveToWorkspaceBlock ? (
          <div
            className="mb-3 rounded-lg border px-3 py-3 space-y-2"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.2)" }}
          >
            <h3 className="text-sm font-semibold">Save this lead to continue</h3>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              This lead needs to be saved to your workspace before you can build a sample.
            </p>
            {saveToWorkspaceBlock.reason ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                {saveToWorkspaceBlock.reason}
              </p>
            ) : null}
            {error ? (
              <p className="text-xs" style={{ color: "#fca5a5" }}>
                Backend error: {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="admin-btn-primary text-xs" onClick={() => void continueBlockedSaveToWorkspace()}>
                Save to Workspace
              </button>
              <button type="button" className="admin-btn-ghost text-xs" onClick={() => setSaveToWorkspaceBlock(null)}>
                Dismiss
              </button>
            </div>
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
                    lead.record_origin === "local"
                      ? "Local only"
                      : lead.record_origin === "optimistic"
                        ? "Saving..."
                        : "Saved";
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
                  }                  ).map((badge) => (
                    <span key={`${lead.id}-${badge.key}`} className={`admin-priority-badge ${badge.className}`}>
                      {badge.label}
                    </span>
                  ))}
                  <span className={`admin-priority-badge ${valueClass(lead.estimated_value)}`}>
                    Value {String(lead.estimated_value || "low").toUpperCase()} {lead.estimated_price_range || "$"}
                  </span>
                  <OutreachBadges lead={lead} />
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
                    <span className="font-semibold">Opportunity tier:</span>{" "}
                    {canonicalLeadBucket(lead.lead_bucket, lead.opportunity_score)}
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
                    <span className="font-semibold">Situation:</span>{" "}
                    {lead.why_this_lead_is_here ||
                      lead.detected_issue_summary ||
                      lead.primary_problem ||
                      "Worth a closer look online."}
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
                  {lead.email && lead.email_source && String(lead.email_source).toLowerCase() !== "unknown" ? (
                    <p>
                      <span className="font-semibold">Email source:</span> {lead.email_source}
                    </p>
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
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void logMessageSent(lead)}>
                    Log message sent
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "replied")}>
                    Mark replied
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "qualified")}>
                    Qualified
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "proposal_sent")}>
                    Proposal sent
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void scheduleFollowUps(lead)}>
                    Schedule Follow-Ups
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void updateLeadStatusQuick(lead, "lost")}>
                    Mark lost
                  </button>
                  <button type="button" className="admin-btn-primary text-xs" onClick={() => void updateLeadStatusQuick(lead, "won")}>
                    Won
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
                        record_origin: lead.record_origin || "server",
                        isLocalOnly: Boolean(lead.isLocalOnly),
                      });
                      void navigateToLeadWithGuard(lead);
                    }}
                  >
                    Open Lead
                  </a>
                  <button
                    type="button"
                    className="admin-btn-ghost text-xs"
                    onClick={() => {
                      actionDebug("Build Sample clicked", {
                        leadId: lead.id,
                        record_origin: lead.record_origin || "server",
                        isLocalOnly: Boolean(lead.isLocalOnly),
                      });
                      void navigateToLeadWithGuard(lead, "sample=1", {
                        actionName: "Build Sample",
                        showSaveBlockOnPromotionFailure: true,
                      });
                    }}
                  >
                    Build Sample
                  </button>
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
                  {lead.facebook_url ? (
                    <>
                      <a
                        href={lead.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn-ghost text-xs"
                        onClick={() => actionDebug("Open Facebook clicked", { leadId: lead.id })}
                      >
                        Open Facebook
                      </a>
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs"
                        onClick={() =>
                          void copyText(
                            getTemplateSet({ businessName: lead.business_name, category: lead.category }).facebookMessage,
                            "Could not copy Facebook message."
                          )
                        }
                      >
                        Copy FB message
                      </button>
                    </>
                  ) : null}
                  {lead.phone_from_site ? (
                    <>
                      <a
                        href={leadPrefilledSmsHref(lead) ?? "#"}
                        className="admin-btn-ghost text-xs"
                        onClick={(event) => {
                          if (!leadPrefilledSmsHref(lead)) event.preventDefault();
                          actionDebug("Text from Mac clicked", { leadId: lead.id, phone: lead.phone_from_site });
                        }}
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
                            buildLeadSmsBody({
                              website: String(lead.website || ""),
                              lead_tags: lead.lead_tags,
                              has_website: lead.has_website,
                              category: lead.category,
                              businessName: lead.business_name,
                            }),
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
                      Save to Workspace
                    </button>
                  ) : null}
                  {localOnly ? (
                    <p className="text-[11px]" style={{ color: "#fbbf24" }}>
                      This lead must be saved to backend before continuing.
                    </p>
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
                  <th>Tier</th>
                  <th>Situation</th>
                  <th>What to say</th>
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
                    <td>
                      <div className="font-medium">{lead.business_name}</div>
                      <OutreachBadges lead={lead} />
                    </td>
                    <td>{lead.city || "—"}</td>
                    <td>{lead.category || "—"}</td>
                    <td>{websiteStatusDisplay(lead.website_status)}</td>
                    <td>{lead.opportunity_score ?? "—"}</td>
                    <td>{Number(lead.conversion_score || 0)} · {conversionLabel(lead.conversion_score)}</td>
                    <td>
                      <LeadBucketBadge bucket={lead.lead_bucket} score={lead.opportunity_score} />
                    </td>
                    <td className="max-w-[220px]">
                      {lead.why_this_lead_is_here ||
                        lead.detected_issue_summary ||
                        lead.primary_problem ||
                        "—"}
                    </td>
                    <td className="max-w-[200px]">
                      {lead.best_pitch_angle || "Tighten their site so more visitors call or book."}
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
                    <td>
                      {lead.email &&
                      lead.email_source &&
                      String(lead.email_source).toLowerCase() !== "unknown"
                        ? lead.email_source
                        : "—"}
                    </td>
                    <td>{lead.google_review_count != null && String(lead.google_review_count).trim() !== "" ? lead.google_review_count : "—"}</td>
                    <td>
                      {lead.google_rating != null && String(lead.google_rating).trim() !== "" ? lead.google_rating : "—"}
                    </td>
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
                        Source:{" "}
                        {lead.record_origin === "local"
                          ? "local"
                          : lead.record_origin === "optimistic"
                            ? "optimistic"
                            : "server"}
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
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void logMessageSent(lead)}>
                          Log message sent
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "replied")}>
                          Mark replied
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "qualified")}>
                          Qualified
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "proposal_sent")}>
                          Proposal sent
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void scheduleFollowUps(lead)}>
                          Schedule Follow-Ups
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "lost")}>
                          Mark lost
                        </button>
                        <button type="button" className="text-[var(--admin-gold)] hover:underline text-xs" onClick={() => void updateLeadStatusQuick(lead, "won")}>
                          Won
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
                        <button
                          type="button"
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          onClick={() => {
                            actionDebug("Build Sample clicked", {
                              leadId: lead.id,
                              record_origin: lead.record_origin || "server",
                              isLocalOnly: Boolean(lead.isLocalOnly),
                            });
                            void navigateToLeadWithGuard(lead, "sample=1", {
                              actionName: "Build Sample",
                              showSaveBlockOnPromotionFailure: true,
                            });
                          }}
                        >
                          Build Sample
                        </button>
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
                        {lead.facebook_url ? (
                          <>
                            <a
                              href={lead.facebook_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                            >
                              Open Facebook
                            </a>
                            <button
                              type="button"
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={() =>
                                void copyText(
                                  getTemplateSet({ businessName: lead.business_name, category: lead.category })
                                    .facebookMessage,
                                  "Could not copy Facebook message."
                                )
                              }
                            >
                              Copy FB message
                            </button>
                          </>
                        ) : null}
                        {lead.phone_from_site ? (
                          <>
                            <a
                              href={leadPrefilledSmsHref(lead) ?? "#"}
                              className="text-[var(--admin-gold)] hover:underline text-xs"
                              onClick={(event) => {
                                if (!leadPrefilledSmsHref(lead)) event.preventDefault();
                              }}
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
                                  buildLeadSmsBody({
                                    website: String(lead.website || ""),
                                    lead_tags: lead.lead_tags,
                                    has_website: lead.has_website,
                                    category: lead.category,
                                    businessName: lead.business_name,
                                  }),
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
                            Save to Workspace
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
    </div>
  );
}

