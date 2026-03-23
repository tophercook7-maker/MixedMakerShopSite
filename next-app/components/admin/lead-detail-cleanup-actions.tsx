"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CRM_QUEUE_LOW_TAG } from "@/lib/crm/lead-buckets";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";

function normalizeTags(raw: string[] | null | undefined): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => String(t || "").trim()).filter(Boolean);
}

export function LeadDetailCleanupActions({
  leadId,
  initialTags,
  className,
}: {
  leadId: string;
  initialTags: string[] | null | undefined;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!leadId) return null;

  const onDelete = async () => {
    if (!window.confirm("Delete this lead?")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/crm/leads/${encodeURIComponent(leadId)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(String(data.error || "Could not delete."));
        setBusy(false);
        return;
      }
      router.push("/admin/leads?deleted=1");
      router.refresh();
    } catch {
      setError("Could not delete.");
      setBusy(false);
    }
  };

  const onLowPriority = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const base = normalizeTags(initialTags);
    if (base.some((t) => t.toLowerCase() === CRM_QUEUE_LOW_TAG)) {
      setNotice("Already in Low Priority.");
      setBusy(false);
      return;
    }
    const nextTags = [...base, CRM_QUEUE_LOW_TAG];
    const r = await patchLeadApi(leadId, { lead_tags: nextTags });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setNotice("Moved to Low Priority.");
    router.refresh();
  };

  return (
    <div className={className}>
      {error ? (
        <p className="text-xs mb-2" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
          {notice}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
          disabled={busy}
          onClick={() => void onLowPriority()}
        >
          Move to Low Priority
        </button>
        <button
          type="button"
          className="admin-btn-ghost text-sm border border-rose-500/40 text-rose-200 hover:bg-rose-950/30"
          disabled={busy}
          onClick={() => void onDelete()}
        >
          Delete lead
        </button>
      </div>
    </div>
  );
}
