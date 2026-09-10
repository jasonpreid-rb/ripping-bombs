import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/auth/login.js
// Verifies credentials server-side instead of comparing plaintext
// passwords via the anon client.
//
// Handles the migration from the old plaintext-password era: if a row's
// pw doesn't look like a bcrypt hash (doesn't start with "$2"), it's
// treated as a legacy plaintext password. A direct-match legacy login
// succeeds and is silently re-saved as a proper hash, so every existing
// account converts the first time its owner logs in — nobody gets
// locked out, and nothing is left plaintext for long.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, pw } = req.body;
  if (!email || !pw) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const { data: org, error } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .ilike('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!org || !org.pw) return res.status(401).json({ error: 'Invalid credentials' });

    let ok = false;
    const isBcryptHash = org.pw.startsWith('$2');

    if (isBcryptHash) {
      ok = await bcrypt.compare(pw, org.pw);
    } else {
      // Legacy plaintext row.
      ok = pw === org.pw;
      if (ok) {
        const rehashed = await bcrypt.hash(pw, 10);
        await supabaseAdmin.from('clubs').update({ pw: rehashed }).eq('id', org.id);
      }
    }

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (org.status === 'pending') return res.status(403).json({ error: 'Awaiting admin approval' });
    if (org.status !== 'approved') return res.status(403).json({ error: 'Account not active' });

    const { pw: _pw, ...safe } = org;
    res.status(200).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
