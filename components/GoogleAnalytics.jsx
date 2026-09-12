import { useEffect, useState } from 'react';
import Script from 'next/script';
import { hasAnalyticsConsent } from './CookieConsent';

const GA_ID = 'G-5RCJDKVBER';

// GA4 used to load unconditionally from pages/_document.jsx, regardless of
// what the CookieConsent banner said — the banner's choice was stored but
// nothing ever actually checked it. This is the piece that was missing:
// GA4 now only loads once hasAnalyticsConsent() is true, and re-checks
// live via the 'rb_cookie_consent_changed' event CookieConsent already
// fires, so accepting mid-session loads it without needing a page reload.
//
// Safe to gate this way: every window.gtag(...) call elsewhere in the app
// (see the click-tracking calls in pages/index.jsx) already guards with
// `if (window.gtag)` first, so nothing breaks while consent is pending or
// declined — those events just don't fire until GA4 is actually loaded.
export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasAnalyticsConsent());
    const onChange = () => setConsented(hasAnalyticsConsent());
    window.addEventListener('rb_cookie_consent_changed', onChange);
    return () => window.removeEventListener('rb_cookie_consent_changed', onChange);
  }, []);

  if (!consented) return null;

  return (
    <>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
