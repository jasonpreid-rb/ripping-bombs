// Investor/partner-facing version of the monthly report.
// Light, formal design for external sharing. Triggered manually via ?to=email
// so you control exactly who receives it — not on the automatic monthly cron.

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

function quickChart(config, width = 560, height = 260, bg = 'white') {
  return `https://quickchart.io/chart?width=${width}&height=${height}&backgroundColor=${encodeURIComponent(bg)}&c=${encodeURIComponent(JSON.stringify(config))}`;
}

export default async function handler(req, res) {
  // Allow either: (a) Vercel Cron's automatic auth header, or
  // (b) you manually triggering it with ?secret=YOUR_CRON_SECRET in the URL.
  const isCron = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query.secret === process.env.CRON_SECRET;
  if (!isCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const recipient = req.query.to || req.body?.to || 'team@rippingbombs.com';

  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthStr = formatMonthStr(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = formatMonthStr(lastMonthDate);

    // ----- CURRENT TOTALS -----
    const { count: totalClubs } = await supabase
      .from('clubs').select('*', { count: 'exact', head: true }).eq('accountType', 'club');

    const { count: totalIndividuals } = await supabase
      .from('clubs').select('*', { count: 'exact', head: true }).eq('accountType', 'simulator');

    const { count: newClubsThisMonth } = await supabase
      .from('clubs').select('*', { count: 'exact', head: true })
      .eq('accountType', 'club').gte('created_at', startOfThisMonth.toISOString());

    const { count: newIndividualsThisMonth } = await supabase
      .from('clubs').select('*', { count: 'exact', head: true })
      .eq('accountType', 'simulator').gte('created_at', startOfThisMonth.toISOString());

    const { count: totalSubmissions } = await supabase
      .from('entries').select('*', { count: 'exact', head: true });

    const { count: submissionsThisMonth } = await supabase
      .from('entries').select('*', { count: 'exact', head: true }).like('date', `${thisMonthStr}%`);

    const { count: submissionsLastMonth } = await supabase
      .from('entries').select('*', { count: 'exact', head: true }).like('date', `${lastMonthStr}%`);

    const submissionGrowth = submissionsLastMonth > 0
      ? (((submissionsThisMonth - submissionsLastMonth) / submissionsLastMonth) * 100).toFixed(1)
      : 'N/A';

    // ----- COUNTRIES (from clubs.country) -----
    const { data: countryRows } = await supabase
      .from('clubs').select('country').not('country', 'is', null);

    const countryCounts = {};
    (countryRows || []).forEach(row => {
      const c = (row.country || 'Unknown').trim();
      if (!c) return;
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
    const totalCountries = sortedCountries.length;

    // ----- 6-MONTH SUBMISSION TREND (real history, from entries.date) -----
    const monthBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.push({ label: d.toLocaleString('en-US', { month: 'short' }), key: formatMonthStr(d) });
    }
    const trendCounts = [];
    for (const bucket of monthBuckets) {
      const { count } = await supabase
        .from('entries').select('*', { count: 'exact', head: true }).like('date', `${bucket.key}%`);
      trendCounts.push(count || 0);
    }

    const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const totalAccounts = totalClubs + totalIndividuals;

    const narrative = submissionGrowth !== 'N/A'
      ? `Ripping Bombs grew submissions ${submissionGrowth}% month-over-month in ${monthLabel}, now serving ${totalAccounts} registered clubs and individual users across ${totalCountries} countries.`
      : `Ripping Bombs is now serving ${totalAccounts} registered clubs and individual users across ${totalCountries} countries as of ${monthLabel}.`;

    // ----- CHART 1: Submission trend (6-month line) -----
    const trendChartUrl = quickChart({
      type: 'line',
      data: {
        labels: monthBuckets.map(b => b.label),
        datasets: [{
          label: 'Submissions',
          data: trendCounts,
          borderColor: '#FF0090',
          backgroundColor: 'rgba(255,0,144,0.08)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#FF0090',
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#555555', font: { size: 13 } }, grid: { display: false } },
          y: { ticks: { color: '#555555' }, grid: { color: '#e5e5e5' } },
        },
        backgroundColor: '#ffffff',
      },
    }, 560, 260);

    // ----- CHART 2: Clubs vs Individuals (current snapshot) -----
    const accountsChartUrl = quickChart({
      type: 'bar',
      data: {
        labels: ['Clubs', 'Individuals / Sims'],
        datasets: [{
          data: [totalClubs, totalIndividuals],
          backgroundColor: ['#111111', '#FF0090'],
          borderRadius: 4,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#555555', font: { size: 13 } }, grid: { display: false } },
          y: { ticks: { color: '#555555' }, grid: { color: '#e5e5e5' } },
        },
        backgroundColor: '#ffffff',
        indexAxis: 'y',
      },
    }, 560, 220);

    // ----- CHART 3: Countries involved -----
    const topCountries = sortedCountries.slice(0, 8);
    const countriesChartUrl = quickChart({
      type: 'bar',
      data: {
        labels: topCountries.map(([name]) => name),
        datasets: [{
          data: topCountries.map(([, count]) => count),
          backgroundColor: '#FF0090',
          borderRadius: 4,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#555555', font: { size: 12 } }, grid: { display: false } },
          y: { ticks: { color: '#555555' }, grid: { color: '#e5e5e5' } },
        },
        backgroundColor: '#ffffff',
      },
    }, 560, 260);

    const dataRow = (label, value) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #555555; font-size: 14px;">${label}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #111111; font-size: 14px; font-weight: 700; text-align: right;">${value}</td>
      </tr>
    `;

    const chartBlock = (title, url) => `
      <div style="margin-bottom: 32px;">
        <div style="font-family: Arial, sans-serif; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">${title}</div>
        <img src="${url}" alt="${title}" style="width: 100%; max-width: 560px; border: 1px solid #e5e5e5; display: block;" />
      </div>
    `;

    const html = `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 32px; color: #111111;">

        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #111111; padding-bottom: 20px; margin-bottom: 28px;">
          <img src="https://rippingbombs.com/favicon.png" alt="Ripping Bombs" style="height: 32px;" />
          <div style="text-align: right; font-family: Arial, sans-serif;">
            <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Performance Report</div>
            <div style="font-size: 13px; color: #111111; font-weight: 600;">${monthLabel}</div>
          </div>
        </div>

        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #222222; margin-bottom: 32px;">
          ${narrative}
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; margin-bottom: 32px;">
          ${dataRow('Registered Clubs', totalClubs)}
          ${dataRow('Registered Individuals / Simulators', totalIndividuals)}
          ${dataRow('Countries Represented', totalCountries)}
          ${dataRow('Total Submissions (All-Time)', totalSubmissions)}
          ${dataRow('Submissions This Month', submissionsThisMonth)}
          ${dataRow('Month-over-Month Growth', `${submissionGrowth}${submissionGrowth !== 'N/A' ? '%' : ''}`)}
        </table>

        ${chartBlock('Submission Trend — Last 6 Months', trendChartUrl)}
        ${chartBlock('Registered Accounts by Type', accountsChartUrl)}
        ${chartBlock('Countries Represented', countriesChartUrl)}

        <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; font-family: Arial, sans-serif;">
          <p style="font-size: 12px; color: #888888; line-height: 1.6; margin: 0 0 8px 0;">
            Ripping Bombs is a global longest-drive leaderboard and registry platform, building toward a 2027 Championship milestone.
          </p>
          <p style="font-size: 12px; color: #888888; margin: 0;">
            rippingbombs.com &nbsp;|&nbsp; team@rippingbombs.com &nbsp;|&nbsp; Confidential — prepared ${now.toLocaleDateString()}
          </p>
        </div>

      </div>
    `;

    await resend.emails.send({
      from: 'team@rippingbombs.com',
      to: recipient,
      subject: `Ripping Bombs — Performance Report, ${monthLabel}`,
      html,
    });

    return res.status(200).json({ success: true, sentTo: recipient, totalCountries, sortedCountries });
  } catch (error) {
    console.error('Investor report error:', error);
    return res.status(500).json({ error: error.message });
  }
}
