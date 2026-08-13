import type { NicheServiceDefinition } from "../../types/service-catalog";

export const LAWN_CARE_CATALOG: Record<string, NicheServiceDefinition> = {
  "lawn-care": {
    serviceKey: "lawn-care",
    serviceName: "Lawn care",
    slug: "lawn-care",
    shortDescription: "Seasonal mowing rhythm, edging, and turf health awareness for real-world yards.",
    longDescription:
      "We keep height consistent through growth spikes, clean edges along concrete, and flag thin spots before they spread. Scheduling flexes around irrigation and spray windows when you share them.",
    commonJobs: ["Corner lots with heavy foot traffic", "Rental turnovers on short timelines", "Irrigation conflicts with mowing days"],
    faq: [
      { question: "Do you bag clippings?", answer: "Usually we mulch — it returns nutrients. If growth is excessive or disease is a concern, we’ll adjust for that visit." },
    ],
    seoVariants: { descriptionHint: "Mowing, edging, and seasonal lawn help." },
    ctaLabel: "Request lawn care pricing",
  },
  "lawn-mowing": {
    serviceKey: "lawn-mowing",
    serviceName: "Lawn mowing",
    slug: "lawn-mowing",
    shortDescription: "Regular cuts with sharp blades, careful trimming, and blower cleanup.",
    longDescription:
      "Mowing should look even and intentional — not scalped. We maintain equipment, lift mower wheels on slopes safely, and trim where the deck can’t reach without tearing grass.",
    commonJobs: ["Steep front yards", "Side yards with poor airflow", "Homes on travel schedules"],
    faq: [
      { question: "What height do you cut in summer?", answer: "Taller cuts in peak heat reduce stress — adjusted for your grass type when you tell us what you’re growing." },
    ],
    seoVariants: { descriptionHint: "Consistent mowing and trimming for busy homes." },
    ctaLabel: "Request mowing visits",
  },
  "yard-cleanup": {
    serviceKey: "yard-cleanup",
    serviceName: "Yard cleanup",
    slug: "yard-cleanup",
    shortDescription: "Storm debris, leaves, and neglected corners cleared so turf can breathe again.",
    longDescription:
      "Cleanups are about throughput and disposal planning — what can mulch, what should leave the property, and how to protect beds while we work.",
    commonJobs: ["Fence lines packed with leaves", "Patios buried after windy weeks", "Move-out or move-in weekends"],
    faq: [
      { question: "Do you haul off debris?", answer: "Yes — volume drives price. We’ll stage options if city pickup is part of your plan." },
    ],
    seoVariants: { descriptionHint: "Seasonal debris removal and thorough blower passes." },
    ctaLabel: "Book a cleanup",
  },
  "leaf-removal": {
    serviceKey: "leaf-removal",
    serviceName: "Leaf removal",
    slug: "leaf-removal",
    shortDescription: "Thick leaf mats lifted from turf and hardscapes to reduce mold and slip hazards.",
    longDescription:
      "We multi-pass heavy drops, clear drainage points, and keep beds from smothering perennials — wet leaves get handled differently than dry ones.",
    commonJobs: ["Oak-heavy lots", "Catch basins that back up", "Homes listing for sale"],
    faq: [
      { question: "Is mulching leaves into the lawn okay?", answer: "Light mulching can work. Thick mats should be thinned or removed so sunlight reaches the soil." },
    ],
    seoVariants: { descriptionHint: "Leaf clearing for safer walks and healthier turf." },
    ctaLabel: "Request leaf removal",
  },
  "pressure-washing": {
    serviceKey: "pressure-washing",
    serviceName: "Pressure washing",
    slug: "pressure-washing",
    shortDescription: "Concrete and exterior washing with controlled pressure and pretreatment when needed.",
    longDescription:
      "We match fan patterns to the stain — algae, pollen, tannin — and protect plants from overspray with practical runoff habits.",
    commonJobs: ["Shaded drives that get slick", "Porches tracking pollen indoors", "Rental turnovers"],
    faq: [
      { question: "Is house washing included?", answer: "We offer siding-safe methods as a separate scope — tell us your exterior type." },
    ],
    seoVariants: { descriptionHint: "Exterior washing for safer, cleaner surfaces." },
    ctaLabel: "Get washing quote",
  },
  "driveway-cleaning": {
    serviceKey: "driveway-cleaning",
    serviceName: "Driveway cleaning",
    slug: "driveway-cleaning",
    shortDescription: "Oil spots lightened, organic stains cleared, and edges brought back to a uniform color.",
    longDescription:
      "Driveways are half chemistry and half technique — pretreatment where it helps, careful pressure where it won’t damage joints or sealer.",
    commonJobs: ["Shaded algae streaks", "Garage drip marks", "Prep before sealcoat"],
    faq: [
      { question: "Will oil stains disappear?", answer: "Fresh spots respond best; older stains may lighten. We’ll set expectations before we start." },
    ],
    seoVariants: { descriptionHint: "Concrete cleaning with honest stain expectations." },
    ctaLabel: "Request driveway cleaning",
  },
};
