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

async function createReplyReminder(leadId: string, businessLabel: string) {
  const start = new Date();
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  await fetch("/api/calendar/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `Reply: ${businessLabel}`,
      event_type: "reminder",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes: "They replied — follow up from your CRM.",
      is_blocking: false,
      lead_id: leadId,
    }),
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
      <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
        Your usual flow: contact them → follow up → win the job or close the file.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="admin-btn-primary text-sm"
          disabled={busy}
          title="Marks that you reached out. Sets a follow-up date if none is set yet."
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
            setToast(next ? "Marked contacted — follow-up date set." : "Marked contacted.");
            void logAutomation(leadId, "mark_contacted", { scheduled_follow_up: Boolean(next) });
          }}
        >
          Mark contacted
        </button>
        <button
          type="button"
          className="admin-btn-primary text-sm"
          disabled={busy}
          title="They replied. Follow-ups pause so nothing sends while you respond."
          onClick={async () => {
            setBusy(true);
            setErr(null);
            const r = await patchLeadApi(leadId, {
              status: "replied",
              is_hot_lead: true,
              automation_paused: true,
              sequence_active: false,
              replied_at: new Date().toISOString(),
            });
            setBusy(false);
            if (!r.ok) {
              setErr(r.error);
              return;
            }
            void createReplyReminder(leadId, businessName || "Lead");
            void logAutomation(leadId, "mark_replied", {});
            setToast("Marked as replied — we added a reminder on your calendar.");
          }}
        >
          Mark replied
        </button>
        <button
          type="button"
          className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
          disabled={busy}
          onClick={() => setShowSchedule((s) => !s)}
        >
          Schedule follow-up
        </button>
        <button
          type="button"
          className="admin-btn-primary text-sm"
          disabled={busy}
          title="Job won — follow-ups stop."
          onClick={() =>
            void run(
              "Marked as won. Nice work!",
              { status: "won", automation_paused: true, sequence_active: false },
              "mark_won"
            )
          }
        >
          Mark won
        </button>
        <button
          type="button"
          className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
          disabled={busy}
          title="Not a fit or they asked to stop — closes the lead and pauses follow-ups."
          onClick={() =>
            void run(
              "Closed. Follow-ups are paused.",
              { status: "lost", automation_paused: true, sequence_active: false },
              "mark_closed"
            )
          }
        >
          Mark closed
        </button>
      </div>

      {showSchedule ? (
        <div
          className="flex flex-wrap items-end gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.15)" }}
        >
          <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--admin-muted)" }}>
            Remind me on
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
              await run("Follow-up scheduled.", {
                next_follow_up_at: iso,
                follow_up_status: "pending",
                status: "contacted",
              }, "schedule_follow_up");
              setShowSchedule(false);
            }}
          >
            Save date
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
