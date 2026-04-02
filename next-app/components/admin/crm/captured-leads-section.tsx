"use client";

import { LeadsListReturnLink } from "@/components/admin/crm/leads-list-return-link";
import { buildLeadPath } from "@/lib/lead-route";
import type { CapturedLeadListItem } from "@/lib/crm/captured-leads";

type Props = {
  items: CapturedLeadListItem[];
  /** Shown when `items` is empty because a parent filter removed captured rows (e.g. targeting mode). */
  filteredEmptyMessage?: string;
};

function badgeClass(badge: CapturedLeadListItem["badge"]): string {
  if (badge === "Extension") return "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";
  if (badge === "Facebook") return "bg-blue-500/20 text-blue-200 border-blue-400/40";
  return "bg-amber-500/15 text-amber-100 border-amber-400/35";
}

export function CapturedLeadsSection({ items, filteredEmptyMessage }: Props) {
  return (
    <section
      className="rounded-xl border-2 p-4 space-y-3 shadow-[0_0_24px_rgba(201,97,44,0.12)]"
      style={{ borderColor: "rgba(201, 97, 44, 0.45)", background: "rgba(0,0,0,0.22)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--admin-fg)" }}>
          🔥 Captured Leads
        </h2>
        <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
          Extension · Facebook · strong opportunities
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm py-2" style={{ color: "var(--admin-muted)" }}>
          {filteredEmptyMessage ?? "No captured leads yet — use the extension to save businesses"}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {items.map((item) => {
            const openHref = buildLeadPath(item.id, item.business_name);
            const contactHref = `${openHref}?focus=outreach`;
            return (
              <li
                key={item.id}
                className="rounded-lg border p-3 flex flex-col gap-2 min-h-[120px]"
                style={{ borderColor: "rgba(201, 97, 44, 0.28)", background: "rgba(0,0,0,0.35)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-tight line-clamp-2" style={{ color: "var(--admin-fg)" }}>
                    {item.business_name}
                  </p>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${badgeClass(item.badge)}`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs line-clamp-3 flex-1 leading-snug" style={{ color: "var(--admin-muted)" }}>
                  {item.summary}
                </p>
                {item.conversion_score != null ? (
                  <p className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
                    Score {item.conversion_score}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1 mt-auto">
                  <LeadsListReturnLink href={openHref} className="admin-btn-ghost text-xs px-3 py-1.5">
                    Open
                  </LeadsListReturnLink>
                  <LeadsListReturnLink href={contactHref} className="admin-btn-primary text-xs px-3 py-1.5">
                    Contact
                  </LeadsListReturnLink>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
