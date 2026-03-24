"use client";

import { useCallback, useEffect, useState } from "react";
import { buildMockupShareMessages } from "@/lib/crm-mockup";

type MockupApiRow = {
  mockup_slug?: string;
  mockup_url?: string | null;
  mockup_url_resolved?: string | null;
  template_key?: string;
  updated_at?: string;
  raw_payload?: Record<string, unknown> | null;
};

function buildPreviewUrl(slug: string): string {
  if (typeof window === "undefined") return `/mockup/${encodeURIComponent(slug)}`;
  return `${window.location.origin}/mockup/${encodeURIComponent(slug)}`;
}

export function LeadMockupSharePanel({
  leadId,
  businessName,
}: {
  leadId: string;
  businessName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mockup, setMockup] = useState<MockupApiRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const resolvedUrl = String(mockup?.mockup_url_resolved || mockup?.mockup_url || "").trim();
  const slug = String(mockup?.mockup_slug || "").trim();
  const shareUrl = resolvedUrl || (slug ? buildPreviewUrl(slug) : "");

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

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${label} copied`);
    } catch {
      setToast("Copy failed — select and copy manually");
    }
  }

  const share = shareUrl ? buildMockupShareMessages(shareUrl) : null;
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
          <div className="flex flex-wrap gap-2">
            <a
              href={shareUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-primary text-xs"
              style={{ opacity: shareUrl ? 1 : 0.5, pointerEvents: shareUrl ? "auto" : "none" }}
            >
              Open mockup
            </a>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              disabled={!shareUrl}
              onClick={() => void copyText("Link", shareUrl)}
            >
              Copy mockup link
            </button>
            <button type="button" className="admin-btn-ghost text-xs" disabled={saving} onClick={() => void generateOrRefresh()}>
              {saving ? "Refreshing…" : "Regenerate mockup"}
            </button>
          </div>
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

          {share ? (
            <div className="space-y-2 rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
                Copy-paste outreach {shareUrl ? "(includes link)" : ""}
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
                  {shareTextCustom ? `${shareTextCustom}\n${shareUrl}` : share.text}
                </pre>
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px]"
                  onClick={() =>
                    void copyText("Text draft", shareTextCustom ? `${shareTextCustom}\n${shareUrl}` : share.text)
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
                  {shareFacebookCustom ? `${shareFacebookCustom}\n${shareUrl}` : share.facebook}
                </pre>
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px]"
                  onClick={() =>
                    void copyText(
                      "Facebook draft",
                      shareFacebookCustom ? `${shareFacebookCustom}\n${shareUrl}` : share.facebook,
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
