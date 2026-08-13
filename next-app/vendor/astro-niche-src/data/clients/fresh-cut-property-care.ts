import type { ClientConfig } from "../../types/client";

/** Active default — lawn care + outdoor services in Garland County area. */
export const freshCutPropertyCareClient: ClientConfig = {
  key: "fresh-cut-property-care",
  nicheKey: "lawn-care",
  businessName: "Fresh Cut Property Care",
  siteUrl: "https://freshcutpropertycare.com",
  phone: "(501) 555-1234",
  email: "hello@example.com",
  city: "Hot Springs",
  state: "Arkansas",
  stateAbbr: "AR",
  logoPath: "/favicon.svg",
  brandDescription:
    "Fresh Cut Property Care provides dependable lawn care, cleanup, and washing with clear estimates and local routing across Hot Springs and nearby communities.",
  serviceAreaDescription: "Hot Springs, Hot Springs Village, Lake Hamilton, and nearby Garland County areas.",
  featuredServiceKeys: ["lawn-care", "yard-cleanup", "pressure-washing"],
  estimateCtaLabel: "Request a Free Estimate",
  estimateCtaHref: "/contact#estimate",
  secondaryCtaLabel: "See Pricing or Contact",
  secondaryCtaHref: "/pricing",
  trustSellingPoints: [
    "Local scheduling that respects neighborhood streets",
    "Straightforward scopes — no mystery packages",
    "Equipment maintained for clean cuts and safer washing",
  ],
  homepage: {
    heroHeadline: "Outdoor work that respects your time",
    heroSubheadline:
      "Straightforward lawn care for Hot Springs-area homes — steady scheduling, sharp edges, and cleanup that doesn’t leave clippings tracking into the garage.",
    coreOffer:
      "A practical maintenance rhythm with honest recommendations when something needs attention — from turf to concrete.",
    metaTitle: "Fresh Cut Property Care | Outdoor services in Hot Springs & nearby",
    metaDescription:
      "Dependable lawn care, yard cleanup, and pressure washing in Hot Springs, AR. Clear estimates, local routing, and work you can see from the curb.",
    finalCtaTitle: "Want a clear plan for your yard?",
    finalCtaBody: "Tell us about slope, trees, and how often you want things handled — we’ll recommend a realistic cadence.",
  },
  localPagesMode: "explicit",
  explicitLocalPagesKey: "fresh-cut-property-care",
};
