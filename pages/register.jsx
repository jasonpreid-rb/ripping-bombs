import Head from 'next/head';
import { COUNTRIES, ORG, MUT, TXT, BG3, BDR, DIM, SANS, DISP } from '../lib/constants';
import { Card, Field, Btn } from '../components/UI';
import { toB64 } from '../lib/constants';

const SIMULATORS = [
  "Trackman","Flightscope","GCQuad","Full Swing","Foresight Sports",
  "SkyTrak","Uneekor","Bushnell Launch Pro","Garmin Approach","Other"
];

export default function RegisterPage({ reg, setReg, doRegister }) {
  const isSimulator = reg.type === 'simulator';

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
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 28 }}>
          Free to join. Select your account type below.
        </div>

        <Card>
          {/* Account type toggle */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .8 }}>
              Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['club', '🏌️ Golf Club / Event'], ['simulator', '🖥️ Individual / Simulator']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setReg({ ...reg, type: val })}
                  style={{ padding: '12px 8px', background: 'transparent', border: `1px solid ${reg.type === val ? ORG : BDR}`, color: reg.type === val ? ORG : MUT, fontFamily: SANS, fontWeight: 600, fontSize: 12, cursor: 'pointer', letterSpacing: .3, textAlign: 'center', transition: 'all .15s' }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 8 }}>
              {isSimulator
                ? '🖥️ Submit your simulator longest drives. Account approved instantly — no waiting required.'
                : '🏌️ Register a club, course or event. Submit verified competition longest drives to the global leaderboard.'}
            </div>
          </div>

          {/* Shared fields */}
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
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .8 }}>
                  Simulator Brand <span style={{ color: ORG }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={reg.simulator}
                    onChange={e => setReg({ ...reg, simulator: e.target.value })}
                    style={{ width: '100%', background: BG3, border: `1px solid ${BDR}`, padding: '10px 36px 10px 14px', color: reg.simulator ? TXT : DIM, fontFamily: SANS, fontSize: 14, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
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
                <div style={{ border: '1px dashed rgba(163,230,53,0.3)', padding: 16, background: 'rgba(163,230,53,0.03)', textAlign: 'center' }}>
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
