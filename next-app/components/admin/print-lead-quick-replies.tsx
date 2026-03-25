"use client";

import { useCallback, useState } from "react";
import { PRINT_REPLY_TEMPLATES, resolvePrintReplyBody } from "@/lib/print-lead-reply-templates";

type Props = {
  /** Append template text to notes (with spacing). */
  onInsert: (text: string) => void;
  /** Customer email for optional mailto: draft */
  leadEmail?: string | null;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function PrintLeadQuickReplies({ onInsert, leadEmail }: Props) {
  const [priceRange, setPriceRange] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const resolvedBody = useCallback(
    (templateId: string) => resolvePrintReplyBody(templateId, templateId === "simple_quote" ? priceRange : null),
    [priceRange],
  );

  const handleCopy = async (templateId: string) => {
    const text = resolvedBody(templateId);
    const ok = await copyText(text);
    setCopiedId(ok ? templateId : null);
    setTimeout(() => setCopiedId((id) => (id === templateId ? null : id)), 2000);
  };

  const mailtoHref = (body: string) => {
    const email = String(leadEmail || "").trim();
    if (!email) return null;
    const q = new URLSearchParams({
      subject: "Re: Your 3D print request",
      body,
    });
    return `mailto:${encodeURIComponent(email)}?${q.toString()}`;
  };

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: "var(--admin-border)", background: "rgba(255,255,255,0.02)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
        Quick replies
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--admin-muted)" }}>
        Copy for email or SMS, or insert into notes. Tone stays consistent — edit after paste if needed.
      </p>

      <ul className="mt-4 space-y-3">
        {PRINT_REPLY_TEMPLATES.map((t) => {
          const body = resolvedBody(t.id);
          const mail = mailtoHref(body);
          return (
            <li
              key={t.id}
              className="rounded-md border p-3 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="font-medium" style={{ color: "var(--admin-fg)" }}>
                  {t.title}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleCopy(t.id)}
                    className="admin-btn-primary h-8 px-2.5 text-xs"
                  >
                    {copiedId === t.id ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onInsert(body)}
                    className="admin-btn-ghost h-8 px-2.5 text-xs"
                  >
                    Insert
                  </button>
                  {mail ? (
                    <a href={mail} className="admin-btn-ghost h-8 px-2.5 text-xs inline-flex items-center">
                      Email draft
                    </a>
                  ) : null}
                </div>
              </div>
              {t.id === "simple_quote" ? (
                <label className="mt-2 flex flex-col gap-1 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <span>Optional price range (replaces $X–$X), e.g. 50–75 or $85–$110</span>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="max-w-xs rounded border px-2 py-1.5 font-mono text-xs"
                    style={{
                      borderColor: "var(--admin-border)",
                      background: "var(--admin-bg)",
                      color: "var(--admin-fg)",
                    }}
                    placeholder="$X–$X"
                    autoComplete="off"
                  />
                </label>
              ) : null}
              <pre
                className="mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap break-words text-xs leading-relaxed opacity-90"
                style={{ color: "var(--admin-muted)" }}
              >
                {body}
              </pre>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
