"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { publicBodyMutedClass, publicShellClass } from "@/lib/public-brand";
import { trackPublicEvent } from "@/lib/public-analytics";
import { cn } from "@/lib/utils";

const PROJECTS = [
  {
    title: "Deep Well Audio",
    primary: "Designed to hold attention and keep people engaged—not just look good",
    supporting: "Focused on clarity, depth, and a structure that makes people stay and explore",
    previewSrc: "/images/showcase/deep-well-audio.jpg",
    previewAlt:
      "Homepage preview of Deep Well Audio — typography and hero art from the live music site",
    hostname: "deepwellaudio.com",
    url: "https://deepwellaudio.com",
    analyticsId: "deep_well_audio",
    objectPosition: "center 8%",
    imageClassName: "object-cover",
  },
  {
    title: "Fresh Cut Property Care",
    primary: "Built to turn local visitors into real calls and booked jobs",
    supporting: "Clear services, fast load, and a layout that makes contacting you simple",
    previewSrc: "/images/freshcut-new.png",
    previewAlt: "Homepage preview of Fresh Cut Property Care — lawn care hero and call-to-action",
    hostname: "freshcutpropertycare.com",
    url: "https://freshcutpropertycare.com",
    analyticsId: "fresh_cut_property_care",
    objectPosition: "center center",
    imageClassName: "object-cover",
  },
] as const;

const shell = publicShellClass;
const sectionY = "py-20 md:py-28";
const h2 =
  "text-3xl md:text-4xl lg:text-[2.85rem] font-semibold tracking-tight text-[#E8FDF5] lg:leading-[1.08]";
const body = publicBodyMutedClass;

function BrowserShowcasePreview({
  hostname,
  children,
}: {
  hostname: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-[#0c100f] shadow-[0_28px_72px_rgba(0,0,0,0.42)]",
        "border border-white/[0.11] ring-1 ring-black/30",
      )}
    >
      <div
        className="flex h-11 shrink-0 items-center gap-2 border-b border-white/[0.07] bg-[#131916] px-3 sm:h-12 sm:px-4"
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

export function HomeDeepWellShowcase() {
  return (
    <section
      id="real-work"
      className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]"
      aria-labelledby="real-work-heading"
    >
      <div className={cn(shell, sectionY)}>
        <p
          className={cn(
            "home-reveal mx-auto max-w-[40rem] text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e09a5a]/95 md:text-xs",
          )}
        >
          No templates. No guessing. Built around your business.
        </p>
        <h2
          id="real-work-heading"
          className={cn("home-reveal home-section-title mx-auto mt-5 max-w-[760px] text-center", h2)}
        >
          See the work, not just the description
        </h2>
        <p
          className={cn(
            "home-reveal mx-auto mt-5 max-w-[42rem] text-center text-base md:text-[17px] leading-relaxed",
            body,
          )}
        >
          These are real websites—shown the way people actually experience them.
        </p>

        <div
          className={cn(
            "home-reveal mt-14 grid grid-cols-1 gap-12 md:gap-10 lg:gap-12",
            PROJECTS.length === 1 ? "md:mx-auto md:max-w-4xl" : "md:grid-cols-2",
          )}
        >
          {PROJECTS.map((project, index) => (
            <article key={project.analyticsId} className="flex min-w-0 flex-col gap-5">
              <BrowserShowcasePreview hostname={project.hostname}>
                <div
                  className={cn(
                    "relative w-full overflow-hidden bg-[#0a0d0c]",
                    "aspect-[16/10] min-h-[240px] sm:min-h-[280px] md:aspect-[16/9] md:min-h-[320px] lg:min-h-[min(400px,40vw)]",
                  )}
                >
                  <Image
                    src={project.previewSrc}
                    alt={project.previewAlt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 720px"
                    className={project.imageClassName}
                    style={{ objectPosition: project.objectPosition }}
                  />
                </div>
              </BrowserShowcasePreview>

              <div className="flex flex-col gap-3 px-0.5">
                <h3 className="text-xl font-semibold tracking-tight text-[#E8FDF5] md:text-2xl">{project.title}</h3>
                <p className={cn("text-sm font-medium leading-relaxed text-[#E8FDF5]/95 md:text-[15px]")}>
                  {project.primary}
                </p>
                <p className={cn("text-sm leading-relaxed md:text-[15px]", body)}>{project.supporting}</p>
                <div className="flex flex-col gap-3 pt-2">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackPublicEvent("public_external_project_click", {
                        location: "web_design",
                        section: "real_work",
                        project: project.analyticsId,
                      })
                    }
                    className="home-btn-secondary--hero inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold no-underline"
                  >
                    View Website
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  </a>
                  <Link
                    href="/free-mockup"
                    onClick={() =>
                      trackPublicEvent("public_contact_cta_click", {
                        location: "web_design",
                        target: "free_mockup",
                        section: "real_work_card",
                        project: project.analyticsId,
                      })
                    }
                    className="home-btn-primary home-btn-primary--hero inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-4 text-center text-[0.9rem] font-semibold leading-snug text-[#0c0e0d] no-underline sm:text-[0.9375rem]"
                  >
                    See What Your Website Could Look Like — Free
                    <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="home-reveal mx-auto mt-16 max-w-xl text-center md:mt-20">
          <p className="text-lg font-semibold text-[#E8FDF5] md:text-xl">Want something like this for your business?</p>
          <p className={cn("mx-auto mt-3 max-w-md text-base md:text-[17px]", body)}>
            I&apos;ll show you exactly what your site could look like—before you pay anything
          </p>
          <Link
            href="/free-mockup"
            onClick={() =>
              trackPublicEvent("public_contact_cta_click", {
                location: "web_design",
                target: "free_mockup",
                section: "real_work_footer",
              })
            }
            className="home-btn-primary home-btn-primary--hero mx-auto mt-8 inline-flex min-h-[52px] w-full max-w-md items-center justify-center gap-2 font-semibold text-[#0c0e0d] no-underline sm:w-auto"
          >
            Get My Free Website Preview
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
