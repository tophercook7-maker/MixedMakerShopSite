import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBullet,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsCtaPanel,
  mmsEyebrow,
  mmsGlassPanelDense,
  mmsH1,
  mmsH2,
  mmsLead,
  mmsPageBg,
  mmsSectionBorder,
  mmsSectionY,
  mmsTextLink,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const STRAINSPOTTER_VIDEO_SRC = "/videos/strainspotter_ad_v2.mp4";

function MediaSlot({
  file,
  label,
  hint,
  className,
}: {
  file: string;
  label: string;
  /** Short line under filename */
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col justify-end gap-2.5 rounded-[1.15rem] border-2 border-dashed border-[#3f5a47]/32",
        "bg-gradient-to-br from-[rgba(232,241,232,0.35)] to-[rgba(47,62,52,0.09)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:min-h-[220px]",
        className,
      )}
    >
      <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#3f5a47]">{label}</p>
      <p className="text-xs font-semibold text-[#1e241f]">Screenshot slot</p>
      <p className="text-[11px] leading-relaxed text-[#4a5750]">
        Add{" "}
        <code className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-[#1e241f]">{file}</code> →{" "}
        <code className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-[#1e241f]">public/images/builds/</code>
      </p>
      {hint ? <p className="text-[11px] leading-relaxed text-[#5a6a62]">{hint}</p> : null}
    </div>
  );
}

export function BuildsPage() {
  return (
    <div className={cn(mmsPageBg, "bg-gradient-to-b from-[#ddd8cf] via-[#ece7dd] to-[#e0dbd2]")}>
      <section
        className={cn(
          "border-b border-[#3f5a47]/10 bg-gradient-to-b from-[#2f3e34]/[0.14] via-[#5a6d62]/[0.06] to-[#ece7dd]",
          mmsSectionBorder,
        )}
      >
        <div className={cn(shell, mmsSectionY, "max-w-4xl")}>
          <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Digital Builds by Topher</p>
          <h1 className={cn(mmsH1, "mt-6 max-w-[22ch] text-[#1e241f] sm:max-w-none")}>
            Beyond websites: systems you can see and stress-test.
          </h1>
          <p className={cn(mmsLead, "mt-7 max-w-2xl font-semibold text-[#2d3a33]")}>
            These are active product directions — not mock case studies. They show how I structure data, UX, and
            real-world workflows when a client needs more than a brochure.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#354239]">
            Scroll for two flagship builds (StrainSpotter and Henry AI), each with room for your final screenshots and an
            honest note on where things stand.
          </p>
        </div>
      </section>

      {/* StrainSpotter */}
      <section
        className={cn("builds-showcase border-b border-[#3f5a47]/10 bg-[#f3f0e8]/95", mmsSectionBorder)}
        aria-labelledby="builds-strainspotter-heading"
      >
        <div className={cn(shell, mmsSectionY)}>
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
              <div className="build-content relative min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Flagship product build</p>
                  <span className="rounded-full border border-[#3f5a47]/18 bg-[#ece7dd]/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2f3e34]">
                    In motion
                  </span>
                </div>
                <h2 id="builds-strainspotter-heading" className={cn(mmsH2, "mt-5 !text-3xl md:!text-[2.35rem]")}>
                  StrainSpotter
                </h2>
                <p className="mt-5 text-xl font-semibold leading-snug text-[#1e241f] md:text-[1.35rem]">
                  An AI-powered cannabis identification and companion platform.
                </p>
                <p className="mt-6 text-base leading-relaxed text-[#2d3a33] md:text-[17px]">
                  The focus is practical: help someone go from a question (“what is this?”) to structured strain context —
                  genetics, effects, sourcing hooks — without drowning them in noise. The UI is intentionally glassy and calm
                  so dense data still feels scannable.
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#354239]">
                  Public demo surfaces come and go; the story here is{" "}
                  <strong className="font-semibold text-[#1e241f]">product thinking</strong>: identification flows, catalogs,
                  vendor discovery, and a cohesive &quot;Garden&quot; layer that ties sessions together.
                </p>

                <div className="mt-8 rounded-2xl border border-[#3f5a47]/14 bg-[rgba(236,243,236,0.45)] p-6 md:p-7">
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

                <div className="actions mt-10 flex flex-wrap gap-3">
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
                </div>
                <p className="mt-6 border-l-2 border-[#b85c1e]/40 pl-4 text-sm font-medium text-[#5a6a62]">
                  Demo environments shift; treat the link as a living preview of direction — not a final packaging claim.
                </p>
              </div>

              <div className="build-media min-w-0 space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3f5a47]">
                    Visual system map
                  </p>
                  <p className="mt-2 text-sm text-[#4a5750]">
                    Video anchors the scanner story; stills lock in database, vendors, and dashboard depth.
                  </p>
                </div>
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
                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">public/videos/strainspotter_ad_v2.mp4</code>
                  </p>
                </div>
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
      </section>

      {/* Henry AI */}
      <section className={cn("border-b border-[#3f5a47]/10 bg-white/93", mmsSectionBorder)} aria-labelledby="builds-henry-heading">
        <div className={cn(shell, mmsSectionY)}>
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
                  <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Workspace &amp; automation concept</p>
                  <span className="rounded-full border border-[#3f5a47]/18 bg-[#f4f1ea] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2f3e34]">
                    Active build
                  </span>
                </div>
                <h2 id="builds-henry-heading" className={cn(mmsH2, "mt-5 !text-3xl md:!text-[2.35rem]")}>
                  Henry AI
                </h2>
                <p className="mt-5 text-xl font-semibold leading-snug text-[#1e241f] md:text-[1.35rem]">
                  A practical AI workspace built for organization, workflows, and real business use.
                </p>
                <p className="mt-6 text-base leading-relaxed text-[#2d3a33] md:text-[17px]">
                  Henry AI is the &quot;what if your tools actually cooperated&quot; experiment: fewer tabs, clearer handoffs,
                  and assistant-style help that respects how owners actually work — not how slide decks imagine they work.
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#354239]">
                  It&apos;s also a statement about depth behind MixedMakerShop: the same person sketching your marketing site
                  can reason about state, prompts, and workflow boundaries when you need software — not just pages.
                </p>

                <div className="mt-8 rounded-2xl border border-[#3f5a47]/14 bg-[rgba(248,245,238,0.65)] p-6 md:p-7">
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

                <p className="mt-8 border-l-2 border-[#3f5a47]/25 pl-4 text-sm font-medium italic text-[#5a6a62]">
                  Not sold as a finished SaaS — positioned as a real build lane that parallels serious client work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("border-b border-[#3f5a47]/10 bg-[#dfe6df]/85", mmsSectionBorder)}>
        <div className={cn(shell, mmsSectionY)}>
          <h2 className={mmsH2}>Also explore</h2>
          <p className="mt-4 max-w-2xl font-semibold text-[#2d3a33] md:text-[17px]">
            The public site, samples, and small utilities — same builder, different depth.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10">
            <div className={cn(mmsGlassPanelDense, "p-9 sm:p-10")}>
              <h3 className="text-lg font-bold text-[#1e241f]">Examples hub</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#2d3a33] md:text-[15px]">
                Web samples, 3D printing paths, landing pages, and lightweight tools.
              </p>
              <Link href="/examples" className={cn(mmsTextLink, "mt-8 inline-block text-[15px] font-semibold")}>
                Open examples →
              </Link>
            </div>
            <div className={cn(mmsGlassPanelDense, "p-9 sm:p-10")}>
              <h3 className="text-lg font-bold text-[#1e241f]">Utilities &amp; experiments</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#2d3a33] md:text-[15px]">
                Roast, Website Check, and other clarity-first tools.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                <Link href="/tools" className={cn(mmsTextLink, "inline-block text-[15px] font-semibold")}>
                  Tools →
                </Link>
                <Link href="/website-roast" className={cn(mmsTextLink, "inline-block text-[15px] font-semibold")}>
                  Website Roast →
                </Link>
                <Link href="/free-website-check" className={cn(mmsTextLink, "inline-block text-[15px] font-semibold")}>
                  Free Website Check →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion — stronger client-work bridge */}
      <section
        className={cn(
          "relative overflow-hidden border-b border-[#1e241f]/15",
          "bg-gradient-to-br from-[#243028] via-[#2f3e34] to-[#1a221c]",
          mmsSectionBorder,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 10% 20%, rgba(184, 92, 30, 0.35), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 80%, rgba(236, 231, 221, 0.08), transparent 50%)",
          }}
          aria-hidden
        />
        <div className={cn(shell, mmsSectionY, "relative z-[1] max-w-4xl")}>
          <p className={cn(mmsEyebrow, "!text-[#e8c4a8]")}>For clients hiring Topher</p>
          <h2 className={cn(mmsH2, "mt-5 !text-[#faf8f4] !text-2xl md:!text-[2.1rem]")}>What this means for your website project</h2>
          <div
            className={cn(
              mmsGlassPanelDense,
              "mt-10 border-white/20 bg-[rgba(247,244,238,0.14)] p-8 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-10",
            )}
          >
            <p className="text-base font-semibold leading-relaxed text-[#f4f1ea] md:text-lg">
              Even when the deliverable is &quot;just a website,&quot; you&apos;re working with someone who has shipped thinking in
              products, data, and workflows — not only layouts.
            </p>
            <ul className="mt-8 space-y-3.5 text-[15px] leading-relaxed text-[#e8e0d6] md:text-[16px]">
              {[
                "Clear information architecture and conversion paths — not template roulette.",
                "Honest scoping: what belongs in v1 vs. what should wait for traction or budget.",
                "Continuity if you outgrow the first site: APIs, internal tools, or companion apps live in the same headspace.",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8c4a8]" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm font-medium leading-relaxed text-[#d4c9bc]">
              No upsell theater — just proof that the person wiring your homepage understands how digital systems behave in
              the wild.
            </p>
          </div>
        </div>
      </section>

      <section className={cn("border-t border-[#3f5a47]/10 bg-gradient-to-b from-[#e0dbd2] to-[#d4cfc5]", mmsSectionBorder)}>
        <div className={cn(shell, "px-5 py-24 md:py-28")}>
          <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Most projects still start with a website</h2>
            <p className="mx-auto mt-5 max-w-lg font-medium text-[#2d3a33] md:text-lg">
              When you&apos;re ready, start on the web-design lane — deeper builds only if they earn their place.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <TrackedPublicLink
                href="/web-design"
                eventName="public_contact_cta_click"
                eventProps={{ location: "builds_cta", target: "web_design" }}
                className={cn(
                  mmsBtnPrimary,
                  "w-full justify-center px-10 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Get a Website
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "builds_cta", target: "free_mockup" }}
                className={cn(
                  mmsBtnSecondary,
                  "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Free mockup
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "builds_cta", target: "contact_topher" }}
                className={cn(
                  mmsBtnSecondary,
                  "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Contact Topher
              </TrackedPublicLink>
            </div>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#4a5750]">
              No pressure · No obligation · Preview-first when it helps
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
