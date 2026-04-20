import type { Metadata } from "next";
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
  mmsUmbrellaSectionBackdrop,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const adTypes = [
  {
    title: "Local service ad concepts",
    body: "Simple hooks and visuals for call-driven businesses like lawn care, cleaning, trades, and local home services.",
  },
  {
    title: "Website redesign ads",
    body: "Before-and-after style concept directions that highlight trust, clarity, and stronger first impressions.",
  },
  {
    title: "Free preview / mockup ads",
    body: "Offer-led concepts that invite prospects to start low-risk and see a direction before committing.",
  },
  {
    title: "Tool and app promo concepts",
    body: "Messaging angles for practical internal tools, lightweight systems, or customer-facing helpers.",
  },
  {
    title: "Seasonal or offer-based ads",
    body: "Campaign directions built around timing, urgency windows, or focused promotions without hype.",
  },
] as const;

const whyItMatters = [
  "Better ads usually start with a clearer offer and a clearer next step.",
  "Visual choices and headline framing shape trust before someone clicks.",
  "A strong concept makes it easier for people to understand why they should act now.",
] as const;

export const metadata: Metadata = {
  title: "Ad Lab | MixedMakerShop",
  description:
    "Ad concepts, promo ideas, and practical marketing directions for real businesses. Built to support trust, clarity, and lead generation.",
};

export default function AdLabPage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Ad Lab</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Ad concepts built to help businesses get noticed.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                This is where promo ideas, ad directions, and campaign concepts live. It supports websites, offers, local
                business campaigns, and practical growth ideas without overhype.
              </p>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                The ad gets attention. The page turns that attention into action.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdrop}>
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

        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>Example ad types</h2>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                Concept categories—framed as practical directions, not fake finished campaigns.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {adTypes.map((item) => (
                <div key={item.title} className="public-glass-box--soft public-glass-box--pad">
                  <h3 className="text-lg font-semibold tracking-tight text-white">{item.title}</h3>
                  <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{item.body}</p>
                </div>
              ))}
            </div>

            <div className="public-glass-box--soft public-glass-box--pad mt-10 max-w-3xl">
              <h3 className={mmsH3OnGlassLg}>Ad example</h3>
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-black/40">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/images/ad-lab/bamboo-ad-poster.png"
                  className="h-full w-full object-cover"
                >
                  <source src="/videos/bamboo-ad.mp4" type="video/mp4" />
                </video>
              </div>
              <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                Product-focused ad for bamboo poles — clear visuals and simple message.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdrop}>
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

        <section className={cn(mmsUmbrellaSectionBackdrop, "border-b-0")}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>Want a concept for your business?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                If you want help shaping an ad concept, offer direction, landing page, or full website path, tell me what
                you&apos;re trying to promote and where prospects get stuck.
              </p>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                Want something like this for your business?
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
                  Tell me what you want to promote
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
                  Start with a free preview
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
