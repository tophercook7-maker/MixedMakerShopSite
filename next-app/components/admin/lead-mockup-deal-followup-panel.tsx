"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import {
  MOCKUP_DEAL_STATUSES,
  MOCKUP_DEAL_STATUS_LABELS,
  normalizeMockupDealStatus,
  type MockupDealStatus,
} from "@/lib/mockup-deal-status";

function fmtContact(iso: string | null | undefined): string {
  const s = String(iso || "").trim();
  if (!s) return "Never";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function buildFollowUpMessages(name: string, business: string): { day: string; label: string; body: string }[] {
  const n = name.trim() || "there";
  const b = business.trim() || "your business";
  return [
    {
      day: "Day 1",
      label: "Gentle check-in",
      body: `Hey ${n},\n\nQuick check — did you get a chance to look at the homepage preview I put together for ${b}? If anything feels off, tell me in one line and I’ll adjust.\n\n– Topher`,
    },
    {
      day: "Day 3",
      label: "Value nudge",
      body: `Hey ${n},\n\nCircling back on the preview for ${b}. The goal was to make you look more legit at a glance and make it obvious what someone should do next. If you want to tweak tone or layout, I can do that.\n\n– Topher`,
    },
    {
      day: "Day 7",
      label: "Simple next step",
      body: `Hey ${n},\n\nNo pressure — if the preview for ${b} isn’t the right direction, that’s useful to know too. If it’s closer to what you want, I can map what a full site would take to launch.\n\n– Topher`,
    },
    {
      day: "Day 14",
      label: "Last friendly ping",
      body: `Hey ${n},\n\nLast note from me on the ${b} preview — I’ll assume you’re busy or going another route. If you ever want to pick it back up, reply anytime.\n\n– Topher`,
    },
  ];
}

export function LeadMockupDealFollowupPanel({
  leadId,
  contactName,
  businessName,
  initialMockupDealStatus,
  initialLastContactedAt,
}: {
  leadId: string;
  contactName: string;
  businessName: string;
  initialMockupDealStatus: string | null | undefined;
  initialLastContactedAt: string | null | undefined;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<MockupDealStatus>(normalizeMockupDealStatus(initialMockupDealStatus));
  const [lastContactedAt, setLastContactedAt] = useState<string | null>(
    initialLastContactedAt ? String(initialLastContactedAt) : null,
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setStatus(normalizeMockupDealStatus(initialMockupDealStatus));
    setLastContactedAt(initialLastContactedAt ? String(initialLastContactedAt) : null);
  }, [initialMockupDealStatus, initialLastContactedAt]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const onStatusChange = useCallback(
    async (next: MockupDealStatus) => {
      setSaving(true);
      setErr(null);
      setToast(null);
      const prev = status;
      setStatus(next);
      const r = await patchLeadApi(leadId, { mockup_deal_status: next });
      if (!r.ok) {
        setStatus(prev);
        setErr(r.error);
        setSaving(false);
        return;
      }
      setToast("Status saved.");
      router.refresh();
      setSaving(false);
    },
    [leadId, status, router],
  );

  const messages = buildFollowUpMessages(contactName, businessName);

  return (
    <div className="admin-card space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Mockup deal</h3>
        <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
          Track where this lead is in the mockup conversation. Last contact updates when you send the preview, log outreach,
          or automated follow-ups fire.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
          <span style={{ color: "var(--admin-muted)" }}>Status</span>
          <select
            className="rounded border px-2 py-1 text-xs bg-transparent"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
            value={status}
            disabled={saving}
            onChange={(e) => void onStatusChange(normalizeMockupDealStatus(e.target.value))}
          >
            {MOCKUP_DEAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {MOCKUP_DEAL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <span style={{ color: "var(--admin-muted)" }}>
          Last contact: <strong style={{ color: "var(--admin-fg)" }}>{fmtContact(lastContactedAt)}</strong>
        </span>
      </div>

      {err ? (
        <p className="text-xs" style={{ color: "#f87171" }}>
          {err}
        </p>
      ) : null}
      {toast ? (
        <p className="text-xs" style={{ color: "var(--admin-gold)" }}>
          {toast}
        </p>
      ) : null}

      <div className="rounded border p-3 space-y-2" style={{ borderColor: "var(--admin-border)" }}>
        <h4 className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
          Follow-up
        </h4>
        <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          Suggested follow-ups after you send the mockup. Copy and paste — nothing sends automatically.
        </p>
        <ul className="space-y-2 list-none p-0 m-0">
          {messages.map((m) => (
            <li
              key={m.day}
              className="flex flex-wrap items-start justify-between gap-2 rounded border p-2"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold" style={{ color: "var(--admin-fg)" }}>
                  {m.day} · {m.label}
                </p>
                <pre
                  className="text-[10px] whitespace-pre-wrap mt-1 max-h-24 overflow-auto rounded p-2"
                  style={{ background: "rgba(255,255,255,0.04)", color: "var(--admin-muted)" }}
                >
                  {m.body}
                </pre>
              </div>
              <button
                type="button"
                className="admin-btn-ghost text-[10px] shrink-0"
                onClick={() => {
                  void navigator.clipboard.writeText(m.body).then(
                    () => setToast(`${m.day} copied`),
                    () => setErr("Copy failed"),
                  );
                }}
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
