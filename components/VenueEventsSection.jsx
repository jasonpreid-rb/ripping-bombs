import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabaseClient';
import { createEvent, updateEvent, inviteParticipants, searchPlayers, invitePlayerById } from '../lib/events';

const ORG = '#FF0090';
const TXT = '#f0f0f0';
const MUT = '#888';
const BG2 = '#161616';
const BG3 = '#1e1e1e';
const BDR = '#2a2a2a';
const DIM = '#555';

const inputStyle = { width: '100%', boxSizing: 'border-box', background: BG3, border: `1px solid ${BDR}`, borderRadius: 6, padding: '0.6rem 0.8rem', color: TXT, fontSize: '0.9rem', outline: 'none' };
const labelStyle = { fontSize: '0.72rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8, display: 'block' };
const fmtDate = (str) => str ? new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status }) {
  const map = {
    draft:     { bg: 'rgba(136,136,136,0.15)', color: MUT,  label: 'Draft' },
    active:    { bg: 'rgba(255,0,144,0.15)',   color: ORG,  label: 'Active' },
    ended:     { bg: 'rgba(136,136,136,0.15)', color: MUT,  label: 'Ended' },
    cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'Cancelled' },
  };
  const s = map[status] || map.draft;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</span>;
}

// Shown once an event exists — the shareable link, QR code, and an invite box.
function EventShareCard({ event }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [emails, setEmails] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const debounceRef = useRef(null);
  const url = `https://rippingbombs.com/e/${event.slug}`;

  useEffect(() => {
    supabase.from('event_participants').select('orgId').eq('eventId', event.id).then(({ data }) => {
      setInvitedIds(new Set((data || []).map(r => r.orgId)));
    });
  }, [event.id]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchPlayers(query));
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const genQr = async () => {
    const dataUrl = await QRCode.toDataURL(url, { width: 480, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
    setQrDataUrl(dataUrl);
  };

  const handleInviteById = async (player) => {
    setInvitingId(player.id);
    try {
      await invitePlayerById(event.id, player.id);
      setInvitedIds(prev => new Set(prev).add(player.id));
    } catch {
      setInviteMsg(`Could not invite ${player.fullName} — try again.`);
    }
    setInvitingId(null);
  };

  const handleInvite = async () => {
    setInviting(true);
    setInviteMsg('');
    try {
      const list = emails.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
      const { invited, notFound } = await inviteParticipants(event.id, list);
      setInviteMsg(
        `${invited} invited.` + (notFound.length ? ` No account found for: ${notFound.join(', ')}` : '')
      );
      setEmails('');
    } catch (e) {
      setInviteMsg('Something went wrong sending invites.');
    }
    setInviting(false);
  };

  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: '1rem', marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <a href={url} target="_blank" rel="noreferrer" style={{ color: ORG, fontSize: '0.85rem', fontFamily: 'monospace' }}>{url}</a>
        <button
          onClick={() => navigator.clipboard.writeText(url)}
          style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.3rem 0.7rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}
        >
          Copy Link
        </button>
        <button
          onClick={genQr}
          style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, padding: '0.3rem 0.7rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
        >
          {qrDataUrl ? 'Regenerate QR' : 'Get QR Code'}
        </button>
      </div>

      {qrDataUrl && (
        <div style={{ marginBottom: 14 }}>
          <img src={qrDataUrl} alt="Event QR code" style={{ width: 160, height: 160, borderRadius: 6 }} />
        </div>
      )}

      <label style={labelStyle}>Find A Registered Player</label>
      <input
        style={{ ...inputStyle, marginTop: 6 }}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name…"
      />
      {query.trim().length >= 2 && (
        <div style={{ marginTop: 6 }}>
          {searching ? (
            <div style={{ fontSize: '0.75rem', color: DIM, padding: '6px 0' }}>Searching…</div>
          ) : results.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: DIM, padding: '6px 0' }}>No matching players found.</div>
          ) : (
            results.map(p => {
              const already = invitedIds.has(p.id);
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${BDR}` }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: TXT }}>{p.fullName}</div>
                    {p.location && <div style={{ fontSize: '0.7rem', color: DIM }}>{p.location}</div>}
                  </div>
                  <button
                    onClick={() => handleInviteById(p)}
                    disabled={already || invitingId === p.id}
                    style={{ background: 'transparent', border: `1px solid ${already ? BDR : ORG}`, color: already ? DIM : ORG, padding: '0.3rem 0.7rem', borderRadius: 6, cursor: already ? 'default' : 'pointer', fontSize: '0.72rem', fontWeight: 700, opacity: invitingId === p.id ? 0.6 : 1 }}
                  >
                    {already ? 'Invited' : invitingId === p.id ? 'Inviting…' : 'Invite'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      <label style={{ ...labelStyle, marginTop: 18 }}>Or Invite By Email</label>
      <textarea
        value={emails}
        onChange={e => setEmails(e.target.value)}
        placeholder="One email per line, or comma-separated"
        rows={3}
        style={{ ...inputStyle, resize: 'vertical', marginTop: 6 }}
      />
      <div style={{ fontSize: '0.7rem', color: DIM, marginTop: 4, marginBottom: 8 }}>
        Only works for players who already have a Ripping Bombs account — otherwise, just share the link or QR code.
      </div>
      <button
        onClick={handleInvite}
        disabled={inviting || !emails.trim()}
        style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.5rem 1rem', borderRadius: 6, cursor: inviting ? 'default' : 'pointer', fontSize: '0.8rem', opacity: inviting || !emails.trim() ? 0.5 : 1 }}
      >
        {inviting ? 'Sending…' : 'Send Invites'}
      </button>
      {inviteMsg && <div style={{ fontSize: '0.75rem', color: MUT, marginTop: 8 }}>{inviteMsg}</div>}
    </div>
  );
}

function EventRow({ event, onSelect, isSelected }) {
  return (
    <div
      onClick={onSelect}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: isSelected ? 'rgba(255,0,144,0.06)' : BG2, border: `1px solid ${isSelected ? ORG : BDR}`, borderRadius: 8, cursor: 'pointer', marginBottom: 8 }}
    >
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: TXT }}>{event.name}</div>
        <div style={{ fontSize: '0.72rem', color: MUT, marginTop: 2 }}>{fmtDate(event.startAt)} – {fmtDate(event.endAt)}</div>
      </div>
      <StatusBadge status={event.status} />
    </div>
  );
}

function CreateEventForm({ venueId, onCreated, onCancel }) {
  const [form, setForm] = useState({
    name: '', description: '', startAt: '', endAt: '',
    minAge: '', maxAge: '', gender: 'any',
    sponsorName: '', sponsorLogoUrl: '', brandColor: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name || !form.startAt || !form.endAt) { setError('Name, start date and end date are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const event = await createEvent(venueId, {
        name: form.name,
        description: form.description || null,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        minAge: form.minAge ? Number(form.minAge) : null,
        maxAge: form.maxAge ? Number(form.maxAge) : null,
        gender: form.gender,
        sponsorName: form.sponsorName || null,
        sponsorLogoUrl: form.sponsorLogoUrl || null,
        brandColor: form.brandColor || null,
      });
      onCreated(event);
    } catch (e) {
      setError('Could not create the event — try again.');
    }
    setSaving(false);
  };

  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: '1rem', marginBottom: 14 }}>
      <label style={labelStyle}>Event Name</label>
      <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ingolstadt Youth Long Drive" />

      <label style={labelStyle}>Description (optional)</label>
      <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.description} onChange={e => set('description', e.target.value)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Date & Time</label>
          <input style={inputStyle} type="datetime-local" value={form.startAt} onChange={e => set('startAt', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>End Date & Time</label>
          <input style={inputStyle} type="datetime-local" value={form.endAt} onChange={e => set('endAt', e.target.value)} />
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: ORG, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 16 }}>Entry Criteria (optional)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Min Age</label>
          <input style={inputStyle} type="number" value={form.minAge} onChange={e => set('minAge', e.target.value)} placeholder="e.g. 8" />
        </div>
        <div>
          <label style={labelStyle}>Max Age</label>
          <input style={inputStyle} type="number" value={form.maxAge} onChange={e => set('maxAge', e.target.value)} placeholder="e.g. 17" />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select style={inputStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: ORG, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 16 }}>Branding / Sponsor (optional)</div>
      <label style={labelStyle}>Sponsor Name</label>
      <input style={inputStyle} value={form.sponsorName} onChange={e => set('sponsorName', e.target.value)} placeholder="e.g. Krank Golf" />
      <label style={labelStyle}>Sponsor Logo URL</label>
      <input style={inputStyle} value={form.sponsorLogoUrl} onChange={e => set('sponsorLogoUrl', e.target.value)} placeholder="https://..." />

      {error && <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: 10 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={onCancel} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: MUT, padding: '0.5rem 1.1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Cancel</button>
        <button onClick={handleCreate} disabled={saving} style={{ background: ORG, border: 'none', color: '#000', fontWeight: 700, padding: '0.5rem 1.1rem', borderRadius: 6, cursor: saving ? 'default' : 'pointer', fontSize: '0.82rem', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Creating…' : 'Create Event →'}
        </button>
      </div>
    </div>
  );
}

// Top-level section — rendered on the venue dashboard, club accounts only.
// Props: venueId, initialEvents ({ current, previous }) fetched by the parent.
export default function VenueEventsSection({ venueId, initialEvents }) {
  const [events, setEvents] = useState(initialEvents || { current: [], previous: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('current');

  const handleCreated = (event) => {
    setEvents(e => ({ ...e, current: [event, ...e.current] }));
    setShowCreate(false);
    setSelected(event);
  };

  const list = tab === 'current' ? events.current : events.previous;

  return (
    <div style={{ border: `1px solid ${BDR}`, borderRadius: 10, padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: TXT }}>Your Events & Competitions</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: MUT }}>Included in your TV Display & Sponsors subscription</p>
        </div>
        <button
          onClick={() => setShowCreate(s => !s)}
          style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, padding: '0.5rem 1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
        >
          {showCreate ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {showCreate && (
        <CreateEventForm venueId={venueId} onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['current', 'previous'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? ORG : 'transparent'}`, color: tab === t ? TXT : MUT, padding: '4px 2px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}
          >
            {t} ({t === 'current' ? events.current.length : events.previous.length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ fontSize: '0.82rem', color: DIM, padding: '1rem 0' }}>
          {tab === 'current' ? 'No events yet — create one to get a shareable link and QR code.' : 'No past events.'}
        </div>
      ) : (
        list.map(event => (
          <div key={event.id}>
            <EventRow event={event} isSelected={selected?.id === event.id} onSelect={() => setSelected(selected?.id === event.id ? null : event)} />
            {selected?.id === event.id && <EventShareCard event={event} />}
          </div>
        ))
      )}
    </div>
  );
}
