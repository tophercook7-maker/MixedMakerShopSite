"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

export const CRM_LEADS_RETURN_STORAGE_KEY = "crm.leadsListReturn";

export function saveLeadsListReturnContext() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CRM_LEADS_RETURN_STORAGE_KEY, `${window.location.pathname}${window.location.search}`);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Only the list route (`/admin/leads` + query), not a lead workspace path. */
export function isStoredLeadsListHref(raw: string): boolean {
  const path = raw.split("?")[0].split("#")[0];
  return path === "/admin/leads" || path === "/admin/crm/web" || path === "/admin/crm/print";
}

type Props = ComponentPropsWithoutRef<typeof Link> & {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function LeadsListReturnLink({ children, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        saveLeadsListReturnContext();
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
