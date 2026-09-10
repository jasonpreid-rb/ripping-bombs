import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/auth/sync-google.js
//
// Called right after a Google OAuth sign-in. Trusts nothing from the
// request body — verifies the access token server-side via the
// service-role client, then:
//   1. If a clubs row is already linked to this auth user, return it.
//   2. Else if a clubs row exists with a matching email (e.g. an
//      existing password account), link it (set auth_user_id) and
//      return it — this unites the two rather than creating a duplicate.
//   3. Else create a brand-new clubs row for this Google identity.
//
// This needs the service-role client because linking (step 2) is an
// UPDATE, and the anon/authenticated roles have no update policy on
// clubs anymore.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing access token' });

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  const user = userData.user;

  // 1. Already linked?
  const { data: linked, error: linkedErr } = await supabaseAdmin
    .from('clubs')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (linkedErr) return res.status(500).json({ error: linkedErr.message });
  if (linked) return res.status(200).json(stripSensitive(linked));

  // 2. Existing account with the same email — link it.
  if (user.email) {
    const { data: byEmail, error: byEmailErr } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .ilike('email', user.email)
      .maybeSingle();
    if (byEmailErr) return res.status(500).json({ error: byEmailErr.message });

    if (byEmail) {
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('clubs')
        .update({ auth_user_id: user.id })
        .eq('id', byEmail.id)
        .select()
        .single();
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      return res.status(200).json(stripSensitive(updated));
    }
  }

  // 3. No match anywhere — create a new account for this Google identity.
  // Defaults to a 'simulator' (individual) account; adjust if Google
  // sign-up should ever offer a club/venue path instead.
  const meta = user.user_metadata || {};
  const newOrg = {
    id: Date.now().toString(),
    fullName: meta.full_name || meta.name || user.email,
    position: 'Individual / Simulator',
    courseName: `Google — ${meta.full_name || meta.name || user.email}`,
    location: '',
    country: '',
    email: user.email,
    pw: null,
    logo: meta.avatar_url || meta.picture || '',
    status: 'approved',
    badge: 'simulator',
    accountType: 'simulator',
    simulator: '',
    auth_user_id: user.id,
  };

  const { data: created, error: createErr } = await supabaseAdmin
    .from('clubs')
    .insert(newOrg)
    .select()
    .single();
  if (createErr) return res.status(500).json({ error: createErr.message });
  return res.status(200).json(stripSensitive(created));
}

function stripSensitive(org) {
  const { pw, ...safe } = org;
  return safe;
}
