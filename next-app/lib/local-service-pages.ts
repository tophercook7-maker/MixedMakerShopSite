/**
 * Local service / SEO landing pages — shared structure and copy.
 * Routes: /[slug] e.g. lawn-care-hot-springs-ar
 */

export type LocalServicePageConfig = {
  slug: string;
  /** Title case service name for H1 */
  serviceTitle: string;
  cityState: string;
  /** e.g. "Hot Springs" */
  cityShort: string;
  stateAbbr: string;
  intro: string;
  whatWeOffer: readonly string[];
  whyChooseUs: readonly string[];
  commonJobs: readonly string[];
  servingAreas: string;
  /** Other page slugs for internal links */
  relatedSlugs: readonly string[];
  metaDescription: string;
};

const CITY_STATE = "Hot Springs, AR";
const CITY = "Hot Springs";

export const LOCAL_SERVICE_PAGES: Record<string, LocalServicePageConfig> = {
  "lawn-care-hot-springs-ar": {
    slug: "lawn-care-hot-springs-ar",
    serviceTitle: "Lawn Care",
    cityState: CITY_STATE,
    cityShort: CITY,
    stateAbbr: "AR",
    intro:
      "Whether you need regular mowing or a one-time spruce-up, local customers often start with a search. A clear lawn care site helps people in Hot Springs and nearby areas understand what you offer and how to reach you — without the runaround.",
    whatWeOffer: [
      "Recurring mowing and edging",
      "Seasonal cleanup and bed maintenance",
      "Basic weed control and trimming (as your business offers)",
      "Clear pricing cues and service area messaging",
    ],
    whyChooseUs: [
      "Straightforward pages that build trust fast",
      "Mobile-friendly layout for people searching on their phones",
      "Easy paths to call, text, or request an estimate",
      "Built to reflect how you actually run the business",
    ],
    commonJobs: [
      "Weekly or bi-weekly mowing for busy homeowners",
      "Spring cleanup after winter growth",
      "Rental and small commercial touch-ups",
      "Overgrown edges and beds that need a reset",
    ],
    servingAreas: `${CITY}, Lake Hamilton, Piney, and nearby Garland County communities — wherever you actually work.`,
    relatedSlugs: ["yard-cleanup-hot-springs-ar", "pressure-washing-hot-springs-ar"],
    metaDescription:
      "Lawn care in Hot Springs, AR. Websites built to help local mowing and property care businesses get found and get calls.",
  },
  "pressure-washing-hot-springs-ar": {
    slug: "pressure-washing-hot-springs-ar",
    serviceTitle: "Pressure Washing",
    cityState: CITY_STATE,
    cityShort: CITY,
    stateAbbr: "AR",
    intro:
      "Pressure washing is a search-driven business — people look for help with driveways, siding, decks, and storefronts. A simple, credible site makes it obvious what you clean, where you work, and how to book you in the Hot Springs area.",
    whatWeOffer: [
      "Service pages for residential and commercial work",
      "Before/after friendly layout (photos you provide)",
      "Clear safety and scope messaging",
      "Fast, mobile-friendly pages",
    ],
    whyChooseUs: [
      "Trust-first design that fits trades and outdoor work",
      "Clear calls to action: call, text, or estimate",
      "Structured content that matches how people search",
      "Easy to update when you add services or areas",
    ],
    commonJobs: [
      "Driveway and sidewalk cleaning",
      "House siding and porch refresh",
      "Deck and fence wash-downs",
      "Small commercial storefronts and entries",
    ],
    servingAreas: `${CITY} and surrounding areas you define — so visitors know you’re local.`,
    relatedSlugs: ["lawn-care-hot-springs-ar", "yard-cleanup-hot-springs-ar"],
    metaDescription:
      "Pressure washing in Hot Springs, AR. Simple websites that help washing businesses show up locally and win more jobs.",
  },
  "yard-cleanup-hot-springs-ar": {
    slug: "yard-cleanup-hot-springs-ar",
    serviceTitle: "Yard Cleanup",
    cityState: CITY_STATE,
    cityShort: CITY,
    stateAbbr: "AR",
    intro:
      "Leaf removal, brush haul-off, and seasonal cleanups are often booked after a quick search. Your site should explain what you handle, when you’re available, and how to get on your schedule — especially for homeowners around Hot Springs.",
    whatWeOffer: [
      "Cleanup and hauling service descriptions",
      "Seasonal messaging you can swap over time",
      "Contact and estimate requests that are easy on mobile",
      "Room to add photos as you complete jobs",
    ],
    whyChooseUs: [
      "Plain-language pages that match real searches",
      "Clear “what we do” structure Google can follow",
      "Fast loads so busy customers don’t bounce",
      "Built to grow if you add lawn care or other services",
    ],
    commonJobs: [
      "Fall leaf removal and bagging",
      "Storm debris and branch cleanup",
      "Overgrown beds and brush clearing",
      "Move-out or estate property tidy-ups",
    ],
    servingAreas: `${CITY} neighborhoods and nearby towns — set your real radius on the page.`,
    relatedSlugs: ["lawn-care-hot-springs-ar", "pressure-washing-hot-springs-ar"],
    metaDescription:
      "Yard cleanup in Hot Springs, AR. Websites that help cleanup and hauling businesses get found and get estimate requests.",
  },
};

export function getLocalServiceConfig(slug: string): LocalServicePageConfig | undefined {
  return LOCAL_SERVICE_PAGES[slug];
}

export const LOCAL_SERVICE_SLUGS = Object.keys(LOCAL_SERVICE_PAGES) as readonly string[];

export function localServicePageTitle(cfg: LocalServicePageConfig): string {
  return `${cfg.serviceTitle} in ${cfg.cityState} | MixedMakerShop`;
}
