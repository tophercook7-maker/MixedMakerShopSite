import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { MonthlySeoPackSection } from "@/components/public/MonthlySeoPackSection";
import { PRICING_TIERS } from "@/lib/pricing-tiers";
import {
  mmsBtnPrimary,
  mmsBullet,
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
    "Simple pricing with no surprises — Starter SEO Site starting at $400, monthly support from $45/mo, Growth $1k–$2.5k, and custom quotes.",
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
      <div className="bg-[#070907]/80 backdrop-blur-[2px]">
        <div className={cn(shell, mmsSectionY)}>
          {/* Section 1 — Title */}
          <div className="max-w-3xl rounded-3xl border border-white/10 bg-[#111510]/90 p-6 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-8">
            <h1 className={cn(mmsH1, "text-white")}>Simple pricing. No surprises.</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/82 md:text-lg">
              Every business is different, but most projects fall into a simple range depending on what you need. You&apos;re
              investing in a site that can help you get found locally — not just a pretty page.
            </p>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-orange-100 md:text-base">
              Starter SEO Site begins at $400 for a basic 3-page SEO website. Custom builds stay custom quoted.
            </p>
          </div>

          {/* Section 2 — Tiers */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch lg:gap-6">
            {PRICING_TIERS.map((tier) => (
              <article
                key={tier.id}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border border-white/12 bg-[#111510]/90 p-6 text-white shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8",
                  tier.featured &&
                    cn(
                      "z-[1] border-2 border-orange-300/40 shadow-[0_24px_70px_-24px_rgba(251,146,60,0.35)]",
                      "ring-1 ring-orange-200/25 lg:scale-[1.02]",
                    ),
                )}
              >
                {tier.badge ? (
                  <span
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full",
                      "border border-orange-200/35 bg-orange-300 px-3 py-1",
                      "text-[10px] font-bold uppercase tracking-[0.16em] text-[#1d251f]",
                    )}
                  >
                    {tier.badge}
                  </span>
                ) : null}
                <div>
                  <h2 className={cn("text-xl font-bold tracking-tight text-white md:text-2xl", tier.badge && "mt-2")}>
                    {tier.title}
                  </h2>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-orange-200 md:text-[1.6rem]">
                    {tier.priceLabel}
                  </p>
                  <p className="mt-5 text-sm leading-relaxed text-white/82 md:text-[15px]">{tier.description}</p>
                </div>

                <div className="mt-6 flex flex-1 flex-col">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-100">Includes</p>
                  <ul className="mt-3 space-y-2.5 text-sm text-white/84 md:text-[15px]">
                    {tier.includes.map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <span className={mmsBullet} aria-hidden>
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    {tier.strongRecommendation ? (
                      <div className="rounded-2xl border border-orange-200/25 bg-orange-300/12 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-100">
                          Strongly recommended
                        </p>
                        <p className="mt-2 text-sm font-bold leading-relaxed text-white md:text-[15px]">
                          {tier.strongRecommendation.title} — {tier.strongRecommendation.price}
                        </p>
                      </div>
                    ) : null}
                    {tier.bestNextStep ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Best next step</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/84 md:text-[15px]">{tier.bestNextStep}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-8">
                  <PublicCtaRow>
                    <TrackedPublicLink
                      href={tier.ctaHref}
                      eventName="public_contact_cta_click"
                      eventProps={{ location: "pricing_page", target: "free_mockup", tier: tier.id }}
                      className={cn(
                        mmsBtnPrimary,
                        "inline-flex min-h-[3rem] w-full items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold no-underline hover:no-underline sm:w-auto",
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
          <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-white/10 bg-[#111510]/90 p-8 text-white shadow-2xl shadow-black/35 backdrop-blur-md sm:p-10">
            <h2 className={cn(mmsH2, "text-white")}>No pressure, no guessing</h2>
            <p className="mt-6 text-base leading-relaxed text-white/82 md:text-lg">
              You&apos;ll see a preview of your site before committing to anything. If it&apos;s not a fit, no problem.
            </p>
          </div>

          {/* Section 4 — Process */}
          <div className="mx-auto mt-16 max-w-3xl">
            <h2 className={cn(mmsH2, "text-white")}>How it works</h2>
            <ol className="mt-10 space-y-8">
              {processSteps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className={cn(mmsStepCircle, "mt-0.5 shrink-0")} aria-hidden>
                    {i + 1}
                  </span>
                  <p className="text-base leading-relaxed text-white/84 md:text-[17px]">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Section 5 — Final CTA */}
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-white/10 bg-[#111510]/90 p-8 text-center text-white shadow-2xl shadow-black/35 backdrop-blur-md sm:p-10">
            <h2 className={cn(mmsH2, "!text-2xl text-white md:!text-3xl")}>
              Want to see what your business could look like?
            </h2>
            <PublicCtaRow align="center" className="mt-8 w-full justify-center">
              <TrackedPublicLink
                href={publicFreeMockupFunnelHref}
                eventName="public_contact_cta_click"
                eventProps={{ location: "pricing_page", target: "free_mockup", section: "final_cta" }}
                className={cn(
                  mmsBtnPrimary,
                  "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                )}
              >
                Get My Free Preview
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </TrackedPublicLink>
            </PublicCtaRow>
          </div>
        </div>
      </div>
    </div>
  );
}
