"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { UmbrellaHeroMedia } from "@/components/public/umbrella-hero-media";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsHeroTitleOnGlass,
  mmsOnGlassCtaSeparator,
  mmsOnGlassMuted,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
} from "@/lib/mms-umbrella-ui";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const easeOut = [0.22, 1, 0.36, 1] as const;

const UMBRELLA_TAGLINE =
  "One umbrella. Multiple branches. Everything points back to Mixed Maker Shop.";

/**
 * Hero **content** only on md+ (umbrella lives in `FixedHeroMedia` at page level).
 * Mobile: in-flow `UmbrellaHeroMedia` behind copy (stable fallback; no fixed layer).
 */
export function UmbrellaHomeHero() {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0.01 : 0.55;
  const y = reduceMotion ? 0 : 14;
  const stagger = reduceMotion ? 0 : 0.075;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, ease: easeOut, delay },
  });

  return (
    <section
      className="relative max-md:border-b max-md:border-black/10"
      aria-label="Mixed Maker Shop umbrella studio introduction"
    >
      {/* Mobile only: image scrolls with the page (stacking: bg z-0, content z-[2]) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:hidden">
        <UmbrellaHeroMedia className="min-h-[min(100svh,52rem)]" priority />
      </div>

      <div
        className={cn(
          shell,
          "relative z-[2] flex min-h-[min(100svh,52rem)] flex-col justify-end pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] md:min-h-[max(100svh,52rem)] md:justify-center md:pb-28 md:pt-28 lg:pb-32 lg:pt-32",
        )}
      >
        <div
          className={cn(
            "home-hero-copy-shade public-glass-box public-glass-box--pad max-w-[36rem] lg:max-w-[42rem]",
          )}
        >
          <motion.p className={mmsSectionEyebrowOnGlass} {...fadeUp(0)}>
            Mixed Maker Shop · Umbrella studio headquarters
          </motion.p>

          <motion.h1
            className={cn(mmsHeroTitleOnGlass, "mt-5 md:mt-6")}
            {...fadeUp(stagger)}
          >
            Mixed Maker Shop
          </motion.h1>

          <motion.p
            className={cn("mt-4 text-xl font-semibold leading-snug text-white md:text-2xl", mmsOnGlassSecondary)}
            {...fadeUp(stagger * 2)}
          >
            Websites, 3D printing &amp; maker builds, AI tools, digital products, and experiments — organized under one studio.
          </motion.p>
          <motion.p
            className={cn("mt-6 text-base leading-relaxed md:text-lg md:leading-relaxed", mmsOnGlassSecondary)}
            {...fadeUp(stagger * 2.5)}
          >
            Mixed Maker Shop is the studio HQ. Topher&apos;s Web Design is the dedicated web branch; GiGi&apos;s Print Shop
            carries custom 3D printing — alongside AI &amp; automation, digital products, Mixed Maker Labs, and story work.
          </motion.p>

          <motion.div
            className={cn(
              "mt-6 rounded-2xl border border-[rgba(232,149,92,0.35)] bg-[rgba(17,26,23,0.45)] px-4 py-3 md:px-5 md:py-4",
            )}
            {...fadeUp(stagger * 2.75)}
          >
            <p className="text-center text-base font-bold leading-snug text-white md:text-lg">{UMBRELLA_TAGLINE}</p>
          </motion.div>

          <motion.div className={cn("mt-8 md:mt-9")} {...fadeUp(stagger * 3)}>
            <div className={mmsOnGlassCtaSeparator}>
              <PublicCtaRow>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "free_mockup" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Free homepage mockup
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/free-website-check"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "website_check" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Free website check
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
            <div className={cn("mt-4", mmsOnGlassCtaSeparator)}>
              <PublicCtaRow>
                <TrackedPublicLink
                  href="#captain-maker"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "chooser" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Start my free estimate
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="#studio-divisions"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "studio_map" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Explore studio divisions
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
            <p
              className={cn(
                "mt-4 text-[0.7rem] font-normal leading-relaxed md:text-xs",
                mmsOnGlassMuted,
                "max-w-[48ch]",
              )}
            >
              Free estimates through Captain Maker. Clear starting prices on common paths. Custom work scheduled after approval
              and deposit when required.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
