import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsBtnSecondaryOnGlass,
  mmsH2,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const MMS_LOCAL_TECH_POSITIONING =
  "Local tech help since 2000 — now offering in-home computer repair, web design, AI help, local business support, and custom 3D printing.";

type MmsComebackStorySectionProps = {
  variant?: "glass" | "about";
  id?: string;
  className?: string;
};

export function MmsComebackStorySection({
  variant = "glass",
  id = "comeback-story",
  className,
}: MmsComebackStorySectionProps) {
  const isGlass = variant === "glass";

  const headingClass = isGlass ? mmsH2OnGlass : mmsH2;
  const bodySecondary = isGlass ? mmsOnGlassSecondary : "text-[#354239]";
  const bodyClass = cn("text-base leading-relaxed md:text-lg", bodySecondary);
  const secondaryBtn = isGlass ? mmsBtnSecondaryOnGlass : mmsBtnSecondary;

  const inner = (
    <>
      {isGlass ? (
        <p className={mmsSectionEyebrowOnGlass}>Our story</p>
      ) : (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a6a62]">Our story</p>
      )}
      <h2 className={cn(headingClass, isGlass ? "mt-4" : "mt-3")}>
        From Cook&apos;s Computer Service to MixedMakerShop
      </h2>
      <div className={cn("mt-6 space-y-5", !isGlass && "md:space-y-6")}>
        <p className={bodyClass}>
          Before MixedMakerShop, I ran Cook&apos;s Computer Service and helped people around the Hot Springs area with
          in-home computer repair, setup, troubleshooting, upgrades, Wi-Fi issues, and everyday tech problems from{" "}
          <strong className={isGlass ? "text-white" : "text-[#1e2822]"}>2000 to 2014</strong>.
        </p>
        <p className={bodyClass}>
          In 2014, multiple sclerosis forced me to step back for a season. It took me down for a while, but it did not
          take away the builder in me. Over time, I rebuilt, learned new tools, and kept finding ways to solve real
          problems with technology.
        </p>
        <p className={cn(bodyClass, isGlass ? mmsOnGlassPrimary : "font-medium text-[#2a3830]")}>
          Now I&apos;m coming back through MixedMakerShop with a bigger toolbox.
        </p>
        <p className={bodyClass}>
          Today, MixedMakerShop brings together in-home computer repair, remote tech support, web design, AI tools,
          local business marketing help, 3D printing, and custom digital solutions under one roof.
        </p>
        <p className={bodyClass}>
          I still offer in-home computer repair and tech help in Hot Springs, Benton, Hot Springs Village, Lake
          Hamilton, Fountain Lake, and nearby areas. If you&apos;re farther away, some services may be available
          remotely depending on the issue.
        </p>
        <p className={bodyClass}>
          Whether you need a slow computer fixed, a better website, help understanding AI, or a custom solution for your
          home or business, you&apos;re working with someone who has been solving local technology problems since{" "}
          <strong className={isGlass ? "text-white" : "text-[#1e2822]"}>2000</strong>.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TrackedPublicLink
          href="/contact"
          eventName="public_contact_cta_click"
          eventProps={{ location: id, target: "tech_help" }}
          className={cn(
            mmsBtnPrimary,
            "inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 no-underline hover:no-underline sm:w-auto",
          )}
        >
          Get Tech Help
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </TrackedPublicLink>
        <TrackedPublicLink
          href={publicFreeMockupFunnelHref}
          eventName="public_contact_cta_click"
          eventProps={{ location: id, target: "free_mockup" }}
          className={cn(
            secondaryBtn,
            "inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 no-underline hover:no-underline sm:w-auto",
          )}
        >
          Request a Free Website Mockup
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </TrackedPublicLink>
        <Link
          href="/builds"
          className={cn(
            secondaryBtn,
            "inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 no-underline hover:no-underline sm:w-auto",
          )}
        >
          See What We Build
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </div>
      {!isGlass ? (
        <p className="mt-6 text-sm leading-relaxed text-[#5a6a62]">
          Read the full story on the{" "}
          <Link href="/blog/mixed-maker-shop-comeback" className="font-semibold text-[#3f5a47] underline-offset-2 hover:underline">
            Mixed Maker Shop comeback blog post
          </Link>
          .
        </p>
      ) : (
        <p className={cn("mt-6 text-sm leading-relaxed", mmsOnGlassSecondary)}>
          Want the longer version?{" "}
          <Link href="/blog/mixed-maker-shop-comeback" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
            Read the full comeback story
          </Link>
          .
        </p>
      )}
    </>
  );

  if (isGlass) {
    return (
      <section id={id} className={className} aria-labelledby={`${id}-heading`}>
        <div className="public-glass-box public-glass-box--pad max-w-3xl">
          <div id={`${id}-heading`} className="sr-only">
            From Cook&apos;s Computer Service to MixedMakerShop
          </div>
          {inner}
        </div>
      </section>
    );
  }

  return <div className={className}>{inner}</div>;
}
