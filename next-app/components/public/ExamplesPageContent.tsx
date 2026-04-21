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
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsBtnSecondaryOnGlass,
  mmsBulletOnGlass,
  mmsGlassPanelDenseHome,
  mmsEyebrowOnGlass,
  mmsH2,
  mmsH2OnGlass,
  mmsH3OnGlassLg,
  mmsHeroTitleOnGlass,
  mmsOnGlassMuted,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionY,
  mmsTextLink,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
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
  const secondaryHref = card.secondaryCtaHref ?? publicFreeMockupFunnelHref;

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
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
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
            <div
              className={cn(
                "public-glass-box public-glass-box--pad examples-page-hero-card",
                "px-5 py-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8",
              )}
            >
              <p className={cn(mmsEyebrowOnGlass, "tracking-[0.18em]")}>MixedMakerShop</p>
              <h1 id="examples-hero-title" className={cn("mt-4", mmsHeroTitleOnGlass)}>
                Examples of websites and builds designed to look better and work harder
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                A mix of real client work, concept builds, and practical projects from MixedMakerShop. If you want something
                in this direction, I can put together a free preview for your business.
              </p>
              <p className={cn("mt-4 max-w-xl text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                These examples show the kind of layout clarity and trust-building direction I can create—so you can
                picture what might fit your own business.
              </p>
              <PublicCtaRow className="mt-10">
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
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
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-8 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[14rem]",
                  )}
                >
                  See Real Work
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </PublicCtaRow>
              <p className={cn("mt-10 flex flex-col items-start gap-1.5 text-sm font-semibold sm:mt-12", mmsOnGlassMuted)}>
                <a
                  href="#real-work"
                  className={cn(
                    mmsTextLinkOnGlass,
                    "group inline-flex items-center gap-2 text-base font-semibold no-underline hover:underline",
                  )}
                >
                  <span className="tracking-tight">Real projects below</span>
                  <ArrowDown
                    className="h-4 w-4 shrink-0 opacity-90 transition-transform duration-300 ease-out group-hover:translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* REAL WORK */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
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

          <div className="public-glass-box--soft public-glass-box--pad mt-8 max-w-2xl">
            <h3 className={mmsH3OnGlassLg}>How to use these examples</h3>
            <ul className={cn("mt-4 space-y-2.5 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
              {[
                "Look for layout direction and how information is organized.",
                "Notice how trust is built before someone scrolls or clicks.",
                "Imagine what would fit your business—not a copy-paste, but the idea.",
                "When you’re ready, start with a free preview tailored to you.",
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span className={mmsBulletOnGlass} aria-hidden>
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className={cn("mt-5 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
              Good design earns trust; trust makes conversion easier.{" "}
              <TrackedPublicLink
                href={publicFreeMockupFunnelHref}
                eventName="public_contact_cta_click"
                eventProps={{ location: "examples_page", target: "free_mockup", cta: "how_to_block_preview" }}
                className={mmsTextLinkOnGlass}
              >
                Start your free preview
              </TrackedPublicLink>
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {EXAMPLES_REAL_WORK.map((entry) => (
              <RealWorkCard key={entry.project.analyticsId} entry={entry} />
            ))}
          </div>
          </div>
        </section>

        {/* CONVERSION BRIDGE */}
        <section className={mmsUmbrellaSectionBackdropImmersive} aria-labelledby="examples-bridge-title">
          <div className={cn(shell, mmsSectionY)}>
            <div className="max-w-2xl border-t border-[#3f5a47]/12 pt-10">
              <h2 id="examples-bridge-title" className="sr-only">
                Next step after browsing examples
              </h2>
              <p className={cn("text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                If you see a direction you like, the next step is a free preview shaped for your business—no pressure,
                just a clearer idea of what your site could look like.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#354239] md:text-[15px]">
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "examples_page", target: "free_mockup", cta: "mid_page_bridge" }}
                  className={mmsTextLink}
                >
                  Start your free preview
                </TrackedPublicLink>{" "}
                <span className="text-[#5a6a62]">(takes a few minutes)</span>
              </p>
            </div>
          </div>
        </section>

        {/* CONCEPT BUILDS */}
        <section className={mmsUmbrellaSectionBackdropImmersive}>
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
          <p className={cn("mt-4 max-w-2xl text-sm leading-relaxed text-[#354239] md:text-[15px]", mmsBodyFrost)}>
            These entries show what gets built and presented online. For promo directions and attention hooks, see the{" "}
            <Link href="/ad-lab" className={mmsTextLink}>
              Ad Lab
            </Link>
            . For lightweight apps and systems that support day-to-day work after the click, see{" "}
            <Link href="/tools" className={mmsTextLink}>
              Apps &amp; Tools
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

        {/* FINAL CTA — dark glass, conversion-focused */}
        <section className={cn("border-t", mmsUmbrellaSectionBackdropImmersive)}>
          <div className={cn(shell, "py-24 md:py-32")}>
            <div className="public-glass-box public-glass-box--pad mx-auto max-w-3xl text-center sm:px-2">
              <h2 className={cn(mmsH2OnGlass, "!text-2xl md:!text-3xl")}>See a direction you like?</h2>
              <p className={cn("mx-auto mt-5 max-w-lg text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Start with a free preview for your business. You can see a direction before committing to anything.
              </p>
              <PublicCtaRow className="mx-auto mt-10 w-full max-w-xl justify-center" align="center">
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "examples_page", target: "free_mockup", cta: "footer_glass_primary" }}
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
                  eventProps={{ location: "examples_page", target: "contact", cta: "footer_glass_secondary" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
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
