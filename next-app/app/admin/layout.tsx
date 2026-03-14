import type { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import { HeaderActions } from "@/components/admin/HeaderActions";
import { ArrowRight, Plus } from "lucide-react";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root min-h-screen md:grid md:grid-cols-[280px_1fr]">
      <aside className="admin-sidebar shrink-0">
        <Sidebar />
      </aside>
      <div className="min-w-0 flex flex-col">
        <header className="admin-header">
          <h1>MixedMakerShop Admin</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="admin-quick-actions">
              <Link href="/admin/leads">
                <Plus className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Add Lead
              </Link>
              <Link href="/admin/scout">
                <ArrowRight className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Scout Console
              </Link>
              <Link href="/admin/outreach">
                <ArrowRight className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Outreach Queue
              </Link>
            </div>
            <HeaderActions />
          </div>
        </header>
        <main className="admin-main flex-1">{children}</main>
      </div>
    </div>
  );
}
