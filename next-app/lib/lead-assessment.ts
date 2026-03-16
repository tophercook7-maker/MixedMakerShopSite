export type LeadType =
  | "Easy Win"
  | "Active Business, Weak Website"
  | "Church Website Opportunity"
  | "Needs Review"
  | "Low Priority";
export type LeadBucket = "Easy Win" | "High Value" | "Good Prospect" | "Needs Review" | "Low Priority";

export type CloseProbability = "low" | "medium" | "high";
export type BestContactMethod = "email" | "phone" | "contact_page" | "facebook";
export type RecommendedNextAction =
  | "Generate Email"
  | "Send First Touch"
  | "Review Site Manually"
  | "Skip For Now";

export type LeadAssessment = {
  lead_bucket: LeadBucket;
  lead_type: LeadType;
  close_probability: CloseProbability;
  best_contact_method: BestContactMethod | null;
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
  const hasContactPhone = Boolean(String(input.phone || "").trim());
  const hasContactPage = Boolean(String(input.contact_page || "").trim());
  const hasFacebook = Boolean(String(input.facebook_url || "").trim());
  const bestContactMethod: LeadAssessment["best_contact_method"] = hasContactEmail
    ? "email"
    : hasContactPage
        ? "contact_page"
      : hasContactPhone
        ? "phone"
        : hasFacebook
          ? "facebook"
          : null;

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

  let bestPitchAngle = "Your business has strong reviews but the website may be holding you back.";
  if (noWebsite) bestPitchAngle = "Looks like you may not currently have a website.";
  else if (brokenWebsite) bestPitchAngle = "I noticed your site may not be loading correctly.";
  else if (insecureHttp) bestPitchAngle = "Your website appears to use insecure HTTP instead of HTTPS.";
  else if (missingContactPage) bestPitchAngle = "Your contact page appears to be missing, which can cost leads.";
  else if (mobileIssue) bestPitchAngle = "Your mobile layout could make it harder for customers to contact you.";
  else if (slowSite) bestPitchAngle = "Your homepage loads slowly, which can reduce calls and form submissions.";

  let recommendedNextAction: RecommendedNextAction = "Review Site Manually";
  if (leadType === "Low Priority") recommendedNextAction = "Skip For Now";
  else if (!bestContactMethod) recommendedNextAction = "Review Site Manually";
  else if (leadStatus === "new") recommendedNextAction = "Send First Touch";
  else recommendedNextAction = "Generate Email";

  return {
    lead_bucket: leadBucket,
    lead_type: leadType,
    close_probability: closeProbability,
    best_contact_method: bestContactMethod,
    best_pitch_angle: bestPitchAngle,
    recommended_next_action: recommendedNextAction,
  };
}
