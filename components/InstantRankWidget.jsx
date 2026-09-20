import { useState } from 'react';
import { useRouter } from 'next/router';
import { COUNTRIES, ORG, TXT, MUT, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { Card, Field, Btn } from './UI';

// Rank is computed against real, currently-live entries — the same
// `entries`/`orgs` arrays already loaded app-wide (see initData() in
// lib/data.js), so this needs no API call and writes nothing to the DB.
// Split by gender only (no age/handicap band, unlike the six homepage
// categories) to keep the teaser to 4 fields — this is intentionally an
// approximation, not the exact category rank shown post-registration.
function getOrgCountry(orgId, orgs) {
  const org = orgs.find(o => String(o.id) === String(orgId));
  return org?.country || null;
}

function computeRank(dist, gender, country, entries, orgs) {
  const d = Number(dist);
  const g = (gender || '').toLowerCase();
  const genderEntries = entries.filter(e => (e.gender || '').toLowerCase() === g);
  const globalBetter = genderEntries.filter(e => Number(e.dist) > d).length;
  const countryEntries = genderEntries.filter(e => getOrgCountry(e.orgId, orgs) === country);
  const nationalBetter = countryEntries.filter(e => Number(e.dist) > d).length;
  return {
    globalRank: globalBetter + 1,
    globalTotal: genderEntries.length + 1,
    nationalRank: nationalBetter + 1,
    nationalTotal: countryEntries.length + 1,
  };
}

export default function InstantRankWidget({ entries = [], orgs = [] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [dist, setDist] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const canReveal = name.trim() && country && gender && dist && Number(dist) > 0;

  const handleReveal = () => {
    setError('');
    if (!canReveal) {
      setError('Fill in your name, gender, country and distance to see your rank.');
      return;
    }
    setResult(computeRank(dist, gender, country, entries, orgs));
  };

  // Sends the visitor into the existing individual-registration flow with
  // their answers pre-filled, then (via the existing `redirect` query
  // mechanism register.jsx already supports) back to /submit with the
  // distance carried over too — so nothing they already typed here needs
  // retyping. They still have to complete the real submission (photo,
  // date, club, handicap) for the entry to actually go live, same as any
  // other submission.
  const handleRegister = () => {
    const redirectPath = `/submit?dist=${encodeURIComponent(dist)}`;
    const qs = new URLSearchParams({
      redirect: redirectPath,
      name: name.trim(),
      country,
      gender,
      dist: String(dist),
    }).toString();
    router.push(`/register?${qs}`);
  };

  return (
    <Card>
      <div style={{ fontFamily: DISP, fontSize: 22, color: TXT, letterSpacing: 0.5, marginBottom: 6 }}>
        Where Do You Rank?
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: MUT, marginBottom: 18, lineHeight: 1.5 }}>
        Enter your longest drive to see your rank instantly — no account needed to check.
      </div>

      {!result ? (
        <>
          <Field
            label="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. James Hargreaves"
          />

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Gender <span style={{ color: ORG }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['male', 'female'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{ flex: 1, padding: '10px', background: gender === g ? 'transparent' : BG3, border: `1px solid ${gender === g ? ORG : BDR}`, color: gender === g ? ORG : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: 0.5 }}
                >
                  {g === 'male' ? '♂ Male' : '♀ Female'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Country <span style={{ color: ORG }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '10px 36px 10px 14px', color: country ? TXT : DIM, fontFamily: SANS, fontSize: 14, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
              >
                <option value="">Select country...</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>▾</span>
            </div>
          </div>

          <Field
            label="Longest Drive (yards)"
            type="number"
            value={dist}
            onChange={e => setDist(e.target.value)}
            placeholder="245"
            min="50"
            max="600"
          />

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.4)', padding: '10px 14px', marginBottom: 14, fontFamily: SANS, fontSize: 12, color: '#f87171', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <Btn full onClick={handleReveal}>Reveal My Rank →</Btn>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Global Rank
          </div>
          <div style={{ fontFamily: DISP, fontSize: 40, color: ORG, letterSpacing: 1, marginBottom: 4 }}>
            #{result.globalRank}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11.5, color: DIM, marginBottom: 20 }}>
            of {result.globalTotal} {gender === 'female' ? 'women' : 'men'} worldwide
          </div>

          <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            National Rank
          </div>
          <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 1, marginBottom: 4 }}>
            #{result.nationalRank}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11.5, color: DIM, marginBottom: 24 }}>
            of {result.nationalTotal} {gender === 'female' ? 'women' : 'men'} in {COUNTRIES.find(c => c.code === country)?.name || country}
          </div>

          <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginBottom: 16, lineHeight: 1.6 }}>
            This rank is real, but it's only yours once you register and submit your drive — otherwise it won't stick.
          </div>

          <Btn full onClick={handleRegister}>Register to Claim This Rank →</Btn>
          <button
            type="button"
            onClick={() => setResult(null)}
            style={{ background: 'none', border: 'none', color: DIM, fontFamily: SANS, fontSize: 11, marginTop: 10, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Check a different distance
          </button>
        </div>
      )}
    </Card>
  );
}
