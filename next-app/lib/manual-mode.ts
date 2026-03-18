function truthy(value: string | undefined | null, fallback = false): boolean {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

export function isManualOnlyMode(): boolean {
  return truthy(process.env.MANUAL_ONLY_MODE, true);
}

export function isManualOnlyModeClient(): boolean {
  return truthy(process.env.NEXT_PUBLIC_MANUAL_ONLY_MODE, true);
}

export function isManualTriggerRequest(request: Request): boolean {
  const header = String(request.headers.get("x-manual-trigger") || "").trim().toLowerCase();
  if (header === "1" || header === "true" || header === "yes") return true;
  const url = new URL(request.url);
  const query = String(url.searchParams.get("manual_trigger") || "").trim().toLowerCase();
  return query === "1" || query === "true" || query === "yes";
}
