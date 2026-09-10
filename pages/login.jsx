import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { TXT, MUT, ORG, DIM, BG3, BDR, SANS, DISP } from '../lib/constants';
import { Card, Field, Btn } from '../components/UI';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage({ lgn, setLgn, doLogin, doForgotPassword }) {
  const router = useRouter();
  const redirectTo = typeof router.query.redirect === 'string' ? router.query.redirect : null;
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleForgot = async () => {
    if (!forgotEmail) return;
    setSending(true);
    setLgn({ ...lgn, email: forgotEmail });
    try {
      // Server-side only now — never reads or handles the password
      // client-side. Generates + emails a temporary password.
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
    } catch {}
    setSending(false);
    setForgotSent(true);
  };

  return (
    <>
      <Head>
        <title>Login | Ripping Bombs</title>
        <meta name="description" content="Log in to your Ripping Bombs account to submit your longest drive competition results." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '28px 18px 80px' }}>
        <div style={{ fontFamily: DISP, fontSize: 30, color: TXT, letterSpacing: 1, marginBottom: 6 }}>
          {forgotMode ? 'Reset Password' : 'Login'}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 28 }}>
          {forgotMode
            ? 'Enter your email and we\'ll send you a temporary password.'
            : 'Log in to submit your longest drive competition results.'}
        </div>

        <Card>
          {forgotMode ? (
            forgotSent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: ORG, marginBottom: 6 }}>Email sent!</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginBottom: 20 }}>
                  If that address is registered, you'll receive a temporary password shortly.
                </div>
                <button
                  onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                  style={{ fontFamily: SANS, fontSize: 12, color: ORG, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Back to login
                </button>
              </div>
            ) : (
              <>
                <Field
                  label="Email Address"
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <Btn full onClick={handleForgot} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Temporary Password →'}
                </Btn>
                <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12, textAlign: 'center' }}>
                  <span onClick={() => setForgotMode(false)} style={{ color: ORG, cursor: 'pointer', fontWeight: 600 }}>
                    Back to login
                  </span>
                </div>
              </>
            )
          ) : (
            <>
              <Field
                label="Email"
                type="email"
                value={lgn.email}
                onChange={e => setLgn({ ...lgn, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
              <Field
                label="Password"
                type="password"
                value={lgn.pw}
                onChange={e => setLgn({ ...lgn, pw: e.target.value })}
                placeholder="Your password"
                required
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!lgn.rememberMe}
                    onChange={e => setLgn({ ...lgn, rememberMe: e.target.checked })}
                    style={{ accentColor: ORG, width: 14, height: 14 }}
                  />
                  <span style={{ fontFamily: SANS, fontSize: 12, color: MUT }}>Remember me for 30 days</span>
                </label>
                <span
                  onClick={() => setForgotMode(true)}
                  style={{ fontFamily: SANS, fontSize: 12, color: ORG, cursor: 'pointer', fontWeight: 600 }}>
                  Forgot password?
                </span>
              </div>

              <Btn full onClick={() => doLogin(redirectTo)}>Log In →</Btn>

              <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 12, textAlign: 'center' }}>
                Don't have an account?{' '}
                <span onClick={() => router.push(redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register')} style={{ color: ORG, cursor: 'pointer', fontWeight: 600 }}>
                  Register here
                </span>
              </div>

              <GoogleLoginButton redirectTo={redirectTo || '/dashboard'} />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
