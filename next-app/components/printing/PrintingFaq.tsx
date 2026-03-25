import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const FAQ = [
  {
    q: "What kinds of things can you print?",
    a: "Useful custom PLA work — holders, mounts, organizers, replacements, and one-off fixes.",
  },
  {
    q: "Do I need an STL file first?",
    a: "No. Send a file if you have one; otherwise photos or a description are enough.",
  },
  {
    q: "What material do you use?",
    a: "PLA only.",
  },
  {
    q: "How do I get started?",
    a: "Submit a request online or call 501-575-8017.",
  },
] as const;

export function PrintingFaq() {
  return (
    <PrintingSection className="border-t border-white/[0.07] bg-black/32 pb-[5.5rem] pt-[4.75rem] md:pb-[8rem] md:pt-[6.5rem]">
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] mx-auto max-w-[52rem] p-8 md:p-10 lg:p-12">
              <PrintingSectionHeader title="FAQ" className="max-w-[40rem]" />
              <div className="mt-10 flex flex-col gap-4 md:mt-12 md:gap-4">
                {FAQ.map((item, index) => (
                  <RevealOnScroll key={item.q} delayMs={index * 55}>
                    <details className="group rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-black/36 px-5 py-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition open:border-orange-500/28 open:bg-white/[0.06]">
                      <summary className="cursor-pointer list-none py-[1.1rem] text-[0.9375rem] font-semibold leading-snug tracking-[-0.015em] text-white [&::-webkit-details-marker]:hidden">
                        <span className="flex items-start justify-between gap-4">
                          <span>{item.q}</span>
                          <span className="mt-0.5 shrink-0 text-orange-400/90 transition duration-200 group-open:rotate-45">+</span>
                        </span>
                      </summary>
                      <p className="border-t border-white/[0.08] pb-[1.1rem] pt-3 text-[0.8125rem] leading-[1.65] text-white/52">{item.a}</p>
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
