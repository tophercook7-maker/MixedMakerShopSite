import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "I'm Not Done Yet | A Memoir by Topher Rent",
  description:
    "I'm Not Done Yet is a memoir by Topher Rent about faith, failure, multiple sclerosis, grief, and refusing to quit.",
};

export default function ImNotDoneYetBookPage() {
  return (
    <div
      className="relative isolate overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(3, 6, 10, 0.97) 0%, rgba(3, 6, 10, 0.88) 42%, rgba(3, 6, 10, 0.6) 100%), url('/images/books/im-not-done-yet-dawn.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-20">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="overflow-hidden rounded-2xl border border-amber-200/20 bg-black/25 p-3 shadow-2xl shadow-black/40">
            <Image
              src="/images/books/im-not-done-yet-cover-v2.jpg"
              alt="I'm Not Done Yet book cover by Topher Rent"
              width={1600}
              height={2560}
              priority
              className="h-auto w-full rounded-xl"
            />
          </div>
        </div>

        <div className="text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
            A memoir by Topher Rent
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
            I&apos;m Not Done Yet
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-amber-100 sm:text-2xl">
            A memoir of faith, failure, and refusing to quit.
          </p>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
            Every morning begins with coffee, a porch, and a late father&apos;s desk—then the work of building something
            from nothing. This is an honest story about living with multiple sclerosis, caregiving, grief, near-wins,
            faith, and the choice to keep going when nothing looks finished yet.
          </p>
          <div className="mt-8 rounded-2xl border border-white/15 bg-slate-950/55 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">For the one carrying a lot</p>
            <p className="mt-3 text-lg leading-8 text-slate-100">
              No polished answers. No easy triumph. Just the plain truth that the bottom is not the same as being
              finished.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://youtu.be/Xh0KEYlouHc"
              className="inline-flex items-center rounded-full bg-amber-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Watch the book trailer
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Ask about the book
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-300">
            Release details will be added here when a verified book-store page is available.
          </p>
        </div>
      </section>

      <section className="mt-16 border-t border-white/10 pt-10 text-slate-200">
        <h2 className="text-2xl font-semibold text-white">What it&apos;s about</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8">
          A broken-down truck. A worn-down body. Bills that do not care how hard you work. The people you love, the
          scams that circle hard times, and the small stubborn work of building a life anyway. <em>I&apos;m Not Done Yet</em>{" "}
          is for anyone who has been knocked down and needs a reason to keep taking the next step.
        </p>
      </section>
      </div>
    </div>
  );
}
