/** User-facing copy when `public.scout_results` is missing in Supabase. */
export const SCOUT_RESULTS_TABLE_MISSING_MESSAGE =
  "Scout setup is not finished yet. The scout_results table has not been created in Supabase.";

export const SCOUT_RESULTS_TABLE_MISSING_HINT =
  "Apply the latest migration in the Supabase SQL editor (or run `supabase db push`), then reload this page. Until then, Scout cannot store its discovery list here.";

export function isScoutResultsTableMissingError(message: string | null | undefined): boolean {
  const m = String(message || "").toLowerCase();
  if (!m) return false;
  return (
    m.includes("scout_results") &&
    (m.includes("schema cache") || m.includes("does not exist") || m.includes("could not find"))
  );
}
