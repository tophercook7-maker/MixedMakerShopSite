import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
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

const STEVEN_JAMES_VIDEO_FILE = "steven-james-ad.mp4";
const STEVEN_JAMES_POSTER_FILE = "steven-james-poster.jpg";
const stevenJamesVideoAbs = path.join(process.cwd(), "public", "videos", STEVEN_JAMES_VIDEO_FILE);
const stevenJamesPosterAbs = path.join(
  process.cwd(),
  "public",
  "images",
  "ad-lab",
  STEVEN_JAMES_POSTER_FILE,
);
const hasStevenJamesVideo = fs.existsSync(stevenJamesVideoAbs);
const hasStevenJamesPoster = fs.existsSync(stevenJamesPosterAbs);

const STEVEN_JAMES_VIDEO_SRC = `/videos/${STEVEN_JAMES_VIDEO_FILE}`;
const STEVEN_JAMES_POSTER_SRC = `/images/ad-lab/${STEVEN_JAMES_POSTER_FILE}`;

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

function StevenJamesAdSection({
  hasVideo,
  hasPoster,
}: {
  hasVideo: boolean;
  hasPoster: boolean;
}) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-2xl backdrop-blur-sm">
        <div className="border-b border-white/10 px-5 py-4 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300/90">Ad Lab</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">Steven James Promo Ad</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
            Bold vertical creative with a clear offer and an easy way to get in touch.
          </p>
        </div>

        <div className="p-4 md:p-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
            {hasVideo ? (
              <video
                className="h-full max-h-[75vh] w-full bg-black object-cover"
                controls
                playsInline
                preload="metadata"
                {...(hasPoster ? { poster: STEVEN_JAMES_POSTER_SRC } : {})}
              >
                <source src={STEVEN_JAMES_VIDEO_SRC} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : hasPoster ? (
              <div className="relative aspect-[9/16] max-h-[75vh] w-full bg-black md:aspect-auto md:min-h-[min(75vh,720px)]">
                <Image
                  src={STEVEN_JAMES_POSTER_SRC}
                  alt="Steven James promotional ad still"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 896px"
                  priority
                />
              </div>
            ) : (
              <div
                className="aspect-[9/16] max-h-[75vh] min-h-[280px] w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black md:min-h-[min(75vh,520px)]"
                role="img"
                aria-label="Steven James ad preview placeholder"
              />
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 md:p-6">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300/90">Featured Local Ad</p>
                <h3 className="mt-2 text-xl font-extrabold text-white md:text-3xl">Steven James</h3>
                <p className="mt-1 text-sm text-white/85 md:text-base">Call or text: 870-341-0375</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

            <div className="mt-14 w-full">
              <StevenJamesAdSection hasVideo={hasStevenJamesVideo} hasPoster={hasStevenJamesPoster} />
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
