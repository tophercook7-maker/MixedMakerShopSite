import { cn } from "@/lib/utils";

export function PrintingSection({
  id,
  children,
  className,
  /** Softer divider between major bands */
  divider = true,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate py-[4.5rem] md:py-[6.5rem] lg:py-[7.5rem]",
        divider && "border-b border-white/[0.07]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PrintingSectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const wrap = align === "center" ? "mx-auto text-center" : "text-left max-w-3xl";
  return (
    <header className={cn("mb-12 md:mb-16", wrap, className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-400/95 md:text-xs",
            align === "center" && "mx-auto max-w-max"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-[1.65rem] font-bold leading-[1.15] tracking-[-0.03em] text-white sm:text-3xl md:text-[2.125rem] lg:text-[2.375rem]">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-[0.9375rem] leading-relaxed text-white/55 md:text-base md:leading-[1.65]",
            align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

/** Primary action — high contrast, tactile */
export const printingPrimaryCtaClass =
  "inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 via-orange-500 to-orange-600 px-8 text-[0.9375rem] font-semibold tracking-wide text-neutral-950 shadow-[0_4px_28px_rgba(249,115,22,0.42),inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 hover:shadow-[0_8px_36px_rgba(249,115,22,0.5)] hover:brightness-[1.03] active:translate-y-px";

/** Secondary outline CTA */
export const printingSecondaryCtaClass =
  "inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl border border-white/[0.22] bg-white/[0.04] px-8 text-[0.9375rem] font-medium tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition duration-200 hover:border-emerald-400/50 hover:bg-white/[0.09] hover:text-white";
