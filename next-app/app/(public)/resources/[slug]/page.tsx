import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { TrackedDownloadLink } from "@/components/public/TrackedDownloadLink";
import { publicShellClass } from "@/lib/public-brand";
import { categoryLabel, getResourceBySlug, listResourceSlugs } from "@/lib/resources/registry";
import { SITE_URL } from "@/lib/site";
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
  return listResourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getResourceBySlug(slug);
  if (!r) return { title: "Resource | MixedMakerShop" };
  const canonical = `${SITE_URL}/resources/${r.slug}`;
  return {
    title: `${r.title} | MixedMakerShop`,
    description: r.shortDescription,
    alternates: { canonical },
    openGraph: {
      title: r.title,
      description: r.shortDescription,
      url: canonical,
    },
  };
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getResourceBySlug(slug);
  if (!r) notFound();

  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <nav aria-label="Breadcrumb">
              <Link
                href="/resources"
                className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-2 text-sm font-semibold")}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                Resource library
              </Link>
            </nav>

            <div className="public-glass-box public-glass-box--pad mx-auto mt-8 max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>{categoryLabel(r.category)}</p>
              <h1 className={cn(mmsH2OnGlass, "mt-4 text-3xl md:text-4xl")}>{r.title}</h1>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>{r.shortDescription}</p>
              <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                <span className="font-semibold text-white/88">Who it helps:</span> {r.whoItHelps}
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-5 lg:gap-10">
              <div className="public-glass-box--soft public-glass-box--pad lg:col-span-3">
                <h2 className="text-lg font-bold text-white">What&apos;s inside</h2>
                <ul className={cn("mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                  {r.contentsBullets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="public-glass-box public-glass-box--pad lg:col-span-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#c5ddd2]/95">Download &amp; request</h2>
                <p className={cn("mt-3 text-sm leading-relaxed", mmsOnGlassSecondary)}>
                  Grab the PDF below anytime. If you want Topher to send it, tailor it, or pair it with another funnel, use{" "}
                  <span className="text-white/85">Request this resource</span> from Starter resources — same inbox as Websites
                  &amp; Tools.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <TrackedDownloadLink
                    slug={r.slug}
                    title={r.title}
                    surface="resource_detail"
                    href={r.filePath}
                    downloadPublished={r.downloadPublished}
                  >
                    Download PDF
                  </TrackedDownloadLink>
                  <Link
                    href="/websites-tools#templates-kits"
                    className={cn(mmsBtnPrimary, "inline-flex justify-center px-4 py-3 text-center text-sm no-underline hover:no-underline")}
                  >
                    Request this resource
                  </Link>
                  <Link
                    href="/websites-tools#templates-kits"
                    className={cn(mmsBtnSecondaryOnGlass, "inline-flex justify-center px-4 py-2.5 text-center text-sm no-underline hover:no-underline")}
                  >
                    Optional: open Starter resources form
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
