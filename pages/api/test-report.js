// Manual test version of the monthly report — no auth header required.
// Hit this directly in your browser or via curl to test once, before relying on cron.
// IMPORTANT: Delete this file (or add auth) before going to production long-term,
// since anyone with the URL could trigger an email send.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

function formatMonthStr(date) {
  return date.toISOString().slice(0, 7);
}

export default async function handler(req, res) {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthStr = formatMonthStr(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = formatMonthStr(lastMonthDate);

    const { count: totalClubs } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'club');

    const { count: totalIndividuals } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'simulator');

    const { count: newClubsThisMonth } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'club')
      .gte('created_at', startOfThisMonth.toISOString());

    const { count: newIndividualsThisMonth } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('accountType', 'simulator')
      .gte('created_at', startOfThisMonth.toISOString());

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

    const growthIsPositive = submissionGrowth !== 'N/A' && parseFloat(submissionGrowth) >= 0;
    const growthArrow = submissionGrowth === 'N/A' ? '' : (growthIsPositive ? '▲' : '▼');
    const growthColor = submissionGrowth === 'N/A' ? '#888' : (growthIsPositive ? '#22c55e' : '#ef4444');

    const statCard = (label, value, sublabel) => `
      <td style="padding: 8px;" width="50%">
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-family: Arial, sans-serif;">${label}</div>
          <div style="color: #ffffff; font-size: 32px; font-weight: 700; font-family: Arial, sans-serif; line-height: 1;">${value}</div>
          ${sublabel ? `<div style="color: #FF0090; font-size: 13px; margin-top: 6px; font-family: Arial, sans-serif;">${sublabel}</div>` : ''}
        </div>
      </td>
    `;

    const html = `
      <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; padding: 32px 16px;">

        <div style="text-align: center; margin-bottom: 28px;">
          <div style="color: #FF0090; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">Ripping Bombs</div>
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Monthly Snapshot (TEST SEND)</h1>
          <div style="color: #888; font-size: 14px; margin-top: 4px;">${monthLabel}</div>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
          <tr>
            ${statCard('Total Clubs', totalClubs, `+${newClubsThisMonth} this month`)}
            ${statCard('Individuals / Sims', totalIndividuals, `+${newIndividualsThisMonth} this month`)}
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            ${statCard('Total Submissions', totalSubmissions, 'all-time')}
            ${statCard('Submissions This Month', submissionsThisMonth, `vs ${submissionsLastMonth} last month`)}
          </tr>
        </table>

        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Month-over-Month Growth</div>
          <div style="color: ${growthColor}; font-size: 28px; font-weight: 700;">
            ${growthArrow} ${submissionGrowth}${submissionGrowth !== 'N/A' ? '%' : ''}
          </div>
        </div>

        <p style="color: #555; font-size: 11px; text-align: center; line-height: 1.5; margin-top: 32px;">
          This is a manual TEST send from /api/test-report. Auto-generated on ${now.toLocaleDateString()}.
        </p>

      </div>
      </body>
    `;

    await resend.emails.send({
      from: 'reports@rippingbombs.com',
      to: 'team@rippingbombs.com',
      subject: `[TEST] Ripping Bombs Monthly Report — ${monthLabel}`,
      html,
    });

    return res.status(200).json({
      success: true,
      preview: {
        totalClubs,
        totalIndividuals,
        newClubsThisMonth,
        newIndividualsThisMonth,
        totalSubmissions,
        submissionsThisMonth,
        submissionsLastMonth,
        submissionGrowth,
      },
    });
  } catch (error) {
    console.error('Test report error:', error);
    return res.status(500).json({ error: error.message });
  }
}
