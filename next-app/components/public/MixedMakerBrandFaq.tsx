import {
  mmsH2OnGlass,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdrop,
} from "@/lib/mms-umbrella-ui";
import { publicShellClass } from "@/lib/public-brand";
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import { cn } from "@/lib/utils";

const shell = publicShellClass;
const backdrop = mmsUmbrellaSectionBackdrop;

const faqs: { q: string; a: string }[] = [
  {
    q: "What is MixedMakerShop?",
    a: "MixedMakerShop is Topher and GiGi's practical creative studio — one umbrella home for websites and tools, 3D printing, property-care paths, and other useful projects built online, outside, and in the workshop.",
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
    a: "Under the umbrella you will find web design and digital tools, GiGi's Print Shop for custom 3D printing, property-care routing where it applies, and new experiments in the Idea Lab — all described in plain language on each path's page.",
  },
  {
    q: "Who is MixedMakerShop for?",
    a: "Local owners who want practical help, remote-friendly projects nationwide, and anyone who benefits from clear websites, simple tools, real-world builds, and honest communication with the people doing the work.",
  },
];

export function MixedMakerBrandFaq() {
  return (
    <section className={cn(backdrop, "max-md:bg-[#111510]")} id="faq">
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
