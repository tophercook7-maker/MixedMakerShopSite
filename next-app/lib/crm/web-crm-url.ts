/** Build `/admin/crm/web` URLs without touching APIs — query-only navigation. */

const PATH = "/admin/crm/web";

export type WebCrmWebQuery = {
  pool?: string | null;
  lane?: string | null;
  follow_up_today?: string | null;
  needs_reply?: string | null;
};

export function parseWebCrmWebQuery(sp: URLSearchParams): WebCrmWebQuery {
  return {
    pool: sp.get("pool"),
    lane: sp.get("lane"),
    follow_up_today: sp.get("follow_up_today"),
    needs_reply: sp.get("needs_reply"),
  };
}

/** Merge updates; pass `null` to remove a key. */
export function webCrmWebHref(
  current: URLSearchParams | { toString(): string },
  updates: Partial<Record<keyof WebCrmWebQuery, string | null>>
): string {
  const p = new URLSearchParams(current.toString());
  for (const [key, val] of Object.entries(updates)) {
    if (val === null || val === undefined || val === "") {
      p.delete(key);
    } else {
      p.set(key, val);
    }
  }
  const q = p.toString();
  return `${PATH}${q ? `?${q}` : ""}`;
}

export function webCrmWebHrefPreset(preset: "needs_reply" | "follow_up_today" | "ready_now" | "sample_active"): string {
  switch (preset) {
    case "needs_reply":
      return `${PATH}?needs_reply=1`;
    case "follow_up_today":
      return `${PATH}?follow_up_today=1`;
    case "ready_now":
      return `${PATH}?lane=ready_now`;
    case "sample_active":
      return `${PATH}?lane=sample_active`;
    default:
      return PATH;
  }
}
