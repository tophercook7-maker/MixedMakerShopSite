import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadWorkspaceActions } from "@/components/admin/lead-workspace-actions";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath, isUuidLike, leadRouteMatches, parseLeadRouteToken } from "@/lib/lead-route";
import { getLeadPriorityBadges, leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";
import { LeadPitchPanel } from "@/components/admin/lead-pitch-panel";
import { ensureLeadFromOpportunityToken } from "@/lib/opportunity-lead-sync";
import { SaveLocalLeadToWorkspace } from "@/components/admin/save-local-lead-to-workspace";

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
    "deal_status",
    "deal_stage",
    "last_reply_preview",
    "notes",
    "created_at",
  ].join(","),
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

function deriveCloseProbability(score: number | null | undefined, category: string | null | undefined, issues: string[]) {
  const s = Number(score ?? 0);
  const cat = String(category || "").toLowerCase();
  const highCat = [
    "dentist",
    "chiropractor",
    "restaurant",
    "cafe",
    "gym",
    "salon",
    "auto repair",
    "plumber",
    "contractor",
  ].some((k) => cat.includes(k));
  const hasCaptureIssue = issues.some((i) => {
    const t = String(i || "").toLowerCase();
    return t.includes("booking") || t.includes("ordering") || t.includes("contact");
  });
  if (s >= 85 || (s >= 70 && highCat && hasCaptureIssue)) return "high";
  if (s >= 60 || highCat) return "medium";
  return "low";
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
  return "—";
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

function generateLeadPitches(input: {
  businessName: string;
  category: string;
  issue: string;
  contactType: "email" | "contact" | "door_to_door" | "skip";
}): { email_pitch: string; text_pitch: string; door_pitch: string } {
  const business = input.businessName || "your business";
  const category = input.category || "business";
  const issue = input.issue || "a website issue";
  const contactHint =
    input.contactType === "email"
      ? "I can send a quick before/after concept by email."
      : input.contactType === "contact"
        ? "I can send a quick idea through your contact form."
        : "I can show a quick local example in person.";
  return {
    email_pitch: `Hi ${business}, I noticed ${issue} on your ${category} web presence. ${contactHint} Would you like a quick example tailored for your business?`,
    text_pitch: `Hi ${business}, Topher here. I noticed ${issue} on your website and can show a quick improvement idea that helps customers reach you faster. Want me to send it?`,
    door_pitch: `Hi, I am Topher with Topher's Web Design. I help local ${category} businesses fix issues like ${issue}. I put together a quick idea for ${business} to help get more customer actions.`,
  };
}

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generate?: string; compose?: string; sample?: string }>;
}) {
  const { id } = await params;
  const { generate, compose, sample } = await searchParams;
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
        <SaveLocalLeadToWorkspace localLeadId={targetId} />
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
      if (scopedResult.errors.length > 0 && scopedLeadRows.length === 0) {
        loadWarnings.push("Lead detail query had schema mismatches; using compatible fallback.");
      }
      const scopedLead = (scopedLeadRows[0] as LeadRow | undefined) || null;
      ownerWorkspaceFilterBlockedRow = Boolean(unscopedLead && !scopedLead);
      lead = scopedLead || null;
      if (ownerWorkspaceFilterBlockedRow) {
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
  const signalEmailSource =
    (Array.isArray(opp?.opportunity_signals) ? opp!.opportunity_signals : [])
      .map((v) => String(v || "").trim())
      .find((signal) => signal.toLowerCase().startsWith("email_source:"))
      ?.split(":")[1]
      ?.trim() || "";
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
    return (
      <div className="space-y-4">
        <section className="admin-card">
          <h1 className="text-2xl font-bold">Lead workspace</h1>
          <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
            {detailFailureReason === "owner_workspace_mismatch"
              ? "Lead exists but is not in your workspace."
              : "Lead does not exist."}
          </p>
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
    String(lead?.industry || "").trim() ||
    "—";
  const displayScore = Number(
    opp?.opportunity_score ??
      lead?.opportunity_score ??
      0
  );
  const displayWebsite =
    String(opp?.website || "").trim() ||
    String(lead?.website || "").trim();
  const displayEmail = String(lead?.email || caseRow?.email || "").trim();
  const displayEmailSource = displayEmail ? (signalEmailSource || "unknown") : "unknown";
  const displayPhone = String(caseRow?.phone_from_site || lead?.phone || "").trim();
  const displayContactPage = String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim();
  const displayFacebook = String(caseRow?.facebook_url || caseRow?.facebook || "").trim();
  const displayInstagram = String(caseRow?.instagram_url || caseRow?.instagram || "").trim();
  const hasContactPath = Boolean(displayEmail || displayPhone || displayContactPage || displayFacebook);
  const hasEmailPath = Boolean(displayEmail);
  const hasContactAvailable = Boolean(displayContactPage || displayFacebook);
  const displayStatus = String(lead?.status || caseRow?.status || "new");
  const displayWebsiteStatus = String(opp?.website_status || "").trim() || "unknown";
  const displayCity = String(opp?.city || "").trim() || "—";
  const displayAddress = String(opp?.address || "").trim() || "—";
  const closeProbability =
    String(opp?.close_probability || "").toLowerCase() ||
    deriveCloseProbability(opp?.opportunity_score ?? lead?.opportunity_score, opp?.category || lead?.industry, issueList);
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
    opportunity_score: displayScore,
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
  const pitches = generateLeadPitches({
    businessName: displayBusinessName,
    category: displayCategory,
    issue: String(opp?.opportunity_reason || topIssues[0]?.issue || "website issues").trim(),
    contactType: outreachChannel,
  });

  return (
    <div className="space-y-6">
      {loadWarnings.length > 0 ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "#fca5a5" }}>
            Lead found, but related website/case data is missing.
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
      <section className="admin-card">
        <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--admin-muted)" }}>
          Detail Loader Diagnostics
        </p>
        <div className="mt-2 grid gap-2 text-xs" style={{ color: "var(--admin-muted)" }}>
          <p>lead_exists_by_id: {leadExistsById ? "true" : "false"}</p>
          <p>owner_id_on_row: {leadOwnerOnRow || "null"}</p>
          <p>current_user_id: {ownerId || "null"}</p>
          <p>workspace_id_on_row: {leadWorkspaceOnRow || "null"}</p>
          <p>owner_workspace_filter_blocked_row: {ownerWorkspaceFilterBlockedRow ? "true" : "false"}</p>
          <p>detail_failure_reason: {detailFailureReason || "none"}</p>
        </div>
      </section>
      <section className="admin-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
              {displayBusinessName}
            </h1>
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {displayCategory} · {displayCity} · Score {displayScore || "—"} · {displayLeadBucket} · Status {displayStatus.replace(/_/g, " ")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`admin-badge ${leadStatusClass(displayStatus)}`}>{prettyLeadStatus(displayStatus)}</span>
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
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Opportunity reason: {String(opp?.opportunity_reason || topIssues[0]?.issue || "Contact info is hard to find").trim()}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Website: {displayWebsite ? (
                <a href={displayWebsite} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                  {displayWebsite}
                </a>
              ) : "—"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Website status: {displayWebsiteStatus}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Address: {displayAddress}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Close probability: {closeProbability}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Created {fmtDate(displayCreatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/leads" className="admin-btn-ghost">
              Back to Leads
            </Link>
            <Link href={caseHref || "/admin/cases"} className="admin-btn-ghost">
              Open Case
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Lead Assessment
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
            <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
              <span style={{ color: "var(--admin-fg)" }}>Best Pitch Angle:</span> {assessment.best_pitch_angle}
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Lead Usefulness Summary
            </h2>
            <div className="space-y-2 text-sm">
              <p><span style={{ color: "var(--admin-muted)" }}>Contact readiness:</span> {contactReadiness}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Suggested channel:</span> {suggestedChannel}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Estimated value:</span> {valueInfo.estimated_value} ({valueInfo.estimated_price_range})</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Beginner pricing lane:</span> {Number(displayScore || 0) >= 75 ? "Standard site ($300-$500)" : "Basic website ($150-$300)"}</p>
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
              <p><span style={{ color: "var(--admin-muted)" }}>Why this still matters:</span> {doorToDoorCandidate ? "Active local business with a real website gap and no online contact path." : assessment.why_this_lead_is_here}</p>
              <p><span style={{ color: "var(--admin-muted)" }}>Recommended next action:</span> {nextAction}</p>
            </div>
          </section>

          <LeadPitchPanel
            emailPitch={pitches.email_pitch}
            textPitch={pitches.text_pitch}
            doorPitch={pitches.door_pitch}
          />

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              What’s Really Going On
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>Top issues</p>
                <ul className="list-disc pl-5 space-y-1">
                  {(quickFixCurrentIssues.length ? quickFixCurrentIssues : ["Contact info is hard to find"]).slice(0, 3).map((issue, idx) => (
                    <li key={`${issue}-${idx}`}>{issue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>Why it matters</p>
                <ul className="list-disc pl-5 space-y-1">
                  {[
                    "Customers may have trouble contacting the business quickly.",
                    "Mobile visitors may leave before taking action.",
                    "A weaker web presence can reduce trust and conversions.",
                  ].map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <p style={{ color: "var(--admin-muted)" }}>
                <span style={{ color: "var(--admin-fg)" }}>Best pitch angle:</span> {assessment.best_pitch_angle}
              </p>
              <p style={{ color: "var(--admin-muted)" }}>
                <span style={{ color: "var(--admin-fg)" }}>Recommended next action:</span> {assessment.recommended_next_action}
              </p>
            </div>
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Quick Fix Preview
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>
                  Current Issues
                </p>
                {quickFixCurrentIssues.length ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {quickFixCurrentIssues.map((issue, idx) => (
                      <li key={`${issue}-${idx}`}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    Contact info is hard to find.
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>
                  Suggested Fixes
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {quickFixImprovements.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website Preview
            </h2>
            <div className="text-sm mb-3 flex flex-wrap items-center gap-2" style={{ color: "var(--admin-muted)" }}>
              {displayWebsite ? (
                <a href={displayWebsite} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                  {displayWebsite}
                </a>
              ) : (
                <span>No website captured</span>
              )}
              <span className="admin-badge admin-badge-progress">{preferredContact}</span>
            </div>
            {!desktopScreenshotUrl && !mobileScreenshotUrl && !contactScreenshotUrl && fallbackScreenshotUrls.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No screenshots available.
              </p>
            ) : (
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

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website Issues
            </h2>
            {topIssues.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Contact info is hard to find.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Issues detected:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {topIssues.map((entry, idx) => (
                    <li key={`${entry.category}-${entry.issue}-${idx}`}>
                      <span className="font-medium">{entry.category}:</span> {entry.issue}
                    </li>
                  ))}
                </ul>
                <details className="text-sm">
                  <summary className="cursor-pointer text-[var(--admin-gold)]">Expand issue details</summary>
                  <ul className="list-disc pl-5 pt-2 space-y-1">
                    {structuredIssues.slice(3).map((entry, idx) => (
                      <li key={`${entry.category}-${entry.issue}-${idx}`}>
                        <span className="font-medium">{entry.category}:</span> {entry.issue}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website Audit
            </h2>
            {!websiteAudit ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No structured website audit captured yet.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Mobile score: </span>
                    {Number.isFinite(Number(websiteAudit.mobile_score))
                      ? Number(websiteAudit.mobile_score)
                      : "—"}
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Load time: </span>
                    {Number.isFinite(Number(websiteAudit.load_time))
                      ? `${Number(websiteAudit.load_time).toFixed(2)}s`
                      : "—"}
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Broken internal links: </span>
                    {auditChecks?.broken_links_count ?? auditChecks?.broken_internal_links_count ?? "—"}
                  </div>
                </div>
                <ul className="grid gap-1 md:grid-cols-2 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <li>Large images &gt;300KB: {auditChecks?.large_images_over_300kb ?? "—"}</li>
                  <li>Missing meta description: {fmtBool(auditChecks?.missing_meta_description)}</li>
                  <li>Missing H1: {fmtBool(auditChecks?.missing_h1)}</li>
                  <li>CTA present: {fmtBool(auditChecks?.cta_present)}</li>
                  <li>Homepage phone present: {fmtBool(auditChecks?.homepage_phone_present)}</li>
                  <li>Missing viewport meta: {fmtBool(auditChecks?.missing_viewport_meta)}</li>
                  <li>Small text/crowded buttons: {fmtBool(auditChecks?.small_text_or_crowded_buttons)}</li>
                  <li>Contact page present: {fmtBool(auditChecks?.contact_page_present)}</li>
                  <li>Contact click depth: {auditChecks?.contact_click_depth ?? "—"}</li>
                </ul>
                {websiteAuditIssues.length > 0 ? (
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>
                      Audit issues:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {websiteAuditIssues.map((issue, idx) => (
                        <li key={`${issue}-${idx}`}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    No audit issues captured.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Activity Summary
            </h2>
            {activitySummary.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No recent Google Business activity signals captured yet.
              </p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {activitySummary.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Contact Methods
            </h2>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Email: </span>
                {displayEmail ? (
                  <a href={`mailto:${displayEmail}`} className="text-[var(--admin-gold)] hover:underline">
                    {displayEmail}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Email Source: </span>
                {displayEmailSource}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Phone: </span>
                {displayPhone ? (
                  <a href={`tel:${displayPhone}`} className="text-[var(--admin-gold)] hover:underline">
                    {displayPhone}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Contact Page: </span>
                {displayContactPage ? (
                  <a href={displayContactPage} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Facebook: </span>
                {displayFacebook ? (
                  <a href={displayFacebook} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Google reviews: </span>
                {caseRow?.google_review_count ?? "—"}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Google rating: </span>
                {caseRow?.google_rating ?? "—"}
              </div>
            </div>
            {!hasContactPath ? (
              <p className="text-xs mt-2" style={{ color: "#fca5a5" }}>
                No direct contact info found yet
              </p>
            ) : null}
            {hasContactPath && !hasEmailPath ? (
              <p className="text-xs mt-2" style={{ color: "#fca5a5" }}>
                No email found yet. This lead is marked Research Later.
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {resolvedLeadId ? (
                <Link href={`/preview/${encodeURIComponent(resolvedLeadId)}`} target="_blank" className="admin-btn-primary">
                  Generate Client Site Draft
                </Link>
              ) : null}
              {displayEmail ? (
                <a href={`mailto:${displayEmail}`} className="admin-btn-primary">
                  Email
                </a>
              ) : null}
              {displayContactPage ? (
                <a href={displayContactPage} target="_blank" rel="noreferrer" className="admin-btn-ghost">
                  Contact Form/Page
                </a>
              ) : null}
              {displayPhone ? (
                <a href={`tel:${displayPhone}`} className="admin-btn-ghost">
                  Call
                </a>
              ) : null}
              {displayFacebook ? (
                <a href={displayFacebook} target="_blank" rel="noreferrer" className="admin-btn-ghost">
                  Facebook
                </a>
              ) : null}
              {displayInstagram ? (
                <a href={displayInstagram} target="_blank" rel="noreferrer" className="admin-btn-ghost">
                  Instagram
                </a>
              ) : null}
            </div>
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Timeline
            </h2>
            {(messageRows || []).length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No conversation messages recorded yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {(messageRows || []).map((item) => (
                  <li key={String(item.id || "")} className="text-sm border rounded-md p-2" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--admin-muted)" }}>
                      <span>{String(item.direction || "message")}</span>
                      <span>{String(item.delivery_status || "—")}</span>
                      <span>{fmtDate(String(item.received_at || item.sent_at || item.created_at || ""))}</span>
                    </div>
                    <div className="font-medium mt-1">{String(item.subject || "(no subject)")}</div>
                    <div className="text-xs mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-muted)" }}>
                      {String(item.body || "").slice(0, 500) || "(empty body)"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              What to do next
            </h2>
            <ol className="list-decimal pl-5 text-sm space-y-1" style={{ color: "var(--admin-muted)" }}>
              <li>Review screenshot</li>
              <li>Check issue summary</li>
              <li>Use best pitch angle</li>
              <li>Click Generate Email</li>
              <li>Click Send Email</li>
            </ol>
            <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
              Recommended action: {assessment.recommended_next_action}
            </p>
            <div className="mt-3">
              <Link href={recommendedActionHref} className="admin-btn-primary text-sm">
                {assessment.recommended_next_action}
              </Link>
            </div>
          </section>
          {resolvedLeadId ? (
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
            />
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
    </div>
  );
}
