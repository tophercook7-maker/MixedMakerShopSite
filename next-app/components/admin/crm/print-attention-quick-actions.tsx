"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";

export function PrintAttentionQuickActions({
  leadId,
  leadHref,
  paymentLink,
  compact,
}: {
  leadId: string;
  leadHref: string;
  paymentLink: string | null;
  /** Tighter buttons for dense lists */
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const link = String(paymentLink || "").trim();
  const btn = compact
    ? "text-[10px] px-1.5 py-0.5 rounded border transition-colors disabled:opacity-45"
    : "text-[11px] px-2 py-1 rounded border transition-colors disabled:opacity-45";

  function flash(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  async function patch(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    const res = await patchLeadApi(leadId, { ...body, last_updated_at: new Date().toISOString() });
    setBusy(false);
    if (!res.ok) {
      flash(res.error);
      return;
    }
    flash(okMsg);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1 min-w-[120px]">
      {toast ? (
        <span className="text-[10px] text-emerald-300/95 max-w-[220px] text-right leading-snug">{toast}</span>
      ) : null}
      <div className="flex flex-wrap justify-end gap-1">
        <Link
          href={`/admin/leads?crm_source=3d_printing&print_pay_request=${encodeURIComponent(leadId)}`}
          className={`${btn} border-sky-500/40 text-sky-200 hover:bg-sky-500/15`}
        >
          Pay request
        </Link>
        {link ? (
          <button
            type="button"
            disabled={busy}
            className={`${btn} border-white/14 text-zinc-300 hover:bg-white/[0.06]`}
            onClick={() =>
              void navigator.clipboard.writeText(link).then(() => flash("Copied link"))
            }
          >
            Copy link
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          className={`${btn} border-emerald-500/35 text-emerald-200/90 hover:bg-emerald-500/10`}
          onClick={() => void patch({ payment_status: "partially_paid" }, "Deposit marked paid")}
        >
          Deposit ✓
        </button>
        <button
          type="button"
          disabled={busy}
          className={`${btn} border-violet-500/35 text-violet-200/90 hover:bg-violet-500/10`}
          onClick={() =>
            void patch(
              {
                payment_status: "paid",
                paid_at: new Date().toISOString(),
                payment_method: "manual",
              },
              "Marked fully paid",
            )
          }
        >
          Paid ✓
        </button>
        <Link
          href={leadHref}
          className={`${btn} border-white/12 text-zinc-200 hover:bg-white/[0.05]`}
        >
          Open lead
        </Link>
      </div>
    </div>
  );
}
