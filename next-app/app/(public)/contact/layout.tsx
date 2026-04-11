import type { Metadata } from "next";

const canonical = "https://mixedmakershop.com/contact";

export const metadata: Metadata = {
  title: "Contact Topher | MixedMakerShop",
  description:
    "Reach Topher at MixedMakerShop about web design, 3D printing, or a digital build — direct, low-pressure, reply within one business day.",
  alternates: { canonical },
  openGraph: {
    title: "Contact | MixedMakerShop",
    description: "Send a short message — Topher replies within one business day.",
    url: canonical,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
