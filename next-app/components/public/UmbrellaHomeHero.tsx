"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { UmbrellaHeroMedia } from "@/components/public/umbrella-hero-media";
import {
  mmsBodyFrost,
  mmsBodyFrostMuted,
  mmsBtnPrimary,
  mmsEyebrow,
  mmsGlassPanelHome,
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
      {/* Mobile only: image scrolls with the page */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden md:hidden">
        <UmbrellaHeroMedia className="min-h-[min(100svh,52rem)]" priority />
      </div>

      <div
        className={cn(
          shell,
          "relative z-[1] flex min-h-[min(100svh,52rem)] flex-col justify-end pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] md:min-h-[max(100svh,52rem)] md:justify-center md:pb-28 md:pt-28 lg:pb-32 lg:pt-32",
        )}
      >
        <div
          className={cn(
            mmsGlassPanelHome,
            "max-w-[36rem] px-6 py-8 sm:px-8 sm:py-9 lg:max-w-[40rem] lg:px-10 lg:py-10",
          )}
        >
          <motion.p className={cn(mmsEyebrow, "!text-[#8a4b2a]")} {...fadeUp(0)}>
            Web Design by Topher
          </motion.p>

          <motion.h1
            className="mt-5 font-bold tracking-[-0.035em] text-[#1e241f] text-[2.125rem] leading-[1.1] sm:text-4xl md:mt-6 md:text-[2.65rem] md:leading-[1.06] lg:text-[3.15rem]"
            {...fadeUp(stagger)}
          >
            Websites That Bring You Customers
          </motion.h1>

          <motion.p
            className={cn("mt-6 text-base leading-relaxed md:mt-7 md:text-lg md:leading-relaxed", mmsBodyFrost)}
            {...fadeUp(stagger * 2)}
          >
            I build clean, modern websites for small businesses that actually turn visitors into calls, leads, and real
            customers.
          </motion.p>

          <motion.p
            className={cn("mt-5 text-base font-semibold leading-snug md:mt-6 md:text-lg md:leading-snug", mmsBodyFrost)}
            {...fadeUp(stagger * 3)}
          >
            Want to see what your website could look like before committing?
          </motion.p>

          <motion.div className="mt-8 md:mt-9" {...fadeUp(stagger * 4)}>
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: "home_hero_umbrella", target: "free_mockup" }}
              className={cn(
                mmsBtnPrimary,
                "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
              )}
            >
              Get My Free Website Preview
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedPublicLink>
            <p className={cn("mt-4 text-xs font-medium leading-relaxed md:text-sm", mmsBodyFrostMuted)}>
              No pressure. Just a real preview built for your business.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
