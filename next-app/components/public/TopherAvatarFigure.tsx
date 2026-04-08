"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Illustrated avatar — place file at `public/images/topher-avatar.png` (or `.jpeg`; PNG is used for lossless art). */
const DEFAULT_SRC = "/images/topher-avatar.png";

type TopherAvatarFigureProps = {
  className?: string;
  priority?: boolean;
  src?: string;
};

/**
 * Illustrated Topher avatar when `public/images/topher-avatar.png` exists;
 * otherwise a quiet placeholder so the layout stays stable.
 */
export function TopherAvatarFigure({
  className,
  priority = false,
  src = DEFAULT_SRC,
}: TopherAvatarFigureProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <figure
        className={cn(
          "relative flex aspect-[4/5] w-full max-w-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/90 p-6 text-center shadow-sm",
          className,
        )}
      >
        <figcaption className="text-sm font-medium text-slate-500">
          Topher avatar — add <span className="font-mono text-xs text-slate-600">{DEFAULT_SRC}</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className={cn("relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/8", className)}>
      <Image
        src={src}
        alt="Illustrated avatar of Topher from MixedMakerShop"
        fill
        className="object-cover object-[center_24%]"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 38vw, 320px"
        priority={priority}
        onError={() => setFailed(true)}
      />
    </figure>
  );
}
