"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mail, MessageSquare, Phone, Sparkles } from "lucide-react";
import type { InboxCategory, InboxItem } from "@/lib/crm/inbox-queue";
import { filterInboxByCategory, inboxCategoryCounts } from "@/lib/crm/inbox-queue";

type Props = {
  items: InboxItem[];
  mockupHrefByLeadId?: Record<string, string>;
};

const TABS: { id: InboxCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reply", label: "Replies" },
  { id: "new", label: "New" },
  { id: "follow_up", label: "Follow-ups" },
  { id: "mockup", label: "Mockups" },
];

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : `tel:${phone.trim()}`;
}

function smsHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `sms:${digits}` : `sms:${phone.trim()}`;
}

function categoryBadge(category: InboxCategory): { label: string; className: string } {
  switch (category) {
    case "reply":
      return { label: "Reply", className: "bg-red-600/90 text-white" };
    case "new":
      return { label: "New", className: "bg-emerald-600/80 text-white" };
    case "follow_up":
      return { label: "Follow-up", className: "bg-amber-500/90 text-black" };
    case "mockup":
      return { label: "Mockup", className: "bg-[rgba(201,97,44,0.85)] text-white" };
  }
}

function enrichItem(item: InboxItem, mockupHrefByLeadId: Record<string, string>): InboxItem {
  if (item.kind !== "lead") return item;
  const mockupHref = mockupHrefByLeadId[item.id] || item.mockupHref;
  if (!mockupHref) return item;
  const answerHref =
    item.category === "reply"
      ? `${item.openHref}?generate=1`
      : item.category === "mockup"
        ? mockupHref
        : item.answerHref;
  return { ...item, mockupHref, answerHref };
}

function InboxCard({ item }: { item: InboxItem }) {
  const badge = categoryBadge(item.category);
  const { email, phone } = item.contact;
  const isReply = item.category === "reply";

  return (
    <li
      className="rounded-xl border p-4 space-y-3 transition hover:border-[rgba(201,97,44,0.45)]"
      style={{
        borderColor: isReply ? "rgba(220, 38, 38, 0.45)" : "var(--admin-border)",
        background: isReply ? "rgba(127, 29, 29, 0.12)" : "rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={item.openHref} className="text-lg font-bold truncate hover:underline" style={{ color: "var(--admin-fg)" }}>
              {item.title}
            </Link>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
            {item.kind === "mockup" ? (
              <span className="text-[10px] uppercase tracking-wide opacity-70" style={{ color: "var(--admin-muted)" }}>
                Submission
              </span>
            ) : null}
          </div>
          {item.subtitle ? (
            <p className="text-sm mt-0.5 truncate" style={{ color: "var(--admin-muted)" }}>
              {item.subtitle}
            </p>
          ) : null}
          <p className="text-sm mt-1 font-medium" style={{ color: isReply ? "#fecaca" : "var(--admin-gold)" }}>
            {item.reason}
          </p>
        </div>
        {item.createdAt ? (
          <time className="text-[11px] shrink-0 tabular-nums" style={{ color: "var(--admin-muted)" }} dateTime={item.createdAt}>
            {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </time>
        ) : null}
      </div>

      {item.preview ? (
        <p className="text-sm rounded-lg border px-3 py-2 line-clamp-3" style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}>
          &ldquo;{item.preview}&rdquo;
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {phone ? (
          <a href={telHref(phone)} className="admin-btn-primary text-sm inline-flex items-center gap-1.5 min-h-[40px] px-4">
            <Phone className="h-4 w-4 shrink-0" />
            Call
          </a>
        ) : null}
        {phone ? (
          <a href={smsHref(phone)} className="admin-btn-ghost text-sm inline-flex items-center gap-1.5 min-h-[40px] px-4 border border-[var(--admin-border)]">
            <MessageSquare className="h-4 w-4 shrink-0" />
            Text
          </a>
        ) : null}
        {email ? (
          <a
            href={`mailto:${encodeURIComponent(email)}`}
            className="admin-btn-ghost text-sm inline-flex items-center gap-1.5 min-h-[40px] px-4 border border-[var(--admin-border)]"
          >
            <Mail className="h-4 w-4 shrink-0" />
            Email
          </a>
        ) : null}
        <Link
          href={item.answerHref}
          className={`text-sm inline-flex items-center gap-1.5 min-h-[40px] px-4 font-semibold rounded-lg ${
            isReply ? "admin-btn-primary" : "admin-btn-ghost border border-[var(--admin-border)]"
          }`}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          {isReply ? "Answer" : item.kind === "mockup" ? "Open mockup" : "Reach out"}
        </Link>
        <Link href={item.openHref} className="admin-btn-ghost text-sm min-h-[40px] px-4 border border-[var(--admin-border)]">
          Open
        </Link>
        {item.mockupHref && item.mockupHref !== item.openHref ? (
          <Link href={item.mockupHref} className="admin-btn-ghost text-xs min-h-[40px] px-3 border border-[var(--admin-border)]">
            Mockup tools
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export function InboxWorkspace({ items, mockupHrefByLeadId = {} }: Props) {
  const [tab, setTab] = useState<InboxCategory | "all">("all");

  const enriched = useMemo(
    () => items.map((i) => enrichItem(i, mockupHrefByLeadId)),
    [items, mockupHrefByLeadId]
  );

  const counts = useMemo(() => inboxCategoryCounts(enriched), [enriched]);
  const visible = useMemo(() => filterInboxByCategory(enriched, tab), [enriched, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Inbox
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--admin-muted)" }}>
            Everything that needs you — replies first, then new leads and follow-ups. One tap to call, text, or answer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/admin/scout" className="admin-btn-ghost border border-[var(--admin-border)]">
            Find businesses
          </Link>
          <Link href="/admin/crm/web" className="admin-btn-ghost border border-[var(--admin-border)]">
            All leads
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => {
          const count = counts[t.id];
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                active
                  ? "border-[rgba(201,97,44,0.55)] text-[var(--admin-gold)] bg-[rgba(201,97,44,0.12)]"
                  : "border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-white/5"
              }`}
            >
              {t.label}
              {count > 0 ? <span className="ml-1.5 tabular-nums opacity-80">({count})</span> : null}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <section className="admin-card space-y-3 text-sm" style={{ color: "var(--admin-muted)" }}>
          <p className="font-medium text-base" style={{ color: "var(--admin-fg)" }}>
            {tab === "all" ? "You're caught up." : `No ${TABS.find((t) => t.id === tab)?.label?.toLowerCase() ?? "items"} right now.`}
          </p>
          <p>
            {tab === "reply"
              ? "When someone replies, they'll show up here first."
              : "Add businesses from Scout or wait for the next free mockup request."}
          </p>
          <Link href="/admin/scout" className="admin-btn-primary text-sm inline-block">
            Find businesses
          </Link>
        </section>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <InboxCard key={item.key} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
