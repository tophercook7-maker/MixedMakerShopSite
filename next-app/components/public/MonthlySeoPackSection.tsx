import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBtnSecondary,
  mmsBtnSecondaryOnGlass,
  mmsBullet,
  mmsGlassPanelDense,
  mmsH2,
  mmsSectionBorder,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const includes = [
  "New service/location pages each month",
  "Ongoing improvements",
  "Better chances of being found on Google",
] as const;

const wdFg = "text-[rgba(248,242,232,0.96)]";
const wdBody = "text-[rgba(236,224,206,0.82)]";

export function MonthlySeoPackSection({
  analyticsLocation,
  variant = "default",
  tone = "default",
}: {
  /** For `eventProps.location` on the contact CTA */
  analyticsLocation: string;
  /** `default`: light card on cream bands. `pricing`: nested inside pricing page shell. */
  variant?: "default" | "pricing";
  /** `warmSmoke`: web-design page — medium-dark smoked panel + light text */
  tone?: "default" | "warmSmoke";
}) {
  const warm = tone === "warmSmoke";

  return (
    <section
      className={cn(
        "border-b border-[rgba(214,154,96,0.12)]",
        mmsSectionBorder,
        variant === "pricing"
          ? "bg-transparent"
          : warm
            ? "bg-transparent"
            : "bg-gradient-to-b from-[#e8efe8]/80 via-[#f4f1ea] to-[#ece7dd]",
      )}
    >
      <div
        className={cn(
          variant === "pricing" ? "mx-auto mt-16 w-full max-w-3xl" : cn(shell, "max-w-3xl py-16 md:py-20 lg:py-24"),
        )}
      >
        <div
          className={cn(
            warm
              ? cn("web-design-surface p-8 sm:p-10")
              : cn(
                  mmsGlassPanelDense,
                  "border-[#3f5a47]/14 p-8 shadow-[0_22px_55px_-32px_rgba(30,36,31,0.18)] sm:p-10",
                ),
          )}
        >
          <h2 className={warm ? cn(mmsH2, wdFg) : mmsH2}>Keep your site growing</h2>
          <p className={cn("mt-6 text-base leading-relaxed md:text-lg", warm ? wdBody : mmsBodyFrost)}>
            Most websites stay the same after they&apos;re built. I can keep adding new pages so your business has a better
            chance of showing up when people search locally.
          </p>
          <p className={cn("mt-3 text-sm font-medium md:text-[15px]", warm ? wdBody : mmsBodyFrost)}>
            Monthly SEO Pack — simple monthly options based on how many pages you want added.
          </p>
          <p
            className={cn(
              "mt-8 text-xs font-semibold uppercase tracking-[0.14em]",
              warm ? "text-[rgba(214,197,176,0.85)]" : "text-[#3f5a47]",
            )}
          >
            Includes
          </p>
          <ul className={cn("mt-4 space-y-3 text-base md:text-[17px]", warm ? wdBody : mmsBodyFrost)}>
            {includes.map((line) => (
              <li key={line} className="flex gap-3">
                <span className={warm ? "font-bold text-[#c9a078]" : mmsBullet} aria-hidden>
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <PublicCtaRow>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: analyticsLocation, target: "contact", topic: "monthly_seo_pack" }}
                className={cn(
                  warm ? mmsBtnSecondaryOnGlass : mmsBtnSecondary,
                  "inline-flex min-h-[3rem] px-8 no-underline hover:no-underline",
                )}
              >
                Ask About Monthly SEO
              </TrackedPublicLink>
            </PublicCtaRow>
          </div>
        </div>
      </div>
    </section>
  );
}
