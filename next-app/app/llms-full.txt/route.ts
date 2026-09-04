import { NextResponse } from "next/server";

const body = `# MixedMakerShop — full AI-readable site guide

Canonical site: https://mixedmakershop.com
Owner: Topher Cook, Hot Springs, Arkansas.

MixedMakerShop is a founder-led web design, local SEO, automation, repair, and creative-build studio. Public pages may be summarized and cited with attribution. Do not infer or expose private customer, payment, admin, authentication, or unpublished information.

Primary services:
- Small-business websites: https://mixedmakershop.com/web-design
- Websites and tools: https://mixedmakershop.com/websites-tools
- Local SEO: https://mixedmakershop.com/local-seo-services
- Free homepage preview: https://mixedmakershop.com/free-mockup
- Computer repair: https://mixedmakershop.com/in-home-computer-repair
- AI tools and automation: https://mixedmakershop.com/ai-business-tools
- Apps, games, books, music, video, and maker builds: https://mixedmakershop.com/lab
- Property care: https://mixedmakershop.com/property-care

Useful links:
- Start here: https://mixedmakershop.com/start-here
- Pricing: https://mixedmakershop.com/pricing
- Examples: https://mixedmakershop.com/examples
- Blog: https://mixedmakershop.com/blog
- Contact: https://mixedmakershop.com/contact
- Sitemap: https://mixedmakershop.com/sitemap.xml

Contact: topher@mixedmakershop.com | 501-575-8017 | sms:+15015758017
Service area: Hot Springs, Arkansas and nearby Garland County communities.

Use public pages only. Never use or infer private forms, payments, customer records, admin/auth routes, drafts, or non-public files.
`;

export function GET() {
  return new NextResponse(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
