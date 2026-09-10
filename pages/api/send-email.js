import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, org, entry, subject, message, tempPassword } = req.body;

  try {
    if (type === 'registration') {
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: 'team@rippingbombs.com',
        subject: `New Registration: ${org.courseName}`,
        text: `New registration on Ripping Bombs (auto-approved, no action needed):\n\nCourse: ${org.courseName}\nFull Name: ${org.fullName || '—'}\nPosition: ${org.position || '—'}\nLocation: ${org.location}\nCountry: ${org.country || '—'}\nEmail: ${org.email}\n\nView in admin:\nhttps://www.rippingbombs.com`,
      });

      const isSimulator = org.accountType === 'simulator';
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: org.email,
        subject: 'Welcome to Ripping Bombs!',
        text: isSimulator
          ? `Hi ${org.fullName},\n\nYour account is live! You can now log in and start submitting your longest drives to the World Registry.\n\nLogin at: https://www.rippingbombs.com\nEmail: ${org.email}\n\nWelcome!\nThe Ripping Bombs Team`
          : `Hi ${org.fullName},\n\n${org.courseName} is live on Ripping Bombs! Players can now find your venue and assign their submitted drives to you — building your own local leaderboard, giving you exposure, and contributing to the global rankings. You can also submit results directly from your dashboard.\n\nLogin at: https://www.rippingbombs.com\nEmail: ${org.email}\n\nWelcome!\nThe Ripping Bombs Team`,
      });
    }

    if (type === 'approval') {
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: org.email,
        subject: `You're approved on Ripping Bombs!`,
        text: `Hi ${org.fullName},\n\nGreat news — ${org.courseName} has been approved on Ripping Bombs!\n\nYou can now log in and start submitting your longest drive competition results.\n\nLogin at: https://www.rippingbombs.com\nEmail: ${org.email}\n\nWelcome!\nThe Ripping Bombs Team`,
      });
    }

    if (type === 'player_notice' && entry && entry.player_email) {
      const distYds = entry.dist;
      const distM = Math.round(distYds * 0.9144);
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: entry.player_email,
        subject: `You're on the Ripping Bombs leaderboard!`,
        text: `Hi ${entry.player},\n\n${org.courseName} has submitted your longest drive to Ripping Bombs, the global longest-drive leaderboard.\n\nDistance: ${distYds} yds (${distM} m)\nClub: ${entry.club}\nDate: ${entry.date}\n\nWant to claim this entry with your own free account, or would rather it wasn't public? Just reply to this email or contact team@rippingbombs.com and we'll sort it out.\n\nView the leaderboard: https://www.rippingbombs.com/leaderboard\n\nThe Ripping Bombs Team`,
      });
    }

    if (type === 'contact') {
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: 'team@rippingbombs.com',
        subject: subject,
        text: message,
      });
    }

    if (type === 'forgot_password') {
      // No longer sends the real password (it's hashed and unrecoverable
      // now) — sends a freshly generated temporary password instead,
      // supplied by /api/auth/forgot-password.
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: org.email,
        subject: 'Your Ripping Bombs password has been reset',
        text: `Hi ${org.fullName},\n\nWe've reset your Ripping Bombs password. Here's a temporary one to log in with:\n\nEmail: ${org.email}\nTemporary password: ${tempPassword}\n\nWe'd recommend changing it once you're logged in.\n\nLogin at: https://www.rippingbombs.com/login\n\nIf you did not request this, please contact team@rippingbombs.com immediately.\n\nThe Ripping Bombs Team`,
      });
    }

    if (type === 'submission') {
      const distYds = entry.dist;
      const distM = Math.round(distYds * 0.9144);
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: org.email,
        subject: `Your drive is on the board! 🏌️`,
        text: `Hi ${org.fullName},\n\nYour drive has been submitted to the Ripping Bombs World Registry!\n\nPlayer: ${entry.player}\nDistance: ${distYds} yds (${distM} m)\nClub: ${entry.club}\nHandicap: ${entry.hcp}\nDate: ${entry.date}${entry.tournament ? `\nEvent: ${entry.tournament}` : ''}\n\nCheck the weekly leaderboard to see how you rank against golfers worldwide.\n\nView leaderboard: https://www.rippingbombs.com/leaderboard\n\nThe Ripping Bombs Team`,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
