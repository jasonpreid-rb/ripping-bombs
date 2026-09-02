import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { TXT, MUT, ORG, BG3, BDR, DIM, SANS, DISP } from '../../lib/constants';
import { Card, Btn } from '../../components/UI';
import { getEventBySlug, checkEligibility, joinEvent } from '../../lib/events';

const fmtDateTime = (str) => str
  ? new Date(str).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

function CriteriaBadges({ event }) {
  const badges = [];
  if (event.gender && event.gender !== 'any') badges.push(event.gender === 'male' ? 'Men' : 'Women');
  if (event.minAge != null || event.maxAge != null) {
    if (event.minAge != null && event.maxAge != null) badges.push(`Ages ${event.minAge}–${event.maxAge}`);
    else if (event.minAge != null) badges.push(`Ages ${event.minAge}+`);
    else badges.push(`Up to age ${event.maxAge}`);
  }
  if (!badges.length) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {badges.map(b => (
        <span key={b} style={{ background: 'rgba(255,0,144,0.12)', color: ORG, border: `1px solid ${ORG}`, borderRadius: 20, padding: '3px 10px', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: .3 }}>{b}</span>
      ))}
    </div>
  );
}

function getLoggedOrg() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('rb_club');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export default function EventPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [state, setState] = useState(null); // { event, venue, participants, entries }
  const [tab, setTab] = useState('entrants');
  const [joinMsg, setJoinMsg] = useState('');
  const [joining, setJoining] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getEventBySlug(slug).then(result => {
      if (!result) { setNotFound(true); return; }
      setState(result);
    });
  }, [slug]);

  if (notFound) {
    return (
      <div style={{ padding: '80px 18px', textAlign: 'center' }}>
        <div style={{ fontFamily: DISP, fontSize: 26, color: TXT, marginBottom: 10 }}>Event Not Found</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT }}>This event link may have expired or been removed.</div>
      </div>
    );
  }

  if (!state) return null;
  const { event, venue, participants, entries } = state;

  const handleJoin = async () => {
    const org = getLoggedOrg();
    if (!org) {
      router.push(`/register?redirect=${encodeURIComponent(`/e/${slug}`)}`);
      return;
    }
    setJoining(true);
    setJoinMsg('');
    try {
      const result = await joinEvent(event.id, org);
      if (result.ok) {
        router.push(`/submit?event=${slug}`);
      } else {
        setJoinMsg(result.reason);
      }
    } catch {
      setJoinMsg('Something went wrong — try again.');
    }
    setJoining(false);
  };

  const joined = participants.filter(p => p.status === 'joined' || p.status === 'invited');
  const sortedEntries = entries.slice().sort((a, b) => Number(b.dist) - Number(a.dist));

  return (
    <>
      <Head>
        <title>{event.name} | Ripping Bombs</title>
        <meta name="description" content={event.description || `${event.name} — hosted by ${venue?.courseName || 'a Ripping Bombs venue'}.`} />
      </Head>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 18px 80px' }}>
        {event.sponsorLogoUrl && (
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <img src={event.sponsorLogoUrl} alt={event.sponsorName || 'Sponsor'} style={{ maxHeight: 56, maxWidth: '80%', objectFit: 'contain' }} />
            {event.sponsorName && <div style={{ fontFamily: SANS, fontSize: 10, color: DIM, marginTop: 4, textTransform: 'uppercase', letterSpacing: .8 }}>Sponsored by {event.sponsorName}</div>}
          </div>
        )}

        <div style={{ fontFamily: DISP, fontSize: 30, color: TXT, letterSpacing: 1, textAlign: 'center', marginBottom: 4 }}>{event.name}</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, textAlign: 'center' }}>
          {venue?.courseName}{venue?.location ? ` · ${venue.location}` : ''}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, textAlign: 'center', marginTop: 6 }}>
          {fmtDateTime(event.startAt)} — {fmtDateTime(event.endAt)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CriteriaBadges event={event} />
        </div>

        {event.description && (
          <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.6, textAlign: 'center', margin: '18px 0' }}>{event.description}</div>
        )}

        <div style={{ margin: '22px 0' }}>
          <Btn full onClick={handleJoin}>
            {joining ? 'Joining…' : 'Join & Submit Your Drive →'}
          </Btn>
          {joinMsg && <div style={{ fontFamily: SANS, fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: 8 }}>{joinMsg}</div>}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, borderBottom: `1px solid ${BDR}` }}>
          {['entrants', 'leaderboard'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? ORG : 'transparent'}`, color: tab === t ? TXT : MUT, padding: '8px 4px', cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}
            >
              {t === 'entrants' ? `Who's Competing (${joined.length})` : `Leaderboard (${sortedEntries.length})`}
            </button>
          ))}
        </div>

        {tab === 'entrants' ? (
          joined.length === 0 ? (
            <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, textAlign: 'center', padding: '30px 0' }}>No one has joined yet — be the first!</div>
          ) : (
            <Card>
              {joined.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${BDR}` }}>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: TXT }}>{p.clubs?.fullName || 'Player'}</span>
                  {p.status === 'invited' && <span style={{ fontFamily: SANS, fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: .5 }}>Invited</span>}
                </div>
              ))}
            </Card>
          )
        ) : (
          sortedEntries.length === 0 ? (
            <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, textAlign: 'center', padding: '30px 0' }}>No drives submitted yet.</div>
          ) : (
            <Card>
              {sortedEntries.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${BDR}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: DISP, fontSize: 16, color: i === 0 ? ORG : DIM, width: 28 }}>#{i + 1}</span>
                    <span style={{ fontFamily: SANS, fontSize: 14, color: TXT }}>{e.player}</span>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: TXT }}>{e.dist} yds</span>
                </div>
              ))}
            </Card>
          )
        )}
      </div>
    </>
  );
}
