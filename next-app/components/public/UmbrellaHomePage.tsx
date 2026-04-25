import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { UmbrellaHomeHero } from "@/components/public/UmbrellaHomeHero";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassCtaRowWrap,
  mmsSectionEyebrowOnGlass,
  mmsH3OnGlass,
  mmsHomeGlassStackGap,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionY,
  mmsStepCircleOnGlass,
  mmsUmbrellaSectionBackdrop,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/** Desktop: let fixed umbrella read through; mobile: warm solid for stability. */
const homeBackdrop = mmsUmbrellaSectionBackdrop;

const chooserCards = [
  {
    title: "I need a better website",
    body: "Websites for local businesses that need more calls, bookings, and leads.",
    href: "/websites-tools",
    cta: "Explore Websites & Tools",
  },
  {
    title: "I need a digital tool or template",
    body: "Simple tools, forms, templates, downloads, and business kits.",
    href: "/websites-tools#templates-kits",
    cta: "View Tools & Kits",
  },
  {
    title: "I need something 3D printed",
    body: "Useful prints, bookmarks, gifts, replacement pieces, and custom requests from GiGi’s Print Shop.",
    href: "/3d-printing",
    cta: "Visit GiGi’s Print Shop",
    accent: "pink",
  },
  {
    title: "I need lawn or property help",
    body: "Local outdoor help, cleanup, and property services.",
    href: "/property-care",
    cta: "View Property Care",
  },
  {
    title: "I want to see what’s new",
    body: "Vote on ideas, suggest something, or see what we’re building next.",
    href: "/idea-lab",
    cta: "Visit the Idea Lab",
  },
] as const;

const featuredWork = [
  {
    title: "Fresh Cut Property Care",
    body: "A focused property-care website for lawn care, cleanup, and local estimate requests.",
    href: "https://freshcutpropertycare.com/",
    cta: "Visit Fresh Cut",
    external: true,
  },
  {
    title: "Deep Well Audio",
    body: "A clean creative/audio platform built around organized content and exploration.",
    href: "https://deepwellaudio.com/",
    cta: "Visit Deep Well Audio",
    external: true,
  },
  {
    title: "StrainSpotter",
    body: "A practical app-style project built around fast scanning, helpful results, and interactive tools.",
    href: "https://strainspotter.app/",
    cta: "Visit StrainSpotter",
    external: true,
  },
  {
    title: "Website Preview Generator",
    body: "A MixedMakerShop tool for showing local businesses what a better website could look like.",
    href: publicFreeMockupFunnelHref,
    cta: "Start a Free Preview",
    external: false,
  },
] as const;

const departmentFeatures = [
  {
    eyebrow: "Websites & Tools",
    title: "Websites, landing pages, and small systems for local businesses.",
    body: "Topher builds practical online systems that help small businesses look better, explain what they do, and get more calls, bookings, and leads.",
    href: "/websites-tools",
    cta: "Explore Websites & Tools",
  },
  {
    eyebrow: "GiGi’s Print Shop",
    title: "Useful 3D printed items with a practical handmade feel.",
    body: "GiGi handles most of the 3D printing side: bookmarks, gifts, holders, replacement pieces, church items, seasonal prints, and custom requests.",
    href: "/3d-printing",
    cta: "Start a Print Request",
    className: "border-pink-300/30 bg-gradient-to-br from-pink-500/12 via-white/8 to-orange-400/8",
  },
  {
    eyebrow: "Property Care",
    title: "Fresh Cut is the focused property-care path.",
    body: "MixedMakerShop points property-care visitors to Fresh Cut Property Care for lawn care, yard cleanup, brush clearing, and estimate requests.",
    href: "/property-care",
    cta: "View Fresh Cut Bridge",
  },
  {
    eyebrow: "Idea Lab",
    title: "New ideas before they become full services or tools.",
    body: "Vote on what sounds useful, suggest something, or see what Topher is testing next.",
    href: "/idea-lab",
    cta: "Suggest an Idea",
  },
] as const;

export function UmbrellaHomePage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <UmbrellaHomeHero />

        <section className={cn(homeBackdrop)} id="choose">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Start Here</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>What do you need help with today?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Pick the department that fits. MixedMakerShop stays broad, but each path is organized around one clear
                need.
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-5", mmsHomeGlassStackGap)}>
              {chooserCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className={cn(
                    "group public-glass-box--soft public-glass-box--pad flex min-h-[15rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline",
                    "accent" in card && card.accent === "pink" && "border-pink-300/25 bg-pink-400/10",
                  )}
                >
                  <h3 className={mmsH3OnGlass}>{card.title}</h3>
                  <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                    {card.body}
                  </p>
                  <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="featured-work">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Featured Work</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Proof that the paths under MixedMakerShop are real.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                A quick proof wall before the departments: local service sites, creative platforms, app-style tools, and
                the free preview flow.
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-4", mmsHomeGlassStackGap)}>
              {featuredWork.map((work) =>
                work.external ? (
                  <a
                    key={work.title}
                    href={work.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group public-glass-box--soft public-glass-box--pad flex min-h-[14rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline"
                  >
                    <h3 className={mmsH3OnGlass}>{work.title}</h3>
                    <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {work.body}
                    </p>
                    <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                      {work.cta}
                      <ExternalLink className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </a>
                ) : (
                  <Link
                    key={work.title}
                    href={work.href}
                    className="group public-glass-box--soft public-glass-box--pad flex min-h-[14rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline"
                  >
                    <h3 className={mmsH3OnGlass}>{work.title}</h3>
                    <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {work.body}
                    </p>
                    <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                      {work.cta}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="departments">
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-6 lg:grid-cols-2">
              {departmentFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className={cn(
                    "public-glass-box--soft public-glass-box--pad",
                    "className" in feature && feature.className,
                  )}
                >
                  <p className={mmsSectionEyebrowOnGlass}>{feature.eyebrow}</p>
                  <h2 className={cn(mmsH2OnGlass, "mt-4 !text-2xl md:!text-3xl")}>{feature.title}</h2>
                  <p className={cn("mt-5 text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                    {feature.body}
                  </p>
                  <Link href={feature.href} className={cn(mmsTextLinkOnGlass, "mt-7 inline-flex items-center gap-2")}>
                    {feature.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              ))}
            </div>
            <div className={cn("public-glass-box public-glass-box--pad mt-8 max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>Free website preview</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Want to see what your business could look like online?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Topher can build a homepage-style preview so you can see the direction before you commit.
              </p>
              <div className={mmsOnGlassCtaRowWrap}>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_department_feature", target: "free_mockup" }}
                  className={cn(mmsBtnPrimary, "inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Get a Free Website Preview
                </TrackedPublicLink>
              </div>
            </div>
          </div>
        </section>

        <section className={cn("border-t border-b", homeBackdrop, "max-md:bg-[#111510]")} id="about-topher-gigi">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>About Topher &amp; GiGi</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>About Topher</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                I&apos;m Topher, the idea engine behind MixedMakerShop.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                I build websites, digital tools, local service pages, and practical online systems for small businesses.
                I&apos;ve always had more ideas than one simple website could hold, so MixedMakerShop became the home base —
                a place where web design, digital tools, property services, 3D printing, and new experiments can all live
                under one organized roof.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                The goal is simple: build useful things that help real people.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Some projects are for local businesses. Some are for homeowners. Some are digital. Some are printed. Some
                are still being tested in the Idea Lab. But everything here starts with the same question:
              </p>
              <p className="mt-7 rounded-2xl border border-white/12 bg-white/10 px-5 py-4 text-lg font-semibold text-white">
                “What would actually help someone?”
              </p>
            </div>
            <div className={cn("grid gap-6 md:grid-cols-3", mmsHomeGlassStackGap)}>
              {[
                "Topher builds websites, tools, funnels, and idea-driven projects.",
                "GiGi handles most of the 3D printing side through GiGi’s Print Shop.",
                "MixedMakerShop keeps the departments organized under one practical creative studio.",
              ].map((line, i) => (
                <div key={line} className="public-glass-box--soft public-glass-box--pad">
                  <span className={mmsStepCircleOnGlass} aria-hidden>{i + 1}</span>
                  <p className={cn("text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={cn(
            "border-t",
            homeBackdrop,
            "max-md:bg-gradient-to-b max-md:from-[#e8e3da] max-md:to-[#dcd6cc]",
          )}
          id="home-contact"
        >
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad mx-auto max-w-2xl text-center")}>
              <h2 className={cn(mmsH2OnGlass, "!text-2xl md:!text-3xl")}>
                Ready to choose a path?
              </h2>
              <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsOnGlassPrimary)}>
                Start with a free website preview, send GiGi a print idea, ask about property help, or suggest something
                new for the Idea Lab.
              </p>
              <PublicCtaRow align="center" className={cn(mmsOnGlassCtaRowWrap, "w-full justify-center")}>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "free_mockup" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex w-full min-w-[12rem] items-center justify-center gap-2 px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Get a Free Website Preview
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "contact" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "w-full min-w-[10rem] justify-center px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Contact Topher
                </TrackedPublicLink>
              </PublicCtaRow>
              <p className={cn("mx-auto mt-4 max-w-lg text-sm font-medium sm:text-[15px]", mmsOnGlassSecondary)}>
                Useful things built online, outside, and in the workshop.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
