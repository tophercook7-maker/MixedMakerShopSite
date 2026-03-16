"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error Boundary] unhandled admin error", error);
  }, [error]);

  return (
    <section className="admin-card space-y-3">
      <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
        Admin recovered from an error
      </h2>
      <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
        The admin shell is still running. Some data failed to load, but you can retry without leaving the page.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="admin-btn-primary" onClick={reset}>
          Retry Admin View
        </button>
        <a href="/admin" className="admin-btn-ghost">
          Back to Dashboard
        </a>
      </div>
    </section>
  );
}
