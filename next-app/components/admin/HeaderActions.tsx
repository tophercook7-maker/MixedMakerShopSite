"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { ExternalLink, LogOut } from "lucide-react";

export function HeaderActions() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <div className="admin-header-actions">
      <Link href="/" target="_blank" rel="noopener">
        <ExternalLink className="inline h-4 w-4 mr-1.5 -mt-0.5 align-middle" />
        View site
      </Link>
      <button type="button" onClick={handleSignOut}>
        <LogOut className="inline h-4 w-4 mr-1.5 -mt-0.5 align-middle" />
        Sign out
      </button>
    </div>
  );
}
