import type { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="admin-sidebar">
        <Sidebar />
      </aside>
      <div className="min-w-0 flex flex-col">
        <header className="admin-header">
          <h1>MixedMakerShop Admin</h1>
          <div className="admin-quick-actions">
            <Link href="/admin/leads">Add Lead</Link>
            <Link href="/admin/tasks">Add Task</Link>
            <Link href="/admin/payments">Add Payment</Link>
          </div>
        </header>
        <main className="admin-main flex-1">{children}</main>
      </div>
    </div>
  );
}
