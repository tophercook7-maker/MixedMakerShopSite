import type { Metadata } from "next";
import Link from "next/link";
import { MembershipPricingClient } from "@/components/membership/membership-pricing-client";

export const metadata: Metadata = {
  title: "Membership | Deep Well Audio",
  description: "Calm access to World Watch and the Deep Well Weekly email briefing.",
};

export default function MembershipPage() {
  const showYearly = Boolean(String(process.env.STRIPE_PRICE_ID_YEARLY || "").trim());

  return (
    <div className="min-h-screen bg-[#060a10] text-slate-200">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-200/45">Deep Well Audio</p>
        <h1 className="mt-3 text-center text-3xl font-medium tracking-tight text-slate-100 sm:text-4xl">
          Become a Deep Well Member
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-slate-400">
          Join for calm, reflective access to World Watch and weekly biblical perspective on the world around you.
        </p>

        <MembershipPricingClient showYearly={showYearly} />

        <div className="mt-12 rounded-2xl border border-white/[0.06] bg-slate-950/50 px-5 py-6 text-center sm:px-8">
          <ul className="mx-auto max-w-md space-y-2 text-xs leading-relaxed text-slate-500">
            <li>Secure checkout with Stripe</li>
            <li>Cancel anytime</li>
            <li>Member access updates automatically after payment</li>
          </ul>
        </div>

        <p className="mt-10 text-center text-sm leading-relaxed text-slate-500">
          No noise. No panic. Just thoughtful perspective, delivered with peace and clarity.
        </p>

        <p className="mt-8 text-center text-xs text-slate-600">
          <Link href="/world-watch" className="underline-offset-4 hover:text-slate-400 hover:underline">
            World Watch
          </Link>
          {" · "}
          <Link href="/account" className="underline-offset-4 hover:text-slate-400 hover:underline">
            Account
          </Link>
          {" · "}
          <Link href="/" className="underline-offset-4 hover:text-slate-400 hover:underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
