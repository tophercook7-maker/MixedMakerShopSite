import { NextResponse } from "next/server";

/** Desktop Agent is unpublished — block checkout until relaunch. */
export async function GET() {
  return NextResponse.json({ error: "Unavailable." }, { status: 404 });
}
