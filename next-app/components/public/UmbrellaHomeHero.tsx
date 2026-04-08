"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
import { publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const easeOut = [0.22, 1, 0.36, 1] as const;

const heroBtnPrimary = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl",
  "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 px-7",
  "text-center text-[0.9375rem] font-semibold text-[#fffaf5]",
  "shadow-lg shadow-black/25 transition hover:brightness-110",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300",
);

const heroBtnSecondary = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl",
  "border border-white/35 bg-white/[0.08] px-7 text-center text-[0.9375rem] font-semibold text-[#faf6f0]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[2px]",
  "transition hover:border-white/45 hover:bg-white/[0.14]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300",
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

  return (
    <section
      className="relative isolate min-h-[min(100svh,52rem)] overflow-hidden border-b border-black/10 md:min-h-[min(92vh,56rem)]"
      aria-label="MixedMakerShop introduction"
    >
      <div className="absolute inset-0">
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
        {/* Busy interior + city bokeh: firm left read, still let warm interior glow show through */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0f1412]/90 via-[#1a1816]/52 to-[#1c1914]/22"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/48 via-transparent to-[#0f0c0a]/28"
          aria-hidden
        />
        {/* Handoff into light page body */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4f3ef] via-[#f4f3ef]/88 to-transparent sm:h-48 md:h-56"
          aria-hidden
        />
      </div>

      <div
        className={cn(
          shell,
          "relative z-[1] flex min-h-[min(100svh,52rem)] flex-col justify-end pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] md:min-h-[min(92vh,56rem)] md:justify-center md:pb-28 md:pt-28 lg:pb-32 lg:pt-32",
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
              className={cn(heroBtnPrimary, "no-underline hover:no-underline")}
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
