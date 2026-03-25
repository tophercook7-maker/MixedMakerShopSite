import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const FAQ = [
  {
    q: "What kinds of things can you print?",
    a: "Useful PLA: replacements, holders, mounts, organizers, and odd one-offs — not figurines.",
  },
  {
    q: "Do I need an STL file first?",
    a: "No. Send one if you have it; otherwise photos or a clear description are enough.",
  },
  {
    q: "What material do you use?",
    a: "PLA only, printed here.",
  },
  {
    q: "How do I get started?",
    a: "Submit a request online or call 501-575-8017.",
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
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
