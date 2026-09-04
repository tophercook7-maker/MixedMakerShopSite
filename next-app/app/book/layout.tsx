import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a 15-Minute Website Review",
  description: "Pick a time and Topher will review your website live for fast conversion wins.",
  alternates: { canonical: "https://mixedmakershop.com/book" },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
