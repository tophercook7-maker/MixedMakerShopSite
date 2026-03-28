import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { isEntitlementActive, type MemberEntitlementRow } from "@/lib/membership/entitlement";
import { MEMBER_CUSTOMER_COOKIE, verifyMemberCustomerCookie } from "@/lib/membership/member-cookie";
import { getServiceRoleSupabase } from "@/lib/supabase/service-role";

function asActiveRow(data: unknown): MemberEntitlementRow | null {
  if (!data || typeof data !== "object") return null;
  const row = data as MemberEntitlementRow;
  return isEntitlementActive(row) ? row : null;
}

/**
 * Server-only: determines World Watch / membership access from DB + optional signed cookie.
 * Never trust client-sent flags.
 */
export async function getMemberEntitlementForRequest(): Promise<MemberEntitlementRow | null> {
  const svc = getServiceRoleSupabase();
  if (!svc.ok) return null;

  const db = svc.supabase;
  const user = await getCurrentUser();

  if (user?.id) {
    const { data } = await db.from("member_entitlements").select("*").eq("user_id", user.id).maybeSingle();
    const r = asActiveRow(data);
    if (r) return r;
  }

  const email = user?.email ? String(user.email).toLowerCase().trim() : null;
  if (email) {
    const { data } = await db.from("member_entitlements").select("*").eq("email", email).maybeSingle();
    const r = asActiveRow(data);
    if (r) return r;
  }

  const cookieStore = await cookies();
  const cid = verifyMemberCustomerCookie(cookieStore.get(MEMBER_CUSTOMER_COOKIE)?.value);
  if (cid) {
    const { data } = await db
      .from("member_entitlements")
      .select("*")
      .eq("stripe_customer_id", cid)
      .maybeSingle();
    const r = asActiveRow(data);
    if (r) return r;
  }

  return null;
}

export async function isActiveMember(): Promise<boolean> {
  const row = await getMemberEntitlementForRequest();
  return row != null;
}

/**
 * Attach Stripe entitlement rows to the logged-in profile when emails match (post-login / account page).
 */
export async function linkMemberEntitlementsToUser(userId: string, email: string): Promise<void> {
  const svc = getServiceRoleSupabase();
  if (!svc.ok) return;
  const e = String(email || "").toLowerCase().trim();
  if (!userId || !e) return;

  const now = new Date().toISOString();
  const { error } = await svc.supabase
    .from("member_entitlements")
    .update({ user_id: userId, updated_at: now })
    .eq("email", e)
    .is("user_id", null);

  if (error) {
    console.warn("[member entitlement] link to user failed", error.message);
  }
}
