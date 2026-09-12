// pages/robots.txt.js
//
// Dynamic robots.txt: serves a full "Disallow: /" to every crawler when the
// request host is the dev subdomain, and the normal production policy
// everywhere else. Delete public/robots.txt so this route is the only one
// serving /robots.txt (Next.js will otherwise prefer the static file).
//
// NOTE: this lives under pages/ (not pages/api/), so it must use
// getServerSideProps to get a real `res` object and to force server-side
// rendering. An API-route-style `export default function handler(req, res)`
// here gets treated as a React page component and statically prerendered at
// build time with no real request, crashing on req.headers.host.

const PRODUCTION_ROBOTS = `User-agent: *
Allow: /

# AI training crawlers — opted out of training-data collection.
# Retrieval/citation crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot,
# Amazonbot, Claude-User, Claude-SearchBot, Perplexity-User) are
# deliberately left allowed above, so the site remains discoverable and
# citable in AI-assisted search/answers. This mirrors middleware.js —
# keep the two in sync if this policy changes.
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: cohere-ai
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: omgilibot
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: ImagesiftBot
Disallow: /

User-agent: YouBot
Disallow: /

User-agent: Timpibot
Disallow: /

User-agent: Webzio-Extended
Disallow: /

Sitemap: https://www.rippingbombs.com/sitemap.xml
`;

const DEV_ROBOTS = `User-agent: *
Disallow: /
`;

export async function getServerSideProps({ req, res }) {
  const hostname = (req.headers.host || '').toLowerCase();
  const isDev = hostname.startsWith('dev.');

  res.setHeader('Content-Type', 'text/plain');

  if (isDev) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

  res.write(isDev ? DEV_ROBOTS : PRODUCTION_ROBOTS);
  res.end();

  return { props: {} };
}

// Never actually rendered — getServerSideProps ends the response first.
export default function Robots() {
  return null;
}
