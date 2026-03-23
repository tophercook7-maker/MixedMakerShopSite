import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";

const STEPS = [
  {
    n: "1",
    title: "Tell us what you need",
    copy: "Submit your request with photos, measurements, or a quick explanation.",
  },
  {
    n: "2",
    title: "We design and print it",
    copy: "We build a custom PLA solution around your problem.",
  },
  {
    n: "3",
    title: "You put it to work",
    copy: "Get a practical part made for real use.",
  },
] as const;

export function PrintingHow() {
  return (
    <PrintingSection className="bg-gradient-to-b from-black/35 via-transparent to-black/20">
      <div className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <PrintingSectionHeader
          eyebrow="Process"
          title="How it works"
          subtitle="Three steps from your description to a part you can use."
        />
        <div className="relative">
          <div
            className="pointer-events-none absolute left-[8%] right-[8%] top-[1.85rem] hidden h-px bg-gradient-to-r from-transparent via-white/12 to-transparent lg:block"
            aria-hidden
          />
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="relative flex flex-col lg:items-center lg:text-center">
                <span className="relative z-[1] flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 via-orange-500 to-orange-600 text-lg font-bold tabular-nums tracking-tight text-neutral-950 shadow-[0_6px_28px_rgba(249,115,22,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]">
                  {step.n}
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-white lg:max-w-[16rem]">{step.title}</h3>
                <p className="mt-2.5 max-w-sm text-[0.8125rem] leading-[1.62] text-white/52 lg:mx-auto lg:max-w-[17rem]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PrintingSection>
  );
}
