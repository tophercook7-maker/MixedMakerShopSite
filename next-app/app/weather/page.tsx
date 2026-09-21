import type { Metadata } from "next";
import Link from "next/link";
import { WeatherStation } from "@/components/weather-station";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/weather`;

export const metadata: Metadata = {
  alternates: { canonical },
  title: "Weather Station | Live Forecast for Any Town",
  description:
    "A free weather station: live conditions, minute-by-minute precipitation, and a 10-day forecast for any town you search. Built in Hot Springs, Arkansas.",
  openGraph: {
    title: "Weather Station | MixedMakerShop",
    description:
      "Live conditions, minute-by-minute precipitation, and a 10-day forecast for anywhere.",
    url: canonical,
    images: ["/og-image"],
  },
};

export default function WeatherPage() {
  return (
    <main className="min-h-screen bg-[#0b2f1a] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#f7ead2]/60 transition-colors hover:text-[#f28c1b]"
          >
            <span aria-hidden="true">&larr;</span> MixedMakerShop
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#f7ead2] sm:text-4xl">
            Weather Station
          </h1>
          <p className="mt-1.5 text-[#f7ead2]/55">
            Search anywhere, or use your location &middot; refreshes every 10 minutes
          </p>
        </header>
        <WeatherStation />
        <footer className="mt-10 border-t border-[#f7ead2]/10 pt-5 text-sm text-[#f7ead2]/50">
          <p>
            One of the free tools built in{" "}
            <Link href="/lab" className="underline underline-offset-2 transition-colors hover:text-[#f28c1b]">
              the lab
            </Link>{" "}
            by Topher Cook in Hot Springs, Arkansas. Need something built?{" "}
            <Link href="/contact" className="underline underline-offset-2 transition-colors hover:text-[#f28c1b]">
              Get in touch
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
