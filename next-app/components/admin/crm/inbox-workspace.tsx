"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import {
  buildInboxSendAction,
  categoryHeadline,
  defaultInboxMessage,
  type InboxFocusItem,
} from "@/lib/crm/inbox-compose";
import { INBOX_QUICK_REPLIES } from "@/lib/crm/inbox-quick-replies";
import type { InboxItem } from "@/lib/crm/inbox-queue";

type Props = {
  items: InboxItem[];
  mockupHrefByLeadId?: Record<string, string>;
};

function enrichItem(item: InboxItem, mockupHrefByLeadId: Record<string, string>): InboxFocusItem {
  if (item.kind !== "lead") return item;
  const mockupHref = mockupHrefByLeadId[item.id] || item.mockupHref;
  return mockupHref ? { ...item, mockupHref } : item;
}

export function InboxWorkspace({ items, mockupHrefByLeadId = {} }: Props) {
  const router = useRouter();
  const queue = useMemo(
    () => items.map((i) => enrichItem(i, mockupHrefByLeadId)),
    [items, mockupHrefByLeadId]
  );

  const [index, setIndex] = useState(0);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const activeQueue = useMemo(
    () => queue.filter((item) => !skipped.has(item.key)),
    [queue, skipped]
  );

  const current = activeQueue[index] ?? null;

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!current) {
      setMessage("");
      return;
    }
    setMessage(defaultInboxMessage(current));
  }, [current?.key]);

  useEffect(() => {
    if (index >= activeQueue.length && activeQueue.length > 0) {
      setIndex(activeQueue.length - 1);
    }
  }, [index, activeQueue.length]);

  const sendAction = useMemo(
    () => (current ? buildInboxSendAction(current, message) : null),
    [current, message]
  );

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => i + 1);
  }, []);

  const skipCurrent = useCallback(() => {
    if (!current) return;
    setSkipped((prev) => new Set(prev).add(current.key));
  }, [current]);

  const markDone = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!current) return;
      if (current.kind === "mockup") {
        if (!opts?.silent) showToast("Next lead");
        goNext();
        return;
      }
      setBusy(true);
      try {
        const channel =
          sendAction?.channel === "text"
            ? "text"
            : sendAction?.channel === "email"
              ? "email"
              : sendAction?.channel === "facebook"
                ? "facebook"
                : undefined;

        if (current.category === "reply") {
          await fetch(`/api/leads/${encodeURIComponent(current.id)}/follow-up-action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "mark_replied" }),
          });
        } else {
          await fetch(`/api/leads/${encodeURIComponent(current.id)}/follow-up-action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "record_outreach",
              ...(channel ? { channel } : {}),
            }),
          });
        }
        if (!opts?.silent) showToast("Next lead");
        goNext();
        router.refresh();
      } catch {
        showToast("Could not save — try again");
      } finally {
        setBusy(false);
      }
    },
    [current, sendAction?.channel, goNext, router, showToast]
  );

  const handleSendAndNext = useCallback(async () => {
    const body = message.trim();
    if (!sendAction) return;

    if (sendAction.copyFirst && body) {
      try {
        await navigator.clipboard.writeText(body);
      } catch {
        /* ignore */
      }
    }

    if (sendAction.channel === "copy") {
      if (body) {
        try {
          await navigator.clipboard.writeText(body);
          showToast("Copied — tap Done when sent");
        } catch {
          showToast("Copy failed");
        }
      }
      return;
    }

    void markDone({ silent: true });
    if (sendAction.href) {
      window.location.href = sendAction.href;
    }
  }, [message, sendAction, markDone, showToast]);

  const remaining = Math.max(0, activeQueue.length - index);
  const isReply = current?.category === "reply";

  if (!current) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <div className="text-5xl" aria-hidden>
          ✓
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--admin-fg)" }}>
          You&apos;re caught up
        </h1>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          No leads need you right now. New replies and mockup requests will show up here automatically.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/admin/scout" className="admin-btn-primary">
            Find businesses
          </Link>
          {skipped.size > 0 ? (
            <button
              type="button"
              className="admin-btn-ghost border border-[var(--admin-border)]"
              onClick={() => {
                setSkipped(new Set());
                setIndex(0);
              }}
            >
              Show skipped ({skipped.size})
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <div className="flex items-center justify-between gap-3 text-xs" style={{ color: "var(--admin-muted)" }}>
        <span>
          <strong style={{ color: "var(--admin-gold)" }}>{remaining}</strong> left
        </span>
        <span>{index + 1} of {activeQueue.length}</span>
      </div>

      <section
        className="admin-card p-6 sm:p-8 space-y-5"
        style={{
          borderColor: isReply ? "rgba(220, 38, 38, 0.5)" : undefined,
          boxShadow: isReply ? "0 0 0 1px rgba(220, 38, 38, 0.2)" : undefined,
        }}
      >
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: isReply ? "#fca5a5" : "var(--admin-gold)" }}>
          {categoryHeadline(current.category, current)}
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "var(--admin-fg)" }}>
          {current.title}
        </h1>

        {current.subtitle ? (
          <p className="text-base" style={{ color: "var(--admin-muted)" }}>
            {current.subtitle}
          </p>
        ) : null}

        {current.preview ? (
          <blockquote
            className="rounded-xl border-l-4 px-4 py-3 text-base leading-relaxed"
            style={{
              borderColor: "#dc2626",
              background: "rgba(127, 29, 29, 0.15)",
              color: "var(--admin-fg)",
            }}
          >
            {current.preview}
          </blockquote>
        ) : null}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Your message
          </label>
          <textarea
            className="admin-input w-full min-h-[140px] text-base leading-relaxed"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Edit before you send…"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {INBOX_QUICK_REPLIES.map((q) => (
            <button
              key={q.id}
              type="button"
              className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:bg-white/5"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
              onClick={() => setMessage(q.message)}
            >
              {q.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            className="admin-btn-primary text-lg font-bold min-h-[56px] w-full"
            onClick={() => void handleSendAndNext()}
            disabled={busy || (!message.trim() && sendAction?.channel === "copy")}
          >
            {sendAction?.channel === "copy"
              ? "Copy message"
              : `${sendAction?.label || "Send"} & next`}
          </button>
          <button
            type="button"
            className="w-full text-sm py-2 opacity-60 hover:opacity-100 transition"
            style={{ color: "var(--admin-muted)" }}
            onClick={() => void markDone()}
            disabled={busy}
          >
            Already sent — skip to next
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <button
            type="button"
            className="opacity-70 hover:opacity-100 underline underline-offset-2"
            style={{ color: "var(--admin-muted)" }}
            onClick={skipCurrent}
          >
            Skip for now
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
              style={{ color: "var(--admin-muted)" }}
              onClick={() => void navigator.clipboard.writeText(message).then(() => showToast("Copied"))}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
            <Link href={current.openHref} className="opacity-70 hover:opacity-100 hover:underline" style={{ color: "var(--admin-muted)" }}>
              Full lead page
            </Link>
            {current.mockupHref ? (
              <Link href={current.mockupHref} className="opacity-70 hover:opacity-100 hover:underline" style={{ color: "var(--admin-muted)" }}>
                Mockup tools
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {activeQueue.length > 1 ? (
        <p className="text-center text-xs" style={{ color: "var(--admin-muted)" }}>
          One lead at a time — tap the big button to send and move on.
        </p>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full border px-4 py-2 text-sm shadow-lg"
          style={{
            borderColor: "rgba(34, 197, 94, 0.5)",
            background: "rgba(22, 101, 52, 0.95)",
            color: "#dcfce7",
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
