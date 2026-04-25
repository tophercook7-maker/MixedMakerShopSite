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
    "See active MixedMakerShop builds, final-polish projects, experiments, and future concepts. Vote, suggest, or ask about what is being built.",
};

const shell = publicShellClass;

const featuredActiveBuilds = [
  {
    name: "Henry AI",
    status: "Final polish / active build",
    description:
      "A practical AI assistant project being shaped to connect ideas, tools, workflows, and business systems into one useful helper.",
    audience: "Small business owners, makers, and busy operators who need one organized helper.",
    button: "Ask About This",
  },
  {
    name: "StrainSpotter",
    status: "Final polish / active app build",
    description:
      "A scanning-focused cannabis strain helper built to return likely visual matches, useful strain details, and practical next steps.",
    audience: "Curious shoppers, growers, and app users who want quick, useful strain context.",
    button: "Suggest / Vote",
  },
  {
    name: "Deep Well Audio",
    status: "Live creative project",
    description:
      "A focused audio/content experience built around saving, exploring, and organizing meaningful material.",
    audience: "Creative listeners, audio collectors, and people who like organized content libraries.",
    button: "Suggest / Vote",
  },
  {
    name: "Website Preview Generator",
    status: "Active MixedMakerShop tool",
    description:
      "A tool that helps local businesses see what a stronger website could look like before committing.",
    audience: "Local business owners who need a clearer website direction before buying a full build.",
    button: "Ask About This",
  },
] as const;

const ideasInTesting = [
  {
    name: "Facebook Post & Ad Tracker",
    status: "Planning / workflow tool",
    description:
      "A simple way to track posts, ads, replies, leads, and follow-ups so no promotion disappears into the void.",
    audience: "Small businesses running Facebook posts, boosted promos, and local ad experiments.",
    button: "Suggest / Vote",
  },
  {
    name: "GiGi’s Seasonal Print Ideas",
    status: "Early product ideas",
    description:
      "Bookmarks, Easter items, church gifts, small seasonal pieces, and useful 3D printed items from GiGi’s Print Shop.",
    audience: "Church groups, gift buyers, families, and anyone who wants useful custom prints.",
    button: "Ask About This",
  },
  {
    name: "MixedMakerShop Business Kits",
    status: "Future digital products",
    description:
      "Templates, checklists, simple tools, and business kits for local service businesses and side hustlers.",
    audience: "Service businesses, side hustlers, and owners who need practical starter systems.",
    button: "Suggest / Vote",
  },
] as const;

function IdeaCard({ idea }: { idea: (typeof featuredActiveBuilds)[number] | (typeof ideasInTesting)[number] }) {
  return (
    <article className="public-glass-box--soft public-glass-box--pad flex min-h-[20rem] flex-col">
      <p className="w-fit rounded-full border border-orange-300/25 bg-orange-300/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-orange-100">
        {idea.status}
      </p>
      <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">{idea.name}</h3>
      <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
        {idea.description}
      </p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/8 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Suggested audience</p>
        <p className={cn("mt-2 text-sm leading-relaxed", mmsOnGlassPrimary)}>{idea.audience}</p>
      </div>
      <Link
        href="#suggest-an-idea"
        className={cn(
          mmsBtnSecondaryOnGlass,
          "mt-auto inline-flex w-full justify-center px-5 text-sm no-underline hover:no-underline",
        )}
      >
        {idea.button}
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}

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
                Some MixedMakerShop ideas are active builds. Some are in final polish. Some are experiments. Some are
                future concepts. Vote on what you like, suggest improvements, or ask about what is being built.
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
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Featured Active Builds</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Projects already being built and polished.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                These are not placeholder ideas. They are active MixedMakerShop projects, live tools, or final-polish
                builds that can still benefit from feedback.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredActiveBuilds.map((idea) => (
                <IdeaCard key={idea.name} idea={idea} />
              ))}
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Ideas in Testing</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Experiments, workflows, and product directions being shaped.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                These ideas are being tested for usefulness, audience fit, and whether they should become a page,
                service, tool, or downloadable product.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ideasInTesting.map((idea) => (
                <IdeaCard key={idea.name} idea={idea} />
              ))}
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "pb-8 pt-0 md:pb-12")}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Future Concepts</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4 !text-2xl md:!text-3xl")}>
                Reserved for maybe-someday ideas.
              </h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Future concepts are only for ideas that are truly early-stage. Henry AI and StrainSpotter belong in
                active builds because they are already in final-stage polish.
              </p>
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
