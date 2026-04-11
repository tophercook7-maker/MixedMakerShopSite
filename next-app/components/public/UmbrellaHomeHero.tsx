"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { UmbrellaHeroMedia } from "@/components/public/umbrella-hero-media";
import {
  mmsBodyFrost,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsEyebrow,
  mmsGlassPanelHero,
} from "@/lib/mms-umbrella-ui";
import { publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const easeOut = [0.22, 1, 0.36, 1] as const;

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
      aria-label="MixedMakerShop introduction"
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
            mmsGlassPanelHero,
            "max-w-[36rem] px-5 py-5 sm:px-7 sm:py-7 lg:max-w-[40rem] lg:px-8 lg:py-8",
          )}
        >
          <motion.p className={cn(mmsEyebrow, "!text-[#8a4b2a]")} {...fadeUp(0)}>
            Web design · MixedMakerShop
          </motion.p>

          <motion.h1
            className="mt-5 font-bold tracking-[-0.035em] text-neutral-950 text-[2.125rem] leading-[1.1] sm:text-4xl md:mt-6 md:text-[2.65rem] md:leading-[1.06] lg:text-[3.15rem]"
            {...fadeUp(stagger)}
          >
            Websites that help real businesses look trustworthy and get more calls
          </motion.h1>

          <motion.p
            className={cn("mt-6 text-base leading-relaxed md:mt-7 md:text-lg md:leading-relaxed", mmsBodyFrost)}
            {...fadeUp(stagger * 2)}
          >
            I&apos;m Topher, and MixedMakerShop is my studio for practical web design, custom builds, and useful tools —
            with web design front and center for businesses that need a site that actually works.
          </motion.p>

          <motion.div className="mt-8 md:mt-9" {...fadeUp(stagger * 3)}>
            <PublicCtaRow>
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "home_hero_umbrella", target: "free_mockup" }}
                className={cn(
                  mmsBtnPrimary,
                  "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                )}
              >
                Get My Free Preview
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/examples"
                eventName="public_web_design_sample_click"
                eventProps={{ location: "home_hero_umbrella", label: "see_examples" }}
                className={cn(
                  mmsBtnSecondary,
                  "inline-flex min-h-[3.35rem] w-full items-center justify-center px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                )}
              >
                See My Work
              </TrackedPublicLink>
            </PublicCtaRow>
            <p
              className={cn(
                "mt-4 text-[0.7rem] font-normal leading-relaxed text-neutral-600 md:text-xs",
                "max-w-[42ch]",
              )}
            >
              Built directly with me. No fluff. No hard sell.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
