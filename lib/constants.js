export const BG='#1a1a1a',BG2='#242424',BG3='#2e2e2e',ORG='#FF0090',ORG2='#bef264',GOLD='#FF0090',GRN='#FF0090',BDR='rgba(255,255,255,0.08)',TXT='#f0f0f0',MUT='#a0a0a0',DIM='#666666';
export const SANS="var(--font-inter),'Helvetica Neue',sans-serif",DISP="var(--font-bebas),'Arial Black',sans-serif";
export const SEED_KEY='rb_seed_v12',ORGS_KEY='rb_orgs',ENT_KEY='rb_entries';
export const BADGES={platinum:{label:'Platinum Verified',icon:'💎',color:'#bfdbfe',bg:'rgba(147,197,253,0.1)',border:'rgba(147,197,253,0.3)'},tour:{label:'Tour Verified',icon:'★',color:GOLD,bg:'rgba(240,180,41,0.1)',border:'rgba(240,180,41,0.35)'},amateur:{label:'Amateur Verified',icon:'✅',color:GRN,bg:'rgba(34,197,94,0.1)',border:'rgba(34,197,94,0.3)'}};
export const COUNTRIES=[{code:'AF',name:'Afghanistan'},{code:'AL',name:'Albania'},{code:'DZ',name:'Algeria'},{code:'AR',name:'Argentina'},{code:'AU',name:'Australia'},{code:'AT',name:'Austria'},{code:'BH',name:'Bahrain'},{code:'BE',name:'Belgium'},{code:'BR',name:'Brazil'},{code:'BG',name:'Bulgaria'},{code:'KH',name:'Cambodia'},{code:'CA',name:'Canada'},{code:'CL',name:'Chile'},{code:'CN',name:'China'},{code:'CO',name:'Colombia'},{code:'HR',name:'Croatia'},{code:'CZ',name:'Czech Republic'},{code:'DK',name:'Denmark'},{code:'EG',name:'Egypt'},{code:'FI',name:'Finland'},{code:'FR',name:'France'},{code:'DE',name:'Germany'},{code:'GH',name:'Ghana'},{code:'GR',name:'Greece'},{code:'HK',name:'Hong Kong'},{code:'HU',name:'Hungary'},{code:'IN',name:'India'},{code:'ID',name:'Indonesia'},{code:'IE',name:'Ireland'},{code:'IL',name:'Israel'},{code:'IT',name:'Italy'},{code:'JP',name:'Japan'},{code:'KE',name:'Kenya'},{code:'KR',name:'South Korea'},{code:'KW',name:'Kuwait'},{code:'MY',name:'Malaysia'},{code:'MX',name:'Mexico'},{code:'MA',name:'Morocco'},{code:'NL',name:'Netherlands'},{code:'NZ',name:'New Zealand'},{code:'NG',name:'Nigeria'},{code:'NO',name:'Norway'},{code:'OM',name:'Oman'},{code:'PK',name:'Pakistan'},{code:'PH',name:'Philippines'},{code:'PL',name:'Poland'},{code:'PT',name:'Portugal'},{code:'QA',name:'Qatar'},{code:'RO',name:'Romania'},{code:'RU',name:'Russia'},{code:'SA',name:'Saudi Arabia'},{code:'SG',name:'Singapore'},{code:'ZA',name:'South Africa'},{code:'ES',name:'Spain'},{code:'SE',name:'Sweden'},{code:'CH',name:'Switzerland'},{code:'TW',name:'Taiwan'},{code:'TH',name:'Thailand'},{code:'TR',name:'Turkey'},{code:'AE',name:'UAE'},{code:'GB',name:'United Kingdom'},{code:'US',name:'United States'},{code:'UY',name:'Uruguay'},{code:'VN',name:'Vietnam'},{code:'ZW',name:'Zimbabwe'}];
export const toSlug=str=>str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

// Slug logic specifically for player profile pages (/profile/[slug]) —
// kept separate from toSlug() above, which clubs use, because the two
// produce different output for the same input (toSlug collapses runs of
// punctuation into a single hyphen; this keeps existing hyphens and only
// strips other punctuation). Used to be copy-pasted into five different
// files (leaderboard.jsx, clubs/index.jsx, clubs/[slug].jsx,
// EntryModal.jsx, profile/[slug].jsx) — centralized here so they can't
// drift out of sync with each other again.
export function nameToSlug(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Returns the URL slug for a player's public profile, or null if this org
// doesn't have one — i.e. it isn't an approved simulator account. Every
// place that links to /profile/[slug] should go through this rather than
// building the slug directly, so a link is never rendered to a profile
// that pages/profile/[slug].jsx's own lookup (accountType==='simulator')
// won't actually find. Mismatches here were the cause of 404 profile
// links on the leaderboard: pages were linking based on the *entry's*
// is_simulator flag, which can drift out of sync with the org's own
// accountType if that ever changes after submission.
export function profileSlugFor(org) {
  if (!org?.fullName || org.accountType !== 'simulator') return null;
  return org.customSlug || nameToSlug(org.fullName);
}
export const todayStr=()=>new Date().toISOString().slice(0,10);
export const fmtDate=d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});}catch{return d;}};
export const tier=d=>d>=350?'🟡 Elite':d>=300?'🟢 Pro':d>=250?'🔵 Strong':'⚪ Amateur';
export const tierClr=()=>'#FF0090';
export const toB64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});
export function isoWeek(dateStr){const d=new Date(dateStr+'T12:00:00');const j4=new Date(d.getFullYear(),0,4);const mon=new Date(j4);mon.setDate(j4.getDate()-((j4.getDay()+6)%7));const w=Math.floor((d-mon)/(7*864e5))+1;return{y:d.getFullYear(),w};}
export function nowWeek(){return isoWeek(new Date().toISOString().slice(0,10));}
export function weekLabel({y,w}){const j4=new Date(y,0,4),mon=new Date(j4);mon.setDate(j4.getDate()-((j4.getDay()+6)%7)+(w-1)*7);const sun=new Date(mon);sun.setDate(mon.getDate()+6);const f=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});return `Wk ${w} ${f(mon)} – ${f(sun)} ${y}`;}
export function sameWeek(ds,{y,w}){const x=isoWeek(ds);return x.y===y&&x.w===w;}
export function prevWeek({y,w}){return w===1?{y:y-1,w:52}:{y,w:w-1};}
export function nextWeek({y,w}){const nw=nowWeek();if(y>nw.y||(y===nw.y&&w>=nw.w))return{y,w};return w===52?{y:y+1,w:1}:{y,w:w+1};}
