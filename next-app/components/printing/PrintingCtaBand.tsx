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
    <PrintingSection divider={false} className="border-b-0 pb-[5.5rem] pt-4 md:pb-[7.5rem] md:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-600/[0.09] via-transparent to-emerald-600/[0.07]" />
      <div className="pointer-events-none absolute -left-28 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-orange-500/20 blur-[110px]" />
      <div className={cn("relative", printingContentClass)}>
        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-[1.85rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.09] via-white/[0.03] to-black/50 p-9 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-11 md:p-12 lg:p-16">
            <div
              className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-orange-500/16 blur-3xl"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_0%_100%,rgba(0,255,178,0.05),transparent)]" aria-hidden />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" aria-hidden />
            <div className="relative flex flex-col gap-11 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
                <div className="relative h-[4.75rem] w-[4.75rem] shrink-0">
                  <Image
                    src="/images/m3-logo.png"
                    alt="MixedMakerShop"
                    fill
                    className="object-contain drop-shadow-[0_0_24px_rgba(249,115,22,0.22)]"
                    sizes="76px"
                  />
                </div>
                <div className="max-w-xl lg:max-w-2xl">
                  <h2 className="text-[1.55rem] font-bold leading-[1.18] tracking-[-0.03em] text-white sm:text-[1.85rem] md:text-[2.15rem] lg:text-[2.25rem] [text-shadow:0_2px_40px_rgba(0,0,0,0.35)]">
                    Got a problem? Let&apos;s build the solution.
                  </h2>
                  <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-white/58 md:mt-5 md:text-[1rem]">
                    Send a photo or describe what you need — I&apos;ll take a look and tell you exactly what I&apos;d do.
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:flex-row sm:justify-center lg:w-auto lg:min-w-[19rem] lg:flex-col xl:min-w-[20rem]">
                <Link href="/custom-3d-printing" className={cn(printingPrimaryCtaClass, "w-full text-center")}>
                  Submit a Request
                </Link>
                <a href={PHONE_TEL} className={cn(printingSecondaryCtaClass, "w-full text-center")}>
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
