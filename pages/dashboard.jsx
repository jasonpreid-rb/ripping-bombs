import { useEffect, useState, useRef, cloneElement } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import PlayerAvatar from '../components/PlayerAvatar';
import AvatarUploader from '../components/AvatarUploader';
import SponsorLogoUploader from '../components/SponsorLogoUploader';
import { countryFlag } from '../components/UI';
import { DISP } from '../lib/constants';

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

function nameToSlug(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

// ——— Weekly leaderboard helpers (Monday-start week) ———

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekEnd(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 7);
  return d;
}

function fmtWeekRange(weekStart, weekEnd) {
  const end = new Date(weekEnd);
  end.setDate(end.getDate() - 1); // display inclusive last day (Sunday)
  const opts = { day: 'numeric', month: 'short' };
  return `${weekStart.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}`;
}

function daysUntilWeekReset(weekEnd) {
  const ms = weekEnd.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
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

function ProfileModal({ club, onSave, onClose, onAvatarUploaded, onSponsorLogoUploaded }) {
  const [form, setForm] = useState({
    fullName: club?.fullName || '',
    location: club?.location || '',
    position: club?.position || '',
    instagram: club?.instagram || '',
    tiktok: club?.tiktok || '',
    twitter: club?.twitter || '',
    youtube: club?.youtube || '',
    customSlug: club?.customSlug || '',
    sponsorName: club?.sponsorName || '',
    sponsorLink: club?.sponsorLink || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSave = async () => {
    setSaving(true);
    setError('');
    const err = await onSave(form);
    setSaving(false);
    if (err) setError(err);
  };
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: BG3, border: `1px solid ${BDR}`, borderRadius: 6, padding: '0.6rem 0.8rem', color: TXT, fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { fontSize: '0.72rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8, display: 'block' };
  const isSimulator = club?.accountType === 'simulator';
  const isClub = club?.accountType === 'club';
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
        {isClub && (
          <>
            <div style={{ borderTop: `1px solid ${BDR}`, marginTop: 8, paddingTop: 12 }}>
              <div style={{ fontSize: '0.7rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>TV Display URL</div>
            </div>
            <label style={labelStyle}>Custom URL</label>
            <div style={{ display: 'flex', alignItems: 'center', background: BG3, border: `1px solid ${BDR}`, borderRadius: 6, paddingLeft: '0.8rem', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.78rem', color: DIM, whiteSpace: 'nowrap' }}>rippingbombs.com/venue-display/</span>
              <input
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', padding: '0.6rem 0.6rem 0.6rem 0', color: TXT, fontSize: '0.85rem', outline: 'none' }}
                value={form.customSlug}
                onChange={(e) => set('customSlug', e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))}
                placeholder={nameToSlug(club?.courseName || form.fullName) || 'your-venue'}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: DIM, marginTop: 4 }}>
              This is the link you'll open on your venue's TV. Leave blank to use one based on your venue name. Letters, numbers and hyphens only.
            </div>
          </>
        )}
        {isSimulator && (
          <>
            <div style={{ borderTop: `1px solid ${BDR}`, marginTop: 8, paddingTop: 12 }}>
              <div style={{ fontSize: '0.7rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Public Profile URL</div>
            </div>
            <label style={labelStyle}>Custom URL</label>
            <div style={{ display: 'flex', alignItems: 'center', background: BG3, border: `1px solid ${BDR}`, borderRadius: 6, paddingLeft: '0.8rem', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.78rem', color: DIM, whiteSpace: 'nowrap' }}>rippingbombs.com/profile/</span>
              <input
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', padding: '0.6rem 0.6rem 0.6rem 0', color: TXT, fontSize: '0.85rem', outline: 'none' }}
                value={form.customSlug}
                onChange={(e) => set('customSlug', e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))}
                placeholder={nameToSlug(form.fullName) || 'your-name'}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: DIM, marginTop: 4 }}>Leave blank to use the URL based on your name. Letters, numbers and hyphens only.</div>
          </>
        )}
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
        {error && <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: 4 }}>{error}</div>}
        {!isSimulator && (
          <>
            <div style={{ borderTop: `1px solid ${BDR}`, marginTop: 8, paddingTop: 12 }}>
              <div style={{ fontSize: '0.7rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>TV Display Sponsor <span style={{ color: DIM, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — shown on your leaderboard TV screen)</span></span>
                <span style={{ background: 'rgba(255,0,144,0.12)', color: ORG, border: `1px solid ${ORG}`, borderRadius: 20, padding: '1px 8px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'none', whiteSpace: 'nowrap' }}>Free for your first 3 months</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
              {club?.sponsorLogoUrl ? (
                <img src={club.sponsorLogoUrl} alt="Sponsor logo" style={{ width: 56, height: 56, objectFit: 'contain', background: BG3, border: `1px solid ${BDR}`, borderRadius: 8 }} />
              ) : (
                <div style={{ width: 56, height: 56, background: BG3, border: `1px dashed ${BDR}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DIM, fontSize: '0.65rem', textAlign: 'center' }}>No logo</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Sponsor Logo</div>
                <SponsorLogoUploader orgId={club?.id} onUploadSuccess={onSponsorLogoUploaded} />
              </div>
            </div>
            <label style={labelStyle}>Sponsor Name</label>
            <input style={inputStyle} value={form.sponsorName} onChange={(e) => set('sponsorName', e.target.value)} placeholder="e.g. Titleist" />
            <label style={labelStyle}>Sponsor Link <span style={{ color: DIM, fontWeight: 400 }}>(optional)</span></label>
            <input style={inputStyle} value={form.sponsorLink} onChange={(e) => set('sponsorLink', e.target.value)} placeholder="https://sponsor-website.com" />
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

// Standalone hero strip for global rank — sits between header and stat cards
function RankColumn({ label, rank, total, percentile, chip, sub, muted, first }) {
  return (
    <div style={{
      flex: '1 1 200px',
      minWidth: 170,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      paddingLeft: first ? 0 : '1.5rem',
      borderLeft: first ? 'none' : '1px solid rgba(255,0,144,0.2)',
    }}>
      <span style={{ fontSize: '0.72rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
        {label}
      </span>
      {rank ? (
        <>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: ORG, letterSpacing: '-0.03em', lineHeight: 1 }}>
            #{rank}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {percentile != null && (
              <span style={{ background: 'rgba(255,0,144,0.16)', color: ORG, border: '1px solid rgba(255,0,144,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                Top {percentile}%
              </span>
            )}
            {total != null && (
              <span style={{ fontSize: '0.74rem', color: MUT }}>
                of {total.toLocaleString()}
              </span>
            )}
          </div>
          {chip}
          {sub && (
            <span style={{ fontSize: '0.72rem', color: MUT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sub}>
              {sub}
            </span>
          )}
        </>
      ) : (
        <span style={{ fontSize: '0.82rem', color: DIM, fontStyle: 'italic', lineHeight: 1.4 }}>
          {muted || 'Not ranked yet'}
        </span>
      )}
    </div>
  );
}

function RankStrip({ rank, totalClubs, percentile, category, countryRank, countryTotal, countryPercentile, countryCode, myVenueRank, myVenueTotal, myVenuePercentile, myVenueName }) {
  if (!rank) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,0,144,0.14), rgba(255,0,144,0.03))',
      border: '1px solid rgba(255,0,144,0.35)',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      rowGap: '1.25rem',
    }}>
      <RankColumn
        first
        label="Global Rank"
        rank={rank}
        total={totalClubs}
        percentile={percentile}
        chip={category && (
          <span style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', color: MUT, border: `1px solid ${BDR}`, borderRadius: 20, padding: '3px 11px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.03em' }}>
            {getCategoryLabel(category)}
          </span>
        )}
      />
      <RankColumn
        label="Country Rank"
        rank={countryRank}
        total={countryTotal}
        percentile={countryPercentile}
        chip={countryCode && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
            {cloneElement(countryFlag(countryCode), { style: { width: 18, height: 13, objectFit: 'cover', borderRadius: 2 } })}
            <span style={{ fontSize: '0.72rem', color: MUT }}>{countryCode}</span>
          </span>
        )}
        muted="Add a country to your profile to see this"
      />
      <RankColumn
        label="Venue Rank"
        rank={myVenueRank}
        total={myVenueTotal}
        percentile={myVenuePercentile}
        sub={myVenueName}
        muted="Submit a drive with a venue selected to see this"
      />
    </div>
  );
}

// Standalone hero strip for venue composite rank (club/venue accounts) — averages
// each category's percentile rank so a venue isn't judged on one lucky drive or
// penalized for categories it hasn't got data in yet.
function VenueRankStrip({ rank, totalVenues, scorePercentile, categoriesCounted }) {
  if (!rank) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,0,144,0.14), rgba(255,0,144,0.03))',
      border: '1px solid rgba(255,0,144,0.35)',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2.6rem', fontWeight: 900, color: ORG, letterSpacing: '-0.03em', lineHeight: 1 }}>
          #{rank}
        </span>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: TXT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Global Venue Rank
        </span>
        {categoriesCounted > 0 && (
          <span title="Averaged across each category's percentile rank among venues, so no single lucky drive or missing category skews it" style={{ background: 'rgba(255,255,255,0.08)', color: MUT, border: `1px solid ${BDR}`, borderRadius: 20, padding: '3px 11px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.03em', cursor: 'help' }}>
            {categoriesCounted} {categoriesCounted === 1 ? 'category' : 'categories'} counted
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        {scorePercentile != null && (
          <span style={{ background: 'rgba(255,0,144,0.16)', color: ORG, border: '1px solid rgba(255,0,144,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.03em' }}>
            Top {scorePercentile}% avg. across categories
          </span>
        )}
        {totalVenues && (
          <span style={{ fontSize: '0.78rem', color: MUT }}>
            of {totalVenues.toLocaleString()} venues worldwide
          </span>
        )}
      </div>
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
function DriveHistory({ entries, lastDriveDate, limitToFree, isClub }) {
  const daysSince = lastDriveDate ? Math.floor((Date.now() - new Date(lastDriveDate)) / 86400000) : null;
  const nudge = daysSince === null
    ? (isClub ? "No drives submitted yet — log your first player's drive!" : "You haven't submitted a drive yet — get on the board!")
    : daysSince > 14
    ? (isClub ? `It's been ${daysSince} days since your last submission. Time to log another one?` : `It's been ${daysSince} days since your last submission. Time to rip another one?`)
    : null;
  const FREE_LIMIT = 3;
  const isLimited = limitToFree && entries.length > FREE_LIMIT;
  const visibleEntries = isLimited ? entries.slice(0, FREE_LIMIT) : entries;
  const hiddenCount = entries.length - visibleEntries.length;
  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: `1px solid ${BDR}`, flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>All Submitted Drives</h2>
          {nudge && <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: MUT }}>{nudge}</p>}
        </div>
        {entries.length > 0 && (
          <a href="/submit" style={{ background: ORG, color: '#000', fontWeight: 700, fontSize: '0.78rem', padding: '0.38rem 0.85rem', borderRadius: 6, textDecoration: 'none' }}>+ Submit {isClub ? 'a' : 'Your'} Drive</a>
        )}
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: MUT }}>
          <p style={{ marginBottom: '1rem' }}>No drives submitted yet.</p>
          <a href="/submit" style={{ background: ORG, color: '#000', fontWeight: 700, padding: '0.55rem 1.25rem', borderRadius: 7, textDecoration: 'none', fontSize: '0.9rem' }}>{isClub ? 'Submit a drive →' : 'Submit your first drive →'}</a>
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
              {visibleEntries.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < visibleEntries.length - 1 ? `1px solid ${BDR}` : 'none' }}
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
          {isLimited && (
            <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${BDR}`, background: 'rgba(255,0,144,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: '0.8rem', color: TXT }}>
                <strong style={{ color: ORG }}>{hiddenCount} more drive{hiddenCount === 1 ? '' : 's'}</strong> hidden — free accounts show your best {FREE_LIMIT}.
              </div>
              <span style={{ fontSize: '0.76rem', color: MUT }}>Upgrade to Premium to see your full history →</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Weekly leaderboard — split by category, resets every Monday
const WEEKLY_MEDALS = ['🥇', '🥈', '🥉'];
function WeeklyLeaderboard({ weeklyData }) {
  const { weekStart, weekEnd, hasSubmitted, category, myBest, rank, total, top5, clubId } = weeklyData;
  const rangeLabel = fmtWeekRange(weekStart, weekEnd);
  const daysLeft = daysUntilWeekReset(weekEnd);
  const hasEntries = top5.length > 0;
  const leaderDist = hasEntries ? Number(top5[0].dist) : null;

  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${BDR}` }}>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>This Week's Leaderboard</h2>
        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: MUT }}>
          {rangeLabel} · resets in {daysLeft} day{daysLeft === 1 ? '' : 's'}
        </p>
      </div>

      {!hasEntries ? (
        <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: MUT }}>
          <p style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>No drives submitted this week yet — every category resets Monday, so this is your chance to lead it.</p>
          <a href="/submit" style={{ background: ORG, color: '#000', fontWeight: 700, padding: '0.55rem 1.25rem', borderRadius: 7, textDecoration: 'none', fontSize: '0.9rem' }}>Submit this week's drive →</a>
        </div>
      ) : (
        <>
          {hasSubmitted ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', padding: '1.1rem 1.25rem', borderBottom: `1px solid ${BDR}` }}>
              <StatCard label={`Weekly Rank · ${getCategoryLabel(category)}`} value={rank ? `#${rank}` : '—'} accent sub={total ? `of ${total} this week` : null} />
              <StatCard label="This Week's Best" value={fmt(myBest)} />
            </div>
          ) : (
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: `1px solid ${BDR}`, background: 'rgba(255,0,144,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: '0.82rem', color: TXT }}>
                This week's leader is out at <strong style={{ color: ORG }}>{fmt(leaderDist)}</strong> — think you can beat it?
              </div>
              <a href="/submit" style={{ background: ORG, color: '#000', fontWeight: 700, fontSize: '0.78rem', padding: '0.4rem 0.9rem', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>Submit your drive →</a>
            </div>
          )}

          <div>
            {top5.map((e, i) => {
              const isMe = e.orgId === clubId;
              return (
                <div key={`${e.orgId}-${i}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0.8rem 1.25rem', borderBottom: i < top5.length - 1 ? `1px solid ${BDR}` : 'none', background: isMe ? 'rgba(255,0,144,0.06)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.95rem', width: 22, flexShrink: 0, textAlign: 'center', color: DIM }}>{WEEKLY_MEDALS[i] || `#${i + 1}`}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isMe ? ORG : TXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.player}{isMe ? ' (you)' : ''}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.club || '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontFamily: DISP, fontSize: '1.25rem', letterSpacing: '.5px', color: i === 0 ? ORG : TXT }}>{Number(e.dist)}</span>
                    <span style={{ fontSize: '0.68rem', color: DIM, marginLeft: 3 }}>yds</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Horizontal-scrolling, all-category weekly leaderboard — used for club/venue
// accounts, mirroring the homepage's "This Week" widget (index.jsx) so a
// venue sees the same live competition view visitors see, not just their
// own single category. Individual/simulator accounts keep WeeklyLeaderboard
// above, since they only care about their own category.

// Ported from index.jsx — same drag/loop-scroll behavior, just without the
// full-bleed edge margins (dashboard cards are boxed, not edge-to-edge).
function InfiniteScrollRow({ items, renderItem, cardWidth = 190, gap = 10 }) {
  const scrollRef = useRef(null);
  const [showHint, setShowHint] = useState(true);
  const loopItems = [...items, ...items, ...items];
  const drag = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const setWidth = el.scrollWidth / 3;
    el.scrollLeft = setWidth;
  }, [items]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const setWidth = el.scrollWidth / 3;
    if (el.scrollLeft < setWidth * 0.5) {
      el.scrollLeft += setWidth;
    } else if (el.scrollLeft > setWidth * 1.5) {
      el.scrollLeft -= setWidth;
    }
  }

  function dismissHint() { setShowHint(false); }

  function handlePointerDown(e) {
    if (e.pointerType !== 'mouse') { dismissHint(); return; }
    const el = scrollRef.current;
    drag.current = { isDown: true, startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false, pointerId: e.pointerId };
    el.style.cursor = 'grabbing';
  }

  function handlePointerMove(e) {
    if (e.pointerType !== 'mouse' || !drag.current.isDown) return;
    const el = scrollRef.current;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3 && !drag.current.moved) {
      drag.current.moved = true;
      el.setPointerCapture?.(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.startScrollLeft - dx;
    dismissHint();
  }

  function endDrag(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    drag.current.isDown = false;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = 'grab';
      if (e.pointerId != null && el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    }
  }

  function handleClickCapture(e) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        onTouchStart={dismissHint}
        className="rb-dash-scroll-row"
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', cursor: 'grab', touchAction: 'pan-x' }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', gap }}>
          {loopItems.map((item, i) => (
            <div key={`${item.key}-${i}`} style={{ flex: `0 0 ${cardWidth}px`, minWidth: 0, display: 'flex' }}>
              {renderItem(item)}
            </div>
          ))}
          {showHint && (
            <div aria-hidden style={{ position: 'sticky', right: 0, alignSelf: 'stretch', width: 0, flexShrink: 0, zIndex: 2, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(20,20,20,0.55)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.45)', animation: 'rbDashArrowPulse 1.6s ease-in-out infinite' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .rb-dash-scroll-row::-webkit-scrollbar { display: none; }
        .rb-dash-scroll-row { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes rbDashArrowPulse {
          0%, 100% { opacity: 0.55; transform: translate(0,-50%); }
          50% { opacity: 1; transform: translate(4px,-50%); }
        }
      `}</style>
    </div>
  );
}

function WeeklyCategoryCard({ cat }) {
  const { top3, label } = cat;
  return (
    <div style={{ background: BG3, border: `1px solid ${top3.length ? 'rgba(255,0,144,0.2)' : BDR}`, borderRadius: 10, padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', minHeight: 200, width: '100%', boxSizing: 'border-box' }}>
      <span style={{ fontSize: '0.68rem', color: ORG, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: top3.length === 0 ? 'center' : 'flex-start' }}>
        {top3.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: DIM, lineHeight: 1.6 }}>No entry yet —<br />be the first!</div>
        ) : (
          top3.map((e, i) => (
            <div key={e.id || `${e.orgId}-${i}`} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0.5rem 0', borderBottom: i < top3.length - 1 ? `1px solid ${BDR}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>{WEEKLY_MEDALS[i] || `#${i + 1}`}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: TXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.player}</span>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontFamily: DISP, fontSize: '1.05rem', color: i === 0 ? ORG : MUT, letterSpacing: '.5px' }}>{Number(e.dist)}</span>
                  <span style={{ fontSize: '0.6rem', color: DIM, marginLeft: 2 }}>yds</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 19 }}>
                {e.org?.avatarUrl && (
                  <img src={e.org.avatarUrl} onError={(ev) => { ev.target.style.display = 'none'; }} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                )}
                {e.org?.country && <span style={{ fontSize: 11, flexShrink: 0 }}>{countryFlag(e.org.country)}</span>}
                <span style={{ fontSize: '0.66rem', color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {e.org?.courseName || e.org?.fullName || '—'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WeeklyCategoryScroll({ categories, weekStart, weekEnd }) {
  const rangeLabel = fmtWeekRange(weekStart, weekEnd);
  const daysLeft = daysUntilWeekReset(weekEnd);
  return (
    <div style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${BDR}` }}>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>This Week's Leaderboard</h2>
        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: MUT }}>
          {rangeLabel} · resets in {daysLeft} day{daysLeft === 1 ? '' : 's'} · every category, platform-wide
        </p>
      </div>
      <div style={{ padding: '1.1rem 1.25rem' }}>
        <InfiniteScrollRow items={categories} renderItem={(cat) => <WeeklyCategoryCard cat={cat} />} />
      </div>
    </div>
  );
}

function TvDisplayPromo({ club, onManageClick, onStartTrial }) {
  const [copied, setCopied] = useState(false);
  const hasSponsor = !!(club?.sponsorName || club?.sponsorLogoUrl);
  const displayUrl = club?.customSlug ? `rippingbombs.com/venue-display/${club.customSlug}` : null;

  const handleCopy = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS/older browsers where navigator.clipboard is unavailable
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const TRIAL_DAYS = 90;
  const trialStartedAt = club?.display_trial_started_at ? new Date(club.display_trial_started_at) : null;
  const subscribed = !!club?.display_subscribed;
  const daysLeft = trialStartedAt ? TRIAL_DAYS - Math.floor((Date.now() - trialStartedAt.getTime()) / 86400000) : null;
  const trialExpired = !!(trialStartedAt && !subscribed && daysLeft <= 0);
  const displayActive = subscribed || (!!trialStartedAt && !trialExpired);

  return (
    <div style={{ background: `linear-gradient(135deg, ${BG2}, ${BG3})`, border: `1px solid ${ORG}`, borderRadius: 10, padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 320px' }}>
        <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>📺</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>TV Display &amp; Sponsors</span>
            <span style={{ background: 'rgba(255,0,144,0.15)', color: ORG, border: `1px solid ${ORG}`, borderRadius: 20, padding: '1px 9px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              {subscribed ? 'Active' : trialExpired ? 'Trial ended' : trialStartedAt ? `Trial active · ${daysLeft}d left` : 'Free for your first 3 months'}
            </span>
          </div>
          {displayActive && displayUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              <code style={{ fontSize: '0.8rem', color: TXT, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 5 }}>{displayUrl}</code>
              <button
                onClick={() => handleCopy(`https://${displayUrl}`)}
                style={{ background: copied ? 'rgba(255,0,144,0.15)' : 'transparent', border: `1px solid ${copied ? ORG : BDR}`, color: copied ? ORG : MUT, padding: '2px 8px', borderRadius: 5, fontSize: '0.7rem', cursor: 'pointer', minWidth: 46, transition: 'all 0.15s ease' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : displayActive ? (
            <p style={{ margin: 0, fontSize: '0.82rem', color: MUT, lineHeight: 1.5, maxWidth: 480 }}>
              Show a live, always-on leaderboard on any TV at your venue. Set a custom URL below to get your link.
            </p>
          ) : trialExpired ? (
            <p style={{ margin: 0, fontSize: '0.82rem', color: MUT, lineHeight: 1.5, maxWidth: 480 }}>
              Your free trial has ended. Contact <a href="mailto:team@rippingbombs.com" style={{ color: ORG }}>team@rippingbombs.com</a> to keep your screen live.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.82rem', color: MUT, lineHeight: 1.5, maxWidth: 480 }}>
              Show a live, always-on leaderboard on any TV at your venue — free for your first 3 months.
            </p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href="/venue-setup" style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.55rem 1rem', borderRadius: 7, fontSize: '0.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Setup Guide
        </a>
        <a href="/for-venues" target="_blank" rel="noreferrer" style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.55rem 1rem', borderRadius: 7, fontSize: '0.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          See it in action
        </a>
        {displayActive ? (
          <button onClick={onManageClick} style={{ background: ORG, color: '#000', fontWeight: 700, border: 'none', padding: '0.55rem 1.1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            {hasSponsor ? 'Manage Sponsor' : 'Set Up Sponsor'}
          </button>
        ) : trialExpired ? (
          <a href="mailto:team@rippingbombs.com?subject=Continue%20TV%20Display" style={{ background: ORG, color: '#000', fontWeight: 700, border: 'none', padding: '0.55rem 1.1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Contact Us
          </a>
        ) : (
          <button onClick={onStartTrial} style={{ background: ORG, color: '#000', fontWeight: 700, border: 'none', padding: '0.55rem 1.1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            Start My Free Trial
          </button>
        )}
      </div>
    </div>
  );
}

function TierComparison() {
  const cell = { padding: '0.9rem 1rem', fontSize: '0.82rem', lineHeight: 1.5 };
  const check = (color) => <span style={{ color, fontWeight: 800, marginRight: 8 }}>✓</span>;
  return (
    <div style={{ border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${BDR}` }}>
        <div style={{ ...cell, background: BG2, borderRight: `1px solid ${BDR}` }}>
          <div style={{ fontSize: '0.68rem', color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Free Venue Account</div>
        </div>
        <div style={{ ...cell, background: 'rgba(255,0,144,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', color: ORG, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>TV Display &amp; Sponsors</span>
            <span style={{ background: 'rgba(255,0,144,0.15)', color: ORG, border: `1px solid ${ORG}`, borderRadius: 20, padding: '1px 8px', fontSize: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>3 months free</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ ...cell, borderRight: `1px solid ${BDR}` }}>
          {check(MUT)}Venue listed on Ripping Bombs, selectable by players
        </div>
        <div style={cell}>
          {check(ORG)}Everything in Free, plus:
        </div>
        <div style={{ ...cell, borderRight: `1px solid ${BDR}`, borderTop: `1px solid ${BDR}` }}>
          {check(MUT)}Appears on the global leaderboard
        </div>
        <div style={{ ...cell, borderTop: `1px solid ${BDR}` }}>
          {check(ORG)}Live leaderboard on your venue's TV, always up to date
        </div>
        <div style={{ ...cell, borderRight: `1px solid ${BDR}`, borderTop: `1px solid ${BDR}` }}>
          {check(MUT)}Public venue leaderboard page — categories, ages, divisions
        </div>
        <div style={{ ...cell, borderTop: `1px solid ${BDR}` }}>
          {check(ORG)}Add a sponsor's logo to your screen — charge them to help cover the cost
        </div>
        <div style={{ ...cell, borderRight: `1px solid ${BDR}`, borderTop: `1px solid ${BDR}`, color: MUT }}>
          {check(MUT)}Free, always
        </div>
        <div style={{ ...cell, borderTop: `1px solid ${BDR}`, color: MUT }}>
          {check(ORG)}Free for 3 months, then <strong style={{ color: TXT }}>$49/mo</strong>
        </div>
      </div>
      <div style={{ background: 'rgba(255,0,144,0.07)', borderTop: `1px solid ${BDR}`, padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: '1rem', lineHeight: 1.2 }}>💡</span>
        <div style={{ fontSize: '0.78rem', lineHeight: 1.5, color: TXT }}>
          <strong style={{ color: ORG }}>Let a sponsor cover it —</strong> local businesses typically pay $75–150/mo for a logo spot on a venue TV.
          Sell it once and the $49/mo subscription pays for itself, with margin left over.
        </div>
      </div>
    </div>
  );
}

function IndividualPremiumPromo({ isPremium }) {
  const cell = { padding: '0.9rem 1rem', fontSize: '0.82rem', lineHeight: 1.5 };
  const check = (color) => <span style={{ color, fontWeight: 800, marginRight: 8 }}>✓</span>;
  if (isPremium) {
    return (
      <div style={{ background: `linear-gradient(135deg, ${BG2}, ${BG3})`, border: `1px solid ${ORG}`, borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.3rem' }}>⭐</span>
        <div style={{ fontSize: '0.85rem' }}>
          <strong style={{ color: ORG }}>You're a Premium member.</strong> Thanks for backing Ripping Bombs — your drive cards, full history, and rival alerts are unlocked.
        </div>
      </div>
    );
  }
  return (
    <div style={{ border: `1px solid ${BDR}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '1.1rem 1.25rem', background: `linear-gradient(135deg, ${BG2}, ${BG3})`, borderBottom: `1px solid ${BDR}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem' }}>⭐</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Ripping Bombs Premium</div>
            <div style={{ fontSize: '0.78rem', color: MUT, marginTop: 2 }}>Turn every big drive into bragging rights.</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: ORG }}>$5/mo <span style={{ fontWeight: 500, color: MUT, fontSize: '0.75rem' }}>or $50/yr</span></div>
          <button style={{ marginTop: 6, background: ORG, color: '#000', fontWeight: 700, border: 'none', padding: '0.45rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>
            Upgrade — Coming Soon
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          'Auto-Generated Drive Cards — a shareable image every time you set a new PR',
          'Rival Tracking & Overtaken Alerts — follow players, know the moment they pass you',
          'Weekly Recap Email — your trend, rank movement, and who\'s chasing you',
          'Full Drive History & Progress Chart — every drive you\'ve submitted, over time',
          'Official Drive Certificate — downloadable, shareable',
          'Premium badge on your public profile',
        ].map((item, i) => (
          <div key={item} style={{ ...cell, borderTop: `1px solid ${BDR}`, borderRight: i % 2 === 0 ? `1px solid ${BDR}` : 'none' }}>
            {check(ORG)}{item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ——— Main Page ———

export default function DashboardPage() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [entries, setEntries] = useState([]);
  const [primaryCategory, setPrimaryCategory] = useState(null);
  const [rank, setRank] = useState(null);
  const [totalClubs, setTotalClubs] = useState(null);
  const [globalAvgBest, setGlobalAvgBest] = useState(null);
  const [countryRank, setCountryRank] = useState(null);
  const [countryTotal, setCountryTotal] = useState(null);
  const [myVenueRank, setMyVenueRank] = useState(null);
  const [myVenueTotal, setMyVenueTotal] = useState(null);
  const [myVenueName, setMyVenueName] = useState(null);
  const [venueRank, setVenueRank] = useState(null);
  const [venueTotalRanked, setVenueTotalRanked] = useState(null);
  const [venueScorePercentile, setVenueScorePercentile] = useState(null);
  const [venueCategoriesCounted, setVenueCategoriesCounted] = useState(0);
  const [weeklyData, setWeeklyData] = useState(null);
  const [weeklyCategoryLeaders, setWeeklyCategoryLeaders] = useState([]);
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

    const mostRecent = (clubEntries || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    setPrimaryCategory(mostRecent ? getCategory(mostRecent) : null);

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

      // Country rank — same "best drive per account" comparison as global rank,
      // narrowed to accounts registered in the same country as this player.
      // Country lives on the account (clubs table), not on individual entries,
      // so this is a second lightweight query filtered at the DB level.
      const myCountry = freshClub?.country || clubData.country;
      if (myCountry) {
        const { data: countryOrgs } = await supabase.from('clubs').select('id').eq('country', myCountry);
        const countryIds = new Set((countryOrgs || []).map((o) => o.id));
        countryIds.add(clubData.id); // guard in case this account's own row lags the query above
        const countryBests = Object.entries(bestPerClub).filter(([id]) => countryIds.has(id));
        const countryBeatenBy = countryBests.filter(([id, d]) => id !== clubData.id && d > myBest).length;
        setCountryRank(countryBeatenBy + 1);
        setCountryTotal(countryBests.length);
      }

      // Venue rank — where does this player's best drive rank among everyone
      // who's submitted at that same registered venue? Based on `courseName`
      // on the entry itself (set from the venue dropdown at submission time),
      // not on the account's own venue — a player can submit from many venues.
      const myVenue = sorted[0]?.courseName;
      if (myVenue) {
        const { data: venueEntries } = await supabase.from('entries').select('orgId, dist').eq('courseName', myVenue);
        if (venueEntries) {
          const bestPerVenueAccount = {};
          venueEntries.forEach((e) => {
            const d = Number(e.dist);
            if (!bestPerVenueAccount[e.orgId] || d > bestPerVenueAccount[e.orgId]) bestPerVenueAccount[e.orgId] = d;
          });
          const venueBeatenBy = Object.entries(bestPerVenueAccount).filter(([id, d]) => id !== clubData.id && d > myBest).length;
          setMyVenueRank(venueBeatenBy + 1);
          setMyVenueTotal(Object.keys(bestPerVenueAccount).length);
          setMyVenueName(myVenue);
        }
      }
    }

    // ——— Venue global composite rank (club accounts only) ———
    // A venue's raw longest drive is really just the longest drive by whichever
    // one player happened to submit through them — it doesn't say much about the
    // venue itself, and it can't be compared apples-to-apples across categories
    // with very different typical distances. So instead: rank all venues within
    // each category, turn that into a percentile, then average the percentiles
    // across whichever categories the venue actually has data in. A minimum
    // drive count per category keeps one fluke submission from swinging things.
    if ((freshClub?.accountType || clubData.accountType) === 'club') {
      const MIN_DRIVES_PER_CATEGORY = 3;
      const CATEGORY_KEYS = ['male_open', 'male_high_hcp', 'female_open', 'female_high_hcp', 'senior', 'youth'];

      const { data: venueRows } = await supabase.from('clubs').select('id').eq('accountType', 'club');
      const venueIds = new Set((venueRows || []).map((v) => v.id));

      const { data: entriesForVenues } = await supabase.from('entries').select('orgId, dist, age, hcp, gender');
      const venueEntries = (entriesForVenues || []).filter((e) => venueIds.has(e.orgId));

      const perCategory = {};
      CATEGORY_KEYS.forEach((key) => { perCategory[key] = {}; });
      venueEntries.forEach((e) => {
        const cat = getCategory(e);
        const bucket = perCategory[cat];
        if (!bucket) return;
        const d = Number(e.dist);
        if (!bucket[e.orgId]) bucket[e.orgId] = { best: d, count: 1 };
        else {
          bucket[e.orgId].count += 1;
          if (d > bucket[e.orgId].best) bucket[e.orgId].best = d;
        }
      });

      // Per category: rank eligible venues by best drive, convert rank -> percentile
      // (lower % = better, matching the "Top X%" convention used elsewhere).
      const venuePercentiles = {};
      CATEGORY_KEYS.forEach((key) => {
        const eligible = Object.entries(perCategory[key]).filter(([, v]) => v.count >= MIN_DRIVES_PER_CATEGORY);
        const n = eligible.length;
        if (n === 0) return;
        eligible
          .sort((a, b) => b[1].best - a[1].best)
          .forEach(([orgId], idx) => {
            const catPercentile = ((idx + 1) / n) * 100;
            if (!venuePercentiles[orgId]) venuePercentiles[orgId] = [];
            venuePercentiles[orgId].push(catPercentile);
          });
      });

      const composite = {};
      Object.entries(venuePercentiles).forEach(([orgId, arr]) => {
        composite[orgId] = arr.reduce((s, v) => s + v, 0) / arr.length;
      });

      const compositeRanked = Object.entries(composite).sort((a, b) => a[1] - b[1]);
      const myIndex = compositeRanked.findIndex(([orgId]) => orgId === clubData.id);

      setVenueTotalRanked(compositeRanked.length || null);
      if (myIndex >= 0) {
        setVenueRank(myIndex + 1);
        setVenueScorePercentile(Math.round(composite[clubData.id]));
        setVenueCategoriesCounted(venuePercentiles[clubData.id].length);
      } else {
        // Not enough qualifying drives yet in any category to be ranked
        setVenueRank(null);
        setVenueScorePercentile(null);
        setVenueCategoriesCounted(0);
      }
    }

    // ——— Weekly leaderboard, split by category, Monday-start week ———
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd(weekStart);

    const myWeeklyEntries = (clubEntries || [])
      .filter((e) => {
        const t = new Date(e.date).getTime();
        return t >= weekStart.getTime() && t < weekEnd.getTime();
      })
      .sort((a, b) => Number(b.dist) - Number(a.dist));

    // Always fetch this week's platform-wide entries — the leaderboard needs to
    // show live competition even when the current user hasn't submitted yet.
    const { data: weeklyAllEntries } = await supabase
      .from('entries')
      .select('orgId, dist, age, hcp, gender, date, player, club')
      .gte('date', weekStart.toISOString())
      .lt('date', weekEnd.toISOString());

    // For club/venue accounts, the weekly leaderboard shows every category at
    // once (matching the homepage's widget) instead of just the club's own
    // single best category — a club logs drives on behalf of many different
    // players across many categories, so "my one category" doesn't fit them.
    if (clubData.accountType === 'club') {
      const orgIds = [...new Set((weeklyAllEntries || []).map((e) => e.orgId))];
      const { data: weeklyOrgs } = orgIds.length
        ? await supabase.from('clubs').select('id, courseName, fullName, avatarUrl, country').in('id', orgIds)
        : { data: [] };
      const orgMap = new Map((weeklyOrgs || []).map((o) => [o.id, o]));

      const CATEGORY_KEYS = ['male_open', 'male_high_hcp', 'female_open', 'female_high_hcp', 'youth', 'senior'];
      const categoryLeaders = CATEGORY_KEYS.map((key) => ({
        key,
        label: getCategoryLabel(key),
        top3: (weeklyAllEntries || [])
          .filter((e) => getCategory(e) === key)
          .sort((a, b) => Number(b.dist) - Number(a.dist))
          .slice(0, 3)
          .map((e) => ({ ...e, org: orgMap.get(e.orgId) })),
      }));
      setWeeklyCategoryLeaders(categoryLeaders);
    }

    if (myWeeklyEntries.length === 0) {
      // Not submitted yet this week — show the overall weekly top 5 across all
      // categories so the user sees real distances to beat and is prompted to submit.
      const bestEntryPerClub = {};
      (weeklyAllEntries || []).forEach((e) => {
        const d = Number(e.dist);
        if (!bestEntryPerClub[e.orgId] || d > Number(bestEntryPerClub[e.orgId].dist)) {
          bestEntryPerClub[e.orgId] = e;
        }
      });
      const ranked = Object.values(bestEntryPerClub).sort((a, b) => Number(b.dist) - Number(a.dist));

      setWeeklyData({
        weekStart,
        weekEnd,
        hasSubmitted: false,
        category: null,
        myBest: null,
        rank: null,
        total: ranked.length,
        top5: ranked.slice(0, 5),
        clubId: clubData.id,
      });
    } else {
      const myBestEntry = myWeeklyEntries[0];
      const category = getCategory(myBestEntry);

      // Best entry per club, within this category, for the week
      const bestEntryPerClub = {};
      (weeklyAllEntries || []).forEach((e) => {
        if (getCategory(e) !== category) return;
        const d = Number(e.dist);
        if (!bestEntryPerClub[e.orgId] || d > Number(bestEntryPerClub[e.orgId].dist)) {
          bestEntryPerClub[e.orgId] = e;
        }
      });

      const ranked = Object.values(bestEntryPerClub).sort((a, b) => Number(b.dist) - Number(a.dist));
      const myIndex = ranked.findIndex((e) => e.orgId === clubData.id);

      setWeeklyData({
        weekStart,
        weekEnd,
        hasSubmitted: true,
        category,
        myBest: Number(myBestEntry.dist),
        rank: myIndex >= 0 ? myIndex + 1 : ranked.length + 1,
        total: ranked.length,
        top5: ranked.slice(0, 5),
        clubId: clubData.id,
      });
    }

    setLoading(false);
  };

  const handleAvatarUploaded = (avatarUrl) => {
    const updated = { ...club, avatarUrl };
    setClub(updated);
    localStorage.setItem('rb_club', JSON.stringify(updated));
  };

  const handleSponsorLogoUploaded = (sponsorLogoUrl) => {
    const updated = { ...club, sponsorLogoUrl };
    setClub(updated);
    localStorage.setItem('rb_club', JSON.stringify(updated));
  };

  const handleProfileSave = async (form) => {
    let customSlug = club?.customSlug || null;
    const wantsSlug = club?.accountType === 'simulator' || club?.accountType === 'club';
    if (wantsSlug && form.customSlug && form.customSlug.trim()) {
      customSlug = nameToSlug(form.customSlug);
      if (!customSlug) return 'Please enter a valid URL — letters, numbers and hyphens only.';

      const { data: clash } = await supabase
        .from('clubs')
        .select('id')
        .eq('customSlug', customSlug)
        .neq('id', club.id)
        .maybeSingle();
      if (clash) return 'That URL is already taken — please choose another.';
    } else if (wantsSlug) {
      // Left blank — auto-generate instead of clearing it, so every account
      // always ends up with a working link. Club accounts base this on
      // courseName, matching the slug their public /clubs/[slug] page has
      // always used (and may already be indexed under) — using fullName
      // here instead would silently move an existing venue to a new URL.
      const nameForSlug = club?.accountType === 'club' ? (club?.courseName || form.fullName) : form.fullName;
      const base = nameToSlug(nameForSlug);
      if (!base) return 'Please enter a name so we can generate your URL.';

      let candidate = base;
      let suffix = 2;
      while (suffix <= 50) {
        const { data: clash } = await supabase
          .from('clubs')
          .select('id')
          .eq('customSlug', candidate)
          .neq('id', club.id)
          .maybeSingle();
        if (!clash) break;
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      customSlug = candidate;
    }

    const { error } = await supabase.from('clubs').update({
      fullName: form.fullName,
      location: form.location,
      position: form.position,
      instagram: form.instagram || null,
      tiktok: form.tiktok || null,
      twitter: form.twitter || null,
      youtube: form.youtube || null,
      ...(wantsSlug && { customSlug }),
      ...(club?.accountType !== 'simulator' && {
        sponsorName: form.sponsorName || null,
        sponsorLink: form.sponsorLink || null,
      }),
    }).eq('id', club.id);

    if (error) return 'Something went wrong saving your profile. Please try again.';

    const updated = { ...club, ...form, customSlug };
    setClub(updated);
    localStorage.setItem('rb_club', JSON.stringify(updated));
    setShowModal(false);
  };

  const handleStartTrial = async () => {
    const startedAt = new Date().toISOString();
    const { error } = await supabase.from('clubs').update({
      display_trial_started_at: startedAt,
    }).eq('id', club.id);
    if (error) { window.alert('Something went wrong starting your trial. Please try again.'); return; }
    const updated = { ...club, display_trial_started_at: startedAt };
    setClub(updated);
    localStorage.setItem('rb_club', JSON.stringify(updated));
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
  const percentile = rank && totalClubs ? Math.round((rank / totalClubs) * 100) : null;
  const rankSub = percentile != null ? `Top ${percentile}% globally` : null;
  const countryPercentile = countryRank && countryTotal ? Math.round((countryRank / countryTotal) * 100) : null;
  const myVenuePercentile = myVenueRank && myVenueTotal ? Math.round((myVenueRank / myVenueTotal) * 100) : null;

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUT }}>
        Loading your dashboard…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{(club?.accountType === 'club' ? club?.courseName : club?.fullName) || 'Dashboard'} — Ripping Bombs</title>
      </Head>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', color: TXT, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
            <PlayerAvatar fullName={club?.fullName} avatarUrl={club?.avatarUrl} size={56} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {club?.accountType === 'club' ? (club?.courseName || 'My Dashboard') : (club?.fullName || 'My Dashboard')}
                </h1>
                {club?.is_founding_member && <FoundingBadge />}
                {club?.badge === 'simulator' && (
                  <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Simulator</span>
                )}
              </div>
              <p style={{ margin: 0, color: MUT, fontSize: '0.85rem' }}>
                {(club?.accountType === 'club'
                  ? [club?.fullName, club?.position, club?.location]
                  : [club?.courseName, club?.position, club?.location]
                ).filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            {club?.country && (
              <span title={club.country} style={{ display: 'inline-block' }}>
                {cloneElement(countryFlag(club.country), { style: { width: 40, height: 30, objectFit: 'cover', borderRadius: 3, display: 'block' } })}
              </span>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <a href="/leaderboard" style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.5rem 1rem', borderRadius: 7, fontSize: '0.82rem', textDecoration: 'none' }}>View Leaderboard</a>
              {club?.accountType === 'club' && (
                <a href="/venue-qr" style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, padding: '0.5rem 1rem', borderRadius: 7, fontSize: '0.82rem', textDecoration: 'none', fontWeight: 700 }}>Get QR Poster</a>
              )}
              <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: TXT, padding: '0.5rem 1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem' }}>Edit Profile</button>
            </div>
          </div>
        </div>

        {/* Global rank — standalone hero strip. Club accounts get the composite
            cross-category venue rank; individual/simulator accounts keep the
            single-best-drive rank, since that metric actually makes sense for
            one person. */}
        {club?.accountType === 'club' ? (
          <VenueRankStrip
            rank={venueRank}
            totalVenues={venueTotalRanked}
            scorePercentile={venueScorePercentile}
            categoriesCounted={venueCategoriesCounted}
          />
        ) : (
          <RankStrip
            rank={rank}
            totalClubs={totalClubs}
            percentile={percentile}
            category={bestCategory}
            countryRank={countryRank}
            countryTotal={countryTotal}
            countryPercentile={countryPercentile}
            countryCode={club?.country}
            myVenueRank={myVenueRank}
            myVenueTotal={myVenueTotal}
            myVenuePercentile={myVenuePercentile}
            myVenueName={myVenueName}
          />
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          <StatCard label="Longest Drive" value={fmt(longest)} accent />
          <StatCard label="Average Drive" value={fmt(average)} />
          <StatCard label="Total Drives" value={totalDrives || '—'} />
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

        {/* Weekly leaderboard — club/venue accounts see every category, horizontal-scrolling,
            matching the homepage's widget. Individual accounts keep the single-category view. */}
        {club?.accountType === 'club' && weeklyData ? (
          <WeeklyCategoryScroll categories={weeklyCategoryLeaders} weekStart={weeklyData.weekStart} weekEnd={weeklyData.weekEnd} />
        ) : (
          weeklyData && <WeeklyLeaderboard weeklyData={weeklyData} />
        )}

        {/* Player breakdown (club accounts with multiple players) */}
        {club?.accountType === 'club' && entries.length > 0 && (
          <PlayerBreakdown entries={entries} />
        )}

        {/* Drive history */}
        <DriveHistory
          entries={
            club?.accountType === 'simulator' && primaryCategory
              ? entries.filter((e) => getCategory(e) === primaryCategory)
              : entries
          }
          lastDriveDate={lastDriveDate}
          limitToFree={club?.accountType === 'simulator' && !club?.isPremium}
          isClub={club?.accountType === 'club'}
        />

        {/* TV Display & Sponsors promo — club accounts only */}
        {club?.accountType === 'club' && (
          <>
            <TvDisplayPromo club={club} onManageClick={() => setShowModal(true)} onStartTrial={handleStartTrial} />
            <TierComparison />
          </>
        )}

        {/* Ripping Bombs Premium promo — individual/simulator accounts only */}
        {club?.accountType === 'simulator' && (
          <IndividualPremiumPromo isPremium={!!club?.isPremium} />
        )}

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
        <ProfileModal club={club} onSave={handleProfileSave} onClose={() => setShowModal(false)} onAvatarUploaded={handleAvatarUploaded} onSponsorLogoUploaded={handleSponsorLogoUploaded} />
      )}
      {showDeleteModal && (
        <DeleteModal club={club} onClose={() => setShowDeleteModal(false)} />
      )}
    </>
  );
}
