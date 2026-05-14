import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FlaskConical,
  Globe,
  Layers,
  Printer,
  Sparkles,
} from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { CaptainMakerGuide } from "@/components/public/CaptainMakerGuide";
import { MixedMakerBrandFaq } from "@/components/public/MixedMakerBrandFaq";
import { UmbrellaHomeHero } from "@/components/public/UmbrellaHomeHero";
import { TopherWebDesignHomeSpotlight } from "@/components/public/TopherWebDesignHomeSpotlight";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass, publicTopherEmail } from "@/lib/public-brand";
import { PUBLIC_POPULAR_PAGES } from "@/lib/public-popular-pages";
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
    cta: "Get a free website demo",
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

const umbrellaStudioTagline =
  "One umbrella. Multiple branches. Everything points back to Mixed Maker Shop.";

const studioDivisions = [
  {
    title: "Topher's Web Design",
    subtitle: "Website Division",
    body: "Modern websites, landing pages, redesigns, and web systems for businesses — the dedicated web branch under Mixed Maker Shop.",
    href: TOPHER_WEB_DESIGN_URL,
    external: true,
    Icon: Globe,
  },
  {
    title: "3D Printing & Maker Builds",
    subtitle: "Maker Division",
    body: "Custom prints, prototypes, practical parts, and maker-built solutions — including GiGi's Print Shop paths on this site.",
    href: "/3d-printing",
    external: false,
    Icon: Printer,
  },
  {
    title: "AI & Automation",
    subtitle: "Systems Division",
    body: "Practical AI workflows, bots with guardrails, and automation that reduces repetitive work without mystery jargon.",
    href: "/websites-tools#ai-automation",
    external: false,
    Icon: Sparkles,
  },
  {
    title: "Digital Products",
    subtitle: "Product Division",
    body: "Templates, kits, downloads, and lightweight tools shaped around real shop problems.",
    href: "/websites-tools#templates-kits",
    external: false,
    Icon: Layers,
  },
  {
    title: "Mixed Maker Labs",
    subtitle: "Experiment Division",
    body: "Ideas before they become full services — vote, suggest, or see what's being tested next.",
    href: "/idea-lab",
    external: false,
    Icon: FlaskConical,
  },
  {
    title: "Story & Legacy",
    subtitle: "Personal / Creative Archive",
    body: "The lived story behind the studio — context, lessons, and creative archive work.",
    href: "/about#story-legacy",
    external: false,
    Icon: BookOpen,
    subtitleNormalCase: true as const,
  },
] as const;

const homeVentures = [
  {
    name: "Henry AI",
    description:
      "Henry AI is a workspace-style build under Mixed Maker Shop for organizing drafts, tasks, and guarded AI workflows in fewer tabs. The builds spotlight walks through what it is, how it looks, and why it exists in the studio lineup.",
    href: "/builds#build-spotlight-henry",
    external: false as const,
  },
  {
    name: "StrainSpotter.app",
    description:
      "StrainSpotter is an app-style product for fast scanning, structured results, and practical next steps without cluttered screens. It lives on its own domain while reflecting how Mixed Maker Shop ships interactive tools.",
    href: "https://strainspotter.app/",
    external: true as const,
  },
  {
    name: "GoneFishin Keychains",
    description:
      "GoneFishin Keychains sells vintage and 3D-printed fishing-lure keychains—small, gift-ready pieces from the maker side of the umbrella. The shop site hosts the catalog and checkout.",
    href: "https://gonefishinkeychains.com/",
    external: true as const,
  },
  {
    name: "Kelsey's Kustom Kreations",
    description:
      "Kelsey's Kustom Kreations is a custom creations brand with a website built for clear services, proof, and contact — typical of the web branch's work for owner-led creative businesses.",
    href: "https://kelseyskustomkreations.com/",
    external: true as const,
  },
] as const;

const departmentBridges = [
  {
    eyebrow: "GiGi's Print Shop",
    title: "Custom 3D prints from the maker bench.",
    body: "Useful and fun prints — keychains, bookmarks, shelf pieces, tools, fidget toys, cosplay-style swords, and everyday custom items.",
    href: "/3d-printing",
    cta: "Start a Print Request",
    className: "border-pink-300/30 bg-gradient-to-br from-pink-500/12 via-white/8 to-orange-400/8",
  },
  {
    eyebrow: "Property Care",
    title: "Fresh Cut is the focused property-care path.",
    body: "Mixed Maker Shop routes lawn care, cleanup, and estimate requests through Fresh Cut Property Care.",
    href: "/property-care",
    cta: "View Fresh Cut Bridge",
  },
  {
    eyebrow: "Idea Lab",
    title: "Vote, suggest, or watch experiments evolve.",
    body: "New ideas before they become full services or tools.",
    href: "/idea-lab",
    cta: "Visit the Idea Lab",
  },
  {
    eyebrow: "Builds",
    title: "Shipped experiments, launches, and project notes.",
    body: "Browse write-ups for launches and experiments — including deep dives like Henry AI when you want technical context.",
    href: "/builds",
    cta: "Browse Builds",
  },
] as const;

export function UmbrellaHomePage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <UmbrellaHomeHero />

        <TopherWebDesignHomeSpotlight />

        <section className={cn(homeBackdrop)} id="studio-divisions">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Studio map</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Divisions under the Mixed Maker Shop umbrella</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Mixed Maker Shop is the studio HQ — web design, maker builds, AI &amp; automation, digital products,
                experiments, and story work roll up here.
              </p>
              <p
                className={cn(
                  "mt-6 rounded-2xl border border-[rgba(232,149,92,0.28)] bg-[rgba(17,26,23,0.35)] px-4 py-3 text-center text-sm font-bold leading-snug text-white md:text-base",
                )}
              >
                {umbrellaStudioTagline}
              </p>
            </div>
            <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", mmsHomeGlassStackGap)}>
              {studioDivisions.map((d) => {
                const Icon = d.Icon;
                const subtitleClass =
                  "subtitleNormalCase" in d && d.subtitleNormalCase
                    ? "mt-1 text-xs font-medium tracking-wide text-[rgba(232,149,92,0.92)]"
                    : "mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(232,149,92,0.92)]";
                const cardInner = (
                  <>
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[rgba(232,149,92,0.95)]">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    </div>
                    <h3 className={mmsH3OnGlass}>{d.title}</h3>
                    <p className={subtitleClass}>{d.subtitle}</p>
                    <p className={cn("mt-3 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {d.body}
                    </p>
                    <span
                      className={cn(
                        "mt-5 inline-flex items-center gap-2 text-sm font-semibold",
                        mmsTextLinkOnGlass,
                      )}
                    >
                      Open division
                      {d.external ? (
                        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                      ) : (
                        <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" aria-hidden />
                      )}
                    </span>
                  </>
                );
                return (
                  <article
                    key={d.title}
                    className="public-glass-box--soft public-glass-box--pad flex min-h-[15rem] flex-col"
                  >
                    {d.external ? (
                      <a
                        href={d.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full flex-col no-underline transition duration-300 hover:-translate-y-0.5 hover:no-underline"
                      >
                        {cardInner}
                      </a>
                    ) : (
                      <Link
                        href={d.href}
                        className="group flex h-full flex-col no-underline transition duration-300 hover:-translate-y-0.5 hover:no-underline"
                      >
                        {cardInner}
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

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
              <Link
                href="#captain-maker"
                className={cn(
                  mmsBtnPrimary,
                  "mt-7 inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto",
                )}
              >
                Ask Captain Maker
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
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

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="ventures">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Ventures</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Flagship builds under the umbrella</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Brands and launches that still roll up to Mixed Maker Shop — same hub as web, maker work, and labs.
              </p>
              <p className={cn("mt-5 text-sm font-bold uppercase tracking-[0.14em] text-[rgba(232,149,92,0.95)]")}>
                {umbrellaStudioTagline}
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2", mmsHomeGlassStackGap)}>
              {homeVentures.map((v) => (
                <article key={v.name} className="public-glass-box--soft public-glass-box--pad flex min-h-[12rem] flex-col">
                  <h3 className={mmsH3OnGlass}>{v.name}</h3>
                  <p className={cn("mt-3 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                    {v.description}
                  </p>
                  {v.external ? (
                    <a
                      href={v.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        mmsTextLinkOnGlass,
                        "mt-5 inline-flex items-center gap-2 font-semibold no-underline hover:no-underline",
                      )}
                    >
                      Visit venture
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={v.href}
                      className={cn(mmsTextLinkOnGlass, "mt-5 inline-flex items-center gap-2 font-semibold")}
                    >
                      View on Mixed Maker Shop builds
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="departments">
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-6 lg:grid-cols-2">
              {departmentBridges.map((feature) => (
                <article
                  key={feature.eyebrow}
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

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="explore-more">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Explore More</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Important pages, easy to find.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Pricing, web design services, website examples, local service pages, portfolio work, builds, and print
                requests all stay close to the homepage so you do not have to dig around.
              </p>
            </div>
            <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", mmsHomeGlassStackGap)}>
              {PUBLIC_POPULAR_PAGES.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group public-glass-box--soft flex min-h-[4.5rem] items-center justify-between gap-4 rounded-2xl px-5 py-4 no-underline transition duration-300 hover:-translate-y-0.5 hover:bg-white/12 hover:no-underline"
                >
                  <span className={cn("text-sm font-semibold leading-snug md:text-base", mmsOnGlassPrimary)}>
                    {page.label}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[rgba(232,149,92,0.95)] transition group-hover:translate-x-1" aria-hidden />
                </Link>
              ))}
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
                "Mixed Maker Shop is the umbrella HQ for web design, maker builds, AI & automation, digital products, labs, and story.",
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

        <MixedMakerBrandFaq />

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
                Start with a free homepage preview, run a free website check, send GiGi a print idea, ask about property
                help, or suggest something new for the Idea Lab.
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
                  href="/free-website-check"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "website_check" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex w-full min-w-[12rem] items-center justify-center gap-2 px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Free Website Check
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
                Email the studio directly:{" "}
                <a href={`mailto:${publicTopherEmail}`} className={cn(mmsTextLinkOnGlass, "font-semibold underline-offset-2")}>
                  {publicTopherEmail}
                </a>
              </p>
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
