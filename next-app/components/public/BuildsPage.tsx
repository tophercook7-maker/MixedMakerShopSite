import Link from "next/link";
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

export function BuildsPage() {
  return (
    <div className={mmsPageBg}>
      <section className="border-b border-slate-200/65 bg-gradient-to-b from-white to-[#f4f3ef]">
        <div className={cn(shell, mmsSectionY, "max-w-4xl")}>
          <p className={mmsEyebrow}>Digital Builds by Topher</p>
          <h1 className={cn(mmsH1, "mt-6")}>Beyond websites: tools, app ideas, and practical systems.</h1>
          <p className={cn(mmsLead, "mt-7 max-w-2xl")}>
            I also work on bigger digital ideas — app concepts, AI-assisted tools, and practical systems that solve real
            problems.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200/50 bg-white/85">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <p className="text-base leading-relaxed text-slate-600 md:text-lg">
            This side of MixedMakerShop shows the broader build capability behind the web design work. Even when someone
            hires me for a website, they&apos;re working with someone who understands bigger systems too.
          </p>
          <p className="mt-6 text-sm font-medium italic text-slate-500 md:text-[0.9375rem]">
            These are real builds and concepts, not overhyped products.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200/50 bg-[#ebe8e2]/45">
        <div className={cn(shell, mmsSectionY)}>
          <h2 className={mmsH2}>Project highlights</h2>
          <p className="mt-6 max-w-2xl text-slate-600 md:text-[17px]">
            A few public entry points — some are experiments, tools, or internal builds in progress. Nothing here is framed
            as a finished product unless it&apos;s live for you to use.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-10">
            <div className={cn(mmsCard, "p-9 sm:p-10")}>
              <h3 className="text-lg font-bold text-slate-900">Examples hub</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                Web samples, the 3D printing service path, landing pages, and lightweight tools — bundled as a simple
                starting point.
              </p>
              <Link
                href="/examples"
                className="mt-8 inline-block text-sm font-semibold text-amber-900 underline-offset-4 hover:underline"
              >
                Open examples →
              </Link>
            </div>
            <div className={cn(mmsCard, "p-9 sm:p-10")}>
              <h3 className="text-lg font-bold text-slate-900">Small utilities &amp; experiments</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                Free tools like the Website Roast and Website Check are real builds — useful on their own, and a good sign of
                how I think about structure and clarity.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                <Link href="/tools" className="text-sm font-semibold text-amber-900 underline-offset-4 hover:underline">
                  Tools →
                </Link>
                <Link href="/website-roast" className="text-sm font-semibold text-amber-900 underline-offset-4 hover:underline">
                  Website Roast →
                </Link>
                <Link
                  href="/free-website-check"
                  className="text-sm font-semibold text-amber-900 underline-offset-4 hover:underline"
                >
                  Free Website Check →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/50 bg-white/88">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>What this means for clients</h2>
          <p className="mt-7 text-base leading-relaxed text-slate-600 md:text-lg">
            It means your project is being built by someone who can think beyond a brochure site. Structure, workflows,
            tools, problem-solving, and system thinking all show up in how I build.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200/55 bg-gradient-to-b from-[#faf9f6] to-[#e8edf2]/90">
        <div className={cn(shell, "px-5 py-24 md:py-28")}>
          <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Most projects still start with a website</h2>
            <p className="mx-auto mt-5 max-w-lg text-slate-600 md:text-lg">
              This page is context for the broader build work — when you&apos;re ready, we can map the simplest next step.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "builds_cta", target: "get_website" }}
                className={cn(
                  mmsBtnPrimary,
                  "w-full justify-center px-10 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Get a Website
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "builds_cta", target: "work_with_topher" }}
                className={cn(
                  mmsBtnSecondary,
                  "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Work With Topher
              </TrackedPublicLink>
            </div>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-slate-600">
              No pressure · No obligation · Preview-first when it helps
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
