import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { publicCardGlassPrintClass, publicH2PrintClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const steps = [
  { n: "1", text: "Send your file or describe what you need" },
  { n: "2", text: "I review it and reply by email" },
  { n: "3", text: "We figure out the best next step for your print or solution" },
] as const;

export function PrintingRequestNextSteps() {
  return (
    <section
      aria-labelledby="printing-request-next-heading"
      className="border-b border-white/[0.06] bg-[#060b09] py-14 md:py-[4.5rem]"
    >
      <div className={printingContentClass}>
        <RevealOnScroll>
          <h2 id="printing-request-next-heading" className={cn("mx-auto max-w-[40rem] text-center", publicH2PrintClass)}>
            How a print request works
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delayMs={50}>
          <div className={cn("mt-8 md:mt-10", publicCardGlassPrintClass, "p-6 md:p-8 lg:p-10")}>
            <ol className="m-0 list-none space-y-8 p-0 md:grid md:grid-cols-3 md:gap-6 md:space-y-0 lg:gap-8">
              {steps.map((step) => (
                <li key={step.n} className="flex gap-4 md:flex-col md:gap-5">
                  <div className="flex shrink-0 md:items-center md:justify-center">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-orange-400/35 bg-orange-500/[0.12] text-sm font-bold text-orange-200 md:h-11 md:w-11 md:text-base">
                      {step.n}
                    </span>
                  </div>
                  <p className="min-w-0 pt-0.5 text-[0.9375rem] font-medium leading-snug text-white md:pt-0 md:text-center md:text-base">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mx-auto mt-8 max-w-[36rem] border-t border-white/[0.08] pt-8 text-center text-sm font-medium leading-relaxed text-white/88 md:mt-10 md:pt-9 md:text-[0.9375rem]">
              You do not need a perfect file or technical knowledge to get started.
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
