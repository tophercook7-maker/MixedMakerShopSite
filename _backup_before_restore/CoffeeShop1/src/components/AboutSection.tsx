import Image from "next/image";

export function AboutSection() {
  return (
    <section id="about" className="bg-white py-20 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <h2 className="section-header logo-font text-5xl font-bold">About</h2>
          <p className="mt-6 text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            Bean Bliss is a cozy neighborhood spot built around great espresso, friendly service, and a calm place to
            land. This project showcases a modern, component-driven Next.js build designed for clarity and speed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-900">Fast load</span>
            <span className="rounded-full bg-emerald-100 px-4 py-2 font-semibold text-emerald-900">
              Mobile-friendly
            </span>
            <span className="rounded-full bg-stone-100 px-4 py-2 font-semibold text-stone-900">Easy to edit</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl shadow-lg">
          <Image
            src="https://picsum.photos/id/1060/1200/900"
            alt="Warm and cozy coffee shop interior"
            width={1200}
            height={900}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
