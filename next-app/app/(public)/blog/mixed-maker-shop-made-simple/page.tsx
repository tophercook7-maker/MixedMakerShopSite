import type { Metadata } from "next";
import Link from "next/link";
import {
  BlogArticleImage,
  BlogInlineCta,
  BlogPostLayout,
} from "@/components/public/BlogPostLayout";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const slug = "mixed-maker-shop-made-simple";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "The Mixed Maker Shop Guide: Web Design, 3D Printing, and AI Automation Made Simple";
const subtitle =
  "One studio for mobile-friendly websites, custom 3D prints, and small business AI automation — without drowning in tabs or agency fluff";

export const metadata: Metadata = {
  title: `${title} | MixedMakerShop Blog`,
  description:
    "MixedMakerShop explained simply — mobile friendly website design, 3D printed keychains in bulk, local SEO, AI automation for small business, and a free homepage preview to pick your path.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "Web design, GiGi's Print Shop, and AI automation under one umbrella — free homepage previews, thoughtful 3D prints, and workflow tools that reclaim your time.",
    url: canonical,
  },
};

export default function MixedMakerShopMadeSimplePostPage() {
  return (
    <BlogPostLayout
      category="MixedMakerShop Guide"
      readTime="9 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/zM3V95lE6D1.webp",
        alt: "A modern creative workshop with a laptop showing website design beside a 3D printer with warm orange lighting",
      }}
    >
      <p>
        Let&apos;s be honest: running a small business or launching a creative project usually means you&apos;re drowning
        in tabs. You&apos;ve got one tab for your website builder, another for a 3D printing service you found on Etsy,
        and a third for some &quot;AI tool&quot; that promises the world but delivers a headache.
      </p>
      <p>At <strong>Mixed Maker Shop</strong>, we think that&apos;s a mess.</p>
      <p>
        We built this studio as an umbrella. Whether you need a <strong>mobile friendly website design</strong> that
        actually converts, a batch of <strong>3D printed keychains bulk</strong> ordered for an event, or{" "}
        <strong>AI automation for small business</strong> tasks that save you five hours a week, we handle it all in one
        place. No agency fluff, no &quot;corporate speak,&quot; and no hidden fees. Just real people building real
        things.
      </p>

      <hr />

      <h2>1. Web Design: The Foundation of Your Digital Shop</h2>
      <p>
        Most websites are built like digital brochures: they look okay, but they don&apos;t actually <em>do</em> anything.
        If your site isn&apos;t turning visitors into estimate requests or sales, it&apos;s just costing you money.
      </p>
      <p>
        At <strong>Topher&apos;s Web Design</strong> (the digital arm of our shop), we focus on two things: speed and
        clarity. We don&apos;t do &quot;flashy for the sake of flashy.&quot; We build tools that help you grow.
      </p>

      <h3>Why &quot;Mobile Friendly&quot; is the Only Way</h3>
      <p>
        Over 60% of your customers are looking at your business through a five-inch screen while they&apos;re standing in
        line for coffee. If your site doesn&apos;t work perfectly on their phone, they&apos;re gone. We prioritize{" "}
        <strong>mobile friendly website design</strong> from day one. This means &quot;thumb-reach&quot; navigation, fast
        loading times, and buttons that are actually easy to tap.
      </p>

      <h3>Local SEO That Actually Works</h3>
      <p>
        If you&apos;re a service provider, you need <strong>local SEO for home service businesses</strong>. We don&apos;t
        just dump keywords into your footer. We build a foundation that helps Google understand exactly where you are and
        what you do, so when a neighbor searches for help, your name is the one they see.
      </p>
      <p>
        <strong>The Mixed Maker Offer: The Free Homepage Preview</strong> We know hiring a web designer feels like a leap
        of faith. That&apos;s why we offer a{" "}
        <Link href={publicFreeMockupFunnelHref}>Free Website Homepage Preview</Link>. We&apos;ll build a custom draft of
        your homepage so you can see the direction of the work before you spend a dime.
      </p>
      <BlogArticleImage
        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
        alt="A mobile phone on a dark wooden desk showing a clean modern website with a clear Request Estimate button"
      />

      <hr />

      <h2>2. 3D Printing: Turning Pixels into Plastic</h2>
      <p>
        While we love the digital world, there&apos;s nothing quite like holding a finished product in your hand.{" "}
        <strong>GiGi&apos;s Print Shop</strong> is where the physical magic happens. Whether it&apos;s a functional part
        for a local contractor or high-detail gear for a cosplayer, we treat every print like a piece of craftsmanship.
      </p>

      <h3>Custom Builds and Bulk Orders</h3>
      <p>
        Need <strong>3D printed keychains bulk</strong> produced for a corporate giveaway? Or maybe a custom set of
        bookmarks for a local bookstore? We handle the design, the slicing, and the printing.
      </p>
      <ul>
        <li>
          <strong>Keychains &amp; Bookmarks:</strong> Durable, branded, and tactile.
        </li>
        <li>
          <strong>Cosplay Gear:</strong> High-detail props that don&apos;t weigh a ton.
        </li>
        <li>
          <strong>Prototyping:</strong> Get a physical version of your idea in your hands before you go to manufacturing.
        </li>
      </ul>
      <p>
        We don&apos;t just hit &quot;print&quot; and walk away. We manually review every file, optimize the orientation
        for strength, and ensure the finish is clean. It&apos;s the &quot;manual, thoughtful approach&quot; that keeps
        our clients coming back to <Link href="/3d-printing">Mixed Maker Shop 3D Printing</Link>.
      </p>
      <BlogArticleImage
        src="https://images.unsplash.com/photo-1631035503043-4cc816765792?q=80&w=2070&auto=format&fit=crop"
        alt="High-quality 3D printed keychains and small gears arranged on a dark charcoal surface with cinematic lighting"
      />

      <hr />

      <h2>3. AI &amp; Automation: Reclaiming Your Time</h2>
      <p>
        &quot;AI&quot; is a buzzword that&apos;s being shouted from every corner of the internet right now. Most of it is
        noise. At Mixed Maker Shop, we cut through that noise to build <strong>AI automation for small business</strong>{" "}
        owners who are actually busy.
      </p>
      <p>We don&apos;t build &quot;bots that write bad poetry.&quot; We build:</p>
      <ul>
        <li>
          <strong>Customer-Helper Bots:</strong> Tools that live on your site to answer FAQs and qualify leads while
          you&apos;re asleep.
        </li>
        <li>
          <strong>Workflow Automations:</strong> Connecting your contact form to your CRM so you never lose a lead in a
          messy inbox.
        </li>
        <li>
          <strong>Document Tools:</strong> Automatically generating project proposals or summaries from your meetings.
        </li>
      </ul>
      <p>
        Our goal is to make your business feel &quot;glassy and calm.&quot; You shouldn&apos;t be hunting for data or
        manually copying and pasting info between apps. If it&apos;s repetitive, we can likely automate it.
      </p>

      <hr />

      <h2>4. Not Sure Where to Start? Start with a Free Website Preview.</h2>
      <p>
        We realize that having a shop that does web design, 3D printing, and automation can be a little overwhelming. You
        might know you need <em>something</em> to change, but you&apos;re not sure which path to take.
      </p>
      <p>
        That&apos;s why we offer a <strong>free homepage preview</strong>. Think of it as your project
        navigator. Instead of a sales pitch, you get a conversation. We&apos;ll look at your goals and help you decide if
        you need a better website, a physical product, or a digital tool to streamline your day.
      </p>

      <h3>Why Choose the Umbrella?</h3>
      <p>
        Working with an umbrella studio like ours means your brand stays consistent. The same team building your{" "}
        <strong>mobile friendly website design</strong> is the one who understands your <strong>local SEO</strong>{" "}
        strategy and can build an <strong>AI bot</strong> that speaks your brand&apos;s language.
      </p>
      <BlogArticleImage
        src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop"
        alt="A free homepage preview interface on a sleek tablet with dark mode UI and orange highlights in a blurred workshop"
      />

      <hr />

      <h2>Ready to Build Something Real?</h2>
      <p>
        We aren&apos;t a high-overhead agency with a fancy office and a dozen project managers who never actually touch
        the code or the printers. We are builders who are &quot;in the trenches&quot; every week.
      </p>
      <ul>
        <li>
          <strong>Review</strong> your current online presence with a{" "}
          <Link href="/free-website-check">Free Website Check</Link>.
        </li>
        <li>
          <strong>Build</strong> your physical products with our <Link href="/custom-3d-printing">Custom 3D Printing</Link>{" "}
          service.
        </li>
        <li>
          <strong>Request</strong> a <Link href={publicFreeMockupFunnelHref}>Free Mockup</Link> to see your new website
          today.
        </li>
      </ul>
      <p>Stop drowning in noise. Let&apos;s get to work and build something that actually delivers utility for your business.</p>

      <BlogInlineCta>
        <p className="!mb-0">
          Not sure which path fits?{" "}
          <Link href={publicFreeMockupFunnelHref} className="font-semibold">
            Get a Free Website Preview
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="font-semibold">
            contact us directly
          </Link>
          .
        </p>
      </BlogInlineCta>
    </BlogPostLayout>
  );
}
