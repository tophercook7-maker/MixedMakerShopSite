"use client";

import { Anchor, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicCaptainMakerHref } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const linkClass =
  "group flex w-full items-center gap-3 no-underline transition duration-300 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300/60";

export function CaptainMakerFloatingButton() {
  const pathname = usePathname();

  if (pathname === publicCaptainMakerHref) return null;

  return (
    <div
      className="captain-maker-float pointer-events-none fixed z-40 inset-x-0 bottom-0 md:inset-x-auto md:bottom-6 md:right-6 md:left-auto"
      aria-label="Captain Maker helper"
    >
      {/* Mobile — sticky bottom bar */}
      <div className="pointer-events-auto md:hidden">
        <TrackedPublicLink
          href={publicCaptainMakerHref}
          eventName="public_captain_maker_float_cta"
          eventProps={{ location: "floating_button", variant: "mobile_bar" }}
          className={cn(
            linkClass,
            "captain-maker-float__surface captain-maker-float__glow",
            "border-t border-orange-300/20 bg-[#07111f]/92 px-4 py-3 backdrop-blur-md",
            "shadow-[0_-10px_36px_rgba(0,0,0,0.42)]",
            "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3",
          )}
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-300/30 bg-orange-400/12 text-orange-200">
            <Anchor className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
              Not sure what you need?
            </span>
            <span className="block text-sm font-bold text-white">Ask Captain Maker</span>
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-orange-200 transition group-hover:translate-x-0.5"
            aria-hidden
          />
        </TrackedPublicLink>
      </div>

      {/* Desktop — bottom-right floating card */}
      <div className="pointer-events-auto hidden max-w-[17rem] md:block">
        <TrackedPublicLink
          href={publicCaptainMakerHref}
          eventName="public_captain_maker_float_cta"
          eventProps={{ location: "floating_button", variant: "desktop_card" }}
          className={cn(
            linkClass,
            "captain-maker-float__surface captain-maker-float__glow",
            "rounded-2xl border border-orange-300/25 bg-[#0b141c]/88 p-4 backdrop-blur-md",
            "shadow-[0_12px_40px_rgba(0,0,0,0.38)] hover:-translate-y-0.5 hover:border-orange-300/40",
          )}
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-300/30 bg-orange-400/12 text-orange-200">
            <Anchor className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Not sure what you need?
            </span>
            <span className="mt-0.5 block text-sm font-bold leading-snug text-white">Ask Captain Maker</span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-orange-200 transition group-hover:translate-x-0.5"
            aria-hidden
          />
        </TrackedPublicLink>
      </div>
    </div>
  );
}
