import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsGlassPanelDense,
  mmsH1,
  mmsH2,
  mmsPageBg,
  mmsSectionBorder,
  mmsSectionY,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing | MixedMakerShop",
  description:
    "Simple, honest web design pricing — Starter $400, Growth $600, ongoing support from $89/mo. Start with a free homepage preview.",
};

const shell = publicShellClass;

const packages = [
  {
    name: "Starter Website",
    price: "$400",
    blurb: "A clean, professional site to get your business online and looking right.",
  },
  {
    name: "Growth Website",
    price: "$600",
    blurb: "Built to help you get more leads, better visibility, and real results.",
  },
  {
    name: "Ongoing Support",
    price: "from $89/month",
    blurb: "Updates, improvements, and support to keep your site working.",
  },
] as const;

export default function PricingPage() {
  return (
    <div className={cn(mmsPageBg, "border-b", mmsSectionBorder)}>
      <div className={cn(shell, mmsSectionY)}>
        <div className={cn(mmsGlassPanelDense, "max-w-3xl p-6 sm:p-8")}>
          <h1 className={mmsH1}>Simple, honest pricing</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#354239] md:text-lg">
            No guesswork. Just clear options depending on what your business needs.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {packages.map((pkg) => (
            <div key={pkg.name} className={cn(mmsGlassPanelDense, "flex flex-col p-6 sm:p-8")}>
              <h2 className="text-lg font-bold tracking-tight text-[#1e241f] md:text-xl">{pkg.name}</h2>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#8a4b2a] md:text-[1.65rem]">{pkg.price}</p>
              <p className="mt-5 text-sm leading-relaxed text-[#354239] md:text-[15px]">{pkg.blurb}</p>
            </div>
          ))}
        </div>

        <div className={cn(mmsGlassPanelDense, "mx-auto mt-12 max-w-2xl p-8 text-center sm:p-10")}>
          <p className="text-base leading-relaxed text-[#354239] md:text-lg">
            Not sure what you need? I&apos;ll design a free homepage preview first so you can see the direction before
            committing.
          </p>
          <TrackedPublicLink
            href="/free-mockup"
            eventName="public_contact_cta_click"
            eventProps={{ location: "pricing_page", target: "free_mockup" }}
            className={cn(
              mmsBtnPrimary,
              "mx-auto mt-8 inline-flex min-h-[3.35rem] w-full max-w-md items-center justify-center gap-2 px-8 py-6 text-base font-semibold no-underline hover:no-underline sm:w-auto",
            )}
          >
            Get My Free Website Preview
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </TrackedPublicLink>
        </div>
      </div>
    </div>
  );
}
