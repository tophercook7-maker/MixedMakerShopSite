"use client";

import { useState } from "react";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";

function copy(s: string) {
  void navigator.clipboard.writeText(s).catch(() => undefined);
}

export function WebLeadContactPaths({ vm, leadId }: { vm: WebLeadViewModel; leadId: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function logUsed() {
    const res = await patchLeadApi(leadId, { last_contacted_at: new Date().toISOString() });
    setMsg(res.ok ? "Logged touch." : res.error);
    setTimeout(() => setMsg(null), 2500);
  }

  const rows: { label: string; value: string; href?: string }[] = [
    { label: "Email", value: vm.email, href: vm.email ? `mailto:${vm.email}` : undefined },
    { label: "Phone", value: vm.phone, href: vm.phone ? `tel:${vm.phone.replace(/\s/g, "")}` : undefined },
    {
      label: "Contact page",
      value: vm.contactPage,
      href: vm.contactPage ? (vm.contactPage.startsWith("http") ? vm.contactPage : `https://${vm.contactPage}`) : undefined,
    },
    {
      label: "Facebook",
      value: vm.facebookUrl,
      href: vm.facebookUrl
        ? vm.facebookUrl.startsWith("http")
          ? vm.facebookUrl
          : `https://${vm.facebookUrl}`
        : undefined,
    },
    {
      label: "Website",
      value: vm.website,
      href: vm.website ? (vm.website.startsWith("http") ? vm.website : `https://${vm.website}`) : undefined,
    },
    { label: "Source / listing", value: vm.sourceUrl, href: vm.sourceUrl || undefined },
  ];

  return (
    <section className="admin-card p-4 space-y-3">
      <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
        Contact paths
      </h2>
      <ul className="space-y-2 text-sm list-none p-0 m-0">
        {rows
          .filter((r) => r.value)
          .map((r) => (
            <li key={r.label} className="flex flex-wrap items-center gap-2 justify-between border-b border-[var(--admin-border)]/60 pb-2">
              <span style={{ color: "var(--admin-muted)" }}>{r.label}</span>
              <span className="truncate max-w-[60%] text-right" style={{ color: "var(--admin-fg)" }} title={r.value}>
                {r.value}
              </span>
              <span className="flex gap-1 shrink-0">
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs px-2 py-1">
                    Open
                  </a>
                ) : null}
                <button type="button" className="admin-btn-ghost text-xs px-2 py-1" onClick={() => copy(r.value)}>
                  Copy
                </button>
              </span>
            </li>
          ))}
      </ul>
      <button type="button" className="admin-btn-ghost text-xs" onClick={() => void logUsed()}>
        Log outreach (touch)
      </button>
      {msg ? <p className="text-xs text-emerald-300/90">{msg}</p> : null}
    </section>
  );
}
