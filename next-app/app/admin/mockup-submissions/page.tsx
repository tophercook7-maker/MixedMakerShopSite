import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  email: string;
  status: string;
  source: string;
  created_at: string;
};

export default async function AdminMockupSubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view mockup submissions.
        </p>
      </section>
    );
  }

  const { data: rows, error } = await supabase
    .from("mockup_submissions")
    .select("id, email, status, source, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin mockup-submissions] list failed", error.message);
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "#f87171" }}>
          Could not load submissions.
        </p>
      </section>
    );
  }

  const list = (rows || []) as Row[];

  return (
    <section className="admin-card">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
            Free mockup submissions
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Newest first. Open a row to inspect saved mockup data.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[rgba(201,97,44,0.2)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(201,97,44,0.15)]" style={{ color: "var(--admin-muted)" }}>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center" style={{ color: "var(--admin-muted)" }}>
                  No submissions yet.
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(201,97,44,0.06)]"
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Link
                      href={`/admin/mockup-submissions/${encodeURIComponent(r.id)}`}
                      className="text-[var(--admin-gold)] hover:underline"
                    >
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/mockup-submissions/${encodeURIComponent(r.id)}`}
                      className="hover:text-[var(--admin-gold)] hover:underline"
                    >
                      {r.email}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
