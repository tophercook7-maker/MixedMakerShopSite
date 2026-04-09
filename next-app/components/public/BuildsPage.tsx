/**
 * TODO (your assets): Add media under public/ for StrainSpotter placeholders:
 * - images/builds/: strainspotter-database.jpg, strainspotter-vendors.jpg, strainspotter-garden.jpg
 * - images/builds/: henry-ai-workspace.jpg, henry-ai-assistant.jpg, henry-ai-systems.jpg
 * - Optional: images/showcase/strainspotter.jpg for homepage / cards
 * - videos/strainspotter_ad_v2.mp4 — when present, hero video renders automatically.
 */

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ExternalLink, ImageIcon } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicShellClass } from "@/lib/public-brand";
import { LIVE_WEB_PROJECTS, type LiveWebProject } from "@/lib/live-web-projects";
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

const pageBand = cn("border-b", mmsSectionBorder, "max-md:bg-[#ece7dd]/95", "md:bg-transparent");

function contactNeedHref(need: string) {
  return `/contact?need=${encodeURIComponent(need)}`;
}

const STRAINSPOTTER_VIDEO_SRC = "/videos/strainspotter_ad_v2.mp4";
const STRAINSPOTTER_VIDEO_FILENAME = "strainspotter_ad_v2.mp4";

const strainspotterVideoAbs = path.join(
  process.cwd(),
  "public",
  "videos",
  STRAINSPOTTER_VIDEO_FILENAME,
);
const hasStrainspotterVideo = fs.existsSync(strainspotterVideoAbs);

function MediaSlot({
  file,
  label,
  hint,
  className,
  publicSubdir = "images/builds",
}: {
  file: string;
  label: string;
  hint?: string;
  className?: string;
  publicSubdir?: string;
}) {
  return (
    <div
      className={cn(
        mmsGlassPanelDense,
        "relative flex min-h-[200px] flex-col justify-between gap-3 overflow-hidden p-5 sm:min-h-[220px]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#3f5a47]/14 bg-white/55 text-[#3f5a47] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
          aria-hidden
        >
          <ImageIcon className="h-4 w-4 opacity-90" strokeWidth={2} />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#3f5a47]">{label}</p>
          <p className="mt-1 text-xs font-semibold text-[#1e241f]">Screenshot — add file when ready</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[11px] leading-relaxed text-[#4a5750]">
          Place{" "}
          <code className="rounded bg-white/75 px-1.5 py-0.5 text-[10px] text-[#1e241f]">{file}</code> in{" "}
          <code className="rounded bg-white/75 px-1.5 py-0.5 text-[10px] text-[#1e241f]">
            public/{publicSubdir}/
          </code>
        </p>
        {hint ? <p className="text-[11px] leading-relaxed text-[#5a6a62]">{hint}</p> : null}
      </div>
    </div>
  );
}

function WebProjectQuickCard({ project }: { project: LiveWebProject }) {
  return (
    <article className={cn(mmsGlassPanelDense, "flex h-full flex-col p-6 sm:p-7")}>
      <p className={cn(mmsEyebrow, "!text-[#3f5a47] !text-[10px] md:!text-[11px]")}>Web project</p>
      <h3 className="mt-3 text-lg font-bold tracking-tight text-[#1e241f] md:text-xl">{project.title}</h3>
      <p className="mt-1 font-mono text-[11px] font-medium text-[#5a6a62] md:text-xs">https://{project.hostname}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-[#354239]">{project.pitch}</p>
      <div className="mt-6 flex flex-col gap-2 border-t border-[#3f5a47]/10 pt-5 sm:flex-row sm:flex-wrap">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            mmsBtnPrimary,
            "inline-flex min-h-[2.85rem] flex-1 items-center justify-center gap-2 px-5 text-[0.9rem] no-underline hover:no-underline sm:flex-initial",
          )}
        >
          {project.primaryCtaLabel ?? "View live"}
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
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
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
                      Demo environments shift; treat the link as a living preview of direction — not a final packaging claim.
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
                            aria-label="StrainSpotter — scanner and UI preview"
                          >
                            <source src={STRAINSPOTTER_VIDEO_SRC} type="video/mp4" />
                          </video>
                        </div>
                        <p className="border-t border-white/10 bg-black/28 px-4 py-3 text-center text-[11px] font-medium text-[#e8e0d6]">
                          Motion:{" "}
                          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                            public/videos/{STRAINSPOTTER_VIDEO_FILENAME}
                          </code>
                        </p>
                      </div>
                    ) : (
                      <MediaSlot
                        file={STRAINSPOTTER_VIDEO_FILENAME}
                        label="Motion preview"
                        hint="Hero clip for the scanner story (.mp4)."
                        publicSubdir="videos"
                        className="min-h-[220px] sm:min-h-[240px]"
                      />
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <MediaSlot
                        file="strainspotter-database.jpg"
                        label="Database"
                        hint="Strain cards, filters, or discovery UI."
                        className="min-h-[200px] sm:min-h-[220px]"
                      />
                      <MediaSlot
                        file="strainspotter-vendors.jpg"
                        label="Vendors"
                        hint="Directory, detail, or map-style vendor exploration."
                        className="min-h-[200px] sm:min-h-[220px]"
                      />
                      <MediaSlot
                        file="strainspotter-garden.jpg"
                        label="Garden / dashboard"
                        hint="Ecosystem overview — wide crop works best."
                        className="col-span-1 min-h-[200px] sm:col-span-2 sm:min-h-[240px]"
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
                  <div className="min-w-0 space-y-6 lg:order-1">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3f5a47]">
                        Henry AI · visual proof grid
                      </p>
                      <p className="mt-2 text-sm text-[#4a5750]">
                        Three slots: overview, assistant surface, and a wide systems shot that shows how pieces connect.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <MediaSlot
                        file="henry-ai-workspace.jpg"
                        label="Workspace"
                        hint="Shell layout, panels, navigation."
                        className="min-h-[220px] sm:min-h-[240px]"
                      />
                      <MediaSlot
                        file="henry-ai-assistant.jpg"
                        label="Assistant / tools"
                        hint="Chat, actions, or task-focused UI."
                        className="min-h-[220px] sm:min-h-[240px]"
                      />
                      <MediaSlot
                        file="henry-ai-systems.jpg"
                        label="Workflows / systems"
                        hint="Diagram-style or multi-pane — show the system, not just a hero."
                        className="col-span-1 min-h-[200px] sm:col-span-2 sm:min-h-[260px]"
                      />
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

                    <p className="mt-8 border-l-2 border-[#3f5a47]/25 pl-4 text-sm font-medium italic text-[#5a6a62]">
                      Not sold as a finished SaaS — positioned as a real build lane that parallels serious client work.
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
                    Website samples — browse demo layouts
                  </Link>
                </li>
                <li className="flex gap-2">
                  <span className={mmsBullet} aria-hidden>
                    ·
                  </span>
                  <TrackedPublicLink
                    href="/free-mockup"
                    eventName="public_contact_cta_click"
                    eventProps={{ location: "builds_experiments", target: "free_mockup" }}
                    className={cn(mmsTextLink, "font-semibold")}
                  >
                    Free homepage preview (mockup)
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
                    Free Website Check
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
                  Web design services
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/free-mockup"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "builds_footer_cta", target: "free_mockup" }}
                  className={cn(
                    mmsBtnSecondary,
                    "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                  )}
                >
                  Free preview
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
                  Contact Topher
                </TrackedPublicLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
