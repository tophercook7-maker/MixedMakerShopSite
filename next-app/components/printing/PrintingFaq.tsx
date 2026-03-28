import Link from "next/link";
import {
  printingPrimaryCtaClass,
  PrintingSection,
  PrintingSectionHeader,
} from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "What can you print?",
    a: "Useful PLA: replacements, holders, mounts, organizers, dragons, figurines, and other custom prints. If you're not sure if something can be made, just ask — I'll let you know what's possible.",
  },
  {
    q: "How fast can you get a print done?",
    a: "Most simple prints can be done within a few days. Larger or more detailed projects may take longer depending on size and complexity, but I'll always let you know the timeline upfront so there are no surprises.",
  },
  {
    q: "What if I don't have a file?",
    a: "That's totally fine. You can describe what you need, send a photo, or just explain the problem you're trying to solve. I can help figure out the best way to design or create it.",
  },
  {
    q: "Do I need an STL file first?",
    a: "Nope — you only need one if you already have it. If you do, send it over. If not, a few photos or a quick description in your own words is plenty to get started.",
  },
  {
    q: "What material do you use?",
    a: "I print with PLA right here — it's durable, versatile, and a great fit for most everyday parts and projects. Not sure if it's right for your idea? Ask anytime and we'll figure it out together.",
  },
  {
    q: "How do I get started?",
    a: "The quickest way is the print request form on this page — share what you have and I'll follow up. If you'd rather talk it through first, call 501-575-8017 and we'll sort out the next step.",
  },
] as const;

export function PrintingFaq() {
  return (
    <PrintingSection divider={false} className="border-b border-white/[0.06] bg-black/28 pb-[5rem] pt-[4.5rem] md:pb-[7rem] md:pt-[5.5rem]">
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] mx-auto max-w-[48rem] p-7 md:p-9 lg:p-10">
              <PrintingSectionHeader title="FAQ" className="mb-8 max-w-[36rem] md:mb-10" />
              <div className="flex flex-col gap-3 md:gap-3.5">
                {FAQ.map((item, index) => (
                  <RevealOnScroll key={item.q} delayMs={index * 45}>
                    <details className="printing-faq-details group rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-black/40 px-4 py-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:px-5">
                      <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-semibold leading-snug tracking-[-0.015em] text-white [&::-webkit-details-marker]:hidden md:py-[1.15rem]">
                        <span className="flex items-start justify-between gap-4">
                          <span>{item.q}</span>
                          <span className="mt-0.5 shrink-0 text-orange-400/90 transition duration-200 group-open:rotate-45">+</span>
                        </span>
                      </summary>
                      <p className="border-t border-white/[0.08] pb-4 pt-3 text-[0.8125rem] leading-[1.68] text-white/55 md:pb-[1.15rem]">
                        {item.a}
                      </p>
                    </details>
                  </RevealOnScroll>
                ))}
              </div>
              <RevealOnScroll delayMs={FAQ.length * 45}>
                <p className="mt-8 max-w-[40rem] mx-auto text-center text-[0.8125rem] leading-[1.68] text-white/58 md:mt-10 md:text-[0.8375rem]">
                  Not sure where to start? Just send what you have or describe what you need — I&apos;ll help you figure
                  it out.
                </p>
                <div className="mt-5 flex justify-center md:mt-6">
                  <Link
                    href={printingQuoteHref()}
                    className={cn(
                      printingPrimaryCtaClass,
                      "inline-flex min-h-[2.85rem] items-center justify-center px-7 text-[0.9rem] font-semibold",
                    )}
                  >
                    Start a Print Request
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
