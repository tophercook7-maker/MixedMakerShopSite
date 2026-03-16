"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirectedFrom") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPostLoginFallback, setShowPostLoginFallback] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  function withFromLogin(path: string, minimalMode = false): string {
    const safePath = String(path || "/admin");
    const [base, query = ""] = safePath.split("?");
    const params = new URLSearchParams(query);
    params.set("fromLogin", "1");
    if (minimalMode) params.set("minimal", "1");
    const qs = params.toString();
    return `${base || "/admin"}${qs ? `?${qs}` : ""}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowPostLoginFallback(false);
    console.info("[Auth Login] login submit started");

    try {
      const supabase = createClient();
      console.info("[Auth Login] auth request started");
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });

      if (err) {
        console.error("[Auth Login] auth request failed", { message: err.message });
        setError(err.message);
        return;
      }
      console.info("[Auth Login] auth request success");

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        console.error("[Auth Login] session read failed", { message: sessionErr.message });
      }
      const hasSession = Boolean(sessionData?.session?.access_token);
      console.info("[Auth Login] session received", { hasSession });

      const nextPath = withFromLogin(redirect, false);
      console.info("[Auth Login] redirect started", { redirectTo: nextPath });
      fallbackTimerRef.current = window.setTimeout(() => {
        setShowPostLoginFallback(true);
      }, 8000);

      router.replace(nextPath);
      router.refresh();
      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.location.assign(nextPath);
        }
      }, 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 p-6 space-y-6">
        <div className="space-y-3 text-center">
          <img
            src="/m3-logo.png"
            alt="MixedMakerShop M3 logo"
            className="mx-auto w-full max-w-[120px] h-auto"
          />
          <h1 className="text-2xl font-bold">MixedMakerShopAdmin</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {showPostLoginFallback && (
          <section
            className="rounded-lg border px-3 py-3 space-y-2"
            style={{ borderColor: "rgba(252, 165, 165, 0.55)", background: "rgba(127, 29, 29, 0.08)" }}
          >
            <p className="text-sm font-medium text-red-700">Signed in, but admin data failed to load.</p>
            <p className="text-xs text-neutral-700">
              Your session is active. You can retry admin load or continue in minimal admin mode.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  const nextPath = withFromLogin(redirect, false);
                  router.replace(nextPath);
                  router.refresh();
                }}
              >
                Retry Admin Load
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  window.location.assign(withFromLogin("/admin/minimal", true));
                }}
              >
                Continue Minimal Admin Mode
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-neutral-500">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
