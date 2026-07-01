import { NextResponse } from "next/server";

/** Desktop Agent is unpublished — block unlock until relaunch. */
export async function GET() {
  return NextResponse.json({ error: "Unavailable." }, { status: 404 });
}
