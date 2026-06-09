import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import supabase from '../lib/supabaseClient';
import Layout from '../components/Layout';

// ─── Design tokens (matching constants.js) ───────────────────────────────────
const ORG = '#a3e635';
const TXT = '#f0f0f0';
const MUT = '#888';
const BG2 = '#161616';
const BG3 = '#1e1e1e';
const BDR = '#2a2a2a';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const avg = (arr) =>
  arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;

const fmt = (n) => (n == null ? '—' : `${n} yds`);

const fmtDate = (str) =>
  str
    ? new Date(str).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: BG2, border: `1px solid ${BDR}`,
      borderRadius: 10, padding: '1.25rem 1rem',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{
        fontSize: '1.7rem', fontWeight: 800,
        letterSpacing: '-0.03em', lineHeight: 1,
        color: accent ? ORG : TXT,
      }}>
        {value}
      </span>
      <span style={{ fontSize: '0.7rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Founding Badge ───────────────────────────────────────────────────────────

function FoundingBadge() {
  return (
    <span
      title="One of the first 50 members to join Ripping Bombs"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'linear-gradient(135deg, #78350f, #92400e)',
        color: '#fbbf24', border: '1px solid #b45309',
        borderRadius: 20, padding: '2px 10px',
        fontSize: '0.68rem', fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        whiteSpace: 'nowrap', cursor: 'help',
      }}
    >
      ★ Founding Member
    </span>
  );
}

// ─── Profile Edit Modal ───────────────────────────────────────────────────────

function ProfileModal({ club, onSave, onClose }) {
  const [form, setForm] = useState({
    fullName: club?.fullName || '',
    location: club?.location || '',
    position: club?.position || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: BG3, border: `1px solid ${BDR}`,
    borderRadius: 6, padding: '0.6rem 0.8rem',
    color: TXT, fontSize: '0.9rem', outline: 'none',
  };

  const labelStyle = {
    fontSize: '0.72rem', color: MUT,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginTop: 8, display: 'block',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 999, padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: BG2, border: `1px solid ${BDR}`,
          borderRadius: 14, padding: '2rem',
          width: '100%', maxWidth: 420,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Edit Profile</h2>

        <label style={labelStyle}>Full Name</label>
        <input style={inputStyle} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Your name" />

        <label style={labelStyle}>Location</label>
        <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />

        <label style={labelStyle}>Position / Role</label>
        <input style={inputStyle} value={form.position} onChange={(e) => set('position', e.target.value)} placeholder="e.g. Club Manager" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${BDR}`,
              color: TXT, padding: '0.45rem 0.9rem',
              borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: ORG, color: '#000', fontWeight: 700,
              padding: '0.5rem 1.1rem', borderRadius: 6,
              border: 'none', cursor: 'pointer', fontSize: '0.85rem',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [club, setClub]       = useState(null);
  const [entries, setEntries] = useState([]);
  const [rank, setRank]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // ── Auth: read session from localStorage (same pattern as rest of app) ──
  useEffect(() => {
    const raw = typeof window !== 'undefined' && localStorage.getItem('rb_club');
    if (!raw) { router.replace('/login'); return; }

    let parsed;
    try { parsed = JSON.parse(raw); } catch { router.replace('/login'); return; }

    loadData(parsed);
  }, []);

  const loadData = async (clubData) => {
    setLoading(true);

    // Fetch fresh club record (to get is_founding_member and latest fields)
    const { data: freshClub } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubData.id)
      .single();

    setClub(freshClub || clubData);

    // Fetch this club's entries, sort best-first
    const { data: clubEntries } = await supabase
      .from('entries')
      .select('*')
      .eq('orgId', clubData.id);

    const sorted = (clubEntries || []).sort((a, b) => Number(b.dist) - Number(a.dist));
    setEntries(sorted);

    // Global rank: how many other clubs have a better longest drive?
    if (sorted.length > 0) {
      const myBest = Number(sorted[0].dist);

      const { data: allEntries } = await supabase
        .from('entries')
        .select('orgId, dist');

      if (allEntries) {
        const bestPerClub = {};
        allEntries.forEach((e) => {
          const d = Number(e.dist);
          if (!bestPerClub[e.orgId] || d > bestPerClub[e.orgId]) {
            bestPerClub[e.orgId] = d;
          }
        });
        const beatenBy = Object.entries(bestPerClub).filter(
          ([id, d]) => id !== clubData.id && d > myBest
        ).length;
        setRank(beatenBy + 1);
      }
    }

    setLoading(false);
  };

  const handleProfileSave = async (form) => {
    const { error } = await supabase
      .from('clubs')
      .update({ fullName: form.fullName, location: form.location, position: form.position })
      .eq('id', club.id);

    if (!error) {
      const updated = { ...club, ...form };
      setClub(updated);
      localStorage.setItem('rb_club', JSON.stringify(updated));
      setShowModal(false);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const distances   = entries.map((e) => Number(e.dist));
  const longest     = distances[0] ?? null;
  const average     = avg(distances);
  const totalDrives = entries.length;

  // ── Render ─────────────────────────────────────────────────────────────────
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', color: TXT }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap',
          gap: '1rem', marginBottom: '2rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {club?.courseName || club?.fullName || 'My Dashboard'}
              </h1>
              {club?.is_founding_member && <FoundingBadge />}
            </div>
            <p style={{ margin: 0, color: MUT, fontSize: '0.85rem' }}>
              {[club?.fullName, club?.position, club?.location].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'transparent', border: `1px solid ${BDR}`,
              color: TXT, padding: '0.5rem 1rem',
              borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem',
            }}
          >
            Edit Profile
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.85rem', marginBottom: '2rem',
        }}>
          <StatCard label="Longest Drive" value={fmt(longest)} accent />
          <StatCard label="Average Drive"  value={fmt(average)} />
          <StatCard label="Total Drives"   value={totalDrives || '—'} />
          <StatCard label="Global Rank"    value={rank ? `#${rank}` : '—'} />
        </div>

        {/* ── Drive history table ── */}
        <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
          {/* Section header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', borderBottom: `1px solid ${BDR}`,
          }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Submitted Drives</h2>
            <a
              href="/submit"
              style={{
                background: ORG, color: '#000', fontWeight: 700,
                fontSize: '0.78rem', padding: '0.38rem 0.85rem',
                borderRadius: 6, textDecoration: 'none',
              }}
            >
              + Submit Drive
            </a>
          </div>

          {/* Column headers */}
          {entries.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '44px 110px 1fr 120px 1fr',
              padding: '0.55rem 1.25rem', background: BG3,
              fontSize: '0.68rem', color: MUT,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              borderBottom: `1px solid ${BDR}`,
            }}>
              <span>#</span>
              <span>Distance</span>
              <span>Player</span>
              <span>Date</span>
              <span>Club</span>
            </div>
          )}

          {/* Rows */}
          {entries.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: MUT }}>
              <p style={{ marginBottom: '1rem' }}>No drives submitted yet.</p>
              <a
                href="/submit"
                style={{
                  background: ORG, color: '#000', fontWeight: 700,
                  padding: '0.55rem 1.25rem', borderRadius: 7,
                  textDecoration: 'none', fontSize: '0.9rem',
                }}
              >
                Submit your first drive →
              </a>
            </div>
          ) : (
            entries.map((e, i) => (
              <div
                key={e.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 110px 1fr 120px 1fr',
                  padding: '0.85rem 1.25rem',
                  borderBottom: i < entries.length - 1 ? `1px solid ${BDR}` : 'none',
                  fontSize: '0.88rem', alignItems: 'center',
                }}
              >
                <span style={{ color: MUT, fontSize: '0.78rem' }}>#{i + 1}</span>
                <span style={{ fontWeight: 700, color: i === 0 ? ORG : TXT }}>
                  {Number(e.dist)} yds
                </span>
                <span style={{ color: MUT }}>{e.player}</span>
                <span style={{ color: MUT, fontSize: '0.8rem' }}>{fmtDate(e.date)}</span>
                <span style={{ color: MUT, fontSize: '0.8rem' }}>{e.club || '—'}</span>
              </div>
            ))
          )}
        </div>

      </div>

      {showModal && (
        <ProfileModal
          club={club}
          onSave={handleProfileSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  );
}
