import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { CaptainMakerGuide } from "@/components/public/CaptainMakerGuide";
import { UmbrellaHomeHero } from "@/components/public/UmbrellaHomeHero";
import { TopherWebDesignHomeSpotlight } from "@/components/public/TopherWebDesignHomeSpotlight";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassCtaRowWrap,
  mmsSectionEyebrowOnGlass,
  mmsH3OnGlass,
  mmsHomeGlassStackGap,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionY,
  mmsStepCircleOnGlass,
  mmsUmbrellaSectionBackdrop,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/** Desktop: let fixed umbrella read through; mobile: warm solid for stability. */
const homeBackdrop = mmsUmbrellaSectionBackdrop;

const chooserCards = [
  {
    title: "I need a better website",
    body: "Topher's Web Design is the dedicated web branch under Mixed Maker Shop — 3–5 page sites, informational projects, web systems, and online workflows.",
    href: TOPHER_WEB_DESIGN_URL,
    cta: "Visit Topher's Web Design",
    external: true,
  },
  {
    title: "I need a digital tool or template",
    body: "Simple tools, forms, templates, downloads, and business kits.",
    href: "/websites-tools#templates-kits",
    cta: "View Tools & Kits",
  },
  {
    title: "I need something 3D printed",
    body: "Useful and fun custom prints from GiGi’s Print Shop — keychains, bookmarks, shelf pieces, tools, fidget toys, cosplay-style swords, and everyday items.",
    href: "/3d-printing",
    cta: "Visit GiGi’s Print Shop",
    accent: "pink",
  },
  {
    title: "I need lawn or property help",
    body: "Local outdoor help, cleanup, and property services.",
    href: "/property-care",
    cta: "View Property Care",
  },
  {
    title: "I want to see what’s new",
    body: "Vote on ideas, suggest something, or see what we’re building next.",
    href: "/idea-lab",
    cta: "Visit the Idea Lab",
  },
] as const;

const serviceCards = [
  {
    title: "Landing Pages",
    price: "Starting at $100",
    body: "One focused page for a service, event, offer, product, or fast online presence.",
  },
  {
    title: "Websites",
    price: "Starting at $400",
    body: "Multi-page sites (often 3–5 pages) for services, contact, photos, trust-building, and informational content — see Topher's Web Design for the dedicated web branch.",
  },
  {
    title: "AI Bots",
    price: "$200 during first website build / $500 later",
    body: "Customer helpers that answer questions, collect leads, and guide visitors to the next step.",
  },
  {
    title: "Flyers & Ads",
    price: "Starting at $50",
    body: "Promo graphics for events, offers, local services, social posts, and quick attention.",
  },
  {
    title: "3D Prints & Custom Work",
    price: "Estimate required",
    body: "Useful and fun prints — keychains, bookmarks, shelf pieces, tools, fidget toys, cosplay-style swords, and everyday custom items.",
  },
] as const;

const featuredWork = [
  {
    title: "Fresh Cut Property Care",
    body: "A focused property-care website for lawn care, cleanup, and local estimate requests.",
    href: "https://freshcutpropertycare.com/",
    cta: "Visit Fresh Cut",
    external: true,
  },
  {
    title: "Deep Well Audio",
    body: "A clean creative/audio platform built around organized content and exploration.",
    href: "https://deepwellaudio.com/",
    cta: "Visit Deep Well Audio",
    external: true,
  },
  {
    title: "StrainSpotter",
    body: "A practical app-style project built around fast scanning, helpful results, and interactive tools.",
    href: "https://strainspotter.app/",
    cta: "Visit StrainSpotter",
    external: true,
  },
  {
    title: "Website Preview Generator",
    body: "A MixedMakerShop tool for showing local businesses what a better website could look like.",
    href: publicFreeMockupFunnelHref,
    cta: "Start a Free Preview",
    external: false,
  },
] as const;

const departmentFeatures = [
  {
    eyebrow: "Topher's Web Design",
    title: "The web design and web systems branch under the Mixed Maker Shop umbrella.",
    body: "3–5 page websites, informational sites, web systems, forms, dashboards, CRM-style tools, and helpful online workflows — with Mixed Maker Shop as the studio home base.",
    href: TOPHER_WEB_DESIGN_URL,
    cta: "Visit topherswebdesign.com",
    external: true,
  },
  {
    eyebrow: "GiGi’s Print Shop",
    title: "The maker and custom 3D printing side.",
    body: "Useful and fun prints — keychains, bookmarks, shelf pieces, tools, fidget toys, cosplay-style swords, and everyday custom items.",
    href: "/3d-printing",
    cta: "Start a Print Request",
    className: "border-pink-300/30 bg-gradient-to-br from-pink-500/12 via-white/8 to-orange-400/8",
  },
  {
    eyebrow: "Property Care",
    title: "Fresh Cut is the focused property-care path.",
    body: "MixedMakerShop points property-care visitors to Fresh Cut Property Care for lawn care, yard cleanup, brush clearing, and estimate requests.",
    href: "/property-care",
    cta: "View Fresh Cut Bridge",
  },
  {
    eyebrow: "Idea Lab",
    title: "New ideas before they become full services or tools.",
    body: "Vote on what sounds useful, suggest something, or see what Topher is testing next.",
    href: "/idea-lab",
    cta: "Suggest an Idea",
  },
] as const;

export function UmbrellaHomePage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <UmbrellaHomeHero />

        <TopherWebDesignHomeSpotlight />

        <section className={cn(homeBackdrop)} id="services">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Clear Starting Points</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Pick the build that sounds closest.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Mixed Maker Shop brings the creative services together under one umbrella — start with the closest fit,
                then Captain Maker can help sort the details before your free estimate.
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-5", mmsHomeGlassStackGap)}>
              {serviceCards.map((service) => (
                <article
                  key={service.title}
                  className="public-glass-box--soft public-glass-box--pad flex min-h-[14rem] flex-col"
                >
                  <h3 className={mmsH3OnGlass}>{service.title}</h3>
                  <p className={cn("mt-3 text-sm font-bold uppercase tracking-[0.16em]", mmsOnGlassPrimary)}>
                    {service.price}
                  </p>
                  <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                    {service.body}
                  </p>
                </article>
              ))}
            </div>
            <div className={cn("public-glass-box public-glass-box--pad mt-8 max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>Not sure what you need?</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4 !text-2xl md:!text-3xl")}>Not sure what you need?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                That’s exactly why Captain Maker is here. Tell him what you’re trying to do, and he’ll help point you
                toward the right service before you start your estimate.
              </p>
              <Link href="#captain-maker" className={cn(mmsBtnPrimary, "mt-7 inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto")}>
                Tell Captain Maker What You Need
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop)} id="captain-maker">
          <div className={cn(shell, mmsSectionY)}>
            <CaptainMakerGuide />
          </div>
        </section>

        <section className={cn(homeBackdrop)} id="choose">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Start Here</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>What do you need help with today?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Pick the path that matches today. Topher&apos;s Web Design is the web branch; GiGi&apos;s Print Shop is
                the 3D printing side — Mixed Maker Shop keeps it organized in one studio.
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-5", mmsHomeGlassStackGap)}>
              {chooserCards.map((card) =>
                "external" in card && card.external ? (
                  <a
                    key={card.title}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group public-glass-box--soft public-glass-box--pad flex min-h-[15rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline",
                      "accent" in card && card.accent === "pink" && "border-pink-300/25 bg-pink-400/10",
                    )}
                  >
                    <h3 className={mmsH3OnGlass}>{card.title}</h3>
                    <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {card.body}
                    </p>
                    <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                      {card.cta}
                      <ExternalLink className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </a>
                ) : (
                  <Link
                    key={card.title}
                    href={card.href}
                    className={cn(
                      "group public-glass-box--soft public-glass-box--pad flex min-h-[15rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline",
                      "accent" in card && card.accent === "pink" && "border-pink-300/25 bg-pink-400/10",
                    )}
                  >
                    <h3 className={mmsH3OnGlass}>{card.title}</h3>
                    <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {card.body}
                    </p>
                    <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                      {card.cta}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="featured-work">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Featured Work</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Proof that the paths under MixedMakerShop are real.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                A quick proof wall before the departments: local service sites, creative platforms, app-style tools, and
                the free preview flow — alongside Topher&apos;s Web Design for the dedicated web branch.
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-4", mmsHomeGlassStackGap)}>
              {featuredWork.map((work) =>
                work.external ? (
                  <a
                    key={work.title}
                    href={work.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group public-glass-box--soft public-glass-box--pad flex min-h-[14rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline"
                  >
                    <h3 className={mmsH3OnGlass}>{work.title}</h3>
                    <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {work.body}
                    </p>
                    <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                      {work.cta}
                      <ExternalLink className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </a>
                ) : (
                  <Link
                    key={work.title}
                    href={work.href}
                    className="group public-glass-box--soft public-glass-box--pad flex min-h-[14rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline"
                  >
                    <h3 className={mmsH3OnGlass}>{work.title}</h3>
                    <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {work.body}
                    </p>
                    <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                      {work.cta}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="departments">
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-6 lg:grid-cols-2">
              {departmentFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className={cn(
                    "public-glass-box--soft public-glass-box--pad",
                    "className" in feature && feature.className,
                  )}
                >
                  <p className={mmsSectionEyebrowOnGlass}>{feature.eyebrow}</p>
                  <h2 className={cn(mmsH2OnGlass, "mt-4 !text-2xl md:!text-3xl")}>{feature.title}</h2>
                  <p className={cn("mt-5 text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                    {feature.body}
                  </p>
                  {"external" in feature && feature.external ? (
                    <a
                      href={feature.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(mmsTextLinkOnGlass, "mt-7 inline-flex items-center gap-2 no-underline hover:no-underline")}
                    >
                      {feature.cta}
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  ) : (
                    <Link href={feature.href} className={cn(mmsTextLinkOnGlass, "mt-7 inline-flex items-center gap-2")}>
                      {feature.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </article>
              ))}
            </div>
            <div className={cn("public-glass-box public-glass-box--pad mt-8 max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>Free website preview</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Want to see what your business could look like online?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Topher can build a homepage-style preview so you can see the direction before you commit.
              </p>
              <div className={mmsOnGlassCtaRowWrap}>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_department_feature", target: "free_mockup" }}
                  className={cn(mmsBtnPrimary, "inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Get a Free Website Preview
                </TrackedPublicLink>
              </div>
            </div>
          </div>
        </section>

        <section className={cn("border-t border-b", homeBackdrop, "max-md:bg-[#111510]")} id="about-topher-gigi">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>About Topher &amp; GiGi</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>About Topher</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                I&apos;m Topher, the idea engine behind Mixed Maker Shop.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Mixed Maker Shop is the umbrella studio — Topher&apos;s Web Design is the web design and web systems
                branch; GiGi&apos;s Print Shop covers the maker and custom 3D printing side. I build websites, digital
                tools, local service pages, and practical online workflows for small businesses.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                I&apos;ve always had more ideas than one simple website could hold, so Mixed Maker Shop became the home
                base — a place where web design, digital tools, property services, 3D printing, and new experiments can
                all live under one organized roof.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                The goal is simple: build useful things that help real people.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Some projects are for local businesses. Some are for homeowners. Some are digital. Some are printed. Some
                are still being tested in the Idea Lab. But everything here starts with the same question:
              </p>
              <p className="mt-7 rounded-2xl border border-white/12 bg-white/10 px-5 py-4 text-lg font-semibold text-white">
                “What would actually help someone?”
              </p>
            </div>
            <div className={cn("grid gap-6 md:grid-cols-3", mmsHomeGlassStackGap)}>
              {[
                "Mixed Maker Shop is the umbrella studio for web design, 3D printing, and practical tools.",
                "Topher's Web Design is the dedicated branch for sites, informational pages, and web systems.",
                "GiGi handles most of the 3D printing side through GiGi's Print Shop.",
              ].map((line, i) => (
                <div key={line} className="public-glass-box--soft public-glass-box--pad">
                  <span className={mmsStepCircleOnGlass} aria-hidden>{i + 1}</span>
                  <p className={cn("text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>{line}</p>
                </div>
              ))}
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
                Ready to choose a path?
              </h2>
              <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsOnGlassPrimary)}>
                Start with a free website preview, send GiGi a print idea, ask about property help, or suggest something
                new for the Idea Lab.
              </p>
              <PublicCtaRow align="center" className={cn(mmsOnGlassCtaRowWrap, "w-full justify-center")}>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "free_mockup" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex w-full min-w-[12rem] items-center justify-center gap-2 px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Get a Free Website Preview
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
                  Contact Topher
                </TrackedPublicLink>
              </PublicCtaRow>
              <p className={cn("mx-auto mt-4 max-w-lg text-sm font-medium sm:text-[15px]", mmsOnGlassSecondary)}>
                Useful things built online, outside, and in the workshop.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
