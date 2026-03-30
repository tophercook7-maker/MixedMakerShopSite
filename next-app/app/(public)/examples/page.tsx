import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Printer } from "lucide-react";

export const metadata: Metadata = {
  title: "Examples | MixedMakerShop",
  description:
    "Website samples, landing pages, and digital tools by Topher — web design work in one place.",
};

/** 3D printing hub card + upload-print quick link. Off for public web-focused site; `/3d-printing` route unchanged. */
const SHOW_PUBLIC_3D_PRINTING_EXAMPLES = false;

const shell = "max-w-[1100px] mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-24";

export default function ExamplesHubPage() {
  return (
    <div className="home-premium home-premium--textured min-h-[60vh]">
      <div className={`${shell}`}>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#E8FDF5]">Examples</h1>
        <p className="mt-4 max-w-[42rem] text-[#9FB5AD] text-base md:text-lg leading-relaxed">
          Browse web design samples, landing pages, and lightweight digital tools — all built for small businesses.
        </p>

        <div
          className={`mt-12 grid grid-cols-1 gap-6 ${SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? "md:grid-cols-2" : "md:max-w-xl"}`}
        >
          <Link
            href="/web-design#examples"
            className="home-card home-card--glass group flex flex-col rounded-2xl p-8 transition hover:-translate-y-1 border border-[rgba(0,255,178,0.18)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(0,255,178,0.1)] text-[#00FFB2]">
              <Layers className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <h2 className="mt-6 text-xl font-semibold text-[#E8FDF5]">Web design &amp; landing pages</h2>
            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-[#9FB5AD] flex-1">
              Local service sites, focused landing pages, mockups, and lightweight tools.
            </p>
            <span className="mt-6 text-sm font-semibold text-[#00FFB2] group-hover:underline underline-offset-4">
              View web examples →
            </span>
          </Link>

          {SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? (
            <Link
              href="/3d-printing#examples-3d"
              className="home-card home-card--glass group flex flex-col rounded-2xl p-8 transition hover:-translate-y-1 border border-[rgba(255,209,102,0.22)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(255,209,102,0.08)] text-[#FFD166]">
                <Printer className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h2 className="mt-6 text-xl font-semibold text-[#E8FDF5]">3D printing &amp; parts</h2>
              <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-[#9FB5AD] flex-1">
                Functional prints, replacements, prototypes, and custom solves.
              </p>
              <span className="mt-6 text-sm font-semibold text-[#FFD166] group-hover:underline underline-offset-4">
                View 3D examples →
              </span>
            </Link>
          ) : null}
        </div>

        <p className="mt-12 text-sm text-[#9FB5AD]">
          Quick links:{" "}
          <Link href="/website-samples" className="text-[#00FFB2] hover:underline">
            All website samples
          </Link>
          {" · "}
          <Link href="/free-mockup" className="text-[#00FFB2] hover:underline">
            Free mockup
          </Link>
          {SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? (
            <>
              {" · "}
              <Link href="/upload-print" className="text-[#FFD166] hover:underline">
                Upload a print file
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
