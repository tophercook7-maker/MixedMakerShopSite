export type LeadNavigationCheck =
  | { ok: true }
  | {
      ok: false;
      message: string;
      status: number;
      reason: string | null;
      diagnostics?: Record<string, unknown> | null;
    };

export async function verifyLeadBeforeNavigation(leadId: string): Promise<LeadNavigationCheck> {
  const id = String(leadId || "").trim();
  if (!id) {
    return {
      ok: false,
      message: "Lead not found — creation may have failed",
      status: 400,
      reason: "missing_lead_id",
    };
  }
  try {
    console.info("[Lead Navigation] request started", { lead_id: id, route: `/api/leads/${encodeURIComponent(id)}` });
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      reason?: string;
      diagnostics?: Record<string, unknown>;
    };
    const status = Number(res.status || 500);
    const reason = String(body.reason || "").trim() || null;
    const message =
      status === 403
        ? "Permission denied: lead exists but is outside your workspace."
        : status === 404
          ? "No data returned: lead does not exist."
          : "API error: could not verify lead before navigation.";
    console.error("[Lead Navigation] request failed", {
      lead_id: id,
      status,
      reason,
      body,
    });
    return {
      ok: false,
      message,
      status,
      reason,
      diagnostics: body.diagnostics || null,
    };
  } catch {
    console.error("[Lead Navigation] request failed", {
      lead_id: id,
      status: 500,
      reason: "lookup_failed",
    });
    return {
      ok: false,
      message: "API error: lead lookup failed before navigation.",
      status: 500,
      reason: "lookup_failed",
    };
  }
}
