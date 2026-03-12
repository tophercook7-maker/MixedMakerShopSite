import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Bean Bliss Coffee Shop",
  description:
    "Bean Bliss serves handcrafted espresso drinks and cozy cafe vibes in Hot Springs, Arkansas.",
  keywords: ["coffee shop", "espresso", "latte", "cafe", "Hot Springs Arkansas"],
  openGraph: {
    title: "Bean Bliss Coffee Shop",
    description: "Fresh beans, handcrafted drinks, cozy vibes.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Bean Bliss",
  address: {
    "@type": "PostalAddress",
    streetAddress: "101 Central Ave",
    addressLocality: "Hot Springs",
    addressRegion: "AR",
    postalCode: "71901",
    addressCountry: "US"
  },
  telephone: "+15015550199",
  servesCuisine: "Coffee",
  openingHours: ["Mo-Fr 07:00-18:00", "Sa-Su 08:00-17:00"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
