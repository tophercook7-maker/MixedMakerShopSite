import { Layers, RefreshCw, BrickWall, Puzzle } from "lucide-react";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";

const ITEMS = [
  {
    title: "Custom tool holders",
    copy: "Keep tools, bits, and shop essentials organized your way.",
    icon: Layers,
  },
  {
    title: "Replacement parts",
    copy: "Replace broken or hard-to-find pieces with custom-fit PLA parts.",
    icon: RefreshCw,
  },
  {
    title: "Wall mounts",
    copy: "Strong, clean mounts for garages, workshops, sheds, and home setups.",
    icon: BrickWall,
  },
  {
    title: "One-off problem solvers",
    copy: "When the part does not exist, we can design a solution around your need.",
    icon: Puzzle,
  },
] as const;

export function WhatWeMake() {
  return (
    <PrintingSection className="bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(249,115,22,0.06),transparent)]">
      <div className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <PrintingSectionHeader
          eyebrow="Capabilities"
          title="What we make"
          subtitle="Practical PLA work for real jobs — shop floors, garages, and everyday fixes. Not shelf clutter."
        />
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {ITEMS.map(({ title, copy, icon: Icon }) => (
            <div
              key={title}
              className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-transparent p-6 pt-7 shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition duration-300 before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-orange-500/45 before:to-transparent before:opacity-0 before:transition-opacity hover:border-orange-500/25 hover:shadow-[0_24px_56px_rgba(0,0,0,0.38)] hover:before:opacity-100 md:p-7"
            >
              <div className="mb-5 inline-flex w-fit rounded-xl bg-orange-500/[0.12] p-3 text-orange-400/95 ring-1 ring-orange-500/20 transition group-hover:bg-orange-500/18">
                <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
              </div>
              <h3 className="text-base font-semibold leading-snug tracking-[-0.02em] text-white">{title}</h3>
              <p className="mt-2.5 flex-1 text-[0.8125rem] leading-[1.62] text-white/50">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </PrintingSection>
  );
}
