"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  ShowcaseCaseStudyAfterContext,
  ShowcaseCaseStudyBeforePrimary,
} from "@/components/public/ShowcaseCaseStudyFields";
import {
  getShowcasePrimaryCtaLabel,
  getShowcaseProjectsByAnalyticsIds,
  getShowcaseSecondaryCtaHref,
  getShowcaseSecondaryCtaLabel,
  LIVE_WEB_PROJECTS,
  type AnyShowcaseProject,
} from "@/lib/live-web-projects";
import {
  mmsBodyFrost,
  mmsBodyFrostMuted,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsBtnSecondaryOnGlass,
  mmsCard,
  mmsGlassPanelDense,
  mmsH2,
  mmsH2OnGlass,
  mmsH3OnGlassLg,
  mmsHomeGlassBlockEndGap,
  mmsHomeGlassStackGap,
  mmsOnGlassCtaSeparator,
  mmsOnGlassSecondary,
  mmsSectionBorder,
  mmsSectionY,
  mmsTextLink,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { publicBodyMutedClass, publicShellClass } from "@/lib/public-brand";
import { ExampleCardImageOverlay } from "@/components/public/ExampleCardImageOverlay";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { trackPublicEvent } from "@/lib/public-analytics";
import { cn } from "@/lib/utils";

const shell = publicShellClass;
const sectionY = "py-20 md:py-28 lg:py-[7.5rem]";
const h2Dark =
  "text-3xl md:text-4xl lg:text-[3.15rem] font-semibold tracking-tight text-[#E8FDF5] lg:leading-[1.06]";
const bodyDark = publicBodyMutedClass;
const bodyLight = "text-[#4a5750]";

export type HomeFeaturedWebDesignWorkProps = {
  variant?: "dark" | "light";
  heading?: string;
  subhead?: string;
  /** Defaults to `real-work` for backward-compatible in-page anchors. */
  sectionId?: string;
  /** Homepage: section sits over fixed umbrella; transparent band + glass cards on md+. */
  immersive?: boolean;
  /** When set, only these `analyticsId` values are shown (e.g. homepage subset). */
  featuredAnalyticsIds?: readonly string[];
  /** Footer line under project cards. `null` hides the left promo (link-only strip). */
  bottomStripLead?: string | null;
  /** Footer link label (default: “See all examples →”). */
  bottomStripLinkLabel?: string;
  bottomStripHref?: string;
};

function selectProjects(featuredAnalyticsIds?: readonly string[]): AnyShowcaseProject[] {
  if (!featuredAnalyticsIds?.length) return [...LIVE_WEB_PROJECTS];
  return getShowcaseProjectsByAnalyticsIds(featuredAnalyticsIds);
}

const tagPill = (isLight: boolean, immersive?: boolean) =>
  cn(
    "inline-flex w-fit max-w-full rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
    immersive && isLight
      ? "border-white/22 bg-white/10 text-[#c5ddd2]"
      : isLight
        ? "border-[#3f5a47]/22 bg-white/70 text-[#3f5a47]"
        : "border-white/[0.22] bg-black/25 text-[#c5ddd2]",
  );

const featuredPill = (isLight: boolean, immersive?: boolean) =>
  cn(
    "inline-flex w-fit max-w-full rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
    immersive && isLight
      ? "border-[#eab08a]/35 bg-white/10 text-[#f0c49a]"
      : isLight
        ? "border-[#b85c1e]/35 bg-gradient-to-r from-[#fff7ed]/95 to-white/85 text-[#8a4b2a]"
        : "border-[#eab08a]/35 bg-white/10 text-[#f0c49a]",
  );

function BrowserShowcasePreview({
  hostname,
  children,
  theme,
}: {
  hostname: string;
  children: ReactNode;
  theme: "dark" | "light";
}) {
  if (theme === "light") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-3xl border border-[#3f5a47]/14 bg-white/95",
          "shadow-[0_26px_70px_-28px_rgba(30,36,31,0.22),inset_0_1px_0_rgba(255,255,255,0.92)]",
          "ring-1 ring-[#3f5a47]/[0.06]",
        )}
      >
        <div
          className="flex h-11 shrink-0 items-center gap-2 border-b border-[#3f5a47]/10 bg-[#f4f1ea]/95 px-3 sm:h-12 sm:px-4"
          aria-hidden
        >
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#c45a3a]/85 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-[#b85c1e]/88 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-[#6f8a73]/90 sm:h-2.5 sm:w-2.5" />
          </span>
          <div className="mx-auto flex min-h-[1.85rem] min-w-0 max-w-[min(100%,26rem)] flex-1 items-center justify-center rounded-lg border border-[#3f5a47]/12 bg-white/90 px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <span className="truncate text-center text-[10px] font-medium tabular-nums text-[#5a6a62] sm:text-[11px]">
              https://{hostname}
            </span>
          </div>
          <span className="w-11 shrink-0 sm:w-[52px]" />
        </div>
        <div className="relative w-full">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-[#0c100f] shadow-[0_32px_88px_rgba(0,0,0,0.5)]",
        "border border-white/[0.14] ring-1 ring-[rgba(0,255,178,0.12)]",
      )}
    >
      <div
        className="flex h-11 shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#131916] px-3 sm:h-12 sm:px-4"
        aria-hidden
      >
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]/95 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]/95 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]/95 sm:h-2.5 sm:w-2.5" />
        </span>
        <div className="mx-auto flex min-h-[1.85rem] min-w-0 max-w-[min(100%,26rem)] flex-1 items-center justify-center rounded-lg border border-white/[0.06] bg-black/40 px-3 py-1">
          <span className="truncate text-center text-[10px] font-medium tabular-nums text-[#9fb5ad]/90 sm:text-[11px]">
            https://{hostname}
          </span>
        </div>
        <span className="w-11 shrink-0 sm:w-[52px]" />
      </div>
      <div className="relative w-full">{children}</div>
    </div>
  );
}

/** Live client websites — primary proof for MixedMakerShop web design. */
const defaultBottomStripLead = "Want something like this for your business? Start with a free homepage preview.";

export function HomeFeaturedWebDesignWork({
  variant = "dark",
  heading = "Websites I've Built",
  subhead = "Real businesses, live on the web — built and launched by Topher.",
  sectionId = "real-work",
  immersive = false,
  featuredAnalyticsIds,
  bottomStripLead,
  bottomStripLinkLabel = "See all examples →",
  bottomStripHref = "/examples",
}: HomeFeaturedWebDesignWorkProps) {
  const projects = selectProjects(featuredAnalyticsIds);
  const projectCount = projects.length;
  const isLight = variant === "light";
  /** Soft glass cards use dark-on-glass copy tokens from showcase helpers */
  const showcaseVariant = isLight && !immersive ? "light" : "dark";
  const h2 = isLight ? (immersive ? mmsH2OnGlass : mmsH2) : h2Dark;
  const body = isLight ? (immersive ? mmsOnGlassSecondary : bodyLight) : bodyDark;
  const sectionClass = isLight
    ? cn(
        immersive
          ? cn(
              "border-y border-[#3f5a47]/28 bg-transparent max-md:bg-gradient-to-b max-md:from-[#ebe6dc] max-md:via-[#f2ede4] max-md:to-[#ece7dd]",
              mmsSectionBorder,
            )
          : cn(
              "border-y bg-gradient-to-b from-[#e8e3d9] via-[#f0ebe3] to-[#e5dfd4]",
              mmsSectionBorder,
            ),
      )
    : "home-band home-band--deep border-y border-[rgba(232,253,245,0.08)]";

  return (
    <section
      id={sectionId}
      className={cn(sectionClass, "scroll-mt-24 md:scroll-mt-32")}
      aria-labelledby="featured-web-design-heading"
    >
      <div className={cn(shell, isLight ? mmsSectionY : sectionY)}>
        <div
          className={cn(
            "home-reveal max-w-[min(100%,56rem)]",
            immersive && isLight && cn("public-glass-box public-glass-box--pad"),
          )}
        >
          <h2
            id="featured-web-design-heading"
            className={cn("home-section-title max-w-[900px]", h2)}
          >
            {heading}
          </h2>
          <p
            className={cn(
              "mt-6 max-w-[42rem] text-sm md:text-base leading-relaxed",
              body,
              immersive && isLight && "font-medium",
            )}
          >
            {subhead}
          </p>
        </div>

        <div
          className={cn(
            "home-reveal grid grid-cols-1 gap-12 md:gap-16 lg:gap-20",
            immersive && isLight ? mmsHomeGlassStackGap : "mt-14 md:mt-16",
            projectCount === 1 && "md:mx-auto md:max-w-4xl",
            projectCount === 2 && "md:grid-cols-2",
            projectCount >= 3 && "md:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {projects.map((project, index) => (
            <article
              key={project.analyticsId}
              className={cn(
                "flex min-w-0 flex-col gap-6",
                isLight &&
                  cn(
                    immersive
                      ? "public-glass-box--soft public-glass-box--pad hover:-translate-y-px hover:shadow-[0_26px_58px_-24px_rgba(0,0,0,0.35)]"
                      : cn(
                          mmsCard,
                          "p-6 sm:p-8 hover:-translate-y-px hover:shadow-[0_26px_58px_-24px_rgba(30,36,31,0.24)]",
                        ),
                    project.emphasizeCard &&
                      immersive &&
                      "ring-2 ring-[#eab08a]/35 shadow-[0_28px_72px_-34px_rgba(0,0,0,0.45)] md:ring-[#eab08a]/28",
                  ),
              )}
            >
              <BrowserShowcasePreview hostname={project.hostname} theme={variant}>
                <div
                  className={cn(
                    "relative w-full overflow-hidden",
                    isLight ? "bg-[#cfd8d0]" : "bg-[#0a0d0c]",
                    "aspect-[10/16] min-h-[220px] sm:aspect-[4/5] sm:min-h-[260px]",
                    "md:aspect-[16/13] md:min-h-[min(420px,44vw)] lg:aspect-[16/12] lg:min-h-[min(480px,38vw)]",
                  )}
                >
                  <Image
                    src={project.previewSrc}
                    alt={project.previewAlt}
                    fill
                    priority={index === 0}
                    quality={88}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 760px"
                    className={cn(
                      project.imageClassName,
                      "max-md:object-cover",
                    )}
                    style={{ objectPosition: project.objectPosition }}
                  />
                  <ExampleCardImageOverlay />
                </div>
              </BrowserShowcasePreview>

              <div className="flex flex-col gap-3 px-0.5">
                <div className="flex flex-wrap gap-2">
                  <span className={tagPill(isLight, immersive)}>{project.tag}</span>
                  {project.featuredBadge ? (
                    <span className={featuredPill(isLight, immersive)}>{project.featuredBadge}</span>
                  ) : null}
                </div>
                <h3
                  className={cn(
                    "tracking-tight lg:text-[1.65rem]",
                    isLight ? (immersive ? mmsH3OnGlassLg : "text-xl font-bold text-[#1e241f] md:text-2xl") : "text-xl font-bold text-[#E8FDF5] md:text-2xl",
                  )}
                >
                  {project.title}
                </h3>
                <ShowcaseCaseStudyBeforePrimary project={project} variant={showcaseVariant} />
                <p
                  className={cn(
                    "text-[15px] font-semibold leading-snug md:text-base",
                    isLight ? (immersive ? "text-[#E8FDF5]/95" : "text-[#2d3a33]") : "text-[#E8FDF5]/95",
                  )}
                >
                  {project.primaryLine}
                </p>
                {project.context ? (
                  <p
                    className={cn(
                      "text-sm leading-relaxed md:text-[15px]",
                      isLight && immersive ? mmsOnGlassSecondary : isLight ? mmsBodyFrost : body,
                    )}
                  >
                    {project.context}
                  </p>
                ) : null}
                <ShowcaseCaseStudyAfterContext project={project} variant={showcaseVariant} />
                <div
                  className={cn(
                    isLight && immersive ? cn(mmsOnGlassCtaSeparator, "pt-5") : "pt-2",
                  )}
                >
                  <PublicCtaRow>
                  {project.primaryCtaIsExternal === false ? (
                    <Link
                      href={project.url}
                      onClick={() =>
                        trackPublicEvent("public_external_project_click", {
                          location: "web_design",
                          section: "featured_web_design",
                          project: project.analyticsId,
                          href: project.url,
                        })
                      }
                      className={cn(
                        "inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold no-underline sm:flex-initial sm:min-w-[11rem]",
                        isLight
                          ? cn(mmsBtnPrimary, "rounded-xl")
                          : "home-btn-primary home-btn-primary--hero rounded-xl text-[#0c0e0d]",
                      )}
                    >
                      {getShowcasePrimaryCtaLabel(project)}
                      <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    </Link>
                  ) : (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackPublicEvent("public_external_project_click", {
                          location: "web_design",
                          section: "featured_web_design",
                          project: project.analyticsId,
                        })
                      }
                      className={cn(
                        "inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold no-underline sm:flex-initial sm:min-w-[11rem]",
                        isLight
                          ? cn(mmsBtnPrimary, "rounded-xl")
                          : "home-btn-primary home-btn-primary--hero rounded-xl text-[#0c0e0d]",
                      )}
                    >
                      {getShowcasePrimaryCtaLabel(project)}
                      <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    </a>
                  )}
                  <Link
                    href={getShowcaseSecondaryCtaHref(project)}
                    onClick={() =>
                      trackPublicEvent("public_contact_cta_click", {
                        location: "web_design",
                        target: "free_mockup",
                        section: "featured_web_design_card",
                        project: project.analyticsId,
                      })
                    }
                    className={cn(
                      "inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-6 text-center text-[0.9375rem] font-semibold leading-snug no-underline sm:flex-initial sm:min-w-[11rem]",
                      isLight
                        ? immersive
                          ? cn(mmsBtnSecondaryOnGlass, "rounded-xl")
                          : cn(mmsBtnSecondary, "rounded-xl")
                        : "home-btn-secondary--hero rounded-xl",
                    )}
                  >
                    {getShowcaseSecondaryCtaLabel(project)}
                    <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                  </Link>
                  </PublicCtaRow>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          className={cn(
            "home-reveal",
            isLight && immersive ? mmsHomeGlassBlockEndGap : "mt-16 md:mt-20",
            isLight &&
              immersive &&
              bottomStripLead !== null &&
              cn(
                "public-glass-box--soft public-glass-box--pad",
                "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
              ),
            isLight &&
              immersive &&
              bottomStripLead === null &&
              cn("public-glass-box--soft public-glass-box--pad", "flex justify-center"),
            (!immersive || !isLight) &&
              cn(
                bottomStripLead !== null &&
                  "flex flex-col items-start gap-4 border-t pt-10 md:flex-row md:items-center md:justify-between",
                bottomStripLead === null && "flex justify-center border-t border-transparent pt-10",
                isLight ? "border-[#3f5a47]/12" : "border-[rgba(232,253,245,0.08)]",
              ),
          )}
        >
          {bottomStripLead !== null ? (
            <p
              className={cn(
                "max-w-xl text-sm md:text-[15px]",
                isLight && immersive ? mmsOnGlassSecondary : body,
              )}
            >
              {bottomStripLead === undefined ? defaultBottomStripLead : bottomStripLead}
            </p>
          ) : null}
          <Link
            href={bottomStripHref}
            className={cn(
              isLight
                ? immersive
                  ? mmsTextLinkOnGlass
                  : mmsTextLink
                : "text-[0.9375rem] font-semibold text-[#00FFB2] underline-offset-4 hover:text-[#35ffc1] hover:underline",
              bottomStripLead === null && "text-base font-semibold",
            )}
          >
            {bottomStripLinkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
