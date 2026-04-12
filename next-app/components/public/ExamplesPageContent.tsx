import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ExternalLink } from "lucide-react";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import {
  EXAMPLES_CONCEPT_BUILDS,
  EXAMPLES_REAL_WORK,
  type ExamplesConceptCard,
  type ExamplesRealWorkEntry,
} from "@/lib/examples-page-data";
import {
  getShowcasePrimaryCtaLabel,
  getShowcaseSecondaryCtaHref,
  getShowcaseSecondaryCtaLabel,
} from "@/lib/live-web-projects";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { UmbrellaHeroMedia } from "@/components/public/umbrella-hero-media";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsCtaPanelHome,
  mmsGlassPanelDenseHome,
  mmsGlassPanelHero,
  mmsH2,
  mmsSectionY,
  mmsTextLink,
  mmsUmbrellaSectionBackdrop,
} from "@/lib/mms-umbrella-ui";
import { ExampleCardImageOverlay } from "@/components/public/ExampleCardImageOverlay";
import {
  ShowcaseCaseStudyAfterContext,
  ShowcaseCaseStudyBeforePrimary,
} from "@/components/public/ShowcaseCaseStudyFields";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const pillBase =
  "inline-flex max-w-full rounded-full border border-[#3f5a47]/22 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f5a47]";

const featuredPill =
  "inline-flex max-w-full rounded-full border border-[#b85c1e]/35 bg-gradient-to-r from-[#fff7ed]/95 to-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a4b2a]";

const exampleThumbFrame =
  "relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-[#3f5a47]/14 bg-[#cfd8d0] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]";

function RealWorkCard({ entry }: { entry: ExamplesRealWorkEntry }) {
  const { project, badge, industry } = entry;
  const primaryLabel = getShowcasePrimaryCtaLabel(project);
  const secondaryLabel = getShowcaseSecondaryCtaLabel(project);
  return (
    <article
      className={cn(
        mmsGlassPanelDenseHome,
        "flex h-full flex-col p-6 sm:p-8",
        project.emphasizeCard && "ring-2 ring-[#b85c1e]/28 shadow-[0_28px_70px_-32px_rgba(184,92,30,0.22)]",
      )}
    >
      <div className={exampleThumbFrame}>
        <Image
          src={project.previewSrc}
          alt={project.previewAlt}
          fill
          className={cn(project.imageClassName, "object-cover")}
          style={{ objectPosition: project.objectPosition }}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <ExampleCardImageOverlay />
      </div>
      <div className="mt-6 flex flex-1 flex-col">
        <div className="flex flex-wrap gap-2">
          <span className={cn(pillBase, "w-fit")}>{badge}</span>
          {industry ? (
            <span className={cn(pillBase, "border-[#3f5a47]/14 bg-white/50 text-[#3f5a47]/90")}>{industry}</span>
          ) : null}
          {project.featuredBadge ? <span className={cn(featuredPill, "w-fit")}>{project.featuredBadge}</span> : null}
        </div>
        <h3 className="mt-4 text-xl font-bold tracking-tight text-[#1e241f] md:text-2xl">{project.title}</h3>
        <ShowcaseCaseStudyBeforePrimary project={project} variant="light" className="mt-2" />
        <p className="mt-3 text-[15px] font-semibold leading-snug text-[#2d3a33] md:text-base">{project.primaryLine}</p>
        {project.context ? (
          <p className="mt-2 text-sm leading-relaxed text-[#354239] md:text-[15px]">{project.context}</p>
        ) : null}
        <ShowcaseCaseStudyAfterContext project={project} variant="light" className="mt-3" />
        <PublicCtaRow className="mt-auto pt-6">
          {project.primaryCtaIsExternal === false ? (
            <Link
              href={project.url}
              className={cn(
                mmsBtnPrimary,
                "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
              )}
            >
              {primaryLabel}
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
              {primaryLabel}
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </a>
          )}
          <TrackedPublicLink
            href={getShowcaseSecondaryCtaHref(project)}
            eventName="public_contact_cta_click"
            eventProps={{
              location: "examples_page",
              target: "free_mockup",
              project: project.analyticsId,
              cta: secondaryLabel,
            }}
            className={cn(
              mmsBtnSecondary,
              "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
            )}
          >
            {secondaryLabel}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </TrackedPublicLink>
        </PublicCtaRow>
      </div>
    </article>
  );
}

function ConceptBuildCard({ card }: { card: ExamplesConceptCard }) {
  const secondaryLabel = card.secondaryCtaLabel ?? "Get My Free Preview";
  const secondaryHref = card.secondaryCtaHref ?? "/free-mockup";

  return (
    <article className={cn(mmsGlassPanelDenseHome, "flex h-full flex-col p-6 sm:p-8")}>
      <div className={exampleThumbFrame}>
        <Image
          src={card.previewSrc}
          alt={card.previewAlt}
          fill
          className={cn(card.imageClassName ?? "object-cover", "object-cover")}
          style={{ objectPosition: card.objectPosition ?? "center center" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <ExampleCardImageOverlay />
      </div>
      <div className="mt-6 flex flex-1 flex-col">
        <span className={cn(pillBase, "w-fit")}>{card.tag}</span>
        <h3 className="mt-4 text-xl font-bold tracking-tight text-[#1e241f] md:text-2xl">{card.title}</h3>
        <p className="mt-3 text-[15px] font-semibold leading-snug text-[#2d3a33] md:text-base">{card.primaryLine}</p>
        {card.context ? (
          <p className="mt-2 text-sm leading-relaxed text-[#354239] md:text-[15px]">{card.context}</p>
        ) : null}
        <PublicCtaRow className="mt-auto pt-6">
          {card.isExternal ? (
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                mmsBtnPrimary,
                "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
              )}
            >
              {card.primaryCtaLabel}
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </a>
          ) : (
            <TrackedPublicLink
              href={card.href}
              eventName="public_web_design_sample_click"
              eventProps={{ location: "examples_page", label: "concept_build", project: card.id }}
              className={cn(
                mmsBtnPrimary,
                "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
              )}
            >
              {card.primaryCtaLabel}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedPublicLink>
          )}
          <TrackedPublicLink
            href={secondaryHref}
            eventName="public_contact_cta_click"
            eventProps={{
              location: "examples_page",
              target: secondaryHref === "/contact" ? "contact" : "free_mockup",
              project: card.id,
              cta: secondaryLabel,
            }}
            className={cn(
              mmsBtnSecondary,
              "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
            )}
          >
            {secondaryLabel}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </TrackedPublicLink>
        </PublicCtaRow>
      </div>
    </article>
  );
}

export function ExamplesPageContent() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        {/* HERO — same umbrella + glass rhythm as homepage */}
        <section className="relative max-md:border-b max-md:border-black/10" aria-labelledby="examples-hero-title">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:hidden">
            <UmbrellaHeroMedia className="min-h-[min(100svh,48rem)]" priority />
          </div>
          <div
            className={cn(
              shell,
              mmsSectionY,
              "relative z-[2] max-w-[40rem]",
            )}
          >
            <div className={cn(mmsGlassPanelHero, "px-5 py-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8")}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4b2a]">MixedMakerShop</p>
              <h1
                id="examples-hero-title"
                className="mt-4 text-3xl font-bold tracking-[-0.035em] text-[#1e241f] md:text-4xl lg:text-[2.65rem] lg:leading-[1.12]"
              >
                Examples of websites and builds designed to look better and work harder
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                A mix of real client work, concept builds, and practical projects from MixedMakerShop. If you want something
                in this direction, I can put together a free preview for your business.
              </p>
              <PublicCtaRow className="mt-10">
                <TrackedPublicLink
                  href="/free-mockup"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "examples_page", target: "free_mockup", cta: "hero_primary" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-8 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[14rem]",
                  )}
                >
                  Get My Free Preview
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <a
                  href="#real-work"
                  className={cn(
                    mmsBtnSecondary,
                    "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-8 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[14rem]",
                  )}
                >
                  See Real Work
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </PublicCtaRow>
              <p className="mt-10 flex flex-col items-start gap-1.5 text-sm font-semibold text-[#5a6a62] sm:mt-12">
                <a
                  href="#real-work"
                  className="group inline-flex items-center gap-2 text-[#4a5850] underline-offset-4 transition-colors hover:text-[#2f4a38] hover:underline"
                >
                  <span className="tracking-tight">Real projects below</span>
                  <ArrowDown
                    className="h-4 w-4 shrink-0 opacity-80 transition-transform duration-300 ease-out group-hover:translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* REAL WORK */}
        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
          <h2 className={mmsH2} id="real-work">
            Real Work
          </h2>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            Real projects built to help businesses look trustworthy, explain what they do clearly, and make it easier
            for people to reach out.
          </p>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-[#3d4a41] md:text-[15px]">
            Built directly with me — no agency layers, no handoffs.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {EXAMPLES_REAL_WORK.map((entry) => (
              <RealWorkCard key={entry.project.analyticsId} entry={entry} />
            ))}
          </div>
          </div>
        </section>

        {/* CONCEPT BUILDS */}
        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
          <h2 className={mmsH2} id="concept-builds">
            Concept Builds
          </h2>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            These example builds show layout direction, product thinking, and how a business or tool can be presented
            clearly online. They&apos;re sandboxes and demos — not substitutes for the paid client sites above.
          </p>
          <p className={cn("mt-4 max-w-2xl text-sm leading-relaxed text-[#354239] md:text-[15px]", mmsBodyFrost)}>
            Want the full filterable library (same entries, by industry)?{" "}
            <Link href="/website-samples" className={mmsTextLink}>
              Browse all layout demos
            </Link>
            .
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {EXAMPLES_CONCEPT_BUILDS.map((card) => (
              <ConceptBuildCard key={card.id} card={card} />
            ))}
          </div>
          </div>
        </section>

        {/* CTA BAND — matches homepage contact strip */}
        <section
          className={cn(
            "border-t",
            mmsUmbrellaSectionBackdrop,
            "max-md:bg-gradient-to-b max-md:from-[#e8e3da] max-md:to-[#dcd6cc]",
          )}
        >
          <div className={cn(shell, "py-24 md:py-32")}>
            <div className={cn(mmsCtaPanelHome, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
              <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Want something built around your business?</h2>
              <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsBodyFrost)}>
                I can put together a free homepage-style preview so you can see the direction before committing to anything.
              </p>
              <PublicCtaRow className="mx-auto mt-10 w-full max-w-xl justify-center" align="center">
                <TrackedPublicLink
                  href="/free-mockup"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "examples_page", target: "free_mockup", cta: "footer_band_primary" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex w-full min-w-[12rem] flex-1 items-center justify-center gap-2 px-8 text-[0.9375rem] no-underline hover:no-underline sm:w-auto sm:flex-initial sm:min-w-[14rem]",
                  )}
                >
                  Get My Free Preview
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "examples_page", target: "contact", cta: "footer_band_secondary" }}
                  className={cn(
                    mmsBtnSecondary,
                    "inline-flex w-full min-w-[12rem] flex-1 items-center justify-center gap-2 px-8 text-[0.9375rem] no-underline hover:no-underline sm:w-auto sm:flex-initial sm:min-w-[14rem]",
                  )}
                >
                  Contact Me
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
