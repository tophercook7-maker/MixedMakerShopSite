import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-r border-neutral-200">
        <Sidebar />
      </aside>
      <section className="min-w-0">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h1 className="text-xl font-semibold">MixedMakerShop Admin</h1>
        </div>
        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
