import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/clubs/delete-account.js
// Self-service "Delete Account" (dashboard.jsx Danger Zone) — deletes this
// account's entries, then the clubs row itself. Service-role only: the
// anon client has no delete permission on either table anymore.
//
// TODO: verify the requester actually owns this account (there's no real
// session for password-login users yet — see the earlier auth notes) before
// trusting the id. Right now anyone who knows an account's id could delete
// it via this endpoint.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const { error: entriesErr } = await supabaseAdmin.from('entries').delete().eq('orgId', id);
    if (entriesErr) throw entriesErr;

    const { error: clubErr } = await supabaseAdmin.from('clubs').delete().eq('id', id);
    if (clubErr) throw clubErr;

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
