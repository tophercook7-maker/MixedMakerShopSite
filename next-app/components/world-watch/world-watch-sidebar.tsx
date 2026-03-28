import Link from "next/link";

export function WorldWatchSidebar({ isMember = false }: { isMember?: boolean }) {
  return (
    <aside className="rounded-2xl border border-white/[0.07] bg-slate-950/60 p-6 lg:sticky lg:top-24">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About World Watch</h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">
        This space is for slow reading—connecting headlines and history to prayer, wisdom, and the peace Christ offers.
      </p>
      <p className="border-l-2 border-teal-500/20 pl-3 text-sm italic leading-relaxed text-slate-500">
        These reflections are curated for clarity, not urgency.
      </p>
      {!isMember ? (
        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          Already a member?{" "}
          <Link href="/account" className="text-teal-200/80 underline-offset-4 hover:underline">
            Open your account
          </Link>{" "}
          or{" "}
          <Link href="/auth/login" className="text-teal-200/80 underline-offset-4 hover:underline">
            sign in
          </Link>
          .
        </p>
      ) : (
        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          <Link href="/account" className="text-teal-200/80 underline-offset-4 hover:underline">
            Membership &amp; billing
          </Link>
        </p>
      )}
    </aside>
  );
}
