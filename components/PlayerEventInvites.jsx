import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getPendingInvites, markInviteSeen } from '../lib/events';

const ORG = '#FF0090';
const TXT = '#f0f0f0';
const MUT = '#888';

const fmtDate = (str) => str ? new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// Rendered on the individual/simulator player dashboard. Shows one banner
// per event invite the player hasn't seen or dismissed yet.
export default function PlayerEventInvites({ orgId }) {
  const router = useRouter();
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    if (!orgId) return;
    getPendingInvites(orgId).then(setInvites).catch(() => {});
  }, [orgId]);

  if (!invites.length) return null;

  const dismiss = async (participantId) => {
    setInvites(prev => prev.filter(i => i.id !== participantId));
    try { await markInviteSeen(participantId); } catch {}
  };

  const view = async (invite) => {
    await dismiss(invite.id);
    router.push(`/e/${invite.events.slug}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {invites.map(invite => {
        const event = invite.events;
        if (!event) return null;
        return (
          <div
            key={invite.id}
            style={{ background: 'rgba(255,0,144,0.08)', border: `1px solid ${ORG}`, borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: ORG, marginBottom: 2 }}>
                🏆 You're invited: {event.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: MUT }}>
                {event.clubs?.courseName ? `${event.clubs.courseName} · ` : ''}Starts {fmtDate(event.startAt)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => dismiss(invite.id)}
                style={{ background: 'transparent', border: 'none', color: MUT, padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                Dismiss
              </button>
              <button
                onClick={() => view(invite)}
                style={{ background: ORG, border: 'none', color: '#000', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}
              >
                View Event →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
