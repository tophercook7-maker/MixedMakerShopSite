"use client";

import { useState } from "react";

export function LeadPitchPanel({
  emailPitch,
  textPitch,
  doorPitch,
  title = "What to say",
  showDoor = false,
}: {
  emailPitch: string;
  textPitch: string;
  doorPitch: string;
  title?: string;
  showDoor?: boolean;
}) {
  const [showDoorPitch, setShowDoorPitch] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied.`);
    } catch {
      setMessage(`Could not copy.`);
    }
  }

  return (
    <section className="admin-card">
      <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        <button className="admin-btn-ghost text-xs" onClick={() => void copyText(emailPitch, "Email")}>
          Copy email
        </button>
        <button className="admin-btn-ghost text-xs" onClick={() => void copyText(textPitch, "Text")}>
          Copy text
        </button>
        {showDoor ? (
          <button className="admin-btn-ghost text-xs" onClick={() => setShowDoorPitch((prev) => !prev)}>
            {showDoorPitch ? "Hide door" : "Door script"}
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-3 text-sm" style={{ color: "var(--admin-muted)" }}>
        <p className="whitespace-pre-wrap leading-relaxed">
          <span className="font-semibold text-[var(--admin-fg)]">Email: </span>
          {emailPitch}
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">
          <span className="font-semibold text-[var(--admin-fg)]">Text: </span>
          {textPitch}
        </p>
        {showDoor && showDoorPitch ? (
          <p className="whitespace-pre-wrap leading-relaxed text-xs">
            <span className="font-semibold text-[var(--admin-fg)]">Door: </span>
            {doorPitch}
          </p>
        ) : null}
        {message ? <p className="text-xs" style={{ color: "#86efac" }}>{message}</p> : null}
      </div>
    </section>
  );
}
