import { SITE_URL, TOPHER_WEB_DESIGN_URL } from "@/lib/site";
import {
  publicGoogleMapsSearchHref,
  publicTopherEmail,
  publicTopherPhoneE164,
} from "@/lib/public-brand";

const orgId = `${SITE_URL}/#organization`;
const localBusinessId = `${SITE_URL}/#localbusiness`;
const websiteId = `${SITE_URL}/#website`;
const webPageId = `${SITE_URL}/#webpage`;
const webDesignDeptId = `${TOPHER_WEB_DESIGN_URL}/#business`;

/** Official profiles that already exist in the repo (tap card + vCard). */
const sameAs = [
  "https://www.instagram.com/mixedmakershop/",
  "https://www.facebook.com/christopher.cook.16/",
  "https://www.linkedin.com/in/chris-cook-8516a943/",
];

/**
 * Service-area business: no public street address on file, so we describe the
 * local presence with addressLocality/addressRegion + areaServed instead of a
 * streetAddress (correct pattern for a home-based / mobile business).
 */
const areaServed = [
  {
    "@type": "City",
    name: "Hot Springs",
    containedInPlace: { "@type": "State", name: "Arkansas" },
  },
  { "@type": "AdministrativeArea", name: "Garland County, Arkansas" },
  { "@type": "City", name: "Benton, Arkansas" },
  { "@type": "City", name: "Malvern, Arkansas" },
  { "@type": "City", name: "Lonsdale, Arkansas" },
  { "@type": "AdministrativeArea", name: "Central Arkansas" },
];

const serviceOfferings: { name: string; url?: string }[] = [
  { name: "Small business web design", url: `${SITE_URL}/web-design` },
  { name: "Local SEO", url: `${SITE_URL}/local-seo-services` },
  {
    name: "Google Business Profile help",
    url: `${SITE_URL}/google-business-profile-help`,
  },
  { name: "Website maintenance", url: `${SITE_URL}/website-maintenance` },
  { name: "AI business tools", url: `${SITE_URL}/ai-business-tools` },
  { name: "AI automation and workflow builds", url: `${SITE_URL}/lab` },
  { name: "Custom apps and games", url: `${SITE_URL}/lab` },
  { name: "Book, audiobook, and video production", url: `${SITE_URL}/lab` },
  { name: "Pop-out video ads", url: `${SITE_URL}/3d-scenes` },
  {
    name: "In-home computer repair and tutoring",
    url: `${SITE_URL}/in-home-computer-repair`,
  },
];

const hasOfferCatalog = {
  "@type": "OfferCatalog",
  name: "MixedMakerShop services",
  itemListElement: serviceOfferings.map((service) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: service.name,
      ...(service.url ? { url: service.url } : {}),
      provider: { "@id": localBusinessId },
    },
  })),
};

export function getMixedMakerStructuredDataGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "MixedMakerShop",
        url: SITE_URL,
        email: publicTopherEmail,
        telephone: publicTopherPhoneE164,
        description:
          "Topher Cook's one-man laboratory in Hot Springs, Arkansas — websites, AI tools, apps, books, video, and local tech help.",
        department: { "@id": webDesignDeptId },
        sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": localBusinessId,
        name: "MixedMakerShop",
        url: SITE_URL,
        telephone: publicTopherPhoneE164,
        email: publicTopherEmail,
        description:
          "Web design, local SEO, Google Business Profile help, AI tools, and in-home computer repair for small businesses in Hot Springs, Arkansas and Central Arkansas — a one-man shop, no agency layers.",
        priceRange: "$$",
        parentOrganization: { "@id": orgId },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Hot Springs",
          addressRegion: "AR",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 34.5037,
          longitude: -93.0552,
        },
        hasMap: publicGoogleMapsSearchHref,
        areaServed,
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
            opens: "09:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "10:00",
            closes: "14:00",
          },
        ],
        makesOffer: serviceOfferings.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.name,
            ...(service.url ? { url: service.url } : {}),
          },
        })),
        hasOfferCatalog,
        sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": webDesignDeptId,
        name: "MixedMakerShop Web Design",
        alternateName: "Topher's Web Design",
        url: TOPHER_WEB_DESIGN_URL,
        description:
          "Small business web design: clean sites, redesigns, landing pages, and local SEO foundations.",
        parentOrganization: { "@id": orgId },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: "MixedMakerShop",
        description:
          "MixedMakerShop is Topher Cook's one-man laboratory — websites, AI tools, apps and games, books and audiobooks, video, property care, and experiments, all built by one person.",
        publisher: { "@id": orgId },
        inLanguage: "en-US",
      },
    ],
  };
}

/**
 * Homepage-only WebPage node. Emitted on `/` (not in the site-wide graph, which
 * renders on every route) so the homepage cleanly links WebSite → WebPage →
 * LocalBusiness.
 */
export function getHomeWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": webPageId,
    url: SITE_URL,
    name: "MixedMakerShop — A One-Man Laboratory in Hot Springs, AR",
    description:
      "Web design, local SEO, AI tools, and tech help for small businesses in Hot Springs, Arkansas — built by one person in one lab.",
    isPartOf: { "@id": websiteId },
    about: { "@id": localBusinessId },
    inLanguage: "en-US",
  };
}

export type FaqItem = { question: string; answer: string };

/**
 * Reusable FAQPage builder. Only pass FAQs whose question + answer are visibly
 * rendered on the same page (Google requires visible parity).
 */
export function buildFaqSchema(faqs: FaqItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
