import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    // TEMP DEBUG — remove once the flow is confirmed working
    console.log("[auth/callback] full URL:", window.location.href);
    console.log("[auth/callback] hash:", window.location.hash);
    console.log("[auth/callback] query:", router.query);

    const next = typeof router.query.next === "string" ? router.query.next : "/";
    let settled = false;

    const finish = (hasSession, reason) => {
      console.log("[auth/callback] finish() called — hasSession:", hasSession, "reason:", reason);
      if (settled) return;
      settled = true;
      router.replace(hasSession ? next : "/login?error=auth_failed");
    };

    supabase.auth.getSession().then(({ data, error }) => {
      console.log("[auth/callback] getSession() result:", data, "error:", error);
      if (data?.session) finish(true, "getSession");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[auth/callback] onAuthStateChange event:", event, "session:", !!session);
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        finish(!!session, `onAuthStateChange:${event}`);
      }
    });

    const timeout = setTimeout(() => {
      console.log("[auth/callback] TIMEOUT hit — no session detected in time");
      finish(false, "timeout");
    }, 6000);

    return () => {
      listener?.subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, router.isReady]);

  return <p>Signing you in…</p>;
}
