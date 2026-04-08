"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PrintLeadQuickReplies } from "@/components/admin/print-lead-quick-replies";
import {
  PRINT_LEAD_STATUS_OPTIONS,
  printLeadListStatusLabel,
} from "@/lib/print-lead-crm";

type LeadDetail = {
  id: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  notes?: string | null;
  print_attachment_url?: string | null;
  print_estimate_summary?: string | null;
  print_request_summary?: string | null;
  created_at?: string | null;
  last_contacted_at?: string | null;
  last_reply_at?: string | null;
  source_label?: string | null;
  source_url?: string | null;
};

function formatTs(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function PrintLeadWorkspace({ initial }: { initial: LeadDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(String(initial.status || "new"));
  const [notes, setNotes] = useState(String(initial.notes || ""));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      const prev = String(initial.status || "");
      const patch: Record<string, unknown> = { status, notes };
      if (status !== prev && ["contacted", "replied"].includes(status)) {
        patch.last_contacted_at = new Date().toISOString();
      }

      const res = await fetch(`/api/leads/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: unknown; id?: string };
      if (!res.ok) {
        setMessage({
          kind: "err",
          text: typeof data.error === "string" ? data.error : "Could not save changes.",
        });
        return;
      }
      setMessage({ kind: "ok", text: "Saved." });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [initial.id, initial.status, notes, router, status]);

  const markContactedNow = useCallback(async () => {
    setStatus("contacted");
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/leads/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "contacted",
          last_contacted_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: unknown };
        setMessage({
          kind: "err",
          text: typeof data.error === "string" ? data.error : "Could not update.",
        });
        return;
      }
      setMessage({ kind: "ok", text: "Marked contacted." });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [initial.id, router]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 text-sm" style={{ color: "var(--admin-fg)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Source
          </p>
          <p className="mt-1">{initial.source_label || "/3d-printing"}</p>
          {initial.source_url ? (
            initial.source_url.startsWith("http") ? (
              <a href={initial.source_url} className="mt-1 block text-xs text-sky-400 hover:underline" target="_blank" rel="noreferrer">
                {initial.source_url}
              </a>
            ) : (
              <span className="mt-1 block text-xs" style={{ color: "var(--admin-muted)" }}>
                {initial.source_url}
              </span>
            )
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Created
          </p>
          <p className="mt-1">{formatTs(initial.created_at)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Last contacted
          </p>
          <p className="mt-1">{formatTs(initial.last_contacted_at)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Last customer message
          </p>
          <p className="mt-1">{formatTs(initial.last_reply_at)}</p>
        </div>
      </div>

      {(initial.print_request_summary || initial.print_estimate_summary || initial.print_attachment_url) && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{ borderColor: "var(--admin-border)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Request snapshot
          </p>
          {initial.print_request_summary ? (
            <p className="mt-2 whitespace-pre-wrap" style={{ color: "var(--admin-fg)" }}>
              {initial.print_request_summary}
            </p>
          ) : null}
          {initial.print_estimate_summary ? (
            <p className="mt-2 text-xs" style={{ color: "var(--admin-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--admin-fg)" }}>
                Estimate:{" "}
              </span>
              {initial.print_estimate_summary}
            </p>
          ) : null}
          {initial.print_attachment_url ? (
            <a
              href={initial.print_attachment_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-sky-400 hover:underline"
            >
              View upload
            </a>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="print-lead-status"
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--admin-muted)" }}
        >
          Status ({printLeadListStatusLabel(status)})
        </label>
        <select
          id="print-lead-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full max-w-md rounded-lg border px-3 py-2 text-sm"
          aria-label="Lead status"
          style={{
            borderColor: "var(--admin-border)",
            background: "var(--admin-surface)",
            color: "var(--admin-fg)",
          }}
        >
          {PRINT_LEAD_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <PrintLeadQuickReplies
        leadEmail={initial.email}
        onInsert={(text) => {
          setNotes((prev) => {
            const p = String(prev || "").trimEnd();
            const block = String(text || "").trim();
            if (!block) return prev;
            return p ? `${p}\n\n---\n${block}` : block;
          });
        }}
      />

      <div className="space-y-2">
        <label
          htmlFor="print-lead-notes"
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--admin-muted)" }}
        >
          Notes (full thread / details)
        </label>
        <textarea
          id="print-lead-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={12}
          placeholder="Internal notes, paste of form submission, follow-ups…"
          className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
          style={{
            borderColor: "var(--admin-border)",
            background: "var(--admin-surface)",
            color: "var(--admin-fg)",
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="admin-btn-primary h-9 px-4 text-sm"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={() => void markContactedNow()} disabled={saving} className="admin-btn-ghost h-9 px-4 text-sm">
          Mark contacted now
        </button>
        <a href={`/admin/leads/${initial.id}`} className="admin-btn-ghost h-9 px-4 text-sm inline-flex items-center">
          Open full lead workspace
        </a>
      </div>

      {message ? (
        <p className={`text-sm ${message.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>{message.text}</p>
      ) : null}
    </div>
  );
}
