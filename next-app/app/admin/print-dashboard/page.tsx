import { createClient } from "@/lib/supabase/server";
import { PrintDashboardView } from "@/components/admin/crm/print-dashboard-view";
import { isMissingColumnError } from "@/lib/crm/workflow-lead-mapper";
import {
  computePrintDashboardStats,
  filterPrintDashboardLeads,
  type LeadActivityRow,
  type PrintDashboardLead,
} from "@/lib/crm/print-dashboard-metrics";
import { isLeadActivitiesUnavailable } from "@/lib/lead-activity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SELECT_FULL =
  "id,business_name,contact_name,primary_contact_name,created_at,last_contacted_at,last_reply_at,last_response_at,last_updated_at,print_pipeline_status,price_charged,filament_cost,quoted_amount,deposit_amount,final_amount,payment_request_type,payment_method,payment_link,payment_status,paid_at,source,lead_source,category,lead_tags";

const SELECT_FALLBACK =
  "id,business_name,contact_name,primary_contact_name,created_at,last_contacted_at,last_reply_at,last_response_at,print_pipeline_status,price_charged,filament_cost,source,lead_source,category,lead_tags";

const SOURCE_OR =
  "lead_source.in.(3d_printing,print_quote,print_request),source.in.(3d_printing,print_quote,print_request),category.eq.print_request";

function mergeLeadRows(map: Map<string, PrintDashboardLead>, rows: unknown[] | null) {
  for (const row of rows || []) {
    const r = row as PrintDashboardLead;
    if (r?.id) map.set(String(r.id), r);
  }
}

async function fetchLeadsMerged(ownerId: string, selectClause: string): Promise<PrintDashboardLead[]> {
  const supabase = await createClient();
  const map = new Map<string, PrintDashboardLead>();

  const { data: a, error: e1 } = await supabase
    .from("leads")
    .select(selectClause)
    .eq("owner_id", ownerId)
    .or(SOURCE_OR)
    .order("created_at", { ascending: false });
  if (e1) throw e1;
  mergeLeadRows(map, a);

  const { data: b, error: e2 } = await supabase
    .from("leads")
    .select(selectClause)
    .eq("owner_id", ownerId)
    .contains("lead_tags", ["3d_printing"])
    .order("created_at", { ascending: false });
  if (e2) throw e2;
  mergeLeadRows(map, b);

  const { data: c, error: e3 } = await supabase
    .from("leads")
    .select(selectClause)
    .eq("owner_id", ownerId)
    .contains("lead_tags", ["print_quote"])
    .order("created_at", { ascending: false });
  if (e3) throw e3;
  mergeLeadRows(map, c);

  const { data: d, error: e4 } = await supabase
    .from("leads")
    .select(selectClause)
    .eq("owner_id", ownerId)
    .contains("lead_tags", ["print_request"])
    .order("created_at", { ascending: false });
  if (e4) throw e4;
  mergeLeadRows(map, d);

  return Array.from(map.values());
}

async function loadPrintLeadsForOwner(ownerId: string): Promise<PrintDashboardLead[]> {
  for (const selectClause of [SELECT_FULL, SELECT_FALLBACK]) {
    try {
      const rows = await fetchLeadsMerged(ownerId, selectClause);
      return filterPrintDashboardLeads(rows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isMissingColumnError(msg)) continue;
      console.warn("[print-dashboard] leads load failed", msg);
      break;
    }
  }

  const supabase = await createClient();
  const { data: fallback } = await supabase
    .from("leads")
    .select(SELECT_FALLBACK)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(2500);
  return filterPrintDashboardLeads((fallback || []) as PrintDashboardLead[]);
}

async function loadActivitiesForLeads(leadIds: string[]): Promise<LeadActivityRow[]> {
  if (leadIds.length === 0) return [];
  const supabase = await createClient();
  const since = new Date(Date.now() - 120 * 86400000).toISOString();
  const out: LeadActivityRow[] = [];
  const chunk = 80;
  for (let i = 0; i < leadIds.length; i += chunk) {
    const slice = leadIds.slice(i, i + chunk);
    const { data, error } = await supabase
      .from("lead_activities")
      .select("lead_id, metadata, created_at")
      .eq("type", "lead_status_changed")
      .gte("created_at", since)
      .in("lead_id", slice);
    if (error) {
      if (isLeadActivitiesUnavailable(error)) return [];
      console.warn("[print-dashboard] activities", error.message);
      continue;
    }
    for (const row of data || []) {
      out.push({
        lead_id: String((row as { lead_id: string }).lead_id),
        metadata: (row as { metadata: unknown }).metadata,
        created_at: String((row as { created_at: string }).created_at),
      });
    }
  }
  return out;
}

export default async function AdminPrintDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view the print dashboard.
        </p>
      </section>
    );
  }

  const leads = await loadPrintLeadsForOwner(ownerId);
  const activities = await loadActivitiesForLeads(leads.map((l) => String(l.id)));
  const stats = computePrintDashboardStats({ leads, activities });

  return (
    <PrintDashboardView
      daily={stats.daily}
      money={stats.money}
      pipeline={stats.pipeline}
      payment={stats.payment}
      unpaidMoney={stats.unpaidMoney}
      attention={stats.attention}
      printLeadCount={leads.length}
    />
  );
}
