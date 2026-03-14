import type { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import { HeaderActions } from "@/components/admin/HeaderActions";
import { GlobalScoutJobProvider } from "@/components/admin/scout-job-provider";
import { ArrowRight, Plus } from "lucide-react";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const scoutBaseUrl = process.env.SCOUT_BRAIN_API_BASE_URL?.trim();
  const isScoutConfigured = Boolean(scoutBaseUrl);

  return (
    <GlobalScoutJobProvider>
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
          {!isScoutConfigured && (
            <div
              className="mx-7 mt-4 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "rgba(252, 165, 165, 0.5)",
                background: "rgba(127, 29, 29, 0.18)",
                color: "#fecaca",
              }}
            >
              Scout integration is not configured. Set{" "}
              <code>SCOUT_BRAIN_API_BASE_URL</code> in <code>next-app/.env.local</code>.
            </div>
          )}
          <main className="admin-main flex-1">{children}</main>
        </div>
      </div>
    </GlobalScoutJobProvider>
  );
}
