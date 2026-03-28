"use client";

import { MembershipCheckoutButton } from "@/components/membership/membership-checkout-button";
import {
  MEMBERSHIP_MONTHLY_USD,
  MEMBERSHIP_YEARLY_SAVINGS_NOTE,
  MEMBERSHIP_YEARLY_USD,
} from "@/lib/membership/pricing";

export function MembershipPricingClient({ showYearly }: { showYearly: boolean }) {
  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6">
      <article className="flex flex-col rounded-2xl border border-white/[0.08] bg-slate-950/70 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Monthly Membership</h2>
        <p className="mt-4 text-3xl font-medium tabular-nums text-slate-100">
          ${MEMBERSHIP_MONTHLY_USD}
          <span className="text-base font-normal text-slate-500">/month</span>
        </p>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
          Ongoing access to full World Watch reflections and the weekly email briefing.
        </p>
        <div className="mt-6">
          <MembershipCheckoutButton interval="month" variant="primary">
            Start Monthly
          </MembershipCheckoutButton>
        </div>
      </article>

      <article
        className={`flex flex-col rounded-2xl border bg-slate-950/70 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] ${
          showYearly ? "border-teal-500/15" : "border-white/[0.06] opacity-85"
        }`}
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Annual Membership</h2>
        <p className="mt-4 text-3xl font-medium tabular-nums text-slate-100">
          ${MEMBERSHIP_YEARLY_USD}
          <span className="text-base font-normal text-slate-500">/year</span>
        </p>
        {showYearly ? (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{MEMBERSHIP_YEARLY_SAVINGS_NOTE}</p>
        ) : (
          <p className="mt-2 text-[11px] text-slate-600">Configure STRIPE_PRICE_ID_YEARLY to enable annual checkout.</p>
        )}
        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
          {MEMBERSHIP_YEARLY_SAVINGS_NOTE} and stay connected all year.
        </p>
        <div className="mt-6">
          <MembershipCheckoutButton interval="year" variant="secondary" disabled={!showYearly}>
            Choose Annual
          </MembershipCheckoutButton>
        </div>
      </article>
    </div>
  );
}
