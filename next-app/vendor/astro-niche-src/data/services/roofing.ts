import type { NicheServiceDefinition } from "../../types/service-catalog";

export const ROOFING_CATALOG: Record<string, NicheServiceDefinition> = {
  "roof-repair": {
    serviceKey: "roof-repair",
    serviceName: "Roof repair",
    slug: "roof-repair",
    shortDescription: "Targeted fixes for leaks, flashing, and localized shingle damage.",
    longDescription:
      "We trace uphill, document layers, and repair what’s failing — not just the ceiling stain below.",
    commonJobs: ["Valley leaks", "Pipe boot cracks", "Lifted shingles after wind"],
    faq: [{ question: "Temporary tarp?", answer: "When storms are active, we’ll discuss short-term protection while materials arrive." }],
    seoVariants: { descriptionHint: "Roof repairs with documented findings." },
    ctaLabel: "Request roof repair",
  },
  "roof-replacement": {
    serviceKey: "roof-replacement",
    serviceName: "Roof replacement",
    slug: "roof-replacement",
    shortDescription: "Tear-off installs with decking checks and clean jobsite habits.",
    longDescription:
      "Replacement timing isn’t just age — pattern failure, granule loss, and attic signs all matter.",
    commonJobs: ["Two-story homes with heavy south exposure", "Multiple leak points", "Selling timeline"],
    faq: [{ question: "Payment milestones?", answer: "We outline draws tied to measurable progress — spelled out in writing." }],
    seoVariants: { descriptionHint: "Roof replacement scopes with clear milestones." },
    ctaLabel: "Get replacement quote",
  },
  "roof-inspection": {
    serviceKey: "roof-inspection",
    serviceName: "Roof inspection",
    slug: "roof-inspection",
    shortDescription: "Photo reports with prioritized findings — repairs vs monitor.",
    longDescription:
      "Attic pulls, shingle seal checks, and flashing photos — written so you can act or wait with clarity.",
    commonJobs: ["Home purchases", "Annual checks after hail season", "Insurance documentation"],
    faq: [{ question: "Do you climb?", answer: "We use safe access methods for pitch and condition — some roofs are drone/document only." }],
    seoVariants: { descriptionHint: "Roof inspections with clear photo documentation." },
    ctaLabel: "Schedule inspection",
  },
  "storm-damage-roofing": {
    serviceKey: "storm-damage-roofing",
    serviceName: "Storm damage roofing",
    slug: "storm-damage-roofing",
    shortDescription: "Hail/wind documentation with repair-first mindset when possible.",
    longDescription:
      "We separate cosmetic marks from seal failures — paperwork stays clear for you and your carrier.",
    commonJobs: ["Hail bruising on ridge", "Wind creased tabs", "Gutter edge dents"],
    faq: [{ question: "Public adjuster?", answer: "Your choice — we provide technical documentation either way." }],
    seoVariants: { descriptionHint: "Storm assessments with repair vs replace clarity." },
    ctaLabel: "Storm damage review",
  },
  "shingle-repair": {
    serviceKey: "shingle-repair",
    serviceName: "Shingle repair",
    slug: "shingle-repair",
    shortDescription: "Tab replacements and seal-down work in localized zones.",
    longDescription:
      "We match bundles where possible and blend repair zones so you’re not staring at one bright patch forever.",
    commonJobs: ["Tree limb strikes", "Critter damage", "Localized wind lift"],
    faq: [{ question: "Will it match?", answer: "New shingles are brighter — we set expectations on blending vs full slope replacement." }],
    seoVariants: { descriptionHint: "Localized shingle repairs with matched bundles." },
    ctaLabel: "Request shingle repair",
  },
};
