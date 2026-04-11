import { MonthlySeoPackSection } from "@/components/public/MonthlySeoPackSection";
import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicShellClass } from "@/lib/public-brand";
import { WEB_DESIGN_PACKAGES } from "@/lib/web-design-packages";
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
          <h2 className={mmsH2}>Want to see direction before you commit?</h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            I can put together a free homepage preview so you can react to something real — not a generic template
            gallery.
          </p>
          <div className="mt-9">
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: analyticsLocation, target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "inline-flex px-8 no-underline hover:no-underline")}
            >
              Get My Free Preview
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
          <p className={mmsEyebrow}>MixedMakerShop · Web design</p>
          <h1 className={cn(mmsH1, "mt-6 max-w-[22ch] sm:max-w-none")}>
            Websites that help your business earn trust and get leads
          </h1>
          <p className={cn(mmsLead, "mt-8 max-w-2xl")}>
            Topher builds clear, dependable sites for real businesses — so visitors understand what you do, why you&apos;re
            credible, and how to reach you.
          </p>
          <PublicCtaRow className="mt-12">
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_hero", target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}
            >
              Get My Free Preview
            </TrackedPublicLink>
            <TrackedPublicLink
              href="/examples"
              eventName="public_web_design_sample_click"
              eventProps={{ location: "web_design_hero", label: "examples" }}
              className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}
            >
              See Examples
            </TrackedPublicLink>
            <TrackedPublicLink
              href="/contact"
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_hero", target: "contact" }}
              className={cn(mmsBtnSecondary, "px-8 no-underline hover:no-underline")}
            >
              Contact
            </TrackedPublicLink>
          </PublicCtaRow>
          <p className="mt-6 text-xs font-medium text-[#5a6a62] sm:text-sm">
            No pressure · One business day response on contact
          </p>
        </div>
      </section>

      <section className={cn("border-b bg-white/92 shadow-[inset_0_1px_0_rgba(63,90,71,0.06)]", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={mmsH2}>Why most small-business websites underperform</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            It&apos;s rarely one flashy mistake — it&apos;s a pile of small misses that make people bounce.
          </p>
          <ul className="mt-10 space-y-3.5 text-[#3d4a42] md:text-[17px]">
            {[
              "The headline doesn&apos;t match what visitors expect",
              "Contact paths are buried or unclear",
              "The site looks dated or generic — trust drops instantly",
              "Too much text, not enough clarity on what to do next",
              "Mobile layout makes the business look careless",
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

      <section
        className={cn(
          "border-b bg-gradient-to-b from-[#dde8df]/55 via-[#ece7dd]/90 to-[#e4dfd6]",
          mmsSectionBorder,
        )}
      >
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={mmsH2}>What actually works</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            Practical pages built around clarity, credibility, and one obvious next step.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Clear offer + service area above the fold",
              "Proof: reviews, photos, real details",
              "Fast load, readable type, thumb-friendly taps",
              "One primary action: call, text, or book",
              "Simple structure — easy to maintain",
            ].map((title) => (
              <div key={title} className={cn(mmsCard, "p-8 shadow-sm sm:p-9")}>
                <p className="text-base font-bold text-[#1e241f]">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("border-b bg-white/93 shadow-[inset_0_1px_0_rgba(63,90,71,0.05)]", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={mmsH2}>Built to show up when people search</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            A good-looking site doesn&apos;t matter if no one finds it. I build websites that are structured to show up when
            people search for services in your area.
          </p>
          <ul className="mt-10 space-y-3.5 text-[#3d4a42] md:text-[17px]">
            {[
              "Pages built around real search terms (like “lawn care in [city]”)",
              "Clear structure Google understands",
              "Fast load times and mobile-friendly design",
              "Simple, clean content that matches what people are searching for",
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

      <section className={cn("border-b bg-[#eef3ee]/90", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={mmsH2}>Want to show up on Google too?</h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            I build sites with simple, effective structure so your business has a better chance of being found locally.
          </p>
          <div className="mt-8">
            <TrackedPublicLink
              href="/free-mockup"
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_seo_cta", target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "inline-flex px-8 no-underline hover:no-underline")}
            >
              Get My Free Preview
            </TrackedPublicLink>
          </div>
        </div>
      </section>

      <section className={cn("border-b bg-white/93 shadow-[inset_0_1px_0_rgba(63,90,71,0.05)]", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={mmsH2}>Pricing / packages</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            Straightforward tiers — pick what matches where you are. Details stay the same on the{" "}
            <TrackedPublicLink
              href="/pricing"
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_pricing", target: "pricing_page" }}
              className="font-semibold text-[#8a4b2a] underline-offset-4 hover:underline"
            >
              pricing page
            </TrackedPublicLink>
            .
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {WEB_DESIGN_PACKAGES.map((pkg) => (
              <div key={pkg.name} className={cn(mmsCard, "flex flex-col p-8 sm:p-9")}>
                <h3 className="text-lg font-bold tracking-tight text-[#1e241f] md:text-xl">{pkg.name}</h3>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#8a4b2a] md:text-[1.65rem]">{pkg.price}</p>
                <p className="mt-5 text-sm leading-relaxed text-[#354239] md:text-[15px]">{pkg.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MonthlySeoPackSection analyticsLocation="web_design_monthly_seo_pack" />

      <section className={cn("border-b bg-[#f4f3ef]/90", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={mmsH2}>Why ongoing support matters</h2>
          <p className="mt-8 text-base leading-relaxed text-[#354239] md:text-lg">
            A site isn&apos;t “done” when it launches — hours change, photos need swaps, offers evolve, and Google
            rewards fresh, accurate pages. Monthly support is optional, but it&apos;s the practical way to keep your site
            aligned with how you actually operate — small fixes, updates, and improvements without starting over.
          </p>
        </div>
      </section>

      <section className={cn("border-b bg-white/93 shadow-[inset_0_1px_0_rgba(63,90,71,0.05)]", mmsSectionBorder)}>
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={mmsH2}>Simple process</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              {
                n: "1",
                title: "You share the basics",
                line: "What you do, who you serve, and what you want the site to accomplish.",
              },
              {
                n: "2",
                title: "I propose the cleanest build",
                line: "Structure, messaging, and a homepage direction you can react to.",
              },
              {
                n: "3",
                title: "Launch and iterate",
                line: "Go live with a trustworthy site — refine as you learn what visitors respond to.",
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

      <HomeFeaturedWebDesignWork
        variant="light"
        heading="Featured work"
        subhead="Live client sites — built to help you show up and get calls, not just look pretty online."
      />

      <section className={cn("bg-gradient-to-b from-[#ece7dd] via-[#e5e0d6] to-[#dcd6cc]", mmsSectionBorder, "border-t")}>
        <div className={cn(shell, "px-5 py-24 md:py-32")}>
          <div className={cn(mmsCtaPanel, "mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(mmsH2, "!text-2xl md:!text-3xl")}>Tell me what you&apos;re trying to fix or launch</h2>
            <p className="mx-auto mt-5 max-w-lg text-[#354239] md:text-lg">
              Free preview when it helps — or reach out directly if you already know what you need.
            </p>
            <PublicCtaRow align="center" className="mt-10 justify-center">
              <TrackedPublicLink
                href="/free-mockup"
                eventName="public_contact_cta_click"
                eventProps={{ location: "web_design_final_cta", target: "free_mockup" }}
                className={cn(mmsBtnPrimary, "justify-center px-8 no-underline hover:no-underline")}
              >
                Get My Free Preview
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "web_design_final_cta", target: "contact" }}
                className={cn(mmsBtnSecondary, "justify-center px-8 no-underline hover:no-underline")}
              >
                Contact
              </TrackedPublicLink>
            </PublicCtaRow>
            <p className="mx-auto mt-4 max-w-lg text-xs font-medium text-[#5a6a62] sm:text-sm">
              No pressure · No obligation · Reply within one business day on contact
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
