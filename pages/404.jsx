import Head from 'next/head';
import { useRouter } from 'next/router';
import { ORG, MUT, TXT, BDR, DIM, SANS, DISP } from '../lib/constants';
import { Card, Btn } from '../components/UI';

export default function Custom404() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Page Not Found | Ripping Bombs</title>
        <meta name="description" content="This page could not be found. Head back to the Ripping Bombs longest drive leaderboard." />
        <meta name="robots" content="noindex" />
      </Head>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 18px 100px', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 90, color: ORG, letterSpacing: 2, lineHeight: 1, marginBottom: 6, opacity: 0.9 }}>
          404
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: MUT, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 28 }}>
          OUT OF BOUNDS
        </div>

        <Card>
          <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 0.5, marginBottom: 10 }}>
            That drive went off the fairway
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.7, marginBottom: 26 }}>
            The page you're looking for doesn't exist or may have moved.
            Let's get you back on the course.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <Btn full onClick={() => router.push('/')}>
              🏠 Leaderboard
            </Btn>
            <Btn full onClick={() => router.push('/register')}>
              🖥️ Register
            </Btn>
          </div>

          <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>
            Or check out the{' '}
            <span
              onClick={() => router.push('/supported-simulators')}
              style={{ color: ORG, cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              supported simulators
            </span>{' '}
            page.
          </div>
        </Card>

        <div style={{ marginTop: 28, fontFamily: SANS, fontSize: 11, color: DIM, borderTop: `1px solid ${BDR}`, paddingTop: 18 }}>
          If you followed a link to get here and think this is a mistake,{' '}
          <a href="mailto:team@rippingbombs.com" style={{ color: MUT, textDecoration: 'underline' }}>
            let us know
          </a>.
        </div>
      </div>
    </>
  );
}
