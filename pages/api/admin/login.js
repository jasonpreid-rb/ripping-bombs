// Server-only: validates the admin password against an environment variable
// (ADMIN_PASSWORD, no NEXT_PUBLIC_ prefix) so it's never shipped to the browser.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    console.error('ADMIN_PASSWORD is not set in the environment');
    return res.status(500).json({ ok: false, error: 'Admin login is not configured' });
  }

  if (typeof password === 'string' && password === expected) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: 'Incorrect password' });
}
