import { MonthlySeoPackSection } from "@/components/public/MonthlySeoPackSection";
import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { WEB_DESIGN_PACKAGES } from "@/lib/web-design-packages";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH1,
  mmsH2,
  mmsSectionBorder,
  mmsSectionY,
  mmsStepCircleOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/** Warm medium-dark / on-glass text (web-design page only) */
const wdFg = "text-[rgba(248,242,232,0.96)]";
const wdBody = "text-[rgba(236,224,206,0.82)]";
const wdMuted = "text-[rgba(214,197,176,0.68)]";
const wdEyebrow = "text-[#d4a574]";
const wdBullet = "font-bold text-[#c9a078]";
const wdLink = cn(
  "font-semibold text-[#f0c49a] underline-offset-4 transition-colors hover:text-[#fdebd4] hover:underline",
);

const wdH1 = cn(mmsH1, wdFg);
const wdH2 = cn(mmsH2, wdFg);

const sectionYRelaxed = cn(mmsSectionY, "lg:py-[5.5rem]");
const heroSectionY = "py-24 md:py-32 lg:py-40";

const sectionBand = cn("border-b border-[rgba(214,154,96,0.12)]", mmsSectionBorder);

function WebDesignMockupCtaBand({
  altBand,
  analyticsLocation,
}: {
  altBand?: boolean;
  analyticsLocation: string;
}) {
  return (
    <section className={cn(sectionBand, altBand && "web-design-section--alt")}>
      <div className={cn(shell, sectionYRelaxed)}>
        <div className={cn("web-design-surface mx-auto max-w-3xl p-8 sm:p-10")}>
          <h2 className={wdH2}>Want to see direction before you commit?</h2>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", wdBody)}>
            I can put together a free homepage preview so you can react to something real — not a generic template
            gallery.
          </p>
          <div className="mt-9">
            <TrackedPublicLink
              href={publicFreeMockupFunnelHref}
              eventName="public_contact_cta_click"
              eventProps={{ location: analyticsLocation, target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "inline-flex px-8 no-underline hover:no-underline")}
            >
              Get My Free Preview
            </TrackedPublicLink>
          </div>
          <p className={cn("mt-4 text-xs font-medium sm:text-sm", wdMuted)}>No pressure · No obligation · Just a preview</p>
        </div>
      </div>
    </section>
  );
}

export function WebDesignServicePage() {
  return (
    <div className="web-design-page w-full antialiased">
      <section className={cn("relative overflow-hidden", sectionBand)}>
        <div className="pointer-events-none absolute inset-0 z-0 web-design-hero-atmosphere" aria-hidden />
        <div className={cn(shell, heroSectionY, "relative z-[1] max-w-4xl")}>
          <div className="web-design-page-hero-card px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em] md:text-xs", wdEyebrow)}>
              MixedMakerShop · Web design
            </p>
            <h1 className={cn(wdH1, "mt-6 max-w-[22ch] sm:max-w-none")}>
              Websites that help your business earn trust and get leads
            </h1>
            <p className={cn("mt-8 max-w-2xl text-lg leading-[1.65] md:text-xl md:leading-[1.7]", wdBody)}>
              Topher builds clear, dependable sites for real businesses — so visitors understand what you do, why you&apos;re
              credible, and how to reach you.
            </p>
            <PublicCtaRow className="mt-12">
              <TrackedPublicLink
                href={publicFreeMockupFunnelHref}
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
                className={cn(mmsBtnSecondaryOnGlass, "px-8 no-underline hover:no-underline")}
              >
                See Examples
              </TrackedPublicLink>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "web_design_hero", target: "contact" }}
                className={cn(mmsBtnSecondaryOnGlass, "px-8 no-underline hover:no-underline")}
              >
                Contact
              </TrackedPublicLink>
            </PublicCtaRow>
            <p className={cn("mt-6 text-xs font-medium sm:text-sm", wdMuted)}>No pressure · One business day response on contact</p>
          </div>
        </div>
      </section>

      <section className={cn(sectionBand, "web-design-section--alt")}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={wdH2}>Why most small-business websites underperform</h2>
          <p className={cn("mt-8 max-w-2xl text-base leading-relaxed md:text-lg", wdBody)}>
            It&apos;s rarely one flashy mistake — it&apos;s a pile of small misses that make people bounce.
          </p>
          <ul className={cn("mt-10 space-y-3.5 md:text-[17px]", wdBody)}>
            {[
              "The headline doesn&apos;t match what visitors expect",
              "Contact paths are buried or unclear",
              "The site looks dated or generic — trust drops instantly",
              "Too much text, not enough clarity on what to do next",
              "Mobile layout makes the business look careless",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className={wdBullet} aria-hidden>
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionBand}>
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={wdH2}>What actually works</h2>
          <p className={cn("mt-8 max-w-2xl text-base leading-relaxed md:text-lg", wdBody)}>
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
              <div key={title} className={cn("web-design-surface p-8 shadow-sm sm:p-9")}>
                <p className={cn("text-base font-bold", wdFg)}>{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cn(sectionBand, "web-design-section--alt")}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={wdH2}>Built to show up when people search</h2>
          <p className={cn("mt-8 max-w-2xl text-base leading-relaxed md:text-lg", wdBody)}>
            A good-looking site doesn&apos;t matter if no one finds it. I build websites that are structured to show up when
            people search for services in your area.
          </p>
          <ul className={cn("mt-10 space-y-3.5 md:text-[17px]", wdBody)}>
            {[
              "Pages built around real search terms (like “lawn care in [city]”)",
              "Clear structure Google understands",
              "Fast load times and mobile-friendly design",
              "Simple, clean content that matches what people are searching for",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className={wdBullet} aria-hidden>
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionBand}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={wdH2}>Want to show up on Google too?</h2>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", wdBody)}>
            I build sites with simple, effective structure so your business has a better chance of being found locally.
          </p>
          <div className="mt-8">
            <TrackedPublicLink
              href={publicFreeMockupFunnelHref}
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_seo_cta", target: "free_mockup" }}
              className={cn(mmsBtnPrimary, "inline-flex px-8 no-underline hover:no-underline")}
            >
              Get My Free Preview
            </TrackedPublicLink>
          </div>
        </div>
      </section>

      <section className={cn(sectionBand, "web-design-section--alt")}>
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={wdH2}>Pricing / packages</h2>
          <p className={cn("mt-8 max-w-2xl text-base leading-relaxed md:text-lg", wdBody)}>
            Straightforward tiers — pick what matches where you are. Details stay the same on the{" "}
            <TrackedPublicLink
              href="/pricing"
              eventName="public_contact_cta_click"
              eventProps={{ location: "web_design_pricing", target: "pricing_page" }}
              className={wdLink}
            >
              pricing page
            </TrackedPublicLink>
            .
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {WEB_DESIGN_PACKAGES.map((pkg) => (
              <div key={pkg.name} className={cn("web-design-surface flex flex-col p-8 sm:p-9")}>
                <h3 className={cn("text-lg font-bold tracking-tight md:text-xl", wdFg)}>{pkg.name}</h3>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#f0c49a] md:text-[1.65rem]">{pkg.price}</p>
                <p className={cn("mt-5 text-sm leading-relaxed md:text-[15px]", wdBody)}>{pkg.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MonthlySeoPackSection analyticsLocation="web_design_monthly_seo_pack" tone="warmSmoke" />

      <section className={sectionBand}>
        <div className={cn(shell, sectionYRelaxed, "max-w-3xl")}>
          <h2 className={wdH2}>Why ongoing support matters</h2>
          <p className={cn("mt-8 text-base leading-relaxed md:text-lg", wdBody)}>
            A site isn&apos;t “done” when it launches — hours change, photos need swaps, offers evolve, and Google
            rewards fresh, accurate pages. Monthly support is optional, but it&apos;s the practical way to keep your site
            aligned with how you actually operate — small fixes, updates, and improvements without starting over.
          </p>
        </div>
      </section>

      <section className={cn(sectionBand, "web-design-section--alt")}>
        <div className={cn(shell, sectionYRelaxed)}>
          <h2 className={wdH2}>Simple process</h2>
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
              <div key={step.n} className={cn("web-design-surface p-8 sm:p-9")}>
                <span className={mmsStepCircleOnGlass} aria-hidden>
                  {step.n}
                </span>
                <h3 className={cn("text-lg font-bold leading-snug", wdFg)}>{step.title}</h3>
                <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", wdBody)}>{step.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WebDesignMockupCtaBand altBand analyticsLocation="web_design_mid_mockup" />

      <HomeFeaturedWebDesignWork
        variant="warmSmoke"
        heading="Featured work"
        subhead="Live client sites — built to help you show up and get calls, not just look pretty online."
      />

      <section className={cn(sectionBand, "border-t web-design-section--alt")}>
        <div className={cn(shell, "px-5 py-24 md:py-32")}>
          <div className={cn("web-design-surface mx-auto max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-14")}>
            <h2 className={cn(wdH2, "!text-2xl md:!text-3xl")}>Tell me what you&apos;re trying to fix or launch</h2>
            <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", wdBody)}>
              Free preview when it helps — or reach out directly if you already know what you need.
            </p>
            <PublicCtaRow align="center" className="mt-10 justify-center">
              <TrackedPublicLink
                href={publicFreeMockupFunnelHref}
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
                className={cn(mmsBtnSecondaryOnGlass, "justify-center px-8 no-underline hover:no-underline")}
              >
                Contact
              </TrackedPublicLink>
            </PublicCtaRow>
            <p className={cn("mx-auto mt-4 max-w-lg text-xs font-medium sm:text-sm", wdMuted)}>
              No pressure · No obligation · Reply within one business day on contact
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
