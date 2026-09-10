import { joinEvent } from '../../../lib/eventsAdmin';

// Place at: pages/api/events/join.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { eventId, org } = req.body;

  // TODO: verify org is really the currently-authenticated player,
  // rather than trusting whatever the client sends.

  try {
    const result = await joinEvent(eventId, org);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
