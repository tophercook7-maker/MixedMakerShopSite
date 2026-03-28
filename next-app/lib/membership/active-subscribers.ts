import type { SupabaseClient } from "@supabase/supabase-js";
import { isEntitlementActive, type MemberEntitlementRow } from "@/lib/membership/entitlement";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sb = SupabaseClient<any, "public", any>;

export type WeeklyRecipient = {
  email: string;
  user_id: string | null;
};

/**
 * Distinct emails for active member_entitlements (service-role client).
 */
export async function listActiveMemberRecipients(supabase: Sb): Promise<WeeklyRecipient[]> {
  const { data, error } = await supabase
    .from("member_entitlements")
    .select("email,user_id,subscription_status,current_period_end");

  if (error || !data?.length) {
    if (error) console.error("[active-subscribers] load failed", error.message);
    return [];
  }

  const seen = new Map<string, WeeklyRecipient>();
  for (const row of data as MemberEntitlementRow[]) {
    if (!isEntitlementActive(row)) continue;
    const em = String(row.email || "").toLowerCase().trim();
    if (!em || !em.includes("@")) continue;
    if (!seen.has(em)) {
      seen.set(em, { email: em, user_id: row.user_id ? String(row.user_id) : null });
    }
  }
  return Array.from(seen.values());
}
