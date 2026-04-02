"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
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

export function HomeDeepWellShowcase() {
  return (
    <section
      className="mx-auto mb-16 max-w-6xl md:mb-24"
      aria-labelledby="real-work-heading"
    >
      <div className="home-gateway-pop text-center">
        <h2
          id="real-work-heading"
          className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
        >
          Real Work. Real Builds.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          Here are real websites I&apos;ve built — designed to look sharp, load fast,
          and actually represent the business.
        </p>
      </div>

      <div className="home-gateway-pop mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {PROJECTS.map((project) => (
          <motion.div
            key={project.analyticsId}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.18 }}
            className="min-w-0"
          >
            <Card
              className={cn(
                "h-full overflow-hidden rounded-[28px] bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl",
                project.featured
                  ? "border border-[rgba(232,149,92,0.38)] ring-1 ring-[rgba(201,97,44,0.28)]"
                  : "border border-[rgba(232,149,92,0.22)]",
              )}
            >
              <CardContent className="flex h-full flex-col p-5 text-left md:p-6">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#e8a065]/90">
                  {project.badge}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-white md:text-2xl">
                  {project.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300 md:text-base">
                  {project.description}
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackPublicEvent("public_external_project_click", {
                        location: "gateway",
                        section: "real_work",
                        project: project.analyticsId,
                      })
                    }
                    className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl border border-white/18 bg-black/25 px-6 py-3 text-sm font-semibold text-slate-100 no-underline transition hover:border-[rgba(232,149,92,0.35)] hover:bg-black/35"
                  >
                    View Website
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  </a>
                  <Link
                    href="/free-mockup"
                    onClick={() =>
                      trackPublicEvent("public_contact_cta_click", {
                        location: "gateway",
                        target: "free_mockup",
                        section: "real_work_card",
                        project: project.analyticsId,
                      })
                    }
                    className="btn gold inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl px-8 py-6 text-base font-semibold no-underline"
                  >
                    Get My Free Website Preview{" "}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="home-gateway-pop mx-auto mt-10 max-w-xl text-center">
        <p className="text-base leading-relaxed text-slate-300">
          Want something like this for your business?
        </p>
        <Link
          href="/free-mockup"
          onClick={() =>
            trackPublicEvent("public_contact_cta_click", {
              location: "gateway",
              target: "free_mockup",
              section: "real_work_footer",
            })
          }
          className="btn gold mt-6 inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl px-8 py-6 text-base font-semibold no-underline sm:w-auto"
        >
          Get My Free Website Preview <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
