import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic — reports whether key env vars are visible to this
 * function in production, WITHOUT exposing any secret value (only present/length/
 * 3-char prefix). Remove after the Stripe env is confirmed working.
 */
function info(name: string) {
  const v = process.env[name];
  const s = typeof v === "string" ? v.trim() : "";
  return { present: s.length > 0, len: s.length, prefix: s.slice(0, 3) };
}

export async function GET() {
  return NextResponse.json(
    {
      vercelEnv: process.env.VERCEL_ENV || null,
      node: process.version,
      STRIPE_SECRET_KEY: info("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: info("STRIPE_WEBHOOK_SECRET"),
      HOLLOW_GATE_SECRET: info("HOLLOW_GATE_SECRET"),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
