import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildLeadAssessment } from "@/lib/lead-assessment";

type OpportunityRow = {
  id: string;
  workspace_id?: string | null;
  business_name?: string | null;
  category?: string | null;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  opportunity_score?: number | null;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
};

type CaseRow = {
  id?: string | null;
  email?: string | null;
  phone_from_site?: string | null;
  contact_page?: string | null;
  contact_form_url?: string | null;
  facebook_url?: string | null;
  facebook?: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
};

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const opportunityId = String(params.id || "").trim();
  if (!opportunityId) {
    return NextResponse.json({ error: "Opportunity id is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existingRows } = await supabase
    .from("leads")
    .select("id,business_name")
    .eq("owner_id", ownerId)
    .eq("linked_opportunity_id", opportunityId)
    .limit(1);
  const existingLead = (existingRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  const { data: existingCaseRows } = await supabase
    .from("case_files")
    .select("id,created_at")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1);
  const existingCaseId = String((existingCaseRows || [])[0]?.id || "").trim() || null;
  if (existingLead?.id) {
    return NextResponse.json({
      ok: true,
      created: false,
      lead_id: String(existingLead.id),
      case_id: existingCaseId,
      business_name: String(existingLead.business_name || ""),
      message: "Lead already exists for this opportunity.",
    });
  }

  const { data: oppRows, error: oppError } = await supabase
    .from("opportunities")
    .select(
      "id,workspace_id,business_name,category,city,address,website,opportunity_score,opportunity_reason,opportunity_signals"
    )
    .eq("id", opportunityId)
    .limit(1);
  if (oppError) {
    return NextResponse.json({ error: oppError.message }, { status: 500 });
  }
  const opp = ((oppRows || [])[0] as OpportunityRow | undefined) || null;
  if (!opp) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  const { data: caseRows } = await supabase
    .from("case_files")
    .select(
      "id,email,phone_from_site,contact_page,contact_form_url,facebook_url,facebook,audit_issues,strongest_problems,created_at"
    )
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1);
  const caseRow = ((caseRows || [])[0] as CaseRow | undefined) || null;

  const issueList = [
    ...(Array.isArray(opp.opportunity_signals) ? opp.opportunity_signals : []),
    ...(Array.isArray(caseRow?.audit_issues) ? caseRow?.audit_issues || [] : []),
    ...(Array.isArray(caseRow?.strongest_problems) ? caseRow?.strongest_problems || [] : []),
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  const reason = String(opp.opportunity_reason || "").trim();
  const assessment = buildLeadAssessment({
    website: String(opp.website || "").trim() || null,
    opportunity_score: opp.opportunity_score ?? null,
    category: String(opp.category || "").trim() || null,
    issue_summary: reason || null,
    issue_list: issueList,
    email: String(caseRow?.email || "").trim() || null,
    phone: String(caseRow?.phone_from_site || "").trim() || null,
    contact_page: String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim() || null,
    facebook_url: String(caseRow?.facebook_url || caseRow?.facebook || "").trim() || null,
    lead_status: "new",
  });

  const insertPayload = {
    owner_id: ownerId,
    workspace_id: String(opp.workspace_id || "").trim() || null,
    linked_opportunity_id: opp.id,
    business_name: String(opp.business_name || "").trim() || "Unknown business",
    contact_name: null,
    email: String(caseRow?.email || "").trim() || null,
    phone: String(caseRow?.phone_from_site || "").trim() || null,
    website: String(opp.website || "").trim() || null,
    industry: String(opp.category || "").trim() || null,
    lead_source: "scout-brain",
    address: String(opp.address || "").trim() || null,
    best_contact_method: assessment.best_contact_method || null,
    opportunity_score: Number(opp.opportunity_score ?? 0),
    auto_intake: true,
    status: "new",
    notes: `Created from Top Opportunities. Why this lead is here: ${assessment.why_this_lead_is_here}. Problem: ${
      assessment.primary_problem
    }. Opportunity reason: ${reason || assessment.primary_problem}.`,
  };

  const { data: insertedRows, error: insertError } = await supabase
    .from("leads")
    .insert(insertPayload)
    .select("id,business_name")
    .limit(1);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  const inserted = (insertedRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  if (!inserted?.id) {
    return NextResponse.json({ error: "Lead insert succeeded but no id returned." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    created: true,
    lead_id: String(inserted.id),
    case_id: String(caseRow?.id || "").trim() || null,
    business_name: String(inserted.business_name || insertPayload.business_name || ""),
    message: "Lead created from top opportunity.",
  });
}
