import Link from "next/link";
import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
import { TopherAvatarFigure } from "@/components/public/TopherAvatarFigure";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsCard,
  mmsCtaPanel,
  mmsEyebrow,
  mmsH1,
  mmsH2,
  mmsLead,
  mmsPageBg,
  mmsSectionY,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

export function UmbrellaHomePage() {
  return (
    <div className={mmsPageBg}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-[#faf9f6] via-[#f4f3ef] to-[#ebe8e2]/95">
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(234, 88, 12, 0.06), transparent 55%), radial-gradient(ellipse 60% 45% at 90% 20%, rgba(15, 118, 110, 0.05), transparent 50%)",
          }}
          aria-hidden
        />
        <div className={cn(shell, mmsSectionY, "relative z-[1]")}>
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,380px)] lg:gap-20">
            <div>
              <p className={mmsEyebrow}>MixedMakerShop — Built by Topher</p>
              <h1 className={cn(mmsH1, "mt-6 max-w-[22ch] lg:max-w-[26ch]")}>
                Websites, custom solutions, and digital builds that make things work better.
              </h1>
              <p className={cn(mmsLead, "mt-7 max-w-2xl")}>
                I&apos;m Topher. MixedMakerShop is where I build websites, 3D printed solutions, and practical digital tools
                for people who need something real — not more fluff.
              </p>
              <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedPublicLink
                  href="/free-mockup"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_hero", target: "free_mockup" }}
                  className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}
                >
                  Get a Free Website Mockup
                </TrackedPublicLink>
                <Link href="#real-work" className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}>
                  See My Work
                </Link>
              </div>
              <p className="mt-4 max-w-xl text-sm font-medium text-slate-600 md:text-[0.9375rem]">
                I&apos;ll show you what your site could look like before you commit.
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500 md:text-sm">
                No pressure · No obligation · Just a preview
              </p>
            </div>
            <div className="flex w-full justify-center lg:justify-end lg:pl-2">
              <div className="w-full max-w-[min(100%,320px)] lg:w-auto">
                <TopherAvatarFigure className="mx-auto lg:mx-0" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200/65 bg-white/60 py-8 backdrop-blur-sm md:py-9" aria-label="What to expect">
        <div className={cn(shell, "px-5")}>
          <ul className="flex flex-col gap-3 text-center text-sm font-medium text-slate-600 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-2">
            <li>Web Design by Topher</li>
            <li className="hidden sm:block text-slate-300" aria-hidden>
              ·
            </li>
            <li>3D Printing &amp; Custom Solutions</li>
            <li className="hidden sm:block text-slate-300" aria-hidden>
              ·
            </li>
            <li>Practical Digital Builds</li>
            <li className="hidden sm:block text-slate-300" aria-hidden>
              ·
            </li>
            <li>Based in Hot Springs, Arkansas</li>
          </ul>
        </div>
      </section>

      {/* Web design — dominant panel */}
      <section className="border-b border-slate-200/50 bg-[#f4f3ef]/95" id="web-design">
        <div className={cn(shell, mmsSectionY)}>
          <div
            className={cn(
              mmsCard,
              "relative overflow-hidden border-amber-200/35 bg-gradient-to-br from-white via-white to-amber-50/40 p-8 sm:p-10 lg:p-12",
            )}
          >
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
              aria-hidden
            />
            <div className="relative max-w-3xl">
              <p className={cn(mmsEyebrow, "!text-amber-900/90")}>Primary service</p>
              <h2 className={cn(mmsH2, "mt-4")}>Web Design by Topher</h2>
              <p className="mt-6 text-base leading-relaxed text-slate-600 md:text-lg">
                This is the core service side of MixedMakerShop. I build websites that help businesses look professional, build
                trust fast, and turn visitors into real calls, leads, and customers.
              </p>
              <ul className="mt-9 space-y-3.5 text-slate-700 md:text-[17px]">
                {[
                  "Clean, dependable business websites",
                  "Built to help people trust you fast",
                  "Made for real businesses, not just trends",
                  "Direct communication with the person building it",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="font-bold text-amber-700" aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedPublicLink
                  href="/website-samples"
                  eventName="public_web_design_sample_click"
                  eventProps={{ location: "home_primary_web", label: "see_web_examples" }}
                  className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}
                >
                  See Web Design Examples
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/free-mockup"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_primary_web", target: "free_mockup" }}
                  className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}
                >
                  Get a Free Website Mockup
                </TrackedPublicLink>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500 sm:text-sm">
                No pressure · No obligation · Just a preview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free mockup — core offer */}
      <section className="border-b border-slate-200/50 bg-white/85">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>Want to see your website before you commit?</h2>
          <p className="mt-8 text-base leading-relaxed text-slate-600 md:text-lg">
            I can mock up a version of your site so you can see exactly how it could look and feel.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: "home_mockup_section", target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}
            >
              Get My Free Mockup
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
          <p className="mt-4 text-xs font-medium text-slate-500 sm:text-sm">
            No pressure · No obligation · Just a preview
          </p>
        </div>
      </section>

      <HomeFeaturedWebDesignWork
        variant="light"
        heading="Featured Web Design Work"
        subhead="These are real websites I've built to help businesses look established, clear, and worth contacting."
      />

      {/* Umbrella services */}
      <section className="border-y border-slate-200/50 bg-[#ebe8e2]/50">
        <div className={cn(shell, mmsSectionY)}>
          <h2 className={cn(mmsH2, "max-w-2xl")}>What else I build through MixedMakerShop</h2>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div className={cn(mmsCard, "p-9 sm:p-10")}>
              <h3 className="text-xl font-bold text-slate-900 md:text-2xl">3D Printing by Topher</h3>
              <p className="mt-5 text-slate-600 leading-relaxed">
                Custom parts, replacement pieces, functional prints, mounts, organizers, prototypes, and practical solutions
                when something needs to be made or fixed.
              </p>
              <TrackedPublicLink
                href="/3d-printing"
                eventName="public_home_path_cta"
                eventProps={{ path: "3d_printing", label: "explore_3d_home" }}
                className="mt-7 inline-block text-sm font-semibold text-amber-900 underline-offset-4 hover:underline"
              >
                Explore 3D printing →
              </TrackedPublicLink>
            </div>
            <div className={cn(mmsCard, "p-9 sm:p-10")}>
              <h3 className="text-xl font-bold text-slate-900 md:text-2xl">Digital Builds</h3>
              <p className="mt-5 text-slate-600 leading-relaxed">
                I also build app concepts, internal tools, AI-assisted ideas, and practical digital systems that go beyond a
                standard website.
              </p>
              <Link
                href="/builds"
                className="mt-7 inline-block text-sm font-semibold text-amber-900 underline-offset-4 hover:underline"
              >
                See digital builds →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Topher */}
      <section className="border-b border-slate-200/50 bg-white/80">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>Direct, practical, and built to actually help</h2>
          <ul className="mt-10 space-y-3.5 text-slate-700 md:text-[17px]">
            {[
              "You work directly with Topher",
              "No agency layers or bloated process",
              "Web, physical problem-solving, and digital thinking under one roof",
              "Focused on useful results, not just appearances",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="font-bold text-amber-700" aria-hidden>
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* About preview */}
      <section className="border-b border-slate-200/50 bg-[#f4f3ef]/90" id="about-topher">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>About Topher</h2>
          <p className="mt-7 text-base leading-relaxed text-slate-600 md:text-lg">
            I build things that are actually useful. MixedMakerShop is the umbrella studio where I combine web design, 3D
            printing, and digital builds into one place for businesses, ideas, and real-world problem solving.
          </p>
          <div className="mt-10">
            <Link href="/about" className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}>
              Read More About Topher
            </Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-slate-200/55 bg-gradient-to-b from-[#faf9f6] to-[#e8edf2]/90" id="home-contact">
        <div className={cn(shell, "py-24 md:py-32")}>
          <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Let&apos;s build something useful</h2>
            <p className="mx-auto mt-5 max-w-lg text-slate-600 md:text-lg">
              If you need a website, a custom print, or help turning an idea into something real, MixedMakerShop gives you a
              direct way to get it moving.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "home_cta", target: "free_mockup" }}
                className={cn(mmsBtnPrimary, "w-full justify-center px-8 sm:w-auto no-underline hover:no-underline")}
              >
                Get My Free Mockup
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
            <p className="mx-auto mt-4 max-w-lg text-xs font-medium text-slate-500 sm:text-sm">
              No pressure · No obligation · Just a preview
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
