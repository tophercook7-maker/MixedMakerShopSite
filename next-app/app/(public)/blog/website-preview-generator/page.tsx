import type { Metadata } from "next";
import Link from "next/link";
import {
  BlogArticleImage,
  BlogInlineCta,
  BlogPostLayout,
} from "@/components/public/BlogPostLayout";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const slug = "website-preview-generator";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "See Before You Spend: The Power of Our Website Preview Generator";
const subtitle = "Try your site direction before you sign a contract or hand over a deposit";

export const metadata: Metadata = {
  title: `${title} | MixedMakerShop Blog`,
  description:
    "MixedMakerShop's free website preview generator shows your business direction before you spend. No credit card, no contract — just a clear mockup in about two minutes.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "Stop buying web design blind. See a live preview of your homepage direction with MixedMakerShop's free mockup generator.",
    url: canonical,
  },
};

export default function WebsitePreviewGeneratorPostPage() {
  return (
    <BlogPostLayout
      category="Web Design"
      readTime="7 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/gZooumvLKIt.webp",
        alt: "A modern creative studio workshop at night with a warm ambient glow",
      }}
    >
      <p>
        Most small business owners treat hiring a web designer like buying a mystery box. You sign a contract, hand over
        a deposit, and hope that three weeks later, the person on the other end actually &quot;gets&quot; your brand.
      </p>
      <p>
        It&apos;s a backwards way to build a business tool. You wouldn&apos;t buy a truck without a test drive, and you
        wouldn&apos;t hire a contractor to remodel your kitchen without seeing a floor plan. Yet, in the digital world,
        businesses are constantly asked to spend thousands of dollars on &quot;trust me&quot; promises.
      </p>
      <p>
        At <strong>MixedMakerShop</strong>, we decided to kill that model. We built the{" "}
        <strong>Website Preview Generator</strong> to give you clarity before you spend a single dime.
      </p>

      <h2>The Frustration of Buying Blind</h2>
      <p>
        If you&apos;ve ever looked for a web designer, you&apos;ve probably seen the same pitch: a shiny portfolio of{" "}
        <em>other</em> people&apos;s projects and a long list of abstract features. You&apos;re told about &quot;user
        experience,&quot; &quot;SEO-optimized architecture,&quot; and &quot;conversion funnels.&quot;
      </p>
      <p>
        But what does that actually look like for <em>your</em> plumbing business, <em>your</em> coffee shop, or{" "}
        <em>your</em> creative studio?
      </p>
      <p>
        When you buy blind, you&apos;re taking all the risk. If the designer misses the mark, you&apos;re stuck in a
        cycle of revisions, frustration, and wasted time. We think that&apos;s garbage. You should know exactly what
        direction we&apos;re heading in before you commit your budget.
      </p>

      <h2>What is the Website Preview Generator?</h2>
      <p>
        The <Link href="/free-mockup">Website Preview Generator</Link> isn&apos;t a random link dump or a generic
        template. It&apos;s a tool we built to bridge the gap between &quot;I need a website&quot; and &quot;I love this
        website.&quot;
      </p>
      <p>
        It&apos;s a guided, low-stress way for you to tell us about your business and see a live, interactive direction
        take shape in real time. We don&apos;t ask for a credit card, and we don&apos;t lock you into a contract.
      </p>

      <h3>How It Works: Four Calm Sections</h3>
      <p>
        We&apos;ve stripped away the &quot;agency fluff&quot; and replaced it with a direct process that takes about two
        minutes.
      </p>
      <ol>
        <li>
          <strong>Business Basics:</strong> Tell us what you do and where you do it. A Facebook page or a business name
          is enough to start.
        </li>
        <li>
          <strong>Homepage Goals:</strong> What do you actually want the site to do? Get more calls? Show off your
          portfolio? Replace an old, broken site?
        </li>
        <li>
          <strong>Preferences:</strong> You pick a design direction: Clean, Bold, Local, Premium, or Simple. This
          isn&apos;t about picking a &quot;theme&quot;; it&apos;s about setting the tone for how your customers perceive
          you.
        </li>
        <li>
          <strong>Contact:</strong> Drop your email so I can send you the refined version.
        </li>
      </ol>
      <BlogArticleImage
        src="https://cdn.marblism.com/45S1j8aV_50.webp"
        alt="Hands working on a digital tablet, selecting a design direction for a website preview"
      />

      <h2>See the Direction, Not Just the Code</h2>
      <p>
        As you fill out the form, a live preview builds right in front of you. This isn&apos;t just a static image;
        it&apos;s a structural mockup of how we would organize your services, your &quot;why,&quot; and your calls to
        action.
      </p>
      <ul>
        <li>
          <strong>Speed:</strong> You get an immediate sense of the layout.
        </li>
        <li>
          <strong>Accuracy:</strong> It uses your actual business details, not &quot;Lorem Ipsum&quot; filler text.
        </li>
        <li>
          <strong>Transparency:</strong> You see the &quot;why&quot; behind the design: where the phone number goes, how
          the services are grouped, and how easy it is for a customer to contact you.
        </li>
      </ul>
      <p>This is what we call &quot;glass-box transparency.&quot; We want you to see the gears turning.</p>

      <h2>Why &quot;Try Before You Buy&quot; Matters for Small Business</h2>
      <p>
        For a local service provider, a website is a tool, not a vanity project. Every dollar spent on digital services
        needs to work. By using a website preview generator, you&apos;re doing three things:
      </p>

      <h3>1. Removing the Guesswork</h3>
      <p>
        You don&apos;t have to wonder if I understand your industry. If you&apos;re a landscaper, your preview won&apos;t
        look like a lawyer&apos;s site. It will look like a site built for{" "}
        <Link href="/property-care">property care</Link>.
      </p>

      <h3>2. Testing the Fit</h3>
      <p>
        Web design is a partnership. The preview generator is your first interaction with how I work. If you like the
        direction and the no-nonsense communication, we&apos;re probably a good fit. If not, you haven&apos;t lost
        anything.
      </p>

      <h3>3. Aligning Expectations</h3>
      <p>
        The biggest cause of project delays is a &quot;vision gap.&quot; You think the site should look one way; the
        designer thinks another. The preview puts us on the same page from minute one.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/_bSfj6trY00.webp"
        alt="A smartphone on a wooden table displaying a modern website preview with a clear call-to-action button"
      />

      <h2>Manual Craft vs. AI Noise</h2>
      <p>You might be thinking, &quot;Is this just an AI generator?&quot;</p>
      <p>
        The answer is a hard no. While we use technology to speed up the <em>preview</em> process, the actual design work
        at MixedMakerShop is manual and thoughtful. I&apos;m Topher, and I build these sites from the ground up.
      </p>
      <p>
        AI can spit out a generic layout, but it doesn&apos;t understand why a customer in your specific town chooses you
        over the guy down the street. It doesn&apos;t understand &quot;thumb reach&quot; on a mobile device or how to
        write a headline that actually sounds like a human being.
      </p>
      <p>The preview generator is the starting line. Once you like the direction, I step in to build a site that is:</p>
      <ul>
        <li>
          <strong>Mobile-Friendly:</strong> Fast loading and easy to use on a phone.
        </li>
        <li>
          <strong>Conversion-Focused:</strong> Designed to turn visitors into estimate requests.
        </li>
        <li>
          <strong>Locally Optimized:</strong> Built with a foundation for{" "}
          <Link href="/small-business-websites-hot-springs">local SEO</Link>.
        </li>
      </ul>

      <h2>Not Just a Website: A Marketing Asset</h2>
      <p>
        When we build a site for you — whether it&apos;s through{" "}
        <a href="https://topherswebdesign.com/">Topher&apos;s Web Design</a> or a larger project under the{" "}
        <Link href="/">MixedMakerShop umbrella</Link> — we&apos;re building a business asset.
      </p>
      <p>
        We look at the whole picture. Do you need custom <Link href="/3d-printing">3D printed merch</Link> to hand out to
        clients? Do you need an{" "}
        <Link href="/websites-tools#ai-automation">AI helper bot</Link> to answer questions at 2:00 AM?
      </p>
      <p>
        The preview generator is the front door to this ecosystem. It&apos;s where we prove that we can handle the basics
        before we talk about the bigger builds.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/tkjhjkF_lWa.webp"
        alt="A modern workspace featuring a 3D printer and a digital website builder interface"
      />

      <h2>Take the Test Drive</h2>
      <p>
        If your current website is &quot;costing you leads&quot; or you&apos;re starting from scratch and feeling
        overwhelmed, stop guessing.
      </p>
      <p>
        You don&apos;t need a high-overhead agency. You need a builder who speaks plain English and shows you the work
        before asking for the check.
      </p>
      <p>
        <strong>Review the possibilities. Build with confidence. Browse our real work.</strong>
      </p>
      <p>Ready to see what your business could look like online?</p>

      <BlogInlineCta>
        <p className="!mb-0">
          <strong>
            <Link href={publicFreeMockupFunnelHref}>Start your free website preview here.</Link>
          </strong>
        </p>
        <p className="!mt-4 !mb-0">No pressure on the deck. Just a clear look at a better direction.</p>
      </BlogInlineCta>

      <h3>More from the Studio</h3>
      <ul>
        <li>
          <strong>Transparent Pricing:</strong> Check out our <Link href="/pricing">starting prices</Link> for websites,
          bots, and prints.
        </li>
        <li>
          <strong>Real Examples:</strong> See <Link href="/examples">proof of our builds</Link> in the wild.
        </li>
        <li>
          <strong>Free Website Preview:</strong> Not sure where to start?{" "}
          <Link href="/free-mockup">Get a Free Website Preview</Link>.
        </li>
      </ul>
    </BlogPostLayout>
  );
}
