import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
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
      </Head>
      <body>
        <Main/>
        <NextScript/>
      </body>
    </Html>
  );
}
