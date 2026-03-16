import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

const ALLOWED_STATUSES = new Set([
  "new",
  "contacted",
  "follow_up",
  "follow_up_due",
  "replied",
  "closed",
  "closed_won",
  "closed_lost",
  "do_not_contact",
]);

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const nextStatus = String(body.status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (!id) {
    return NextResponse.json({ error: "Missing case id." }, { status: 400 });
  }
  if (!ALLOWED_STATUSES.has(nextStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("case_files")
    .update({ status: nextStatus })
    .eq("id", id)
    .select("id,status")
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: data?.[0] ?? null });
}

