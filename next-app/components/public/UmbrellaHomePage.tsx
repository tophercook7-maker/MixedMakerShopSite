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
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsBulletOnGlass,
  mmsH2OnGlass,
  mmsOnGlassCtaRowWrap,
  mmsSectionEyebrowOnGlass,
  mmsH3OnGlass,
  mmsH3OnGlassLg,
  mmsHomeGlassStackGap,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsOnGlassMuted,
  mmsSectionY,
  mmsStepCircleOnGlass,
  mmsUmbrellaSectionBackdrop,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/** Desktop: let fixed umbrella read through; mobile: warm solid for stability. */
const homeBackdrop = mmsUmbrellaSectionBackdrop;

const processSteps = [
  {
    title: "Tell me about your business",
    body: "Share what you sell, who you serve, and what a strong lead looks like for you.",
  },
  {
    title: "I build your preview",
    body: "You get a real homepage-style mockup so you can see layout, tone, and direction before you commit.",
  },
  {
    title: "You decide",
    body: "If it fits, we keep going. If not, no pressure.",
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
            <div className={cn("public-glass-box public-glass-box--pad max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>Lead-focused web design</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Websites that help you win trust—and clients</h2>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                You work directly with me on a site that turns searches and visits into calls and inquiries—clear, credible,
                and built around how you actually sell. No bloated agency process. No handoffs.
              </p>
              <p className={cn("mt-4 text-sm font-medium md:text-[15px]", mmsOnGlassSecondary)}>
                For local businesses that need more leads and clearer trust—not just a prettier page.
              </p>
              <p className={cn("mt-3 text-sm leading-snug md:text-[15px]", mmsOnGlassMuted)}>
                Perfect for landscapers, local services, contractors, and small businesses that depend on calls, bookings,
                and trust.
              </p>
              <ul className={cn("mt-9 space-y-3.5 md:text-[17px]", mmsOnGlassPrimary)}>
                {[
                  "Design that builds trust fast when someone lands on your site",
                  "Structure built to turn visitors into calls, chats, and form fills",
                  "Built to help you show up when locals search for what you offer",
                  "Simple paths so people know what to do next—not bounce",
                  "Ongoing updates when you want to sharpen conversion over time",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className={mmsBulletOnGlass} aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className={mmsOnGlassCtaRowWrap}>
                <PublicCtaRow>
                  <TrackedPublicLink
                    href="/examples"
                    eventName="public_web_design_sample_click"
                    eventProps={{ location: "home_primary_web", label: "see_examples" }}
                    className={cn(mmsBtnSecondaryOnGlass, "px-8 no-underline hover:no-underline")}
                  >
                    See My Work
                  </TrackedPublicLink>
                </PublicCtaRow>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#e8ede8]/90")} id="show-up-google">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad mx-auto max-w-3xl")}>
              <h2 className={mmsH2OnGlass}>Get found—then get the call</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                A lot of new business still starts with search. I build clear structure and pages so the right people can find
                you—and see why you&apos;re the right call.
              </p>
              <div className={mmsOnGlassCtaRowWrap}>
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
          subhead="Live sites for real businesses—fast, clear, and built to turn visits into leads."
          bottomStripLead={null}
          bottomStripLinkLabel="View All Examples →"
          bottomStripHref="/examples"
        />

        <FreshCutFeaturedCaseStudy analyticsLocation="home_case_study_fresh_cut" variant="home" />

        <section className={cn("border-t border-b", homeBackdrop, "max-md:bg-[#dde8df]")} id="simple-process">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad max-w-3xl")}>
              <h2 className={mmsH2OnGlass}>Simple Process</h2>
              <p className={cn("mt-3 max-w-2xl text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                From your goals to a real preview—straightforward steps, no agency maze.
              </p>
            </div>
            <div
              className={cn(
                "grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8",
                mmsHomeGlassStackGap,
              )}
            >
              {processSteps.map((step, i) => (
                <div key={step.title} className={cn("public-glass-box--soft public-glass-box--pad")}>
                  <span className={mmsStepCircleOnGlass} aria-hidden>
                    {i + 1}
                  </span>
                  <h3 className={mmsH3OnGlass}>{step.title}</h3>
                  <p className={cn("mt-4 leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn("border-b", homeBackdrop, "max-md:bg-[#dde8df]")}>
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad max-w-3xl")}>
              <h2 className={mmsH2OnGlass}>Other Things I Build</h2>
              <p className={cn("mt-5 max-w-2xl text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Websites stay the center of what I do. When it genuinely helps your business, I also deliver practical 3D
                prints and small tools that remove friction and save time.
              </p>
            </div>
            <div className={cn("grid gap-8 lg:grid-cols-2", mmsHomeGlassStackGap)}>
              <div className={cn("public-glass-box--soft public-glass-box--pad")}>
                <h3 className={mmsH3OnGlassLg}>3D Printing</h3>
                <p className={cn("mt-5 leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                  Functional prints—mounts, holders, replacements—when a physical fix keeps your team or customers moving.
                </p>
                <Link href="/3d-printing" className={cn(mmsTextLinkOnGlass, "mt-7 inline-block text-[15px]")}>
                  3D printing →
                </Link>
              </div>
              <div className={cn("public-glass-box--soft public-glass-box--pad")}>
                <h3 className={mmsH3OnGlassLg}>Builds &amp; Tools</h3>
                <p className={cn("mt-5 leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                  Small automations and custom tools when they save hours, cut errors, or support how you serve customers.
                </p>
                <Link href="/builds" className={cn(mmsTextLinkOnGlass, "mt-7 inline-block text-[15px]")}>
                  Builds &amp; tools →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#ece7dd]")} id="about-topher">
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <div className={cn("public-glass-box--soft public-glass-box--pad")}>
              <h2 className={mmsH2OnGlass}>About Topher</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                I&apos;m Topher. I build websites and tools for owners who want clarity, credibility, and more real leads—not
                more complexity.
              </p>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                MixedMakerShop starts with web design and free previews, with 3D printing and custom builds when they
                genuinely support how you operate.
              </p>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                You won&apos;t get passed around. You work directly with me from first conversation to launch—and beyond if
                you want it.
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
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad mx-auto max-w-2xl text-center")}>
              <h2 className={cn(mmsH2OnGlass, "!text-2xl md:!text-3xl")}>
                Ready for a site that brings in more leads?
              </h2>
              <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsOnGlassPrimary)}>
                I&apos;ll build a free homepage-style preview so you can see the direction—then you decide if we keep going.
              </p>
              <PublicCtaRow align="center" className={cn(mmsOnGlassCtaRowWrap, "w-full justify-center")}>
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
                    mmsBtnSecondaryOnGlass,
                    "w-full min-w-[10rem] justify-center px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Contact Me
                </TrackedPublicLink>
              </PublicCtaRow>
              <p className={cn("mx-auto mt-4 max-w-lg text-sm font-medium sm:text-[15px]", mmsOnGlassSecondary)}>
                If your business depends on calls, bookings, or local visibility—this is built for you.
              </p>
              <p className={cn("mx-auto mt-3 max-w-lg text-xs sm:text-sm", mmsOnGlassMuted)}>
                No pressure—just a clear preview when you&apos;re ready.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
