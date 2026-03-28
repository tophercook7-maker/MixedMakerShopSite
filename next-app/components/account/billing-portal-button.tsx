"use client";

import { useState } from "react";

export function BillingPortalButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/customer-portal", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setError(body.error || "Could not open billing portal.");
        setLoading(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError("Could not open billing portal.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={loading}
        onClick={() => void openPortal()}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/25 hover:bg-teal-500/10 hover:text-teal-100 disabled:opacity-45"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-slate-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
