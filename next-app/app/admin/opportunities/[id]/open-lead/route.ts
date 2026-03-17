import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildLeadPath } from "@/lib/lead-route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const opportunityId = String(params.id || "").trim();
  if (!opportunityId) {
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

  const { data: existingRows } = await supabase
    .from("leads")
    .select("id,business_name")
    .eq("owner_id", ownerId)
    .eq("linked_opportunity_id", opportunityId)
    .limit(1);
  const existing = (existingRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  if (existing?.id) {
    const leadPath = buildLeadPath(String(existing.id), String(existing.business_name || ""));
    const withQuery = generate ? `${leadPath}?generate=1` : compose ? `${leadPath}?compose=1` : leadPath;
    return NextResponse.redirect(new URL(withQuery, request.url));
  }

  const origin = new URL(request.url).origin;
  const createRes = await fetch(`${origin}/api/scout/opportunities/${encodeURIComponent(opportunityId)}/create-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: request.headers.get("cookie") || "" },
    cache: "no-store",
  });
  const created = (await createRes.json().catch(() => ({}))) as {
    lead_id?: string;
    business_name?: string;
  };
  if (!createRes.ok || !created.lead_id) {
    return NextResponse.redirect(new URL("/admin/leads?error=create_lead_failed", request.url));
  }

  const leadPath = buildLeadPath(String(created.lead_id || ""), String(created.business_name || ""));
  const withQuery = generate ? `${leadPath}?generate=1` : compose ? `${leadPath}?compose=1` : leadPath;
  return NextResponse.redirect(new URL(withQuery, request.url));
}
