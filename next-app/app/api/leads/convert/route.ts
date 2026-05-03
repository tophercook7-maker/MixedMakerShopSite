import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { buildLeadSummary, deriveLeadPriority, displayLeadSourceLabel } from "@/lib/crm/lead-display";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function clean(value: unknown): string {
  return String(value || "").trim();
}

function completedChecklistCount(scoreBreakdown: Record<string, unknown>): { completed: number; total: number; labels: string[] } {
  const checklist = asRecord(scoreBreakdown.follow_up_checklist);
  const labels = Object.keys(checklist);
  return {
    completed: labels.filter((label) => checklist[label] === true).length,
    total: labels.length,
    labels: labels.filter((label) => checklist[label] === true),
  };
}

function resolveProjectPrice(lead: Record<string, unknown>): number | undefined {
  for (const key of ["quoted_amount", "final_amount", "price_charged", "deal_value"]) {
    const value = Number(lead[key]);
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return undefined;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const leadId = body.leadId as string | undefined;
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const supabase = await createClient();
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("owner_id", user.id)
    .single();
  if (leadErr || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const leadRecord = lead as Record<string, unknown>;
  const scoreBreakdown = asRecord(leadRecord.score_breakdown);
  const existingProjectId = clean(scoreBreakdown.converted_project_id);
  if (existingProjectId) {
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id,name")
      .eq("owner_id", user.id)
      .eq("id", existingProjectId)
      .maybeSingle();
    if (existingProject) {
      return NextResponse.json({ project: existingProject, leadId, alreadyConverted: true });
    }
  }

  const summary = buildLeadSummary(leadRecord);
  const priority = deriveLeadPriority(leadRecord);
  const source = displayLeadSourceLabel(leadRecord);
  const customerName = clean(leadRecord.contact_name) || clean(leadRecord.business_name) || clean(leadRecord.email) || "Unknown customer";
  const businessName = clean(leadRecord.business_name) || customerName;
  const email = clean(leadRecord.email);
  const phone = clean(leadRecord.phone);
  const checklist = completedChecklistCount(scoreBreakdown);
  const convertedAt = new Date().toISOString();
  const internalNote = `[${convertedAt}] Converted to project.`;
  const previousNotes = clean(leadRecord.notes);
  const projectNotes = [
    `Converted from lead: ${leadId}`,
    `Converted at: ${convertedAt}`,
    "",
    `Customer name: ${customerName}`,
    `Email: ${email || "Not provided"}`,
    `Phone: ${phone || "Not provided"}`,
    `Project type: ${summary.projectType}`,
    `Budget range: ${summary.budgetRange}`,
    `Timeline: ${summary.timeline}`,
    `Source: ${source}`,
    `Priority: ${priority.label}${priority.isManual ? " (manual)" : ""}`,
    `Follow-up checklist: ${checklist.total ? `${checklist.completed} of ${checklist.total} steps complete` : "0 of 8 steps complete"}`,
    checklist.labels.length ? `Completed checklist items: ${checklist.labels.join(", ")}` : "Completed checklist items: None",
    "",
    "Project details:",
    previousNotes || "Not provided",
  ].join("\n");

  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .insert({
      business_name: businessName,
      contact_name: customerName,
      email: email || null,
      phone: phone || null,
      website: clean(leadRecord.website) || null,
      notes: previousNotes || null,
      owner_id: user.id,
    })
    .select()
    .single();
  if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 500 });

  const { data: project, error: projectErr } = await supabase
    .from("projects")
    .insert({
      client_id: client.id,
      name: `${summary.projectType} - ${customerName}`.slice(0, 200),
      status: "draft",
      price: resolveProjectPrice(leadRecord),
      estimated_price: resolveProjectPrice(leadRecord),
      amount_paid: 0,
      payment_status: "not_requested",
      notes: projectNotes.slice(0, 5000),
      internal_notes: projectNotes.slice(0, 5000),
      owner_id: user.id,
    })
    .select()
    .single();
  if (projectErr) return NextResponse.json({ error: projectErr.message }, { status: 500 });

  const nextScoreBreakdown = {
    ...scoreBreakdown,
    converted_project_id: project.id,
    converted_project_at: convertedAt,
  };
  const nextNotes = previousNotes ? `${internalNote}\n\n${previousNotes}` : internalNote;

  const { error: leadUpdateErr } = await supabase
    .from("leads")
    .update({
      deal_status: "converted",
      notes: nextNotes.slice(0, 5000),
      score_breakdown: nextScoreBreakdown,
      last_updated_at: convertedAt,
    })
    .eq("id", leadId)
    .eq("owner_id", user.id);
  if (leadUpdateErr) return NextResponse.json({ error: leadUpdateErr.message }, { status: 500 });

  return NextResponse.json({ client, project, leadId, alreadyConverted: false });
}
