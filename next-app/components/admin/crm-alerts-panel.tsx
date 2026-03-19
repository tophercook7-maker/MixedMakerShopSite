"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AlertItem = {
  id: string;
  kind: string;
  title: string;
  detail?: string;
  href?: string;
};

export function CrmAlertsPanel() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [scaffold, setScaffold] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/crm/alerts", { cache: "no-store" });
        const body = (await res.json().catch(() => ({}))) as {
          items?: AlertItem[];
          scaffold?: { inbound_email?: string };
          error?: string;
        };
        if (!res.ok) {
          if (!cancelled) setError(body.error || "Could not load alerts.");
          return;
        }
        if (!cancelled) {
          setItems(Array.isArray(body.items) ? body.items : []);
          setScaffold(body.scaffold?.inbound_email || null);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Could not load alerts.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="admin-card space-y-3">
      <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
        Alerts & signals
      </h2>
      <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
        Replies, follow-ups due, failed sends, and future inbox hooks.
      </p>
      {error ? (
        <p className="text-sm" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
      {items.length === 0 && !error ? (
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          No active alerts right now.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.15)" }}
            >
              <div className="font-medium" style={{ color: "var(--admin-fg)" }}>
                {item.title}
                <span className="ml-2 text-xs uppercase opacity-70">({item.kind})</span>
              </div>
              {item.detail ? (
                <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
                  {item.detail}
                </p>
              ) : null}
              {item.href ? (
                <Link href={item.href} className="text-xs font-semibold mt-1 inline-block" style={{ color: "var(--admin-gold)" }}>
                  Open lead →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {scaffold ? (
        <p className="text-xs border-t pt-2 mt-2" style={{ color: "var(--admin-muted)", borderColor: "var(--admin-border)" }}>
          {scaffold}
        </p>
      ) : null}
    </section>
  );
}
