import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

function formatMonthStr(date) {
  // Returns 'YYYY-MM' for string-prefix matching against entries.date
  return date.toISOString().slice(0, 7);
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthStr = formatMonthStr(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = formatMonthStr(lastMonthDate);

    // ----- CLUBS / INDIVIDUALS (accountType on clubs table) -----
    const { count: totalClubs } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'club');

    const { count: totalIndividuals } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'individual');

    const { count: newClubsThisMonth } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'club')
      .gte('created_at', startOfThisMonth.toISOString());

    const { count: newIndividualsThisMonth } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'individual')
      .gte('created_at', startOfThisMonth.toISOString());

    // ----- ENTRIES (filter by text date field, 'YYYY-MM' prefix) -----
    const { count: totalSubmissions } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true });

    const { count: submissionsThisMonth } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .like('date', `${thisMonthStr}%`);

    const { count: submissionsLastMonth } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .like('date', `${lastMonthStr}%`);

    const submissionGrowth = submissionsLastMonth > 0
      ? (((submissionsThisMonth - submissionsLastMonth) / submissionsLastMonth) * 100).toFixed(1)
      : 'N/A';

    const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h1 style="color: #FF0090;">Ripping Bombs — Monthly Snapshot</h1>
        <h2 style="font-weight: normal; color: #555;">${monthLabel}</h2>

        <h3>Marketplace Growth</h3>
        <ul>
          <li>Total clubs: <b>${totalClubs}</b> (+${newClubsThisMonth} this month)</li>
          <li>Total individuals/sims: <b>${totalIndividuals}</b> (+${newIndividualsThisMonth} this month)</li>
        </ul>

        <h3>Engagement</h3>
        <ul>
          <li>Total submissions (all-time): <b>${totalSubmissions}</b></li>
          <li>Submissions this month: <b>${submissionsThisMonth}</b></li>
          <li>Submissions last month: <b>${submissionsLastMonth}</b></li>
          <li>Month-over-month growth: <b>${submissionGrowth}${submissionGrowth !== 'N/A' ? '%' : ''}</b></li>
        </ul>

        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          Auto-generated on ${now.toLocaleDateString()}. Note: club/individual growth tracking started ${now.toLocaleDateString()} — earlier history wasn't tracked, so this month's "new" counts may be inflated by backfilled accounts.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'reports@rippingbombs.com',
      to: 'team@rippingbombs.com',
      subject: `Ripping Bombs Monthly Report — ${monthLabel}`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Monthly report error:', error);
    return res.status(500).json({ error: error.message });
  }
}
