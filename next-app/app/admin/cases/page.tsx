import Link from "next/link";
import { FileSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";

type CaseSearchParams = {
  audited?: string;
  filter?: string;
  date?: string;
};

type CaseRow = {
  id: string;
  opportunity_id: string | null;
  website_score: number | null;
  audit_issues: string[] | null;
  status: string | null;
  created_at: string | null;
  email: string | null;
  contact_page: string | null;
  phone_from_site: string | null;
  opportunity?: {
    id?: string;
    business_name?: string;
    category?: string;
    website?: string;
    opportunity_score?: number;
    opportunity_reason?: string | null;
  } | null;
};

type MappedCaseRow = {
  id: string;
  opportunity_id: string;
  business_name: string;
  category: string;
  website: string;
  score: number;
  opportunity_reason: string;
  lane: string;
  website_speed: number | null | undefined;
  mobile_ready: boolean | null | undefined;
  website_score: number | null | undefined;
  audit_issues_count: number;
  has_audit: boolean;
  status: string;
  linked_lead_id: string | null;
};

export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams: Promise<CaseSearchParams>;
}) {
  const { audited, filter, date } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view cases.
        </p>
      </section>
    );
  }
  const workspaceId = String(process.env.SCOUT_BRAIN_WORKSPACE_ID || "").trim();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  console.info("[Admin Cases] navigating to detail page with filters", {
    audited: audited || null,
    filter: filter || null,
    date: date || null,
  });

  let casesQuery = supabase
    .from("case_files")
    .select(`
      id,
      opportunity_id,
      website_score,
      audit_issues,
      status,
      created_at,
      email,
      contact_page,
      phone_from_site,
      opportunity:opportunities(id, business_name, category, website, opportunity_score, opportunity_reason)
    `)
    .order("created_at", { ascending: false })
    .limit(500);
  if (workspaceId) {
    casesQuery = casesQuery.eq("workspace_id", workspaceId);
  }
  if (date === "today") {
    casesQuery = casesQuery.gte("created_at", dayStart);
  }
  const { data: caseRows } = await casesQuery;
  const rows = ((caseRows || []) as unknown[]) as CaseRow[];
  const oppIds = rows
    .map((row) => String(row.opportunity_id || "").trim())
    .filter((id): id is string => Boolean(id));
  const rowsNeedingFallback = rows.filter((row) => !row.opportunity || !row.opportunity.business_name);
  const fallbackOppIds = rowsNeedingFallback
    .map((row) => String(row.opportunity_id || "").trim())
    .filter((id): id is string => Boolean(id));
  const { data: opportunities } = fallbackOppIds.length
    ? await (async () => {
        let oppQuery = supabase
          .from("opportunities")
          .select("id,business_name,category,website,opportunity_score,opportunity_reason,lane,no_website,website_speed,mobile_ready")
          .in("id", fallbackOppIds);
        if (workspaceId) {
          oppQuery = oppQuery.eq("workspace_id", workspaceId);
        }
        return oppQuery;
      })()
    : { data: [] as Record<string, unknown>[] };
  const oppById = new Map((opportunities || []).map((row) => [String(row.id || ""), row]));
  const { data: linkedLeadRows } = oppIds.length
    ? await supabase
        .from("leads")
        .select("id,linked_opportunity_id")
        .eq("owner_id", ownerId)
        .in("linked_opportunity_id", oppIds)
    : { data: [] as Array<{ id: string; linked_opportunity_id?: string | null }> };
  const leadByOppId = new Map<string, string>(
    (linkedLeadRows || [])
      .map((row): [string, string] => [String(row.linked_opportunity_id || "").trim(), String(row.id || "").trim()])
      .filter(([opp, leadId]) => Boolean(opp) && Boolean(leadId))
  );
  const missingJoinCount = rowsNeedingFallback.length;
  if (missingJoinCount > 0) {
    console.warn("[Admin Cases] case_files -> opportunities join missing rows", {
      missingJoinCount,
      fallbackFetched: (opportunities || []).length,
    });
  }

  let mapped: MappedCaseRow[] = rows.map((row) => {
    const joinedOpp = row.opportunity as Record<string, unknown> | null | undefined;
    const opp = joinedOpp || oppById.get(String(row.opportunity_id || "").trim());
    const auditIssues = Array.isArray(row.audit_issues) ? row.audit_issues : [];
    const hasAudit = row.website_score != null || auditIssues.length > 0;
    return {
      id: String(row.id || ""),
      opportunity_id: String(row.opportunity_id || ""),
      business_name: String(opp?.business_name || "Unknown business"),
      category: String(opp?.category || "—"),
      website: String(opp?.website || ""),
      score: Number(opp?.opportunity_score ?? 0),
      opportunity_reason: String(opp?.opportunity_reason || "Website pain signal detected"),
      lane: String(opp?.lane || (opp?.no_website ? "no_website" : "weak_website")),
      website_speed: opp?.website_speed as number | null | undefined,
      mobile_ready: opp?.mobile_ready as boolean | null | undefined,
      website_score: row.website_score as number | null | undefined,
      audit_issues_count: auditIssues.length,
      has_audit: hasAudit,
      status: String(row.status || "New"),
      linked_lead_id: leadByOppId.get(String(row.opportunity_id || "").trim()) || null,
    };
  });

  if (audited === "true") {
    mapped = mapped.filter((row) => row.has_audit);
  }
  if (filter === "top") {
    mapped = mapped
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, 100);
  } else {
    mapped = mapped.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  }

  console.info("[Admin Cases] detail query returned X rows", mapped.length);

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
          Case dossiers are sourced from Scout-Brain `case_files` and linked opportunities.
        </p>
        <div className="mt-3">
          <BackfillLeadsButton />
        </div>
      </section>

      {mapped.length === 0 ? (
        <section className="admin-card">
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">
              {audited === "true" ? "No audited case files found" : "No case files found"}
            </div>
            <div className="admin-empty-desc">
              {date === "today"
                ? "No scout case files found for today."
                : "Run Scout and open dossiers to populate cases."}
            </div>
          </div>
        </section>
      ) : (
        <section className="admin-card">
          <div className="admin-table-wrap overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Website</th>
                  <th>Score</th>
                  <th>Lane</th>
                  <th>Opportunity Reason</th>
                  <th>Website Audit</th>
                  <th>Status</th>
                  <th>Quick Open</th>
                </tr>
              </thead>
              <tbody>
                {mapped.map((row) => (
                  <tr key={row.id}>
                    <td>{row.business_name}</td>
                    <td>{row.category}</td>
                    <td>
                      {row.website ? (
                        <a href={row.website} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline text-xs">
                          Open Site
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{row.score || "—"}</td>
                    <td>{row.lane.replace("_", " ")}</td>
                    <td>{row.opportunity_reason || "—"}</td>
                    <td>{row.has_audit ? `audited (${row.audit_issues_count} issues)` : "not audited"}</td>
                    <td>{row.status.replace("_", " ")}</td>
                    <td>
                      {row.linked_lead_id ? (
                        <Link
                          href={`/admin/leads/${encodeURIComponent(row.linked_lead_id)}`}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                        >
                          Open Lead
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/leads?source=scout-brain&sort=score_desc`}
                          className="text-[var(--admin-gold)] hover:underline text-xs"
                        >
                          Open Leads
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
