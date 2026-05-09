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
            "home-hero-copy-shade public-glass-box public-glass-box--pad max-w-[36rem] lg:max-w-[40rem]",
          )}
        >
          <motion.p className={mmsSectionEyebrowOnGlass} {...fadeUp(0)}>
            Mixed Maker Shop
          </motion.p>

          <motion.h1
            className={cn(mmsHeroTitleOnGlass, "mt-5 md:mt-6")}
            {...fadeUp(stagger)}
          >
            Got something you need built? Start here.
          </motion.h1>

          <motion.p
            className={cn("mt-4 text-xl font-semibold leading-snug text-white md:text-2xl", mmsOnGlassSecondary)}
            {...fadeUp(stagger * 2)}
          >
            One umbrella studio — web design, web systems &amp; custom 3D printing
          </motion.p>
          <motion.p
            className={cn("mt-6 text-base leading-relaxed md:text-lg md:leading-relaxed", mmsOnGlassSecondary)}
            {...fadeUp(stagger * 2.5)}
          >
            Mixed Maker Shop brings the creative services together. Topher&apos;s Web Design handles 3–5 page websites,
            informational sites, web systems, forms, dashboards, CRM-style tools, and useful online workflows.
            GiGi&apos;s Print Shop covers useful and fun custom prints — keychains, bookmarks, shelf pieces, tools, fidget
            toys, cosplay-style swords, and everyday items.
          </motion.p>

          <motion.div className={cn("mt-8 md:mt-9")} {...fadeUp(stagger * 3)}>
            <div className={mmsOnGlassCtaSeparator}>
              <PublicCtaRow>
                <TrackedPublicLink
                  href="#captain-maker"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "chooser" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Start My Free Estimate
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="#captain-maker"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "free_mockup_secondary" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Tell Us What You Need Built, Maker
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
            <p
              className={cn(
                "mt-4 text-[0.7rem] font-normal leading-relaxed md:text-xs",
                mmsOnGlassMuted,
                "max-w-[42ch]",
              )}
            >
              Free estimates. Clear starting prices. Custom work scheduled after approval and deposit when required.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
