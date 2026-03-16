"use client";

import { useEffect, useState } from "react";

type LeadWorkspaceActionsProps = {
  leadId: string;
  linkedOpportunityId: string | null;
  initialBusinessName: string;
  initialIssue: string;
  initialEmail: string | null;
  website: string | null;
  contactPage: string | null;
  caseHref: string | null;
  initialNotes: string[];
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
  initialIssue,
  initialEmail,
  website,
  contactPage,
  caseHref,
  initialNotes,
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

  const hasDraft = subject.trim().length > 0 || body.trim().length > 0;
  const showCompose = autoCompose || hasDraft;

  useEffect(() => {
    if (autoGenerate) {
      void generateDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, leadId]);

  async function generateDraft() {
    setIsGenerating(true);
    setError(null);
    setMessage(null);
    try {
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
      const nextBody =
        String(data.short_email || "").trim() ||
        String(data.longer_email || "").trim() ||
        String(data.follow_up_note || "").trim() ||
        fallback.body;

      setSubject(nextSubject);
      setBody(nextBody);
      setMessage("Outreach draft generated.");
    } catch (e) {
      const fallback = fallbackDraft(initialBusinessName, initialIssue);
      setSubject(fallback.subject);
      setBody(fallback.body);
      setError(e instanceof Error ? e.message : "Could not generate outreach draft.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function sendEmail() {
    if (!body.trim()) {
      setError("Draft body is empty.");
      return;
    }
    setIsSending(true);
    setError(null);
    setMessage(null);
    try {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send outreach email.");
    } finally {
      setIsSending(false);
    }
  }

  async function updateLead(payload: Record<string, unknown>, successMessage: string) {
    setIsUpdating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not update lead.");
      setMessage(successMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update lead.");
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

  return (
    <aside className="space-y-3 sticky top-4">
      <div className="admin-card space-y-3">
        <h3 className="text-sm font-semibold">Outreach Panel</h3>
        <div className="flex flex-wrap gap-2">
          <button className="admin-btn-primary text-xs" onClick={() => void generateDraft()} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Email"}
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
          ) : null}
          {contactPage ? (
            <a href={contactPage} target="_blank" rel="noreferrer" className="admin-btn-ghost">
              Open Contact Page
            </a>
          ) : null}
          {caseHref ? (
            <a href={caseHref} className="admin-btn-ghost">
              Open Case
            </a>
          ) : null}
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
