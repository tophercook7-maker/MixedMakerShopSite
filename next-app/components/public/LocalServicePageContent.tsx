import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LOCAL_SERVICE_PAGES, type LocalServicePageConfig } from "@/lib/local-service-pages";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsBullet,
  mmsGlassPanelDense,
  mmsH1,
  mmsH2,
  mmsPageBg,
  mmsSectionBorder,
  mmsSectionY,
  mmsTextLink,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className={cn("mt-4 space-y-3 text-base md:text-[17px]", mmsBodyFrost)}>
      {items.map((line) => (
        <li key={line} className="flex gap-3">
          <span className={mmsBullet} aria-hidden>
            ·
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export function LocalServicePageContent({ config }: { config: LocalServicePageConfig }) {
  const related = config.relatedSlugs
    .map((s) => {
      const c = LOCAL_SERVICE_PAGES[s];
      return c ? { slug: c.slug, label: `${c.serviceTitle} in ${c.cityShort}` } : null;
    })
    .filter(Boolean) as { slug: string; label: string }[];

  return (
    <div className={cn(mmsPageBg, "border-b", mmsSectionBorder)}>
      <article>
        <section
          className={cn(
            "border-b bg-gradient-to-b from-[#f7f4ee] via-[#ece7dd] to-[#e2dcd0]/90",
            mmsSectionBorder,
          )}
        >
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4b2a]">Local web design</p>
            <h1 className={cn(mmsH1, "mt-4")}>
              {config.serviceTitle} in {config.cityState}
            </h1>
            <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>{config.intro}</p>
          </div>
        </section>

        <section className={cn("border-b", mmsSectionBorder)}>
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <h2 className={mmsH2}>What we offer</h2>
            <BulletList items={config.whatWeOffer} />
          </div>
        </section>

        <section className={cn("border-b bg-white/90", mmsSectionBorder)}>
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <h2 className={mmsH2}>Why choose us</h2>
            <BulletList items={config.whyChooseUs} />
          </div>
        </section>

        <section className={cn("border-b", mmsSectionBorder)}>
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <h2 className={mmsH2}>Common jobs we handle</h2>
            <BulletList items={config.commonJobs} />
          </div>
        </section>

        <section className={cn("border-b bg-[#f4f3ef]/95", mmsSectionBorder)}>
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <h2 className={mmsH2}>Serving {config.cityShort} and nearby areas</h2>
            <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsBodyFrost)}>{config.servingAreas}</p>
          </div>
        </section>

        <section className={cn("border-b", mmsSectionBorder)}>
          <div className={cn(shell, mmsSectionY, "max-w-3xl")}>
            <h2 className={mmsH2}>Related local services</h2>
            <p className={cn("mt-4 text-base leading-relaxed", mmsBodyFrost)}>
              Explore how we structure sites for nearby services — internal links help visitors (and search) connect the
              dots.
            </p>
            <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${r.slug}`} className={cn(mmsTextLink, "text-[15px]")}>
                    {r.label} →
                  </Link>
                </li>
              ))}
            </ul>
            <p className={cn("mt-4 text-sm", mmsBodyFrost)}>
              Want to see real builds first?{" "}
              <Link href="/examples" className={mmsTextLink}>
                Browse examples
              </Link>
              .
            </p>
            <p className={cn("mt-6 text-sm", mmsBodyFrost)}>
              <Link href="/" className={mmsTextLink}>
                Home
              </Link>
              {" · "}
              <Link href="/web-design" className={mmsTextLink}>
                Web design
              </Link>
              {" · "}
              <Link href="/examples" className={mmsTextLink}>
                Examples
              </Link>
              {" · "}
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "local_service_page", slug: config.slug }}
                className={mmsTextLink}
              >
                Contact
              </TrackedPublicLink>
            </p>
          </div>
        </section>

        <section className={cn("bg-gradient-to-b from-[#ece7dd] to-[#dcd6cc]", mmsSectionBorder, "border-t")}>
          <div className={cn(shell, "py-16 md:py-20")}>
            <div className={cn(mmsGlassPanelDense, "mx-auto max-w-2xl p-8 text-center sm:p-10")}>
              <h2 className={cn(mmsH2, "!text-xl md:!text-2xl")}>Request an estimate</h2>
              <p className={cn("mx-auto mt-4 max-w-lg text-base", mmsBodyFrost)}>
                Tell me about your {config.serviceTitle.toLowerCase()} business — I&apos;ll suggest a clean site structure
                so you can show up when people search in {config.cityShort}.
              </p>
              <PublicCtaRow align="center" className="mt-8 justify-center">
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "local_service_page", slug: config.slug, target: "free_mockup" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex min-h-[3rem] items-center justify-center gap-2 px-8 no-underline hover:no-underline",
                  )}
                >
                  Get My Free Preview
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "local_service_page", slug: config.slug, target: "contact" }}
                  className={cn(mmsBtnSecondary, "min-h-[3rem] px-8 no-underline hover:no-underline")}
                >
                  Contact
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
