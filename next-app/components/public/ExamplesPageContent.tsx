import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import {
  EXAMPLES_CONCEPT_BUILDS,
  EXAMPLES_REAL_WORK,
  type ExamplesConceptCard,
  type ExamplesRealWorkEntry,
} from "@/lib/examples-page-data";
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

const pillBase =
  "inline-flex max-w-full rounded-full border border-[#3f5a47]/22 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f5a47]";

function RealWorkCard({ entry }: { entry: ExamplesRealWorkEntry }) {
  const { project, badge, industry } = entry;
  return (
    <article className={cn(mmsGlassPanelDense, "flex h-full flex-col p-6 sm:p-8")}>
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-[#3f5a47]/12 bg-[#cfd8d0]">
        <Image
          src={project.previewSrc}
          alt={project.previewAlt}
          fill
          className={cn(project.imageClassName, "object-cover")}
          style={{ objectPosition: project.objectPosition }}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>
      <div className="mt-6 flex flex-1 flex-col">
        <div className="flex flex-wrap gap-2">
          <span className={cn(pillBase, "w-fit")}>{badge}</span>
          {industry ? (
            <span className={cn(pillBase, "border-[#3f5a47]/14 bg-white/50 text-[#3f5a47]/90")}>{industry}</span>
          ) : null}
        </div>
        <h3 className="mt-4 text-xl font-bold tracking-tight text-[#1e241f] md:text-2xl">{project.title}</h3>
        <p className="mt-3 text-[15px] font-semibold leading-snug text-[#2d3a33] md:text-base">{project.primaryLine}</p>
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
              View Live Site
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
              View Live Site
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </a>
          )}
          <TrackedPublicLink
            href="/free-mockup"
            eventName="public_contact_cta_click"
            eventProps={{ location: "examples_page", target: "free_mockup", project: project.analyticsId, cta: "get_something_like_this" }}
            className={cn(
              mmsBtnSecondary,
              "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-6 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[11rem]",
            )}
          >
            Get Something Like This
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
    <article className={cn(mmsGlassPanelDense, "flex h-full flex-col p-6 sm:p-8")}>
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-[#3f5a47]/12 bg-[#cfd8d0]">
        <Image
          src={card.previewSrc}
          alt={card.previewAlt}
          fill
          className={cn(card.imageClassName ?? "object-cover", "object-cover")}
          style={{ objectPosition: card.objectPosition ?? "center center" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
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
    <div className={mmsPageBg}>
      {/* HERO */}
      <section
        className={cn(
          "border-b bg-gradient-to-b from-[#f7f4ee] via-[#ece7dd] to-[#e2dcd0]/90",
          mmsSectionBorder,
        )}
      >
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4b2a]">MixedMakerShop</p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-[#1e241f] md:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
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
        </div>
      </section>

      {/* REAL WORK */}
      <section className={cn("border-b", mmsSectionBorder)}>
        <div className={cn(shell, mmsSectionY)}>
          <h2 className={mmsH2} id="real-work">
            Real Work
          </h2>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            Real projects built to help businesses look trustworthy, explain what they do clearly, and make it easier
            for people to reach out.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {EXAMPLES_REAL_WORK.map((entry) => (
              <RealWorkCard key={entry.project.analyticsId} entry={entry} />
            ))}
          </div>
        </div>
      </section>

      {/* CONCEPT BUILDS */}
      <section className={cn("border-b", mmsSectionBorder)}>
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

      {/* CTA BAND */}
      <section className={cn("border-b", mmsSectionBorder, "bg-gradient-to-b from-[#eef1ea] to-[#e4e8df]/95")}>
        <div className={cn(shell, mmsSectionY, "max-w-3xl text-center")}>
          <h2 className="text-2xl font-bold tracking-tight text-[#1e241f] md:text-3xl">
            Want something built around your business?
          </h2>
          <p className={cn("mx-auto mt-5 max-w-xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
            I can put together a free homepage-style preview so you can see the direction before committing to anything.
          </p>
          <PublicCtaRow className="mx-auto mt-10 max-w-xl" align="center">
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: "examples_page", target: "free_mockup", cta: "footer_band_primary" }}
              className={cn(
                mmsBtnPrimary,
                "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-8 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[14rem]",
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
                "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-8 text-[0.9375rem] no-underline hover:no-underline sm:flex-initial sm:min-w-[14rem]",
              )}
            >
              Contact Me
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedPublicLink>
          </PublicCtaRow>
        </div>
      </section>
    </div>
  );
}
