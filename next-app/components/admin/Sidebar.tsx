"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookmarkPlus,
  CalendarDays,
  Crosshair,
  FileText,
  MessageSquare,
  Send,
  Settings,
  StickyNote,
  Sun,
  Users,
} from "lucide-react";

const links = [
  { href: "/admin/today", label: "Today", icon: Sun },
  { href: "/admin/crm/web", label: "Web CRM", icon: Users, title: "Web design leads" },
  { href: "/admin/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/admin/scout", label: "Find businesses", icon: Crosshair, title: "Scout — discover local businesses" },
  { href: "/admin/outreach", label: "Outreach", icon: Send },
  { href: "/admin/proposals", label: "Proposals", icon: FileText },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/notes", label: "Notes", icon: StickyNote },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function linkActive(pathname: string, href: string): boolean {
  if (href === "/admin/today") {
    return pathname === "/admin/today" || pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ count }: { count: number }) {
  return <span className="admin-count-badge ml-auto">{count > 99 ? "99+" : Math.max(0, count)}</span>;
}

export default function Sidebar({ newLeadCount = 0 }: { newLeadCount?: number }) {
  const pathname = usePathname();

  return (
    <>
      <div className="admin-brand-wrap">
        <Image
          src="/m3-brand.png"
          alt=""
          width={40}
          height={40}
          className="rounded-xl mb-2 border border-[rgba(201,97,44,0.35)] object-cover shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          priority
        />
        <span className="admin-brand">M³ Massive Brain</span>
        <span className="admin-brand-tagline">MixedMaker CRM</span>
      </div>
      <nav>
        {links.map(({ href, label, icon: Icon, title }) => (
          <a
            key={href}
            href={href}
            title={title}
            onClick={() => {
              console.info("[Admin Click] sidebar link fired", { label, href });
            }}
            data-active={linkActive(pathname, href)}
          >
            <Icon className="admin-nav-icon h-4 w-4 shrink-0" />
            <span>{label}</span>
            {href === "/admin/crm/web" ? <CountBadge count={newLeadCount} /> : null}
          </a>
        ))}
      </nav>
      <div className="mt-6 px-3 text-[11px] leading-relaxed" style={{ color: "var(--admin-muted)" }}>
        <p className="mb-2">More tools</p>
        <a
          href="/admin/tools/quick-add"
          className="flex items-center gap-1.5 py-1 hover:text-[var(--admin-gold)]"
        >
          <BookmarkPlus className="h-3.5 w-3.5 shrink-0" />
          Quick add (bookmark)
        </a>
        <a href="/admin/cases" className="block py-1 hover:text-[var(--admin-gold)]">
          Cases
        </a>
        <a href="/admin/clients" className="block py-1 hover:text-[var(--admin-gold)]">
          Clients
        </a>
        <a href="/admin/print-dashboard" className="block py-1 hover:text-[var(--admin-gold)]">
          3D print dashboard
        </a>
        <a href="/admin/crm/print" className="block py-1 hover:text-[var(--admin-gold)]">
          3D print CRM
        </a>
        <a href="/admin/crm/new-leads" className="flex items-center gap-2 py-1 hover:text-[var(--admin-gold)]">
          <span>New lead inbox</span>
          <CountBadge count={newLeadCount} />
        </a>
        <a href="/admin/crm/web?pool=top_picks" className="block py-1 hover:text-[var(--admin-gold)]">
          Top Picks
        </a>
        <a href="/admin/crm/hub" className="block py-1 hover:text-[var(--admin-gold)]">
          CRM hub
        </a>
        <a href="/admin/crm/projects" className="block py-1 hover:text-[var(--admin-gold)]">
          CRM projects
        </a>
        <a href="/admin/scout/review" className="block py-1 hover:text-[var(--admin-gold)]">
          Scout review queue
        </a>
        <a href="/admin/mockup-submissions" className="block py-1 hover:text-[var(--admin-gold)]">
          Free mockup inbox
        </a>
      </div>
    </>
  );
}
