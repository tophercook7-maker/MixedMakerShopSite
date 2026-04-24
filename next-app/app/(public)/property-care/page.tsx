import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicShellClass } from "@/lib/public-brand";
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

export const metadata: Metadata = {
  title: "Property Care in Hot Springs, AR | MixedMakerShop",
  description:
    "Local lawn care, yard cleanup, property cleanup, and outdoor help for homeowners, renters, landlords, and property owners in Hot Springs, Arkansas.",
};

const shell = publicShellClass;

const services = [
  {
    id: "lawn-care",
    title: "Lawn Care",
    body: "Basic mowing, trimming, and practical outdoor upkeep when available.",
    href: "/lawn-care-hot-springs-ar",
  },
  {
    id: "yard-cleanup",
    title: "Yard Cleanup",
    body: "Cleanups for overgrown areas, seasonal debris, edges, and outdoor reset projects.",
    href: "/yard-cleanup-hot-springs-ar",
  },
  {
    id: "property-cleanup",
    title: "Property Cleanup",
    body: "Outdoor cleanup help for homeowners, renters, landlords, and property owners.",
    href: "/yard-cleanup-hot-springs-ar",
  },
  {
    id: "pressure-washing",
    title: "Pressure Washing",
    body: "Only offered when active and available. Ask first and we’ll tell you honestly.",
    href: "/pressure-washing-hot-springs-ar",
  },
] as const;

export default function PropertyCarePage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Property Care</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
                Property Care in Hot Springs, AR
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Local lawn care, cleanup, and outdoor help for homeowners, renters, landlords, and property owners.
              </p>
              <PublicCtaRow className="mt-9">
                <Link href="/contact" className={cn(mmsBtnPrimary, "w-full px-8 no-underline hover:no-underline sm:w-auto")}>
                  Request Property Help
                </Link>
                <Link href="/examples" className={cn(mmsBtnSecondaryOnGlass, "w-full px-8 no-underline hover:no-underline sm:w-auto")}>
                  See Examples
                </Link>
              </PublicCtaRow>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service) => (
                <article key={service.id} id={service.id} className="public-glass-box--soft public-glass-box--pad">
                  <h2 className="text-2xl font-bold tracking-tight text-white">{service.title}</h2>
                  <p className={cn("mt-4 text-base leading-relaxed", mmsOnGlassSecondary)}>{service.body}</p>
                  <Link href={service.href} className={cn(mmsTextLinkOnGlass, "mt-7 inline-flex items-center gap-2")}>
                    Learn more <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              ))}
            </div>
            <div className="public-glass-box public-glass-box--pad mt-8 max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Important distinction</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>This department is for actual local property help.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Website pages for lawn care, cleaning, or pressure washing businesses stay under Websites &amp; Tools.
                This page is for property customers who need outdoor help around Hot Springs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
