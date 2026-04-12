"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MOCKUP_LEAD_STATUSES,
  MOCKUP_LEAD_STATUS_LABELS,
  type MockupLeadStatus,
} from "@/lib/lead-status";

type Props = {
  submissionId: string;
  initialPipelineStatus: MockupLeadStatus;
};

export function MockupSubmissionStatusSelect({ submissionId, initialPipelineStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<MockupLeadStatus>(initialPipelineStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(initialPipelineStatus);
  }, [initialPipelineStatus]);

  async function onChange(next: MockupLeadStatus) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/mockup-submissions/${encodeURIComponent(submissionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStatus: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(String(data.error || "Could not update status."));
        return;
      }
      setStatus(next);
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
        Pipeline status
        <select
          className="form-select mt-1 max-w-xs"
          value={status}
          disabled={busy}
          onChange={(e) => void onChange(e.target.value as MockupLeadStatus)}
        >
          {MOCKUP_LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {MOCKUP_LEAD_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
