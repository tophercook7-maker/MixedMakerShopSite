import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";
import { publicTopherEmail } from "@/lib/public-brand";
import { contactHrefForTopic } from "@/lib/what-i-do";

const canonical = `${SITE_URL}/3d-printing`;
const askHref = contactHrefForTopic("3d-printing");

export const metadata: Metadata = {
  title: "3D Printing Service Hot Springs AR | Send a File or a Photo",
  description:
    "Local 3D printing in Hot Springs, Arkansas. Three printers ready for replacement parts, brackets, organizers, decorations, gifts, and custom pieces. Send an STL or a photo — quoted before anything prints. Local delivery or shipped.",
  alternates: { canonical },
  openGraph: {
    title: "3D Printing — Hot Springs, AR",
    description:
      "Have a model? Send the file. Have a broken part? Send a photo. Three printers, honest quotes, local delivery or shipping.",
    url: canonical,
    type: "website",
    images: ["/images/printing/bambu-fleet-three-monitor-hero.png"],
  },
};

const whatIPrint = [
  {
    badge: "01 · Parts",
    title: "Replacement parts",
    copy: "The clip that snapped, the knob that's discontinued, the bracket nobody sells anymore. Send a photo with a ruler in it and I'll tell you whether it's printable.",
    img: "/images/printing/printing-replacement-part.png",
  },
  {
    badge: "02 · Fixes",
    title: "Custom fixes & adapters",
    copy: "Something that almost fits. A mount that needs to be two inches longer. A holder for that one odd-shaped tool. Measured, modeled, printed.",
    img: "/images/printing/printing-custom-fix.png",
  },
  {
    badge: "03 · Organize",
    title: "Organizers & holders",
    copy: "Drawer inserts, tool holders, cable tidies, wall mounts, desk organizers — sized to your space instead of the closest thing on a shelf.",
    img: "/images/printing/printing-tool-holder.png",
  },
  {
    badge: "04 · Mounts",
    title: "Wall & shelf mounts",
    copy: "Controller hangers, headphone hooks, remote caddies, phone stands, bracket plates — printed strong enough to actually hold the thing.",
    img: "/images/printing/printing-wall-mount.png",
  },
  {
    badge: "05 · Libraries",
    title: "Anything from the model libraries",
    copy: "Thingiverse, Printables, Cults3D, MyMiniFactory, CGTrader — found a model you love? Send the link. I'll check it's printable and quote it.",
    img: "/images/printing/printing-case-organize.png",
  },
  {
    badge: "06 · Gifts",
    title: "Decorations, gifts & small batches",
    copy: "Name plates, ornaments, figurines, event favors, a dozen of the same thing for a team or a classroom. Color choices available.",
    img: "/images/printing/printing-case-mount.png",
  },
] as const;

const howItWorks = [
  {
    step: "1",
    title: "Send a file, a link, or a photo",
    copy: "STL or 3MF if you have one. A link to the model if you found it online. A clear photo with something for scale if it's a broken part.",
  },
  {
    step: "2",
    title: "Get a real quote",
    copy: "I check printability, size, material, and time, and reply with a price. Simple library prints are usually quoted the same day. Nothing prints until you say yes.",
  },
  {
    step: "3",
    title: "Pick it up, get it delivered, or have it shipped",
    copy: "Local to Hot Springs? I can drop it off. Not local? It ships. Either way you get a photo of the finished print before it leaves.",
  },
] as const;

const faqs = [
  {
    q: "What if I don't have a 3D file?",
    a: "Send a photo of the object (with a ruler or a coin in the shot for scale) and a sentence about what it needs to do. Simple parts can often be modeled from that. Complex mechanical parts may need measurements or the original to work from — I'll tell you up front.",
  },
  {
    q: "How much does a print cost?",
    a: "Small library prints usually run in the $10–$30 range including material. Larger, multi-part, or custom-modeled pieces are quoted individually. You always get the number before anything prints.",
  },
  {
    q: "What materials and colors?",
    a: "PLA and PETG in a range of colors for most jobs; tougher materials for parts that live outdoors or take stress. Tell me where the part will live and I'll pick the right one.",
  },
  {
    q: "How long does it take?",
    a: "Most single prints are done within a few days of approval. Batches and large pieces take longer — the quote includes a turnaround estimate.",
  },
  {
    q: "Can you design something from scratch?",
    a: "Yes, for practical parts and simple shapes. If it needs an engineer or a sculptor I'll say so rather than sell you something half-right.",
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "3D Printing Service",
  name: "3D Printing — Hot Springs, AR",
  description:
    "Local 3D printing for replacement parts, custom fixes, organizers, mounts, decorations, and models from public design libraries. Quoted before printing. Local delivery or shipping.",
  provider: {
    "@type": "LocalBusiness",
    name: "MixedMakerShop",
    url: `${SITE_URL}/`,
    address: { "@type": "PostalAddress", addressLocality: "Hot Springs", addressRegion: "AR", addressCountry: "US" },
  },
  areaServed: ["Hot Springs AR", "Hot Springs Village AR", "Benton AR", "Malvern AR", "Arkansas", "United States (shipped)"],
  url: canonical,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ThreeDPrintingPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div>
                <div className="kicker">
                  <span className="dot" /> Hot Springs, Arkansas · local delivery or shipped
                </div>
                <h1 className="h1" style={{ margin: "14px 0 14px" }}>
                  Got a 3D model? Got a broken part? I&apos;ll print it.
                </h1>
                <p className="subhead" style={{ margin: "0 0 18px" }}>
                  Three 3D printers, ready to go. Replacement parts, custom fixes, organizers, mounts, decorations, gifts
                  — from your own file, from the big model libraries, or modeled from a photo when the part doesn&apos;t
                  exist yet.
                </p>
                <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
                  Every job is quoted before it prints. Local to Hot Springs and I can drop it off; anywhere else and
                  it ships. You get a photo of the finished piece before it leaves the bench.
                </p>
                <div className="btn-row">
                  <Link className="btn gold btn-cta-primary" href={askHref}>
                    Request a print quote
                  </Link>
                  <a className="btn ghost" href={`mailto:${publicTopherEmail}?subject=3D%20print%20request`}>
                    Email a file
                  </a>
                </div>
                <p className="small" style={{ marginTop: 14, color: "var(--muted2)" }}>
                  Accepts STL · 3MF · a model link · or a photo with something for scale
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <Image
                  src="/images/printing/bambu-fleet-three-monitor-hero.png"
                  alt="Send us your STL file and we'll print it — or choose from Thingiverse, Cults3D, Printables, MyMiniFactory, CGTrader, STLfinder"
                  width={1024}
                  height={1536}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT I PRINT */}
      <section className="section" aria-labelledby="print-what-heading">
        <div className="container">
          <div className="panel">
            <h2 id="print-what-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What people actually send
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Mostly practical stuff. If yours isn&apos;t on this list, send it anyway — the answer is usually yes.
            </p>
            <div className="how-it-works-grid">
              {whatIPrint.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                    <Image src={c.img} alt={c.title} width={640} height={400} className="h-auto w-full object-cover" />
                  </div>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" aria-labelledby="print-how-heading">
        <div className="container">
          <div className="panel">
            <h2 id="print-how-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              How it works
            </h2>
            <div className="how-it-works-grid">
              {howItWorks.map((s) => (
                <div className="how-it-works-card" key={s.title}>
                  <span className="how-it-works-badge">Step {s.step}</span>
                  <h3 className="how-it-works-title">{s.title}</h3>
                  <p className="how-it-works-copy">{s.copy}</p>
                </div>
              ))}
            </div>
            <div className="btn-row" style={{ marginTop: 22 }}>
              <Link className="btn gold btn-cta-primary" href={askHref}>
                Request a print quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="print-faq-heading">
        <div className="container">
          <div className="panel">
            <h2 id="print-faq-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Questions people ask first
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {faqs.map((f) => (
                <div className="card" key={f.q}>
                  <h3 className="how-it-works-title" style={{ marginBottom: 8 }}>
                    {f.q}
                  </h3>
                  <p className="how-it-works-copy">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Need something that&apos;s more invention than print — a gadget, a prototype, AI plus hardware? That&apos;s
              on the bench too:{" "}
              <Link href={contactHrefForTopic("ideas")}>tell me the idea</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
