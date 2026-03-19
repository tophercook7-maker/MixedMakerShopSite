"use client";

import { useEffect, useState } from "react";

type ActivityRow = {
  id: string;
  type: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor_user_id?: string | null;
};

const LABELS: Record<string, string> = {
  lead_created: "Lead created",
  preview_generated: "Preview generated",
  preview_updated: "Preview updated",
  email_drafted: "Email drafted",
  email_sent: "Email sent",
  email_failed: "Email failed to send",
  preview_email_sent: "Preview email sent",
  facebook_prepared: "Facebook message prepared",
  text_sent: "Text sent",
  follow_up_scheduled: "Follow-up scheduled",
  reply_received: "Reply received",
  no_response: "Marked no response",
  archived: "Archived",
};

function prettyEvent(type: string): string {
  return LABELS[type] || type.replace(/_/g, " ");
}

export function LeadActivityTimeline({ leadId }: { leadId: string }) {
  const [items, setItems] = useState<ActivityRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/activity`, { cache: "no-store" });
        const body = (await res.json().catch(() => ({}))) as {
          items?: ActivityRow[];
          error?: string;
          reason?: string;
        };
        if (!res.ok) {
          if (!cancelled) setMessage(body.error || "Could not load activity.");
          return;
        }
        if (!cancelled) {
          setItems(Array.isArray(body.items) ? body.items : []);
          if (body.reason === "table_missing") {
            setMessage(
              "Activity log is not available yet (run DB migration or refresh Supabase schema cache). Lead actions still work."
            );
          } else {
            setMessage(null);
          }
        }
      } catch {
        if (!cancelled) setMessage("Could not load activity.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  return (
    <section className="admin-card space-y-2">
      <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
        Activity timeline
      </h3>
      <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
        Newest first — includes previews, sends, and follow-ups when logged.
      </p>
      {message ? (
        <p className="text-xs" style={{ color: message.includes("still work") ? "var(--admin-muted)" : "#fca5a5" }}>
          {message}
        </p>
      ) : null}
      {items.length === 0 && !message ? (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          No activity entries yet. Saving a sample or sending email will appear here.
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {items.map((row) => (
            <li
              key={row.id}
              className="rounded border px-2 py-2 text-xs"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.15)" }}
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium" style={{ color: "var(--admin-fg)" }}>
                  {prettyEvent(row.type)}
                </span>
                <span style={{ color: "var(--admin-muted)" }}>
                  {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                </span>
              </div>
              {row.message ? (
                <p className="mt-1 text-[11px]" style={{ color: "var(--admin-muted)" }}>
                  {row.message}
                </p>
              ) : null}
              {row.metadata && Object.keys(row.metadata).length > 0 ? (
                <pre className="mt-1 text-[10px] opacity-80 whitespace-pre-wrap break-all" style={{ color: "var(--admin-muted)" }}>
                  {JSON.stringify(row.metadata, null, 0)}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
