"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  focusOutreach: boolean;
  children: ReactNode;
};

/**
 * When opening a lead with `?focus=outreach`, scrolls the outreach/email workspace into view.
 */
export function LeadWorkspaceScrollAnchor({ focusOutreach, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusOutreach || !ref.current) return;
    const t = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [focusOutreach]);

  return (
    <div id="lead-workspace-outreach" ref={ref} className="scroll-mt-4">
      {children}
    </div>
  );
}
