import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadWorkspaceActions } from "@/components/admin/lead-workspace-actions";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { canonicalLeadBucket } from "@/lib/lead-bucket";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath, isUuidLike, leadRouteMatches } from "@/lib/lead-route";

type LeadRow = {
  id: string;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  linked_opportunity_id?: string | null;
  opportunity_score?: number | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

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

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generate?: string; compose?: string }>;
}) {
  const { id } = await params;
  const { generate, compose } = await searchParams;
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

  const loadWarnings: string[] = [];
  const normalizedTargetToken = targetId.toLowerCase();
  let lead: LeadRow | null = null;
  try {
    if (isUuidLike(targetId)) {
      const { data: leadRows, error: leadError } = await supabase
        .from("leads")
        .select(
          "id,business_name,email,phone,website,industry,linked_opportunity_id,opportunity_score,status,notes,created_at"
        )
        .eq("owner_id", ownerId)
        .eq("id", targetId)
        .limit(1);
      if (leadError) {
        console.error("[Lead Detail] lead fetch failed", {
          stage: "lead_fetch",
          lead_token: targetId,
          error: leadError,
        });
        loadWarnings.push("Lead base record could not be loaded.");
      }
      lead = ((leadRows || [])[0] as LeadRow | undefined) || null;
    }
    if (!lead) {
      const { data: candidateRows, error: candidateError } = await supabase
        .from("leads")
        .select(
          "id,business_name,email,phone,website,industry,linked_opportunity_id,opportunity_score,status,notes,created_at"
        )
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (candidateError) {
        console.error("[Lead Detail] lead slug lookup failed", {
          stage: "lead_slug_lookup",
          lead_token: targetId,
          error: candidateError,
        });
        loadWarnings.push("Lead route lookup failed.");
      } else {
        lead =
          ((candidateRows || []) as LeadRow[]).find((row) =>
            leadRouteMatches(normalizedTargetToken, row.id, row.business_name || null)
          ) || null;
      }
    }
  } catch (error) {
    console.error("[Lead Detail] lead fetch threw", {
      stage: "lead_fetch",
      lead_token: targetId,
      error,
    });
    loadWarnings.push("Lead base record could not be loaded.");
  }

  let caseRow: CaseRow | null = null;

  const linkedOppId = String(lead?.linked_opportunity_id || "").trim();
  if (!caseRow && linkedOppId) {
    try {
      const { data: caseByOppRows, error: caseError } = await supabase
        .from("case_files")
        .select(
          "id,opportunity_id,created_at,status,email,contact_page,contact_form_url,phone_from_site,facebook,facebook_url,instagram,instagram_url,activity_summary,website_audit,website_issues,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,desktop_screenshot_url,mobile_screenshot_url,contact_page_screenshot_url,annotated_screenshot_url,notes,outcome,google_review_count,reviews_last_30_days,owner_post_detected,new_photos_detected,listing_recently_updated"
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
      const { data: oppRows, error: oppError } = await supabase
        .from("opportunities")
        .select("id,business_name,category,city,address,website,website_status,opportunity_score,opportunity_reason,opportunity_signals,close_probability")
        .eq("id", oppId)
        .limit(1);
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
        const { data: fallbackOppRows, error: fallbackOppError } = await supabase
          .from("opportunities")
          .select("id,business_name,category,city,address,website,website_status,opportunity_score,opportunity_reason,opportunity_signals,close_probability")
          .eq("website", leadWebsite)
          .order("opportunity_score", { ascending: false, nullsFirst: false })
          .limit(1);
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

  const hasAnyData = Boolean(lead || caseRow || opp);
  if (!hasAnyData) {
    return (
      <div className="space-y-4">
        <section className="admin-card">
          <h1 className="text-2xl font-bold">Lead workspace</h1>
          <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
            We could not find that lead id yet, but your workflow is still available.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/admin/leads" className="admin-btn-primary">
              Back to Leads
            </Link>
            <Link href="/admin/dashboard" className="admin-btn-ghost">
              Open Dashboard
            </Link>
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
  const displayPhone = String(caseRow?.phone_from_site || lead?.phone || "").trim();
  const displayContactPage = String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim();
  const displayFacebook = String(caseRow?.facebook_url || caseRow?.facebook || "").trim();
  const displayInstagram = String(caseRow?.instagram_url || caseRow?.instagram || "").trim();
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
        : leadPath;
  const quickFixSummary = quickFixImprovements[0] || null;

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
              {displayBusinessName}
            </h1>
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {displayCategory} · {displayCity} · Score {displayScore || "—"} · {displayLeadBucket} · Status {displayStatus.replace(/_/g, " ")}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Opportunity reason: {String(opp?.opportunity_reason || topIssues[0]?.issue || "Website needs manual review").trim()}
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
              <div><span style={{ color: "var(--admin-muted)" }}>Best Contact Method:</span> {assessment.best_contact_method || "review manually"}</div>
              <div><span style={{ color: "var(--admin-muted)" }}>Recommended Next Action:</span> {assessment.recommended_next_action}</div>
            </div>
            <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
              <span style={{ color: "var(--admin-fg)" }}>Best Pitch Angle:</span> {assessment.best_pitch_angle}
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              What’s Really Going On
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>Top issues</p>
                <ul className="list-disc pl-5 space-y-1">
                  {(quickFixCurrentIssues.length ? quickFixCurrentIssues : ["Website needs manual review"]).slice(0, 3).map((issue, idx) => (
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
                    Website needs manual review.
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
                No issue summary available.
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
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
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
              initialIssue={topIssues[0]?.issue || "Website needs manual review"}
              initialEmail={displayEmail || null}
              initialPhone={displayPhone || null}
              website={displayWebsite || null}
              contactPage={displayContactPage || null}
              caseHref={caseHref}
              initialNotes={[String(lead?.notes || "").trim(), String(caseRow?.notes || "").trim()].filter(Boolean)}
              quickFixSummary={quickFixSummary}
              autoGenerate={generate === "1"}
              autoCompose={compose === "1"}
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
