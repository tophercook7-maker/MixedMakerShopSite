import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { getMixedMakerStructuredDataGraph } from "@/lib/structured-data";

const structuredDataJson = JSON.stringify(getMixedMakerStructuredDataGraph());

const keywords = [
  "MixedMakerShop",
  "Topher and GiGi",
  "creative studio",
  "practical projects",
  "websites and tools",
  "3D printing",
  "property care",
  "handmade projects",
  "small business tools",
  "local services",
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MixedMakerShop | Practical Creative Studio by Topher & GiGi",
    template: "%s | MixedMakerShop",
  },
  description:
    "MixedMakerShop is Topher & GiGi's practical creative studio for useful things built online, outside, and in the workshop — including websites, tools, 3D printing, property care, and creative projects.",
  keywords: [...keywords],
  applicationName: "MixedMakerShop",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    other: {
      "msvalidate.01": "A3AAEDD4048483FDA072E42BC95CCB1F",
    },
  },
  openGraph: {
    title: "MixedMakerShop | Practical Creative Studio by Topher & GiGi",
    description:
      "MixedMakerShop is Topher & GiGi's practical creative studio for useful things built online, outside, and in the workshop — including websites, tools, 3D printing, property care, and creative projects.",
    url: SITE_URL,
    siteName: "MixedMakerShop",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "MixedMakerShop — practical creative studio by Topher & GiGi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Practical Creative Studio by Topher & GiGi",
    description:
      "MixedMakerShop is Topher & GiGi's practical creative studio for useful things built online, outside, and in the workshop — including websites, tools, 3D printing, property care, and creative projects.",
    images: ["/og-image"],
  },
};

export const viewport = {
  themeColor: "#0b0f0e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
