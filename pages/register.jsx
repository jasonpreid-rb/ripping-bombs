import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { COUNTRIES, ORG, MUT, TXT, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { Card, Field, Btn } from '../components/UI';
import { toB64 } from '../lib/constants';

const SIMULATORS = [
  "Trackman","Flightscope","GCQuad","Full Swing","Foresight Sports",
  "SkyTrak","Uneekor","Bushnell Launch Pro","Garmin Approach","Other"
];

// Tier copy — kept in sync with the Free/Premium and Free/TV Display comparisons on the dashboard
const TIERS = {
  simulator: {
    freeLabel: 'Free Account',
    freeBadge: null,
    freeItems: [
      'Submit your own drives, instant approval',
      'Public profile page & global rank',
      'Weekly division leaderboard placement',
    ],
    paidLabel: 'Premium',
    paidBadge: 'Coming soon',
    paidPrice: '$5/mo or $50/yr',
    paidItems: [
      'Auto-generated drive cards to share',
      'Rival tracking & overtaken alerts',
      'Full drive history & progress chart',
      'Weekly recap email',
    ],
    note: 'Every account starts free — Premium will be an optional upgrade from your dashboard once it launches.',
  },
  club: {
    freeLabel: 'Free Venue Account',
    freeBadge: null,
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
    ],
    note: 'Every venue starts on the free tier — upgrade to TV Display & Sponsors anytime from your dashboard, no card required to register.',
  },
};

// Copy for the step-1 choice cards — short enough to read at a glance
const CHOICES = {
  simulator: {
    label: 'Individual',
    sub: 'Simulator player',
    badge: 'Most popular',
    blurb: "Submit your own longest drives and see where you rank.",
    bullets: ['See your rank vs players worldwide', 'Free, always — no card required', 'Approved instantly'],
  },
  club: {
    label: 'Venue Operator',
    sub: 'Club, range or sim bay',
    badge: null,
    blurb: 'Register your venue so players can find you and build your leaderboard.',
    bullets: ['Global exposure for your venue', 'Free, always — no card required', 'Approved instantly'],
  },
};

function TierPreview({ isSimulator }) {
  const t = isSimulator ? TIERS.simulator : TIERS.club;
  const colStyle = { flex: '1 1 220px', minWidth: 0 };
  const headStyle = { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 };
  const labelStyle = { fontFamily: SANS, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6 };
  const itemStyle = { display: 'flex', gap: 7, fontFamily: SANS, fontSize: 11.5, color: MUT, lineHeight: 1.5, marginBottom: 5 };
  const badgeStyle = { background: 'rgba(255,0,144,0.15)', color: ORG, border: `1px solid ${ORG}`, borderRadius: 20, padding: '1px 7px', fontSize: 9, fontWeight: 700, letterSpacing: .3, whiteSpace: 'nowrap' };

  return (
    <div style={{ border: `1px solid ${BDR}`, background: BG3, padding: '16px 16px 14px', marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={colStyle}>
          <div style={headStyle}>
            <span style={{ ...labelStyle, color: MUT }}>{t.freeLabel}</span>
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
            <span style={{ ...labelStyle, color: ORG }}>{t.paidLabel}</span>
            <span style={badgeStyle}>{t.paidBadge}</span>
          </div>
          {t.paidItems.map(item => (
            <div key={item} style={itemStyle}>
              <span style={{ color: ORG }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
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

// Step 1 — the single question. Big, tappable, welcoming. Nothing else competes for attention.
function ChoiceStep({ onChoose, redirectTo }) {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '40px 18px 80px' }}>
      <div style={{ fontFamily: DISP, fontSize: 30, color: TXT, letterSpacing: 1, marginBottom: 8, textAlign: 'center' }}>
        Welcome to Ripping Bombs
      </div>
      <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, marginBottom: 6, textAlign: 'center' }}>
        {redirectTo ? "One quick question and you'll be right back to submitting your drive." : "Free to join, forever. One quick question to get you set up."}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: DIM, marginBottom: 32, textAlign: 'center' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: ORG, textDecoration: 'underline' }}>Log in</a>
      </div>

      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: TXT, textAlign: 'center', marginBottom: 16 }}>
        Are you an individual, or a venue operator?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {['simulator', 'club'].map(val => {
          const c = CHOICES[val];
          return (
            // The whole panel is clickable, plus an explicit button bottom-right
            // for a clearer call to action. Using a div (not a nested button) as
            // the panel itself, since a <button> can't contain another <button>.
            <div
              key={val}
              role="button"
              tabIndex={0}
              onClick={() => onChoose(val)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onChoose(val); }}
              style={{
                position: 'relative',
                textAlign: 'left',
                width: '100%',
                background: BG3,
                border: `1px solid ${BDR}`,
                borderTop: `2px solid ${ORG}`,
                padding: '20px 20px 18px',
                cursor: 'pointer',
                fontFamily: SANS,
              }}
            >
              {c.badge && (
                <span style={{ position: 'absolute', top: -9, right: 16, background: ORG, color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 7px', letterSpacing: .4, textTransform: 'uppercase' }}>
                  {c.badge}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: TXT }}>{c.label}</span>
                <span style={{ fontSize: 11, color: DIM }}>{c.sub}</span>
              </div>
              <div style={{ fontSize: 12.5, color: MUT, marginBottom: 12, lineHeight: 1.4 }}>{c.blurb}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
                {c.bullets.map(b => (
                  <div key={b} style={{ display: 'flex', gap: 7, fontSize: 11, color: DIM }}>
                    <span style={{ color: ORG }}>✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onChoose(val); }}
                  style={{ background: 'transparent', border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: '8px 16px', cursor: 'pointer', letterSpacing: .3 }}
                >
                  Continue →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, textAlign: 'center', marginTop: 20 }}>
        No credit card or payment details required to register.
      </div>
    </div>
  );
}

export default function RegisterPage({ reg, setReg, doRegister }) {
  const router = useRouter();
  const redirectTo = typeof router.query.redirect === 'string' ? router.query.redirect : null;
  const isSimulator = reg.type !== 'club';
  const [showPw, setShowPw] = useState(false);
  // Always start on the choice screen — reg.type may already carry a default
  // value from the parent's initial state, so it isn't a reliable signal that
  // the user actually picked something.
  const [step, setStep] = useState('choose');
  const [showTiers, setShowTiers] = useState(false);

  const CountrySelect = () => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 }}>
        Country <span style={{ color: ORG }}>*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={reg.country}
          onChange={e => setReg({ ...reg, country: e.target.value })}
          style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '10px 36px 10px 14px', color: reg.country ? TXT : DIM, fontFamily: SANS, fontSize: 14, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
        >
          <option value="">Select country...</option>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>▾</span>
      </div>
    </div>
  );

  if (step === 'choose') {
    return (
      <>
        <Head>
          <title>Register | Ripping Bombs</title>
          <meta name="description" content="Register your venue or simulator account on Ripping Bombs. Free to join. Submit verified longest drives to the global leaderboard." />
        </Head>
        <ChoiceStep
          redirectTo={redirectTo}
          onChoose={val => { setReg({ ...reg, type: val }); setStep('form'); }}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Register | Ripping Bombs</title>
        <meta name="description" content="Register your venue or simulator account on Ripping Bombs. Free to join. Submit verified longest drives to the global leaderboard." />
      </Head>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '28px 18px 80px' }}>
        {/* Compact header — the pitch already happened on the choice screen, so this
            stays short on purpose to keep the form itself above the fold. */}
        <button
          type="button"
          onClick={() => setStep('choose')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 14, fontFamily: SANS, fontSize: 12, color: DIM }}
        >
          <span style={{ color: ORG }}>←</span>
          <span>Registering as <strong style={{ color: TXT }}>{CHOICES[isSimulator ? 'simulator' : 'club'].label}</strong> · change</span>
        </button>

        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: .5, marginBottom: 16 }}>
          {isSimulator ? "Let's set up your account" : "Let's register your venue"}
        </div>

        <Card>
          <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginBottom: 18 }}>
            Just a couple of quick questions — fields marked <span style={{ color: ORG }}>*</span> are required, everything else is optional.
          </div>

          {/* Free vs paid tier explainer — collapsed by default so it doesn't push
              the form fields down; still one tap away for anyone curious. */}
          <button
            type="button"
            onClick={() => setShowTiers(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'none', border: `1px solid ${BDR}`, padding: '10px 14px', marginBottom: 14, cursor: 'pointer', fontFamily: SANS, fontSize: 11.5, color: MUT, textAlign: 'left' }}
          >
            <span style={{ color: ORG }}>{showTiers ? '▾' : '▸'}</span>
            <span>What's included — Free vs {isSimulator ? 'Premium' : 'TV Display & Sponsors'}</span>
          </button>
          {showTiers && <TierPreview isSimulator={isSimulator} />}

          {/* Section: personal / venue details */}
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: ORG, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Your Details
          </div>

          {/* Shared name field */}
          <Field
            label="Your Full Name"
            value={reg.fullName}
            onChange={e => setReg({ ...reg, fullName: e.target.value })}
            placeholder="e.g. James Hargreaves"
            required
            autoFocus
          />

          {/* Simulator fields */}
          {isSimulator ? (
            <>
              {/* Gender — captured once at registration */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 }}>
                  Gender <span style={{ color: ORG }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['male', 'female'].map(g => (
                    <button key={g} type="button" onClick={() => setReg({ ...reg, gender: g })}
                      style={{ flex: 1, padding: '10px', background: reg.gender === g ? 'transparent' : BG3, border: `1px solid ${reg.gender === g ? ORG : BDR}`, color: reg.gender === g ? ORG : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: .5 }}>
                      {g === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of birth — captured once at registration so age is derived
                  automatically at submission time, instead of re-entered (and
                  potentially mistyped) on every single drive. */}
              <Field
                label="Date of Birth"
                type="date"
                value={reg.dob}
                onChange={e => setReg({ ...reg, dob: e.target.value })}
                required
              />
              <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: -8, marginBottom: 14 }}>
                Used to work out your age category — you won't need to enter it again on future drives.
              </div>

              {/* Simulator brand — optional, visually de-emphasized */}
              <div style={{ marginBottom: 14, opacity: 0.8 }}>
                <label style={{ display: 'block', fontFamily: SANS, fontSize: 10, fontWeight: 500, color: DIM, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 }}>
                  Simulator Brand <span style={{ fontWeight: 400 }}>(optional — skip if unsure)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={reg.simulator}
                    onChange={e => setReg({ ...reg, simulator: e.target.value })}
                    style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '8px 36px 8px 14px', color: reg.simulator ? TXT : DIM, fontFamily: SANS, fontSize: 13, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">Select simulator...</option>
                    {SIMULATORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DIM, fontSize: 10 }}>▾</span>
                </div>
              </div>

              <Field
                label="Location / City (optional)"
                value={reg.location}
                onChange={e => setReg({ ...reg, location: e.target.value })}
                placeholder="e.g. London, UK"
              />
              <CountrySelect />
            </>
          ) : (
            <>
              {/* Club fields */}
              <Field
                label="Your Role / Position"
                value={reg.position}
                onChange={e => setReg({ ...reg, position: e.target.value })}
                placeholder="e.g. Club Secretary, Tournament Director, Head Pro"
                required
              />
              <Field
                label="Venue Name"
                value={reg.courseName}
                onChange={e => setReg({ ...reg, courseName: e.target.value })}
                placeholder="Augusta National Golf Club"
                required
              />
              <Field
                label="Location / City"
                value={reg.location}
                onChange={e => setReg({ ...reg, location: e.target.value })}
                placeholder="Augusta, Georgia"
                required
              />
              <CountrySelect />
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 }}>
                  Venue Logo (optional)
                </label>
                {/* ✅ Fixed: was rgba(163,230,53,...) lime green — now neon pink */}
                <div style={{ border: '1px dashed rgba(255,0,144,0.3)', padding: 16, background: 'rgba(255,0,144,0.03)', textAlign: 'center' }}>
                  {reg.logo
                    ? <><img src={reg.logo} alt="" style={{ maxHeight: 80, maxWidth: '100%', marginBottom: 6, objectFit: 'cover' }}/><div style={{ fontFamily: SANS, fontSize: 11, color: ORG }}>Logo uploaded</div></>
                    : <div style={{ color: DIM, fontFamily: SANS, fontSize: 12 }}>No logo selected</div>
                  }
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async e => { if (e.target.files[0]) setReg({ ...reg, logo: await toB64(e.target.files[0]) }); }}
                    style={{ display: 'block', margin: '8px auto 0', fontFamily: SANS, fontSize: 11, color: MUT }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Section: login credentials */}
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: ORG, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 14, paddingTop: 18, borderTop: `1px solid ${BDR}` }}>
            Login Details
          </div>

          {/* Shared auth fields */}
          <Field
            label="Email Address"
            type="email"
            value={reg.email}
            onChange={e => setReg({ ...reg, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={reg.pw}
            onChange={e => setReg({ ...reg, pw: e.target.value })}
            placeholder="Choose a password"
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
          <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: -8, marginBottom: 14 }}>
            This is just for logging back in — keep it somewhere safe.
          </div>

          {/* Profile consent moved to post-submission flow — see submit.jsx note */}

          <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginBottom: 12, textAlign: 'center', lineHeight: 1.5 }}>
            By registering, you agree to our{' '}
            <a href="/terms" style={{ color: MUT, textDecoration: 'underline' }}>Terms</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: MUT, textDecoration: 'underline' }}>Privacy Policy</a>.
          </div>

          <Btn full onClick={() => doRegister(redirectTo)}>
            {isSimulator ? 'Create Account →' : 'Submit Registration →'}
          </Btn>

          <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12, textAlign: 'center' }}>
            No waiting around — every account is approved instantly.
          </div>
        </Card>
      </div>
    </>
  );
}
