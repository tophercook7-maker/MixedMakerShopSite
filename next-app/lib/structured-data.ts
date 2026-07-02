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
  { name: "3D printing", url: `${SITE_URL}/3d-printing` },
  { name: "Functional prints", url: `${SITE_URL}/3d-printing` },
  { name: "Replacement parts", url: `${SITE_URL}/3d-printing` },
  { name: "Prototypes", url: `${SITE_URL}/3d-printing` },
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
          "Practical creative studio by Topher & GiGi for useful things built online, outside, and in the workshop.",
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
          "Web design, local SEO, and Google Business Profile help, plus custom 3D printing and in-home computer repair for small businesses in Hot Springs, Arkansas and Central Arkansas.",
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
        name: "Topher's Web Design",
        url: TOPHER_WEB_DESIGN_URL,
        description:
          "Dedicated small business web design: clean sites, redesigns, landing pages, and local SEO foundations.",
        parentOrganization: { "@id": orgId },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: "MixedMakerShop",
        description:
          "MixedMakerShop is Topher & GiGi's practical creative studio for useful things built online, outside, and in the workshop — including websites, tools, 3D printing, property care, and creative projects.",
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
    name: "MixedMakerShop — Web Design, Local SEO & 3D Printing in Hot Springs, AR",
    description:
      "Practical web design, local SEO, 3D printing, and tech help for small businesses in Hot Springs, Arkansas.",
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
