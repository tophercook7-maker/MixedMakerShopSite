import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mixedmakershop.com"),
  title: {
    default: "MixedMakerShop",
    template: "%s | MixedMakerShop",
  },
  description:
    "Web design, SEO, and digital growth support for small businesses — by Topher at MixedMakerShop.",
  applicationName: "MixedMakerShop",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0b0f0e",
  openGraph: {
    title: "MixedMakerShop",
    description:
      "Web design, SEO, and digital growth support for small businesses — by Topher at MixedMakerShop.",
    url: "https://mixedmakershop.com",
    siteName: "MixedMakerShop",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "MixedMakerShop — Web design and digital growth for small businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop",
    description:
    "Web design, SEO, and digital growth support for small businesses — by Topher at MixedMakerShop.",
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
        <Analytics />
      </body>
    </html>
  );
}
