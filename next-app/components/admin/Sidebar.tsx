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
  { href: "/admin/leads", label: "Leads", icon: Users, title: "Businesses you saved" },
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="admin-brand-wrap">
        <Image
          src="/m3-brand.png"
          alt=""
          width={40}
          height={40}
          className="rounded-xl mb-2 border border-[rgba(212,175,55,0.35)] object-cover shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
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
            {label}
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
        <a href="/admin/crm" className="block py-1 hover:text-[var(--admin-gold)]">
          Legacy CRM
        </a>
      </div>
    </>
  );
}
