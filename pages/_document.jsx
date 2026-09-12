import { Html, Head, Main, NextScript } from 'next/document';
import { inter, bebasNeue } from '../lib/fonts';

export default function Document() {
  return (
   <Html lang="en" style={{ fontFamily: inter.style.fontFamily }}>
      <Head>
        <link rel="icon" href="/favicon.ico"/>
        <link rel="icon" type="image/png" href="/favicon.png"/>
        <link rel="apple-touch-icon" href="/favicon.png"/>
        <meta name="theme-color" content="#1a1a1a"/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Ripping Bombs',
          url: 'https://www.rippingbombs.com/',
          logo: 'https://www.rippingbombs.com/favicon.png',
          sameAs: [
            'https://www.instagram.com/rippingbombs/',
            'https://www.facebook.com/rippingbombs/',
          ],
        }) }}/>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5RCJDKVBER"/>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5RCJDKVBER');
        `}}/>
      </Head>
      <body>
        <Main/>
        <NextScript/>
      </body>
    </Html>
  );
}
