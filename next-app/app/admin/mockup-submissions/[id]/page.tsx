import Link from "next/link";
import { notFound } from "next/navigation";
import { MockupSubmissionStatusSelect } from "@/components/admin/mockup-submission-status-select";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  email: string;
  mockup_data: Record<string, unknown> | null;
  notes: string | null;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
};

export default async function AdminMockupSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submissionId = String(id || "").trim();
  if (!submissionId) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view this submission.
        </p>
      </section>
    );
  }

  const { data: row, error } = await supabase
    .from("mockup_submissions")
    .select("id, email, mockup_data, notes, status, source, created_at, updated_at")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) {
    console.error("[admin mockup-submissions] detail failed", error.message);
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "#f87171" }}>
          Could not load submission.
        </p>
      </section>
    );
  }

  if (!row) notFound();

  const r = row as Row;
  const json = JSON.stringify(r.mockup_data ?? {}, null, 2);

  return (
    <section className="admin-card">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/mockup-submissions"
            className="text-xs hover:text-[var(--admin-gold)]"
            style={{ color: "var(--admin-muted)" }}
          >
            ← All mockup submissions
          </Link>
          <h1 className="text-lg font-semibold mt-3" style={{ color: "var(--admin-fg)" }}>
            {r.email}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            <span className="mr-3">Created {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</span>
            <span>Updated {r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}</span>
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Source: {r.source}
          </p>
        </div>
        <MockupSubmissionStatusSelect submissionId={r.id} initialStatus={r.status} />
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Visitor notes
        </h2>
        {r.notes?.trim() ? (
          <p className="text-sm whitespace-pre-wrap rounded-lg border border-[rgba(212,175,55,0.2)] p-3 bg-[rgba(0,0,0,0.2)]">
            {r.notes}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            None
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Mockup data (JSON)
        </h2>
        <pre
          className="text-xs overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-[rgba(212,175,55,0.2)] p-4 bg-[rgba(0,0,0,0.35)]"
          style={{ color: "var(--admin-muted)" }}
        >
          {json}
        </pre>
      </div>
    </section>
  );
}
