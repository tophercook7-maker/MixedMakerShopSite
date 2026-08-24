/** @type {import('next').NextConfig} */

/**
 * Legacy static `.html` URLs -> canonical Next routes. The old static site (root *.html)
 * has been retired; these 301s preserve any indexed/bookmarked old URLs and consolidate
 * SEO onto the single Next.js source of truth. [source, destination]
 */
const HTML_REDIRECTS = [
  ["/index.html", "/"],
  ["/3d-printing.html", "/lab"],
  ["/about.html", "/about"],
  ["/agreement.html", "/terms"],
  ["/ai-business-tools.html", "/ai-business-tools"],
  ["/builds.html", "/builds"],
  ["/church-website-design.html", "/church-websites-hot-springs"],
  ["/church-websites-hot-springs.html", "/church-websites-hot-springs"],
  ["/coffee-shop-websites-hot-springs.html", "/coffee-shop-websites-hot-springs"],
  ["/contact.html", "/contact"],
  ["/custom-3d-printing.html", "/lab"],
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
  ["/small-business-website-design.html", "/small-business-website-design"],
  ["/small-business-websites-hot-springs.html", "/small-business-websites-hot-springs"],
  ["/social-media-takeover.html", "/social-media-takeover"],
  ["/tools.html", "/tools"],
  ["/web-design.html", "/web-design"],
  ["/web-design-hot-springs-ar.html", "/web-design-hot-springs-ar"],
  ["/website-check.html", "/website-check"],
  ["/website-maintenance.html", "/website-maintenance"],
  ["/work-with-topher.html", "/about"],
  // Retired legacy subdirectory pages (old static duplicates) -> canonical Next routes.
  // Bare + wildcard so the directory itself, its trailing-slash form, and any old
  // sub-paths (e.g. /church-websites/index.html) all 301 to the canonical route.
  ["/church-websites", "/church-websites-hot-springs"],
  ["/church-websites/:path*", "/church-websites-hot-springs"],
  ["/restaurant-websites", "/restaurant-websites-hot-springs"],
  ["/restaurant-websites/:path*", "/restaurant-websites-hot-springs"],
  ["/small-business-websites", "/small-business-websites-hot-springs"],
  ["/small-business-websites/:path*", "/small-business-websites-hot-springs"],
  ["/website-samples/index.html", "/website-samples"],
  ["/website-roast/index.html", "/website-roast"],
  ["/tools/index.html", "/tools"],
  // Legacy post-submission "thank you" funnel pages -> closest live page.
  ["/thank-you.html", "/"],
  ["/thank-you-mockup.html", "/free-mockup"],
  ["/thank-you-project.html", "/contact"],
  ["/thank-you-roast.html", "/website-roast"],
  ["/thank-you-website-score.html", "/free-website-check"],
];

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint is configured (.eslintrc.json) and runnable via `npm run lint`, but the
    // pre-existing codebase has a lint backlog (and untracked iCloud "* 2.*" duplicate
    // files locally), so it does not gate production builds. Clean the backlog before
    // flipping this off.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // statusCode: 301 (not `permanent: true`, which emits 308) so legacy URLs return a
      // classic 301 Moved Permanently.
      ...HTML_REDIRECTS.map(([source, destination]) => ({ source, destination, statusCode: 301 })),
      {
        // Consolidated the near-duplicate "website designer" stub into the canonical
        // Hot Springs web design page. Keep a 301 for any existing inbound links.
        source: "/website-designer-hot-springs-ar",
        destination: "/web-design-hot-springs-ar",
        statusCode: 301,
      },
      // Autonomous Desktop Agent — not public yet; unpublish marketing + legal pages.
      { source: "/autonomous-desktop-agent", destination: "/", statusCode: 302 },
      { source: "/autonomous-desktop-agent/eula", destination: "/", statusCode: 302 },
      { source: "/autonomous-desktop-agent/privacy", destination: "/", statusCode: 302 },
      { source: "/downloads/autonomous-desktop-agent-appcast.json", destination: "/", statusCode: 302 },
      { source: "/api/agent/checkout", destination: "/", statusCode: 302 },
      { source: "/api/agent/unlock", destination: "/", statusCode: 302 },
      // Retired 3D printing / GiGi's Print Shop lane (2026-08). Everything that used to
      // live under those URLs now points at the Lab so indexed links keep their equity
      // instead of 404-ing.
      { source: "/3d-printing", destination: "/lab", statusCode: 301 },
      { source: "/3d-printing/:path*", destination: "/lab", statusCode: 301 },
      { source: "/custom-3d-printing", destination: "/lab", statusCode: 301 },
      { source: "/upload-print", destination: "/lab", statusCode: 301 },
      { source: "/blog/3d-printed-keychains-bulk-marketing", destination: "/lab", statusCode: 301 },
      { source: "/blog/3d-printed-keychains-ultimate-handout", destination: "/lab", statusCode: 301 },
      { source: "/blog/3d-printed-replacement-parts", destination: "/lab", statusCode: 301 },
      { source: "/blog/business-card-3d-printed-keychain", destination: "/lab", statusCode: 301 },
      { source: "/blog/custom-3d-printed-bookmarks", destination: "/lab", statusCode: 301 },
      { source: "/blog/custom-3d-printing-branding", destination: "/lab", statusCode: 301 },
      { source: "/blog/stop-dog-earing-3d-printed-bookmarks", destination: "/lab", statusCode: 301 },
      // Retired affiliate lane (2026-08). The /gear affiliate storefront and the
      // affiliate-shell "recommended tools" page are gone — nothing on the site earns
      // a commission anymore. Point their URLs at real work instead of 404s.
      { source: "/gear", destination: "/lab", statusCode: 301 },
      { source: "/gear/:path*", destination: "/lab", statusCode: 301 },
      { source: "/tophers-recommended-tools", destination: "/websites-tools", statusCode: 301 },
      // The Hollow Gate browser game + $1.99 unlock was retired 2026-08-18. The app
      // itself is still shipped on the Mac App Store and still listed on /lab and
      // /portfolio — only the on-site game and paywall are gone.
      { source: "/hollow-gate", destination: "/lab", statusCode: 301 },
      { source: "/hollow-gate/:path*", destination: "/lab", statusCode: 301 },
      { source: "/blog/hollow-gate", destination: "/lab", statusCode: 301 },
      // Clean /portfolio → the static portfolio index (a rewrite loops with the static
      // directory's trailing-slash handling, so use a redirect instead).
      { source: "/portfolio", destination: "/portfolio/index.html", statusCode: 301 },
    ];
  },
  async rewrites() {
    return [
      // "I'm the glue" door page. Deliberately a hand-written standalone HTML file in
      // public/glue/ rather than an app route: it must NOT inherit the site chrome
      // (nav, footer, umbrella styling). Rewrite (200, not redirect) so the clean
      // /glue URL serves it directly.
      { source: "/glue", destination: "/glue/index.html" },
      // "The work" proof page — same deal: standalone HTML in public/proof/, no chrome.
      { source: "/proof", destination: "/proof/index.html" },
    ];
  },
  async headers() {
    // Security headers for app-rendered (dynamic/SSR) routes. The netlify.toml
    // header rules only reach static files, so dynamic pages (home,
    // /autonomous-desktop-agent, etc.) were getting no clickjacking protection.
    const securityHeaders = [
      // Clickjacking (legacy header; the enforced CSP below also sets frame-ancestors 'none').
      { key: "X-Frame-Options", value: "DENY" },
      // Don't let browsers MIME-sniff responses.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Limit referrer leakage.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Drop powerful features we never use.
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      // Force HTTPS for 2 years (Netlify is HTTPS-only). Remove includeSubDomains
      // if any subdomain ever needs plain HTTP.
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      // ENFORCED Content-Security-Policy. Verified clean across 17 public pages in
      // Report-Only mode (zero violations); no reCAPTCHA or third-party iframes in use.
      // Allowlists: Google Tag Manager/Analytics, Stripe, Supabase, Vercel Analytics.
      // Next hardening step: replace 'unsafe-inline' with per-request nonces.
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com",
          "connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.google.com https://*.supabase.co https://api.stripe.com",
          "frame-src https://js.stripe.com https://checkout.stripe.com",
          "form-action 'self' https://checkout.stripe.com",
        ].join("; "),
      },
    ];
    return [{ source: "/(.*)", headers: securityHeaders }];
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
