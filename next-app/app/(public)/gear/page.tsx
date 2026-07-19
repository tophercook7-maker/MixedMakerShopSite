import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Maker & Home Gear Worth the Splurge | MixedMakerShop",
  description:
    "Hand-picked big-ticket gear for makers and home upgraders — 3D printers, laser cutters, CNCs, power stations, outdoor kitchens and more. The splurges that pay you back.",
  alternates: { canonical: `${SITE_URL}/gear` },
  openGraph: {
    title: "Maker & Home Gear Worth the Splurge",
    description:
      "The big-ticket tools and upgrades we think are actually worth it — picked for people who'd rather buy quality once.",
    url: `${SITE_URL}/gear`,
  },
};

type GearProduct = {
  id: string;
  title: string;
  niche: string;
  price: number;
  payout: number;
  copy: string;
  link: string;
  image?: string;
  tags?: string[];
};

function loadGear(): GearProduct[] {
  try {
    const file = path.join(process.cwd(), "content", "gear.json");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(data.products) ? data.products : [];
  } catch {
    return [];
  }
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function GearPage() {
  const products = loadGear();
  const niches = Array.from(new Set(products.map((p) => p.niche)));

  return (
    <div className="home-umbrella-canvas relative w-full text-[#e4efe9]">
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
          Maker &amp; Home Gear
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Big-ticket gear worth the splurge
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90 md:text-lg">
          The tools and upgrades we&apos;d actually spend our own money on — 3D printers, laser
          cutters, CNCs, power stations, outdoor kitchens and more. Buy quality once instead of
          cheap twice.
        </p>

        {niches.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {niches.map((n) => (
              <span
                key={n}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
              >
                {n}
              </span>
            ))}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-emerald-400/50"
            >
              <div className="aspect-[3/2] overflow-hidden bg-slate-900/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  src={
                    p.image ||
                    `https://placehold.co/600x400/0f1720/e2e8f0?text=${encodeURIComponent(p.niche)}`
                  }
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  {p.niche}
                </span>
                <h2 className="text-lg font-semibold leading-tight text-white">{p.title}</h2>
                <p className="flex-1 text-sm leading-relaxed text-slate-300">{p.copy}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xl font-bold text-white">{money(p.price)}</span>
                </div>
                <a
                  href={p.link}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="mt-1 block rounded-xl bg-emerald-400 py-2.5 text-center font-bold text-slate-900 transition hover:brightness-110"
                >
                  View Deal &rarr;
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-slate-400">
          As an affiliate, MixedMakerShop may earn a commission on purchases made through links on
          this page, at no extra cost to you. Prices and availability are set by the retailer and
          may change.
        </p>
      </section>
    </div>
  );
}
