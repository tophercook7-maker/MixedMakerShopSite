"use client";

import { useState } from "react";

export function EmailTestPanel() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Scout-Brain test email");
  const [body, setBody] = useState("This is a test email from Scout-Brain.");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.info("email test panel loaded");

  async function sendTest() {
    console.info("send test email clicked");
    setError(null);
    setResult(null);
    if (!to.trim()) {
      setError("Recipient email is required.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/scout/outreach/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim() || undefined,
          body: body.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("test email failed", data);
        setError(data?.detail || data?.error || "Test email failed.");
        return;
      }
      console.info("test email success", data);
      setResult(
        data?.provider_message_id
          ? `Test email sent (id: ${data.provider_message_id}).`
          : "Test email sent."
      );
    } catch (e) {
      console.error("test email failed", e);
      setError(e instanceof Error ? e.message : "Test email failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-card">
      <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
        Email Test (Admin)
      </h2>
      <p className="text-sm mb-3" style={{ color: "var(--admin-muted)" }}>
        Sends a safe smoke-test email through the same provider path as production outreach.
      </p>
      <div className="space-y-3">
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="admin-input"
          placeholder="recipient@example.com"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="admin-input"
          placeholder="Scout-Brain test email"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="admin-input"
          rows={4}
          placeholder="This is a test email from Scout-Brain."
        />
        <button type="button" onClick={sendTest} className="admin-btn-primary" disabled={sending}>
          {sending ? "Sending..." : "Send Test Email"}
        </button>
      </div>
      {result && (
        <p className="text-sm mt-3" style={{ color: "#4ade80" }}>
          {result}
        </p>
      )}
      {error && (
        <p className="text-sm mt-3" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}
    </div>
  );
}
