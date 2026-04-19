"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { buildLeadPath } from "@/lib/lead-route";
import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";

function copyText(text: string) {
  void navigator.clipboard.writeText(text).catch(() => undefined);
}

export function WebLeadRowActions({ vm }: { vm: WebLeadViewModel }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const leadPath = buildLeadPath(vm.id, vm.businessName);

  async function patch(body: Record<string, unknown>, okMsg?: string) {
    setBusy(true);
    const res = await patchLeadApi(vm.id, body);
    setBusy(false);
    if (res.ok) {
      if (okMsg) {
        try {
          // eslint-disable-next-line no-alert
          alert(okMsg);
        } catch {
          /* ignore */
        }
      }
      router.refresh();
    } else {
      // eslint-disable-next-line no-alert
      alert(res.error);
    }
  }

  async function onPark() {
    const tags = Array.from(new Set([...vm.leadTags.map((t) => String(t).trim()), "web_parked"])).filter(Boolean);
    await patch({ crm_lane_web: "parked", lead_tags: tags }, "Parked.");
  }

  async function onWon() {
    await patch({ status: "won" }, "Marked won.");
  }

  async function onArchive() {
    await patch({ status: "archived" }, "Archived.");
  }

  async function onMarkReplied() {
    await patch({ status: "replied", unread_reply_count: 0 }, "Marked replied.");
  }

  async function onDelete() {
    if (!window.confirm("Delete this lead permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/leads/${encodeURIComponent(vm.id)}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      // eslint-disable-next-line no-alert
      alert(String(j.error || "Delete failed."));
      return;
    }
    router.push("/admin/crm/web");
    router.refresh();
  }

  return (
    <div className="relative flex items-center gap-1">
      <a href={leadPath} className="admin-btn-primary text-xs px-2.5 py-1.5">
        Open
      </a>
      <a
        href={`${leadPath}?focus=outreach`}
        className="admin-btn-ghost text-xs px-2.5 py-1.5 border border-[var(--admin-border)]"
      >
        Contact
      </a>
      <a href={`${leadPath}?sample=1`} className="admin-btn-ghost text-xs px-2.5 py-1.5 border border-[var(--admin-border)]">
        Build sample
      </a>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onPark()}
        className="admin-btn-ghost text-xs px-2.5 py-1.5 border border-[var(--admin-border)]"
      >
        Park
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onWon()}
        className="admin-btn-ghost text-xs px-2.5 py-1.5 border border-emerald-500/35"
      >
        Won
      </button>
      <details className="relative" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
        <summary
          className="list-none cursor-pointer admin-btn-ghost text-xs px-2 py-1.5 border border-[var(--admin-border)] rounded-lg flex items-center gap-1"
          style={{ listStyle: "none" }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </summary>
        <div
          className="absolute right-0 mt-1 z-20 min-w-[200px] rounded-lg border py-1 text-xs shadow-lg"
          style={{ borderColor: "var(--admin-border)", background: "var(--admin-card-bg, #0f1412)" }}
        >
          {vm.website ? (
            <a href={vm.website.startsWith("http") ? vm.website : `https://${vm.website}`} target="_blank" rel="noreferrer" className="block px-3 py-2 hover:bg-white/5">
              Open website
            </a>
          ) : null}
          {vm.sourceUrl ? (
            <a href={vm.sourceUrl} target="_blank" rel="noreferrer" className="block px-3 py-2 hover:bg-white/5">
              Open source URL
            </a>
          ) : null}
          {vm.facebookUrl ? (
            <a href={vm.facebookUrl} target="_blank" rel="noreferrer" className="block px-3 py-2 hover:bg-white/5">
              Open Facebook
            </a>
          ) : null}
          {vm.email ? (
            <button
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-white/5"
              onClick={() => copyText(vm.email)}
            >
              Copy email
            </button>
          ) : null}
          {vm.phone ? (
            <button
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-white/5"
              onClick={() => copyText(vm.phone)}
            >
              Copy phone
            </button>
          ) : null}
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-white/5"
            onClick={() => void patch({ last_contacted_at: new Date().toISOString() }, "Logged touch.")}
          >
            Log outreach
          </button>
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-white/5" onClick={() => void onMarkReplied()}>
            Mark replied
          </button>
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-white/5" onClick={() => void onArchive()}>
            Archive
          </button>
          <button type="button" className="w-full text-left px-3 py-2 text-red-300 hover:bg-white/5" onClick={() => void onDelete()}>
            Delete
          </button>
        </div>
      </details>
    </div>
  );
}
