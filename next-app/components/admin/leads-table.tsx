"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Lead } from "@/lib/db-types";
import { LeadForm } from "./lead-form";

type Props = {
  leads: Lead[];
  initialLeadId?: string;
  initialFocus?: string;
  initialGenerate?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  readonly?: boolean;
};

export function LeadsTable({
  leads,
  initialLeadId,
  initialFocus,
  initialGenerate,
  emptyStateTitle,
  emptyStateDescription,
  readonly = false,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  const [localFallbackLeads, setLocalFallbackLeads] = useState<Lead[]>([]);
  const [optimisticLeads, setOptimisticLeads] = useState<Lead[]>([]);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const LOCAL_LEADS_KEY = "mixedmakershop.local_leads";

  useEffect(() => {
    if (!initialLeadId || autoOpened || editing) return;
    const target = leads.find((lead) => lead.id === initialLeadId);
    if (!target) return;
    setEditing(target);
    setAutoOpened(true);
  }, [initialLeadId, autoOpened, editing, leads]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_LEADS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Lead[];
      if (Array.isArray(parsed)) setLocalFallbackLeads(parsed);
    } catch {
      // Ignore malformed localStorage payloads.
    }
  }, []);

  const combinedLeads = [...optimisticLeads, ...localFallbackLeads, ...leads].filter(
    (lead, index, arr) => arr.findIndex((candidate) => candidate.id === lead.id) === index,
  );

  const filtered = combinedLeads.filter((l) => {
    const matchSearch =
      !search ||
      [l.business_name, l.contact_name, l.email].some(
        (v) => v && String(v).toLowerCase().includes(search.toLowerCase())
      );
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function updateLead(id: string, updates: Partial<Lead>) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return false;
    setEditing(null);
    setSubmitMessage("Lead updated.");
    router.refresh();
    return true;
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  function persistFallbackLeads(nextLeads: Lead[]) {
    try {
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(nextLeads));
    } catch {
      // Ignore storage write failures.
    }
  }

  function buildLocalLead(payload: Record<string, unknown>): Lead {
    const now = new Date().toISOString();
    return {
      id: `local-${Date.now()}`,
      owner_id: "local",
      created_at: now,
      business_name: String(payload.business_name || "Untitled lead"),
      contact_name: String(payload.contact_name || "") || null,
      email: String(payload.email || "") || null,
      phone: String(payload.phone || "") || null,
      website: String(payload.website || "") || null,
      address: String(payload.address || "") || null,
      category: String(payload.category || "") || null,
      city: String(payload.city || "") || null,
      industry: String(payload.industry || "") || null,
      lead_source: String(payload.lead_source || "manual_local") || null,
      status: (String(payload.status || "new") as Lead["status"]) || "new",
      notes: String(payload.notes || "") || null,
      follow_up_date: String(payload.follow_up_date || "") || null,
      is_manual: true,
      known_owner_name: String(payload.known_owner_name || "") || null,
      known_context: String(payload.known_context || "") || null,
      lead_bucket: String(payload.lead_bucket || "") || null,
      door_status: (String(payload.door_status || "not_visited") as Lead["door_status"]) || "not_visited",
      contact_method: null,
      workspace_id: null,
    };
  }

  async function createLead(payload: Record<string, unknown>) {
    console.info("[LeadsTable] Add lead submit payload", payload);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const localLead = buildLocalLead(payload);
        setLocalFallbackLeads((prev) => {
          const next = [localLead, ...prev];
          persistFallbackLeads(next);
          return next;
        });
        setAdding(false);
        setSubmitMessage("Lead saved locally (backend unavailable).");
        return true;
      }
      const created = body as Lead;
      setOptimisticLeads((prev) => [created, ...prev.filter((lead) => lead.id !== created.id)]);
      setAdding(false);
      setSubmitMessage("Lead added successfully.");
      router.refresh();
      return true;
    } catch {
      const localLead = buildLocalLead(payload);
      setLocalFallbackLeads((prev) => {
        const next = [localLead, ...prev];
        persistFallbackLeads(next);
        return next;
      });
      setAdding(false);
      setSubmitMessage("Lead saved locally (network issue).");
      return true;
    }
  }

  async function convertToClient(leadId: string) {
    const res = await fetch("/api/leads/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, markWon: true }),
    });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  function statusClass(s: string) {
    if (["closed_won"].includes(s)) return "admin-badge admin-badge-won";
    if (["closed_lost", "do_not_contact"].includes(s)) return "admin-badge admin-badge-lost";
    if (["new", "pending"].includes(s)) return "admin-badge admin-badge-new";
    if (["follow_up_due"].includes(s)) return "admin-badge admin-badge-overdue";
    return "admin-badge admin-badge-progress";
  }

  function tierFromScore(score: number | null | undefined) {
    const value = Number(score ?? 0);
    if (value >= 80) return "hot_lead";
    if (value >= 60) return "warm_lead";
    return "low_priority";
  }

  function tierClass(tier: string) {
    if (tier === "hot_lead") return "admin-badge admin-badge-tier-hot";
    if (tier === "warm_lead") return "admin-badge admin-badge-tier-warm";
    return "admin-badge admin-badge-tier-low";
  }

  function issuesFromNotes(notes: string | null | undefined) {
    const text = String(notes || "");
    const match = text.match(/Issues:\s*([^.]*)/i);
    if (!match?.[1]) return [];
    return match[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="search"
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input h-9 w-48"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-select h-9"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="follow_up_due">Follow up due</option>
          <option value="replied">Replied</option>
          <option value="closed_won">Closed won</option>
          <option value="closed_lost">Closed lost</option>
          <option value="do_not_contact">Do not contact</option>
        </select>
        {!readonly ? (
          <button type="button" onClick={() => setAdding(true)} className="admin-btn-primary">
            Add lead
          </button>
        ) : null}
      </div>
      <div className="admin-table-wrap overflow-x-auto">
        {submitMessage ? (
          <div className="mb-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}>
            {submitMessage}
          </div>
        ) : null}
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Business</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Status</th>
              <th>Score</th>
              <th>Tier</th>
              <th>Detected Issues</th>
              <th>Source</th>
              <th>Created</th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td>{l.business_name}</td>
                <td>{l.contact_name ?? "—"}</td>
                <td>{l.email ?? "—"}</td>
                <td><span className={statusClass(l.status)}>{l.status.replace("_", " ")}</span></td>
                <td>{l.opportunity_score != null ? Number(l.opportunity_score).toFixed(0) : "—"}</td>
                <td>
                  <span className={tierClass(tierFromScore(l.opportunity_score))}>
                    {tierFromScore(l.opportunity_score).replace(/_/g, " ")}
                  </span>
                </td>
                <td>{issuesFromNotes(l.notes).join(", ") || "—"}</td>
                <td style={{ color: "var(--admin-muted)" }}>{l.lead_source ?? "—"}</td>
                <td style={{ color: "var(--admin-muted)" }}>{l.created_at?.slice(0, 10)}</td>
                <td>
                  <div className="flex gap-2">
                    {!readonly ? (
                      <>
                        <button type="button" onClick={() => setEditing(l)} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Edit
                        </button>
                        <Link
                          href={`/admin/leads?lead=${encodeURIComponent(l.id)}&focus=outreach&generate=1`}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                        >
                          Generate Outreach
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/admin/cases"
                        className="text-[var(--admin-gold)] hover:underline text-xs"
                      >
                        Open Case
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="admin-empty admin-card">
          <div className="admin-empty-icon">—</div>
          <div className="admin-empty-title">{emptyStateTitle || "No leads match your filters"}</div>
          <div className="admin-empty-desc">{emptyStateDescription || "Try a different search or status"}</div>
        </div>
      )}
      {!readonly && editing && (
        <LeadForm
          lead={editing}
          onClose={() => setEditing(null)}
          onSave={(updates) => updateLead(editing.id, updates)}
          onDelete={() => deleteLead(editing.id)}
          onConvertToClient={convertToClient}
          initialFocus={initialFocus}
          initialGenerate={initialGenerate}
        />
      )}
      {!readonly && adding && (
        <LeadForm
          onClose={() => setAdding(false)}
          onSave={(payload) => createLead(payload)}
        />
      )}
    </div>
  );
}
