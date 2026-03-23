"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE = `[
  {
    "business_name": "Example Coffee",
    "category": "Coffee shop",
    "location": "Hot Springs, AR",
    "email": "hello@example.com",
    "phone": "5015550100",
    "facebook_url": "https://facebook.com/example",
    "website": "https://example.com",
    "city": "Hot Springs",
    "state": "AR",
    "notes": "Met at networking"
  }
]`;

export function ManualPicksBulkImport() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setMessage(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim() || "[]");
    } catch {
      setMessage("Invalid JSON. Paste an array of lead objects.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setMessage("Body must be a JSON array of leads.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/import-manual-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: unknown;
        created_count?: number;
        skipped_duplicates?: { business_name: string }[];
        errors?: { business_name: string; message: string }[];
      };
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Request failed.");
        return;
      }
      const created = Number(data.created_count || 0);
      const skipped = (data.skipped_duplicates || []).length;
      const errs = data.errors || [];
      setMessage(
        `Created ${created} lead(s). Skipped ${skipped} duplicate(s).` +
          (errs.length ? ` Errors: ${errs.map((e) => `${e.business_name}: ${e.message}`).join("; ")}` : "")
      );
      setRaw("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
        Paste a JSON array. Each object may include:{" "}
        <code className="text-[10px] opacity-90">business_name</code> (required),{" "}
        <code className="text-[10px] opacity-90">category</code>, <code className="text-[10px] opacity-90">location</code> (e.g.{" "}
        <code className="text-[10px] opacity-90">City, ST</code>), <code className="text-[10px] opacity-90">email</code>,{" "}
        <code className="text-[10px] opacity-90">phone</code>, <code className="text-[10px] opacity-90">facebook_url</code>,{" "}
        <code className="text-[10px] opacity-90">website</code>, <code className="text-[10px] opacity-90">city</code>,{" "}
        <code className="text-[10px] opacity-90">state</code>, <code className="text-[10px] opacity-90">notes</code>, optional{" "}
        <code className="text-[10px] opacity-90">lead_tags</code> (merged with required tags), optional{" "}
        <code className="text-[10px] opacity-90">status</code> (legacy e.g. <code className="text-[10px] opacity-90">follow_up</code>{" "}
        → contacted). Client <code className="text-[10px] opacity-90">source</code> fields are ignored — server sets{" "}
        <code className="text-[10px] opacity-90">manual_pick</code>. Rows are stored as{" "}
        <code className="text-[10px] opacity-90">source: manual_pick</code> with tags{" "}
        <code className="text-[10px] opacity-90">manual_pick</code>, <code className="text-[10px] opacity-90">priority_list</code>.
      </p>
      <textarea
        className="w-full min-h-[140px] rounded-lg border px-3 py-2 text-xs font-mono"
        style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.25)", color: "var(--admin-fg)" }}
        placeholder={EXAMPLE}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button type="button" className="admin-btn-primary text-sm" disabled={busy} onClick={() => void submit()}>
          {busy ? "Importing…" : "Import Top Picks"}
        </button>
        <button
          type="button"
          className="admin-btn-ghost text-xs"
          onClick={() => setRaw(EXAMPLE)}
        >
          Load example
        </button>
      </div>
      {message ? (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
