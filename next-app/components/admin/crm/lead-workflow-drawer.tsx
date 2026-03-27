"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { buildLeadPath } from "@/lib/lead-route";
import { LeadsListReturnLink } from "@/components/admin/crm/leads-list-return-link";
import { formatLeadSourceLine } from "@/lib/crm/lead-source";
import { simpleLeadStatusLabel, isFollowUpDueTodayUtc } from "@/lib/crm/simple-lead-status-ui";
import { LeadServiceTypeBadge, resolveServiceTypeForDisplay } from "@/components/admin/crm/lead-service-type-badge";
import { normalizePrintPaymentStatus, PRINT_PAYMENT_STATUS_LABELS } from "@/lib/crm/print-payment";
import {
  extractPrintRequestDescription,
  isThreeDPrintLead,
  normalizePrintPipelineStatus,
} from "@/lib/crm/three-d-print-lead";
import {
  buildPrintQuickActionPatch,
  PRINT_QUICK_ACTION_BUTTONS,
  type PrintQuickActionId,
} from "@/lib/crm/three-d-print-quick-actions";
import {
  hasPrintFileAttached,
  resolvePrintUiLane,
  THREE_D_PRINT_UI_LANE_LABELS,
} from "@/lib/crm/three-d-print-ui-lanes";
import { ThreeDPrintTriageBadgeRow } from "@/lib/crm/three-d-print-triage-badges";

const TEMPLATE_WEB_DESIGN = `Hey, I came across your business and noticed you could have a stronger online setup. I help businesses look more professional online and turn visitors into customers with simple websites and landing pages. If you want, I can show you a quick mockup or direction for your business.`;

const TEMPLATE_3D_PRINTING = `Hey, I help with custom 3D printing, replacement parts, and problem-solving prints. If you ever need something made, fixed, or prototyped, send me the idea or file and I'll let you know what's possible.`;

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(v: string): string | undefined {
  const t = String(v || "").trim();
  if (!t) return undefined;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function fmtTs(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "—";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

type ServerLead = Record<string, unknown>;

export function LeadWorkflowDrawer({
  lead,
  open,
  onClose,
  onLeadUpdated,
  onRequestPrintQuoteModal,
}: {
  lead: WorkflowLead | null;
  open: boolean;
  onClose: () => void;
  onLeadUpdated: (leadId: string, patch: Record<string, unknown>) => void;
  /** Opens payment / quote modal when advancing a 3D job into quoting (same as board). */
  onRequestPrintQuoteModal?: (lead: WorkflowLead) => void;
}) {
  const [notesText, setNotesText] = useState("");
  const [firstOutreachText, setFirstOutreachText] = useState("");
  const [firstOutreachSentInput, setFirstOutreachSentInput] = useState("");
  const [nextFollowUpInput, setNextFollowUpInput] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [serverExtras, setServerExtras] = useState<ServerLead | null>(null);

  const refreshFromServer = useCallback(async (id: string) => {
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`);
    const data = (await res.json().catch(() => null)) as ServerLead | null;
    if (!data || typeof data !== "object" || (data as { error?: string }).error) return;
    setServerExtras(data);
  }, []);

  useEffect(() => {
    if (!open || !lead?.id) {
      setServerExtras(null);
      return;
    }
    setToast(null);
    void refreshFromServer(lead.id);
  }, [open, lead?.id, refreshFromServer]);

  useEffect(() => {
    if (!lead) return;
    setNotesText((lead.notes || []).filter(Boolean).join("\n"));
    setFirstOutreachText(String(lead.first_outreach_message || ""));
    setFirstOutreachSentInput(toDatetimeLocalValue(lead.first_outreach_sent_at));
    setNextFollowUpInput(toDatetimeLocalValue(lead.next_follow_up_at));
    setFollowUpDraft("");
  }, [lead?.id]);

  useEffect(() => {
    if (!serverExtras || !lead?.id) return;
    const msg = serverExtras.first_outreach_message;
    if (typeof msg === "string") setFirstOutreachText(msg);
    const fo = serverExtras.first_outreach_sent_at;
    if (typeof fo === "string" && fo.trim()) setFirstOutreachSentInput(toDatetimeLocalValue(fo));
    const nfu = serverExtras.next_follow_up_at;
    if (typeof nfu === "string" && nfu.trim()) setNextFollowUpInput(toDatetimeLocalValue(nfu));
    const n = serverExtras.notes;
    if (typeof n === "string") setNotesText(n);
  }, [serverExtras, lead?.id]);

  if (!open || !lead) return null;

  const activeLead = lead;

  const stRaw = String(serverExtras?.status ?? activeLead.status ?? "");
  const firstSent = String(serverExtras?.first_outreach_sent_at ?? activeLead.first_outreach_sent_at ?? "").trim();
  const nextFu = String(serverExtras?.next_follow_up_at ?? activeLead.next_follow_up_at ?? "").trim();
  const lastContact = String(serverExtras?.last_contacted_at ?? activeLead.last_contacted_at ?? "").trim();
  const serviceRaw =
    (typeof serverExtras?.service_type === "string" ? serverExtras.service_type : null) ??
    activeLead.service_type ??
    null;

  const displaySvc = resolveServiceTypeForDisplay({
    service_type: serviceRaw,
    lead_source: activeLead.lead_source,
    source: activeLead.source,
    lead_tags: activeLead.lead_tags,
  });

  const prettyStatus = simpleLeadStatusLabel({
    status: stRaw,
    next_follow_up_at: nextFu || null,
    first_outreach_sent_at: firstSent || null,
  });

  async function saveNotes() {
    setBusy(true);
    setToast(null);
    const r = await patchLeadApi(activeLead.id, { notes: notesText.trim() || null });
    setBusy(false);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast("Notes saved.");
    onLeadUpdated(activeLead.id, { notes: notesText.trim() || null });
    void refreshFromServer(activeLead.id);
  }

  async function saveDraftOutreach() {
    setBusy(true);
    setToast(null);
    const r = await patchLeadApi(activeLead.id, {
      first_outreach_message: firstOutreachText.trim() || null,
    });
    setBusy(false);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast("Draft message saved.");
    onLeadUpdated(activeLead.id, { first_outreach_message: firstOutreachText.trim() || null });
    void refreshFromServer(activeLead.id);
  }

  async function saveScheduleFields() {
    setBusy(true);
    setToast(null);
    const payload: Record<string, unknown> = {};
    const nfu = fromDatetimeLocalValue(nextFollowUpInput);
    if (nfu) payload.next_follow_up_at = nfu;
    else payload.next_follow_up_at = null;
    const fo = fromDatetimeLocalValue(firstOutreachSentInput);
    if (fo) payload.first_outreach_sent_at = fo;
    if (Object.keys(payload).length === 0) {
      setBusy(false);
      setToast("Nothing to update.");
      return;
    }
    const r = await patchLeadApi(activeLead.id, payload);
    setBusy(false);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast("Follow-up schedule updated.");
    onLeadUpdated(activeLead.id, payload);
    void refreshFromServer(activeLead.id);
  }

  async function markFirstOutreachSent() {
    const nowIso = new Date().toISOString();
    const sentIso = fromDatetimeLocalValue(firstOutreachSentInput) ?? nowIso;
    const threeDays = new Date(Date.now() + 3 * 86400000).toISOString();
    setBusy(true);
    setToast(null);
    const r = await patchLeadApi(activeLead.id, {
      first_outreach_message: firstOutreachText.trim() || null,
      first_outreach_sent_at: sentIso,
      last_contacted_at: nowIso,
      next_follow_up_at: threeDays,
      status: "contacted",
      outreach_sent: true,
      outreach_sent_at: sentIso,
    });
    setBusy(false);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast("Marked first outreach sent — follow-up in ~3 days.");
    onLeadUpdated(activeLead.id, {
      first_outreach_message: firstOutreachText.trim() || null,
      first_outreach_sent_at: sentIso,
      last_contacted_at: nowIso,
      next_follow_up_at: threeDays,
      status: "contacted",
    });
    setFirstOutreachSentInput(toDatetimeLocalValue(sentIso));
    setNextFollowUpInput(toDatetimeLocalValue(threeDays));
    void refreshFromServer(activeLead.id);
  }

  async function runPrintQuickAction(id: PrintQuickActionId) {
    setBusy(true);
    setToast(null);
    if (
      id === "mark_reviewed" &&
      onRequestPrintQuoteModal &&
      normalizePrintPipelineStatus(activeLead.print_pipeline_status) !== "quoted"
    ) {
      setBusy(false);
      onRequestPrintQuoteModal(activeLead);
      return;
    }
    const patch = buildPrintQuickActionPatch(id);
    const label = PRINT_QUICK_ACTION_BUTTONS.find((b) => b.id === id)?.label ?? id;
    const r = await patchLeadApi(activeLead.id, patch);
    setBusy(false);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast(`Print: ${label}`);
    onLeadUpdated(activeLead.id, patch);
    void refreshFromServer(activeLead.id);
  }

  async function markPrintFollowUpSent() {
    const nowIso = new Date().toISOString();
    const bump = new Date(Date.now() + 3 * 86400000).toISOString();
    setBusy(true);
    setToast(null);
    const r = await patchLeadApi(activeLead.id, { last_contacted_at: nowIso, next_follow_up_at: bump });
    setBusy(false);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast("Follow-up logged.");
    onLeadUpdated(activeLead.id, { last_contacted_at: nowIso, next_follow_up_at: bump });
    setNextFollowUpInput(toDatetimeLocalValue(bump));
    void refreshFromServer(activeLead.id);
  }

  const printLaneLabel = isThreeDPrintLead(activeLead) ? THREE_D_PRINT_UI_LANE_LABELS[resolvePrintUiLane(activeLead)] : "";
  const printDesc = isThreeDPrintLead(activeLead)
    ? extractPrintRequestDescription(
        (activeLead.notes || []).join("\n"),
        activeLead.print_request_summary ?? null,
      )
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      role="dialog"
      aria-modal
      aria-labelledby="lead-workflow-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl h-full overflow-y-auto border-l shadow-xl"
        style={{ borderColor: "var(--admin-border)", background: "var(--admin-bg, #0f1412)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: "var(--admin-border)", background: "inherit" }}>
          <div className="min-w-0">
            <h2 id="lead-workflow-drawer-title" className="text-lg font-bold truncate" style={{ color: "var(--admin-fg)" }}>
              {activeLead.business_name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <LeadServiceTypeBadge serviceType={displaySvc} />
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10" style={{ color: "var(--admin-muted)" }}>
                {prettyStatus}
              </span>
            </div>
          </div>
          <button type="button" className="admin-btn-ghost text-xs shrink-0" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-4 space-y-6 text-sm" style={{ color: "var(--admin-muted)" }}>
          {toast ? (
            <p className="text-xs rounded-md border px-3 py-2 border-emerald-500/35 text-emerald-100/95 bg-emerald-500/10">{toast}</p>
          ) : null}

          {isThreeDPrintLead(activeLead) ? (
            <section
              className="rounded-lg border px-3 py-3 space-y-3"
              style={{ borderColor: "rgba(139, 92, 246, 0.35)", background: "rgba(139, 92, 246, 0.06)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-fg)" }}>
                3D print job
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <LeadServiceTypeBadge serviceType="3d_printing" />
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-100/95">
                  {printLaneLabel}
                </span>
                {isFollowUpDueTodayUtc(activeLead.next_follow_up_at) ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-200">Follow-up due today</span>
                ) : null}
              </div>
              <ThreeDPrintTriageBadgeRow lead={activeLead} />
              <dl className="space-y-2 text-xs">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">Project / item</dt>
                  <dd style={{ color: "var(--admin-fg)" }}>
                    {String(activeLead.print_request_type || activeLead.print_request_summary || "").trim() || "—"}
                  </dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">Description</dt>
                  <dd className="line-clamp-4" style={{ color: "var(--admin-fg)" }}>
                    {printDesc || "—"}
                  </dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">File attached</dt>
                  <dd style={{ color: "var(--admin-fg)" }}>{hasPrintFileAttached(activeLead) ? "Yes" : "No"}</dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">Material</dt>
                  <dd style={{ color: "var(--admin-fg)" }}>{String(activeLead.print_material || "").trim() || "—"}</dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">Reference URL</dt>
                  <dd className="break-all" style={{ color: "var(--admin-fg)" }}>
                    {String(activeLead.source_url || activeLead.website || "").trim() ? (
                      <a
                        href={String(activeLead.source_url || activeLead.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-300 hover:underline"
                      >
                        {String(activeLead.source_url || activeLead.website)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">Quote / pay</dt>
                  <dd style={{ color: "var(--admin-fg)" }}>
                    {PRINT_PAYMENT_STATUS_LABELS[normalizePrintPaymentStatus(activeLead.payment_status)]}
                    {activeLead.quoted_amount != null && Number(activeLead.quoted_amount) > 0
                      ? ` · ${activeLead.quoted_amount}`
                      : ""}
                  </dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">Print deadline</dt>
                  <dd style={{ color: "var(--admin-fg)" }}>{fmtTs(activeLead.print_deadline)}</dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="opacity-80">Pipeline (raw)</dt>
                  <dd className="font-mono text-[11px] opacity-90" style={{ color: "var(--admin-fg)" }}>
                    {normalizePrintPipelineStatus(activeLead.print_pipeline_status)}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="admin-btn-ghost text-[11px] border border-amber-500/35"
                  disabled={busy}
                  onClick={() => void markPrintFollowUpSent()}
                >
                  Mark follow-up sent
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRINT_QUICK_ACTION_BUTTONS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    disabled={busy}
                    className="rounded border border-violet-500/40 px-2 py-1 text-[10px] font-medium text-violet-100/95 hover:bg-violet-500/15 disabled:opacity-40"
                    onClick={() => void runPrintQuickAction(b.id)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-fg)" }}>
              Lead basics
            </h3>
            <dl className="space-y-2 text-xs">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="opacity-80">Name</dt>
                <dd style={{ color: "var(--admin-fg)" }}>{activeLead.known_owner_name || "—"}</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="opacity-80">Business</dt>
                <dd style={{ color: "var(--admin-fg)" }}>{activeLead.business_name}</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="opacity-80">Service</dt>
                <dd>
                  <LeadServiceTypeBadge serviceType={displaySvc} />
                  {!displaySvc ? <span className="text-[11px] opacity-70">—</span> : null}
                </dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="opacity-80">Email</dt>
                <dd className="break-all" style={{ color: "var(--admin-fg)" }}>
                  {activeLead.email || "—"}
                </dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="opacity-80">Website</dt>
                <dd className="break-all" style={{ color: "var(--admin-fg)" }}>
                  {activeLead.website || "—"}
                </dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="opacity-80">Facebook</dt>
                <dd className="break-all" style={{ color: "var(--admin-fg)" }}>
                  {activeLead.facebook_url || "—"}
                </dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="opacity-80">Source</dt>
                <dd style={{ color: "var(--admin-fg)" }}>{formatLeadSourceLine(activeLead)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-fg)" }}>
              Lead status
            </h3>
            <dl className="space-y-2 text-xs">
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="opacity-80">DB status</dt>
                <dd style={{ color: "var(--admin-fg)" }}>{stRaw || "—"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="opacity-80">Workflow label</dt>
                <dd style={{ color: "var(--admin-fg)" }}>{prettyStatus}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="opacity-80">Next follow-up</dt>
                <dd style={{ color: "var(--admin-fg)" }}>{fmtTs(nextFu)}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="opacity-80">Last contact</dt>
                <dd style={{ color: "var(--admin-fg)" }}>{fmtTs(lastContact)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-fg)" }}>
              Notes
            </h3>
            <textarea
              className="w-full min-h-[100px] rounded-md border px-3 py-2 text-xs font-mono"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)", background: "rgba(0,0,0,.2)" }}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Internal notes…"
            />
            <button type="button" className="admin-btn-primary text-xs mt-2" disabled={busy} onClick={() => void saveNotes()}>
              Save notes
            </button>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-fg)" }}>
              Outreach
            </h3>
            <p className="text-[11px] mb-2 opacity-90">
              First message sent: {fmtTs(firstSent)} · Last contact: {fmtTs(lastContact)}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                className="admin-btn-ghost text-[10px] px-2 py-1"
                disabled={busy}
                onClick={() => setFirstOutreachText(TEMPLATE_WEB_DESIGN)}
              >
                Template: Web design
              </button>
              <button
                type="button"
                className="admin-btn-ghost text-[10px] px-2 py-1"
                disabled={busy}
                onClick={() => setFirstOutreachText(TEMPLATE_3D_PRINTING)}
              >
                Template: 3D printing
              </button>
            </div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--admin-fg)" }}>
              First outreach message
            </label>
            <textarea
              className="w-full min-h-[140px] rounded-md border px-3 py-2 text-xs leading-relaxed"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)", background: "rgba(0,0,0,.2)" }}
              value={firstOutreachText}
              onChange={(e) => setFirstOutreachText(e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-medium mb-1">First outreach sent at</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-md border px-2 py-1.5 text-xs"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)", background: "rgba(0,0,0,.2)" }}
                  value={firstOutreachSentInput}
                  onChange={(e) => setFirstOutreachSentInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1">Next follow-up at</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-md border px-2 py-1.5 text-xs"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)", background: "rgba(0,0,0,.2)" }}
                  value={nextFollowUpInput}
                  onChange={(e) => setNextFollowUpInput(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" className="admin-btn-ghost text-xs" disabled={busy} onClick={() => void saveDraftOutreach()}>
                Save draft message
              </button>
              <button type="button" className="admin-btn-ghost text-xs" disabled={busy} onClick={() => void saveScheduleFields()}>
                Save schedule fields
              </button>
              <button type="button" className="admin-btn-primary text-xs" disabled={busy} onClick={() => void markFirstOutreachSent()}>
                Mark first outreach sent
              </button>
            </div>
            <label className="block text-[11px] font-medium mt-4 mb-1" style={{ color: "var(--admin-fg)" }}>
              Follow-up message scratchpad (not saved automatically)
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-xs"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)", background: "rgba(0,0,0,.2)" }}
              value={followUpDraft}
              onChange={(e) => setFollowUpDraft(e.target.value)}
              placeholder="Draft your next follow-up here — copy to email/DM when ready."
            />
          </section>

          <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "var(--admin-border)" }}>
            <LeadsListReturnLink href={buildLeadPath(activeLead.id, activeLead.business_name)} className="admin-btn-primary text-xs">
              Open full workspace
            </LeadsListReturnLink>
            <Link href={`/admin/conversations?leadId=${encodeURIComponent(activeLead.id)}`} className="admin-btn-ghost text-xs">
              Conversations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
