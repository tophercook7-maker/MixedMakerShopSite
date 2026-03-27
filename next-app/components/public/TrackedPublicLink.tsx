"use client";

import type { ComponentProps } from "react";
import Link, { type LinkProps } from "next/link";
import type { PublicAnalyticsProps } from "@/lib/public-analytics";
import { trackPublicEvent } from "@/lib/public-analytics";

type TrackedPublicLinkProps = ComponentProps<typeof Link> & {
  eventName: string;
  eventProps?: PublicAnalyticsProps;
};

function hrefString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (typeof href === "object" && href !== null && "pathname" in href) {
    const p = (href as { pathname?: string }).pathname ?? "";
    return p;
  }
  return "";
}

export function TrackedPublicLink({
  eventName,
  eventProps,
  onClick,
  href,
  children,
  ...rest
}: TrackedPublicLinkProps) {
  const hrefStr = hrefString(href);

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        trackPublicEvent(eventName, { href: hrefStr, ...eventProps });
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
