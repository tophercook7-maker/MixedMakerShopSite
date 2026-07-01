import type { Metadata } from "next";
import { blogPostTitle } from "@/lib/seo/snippet-meta";
import Link from "next/link";
import {
  BlogArticleImage,
  BlogInlineCta,
  BlogPostLayout,
} from "@/components/public/BlogPostLayout";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const slug = "local-seo-for-plumbers";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "Flushed Away: Why Plumbers Need Local SEO to Stay Above Water";
const subtitle =
  "Win the Google Map Pack when homeowners search emergency plumber near me — GBP, reviews, and a mobile site that turns panic into phone calls";

export const metadata: Metadata = {
  title: blogPostTitle(title),
  description:
    "Local SEO for plumbers — stay visible when basements flood at 2 AM. Google Business Profile, reviews, mobile-first websites, and the Captain Maker path without agency fluff.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "Why plumbers need local SEO to stay above water — map pack visibility, high-intent leads, and a digital presence that works while you're under the sink.",
    url: canonical,
  },
};

export default function LocalSeoForPlumbersPostPage() {
  return (
    <BlogPostLayout
      slug={slug}
      category="Local SEO"
      readTime="8 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/5Iw7krdaDhm.webp",
        alt: "A heavy-duty pipe wrench and a smartphone showing a local map on a workbench",
      }}
    >
      <p>
        It&apos;s 2:15 AM. Somewhere in your town, a homeowner just woke up to the rhythmic{" "}
        <em>thwack-thwack-thwack</em> of water hitting their basement floor. They don&apos;t have a &quot;favorite
        plumber.&quot; They don&apos;t have a Rolodex. What they have is a smartphone and a rising sense of panic.
      </p>
      <p>They type four words into Google: &quot;emergency plumber near me.&quot;</p>
      <p>
        In that moment, your business is either the lifeline they grab onto or you&apos;re invisible — sunken at the
        bottom of page five while your competitor gets the call, the job, and the lifelong customer. This is the reality
        of <strong>local SEO for plumbers</strong>. If you aren&apos;t the first name they see when the water starts
        rising, you&apos;re essentially working in a shop with the lights off and the door locked.
      </p>
      <p>
        At Mixed Maker Shop, we don&apos;t do corporate fluff. We don&apos;t talk about &quot;synergistic digital
        ecosystems.&quot; We build tools that work. If you&apos;re a plumber, an HVAC tech, or a local maker, your
        &quot;tool&quot; isn&apos;t just a wrench — it&apos;s your digital presence. Let&apos;s talk about how to stay
        above water.
      </p>

      <h2>What is Local SEO? (The &quot;Straight Talk&quot; Version)</h2>
      <p>
        Think of Local SEO as the modern version of the Yellow Pages, but much smarter and way faster. It&apos;s a set of
        strategies designed to make sure that when someone in your specific service area searches for what you do, Google
        puts your name at the top of the list.
      </p>
      <p>
        For home service businesses, this isn&apos;t just about &quot;being on the internet.&quot; It&apos;s about being in
        the <strong>Google Map Pack</strong> — that little box with the map and the three top businesses that pops up
        before the regular search results. For a plumber, being in those top three spots is like having a billboard right
        over the busiest intersection in town, except the billboard only shows up for people who <em>actually</em> have a
        leak right now.
      </p>

      <h2>Why Plumbers Need This More Than Anyone Else</h2>
      <p>
        Plumbing is a high-intent, high-urgency business. People don&apos;t browse for plumbers for fun. They need you{" "}
        <em>now</em>. Because of that, they aren&apos;t going to spend forty minutes researching your &quot;about us&quot;
        page or looking at your blog posts from 2019. They are going to look at three things:
      </p>
      <ol>
        <li>Are you nearby?</li>
        <li>Do you have good reviews?</li>
        <li>Is there a &quot;Call Now&quot; button?</li>
      </ol>
      <p>
        If you nail those three, you win. If you&apos;re buried under a mountain of &quot;SEO for home service
        businesses&quot; jargon and haven&apos;t updated your Google profile in two years, you&apos;re losing money every
        time it rains.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/BJW05sWAjqr.webp"
        alt="A plumber checking a professional website on a tablet"
      />

      <h2>The Three Pillars of Staying Visible</h2>
      <h3>1. Your Google Business Profile (Your Digital Shop Front)</h3>
      <p>
        This is your most important asset. Period. It&apos;s free, but most people set it up once and forget it. To rank
        well in 2026, you need to treat this like a living thing.
      </p>
      <ul>
        <li>
          <strong>Keep your hours real:</strong> If you say you&apos;re 24/7, be 24/7. If you change hours for a holiday,
          update it.
        </li>
        <li>
          <strong>Post real photos:</strong> Don&apos;t use stock photos of a guy in a pristine white shirt holding a shiny
          wrench. People want to see your actual truck, your actual team, and the actual messy pipes you just fixed. It
          builds trust.
        </li>
        <li>
          <strong>List every service:</strong> Don&apos;t just say &quot;Plumbing.&quot; List &quot;Water Heater
          Repair,&quot; &quot;Clogged Drain Cleaning,&quot; and &quot;Sump Pump Installation.&quot; Google needs to know
          exactly what you can handle.
        </li>
      </ul>
      <h3>2. The Power of Reviews (Modern Word-of-Mouth)</h3>
      <p>
        Reviews are the fuel for local SEO. Google loves &quot;velocity&quot; — which is just a fancy way of saying they
        want to see that you&apos;re getting new reviews regularly. A business with 50 reviews from three years ago looks
        dead. A business with 12 reviews from the last month looks like it&apos;s thriving.
      </p>
      <p>
        At <Link href="/">Mixed Maker Shop</Link>, we often tell our clients: the best time to ask for a review is the
        second the water stops leaking and the customer sighs in relief. That&apos;s when you hand them the phone or send
        the text.
      </p>
      <h3>3. A Website That Doesn&apos;t Leak</h3>
      <p>
        Your website has one job: turn a visitor into a caller. If your site takes ten seconds to load on a mobile phone,
        that panicked homeowner has already clicked &quot;back&quot; and called the next guy. You need a site that is
        lightweight, mobile-first, and has a phone number that is impossible to miss.
      </p>

      <h2>The Mixed Maker Approach: No Fluff, Just Results</h2>
      <p>
        We know you&apos;re busy. You&apos;re under sinks, in crawlspaces, or managing a crew. You don&apos;t have time to
        learn the nuances of &quot;backlink profiles&quot; or &quot;schema markup.&quot; That&apos;s why we created a
        straightforward path for local businesses.
      </p>
      <h3>What is the Service?</h3>
      <p>
        We provide a complete digital foundation for local service providers. This includes a lightning-fast website, a
        fully optimized Google Business Profile, and a localized SEO strategy that targets the specific neighborhoods you
        want to work in.
      </p>
      <h3>Who is it for?</h3>
      <p>
        Small business owners, local plumbers, HVAC contractors, and creative makers who want more leads without the
        high-overhead agency drama. If you want a partner who speaks plain English, we&apos;re your people.
      </p>
      <h3>Why is it Better/Cooler?</h3>
      <p>
        Most agencies want to lock you into a $2,000-a-month &quot;management fee&quot; for work you can&apos;t see. We
        offer <Link href="/pricing">clear, plain-language starting prices</Link>. Plus, we have the{" "}
        <Link href="/captain-maker">Captain Maker tool</Link> — a consultation process that helps you figure out exactly
        what you need (and what you don&apos;t) before you spend a dime.
      </p>
      <p>
        Even cooler? We offer a <strong>free website homepage preview</strong>. We&apos;ll build a mockup of what your new,
        lead-generating site could look like so you can see the direction before you commit. You can check that out at our{" "}
        <Link href={publicFreeMockupFunnelHref}>free mockup page</Link>.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/SCvCxfpYx15.webp"
        alt="The Captain Maker mascot next to a glowing compass"
      />

      <h2>How We Make It (The Process)</h2>
      <p>We treat a website build like a custom fabrication project.</p>
      <ol>
        <li>
          <strong>The Blueprint:</strong> We use the Captain Maker tool to map out your service area and target keywords
          (like &quot;clogged drain repair in [Your City]&quot;).
        </li>
        <li>
          <strong>The Foundation:</strong> We build a high-performance site using natural textures and clean designs that
          look great on a phone. No &quot;fake luxury&quot; templates here — just professional, approachable branding.
        </li>
        <li>
          <strong>The Plumbing (The SEO):</strong> We wire up the backend so Google can crawl your site easily. We make
          sure your NAP (Name, Address, Phone) is identical across the whole internet.
        </li>
        <li>
          <strong>The Launch:</strong> We push it live and help you set up a system to collect reviews automatically.
        </li>
      </ol>

      <h2>What We Need From You to Get Started</h2>
      <p>
        You don&apos;t need a 50-page business plan. To get your local SEO and website moving, we just need a few things:
      </p>
      <ul>
        <li>
          <strong>Your Service List:</strong> What do you actually do? (And more importantly, what do you <em>want</em> to
          do more of?)
        </li>
        <li>
          <strong>Your Service Area:</strong> A list of zip codes or towns you&apos;re willing to drive to.
        </li>
        <li>
          <strong>A Few Photos:</strong> Grab your phone and take a picture of your truck and your team. We can work with
          the rest.
        </li>
        <li>
          <strong>A Rough Sketch or Idea:</strong> Even if it&apos;s just a list of three things you hate about your current
          site, that&apos;s enough for us to start.
        </li>
      </ul>
      <BlogArticleImage
        src="https://cdn.marblism.com/oAZRkIaSZJu.webp"
        alt="A plumbing truck parked in a neighborhood at dusk"
      />

      <h2>Stop Being the Best Kept Secret in Town</h2>
      <p>
        If you&apos;re a great plumber but your phone isn&apos;t ringing, the problem isn&apos;t your work — it&apos;s your
        visibility. <strong>SEO for home service businesses</strong> doesn&apos;t have to be a mystery. It&apos;s just
        about making sure that when people are in trouble, your name is the one they see first.
      </p>
      <p>
        Ready to see how your business could look with a professional digital overhaul? Don&apos;t guess — see it for
        yourself. Send us your logo, a quick description of your service area, or even a rough sketch of what you&apos;re
        looking for. We&apos;ll get to work on a free homepage preview to show you how we can help you stay above water.
      </p>
      <p>
        <Link href="/">
          <strong>Start your project at Mixed Maker Shop today.</strong>
        </Link>
      </p>

      <BlogInlineCta>
        <p className="!mb-0">
          More for home service pros:{" "}
          <Link href="/blog/local-seo-home-service-advantage" className="font-semibold">
            The Local Advantage
          </Link>{" "}
          and{" "}
          <Link href="/blog/local-seo-near-me-secret" className="font-semibold">
            The Near Me Secret
          </Link>
          .{" "}
          <Link href={publicFreeMockupFunnelHref} className="font-semibold">
            Request a free homepage preview
          </Link>
          .
        </p>
      </BlogInlineCta>
    </BlogPostLayout>
  );
}
