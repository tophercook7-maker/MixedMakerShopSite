import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Welcome | Deep Well Audio",
  description: "Your membership is active. Enjoy full World Watch access.",
};

export default function AccountSuccessPage({
  searchParams,
}: {
  searchParams: { warn?: string };
}) {
  const warn = searchParams.warn;
  const softWarn =
    warn === "config"
      ? "If something looks off, confirm Stripe keys are set—we still recorded your membership when webhooks ran."
      : warn === "cookie"
        ? "We could not set a browser cookie for this device. You can still sign in with the same email you used at checkout."
        : warn === "customer"
          ? "We could not read your Stripe customer from this session. Try signing in or contact support if access is missing."
          : null;

  return (
    <div className="min-h-screen bg-[#060a10] px-4 py-16 text-slate-200">
      <div className="mx-auto max-w-lg space-y-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-200/55">Deep Well Audio</p>
        <h1 className="text-2xl font-medium tracking-tight text-slate-100">You&apos;re in</h1>
        <p className="text-sm leading-relaxed text-slate-400">You now have full access to World Watch.</p>
        <p className="text-sm leading-relaxed text-slate-500">
          Reflections, summaries, and scripture connections — plus the weekly Deep Well Weekly briefing when you&apos;re an
          active member.
        </p>
        <p className="text-xs leading-relaxed text-slate-500">
          If a refresh still shows a preview, wait a few seconds for our systems to confirm—membership is finalized by
          Stripe, not this page alone.
        </p>
        {softWarn ? <p className="text-xs leading-relaxed text-slate-500">{softWarn}</p> : null}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/world-watch"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-teal-400/25 bg-teal-500/10 px-5 py-2.5 text-sm font-medium text-teal-100/95 transition hover:border-teal-400/40 hover:bg-teal-500/15"
          >
            Go to World Watch
          </Link>
          <Link
            href="/account"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/18 hover:text-slate-100"
          >
            Account
          </Link>
        </div>
      </div>
    </div>
  );
}
