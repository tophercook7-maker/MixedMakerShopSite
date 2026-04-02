"use client";

/**
 * Homepage: web design, SEO & digital growth by Topher (public-facing).
 * Legacy 3D column lives in `./archived/homepage-3d-column.tsx` — not imported here.
 */

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { trackGatewayNav, trackPublicEvent } from "@/lib/public-analytics";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { cn } from "@/lib/utils";

function WebPathPhotoCollage({ href }: { href: string }) {
  const land = getPortfolioSampleBySlug("landscaping");
  const pw = getPortfolioSampleBySlug("pressure-washing");
  const detail = getPortfolioSampleBySlug("auto-detailing");
  const slices: { src: string; alt: string }[] = [];
  if (land)
    slices.push({
      src: land.cardImageUrl,
      alt: `${land.title} sample preview`,
    });
  if (pw)
    slices.push({ src: pw.cardImageUrl, alt: `${pw.title} sample preview` });
  if (detail)
    slices.push({
      src: detail.cardImageUrl,
      alt: `${detail.title} sample preview`,
    });
  while (slices.length < 3) {
    const fb =
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";
    slices.push({
      src: fb,
      alt: "Website and analytics — local business online presence",
    });
    if (slices.length >= 3) break;
  }

  return (
    <Link
      href={href}
      onClick={() => trackGatewayNav("web_design", "hero_visual")}
      className="group/hero relative mb-5 block overflow-hidden rounded-2xl border border-white/15 shadow-2xl outline-none ring-emerald-400/0 transition ring-offset-2 ring-offset-[#07111f] focus-visible:ring-2 focus-visible:ring-emerald-400/40"
    >
      <div className="grid h-48 grid-cols-3 gap-px bg-white/10 sm:h-56 md:h-64">
        {slices.slice(0, 3).map((item) => (
          <div key={item.src} className="relative min-h-[8rem] sm:min-h-0">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover transition duration-500 group-hover/hero:scale-[1.04]"
              sizes="(max-width:1024px) 34vw, 380px"
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07111f]/92 via-[#07111f]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,transparent_42%,rgba(7,17,31,0.55)_100%)]" />
      <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 md:text-xs">
        Sample sites &amp; pages — open gallery
      </p>
    </Link>
  );
}

const gatewayPricingTiers = [
  {
    tag: "STARTER",
    name: "Starter Website",
    price: "$400",
    note: "one-time",
    lede: "Get online the right way",
    featured: false,
    items: [
      "1–3 page website",
      "Mobile-friendly + click-to-call",
      "Contact / quote form",
      "Basic SEO + Google Business connection",
    ],
  },
  {
    tag: "GROWTH SITE",
    name: "Growth Website",
    price: "$600",
    note: "one-time",
    lede: "A fuller site built to convert",
    featured: false,
    items: [
      "Full website build",
      "Stronger on-page structure for SEO",
      "Google Business alignment",
      "Layout and messaging focused on leads",
    ],
  },
  {
    tag: "MONTHLY",
    name: "Growth System",
    price: "From $89",
    note: "/mo",
    featured: true,
    lede: "Keep visibility and your site moving",
    items: [
      "SEO improvements",
      "Google Business updates",
      "Content and page updates",
      "Ongoing optimization",
    ],
  },
];

export function UmbrellaGateway() {
  return (
    <div className="home-page--immersive relative isolate min-h-screen w-full">
      <div className="home-page__bg" aria-hidden />
      <div className="home-page__veil" aria-hidden />
      <div className="home-page__inner min-h-screen px-4 py-12 text-white md:px-6 md:py-16">
        <div className="home-gateway-motion-scope mx-auto max-w-7xl">
          {/* Hero */}
          <div className="home-gateway-pop home-gateway-pop--hero mx-auto mb-16 max-w-3xl text-center md:mb-20">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
              Web Design by Topher
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Custom Websites for Small Businesses
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              I help small businesses grow with better websites, better
              messaging, and useful digital tools.
            </p>
            <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3">
              <Button
                asChild
                className="w-full gap-2 rounded-2xl bg-emerald-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-emerald-300 sm:w-auto"
              >
                <Link
                  href="/free-mockup"
                  onClick={() =>
                    trackPublicEvent("public_contact_cta_click", {
                      location: "gateway",
                      target: "free_mockup",
                      section: "hero",
                    })
                  }
                >
                  Get My Free Website Preview <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs leading-relaxed text-slate-400 md:text-sm">
                No pressure. No obligation. Just a real preview of your future
                site.
              </p>
            </div>
          </div>

          {/* Problem */}
          <section
            className="home-gateway-pop mx-auto mb-16 max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:mb-20 md:p-8"
            aria-labelledby="problem-section-heading"
          >
            <h2
              id="problem-section-heading"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Most websites don&apos;t bring in customers
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300">
              A website alone usually just sits there. If your business is not
              getting calls, showing up well on Google, or turning visitors into
              leads, you need more than a pretty design.
            </p>
          </section>

          {/* Solution */}
          <section
            className="home-gateway-pop mx-auto mb-16 max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:mb-20 md:p-8"
            aria-labelledby="solution-section-heading"
          >
            <h2
              id="solution-section-heading"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              What actually helps your business grow
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300">
              I build websites that are designed to look professional, explain
              what you do clearly, and help turn visitors into real customers. I
              also offer ongoing support for SEO, Google visibility, and updates
              so your site keeps working after launch.
            </p>
          </section>

          {/* How it works — informational only, no CTAs */}
          <section
            className="mx-auto mb-16 max-w-4xl text-center md:mb-20"
            aria-labelledby="how-it-works-heading"
          >
            <div className="home-gateway-pop">
              <h2
                id="how-it-works-heading"
                className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
              >
                How it works
              </h2>
            </div>
            <div className="mt-8 grid gap-5 text-left md:grid-cols-3 md:gap-6">
              <div className="home-gateway-pop rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                  Step 1
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  You tell me about your business
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Share what you do, who you serve, and what you want your site
                  to accomplish.
                </p>
              </div>
              <div className="home-gateway-pop rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                  Step 2
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  I design your preview
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  You get a custom homepage preview so you can see layout and
                  messaging before you commit.
                </p>
              </div>
              <div className="home-gateway-pop rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                  Step 3
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  You choose next steps
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  If it&apos;s a fit, we build and launch. If not, you still
                  leave with clarity.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            className="mx-auto mb-16 max-w-5xl md:mb-24"
            aria-labelledby="pricing-section-heading"
          >
            <div className="home-gateway-pop">
              <h2
                id="pricing-section-heading"
                className="text-center text-2xl font-semibold tracking-tight text-white md:text-3xl"
              >
                Simple pricing
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-slate-300">
                No guesswork. Just a clear website package, a stronger growth
                package, and optional monthly support to keep things moving.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
              {gatewayPricingTiers.map((tier) => (
                <div key={tier.name} className="home-gateway-pop">
                  <div
                    className={cn(
                      "h-full rounded-[28px] border bg-white/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl md:p-8",
                      tier.featured
                        ? "border-emerald-400/35 ring-1 ring-emerald-400/25 md:scale-[1.02]"
                        : "border-white/10",
                    )}
                  >
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {tier.tag}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-white md:text-xl">
                      {tier.name}
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-emerald-300">
                      {tier.price}{" "}
                      <span className="text-sm font-medium text-slate-400">
                        {tier.note}
                      </span>
                    </p>
                    <p className="mt-3 text-sm text-slate-400">{tier.lede}</p>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                      {tier.items.map((li) => (
                        <li key={li} className="leading-relaxed">
                          {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="home-gateway-pop mx-auto mt-14 max-w-xl text-center md:mt-16">
              <p className="text-base leading-relaxed text-slate-300">
                Not sure what you need? I&apos;ll design a free preview first.
              </p>
              <Button
                asChild
                className="mt-8 w-full gap-2 rounded-2xl bg-emerald-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-emerald-300 sm:w-auto"
              >
                <Link
                  href="/free-mockup"
                  onClick={() =>
                    trackPublicEvent("public_contact_cta_click", {
                      location: "gateway",
                      target: "free_mockup",
                      section: "pricing",
                    })
                  }
                >
                  Get My Free Website Preview <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Sample websites / proof */}
          <section
            className="mx-auto mb-16 max-w-4xl md:mb-24"
            aria-labelledby="samples-heading"
          >
            <div className="home-gateway-pop">
              <h2
                id="samples-heading"
                className="text-center text-2xl font-semibold tracking-tight text-white md:text-3xl"
              >
                Sample websites
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-slate-300 md:text-base">
                Click through real layouts — demos and tools built for local
                service businesses.
              </p>
            </div>

            <div className="home-gateway-pop mt-10">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="overflow-hidden rounded-[28px] border border-emerald-400/20 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <CardContent className="p-5 md:p-6">
                    <WebPathPhotoCollage href="/website-samples" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <TrackedPublicLink
                        href="/samples/landscaping"
                        eventName="public_web_design_sample_click"
                        eventProps={{
                          location: "gateway",
                          label: "landscaping_demo",
                        }}
                        className="block rounded-xl bg-black/20 px-3 py-2.5 text-left text-sm text-slate-200/90 transition hover:bg-black/30"
                      >
                        Landscaping demo
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/samples/pressure-washing"
                        eventName="public_web_design_sample_click"
                        eventProps={{
                          location: "gateway",
                          label: "pressure_washing",
                        }}
                        className="block rounded-xl bg-black/20 px-3 py-2.5 text-left text-sm text-slate-200/90 transition hover:bg-black/30"
                      >
                        Pressure washing landing page
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/samples/quote-calculator"
                        eventName="public_web_design_sample_click"
                        eventProps={{
                          location: "gateway",
                          label: "quote_calculator",
                        }}
                        className="block rounded-xl bg-black/20 px-3 py-2.5 text-left text-sm text-slate-200/90 transition hover:bg-black/30"
                      >
                        Quote calculator example
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/website-samples"
                        eventName="public_web_design_sample_click"
                        eventProps={{
                          location: "gateway",
                          label: "all_samples",
                        }}
                        className="block rounded-xl bg-black/20 px-3 py-2.5 text-left text-sm text-slate-200/90 transition hover:bg-black/30"
                      >
                        Browse all website samples
                      </TrackedPublicLink>
                    </div>
                    <div className="mt-8 flex justify-center">
                      <Button
                        asChild
                        className="w-full gap-2 rounded-2xl bg-emerald-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-emerald-300 sm:w-auto"
                      >
                        <Link
                          href="/free-mockup"
                          onClick={() =>
                            trackPublicEvent("public_contact_cta_click", {
                              location: "gateway",
                              target: "free_mockup",
                              section: "samples",
                            })
                          }
                        >
                          Get My Free Website Preview{" "}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Final CTA */}
          <section
            className="home-gateway-pop mx-auto max-w-3xl rounded-[28px] border border-emerald-400/25 bg-white/5 p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:mb-8 md:p-8"
            aria-labelledby="final-cta-heading"
          >
            <h2
              id="final-cta-heading"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Want to see what your website could look like?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
              I&apos;ll put together a free preview for your business so you can
              see the direction before committing.
            </p>
            <Button
              asChild
              className="mt-6 w-full gap-2 rounded-2xl bg-emerald-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-emerald-300 sm:w-auto"
            >
              <Link
                href="/free-mockup"
                onClick={() =>
                  trackPublicEvent("public_contact_cta_click", {
                    location: "gateway",
                    target: "free_mockup",
                    section: "final_cta",
                  })
                }
              >
                Get My Free Website Preview <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
