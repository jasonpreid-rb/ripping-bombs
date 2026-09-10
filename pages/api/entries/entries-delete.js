import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/entries/delete.js
// Service-role delete for an entries row — admin panel "Delete drive" action.
//
// TODO: same caveat as clubs/delete.js — no real server-side admin check
// yet, only the client-side admin password prompt.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const { error } = await supabaseAdmin.from('entries').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
