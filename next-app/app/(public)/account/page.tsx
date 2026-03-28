import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  getMemberEntitlementForRequest,
  linkMemberEntitlementsToUser,
} from "@/lib/auth/isActiveMember";
import { BillingPortalButton } from "@/components/account/billing-portal-button";

export const metadata: Metadata = {
  title: "Account | Deep Well Audio",
  description: "World Watch membership and billing.",
};

function formatRenewal(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  } catch {
    return "—";
  }
}

function planLabel(interval: string | null | undefined): string {
  const i = String(interval || "").toLowerCase();
  if (i === "year") return "Annual";
  if (i === "month") return "Monthly";
  return "—";
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (user?.id && user.email) {
    await linkMemberEntitlementsToUser(user.id, user.email);
  }

  const entitlement = await getMemberEntitlementForRequest();

  return (
    <div className="min-h-screen bg-[#060a10] px-4 py-16 text-slate-200">
      <div className="mx-auto max-w-lg space-y-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-200/55">Deep Well Audio</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-slate-100">Account</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            World Watch membership and billing—kept simple.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/70 p-6 backdrop-blur-sm">
          {user?.email ? (
            <p className="text-sm text-slate-400">
              Signed in as <span className="text-slate-200">{user.email}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              You&apos;re not signed in. If you subscribed as a guest, use the same device or{" "}
              <Link href="/auth/login" className="text-teal-200/90 underline-offset-4 hover:underline">
                sign in
              </Link>{" "}
              with the email you used at checkout so we can link your membership.
            </p>
          )}

          <div className="mt-6 border-t border-white/[0.06] pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Membership</h2>
            {entitlement ? (
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="text-right text-slate-200">{entitlement.subscription_status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Plan</dt>
                  <dd className="text-right text-slate-200">{planLabel(entitlement.plan_interval)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Renewal</dt>
                  <dd className="text-right text-slate-200">{formatRenewal(entitlement.current_period_end)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                No active membership on this browser or account.{" "}
                <Link href="/world-watch" className="text-teal-200/85 underline-offset-4 hover:underline">
                  Explore World Watch
                </Link>{" "}
                to join when you&apos;re ready.
              </p>
            )}
          </div>

          {entitlement ? (
            <div className="mt-6">
              <BillingPortalButton />
            </div>
          ) : null}
        </div>

        <p className="text-center text-xs text-slate-600">
          <Link href="/" className="underline-offset-4 hover:text-slate-400 hover:underline">
            Home
          </Link>
          {" · "}
          <Link href="/world-watch" className="underline-offset-4 hover:text-slate-400 hover:underline">
            World Watch
          </Link>
        </p>
      </div>
    </div>
  );
}
