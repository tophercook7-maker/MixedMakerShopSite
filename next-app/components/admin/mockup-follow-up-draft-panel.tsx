"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  buildMockupFollowUpDraft,
  followUpSmartQuestion,
  type MockupFollowUpDraftInput,
} from "@/lib/mockup-follow-up-draft";

type Props = {
  submissionId: string;
  recipientEmail: string;
  /** JSON-serialized {@link MockupFollowUpDraftInput} so the panel can regenerate client-side. */
  inputJson: string;
};

async function copyText(label: string, text: string): Promise<void> {
  const t = text.trim();
  if (!t) return;
  try {
    await navigator.clipboard.writeText(t);
  } catch {
    window.prompt(`Copy ${label}`, t);
  }
}

export function MockupFollowUpDraftPanel({ submissionId, recipientEmail, inputJson }: Props) {
  const router = useRouter();
  const input = useMemo(() => {
    try {
      return JSON.parse(inputJson) as MockupFollowUpDraftInput;
    } catch {
      return null;
    }
  }, [inputJson]);

  const [variantIndex, setVariantIndex] = useState(0);
  const [gmailStatus, setGmailStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [gmailMessage, setGmailMessage] = useState("");
  const [lastGmailOpenUrl, setLastGmailOpenUrl] = useState<string | null>(null);

  const draft = useMemo(() => {
    if (!input) {
      return {
        subject: "Quick idea for your website",
        emailBody:
          "Hey —\n\nI took a look at your request and I’ve got a good direction in mind for your site.\n\nBefore I build it out further, what’s the biggest job you want the site to do for you first?\n\n– Topher",
        smsBody: undefined as string | undefined,
        angle: "stronger online presence",
      };
    }
    return buildMockupFollowUpDraft(input, { variantIndex });
  }, [input, variantIndex]);

  const smartQuestion = useMemo(() => followUpSmartQuestion(input?.previewSnapshot ?? null), [input]);

  const toEmail = recipientEmail.trim().toLowerCase();
  const canGmail = Boolean(toEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail));

  const onRegenerate = useCallback(() => {
    setVariantIndex((v) => (v + 1) % 6);
    setGmailStatus("idle");
    setGmailMessage("");
    setLastGmailOpenUrl(null);
  }, []);

  const onCopySubject = useCallback(() => {
    void copyText("subject", draft.subject || "");
  }, [draft.subject]);

  const onCopyEmail = useCallback(() => {
    const body = draft.emailBody.trim();
    const sub = (draft.subject || "").trim();
    const combined = sub ? `Subject: ${sub}\n\n${body}` : body;
    void copyText("email draft", combined);
  }, [draft.emailBody, draft.subject]);

  const onCopySms = useCallback(() => {
    const sms = draft.smsBody?.trim();
    if (sms) void copyText("SMS draft", sms);
  }, [draft.smsBody]);

  const onCreateGmailDraft = useCallback(async () => {
    if (!canGmail) return;
    setGmailStatus("loading");
    setGmailMessage("");
    setLastGmailOpenUrl(null);
    try {
      const res = await fetch(
        `/api/admin/mockup-submissions/${encodeURIComponent(submissionId)}/create-gmail-draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantIndex }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        openUrl?: string;
        message?: string;
        fallbackComposeUrl?: string;
        mode?: string;
      };

      if (!res.ok || !data.ok) {
        setGmailStatus("error");
        setGmailMessage(
          String(data.error || "Couldn’t create Gmail draft automatically. You can still copy the draft below."),
        );
        const fallback = typeof data.fallbackComposeUrl === "string" ? data.fallbackComposeUrl : "";
        if (fallback) {
          setLastGmailOpenUrl(fallback);
          window.open(fallback, "_blank", "noopener,noreferrer");
        }
        return;
      }

      setGmailStatus("ok");
      setGmailMessage(String(data.message || "Gmail draft created."));
      const open = typeof data.openUrl === "string" ? data.openUrl : "";
      if (open) {
        setLastGmailOpenUrl(open);
        window.open(open, "_blank", "noopener,noreferrer");
      }
      router.refresh();
    } catch {
      setGmailStatus("error");
      setGmailMessage("Couldn’t create Gmail draft automatically. You can still copy the draft below.");
    }
  }, [canGmail, router, submissionId, variantIndex]);

  if (!input) {
    return (
      <p className="text-sm rounded-lg border border-[rgba(201,97,44,0.2)] p-3 bg-[rgba(0,0,0,0.2)]" style={{ color: "#f87171" }}>
        Could not load follow-up draft inputs.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[rgba(201,97,44,0.25)] p-4 space-y-4" style={{ background: "rgba(0,0,0,0.15)" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Angle
          </p>
          <p className="text-sm mt-1 font-medium" style={{ color: "var(--admin-fg)" }}>
            {draft.angle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            className="rounded-md border border-[rgba(201,97,44,0.35)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-gold)] hover:bg-[rgba(201,97,44,0.08)]"
          >
            Refresh draft
          </button>
        </div>
      </div>

      <div className="rounded-md border border-[rgba(201,97,44,0.15)] p-3 space-y-2" style={{ background: "rgba(0,0,0,0.2)" }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
          Recipient
        </p>
        {canGmail ? (
          <p className="text-sm font-medium" style={{ color: "var(--admin-fg)" }}>
            {toEmail}
          </p>
        ) : (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            No email available for this lead.
          </p>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-wide pt-2" style={{ color: "var(--admin-muted)" }}>
          Smart question (in email)
        </p>
        <p className="text-sm leading-snug" style={{ color: "var(--admin-fg)" }}>
          {smartQuestion}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canGmail || gmailStatus === "loading"}
          onClick={() => void onCreateGmailDraft()}
          className="rounded-md bg-[var(--admin-gold)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-95"
        >
          {gmailStatus === "loading" ? "Creating…" : "Create Gmail draft"}
        </button>
        <a
          className="rounded-md border border-[rgba(201,97,44,0.35)] px-3 py-2 text-xs font-semibold text-[var(--admin-gold)] hover:bg-[rgba(201,97,44,0.08)]"
          href={lastGmailOpenUrl || "https://mail.google.com/mail/u/0/#drafts"}
          target="_blank"
          rel="noreferrer"
        >
          {lastGmailOpenUrl ? "Open in Gmail" : "Open Drafts in Gmail"}
        </a>
      </div>
      {gmailStatus === "ok" ? (
        <p className="text-xs font-medium text-emerald-400/90">{gmailMessage || "Gmail draft created."}</p>
      ) : null}
      {gmailStatus === "error" ? (
        <p className="text-xs font-medium text-amber-300/95">{gmailMessage}</p>
      ) : null}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Subject
          </p>
          <button
            type="button"
            onClick={() => void onCopySubject()}
            className="rounded-md border border-[rgba(201,97,44,0.35)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-gold)] hover:bg-[rgba(201,97,44,0.08)]"
          >
            Copy subject
          </button>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--admin-fg)" }}>
          {draft.subject || "—"}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
            Email draft
          </p>
          <button
            type="button"
            onClick={() => void onCopyEmail()}
            className="rounded-md border border-[rgba(201,97,44,0.35)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-gold)] hover:bg-[rgba(201,97,44,0.08)]"
          >
            Copy email
          </button>
        </div>
        <pre
          className="mt-2 max-h-[360px] overflow-auto rounded-md border border-[rgba(201,97,44,0.15)] p-3 text-xs leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--admin-muted)", background: "rgba(0,0,0,0.25)" }}
        >
          {draft.emailBody}
        </pre>
      </div>

      {draft.smsBody ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              SMS draft
            </p>
            <button
              type="button"
              onClick={() => void onCopySms()}
              className="rounded-md border border-[rgba(201,97,44,0.35)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-gold)] hover:bg-[rgba(201,97,44,0.08)]"
            >
              Copy SMS
            </button>
          </div>
          <pre
            className="mt-2 max-h-[160px] overflow-auto rounded-md border border-[rgba(201,97,44,0.15)] p-3 text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--admin-muted)", background: "rgba(0,0,0,0.25)" }}
          >
            {draft.smsBody}
          </pre>
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          No phone on file — SMS draft hidden.
        </p>
      )}

      <p className="text-[11px] leading-snug" style={{ color: "var(--admin-muted)" }}>
        <strong className="text-[var(--admin-fg)]">Create Gmail draft</strong> uses the same subject/body as above
        (including your current variant). If Gmail API env vars are not set, a prefilled Gmail compose tab opens instead
        (still no auto-send). <strong className="text-[var(--admin-fg)]">Refresh draft</strong> rotates the variant
        locally before you click Gmail.
      </p>
    </div>
  );
}
