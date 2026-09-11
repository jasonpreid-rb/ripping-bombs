// Self-hosts Inter and Bebas Neue via next/font instead of the classic
// Google Fonts <link> tags that used to be in pages/_document.jsx. next/font
// downloads the font files at build time and serves them from your own
// domain, so there's no separate connection to fonts.googleapis.com/
// fonts.gstatic.com, no render-blocking external stylesheet request, and
// no layout shift while the fallback swaps in (font-display: swap is
// applied automatically and Next inlines the right fallback metrics).
//
// Applied via CSS variables (see the `variable` option below) on the <Html>
// tag in _document.jsx, rather than a className on some wrapper element —
// that makes them available everywhere through plain CSS custom properties
// instead of requiring every one of this app's many inline
// `fontFamily: SANS` / `fontFamily: DISP` usages (see lib/constants.js) to
// be rewritten individually.
import { Inter, Bebas_Neue } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
});
