import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const HERO =
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80";

export const metadata: Metadata = {
  title: "Sample: Instant Quote & Estimator Style Tools | MixedMakerShop",
  description:
    "How local businesses use simple quote flows and calculators on their website — a concept sample from MixedMakerShop web design.",
};

export default function QuoteCalculatorSamplePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%),linear-gradient(180deg,#07111f_0%,#08131c_100%)] px-4 py-16 text-white md:px-8">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/85">Web design sample</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Instant quote &amp; estimator-style tools
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          This page describes a type of <strong className="text-slate-200">simple business tool</strong> we build — not a
          standalone live calculator hosted here. Many local service sites use a short flow (questions + rough price
          range) so visitors get a fast answer and you get a qualified lead.
        </p>

        <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
          <Image src={HERO} alt="Desk with laptop and estimating notes — conceptual" fill className="object-cover" sizes="100vw" priority />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07111f]/90 via-transparent to-transparent" />
        </div>

        <div className="mt-10 space-y-4 text-slate-300">
          <p className="leading-relaxed">
            If you want something like this for your business, we scope it like any other website or landing page:
            your services, your pricing logic, and a clean experience on mobile.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-base">
            <li>
              See live website &amp; landing examples on{" "}
              <Link href="/web-design#browse-by-type" className="font-medium text-emerald-300 underline-offset-2 hover:underline">
                Web Design → Examples
              </Link>
              .
            </li>
            <li>
              Try the{" "}
              <Link href="/free-website-check" className="font-medium text-emerald-300 underline-offset-2 hover:underline">
                free website check
              </Link>{" "}
              or{" "}
              <Link href="/free-mockup" className="font-medium text-emerald-300 underline-offset-2 hover:underline">
                mockup funnel
              </Link>{" "}
              for a concrete first direction.
            </li>
            <li>
              Ready to talk through a custom tool?{" "}
              <Link href="/contact" className="font-medium text-emerald-300 underline-offset-2 hover:underline">
                Contact
              </Link>
              .
            </li>
          </ul>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/web-design" className="text-slate-400 underline-offset-2 hover:text-slate-300 hover:underline">
            ← Back to Web Design
          </Link>
        </p>
      </article>
    </div>
  );
}
