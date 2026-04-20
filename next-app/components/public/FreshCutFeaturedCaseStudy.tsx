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
  mmsOnGlassMuted,
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

const beforeProblems = [
  "Outdated or weak website",
  "Hard to trust at first glance",
  "Not turning visitors into calls",
  "Poor mobile experience",
] as const;

const whatChanged = [
  "Clear, professional first impression",
  "Mobile-friendly layout that’s easy to navigate",
  "Strong call-to-action placement",
  "Built to turn visits into real inquiries",
] as const;

const whyItWorksBody =
  "This works because people decide fast. When your site is clear, trustworthy, and easy to act on, more visitors turn into real calls.";

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
          <div className="public-glass-box public-glass-box--pad">
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

const softPanelClass = (onGlass: boolean) =>
  onGlass
    ? "public-glass-box--soft public-glass-box--pad"
    : "rounded-xl border border-[#3f5a47]/12 bg-white/70 p-4 shadow-sm sm:p-5";

function FreshCutCopyColumn({
  analyticsLocation,
  onGlass,
  secondaryBtnClass,
}: {
  analyticsLocation: FreshCutFeaturedCaseStudyProps["analyticsLocation"];
  onGlass: boolean;
  secondaryBtnClass: string;
}) {
  const mockupHref = getShowcaseSecondaryCtaHref(freshCut);

  return (
    <div className={cn("min-w-0 space-y-6", onGlass && "space-y-5")}>
      <header className="space-y-3">
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
            "text-base font-medium leading-snug md:text-[17px]",
            onGlass ? mmsOnGlassSecondary : "text-[#1e241f]/85",
          )}
        >
          Local landscaping business that needed more calls and better first impressions online.
        </p>
        <p className={cn("text-sm font-medium md:text-[15px]", onGlass ? mmsOnGlassMuted : mmsBodyFrostMuted)}>
          Landscaping &amp; property care · Hot Springs, Arkansas
        </p>
      </header>

      <div className={softPanelClass(onGlass)}>
        <h4 className={cn("text-sm font-semibold uppercase tracking-[0.12em]", onGlass ? "text-white/90" : "text-[#1e241f]")}>
          Before
        </h4>
        <ul className={cn("mt-3 space-y-2.5 text-sm md:text-[15px]", onGlass ? mmsOnGlassSecondary : mmsBodyFrost)}>
          {beforeProblems.map((line) => (
            <li key={line} className="flex gap-2.5">
              <span className={onGlass ? mmsBulletOnGlass : mmsBullet} aria-hidden>
                ·
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={softPanelClass(onGlass)}>
        <h4 className={cn("text-sm font-semibold uppercase tracking-[0.12em]", onGlass ? "text-white/90" : "text-[#1e241f]")}>
          What changed
        </h4>
        <ul className={cn("mt-3 space-y-2.5 text-sm md:text-[15px]", onGlass ? mmsOnGlassSecondary : mmsBodyFrost)}>
          {whatChanged.map((line) => (
            <li key={line} className="flex gap-2.5">
              <span className={onGlass ? mmsBulletOnGlass : mmsBullet} aria-hidden>
                ·
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className={cn(onGlass ? mmsH3OnGlass : "text-lg font-bold text-[#1e241f] md:text-xl")}>Why it works</h4>
        <p className={cn("mt-3 text-base leading-relaxed md:text-[17px]", onGlass ? mmsOnGlassSecondary : mmsBodyFrost)}>
          {whyItWorksBody}
        </p>
      </div>

      <div className={cn(onGlass ? "space-y-3" : "space-y-2")}>
        <TrackedPublicLink
          href={mockupHref}
          eventName="public_contact_cta_click"
          eventProps={{
            location: analyticsLocation,
            target: "free_mockup",
            project: freshCut.analyticsId,
            section: "featured_case_study_mockup",
          }}
          className={cn(
            mmsBtnPrimary,
            "inline-flex min-h-[3rem] w-full items-center justify-center px-6 text-center text-[0.9375rem] font-semibold no-underline hover:no-underline sm:w-auto sm:min-w-[min(100%,20rem)]",
          )}
        >
          See what this could look like for your business
        </TrackedPublicLink>
        <p className={cn("text-center text-sm sm:text-left", onGlass ? mmsOnGlassMuted : "text-[#3f5a47]/80")}>
          Get a free preview before you commit to anything.
        </p>
      </div>

      <div className={cn(mmsOnGlassCtaSeparator, "pt-2")}>
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
              secondaryBtnClass,
              "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold no-underline sm:flex-initial sm:min-w-[12rem] hover:no-underline",
            )}
          >
            View Live Site
            <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          </a>
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
