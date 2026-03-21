"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import { leadStatusClass, prettyLeadStatus, getLeadPriorityBadges } from "@/components/admin/lead-visuals";
import { LeadForm } from "@/components/admin/lead-form";
import { CRM_STAGE_LABELS, type CrmPipelineStage } from "@/lib/crm/stages";

type SortKey = "created" | "score" | "follow_up" | "business";

const STAGE_TABS: { id: "all" | CrmPipelineStage; label: string }[] = [
  { id: "all", label: "All" },
  ...(["new", "contacted", "replied", "qualified", "proposal_sent", "won", "lost"] as const).map((id) => ({
    id,
    label: CRM_STAGE_LABELS[id],
  })),
];

function fmtShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function LeadsCardBrowser({
  initialLeads,
  emptyStateReason,
  initialAddOpen = false,
}: {
  initialLeads: WorkflowLead[];
  emptyStateReason: string;
  initialAddOpen?: boolean;
}) {
  const [leads] = useState<WorkflowLead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [stageTab, setStageTab] = useState<(typeof STAGE_TABS)[number]["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [hotOnly, setHotOnly] = useState(false);
  const [replyOnly, setReplyOnly] = useState(false);
  const [selected, setSelected] = useState<WorkflowLead | null>(null);
  const [adding, setAdding] = useState(initialAddOpen);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...leads]
      .filter((l) => {
        if (stageTab !== "all" && l.status !== stageTab) return false;
        if (hotOnly && !l.is_hot_lead) return false;
        if (replyOnly && !(Number(l.unread_reply_count) > 0) && !String(l.last_reply_preview || "").trim())
          return false;
        if (!q) return true;
        const hay = [
          l.business_name,
          l.known_owner_name,
          l.email,
          l.phone_from_site,
          l.website,
          l.city,
          l.category,
          l.last_reply_preview,
        ]
          .map((v) => String(v || "").toLowerCase())
          .join(" ");
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sortKey === "score") return Number(b.conversion_score || 0) - Number(a.conversion_score || 0);
        if (sortKey === "business") return a.business_name.localeCompare(b.business_name);
        if (sortKey === "follow_up") {
          const at = a.next_follow_up_at ? new Date(a.next_follow_up_at).getTime() : Infinity;
          const bt = b.next_follow_up_at ? new Date(b.next_follow_up_at).getTime() : Infinity;
          return at - bt;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [leads, search, stageTab, sortKey, hotOnly, replyOnly]);

  return (
    <div className="space-y-4">
      <div className="admin-card flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold block mb-1" style={{ color: "var(--admin-muted)" }}>
            Search
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            placeholder="Business, email, phone, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: "var(--admin-muted)" }}>
            Sort
          </label>
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="created">Newest</option>
            <option value="score">Score</option>
            <option value="follow_up">Follow-up date</option>
            <option value="business">Business A–Z</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--admin-fg)" }}>
          <input type="checkbox" checked={hotOnly} onChange={(e) => setHotOnly(e.target.checked)} />
          Hot only
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--admin-fg)" }}>
          <input type="checkbox" checked={replyOnly} onChange={(e) => setReplyOnly(e.target.checked)} />
          Has reply preview
        </label>
        <button type="button" className="admin-btn-primary text-sm" onClick={() => setAdding(true)}>
          Add Lead
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STAGE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={stageTab === t.id ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}
            onClick={() => setStageTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adding ? (
        <section className="admin-card">
          <LeadForm
            onClose={() => setAdding(false)}
            onSave={async (payload) => {
              const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (res.ok) {
                window.location.reload();
                return true;
              }
              return false;
            }}
          />
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            {emptyStateReason || "No leads match filters."}
          </p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => {
            const badges = getLeadPriorityBadges({
              isHotLead: lead.is_hot_lead,
              bucket: lead.lead_bucket || null,
              score: lead.conversion_score,
              email: lead.email,
              phone: lead.phone_from_site,
            });
            const unread = Boolean(String(lead.last_reply_preview || "").trim() && lead.status === "replied");
            return (
              <button
                key={lead.id}
                type="button"
                className="admin-card text-left w-full hover:ring-1 hover:ring-[var(--admin-gold)] transition"
                onClick={() => setSelected(lead)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-base" style={{ color: "var(--admin-fg)" }}>
                      {lead.business_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
                      {lead.known_owner_name || "—"} · {lead.city || "—"}
                      {lead.category ? ` · ${lead.category}` : ""}
                    </p>
                  </div>
                  {unread ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200">
                      Reply
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${leadStatusClass(lead.status)}`}>
                    {prettyLeadStatus(lead.status)}
                  </span>
                  {badges.map((b) => (
                    <span key={b.key} className={`text-[11px] px-2 py-0.5 rounded-full ${b.className}`}>
                      {b.label}
                    </span>
                  ))}
                </div>
                <dl className="mt-3 space-y-1 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <div className="flex justify-between gap-2">
                    <dt>Email</dt>
                    <dd className="text-right truncate max-w-[60%]" style={{ color: "var(--admin-fg)" }}>
                      {lead.email || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Phone</dt>
                    <dd className="text-right" style={{ color: "var(--admin-fg)" }}>
                      {lead.phone_from_site || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Website</dt>
                    <dd className="text-right truncate max-w-[60%]" style={{ color: "var(--admin-fg)" }}>
                      {lead.website || "None"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Score</dt>
                    <dd style={{ color: "var(--admin-fg)" }}>{lead.conversion_score ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Next follow-up</dt>
                    <dd style={{ color: "var(--admin-fg)" }}>{fmtShort(lead.next_follow_up_at)}</dd>
                  </div>
                </dl>
                {lead.last_reply_preview ? (
                  <p className="text-xs mt-3 line-clamp-2 italic border-t border-white/10 pt-2" style={{ color: "#fecaca" }}>
                    “{lead.last_reply_preview}”
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Link href={buildLeadPath(lead.id)} className="admin-btn-primary text-xs" onClick={(e) => e.stopPropagation()}>
                    Open workspace
                  </Link>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60"
          role="dialog"
          aria-modal
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg h-full overflow-y-auto admin-card rounded-none border-l"
            style={{ borderColor: "var(--admin-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--admin-fg)" }}>
                {selected.business_name}
              </h2>
              <button type="button" className="admin-btn-ghost text-xs" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--admin-muted)" }}>
              Full profile, website review, and thread live on the lead workspace.
            </p>
            <dl className="space-y-2 text-sm" style={{ color: "var(--admin-muted)" }}>
              <div>
                <dt className="text-xs uppercase tracking-wide">Stage</dt>
                <dd className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${leadStatusClass(selected.status)}`}>
                  {prettyLeadStatus(selected.status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Contact</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1">
                  {selected.known_owner_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Email / Phone</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1">
                  {selected.email || "—"} · {selected.phone_from_site || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Website</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1 break-all">
                  {selected.website || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Notes</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1 whitespace-pre-wrap">
                  {(selected.notes || []).join("\n") || "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={buildLeadPath(selected.id)} className="admin-btn-primary text-sm">
                Open full workspace
              </Link>
              <Link href={`/admin/conversations?leadId=${encodeURIComponent(selected.id)}`} className="admin-btn-ghost text-sm">
                View conversation
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
