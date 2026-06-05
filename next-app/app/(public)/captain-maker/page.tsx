import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CaptainMakerPanel } from "@/components/public/CaptainMakerPanel";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsH3OnGlass,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = `${SITE_URL}/captain-maker`;

export const metadata: Metadata = {
  title: "Captain Maker | MixedMakerShop",
  description:
    "Ask Captain Maker for help choosing the right MixedMakerShop service, including websites, free homepage previews, 3D printing, AI helpers, property care, pricing, and project next steps.",
  alternates: { canonical },
  openGraph: {
    title: "Captain Maker | MixedMakerShop",
    description:
      "Not sure what you need? Captain Maker points you toward websites, free previews, 3D printing, property care, pricing, and the right next step.",
    url: canonical,
  },
};

const helpTopics = [
  { title: "Website help", body: "Landing pages, full sites, local SEO foundations, and clearer service pages." },
  { title: "Free homepage previews", body: "See a homepage direction before you commit to a full build." },
  { title: "Google Business Profile cleanup", body: "Setup, consistency checks, and monthly support starting points." },
  { title: "AI helpers and automations", body: "Bots, intake flows, and practical automations tied to your site." },
  { title: "3D print requests", body: "Custom prints, promo gear, and GiGi's Print Shop routing." },
  { title: "Property care routing", body: "Outdoor cleanup, lawn care, and property-help next steps." },
  { title: "Pricing questions", body: "Starting prices and what usually affects scope — not final quotes." },
  { title: "General project ideas", body: "Flyers, tools, experiments, and projects still taking shape." },
] as const;

const recommendedSteps = [
  {
    need: "Need a better business website?",
    action: "Start with a free homepage preview",
    href: publicFreeMockupFunnelHref,
  },
  {
    need: "Need something printed?",
    action: "Open the 3D printing path",
    href: "/3d-printing",
  },
  {
    need: "Need pricing first?",
    action: "See starting prices",
    href: "/pricing",
  },
  {
    need: "Need to talk to Topher?",
    action: "Open the contact page",
    href: "/contact",
  },
] as const;

const extraPaths = [
  { label: "Web design services", href: "/web-design" },
  { label: "Idea Lab experiments", href: "/idea-lab" },
  { label: "Property care", href: "/property-care" },
] as const;

export default function CaptainMakerPage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(publicShellClass, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad mx-auto max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Captain Maker</p>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Not sure what you need? Ask Captain Maker.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Use the guided project assistant to sort what you need, collect useful details, and land on the right
                next step — free preview, 3D print path, AI consult, or contact with Topher.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedPublicLink
                  href="#captain-maker-guided"
                  eventName="public_captain_maker_cta"
                  eventProps={{ location: "captain_maker_hero", target: "guided" }}
                  className={cn(mmsBtnPrimary, "inline-flex w-full justify-center gap-2 no-underline hover:no-underline sm:w-auto")}
                >
                  Start the guided assistant
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_captain_maker_cta"
                  eventProps={{ location: "captain_maker_hero", target: "free_mockup" }}
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex w-full justify-center no-underline hover:no-underline sm:w-auto")}
                >
                  Get a Free Website Preview
                </TrackedPublicLink>
              </div>
            </div>

            <div id="captain-maker-guided" className="scroll-mt-28 mt-10 md:mt-14">
              <CaptainMakerPanel variant="page" />
            </div>

            <div className="mt-12 md:mt-16">
              <h2 className={cn(mmsH2OnGlass, "text-2xl md:text-3xl")}>What Captain Maker can help with</h2>
              <p className={cn("mt-4 max-w-3xl text-base leading-relaxed", mmsOnGlassSecondary)}>
                Captain Maker is here to sort the starting path — not to lock in final scope, pricing, or timelines.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {helpTopics.map((topic) => (
                  <article key={topic.title} className="public-glass-box--soft public-glass-box--pad flex h-full flex-col">
                    <h3 className={mmsH3OnGlass}>{topic.title}</h3>
                    <p className={cn("mt-3 flex-1 text-sm leading-relaxed", mmsOnGlassSecondary)}>{topic.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-12 md:mt-16">
              <h2 className={cn(mmsH2OnGlass, "text-2xl md:text-3xl")}>Recommended next steps</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {recommendedSteps.map((step) => (
                  <Link
                    key={step.href}
                    href={step.href}
                    className="public-glass-box public-glass-box--pad flex h-full flex-col border border-white/10 no-underline transition hover:border-white/20 hover:no-underline"
                  >
                    <p className={cn("text-sm font-semibold uppercase tracking-[0.14em]", mmsOnGlassSecondary)}>
                      {step.need}
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-base font-bold text-white">
                      {step.action}
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#f0c49a]" aria-hidden />
                    </p>
                  </Link>
                ))}
              </div>
              <p className={cn("mt-6 text-sm leading-relaxed", mmsOnGlassSecondary)}>
                More paths:{" "}
                {extraPaths.map((path, index) => (
                  <span key={path.href}>
                    <Link href={path.href} className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                      {path.label}
                    </Link>
                    {index < extraPaths.length - 1 ? " · " : null}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
