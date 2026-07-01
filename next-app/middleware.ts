import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { AGENT_APPCAST_PATH, AGENT_DMG_PATH } from "@/lib/agent-gate-config";

const AGENT_API_PREFIX = "/api/agent/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Desktop Agent is unpublished — block downloads, appcast, and API entry points.
  if (pathname === AGENT_DMG_PATH || pathname === AGENT_APPCAST_PATH || pathname.startsWith(AGENT_API_PREFIX)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Existing Supabase auth session refresh for admin/auth routes.
  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/login",
    "/downloads/Autonomous-Desktop-Agent-1.0.0.dmg",
    "/downloads/autonomous-desktop-agent-appcast.json",
    "/api/agent/:path*",
  ],
};
