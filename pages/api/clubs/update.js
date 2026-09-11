import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/clubs/update.js
//
// Generic clubs-row update, service-role only. Used by db.updateOrg for
// everything that edits a clubs row: profile saves, TV Display trial
// start, profile-consent toggle, and admin approve/reject/badge actions.
//
// TODO: verify the requester is actually authorized to update this id
// (owns the account, or is an authenticated admin) before trusting the
// update. Right now this trusts whatever id+fields the client sends —
// same open question flagged on the events routes earlier.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, fields } = req.body;
  if (!id || !fields) return res.status(400).json({ error: 'Missing id or fields' });

  // Never allow pw to be set through this generic route — password
  // changes go through /api/auth/register or a dedicated change-password
  // route, where hashing happens. Strip it defensively if present.
  const { pw, ...safeFields } = fields;

  try {
    const { data, error } = await supabaseAdmin
      .from('clubs')
      .update(safeFields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const { pw: _pw, ...safe } = data;
    res.status(200).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
