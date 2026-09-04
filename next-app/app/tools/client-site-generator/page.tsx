import type { Metadata } from "next";
import { ClientSiteGeneratorForm } from "@/components/tools/ClientSiteGeneratorForm";

export const metadata: Metadata = {
  title: "Client site generator",
  description: "Scaffold Astro niche-pack ClientConfig files from intake — internal MixedMakerShop tool.",
  robots: { index: false, follow: false },
};

export default function ClientSiteGeneratorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <ClientSiteGeneratorForm />
    </main>
  );
}
