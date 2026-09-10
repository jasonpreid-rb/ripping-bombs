import { createClient } from "@supabase/supabase-js";

// Server-only client — bypasses RLS entirely. NEVER import this into
// anything that ships to the browser (pages, components, hooks).
// Only import it from files under pages/api/.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // set in Vercel env vars, no NEXT_PUBLIC_ prefix
);
