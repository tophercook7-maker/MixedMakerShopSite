import Link from "next/link";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { publicShellClass } from "@/lib/public-brand";
import type { LegalSection } from "@/lib/legal/types";
import {
  mmsOnGlassMuted,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const legalProse = cn(
  "legal-prose",
  "[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white md:[&_h2]:text-[1.35rem]",
  "[&_h2:first-of-type]:mt-6",
  "[&_p]:mb-5 [&_p]:text-base [&_p]:leading-[1.75] [&_p]:text-white/85",
  "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-6 [&_ul]:text-base [&_ul]:leading-[1.7] [&_ul]:text-white/85",
  "[&_li]:pl-1",
);

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  lastUpdated: string;
  intro?: readonly string[];
  sections: readonly LegalSection[];
  relatedLink?: { href: string; label: string };
  pdfHref?: string;
};

export function LegalPageLayout({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  intro,
  sections,
  relatedLink,
  pdfHref,
}: LegalPageLayoutProps) {
  const shell = publicShellClass;

  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY, "pb-24 md:pb-32")}>
            <header className="public-glass-box public-glass-box--pad mx-auto max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>{eyebrow}</p>
              <p className={cn("mt-4 text-sm", mmsOnGlassMuted)}>Effective date: {lastUpdated}</p>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.35rem] md:leading-[1.12]">
                {title}
              </h1>
              {subtitle ? (
                <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>{subtitle}</p>
              ) : null}
              <p className={cn("mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm", mmsOnGlassMuted)}>
                {relatedLink ? (
                  <span>
                    See also:{" "}
                    <Link href={relatedLink.href} className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                      {relatedLink.label}
                    </Link>
                  </span>
                ) : null}
                {pdfHref ? (
                  <span>
                    {relatedLink ? (
                      <span className="opacity-50" aria-hidden>
                        ·
                      </span>
                    ) : null}{" "}
                    <a href={pdfHref} className={cn(mmsTextLinkOnGlass, "font-semibold")} download>
                      Download PDF
                    </a>
                  </span>
                ) : null}
              </p>
            </header>

            <article className={cn("public-glass-box public-glass-box--pad mx-auto mt-10 max-w-3xl", legalProse)}>
              {intro?.map((paragraph) => (
                <p key={paragraph} className="!text-base !leading-[1.75] text-white/85 md:!text-[17px]">
                  {paragraph}
                </p>
              ))}
              {sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2>{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list ? (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.afterList ? <p>{section.afterList}</p> : null}
                </section>
              ))}
              <hr className="my-10 border-white/15" />
              <p className="!mb-0 text-sm text-white/70">
                We may update this page from time to time. Continued use of MixedMakerShop services after changes are
                posted means the updated version applies going forward.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
