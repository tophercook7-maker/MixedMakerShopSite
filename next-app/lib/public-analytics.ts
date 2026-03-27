/**
 * Lightweight public-funnel analytics. Integrates with gtag / dataLayer when present;
 * always dispatches a window CustomEvent for local debugging or third-party listeners.
 */

export type PublicAnalyticsProps = Record<string, string | number | boolean | undefined>;

const DEV = process.env.NODE_ENV === "development";

function scrub(props: PublicAnalyticsProps | undefined): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!props) return out;
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

/** Fire a named event (client-only). Safe to call from click handlers / after submit. */
export function trackPublicEvent(name: string, props?: PublicAnalyticsProps): void {
  if (typeof window === "undefined") return;

  const payload = scrub(props);
  const detail = { name, props: payload, ts: Date.now() };

  try {
    window.dispatchEvent(new CustomEvent("mms-public-analytics", { detail }));
  } catch {
    /* ignore */
  }

  type GtagFn = (command: string, target: string, config?: Record<string, unknown>) => void;
  const gtag = (window as Window & { gtag?: GtagFn }).gtag;
  if (typeof gtag === "function") {
    try {
      gtag("event", name, payload as Record<string, unknown>);
    } catch {
      /* ignore */
    }
  }

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    try {
      dataLayer.push({ event: name, ...payload });
    } catch {
      /* ignore */
    }
  }

  if (DEV) {
    console.debug("[mms-public-analytics]", name, payload);
  }
}

export function trackGatewayNav(
  destination: "web_design" | "3d_printing",
  source: "hero_visual" | "primary_cta" | "examples_row",
): void {
  trackPublicEvent("public_gateway_nav", { destination, source });
}
