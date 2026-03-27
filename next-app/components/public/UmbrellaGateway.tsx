import Link from "next/link";
import { ArrowRight, Layers, Printer } from "lucide-react";
import { publicShellClass } from "@/lib/public-brand";
import { GatewayPrintGraphic, GatewayWebGraphic } from "@/components/public/GatewayPathGraphics";

const pathCards = [
  {
    href: "/web-design",
    title: "Topher's Web Design",
    description:
      "Websites, landing pages, and simple tools for local businesses that need more visibility and more leads.",
    cta: "Go to Web Design",
    icon: Layers,
    graphic: GatewayWebGraphic,
    accentOuter: "from-emerald-400/[0.14] via-cyan-500/[0.06] to-transparent",
    ringClass: "ring-emerald-400/20 hover:ring-emerald-400/35",
    borderClass: "border-emerald-500/20",
    badgeClass: "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-200",
    ctaClass:
      "shadow-[0_12px_40px_rgba(0,255,178,0.18)] ring-1 ring-[rgba(255,209,102,0.35)] hover:shadow-[0_16px_48px_rgba(0,255,178,0.22)]",
  },
  {
    href: "/3d-printing",
    title: "3D Printing & Problem Solving",
    description:
      "Custom 3D printing, practical problem-solving, replacement parts, prototypes, and help turning ideas into real objects.",
    cta: "Go to 3D Printing",
    icon: Printer,
    graphic: GatewayPrintGraphic,
    accentOuter: "from-amber-400/[0.16] via-orange-500/[0.07] to-transparent",
    ringClass: "ring-amber-400/25 hover:ring-amber-400/40",
    borderClass: "border-amber-500/25",
    badgeClass: "border-amber-400/30 bg-amber-500/[0.1] text-amber-100",
    ctaClass:
      "shadow-[0_12px_40px_rgba(249,115,22,0.2)] ring-1 ring-[rgba(251,191,36,0.35)] hover:shadow-[0_16px_52px_rgba(249,115,22,0.28)]",
  },
] as const;

export function UmbrellaGateway() {
  return (
    <div className="home-premium home-premium--textured min-h-[70vh]">
      <section className="home-band home-band--hero relative overflow-hidden border-b border-[rgba(232,253,245,0.08)]">
        <div className="home-band-hero-bg pointer-events-none absolute inset-0 opacity-90" aria-hidden />
        <div className="home-hero-vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className={`${publicShellClass} relative z-[2] pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-16 md:pb-20`}>
          <p className="home-reveal text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#9FB5AD] md:text-xs">
            MixedMakerShop
          </p>
          <h1 className="home-reveal home-section-title mt-5 text-center text-3xl font-semibold tracking-tight text-[#E8FDF5] sm:text-4xl md:text-5xl lg:text-[3.25rem] max-w-[18ch] mx-auto leading-[1.08]">
            What are you trying to build?
          </h1>
          <p className="home-reveal mx-auto mt-6 max-w-[42rem] text-center text-base md:text-lg leading-relaxed text-[#9FB5AD]">
            Choose the path that fits what you need — better online visibility for your business, or custom 3D printing
            and problem-solving.
          </p>

          <p className="home-reveal mx-auto mt-10 max-w-[36rem] text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(0,255,178,0.75)] md:text-xs md:tracking-[0.24em]">
            Choose your path
          </p>

          <div className="home-reveal mt-8 grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-9">
            {pathCards.map((card) => {
              const Icon = card.icon;
              const Graphic = card.graphic;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`group relative flex flex-col overflow-hidden rounded-[1.45rem] border bg-[#0a100e]/90 backdrop-blur-[14px] transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_40px_100px_rgba(0,0,0,0.52)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(0,255,178,0.45)] ${card.borderClass} ring-1 ${card.ringClass}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${card.accentOuter}`}
                    aria-hidden
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.04),transparent_55%)]" />

                  <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
                    <div className="absolute inset-0 bg-[#070a09]" />
                    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
                      <div className="relative h-full w-full max-h-[150px] max-w-[100%] opacity-[0.95] transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100 sm:max-h-[220px] sm:max-w-[380px]">
                        <Graphic />
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f0e] via-[#0b0f0e]/4 to-transparent" />
                    <div
                      className={`absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl border text-[#E8FDF5] shadow-lg backdrop-blur-sm ${card.badgeClass}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </div>
                  </div>

                  <div className="relative flex flex-1 flex-col p-6 md:p-8 pt-7 md:pt-8">
                    <h2 className="text-xl font-semibold tracking-tight text-[#E8FDF5] md:text-2xl">{card.title}</h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[#9FB5AD] md:text-[15px] md:leading-relaxed">
                      {card.description}
                    </p>
                    <span
                      className={`home-btn-primary mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-[#0B0F0E] sm:w-auto sm:px-9 ${card.ctaClass}`}
                    >
                      {card.cta}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="home-reveal mx-auto mt-14 max-w-[36rem] text-center text-sm md:text-base text-[#9FB5AD]/95 leading-relaxed">
            Both paths are built to keep things simple, useful, and professional.
          </p>

          <div className="home-reveal mx-auto mt-10 max-w-[44rem] rounded-[1.25rem] border border-[rgba(232,253,245,0.1)] bg-[rgba(12,18,16,0.65)] px-5 py-6 md:px-8 md:py-7">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9FB5AD]/90 md:text-xs">
              Not sure which path?
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="flex flex-col gap-1 rounded-xl border border-[rgba(0,255,178,0.12)] bg-[rgba(0,255,178,0.04)] px-4 py-3.5 text-center sm:text-left">
                <p className="text-[13px] leading-snug text-[#E8FDF5]/92">Need more customers online?</p>
                <Link
                  href="/web-design"
                  className="text-sm font-semibold text-[#00FFB2] underline-offset-2 hover:underline"
                >
                  Web Design →
                </Link>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-[rgba(251,191,36,0.15)] bg-[rgba(251,191,36,0.05)] px-4 py-3.5 text-center sm:text-left">
                <p className="text-[13px] leading-snug text-[#E8FDF5]/92">Need a custom part or print?</p>
                <Link
                  href="/3d-printing"
                  className="text-sm font-semibold text-amber-200/95 underline-offset-2 hover:text-amber-100 hover:underline"
                >
                  3D Printing →
                </Link>
              </div>
            </div>
          </div>

          <ul className="home-reveal mx-auto mt-12 flex max-w-[44rem] flex-col gap-3 rounded-2xl border border-[rgba(232,253,245,0.1)] bg-[rgba(17,26,23,0.55)] px-6 py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 sm:gap-y-2 sm:py-5">
            {["Clear communication", "Practical solutions", "Built around real customer needs"].map((t) => (
              <li key={t} className="text-center text-sm font-medium text-[#E8FDF5]/90 sm:text-[0.9375rem]">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="home-band-hero-foot pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden />
      </section>
    </div>
  );
}
