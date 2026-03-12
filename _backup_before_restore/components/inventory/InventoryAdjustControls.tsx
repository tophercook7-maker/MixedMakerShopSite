"use client";

import { useState } from "react";

type Props = {
  inventoryId: string;
  currentQuantity: number;
  onUpdated?: () => void;
};

export function InventoryAdjustControls({
  inventoryId,
  currentQuantity,
  onUpdated,
}: Props) {
  const [pending, setPending] = useState(false);
  const [localQty, setLocalQty] = useState<number>(currentQuantity);
  const [customAmount, setCustomAmount] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);

  async function callAdjust(mode: "increment" | "decrement" | "set", amount: number) {
    try {
      setPending(true);
      setError(null);
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId,
          mode,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update inventory");
      }

      setLocalQty(data.item.quantity ?? 0);
      onUpdated && onUpdated();
    } catch (e: any) {
      console.error("adjust error", e);
      setError(e.message || "Error updating inventory");
    } finally {
      setPending(false);
    }
  }

  function parseCustom(): number {
    const v = parseInt(customAmount, 10);
    if (isNaN(v) || v <= 0) return 1;
    return v;
  }

  const disabled = pending;

  return (
    <div className="mt-2 border-t border-green-500/30 pt-2 text-xs text-green-200">
      <div className="flex items-center justify-between mb-2">
        <span className="opacity-80">Current:</span>
        <span className="font-mono text-green-300">{localQty}</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        {/* - / + buttons */}
        <button
          disabled={disabled}
          onClick={() => callAdjust("decrement", 1)}
          className="px-2 py-1 rounded-md border border-green-500/50 bg-black/40 hover:bg-green-500/10 disabled:opacity-50"
        >
          −1
        </button>
        <button
          disabled={disabled}
          onClick={() => callAdjust("increment", 1)}
          className="px-2 py-1 rounded-md border border-green-500/50 bg-black/40 hover:bg-green-500/10 disabled:opacity-50"
        >
          +1
        </button>

        {/* Custom amount input */}
        <input
          type="number"
          min={1}
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="w-16 px-2 py-1 rounded-md bg-black/60 border border-green-500/40 text-green-100 text-xs"
        />

        <button
          disabled={disabled}
          onClick={() => callAdjust("increment", parseCustom())}
          className="px-2 py-1 rounded-md border border-green-500/50 bg-black/40 hover:bg-green-500/10 disabled:opacity-50"
        >
          +N
        </button>
        <button
          disabled={disabled}
          onClick={() => callAdjust("decrement", parseCustom())}
          className="px-2 py-1 rounded-md border border-green-500/50 bg-black/40 hover:bg-green-500/10 disabled:opacity-50"
        >
          −N
        </button>
      </div>

      {/* Set exact quantity */}
      <button
        disabled={disabled}
        onClick={() => callAdjust("set", parseCustom())}
        className="w-full mt-1 px-2 py-1 rounded-md border border-gold/60 bg-black/40 hover:bg-yellow-500/10 text-yellow-200 disabled:opacity-50"
      >
        Set quantity to N
      </button>

      {error && (
        <p className="mt-1 text-red-400 text-[11px]">
          {error}
        </p>
      )}
    </div>
  );
}
