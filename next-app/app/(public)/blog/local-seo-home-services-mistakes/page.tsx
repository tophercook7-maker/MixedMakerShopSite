import type { Metadata } from "next";
import Link from "next/link";
import {
  BlogArticleImage,
  BlogInlineCta,
  BlogPostLayout,
} from "@/components/public/BlogPostLayout";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const slug = "local-seo-home-services-mistakes";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "7 Mistakes You’re Making with Local SEO (and Why They’re Killing Your “Near Me” Traffic)";
const subtitle = "Straight talk for landscaping, HVAC, plumbing, and home service crews who need to show up on Google";

export const metadata: Metadata = {
  title: `${title} | MixedMakerShop Blog`,
  description:
    "Seven local SEO mistakes home service businesses make — one-page services, stale Google profiles, NAP inconsistency, mobile speed, and more — plus how to fix them.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "Why near-me traffic dies for contractors and how to fix local SEO for landscaping, HVAC, plumbing, and trade businesses.",
    url: canonical,
  },
};

export default function LocalSeoHomeServicesMistakesPostPage() {
  return (
    <BlogPostLayout
      slug={slug}
      category="Local SEO"
      readTime="7 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/XDn6tMWlGou.webp",
        alt: "Workshop with a laptop showing local SEO maps and trade tools",
      }}
    >
      <p>
        If you&apos;re running a landscaping crew, an HVAC team, or a plumbing shop, you probably don&apos;t have time to
        sit around and wonder why your website isn&apos;t showing up on Google. You&apos;re too busy in the field,
        managing crews, and making sure the actual work gets done.
      </p>
      <p>
        But here is the reality: <strong>&quot;Near Me&quot; searches</strong> are the lifeblood of home services. When a
        homeowner&apos;s basement is flooding or their yard looks like a jungle, they don&apos;t scroll through page five
        of Google. They click the first three results that look competent and close by.
      </p>
      <p>
        If you aren&apos;t there, you&apos;re invisible. And most of the time, you&apos;re invisible because of a few
        common, avoidable mistakes. At <Link href="/">MixedMakerShop</Link>, I see these same errors over and over again.
        We don&apos;t do &quot;agency fluff&quot; here — we do straight talk.
      </p>
      <p>
        Here are the 7 mistakes killing your <strong>SEO for home service businesses</strong> and how to fix them.
      </p>

      <h2>1. The &quot;One-Page Service&quot; Trap</h2>
      <p>
        Most contractors have a single page titled &quot;Services.&quot; It&apos;s a laundry list:{" "}
        <em>Mowing, Mulching, Tree Trimming, Retaining Walls.</em>
      </p>
      <p>
        <strong>The Mistake:</strong> Google doesn&apos;t rank &quot;laundry lists.&quot; It ranks specific answers to
        specific questions. If someone searches for &quot;retaining wall contractor,&quot; your generic services page is
        competing against a competitor who has an entire page dedicated to retaining walls. Guess who wins?
      </p>
      <p>
        <strong>The Fix:</strong> Build dedicated pages for your high-value services. If you do landscaping, you need a
        page for landscape design, another for lawn maintenance, and another for hardscaping. This is exactly how we
        handle <Link href="/lawn-care-hot-springs-ar">local SEO for landscaping companies</Link> — by giving each service
        the room it needs to breathe and rank.
      </p>

      <h2>2. Ignoring the Neighborhood &quot;Micro-Zones&quot;</h2>
      <p>
        You might serve a 50-mile radius, but ranking for a massive metro area is expensive and hard.
      </p>
      <p>
        <strong>The Mistake:</strong> Only targeting the big city name. If you&apos;re in a suburb or a specific
        neighborhood, that&apos;s where the high-intent, low-competition leads are hiding.
      </p>
      <p>
        <strong>The Fix:</strong> Create service area pages. Don&apos;t just say &quot;we serve the greater area.&quot;
        Prove it. Build landing pages for the specific towns and neighborhoods you actually drive to every day. This tells
        search engines (and humans) exactly where you are willing to work.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/6i4U6J3FTvH.webp"
        alt="Google Business Profile view on a mobile phone at a job site"
      />

      <h2>3. Treating Your Google Profile Like a Static Business Card</h2>
      <p>
        Your Google Business Profile (GBP) isn&apos;t a &quot;set it and forget it&quot; tool. It&apos;s a live
        representation of your business.
      </p>
      <p>
        <strong>The Mistake:</strong> Claiming your profile three years ago and never touching it again. No new photos,
        no updates, and no service area tweaks. Google rewards active profiles. If your profile is stale, you&apos;ll sink
        in the &quot;Map Pack&quot; (those top three results on the map).
      </p>
      <p>
        <strong>The Fix:</strong>
      </p>
      <ul>
        <li>
          <strong>Post weekly updates:</strong> Share a photo of a completed job or a quick tip.
        </li>
        <li>
          <strong>Upload real photos:</strong> Not stock photos — real photos of your trucks, your team, and your work.
        </li>
        <li>
          <strong>Update your services:</strong> Ensure every specific trade you offer is checked off in the backend.
        </li>
      </ul>

      <h2>4. Review Silence (The Lead Killer)</h2>
      <p>
        Reviews are the ultimate social proof. But it&apos;s not just about having a high rating; it&apos;s about{" "}
        <em>velocity</em> and <em>response</em>.
      </p>
      <p>
        <strong>The Mistake:</strong> Having 50 reviews from 2022 and nothing recent. Or worse, having 100 reviews and
        never replying to a single one.
      </p>
      <p>
        <strong>The Fix:</strong> You need a system to ask for reviews after every single job. And when you get them,{" "}
        <strong>reply to them.</strong> Even the bad ones. A professional, direct response to a 1-star review often looks
        better to a prospective client than a perfect 5-star rating with no interaction. It shows you&apos;re a real
        person who stands by their work.
      </p>

      <h2>5. NAP Inconsistency (The Digital Identity Crisis)</h2>
      <p>NAP stands for Name, Address, and Phone number. This is your digital fingerprint.</p>
      <p>
        <strong>The Mistake:</strong> Your website says &quot;Main St. Landscaping,&quot; your Facebook says &quot;Main
        Street Landscape &amp; Design,&quot; and your Yelp listing has an old phone number. This confuses Google&apos;s
        bots. If they aren&apos;t 100% sure your business is legitimate and consistent, they won&apos;t recommend you.
      </p>
      <p>
        <strong>The Fix:</strong> Do an audit. Make sure your business name, address, and phone number are{" "}
        <strong>identical</strong> across every single platform — from your website footer to your Apple Maps listing.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/JeFtag72t3V.webp"
        alt="Mobile phone showing a clear CTA button within easy thumb reach"
      />

      <h2>6. The &quot;Thumb Reach&quot; and Mobile Speed Slump</h2>
      <p>
        Most of your customers are finding you while they&apos;re standing in their kitchen or sitting in their driveway.
        They are on their phones.
      </p>
      <p>
        <strong>The Mistake:</strong> Having a website that looks great on a 27-inch monitor but is a nightmare on a
        smartphone. If your phone number isn&apos;t a &quot;click-to-call&quot; link or if your &quot;Request an
        Estimate&quot; button is tiny and buried, you are losing money.
      </p>
      <p>
        <strong>The Fix:</strong> We design with &quot;thumb reach&quot; in mind. This means the most important actions —
        calling you or filling out a form — are positioned where a thumb can naturally hit them. Your site also needs to
        load in under three seconds. If it&apos;s bogged down by giant, unoptimized images, people will bounce before
        they even see your logo.
      </p>

      <h2>7. Generic Content that AI Can&apos;t &quot;See&quot;</h2>
      <p>
        In 2026, search isn&apos;t just about keywords; it&apos;s about utility. AI-driven search engines are looking for
        &quot;useful&quot; answers.
      </p>
      <p>
        <strong>The Mistake:</strong> Using canned, AI-generated text that says &quot;We provide high-quality landscaping
        services at affordable prices.&quot; Everyone says that. It&apos;s noise.
      </p>
      <p>
        <strong>The Fix:</strong> Write like a builder, not a bot. Explain <em>why</em> you use a specific type of pipe
        for drainage in your local soil. Talk about the specific grass types that thrive in your county. This
        &quot;glass-box&quot; transparency builds trust with customers and provides the detailed context that modern
        search engines crave.
      </p>

      <h2>Let&apos;s Build a Site that Actually Works</h2>
      <p>
        SEO doesn&apos;t have to be a mystery. It&apos;s about being clear, being consistent, and showing up where your
        customers are looking.
      </p>
      <p>
        At MixedMakerShop, I handle the heavy lifting of web design and local SEO foundations so you can get back to the
        field. I don&apos;t believe in locking people into high-overhead contracts without proof. That&apos;s why I offer
        a <strong>free website homepage preview.</strong>
      </p>
      <p>You get to see exactly where we&apos;re headed before you spend a dime.</p>

      <BlogInlineCta>
        <p className="!mb-0 font-semibold text-white">Ready to stop losing &quot;Near Me&quot; traffic?</p>
        <ul className="!mb-0 !mt-4 list-disc space-y-2 pl-6">
          <li>
            <strong>
              <Link href="/free-website-check">Get a Free Website Check</Link>:
            </strong>{" "}
            Let me look under the hood of your current site.
          </li>
          <li>
            <strong>
              <Link href={publicFreeMockupFunnelHref}>Request a Free Mockup</Link>:
            </strong>{" "}
            See a new direction for your brand, no strings attached.
          </li>
          <li>
            <strong>
              <Link href="/">Browse Our Services</Link>:
            </strong>{" "}
            From web design to <Link href="/custom-3d-printing">custom 3D printed gear</Link> for your crew, we&apos;ve
            got you covered.
          </li>
        </ul>
      </BlogInlineCta>

      <BlogArticleImage
        src="https://cdn.marblism.com/jTusp9KkbAD.webp"
        alt="Your Website Should Be Bringing You Clients — MixedMakerShop banner"
      />
    </BlogPostLayout>
  );
}
