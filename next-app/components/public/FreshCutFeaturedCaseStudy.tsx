"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { ExampleCardImageOverlay } from "@/components/public/ExampleCardImageOverlay";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { getShowcaseSecondaryCtaHref, getShowcaseSecondaryCtaLabel, LIVE_WEB_PROJECTS } from "@/lib/live-web-projects";
import { trackPublicEvent } from "@/lib/public-analytics";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBodyFrostMuted,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsBtnSecondaryOnGlass,
  mmsBullet,
  mmsBulletOnGlass,
  mmsGlassPanelDense,
  mmsH2,
  mmsH2OnGlass,
  mmsH3OnGlass,
  mmsH3OnGlassLg,
  mmsHomeGlassStackGap,
  mmsOnGlassCtaSeparator,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionBorder,
  mmsSectionY,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const freshCutResolved = LIVE_WEB_PROJECTS.find((p) => p.analyticsId === "fresh_cut_property_care");
if (freshCutResolved === undefined) {
  throw new Error("Fresh Cut Property Care project missing from LIVE_WEB_PROJECTS");
}
const freshCut = freshCutResolved;

const whatWasBuilt = [
  "Service pages that spell out mowing, cleanup, and property care in plain language",
  "Layout that nudges visitors toward a call or estimate—not confusion",
  "Mobile-first—because most customers browse before they pick up the phone",
  "Fast, focused pages so trust turns into a lead—not a bounce",
] as const;

export type FreshCutFeaturedCaseStudyProps = {
  /** Analytics location for CTA events */
  analyticsLocation: "home_case_study_fresh_cut" | "examples_case_study_fresh_cut";
  /** Slightly different band background when embedded on homepage umbrella canvas */
  variant?: "default" | "home";
};

/**
 * Featured case study — Fresh Cut Property Care. Trust-building, conversion-focused;
 * image + copy split on desktop, stacked on mobile.
 */
export function FreshCutFeaturedCaseStudy({
  analyticsLocation,
  variant = "default",
}: FreshCutFeaturedCaseStudyProps) {
  const onGlass = variant === "home";

  const band = onGlass
    ? cn(
        "border-y",
        mmsSectionBorder,
        "bg-gradient-to-b from-[#e4ebe4]/90 via-[#ece7dd] to-[#e8e3da] max-md:from-[#dde8df] max-md:via-[#ece7dd]",
        "md:border-transparent md:bg-transparent",
      )
    : cn("border-b", mmsSectionBorder, "bg-gradient-to-b from-[#f0ebe3] via-[#ece7dd] to-[#e5dfd4]");

  return (
    <section
      className={cn(band, "scroll-mt-24 md:scroll-mt-32")}
      id="featured-case-study-fresh-cut"
      aria-labelledby="featured-case-study-heading"
    >
      <div className={cn(shell, mmsSectionY)}>
        {onGlass ? (
          <div className="public-glass-box--soft public-glass-box--pad">
            <h2 id="featured-case-study-heading" className={mmsH2OnGlass}>
              Featured Project
            </h2>
            <div
              className={cn(
                "grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start xl:gap-14",
                mmsHomeGlassStackGap,
              )}
            >
              <FreshCutCopyColumn
                analyticsLocation={analyticsLocation}
                onGlass
                secondaryBtnClass={mmsBtnSecondaryOnGlass}
              />
              <FreshCutImageColumn priority />
            </div>
          </div>
        ) : (
          <>
            <h2 id="featured-case-study-heading" className={mmsH2}>
              Featured Project
            </h2>
            <div
              className={cn(
                mmsGlassPanelDense,
                "mt-10 border-[#3f5a47]/12 p-6 shadow-[0_28px_70px_-36px_rgba(30,36,31,0.22)] sm:p-8 lg:mt-12 lg:p-10 xl:p-12",
              )}
            >
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start xl:gap-14">
                <FreshCutCopyColumn
                  analyticsLocation={analyticsLocation}
                  onGlass={false}
                  secondaryBtnClass={mmsBtnSecondary}
                />
                <FreshCutImageColumn priority={false} />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function FreshCutCopyColumn({
  analyticsLocation,
  onGlass,
  secondaryBtnClass,
}: {
  analyticsLocation: FreshCutFeaturedCaseStudyProps["analyticsLocation"];
  onGlass: boolean;
  secondaryBtnClass: string;
}) {
  return (
    <div className="min-w-0 space-y-8">
      <header className="space-y-4">
        <span
          className={cn(
            "inline-flex w-fit max-w-full rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
            onGlass
              ? "border-white/22 bg-white/10 text-[#c5ddd2]"
              : "border-[#3f5a47]/22 bg-white/80 text-[#3f5a47]",
          )}
        >
          {freshCut.tag}
        </span>
        <h3
          className={cn(
            "tracking-tight lg:text-[1.65rem]",
            onGlass ? mmsH3OnGlassLg : "text-xl font-bold text-[#1e241f] md:text-2xl",
          )}
        >
          {freshCut.title}
        </h3>
        <p
          className={cn(
            "text-xl font-semibold leading-snug tracking-tight md:text-2xl md:leading-snug",
            onGlass ? mmsOnGlassPrimary : "text-[#1e241f]",
          )}
        >
          A clean site built to turn local searches into estimate requests
        </p>
        <p className={cn("text-sm font-medium md:text-[15px]", onGlass ? mmsOnGlassSecondary : mmsBodyFrostMuted)}>
          Landscaping &amp; property care · Hot Springs, Arkansas
        </p>
      </header>

      <div>
        <p className={cn("text-base leading-relaxed md:text-[17px]", onGlass ? mmsOnGlassPrimary : mmsBodyFrost)}>
          Fresh Cut Property Care needed to look legitimate online and give potential customers a dead-simple path to
          request an estimate. Like most local crews, the win wasn&apos;t flashy—it was trust, clarity, and more qualified
          calls.
        </p>
      </div>

      <div>
        <h4 className={cn(onGlass ? mmsH3OnGlass : "text-lg font-bold text-[#1e241f] md:text-xl")}>What I built</h4>
        <ul className={cn("mt-4 space-y-3 text-base md:text-[17px]", onGlass ? mmsOnGlassPrimary : mmsBodyFrost)}>
          {whatWasBuilt.map((line) => (
            <li key={line} className="flex gap-3">
              <span className={onGlass ? mmsBulletOnGlass : mmsBullet} aria-hidden>
                ·
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className={cn(onGlass ? mmsH3OnGlass : "text-lg font-bold text-[#1e241f] md:text-xl")}>What it does now</h4>
        <p className={cn("mt-4 text-base leading-relaxed md:text-[17px]", onGlass ? mmsOnGlassPrimary : mmsBodyFrost)}>
          The site gives the business a strong first impression, makes it easy for customers to understand what they offer,
          and creates a clear path to reach out for work. It&apos;s built to support real local traffic and turn visitors
          into actual leads. This structure also supports local search, helping the business show up when people look for
          services in the area.
        </p>
      </div>

      <div className={cn(mmsOnGlassCtaSeparator, "pt-6")}>
        <PublicCtaRow>
        <a
          href={freshCut.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackPublicEvent("public_external_project_click", {
              location: analyticsLocation,
              section: "featured_case_study",
              project: freshCut.analyticsId,
            })
          }
          className={cn(
            mmsBtnPrimary,
            "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold no-underline sm:flex-initial sm:min-w-[12rem] hover:no-underline",
          )}
        >
          View Live Site
          <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        </a>
        <TrackedPublicLink
          href={getShowcaseSecondaryCtaHref(freshCut)}
          eventName="public_contact_cta_click"
          eventProps={{ location: analyticsLocation, target: "free_mockup", project: freshCut.analyticsId }}
          className={cn(
            secondaryBtnClass,
            "inline-flex min-h-[3rem] flex-1 items-center justify-center px-6 text-[0.9375rem] font-semibold no-underline sm:flex-initial sm:min-w-[12rem] hover:no-underline",
          )}
        >
          {getShowcaseSecondaryCtaLabel(freshCut)}
        </TrackedPublicLink>
        </PublicCtaRow>
      </div>
    </div>
  );
}

function FreshCutImageColumn({ priority }: { priority: boolean }) {
  return (
    <div className="lg:sticky lg:top-28">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-[#3f5a47]/14 bg-[#cfd8d0]",
          "aspect-[4/3] min-h-[220px] sm:aspect-[16/11] sm:min-h-[280px]",
          "lg:aspect-auto lg:min-h-[min(520px,62vh)]",
        )}
      >
        <Image
          src={freshCut.previewSrc}
          alt={freshCut.previewAlt}
          fill
          className={cn(freshCut.imageClassName, "object-cover")}
          style={{ objectPosition: freshCut.objectPosition }}
          sizes="(max-width: 1024px) 100vw, min(560px, 45vw)"
          priority={priority}
        />
        <ExampleCardImageOverlay />
      </div>
    </div>
  );
}
