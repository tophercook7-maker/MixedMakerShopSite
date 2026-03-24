import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  LayoutTemplate,
  MapPin,
  Megaphone,
  MessageSquareText,
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
const readTight = "max-w-[700px]";
const h2 = "text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#E8FDF5]";
const body = "text-base md:text-lg leading-relaxed text-[#9FB5AD]";

const systemItems: { text: string; icon: LucideIcon }[] = [
  { text: "A clean, high-converting website", icon: LayoutTemplate },
  { text: "Ongoing SEO so people can find you", icon: Search },
  { text: "Google Business optimization", icon: MapPin },
  { text: "Staying active so you show up in local searches", icon: Activity },
  { text: "Ads and content to keep things moving", icon: Megaphone },
  { text: "Simple posts you can use without overthinking it", icon: MessageSquareText },
];

const flowSteps = ["Website", "SEO", "Google", "Growth"];

export default function HomePage() {
  const portfolioShowcase = PORTFOLIO_SAMPLES.slice(0, 6);

  return (
    <div className="home-premium home-premium--textured">
      {/* Hero */}
      <section className="home-band home-band--hero home-hero relative overflow-hidden">
        <div className="home-band-hero-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-grain pointer-events-none absolute inset-0" aria-hidden />
        <div
          className={`${shell} home-hero-inner relative z-[2] pt-20 sm:pt-24 md:pt-32 lg:pt-[8.75rem] pb-24 sm:pb-28 md:pb-32 lg:pb-[6.5rem]`}
        >
          <div className="grid grid-cols-1 items-center gap-y-14 lg:gap-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(400px,1.18fr)] lg:gap-x-16 xl:gap-x-[7rem] lg:items-center">
            <div className="home-hero-copy max-w-[720px] lg:max-w-[680px] xl:max-w-[720px] lg:pr-2">
              <p className="home-reveal home-hero-eyebrow">
                Websites that actually bring in customers
              </p>
              <h1 className="home-reveal home-hero-headline home-section-title">
                Websites that help local businesses
                <br className="hidden md:block" /> get found, get calls, and grow
              </h1>
              <p className="home-reveal home-hero-sub">
                Not just a website — a complete system with design, SEO, Google Business optimization, and ongoing
                support that keeps your business visible and moving forward.
              </p>
              <p className="home-reveal home-hero-support">
                Designed to help your business get found, look credible, and grow.
              </p>
              <p className="home-reveal home-hero-loc">
                <span className="home-hero-loc-pill">Hot Springs, Arkansas</span>
                <span className="home-hero-loc-meta">Website · SEO · Ongoing growth</span>
              </p>
              <div className="home-reveal home-hero-ctas">
                <Link href="/free-mockup" className="home-btn-primary home-btn-primary--hero">
                  Get My Free Website Preview
                </Link>
                <Link href="/offer" className="home-btn-secondary--hero">
                  See the Website + SEO Offer
                </Link>
              </div>
              <ul className="home-reveal home-hero-trust" aria-label="What to expect">
                <li>Built for local businesses</li>
                <li>SEO-minded from the start</li>
                <li>Mockup first, no pressure</li>
              </ul>
            </div>
            <div className="home-reveal home-hero-visual-slot w-full min-w-0 flex justify-center lg:justify-end">
              <HomeSalesVisual />
            </div>
          </div>
        </div>
        <div className="home-band-hero-foot pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden />
      </section>

      {/* Problem */}
      <section className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} py-16 md:py-24`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>
            A website alone won&apos;t grow your business
          </h2>
          <p className={`home-reveal mt-5 ${body} ${read}`}>
            Most businesses build a site and then wonder why nothing happens.
          </p>
          <ul className="home-reveal mt-4 space-y-2 text-base md:text-lg font-medium text-[#E8FDF5]/95">
            <li>No traffic.</li>
            <li>No calls.</li>
            <li>No real growth.</li>
          </ul>
          <p className={`home-reveal mt-8 text-lg md:text-xl font-medium text-[#00FFB2] ${read}`}>
            Because what actually works is a complete system.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { t: "No traffic", d: "Your site sits invisible while competitors show up in search." },
              { t: "No calls", d: "Weak messaging and missing next steps mean visitors bounce." },
              { t: "No real growth", d: "Without SEO and activity, momentum fades after launch day." },
            ].map((c) => (
              <div key={c.t} className="home-reveal home-card home-card--glass group rounded-2xl p-6 md:p-8">
                <p className="text-xl md:text-2xl font-semibold text-[#FFD166]">{c.t}</p>
                <p className={`mt-3 ${body} text-sm md:text-base`}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className={`home-reveal mt-12 ${body} ${readTight}`}>
            A website by itself usually just sits there. Growth happens when design, visibility, search, and ongoing
            activity work together.
          </p>
        </div>
      </section>

      {/* System */}
      <section className="home-band home-band--deep">
        <div className={`${shell} py-16 md:py-24`}>
          <h2 className={`home-reveal home-section-title ${h2} ${read}`}>
            What actually works is a complete system
          </h2>
          <p className={`home-reveal mt-4 ${body} ${read}`}>
            Most businesses try to piece this together. We make it simple and keep it working.
          </p>

          <div className="home-reveal home-system-flow mt-10 mb-12" aria-hidden="true">
            {flowSteps.map((label, i) => (
              <div key={label} className="home-system-flow-item">
                <span className="home-system-flow-node">{label}</span>
                {i < flowSteps.length - 1 && <span className="home-system-flow-arrow" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {systemItems.map(({ text, icon: Icon }) => (
              <div
                key={text}
                className="home-reveal home-card home-card--glass flex gap-4 rounded-2xl p-5 md:p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
              >
                <span className="home-system-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#00FFB2]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-base md:text-lg font-medium leading-snug text-[#E8FDF5] pt-0.5">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} py-16 md:py-24`}>
          <h2 className={`home-reveal home-section-title ${h2}`}>Simple pricing. Real growth.</h2>
          <p className={`home-reveal mt-4 ${body} max-w-[640px]`}>
            No guessing. No piecing things together. Just a system that helps bring in more customers over time.
          </p>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1040px]">
            <div className="home-reveal home-card home-card--glass rounded-2xl p-8 md:p-9 text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9FB5AD]">One-time</p>
              <p className="mt-2 text-5xl font-bold tracking-tight text-[#E8FDF5]">$600</p>
              <p className="mt-1 text-[#9FB5AD] text-base md:text-lg">Website build</p>
              <ul className={`mt-6 space-y-2.5 text-left ${body} text-sm md:text-base`}>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Clean, mobile-friendly design</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>High-converting layout</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Built to turn visitors into customers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Structured to support SEO from the start</span>
                </li>
              </ul>
            </div>
            <div className="home-reveal home-card home-card--glass home-card--featured rounded-2xl p-8 md:p-9 text-center lg:text-left">
              <p className="inline-block rounded-full border border-[rgba(255,209,102,0.4)] bg-[rgba(255,209,102,0.1)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#FFD166]">
                Where growth happens
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#9FB5AD]">Monthly</p>
              <p className="mt-2 text-5xl font-bold tracking-tight text-[#E8FDF5]">
                <span className="text-lg md:text-xl font-semibold text-[#9FB5AD] align-middle mr-1">Starting at</span>
                $89<span className="text-2xl font-semibold text-[#9FB5AD]">/mo</span>
              </p>
              <p className="mt-1 text-[#9FB5AD] text-base md:text-lg">Ongoing growth support</p>
              <ul className={`mt-6 space-y-2.5 text-left ${body} text-sm md:text-base`}>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>SEO improvements</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Google Business optimization</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Local visibility support</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Occasional ads and content help</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Ongoing updates as your business grows</span>
                </li>
              </ul>
            </div>
          </div>
          <div className={`home-reveal mt-8 space-y-3 max-w-[720px] ${body} text-sm md:text-base`}>
            <p>
              You can also roll the setup into your monthly service when you get started. The $89/month level is the
              base entry point — as your needs grow, your support can grow with it.
            </p>
          </div>
          <div className="home-reveal home-pricing-strip mt-10 rounded-2xl border border-[rgba(0,255,178,0.16)] bg-[rgba(0,255,178,0.04)] px-6 py-5 md:px-10 md:py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-center md:text-left">
              <p className="text-base md:text-lg text-[#9FB5AD]">
                <span className="font-medium text-[#E8FDF5]">A website alone</span> sits there.
              </p>
              <p className="text-base md:text-lg text-[#9FB5AD]">
                <span className="font-medium text-[#00FFB2]">A growth system</span> keeps working for your business.
              </p>
            </div>
          </div>
          <div className="home-reveal mt-8">
            <Link href="/offer" className="text-sm font-semibold text-[#00FFB2] hover:text-[#35FFC1]">
              Full Website + SEO offer details →
            </Link>
          </div>
        </div>
      </section>

      {/* Why businesses get stuck — comparison */}
      <section className="home-band home-band--deep home-band--compare">
        <div className={`${shell} py-16 md:py-24`}>
          <h2 className={`home-reveal home-section-title ${h2} max-w-[760px]`}>Why businesses get stuck</h2>
          <p className={`home-reveal mt-4 ${body} max-w-[640px]`}>
            Launching a site is only the beginning. Without ongoing visibility work, results stall — while competitors
            keep showing up.
          </p>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1100px]">
            <div className="home-reveal home-compare home-compare--muted rounded-2xl border border-[rgba(232,253,245,0.08)] p-8 md:p-9">
              <h3 className="text-xl md:text-2xl font-semibold text-[#9FB5AD]">Website only</h3>
              <ul className={`mt-6 space-y-3 ${body}`}>
                <li>Goes live</li>
                <li>No updates</li>
                <li>No SEO momentum</li>
                <li>No Google activity</li>
                <li>No clear growth</li>
              </ul>
            </div>
            <div className="home-reveal home-compare home-compare--highlight rounded-2xl border border-[rgba(0,255,178,0.22)] p-8 md:p-9">
              <h3 className="text-xl md:text-2xl font-semibold text-[#E8FDF5]">MixedMaker Growth System</h3>
              <ul className="mt-6 space-y-3 text-base md:text-lg leading-relaxed text-[#9FB5AD]">
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Website built right</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>SEO improves over time</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Google presence stays active</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Content and ad support when you need it</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FFB2] shrink-0">✓</span>
                  <span>Ongoing opportunities to grow</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mockup CTA */}
      <section className="home-band home-band--cta home-mockup-cta relative overflow-hidden">
        <div className="home-mockup-cta__glow home-mockup-cta__glow--mint pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-mockup-cta__glow home-mockup-cta__glow--gold pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-mockup-cta__mesh pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
        <div className={`${shell} relative z-[1] py-20 md:py-28 text-center`}>
          <div className="home-reveal home-mockup-cta__frame mx-auto max-w-[820px] rounded-3xl border border-[rgba(0,255,178,0.14)] bg-[rgba(17,26,23,0.55)] px-6 py-12 md:px-14 md:py-14 backdrop-blur-md">
            <h2 className={`home-reveal home-section-title ${h2}`}>
              Want to see what your business could look like?
            </h2>
            <p className={`home-reveal mt-5 ${body} max-w-[600px] mx-auto`}>
              I can put together a quick preview showing how your website could look and how it could help bring in more
              customers.
            </p>
            <p className={`home-reveal mt-4 text-sm md:text-base text-[#9FB5AD] max-w-[520px] mx-auto leading-relaxed`}>
              No pressure — just a better way to see what&apos;s possible.
            </p>
            <div className="home-reveal mt-10 flex justify-center">
              <Link
                href="/free-mockup"
                className="home-btn-primary inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold text-[#0B0F0E] transition-transform duration-200 hover:scale-[1.03]"
              >
                Get My Free Website Preview
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Samples */}
      <section className="home-band home-band--deep" id="samples">
        <div className={`${shell} py-16 md:py-24`}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
            <div className="max-w-[760px]">
              <h2 className={`home-reveal home-section-title ${h2}`}>Proven website examples for local businesses</h2>
              <p className={`home-reveal mt-4 ${body}`}>
                These are real examples of simple, high-converting websites built to bring in more calls and customers.
                Your business can follow a proven layout like these, or we can build something more tailored to fit your
                brand.
              </p>
            </div>
            <div className="home-reveal shrink-0">
              <Link
                href="/free-mockup"
                className="home-btn-primary inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-[#0B0F0E] transition-transform duration-200 hover:scale-[1.03]"
              >
                Get My Free Website Preview
              </Link>
            </div>
          </div>
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
                  <p className={`mt-2 flex-1 text-sm md:text-base leading-relaxed text-[#9FB5AD] line-clamp-2`}>
                    {p.description}
                  </p>
                  <span className="home-sample-card__cta mt-5 inline-flex w-fit items-center justify-center rounded-xl border border-[rgba(255,209,102,0.35)] bg-[rgba(255,209,102,0.08)] px-4 py-2.5 text-sm font-semibold text-[#FFD166] transition-colors group-hover:border-[rgba(255,209,102,0.5)] group-hover:bg-[rgba(255,209,102,0.12)] group-hover:text-[#FFE08A]">
                    View example
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="home-reveal mt-12 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
            <Link
              href="/free-mockup"
              className="home-btn-primary inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-[#0B0F0E] transition-transform duration-200 hover:scale-[1.03]"
            >
              Get My Free Website Preview
            </Link>
            <Link
              href="/website-samples"
              className="text-sm font-semibold text-[#00FFB2] hover:text-[#35FFC1]"
            >
              Browse all samples →
            </Link>
          </div>
        </div>
      </section>

      {/* 3D printing secondary */}
      <section className="home-band home-band--surface home-band--print border-t border-[rgba(232,253,245,0.08)]">
        <div className={`${shell} py-16 md:py-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className={`home-reveal home-section-title ${h2}`}>Custom 3D printing, too</h2>
              <p className={`home-reveal mt-4 ${body} ${read}`}>
                Need something printed instead of a website? Upload your file or your idea and we can help bring it to
                life.
              </p>
              <div className="home-reveal mt-8 flex flex-wrap gap-3">
                <Link
                  href="/upload-print"
                  className="home-btn-primary inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-[#0B0F0E] transition-transform duration-200 hover:scale-[1.03]"
                >
                  Upload Your Print Request
                </Link>
                <Link
                  href="/3d-printing"
                  className="inline-flex items-center justify-center rounded-2xl border border-[rgba(255,209,102,0.3)] px-5 py-3 text-sm font-medium text-[#FFD166] hover:border-[#FFE08A] hover:text-[#FFE08A]"
                >
                  Learn about 3D printing
                </Link>
              </div>
            </div>
            <div className="home-reveal home-card home-card--glass home-card--print-accent rounded-3xl p-8 md:p-10">
              <p className="text-sm font-medium text-[#E8FDF5]">Separate from web services</p>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-[#FFD166] tracking-tight">PLA parts · prototypes · practical prints</p>
              <p className={`mt-4 ${body} text-sm md:text-base`}>
                Same craft and attention to detail — when you need something physical, not a customer funnel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-band home-band--final relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_80%_20%,rgba(255,209,102,0.08),transparent_50%)]" />
        <div className={`${shell} relative z-[1] py-16 md:py-24 text-center`}>
          <h2 className={`home-reveal home-section-title ${h2} max-w-[640px] mx-auto`}>
            Stop piecing everything together
          </h2>
          <p className={`home-reveal mt-5 ${body} max-w-[560px] mx-auto`}>
            Get a website that actually works for your business and support that keeps it growing.
          </p>
          <p className={`home-reveal mt-4 text-sm md:text-base text-[#9FB5AD] max-w-[520px] mx-auto leading-relaxed`}>
            Built for local businesses that want more calls, more customers, and a stronger online presence.
          </p>
          <div className="home-reveal mt-10 flex justify-center">
            <Link
              href="/free-mockup"
              className="home-btn-primary inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold text-[#0B0F0E] transition-transform duration-200 hover:scale-[1.03]"
            >
              Get My Free Website Preview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
