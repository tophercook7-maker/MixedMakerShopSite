import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import {
  computeLeadLaneBundle,
  CRM_LANE_LABELS,
  formatContactSignalsLine,
  type CrmLeadLane,
  type ContactReadiness,
} from "@/lib/crm/lead-lane";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";
import { resolvedCaptureSource } from "@/lib/crm/lead-source";

export type LeadRowForWorkflow = {
  id: string;
  owner_id?: string | null;
  workspace_id?: string | null;
  created_at?: string | null;
  status?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  category?: string | null;
  contact_page?: string | null;
  facebook_url?: string | null;
  best_contact_method?: string | null;
  email_source?: string | null;
  opportunity_reason?: string | null;
  opportunity_score?: number | null;
  conversion_score?: number | null;
  why_this_lead_is_here?: string | null;
  visual_business?: boolean | null;
  last_contacted_at?: string | null;
  follow_up_stage?: number | null;
  next_follow_up_at?: string | null;
  follow_up_status?: "pending" | "completed" | null;
  last_outreach_channel?: string | null;
  last_outreach_status?: string | null;
  last_outreach_sent_at?: string | null;
  preview_sent?: boolean | null;
  email_sent?: boolean | null;
  facebook_sent?: boolean | null;
  text_sent?: boolean | null;
  last_reply_preview?: string | null;
  last_reply_at?: string | null;
  is_hot_lead?: boolean | null;
  contact_name?: string | null;
  primary_contact_name?: string | null;
  has_website?: boolean | null;
  unread_reply_count?: number | null;
  /** DB column: canonical capture channel (extension, quick_add, …). */
  source?: string | null;
  /** Product line: web_design | 3d_printing */
  service_type?: string | null;
  first_outreach_message?: string | null;
  first_outreach_sent_at?: string | null;
  lead_source?: string | null;
  source_url?: string | null;
  source_label?: string | null;
  /** CRM tags from `leads.lead_tags` (e.g. `no_website_opportunity`). */
  lead_tags?: string[] | null;
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
  print_timer_started_at?: string | null;
  print_timer_running?: boolean | null;
  print_tracked_minutes?: number | null;
  print_manual_time_minutes?: number | null;
  print_labor_level?: string | null;
  print_labor_cost?: number | null;
  price_charged?: number | null;
  filament_cost?: number | null;
  filament_grams_used?: number | null;
  filament_cost_per_kg?: number | null;
  filament_use_weight_calc?: boolean | null;
  estimated_time_hours?: number | null;
  quoted_amount?: number | null;
  deposit_amount?: number | null;
  final_amount?: number | null;
  payment_request_type?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  payment_link?: string | null;
  paid_at?: string | null;
  last_response_at?: string | null;
};

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function isMissingColumnError(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("column ") && text.includes(" does not exist");
}

export function toWorkflowLead(row: LeadRowForWorkflow): WorkflowLead {
  const businessName = String(row.business_name || "").trim() || "Unknown business";
  const notes = String(row.notes || "").trim();
  const email = String(row.email || "").trim();
  const phone = String(row.phone || "").trim();
  const website = String(row.website || "").trim();
  const contactPage = String(row.contact_page || "").trim();
  const facebook = String(row.facebook_url || "").trim();
  let bestContactMethod = String(row.best_contact_method || "").trim().toLowerCase();
  if (bestContactMethod === "contact_page") bestContactMethod = "contact_form";
  if (bestContactMethod === "none") bestContactMethod = "";
  const hasEmail = Boolean(email);
  const hasWebsite = Boolean(website);
  const hasContactAvailable = Boolean(contactPage || facebook || phone);
  const hasFacebook = Boolean(facebook);
  let effectiveMethod = bestContactMethod;
  if (!hasEmail && hasFacebook && effectiveMethod === "phone") {
    effectiveMethod = "facebook";
  }
  const resolvedBestContact = (
    effectiveMethod ||
    (hasEmail
      ? "email"
      : hasFacebook
        ? "facebook"
        : contactPage
          ? "contact_form"
          : phone
            ? "phone"
            : hasWebsite
              ? "website"
              : "research_later")
  ) as WorkflowLead["best_contact_method"];
  const primaryName =
    String(row.primary_contact_name || row.contact_name || "")
      .trim()
      .trim() || null;

  const laneBundle = computeLeadLaneBundle({
    email,
    phone,
    website,
    facebook_url: facebook,
    contact_page: contactPage,
    conversion_score: row.conversion_score,
    opportunity_score: row.opportunity_score,
    why_this_lead_is_here: row.why_this_lead_is_here,
    status: row.status,
    best_contact_method: resolvedBestContact,
    is_hot_lead: row.is_hot_lead,
    has_website: row.has_website,
    lead_tags: row.lead_tags,
    opportunity_reason: row.opportunity_reason,
  });
  const step = laneBundle.simplified_next_step;
  const recommendedFromLane: WorkflowLead["recommended_next_action"] =
    step === "contact now"
      ? "Generate Email"
      : step === "call now"
        ? "Send First Touch"
        : step === "message on facebook"
          ? "Send First Touch"
          : step === "research later"
            ? "Research Later"
            : step === "skip for now"
              ? "Skip For Now"
              : hasEmail
                ? "Generate Email"
                : hasContactAvailable
                  ? "Open Contact Path"
                  : "Research Later";

  return {
    id: String(row.id || ""),
    record_origin: "server",
    isLocalOnly: false,
    workspace_id: String(row.workspace_id || "").trim() || null,
    related_case_id: null,
    lead_source: String(resolvedCaptureSource(row) || "").trim() || null,
    source: String(row.source || "").trim() || null,
    source_url: String(row.source_url || "").trim() || null,
    source_label: String(row.source_label || "").trim() || null,
    opportunity_id: null,
    business_name: businessName,
    category: String(row.category || row.industry || "").trim() || null,
    city: String(row.city || "").trim() || null,
    address: String(row.address || "").trim() || null,
    website_status: row.has_website === false ? "no_website" : website ? "live" : "unknown",
    opportunity_score: row.opportunity_score == null ? null : Number(row.opportunity_score),
    lead_bucket: hasEmail ? "Good Prospect" : hasContactAvailable ? "Needs Review" : "Low Priority",
    crm_lane: laneBundle.lead_bucket as CrmLeadLane,
    crm_lane_label: CRM_LANE_LABELS[laneBundle.lead_bucket as CrmLeadLane],
    contact_readiness_crm: laneBundle.contact_readiness as ContactReadiness,
    simplified_next_step_crm: laneBundle.simplified_next_step,
    lane_summary_line: laneBundle.summary_line,
    contact_signals_line: formatContactSignalsLine({
      email,
      phone,
      website,
      facebook_url: facebook,
      contact_page: contactPage,
    }),
    close_probability: null,
    lead_type: email ? "Easy Win" : "Needs Review",
    best_contact_method: resolvedBestContact,
    primary_problem: null,
    why_it_matters: null,
    why_this_lead_is_here: String(row.why_this_lead_is_here || "").trim() || null,
    best_pitch_angle: null,
    estimated_value: "low",
    estimated_price_range: "$",
    expected_close_probability: null,
    email_pitch: null,
    text_pitch: null,
    door_pitch: null,
    recommended_next_action: recommendedFromLane,
    outreach_channel: hasEmail ? "email" : hasContactAvailable ? "contact" : "skip",
    is_door_to_door_candidate: false,
    website: website || null,
    email: email || null,
    email_source: String(row.email_source || "").trim() || (email ? "unknown" : "No Email Found"),
    phone_from_site: phone || null,
    contact_page: contactPage || null,
    facebook_url: facebook || null,
    google_review_count: null,
    google_rating: null,
    door_score: null,
    distance_km: null,
    contact_method: hasEmail ? "email" : hasContactAvailable ? "contact_available" : "No Contact Path",
    detected_issue_summary: String(row.opportunity_reason || "").trim() || "No website audit data yet",
    detected_issues: [],
    status: normalizeWorkflowLeadStatus(row.status),
    created_at: String(row.created_at || "").trim() || null,
    screenshot_urls: [],
    annotated_screenshot_url: null,
    timeline: [],
    notes: notes ? [notes] : [],
    is_hot_lead: Boolean(row.is_hot_lead),
    last_reply_at: String(row.last_reply_at || "").trim() || null,
    last_reply_preview: String(row.last_reply_preview || "").trim() || null,
    unread_reply_count:
      row.unread_reply_count == null || Number.isNaN(Number(row.unread_reply_count))
        ? null
        : Math.max(0, Number(row.unread_reply_count)),
    conversion_score:
      row.conversion_score == null
        ? row.opportunity_score == null
          ? null
          : Number(row.opportunity_score)
        : Number(row.conversion_score),
    last_contacted_at: String(row.last_contacted_at || "").trim() || null,
    follow_up_stage:
      row.follow_up_stage == null || Number.isNaN(Number(row.follow_up_stage))
        ? 0
        : Math.max(0, Math.min(3, Number(row.follow_up_stage))),
    next_follow_up_at: String(row.next_follow_up_at || "").trim() || null,
    follow_up_status:
      String(row.follow_up_status || "").trim().toLowerCase() === "completed" ? "completed" : "pending",
    score_breakdown: null,
    from_latest_scan: false,
    is_archived: false,
    is_manual: false,
    visual_business: row.visual_business ?? null,
    known_owner_name: primaryName,
    known_context: null,
    door_status: "not_visited",
    last_updated_at: String(row.created_at || "").trim() || null,
    last_outreach_channel:
      row.last_outreach_channel === "email" || row.last_outreach_channel === "facebook" || row.last_outreach_channel === "text"
        ? row.last_outreach_channel
        : null,
    last_outreach_status:
      row.last_outreach_status === "draft" ||
      row.last_outreach_status === "sending" ||
      row.last_outreach_status === "sent" ||
      row.last_outreach_status === "failed"
        ? row.last_outreach_status
        : null,
    last_outreach_sent_at: String(row.last_outreach_sent_at || "").trim() || null,
    service_type: String(row.service_type || "").trim() || null,
    first_outreach_message: String(row.first_outreach_message || "").trim() || null,
    first_outreach_sent_at: String(row.first_outreach_sent_at || "").trim() || null,
    preview_sent: Boolean(row.preview_sent),
    email_sent: Boolean(row.email_sent),
    facebook_sent: Boolean(row.facebook_sent),
    text_sent: Boolean(row.text_sent),
    has_website: row.has_website ?? null,
    lead_tags: Array.isArray(row.lead_tags) ? row.lead_tags : null,
    opportunity_reason: String(row.opportunity_reason || "").trim() || null,
    print_pipeline_status: String(row.print_pipeline_status || "").trim() || null,
    print_request_type: String(row.print_request_type || "").trim() || null,
    print_tags: Array.isArray(row.print_tags) ? row.print_tags : null,
    print_material: String(row.print_material || "").trim() || null,
    print_dimensions: String(row.print_dimensions || "").trim() || null,
    print_quantity: String(row.print_quantity || "").trim() || null,
    print_deadline: String(row.print_deadline || "").trim() || null,
    print_attachment_url: String(row.print_attachment_url || "").trim() || null,
    print_estimate_summary: String(row.print_estimate_summary || "").trim() || null,
    print_request_summary: String(row.print_request_summary || "").trim() || null,
    print_design_help_requested:
      row.print_design_help_requested === null || row.print_design_help_requested === undefined
        ? null
        : Boolean(row.print_design_help_requested),
    print_timer_started_at: String(row.print_timer_started_at || "").trim() || null,
    print_timer_running:
      row.print_timer_running === null || row.print_timer_running === undefined ? null : Boolean(row.print_timer_running),
    print_tracked_minutes: numOrNull(row.print_tracked_minutes),
    print_manual_time_minutes: numOrNull(row.print_manual_time_minutes),
    print_labor_level: String(row.print_labor_level || "").trim() || null,
    print_labor_cost: numOrNull(row.print_labor_cost),
    price_charged: numOrNull(row.price_charged),
    filament_cost: numOrNull(row.filament_cost),
    filament_grams_used: numOrNull(row.filament_grams_used),
    filament_cost_per_kg: numOrNull(row.filament_cost_per_kg),
    filament_use_weight_calc:
      row.filament_use_weight_calc === null || row.filament_use_weight_calc === undefined
        ? null
        : Boolean(row.filament_use_weight_calc),
    estimated_time_hours: numOrNull(row.estimated_time_hours),
    quoted_amount: numOrNull(row.quoted_amount),
    deposit_amount: numOrNull(row.deposit_amount),
    final_amount: numOrNull(row.final_amount),
    payment_request_type: String(row.payment_request_type || "").trim() || null,
    payment_status: String(row.payment_status || "").trim() || null,
    payment_method: String(row.payment_method || "").trim() || null,
    payment_link: String(row.payment_link || "").trim() || null,
    paid_at: String(row.paid_at || "").trim() || null,
    last_response_at: String(row.last_response_at || "").trim() || null,
  };
}
