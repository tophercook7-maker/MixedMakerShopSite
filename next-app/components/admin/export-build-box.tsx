"use client";

import { useState } from "react";

export function ExportBuildBox({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="preview-card" style={{ marginBottom: 14, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>Export to Build</strong>
        <button type="button" onClick={() => void copyPrompt()} className="admin-btn-ghost text-xs">
          {copied ? "Copied" : "Copy Prompt"}
        </button>
      </div>
      <textarea className="admin-input min-h-[260px]" readOnly value={prompt} />
    </section>
  );
}
