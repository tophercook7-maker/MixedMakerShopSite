import type { NicheServiceDefinition } from "../../types/service-catalog";

export const PAINTING_CATALOG: Record<string, NicheServiceDefinition> = {
  "house-painting": {
    serviceKey: "house-painting",
    serviceName: "House painting",
    slug: "house-painting",
    shortDescription: "Full exterior repaints with prep classes spelled out in the quote.",
    longDescription:
      "We scrape what’s failing, prime what’s thirsty, and keep coats even across sun vs shade sides.",
    commonJobs: ["South-side sun damage", "Peeling trim at gutters", "Pre-listing refreshes"],
    faq: [{ question: "Do you repair wood rot?", answer: "Small repairs yes — extensive carpentry gets a referral or a scoped add-on." }],
    seoVariants: { descriptionHint: "Exterior repainting with prep-first workflow." },
    ctaLabel: "Request exterior quote",
  },
  "exterior-painting": {
    serviceKey: "exterior-painting",
    serviceName: "Exterior painting",
    slug: "exterior-painting",
    shortDescription: "Siding, trim, and porch systems coated for Arkansas humidity swings.",
    longDescription:
      "Sheen and primer choices change by substrate — we don’t default to one product line for every home.",
    commonJobs: ["Aluminum siding chalk", "Wood clap peeling at butt joints", "Porch ceilings mildew"],
    faq: [{ question: "How long to cure?", answer: "Recoat windows depend on product — we leave written notes for you and painters the next day." }],
    seoVariants: { descriptionHint: "Exterior coatings matched to substrate and exposure." },
    ctaLabel: "Schedule exterior work",
  },
  "interior-painting": {
    serviceKey: "interior-painting",
    serviceName: "Interior painting",
    slug: "interior-painting",
    shortDescription: "Rooms, hallways, and trim with floor protection and crisp tape lines.",
    longDescription:
      "We sequence ceilings → walls → trim to reduce lap marks and keep dust controlled.",
    commonJobs: ["High-traffic hallways", "Rental repaint cycles", "Color changes after wallpaper removal"],
    faq: [{ question: "Do you move furniture?", answer: "Light moves included; heavy pieces need coordination — spelled out in scope." }],
    seoVariants: { descriptionHint: "Interior painting with prep and protection spelled out." },
    ctaLabel: "Book interior painting",
  },
  "fence-painting": {
    serviceKey: "fence-painting",
    serviceName: "Fence painting",
    slug: "fence-painting",
    shortDescription: "Solid stain and paint systems for wood privacy fences.",
    longDescription:
      "We clean first — failed stain won’t bond if grime and gray wood fiber remain.",
    commonJobs: ["HOA visibility fences", "Pet-damaged pickets", "Weathered cedar"],
    faq: [{ question: "Spray or brush?", answer: "Often both — spray for field, brush for cuts and wicking end grain." }],
    seoVariants: { descriptionHint: "Fence coatings with cleaning-first prep." },
    ctaLabel: "Quote fence painting",
  },
  "deck-staining": {
    serviceKey: "deck-staining",
    serviceName: "Deck staining",
    slug: "deck-staining",
    shortDescription: "Stripping decisions based on failure mode — not one process for every deck.",
    longDescription:
      "We test absorption, reset brightness, and choose stain solids for foot traffic and UV.",
    commonJobs: ["Flaking transparent coats", "Gray wood fiber", "Pool decks needing grip"],
    faq: [{ question: "How often re-stain?", answer: "Transparent systems need sooner refresh than solids — we’ll set expectations by exposure." }],
    seoVariants: { descriptionHint: "Deck stain systems matched to wood condition." },
    ctaLabel: "Schedule deck staining",
  },
};
