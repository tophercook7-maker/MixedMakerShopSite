import { cn } from "@/lib/utils";

export type PrintingSectionSurface = "dark" | "light";

export function PrintingSection({
  id,
  children,
  className,
  /** Softer divider between major bands */
  divider = true,
  surface = "dark",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  surface?: PrintingSectionSurface;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate py-20 md:py-28 lg:py-[8.5rem]",
        divider && (surface === "light" ? "border-b border-[#3f5a47]/12" : "border-b border-white/[0.06]"),
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
  surface = "dark",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  surface?: PrintingSectionSurface;
}) {
  const wrap = align === "center" ? "mx-auto text-center" : "text-left max-w-3xl";
  return (
    <header className={cn("mb-10 md:mb-14 lg:mb-16", wrap, className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-4 text-[11px] font-semibold uppercase tracking-[0.34em] md:text-xs",
            surface === "light" ? "text-[#8a4b2a]/85" : "text-orange-400/90",
            align === "center" && "mx-auto max-w-max"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[1.95rem] md:text-4xl lg:text-[2.75rem] lg:leading-[1.08]",
          surface === "light" ? "text-[#1e241f]" : "text-white [text-shadow:0_1px_40px_rgba(0,0,0,0.35)]"
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-5 max-w-[44rem] text-base leading-[1.65] md:mt-6 md:text-[1.0625rem] md:leading-[1.7]",
            surface === "light" ? "text-[#4a5750]" : "text-white/55",
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
  "inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[#c96a28] via-[#b85c1e] to-[#8a4b2a] px-8 text-[0.9375rem] font-semibold tracking-wide text-[#fffaf5] shadow-[0_4px_26px_rgba(184,92,30,0.38),inset_0_1px_0_rgba(255,255,255,0.2)] transition duration-200 hover:shadow-[0_8px_32px_rgba(47,62,52,0.22)] hover:brightness-[1.05] active:translate-y-px";

/** Secondary outline CTA */
export const printingSecondaryCtaClass =
  "inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl border border-white/[0.22] bg-white/[0.04] px-8 text-[0.9375rem] font-medium tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition duration-200 hover:border-[#6f8a73]/55 hover:bg-white/[0.09] hover:text-white";
