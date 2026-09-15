import { joinEvent } from '../../../lib/eventsAdmin';
import { supabase } from '../../../lib/supabaseClient';
import { getEventStatus } from '../../../lib/events';

// Place at: pages/api/events/join.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { eventId, org } = req.body;

  // TODO: verify org is really the currently-authenticated player,
  // rather than trusting whatever the client sends.

  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('startAt, endAt')
      .eq('id', eventId)
      .single();
    if (error || !event) return res.status(404).json({ error: 'Event not found' });

    const status = getEventStatus(event);
    if (status !== 'active') {
      return res.status(200).json({
        ok: false,
        reason: status === 'upcoming' ? 'This event has not started yet.' : 'This event has ended.',
      });
    }

    const result = await joinEvent(eventId, org);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
