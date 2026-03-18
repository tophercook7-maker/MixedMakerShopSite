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
    return {
      ok: false,
      message: "Lead not found — creation may have failed",
      status: Number(res.status || 500),
      reason: String(body.reason || "").trim() || null,
      diagnostics: body.diagnostics || null,
    };
  } catch {
    return {
      ok: false,
      message: "Lead not found — creation may have failed",
      status: 500,
      reason: "lookup_failed",
    };
  }
}
