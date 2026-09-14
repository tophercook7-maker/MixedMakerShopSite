import type { Metadata } from "next";
import {
  mmsPageBg,
  mmsSectionY,
  mmsEyebrow,
  mmsLead,
  mmsBtnPrimary,
  mmsCard,
} from "@/lib/mms-umbrella-ui";
import { publicTopherEmail } from "@/lib/public-brand";

export const metadata: Metadata = {
  title: "Pay Mixed Maker Shop | Secure Card Payment",
  description:
    "Pay for your Mixed Maker Shop service securely by card — websites, audiobooks, promo videos, and more. Powered by Stripe.",
  robots: { index: false, follow: false },
};

type PayItem = { name: string; price: string; desc: string; url: string };

const services: PayItem[] = [
  {
    name: "Custom Website",
    price: "$450",
    desc: "A full small-business website, built for calls and leads.",
    url: "https://buy.stripe.com/5kQeV65vsgqHecddFA3cc0f",
  },
  {
    name: "Setup Help",
    price: "$129",
    desc: "Hands-on setup — domain, email, Google profile, the works.",
    url: "https://buy.stripe.com/00w14gaPMa2j2tvcBw3cc06",
  },
  {
    name: "Promo Video",
    price: "$250",
    desc: "A cinematic promo video for your business, event, or offer.",
    url: "https://buy.stripe.com/6oU00c9LIa2jb0130W3cc0i",
  },
  {
    name: "Author Package",
    price: "$799",
    desc: "Your book written, formatted, and made ready to publish.",
    url: "https://buy.stripe.com/6oU8wI4roeizecd30W3cc0k",
  },
  {
    name: "Book-to-Game",
    price: "$350",
    desc: "Turn your book into an interactive, playable game.",
    url: "https://buy.stripe.com/8x26oA4rob6n2tvfNI3cc0j",
  },
  {
    name: "Audiobook — Single Voice",
    price: "$150",
    desc: "Your book narrated start to finish in a warm voice.",
    url: "https://buy.stripe.com/00w14gbTQ1vNb016d83cc0h",
  },
  {
    name: "Audiobook — Character Voices",
    price: "$250",
    desc: "Full narration that acts the parts, scene by scene.",
    url: "https://buy.stripe.com/6oUaEQ2jg1vN7NPfNI3cc0g",
  },
];

export default function PayPage() {
  return (
    <div className={mmsPageBg}>
      <section className={`${mmsSectionY} mx-auto w-full max-w-5xl px-5`}>
        <p className={mmsEyebrow}>Secure Payment · Powered by Stripe</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#2f3e34] md:text-5xl">
          Pay Mixed Maker Shop
        </h1>
        <p className={`${mmsLead} mt-5 max-w-2xl`}>
          Pick what you&rsquo;re paying for and tap the button — you&rsquo;ll pay securely by card
          through Stripe. Not sure of the amount, or need something custom?{" "}
          <a
            href={`mailto:${publicTopherEmail}?subject=Custom%20payment`}
            className="font-semibold text-[#2f3e34] underline underline-offset-2"
          >
            Email me
          </a>{" "}
          and I&rsquo;ll send you a link for the exact amount.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.name} className={`${mmsCard} flex flex-col p-7`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#2f3e34]">{s.name}</h2>
                <span className="text-2xl font-bold text-[#2f3e34]">{s.price}</span>
              </div>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#4a5750]">{s.desc}</p>
              <a
                href={s.url}
                className={`${mmsBtnPrimary} mt-6 inline-flex w-full justify-center px-6 no-underline hover:no-underline`}
              >
                Pay {s.price}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#6b756e]">
          Payments are processed securely by Stripe. Mixed Maker Shop never sees or stores your
          card details.
        </p>
      </section>
    </div>
  );
}
