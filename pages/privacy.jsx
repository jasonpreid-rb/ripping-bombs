import Head from 'next/head';

const LAST_UPDATED = 'August 17, 2026';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Ripping Bombs</title>
        <meta
          name="description"
          content="Ripping Bombs privacy policy: what data we collect, why, and how you control it."
        />
        <link rel="canonical" href="https://www.rippingbombs.com/privacy" />
      </Head>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 20px', lineHeight: 1.6 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Last updated: {LAST_UPDATED}</p>

        <p>
          Ripping Bombs ("we," "our," "us") operates rippingbombs.com, a global longest-drive
          leaderboard for golfers competing on real courses and at simulator venues. This policy
          explains what information we collect, why we collect it, and the choices you have.
        </p>

        <h2>1. Who We Are</h2>
        <p>
          Ripping Bombs is operated by an individual founder based in Germany. For any
          privacy-related question or request, contact us at{' '}
          <a href="mailto:team@rippingbombs.com">team@rippingbombs.com</a>.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Account &amp; Registration Data</h3>
        <ul>
          <li>Name and email address</li>
          <li>Date of birth and gender (used to place you in the correct competition category and to compute your age at the time of each drive submission)</li>
          <li>Golf handicap</li>
          <li>Country</li>
          <li>Account type (individual/simulator golfer or club/venue account)</li>
        </ul>

        <h3>Drive Submissions &amp; Media</h3>
        <ul>
          <li>Submitted drive distance and category data</li>
          <li>Video or photo evidence of drives, where required for verification</li>
          <li>Profile/avatar images you choose to upload</li>
        </ul>
        <p>
          Media you upload is stored using Supabase Storage. We may use automated tools,
          including AI-assisted image review, to help verify submissions.
        </p>

        <h3>Automatically Collected Data</h3>
        <ul>
          <li>Usage and analytics data (pages visited, general location, device/browser type)</li>
          <li>Cookies and similar technologies (see Section 6)</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To operate leaderboards, rankings, and competition categories</li>
          <li>To verify drive submissions and prevent fraudulent entries</li>
          <li>To send transactional emails (account confirmations, submission receipts, leaderboard updates) via our email provider, Resend</li>
          <li>To operate paid features for venue accounts (e.g. TV display/kiosk tools)</li>
          <li>To improve the platform and understand how it's used, via analytics</li>
          <li>To communicate with you about your account or support requests</li>
        </ul>

        <h2>4. Legal Basis for Processing (EEA/UK Users)</h2>
        <p>
          Where GDPR applies, we process your data based on: performance of a contract (running
          your leaderboard account), legitimate interests (fraud prevention, product
          improvement), and consent (marketing communications, non-essential cookies), which you
          may withdraw at any time.
        </p>

        <h2>5. Who We Share Data With</h2>
        <p>We do not sell your personal data. We share data with service providers who help us run the platform:</p>
        <ul>
          <li><strong>Supabase</strong> — database and file storage</li>
          <li><strong>Vercel</strong> — application hosting</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Analytics providers</strong> (e.g. Google Analytics/Search Console) — site usage insights</li>
        </ul>
        <p>
          Your username, country, category, and drive results are displayed publicly on
          leaderboards as part of the core function of the service. Avatar images, if uploaded,
          are also public. Your email address and date of birth are never displayed publicly.
        </p>
        <p>
          Venue/club accounts may see aggregated or individual results submitted at their
          location, consistent with the competition format.
        </p>

        <h2>6. Cookies</h2>
        <p>
          We use cookies and similar technologies for essential site functionality (e.g. staying
          logged in) and for analytics to understand how the site is used. You can control
          cookies through your browser settings; disabling non-essential cookies won't affect
          core leaderboard functionality.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain account and submission data for as long as your account is active, or as
          needed to maintain accurate historical leaderboards. You can request deletion at any
          time (Section 9); note that some anonymized or aggregated competition data may be
          retained to preserve leaderboard history and integrity.
        </p>

        <h2>8. International Data Transfers</h2>
        <p>
          Ripping Bombs serves a global audience and our service providers operate
          infrastructure in multiple countries, including the United States. Where required, we
          rely on appropriate safeguards (such as standard contractual clauses) for transfers of
          personal data outside the EEA/UK.
        </p>

        <h2>9. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to or restrict certain processing</li>
          <li>Request a copy of your data in a portable format</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise any of these rights, email{' '}
          <a href="mailto:team@rippingbombs.com">team@rippingbombs.com</a>. We'll respond
          within a reasonable timeframe and may need to verify your identity first.
        </p>

        <h2>10. Children's Privacy</h2>
        <p>
          Ripping Bombs is not directed at children under 13 (or the relevant minimum age in
          your jurisdiction). We do not knowingly collect personal data from children below this
          age. If you believe a child has provided us with personal data, contact us and we will
          delete it.
        </p>

        <h2>11. Data Security</h2>
        <p>
          We use industry-standard measures, including those provided by our infrastructure
          partners (Supabase, Vercel), to protect your data. No method of transmission or
          storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this policy as the platform evolves. Material changes will be reflected
          by updating the "Last updated" date above. Continued use of Ripping Bombs after changes
          take effect constitutes acceptance of the revised policy.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          Questions about this policy or your data? Email{' '}
          <a href="mailto:team@rippingbombs.com">team@rippingbombs.com</a>.
        </p>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
