import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const CAPTAIN_MAKER_DISCLAIMER =
  "Captain Maker can help you choose a starting path, but final scope, pricing, timing, and availability are confirmed by Topher before work begins. Starting prices are reference points only — not final quotes.";

export type CaptainMakerQuickStartKey =
  | "website"
  | "landing_page"
  | "local_leads"
  | "print_3d"
  | "ai_automation"
  | "unsure";

export type CaptainMakerBadge =
  | "Websites"
  | "3D Printing"
  | "AI Helpers"
  | "Local Leads"
  | "Free Preview";

export type GuidedStep = "project_type" | "details" | "goal" | "recommendation";

export type GuidedAnswers = {
  projectType: string;
  businessOrIdea: string;
  alreadyHave: string;
  wantPeopleToDo: string;
  mainGoal: string;
  timeline: string;
  budget: string;
};

export type GuidedRecommendation = {
  service: string;
  why: string;
  nextStep: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  badges: CaptainMakerBadge[];
  startingPriceNote: string;
  preferMockupCta: boolean;
};

export const GUIDED_PROGRESS_STEPS: Array<{ key: GuidedStep; label: string }> = [
  { key: "project_type", label: "Project Type" },
  { key: "details", label: "Details" },
  { key: "goal", label: "Goal" },
  { key: "recommendation", label: "Recommendation" },
];

export const CAPTAIN_MAKER_BADGES: CaptainMakerBadge[] = [
  "Websites",
  "3D Printing",
  "AI Helpers",
  "Local Leads",
  "Free Preview",
];

export const QUICK_START_OPTIONS: Array<{
  key: CaptainMakerQuickStartKey;
  label: string;
  hint: string;
}> = [
  { key: "website", label: "I need a website", hint: "Full site or clearer business homepage" },
  { key: "landing_page", label: "I need a landing page", hint: "One focused page for an offer or event" },
  {
    key: "local_leads",
    label: "I need help getting more local leads",
    hint: "Website, Google profile, and easier contact paths",
  },
  { key: "print_3d", label: "I need something 3D printed", hint: "Custom prints from GiGi's Print Shop" },
  { key: "ai_automation", label: "I need an AI helper or automation", hint: "Bots, intake flows, and workflow help" },
  { key: "unsure", label: "I'm not sure yet", hint: "Answer a few plain questions first" },
];

export const GUIDED_DETAIL_QUESTIONS: Array<{
  key: keyof Pick<GuidedAnswers, "projectType" | "businessOrIdea" | "alreadyHave" | "wantPeopleToDo">;
  label: string;
  placeholder: string;
}> = [
  {
    key: "projectType",
    label: "What kind of project is this?",
    placeholder: "Example: lawn care business website, event promo page, custom keychain batch…",
  },
  {
    key: "businessOrIdea",
    label: "What business or idea is it for?",
    placeholder: "Example: Fresh Cut Property Care in Hot Springs, AR",
  },
  {
    key: "alreadyHave",
    label: "What do you already have?",
    placeholder: "Example: Facebook page, old Wix site, logo, photos, nothing yet…",
  },
  {
    key: "wantPeopleToDo",
    label: "What do you want people to do next?",
    placeholder: "Example: call, request a quote, book online, buy, sign up…",
  },
];

export const GUIDED_GOAL_QUESTIONS: Array<{
  key: keyof Pick<GuidedAnswers, "mainGoal" | "timeline" | "budget">;
  label: string;
  placeholder?: string;
  options?: string[];
}> = [
  {
    key: "mainGoal",
    label: "Do you need this mainly for calls, messages, bookings, sales, or information?",
    options: ["Calls", "Messages", "Bookings", "Sales", "Information", "Mix of these"],
  },
  {
    key: "timeline",
    label: "What is your timeline?",
    placeholder: "Example: ASAP, this month, before summer, flexible…",
  },
  {
    key: "budget",
    label: "What is your rough budget comfort zone?",
    options: ["Under $100", "$100–$400", "$400–$800", "$800+", "Not sure yet"],
  },
];

export const EMPTY_GUIDED_ANSWERS: GuidedAnswers = {
  projectType: "",
  businessOrIdea: "",
  alreadyHave: "",
  wantPeopleToDo: "",
  mainGoal: "",
  timeline: "",
  budget: "",
};

function includesAny(haystack: string, words: string[]): boolean {
  return words.some((word) => haystack.includes(word));
}

function answersHaystack(answers: GuidedAnswers, quickStart?: CaptainMakerQuickStartKey | null): string {
  return [
    quickStart || "",
    answers.projectType,
    answers.businessOrIdea,
    answers.alreadyHave,
    answers.wantPeopleToDo,
    answers.mainGoal,
    answers.timeline,
    answers.budget,
  ]
    .join(" ")
    .toLowerCase();
}

function defaultWhyForWebsite(answers: GuidedAnswers): string {
  const bits = [
    answers.businessOrIdea ? `${answers.businessOrIdea} needs a clearer first impression online.` : null,
    answers.wantPeopleToDo ? `You want visitors to ${answers.wantPeopleToDo.toLowerCase()}.` : null,
    answers.alreadyHave ? `You already have ${answers.alreadyHave.toLowerCase()}, so we can build from real starting material.` : null,
  ].filter(Boolean);
  return (
    bits.join(" ") ||
    "You have a business that needs a clearer mobile-friendly first impression and an easier way for customers to contact you."
  );
}

export function prefillAnswersForQuickStart(
  quickStart: CaptainMakerQuickStartKey,
): Partial<GuidedAnswers> {
  switch (quickStart) {
    case "website":
      return { projectType: "Business website / clearer online presence" };
    case "landing_page":
      return { projectType: "Landing page for one offer, event, or promo" };
    case "local_leads":
      return {
        projectType: "Local lead generation — website + Google visibility",
        mainGoal: "Calls",
      };
    case "print_3d":
      return { projectType: "Custom 3D print request" };
    case "ai_automation":
      return { projectType: "AI helper, chatbot, or automation workflow" };
    default:
      return {};
  }
}

export function buildGuidedRecommendation(
  answers: GuidedAnswers,
  quickStart?: CaptainMakerQuickStartKey | null,
): GuidedRecommendation {
  const haystack = answersHaystack(answers, quickStart);

  if (
    quickStart === "print_3d" ||
    includesAny(haystack, ["3d", "print", "printed", "keychain", "part", "gigi"])
  ) {
    return {
      service: "GiGi's Print Shop — 3D Print Request",
      why:
        answers.projectType || answers.businessOrIdea
          ? `You described a physical/custom build (${answers.projectType || answers.businessOrIdea}). Size, material, and deadline matter for a real estimate.`
          : "You need a custom printed object, promo piece, or part. GiGi's Print Shop starts with your item details before pricing anything final.",
      nextStep:
        "Share what you want printed, the rough size, color/material preference, and your deadline on the 3D printing path.",
      ctaLabel: "Start 3D Print Request",
      ctaHref: "/3d-printing",
      secondaryCtaLabel: "Send this to Topher",
      secondaryCtaHref: "/contact",
      badges: ["3D Printing"],
      startingPriceNote: "3D prints are custom estimates — starting prices depend on size, material, and design time.",
      preferMockupCta: false,
    };
  }

  if (
    quickStart === "ai_automation" ||
    includesAny(haystack, ["ai", "bot", "chatbot", "automation", "workflow", "assistant"])
  ) {
    return {
      service: "AI Helper & Automation Consult",
      why:
        answers.wantPeopleToDo || answers.mainGoal
          ? `You want help answering questions, capturing ${answers.mainGoal?.toLowerCase() || "leads"}, or guiding visitors without doing everything manually.`
          : "An AI helper can answer repeat questions, collect leads, and point visitors to the right next step on your site.",
      nextStep:
        "Review the AI & automation path, then tell Topher what should be automated and what should stay human-reviewed.",
      ctaLabel: "Explore AI & Automation",
      ctaHref: "/websites-tools#ai-automation",
      secondaryCtaLabel: "Send this to Topher",
      secondaryCtaHref: "/contact",
      badges: ["AI Helpers"],
      startingPriceNote: "AI helpers start at $200 during a first website build or $500 when added later — final scope is confirmed by Topher.",
      preferMockupCta: false,
    };
  }

  if (
    quickStart === "local_leads" ||
    includesAny(haystack, [
      "local lead",
      "google",
      "maps",
      "gbp",
      "business profile",
      "more calls",
      "more customers",
      "get found",
    ])
  ) {
    return {
      service: "Local Web Presence Fix",
      why:
        "You need more local visibility — a clear one-page or multi-page site, Google Business Profile cleanup, and obvious contact buttons so people can call or message you fast.",
      nextStep:
        "Start with a free homepage preview or review starting prices for GBP setup and monthly support. Topher confirms the right mix before work begins.",
      ctaLabel: "Start Free Preview",
      ctaHref: publicFreeMockupFunnelHref,
      secondaryCtaLabel: "See starting pricing",
      secondaryCtaHref: "/pricing",
      badges: ["Local Leads", "Websites", "Free Preview"],
      startingPriceNote: "Websites start at $400, GBP setup is $150 one-time, monthly support from $45/mo — all starting points only.",
      preferMockupCta: true,
    };
  }

  if (
    quickStart === "landing_page" ||
    includesAny(haystack, ["landing", "one page", "one-page", "event", "promo", "offer page", "single page"])
  ) {
    return {
      service: "Landing Page",
      why:
        answers.wantPeopleToDo
          ? `You need one focused page that drives people to ${answers.wantPeopleToDo.toLowerCase()} — not a full multi-page rebuild yet.`
          : "You need one sharp page for an offer, event, or promo — faster to launch than a full site when the goal is narrow.",
      nextStep:
        "Start a free website preview and note that you want a landing-page direction. Topher can show what that focused page could look like.",
      ctaLabel: "Start Free Preview",
      ctaHref: publicFreeMockupFunnelHref,
      secondaryCtaLabel: "Send this to Topher",
      secondaryCtaHref: "/contact",
      badges: ["Websites", "Free Preview"],
      startingPriceNote: "Landing pages start at $100 — add-ons and scope are confirmed before anything is scheduled.",
      preferMockupCta: true,
    };
  }

  if (
    quickStart === "website" ||
    includesAny(haystack, [
      "website",
      "web site",
      "homepage",
      "online presence",
      "bad website",
      "new site",
      "business site",
      "mobile",
    ])
  ) {
    return {
      service: "Free Homepage Preview",
      why: defaultWhyForWebsite(answers),
      nextStep:
        "Start a free website preview so Topher can show you what your homepage could become before you commit to a full build.",
      ctaLabel: "Start Free Preview",
      ctaHref: publicFreeMockupFunnelHref,
      secondaryCtaLabel: "Send this to Topher",
      secondaryCtaHref: "/contact",
      badges: ["Websites", "Free Preview"],
      startingPriceNote: "Full websites start at $400 — preview first, final scope and pricing confirmed by Topher.",
      preferMockupCta: true,
    };
  }

  if (quickStart === "unsure" || includesAny(haystack, ["not sure", "unsure", "don't know", "dont know"])) {
    return {
      service: "Captain Maker Summary + Contact Topher",
      why:
        "You're still sorting the fit — that's normal. A short summary gives Topher enough context to point you toward the right path without guessing.",
      nextStep:
        "Copy your project summary or send it to Topher so he can review your answers and recommend the right starting place.",
      ctaLabel: "Send this to Topher",
      ctaHref: "/contact",
      secondaryCtaLabel: "Start Free Preview",
      secondaryCtaHref: publicFreeMockupFunnelHref,
      badges: ["Websites", "Free Preview"],
      startingPriceNote: "All pricing shared here is a starting reference — Topher confirms scope before work begins.",
      preferMockupCta: false,
    };
  }

  return {
    service: "Free Homepage Preview",
    why: defaultWhyForWebsite(answers),
    nextStep:
      "Start a free website preview so Topher can show you a practical homepage direction based on what you shared.",
    ctaLabel: "Start Free Preview",
    ctaHref: publicFreeMockupFunnelHref,
    secondaryCtaLabel: "Send this to Topher",
    secondaryCtaHref: "/contact",
    badges: ["Websites", "Free Preview"],
    startingPriceNote: "Starting prices are reference points only — not final quotes or timelines.",
    preferMockupCta: true,
  };
}

export function buildProjectSummary(
  answers: GuidedAnswers,
  quickStart: CaptainMakerQuickStartKey | null,
  recommendation: GuidedRecommendation,
): string {
  const quickStartLabel = quickStart
    ? QUICK_START_OPTIONS.find((option) => option.key === quickStart)?.label
    : null;

  return [
    "Captain Maker project summary",
    "",
    quickStartLabel ? `Quick start: ${quickStartLabel}` : null,
    answers.projectType ? `Project type: ${answers.projectType}` : null,
    answers.businessOrIdea ? `Business / idea: ${answers.businessOrIdea}` : null,
    answers.alreadyHave ? `Already have: ${answers.alreadyHave}` : null,
    answers.wantPeopleToDo ? `Want people to: ${answers.wantPeopleToDo}` : null,
    answers.mainGoal ? `Main goal: ${answers.mainGoal}` : null,
    answers.timeline ? `Timeline: ${answers.timeline}` : null,
    answers.budget ? `Budget comfort zone: ${answers.budget}` : null,
    "",
    `Recommended path: ${recommendation.service}`,
    `Why: ${recommendation.why}`,
    `Next step: ${recommendation.nextStep}`,
    "",
    CAPTAIN_MAKER_DISCLAIMER,
  ]
    .filter(Boolean)
    .join("\n");
}
