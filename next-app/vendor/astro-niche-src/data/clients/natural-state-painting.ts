import type { ClientConfig } from "../../types/client";

export const naturalStatePaintingClient: ClientConfig = {
  key: "natural-state-painting",
  nicheKey: "painting",
  businessName: "Natural State Painting",
  siteUrl: "https://naturalstatepainting.example.com",
  phone: "(501) 555-0404",
  email: "estimates@naturalstatepainting.example.com",
  city: "Hot Springs",
  state: "Arkansas",
  stateAbbr: "AR",
  brandDescription:
    "Natural State Painting delivers prep-first interior and exterior painting, cabinet refinishing, and deck stain systems tuned for Arkansas humidity.",
  serviceAreaDescription: "Hot Springs, Hot Springs Village, Lake Hamilton, and surrounding neighborhoods.",
  featuredServiceKeys: ["exterior-painting", "interior-painting", "deck-staining"],
  estimateCtaLabel: "Schedule a Project Estimate",
  estimateCtaHref: "/contact#estimate",
  secondaryCtaLabel: "Pricing",
  secondaryCtaHref: "/pricing",
  trustSellingPoints: ["Prep classes spelled out in quotes", "Daily job-site cleanup", "Sheen guidance per room"],
  homepage: {
    metaTitle: "Natural State Painting | Interior & exterior painting",
    metaDescription:
      "Painting in Hot Springs, AR — exterior repaints, interior rooms, cabinets, and deck staining with prep-first scopes.",
  },
  localPagesMode: "generated",
  localSeoLocationIds: ["hot-springs-ar", "hot-springs-village-ar", "lake-hamilton-ar"],
  localSeoServiceKeys: ["house-painting", "interior-painting", "exterior-painting", "fence-painting"],
};
