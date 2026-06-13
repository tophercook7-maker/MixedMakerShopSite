"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { PartnerResourceEntry } from "@/lib/partners/registry";
import { partnerResourcePath } from "@/lib/partners/registry";
import { trackPublicEvent } from "@/lib/public-analytics";
import {
  mmsBtnPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export function PartnerResourceCard({ partner }: { partner: PartnerResourceEntry }) {
  const pageHref = partnerResourcePath(partner.slug);

  return (
    <article className="public-glass-box--soft public-glass-box--pad flex h-full flex-col border border-white/[0.08]">
      <p className={cn(mmsSectionEyebrowOnGlass, "!text-[10px] !tracking-[0.14em]")}>Partner resource</p>
      <h3 className="mt-3 text-lg font-bold tracking-tight text-white">
        <Link href={pageHref} className="text-white no-underline hover:text-[#f0c49a] hover:no-underline">
          {partner.title}
        </Link>
      </h3>
      <p className={cn("mt-3 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
        {partner.description}
      </p>
      <p className={cn("mt-4 text-xs leading-relaxed text-white/55")}>
        <span className="font-semibold text-white/75">Best for:</span> {partner.whoItHelps}
      </p>
      <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5">
        <Link
          href={pageHref}
          className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-2 text-sm font-semibold")}
        >
          View details
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function PartnerOutboundLink({
  partner,
  location,
  className,
}: {
  partner: PartnerResourceEntry;
  location: string;
  className?: string;
}) {
  return (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={cn(
        mmsBtnPrimary,
        "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm no-underline hover:no-underline",
        className,
      )}
      onClick={() =>
        trackPublicEvent("public_partner_resource_click", {
          partner_id: partner.id,
          href: partner.href,
          location,
        })
      }
    >
      {partner.buttonText}
      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
    </a>
  );
}
