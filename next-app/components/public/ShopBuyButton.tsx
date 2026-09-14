"use client";

import { useState } from "react";

type Props = {
  slug: string;
  label?: string;
};

export function ShopBuyButton({ slug, label = "Buy it" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Try again in a moment.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not reach checkout. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn gold btn-cta-primary"
        onClick={startCheckout}
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? "Opening checkout…" : label}
      </button>
      {error ? (
        <p className="small" style={{ marginTop: 10, color: "var(--muted)" }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
