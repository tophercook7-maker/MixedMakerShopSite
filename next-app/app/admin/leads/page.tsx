import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { LeadsWorkflowView, type WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadAssessment, scoreToLeadBucket } from "@/lib/lead-assessment";
import { canonicalLeadBucket } from "@/lib/lead-bucket";

type LeadRow = {
  id: string;
  owner_id?: string | null;
  linked_opportunity_id?: string | null;
  workspace_id?: string | null;
  created_at: string | null;
  status: string | null;
  business_name?: string | null;
  email: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  category?: string | null;
  city?: string | null;
  address?: string | null;
  lead_bucket?: string | null;
  is_manual?: boolean | null;
  known_owner_name?: string | null;
  known_context?: string | null;
  door_status?: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost" | null;
  last_updated_at?: string | null;
  notes?: string | null;
  opportunity_score?: number | null;
  conversion_score?: number | null;
  score_breakdown?: Record<string, unknown> | null;
  lead_source?: string | null;
  is_hot_lead?: boolean | null;
  last_reply_at?: string | null;
  last_reply_preview?: string | null;
};

type OpportunityRow = {
  id: string;
  business_name?: string;
  category?: string;
  city?: string | null;
  address?: string | null;
  website?: string;
  website_status?: string | null;
  opportunity_score?: number;
  lead_bucket?: string | null;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
  close_probability?: "low" | "medium" | "high" | null;
  google_rating?: number | null;
};

function missingOpportunityReasonColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_reason") || text.includes("column opportunity_reason");
}

function missingOpportunitySignalsColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_signals") || text.includes("column opportunity_signals");
}

function missingIsHotLeadColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("leads.is_hot_lead") || text.includes("column is_hot_lead");
}

function missingConversionColumns(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("leads.conversion_score") ||
    text.includes("column conversion_score") ||
    text.includes("leads.score_breakdown") ||
    text.includes("column score_breakdown")
  );
}

function missingReplyDetectionColumns(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("leads.last_reply_at") ||
    text.includes("leads.last_reply_preview") ||
    text.includes("column last_reply_at") ||
    text.includes("column last_reply_preview")
  );
}

function missingManualDoorColumns(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("leads.is_manual") ||
    text.includes("column is_manual") ||
    text.includes("leads.known_owner_name") ||
    text.includes("column known_owner_name") ||
    text.includes("leads.known_context") ||
    text.includes("column known_context") ||
    text.includes("leads.door_status") ||
    text.includes("column door_status") ||
    text.includes("leads.last_updated_at") ||
    text.includes("column last_updated_at")
  );
}

const SAFE_LEADS_SELECT =
  "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,notes,address";

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

type CaseByOpportunityRow = {
  id: string;
  opportunity_id: string | null;
  status?: string | null;
  email?: string | null;
  contact_page?: string | null;
  contact_form_url?: string | null;
  phone_from_site?: string | null;
  facebook?: string | null;
  facebook_url?: string | null;
  email_source?: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  notes?: string | null;
  outcome?: string | null;
  google_review_count?: number | null;
  google_rating?: number | null;
  reviews_last_30_days?: number | null;
  owner_post_detected?: boolean | null;
  new_photos_detected?: boolean | null;
  listing_recently_updated?: boolean | null;
  created_at?: string | null;
};

function categoryFitScore(category: string | null | undefined): number {
  const cat = String(category || "").toLowerCase();
  const high = [
    "plumber",
    "roofer",
    "hvac",
    "electrician",
    "landscaping",
    "cleaning",
    "pressure washing",
    "auto repair",
    "restaurant",
    "cafe",
    "church",
  ];
  const medium = ["dentist", "chiropractor", "salon", "gym", "bakery", "contractor"];
  if (high.some((v) => cat.includes(v))) return 15;
  if (medium.some((v) => cat.includes(v))) return 8;
  if (cat) return 4;
  return 0;
}

function computeDoorScore(input: {
  rating: number | null | undefined;
  reviews: number | null | undefined;
  activeSignal: boolean;
  websiteStatus: string | null | undefined;
  hasAddress: boolean;
  localProximityAvailable: boolean;
  category: string | null | undefined;
  hasEmail: boolean;
  hasContactPage: boolean;
  hasFacebookUrl: boolean;
}): number {
  let businessStrength = 0;
  if (Number(input.rating || 0) >= 4.5) businessStrength += 15;
  if (Number(input.reviews || 0) >= 10) businessStrength += 10;
  if (input.activeSignal) businessStrength += 5;
  businessStrength = Math.min(25, businessStrength);

  let websiteOpportunity = 0;
  const ws = String(input.websiteStatus || "").toLowerCase();
  if (ws === "no_website") websiteOpportunity = 25;
  else if (ws === "broken_website") websiteOpportunity = 20;
  else if (ws === "facebook_only") websiteOpportunity = 15;
  else if (ws === "outdated_website") websiteOpportunity = 10;
  websiteOpportunity = Math.min(25, websiteOpportunity);

  let localAccess = 0;
  if (input.hasAddress) localAccess += 10;
  if (input.localProximityAvailable) localAccess += 10;
  localAccess = Math.min(20, localAccess);

  const categoryFit = Math.min(15, categoryFitScore(input.category));

  let noContactBonus = 0;
  if (!input.hasEmail) noContactBonus += 5;
  if (!input.hasContactPage) noContactBonus += 5;
  if (!input.hasFacebookUrl) noContactBonus += 5;
  noContactBonus = Math.min(15, noContactBonus);

  const total = businessStrength + websiteOpportunity + localAccess + categoryFit + noContactBonus;
  return Math.max(0, Math.min(100, total));
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

type IntakeDiagnostics = {
  workspaceId: string | null;
  opportunitiesInWorkspace: number;
  leadsForOwner: number;
  linkedLeadsForOwner: number;
  latestScoutRunAt: string | null;
};

function computeConversionScore(input: {
  hasEmail: boolean;
  hasContactPage: boolean;
  hasPhone: boolean;
  hasFacebook: boolean;
  websiteStatus: string;
  reviewCount: number;
  category: string;
  businessName: string;
  hasClearBusinessInfo: boolean;
}): { conversion_score: number; score_breakdown: Record<string, unknown> } {
  let score = 0;
  const status = String(input.websiteStatus || "").toLowerCase();
  const category = String(input.category || "").toLowerCase();
  const businessName = String(input.businessName || "").toLowerCase();
  const score_breakdown: Record<string, unknown> = { positive: [] as string[], negative: [] as string[], raw_score: 0 };

  if (input.hasEmail) {
    score += 40;
    (score_breakdown.positive as string[]).push("email_exists:+40");
  }
  if (input.hasContactPage) score += 15;
  if (input.hasContactPage) (score_breakdown.positive as string[]).push("contact_page_exists:+15");
  if (input.hasPhone && !input.hasEmail && !input.hasContactPage) {
    score += 5;
    (score_breakdown.positive as string[]).push("phone_only:+5");
  }

  if (status === "no_website") {
    score += 30;
    (score_breakdown.positive as string[]).push("no_website:+30");
  } else if (status === "broken_website") {
    score += 25;
    (score_breakdown.positive as string[]).push("broken_website:+25");
  } else if (status === "outdated_website") {
    score += 20;
    (score_breakdown.positive as string[]).push("outdated_website:+20");
  } else if (status === "missing_contact_page" || status === "missing_contact_info") {
    score += 15;
    (score_breakdown.positive as string[]).push("missing_contact_info:+15");
  }

  if (input.reviewCount >= 10) {
    score += 15;
    (score_breakdown.positive as string[]).push("reviews_10_plus:+15");
  } else if (input.reviewCount >= 3) {
    score += 10;
    (score_breakdown.positive as string[]).push("reviews_3_10:+10");
  } else if (input.reviewCount >= 1) {
    score += 5;
    (score_breakdown.positive as string[]).push("reviews_1_2:+5");
  }

  if (["plumber", "roofer", "hvac", "electrician", "landscaping", "cleaning", "auto repair", "contractor"].some((v) => category.includes(v))) {
    score += 15;
    (score_breakdown.positive as string[]).push("service_business:+15");
  } else if (category.includes("church")) {
    score += 10;
    (score_breakdown.positive as string[]).push("church:+10");
  } else if (["shop", "store", "retail", "cafe", "restaurant", "salon"].some((v) => category.includes(v))) {
    score += 10;
    (score_breakdown.positive as string[]).push("local_shop:+10");
  }

  if (!input.hasEmail && !input.hasContactPage && !input.hasPhone && !input.hasFacebook) {
    score -= 40;
    (score_breakdown.negative as string[]).push("no_contact_path:-40");
  }
  if (input.reviewCount <= 0) {
    score -= 20;
    (score_breakdown.negative as string[]).push("no_reviews:-20");
  }
  if (["franchise", "chain", "walmart", "target", "mcdonald", "starbucks"].some((v) => businessName.includes(v))) {
    score -= 25;
    (score_breakdown.negative as string[]).push("chain_or_franchise:-25");
  }
  if (status === "healthy_website" || status === "strong_website" || status === "modern_website") {
    score -= 20;
    (score_breakdown.negative as string[]).push("strong_existing_website:-20");
  }
  if (!input.hasClearBusinessInfo) {
    score -= 15;
    (score_breakdown.negative as string[]).push("unclear_business_info:-15");
  }
  const bounded = Math.max(0, Math.min(100, score));
  score_breakdown.raw_score = score;
  score_breakdown.final_score = bounded;
  return { conversion_score: bounded, score_breakdown };
}

function normalizeStatus(value: string | null | undefined): WorkflowLead["status"] {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!normalized) return "new";
  if (
    normalized === "new" ||
    normalized === "contacted" ||
    normalized === "follow_up_due" ||
    normalized === "replied" ||
    normalized === "no_response" ||
    normalized === "closed" ||
    normalized === "closed_won" ||
    normalized === "closed_lost" ||
    normalized === "do_not_contact" ||
    normalized === "research_later"
  ) {
    return normalized;
  }
  return "new";
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    source?: string;
    date?: string;
    status?: string;
    sort?: string;
    error?: string;
    detail?: string;
  }>;
}) {
  const { source, date, status, sort, error, detail } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view leads.
        </p>
      </section>
    );
  }

  let baseQuery = supabase
    .from("leads")
    .select(SAFE_LEADS_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (date === "today") baseQuery = baseQuery.gte("created_at", dayStart);

  let joinedResult = (await baseQuery) as {
    data: LeadRow[] | null;
    error: { message?: string } | null;
  };
  if (joinedResult.error?.message) {
    joinedResult = (await supabase
      .from("leads")
      .select("id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,notes")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(500)) as {
      data: LeadRow[] | null;
      error: { message?: string } | null;
    };
  }
  const { data: joinedRows, error: joinedError } = joinedResult;
  let queryMode: "relationship" | "failed" = "relationship";
  let queryError: string | null = joinedError?.message || null;
  let rows: LeadRow[] = [];

  if (joinedError) {
    queryMode = "failed";
    queryError = joinedError.message || null;
    console.error("[Leads] query failed, falling back to empty state", { queryError });
    rows = [];
  } else {
    rows = (joinedRows || []) as LeadRow[];
  }

  const opportunityIds = Array.from(
    new Set(
      rows
        .map((row) => String(row.linked_opportunity_id || "").trim())
        .filter(Boolean)
    )
  );
  let fallbackOppRows: OpportunityRow[] = [];
  if (opportunityIds.length) {
    const withReason = await supabase
      .from("opportunities")
      .select("id,business_name,category,city,address,website,website_status,opportunity_score,lead_bucket,opportunity_reason,opportunity_signals")
      .in("id", opportunityIds);
    if (
      withReason.error?.message &&
      (missingOpportunityReasonColumn(withReason.error.message) ||
        missingOpportunitySignalsColumn(withReason.error.message))
    ) {
      const fallback = await supabase
        .from("opportunities")
        .select("id,business_name,category,city,address,website,website_status,opportunity_score,lead_bucket")
        .in("id", opportunityIds);
      fallbackOppRows = ((fallback.data || []) as OpportunityRow[]).map((row) => ({
        ...row,
        opportunity_reason: null,
        opportunity_signals: null,
      }));
    } else {
      fallbackOppRows = (withReason.data || []) as OpportunityRow[];
    }
  }
  const fallbackOppById = new Map(
    (fallbackOppRows || []).map((row) => [String(row.id || ""), row as OpportunityRow])
  );
  if (opportunityIds.length && (fallbackOppRows || []).length) {
    console.info("[Leads List] fallback relationship fetch used", {
      requested_opportunity_ids: opportunityIds.length,
      resolved_opportunity_rows: (fallbackOppRows || []).length,
    });
  }
  let caseRows: CaseByOpportunityRow[] = [];
  if (opportunityIds.length) {
    const withEmailSource = await supabase
      .from("case_files")
      .select(
        "id,opportunity_id,status,email,contact_page,contact_form_url,phone_from_site,facebook,facebook_url,email_source,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,annotated_screenshot_url,notes,outcome,google_review_count,google_rating,reviews_last_30_days,owner_post_detected,new_photos_detected,listing_recently_updated,created_at"
      )
      .in("opportunity_id", opportunityIds)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (withEmailSource.error?.message?.toLowerCase().includes("email_source")) {
      const fallback = await supabase
        .from("case_files")
        .select(
          "id,opportunity_id,status,email,contact_page,contact_form_url,phone_from_site,facebook,facebook_url,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,annotated_screenshot_url,notes,outcome,google_review_count,google_rating,reviews_last_30_days,owner_post_detected,new_photos_detected,listing_recently_updated,created_at"
        )
        .in("opportunity_id", opportunityIds)
        .order("created_at", { ascending: false })
        .limit(1000);
      caseRows = (fallback.data || []) as CaseByOpportunityRow[];
    } else {
      caseRows = (withEmailSource.data || []) as CaseByOpportunityRow[];
    }
  }
  const latestCaseByOppId = new Map<string, CaseByOpportunityRow>();
  for (const row of caseRows) {
    const oppId = String(row.opportunity_id || "").trim();
    if (!oppId || latestCaseByOppId.has(oppId)) continue;
    latestCaseByOppId.set(oppId, row);
  }

  let workflowLeads: WorkflowLead[] = rows.map((row) => {
    const linkedOppId = String(row.linked_opportunity_id || "").trim();
    const opp = linkedOppId ? fallbackOppById.get(linkedOppId) : undefined;
    const caseRow = linkedOppId ? latestCaseByOppId.get(linkedOppId) : undefined;
    const detectedIssuesRaw = Array.isArray(caseRow?.audit_issues)
      ? caseRow!.audit_issues!
      : Array.isArray(caseRow?.strongest_problems)
        ? caseRow!.strongest_problems!
        : [];
    const detectedIssues = detectedIssuesRaw.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 6);
    const opportunityReason = String(opp?.opportunity_reason || "").trim();
    const opportunitySignals = Array.isArray(opp?.opportunity_signals)
      ? opp!.opportunity_signals!.map((v) => String(v || "").trim()).filter(Boolean)
      : [];
    const signalEmailSource =
      opportunitySignals.find((signal) => signal.toLowerCase().startsWith("email_source:"))?.split(":")[1]?.trim() || "";
    const signalDistanceKm = opportunitySignals
      .map((signal) => {
        const match = String(signal || "").toLowerCase().match(/distance[_\s]?km[:=]\s*([0-9]+(?:\.[0-9]+)?)/);
        return match ? Number(match[1]) : null;
      })
      .find((v): v is number => Number.isFinite(Number(v)));
    const issueList =
      opportunityReason && !detectedIssues.some((issue) => issue.toLowerCase() === opportunityReason.toLowerCase())
        ? [opportunityReason, ...detectedIssues, ...opportunitySignals].slice(0, 6)
        : [...detectedIssues, ...opportunitySignals].slice(0, 6);
    const screenshotCandidates = [
      caseRow?.annotated_screenshot_url,
      caseRow?.screenshot_url,
      caseRow?.homepage_screenshot_url,
      ...(Array.isArray(caseRow?.screenshot_urls) ? caseRow!.screenshot_urls! : []),
    ]
      .map((v) => String(v || "").trim())
      .filter(Boolean);
    const email = String(row.email || caseRow?.email || "").trim();
    const hasEmail = Boolean(email);
    const emailSource = String(caseRow?.email_source || signalEmailSource || "unknown").trim().toLowerCase();
    const phone = String(caseRow?.phone_from_site || row.phone || "").trim();
    const contactPage = String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim();
    const facebookUrl = String(caseRow?.facebook_url || caseRow?.facebook || "").trim();
    const website = String(opp?.website || row.website || "").trim();
    const assessment = buildLeadAssessment({
      website,
      website_status: opp?.website_status || null,
      opportunity_score: opp?.opportunity_score ?? row.opportunity_score ?? null,
      issue_summary: opportunityReason || issueList[0] || "",
      issue_list: issueList,
      category: opp?.category || row.industry || null,
      email,
      phone,
      contact_page: contactPage,
      facebook_url: facebookUrl,
      reviews_last_30_days: caseRow?.reviews_last_30_days ?? null,
      google_review_count: caseRow?.google_review_count ?? null,
      owner_post_detected: caseRow?.owner_post_detected ?? null,
      new_photos_detected: caseRow?.new_photos_detected ?? null,
      listing_recently_updated: caseRow?.listing_recently_updated ?? null,
      lead_status: row.status || null,
    });
    const hasOnlineContactPath = Boolean(email || contactPage || facebookUrl);
    const hasBaseBusinessInfo = Boolean(
      String(opp?.business_name || row.business_name || "").trim() &&
        String(opp?.address || row.address || "").trim() &&
        String(opp?.city || row.city || "").trim()
    );
    const websiteStatus = String(opp?.website_status || "").trim().toLowerCase();
    const hasStrongWebsiteOpportunity =
      [
        "no_website",
        "broken_website",
        "outdated_website",
        "facebook_only",
        "mobile_layout_issue",
        "http_only",
      ].includes(websiteStatus) ||
      issueList.some((issue) => {
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
      Number(opp?.opportunity_score ?? row.opportunity_score ?? 0) >= 70;
    const activeBusinessSignal = Boolean(
      Number(caseRow?.reviews_last_30_days || 0) > 0 ||
      caseRow?.owner_post_detected ||
      caseRow?.new_photos_detected ||
      caseRow?.listing_recently_updated
    );
    const hasAddress = Boolean(String(opp?.address || row.address || "").trim());
    const localProximityAvailable = opportunitySignals.some((signal) => {
      const text = String(signal || "").toLowerCase();
      return text.includes("local_proximity") || text.includes("distance_km") || text.includes("nearby");
    });
    const doorScore = computeDoorScore({
      rating: caseRow?.google_rating ?? null,
      reviews: caseRow?.google_review_count ?? null,
      activeSignal: activeBusinessSignal,
      websiteStatus: opp?.website_status || null,
      hasAddress,
      localProximityAvailable,
      category: opp?.category || row.industry || null,
      hasEmail: Boolean(email),
      hasContactPage: Boolean(contactPage),
      hasFacebookUrl: Boolean(facebookUrl),
    });
    const manualDoor = String(row.lead_bucket || "").toLowerCase().includes("door_to_door") || Boolean(row.is_manual);
    const isDoorToDoorCandidate = Boolean(
      !hasOnlineContactPath &&
        hasBaseBusinessInfo &&
        hasStrongWebsiteOpportunity &&
        hasStrongLocalSignal &&
        doorScore >= 60
    );
    const outreachChannel: "email" | "contact" | "door_to_door" | "skip" = email
      ? "email"
      : contactPage || facebookUrl
        ? "contact"
        : isDoorToDoorCandidate || manualDoor
          ? "door_to_door"
          : "skip";
    const nextAction =
      outreachChannel === "email"
        ? assessment.recommended_next_action
        : outreachChannel === "contact"
          ? ("Open Contact Path" as const)
          : outreachChannel === "door_to_door"
            ? ("Save for Door-to-Door" as const)
            : ("Skip For Now" as const);
    const valueInfo = computeEstimatedValue(opp?.category || row.industry || null);
    const expectedCloseProbability = expectedCloseProbabilityNumber(
      (String(assessment.close_probability || "").toLowerCase() as "low" | "medium" | "high") || null,
      opp?.opportunity_score ?? row.opportunity_score ?? null
    );
    const pitches = generateLeadPitches({
      businessName: String(opp?.business_name || row.business_name || "Business"),
      category: String(opp?.category || row.industry || "business"),
      issue: opportunityReason || issueList[0] || "website issues",
      contactType: outreachChannel,
    });
    const computedConversion = computeConversionScore({
      hasEmail,
      hasContactPage: Boolean(contactPage),
      hasPhone: Boolean(phone),
      hasFacebook: Boolean(facebookUrl),
      websiteStatus: String(opp?.website_status || "").trim(),
      reviewCount: Number(caseRow?.google_review_count || 0),
      category: String(opp?.category || row.industry || "").trim(),
      businessName: String(opp?.business_name || row.business_name || "").trim(),
      hasClearBusinessInfo: Boolean(
        String(opp?.business_name || row.business_name || "").trim() &&
          String(opp?.category || row.industry || "").trim() &&
          (String(opp?.website || row.website || "").trim() || opportunityReason)
      ),
    });
    const conversionScore = Number(row.conversion_score ?? computedConversion.conversion_score ?? 0);
    const scoreBreakdown =
      (row.score_breakdown && typeof row.score_breakdown === "object" ? row.score_breakdown : null) ||
      computedConversion.score_breakdown;
    const createdAtIso = String(row.created_at || "").trim();
    const fromLatestScan = Boolean(
      latestScoutRunAt &&
        createdAtIso &&
        new Date(createdAtIso).getTime() >= new Date(latestScoutRunAt).getTime()
    );
    const isArchived =
      Boolean(createdAtIso) &&
      Date.now() - new Date(createdAtIso).getTime() > 1000 * 60 * 60 * 24 * 21 &&
      ["new", "contacted", "follow_up_due", "research_later"].includes(normalizeStatus(row.status)) &&
      !Boolean(String(row.last_reply_at || "").trim()) &&
      !Boolean(row.is_hot_lead);
    return {
      id: String(row.id || ""),
      workspace_id: String(row.workspace_id || "").trim() || null,
      related_case_id: String(caseRow?.id || "") || null,
      opportunity_id: linkedOppId || null,
      business_name: String(opp?.business_name || row.business_name || "Unknown business"),
      category: String(opp?.category || row.category || row.industry || "").trim() || null,
      city: String(opp?.city || row.city || "").trim() || null,
      address: String(opp?.address || row.address || "").trim() || null,
      website_status: String(opp?.website_status || "").trim() || null,
      opportunity_score: opp?.opportunity_score ?? row.opportunity_score ?? null,
      lead_bucket:
        manualDoor
          ? "door_to_door"
          :
        hasEmail
          ? canonicalLeadBucket(
              String(opp?.lead_bucket || row.lead_bucket || "").trim(),
              opp?.opportunity_score ?? row.opportunity_score ?? null
            ) ||
            assessment.lead_bucket ||
            scoreToLeadBucket(opp?.opportunity_score ?? row.opportunity_score ?? null)
          : "Needs Review",
      close_probability:
        (String(opp?.close_probability || "").trim().toLowerCase() as "low" | "medium" | "high") ||
        assessment.close_probability ||
        deriveCloseProbability(opp?.opportunity_score ?? row.opportunity_score, opp?.category || row.industry, issueList),
      website: website || null,
      email: email || null,
      email_source: email ? emailSource || "unknown" : "No Email Found",
      phone_from_site: phone || null,
      contact_page: contactPage || null,
      facebook_url: facebookUrl || null,
      google_review_count: caseRow?.google_review_count ?? null,
      google_rating: caseRow?.google_rating ?? null,
      door_score: doorScore,
      distance_km: signalDistanceKm ?? null,
      contact_method: email
        ? "email"
        : contactPage
            ? "contact page"
          : phone
            ? "phone"
            : facebookUrl
              ? "facebook"
              : "No Contact Path",
      detected_issue_summary: opportunityReason || issueList[0] || "No clear website issue captured yet",
      detected_issues: issueList,
      lead_type: hasEmail ? assessment.lead_type : "Needs Review",
      best_contact_method: hasEmail
        ? assessment.best_contact_method || "email"
        : contactPage
          ? "contact_page"
          : phone
            ? "phone"
            : facebookUrl
              ? "facebook"
              : "none",
      primary_problem: assessment.primary_problem,
      why_it_matters: assessment.why_it_matters,
      why_this_lead_is_here: assessment.why_this_lead_is_here,
      best_pitch_angle: assessment.best_pitch_angle,
      estimated_value: valueInfo.estimated_value,
      estimated_price_range: valueInfo.estimated_price_range,
      expected_close_probability: expectedCloseProbability,
      email_pitch: pitches.email_pitch,
      text_pitch: pitches.text_pitch,
      door_pitch: pitches.door_pitch,
      recommended_next_action: nextAction,
      outreach_channel: outreachChannel,
      is_door_to_door_candidate: isDoorToDoorCandidate,
      status: normalizeStatus(row.status),
      created_at: row.created_at || null,
      screenshot_urls: screenshotCandidates,
      annotated_screenshot_url: caseRow?.annotated_screenshot_url || null,
      timeline: [],
      notes: [String(caseRow?.outcome || "").trim(), String(caseRow?.notes || "").trim(), String(row.notes || "").trim()].filter(Boolean),
      lead_source: String(row.lead_source || "").trim() || null,
      is_hot_lead: Boolean(row.is_hot_lead),
      last_reply_at: String(row.last_reply_at || "").trim() || null,
      last_reply_preview: String(row.last_reply_preview || "").trim() || null,
      conversion_score: conversionScore,
      score_breakdown: scoreBreakdown,
      from_latest_scan: fromLatestScan,
      is_archived: isArchived,
      is_manual: Boolean(row.is_manual),
      known_owner_name: String(row.known_owner_name || "").trim() || null,
      known_context: String(row.known_context || "").trim() || null,
      door_status: (String(row.door_status || "").trim().toLowerCase() as WorkflowLead["door_status"]) || "not_visited",
      last_updated_at: String(row.last_updated_at || row.created_at || "").trim() || null,
    };
  });
  console.info("[Leads List] related data resolved", {
    leads_count: rows.length,
    opportunities_resolved: fallbackOppById.size,
    cases_resolved: latestCaseByOppId.size,
  });

  if (source) {
    const wantedSource = String(source || "").trim().toLowerCase();
    workflowLeads = workflowLeads.filter((lead) => {
      const leadSource = String(lead.lead_source || "")
        .trim()
        .toLowerCase();
      return leadSource === wantedSource;
    });
  }
  if (status) {
    const wanted = normalizeStatus(status);
    workflowLeads = workflowLeads.filter((l) => l.status === wanted);
  }

  const workspaceId = String(process.env.SCOUT_BRAIN_WORKSPACE_ID || "").trim();
  const latestScoutRunResult = await supabase
    .from("scout_runs")
    .select("created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1);
  const latestScoutRunAt = String((latestScoutRunResult.data || [])[0]?.created_at || "").trim() || null;
  const opportunitiesCountResult = workspaceId
    ? await supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
    : null;
  const intakeDiagnostics: IntakeDiagnostics = {
    workspaceId: workspaceId || null,
    opportunitiesInWorkspace: Number(opportunitiesCountResult?.count || 0),
    leadsForOwner: rows.length,
    linkedLeadsForOwner: rows.filter((row) => String(row.linked_opportunity_id || "").trim()).length,
    latestScoutRunAt,
  };
  if (sort === "created_desc") {
    workflowLeads = [...workflowLeads].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } else {
    workflowLeads = [...workflowLeads].sort(
      (a, b) => {
        const conversionDelta =
          Number((b as WorkflowLead & { conversion_score?: number }).conversion_score || 0) -
          Number((a as WorkflowLead & { conversion_score?: number }).conversion_score || 0);
        if (conversionDelta !== 0) return conversionDelta;
        const scoreDelta = Number(b.opportunity_score ?? 0) - Number(a.opportunity_score ?? 0);
        if (scoreDelta !== 0) return scoreDelta;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    );
  }
  const leadIds = workflowLeads.map((lead) => lead.id).filter(Boolean);
  const { data: directLeadMessages } = leadIds.length
    ? await supabase
        .from("email_messages")
        .select("id,lead_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: true })
        .limit(3000)
    : { data: [] as Array<Record<string, unknown>> };

  const leadEmails = Array.from(
    new Set(
      workflowLeads
        .map((lead) => String(lead.email || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );
  const { data: threadRows } = leadEmails.length
    ? await supabase
        .from("email_threads")
        .select("id,contact_email,subject,status,last_message_at")
        .in("contact_email", leadEmails)
        .order("last_message_at", { ascending: false })
        .limit(500)
    : { data: [] as Array<Record<string, unknown>> };
  const threadIds = (threadRows || [])
    .map((row) => String(row.id || "").trim())
    .filter(Boolean);
  const { data: messageRows } = threadIds.length
    ? await supabase
        .from("email_messages")
        .select("id,thread_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })
        .limit(2000)
    : { data: [] as Array<Record<string, unknown>> };
  const emailByThreadId = new Map(
    (threadRows || []).map((row) => [
      String(row.id || ""),
      String(row.contact_email || "").trim().toLowerCase(),
    ])
  );
  const timelineByLeadId = new Map<string, WorkflowLead["timeline"]>();
  for (const message of directLeadMessages || []) {
    const leadId = String(message.lead_id || "").trim();
    if (!leadId) continue;
    if (!timelineByLeadId.has(leadId)) timelineByLeadId.set(leadId, []);
    timelineByLeadId.get(leadId)!.push({
      id: String(message.id || `${leadId}-${message.created_at || "row"}`),
      direction: String(message.direction || ""),
      subject: message.subject ? String(message.subject) : null,
      body: message.body ? String(message.body) : null,
      status: message.delivery_status ? String(message.delivery_status) : null,
      occurred_at: String(message.received_at || message.sent_at || message.created_at || ""),
    });
  }

  const timelineByEmail = new Map<string, WorkflowLead["timeline"]>();
  for (const message of messageRows || []) {
    const threadId = String(message.thread_id || "").trim();
    const email = emailByThreadId.get(threadId);
    if (!email) continue;
    if (!timelineByEmail.has(email)) timelineByEmail.set(email, []);
    timelineByEmail.get(email)!.push({
      id: String(message.id || `${threadId}-${message.created_at || "row"}`),
      direction: String(message.direction || ""),
      subject: message.subject ? String(message.subject) : null,
      body: message.body ? String(message.body) : null,
      status: message.delivery_status ? String(message.delivery_status) : null,
      occurred_at: String(
        message.received_at || message.sent_at || message.created_at || ""
      ),
    });
  }
  workflowLeads = workflowLeads.map((lead) => {
    const email = String(lead.email || "").trim().toLowerCase();
    const byLead = timelineByLeadId.get(lead.id) || [];
    const byEmail = email ? timelineByEmail.get(email) || [] : [];
    const merged = [...byLead, ...byEmail];
    const deduped = new Map<string, WorkflowLead["timeline"][number]>();
    for (const item of merged) deduped.set(item.id, item);
    const sorted = Array.from(deduped.values()).sort(
      (a, b) => new Date(a.occurred_at || 0).getTime() - new Date(b.occurred_at || 0).getTime()
    );
    return {
      ...lead,
      timeline: sorted,
    };
  });

  let emptyStateReason = "";
  if (workflowLeads.length === 0) {
    if (queryMode === "failed") {
      emptyStateReason = "Leads temporarily unavailable";
    } else {
      emptyStateReason = "No leads yet";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Leads</h1>
        <div className="flex gap-2">
          <BackfillLeadsButton />
        </div>
      </div>
      {error ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "#fca5a5" }}>
            Lead action failed: {String(detail || error || "unknown error")}
          </p>
        </section>
      ) : null}
      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Lead Intake Diagnostics
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          opportunities evaluated: {intakeDiagnostics.opportunitiesInWorkspace} | leads created: {intakeDiagnostics.leadsForOwner} | linked opportunities:{" "}
          {intakeDiagnostics.linkedLeadsForOwner} | latest scan: {intakeDiagnostics.latestScoutRunAt || "not recorded"} | workspace:{" "}
          {intakeDiagnostics.workspaceId || "not configured"}
        </p>
        {intakeDiagnostics.opportunitiesInWorkspace > 0 && intakeDiagnostics.leadsForOwner === 0 ? (
          <p className="text-xs mt-2" style={{ color: "#fca5a5" }}>
            Opportunities exist but no leads were created for this owner. Run backfill and review insert failure details below.
          </p>
        ) : null}
      </section>
      {queryMode === "failed" ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            Leads temporarily unavailable
          </p>
        </section>
      ) : null}
      <LeadsWorkflowView initialLeads={workflowLeads} emptyStateReason={emptyStateReason} />
    </div>
  );
}
