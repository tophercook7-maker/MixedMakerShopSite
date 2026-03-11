import Link from "next/link";

export default function PublicLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            MixedMakerShop
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/services" className="text-muted-foreground hover:text-foreground">Services</Link>
            <Link href="/portfolio" className="text-muted-foreground hover:text-foreground">Portfolio</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            <Link href="/free-website-check" className="text-muted-foreground hover:text-foreground">Free Website Check</Link>
            <Link href="/connect" className="text-muted-foreground hover:text-foreground">Connect</Link>
            <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © MixedMakerShop
      </footer>
    </div>
  );
}
