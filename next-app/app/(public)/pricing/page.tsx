import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { MonthlySeoPackSection } from "@/components/public/MonthlySeoPackSection";
import { PRICING_TIERS } from "@/lib/pricing-tiers";
import {
  mmsBodyFrost,
  mmsBtnPrimary,
  mmsBullet,
  mmsGlassPanelDense,
  mmsH1,
  mmsH2,
  mmsPageBg,
  mmsSectionBorder,
  mmsSectionY,
  mmsStepCircle,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/pricing";

export const metadata: Metadata = {
  title: "Web Design Pricing | MixedMakerShop",
  description:
    "Simple pricing with no surprises — Starter $500–$1k, Growth $1k–$2.5k, custom quotes. Start with a free homepage preview.",
  alternates: { canonical },
  openGraph: {
    title: "Web design pricing | MixedMakerShop",
    description: "Clear ranges, preview before you commit — no agency games.",
    url: canonical,
  },
};

const shell = publicShellClass;

const processSteps = [
  "You request a free preview",
  "I build a homepage-style mockup",
  "You decide if you want to move forward",
] as const;

export default function PricingPage() {
  return (
    <div className={cn(mmsPageBg, "border-b", mmsSectionBorder)}>
      <div className={cn(shell, mmsSectionY)}>
        {/* Section 1 — Title */}
        <div className={cn(mmsGlassPanelDense, "max-w-3xl p-6 sm:p-8")}>
          <h1 className={mmsH1}>Simple pricing. No surprises.</h1>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            Every business is different, but most projects fall into a simple range depending on what you need. You&apos;re
            investing in a site that can help you get found locally — not just a pretty page.
          </p>
        </div>

        {/* Section 2 — Tiers */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6 lg:items-stretch">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                mmsGlassPanelDense,
                "relative flex flex-col p-6 sm:p-8",
                tier.featured &&
                  cn(
                    "z-[1] border-2 border-[#b85c1e]/35 shadow-[0_24px_60px_-28px_rgba(184,92,30,0.35)]",
                    "ring-1 ring-[#b85c1e]/20 lg:scale-[1.02]",
                  ),
              )}
            >
              {tier.badge ? (
                <span
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full",
                    "border border-[#b85c1e]/30 bg-gradient-to-r from-[#fdf6ed] to-[#f4ebe3] px-3 py-1",
                    "text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a4b2a]",
                  )}
                >
                  {tier.badge}
                </span>
              ) : null}
              <h2 className={cn("text-xl font-bold tracking-tight text-[#1e241f] md:text-2xl", tier.badge && "mt-2")}>
                {tier.title}
              </h2>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-[#8a4b2a] md:text-[1.6rem]">{tier.priceLabel}</p>
              <p className={cn("mt-5 flex-1 text-sm leading-relaxed md:text-[15px]", mmsBodyFrost)}>{tier.description}</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#3f5a47]">Includes</p>
              <ul className={cn("mt-3 space-y-2.5 text-sm md:text-[15px]", mmsBodyFrost)}>
                {tier.includes.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className={mmsBullet} aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PublicCtaRow>
                  <TrackedPublicLink
                    href={tier.ctaHref}
                    eventName="public_contact_cta_click"
                    eventProps={{ location: "pricing_page", target: "free_mockup", tier: tier.id }}
                    className={cn(
                      mmsBtnPrimary,
                      "inline-flex min-h-[3rem] w-full items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold no-underline sm:w-auto hover:no-underline",
                    )}
                  >
                    {tier.ctaLabel}
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </TrackedPublicLink>
                </PublicCtaRow>
              </div>
            </article>
          ))}
        </div>

        <MonthlySeoPackSection analyticsLocation="pricing_monthly_seo_pack" variant="pricing" />

        {/* Section 3 — Reassurance */}
        <div className={cn(mmsGlassPanelDense, "mx-auto mt-16 max-w-3xl p-8 sm:p-10")}>
          <h2 className={mmsH2}>No pressure, no guessing</h2>
          <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            You&apos;ll see a preview of your site before committing to anything. If it&apos;s not a fit, no problem.
          </p>
        </div>

        {/* Section 4 — Process */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className={mmsH2}>How it works</h2>
          <ol className="mt-10 space-y-8">
            {processSteps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className={cn(mmsStepCircle, "mt-0.5 shrink-0")} aria-hidden>
                  {i + 1}
                </span>
                <p className={cn("text-base leading-relaxed md:text-[17px]", mmsBodyFrost)}>{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Section 5 — Final CTA */}
        <div
          className={cn(
            mmsGlassPanelDense,
            "mx-auto mt-16 max-w-2xl border-[#3f5a47]/14 bg-gradient-to-br from-[#f7f4ee] via-white to-[#eef3ee]/90 p-8 text-center sm:p-10",
          )}
        >
          <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Want to see what your business could look like?</h2>
          <PublicCtaRow align="center" className="mt-8 w-full justify-center">
            <TrackedPublicLink
              href={publicFreeMockupFunnelHref}
              eventName="public_contact_cta_click"
              eventProps={{ location: "pricing_page", target: "free_mockup", section: "final_cta" }}
              className={cn(
                mmsBtnPrimary,
                "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 text-base font-semibold no-underline sm:w-auto hover:no-underline",
              )}
            >
              Get My Free Preview
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedPublicLink>
          </PublicCtaRow>
        </div>
      </div>
    </div>
  );
}
