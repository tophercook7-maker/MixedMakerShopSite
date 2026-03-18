import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAuthPage = path.startsWith("/auth");

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  let user: { id?: string | null } | null = null;
  try {
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();
    user = sessionUser;
  } catch (error) {
    // Invalid refresh tokens can throw; treat as signed out and clear stale auth cookies.
    console.warn("[Auth Middleware] supabase getUser failed", {
      path,
      error: error instanceof Error ? error.message : "unknown",
    });
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    }
  }

  if (isAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(url);
  }
  if (isAuthPage && user && path === "/auth/login") {
    const redirect =
      request.nextUrl.searchParams.get("redirectedFrom") ||
      request.nextUrl.searchParams.get("redirect") ||
      "/admin";
    return NextResponse.redirect(new URL(redirect, request.url));
  }
  return response;
}
