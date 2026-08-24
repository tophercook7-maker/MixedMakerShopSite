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
import { MMS_LOCAL_TECH_POSITIONING } from "@/components/public/MmsComebackStorySection";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const UMBRELLA_TAGLINE =
  "One person. One lab. Every bench runs back to the same desk.";

/**
 * Hero **content** only on md+ (umbrella lives in `FixedHeroMedia` at page level).
 * Mobile: in-flow `UmbrellaHeroMedia` behind copy (stable fallback; no fixed layer).
 */
export function UmbrellaHomeHero() {
  return (
    <section
      className="relative max-md:border-b max-md:border-black/10"
      aria-label="Mixed Maker Shop one-man laboratory introduction"
    >
      {/* Mobile: the squirrel gets its own visible band up top (cleared from the
          fixed header) so the copy box no longer covers it. Desktop/tablet uses
          FixedHeroMedia behind the centered copy instead. */}
      <div className="md:hidden pt-[calc(4.5rem+env(safe-area-inset-top))]">
        <UmbrellaHeroMedia className="aspect-[3/2] w-full" priority />
      </div>

      <div
        className={cn(
          shell,
          "relative z-[2] flex flex-col pb-16 pt-8 md:min-h-[max(100svh,52rem)] md:justify-center md:pb-28 md:pt-28 lg:pb-32 lg:pt-32",
        )}
      >
        <div
          className={cn(
            "home-hero-copy-shade public-glass-box public-glass-box--pad max-w-[36rem] lg:max-w-[42rem]",
          )}
        >
          <p className={mmsSectionEyebrowOnGlass}>
            Mixed Maker Shop · A one-man laboratory
          </p>

          <h1
            className={cn(mmsHeroTitleOnGlass, "mt-5 md:mt-6")}
          >
            Mixed Maker Shop
          </h1>

          <p
            className={cn("mt-4 text-xl font-semibold leading-snug text-white md:text-2xl", mmsOnGlassSecondary)}
          >
            {MMS_LOCAL_TECH_POSITIONING}
          </p>
          <p
            className={cn("mt-6 text-base leading-relaxed md:text-lg md:leading-relaxed", mmsOnGlassSecondary)}
          >
            Formerly Cook&apos;s Computer Service (2000–2014). After MS forced a pause, Mixed Maker Shop is the comeback —
            a working lab where one person builds websites, AI tools, apps and games, books and audiobooks, music and
            video, and still makes the house call for a slow PC.
          </p>

          <div
            className={cn(
              "mt-6 rounded-2xl border border-[rgba(232,149,92,0.35)] bg-[rgba(17,26,23,0.45)] px-4 py-3 md:px-5 md:py-4",
            )}
          >
            <p className="text-center text-base font-bold leading-snug text-white md:text-lg">{UMBRELLA_TAGLINE}</p>
          </div>

          <div className={cn("mt-8 md:mt-9")}>
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
                  href="/pricing"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "pricing" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  See pricing
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="#lab-benches"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero_umbrella", target: "lab_map" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3.35rem] w-full items-center justify-center px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  See what&apos;s on the bench
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
              Free homepage mockups before you commit. Clear starting prices on common paths. The person who answers is
              the person who builds it. Custom work scheduled after approval and deposit when required.
            </p>
            <p className={cn("mt-2 max-w-[48ch] text-sm leading-relaxed", mmsOnGlassSecondary)}>
              Not sure what you need? Start with a free homepage preview — you&apos;ll see the direction before you commit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
