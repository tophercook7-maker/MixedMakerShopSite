import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Start Here | MixedMakerShop",
  description:
    "Choose the right MixedMakerShop path: websites and tools, GiGi’s Print Shop, property care, examples, or the Idea Lab.",
};

const paths = [
  {
    title: "Need a website or digital tool?",
    body: "Start with Websites & Tools or request a free website preview.",
    href: "/websites-tools",
    cta: "Explore Websites & Tools",
  },
  {
    title: "Need something 3D printed?",
    body: "Visit GiGi’s Print Shop for bookmarks, gifts, useful prints, replacement pieces, and custom requests.",
    href: "/3d-printing",
    cta: "Visit GiGi’s Print Shop",
  },
  {
    title: "Need lawn or property help?",
    body: "See local property care options for Hot Springs, AR.",
    href: "/property-care",
    cta: "View Property Care",
  },
  {
    title: "Want to see proof?",
    body: "Browse websites, builds, tools, prints, and project examples.",
    href: "/examples",
    cta: "See Examples",
  },
  {
    title: "Have an idea?",
    body: "Suggest a practical tool, service, product, or print idea.",
    href: "/idea-lab",
    cta: "Open Idea Lab",
  },
] as const;

export default function StartHerePage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(publicShellClass, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Start Here</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
                Pick the MixedMakerShop path that fits.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                MixedMakerShop is the umbrella brand for websites, tools, property care, GiGi’s 3D prints, and new ideas.
                This page keeps the choices clear.
              </p>
              <Link href={publicFreeMockupFunnelHref} className={cn(mmsBtnPrimary, "mt-9 inline-flex px-8 no-underline hover:no-underline")}>
                Get a Free Website Preview
              </Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
              {paths.map((path) => (
                <Link key={path.title} href={path.href} className="group public-glass-box--soft public-glass-box--pad flex min-h-[14rem] flex-col no-underline transition hover:-translate-y-1 hover:bg-white/12 hover:no-underline">
                  <h2 className="text-xl font-bold tracking-tight text-white">{path.title}</h2>
                  <p className={cn("mt-4 flex-1 text-sm leading-relaxed", mmsOnGlassSecondary)}>{path.body}</p>
                  <span className={cn(mmsBtnSecondaryOnGlass, "mt-6 inline-flex min-h-[2.65rem] px-4 text-sm")}>
                    {path.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
