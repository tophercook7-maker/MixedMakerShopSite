import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import {
  getShowcasePrimaryCtaLabel,
  LIVE_WEB_PROJECTS,
  type LiveWebProject,
} from "@/lib/live-web-projects";
import {
  mmsBullet,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsCtaPanel,
  mmsEyebrow,
  mmsGlassPanel,
  mmsGlassPanelDense,
  mmsH2,
  mmsLead,
  mmsSectionBorder,
  mmsSectionY,
  mmsTextLink,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const pageBand = cn("border-b", mmsSectionBorder, "max-md:bg-[#0f100e]/96", "md:bg-transparent");

function contactNeedHref(need: string) {
  return `/contact?need=${encodeURIComponent(need)}`;
}

const STRAINSPOTTER_VIDEO_SRC = "/videos/strainspotter_ad_v2.mp4";
const STRAINSPOTTER_VIDEO_FILENAME = "strainspotter_ad_v2.mp4";
const STRAINSPOTTER_SCANNER_STILL_SRC = "/images/showcase/strainspotter-scanner.png";

const HENRY_AI_HOME_SRC = "/images/showcase/henry-ai-home.png";
const HENRY_AI_MODES_SRC = "/images/showcase/henry-ai-modes.png";
const HENRY_AI_COST_DASHBOARD_SRC = "/images/showcase/henry-ai-cost-dashboard.png";

const strainspotterVideoAbs = path.join(
  process.cwd(),
  "public",
  "videos",
  STRAINSPOTTER_VIDEO_FILENAME,
);
const hasStrainspotterVideo = fs.existsSync(strainspotterVideoAbs);

/** Polished fallback when a dedicated screenshot or video asset is not published yet. */
function VisualProofPlaceholder({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        mmsGlassPanelDense,
        "relative flex min-h-[168px] flex-col justify-center gap-3 overflow-hidden p-6 sm:min-h-[180px] sm:p-7",
        "bg-gradient-to-br from-[#fbf9f4] via-[#f4f1ea] to-[#e8efe8]/95",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_80%_at_20%_0%,rgba(184,92,30,0.06),transparent_55%)]",
        className,
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a4b2a]">{title}</p>
      <p className="text-sm leading-relaxed text-[#354239] md:text-[15px]">{description}</p>
    </div>
  );
}

function WebProjectQuickCard({ project }: { project: LiveWebProject }) {
  return (
    <article className={cn(mmsGlassPanelDense, "flex h-full flex-col p-6 sm:p-7")}>
      <span className="inline-flex w-fit max-w-full rounded-full border border-[#3f5a47]/22 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f5a47]">
        {project.tag}
      </span>
      <p className={cn(mmsEyebrow, "mt-3 !text-[#3f5a47] !text-[10px] md:!text-[11px]")}>Web project</p>
      <h3 className="mt-2 text-lg font-bold tracking-tight text-[#1e241f] md:text-xl">{project.title}</h3>
      <p className="mt-1 font-mono text-[11px] font-medium text-[#5a6a62] md:text-xs">https://{project.hostname}</p>
      <p className="mt-4 text-[15px] font-semibold leading-snug text-[#2d3a33]">{project.primaryLine}</p>
      {project.context ? (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#354239]">{project.context}</p>
      ) : (
        <div className="flex-1" aria-hidden />
      )}
      <div className="mt-6 flex flex-col gap-3 border-t border-[#3f5a47]/10 pt-5 sm:flex-row sm:flex-wrap">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            mmsBtnPrimary,
            "inline-flex min-h-[2.85rem] flex-1 items-center justify-center gap-2 px-5 text-[0.9rem] no-underline hover:no-underline sm:flex-initial",
          )}
        >
          {getShowcasePrimaryCtaLabel(project)}
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
        </a>
        <TrackedPublicLink
          href={contactNeedHref(
            `[Builds / Web project: ${project.title}] I'd like something similar. Brief idea: `,
          )}
          eventName="public_contact_cta_click"
          eventProps={{ location: "builds_web_project", intent: "similar", project: project.analyticsId }}
          className={cn(
            mmsBtnSecondary,
            "inline-flex min-h-[2.85rem] flex-1 items-center justify-center px-5 text-[0.9rem] no-underline hover:no-underline sm:flex-initial",
          )}
        >
          Request similar
        </TrackedPublicLink>
      </div>
    </article>
  );
}

export function BuildsPage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={pageBand} aria-labelledby="builds-page-title">
          <div className={cn(shell, mmsSectionY, "max-w-4xl")}>
            <div className={cn(mmsGlassPanelDense, "p-8 sm:p-10")}>
              <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>MixedMakerShop</p>
              <h1 id="builds-page-title" className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#1e241f] md:text-5xl">
                Builds
              </h1>
              <p className={cn(mmsLead, "mt-7 max-w-2xl font-semibold text-[#2d3a33]")}>
                The full library of what I&apos;m building — websites, AI tools, experiments, and practical work — organized in
                one place.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
                Browse by section below. Want something like what you see? Use the links to request a build, send feedback, or
                start with a web preview.
              </p>
            </div>
          </div>
        </section>

        {/* A. Web projects */}
        <section id="builds-web-projects" className={pageBand} aria-labelledby="builds-web-projects-heading">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn(mmsGlassPanelDense, "max-w-3xl p-6 sm:p-8")}>
              <h2 id="builds-web-projects-heading" className={mmsH2}>
                Web projects
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#354239] md:text-base">
                Live client sites and a product-style web app — Fresh Cut Property Care, Deep Well Audio, and StrainSpotter.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-8">
              {LIVE_WEB_PROJECTS.map((project) => (
                <WebProjectQuickCard key={project.analyticsId} project={project} />
              ))}
            </div>

            {/* StrainSpotter — deeper context (same web project, more detail) */}
            <div className="mt-12 lg:mt-16">
              <div
                className={cn(
                  mmsGlassPanelDense,
                  "relative overflow-hidden p-8 sm:p-10 lg:p-12",
                  "shadow-[0_32px_80px_-40px_rgba(30,36,31,0.35)]",
                )}
              >
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#b85c1e]/10 blur-3xl"
                  aria-hidden
                />
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1.08fr)] lg:gap-14 lg:items-start">
                  <div className="relative min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Web project · AI-powered</p>
                      <span className="rounded-full border border-[#3f5a47]/18 bg-[#ece7dd]/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2f3e34]">
                        In motion
                      </span>
                    </div>
                    <h3
                      id="build-spotlight-strainspotter"
                      className={cn(mmsH2, "mt-5 scroll-mt-28 !text-2xl md:!text-[2rem]")}
                    >
                      StrainSpotter — in depth
                    </h3>
                    <p className="mt-5 text-lg font-semibold leading-snug text-[#1e241f] md:text-xl">
                      An AI-powered cannabis identification and companion platform.
                    </p>
                    <p className="mt-6 text-base leading-relaxed text-[#2d3a33] md:text-[17px]">
                      The focus is practical: help someone go from a question (&quot;what is this?&quot;) to structured strain
                      context — genetics, effects, sourcing hooks — without drowning them in noise. The UI is intentionally
                      glassy and calm so dense data still feels scannable.
                    </p>
                    <p className="mt-5 text-base leading-relaxed text-[#354239]">
                      Public demo surfaces come and go; the story here is{" "}
                      <strong className="font-semibold text-[#1e241f]">product thinking</strong>: identification flows,
                      catalogs, vendor discovery, and a cohesive &quot;Garden&quot; layer that ties sessions together.
                    </p>

                    <div className={cn(mmsGlassPanel, "mt-8 p-6 md:p-7")}>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4b2a]">What it covers</p>
                      <ul className="mt-4 space-y-3 text-[15px] leading-snug text-[#2d3a33] md:text-[16px]">
                        {[
                          "AI strain scanning (photo-first identification path)",
                          "Strain database + discovery (effects, lineage, compare)",
                          "Seed vendor directory (filterable discovery, not a random link dump)",
                          "Favorites, journal, and lightweight habit tracking",
                          "Garden / dashboard layer — ecosystem view of ongoing use",
                        ].map((line) => (
                          <li key={line} className="flex gap-3">
                            <span className={mmsBullet} aria-hidden>
                              ·
                            </span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3">
                      <a
                        href="https://strainspotter.replit.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          mmsBtnPrimary,
                          "inline-flex min-h-[3rem] items-center justify-center gap-2 px-8 no-underline hover:no-underline",
                        )}
                      >
                        Open live demo
                        <ExternalLink className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                      </a>
                      <TrackedPublicLink
                        href={contactNeedHref(
                          "[Builds / StrainSpotter] I'd like to request something inspired by this build. ",
                        )}
                        eventName="public_contact_cta_click"
                        eventProps={{ location: "builds_spotlight", build: "strainspotter", intent: "request" }}
                        className={cn(
                          mmsBtnSecondary,
                          "inline-flex min-h-[3rem] items-center px-6 no-underline hover:no-underline",
                        )}
                      >
                        Request something similar
                      </TrackedPublicLink>
                    </div>
                    <p className="mt-6 border-l-2 border-[#b85c1e]/40 pl-4 text-sm font-medium text-[#5a6a62]">
                      Live demos can change as the product evolves — the link reflects current direction and UX.
                    </p>
                  </div>

                  <div className="min-w-0 space-y-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3f5a47]">
                        Visual system map
                      </p>
                      <p className="mt-2 text-sm text-[#4a5750]">
                        Video anchors the scanner story; stills lock in database, vendors, and dashboard depth.
                      </p>
                    </div>
                    {hasStrainspotterVideo ? (
                      <div
                        className={cn(
                          "overflow-hidden rounded-[1.15rem] border border-[#3f5a47]/20",
                          "bg-[#1e241f]/95 shadow-[0_28px_64px_-28px_rgba(30,36,31,0.45)] ring-1 ring-[#b85c1e]/18",
                        )}
                      >
                        <div className="relative aspect-video w-full bg-[#0f1412]">
                          <video
                            className="absolute inset-0 h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster={STRAINSPOTTER_SCANNER_STILL_SRC}
                            aria-label="StrainSpotter — scanner and UI preview"
                          >
                            <source src={STRAINSPOTTER_VIDEO_SRC} type="video/mp4" />
                          </video>
                        </div>
                        <p className="border-t border-[#3f5a47]/12 bg-[#1a221e]/90 px-4 py-3 text-center text-[11px] font-medium text-[#e8e0d6]">
                          StrainSpotter — product preview (motion)
                        </p>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "overflow-hidden rounded-[1.15rem] border border-[#3f5a47]/20",
                          "bg-[#1e241f]/95 shadow-[0_28px_64px_-28px_rgba(30,36,31,0.45)] ring-1 ring-[#b85c1e]/18",
                        )}
                      >
                        <Image
                          src={STRAINSPOTTER_SCANNER_STILL_SRC}
                          alt="StrainSpotter — Scanner upload flow and Garden tools (product screenshot)"
                          width={880}
                          height={340}
                          className="h-auto w-full object-cover"
                          sizes="(min-width: 1024px) 520px, 100vw"
                        />
                        <p className="border-t border-[#3f5a47]/12 bg-[#1a221e]/90 px-4 py-3 text-center text-[11px] font-medium text-[#e8e0d6]">
                          StrainSpotter — product preview (still)
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <VisualProofPlaceholder
                        title="Strain database"
                        description="Strain cards, filters, and discovery — built to stay scannable even when data is dense."
                        className="min-h-[200px] sm:min-h-[220px]"
                      />
                      <VisualProofPlaceholder
                        title="Vendor discovery"
                        description="Directory-style exploration for sources and partners — structured, not a random link list."
                        className="min-h-[200px] sm:min-h-[220px]"
                      />
                      <VisualProofPlaceholder
                        title="Garden / dashboard"
                        description="A calmer ecosystem view that ties sessions, favorites, and ongoing use together."
                        className="col-span-1 min-h-[200px] sm:col-span-2 sm:min-h-[220px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* B. AI / tools */}
        <section id="builds-ai-tools" className={pageBand} aria-labelledby="builds-ai-tools-heading">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn(mmsGlassPanelDense, "max-w-3xl p-6 sm:p-8")}>
              <h2 id="builds-ai-tools-heading" className={mmsH2}>
                AI / tools
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#354239] md:text-base">
                Assistant and workspace concepts — deeper than a marketing page, still practical for real work.
              </p>
            </div>

            <div className="mt-10 lg:mt-12">
              <div
                className={cn(
                  mmsGlassPanelDense,
                  "relative overflow-hidden p-8 sm:p-10 lg:p-12",
                  "shadow-[0_32px_80px_-40px_rgba(30,36,31,0.22)]",
                )}
              >
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14 lg:items-start">
                  <div className="min-w-0 space-y-4 lg:order-1">
                    <figure
                      className={cn(
                        "overflow-hidden rounded-[1.15rem] border border-[#3f5a47]/18",
                        "bg-[#0a0c10] shadow-[0_28px_64px_-28px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06]",
                      )}
                    >
                      <Image
                        src={HENRY_AI_HOME_SRC}
                        alt="Henry AI — home screen with starter actions and chat entry"
                        width={1024}
                        height={634}
                        className="h-auto w-full object-cover object-top"
                        sizes="(min-width: 1024px) min(520px, 48vw), 100vw"
                        priority
                      />
                      <figcaption className="border-t border-white/[0.06] bg-[#12151c]/95 px-4 py-2.5 text-center text-[11px] font-medium text-[#c8d0dc]">
                        Home · starter actions
                      </figcaption>
                    </figure>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <figure
                        className={cn(
                          "overflow-hidden rounded-xl border border-[#3f5a47]/16",
                          "bg-[#0a0c10] shadow-md ring-1 ring-white/[0.05]",
                        )}
                      >
                        <Image
                          src={HENRY_AI_MODES_SRC}
                          alt="Henry AI — Modes screen with built-in operating modes"
                          width={1024}
                          height={631}
                          className="h-auto w-full object-cover object-top"
                          sizes="(min-width: 640px) 260px, 100vw"
                        />
                        <figcaption className="border-t border-white/[0.06] bg-[#12151c]/95 px-3 py-2 text-center text-[10px] font-medium text-[#aeb8c4]">
                          Modes
                        </figcaption>
                      </figure>
                      <figure
                        className={cn(
                          "overflow-hidden rounded-xl border border-[#3f5a47]/16",
                          "bg-[#0a0c10] shadow-md ring-1 ring-white/[0.05]",
                        )}
                      >
                        <Image
                          src={HENRY_AI_COST_DASHBOARD_SRC}
                          alt="Henry AI — Cost Dashboard for AI provider spend"
                          width={1024}
                          height={631}
                          className="h-auto w-full object-cover object-top"
                          sizes="(min-width: 640px) 260px, 100vw"
                        />
                        <figcaption className="border-t border-white/[0.06] bg-[#12151c]/95 px-3 py-2 text-center text-[10px] font-medium text-[#aeb8c4]">
                          Cost dashboard
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <div className="relative min-w-0 lg:order-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Henry AI</p>
                      <span className="rounded-full border border-[#3f5a47]/18 bg-[#f4f1ea] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2f3e34]">
                        Active build
                      </span>
                    </div>
                    <h3
                      id="build-spotlight-henry"
                      className={cn(mmsH2, "mt-5 scroll-mt-28 !text-2xl md:!text-[2rem]")}
                    >
                      Henry AI
                    </h3>
                    <p className="mt-5 text-lg font-semibold leading-snug text-[#1e241f] md:text-xl">
                      A practical AI workspace built for organization, workflows, and real business use.
                    </p>
                    <p className="mt-6 text-base leading-relaxed text-[#2d3a33] md:text-[17px]">
                      Henry AI is the &quot;what if your tools actually cooperated&quot; experiment: fewer tabs, clearer
                      handoffs, and assistant-style help that respects how owners actually work — not how slide decks imagine
                      they work.
                    </p>
                    <p className="mt-5 text-base leading-relaxed text-[#354239]">
                      It&apos;s also a statement about depth behind MixedMakerShop: the same person sketching your marketing
                      site can reason about state, prompts, and workflow boundaries when you need software — not just pages.
                    </p>

                    <div className={cn(mmsGlassPanel, "mt-8 p-6 md:p-7")}>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4b2a]">Capability signals</p>
                      <ul className="mt-4 space-y-3 text-[15px] text-[#2d3a33] md:text-[16px]">
                        {[
                          "AI workspace / assistant direction (grounded prompts, not toy chat)",
                          "Workflow and systems thinking (what connects to what, and why)",
                          "Business-facing surfaces: checklists, summaries, handoff clarity",
                          "Structured build habits: component boundaries, realistic scope",
                        ].map((line) => (
                          <li key={line} className="flex gap-3 leading-snug">
                            <span className={mmsBullet} aria-hidden>
                              ·
                            </span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <TrackedPublicLink
                        href={contactNeedHref(
                          "[Builds / Henry AI] I'd like to discuss a similar AI workspace or automation idea. ",
                        )}
                        eventName="public_contact_cta_click"
                        eventProps={{ location: "builds_spotlight", build: "henry_ai", intent: "request" }}
                        className={cn(
                          mmsBtnPrimary,
                          "inline-flex min-h-[3rem] w-full justify-center px-8 no-underline hover:no-underline sm:w-auto",
                        )}
                      >
                        Request something similar
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href={contactNeedHref("[Builds / Henry AI] Feedback on Henry AI / this section: ")}
                        eventName="public_contact_cta_click"
                        eventProps={{ location: "builds_spotlight", build: "henry_ai", intent: "feedback" }}
                        className={cn(mmsTextLink, "self-center text-[14px] font-semibold sm:px-2")}
                      >
                        Send feedback
                      </TrackedPublicLink>
                    </div>

                    <p className="mt-8 border-l-2 border-[#3f5a47]/25 pl-4 text-sm font-medium text-[#5a6a62]">
                      Positioned as a serious build lane — custom software thinking, not a generic chat wrapper.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* C. Experiments / samples */}
        <section id="builds-experiments" className={pageBand} aria-labelledby="builds-experiments-heading">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn(mmsGlassPanelDense, "p-8 sm:p-10")}>
              <h2 id="builds-experiments-heading" className={mmsH2}>
                Experiments / samples
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#354239] md:text-base">
                Website demos, mockup flows, and lightweight tools — good for seeing layout and messaging ideas without digging
                through the whole library.
              </p>
              <ul className="mt-8 space-y-3 text-[15px] text-[#2d3a33] md:text-[16px]">
                <li className="flex gap-2">
                  <span className={mmsBullet} aria-hidden>
                    ·
                  </span>
                  <Link href="/website-samples" className={cn(mmsTextLink, "font-semibold")}>
                    Layout demos — browse demo layouts
                  </Link>
                </li>
                <li className="flex gap-2">
                  <span className={mmsBullet} aria-hidden>
                    ·
                  </span>
                  <TrackedPublicLink
                    href={publicFreeMockupFunnelHref}
                    eventName="public_contact_cta_click"
                    eventProps={{ location: "builds_experiments", target: "free_mockup" }}
                    className={cn(mmsTextLink, "font-semibold")}
                  >
                    Get My Free Preview
                  </TrackedPublicLink>
                </li>
                <li className="flex gap-2">
                  <span className={mmsBullet} aria-hidden>
                    ·
                  </span>
                  <Link href="/tools" className={cn(mmsTextLink, "font-semibold")}>
                    Digital tools hub
                  </Link>
                </li>
                <li className="flex gap-2">
                  <span className={mmsBullet} aria-hidden>
                    ·
                  </span>
                  <Link href="/website-roast" className={cn(mmsTextLink, "font-semibold")}>
                    Website Roast
                  </Link>
                  <span className="text-[#5a6a62]">·</span>
                  <Link href="/free-website-check" className={cn(mmsTextLink, "font-semibold")}>
                    Website Check
                  </Link>
                </li>
              </ul>
              <TrackedPublicLink
                href={contactNeedHref("[Builds / Experiments & samples] I want a custom concept or sample direction. ")}
                eventName="public_contact_cta_click"
                eventProps={{ location: "builds_experiments", intent: "custom" }}
                className={cn(mmsBtnSecondary, "mt-10 inline-flex px-6 py-3 no-underline hover:no-underline")}
              >
                Ask for a custom build
              </TrackedPublicLink>
            </div>
          </div>
        </section>

        {/* D. 3D printing (quiet) */}
        <section id="builds-3d-printing" className={pageBand} aria-labelledby="builds-3d-heading">
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <div className={cn(mmsGlassPanelDense, "p-8 sm:p-10")}>
              <h2 id="builds-3d-heading" className={cn(mmsH2, "!text-2xl md:!text-[1.85rem]")}>
                3D printing
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#354239] md:text-base">
                Custom parts, prototypes, and practical prints live here as part of the broader build library — not the main
                public offer, but available when you need something physical made.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/3d-printing" className={cn(mmsTextLink, "text-[15px] font-semibold")}>
                  3D printing overview →
                </Link>
                <TrackedPublicLink
                  href={contactNeedHref("[Builds / 3D printing] I need a print or custom part. ")}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "builds_3d", intent: "request" }}
                  className={cn(mmsTextLink, "text-[15px] font-semibold")}
                >
                  Request a print
                </TrackedPublicLink>
              </div>
            </div>
          </div>
        </section>

        <section className={cn("border-t", pageBand, "max-md:bg-gradient-to-b max-md:from-[#e8e3da] max-md:to-[#dcd6cc]")}>
          <div className={cn(shell, "py-20 md:py-24")}>
            <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
              <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Most projects still start with a website</h2>
              <p className="mx-auto mt-5 max-w-lg font-medium text-[#2d3a33] md:text-lg">
                Builds is for browsing everything else — when you&apos;re ready to convert, start with web design or a free
                preview.
              </p>
              <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                <TrackedPublicLink
                  href="/web-design"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "builds_footer_cta", target: "web_design" }}
                  className={cn(
                    mmsBtnPrimary,
                    "w-full justify-center px-10 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                  )}
                >
                  Web Design
                </TrackedPublicLink>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "builds_footer_cta", target: "free_mockup" }}
                  className={cn(
                    mmsBtnSecondary,
                    "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                  )}
                >
                  Free Preview
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "builds_footer_cta", target: "contact_topher" }}
                  className={cn(
                    mmsBtnSecondary,
                    "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                  )}
                >
                  Contact
                </TrackedPublicLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
