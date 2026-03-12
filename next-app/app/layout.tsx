import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MixedMakerShop — Web Design & Admin",
  description: "MixedMakerShop website and admin",
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
