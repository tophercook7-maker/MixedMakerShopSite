import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicCaptainMakerHref } from "@/lib/public-brand";
import { mmsBtnSecondaryOnGlass, mmsOnGlassPrimary, mmsOnGlassSecondary } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export function CaptainMakerFreeMockupHelper() {
  return (
    <section className="border-y border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
        <div className="max-w-2xl">
          <p className={cn("text-base font-semibold", mmsOnGlassPrimary)}>Not sure what to write?</p>
          <p className={cn("mt-1 text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
            Ask Captain Maker first, then come back to start your free preview.
          </p>
        </div>
        <Link
          href={publicCaptainMakerHref}
          className={cn(mmsBtnSecondaryOnGlass, "inline-flex w-full shrink-0 justify-center gap-2 no-underline hover:no-underline sm:w-auto")}
        >
          Ask Captain Maker
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
