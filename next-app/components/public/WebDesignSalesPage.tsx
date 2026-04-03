import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, LayoutTemplate, Sparkles, Wrench } from "lucide-react";
import { HomeSalesVisual } from "@/components/public/HomeSalesVisual";
import { HomeDeepWellShowcase } from "@/components/public/HomeDeepWellShowcase";
import { WebDesignProofStrip } from "@/components/public/WebDesignProofStrip";
import { WebDesignMockupNextSteps } from "@/components/public/WebDesignMockupNextSteps";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { publicBodyMutedClass, publicCardGlassWebClass, publicSectionDividerClass, publicShellClass } from "@/lib/public-brand";

const shell = publicShellClass;
const read = "max-w-[760px]";
const readTight = "max-w-[42rem]";
const h2 = "text-3xl md:text-4xl lg:text-[2.85rem] font-semibold tracking-tight text-[#E8FDF5] lg:leading-[1.08]";
const body = publicBodyMutedClass;
const sectionY = "py-20 md:py-28";

const solutionBullets = [
  "Clear messaging — visitors understand what you do in seconds",
  "Clean design — professional look that builds trust",
  "Conversion-focused — built to turn visitors into leads",
  "Mobile-first — fast, readable, easy to use on phones",
];

const whatIBuild: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Websites",
    description:
      "Clean sites that make your business look legit and make it easy for customers to reach you.",
    icon: LayoutTemplate,
  },
  {
    title: "Landing Pages",
    description: "One offer, one service, or one launch — focused pages that convert.",
    icon: Sparkles,
  },
  {
    title: "Simple Tools / Apps",
    description: "Quote calculators, booking forms, and job trackers that save time and keep work moving.",
    icon: Wrench,
  },
];

const QUOTE_CALC_IMAGE =
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80";
const JOB_TRACKER_IMAGE =
  "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=900&q=80";

const workByCategory = [
  {
    title: "Local service websites",
    blurb: "Trades and teams that need trust, clarity, and calls.",
    links: [
      { label: "Landscaping demo", href: "/samples/landscaping" },
      { label: "Plumbing / HVAC sample", href: "/samples/plumbing" },
      { label: "Auto detailing", href: "/samples/auto-detailing" },
      { label: "Browse all samples", href: "/website-samples" },
    ],
  },
  {
    title: "Landing pages",
    blurb: "Single-focus pages for estimates, launches, and promos.",
    links: [
      { label: "Pressure washing landing page", href: "/samples/pressure-washing" },
      { label: "Restaurant / food sample", href: "/samples/restaurant" },
      { label: "Wellness / booking flow", href: "/samples/wellness" },
    ],
  },
  {
    title: "Simple business tools",
    blurb: "Interactive ideas you can start small and grow.",
    links: [
      { label: "Instant quote-style flow (example)", href: "/samples/quote-calculator" },
      { label: "Website check tool", href: "/free-website-check" },
      { label: "Contact for custom tools", href: "/contact" },
    ],
  },
  {
    title: "Free mockups / previews",
    blurb: "See direction before you commit.",
    links: [
      { label: "Free website mockup funnel", href: "/free-mockup" },
      { label: "Website + SEO offer", href: "/offer" },
    ],
  },
];

const pricingTiers = [
  {
    tag: "STARTER",
    name: "Starter Website",
    price: "$400",
    note: "one-time",
    lede: "Get online the right way",
    items: ["1–3 page website", "Mobile-friendly + click-to-call", "Contact / quote form", "Basic SEO + Google Business connection"],
  },
  {
    tag: "GROWTH",
    name: "Growth System",
    price: "$600",
    note: "+ from $89/mo",
    featured: true,
    lede: "Site + ongoing visibility work",
    items: [
      "Full website build",
      "Stronger SEO + Google Business optimization",
      "Structure built for calls and conversions",
      "Content / ad support as you grow",
    ],
    monthlyBullets: ["SEO improvements", "Google Business updates", "Content + ads", "Ongoing optimization"],
  },
  {
    tag: "CUSTOM",
    name: "Custom Builds",
    price: "Quoted",
    note: "by project",
    lede: "Larger or specialized projects",
    items: ["Custom layouts & advanced features", "Specialized functionality", "Bigger structures & integrations"],
  },
];

export function WebDesignSalesPage() {
  const landscaping = getPortfolioSampleBySlug("landscaping");
  const pressureWashing = getPortfolioSampleBySlug("pressure-washing");

  const spotlightExamples = [
    landscaping && {
      label: "Landscaping Website Demo",
      href: "/samples/landscaping",
      imageUrl: landscaping.cardImageUrl,
      imageAlt: "Landscaping website sample preview",
    },
    pressureWashing && {
      label: "Pressure Washing Landing Page",
      href: "/samples/pressure-washing",
      imageUrl: pressureWashing.cardImageUrl,
      imageAlt: "Pressure washing landing page sample preview",
    },
    {
      label: "Instant quote-style tool (sample)",
      href: "/samples/quote-calculator",
      imageUrl: QUOTE_CALC_IMAGE,
      imageAlt: "Laptop and estimating — example of an interactive quote tool",
    },
    {
      label: "Simple Job Tracker App (concept)",
      href: "/#what-i-build",
      imageUrl: JOB_TRACKER_IMAGE,
      imageAlt: "Task board — example of a simple job tracking tool",
    },
  ].filter(Boolean) as {
    label: string;
    href: string;
    imageUrl: string;
    imageAlt: string;
  }[];

  return (
    <div className="home-premium home-premium--textured">
      <section className="home-band home-band--hero home-hero relative overflow-hidden">
        <div className="home-band-hero-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-grain pointer-events-none absolute inset-0" aria-hidden />
        <div
          className={`${shell} home-hero-inner relative z-[2] pt-20 sm:pt-24 md:pt-32 lg:pt-[8.75rem] pb-24 sm:pb-28 md:pb-32 lg:pb-[6.5rem]`}
        >
          <div className="grid grid-cols-1 items-center gap-y-14 lg:gap-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(400px,1.18fr)] lg:gap-x-16 xl:gap-x-[7rem] lg:items-center">
            <div className="home-hero-copy home-hero-copy--readable lg:pr-2">
              <p className="home-reveal home-hero-eyebrow">Topher&apos;s Web Design</p>
              <h1 className="home-reveal home-hero-headline home-section-title">
                Web Design That Brings You Customers
              </h1>
              <p className="home-reveal home-hero-sub">
                I build websites for small businesses that look better, load faster, and actually turn visitors into leads.
              </p>
              <div className="home-reveal home-hero-ctas">
                <Link href="/free-mockup" className="home-btn-primary home-btn-primary--hero">
                  Get My Free Website Preview
                </Link>
                <Link href="#browse-by-type" className="home-btn-secondary--hero">
                  Browse sample work
                </Link>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "web_design_hero" }}
                  className="home-btn-secondary--hero"
                >
                  Contact
                </TrackedPublicLink>
              </div>
              <ul className="home-reveal home-hero-trust mt-8" aria-label="What to expect">
                <li>Results-focused — sites built to bring leads, not just look pretty</li>
                <li>Mockup first — see a real homepage preview before you commit</li>
                <li>Practical — clear messaging, fast pages, no fluff</li>
              </ul>
            </div>
            <div className="home-reveal home-hero-visual-slot w-full min-w-0 flex justify-center lg:justify-end">
              <HomeSalesVisual />
            </div>
          </div>
        </div>
        <div className="home-band-hero-foot pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden />
      </section>

      <WebDesignProofStrip />

      <section id="problem" className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>
            Most websites don&apos;t do anything
          </h2>
          <div className={`home-reveal mt-8 space-y-4 ${body} ${read}`}>
            <p>Too many small business sites are outdated — they don&apos;t look trustworthy.</p>
            <p>They&apos;re confusing — visitors can&apos;t tell what you offer or what to do next.</p>
            <p className="font-medium text-[#E8FDF5]/88">
              So nothing happens — people leave and you never get the lead.
            </p>
            <p className="font-medium text-[#E8FDF5]/90">
              Your business deserves a site that earns attention and turns clicks into real conversations.
            </p>
          </div>
        </div>
      </section>

      <section id="solution" className="home-band home-band--deep">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>I build websites that work</h2>
          <p className={`home-reveal mt-5 ${body} ${read}`}>
            Built for <span className="text-[#E8FDF5]/90 font-medium">small businesses</span>,{" "}
            <span className="text-[#E8FDF5]/90 font-medium">local services</span>, and{" "}
            <span className="text-[#E8FDF5]/90 font-medium">lead-focused businesses</span> that need more from their site
            than a placeholder.
          </p>
          <ul className="home-reveal mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 max-w-[880px]">
            {solutionBullets.map((text) => (
              <li
                key={text}
                className="home-card home-card--glass flex gap-3 rounded-2xl p-5 md:p-6 items-start"
              >
                <CheckCircle2 className="h-6 w-6 shrink-0 text-[#00FFB2] mt-0.5" strokeWidth={1.75} aria-hidden />
                <span className="text-base md:text-[17px] font-medium leading-snug text-[#E8FDF5] pt-0.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="what-i-build" className="home-band home-band--surface border-y border-[rgba(232,253,245,0.06)]">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>What I Build</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {whatIBuild.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="home-reveal home-card home-card--glass flex flex-col rounded-2xl p-6 md:p-8 transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
              >
                <span className="home-system-icon flex h-12 w-12 items-center justify-center rounded-xl text-[#00FFB2]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-5 text-xl md:text-2xl font-semibold text-[#E8FDF5] tracking-tight">{title}</h3>
                <p className={`mt-3 ${body} text-sm md:text-[15px] flex-1`}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="browse-by-type" className="home-band home-band--deep">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} max-w-[800px]`}>Browse by type</h2>
          <p className={`home-reveal mt-5 ${body} max-w-[760px]`}>
            Same portfolio you already know — organized so it&apos;s easier to browse.
          </p>
          <div className={`home-reveal mt-8 ${publicSectionDividerClass}`} />

          <div className={`home-reveal mt-12 ${publicCardGlassWebClass} p-6 md:p-8 lg:p-10`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(0,255,178,0.78)]">
              Browse by category
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
              {workByCategory.map((group) => (
                <div key={group.title} className="home-reveal home-card home-card--glass rounded-2xl p-6 md:p-7">
                  <h3 className="text-lg md:text-xl font-semibold text-[#e09a5a]">{group.title}</h3>
                  <p className={`mt-2 text-sm md:text-[15px] ${body}`}>{group.blurb}</p>
                  <ul className="mt-4 space-y-2">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <TrackedPublicLink
                          href={l.href}
                          eventName="public_web_design_sample_click"
                          eventProps={{ location: "web_design_browse_by_type", label: l.label }}
                          className="text-[15px] font-medium text-[#00FFB2] hover:text-[#35ffc1] underline-offset-2 hover:underline"
                        >
                          {l.label}
                        </TrackedPublicLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="home-reveal mx-auto my-12 max-w-lg md:my-14">
            <div className={publicSectionDividerClass} />
          </div>

          <div>
            <p className="home-reveal text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(232,149,92,0.85)]">
              Spotlight samples
            </p>
            <p className={`home-reveal mt-3 max-w-[40rem] text-sm md:text-[15px] ${body}`}>
              Tap through real layouts — demos, landing pages, and tool-style examples.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {spotlightExamples.map((item) => (
              <TrackedPublicLink
                key={item.label}
                href={item.href}
                eventName="public_web_design_sample_click"
                eventProps={{ location: "web_design_spotlight", label: item.label }}
                className="home-reveal home-sample-card group flex flex-col overflow-hidden rounded-2xl border border-[rgba(0,255,178,0.14)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0F1513]">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    className="object-cover opacity-92 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F0E]/80 via-transparent to-transparent opacity-80" />
                </div>
                <div className="home-sample-card__body flex flex-1 flex-col p-6 md:p-7">
                  <p className="text-lg md:text-xl font-semibold text-[#E8FDF5]">{item.label}</p>
                  <span className="home-sample-card__cta mt-5 inline-flex w-fit items-center justify-center rounded-xl border border-[rgba(232,149,92,0.35)] bg-[rgba(232,149,92,0.08)] px-4 py-2.5 text-sm font-semibold text-[#e09a5a] transition-colors group-hover:border-[rgba(232,149,92,0.5)] group-hover:bg-[rgba(232,149,92,0.12)] group-hover:text-[#f0b078]">
                    View example
                  </span>
                </div>
              </TrackedPublicLink>
            ))}
          </div>
        </div>
      </section>

      <section className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>No templates. No guessing.</h2>
          <p className={`home-reveal mt-5 ${body} ${read}`}>
            I start with a <span className="text-[#E8FDF5]/90 font-medium">custom mockup</span> — a real homepage
            direction for <em>your</em> business — not a generic template you have to reverse-engineer. You see how it
            could look and read before you invest in a full build, so there&apos;s no mystery about what you&apos;re
            getting.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                t: "Mockup first",
                d: "Preview layout and messaging early — not after money has changed hands.",
              },
              {
                t: "Built for you",
                d: "Your offers, your area, your goals — not a one-size-fits-all theme.",
              },
              {
                t: "You sign off",
                d: "Review the design, then we move to launch when you are ready.",
              },
            ].map((item) => (
              <div
                key={item.t}
                className="home-reveal home-card home-card--glass rounded-2xl p-6 md:p-8 text-center sm:text-left"
              >
                <p className="text-xl md:text-2xl font-semibold text-[#e09a5a]">{item.t}</p>
                <p className={`mt-3 text-sm md:text-[15px] ${body}`}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="home-band home-band--deep border-y border-[rgba(232,253,245,0.06)]">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>Simple Pricing</h2>
          <p className={`home-reveal mt-5 ${body} ${read}`}>
            Three entry points — start lean, add ongoing visibility, or go custom when the project needs it.
          </p>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`home-reveal home-card home-card--glass rounded-2xl p-6 md:p-8 flex flex-col ${
                  tier.featured ? "ring-1 ring-[rgba(0,255,178,0.35)] lg:scale-[1.02]" : ""
                }`}
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#9FB5AD]">{tier.tag}</p>
                <h3 className="mt-3 text-xl font-semibold text-[#E8FDF5]">{tier.name}</h3>
                <p className="mt-2 text-2xl font-semibold text-[#00FFB2]">
                  {tier.price}{" "}
                  <span className="text-sm font-medium text-[#9FB5AD]">{tier.note}</span>
                </p>
                <p className={`mt-3 text-sm ${body}`}>{tier.lede}</p>
                <ul className="mt-4 space-y-2 text-sm text-[#9FB5AD] list-disc pl-5">
                  {tier.items.map((li) => (
                    <li key={li} className="leading-relaxed">
                      {li}
                    </li>
                  ))}
                </ul>
                {"monthlyBullets" in tier && tier.monthlyBullets ? (
                  <div className="mt-5 rounded-xl border border-[rgba(0,255,178,0.15)] bg-[rgba(0,255,178,0.04)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#E8FDF5]/90">
                      Monthly support includes
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-[#9FB5AD] list-disc pl-5">
                      {tier.monthlyBullets.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className={`home-reveal mt-10 text-sm ${body} ${readTight}`}>
            Website build fees can sometimes roll into a monthly plan when you&apos;re getting started — ask when we talk.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>How It Works</h2>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 list-none p-0 m-0">
            {[
              {
                n: "1",
                title: "Request your mockup",
                body: "Share your business basics — I will return a custom homepage preview you can react to.",
              },
              {
                n: "2",
                title: "Review the design",
                body: "You give feedback on layout and messaging; we align it with how you actually work.",
              },
              {
                n: "3",
                title: "Launch",
                body: "When you are ready, we ship a fast, mobile-friendly site built to bring in leads.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="home-reveal home-card home-card--glass rounded-2xl p-6 md:p-8 flex flex-col gap-3"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,255,178,0.12)] text-sm font-bold text-[#00FFB2] border border-[rgba(0,255,178,0.22)]">
                  {step.n}
                </span>
                <h3 className="text-lg md:text-xl font-semibold text-[#E8FDF5]">{step.title}</h3>
                <p className={`${body} text-sm md:text-[15px]`}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <WebDesignMockupNextSteps />

      <HomeDeepWellShowcase />

      <section className="home-band home-band--final home-final-cta">
        <div className={shell}>
          <div className="home-reveal home-final-cta__frame max-w-[48rem]">
            <p className="mx-auto mb-4 max-w-[28rem] text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(0,255,178,0.8)]">
              Next step
            </p>
            <h2 className="home-reveal home-final-cta__title">Get My Free Website Preview</h2>
            <p className={`home-reveal mt-5 ${body} max-w-[36rem] mx-auto`}>
              See a custom homepage direction for your business — practical, low-pressure, focused on results.
            </p>
            <p className="home-reveal mx-auto mt-4 max-w-[34rem] text-center text-sm leading-relaxed text-[#9FB5AD]/88">
              No obligation. Just a real preview so you can decide if moving forward makes sense.
            </p>
            <div className="home-final-cta__ctas">
              <Link href="/free-mockup" className="home-btn-primary home-btn-primary--final">
                Get My Free Website Preview
              </Link>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "web_design_final" }}
                className="home-btn-secondary--hero w-full sm:w-auto justify-center"
              >
                Contact
              </TrackedPublicLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
