import { createEvent } from '../../../lib/eventsAdmin';

// Place at: pages/api/events/create.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { venueId, fields } = req.body;

  // TODO: verify the requester is actually authorized to create events
  // for this venueId (e.g. check their session/auth cookie against
  // venueId) before trusting the body. Without this, anyone who can
  // reach this endpoint could create events under any venue.

  try {
    const event = await createEvent(venueId, fields);
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
