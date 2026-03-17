"use client";

import { useState } from "react";

export function LeadPitchPanel({
  emailPitch,
  textPitch,
  doorPitch,
}: {
  emailPitch: string;
  textPitch: string;
  doorPitch: string;
}) {
  const [showDoorPitch, setShowDoorPitch] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied.`);
    } catch {
      setMessage(`Could not copy ${label.toLowerCase()}.`);
    }
  }

  return (
    <section className="admin-card">
      <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
        Auto Pitch Generator
      </h2>
      <div className="flex flex-wrap gap-2">
        <button className="admin-btn-ghost text-xs" onClick={() => void copyText(emailPitch, "Email Pitch")}>
          Copy Email Pitch
        </button>
        <button className="admin-btn-ghost text-xs" onClick={() => void copyText(textPitch, "Text Pitch")}>
          Copy Text Pitch
        </button>
        <button className="admin-btn-ghost text-xs" onClick={() => setShowDoorPitch((prev) => !prev)}>
          {showDoorPitch ? "Hide Door Pitch" : "View Door Pitch"}
        </button>
      </div>
      <div className="mt-3 space-y-2 text-xs" style={{ color: "var(--admin-muted)" }}>
        <p><span className="font-semibold">Email pitch:</span> {emailPitch}</p>
        <p><span className="font-semibold">Text pitch:</span> {textPitch}</p>
        {showDoorPitch ? <p><span className="font-semibold">Door pitch:</span> {doorPitch}</p> : null}
        {message ? <p style={{ color: "#86efac" }}>{message}</p> : null}
      </div>
    </section>
  );
}

