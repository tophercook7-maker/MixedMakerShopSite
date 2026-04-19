import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProspectingRunsPlaceholderPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/admin/crm/web" className="admin-btn-ghost text-sm">
        ← Web CRM
      </Link>
      <section className="admin-card p-6 space-y-2">
        <h1 className="text-xl font-semibold" style={{ color: "var(--admin-fg)" }}>
          Prospecting runs
        </h1>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Placeholder for batch Google search / Maps capture tracking. Hook ingestion and run history here when the
          pipeline is ready — leads will reference <code className="text-xs">capture_run_id</code> and{" "}
          <code className="text-xs">source_query</code>.
        </p>
      </section>
    </div>
  );
}
