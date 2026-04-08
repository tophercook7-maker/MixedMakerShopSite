import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
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
  mmsStepCircle,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/** Extra air on the main service page without changing the global token. */
const sectionYRelaxed = cn(mmsSectionY, "lg:py-[5.5rem]");

const heroSectionY = "py-24 md:py-32 lg:py-40";

function WebDesignMockupCtaBand({
  bgClass,
  analyticsLocation,
}: {
  bgClass: string;
  analyticsLocation: string;
}) {
  return (
    <section className={cn("border-b", mmsSectionBorder, bgClass)}>
      <div className={cn(shell, sectionYRelaxed)}>
        <div
          className={cn(
            mmsCard,
            "mx-auto max-w-3xl border-[#3f5a47]/16 bg-gradient-to-br from-white via-[#f6f3ec] to-[#e8efe8]/75 p-8 sm:p-10 shadow-[0_22px_55px_-28px_rgba(30,36,31,0.14)]",
          )}
        >
          <h2 className={mmsH2}>Not sure yet?</h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            I can mock up your homepage so you can see it before you decide.
          </p>
          <div className="mt-9">
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: analyticsLocation, target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "inline-flex px-8 no-underline hover:no-underline")}
            >
              Get My Free Mockup
            </TrackedPublicLink>
          </div>
          <p className="mt-4 text-xs font-medium text-[#5a6a62] sm:text-sm">
            No pressure · No obligation · Just a preview
          </p>
        </div>
      </div>
    </section>
  );
}

export function WebDesignServicePage() {
  return (
    <div className={mmsPageBg}>
      {/* 1. Hero */}
      <section
        className={cn(
          "relative overflow-hidden border-b bg-gradient-to-b from-[#f7f4ee] via-[#ece7dd] to-[#e2dcd0]/90",
          mmsSectionBorder,
          "shadow-[inset_0_-1px_0_rgba(47,62,52,0.05)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 85% 55% at 15% -10%, rgba(184, 92, 30, 0.075), transparent 55%), radial-gradient(ellipse 60% 45% at 95% 15%, rgba(63, 90, 71, 0.07), transparent 50%), linear-gradient(180deg, rgba(255,255,255,0.42) 0%, transparent 42%)",
          }}
          aria-hidden
        />
        <div className={cn(shell, heroSectionY, "relative z-[1] max-w-4xl")}>
          <p className={mmsEyebrow}>Web Design by Topher</p>
          <h1 className={cn(mmsH1, "mt-6 max-w-[22ch] sm:max-w-none")}>
            Websites that help your business get customers.
          </h1>
          <p className={cn(mmsLead, "mt-8 max-w-2xl")}>
            Topher builds clean, dependable websites for real businesses that need to look professional, build trust fast,
            and turn visitors into calls, messages, and leads.
          </p>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_hero", target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}
            >
              Get a Free Website Mockup
            </TrackedPublicLink>
            <TrackedPublicLink
              href="/contact"
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_hero", target: "contact_topher" }}
              className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}
            >
              Contact Topher
            </TrackedPublicLink>
          </div>
          <p className="mt-6 text-xs font-medium text-[#5a6a62] sm:text-sm">
            No pressure · No obligation · Just a preview
          </p>
          <p className="mt-8 max-w-xl text-sm font-medium text-[#4a5750] md:text-[0.9375rem]">
            No contracts. No agency runaround. Just a website that works.
          </p>
        </div>
      </section>

      {/* 2. Who this is for */}
      <section className={cn("border-b bg-white/92 shadow-[inset_0_1px_0_rgba(63,90,71,0.06)]", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={mmsH2}>Who this is for</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            This is for people who know they need a better online presence, but don&apos;t want to deal with complicated
            agencies or confusing tech.
          </p>
          <ul className="mt-10 space-y-3.5 text-[#3d4a42] md:text-[17px]">
            {[
              "Local service businesses",
              "Small businesses that need to look legit",
              "People relying only on Facebook or word of mouth",
              "Businesses losing leads because their site looks outdated",
              "Anyone who needs a clean, trustworthy online presence",
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

      {/* 3. What you get */}
      <section
        className={cn(
          "border-b bg-gradient-to-b from-[#dde8df]/55 via-[#ece7dd]/90 to-[#e4dfd6]",
          mmsSectionBorder,
        )}
        id="browse-by-type"
      >
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={mmsH2}>What Topher builds</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            Everything is built to be simple, clear, and actually useful.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Business websites",
              "Landing pages",
              "Website redesigns",
              "Lead generation sites",
              "Simple, conversion-focused pages",
            ].map((title) => (
              <div key={title} className={cn(mmsCard, "p-8 shadow-sm sm:p-9")}>
                <p className="text-base font-bold text-[#1e241f]">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What happens next */}
      <section className={cn("border-b bg-white/93 shadow-[inset_0_1px_0_rgba(63,90,71,0.05)]", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={mmsH2}>What happens after you reach out</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              {
                n: "1",
                title: "You tell Topher what you need",
                line: "No long forms or confusing process.",
              },
              {
                n: "2",
                title: "I map out the simplest way to build it",
                line: "Focused on what actually works for your business.",
              },
              {
                n: "3",
                title: "You get a clean, working website",
                line: "Built to look professional and bring in customers.",
              },
            ].map((step) => (
              <div key={step.n} className={cn(mmsCard, "p-8 sm:p-9")}>
                <span className={mmsStepCircle} aria-hidden>
                  {step.n}
                </span>
                <h3 className="text-lg font-bold leading-snug text-[#1e241f]">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#354239] md:text-[15px]">{step.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WebDesignMockupCtaBand bgClass="bg-[#f4f3ef]/80" analyticsLocation="web_design_mid_mockup" />

      {/* 5. Featured work — same component; copy via props only */}
      <HomeFeaturedWebDesignWork
        variant="light"
        heading="Real websites built by Topher"
        subhead="These are real sites built to help businesses look established, clear, and worth contacting."
      />

      {/* 6. Why work with Topher */}
      <section className={cn("border-b bg-[#e8ebe4]/65", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={mmsH2}>Why work directly with Topher</h2>
          <p className="mt-8 text-base leading-relaxed text-[#354239] md:text-lg">
            When you work with me, you&apos;re working directly with the person building the site. No layers, no confusion,
            and no bloated process.
          </p>
          <ul className="mt-10 space-y-3.5 text-[#3d4a42] md:text-[17px]">
            {[
              "Direct communication with Topher",
              "Faster turnaround",
              "No agency overhead",
              "Built for real results, not just design trends",
              "Focused on making your business look trustworthy",
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

      {/* 7. Light trust / reassurance */}
      <section className={cn("border-b bg-[#faf8f4]/95 py-14 md:py-16", mmsSectionBorder)}>
        <div className={cn(shell, "max-w-2xl text-center")}>
          <p className="text-lg font-semibold text-[#1e241f] md:text-xl">
            You don&apos;t need a complicated website. You need one that works.
          </p>
          <p className="mt-4 text-base text-[#354239] md:text-[17px]">
            Topher keeps things simple so you can focus on your business.
          </p>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className={cn("bg-gradient-to-b from-[#ece7dd] via-[#e5e0d6] to-[#dcd6cc]", mmsSectionBorder, "border-t")}>
        <div className={cn(shell, "px-5 py-24 md:py-32")}>
          <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Need a website that actually helps your business?</h2>
            <p className="mx-auto mt-5 max-w-lg text-[#354239] md:text-lg">
              Tell Topher what you need — you&apos;ll map a straightforward path and build something that works.
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "web_design_final_cta", target: "free_mockup" }}
                className={cn(mmsBtnPrimary, "justify-center px-8 no-underline hover:no-underline")}
              >
                Get My Free Mockup
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "web_design_final_cta", target: "contact_topher" }}
                className={cn(mmsBtnSecondary, "justify-center px-8 no-underline hover:no-underline")}
              >
                Start My Project
              </TrackedPublicLink>
            </div>
            <p className="mx-auto mt-4 max-w-lg text-xs font-medium text-[#5a6a62] sm:text-sm">
              No pressure · No obligation · Just a preview
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
