import Image from "next/image";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import {
  publicBodyMutedClass,
  publicEyebrowWebClass,
  publicH2WebClass,
  publicShellClass,
} from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const QUOTE_CAPTURE_IMAGE =
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80";

const cardClass =
  "group flex flex-col overflow-hidden rounded-2xl border border-[rgba(0,255,178,0.12)] bg-[rgba(15,21,19,0.65)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[rgba(0,255,178,0.22)] hover:shadow-[0_22px_60px_rgba(0,0,0,0.35)]";

const sectionY = "py-16 md:py-20 lg:py-[5.25rem]";

export function WebDesignProofStrip() {
  const landscaping = getPortfolioSampleBySlug("landscaping");
  const pressureWashing = getPortfolioSampleBySlug("pressure-washing");
  const mobileSample = getPortfolioSampleBySlug("auto-detailing");

  const items: {
    href: string;
    imageUrl: string;
    imageAlt: string;
    caption: string;
    outcome: string;
  }[] = [];

  if (landscaping) {
    items.push({
      href: "/samples/landscaping",
      imageUrl: landscaping.cardImageUrl,
      imageAlt: `${landscaping.title} — sample homepage preview`,
      caption: "Landscaping demo homepage",
      outcome: "Shows services clearly so homeowners know what you offer and how to reach you.",
    });
  }
  if (pressureWashing) {
    items.push({
      href: "/samples/pressure-washing",
      imageUrl: pressureWashing.cardImageUrl,
      imageAlt: `${pressureWashing.title} — landing page preview`,
      caption: "Pressure washing landing page",
      outcome: "One focused offer and a strong quote path so exterior jobs convert faster.",
    });
  }
  items.push({
    href: "/samples/quote-calculator",
    imageUrl: QUOTE_CAPTURE_IMAGE,
    imageAlt: "Desk with laptop and estimating paperwork — lead capture style tool",
    caption: "Quote-style lead capture",
    outcome: "Turns “how much?” questions into structured requests you can follow up on.",
  });
  if (mobileSample) {
    items.push({
      href: "/samples/auto-detailing",
      imageUrl: mobileSample.cardImageUrl,
      imageAlt: `${mobileSample.title} — mobile-friendly layout preview`,
      caption: "Mobile-first local site",
      outcome: "Reads cleanly on phones — where most local searches and taps happen.",
    });
  }

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="web-design-proof-heading"
      className="home-band home-band--deep border-y border-[rgba(232,253,245,0.06)]"
    >
      <div className={cn(publicShellClass, sectionY)}>
        <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
          <p className={cn("home-reveal", publicEyebrowWebClass)}>Proof</p>
          <h2 id="web-design-proof-heading" className={cn("home-reveal mt-4", publicH2WebClass)}>
            Real builds—not generic filler
          </h2>
          <p className={cn("home-reveal mt-4", publicBodyMutedClass, "mx-auto max-w-2xl text-sm md:text-base")}>
            Short looks at the kind of pages and flows local businesses actually ship. Tap any card to open the full
            sample.
          </p>
        </div>

        <div className="home-reveal mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
          {items.map((item) => (
            <TrackedPublicLink
              key={item.href + item.caption}
              href={item.href}
              eventName="public_web_design_sample_click"
              eventProps={{ location: "web_design_proof", label: item.caption }}
              className={cn(
                cardClass,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,255,178,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1210]",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0F1513]">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  className="object-cover opacity-95 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F0E]/85 via-[#0B0F0E]/20 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-4 md:p-5">
                <p className="text-[0.9375rem] font-semibold leading-snug text-[#E8FDF5] md:text-base">{item.caption}</p>
                <p className={cn("mt-2 flex-1 text-[0.8125rem] leading-relaxed md:text-sm", publicBodyMutedClass)}>
                  {item.outcome}
                </p>
                <span className="mt-4 inline-flex items-center text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#00FFB2]/90 transition group-hover:text-[#35ffc1]">
                  View sample →
                </span>
              </div>
            </TrackedPublicLink>
          ))}
        </div>
      </div>
    </section>
  );
}
