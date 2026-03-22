"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function AdminToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg"
      style={{
        background: "rgba(22, 101, 52, 0.95)",
        borderColor: "rgba(34, 197, 94, 0.5)",
        color: "#dcfce7",
      }}
    >
      {message}
    </div>
  );
}

export function LeadEnrichNow({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const run = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/crm/leads/${encodeURIComponent(leadId)}/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as {
        enriched?: boolean;
        updatedFields?: string[];
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setToast(String(data.message || data.error || "Could not enrich this lead."));
        return;
      }
      if (data.enriched && (data.updatedFields?.length ?? 0) > 0) {
        setToast("Lead enriched");
      } else if (data.message === "Enrichment unavailable right now.") {
        setToast("Enrichment unavailable right now.");
      } else if (data.message === "No new contact info found") {
        setToast("No new contact info found");
      } else {
        setToast(String(data.message || "No new contact info found"));
      }
      router.refresh();
    } catch {
      setToast("Enrichment failed. Try again later.");
    } finally {
      setBusy(false);
    }
  }, [leadId, router]);

  return (
    <div className="shrink-0">
      <button
        type="button"
        disabled={busy}
        onClick={() => void run()}
        className="admin-btn-ghost text-xs py-1 px-2"
        style={{ color: "var(--admin-muted)" }}
      >
        {busy ? "Enriching…" : "Enrich now"}
      </button>
      {toast ? <AdminToast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
