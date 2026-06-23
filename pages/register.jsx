import Head from 'next/head';
import { COUNTRIES, ORG, MUT, TXT, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { Card, Field, Btn } from '../components/UI';
import { toB64 } from '../lib/constants';

const SIMULATORS = [
  "Trackman","Flightscope","GCQuad","Full Swing","Foresight Sports",
  "SkyTrak","Uneekor","Bushnell Launch Pro","Garmin Approach","Other"
];

export default function RegisterPage({ reg, setReg, doRegister }) {
  const isSimulator = reg.type !== 'club';

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

  return (
    <>
      <Head>
        <title>Register | Ripping Bombs</title>
        <meta name="description" content="Register your golf club, tournament, or simulator account on Ripping Bombs. Free to join. Submit verified longest drives to the global leaderboard." />
      </Head>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '28px 18px 80px' }}>
        <div style={{ fontFamily: DISP, fontSize: 30, color: TXT, letterSpacing: 1, marginBottom: 6 }}>Register</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 18 }}>
          Free to join. Select your account type below.
        </div>

        {/* Benefit strip — gives a cold visitor a reason to keep going */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
          {[
            ['📊', 'See how you rank', 'against players worldwide'],
            ['⚡', 'Instant approval', 'no waiting on review'],
            ['🆓', '100% free', 'no card, no catch'],
          ].map(([icon, title, sub]) => (
            <div key={title} style={{ border: `1px solid ${BDR}`, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: TXT, lineHeight: 1.3 }}>{title}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: DIM, lineHeight: 1.3, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        <Card>
          {/* Account type toggle */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .8 }}>
              Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['simulator', '🖥️ Individual / Simulator'], ['club', '🏌️ Golf Club / Event']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setReg({ ...reg, type: val })}
                  style={{ position: 'relative', padding: '12px 8px', background: 'transparent', border: `1px solid ${reg.type === val ? ORG : BDR}`, color: reg.type === val ? ORG : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, cursor: 'pointer', letterSpacing: .3, textAlign: 'center', transition: 'all .15s' }}
                >
                  {val === 'simulator' && (
                    <span style={{ position: 'absolute', top: -8, right: 6, background: ORG, color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 6px', letterSpacing: .4, textTransform: 'uppercase' }}>
                      Most Popular
                    </span>
                  )}
                  {label}
                </button>
              ))}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 8 }}>
              {isSimulator
                ? '🖥️ Submit your own simulator longest drives with screenshot evidence. Account approved instantly — no waiting required.'
                : '🏌️ Register a club, course or event to submit verified competition winners on behalf of players. Reviewed within 24 hours.'}
            </div>
          </div>

          {/* Shared name field */}
          <Field
            label="Your Full Name"
            value={reg.fullName}
            onChange={e => setReg({ ...reg, fullName: e.target.value })}
            placeholder="e.g. James Hargreaves"
            required
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
                label="Course / Club / Event Name"
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
                  Course Logo (optional)
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
            type="password"
            value={reg.pw}
            onChange={e => setReg({ ...reg, pw: e.target.value })}
            placeholder="Choose a password"
            required
          />

          {/* Profile consent moved to post-submission flow — see submit.jsx note */}

          <Btn full onClick={doRegister}>
            {isSimulator ? 'Create Account →' : 'Submit Registration →'}
          </Btn>

          <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12, textAlign: 'center' }}>
            {isSimulator
              ? 'Simulator accounts are approved instantly.'
              : 'Club registrations are reviewed within 24 hours.'}
          </div>
        </Card>
      </div>
    </>
  );
}
