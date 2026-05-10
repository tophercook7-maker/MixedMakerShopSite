import { TopherAvatarFigure } from "@/components/public/TopherAvatarFigure";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBullet,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsCard,
  mmsCtaPanel,
  mmsEyebrow,
  mmsH1,
  mmsH2,
  mmsLead,
  mmsPageBg,
  mmsSectionBorder,
  mmsSectionY,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

export function AboutTopherPage() {
  return (
    <div className={mmsPageBg}>
      <section
        className={cn(
          "border-b bg-gradient-to-b from-[#f7f4ee] via-white/92 to-[#ece7dd]",
          mmsSectionBorder,
        )}
      >
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
              <p className="mt-5 max-w-2xl text-sm font-medium text-[#4a5750] md:text-[0.9375rem]">
                You&apos;re working directly with Topher — the person building everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("border-b bg-gradient-to-b from-[#dfe8df]/50 to-[#ece7dd]/80", mmsSectionBorder)}>
        <div className={cn(shell, mmsSectionY)}>
          <div
            className={cn(
              mmsCard,
              "mx-auto max-w-3xl border-[#3f5a47]/14 p-8 shadow-[0_24px_60px_-28px_rgba(30,36,31,0.12)] sm:p-12",
            )}
          >
            <div className="space-y-6 text-base leading-relaxed text-[#354239] md:text-lg">
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

      <section id="story-legacy" className={cn("border-b bg-white/92 shadow-[inset_0_1px_0_rgba(63,90,71,0.05)]", mmsSectionBorder)}>
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>Story &amp; legacy</h2>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-[#354239] md:text-lg">
            <p>
              Mixed Maker Shop exists because useful work rarely fits one narrow label. Small businesses need credible
              websites; makers need prints that actually work; experiments need an honest place to live before they become
              products. The umbrella keeps those threads organized instead of scattering them across disconnected sites.
            </p>
            <p>
              The studio grew out of real-life problem solving — picking up messy requests, tightening unclear messaging,
              and shipping practical fixes instead of selling buzzwords. Creativity here means craftsmanship and clarity:
              fewer layers between you and the person building the thing.
            </p>
            <p>
              Resilience is part of that picture too — pacing work sustainably, staying direct when projects get hard, and
              keeping faith and life experience in the background as motivation rather than theater. The goal stays simple:
              build something that helps someone move forward.
            </p>
            <p>
              Think of Mixed Maker Shop as a living archive: shipped projects, printable goods, digital tools, Idea Lab
              experiments, and lessons learned along the way — each entry reflecting what actually worked (or what did
              not) so the next build starts smarter.
            </p>
          </div>
        </div>
      </section>

      <section className={cn("border-b bg-white/92 shadow-[inset_0_1px_0_rgba(63,90,71,0.05)]", mmsSectionBorder)}>
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>How Topher works</h2>
          <ul className="mt-10 space-y-3.5 text-[#3d4a42] md:text-[17px]">
            {[
              "practical over flashy",
              "direct over bloated",
              "useful over trendy",
              "real communication over agency layers",
              "build it so it actually helps",
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
      </section>

      <section className={cn("border-b bg-[#e4eae4]/55", mmsSectionBorder)}>
        <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
          <h2 className={mmsH2}>Built from Hot Springs, Arkansas</h2>
          <p className="mt-7 text-base leading-relaxed text-[#354239] md:text-lg">
            I&apos;m based in Hot Springs, Arkansas, and I work with local businesses, practical projects, and digital ideas
            that need someone who can actually build.
          </p>
        </div>
      </section>

      <section
        className={cn(
          "border-t bg-gradient-to-b from-[#ece7dd] via-[#e5e0d6] to-[#dcd6cc]",
          mmsSectionBorder,
        )}
      >
        <div className={cn(shell, "px-5 py-24 md:py-28")}>
          <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "mx-auto max-w-xl !text-2xl md:!text-3xl")}>Want to work directly with Topher?</h2>
            <p className="mx-auto mt-5 max-w-lg text-[#354239] md:text-lg">
              Explore web design services, grab a free homepage preview, or send a note about what you&apos;re trying to
              build.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <TrackedPublicLink
                href="/web-design"
                eventName="public_contact_cta_click"
                eventProps={{ location: "about_cta", target: "web_design" }}
                className={cn(
                  mmsBtnPrimary,
                  "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Get a Website
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "about_cta", target: "contact_topher" }}
                className={cn(
                  mmsBtnSecondary,
                  "w-full justify-center px-8 sm:w-auto sm:min-w-[12rem] no-underline hover:no-underline",
                )}
              >
                Contact
              </TrackedPublicLink>
            </div>
            <p className="mx-auto mt-4 max-w-lg text-xs font-medium text-[#5a6a62] sm:text-sm">
              No pressure · No obligation · Just a preview if you want one
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
