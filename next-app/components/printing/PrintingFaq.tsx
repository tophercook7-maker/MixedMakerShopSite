import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";

const FAQ = [
  {
    q: "What kinds of things can you print?",
    a: "We focus on useful custom parts, organizers, mounts, replacement pieces, and one-off problem-solving items.",
  },
  {
    q: "Do I need an STL file first?",
    a: "No. If you have one, great. If not, describe what you need and we can review the job.",
  },
  {
    q: "What material do you use?",
    a: "PLA.",
  },
  {
    q: "How do I get started?",
    a: "Submit your request through MixedMakerShop.com with photos, measurements, or a description.",
  },
] as const;

export function PrintingFaq() {
  return (
    <PrintingSection className="border-t border-white/[0.07] bg-black/30 pb-[5.5rem] pt-[4.5rem] md:pb-[7rem] md:pt-[6rem]">
      <div className="mx-auto max-w-[40rem] px-5 sm:px-8">
        <PrintingSectionHeader
          eyebrow="Questions"
          title="FAQ"
          subtitle="Straight answers. Email or call if something is not covered."
          className="mb-10 md:mb-12"
        />
        <div className="space-y-2.5">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition open:border-orange-500/25 open:bg-white/[0.035]"
            >
              <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-semibold leading-snug tracking-[-0.015em] text-white [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="mt-0.5 shrink-0 text-orange-400/90 transition duration-200 group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="border-t border-white/[0.06] pb-4 pt-3 text-[0.8125rem] leading-[1.62] text-white/52">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </PrintingSection>
  );
}
