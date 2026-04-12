"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { buildFreeMockupPreviewCopy } from "@/lib/free-mockup-preview-copy";
import type { FunnelDesignDirectionId } from "@/lib/funnel-design-directions";
import type { FunnelDesiredOutcomeId } from "@/lib/funnel-desired-outcomes";

export type FreeMockupLivePreviewProps = {
  businessName: string;
  city: string;
  servicesText: string;
  /** Business type / category — used when services list is empty. */
  businessType: string;
  /** What makes you different — feeds trust bullets + subheadline context. */
  description?: string;
  specialOffer?: string;
  designDirection?: FunnelDesignDirectionId | "";
  desiredOutcomes?: FunnelDesiredOutcomeId[];
  /** `?example=freshcut` funnel — moss palette + local-service copy bias. */
  isFreshCutFunnel?: boolean;
  /** When `framed`, sits inside the faux browser chrome (no outer bottom rule). */
  variant?: "page" | "framed";
};

/**
 * Lightweight homepage-style panel that tracks form fields in real time (no snapshot build required).
 */
export function FreeMockupLivePreview({
  businessName,
  city,
  servicesText,
  businessType,
  description = "",
  specialOffer = "",
  designDirection = "",
  desiredOutcomes = [],
  isFreshCutFunnel = false,
  variant = "page",
}: FreeMockupLivePreviewProps) {
  const framed = variant === "framed";

  const copy = useMemo(
    () =>
      buildFreeMockupPreviewCopy({
        businessName,
        businessType,
        city,
        servicesText,
        differentiator: description,
        specialOffer,
        designDirection,
        desiredOutcomes,
        isFreshCutFunnel,
      }),
    [
      businessName,
      businessType,
      city,
      description,
      designDirection,
      desiredOutcomes,
      isFreshCutFunnel,
      servicesText,
      specialOffer,
    ],
  );

  const heroAnimKey = useMemo(
    () =>
      [
        copy.headline,
        copy.subheadline,
        copy.ctaLabel,
        copy.ctaSupport,
        copy.trustBullets.join("|"),
        copy.services.map((s) => `${s.title}:${s.description}`).join("|"),
        isFreshCutFunnel ? "fc" : "std",
      ].join("~"),
    [copy, isFreshCutFunnel],
  );

  const cityLine = city.trim();

  return (
    <div
      className={cn(
        "free-mockup-live-preview-root flex min-h-[320px] flex-col overflow-hidden",
        framed ? "free-mockup-live-preview-root--framed" : "border-b border-black/[0.06]",
        isFreshCutFunnel
          ? "bg-gradient-to-b from-[#f3f7f2] via-white to-[#f6f4ef]"
          : "bg-gradient-to-b from-white via-[#fafafa] to-[#f4f4f5]",
      )}
    >
      {isFreshCutFunnel ? (
        <p className="border-b border-[#3f5a47]/10 bg-[#eef3ee]/95 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4a6358]">
          Example mode: local-service tone (estimates, clarity, trust)
        </p>
      ) : null}

      <header
        key={heroAnimKey}
        className={cn(
          "free-mockup-live-preview-anim px-6 pb-10 pt-7 sm:px-8 sm:pb-11 sm:pt-8",
          isFreshCutFunnel
            ? "bg-gradient-to-br from-[#2a4a32] via-[#2f5538] to-[#1e3a24] text-white"
            : "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white",
        )}
      >
        <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", framed ? "sr-only" : "text-white/55")}>
          Preview
        </p>

        <div className="mt-3 flex items-center gap-3 border-b border-white/10 pb-5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12 text-xs font-bold uppercase tracking-wide text-white/90 ring-1 ring-white/20"
            aria-hidden
          >
            Logo
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">{copy.businessNameLine}</p>
            {cityLine ? (
              <p className="mt-0.5 text-[12px] font-medium text-white/65">Serving {cityLine}</p>
            ) : (
              <p className="mt-0.5 text-[12px] text-white/55">Service area appears here</p>
            )}
          </div>
        </div>

        <h2 className="mt-6 text-[1.45rem] font-bold leading-[1.08] tracking-[-0.035em] sm:text-[1.75rem] md:text-[1.9rem]">
          {copy.headline}
        </h2>
        <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-white/74 sm:text-base">{copy.subheadline}</p>

        <div className="mt-8 space-y-2">
          <span
            className={cn(
              "inline-flex min-h-[2.85rem] w-full max-w-md items-center justify-center rounded-full px-7 text-sm font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto",
              isFreshCutFunnel
                ? "bg-gradient-to-br from-[#c96a28] to-[#8a4b2a] text-[#fffaf5] shadow-black/22"
                : "bg-gradient-to-br from-[#0f766e] to-[#115e59] text-white shadow-black/28",
            )}
          >
            {copy.ctaLabel}
          </span>
          <p className="max-w-xl text-[13px] leading-snug text-white/62">{copy.ctaSupport}</p>
        </div>
      </header>

      <section className="border-b border-slate-200/80 px-6 py-8 sm:px-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-slate-200/80 pb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Services</h3>
          <span className="text-[11px] font-medium text-slate-400">What we offer</span>
        </div>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {copy.services.map((svc, i) => (
            <li
              key={`${svc.title}-${i}`}
              className="group flex min-h-[132px] flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-0.5 sm:min-h-[148px]"
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3f5a47]/75 transition-transform group-hover:scale-110"
                  aria-hidden
                />
                <span className="text-[15px] font-semibold leading-snug tracking-tight text-slate-900">{svc.title}</span>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-600">{svc.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 py-8 sm:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-6 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.35)] sm:px-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{copy.trustTitle}</h3>
          <ul className="mt-4 space-y-3">
            {copy.trustBullets.map((line, i) => (
              <li key={`${i}-${line}`} className="flex gap-3 text-[14px] leading-snug text-slate-700">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400/90" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={cn(
          "mt-auto px-6 pb-8 pt-2 sm:px-8",
          isFreshCutFunnel ? "bg-[#eef3ee]/70" : "bg-slate-100/80",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2 rounded-2xl border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
            isFreshCutFunnel ? "border-[#3f5a47]/15 bg-white/80" : "border-slate-200/80 bg-white/90",
          )}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{copy.ctaLabel}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{copy.ctaSupport}</p>
          </div>
          <span
            className={cn(
              "inline-flex min-h-[2.65rem] items-center justify-center self-start rounded-full px-6 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 sm:self-center",
              isFreshCutFunnel
                ? "bg-[#2f5538] text-white shadow-md shadow-black/10"
                : "bg-slate-900 text-white shadow-md shadow-black/10",
            )}
          >
            {copy.ctaLabel}
          </span>
        </div>
      </section>
    </div>
  );
}
