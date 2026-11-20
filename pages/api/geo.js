// Tiny helper for the register page: tells the browser which country the
// request came from, using the header Vercel adds at the edge. Used only to
// pre-select the Country dropdown (the user can still change it). Returns
// { country: null } locally / anywhere the header isn't present.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const c = req.headers['x-vercel-ip-country'];
  res.status(200).json({
    country: typeof c === 'string' && /^[A-Za-z]{2}$/.test(c) ? c.toUpperCase() : null,
  });
}
