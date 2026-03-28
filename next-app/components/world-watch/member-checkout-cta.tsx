"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Show annual checkout when STRIPE_PRICE_ID_YEARLY is set server-side */
  showYearly?: boolean;
  className?: string;
  monthlyLabel?: string;
  annualLabel?: string;
};

export function MemberCheckoutCta({
  showYearly = false,
  className,
  monthlyLabel = "Start Monthly",
  annualLabel = "Choose Annual",
}: Props) {
  const [loading, setLoading] = useState<null | "month" | "year">(null);
  const [error, setError] = useState<string | null>(null);

  async function start(interval: "month" | "year") {
    if (loading) return;
    setLoading(interval);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
      if (!res.ok || !body.url) {
        setError(
          body.error ||
            (body.code === "MISSING_PRICE_ID"
              ? "Membership is not fully configured yet."
              : "We could not open checkout. Please try again in a moment.")
        );
        setLoading(null);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const annualDisabled = !showYearly;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void start("month")}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-500/[0.08] px-4 py-2.5 text-sm font-medium text-teal-100/90 transition hover:border-teal-400/35 hover:bg-teal-500/12 disabled:opacity-45"
        >
          {loading === "month" ? "Opening…" : monthlyLabel}
        </button>
        <button
          type="button"
          disabled={loading !== null || annualDisabled}
          onClick={() => void start("year")}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/14 hover:bg-white/[0.06] disabled:opacity-45"
        >
          {loading === "year" ? "Opening…" : annualLabel}
        </button>
      </div>
      {annualDisabled ? (
        <p className="text-[11px] leading-relaxed text-slate-500">Annual checkout appears when yearly pricing is configured.</p>
      ) : null}
      {error ? (
        <p className="text-xs leading-relaxed text-slate-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
