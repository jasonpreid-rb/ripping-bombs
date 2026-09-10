import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Server-only: deletes an entry or club/org using the service-role client,
// which bypasses RLS. Gated on the admin password (checked here, not just
// in the UI) so this can't be called by anyone who finds the endpoint.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { password, type, id } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    console.error('ADMIN_PASSWORD is not set in the environment');
    return res.status(500).json({ ok: false, error: 'Admin actions are not configured' });
  }

  if (typeof password !== 'string' || password !== expected) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if ((type !== 'entry' && type !== 'org') || !id) {
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  const table = type === 'entry' ? 'entries' : 'clubs';
  const { error } = await supabaseAdmin.from(table).delete().eq('id', id);

  if (error) {
    console.error(`ADMIN DELETE ${type.toUpperCase()} ERROR:`, error);
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true });
}
