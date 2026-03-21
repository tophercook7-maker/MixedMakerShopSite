/** Browser helper for PATCH /api/leads/:id — shared by primary actions and workspace. */
export async function patchLeadApi(
  leadId: string,
  body: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return { ok: false, error: String(data.error || "Could not update.") };
  return { ok: true };
}
