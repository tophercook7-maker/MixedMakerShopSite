import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintLeadDetailView } from "@/components/admin/crm/print-lead-detail-view";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";
import { printCashAppDisplayLineFromEnv, printCashAppPaymentUrlFromEnv } from "@/lib/crm/print-cashapp-config";
import { printLaborBaseRateUsdPerHourFromEnv } from "@/lib/crm/print-labor-pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function numericLeadField(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function defaultFilamentCostPerKgFromEnv(): number {
  const raw =
    process.env.DEFAULT_FILAMENT_COST_PER_KG?.trim() ||
    process.env.NEXT_PUBLIC_DEFAULT_FILAMENT_COST_PER_KG?.trim();
  const n = Number.parseFloat(String(raw ?? ""));
  return Number.isFinite(n) && n >= 0 ? n : 22;
}

type LeadRow = Record<string, unknown>;

export default async function AdminCrmPrintLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string; session_id?: string }>;
}) {
  const { id } = await params;
  const { payment, session_id } = await searchParams;
  const leadId = String(id || "").trim();
  if (!leadId) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to open print jobs.
        </p>
      </section>
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !lead) notFound();

  const row = lead as LeadRow;
  if (!isThreeDPrintLead(row)) {
    redirect(`/admin/crm/web/${encodeURIComponent(leadId)}`);
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/crm/print" className="admin-btn-ghost text-sm">
        ← 3D print CRM
      </Link>
      <PrintLeadDetailView
        leadId={leadId}
        contactName={(row.contact_name as string) ?? null}
        businessName={(row.business_name as string) ?? null}
        email={(row.email as string) ?? null}
        phone={(row.phone as string) ?? null}
        printPipelineStatus={(row.print_pipeline_status as string) ?? null}
        printTags={(row.print_tags as string[]) ?? null}
        estimateRange={(row.print_estimate_summary as string) ?? null}
        notes={(row.notes as string) ?? null}
        scoreBreakdown={(row.score_breakdown as Record<string, unknown>) ?? null}
        printRequestSummary={(row.print_request_summary as string) ?? null}
        attachmentUrl={(row.print_attachment_url as string) ?? null}
        printDimensions={(row.print_dimensions as string) ?? null}
        printQuantity={(row.print_quantity as string) ?? null}
        printDeadline={(row.print_deadline as string) ?? null}
        designHelpRequested={(row.print_design_help_requested as boolean) ?? null}
        printRequestType={(row.print_request_type as string) ?? null}
        printMaterial={(row.print_material as string) ?? null}
        createdAt={(row.created_at as string) ?? null}
        lastContactedAt={(row.last_contacted_at as string) ?? null}
        lastResponseAt={(row.last_response_at as string) ?? null}
        priceCharged={numericLeadField(row.price_charged)}
        filamentCost={numericLeadField(row.filament_cost)}
        filamentGramsUsed={numericLeadField(row.filament_grams_used)}
        filamentCostPerKg={numericLeadField(row.filament_cost_per_kg)}
        filamentUseWeightCalc={row.filament_use_weight_calc !== false}
        defaultFilamentCostPerKg={defaultFilamentCostPerKgFromEnv()}
        estimatedTimeHours={numericLeadField(row.estimated_time_hours)}
        quotedAmount={numericLeadField(row.quoted_amount)}
        depositAmount={numericLeadField(row.deposit_amount)}
        finalAmount={numericLeadField(row.final_amount)}
        paymentRequestType={(row.payment_request_type as string) ?? null}
        paymentStatus={(row.payment_status as string) ?? null}
        paymentMethod={(row.payment_method as string) ?? null}
        paymentLink={(row.payment_link as string) ?? null}
        paidAt={(row.paid_at as string) ?? null}
        printTimerStartedAt={(row.print_timer_started_at as string) ?? null}
        printTimerRunning={(row.print_timer_running as boolean) ?? null}
        printTrackedMinutes={numericLeadField(row.print_tracked_minutes)}
        printManualTimeMinutes={numericLeadField(row.print_manual_time_minutes)}
        printLaborLevel={(row.print_labor_level as string) ?? null}
        printLaborCost={numericLeadField(row.print_labor_cost)}
        laborRateUsdPerHour={printLaborBaseRateUsdPerHourFromEnv()}
        cashAppPaymentUrl={printCashAppPaymentUrlFromEnv()}
        cashAppDisplayLine={printCashAppDisplayLineFromEnv()}
        stripePaymentReturn={payment === "success" || payment === "cancel" ? payment : null}
        stripeCheckoutSessionId={typeof session_id === "string" ? session_id : null}
      />
    </div>
  );
}
