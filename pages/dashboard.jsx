import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import PlayerAvatar from '../components/PlayerAvatar';
import AvatarUploader from '../components/AvatarUploader';

const ORG = '#FF0090';
const TXT = '#f0f0f0';
const MUT = '#888';
const BG2 = '#161616';
const BG3 = '#1e1e1e';
const BDR = '#2a2a2a';
const DIM = '#555';

// Global averages by category (yards) — used for vs-average comparisons
const GLOBAL_AVGS = {
  male_open:      245,
  male_high_hcp:  210,
  female_open:    185,
  female_high_hcp:165,
  senior:         215,
  youth:          200,
};

const avg = (arr) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;
const fmt = (n) => n == null ? '—' : `${n} yds`;
const fmtDate = (str) => str ? new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function getCategory(entry) {
  const age = Number(entry.age);
  const hcp = Number(entry.hcp);
  const gender = (entry.gender || '').toLowerCase();
  if (age < 16) return 'youth';
  if (age >= 55) return 'senior';
  if (gender === 'female') return hcp >= 20 ? 'female_high_hcp' : 'female_open';
  return hcp >= 20 ? 'male_high_hcp' : 'male_open';
}

function getCategoryLabel(cat) {
  return {
    male_open: 'Men (Open)',
    male_high_hcp: 'Men High Handicap',
    female_open: 'Women (Open)',
    female_high_hcp: 'Women High Handicap',
    senior: 'Seniors',
    youth: 'Youth',
  }[cat] || 'All';
}

// ——— Components ———

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: accent ? ORG : TXT }}>{value}</span>
      <span style={{ fontSize: '0.7rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      {sub && <span style={{ fontSize: '0.72rem', color: ORG, marginTop: 2 }}>{sub}</span>}
    </div>
  );
}

function FoundingBadge() {
  return (
    <span title="One of the first 50 members to join Ripping Bombs" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #78350f, #92400e)', color: '#fbbf24', border: '1px solid #b45309', borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: 'help' }}>
      ★ Founding Member
    </span>
  );
}

function ProfileModal({ club, onSave, onClose, onAvatarUploaded }) {
  const [form, setForm] = useState({
    fullName: club?.fullName || '',
    location: club?.location || '',
    position: club?.position || '',
    instagram: club?.instagram || '',
    tiktok: club?.tiktok || '',
    twitter: club?.twitter || '',
    youtube: club?.youtube || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSave = async () => { setSaving(true); await onSave(form); setSaving(false); };
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: BG3, border: `1px solid ${BDR}`, borderRadius: 6, padding: '0.6rem 0.8rem', color: TXT, fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { fontSize: '0.72rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8, display: 'block' };
  const isSimulator = club?.accountType === 'simulator';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Edit Profile</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <PlayerAvatar fullName={club?.fullName} avatarUrl={club?.avatarUrl} size={56} />
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Profile Photo</div>
            <AvatarUploader orgId={club?.id} onUploadSuccess={onAvatarUploaded} />
          </div>
        </div>

        <label style={labelStyle}>Full Name</label>
        <input style={inputStyle} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Your name" />
        <label style={labelStyle}>Location</label>
        <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
        <label style={labelStyle}>Position / Role</label>
        <input style={inputStyle} value={form.position} onChange={(e) => set('position', e.target.value)} placeholder="e.g. Club Manager" />
        {isSimulator && (
          <>
            <div style={{ borderTop: `1px solid ${BDR}`, marginTop: 8, paddingTop: 12 }}>
              <div style={{ fontSize: '0.7rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Social Media <span style={{ color: DIM, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — shown on your public profile)</span></div>
            </div>
            <label style={labelStyle}>📸 Instagram handle</label>
            <input style={inputStyle} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@yourusername" />
            <label style={labelStyle}>🎵 TikTok handle</label>
            <input style={inputStyle} value={form.tiktok} onChange={(e) => set('tiktok', e.target.value)} placeholder="@yourusername" />
            <label style={labelStyle}>𝕏 X / Twitter handle</label>
            <input style={inputStyle} value={form.twitter} onChange={(e) => set('twitter', e.target.value)} placeholder="@yourusername" />
            <label style={labelStyle}>▶ YouTube handle</label>
            <input style={inputStyle} value={form.youtube} onChange={(e) => set('youtube', e.target.value)} placeholder="@yourchannel" />
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.45rem 0.9rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ background: ORG, color: '#000', fontWeight: 700, padding: '0.5rem 1.1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ club, onClose }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const confirmed = input === 'DELETE';

  const handleDelete = async () => {
    if (!confirmed) return;
    setDeleting(true);
    setError('');
    try {
      // Delete all entries first (FK constraint)
      const { error: entriesErr } = await supabase.from('entries').delete().eq('orgId', club.id);
      if (entriesErr) throw entriesErr;
      // Delete the club record
      const { error: clubErr } = await supabase.from('clubs').delete().eq('id', club.id);
      if (clubErr) throw clubErr;
      // Clear local session
      localStorage.removeItem('rb_club');
      router.replace('/');
    } catch (err) {
      setError('Something went wrong. Please try again or contact team@rippingbombs.com');
      setDeleting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: BG2, border: '1px solid rgba(239,68,68,0.4)', borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 420 }}>
        <div style={{ fontSize: '1.3rem', marginBottom: 8 }}>⚠️</div>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>Delete Account</h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: MUT, lineHeight: 1.6 }}>
          This will permanently delete your account and <strong style={{ color: TXT }}>all {club?.accountType === 'simulator' ? 'drives and your public profile page' : 'submitted drives'}</strong>.
          This action cannot be undone.
        </p>
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.6 }}>
          Type <strong>DELETE</strong> to confirm
        </div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type DELETE here"
          autoFocus
          style={{ width: '100%', boxSizing: 'border-box', background: BG3, border: `1px solid ${confirmed ? '#f87171' : BDR}`, borderRadius: 6, padding: '0.6rem 0.8rem', color: TXT, fontSize: '0.9rem', outline: 'none', marginBottom: 12, fontFamily: 'monospace', letterSpacing: 1 }}
        />
        {error && <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#f87171' }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} disabled={deleting} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.45rem 0.9rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Cancel</button>
          <button onClick={handleDelete} disabled={!confirmed || deleting} style={{ background: confirmed ? '#dc2626' : BG3, color: confirmed ? '#fff' : DIM, fontWeight: 700, padding: '0.5rem 1.1rem', borderRadius: 6, border: `1px solid ${confirmed ? '#dc2626' : BDR}`, cursor: confirmed ? 'pointer' : 'not-allowed', fontSize: '0.85rem', opacity: deleting ? 0.6 : 1, transition: 'all .15s' }}>
            {deleting ? 'Deleting…' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Distance bar — shows your best vs global average
function VsAverageBar({ myBest, globalAvg, label }) {
  if (!myBest || !globalAvg) return null;
  const diff = myBest - globalAvg;
  const ahead = diff >= 0;
  const maxVal = Math.max(myBest, globalAvg) * 1.15;
  const myPct = Math.round((myBest / maxVal) * 100);
  const avgPct = Math.round((globalAvg / maxVal) * 100);
  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: '0.75rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.07em' }}>vs Global Average · {label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: ahead ? ORG : '#f87171' }}>
          {ahead ? '+' : ''}{diff} yds {ahead ? 'ahead' : 'behind'}
        </span>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.72rem', color: TXT, fontWeight: 600 }}>Your best</span>
          <span style={{ fontSize: '0.72rem', color: ORG, fontWeight: 700 }}>{myBest} yds</span>
        </div>
        <div style={{ background: BG3, borderRadius: 4, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${myPct}%`, height: '100%', background: ORG, borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.72rem', color: MUT }}>Global average</span>
          <span style={{ fontSize: '0.72rem', color: MUT }}>{globalAvg} yds</span>
        </div>
        <div style={{ background: BG3, borderRadius: 4, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${avgPct}%`, height: '100%', background: BDR, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

// Submit CTA banner
function SubmitCTA({ isSimulator, lastDriveDate }) {
  const daysSince = lastDriveDate ? Math.floor((Date.now() - new Date(lastDriveDate)) / 86400000) : null;
  const msg = daysSince === null
    ? "You haven't submitted a drive yet — get on the board!"
    : daysSince > 14
    ? `It's been ${daysSince} days since your last submission. Time to rip another one?`
    : "Keep the momentum going — submit your next drive.";
  return (
    <div style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 10, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.95rem', color: TXT }}>🏌️ Ready to rip?</p>
        <p style={{ margin: 0, fontSize: '0.82rem', color: MUT }}>{msg}</p>
      </div>
      <a href="/submit" style={{ background: ORG, color: '#000', fontWeight: 700, fontSize: '0.85rem', padding: '0.55rem 1.2rem', borderRadius: 7, textDecoration: 'none', whiteSpace: 'nowrap' }}>
        + Submit a Drive
      </a>
    </div>
  );
}

// Per-player breakdown table (for club accounts)
function PlayerBreakdown({ entries }) {
  const players = {};
  entries.forEach((e) => {
    if (!players[e.player]) players[e.player] = [];
    players[e.player].push(Number(e.dist));
  });
  const rows = Object.entries(players)
    .map(([name, dists]) => ({ name, best: Math.max(...dists), avg: avg(dists), count: dists.length }))
    .sort((a, b) => b.best - a.best);

  if (rows.length === 0) return null;
  const topBest = rows[0].best;

  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${BDR}` }}>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Player Breakdown</h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ background: BG3, borderBottom: `1px solid ${BDR}` }}>
              {['Player', 'Best Drive', 'Avg Drive', 'Submissions', ''].map((h) => (
                <th key={h} style={{ padding: '0.6rem 1.1rem', textAlign: 'left', fontSize: '0.68rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const barPct = Math.round((r.best / topBest) * 100);
              return (
                <tr key={r.name} style={{ borderBottom: `1px solid ${BDR}` }}>
                  <td style={{ padding: '0.85rem 1.1rem', fontWeight: 600, fontSize: '0.88rem', color: TXT }}>{r.name}</td>
                  <td style={{ padding: '0.85rem 1.1rem', fontWeight: 700, color: i === 0 ? ORG : TXT, fontSize: '0.9rem' }}>{r.best} yds</td>
                  <td style={{ padding: '0.85rem 1.1rem', color: MUT, fontSize: '0.85rem' }}>{r.avg} yds</td>
                  <td style={{ padding: '0.85rem 1.1rem', color: MUT, fontSize: '0.85rem' }}>{r.count}</td>
                  <td style={{ padding: '0.85rem 1.1rem', minWidth: 120 }}>
                    <div style={{ background: BG3, borderRadius: 3, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${barPct}%`, height: '100%', background: i === 0 ? ORG : BDR, borderRadius: 3 }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Recent drives table
function DriveHistory({ entries }) {
  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: `1px solid ${BDR}` }}>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>All Submitted Drives</h2>
        <a href="/submit" style={{ background: ORG, color: '#000', fontWeight: 700, fontSize: '0.78rem', padding: '0.38rem 0.85rem', borderRadius: 6, textDecoration: 'none' }}>+ Submit Drive</a>
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: MUT }}>
          <p style={{ marginBottom: '1rem' }}>No drives submitted yet.</p>
          <a href="/submit" style={{ background: ORG, color: '#000', fontWeight: 700, padding: '0.55rem 1.25rem', borderRadius: 7, textDecoration: 'none', fontSize: '0.9rem' }}>Submit your first drive →</a>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ background: BG3, borderBottom: `1px solid ${BDR}` }}>
                {['#', 'Distance', 'Player', 'Club Used', 'HCP', 'Date', 'Category'].map((h) => (
                  <th key={h} style={{ padding: '0.55rem 1rem', textAlign: 'left', fontSize: '0.68rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < entries.length - 1 ? `1px solid ${BDR}` : 'none' }}
                  onMouseEnter={(el) => el.currentTarget.style.background = 'rgba(163,230,53,0.03)'}
                  onMouseLeave={(el) => el.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.8rem 1rem', color: DIM, fontSize: '0.78rem' }}>#{i + 1}</td>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: i === 0 ? ORG : TXT, fontSize: '0.9rem' }}>{Number(e.dist)} yds</td>
                  <td style={{ padding: '0.8rem 1rem', color: MUT, fontSize: '0.85rem' }}>{e.player}</td>
                  <td style={{ padding: '0.8rem 1rem', color: MUT, fontSize: '0.82rem' }}>{e.club || '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', color: MUT, fontSize: '0.82rem' }}>{e.hcp ?? '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', color: MUT, fontSize: '0.8rem' }}>{fmtDate(e.date)}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span style={{ background: BG3, border: `1px solid ${BDR}`, borderRadius: 20, padding: '2px 8px', fontSize: '0.68rem', color: MUT, whiteSpace: 'nowrap' }}>
                      {getCategoryLabel(getCategory(e))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ——— Main Page ———

export default function DashboardPage() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [entries, setEntries] = useState([]);
  const [rank, setRank] = useState(null);
  const [totalClubs, setTotalClubs] = useState(null);
  const [globalAvgBest, setGlobalAvgBest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const raw = typeof window !== 'undefined' && localStorage.getItem('rb_club');
    if (!raw) { router.replace('/login'); return; }
    let parsed;
    try { parsed = JSON.parse(raw); } catch { router.replace('/login'); return; }
    loadData(parsed);
  }, []);

  const loadData = async (clubData) => {
    setLoading(true);

    const { data: freshClub } = await supabase.from('clubs').select('*').eq('id', clubData.id).single();
    setClub(freshClub || clubData);

    const { data: clubEntries } = await supabase.from('entries').select('*').eq('orgId', clubData.id);
    const sorted = (clubEntries || []).sort((a, b) => Number(b.dist) - Number(a.dist));
    setEntries(sorted);

    // Global rank + avg
    const { data: allEntries } = await supabase.from('entries').select('orgId, dist');
    if (allEntries && sorted.length > 0) {
      const myBest = Number(sorted[0].dist);
      const bestPerClub = {};
      allEntries.forEach((e) => {
        const d = Number(e.dist);
        if (!bestPerClub[e.orgId] || d > bestPerClub[e.orgId]) bestPerClub[e.orgId] = d;
      });
      const allBests = Object.values(bestPerClub);
      const beatenBy = Object.entries(bestPerClub).filter(([id, d]) => id !== clubData.id && d > myBest).length;
      setRank(beatenBy + 1);
      setTotalClubs(allBests.length);
      setGlobalAvgBest(avg(allBests));
    }

    setLoading(false);
  };

  const handleAvatarUploaded = (avatarUrl) => {
    const updated = { ...club, avatarUrl };
    setClub(updated);
    localStorage.setItem('rb_club', JSON.stringify(updated));
  };

  const handleProfileSave = async (form) => {
    const { error } = await supabase.from('clubs').update({
      fullName: form.fullName,
      location: form.location,
      position: form.position,
      instagram: form.instagram || null,
      tiktok: form.tiktok || null,
      twitter: form.twitter || null,
      youtube: form.youtube || null,
    }).eq('id', club.id);
    if (!error) {
      const updated = { ...club, ...form };
      setClub(updated);
      localStorage.setItem('rb_club', JSON.stringify(updated));
      setShowModal(false);
    }
  };

  const distances = entries.map((e) => Number(e.dist));
  const longest = distances[0] ?? null;
  const average = avg(distances);
  const totalDrives = entries.length;
  const lastDriveDate = entries.length > 0 ? entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null;

  // Best entry's category for vs-average comparison
  const bestEntry = entries[0] || null;
  const bestCategory = bestEntry ? getCategory(bestEntry) : null;
  const globalCatAvg = bestCategory ? GLOBAL_AVGS[bestCategory] : null;

  // Rank percentile label
  const percentile = rank && totalClubs ? Math.round((1 - (rank - 1) / totalClubs) * 100) : null;
  const rankSub = percentile != null ? `Top ${percentile}% globally` : null;

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUT }}>
          Loading your dashboard…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{club?.courseName || 'Dashboard'} — Ripping Bombs</title>
      </Head>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', color: TXT, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
            <PlayerAvatar fullName={club?.fullName} avatarUrl={club?.avatarUrl} size={56} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {club?.courseName || club?.fullName || 'My Dashboard'}
                </h1>
                {club?.is_founding_member && <FoundingBadge />}
                {club?.badge === 'simulator' && (
                  <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Simulator</span>
                )}
              </div>
              <p style={{ margin: 0, color: MUT, fontSize: '0.85rem' }}>
                {[club?.fullName, club?.position, club?.location].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/leaderboard" style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.5rem 1rem', borderRadius: 7, fontSize: '0.82rem', textDecoration: 'none' }}>View Leaderboard</a>
            <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.5rem 1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem' }}>Edit Profile</button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          <StatCard label="Longest Drive" value={fmt(longest)} accent />
          <StatCard label="Average Drive" value={fmt(average)} />
          <StatCard label="Total Drives" value={totalDrives || '—'} />
          <StatCard label="Global Rank" value={rank ? `#${rank}` : '—'} sub={rankSub} />
          {globalAvgBest && <StatCard label="Global Avg Best" value={fmt(globalAvgBest)} />}
        </div>

        {/* vs global average bar */}
        {longest && globalCatAvg && (
          <VsAverageBar myBest={longest} globalAvg={globalCatAvg} label={getCategoryLabel(bestCategory)} />
        )}

        {/* vs all-club average */}
        {longest && globalAvgBest && globalAvgBest !== globalCatAvg && (
          <VsAverageBar myBest={longest} globalAvg={globalAvgBest} label="All Clubs on Platform" />
        )}

        {/* Submit CTA */}
        <SubmitCTA isSimulator={club?.badge === 'simulator'} lastDriveDate={lastDriveDate} />

        {/* Player breakdown (club accounts with multiple players) */}
        {club?.accountType === 'club' && entries.length > 0 && (
          <PlayerBreakdown entries={entries} />
        )}

        {/* Drive history */}
        <DriveHistory entries={entries} />

        {/* Danger Zone */}
        <div style={{ border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '1.25rem 1.5rem' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: 700, color: '#f87171' }}>Danger Zone</h2>
          <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: MUT, lineHeight: 1.6 }}>
            Permanently delete your account and all associated data.
            {club?.accountType === 'simulator' && ' Your public profile page will also be removed.'}{' '}
            This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', fontWeight: 600, padding: '0.5rem 1.1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', letterSpacing: 0.3 }}>
            Delete Account →
          </button>
        </div>

      </div>

      {showModal && (
        <ProfileModal club={club} onSave={handleProfileSave} onClose={() => setShowModal(false)} onAvatarUploaded={handleAvatarUploaded} />
      )}
      {showDeleteModal && (
        <DeleteModal club={club} onClose={() => setShowDeleteModal(false)} />
      )}
    </Layout>
  );
}
