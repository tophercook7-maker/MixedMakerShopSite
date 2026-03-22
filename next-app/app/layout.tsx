import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MixedMakerShop — Web Design & Admin",
  description: "MixedMakerShop website and admin — Massive Brain CRM",
  icons: {
    icon: [{ url: "/m3-icon.png", sizes: "48x48", type: "image/png" }],
    shortcut: "/m3-icon.png",
    apple: "/m3-192.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0c1929",
  openGraph: {
    title: "MixedMakerShop — Massive Brain",
    images: [{ url: "/massive-brain-m3.png", width: 889, height: 889, alt: "M³ Massive Brain" }],
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
