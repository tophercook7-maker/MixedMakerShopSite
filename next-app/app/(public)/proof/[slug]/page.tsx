import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { getCaseStudyBySlug, listCaseStudySlugs } from "@/lib/case-studies/registry";
import { SITE_URL, TOPHER_WEB_DESIGN_URL } from "@/lib/site";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

export function generateStaticParams(): { slug: string }[] {
  return listCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseStudyBySlug(slug);
  if (!c) return { title: "Proof | MixedMakerShop" };
  const canonical = `${SITE_URL}/proof/${c.slug}`;
  return {
    title: `${c.title} | MixedMakerShop`,
    description: c.subtitle,
    alternates: { canonical },
    openGraph: {
      title: c.title,
      description: c.subtitle,
      url: canonical,
    },
  };
}

export default async function ProofCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-4xl">
              <p className={mmsSectionEyebrowOnGlass}>Proof · Case study</p>
              <h1 className={cn(mmsH2OnGlass, "mt-4 text-3xl md:text-[2.35rem] lg:text-5xl")}>{study.title}</h1>
              <p className={cn("mt-5 text-lg font-medium text-white/92 md:text-xl")}>{study.subtitle}</p>
              <p className={cn("mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#c5ddd2]/90")}>
                {study.clientName} · {study.category}
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-start">
              <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/30 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]">
                <Image
                  src={study.heroImageSrc}
                  alt={study.heroImageAlt}
                  width={1200}
                  height={720}
                  className="h-auto w-full object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="flex flex-col gap-8">
                <article className="public-glass-box--soft public-glass-box--pad">
                  <h2 className="text-lg font-bold text-white">Problem</h2>
                  <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{study.problem}</p>
                </article>
                <article className="public-glass-box--soft public-glass-box--pad">
                  <h2 className="text-lg font-bold text-white">Approach</h2>
                  <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{study.approach}</p>
                </article>
                <article className="public-glass-box--soft public-glass-box--pad">
                  <h2 className="text-lg font-bold text-white">Outcome</h2>
                  <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{study.outcome}</p>
                </article>
              </div>
            </div>

            <div className="public-glass-box public-glass-box--pad mx-auto mt-12 max-w-3xl">
              <h2 className={cn(mmsH2OnGlass, "!text-xl md:!text-2xl")}>Services in scope</h2>
              <ul className={cn("mt-4 list-disc space-y-2 pl-5 text-sm md:text-[15px]", mmsOnGlassSecondary)}>
                {study.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="public-glass-box--soft public-glass-box--pad mx-auto mt-10 max-w-3xl">
              <h2 className="text-lg font-bold text-white">Proof points</h2>
              <ul className={cn("mt-4 list-disc space-y-2 pl-5 text-sm md:text-[15px]", mmsOnGlassSecondary)}>
                {study.proofPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className={cn("mt-6 text-sm", mmsOnGlassPrimary)}>
                <a
                  href={study.liveSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-2 font-semibold")}
                >
                  Visit live site ({study.liveSiteHostname})
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </p>
            </div>

            <div className="public-glass-box public-glass-box--pad mx-auto mt-12 max-w-3xl text-center">
              <p className={cn("text-sm font-semibold uppercase tracking-[0.14em]", mmsSectionEyebrowOnGlass)}>Next step</p>
              <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Want something similar for your business? Topher&apos;s Web Design handles client-facing sites; Mixed Maker Shop
                hosts previews and intake on the umbrella studio.
              </p>
              <PublicCtaRow className="mt-8 justify-center">
                <a
                  href={TOPHER_WEB_DESIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(mmsBtnPrimary, "inline-flex items-center justify-center gap-2 px-8 no-underline hover:no-underline")}
                >
                  Topher&apos;s Web Design
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
                <Link href={publicFreeMockupFunnelHref} className={cn(mmsBtnSecondaryOnGlass, "px-8 no-underline hover:no-underline")}>
                  Get a free preview
                </Link>
              </PublicCtaRow>
              <p className={cn("mt-8 text-sm", mmsOnGlassSecondary)}>
                <Link href="/examples" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  More examples
                </Link>
                {" · "}
                <Link href="/resources" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  Resource library
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
