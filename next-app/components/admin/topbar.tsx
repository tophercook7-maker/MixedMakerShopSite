"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export function Topbar() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Link href="/admin" className="font-semibold">
        MixedMakerShop Admin
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <Link href="/" target="_blank" rel="noopener" className="text-sm text-muted-foreground hover:text-foreground">
          View site
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
