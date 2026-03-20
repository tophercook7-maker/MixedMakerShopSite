import Link from "next/link";

const steps = [
  "Scout (or API) finds priority-category lead: no real website or Facebook-only, with phone or email.",
  "Create lead → row in public.leads; duplicate retry does not insert again.",
  "Leads UI → segment New shows the lead.",
  "Mark Contacted or Log message sent → status contacted, follow-up scheduled (+2 days).",
  "Follow-up due segment shows contacted leads with next_follow_up_at (pending).",
  "Mark replied → Replies waiting segment.",
  "Won or Archive → out of active queues.",
];

export default function CrmE2EDevPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="admin-card">
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--admin-fg)" }}>
          CRM E2E checklist (dev)
        </h1>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Static checklist. Full notes: <code>docs/CRM_SIMPLE_MACHINE.md</code>.{" "}
          <Link href="/admin/leads" className="text-[var(--admin-gold)] underline">
            Open Leads
          </Link>
        </p>
      </section>
      <ol className="list-decimal pl-5 space-y-2 text-sm" style={{ color: "var(--admin-fg)" }}>
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
