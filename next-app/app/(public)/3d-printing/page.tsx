import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintingQuoteForm } from "@/components/printing/PrintingQuoteForm";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";

export const metadata: Metadata = {
  title: "GiGi’s Print Shop | Custom 3D Printing in Hot Springs, AR",
  description:
    "Useful 3D printed items, bookmarks, gifts, replacement pieces, seasonal prints, and custom requests from GiGi’s Print Shop at MixedMakerShop.",
  keywords: [
    "3D printing Hot Springs",
    "custom 3D printing Hot Springs AR",
    "3D printed bookmarks",
    "replacement parts 3D printing",
    "GiGi's Print Shop",
  ],
};

const shell = publicShellClass;

const makes = [
  {
    title: "Bookmarks & Church Items",
    body: "Custom bookmarks, scripture gifts, seasonal church pieces, and simple group items.",
  },
  {
    title: "Useful Household Prints",
    body: "Holders, organizers, hooks, trays, clips, labels, and everyday helpers.",
  },
  {
    title: "Replacement Pieces",
    body: "Small plastic parts, missing pieces, brackets, knobs, caps, and fix-it prints.",
  },
  {
    title: "Seasonal & Gift Prints",
    body: "Easter items, Christmas pieces, party favors, small gifts, and personalized prints.",
  },
  {
    title: "Custom Requests",
    body: "Have an idea, broken piece, or useful thing in mind? Send it over and we’ll see what can be made.",
  },
] as const;

const gallery = [
  { title: "Bookmark examples", src: "/images/products/3d-fish-keychain.png" },
  { title: "Useful holders", src: "/images/printing/printing-tool-holder.png" },
  { title: "Replacement parts", src: "/images/printing/printing-replacement-part.png" },
  { title: "Seasonal prints", src: "/images/products/baby-dragon.png" },
  { title: "Custom requests", src: "/images/printing/printing-custom-fix.png" },
] as const;

const faqs = [
  {
    q: "Can you print custom requests?",
    a: "Yes. Send the idea, measurements, a photo, or a file and we’ll tell you what looks possible.",
  },
  {
    q: "Can you make bookmarks for church or events?",
    a: "Yes. Bookmarks, simple scripture gifts, seasonal pieces, and group items are a good fit.",
  },
  {
    q: "Can you print replacement parts?",
    a: "Sometimes. Small plastic pieces, brackets, knobs, caps, and fix-it parts are worth asking about.",
  },
  {
    q: "How much does a print cost?",
    a: "Pricing depends on size, material, print time, and design complexity. We’ll send a simple estimate first.",
  },
  {
    q: "Do I need a 3D model file?",
    a: "No. A file helps, but a photo or description is enough to start the conversation.",
  },
  {
    q: "Can I send a photo of what I need?",
    a: "Yes. The existing print request form supports images and 3D files.",
  },
  {
    q: "Do you offer local pickup?",
    a: "Local pickup is usually the easiest option around Hot Springs. Ask about delivery or shipping if needed.",
  },
] as const;

export default function ThreeDPrintingPage() {
  return (
    <article className="home-umbrella-canvas relative min-h-screen w-full overflow-x-hidden scroll-smooth antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={cn(mmsUmbrellaSectionBackdropImmersive, "relative overflow-hidden")}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_28%)]" />
          <div className={cn(shell, mmsSectionY, "relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center")}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl border-pink-300/25 bg-gradient-to-br from-pink-500/12 via-white/8 to-orange-400/8">
              <p className="text-sm uppercase tracking-[0.22em] text-pink-200/90">GiGi’s Print Shop</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">GiGi’s Print Shop</h1>
              <p className={cn("mt-6 text-lg font-semibold leading-relaxed md:text-2xl", mmsOnGlassPrimary)}>
                Useful 3D printed items, custom requests, bookmarks, gifts, replacement pieces, and practical little
                things people can actually use.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                GiGi handles most of the 3D printing side of MixedMakerShop. She likes making useful things people will
                actually use — bookmarks, gifts, holders, replacement pieces, seasonal prints, church items, and custom
                requests.
              </p>
              <ul className={cn("mt-6 list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                <li>
                  <strong className="font-semibold text-white/95">Custom quote</strong> — every job starts with a simple
                  estimate after we understand the part.
                </li>
                <li>
                  <strong className="font-semibold text-white/95">Small-batch prints</strong> — good fit when you need a
                  handful of the same piece, not factory volume.
                </li>
                <li>
                  <strong className="font-semibold text-white/95">Prototype help</strong> — useful when you are testing fit,
                  feel, or a physical idea before committing.
                </li>
                <li>
                  <strong className="font-semibold text-white/95">Replacement-style parts</strong> — worth asking about for
                  small plastic pieces when a practical print makes sense.
                </li>
                <li>
                  <strong className="font-semibold text-white/95">Turnaround</strong> — depends on size, material, detail,
                  and queue; the estimate pass sets expectations.
                </li>
              </ul>
              <PublicCtaRow className="mt-9">
                <Link href={printingQuoteHref()} className={cn(mmsBtnPrimary, "w-full px-8 no-underline hover:no-underline sm:w-auto")}>
                  Start a Print Request
                </Link>
                <Link href="#seasonal-prints" className={cn(mmsBtnSecondaryOnGlass, "w-full px-8 no-underline hover:no-underline sm:w-auto")}>
                  Ask About Bookmarks or Gifts
                </Link>
              </PublicCtaRow>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {gallery.slice(0, 4).map((item) => (
                <div key={item.title} className="public-glass-box--soft overflow-hidden rounded-3xl border-pink-200/15 bg-white/8">
                  <div className="relative aspect-square">
                    <Image src={item.src} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 260px" />
                  </div>
                  <p className="px-4 py-3 text-sm font-semibold text-white/85">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="what-gigi-makes" className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>What GiGi Makes</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Useful, giftable, practical prints.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {makes.map((item) => (
                <article key={item.title} className="public-glass-box--soft public-glass-box--pad border-pink-200/15">
                  <h3 className="text-xl font-bold tracking-tight text-white">{item.title}</h3>
                  <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="seasonal-prints" className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad border-pink-300/25 bg-gradient-to-br from-[#F472B6]/15 via-white/8 to-[#FFF7ED]/10">
              <p className="text-sm uppercase tracking-[0.22em] text-pink-200/90">Featured seasonal prints</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Easter, Church &amp; Gift Prints</h2>
              <p className={cn("mt-5 max-w-3xl text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                GiGi is starting with useful and thoughtful prints like bookmarks for church, Easter items, seasonal
                gifts, and small custom pieces that are easy to share.
              </p>
              <Link href={printingQuoteHref()} className={cn(mmsTextLinkOnGlass, "mt-7 inline-flex items-center gap-2")}>
                Ask About Seasonal Prints <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>How It Works</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Simple request, simple estimate.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-5">
              {[
                "Send an idea, photo, or description.",
                "We check if it can be printed.",
                "You get a simple estimate.",
                "GiGi prints it.",
                "Pick it up locally or ask about delivery/shipping.",
              ].map((step, i) => (
                <div key={step} className="public-glass-box--soft public-glass-box--pad">
                  <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-pink-200/25 bg-pink-400/15 text-sm font-bold text-pink-100">
                    {i + 1}
                  </span>
                  <p className={cn("text-sm leading-relaxed", mmsOnGlassSecondary)}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Gallery</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Photo examples from recent prints.</h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {gallery.map((item) => (
                <article key={item.title} className="public-glass-box--soft overflow-hidden">
                  <div className="relative aspect-square">
                    <Image src={item.src} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 220px" />
                  </div>
                  <p className="px-4 py-4 text-sm font-semibold text-white">{item.title}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="print-request" className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, "pt-10")}>
            <div className="public-glass-box public-glass-box--pad mx-auto mb-10 max-w-3xl border-pink-300/20">
              <p className={mmsSectionEyebrowOnGlass}>Print Request</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Start a print request.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Use the existing MixedMakerShop print request form below. It safely creates a 3D printing lead in the
                CRM with the existing upload support.
              </p>
            </div>
          </div>
          <PrintingQuoteForm />
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>FAQ</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Common questions</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {faqs.map((item) => (
                <article key={item.q} className="public-glass-box--soft public-glass-box--pad">
                  <h3 className="text-lg font-bold text-white">{item.q}</h3>
                  <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
