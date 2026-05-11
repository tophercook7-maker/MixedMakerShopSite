import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass, publicTopherEmail } from "@/lib/public-brand";
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { AiAutomationInquiryForm } from "@/components/public/AiAutomationInquiryForm";
import { DigitalResourceRequestCard } from "@/components/public/DigitalResourceRequestCard";
import { STARTER_RESOURCE_ITEMS } from "@/lib/websites-tools-starter-resources";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/websites-tools";

export const metadata: Metadata = {
  title: "Websites & Tools | MixedMakerShop",
  description:
    "Topher's Web Design builds clean small-business websites — and MixedMakerShop hosts tools, previews, and digital helpers under one umbrella studio.",
  keywords: [
    "MixedMakerShop websites and tools",
    "Topher's Web Design",
    "small business website",
    "website preview",
    "local business tools",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Websites & Tools | MixedMakerShop",
    description:
      "Web design through Topher's Web Design, plus MixedMakerShop tools, previews, landing pages, and simple business systems.",
    url: canonical,
  },
};

const shell = publicShellClass;

const sections = [
  {
    title: "Web Design",
    body: "Clear local business websites that explain what you do, build trust, and help visitors become calls or leads.",
    href: "/web-design",
  },
  {
    title: "Free Website Preview",
    body: "A homepage-style preview before you commit, built around your business and offer.",
    href: publicFreeMockupFunnelHref,
  },
  {
    title: "Small Business Websites",
    body: "Service pages, simple sites, credibility pages, and local SEO structure for real owners.",
    href: "/small-business-websites-hot-springs",
  },
  {
    title: "Landing Pages",
    body: "Focused pages for one offer, one campaign, or one clear next step.",
    href: "/free-mockup",
  },
  {
    title: "AI & Automation",
    body: "Simple AI-assisted workflows for leads, replies, content drafts, and light automation — explained in plain language.",
    href: "#ai-automation",
  },
  {
    title: "Starter Resources",
    body: "Checklists and prep sheets you can request by email — built around real small-business and maker workflows.",
    href: "#templates-kits",
  },
  {
    title: "Digital Tools",
    body: "Forms, simple dashboards, intake flows, quoting helpers, and business systems.",
    href: "/tools",
  },
  {
    title: "Ad/Promo Help",
    body: "Promo concepts, ad mockups, and simple campaign ideas that pair with a useful landing page.",
    href: "/ad-lab",
  },
] as const;

const mailtoBase = `mailto:${publicTopherEmail}`;

function mailtoSubject(subject: string) {
  return `${mailtoBase}?subject=${encodeURIComponent(subject)}`;
}

export default function WebsitesToolsPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Websites &amp; Tools</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
                Websites, landing pages, and simple digital tools for local businesses.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Topher builds practical online systems that help small businesses look better, explain what they do, and
                get more calls, bookings, and leads.
              </p>
              <PublicCtaRow className="mt-9">
                <a
                  href={TOPHER_WEB_DESIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex w-full items-center justify-center gap-2 px-8 no-underline hover:no-underline sm:w-auto",
                  )}
                >
                  Get a free website demo
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
                <Link href={publicFreeMockupFunnelHref} className={cn(mmsBtnSecondaryOnGlass, "w-full px-8 no-underline hover:no-underline sm:w-auto")}>
                  Free preview on MixedMakerShop
                </Link>
              </PublicCtaRow>
              <p className={cn("mt-6 max-w-2xl text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                Need a website for your business?{" "}
                <a href={TOPHER_WEB_DESIGN_URL} target="_blank" rel="noopener noreferrer" className={mmsTextLinkOnGlass}>
                  Topher&apos;s Web Design small business website services
                </a>{" "}
                live at topherswebdesign.com — clean, mobile-friendly websites, redesigns, landing pages, and local SEO
                foundations for small businesses.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group public-glass-box--soft public-glass-box--pad flex min-h-[13rem] flex-col no-underline transition hover:-translate-y-1 hover:bg-white/12 hover:no-underline"
                >
                  <h2 className="text-xl font-bold tracking-tight text-white">{item.title}</h2>
                  <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                    {item.body}
                  </p>
                  <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                    Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="ai-automation" className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>AI &amp; Automation</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Simple AI workflows for real small-business days.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Mixed Maker Shop treats AI as a set of tools with guardrails — drafts you review, sorting that saves
                clicks, and reminders that reduce dropped balls. Nothing replaces judgment; it reduces repetition.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Typical fits include lead follow-up helpers, customer reply drafts (you send the final message), website
                content outlines, light business organization (tasks, labels, simple CRM hygiene), and local automation
                ideas tied to phone, email, and forms.
              </p>
            </div>
            <div className="mx-auto mt-10 grid w-full max-w-6xl gap-6 lg:grid-cols-2">
              <div className="public-glass-box--soft public-glass-box--pad">
                <h3 className="text-lg font-bold text-white">What &quot;simple&quot; usually means here</h3>
                <ul className={cn("mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                  <li>One workflow at a time — not a dozen bots overnight.</li>
                  <li>Human review before anything customer-facing ships.</li>
                  <li>Clear limits on what gets automated vs. what gets drafted.</li>
                  <li>Fits alongside your website, forms, and tools already on Mixed Maker Shop.</li>
                </ul>
              </div>
              <div className="public-glass-box--soft public-glass-box--pad">
                <h3 className="text-lg font-bold text-white">Examples people ask about</h3>
                <ul className={cn("mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                  <li>
                    <strong className="font-semibold text-white/95">Missed-call follow-up idea</strong> — draft a short SMS or
                    email template after a voicemail so replies stay consistent.
                  </li>
                  <li>
                    <strong className="font-semibold text-white/95">Website inquiry sorter</strong> — tag or summarize form
                    submissions so you triage faster.
                  </li>
                  <li>
                    <strong className="font-semibold text-white/95">Review request helper</strong> — polite ask scripts and a
                    simple sequence that respects timing.
                  </li>
                  <li>
                    <strong className="font-semibold text-white/95">Content idea generator</strong> — headline and outline
                    prompts grounded in your services page.
                  </li>
                  <li>
                    <strong className="font-semibold text-white/95">Quote request organizer</strong> — checklist of info to
                    collect before you price a job.
                  </li>
                  <li>
                    <strong className="font-semibold text-white/95">Daily business checklist assistant</strong> — a compact
                    routine for openings, follow-ups, and end-of-day hygiene.
                  </li>
                </ul>
              </div>
            </div>
            <AiAutomationInquiryForm />
          </div>
        </section>

        <section id="templates-kits" className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Starter resources</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Checklists and prep sheets you can request.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                These are simple documents Topher sends by email — built from real projects (websites, prints, and small
                business operations). No storefront checkout yet; you request what fits and get the resource directly.
              </p>
              <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Prefer something tailored? Say what you&apos;re working on and Topher will point you to the closest sheet or
                suggest a different path.
              </p>
              <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Want the full list with short descriptions first?{" "}
                <Link href="/resources" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  Open the resource library
                </Link>
                .
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {STARTER_RESOURCE_ITEMS.map((item) => (
                <DigitalResourceRequestCard key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
            <div className="public-glass-box public-glass-box--pad mx-auto mt-10 max-w-3xl">
              <p className={cn("text-sm font-semibold uppercase tracking-[0.14em]", mmsSectionEyebrowOnGlass)}>Next steps</p>
              <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4")}>
                <a
                  href={mailtoSubject("Request a resource")}
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex justify-center px-6 py-3 text-center no-underline hover:no-underline")}
                >
                  Request a resource
                </a>
                <a
                  href={mailtoSubject("Ask Topher what fits my project")}
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex justify-center px-6 py-3 text-center no-underline hover:no-underline")}
                >
                  Ask Topher what fits my project
                </a>
                <a
                  href={mailtoSubject("Get the Website Starter Checklist")}
                  className={cn(mmsBtnPrimary, "inline-flex justify-center px-6 py-3 text-center no-underline hover:no-underline")}
                >
                  Get the website checklist
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
