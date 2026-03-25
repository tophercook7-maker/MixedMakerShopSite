import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass, PrintingSection } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const PHONE = "501-575-8017";
const PHONE_TEL = "tel:+15015758017";

export function PrintingCtaBand() {
  return (
    <PrintingSection divider={false} className="border-b-0 pb-[5.5rem] pt-6 md:pb-[8rem] md:pt-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-600/[0.11] via-transparent to-emerald-600/[0.08]" />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full bg-orange-500/25 blur-[120px]" />
      <div className={cn("relative", printingContentClass)}>
        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-[1.9rem] border-2 border-orange-500/25 bg-gradient-to-br from-white/[0.11] via-black/55 to-black/90 p-10 shadow-[0_48px_120px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-12 md:p-14 lg:p-16">
            <div
              className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-500/22 blur-3xl"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_0%_100%,rgba(0,255,178,0.08),transparent)]" aria-hidden />
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden />

            <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
              <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
                <div className="relative h-20 w-20 shrink-0 sm:h-[4.75rem] sm:w-[4.75rem]">
                  <Image
                    src="/images/m3-logo.png"
                    alt="MixedMakerShop"
                    fill
                    className="object-contain drop-shadow-[0_0_28px_rgba(249,115,22,0.35)]"
                    sizes="80px"
                  />
                </div>
                <div className="max-w-2xl lg:max-w-2xl">
                  <h2 className="text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-white sm:text-[2rem] md:text-[2.35rem] [text-shadow:0_4px_48px_rgba(0,0,0,0.45)]">
                    Got a problem? We&apos;ll build the solution.
                  </h2>
                  <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-white/62 md:mt-6 md:text-[1.02rem]">
                    Tell us what you need, share a photo or idea, and submit your request through the site — or call
                    and we&apos;ll talk it through.
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:flex-row sm:justify-center lg:w-auto lg:min-w-[20rem] lg:flex-col">
                <Link href="/custom-3d-printing" className={cn(printingPrimaryCtaClass, "w-full px-10 text-center text-[1rem] font-semibold shadow-[0_6px_36px_rgba(249,115,22,0.45)]")}>
                  Submit a request
                </Link>
                <a
                  href={PHONE_TEL}
                  className={cn(
                    printingSecondaryCtaClass,
                    "w-full border-white/25 bg-white/[0.07] px-10 text-center text-[1rem] font-medium",
                  )}
                >
                  Call {PHONE}
                </a>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
