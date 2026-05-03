"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculateProjectBalance,
  PROJECT_PAYMENT_STATUSES,
  projectMoneyBadge,
  projectPaymentStatusLabel,
  type ProjectPaymentStatus,
} from "@/lib/crm/project-money";

const PROJECT_CHECKLIST_ITEMS = [
  "Project reviewed",
  "Estimate finalized",
  "Deposit link prepared",
  "Deposit received",
  "Start date confirmed",
  "Materials/assets collected",
  "Work started",
  "First draft/prototype completed",
  "Customer review requested",
  "Revisions completed",
  "Final delivery completed",
  "Project archived",
] as const;

type ChecklistItem = (typeof PROJECT_CHECKLIST_ITEMS)[number];
type ChecklistState = Record<ChecklistItem, boolean>;

type ProjectActionFields = {
  estimated_price?: number | null;
  deposit_amount?: number | null;
  amount_paid?: number | null;
  payment_status?: string | null;
  payment_method?: string | null;
  scheduled_start_date?: string | null;
  due_date?: string | null;
  internal_notes?: string | null;
  action_checklist?: Record<string, unknown> | null;
};

function normalizeChecklist(raw: Record<string, unknown> | null | undefined): ChecklistState {
  return Object.fromEntries(PROJECT_CHECKLIST_ITEMS.map((item) => [item, raw?.[item] === true])) as ChecklistState;
}

function moneyString(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

function moneyValue(value: string): number | null {
  const clean = value.trim().replace(/[$,]/g, "");
  if (!clean) return null;
  const n = Number.parseFloat(clean);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function ProjectActionPanel({ projectId, project }: { projectId: string; project: ProjectActionFields }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<ChecklistState>(() => normalizeChecklist(project.action_checklist));
  const [savingItem, setSavingItem] = useState<ChecklistItem | null>(null);
  const [fields, setFields] = useState({
    estimatedPrice: moneyString(project.estimated_price),
    depositAmount: moneyString(project.deposit_amount),
    amountPaid: moneyString(project.amount_paid),
    paymentStatus: (project.payment_status || "not_requested") as ProjectPaymentStatus,
    paymentMethod: project.payment_method || "",
    scheduledStartDate: project.scheduled_start_date || "",
    dueDate: project.due_date || "",
    internalNotes: project.internal_notes || "",
  });
  const [fieldBusy, setFieldBusy] = useState(false);
  const [message, setMessage] = useState("");

  const completed = useMemo(() => PROJECT_CHECKLIST_ITEMS.filter((item) => checklist[item]).length, [checklist]);
  const estimatedPrice = moneyValue(fields.estimatedPrice) ?? 0;
  const amountPaid = moneyValue(fields.amountPaid) ?? 0;
  const balanceRemaining = calculateProjectBalance(estimatedPrice, amountPaid);
  const balanceBadge = projectMoneyBadge({
    estimatedPrice,
    amountPaid,
    paymentStatus: fields.paymentStatus,
  });

  async function patchProject(payload: Record<string, unknown>) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String(body?.error || "Could not save project."));
    return body;
  }

  async function toggleItem(item: ChecklistItem) {
    const next = { ...checklist, [item]: !checklist[item] };
    setChecklist(next);
    setSavingItem(item);
    setMessage("");
    try {
      await patchProject({ action_checklist: next });
      setMessage("Checklist saved.");
      router.refresh();
    } catch (error) {
      setChecklist(checklist);
      setMessage(error instanceof Error ? error.message : "Could not save checklist.");
    } finally {
      setSavingItem(null);
    }
  }

  async function saveFields() {
    setFieldBusy(true);
    setMessage("");
    try {
      const estimatedPrice = moneyValue(fields.estimatedPrice);
      const dueDate = fields.dueDate || null;
      const internalNotes = fields.internalNotes || null;
      await patchProject({
        estimated_price: estimatedPrice,
        price: estimatedPrice,
        deposit_amount: moneyValue(fields.depositAmount),
        amount_paid: moneyValue(fields.amountPaid) ?? 0,
        payment_status: fields.paymentStatus,
        payment_method: fields.paymentMethod.trim() || null,
        scheduled_start_date: fields.scheduledStartDate || null,
        due_date: dueDate,
        deadline: dueDate,
        internal_notes: internalNotes,
        notes: internalNotes,
      });
      setMessage("Project fields saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save project fields.");
    } finally {
      setFieldBusy(false);
    }
  }

  return (
    <section className="admin-card p-4 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-text-fg text-sm font-semibold">Project action checklist</h2>
          <p className="admin-text-muted mt-1 text-xs">
            {completed} of {PROJECT_CHECKLIST_ITEMS.length} steps complete
          </p>
        </div>
        <div className="admin-border-soft rounded-full border px-3 py-1 text-xs font-semibold admin-text-gold">
          {completed} of {PROJECT_CHECKLIST_ITEMS.length} steps complete
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PROJECT_CHECKLIST_ITEMS.map((item) => (
          <label
            key={item}
            className="admin-border-soft flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm admin-text-muted"
          >
            <input
              type="checkbox"
              checked={checklist[item]}
              disabled={savingItem === item}
              onChange={() => void toggleItem(item)}
            />
            <span className={checklist[item] ? "admin-text-fg" : undefined}>{item}</span>
            {savingItem === item ? <span className="ml-auto text-[11px]">Saving...</span> : null}
          </label>
        ))}
      </div>

      <div className="admin-border-soft border-t pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="admin-text-fg text-sm font-semibold">Money tracker</h3>
            <p className="admin-text-muted mt-1 text-xs">Manual tracking only. No payment processing is connected.</p>
          </div>
          <span className={balanceBadge.className}>{balanceBadge.label}</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="admin-border-soft rounded-xl border p-3">
            <div className="admin-text-muted text-xs">Estimated price</div>
            <div className="admin-text-fg mt-1 text-lg font-bold">${estimatedPrice.toLocaleString()}</div>
          </div>
          <div className="admin-border-soft rounded-xl border p-3">
            <div className="admin-text-muted text-xs">Deposit amount</div>
            <div className="admin-text-fg mt-1 text-lg font-bold">${(moneyValue(fields.depositAmount) ?? 0).toLocaleString()}</div>
          </div>
          <div className="admin-border-soft rounded-xl border p-3">
            <div className="admin-text-muted text-xs">Amount paid</div>
            <div className="admin-text-fg mt-1 text-lg font-bold">${amountPaid.toLocaleString()}</div>
          </div>
          <div className="admin-border-soft rounded-xl border p-3">
            <div className="admin-text-muted text-xs">Balance remaining</div>
            <div className="admin-text-fg mt-1 text-lg font-bold">${balanceRemaining.toLocaleString()}</div>
          </div>
        </div>

        <h3 className="admin-text-fg mt-5 text-sm font-semibold">Project fields</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium admin-text-muted">
            Estimated price
            <input
              aria-label="Estimated price"
              title="Estimated price"
              type="number"
              min="0"
              step="0.01"
              value={fields.estimatedPrice}
              onChange={(e) => setFields((f) => ({ ...f, estimatedPrice: e.target.value }))}
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-xs font-medium admin-text-muted">
            Deposit amount
            <input
              aria-label="Deposit amount"
              title="Deposit amount"
              type="number"
              min="0"
              step="0.01"
              value={fields.depositAmount}
              onChange={(e) => setFields((f) => ({ ...f, depositAmount: e.target.value }))}
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-xs font-medium admin-text-muted">
            Payment method
            <input
              aria-label="Payment method"
              title="Payment method"
              value={fields.paymentMethod}
              onChange={(e) => setFields((f) => ({ ...f, paymentMethod: e.target.value }))}
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-xs font-medium admin-text-muted">
            Amount paid
            <input
              aria-label="Amount paid"
              title="Amount paid"
              type="number"
              min="0"
              step="0.01"
              value={fields.amountPaid}
              onChange={(e) => setFields((f) => ({ ...f, amountPaid: e.target.value }))}
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-xs font-medium admin-text-muted">
            Payment status
            <select
              aria-label="Payment status"
              title="Payment status"
              value={fields.paymentStatus}
              onChange={(e) => setFields((f) => ({ ...f, paymentStatus: e.target.value as ProjectPaymentStatus }))}
              className="admin-select mt-1 w-full"
            >
              {PROJECT_PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {projectPaymentStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium admin-text-muted">
            Scheduled start date
            <input
              aria-label="Scheduled start date"
              title="Scheduled start date"
              type="date"
              value={fields.scheduledStartDate}
              onChange={(e) => setFields((f) => ({ ...f, scheduledStartDate: e.target.value }))}
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-xs font-medium admin-text-muted">
            Due date
            <input
              aria-label="Due date"
              title="Due date"
              type="date"
              value={fields.dueDate}
              onChange={(e) => setFields((f) => ({ ...f, dueDate: e.target.value }))}
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-xs font-medium admin-text-muted sm:col-span-2">
            Internal notes
            <textarea
              aria-label="Internal notes"
              title="Internal notes"
              value={fields.internalNotes}
              onChange={(e) => setFields((f) => ({ ...f, internalNotes: e.target.value }))}
              rows={5}
              className="admin-input mt-1"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void saveFields()} disabled={fieldBusy} className="admin-btn-primary text-sm">
            {fieldBusy ? "Saving..." : "Save project fields"}
          </button>
          {message ? <p className="admin-text-muted text-xs">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
