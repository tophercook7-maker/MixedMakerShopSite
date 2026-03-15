import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MixedMakerShop — Web Design & Admin",
  description: "MixedMakerShop website and admin",
  icons: {
    icon: "/m3-icon.png",
    shortcut: "/m3-icon.png",
    apple: "/m3-192.png",
  },
  manifest: "/site.webmanifest",
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
