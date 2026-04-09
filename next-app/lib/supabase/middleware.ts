import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectToLogin(request: NextRequest, path: string, errorCode: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";
  url.searchParams.set("redirectedFrom", path);
  url.searchParams.set("error", errorCode);
  return NextResponse.redirect(url);
}

/**
 * Refreshes the Supabase session cookie and gates `/admin`.
 * Must never throw: an uncaught error becomes Vercel `MIDDLEWARE_INVOCATION_FAILED` (500).
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAuthPage = path.startsWith("/auth");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // createServerClient throws if URL or key is empty — crashes Edge middleware.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[Auth Middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (check Vercel env + redeploy).",
    );
    if (isAdmin) {
      return redirectToLogin(request, path, "missing_auth_config");
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          for (const { name, value, options } of cookiesToSet) {
            try {
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
            } catch (cookieError) {
              console.warn("[Auth Middleware] cookie set skipped", {
                name,
                message: cookieError instanceof Error ? cookieError.message : "unknown",
              });
            }
          }
        },
      },
    });

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
          try {
            response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
          } catch {
            /* ignore */
          }
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
  } catch (error) {
    console.error("[Auth Middleware] updateSession failed", {
      path,
      error: error instanceof Error ? error.message : "unknown",
    });
    if (isAdmin) {
      return redirectToLogin(request, path, "session_unavailable");
    }
    return NextResponse.next({ request });
  }
}
