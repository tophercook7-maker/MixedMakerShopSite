"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackPublicEvent } from "@/lib/public-analytics";
import { cn } from "@/lib/utils";

type TrackedDownloadLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "onClick"> & {
  slug: string;
  title: string;
  /** Where the click originated (e.g. resource_detail, resources_index). */
  surface: string;
  href: string;
  /** When false, renders a non-link status line — no broken hrefs. */
  downloadPublished: boolean;
};

export function TrackedDownloadLink({
  slug,
  title,
  surface,
  href,
  downloadPublished,
  className,
  children,
  ...rest
}: TrackedDownloadLinkProps) {
  if (!downloadPublished) {
    return (
      <span
        className={cn(
          "inline-flex cursor-not-allowed items-center rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/55",
          className,
        )}
        aria-disabled="true"
        title="PDF not published yet — request below and it’s delivered after confirmation."
      >
        {children ?? "Download available when published"}
      </span>
    );
  }

  return (
    <a
      href={href}
      download={href.split("/").pop()}
      className={cn(
        "inline-flex items-center rounded-xl border border-orange-300/35 bg-orange-500/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-300/50 hover:bg-orange-500/25",
        className,
      )}
      {...rest}
      onClick={() => {
        trackPublicEvent("resource_download", { slug, title, surface });
      }}
    >
      {children ?? "Download PDF"}
    </a>
  );
}
