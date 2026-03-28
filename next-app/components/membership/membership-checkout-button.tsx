"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MembershipCheckoutButton({
  interval,
  children,
  className,
  disabled = false,
  variant = "primary",
}: {
  interval: "month" | "year";
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
      if (!res.ok || !body.url) {
        setError(body.error || "We could not open checkout.");
        setLoading(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  const base =
    variant === "primary"
      ? "border-teal-400/20 bg-teal-500/[0.08] text-teal-100/90 hover:border-teal-400/35 hover:bg-teal-500/12"
      : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/14 hover:bg-white/[0.06]";

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void onClick()}
        className={cn(
          "inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-45",
          base,
          className
        )}
      >
        {loading ? "Opening…" : children}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-slate-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
