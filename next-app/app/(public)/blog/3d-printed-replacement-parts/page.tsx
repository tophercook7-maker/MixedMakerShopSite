import type { Metadata } from "next";
import Link from "next/link";
import {
  BlogArticleImage,
  BlogInlineCta,
  BlogPostLayout,
} from "@/components/public/BlogPostLayout";
import { SITE_URL } from "@/lib/site";

const slug = "3d-printed-replacement-parts";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "Don't Toss It, Print It: How 3D Printing Saves Your 'Obsolete' Gear";
const subtitle = "When the part is discontinued, custom 3D printed replacement parts hit the Save Game button";

export const metadata: Metadata = {
  title: `${title} | MixedMakerShop Blog`,
  description:
    "When a broken plastic clip makes a perfectly good machine useless and the part is 'discontinued,' don't throw it away. Custom 3D printed replacement parts from GiGi's Print Shop turn 'obsolete' into a suggestion, not a sentence.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "Custom 3D printed replacement parts for obsolete gear — knobs, brackets, clips, and gears rebuilt layer by layer at MixedMakerShop.",
    url: canonical,
  },
};

export default function ThreeDPrintedReplacementPartsPostPage() {
  return (
    <BlogPostLayout
      slug={slug}
      category="3D Printing"
      readTime="7 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/GKeZX7BCPZx.webp",
        alt: "Cinematic view of a 3D printer working on a replacement part in a warm studio workshop",
      }}
    >
      <p>
        We&apos;ve all been there. You&apos;re in the middle of a Saturday morning project, or maybe you&apos;re just
        trying to get the dishwasher started, and <em>snap</em>. A tiny plastic clip breaks. Or maybe it&apos;s the knob
        on your favorite vintage stereo, or the specific bracket that holds your refrigerator shelf in place.
      </p>
      <p>
        You do the responsible thing: you look up the model number, find the manufacturer&apos;s website, and... nothing.
        &quot;Discontinued.&quot; &quot;No longer in stock.&quot; &quot;Part Obsolete.&quot;
      </p>
      <p>
        Welcome to the <strong>Obsolete Part Blues</strong>. It&apos;s that sinking feeling when a perfectly good, $500
        machine is rendered useless by a broken piece of plastic that probably cost eight cents to manufacture in 2004.
        The manufacturer wants you to throw the whole thing away and buy the &quot;New and Improved&quot; version.
      </p>
      <p>
        At <strong>Mixed Maker Shop</strong>, we think that&apos;s nonsense. We prefer the &quot;Save Game&quot; button
        approach. Thanks to <strong>custom 3D printed replacement parts</strong>, &quot;obsolete&quot; is just a
        suggestion, not a final sentence.
      </p>

      <h2>What is a Custom 3D Printed Replacement Part?</h2>
      <p>
        In plain English: it&apos;s a brand-new version of your broken piece, built layer-by-layer from durable 3D
        printed material.
      </p>
      <p>
        Instead of searching a dusty warehouse for a part that doesn&apos;t exist anymore, we use digital tools to
        &quot;re-invent&quot; it. We take the measurements of your broken bit (or the space where it used to live) and
        tell our machines to grow a new one. It&apos;s like magic, but with more cooling fans and fewer top hats.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/W3wJWVJS5QZ.webp"
        alt="A broken vintage knob next to a fresh 3D printed replacement"
      />

      <h2>Who Is This For?</h2>
      <p>Honestly? It&apos;s for anyone who hates waste and loves their stuff. But specifically, we see a lot of:</p>
      <ul>
        <li>
          <strong>Small Business Owners:</strong> When a clip on your specialized printer or a handle on your shop
          equipment breaks, you can&apos;t afford the downtime (or the cost) of a total replacement.
        </li>
        <li>
          <strong>Vintage Enthusiasts:</strong> Love that 1970s amplifier but can&apos;t find the volume knob? We can
          help.
        </li>
        <li>
          <strong>Parents &amp; Homeowners:</strong> Fixing toy battery covers, dishwasher rack clips, or those weird
          window-blind tilters that the local hardware store never carries.
        </li>
        <li>
          <strong>Event Planners:</strong> Needing specific, sturdy clips for banners or displays that don&apos;t fit
          standard hardware.
        </li>
      </ul>

      <h2>Why Is This Better Than the Original?</h2>
      <p>
        When a manufacturer makes a part, they are often looking for the cheapest way to mass-produce it. When we make{" "}
        <strong>custom 3D printed replacement parts</strong>, we focus on making it <em>work</em>.
      </p>
      <ol>
        <li>
          <strong>Reinforcement:</strong> If we see that your original part snapped because it was too thin in one spot,
          we can often beef it up in the digital model so it doesn&apos;t happen again.
        </li>
        <li>
          <strong>Material Quality:</strong> We use lightweight, durable plastics that are often tougher than the
          brittle stuff used in older consumer electronics.
        </li>
        <li>
          <strong>Perfect Fit:</strong> We don&apos;t do &quot;universal&quot; parts that almost fit. We do parts that{" "}
          <em>actually</em> fit.
        </li>
      </ol>

      <h2>The &quot;Save Game&quot; List: Ideas for Your Gear</h2>
      <p>
        Not sure if your item can be saved? Here are a few common &quot;Obsolete Part Blues&quot; candidates we can
        tackle:
      </p>
      <ul>
        <li>
          <strong>Kitchen Saviors:</strong> Oven knobs, refrigerator shelf brackets, dishwasher wheels, and blender
          gaskets.
        </li>
        <li>
          <strong>Home Hardware:</strong> Closet rod holders, window latch handles, and custom drawer pulls.
        </li>
        <li>
          <strong>Workshop &amp; Tools:</strong> Vacuum cleaner hose adapters, power tool battery clips, and specialized
          guide rails.
        </li>
        <li>
          <strong>Electronics:</strong> Custom faceplates, battery covers for remotes, and slider caps for audio mixers.
        </li>
        <li>
          <strong>Outdoor Gear:</strong> Roof rack end caps, bike pump adapters, and lawn mower handle clips.
        </li>
      </ul>

      <h2>How We Make It (and What We Need From You)</h2>
      <p>
        We want to make customization feel as easy as sending a text. You don&apos;t need to be an engineer or a CAD
        wizard to get a part from us.
      </p>
      <p>
        <strong>What we need from you:</strong>
      </p>
      <ul>
        <li>
          <strong>The Broken Bits:</strong> If you still have the pieces, they are gold. Even if they are in three
          chunks, we can usually puzzle them back together to get exact measurements.
        </li>
        <li>
          <strong>A Photo:</strong> If the part is missing but its &quot;twin&quot; is still there (like a second knob on
          a stove), a photo next to a ruler is a great start.
        </li>
        <li>
          <strong>A Rough Sketch:</strong> Grab a napkin and a pencil. Draw what you need and jot down a few basic
          measurements. We can take it from there.
        </li>
      </ul>
      <p>
        Once we have your info, <Link href="/3d-printing">GiGi&apos;s Print Shop</Link> goes to work. We design the
        digital model, check the tolerances, and hit &quot;print.&quot;
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/UuZp1_uEtXj.webp"
        alt="A hand-drawn sketch next to a digital 3D model on a tablet"
      />

      <h2>Straight Talk on Pricing &amp; Quality</h2>
      <p>
        At Mixed Maker Shop, we don&apos;t believe in &quot;hidden fees&quot; or corporate jargon. We use{" "}
        <strong>plain-language pricing</strong> so you know what you&apos;re getting into before we start.
      </p>
      <p>
        If a part is too thin or fragile to be printed safely, we&apos;ll tell you. We&apos;d rather tell you &quot;that
        won&apos;t work&quot; than take your money for a part that&apos;s going to snap in two days. We use high-quality,
        durable 3D printed materials (like the kind used in car interiors or high-end tools) to ensure your
        &quot;obsolete&quot; gear stays in the &quot;working&quot; column for a long time.
      </p>

      <h2>More Than Just Parts</h2>
      <p>
        While we love saving your physical gear, we also help local businesses build their digital gear. If you&apos;re a
        small business owner looking to get your name out there while you&apos;re busy fixing your shop equipment, check
        out <Link href="/">Topher&apos;s Web Design</Link>.
      </p>
      <p>
        Just like our 3D printing service, our web design is straightforward. In fact, we offer a{" "}
        <strong>free website homepage preview</strong>. We&apos;ll build a draft of your new homepage so you can see
        exactly where we&apos;re going before you spend a dime. No fluff, just practical digital tools.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/IHhwudcwpt-.webp"
        alt="A collection of 3D printed gears and brackets arranged on a dark workbench"
      />

      <h2>Ready to Hit the &quot;Save Game&quot; Button?</h2>
      <p>
        Don&apos;t let a broken plastic bit force you into buying a whole new appliance. Let&apos;s see if we can print a
        solution first. Whether it&apos;s a custom gear for a 30-year-old projector or a specialized bracket for your
        workshop, we&apos;re ready to help you build it.
      </p>
      <p>
        <strong>How to get started:</strong>
      </p>
      <ol>
        <li>
          <strong>Gather your evidence:</strong> Grab the broken bits, a photo, or a sketch.
        </li>
        <li>
          <strong>Reach out:</strong> Head over to our <Link href="/contact">Contact Page</Link> or check out our{" "}
          <Link href="/custom-3d-printing">Custom 3D Printing</Link> section for more ideas.
        </li>
        <li>
          <strong>Tell us what you&apos;re making:</strong> Send us your description or photos, and we&apos;ll figure out
          the best way to build it.
        </li>
      </ol>

      <BlogInlineCta>
        <p className="!mb-0">
          Stop singing the Obsolete Part Blues.{" "}
          <strong>
            <Link href="/custom-3d-printing">Submit a request at GiGi&apos;s Print Shop</Link>
          </strong>{" "}
          and let&apos;s get your gear back in the game.
        </p>
      </BlogInlineCta>
    </BlogPostLayout>
  );
}
