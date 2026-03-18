import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildLeadPath } from "@/lib/lead-route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let targetId = String(params.id || "").trim();
  console.info("[Action Debug] Create Lead + Open clicked", { requestedId: targetId });
  if (!targetId) {
    return NextResponse.redirect(new URL("/admin/leads", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return NextResponse.redirect(new URL("/auth/login?redirectedFrom=/admin/leads", request.url));
  }

  const search = new URL(request.url).searchParams;
  const generate = search.get("generate") === "1";
  const compose = search.get("compose") === "1";

  // If this route was given a lead id, resolve to the linked opportunity id.
  const { data: leadByIdRows } = await supabase
    .from("leads")
    .select("id,business_name,linked_opportunity_id")
    .eq("owner_id", ownerId)
    .eq("id", targetId)
    .limit(1);
  const leadById = (leadByIdRows || [])[0] as
    | { id?: string | null; business_name?: string | null; linked_opportunity_id?: string | null }
    | undefined;
  const linkedOpportunityId = String(leadById?.linked_opportunity_id || "").trim();
  if (leadById?.id && linkedOpportunityId) {
    console.info("[Action Debug] resolved opportunity id from lead", {
      requestedId: targetId,
      resolvedOpportunityId: linkedOpportunityId,
      leadId: String(leadById.id || ""),
    });
    targetId = linkedOpportunityId;
  } else if (leadById?.id) {
    const leadPath = buildLeadPath(String(leadById.id), String(leadById.business_name || ""));
    const withQuery = generate ? `${leadPath}?generate=1` : compose ? `${leadPath}?compose=1` : leadPath;
    console.info("[Action Debug] route navigation attempted", { destination: withQuery, reason: "lead_id_no_linked_opportunity" });
    return NextResponse.redirect(new URL(withQuery, request.url));
  }

  const { data: existingRows } = await supabase
    .from("leads")
    .select("id,business_name")
    .eq("owner_id", ownerId)
    .eq("linked_opportunity_id", targetId)
    .limit(1);
  const existing = (existingRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  if (existing?.id) {
    console.info("[Action Debug] lead lookup result", {
      opportunityId: targetId,
      existingLeadId: String(existing.id || ""),
    });
    const leadPath = buildLeadPath(String(existing.id), String(existing.business_name || ""));
    const withQuery = generate ? `${leadPath}?generate=1` : compose ? `${leadPath}?compose=1` : leadPath;
    console.info("[Action Debug] route navigation attempted", { destination: withQuery });
    return NextResponse.redirect(new URL(withQuery, request.url));
  }

  const origin = new URL(request.url).origin;
  const createRes = await fetch(`${origin}/api/scout/opportunities/${encodeURIComponent(targetId)}/create-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: request.headers.get("cookie") || "" },
    cache: "no-store",
  });
  const created = (await createRes.json().catch(() => ({}))) as {
    lead_id?: string;
    business_name?: string;
  };
  if (!createRes.ok || !created.lead_id) {
    const encodedError = encodeURIComponent(String((created as { error?: string })?.error || "create_lead_failed"));
    console.error("[Action Debug] lead insert failed", { opportunityId: targetId, status: createRes.status, error: encodedError });
    return NextResponse.redirect(new URL(`/admin/leads?error=create_lead_failed&detail=${encodedError}`, request.url));
  }

  const leadPath = buildLeadPath(String(created.lead_id || ""), String(created.business_name || ""));
  const withQuery = generate ? `${leadPath}?generate=1` : compose ? `${leadPath}?compose=1` : leadPath;
  console.info("[Action Debug] route navigation attempted", { destination: withQuery });
  return NextResponse.redirect(new URL(withQuery, request.url));
}
