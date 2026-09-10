import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Place at: pages/api/auth/forgot-password.js
// Replaces emailing back the plaintext password (impossible now it's
// hashed, and a bad practice regardless). Generates a random temporary
// password, hashes and saves it, and emails only the plaintext temp
// value — a one-time credential the user should change after logging in.
//
// Always returns 200 (even if the email isn't registered) so this can't
// be used to enumerate which emails have accounts.

function randomTempPassword() {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    const { data: org } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (org) {
      const tempPassword = randomTempPassword();
      const hashed = await bcrypt.hash(tempPassword, 10);
      await supabaseAdmin.from('clubs').update({ pw: hashed }).eq('id', org.id);

      await fetch('https://www.rippingbombs.com/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'forgot_password',
          org: { email: org.email, fullName: org.fullName || 'there' },
          tempPassword,
        }),
      });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    // Still return ok:true to avoid leaking whether the email exists —
    // log server-side for debugging instead.
    console.error('forgot-password error:', err);
    res.status(200).json({ ok: true });
  }
}
