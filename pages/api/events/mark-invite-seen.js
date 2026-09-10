import { markInviteSeen } from '../../../lib/eventsAdmin';

// Place at: pages/api/events/mark-invite-seen.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { participantId } = req.body;

  // TODO: verify participantId belongs to the currently-authenticated player.

  try {
    await markInviteSeen(participantId);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
