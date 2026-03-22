import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";

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
  lead_source?: string | null;
  source_url?: string | null;
  source_label?: string | null;
};

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
  const bestContactMethod = String(row.best_contact_method || "").trim().toLowerCase();
  const hasEmail = Boolean(email);
  const hasContactAvailable = Boolean(contactPage || facebook || phone);
  const resolvedBestContact = (
    bestContactMethod ||
    (hasEmail ? "email" : contactPage ? "contact_page" : facebook ? "facebook" : phone ? "phone" : "none")
  ) as WorkflowLead["best_contact_method"];
  const primaryName =
    String(row.primary_contact_name || row.contact_name || "")
      .trim()
      .trim() || null;

  return {
    id: String(row.id || ""),
    source: "server",
    isLocalOnly: false,
    workspace_id: String(row.workspace_id || "").trim() || null,
    related_case_id: null,
    lead_source: String(row.source || row.lead_source || "").trim() || null,
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
    recommended_next_action: hasEmail ? "Generate Email" : hasContactAvailable ? "Open Contact Path" : "Research Later",
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
    preview_sent: Boolean(row.preview_sent),
    email_sent: Boolean(row.email_sent),
    facebook_sent: Boolean(row.facebook_sent),
    text_sent: Boolean(row.text_sent),
  };
}
