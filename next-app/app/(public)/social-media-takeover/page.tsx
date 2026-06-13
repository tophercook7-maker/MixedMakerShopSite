import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/social-media-takeover`;

const AREA_SERVED = [
  "Hot Springs AR",
  "Hot Springs Village AR",
  "Lake Hamilton AR",
  "Benton AR",
  "Malvern AR",
  "Lonsdale AR",
  "Arkansas",
] as const;

export const metadata: Metadata = {
  title: "Social Media Takeover for Small Businesses | MixedMakerShop",
  description:
    "Done-for-you social posting across Facebook, Instagram, GBP, LinkedIn, Pinterest, X, and Threads. Posting only — your voice stays yours. From $129/mo, month-to-month.",
  alternates: { canonical },
  openGraph: {
    title: "Social Media Takeover — We Post, You Reply",
    description:
      "Consistent posting across 7 platforms. We handle the publishing. You handle your own comments. The customer never hears from a stranger in your voice.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Stale",
    title: "Owners with abandoned accounts",
    copy: 'Last post was an "Open for the season!" from 2022. Profile is still up, looking like the business closed. We restart the cadence.',
  },
  {
    badge: "02 · Inconsistent",
    title: '"I post when I remember" owners',
    copy: "You'll do four posts in one week then nothing for two months. Consistency is the actual unlock; we provide that.",
  },
  {
    badge: "03 · Picky",
    title: "Owners with opinions about voice",
    copy: "You care that your business sounds like you. You've seen agencies post embarrassing things in your name. We don't do that, on purpose.",
  },
  {
    badge: "04 · Service",
    title: "Service businesses where posting takes the back seat",
    copy: "You're running jobs, not editing reels. Posting is the obvious thing to delegate first.",
  },
  {
    badge: "05 · Burned",
    title: "Owners burned by agency contracts",
    copy: "12-month contract, generic posts, no measurable result, hard to cancel. We're month-to-month and you can see every post before it goes live if you want.",
  },
  {
    badge: "06 · Multi-loc",
    title: "Multi-location operators",
    copy: "Each location needs its own profile and posts. You don't want to manage seven calendars.",
  },
] as const;

const platforms = [
  {
    badge: "01 · FB",
    title: "Facebook",
    copy: "Page posts, photo posts, occasional carousels, and link posts back to your site or blog. Local Hot Springs businesses still get the most engagement here.",
  },
  {
    badge: "02 · IG",
    title: "Instagram",
    copy: "Feed posts and Stories. Photo-first, scheduled at peak engagement windows for your audience.",
  },
  {
    badge: "03 · GBP",
    title: "Google Business Profile",
    copy: "Weekly GBP posts — updates, offers, events. One of the biggest local-visibility levers most owners skip.",
  },
  {
    badge: "04 · LI",
    title: "LinkedIn",
    copy: 'Page posts framed for the LinkedIn audience. B2B angle even if you sell to consumers — "behind the business" content does well here.',
  },
  {
    badge: "05 · Pin",
    title: "Pinterest",
    copy: "Image-rich pins linking back to your blog or product pages. Quiet long-tail traffic that compounds over months.",
  },
  {
    badge: "06 · X",
    title: "X (formerly Twitter)",
    copy: "Short-form posts and the occasional thread, cross-posted from longer content. Lower priority for most local businesses, but free to maintain.",
  },
  {
    badge: "07 · Th",
    title: "Threads",
    copy: "Threads-native posts, slightly different voice than X, paired with the Instagram audience.",
  },
] as const;

const tiers = [
  {
    tag: "SPARK · 1 PLATFORM + GBP",
    price: "$129",
    suffix: "/mo",
    blurb:
      "One platform of your choice (Facebook, Instagram, LinkedIn, Pinterest, X, or Threads) plus weekly Google Business Profile posts. The lowest-friction starting point.",
    bullets: [
      "~8 posts per month total",
      "Weekly GBP post",
      "Platform-tuned framing",
      "Monthly summary of what landed",
      "Optional pre-approval queue",
    ],
    cta: "Start Spark",
    gold: true,
    note: null,
  },
  {
    tag: "LOCAL TRIO · MOST CHOSEN",
    price: "$249",
    suffix: "/mo",
    blurb:
      "Google Business Profile + Facebook + Instagram. The highest-leverage three for a local small business. Cross-posted content, framed for each platform.",
    bullets: [
      "~12 posts per month total",
      "Weekly GBP + 2× Facebook + 2× Instagram",
      "Stories occasionally",
      "Cross-posted blog drops included",
      "Monthly summary of what landed",
    ],
    cta: "Start Local Trio",
    gold: true,
    note: "Recommended for service businesses, restaurants, and local retail.",
  },
  {
    tag: "FULL STACK · ALL 7 PLATFORMS",
    price: "$449",
    suffix: "/mo",
    blurb:
      "Google Business Profile, Facebook, Instagram, LinkedIn, Pinterest, X, and Threads. One stream of content, framed differently per platform. Built for businesses that want to be everywhere it matters.",
    bullets: [
      "~20 posts per month total",
      "All 7 platforms covered",
      "Cross-posted blogs + ad creative",
      "Pinterest + LinkedIn long-tail traffic",
      "Monthly summary & lean-in recs",
    ],
    cta: "Start Full Stack",
    gold: false,
    note: null,
  },
  {
    tag: "PAID ADS PUSH · ADD-ON",
    price: "+$99",
    suffix: "/mo",
    blurb:
      "Layer paid ad management on top of any posting tier. You set the ad budget; we run the campaigns, watch the numbers, and report back monthly. Ad spend is separate and passes through at cost.",
    bullets: [
      "Meta Ads (Facebook + Instagram)",
      "Google Ads (Search or Performance Max)",
      "Ad creative built from posting content",
      "Monthly performance report",
      "Ad spend pays directly to the platform",
    ],
    cta: "Add Paid Ads",
    gold: false,
    note: null,
  },
  {
    tag: "PLATFORM SETUP · ONE-TIME",
    price: "$79",
    suffix: "/ea",
    blurb:
      "Brand-new account, missing profile, or never finished setting it up properly? One-time per-platform fee to create or fully optimize the profile before posting starts.",
    bullets: [
      "Account creation or claim",
      "Profile, bio, links, hours",
      "Brand assets uploaded",
      "Category + search optimization",
      "Verification help where available",
    ],
    cta: "Add Setup",
    gold: false,
    note: null,
  },
] as const;

const includedItems = [
  "Ad creative and ad posts on a cadence (typically 3–5 posts per platform per week)",
  "Blog drops cross-posted to all 7 platforms with platform-appropriate framing",
  "Scheduling, posting, basic image optimization, hashtag/keyword tuning",
  "Monthly summary of what was posted, what landed, what to lean into next",
  "Optional pre-approval queue if you want to see posts before they go live",
] as const;

const notIncludedItems = [
  "Replying to comments, DMs, or messages — you keep doing that",
  "Community management or audience engagement on your behalf",
  "Pretending to be you in any conversation, anywhere",
  '"Engagement" tricks, fake comments, bought followers, follow-for-follow',
] as const;

const faqs = [
  {
    q: "Do you write the content or do I?",
    a: "We do. You give us your brand, your offers, and a quick intake call. We handle the writing, scheduling, and posting. You only see things if you want to (some clients ask for pre-approval; many trust us to ship).",
  },
  {
    q: "Why don't you reply to comments?",
    a: 'Because customers can tell. When the page replies in a slightly-off voice, trust drops. The mechanical "Thanks for your comment! 🙌" is the dead giveaway. You keep your comments; we handle the posting. That\'s the design.',
  },
  {
    q: "Can I just do some of the platforms?",
    a: "Yes. Many clients start with 3 platforms (Facebook + Instagram + GBP — the highest-leverage three for local) and add more later. Pricing scales with platform count.",
  },
  {
    q: "How long is the contract?",
    a: "Month-to-month. No annual commitment. Cancel any time with 30 days' notice so we can responsibly wind down the calendar.",
  },
  {
    q: "Can you also run paid ads?",
    a: "Yes — paid ad management is a separate add-on, billed on top of monthly posting. Most clients start with organic posting and add a small ad budget after 1–2 months.",
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Social Media Posting",
  name: "Social Media Takeover for Small Businesses | MixedMakerShop",
  description:
    "Done-for-you social posting across Facebook, Instagram, GBP, LinkedIn, Pinterest, X, and Threads. Posting only — your voice stays yours.",
  provider: {
    "@type": "LocalBusiness",
    name: "MixedMakerShop",
    url: `${SITE_URL}/`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hot Springs",
      addressRegion: "AR",
      addressCountry: "US",
    },
  },
  areaServed: [...AREA_SERVED],
  url: canonical,
  offers: {
    "@type": "OfferCatalog",
    name: "Social Media Posting Tiers",
    itemListElement: [
      { name: "Spark — 1 platform + GBP", price: "129" },
      { name: "Local Trio — GBP + Facebook + Instagram", price: "249" },
      { name: "Full Stack — all 7 platforms", price: "449" },
      { name: "Paid Ads Push (add-on)", price: "99" },
      { name: "Platform Setup (one-time, per platform)", price: "79" },
    ].map((o) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: o.name },
      price: o.price,
      priceCurrency: "USD",
    })),
  },
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

export default function SocialMediaTakeoverPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Posting only
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Social Media Takeover
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              You give us the business; we publish your ads and blog posts across seven platforms on a consistent
              cadence. You keep answering your own comments and DMs — so when a customer hears from you, it&apos;s
              actually you.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Founder-led posting in Hot Springs, AR. No engagement pods, no bought followers, no AI-comment army
              pretending to be your audience.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Start Posting
              </Link>
              <Link className="btn ghost" href="/pricing">
                See pricing
              </Link>
            </div>
            <p className="small" style={{ marginTop: 14, color: "var(--muted2)" }}>
              Hot Springs • Hot Springs Village • Lake Hamilton • Benton • Malvern • Remote-friendly nationwide
            </p>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="section" aria-labelledby="who-heading">
        <div className="container">
          <div className="panel">
            <h2 id="who-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Who this is for
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              This is for owners who know they should be posting consistently but never get around to it — and who care
              enough about their voice that they don&apos;t want a stranger replying to comments as them.
            </p>
            <div className="how-it-works-grid">
              {whoFor.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHERE WE POST */}
      <section className="section" aria-labelledby="included-heading">
        <div className="container">
          <div className="panel">
            <h2 id="included-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Where we post
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              One stream of content, published across the seven platforms most small businesses actually need. We frame
              each post for the platform — what works on LinkedIn flops on Threads, and vice versa.
            </p>
            <div className="how-it-works-grid">
              {platforms.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Want to combine social posting with a website worth sending traffic to? See{" "}
              <Link href="/web-design-hot-springs-ar">Hot Springs web design</Link>. Weekly GBP posts are part of every
              tier — see <Link href="/google-business-profile-help">Google Business Profile help</Link>. Want the full
              price list? <Link href="/pricing">See the pricing page</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" aria-labelledby="social-pricing-heading">
        <div className="container">
          <div className="panel">
            <h2 id="social-pricing-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Monthly posting tiers
            </h2>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Pick the platform count that matches your business. Every tier is month-to-month, no annual contract,
              cancel any time with 30 days&apos; notice. Posting volume is a starting cadence — we&apos;ll tune it once
              we see what your audience responds to. You handle your own DMs and comments on all tiers; that part is
              deliberate, not an upsell.
            </p>
            <div className="price-grid">
              {tiers.map((t) => (
                <div className="price-card" key={t.tag}>
                  <div className="tag">{t.tag}</div>
                  <div className="price">
                    {t.price}
                    <span style={{ fontSize: ".5em", opacity: 0.7 }}>{t.suffix}</span>
                  </div>
                  <p className="small">{t.blurb}</p>
                  <ul>
                    {t.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="actions">
                    <Link className={t.gold ? "mini gold" : "mini"} href="/contact">
                      {t.cta}
                    </Link>
                  </div>
                  {t.note ? (
                    <p className="small" style={{ marginTop: 10 }}>
                      {t.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Need a custom mix — say, GBP + LinkedIn only, or 4 platforms with extra blogs? Tell Topher what you
              actually want; we&apos;ll quote it directly instead of forcing you into a tier that doesn&apos;t fit.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED / NOT */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What&apos;s included — and what&apos;s deliberately not
            </h2>
            <p className="small" style={{ margin: "0 0 8px", color: "var(--muted)", fontWeight: 800 }}>
              Included:
            </p>
            <ul style={{ margin: "0 0 20px 18px", color: "var(--muted)", lineHeight: 1.7 }}>
              {includedItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="small" style={{ margin: "0 0 8px", color: "var(--muted)", fontWeight: 800 }}>
              Deliberately NOT included:
            </p>
            <ul style={{ margin: "0 0 20px 18px", color: "var(--muted)", lineHeight: 1.7 }}>
              {notIncludedItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              This isn&apos;t laziness — it&apos;s a design choice. When your audience hears from you in DMs and comments,
              it should be you. The moment a customer can tell the page is replying in a slightly-off voice, trust drops,
              and that compounds across every other interaction.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              You keep your comments. We handle the posting. That&apos;s the deal.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" aria-labelledby="cta-heading">
        <div className="container">
          <div className="panel" style={{ textAlign: "center" }}>
            <div className="kicker" style={{ margin: "0 auto" }}>
              <span className="dot" /> Free to ask
            </div>
            <h2 id="cta-heading" className="section-heading" style={{ margin: "14px 0 12px" }}>
              Want consistency without the homework?
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Tell Topher about your business and which platforms matter most. We&apos;ll quote a monthly posting cadence
              sized to your business — usually 3 platforms to start, with the option to add more later.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Start Posting
              </Link>
              <Link className="btn ghost" href="/pricing">
                See pricing
              </Link>
            </div>
            <p className="small" style={{ marginTop: 14, color: "var(--muted)" }}>
              Direct communication with Topher Cook • Hot Springs, AR • Fast turnaround
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="panel">
            <h2 id="faq-heading" className="section-heading" style={{ margin: "0 0 18px" }}>
              Frequently asked questions
            </h2>
            {faqs.map((f) => (
              <div className="card" style={{ marginBottom: 14 }} key={f.q}>
                <h3 style={{ margin: "0 0 8px" }}>{f.q}</h3>
                <p className="small" style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </div>
            ))}
            <p className="small" style={{ margin: "18px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Have a different question? <Link href="/contact">Ask Topher directly</Link> — or check the{" "}
              <Link href="/pricing">pricing page</Link> for what each service costs.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
