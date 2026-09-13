import { SeoPage, SeoH1, SeoH2, SeoP } from '../components/SeoPageLayout';
import { ORG } from '../lib/constants';

export default function HowVerificationWorks() {
  return (
    <SeoPage
      title="How Verification Works | Ripping Bombs"
      description="How Ripping Bombs verifies longest drive submissions: photo evidence, account setup, and what happens if something looks wrong."
    >
      <SeoH1>How Verification Works</SeoH1>
      <SeoP>
        Ripping Bombs is built on evidence, not trust in a name. Here's exactly what that means in
        practice — no more, no less.
      </SeoP>

      <SeoH2>Photo Evidence On Every Drive</SeoH2>
      <SeoP>
        Every drive submitted — whether from a real course or a simulator — requires a photo
        showing the recorded distance: a rangefinder or GPS readout for course drives, or the
        launch monitor's screen for simulator drives. That evidence is attached to the submission
        and stays reviewable.
      </SeoP>

      <SeoH2>Account Setup Is Instant</SeoH2>
      <SeoP>
        Registering a club or simulator account is immediate — there's no waiting period or
        gatekeeper deciding who's allowed to join. We'd rather keep the barrier to entry low and
        rely on the evidence attached to each drive than slow down real golfers with a manual
        approval queue. Simulator and individual accounts are limited to one submission a week, a
        light check against spam rather than a review process.
      </SeoP>

      <SeoH2>If Something Looks Wrong</SeoH2>
      <SeoP>
        Spot a result that doesn't add up — an implausible distance, a mismatched photo, anything
        that looks off? <a href="/contact" style={{ color: ORG }}>Tell us</a> and we'll look into
        it. Entries can be corrected or removed once something's been flagged.
      </SeoP>

      <SeoH2>Why Build It This Way</SeoH2>
      <SeoP>
        A manual review queue would slow down every legitimate submission to catch a small number
        of bad ones. Attaching evidence to every drive, and making it easy to flag a problem after
        the fact, is a trade-off — not a guarantee that every number on the board is perfect, but
        an honest description of the system as it actually works today.
      </SeoP>
    </SeoPage>
  );
}
