import { SITE_URL, TOPHER_WEB_DESIGN_URL } from "@/lib/site";

const orgId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;
const webDesignDeptId = `${TOPHER_WEB_DESIGN_URL}/#business`;

export function getMixedMakerStructuredDataGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "MixedMakerShop",
        url: SITE_URL,
        description:
          "Practical creative studio by Topher & GiGi for useful things built online, outside, and in the workshop.",
        department: { "@id": webDesignDeptId },
      },
      {
        "@type": "ProfessionalService",
        "@id": webDesignDeptId,
        name: "Topher's Web Design",
        url: TOPHER_WEB_DESIGN_URL,
        description:
          "Dedicated small business web design: clean sites, redesigns, landing pages, and local SEO foundations.",
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
