import { NextResponse } from 'next/server';

// AI crawlers and scrapers to block at the edge
const BLOCKED_AGENTS = [
  'gptbot',
  'chatgpt-user',
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
  'perplexitybot',
  'youbot',
  'amazonbot',
  'applebot-extended',
  'timpibot',
  'webzio-extended',
];

export function middleware(request) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  const isBlocked = BLOCKED_AGENTS.some((agent) => userAgent.includes(agent));

  if (isBlocked) {
    return new NextResponse('Access denied', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
