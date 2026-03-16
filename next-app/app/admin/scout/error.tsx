"use client";

import { useEffect } from "react";

export default function AdminScoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Scout Error Boundary] unhandled scout page error", error);
  }, [error]);

  return (
    <section className="admin-card space-y-3">
      <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
        Scout page recovered from an error
      </h2>
      <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
        Scout data failed to render fully. Retry to reload the Scout page without breaking the admin shell.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="admin-btn-primary" onClick={reset}>
          Retry Scout Load
        </button>
        <a href="/admin" className="admin-btn-ghost">
          Open Dashboard
        </a>
      </div>
    </section>
  );
}
