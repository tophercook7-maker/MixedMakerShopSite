import Link from "next/link";
import { FileSearch, Lightbulb, Mail } from "lucide-react";

export default function AdminCasesPage() {
  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex items-center gap-2 mb-2">
          <FileSearch className="h-5 w-5" style={{ color: "var(--admin-gold)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Cases
          </h1>
        </div>
        <p style={{ color: "var(--admin-muted)" }}>
          Case dossiers will be powered by Scout-Brain `case_files` and surfaced inside this CRM shell.
        </p>
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
          Safe migration plan
        </h2>
        <ul className="space-y-2 text-sm" style={{ color: "var(--admin-muted)" }}>
          <li>- Keep Scout-Brain as source of truth for case intelligence.</li>
          <li>- Render cases natively in this admin without changing the Scout backend contract.</li>
          <li>- Link lead {"->"} case {"->"} outreach in a single private operator flow.</li>
        </ul>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href="/admin/leads" className="admin-btn-ghost inline-flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            View Leads
          </Link>
          <Link href="/admin/outreach" className="admin-btn-ghost inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            View Outreach
          </Link>
        </div>
      </section>
    </div>
  );
}
