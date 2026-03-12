"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, FolderKanban, CheckSquare, DollarSign, Settings } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/clients", label: "Clients", icon: UserCheck },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
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
          <Link
            key={href}
            href={href}
            data-active={pathname === href || (href !== "/admin" && pathname.startsWith(href))}
          >
            <Icon className="admin-nav-icon h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
