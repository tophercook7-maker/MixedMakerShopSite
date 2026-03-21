"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildLeadPath } from "@/lib/lead-route";
import { CRM_STAGE_LABELS, type CrmPipelineStage } from "@/lib/crm/stages";
import { leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";

export type CrmMessage = {
  id: string;
  lead_id: string | null;
  direction: string;
  subject: string | null;
  body: string | null;
  created_at: string;
  sent_at: string | null;
  received_at: string | null;
};

export type CrmConversationLead = {
  id: string;
  business_name: string;
  status: string;
  conversion_score: number | null;
  website: string | null;
  has_website: boolean | null;
  next_follow_up_at: string | null;
  last_reply_preview: string | null;
  unread_reply_count: number | null;
  recommended_next_action: string | null;
  sequence_active?: boolean | null;
  automation_paused?: boolean | null;
  website_grade: string | null;
  website_status: string | null;
};

function stageLabel(status: string): string {
  const n = normalizeWorkflowLeadStatus(status);
  return CRM_STAGE_LABELS[n as CrmPipelineStage] || prettyLeadStatus(status);
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export function ConversationsWorkspace({
  leads,
  messages,
}: {
  leads: CrmConversationLead[];
  messages: CrmMessage[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(leads[0]?.id ?? null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const selected = leads.find((l) => l.id === selectedId) ?? leads[0] ?? null;

  const thread = useMemo(() => {
    if (!selected) return [];
    return messages
      .filter((m) => m.lead_id === selected.id)
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, selected]);

  const lastInbound = useMemo(() => {
    for (let i = thread.length - 1; i >= 0; i--) {
      if (String(thread[i].direction).toLowerCase() === "inbound") return thread[i];
    }
    return null;
  }, [thread]);

  const filteredLeads = useMemo(() => {
    if (!unreadOnly) return leads;
    return leads.filter((l) => Number(l.unread_reply_count) > 0 || String(l.last_reply_preview || "").trim());
  }, [leads, unreadOnly]);

  const suggested =
    selected?.recommended_next_action ||
    (lastInbound ? "Reply to this lead on the lead page (email send)." : "Send first touch or generate email.");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
      <aside className="admin-card flex flex-col gap-3 max-h-[calc(100vh-8rem)] overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold" style={{ color: "var(--admin-fg)" }}>
            Conversations
          </h2>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--admin-muted)" }}>
            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
            Unread / replied
          </label>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {!filteredLeads.length ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              No threads yet. Send outreach from a lead to start.
            </p>
          ) : (
            filteredLeads.map((l) => {
              const unread = Number(l.unread_reply_count) > 0;
              const active = selected?.id === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedId(l.id)}
                  className="w-full text-left rounded-lg border px-3 py-2 transition-colors"
                  style={{
                    borderColor: active ? "var(--admin-gold)" : "var(--admin-border)",
                    background: active ? "rgba(212, 175, 55, 0.08)" : "rgba(0,0,0,.15)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: "var(--admin-fg)" }}>
                      {l.business_name}
                    </span>
                    {unread && (
                      <span className="shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-600 text-white">
                        Reply
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${leadStatusClass(normalizeWorkflowLeadStatus(l.status))}`}>
                      {stageLabel(l.status)}
                    </span>
                    {l.conversion_score != null && (
                      <span className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
                        Score {l.conversion_score}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--admin-muted)" }}>
                    {String(l.last_reply_preview || "").trim() || "No preview yet"}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main className="space-y-4 min-w-0">
        {!selected ? (
          <section className="admin-card">
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              Select a lead.
            </p>
          </section>
        ) : (
          <>
            {lastInbound && (
              <div
                className="rounded-xl border-2 px-4 py-3"
                style={{ borderColor: "#dc2626", background: "rgba(220, 38, 38, 0.12)" }}
              >
                <p className="text-sm font-bold text-red-100">Inbound reply — respond soon</p>
                <p className="text-xs text-red-200/90 mt-1 line-clamp-3">{String(lastInbound.body || "").trim()}</p>
              </div>
            )}

            <section className="admin-card space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={buildLeadPath(selected.id, selected.business_name)}
                    className="text-xl font-bold text-[var(--admin-gold)] hover:underline"
                  >
                    {selected.business_name}
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${leadStatusClass(normalizeWorkflowLeadStatus(selected.status))}`}>
                      {stageLabel(selected.status)}
                    </span>
                    {selected.conversion_score != null && (
                      <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
                        Score: {selected.conversion_score}
                      </span>
                    )}
                    {selected.website ? (
                      <a
                        href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--admin-gold)] hover:underline truncate max-w-[240px]"
                      >
                        {selected.website}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-amber-400">No website</span>
                    )}
                  </div>
                </div>
                <div className="text-xs space-y-1" style={{ color: "var(--admin-muted)" }}>
                  <div>
                    Website: {selected.website_status || (selected.has_website === false ? "none" : "—")}
                    {selected.website_grade ? ` · Grade ${selected.website_grade}` : ""}
                  </div>
                  <div>
                    Next follow-up:{" "}
                    {selected.next_follow_up_at ? fmtTime(selected.next_follow_up_at) : "—"}
                  </div>
                  <div>
                    Automation:{" "}
                    {selected.automation_paused
                      ? "Paused"
                      : selected.sequence_active
                        ? "Sequence on"
                        : "Idle"}
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-card space-y-3">
              <h3 className="text-sm font-bold" style={{ color: "var(--admin-fg)" }}>
                Thread
              </h3>
              <div className="space-y-3 max-h-[min(520px,55vh)] overflow-y-auto pr-1">
                {!thread.length ? (
                  <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    No messages for this lead yet.
                  </p>
                ) : (
                  thread.map((m) => {
                    const inbound = String(m.direction).toLowerCase() === "inbound";
                    return (
                      <div
                        key={m.id}
                        className="rounded-lg border px-3 py-2"
                        style={{
                          borderColor: inbound ? "#b91c1c" : "var(--admin-border)",
                          background: inbound ? "rgba(185, 28, 28, 0.12)" : "rgba(0,0,0,.2)",
                        }}
                      >
                        <div className="flex flex-wrap justify-between gap-2 text-[11px]" style={{ color: "var(--admin-muted)" }}>
                          <span className="font-bold uppercase" style={{ color: inbound ? "#fecaca" : "var(--admin-gold)" }}>
                            {inbound ? "Inbound" : "Outbound"}
                          </span>
                          <span>{fmtTime(m.received_at || m.sent_at || m.created_at)}</span>
                        </div>
                        {m.subject ? (
                          <p className="text-xs font-semibold mt-1" style={{ color: "var(--admin-fg)" }}>
                            {m.subject}
                          </p>
                        ) : null}
                        <pre
                          className="text-sm whitespace-pre-wrap font-sans mt-1"
                          style={{ color: "var(--admin-fg)" }}
                        >
                          {String(m.body || "").trim() || "—"}
                        </pre>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--admin-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--admin-muted)" }}>
                  Quick reply
                </p>
                <p className="text-sm" style={{ color: "var(--admin-fg)" }}>
                  Sending still happens from the lead workspace (Scout / generate). Open the lead to compose with full context.
                </p>
                <Link
                  href={`${buildLeadPath(selected.id, selected.business_name)}?generate=1`}
                  className="inline-block text-sm font-bold text-[var(--admin-gold)] hover:underline"
                >
                  Open lead → generate / send
                </Link>
              </div>

              <div className="rounded-lg border p-3" style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.15)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-muted)" }}>
                  Suggested next step
                </p>
                <p className="text-sm" style={{ color: "var(--admin-fg)" }}>
                  {suggested}
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
