import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Printer } from "lucide-react";
import { publicShellClass } from "@/lib/public-brand";
import { mmsBtnPrimary, mmsBtnSecondary, mmsCard, mmsEyebrow, mmsH1, mmsPageBg, mmsSectionY } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Real Websites Built by Topher | Examples | MixedMakerShop",
  description:
    "Explore real web design samples, 3D printing paths, landing pages, and tools — MixedMakerShop work by Topher in one place.",
};

/** 3D printing hub card + upload-print quick link. */
const SHOW_PUBLIC_3D_PRINTING_EXAMPLES = true;

const shell = publicShellClass;

export default function ExamplesHubPage() {
  return (
    <div className={cn(mmsPageBg, "min-h-[60vh]")}>
      <section className="relative overflow-hidden border-b border-slate-200/65 bg-gradient-to-b from-white via-[#faf9f6] to-[#f4f3ef]">
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 18% 0%, rgba(234, 88, 12, 0.055), transparent 52%), radial-gradient(ellipse 55% 45% at 92% 18%, rgba(15, 118, 110, 0.05), transparent 48%)",
          }}
          aria-hidden
        />
        <div className={cn(shell, mmsSectionY, "relative z-[1] max-w-3xl")}>
          <p className={mmsEyebrow}>MixedMakerShop · by Topher</p>
          <h1 className={cn(mmsH1, "mt-5 max-w-[22ch] sm:max-w-none")}>Real websites built by Topher</h1>
          <p className="mt-7 max-w-[42rem] text-base leading-relaxed text-slate-600 md:text-lg">
            Browse real web design samples, the 3D printing service path, landing pages, and lightweight tools — all in one
            place.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200/50 bg-[#f4f3ef]/90">
        <div className={cn(shell, mmsSectionY)}>
          <h2 className="text-lg font-bold text-slate-900 md:text-xl">Explore by category</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-[15px]">
            Same umbrella brand: web design first, 3D printing when you need physical solves.
          </p>
          <div
            className={cn(
              "mt-10 grid grid-cols-1 gap-8",
              SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? "md:grid-cols-2 md:gap-10" : "md:max-w-xl",
            )}
          >
            <Link
              href="/web-design#browse-by-type"
              className={cn(
                mmsCard,
                "group flex flex-col p-9 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-10",
              )}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-sm">
                <Layers className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-8 text-xl font-bold text-slate-900 md:text-2xl">Web design &amp; landing pages</h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                Local service sites, focused landing pages, mockups, and lightweight tools by Topher.
              </p>
              <span className="mt-8 text-sm font-semibold text-amber-900 underline-offset-4 group-hover:underline">
                View web examples →
              </span>
            </Link>

            {SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? (
              <Link
                href="/3d-printing#examples-3d"
                className={cn(
                  mmsCard,
                  "group flex flex-col p-9 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-10",
                )}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 shadow-sm">
                  <Printer className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-8 text-xl font-bold text-slate-900 md:text-2xl">3D printing &amp; parts</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                  Functional prints, replacements, prototypes, and custom solves from Topher&apos;s Bambu Lab setup.
                </p>
                <span className="mt-8 text-sm font-semibold text-amber-900 underline-offset-4 group-hover:underline">
                  View 3D examples →
                </span>
              </Link>
            ) : null}
          </div>

          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/website-samples" className={cn(mmsBtnSecondary, "justify-center px-7 no-underline hover:no-underline")}>
              All website samples
            </Link>
            <Link href="/free-mockup" className={cn(mmsBtnPrimary, "justify-center px-7 no-underline hover:no-underline")}>
              Get a free mockup
            </Link>
            {SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? (
              <Link href="/upload-print" className={cn(mmsBtnSecondary, "justify-center px-7 no-underline hover:no-underline")}>
                Upload a print file
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
