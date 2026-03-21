import { Suspense } from "react";
import Link from "next/link";
import { QuickAddClient } from "./quick-add-client";

export const dynamic = "force-dynamic";

export default function QuickAddToolPage() {
  return (
    <div className="space-y-6">
      <p>
        <Link href="/admin/today" className="text-sm text-[var(--admin-gold)] hover:underline">
          ← Back to Today
        </Link>
      </p>
      <Suspense fallback={<p className="text-sm" style={{ color: "var(--admin-muted)" }}>Loading…</p>}>
        <QuickAddClient />
      </Suspense>
    </div>
  );
}
