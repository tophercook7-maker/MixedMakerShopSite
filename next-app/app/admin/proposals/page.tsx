import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildLeadPath } from "@/lib/lead-route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProposalRow = {
  id: string;
  lead_id: string | null;
  proposal_link: string | null;
  proposal_amount: number | null;
  proposal_status: string | null;
  proposal_sent_at: string | null;
  proposal_follow_up_at?: string | null;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  leads: { business_name: string | null } | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  negotiating: "Negotiating",
  accepted: "Accepted",
  declined: "Declined",
};

export default async function AdminProposalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view proposals.
        </p>
      </section>
    );
  }

  let rows: ProposalRow[] = [];
  try {
    const { data, error } = await supabase
      .from("crm_proposals")
      .select("id,lead_id,proposal_link,proposal_amount,proposal_status,proposal_sent_at,proposal_follow_up_at,notes,updated_at, leads(business_name)")
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const rawRows = data ?? [];
    const normalizedRows: ProposalRow[] = rawRows.map(({ leads, ...rest }) => ({
      ...rest,
      leads: Array.isArray(leads) ? leads[0] ?? null : leads ?? null,
    }));
    rows = normalizedRows;
  } catch (e) {
    console.error("[Proposals Page] load failed", e);
    return (
      <section className="admin-card">
        <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Proposals unavailable
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
          Run the latest Supabase migration (crm_proposals) or retry shortly.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--admin-fg)" }}>
          Proposals
        </h1>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Track links, amounts, and follow-ups. Create or update records from the lead detail page via API when you wire forms.
        </p>
        <p className="text-sm mt-3">
          <Link href="/admin/leads" className="font-semibold text-[var(--admin-gold)] hover:underline">
            ← Back to Leads
          </Link>
        </p>
      </section>

      {!rows.length ? (
        <section className="admin-card admin-empty !py-10">
          <div className="admin-empty-title">No proposals yet</div>
          <div className="admin-empty-desc">POST to /api/crm/proposals with lead_id to add one, or add a form here next.</div>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((p) => {
            const name = String(p.leads?.business_name || "Lead").trim();
            return (
              <article key={p.id} className="admin-card flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={buildLeadPath(p.lead_id, name)}
                      className="text-lg font-semibold text-[var(--admin-gold)] hover:underline"
                    >
                      {name}
                    </Link>
                    <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
                      {(p.proposal_status && STATUS_LABEL[p.proposal_status]) || p.proposal_status || "—"}
                    </p>
                  </div>
                  {p.proposal_amount != null && (
                    <span className="text-sm font-bold whitespace-nowrap" style={{ color: "var(--admin-fg)" }}>
                      ${Number(p.proposal_amount).toLocaleString()}
                    </span>
                  )}
                </div>
                {p.proposal_link ? (
                  <a
                    href={p.proposal_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm break-all text-[var(--admin-gold)] hover:underline"
                  >
                    {p.proposal_link}
                  </a>
                ) : (
                  <span className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    No link
                  </span>
                )}
                <div className="text-xs space-y-0.5" style={{ color: "var(--admin-muted)" }}>
                  {p.proposal_sent_at && <div>Sent: {new Date(p.proposal_sent_at).toLocaleString()}</div>}
                  {p.proposal_follow_up_at && (
                    <div>Follow-up: {new Date(p.proposal_follow_up_at).toLocaleDateString()}</div>
                  )}
                  {p.notes && <div className="mt-2 text-[var(--admin-fg)]">{p.notes}</div>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
