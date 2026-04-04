/**
 * Preserved homepage 3D column (formerly rendered beside web design on `/`).
 * Not imported by the live homepage — kept for reuse. `/3d-printing` and printing components unchanged.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Wrench, Printer, Cog, Box, Hammer } from "lucide-react";
import { trackGatewayNav } from "@/lib/public-analytics";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";

export const ARCHIVED_PRINT_HERO = [
  {
    src: "/images/printing/bambu-fleet-three-monitor-hero.png",
    alt: "MixedMaker 3D printing workstation with monitors and Bambu Lab printers",
  },
  { src: "/images/printing/printing-case-repair.png", alt: "Custom 3D-printed repair part" },
  { src: "/images/printing/printing-process-printing.png", alt: "FDM 3D print on the build plate" },
] as const;

function ArchivedPrintPathPhotoCollage({ href }: { href: string }) {
  return (
    <Link
      href={href}
      onClick={() => trackGatewayNav("3d_printing", "hero_visual")}
      className="group/hero relative mb-5 block overflow-hidden rounded-2xl border border-white/15 shadow-2xl outline-none ring-sky-400/0 transition ring-offset-2 ring-offset-[#07111f] focus-visible:ring-2 focus-visible:ring-sky-400/40"
    >
      <div className="grid h-48 grid-cols-3 gap-px bg-white/10 sm:h-56 md:h-64">
        {ARCHIVED_PRINT_HERO.map((item) => (
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

function ArchivedPartTile() {
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

function ArchivedFixTile() {
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

function ArchivedToolTile() {
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

function ArchivedBenefitList({ items }: { items: string[] }) {
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

export function ArchivedHomepage3dColumn() {
  return (
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

          <ArchivedPrintPathPhotoCollage href="/3d-printing" />

          <div className="grid gap-3 md:grid-cols-2">
            <ArchivedPartTile />
            <div className="grid gap-3">
              <ArchivedFixTile />
              <ArchivedToolTile />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-200">
                <Printer className="h-4 w-4" />
                What this helps with
              </div>
              <ArchivedBenefitList
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
  );
}
