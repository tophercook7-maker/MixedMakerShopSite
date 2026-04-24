import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { IdeaSuggestionForm } from "@/components/public/IdeaSuggestionForm";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Idea Lab | MixedMakerShop",
  description:
    "See new MixedMakerShop ideas, vote on what should be built next, and suggest practical tools, services, and products.",
};

const shell = publicShellClass;

const ideaBuckets = [
  { title: "Coming Soon", body: "Small tools, printable products, seasonal offers, and local service ideas being shaped." },
  { title: "Vote on This", body: "Tell us which ideas sound useful before they become full pages or products." },
  { title: "Suggest an Idea", body: "Send what would actually help you, your business, church, family, or property." },
  { title: "Recently Built", body: "Finished pages, ad concepts, print requests, and little tools will be collected here." },
  { title: "Maybe, Maybe Not", body: "A safe spot for half-formed ideas that need feedback before they become real." },
] as const;

export default function IdeaLabPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Idea Lab</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">The Idea Lab</h1>
              <p className={cn("mt-6 text-xl font-semibold leading-relaxed md:text-2xl", mmsOnGlassPrimary)}>
                Topher always has something cooking.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                This is where we share some of the newest MixedMakerShop ideas before they become full services,
                products, tools, or offers. Vote on what you like, suggest improvements, or tell us what would actually
                help you.
              </p>
              <Link href="#suggest-an-idea" className={cn(mmsBtnSecondaryOnGlass, "mt-9 inline-flex px-8 no-underline hover:no-underline")}>
                Suggest an Idea
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
              {ideaBuckets.map((item) => (
                <article key={item.title} className="public-glass-box--soft public-glass-box--pad">
                  <h2 className="text-xl font-bold tracking-tight text-white">{item.title}</h2>
                  <p className={cn("mt-4 text-sm leading-relaxed", mmsOnGlassSecondary)}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="suggest-an-idea" className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="public-glass-box public-glass-box--pad">
                <p className={mmsSectionEyebrowOnGlass}>Suggest an Idea</p>
                <h2 className={cn(mmsH2OnGlass, "mt-4")}>What would actually help?</h2>
                <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                  This uses the existing contact/lead route so ideas still land in the current CRM flow. No new database
                  system required.
                </p>
              </div>
              <div className="public-glass-box--soft public-glass-box--pad">
                <IdeaSuggestionForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
