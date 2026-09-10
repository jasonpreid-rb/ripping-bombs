import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/auth/register.js
// Hashes the password server-side before it ever reaches the database.
// Replaces the old client-side db.insertOrg() anon insert for
// password-based registration.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const org = req.body;
  if (!org?.email || !org?.pw) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('clubs')
      .select('id')
      .ilike('email', org.email)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(org.pw, 10);
    const { data, error } = await supabaseAdmin
      .from('clubs')
      .insert({ ...org, pw: hashed })
      .select()
      .single();
    if (error) throw error;

    const { pw, ...safe } = data;
    res.status(200).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
