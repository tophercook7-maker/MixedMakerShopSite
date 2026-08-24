"use client";

import { useMemo, useState } from "react";

export type QueueLead = {
  id: string;
  business_name: string;
  email: string;
  city: string | null;
  preview: string;
  state: "pending" | "approved" | "sent";
};

function composeMailto(l: QueueLead): string {
  const subject = `A website preview I built for ${l.business_name}`;
  const where = l.city ? `${l.city} ` : "";
  const body = [
    `Hi,`,
    ``,
    `I build websites for ${where}small businesses, and I put together a free custom preview for ${l.business_name} so you can see what yours could look like — no obligation:`,
    ``,
    l.preview,
    ``,
    `If you like the direction, I'd be glad to build it out for you. If not, no worries at all.`,
    ``,
    `Topher`,
    `Mixed Maker Shop`,
    `mixedmakershop.com`,
  ].join("\n");
  return `mailto:${encodeURIComponent(l.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function SendQueueList({ initial }: { initial: QueueLead[] }) {
  const [leads, setLeads] = useState<QueueLead[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { unsent: 0, sent: 0 };
    for (const l of leads) (l.state === "sent" ? c.sent++ : c.unsent++);
    return c;
  }, [leads]);

  async function markSent(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/leads/${id}/approve-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sent: true }),
      });
      const j = await res.json();
      if (j?.state === "sent") {
        setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, state: "sent" } : l)));
      }
    } catch {
      /* leave as-is on failure */
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 980 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Send queue</h1>
      <p style={{ color: "#555", marginBottom: 12 }}>
        Each lead has a pre-written email with their preview link. Click <strong>Compose</strong> to
        open it in your mail app, send it from your business inbox (your 10/10 deliverability path),
        then mark it sent.
      </p>

      <div
        style={{
          background: "#eef6ff",
          border: "1px solid #bcdcff",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 13.5,
          color: "#255",
        }}
      >
        💡 Keep it low &amp; slow — a handful a day rebuilds your sender reputation. For food-truck /
        Facebook-only leads, message on Messenger or call instead; many don&apos;t watch email.
      </div>

      <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
        {counts.unsent} to send · {counts.sent} sent · {leads.length} total
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
            <th style={{ padding: "8px 6px" }}>Business</th>
            <th style={{ padding: "8px 6px" }}>City</th>
            <th style={{ padding: "8px 6px" }}>Preview</th>
            <th style={{ padding: "8px 6px", width: 260 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "8px 6px", fontWeight: 600 }}>{l.business_name}</td>
              <td style={{ padding: "8px 6px", color: "#666" }}>{l.city || "—"}</td>
              <td style={{ padding: "8px 6px" }}>
                <a href={l.preview} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                  view
                </a>
              </td>
              <td style={{ padding: "8px 6px" }}>
                {l.state === "sent" ? (
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Sent</span>
                ) : (
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <a href={composeMailto(l)} style={btn("#2563eb", false)}>
                      ✉️ Compose
                    </a>
                    <button
                      onClick={() => markSent(l.id)}
                      disabled={busy === l.id}
                      style={btn("#16a34a", true)}
                    >
                      {busy === l.id ? "…" : "Mark sent ✓"}
                    </button>
                  </span>
                )}
              </td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 20, color: "#888" }}>
                No preview-ready outbound leads found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function btn(color: string, outline: boolean): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: outline ? "#fff" : color,
    color: outline ? color : "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    textDecoration: "none",
    display: "inline-block",
  };
}
