"use client";

import { useMemo, useState } from "react";

const CHECKLIST_ITEMS = [
  "Reviewed request",
  "Contacted customer",
  "Asked follow-up questions",
  "Sent estimate",
  "Deposit requested",
  "Deposit received",
  "Project scheduled",
  "Project completed",
] as const;

type ChecklistItem = (typeof CHECKLIST_ITEMS)[number];
type ChecklistState = Record<ChecklistItem, boolean>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeChecklist(scoreBreakdown: Record<string, unknown> | null | undefined): ChecklistState {
  const raw = isRecord(scoreBreakdown?.follow_up_checklist) ? scoreBreakdown.follow_up_checklist : {};
  return Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item, raw[item] === true])) as ChecklistState;
}

export function LeadFollowUpChecklist({
  leadId,
  scoreBreakdown,
}: {
  leadId: string;
  scoreBreakdown?: Record<string, unknown> | null;
}) {
  const [checklist, setChecklist] = useState<ChecklistState>(() => normalizeChecklist(scoreBreakdown));
  const [savingItem, setSavingItem] = useState<ChecklistItem | null>(null);
  const [message, setMessage] = useState("");
  const completed = useMemo(() => CHECKLIST_ITEMS.filter((item) => checklist[item]).length, [checklist]);

  async function toggleItem(item: ChecklistItem) {
    const next = { ...checklist, [item]: !checklist[item] };
    setChecklist(next);
    setSavingItem(item);
    setMessage("");
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score_breakdown: {
            ...(scoreBreakdown || {}),
            follow_up_checklist: next,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(String(body?.error || "Could not save checklist."));
      }
      setMessage("Checklist saved.");
    } catch (error) {
      setChecklist(checklist);
      setMessage(error instanceof Error ? error.message : "Could not save checklist.");
    } finally {
      setSavingItem(null);
    }
  }

  return (
    <section className="admin-card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-text-fg text-sm font-semibold">Follow-up checklist</h2>
          <p className="admin-text-muted mt-1 text-xs">
            {completed} of {CHECKLIST_ITEMS.length} steps complete
          </p>
        </div>
        <div className="admin-border-soft rounded-full border px-3 py-1 text-xs font-semibold admin-text-gold">
          {completed} of {CHECKLIST_ITEMS.length} steps complete
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {CHECKLIST_ITEMS.map((item) => (
          <label
            key={item}
            className="admin-border-soft flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm admin-text-muted"
          >
            <input
              type="checkbox"
              checked={checklist[item]}
              disabled={savingItem === item}
              onChange={() => void toggleItem(item)}
            />
            <span className={checklist[item] ? "admin-text-fg" : undefined}>{item}</span>
            {savingItem === item ? <span className="ml-auto text-[11px]">Saving...</span> : null}
          </label>
        ))}
      </div>
      {message ? <p className="admin-text-muted text-xs">{message}</p> : null}
    </section>
  );
}
