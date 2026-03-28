export function WorldWatchPageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8" aria-busy="true">
      <div className="h-11 max-w-md animate-pulse rounded-full bg-white/5" />
      <div className="mt-10 h-80 animate-pulse rounded-2xl bg-white/[0.04]" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}
