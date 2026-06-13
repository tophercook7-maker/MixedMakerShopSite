/** @type {import('next').NextConfig} */

/**
 * Legacy static `.html` URLs -> canonical Next routes. The old static site (root *.html)
 * has been retired; these 301s preserve any indexed/bookmarked old URLs and consolidate
 * SEO onto the single Next.js source of truth. [source, destination]
 */
const HTML_REDIRECTS = [
  ["/index.html", "/"],
  ["/3d-printing.html", "/3d-printing"],
  ["/about.html", "/about"],
  ["/agreement.html", "/terms"],
  ["/ai-business-tools.html", "/ai-business-tools"],
  ["/builds.html", "/builds"],
  ["/church-website-design.html", "/church-websites-hot-springs"],
  ["/church-websites-hot-springs.html", "/church-websites-hot-springs"],
  ["/coffee-shop-websites-hot-springs.html", "/coffee-shop-websites-hot-springs"],
  ["/contact.html", "/contact"],
  ["/custom-3d-printing.html", "/custom-3d-printing"],
  ["/examples.html", "/examples"],
  ["/google-business-profile-help.html", "/google-business-profile-help"],
  ["/hot-springs-web-design.html", "/web-design-hot-springs-ar"],
  ["/how-much-does-a-website-cost.html", "/how-much-does-a-website-cost"],
  ["/in-home-computer-repair.html", "/in-home-computer-repair"],
  ["/local-seo-services.html", "/local-seo-services"],
  ["/price-sheet.html", "/price-sheet"],
  ["/pricing.html", "/pricing"],
  ["/restaurant-website-redesign.html", "/restaurant-website-redesign"],
  ["/restaurant-websites-hot-springs.html", "/restaurant-websites-hot-springs"],
  // No dedicated broad small-business route yet; the general web-design service is the closest canonical page.
  ["/small-business-website-design.html", "/web-design"],
  ["/small-business-websites-hot-springs.html", "/small-business-websites-hot-springs"],
  ["/social-media-takeover.html", "/social-media-takeover"],
  ["/tools.html", "/tools"],
  ["/web-design.html", "/web-design"],
  ["/web-design-hot-springs-ar.html", "/web-design-hot-springs-ar"],
  ["/website-check.html", "/website-check"],
  // No dedicated maintenance route yet; the $89/mo hosting & support line lives on /pricing.
  ["/website-maintenance.html", "/pricing"],
  ["/work-with-topher.html", "/about"],
  // Legacy post-submission "thank you" funnel pages -> closest live page.
  ["/thank-you.html", "/"],
  ["/thank-you-mockup.html", "/free-mockup"],
  ["/thank-you-project.html", "/contact"],
  ["/thank-you-roast.html", "/website-roast"],
  ["/thank-you-website-score.html", "/free-website-check"],
];

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      ...HTML_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true })),
      {
        // Consolidated the near-duplicate "website designer" stub into the canonical
        // Hot Springs web design page. Keep a 301 for any existing inbound links.
        source: "/website-designer-hot-springs-ar",
        destination: "/web-design-hot-springs-ar",
        permanent: true,
      },
    ];
  },
  experimental: {
    /** Allow importing the Astro niche-pack source (locations, niches, services) from `fresh-cut-property-care`. */
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.marblism.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
