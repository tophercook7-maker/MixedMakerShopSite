export function WorldWatchHero() {
  return (
    <header className="relative overflow-hidden border-b border-white/[0.07]">
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[min(520px,70vh)] w-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.12)_0%,transparent_62%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/5 bottom-0 h-[min(400px,50vh)] w-[55%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(129,140,248,0.09)_0%,transparent_60%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,10,16,0.2),transparent_40%,rgba(6,10,16,0.65))]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 md:px-8 md:pb-20 md:pt-20 lg:max-w-4xl">
        <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-teal-200/65 sm:text-left">
          Deep Well Audio
        </p>
        <h1 className="mb-4 text-center text-4xl font-semibold tracking-tight text-slate-100 sm:text-left md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
          World Watch
        </h1>
        <p className="mb-5 text-center text-lg leading-relaxed text-slate-300 sm:text-left md:text-xl md:leading-snug">
          Understanding the world through Scripture — without fear, noise, or overwhelm.
        </p>
        <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-slate-400 sm:mx-0 sm:text-left">
          Curated global developments, biblical reflection, and thoughtful perspective for those seeking clarity and peace
          in a restless world.
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-slate-500 sm:mx-0 sm:text-left">
          Membership includes the weekly <span className="text-slate-400">Deep Well Weekly</span> email — one calm briefing,
          delivered with restraint.
        </p>
        <div className="mx-auto mt-10 h-px max-w-xs bg-gradient-to-r from-transparent via-white/20 to-transparent sm:mx-0" />
      </div>
    </header>
  );
}
