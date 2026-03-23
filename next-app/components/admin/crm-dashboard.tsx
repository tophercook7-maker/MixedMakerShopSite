"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { defaultLeads, type Lead, type LeadStatus } from "@/lib/leads-data";
import {
  copyText,
  getLeadColor,
  getLeadPriority,
  getTemplateSet,
  loadLeads,
  makeSmsLink,
  mergeDefaultLeads,
  saveLeads,
  sortLeads,
  todayString,
  uid,
} from "@/lib/crm-utils";

const statuses: Array<LeadStatus | "All"> = ["All", "New", "Messaged", "Follow-Up", "Closed"];

type NewLeadForm = {
  businessName: string;
  category: string;
  location: string;
  email: string;
  phone: string;
  facebook: string;
  notes: string;
};

const blankForm: NewLeadForm = {
  businessName: "",
  category: "",
  location: "",
  email: "",
  phone: "",
  facebook: "",
  notes: "",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</div>
    </div>
  );
}

export default function CrmDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState<NewLeadForm>(blankForm);

  useEffect(() => {
    const stored = loadLeads();
    const merged = mergeDefaultLeads(stored, defaultLeads);
    const sorted = sortLeads(merged);
    setLeads(sorted);
    saveLeads(sorted);
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      saveLeads(leads);
    }
  }, [leads]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(leads.map((l) => l.category).filter(Boolean)));
    return ["All", ...unique.sort((a, b) => a.localeCompare(b))];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.businessName.toLowerCase().includes(q) ||
        lead.category.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        (lead.email ?? "").toLowerCase().includes(q) ||
        (lead.phone ?? "").toLowerCase().includes(q) ||
        (lead.notes ?? "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || lead.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [leads, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      newLeads: leads.filter((l) => l.status === "New").length,
      messaged: leads.filter((l) => l.status === "Messaged").length,
      followUp: leads.filter((l) => l.status === "Follow-Up").length,
      closed: leads.filter((l) => l.status === "Closed").length,
    };
  }, [leads]);

  const todayNewLeads = useMemo(
    () => leads.filter((l) => getLeadPriority(l) === "new").slice(0, 5),
    [leads]
  );
  const todayFollowUps = useMemo(
    () => leads.filter((l) => getLeadPriority(l) === "followup").slice(0, 5),
    [leads]
  );
  const todayOverdue = useMemo(
    () => leads.filter((l) => getLeadPriority(l) === "overdue").slice(0, 5),
    [leads]
  );

  function persist(next: Lead[]) {
    const sorted = sortLeads(next);
    setLeads(sorted);
    saveLeads(sorted);
  }

  function updateLead(id: string, patch: Partial<Lead>) {
    persist(leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)));
  }

  function deleteLead(id: string) {
    persist(leads.filter((lead) => lead.id !== id));
  }

  function markMessaged(lead: Lead) {
    updateLead(lead.id, {
      status: "Messaged",
      lastContacted: todayString(),
    });
  }

  function markFollowUp(lead: Lead) {
    updateLead(lead.id, {
      status: "Follow-Up",
      lastContacted: todayString(),
    });
  }

  function markClosed(lead: Lead) {
    updateLead(lead.id, {
      status: "Closed",
      lastContacted: todayString(),
    });
  }

  async function handleCopy(key: string, text: string) {
    const ok = await copyText(text);
    if (ok) {
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1400);
    } else {
      window.alert("Copy failed.");
    }
  }

  function addLead(e: FormEvent) {
    e.preventDefault();

    if (!form.businessName.trim() || !form.category.trim() || !form.location.trim()) {
      window.alert("Business name, category, and location are required.");
      return;
    }

    const newLead: Lead = {
      id: uid(),
      businessName: form.businessName.trim(),
      category: form.category.trim(),
      location: form.location.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      facebook: form.facebook.trim() || undefined,
      notes: form.notes.trim() || undefined,
      status: "New",
      createdAt: todayString(),
    };

    persist([newLead, ...leads]);
    setForm(blankForm);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Local CRM</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage leads, open SMS/email fast, templates + follow-ups. Saved in this browser (
            <code className="text-xs">localStorage</code>).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/leads"
            className="rounded-lg border border-[var(--admin-border)] bg-[rgba(0,0,0,.12)] px-3 py-2 text-[var(--admin-fg)] hover:border-[var(--admin-gold)]"
          >
            Supabase leads
          </Link>
          <Link
            href="/admin/crm/hub"
            className="rounded-lg border border-[var(--admin-border)] bg-[rgba(0,0,0,.12)] px-3 py-2 text-[var(--admin-fg)] hover:border-[var(--admin-gold)]"
          >
            CRM hub &amp; alerts
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Total Leads" value={stats.total} />
        <StatCard label="New" value={stats.newLeads} />
        <StatCard label="Messaged" value={stats.messaged} />
        <StatCard label="Follow-Up" value={stats.followUp} />
        <StatCard label="Closed" value={stats.closed} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Today&apos;s Actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-600">
            <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">New Leads</h3>
            {todayNewLeads.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">None right now.</p>
            ) : (
              todayNewLeads.map((l) => (
                <div key={l.id} className="mb-2 text-sm text-neutral-800 dark:text-neutral-200">
                  {l.businessName}
                </div>
              ))
            )}
          </div>
          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-600">
            <h3 className="mb-2 font-semibold text-orange-600 dark:text-orange-400">Follow Ups</h3>
            {todayFollowUps.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">None right now.</p>
            ) : (
              todayFollowUps.map((l) => (
                <div key={l.id} className="mb-2 text-sm text-neutral-800 dark:text-neutral-200">
                  {l.businessName}
                </div>
              ))
            )}
          </div>
          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-600">
            <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">Overdue</h3>
            {todayOverdue.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">None right now.</p>
            ) : (
              todayOverdue.map((l) => (
                <div key={l.id} className="mb-2 text-sm text-neutral-800 dark:text-neutral-200">
                  {l.businessName}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Add Lead</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Add phone numbers here so the Text button works instantly.
          </p>
        </div>

        <form onSubmit={addLead} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            placeholder="Business name *"
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category *"
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location *"
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <input
            value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            placeholder="Facebook URL"
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
            className="rounded-xl border border-neutral-300 px-4 py-3 md:col-span-2 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <button
            type="submit"
            className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            Add Lead
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, category, location, notes..."
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "All")}
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Statuses" : status}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4">
        {filteredLeads.map((lead) => {
          const templates = getTemplateSet(lead);
          const hasEmail = Boolean(lead.email);
          const hasPhone = Boolean(lead.phone);
          const priority = getLeadPriority(lead);

          return (
            <div
              key={lead.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:justify-between">
                <div className="space-y-3 xl:max-w-md">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                      {lead.businessName}
                      {priority === "overdue" && (
                        <span className="ml-2 text-xs font-medium text-red-600 dark:text-red-400">Overdue</span>
                      )}
                      {priority === "followup" && (
                        <span className="ml-2 text-xs font-medium text-orange-600 dark:text-orange-400">Follow-Up</span>
                      )}
                      {priority === "new" && (
                        <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">New</span>
                      )}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {lead.category} • {lead.location}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getLeadColor(lead.status)}`}
                    >
                      {lead.status}
                    </span>

                    {lead.lastContacted ? (
                      <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200">
                        Last contacted: {lead.lastContacted}
                      </span>
                    ) : null}
                  </div>

                  {lead.notes ? <p className="text-sm text-neutral-700 dark:text-neutral-300">{lead.notes}</p> : null}

                  <div className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                    {lead.email ? (
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">Email:</span>{" "}
                        <a href={`mailto:${lead.email}`} className="text-blue-600 underline underline-offset-2 dark:text-blue-400">
                          {lead.email}
                        </a>
                      </div>
                    ) : null}

                    {lead.phone ? (
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">Phone:</span>{" "}
                        <a href={`sms:${lead.phone}`} className="text-blue-600 underline underline-offset-2 dark:text-blue-400">
                          {lead.phone}
                        </a>
                      </div>
                    ) : null}

                    {lead.facebook ? (
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">Facebook:</span>{" "}
                        <a
                          href={lead.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
                        >
                          Open page
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <select
                      aria-label={`Status for ${lead.businessName}`}
                      value={lead.status}
                      onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                      className="rounded-xl border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                    >
                      <option value="New">New</option>
                      <option value="Messaged">Messaged</option>
                      <option value="Follow-Up">Follow-Up</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => markMessaged(lead)}
                      className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                    >
                      Mark Messaged
                    </button>

                    <button
                      type="button"
                      onClick={() => markFollowUp(lead)}
                      className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Mark Follow-Up
                    </button>

                    <button
                      type="button"
                      onClick={() => markClosed(lead)}
                      className="rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-950/60"
                    >
                      Mark Closed
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {hasPhone ? (
                      <a
                        href={`sms:${lead.phone}`}
                        onClick={() =>
                          updateLead(lead.id, {
                            status: "Messaged",
                            lastContacted: new Date().toISOString().slice(0, 10),
                          })
                        }
                        className="rounded-lg bg-green-600 px-3 py-2 text-center text-sm text-white"
                      >
                        Text
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void copyText(templates.smsInitial)}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                      >
                        Copy Text
                      </button>
                    )}

                    {hasEmail ? (
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={() =>
                          updateLead(lead.id, {
                            status: "Messaged",
                            lastContacted: new Date().toISOString().slice(0, 10),
                          })
                        }
                        className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm text-white"
                      >
                        Email
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void copyText(templates.emailBody)}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                      >
                        Copy Email
                      </button>
                    )}

                    <a
                      href={lead.facebook || "#"}
                      target={lead.facebook ? "_blank" : undefined}
                      rel={lead.facebook ? "noreferrer" : undefined}
                      onClick={(e) => {
                        if (!lead.facebook) e.preventDefault();
                      }}
                      className="rounded-lg bg-sky-600 px-3 py-2 text-center text-sm text-white"
                    >
                      FB
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        void copyText(templates.smsFollowUp);
                        updateLead(lead.id, {
                          status: "Follow-Up",
                          lastContacted: new Date().toISOString().slice(0, 10),
                        });
                      }}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                    >
                      Follow-Up
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {hasPhone ? (
                      <a
                        href={makeSmsLink(lead, "followup")}
                        onClick={() => markFollowUp(lead)}
                        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Text Follow-Up
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleCopy(`follow-${lead.id}`, templates.smsFollowUp)}
                        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Copy Follow-Up
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy(
                          `full-${lead.id}`,
                          `SUBJECT: ${templates.emailSubject}

EMAIL:
${templates.emailBody}

TEXT:
${templates.smsInitial}

FOLLOW-UP:
${templates.smsFollowUp}

FACEBOOK:
${templates.facebookMessage}`
                        )
                      }
                      className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Copy Full Script
                    </button>

                    <button
                      type="button"
                      onClick={() => updateLead(lead.id, { lastContacted: todayString() })}
                      className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Touch Today
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteLead(lead.id)}
                      className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                    >
                      Delete Lead
                    </button>
                  </div>

                  {(copied === `email-${lead.id}` ||
                    copied === `sms-${lead.id}` ||
                    copied === `fb-${lead.id}` ||
                    copied === `short-${lead.id}` ||
                    copied === `follow-${lead.id}` ||
                    copied === `full-${lead.id}`) && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300">
                      Copied to clipboard.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredLeads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            No leads match your search or filters.
          </div>
        ) : null}
      </section>
    </div>
  );
}
