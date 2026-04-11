import type { ClientConfig } from "../../types/client";

export const ridgeviewRoofingClient: ClientConfig = {
  key: "ridgeview-roofing",
  nicheKey: "roofing",
  businessName: "Ridgeview Roofing",
  siteUrl: "https://ridgeviewroofing.example.com",
  phone: "(501) 555-0505",
  email: "service@ridgeviewroofing.example.com",
  city: "Hot Springs",
  state: "Arkansas",
  stateAbbr: "AR",
  brandDescription:
    "Ridgeview Roofing provides inspections, repairs, and replacements with photo documentation and clear repair-vs-replace guidance.",
  serviceAreaDescription: "Hot Springs, Hot Springs Village, Lake Hamilton, and nearby storm-prone routes.",
  featuredServiceKeys: ["roof-inspection", "roof-repair", "storm-damage-roofing"],
  estimateCtaLabel: "Request a Roof Inspection",
  estimateCtaHref: "/contact#estimate",
  secondaryCtaLabel: "Pricing & contact",
  secondaryCtaHref: "/pricing",
  trustSellingPoints: ["Photo reports", "Repair-first mindset when safe", "Clean magnet passes"],
  homepage: {
    metaTitle: "Ridgeview Roofing | Roof repair & replacement",
    metaDescription:
      "Roofing in Hot Springs, AR — inspections, storm documentation, repairs, and replacements explained in plain language.",
  },
  localPagesMode: "generated",
  localSeoLocationIds: ["hot-springs-ar", "hot-springs-village-ar"],
  localSeoServiceKeys: ["roof-repair", "roof-inspection", "storm-damage-roofing", "roof-replacement"],
};
