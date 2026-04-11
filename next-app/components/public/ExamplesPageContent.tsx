import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FreshCutFeaturedCaseStudy } from "@/components/public/FreshCutFeaturedCaseStudy";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import {
  getShowcasePrimaryCtaLabel,
  getShowcaseSecondaryCtaLabel,
  HENRY_AI_SHOWCASE_PROJECT,
  LIVE_WEB_PROJECTS,
} from "@/lib/live-web-projects";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsGlassPanelDense,
  mmsH2,
  mmsPageBg,
  mmsSectionBorder,
  mmsSectionY,
  mmsTextLink,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const showcaseRows = [...LIVE_WEB_PROJECTS, HENRY_AI_SHOWCASE_PROJECT];

export function ExamplesPageContent() {
  return (
    <div className={mmsPageBg}>
      <section
        className={cn(
          "border-b bg-gradient-to-b from-[#f7f4ee] via-[#ece7dd] to-[#e2dcd0]/90",
          mmsSectionBorder,
        )}
      >
        <div className={cn(shell, mmsSectionY, "max-w-4xl")}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4b2a]">Examples</p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-[#1e241f] md:text-5xl">
            Website samples &amp; live work
          </h1>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            MixedMakerShop is Topher&apos;s studio — web design is the main lane. These projects are built to help
            businesses show up and get calls, not just look good in a screenshot. For layout demos you can explore, see{" "}
            <Link href="/website-samples" className={mmsTextLink}>
              polished sample sites
            </Link>
            .
          </p>
        </div>
      </section>

      <FreshCutFeaturedCaseStudy analyticsLocation="examples_case_study_fresh_cut" />

      <section className={cn("border-b", mmsSectionBorder)}>
        <div className={cn(shell, mmsSectionY)}>
          <h2 className={mmsH2}>Live sites &amp; builds</h2>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            Each project is built to look trustworthy fast and make the next step obvious — usually a call or lead.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {showcaseRows.map((project) => (
              <article key={project.analyticsId} className={cn(mmsGlassPanelDense, "flex h-full flex-col p-6 sm:p-8")}>
                <div
                  className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-[#3f5a47]/12 bg-[#cfd8d0]"
                >
                  <Image
                    src={project.previewSrc}
                    alt={project.previewAlt}
                    fill
                    className={cn(project.imageClassName, "object-cover")}
                    style={{ objectPosition: project.objectPosition }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="mt-6 flex flex-1 flex-col">
                <span
                  className={cn(
                    "inline-flex w-fit max-w-full rounded-full border border-[#3f5a47]/22 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f5a47]",
                  )}
                >
                  {project.tag}
                </span>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-[#1e241f] md:text-2xl">{project.title}</h3>
                <p className="mt-3 text-[15px] font-semibold leading-snug text-[#2d3a33] md:text-base">
                  {project.primaryLine}
                </p>
                {project.context ? (
                  <p className="mt-2 text-sm leading-relaxed text-[#354239] md:text-[15px]">{project.context}</p>
                ) : null}
                <PublicCtaRow className="mt-auto pt-6">
                  {project.primaryCtaIsExternal === false ? (
                    <Link
                      href={project.url}
                      className={cn(
                        mmsBtnPrimary,
                        "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
                      )}
                    >
                      {getShowcasePrimaryCtaLabel(project)}
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  ) : (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        mmsBtnPrimary,
                        "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
                      )}
                    >
                      {getShowcasePrimaryCtaLabel(project)}
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    </a>
                  )}
                  <TrackedPublicLink
                    href="/free-mockup"
                    eventName="public_contact_cta_click"
                    eventProps={{ location: "examples_page", target: "free_mockup", project: project.analyticsId }}
                    className={cn(
                      mmsBtnSecondary,
                      "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
                    )}
                  >
                    {getShowcaseSecondaryCtaLabel(project)}
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </TrackedPublicLink>
                </PublicCtaRow>
                </div>
              </article>
            ))}
          </div>

          <div className={cn(mmsGlassPanelDense, "mx-auto mt-14 max-w-2xl p-8 text-center sm:p-10")}>
            <p className={cn("text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
              Want layout ideas before we talk? Browse polished demos for local businesses — trades, food, churches, and
              more.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
              <TrackedPublicLink
                href="/website-samples"
                eventName="public_web_design_sample_click"
                eventProps={{ location: "examples_page", label: "website_samples_hub" }}
                className={cn(mmsBtnSecondary, "justify-center px-8 no-underline hover:no-underline")}
              >
                Browse sample layouts
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "examples_page", target: "free_mockup" }}
                className={cn(mmsBtnPrimary, "justify-center px-8 no-underline hover:no-underline")}
              >
                Get My Free Preview
              </TrackedPublicLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
