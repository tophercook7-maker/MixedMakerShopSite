"use client";

import { useCallback, useEffect, useState } from "react";
import { addBusinessDays, addBusinessDaysIso } from "@/lib/crm/business-days";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";

function toLocalDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  leadId: string;
  businessName: string;
  initialNextFollowUpAt: string | null;
};

function AdminToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
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

async function logAutomation(leadId: string, event_type: string, payload: Record<string, unknown> = {}) {
  await fetch("/api/crm/automation-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lead_id: leadId, event_type, payload }),
  }).catch(() => {});
}

export function LeadPrimaryActions({ leadId, businessName, initialNextFollowUpAt }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");

  useEffect(() => {
    const d = addBusinessDays(new Date(), 3);
    d.setHours(9, 0, 0, 0);
    setScheduleValue(toLocalDatetimeValue(d));
  }, [leadId]);

  const run = useCallback(
    async (label: string, patch: Record<string, unknown>, logType?: string) => {
      setBusy(true);
      setErr(null);
      const r = await patchLeadApi(leadId, patch);
      setBusy(false);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setToast(label);
      if (logType) void logAutomation(leadId, logType, {});
    },
    [leadId]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="admin-btn-primary text-sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setErr(null);
            const next =
              initialNextFollowUpAt && String(initialNextFollowUpAt).trim()
                ? undefined
                : addBusinessDaysIso(new Date(), 3);
            const patch: Record<string, unknown> = {
              status: "contacted",
              automation_paused: false,
            };
            if (next) patch.next_follow_up_at = next;
            const r = await patchLeadApi(leadId, patch);
            setBusy(false);
            if (!r.ok) {
              setErr(r.error);
              return;
            }
            setToast(next ? "Contact logged — follow-up set." : "Contact logged.");
            void logAutomation(leadId, "mark_contacted", { scheduled_follow_up: Boolean(next) });
          }}
        >
          Contact
        </button>
        <button
          type="button"
          className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
          disabled={busy}
          onClick={() => setShowSchedule((s) => !s)}
        >
          Follow up
        </button>
        <button
          type="button"
          className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
          disabled={busy}
          onClick={() =>
            void run(
              "Closed.",
              { status: "lost", automation_paused: true, sequence_active: false },
              "mark_closed"
            )
          }
        >
          Close
        </button>
      </div>

      {showSchedule ? (
        <div
          className="flex flex-wrap items-end gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.15)" }}
        >
          <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--admin-muted)" }}>
            Remind me
            <input
              type="datetime-local"
              className="admin-input h-9 text-sm"
              value={scheduleValue}
              onChange={(e) => setScheduleValue(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="admin-btn-primary text-xs"
            disabled={busy}
            onClick={async () => {
              const iso = scheduleValue ? new Date(scheduleValue).toISOString() : addBusinessDaysIso(new Date(), 3);
              await run(
                "Follow-up set.",
                {
                  next_follow_up_at: iso,
                  follow_up_status: "pending",
                  status: "contacted",
                },
                "schedule_follow_up"
              );
              setShowSchedule(false);
            }}
          >
            Save
          </button>
        </div>
      ) : null}

      {err ? (
        <p className="text-xs" style={{ color: "#fca5a5" }}>
          {err}
        </p>
      ) : null}
      {toast ? <AdminToast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
