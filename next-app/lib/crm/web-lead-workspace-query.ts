/** Query flags for `/admin/crm/web/[id]` — parsed from URL searchParams (stable, deterministic). */
export type WebLeadWorkspaceQuery = {
  sample: boolean;
  generate: boolean;
  compose: boolean;
  focusOutreach: boolean;
};

export const EMPTY_WEB_LEAD_WORKSPACE_QUERY: WebLeadWorkspaceQuery = {
  sample: false,
  generate: false,
  compose: false,
  focusOutreach: false,
};

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return String(v[0] ?? "");
  return String(v ?? "");
}

export function parseWebLeadWorkspaceQuery(
  sp: Record<string, string | string[] | undefined>
): WebLeadWorkspaceQuery {
  return {
    sample: first(sp.sample) === "1",
    generate: first(sp.generate) === "1",
    compose: first(sp.compose) === "1",
    focusOutreach: first(sp.focus).toLowerCase() === "outreach",
  };
}
