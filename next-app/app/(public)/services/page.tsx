import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Services</h1>
      <p className="mt-2 text-muted-foreground max-w-xl">
        Focused on web design for small businesses. We also offer custom builds and 3D printing when it’s the right fit.
      </p>
      <ul className="mt-8 space-y-4 text-muted-foreground">
        <li><strong className="text-foreground">Website design</strong> — New sites built for clarity and conversion.</li>
        <li><strong className="text-foreground">Website redesign</strong> — Modernize an existing site.</li>
        <li><strong className="text-foreground">Landing pages</strong> — Single-page campaigns.</li>
        <li><strong className="text-foreground">Small business sites</strong> — Services, contact, and trust.</li>
        <li><strong className="text-foreground">Maintenance</strong> — Updates and hosting support.</li>
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">
        Custom builds and 3D printing are available for select projects.
      </p>
      <Link href="/contact" className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Get in touch
      </Link>
    </div>
  );
}
