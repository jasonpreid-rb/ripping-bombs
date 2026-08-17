import Head from 'next/head';

const LAST_UPDATED = 'August 17, 2026';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service | Ripping Bombs</title>
        <meta
          name="description"
          content="Ripping Bombs terms of service: the rules for using our global longest-drive leaderboard platform."
        />
        <link rel="canonical" href="https://www.rippingbombs.com/terms" />
      </Head>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 20px', lineHeight: 1.6 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Last updated: {LAST_UPDATED}</p>

        <p>
          These Terms of Service ("Terms") govern your use of Ripping Bombs (rippingbombs.com),
          a global longest-drive leaderboard for golfers competing on real courses and at
          simulator venues. By creating an account or using the site, you agree to these Terms.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 13 years old (or the minimum age of digital consent in your
          jurisdiction) to create an account. By registering, you confirm the age and gender
          information you provide is accurate, as it determines your competition category.
        </p>

        <h2>2. Accounts</h2>
        <ul>
          <li>You're responsible for maintaining the security of your account and any activity under it.</li>
          <li>You may register as an individual/simulator golfer or as a club/venue account.</li>
          <li>Venue accounts may access additional paid features (e.g. TV display and sponsor tools) subject to the pricing in effect at the time of purchase.</li>
          <li>You agree to provide accurate information, including handicap, country, and date of birth.</li>
        </ul>

        <h2>3. Drive Submissions</h2>
        <p>By submitting a drive to Ripping Bombs, you represent and agree that:</p>
        <ul>
          <li>The submission reflects a genuine drive you personally hit — no fabricated, altered, or borrowed footage or results.</li>
          <li>Any video, photo, or distance data provided is accurate to the best of your knowledge.</li>
          <li>You grant Ripping Bombs a non-exclusive, worldwide, royalty-free license to display, reproduce, and use your submission (including video, images, and results) on the platform, leaderboards, and in promotional material such as social media recaps.</li>
          <li>We may remove, disqualify, or decline to publish any submission we reasonably believe is fraudulent, manipulated, or in violation of these Terms, at our discretion and without prior notice.</li>
          <li>We may use automated tools, including AI-assisted review, to help verify submissions, but final decisions on disputed entries are made by us and are final.</li>
        </ul>
        <p>
          Ripping Bombs leaderboards are provided for competitive and entertainment purposes.
          We do our best to keep results accurate but do not guarantee that every submission has
          been independently verified, and we are not liable for disputes between users over
          leaderboard placement or claimed distances.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Submit false, misleading, or manipulated drive data or media</li>
          <li>Impersonate another person or misrepresent your affiliation with any venue or club</li>
          <li>Upload content that is unlawful, abusive, or infringes on someone else's rights</li>
          <li>Attempt to interfere with, disrupt, or reverse-engineer the platform</li>
          <li>Use the platform for any purpose other than legitimate longest-drive competition</li>
        </ul>

        <h2>5. Venue &amp; Sponsor Accounts</h2>
        <p>
          Paid venue features (such as the TV display and sponsor placement tier) are billed on
          the plan and terms shown at checkout. We may change pricing or features for future
          billing periods with reasonable notice. Cancelling a paid tier stops future billing but
          does not entitle you to a refund for the current billing period, except where required
          by law.
        </p>

        <h2>6. Intellectual Property</h2>
        <p>
          The Ripping Bombs name, logo, design, and platform code are owned by us and may not be
          copied, reproduced, or used without permission. You retain ownership of media you
          upload, subject to the license granted in Section 3.
        </p>

        <h2>7. Disclaimers</h2>
        <p>
          Ripping Bombs is provided "as is" without warranties of any kind, express or implied.
          We do not guarantee the platform will be uninterrupted, error-free, or that leaderboard
          data will be permanently accurate or available. Participation in longest-drive
          competitions, whether on a course or at a simulator venue, is at your own risk, and you
          are responsible for your own safety and equipment.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Ripping Bombs and its founder are not liable
          for any indirect, incidental, or consequential damages arising from your use of the
          platform, including disputes over leaderboard rankings, lost data, or issues with
          third-party services we rely on (such as Supabase, Vercel, or Resend).
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms, submit fraudulent
          entries, or misuse the platform. You may stop using Ripping Bombs and request account
          deletion at any time by contacting us.
        </p>

        <h2>10. Changes to These Terms</h2>
        <p>
          We may update these Terms as the platform evolves. Material changes will be reflected
          by updating the "Last updated" date above. Continued use after changes take effect
          constitutes acceptance of the revised Terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of Germany, without regard to conflict-of-law
          principles, except where local consumer protection laws in your country of residence
          provide otherwise.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          Questions about these Terms? Email{' '}
          <a href="mailto:team@rippingbombs.com">team@rippingbombs.com</a>.
        </p>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
