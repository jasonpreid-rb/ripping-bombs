import { updateEvent } from '../../../lib/eventsAdmin';

// Place at: pages/api/events/update.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { eventId, fields } = req.body;

  // TODO: verify the requester actually owns the venue this event
  // belongs to before trusting the update.

  try {
    const event = await updateEvent(eventId, fields);
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
