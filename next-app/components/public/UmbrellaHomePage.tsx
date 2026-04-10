import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
import { HOME_PAGE_FEATURED_ANALYTICS_IDS } from "@/lib/live-web-projects";
import { UmbrellaHomeHero } from "@/components/public/UmbrellaHomeHero";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBodyFrostMuted,
  mmsBullet,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsCtaPanelHome,
  mmsEyebrow,
  mmsGlassPanelDenseHome,
  mmsGlassPanelHome,
  mmsH2,
  mmsSectionBorder,
  mmsSectionY,
  mmsTextLink,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const homePricingPackages = [
  {
    name: "Starter Website",
    price: "$400",
    blurb: "A clean, professional site to get your business online and looking right.",
  },
  {
    name: "Growth Website",
    price: "$600",
    blurb: "Built to help you get more leads, better visibility, and real results.",
  },
  {
    name: "Ongoing Support",
    price: "from $89/month",
    blurb: "Updates, improvements, and support to keep your site working.",
  },
] as const;

/** Desktop: let fixed umbrella read through; mobile: warm solid for stability. */
const homeBackdrop = cn(
  "border-b",
  mmsSectionBorder,
  "max-md:bg-[#ece7dd]",
  "md:bg-transparent",
);

export function UmbrellaHomePage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      {/* Desktop/tablet: umbrella locked to viewport; all sections below scroll over it (see z-index). */}
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <UmbrellaHomeHero />

        {/* Trust strip — glass over umbrella on desktop */}
        <section
          className={cn(
            "relative -mt-10 py-8 md:-mt-14 md:py-9 lg:-mt-16",
            homeBackdrop,
            "md:pt-10 md:pb-10",
          )}
          aria-label="What to expect"
        >
        <div className={cn(shell, "px-5")}>
          <div className={cn(mmsGlassPanelHome, "mx-auto px-5 py-7 md:px-8 md:py-8")}>
          <ul className="flex flex-col gap-3 text-center text-sm font-semibold text-[#1e241f] sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-2">
            <li>Web Design by Topher</li>
            <li className="hidden sm:block text-[#3f5a47]/35" aria-hidden>
              ·
            </li>
            <li>3D Printing &amp; Custom Solutions</li>
            <li className="hidden sm:block text-[#3f5a47]/35" aria-hidden>
              ·
            </li>
            <li>Practical Digital Builds</li>
            <li className="hidden sm:block text-[#3f5a47]/35" aria-hidden>
              ·
            </li>
            <li>Based in Hot Springs, Arkansas</li>
          </ul>
          </div>
        </div>
      </section>

      {/* Web design — dominant panel */}
      <section className={cn(homeBackdrop)} id="web-design">
        <div className={cn(shell, mmsSectionY)}>
          <div className={cn(mmsGlassPanelDenseHome, "relative overflow-hidden p-8 sm:p-10 lg:p-12")}>
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#b85c1e]/10 blur-3xl"
              aria-hidden
            />
            <div className="relative max-w-3xl">
              <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Primary service</p>
              <h2 className={cn(mmsH2, "mt-4")}>Web Design by Topher</h2>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                This is the core service side of MixedMakerShop. I build websites that help businesses look professional, build
                trust fast, and turn visitors into real calls, leads, and customers.
              </p>
              <ul className={cn("mt-9 space-y-3.5 md:text-[17px]", mmsBodyFrost)}>
                {[
                  "Clean, dependable business websites",
                  "Built to help people trust you fast",
                  "Made for real businesses, not just trends",
                  "Direct communication with the person building it",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className={mmsBullet} aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedPublicLink
                  href="/builds#builds-experiments"
                  eventName="public_web_design_sample_click"
                  eventProps={{ location: "home_primary_web", label: "see_builds_samples" }}
                  className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}
                >
                  Browse builds &amp; samples
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/free-mockup"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_primary_web", target: "free_mockup" }}
                  className={cn(mmsBtnPrimary, "inline-flex items-center justify-center gap-2 px-8 no-underline hover:no-underline")}
                >
                  Get My Free Website Preview
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
              </div>
              <p className={cn("mt-4 text-xs font-medium sm:text-sm", mmsBodyFrostMuted)}>
                No pressure. Just a real preview built for your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={cn(homeBackdrop, "max-md:bg-[#e5e0d6]")} id="pricing" aria-labelledby="home-pricing-heading">
        <div className={cn(shell, mmsSectionY)}>
          <div className={cn(mmsGlassPanelDenseHome, "max-w-3xl p-6 sm:p-8")}>
            <h2 id="home-pricing-heading" className={mmsH2}>
              Simple, honest pricing
            </h2>
            <p className={cn("mt-5 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
              No guesswork. Just clear options depending on what your business needs.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {homePricingPackages.map((pkg) => (
              <div key={pkg.name} className={cn(mmsGlassPanelDenseHome, "flex flex-col p-6 sm:p-8")}>
                <h3 className="text-lg font-bold tracking-tight text-[#1e241f] md:text-xl">{pkg.name}</h3>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#8a4b2a] md:text-[1.65rem]">{pkg.price}</p>
                <p className={cn("mt-5 text-sm leading-relaxed md:text-[15px]", mmsBodyFrost)}>{pkg.blurb}</p>
              </div>
            ))}
          </div>

          <div className={cn(mmsGlassPanelDenseHome, "mx-auto mt-12 max-w-2xl p-8 text-center sm:p-10")}>
            <p className={cn("text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
              Not sure what you need? I&apos;ll design a free homepage preview first so you can see the direction before
              committing.
            </p>
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: "home_pricing", target: "free_mockup" }}
              className={cn(
                mmsBtnPrimary,
                "mx-auto mt-8 inline-flex min-h-[3.35rem] w-full max-w-md items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
              )}
            >
              Get My Free Website Preview
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedPublicLink>
          </div>
        </div>
      </section>

      {/* Free preview — core offer (matches ad messaging) */}
      <section className={cn(homeBackdrop, "max-md:bg-[#e8e3d9]")}>
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <div className={cn(mmsGlassPanelDenseHome, "p-8 sm:p-10")}>
            <h2 className={mmsH2}>Want to see what your website could look like before committing?</h2>
            <p className={cn("mt-8 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
              I&apos;ll put together a free homepage preview so you can see exactly how it could look and feel — before you
              decide on anything.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "home_mockup_section", target: "free_mockup" }}
                className={cn(
                  mmsBtnPrimary,
                  "inline-flex min-h-[3rem] items-center justify-center gap-2 px-8 no-underline hover:no-underline",
                )}
              >
                Get My Free Website Preview
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "home_mockup_section", target: "start_project" }}
                className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}
              >
                Start My Project
              </TrackedPublicLink>
            </div>
            <p className={cn("mt-4 text-xs font-medium sm:text-sm", mmsBodyFrostMuted)}>
              No pressure. Just a real preview built for your business.
            </p>
          </div>
        </div>
      </section>

      <HomeFeaturedWebDesignWork
        variant="light"
        immersive
        featuredAnalyticsIds={HOME_PAGE_FEATURED_ANALYTICS_IDS}
        heading="Featured work"
        subhead="Live client sites plus a tools-and-systems example — browse Builds for the full library."
      />

      {/* Umbrella services */}
      <section className={cn("border-y", homeBackdrop, "max-md:bg-[#dde8df]")}>
        <div className={cn(shell, mmsSectionY)}>
          <div className={cn(mmsGlassPanelDenseHome, "max-w-3xl p-6 sm:p-8")}>
            <h2 className={mmsH2}>What else I build through MixedMakerShop</h2>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:mt-12">
            <div className={cn(mmsGlassPanelDenseHome, "p-9 sm:p-10")}>
              <h3 className="text-xl font-bold text-[#1e241f] md:text-2xl">3D Printing by Topher</h3>
              <p className={cn("mt-5 leading-relaxed md:text-[17px]", mmsBodyFrost)}>
                Custom parts, replacement pieces, functional prints, mounts, organizers, prototypes, and practical solutions
                when something needs to be made or fixed.
              </p>
              <Link href="/builds#builds-3d-printing" className={cn(mmsTextLink, "mt-7 inline-block text-[15px]")}>
                3D printing on Builds →
              </Link>
            </div>
            <div className={cn(mmsGlassPanelDenseHome, "p-9 sm:p-10")}>
              <h3 className="text-xl font-bold text-[#1e241f] md:text-2xl">Digital Builds</h3>
              <p className={cn("mt-5 leading-relaxed md:text-[17px]", mmsBodyFrost)}>
                I also build app concepts, internal tools, AI-assisted ideas, and practical digital systems that go beyond a
                standard website.
              </p>
              <Link
                href="/builds"
                className={cn(mmsTextLink, "mt-7 inline-block text-[15px]")}
              >
                See digital builds →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Topher */}
      <section className={cn(homeBackdrop, "max-md:bg-[#e4ebe4]")}>
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <div className={cn(mmsGlassPanelDenseHome, "p-8 sm:p-10")}>
            <h2 className={mmsH2}>Direct, practical, and built to actually help</h2>
            <ul className={cn("mt-10 space-y-3.5 md:text-[17px]", mmsBodyFrost)}>
            {[
              "You work directly with Topher",
              "No agency layers or bloated process",
              "Web, physical problem-solving, and digital thinking under one roof",
              "Focused on useful results, not just appearances",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className={mmsBullet} aria-hidden>
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className={cn(homeBackdrop, "max-md:bg-[#ece7dd]")} id="about-topher">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <div className={cn(mmsGlassPanelDenseHome, "p-8 sm:p-10")}>
            <h2 className={mmsH2}>About Topher</h2>
            <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
              I build things that are actually useful. MixedMakerShop is the umbrella studio where I combine web design, 3D
              printing, and digital builds into one place for businesses, ideas, and real-world problem solving.
            </p>
            <div className="mt-10">
              <Link href="/about" className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}>
                Read More About Topher
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        className={cn(
          "border-t",
          homeBackdrop,
          "max-md:bg-gradient-to-b max-md:from-[#e8e3da] max-md:to-[#dcd6cc]",
        )}
        id="home-contact"
      >
        <div className={cn(shell, "py-24 md:py-32")}>
          <div className={cn(mmsCtaPanelHome, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Let&apos;s build something useful</h2>
            <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsBodyFrost)}>
              If you need a website, a custom print, or help turning an idea into something real, MixedMakerShop gives you a
              direct way to get it moving.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "home_cta", target: "free_mockup" }}
                className={cn(
                  mmsBtnPrimary,
                  "inline-flex w-full items-center justify-center gap-2 px-8 sm:w-auto no-underline hover:no-underline",
                )}
              >
                Get My Free Website Preview
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "home_cta", target: "start_project" }}
                className={cn(mmsBtnSecondary, "w-full justify-center px-8 sm:w-auto no-underline hover:no-underline")}
              >
                Start My Project
              </TrackedPublicLink>
            </div>
            <p className={cn("mx-auto mt-4 max-w-lg text-xs font-medium sm:text-sm", mmsBodyFrostMuted)}>
              No pressure. Just a real preview built for your business.
            </p>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
