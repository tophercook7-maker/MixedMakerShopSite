import { NotebookPen } from "lucide-react";

export default function AdminNotesPage() {
  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex items-center gap-2 mb-2">
          <NotebookPen className="h-5 w-5" style={{ color: "var(--admin-gold)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Notes
          </h1>
        </div>
        <p style={{ color: "var(--admin-muted)" }}>
          Unified operator notes will live here so every lead, case, and outreach action shares one trail.
        </p>
      </section>

      <section className="admin-card">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Planned schema
        </h2>
        <ul className="space-y-2 text-sm" style={{ color: "var(--admin-muted)" }}>
          <li>- `notes` records scoped to owner/workspace.</li>
          <li>- `entity_type` + `entity_id` so notes attach to leads, cases, or outreach entries.</li>
          <li>- Timestamps and author tracking for audit history.</li>
        </ul>
      </section>
    </div>
  );
}
