import { AGENT_PAYLOAD, agentGateSecret } from "@/lib/agent-gate-config";

/**
 * Edge-runtime verification for the unlock cookie, using Web Crypto (no
 * node:crypto, which isn't available in Next middleware). Must produce the same
 * HMAC-SHA256 hex digest as lib/agent-gate.ts so cookies sign/verify across
 * runtimes.
 */
export async function verifyTokenEdge(token: string | undefined | null): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [p, sig] = token.split(".");
  if (p !== AGENT_PAYLOAD || !sig) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(agentGateSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(AGENT_PAYLOAD));
  const expect = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time-ish comparison.
  if (sig.length !== expect.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expect.charCodeAt(i);
  return diff === 0;
}
