"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
] as const;

type Props = {
  submissionId: string;
  initialStatus: string;
};

export function MockupSubmissionStatusSelect({ submissionId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/mockup-submissions/${encodeURIComponent(submissionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
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
        Status
        <select
          className="form-select mt-1 max-w-xs"
          value={status}
          disabled={busy}
          onChange={(e) => void onChange(e.target.value)}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
