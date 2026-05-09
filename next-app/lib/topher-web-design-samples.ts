/** Dedicated web-design branch site (external). */
export const TOPHER_WEB_DESIGN_URL = "https://topherswebdesign.com" as const;

export const topherWebDesignSampleSites = [
  {
    title: "Local Business Site",
    description:
      "A clean 3–5 page website for services, contact info, photos, and trust-building.",
    inquireSubject: "Local business website",
  },
  {
    title: "Informational Website",
    description:
      "A simple, organized site for a project, cause, group, personal brand, or community resource.",
    inquireSubject: "Informational website",
  },
  {
    title: "Web System",
    description:
      "A website with forms, dashboards, CRM-style organization, customer flows, or backend tools.",
    inquireSubject: "Web system",
  },
  {
    title: "Tap / Contact Hub",
    description:
      "A mobile-friendly page for tap cards, QR codes, link-in-bio, and quick contact actions.",
    inquireSubject: "Tap or contact hub",
  },
] as const;

export function sampleSiteMailtoHref(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
