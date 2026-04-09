"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  leadId: string;
  initialSlug?: string | null;
};

export function ClientSiteDraftPreviewLink({ leadId, initialSlug = null }: Props) {
  const [slug, setSlug] = useState(String(initialSlug || "").trim());
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/site-draft-preview`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as {
        slug?: string | null;
        preview_url?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setToast(String(body.error || "Could not load preview link"));
        return;
      }
      setSlug(String(body.slug || "").trim());
      setPreviewUrl(String(body.preview_url || "").trim());
    } catch {
      setToast("Network error loading preview link");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function ensureSlug() {
    setCreating(true);
    setToast(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/site-draft-preview`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        slug?: string;
        preview_url?: string;
        error?: string;
      };
      if (!res.ok) {
        setToast(String(body.error || "Could not create preview link"));
        return;
      }
      setSlug(String(body.slug || "").trim());
      setPreviewUrl(String(body.preview_url || "").trim());
      setToast("Branded preview link ready.");
    } catch {
      setToast("Network error");
    } finally {
      setCreating(false);
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

  return (
    <div className="rounded border p-3 space-y-2" style={{ borderColor: "var(--admin-border)" }}>
      <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
        Client site draft (branded link)
      </p>
      <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
        Shareable preview uses a clean <code className="text-[10px]">/preview/…</code> path. Create a link once, then copy
        for texts and emails.
      </p>
      {toast ? (
        <p className="text-[11px]" style={{ color: "var(--admin-gold)" }}>
          {toast}
        </p>
      ) : null}
      {loading ? (
        <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          Loading…
        </p>
      ) : previewUrl ? (
        <>
          <p className="text-[11px] break-all font-mono" style={{ color: "var(--admin-muted)", wordBreak: "break-word" }}>
            {previewUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-primary text-xs"
            >
              Open draft preview
            </a>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              onClick={() => void copyText("Preview link", previewUrl)}
            >
              Copy link
            </button>
          </div>
          {slug ? (
            <details className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
              <summary className="cursor-pointer select-none">Internal reference (slug)</summary>
              <p className="mt-1 break-all font-mono" style={{ color: "var(--admin-fg)" }}>
                {slug}
              </p>
            </details>
          ) : null}
        </>
      ) : (
        <button type="button" className="admin-btn-primary text-xs" disabled={creating} onClick={() => void ensureSlug()}>
          {creating ? "Creating…" : "Create branded preview link"}
        </button>
      )}
    </div>
  );
}
