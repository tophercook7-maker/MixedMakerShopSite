/**
 * Live client sites showcased on the homepage (featured web design section).
 */
export const LIVE_WEB_PROJECTS = [
  {
    title: "Fresh Cut Property Care",
    pitch: "Built to help a local service business look trustworthy and turn visitors into calls.",
    previewSrc: "/images/showcase/freshcut-property-care.jpg",
    previewAlt: "Homepage preview of Fresh Cut Property Care — lawn care hero and call-to-action",
    hostname: "freshcutpropertycare.com",
    url: "https://freshcutpropertycare.com",
    analyticsId: "fresh_cut_property_care",
    /** Portrait capture — bias slightly toward hero + CTAs in wide cards */
    objectPosition: "center 42%",
    imageClassName: "object-cover",
  },
  {
    title: "Deep Well Audio",
    pitch: "A cleaner, more polished web presence built to make the brand feel established.",
    previewSrc: "/images/showcase/deep-well-audio.jpg",
    previewAlt:
      "Homepage preview of Deep Well Audio — typography and hero art from the live music site",
    hostname: "deepwellaudio.com",
    url: "https://deepwellaudio.com",
    analyticsId: "deep_well_audio",
    /** Below the nav grid, on the “Clarity over chaos” hero band */
    objectPosition: "center 16%",
    imageClassName: "object-cover",
  },
] as const;

export type LiveWebProject = (typeof LIVE_WEB_PROJECTS)[number];
