"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addBusinessDays, addBusinessDaysIso } from "@/lib/crm/business-days";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { LeadEnrichNow } from "@/components/admin/lead-enrich-now";
import { buildMarkLeadRepliedPatch, buildReplySnippetOnlyPatch } from "@/lib/crm/mark-lead-replied";

function toLocalDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  leadId: string;
  initialNextFollowUpAt: string | null;
  /** When false, show Enrich / Research later / Close instead of Contact / Follow up / Close */
  hasContactPath: boolean;
  /** Pipeline status — used for Mark replied / snippet-only updates */
  leadStatus?: string | null;
  unreadReplyCount?: number | null;
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

export function LeadPrimaryActions({
  leadId,
  initialNextFollowUpAt,
  hasContactPath,
  leadStatus = null,
  unreadReplyCount = null,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");
  const [showReplyField, setShowReplyField] = useState(false);
  const [replySnippet, setReplySnippet] = useState("");

  const normalizedStatus = String(leadStatus || "")
    .trim()
    .toLowerCase();
  const alreadyReplied = normalizedStatus === "replied";
  const terminal = normalizedStatus === "won" || normalizedStatus === "lost";

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

  const markReplied = useCallback(async () => {
    setBusy(true);
    setErr(null);
    const snippet = replySnippet.trim();
    let patch: Record<string, unknown> | null;

    if (alreadyReplied) {
      patch = buildReplySnippetOnlyPatch(snippet);
      if (!patch) {
        setBusy(false);
        setErr("Add a short reply snippet to update, or leave blank.");
        return;
      }
    } else {
      patch = buildMarkLeadRepliedPatch({
        replyPreview: snippet || null,
        alreadyReplied: false,
        currentUnread: unreadReplyCount,
      });
    }

    const r = await patchLeadApi(leadId, patch);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    setToast(alreadyReplied ? "Reply note saved" : "Marked as replied");
    setReplySnippet("");
    setShowReplyField(false);
    void logAutomation(leadId, alreadyReplied ? "reply_snippet_updated" : "mark_replied", {});
    router.refresh();
  }, [leadId, alreadyReplied, replySnippet, unreadReplyCount, router]);

  if (!hasContactPath) {
    return (
      <div className="space-y-3">
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          No email, phone, Facebook, or contact page yet — enrich or park for research.
        </p>
        <div className="flex flex-wrap gap-2">
          <LeadEnrichNow leadId={leadId} variant="primary" />
          <button
            type="button"
            className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
            disabled={busy}
            onClick={() =>
              void run(
                "Saved for later.",
                {
                  recommended_next_action: "Research later",
                  next_follow_up_at: addBusinessDaysIso(new Date(), 14),
                  automation_paused: true,
                },
                "research_later_snooze"
              )
            }
          >
            Research later
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
        {err ? (
          <p className="text-xs" style={{ color: "#fca5a5" }}>
            {err}
          </p>
        ) : null}
        {toast ? <AdminToast message={toast} onDone={() => setToast(null)} /> : null}
      </div>
    );
  }

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
        {!terminal ? (
          <button
            type="button"
            className="admin-btn-ghost text-sm border border-emerald-500/40 text-emerald-100"
            disabled={busy}
            onClick={() => void markReplied()}
          >
            {alreadyReplied ? "Update reply note" : "Mark replied"}
          </button>
        ) : null}
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

      {!terminal ? (
        <div className="space-y-2">
          <button
            type="button"
            className="text-[11px] underline underline-offset-2 opacity-80 hover:opacity-100"
            style={{ color: "var(--admin-muted)" }}
            onClick={() => setShowReplyField((s) => !s)}
          >
            {showReplyField ? "Hide" : "Paste their reply (optional)"}
          </button>
          {showReplyField ? (
            <textarea
              className="admin-input w-full min-h-[72px] text-xs"
              placeholder="Paste what they said — saved as a short preview on the lead."
              value={replySnippet}
              onChange={(e) => setReplySnippet(e.target.value)}
              maxLength={600}
            />
          ) : null}
        </div>
      ) : null}

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
