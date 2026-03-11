import Link from "next/link";

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-white text-black px-6 py-12">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold">MixedMakerShop</h1>
        <p className="text-base text-neutral-700">
          Welcome to MixedMakerShop. Choose what you need.
        </p>

        <div className="grid gap-4">
          <Link
            href="/contact"
            className="rounded-2xl border border-black px-5 py-4 text-lg font-medium hover:bg-black hover:text-white transition"
          >
            Request a Website
          </Link>

          <Link
            href="/free-website-check"
            className="rounded-2xl border border-black px-5 py-4 text-lg font-medium hover:bg-black hover:text-white transition"
          >
            Free Website Check
          </Link>

          <Link
            href="/portfolio"
            className="rounded-2xl border border-black px-5 py-4 text-lg font-medium hover:bg-black hover:text-white transition"
          >
            View Portfolio
          </Link>

          <Link
            href="/contact"
            className="rounded-2xl border border-black px-5 py-4 text-lg font-medium hover:bg-black hover:text-white transition"
          >
            Contact Topher
          </Link>
        </div>
      </div>
    </main>
  );
}
