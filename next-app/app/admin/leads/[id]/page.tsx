import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadMockupSharePanel } from "@/components/admin/lead-mockup-share-panel";
import { LeadWorkspaceActions } from "@/components/admin/lead-workspace-actions";
import { LeadWorkspaceScrollAnchor } from "@/components/admin/lead-workspace-scroll-anchor";
import { LeadContactNow } from "@/components/admin/lead-contact-now";
import { LeadSuggestedResponse } from "@/components/admin/lead-suggested-response";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath, isUuidLike, leadRouteMatches, parseLeadRouteToken } from "@/lib/lead-route";
import { getLeadPriorityBadges, leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";
import { LeadPitchPanel } from "@/components/admin/lead-pitch-panel";
import { ensureLeadFromOpportunityToken } from "@/lib/opportunity-lead-sync";
import { SaveLocalLeadToWorkspace } from "@/components/admin/save-local-lead-to-workspace";
import { ClaimLeadToWorkspace } from "@/components/admin/claim-lead-to-workspace";
import { LeadActivityTimeline } from "@/components/admin/lead-activity-timeline";
import { LeadPrimaryActions } from "@/components/admin/lead-primary-actions";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { computeLeadLaneBundle } from "@/lib/crm/lead-lane";
import { BackToLeadsLink } from "@/components/admin/crm/back-to-leads-link";
import { LeadDetailCleanupActions } from "@/components/admin/lead-detail-cleanup-actions";
import { PromoteToTopPicksButton } from "@/components/admin/crm/promote-to-top-picks-button";
import { isTopPickLead } from "@/lib/crm/manual-pick-leads";

type LeadRow = {
  id: string;
  owner_id?: string | null;
  workspace_id?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  linked_opportunity_id?: string | null;
  opportunity_score?: number | null;
  status?: string | null;
  unread_reply_count?: number | null;
  last_reply_at?: string | null;
  deal_status?: string | null;
  deal_stage?: "new" | "interested" | "pricing" | "closing" | "won" | null;
  last_reply_preview?: string | null;
  deal_value?: number | null;
  closed_at?: string | null;
  is_recurring_client?: boolean | null;
  monthly_value?: number | null;
  subscription_started_at?: string | null;
  referred_by?: string | null;
  referral_source?: string | null;
  is_referred_client?: boolean | null;
  notes?: string | null;
  created_at?: string | null;
  is_hot_lead?: boolean | null;
  door_status?: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost" | null;
  known_context?: string | null;
  real_world_why_target?: string | null;
  real_world_walk_in_pitch?: string | null;
  best_time_to_visit?: string | null;
  last_outreach_channel?: string | null;
  last_outreach_status?: string | null;
  last_outreach_sent_at?: string | null;
  next_follow_up_at?: string | null;
  facebook_url?: string | null;
  contact_page?: string | null;
  city?: string | null;
  state?: string | null;
  category?: string | null;
  source_url?: string | null;
  source_label?: string | null;
  source?: string | null;
  lead_source?: string | null;
  conversion_score?: number | null;
  why_this_lead_is_here?: string | null;
  has_website?: boolean | null;
  lead_tags?: string[] | null;
  opportunity_reason?: string | null;
  google_business_url?: string | null;
  advertising_page_url?: string | null;
  advertising_page_label?: string | null;
  best_contact_method?: string | null;
  best_contact_value?: string | null;
  suggested_template_key?: string | null;
  suggested_response?: string | null;
};

const LEAD_DETAIL_SELECT_VARIANTS = [
  [
    "id",
    "owner_id",
    "workspace_id",
    "business_name",
    "email",
    "phone",
    "website",
    "industry",
    "linked_opportunity_id",
    "opportunity_score",
    "status",
    "unread_reply_count",
    "last_reply_at",
    "deal_status",
    "deal_stage",
    "last_reply_preview",
    "deal_value",
    "closed_at",
    "is_recurring_client",
    "monthly_value",
    "subscription_started_at",
    "referred_by",
    "referral_source",
    "is_referred_client",
    "notes",
    "created_at",
    "door_status",
    "known_context",
    "real_world_why_target",
    "real_world_walk_in_pitch",
    "best_time_to_visit",
    "last_outreach_channel",
    "last_outreach_status",
    "last_outreach_sent_at",
    "next_follow_up_at",
    "facebook_url",
    "contact_page",
    "city",
    "state",
    "category",
    "source_url",
    "source_label",
    "source",
    "lead_source",
    "conversion_score",
    "why_this_lead_is_here",
    "google_business_url",
    "advertising_page_url",
    "advertising_page_label",
    "best_contact_method",
    "best_contact_value",
    "suggested_template_key",
    "suggested_response",
    "has_website",
    "lead_tags",
    "opportunity_reason",
  ].join(","),
  [
    "id",
    "owner_id",
    "workspace_id",
    "business_name",
    "email",
    "phone",
    "website",
    "industry",
    "linked_opportunity_id",
    "opportunity_score",
    "status",
    "unread_reply_count",
    "last_reply_at",
    "deal_status",
    "deal_stage",
    "last_reply_preview",
    "deal_value",
    "closed_at",
    "is_recurring_client",
    "monthly_value",
    "subscription_started_at",
    "referred_by",
    "referral_source",
    "is_referred_client",
    "notes",
    "created_at",
    "known_context",
    "real_world_why_target",
    "real_world_walk_in_pitch",
    "best_time_to_visit",
  ].join(","),
  [
    "id",
    "owner_id",
    "workspace_id",
    "business_name",
    "email",
    "phone",
    "website",
    "industry",
    "linked_opportunity_id",
    "opportunity_score",
    "status",
    "unread_reply_count",
    "last_reply_at",
    "deal_status",
    "deal_stage",
    "last_reply_preview",
    "deal_value",
    "closed_at",
    "is_recurring_client",
    "monthly_value",
    "subscription_started_at",
    "referred_by",
    "referral_source",
    "is_referred_client",
    "notes",
    "created_at",
  ].join(","),
  [
    "id",
    "owner_id",
    "workspace_id",
    "business_name",
    "email",
    "phone",
    "website",
    "industry",
    "linked_opportunity_id",
    "opportunity_score",
    "status",
    "unread_reply_count",
    "last_reply_at",
    "deal_status",
    "deal_stage",
    "last_reply_preview",
    "notes",
    "created_at",
  ].join(","),
  "id,owner_id,workspace_id,business_name,email,phone,website,industry,status,notes,created_at",
] as const;

async function selectLeadsWithVariants(args: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  ownerId?: string | null;
  id?: string;
  businessNameToken?: string;
  limit?: number;
  orderByCreatedAt?: boolean;
  context: string;
  leadTokenForLog: string;
}): Promise<{ rows: LeadRow[]; selectClause: string | null; errors: Array<{ selectClause: string; message: string }> }> {
  const {
    supabase,
    ownerId,
    id,
    businessNameToken,
    limit = 1,
    orderByCreatedAt = true,
    context,
    leadTokenForLog,
  } = args;
  const errors: Array<{ selectClause: string; message: string }> = [];
  const isMissingColumnError = (message: string): boolean => {
    const text = String(message || "").toLowerCase();
    return text.includes("column ") && text.includes(" does not exist");
  };
  for (const selectClause of LEAD_DETAIL_SELECT_VARIANTS) {
    let query = supabase.from("leads").select(selectClause);
    if (ownerId) query = query.eq("owner_id", ownerId);
    if (id) query = query.eq("id", id);
    if (businessNameToken) query = query.ilike("business_name", `%${businessNameToken}%`);
    if (orderByCreatedAt) query = query.order("created_at", { ascending: false });
    query = query.limit(limit);
    const { data, error } = await query;
    if (!error) {
      return {
        rows: (data || []) as unknown as LeadRow[],
        selectClause,
        errors,
      };
    }
    const message = String(error.message || "unknown");
    errors.push({ selectClause, message });
    if (!isMissingColumnError(message)) {
      console.warn("[Lead Detail] lead select variant failed", {
        stage: context,
        lead_token: leadTokenForLog,
        select_clause: selectClause,
        error: message,
      });
    }
  }
  return { rows: [], selectClause: null, errors };
}

type CaseRow = {
  id: string;
  opportunity_id?: string | null;
  created_at?: string | null;
  status?: string | null;
  email?: string | null;
  contact_page?: string | null;
  contact_form_url?: string | null;
  phone_from_site?: string | null;
  facebook?: string | null;
  facebook_url?: string | null;
  instagram?: string | null;
  instagram_url?: string | null;
  activity_summary?: string[] | null;
  website_audit?: {
    mobile_score?: number | null;
    load_time?: number | null;
    issues?: string[] | null;
    checks?: {
      mobile_pagespeed_score?: number | null;
      load_time_seconds?: number | null;
      large_images_over_300kb?: number | null;
      large_images_detected?: boolean | null;
      render_blocking_scripts_detected?: boolean | null;
      missing_meta_description?: boolean | null;
      missing_h1?: boolean | null;
      missing_alt_tags?: boolean | null;
      duplicate_title_detected?: boolean | null;
      missing_call_to_action?: boolean | null;
      cta_present?: boolean | null;
      homepage_phone_visible?: boolean | null;
      homepage_phone_present?: boolean | null;
      missing_viewport_meta?: boolean | null;
      buttons_too_close_detected?: boolean | null;
      layout_not_responsive?: boolean | null;
      small_text_or_crowded_buttons?: boolean | null;
      booking_or_ordering_missing?: boolean | null;
      contact_page_present?: boolean | null;
      contact_click_depth?: number | null;
      broken_links_count?: number | null;
      outdated_layout_signals?: boolean | null;
      excessive_inline_styles?: boolean | null;
      broken_internal_links_count?: number | null;
    } | null;
  } | null;
  website_issues?: Array<{ category?: string | null; issue?: string | null }> | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  desktop_screenshot_url?: string | null;
  mobile_screenshot_url?: string | null;
  contact_page_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  notes?: string | null;
  outcome?: string | null;
  google_review_count?: number | null;
  google_rating?: number | null;
  reviews_last_30_days?: number | null;
  owner_post_detected?: boolean | null;
  new_photos_detected?: boolean | null;
  listing_recently_updated?: boolean | null;
};

type OpportunityRow = {
  id: string;
  business_name?: string | null;
  category?: string | null;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  website_status?: string | null;
  opportunity_score?: number | null;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
  close_probability?: "low" | "medium" | "high" | null;
};

function missingOpportunityReasonColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_reason") || text.includes("column opportunity_reason");
}

function missingOpportunitySignalsColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_signals") || text.includes("column opportunity_signals");
}

function missingOpportunityWebsiteStatusColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.website_status") || text.includes("column website_status");
}

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function fmtBool(v: boolean | null | undefined) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "";
}

function slugTokenToBusinessNameQuery(token: string): string {
  return String(token || "")
    .trim()
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function categorizeWebsiteIssue(rawIssue: string): { category: string; issue: string } {
  const issue = String(rawIssue || "").trim();
  const lower = issue.toLowerCase();
  if (
    lower.includes("pagespeed") ||
    lower.includes("load") ||
    lower.includes("render-blocking") ||
    lower.includes("image optimization")
  ) {
    return { category: "Mobile Performance", issue };
  }
  if (
    lower.includes("call to action") ||
    lower.includes("cta") ||
    lower.includes("contact") ||
    lower.includes("mobile call button")
  ) {
    return { category: "Conversion", issue };
  }
  if (
    lower.includes("viewport") ||
    lower.includes("small text") ||
    lower.includes("buttons too close") ||
    lower.includes("mobile")
  ) {
    return { category: "Mobile UX", issue };
  }
  if (
    lower.includes("meta") ||
    lower.includes("missing h1") ||
    lower.includes("alt tags") ||
    lower.includes("duplicate titles") ||
    lower.includes("seo")
  ) {
    return { category: "SEO", issue };
  }
  if (
    lower.includes("layout") ||
    lower.includes("broken links") ||
    lower.includes("inline styles") ||
    lower.includes("navigation") ||
    lower.includes("ssl")
  ) {
    return { category: "Site Structure", issue };
  }
  return { category: "Website", issue };
}

function quickFixSuggestions(category: string, issueTexts: string[]) {
  const cat = String(category || "").toLowerCase();
  const text = issueTexts.join(" | ").toLowerCase();
  const suggestions: string[] = [];
  const push = (value: string) => {
    if (!suggestions.includes(value)) suggestions.push(value);
  };

  if (text.includes("call to action") || text.includes("cta")) {
    push("Add a clear action button near the top of the homepage.");
  }
  if (text.includes("contact") || text.includes("phone")) {
    push("Move contact options higher on the page so visitors can act quickly.");
  }
  if (text.includes("mobile") || text.includes("viewport") || text.includes("small text") || text.includes("buttons too close")) {
    push("Simplify the mobile header/navigation and increase tap target sizes.");
  }
  if (text.includes("slow") || text.includes("pagespeed") || text.includes("load")) {
    push("Compress large images and reduce heavy scripts to improve load speed.");
  }

  if (cat.includes("restaurant") || cat.includes("cafe") || cat.includes("bakery")) {
    push("Add a prominent Menu / Order Now button above the fold.");
  } else if (cat.includes("plumber") || cat.includes("hvac") || cat.includes("electrician") || cat.includes("roofer")) {
    push("Add Call Now and Get Quote buttons in the hero section.");
  } else if (cat.includes("gym")) {
    push("Add Join Now and Membership Plans calls to action near the top.");
  } else if (cat.includes("church")) {
    push("Add Service Times and Plan Your Visit buttons on the homepage.");
  }

  if (suggestions.length === 0) {
    push("Add a clear top-of-page call to action that matches your main service.");
    push("Make contact options visible in the header and first screen.");
    push("Reduce clutter on mobile so visitors can find key actions faster.");
  }
  return suggestions.slice(0, 3);
}

function computeEstimatedValue(category: string | null | undefined): {
  estimated_value: "low" | "medium" | "high";
  estimated_price_range: "$" | "$$" | "$$$";
} {
  const cat = String(category || "").toLowerCase();
  const high = ["medical", "clinic", "contractor", "home service", "church", "plumber", "roofer", "hvac", "electrician"];
  const medium = ["retail", "gym", "salon", "small business", "restaurant", "cafe", "auto repair"];
  if (high.some((v) => cat.includes(v))) return { estimated_value: "high", estimated_price_range: "$$$" };
  if (medium.some((v) => cat.includes(v))) return { estimated_value: "medium", estimated_price_range: "$$" };
  return { estimated_value: "low", estimated_price_range: "$" };
}

function expectedCloseProbabilityNumber(
  closeProbability: "low" | "medium" | "high" | null | undefined,
  score: number | null | undefined
): number {
  const s = Number(score || 0);
  if (closeProbability === "high") return Math.max(70, Math.min(95, s));
  if (closeProbability === "medium") return Math.max(45, Math.min(75, s));
  return Math.max(20, Math.min(55, s));
}

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generate?: string; compose?: string; sample?: string; focus?: string }>;
}) {
  const { id } = await params;
  const { generate, compose, sample, focus } = await searchParams;
  const focusOutreach = String(focus || "").toLowerCase() === "outreach";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to open lead workspaces.
        </p>
      </section>
    );
  }
  const targetId = String(id || "").trim();
  const redirectQuery = (() => {
    const q: string[] = [];
    if (sample === "1") q.push("sample=1");
    else if (generate === "1") q.push("generate=1");
    else if (compose === "1") q.push("compose=1");
    if (focusOutreach) q.push("focus=outreach");
    return q.length ? q.join("&") : undefined;
  })();
  if (!targetId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Lead id is missing.
        </p>
      </section>
    );
  }
  if (targetId.startsWith("local-") || targetId.startsWith("optimistic-")) {
    return (
      <section className="admin-card">
        <h1 className="text-2xl font-bold">This lead is not saved to your workspace</h1>
        <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
          You need to save this lead before continuing.
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
          Save this lead to backend before continuing with CRM actions.
        </p>
        <SaveLocalLeadToWorkspace localLeadId={targetId} redirectQuery={redirectQuery} />
        <div className="mt-4 flex gap-2">
          <Link href="/admin/leads" className="admin-btn-primary">
            Back to Leads
          </Link>
        </div>
      </section>
    );
  }

  const loadWarnings: string[] = [];
  const normalizedTargetToken = targetId.toLowerCase();
  console.info("[Lead Detail] requested lead token", { lead_token: targetId, owner_id: ownerId });
  let lead: LeadRow | null = null;
  let leadExistsById = false;
  let leadOwnerOnRow: string | null = null;
  let leadWorkspaceOnRow: string | null = null;
  let ownerWorkspaceFilterBlockedRow = false;
  let detailFailureReason: "not_found" | "owner_workspace_mismatch" | null = null;
  let leadFoundInLeads = false;
  let opportunityFoundForFallback = false;
  let autoCreateAttempted = false;
  let insertSucceeded = false;
  let insertErrorMessage: string | null = null;
  try {
    if (isUuidLike(targetId)) {
      const { data: unscopedExistRows, error: unscopedExistError } = await supabase
        .from("leads")
        .select("id,owner_id,workspace_id")
        .eq("id", targetId)
        .limit(1);
      if (unscopedExistError) {
        console.error("[Lead Detail] lead fetch failed", {
          stage: "lead_fetch_unscoped",
          lead_token: targetId,
          error: unscopedExistError,
        });
        loadWarnings.push("Lead base record could not be loaded.");
      }
      const unscopedLead = ((unscopedExistRows || [])[0] as LeadRow | undefined) || null;
      leadExistsById = Boolean(unscopedLead);
      leadOwnerOnRow = String(unscopedLead?.owner_id || "").trim() || null;
      leadWorkspaceOnRow = String(unscopedLead?.workspace_id || "").trim() || null;

      const scopedResult = await selectLeadsWithVariants({
        supabase,
        ownerId,
        id: targetId,
        limit: 1,
        orderByCreatedAt: false,
        context: "lead_fetch_scoped",
        leadTokenForLog: targetId,
      });
      const scopedLeadRows = scopedResult.rows;
      const allVariantsFailed = scopedResult.errors.length > 0 && scopedLeadRows.length === 0;
      if (allVariantsFailed) {
        loadWarnings.push("Lead detail query had schema mismatches; using compatible fallback.");
        console.warn("[Lead Detail] all SELECT variants failed", {
          lead_token: targetId,
          variant_errors: scopedResult.errors,
        });
      }
      const scopedLead = (scopedLeadRows[0] as LeadRow | undefined) || null;
      const ownerIdMatches = Boolean(unscopedLead) && leadOwnerOnRow === ownerId;
      ownerWorkspaceFilterBlockedRow = Boolean(unscopedLead && !scopedLead);
      lead = scopedLead || null;
      if (ownerWorkspaceFilterBlockedRow && ownerIdMatches && allVariantsFailed) {
        detailFailureReason = null;
        lead = unscopedLead as LeadRow | null;
        console.info("[Lead Detail] owner matches but all SELECT variants failed, using unscoped lead as fallback", {
          lead_token: targetId,
        });
      } else if (ownerWorkspaceFilterBlockedRow) {
        detailFailureReason = "owner_workspace_mismatch";
      } else if (!unscopedLead) {
        detailFailureReason = "not_found";
      }
      console.info("[Lead Detail] by-id lookup result", {
        lead_token: targetId,
        lead_exists_by_id: leadExistsById,
        current_user_id: ownerId,
        lead_owner_id: leadOwnerOnRow,
        lead_workspace_id: leadWorkspaceOnRow,
        owner_id_matches: ownerIdMatches,
        all_variants_failed: allVariantsFailed,
        owner_workspace_filter_blocked_row: ownerWorkspaceFilterBlockedRow,
        matched_lead_id: lead?.id || null,
        detail_failure_reason: detailFailureReason,
      });
    }
    if (!lead) {
      const parsed = parseLeadRouteToken(targetId);
      const businessNameToken = slugTokenToBusinessNameQuery(parsed.slug || normalizedTargetToken);
      if (businessNameToken) {
        const byBusinessResult = await selectLeadsWithVariants({
          supabase,
          ownerId,
          businessNameToken,
          limit: 50,
          context: "lead_business_name_lookup",
          leadTokenForLog: targetId,
        });
        const businessLeadRows = byBusinessResult.rows;
        if (byBusinessResult.errors.length > 0 && businessLeadRows.length === 0) {
          loadWarnings.push("Lead route fallback by business name failed.");
        }
        lead =
          businessLeadRows.find((row) =>
            leadRouteMatches(normalizedTargetToken, row.id, row.business_name || null)
          ) ||
          (businessLeadRows[0] as LeadRow | undefined) ||
          null;
        console.info("[Lead Detail] business-name fallback result", {
          lead_token: targetId,
          business_name_token: businessNameToken,
          candidates: Number(businessLeadRows.length),
          matched_lead_id: lead?.id || null,
        });
      }
    }
    if (!lead) {
      const candidateResult = await selectLeadsWithVariants({
        supabase,
        ownerId,
        limit: 5000,
        context: "lead_slug_lookup",
        leadTokenForLog: targetId,
      });
      const candidateLeadRows = candidateResult.rows;
      if (candidateResult.errors.length > 0 && candidateLeadRows.length === 0) {
        loadWarnings.push("Lead route lookup failed.");
      }
      lead =
        candidateLeadRows.find((row) =>
          leadRouteMatches(normalizedTargetToken, row.id, row.business_name || null)
        ) || null;
      console.info("[Lead Detail] full-scan token fallback result", {
        lead_token: targetId,
        candidates: Number(candidateLeadRows.length),
        matched_lead_id: lead?.id || null,
      });
    }
  } catch (error) {
    console.error("[Lead Detail] lead fetch threw", {
      stage: "lead_fetch",
      lead_token: targetId,
      error,
    });
    loadWarnings.push("Lead base record could not be loaded.");
  }
  leadFoundInLeads = Boolean(lead);

  if (!lead && !ownerWorkspaceFilterBlockedRow) {
    try {
      autoCreateAttempted = true;
      const recovery = await ensureLeadFromOpportunityToken(supabase, ownerId, targetId);
      opportunityFoundForFallback = Boolean(recovery.opportunityId);
      insertSucceeded = Boolean(recovery.leadId);
      insertErrorMessage = recovery.insertError;
      if (recovery.leadId) {
        console.info("[Lead Detail] auto-created lead from opportunity fallback", {
          lead_token: targetId,
          opportunity_id: recovery.opportunityId,
          lead_id: recovery.leadId,
          created: recovery.created,
        });
        console.info("[Lead Detail] self-heal diagnostics", {
          lead_token: targetId,
          lead_found_in_leads: leadFoundInLeads,
          opportunity_found_in_opportunities: opportunityFoundForFallback,
          auto_create_attempted: autoCreateAttempted,
          insert_succeeded: insertSucceeded,
          insert_error: insertErrorMessage,
        });
        redirect(`/admin/leads/${encodeURIComponent(recovery.leadId)}`);
      } else {
        console.info("[Lead Detail] no opportunity available for lead auto-create fallback", {
          lead_token: targetId,
        });
      }
    } catch (recoveryError) {
      console.error("[Lead Detail] auto-create from opportunity fallback failed", {
        lead_token: targetId,
        error: recoveryError,
      });
      insertErrorMessage = recoveryError instanceof Error ? recoveryError.message : "unknown";
    }
  }
  console.info("[Lead Detail] self-heal diagnostics", {
    lead_token: targetId,
    lead_found_in_leads: leadFoundInLeads,
    opportunity_found_in_opportunities: opportunityFoundForFallback,
    auto_create_attempted: autoCreateAttempted,
    insert_succeeded: insertSucceeded,
    insert_error: insertErrorMessage,
  });

  let caseRow: CaseRow | null = null;

  const linkedOppId = String(lead?.linked_opportunity_id || "").trim();
  if (!caseRow && linkedOppId) {
    try {
      const { data: caseByOppRows, error: caseError } = await supabase
        .from("case_files")
        .select(
          "id,opportunity_id,created_at,status,email,contact_page,contact_form_url,phone_from_site,facebook,facebook_url,instagram,instagram_url,activity_summary,website_audit,website_issues,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,desktop_screenshot_url,mobile_screenshot_url,contact_page_screenshot_url,annotated_screenshot_url,notes,outcome,google_review_count,google_rating,reviews_last_30_days,owner_post_detected,new_photos_detected,listing_recently_updated"
        )
        .eq("opportunity_id", linkedOppId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (caseError) {
        console.error("[Lead Detail] case_files fetch failed", {
          stage: "case_files_fetch",
          lead_id: lead?.id || null,
          opportunity_id: linkedOppId,
          error: caseError,
        });
        loadWarnings.push("Related case data is unavailable.");
      }
      caseRow = ((caseByOppRows || [])[0] as CaseRow | undefined) || null;
    } catch (error) {
      console.error("[Lead Detail] case_files fetch threw", {
        stage: "case_files_fetch",
        lead_id: lead?.id || null,
        opportunity_id: linkedOppId,
        error,
      });
      loadWarnings.push("Related case data is unavailable.");
    }
  }

  let oppId = linkedOppId || String(caseRow?.opportunity_id || "").trim();
  let opp: OpportunityRow | null = null;
  if (oppId) {
    try {
      let oppRows: OpportunityRow[] | null = null;
      let oppError: { message?: string } | null = null;
      const withReason = await supabase
        .from("opportunities")
        .select("id,business_name,category,city,address,website,website_status,opportunity_score,opportunity_reason,opportunity_signals,close_probability")
        .eq("id", oppId)
        .limit(1);
      oppRows = (withReason.data || []) as OpportunityRow[];
      oppError = withReason.error as { message?: string } | null;
      if (
        oppError?.message &&
        (missingOpportunityReasonColumn(oppError.message) ||
          missingOpportunitySignalsColumn(oppError.message) ||
          missingOpportunityWebsiteStatusColumn(oppError.message))
      ) {
        const fallback = await supabase
          .from("opportunities")
          .select("id,business_name,category,city,address,website,opportunity_score,close_probability")
          .eq("id", oppId)
          .limit(1);
        oppRows = ((fallback.data || []) as OpportunityRow[]).map((row) => ({
          ...row,
          website_status: null,
          opportunity_reason: null,
          opportunity_signals: null,
        }));
        oppError = fallback.error as { message?: string } | null;
      }
      if (oppError) {
        console.error("[Lead Detail] opportunity fetch failed", {
          stage: "opportunity_fetch",
          lead_id: lead?.id || null,
          opportunity_id: oppId,
          error: oppError,
        });
        loadWarnings.push("Related opportunity data is unavailable.");
      }
      opp = ((oppRows || [])[0] as OpportunityRow | undefined) || null;
    } catch (error) {
      console.error("[Lead Detail] opportunity fetch threw", {
        stage: "opportunity_fetch",
        lead_id: lead?.id || null,
        opportunity_id: oppId,
        error,
      });
      loadWarnings.push("Related opportunity data is unavailable.");
    }
  }
  if (!opp && lead) {
    const leadWebsite = String(lead.website || "").trim();
    if (leadWebsite) {
      try {
        let fallbackOppRows: OpportunityRow[] | null = null;
        let fallbackOppError: { message?: string } | null = null;
        const withReason = await supabase
          .from("opportunities")
          .select("id,business_name,category,city,address,website,website_status,opportunity_score,opportunity_reason,opportunity_signals,close_probability")
          .eq("website", leadWebsite)
          .order("opportunity_score", { ascending: false, nullsFirst: false })
          .limit(1);
        fallbackOppRows = (withReason.data || []) as OpportunityRow[];
        fallbackOppError = withReason.error as { message?: string } | null;
        if (
          fallbackOppError?.message &&
          (missingOpportunityReasonColumn(fallbackOppError.message) ||
            missingOpportunitySignalsColumn(fallbackOppError.message) ||
            missingOpportunityWebsiteStatusColumn(fallbackOppError.message))
        ) {
          const fallback = await supabase
            .from("opportunities")
            .select("id,business_name,category,city,address,website,opportunity_score,close_probability")
            .eq("website", leadWebsite)
            .order("opportunity_score", { ascending: false, nullsFirst: false })
            .limit(1);
          fallbackOppRows = ((fallback.data || []) as OpportunityRow[]).map((row) => ({
            ...row,
            website_status: null,
            opportunity_reason: null,
            opportunity_signals: null,
          }));
          fallbackOppError = fallback.error as { message?: string } | null;
        }
        if (fallbackOppError) {
          console.error("[Lead Detail] fallback opportunity fetch failed", {
            stage: "opportunity_fallback_fetch",
            lead_id: lead?.id || null,
            website: leadWebsite,
            error: fallbackOppError,
          });
          loadWarnings.push("Opportunity fallback lookup failed.");
        }
        opp = ((fallbackOppRows || [])[0] as OpportunityRow | undefined) || null;
        if (opp) {
          oppId = String(opp.id || "").trim() || oppId;
          console.info("[Lead Detail] fallback relationship fetch used", {
            lead_id: lead?.id || targetId,
            fallback: "website",
            resolved_opportunity_id: oppId,
          });
        }
      } catch (error) {
        console.error("[Lead Detail] fallback opportunity fetch threw", {
          stage: "opportunity_fallback_fetch",
          lead_id: lead?.id || null,
          website: leadWebsite,
          error,
        });
        loadWarnings.push("Opportunity fallback lookup failed.");
      }
    }
  }
  console.info("[Lead Detail] related data resolved", {
    lead_id: targetId,
    has_lead: Boolean(lead),
    has_case: Boolean(caseRow),
    has_opportunity: Boolean(opp),
    linked_opportunity_id: linkedOppId || null,
    resolved_opportunity_id: oppId || null,
  });

  const desktopScreenshotUrl = String(
    caseRow?.desktop_screenshot_url || caseRow?.homepage_screenshot_url || caseRow?.screenshot_url || ""
  ).trim();
  const mobileScreenshotUrl = String(caseRow?.mobile_screenshot_url || "").trim();
  const contactScreenshotUrl = String(
    caseRow?.contact_page_screenshot_url || caseRow?.annotated_screenshot_url || ""
  ).trim();
  const fallbackScreenshotUrls = (Array.isArray(caseRow?.screenshot_urls) ? caseRow!.screenshot_urls : [])
    .map((v) => String(v || "").trim())
    .filter(Boolean);

  const websiteIssuesFromDb = Array.isArray(caseRow?.website_issues)
    ? caseRow!.website_issues
        .map((entry) => ({
          category: String(entry?.category || "").trim() || "Website",
          issue: String(entry?.issue || "").trim(),
        }))
        .filter((entry) => entry.issue)
    : [];
  const opportunityReasonItems = String(opp?.opportunity_reason || "")
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
  const issueListRaw = [
    ...opportunityReasonItems,
    ...(Array.isArray(opp?.opportunity_signals) ? opp!.opportunity_signals : []),
    ...websiteIssuesFromDb.map((entry) => entry.issue),
    ...(Array.isArray(caseRow?.audit_issues) ? caseRow!.audit_issues : []),
    ...(Array.isArray(caseRow?.strongest_problems) ? caseRow!.strongest_problems : []),
    String(caseRow?.outcome || "").trim(),
    String(caseRow?.notes || "").trim(),
    String(lead?.notes || "").trim(),
  ];
  const issueList = Array.from(
    new Set(issueListRaw.map((v) => String(v || "").trim()).filter(Boolean))
  ).slice(0, 8);
  const structuredIssues =
    websiteIssuesFromDb.length > 0
      ? websiteIssuesFromDb
      : issueList.map((issue) => categorizeWebsiteIssue(issue));
  const topIssues = structuredIssues.slice(0, 3);
  const activitySummary = Array.isArray(caseRow?.activity_summary)
    ? caseRow!.activity_summary.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 6)
    : [];
  const websiteAudit = caseRow?.website_audit && typeof caseRow.website_audit === "object"
    ? caseRow.website_audit
    : null;
  const websiteAuditIssues = Array.isArray(websiteAudit?.issues)
    ? websiteAudit!.issues.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 3)
    : [];
  const auditChecks = (websiteAudit?.checks && typeof websiteAudit.checks === "object")
    ? websiteAudit.checks
    : null;

  const leadEmail = String(lead?.email || caseRow?.email || "").trim().toLowerCase();
  const leadIdForTimeline = String(lead?.id || "").trim();
  let threadRows: Array<Record<string, unknown>> = [];
  if (leadEmail) {
    try {
      const { data, error } = await supabase
        .from("email_threads")
        .select("id,contact_email,subject,status,last_message_at")
        .eq("contact_email", leadEmail)
        .order("last_message_at", { ascending: false })
        .limit(20);
      if (error) {
        console.error("[Lead Detail] email thread fetch failed", {
          stage: "email_thread_fetch",
          lead_id: leadIdForTimeline || null,
          error,
        });
        loadWarnings.push("Timeline threads are temporarily unavailable.");
      }
      threadRows = (data || []) as Array<Record<string, unknown>>;
    } catch (error) {
      console.error("[Lead Detail] email thread fetch threw", {
        stage: "email_thread_fetch",
        lead_id: leadIdForTimeline || null,
        error,
      });
      loadWarnings.push("Timeline threads are temporarily unavailable.");
    }
  }
  const threadIds = (threadRows || [])
    .map((r) => String(r.id || "").trim())
    .filter(Boolean);
  let messageRows: Array<Record<string, unknown>> = [];
  try {
    if (threadIds.length) {
      const { data, error } = await supabase
        .from("email_messages")
        .select("id,thread_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })
        .limit(1500);
      if (error) {
        console.error("[Lead Detail] email message fetch failed", {
          stage: "email_message_fetch",
          lead_id: leadIdForTimeline || null,
          error,
        });
        loadWarnings.push("Timeline messages are temporarily unavailable.");
      }
      messageRows = (data || []) as Array<Record<string, unknown>>;
    } else if (leadIdForTimeline) {
      const { data, error } = await supabase
        .from("email_messages")
        .select("id,thread_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
        .eq("lead_id", leadIdForTimeline)
        .order("created_at", { ascending: true })
        .limit(1500);
      if (error) {
        console.error("[Lead Detail] email message fallback fetch failed", {
          stage: "email_message_fetch_by_lead_id",
          lead_id: leadIdForTimeline || null,
          error,
        });
        loadWarnings.push("Timeline messages are temporarily unavailable.");
      }
      messageRows = (data || []) as Array<Record<string, unknown>>;
    }
  } catch (error) {
    console.error("[Lead Detail] email message fetch threw", {
      stage: "email_message_fetch",
      lead_id: leadIdForTimeline || null,
      error,
    });
    loadWarnings.push("Timeline messages are temporarily unavailable.");
  }

  let referralsGeneratedCount = 0;
  if (lead?.id || lead?.business_name) {
    try {
      const leadIdToken = String(lead?.id || "").trim();
      const businessNameToken = String(lead?.business_name || "").trim();
      const byIdResult = leadIdToken
        ? await supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", ownerId)
            .eq("referred_by", leadIdToken)
        : null;
      const byNameResult = businessNameToken
        ? await supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", ownerId)
            .ilike("referred_by", businessNameToken)
        : null;
      const byIdCount = Number(byIdResult?.count || 0);
      const byNameCount = Number(byNameResult?.count || 0);
      referralsGeneratedCount = Math.max(byIdCount, byNameCount);
    } catch {
      referralsGeneratedCount = 0;
    }
  }

  const hasAnyData = Boolean(lead || caseRow || opp);
  if (!hasAnyData) {
    const canRecreateFromOpportunity = opportunityFoundForFallback && isUuidLike(targetId);
    const isWorkspaceMismatch = detailFailureReason === "owner_workspace_mismatch";
    return (
      <div className="space-y-4">
        <section className="admin-card">
          <h1 className="text-2xl font-bold">
            {isWorkspaceMismatch
              ? "This lead is not in your workspace"
              : "Lead not found"}
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
            {isWorkspaceMismatch
              ? "This lead exists but belongs to a different workspace. Claim it to continue."
              : "This lead does not exist or could not be loaded."}
          </p>
          {isWorkspaceMismatch ? (
            <ClaimLeadToWorkspace leadId={targetId} redirectQuery={redirectQuery} />
          ) : null}
          <details className="mt-3">
            <summary className="text-xs cursor-pointer" style={{ color: "var(--admin-muted)" }}>Debug info</summary>
            <div className="mt-2 text-xs space-y-1 font-mono" style={{ color: "var(--admin-muted)" }}>
              <p>lead_id: {targetId}</p>
              <p>current_user_id: {ownerId}</p>
              <p>lead_owner_id: {leadOwnerOnRow || "null"}</p>
              <p>lead_workspace_id: {leadWorkspaceOnRow || "null"}</p>
              <p>owner_id_matches: {leadOwnerOnRow === ownerId ? "true" : "false"}</p>
              <p>lead_exists_by_id: {leadExistsById ? "true" : "false"}</p>
              <p>detail_failure_reason: {detailFailureReason || "none"}</p>
              <p>scoped_query_errors: {loadWarnings.length > 0 ? loadWarnings.join("; ") : "none"}</p>
            </div>
          </details>
          <div className="mt-4 flex gap-2">
            <Link href="/admin/leads" className="admin-btn-primary">
              Back to Leads
            </Link>
            <Link href="/admin/dashboard" className="admin-btn-ghost">
              Open Dashboard
            </Link>
            {canRecreateFromOpportunity ? (
              <Link
                href={`/admin/opportunities/${encodeURIComponent(targetId)}/open-lead`}
                className="admin-btn-ghost"
              >
                Recreate Lead From Opportunity
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  const displayBusinessName =
    String(opp?.business_name || "").trim() ||
    String(lead?.business_name || "").trim() ||
    "Unknown business";
  const displayCategory =
    String(opp?.category || "").trim() ||
    String(lead?.category || lead?.industry || "").trim() ||
    "—";
  const displayScore = (() => {
    const c = lead?.conversion_score;
    if (c != null && Number.isFinite(Number(c))) return Number(c);
    const o = Number(opp?.opportunity_score ?? lead?.opportunity_score ?? 0);
    return Number.isFinite(o) ? o : null;
  })();
  const displayWebsite =
    String(opp?.website || "").trim() ||
    String(lead?.website || "").trim();
  const displayEmail = String(lead?.email || caseRow?.email || "").trim();
  const displayPhone = String(lead?.phone || caseRow?.phone_from_site || "").trim();
  const displayContactPage = String(
    lead?.contact_page || caseRow?.contact_page || caseRow?.contact_form_url || ""
  ).trim();
  const displayFacebook = String(
    lead?.facebook_url || caseRow?.facebook_url || caseRow?.facebook || ""
  ).trim();
  const displayInstagram = String(caseRow?.instagram_url || caseRow?.instagram || "").trim();
  const displayGoogleBusiness = String(lead?.google_business_url || "").trim();
  const displaySuggestedTemplateKey = String(lead?.suggested_template_key || "").trim();
  const displaySuggestedResponse = String(lead?.suggested_response || "").trim();

  const resolvedBest = (() => {
    const fbNorm = displayFacebook
      ? displayFacebook.startsWith("http")
        ? displayFacebook
        : `https://${displayFacebook}`
      : "";
    const noEmail = !displayEmail;

    let method = String(lead?.best_contact_method || "").trim().toLowerCase();
    if (method === "contact_page") method = "contact_form";
    if (method === "none") method = "";
    let value: string | null = String(lead?.best_contact_value || "").trim() || null;

    if (method) {
      // Facebook-only leads: do not let stored "phone" win over Facebook when there is no email.
      if (noEmail && fbNorm && method === "phone") {
        method = "facebook";
        value = fbNorm;
      }
      if (method === "email" && !value) value = displayEmail || null;
      if (method === "facebook" && !value && displayFacebook) value = fbNorm || null;
      if (method === "phone" && !value) value = displayPhone || null;
      if (method === "contact_form" && !value) value = displayContactPage || null;
      if (method === "website" && !value && displayWebsite && leadHasStandaloneWebsite(displayWebsite))
        value = displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`;
      return { method, value };
    }
    if (displayEmail) return { method: "email", value: displayEmail };
    if (displayFacebook)
      return {
        method: "facebook" as const,
        value: fbNorm,
      };
    if (displayPhone) return { method: "phone", value: displayPhone };
    if (displayContactPage)
      return {
        method: "contact_form" as const,
        value: displayContactPage.startsWith("http") ? displayContactPage : `https://${displayContactPage}`,
      };
    if (displayWebsite && leadHasStandaloneWebsite(displayWebsite))
      return {
        method: "website" as const,
        value: displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`,
      };
    return { method: "research_later" as const, value: null as string | null };
  })();

  const resolvedAdvertising = (() => {
    const url = String(lead?.advertising_page_url || "").trim();
    const label = String(lead?.advertising_page_label || "").trim();
    if (url) {
      return {
        url: url.startsWith("http") ? url : `https://${url}`,
        label: label || "Public page",
      };
    }
    if (displayGoogleBusiness) {
      return {
        url: displayGoogleBusiness.startsWith("http") ? displayGoogleBusiness : `https://${displayGoogleBusiness}`,
        label: "Google listing",
      };
    }
    const src = String(lead?.source_url || "").trim();
    if (src) {
      const u = src.startsWith("http") ? src : `https://${src}`;
      const isFb = u.toLowerCase().includes("facebook.") || u.toLowerCase().includes("fb.com");
      return { url: u, label: isFb ? "Facebook page" : "Source link" };
    }
    if (displayFacebook) {
      return {
        url: displayFacebook.startsWith("http") ? displayFacebook : `https://${displayFacebook}`,
        label: "Facebook page",
      };
    }
    if (displayWebsite && leadHasStandaloneWebsite(displayWebsite)) {
      return {
        url: displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`,
        label: "Website",
      };
    }
    return { url: null as string | null, label: null as string | null };
  })();

  const hasContactPath = Boolean(displayEmail || displayPhone || displayContactPage || displayFacebook);
  const laneBundle = computeLeadLaneBundle({
    email: displayEmail || null,
    phone: displayPhone || null,
    website: displayWebsite || null,
    facebook_url: displayFacebook || null,
    contact_page: displayContactPage || null,
    conversion_score: lead?.conversion_score ?? null,
    opportunity_score: displayScore,
    why_this_lead_is_here: lead?.why_this_lead_is_here ?? null,
    status: lead?.status ?? caseRow?.status ?? null,
    best_contact_method: lead?.best_contact_method ?? null,
    is_hot_lead: lead?.is_hot_lead ?? null,
    has_website: lead?.has_website ?? null,
    lead_tags: lead?.lead_tags ?? null,
    opportunity_reason: lead?.opportunity_reason ?? opp?.opportunity_reason ?? null,
  });
  const nextStepLabel =
    laneBundle.simplified_next_step.charAt(0).toUpperCase() + laneBundle.simplified_next_step.slice(1);
  const hasEmailPath = Boolean(displayEmail);
  const hasContactAvailable = Boolean(displayContactPage || displayFacebook);
  const displayStatus = String(lead?.status || caseRow?.status || "new");
  const displayWebsiteStatus = String(opp?.website_status || "").trim() || "unknown";
  const displayCity = (() => {
    const fromOpp = String(opp?.city || "").trim();
    if (fromOpp) return fromOpp;
    const c = String(lead?.city || "").trim();
    const s = String(lead?.state || "").trim();
    if (c && s) return `${c}, ${s}`;
    if (c || s) return c || s;
    return "—";
  })();
  const displayAddress = String(opp?.address || "").trim() || "—";
  const displayCreatedAt = lead?.created_at || caseRow?.created_at || null;
  const resolvedLeadId = String(lead?.id || "").trim();
  const leadPath = resolvedLeadId
    ? buildLeadPath(resolvedLeadId, displayBusinessName)
    : `/admin/leads/${encodeURIComponent(targetId)}`;
  const caseHref = caseRow?.id ? `/admin/cases/${encodeURIComponent(caseRow.id)}` : null;
  const quickFixCurrentIssues = topIssues.length
    ? topIssues.map((item) => item.issue).slice(0, 3)
    : issueList.slice(0, 3);
  const quickFixImprovements = quickFixSuggestions(displayCategory, quickFixCurrentIssues);
  const preferredContact = displayEmail
    ? "Email"
    : displayPhone
      ? "Phone"
      : displayContactPage
        ? "Contact Page"
        : "Website";
  const assessment = buildLeadAssessment({
    website: displayWebsite || null,
    website_status: displayWebsiteStatus,
    opportunity_score: displayScore ?? 0,
    issue_summary: String(opp?.opportunity_reason || topIssues[0]?.issue || "").trim(),
    issue_list: issueList,
    category: displayCategory,
    email: displayEmail || null,
    phone: displayPhone || null,
    contact_page: displayContactPage || null,
    facebook_url: displayFacebook || null,
    reviews_last_30_days: caseRow?.reviews_last_30_days ?? null,
    google_review_count: caseRow?.google_review_count ?? null,
    owner_post_detected: caseRow?.owner_post_detected ?? null,
    new_photos_detected: caseRow?.new_photos_detected ?? null,
    listing_recently_updated: caseRow?.listing_recently_updated ?? null,
    lead_status: displayStatus,
    has_contact_path: hasContactPath,
  });
  const displayLeadBucket = canonicalLeadBucket(assessment.lead_bucket, displayScore);
  const recommendedActionHref =
    assessment.recommended_next_action === "Generate Email"
      ? `${leadPath}?generate=1`
      : assessment.recommended_next_action === "Send First Touch"
        ? `${leadPath}?compose=1`
        : displayWebsite
          ? displayWebsite
          : caseHref || leadPath;
  const quickFixSummary = quickFixImprovements[0] || null;
  const hasStrongWebsiteOpportunity =
    ["no_website", "broken_website", "outdated_website", "facebook_only", "mobile_layout_issue", "http_only"].includes(
      String(displayWebsiteStatus || "").toLowerCase()
    ) || issueList.some((issue) => {
      const text = String(issue || "").toLowerCase();
      return (
        text.includes("no website") ||
        text.includes("broken") ||
        text.includes("outdated") ||
        text.includes("mobile") ||
        text.includes("facebook only")
      );
    });
  const hasStrongLocalSignal =
    Number(caseRow?.google_review_count || 0) >= 8 ||
    Number(caseRow?.google_rating || 0) >= 4.2 ||
    Number(displayScore || 0) >= 70;
  const doorToDoorCandidate = Boolean(
    !hasEmailPath &&
      !hasContactAvailable &&
      String(displayBusinessName || "").trim() &&
      String(displayAddress || "").trim() &&
      String(displayCity || "").trim() &&
      hasStrongWebsiteOpportunity &&
      hasStrongLocalSignal
  );
  const contactReadiness = hasEmailPath
    ? "Email Ready"
    : hasContactAvailable
      ? "Contact Available"
      : doorToDoorCandidate
        ? "Door-to-Door Candidate"
        : "Low Priority";
  const suggestedChannel = hasEmailPath
    ? "Email"
    : displayContactPage
      ? "Contact Form"
      : displayFacebook
        ? "Facebook"
        : doorToDoorCandidate
          ? "Door-to-Door"
          : "Skip";
  const nextAction = hasEmailPath
    ? assessment.recommended_next_action
    : hasContactAvailable
      ? "Open Contact Path"
      : doorToDoorCandidate
        ? "Save for Door-to-Door"
        : "Skip For Now";
  const outreachChannel: "email" | "contact" | "door_to_door" | "skip" = hasEmailPath
    ? "email"
    : hasContactAvailable
      ? "contact"
      : doorToDoorCandidate
        ? "door_to_door"
        : "skip";
  const valueInfo = computeEstimatedValue(displayCategory);
  const expectedCloseProbability = expectedCloseProbabilityNumber(
    (String(assessment.close_probability || "").toLowerCase() as "low" | "medium" | "high") || null,
    displayScore
  );
  const hasStandaloneSite =
    Boolean(String(displayWebsite || "").trim()) && leadHasStandaloneWebsite(displayWebsite);
  const facebookOnlyForOffer =
    !hasStandaloneSite &&
    (Boolean(displayFacebook) ||
      String(displayWebsite || "").toLowerCase().includes("facebook.com") ||
      String(displayWebsite || "").toLowerCase().includes("fb.com"));
  let primaryOfferLine = "Offer a tighter, clearer site.";
  if (facebookOnlyForOffer) primaryOfferLine = "Help them get off Facebook and onto a real site.";
  else if (!hasStandaloneSite) primaryOfferLine = "Offer a simple website.";
  else if (assessment.situation_headline === "Has a weak website.") primaryOfferLine = "Offer a quick redesign.";

  const shortEmailPitch = hasStandaloneSite
    ? `Hey — I took a quick look at your site and see a few easy wins.
I help local businesses get more calls with simple, cleaner sites.
Want me to show you a quick example?`
    : `Hey — I noticed you don't have a website.
I help businesses get more calls with simple sites.
Want me to show you a quick example?`;
  const shortTextPitch = `Hey this is Topher — I help businesses get more calls with simple websites.
Want me to show you a quick idea?`;
  const shortDoorPitch = `Hi, I'm Topher — I help local businesses get found online. Got two minutes for a quick idea?`;

  const hasWebsitePreviewContent =
    Boolean(displayWebsite) ||
    Boolean(desktopScreenshotUrl) ||
    Boolean(mobileScreenshotUrl) ||
    Boolean(contactScreenshotUrl) ||
    fallbackScreenshotUrls.length > 0;
  const showGoogleReviewCount =
    caseRow?.google_review_count != null && String(caseRow.google_review_count).trim() !== "";
  const showGoogleRating =
    caseRow?.google_rating != null && String(caseRow.google_rating).trim() !== "";

  const showTopLoadWarningBanner = loadWarnings.length > 0 && !lead;

  return (
    <div className="space-y-6">
      {showTopLoadWarningBanner ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "#fca5a5" }}>
            Could not load this lead normally. Details below.
          </p>
          <ul className="list-disc pl-5 mt-2 text-xs" style={{ color: "var(--admin-muted)" }}>
            {Array.from(new Set(loadWarnings)).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {!lead && (opp || caseRow) ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            Lead could not be fully loaded. Showing available related data.
          </p>
        </section>
      ) : null}
      <section className="admin-card space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2 min-w-0 flex-1">
            <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
              {displayBusinessName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`admin-badge ${leadStatusClass(displayStatus)}`}>{prettyLeadStatus(displayStatus)}</span>
              {displayScore != null ? (
                <span style={{ color: "var(--admin-muted)" }}>
                  Score <strong style={{ color: "var(--admin-fg)" }}>{displayScore}</strong>
                </span>
              ) : null}
              <span
                className="text-[10px] px-2 py-0.5 rounded border"
                style={{ borderColor: "rgba(212,175,55,0.45)", color: "var(--admin-gold)" }}
              >
                {laneBundle.lead_bucket.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm leading-snug" style={{ color: "var(--admin-fg)" }}>
              {laneBundle.honest_headline}
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--admin-gold)" }}>
              Next step: {nextStepLabel}
            </p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Contact readiness: {laneBundle.contact_readiness} · {laneBundle.summary_line}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0 self-start min-w-[200px]">
            <BackToLeadsLink className="admin-btn-ghost text-sm whitespace-nowrap" />
            {resolvedLeadId ? (
              <div className="flex flex-col gap-2 w-full items-end">
                <PromoteToTopPicksButton
                  leadId={resolvedLeadId}
                  initialTags={lead?.lead_tags}
                  isTopPick={isTopPickLead({
                    source: lead?.source,
                    lead_source: lead?.lead_source,
                    lead_tags: lead?.lead_tags,
                  })}
                  className="admin-btn-ghost text-sm px-3 py-2 rounded-lg border border-emerald-500/35 w-full sm:w-auto"
                />
                <LeadDetailCleanupActions leadId={resolvedLeadId} initialTags={lead?.lead_tags} className="w-full" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <LeadContactNow
        bestContactMethod={resolvedBest.method}
        bestContactValue={resolvedBest.value}
        advertisingPageUrl={resolvedAdvertising.url}
        advertisingPageLabel={resolvedAdvertising.label}
        email={displayEmail || null}
        facebookUrl={displayFacebook || null}
        phone={displayPhone || null}
        contactPage={displayContactPage || null}
        website={displayWebsite || null}
      />

      <div className="space-y-6">
          <section className="admin-card space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              What to do
            </h2>
            <p className="text-sm font-medium" style={{ color: "var(--admin-fg)" }}>
              {primaryOfferLine}
            </p>
            {resolvedLeadId ? (
              <LeadPrimaryActions
                leadId={resolvedLeadId}
                hasContactPath={hasContactPath}
                initialNextFollowUpAt={String(lead?.next_follow_up_at || "").trim() || null}
                leadStatus={lead?.status || null}
                unreadReplyCount={
                  lead?.unread_reply_count == null || Number.isNaN(Number(lead.unread_reply_count))
                    ? null
                    : Math.max(0, Number(lead.unread_reply_count))
                }
              />
            ) : null}
          </section>

          <section className="admin-card space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              What to say
            </h2>
            {resolvedLeadId ? (
              <LeadSuggestedResponse
                businessName={displayBusinessName}
                leadId={resolvedLeadId}
                composeHref={leadPath}
                bestContactMethod={resolvedBest.method}
                bestContactValue={resolvedBest.value}
                email={displayEmail || null}
                facebookUrl={displayFacebook || null}
                phone={displayPhone || null}
                suggestedTemplateKey={displaySuggestedTemplateKey || null}
                suggestedResponse={displaySuggestedResponse || null}
              />
            ) : null}
            <LeadPitchPanel
              emailPitch={shortEmailPitch}
              textPitch={shortTextPitch}
              doorPitch={shortDoorPitch}
              showDoor={false}
            />
          </section>

          <details className="admin-card">
            <summary className="text-sm font-semibold cursor-pointer" style={{ color: "var(--admin-fg)" }}>
              More details (optional)
            </summary>
            <div className="mt-3 space-y-4">
            {assessment.matters_bullets.filter(Boolean).length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Why this matters
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: "var(--admin-fg)" }}>
              {assessment.matters_bullets.filter(Boolean).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
          ) : null}

            <details className="rounded-lg border p-2 text-xs" style={{ borderColor: "var(--admin-border)" }}>
              <summary className="cursor-pointer" style={{ color: "var(--admin-muted)" }}>
                Technical (support)
              </summary>
              <div className="mt-2 grid gap-1 font-mono" style={{ color: "var(--admin-muted)" }}>
                <p>lead_exists_by_id: {leadExistsById ? "true" : "false"}</p>
                <p>owner_id_on_row: {leadOwnerOnRow || "null"}</p>
                <p>current_user_id: {ownerId || "null"}</p>
                <p>workspace_id_on_row: {leadWorkspaceOnRow || "null"}</p>
                <p>owner_workspace_filter_blocked_row: {ownerWorkspaceFilterBlockedRow ? "true" : "false"}</p>
                <p>detail_failure_reason: {detailFailureReason || "none"}</p>
              </div>
            </details>

            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {displayCategory} · {displayCity}
              {displayAddress && displayAddress !== "—" ? ` · ${displayAddress}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {getLeadPriorityBadges({
                isHotLead: Boolean(lead?.is_hot_lead),
                bucket: displayLeadBucket,
                score: displayScore,
                email: displayEmail,
                phone: displayPhone,
              }).map((badge) => (
                <span key={badge.key} className={`admin-priority-badge ${badge.className}`}>
                  {badge.label}
                </span>
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Added {fmtDate(displayCreatedAt)}
            </p>
            {caseHref ? (
              <Link href={caseHref} className="admin-btn-ghost text-sm inline-block">
                Open case file
              </Link>
            ) : null}

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Lead assessment
            </h2>
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Lead Bucket:</span>{" "}
                <LeadBucketBadge bucket={displayLeadBucket} score={displayScore} />
              </div>
              <div><span style={{ color: "var(--admin-muted)" }}>Lead Type:</span> {assessment.lead_type}</div>
              <div><span style={{ color: "var(--admin-muted)" }}>Close Probability:</span> {assessment.close_probability}</div>
              <div><span style={{ color: "var(--admin-muted)" }}>Best Contact Method:</span> {assessment.best_contact_method || "none"}</div>
              <div><span style={{ color: "var(--admin-muted)" }}>Recommended Next Action:</span> {assessment.recommended_next_action}</div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              At a glance
            </h2>
            <div className="space-y-2 text-sm">
              <p><span style={{ color: "var(--admin-muted)" }}>Contact readiness:</span> {contactReadiness}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Suggested channel:</span> {suggestedChannel}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Estimated value:</span> {valueInfo.estimated_value} ({valueInfo.estimated_price_range})</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Beginner pricing lane:</span> {Number(displayScore || 0) >= 75 ? "Business setup ($900)" : "Starter setup ($400)"}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Deal status:</span> {String(lead?.deal_status || "none").replace(/_/g, " ")}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Deal stage:</span> {String(lead?.deal_stage || "new").replace(/_/g, " ")}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Deal value:</span> {lead?.deal_value ? `$${Number(lead.deal_value).toFixed(0)}` : "Not set yet"}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Closed at:</span> {fmtDate(lead?.closed_at)}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Recurring client:</span> {lead?.is_recurring_client ? "Yes" : "No"}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Monthly value:</span> {lead?.monthly_value ? `$${Number(lead.monthly_value).toFixed(0)}/mo` : "Not on plan"}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Subscription started:</span> {fmtDate(lead?.subscription_started_at)}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Referred by:</span> {String(lead?.referred_by || "—")}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Referral source:</span> {String(lead?.referral_source || "—")}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Referrals generated by this client:</span> {referralsGeneratedCount}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Expected close probability:</span> {expectedCloseProbability}%</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Worth now vs later:</span> {hasEmailPath || hasContactAvailable ? "Worth working now" : doorToDoorCandidate ? "Save for selective in-person outreach" : "Save for later / low priority"}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Best next move:</span> {nextAction}</p>
              <p className="text-sm pt-2 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <span style={{ color: "var(--admin-muted)" }}>Angle: </span>
                {assessment.best_pitch_angle}
              </p>
            </div>
          </section>

          {(quickFixCurrentIssues.length > 0 || quickFixImprovements.length > 0) ? (
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Quick win ideas
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>
                  Current issues
                </p>
                {quickFixCurrentIssues.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {quickFixCurrentIssues.map((issue, idx) => (
                      <li key={`${issue}-${idx}`}>{issue}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>
                  Suggested fixes
                </p>
                {quickFixImprovements.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {quickFixImprovements.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </section>
          ) : null}

          {hasWebsitePreviewContent ? (
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website preview
            </h2>
            <div className="text-sm mb-3 flex flex-wrap items-center gap-2" style={{ color: "var(--admin-muted)" }}>
              {displayWebsite ? (
                <a href={displayWebsite} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                  {displayWebsite}
                </a>
              ) : null}
              <span className="admin-badge admin-badge-progress">{preferredContact}</span>
            </div>
            {!desktopScreenshotUrl && !mobileScreenshotUrl && !contactScreenshotUrl && fallbackScreenshotUrls.length === 0 ? null : (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  {desktopScreenshotUrl ? (
                    <a
                      href={desktopScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border rounded-md overflow-hidden"
                      style={{ borderColor: "var(--admin-border)" }}
                    >
                      <img src={desktopScreenshotUrl} alt="Desktop homepage screenshot" className="w-full h-auto block" />
                      <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Desktop</div>
                    </a>
                  ) : null}
                  {mobileScreenshotUrl ? (
                    <a
                      href={mobileScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border rounded-md overflow-hidden"
                      style={{ borderColor: "var(--admin-border)" }}
                    >
                      <img src={mobileScreenshotUrl} alt="Mobile homepage screenshot" className="w-full h-auto block" />
                      <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Mobile</div>
                    </a>
                  ) : null}
                  {contactScreenshotUrl ? (
                    <a
                      href={contactScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border rounded-md overflow-hidden"
                      style={{ borderColor: "var(--admin-border)" }}
                    >
                      <img src={contactScreenshotUrl} alt="Contact page screenshot" className="w-full h-auto block" />
                      <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Contact Page</div>
                    </a>
                  ) : null}
                </div>
                {fallbackScreenshotUrls.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {fallbackScreenshotUrls.slice(0, 2).map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block border rounded-md overflow-hidden"
                        style={{ borderColor: "var(--admin-border)" }}
                      >
                        <img src={url} alt="Additional lead screenshot" className="w-full h-auto block" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>
          ) : null}

          {websiteAudit ? (
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website check
            </h2>
              <div className="space-y-3 text-sm">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Mobile score: </span>
                    {Number.isFinite(Number(websiteAudit.mobile_score))
                      ? Number(websiteAudit.mobile_score)
                      : ""}
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Load time: </span>
                    {Number.isFinite(Number(websiteAudit.load_time))
                      ? `${Number(websiteAudit.load_time).toFixed(2)}s`
                      : ""}
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Broken internal links: </span>
                    {auditChecks?.broken_links_count ?? auditChecks?.broken_internal_links_count ?? ""}
                  </div>
                </div>
                <ul className="grid gap-1 md:grid-cols-2 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <li>Large images &gt;300KB: {auditChecks?.large_images_over_300kb ?? ""}</li>
                  <li>Missing meta description: {fmtBool(auditChecks?.missing_meta_description)}</li>
                  <li>Missing H1: {fmtBool(auditChecks?.missing_h1)}</li>
                  <li>CTA present: {fmtBool(auditChecks?.cta_present)}</li>
                  <li>Homepage phone present: {fmtBool(auditChecks?.homepage_phone_present)}</li>
                  <li>Missing viewport meta: {fmtBool(auditChecks?.missing_viewport_meta)}</li>
                  <li>Small text/crowded buttons: {fmtBool(auditChecks?.small_text_or_crowded_buttons)}</li>
                  <li>Contact page present: {fmtBool(auditChecks?.contact_page_present)}</li>
                  <li>Contact click depth: {auditChecks?.contact_click_depth ?? ""}</li>
                </ul>
                {websiteAuditIssues.length > 0 ? (
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>
                      Audit issues
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {websiteAuditIssues.map((issue, idx) => (
                        <li key={`${issue}-${idx}`}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
          </section>
          ) : null}

          {activitySummary.length > 0 ? (
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Business activity
            </h2>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {activitySummary.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
          </section>
          ) : null}

          {(showGoogleReviewCount || showGoogleRating || displayInstagram) ? (
          <section className="admin-card space-y-2 text-sm">
            <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Reviews & social
            </h2>
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              {showGoogleReviewCount ? (
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Google reviews: </span>
                {caseRow?.google_review_count}
              </div>
              ) : null}
              {showGoogleRating ? (
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Google rating: </span>
                {caseRow?.google_rating}
              </div>
              ) : null}
              {displayInstagram ? (
              <div className="md:col-span-2">
                <span style={{ color: "var(--admin-muted)" }}>Instagram: </span>
                <a href={displayInstagram} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                  Open
                </a>
              </div>
              ) : null}
            </div>
          </section>
          ) : null}

          {(messageRows || []).length > 0 ? (
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Message history
            </h2>
              <ul className="space-y-2">
                {(messageRows || []).map((item) => (
                  <li key={String(item.id || "")} className="text-sm border rounded-md p-2" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--admin-muted)" }}>
                      <span>{String(item.direction || "message")}</span>
                      <span>{String(item.delivery_status || "")}</span>
                      <span>{fmtDate(String(item.received_at || item.sent_at || item.created_at || ""))}</span>
                    </div>
                    <div className="font-medium mt-1">{String(item.subject || "")}</div>
                    <div className="text-xs mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-muted)" }}>
                      {String(item.body || "").slice(0, 500)}
                    </div>
                  </li>
                ))}
              </ul>
          </section>
          ) : null}

          {resolvedLeadId ? (
            <div className="admin-card">
              <LeadActivityTimeline leadId={resolvedLeadId} />
            </div>
          ) : null}

          <div className="pt-2">
            <Link href={recommendedActionHref} className="admin-btn-ghost text-sm">
              {assessment.recommended_next_action}
            </Link>
          </div>

          <div className="pt-4 border-t space-y-4" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Outreach & drafts
            </p>
            {resolvedLeadId ? (
              <LeadWorkspaceScrollAnchor focusOutreach={focusOutreach}>
                <LeadMockupSharePanel leadId={resolvedLeadId} businessName={displayBusinessName} />
                <LeadWorkspaceActions
                  leadId={resolvedLeadId}
                  linkedOpportunityId={oppId || null}
                  initialBusinessName={displayBusinessName}
                  initialCategory={displayCategory}
                  initialCity={displayCity === "—" ? null : displayCity}
                  initialIssue={topIssues[0]?.issue || "Contact info is hard to find"}
                  initialStatus={lead?.status || null}
                  initialDealStatus={lead?.deal_status || null}
                  initialDealStage={lead?.deal_stage || "new"}
                  initialLastReplyPreview={lead?.last_reply_preview || null}
                  initialUnreadReplyCount={
                    lead?.unread_reply_count == null || Number.isNaN(Number(lead.unread_reply_count))
                      ? null
                      : Math.max(0, Number(lead.unread_reply_count))
                  }
                  initialEmail={displayEmail || null}
                  initialPhone={displayPhone || null}
                  website={displayWebsite || null}
                  contactPage={displayContactPage || null}
                  facebookUrl={displayFacebook || null}
                  caseHref={caseHref}
                  initialNotes={[String(lead?.notes || "").trim(), String(caseRow?.notes || "").trim()].filter(Boolean)}
                  initialDoorStatus={lead?.door_status || "not_visited"}
                  initialRealWorldWhyTarget={lead?.real_world_why_target || lead?.known_context || null}
                  initialRealWorldWalkInPitch={lead?.real_world_walk_in_pitch || null}
                  initialBestTimeToVisit={lead?.best_time_to_visit || null}
                  quickFixSummary={quickFixSummary}
                  autoGenerate={generate === "1"}
                  autoCompose={compose === "1"}
                  autoOpenSampleBuilder={sample === "1"}
                  initialLastOutreachChannel={
                    lead?.last_outreach_channel === "email" ||
                    lead?.last_outreach_channel === "facebook" ||
                    lead?.last_outreach_channel === "text"
                      ? lead.last_outreach_channel
                      : null
                  }
                  initialLastOutreachStatus={
                    lead?.last_outreach_status === "draft" ||
                    lead?.last_outreach_status === "sending" ||
                    lead?.last_outreach_status === "sent" ||
                    lead?.last_outreach_status === "failed"
                      ? lead.last_outreach_status
                      : null
                  }
                  initialLastOutreachSentAt={String(lead?.last_outreach_sent_at || "").trim() || null}
                  initialSuggestedOutreachSubject={
                    displaySuggestedResponse.trim()
                      ? `Quick idea — ${displayBusinessName}`.slice(0, 200)
                      : null
                  }
                  initialSuggestedOutreachBody={displaySuggestedResponse.trim() || null}
                />
              </LeadWorkspaceScrollAnchor>
            ) : (
              <section className="admin-card">
                <h3 className="text-sm font-semibold">Outreach Panel</h3>
                <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
                  Outreach actions are disabled because the lead row could not be resolved.
                </p>
              </section>
            )}
          </div>

            </div>
          </details>
      </div>
    </div>
  );
}
