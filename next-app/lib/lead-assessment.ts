export type LeadType =
  | "Easy Win"
  | "Active Business, Weak Website"
  | "Church Website Opportunity"
  | "Needs Review"
  | "Low Priority";
export type LeadBucket = "Easy Win" | "High Value" | "Good Prospect" | "Needs Review" | "Low Priority";

export type CloseProbability = "low" | "medium" | "high";
export type BestContactMethod = "email" | "phone" | "contact_page" | "facebook" | "none";
export type RecommendedNextAction =
  | "Generate Email"
  | "Send First Touch"
  | "Review Website"
  | "Research Later"
  | "Skip For Now";

export type LeadAssessment = {
  lead_bucket: LeadBucket;
  lead_type: LeadType;
  close_probability: CloseProbability;
  best_contact_method: BestContactMethod | null;
  /** Short label for logic / tables */
  primary_problem: string;
  /** Single plain sentence: the whole situation in one line (replaces stacked “why / problem / reason”). */
  situation_headline: string;
  /** Same as situation_headline; kept for callers that still use this name. */
  why_this_lead_is_here: string;
  /** 2–3 outcome-focused lines for “Why it matters”. */
  matters_bullets: string[];
  /** First bullet or fallback for legacy single-string consumers. */
  why_it_matters: string;
  best_pitch_angle: string;
  recommended_next_action: RecommendedNextAction;
};

type BuildLeadAssessmentInput = {
  website?: string | null;
  website_status?: string | null;
  opportunity_score?: number | null;
  category?: string | null;
  issue_summary?: string | null;
  issue_list?: string[] | null;
  email?: string | null;
  phone?: string | null;
  contact_page?: string | null;
  facebook_url?: string | null;
  reviews_last_30_days?: number | null;
  google_review_count?: number | null;
  owner_post_detected?: boolean | null;
  new_photos_detected?: boolean | null;
  listing_recently_updated?: boolean | null;
  lead_status?: string | null;
  /** True if email, phone, contact page, or Facebook is available */
  has_contact_path?: boolean | null;
};

function hasAny(texts: string[], patterns: string[]) {
  const haystack = texts.join(" | ").toLowerCase();
  return patterns.some((p) => haystack.includes(p.toLowerCase()));
}

export function scoreToLeadBucket(scoreInput: number | null | undefined): LeadBucket {
  const score = Number(scoreInput || 0);
  if (score >= 90) return "Easy Win";
  if (score >= 75) return "High Value";
  if (score >= 60) return "Good Prospect";
  if (score >= 40) return "Needs Review";
  return "Low Priority";
}

export function buildLeadAssessment(input: BuildLeadAssessmentInput): LeadAssessment {
  const issues = (input.issue_list || []).map((v) => String(v || "").trim()).filter(Boolean);
  const summary = String(input.issue_summary || "").trim();
  const website = String(input.website || "").trim();
  const websiteStatus = String(input.website_status || "").trim().toLowerCase();
  const score = Number(input.opportunity_score || 0);
  const reviewsLast30 = Number(input.reviews_last_30_days || 0);
  const reviewCount = Number(input.google_review_count || 0);
  const leadStatus = String(input.lead_status || "").trim().toLowerCase();
  const issueTexts = [summary, ...issues].filter(Boolean);
  const leadBucket = scoreToLeadBucket(score);
  const hasContactPath =
    input.has_contact_path === true ||
    Boolean(
      String(input.email || "").trim() ||
        String(input.phone || "").trim() ||
        String(input.contact_page || "").trim() ||
        String(input.facebook_url || "").trim()
    );

  const noWebsite = !website || hasAny(issueTexts, ["no website", "without website"]);
  const brokenWebsite =
    websiteStatus === "unreachable" ||
    hasAny(issueTexts, ["website unreachable", "not loading", "broken website", "down"]);
  const insecureHttp = website.startsWith("http://") || hasAny(issueTexts, ["insecure http", "http instead of https", "not secure"]);
  const missingContactPage = hasAny(issueTexts, ["contact page missing", "missing contact page", "no contact page"]);
  const mobileIssue = hasAny(issueTexts, ["mobile layout", "mobile ux", "small text", "buttons too close", "missing viewport"]);
  const slowSite = hasAny(issueTexts, ["loads slowly", "slow mobile performance", "slow website"]);
  const outdatedDesign = hasAny(issueTexts, ["outdated design", "weak design", "dated design"]);
  const activeBusiness =
    reviewsLast30 > 3 ||
    reviewCount > 50 ||
    Boolean(input.owner_post_detected) ||
    Boolean(input.new_photos_detected) ||
    Boolean(input.listing_recently_updated);
  const churchCategory = String(input.category || "").toLowerCase().includes("church");

  const hasContactEmail = Boolean(String(input.email || "").trim());
  const bestContactMethod: LeadAssessment["best_contact_method"] = hasContactEmail ? "email" : "none";

  let leadType: LeadType = "Needs Review";
  if (noWebsite || brokenWebsite || insecureHttp || missingContactPage) {
    leadType = "Easy Win";
  } else if (churchCategory && (mobileIssue || slowSite || outdatedDesign || score >= 60)) {
    leadType = "Church Website Opportunity";
  } else if (activeBusiness && (mobileIssue || slowSite || outdatedDesign)) {
    leadType = "Active Business, Weak Website";
  } else if (score < 50) {
    leadType = "Low Priority";
  }

  let closeProbability: CloseProbability = "medium";
  if (leadType === "Easy Win") closeProbability = "high";
  else if (leadType === "Church Website Opportunity") closeProbability = "medium";
  else if (leadType === "Low Priority") closeProbability = "low";
  else if (activeBusiness || score >= 80) closeProbability = "high";
  else if (score < 60) closeProbability = "low";

  const facebookOnlyPresence = !website && Boolean(String(input.facebook_url || "").trim());

  let situationHeadline = "Online presence needs work.";
  if (facebookOnlyPresence) situationHeadline = "Facebook-only business.";
  else if (noWebsite) situationHeadline = "No website. Strong opportunity.";
  else if (brokenWebsite) situationHeadline = "Their site is down — they are losing leads.";
  else if (insecureHttp) situationHeadline = "Still on insecure HTTP — trust takes a hit.";
  else if (missingContactPage) situationHeadline = "Hard to reach — contact path is buried or missing.";
  else if (mobileIssue || slowSite || outdatedDesign) situationHeadline = "Has a weak website.";

  let bestPitchAngle = "Tighten their site so more visitors call or book.";
  if (facebookOnlyPresence) {
    bestPitchAngle = "Move them to their own site so Google and new customers take them seriously.";
  } else if (noWebsite) {
    bestPitchAngle =
      "They need a simple site — you help them get more customers fast.";
  } else if (brokenWebsite) {
    bestPitchAngle = "Their site is down — fixing it turns the phone back on.";
  } else if (insecureHttp) {
    bestPitchAngle = "HTTPS is a quick trust fix — pitch security plus a cleaner, faster page.";
  } else if (missingContactPage) {
    bestPitchAngle = "Put contact front and center — one clear path from Google to a call or form.";
  } else if (mobileIssue) {
    bestPitchAngle = "Mobile-first cleanup: bigger tap targets, obvious Call Now — more completions.";
  } else if (slowSite) {
    bestPitchAngle = "Speed wins: lighter pages, faster loads — more calls and form fills.";
  }

  let primaryProblem = "Contact path unclear";
  if (noWebsite) primaryProblem = "No website";
  else if (brokenWebsite) primaryProblem = "Website does not load";
  else if (insecureHttp) primaryProblem = "Insecure HTTP";
  else if (missingContactPage) primaryProblem = "Contact page missing";
  else if (mobileIssue) primaryProblem = "Mobile layout issues";
  else if (slowSite) primaryProblem = "Slow homepage";
  else if (hasAny(issueTexts, ["no clear call-to-action", "missing call-to-action", "cta missing"])) {
    primaryProblem = "Weak or missing CTA";
  } else if (summary) {
    primaryProblem = summary.length > 48 ? `${summary.slice(0, 45)}…` : summary;
  } else if (issues.length) {
    primaryProblem = issues[0].length > 48 ? `${issues[0].slice(0, 45)}…` : issues[0];
  }

  const mattersBullets: string[] = [];
  if (facebookOnlyPresence) {
    mattersBullets.push("They lose customers who never leave Facebook to look them up.");
    mattersBullets.push("Hard to look like a real business without their own site.");
  } else if (noWebsite) {
    mattersBullets.push("They lose customers who search online first.");
    mattersBullets.push("Hard to find or contact them on the open web.");
    mattersBullets.push("Low trust without a website.");
  }
  if (!facebookOnlyPresence && !noWebsite && !hasContactPath && mattersBullets.length < 3) {
    mattersBullets.push("Hard to find or contact online.");
  }
  if (!facebookOnlyPresence && !noWebsite && (mobileIssue || slowSite || outdatedDesign)) {
    if (mattersBullets.length < 3) {
      mattersBullets.push("Visitors leave before they call or book.");
    }
  }
  if (!facebookOnlyPresence && !noWebsite && brokenWebsite && mattersBullets.length < 3) {
    mattersBullets.push("New business stops cold when the site does not load.");
  }
  if (mattersBullets.length === 0) {
    mattersBullets.push("A clearer site turns more visitors into calls.");
  }
  const mattersTrimmed = mattersBullets.slice(0, 3);

  let recommendedNextAction: RecommendedNextAction = "Review Website";
  if (leadType === "Low Priority") recommendedNextAction = "Skip For Now";
  else if (bestContactMethod === "none") recommendedNextAction = "Research Later";
  else if (leadStatus === "new") recommendedNextAction = "Send First Touch";
  else recommendedNextAction = "Generate Email";

  return {
    lead_bucket: leadBucket,
    lead_type: leadType,
    close_probability: closeProbability,
    best_contact_method: bestContactMethod,
    primary_problem: primaryProblem,
    situation_headline: situationHeadline,
    why_this_lead_is_here: situationHeadline,
    matters_bullets: mattersTrimmed,
    why_it_matters: mattersTrimmed[0] || "",
    best_pitch_angle: bestPitchAngle,
    recommended_next_action: recommendedNextAction,
  };
}
