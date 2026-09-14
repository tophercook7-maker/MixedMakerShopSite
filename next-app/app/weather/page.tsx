import type { Metadata } from "next";
import { WeatherStation } from "@/components/weather-station";

export const metadata: Metadata = {
  title: "Weather Station",
  description:
    "Live conditions, minute-by-minute precipitation, and a 10-day forecast for anywhere.",
  robots: { index: false, follow: false },
};

export default function WeatherPage() {
  return (
    <main className="min-h-screen bg-[#0b2f1a] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#f7ead2] sm:text-4xl">
            Weather Station
          </h1>
          <p className="mt-1.5 text-[#f7ead2]/55">
            Search anywhere, or use your location · refreshes every 10 minutes
          </p>
        </header>
        <WeatherStation />
      </div>
    </main>
  );
}
