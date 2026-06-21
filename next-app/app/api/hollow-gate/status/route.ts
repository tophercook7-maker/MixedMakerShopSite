import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, HG_COOKIE } from "@/lib/hollow-gate";

export const dynamic = "force-dynamic";

/** The game asks this on load + on "I've paid — check". Reads the signed cookie. */
export async function GET() {
  const token = cookies().get(HG_COOKIE)?.value;
  return NextResponse.json(
    { paid: verifyToken(token) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
