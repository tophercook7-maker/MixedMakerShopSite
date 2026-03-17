"use client";

import { useEffect, useState } from "react";

type LeadWorkspaceActionsProps = {
  leadId: string;
  linkedOpportunityId: string | null;
  initialBusinessName: string;
  initialCategory: string;
  initialIssue: string;
  initialStatus: string | null;
  initialDealStatus: string | null;
  initialEmail: string | null;
  initialPhone: string | null;
  website: string | null;
  contactPage: string | null;
  caseHref: string | null;
  initialNotes: string[];
  initialDoorStatus?: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost" | null;
  initialRealWorldWhyTarget?: string | null;
  initialRealWorldWalkInPitch?: string | null;
  initialBestTimeToVisit?: string | null;
  quickFixSummary?: string | null;
  autoGenerate?: boolean;
  autoCompose?: boolean;
};

type TemplateResponse = {
  short_email?: string;
  longer_email?: string;
  follow_up_note?: string;
};

const DEFAULT_SMS_TEMPLATE =
  "Hi, this is Topher with Topher's Web Design. I noticed a website opportunity that could help customers reach your business more easily. Want me to send you a quick example?";

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

function beginnerPricingSuggestion(category: string): { label: string; midpoint: number } {
  const normalized = String(category || "").toLowerCase();
  const isStandard =
    normalized.includes("contractor") ||
    normalized.includes("church") ||
    normalized.includes("service") ||
    normalized.includes("clinic");
  return isStandard
    ? { label: "Standard site ($300-$500)", midpoint: 400 }
    : { label: "Basic website ($150-$300)", midpoint: 225 };
}

export function LeadWorkspaceActions({
  leadId,
  linkedOpportunityId,
  initialBusinessName,
  initialCategory,
  initialIssue,
  initialStatus,
  initialDealStatus,
  initialEmail,
  initialPhone,
  website,
  contactPage,
  caseHref,
  initialNotes,
  initialDoorStatus = "not_visited",
  initialRealWorldWhyTarget = null,
  initialRealWorldWalkInPitch = null,
  initialBestTimeToVisit = null,
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
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>(initialNotes);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [proposalText, setProposalText] = useState("");
  const [doorStatus, setDoorStatus] = useState<string>(String(initialDoorStatus || "not_visited"));
  const [realWorldWhyTarget, setRealWorldWhyTarget] = useState(String(initialRealWorldWhyTarget || ""));
  const [realWorldWalkInPitch, setRealWorldWalkInPitch] = useState(String(initialRealWorldWalkInPitch || ""));
  const [bestTimeToVisit, setBestTimeToVisit] = useState(String(initialBestTimeToVisit || ""));

  const hasDraft = subject.trim().length > 0 || body.trim().length > 0;
  const showCompose = autoCompose || hasDraft;
  const proposalEligible =
    String(initialStatus || "").trim().toLowerCase() === "replied" ||
    String(initialDealStatus || "").trim().toLowerCase() === "interested";

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

  async function sendPreviewEmail() {
    console.info("[Action Debug] Send Preview Email clicked", { leadId });
    setIsSendingPreview(true);
    setError(null);
    setMessage(null);
    try {
      console.info("[Action Debug] Send Preview Email request started", { leadId });
      const res = await fetch("/api/scout/outreach/send-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          linked_opportunity_id: linkedOpportunityId,
          business_name: initialBusinessName,
          category: initialCategory,
          email: initialEmail,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        preview_url?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(data.error || "Could not send preview email.");
      if (data.preview_url) setPreviewUrl(data.preview_url);
      setMessage(data.message || "Preview sent and follow-ups scheduled");
      console.info("[Action Debug] Send Preview Email request succeeded", { leadId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send preview email.");
      console.error("[Action Debug] Send Preview Email request failed", {
        leadId,
        error: e instanceof Error ? e.message : "unknown",
      });
    } finally {
      setIsSendingPreview(false);
    }
  }

  async function updateLead(payload: Record<string, unknown>, successMessage: string): Promise<boolean> {
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
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update lead.");
      console.error("[Action Debug] Lead status request failed", {
        leadId,
        payload,
        error: e instanceof Error ? e.message : "unknown",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }

  async function createLeadLinkedEvent(eventType: "followup" | "client_call" | "reminder", title: string, daysOut = 1) {
    const start = new Date();
    start.setDate(start.getDate() + daysOut);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const isBlocking = eventType === "client_call";
    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        event_type: eventType,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: `Auto-created from lead ${leadId}.`,
        is_blocking: isBlocking,
        lead_id: leadId,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(body.error || "Could not create calendar event.");
  }

  async function markContactedWithFollowUp() {
    const ok = await updateLead({ status: "contacted" }, "Lead marked contacted.");
    if (!ok) return;
    try {
      await createLeadLinkedEvent("followup", `Follow up: ${initialBusinessName || "Lead"}`, 1);
      setMessage("Lead marked contacted and follow-up scheduled.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create follow-up event.");
    }
  }

  async function markRepliedWithReminder() {
    const ok = await updateLead({ status: "replied", is_hot_lead: true }, "Lead marked replied.");
    if (!ok) return;
    try {
      await createLeadLinkedEvent("reminder", `Reply to lead: ${initialBusinessName || "Lead"}`, 0);
      setMessage("Lead marked replied and calendar reminder added.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create reply reminder.");
    }
  }

  async function scheduleClientCall() {
    try {
      await createLeadLinkedEvent("client_call", `Client call: ${initialBusinessName || "Lead"}`, 1);
      setMessage("Client call event created and linked to lead.");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not schedule client call.");
    }
  }

  async function updateDealStatus(nextStatus: "interested" | "proposal_sent" | "won" | "lost") {
    const nowIso = new Date().toISOString();
    if (nextStatus === "won") {
      const pricing = beginnerPricingSuggestion(initialCategory);
      const input = window.prompt(
        `Deal value for ${initialBusinessName || "this lead"}\nSuggested: ${pricing.label}`,
        String(pricing.midpoint)
      );
      const parsed = Number(input || "");
      const wantsRecurring = window.confirm(
        "Offer hosting/maintenance plan now? Click OK for yes, Cancel for no."
      );
      const recurringDefault = "20";
      const recurringInput = wantsRecurring
        ? window.prompt("Monthly plan amount ($15-$30 recommended)", recurringDefault)
        : null;
      const recurringParsed = Number(recurringInput || "");
      await updateLead(
        {
          deal_status: "won",
          deal_value: Number.isFinite(parsed) && parsed > 0 ? parsed : pricing.midpoint,
          closed_at: nowIso,
          status: "closed_won",
          sequence_active: false,
          is_recurring_client: wantsRecurring,
          monthly_value:
            wantsRecurring && Number.isFinite(recurringParsed) && recurringParsed > 0
              ? recurringParsed
              : wantsRecurring
                ? 20
                : null,
          subscription_started_at: wantsRecurring ? nowIso : null,
        },
        wantsRecurring
          ? "Deal marked won and recurring plan started."
          : "Deal marked won."
      );
      return;
    }
    if (nextStatus === "lost") {
      await updateLead(
        { deal_status: "lost", closed_at: nowIso, status: "closed_lost", sequence_active: false },
        "Deal marked lost."
      );
      return;
    }
    await updateLead(
      { deal_status: nextStatus, status: "contacted" },
      nextStatus === "interested" ? "Deal marked interested." : "Proposal marked sent."
    );
  }

  async function updateDoorStatus(nextDoorStatus: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost") {
    const statusPatch: Record<string, unknown> =
      nextDoorStatus === "closed_won"
        ? { status: "closed_won" }
        : nextDoorStatus === "closed_lost"
          ? { status: "closed_lost" }
          : nextDoorStatus === "follow_up"
            ? { status: "follow_up_due" }
            : {};
    const ok = await updateLead(
      { door_status: nextDoorStatus, ...statusPatch },
      `Door status updated to ${nextDoorStatus.replace(/_/g, " ")}.`
    );
    if (ok) setDoorStatus(nextDoorStatus);
  }

  async function saveRealWorldPlan() {
    await updateLead(
      {
        real_world_why_target: realWorldWhyTarget.trim() || null,
        real_world_walk_in_pitch: realWorldWalkInPitch.trim() || null,
        best_time_to_visit: bestTimeToVisit.trim() || null,
      },
      "Real World Plan saved."
    );
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

  function generateProposal() {
    const pricing = beginnerPricingSuggestion(initialCategory);
    const proposal = [
      `Proposal for ${initialBusinessName || "your business"}`,
      "",
      "What I will improve:",
      `- Build a clean, mobile-friendly ${initialCategory || "business"} website`,
      `- Fix this key issue: ${initialIssue || "make it easier for customers to contact you"}`,
      quickFixSummary ? `- Priority fix: ${quickFixSummary}` : "- Improve key website issue found in review",
      "- Add clear calls-to-action for calls/quotes",
      "- Improve speed and layout so visitors stay and convert",
      "",
      "Timeline:",
      "- First version in 3-5 days",
      "- Revisions included",
      "",
      "Beginner-friendly investment:",
      `- ${pricing.label}`,
      "",
      "Next step:",
      "Reply with 'yes' and I will send a quick kickoff checklist.",
      "",
      "- Topher",
      "Topher's Web Design",
    ].join("\n");
    setProposalText(proposal);
    setMessage("Proposal generated.");
    setError(null);
  }

  async function copyProposal() {
    if (!proposalText.trim()) {
      setError("Generate a proposal first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(proposalText.trim());
      setMessage("Proposal copied to clipboard.");
      setError(null);
    } catch {
      setError("Could not copy proposal.");
    }
  }

  async function markReferredClient() {
    const referredBy = window.prompt("Referred by (lead id or name)", "");
    const referralSource = window.prompt("Referral source (client referral, church network, etc.)", "client referral");
    await updateLead(
      {
        is_referred_client: true,
        referred_by: String(referredBy || "").trim() || undefined,
        referral_source: String(referralSource || "").trim() || "client referral",
      },
      "Lead marked as referred client."
    );
  }

  function smsTemplate() {
    return DEFAULT_SMS_TEMPLATE.replace(
      "a website opportunity",
      `a website opportunity for ${initialBusinessName || "your business"}`
    );
  }

  function smsHref() {
    const phone = String(initialPhone || "").replace(/[^\d+]/g, "");
    const body = encodeURIComponent(smsTemplate());
    return `sms:${encodeURIComponent(phone)}?&body=${body}`;
  }

  async function copyNumber() {
    const next = String(initialPhone || "").trim();
    if (!next) {
      setError("No phone number on this lead.");
      return;
    }
    try {
      await navigator.clipboard.writeText(next);
      setMessage("Phone number copied.");
      setError(null);
    } catch {
      setError("Could not copy number.");
    }
  }

  async function copyTextScript() {
    try {
      await navigator.clipboard.writeText(smsTemplate());
      setMessage("Text script copied.");
      setError(null);
    } catch {
      setError("Could not copy text script.");
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
          <button
            className="admin-btn-primary text-xs"
            onClick={() => void sendPreviewEmail()}
            disabled={isSendingPreview}
          >
            {isSendingPreview ? "Sending Preview..." : "Send Preview Email"}
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
        <h3 className="text-sm font-semibold">Proposal Generator</h3>
        {proposalEligible ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn-primary text-xs" onClick={() => generateProposal()}>
                Generate Proposal
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void copyProposal()}>
                Copy Proposal
              </button>
            </div>
            {proposalText ? (
              <textarea
                className="admin-input min-h-[220px]"
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
              />
            ) : (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Proposal is available for replied/interested leads.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Proposal unlocks when lead is replied or marked interested.
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
        <h3 className="text-sm font-semibold">Real World Plan</h3>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Door status: <strong>{doorStatus.replace(/_/g, " ")}</strong>
        </p>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--admin-muted)" }}>Why this is a good target</label>
          <textarea
            className="admin-input min-h-[72px]"
            value={realWorldWhyTarget}
            onChange={(e) => setRealWorldWhyTarget(e.target.value)}
            placeholder="Active business, local visibility, clear website gap..."
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--admin-muted)" }}>What to say when I walk in</label>
          <textarea
            className="admin-input min-h-[72px]"
            value={realWorldWalkInPitch}
            onChange={(e) => setRealWorldWalkInPitch(e.target.value)}
            placeholder="Quick intro and value statement for walk-ins."
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--admin-muted)" }}>Best time to visit</label>
          <input
            className="admin-input"
            value={bestTimeToVisit}
            onChange={(e) => setBestTimeToVisit(e.target.value)}
            placeholder="Weekday mornings, after lunch, etc."
          />
        </div>
        <button className="admin-btn-primary text-xs" onClick={() => void saveRealWorldPlan()} disabled={isUpdating}>
          Save Real World Plan
        </button>
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void markContactedWithFollowUp()}
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
            className="admin-btn-ghost text-xs"
            onClick={() => void markRepliedWithReminder()}
            disabled={isUpdating}
          >
            Mark Replied
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void scheduleClientCall()}
            disabled={isUpdating}
          >
            Schedule Call
          </button>
          <button
            className="admin-btn-danger text-xs"
            onClick={() => void updateLead({ status: "do_not_contact" }, "Lead marked do not contact.")}
            disabled={isUpdating}
          >
            Do Not Contact
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("planned")}
            disabled={isUpdating}
          >
            Mark Planned
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("visited")}
            disabled={isUpdating}
          >
            Mark Visited
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("follow_up")}
            disabled={isUpdating}
          >
            Mark Follow Up
          </button>
          <button
            className="admin-btn-primary text-xs"
            onClick={() => void updateDoorStatus("closed_won")}
            disabled={isUpdating}
          >
            Mark Won
          </button>
          <button
            className="admin-btn-danger text-xs"
            onClick={() => void updateDoorStatus("closed_lost")}
            disabled={isUpdating}
          >
            Mark Lost
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("interested")} disabled={isUpdating}>
            Mark Interested
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("proposal_sent")} disabled={isUpdating}>
            Proposal Sent
          </button>
          <button className="admin-btn-primary text-xs" onClick={() => void updateDealStatus("won")} disabled={isUpdating}>
            Mark Won
          </button>
          <button className="admin-btn-danger text-xs" onClick={() => void updateDealStatus("lost")} disabled={isUpdating}>
            Mark Lost
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void markReferredClient()} disabled={isUpdating}>
            Mark Referred Client
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
          {initialPhone ? (
            <>
              <a href={smsHref()} className="admin-btn-ghost">
                Text from Mac
              </a>
              <button className="admin-btn-ghost" onClick={() => void copyNumber()}>
                Copy Number
              </button>
              <button className="admin-btn-ghost" onClick={() => void copyTextScript()}>
                Copy Text Script
              </button>
              <button
                className="admin-btn-ghost"
                onClick={() =>
                  void updateLead(
                    { status: "contacted" },
                    "Lead marked contacted (text sent)."
                  )
                }
                disabled={isUpdating}
              >
                Mark Text Sent
              </button>
            </>
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
      {message === "Preview sent and follow-ups scheduled" ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 60,
            background: "#14532d",
            color: "#dcfce7",
            border: "1px solid #166534",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          Preview sent and follow-ups scheduled
        </div>
      ) : null}
      {error ? (
        <p className="text-xs" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </aside>
  );
}
