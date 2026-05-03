"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LeadPriority } from "@/lib/crm/lead-display";

const options: Array<{ value: LeadPriority; label: string }> = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "browsing", label: "Browsing" },
];

export function LeadPriorityEditor({
  leadId,
  initialPriority,
}: {
  leadId: string;
  initialPriority: LeadPriority;
}) {
  const router = useRouter();
  const [value, setValue] = useState<LeadPriority>(initialPriority);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(next: LeadPriority) {
    setValue(next);
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_bucket: options.find((option) => option.value === next)?.label || next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(String(body?.error || "Could not save priority."));
      }
      setMessage("Priority saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save priority.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="block">
      <span className="admin-text-fg mb-1 block text-xs font-semibold">Manual priority</span>
      <select
        className="admin-select w-full text-sm"
        value={value}
        disabled={saving}
        onChange={(event) => void save(event.currentTarget.value as LeadPriority)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {message ? <span className="admin-text-muted mt-1 block text-xs">{message}</span> : null}
    </label>
  );
}
