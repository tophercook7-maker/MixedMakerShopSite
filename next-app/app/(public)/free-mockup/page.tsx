import type { Metadata } from "next";
import { FreeMockupFunnelClient } from "@/components/public/free-mockup-funnel-client";
import { FreeMockupSourceBannerFreshCut } from "@/components/public/free-mockup-source-banner";
import { publicShellClass } from "@/lib/public-brand";
import { mmsBtnPrimary, mmsEyebrow, mmsH1, mmsLead, mmsPageBg, mmsSectionY } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/free-mockup";

export const metadata: Metadata = {
  title: "Free Website Preview | MixedMakerShop",
  description:
    "Request a free homepage preview for your business — see a real direction before you commit. Built and reviewed by Topher.",
  alternates: { canonical },
  openGraph: {
    title: "Free website preview | MixedMakerShop",
    description:
      "A custom homepage direction for your business — low pressure, no obligation.",
    url: canonical,
  },
  robots: { index: true, follow: true },
};

const shell = publicShellClass;

function normalizeSourceParam(raw: string | string[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const t = String(v || "").trim().toLowerCase();
  return t.length ? t : undefined;
}

export default async function FreeMockupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const funnelSource = normalizeSourceParam(sp.source);
  const isFreshCutFunnel = funnelSource === "freshcut";

  return (
    <div className={mmsPageBg}>
      <section className="relative overflow-hidden border-b border-slate-200/65 bg-gradient-to-b from-white via-[#faf9f6] to-[#f4f3ef]">
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(234, 88, 12, 0.05), transparent 55%), radial-gradient(ellipse 60% 45% at 90% 20%, rgba(15, 118, 110, 0.04), transparent 50%)",
          }}
          aria-hidden
        />
        <div className={cn(shell, mmsSectionY, "relative z-[1] max-w-3xl")}>
          <p className={mmsEyebrow}>MixedMakerShop · Free preview</p>
          <h1 className={cn(mmsH1, "mt-6 max-w-[18ch] sm:max-w-none")}>Get your free website preview</h1>
          <p className={cn(mmsLead, "mt-7 max-w-2xl")}>
            Tell Topher about your business — you&apos;ll get a real homepage direction to react to, not a generic
            template picker.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#free-mockup-start" className={cn(mmsBtnPrimary, "px-8 no-underline hover:no-underline")}>
              Start the form
            </a>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">
            No pressure. No obligation. Just a real preview of your future site.
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            Built and reviewed by Topher — not a generic template builder.
          </p>
          <div className="mt-10 max-w-md border-t border-slate-200/80 pt-8">
            <p className="text-sm font-semibold text-slate-900">How it works</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              <li>Build your mockup</li>
              <li>Save &amp; send it to Topher</li>
              <li>Topher helps you finish and launch your site</li>
            </ol>
          </div>
        </div>
      </section>
      {isFreshCutFunnel ? <FreeMockupSourceBannerFreshCut /> : null}
      <FreeMockupFunnelClient funnelSource={funnelSource} />
    </div>
  );
}
