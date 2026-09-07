import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase's client picks the session up from the URL automatically,
    // we just need to wait for it before redirecting.
    supabase.auth.getSession().then(({ data }) => {
      const next = router.query.next || "/";
      if (data?.session) {
        router.replace(next);
      } else {
        router.replace("/login?error=auth_failed");
      }
    });
  }, [router]);

  return <p>Signing you in…</p>;
}
