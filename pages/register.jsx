import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { COUNTRIES, ORG, MUT, TXT, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { Card, Field, Btn } from '../components/UI';
import GoogleLoginButton from '../components/GoogleLoginButton';

const SIMULATORS = [
  "Trackman","Flightscope","GCQuad","Full Swing","Foresight Sports",
  "SkyTrak","Uneekor","Bushnell Launch Pro","Garmin Approach","Other"
];

// Venue tier copy — kept in sync with the Free / TV Display comparison on the dashboard.
// Players don't get a tier box: Premium isn't live yet, so there's nothing for them to decide.
const VENUE_TIER = {
  freeLabel: 'Free Venue Account',
  freeItems: [
    'Venue listed on Ripping Bombs, selectable by players',
    'Appears on the global leaderboard',
    'Public venue leaderboard page — categories, ages, divisions',
  ],
  paidLabel: 'TV Display & Sponsors',
  paidBadge: 'Free for 3 months',
  paidPrice: '$49/mo after',
  paidItems: [
    'Live leaderboard on your venue\u2019s TV, always up to date',
    'Add a sponsor\u2019s logo to your screen',
    'Sell the sponsor slot to a local business — it typically covers the subscription with margin left over',
    'Run your own branded competitions — e.g. a youth long-drive night — with a shareable link, QR code and entry criteria',
  ],
  note: 'Every venue starts on the free tier — upgrade to TV Display & Sponsors anytime from your dashboard, no card required to register.',
};

// Only ever follow a redirect that stays on this site.
const safeRedirect = v =>
  typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : null;

const track = (name, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, { event_category: 'registration', ...params });
  }
};

// Venue logos are stored as base64 in the clubs row, so a raw phone photo can
// make the insert fail. Shrink to at most `max` px on the long side first.
function shrinkImage(file, max = 512) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const w0 = img.naturalWidth || max;
        const h0 = img.naturalHeight || max;
        const scale = Math.min(1, max / Math.max(w0, h0));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w0 * scale));
        canvas.height = Math.max(1, Math.round(h0 * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')); };
    img.src = url;
  });
}

const labelStyle = { display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 };
const sectionStyle = { fontFamily: SANS, fontSize: 11, fontWeight: 700, color: ORG, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, marginBottom: 14, paddingTop: 18, borderTop: `1px solid ${BDR}` };
const helperStyle = { fontFamily: SANS, fontSize: 11, color: DIM, marginTop: -8, marginBottom: 14, lineHeight: 1.5 };

// Defined at module level (not inside the page component) so React keeps the
// same element between renders instead of remounting it on every keystroke.
function CountrySelect({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>
        Country <span style={{ color: ORG }}>*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <select
          name="country"
          autoComplete="country"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '10px 36px 10px 14px', color: value ? TXT : DIM, fontFamily: SANS, fontSize: 14, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
        >
          <option value="">Select country...</option>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>▾</span>
      </div>
    </div>
  );
}

function TierPreview() {
  const t = VENUE_TIER;
  const colStyle = { flex: '1 1 220px', minWidth: 0 };
  const headStyle = { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 };
  const tierLabelStyle = { fontFamily: SANS, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6 };
  const itemStyle = { display: 'flex', gap: 7, fontFamily: SANS, fontSize: 11.5, color: MUT, lineHeight: 1.5, marginBottom: 5 };
  const badgeStyle = { background: 'rgba(255,0,144,0.15)', color: ORG, border: `1px solid ${ORG}`, borderRadius: 20, padding: '1px 7px', fontSize: 9, fontWeight: 700, letterSpacing: .3, whiteSpace: 'nowrap' };

  return (
    <div style={{ border: `1px solid ${BDR}`, background: BG3, padding: '16px 16px 14px', marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={colStyle}>
          <div style={headStyle}>
            <span style={{ ...tierLabelStyle, color: MUT }}>{t.freeLabel}</span>
          </div>
          {t.freeItems.map(item => (
            <div key={item} style={itemStyle}>
              <span style={{ color: DIM }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={colStyle}>
          <div style={headStyle}>
            <span style={{ ...tierLabelStyle, color: ORG }}>{t.paidLabel}</span>
            <span style={badgeStyle}>{t.paidBadge}</span>
          </div>
          {t.paidItems.map(item => (
            <div key={item} style={itemStyle}>
              <span style={{ color: ORG }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
          <div style={{ fontFamily: SANS, fontSize: 11, marginBottom: 5 }}>
            <Link href="/golf-longest-drive-competition" style={{ color: ORG, textDecoration: 'underline' }}>
              See how venues run these events →
            </Link>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: TXT, marginTop: 4 }}>
            <strong style={{ color: ORG }}>{t.paidPrice}</strong>
          </div>
        </div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 10.5, color: DIM, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${BDR}`, lineHeight: 1.5 }}>
        {t.note}
      </div>
    </div>
  );
}

export default function RegisterPage({ reg, setReg, doRegister }) {
  const router = useRouter();
  const redirectTo = router.isReady ? safeRedirect(router.query.redirect) : null;
  const isSimulator = reg.type !== 'club';

  // Arriving from the homepage rank widget (`dist` param) or the GPS tracker
  // (redirect back to /submit) means they're definitely a player, so the
  // player/venue switch is hidden for them.
  const playerFlow = router.isReady && (typeof router.query.dist === 'string' || (redirectTo || '').startsWith('/submit'));

  const [showPw, setShowPw] = useState(false);
  const [showTiers, setShowTiers] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState(null); // { msg, code }
  const [logoErr, setLogoErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Field setter. Functional update so async work (country lookup, logo
  // resize) can never overwrite something the user typed in the meantime.
  const set = (key, value) => {
    setReg(r => ({ ...r, [key]: value }));
    if (error) setError(null);
  };

  // One-time setup from the URL:
  //  • ?type=club (or venue) opens the venue form — use this in outreach links
  //  • the rank widget / tracker hand-offs force the player form and prefill
  const initRef = useRef(false);
  useEffect(() => {
    if (!router.isReady || initRef.current) return;
    initRef.current = true;
    const { name, country, gender, dist, type } = router.query;
    const rd = safeRedirect(router.query.redirect);
    const fromPlayerFlow = typeof dist === 'string' || (rd || '').startsWith('/submit');
    const wantsVenue = typeof type === 'string' && ['club', 'venue'].includes(type.toLowerCase());
    setReg(r => ({
      ...r,
      type: fromPlayerFlow ? 'simulator' : wantsVenue ? 'club' : r.type,
      fullName: typeof name === 'string' && name ? name : r.fullName,
      country: typeof country === 'string' && country ? country : r.country,
      gender: typeof gender === 'string' && gender ? gender : r.gender,
    }));
    track('register_view', { source: fromPlayerFlow ? 'player_flow' : wantsVenue ? 'venue_link' : 'direct' });
  }, [router.isReady, router.query]);

  // Pre-select the country from the request's location so most people never
  // have to open the long dropdown. Never overrides a value already set, and
  // does nothing if the lookup fails or the code isn't in COUNTRIES.
  const geoRef = useRef(false);
  useEffect(() => {
    if (geoRef.current) return;
    geoRef.current = true;
    fetch('/api/geo')
      .then(r => r.json())
      .then(({ country }) => {
        if (!country) return;
        const match = COUNTRIES.find(c => String(c.code).toUpperCase() === country);
        if (match) setReg(r => (r.country ? r : { ...r, country: match.code }));
      })
      .catch(() => {});
  }, []);

  function chooseType(val) {
    if (val === reg.type) return;
    setReg(r => ({ ...r, type: val }));
    setError(null);
    setShowMore(false);
    track('register_type_change', { account_type: val });
  }

  function validate() {
    const email = (reg.email || '').trim();
    if (!(reg.fullName || '').trim()) return 'Please enter your name.';
    if (!email) return 'Please enter your email address.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'That email address doesn\'t look right — please check it.';
    if (!reg.pw) return 'Please choose a password.';
    if (reg.pw.length < 8) return 'Your password needs at least 8 characters.';
    if (isSimulator) {
      if (!reg.gender) return 'Please select your gender — it places you in the right leaderboard category.';
      if (!reg.dob) return 'Please enter your date of birth — it sets your age category.';
      const d = new Date(reg.dob);
      if (isNaN(d.getTime()) || d.getFullYear() < 1900 || d > new Date()) return 'That date of birth doesn\'t look right — please check it.';
      if (!reg.country) return 'Please select your country.';
    } else {
      if (!(reg.courseName || '').trim()) return 'Please enter your venue name.';
      if (!(reg.location || '').trim()) return 'Please enter your city.';
      if (!reg.country) return 'Please select your country.';
    }
    return null;
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (submittingRef.current) return;

    const problem = validate();
    if (problem) {
      setError({ msg: problem, code: 'validation' });
      track('register_error', { code: 'validation' });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    track('register_submit', { account_type: reg.type });

    let res;
    try {
      res = await doRegister(redirectTo, { inline: true });
    } catch {
      res = { ok: false, error: 'Something went wrong — please try again.', code: 'exception' };
    }

    if (res && res.ok === false) {
      setError({ msg: res.error || 'Something went wrong — please try again.', code: res.code });
      track('register_error', { code: res.code || 'unknown' });
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }
    // Success: doRegister has already logged the user in and is redirecting.
    track('register_success', { account_type: reg.type });
  }

  async function onLogo(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const data = await shrinkImage(file);
      set('logo', data);
      setLogoErr(null);
    } catch {
      setLogoErr('Couldn\'t read that image — try a PNG or JPG.');
    }
  }

  const loginHref = `/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`;

  return (
    <>
      <Head>
        <title>Register | Ripping Bombs</title>
        <meta name="description" content="Register your venue or simulator account on Ripping Bombs. Free to join. Submit verified longest drives to the global leaderboard." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '28px 18px 80px' }}>

        {/* Player / venue switch — one tap, always visible, no separate screen */}
        {router.isReady && !playerFlow && (
          <div role="tablist" aria-label="Account type" style={{ display: 'flex', border: `1px solid ${BDR}`, marginBottom: 22 }}>
            {[['simulator', "I'm a player"], ['club', 'I run a venue']].map(([val, label]) => {
              const active = (val === 'club') === !isSimulator;
              return (
                <button
                  key={val}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => chooseType(val)}
                  style={{ flex: 1, padding: '12px 10px', background: active ? 'rgba(255,0,144,0.12)' : BG3, border: 'none', borderBottom: `2px solid ${active ? ORG : 'transparent'}`, color: active ? TXT : MUT, fontFamily: SANS, fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: .3 }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: .5, marginBottom: 6 }}>
          {isSimulator ? 'Create your free account' : 'Register your venue'}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 6, lineHeight: 1.5 }}>
          {redirectTo
            ? "One quick step and you'll be right back to submitting your drive."
            : `Free forever · No card required · Approved instantly · About ${isSimulator ? '30 seconds' : 'a minute'}`}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, marginBottom: 20 }}>
          Already have an account?{' '}
          <Link href={loginHref} style={{ color: ORG, textDecoration: 'underline' }}>Log in</Link>
        </div>

        {/* Google sign-up is for players only. Kept outside the <form> so its
            button can never submit the email form by accident. */}
        {isSimulator && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ maxWidth: 340, margin: '0 auto' }}>
              <GoogleLoginButton redirectTo={redirectTo || '/dashboard'} label="Sign up with Google" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 0', fontFamily: SANS, fontSize: 11, color: DIM }}>
              <span style={{ flex: 1, height: 1, background: BDR }} />
              <span>or sign up with email</span>
              <span style={{ flex: 1, height: 1, background: BDR }} />
            </div>
          </div>
        )}

        <Card>
          {/* A real <form> so Enter submits and password managers offer to save the login */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Venues only: pricing is shown for transparency, but kept collapsed */}
            {!isSimulator && (
              <>
                <button
                  type="button"
                  onClick={() => setShowTiers(s => !s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'none', border: `1px solid ${BDR}`, padding: '10px 14px', marginBottom: 14, cursor: 'pointer', fontFamily: SANS, fontSize: 11.5, color: MUT, textAlign: 'left' }}
                >
                  <span style={{ color: ORG }}>{showTiers ? '▾' : '▸'}</span>
                  <span>What's included — Free vs TV Display &amp; Sponsors</span>
                </button>
                {showTiers && <TierPreview />}
              </>
            )}

            {/* Account — identical for players and venues, so autofill fills it in one go */}
            <Field
              label="Your Full Name"
              name="name"
              autoComplete="name"
              value={reg.fullName}
              onChange={e => set('fullName', e.target.value)}
              placeholder="e.g. James Hargreaves"
              required
            />
            {isSimulator && (
              <div style={helperStyle}>This is the name shown next to your drives on the leaderboard.</div>
            )}

            <Field
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              value={reg.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Field
              label="Password"
              type={showPw ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              value={reg.pw}
              onChange={e => set('pw', e.target.value)}
              placeholder="At least 8 characters"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{ background: 'none', border: 'none', color: DIM, fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: .3, cursor: 'pointer', padding: 0 }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              }
            />

            {isSimulator ? (
              <>
                <div style={sectionStyle}>For your leaderboard category</div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>
                    Gender <span style={{ color: ORG }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['male', 'female'].map(g => (
                      <button key={g} type="button" onClick={() => set('gender', g)}
                        style={{ flex: 1, padding: '10px', background: reg.gender === g ? 'transparent' : BG3, border: `1px solid ${reg.gender === g ? ORG : BDR}`, color: reg.gender === g ? ORG : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: .5 }}>
                        {g === 'male' ? '♂ Male' : '♀ Female'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Captured once here so age is worked out automatically on every
                    drive instead of being re-entered (and possibly mistyped). */}
                <Field
                  label="Date of Birth"
                  type="date"
                  name="bday"
                  autoComplete="bday"
                  value={reg.dob}
                  onChange={e => set('dob', e.target.value)}
                  required
                />
                <div style={helperStyle}>
                  Used to work out your age category — you won't need to enter it again on future drives.
                </div>

                <CountrySelect value={reg.country} onChange={v => set('country', v)} />

                <button
                  type="button"
                  onClick={() => setShowMore(s => !s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, margin: '2px 0 14px', cursor: 'pointer', fontFamily: SANS, fontSize: 12, color: MUT }}
                >
                  <span style={{ color: ORG }}>{showMore ? '−' : '+'}</span>
                  <span>Add your simulator &amp; city (optional)</span>
                </button>
                {showMore && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ ...labelStyle, color: DIM, fontWeight: 500 }}>Simulator Brand</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={reg.simulator}
                          onChange={e => set('simulator', e.target.value)}
                          style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '10px 36px 10px 14px', color: reg.simulator ? TXT : DIM, fontFamily: SANS, fontSize: 14, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
                        >
                          <option value="">Select simulator...</option>
                          {SIMULATORS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>▾</span>
                      </div>
                    </div>
                    <Field
                      label="Location / City"
                      autoComplete="address-level2"
                      value={reg.location}
                      onChange={e => set('location', e.target.value)}
                      placeholder="e.g. London, UK"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <div style={sectionStyle}>Your venue</div>

                <Field
                  label="Venue Name"
                  autoComplete="organization"
                  value={reg.courseName}
                  onChange={e => set('courseName', e.target.value)}
                  placeholder="Augusta National Golf Club"
                  required
                />
                <Field
                  label="City"
                  autoComplete="address-level2"
                  value={reg.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="Augusta, Georgia"
                  required
                />
                <CountrySelect value={reg.country} onChange={v => set('country', v)} />

                <button
                  type="button"
                  onClick={() => setShowMore(s => !s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, margin: '2px 0 14px', cursor: 'pointer', fontFamily: SANS, fontSize: 12, color: MUT }}
                >
                  <span style={{ color: ORG }}>{showMore ? '−' : '+'}</span>
                  <span>Add your role &amp; logo (optional)</span>
                </button>
                {showMore && (
                  <>
                    <Field
                      label="Your Role / Position"
                      autoComplete="organization-title"
                      value={reg.position}
                      onChange={e => set('position', e.target.value)}
                      placeholder="e.g. Club Secretary, Tournament Director, Head Pro"
                    />
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Venue Logo</label>
                      <div style={{ border: '1px dashed rgba(255,0,144,0.3)', padding: 16, background: 'rgba(255,0,144,0.03)', textAlign: 'center' }}>
                        {reg.logo
                          ? <><img src={reg.logo} alt="" style={{ maxHeight: 80, maxWidth: '100%', marginBottom: 6, objectFit: 'contain' }}/><div style={{ fontFamily: SANS, fontSize: 11, color: ORG }}>Logo added</div></>
                          : <div style={{ color: DIM, fontFamily: SANS, fontSize: 12 }}>No logo selected</div>
                        }
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onLogo}
                          style={{ display: 'block', margin: '8px auto 0', fontFamily: SANS, fontSize: 11, color: MUT }}
                        />
                        {logoErr && <div style={{ fontFamily: SANS, fontSize: 11, color: '#ff8a8a', marginTop: 6 }}>{logoErr}</div>}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: '6px 0 12px', textAlign: 'center', lineHeight: 1.5 }}>
              By registering, you agree to our{' '}
              <a href="/terms" style={{ color: MUT, textDecoration: 'underline' }}>Terms</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: MUT, textDecoration: 'underline' }}>Privacy Policy</a>.
            </div>

            {/* Inline error, right above the button — easy to see on mobile, and
                it stays put instead of disappearing like a toast. */}
            {error && (
              <div role="alert" style={{ border: '1px solid rgba(255,90,90,0.5)', background: 'rgba(255,90,90,0.08)', color: '#ff8a8a', fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, padding: '10px 12px', marginBottom: 12 }}>
                {error.msg}
                {error.code === 'email_exists' && (
                  <>
                    {' '}
                    <Link href={loginHref} style={{ color: ORG, textDecoration: 'underline', fontWeight: 700 }}>Log in instead →</Link>
                  </>
                )}
              </div>
            )}

            <Btn full onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating account…' : (isSimulator ? 'Create Account →' : 'Submit Registration →')}
            </Btn>
            {/* Guarantees Enter-to-submit even if Btn doesn't render a real submit button */}
            <button type="submit" tabIndex={-1} aria-hidden style={{ display: 'none' }} />

            <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12, textAlign: 'center' }}>
              No waiting around — every account is approved instantly.
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
