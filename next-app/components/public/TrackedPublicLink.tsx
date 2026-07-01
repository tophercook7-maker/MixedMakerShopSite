"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link, { type LinkProps } from "next/link";
import type { PublicAnalyticsProps } from "@/lib/public-analytics";
import { trackPublicEvent } from "@/lib/public-analytics";
import { pushHashToHistory, scrollToHashTarget } from "@/lib/scroll-to-hash";

type TrackedPublicLinkProps = ComponentProps<typeof Link> & {
  eventName: string;
  eventProps?: PublicAnalyticsProps;
};

function hrefString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (typeof href === "object" && href !== null && "pathname" in href) {
    const p = (href as { pathname?: string }).pathname ?? "";
    const hash = "hash" in href && typeof (href as { hash?: string }).hash === "string" ? (href as { hash: string }).hash : "";
    return `${p}${hash}`;
  }
  return "";
}

function hashFromHref(href: LinkProps["href"]): string | null {
  const hrefStr = hrefString(href);
  const hashIndex = hrefStr.indexOf("#");
  if (hashIndex === -1) return null;
  return hrefStr.slice(hashIndex);
}

function pathnameFromHref(href: LinkProps["href"]): string {
  const hrefStr = hrefString(href);
  const hashIndex = hrefStr.indexOf("#");
  const path = hashIndex === -1 ? hrefStr : hrefStr.slice(0, hashIndex);
  return path || window.location.pathname;
}

function handleHashScroll(href: LinkProps["href"], e: MouseEvent<HTMLAnchorElement>) {
  const hash = hashFromHref(href);
  if (!hash) return false;

  const targetPath = pathnameFromHref(href);
  const onSamePage = !targetPath || targetPath === window.location.pathname;

  if (onSamePage) {
    e.preventDefault();
    if (scrollToHashTarget(hash)) {
      pushHashToHistory(hash);
    }
    return true;
  }

  return false;
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
  const hash = hashFromHref(href);

  if (hash && (hrefStr === hash || hrefStr.startsWith("#"))) {
    return (
      <a
        href={hash}
        {...rest}
        onClick={(e) => {
          e.preventDefault();
          scrollToHashTarget(hash);
          pushHashToHistory(hash);
          trackPublicEvent(eventName, { href: hrefStr, ...eventProps });
          onClick?.(e);
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        handleHashScroll(href, e);
        trackPublicEvent(eventName, { href: hrefStr, ...eventProps });
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
