"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const STANDARD_TEMPLATE_KEYS = new Set([
  "email_no_website",
  "email_weak_website",
  "email_general",
  "facebook_no_website",
  "facebook_general",
  "phone_opener",
  "contact_form_short",
  "website_visit_note",
]);

function channelLabel(method: string): string {
  switch (method.toLowerCase()) {
    case "email":
      return "Email";
    case "facebook":
      return "Facebook";
    case "phone":
      return "Phone";
    case "contact_form":
      return "Contact form";
    case "website":
      return "Website";
    case "research_later":
      return "Research later";
    default:
      return method || "Outreach";
  }
}

export type LeadSuggestedResponseProps = {
  businessName: string;
  leadId: string;
  /** Path like `/admin/leads/uuid` or slug path — used for compose deep link */
  composeHref: string;
  bestContactMethod: string;
  bestContactValue: string | null;
  email: string | null;
  facebookUrl: string | null;
  phone: string | null;
  suggestedTemplateKey: string | null;
  suggestedResponse: string | null;
};

export function LeadSuggestedResponse({
  businessName,
  leadId,
  composeHref,
  bestContactMethod,
  bestContactValue,
  email,
  facebookUrl,
  phone,
  suggestedTemplateKey,
  suggestedResponse,
}: LeadSuggestedResponseProps) {
  const initial = String(suggestedResponse || "").trim();
  const [draft, setDraft] = useState(initial);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const method = (bestContactMethod || "research_later").toLowerCase();
  const key = String(suggestedTemplateKey || "").trim();
  const dirty = draft.trim() !== initial;
  const showSaveTemplate =
    draft.trim().length > 0 && (dirty || !key || !STANDARD_TEMPLATE_KEYS.has(key));

  const fbHref = useMemo(() => {
    const v = (bestContactValue || facebookUrl || "").trim();
    if (!v) return "";
    return v.startsWith("http") ? v : `https://${v}`;
  }, [bestContactValue, facebookUrl]);

  const copy = useCallback(async () => {
    const t = draft.trim();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      setToast("Copied");
      window.setTimeout(() => setToast(null), 2000);
    } catch {
      setToast("Copy failed");
      window.setTimeout(() => setToast(null), 2500);
    }
  }, [draft]);

  const saveTemplate = useCallback(async () => {
    const body = draft.trim();
    if (!body) return;
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/scout/outreach-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_key: `crm_${leadId.slice(0, 8)}_${Date.now()}`,
          title: `From lead: ${businessName.slice(0, 48)}`,
          channel: method === "research_later" ? "email" : method,
          category: "custom",
          body,
          active: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok === false) {
        setToast(data.error || "Save failed");
      } else {
        setToast("Saved to Scout Brain");
      }
    } catch {
      setToast("Save failed");
    } finally {
      setSaving(false);
      window.setTimeout(() => setToast(null), 3000);
    }
  }, [draft, businessName, leadId, method]);

  if (!initial && !dirty) {
    return null;
  }

  const composeUrl = composeHref.includes("?") ? `${composeHref}&compose=1` : `${composeHref}?compose=1`;

  return (
    <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.08)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
          Suggested response
        </h3>
        <span className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          Channel: {channelLabel(method)}
        </span>
      </div>
      <textarea
        aria-label="Suggested outreach message"
        placeholder="Edit the suggested message before you send…"
        className="w-full min-h-[100px] text-sm rounded-md border px-2 py-1.5 font-sans"
        style={{
          borderColor: "var(--admin-border)",
          background: "rgba(0,0,0,0.2)",
          color: "var(--admin-fg)",
        }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="admin-btn-ghost text-xs" onClick={() => void copy()} disabled={!draft.trim()}>
          Copy
        </button>
        {showSaveTemplate ? (
          <button type="button" className="admin-btn-ghost text-xs" onClick={() => void saveTemplate()} disabled={saving}>
            {saving ? "Saving…" : "Save as template"}
          </button>
        ) : null}
        {method === "email" && (email || "").trim() ? (
          <Link href={composeUrl} className="admin-btn-primary text-xs inline-flex items-center">
            Send email
          </Link>
        ) : null}
        {method === "facebook" && fbHref ? (
          <a href={fbHref} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs inline-flex items-center">
            Open Facebook
          </a>
        ) : null}
        {method === "phone" && (phone || "").trim() ? (
          <a href={`tel:${phone}`} className="admin-btn-ghost text-xs inline-flex items-center">
            Call
          </a>
        ) : null}
      </div>
      {toast ? (
        <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          {toast}
        </p>
      ) : null}
    </div>
  );
}
