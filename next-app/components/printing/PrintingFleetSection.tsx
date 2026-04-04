import { Monitor, Printer, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { PrintingSectionHeader } from "@/components/printing/printing-section";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { cn } from "@/lib/utils";

const CARDS: {
  icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
}[] = [
  {
    icon: Monitor,
    title: "Triple-monitor workstation",
    body: "Design and slice with room to breathe — keep queues organized, previews sharp, and communication with you crystal clear while jobs run.",
    tag: "Command center",
  },
  {
    icon: Printer,
    title: "Bambu Lab A1 + AMS Lite",
    body: "Flexible, reliable printing with multi-color AMS Lite — great for detailed work, prototypes, and jobs where the A1’s strengths shine.",
    tag: "1× A1",
  },
  {
    icon: Layers,
    title: "2× Bambu Lab P1S + AMS Pro",
    body: "Enclosed, hardened machines with AMS Pro multi-material systems — built for steady production, repeatability, and serious throughput.",
    tag: "2× P1S",
  },
];

/**
 * Highlights the real MixedMakerShop print farm — photo hero is separate in PrintingHero.
 */
export function PrintingFleetSection() {
  return (
    <section className="border-b border-white/[0.06] py-14 md:py-20" aria-label="Print farm and workstation">
      <div className={printingContentClass}>
        <PrintingSectionHeader
          eyebrow="Print farm"
          title="Real hardware. Real capacity."
          subtitle="This isn’t a hobby corner — it’s a coordinated Bambu Lab setup built to turn your files (or your problem) into finished parts."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <RevealOnScroll key={card.title} delayMs={index * 70}>
                <div
                  className={cn(
                    printingSectionSurfaceClass,
                    "printing-premium-card group flex h-full flex-col p-6 sm:p-7 md:p-8",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/25 to-emerald-500/15 text-orange-200/95 ring-1 ring-white/10">
                      <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-white sm:text-xl">{card.title}</h3>
                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-white/[0.78]">{card.body}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        <RevealOnScroll delayMs={220}>
          <p className="mt-10 max-w-3xl text-center text-[0.9375rem] leading-relaxed text-white/[0.62] lg:mx-auto">
            PLA-focused custom work in <strong className="font-semibold text-white/[0.88]">Hot Springs, Arkansas</strong> —{" "}
            from one-off fixes to batches that need multiple machines working in parallel.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
