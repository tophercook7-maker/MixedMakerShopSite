import { createHmac, timingSafeEqual } from "node:crypto";

// A signed "unlocked" flag stored in an httpOnly cookie. Users can't forge it
// without the server secret, so the unlock can't be faked from the browser.
const PAYLOAD = "hollow_gate_full";

function secret(): string {
  return String(
    process.env.HOLLOW_GATE_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_SECRET_KEY ||
      "hg-fallback-secret-change-me"
  ).trim();
}

export const HG_COOKIE = "thg_paid";

export function signToken(): string {
  const sig = createHmac("sha256", secret()).update(PAYLOAD).digest("hex");
  return `${PAYLOAD}.${sig}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token || !token.includes(".")) return false;
  const [p, sig] = token.split(".");
  if (p !== PAYLOAD || !sig) return false;
  const expect = createHmac("sha256", secret()).update(PAYLOAD).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}

export function baseUrl(req: Request): string {
  const h = req.headers;
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host") || "mixedmakershop.com";
  return `${proto}://${host}`;
}
