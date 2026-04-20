import type { Metadata } from "next";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { FreeMockupFunnelClient } from "@/components/public/free-mockup-funnel-client";
import { FreeMockupSourceBannerFreshCut } from "@/components/public/free-mockup-source-banner";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupOnPageHash, publicShellClass } from "@/lib/public-brand";
import { mmsBulletOnGlass, mmsOnGlassSecondary, mmsSectionY, mmsUmbrellaSectionBackdrop } from "@/lib/mms-umbrella-ui";
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
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        {/* Hero — high-confidence offer, readable above the fold */}
        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, "py-12 md:py-16 lg:py-20")}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className="text-white/70 text-sm uppercase tracking-[0.18em]">Free website preview</p>
              <h1 className="mt-4 text-white text-4xl font-bold tracking-tight md:text-5xl">
                Get a free website preview before you commit.
              </h1>
              <p className="mt-4 text-white/80 text-base md:text-lg leading-relaxed">
                See what your business could look like online with a cleaner, more trustworthy layout built to help bring
                in more calls, leads, and customers.
              </p>
              <p className="mt-4 text-sm text-white/65 leading-relaxed">Takes about 2 minutes. No pressure. No commitment.</p>
              <TrackedPublicLink
                href={publicFreeMockupOnPageHash}
                eventName="public_free_mockup_funnel_cta"
                eventProps={{ location: "free_mockup_hero", target: "scroll_to_form" }}
                className={cn("btn gold", "mt-4 inline-flex justify-center no-underline hover:no-underline")}
              >
                Start my free preview
              </TrackedPublicLink>
            </div>
          </div>
        </section>

        {/* Form intro — directly above intake */}
        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, "flex flex-col gap-4 pb-10 pt-2 md:gap-5 md:pb-12 md:pt-0")}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className="text-white text-xl font-semibold">Before you start</h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                You do not need to know exactly what you want yet.
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/80">
                A business name, Facebook page, or rough idea is enough to start.
              </p>
              <p className="mt-3 leading-relaxed text-white/65">
                Best for local services, small businesses, and anyone who depends on trust, calls, or inbound leads.
              </p>
            </div>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className="text-white text-xl font-semibold">What you’ll get</h2>
              <ul className="mt-4 space-y-2.5 text-base leading-relaxed text-white/80 md:text-[17px]">
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>A clearer website direction for your business</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>A more trustworthy first impression</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>A preview built around calls, leads, or bookings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/55" aria-hidden>
                    ·
                  </span>
                  <span>A real example you can look at before deciding anything else</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {isFreshCutFunnel ? <FreeMockupSourceBannerFreshCut /> : null}
        <FreeMockupFunnelClient funnelSource={funnelSource} />

        {/* How it works — after form so the top stays hero → intro → form */}
        <section className={mmsUmbrellaSectionBackdrop}>
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
        <section className={mmsUmbrellaSectionBackdrop}>
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
        <section className={mmsUmbrellaSectionBackdrop}>
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
        <section className={cn(mmsUmbrellaSectionBackdrop, "border-b-0")}>
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
