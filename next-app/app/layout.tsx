import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { getMixedMakerStructuredDataGraph } from "@/lib/structured-data";

const structuredDataJson = JSON.stringify(getMixedMakerStructuredDataGraph());

const keywords = [
  "MixedMakerShop",
  "Topher Cook",
  "one-man laboratory",
  "web design Hot Springs AR",
  "websites and tools",
  "AI automation",
  "apps and games",
  "books and audiobooks",
  "small business tools",
  "local services",
] as const;

import { metaDescription } from "@/lib/seo/snippet-meta";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MixedMakerShop | Web Design & Local SEO Hot Springs AR",
    template: "%s | MixedMakerShop",
  },
  description: metaDescription(
    "Hot Springs AR web design, local SEO, and AI tools from a one-man lab. Sites from $400, free homepage preview, built by one person — no agency layers."
  ),
  keywords: [...keywords],
  applicationName: "MixedMakerShop",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "-7hb27xV1J3w47FjfMBRE2FLNGI74FiQMENyqQYmrQ0",
    other: {
      "msvalidate.01": "A3AAEDD4048483FDA072E42BC95CCB1F",
      "p:domain_verify": "d53e0c015ce8fd008d45a320ba5d147f",
    },
  },
  openGraph: {
    title: "MixedMakerShop | Web Design & Local SEO Hot Springs AR",
    description: metaDescription(
      "Small business websites, local SEO, AI tools, apps, and books out of a one-man lab in Hot Springs, Arkansas. Free preview · sites from $400."
    ),
    url: SITE_URL,
    siteName: "MixedMakerShop",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "MixedMakerShop — Topher\u2019s one-man laboratory in Hot Springs, Arkansas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Web Design Hot Springs AR",
    description: metaDescription(
      "Websites from $400, local SEO, free homepage preview. Hot Springs small business web design by Topher."
    ),
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
      <head>
        <meta name="impact-site-verification" {...({ value: "f5fa9ac1-2483-4f81-a0aa-be297f29cc69" } as Record<string, string>)} />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLMs.txt — guide for AI assistants"
        />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms-full.txt"
          title="LLMs full site guide"
        />
      </head>
      <body className="min-h-screen antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson }} />
        {children}
      </body>
    </html>
  );
}
