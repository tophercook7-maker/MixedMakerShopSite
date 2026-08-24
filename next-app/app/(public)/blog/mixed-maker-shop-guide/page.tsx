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

const slug = "mixed-maker-shop-guide";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "The Mixed Maker Shop Guide: No-Nonsense Web, Tools, and AI Solutions";
const subtitle =
  "A glass-box look at free website previews, web design, AI automation, custom tools, and straight-talk pricing — without agency fluff";

export const metadata: Metadata = {
  title: blogPostTitle(title),
  description:
    "How MixedMakerShop works — free website previews, Topher's Web Design, the Lab, AI automation, and clear starting prices. No synergy slides, no quote-me games.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "The practical MixedMakerShop guide: websites built for thumb reach, custom tools, workflow automation, and honest pricing from a one-man lab.",
    url: canonical,
  },
};

export default function MixedMakerShopGuidePostPage() {
  return (
    <BlogPostLayout
      slug={slug}
      category="MixedMakerShop Guide"
      readTime="8 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/gbuYVfeUEgB.webp",
        alt: "A cinematic wide shot of a one-man lab combining code, design, and digital builds in a warm workshop",
      }}
    >
      <p>
        Most agencies love to hide behind big words and bigger invoices. They&apos;ll talk about &quot;synergy,&quot;
        &quot;digital transformation,&quot; and &quot;disruptive ecosystems&quot; while charging you five figures for a
        project that ends up feeling like a template.
      </p>
      <p>
        At <strong>Mixed Maker Shop</strong>, we don&apos;t do that. We&apos;re a small, hands-on studio that builds
        real things for real people. Whether you need a website that actually brings in leads, a custom tool built for one job
        that doesn&apos;t exist in stores, or an AI tool that saves you five hours of boring work every week, we handle
        it with straight talk and clear prices.
      </p>
      <p>
        This guide is our &quot;glass-box&quot; look at how we work. No fluff, no &quot;agency noise&quot;: just the
        practical solutions we offer to help you grow your business or finish that creative project you&apos;ve been
        sitting on.
      </p>

      <h2>Start Here: The Free Website Preview</h2>
      <p>
        One of the biggest hurdles in any project is just knowing where to start. You might know you need
        &quot;something&quot; to help your business, but you aren&apos;t sure if it&apos;s a better website, a custom
        automation, or a physical marketing tool.
      </p>
      <p>
        That&apos;s why we offer a <strong>free homepage preview</strong>. Think of it as your project
        compass. Instead of a high-pressure sales call, it&apos;s a direct, helpful path to finding the right solution.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/nGMge-Xzan8.webp"
        alt="A hand pointing to a strategic roadmap on a wooden table"
      />
      <p>
        We sit down: either virtually or in person: and look at your specific bottlenecks. Are you losing leads because
        your site is hard to use on a phone? Are you spending too much time answering the same three customer questions?
        We identify the &quot;why&quot; before we touch a single line of code. You can{" "}
        <Link href="/connect">connect with us here</Link> to find your path.
      </p>

      <hr />

      <h2>Topher&apos;s Web Design: Websites Built for &quot;Thumb Reach&quot;</h2>
      <p>
        Your website shouldn&apos;t just be a digital business card that sits there gathering dust. It should be your
        hardest-working employee. Most small business sites fail because they are &quot;drowning in noise&quot;: too many
        buttons, slow loading times, and text that sounds like a robot wrote it.
      </p>
      <p>
        <strong>Topher&apos;s Web Design</strong> focuses on three core pillars:
      </p>
      <ol>
        <li>
          <strong>Mobile-First Design:</strong> We build for &quot;thumb reach.&quot; Most of your customers are finding
          you on their phones while waiting in line or sitting on their couch. If your site doesn&apos;t work perfectly on
          a small screen, you&apos;re losing money.
        </li>
        <li>
          <strong>Local SEO Foundations:</strong> We don&apos;t just make it look pretty; we make sure Google knows
          you&apos;re the go-to expert in your local area.
        </li>
        <li>
          <strong>The Free Homepage Preview:</strong> This is our most popular offer. We&apos;re so confident in our
          manual, thoughtful approach that we&apos;ll build a{" "}
          <Link href={publicFreeMockupFunnelHref}>free homepage mockup</Link> for you before you spend a dime.
        </li>
      </ol>
      <BlogArticleImage
        src="https://cdn.marblism.com/p8nrqtHNN7T.webp"
        alt="A smartphone displaying a clean, professional service website with a bold Get a Quote button"
      />
      <p>
        We don&apos;t use &quot;canned&quot; processes. Every layout is built to turn a visitor into an estimate request.
        We look at the actual user journey, ensuring that your contact info is always one tap away and your services are
        explained in plain English. Check out some of our <Link href="/examples">previous builds</Link> to see what we
        mean.
      </p>

      <hr />

      <h2>The Lab: Ideas That Turn Into Shipped Things</h2>
      <p>
        Sometimes the answer isn&apos;t another page on your website — it&apos;s a tool that does the job for you.{" "}
        <strong>The Lab</strong> is the bench where those get built.
      </p>
      <p>Big software companies want you on a subscription for a feature you use twice a month. The Lab builds small, specific things instead. That&apos;s a fit for:</p>
      <ul>
        <li>
          <strong>Custom Tools:</strong> A quoting calculator, an intake form that routes itself, a job-log app for your crew.
        </li>
        <li>
          <strong>AI Helpers:</strong> A bot that answers the same five questions at 2:00 AM so you don&apos;t have to.
        </li>
        <li>
          <strong>Apps &amp; Games:</strong> Real shipped software — including titles live on the Mac App Store.
        </li>
      </ul>
      <p>
        We build tools that aren&apos;t just &quot;neat&quot; but actually useful. Whether you have a finished spec or
        just a rough idea on a napkin, we can help you bring it to life. You can{" "}
        <Link href="/lab">browse what&apos;s on the bench</Link> to see what&apos;s possible.
      </p>

      <hr />

      <h2>AI &amp; Automation: Tools That Actually Help</h2>
      <p>
        AI is the buzziest word in tech right now, but most of it is just noise. At Mixed Maker Shop, we ignore the hype
        and focus on <strong>utility</strong>.
      </p>
      <p>
        We build customer-helper bots and workflow tools that do the heavy lifting for you. This isn&apos;t about
        replacing humans; it&apos;s about giving your humans their time back.
      </p>
      <ul>
        <li>
          <strong>Customer-Helper Bots:</strong> Instead of a &quot;random link dump,&quot; we build bots that provide
          useful, specific answers to your customers&apos; questions 24/7.
        </li>
        <li>
          <strong>Workflow Automation:</strong> We look for the repetitive tasks in your day: like moving data from an
          email to a spreadsheet: and build a bridge to do it automatically.
        </li>
      </ul>
      <BlogArticleImage
        src="https://cdn.marblism.com/2dFpBoa5VWz.webp"
        alt="A sleek digital interface on a glass tablet showing a workflow automation diagram in a modern studio"
      />
      <p>
        We take a &quot;glass-box&quot; approach here. We&apos;ll show you exactly how the automation works and why we
        chose specific tools. No &quot;black box&quot; magic: just smart tech that makes your business run smoother.
      </p>

      <hr />

      <h2>Straight-Talk Pricing (No &quot;Quote Me&quot; Games)</h2>
      <p>
        We believe in transparency. Nothing is more frustrating than having to sit through a hour-long sales pitch just
        to find out a price. We list our starting prices clearly because we value your time as much as ours.
      </p>
      <ul>
        <li>
          <strong>Web Design:</strong> We offer clear, direct packages for local service providers. No hidden agency fees
          or &quot;maintenance&quot; traps.
        </li>
        <li>
          <strong>Custom Builds:</strong> Priced by the job, scoped up front. No &quot;consultation fees&quot; just
          to get a quote.
        </li>
        <li>
          <strong>Automation:</strong> Project-based pricing that focuses on the ROI (Return on Investment) of the time
          you&apos;ll save.
        </li>
      </ul>
      <p>
        We position ourselves as your &quot;in the trenches&quot; partner. We&apos;re building things every week, testing
        new approaches, and refining our code. When you work with us, you&apos;re talking directly to the person doing
        the work — not an account manager who doesn&apos;t know how to open a terminal.
      </p>

      <h2>Why Work With Us?</h2>
      <p>
        Mixed Maker Shop is an umbrella studio because we believe the best solutions often live at the intersection of
        different tools. Maybe your shop needs a better website. Maybe your website needs an AI bot to
        handle requests.
      </p>
      <p>We provide:</p>
      <ul>
        <li>
          <strong>Honest Communication:</strong> If we think a project is a bad idea or won&apos;t provide value,
          we&apos;ll tell you.
        </li>
        <li>
          <strong>Direct Solutions:</strong> We don&apos;t over-engineer. We build what works.
        </li>
        <li>
          <strong>Clear Outcomes:</strong> Every project is judged by its utility. Does it work? Does it help? Is it worth
          it?
        </li>
      </ul>
      <p>
        If you&apos;re tired of the &quot;agency fluff&quot; and want to work with people who actually care about the nuts
        and bolts of your project, <Link href="/contact">let&apos;s talk</Link>.
      </p>

      <BlogInlineCta>
        <p className="!mb-0">
          <strong>Ready to see what we can do?</strong>{" "}
          <Link href={publicFreeMockupFunnelHref} className="font-semibold">
            Request your Free Homepage Preview
          </Link>{" "}
          and let&apos;s start building something useful.
        </p>
      </BlogInlineCta>
    </BlogPostLayout>
  );
}
