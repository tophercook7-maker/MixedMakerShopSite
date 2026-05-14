export type CaptainMakerServiceKey =
  | "landing_page"
  | "website"
  | "ai_bot"
  | "flyers_ads"
  | "custom_3d_print";

export type CaptainMakerRecommendation = {
  key: CaptainMakerServiceKey;
  title: string;
  price: string;
  summary: string;
  salesGuide: string;
};

const recommendations: Record<CaptainMakerServiceKey, CaptainMakerRecommendation> = {
  landing_page: {
    key: "landing_page",
    title: "Landing Page",
    price: "Starts at $100",
    summary:
      "Best fit for a simple one-page site, product promo, event page, or quick online presence. Add-ons like extra sections, forms, graphics, booking, or special setup can increase the price.",
    salesGuide:
      "That sounds like a landing page, Maker. Landing pages start at $100 and work well for one offer, event, service, product, or quick online presence.",
  },
  website: {
    key: "website",
    title: "Website",
    price: "Starts at $400",
    summary:
      "Best fit for website help, a full business site, Google Business Profile setup, monthly support, service pages, contact forms, booking, menus, payments, or a more complete online home. Added features increase the price.",
    salesGuide:
      "Sounds like a website path may be the right ship to board, Maker. Websites start at $400, Google Business Profile setup is a strong add-on, and monthly support can keep updates from sitting untouched.",
  },
  ai_bot: {
    key: "ai_bot",
    title: "AI Bot",
    price: "$200 with a first website build, or $500 when added later / to a site Mixed Maker Shop did not build",
    summary:
      "Best fit for a chatbot, customer helper, lead capture assistant, or AI support tool that helps visitors get answers and move toward the next step.",
    salesGuide:
      "AI can help answer customer questions, Maker, collect leads, explain services, and guide visitors toward the right next step. It’s $200 when added during a new website build or $500 if added later.",
  },
  flyers_ads: {
    key: "flyers_ads",
    title: "Flyers / Ads",
    price: "Starts at $50",
    summary:
      "Best fit for flyers, ads, promo graphics, event graphics, or social media promo pieces that need to look clear and ready to share.",
    salesGuide:
      "Flyers and ads start at $50, Maker. They’re good for events, promos, local services, product drops, and getting attention fast.",
  },
  custom_3d_print: {
    key: "custom_3d_print",
    title: "Custom / 3D Print Estimate",
    price: "Custom estimate required",
    summary:
      "Best fit for 3D prints, ribbons, custom objects, parts, gifts, signs, or physical items. The Maker path here starts with details so Mixed Maker Shop can estimate it properly.",
    salesGuide:
      "3D prints are custom estimates, Maker, because size, material, detail, design time, and deadline all matter.",
  },
};

const keywordRules: Array<{ key: CaptainMakerServiceKey; words: string[] }> = [
  {
    key: "custom_3d_print",
    words: ["3d", "print", "printed", "ribbon", "ribbons", "object", "part", "parts", "gift", "sign", "physical"],
  },
  {
    key: "ai_bot",
    words: ["bot", "chatbot", "ai", "assistant", "customer helper", "lead capture", "support", "automated"],
  },
  {
    key: "flyers_ads",
    words: ["flyer", "flyers", "ad", "ads", "promo graphic", "event graphic", "social media", "facebook post"],
  },
  {
    key: "website",
    words: [
      "full site",
      "business site",
      "multiple pages",
      "services",
      "gallery",
      "booking",
      "menu",
      "payments",
      "store",
      "google business profile",
      "gbp",
      "monthly support",
      "support plan",
    ],
  },
  {
    key: "landing_page",
    words: ["one-page", "one page", "landing", "promo", "event page", "quick online", "simple site", "online presence"],
  },
];

export function getCaptainMakerRecommendation(input: string, selectedNeed = ""): CaptainMakerRecommendation {
  const haystack = `${selectedNeed} ${input}`.toLowerCase();
  for (const rule of keywordRules) {
    if (rule.words.some((word) => haystack.includes(word))) {
      return recommendations[rule.key];
    }
  }
  return recommendations.website;
}

export function getCaptainMakerObjectionResponse(input: string, selectedNeed = ""): string {
  const haystack = `${selectedNeed} ${input}`.toLowerCase();
  if (/\b(don't know|dont know|not sure|unsure|no idea|don’t know)\b/.test(haystack)) {
    return "That’s normal, Maker. You don’t need the full plan yet. Tell me what you’re trying to accomplish, and I’ll help sort the build path.";
  }
  if (/\b(price|cost|how much|budget|rates?|charge)\b/.test(haystack)) {
    return "Fair question, Maker. Landing pages start at $100, websites start at $400, Google Business Profile setup is $150 one-time, monthly support starts at $45/mo, flyers and ads start at $50, and 3D prints/custom work need an estimate.";
  }
  if (/\b(just looking|browsing|looking around|checking|curious)\b/.test(haystack)) {
    return "No problem, Maker. I can still help you figure out the best starting place so you don’t waste time or money.";
  }
  return "";
}

export const captainMakerRecommendations = recommendations;
