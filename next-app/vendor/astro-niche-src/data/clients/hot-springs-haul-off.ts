import type { ClientConfig } from "../../types/client";

export const hotSpringsHaulOffClient: ClientConfig = {
  key: "hot-springs-haul-off",
  nicheKey: "junk-removal",
  businessName: "Hot Springs Haul Off",
  siteUrl: "https://hotspringshauloff.example.com",
  phone: "(501) 555-0303",
  email: "dispatch@hauloff.example.com",
  city: "Hot Springs",
  state: "Arkansas",
  stateAbbr: "AR",
  brandDescription:
    "Hot Springs Haul Off provides fast junk removal, appliance pulls, and debris haul-off with volume-based quotes and clear access questions up front.",
  serviceAreaDescription: "Hot Springs, Hot Springs Village, Lake Hamilton, and nearby routes.",
  featuredServiceKeys: ["junk-removal", "furniture-removal", "appliance-removal"],
  estimateCtaLabel: "Get a Pickup Window",
  estimateCtaHref: "/contact#estimate",
  secondaryCtaLabel: "See pricing",
  secondaryCtaHref: "/pricing",
  trustSellingPoints: ["Volume-based quotes", "Labor included for standard items", "Sweep before we leave"],
  homepage: {
    metaTitle: "Hot Springs Haul Off | Junk removal & haul-off",
    metaDescription:
      "Junk removal in Hot Springs, AR — furniture, appliances, garage cleanouts, and debris haul-off with honest volume pricing.",
  },
  localPagesMode: "generated",
  localSeoLocationIds: ["hot-springs-ar", "hot-springs-village-ar"],
  localSeoServiceKeys: ["junk-removal", "furniture-removal", "appliance-removal", "debris-haul-off"],
};
