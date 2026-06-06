import Head from 'next/head';
import { useRouter } from 'next/router';
import { TXT, MUT, ORG, DIM, SANS, DISP } from '../lib/constants';
import { Card, Field, Btn } from '../components/UI';

export default function LoginPage({ lgn, setLgn, doLogin }) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Organiser Login | Ripping Bombs</title>
        <meta name="description" content="Log in to your Ripping Bombs organiser account to submit your longest drive competition results." />
      </Head>
      <div style={{ maxWidth:400, margin:'0 auto', padding:'28px 18px 80px' }}>
        <div style={{ fontFamily:DISP, fontSize:30, color:TXT, letterSpacing:1, marginBottom:6 }}>Organiser Login</div>
        <div style={{ fontFamily:SANS, fontSize:13, color:MUT, marginBottom:28 }}>Log in to submit your longest drive competition results.</div>
        <Card>
          <Field label="Email" type="email" value={lgn.email} onChange={e=>setLgn({...lgn,email:e.target.value})} placeholder="you@example.com" required/>
          <Field label="Password" type="password" value={lgn.pw} onChange={e=>setLgn({...lgn,pw:e.target.value})} placeholder="Your password" required/>
          <Btn full onClick={doLogin}>Log In →</Btn>
          <div style={{ fontFamily:SANS, fontSize:11, color:DIM, marginTop:12, textAlign:'center' }}>
            Don't have an account? <span onClick={()=>router.push('/register')} style={{ color:ORG, cursor:'pointer', fontWeight:600 }}>Register here</span>
          </div>
        </Card>
      </div>
    </>
  );
}
