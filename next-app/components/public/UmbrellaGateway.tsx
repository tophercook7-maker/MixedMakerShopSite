"use client";

/**
 * Homepage: web design & digital tools (primary). Former 3D column preserved in
 * `./archived/homepage-3d-column.tsx` for reuse — not rendered here.
 */

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, MonitorSmartphone, Search, FormInput } from "lucide-react";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { publicGatewayPageBgClass } from "@/lib/public-brand";
import { trackGatewayNav, trackPublicEvent } from "@/lib/public-analytics";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { cn } from "@/lib/utils";

function WebPathPhotoCollage({ href }: { href: string }) {
  const land = getPortfolioSampleBySlug("landscaping");
  const pw = getPortfolioSampleBySlug("pressure-washing");
  const detail = getPortfolioSampleBySlug("auto-detailing");
  const slices: { src: string; alt: string }[] = [];
  if (land) slices.push({ src: land.cardImageUrl, alt: `${land.title} sample preview` });
  if (pw) slices.push({ src: pw.cardImageUrl, alt: `${pw.title} sample preview` });
  if (detail) slices.push({ src: detail.cardImageUrl, alt: `${detail.title} sample preview` });
  while (slices.length < 3) {
    const fb =
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";
    slices.push({ src: fb, alt: "Website and analytics — local business online presence" });
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
        Sample sites &amp; pages — open web design
      </p>
    </Link>
  );
}

function MobileWebsiteTile() {
  return (
    <div className="relative h-32 overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-950 p-3 shadow-xl">
      <div className="mx-auto h-full w-16 rounded-[18px] border border-white/15 bg-slate-900 p-1">
        <div className="mx-auto mb-1 h-2 w-7 rounded-full bg-white/20" />
        <div className="h-16 rounded-xl bg-gradient-to-b from-emerald-300/30 to-sky-300/10" />
        <div className="mt-1 h-2 w-10 rounded-full bg-white/20" />
        <div className="mt-1 h-2 w-8 rounded-full bg-white/10" />
        <div className="mt-2 h-4 rounded-md bg-emerald-400/25" />
      </div>
      <MonitorSmartphone className="absolute right-3 top-3 h-4 w-4 text-emerald-300/80" />
    </div>
  );
}

function SearchTile() {
  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-950 p-3 shadow-xl">
      <div className="mb-3 flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-2">
        <Search className="h-4 w-4 text-sky-300" />
        <div className="h-2.5 w-28 rounded-full bg-white/20" />
      </div>
      <div className="space-y-2">
        <div className="rounded-xl bg-white/5 p-2">
          <div className="mb-1 h-2 w-20 rounded-full bg-emerald-300/40" />
          <div className="h-2 w-32 rounded-full bg-white/15" />
        </div>
        <div className="rounded-xl bg-white/5 p-2">
          <div className="mb-1 h-2 w-24 rounded-full bg-emerald-300/30" />
          <div className="h-2 w-24 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  );
}

function LeadFormTile() {
  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-950 p-3 shadow-xl">
      <FormInput className="mb-2 h-4 w-4 text-emerald-300" />
      <div className="space-y-2">
        <div className="h-7 rounded-lg bg-white/10" />
        <div className="h-7 rounded-lg bg-white/10" />
        <div className="h-8 rounded-lg bg-emerald-400/25" />
      </div>
    </div>
  );
}

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 text-sm text-slate-200/90">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        >
          <span className="mt-0.5 text-emerald-300">✔</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function UmbrellaGateway() {
  return (
    <div
      className={cn(
        publicGatewayPageBgClass,
        "min-h-screen px-4 py-12 text-white md:px-6 md:py-16",
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
            Web Design by Topher
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Custom Websites for Small Businesses</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            I help small businesses grow with better websites, better messaging, and useful digital tools.
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
                Get My Free Mockup <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs leading-relaxed text-slate-400 md:text-sm">
              No pressure. No obligation. Just a real preview of your future site.
            </p>
          </div>
        </div>

        <section
          className="mx-auto mb-14 max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:mb-16 md:p-8"
          aria-labelledby="problem-section-heading"
        >
          <h2
            id="problem-section-heading"
            className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
          >
            Your website should be bringing you customers — not costing you them
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-300">
            <p>Most small business websites don&apos;t convert.</p>
            <p>They look outdated, confusing, or don&apos;t clearly explain what you do.</p>
            <p>Visitors leave before they ever contact you.</p>
            <p className="font-medium text-slate-200">That&apos;s where I come in.</p>
            <p>I build websites designed to:</p>
            <ul className="ml-1 list-none space-y-2 border-l border-emerald-400/30 pl-4">
              <li className="text-slate-300">Make your business look professional</li>
              <li className="text-slate-300">Clearly explain what you offer</li>
              <li className="text-slate-300">Turn visitors into real leads</li>
            </ul>
          </div>
        </section>

        <section
          className="mx-auto mb-14 max-w-4xl text-center md:mb-16"
          aria-labelledby="how-it-works-heading"
        >
          <h2
            id="how-it-works-heading"
            className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
          >
            How it works
          </h2>
          <div className="mt-8 grid gap-5 text-left md:grid-cols-3 md:gap-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Step 1</p>
              <p className="mt-2 text-lg font-semibold text-white">You request a free mockup</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Tell me about your business and what you want your site to do — no payment, no commitment.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Step 2</p>
              <p className="mt-2 text-lg font-semibold text-white">I build your preview</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                I design a custom homepage mockup so you can see direction, layout, and messaging before you decide.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Step 3</p>
              <p className="mt-2 text-lg font-semibold text-white">You decide if you want to move forward</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                If it&apos;s a fit, we keep going. If not, you still walk away with clarity — no hard sell.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mx-auto mb-14 max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:mb-16 md:p-8"
          aria-labelledby="what-you-get-heading"
        >
          <h2 id="what-you-get-heading" className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            What you get
          </h2>
          <ul className="mx-auto mt-6 max-w-lg space-y-2.5 text-left text-sm text-slate-200/90 md:text-base">
            {[
              "Clean, modern website",
              "Mobile-friendly design",
              "Clear messaging",
              "Fast loading",
              "Built to generate leads",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <span className="mt-0.5 text-emerald-300">✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mb-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
          Websites &amp; Digital Tools
        </div>

        <div className="mx-auto grid max-w-4xl gap-8">
          <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.18 }}>
            <Card className="group overflow-hidden rounded-[28px] border border-emerald-400/20 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
                      Topher&apos;s Web Design
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Get More Customers Online</h2>
                  </div>
                  <div className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Websites • Landing Pages • Tools
                  </div>
                </div>

                <p className="mb-6 max-w-2xl text-base leading-7 text-slate-300">
                  Websites, landing pages, and simple business tools built to help local service businesses get found, look
                  legit, and turn clicks into real paying customers.
                </p>

                <WebPathPhotoCollage href="/web-design" />

                <div className="grid gap-3 md:grid-cols-2">
                  <MobileWebsiteTile />
                  <div className="grid gap-3">
                    <SearchTile />
                    <LeadFormTile />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-200">
                      <Search className="h-4 w-4" />
                      What this helps with
                    </div>
                    <BenefitList
                      items={[
                        "Show up better when customers search for your service",
                        "Explain what you do clearly in seconds",
                        "Turn visitors into calls, texts, and leads",
                        "Look more professional than relying on Facebook alone",
                      ]}
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/10 to-sky-400/5 p-4">
                    <div className="mb-3 text-sm font-medium text-emerald-200">Examples &amp; ideas</div>
                    <div className="grid gap-2 text-sm text-slate-200/90">
                      <TrackedPublicLink
                        href="/samples/landscaping"
                        eventName="public_web_design_sample_click"
                        eventProps={{ location: "gateway", label: "landscaping_demo" }}
                        className="block min-h-11 rounded-xl bg-black/20 px-3 py-2.5 text-left transition hover:bg-black/30 sm:min-h-0"
                      >
                        Landscaping website demo
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/samples/pressure-washing"
                        eventName="public_web_design_sample_click"
                        eventProps={{ location: "gateway", label: "pressure_washing" }}
                        className="block min-h-11 rounded-xl bg-black/20 px-3 py-2.5 text-left transition hover:bg-black/30 sm:min-h-0"
                      >
                        Pressure washing landing page
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/samples/quote-calculator"
                        eventName="public_web_design_sample_click"
                        eventProps={{ location: "gateway", label: "quote_calculator" }}
                        className="block min-h-11 rounded-xl bg-black/20 px-3 py-2.5 text-left transition hover:bg-black/30 sm:min-h-0"
                      >
                        Quote calculator or booking tool
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/free-mockup"
                        eventName="public_web_design_sample_click"
                        eventProps={{ location: "gateway", label: "free_mockup" }}
                        className="block min-h-11 rounded-xl bg-black/20 px-3 py-2.5 text-left transition hover:bg-black/30 sm:min-h-0"
                      >
                        Free mockup to show a better direction
                      </TrackedPublicLink>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-col sm:items-stretch">
                  <p className="max-w-xl text-sm text-slate-300">
                    Best for local businesses that want more visibility, more trust, and a cleaner online setup without tech
                    overwhelm.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
                          })
                        }
                      >
                        Get My Free Mockup <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-6 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition hover:border-emerald-400/40 hover:bg-white/10 sm:w-auto"
                    >
                      <Link href="/web-design" onClick={() => trackGatewayNav("web_design", "primary_cta")}>
                        Show Me How This Works <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <section
          className="mx-auto mt-14 max-w-3xl rounded-[28px] border border-emerald-400/25 bg-white/5 p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:mt-16 md:p-8"
          aria-labelledby="final-cta-heading"
        >
          <h2 id="final-cta-heading" className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Want to see what your website could look like?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
            I&apos;ll design a custom homepage for your business so you can see the difference before you commit.
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
              Get My Free Mockup <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        <section
          className="mx-auto mt-14 max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:mt-16 md:p-8"
          aria-labelledby="about-section-heading"
        >
          <h2 id="about-section-heading" className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Who you&apos;re working with
          </h2>
          <div className="mx-auto mt-5 max-w-2xl space-y-4 text-left text-sm leading-relaxed text-slate-300 md:text-base">
            <p>
              I&apos;m Topher — I build websites and digital tools for small businesses that want to grow.
            </p>
            <p>I focus on clarity, simplicity, and real results.</p>
            <p>No fluff. Just websites that work.</p>
          </div>
        </section>

        <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/5 p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-6">
          <p className="text-sm leading-relaxed text-slate-300 md:text-base">
            Ready for a clearer website and more leads?{" "}
            <span className="font-semibold text-emerald-200">
              Start with a free mockup or explore how web design works — links above.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
