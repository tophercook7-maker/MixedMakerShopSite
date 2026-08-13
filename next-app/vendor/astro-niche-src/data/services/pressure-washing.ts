import type { NicheServiceDefinition } from "../../types/service-catalog";

export const PRESSURE_WASHING_CATALOG: Record<string, NicheServiceDefinition> = {
  "pressure-washing": {
    serviceKey: "pressure-washing",
    serviceName: "Pressure washing",
    slug: "pressure-washing",
    shortDescription: "Driveways, walks, and patios cleaned with controlled pressure and pretreatment.",
    longDescription:
      "Algae and pollen embed in pores — we pretreat, rinse, and finish so grip returns without blasting apart weak joints.",
    commonJobs: ["North-facing concrete", "Pool decks", "Rental turnovers"],
    faq: [{ question: "Will this etch my concrete?", answer: "We use fan patterns and detergents to lift organics before pressure — not a single-tip blast across every slab." }],
    seoVariants: { descriptionHint: "Concrete cleaning for safer, brighter flatwork." },
    ctaLabel: "Get a washing quote",
  },
  "house-washing": {
    serviceKey: "house-washing",
    serviceName: "House washing",
    slug: "house-washing",
    shortDescription: "Siding-safe washing methods matched to vinyl, wood, and coated surfaces.",
    longDescription:
      "Soft wash approaches reduce risk to lap siding, trim, and caulking — we rinse downward and protect outlets and openings.",
    commonJobs: ["Pollen-heavy spring exteriors", "Spider droppings on eaves", "Prep before paint"],
    faq: [{ question: "Can you remove mildew completely?", answer: "Usually yes on non-porous siding; porous surfaces may need maintenance plans." }],
    seoVariants: { descriptionHint: "Soft washing for cleaner siding and trim." },
    ctaLabel: "Schedule house washing",
  },
  "deck-cleaning": {
    serviceKey: "deck-cleaning",
    serviceName: "Deck cleaning",
    slug: "deck-cleaning",
    shortDescription: "Wood and composite decks cleaned without furring up boards.",
    longDescription:
      "Decks need distance control — especially older wood. We clean, reset pH where needed, and recommend stain windows.",
    commonJobs: ["Green algae on north decks", "Food grease near grills", "Vacation rentals"],
    faq: [{ question: "Do you strip old stain?", answer: "Stripping is a different scope — we’ll tell you if wash-only is enough." }],
    seoVariants: { descriptionHint: "Deck washing with board-safe technique." },
    ctaLabel: "Request deck cleaning",
  },
  "concrete-cleaning": {
    serviceKey: "concrete-cleaning",
    serviceName: "Concrete cleaning",
    slug: "concrete-cleaning",
    shortDescription: "Garage floors, aprons, and sidewalks with targeted stain approaches.",
    longDescription:
      "Oil and tannins need pretreatment — we set expectations on age of stain and realistic lightening.",
    commonJobs: ["Garage drip trails", "Basketball pads", "Sidewalk edges"],
    faq: [{ question: "Do you seal after?", answer: "Sealing is optional after a clean surface — we’ll advise if it’s worth it." }],
    seoVariants: { descriptionHint: "Concrete cleaning and optional sealing prep." },
    ctaLabel: "Quote concrete cleaning",
  },
  "roof-soft-wash": {
    serviceKey: "roof-soft-wash",
    serviceName: "Roof soft wash",
    slug: "roof-soft-wash",
    shortDescription: "Low-pressure roof treatment for organic growth where appropriate.",
    longDescription:
      "Not every roof should be walked or blasted — we evaluate shingle age, pitch, and growth type before committing to a method.",
    commonJobs: ["Shaded north slopes", "Moss at drip lines", "Listings needing curb appeal"],
    faq: [{ question: "Will this void my shingle warranty?", answer: "Manufacturers vary — we avoid high pressure on asphalt and document methods used." }],
    seoVariants: { descriptionHint: "Careful roof treatment options after evaluation." },
    ctaLabel: "Ask about roof cleaning",
  },
};
