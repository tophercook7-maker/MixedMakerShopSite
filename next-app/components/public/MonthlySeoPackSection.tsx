import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBodyFrost,
  mmsBtnPrimary,
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

const supportPlans = [
  {
    name: "Starter Visibility Support",
    price: "$45/month",
    badge: undefined,
    description: "For businesses that want light ongoing help so their site does not sit untouched.",
    includes: [
      "Light monthly website check",
      "Basic SEO touch-up when needed",
      "Small text/photo updates",
      "Google Business Profile activity reminder",
      "Quick visibility notes",
      "Basic uptime/lookover check",
    ],
  },
  {
    name: "Local Growth Support",
    price: "$89/month",
    badge: "Best Deal",
    description: "Best for businesses that want regular activity and stronger local visibility.",
    includes: [
      "Everything in Starter Visibility Support",
      "Google Business Profile updates",
      "4 weekly ad graphics or promotional posts per month",
      "Small website updates",
      "Basic local SEO improvements",
      "Review link/check-in support",
      "Monthly visibility notes",
      "Priority support for small edits",
    ],
  },
  {
    name: "Pro Local Support",
    price: "$149/month",
    badge: undefined,
    description: "For businesses that want more hands-on help and ongoing improvement.",
    includes: [
      "Everything in Local Growth Support",
      "More frequent website improvements",
      "New section or small page additions when needed",
      "Offer/seasonal campaign updates",
      "Local keyword/content ideas",
      "Google Business Profile service/product updates",
      "Monthly strategy check-in",
      "Stronger ongoing support",
    ],
  },
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
  const pricing = variant === "pricing";

  return (
    <section
      className={cn(
        "border-b",
        mmsSectionBorder,
        pricing
          ? "border-white/10 bg-transparent"
          : warm
            ? "bg-transparent"
            : "bg-gradient-to-b from-[#e8efe8]/80 via-[#f4f1ea] to-[#ece7dd]",
      )}
    >
      <div
        className={cn(
          pricing ? "mx-auto mt-16 w-full max-w-6xl" : cn(shell, "max-w-3xl py-16 md:py-20 lg:py-24"),
        )}
      >
        <div
          className={cn(
            pricing
              ? "rounded-3xl border border-white/12 bg-[#07100c]/95 p-8 text-white shadow-2xl shadow-black/45 backdrop-blur-md sm:p-10"
              : warm
              ? cn("web-design-surface p-8 sm:p-10")
              : cn(
                  mmsGlassPanelDense,
                  "border-[#3f5a47]/14 p-8 shadow-[0_22px_55px_-32px_rgba(30,36,31,0.18)] sm:p-10",
                ),
          )}
        >
          <h2 className={cn(mmsH2, pricing ? "text-white" : warm ? wdFg : undefined)}>Keep your site growing</h2>
          <p
            className={cn(
              "mt-6 text-base leading-relaxed md:text-lg",
              pricing ? "text-white/90" : warm ? wdBody : mmsBodyFrost,
            )}
          >
            Most websites stay the same after they&apos;re built. Monthly support keeps the basics moving: small site
            improvements, local visibility touch-ups, and practical updates your customers can actually see.
          </p>
          <p
            className={cn(
              "mt-3 text-sm font-medium md:text-[15px]",
              pricing ? "text-white/85" : warm ? wdBody : mmsBodyFrost,
            )}
          >
            Monthly support starts at $45/mo. The $89/mo Local Growth Support plan is the best value for regular activity.
          </p>
          {pricing ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {supportPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl border border-white/12 bg-black/35 p-5 shadow-xl shadow-black/25",
                    plan.badge && "border-orange-200/45 bg-orange-300/12 ring-1 ring-orange-200/25",
                  )}
                >
                  {plan.badge ? (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-orange-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1d251f]">
                      {plan.badge}
                    </span>
                  ) : null}
                  <h3 className="text-lg font-bold tracking-tight text-white">{plan.name}</h3>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-orange-200">{plan.price}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/82">{plan.description}</p>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Includes</p>
                  <ul className="mt-3 flex-1 space-y-2.5 text-sm leading-relaxed text-white/88">
                    {plan.includes.map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <span className="font-bold text-orange-200" aria-hidden>
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : null}
          {!pricing ? (
            <>
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
            </>
          ) : null}
          <div className="mt-10">
            <PublicCtaRow>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: analyticsLocation, target: "contact", topic: "monthly_seo_pack" }}
                className={cn(
                  pricing ? mmsBtnPrimary : warm ? mmsBtnSecondaryOnGlass : mmsBtnSecondary,
                  "inline-flex min-h-[3rem] w-full justify-center px-8 no-underline hover:no-underline sm:w-auto",
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
