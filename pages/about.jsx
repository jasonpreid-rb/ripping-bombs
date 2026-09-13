import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { ORG, TXT, MUT, DISP, SANS, BG2, BDR } from '../lib/constants';

export default function About() {
  return (
    <SeoPage
      title="About Ripping Bombs"
      description="Ripping Bombs is a global longest-drive leaderboard for club and simulator golfers, built by Jason Reid in Munich, Germany."
    >
      <SeoH1>About Ripping Bombs</SeoH1>
      <SeoP>
        Ripping Bombs is a global longest-drive leaderboard for golfers — on real courses and on
        simulators — with results submitted by registered clubs and venues and evidenced by photo
        proof of the recorded distance.
      </SeoP>

      <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: '28px 24px', margin: '32px 0', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px' }}>
          <div style={{ fontFamily: DISP, fontSize: 22, color: TXT, letterSpacing: .5, marginBottom: 6 }}>Jason Reid</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginBottom: 14 }}>Founder — Munich, Germany (originally from New Zealand)</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: TXT, lineHeight: 1.7 }}>
            I built Ripping Bombs to give longest-drive results a real, permanent home — a single
            place to see how a drive from a club in one country actually compares to one from a
            simulator venue on the other side of the world, with the evidence to back it up.
          </div>
        </div>
      </div>

      <SeoH2>What "Verified" Means Here</SeoH2>
      <SeoP>
        Every drive submitted to Ripping Bombs — from a club or a simulator account — includes
        photo evidence of the recorded distance. Accounts register instantly; there's no gatekeeping
        on who can join. The evidence attached to each submission is what "verified" refers to, and
        it's reviewable at any time. See exactly how that works on the{' '}
        <a href="/how-verification-works" style={{ color: ORG }}>verification page</a>.
      </SeoP>

      <SeoH2>Get In Touch</SeoH2>
      <SeoP>
        Questions, partnership enquiries, or something that doesn't look right on the site?
        Reach out via the <a href="/contact" style={{ color: ORG }}>contact page</a>.
      </SeoP>
    </SeoPage>
  );
}
