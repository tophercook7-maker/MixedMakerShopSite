"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { UmbrellaHeroMedia } from "@/components/public/umbrella-hero-media";
import { mmsBtnPrimary } from "@/lib/mms-umbrella-ui";
import { publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const easeOut = [0.22, 1, 0.36, 1] as const;

const heroBtnSecondary = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl px-7",
  "border border-white/30 bg-white/[0.07] text-center text-[0.9375rem] font-semibold text-[#faf6f0]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[3px]",
  "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
  "hover:border-[#ece7dd]/45 hover:bg-[#3f5a47]/22 hover:shadow-[0_6px_22px_rgba(0,0,0,0.18)]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f8a73]",
);

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
        <div className="max-w-[36rem] lg:max-w-[40rem]">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0d9b8] md:text-xs md:tracking-[0.24em]"
            {...fadeUp(0)}
          >
            MixedMakerShop — Built by Topher
          </motion.p>

          <motion.h1
            className="mt-5 font-bold tracking-[-0.035em] text-[#faf6f0] text-[2.125rem] leading-[1.1] sm:text-4xl md:mt-6 md:text-[2.65rem] md:leading-[1.06] lg:text-[3.15rem]"
            {...fadeUp(stagger)}
          >
            Everything your business needs. Built under one roof.
          </motion.h1>

          <motion.p
            className="mt-6 text-base leading-relaxed text-[#e8e0d6] md:mt-7 md:text-lg md:leading-relaxed"
            {...fadeUp(stagger * 2)}
          >
            Web design, 3D printing, and practical digital builds for people who need something real — not more fluff.
          </motion.p>

          <motion.p
            className="mt-5 text-sm font-medium text-[#d4c4b4] md:text-[0.9375rem]"
            {...fadeUp(stagger * 3)}
          >
            Start with a website. Build from there.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            {...fadeUp(stagger * 4)}
          >
            <TrackedPublicLink
              href="/web-design"
              eventName="public_contact_cta_click"
              eventProps={{ location: "home_hero_umbrella", target: "web_design" }}
              className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}
            >
              Get a Website
            </TrackedPublicLink>
            <Link
              href="#real-work"
              className={cn(heroBtnSecondary, "no-underline hover:no-underline")}
            >
              See My Work
            </Link>
          </motion.div>

          <motion.p
            className="mt-4 text-xs font-medium text-[#c4b5a4] md:text-[0.8125rem]"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.45, delay: reduceMotion ? 0 : stagger * 5, ease: easeOut }}
          >
            Direct. Practical. Built by Topher.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
