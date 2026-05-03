import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import { HeaderActions } from "@/components/admin/HeaderActions";
import { GlobalScoutJobProvider } from "@/components/admin/scout-job-provider";
import { getNewLeadCount } from "@/lib/crm/new-lead-count";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Plus } from "lucide-react";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  console.info("[Admin Bootstrap] admin shell render started");
  const scoutBaseUrl = process.env.SCOUT_BRAIN_API_BASE_URL?.trim();
  const isScoutConfigured = Boolean(scoutBaseUrl);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const newLeadCount = await getNewLeadCount(supabase, String(user?.id || ""));

  return (
    <GlobalScoutJobProvider>
      <div className="admin-root min-h-screen md:grid md:grid-cols-[280px_1fr]">
        <aside className="admin-sidebar shrink-0">
          <Sidebar newLeadCount={newLeadCount} />
        </aside>
        <div className="min-w-0 flex flex-col">
          <header className="admin-header">
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src="/m3-brand.png"
                alt=""
                width={40}
                height={40}
                className="rounded-xl shrink-0 border border-[rgba(201,97,44,0.35)] object-cover hidden sm:block"
              />
              <h1 className="truncate">MixedMakerShop Admin · M³</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="admin-quick-actions">
                <Link href="/admin/crm/web?add=1">
                  <Plus className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  Add business
                </Link>
                <Link href="/admin/scout">
                  <ArrowRight className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  Find businesses
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
