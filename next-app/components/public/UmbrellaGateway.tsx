"use client";

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
import Link from "next/link";

function BrowserMockup() {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <div className="ml-3 h-7 flex-1 rounded-full bg-white/10" />
      </div>
      <div className="grid h-[calc(100%-52px)] grid-cols-[1.1fr_0.9fr] gap-3 p-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-400/25 via-sky-300/15 to-transparent p-4">
          <div className="mb-3 h-3 w-24 rounded-full bg-white/20" />
          <div className="mb-2 h-8 w-4/5 rounded-lg bg-white/15" />
          <div className="mb-4 h-8 w-3/5 rounded-lg bg-white/10" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded-lg bg-emerald-300/20" />
            <div className="h-16 rounded-lg bg-sky-300/15" />
            <div className="h-16 rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <div className="mb-3 h-24 rounded-xl bg-gradient-to-b from-sky-300/20 to-emerald-300/10" />
          <div className="mb-2 h-3 w-3/4 rounded-full bg-white/20" />
          <div className="mb-2 h-3 w-1/2 rounded-full bg-white/15" />
          <div className="mt-4 h-10 rounded-xl bg-emerald-400/25" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_35%)]" />
    </div>
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

function PrinterScene() {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.10)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <svg viewBox="0 0 420 220" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="printerGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(96,165,250,0.85)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.75)" />
          </linearGradient>
        </defs>
        <rect
          x="70"
          y="42"
          width="280"
          height="128"
          rx="18"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.15)"
        />
        <rect
          x="95"
          y="58"
          width="230"
          height="84"
          rx="12"
          fill="rgba(15,23,42,0.95)"
          stroke="rgba(96,165,250,0.25)"
        />
        <rect x="125" y="76" width="160" height="10" rx="5" fill="rgba(255,255,255,0.12)" />
        <rect x="150" y="86" width="110" height="38" rx="8" fill="rgba(52,211,153,0.18)" />
        <rect x="166" y="96" width="78" height="18" rx="6" fill="rgba(96,165,250,0.28)" />
        <rect x="110" y="148" width="200" height="8" rx="4" fill="url(#printerGlow)" opacity="0.8" />
        <rect
          x="188"
          y="30"
          width="44"
          height="32"
          rx="10"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.15)"
        />
        <rect x="198" y="42" width="24" height="42" rx="10" fill="rgba(96,165,250,0.25)" />
        <circle cx="340" cy="66" r="10" fill="rgba(52,211,153,0.30)" />
        <circle cx="355" cy="102" r="6" fill="rgba(96,165,250,0.30)" />
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.2),transparent_35%)]" />
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%),linear-gradient(180deg,#07111f_0%,#08131c_100%)] px-4 py-12 text-white md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Choose your path</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">What are you trying to build?</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Pick the direction that fits what you need — more customers for your business online, or custom 3D printing
            and problem-solving that turns ideas into real parts.
          </p>
        </div>

        <div className="mb-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
          Two powerful ways to work with MixedMakerShop
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

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <BrowserMockup />
                  </div>
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
                      <div className="rounded-xl bg-black/20 px-3 py-2">Landscaping website demo</div>
                      <div className="rounded-xl bg-black/20 px-3 py-2">Pressure washing landing page</div>
                      <div className="rounded-xl bg-black/20 px-3 py-2">Quote calculator or booking tool</div>
                      <div className="rounded-xl bg-black/20 px-3 py-2">Free mockup to show a better direction</div>
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
                    <Link href="/web-design">
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
                  Custom 3D printing for broken parts, replacements, functional tools, and custom ideas — whether you
                  already have a print file or just need help figuring out the solution.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <PrinterScene />
                  </div>
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
                      <div className="rounded-xl bg-black/20 px-3 py-2">Replacement part for something discontinued</div>
                      <div className="rounded-xl bg-black/20 px-3 py-2">Truck, tool, or workspace organizer</div>
                      <div className="rounded-xl bg-black/20 px-3 py-2">Custom bracket, clip, or holder</div>
                      <div className="rounded-xl bg-black/20 px-3 py-2">Prototype or one-off practical solution</div>
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
                    <Link href="/3d-printing">
                      Start a Print Project <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/5 p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Not sure which path?</p>
          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2 md:text-base">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
              Need more customers, visibility, or a better online setup?{" "}
              <span className="font-semibold text-emerald-200">Choose Web Design.</span>
            </div>
            <div className="rounded-2xl border border-sky-400/15 bg-sky-400/5 px-4 py-3">
              Need a custom part, file printed, or help solving a physical problem?{" "}
              <span className="font-semibold text-sky-200">Choose 3D Printing.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
