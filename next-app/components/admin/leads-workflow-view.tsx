"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type TimelineEntry = {
  id: string;
  direction?: string | null;
  subject?: string | null;
  body?: string | null;
  occurred_at?: string | null;
  status?: string | null;
};

export type WorkflowLead = {
  id: string;
  opportunity_id: string | null;
  business_name: string;
  category: string | null;
  opportunity_score: number | null;
  website: string | null;
  email: string | null;
  phone_from_site: string | null;
  contact_page: string | null;
  contact_method: string;
  detected_issue_summary: string;
  detected_issues: string[];
  status: string;
  created_at: string | null;
  screenshot_urls: string[];
  annotated_screenshot_url?: string | null;
  timeline: TimelineEntry[];
  notes: string[];
};

function prettyStatus(status: string) {
  return String(status || "new").replace(/_/g, " ");
}

export function LeadsWorkflowView({ initialLeads }: { initialLeads: WorkflowLead[] }) {
  const [leads, setLeads] = useState<WorkflowLead[]>(initialLeads);
  const [selectedId, setSelectedId] = useState<string | null>(initialLeads[0]?.id || null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draftForLeadId, setDraftForLeadId] = useState<string | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [annotatingLeadId, setAnnotatingLeadId] = useState<string | null>(null);
  const [annotationRect, setAnnotationRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const [sendingProofForLeadId, setSendingProofForLeadId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) =>
      [
        lead.business_name,
        lead.category || "",
        lead.contact_method || "",
        lead.detected_issue_summary || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [leads, search]);

  const queueCounts = useMemo(() => {
    const counts = {
      newLeads: 0,
      repliesWaiting: 0,
      followUpsDue: 0,
      contacted: 0,
    };
    for (const lead of leads) {
      const s = String(lead.status || "").toLowerCase();
      if (s === "new") counts.newLeads += 1;
      if (s === "replied") counts.repliesWaiting += 1;
      if (s === "follow_up" || s === "follow_up_due") counts.followUpsDue += 1;
      if (s === "contacted") counts.contacted += 1;
    }
    return counts;
  }, [leads]);

  const selectedLead = useMemo(
    () => filtered.find((lead) => lead.id === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  function buildGeneratedMessage(lead: WorkflowLead) {
    const issueText = lead.detected_issues[0] || "something that might be affecting conversions";
    const subject = "quick question about your website";
    const body = [
      "Hi,",
      "",
      `I was looking at your website and noticed: ${issueText}.`,
      "",
      "I grabbed a quick screenshot showing it.",
      "",
      "Would you like me to send it over?",
      "",
      "- Topher",
    ].join("\n");
    return { subject, body };
  }

  function startDraft(lead: WorkflowLead) {
    const generated = buildGeneratedMessage(lead);
    setDraftForLeadId(lead.id);
    setDraftSubject(generated.subject);
    setDraftBody(generated.body);
  }

  function sendDraft(lead: WorkflowLead) {
    if (!draftBody.trim()) {
      setError("Draft body is empty.");
      return;
    }
    if (lead.email) {
      const mailto = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(
        draftSubject || `Website idea for ${lead.business_name}`
      )}&body=${encodeURIComponent(draftBody)}`;
      window.location.href = mailto;
      return;
    }
    if (lead.contact_page) {
      window.open(lead.contact_page, "_blank", "noopener,noreferrer");
      return;
    }
    setError("No email or contact page is available for this lead.");
  }

  async function saveAnnotation(lead: WorkflowLead) {
    if (!annotationRect) {
      setError("Draw a highlight box first.");
      return;
    }
    const baseScreenshot = lead.annotated_screenshot_url || lead.screenshot_urls[0] || null;
    if (!baseScreenshot) {
      setError("No screenshot available to annotate.");
      return;
    }
    setSavingAnnotation(true);
    setError(null);
    try {
      const res = await fetch(`/api/case-files/${encodeURIComponent(lead.id)}/annotate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_screenshot_url: baseScreenshot,
          rect: annotationRect,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        annotated_screenshot_url?: string | null;
      };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Could not save annotation.");
      }
      const nextUrl = String(body.annotated_screenshot_url || "").trim();
      if (nextUrl) {
        setLeads((prev) =>
          prev.map((item) =>
            item.id === lead.id
              ? {
                  ...item,
                  annotated_screenshot_url: nextUrl,
                  screenshot_urls: [nextUrl, ...item.screenshot_urls.filter((u) => u !== nextUrl)],
                }
              : item
          )
        );
      }
      setAnnotatingLeadId(null);
      setAnnotationRect(null);
      setDrawingStart(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save annotation.");
    } finally {
      setSavingAnnotation(false);
    }
  }

  async function sendProofEmail(lead: WorkflowLead) {
    if (!lead.email) {
      setError("Lead is missing email for proof outreach.");
      return;
    }
    setSendingProofForLeadId(lead.id);
    setError(null);
    try {
      const res = await fetch(`/api/case-files/${encodeURIComponent(lead.id)}/send-proof-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annotated_screenshot_url: lead.annotated_screenshot_url || lead.screenshot_urls[0] || null,
          detected_issue_summary: lead.detected_issue_summary,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Could not send proof email.");
      }
      setLeads((prev) =>
        prev.map((item) => (item.id === lead.id ? { ...item, status: "contacted" } : item))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send proof email.");
    } finally {
      setSendingProofForLeadId(null);
    }
  }

  async function updateStatus(caseFileId: string, nextStatus: string) {
    setUpdatingId(caseFileId);
    setError(null);
    try {
      const res = await fetch(`/api/case-files/${encodeURIComponent(caseFileId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || "Could not update lead status.");
      }
      setLeads((prev) =>
        prev.map((lead) => (lead.id === caseFileId ? { ...lead, status: nextStatus } : lead))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update lead status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>New Leads</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.newLeads}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Replies Waiting</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.repliesWaiting}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Follow Ups Due</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.followUpsDue}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Contacted</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{queueCounts.contacted}</p>
        </div>
      </section>

      <section className="admin-card">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input
            type="search"
            placeholder="Search businesses, issues, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input h-9 w-80"
          />
          <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Showing {filtered.length} of {leads.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">No leads found</div>
            <div className="admin-empty-desc">Try a different search query.</div>
          </div>
        ) : (
          <div className="admin-table-wrap overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Main Issue</th>
                  <th>Contact Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.business_name}</td>
                    <td>{lead.category || "—"}</td>
                    <td>{lead.opportunity_score ?? "—"}</td>
                    <td>{lead.detected_issue_summary}</td>
                    <td>{lead.contact_method}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/leads/${encodeURIComponent(lead.id)}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Open Lead
                        </Link>
                        <Link href="/admin/cases" className="text-[var(--admin-gold)] hover:underline text-xs">
                          Open Case
                        </Link>
                        <Link href={`/admin/outreach?generate=1&opportunity_id=${encodeURIComponent(lead.opportunity_id || "")}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Generate Email
                        </Link>
                        <Link href={`/admin/outreach?opportunity_id=${encodeURIComponent(lead.opportunity_id || "")}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Send Email
                        </Link>
                        <button
                          type="button"
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          disabled={updatingId === lead.id}
                          onClick={() => void updateStatus(lead.id, "contacted")}
                        >
                          Mark Contacted
                        </button>
                        <button
                          type="button"
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                          disabled={updatingId === lead.id}
                          onClick={() => void updateStatus(lead.id, "do_not_contact")}
                        >
                          Mark Do Not Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedLead ? (
        <section className="admin-card">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
                {selectedLead.business_name}
              </h2>
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                {selectedLead.category || "—"} · Score {selectedLead.opportunity_score ?? "—"}
              </p>
            </div>
            <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Status: {prettyStatus(selectedLead.status)}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Website Screenshots</h3>
              {selectedLead.screenshot_urls.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>No screenshots available.</p>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const mainUrl = selectedLead.annotated_screenshot_url || selectedLead.screenshot_urls[0];
                    return (
                      <div
                        className="relative border rounded-md overflow-hidden"
                        style={{ borderColor: "var(--admin-border)" }}
                        onMouseDown={(e) => {
                          if (annotatingLeadId !== selectedLead.id) return;
                          const el = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - el.left) / el.width) * 100;
                          const y = ((e.clientY - el.top) / el.height) * 100;
                          setDrawingStart({ x, y });
                          setAnnotationRect({ x, y, w: 0, h: 0 });
                        }}
                        onMouseMove={(e) => {
                          if (annotatingLeadId !== selectedLead.id || !drawingStart) return;
                          const el = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - el.left) / el.width) * 100;
                          const y = ((e.clientY - el.top) / el.height) * 100;
                          const left = Math.min(drawingStart.x, x);
                          const top = Math.min(drawingStart.y, y);
                          const w = Math.abs(x - drawingStart.x);
                          const h = Math.abs(y - drawingStart.y);
                          setAnnotationRect({ x: left, y: top, w, h });
                        }}
                        onMouseUp={() => {
                          if (annotatingLeadId !== selectedLead.id) return;
                          setDrawingStart(null);
                        }}
                      >
                        <img src={mainUrl} alt="Website screenshot" className="w-full h-auto block" />
                        {annotationRect && annotatingLeadId === selectedLead.id ? (
                          <div
                            style={{
                              position: "absolute",
                              left: `${annotationRect.x}%`,
                              top: `${annotationRect.y}%`,
                              width: `${annotationRect.w}%`,
                              height: `${annotationRect.h}%`,
                              border: "3px solid #ef4444",
                              boxShadow: "0 0 0 1px rgba(255,255,255,0.7) inset",
                              pointerEvents: "none",
                            }}
                          />
                        ) : null}
                      </div>
                    );
                  })()}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs"
                      onClick={() => {
                        if (annotatingLeadId === selectedLead.id) {
                          setAnnotatingLeadId(null);
                          setAnnotationRect(null);
                          setDrawingStart(null);
                        } else {
                          setAnnotatingLeadId(selectedLead.id);
                          setAnnotationRect(null);
                          setDrawingStart(null);
                        }
                      }}
                    >
                      {annotatingLeadId === selectedLead.id ? "Cancel Annotation" : "Annotate Issue"}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-primary text-xs"
                      disabled={annotatingLeadId !== selectedLead.id || savingAnnotation}
                      onClick={() => void saveAnnotation(selectedLead)}
                    >
                      {savingAnnotation ? "Saving..." : "Save Annotated Image"}
                    </button>
                    <a
                      href={selectedLead.annotated_screenshot_url || selectedLead.screenshot_urls[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--admin-gold)] hover:underline self-center"
                    >
                      Open screenshot
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Website Audit</h3>
              {selectedLead.detected_issues.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>No audit issues recorded.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {selectedLead.detected_issues.map((issue, idx) => (
                    <li key={`${issue}-${idx}`}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Contact Methods</h3>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Email: </span>
                {selectedLead.email ? (
                  <a className="text-[var(--admin-gold)] hover:underline" href={`mailto:${selectedLead.email}`}>
                    {selectedLead.email}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Phone: </span>
                {selectedLead.phone_from_site ? (
                  <a className="text-[var(--admin-gold)] hover:underline" href={`tel:${selectedLead.phone_from_site}`}>
                    {selectedLead.phone_from_site}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Contact Page: </span>
                {selectedLead.contact_page ? (
                  <a
                    className="text-[var(--admin-gold)] hover:underline"
                    href={selectedLead.contact_page}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Outreach Generator</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                className="admin-btn-ghost text-xs"
                onClick={() => startDraft(selectedLead)}
              >
                Generate outreach email
              </button>
              <button
                type="button"
                className="admin-btn-primary text-xs"
                onClick={() => sendDraft(selectedLead)}
                disabled={draftForLeadId !== selectedLead.id}
              >
                Send email
              </button>
              <button
                type="button"
                className="admin-btn-primary text-xs"
                onClick={() => void sendProofEmail(selectedLead)}
                disabled={sendingProofForLeadId === selectedLead.id}
              >
                {sendingProofForLeadId === selectedLead.id ? "Sending..." : "Send Proof Email"}
              </button>
            </div>
            {draftForLeadId === selectedLead.id ? (
              <div className="space-y-2">
                <input
                  className="admin-input h-9 w-full"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  placeholder="Email subject"
                />
                <textarea
                  className="admin-textarea w-full min-h-[140px]"
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                />
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Generate outreach to prefill message from detected issues.
              </p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Conversation Timeline</h3>
            <div className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
              Emails sent / replies / notes / follow-up schedule
            </div>
            <div className="mb-3 text-xs" style={{ color: "var(--admin-muted)" }}>
              Follow-up schedule:{" "}
              {selectedLead.status === "follow_up" || selectedLead.status === "follow_up_due"
                ? "Follow-up due now"
                : selectedLead.status === "contacted"
                  ? "Next follow-up recommended in 4 days"
                  : "No follow-up scheduled"}
            </div>
            {selectedLead.notes.length > 0 ? (
              <ul className="mb-3 list-disc pl-5 text-xs" style={{ color: "var(--admin-muted)" }}>
                {selectedLead.notes.map((note, idx) => (
                  <li key={`${note}-${idx}`}>{note}</li>
                ))}
              </ul>
            ) : null}
            {selectedLead.timeline.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>No conversation messages recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {selectedLead.timeline.map((item) => (
                  <li key={item.id} className="text-sm border rounded-md p-2" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--admin-muted)" }}>
                      <span>{item.direction || "message"}</span>
                      <span>{item.status || "—"}</span>
                      <span>{item.occurred_at ? new Date(item.occurred_at).toLocaleString() : "—"}</span>
                    </div>
                    <div className="font-medium mt-1">{item.subject || "(no subject)"}</div>
                    <div className="text-xs mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-muted)" }}>
                      {String(item.body || "").slice(0, 500) || "(empty body)"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      {error ? (
        <p className="text-sm" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

