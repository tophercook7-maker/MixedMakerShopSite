import { cn } from "@/lib/utils";

type ExampleCardImageOverlayProps = {
  className?: string;
};

/**
 * Soft bottom fade on example / showcase thumbnails so busy screenshots taper off
 * before badges and titles, without washing out the whole image.
 */
export function ExampleCardImageOverlay({ className }: ExampleCardImageOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(11rem,48%)]",
        "bg-gradient-to-t from-[#0a0f0d]/[0.5] via-[#0a0f0d]/[0.14] to-transparent",
        className,
      )}
      aria-hidden
    />
  );
}
