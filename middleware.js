import { NextResponse } from 'next/server';

// AI training crawlers to block at the edge — these harvest content
// periodically to build/update models, unrelated to any specific user
// query. Deliberately does NOT include retrieval/citation crawlers
// (OAI-SearchBot, ChatGPT-User, PerplexityBot, Amazonbot, Claude-User,
// Claude-SearchBot, Perplexity-User) since blocking those prevents the
// site from being discoverable or citable in AI-assisted search/answers.
// AI crawler user-agents change a few times a year — worth revisiting.
const BLOCKED_AGENTS = [
  'gptbot',
  'claudebot',
  'anthropic-ai',
  'google-extended',
  'ccbot',
  'facebookbot',
  'omgilibot',
  'diffbot',
  'bytespider',
  'imagesiftbot',
  'cohere-ai',
  'youbot',
  'applebot-extended',
  'timpibot',
  'webzio-extended',
];

export function middleware(request) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const hostname = (request.headers.get('host') || '').toLowerCase();

  const isBlocked = BLOCKED_AGENTS.some((agent) => userAgent.includes(agent));

  if (isBlocked) {
    return new NextResponse('Access denied', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // dev.rippingbombs.com should never be indexed. Belt-and-suspenders
  // alongside pages/robots.txt.js (which stops future crawling) — this
  // header actively tells Google to drop pages it has already crawled
  // and indexed from this host. Keep both in sync if the dev host changes.
  const isDevHost = hostname.startsWith('dev.');

  const response = NextResponse.next();

  if (isDevHost) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  // Run on all routes except Next.js internals and any static asset —
  // anything with a file extension (.html, .png, .css, .js, .ico, etc.)
  // is excluded, since real pages never have a dot in their path but
  // files in public/ do. Previously only _next/static, _next/image, and
  // favicon.ico were excluded, which left every other public/ file
  // (including this poster's .html and .png) running through middleware
  // unnecessarily.
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
