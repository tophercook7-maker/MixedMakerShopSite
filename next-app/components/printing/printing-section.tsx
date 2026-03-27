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
        "relative isolate py-20 md:py-28 lg:py-[8.5rem]",
        divider && "border-b border-white/[0.06]",
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
    <header className={cn("mb-10 md:mb-14 lg:mb-16", wrap, className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-orange-400/90 md:text-xs",
            align === "center" && "mx-auto max-w-max"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[1.95rem] md:text-4xl lg:text-[2.75rem] lg:leading-[1.08] [text-shadow:0_1px_40px_rgba(0,0,0,0.35)]">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-5 max-w-[44rem] text-base leading-[1.65] text-white/55 md:mt-6 md:text-[1.0625rem] md:leading-[1.7]",
            align === "center" ? "mx-auto" : ""
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
