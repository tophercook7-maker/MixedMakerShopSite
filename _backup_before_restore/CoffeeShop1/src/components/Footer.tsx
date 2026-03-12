export function Footer() {
  return (
    <footer className="bg-coffee py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p className="text-white/80">© {new Date().getFullYear()} Bean Bliss — Portfolio Mockup</p>
        <div className="flex gap-4 text-sm">
          <a href="#" className="rounded-full border border-white/20 px-3 py-1.5 hover:border-amber-300 hover:text-amber-300">
            Instagram
          </a>
          <a href="#" className="rounded-full border border-white/20 px-3 py-1.5 hover:border-amber-300 hover:text-amber-300">
            Facebook
          </a>
          <a href="#" className="rounded-full border border-white/20 px-3 py-1.5 hover:border-amber-300 hover:text-amber-300">
            X
          </a>
        </div>
      </div>
    </footer>
  );
}
