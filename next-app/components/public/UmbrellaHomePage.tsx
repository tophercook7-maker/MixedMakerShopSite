import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Box,
  ExternalLink,
  FlaskConical,
  Globe,
  Sparkles,
  TreePine,
  Wrench,
} from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { MixedMakerBrandFaq } from "@/components/public/MixedMakerBrandFaq";
import { UmbrellaHomeHero } from "@/components/public/UmbrellaHomeHero";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import {
  publicFreeMockupFunnelHref,
  publicShellClass,
  publicTopherEmail,
  publicTopherPhoneDisplay,
  publicTopherPhoneTel,
  publicTopherTextHref,
} from "@/lib/public-brand";
import { WHAT_I_DO, contactHrefForTopic } from "@/lib/what-i-do";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassCtaRowWrap,
  mmsSectionEyebrowOnGlass,
  mmsH3OnGlass,
  mmsHomeGlassStackGap,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionY,
  mmsStepCircleOnGlass,
  mmsUmbrellaSectionBackdrop,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/** Desktop: let fixed umbrella read through; mobile: warm solid for stability. */
const homeBackdrop = mmsUmbrellaSectionBackdrop;

const ICONS = {
  Globe,
  Sparkles,
  BookOpen,
  Wrench,
  Box,
  TreePine,
  FlaskConical,
} as const;

/** Real, live, finished work — the proof wall. No dead ventures. */
const proofWall = [
  {
    title: "Maureen A. Cahill — author site",
    body: "Five-page book site with a playable Mahjong board, downloadable resources, and a mailing list — built for a first-time author and her launch team.",
    href: "https://maureenacahill.com/",
    cta: "Visit the site",
    external: true,
    tag: "Website",
  },
  {
    title: "Fresh Cut Property Care",
    body: "A lawn-care site that actually books estimates — with a CRM, lead alerts, and a money dashboard behind it.",
    href: "https://freshcutpropertycare.com/",
    cta: "Visit Fresh Cut",
    external: true,
    tag: "Website + system",
  },
  {
    title: "StrainSpotter",
    body: "An app-style scanning tool with a 5,700-strain dataset behind it — shipped on its own domain.",
    href: "https://strainspotter.app/",
    cta: "Visit StrainSpotter",
    external: true,
    tag: "App",
  },
  {
    title: "61 books, 6 apps, published",
    body: "Reference collections, faith fiction, memoir, and family history — written, narrated, and shipped from this desk.",
    href: "/portfolio",
    cta: "Browse the portfolio",
    external: false,
    tag: "Books & apps",
  },
] as const;

const howItWorks = [
  {
    title: "Tell me what you're working on.",
    body: "One sentence is enough. A website, a slow computer, a book, a part you need printed, a family name you want to trace, an idea that won't leave you alone.",
  },
  {
    title: "You get a straight answer within a business day.",
    body: "What I'd do, what it costs, and how long it takes — in plain language. If I'm not the right fit, I'll tell you who is.",
  },
  {
    title: "I build it. You own it.",
    body: "No monthly rental, no hand-off to a junior. The person who answered the message is the person who does the work.",
  },
] as const;

export function UmbrellaHomePage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <UmbrellaHomeHero />

        {/* ───────── What I do — the seven things from the PDF ───────── */}
        <section className={cn(homeBackdrop)} id="what-i-do">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>What I do</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>One guy. A lot of skills.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Technology, AI, creative work, computers, 3D printing, genealogy — and more. I work across a lot of
                different areas, and if I don&apos;t already know how to do something, I&apos;ll figure out how to
                approach it. Pick the one closest to what you need.
              </p>
            </div>
            <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", mmsHomeGlassStackGap)}>
              {WHAT_I_DO.map((c) => {
                const Icon = ICONS[c.icon];
                return (
                  <article
                    key={c.slug}
                    id={`do-${c.slug}`}
                    className="public-glass-box--soft public-glass-box--pad flex min-h-[18rem] flex-col"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[rgba(232,149,92,0.95)]">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    </div>
                    <h3 className={mmsH3OnGlass}>{c.title}</h3>
                    <p className={cn("mt-2 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{c.lead}</p>
                    <ul className={cn("mt-4 flex-1 space-y-1.5 text-sm leading-snug", mmsOnGlassSecondary)}>
                      {c.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(232,149,92,0.95)]" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className={cn("mt-5 text-xs font-bold uppercase tracking-[0.14em]", mmsOnGlassPrimary)}>
                      {c.price}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                      <Link
                        href={c.href}
                        className={cn("inline-flex items-center gap-2 text-sm font-semibold no-underline hover:no-underline", mmsTextLinkOnGlass)}
                      >
                        {c.cta}
                        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                      </Link>
                      {!c.href.startsWith("/contact") && (
                        <Link
                          href={contactHrefForTopic(c.slug)}
                          className={cn("text-sm font-medium underline-offset-2", mmsOnGlassSecondary)}
                        >
                          Ask about this
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <div className={cn("public-glass-box public-glass-box--pad mt-8 max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>Not on the list?</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4 !text-2xl md:!text-3xl")}>Send it anyway.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Have an idea, a problem, or something you&apos;ve been trying to figure out? I may be able to help, build
                it, research it, fix it, or figure out a way to get started.
              </p>
              <Link
                href={contactHrefForTopic("other")}
                className={cn(mmsBtnPrimary, "mt-7 inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto")}
              >
                Send me a message
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* ───────── How it works ───────── */}
        <section className={cn(homeBackdrop)} id="how-it-works">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>How it works</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Three steps. No runaround.</h2>
            </div>
            <div className={cn("grid gap-6 md:grid-cols-3", mmsHomeGlassStackGap)}>
              {howItWorks.map((step, i) => (
                <div key={step.title} className="public-glass-box--soft public-glass-box--pad">
                  <span className={mmsStepCircleOnGlass} aria-hidden>
                    {i + 1}
                  </span>
                  <h3 className={cn(mmsH3OnGlass, "mt-3")}>{step.title}</h3>
                  <p className={cn("mt-3 text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Proof ───────── */}
        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="featured-work">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Proof</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Real work, live right now.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Not mockups — sites and tools people use today, plus a shelf of published books and shipped apps.
              </p>
            </div>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-4", mmsHomeGlassStackGap)}>
              {proofWall.map((work) => {
                const inner = (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(232,149,92,0.92)]">
                      {work.tag}
                    </p>
                    <h3 className={cn(mmsH3OnGlass, "mt-2")}>{work.title}</h3>
                    <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                      {work.body}
                    </p>
                    <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold", mmsTextLinkOnGlass)}>
                      {work.cta}
                      {work.external ? (
                        <ExternalLink className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                      ) : (
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                      )}
                    </span>
                  </>
                );
                const cls =
                  "group public-glass-box--soft public-glass-box--pad flex min-h-[14rem] flex-col no-underline transition duration-300 hover:-translate-y-1 hover:bg-white/12 hover:no-underline";
                return work.external ? (
                  <a key={work.title} href={work.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link key={work.title} href={work.href} className={cls}>
                    {inner}
                  </Link>
                );
              })}
            </div>
            <div className={cn("public-glass-box public-glass-box--pad mt-8 max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>Free website preview</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4 !text-2xl md:!text-3xl")}>
                Want to see what your business could look like online?
              </h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                For website projects I&apos;ll build a homepage-style preview first, so you see the direction before you
                spend a dollar.
              </p>
              <div className={mmsOnGlassCtaRowWrap}>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_proof", target: "free_mockup" }}
                  className={cn(mmsBtnPrimary, "inline-flex w-full justify-center px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Get a free website preview
                </TrackedPublicLink>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── About ───────── */}
        <section className={cn("border-t border-b", homeBackdrop, "max-md:bg-[#111510]")} id="about-topher">
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad max-w-3xl")}>
              <p className={mmsSectionEyebrowOnGlass}>About Topher</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Local tech help since 2000.</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                I&apos;m Topher Cook, in Hot Springs, Arkansas. I ran Cook&apos;s Computer Service from 2000 to 2014, took
                a forced pause when MS hit, and came back as Mixed Maker Shop — one person, one lab, a lot of benches.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Everything on this page is done by me, start to finish. That&apos;s slower than an agency and a lot more
                honest: you talk to the person doing the work, you get a real price, and you own what you paid for.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                <Link href="/about#story-legacy" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  Read the full story
                </Link>{" "}
                from Cook&apos;s Computer Service to Mixed Maker Shop.
              </p>
              <p className="mt-7 rounded-2xl border border-white/12 bg-white/10 px-5 py-4 text-lg font-semibold text-white">
                “What would actually help someone?”
              </p>
            </div>
            <div className={cn("grid gap-6 md:grid-cols-3", mmsHomeGlassStackGap)}>
              {[
                "Serving Hot Springs, Hot Springs Village, Lake Hamilton, Benton, Malvern, and nearby — in person for computer help, remote for everything else.",
                "Clear starting prices on the common jobs. Custom work gets a written estimate before anything starts.",
                "You can call, text, or email — and the same person answers all three.",
              ].map((line, i) => (
                <div key={line} className="public-glass-box--soft public-glass-box--pad">
                  <span className={mmsStepCircleOnGlass} aria-hidden>
                    {i + 1}
                  </span>
                  <p className={cn("text-base leading-relaxed md:text-[17px]", mmsOnGlassSecondary)}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Squirrel pop-out ads (untouched) ───────── */}
        <section className={cn(homeBackdrop, "max-md:bg-[#111510]")} id="pop-out-ads">
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Mixed Maker Labs &middot; pop-out video ads</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Scroll-stopping pop-out video ads</h2>
              <p className={cn("mt-7 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                We turn a flat business image into a cinematic pop-out video &mdash; watch a real squirrel tear
                right through the page below. Perfect motion for a website hero or a scroll-stopping social post.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/12">
              <video
                src="/videos/squirrel-breakout.mp4"
                poster="/videos/squirrel-breakout-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="A real squirrel tearing through the Mixed Maker Shop homepage"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </section>

        <MixedMakerBrandFaq />

        {/* ───────── Contact ───────── */}
        <section
          className={cn(
            "border-t",
            homeBackdrop,
            "max-md:bg-gradient-to-b max-md:from-[#e8e3da] max-md:to-[#dcd6cc]",
          )}
          id="home-contact"
        >
          <div className={cn(shell, mmsSectionY)}>
            <div className={cn("public-glass-box public-glass-box--pad mx-auto max-w-2xl text-center")}>
              <p className={mmsSectionEyebrowOnGlass}>What are you working on?</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4 !text-2xl md:!text-3xl")}>Whatever it is, send me a message.</h2>
              <p className={cn("mx-auto mt-5 max-w-lg md:text-lg", mmsOnGlassPrimary)}>
                Maybe you need a website. Maybe your computer is giving you trouble. Maybe you&apos;ve got an idea for an
                app, an invention, a book, a 3D print, an automation — or you&apos;ve always wanted to know more about
                your family history.
              </p>
              <PublicCtaRow align="center" className={cn(mmsOnGlassCtaRowWrap, "w-full justify-center")}>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "contact" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex w-full min-w-[12rem] items-center justify-center gap-2 px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Send a message
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href={publicTopherTextHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "text_topher" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex w-full min-w-[12rem] items-center justify-center gap-2 px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Text {publicTopherPhoneDisplay}
                </TrackedPublicLink>
                <TrackedPublicLink
                  href={publicTopherPhoneTel}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "home_cta", target: "call_topher" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "w-full min-w-[10rem] justify-center px-8 sm:w-auto no-underline hover:no-underline",
                  )}
                >
                  Call
                </TrackedPublicLink>
              </PublicCtaRow>
              <p className={cn("mx-auto mt-4 max-w-lg text-sm font-medium sm:text-[15px]", mmsOnGlassSecondary)}>
                Or email{" "}
                <a href={`mailto:${publicTopherEmail}`} className={cn(mmsTextLinkOnGlass, "font-semibold underline-offset-2")}>
                  {publicTopherEmail}
                </a>
              </p>
              <p className={cn("mx-auto mt-4 max-w-lg text-sm font-medium sm:text-[15px]", mmsOnGlassSecondary)}>
                One person. One lab. Useful things, start to finish.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
