"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/lib/db-types";

const STATUSES = [
  "new",
  "contacted",
  "follow_up_due",
  "replied",
  "closed_won",
  "closed_lost",
  "do_not_contact",
] as const;
const MESSAGE_TYPES = ["short_email", "long_email", "follow_up"] as const;
type DossierTemplate = {
  short_email?: string | null;
  longer_email?: string | null;
  contact_form_version?: string | null;
  social_dm_version?: string | null;
  follow_up_note?: string | null;
  metadata?: {
    business_name?: string | null;
    owner_name?: string | null;
    lane?: string | null;
    score?: number | null;
    strongest_pitch_angle?: string | null;
  };
};

type Props = {
  lead?: Lead;
  onClose: () => void;
  onSave: (u: Partial<Lead> | Record<string, unknown>) => void;
  onDelete?: () => void;
  onConvertToClient?: (leadId: string) => void;
};

export function LeadForm({ lead, onClose, onSave, onDelete, onConvertToClient }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [mailError, setMailError] = useState<string | null>(null);
  const [mailSuccess, setMailSuccess] = useState<string | null>(null);
  const [sendingType, setSendingType] = useState<(typeof MESSAGE_TYPES)[number] | null>(null);
  const [previewType, setPreviewType] = useState<(typeof MESSAGE_TYPES)[number]>("short_email");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [dossierTemplate, setDossierTemplate] = useState<DossierTemplate | null>(null);
  const [form, setForm] = useState({
    business_name: lead?.business_name ?? "",
    contact_name: lead?.contact_name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    website: lead?.website ?? "",
    industry: lead?.industry ?? "",
    lead_source: lead?.lead_source ?? "",
    status: (lead?.status ?? "new") as (typeof STATUSES)[number],
    notes: lead?.notes ?? "",
    follow_up_date: lead?.follow_up_date ?? "",
  });

  const handleSave = () => {
    setError(null);
    const businessName = form.business_name.trim();
    if (!businessName) {
      setError("Business name is required");
      return;
    }
    const payload = {
      ...form,
      business_name: businessName,
      contact_name: form.contact_name?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      website: form.website?.trim() || undefined,
      industry: form.industry?.trim() || undefined,
      lead_source: form.lead_source?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      follow_up_date: form.follow_up_date?.trim() || undefined,
    };
    onSave(payload);
  };

  const buildTemplate = (messageType: (typeof MESSAGE_TYPES)[number]) => {
    const firstName = (form.contact_name || "").trim().split(" ")[0] || "there";
    const business = form.business_name || "your business";
    const website = form.website?.trim() || "your current website";
    if (messageType === "short_email") {
      return {
        subject: `Quick idea for ${business}`,
        body: `Hi ${firstName},\n\nI looked at ${website} and put together a few quick ideas to help convert more visitors into booked customers.\n\nIf you want, I can send a short audit with 2-3 practical fixes.\n\nBest,\nMixedMakerShop`,
      };
    }
    if (messageType === "long_email") {
      return {
        subject: `${business} - website growth opportunities`,
        body: `Hi ${firstName},\n\nI reviewed ${website} and found a few improvements that could help with conversions and local search performance.\n\nHighlights:\n- clearer CTA placement\n- stronger mobile UX\n- faster path to contact\n\nHappy to send a concise action plan for your team.\n\nBest,\nMixedMakerShop`,
      };
    }
    return {
      subject: `Following up on ${business}`,
      body: `Hi ${firstName},\n\nFollowing up in case my last note got buried. I can share a quick snapshot of what to improve first on ${website} and what to leave for phase two.\n\nIf useful, I can send it over today.\n\nBest,\nMixedMakerShop`,
    };
  };

  useEffect(() => {
    let cancelled = false;
    async function loadDossierTemplate() {
      if (!lead?.id) {
        setDossierTemplate(null);
        return;
      }
      setTemplateLoading(true);
      try {
        const res = await fetch("/api/scout/outreach/template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_id: lead.id, linked_opportunity_id: lead.linked_opportunity_id }),
        });
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setDossierTemplate(null);
          return;
        }
        setDossierTemplate(body as DossierTemplate);
      } catch {
        if (!cancelled) setDossierTemplate(null);
      } finally {
        if (!cancelled) setTemplateLoading(false);
      }
    }
    void loadDossierTemplate();
    return () => {
      cancelled = true;
    };
  }, [lead?.id, lead?.linked_opportunity_id]);

  const fallbackPreview = buildTemplate(previewType);
  const preview = useMemo(() => {
    const candidate =
      previewType === "short_email"
        ? dossierTemplate?.short_email
        : previewType === "long_email"
          ? dossierTemplate?.longer_email
          : dossierTemplate?.follow_up_note;
    return {
      subject: fallbackPreview.subject,
      body: (candidate || "").trim() || fallbackPreview.body,
      source: (candidate || "").trim() ? "dossier" : "fallback",
    };
  }, [previewType, dossierTemplate, fallbackPreview.subject, fallbackPreview.body]);

  const sendOutreach = async (messageType: (typeof MESSAGE_TYPES)[number]) => {
    if (!lead?.id) {
      setMailError("Save the lead first before sending outreach.");
      return;
    }
    setMailError(null);
    setMailSuccess(null);
    if (!form.email?.trim()) {
      setMailError("Recipient email is missing.");
      return;
    }
    if (!preview.body.trim()) {
      setMailError("Email body is empty.");
      return;
    }

    setSendingType(messageType);
    try {
      const resolvedPreview =
        previewType === messageType
          ? preview
          : (() => {
              const fb = buildTemplate(messageType);
              const candidate =
                messageType === "short_email"
                  ? dossierTemplate?.short_email
                  : messageType === "long_email"
                    ? dossierTemplate?.longer_email
                    : dossierTemplate?.follow_up_note;
              return {
                subject: fb.subject,
                body: (candidate || "").trim() || fb.body,
              };
            })();
      const res = await fetch("/api/scout/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          to: form.email.trim(),
          subject: resolvedPreview.subject,
          body: resolvedPreview.body,
          message_type: messageType,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMailError(body?.detail || body?.error || "Outreach email failed.");
        return;
      }
      setMailSuccess("Outreach email sent.");
    } catch (e) {
      setMailError(e instanceof Error ? e.message : "Outreach email failed.");
    } finally {
      setSendingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center admin-modal-backdrop p-4" onClick={onClose}>
      <div className="admin-modal w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>{lead ? "Edit lead" : "Add lead"}</h3>
        {error && <p className="text-sm mb-3" style={{ color: "var(--admin-orange)" }}>{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Business name *</label>
            <input
              value={form.business_name}
              onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Contact name</label>
            <input
              value={form.contact_name}
              onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Industry</label>
            <input
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Lead source</label>
            <input
              value={form.lead_source}
              onChange={(e) => setForm((f) => ({ ...f, lead_source: e.target.value }))}
              placeholder="e.g. contact_form, website_check"
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof STATUSES)[number] }))}
              className="admin-select w-full"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Follow-up date</label>
            <input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))}
              className="admin-input"
            />
          </div>
          {lead && (
            <div className="border rounded-xl p-3" style={{ borderColor: "var(--admin-border)" }}>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--admin-muted)" }}>
                Outreach preview
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {MESSAGE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPreviewType(type)}
                    className={previewType === type ? "admin-btn-primary" : "admin-btn-ghost"}
                  >
                    Preview {type === "short_email" ? "Short Email" : type === "long_email" ? "Long Email" : "Follow-Up"}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Subject
                </div>
                <div className="admin-input text-sm">{preview.subject}</div>
                <div className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Body
                </div>
                <pre className="admin-input text-xs whitespace-pre-wrap">{preview.body}</pre>
                <div className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                  Source: {templateLoading ? "loading dossier..." : preview.source === "dossier" ? "Scout dossier" : "fallback template"}
                </div>
                {dossierTemplate?.metadata && (
                  <div className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                    {[
                      dossierTemplate.metadata.business_name,
                      dossierTemplate.metadata.owner_name ? `Owner: ${dossierTemplate.metadata.owner_name}` : null,
                      dossierTemplate.metadata.lane ? `Lane: ${dossierTemplate.metadata.lane}` : null,
                      dossierTemplate.metadata.score != null ? `Score: ${dossierTemplate.metadata.score}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  disabled={sendingType !== null}
                  onClick={() => void sendOutreach("short_email")}
                  className="admin-btn-ghost"
                >
                  Send Short Email
                </button>
                <button
                  type="button"
                  disabled={sendingType !== null}
                  onClick={() => void sendOutreach("long_email")}
                  className="admin-btn-ghost"
                >
                  Send Long Email
                </button>
                <button
                  type="button"
                  disabled={sendingType !== null}
                  onClick={() => void sendOutreach("follow_up")}
                  className="admin-btn-ghost"
                >
                  Send Follow-Up
                </button>
              </div>
              {mailError && <p className="text-xs mt-2" style={{ color: "var(--admin-orange)" }}>{mailError}</p>}
              {mailSuccess && <p className="text-xs mt-2" style={{ color: "#4ade80" }}>{mailSuccess}</p>}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="admin-input"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-2 flex-wrap">
          <div className="flex gap-2 items-center">
            {lead && onConvertToClient && (
              <button type="button" onClick={() => onConvertToClient(lead.id)} className="admin-btn-primary">
                Convert to client
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={onDelete} className="admin-btn-ghost" style={{ color: "var(--admin-orange)" }}>
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="admin-btn-ghost">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="admin-btn-primary">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
