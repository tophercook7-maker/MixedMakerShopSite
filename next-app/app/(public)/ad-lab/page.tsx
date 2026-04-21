import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsBulletOnGlass,
  mmsH2OnGlass,
  mmsH3OnGlassLg,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsOnGlassMuted,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

type FeaturedAd = {
  id: string;
  title: string;
  src: string;
  width: number;
  height: number;
  purpose: string;
  bestFor: string;
};

const featuredAds: readonly FeaturedAd[] = [
  {
    id: "fresh-cut-before-after",
    title: "Fresh Cut before / after ad",
    src: "/images/ads/freshcut-before-after.jpg",
    width: 682,
    height: 1024,
    purpose:
      "Built to grab attention fast with a rough-vs-clean visual and a direct promise people understand immediately.",
    bestFor: "Facebook ads, local service promos, fast lead generation",
  },
  {
    id: "fresh-cut-services",
    title: "Fresh Cut services ad",
    src: "/images/ads/freshcut-services.jpg",
    width: 1024,
    height: 682,
    purpose:
      "Built to quickly show services, free estimates, and a clear way to contact without making people guess.",
    bestFor: "Local service pages, seasonal promos, mobile-first campaigns",
  },
  {
    id: "website-customer-getting",
    title: "Website customer-getting ad",
    src: "/images/ads/website-customers.jpg",
    width: 682,
    height: 1024,
    purpose:
      "Built to sell the outcome in plain English: more customers, more calls, and a site that actually works.",
    bestFor: "Website offers, package explainers, local awareness",
  },
  {
    id: "website-before-after",
    title: "Website before / after ad",
    src: "/images/ads/website-before-after.jpg",
    width: 682,
    height: 1024,
    purpose:
      "Built to show the difference between being invisible online and having a site that helps people find and call you.",
    bestFor: "Redesign pitches, credibility, comparison-style social ads",
  },
  {
    id: "scrap-metal",
    title: "Scrap metal pickup ad",
    src: "/images/ads/scrap-metal.jpg",
    width: 682,
    height: 1024,
    purpose:
      "Built with a tougher, high-energy style to match the service and stop the scroll fast.",
    bestFor: "Industrial or haul-away services, bold feed placements",
  },
] as const;

const whyItMatters = [
  "Better ads usually start with a clearer offer and a clearer next step.",
  "Visual choices and headline framing shape trust before someone clicks.",
  "A strong concept makes it easier for people to understand why they should act now.",
] as const;

function AdShowcaseCard({ ad }: { ad: FeaturedAd }) {
  return (
    <article className="public-glass-box--soft public-glass-box--pad flex flex-col gap-4">
      <h3 className="text-lg font-semibold tracking-tight text-white">{ad.title}</h3>
      <div className="overflow-hidden rounded-xl bg-black/35 ring-1 ring-white/[0.08]">
        <Image
          src={ad.src}
          alt={ad.title}
          width={ad.width}
          height={ad.height}
          className="h-auto w-full object-cover object-top"
          sizes="(min-width: 768px) 45vw, 100vw"
        />
      </div>
      <p className={cn("text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{ad.purpose}</p>
      <p className={cn("text-[13px] leading-snug", mmsOnGlassMuted)}>
        <span className="font-semibold text-white/75">Best for: </span>
        {ad.bestFor}
      </p>
    </article>
  );
}

export const metadata: Metadata = {
  title: "Ad Lab | MixedMakerShop",
  description:
    "Real ad examples and campaign concepts for local businesses—clear offers, strong visuals, and obvious next steps.",
};

export default function AdLabPage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Ad Lab</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Ad concepts built to help businesses get noticed.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Promo angles, ad directions, and campaign concepts—aligned with real offers and pages, not hype.
              </p>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                The ad earns attention; your site turns it into the next step.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>What this page is</h2>
              <ul className={cn("mt-5 space-y-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                {[
                  "Sample ad directions",
                  "Promo concepts and hooks",
                  "Offer framing for clarity and action",
                  "Creative ideas for real businesses",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className={mmsBulletOnGlass} aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className={cn("mt-6 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                Ads earn attention; a strong site turns it into action; tools keep the business running after that. See{" "}
                <Link href="/examples" className={mmsTextLinkOnGlass}>
                  website examples
                </Link>{" "}
                for built pages and{" "}
                <Link href="/tools" className={mmsTextLinkOnGlass}>
                  Apps &amp; Tools
                </Link>{" "}
                for operational helpers.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-4xl">
              <h2 className={mmsH2OnGlass}>Real ad examples</h2>
              <p className={cn("mt-4 text-base leading-relaxed md:text-[17px]", mmsOnGlassPrimary)}>
                A few ad concepts built to grab attention, explain the offer fast, and make the next step obvious.
              </p>
              <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                These are real ad examples built for different offers, services, and business angles.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-2 md:gap-10">
              {featuredAds.map((ad) => (
                <AdShowcaseCard key={ad.id} ad={ad} />
              ))}
            </div>

            <div className="mx-auto mt-14 max-w-4xl">
              <div className="public-glass-box--soft public-glass-box--pad">
                <h3 className={cn(mmsH3OnGlassLg, "!text-xl md:!text-2xl")}>Bamboo ad concept</h3>
                <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                  Two frames from the same vertical ad concept built for a bamboo supply business.
                </p>
                <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
                  <figure className="m-0">
                    <div className="overflow-hidden rounded-xl bg-black/50 ring-1 ring-white/10">
                      <Image
                        src="/images/ad-lab/bamboo-ad-steven-james-supply.png"
                        alt="Bamboo ad frame: warehouse stacks with Steven James bulk supply headline"
                        width={323}
                        height={576}
                        className="h-auto w-full object-contain object-top"
                        sizes="(min-width: 768px) 45vw, 100vw"
                      />
                    </div>
                    <figcaption className={cn("mt-3 text-xs leading-snug md:text-[13px]", mmsOnGlassMuted)}>
                      Version A — supply / trust angle
                    </figcaption>
                  </figure>
                  <figure className="m-0">
                    <div className="overflow-hidden rounded-xl bg-black/50 ring-1 ring-white/10">
                      <Image
                        src="/images/ad-lab/bamboo-ad-strong-straight.png"
                        alt="Bamboo ad frame: close-up stalk with Strong and Straight headline"
                        width={323}
                        height={576}
                        className="h-auto w-full object-contain object-top"
                        sizes="(min-width: 768px) 45vw, 100vw"
                      />
                    </div>
                    <figcaption className={cn("mt-3 text-xs leading-snug md:text-[13px]", mmsOnGlassMuted)}>
                      Version B — product / strength angle
                    </figcaption>
                  </figure>
                </div>
                <p className={cn("mt-6 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                  Full-motion export with sound can replace these stills when the real video file is ready—drop it in as{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-[13px] text-white/85">/videos/bamboo-ad.mp4</code>{" "}
                  and wire the player in this section.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>Why this matters</h2>
              <ul className={cn("mt-5 space-y-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                {whyItMatters.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className={mmsBulletOnGlass} aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={cn(mmsUmbrellaSectionBackdropImmersive, "border-b-0")}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>Want something like this for your business?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                I can help with ad concepts, website direction, landing pages, and simple offers that make the next step
                clearer.
              </p>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                No pitch deck—just a clear next step.
              </p>
              <PublicCtaRow className="mt-7">
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "ad_lab_page", target: "contact" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex min-h-[3rem] items-center justify-center gap-2 px-8 no-underline hover:no-underline",
                  )}
                >
                  Contact
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "ad_lab_page", target: "free_mockup" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3rem] items-center justify-center px-8 no-underline hover:no-underline",
                  )}
                >
                  Free preview
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
