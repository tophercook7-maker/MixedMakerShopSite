import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clapperboard,
  ExternalLink,
  FlaskConical,
  Gamepad2,
  Globe,
  Layers,
  Leaf,
  Sparkles,
  Wrench,
} from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import {
  MMS_LOCAL_TECH_POSITIONING,
  MmsComebackStorySection,
} from "@/components/public/MmsComebackStorySection";
import { MixedMakerBrandFaq } from "@/components/public/MixedMakerBrandFaq";
import { UmbrellaHomeHero } from "@/components/public/UmbrellaHomeHero";
import { TopherWebDesignHomeSpotlight } from "@/components/public/TopherWebDesignHomeSpotlight";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import {
  publicFreeMockupFunnelHref,
  publicShellClass,
  publicTopherEmail,
} from "@/lib/public-brand";
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
    title: "I need computer or tech help",
    body: "In-home repair, setup, troubleshooting, Wi-Fi issues, and everyday tech problems — local help since 2000, with remote options when it fits.",
    href: "/contact",
    cta: "Get Tech Help",
  },
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
    title: "I want a custom app or AI tool",
    body: "A tool built around one real job — lead-response bots, quoting calculators, job logs, small apps you own outright instead of renting monthly.",
    href: "/lab",
    cta: "See What Gets Built",
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
    title: "In-Home Computer Repair",
    price: "Estimate required",
    body: "House-call diagnostics, performance triage, Wi-Fi stability, upgrades, and everyday tech fixes in Hot Springs and nearby areas.",
  },
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
    title: "Custom Tools & Apps",
    price: "Estimate required",
    body: "Small software built around one real job — calculators, intake forms, job logs, internal dashboards, and apps you own outright.",
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
  "One person. One lab. Every bench runs back to the same desk.";

const labBenches = [
  {
    title: "Websites & Local SEO",
    subtitle: "Bench 01",
    body: "Small business sites, redesigns, landing pages, and local SEO foundations — the work that pays for the rest of the lab. Topher's Web Design is the dedicated branch.",
    href: TOPHER_WEB_DESIGN_URL,
    external: true,
    Icon: Globe,
  },
  {
    title: "In-Home Computer Repair",
    subtitle: "Bench 02",
    body: "House-call diagnostics, virus removal, Wi-Fi stability, upgrades, and everyday tech fixes around Hot Springs — the same work I've done since 2000.",
    href: "/in-home-computer-repair",
    external: false,
    Icon: Wrench,
  },
  {
    title: "AI Tools & Automation",
    subtitle: "Bench 03",
    body: "Practical AI workflows, bots with guardrails, and automation that removes repetitive work — built to be owned, not rented by the month.",
    href: "/websites-tools#ai-automation",
    external: false,
    Icon: Sparkles,
  },
  {
    title: "Apps & Games",
    subtitle: "Bench 04",
    body: "Real shipped software — text adventures, study tools, scanning apps, and web games. Some live on the Mac App Store, some run right in the browser.",
    href: "/lab#apps",
    external: false,
    Icon: Gamepad2,
  },
  {
    title: "Books & Audiobooks",
    subtitle: "Bench 05",
    body: "Written, edited, narrated, and published from this desk — nonfiction, memoir, and fiction, with audio produced in the same lab.",
    href: "/lab#books",
    external: false,
    Icon: BookOpen,
  },
  {
    title: "Music & Video",
    subtitle: "Bench 06",
    body: "Original music, cinematic montages, and pop-out video ads that break the frame — the scroll-stopping kind, made locally instead of licensed.",
    href: "/3d-scenes",
    external: false,
    Icon: Clapperboard,
  },
  {
    title: "Digital Products",
    subtitle: "Bench 07",
    body: "Templates, kits, checklists, and lightweight tools shaped around problems that showed up in real client work.",
    href: "/websites-tools#templates-kits",
    external: false,
    Icon: Layers,
  },
  {
    title: "Property Care",
    subtitle: "Bench 08",
    body: "Lawn care, cleanup, and outdoor help around Hot Springs — routed through Fresh Cut Property Care, another site built in this same lab.",
    href: "/property-care",
    external: false,
    Icon: Leaf,
  },
  {
    title: "Experiments",
    subtitle: "Bench 09",
    body: "Whatever is half-finished on the bench right now — vote on it, suggest something, or watch it become a real offer.",
    href: "/idea-lab",
    external: false,
    Icon: FlaskConical,
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
      "GoneFishin Keychains sells vintage fishing-lure keychains — small, gift-ready pieces with a shop site built in this lab. The site hosts the catalog and checkout.",
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
    eyebrow: "The Lab",
    title: "Everything else that comes off this bench.",
    body: "AI tools, custom apps and games, published books and audiobooks, original music, and pop-out video ads — one person, start to finish.",
    href: "/lab",
    cta: "Step Into the Lab",
    className: "border-teal-300/30 bg-gradient-to-br from-teal-500/12 via-white/8 to-orange-400/8",
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

        <section className={cn(homeBackdrop)} id="comeback-story">
          <div className={cn(shell, mmsSectionY)}>
            <MmsComebackStorySection variant="glass" id="comeback-story" />
          </div>
        </section>

        <section className={cn(homeBackdrop)} id="lab-benches">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>The lab map</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Nine benches. One person at all of them.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                {MMS_LOCAL_TECH_POSITIONING} Websites, repair calls, AI tooling, apps and games, books and audio, music
                and video, digital products, property care, and whatever is currently half-finished — all the same desk.
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
              {labBenches.map((d) => {
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
                      Open bench
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
                Computer repair, web design, AI help, and custom builds all come out of the same one-man lab — pick the
                closest fit, or start with a free homepage preview if you want to see the direction before committing to
                anything.
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", mmsHomeGlassStackGap)}>
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
                The fastest way to see if we&apos;re a fit is to request a free homepage preview built around your business.
                You&apos;ll get a clear direction before you commit to anything.
              </p>
              <Link href={publicFreeMockupFunnelHref} className={cn(mmsBtnPrimary, "mt-7 inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto")}>
                Get a Free Website Preview
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop)} id="choose">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Start Here</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>What do you need help with today?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Pick the path that matches today. Topher&apos;s Web Design is the dedicated web branch; the Lab is
                everything else on the bench — same person either way.
              </p>
              <Link
                href={publicFreeMockupFunnelHref}
                className={cn(
                  mmsBtnSecondaryOnGlass,
                  "mt-7 inline-flex w-full justify-center gap-2 px-8 no-underline hover:no-underline sm:w-auto",
                )}
              >
                Get a Free Website Preview
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3", mmsHomeGlassStackGap)}>
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
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Proof that what comes out of this lab is real.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                A quick proof wall before the benches: local service sites, creative platforms, app-style tools, and the
                free preview flow — alongside Topher&apos;s Web Design for the dedicated web branch.
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
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Flagship builds out of the lab</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Brands and launches that ship on their own domains but still get built, maintained, and shipped from this
                one desk.
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
                Pricing, web design services, website examples, local service pages, portfolio work, builds, and the Lab
                all stay close to the homepage so you do not have to dig around.
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

        <section className={cn("border-t border-b", homeBackdrop, "max-md:bg-[#111510]")} id="about-topher">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>About Topher</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>About Topher</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                I&apos;m Topher — local tech help since 2000, formerly Cook&apos;s Computer Service, now rebuilding
                through Mixed Maker Shop.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                {MMS_LOCAL_TECH_POSITIONING} Topher&apos;s Web Design is the dedicated web branch; the Lab is where
                everything else gets built — organized in one place instead of scattered across a dozen sites.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                The goal is simple: build useful things that help real people — whether that is a house call for a slow
                PC, a website that actually brings in calls, or a small tool that quietly takes a chore off your plate.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                <Link href="/about#story-legacy" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  Read the full comeback story
                </Link>{" "}
                from Cook&apos;s Computer Service to MixedMakerShop.
              </p>
              <p className="mt-7 rounded-2xl border border-white/12 bg-white/10 px-5 py-4 text-lg font-semibold text-white">
                “What would actually help someone?”
              </p>
            </div>
            <div className={cn("grid gap-6 md:grid-cols-3", mmsHomeGlassStackGap)}>
              {[
                "In-home computer repair and tech help for Hot Springs, Benton, Hot Springs Village, Lake Hamilton, Fountain Lake, and nearby areas.",
                "Topher's Web Design is the dedicated branch for sites, local SEO, informational pages, and web systems.",
                "The Lab covers everything else — AI tools, apps and games, books and audiobooks, music, and video.",
              ].map((line, i) => (
                <div key={line} className="public-glass-box--soft public-glass-box--pad">
                  <span className={mmsStepCircleOnGlass} aria-hidden>{i + 1}</span>
                  <p className={cn("text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="pop-out-ads">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Mixed Maker Labs &middot; pop-out video ads</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Scroll-stopping pop-out video ads</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                We turn a flat business image into a cinematic pop-out video &mdash; watch a real squirrel tear
                right through the page below. Perfect motion for a website hero or a scroll-stopping social post.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/12">
              <video
                src="/videos/squirrel-breakout.mp4"
                poster="/videos/squirrel-breakout-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="A real squirrel tearing through the Mixed Maker Shop homepage"
                className="block h-auto w-full"
              />
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
                Start with a free homepage preview, run a free website check, ask about a custom tool, ask about property
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
                One person. One lab. Useful things, start to finish.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
