import type { CaptainMakerProjectSummaryStorage } from "@/lib/captain-maker-project-summary";
import type { FunnelDesignDirectionId } from "@/lib/funnel-design-directions";
import {
  FUNNEL_DESIRED_OUTCOME_IDS,
  type FunnelDesiredOutcomeId,
} from "@/lib/funnel-desired-outcomes";

export type MockupAutofillPatch = {
  businessName: string;
  businessType: string;
  topServices: string;
  whatMakesYouDifferent: string;
  anythingElse: string;
  hasWebsite: "yes" | "no";
  websiteUrl: string;
  desiredOutcomes: Set<FunnelDesiredOutcomeId>;
  designDirection: FunnelDesignDirectionId | "";
};

function mapGoalToOutcomes(goal: string): FunnelDesiredOutcomeId[] {
  const g = goal.toLowerCase();
  const outcomes: FunnelDesiredOutcomeId[] = [];

  if (g.includes("call")) outcomes.push("get_more_calls");
  if (g.includes("message") || g.includes("inquir") || g.includes("lead")) outcomes.push("get_more_leads");
  if (g.includes("book")) outcomes.push("make_contact_easier");
  if (g.includes("sale")) outcomes.push("get_more_leads");
  if (g.includes("information") || g.includes("explain")) outcomes.push("explain_services_clearly");
  if (g.includes("mix")) {
    outcomes.push("get_more_calls", "get_more_leads", "make_contact_easier");
  }
  if (g.includes("professional") || g.includes("trust")) outcomes.push("look_more_professional");

  if (outcomes.length === 0) {
    outcomes.push("look_more_professional", "make_contact_easier");
  }

  return Array.from(new Set(outcomes)).filter((id) =>
    (FUNNEL_DESIRED_OUTCOME_IDS as readonly string[]).includes(id),
  ) as FunnelDesiredOutcomeId[];
}

function inferHasWebsite(situation: string): "yes" | "no" {
  const s = situation.toLowerCase().trim();
  if (!s) return "no";
  if (/(nothing yet|no website|don't have|dont have|starting from scratch|from scratch)/.test(s)) {
    return "no";
  }
  if (/(website|wix|squarespace|wordpress|facebook page|instagram|\.com|http|www\.)/.test(s)) {
    return "yes";
  }
  return "no";
}

function extractWebsiteUrl(situation: string): string {
  const match = situation.match(/https?:\/\/[^\s,)]+|www\.[^\s,)]+/i);
  if (match) return match[0];
  const domain = situation.match(/\b[a-z0-9-]+\.(com|net|org|io)\b/i);
  return domain ? domain[0] : "";
}

function inferDesignDirection(summary: CaptainMakerProjectSummaryStorage): FunnelDesignDirectionId | "" {
  const haystack = `${summary.projectType} ${summary.recommendationTitle} ${summary.goal}`.toLowerCase();
  if (haystack.includes("landing") || haystack.includes("promo") || haystack.includes("event")) {
    return "simple-direct";
  }
  if (haystack.includes("local") || haystack.includes("lead") || haystack.includes("call")) {
    return "local-trust";
  }
  if (haystack.includes("premium") || haystack.includes("polished")) {
    return "premium-polished";
  }
  return "clean-professional";
}

export function buildMockupAutofillPatch(summary: CaptainMakerProjectSummaryStorage): MockupAutofillPatch {
  const hasWebsite = inferHasWebsite(summary.currentSituation);
  const websiteUrl = hasWebsite === "yes" ? extractWebsiteUrl(summary.currentSituation) : "";

  const topServicesParts = [summary.desiredAction, summary.projectType].filter(Boolean);
  const topServices = topServicesParts.join(" — ");

  const contextLines = [
    summary.goal ? `Main goal: ${summary.goal}` : null,
    summary.timeline ? `Timeline: ${summary.timeline}` : null,
    summary.budgetComfort ? `Budget comfort zone: ${summary.budgetComfort}` : null,
    summary.currentSituation ? `Current situation: ${summary.currentSituation}` : null,
    summary.recommendationTitle ? `Captain Maker recommended path: ${summary.recommendationTitle}` : null,
  ].filter(Boolean);

  return {
    businessName: summary.businessName,
    businessType: summary.projectType,
    topServices,
    whatMakesYouDifferent: contextLines.join("\n"),
    anythingElse: summary.generatedSummary,
    hasWebsite,
    websiteUrl,
    desiredOutcomes: new Set(mapGoalToOutcomes(summary.goal)),
    designDirection: inferDesignDirection(summary),
  };
}
