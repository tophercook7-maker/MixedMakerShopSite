"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FOLLOW_UP_TEMPLATES, getFollowUpTemplate, templateKeyForNextSend } from "@/lib/crm/follow-up-templates";
import { isFollowUpOverdue } from "@/lib/crm/follow-up-queue";

type Props = {
  leadId: string;
  status: string | null;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  followUpCount: number;
  lastTemplateKey: string | null;
};

async function postAction(leadId: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/follow-up-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  return { ok: res.ok, error: typeof json.error === "string" ? json.error : "Request failed" };
}

export function LeadFollowUpPanel({
  leadId,
  status,
  nextFollowUpAt,
  lastContactedAt,
  followUpCount,
  lastTemplateKey,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const st = String(status || "").toLowerCase();
  const terminal = ["won", "archived", "no_response", "not_interested"].includes(st);
  const isReplied = st === "replied";
  const count = Math.max(0, Math.floor(Number(followUpCount) || 0));
  const overdue = !terminal && !isReplied && isFollowUpOverdue(nextFollowUpAt);
  const pauseOutreachUi = terminal || isReplied;
  const nextKey = templateKeyForNextSend(count);
  const nextTemplate = nextKey ? getFollowUpTemplate(nextKey) : null;

  const run = useCallback(
    async (label: string, payload: Record<string, unknown>) => {
      setBusy(true);
      setErr(null);
      const r = await postAction(leadId, payload);
      setBusy(false);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setToast(label);
      router.refresh();
    },
    [leadId, router]
  );

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied");
    } catch {
      setErr("Could not copy — select text manually.");
    }
  }, []);

  const fullTemplateBlock = useMemo(() => {
    if (!nextTemplate) return "";
    const subj = nextTemplate.subject ? `Subject:\n${nextTemplate.subject}\n\n` : "";
    return `${subj}${nextTemplate.body}`;
  }, [nextTemplate]);

  return (
    <section className="admin-card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
            Follow-up cadence
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
            Manual send: copy a template, send in your inbox, then log the touch. Four touches max → then close as no
            response.
          </p>
        </div>
        {overdue ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-100 bg-amber-500/10">
            Due / overdue
          </span>
        ) : null}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: "var(--admin-muted)" }}>
        <div>
          <dt className="opacity-70">Status</dt>
          <dd className="font-medium text-[var(--admin-fg)]">{st || "—"}</dd>
        </div>
        <div>
          <dt className="opacity-70">Outreach sends logged</dt>
          <dd className="font-medium text-[var(--admin-fg)]">{count} / 4</dd>
        </div>
        <div>
          <dt className="opacity-70">Last contacted</dt>
          <dd className="font-medium text-[var(--admin-fg)]">
            {lastContactedAt ? new Date(lastContactedAt).toLocaleString() : "—"}
          </dd>
        </div>
        <div>
          <dt className="opacity-70">Next follow-up</dt>
          <dd className="font-medium text-[var(--admin-fg)]">
            {nextFollowUpAt ? new Date(nextFollowUpAt).toLocaleString() : "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="opacity-70">Last template used</dt>
          <dd className="font-medium text-[var(--admin-fg)]">{lastTemplateKey || "—"}</dd>
        </div>
      </dl>

      {!pauseOutreachUi ? (
        <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.12)" }}>
          <div className="text-[11px] font-semibold" style={{ color: "var(--admin-fg)" }}>
            Next message to send
          </div>
          {nextTemplate ? (
            <>
              <pre className="text-[11px] whitespace-pre-wrap max-h-48 overflow-auto p-2 rounded bg-black/20 border border-white/5">
                {fullTemplateBlock}
              </pre>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="admin-btn-primary text-xs"
                  disabled={busy}
                  onClick={() => void copyText(fullTemplateBlock)}
                >
                  Copy next message
                </button>
                <button
                  type="button"
                  className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
                  disabled={busy || count >= 4}
                  onClick={() => void run("Outreach logged", { action: "record_outreach" })}
                >
                  I sent this — log outreach
                </button>
              </div>
              {count >= 4 ? (
                <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
                  Cadence complete — close as no response or mark replied.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              No further template — use quick actions below.
            </p>
          )}
        </div>
      ) : null}

      <details className="text-xs" style={{ color: "var(--admin-muted)" }}>
        <summary className="cursor-pointer font-semibold text-[var(--admin-fg)]">All templates (copy)</summary>
        <div className="mt-2 space-y-2">
          {FOLLOW_UP_TEMPLATES.map((t) => (
            <div key={t.key} className="rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex justify-between gap-2">
                <span className="font-medium text-[var(--admin-fg)]">{t.label}</span>
                <button type="button" className="text-[var(--admin-gold)] underline" onClick={() => void copyText(`${t.subject ? `Subject:\n${t.subject}\n\n` : ""}${t.body}`)}>
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </details>

      {!terminal ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn-ghost text-xs border border-emerald-500/35"
            disabled={busy || isReplied}
            onClick={() => void run("Marked replied", { action: "mark_replied" })}
          >
            Mark replied
          </button>
          <button
            type="button"
            className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
            disabled={busy}
            onClick={() => void run("Marked won", { action: "mark_won" })}
          >
            Mark won
          </button>
          <button
            type="button"
            className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
            disabled={busy}
            onClick={() => void run("Marked not interested", { action: "mark_not_interested" })}
          >
            Not interested
          </button>
          <button
            type="button"
            className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
            disabled={busy}
            onClick={() => void run("Archived", { action: "archive" })}
          >
            Archive
          </button>
        </div>
      ) : null}

      {!terminal ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
            disabled={busy}
            onClick={() => void run("Snoozed 1 day", { action: "snooze_1d" })}
          >
            Snooze 1 day
          </button>
          <button
            type="button"
            className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
            disabled={busy}
            onClick={() => void run("Snoozed 3 days", { action: "snooze_3d" })}
          >
            Snooze 3 days
          </button>
          <button
            type="button"
            className="admin-btn-ghost text-xs border border-red-500/30 text-red-100"
            disabled={busy}
            onClick={() => void run("Closed as no response", { action: "close_no_response" })}
          >
            Close as no response
          </button>
        </div>
      ) : null}

      {st === "replied" ? (
        <button
          type="button"
          className="admin-btn-ghost text-xs border border-sky-500/35"
          disabled={busy}
          onClick={() => void run("Cadence resumed", { action: "resume_cadence" })}
        >
          Resume follow-up cadence
        </button>
      ) : null}

      {err ? (
        <p className="text-xs" style={{ color: "#fca5a5" }}>
          {err}
        </p>
      ) : null}
      {toast ? (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          {toast}
        </p>
      ) : null}
    </section>
  );
}
