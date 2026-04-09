"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEAL_LEAD_STATUS_KEYS,
  DEAL_LEAD_STATUS_LABELS,
  normalizeDealLeadStatus,
  type DealLeadStatusKey,
} from "@/lib/crm/deal-lead-status";
import { getFollowUpTemplate } from "@/lib/crm/follow-up-templates";

type Props = {
  leadId: string;
  leadStatus: string | null | undefined;
  lastContactedAt: string | null | undefined;
  nextFollowUpAt: string | null | undefined;
  lastFollowUpTemplateKey: string | null | undefined;
};

function formatWhen(iso: string | null | undefined, emptyLabel: string): string {
  const t = String(iso || "").trim();
  if (!t) return emptyLabel;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return emptyLabel;
  return d.toLocaleString();
}

function templateDisplayLabel(key: string | null | undefined): string {
  const k = String(key || "").trim();
  if (!k) return "Not set";
  const tpl = getFollowUpTemplate(k);
  if (tpl?.label) return tpl.label;
  return k.replace(/_/g, " ");
}

export function LeadDealTrackingCard({
  leadId,
  leadStatus,
  lastContactedAt,
  nextFollowUpAt,
  lastFollowUpTemplateKey,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const normalized = useMemo(() => normalizeDealLeadStatus(leadStatus), [leadStatus]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onChangeStatus = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as DealLeadStatusKey;
      setBusy(true);
      setErr(null);
      setToast(null);
      try {
        const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/deal-lead-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_status: next }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: unknown; ok?: boolean };
        if (!res.ok) {
          setErr(typeof body.error === "string" ? body.error : "Could not update status");
          return;
        }
        setToast("Saved");
        router.refresh();
      } catch {
        setErr("Network error");
      } finally {
        setBusy(false);
      }
    },
    [leadId, router]
  );

  return (
    <section className="admin-card space-y-3">
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Follow-up &amp; deal
        </h2>
        <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
          Quick read on contact timing and deal lane. Uses CRM fields on this lead only.
        </p>
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

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs" style={{ color: "var(--admin-muted)" }}>
        <div className="sm:col-span-2">
          <dt className="opacity-70 mb-1">Lead status</dt>
          <dd>
            <select
              className="w-full max-w-xs rounded border px-2 py-1.5 text-xs font-medium bg-black/20"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
              value={normalized}
              disabled={busy}
              onChange={(ev) => void onChangeStatus(ev)}
              aria-label="Lead status"
            >
              {DEAL_LEAD_STATUS_KEYS.map((k) => (
                <option key={k} value={k}>
                  {DEAL_LEAD_STATUS_LABELS[k]}
                </option>
              ))}
            </select>
          </dd>
        </div>
        <div>
          <dt className="opacity-70">Last contacted</dt>
          <dd className="font-medium text-[var(--admin-fg)]">
            {formatWhen(lastContactedAt, "Never")}
          </dd>
        </div>
        <div>
          <dt className="opacity-70">Next follow-up</dt>
          <dd className="font-medium text-[var(--admin-fg)]">
            {formatWhen(nextFollowUpAt, "Not scheduled")}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="opacity-70">Last follow-up template</dt>
          <dd className="font-medium text-[var(--admin-fg)]">
            {templateDisplayLabel(lastFollowUpTemplateKey)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
