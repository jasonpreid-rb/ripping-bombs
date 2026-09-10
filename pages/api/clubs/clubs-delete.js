import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/clubs/delete.js
// Service-role delete for a clubs row — admin panel "Delete club" action.
//
// TODO: verify the requester is actually an authenticated admin before
// trusting this. Right now anyone who can reach this endpoint can delete
// any account, gated only by the client-side admin password prompt in
// _app.jsx — which is not a real server-side check.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const { error } = await supabaseAdmin.from('clubs').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
