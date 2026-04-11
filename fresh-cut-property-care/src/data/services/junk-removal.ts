import type { NicheServiceDefinition } from "../../types/service-catalog";

export const JUNK_REMOVAL_CATALOG: Record<string, NicheServiceDefinition> = {
  "junk-removal": {
    serviceKey: "junk-removal",
    serviceName: "Junk removal",
    slug: "junk-removal",
    shortDescription: "Garage and household volume loads with clear tiered pricing.",
    longDescription:
      "We quote by volume and access — stairs, tight gates, and backyard carries change the plan and the time.",
    commonJobs: ["Garage bays you can’t park in", "Tenant move-outs", "Estate cleanouts"],
    faq: [{ question: "What counts as a full truck?", answer: "We’ll show you the tier visually and confirm before we load." }],
    seoVariants: { descriptionHint: "Volume-based junk removal with labor included." },
    ctaLabel: "Book junk pickup",
  },
  "furniture-removal": {
    serviceKey: "furniture-removal",
    serviceName: "Furniture removal",
    slug: "furniture-removal",
    shortDescription: "Sofas, mattresses, and bulky items with door-swing planning.",
    longDescription:
      "We measure trouble spots early — stair turns and tight hallways need padding and patience, not force.",
    commonJobs: ["Sectionals", "Mattresses", "Dining sets"],
    faq: [{ question: "Do you donate?", answer: "When condition and timing allow — we’ll be honest about what charities will take." }],
    seoVariants: { descriptionHint: "Furniture haul-off with careful access planning." },
    ctaLabel: "Remove furniture",
  },
  "appliance-removal": {
    serviceKey: "appliance-removal",
    serviceName: "Appliance removal",
    slug: "appliance-removal",
    shortDescription: "Washers, dryers, fridges — with basic disconnect coordination reminders.",
    longDescription:
      "We confirm water/electric safety steps you’ve completed before we muscle items through tight doors.",
    commonJobs: ["Kitchen swaps during remodel", "Laundry closet pulls", "Rental turnovers"],
    faq: [{ question: "Do you reconnect new appliances?", answer: "That’s outside our scope — we focus on safe removal and sweep-up." }],
    seoVariants: { descriptionHint: "Appliance removal with access-first planning." },
    ctaLabel: "Schedule appliance haul-off",
  },
  "garage-cleanout": {
    serviceKey: "garage-cleanout",
    serviceName: "Garage cleanout",
    slug: "garage-cleanout",
    shortDescription: "Sort-and-haul workflows for packed garages and workshops.",
    longDescription:
      "We stage keep/donate/dump decisions quickly so the day moves — photos beforehand help us quote accurately.",
    commonJobs: ["Two-car bay recovery", "Tool benches with mixed debris", "Storm prep declutter"],
    faq: [{ question: "Hazardous items?", answer: "Paint/chemicals need special disposal — we’ll separate what can’t ride in the truck." }],
    seoVariants: { descriptionHint: "Garage cleanouts with volume-based pricing." },
    ctaLabel: "Book garage cleanout",
  },
  "debris-haul-off": {
    serviceKey: "debris-haul-off",
    serviceName: "Debris haul-off",
    slug: "debris-haul-off",
    shortDescription: "Yard debris and small construction piles with load sizing upfront.",
    longDescription:
      "Mixed loads may need sorting — we plan for weight, spikes, and bagster coordination when dumps require it.",
    commonJobs: ["Fence tear-out piles", "Small remodel scraps", "Brush after storms"],
    faq: [{ question: "Concrete chunks?", answer: "Heavy debris may need a different haul route — we’ll price accordingly." }],
    seoVariants: { descriptionHint: "Debris removal with realistic disposal planning." },
    ctaLabel: "Quote debris haul-off",
  },
};
