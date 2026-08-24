import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { JsonLd } from "@/components/public/JsonLd";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicShellClass, publicTopherEmail } from "@/lib/public-brand";
import { metaDescription } from "@/lib/seo/snippet-meta";
import { SITE_URL } from "@/lib/site";
import { buildFaqSchema } from "@/lib/structured-data";
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsH3OnGlass,
  mmsOnGlassCtaRowWrap,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdrop,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = `${SITE_URL}/lab`;

export const metadata: Metadata = {
  alternates: { canonical },
  title: "The Lab | One Man, Every Bench",
  description: metaDescription(
    "Inside Topher's one-man lab in Hot Springs, AR: websites, AI tools, 6 App Store apps, 61 published books, original music and video, and in-home computer repair — all built by one person."
  ),
  openGraph: {
    title: "The Lab | MixedMakerShop",
    description: metaDescription(
      "Websites, AI tools, apps, books, music, and video — everything one person builds out of one lab in Hot Springs, Arkansas."
    ),
    url: canonical,
    images: ["/og-image"],
  },
};

/** Counts are pulled from the live portfolio index at /portfolio — keep them in sync when it changes. */
const counters = [
  { value: "61", label: "Books published" },
  { value: "6", label: "Apps on the App Store" },
  { value: "25+", label: "Years of local tech help" },
  { value: "1", label: "Person doing all of it" },
] as const;

type Bench = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  proof: string[];
  links: { href: string; label: string; external?: boolean }[];
};

const benches: Bench[] = [
  {
    id: "web",
    eyebrow: "Bench 01",
    title: "Websites & Local SEO",
    body: "The bench that pays for the rest of the lab. Mobile-friendly small business sites, redesigns, landing pages, and the local SEO foundations that make them findable — no agency layers, no account manager between you and the person writing the code.",
    proof: [
      "Fresh Cut Property Care, Deep Well Audio, Kelsey's Kustom Kreations, and GoneFishin Keychains all run on sites built here",
      "Free homepage preview before you commit a dollar",
      "Starter sites from $400 with pricing posted publicly",
    ],
    links: [
      { href: TOPHER_WEB_DESIGN_URL, label: "Topher's Web Design", external: true },
      { href: "/website-samples", label: "Website samples" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    id: "repair",
    eyebrow: "Bench 02",
    title: "In-Home Computer Repair",
    body: "The original bench, running since 2000 as Cook's Computer Service. House calls for slow machines, virus removal, Wi-Fi that keeps dropping, upgrades, and the everyday problems that are faster to fix in person than to explain over the phone.",
    proof: [
      "Hot Springs, Benton, Hot Springs Village, Lake Hamilton, Fountain Lake, and nearby",
      "Remote help when the issue allows it",
      "Straight diagnosis before any work starts",
    ],
    links: [
      { href: "/in-home-computer-repair", label: "In-home computer repair" },
      { href: "/contact", label: "Book a house call" },
    ],
  },
  {
    id: "ai",
    eyebrow: "Bench 03",
    title: "AI Tools & Automation",
    body: "Practical automation with guardrails — the boring, specific kind that actually saves hours. Lead-response bots that reply while you're on a ladder, quoting calculators, intake forms that route themselves, and internal dashboards you own outright instead of renting by the month.",
    proof: [
      "Henry AI — a workspace build for organizing drafts, tasks, and guarded AI workflows",
      "The CRM and lead routing behind this very site were built on this bench",
      "Drafts stay draft-first: nothing sends to your customers without a human saying yes",
    ],
    links: [
      { href: "/websites-tools#ai-automation", label: "AI & automation" },
      { href: "/builds#build-spotlight-henry", label: "Henry AI spotlight" },
    ],
  },
  {
    id: "apps",
    eyebrow: "Bench 04",
    title: "Apps & Games",
    body: "Real shipped software, not mockups. Text adventures, word games, study companions, and scanning tools — written, signed, submitted, and maintained by one person, including the parts nobody enjoys like App Store review.",
    proof: [
      "Six apps live on the App Store: Answering the Dark, James: My Companion, Pic Pop Word Game, The Hollow Gate, The Whispering Woods, and Whispering Hollow",
      "StrainSpotter — an app-style scanning product on its own domain",
      "Signed, submitted, and maintained solo — including the parts nobody enjoys, like App Store review",
    ],
    links: [
      { href: "/portfolio/index.html", label: "See the apps" },
      { href: "https://strainspotter.app/", label: "StrainSpotter", external: true },
    ],
  },
  {
    id: "books",
    eyebrow: "Bench 05",
    title: "Books & Audiobooks",
    body: "Written, edited, formatted, covered, and published from this desk. Reference collections, faith fiction, memoir, and family history — plus narrated audio produced in the same room, with voice work done locally instead of licensed by the minute.",
    proof: [
      "61 titles published across Lost Scriptures, faith fiction, memoir, reference, and family history",
      "Print and ebook interiors formatted in-house — covers included",
      "Audiobook production run on the same bench, ACX-spec",
    ],
    links: [
      { href: "/portfolio/index.html", label: "Browse the catalog" },
      { href: "/contact", label: "Ask about a book project" },
    ],
  },
  {
    id: "media",
    eyebrow: "Bench 06",
    title: "Music & Video",
    body: "Original music, book trailers, cinematic montages, and the pop-out video ads that break out of the frame mid-scroll. Made here rather than pulled from a stock library, which is why the squirrel on the homepage is tearing through the actual page.",
    proof: [
      "Pop-out ads built as ready-to-post social creative for local niches",
      "Book trailers, demo reels, and the signature Dragon ad",
      "Original music beds and full tracks scored locally",
    ],
    links: [
      { href: "/3d-scenes", label: "Pop-out ad gallery" },
      { href: "/portfolio/index.html", label: "Videos & ads" },
    ],
  },
  {
    id: "products",
    eyebrow: "Bench 07",
    title: "Digital Products & Tools",
    body: "Templates, checklists, kits, and small web tools — each one shaped around a problem that showed up in real client work first. If it saved time here, it gets cleaned up and handed over.",
    proof: [
      "Website starter checklists, audit sheets, and project capture sheets",
      "Free website check and website roast tools",
      "Free homepage preview generator",
    ],
    links: [
      { href: "/websites-tools#templates-kits", label: "Templates & kits" },
      { href: "/free-website-check", label: "Free website check" },
      { href: "/resources", label: "Resource library" },
    ],
  },
  {
    id: "outside",
    eyebrow: "Bench 08",
    title: "Property Care",
    body: "Not everything in the lab is on a screen. Lawn care, cleanup, and outdoor help around Hot Springs runs through Fresh Cut Property Care — a real local service with a site and CRM built on these same benches.",
    proof: [
      "Mowing and cleanup around Hot Springs, Arkansas",
      "Estimates requested straight through the Fresh Cut site",
      "Same builder behind the service and the software running it",
    ],
    links: [
      { href: "/property-care", label: "Property care" },
      { href: "https://freshcutpropertycare.com/", label: "Fresh Cut Property Care", external: true },
    ],
  },
  {
    id: "experiments",
    eyebrow: "Bench 09",
    title: "Experiments",
    body: "The half-finished corner. Weather stations running on solar and LoRa radio, offline AI tooling, and ideas that haven't earned a price tag yet. Some become services, some quietly die — either way you can watch it happen and vote on what's next.",
    proof: [
      "Off-grid LoRa weather station with edge AI and no cloud subscription",
      "Idea Lab voting on what gets built next",
      "Builds write-ups for the ones that shipped",
    ],
    links: [
      { href: "/idea-lab", label: "Idea Lab" },
      { href: "/builds", label: "Builds & write-ups" },
      { href: "/blog/off-grid-lora-weather-station", label: "The weather station build" },
    ],
  },
];

const faqs = [
  {
    q: "Is MixedMakerShop really one person?",
    a: "Yes. Topher Cook designs, builds, ships, invoices, and answers the phone. There is no junior developer, no offshore team, and no account manager — the person you talk to is the person doing the work.",
  },
  {
    q: "How can one person cover that many benches?",
    a: "Twenty-five years of local tech help, plus heavy use of AI tooling built and hosted here rather than rented. The benches also feed each other: the CRM behind a client site is the same kind of tool sold as automation, and the video work started as ads for the shop itself.",
  },
  {
    q: "What if my project spans more than one bench?",
    a: "That is usually the point. A website with an AI helper on it, a book with a trailer and an audiobook, or an app with a landing page behind it are all one conversation and one invoice instead of three vendors.",
  },
  {
    q: "Where do most projects start?",
    a: "With a free homepage preview. It costs nothing, takes about two minutes to request, and shows you the direction before you commit to anything.",
  },
];

const faqSchema = buildFaqSchema(
  faqs.map((f) => ({ question: f.q, answer: f.a })),
  canonical,
);

export default function LabPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <JsonLd data={faqSchema} />
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive} id="lab-intro">
          <div className={cn(publicShellClass, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>The Lab</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
                One man. One laboratory.
              </h1>
              <p className={cn("mt-6 text-lg font-semibold leading-snug md:text-xl", mmsOnGlassPrimary)}>
                Websites, AI tools, apps, books, music, video, computer repair, and whatever is half-finished on the
                bench this week — all of it built by the same person, in the same room, in Hot Springs, Arkansas.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Most shops this size pick one lane and stay in it. This one didn&apos;t. Twenty-five years of fixing
                local computers turned into building the software, then the sites, then the tools, then the books and
                the video that go with them. Nothing here is subcontracted, white-labeled, or waiting on a partner
                agency — if it&apos;s on this page, it came off this bench.
              </p>
              <div className={cn(mmsOnGlassCtaRowWrap, "mt-8")}>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "lab_hero", target: "free_mockup" }}
                  className={cn(mmsBtnPrimary, "inline-flex w-full justify-center gap-2 px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Get a Free Website Preview
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "lab_hero", target: "contact" }}
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Bring me a problem
                </TrackedPublicLink>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {counters.map((c) => (
                <div key={c.label} className="public-glass-box--soft public-glass-box--pad text-center">
                  <p className="text-4xl font-bold tracking-tight text-white md:text-5xl">{c.value}</p>
                  <p className={cn("mt-2 text-sm font-semibold uppercase tracking-[0.14em]", mmsOnGlassSecondary)}>
                    {c.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(mmsUmbrellaSectionBackdrop, "max-md:bg-[#111510]")} id="benches">
          <div className={cn(publicShellClass, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Walk the benches</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Nine benches, one person at all of them.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Each one is a real, working lane with something shipped behind it. Pick the bench closest to your
                problem — or send the problem over and let me tell you which bench it belongs on.
              </p>
            </div>

            <div className="mt-10 space-y-6">
              {benches.map((bench) => (
                <article
                  key={bench.id}
                  id={bench.id}
                  className="public-glass-box--soft public-glass-box--pad scroll-mt-28"
                >
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <div className="lg:w-[58%]">
                      <p className={mmsSectionEyebrowOnGlass}>{bench.eyebrow}</p>
                      <h3 className={cn(mmsH3OnGlass, "mt-3 !text-2xl md:!text-[1.7rem]")}>{bench.title}</h3>
                      <p className={cn("mt-4 text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>
                        {bench.body}
                      </p>
                    </div>
                    <div className="lg:w-[42%]">
                      <p className={cn("text-xs font-bold uppercase tracking-[0.18em]", mmsOnGlassPrimary)}>
                        What&apos;s actually shipped
                      </p>
                      <ul className="mt-4 space-y-3">
                        {bench.proof.map((line) => (
                          <li
                            key={line}
                            className={cn("flex gap-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}
                          >
                            <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(232,149,92,0.95)]" aria-hidden />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                        {bench.links.map((link) =>
                          link.external ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-1.5 text-sm font-semibold")}
                            >
                              {link.label}
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            </a>
                          ) : (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-1.5 text-sm font-semibold")}
                            >
                              {link.label}
                              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(mmsUmbrellaSectionBackdrop, "max-md:bg-[#111510]")} id="lab-faq">
          <div className={cn(publicShellClass, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Fair questions</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>The ones people actually ask.</h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {faqs.map((f) => (
                <article key={f.q} className="public-glass-box--soft public-glass-box--pad">
                  <h3 className={cn(mmsH3OnGlass, "!text-lg md:!text-xl")}>{f.q}</h3>
                  <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{f.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={cn(
            "border-t",
            mmsUmbrellaSectionBackdrop,
            "max-md:bg-gradient-to-b max-md:from-[#e8e3da] max-md:to-[#dcd6cc]",
          )}
          id="lab-contact"
        >
          <div className={cn(publicShellClass, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad mx-auto max-w-2xl text-center">
              <h2 className={cn(mmsH2OnGlass, "!text-2xl md:!text-3xl")}>Got something that needs building?</h2>
              <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsOnGlassPrimary)}>
                Describe the problem in plain language. If it belongs on one of these benches, I&apos;ll tell you which
                one and what it costs. If it doesn&apos;t, I&apos;ll tell you that too.
              </p>
              <div className={cn(mmsOnGlassCtaRowWrap, "mt-8 w-full justify-center")}>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "lab_cta", target: "contact" }}
                  className={cn(mmsBtnPrimary, "inline-flex w-full min-w-[12rem] items-center justify-center gap-2 px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Contact Topher
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "lab_cta", target: "free_mockup" }}
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex w-full min-w-[12rem] items-center justify-center px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Free Website Preview
                </TrackedPublicLink>
              </div>
              <p className={cn("mx-auto mt-5 max-w-lg text-sm font-medium sm:text-[15px]", mmsOnGlassSecondary)}>
                Or email the lab directly:{" "}
                <a href={`mailto:${publicTopherEmail}`} className={cn(mmsTextLinkOnGlass, "font-semibold underline-offset-2")}>
                  {publicTopherEmail}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
