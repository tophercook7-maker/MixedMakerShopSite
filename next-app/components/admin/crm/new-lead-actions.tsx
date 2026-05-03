"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type NewLeadAction = "contacted" | "estimate_sent" | "archived" | "note";

type Props = {
  leadId: string;
  initialStatus: string;
  initialDealStatus?: string | null;
  initialNotes: string;
};

function clampNotes(value: string): string {
  return value.length > 5000 ? value.slice(value.length - 5000) : value;
}

function appendInternalNote(existingNotes: string, note: string, label = "Internal note"): string {
  const cleanNote = note.trim();
  if (!cleanNote) return existingNotes;
  const block = [`--- ${label} (${new Date().toISOString()}) ---`, cleanNote].join("\n");
  return clampNotes([existingNotes.trim(), block].filter(Boolean).join("\n\n"));
}

export function NewLeadActions({ leadId, initialStatus, initialDealStatus, initialNotes }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus || "new");
  const [dealStatus, setDealStatus] = useState(initialDealStatus || "");
  const [notes, setNotes] = useState(initialNotes || "");
  const [internalNote, setInternalNote] = useState("");
  const [busyAction, setBusyAction] = useState<NewLeadAction | null>(null);
  const [message, setMessage] = useState("");

  const disabled = Boolean(busyAction);
  const estimateSent = dealStatus === "proposal_sent";

  const canSaveNote = useMemo(() => internalNote.trim().length > 0, [internalNote]);

  async function patchLead(payload: Record<string, unknown>, successMessage: string, action: NewLeadAction) {
    setBusyAction(action);
    setMessage("");
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(String(body?.error || "Could not update lead."));
      }
      setStatus(String(body?.status || payload.status || status));
      setDealStatus(String(body?.deal_status || payload.deal_status || dealStatus || ""));
      setNotes(String(body?.notes || payload.notes || notes));
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update lead.");
    } finally {
      setBusyAction(null);
    }
  }

  function markContacted() {
    void patchLead(
      {
        status: "contacted",
        last_contacted_at: new Date().toISOString(),
      },
      "Lead marked as contacted.",
      "contacted",
    );
  }

  function markEstimateSent() {
    void patchLead(
      {
        status: status === "new" ? "contacted" : status,
        deal_status: "proposal_sent",
        last_contacted_at: new Date().toISOString(),
      },
      "Lead marked as estimate sent.",
      "estimate_sent",
    );
  }

  function archiveLead() {
    void patchLead(
      {
        status: "archived",
      },
      "Lead archived.",
      "archived",
    );
  }

  function saveInternalNote() {
    const nextNotes = appendInternalNote(notes, internalNote);
    void patchLead({ notes: nextNotes }, "Internal note saved.", "note");
    setInternalNote("");
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="admin-btn-ghost text-xs" disabled={disabled} onClick={markContacted}>
          {busyAction === "contacted" ? "Saving..." : "Mark contacted"}
        </button>
        <button type="button" className="admin-btn-ghost text-xs" disabled={disabled || estimateSent} onClick={markEstimateSent}>
          {estimateSent ? "Estimate sent" : busyAction === "estimate_sent" ? "Saving..." : "Mark estimate sent"}
        </button>
        <button type="button" className="admin-btn-ghost text-xs" disabled={disabled} onClick={archiveLead}>
          {busyAction === "archived" ? "Saving..." : "Archive lead"}
        </button>
      </div>
      <div>
        <label className="admin-text-fg mb-1 block text-xs font-semibold" htmlFor={`internal-note-${leadId}`}>
          Internal notes
        </label>
        <textarea
          id={`internal-note-${leadId}`}
          className="admin-input min-h-[82px] w-full text-sm"
          value={internalNote}
          onChange={(event) => setInternalNote(event.currentTarget.value)}
          placeholder="Add a private note for Topher..."
        />
        <button
          type="button"
          className="admin-btn-primary mt-2 text-xs"
          disabled={disabled || !canSaveNote}
          onClick={saveInternalNote}
        >
          {busyAction === "note" ? "Saving note..." : "Save internal note"}
        </button>
      </div>
      {message ? <p className="admin-text-muted text-xs">{message}</p> : null}
    </div>
  );
}
