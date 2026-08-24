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
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import { cn } from "@/lib/utils";

const shell = publicShellClass;
const backdrop = mmsUmbrellaSectionBackdrop;

const faqs: { q: string; a: string }[] = [
  {
    q: "What is MixedMakerShop?",
    a: "MixedMakerShop is Topher Cook's one-man laboratory in Hot Springs, Arkansas. One person designs, builds, and ships everything here — small business websites, local SEO, AI tools, apps and games, books and audiobooks, video ads, in-home computer repair, and property care.",
  },
  {
    q: "What is Topher's Web Design?",
    a: "Topher's Web Design is the focused web design service for small businesses: clean mobile-friendly websites, redesigns, landing pages, and local SEO foundations — with a calm, direct process instead of agency overhead.",
  },
  {
    q: "How are MixedMakerShop and Topher's Web Design connected?",
    a: "MixedMakerShop is the studio home base. Topher's Web Design is the dedicated web branch when you specifically need a better website, clearer service pages, or local SEO foundations — linked as a separate brand so web work stays easy to find.",
  },
  {
    q: "What services are offered?",
    a: "Web design and local SEO, in-home computer repair, AI tools and automation, custom apps and games, books and audiobooks, pop-out video ads, property-care routing, and whatever is currently on the bench in the Lab and Idea Lab — all described in plain language on each page.",
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
    a: "You can contact MixedMakerShop through the website, call 501-488-1253, or request a free homepage preview or estimate for your website, AI tool, or local business project.",
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
          <h2 className={cn(mmsH2OnGlass, "mt-4")}>How the studio fits together</h2>
          <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
            Plain-language answers for people (and search tools) trying to understand{" "}
            <a
              href={TOPHER_WEB_DESIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-2 hover:decoration-white/60"
            >
              Topher&apos;s Web Design small business website services
            </a>{" "}
            versus the larger{" "}
            <span className="text-white/90">MixedMakerShop creative studio</span>.
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
