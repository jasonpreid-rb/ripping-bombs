import { supabase } from '../lib/supabaseClient';
import { ORG, TXT, MUT, BDR, BG3, SANS } from '../lib/constants';

export default function GoogleLoginButton({ redirectTo = '/', label = 'Continue with Google' }) {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) console.error('Google login failed:', error.message);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
        <div style={{ flex: 1, height: 1, background: BDR }} />
        <span style={{ fontFamily: SANS, fontSize: 10, color: MUT, textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
        <div style={{ flex: 1, height: 1, background: BDR }} />
      </div>

      <button
        type="button"
        onClick={handleLogin}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: BG3,
          border: `1px solid ${BDR}`,
          color: TXT,
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 600,
          padding: '11px 14px',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = ORG)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = BDR)}
      >
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.4 26.8 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.5 5C9.6 39.7 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.3 5.3C40.8 36 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
        {label}
      </button>
    </>
  );
}
