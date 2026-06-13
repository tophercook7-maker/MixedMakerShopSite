import type { Metadata } from "next";
import Link from "next/link";
import {
  BlogArticleImage,
  BlogInlineCta,
  BlogPostLayout,
} from "@/components/public/BlogPostLayout";
import { SITE_URL } from "@/lib/site";

const slug = "hollow-gate";
const canonical = `${SITE_URL}/blog/${slug}`;

const title = "Step Beyond the Threshold: Unlocking The Hollow Gate";
const subtitle =
  "A sensory storytelling experiment from Mixed Maker Shop — digital atmosphere, curated sound, and a threshold you step into, not scroll past";

export const metadata: Metadata = {
  title: `${title} | MixedMakerShop Blog`,
  description:
    "Discover The Hollow Gate — an immersive browser experience from Mixed Maker Shop's Idea Lab. Headphones recommended, distractions gone, story yours to uncover.",
  alternates: { canonical },
  openGraph: {
    title,
    description:
      "Step beyond the threshold into The Hollow Gate — a digital immersive experience built in the Idea Lab with layered soundscapes and no ad noise.",
    url: canonical,
  },
};

export default function HollowGateBlogPostPage() {
  return (
    <BlogPostLayout
      slug={slug}
      category="Idea Lab"
      readTime="8 min read"
      title={title}
      subtitle={subtitle}
      heroImage={{
        src: "https://cdn.marblism.com/RnM4-1I0qRE.webp",
        alt: "A cinematic digital gateway pulsing with warm orange light in a moody charcoal-colored workshop",
      }}
    >
      <p>
        There is a specific kind of silence that happens right before you open a heavy door. It&apos;s that half-second
        where your hand is on the cold metal handle, and you haven&apos;t yet felt the rush of air from the room beyond.
        In the physical world, we call that a threshold. In the digital world, we usually just call it a
        &quot;loading screen.&quot;
      </p>
      <p>
        At Mixed Maker Shop, we&apos;ve always been obsessed with the bridge between those two worlds. Whether we&apos;re
        turning a digital file into a <Link href="/3d-printing">durable 3D printed keychain</Link> or building a{" "}
        <Link href="/">mobile-friendly website</Link> for a local business, we&apos;re always looking for ways to make
        the digital feel a bit more tactile: a bit more <em>real</em>.
      </p>
      <p>That&apos;s why we built <strong>The Hollow Gate</strong>.</p>
      <p>
        It&apos;s not just a webpage, and it&apos;s not quite a movie. It&apos;s a digital immersive experience designed
        to be &quot;stepped into.&quot; It&apos;s an experiment from our <Link href="/idea-lab">Idea Lab</Link> that asks:{" "}
        <em>What happens if we stop scrolling for a second and actually look?</em>
      </p>
      <p>
        If you&apos;re ready to see what&apos;s on the other side, grab your headphones. It&apos;s time to step beyond the
        threshold.
      </p>

      <h2>What is The Hollow Gate?</h2>
      <p>
        The Hollow Gate is a sensory storytelling experience that lives entirely in your browser. Think of it as a
        &quot;digital atmosphere.&quot; It combines visual mystery, curated soundscapes, and a narrative that unfolds at
        your own pace.
      </p>
      <p>
        Unlike most things on the internet today, it isn&apos;t trying to sell you a subscription or trick you into
        clicking an ad. It&apos;s a piece of digital craftsmanship. It&apos;s a short, immersive &quot;mood&quot; that
        tells a story through what you see and, more importantly, what you hear.
      </p>
      <p>
        <strong>Who is it for?</strong>
      </p>
      <ul>
        <li>
          <strong>The Seekers:</strong> People who love a good mystery and aren&apos;t afraid of a little atmosphere.
        </li>
        <li>
          <strong>The Tired Scrollers:</strong> Anyone who is burnt out on social media feeds and wants to spend 15
          minutes in a world that doesn&apos;t ask for &quot;likes.&quot;
        </li>
        <li>
          <strong>Creative Thinkers:</strong> Designers, writers, and makers who want to see how web technology can be
          used for more than just business landing pages.
        </li>
        <li>
          <strong>Night Owls:</strong> It&apos;s best enjoyed when the house is quiet and the lights are low.
        </li>
      </ul>
      <BlogArticleImage
        src="https://cdn.marblism.com/TqN1MyNR-fc.webp"
        alt="A person wearing headphones, looking at a glowing tablet in a dimly lit atmospheric room"
      />

      <h2>Why is This Cooler Than a Regular Story?</h2>
      <p>
        You could read a book or watch a YouTube video, sure. But The Hollow Gate is different because it requires you to
        be present. We&apos;ve designed it as a &quot;manual&quot; experience. You aren&apos;t being fed a story at 2x
        speed; you are uncovering it.
      </p>
      <ul>
        <li>
          <strong>It&apos;s Sensory First:</strong> Most websites are built for &quot;data integrity&quot; (boring
          corporate talk for &quot;making sure the text is readable&quot;). We built this for <em>feeling</em>. The audio
          is layered to make you feel like you&apos;re actually standing in the room described.
        </li>
        <li>
          <strong>It&apos;s a &quot;Small Tech&quot; Project:</strong> We didn&apos;t use a massive agency or a
          million-dollar budget. This was built right here in the shop, using the same tools we use to build{" "}
          <Link href="/growth-offer">local business websites</Link>. It&apos;s proof that you don&apos;t need a huge team
          to make something that feels big.
        </li>
        <li>
          <strong>No Distractions:</strong> Once you enter the Gate, the rest of the web disappears. No pop-ups, no
          notifications, just the threshold.
        </li>
      </ul>

      <h2>How to Customize Your Experience</h2>
      <p>
        While the story itself is a set path, the <em>experience</em> of it is entirely up to you. At Mixed Maker Shop,
        we&apos;re all about customization: from <Link href="/custom-3d-printing">custom 3D prints</Link> to personalized
        web tools.
      </p>
      <p>To get the most out of The Hollow Gate, we recommend &quot;building&quot; your environment:</p>
      <ol>
        <li>
          <strong>The Sound:</strong> This is 50% of the experience. High-quality over-ear headphones are the best way to
          catch the subtle textures we&apos;ve hidden in the audio.
        </li>
        <li>
          <strong>The Light:</strong> If you&apos;re on a desktop or tablet, dim the lights in your room. Let the glow of
          the screen be your only light source.
        </li>
        <li>
          <strong>The Device:</strong> While it works on many devices, we really recommend a desktop or a tablet. A phone
          screen is just too small to capture the &quot;weight&quot; of the gateway.
        </li>
      </ol>
      <BlogArticleImage
        src="https://cdn.marblism.com/YC3D-pLJEsd.webp"
        alt="Close-up of wood grain meeting a glowing digital circuit board, representing the blend of physical and digital making"
      />

      <h2>From the Maker&apos;s Desk: How We Built It</h2>
      <p>
        People often ask us why a shop that makes <Link href="/3d-printing">3D printed bookmarks</Link> and{" "}
        <Link href="/lawn-care-hot-springs-ar">lawn care websites</Link> would spend time building a digital ghost story.
      </p>
      <p>
        The answer is simple: <strong>We love to build.</strong>
      </p>
      <p>
        Building The Hollow Gate was a way for us to flex our creative muscles. It&apos;s the same philosophy we bring to
        every client project. We don&apos;t just &quot;deploy assets&quot; or &quot;optimize output.&quot; We figure out
        what kind of feeling a business wants to give its customers and then we build the best way to deliver it.
      </p>
      <p>
        For this project, Topher (our owner and lead designer) wanted to push the boundaries of what a simple
        &quot;link&quot; could do. We treated the code like wood and the sound like paint. We layered gradients, adjusted
        shadows, and fine-tuned the audio until the &quot;threshold&quot; felt like something you could actually touch.
      </p>

      <h2>What We Need From You to Get Started</h2>
      <p>We don&apos;t need a complicated brief or a high-end setup. To step through The Hollow Gate, all you need is:</p>
      <ul>
        <li>
          <strong>A quiet 15 minutes:</strong> Give yourself the time to actually listen.
        </li>
        <li>
          <strong>Headphones:</strong> Trust us on this one.
        </li>
        <li>
          <strong>$1.99:</strong> While there is a{" "}
          <Link href="/hollow-gate">free demo you can try right now</Link>, unlocking the full story costs less than a cup
          of coffee. This helps us keep the <Link href="/idea-lab">Idea Lab</Link> running and building more weird, cool
          things.
        </li>
      </ul>
      <BlogArticleImage
        src="https://cdn.marblism.com/qdmg3RsbVM0.webp"
        alt="A wide shot of a threshold between a realistic workshop and a foggy digital world of code"
      />

      <h2>How to Enter the Gate</h2>
      <p>
        If you&apos;re ready to leave the &quot;regular&quot; internet behind for a few minutes, the process is easy:
      </p>
      <ol>
        <li>
          <strong>Try the Demo:</strong> Head over to <Link href="/hollow-gate">The Hollow Gate</Link> and see if the
          vibe is right for you.
        </li>
        <li>
          <strong>Unlock the Story:</strong> If you like what you see and hear, you can unlock the full experience for
          $1.99 via a secure Stripe checkout.
        </li>
        <li>
          <strong>Step Through:</strong> Once you&apos;ve paid, the threshold will open, and the rest of the story is
          yours to explore.
        </li>
      </ol>
      <p>
        We&apos;re a small shop. We don&apos;t have a massive marketing budget or a corporate board. We just have ideas
        and the tools to build them. When you unlock a project like The Hollow Gate, you&apos;re directly supporting a
        local maker and helping us keep the lights on for the next big experiment.
      </p>
      <p>
        <strong>Tell us what you think.</strong> After you&apos;ve experienced it,{" "}
        <Link href="/contact">send us a message</Link>. Did it move you? Did it creep you out? Did it give you an idea for
        something you want us to build for your own business?
      </p>
      <p>
        We&apos;re always here, usually with a coffee in hand and a 3D printer humming in the background, ready to build
        the next thing.
      </p>
      <BlogArticleImage
        src="https://cdn.marblism.com/O8ULBvIec-m.webp"
        alt="A dark wooden table with headphones and a note that says Enter the Gate"
      />

      <h3>Ready to start?</h3>
      <p>
        <Link href="/hollow-gate">
          <strong>Step Beyond the Threshold Now</strong>
        </Link>
      </p>

      <BlogInlineCta>
        <p className="!mb-0">
          <Link href="/hollow-gate" className="font-semibold">
            Enter The Hollow Gate
          </Link>{" "}
          — free demo first, full story unlock for $1.99. Questions?{" "}
          <Link href="/contact" className="font-semibold">
            Contact Mixed Maker Shop
          </Link>
          .
        </p>
      </BlogInlineCta>
    </BlogPostLayout>
  );
}
