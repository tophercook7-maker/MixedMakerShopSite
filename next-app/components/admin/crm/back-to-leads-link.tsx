"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CRM_LEADS_RETURN_STORAGE_KEY, isStoredLeadsListHref } from "@/components/admin/crm/leads-list-return-link";

export function BackToLeadsLink({ className }: { className?: string }) {
  const [href, setHref] = useState("/admin/leads");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CRM_LEADS_RETURN_STORAGE_KEY);
      if (raw && raw.startsWith("/admin/leads") && isStoredLeadsListHref(raw)) {
        setHref(raw);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <Link href={href} className={className}>
      ← Back to Leads
    </Link>
  );
}
