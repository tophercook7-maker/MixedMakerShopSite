import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass, PrintingSection } from "@/components/printing/printing-section";

const PHONE = "501-575-8017";
const PHONE_TEL = "tel:+15015758017";

export function PrintingCtaBand() {
  return (
    <PrintingSection divider={false} className="border-b-0 pb-[5rem] pt-0 md:pb-[6.5rem]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-600/[0.12] via-transparent to-emerald-600/[0.08]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-orange-500/25 blur-[100px]" />
      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-black/50 p-8 shadow-[0_32px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10 md:p-12">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="relative h-[4.5rem] w-[4.5rem] shrink-0">
                <Image
                  src="/images/m3-logo.png"
                  alt="MixedMakerShop"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                  sizes="72px"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-400/90">Ready when you are</p>
                <h2 className="mt-2 max-w-xl text-[1.5rem] font-bold leading-[1.2] tracking-[-0.03em] text-white sm:text-[1.75rem] md:text-[2rem]">
                  Got a problem? We&apos;ll build the solution.
                </h2>
                <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-white/55">
                  Tell us what you need, share a photo or idea, and submit your request through the site — or call and
                  we will talk it through.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:flex-row sm:justify-center lg:w-auto lg:min-w-[17rem] lg:flex-col xl:min-w-[19rem]">
              <Link href="/custom-3d-printing" className={cn(printingPrimaryCtaClass, "w-full text-center")}>
                Submit a request
              </Link>
              <a href={PHONE_TEL} className={cn(printingSecondaryCtaClass, "w-full text-center")}>
                Call {PHONE}
              </a>
            </div>
          </div>
        </div>
      </div>
    </PrintingSection>
  );
}
