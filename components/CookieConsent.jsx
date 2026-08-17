import { useState, useEffect } from 'react';
import { SANS, ORG, MUT, BG2, BDR, TXT } from '../lib/constants';

const CONSENT_KEY = 'rb_cookie_consent'; // 'accepted' | 'declined'

// Any future tracking script (GA, Meta Pixel, etc.) can check this before
// loading. Vercel Web Analytics is cookieless and does not need to be
// gated by this — it's here for anything added later that does use cookies.
export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function choose(value) {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    // Let the rest of the app react (e.g. load/skip a gated script) without a reload.
    window.dispatchEvent(new Event('rb_cookie_consent_changed'));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        background: BG2,
        borderTop: `1px solid ${BDR}`,
        padding: '18px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: SANS,
      }}
    >
      <div style={{ color: TXT, fontSize: 13, maxWidth: 560, lineHeight: 1.5 }}>
        We use essential cookies to run the site and, with your consent,
        analytics cookies to understand how it's used.{' '}
        <a href="/privacy" style={{ color: ORG, textDecoration: 'underline' }}>
          Learn more
        </a>
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => choose('declined')}
          style={{
            background: 'transparent',
            border: `1px solid ${BDR}`,
            color: MUT,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 12,
            padding: '10px 18px',
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
        <button
          onClick={() => choose('accepted')}
          style={{
            background: 'transparent',
            border: `1px solid ${ORG}`,
            color: ORG,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 12,
            padding: '10px 18px',
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
