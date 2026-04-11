import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Consistent spacing for primary + secondary CTAs (never run together on wrap).
 */
export function PublicCtaRow({
  className,
  children,
  align = "start",
}: {
  className?: string;
  children: ReactNode;
  /** `center` for band-style final CTAs */
  align?: "start" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
        align === "center" ? "sm:items-center sm:justify-center" : "sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
