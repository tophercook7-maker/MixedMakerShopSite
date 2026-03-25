import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  LayoutTemplate,
  MapPin,
  Megaphone,
  RefreshCw,
  Search,
} from "lucide-react";
import { HomeSalesVisual } from "@/components/public/HomeSalesVisual";
import { PORTFOLIO_SAMPLES } from "@/lib/portfolio-samples";

export const metadata: Metadata = {
  title: "MixedMakerShop | Websites That Bring In Customers",
  description:
    "High-converting websites, SEO, Google Business optimization, and ongoing growth support for local businesses.",
  openGraph: {
    title: "MixedMakerShop | Websites That Bring In Customers",
    description:
      "High-converting websites, SEO, Google Business optimization, and ongoing growth support for local businesses.",
    url: "https://mixedmakershop.com",
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Websites That Bring In Customers",
    description:
      "High-converting websites, SEO, Google Business optimization, and ongoing growth support for local businesses.",
    images: ["/og-image"],
  },
};

const shell = "max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12";
const read = "max-w-[760px]";
const readTight = "max-w-[42rem]";
const h2 = "text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#E8FDF5]";
const body = "text-base md:text-lg leading-relaxed text-[#9FB5AD]";
const sectionY = "py-20 md:py-28";

const systemItems: { text: string; icon: LucideIcon }[] = [
  { text: "Website", icon: LayoutTemplate },
  { text: "SEO", icon: Search },
  { text: "Google Business", icon: MapPin },
  { text: "Content", icon: FileText },
  { text: "Ads", icon: Megaphone },
  { text: "Ongoing updates", icon: RefreshCw },
];

const flowSteps = ["Website", "SEO", "Google", "Content", "Ads", "Updates"];

export default function HomePage() {
  const portfolioShowcase = PORTFOLIO_SAMPLES.slice(0, 6);

  return (
    <div className="home-premium home-premium--textured">
      {/* 1. Hero */}
      <section className="home-band home-band--hero home-hero relative overflow-hidden">
        <div className="home-band-hero-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-grain pointer-events-none absolute inset-0" aria-hidden />
        <div
          className={`${shell} home-hero-inner relative z-[2] pt-20 sm:pt-24 md:pt-32 lg:pt-[8.75rem] pb-24 sm:pb-28 md:pb-32 lg:pb-[6.5rem]`}
        >
          <div className="grid grid-cols-1 items-center gap-y-14 lg:gap-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(400px,1.18fr)] lg:gap-x-16 xl:gap-x-[7rem] lg:items-center">
            <div className="home-hero-copy home-hero-copy--readable lg:pr-2">
              <p className="home-reveal home-hero-eyebrow">Websites that bring in customers</p>
              <h1 className="home-reveal home-hero-headline home-section-title">
                Websites that bring in customers — not just sit there
              </h1>
              <p className="home-reveal home-hero-sub">
                Design, SEO, Google visibility, and ongoing support — one clear system for local businesses.
              </p>
              <p className="home-reveal home-hero-support">
                Built for businesses that want more calls, more visibility, and a stronger online presence.
              </p>
              <div className="home-reveal home-hero-ctas">
                <Link href="/free-mockup" className="home-btn-primary home-btn-primary--hero">
                  Get My Free Website Preview
                </Link>
                <Link href="#how-it-works" className="home-btn-secondary--hero">
                  See How It Works
                </Link>
              </div>
            </div>
            <div className="home-reveal home-hero-visual-slot w-full min-w-0 flex justify-center lg:justify-end">
              <HomeSalesVisual />
            </div>
          </div>
        </div>
        <div className="home-band-hero-foot pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden />
      </section>

      {/* 2. Problem */}
      <section id="problem" className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>Most websites don&apos;t bring in customers</h2>
          <p className={`home-reveal mt-5 ${body} ${read}`}>A website alone usually just sits there.</p>
          <p className={`home-reveal mt-4 ${body} ${read}`}>
            If your business is not showing up well, not getting calls, or not creating real momentum, the problem is
            not just design — it is everything after launch.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
            {[
              { t: "No calls", d: "Visitors leave without a clear next step or trust signal." },
              { t: "Not showing up on Google", d: "Without SEO and activity, you stay buried in search." },
              { t: "No consistent leads", d: "Growth stalls when nothing keeps working after launch." },
            ].map((c) => (
              <div key={c.t} className="home-reveal home-card home-card--glass rounded-2xl p-6 md:p-8">
                <p className="text-xl md:text-2xl font-semibold text-[#FFD166]">{c.t}</p>
                <p className={`mt-3 ${body} text-sm md:text-[15px]`}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className={`home-reveal mt-12 ${body} ${readTight} font-medium text-[#E8FDF5]/90`}>
            That is what happens when a website is built without an actual growth plan behind it.
          </p>
        </div>
      </section>

      {/* 3. Solution / system */}
      <section id="how-it-works" className="home-band home-band--deep">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>What actually works is a complete system</h2>
          <p className={`home-reveal mt-5 ${body} ${read}`}>
            Most businesses do not need &quot;just a website.&quot; They need a system that helps them get found, look
            credible, and keep improving over time.
          </p>

          <div className="home-reveal home-system-flow mt-10 mb-12" aria-hidden="true">
            {flowSteps.map((label, i) => (
              <div key={label} className="home-system-flow-item">
                <span className="home-system-flow-node">{label}</span>
                {i < flowSteps.length - 1 && <span className="home-system-flow-arrow" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {systemItems.map(({ text, icon: Icon }) => (
              <div
                key={text}
                className="home-reveal home-card home-card--glass flex gap-4 rounded-2xl p-6 md:p-7 transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
              >
                <span className="home-system-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#00FFB2]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-base md:text-[17px] font-medium leading-snug text-[#E8FDF5] pt-1">{text}</p>
              </div>
            ))}
          </div>

          <p className={`home-reveal mt-12 ${body} ${readTight}`}>
            We build the website, then keep the important parts moving so your business stays visible and competitive.
          </p>

          <div className="home-reveal mt-10">
            <Link
              href="#samples"
              className="home-btn-primary inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-[15px] font-semibold text-[#0B0F0E] transition-transform duration-200 hover:scale-[1.02]"
            >
              See Example Websites
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Pricing */}
      <section id="pricing" className="pricing-section home-band">
        <div className="pricing-container">
          <h2 className="home-reveal pricing-title">Simple pricing. Real growth.</h2>
          <p className="home-reveal pricing-sub">
            No guessing. No piecing things together. Just a system that helps bring in more customers over time.
          </p>

          <div className="pricing-grid">
            <div className="home-reveal pricing-card starter">
              <p className="pricing-card-name">Starter Website</p>
              <p className="pricing-card-amount">
                $400<span className="pricing-card-amount-note"> one-time</span>
              </p>
              <p className="pricing-card-lede">Get online the right way</p>
              <ul>
                <li>1–3 page website</li>
                <li>Mobile-friendly design</li>
                <li>Basic SEO setup</li>
                <li>Google Business connection</li>
              </ul>
              <span className="tag">Gets you online and visible</span>
            </div>

            <div className="home-reveal pricing-card growth">
              <div className="badge">Best for growth</div>
              <p className="pricing-card-name">Growth Website</p>
              <p className="pricing-card-amount">
                $600<span className="pricing-card-amount-note"> one-time</span>
              </p>
              <p className="pricing-card-lede">Built for stronger results</p>
              <ul>
                <li>Full website build</li>
                <li>High-converting layout</li>
                <li>Stronger SEO setup</li>
                <li>Google Business optimization</li>
                <li>Built to turn visitors into calls</li>
              </ul>
              <span className="tag">Where better results start</span>
            </div>

            <div className="home-reveal pricing-card monthly">
              <p className="pricing-card-name">Growth System</p>
              <p className="pricing-card-kicker">Starting at</p>
              <p className="pricing-card-amount pricing-card-amount--monthly">
                $89<span className="pricing-card-amount-note">/month</span>
              </p>
              <p className="pricing-card-scope">
                <strong className="pricing-card-scope-lead">Ongoing service — not the website build.</strong> Starter and
                Growth above are your one-time site projects. This plan keeps visibility and leads moving after launch.
                You can roll a build into it (see note below).
              </p>
              <p className="pricing-card-lede">This is what actually drives growth</p>
              <ul>
                <li>Ongoing SEO improvements</li>
                <li>Google Business updates</li>
                <li>Content + ads support</li>
                <li>Local visibility work</li>
                <li>Continuous optimization</li>
              </ul>
              <span className="tag">Keeps you showing up and getting customers</span>
            </div>
          </div>

          <p className="home-reveal pricing-note">
            You can also roll your website cost into your monthly plan when you get started.
          </p>
        </div>
      </section>

      {/* 5. Why monthly matters */}
      <section className="home-band home-band--surface border-y border-[rgba(232,253,245,0.06)]">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>Why the monthly matters</h2>
          <p className={`home-reveal mt-5 ${body} ${read}`}>
            A website without ongoing work usually fades into the background.
          </p>
          <p className={`home-reveal mt-4 ${body} ${read}`}>
            Search rankings change. Competitors keep moving. Google Business profiles need activity. Content and
            visibility need attention over time.
          </p>
          <p className={`home-reveal mt-4 ${body} ${read} font-medium text-[#E8FDF5]/92`}>
            That is what the monthly system is for.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              "Ongoing SEO improvements",
              "Google Business updates",
              "Content + ad support",
              "Continuous optimization",
            ].map((title) => (
              <div key={title} className="home-reveal home-monthly-block">
                <h3>{title}</h3>
              </div>
            ))}
          </div>

          <p className={`home-reveal mt-12 ${body} ${readTight} font-medium text-[#00FFB2]`}>
            This is what actually keeps you showing up and getting customers.
          </p>

          <div className="home-reveal mt-8">
            <Link href="#pricing" className="home-link-muted">
              Learn about the Growth System
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Samples */}
      <section id="samples" className="home-band home-band--deep">
        <div className={`${shell} ${sectionY}`}>
          <h2 className={`home-reveal home-section-title ${h2} max-w-[800px]`}>See what this can look like</h2>
          <p className={`home-reveal mt-5 ${body} max-w-[760px]`}>
            Here are examples of simple, high-converting websites built for local businesses. Your business can follow a
            proven structure like these or be tailored to fit your brand.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {portfolioShowcase.map((p) => (
              <Link
                key={p.routeSlug}
                href={`/samples/${p.routeSlug}`}
                className="home-reveal home-sample-card group flex flex-col overflow-hidden rounded-2xl border border-[rgba(0,255,178,0.14)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0F1513]">
                  <Image
                    src={p.cardImageUrl}
                    alt=""
                    fill
                    className="object-cover opacity-92 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F0E]/80 via-transparent to-transparent opacity-80" />
                </div>
                <div className="home-sample-card__body flex flex-1 flex-col p-6 md:p-7">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#00FFB2]">{p.category}</p>
                  <p className="mt-2 text-lg md:text-xl font-semibold text-[#E8FDF5]">{p.title}</p>
                  <p className="mt-2 flex-1 text-sm md:text-base leading-relaxed text-[#9FB5AD] line-clamp-2">
                    {p.description}
                  </p>
                  <span className="home-sample-card__cta mt-5 inline-flex w-fit items-center justify-center rounded-xl border border-[rgba(255,209,102,0.35)] bg-[rgba(255,209,102,0.08)] px-4 py-2.5 text-sm font-semibold text-[#FFD166] transition-colors group-hover:border-[rgba(255,209,102,0.5)] group-hover:bg-[rgba(255,209,102,0.12)] group-hover:text-[#FFE08A]">
                    View example
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="home-reveal mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/website-samples"
              className="inline-flex items-center justify-center rounded-2xl border border-[rgba(0,255,178,0.28)] bg-[rgba(17,26,23,0.55)] px-7 py-3.5 text-[15px] font-semibold text-[#E8FDF5] transition-[border-color,background,color] duration-200 hover:border-[rgba(0,255,178,0.45)] hover:bg-[rgba(0,255,178,0.06)]"
            >
              View Website Samples
            </Link>
            <Link href="#how-it-works" className="text-sm font-semibold text-[#9FB5AD] hover:text-[#00FFB2]">
              See how the system works →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. 3D printing (secondary) */}
      <section className="home-band home-band--surface home-band--print border-t border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} py-16 md:py-20 lg:py-24`}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-14 items-center">
            <div>
              <h2 className={`home-reveal home-section-title ${h2}`}>Custom 3D printing, too</h2>
              <p className={`home-reveal mt-4 ${body} max-w-[540px]`}>
                Need something physical instead of a website? Upload your file or your idea and we can help bring it to
                life.
              </p>
              <div className="home-reveal mt-8 flex flex-wrap gap-3">
                <Link
                  href="/upload-print"
                  className="inline-flex items-center justify-center rounded-2xl border border-[rgba(255,209,102,0.35)] bg-[rgba(255,209,102,0.1)] px-6 py-3.5 text-[15px] font-semibold text-[#FFD166] transition-[border-color,background] duration-200 hover:border-[rgba(255,209,102,0.5)] hover:bg-[rgba(255,209,102,0.14)]"
                >
                  Upload Your Print Request
                </Link>
                <Link
                  href="/3d-printing"
                  className="inline-flex items-center justify-center rounded-2xl border border-[rgba(232,253,245,0.12)] px-5 py-3.5 text-sm font-medium text-[#9FB5AD] hover:border-[rgba(0,255,178,0.25)] hover:text-[#E8FDF5]"
                >
                  Learn About 3D Printing
                </Link>
              </div>
            </div>
            <div className="home-reveal home-card home-card--glass home-card--print-accent rounded-3xl p-8 md:p-9">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9FB5AD]">Secondary service</p>
              <p className="mt-2 text-xl md:text-2xl font-semibold text-[#E8FDF5] tracking-tight">
                Same shop — different deliverable
              </p>
              <p className={`mt-4 ${body} text-sm md:text-[15px]`}>
                3D printing stays available when you need parts or prototypes, without overshadowing the website
                offer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="home-band home-band--final home-final-cta">
        <div className={shell}>
          <div className="home-reveal home-final-cta__frame">
            <h2 className="home-reveal home-final-cta__title">Stop piecing everything together</h2>
            <p className={`home-reveal mt-5 ${body} max-w-[36rem] mx-auto`}>
              Get a website that actually works for your business — and support that helps it keep growing.
            </p>
            <p className="home-reveal mt-4 text-sm md:text-base text-[#9FB5AD] max-w-[32rem] mx-auto leading-relaxed">
              Built for local businesses that want more calls, more customers, and a stronger online presence.
            </p>
            <div className="home-final-cta__ctas">
              <Link
                href="/free-mockup"
                className="home-btn-primary home-btn-primary--hero home-btn-primary--final"
              >
                Get My Free Website Preview
              </Link>
              <Link href="#how-it-works" className="home-btn-secondary--final">
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
