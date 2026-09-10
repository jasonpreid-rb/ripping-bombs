import { invitePlayerById } from '../../../lib/eventsAdmin';

// Place at: pages/api/events/invite-player.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { eventId, orgId } = req.body;

  // TODO: verify the requester owns the venue hosting this event.

  try {
    await invitePlayerById(eventId, orgId);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
