import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const ALLOWED = new Set(["new", "reviewed", "contacted", "closed"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const submissionId = String(id || "").trim();
  if (!submissionId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status =
    typeof json === "object" && json !== null && "status" in json
      ? String((json as { status: unknown }).status || "").trim()
      : "";

  if (!ALLOWED.has(status)) {
    return NextResponse.json(
      { error: "Invalid status. Use new, reviewed, contacted, or closed." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mockup_submissions")
    .update({ status })
    .eq("id", submissionId)
    .select("id, status, updated_at")
    .maybeSingle();

  if (error) {
    console.error("[admin mockup-submissions] status update failed", error.message);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, submission: data });
}
