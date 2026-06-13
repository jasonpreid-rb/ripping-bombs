import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, org, entry, subject, message } = req.body;

  try {
    if (type === 'registration') {
      // Notify team@rippingbombs.com of new registration
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: 'team@rippingbombs.com',
        subject: `New Registration: ${org.courseName}`,
        text: `New registration request on Ripping Bombs:\n\nCourse: ${org.courseName}\nFull Name: ${org.fullName || '—'}\nPosition: ${org.position || '—'}\nLocation: ${org.location}\nCountry: ${org.country || '—'}\nEmail: ${org.email}\nPassword: ${org.pw}\n\nLogin to approve:\nhttps://www.rippingbombs.com`,
      });

      // Welcome email to the registrant
      const isSimulator = org.accountType === 'simulator';
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: org.email,
        subject: isSimulator ? 'Welcome to Ripping Bombs!' : 'Registration received — Ripping Bombs',
        text: isSimulator
          ? `Hi ${org.fullName},\n\nYour simulator account is live! You can now log in and start submitting your longest drives to the World Registry.\n\nLogin at: https://www.rippingbombs.com\nEmail: ${org.email}\n\nWelcome!\nThe Ripping Bombs Team`
          : `Hi ${org.fullName},\n\nThanks for registering ${org.courseName} on Ripping Bombs!\n\nYour application is under review and we'll be in touch shortly once approved.\n\nLogin at: https://www.rippingbombs.com\nEmail: ${org.email}\n\nThe Ripping Bombs Team`,
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

    if (type === 'contact') {
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: 'team@rippingbombs.com',
        subject: subject,
        text: message,
      });
    }

    if (type === 'forgot_password') {
      await resend.emails.send({
        from: 'Ripping Bombs <team@rippingbombs.com>',
        to: org.email,
        subject: 'Your Ripping Bombs password',
        text: `Hi ${org.fullName},\n\nHere are your login details for Ripping Bombs:\n\nEmail: ${org.email}\nPassword: ${org.pw}\n\nLogin at: https://www.rippingbombs.com/login\n\nIf you did not request this, you can ignore this email.\n\nThe Ripping Bombs Team`,
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
