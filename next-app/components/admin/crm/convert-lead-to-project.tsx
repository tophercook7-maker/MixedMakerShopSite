"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConvertLeadToProject({
  leadId,
  initialProjectId,
}: {
  leadId: string;
  initialProjectId?: string | null;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(() => String(initialProjectId || "").trim());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function convertLead() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/leads/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(body?.error || "Could not convert lead."));
      const nextProjectId = String(body?.project?.id || "").trim();
      if (nextProjectId) setProjectId(nextProjectId);
      setMessage(body?.alreadyConverted ? "Lead is already converted." : "Converted to project.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not convert lead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-card p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="admin-text-fg text-sm font-semibold">Project conversion</h2>
          <p className="admin-text-muted mt-1 text-xs">
            Create a CRM project from this lead. This only updates the CRM and does not send any notifications.
          </p>
        </div>
        {projectId ? (
          <Link href={`/admin/crm/projects/${encodeURIComponent(projectId)}`} className="admin-btn-ghost text-sm">
            View project
          </Link>
        ) : (
          <button type="button" onClick={() => void convertLead()} disabled={busy} className="admin-btn-primary text-sm">
            {busy ? "Converting..." : "Convert to Project"}
          </button>
        )}
      </div>
      {projectId ? (
        <p className="admin-text-muted text-xs">
          Converted project:{" "}
          <Link href={`/admin/crm/projects/${encodeURIComponent(projectId)}`} className="admin-text-gold hover:underline">
            Open project record
          </Link>
        </p>
      ) : null}
      {message ? <p className="admin-text-muted text-xs">{message}</p> : null}
    </section>
  );
}
