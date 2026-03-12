import Image from "next/image";

export function HeroSection() {
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-stone-900">
      <Image
        src="https://picsum.photos/id/1015/2000/1200"
        alt="Steam rising from espresso in a warm cafe atmosphere"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70" />

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center text-white">
        <p className="mb-3 text-xs font-medium uppercase tracking-[4px] text-amber-300 md:text-sm">
          Est. 2023 • Hot Springs, AR
        </p>
        <h1 className="logo-font mb-6 text-5xl font-bold leading-none md:text-8xl">
          Good days
          <br />
          start with
          <br />
          great coffee
        </h1>
        <p className="mx-auto mb-10 max-w-lg text-lg text-amber-100 md:text-2xl">
          Fresh beans, handcrafted drinks, and a calm place to recharge.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="#menu"
            className="rounded-full bg-white px-9 py-4 text-lg font-semibold text-coffee transition hover:bg-amber-100"
          >
            Browse Menu
          </a>
          <a
            href="#visit"
            className="rounded-full border-2 border-white px-9 py-4 text-lg font-semibold transition hover:bg-white/10"
          >
            Find Us
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-3 px-6 text-sm">
        <div className="rounded-full bg-white/90 px-4 py-2 text-stone-800 shadow">
          4.9 • 842 reviews
        </div>
        <div className="rounded-full bg-white/90 px-4 py-2 text-stone-800 shadow">
          Ethically sourced beans
        </div>
        <div className="rounded-full bg-white/90 px-4 py-2 text-stone-800 shadow">Oat, almond, whole milk</div>
      </div>
    </section>
  );
}
