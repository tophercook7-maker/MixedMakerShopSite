import {
  buildProjectSummary,
  type CaptainMakerQuickStartKey,
  type GuidedAnswers,
  type GuidedRecommendation,
} from "@/lib/captain-maker-guided";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const CAPTAIN_MAKER_PROJECT_SUMMARY_KEY = "captainMakerProjectSummary";

export type CaptainMakerProjectSummaryStorage = {
  projectType: string;
  businessName: string;
  currentSituation: string;
  goal: string;
  desiredAction: string;
  timeline: string;
  budgetComfort: string;
  recommendationTitle: string;
  recommendationReason: string;
  generatedSummary: string;
  createdAt: string;
};

export function buildCaptainMakerProjectSummaryStorage(
  answers: GuidedAnswers,
  recommendation: GuidedRecommendation,
  quickStart: CaptainMakerQuickStartKey | null,
): CaptainMakerProjectSummaryStorage {
  return {
    projectType: answers.projectType.trim(),
    businessName: answers.businessOrIdea.trim(),
    currentSituation: answers.alreadyHave.trim(),
    goal: answers.mainGoal.trim(),
    desiredAction: answers.wantPeopleToDo.trim(),
    timeline: answers.timeline.trim(),
    budgetComfort: answers.budget.trim(),
    recommendationTitle: recommendation.service,
    recommendationReason: recommendation.why,
    generatedSummary: buildProjectSummary(answers, quickStart, recommendation),
    createdAt: new Date().toISOString(),
  };
}

export function isFreeMockupHref(href: string): boolean {
  const path = href.split("#")[0]?.split("?")[0] || "";
  return path === "/free-mockup" || href.startsWith(publicFreeMockupFunnelHref.split("#")[0]);
}

export function freeMockupHrefFromCaptainMaker(): string {
  return "/free-mockup?from=captain-maker#free-mockup-start";
}

export function saveCaptainMakerProjectSummary(payload: CaptainMakerProjectSummaryStorage): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CAPTAIN_MAKER_PROJECT_SUMMARY_KEY, JSON.stringify(payload));
}

export function loadCaptainMakerProjectSummary(): CaptainMakerProjectSummaryStorage | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CAPTAIN_MAKER_PROJECT_SUMMARY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CaptainMakerProjectSummaryStorage>;
    if (!parsed || typeof parsed !== "object" || !parsed.generatedSummary) return null;
    return {
      projectType: String(parsed.projectType || ""),
      businessName: String(parsed.businessName || ""),
      currentSituation: String(parsed.currentSituation || ""),
      goal: String(parsed.goal || ""),
      desiredAction: String(parsed.desiredAction || ""),
      timeline: String(parsed.timeline || ""),
      budgetComfort: String(parsed.budgetComfort || ""),
      recommendationTitle: String(parsed.recommendationTitle || ""),
      recommendationReason: String(parsed.recommendationReason || ""),
      generatedSummary: String(parsed.generatedSummary || ""),
      createdAt: String(parsed.createdAt || ""),
    };
  } catch {
    return null;
  }
}

export function clearCaptainMakerProjectSummary(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CAPTAIN_MAKER_PROJECT_SUMMARY_KEY);
}

export function saveAndNavigateToFreeMockup(payload: CaptainMakerProjectSummaryStorage): void {
  saveCaptainMakerProjectSummary(payload);
  if (typeof window === "undefined") return;
  window.location.assign(freeMockupHrefFromCaptainMaker());
}
