import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";

type Variant = "primary" | "outline";

export function PrintingScrollToQuoteCta({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}) {
  return (
    <a
      href={printingQuoteHref()}
      className={cn(
        variant === "primary" ? printingPrimaryCtaClass : printingSecondaryCtaClass,
        "inline-flex min-h-[2.875rem] items-center justify-center rounded-xl px-6 py-2.5 text-center text-[0.875rem] font-semibold tracking-wide sm:min-h-[3rem] sm:px-8 sm:text-[0.9rem]",
        className,
      )}
    >
      {children}
    </a>
  );
}
