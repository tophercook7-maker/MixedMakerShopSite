import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { FreshCutFeaturedCaseStudy } from "@/components/public/FreshCutFeaturedCaseStudy";
import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
import { HOME_PAGE_FEATURED_ANALYTICS_IDS } from "@/lib/live-web-projects";
import { UmbrellaHomeHero } from "@/components/public/UmbrellaHomeHero";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
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
  mmsH2,
  mmsSectionY,
  mmsStepCircle,
  mmsUmbrellaSectionBackdrop,
  mmsTextLink,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/** Desktop: let fixed umbrella read through; mobile: warm solid for stability. */
const homeBackdrop = mmsUmbrellaSectionBackdrop;

const processSteps = [
  {
    title: "Tell me about your business",
    body: "Give me a few details and I’ll understand what you actually need.",
  },
  {
    title: "I build your preview",
    body: "I create a homepage-style mockup so you can see the direction.",
  },
  {
    title: "You decide",
    body: "If you like it, we move forward. If not, no pressure.",
  },
] as const;

export function UmbrellaHomePage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <UmbrellaHomeHero />

        <section className={cn(homeBackdrop)} id="web-design">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn(mmsGlassPanelDenseHome, "relative overflow-hidden p-8 sm:p-10 lg:p-12")}>
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#b85c1e]/10 blur-3xl"
                aria-hidden
              />
              <div className="relative max-w-3xl">
                <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Web design · primary service</p>
                <h2 className={cn(mmsH2, "mt-4")}>Web Design by Topher</h2>
                <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                  You work directly with me to build a website that helps you show up and get calls — clean, trustworthy, and
                  built around your business. No bloated agency process. No handoffs.
                </p>
                <p className={cn("mt-4 text-sm font-medium md:text-[15px]", mmsBodyFrostMuted)}>
                  Built for local businesses that need to get found, not just look “nice” online.
                </p>
                <ul className={cn("mt-9 space-y-3.5 md:text-[17px]", mmsBodyFrost)}>
                  {[
                    "Clean, modern design that builds trust fast",
                    "Built to turn visitors into calls and leads",
                    "Designed to help you show up when people search locally",
                    "Straightforward structure so people don’t get lost",
                    "Ongoing updates and support available if you want it",
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className={mmsBullet} aria-hidden>
                        ·
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-9">
                  <PublicCtaRow>
                    <TrackedPublicLink
                      href="/examples"
                      eventName="public_web_design_sample_click"
                      eventProps={{ location: "home_primary_web", label: "see_examples" }}
                      className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}
                    >
                      See My Work
                    </TrackedPublicLink>
                  </PublicCtaRow>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#e8ede8]/90")} id="show-up-google">
          <div className={cn(shell, "py-14 md:py-20")}>
            <div className={cn(mmsGlassPanelDenseHome, "mx-auto max-w-3xl p-6 sm:p-8 md:p-10")}>
              <h2 className={mmsH2}>Want to show up on Google too?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                I build sites with simple, effective structure so your business has a better chance of being found locally.
              </p>
              <div className="mt-8">
                <PublicCtaRow>
                  <TrackedPublicLink
                    href="/free-mockup"
                    eventName="public_contact_cta_click"
                    eventProps={{ location: "home_seo_cta", target: "free_mockup" }}
                    className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}
                  >
                    Get My Free Preview
                  </TrackedPublicLink>
                </PublicCtaRow>
              </div>
            </div>
          </div>
        </section>

        <HomeFeaturedWebDesignWork
          variant="light"
          immersive
          featuredAnalyticsIds={HOME_PAGE_FEATURED_ANALYTICS_IDS}
          heading="Featured Work"
          subhead="Examples of sites built to look sharp, load fast, and help your business show up when people search."
          bottomStripLead={null}
          bottomStripLinkLabel="View All Examples →"
          bottomStripHref="/examples"
        />

        <FreshCutFeaturedCaseStudy analyticsLocation="home_case_study_fresh_cut" variant="home" />

        <section className={cn("border-t border-b", homeBackdrop, "max-md:bg-[#dde8df]")} id="simple-process">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn(mmsGlassPanelDenseHome, "max-w-3xl p-6 sm:p-8")}>
              <h2 className={mmsH2}>Simple Process</h2>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6 lg:mt-12 lg:gap-8">
              {processSteps.map((step, i) => (
                <div key={step.title} className={cn(mmsGlassPanelDenseHome, "p-7 sm:p-8")}>
                  <span className={mmsStepCircle} aria-hidden>
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-[#1e241f] md:text-xl">{step.title}</h3>
                  <p className={cn("mt-4 leading-relaxed md:text-[17px]", mmsBodyFrost)}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn("border-b", homeBackdrop, "max-md:bg-[#dde8df]")}>
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn(mmsGlassPanelDenseHome, "max-w-3xl p-6 sm:p-8")}>
              <h2 className={mmsH2}>Other Things I Build</h2>
              <p className={cn("mt-5 max-w-2xl text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                MixedMakerShop isn’t just websites. I also build practical tools, custom 3D prints, and small digital systems
                when they actually solve real problems.
              </p>
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:mt-12">
              <div className={cn(mmsGlassPanelDenseHome, "p-9 sm:p-10")}>
                <h3 className="text-xl font-bold text-[#1e241f] md:text-2xl">3D Printing</h3>
                <p className={cn("mt-5 leading-relaxed md:text-[17px]", mmsBodyFrost)}>
                  Useful prints like mounts, holders, replacements, and functional designs.
                </p>
                <Link href="/3d-printing" className={cn(mmsTextLink, "mt-7 inline-block text-[15px]")}>
                  3D printing →
                </Link>
              </div>
              <div className={cn(mmsGlassPanelDenseHome, "p-9 sm:p-10")}>
                <h3 className="text-xl font-bold text-[#1e241f] md:text-2xl">Builds &amp; Tools</h3>
                <p className={cn("mt-5 leading-relaxed md:text-[17px]", mmsBodyFrost)}>
                  Custom tools, automations, and small systems built for real use.
                </p>
                <Link href="/builds" className={cn(mmsTextLink, "mt-7 inline-block text-[15px]")}>
                  Builds &amp; tools →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#ece7dd]")} id="about-topher">
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <div className={cn(mmsGlassPanelDenseHome, "p-8 sm:p-10")}>
              <h2 className={mmsH2}>About Topher</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                I’m Topher. I build websites and tools for real businesses that want something simple, clean, and effective.
              </p>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                MixedMakerShop is how I bring everything together — web design first, with 3D printing and custom builds when
                they actually make sense.
              </p>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>
                You won’t be passed around or stuck dealing with layers of people. You work directly with me from start to
                finish.
              </p>
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
          <div className={cn(shell, "py-24 md:py-32")}>
            <div className={cn(mmsCtaPanelHome, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
              <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>
                Want to see what your business could look like online?
              </h2>
              <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsBodyFrost)}>
                I’ll put together a free homepage-style preview so you can see the direction before committing to anything.
              </p>
              <PublicCtaRow align="center" className="mt-10 w-full justify-center">
                <TrackedPublicLink
                  href="/free-mockup"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "free_mockup" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex w-full min-w-[12rem] items-center justify-center gap-2 px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Get My Free Preview
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "contact" }}
                  className={cn(
                    mmsBtnSecondary,
                    "w-full min-w-[10rem] justify-center px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Contact Me
                </TrackedPublicLink>
              </PublicCtaRow>
              <p className={cn("mx-auto mt-4 max-w-lg text-xs font-medium sm:text-sm", mmsBodyFrostMuted)}>
                No pressure. Just a real preview if you want one.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
