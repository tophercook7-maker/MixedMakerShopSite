import type { NicheServiceDefinition } from "../../types/service-catalog";

export const LANDSCAPING_CATALOG: Record<string, NicheServiceDefinition> = {
  "landscape-design": {
    serviceKey: "landscape-design",
    serviceName: "Landscape design",
    slug: "landscape-design",
    shortDescription: "Layout options that respect drainage, sun, and realistic maintenance.",
    longDescription:
      "Design starts with what you won’t do weekly — then we pick plants and bed shapes that survive summer heat.",
    commonJobs: ["Front foundation refresh", "Slope stabilization with plant mass", "Deer-heavy edges"],
    faq: [{ question: "Do you install irrigation?", answer: "We coordinate with irrigation pros when needed — beds tie into heads you already have." }],
    seoVariants: { descriptionHint: "Practical landscape layouts for Arkansas yards." },
    ctaLabel: "Book a design consult",
  },
  "mulch-bed-refresh": {
    serviceKey: "mulch-bed-refresh",
    serviceName: "Mulch & bed refresh",
    slug: "mulch-bed-refresh",
    shortDescription: "Weed removal, edge re-cut, and mulch depth that actually suppresses weeds.",
    longDescription:
      "Thin mulch invites weeds; thick mulch smothers perennials — we aim for the band that matches your plants.",
    commonJobs: ["Overgrown ring around trees", "Walkway beds spilling into turf", "HOA visibility beds"],
    faq: [{ question: "Which mulch?", answer: "Hardwood vs pine depends on acidity goals and plant palette — we’ll recommend for your beds." }],
    seoVariants: { descriptionHint: "Bed cleanup with crisp edges and proper mulch depth." },
    ctaLabel: "Schedule bed refresh",
  },
  "shrub-trimming": {
    serviceKey: "shrub-trimming",
    serviceName: "Shrub trimming",
    slug: "shrub-trimming",
    shortDescription: "Reduction pruning and shaping that buys time before the next cut.",
    longDescription:
      "We avoid poodle cuts on plants that resent it — timing matters for bloomers.",
    commonJobs: ["Encroachment on walkways", "Windows blocked by growth", "Overgrown HOA corners"],
    faq: [{ question: "Can you rejuvenate old shrubs?", answer: "Sometimes with staged reduction — we’ll be honest if removal makes more sense." }],
    seoVariants: { descriptionHint: "Shrub shaping and reduction pruning." },
    ctaLabel: "Request shrub work",
  },
  planting: {
    serviceKey: "planting",
    serviceName: "Planting",
    slug: "planting",
    shortDescription: "Seasonal installs with soil prep and spacing discipline.",
    longDescription:
      "We dig to loosen clay pockets, amend where it helps, and set watering expectations for the first month.",
    commonJobs: ["Foundation color", "Tree ring updates", "Perennial massing"],
    faq: [{ question: "Do you warranty plants?", answer: "We warranty workmanship; plant survival depends on watering — we leave clear notes." }],
    seoVariants: { descriptionHint: "Planting with soil prep and spacing discipline." },
    ctaLabel: "Plan a planting day",
  },
  "edging-and-bed-definition": {
    serviceKey: "edging-and-bed-definition",
    serviceName: "Edging & bed definition",
    slug: "edging-and-bed-definition",
    shortDescription: "Clean trench lines between turf and beds — the detail that makes mulch look intentional.",
    longDescription:
      "Edge quality changes how mowing feels — we re-establish curves and straight runs without scalping turf.",
    commonJobs: ["Curbside visibility", "Tree rings eating turf", "Beds bleeding into sidewalks"],
    faq: [{ question: "Metal or natural edge?", answer: "Depends on maintenance appetite — we’ll compare options for your lot." }],
    seoVariants: { descriptionHint: "Bed edging that improves mowing lines." },
    ctaLabel: "Get edging quote",
  },
};
