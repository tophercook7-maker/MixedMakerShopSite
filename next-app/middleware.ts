import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { verifyTokenEdge } from "@/lib/agent-gate-edge";
import { AGENT_COOKIE, AGENT_DMG_PATH } from "@/lib/agent-gate-config";

export async function middleware(request: NextRequest) {
  // Paywall: the Autonomous Desktop Agent DMG is a static file, but we require a
  // valid signed unlock cookie (set after a verified Stripe payment) before it
  // can be downloaded. Without it, bounce to the purchase page.
  if (request.nextUrl.pathname === AGENT_DMG_PATH) {
    const token = request.cookies.get(AGENT_COOKIE)?.value;
    if (await verifyTokenEdge(token)) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Existing Supabase auth session refresh for admin/auth routes.
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/auth/login", "/downloads/Autonomous-Desktop-Agent-1.0.0.dmg"],
};
