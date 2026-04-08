"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Lead } from "@/lib/db-types";

const STATUSES = [
  "new",
  "contacted",
  "replied",
  "no_response",
  "not_interested",
  "won",
  "archived",
] as const;
const DOOR_STATUSES = ["not_visited", "planned", "visited", "follow_up", "closed_won", "closed_lost"] as const;
const MESSAGE_TYPES = ["short_email", "long_email", "follow_up"] as const;
const COPY_TYPES = [
  "short_email",
  "long_email",
  "follow_up_1",
  "follow_up_2",
  "contact_form_version",
  "social_dm_version",
] as const;
type DossierTemplate = {
  short_email?: string | null;
  longer_email?: string | null;
  contact_form_version?: string | null;
  social_dm_version?: string | null;
  follow_up_note?: string | null;
  follow_up_1?: string | null;
  follow_up_2?: string | null;
  why_this_lead?: string | null;
  main_issue_observed?: string | null;
  best_opening_angle?: string | null;
  best_offer_to_make?: string | null;
  demo_url?: string | null;
  metadata?: {
    business_name?: string | null;
    owner_name?: string | null;
    category?: string | null;
    lane?: string | null;
    score?: number | null;
    website_score?: number | null;
    audit_issues?: string[] | null;
    review_rating?: number | null;
    review_count?: number | null;
    strongest_pitch_angle?: string | null;
    best_service_to_offer?: string | null;
    demo_url?: string | null;
  };
};

type EmailThread = {
  id: string;
  status?: string | null;
  subject?: string | null;
  last_message_at?: string | null;
};

type EmailMessage = {
  id: string;
  direction?: "outbound" | "inbound" | string | null;
  subject?: string | null;
  body?: string | null;
  created_at?: string | null;
  sent_at?: string | null;
  received_at?: string | null;
  delivery_status?: string | null;
};

type GeneratedOutreachEmail = {
  subject?: string | null;
  body?: string | null;
  issues?: string[] | null;
  screenshot_url?: string | null;
  draft_message_id?: string | null;
  draft_thread_id?: string | null;
};

type Props = {
  lead?: Lead;
  onClose: () => void;
  onSave: (u: Partial<Lead> | Record<string, unknown>) => Promise<boolean | void> | boolean | void;
  onDelete?: () => void;
  onConvertToClient?: (leadId: string) => void;
  initialFocus?: string;
  initialGenerate?: string;
};

function createInitialForm(lead?: Lead) {
  return {
    business_name: lead?.business_name ?? "",
    category: lead?.category ?? "",
    city: lead?.city ?? "",
    address: lead?.address ?? "",
    contact_name: lead?.contact_name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    website: lead?.website ?? "",
    industry: lead?.industry ?? "",
    lead_source: lead?.lead_source ?? (lead ? "" : "manual"),
    status: (lead?.status ?? "new") as (typeof STATUSES)[number],
    notes: lead?.notes ?? "",
    follow_up_date: lead?.follow_up_date ?? "",
    is_manual: Boolean(lead?.is_manual ?? !lead),
    known_owner_name: lead?.known_owner_name ?? "",
    known_context: lead?.known_context ?? "",
    lead_bucket: lead?.lead_bucket ?? "",
    door_status: (lead?.door_status ?? "not_visited") as (typeof DOOR_STATUSES)[number],
  };
}

export function LeadForm({
  lead,
  onClose,
  onSave,
  onDelete,
  onConvertToClient,
  initialFocus,
  initialGenerate,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [mailError, setMailError] = useState<string | null>(null);
  const [mailSuccess, setMailSuccess] = useState<string | null>(null);
  const [sendingType, setSendingType] = useState<(typeof MESSAGE_TYPES)[number] | null>(null);
  const [previewType, setPreviewType] = useState<(typeof MESSAGE_TYPES)[number]>("short_email");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [dossierTemplate, setDossierTemplate] = useState<DossierTemplate | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadData, setThreadData] = useState<{ threads: EmailThread[]; messages: EmailMessage[] } | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedOutreachEmail | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [outreachWorkflow, setOutreachWorkflow] = useState<{
    lastEmailType: (typeof MESSAGE_TYPES)[number] | null;
    sendStatus: "sent" | "failed" | null;
    nextFollowUpAt: string | null;
    lastContactedAt: string | null;
  }>({
    lastEmailType: null,
    sendStatus: null,
    nextFollowUpAt: lead?.next_follow_up_at ?? null,
    lastContactedAt: lead?.last_contacted_at ?? null,
  });
  const [form, setForm] = useState(createInitialForm(lead));
  const outreachSectionRef = useRef<HTMLDivElement | null>(null);
  const autoGenerateRef = useRef(false);

  const handleSave = async () => {
    setError(null);
    const businessName = form.business_name.trim();
    if (!businessName) {
      setError("Business name is required");
      return false;
    }
    const payload = {
      ...form,
      business_name: businessName,
      category: form.category?.trim() || undefined,
      city: form.city?.trim() || undefined,
      address: form.address?.trim() || undefined,
      contact_name: form.contact_name?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      website: form.website?.trim() || undefined,
      industry: form.industry?.trim() || undefined,
      lead_source: form.lead_source?.trim() || (!lead ? "manual" : undefined),
      notes: form.notes?.trim() || undefined,
      follow_up_date: form.follow_up_date?.trim() || undefined,
      known_owner_name: form.known_owner_name?.trim() || undefined,
      known_context: form.known_context?.trim() || undefined,
      lead_bucket: form.lead_bucket?.trim() || undefined,
      door_status: form.is_manual || form.lead_bucket === "door_to_door" ? form.door_status : undefined,
    };
    console.info("[LeadForm] submit payload", payload);
    const saved = await onSave(payload);
    if (saved === false) return false;
    if (!lead) {
      setForm(createInitialForm(undefined));
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    console.info("[LeadForm] submit start", { mode: lead ? "edit" : "add" });
    await handleSave();
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

  useEffect(() => {
    let cancelled = false;
    async function loadThread() {
      if (!lead?.id) {
        setThreadData(null);
        return;
      }
      setThreadLoading(true);
      try {
        const res = await fetch(`/api/scout/outreach/thread/${lead.id}`, {
          method: "GET",
          cache: "no-store",
        });
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setThreadData(null);
          return;
        }
        setThreadData({
          threads: Array.isArray(body?.threads) ? (body.threads as EmailThread[]) : [],
          messages: Array.isArray(body?.messages) ? (body.messages as EmailMessage[]) : [],
        });
      } catch {
        if (!cancelled) setThreadData(null);
      } finally {
        if (!cancelled) setThreadLoading(false);
      }
    }
    void loadThread();
    return () => {
      cancelled = true;
    };
  }, [lead?.id]);

  useEffect(() => {
    if (initialFocus !== "outreach") return;
    outreachSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialFocus, lead?.id]);

  const fallbackPreview = buildTemplate(previewType);
  const followUp1 = (dossierTemplate?.follow_up_1 || dossierTemplate?.follow_up_note || "").trim();
  const followUp2 = (dossierTemplate?.follow_up_2 || "").trim();
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
  const composedPreview = useMemo(() => {
    const generatedSubject = (generatedEmail?.subject || "").trim();
    const generatedBody = (generatedEmail?.body || "").trim();
    if (generatedSubject || generatedBody) {
      return {
        subject: generatedSubject || preview.subject,
        body: generatedBody || preview.body,
        source: "ai-generated",
      };
    }
    return preview;
  }, [generatedEmail?.body, generatedEmail?.subject, preview]);

  useEffect(() => {
    if ((generatedEmail?.subject || "").trim() || (generatedEmail?.body || "").trim()) {
      setDraftSubject((generatedEmail?.subject || "").trim() || preview.subject);
      setDraftBody((generatedEmail?.body || "").trim() || preview.body);
      return;
    }
    setDraftSubject(preview.subject);
    setDraftBody(preview.body);
  }, [generatedEmail?.body, generatedEmail?.subject, preview.body, preview.subject]);

  const copyValue = useMemo(() => {
    return {
      short_email: (dossierTemplate?.short_email || "").trim() || buildTemplate("short_email").body,
      long_email: (dossierTemplate?.longer_email || "").trim() || buildTemplate("long_email").body,
      follow_up_1: followUp1 || buildTemplate("follow_up").body,
      follow_up_2: followUp2 || followUp1 || buildTemplate("follow_up").body,
      contact_form_version:
        (dossierTemplate?.contact_form_version || "").trim() || buildTemplate("short_email").body,
      social_dm_version:
        (dossierTemplate?.social_dm_version || "").trim() || buildTemplate("short_email").body,
    };
  }, [dossierTemplate, followUp1, followUp2]);

  const copyLabel: Record<(typeof COPY_TYPES)[number], string> = {
    short_email: "Copy Short",
    long_email: "Copy Long",
    follow_up_1: "Copy Follow-Up 1",
    follow_up_2: "Copy Follow-Up 2",
    contact_form_version: "Copy Contact Form",
    social_dm_version: "Copy DM",
  };

  const copyPack = async (type: (typeof COPY_TYPES)[number]) => {
    const text = copyValue[type];
    if (!text.trim()) {
      setCopyMessage("Nothing to copy for this field yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`${copyLabel[type]} copied.`);
    } catch {
      setCopyMessage("Copy failed. Please copy manually.");
    }
  };

  const regenerateOutreach = async () => {
    if (!lead?.id) return;
    setRegenerating(true);
    setCopyMessage(null);
    try {
      const res = await fetch("/api/scout/outreach/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: lead.id, linked_opportunity_id: lead.linked_opportunity_id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMailError(body?.detail || body?.error || "Could not regenerate outreach.");
        return;
      }
      setDossierTemplate(body as DossierTemplate);
      setMailSuccess("Personalized outreach regenerated for this business.");
    } catch (e) {
      setMailError(e instanceof Error ? e.message : "Could not regenerate outreach.");
    } finally {
      setRegenerating(false);
    }
  };

  const generateEmail = useCallback(async () => {
    if (!lead?.id) {
      setMailError("Save the lead first before generating outreach.");
      return;
    }
    setGeneratingEmail(true);
    setMailError(null);
    setMailSuccess(null);
    try {
      const res = await fetch("/api/scout/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: lead.id, linked_opportunity_id: lead.linked_opportunity_id }),
      });
      const body = (await res.json().catch(() => ({}))) as GeneratedOutreachEmail & {
        detail?: string;
        error?: string;
      };
      if (!res.ok) {
        setMailError(body?.detail || body?.error || "Could not generate outreach email.");
        return;
      }
      setGeneratedEmail({
        subject: (body.subject || "").trim(),
        body: (body.body || "").trim(),
        issues: Array.isArray(body.issues) ? body.issues.filter(Boolean) : [],
        screenshot_url: body.screenshot_url || null,
        draft_message_id: body.draft_message_id || null,
        draft_thread_id: body.draft_thread_id || null,
      });
      setMailSuccess(
        body.draft_message_id
          ? "Generated personalized outreach and saved draft to timeline."
          : "Generated personalized email from Scout analysis."
      );
    } catch (e) {
      setMailError(e instanceof Error ? e.message : "Could not generate outreach email.");
    } finally {
      setGeneratingEmail(false);
    }
  }, [lead?.id, lead?.linked_opportunity_id]);

  useEffect(() => {
    if (!lead?.id || initialGenerate !== "1" || autoGenerateRef.current) return;
    autoGenerateRef.current = true;
    void generateEmail();
  }, [generateEmail, initialGenerate, lead?.id]);

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
    const sendSubject =
      previewType === messageType ? draftSubject.trim() || composedPreview.subject : composedPreview.subject;
    const sendBody =
      previewType === messageType ? draftBody.trim() || composedPreview.body : composedPreview.body;
    if (!sendBody.trim()) {
      setMailError("Email body is empty.");
      return;
    }

    setSendingType(messageType);
    try {
      const resolvedPreview =
        previewType === messageType
          ? {
              subject: sendSubject,
              body: sendBody,
            }
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
        setOutreachWorkflow((prev) => ({
          ...prev,
          lastEmailType: messageType,
          sendStatus: "failed",
        }));
        setMailError(body?.detail || body?.error || "Outreach email failed.");
        return;
      }
      const updates = (body?.lead_updates ?? {}) as {
        status?: (typeof STATUSES)[number];
        next_follow_up_at?: string;
        last_contacted_at?: string;
      };
      const nextFollowUpAt = updates.next_follow_up_at || null;
      const lastContactedAt = updates.last_contacted_at || new Date().toISOString();
      setOutreachWorkflow({
        lastEmailType: messageType,
        sendStatus: "sent",
        nextFollowUpAt,
        lastContactedAt,
      });
      if (updates.status !== undefined) {
        const resolvedStatus = updates.status;
        setForm((prev) => ({ ...prev, status: resolvedStatus }));
      } else if (form.status === "new") {
        // Backend auto-marks new leads as contacted after a successful send.
        setForm((prev) => ({ ...prev, status: "contacted" }));
      }
      if (nextFollowUpAt) {
        setForm((prev) => ({ ...prev, follow_up_date: nextFollowUpAt.slice(0, 10) }));
      }
      const nextFollowUpLabel = nextFollowUpAt
        ? new Date(nextFollowUpAt).toLocaleDateString()
        : "not scheduled";
      setMailSuccess(`Outreach email sent successfully. Next follow-up: ${nextFollowUpLabel}.`);
      if (lead?.id) {
        const threadRes = await fetch(`/api/scout/outreach/thread/${lead.id}`, {
          method: "GET",
          cache: "no-store",
        });
        const threadBody = await threadRes.json().catch(() => ({}));
        if (threadRes.ok) {
          setThreadData({
            threads: Array.isArray(threadBody?.threads) ? (threadBody.threads as EmailThread[]) : [],
            messages: Array.isArray(threadBody?.messages) ? (threadBody.messages as EmailMessage[]) : [],
          });
        }
      }
    } catch (e) {
      setOutreachWorkflow((prev) => ({
        ...prev,
        lastEmailType: messageType,
        sendStatus: "failed",
      }));
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
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Business name *</label>
            <input
              value={form.business_name}
              onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>City</label>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="admin-input"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
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
          <label className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--admin-muted)" }}>
            <input
              type="checkbox"
              checked={form.is_manual}
              onChange={(e) => setForm((f) => ({ ...f, is_manual: e.target.checked }))}
            />
            Manual lead
          </label>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Known owner name</label>
            <input
              value={form.known_owner_name}
              onChange={(e) => setForm((f) => ({ ...f, known_owner_name: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Known context</label>
            <textarea
              value={form.known_context}
              onChange={(e) => setForm((f) => ({ ...f, known_context: e.target.value }))}
              rows={2}
              className="admin-input"
              placeholder="I know this owner, busy shop, local referral..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Opportunity tier</label>
              <select
                value={form.lead_bucket}
                onChange={(e) => setForm((f) => ({ ...f, lead_bucket: e.target.value }))}
                className="admin-select w-full"
              >
                <option value="">Auto</option>
                <option value="actionable_email">Actionable Email Leads</option>
                <option value="contact_available">Contact Available</option>
                <option value="door_to_door">Door-to-Door</option>
                <option value="low_priority">Low Priority / Skip</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Door status</label>
              <select
                value={form.door_status}
                onChange={(e) => setForm((f) => ({ ...f, door_status: e.target.value as (typeof DOOR_STATUSES)[number] }))}
                className="admin-select w-full"
              >
                {DOOR_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
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
            <div ref={outreachSectionRef} className="border rounded-xl p-3" style={{ borderColor: "var(--admin-border)" }}>
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
                <input
                  className="admin-input text-sm"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                />
                <div className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Body
                </div>
                <textarea
                  className="admin-input text-xs whitespace-pre-wrap min-h-40"
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                />
                <div className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                  Source:{" "}
                  {templateLoading
                    ? "loading dossier..."
                    : composedPreview.source === "ai-generated"
                      ? "Generated from Scout analysis"
                      : preview.source === "dossier"
                        ? "Scout dossier"
                        : "fallback template"}
                </div>
                {Array.isArray(generatedEmail?.issues) && generatedEmail?.issues.length > 0 && (
                  <div className="text-xs space-y-1" style={{ color: "var(--admin-muted-2)" }}>
                    <div><strong>Detected issues:</strong></div>
                    {(generatedEmail?.issues || []).slice(0, 3).map((issue, idx) => (
                      <div key={`${issue}-${idx}`}>• {issue}</div>
                    ))}
                  </div>
                )}
                {(generatedEmail?.screenshot_url || "").trim() && (
                  <div className="space-y-1">
                    <div className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                      Scout screenshot evidence
                    </div>
                    <a
                      href={(generatedEmail?.screenshot_url || "").trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[var(--admin-gold)] hover:underline"
                    >
                      Open screenshot
                    </a>
                    <img
                      src={(generatedEmail?.screenshot_url || "").trim()}
                      alt="Scout website screenshot"
                      className="rounded-lg border w-full max-h-40 object-cover"
                      style={{ borderColor: "var(--admin-border)" }}
                    />
                  </div>
                )}
                {dossierTemplate?.metadata && (
                  <div className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                    {[
                      dossierTemplate.metadata.business_name,
                      dossierTemplate.metadata.owner_name ? `Owner: ${dossierTemplate.metadata.owner_name}` : null,
                      dossierTemplate.metadata.category ? `Category: ${dossierTemplate.metadata.category}` : null,
                      dossierTemplate.metadata.lane ? `Lane: ${dossierTemplate.metadata.lane}` : null,
                      dossierTemplate.metadata.score != null ? `Score: ${dossierTemplate.metadata.score}` : null,
                      dossierTemplate.metadata.review_rating != null
                        ? `Reviews: ${dossierTemplate.metadata.review_rating} (${dossierTemplate.metadata.review_count ?? 0})`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                )}
                <div className="text-xs mt-2 space-y-1" style={{ color: "var(--admin-muted-2)" }}>
                  <div><strong>Why this site is worth pitching:</strong> {dossierTemplate?.why_this_lead || "No website/quality signals identified."}</div>
                  <div><strong>Main issue observed:</strong> {dossierTemplate?.main_issue_observed || "Website opportunity identified."}</div>
                  <div><strong>Best opening angle:</strong> {dossierTemplate?.best_opening_angle || dossierTemplate?.metadata?.strongest_pitch_angle || "Site improvement opportunity."}</div>
                  <div><strong>Best offer to make:</strong> {dossierTemplate?.best_offer_to_make || dossierTemplate?.metadata?.best_service_to_offer || "Targeted web improvement plan."}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {COPY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => void copyPack(type)}
                    className="admin-btn-ghost"
                  >
                    {copyLabel[type]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  disabled={generatingEmail}
                  onClick={() => void generateEmail()}
                  className="admin-btn-primary"
                >
                  {generatingEmail ? "Generating..." : "Generate Outreach"}
                </button>
                <button
                  type="button"
                  disabled={regenerating}
                  onClick={() => void regenerateOutreach()}
                  className="admin-btn-primary"
                >
                  {regenerating ? "Regenerating..." : "Regenerate Outreach"}
                </button>
              </div>
              {copyMessage && <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>{copyMessage}</p>}
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
              {(outreachWorkflow.lastEmailType || outreachWorkflow.nextFollowUpAt || outreachWorkflow.lastContactedAt) && (
                <div className="mt-2 rounded-lg border p-2 text-xs space-y-1" style={{ borderColor: "var(--admin-border)" }}>
                  <div style={{ color: "var(--admin-fg)" }}>
                    Last email type sent:{" "}
                    <strong>
                      {(outreachWorkflow.lastEmailType || "—").replace("_", " ")}
                    </strong>
                  </div>
                  <div style={{ color: "var(--admin-fg)" }}>
                    Send status:{" "}
                    <strong>{outreachWorkflow.sendStatus === "failed" ? "failed to send" : "sent successfully"}</strong>
                  </div>
                  <div style={{ color: "var(--admin-fg)" }}>
                    Next follow-up date:{" "}
                    <strong>
                      {outreachWorkflow.nextFollowUpAt
                        ? new Date(outreachWorkflow.nextFollowUpAt).toLocaleDateString()
                        : "—"}
                    </strong>
                  </div>
                  <div style={{ color: "var(--admin-fg)" }}>
                    Last contacted:{" "}
                    <strong>
                      {outreachWorkflow.lastContactedAt
                        ? new Date(outreachWorkflow.lastContactedAt).toLocaleString()
                        : "—"}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
          {lead && (
            <div className="border rounded-xl p-3" style={{ borderColor: "var(--admin-border)" }}>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--admin-muted)" }}>
                Email thread timeline
              </label>
              {threadLoading ? (
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Loading conversation...
                </p>
              ) : !(threadData?.messages?.length || 0) ? (
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  No tracked thread yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                    Latest reply status: {(threadData?.threads?.[0]?.status || "open").replace("_", " ")}
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {(threadData?.messages || []).map((msg) => (
                    <div key={msg.id} className="rounded-lg border p-2 text-xs" style={{ borderColor: "var(--admin-border)" }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold" style={{ color: "var(--admin-fg)" }}>
                          {msg.direction === "inbound" ? "Inbound reply" : "Outbound"}
                        </span>
                        <span style={{ color: "var(--admin-muted-2)" }}>
                          {msg.received_at || msg.sent_at || msg.created_at
                            ? new Date(msg.received_at || msg.sent_at || msg.created_at || "").toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <div style={{ color: "var(--admin-muted)" }}>{msg.subject || "No subject"}</div>
                      <div className="mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-fg)" }}>
                        {msg.body || ""}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
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
            <button type="submit" className="admin-btn-primary">
              Save
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
