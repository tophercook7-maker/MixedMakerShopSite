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
    /** Bias toward hero + upper page; md+ uses contain in the card for a fuller-site read */
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
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
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
  },
] as const;

export type LiveWebProject = (typeof LIVE_WEB_PROJECTS)[number];
