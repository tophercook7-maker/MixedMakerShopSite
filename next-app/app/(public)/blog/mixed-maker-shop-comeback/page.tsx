import type { Metadata } from "next";
import Link from "next/link";
import {
  BlogArticleImage,
  BlogInlineCta,
  BlogPostLayout,
} from "@/components/public/BlogPostLayout";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const slug = "mixed-maker-shop-comeback";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "The Comeback: From Cook's Computer Service to the Mixed Maker Shop Revolution";
const subtitle =
  "Rebuilding after MS — from Cook's Computer Service since 2000 to a Hot Springs maker shop for web design, 3D printing, AI tutoring, and in-home diagnostics";

export const metadata: Metadata = {
  title: `${title} | MixedMakerShop Blog`,
  description:
    "From Cook's Computer Service since 2000 to Mixed Maker Shop — rebuilding after MS with in-home repair, AI tutoring, local SEO web design, and custom 3D printing for Hot Springs, Benton, and surrounding Arkansas communities.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "Topher's comeback story: house-call tech repair, AI tutoring, local SEO websites, and GiGi's Print Shop — serving Hot Springs and neighbors with straight talk and real outcomes.",
    url: canonical,
  },
};

export default function MixedMakerShopComebackPostPage() {
  return (
    <BlogPostLayout
      category="Our Story"
      readTime="9 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/mms-workshop-comeback-hero.webp",
        alt: "A cinematic workshop scene with warm ambient lighting, featuring a mix of vintage computer parts and modern 3D printers on a wooden workbench, with a glowing orange highlight on a digital tablet",
      }}
    >
      <p>
        For a lot of folks in the Hot Springs area, the name &quot;Cook&apos;s Computer Service&quot; might ring a bell.
        Back in the day, if your PC was blue-screening or your home network was acting like a brick, I was the guy you
        called. I&apos;ve been providing local tech support since <strong>2000</strong>, spending years in the trenches
        crawling under desks and untangling literal and metaphorical wires.
      </p>
      <p>
        But in 2014, life threw a massive wrench in the gears. I became disabled after MS changed the path I was on, and
        for a long time, the &quot;service&quot; part of my life had to go on a forced hiatus. It wasn&apos;t just a
        career break; it was a total recalibration. When you&apos;re used to building and fixing things with your hands,
        being sidelined is a tough pill to swallow.
      </p>
      <p>
        Fast forward to today. I&apos;m not just back; I&apos;m rebuilding the business after MS with a bigger toolbox and
        a brand-new vision. Welcome to the <strong>Mixed Maker Shop</strong>. We proudly serve{" "}
        <strong>Hot Springs, Hot Springs Village, Benton, Lake Hamilton, and Fountain Lake</strong> with a blend of
        old-school grit and new-world tech.
      </p>
      <p>Here&apos;s why I&apos;m doing this, what we&apos;re building, and how we&apos;re helping our neighbors win in 2026.</p>

      <h2>The &quot;Mixed&quot; in Mixed Maker Shop</h2>
      <p>
        People ask me all the time, &quot;Topher, why the name change? Why not just stick to computers?&quot;
      </p>
      <p>
        The truth is, the world changed while I was away. Tech isn&apos;t just a beige box under your desk anymore.
        It&apos;s in the way we market our local businesses, it&apos;s in the custom 3D-printed gear we carry, and
        it&apos;s in the AI tools that can either make our lives easier or leave us drowning in noise.
      </p>
      <p>
        I realized that a &quot;Computer Service&quot; wasn&apos;t enough. People needed a <strong>Maker Shop</strong>:
        a place that combines digital craftsmanship with physical creation. Whether you need a website that actually
        brings in leads, a custom-printed replacement part for a vintage tool, or someone to sit down and teach you how
        to use AI without feeling like you&apos;re in a sci-fi movie, we&apos;ve got it all{" "}
        <Link href="/about">under one umbrella</Link>.
      </p>

      <h2>Bringing Back the House Call: In-Home Repair &amp; Diagnostics</h2>
      <p>
        There&apos;s something about the &quot;big box&quot; repair experience that just feels... cold. You lug your
        heavy tower into a bright store, talk to a kid who looks like he&apos;d rather be anywhere else, and wait two
        weeks for a &quot;diagnostic&quot; that costs more than the computer is worth.
      </p>
      <p>
        I don&apos;t work that way. I believe in the <strong>in-home computer repair</strong> model because that&apos;s
        where the problems actually happen. Maybe it&apos;s not your computer: maybe it&apos;s the way your router is
        positioned in your Lake Hamilton home. Maybe it&apos;s the interference from your kitchen appliances.
      </p>
      <p>We&apos;re bringing back real, hands-on diagnostics for:</p>
      <ul>
        <li>
          <strong>Performance Triage:</strong> Why is it slow? Is it a virus, or is your hardware just tired?
        </li>
        <li>
          <strong>Network Stability:</strong> Making sure your Wi-Fi reaches every corner of your house, even the porch.
        </li>
        <li>
          <strong>Hardware Resurrection:</strong> Swapping out old drives for modern speed without losing your photos.
        </li>
      </ul>
      <p>
        And because I&apos;m not interested in vague pricing or gotcha fees, we keep our <strong>starting rates</strong>{" "}
        plain and easy to understand:
      </p>
      <ul>
        <li>
          <strong>Service Call / First Hour:</strong> $85
        </li>
        <li>
          <strong>Additional Labor:</strong> $65/hr
        </li>
      </ul>
      <p>
        That&apos;s part of our no-nonsense, plain-language pricing approach. You should know what the starting cost
        looks like before anybody touches your machine.
      </p>
      <p>
        If you&apos;re in{" "}
        <strong>Hot Springs, Hot Springs Village, Benton, Lake Hamilton, or Fountain Lake</strong>, you don&apos;t have
        to drive. I come to you. It&apos;s straight talk, no jargon, and real solutions.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/in-home-tech-support.webp"
        alt="A friendly technician sitting at a kitchen table, helping an older adult with a laptop. The lighting is warm and natural, emphasizing a personal, helpful connection"
      />

      <h2>AI Tutoring: Not Just for Silicon Valley</h2>
      <p>
        Let&apos;s talk about the elephant in the room: AI. Everyone is talking about it, but most people are either
        terrified of it or think it&apos;s just for making weird pictures of cats.
      </p>
      <p>
        In 2026, AI is a utility, like electricity. But if you don&apos;t know how to plug it in, it&apos;s useless.
        That&apos;s why I&apos;ve added <strong>AI Tutoring</strong> to our list of services.
      </p>
      <p>
        I&apos;m not here to give you a lecture. I&apos;m here to sit down with you and show you how{" "}
        <strong>AI automation for small business</strong> can actually save you five hours a week. I&apos;ll show you how
        to use tools to draft your emails, organize your schedule, or even help your kids with their homework more
        effectively.
      </p>
      <p>
        It&apos;s about empowerment. I want my neighbors in{" "}
        <strong>Hot Springs, Hot Springs Village, Benton, Lake Hamilton, and Fountain Lake</strong> to feel like they
        have a superpower, not like they&apos;re being replaced by a robot.
      </p>

      <h2>Local SEO for Home Service Businesses</h2>
      <p>
        While I was &quot;away,&quot; I spent a lot of time learning the dark arts of the internet. I saw how many local
        service providers: plumbers, landscapers, roofers: were getting ripped off by big agencies. These agencies charge
        $2,000 a month for &quot;SEO&quot; and deliver a bunch of confusing spreadsheets that don&apos;t result in a
        single phone call.
      </p>
      <p>
        At Mixed Maker Shop, we do <Link href={publicFreeMockupFunnelHref}>Topher&apos;s Web Design</Link>. We focus on{" "}
        <strong>local SEO for home service businesses</strong> that actually works.
      </p>
      <ul>
        <li>
          <strong>No fluff:</strong> We build mobile-friendly sites that focus on &quot;thumb reach&quot;: making it easy
          for a guy with a broken pipe to call you in three seconds.
        </li>
        <li>
          <strong>Hyperlocal content:</strong> We don&apos;t just say you&apos;re a &quot;Plumber in Arkansas.&quot; We
          talk about the specific communities you serve, like{" "}
          <strong>Hot Springs, Hot Springs Village, Benton, Lake Hamilton, and Fountain Lake</strong>.
        </li>
        <li>
          <strong>The Free Mockup:</strong> I&apos;m so confident in our approach that I&apos;ll build you a{" "}
          <Link href={publicFreeMockupFunnelHref}>free homepage preview</Link> before you spend a dime.
        </li>
      </ul>
      <p>
        Your website shouldn&apos;t just be a digital business card; it should be an employee that never sleeps and
        always closes the deal.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/jTusp9KkbAD.webp"
        alt="A clean, modern laptop displaying a local business website with a Free Mockup offer prominently featured"
      />

      <h2>GiGi&apos;s Print Shop: The Physical Side of Making</h2>
      <p>
        One of the coolest parts of this comeback is <strong>GiGi&apos;s Print Shop</strong>. This is our 3D printing
        arm, where we take digital ideas and turn them into plastic reality.
      </p>
      <p>
        Need a custom keychain for your local business? A specific bracket for a DIY project? Or maybe some cosplay gear
        for the next local convention? We handle <Link href="/custom-3d-printing">custom 3D printing</Link> with the same
        &quot;builder-centric&quot; mindset we use for everything else.
      </p>
      <p>
        We use high-quality materials and meticulous detail because if it&apos;s coming out of our shop, it has to be
        right. It&apos;s the perfect marriage of my computer background and my love for physical craftsmanship.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/3d-printer-nozzle-detail.webp"
        alt="Close-up of a 3D printer nozzle precisely laying down layers of warm orange filament, with finished custom bookmarks and keychains on a shelf behind"
      />

      <h2>Why This Matters to Me</h2>
      <p>
        Being disabled changed my perspective. It made me realize that things need to be <strong>useful</strong>. I
        don&apos;t have time for things that are just &quot;pretty&quot; or &quot;cool&quot; but don&apos;t actually
        function.
      </p>
      <p>
        When I build a website, I&apos;m thinking about the user who&apos;s frustrated and needs help <em>now</em>. When
        I fix a computer, I&apos;m thinking about the person who needs to get their work done so they can go spend time
        with their family.
      </p>
      <p>
        Mixed Maker Shop is about <strong>utility and outcome</strong>. It&apos;s about being a peer who is &quot;in the
        trenches&quot; with you, building things every week.
      </p>

      <h2>Let&apos;s Build Something Together</h2>
      <p>
        If you&apos;re in{" "}
        <strong>Hot Springs, Hot Springs Village, Benton, Lake Hamilton, or Fountain Lake</strong>, and you&apos;re tired
        of the &quot;agency fluff&quot; or the &quot;big box&quot; runaround, let&apos;s talk.
      </p>
      <p>Whether you need:</p>
      <ol>
        <li>
          <strong>A house call</strong> to fix that annoying computer lag.
        </li>
        <li>
          <strong>A tutor</strong> to help you finally master AI.
        </li>
        <li>
          <strong>A website</strong> that actually pays for itself.
        </li>
        <li>
          <strong>A 3D-printed</strong> solution to a physical problem.
        </li>
      </ol>
      <p>I&apos;m here. I&apos;m back. And I&apos;m ready to get to work.</p>

      <BlogInlineCta>
        <p className="!mb-0">
          <strong>Ready to start?</strong> Browse our{" "}
          <Link href="/builds" className="font-semibold">
            Builds
          </Link>
          , check out our{" "}
          <Link href="/3d-printing" className="font-semibold">
            3D Printing options
          </Link>
          , or request your{" "}
          <Link href={publicFreeMockupFunnelHref} className="font-semibold">
            Free Website Mockup
          </Link>{" "}
          today. Let&apos;s make something great.
        </p>
      </BlogInlineCta>
    </BlogPostLayout>
  );
}
