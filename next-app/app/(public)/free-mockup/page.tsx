import type { Metadata } from "next";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { FreeMockupFunnelClient } from "@/components/public/free-mockup-funnel-client";
import { FreeMockupSourceBannerFreshCut } from "@/components/public/free-mockup-source-banner";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupOnPageHash, publicShellClass } from "@/lib/public-brand";
import {
  mmsBulletOnGlass,
  mmsOnGlassSecondary,
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

const trustBullets = [
  "Built directly by Topher—not a faceless ticket queue.",
  "Designed for real small businesses that live on trust and inbound leads.",
  "Focused on clarity, credibility, and making the next step obvious (call, form, booking).",
  "No obligation to buy a full website after you see the preview.",
  "Straight talk: if I’m not the right fit, I’ll say so.",
] as const;

const previewSteps = [
  "Tell me about your business.",
  "Tell me what you want the website to help with.",
  "Send the request and I’ll review it.",
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
  /** Fresh Cut funnel: `?source=freshcut` (legacy) or `?example=freshcut` (example card). */
  const funnelSource =
    fromSource === "freshcut" || fromExample === "freshcut" ? "freshcut" : fromSource || undefined;
  const isFreshCutFunnel = funnelSource === "freshcut";

  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        {/* Hero — high-confidence offer, readable above the fold */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "grid gap-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-end md:py-12 lg:py-14")}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Free website preview</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Get a Free Website Preview
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/85 md:text-lg">
                Tell me what you do, what is not working, and what kind of customers you want more of. I’ll use that to
                create a practical preview for your business website.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/75">Takes a few minutes. No pressure. No commitment.</p>
              <TrackedPublicLink
                href={publicFreeMockupOnPageHash}
                eventName="public_free_mockup_funnel_cta"
                eventProps={{ location: "free_mockup_hero", target: "scroll_to_form" }}
                className={cn("btn gold", "mt-4 inline-flex justify-center no-underline hover:no-underline")}
              >
                Start my free preview
              </TrackedPublicLink>
            </div>
            <div className="public-glass-box--soft public-glass-box--pad">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">How to start</p>
              <ul className="mt-5 space-y-3 text-base leading-relaxed text-white/85">
                {previewSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-orange-300/35 bg-orange-300/14 text-sm font-bold text-orange-100">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-white/70">
                The form starts right below. Honest basics are enough; you do not need polished copy.
              </p>
            </div>
          </div>
        </section>

        {isFreshCutFunnel ? <FreeMockupSourceBannerFreshCut /> : null}
        <FreeMockupFunnelClient funnelSource={funnelSource} />

        {/* How it works — after form so the top stays hero → intro → form */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "py-14 md:py-20")}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">How it works</h2>
              <p className="mt-4 text-base leading-relaxed text-white/80 md:text-[17px]">
                1. Tell me about your business.
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/80 md:text-[17px]">
                2. I build a preview direction for you.
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/80 md:text-[17px]">
                3. You decide if you want to move forward.
              </p>
            </div>
          </div>
        </section>

        {/* Why preview + trust */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "flex flex-col gap-6 py-14 md:py-20")}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">Why start with the preview?</h2>
              <p className="mt-4 text-base leading-relaxed text-white/80 md:text-[17px]">
                It gives you clarity before you spend money, removes guesswork, and lets you see whether a stronger
                website direction makes sense for your business right now.
              </p>
            </div>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">What you can expect</h2>
              <ul className={cn("mt-4 space-y-3 text-sm md:text-[15px]", mmsOnGlassSecondary)}>
                {trustBullets.map((line) => (
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

        {/* Reassurance right before final decision CTA */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "pb-6 md:pb-8")}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className="text-white text-xl font-semibold">Good to know</h2>
              <ul className="mt-4 space-y-2.5 text-white/80 text-base leading-relaxed md:text-[17px]">
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>You can start without having every detail mapped out.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>A business name or Facebook page is plenty to kick things off.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>This is here to give you clarity, not lock you into a purchase.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>If it helps, great. If it does not, you still leave with a clearer direction.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className={cn(mmsUmbrellaSectionBackdropImmersive, "border-b-0")}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Not sure if you&apos;re ready for a full website yet?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80 md:text-[17px]">
                Start with the preview. You&apos;ll get a clearer idea of what your business could look like online before
                deciding on anything else.
              </p>
              <TrackedPublicLink
                href={publicFreeMockupOnPageHash}
                eventName="public_free_mockup_funnel_cta"
                eventProps={{ location: "free_mockup_footer", target: "scroll_to_form" }}
                className={cn("btn gold", "mt-4 inline-flex justify-center no-underline hover:no-underline")}
              >
                Get my free preview
              </TrackedPublicLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
