import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MixedMakerShop — Web Design & Admin",
  description: "MixedMakerShop website and admin — Massive Brain CRM",
  icons: {
    icon: [{ url: "/m3-brand.png", sizes: "48x48", type: "image/png" }],
    shortcut: "/m3-brand.png",
    apple: "/m3-brand.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0c1929",
  openGraph: {
    title: "MixedMakerShop — Massive Brain",
    images: [{ url: "/m3-brand.png", width: 1024, height: 1024, alt: "MixedMakerShop M³" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
