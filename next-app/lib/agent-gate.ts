import { createHmac, timingSafeEqual } from "node:crypto";
import { AGENT_PAYLOAD, agentGateSecret } from "@/lib/agent-gate-config";

/**
 * Node-runtime signing/verification for the Autonomous Desktop Agent unlock
 * cookie. Used by the API routes (unlock) and the landing server component.
 * The Edge middleware uses lib/agent-gate-edge.ts instead.
 */

export { AGENT_COOKIE, AGENT_DMG_PATH, AGENT_PRICE_CENTS, baseUrl } from "@/lib/agent-gate-config";

export function signToken(): string {
  const sig = createHmac("sha256", agentGateSecret()).update(AGENT_PAYLOAD).digest("hex");
  return `${AGENT_PAYLOAD}.${sig}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token || !token.includes(".")) return false;
  const [p, sig] = token.split(".");
  if (p !== AGENT_PAYLOAD || !sig) return false;
  const expect = createHmac("sha256", agentGateSecret()).update(AGENT_PAYLOAD).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}
