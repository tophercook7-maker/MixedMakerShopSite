import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { FreeMockupFunnelClient } from "@/components/public/free-mockup-funnel-client";
import { FreeMockupSourceBannerFreshCut } from "@/components/public/free-mockup-source-banner";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupOnPageHash, publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/free-mockup";

export const metadata: Metadata = {
  title: "Free Website Preview | MixedMakerShop",
  description:
    "Get a free website preview before you commit — see a cleaner, more trustworthy layout built for calls, leads, and customers. No pressure.",
  alternates: { canonical },
  openGraph: {
    title: "Free website preview | MixedMakerShop",
    description:
      "A clear homepage direction for your business — low pressure, no obligation. Built and reviewed by Topher.",
    url: canonical,
  },
  robots: { index: true, follow: true },
};

const shell = publicShellClass;

const heroBadges = ["Free", "~2 minutes", "No commitment", "Built by Topher"] as const;

const whatYouGet = [
  {
    icon: Eye,
    title: "A real homepage direction",
    body: "Not a template gallery — a layout shaped around your business, services, and area.",
  },
  {
    icon: Sparkles,
    title: "Live preview as you type",
    body: "Watch the direction take shape while you fill in the form. Pick a style that fits.",
  },
  {
    icon: ShieldCheck,
    title: "Zero pressure follow-up",
    body: "Review it, share it, decide later. No contract, no payment, no hard sell.",
  },
] as const;

const howItWorksSteps = [
  {
    step: "01",
    title: "Share the basics",
    body: "Business name, what you do, your area, and what you want the site to help with. Honest answers beat polished copy.",
  },
  {
    step: "02",
    title: "See your direction",
    body: "The preview updates live. Pick a design direction and watch a fuller homepage sample load on the right.",
  },
  {
    step: "03",
    title: "Decide what's next",
    body: "I'll review your request and follow up with your preview link. Move forward only if it makes sense for you.",
  },
] as const;

const trustPoints = [
  {
    title: "Built by Topher",
    body: "Not a faceless ticket queue — one person who cares how your business comes across online.",
  },
  {
    title: "Made for real businesses",
    body: "Local services, trades, and small shops that live on trust, calls, and inbound leads.",
  },
  {
    title: "Clarity over flash",
    body: "Headlines, services, and contact paths that make the next step obvious for visitors.",
  },
  {
    title: "No obligation",
    body: "If I'm not the right fit, I'll say so. The preview is here to give you clarity, not lock you in.",
  },
] as const;

const goodToKnow = [
  "You don't need every detail mapped out — a business name or Facebook page is enough to start.",
  "The form takes about two minutes for the basics. Add context if you have it.",
  "You'll get one strong direction, not dozens of variations to sort through.",
  "Whether you move forward or not, you'll leave with a clearer picture of what's possible.",
] as const;

function normalizeQueryParam(raw: string | string[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const t = String(v || "").trim().toLowerCase();
  return t.length ? t : undefined;
}

export default async function FreeMockupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const fromSource = normalizeQueryParam(sp.source);
  const fromExample = normalizeQueryParam(sp.example);
  const funnelSource =
    fromSource === "freshcut" || fromExample === "freshcut" ? "freshcut" : fromSource || undefined;
  const isFreshCutFunnel = funnelSource === "freshcut";

  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        {/* Hero */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "py-10 md:py-14 lg:py-16")}>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-10">
              <div className="public-glass-box public-glass-box--pad max-w-3xl">
                <p className={mmsSectionEyebrowOnGlass}>Free website preview</p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.15rem] lg:leading-[1.06]">
                  See what a stronger homepage could look like — before you spend a dime
                </h1>
                <p className="mt-5 text-base leading-relaxed text-white/85 md:text-lg">
                  Tell me what you do and who you want to reach. I&apos;ll shape a practical preview around calls,
                  trust, and clear next steps — built for small businesses, not generic templates.
                </p>
                <ul className="free-mockup-hero-badges mt-6" aria-label="Preview highlights">
                  {heroBadges.map((badge) => (
                    <li key={badge}>{badge}</li>
                  ))}
                </ul>
                <TrackedPublicLink
                  href={publicFreeMockupOnPageHash}
                  eventName="public_free_mockup_funnel_cta"
                  eventProps={{ location: "free_mockup_hero", target: "scroll_to_form" }}
                  className={cn(mmsBtnPrimary, "mt-7 inline-flex px-8 no-underline hover:no-underline")}
                >
                  Start my free preview
                </TrackedPublicLink>
              </div>

              <div className="public-glass-box--soft public-glass-box--pad">
                <p className={mmsSectionEyebrowOnGlass}>What you&apos;ll get</p>
                <ul className="mt-5 space-y-4">
                  {whatYouGet.map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#f0c49a]"
                        aria-hidden
                      >
                        <item.icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className={cn("mt-1 text-sm leading-relaxed", mmsOnGlassSecondary)}>{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className={cn("mt-6 flex items-center gap-2 text-sm", mmsOnGlassSecondary)}>
                  <Clock className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  Most people finish the basics in about two minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {isFreshCutFunnel ? <FreeMockupSourceBannerFreshCut /> : null}
        <FreeMockupFunnelClient funnelSource={funnelSource} />

        {/* How it works */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "py-14 md:py-20")}>
            <div className="max-w-2xl">
              <p className={mmsSectionEyebrowOnGlass}>How it works</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Three steps from &ldquo;I should fix my site&rdquo; to a clear direction
              </h2>
            </div>
            <ol className="free-mockup-step-grid mt-10 md:mt-12">
              {howItWorksSteps.map((step) => (
                <li key={step.step} className="free-mockup-step-card public-glass-box--soft public-glass-box--pad">
                  <span className="free-mockup-step-card-num" aria-hidden>
                    {step.step}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                  <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trust grid */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "py-14 md:py-20")}>
            <div className="max-w-2xl">
              <p className={mmsSectionEyebrowOnGlass}>Why start here</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Clarity before commitment
              </h2>
              <p className={cn("mt-4 text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                A preview removes guesswork. You&apos;ll see whether a stronger website direction makes sense for your
                business right now — without paying upfront or getting locked into anything.
              </p>
            </div>
            <div className="free-mockup-trust-grid mt-10 md:mt-12">
              {trustPoints.map((point) => (
                <div key={point.title} className="free-mockup-trust-card public-glass-box--soft public-glass-box--pad">
                  <h3 className="text-base font-bold text-white md:text-lg">{point.title}</h3>
                  <p className={cn("mt-2 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Good to know */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "pb-6 md:pb-8")}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className="text-xl font-semibold text-white md:text-2xl">Good to know</h2>
              <ul className="free-mockup-faq-grid mt-6">
                {goodToKnow.map((line) => (
                  <li key={line} className="free-mockup-faq-item">
                    <span className="free-mockup-faq-dot" aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className={cn(mmsUmbrellaSectionBackdropImmersive, "border-b-0")}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Ready to see your business online — done right?
              </h2>
              <p className={cn("mt-4 text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                Start with the preview. You&apos;ll get a clearer idea of what your homepage could look like before
                deciding on anything else.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <TrackedPublicLink
                  href={publicFreeMockupOnPageHash}
                  eventName="public_free_mockup_funnel_cta"
                  eventProps={{ location: "free_mockup_footer", target: "scroll_to_form" }}
                  className={cn(mmsBtnPrimary, "inline-flex px-8 no-underline hover:no-underline")}
                >
                  Get my free preview
                </TrackedPublicLink>
                <Link
                  href="/examples"
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex px-8 no-underline hover:no-underline")}
                >
                  Browse real work
                </Link>
              </div>
              <p className={cn("mt-4 text-xs font-medium sm:text-sm", mmsOnGlassSecondary)}>
                Free · No obligation · Typically hear back within a day
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
