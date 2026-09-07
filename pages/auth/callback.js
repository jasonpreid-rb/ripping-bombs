import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const next = typeof router.query.next === "string" ? router.query.next : "/";
    let settled = false;

    const finish = (hasSession) => {
      if (settled) return;
      settled = true;
      router.replace(hasSession ? next : "/login?error=auth_failed");
    };

    // Fast path: session may already be available (e.g. the hash was
    // parsed before this effect ran).
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) finish(true);
    });

    // Reliable path: fires once Supabase finishes parsing the redirect
    // URL and persisting the session — avoids the race where getSession()
    // is called before that async parsing has completed.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        finish(!!session);
      }
    });

    // Safety net: if no session shows up within a few seconds, something
    // genuinely failed (bad/expired code, provider error, etc.) — don't
    // leave the user staring at "Signing you in..." forever.
    const timeout = setTimeout(() => finish(false), 6000);

    return () => {
      listener?.subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, router.isReady]);

  return <p>Signing you in…</p>;
}
