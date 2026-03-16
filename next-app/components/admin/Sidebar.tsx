"use client";

import { usePathname } from "next/navigation";
import { Building, CalendarDays, Crosshair, FolderKanban, LayoutDashboard, Send, Settings, StickyNote, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/crm", label: "CRM", icon: Building },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/cases", label: "Cases", icon: FolderKanban },
  { href: "/admin/outreach", label: "Outreach", icon: Send },
  { href: "/admin/scout", label: "Scout", icon: Crosshair },
  { href: "/admin/notes", label: "Notes", icon: StickyNote },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="admin-brand-wrap">
        <span className="admin-brand">MixedMaker Admin</span>
        <span className="admin-brand-tagline">Command Center</span>
      </div>
      <nav>
        {links.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            onClick={() => {
              console.info("[Admin Click] sidebar link fired", { label, href });
            }}
            data-active={pathname === href || (href !== "/admin" && pathname.startsWith(href))}
          >
            <Icon className="admin-nav-icon h-4 w-4 shrink-0" />
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}
