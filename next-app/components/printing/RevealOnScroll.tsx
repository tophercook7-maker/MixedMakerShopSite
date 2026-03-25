"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay after element is visible (ms), for staggered grids */
  delayMs?: number;
};

/**
 * Fades and lifts content once when it enters the viewport.
 * Respects prefers-reduced-motion (no animation, content stays visible).
 */
export function RevealOnScroll({ children, className, delayMs = 0 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduceMotion(reduce);
    if (reduce) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const vh = window.innerHeight;
    const { top, height } = el.getBoundingClientRect();
    if (top < vh * 0.9 && top + height * 0.15 > 0) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion || visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion, visible]);

  return (
    <div
      ref={ref}
      className={cn(
        !reduceMotion && "transition-[opacity,transform] duration-[780ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0",
        className,
      )}
      style={
        reduceMotion || !visible
          ? undefined
          : {
              transitionDelay: `${delayMs}ms`,
            }
      }
    >
      {children}
    </div>
  );
}
