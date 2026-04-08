"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { mmsBtnPrimary, mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
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

  /** Extra in-flow height so the sticky image stays pinned while the next section can glide over it. Shorter when reduced motion is on. */
  const stickyScrollRunwayClass = reduceMotion
    ? "h-[clamp(2.5rem,10vh,5rem)]"
    : "h-[clamp(6rem,22vh,11rem)] md:h-[clamp(7rem,26vh,13rem)]";

  return (
    <section
      className="relative isolate"
      aria-label="MixedMakerShop introduction"
    >
      {/*
        Sticky visual plane: umbrella + treatments stay viewport-anchored while the block scrolls.
        Avoid overflow:hidden on this section so position:sticky isn’t clipped (iOS-safe).
      */}
      <div className="sticky top-0 z-0 h-[max(100svh,48rem)] w-full overflow-hidden md:h-[max(100svh,52rem)]">
        <div className="relative h-full min-h-0 w-full">
          <Image
            src={mmsUmbrellaHeroImageSrc}
            alt="MixedMakerShop umbrella brand — open umbrella in the rain as a mobile office: wood-and-brass shaft, leather organizers, laptop, tablet, and Topher's web design sign."
            fill
            priority
            sizes="100vw"
            className={cn(
              /* ~3:2 master: mobile keeps center column (shaft + laptop + tablet); desktop drifts slightly left so darker canopy + sign sit under headlines while the interior stays visible. */
              "scale-[1.02] object-cover object-[50%_43%]",
              "sm:object-[50%_42%]",
              "md:object-[48%_44%]",
              "lg:object-[46%_45%]",
              "xl:object-[44%_46%]",
            )}
          />
          {/* Subtle grain — static, GPU-friendly dot dither */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-overlay"
            style={{
              backgroundImage: "radial-gradient(rgba(30,36,31,0.9) 0.4px, transparent 0.4px)",
              backgroundSize: "3px 3px",
            }}
            aria-hidden
          />
          {/* Left readability — moss/charcoal, lighter mid so umbrella interior stays vivid */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#1e241f]/78 via-[#2f3e34]/36 to-[#3f5a47]/12"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#1e241f]/38 via-transparent to-[#1e241f]/22"
            aria-hidden
          />
          {/* Edge vignette — calm depth without crushing the center */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_92%_78%_at_50%_42%,transparent_42%,rgba(12,15,13,0.38)_100%)]"
            aria-hidden
          />
          {/* Moss → forest → warm cream — no white band */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[48vw] max-h-[22rem] min-h-[12rem] sm:min-h-[13rem]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(47,62,52,0.45) 58%, rgba(63,90,71,0.72) 76%, #ece7dd 100%)",
            }}
            aria-hidden
          />
        </div>
      </div>

      <div className="relative z-[1] -mt-[max(100svh,48rem)] md:-mt-[max(100svh,52rem)]">
        <div
          className={cn(
            shell,
            "flex min-h-[max(100svh,48rem)] flex-col justify-end pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] md:min-h-[max(100svh,52rem)] md:justify-center md:pb-28 md:pt-28 lg:pb-32 lg:pt-32",
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

        {/* Scroll runway: extends the hero block so the umbrella stays visually fixed while content begins to pass over */}
        <div className={cn("pointer-events-none shrink-0 select-none", stickyScrollRunwayClass)} aria-hidden />
      </div>
    </section>
  );
}
