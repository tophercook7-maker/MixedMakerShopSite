"use client";

import { useEffect, useState } from "react";

type LeadWorkspaceActionsProps = {
  leadId: string;
  linkedOpportunityId: string | null;
  initialBusinessName: string;
  initialCategory: string;
  initialIssue: string;
  initialEmail: string | null;
  initialPhone: string | null;
  website: string | null;
  contactPage: string | null;
  caseHref: string | null;
  initialNotes: string[];
  quickFixSummary?: string | null;
  autoGenerate?: boolean;
  autoCompose?: boolean;
};

type TemplateResponse = {
  short_email?: string;
  longer_email?: string;
  follow_up_note?: string;
};

function fallbackDraft(name: string, issue: string) {
  return {
    subject: "quick question about your website",
    body: [
      `Hi ${name || ""},`,
      "",
      `I was looking at your website and noticed: ${issue || "something that might be affecting conversions"}.`,
      "",
      "I grabbed a quick screenshot showing it.",
      "",
      "Would you like me to send it over?",
      "",
      "- Topher",
    ].join("\n"),
  };
}

export function LeadWorkspaceActions({
  leadId,
  linkedOpportunityId,
  initialBusinessName,
  initialCategory,
  initialIssue,
  initialEmail,
  initialPhone,
  website,
  contactPage,
  caseHref,
  initialNotes,
  quickFixSummary = null,
  autoGenerate = false,
  autoCompose = false,
}: LeadWorkspaceActionsProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>(initialNotes);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const hasDraft = subject.trim().length > 0 || body.trim().length > 0;
  const showCompose = autoCompose || hasDraft;

  useEffect(() => {
    if (autoGenerate) {
      void generateDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, leadId]);

  async function generateDraft() {
    console.info("[Action Debug] Generate Email clicked", { leadId });
    setIsGenerating(true);
    setError(null);
    setMessage(null);
    try {
      console.info("[Action Debug] Generate Email request started", { leadId });
      const res = await fetch("/api/scout/outreach/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          linked_opportunity_id: linkedOpportunityId,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as TemplateResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not generate outreach preview.");

      const fallback = fallbackDraft(initialBusinessName, initialIssue);
      const nextSubject = fallback.subject;
      let nextBody =
        String(data.short_email || "").trim() ||
        String(data.longer_email || "").trim() ||
        String(data.follow_up_note || "").trim() ||
        fallback.body;
      if (
        quickFixSummary &&
        !/quick improvement idea|quick fix/i.test(nextBody)
      ) {
        nextBody = `${nextBody}\n\nI put together a quick improvement idea: ${quickFixSummary}`;
      }

      setSubject(nextSubject);
      setBody(nextBody);
      setMessage("Outreach draft generated.");
      console.info("[Action Debug] Generate Email request succeeded", { leadId });
    } catch (e) {
      const fallback = fallbackDraft(initialBusinessName, initialIssue);
      setSubject(fallback.subject);
      setBody(
        quickFixSummary
          ? `${fallback.body}\n\nI put together a quick improvement idea: ${quickFixSummary}`
          : fallback.body
      );
      setError(e instanceof Error ? e.message : "Could not generate outreach draft.");
      console.error("[Action Debug] Generate Email request failed", {
        leadId,
        error: e instanceof Error ? e.message : "unknown",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function sendEmail() {
    console.info("[Action Debug] Send Email clicked", { leadId });
    if (!body.trim()) {
      setError("Draft body is empty.");
      return;
    }
    setIsSending(true);
    setError(null);
    setMessage(null);
    try {
      console.info("[Action Debug] Send Email request started", { leadId });
      const res = await fetch("/api/scout/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          linked_opportunity_id: linkedOpportunityId,
          subject: subject.trim() || "quick question about your website",
          body: body.trim(),
          message_type: "short",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not send outreach email.");
      setMessage("Outreach email sent.");
      console.info("[Action Debug] Send Email request succeeded", { leadId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send outreach email.");
      console.error("[Action Debug] Send Email request failed", {
        leadId,
        error: e instanceof Error ? e.message : "unknown",
      });
    } finally {
      setIsSending(false);
    }
  }

  async function updateLead(payload: Record<string, unknown>, successMessage: string) {
    console.info("[Action Debug] Lead status action clicked", { leadId, payload });
    setIsUpdating(true);
    setError(null);
    setMessage(null);
    try {
      console.info("[Action Debug] Lead status request started", { leadId, payload });
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not update lead.");
      setMessage(successMessage);
      console.info("[Action Debug] Lead status request succeeded", { leadId, payload });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update lead.");
      console.error("[Action Debug] Lead status request failed", {
        leadId,
        payload,
        error: e instanceof Error ? e.message : "unknown",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function copyEmail() {
    if (!body.trim()) {
      setError("Generate a draft first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `Subject: ${subject.trim() || "quick question about your website"}\n\n${body.trim()}`
      );
      setMessage("Email copied to clipboard.");
      setError(null);
    } catch {
      setError("Clipboard copy failed.");
    }
  }

  async function addNote() {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    const merged = [...savedNotes, trimmed].join("\n");
    await updateLead({ notes: merged }, "Note saved.");
    setSavedNotes((prev) => [...prev, trimmed]);
    setNoteDraft("");
  }

  function buildPreviewUrl() {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    params.set("business", initialBusinessName || "Business");
    params.set("category", initialCategory || "service");
    if (initialEmail) params.set("email", initialEmail);
    if (initialPhone) params.set("phone", initialPhone);
    if (website) params.set("website", website);
    const generated = `${window.location.origin}/preview/${encodeURIComponent(leadId)}?${params.toString()}`;
    setPreviewUrl(generated);
    return generated;
  }

  async function copyPreviewUrl() {
    const url = previewUrl || buildPreviewUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Preview URL copied.");
      setError(null);
    } catch {
      setError("Could not copy preview URL.");
    }
  }

  return (
    <aside className="space-y-3 sticky top-4">
      <div className="admin-card space-y-3">
        <h3 className="text-sm font-semibold">Outreach Panel</h3>
        <div className="flex flex-wrap gap-2">
          <button className="admin-btn-primary text-xs" onClick={() => void generateDraft()} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Email"}
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void generateDraft()} disabled={isGenerating}>
            Preview Email
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void copyEmail()}>
            Copy Email
          </button>
          <button className="admin-btn-primary text-xs" onClick={() => void sendEmail()} disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </button>
        </div>
        {showCompose ? (
          <div className="space-y-2">
            <input
              className="admin-input h-9"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
            <textarea
              className="admin-input min-h-[180px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body"
            />
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Generate a draft from dossier intelligence, then edit and send.
          </p>
        )}
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Redesign Concept</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-primary text-xs"
            onClick={() => {
              const url = buildPreviewUrl();
              if (url) window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            Generate Preview
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void copyPreviewUrl()}>
            Copy Preview URL
          </button>
        </div>
        {previewUrl ? (
          <p className="text-xs break-all" style={{ color: "var(--admin-muted)" }}>
            {previewUrl}
          </p>
        ) : (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Generates a shareable redesign concept at <code>/preview/&lt;lead_id&gt;</code>.
          </p>
        )}
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateLead({ status: "contacted" }, "Lead marked contacted.")}
            disabled={isUpdating}
          >
            Mark Contacted
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateLead({ status: "follow_up_due" }, "Follow-up scheduled.")}
            disabled={isUpdating}
          >
            Schedule Follow Up
          </button>
          <button
            className="admin-btn-danger text-xs"
            onClick={() => void updateLead({ status: "do_not_contact" }, "Lead marked do not contact.")}
            disabled={isUpdating}
          >
            Do Not Contact
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {website ? (
            <a href={website} target="_blank" rel="noreferrer" className="admin-btn-ghost">
              Open Website
            </a>
          ) : (
            <span className="admin-btn-ghost opacity-60 cursor-not-allowed">No website found</span>
          )}
          {contactPage ? (
            <a href={contactPage} target="_blank" rel="noreferrer" className="admin-btn-ghost">
              Open Contact Page
            </a>
          ) : (
            <span className="admin-btn-ghost opacity-60 cursor-not-allowed">No contact page</span>
          )}
          {caseHref ? (
            <a
              href={caseHref}
              className="admin-btn-ghost"
              onClick={() => console.info("[Action Debug] Open Case clicked", { leadId, caseHref })}
            >
              Open Case
            </a>
          ) : (
            <span className="admin-btn-ghost opacity-60 cursor-not-allowed">No case yet</span>
          )}
          {initialEmail ? (
            <a href={`mailto:${initialEmail}`} className="admin-btn-ghost">
              Open Email App
            </a>
          ) : null}
        </div>
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Notes</h3>
        <textarea
          className="admin-input min-h-[100px]"
          placeholder="Add note..."
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
        />
        <button className="admin-btn-primary text-xs" onClick={() => void addNote()} disabled={isUpdating}>
          Add Note
        </button>
        {savedNotes.length > 0 ? (
          <ul className="text-xs list-disc pl-5 space-y-1" style={{ color: "var(--admin-muted)" }}>
            {savedNotes.map((note, idx) => (
              <li key={`${note}-${idx}`}>{note}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {message ? (
        <p className="text-xs" style={{ color: "#86efac" }}>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </aside>
  );
}
