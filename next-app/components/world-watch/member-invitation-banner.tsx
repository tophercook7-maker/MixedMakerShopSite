import Link from "next/link";
import { MemberCheckoutCta } from "@/components/world-watch/member-checkout-cta";
import { MEMBERSHIP_YEARLY_SAVINGS_NOTE } from "@/lib/membership/pricing";

const FEATURES = [
  "Full weekly reflections",
  "Biblical insight on current events",
  "Global awareness through a calm lens",
  "Thoughtful prophecy-related perspective",
  "Weekly email delivery",
  "Future audio access",
];

export function MemberInvitationBanner({
  showYearly = false,
  className = "",
}: {
  showYearly?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-950/85 p-6 shadow-[0_24px_56px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-8 ${className}`}
      aria-labelledby="unlock-world-watch-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(45,212,191,0.04),transparent_55%)]"
        aria-hidden
      />
      <div className="relative max-w-2xl space-y-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Member access</p>
        <h2
          id="unlock-world-watch-heading"
          className="text-xl font-medium tracking-tight text-slate-100 sm:text-2xl"
        >
          Unlock World Watch
        </h2>
        <p className="text-sm leading-relaxed text-slate-400">
          Calm, scripturally grounded reflection on global events, available to members.
        </p>
        <p className="text-sm leading-relaxed text-slate-500">
          World Watch is designed for those who want clarity without noise — thoughtful updates, biblical perspective, and a
          peaceful rhythm in a restless world.
        </p>
        <ul className="space-y-2 text-sm leading-relaxed text-slate-400">
          {FEATURES.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500/35" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {showYearly ? (
          <p className="text-[11px] leading-relaxed text-slate-500">{MEMBERSHIP_YEARLY_SAVINGS_NOTE} with the annual plan.</p>
        ) : null}
        <MemberCheckoutCta showYearly={showYearly} monthlyLabel="Start Monthly" annualLabel="Choose Annual" />
        <p className="text-[11px] text-slate-600">Cancel anytime.</p>
        <p className="text-[11px] text-slate-600">
          Prefer the full overview first?{" "}
          <Link href="/membership" className="text-teal-200/70 underline-offset-4 hover:text-teal-200/90 hover:underline">
            Membership details
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
