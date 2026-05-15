import { useState, useEffect, useRef } from "react";

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const RB_LOGO_SVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.89 595.28" style={{height:40,width:"auto",display:"block"}} aria-label="Ripping Bombs">
    <polygon fill="#111111" points="146.662,300.557 22.035,521.864 155.217,521.864 279.933,300.406 216.568,188.458 369.538,188.458 421.032,72.414 17.521,72.414"/>
    <polygon fill="#111111" points="695.492,293.872 824.537,72.414 820.016,72.414 820.029,72.414 686.834,72.414 686.834,72.414 421.032,72.414 472.527,188.458 621.49,188.458 562.133,293.872 623.367,405.807 472.527,405.807 421.032,521.864 686.834,521.851 686.834,521.864 820.029,521.864 820.016,521.851 824.537,521.851"/>
  </svg>
);

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_PW  = "LongShot2026";
const SEED_KEY  = "rb_seed_v8";
const ORGS_KEY  = "rb_orgs";
const ENT_KEY   = "rb_entries";
const NOTIF_KEY = "rb_notifications";

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const _m = {};
const db = {
  async get(k)    { try { const r = await window.storage.get(k); if(r?.value){ const v=JSON.parse(r.value); _m[k]=v; return v; } } catch{} return _m[k]??null; },
  async set(k,v)  { _m[k]=v; try{ await window.storage.set(k,JSON.stringify(v)); }catch{} },
  async del(k)    { delete _m[k]; try{ await window.storage.delete(k); }catch{} },
};

// ─── WEEK UTILS ───────────────────────────────────────────────────────────────
function isoWeek(dateStr) {
  const d = new Date(dateStr+"T12:00:00");
  const j4 = new Date(d.getFullYear(),0,4);
  const mon = new Date(j4); mon.setDate(j4.getDate()-((j4.getDay()+6)%7));
  const w = Math.floor((d-mon)/(7*864e5))+1;
  return { y:d.getFullYear(), w };
}
function nowWeek()  { return isoWeek(new Date().toISOString().slice(0,10)); }
function weekLabel({y,w}) {
  const j4=new Date(y,0,4), mon=new Date(j4);
  mon.setDate(j4.getDate()-((j4.getDay()+6)%7)+(w-1)*7);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  const f=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  return `Wk ${w}  ${f(mon)} – ${f(sun)} ${y}`;
}
function sameWeek(ds,{y,w}){ const x=isoWeek(ds); return x.y===y&&x.w===w; }
function prevWeek({y,w})   { return w===1?{y:y-1,w:52}:{y,w:w-1}; }
function nextWeek({y,w})   { const nw=nowWeek(); if(y>nw.y||(y===nw.y&&w>=nw.w)) return {y,w}; return w===52?{y:y+1,w:1}:{y,w:w+1}; }
const todayStr = ()=>new Date().toISOString().slice(0,10);
const fmtDate  = d=>{ try{ return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }catch{return d;} };
const tier     = d=>d>=350?"🟡 Elite":d>=300?"🟢 Pro":d>=250?"🔵 Strong":"⚪ Amateur";
const tierClr  = d=>"#C8102E";
const toB64    = f=>new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });

// ─── DESIGN TOKENS  (Strava x RippingBombs) ──────────────────────────────────
// Core palette: near-black backgrounds, Strava orange CTA, RB gold accents
const BG   = "#f5f5f0";  // warm off-white
const BG2  = "#ffffff";  // card bg
const BG3  = "#e8e8e2";  // elevated
const ORG  = "#FC4C02";  // Strava orange — primary CTA
const ORG2 = "#ff6b35";  // lighter orange hover
const GOLD = "#f0b429";  // RB gold — achievements/records
const GRN  = "#22c55e";  // success green
const BDR  = "rgba(0,0,0,0.10)";
const TXT  = "#111111";
const MUT  = "#555555";
const DIM  = "#999999";
const SANS = "'Inter','Helvetica Neue',sans-serif";
const DISP = "'Bebas Neue','Arial Black',sans-serif";

// ─── BADGE DEFINITIONS ───────────────────────────────────────────────────────
const BADGES = {
  platinum: { label:"Platinum Verified", icon:"💎", color:"#bfdbfe", bg:"rgba(147,197,253,0.1)",  border:"rgba(147,197,253,0.3)" },
  tour:     { label:"Tour Verified",     icon:"★", color:GOLD,      bg:"rgba(240,180,41,0.1)",   border:"rgba(240,180,41,0.35)" },
  amateur:  { label:"Amateur Verified",  icon:"✅", color:GRN,       bg:"rgba(34,197,94,0.1)",    border:"rgba(34,197,94,0.3)"  },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }

const SEED_ORGS = [
  {id:"o1",name:"James Hargreaves",courseName:"Royal Birkdale Golf Club",   location:"Southport, England",       email:"james@royalbirkdale.com",  pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o2",name:"Caitlin O'Brien", courseName:"Lahinch Golf Club",          location:"Lahinch, Ireland",         email:"caitlin@lahinch.ie",       pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o3",name:"Magnus Lindqvist",courseName:"Barsebäck G&CC",             location:"Malmö, Sweden",            email:"magnus@barseback.se",      pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o4",name:"Hiroshi Tanaka",  courseName:"Hirono Golf Club",            location:"Kobe, Japan",              email:"hiroshi@hirono.jp",        pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o5",name:"Priya Nair",      courseName:"Royal Calcutta Golf Club",    location:"Kolkata, India",           email:"priya@rcgc.in",            pw:"demo",logo:"",status:"approved",badge:"amateur"},
  {id:"o6",name:"Dylan Schwartz",  courseName:"Bethpage Black",              location:"New York, USA",            email:"dylan@bethpage.com",       pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o7",name:"Amara Diallo",    courseName:"Leopard Creek CC",            location:"Malelane, South Africa",   email:"amara@leopardcreek.co.za", pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o8",name:"Sofia Reyes",     courseName:"Club de Golf Chapultepec",    location:"Mexico City, Mexico",      email:"sofia@chapultepec.mx",     pw:"demo",logo:"",status:"approved",badge:"amateur"},
  {id:"o9",name:"Lena Fischer",    courseName:"Golf Club Bad Griesbach",     location:"Bavaria, Germany",         email:"lena@gcbg.de",             pw:"demo",logo:"",status:"pending", badge:null},
  {id:"o10",name:"Will Cartwright",courseName:"Carnoustie Golf Links",       location:"Carnoustie, Scotland",     email:"will@carnoustie.co.uk",    pw:"demo",logo:"",status:"pending", badge:null},
];

const SEED_ENTRIES = [
  {id:"e01",orgId:"o6",player:"Marcus Webb",     dist:368,club:"TaylorMade Stealth 2",           hcp:2, age:34,date:daysAgo(0),photo:""},
  {id:"e02",orgId:"o1",player:"Tom Ashworth",    dist:334,club:"Callaway Paradym",               hcp:7, age:28,date:daysAgo(0),photo:""},
  {id:"e03",orgId:"o4",player:"Kenji Mori",      dist:321,club:"Ping G430 LST",                  hcp:0, age:41,date:daysAgo(0),photo:""},
  {id:"e04",orgId:"o7",player:"Sipho Dlamini",   dist:298,club:"Cobra Aerojet LS",               hcp:14,age:22,date:daysAgo(0),photo:""},
  {id:"e05",orgId:"o2",player:"Finn O'Sullivan", dist:317,club:"Titleist TSR3",                  hcp:5, age:37,date:daysAgo(0),photo:""},
  {id:"e06",orgId:"o3",player:"Erik Johansson",  dist:352,club:"TaylorMade Qi10 LS",             hcp:1, age:29,date:daysAgo(1),photo:""},
  {id:"e07",orgId:"o8",player:"Carlos Mendoza",  dist:309,club:"Callaway Paradym Ai Smoke",      hcp:9, age:45,date:daysAgo(1),photo:""},
  {id:"e08",orgId:"o5",player:"Arjun Sharma",    dist:288,club:"Srixon ZX5 Mk II",               hcp:3, age:31,date:daysAgo(1),photo:""},
  {id:"e09",orgId:"o6",player:"Tyler Briggs",    dist:271,club:"Cleveland Launcher XL2",         hcp:18,age:55,date:daysAgo(1),photo:""},
  {id:"e10",orgId:"o1",player:"Oliver Crane",    dist:343,club:"Titleist TSi3",                  hcp:4, age:26,date:daysAgo(1),photo:""},
  {id:"e11",orgId:"o4",player:"Ryo Fujiwara",    dist:374,club:"Ping G430 Max 10K",              hcp:0, age:24,date:daysAgo(2),photo:""},
  {id:"e12",orgId:"o2",player:"Declan Murphy",   dist:295,club:"TaylorMade Stealth HD",          hcp:11,age:48,date:daysAgo(2),photo:""},
  {id:"e13",orgId:"o7",player:"Thandeka Nkosi",  dist:326,club:"Cobra Darkspeed X",              hcp:6, age:33,date:daysAgo(2),photo:""},
  {id:"e14",orgId:"o8",player:"Valentina Cruz",  dist:263,club:"Mizuno ST-X 230",                hcp:16,age:62,date:daysAgo(2),photo:""},
  {id:"e15",orgId:"o3",player:"Lars Eklund",     dist:348,club:"Callaway Paradym Triple Diamond", hcp:2, age:38,date:daysAgo(2),photo:""},
  {id:"e16",orgId:"o5",player:"Rohit Menon",     dist:302,club:"Wilson Dynapower",               hcp:8, age:44,date:daysAgo(3),photo:""},
  {id:"e17",orgId:"o1",player:"James Whitfield", dist:361,club:"TaylorMade Qi10",                hcp:0, age:27,date:daysAgo(3),photo:""},
  {id:"e18",orgId:"o6",player:"DeShawn Porter",  dist:344,club:"Ping G430 Max",                  hcp:5, age:19,date:daysAgo(3),photo:""},
  {id:"e19",orgId:"o2",player:"Cormac Byrne",    dist:248,club:"Titleist TSR2",                  hcp:20,age:67,date:daysAgo(3),photo:""},
  {id:"e20",orgId:"o4",player:"Takeshi Ono",     dist:337,club:"Srixon ZX7 Mk II",               hcp:3, age:35,date:daysAgo(3),photo:""},
  {id:"e21",orgId:"o7",player:"Bongani Zulu",    dist:318,club:"Cobra Aerojet Max",              hcp:12,age:40,date:daysAgo(4),photo:""},
  {id:"e22",orgId:"o3",player:"Björn Magnusson", dist:357,club:"TaylorMade Stealth 2+",          hcp:1, age:30,date:daysAgo(4),photo:""},
  {id:"e23",orgId:"o8",player:"Diego Fuentes",   dist:294,club:"Callaway Rogue ST LS",           hcp:7, age:52,date:daysAgo(4),photo:""},
  {id:"e24",orgId:"o5",player:"Vikram Pillai",   dist:277,club:"Titleist TSR1",                  hcp:10,age:58,date:daysAgo(4),photo:""},
  {id:"e25",orgId:"o6",player:"Ryan Kowalski",   dist:339,club:"Mizuno ST-Z 230",                hcp:4, age:23,date:daysAgo(4),photo:""},
];

async function initData(){
  const seeded = await db.get(SEED_KEY);
  const existing = await db.get(ORGS_KEY);
  if(!seeded || !existing || existing.length===0){
    await db.set(ORGS_KEY, SEED_ORGS);
    await db.set(ENT_KEY, SEED_ENTRIES);
    await db.set(SEED_KEY, true);
  }
  return { orgs: _m[ORGS_KEY]||SEED_ORGS, entries: _m[ENT_KEY]||SEED_ENTRIES };
}

// ─── EMAIL NOTIFICATION (simulated via mailto) ────────────────────────────────
function sendRegistrationNotification(org) {
  const subject = encodeURIComponent(`New Course Registration: ${org.courseName}`);
  const body = encodeURIComponent(
    `New registration request received on Ripping Bombs:

` +
    `Course: ${org.courseName}
` +
    `Organiser: ${org.name}
` +
    `Location: ${org.location}
` +
    `Email: ${org.email}

` +
    `Login to the admin dashboard to approve or reject this registration.
` +
    `https://www.rippingbombs.com`
  );
  window.open(`mailto:rippingbombs@outlook.com?subject=${subject}&body=${body}`, "_blank");
}

// ─── SHARE UTILS ─────────────────────────────────────────────────────────────
function shareEntry(entry, org) {
  const text = `⛳ ${entry.player} smashed ${cvt(entry.dist)} ${unitLbl} at ${org?.courseName||"a course"} — ${tier(entry.dist)} | Ripping Bombs Global Long Drive Database`;
  const url = "https://www.rippingbombs.com";
  if (navigator.share) {
    navigator.share({ title:"Ripping Bombs", text, url }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(`${text} ${url}`).catch(()=>{});
  }
}

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────
function Toast({msg,onDone}){
  useEffect(()=>{ const t=setTimeout(onDone,3200); return()=>clearTimeout(t); },[]);
  return <div style={{position:"fixed",bottom:22,right:22,zIndex:9999,background:BG3,border:`1px solid ${GRN}`,borderRadius:10,padding:"12px 20px",fontFamily:SANS,fontSize:12,color:GRN,boxShadow:"0 8px 30px rgba(0,0,0,0.12)",letterSpacing:.5,animation:"su .3s ease"}}>[OK] {msg}</div>;
}

function Btn({children,onClick,variant="orange",small=false,full=false,style:sx={}}){
  const v={
    orange:  {background:`linear-gradient(135deg,${ORG},${ORG2})`,color:"#fff",   border:"none"},
    ghost:   {background:"transparent",                            color:ORG,     border:`1px solid rgba(252,76,2,0.4)`},
    subtle:  {background:"rgba(255,255,255,0.05)",                 color:MUT,     border:`1px solid ${BDR}`},
    danger:  {background:"rgba(220,60,60,0.08)",                   color:"#f87171",border:"1px solid rgba(220,60,60,0.25)"},
    approve: {background:"rgba(34,197,94,0.1)",                    color:GRN,     border:"1px solid rgba(34,197,94,0.3)"},
    gold:    {background:`linear-gradient(135deg,#c9a84c,${GOLD})`,color:BG,      border:"none"},
  }[variant]||{};
  return <button onClick={onClick} style={{...v,fontFamily:SANS,fontWeight:700,fontSize:small?10:12,letterSpacing:.5,cursor:"pointer",borderRadius:8,padding:small?"5px 12px":"10px 22px",width:full?"100%":"auto",transition:"opacity .15s,transform .1s",...sx}}
    onMouseEnter={e=>{e.currentTarget.style.opacity=".85";e.currentTarget.style.transform="translateY(-1px)";}}
    onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}>{children}</button>;
}

function Field({label,type="text",value,onChange,placeholder,min,max,required}){
  return <div style={{marginBottom:14}}>
    <label style={{display:"block",fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginBottom:5,textTransform:"uppercase",letterSpacing:.8}}>
      {label}{required&&<span style={{color:ORG,marginLeft:2}}>*</span>}
    </label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max}
      style={{width:"100%",background:BG3,border:`1px solid ${BDR}`,borderRadius:8,padding:"10px 14px",color:TXT,fontFamily:SANS,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
      onFocus={e=>e.target.style.borderColor=ORG}
      onBlur={e=>e.target.style.borderColor=BDR}/>
  </div>;
}

function PhotoField({label,value,onChange,required}){
  return <div style={{marginBottom:14}}>
    <label style={{display:"block",fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginBottom:5,textTransform:"uppercase",letterSpacing:.8}}>
      {label}{required&&<span style={{color:ORG,marginLeft:2}}>*</span>}
    </label>
    <div style={{border:`1px dashed rgba(252,76,2,0.3)`,borderRadius:10,padding:16,background:"rgba(252,76,2,0.03)",textAlign:"center"}}>
      {value?<><img src={value} alt="" style={{maxHeight:100,maxWidth:"100%",borderRadius:8,marginBottom:6,objectFit:"cover"}}/><div style={{fontFamily:SANS,fontSize:11,color:GRN}}>Photo uploaded</div></>:<div style={{color:DIM,fontFamily:SANS,fontSize:12}}>No photo selected</div>}
      <input type="file" accept="image/*" onChange={onChange} style={{display:"block",margin:"8px auto 0",fontFamily:SANS,fontSize:11,color:MUT}}/>
    </div>
  </div>;
}

function Card({children,style:sx={}}){
  return <div style={{background:BG2,border:`1px solid ${BDR}`,borderRadius:14,padding:24,...sx}}>{children}</div>;
}

function Pill({label,color}){
  const map={approved:GRN,pending:GOLD,rejected:"#f87171",disabled:"#6b7280"};
  const c=map[color]||MUT;
  return <span style={{fontFamily:SANS,fontSize:10,fontWeight:600,letterSpacing:.8,color:c,background:`${c}18`,border:`1px solid ${c}44`,borderRadius:4,padding:"2px 8px",textTransform:"uppercase"}}>{label}</span>;
}

function BadgePill({badge,small}){
  if(!badge||!BADGES[badge]) return null;
  const b=BADGES[badge];
  return <span style={{fontFamily:SANS,fontSize:small?9:10,fontWeight:600,color:b.color,background:b.bg,border:`1px solid ${b.border}`,borderRadius:4,padding:small?"1px 6px":"2px 9px",whiteSpace:"nowrap",letterSpacing:.5}}>{b.icon} {b.label}</span>;
}

function Overlay({children,onClose}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:BG2,border:`1px solid rgba(255,255,255,0.1)`,borderRadius:18,width:"100%",maxWidth:520,padding:30,position:"relative",boxShadow:"0 32px 100px rgba(0,0,0,0.15)",maxHeight:"92vh",overflowY:"auto"}}>
      <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"none",border:"none",color:MUT,fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
      {children}
    </div>
  </div>;
}

// ─── CROSS-HIGHLIGHT TABLE ────────────────────────────────────────────────────
function LeaderTable({rows,orgFor,onView}){
  const [hr,setHr]=useState(null);
  const [hc,setHc]=useState(null);
  const COLS=["Rank","Player","Distance","Club","HCP","Age","Course","Date","Tier","Share"];

  const bg=(ri,ci)=>{
    const rh=hr===ri, ch=hc===ci;
    if(rh&&ch) return ORG;
    if(rh) return "rgba(252,76,2,0.1)";
    if(ch) return "rgba(252,76,2,0.05)";
    return "transparent";
  };
  const fg=(ri,ci)=>{
    if(hr===ri&&hc===ci) return "#fff";
    if(hr===ri||hc===ci) return TXT;
    return MUT;
  };

  const cellS=(ri,ci)=>({padding:"12px 14px",fontFamily:SANS,fontSize:13,background:bg(ri,ci),color:fg(ri,ci),borderBottom:`1px solid rgba(255,255,255,0.04)`,transition:"background .1s,color .1s",whiteSpace:"nowrap",cursor:"pointer"});

  return <div style={{overflowX:"auto",borderRadius:14,border:`1px solid ${BDR}`,background:BG2}}>
    <table style={{width:"100%",borderCollapse:"collapse",minWidth:750}}>
      <thead>
        <tr>
          {COLS.map((col,ci)=><th key={col} onMouseEnter={()=>setHc(ci)} onMouseLeave={()=>setHc(null)}
            style={{padding:"11px 14px",fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1.2,color:hc===ci?ORG:DIM,textTransform:"uppercase",textAlign:"left",background:hc===ci?"rgba(252,76,2,0.05)":"transparent",borderBottom:`2px solid ${BDR}`,transition:"all .12s",userSelect:"none"}}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((e,ri)=>{
          const org=orgFor(e.orgId);
          const medal=ri===0?"🥇":ri===1?"🥈":ri===2?"🥉":null;
          const distEl=<span style={{fontFamily:DISP,fontSize:20,color:hr===ri&&hc===2?"#fff":tierClr(e.dist),letterSpacing:.5}}>{cvt(e.dist)}<span style={{fontFamily:SANS,fontSize:10,color:hr===ri&&hc===2?"rgba(255,255,255,0.7)":DIM,marginLeft:3}}>{unitLbl}</span></span>;
          const cells=[
            medal?<span style={{fontSize:20}}>{medal}</span>:<span style={{fontFamily:DISP,fontSize:14,color:DIM}}>#{ri+1}</span>,
            <span style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:hr===ri&&hc===1?"#fff":TXT}}>{e.player}</span>,
            distEl,
            <span style={{fontSize:12}}>{e.club}</span>,
            <span style={{fontSize:12}}>{e.hcp}</span>,
            <span style={{fontSize:12}}>{e.age}</span>,
            <div><span style={{fontSize:12}}>{org?.courseName||"—"}</span>{org?.badge&&<span style={{marginLeft:6}}><BadgePill badge={org.badge} small/></span>}</div>,
            <span style={{fontSize:11,color:DIM}}>{fmtDate(e.date)}</span>,
            <span style={{fontFamily:SANS,fontSize:10,fontWeight:600,color:hr===ri&&hc===8?"#fff":tierClr(e.dist)}}>{tier(e.dist)}</span>,
            <button onClick={ev=>{ev.stopPropagation();shareEntry(e,org);}} style={{background:"rgba(252,76,2,0.1)",border:"1px solid rgba(252,76,2,0.25)",color:ORG,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:SANS,fontWeight:600}}>↗ Share</button>,
          ];
          return <tr key={e.id} onMouseEnter={()=>setHr(ri)} onMouseLeave={()=>setHr(null)} onClick={()=>onView(e)}>
            {cells.map((cell,ci)=><td key={ci} onMouseEnter={()=>setHc(ci)} onMouseLeave={()=>setHc(null)} style={cellS(ri,ci)}>{cell}</td>)}
          </tr>;
        })}
      </tbody>
    </table>
    {rows.length===0&&<div style={{padding:"56px 0",textAlign:"center",color:DIM,fontFamily:SANS,fontSize:13}}>No drives recorded for this selection</div>}
  </div>;
}

// ─── ENTRY DETAIL MODAL ───────────────────────────────────────────────────────
function EntryModal({entry,org,onClose}){
  return <Overlay onClose={onClose}>
    <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,marginBottom:8,textTransform:"uppercase"}}>Drive Record</div>
    <div style={{fontFamily:DISP,fontSize:32,color:TXT,marginBottom:2,letterSpacing:1}}>{entry.player}</div>
    <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:22}}>{org?.courseName} · {fmtDate(entry.date)}</div>
    <div style={{textAlign:"center",padding:"20px 0",borderTop:`1px solid ${BDR}`,borderBottom:`1px solid ${BDR}`,marginBottom:20,background:"rgba(252,76,2,0.04)",borderRadius:10,margin:"0 -8px 20px"}}>
      <span style={{fontFamily:DISP,fontSize:64,color:tierClr(entry.dist),letterSpacing:1,textShadow:`0 0 40px ${tierClr(entry.dist)}55`}}>{cvt(entry.dist)}</span>
      <span style={{fontFamily:SANS,fontSize:16,color:MUT,marginLeft:6}}>"yards"</span>
      <div style={{fontFamily:SANS,fontSize:12,fontWeight:600,color:tierClr(entry.dist),marginTop:6}}>{tier(entry.dist)}</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
      {[["Club",entry.club],["Handicap",entry.hcp],["Age",entry.age+" yrs"],["Course",org?.courseName||"—"],["Location",org?.location||"—"],["Date",fmtDate(entry.date)]].map(([k,v])=>(
        <div key={k} style={{background:BG3,borderRadius:10,padding:"10px 14px",border:`1px solid ${BDR}`}}>
          <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:MUT,letterSpacing:1.2,marginBottom:3,textTransform:"uppercase"}}>{k}</div>
          <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:TXT}}>{String(v)}</div>
        </div>
      ))}
    </div>
    {entry.photo&&<><div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:MUT,letterSpacing:1.2,marginBottom:8,textTransform:"uppercase"}}>Photo Evidence</div><img src={entry.photo} alt="" style={{width:"100%",borderRadius:10,objectFit:"cover",maxHeight:200,border:`1px solid ${BDR}`}}/></>}
    <div style={{marginTop:18}}>
      <Btn full variant="ghost" onClick={()=>shareEntry(entry,org)}>↗ Share This Drive</Btn>
    </div>
  </Overlay>;
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminPanel({orgs,entries,setOrgs,setEntries,toast,onClose}){
  const [sub,setSub]=useState("overview");
  const [selOrg,setSelOrg]=useState(null);
  const [selEnt,setSelEnt]=useState(null);

  const pending  = orgs.filter(o=>o.status==="pending");
  const approved = orgs.filter(o=>o.status==="approved");
  const orgFor   = id=>orgs.find(o=>o.id===id);

  async function setBadge(id,badge){
    const up=orgs.map(o=>o.id===id?{...o,badge}:o);
    setOrgs(up); await db.set(ORGS_KEY,up);
    setSelOrg(p=>p?.id===id?{...p,badge}:p);
    toast(badge?`Badge: ${BADGES[badge]?.label}`:"Badge removed");
  }
  async function setStatus(id,status){
    const up=orgs.map(o=>o.id===id?{...o,status}:o);
    setOrgs(up); await db.set(ORGS_KEY,up);
    setSelOrg(p=>p?.id===id?{...p,status}:p);
    toast(status==="approved"?"Course approved":status==="rejected"?"Suspended":status==="disabled"?"Account disabled":"Status updated");
  }
  async function removeOrg(id){
    if(!window.confirm("Delete this course + all its entries?")) return;
    const uo=orgs.filter(o=>o.id!==id);
    const ue=entries.filter(e=>e.orgId!==id);
    setOrgs(uo); setEntries(ue);
    await db.set(ORGS_KEY,uo); await db.set(ENT_KEY,ue);
    setSelOrg(null); toast("Course deleted");
  }
  async function removeEntry(id){
    if(!window.confirm("Delete this entry?")) return;
    const ue=entries.filter(e=>e.id!==id);
    setEntries(ue); await db.set(ENT_KEY,ue);
    setSelEnt(null); toast("Entry deleted");
  }

  const Stat=({label,val,col})=>(
    <div style={{background:BG3,border:`1px solid ${BDR}`,borderRadius:12,padding:"16px 20px",textAlign:"center"}}>
      <div style={{fontFamily:DISP,fontSize:32,color:col||GOLD,letterSpacing:1,lineHeight:1}}>{val}</div>
      <div style={{fontFamily:SANS,fontSize:10,fontWeight:600,color:DIM,marginTop:5,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    </div>
  );
  const Tab=({id,label,badge})=>(
    <button onClick={()=>setSub(id)} style={{display:"flex",alignItems:"center",gap:6,background:sub===id?"rgba(252,76,2,0.12)":"transparent",border:`1px solid ${sub===id?ORG:BDR}`,color:sub===id?ORG:MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 16px",cursor:"pointer",borderRadius:8,transition:"all .15s"}}>
      {label}{badge>0&&<span style={{background:ORG,color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700}}>{badge}</span>}
    </button>
  );

  return <div style={{position:"fixed",inset:0,background:BG,zIndex:500,overflowY:"auto"}}>
    <div style={{background:BG2,borderBottom:`1px solid ${BDR}`,padding:"14px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(12px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <RB_LOGO_SVG/>
        <div>
          <div style={{fontFamily:DISP,fontSize:18,color:TXT,letterSpacing:1}}>Admin Dashboard</div>
          <div style={{fontFamily:SANS,fontSize:10,color:MUT}}>rippingbombs.com</div>
        </div>
      </div>
      <Btn onClick={onClose} variant="ghost" small>← Back to Site</Btn>
    </div>

    <div style={{padding:"28px 28px 60px",maxWidth:1120,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:12,marginBottom:28}}>
        <Stat label="Courses"    val={orgs.length}/>
        <Stat label="Approved"   val={approved.length} col={GRN}/>
        <Stat label="Pending"    val={pending.length}  col={GOLD}/>
        <Stat label="Drives"     val={entries.length}/>
        <Stat label="World Best" val={entries.length?cvt(Math.max(...entries.map(e=>e.dist)))+unitLbl:"—"} col={ORG}/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        <Tab id="overview"  label="Overview"/>
        <Tab id="pending"   label="Approvals" badge={pending.length}/>
        <Tab id="courses"   label="All Courses"/>
        <Tab id="drives"    label="All Drives"/>
        <Tab id="danger"    label="⚠ Danger Zone"/>
      </div>

      {/* Overview */}
      {sub==="overview"&&<div>
        {pending.length>0&&<div style={{background:"rgba(240,180,41,0.08)",border:"1px solid rgba(240,180,41,0.25)",borderRadius:12,padding:"16px 20px",marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div><div style={{fontFamily:SANS,fontWeight:700,fontSize:16,color:GOLD}}>⚠ {pending.length} course{pending.length>1?"s":""} awaiting approval</div><div style={{fontFamily:SANS,fontSize:12,color:MUT,marginTop:2}}>Review and approve before they can submit drives</div></div>
          <Btn onClick={()=>setSub("pending")} small>Review</Btn>
        </div>}
        <div style={{fontFamily:SANS,fontWeight:700,fontSize:16,color:TXT,marginBottom:12}}>Recent Drives</div>
        {[...entries].sort((a,b)=>b.id.localeCompare(a.id)).slice(0,8).map(e=>(
          <div key={e.id} onClick={()=>setSelEnt(e)} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:10,marginBottom:6,cursor:"pointer",background:BG3,border:`1px solid ${BDR}`,transition:"background .15s"}}
            onMouseEnter={el=>el.currentTarget.style.background="rgba(252,76,2,0.06)"}
            onMouseLeave={el=>el.currentTarget.style.background=BG3}>
            <div><span style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>{e.player}</span><span style={{fontFamily:SANS,fontSize:11,color:MUT,marginLeft:10}}>{orgFor(e.orgId)?.courseName} · {fmtDate(e.date)}</span></div>
            <span style={{fontFamily:DISP,fontSize:20,color:tierClr(e.dist)}}>{cvt(e.dist)} {unitLbl}</span>
            <Btn onClick={ev=>{ev.stopPropagation();removeEntry(e.id);}} variant="danger" small>Del</Btn>
            <div style={{color:MUT,fontSize:14}}>›</div>
          </div>
        ))}
      </div>}

      {/* Pending approvals */}
      {sub==="pending"&&<div>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:1,marginBottom:18}}>Pending Approvals</div>
        {pending.length===0?<Card style={{textAlign:"center",padding:48}}><div style={{fontFamily:SANS,fontSize:14,color:MUT}}>All clear — no pending applications ✓</div></Card>
        :pending.map(org=><Card key={org.id} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
            <div>
              <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5,marginBottom:3}}>{org.courseName}</div>
              <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:10}}>{org.location}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Organiser",org.name],["Email",org.email]].map(([k,v])=><div key={k}><div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1,textTransform:"uppercase"}}>{k}</div><div style={{fontFamily:SANS,fontSize:12,color:TXT}}>{v}</div></div>)}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
              <Btn onClick={()=>{setStatus(org.id,"approved");sendRegistrationNotification(org);}} variant="approve">Approve &amp; Notify</Btn>
              <Btn onClick={()=>setStatus(org.id,"rejected")} variant="danger" small>✕ Reject</Btn>
            </div>
          </div>
        </Card>)}
      </div>}

      {/* All Courses */}
      {sub==="courses"&&<div>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:1,marginBottom:18}}>All Courses ({orgs.length})</div>
        {orgs.map(org=><div key={org.id} onClick={()=>setSelOrg(org)}
          style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:12,padding:"13px 18px",borderRadius:10,marginBottom:8,cursor:"pointer",background:BG3,border:`1px solid ${BDR}`,transition:"background .15s"}}
          onMouseEnter={el=>el.currentTarget.style.background="rgba(252,76,2,0.06)"}
          onMouseLeave={el=>el.currentTarget.style.background=BG3}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontFamily:SANS,fontWeight:700,fontSize:15,color:TXT}}>{org.courseName}</span>
            <span style={{fontFamily:SANS,fontSize:11,color:MUT}}>{org.location} · {org.name}</span>
            <Pill label={org.status} color={org.status}/>
            {org.badge&&<BadgePill badge={org.badge} small/>}
          </div>
          <div style={{display:"flex",gap:6}}>
            {org.status==="pending"  &&<Btn onClick={e=>{e.stopPropagation();setStatus(org.id,"approved");}} variant="approve" small>Approve</Btn>}
            {org.status==="approved" &&<Btn onClick={e=>{e.stopPropagation();setStatus(org.id,"disabled");}} variant="danger" small>Disable</Btn>}
            {(org.status==="rejected"||org.status==="disabled")&&<Btn onClick={e=>{e.stopPropagation();setStatus(org.id,"approved");}} variant="approve" small>Reinstate</Btn>}
            <Btn onClick={e=>{e.stopPropagation();removeOrg(org.id);}} variant="danger" small>Del</Btn>
          </div>
        </div>)}
      </div>}

      {/* All Drives */}
      {sub==="drives"&&<div>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:1,marginBottom:18}}>All Drives ({entries.length})</div>
        <div style={{overflowX:"auto",borderRadius:12,border:`1px solid ${BDR}`,background:BG2}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead><tr>{["#","Player","Dist","Club","HCP","Age","Course","Date",""].map(h=><th key={h} style={{padding:"9px 13px",fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:1.2,color:DIM,textTransform:"uppercase",textAlign:"left",borderBottom:`2px solid ${BDR}`}}>{h}</th>)}</tr></thead>
            <tbody>{[...entries].sort((a,b)=>b.dist-a.dist).map((e,i)=>(
              <tr key={e.id} onClick={()=>setSelEnt(e)} style={{cursor:"pointer",transition:"background .15s"}}
                onMouseEnter={el=>el.currentTarget.style.background="rgba(252,76,2,0.06)"}
                onMouseLeave={el=>el.currentTarget.style.background="transparent"}>
                <td style={{padding:"9px 13px",fontFamily:SANS,fontSize:11,color:DIM,borderBottom:`1px solid rgba(255,255,255,0.04)`}}>#{i+1}</td>
                <td style={{padding:"9px 13px",fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT,borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{e.player}</td>
                <td style={{padding:"9px 13px",fontFamily:DISP,fontSize:18,color:tierClr(e.dist),borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{cvt(e.dist)} {unitLbl}</td>
                <td style={{padding:"9px 13px",fontFamily:SANS,fontSize:11,color:MUT,borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{e.club}</td>
                <td style={{padding:"9px 13px",fontFamily:SANS,fontSize:11,color:MUT,borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{e.hcp}</td>
                <td style={{padding:"9px 13px",fontFamily:SANS,fontSize:11,color:MUT,borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{e.age}</td>
                <td style={{padding:"9px 13px",fontFamily:SANS,fontSize:11,color:MUT,borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{orgFor(e.orgId)?.courseName}</td>
                <td style={{padding:"9px 13px",fontFamily:SANS,fontSize:10,color:DIM,borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{fmtDate(e.date)}</td>
                <td style={{padding:"9px 13px",borderBottom:`1px solid rgba(255,255,255,0.04)`}}><Btn onClick={ev=>{ev.stopPropagation();removeEntry(e.id);}} variant="danger" small>Del</Btn></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {/* Danger Zone */}
      {sub==="danger"&&<div style={{maxWidth:540}}>
        <div style={{fontFamily:DISP,fontSize:22,color:"#f87171",letterSpacing:1,marginBottom:6}}>Danger Zone</div>
        <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:24}}>Irreversible — use with care.</div>
        <Card style={{borderColor:"rgba(220,60,60,0.2)",marginBottom:14}}>
          <div style={{fontFamily:SANS,fontWeight:700,fontSize:15,color:TXT,marginBottom:4}}>Reload Demo Data</div>
          <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:14}}>Wipes everything and restores all 25 demo drives and 10 sample courses.</div>
          <Btn variant="danger" onClick={async()=>{
            if(!window.confirm("Replace ALL data with demo data?")) return;
            await db.set(ORGS_KEY,SEED_ORGS); await db.set(ENT_KEY,SEED_ENTRIES); await db.set(SEED_KEY,true);
            setOrgs(SEED_ORGS); setEntries(SEED_ENTRIES); toast("Demo data reloaded!");
          }}>↺ Reload Demo Data</Btn>
        </Card>
        <Card style={{borderColor:"rgba(220,60,60,0.2)"}}>
          <div style={{fontFamily:SANS,fontWeight:700,fontSize:15,color:TXT,marginBottom:4}}>Clear All Data</div>
          <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:14}}>Permanently deletes all courses and drives. Use when going live.</div>
          <Btn variant="danger" onClick={async()=>{
            if(!window.confirm("Delete ALL data permanently?")) return;
            await db.set(ORGS_KEY,[]); await db.set(ENT_KEY,[]); await db.del(SEED_KEY);
            setOrgs([]); setEntries([]); toast("Cleared — fresh start!");
          }}>🗑 Clear All Data</Btn>
        </Card>
      </div>}
    </div>

    {/* Org detail modal */}
    {selOrg&&<Overlay onClose={()=>setSelOrg(null)}>
      <div style={{fontFamily:DISP,fontSize:26,color:TXT,letterSpacing:.5,marginBottom:4}}>{selOrg.courseName}</div>
      <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:10}}>{selOrg.location}</div>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}><Pill label={selOrg.status} color={selOrg.status}/>{selOrg.badge&&<BadgePill badge={selOrg.badge}/>}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[["Organiser",selOrg.name],["Email",selOrg.email],["Drives",entries.filter(e=>e.orgId===selOrg.id).length],["Avg Dist",entries.filter(e=>e.orgId===selOrg.id).length?cvt(Math.round(entries.filter(e=>e.orgId===selOrg.id).reduce((s,e)=>s+e.dist,0)/entries.filter(e=>e.orgId===selOrg.id).length))+unitLbl:"—"]].map(([k,v])=>(
          <div key={k} style={{background:BG3,borderRadius:10,padding:"10px 14px",border:`1px solid ${BDR}`}}>
            <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>{k}</div>
            <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:TXT}}>{String(v)}</div>
          </div>
        ))}
      </div>
      {/* Badge assignment */}
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,color:DIM,letterSpacing:1.2,marginBottom:10,textTransform:"uppercase"}}>Assign Credibility Badge</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.entries(BADGES).map(([key,b])=>(
            <button key={key} onClick={()=>setBadge(selOrg.id,key)} style={{background:selOrg.badge===key?b.bg:"rgba(255,255,255,0.03)",border:`1px solid ${selOrg.badge===key?b.border:BDR}`,color:selOrg.badge===key?b.color:MUT,borderRadius:7,padding:"6px 13px",cursor:"pointer",fontFamily:SANS,fontSize:11,fontWeight:600,transition:"all .15s"}}>{b.icon} {b.label}</button>
          ))}
          <button onClick={()=>setBadge(selOrg.id,null)} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${BDR}`,color:DIM,borderRadius:7,padding:"6px 13px",cursor:"pointer",fontFamily:SANS,fontSize:11}}>✕ Remove</button>
        </div>
      </div>
      {/* Action buttons */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {selOrg.status==="pending"  &&<Btn onClick={()=>{setStatus(selOrg.id,"approved");sendRegistrationNotification(selOrg);}} variant="approve">Approve &amp; Notify</Btn>}
        {selOrg.status==="approved" &&<Btn onClick={()=>setStatus(selOrg.id,"disabled")} variant="danger">Disable Account</Btn>}
        {(selOrg.status==="rejected"||selOrg.status==="disabled")&&<Btn onClick={()=>setStatus(selOrg.id,"approved")} variant="approve">Reinstate</Btn>}
        <Btn onClick={()=>removeOrg(selOrg.id)} variant="danger">Delete</Btn>
      </div>
    </Overlay>}
    {selEnt&&<EntryModal entry={selEnt} org={orgFor(selEnt.orgId)} onClose={()=>setSelEnt(null)}/>}
  </div>;
}

// ─── DEMO SUBMIT (no account needed) ─────────────────────────────────────────
function DemoSubmit({onClose,entries,setEntries,orgs,toast}){
  const DEMO_ORG_ID = "demo_preview";
  const [form,setForm]=useState({player:"",dist:"",club:"",hcp:"",age:"",photo:"",date:todayStr(),courseName:"",location:""});
  const [submitted,setSubmitted]=useState(null);

  async function doDemo(){
    if(!form.player||!form.dist||!form.club||!form.hcp||!form.age||!form.courseName){ toast("Fill all required fields"); return; }
    const entry={id:"demo_"+Date.now(),orgId:DEMO_ORG_ID,player:form.player,dist:Number(form.dist),club:form.club,hcp:Number(form.hcp),age:Number(form.age),photo:form.photo,date:form.date,_demo:true};
    const demoOrg={id:DEMO_ORG_ID,courseName:form.courseName,location:form.location||"Demo Location",status:"approved",badge:null};
    // Add temporarily to view — don't persist to storage
    setSubmitted({entry,org:demoOrg});
  }

  if(submitted) return <Overlay onClose={onClose}>
    <div style={{textAlign:"center",padding:"10px 0 20px"}}>
      
      <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:1,marginBottom:6}}>Looking Good!</div>
      <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:24}}>Here's a preview of how your drive would appear on the global leaderboard.</div>
      <div style={{background:"rgba(252,76,2,0.06)",border:"1px solid rgba(252,76,2,0.2)",borderRadius:12,padding:"20px 24px",textAlign:"left",marginBottom:20}}>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5}}>{submitted.entry.player}</div>
        <div style={{fontFamily:SANS,fontSize:11,color:MUT,marginBottom:12}}>{submitted.org.courseName} · {fmtDate(submitted.entry.date)}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
          <span style={{fontFamily:DISP,fontSize:52,color:tierClr(submitted.entry.dist),letterSpacing:1}}>{cvt(submitted.entry.dist)}</span>
          <span style={{fontFamily:SANS,fontSize:16,color:MUT}}>yards</span>
        </div>
        <div style={{fontFamily:SANS,fontSize:12,fontWeight:600,color:tierClr(submitted.entry.dist)}}>{tier(submitted.entry.dist)}</div>
        <div style={{fontFamily:SANS,fontSize:11,color:MUT,marginTop:8}}>{submitted.entry.club} · HCP {submitted.entry.hcp} · Age {submitted.entry.age}</div>
      </div>
      <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:20}}>This would appear on the <strong style={{color:TXT}}>global weekly leaderboard</strong> for all golfers to compare.</div>
      <Btn full onClick={onClose} variant="orange">Register Your Course — It's Free →</Btn>
      <div style={{fontFamily:SANS,fontSize:11,color:DIM,marginTop:10}}>Demo entry — not saved to the live leaderboard</div>
    </div>
  </Overlay>;

  return <Overlay onClose={onClose}>
    <div style={{fontFamily:SANS,fontWeight:700,fontSize:11,letterSpacing:1.5,color:ORG,marginBottom:6,textTransform:"uppercase"}}>Demo Mode</div>
    <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:.5,marginBottom:4}}>Try It Out</div>
    <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:22}}>Submit a drive to see how your club would appear on the global leaderboard — no account required.</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div style={{gridColumn:"1/-1"}}><Field label="Player Name" value={form.player} onChange={e=>setForm({...form,player:e.target.value})} placeholder="Tiger Woods" required/></div>
      <Field label="Your Course Name" value={form.courseName} onChange={e=>setForm({...form,courseName:e.target.value})} placeholder="Augusta National" required/>
      <Field label="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Georgia, USA"/>
      <Field label="Distance (yards)" type="number" value={form.dist} onChange={e=>setForm({...form,dist:e.target.value})} placeholder="312" min="50" max="600" required/>
      <Field label="Club Brand & Model" value={form.club} onChange={e=>setForm({...form,club:e.target.value})} placeholder="TaylorMade Qi10" required/>
      <Field label="Handicap" type="number" value={form.hcp} onChange={e=>setForm({...form,hcp:e.target.value})} placeholder="5" min="-10" max="54" required/>
      <Field label="Age" type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="34" min="10" max="100" required/>
    </div>
    {form.dist&&Number(form.dist)>0&&<div style={{background:"rgba(252,76,2,0.07)",border:"1px solid rgba(252,76,2,0.2)",borderRadius:8,padding:"9px 14px",marginBottom:14,fontFamily:SANS,fontSize:12,fontWeight:600,color:ORG}}>{tier(Number(form.dist))} — {Number(form.dist)>=350?"Extraordinary! That\'s world-class.":Number(form.dist)>=300?"Impressive distance!":Number(form.dist)>=250?"Solid drive.":"Good effort!"}</div>}
    <PhotoField label="Photo of Drive Marker (optional)" value={form.photo} onChange={async e=>{ if(e.target.files[0]) setForm({...form,photo:await toB64(e.target.files[0])}); }}/>
    <Btn full onClick={doDemo}>Preview My Drive →</Btn>
  </Overlay>;
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ onNav, entries, orgs }) {
  const approvedOrgs = orgs.filter(o => o.status === "approved");
  const totalYards   = entries.reduce((s, e) => s + (e.dist || 0), 0);
  const countries    = new Set(approvedOrgs.map(o => (o.location || "").split(",").pop().trim())).size;

  const stats = [
    { val: approvedOrgs.length > 0 ? approvedOrgs.length + "+" : "500+", label: "Clubs" },
    { val: totalYards > 0 ? Math.round(totalYards / 1000) + "K" : "48K",  label: "Yards Measured" },
    { val: countries > 0 ? countries + "+" : "50+",                        label: "Countries" },
    { val: entries.length  > 0 ? entries.length + "+"  : "1200+",          label: "Golfers" },
  ];

  const faqs = [
    { q: "What is Ripping Bombs?", a: "Ripping Bombs is a global registry of verified longest drives from golf tournaments and events around the world, creating a unified leaderboard of the game's biggest hitters." },
    { q: "Why should golf courses get involved?", a: "Courses benefit by turning one of golf's most exciting moments — the longest drive — into an ongoing attraction. Run official \"Big Hitter\" competitions, increase engagement, attract younger golfers, and be featured as an official Ripping Bombs location." },
    { q: "Why should tournament organisers participate?", a: "Event organisers get an always-on longest drive leaderboard, increased player engagement, shareable results for social media, additional sponsorship opportunities, and a digital footprint beyond the tournament weekend." },
    { q: "Why is only event-based submission allowed?", a: "To maintain accuracy and fairness, all entries must be the official longest drive winner of an event or designated hole, supported by photo or scorecard evidence, and submitted by the organiser." },
    { q: "How are drives verified?", a: "Verification may include course or event confirmation, launch monitor data (e.g. Trackman), photo or scorecard evidence, and organiser validation for official events." },
    { q: "Is this just for professionals?", a: "No. Ripping Bombs is designed for everyone who plays golf — from casual players to long drive competitors. If you've ever said \"I absolutely smoked that one,\" you belong on the leaderboard." },
    { q: "What's the goal of Ripping Bombs?", a: "To create the first global benchmark for driving distance in golf — a system where the best \"big hitters\" in the world can be recognised, ranked, and compared internationally." },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ animation: "fi .4s ease" }}>
      {/* ── HERO ── */}
      <div style={{ textAlign: "center", padding: "64px 20px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(252,76,2,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 4, color: ORG, textTransform: "uppercase", marginBottom: 20 }}>
          The Global Home of Competition Longest Drives
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "clamp(42px, 8vw, 80px)", color: TXT, lineHeight: 1.0, letterSpacing: 2, marginBottom: 24 }}>
          RIPPING<br />BOMBS
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: MUT, maxWidth: 540, margin: "0 auto 14px", lineHeight: 1.7 }}>
          A free platform where golfers, clubs, coaches, driving ranges, and tournament organisers can register verified longest drives and compare them on global standings.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
          From local club competitions to major events, every winning bomb has a place on the leaderboard.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNav("register")} style={{ background: ORG, border: "none", color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: "14px 32px", borderRadius: 10, cursor: "pointer", letterSpacing: 0.5, boxShadow: "0 4px 24px rgba(252,76,2,0.35)" }}>
            REGISTER NOW FREE →
          </button>
          <button onClick={() => onNav("leaderboard")} style={{ background: "transparent", border: `1px solid ${BDR}`, color: TXT, fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: "14px 28px", borderRadius: 10, cursor: "pointer", letterSpacing: 0.5 }}>
            View Leaderboard
          </button>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 1, background: BDR, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, margin: "0 0 60px" }}>
        {stats.map(({ val, label }) => (
          <div key={label} style={{ background: BG2, padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: DISP, fontSize: 38, color: ORG, letterSpacing: 1, lineHeight: 1 }}>{val}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginTop: 6, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURE CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 60 }}>
        {[
          { title: "Global Long Drive Standings", body: "Compare verified competition-winning drives with golfers from clubs and tournaments around the world." },
          { title: "Free Club & Tournament Registration", body: "Clubs, coaches, driving ranges, and event organisers can submit longest drive winners at no cost during launch." },
          { title: "Recognition for Big Hitters", body: "Give golfers a place to showcase huge drives, earn rankings, and represent their club on a global platform." },
        ].map(({ title, body }) => (
          <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 14, padding: "28px 24px" }}>
            <div style={{ fontFamily: DISP, fontSize: 20, color: TXT, letterSpacing: 0.5, marginBottom: 10 }}>{title}</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.7 }}>{body}</div>
          </div>
        ))}
      </div>

      {/* ── CTA STRIP ── */}
      <div style={{ background: "linear-gradient(135deg, rgba(252,76,2,0.08), rgba(200,16,46,0.05))", border: "1px solid rgba(252,76,2,0.2)", borderRadius: 16, padding: "40px 32px", textAlign: "center", marginBottom: 60 }}>
        <div style={{ fontFamily: DISP, fontSize: "clamp(24px,5vw,40px)", color: TXT, letterSpacing: 1, marginBottom: 10 }}>FREE TO JOIN. FREE TO SUBMIT.</div>
        <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, marginBottom: 28 }}>Built for golfers who love sending it.</div>
        <button onClick={() => onNav("register")} style={{ background: ORG, border: "none", color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: "14px 36px", borderRadius: 10, cursor: "pointer", boxShadow: "0 4px 24px rgba(252,76,2,0.35)" }}>
          REGISTER NOW FREE →
        </button>
      </div>

      {/* ── FAQ ── */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 20 }}>FAQ</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map(({ q, a }, i) => (
            <div key={i} style={{ background: BG2, border: `1px solid ${openFaq === i ? "rgba(200,16,46,0.25)" : BDR}`, borderRadius: 10, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 16 }}>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: TXT, textAlign: "left" }}>{q}</span>
                <span style={{ fontFamily: SANS, fontSize: 18, color: ORG, flexShrink: 0, display: "block", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 18px", fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.75 }}>{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 28, paddingBottom: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 12, color: DIM }}>Copyright © 2026 rippingbombs.com · Powered by the HRH Collective LTD</div>
        <a href="https://www.instagram.com/rippingbombs/" target="_blank" rel="noreferrer" style={{ fontFamily: SANS, fontSize: 12, color: MUT, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          Follow us on Instagram
        </a>
      </div>
    </div>
  );
}

// unit helpers (yards only for now)
const cvt = d => d;
const unitLbl = "yds";

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [orgs,    setOrgs]    = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("home");
  const [toastMsg,setToastMsg]= useState(null);
  const [detEnt,  setDetEnt]  = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPw,   setAdminPw]   = useState({show:false,val:""});
  const [loggedOrg, setLoggedOrg] = useState(null);
  const [showDemo,  setShowDemo]  = useState(false);

  // week + filters
  const [week,      setWeek]      = useState(nowWeek());
  const [allTime,   setAllTime]   = useState(false);
  const [fCountry,  setFCountry]  = useState("");
  const [fHcp,      setFHcp]      = useState("");
  const [fAge,      setFAge]      = useState("");
  const [fClub,     setFClub]     = useState("");
  const [sortBy,    setSortBy]    = useState("dist");

  // forms
  const [reg,  setReg]  = useState({name:"",courseName:"",location:"",email:"",pw:"",logo:""});
  const [lgn,  setLgn]  = useState({email:"",pw:""});
  const [form, setForm] = useState({player:"",dist:"",club:"",hcp:"",age:"",photo:"",date:todayStr()});

  useEffect(()=>{
    initData().then(({orgs,entries})=>{ setOrgs(orgs); setEntries(entries); setLoading(false); });
  },[]);

  // SEO
  useEffect(()=>{
    document.title="Ripping Bombs | Global Longest Golf Drive Database";
    const metas=[
      {name:"description",content:"Track and compare the longest golf drives from tournaments worldwide. Ripping Bombs is the global leaderboard for longest drive, big hitters, bombs and swing distance."},
      {name:"keywords",content:"longest golf drive, long drive competition, golf bomb, ripping bombs, bombing drives, golf swing distance, driving distance leaderboard, golf distance tracker, longest drive record, big hitter golf, smash factor, swing speed"},
      {property:"og:title",content:"Ripping Bombs | Global Longest Golf Drive Database"},
      {property:"og:type",content:"website"},
    ];
    metas.forEach(attrs=>{ const k=attrs.property?"property":"name",v=attrs.property||attrs.name; let el=document.querySelector(`meta[${k}="${v}"]`); if(!el){el=document.createElement("meta");document.head.appendChild(el);} Object.entries(attrs).forEach(([a,b])=>el.setAttribute(a,b)); });
  },[]);

  const toast = msg => setToastMsg(msg);
  const approvedOrgs = orgs.filter(o=>o.status==="approved");
  const orgFor = id => orgs.find(o=>o.id===id);
  const pendingCount = orgs.filter(o=>o.status==="pending").length;

  // Filter + sort logic
  const hcpIn=(hcp,b)=>{ if(!b) return true; if(b==="scratch") return hcp<=0; if(b==="low") return hcp>0&&hcp<=5; if(b==="mid") return hcp>5&&hcp<=14; if(b==="high") return hcp>14&&hcp<=28; if(b==="beginner") return hcp>28; return true; };
  const ageIn=(age,b)=>{ if(!b) return true; if(b==="u25") return age<25; if(b==="25-40") return age>=25&&age<40; if(b==="40-55") return age>=40&&age<55; if(b==="55+") return age>=55; return true; };
  const hasFilters = fCountry||fHcp||fAge||fClub||sortBy!=="dist";

  const tableRows = entries
    .filter(e=>approvedOrgs.find(o=>o.id===e.orgId))
    .filter(e=>allTime||sameWeek(e.date,week))
    .filter(e=>!fCountry||(orgFor(e.orgId)?.location||"").toLowerCase().includes(fCountry.toLowerCase()))
    .filter(e=>hcpIn(e.hcp,fHcp))
    .filter(e=>ageIn(e.age,fAge))
    .filter(e=>!fClub||e.club.toLowerCase().includes(fClub.toLowerCase()))
    .sort((a,b)=>{
      if(sortBy==="hcp")  return a.hcp-b.hcp;
      if(sortBy==="age")  return a.age-b.age;
      if(sortBy==="club") return a.club.localeCompare(b.club);
      if(sortBy==="date") return new Date(b.date)-new Date(a.date);
      return b.dist-a.dist;
    });

  const allTimeBest = [...entries].filter(e=>approvedOrgs.find(o=>o.id===e.orgId)).sort((a,b)=>b.dist-a.dist);

  async function doRegister(){
    if(!reg.name||!reg.courseName||!reg.location||!reg.email||!reg.pw){ toast("Fill all required fields"); return; }
    if(orgs.find(o=>o.email===reg.email)){ toast("Email already registered"); return; }
    const newOrg={id:Date.now().toString(),name:reg.name,courseName:reg.courseName,location:reg.location,email:reg.email,pw:reg.pw,logo:reg.logo,status:"pending",badge:null};
    const up=[...orgs,newOrg]; setOrgs(up); await db.set(ORGS_KEY,up);
    setReg({name:"",courseName:"",location:"",email:"",pw:"",logo:""});
    toast("Registration submitted — awaiting admin approval"); setTab("leaderboard");
  }
  async function doLogin(){
    const org=orgs.find(o=>o.email===lgn.email&&o.pw===lgn.pw);
    if(!org){ toast("Invalid credentials"); return; }
    if(org.status==="pending"){ toast("Awaiting admin approval"); return; }
    if(org.status==="rejected"||org.status==="disabled"){ toast("Account not active — contact admin"); return; }
    setLoggedOrg(org); setLgn({email:"",pw:""}); toast(`Welcome, ${org.name}!`); setTab("submit");
  }
  async function doSubmit(){
    if(!loggedOrg){ toast("Not logged in"); return; }
    if(!form.player||!form.dist||!form.club||!form.hcp||!form.age){ toast("Fill all required fields"); return; }
    if(!form.photo){ toast("Photo evidence required"); return; }
    const e={id:Date.now().toString(),orgId:loggedOrg.id,player:form.player,dist:Number(form.dist),club:form.club,hcp:Number(form.hcp),age:Number(form.age),photo:form.photo,date:form.date};
    const up=[...entries,e]; setEntries(up); await db.set(ENT_KEY,up);
    setForm({player:"",dist:"",club:"",hcp:"",age:"",photo:"",date:todayStr()});
    toast("Drive submitted to the World Registry!"); setTab("leaderboard");
  }

  useEffect(()=>{
    const link=document.querySelector("link[rel~='icon']")||document.createElement('link');
    link.rel='icon'; link.type='image/svg+xml'; link.href='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20841.89%20595.28%22%3E%3Cpolygon%20fill%3D%22%23C8102E%22%20points%3D%22146.662%2C300.557%2022.035%2C521.864%20155.217%2C521.864%20279.933%2C300.406%20216.568%2C188.458%20369.538%2C188.458%20421.032%2C72.414%2017.521%2C72.414%22%2F%3E%3Cpolygon%20fill%3D%22%23C8102E%22%20points%3D%22695.492%2C293.872%20824.537%2C72.414%20820.016%2C72.414%20820.029%2C72.414%20686.834%2C72.414%20686.834%2C72.414%20421.032%2C72.414%20472.527%2C188.458%20621.49%2C188.458%20562.133%2C293.872%20623.367%2C405.807%20472.527%2C405.807%20421.032%2C521.864%20686.834%2C521.851%20686.834%2C521.864%20820.029%2C521.864%20820.016%2C521.851%20824.537%2C521.851%22%2F%3E%3C%2Fsvg%3E';
    document.head.appendChild(link);
  },[]);

  if(loading) return <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:SANS,color:MUT,fontSize:13,letterSpacing:2}}>LOADING…</div></div>;
  if(showAdmin) return <AdminPanel orgs={orgs} entries={entries} setOrgs={setOrgs} setEntries={setEntries} toast={toast} onClose={()=>setShowAdmin(false)}/>;

  const NavBtn=({id,label})=>(
    <button onClick={()=>setTab(id)} style={{background:tab===id?ORG:"transparent",border:tab===id?"none":`1px solid ${BDR}`,color:tab===id?"#fff":MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 16px",borderRadius:8,cursor:"pointer",transition:"all .15s",letterSpacing:.3}}>{label}</button>
  );

  return <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:SANS}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      input::placeholder,select option{color:${DIM}!important}
      select{appearance:none}
      ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${BG}}::-webkit-scrollbar-thumb{background:${BG3};border-radius:3px}
      @keyframes su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fi{from{opacity:0}to{opacity:1}}
    `}</style>

    {/* ── HEADER ── */}
    <div style={{borderBottom:`1px solid ${BDR}`,padding:"12px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(245,245,240,0.95)",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(16px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>setTab("home")}>
        <RB_LOGO_SVG/>
      </div>
      <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
        <NavBtn id="leaderboard" label="Leaderboard"/>
        {/* Demo CTA */}
        <button onClick={()=>setShowDemo(true)} style={{background:"rgba(240,180,41,0.1)",border:`1px solid rgba(240,180,41,0.3)`,color:GOLD,fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 14px",borderRadius:8,cursor:"pointer",letterSpacing:.3}}>Try Demo</button>
        {loggedOrg
          ?<><NavBtn id="submit" label="Submit Drive"/>
            <button onClick={()=>{setLoggedOrg(null);setTab("home");}} style={{background:"none",border:"1px solid rgba(220,80,80,0.3)",borderRadius:8,color:"#f87171",fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 14px",cursor:"pointer"}}>Log Out</button></>
          :<><NavBtn id="login" label="Organiser Login"/>
            <button onClick={()=>setTab("register")} style={{background:ORG,border:"none",color:"#fff",fontFamily:SANS,fontWeight:700,fontSize:12,padding:"7px 16px",borderRadius:8,cursor:"pointer"}}>Register Course</button></>
        }
        {/* Admin gear */}
        <button onClick={()=>setAdminPw({show:true,val:""})} title="Admin" style={{position:"relative",background:"none",border:`1px solid ${BDR}`,borderRadius:8,color:DIM,fontSize:14,padding:"6px 10px",cursor:"pointer"}}>
          ⚙{pendingCount>0&&<span style={{position:"absolute",top:-4,right:-4,width:9,height:9,background:ORG,borderRadius:"50%",display:"block"}}/>}
        </button>
      </div>
    </div>

    <div style={{maxWidth:1000,margin:"0 auto",padding:"28px 18px 80px",animation:"fi .35s ease"}}>

      {/* ── LEADERBOARD ── */}
      {tab==="home"&&<HomePage onNav={setTab} entries={entries} orgs={orgs}/>}

      {tab==="leaderboard"&&<div>

        {/* ── SAMPLE DATA BANNER ── */}
        <div style={{background:"rgba(200,16,46,0.07)",border:"1px solid rgba(200,16,46,0.22)",borderRadius:10,padding:"10px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:SANS,fontSize:13,fontWeight:700,color:"#C8102E"}}>Sample data only</span>
          <span style={{fontFamily:SANS,fontSize:13,color:MUT}}>— site going live September</span>
        </div>
        {/* World record hero */}
        {allTimeBest[0]&&<div style={{background:`linear-gradient(135deg,rgba(252,76,2,0.12),rgba(252,76,2,0.04))`,border:"1px solid rgba(252,76,2,0.25)",borderRadius:16,padding:"24px 28px",marginBottom:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:18}}>
          <div>
            <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,marginBottom:8,textTransform:"uppercase"}}>🏆 All-Time World Record</div>
            <div style={{fontFamily:DISP,fontSize:34,color:TXT,letterSpacing:.5}}>{allTimeBest[0].player}</div>
            <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginTop:4}}>
              {orgFor(allTimeBest[0].orgId)?.courseName} · {allTimeBest[0].club} · {fmtDate(allTimeBest[0].date)}
              {orgFor(allTimeBest[0].orgId)?.badge&&<span style={{marginLeft:8}}><BadgePill badge={orgFor(allTimeBest[0].orgId)?.badge} small/></span>}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{fontFamily:DISP,fontSize:58,color:tierClr(allTimeBest[0].dist),letterSpacing:1,textShadow:`0 0 40px ${tierClr(allTimeBest[0].dist)}55`}}>{allTimeBest[0].dist}</span>
            <span style={{fontFamily:SANS,fontSize:16,color:MUT,marginLeft:6}}>yards</span>
            <div style={{fontFamily:SANS,fontSize:11,fontWeight:600,color:tierClr(allTimeBest[0].dist),marginTop:3}}>{tier(allTimeBest[0].dist)}</div>
          </div>
        </div>}

        {/* Week nav */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5}}>Weekly Leaderboard</div>
            {!allTime&&<div style={{fontFamily:SANS,fontSize:11,color:ORG,fontWeight:600,marginTop:2}}>{weekLabel(week)}</div>}
            {allTime&&<div style={{fontFamily:SANS,fontSize:11,color:GOLD,fontWeight:600,marginTop:2}}>All-Time Rankings</div>}
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
            {!allTime&&<><Btn onClick={()=>setWeek(prevWeek(week))} variant="subtle" small>‹ Prev</Btn>
            <span style={{fontFamily:SANS,fontSize:11,color:TXT,minWidth:72,textAlign:"center"}}>Wk {week.w} / {week.y}</span>
            <Btn onClick={()=>setWeek(nextWeek(week))} variant="subtle" small>Next ›</Btn>
            <Btn onClick={()=>setWeek(nowWeek())} variant="subtle" small>This Week</Btn></>}
            <Btn onClick={()=>setAllTime(a=>!a)} variant={allTime?"orange":"subtle"} small>{allTime?"Weekly View":"All Time"}</Btn>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center",background:BG2,border:`1px solid ${BDR}`,borderRadius:10,padding:"12px 14px"}}>
          <input placeholder="Country / location" value={fCountry} onChange={e=>setFCountry(e.target.value)}
            style={{background:BG3,border:`1px solid ${BDR}`,borderRadius:8,padding:"7px 12px",color:TXT,fontFamily:SANS,fontSize:12,outline:"none",minWidth:160,flex:1}}/>
          <input placeholder="🏌️ Club brand / model" value={fClub} onChange={e=>setFClub(e.target.value)}
            style={{background:BG3,border:`1px solid ${BDR}`,borderRadius:8,padding:"7px 12px",color:TXT,fontFamily:SANS,fontSize:12,outline:"none",minWidth:160,flex:1}}/>
          {[
            {val:fHcp,set:setFHcp,placeholder:"Handicap",opts:[["","All Handicaps"],["scratch","Scratch (≤0)"],["low","Low (1–5)"],["mid","Mid (6–14)"],["high","High (15–28)"],["beginner","Beginner (28+"]]},
            {val:fAge,set:setFAge,placeholder:"Age",opts:[["","All Ages"],["u25","Under 25"],["25-40","25–39"],["40-55","40–54"],["55+","55+"]]},
          ].map(({val,set,opts},i)=><select key={i} value={val} onChange={e=>set(e.target.value)}
            style={{background:BG3,border:`1px solid ${BDR}`,borderRadius:8,padding:"7px 12px",color:val?TXT:DIM,fontFamily:SANS,fontSize:12,outline:"none",cursor:"pointer",minWidth:130}}>
            {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>)}
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{background:BG3,border:`1px solid ${BDR}`,borderRadius:8,padding:"7px 12px",color:TXT,fontFamily:SANS,fontSize:12,outline:"none",cursor:"pointer",minWidth:140}}>
            {[["dist","↓ Distance"],["hcp","↑ Handicap"],["age","↑ Age"],["club","A–Z Club"],["date","↓ Date"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          {hasFilters&&<Btn onClick={()=>{setFCountry("");setFHcp("");setFAge("");setFClub("");setSortBy("dist");}} variant="subtle" small>✕ Clear</Btn>}
        </div>

        <LeaderTable rows={tableRows} orgFor={orgFor} onView={setDetEnt}/>

        {/* Courses grid */}
        {approvedOrgs.length>0&&<div style={{marginTop:40}}>
          <div style={{fontFamily:DISP,fontSize:20,color:TXT,letterSpacing:.5,marginBottom:14}}>Participating Courses <span style={{fontFamily:SANS,fontSize:11,color:MUT}}>({approvedOrgs.length})</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {approvedOrgs.map(o=><Card key={o.id} style={{padding:14}}>
              <div style={{fontFamily:SANS,fontWeight:700,fontSize:13,color:TXT,lineHeight:1.3,marginBottom:4}}>{o.courseName}</div>
              {o.badge&&<div style={{marginBottom:5}}><BadgePill badge={o.badge} small/></div>}
              <div style={{fontFamily:SANS,fontSize:11,color:MUT}}>{o.location}</div>
            </Card>)}
          </div>
        </div>}
      </div>}

      {/* ── REGISTER ── */}
      {tab==="register"&&<div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:DISP,fontSize:32,color:TXT,letterSpacing:.5,marginBottom:4}}>Register Your Course</div>
          <div style={{fontFamily:SANS,fontSize:13,color:MUT}}>Free forever · Reviewed by admin before activation</div>
        </div>
        <Card>
          <Field label="Your Full Name"  value={reg.name}       onChange={e=>setReg({...reg,name:e.target.value})}       placeholder="John Smith"                required/>
          <Field label="Course Name"     value={reg.courseName} onChange={e=>setReg({...reg,courseName:e.target.value})} placeholder="Augusta National Golf Club"  required/>
          <Field label="Location"        value={reg.location}   onChange={e=>setReg({...reg,location:e.target.value})}   placeholder="Augusta, Georgia, USA"       required/>
          <Field label="Email" type="email"    value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})} placeholder="you@course.com" required/>
          <Field label="Password" type="password" value={reg.pw} onChange={e=>setReg({...reg,pw:e.target.value})} placeholder="••••••••" required/>
          <PhotoField label="Course Logo (optional)" value={reg.logo} onChange={async e=>{ if(e.target.files[0]) setReg({...reg,logo:await toB64(e.target.files[0])}); }}/>
          <div style={{background:"rgba(252,76,2,0.07)",border:"1px solid rgba(252,76,2,0.2)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontFamily:SANS,fontSize:12,color:MUT,lineHeight:1.6}}>
            ℹ Your registration will be reviewed by the admin team. You'll receive an email once approved.
          </div>
          <Btn onClick={doRegister} full>Submit Registration →</Btn>
          <div style={{textAlign:"center",marginTop:14,fontFamily:SANS,fontSize:12,color:MUT}}>Already registered? <span onClick={()=>setTab("login")} style={{color:ORG,cursor:"pointer",fontWeight:600}}>Sign in</span></div>
        </Card>
      </div>}

      {/* ── LOGIN ── */}
      {tab==="login"&&<div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:DISP,fontSize:32,color:TXT,letterSpacing:.5,marginBottom:4}}>Organiser Sign In</div>
          <div style={{fontFamily:SANS,fontSize:13,color:MUT}}>Approved courses only</div>
        </div>
        <Card>
          <Field label="Email"    type="email"    value={lgn.email} onChange={e=>setLgn({...lgn,email:e.target.value})} placeholder="you@course.com" required/>
          <Field label="Password" type="password" value={lgn.pw}    onChange={e=>setLgn({...lgn,pw:e.target.value})}    placeholder="••••••••"       required/>
          <Btn onClick={doLogin} full>Sign In →</Btn>
          <div style={{textAlign:"center",marginTop:14,fontFamily:SANS,fontSize:12,color:MUT}}>New course? <span onClick={()=>setTab("register")} style={{color:ORG,cursor:"pointer",fontWeight:600}}>Register free</span></div>
        </Card>
      </div>}

      {/* ── SUBMIT ── */}
      {tab==="submit"&&loggedOrg&&<div style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:DISP,fontSize:32,color:TXT,letterSpacing:.5,marginBottom:3}}>Submit Longest Drive</div>
          <div style={{fontFamily:SANS,fontSize:12,color:ORG,fontWeight:600}}>{loggedOrg.courseName} · {loggedOrg.location}</div>
        </div>
        <Card>
          <Field label="Player Name" value={form.player} onChange={e=>setForm({...form,player:e.target.value})} placeholder="Tiger Woods" required/>
          <Field label="Distance (yards)" type="number" value={form.dist} onChange={e=>setForm({...form,dist:e.target.value})} placeholder="e.g. 312" min="50" max="600" required/>
          {form.dist&&Number(form.dist)>0&&<div style={{background:"rgba(252,76,2,0.07)",border:"1px solid rgba(252,76,2,0.2)",borderRadius:8,padding:"8px 14px",marginBottom:14,fontFamily:SANS,fontSize:12,fontWeight:600,color:ORG}}>{tier(Number(form.dist))} — {Number(form.dist)>=350?"World-class distance!":Number(form.dist)>=300?"Impressive!":Number(form.dist)>=250?"Solid drive.":"Good effort!"}</div>}
          <Field label="Club Brand & Model" value={form.club} onChange={e=>setForm({...form,club:e.target.value})} placeholder="TaylorMade Stealth 2" required/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Field label="Handicap" type="number" value={form.hcp} onChange={e=>setForm({...form,hcp:e.target.value})} placeholder="5" min="-10" max="54" required/>
            <Field label="Age"      type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="34" min="10" max="100" required/>
          </div>
          <Field label="Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/>
          <PhotoField label="Photo Evidence of Drive Marker" value={form.photo} onChange={async e=>{ if(e.target.files[0]) setForm({...form,photo:await toB64(e.target.files[0])}); }} required/>
          <Btn onClick={doSubmit} full>Submit to World Registry →</Btn>
        </Card>
      </div>}
    </div>

    {detEnt&&<EntryModal entry={detEnt} org={orgFor(detEnt.orgId)} onClose={()=>setDetEnt(null)}/>}
    {showDemo&&<DemoSubmit onClose={()=>setShowDemo(false)} entries={entries} setEntries={setEntries} orgs={orgs} toast={toast}/>}
    {toastMsg&&<Toast msg={toastMsg} onDone={()=>setToastMsg(null)}/>}

    {/* Admin password gate */}
    {adminPw.show&&<Overlay onClose={()=>setAdminPw({show:false,val:""})}>
      <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:.5,marginBottom:4}}>⚙ Admin Access</div>
      <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:20}}>Enter the admin password to continue</div>
      <Field label="Password" type="password" value={adminPw.val} onChange={e=>setAdminPw({...adminPw,val:e.target.value})} placeholder="••••••••"/>
      <Btn full onClick={()=>{ if(adminPw.val===ADMIN_PW){setShowAdmin(true);setAdminPw({show:false,val:""});}else toast("Incorrect password"); }}>Enter Dashboard →</Btn>
      <div style={{fontFamily:SANS,fontSize:11,color:DIM,marginTop:12,textAlign:"center"}}>Password: LongShot2026</div>
    </Overlay>}
  </div>;
}
