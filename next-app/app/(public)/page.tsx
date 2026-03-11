import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Web design that brings you customers
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          MixedMakerShop builds clean, fast websites for small businesses. We focus on web design first — with optional custom builds and 3D printing for the right projects.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View portfolio
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}
