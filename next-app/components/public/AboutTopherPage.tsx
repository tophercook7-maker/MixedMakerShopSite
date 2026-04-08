import Link from "next/link";
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

export function AboutTopherPage() {
  return (
    <div className={mmsPageBg}>
      <section className="border-b border-slate-200/65 bg-gradient-to-b from-[#faf9f6] via-white to-[#f4f3ef]">
        <div className={cn(shell, mmsSectionY)}>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center lg:max-w-none lg:flex-row lg:items-center lg:gap-16 lg:gap-x-20 lg:text-left">
            <div className="order-2 mt-8 flex w-full justify-center sm:mt-10 lg:order-2 lg:mt-0 lg:w-[min(100%,320px)] lg:max-w-[320px] lg:shrink-0">
              <TopherAvatarFigure className="max-w-[260px] sm:max-w-[280px] lg:max-w-[320px]" />
            </div>
            <div className="order-1 min-w-0 flex-1">
              <p className={mmsEyebrow}>About Topher</p>
              <h1 className={cn(mmsH1, "mt-6")}>I build things that are actually useful.</h1>
              <p className={cn(mmsLead, "mt-7 max-w-2xl")}>
                Websites, custom prints, and digital builds — all under MixedMakerShop.
              </p>
              <p className="mt-5 max-w-2xl text-sm font-medium text-slate-600 md:text-[0.9375rem]">
                You&apos;re working directly with Topher — the person building everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/50 bg-[#f4f3ef]/85">
        <div className={cn(shell, mmsSectionY)}>
          <div className={cn(mmsCard, "mx-auto max-w-3xl p-8 sm:p-12")}>
            <div className="space-y-6 text-base leading-relaxed text-slate-600 md:text-lg">
              <p>
                I&apos;m Topher. MixedMakerShop is where I combine web design, 3D printing, and digital builds into one place.
              </p>
              <p>
                Some people come to me because they need a website that helps their business look professional and get customers.
                Others need a physical solution made. Others have an idea they want help turning into something real.
              </p>
              <p>
                I&apos;m not interested in bloated process, fake agency polish, or overcomplicating things. I like building things
                that are useful, clear, and actually help people move forward.
              </p>
              <p>
                When you work with me, you work directly with the person doing the building. That means faster communication,
                fewer layers, and a more practical result.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/50 bg-white/82">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>How Topher works</h2>
          <ul className="mt-10 space-y-3.5 text-slate-700 md:text-[17px]">
            {[
              "practical over flashy",
              "direct over bloated",
              "useful over trendy",
              "real communication over agency layers",
              "build it so it actually helps",
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

      <section className="border-b border-slate-200/50 bg-[#ebe8e2]/40">
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>Built from Hot Springs, Arkansas</h2>
          <p className="mt-7 text-base leading-relaxed text-slate-600 md:text-lg">
            I&apos;m based in Hot Springs, Arkansas, and I work with local businesses, practical projects, and digital ideas
            that need someone who can actually build.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200/55 bg-gradient-to-b from-[#faf9f6] to-[#e8edf2]/90">
        <div className={cn(shell, "px-5 py-24 md:py-28")}>
          <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "mx-auto max-w-xl !text-2xl md:!text-3xl")}>Want to work directly with Topher?</h2>
            <p className="mx-auto mt-5 max-w-lg text-slate-600 md:text-lg">
              Start with a free homepage preview, or send a note about what you&apos;re trying to build.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "about_cta", target: "get_website" }}
                className={cn(
                  mmsBtnPrimary,
                  "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Get a Website
              </TrackedPublicLink>
              <Link
                href="/contact"
                className={cn(
                  mmsBtnSecondary,
                  "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Start a Project
              </Link>
            </div>
            <p className="mx-auto mt-4 max-w-lg text-xs font-medium text-slate-500 sm:text-sm">
              No pressure · No obligation · Just a preview if you want one
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
