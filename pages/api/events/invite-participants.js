import { inviteParticipants } from '../../../lib/eventsAdmin';

// Place at: pages/api/events/invite-participants.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { eventId, emails } = req.body;

  // TODO: verify the requester owns the venue hosting this event.

  try {
    const result = await inviteParticipants(eventId, emails);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
