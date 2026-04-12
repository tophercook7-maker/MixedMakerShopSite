"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { MockupLeadStatus } from "@/lib/lead-status";

type Props = {
  submissionId: string;
};

const ACTIONS: Array<{ leadStatus: MockupLeadStatus; label: string }> = [
  { leadStatus: "contacted", label: "Mark contacted" },
  { leadStatus: "replied", label: "Mark replied" },
  { leadStatus: "follow_up_needed", label: "Follow up needed" },
  { leadStatus: "closed_won", label: "Closed won" },
  { leadStatus: "closed_lost", label: "Closed lost" },
];

export function MockupPipelineQuickActions({ submissionId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = useCallback(
    async (leadStatus: MockupLeadStatus) => {
      setError(null);
      setBusy(leadStatus);
      try {
        const res = await fetch(`/api/admin/mockup-submissions/${encodeURIComponent(submissionId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadStatus }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(String(data.error || "Could not update status."));
          return;
        }
        router.refresh();
      } catch {
        setError("Network error.");
      } finally {
        setBusy(null);
      }
    },
    [router, submissionId],
  );

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
        Quick status
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.leadStatus}
            type="button"
            disabled={Boolean(busy)}
            onClick={() => void patch(a.leadStatus)}
            className="rounded-md border border-[rgba(201,97,44,0.35)] px-2.5 py-1 text-[11px] font-semibold text-[var(--admin-gold)] hover:bg-[rgba(201,97,44,0.08)] disabled:opacity-40"
          >
            {busy === a.leadStatus ? "Saving…" : a.label}
          </button>
        ))}
      </div>
      {error ? (
        <p className="text-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
