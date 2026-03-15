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
      <head>
        <link rel="icon" href="/m3-icon.png" type="image/png" />
        <link rel="shortcut icon" href="/m3-icon.png" />
        <link rel="apple-touch-icon" href="/m3-icon.png" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
