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
import { WHAT_I_DO, contactHrefForTopic } from "@/lib/what-i-do";

export const metadata: Metadata = {
  alternates: { canonical: "https://mixedmakershop.com/start-here" },
  title: "Start Here",
  description:
    "Everything Topher does in Hot Springs, AR, in one place: websites and apps, AI and automation, books and audio, in-home computer help, 3D printing, family history, and ideas that need building.",
};

const paths = [
  ...WHAT_I_DO.map((c) => ({
    title: c.title,
    body: `${c.lead} ${c.price}.`,
    href: c.href,
    cta: c.cta,
  })),
  {
    title: "Not sure which one?",
    body: "Send one sentence about what you're working on. I'll tell you what it takes, what it costs, or who to call instead.",
    href: contactHrefForTopic("other"),
    cta: "Tell me what you're working on",
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
One guy. A lot of skills. Pick the one you need.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                MixedMakerShop is one person in Hot Springs, Arkansas. Websites and apps, AI and automation, books and
                audio, in-home computer help, 3D printing, family history, and ideas that need building. Every card
                below goes to a page with real prices and a way to reach me.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={contactHrefForTopic("other")} className={cn(mmsBtnPrimary, "inline-flex px-8 no-underline hover:no-underline")}>
                  Tell me what you&apos;re working on
                </Link>
                <Link href={publicFreeMockupFunnelHref} className={cn(mmsBtnSecondaryOnGlass, "inline-flex px-6 no-underline hover:no-underline")}>
                  Free website preview
                </Link>
              </div>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
