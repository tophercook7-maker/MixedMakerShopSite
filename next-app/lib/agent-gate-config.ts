/**
 * Shared config for the Autonomous Desktop Agent download paywall.
 *
 * NO crypto imports here so this module is safe in BOTH the Node runtime
 * (API routes, server components) and the Edge runtime (middleware).
 * - Node verification:  lib/agent-gate.ts        (node:crypto)
 * - Edge verification:  lib/agent-gate-edge.ts   (Web Crypto)
 */

/** Signed payload that proves a paid unlock. */
export const AGENT_PAYLOAD = "autonomous_desktop_agent";

/** httpOnly cookie name holding the signed unlock token. */
export const AGENT_COOKIE = "ada_paid";

/** Path of the gated DMG (served statically, guarded by middleware). */
export const AGENT_DMG_PATH = "/downloads/Autonomous-Desktop-Agent-1.0.0.dmg";
export const AGENT_APPCAST_PATH = "/downloads/autonomous-desktop-agent-appcast.json";

/** $19 launch price in cents. */
export const AGENT_PRICE_CENTS = 1900;

/**
 * HMAC secret. Reuses the same resolution as the Hollow Gate so a single
 * configured secret protects both. Never expose this to the client.
 */
export function agentGateSecret(): string {
  return String(
    process.env.HOLLOW_GATE_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_SECRET_KEY ||
      "hg-fallback-secret-change-me",
  ).trim();
}

export function baseUrl(req: Request): string {
  const h = req.headers;
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host") || "mixedmakershop.com";
  return `${proto}://${host}`;
}
