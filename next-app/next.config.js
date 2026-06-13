/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/contact.html",
        destination: "/contact",
      },
    ];
  },
  async redirects() {
    return [
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
