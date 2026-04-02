"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { publicBodyMutedClass, publicShellClass } from "@/lib/public-brand";
import { trackPublicEvent } from "@/lib/public-analytics";
import { cn } from "@/lib/utils";

const PROJECTS = [
  {
    badge: "Local Business Example",
    title: "Fresh Cut Property Care",
    description:
      "A clean, lead-focused website built for a local lawn care business — designed to generate calls and make services clear.",
    url: "https://freshcutpropertycare.com",
    analyticsId: "fresh_cut_property_care",
    featured: true,
  },
  {
    badge: "Creative Example",
    title: "Deep Well Audio",
    description:
      "A modern, brand-focused site built for a music/audio project — focused on atmosphere and clean design.",
    url: "https://deepwellaudio.com",
    analyticsId: "deep_well_audio",
    featured: false,
  },
] as const;

const shell = publicShellClass;
const sectionY = "py-20 md:py-28";
const h2 =
  "text-3xl md:text-4xl lg:text-[2.85rem] font-semibold tracking-tight text-[#E8FDF5] lg:leading-[1.08]";
const body = publicBodyMutedClass;

export function HomeDeepWellShowcase() {
  return (
    <section
      id="real-work"
      className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]"
      aria-labelledby="real-work-heading"
    >
      <div className={cn(shell, sectionY)}>
        <h2
          id="real-work-heading"
          className={cn("home-reveal home-section-title mx-auto max-w-[760px] text-center", h2)}
        >
          Real Work. Real Builds.
        </h2>
        <p
          className={cn(
            "home-reveal mx-auto mt-5 max-w-[42rem] text-center text-base md:text-[17px] leading-relaxed",
            body,
          )}
        >
          Here are real websites I&apos;ve built — designed to look sharp, load fast, and represent the business
          well.
        </p>

        <div className="home-reveal mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {PROJECTS.map((project) => (
            <div
              key={project.analyticsId}
              className={cn(
                "home-card home-card--glass flex h-full flex-col rounded-2xl p-6 md:p-8 transition-[transform,box-shadow] duration-200 hover:-translate-y-1",
                project.featured
                  ? "ring-1 ring-[rgba(232,149,92,0.38)] shadow-[0_0_0_1px_rgba(201,97,44,0.2)]"
                  : "",
              )}
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#e09a5a]">{project.badge}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#E8FDF5] md:text-2xl">{project.title}</h3>
              <p className={cn("mt-3 flex-1 text-sm leading-relaxed md:text-[15px]", body)}>{project.description}</p>
              <div className="mt-8 flex flex-col gap-3">
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
                  className="home-btn-primary home-btn-primary--hero inline-flex min-h-[52px] w-full items-center justify-center gap-2 font-semibold text-[#0c0e0d] no-underline"
                >
                  Get My Free Website Preview
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="home-reveal mx-auto mt-12 max-w-xl text-center md:mt-14">
          <p className={cn("text-base md:text-[17px]", body)}>Want something like this for your business?</p>
          <Link
            href="/free-mockup"
            onClick={() =>
              trackPublicEvent("public_contact_cta_click", {
                location: "web_design",
                target: "free_mockup",
                section: "real_work_footer",
              })
            }
            className="home-btn-primary home-btn-primary--hero mx-auto mt-6 inline-flex min-h-[52px] w-full max-w-md items-center justify-center gap-2 font-semibold text-[#0c0e0d] no-underline sm:w-auto"
          >
            Get My Free Website Preview
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </section>
  );
}
