import { publicCardGlassWebClass, publicH2WebClass, publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const steps = [
  { n: "1", text: "You send your business details" },
  { n: "2", text: "I review what you have now" },
  { n: "3", text: "I send you a better direction or mockup by email" },
] as const;

export function WebDesignMockupNextSteps() {
  return (
    <section
      aria-labelledby="web-mockup-next-heading"
      className="home-band home-band--deep border-t border-[rgba(232,253,245,0.06)]"
    >
      <div className={cn(publicShellClass, "py-14 md:py-[4.5rem]")}>
        <h2 id="web-mockup-next-heading" className={cn("home-reveal max-w-[40rem] text-center mx-auto", publicH2WebClass)}>
          What happens when you request a free mockup?
        </h2>

        <div className={cn("home-reveal mt-8 md:mt-10", publicCardGlassWebClass, "p-6 md:p-8 lg:p-10")}>
          <ol className="m-0 list-none space-y-8 p-0 md:grid md:grid-cols-3 md:gap-6 md:space-y-0 lg:gap-8">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4 md:flex-col md:gap-5">
                <div className="flex shrink-0 md:items-center md:justify-center">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,255,178,0.28)] bg-[rgba(0,255,178,0.1)] text-sm font-bold text-[#00FFB2] md:h-11 md:w-11 md:text-base">
                    {step.n}
                  </span>
                </div>
                <p className="min-w-0 pt-0.5 text-[0.9375rem] font-medium leading-snug text-[#E8FDF5] md:pt-0 md:text-center md:text-base">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <p
            className={cn(
              "home-reveal mx-auto mt-8 max-w-[36rem] border-t border-[rgba(0,255,178,0.12)] pt-8 text-center text-sm font-medium leading-relaxed text-[#E8FDF5]/90 md:mt-10 md:pt-9 md:text-[0.9375rem]",
            )}
          >
            No pressure, no complicated process, just a simple first step.
          </p>
        </div>
      </div>
    </section>
  );
}
