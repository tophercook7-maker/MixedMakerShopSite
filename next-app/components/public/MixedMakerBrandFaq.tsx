import { JsonLd } from "@/components/public/JsonLd";
import {
  mmsH2OnGlass,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdrop,
} from "@/lib/mms-umbrella-ui";
import { publicShellClass } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";
import { buildFaqSchema } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

const shell = publicShellClass;
const backdrop = mmsUmbrellaSectionBackdrop;

const faqs: { q: string; a: string }[] = [
  {
    q: "What is MixedMakerShop?",
    a: "MixedMakerShop is Topher Cook's one-person shop in Hot Springs, Arkansas. One guy, a lot of skills: websites and apps, AI and automation, books and audiobooks, in-home computer help, 3D printing, genealogy and family history, and prototypes for ideas that need building.",
  },
  {
    q: "What happened to Topher's Web Design?",
    a: "It folded into MixedMakerShop. Same person, same web design work, one name. Old topherswebdesign.com links land here.",
  },
  {
    q: "What services are offered?",
    a: "Websites, landing pages, web apps, and custom software; AI agents, automations, and voice AI; books, ebooks, audiobooks, book trailers, logos, and graphics; in-home computer repair, setup, and tutoring; 3D printing from your file or a photo; family-tree research and Tree of Life prints; and prototypes for unusual ideas. Each has its own page with real prices.",
  },
  {
    q: "Do you work with individuals, or only businesses?",
    a: "Both. Computer help, 3D printing, family history, books, and audiobooks are mostly for individuals and families. Websites, AI, and automation are mostly for businesses. The contact form works for either.",
  },
  {
    q: "Who is MixedMakerShop for?",
    a: "Local owners who want practical help, remote-friendly projects nationwide, and anyone who benefits from clear websites, simple tools, real-world builds, and honest communication with the people doing the work.",
  },
  {
    q: "Do you build websites for small businesses in Hot Springs, Arkansas?",
    a: "Yes. MixedMakerShop builds practical, mobile-friendly websites for small businesses in Hot Springs and the surrounding Central Arkansas area, including service businesses, shops, churches, creators, and local contractors.",
  },
  {
    q: "Can you help with Google Business Profile and local SEO?",
    a: "Yes. MixedMakerShop helps local businesses improve their Google presence with better website structure, local service pages, Google Business Profile cleanup, review links, and search-friendly content.",
  },
  {
    q: "Is MixedMakerShop really just one person?",
    a: "Yes. Topher is the whole shop — the person who answers the phone is the person who builds the site, writes the automation, and shows up for the house call. Nothing gets handed off to a junior or outsourced overseas.",
  },
  {
    q: "What else comes out of the Lab besides websites?",
    a: "AI tools and automation for small businesses, custom apps and games, published books and audiobooks, original music and video, and pop-out video ads. The Lab page lists what is shipped, what is live, and what is still on the bench.",
  },
  {
    q: "Do you work with businesses outside Hot Springs?",
    a: "Yes. MixedMakerShop primarily serves Hot Springs, Garland County, Benton, Malvern, Lonsdale, and Central Arkansas, but can also help remote clients when the project is a good fit.",
  },
  {
    q: "How do I get started?",
    a: "Send a message through the contact page, text or call 501-575-8017, or email Topher@mixedmakershop.com. Say what you're working on in one sentence and you'll get a straight answer within one business day. Website projects can start with a free homepage preview.",
  },
];

const faqSchema = buildFaqSchema(
  faqs.map((item) => ({ question: item.q, answer: item.a })),
  SITE_URL,
);

export function MixedMakerBrandFaq() {
  return (
    <section className={cn(backdrop, "max-md:bg-[#111510]")} id="faq">
      <JsonLd data={faqSchema} />
      <div className={cn(shell, mmsSectionY)}>
        <div className="public-glass-box public-glass-box--pad max-w-3xl">
          <p className={mmsSectionEyebrowOnGlass}>Questions &amp; answers</p>
          <h2 className={cn(mmsH2OnGlass, "mt-4")}>Questions people ask first</h2>
          <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
            Plain-language answers about what MixedMakerShop is, who it&apos;s for, and how to get something started.
          </p>
        </div>
        <div className="mx-auto max-w-3xl space-y-3 pt-6 md:pt-8">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group public-glass-box--soft public-glass-box--pad open:bg-white/12"
            >
              <summary className="cursor-pointer list-none font-semibold text-white [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-white/40 transition group-open:rotate-180" aria-hidden>
                    ▼
                  </span>
                </span>
              </summary>
              <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
