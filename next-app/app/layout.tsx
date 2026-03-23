import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mixedmakershop.com"),
  title: {
    default: "MixedMakerShop",
    template: "%s | MixedMakerShop",
  },
  description: "Web design, 3D printing, and custom builds that stand out.",
  applicationName: "MixedMakerShop",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0c1929",
  openGraph: {
    title: "MixedMakerShop",
    description: "Web design, 3D printing, and custom builds that stand out.",
    url: "https://mixedmakershop.com",
    siteName: "MixedMakerShop",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "MixedMakerShop — Build bold. Print custom. Grow local.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop",
    description: "Web design, 3D printing, and custom builds that stand out.",
    images: ["/og-image"],
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
