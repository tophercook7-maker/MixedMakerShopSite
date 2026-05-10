import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/websites-tools";

export const metadata: Metadata = {
  title: "Websites & Tools | MixedMakerShop",
  description:
    "Topher's Web Design builds clean small-business websites — and MixedMakerShop hosts tools, previews, and digital helpers under one umbrella studio.",
  keywords: [
    "MixedMakerShop websites and tools",
    "Topher's Web Design",
    "small business website",
    "website preview",
    "local business tools",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Websites & Tools | MixedMakerShop",
    description:
      "Web design through Topher's Web Design, plus MixedMakerShop tools, previews, landing pages, and simple business systems.",
    url: canonical,
  },
};

const shell = publicShellClass;

const sections = [
  {
    title: "Web Design",
    body: "Clear local business websites that explain what you do, build trust, and help visitors become calls or leads.",
    href: "/web-design",
  },
  {
    title: "Free Website Preview",
    body: "A homepage-style preview before you commit, built around your business and offer.",
    href: publicFreeMockupFunnelHref,
  },
  {
    title: "Small Business Websites",
    body: "Service pages, simple sites, credibility pages, and local SEO structure for real owners.",
    href: "/small-business-websites-hot-springs",
  },
  {
    title: "Landing Pages",
    body: "Focused pages for one offer, one campaign, or one clear next step.",
    href: "/free-mockup",
  },
  {
    title: "Templates & Kits",
    body: "Practical starter pages, content kits, and digital downloads as they are released.",
    href: "#templates-kits",
  },
  {
    title: "Digital Tools",
    body: "Forms, simple dashboards, intake flows, quoting helpers, and business systems.",
    href: "/tools",
  },
  {
    title: "Ad/Promo Help",
    body: "Promo concepts, ad mockups, and simple campaign ideas that pair with a useful landing page.",
    href: "/ad-lab",
  },
] as const;

export default function WebsitesToolsPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Websites &amp; Tools</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
                Websites, landing pages, and simple digital tools for local businesses.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Topher builds practical online systems that help small businesses look better, explain what they do, and
                get more calls, bookings, and leads.
              </p>
              <PublicCtaRow className="mt-9">
                <a
                  href={TOPHER_WEB_DESIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex w-full items-center justify-center gap-2 px-8 no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Get a free website demo
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
                <Link href={publicFreeMockupFunnelHref} className={cn(mmsBtnSecondaryOnGlass, "w-full px-8 no-underline hover:no-underline sm:w-auto")}>
                  Free preview on MixedMakerShop
                </Link>
              </PublicCtaRow>
              <p className={cn("mt-6 max-w-2xl text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                Need a website for your business?{" "}
                <a href={TOPHER_WEB_DESIGN_URL} target="_blank" rel="noopener noreferrer" className={mmsTextLinkOnGlass}>
                  Topher&apos;s Web Design small business website services
                </a>{" "}
                live at topherswebdesign.com — clean, mobile-friendly websites, redesigns, landing pages, and local SEO
                foundations for small businesses.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group public-glass-box--soft public-glass-box--pad flex min-h-[13rem] flex-col no-underline transition hover:-translate-y-1 hover:bg-white/12 hover:no-underline"
                >
                  <h2 className="text-xl font-bold tracking-tight text-white">{item.title}</h2>
                  <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                    {item.body}
                  </p>
                  <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                    Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="templates-kits" className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Tools &amp; Kits</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Digital products and simple business helpers will live here.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Website kits, business templates, digital downloads, and simple tools will be organized here as they are
                tested and released.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
