"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FILTER_OPTIONS } from "@/lib/worldWatch/labels";
import type { WorldWatchFilterKey } from "@/lib/worldWatch/types";
import { cn } from "@/lib/utils";

function parseFilter(v: string | null): WorldWatchFilterKey {
  if (
    v === "biblical_insight" ||
    v === "global_awareness" ||
    v === "prophecy_watch" ||
    v === "all"
  ) {
    return v;
  }
  return "all";
}

export function WorldWatchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = useMemo(
    () => parseFilter(searchParams.get("cat")),
    [searchParams]
  );

  const setCat = useCallback(
    (key: WorldWatchFilterKey) => {
      const next = new URLSearchParams(searchParams.toString());
      if (key === "all") next.delete("cat");
      else next.set("cat", key);
      const q = next.toString();
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <nav aria-label="World Watch categories" className="mb-10">
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {FILTER_OPTIONS.map(({ key, label }) => {
          const isSelected = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCat(key)}
              className={cn(
                "min-h-[44px] rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a10]",
                isSelected
                  ? "border-teal-400/35 bg-teal-400/10 text-teal-100 shadow-[0_0_0_1px_rgba(45,212,191,0.12)]"
                  : "border-white/10 bg-slate-950/80 text-slate-400 hover:border-white/15 hover:bg-white/[0.04] hover:text-slate-300"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
