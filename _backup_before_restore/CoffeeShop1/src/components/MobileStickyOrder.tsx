export function MobileStickyOrder() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 backdrop-blur md:hidden dark:border-stone-800 dark:bg-stone-950/95">
      <a
        href="#contact"
        className="block rounded-full bg-amber-500 px-6 py-3 text-center font-semibold text-coffee transition hover:bg-amber-400"
      >
        Order Pickup
      </a>
    </div>
  );
}
