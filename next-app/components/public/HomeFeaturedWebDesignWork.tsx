"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { LIVE_WEB_PROJECTS } from "@/lib/live-web-projects";
import { mmsBtnPrimary, mmsBtnSecondary, mmsCard, mmsH2, mmsSectionY } from "@/lib/mms-umbrella-ui";
import { publicBodyMutedClass, publicShellClass } from "@/lib/public-brand";
import { trackPublicEvent } from "@/lib/public-analytics";
import { cn } from "@/lib/utils";

const shell = publicShellClass;
const sectionY = "py-20 md:py-28 lg:py-[7.5rem]";
const h2Dark =
  "text-3xl md:text-4xl lg:text-[3.15rem] font-semibold tracking-tight text-[#E8FDF5] lg:leading-[1.06]";
const bodyDark = publicBodyMutedClass;
const bodyLight = "text-slate-600";

export type HomeFeaturedWebDesignWorkProps = {
  variant?: "dark" | "light";
  heading?: string;
  subhead?: string;
  /** Defaults to `real-work` for backward-compatible in-page anchors. */
  sectionId?: string;
};

const projectCount: number = LIVE_WEB_PROJECTS.length;

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
          "overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/[0.08] ring-1 ring-slate-900/[0.04]",
        )}
      >
        <div
          className="flex h-11 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-slate-50 px-3 sm:h-12 sm:px-4"
          aria-hidden
        >
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400/90 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-amber-400/90 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/90 sm:h-2.5 sm:w-2.5" />
          </span>
          <div className="mx-auto flex min-h-[1.85rem] min-w-0 max-w-[min(100%,26rem)] flex-1 items-center justify-center rounded-lg border border-slate-200/80 bg-white px-3 py-1">
            <span className="truncate text-center text-[10px] font-medium tabular-nums text-slate-500 sm:text-[11px]">
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
export function HomeFeaturedWebDesignWork({
  variant = "dark",
  heading = "Websites I've Built",
  subhead = "Real businesses, live on the web — built and launched by Topher.",
  sectionId = "real-work",
}: HomeFeaturedWebDesignWorkProps) {
  const isLight = variant === "light";
  const h2 = isLight ? mmsH2 : h2Dark;
  const body = isLight ? bodyLight : bodyDark;
  const sectionClass = isLight
    ? "border-y border-slate-200/60 bg-gradient-to-b from-white via-[#faf9f6] to-[#f4f3ef]"
    : "home-band home-band--deep border-y border-[rgba(232,253,245,0.08)]";

  return (
    <section
      id={sectionId}
      className={sectionClass}
      aria-labelledby="featured-web-design-heading"
    >
      <div className={cn(shell, isLight ? mmsSectionY : sectionY)}>
        <h2 id="featured-web-design-heading" className={cn("home-reveal home-section-title max-w-[900px]", h2)}>
          {heading}
        </h2>
        <p className={cn("home-reveal mt-6 max-w-[42rem] text-sm md:text-base leading-relaxed", body)}>{subhead}</p>

        <div
          className={cn(
            "home-reveal mt-14 grid grid-cols-1 gap-12 md:mt-16 md:gap-16 lg:gap-20",
            projectCount === 1 ? "md:mx-auto md:max-w-4xl" : "md:grid-cols-2",
          )}
        >
          {LIVE_WEB_PROJECTS.map((project, index) => (
            <article
              key={project.analyticsId}
              className={cn(
                "flex min-w-0 flex-col gap-6",
                isLight && cn(mmsCard, "p-6 sm:p-8"),
              )}
            >
              <BrowserShowcasePreview hostname={project.hostname} theme={variant}>
                <div
                  className={cn(
                    "relative w-full overflow-hidden",
                    isLight ? "bg-slate-100" : "bg-[#0a0d0c]",
                    /* Portrait live captures read better in a taller frame on small screens; widen at md+ */
                    "aspect-[10/16] min-h-[220px] sm:aspect-[4/5] sm:min-h-[260px] md:aspect-[16/9] md:min-h-[320px] lg:min-h-[min(440px,40vw)]",
                  )}
                >
                  <Image
                    src={project.previewSrc}
                    alt={project.previewAlt}
                    fill
                    priority={index === 0}
                    quality={88}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 760px"
                    className={project.imageClassName}
                    style={{ objectPosition: project.objectPosition }}
                  />
                </div>
              </BrowserShowcasePreview>

              <div className="flex flex-col gap-3 px-0.5">
                <h3
                  className={cn(
                    "text-xl font-bold tracking-tight md:text-2xl lg:text-[1.65rem]",
                    isLight ? "text-slate-900" : "text-[#E8FDF5]",
                  )}
                >
                  {project.title}
                </h3>
                <p className={cn("text-sm leading-relaxed md:text-[15px]", body)}>{project.pitch}</p>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
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
                      isLight ? cn(mmsBtnSecondary) : "home-btn-secondary--hero rounded-xl",
                    )}
                  >
                    View live site
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  </a>
                  <Link
                    href="/free-mockup"
                    onClick={() =>
                      trackPublicEvent("public_contact_cta_click", {
                        location: "web_design",
                        target: "free_mockup",
                        section: "featured_web_design_card",
                        project: project.analyticsId,
                      })
                    }
                    className={cn(
                      "inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-5 text-center text-[0.9rem] font-semibold leading-snug no-underline sm:flex-initial sm:text-[0.9375rem]",
                      isLight ? cn(mmsBtnPrimary, "rounded-xl") : "home-btn-primary home-btn-primary--hero text-[#0c0e0d] rounded-xl",
                    )}
                  >
                    Get a free mockup
                    <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          className={cn(
            "home-reveal mt-16 flex flex-col items-start gap-4 border-t pt-10 md:flex-row md:items-center md:justify-between",
            isLight ? "border-slate-200/70" : "border-[rgba(232,253,245,0.08)]",
          )}
        >
          <p className={cn("max-w-xl text-sm md:text-[15px]", body)}>
            Want something like this for your business? Start with a free homepage preview.
          </p>
          <Link
            href="/website-samples"
            className={cn(
              "text-[0.9375rem] font-semibold underline-offset-4 hover:underline",
              isLight ? "text-amber-900" : "text-[#00FFB2] hover:text-[#35ffc1]",
            )}
          >
            Browse all web samples →
          </Link>
        </div>
      </div>
    </section>
  );
}
