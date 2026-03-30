"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Wrench,
  MonitorSmartphone,
  Search,
  FormInput,
  Printer,
  Cog,
  Box,
  Hammer,
} from "lucide-react";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { publicGatewayPageBgClass } from "@/lib/public-brand";
import { trackGatewayNav } from "@/lib/public-analytics";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { cn } from "@/lib/utils";
import { WhatElseIBuild } from "@/components/public/what-else-i-build";

const PRINT_HERO = [
  { src: "/images/mixedmaker-workspace-hero.png", alt: "MixedMaker 3D printing workspace and setup" },
  { src: "/images/printing/printing-case-repair.png", alt: "Custom 3D-printed repair part" },
  { src: "/images/printing/printing-process-printing.png", alt: "FDM 3D print on the build plate" },
] as const;

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

function PrintPathPhotoCollage({ href }: { href: string }) {
  return (
    <Link
      href={href}
      onClick={() => trackGatewayNav("3d_printing", "hero_visual")}
      className="group/hero relative mb-5 block overflow-hidden rounded-2xl border border-white/15 shadow-2xl outline-none ring-sky-400/0 transition ring-offset-2 ring-offset-[#07111f] focus-visible:ring-2 focus-visible:ring-sky-400/40"
    >
      <div className="grid h-48 grid-cols-3 gap-px bg-white/10 sm:h-56 md:h-64">
        {PRINT_HERO.map((item) => (
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
        Real prints &amp; workspace — open 3D printing
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

function PartTile() {
  return (
    <div className="relative h-32 overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-950 p-3 shadow-xl">
      <div className="absolute right-2 top-2 rounded-full bg-sky-400/15 p-1.5">
        <Cog className="h-4 w-4 text-sky-300" />
      </div>
      <svg viewBox="0 0 160 110" className="h-full w-full">
        <path
          d="M30 72 L54 40 H104 L128 72 L104 92 H54 Z"
          fill="rgba(96,165,250,0.22)"
          stroke="rgba(255,255,255,0.15)"
        />
        <circle cx="80" cy="66" r="12" fill="rgba(52,211,153,0.25)" />
        <circle cx="80" cy="66" r="5" fill="rgba(255,255,255,0.18)" />
      </svg>
    </div>
  );
}

function FixTile() {
  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-950 p-3 shadow-xl">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 p-3">
          <Hammer className="h-4 w-4 text-rose-300" />
          <div className="h-10 w-10 rounded-lg border-2 border-dashed border-rose-300/30" />
        </div>
        <ArrowRight className="h-5 w-5 text-white/50" />
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 p-3">
          <Wrench className="h-4 w-4 text-emerald-300" />
          <div className="h-10 w-10 rounded-lg bg-emerald-400/25" />
        </div>
      </div>
    </div>
  );
}

function ToolTile() {
  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-950 p-3 shadow-xl">
      <div className="flex h-full items-center justify-between rounded-xl bg-white/5 px-3">
        <Box className="h-6 w-6 text-sky-300" />
        <div className="h-12 w-16 rounded-xl bg-sky-400/20" />
        <Wrench className="h-6 w-6 text-emerald-300" />
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
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Ways I can help</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Websites that help your business grow</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Most clients come to me for websites that bring real customers. I also build custom 3D printed products,
            prototypes, and practical parts when that&apos;s what you need. If you need a site, a physical product, or
            both — I can help.
          </p>
        </div>

        <div className="mb-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
          What I build
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
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

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-sm text-slate-300">
                    Best for local businesses that want more visibility, more trust, and a cleaner online setup without tech
                    overwhelm.
                  </p>
                  <Button
                    asChild
                    className="w-full gap-2 rounded-2xl bg-emerald-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-emerald-300 sm:w-auto"
                  >
                    <Link
                      href="/web-design"
                      onClick={() => trackGatewayNav("web_design", "primary_cta")}
                    >
                      Show Me How This Works <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.18 }}>
            <Card className="group overflow-hidden rounded-[28px] border border-sky-400/20 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/80">
                      3D Printing &amp; Problem Solving
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Turn Ideas Into Real Parts</h2>
                  </div>
                  <div className="shrink-0 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100">
                    Custom Prints • Fixes • Prototypes
                  </div>
                </div>

                <p className="mb-6 max-w-2xl text-base leading-7 text-slate-300">
                  Beyond websites: custom 3D printing for broken parts, replacements, functional tools, and custom ideas —
                  whether you already have a print file or just need help figuring out the solution.
                </p>

                <PrintPathPhotoCollage href="/3d-printing" />

                <div className="grid gap-3 md:grid-cols-2">
                  <PartTile />
                  <div className="grid gap-3">
                    <FixTile />
                    <ToolTile />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-200">
                      <Printer className="h-4 w-4" />
                      What this helps with
                    </div>
                    <BenefitList
                      items={[
                        "Fix something broken or replace a missing part",
                        "Create a custom mount, clip, holder, or tool",
                        "Prototype an idea before going bigger",
                        "Send a file or just describe the problem and get help",
                      ]}
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/10 to-emerald-400/5 p-4">
                    <div className="mb-3 text-sm font-medium text-sky-200">Examples &amp; ideas</div>
                    <div className="grid gap-2 text-sm text-slate-200/90">
                      <TrackedPublicLink
                        href="/3d-printing#replacement-parts"
                        eventName="public_3d_sample_click"
                        eventProps={{ location: "gateway", label: "replacement_parts" }}
                        className="group/ex flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-transparent bg-black/20 px-3 py-2.5 text-left transition hover:border-sky-400/25 hover:bg-black/35 sm:min-h-0"
                      >
                        <span className="min-w-0 flex-1">Replacement part for something discontinued</span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-sky-300/65 transition group-hover/ex:translate-x-0.5 group-hover/ex:text-sky-200"
                          aria-hidden
                        />
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/3d-printing#functional-prints"
                        eventName="public_3d_sample_click"
                        eventProps={{ location: "gateway", label: "functional_prints" }}
                        className="group/ex flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-transparent bg-black/20 px-3 py-2.5 text-left transition hover:border-sky-400/25 hover:bg-black/35 sm:min-h-0"
                      >
                        <span className="min-w-0 flex-1">Truck, tool, or workspace organizer</span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-sky-300/65 transition group-hover/ex:translate-x-0.5 group-hover/ex:text-sky-200"
                          aria-hidden
                        />
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/3d-printing#custom-solutions"
                        eventName="public_3d_sample_click"
                        eventProps={{ location: "gateway", label: "custom_solutions" }}
                        className="group/ex flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-transparent bg-black/20 px-3 py-2.5 text-left transition hover:border-sky-400/25 hover:bg-black/35 sm:min-h-0"
                      >
                        <span className="min-w-0 flex-1">Custom bracket, clip, or holder</span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-sky-300/65 transition group-hover/ex:translate-x-0.5 group-hover/ex:text-sky-200"
                          aria-hidden
                        />
                      </TrackedPublicLink>
                      <TrackedPublicLink
                        href="/3d-printing#prototypes"
                        eventName="public_3d_sample_click"
                        eventProps={{ location: "gateway", label: "prototypes" }}
                        className="group/ex flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-transparent bg-black/20 px-3 py-2.5 text-left transition hover:border-sky-400/25 hover:bg-black/35 sm:min-h-0"
                      >
                        <span className="min-w-0 flex-1">Prototype or one-off practical solution</span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-sky-300/65 transition group-hover/ex:translate-x-0.5 group-hover/ex:text-sky-200"
                          aria-hidden
                        />
                      </TrackedPublicLink>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-sm text-slate-300">
                    Best for people who need a part made, a problem solved, or a custom print brought to life without
                    overcomplicating it.
                  </p>
                  <Button
                    asChild
                    className="w-full gap-2 rounded-2xl bg-sky-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-sky-300 sm:w-auto"
                  >
                    <Link href="/3d-printing" onClick={() => trackGatewayNav("3d_printing", "primary_cta")}>
                      Start a Print Project <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/5 p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Still figuring it out?</p>
          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2 md:text-base">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
              Most clients start with a stronger online presence — clearer messaging, better visibility, and more leads.{" "}
              <span className="font-semibold text-emerald-200">Web design is the usual first step.</span>
            </div>
            <div className="rounded-2xl border border-sky-400/15 bg-sky-400/5 px-4 py-3">
              Need a part printed, a prototype, or help with a physical problem?{" "}
              <span className="font-semibold text-sky-200">3D printing is what you&apos;ll want to explore.</span>
            </div>
          </div>
        </div>

        <WhatElseIBuild />
      </div>
    </div>
  );
}
