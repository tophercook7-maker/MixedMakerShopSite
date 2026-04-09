"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { buildMockupShareMessages } from "@/lib/crm-mockup";

type MockupApiRow = {
  mockup_slug?: string;
  mockup_url?: string | null;
  mockup_url_resolved?: string | null;
  template_key?: string;
  updated_at?: string;
  raw_payload?: Record<string, unknown> | null;
  /** Full HTML document from admin “Generate HTML” (stored on crm_mockups). */
  generated_html?: string | null;
  html_generated_at?: string | null;
  /** When the preview link was last emailed from admin. */
  sent_at?: string | null;
  last_sent_to?: string | null;
};

function buildPreviewUrl(slug: string): string {
  if (typeof window === "undefined") return `/preview/${encodeURIComponent(slug)}`;
  return `${window.location.origin}/preview/${encodeURIComponent(slug)}`;
}

export function LeadMockupSharePanel({
  leadId,
  businessName,
  leadEmail = "",
}: {
  leadId: string;
  businessName: string;
  /** Lead email from CRM; required to enable Send mockup. */
  leadEmail?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [htmlGenerating, setHtmlGenerating] = useState(false);
  const [mockup, setMockup] = useState<MockupApiRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const resolvedUrl = String(mockup?.mockup_url_resolved || mockup?.mockup_url || "").trim();
  const slug = String(mockup?.mockup_slug || "").trim();
  const shareUrl = resolvedUrl || (slug ? buildPreviewUrl(slug) : "");
  const normalizedShareUrl = shareUrl.replace(/\/mockup\//, "/preview/");
  const leadEmailTrim = String(leadEmail || "").trim();
  const canSendPreview = Boolean(mockup && normalizedShareUrl && slug && leadEmailTrim);
  const sentAt = mockup?.sent_at ? String(mockup.sent_at).trim() : "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/crm-mockup`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as { mockup?: MockupApiRow | null; error?: string };
      if (!res.ok) {
        setError(String(body.error || "Could not load mockup"));
        setMockup(null);
        return;
      }
      setMockup(body.mockup ?? null);
    } catch {
      setError("Network error loading mockup");
      setMockup(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function generateOrRefresh() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/crm-mockup`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { mockup?: MockupApiRow; error?: string };
      if (!res.ok) {
        setError(String(body.error || "Could not generate mockup"));
        return;
      }
      if (body.mockup) setMockup(body.mockup);
      setToast("Mockup ready to share.");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function sendPreviewToLead() {
    if (!canSendPreview) return;
    setSendingEmail(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/crm-mockup/send`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        mockup?: MockupApiRow;
        error?: string;
        reason?: string;
      };
      if (!res.ok || !body.ok) {
        setError(String(body.error || "Could not send email"));
        return;
      }
      if (body.mockup) setMockup((prev) => ({ ...(prev ?? {}), ...body.mockup }));
      setToast("Mockup sent.");
      router.refresh();
    } catch {
      setError("Network error sending email");
    } finally {
      setSendingEmail(false);
    }
  }

  async function generateStaticHtml() {
    setHtmlGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/crm-mockup/generate-html`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        mockup?: MockupApiRow;
        error?: string;
        reason?: string;
      };
      if (!res.ok || !body.ok) {
        setError(String(body.error || "Could not generate HTML"));
        return;
      }
      if (body.mockup) setMockup((prev) => ({ ...(prev ?? {}), ...body.mockup }));
      setToast("Static HTML generated and saved.");
    } catch {
      setError("Network error");
    } finally {
      setHtmlGenerating(false);
    }
  }

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${label} copied`);
    } catch {
      setToast("Copy failed — select and copy manually");
    }
  }

  const share = normalizedShareUrl ? buildMockupShareMessages(normalizedShareUrl) : null;
  const payload = mockup?.raw_payload && typeof mockup.raw_payload === "object" ? mockup.raw_payload : {};
  const adminTitle = typeof payload.admin_title === "string" ? payload.admin_title.trim() : "";
  const shareEmailSubject = typeof payload.share_email_subject === "string" ? payload.share_email_subject.trim() : "";
  const shareEmailBody = typeof payload.share_email_body === "string" ? payload.share_email_body.trim() : "";
  const shareTextCustom = typeof payload.share_text === "string" ? payload.share_text.trim() : "";
  const shareFacebookCustom = typeof payload.share_facebook === "string" ? payload.share_facebook.trim() : "";

  return (
    <div className="admin-card space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Shareable website mockup</h3>
        <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
          Quick preview for {businessName || "this lead"} using a proven layout and their details. Send the link by text,
          email, or Facebook.
        </p>
      </div>

      {error ? (
        <p className="text-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      ) : null}
      {toast ? (
        <p className="text-xs" style={{ color: "var(--admin-gold)" }}>
          {toast}
        </p>
      ) : null}

      {loading ? (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Checking for mockup…
        </p>
      ) : !mockup ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-btn-primary text-xs" disabled={saving} onClick={() => void generateOrRefresh()}>
            {saving ? "Working…" : "Generate mockup"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded border p-2 space-y-2" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-[11px] font-semibold" style={{ color: "var(--admin-fg)" }}>
              Client preview link
            </p>
            <p
              className="text-[11px] break-all font-mono"
              style={{ color: "var(--admin-muted)", wordBreak: "break-word" }}
            >
              {normalizedShareUrl || "—"}
            </p>
            <p className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
              Share this URL — it uses a clean, readable path when possible.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={normalizedShareUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-primary text-xs"
              style={{ opacity: normalizedShareUrl ? 1 : 0.5, pointerEvents: normalizedShareUrl ? "auto" : "none" }}
            >
              Open preview
            </a>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              disabled={!normalizedShareUrl}
              onClick={() => void copyText("Preview link", normalizedShareUrl)}
            >
              Copy link
            </button>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              disabled={!share?.text}
              onClick={() => void copyText("Share message", share?.text || "")}
            >
              Copy message
            </button>
            {normalizedShareUrl && slug ? (
              <>
                {canSendPreview ? (
                  <button
                    type="button"
                    className="admin-btn-primary text-xs"
                    disabled={sendingEmail}
                    onClick={() => void sendPreviewToLead()}
                  >
                    {sendingEmail ? "Sending…" : sentAt ? "Resend mockup" : "Send Mockup"}
                  </button>
                ) : (
                  <span className="text-[11px] self-center" style={{ color: "var(--admin-muted)" }}>
                    Add a lead email to send this preview.
                  </span>
                )}
              </>
            ) : null}
            <button type="button" className="admin-btn-ghost text-xs" disabled={saving} onClick={() => void generateOrRefresh()}>
              {saving ? "Refreshing…" : "Regenerate mockup"}
            </button>
          </div>
          {sentAt ? (
            <p className="text-[11px]" style={{ color: "var(--admin-gold)" }}>
              Mockup sent
              {mockup?.last_sent_to ? ` to ${mockup.last_sent_to}` : ""}
              {` · ${new Date(sentAt).toLocaleString()}`}
            </p>
          ) : null}
          <p className="text-[11px] break-all" style={{ color: "var(--admin-muted)" }}>
            {adminTitle ? (
              <>
                <strong style={{ color: "var(--admin-fg)" }}>{adminTitle}</strong>
                <br />
              </>
            ) : null}
            Template: <strong style={{ color: "var(--admin-fg)" }}>{mockup.template_key || "—"}</strong>
            {mockup.updated_at ? (
              <>
                {" "}
                · Updated {new Date(mockup.updated_at).toLocaleString()}
              </>
            ) : null}
          </p>
          {slug ? (
            <details className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
              <summary className="cursor-pointer select-none" style={{ color: "var(--admin-muted)" }}>
                Internal reference (slug)
              </summary>
              <p className="mt-1 break-all font-mono" style={{ color: "var(--admin-fg)" }}>
                {slug}
              </p>
            </details>
          ) : null}

          {shareEmailSubject && shareEmailBody ? (
            <div className="space-y-2 rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
                Email helper (Melissa / Wise Body Mind Soul)
              </p>
              <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
                Paste subject and body separately. Add the mockup link in your send when you are ready.
              </p>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold" style={{ color: "var(--admin-muted)" }}>
                  Subject
                </p>
                <pre
                  className="text-[11px] whitespace-pre-wrap rounded p-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--admin-border)" }}
                >
                  {shareEmailSubject}
                </pre>
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px]"
                  onClick={() => void copyText("Subject", shareEmailSubject)}
                >
                  Copy subject
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold" style={{ color: "var(--admin-muted)" }}>
                  Body
                </p>
                <pre
                  className="text-[11px] whitespace-pre-wrap rounded p-2 max-h-40 overflow-auto"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--admin-border)" }}
                >
                  {shareEmailBody}
                </pre>
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px]"
                  onClick={() => void copyText("Email body", shareEmailBody)}
                >
                  Copy body
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-2 rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
              Static HTML export
            </p>
            <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
              Produces a standalone HTML document (same content as the shareable preview layout) for reuse outside the app.
              Regenerate after you change the mockup.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="admin-btn-primary text-xs"
                disabled={htmlGenerating}
                onClick={() => void generateStaticHtml()}
              >
                {htmlGenerating ? "Generating…" : "Generate HTML"}
              </button>
              <button
                type="button"
                className="admin-btn-ghost text-xs"
                disabled={!String(mockup?.generated_html || "").trim()}
                onClick={() => void copyText("HTML", String(mockup?.generated_html || ""))}
              >
                Copy HTML
              </button>
            </div>
            {mockup?.html_generated_at ? (
              <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
                Last generated: {new Date(mockup.html_generated_at).toLocaleString()}
              </p>
            ) : null}
            <textarea
              readOnly
              className="w-full text-[11px] font-mono rounded p-2 resize-y min-h-[140px] max-h-[min(50vh,320px)]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--admin-border)",
                color: "var(--admin-fg)",
              }}
              value={String(mockup?.generated_html || "")}
              placeholder="Generate HTML to populate this field. It is also saved on the mockup record."
              spellCheck={false}
            />
          </div>

          {share ? (
            <div className="space-y-2 rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
                Copy-paste outreach {normalizedShareUrl ? "(includes link)" : ""}
              </p>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold" style={{ color: "var(--admin-muted)" }}>
                  Email (with link)
                </p>
                <pre
                  className="text-[11px] whitespace-pre-wrap rounded p-2 max-h-28 overflow-auto"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--admin-border)" }}
                >
                  {share.email}
                </pre>
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px]"
                  onClick={() => void copyText("Email draft", share.email)}
                >
                  Copy email
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold" style={{ color: "var(--admin-muted)" }}>
                  Text
                </p>
                <pre
                  className="text-[11px] whitespace-pre-wrap rounded p-2 max-h-24 overflow-auto"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--admin-border)" }}
                >
                  {shareTextCustom ? `${shareTextCustom}\n${normalizedShareUrl}` : share.text}
                </pre>
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px]"
                  onClick={() =>
                    void copyText("Text draft", shareTextCustom ? `${shareTextCustom}\n${normalizedShareUrl}` : share.text)
                  }
                >
                  Copy text
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold" style={{ color: "var(--admin-muted)" }}>
                  Facebook
                </p>
                <pre
                  className="text-[11px] whitespace-pre-wrap rounded p-2 max-h-28 overflow-auto"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--admin-border)" }}
                >
                  {shareFacebookCustom ? `${shareFacebookCustom}\n${normalizedShareUrl}` : share.facebook}
                </pre>
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px]"
                  onClick={() =>
                    void copyText(
                      "Facebook draft",
                      shareFacebookCustom ? `${shareFacebookCustom}\n${normalizedShareUrl}` : share.facebook,
                    )
                  }
                >
                  Copy Facebook
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
