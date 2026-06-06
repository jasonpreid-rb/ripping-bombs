import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Routes, Route, useLocation } from "react-router-dom";

// ─── EMAILJS CONFIG ───────────────────────────────────────────────────────────

const EJS_SERVICE       = "service_ijz7h1p";
const EJS_TEMPLATE_NOTIF    = "template_9w26xwm";
const EJS_TEMPLATE_CONTACT  = "template_21fdarp";
const EJS_TEMPLATE_SUBSCRIBE = "template_21fdarp"; // use contact template - known working
const EJS_KEY           = "jQT8w9IWlDWFVXTri";

async function sendEmail(subject, message, templateId = EJS_TEMPLATE_NOTIF, toEmail = null) {
  try {
    const params = { subject, message };
    if (toEmail) params.to_email = toEmail;
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  EJS_SERVICE,
        template_id: templateId,
        user_id:     EJS_KEY,
        template_params: params,
      }),
    });
    return res.status === 200;
  } catch { return false; }
}

async function sendRegistrationNotification(org) {
  // Sends to your hardcoded email in the EmailJS template
  const subject = `New Course Registration: ${org.courseName}`;
  const message =
    `New registration request received on Ripping Bombs:\n\n` +
    `Course: ${org.courseName}\n` +
    `Full Name: ${org.fullName||"—"}\n` +
    `Position: ${org.position||"—"}\n` +
    `Location: ${org.location}\n` +
    `Country: ${org.country||"—"}\n` +
    `Email: ${org.email}\n` +
    `Password: ${org.pw}\n\n` +
    `Login to the admin dashboard to approve or reject this registration.\n\n` +
    `https://www.rippingbombs.com`;
  return sendEmail(subject, message, EJS_TEMPLATE_NOTIF);
}

async function sendApprovalEmail(org) {
  // Uses contact template which should have {{to_email}} or club's address
  const subject = `You're approved on Ripping Bombs!`;
  const message =
    `Hi ${org.fullName},\n\n` +
    `Great news — ${org.courseName} has been approved on Ripping Bombs!\n\n` +
    `You can now log in and start submitting your longest drive competition results to the global leaderboard.\n\n` +
    `Login at: https://www.rippingbombs.com\n` +
    `Email: ${org.email}\n\n` +
    `If you have any questions, use the contact form on the site.\n\n` +
    `Welcome to Ripping Bombs!\n` +
    `The Ripping Bombs Team`;
  return sendEmail(subject, message, EJS_TEMPLATE_CONTACT, org.email);
}

// ─── SLUG UTIL ────────────────────────────────────────────────────────────────

const toSlug = str => str.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

// ─── COUNTRIES & FLAGS ───────────────────────────────────────────────────────

const COUNTRIES = [
  {code:"AF",name:"Afghanistan"},{code:"AL",name:"Albania"},{code:"DZ",name:"Algeria"},
  {code:"AR",name:"Argentina"},{code:"AU",name:"Australia"},{code:"AT",name:"Austria"},
  {code:"BH",name:"Bahrain"},{code:"BE",name:"Belgium"},{code:"BR",name:"Brazil"},
  {code:"BG",name:"Bulgaria"},{code:"KH",name:"Cambodia"},{code:"CA",name:"Canada"},
  {code:"CL",name:"Chile"},{code:"CN",name:"China"},{code:"CO",name:"Colombia"},
  {code:"HR",name:"Croatia"},{code:"CZ",name:"Czech Republic"},{code:"DK",name:"Denmark"},
  {code:"EG",name:"Egypt"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},
  {code:"DE",name:"Germany"},{code:"GH",name:"Ghana"},{code:"GR",name:"Greece"},
  {code:"HK",name:"Hong Kong"},{code:"HU",name:"Hungary"},{code:"IN",name:"India"},
  {code:"ID",name:"Indonesia"},{code:"IE",name:"Ireland"},{code:"IL",name:"Israel"},
  {code:"IT",name:"Italy"},{code:"JP",name:"Japan"},{code:"KE",name:"Kenya"},
  {code:"KR",name:"South Korea"},{code:"KW",name:"Kuwait"},{code:"MY",name:"Malaysia"},
  {code:"MX",name:"Mexico"},{code:"MA",name:"Morocco"},{code:"NL",name:"Netherlands"},
  {code:"NZ",name:"New Zealand"},{code:"NG",name:"Nigeria"},{code:"NO",name:"Norway"},
  {code:"OM",name:"Oman"},{code:"PK",name:"Pakistan"},{code:"PH",name:"Philippines"},
  {code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"QA",name:"Qatar"},
  {code:"RO",name:"Romania"},{code:"RU",name:"Russia"},{code:"SA",name:"Saudi Arabia"},
  {code:"SG",name:"Singapore"},{code:"ZA",name:"South Africa"},{code:"ES",name:"Spain"},
  {code:"SE",name:"Sweden"},{code:"CH",name:"Switzerland"},{code:"TW",name:"Taiwan"},
  {code:"TH",name:"Thailand"},{code:"TR",name:"Turkey"},{code:"AE",name:"UAE"},
  {code:"GB",name:"United Kingdom"},{code:"US",name:"United States"},{code:"UY",name:"Uruguay"},
  {code:"VN",name:"Vietnam"},{code:"ZW",name:"Zimbabwe"},
];

const countryFlag = code => {
  if (!code) return null;
  return <img src={`https://flagcdn.com/40x30/${code.toLowerCase()}.png`} alt={code} style={{width:20,height:15,objectFit:"cover",display:"inline-block",verticalAlign:"middle",marginLeft:6}} loading="lazy"/>;
};

const countryName = code => COUNTRIES.find(c => c.code === code)?.name || code;

// ─── LOGO ─────────────────────────────────────────────────────────────────────

const RB_LOGO_SVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.89 595.28" style={{height:40,width:"auto",display:"block"}} aria-label="Ripping Bombs">
    <polygon fill="#a3e635" points="146.662,300.557 22.035,521.864 155.217,521.864 279.933,300.406 216.568,188.458 369.538,188.458 421.032,72.414 17.521,72.414"/>
    <polygon fill="#a3e635" points="695.492,293.872 824.537,72.414 820.016,72.414 820.029,72.414 686.834,72.414 686.834,72.414 421.032,72.414 472.527,188.458 621.49,188.458 562.133,293.872 623.367,405.807 472.527,405.807 421.032,521.864 686.834,521.851 686.834,521.864 820.029,521.864 820.016,521.851 824.537,521.851"/>
  </svg>
);

const RB_LOGO_SVG_WHITE = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.89 595.28" style={{height:36,width:"auto",display:"block"}} aria-label="Ripping Bombs">
    <polygon fill="#ffffff" points="146.662,300.557 22.035,521.864 155.217,521.864 279.933,300.406 216.568,188.458 369.538,188.458 421.032,72.414 17.521,72.414"/>
    <polygon fill="#ffffff" points="695.492,293.872 824.537,72.414 820.016,72.414 820.029,72.414 686.834,72.414 686.834,72.414 421.032,72.414 472.527,188.458 621.49,188.458 562.133,293.872 623.367,405.807 472.527,405.807 421.032,521.864 686.834,521.851 686.834,521.864 820.029,521.864 820.016,521.851 824.537,521.851"/>
  </svg>
);

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const ADMIN_PW = "LongShot2026";
const SEED_KEY = "rb_seed_v12";
const ORGS_KEY = "rb_orgs";
const ENT_KEY  = "rb_entries";
const NOTIF_KEY = "rb_notifications";

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const db = {
  async get(k) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },

  async set(k, v) {
    try {
      // always save locally first
      localStorage.setItem(k, JSON.stringify(v));

      // only sync clubs
      if (k === "clubs") {
        const { supabase } = await import("../lib/supabaseClient");

        console.log("RAW VALUE:", v);

        const payload = Array.isArray(v) ? v : [v];

        const clean = payload.map(c => ({
          full_name: c.fullName || null,
          position: c.position || null,
          course_name: c.courseName || null,
          location: c.location || null,
          country: c.country || null,
          email: c.email || null,
          password: c.password || null,
          logo_url: c.logo || null,
        }));

        console.log("FINAL PAYLOAD:", clean);

        const { data, error } = await supabase
          .from("clubs")
          .insert(clean);

        console.log("SUPABASE DATA:", data);
        console.log("SUPABASE ERROR:", error);

        alert(error ? error.message : "Inserted OK");
      }

    } catch (e) {
      console.log("DB set error:", e);
    }
  },

  async del(k) {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

// ─── WEEK UTILS ───────────────────────────────────────────────────────────────

function isoWeek(dateStr) {
  const d = new Date(dateStr+"T12:00:00");
  const j4 = new Date(d.getFullYear(),0,4);
  const mon = new Date(j4); mon.setDate(j4.getDate()-((j4.getDay()+6)%7));
  const w = Math.floor((d-mon)/(7*864e5))+1;
  return { y:d.getFullYear(), w };
}
function nowWeek() { return isoWeek(new Date().toISOString().slice(0,10)); }
function weekLabel({y,w}) {
  const j4=new Date(y,0,4), mon=new Date(j4);
  mon.setDate(j4.getDate()-((j4.getDay()+6)%7)+(w-1)*7);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  const f=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  return `Wk ${w} ${f(mon)} – ${f(sun)} ${y}`;
}
function sameWeek(ds,{y,w}){ const x=isoWeek(ds); return x.y===y&&x.w===w; }
function prevWeek({y,w}) { return w===1?{y:y-1,w:52}:{y,w:w-1}; }
function nextWeek({y,w}) { const nw=nowWeek(); if(y>nw.y||(y===nw.y&&w>=nw.w)) return {y,w}; return w===52?{y:y+1,w:1}:{y,w:w+1}; }

const todayStr = ()=>new Date().toISOString().slice(0,10);
const fmtDate = d=>{ try{ return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }catch{return d;} };
const tier = d=>d>=350?"🟡 Elite":d>=300?"🟢 Pro":d>=250?"🔵 Strong":"⚪ Amateur";
const tierClr = d=>"#a3e635";
const toB64 = f=>new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────

const BG   = "#1a1a1a";
const BG2  = "#242424";
const BG3  = "#2e2e2e";
const ORG  = "#a3e635";
const ORG2 = "#bef264";
const GOLD = "#a3e635";
const GRN  = "#a3e635";
const BDR  = "rgba(255,255,255,0.08)";
const TXT  = "#f0f0f0";
const MUT  = "#a0a0a0";
const DIM  = "#666666";
const SANS = "'Inter','Helvetica Neue',sans-serif";
const DISP = "'Bebas Neue','Arial Black',sans-serif";

// ─── BADGE DEFINITIONS ───────────────────────────────────────────────────────

const BADGES = {
  platinum: { label:"Platinum Verified", icon:"💎", color:"#bfdbfe", bg:"rgba(147,197,253,0.1)", border:"rgba(147,197,253,0.3)" },
  tour:     { label:"Tour Verified",     icon:"★",  color:GOLD,       bg:"rgba(240,180,41,0.1)",  border:"rgba(240,180,41,0.35)" },
  amateur:  { label:"Amateur Verified",  icon:"✅", color:GRN,        bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.3)" },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────

function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }

const SEED_ORGS = [
  {id:"o1", fullName:"James Hargreaves", position:"Club Secretary",       courseName:"Royal Birkdale Golf Club",  location:"Southport, England",     country:"GB", email:"james@royalbirkdale.com",  pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o2", fullName:"Caitlin O'Brien",  position:"Tournament Director",  courseName:"Lahinch Golf Club",          location:"Lahinch, Ireland",       country:"IE", email:"caitlin@lahinch.ie",       pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o3", fullName:"Magnus Lindqvist", position:"Head Professional",    courseName:"Barsebäck G&CC",             location:"Malmö, Sweden",          country:"SE", email:"magnus@barseback.se",      pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o4", fullName:"Hiroshi Tanaka",   position:"General Manager",      courseName:"Hirono Golf Club",           location:"Kobe, Japan",            country:"JP", email:"hiroshi@hirono.jp",        pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o5", fullName:"Priya Nair",       position:"Events Coordinator",   courseName:"Royal Calcutta Golf Club",   location:"Kolkata, India",         country:"IN", email:"priya@rcgc.in",            pw:"demo",logo:"",status:"approved",badge:"amateur"},
  {id:"o6", fullName:"Dylan Schwartz",   position:"Club Manager",         courseName:"Bethpage Black",             location:"New York, USA",          country:"US", email:"dylan@bethpage.com",       pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o7", fullName:"Amara Diallo",     position:"Tournament Organiser", courseName:"Leopard Creek CC",           location:"Malelane, South Africa", country:"ZA", email:"amara@leopardcreek.co.za", pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o8", fullName:"Sofia Reyes",      position:"Head Pro",             courseName:"Club de Golf Chapultepec",   location:"Mexico City, Mexico",    country:"MX", email:"sofia@chapultepec.mx",     pw:"demo",logo:"",status:"approved",badge:"amateur"},
  {id:"o9", fullName:"Hans Brauer",      position:"Head Professional",    courseName:"Golf Club Bad Griesbach",    location:"Bavaria, Germany",       country:"DE", email:"hans@gcbg.de",             pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o10",fullName:"Will Cartwright",  position:"General Manager",      courseName:"Carnoustie Golf Links",      location:"Carnoustie, Scotland",   country:"GB", email:"will@carnoustie.co.uk",    pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o11",fullName:"Nadia Okonkwo",    position:"Club Director",        courseName:"Ikoyi Golf Club",            location:"Lagos, Nigeria",         country:"NG", email:"nadia@ikoyi.ng",           pw:"demo",logo:"",status:"approved",badge:"amateur"},
  {id:"o12",fullName:"Pedro Almeida",    position:"Tournament Director",  courseName:"Quinta do Lago Golf",        location:"Algarve, Portugal",      country:"PT", email:"pedro@qdl.pt",             pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o13",fullName:"Chen Wei",         position:"Head Professional",    courseName:"Mission Hills Golf Club",    location:"Shenzhen, China",        country:"CN", email:"chen@missionhills.cn",     pw:"demo",logo:"",status:"approved",badge:"platinum"},
  {id:"o14",fullName:"Aiden Murphy",     position:"Events Manager",       courseName:"K Club Golf Resort",         location:"Straffan, Ireland",      country:"IE", email:"aiden@kclub.ie",           pw:"demo",logo:"",status:"approved",badge:"tour"},
  {id:"o15",fullName:"Fatima Al-Rashid", position:"Club Secretary",       courseName:"Abu Dhabi Golf Club",        location:"Abu Dhabi, UAE",         country:"AE", email:"fatima@adgc.ae",           pw:"demo",logo:"",status:"pending", badge:null},
  {id:"o16",fullName:"Marco Rossi",      position:"General Manager",      courseName:"Golf Club Milano",           location:"Milan, Italy",           country:"IT", email:"marco@gcmilano.it",        pw:"demo",logo:"",status:"pending", badge:null},
];

const SEED_ENTRIES = [
  // ── Week 1 (this week) ────────────────────────────────────────────────────
  {id:"e01",orgId:"o6", player:"Marcus Webb",       dist:267,club:"TaylorMade Stealth 2",             hcp:2, age:34,date:daysAgo(0), photo:"",gender:"male"},
  {id:"e02",orgId:"o1", player:"Tom Ashworth",       dist:251,club:"Callaway Paradym",                 hcp:7, age:28,date:daysAgo(0), photo:"",gender:"male"},
  {id:"e03",orgId:"o4", player:"Kenji Mori",          dist:243,club:"Ping G430 LST",                    hcp:0, age:41,date:daysAgo(0), photo:"",gender:"male"},
  {id:"e04",orgId:"o7", player:"Sipho Dlamini",       dist:218,club:"Cobra Aerojet LS",                 hcp:14,age:22,date:daysAgo(0), photo:"",gender:"male"},
  {id:"e05",orgId:"o2", player:"Fiona O'Sullivan",    dist:196,club:"Titleist TSR3",                    hcp:5, age:37,date:daysAgo(0), photo:"",gender:"female"},
  {id:"e06",orgId:"o3", player:"Erik Johansson",      dist:258,club:"TaylorMade Qi10 LS",              hcp:1, age:29,date:daysAgo(1), photo:"",gender:"male"},
  {id:"e07",orgId:"o8", player:"Carlos Mendoza",      dist:231,club:"Callaway Paradym Ai Smoke",        hcp:9, age:45,date:daysAgo(1), photo:"",gender:"male"},
  {id:"e08",orgId:"o5", player:"Priya Sharma",        dist:187,club:"Srixon ZX5 Mk II",                hcp:3, age:31,date:daysAgo(1), photo:"",gender:"female"},
  {id:"e09",orgId:"o6", player:"Tyler Briggs",        dist:198,club:"Cleveland Launcher XL2",           hcp:18,age:55,date:daysAgo(1), photo:"",gender:"male"},
  {id:"e10",orgId:"o1", player:"Oliver Crane",        dist:247,club:"Titleist TSi3",                    hcp:4, age:26,date:daysAgo(1), photo:"",gender:"male"},
  {id:"e11",orgId:"o4", player:"Ryo Fujiwara",        dist:262,club:"Ping G430 Max 10K",               hcp:0, age:24,date:daysAgo(2), photo:"",gender:"male"},
  {id:"e12",orgId:"o2", player:"Declan Murphy",       dist:214,club:"TaylorMade Stealth HD",            hcp:11,age:48,date:daysAgo(2), photo:"",gender:"male"},
  {id:"e13",orgId:"o7", player:"Thandeka Nkosi",      dist:201,club:"Cobra Darkspeed X",               hcp:6, age:33,date:daysAgo(2), photo:"",gender:"female"},
  {id:"e14",orgId:"o8", player:"Valentina Cruz",      dist:183,club:"Mizuno ST-X 230",                 hcp:16,age:62,date:daysAgo(2), photo:"",gender:"female"},
  {id:"e15",orgId:"o3", player:"Lars Eklund",         dist:255,club:"Callaway Paradym Triple Diamond",  hcp:2, age:38,date:daysAgo(2), photo:"",gender:"male"},
  {id:"e16",orgId:"o5", player:"Rohit Menon",         dist:224,club:"Wilson Dynapower",                 hcp:8, age:44,date:daysAgo(3), photo:"",gender:"male"},
  {id:"e17",orgId:"o1", player:"James Whitfield",     dist:261,club:"TaylorMade Qi10",                 hcp:0, age:27,date:daysAgo(3), photo:"",gender:"male"},
  {id:"e18",orgId:"o6", player:"DeShawn Porter",      dist:249,club:"Ping G430 Max",                   hcp:5, age:19,date:daysAgo(3), photo:"",gender:"male"},
  {id:"e19",orgId:"o2", player:"Cormac Byrne",        dist:178,club:"Titleist TSR2",                   hcp:20,age:67,date:daysAgo(3), photo:"",gender:"male"},
  {id:"e20",orgId:"o4", player:"Takeshi Ono",         dist:244,club:"Srixon ZX7 Mk II",                hcp:3, age:35,date:daysAgo(3), photo:"",gender:"male"},
  {id:"e21",orgId:"o7", player:"Bongani Zulu",        dist:233,club:"Cobra Aerojet Max",               hcp:12,age:40,date:daysAgo(4), photo:"",gender:"male"},
  {id:"e22",orgId:"o3", player:"Björn Magnusson",     dist:257,club:"TaylorMade Stealth 2+",           hcp:1, age:30,date:daysAgo(4), photo:"",gender:"male"},
  {id:"e23",orgId:"o8", player:"Sofia Vargas",        dist:192,club:"Callaway Rogue ST LS",            hcp:7, age:52,date:daysAgo(4), photo:"",gender:"female"},
  {id:"e24",orgId:"o5", player:"Ananya Pillai",       dist:179,club:"Titleist TSR1",                   hcp:10,age:28,date:daysAgo(4), photo:"",gender:"female"},
  {id:"e25",orgId:"o6", player:"Ryan Kowalski",       dist:246,club:"Mizuno ST-Z 230",                 hcp:4, age:23,date:daysAgo(4), photo:"",gender:"male"},
  {id:"e26",orgId:"o9", player:"Hans Brauer",         dist:252,club:"TaylorMade Stealth 2+",            hcp:2, age:44,date:daysAgo(2), photo:"",gender:"male"},
  {id:"e27",orgId:"o10",player:"Alistair MacLeod",    dist:259,club:"Cobra Darkspeed LS",               hcp:0, age:38,date:daysAgo(1), photo:"",gender:"male"},
  {id:"e28",orgId:"o11",player:"Emeka Osei",          dist:228,club:"TaylorMade Qi10 Max",             hcp:8, age:29,date:daysAgo(1), photo:"",gender:"male"},
  {id:"e29",orgId:"o12",player:"João Silva",           dist:241,club:"Callaway Paradym Ai Smoke",       hcp:3, age:33,date:daysAgo(2), photo:"",gender:"male"},
  {id:"e30",orgId:"o13",player:"Zhang Wei",            dist:253,club:"Ping G430 LST",                   hcp:1, age:26,date:daysAgo(0), photo:"",gender:"male"},
  {id:"e31",orgId:"o14",player:"Conor Gallagher",     dist:237,club:"Titleist TSR3",                    hcp:6, age:31,date:daysAgo(3), photo:"",gender:"male"},
  // ── Week 2 (last week, days 7–13) ────────────────────────────────────────
  {id:"e32",orgId:"o6", player:"Marcus Webb",         dist:264,club:"TaylorMade Stealth 2",             hcp:2, age:34,date:daysAgo(7), photo:"",gender:"male"},
  {id:"e33",orgId:"o1", player:"Sam Fletcher",        dist:229,club:"Callaway Paradym",                 hcp:9, age:22,date:daysAgo(7), photo:"",gender:"male"},
  {id:"e34",orgId:"o4", player:"Ryo Fujiwara",        dist:265,club:"Ping G430 Max 10K",               hcp:0, age:24,date:daysAgo(7), photo:"",gender:"male"},
  {id:"e35",orgId:"o3", player:"Erik Johansson",      dist:254,club:"TaylorMade Qi10 LS",              hcp:1, age:29,date:daysAgo(8), photo:"",gender:"male"},
  {id:"e36",orgId:"o7", player:"Thandeka Nkosi",      dist:198,club:"Cobra Darkspeed X",               hcp:6, age:33,date:daysAgo(8), photo:"",gender:"female"},
  {id:"e37",orgId:"o2", player:"Fiona O'Sullivan",    dist:193,club:"Titleist TSR3",                    hcp:5, age:37,date:daysAgo(8), photo:"",gender:"female"},
  {id:"e38",orgId:"o5", player:"Priya Sharma",        dist:184,club:"Srixon ZX5 Mk II",                hcp:3, age:31,date:daysAgo(9), photo:"",gender:"female"},
  {id:"e39",orgId:"o8", player:"Sofia Vargas",        dist:189,club:"Mizuno ST-Z 230",                 hcp:15,age:41,date:daysAgo(9), photo:"",gender:"female"},
  {id:"e40",orgId:"o6", player:"DeShawn Porter",      dist:251,club:"Ping G430 Max",                   hcp:5, age:19,date:daysAgo(9), photo:"",gender:"male"},
  {id:"e41",orgId:"o1", player:"Oliver Crane",        dist:245,club:"Titleist TSi3",                    hcp:4, age:26,date:daysAgo(10),photo:"",gender:"male"},
  {id:"e42",orgId:"o13",player:"Zhang Wei",            dist:260,club:"Ping G430 LST",                   hcp:1, age:26,date:daysAgo(8), photo:"",gender:"male"},
  {id:"e43",orgId:"o12",player:"João Silva",           dist:239,club:"Callaway Paradym",                hcp:3, age:33,date:daysAgo(9), photo:"",gender:"male"},
  {id:"e44",orgId:"o11",player:"Emeka Osei",          dist:221,club:"TaylorMade Qi10 Max",             hcp:8, age:29,date:daysAgo(10),photo:"",gender:"male"},
  {id:"e45",orgId:"o14",player:"Conor Gallagher",     dist:233,club:"Titleist TSR3",                    hcp:6, age:31,date:daysAgo(11),photo:"",gender:"male"},
  {id:"e46",orgId:"o9", player:"Hans Brauer",         dist:248,club:"TaylorMade Stealth 2+",            hcp:2, age:44,date:daysAgo(10),photo:"",gender:"male"},
  {id:"e47",orgId:"o10",player:"Alistair MacLeod",    dist:256,club:"Cobra Darkspeed LS",               hcp:0, age:38,date:daysAgo(9), photo:"",gender:"male"},
  {id:"e48",orgId:"o4", player:"Kenji Mori",          dist:241,club:"Ping G430 LST",                    hcp:0, age:41,date:daysAgo(11),photo:"",gender:"male"},
  {id:"e49",orgId:"o2", player:"Declan Murphy",       dist:209,club:"TaylorMade Stealth HD",            hcp:11,age:48,date:daysAgo(12),photo:"",gender:"male"},
  {id:"e50",orgId:"o3", player:"Lars Eklund",         dist:253,club:"Callaway Paradym Triple Diamond",  hcp:2, age:38,date:daysAgo(13),photo:"",gender:"male"},
  // ── Week 3 (next week, days -6 to -1 i.e. future) ────────────────────────
  {id:"e51",orgId:"o1", player:"Jack Hargreaves",     dist:236,club:"TaylorMade Qi10 Max",              hcp:3, age:17,date:daysAgo(-1),photo:"",gender:"male"},
  {id:"e52",orgId:"o6", player:"Aaliyah Porter",      dist:198,club:"Callaway Paradym",                 hcp:8, age:16,date:daysAgo(-1),photo:"",gender:"female"},
  {id:"e53",orgId:"o3", player:"Emil Johansson",      dist:221,club:"Ping G430 LST",                    hcp:5, age:15,date:daysAgo(-1),photo:"",gender:"male"},
  {id:"e54",orgId:"o4", player:"Yuki Tanaka",         dist:189,club:"Srixon ZX5 Mk II",                 hcp:7, age:14,date:daysAgo(-2),photo:"",gender:"male"},
  {id:"e55",orgId:"o2", player:"Saoirse Murphy",      dist:176,club:"Titleist TSR1",                    hcp:12,age:13,date:daysAgo(-2),photo:"",gender:"female"},
  {id:"e56",orgId:"o7", player:"Lebo Dlamini",        dist:142,club:"Cobra Aerojet",                    hcp:18,age:11,date:daysAgo(-2),photo:"",gender:"male"},
  {id:"e57",orgId:"o11",player:"Chidi Okonkwo",       dist:118,club:"Wilson Dynapower",                 hcp:22,age:10,date:daysAgo(-3),photo:"",gender:"male"},
  {id:"e58",orgId:"o5", player:"Meera Nair",          dist:104,club:"Callaway Rogue ST",                hcp:24,age:9, date:daysAgo(-3),photo:"",gender:"female"},
  {id:"e59",orgId:"o13",player:"Liu Wei",             dist:229,club:"TaylorMade Stealth 2",             hcp:6, age:17,date:daysAgo(-3),photo:"",gender:"male"},
  {id:"e60",orgId:"o14",player:"Cillian Gallagher",   dist:214,club:"Titleist TSR3",                    hcp:9, age:16,date:daysAgo(-4),photo:"",gender:"male"},
  {id:"e61",orgId:"o9", player:"Anna Brauer",         dist:168,club:"Ping G430",                        hcp:14,age:15,date:daysAgo(-4),photo:"",gender:"female"},
  {id:"e62",orgId:"o10",player:"Fraser MacLeod",      dist:193,club:"Cobra Darkspeed",                  hcp:11,age:14,date:daysAgo(-4),photo:"",gender:"male"},
  {id:"e63",orgId:"o12",player:"Beatriz Almeida",     dist:159,club:"Callaway Paradym",                 hcp:16,age:13,date:daysAgo(-5),photo:"",gender:"female"},
  {id:"e64",orgId:"o8", player:"Diego Reyes Jr",      dist:131,club:"TaylorMade RBZ",                   hcp:20,age:11,date:daysAgo(-5),photo:"",gender:"male"},
  {id:"e65",orgId:"o6", player:"Marcus Webb Jr",      dist:112,club:"Wilson Staff",                     hcp:24,age:9, date:daysAgo(-5),photo:"",gender:"male"},
  {id:"e66",orgId:"o3", player:"Ingrid Magnusson",    dist:183,club:"Titleist TSR2",                    hcp:10,age:17,date:daysAgo(-6),photo:"",gender:"female"},
  {id:"e67",orgId:"o1", player:"Ben Ashworth",        dist:228,club:"TaylorMade Qi10",                  hcp:4, age:16,date:daysAgo(-6),photo:"",gender:"male"},
  {id:"e68",orgId:"o4", player:"Hana Fujiwara",       dist:171,club:"Ping G430",                        hcp:13,age:15,date:daysAgo(-6),photo:"",gender:"female"},
];

async function initData(){
  const seeded  = await db.get(SEED_KEY);
  const existing = await db.get(ORGS_KEY);
  if(!seeded || !existing || existing.length===0){
    await db.set(ORGS_KEY, SEED_ORGS);
    await db.set(ENT_KEY,  SEED_ENTRIES);
    await db.set(SEED_KEY, true);
  }
  return { orgs: (await db.get(ORGS_KEY))||SEED_ORGS, entries: (await db.get(ENT_KEY))||SEED_ENTRIES };
}

// ─── SHARE MODAL ─────────────────────────────────────────────────────────────

function ShareModal({ entry, org, cvt, unitLbl, onClose }) {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const driveUrl = `https://www.rippingbombs.com/drive/${entry.id}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#0e0e0e";
    ctx.fillRect(0, 0, W, H);

    // Lime green accent bars
    ctx.fillStyle = "#a3e635";
    ctx.fillRect(0, 0, W, 8);
    ctx.fillRect(0, H - 8, W, 8);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(163,230,53,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const drawRBLogo = (ctx, x, y, w) => {
      // Scale to match flag size (80x60 equivalent) - original SVG viewBox 841.89 x 595.28
      const h = w * (595.28 / 841.89);
      const scaleX = w / 841.89;
      const scaleY = h / 595.28;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scaleX, scaleY);
      ctx.fillStyle = "#ffffff";
      // Left arrow shape
      ctx.beginPath();
      ctx.moveTo(146.662, 300.557);
      ctx.lineTo(22.035, 521.864);
      ctx.lineTo(155.217, 521.864);
      ctx.lineTo(279.933, 300.406);
      ctx.lineTo(216.568, 188.458);
      ctx.lineTo(369.538, 188.458);
      ctx.lineTo(421.032, 72.414);
      ctx.lineTo(17.521, 72.414);
      ctx.closePath();
      ctx.fill();
      // Right arrow shape
      ctx.beginPath();
      ctx.moveTo(695.492, 293.872);
      ctx.lineTo(824.537, 72.414);
      ctx.lineTo(820.016, 72.414);
      ctx.lineTo(820.029, 72.414);
      ctx.lineTo(686.834, 72.414);
      ctx.lineTo(421.032, 72.414);
      ctx.lineTo(472.527, 188.458);
      ctx.lineTo(621.49, 188.458);
      ctx.lineTo(562.133, 293.872);
      ctx.lineTo(623.367, 405.807);
      ctx.lineTo(472.527, 405.807);
      ctx.lineTo(421.032, 521.864);
      ctx.lineTo(686.834, 521.851);
      ctx.lineTo(820.029, 521.864);
      ctx.lineTo(820.016, 521.851);
      ctx.lineTo(824.537, 521.851);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawContent = (flagImg, courseLogoImg) => {
      // RB Logo top left - same size as flag (80x60)
      drawRBLogo(ctx, 80, 58, 80);

      // Flag top right
      if (flagImg) {
        ctx.drawImage(flagImg, W - 160, 58, 80, 60);
      }

      // Divider line
      ctx.strokeStyle = "rgba(163,230,53,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 150); ctx.lineTo(W - 80, 150); ctx.stroke();

      // Course logo (if available) top centre
      if (courseLogoImg) {
        const clAspect = courseLogoImg.naturalWidth / courseLogoImg.naturalHeight;
        const clH = 100;
        const clW = clH * clAspect;
        ctx.drawImage(courseLogoImg, (W - clW) / 2, 170, clW, clH);
      }

      // Distance - massive
      ctx.fillStyle = "#a3e635";
      ctx.font = "bold 300px Arial Black, Arial";
      ctx.textAlign = "center";
      ctx.fillText(String(cvt(entry.dist)), W / 2, 560);

      // Unit
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "bold 48px Arial";
      ctx.fillText(unitLbl.toUpperCase(), W / 2, 620);

      // VERIFIED DISTANCE badge
      const badgeW = 320, badgeH = 44, badgeX = (W - badgeW) / 2, badgeY = 648;
      ctx.strokeStyle = "rgba(163,230,53,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
      ctx.fillStyle = "rgba(163,230,53,0.08)";
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.fillStyle = "#a3e635";
      ctx.font = "bold 18px Arial";
      ctx.letterSpacing = "3px";
      ctx.fillText("✓  VERIFIED DISTANCE", W / 2, badgeY + 29);

      // Player name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 72px Arial Black, Arial";
      ctx.letterSpacing = "0px";
      ctx.fillText(entry.player.toUpperCase(), W / 2, 790);

      // Course name
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "34px Arial";
      ctx.fillText(org?.courseName || "", W / 2, 845);

      // Tournament name (if exists)
      if (entry.tournament) {
        ctx.fillStyle = "rgba(163,230,53,0.7)";
        ctx.font = "italic 28px Arial";
        ctx.fillText(entry.tournament, W / 2, 892);
      }

      // Date stamp
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "24px Arial";
      ctx.fillText(fmtDate(entry.date), W / 2, entry.tournament ? 935 : 900);

      // Bottom divider
      ctx.strokeStyle = "rgba(163,230,53,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 930); ctx.lineTo(W - 80, 930); ctx.stroke();

      // rippingbombs.com subtle at bottom
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "24px Arial";
      ctx.fillText("rippingbombs.com", W / 2, 980);

      setImageUrl(canvas.toDataURL("image/png"));
    };

    // Load images in parallel then draw
    const flagSrc = org?.country ? `https://flagcdn.com/80x60/${org.country.toLowerCase()}.png` : null;
    const courseSrc = org?.logo || null;

    const loadImage = (src) => new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    Promise.all([loadImage(flagSrc), loadImage(courseSrc)])
      .then(([flagImg, courseLogoImg]) => drawContent(flagImg, courseLogoImg));
  }, [entry, org]);

  function downloadImage() {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `rippingbombs-${entry.player.replace(/\s+/g,"-").toLowerCase()}-${cvt(entry.dist)}${unitLbl}.png`;
    a.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(driveUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }

  const shareText = `⛳ ${entry.player} hit ${cvt(entry.dist)} ${unitLbl} at ${org?.courseName||"a course"} — check it out on Ripping Bombs!`;

  return (
    <Overlay onClose={onClose}>
      <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,marginBottom:6,textTransform:"uppercase"}}>Share This Drive</div>
      <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5,marginBottom:16}}>{entry.player} — {cvt(entry.dist)} {unitLbl}</div>

      {/* Canvas (hidden) */}
      <canvas ref={canvasRef} style={{display:"none"}}/>

      {/* Preview */}
      {imageUrl && <img src={imageUrl} alt="Share card" style={{width:"100%",borderRadius:0,marginBottom:16,border:`1px solid ${BDR}`}}/>}

      {/* Platform buttons */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>

        {/* WhatsApp */}
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + driveUrl)}`} target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#25D366",padding:"12px",textDecoration:"none",cursor:"pointer"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span style={{fontFamily:SANS,fontWeight:700,fontSize:12,color:"#fff"}}>WhatsApp</span>
        </a>

        {/* Facebook */}
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(driveUrl)}`} target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#1877F2",padding:"12px",textDecoration:"none",cursor:"pointer"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span style={{fontFamily:SANS,fontWeight:700,fontSize:12,color:"#fff"}}>Facebook</span>
        </a>

        {/* Instagram — download for story */}
        <button onClick={downloadImage}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",border:"none",padding:"12px",cursor:"pointer"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          <span style={{fontFamily:SANS,fontWeight:700,fontSize:12,color:"#fff"}}>Save for Instagram</span>
        </button>

        {/* Copy link */}
        <button onClick={copyLink}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:copied?"rgba(163,230,53,0.15)":"rgba(255,255,255,0.07)",border:`1px solid ${copied?ORG:BDR}`,padding:"12px",cursor:"pointer",transition:"all .2s"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={copied?ORG:"#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span style={{fontFamily:SANS,fontWeight:700,fontSize:12,color:copied?ORG:"#fff"}}>{copied?"Copied!":"Copy Link"}</span>
        </button>
      </div>

      {/* Download full image */}
      <button onClick={downloadImage} style={{width:"100%",background:"transparent",border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:"11px",cursor:"pointer",letterSpacing:.5}}>
        ↓ Download Share Image (PNG)
      </button>

      <div style={{fontFamily:SANS,fontSize:10,color:DIM,marginTop:10,textAlign:"center"}}>
        For Instagram: save the image then share as a post or story
      </div>
    </Overlay>
  );
}


// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────

function Toast({msg,onDone}){
  useEffect(()=>{ const t=setTimeout(onDone,3200); return()=>clearTimeout(t); },[]);
  return <div style={{position:"fixed",bottom:22,right:22,zIndex:9999,background:BG3,border:`1px solid ${GRN}`,borderRadius:10,padding:"12px 20px",fontFamily:SANS,fontSize:12,color:GRN,boxShadow:"0 8px 30px rgba(0,0,0,0.12)",letterSpacing:.5,animation:"su .3s ease"}}>[OK] {msg}</div>;
}

function Btn({children,onClick,variant="orange",small=false,full=false,style:sx={}}){
  const v={
    orange:  {background:"transparent", color:ORG, border:`1px solid ${ORG}`},
    ghost:   {background:"transparent", color:ORG, border:`1px solid rgba(163,230,53,0.4)`},
    subtle:  {background:"transparent", color:MUT,  border:`1px solid ${BDR}`},
    danger:  {background:"transparent", color:"#f87171", border:"1px solid rgba(220,60,60,0.5)"},
    approve: {background:"transparent", color:GRN,  border:`1px solid rgba(163,230,53,0.5)`},
    gold:    {background:"transparent", color:ORG,  border:`1px solid ${ORG}`},
  }[variant]||{};
  return <button onClick={onClick} style={{...v,fontFamily:SANS,fontWeight:700,fontSize:small?10:12,letterSpacing:.5,cursor:"pointer",borderRadius:0,padding:small?"5px 12px":"10px 22px",width:full?"100%":"auto",transition:"opacity .15s,transform .1s",...sx}}
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
    <div style={{border:`1px dashed rgba(163,230,53,0.3)`,borderRadius:10,padding:16,background:"rgba(163,230,53,0.03)",textAlign:"center"}}>
      {value?<><img src={value} alt="" style={{maxHeight:100,maxWidth:"100%",borderRadius:8,marginBottom:6,objectFit:"cover"}}/><div style={{fontFamily:SANS,fontSize:11,color:GRN}}>Photo uploaded</div></>:<div style={{color:DIM,fontFamily:SANS,fontSize:12}}>No photo selected</div>}
      <input type="file" accept="image/*" onChange={onChange} style={{display:"block",margin:"8px auto 0",fontFamily:SANS,fontSize:11,color:MUT}}/>
    </div>
  </div>;
}

function Card({children,style:sx={}}){
  return <div style={{background:BG2,border:`1px solid ${BDR}`,borderRadius:0,padding:24,...sx}}>{children}</div>;
}

function Pill({label,color}){
  const map={approved:GRN,pending:GOLD,rejected:"#f87171",disabled:"#6b7280"};
  const c=map[color]||MUT;
  return <span style={{fontFamily:SANS,fontSize:10,fontWeight:600,letterSpacing:.8,color:c,background:`${c}18`,border:`1px solid ${c}44`,borderRadius:0,padding:"2px 8px",textTransform:"uppercase"}}>{label}</span>;
}

function BadgePill({badge,small}){
  if(!badge||!BADGES[badge]) return null;
  const b=BADGES[badge];
  return <span style={{fontFamily:SANS,fontSize:small?9:10,fontWeight:600,color:b.color,background:b.bg,border:`1px solid ${b.border}`,borderRadius:0,padding:small?"1px 6px":"2px 9px",whiteSpace:"nowrap",letterSpacing:.5}}>{b.icon} {b.label}</span>;
}

function Overlay({children,onClose}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:BG2,border:`1px solid rgba(255,255,255,0.1)`,borderRadius:18,width:"100%",maxWidth:520,padding:30,position:"relative",boxShadow:"0 32px 100px rgba(0,0,0,0.15)",maxHeight:"92vh",overflowY:"auto"}}>
      <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"none",border:"none",color:MUT,fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
      {children}
    </div>
  </div>;
}

// ─── UNIT TOGGLE SWITCH ───────────────────────────────────────────────────────

function UnitToggle({ unit, setUnit }) {
  const isM = unit === "m";
  return (
    <div style={{display:"flex",alignItems:"center",gap:7}}>
      <span
        onClick={()=>setUnit("yds")}
        style={{fontFamily:SANS,fontSize:12,fontWeight:700,cursor:"pointer",color:isM?"rgba(255,255,255,0.4)":"#fff",transition:"color .2s",userSelect:"none",letterSpacing:.5}}
      >yds</span>
      <div
        onClick={()=>setUnit(isM?"yds":"m")}
        role="switch"
        aria-checked={isM}
        tabIndex={0}
        onKeyDown={e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();setUnit(isM?"yds":"m");}}}
        style={{width:42,height:24,borderRadius:12,background:isM?ORG:"rgba(255,255,255,0.2)",cursor:"pointer",position:"relative",transition:"background .22s",border:"1px solid rgba(255,255,255,0.25)",flexShrink:0}}
      >
        <div style={{
          position:"absolute",top:2,
          left:isM?18:2,
          width:18,height:18,
          borderRadius:"50%",
          background:"#fff",
          transition:"left .22s cubic-bezier(.4,0,.2,1)",
          boxShadow:"0 1px 4px rgba(0,0,0,0.4)"
        }}/>
      </div>
      <span
        onClick={()=>setUnit("m")}
        style={{fontFamily:SANS,fontSize:12,fontWeight:700,cursor:"pointer",color:isM?"#fff":"rgba(255,255,255,0.4)",transition:"color .2s",userSelect:"none",letterSpacing:.5}}
      >m</span>
    </div>
  );
}

// ─── CROSS-HIGHLIGHT TABLE ────────────────────────────────────────────────────

function LeaderTable({rows,orgFor,onView,onShare,cvt,unitLbl}){
  const [hr,setHr]=useState(null);
  const [hc,setHc]=useState(null);
  const COLS=["Rank","Player","Distance","Club","HCP","Age","Gender","Course","Event","Date","Tier","Share"];
  const bg=(ri,ci)=>{
    const rh=hr===ri, ch=hc===ci;
    if(rh&&ch) return ORG;
    if(rh) return "rgba(163,230,53,0.1)";
    if(ch) return "rgba(163,230,53,0.05)";
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
            style={{padding:"11px 14px",fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1.2,color:hc===ci?ORG:DIM,textTransform:"uppercase",textAlign:"left",background:hc===ci?"rgba(163,230,53,0.05)":"transparent",borderBottom:`2px solid ${BDR}`,transition:"all .12s",userSelect:"none"}}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((e,ri)=>{
          const org=orgFor(e.orgId);
          const medal=ri===0?"🥇":ri===1?"🥈":ri===2?"🥉":null;
          const distEl=<span style={{fontFamily:DISP,fontSize:20,color:hr===ri&&hc===2?"#fff":tierClr(e.dist),letterSpacing:.5}}>{cvt(e.dist)}<span style={{fontFamily:SANS,fontSize:10,color:hr===ri&&hc===2?"rgba(255,255,255,0.7)":DIM,marginLeft:3}}>{unitLbl}</span></span>;
          const cells=[
            medal?<span style={{fontSize:20}}>{medal}</span>:<span style={{fontFamily:DISP,fontSize:14,color:DIM}}>#{ri+1}</span>,
            <span style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:hr===ri&&hc===1?"#fff":TXT}}>{e.player}{org?.country&&countryFlag(org.country)}</span>,
            distEl,
            <span style={{fontSize:12}}>{e.club}</span>,
            <span style={{fontSize:12}}>{e.hcp}</span>,
            <span style={{fontSize:12}}>{e.age}</span>,
            <span style={{fontSize:12}}>{e.gender==="female"?"♀ Female":e.gender==="male"?"♂ Male":"—"}</span>,
            <div><span style={{fontSize:12}}>{org?.courseName||"—"}</span>{org?.badge&&<span style={{marginLeft:6}}><BadgePill badge={org.badge} small/></span>}</div>,
            <span style={{fontSize:12,color:DIM}}>{e.tournament||"—"}</span>,
            <span style={{fontSize:11,color:DIM}}>{fmtDate(e.date)}</span>,
            <span style={{fontFamily:SANS,fontSize:10,fontWeight:600,color:hr===ri&&hc===8?"#fff":tierClr(e.dist)}}>{tier(e.dist)}</span>,
            <button onClick={ev=>{ev.stopPropagation();onShare(e);}} style={{background:`linear-gradient(135deg,${ORG},#bef264)`,border:"none",color:"#111",borderRadius:0,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,fontWeight:700,letterSpacing:.5,whiteSpace:"nowrap"}}>↗ SHARE</button>,
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

function EntryModal({entry,org,onClose,cvt,unitLbl}){
  return <Overlay onClose={onClose}>
    <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,marginBottom:8,textTransform:"uppercase"}}>Drive Record</div>
    <div style={{fontFamily:DISP,fontSize:32,color:TXT,marginBottom:2,letterSpacing:1}}>{entry.player}</div>
    <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:22}}>{org?.courseName} · {fmtDate(entry.date)}</div>
    <div style={{textAlign:"center",padding:"20px 0",borderTop:`1px solid ${BDR}`,borderBottom:`1px solid ${BDR}`,marginBottom:20,background:"rgba(163,230,53,0.04)",borderRadius:10,margin:"0 -8px 20px"}}>
      <span style={{fontFamily:DISP,fontSize:64,color:tierClr(entry.dist),letterSpacing:1,textShadow:`0 0 40px ${tierClr(entry.dist)}55`}}>{cvt(entry.dist)}</span>
      <span style={{fontFamily:SANS,fontSize:16,color:MUT,marginLeft:6}}>{unitLbl}</span>
      <div style={{fontFamily:SANS,fontSize:12,fontWeight:600,color:tierClr(entry.dist),marginTop:6}}>{tier(entry.dist)}</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
      {[["Club",entry.club],["Handicap",entry.hcp],["Age",entry.age+" yrs"],["Gender",entry.gender==="female"?"♀ Female":"♂ Male"],["Event",entry.tournament||"—"],["Course",org?.courseName||"—"],["Location",org?.location||"—"],["Date",fmtDate(entry.date)]].map(([k,v])=>(
        <div key={k} style={{background:BG3,borderRadius:10,padding:"10px 14px",border:`1px solid ${BDR}`}}>
          <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:MUT,letterSpacing:1.2,marginBottom:3,textTransform:"uppercase"}}>{k}</div>
          <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:TXT}}>{String(v)}</div>
        </div>
      ))}
    </div>
    {entry.photo&&<><div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:MUT,letterSpacing:1.2,marginBottom:8,textTransform:"uppercase"}}>Photo Evidence</div><img src={entry.photo} alt="" style={{width:"100%",borderRadius:10,objectFit:"cover",maxHeight:200,border:`1px solid ${BDR}`}}/></>}
    <div style={{marginTop:18}}>
      <Btn full variant="ghost" onClick={()=>{ onClose(); onShare && onShare(entry); }}>↗ Share This Drive</Btn>
    </div>
  </Overlay>;
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

function AdminPanel({orgs,entries,setOrgs,setEntries,toast,onClose,cvt,unitLbl}){
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
    <button onClick={()=>setSub(id)} style={{display:"flex",alignItems:"center",gap:6,background:sub===id?"rgba(163,230,53,0.12)":"transparent",border:`1px solid ${sub===id?ORG:BDR}`,color:sub===id?ORG:MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 16px",cursor:"pointer",borderRadius:8,transition:"all .15s"}}>
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
        <Tab id="overview" label="Overview"/>
        <Tab id="pending"  label="Approvals" badge={pending.length}/>
        <Tab id="courses"  label="All Courses"/>
        <Tab id="drives"   label="All Drives"/>
        <Tab id="danger"   label="⚠ Danger Zone"/>
      </div>

      {sub==="overview"&&<div>
        {pending.length>0&&<div style={{background:"rgba(240,180,41,0.08)",border:"1px solid rgba(240,180,41,0.25)",borderRadius:12,padding:"16px 20px",marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div><div style={{fontFamily:SANS,fontWeight:700,fontSize:16,color:GOLD}}>⚠ {pending.length} course{pending.length>1?"s":""} awaiting approval</div><div style={{fontFamily:SANS,fontSize:12,color:MUT,marginTop:2}}>Review and approve before they can submit drives</div></div>
          <Btn onClick={()=>setSub("pending")} small>Review</Btn>
        </div>}
        <div style={{fontFamily:SANS,fontWeight:700,fontSize:16,color:TXT,marginBottom:12}}>Recent Drives</div>
        {[...entries].sort((a,b)=>b.id.localeCompare(a.id)).slice(0,8).map(e=>(
          <div key={e.id} onClick={()=>setSelEnt(e)} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:10,marginBottom:6,cursor:"pointer",background:BG3,border:`1px solid ${BDR}`,transition:"background .15s"}}
            onMouseEnter={el=>el.currentTarget.style.background="rgba(163,230,53,0.06)"}
            onMouseLeave={el=>el.currentTarget.style.background=BG3}>
            <div><span style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>{e.player}</span><span style={{fontFamily:SANS,fontSize:11,color:MUT,marginLeft:10}}>{orgFor(e.orgId)?.courseName} · {fmtDate(e.date)}</span></div>
            <span style={{fontFamily:DISP,fontSize:20,color:tierClr(e.dist)}}>{cvt(e.dist)} {unitLbl}</span>
            <Btn onClick={ev=>{ev.stopPropagation();removeEntry(e.id);}} variant="danger" small>Del</Btn>
            <div style={{color:MUT,fontSize:14}}>›</div>
          </div>
        ))}
      </div>}

      {sub==="pending"&&<div>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:1,marginBottom:18}}>Pending Approvals</div>
        {pending.length===0?<Card style={{textAlign:"center",padding:48}}><div style={{fontFamily:SANS,fontSize:14,color:MUT}}>All clear — no pending applications ✓</div></Card>
        :pending.map(org=><Card key={org.id} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
            <div>
              <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5,marginBottom:3}}>{org.courseName}</div>
              <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:10}}>{org.location}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Organiser",org.fullName||org.name||"—"],["Position",org.position||"—"],["Email",org.email]].map(([k,v])=><div key={k}><div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1,textTransform:"uppercase"}}>{k}</div><div style={{fontFamily:SANS,fontSize:12,color:TXT}}>{v}</div></div>)}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
              <Btn onClick={async()=>{setStatus(org.id,"approved");await sendRegistrationNotification(org);const ok=await sendApprovalEmail(org);toast(ok?"Course approved — club notified":"Course approved (approval email failed)");}} variant="approve">Approve &amp; Notify</Btn>
              <Btn onClick={()=>setStatus(org.id,"rejected")} variant="danger" small>✕ Reject</Btn>
            </div>
          </div>
        </Card>)}
      </div>}

      {sub==="courses"&&<div>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:1,marginBottom:18}}>All Courses ({orgs.length})</div>
        {orgs.map(org=><div key={org.id} onClick={()=>setSelOrg(org)}
          style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:12,padding:"13px 18px",borderRadius:10,marginBottom:8,cursor:"pointer",background:BG3,border:`1px solid ${BDR}`,transition:"background .15s"}}
          onMouseEnter={el=>el.currentTarget.style.background="rgba(163,230,53,0.06)"}
          onMouseLeave={el=>el.currentTarget.style.background=BG3}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontFamily:SANS,fontWeight:700,fontSize:15,color:TXT}}>{org.courseName}</span>
            <span style={{fontFamily:SANS,fontSize:11,color:MUT}}>{org.location} · {org.name}</span>
            <Pill label={org.status} color={org.status}/>
            {org.badge&&<BadgePill badge={org.badge} small/>}
          </div>
          <div style={{display:"flex",gap:6}}>
            {org.status==="pending"  &&<Btn onClick={e=>{e.stopPropagation();setStatus(org.id,"approved");}} variant="approve" small>Approve</Btn>}
            {org.status==="approved" &&<Btn onClick={e=>{e.stopPropagation();setStatus(org.id,"disabled");}} variant="danger"  small>Disable</Btn>}
            {(org.status==="rejected"||org.status==="disabled")&&<Btn onClick={e=>{e.stopPropagation();setStatus(org.id,"approved");}} variant="approve" small>Reinstate</Btn>}
            <Btn onClick={e=>{e.stopPropagation();removeOrg(org.id);}} variant="danger" small>Del</Btn>
          </div>
        </div>)}
      </div>}

      {sub==="drives"&&<div>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:1,marginBottom:18}}>All Drives ({entries.length})</div>
        <div style={{overflowX:"auto",borderRadius:12,border:`1px solid ${BDR}`,background:BG2}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead><tr>{["#","Player","Dist","Club","HCP","Age","Course","Date",""].map(h=><th key={h} style={{padding:"9px 13px",fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:1.2,color:DIM,textTransform:"uppercase",textAlign:"left",borderBottom:`2px solid ${BDR}`}}>{h}</th>)}</tr></thead>
            <tbody>{[...entries].sort((a,b)=>b.dist-a.dist).map((e,i)=>(
              <tr key={e.id} onClick={()=>setSelEnt(e)} style={{cursor:"pointer",transition:"background .15s"}}
                onMouseEnter={el=>el.currentTarget.style.background="rgba(163,230,53,0.06)"}
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

    {selOrg&&<Overlay onClose={()=>setSelOrg(null)}>
      <div style={{fontFamily:DISP,fontSize:26,color:TXT,letterSpacing:.5,marginBottom:4}}>{selOrg.courseName}</div>
      <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginBottom:10}}>{selOrg.location}</div>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}><Pill label={selOrg.status} color={selOrg.status}/>{selOrg.badge&&<BadgePill badge={selOrg.badge}/>}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[["Full Name",selOrg.fullName||selOrg.name||"—"],["Position",selOrg.position||"—"],["Email",selOrg.email],["Drives",entries.filter(e=>e.orgId===selOrg.id).length],["Avg Dist",entries.filter(e=>e.orgId===selOrg.id).length?cvt(Math.round(entries.filter(e=>e.orgId===selOrg.id).reduce((s,e)=>s+e.dist,0)/entries.filter(e=>e.orgId===selOrg.id).length))+unitLbl:"—"]].map(([k,v])=>(
          <div key={k} style={{background:BG3,borderRadius:10,padding:"10px 14px",border:`1px solid ${BDR}`}}>
            <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>{k}</div>
            <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:TXT}}>{String(v)}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,color:DIM,letterSpacing:1.2,marginBottom:10,textTransform:"uppercase"}}>Assign Credibility Badge</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.entries(BADGES).map(([key,b])=>(
            <button key={key} onClick={()=>setBadge(selOrg.id,key)} style={{background:selOrg.badge===key?b.bg:"rgba(255,255,255,0.03)",border:`1px solid ${selOrg.badge===key?b.border:BDR}`,color:selOrg.badge===key?b.color:MUT,borderRadius:7,padding:"6px 13px",cursor:"pointer",fontFamily:SANS,fontSize:11,fontWeight:600,transition:"all .15s"}}>{b.icon} {b.label}</button>
          ))}
          <button onClick={()=>setBadge(selOrg.id,null)} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${BDR}`,color:DIM,borderRadius:7,padding:"6px 13px",cursor:"pointer",fontFamily:SANS,fontSize:11}}>✕ Remove</button>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {selOrg.status==="pending"&&<Btn onClick={async()=>{setStatus(selOrg.id,"approved");await sendRegistrationNotification(selOrg);const ok=await sendApprovalEmail(selOrg);toast(ok?"Course approved — club notified":"Course approved (approval email failed)");}} variant="approve">Approve &amp; Notify</Btn>}
        {selOrg.status==="approved" &&<Btn onClick={()=>setStatus(selOrg.id,"disabled")} variant="danger">Disable Account</Btn>}
        {(selOrg.status==="rejected"||selOrg.status==="disabled")&&<Btn onClick={()=>setStatus(selOrg.id,"approved")} variant="approve">Reinstate</Btn>}
        <Btn onClick={()=>removeOrg(selOrg.id)} variant="danger">Delete</Btn>
      </div>
    </Overlay>}

    {selEnt&&<EntryModal entry={selEnt} org={orgFor(selEnt.orgId)} onClose={()=>setSelEnt(null)} cvt={cvt} unitLbl={unitLbl}/>}
  </div>;
}

// ─── DEMO SUBMIT ─────────────────────────────────────────────────────────────

function DemoSubmit({onClose,entries,setEntries,orgs,toast,cvt,unitLbl}){
  const DEMO_ORG_ID = "demo_preview";
  const [form,setForm]=useState({player:"",dist:"",club:"",hcp:"",age:"",photo:"",date:todayStr(),courseName:"",location:""});
  const [submitted,setSubmitted]=useState(null);
  const [consent,setConsent]=useState(false);

  async function doDemo(){
    if(!form.player||!form.dist||!form.club||!form.hcp||!form.age||!form.courseName){ toast("Fill all required fields"); return; }
    if(!consent){ toast("Please confirm player consent before continuing"); return; }
    const entry={id:"demo_"+Date.now(),orgId:DEMO_ORG_ID,player:form.player,dist:Number(form.dist),club:form.club,hcp:Number(form.hcp),age:Number(form.age),photo:form.photo,date:form.date,_demo:true};
    const demoOrg={id:DEMO_ORG_ID,courseName:form.courseName,location:form.location||"Demo Location",status:"approved",badge:null};
    setSubmitted({entry,org:demoOrg});
  }

  if(submitted) return <Overlay onClose={onClose}>
    <div style={{textAlign:"center",padding:"10px 0 20px"}}>
      <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:1,marginBottom:6}}>Looking Good!</div>
      <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:24}}>Here's a preview of how your drive would appear on the global leaderboard.</div>
      <div style={{background:"rgba(163,230,53,0.06)",border:"1px solid rgba(163,230,53,0.2)",borderRadius:12,padding:"20px 24px",textAlign:"left",marginBottom:20}}>
        <div style={{fontFamily:DISP,fontSize:22,color:TXT,letterSpacing:.5}}>{submitted.entry.player}</div>
        <div style={{fontFamily:SANS,fontSize:11,color:MUT,marginBottom:12}}>{submitted.org.courseName} · {fmtDate(submitted.entry.date)}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
          <span style={{fontFamily:DISP,fontSize:52,color:tierClr(submitted.entry.dist),letterSpacing:1}}>{cvt(submitted.entry.dist)}</span>
          <span style={{fontFamily:SANS,fontSize:16,color:MUT}}>{unitLbl}</span>
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
    {form.dist&&Number(form.dist)>0&&<div style={{background:"rgba(163,230,53,0.07)",border:"1px solid rgba(163,230,53,0.2)",borderRadius:8,padding:"9px 14px",marginBottom:14,fontFamily:SANS,fontSize:12,fontWeight:600,color:ORG}}>{tier(Number(form.dist))} — {Number(form.dist)>=350?"Extraordinary! That's world-class.":Number(form.dist)>=300?"Impressive distance!":Number(form.dist)>=250?"Solid drive.":"Good effort!"}</div>}
    <PhotoField label="Photo of Drive Marker (optional)" value={form.photo} onChange={async e=>{ if(e.target.files[0]) setForm({...form,photo:await toB64(e.target.files[0])}); }}/>

    {/* Consent checkbox */}
    <div style={{background:"rgba(163,230,53,0.04)",border:"1px solid rgba(163,230,53,0.2)",padding:"14px",marginBottom:14}}>
      <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}>
        <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}
          style={{width:16,height:16,accentColor:"#a3e635",cursor:"pointer",flexShrink:0,marginTop:2}}/>
        <div style={{fontFamily:SANS,fontSize:11,color:MUT,lineHeight:1.6}}>
          <span style={{fontWeight:700,color:TXT}}>Player Consent Confirmed</span><br/>
          I confirm that the player named above has been notified and has authorised their details to be submitted to the Ripping Bombs leaderboard.
        </div>
      </label>
    </div>

    <Btn full onClick={doDemo} style={{opacity:consent?1:0.5}}>Preview My Drive →</Btn>
  </Overlay>;
}

// ─── CLUBS DIRECTORY PAGE ────────────────────────────────────────────────────

function ClubsDirectory({ orgs, entries }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const approved = orgs
    .filter(o => o.status === "approved")
    .filter(o => !search || o.courseName.toLowerCase().includes(search.toLowerCase()) || (o.location||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.courseName.localeCompare(b.courseName));

  const grouped = approved.reduce((acc, org) => {
    const letter = org.courseName[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(org);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div>
      <div style={{fontFamily:DISP,fontSize:36,color:TXT,letterSpacing:1,marginBottom:6}}>Clubs &amp; Events</div>
      <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:24}}>All registered venues on the Ripping Bombs global database.</div>

      <input
        value={search}
        onChange={e=>setSearch(e.target.value)}
        placeholder="Search clubs or locations..."
        style={{width:"100%",background:BG2,border:`1px solid ${BDR}`,borderRadius:0,padding:"11px 16px",fontFamily:SANS,fontSize:14,color:TXT,outline:"none",marginBottom:28,boxSizing:"border-box"}}
      />

      {letters.map(letter => (
        <div key={letter} style={{marginBottom:28}}>
          <div style={{fontFamily:DISP,fontSize:22,color:ORG,letterSpacing:1,marginBottom:10,borderBottom:`2px solid rgba(163,230,53,0.15)`,paddingBottom:6}}>{letter}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {grouped[letter].map(org => {
              const clubEntries = entries.filter(e=>e.orgId===org.id);
              const best = clubEntries.length ? Math.max(...clubEntries.map(e=>e.dist)) : null;
              return (
                <div key={org.id} onClick={()=>navigate(`/clubs/${toSlug(org.courseName)}`)}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",background:BG2,border:`1px solid ${BDR}`,borderRadius:0,cursor:"pointer",transition:"all .15s",gap:12,flexWrap:"wrap"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=ORG}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=BDR}>
                  <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    <span style={{fontFamily:SANS,fontWeight:700,fontSize:15,color:TXT}}>{org.courseName}{org.country&&countryFlag(org.country)}</span>
                    <span style={{fontFamily:SANS,fontSize:12,color:MUT}}>{org.location}</span>
                    {org.badge&&<BadgePill badge={org.badge} small/>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    {best&&<span style={{fontFamily:DISP,fontSize:18,color:tierClr(best)}}>{best} <span style={{fontFamily:SANS,fontSize:11,color:DIM}}>yds best</span></span>}
                    <span style={{fontFamily:SANS,fontSize:11,color:MUT}}>{clubEntries.length} drive{clubEntries.length!==1?"s":""}</span>
                    <span style={{color:ORG,fontSize:14}}>›</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {approved.length===0&&<div style={{textAlign:"center",padding:"48px 0",fontFamily:SANS,fontSize:14,color:DIM}}>No clubs found</div>}
    </div>
  );
}

// ─── CLUB PAGE ────────────────────────────────────────────────────────────────

function ClubPage({ orgs, entries, cvt, unitLbl }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const org = orgs.find(o => toSlug(o.courseName) === slug);

  useEffect(()=>{ window.scrollTo(0,0); },[slug]);

  if (!org) return (
    <div style={{padding:"80px 0",textAlign:"center"}}>
      <div style={{fontFamily:DISP,fontSize:28,color:TXT,marginBottom:12}}>Club Not Found</div>
      <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:24}}>This club may not be registered or the URL may be incorrect.</div>
      <Btn onClick={()=>navigate("/clubs")}>← Back to Clubs</Btn>
    </div>
  );

  const clubEntries = entries.filter(e=>e.orgId===org.id).sort((a,b)=>b.dist-a.dist);
  const best = clubEntries[0];
  const [week, setWeek] = useState(nowWeek());
  const [allTime, setAllTime] = useState(false);
  const weekEntries = allTime ? clubEntries : clubEntries.filter(e=>sameWeek(e.date,week));

  useEffect(()=>{
    document.title = `${org.courseName} | Ripping Bombs`;
    const desc = document.querySelector('meta[name="description"]');
    if(desc) desc.setAttribute("content", `Longest drive leaderboard for ${org.courseName}, ${org.location}. View all competition results on Ripping Bombs.`);
  },[org]);

  return (
    <div>
      <button onClick={()=>navigate("/clubs")} style={{background:"none",border:"none",color:ORG,fontFamily:SANS,fontWeight:600,fontSize:13,cursor:"pointer",padding:"0 0 18px",display:"flex",alignItems:"center",gap:6}}>
        ← Back to Clubs
      </button>

      {/* Header */}
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:8}}>
          <div>
            <div style={{fontFamily:DISP,fontSize:36,color:TXT,letterSpacing:1,lineHeight:1.1}}>{org.courseName}</div>
            <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginTop:6}}>{org.location}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
          {org.badge&&<BadgePill badge={org.badge}/>}
          <span style={{fontFamily:SANS,fontSize:11,color:MUT,background:BG3,border:`1px solid ${BDR}`,borderRadius:4,padding:"2px 9px"}}>{clubEntries.length} drives recorded</span>
        </div>
      </div>

      {/* Club record hero */}
      {best&&<div style={{background:`linear-gradient(135deg,rgba(163,230,53,0.1),rgba(163,230,53,0.03))`,border:"1px solid rgba(163,230,53,0.22)",borderRadius:14,padding:"20px 24px",marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:2,color:ORG,marginBottom:6,textTransform:"uppercase"}}>🏆 Club Record</div>
          <div style={{fontFamily:DISP,fontSize:26,color:TXT,letterSpacing:.5}}>{best.player}</div>
          <div style={{fontFamily:SANS,fontSize:11,color:MUT,marginTop:3}}>{best.club} · HCP {best.hcp} · {fmtDate(best.date)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:DISP,fontSize:48,color:tierClr(best.dist),letterSpacing:1,lineHeight:1}}>{cvt(best.dist)}</div>
          <div style={{fontFamily:SANS,fontSize:13,color:MUT}}>{unitLbl}</div>
        </div>
      </div>}

      {/* Week nav */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <button onClick={()=>setAllTime(v=>!v)} style={{background:allTime?ORG:"transparent",border:`1px solid ${allTime?ORG:BDR}`,color:allTime?"#fff":MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 14px",borderRadius:8,cursor:"pointer"}}>
          {allTime?"All Time ✓":"All Time"}
        </button>
        {!allTime&&<>
          <button onClick={()=>setWeek(prevWeek(week))} style={{background:"transparent",border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:13,padding:"7px 12px",borderRadius:8,cursor:"pointer"}}>‹</button>
          <span style={{fontFamily:SANS,fontSize:13,color:TXT,fontWeight:600}}>{weekLabel(week)}</span>
          <button onClick={()=>setWeek(nextWeek(week))} style={{background:"transparent",border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:13,padding:"7px 12px",borderRadius:8,cursor:"pointer"}}>›</button>
        </>}
      </div>

      {/* Leaderboard */}
      <div style={{overflowX:"auto",borderRadius:14,border:`1px solid ${BDR}`,background:BG2}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
          <thead>
            <tr>{["Rank","Player","Distance","Club","HCP","Age","Date","Tier"].map(h=>(
              <th key={h} style={{padding:"10px 14px",fontFamily:SANS,fontSize:9,fontWeight:700,letterSpacing:1.2,color:DIM,textTransform:"uppercase",textAlign:"left",borderBottom:`2px solid ${BDR}`}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {weekEntries.map((e,i)=>(
              <tr key={e.id} style={{borderBottom:`1px solid rgba(0,0,0,0.04)`}}>
                <td style={{padding:"11px 14px",fontFamily:SANS,fontSize:12,color:DIM}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</td>
                <td style={{padding:"11px 14px",fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>{e.player}</td>
                <td style={{padding:"11px 14px",fontFamily:DISP,fontSize:20,color:tierClr(e.dist)}}>{cvt(e.dist)} <span style={{fontFamily:SANS,fontSize:10,color:DIM}}>{unitLbl}</span></td>
                <td style={{padding:"11px 14px",fontFamily:SANS,fontSize:12,color:MUT}}>{e.club}</td>
                <td style={{padding:"11px 14px",fontFamily:SANS,fontSize:12,color:MUT}}>{e.hcp}</td>
                <td style={{padding:"11px 14px",fontFamily:SANS,fontSize:12,color:MUT}}>{e.age}</td>
                <td style={{padding:"11px 14px",fontFamily:SANS,fontSize:11,color:DIM}}>{fmtDate(e.date)}</td>
                <td style={{padding:"11px 14px",fontFamily:SANS,fontSize:10,fontWeight:600,color:tierClr(e.dist)}}>{tier(e.dist)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {weekEntries.length===0&&<div style={{padding:"48px 0",textAlign:"center",color:DIM,fontFamily:SANS,fontSize:13}}>No drives for this period</div>}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({ onNav, entries, orgs }) {
  const approvedOrgs = orgs.filter(o => o.status === "approved");
  const totalYards = entries.reduce((s, e) => s + (e.dist || 0), 0);
  const countries = new Set(approvedOrgs.map(o => (o.location || "").split(",").pop().trim())).size;
  const stats = [
    { val: approvedOrgs.length > 0 ? approvedOrgs.length + "+" : "500+", label: "Clubs" },
    { val: totalYards > 0 ? Math.round(totalYards / 1000) + "K" : "48K",  label: "Yards Measured" },
    { val: countries > 0 ? countries + "+" : "50+",                        label: "Countries" },
    { val: entries.length > 0 ? entries.length + "+" : "1200+",            label: "Golfers" },
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
      {/* HERO VIDEO — flush against dark header, no gap */}
      <div style={{ position: "relative", overflow: "hidden", margin: "0 calc(-50vw + 50%)", marginBottom: 0 }}>
        <video
          autoPlay muted loop playsInline
          poster="https://images.pexels.com/videos/33511561/tee-shot-33511561.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200"
          style={{ width: "100%", height: "clamp(520px,60vw,620px)", objectFit: "cover", display: "block", filter: "brightness(0.45)" }}
        >
          <source src="https://videos.pexels.com/video-files/33511561/14252773_2560_1440_60fps.mp4" type="video/mp4"/>
        </video>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(60px,12vw,80px) 20px", textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 4, color: "#a3e635", textTransform: "uppercase", marginBottom: 16, background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.4)", padding: "5px 16px", display: "inline-block" }}>
            The Global Home of Competition Longest Drives
          </div>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(56px, 10vw, 110px)", color: "#ffffff", lineHeight: 0.95, letterSpacing: 3, marginBottom: 20, textShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
            RIPPING<br/>BOMBS
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.85)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
            A free platform where golfers, clubs, coaches, driving ranges, and tournament organisers can register verified longest drives and compare them on global standings.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onNav("register")} style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: "14px 32px", borderRadius: 0, cursor: "pointer", letterSpacing: 0.5 }}>
              REGISTER NOW FREE →
            </button>
            <button onClick={() => onNav("leaderboard")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontFamily: SANS, fontWeight: 600, fontSize: 14, padding: "14px 28px", borderRadius: 0, cursor: "pointer", letterSpacing: 0.5, backdropFilter: "blur(8px)" }}>
              View Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 1, background: BDR, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, margin: "0 0 0" }}>
        {stats.map(({ val, label }) => (
          <div key={label} style={{ background: BG2, padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: DISP, fontSize: 38, color: ORG, letterSpacing: 1, lineHeight: 1 }}>{val}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginTop: 6, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{padding:"0 18px"}}>

      {/* FEATURE CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 60, marginTop: 60 }}>
        {[
          { img: "https://images.pexels.com/photos/10463463/pexels-photo-10463463.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Global Long Drive Standings", body: "Compare verified competition-winning drives with golfers from clubs and tournaments around the world." },
          { img: "https://images.pexels.com/photos/12642295/pexels-photo-12642295.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Free Club & Tournament Registration", body: "Clubs, coaches, driving ranges, and event organisers can submit longest drive winners at no cost during launch." },
          { img: "https://images.pexels.com/photos/6572962/pexels-photo-6572962.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Recognition for Big Hitters", body: "Give golfers a place to showcase huge drives, earn rankings, and represent their club on a global platform." },
        ].map(({ img, title, body }) => (
          <div key={title} style={{ background: BG2, border: `1px solid ${BDR}`, borderRadius: 0, overflow: "hidden" }}>
            <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
              <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s ease" }}
                onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)" }}/>
            </div>
            <div style={{ padding: "20px 22px 24px" }}>
              <div style={{ fontFamily: DISP, fontSize: 21, color: TXT, letterSpacing: 0.5, marginBottom: 8 }}>{title}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.7 }}>{body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA STRIP */}
      <div style={{ background: `rgba(163,230,53,0.05)`, border: `1px solid rgba(163,230,53,0.2)`, borderRadius: 0, padding: "40px 32px", textAlign: "center", marginBottom: 60 }}>
        <div style={{ fontFamily: DISP, fontSize: "clamp(24px,5vw,40px)", color: TXT, letterSpacing: 1, marginBottom: 10 }}>FREE TO JOIN. FREE TO SUBMIT.</div>
        <div style={{ fontFamily: SANS, fontSize: 14, color: MUT, marginBottom: 28 }}>Built for golfers who love sending it.</div>
        <button onClick={() => onNav("register")} style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: "14px 36px", borderRadius: 0, cursor: "pointer" }}>
          REGISTER NOW FREE →
        </button>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 20 }}>FAQ</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map(({ q, a }, i) => (
            <div key={i} style={{ background: BG2, border: `1px solid ${openFaq === i ? "rgba(163,230,53,0.25)" : BDR}`, borderRadius: 0, overflow: "hidden" }}>
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

      {/* EMAIL SIGNUP */}
      <EmailSignup />

      </div>{/* end padding wrapper */}
    </div>
  );
}

// ─── EMAIL SIGNUP ─────────────────────────────────────────────────────────────

function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"

  async function handleSignup() {
    if (!email || !email.includes("@")) { setStatus("invalid"); return; }
    setStatus("sending");
    const ok = await sendEmail(
      `New Weekly Digest Subscriber: ${email}`,
      `A new user has subscribed to the Ripping Bombs weekly digest.\n\nEmail: ${email}\n\nAdd them to your mailing list.`,
      EJS_TEMPLATE_SUBSCRIBE,
      "team@rippingbombs.com"
    );
    setStatus(ok ? "success" : "error");
  }

  return (
    <div style={{ background: "#0e0e0e", margin: "0 -18px", padding: "52px 18px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: "uppercase", marginBottom: 14 }}>
          Weekly Digest
        </div>
        <div style={{ fontFamily: DISP, fontSize: "clamp(24px,5vw,38px)", color: "#fff", letterSpacing: 1, marginBottom: 12, lineHeight: 1.1 }}>
          GET THE WEEK'S BIGGEST HITS IN YOUR INBOX
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 28, lineHeight: 1.7 }}>
          Every week we'll send you the longest verified competition drives from clubs and events around the world. No spam, unsubscribe any time.
        </div>

        {status === "success"
          ? <div style={{ background: "rgba(163,230,53,0.1)", border: `1px solid rgba(163,230,53,0.3)`, padding: "16px 24px", fontFamily: SANS, fontSize: 14, color: ORG, fontWeight: 600 }}>
              ✓ You're in! We'll send you this week's biggest drives.
            </div>
          : <div style={{ display: "flex", gap: 0, maxWidth: 440, margin: "0 auto", flexWrap: "wrap" }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setStatus(null); }}
                onKeyDown={e => e.key === "Enter" && handleSignup()}
                placeholder="Enter your email address"
                style={{ flex: 1, minWidth: 200, background: "#1a1a1a", border: `1px solid ${status === "invalid" ? "#f87171" : "rgba(255,255,255,0.15)"}`, borderRight: "none", padding: "13px 16px", color: "#fff", fontFamily: SANS, fontSize: 14, outline: "none" }}
              />
              <button
                onClick={handleSignup}
                disabled={status === "sending"}
                style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: "13px 24px", cursor: "pointer", letterSpacing: .5, whiteSpace: "nowrap", transition: "opacity .15s", opacity: status === "sending" ? .6 : 1 }}
              >
                {status === "sending" ? "SENDING..." : "SUBSCRIBE →"}
              </button>
            </div>
        }
        {status === "invalid" && <div style={{ fontFamily: SANS, fontSize: 11, color: "#f87171", marginTop: 8 }}>Please enter a valid email address</div>}
        {status === "error" && <div style={{ fontFamily: SANS, fontSize: 11, color: "#f87171", marginTop: 8 }}>Something went wrong — please try again</div>}
        <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 14 }}>
          We respect your privacy. No spam, ever.
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER PAGE ───────────────────────────────────────────────────────────

function RegisterPage({ reg, setReg, doRegister }) {
  return (
    <div style={{maxWidth:540,margin:"0 auto",padding:"28px 18px 80px"}}>
      <div style={{fontFamily:DISP,fontSize:30,color:TXT,letterSpacing:1,marginBottom:6}}>Register Your Course</div>
      <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:28}}>Free to join. Once approved, you can submit your longest drive competition winners to the global leaderboard.</div>
      <Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}><Field label="Your Full Name" value={reg.fullName} onChange={e=>setReg({...reg,fullName:e.target.value})} placeholder="e.g. James Hargreaves" required/></div>
          <div style={{gridColumn:"1/-1"}}><Field label="Your Role / Position" value={reg.position} onChange={e=>setReg({...reg,position:e.target.value})} placeholder="e.g. Club Secretary, Tournament Director, Head Pro" required/></div>
        </div>
        <Field label="Course / Club / Event Name" value={reg.courseName} onChange={e=>setReg({...reg,courseName:e.target.value})} placeholder="Augusta National Golf Club" required/>
        <Field label="Location / City" value={reg.location} onChange={e=>setReg({...reg,location:e.target.value})} placeholder="Augusta, Georgia" required/>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginBottom:5,textTransform:"uppercase",letterSpacing:.8}}>Country <span style={{color:ORG}}>*</span></label>
          <div style={{position:"relative"}}>
            <select value={reg.country} onChange={e=>setReg({...reg,country:e.target.value})}
              style={{width:"100%",background:BG3,border:`1px solid ${BDR}`,padding:"10px 36px 10px 14px",color:reg.country?TXT:DIM,fontFamily:SANS,fontSize:14,outline:"none",appearance:"none",boxSizing:"border-box"}}>
              <option value="">Select country...</option>
              {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:DIM,fontSize:10}}>▾</span>
          </div>
        </div>
        <Field label="Email Address" type="email" value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})} placeholder="you@example.com" required/>
        <Field label="Password" type="password" value={reg.pw} onChange={e=>setReg({...reg,pw:e.target.value})} placeholder="Choose a password" required/>
        <Btn full onClick={doRegister}>Submit Registration →</Btn>
        <div style={{fontFamily:SANS,fontSize:11,color:DIM,marginTop:12,textAlign:"center"}}>Registrations are reviewed within 24 hours</div>
      </Card>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function LoginPage({ lgn, setLgn, doLogin, onNav }) {
  return (
    <div style={{maxWidth:400,margin:"0 auto",padding:"28px 18px 80px"}}>
      <div style={{fontFamily:DISP,fontSize:30,color:TXT,letterSpacing:1,marginBottom:6}}>Organiser Login</div>
      <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:28}}>Log in to submit your longest drive competition results.</div>
      <Card>
        <Field label="Email" type="email" value={lgn.email} onChange={e=>setLgn({...lgn,email:e.target.value})} placeholder="you@example.com" required/>
        <Field label="Password" type="password" value={lgn.pw} onChange={e=>setLgn({...lgn,pw:e.target.value})} placeholder="Your password" required/>
        <Btn full onClick={doLogin}>Log In →</Btn>
        <div style={{fontFamily:SANS,fontSize:11,color:DIM,marginTop:12,textAlign:"center"}}>
          Don't have an account? <span onClick={()=>onNav("register")} style={{color:ORG,cursor:"pointer",fontWeight:600}}>Register here</span>
        </div>
      </Card>
    </div>
  );
}

// ─── SUBMIT PAGE ──────────────────────────────────────────────────────────────

function SubmitPage({ loggedOrg, form, setForm, doSubmit, cvt, unitLbl }) {
  const [consent, setConsent] = useState(false);
  if (!loggedOrg) return null;
  return (
    <div style={{maxWidth:560,margin:"0 auto",padding:"28px 18px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
        <div>
          <div style={{fontFamily:DISP,fontSize:28,color:TXT,letterSpacing:1}}>Submit a Drive</div>
          <div style={{fontFamily:SANS,fontSize:12,color:MUT}}>{loggedOrg.courseName} · {loggedOrg.location}</div>
        </div>
      </div>
      <Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}><Field label="Tournament / Event Name" value={form.tournament} onChange={e=>setForm({...form,tournament:e.target.value})} placeholder="e.g. Club Championship 2026, Monthly Medal"/></div>
          <div style={{gridColumn:"1/-1"}}><Field label="Player Name" value={form.player} onChange={e=>setForm({...form,player:e.target.value})} placeholder="Full name" required/></div>
          <div>
            <label style={{display:"block",fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginBottom:5,textTransform:"uppercase",letterSpacing:.8}}>Gender <span style={{color:ORG}}>*</span></label>
            <div style={{display:"flex",gap:8}}>
              {["male","female"].map(g=>(
                <button key={g} type="button" onClick={()=>setForm({...form,gender:g})}
                  style={{flex:1,padding:"10px",background:form.gender===g?"transparent":BG3,border:`1px solid ${form.gender===g?ORG:BDR}`,color:form.gender===g?ORG:MUT,fontFamily:SANS,fontWeight:600,fontSize:12,cursor:"pointer",textTransform:"capitalize",letterSpacing:.5}}>
                  {g==="male"?"♂ Male":"♀ Female"}
                </button>
              ))}
            </div>
          </div>
          <Field label="Distance (yards)" type="number" value={form.dist} onChange={e=>setForm({...form,dist:e.target.value})} placeholder="245" min="50" max="400" required/>
          <Field label="Date of Drive" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/>
          <div style={{gridColumn:"1/-1"}}><Field label="Club Brand & Model" value={form.club} onChange={e=>setForm({...form,club:e.target.value})} placeholder="TaylorMade Qi10 LS" required/></div>
          <Field label="Handicap" type="number" value={form.hcp} onChange={e=>setForm({...form,hcp:e.target.value})} placeholder="5" min="-10" max="54" required/>
          <Field label="Age" type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="34" min="10" max="100" required/>
        </div>
        {form.dist&&Number(form.dist)>0&&<div style={{background:"rgba(163,230,53,0.07)",border:"1px solid rgba(163,230,53,0.2)",padding:"9px 14px",marginBottom:14,fontFamily:SANS,fontSize:12,fontWeight:600,color:ORG}}>{tier(Number(form.dist))} — {cvt(Number(form.dist))} {unitLbl}</div>}
        <PhotoField label="Photo Evidence (required)" value={form.photo} onChange={async e=>{ if(e.target.files[0]) setForm({...form,photo:await toB64(e.target.files[0])}); }} required/>

        {/* Consent checkbox */}
        <div style={{background:"rgba(163,230,53,0.04)",border:"1px solid rgba(163,230,53,0.2)",padding:"16px",marginBottom:16}}>
          <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
            <div style={{position:"relative",flexShrink:0,marginTop:2}}>
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}
                style={{width:18,height:18,accentColor:"#a3e635",cursor:"pointer"}}/>
            </div>
            <div style={{fontFamily:SANS,fontSize:12,color:MUT,lineHeight:1.6}}>
              <span style={{fontWeight:700,color:TXT}}>Player Consent Confirmed</span><br/>
              I confirm that I have notified the player named above and have their approval to submit their personal details (name, distance, handicap, age and gender) to the Ripping Bombs global leaderboard. This submission is made in accordance with the player's consent and the Ripping Bombs terms of use.
            </div>
          </label>
        </div>

        <Btn full onClick={()=>{ if(!consent){ alert("Please confirm player consent before submitting."); return; } doSubmit(); }} style={{opacity:consent?1:0.5}}>Submit to World Registry →</Btn>
      </Card>
    </div>
  );
}

// ─── NEW CONTENT SEO PAGES ────────────────────────────────────────────────────

function PageGolfLongestDriveCompetition({ onNav }) {
  return (
    <SeoPage title="Golf Longest Drive Competition — How They Work | Ripping Bombs" description="Everything you need to know about golf longest drive competitions. How they work, how to run one, and how to get your club on the global leaderboard.">
      <SeoH1>Golf Longest Drive Competition — How They Work</SeoH1>
      <SeoP>The longest drive competition is one of golf's most popular and accessible side events. Whether it's run on a par-5 during a club day or as a standalone long drive contest, the format is simple: whoever hits the ball furthest wins. Here's everything you need to know.</SeoP>

      <SeoH2>What Is A Longest Drive Competition?</SeoH2>
      <SeoP>A longest drive competition asks players to hit one or more drives from a designated tee box, with the furthest ball that lands in a defined fairway area declared the winner. They're typically run as part of a larger golf event — a club championship, charity day, corporate golf day, or society event — but can also stand alone as a dedicated contest.</SeoP>

      <SeoH2>How To Run A Longest Drive Competition</SeoH2>
      <SeoTable
        headers={["Step", "What To Do"]}
        rows={[
          ["1. Choose a hole", "Pick a straight par-4 or par-5 with a wide fairway and clear landing zone"],
          ["2. Set boundaries", "Mark the fairway edges with cones or rope — drives must land in bounds to count"],
          ["3. Allocate shots", "Give each player 1–3 attempts depending on format and time available"],
          ["4. Mark each drive", "Use a tee peg or marker at the landing spot of each drive"],
          ["5. Measure the winner", "Measure from the tee to the furthest marker in the fairway"],
          ["6. Record the result", "Note the distance, player name, club used and handicap"],
          ["7. Submit to Ripping Bombs", "Register free and submit the result to the global leaderboard"],
        ]}
      />

      <SeoH2>Popular Formats</SeoH2>
      <SeoP>The most common format is a single designated hole during a stroke play round — players hit their tee shot as normal and any player who wants to enter the competition gets an additional attempt. Some events run dedicated long drive stations separate from the main round, allowing multiple attempts in a controlled environment.</SeoP>
      <SeoP>For club championships and society days, a simple one-shot format per player works well. For dedicated long drive events, three shots per competitor with the best counting is the most popular choice.</SeoP>

      <SeoH2>Why Register On Ripping Bombs?</SeoH2>
      <SeoP>Registering your club or event on Ripping Bombs gives your longest drive competition a permanent home on the global leaderboard. Every result you submit appears alongside drives from clubs and tournaments worldwide — giving your players genuine bragging rights and your event lasting exposure beyond the day itself.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

function PageWhatIsGoodDrive({ entries, onNav }) {
  const approved = entries.filter(e => e.dist > 0);
  const avgAll = approved.length ? Math.round(approved.reduce((s,e)=>s+e.dist,0)/approved.length) : 230;
  const avgMale = approved.filter(e=>e.gender==="male").length ? Math.round(approved.filter(e=>e.gender==="male").reduce((s,e)=>s+e.dist,0)/approved.filter(e=>e.gender==="male").length) : 240;
  const avgFemale = approved.filter(e=>e.gender==="female").length ? Math.round(approved.filter(e=>e.gender==="female").reduce((s,e)=>s+e.dist,0)/approved.filter(e=>e.gender==="female").length) : 190;

  return (
    <SeoPage title="What Is A Good Drive In Golf? | Ripping Bombs" description="What counts as a good drive in golf? See real benchmarks by handicap, age and gender from verified competition data on Ripping Bombs.">
      <SeoH1>What Is A Good Drive In Golf?</SeoH1>
      <SeoP>The answer depends entirely on who you are and what standard you play to. A good drive for a beginner looks very different from a good drive for a scratch golfer — and both are completely valid. Here's a realistic breakdown based on verified competition data.</SeoP>

      <SeoH2>Average Competition Drive On Ripping Bombs</SeoH2>
      <SeoTable
        headers={["Category", "Average Competition Drive"]}
        rows={[
          ["All golfers", `${avgAll} yards`],
          ["Male golfers", `${avgMale} yards`],
          ["Female golfers", `${avgFemale} yards`],
          ["PGA Tour average", "295–315 yards"],
          ["LPGA Tour average", "245–265 yards"],
          ["Amateur male average", "195–225 yards"],
          ["Amateur female average", "145–175 yards"],
        ]}
      />

      <SeoH2>What's A Good Drive By Handicap?</SeoH2>
      <SeoTable
        headers={["Handicap", "Good Competition Drive", "Tour Comparison"]}
        rows={[
          ["Scratch & under", "240–267 yards", "Approaching tour amateur level"],
          ["1–5 (low)", "225–250 yards", "Excellent club level distance"],
          ["6–14 (mid)", "200–235 yards", "Good solid distance"],
          ["15–28 (high)", "175–210 yards", "Perfectly respectable"],
          ["28+ (beginner)", "150–185 yards", "Focus on consistency first"],
        ]}
      />

      <SeoH2>Distance Isn't Everything</SeoH2>
      <SeoP>It's worth remembering that driving distance, while exciting, is only one factor in a good golf game. Accuracy, short game, and course management contribute far more to scoring than raw distance. Many golfers who average 200 yards routinely beat players who hit it 50 yards further simply by keeping the ball in play and having a reliable short game.</SeoP>
      <SeoP>That said, more distance does open up the course and make the game more enjoyable — so working on your driving is never wasted effort.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

function PageClubCompetitionIdeas({ onNav }) {
  return (
    <SeoPage title="Golf Club Longest Drive Competition Ideas | Ripping Bombs" description="Fresh ideas for running a golf club longest drive competition. Make your event memorable and get on the global Ripping Bombs leaderboard.">
      <SeoH1>Golf Club Longest Drive Competition Ideas</SeoH1>
      <SeoP>The standard longest drive format is great — but there are plenty of ways to make your club's competition more memorable, more inclusive, and more exciting. Here are some proven formats and fresh ideas worth trying.</SeoP>

      <SeoH2>Classic Formats</SeoH2>
      <SeoTable
        headers={["Format", "How It Works", "Best For"]}
        rows={[
          ["Designated hole", "One hole during normal round — extra shot for LD comp", "Society days, club medals"],
          ["Dedicated station", "Separate LD tee with 3 attempts per player", "Club championships, open days"],
          ["Category winners", "Separate prizes for men, women, seniors, juniors", "Club days, charity events"],
          ["Net longest drive", "Distance adjusted for handicap — levels the field", "Mixed ability events"],
          ["Team longest drive", "Best drive from each team counts", "Corporate golf days"],
        ]}
      />

      <SeoH2>Creative Ideas To Try</SeoH2>
      <SeoP>Run a **seasonal leaderboard** — track longest drives at your club throughout the year and crown an annual champion. Submit each result to Ripping Bombs and the global leaderboard handles the ranking automatically.</SeoP>
      <SeoP>Try a **club record board** — display your all-time longest drives on the clubhouse wall with photos. Ripping Bombs gives every club a permanent page showing their top drives, which you can link to from your club website.</SeoP>
      <SeoP>Consider a **junior vs senior shootout** — pit your best junior hitters against senior members in a head-to-head longest drive challenge. It's always popular and generates great content for social media.</SeoP>
      <SeoP>Add a **sponsor dimension** — longest drives are a natural fit for equipment sponsors (driver manufacturers, ball brands). A Ripping Bombs registered event gives sponsors verified data and global exposure, making it easier to attract commercial support.</SeoP>

      <SeoH2>Get On The Global Leaderboard</SeoH2>
      <SeoP>Every result from your club's longest drive competitions can be submitted to Ripping Bombs — giving your players a chance to compare their drives with golfers from courses worldwide. Registration is completely free.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

function PageLongDriveEquipment({ entries, onNav }) {
  const approved = entries.filter(e=>e.dist>0&&e.club);
  const brands = Object.entries(
    approved.reduce((acc,e)=>{ const b=e.club.split(" ")[0]; acc[b]=(acc[b]||0)+1; return acc; },{})
  ).sort((a,b)=>b[1]-a[1]).slice(0,8);

  return (
    <SeoPage title="Best Golf Equipment For Long Drive | Ripping Bombs" description="What equipment do the biggest hitters use? See the most popular drivers from verified competition longest drive data on Ripping Bombs.">
      <SeoH1>Best Golf Equipment For Long Drive</SeoH1>
      <SeoP>Equipment choice matters for distance — but perhaps not as much as most golfers think. The right driver for maximum distance is the one that's properly fitted to your swing. That said, certain brands and models consistently appear at the top of long drive competition results.</SeoP>

      <SeoH2>Most Popular Drivers In Competition Longest Drives</SeoH2>
      <SeoP>Based on verified competition longest drive results submitted to the Ripping Bombs global database:</SeoP>
      <SeoTable
        headers={["Driver Brand", "Appearances In Top Drives"]}
        rows={brands.map(([brand,count])=>[brand,count])}
      />

      <SeoH2>What To Look For In A Long Drive Driver</SeoH2>
      <SeoTable
        headers={["Feature", "What To Look For", "Why It Matters"]}
        rows={[
          ["Loft", "9–10.5° for most golfers", "Affects launch angle and spin"],
          ["Shaft", "Stiff or X-stiff for fast swingers", "Too flexible adds spin and kills distance"],
          ["Head size", "460cc maximum (rules legal)", "Larger sweet spot for off-centre hits"],
          ["Face technology", "Variable thickness face", "Faster ball speeds across the face"],
          ["Adjustability", "Adjustable hosel and weights", "Fine-tune for your optimal launch conditions"],
        ]}
      />

      <SeoH2>The Ball Matters Too</SeoH2>
      <SeoP>Many golfers focus entirely on the driver and ignore the ball — but a low-compression, low-spin ball can add meaningful distance for slower swing speeds. For faster swingers, a premium urethane ball like the Pro V1 or TP5 offers the best combination of distance and control. Getting ball-fitting is as valuable as driver fitting.</SeoP>

      <SeoH2>Get Fitted Before You Buy</SeoH2>
      <SeoP>The most important piece of equipment advice: get properly fitted before buying any new driver. A well-fitted 3-year-old driver will outperform a brand new one that doesn't suit your swing. Most major brands offer free fitting sessions and the gains from optimised launch conditions can easily exceed 20 yards.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

function PageHandicapDrivingDistance({ entries, onNav }) {
  return (
    <SeoPage title="Golf Handicap And Driving Distance — What's The Link? | Ripping Bombs" description="How does driving distance relate to golf handicap? Explore the data from verified competition longest drives on Ripping Bombs.">
      <SeoH1>Golf Handicap And Driving Distance</SeoH1>
      <SeoP>There's a common assumption that better golfers hit it further — but the relationship between handicap and driving distance is more nuanced than most people think. Distance helps, but it's far from the whole story.</SeoP>

      <SeoH2>Does Driving Distance Affect Handicap?</SeoH2>
      <SeoP>Research consistently shows that driving distance has a moderate positive correlation with handicap — lower handicappers tend to hit it further on average. But the correlation is weaker than most golfers expect. Short game skill, accuracy, and decision-making account for far more of the handicap difference between golfers than driving distance alone.</SeoP>
      <SeoP>On the PGA Tour, data shows that driving distance ranks lower than strokes gained putting, approach play, and around-the-green performance as a predictor of scoring. Distance matters — but it's not the primary factor even at the highest level.</SeoP>

      <SeoH2>High Handicappers Who Hit It Far</SeoH2>
      <SeoP>One of the most interesting patterns in the Ripping Bombs database is the presence of high handicap golfers in the upper distance ranges. A golfer with a 20+ handicap who plays infrequently can still generate impressive clubhead speed and hit long drives — they simply lack the consistency and short game to score well. Distance and scoring are related but separate skills.</SeoP>

      <SeoH2>How To Use Distance To Lower Your Handicap</SeoH2>
      <SeoTable
        headers={["Handicap Range", "Distance Priority", "Better Investment"]}
        rows={[
          ["28+", "Low — focus on making contact first", "Lessons on fundamentals and short game"],
          ["15–28", "Medium — gains will help but aren't primary", "Chipping, putting and course management"],
          ["6–14", "Higher — distance starts to open up courses", "Balanced approach: distance + accuracy"],
          ["0–5", "High — every yard matters at this level", "Speed training, fitting, technique refinement"],
          ["Scratch+", "Very high — marginal gains matter", "Launch monitor fitting, speed protocols"],
        ]}
      />

      <SeoH2>Track Your Club's Distance Data</SeoH2>
      <SeoP>Ripping Bombs captures handicap data alongside every submitted drive, building a genuine database of the relationship between handicap and distance across clubs worldwide. Register free to add your club's results to the global picture.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

// ─── COUNTRY LEADERBOARD PAGES ────────────────────────────────────────────────

function CountryLeaderboardPage({ countryCode, countryName: cName, entries, orgs, cvt, unitLbl, onNav }) {
  const filter = e => {
    const org = orgs.find(o => o.id === e.orgId);
    return org?.country === countryCode;
  };
  return (
    <FilteredLeaderboardPage
      title={`Longest Golf Drives In ${cName} | Ripping Bombs`}
      metaDesc={`See the longest verified competition golf drives in ${cName}. Real results from registered clubs and tournaments on Ripping Bombs.`}
      heading={`Longest Golf Drives In ${cName}`}
      intro={`Verified competition longest drive results from registered clubs and tournament organisers in ${cName}. All entries are official competition results submitted by approved organisations.`}
      filter={filter}
      entries={entries}
      orgs={orgs}
      cvt={cvt}
      unitLbl={unitLbl}
      onNav={onNav}
    />
  );
}

// ─── SEO PAGE WRAPPER ────────────────────────────────────────────────────────

function SeoPage({ title, description, children }) {
  useEffect(() => {
    document.title = title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", description);
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div style={{ padding: "28px 18px 80px", maxWidth: 1000, margin: "0 auto" }}>
      {children}
    </div>
  );
}

function SeoH1({ children }) {
  return <h1 style={{ fontFamily: "'Bebas Neue','Arial Black',sans-serif", fontSize: "clamp(28px,5vw,48px)", color: TXT, letterSpacing: 1, marginBottom: 12, lineHeight: 1.1 }}>{children}</h1>;
}
function SeoH2({ children }) {
  return <h2 style={{ fontFamily: "'Bebas Neue','Arial Black',sans-serif", fontSize: "clamp(20px,3vw,28px)", color: TXT, letterSpacing: 1, margin: "32px 0 12px" }}>{children}</h2>;
}
function SeoP({ children }) {
  return <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 16 }}>{children}</p>;
}
function SeoTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 24 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", background: BG2, border: `1px solid ${BDR}` }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: ORG, textTransform: "uppercase", textAlign: "left", borderBottom: `2px solid ${BDR}`, background: BG3 }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => <tr key={i} style={{ borderBottom: `1px solid ${BDR}` }}>
            {row.map((cell, j) => <td key={j} style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 13, color: j === 0 ? TXT : MUT }}>{cell}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}
function SeoCTA({ onNav }) {
  return (
    <div style={{ background: "rgba(163,230,53,0.05)", border: "1px solid rgba(163,230,53,0.2)", padding: "28px 24px", margin: "32px 0", textAlign: "center" }}>
      <div style={{ fontFamily: "'Bebas Neue','Arial Black',sans-serif", fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 8 }}>TRACK YOUR CLUB'S LONGEST DRIVES</div>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: MUT, marginBottom: 18 }}>Free to join. Register your course and start submitting verified drives to the global leaderboard.</div>
      <button onClick={() => onNav("register")} style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, padding: "12px 28px", cursor: "pointer", letterSpacing: .5 }}>
        REGISTER YOUR CLUB FREE →
      </button>
    </div>
  );
}

// ─── SEO PAGE 1: AVERAGE DRIVER DISTANCE BY HANDICAP ─────────────────────────

function PageAvgDistByHandicap({ entries, onNav }) {
  const approved = entries.filter(e => e.dist > 0);
  const brackets = [
    { label: "Scratch & Under (0 or less)", filter: e => e.hcp <= 0 },
    { label: "Low Handicap (1–5)",           filter: e => e.hcp >= 1  && e.hcp <= 5 },
    { label: "Mid Handicap (6–14)",          filter: e => e.hcp >= 6  && e.hcp <= 14 },
    { label: "High Handicap (15–28)",        filter: e => e.hcp >= 15 && e.hcp <= 28 },
    { label: "Beginner (28+)",               filter: e => e.hcp > 28 },
  ];
  const rows = brackets.map(b => {
    const group = approved.filter(b.filter);
    const avg = group.length ? Math.round(group.reduce((s, e) => s + e.dist, 0) / group.length) : "—";
    const best = group.length ? Math.max(...group.map(e => e.dist)) : "—";
    return [b.label, group.length > 0 ? `${avg} yds` : "—", group.length > 0 ? `${best} yds` : "—", group.length];
  });

  return (
    <SeoPage title="Average Driver Distance By Handicap | Ripping Bombs" description="Find out the average driver distance by handicap. See real data from golfers worldwide on the Ripping Bombs global longest drive database.">
      <SeoH1>Average Driver Distance By Handicap</SeoH1>
      <SeoP>One of the most common questions in golf is: how far should I be hitting it for my handicap? The answer varies hugely depending on age, fitness, swing speed and equipment — but data from real competition results gives us the clearest picture.</SeoP>
      <SeoP>The figures below are drawn from verified competition longest drive results submitted to the Ripping Bombs global database by registered clubs and tournament organisers worldwide.</SeoP>

      <SeoH2>Average & Best Drives By Handicap</SeoH2>
      <SeoTable
        headers={["Handicap Bracket", "Avg Competition Drive", "Best Recorded Drive", "Entries"]}
        rows={rows}
      />

      <SeoH2>What Affects Driving Distance?</SeoH2>
      <SeoP>Handicap is one indicator of skill, but driving distance is influenced by many other factors including swing speed, angle of attack, ball speed, smash factor, launch angle, and spin rate. A high handicapper with a fast swing can easily outdrive a scratch golfer with poor mechanics.</SeoP>
      <SeoP>On the PGA Tour, the average driving distance sits around 295–310 yards. For club golfers, the average is considerably lower — typically between 200–240 yards for recreational players. Competition longest drives, as recorded here, represent the best hits from organised events rather than average shots.</SeoP>

      <SeoH2>How Does Your Drive Compare?</SeoH2>
      <SeoP>If your club runs a longest drive competition, you can register on Ripping Bombs and submit your results to appear on the global leaderboard. Compare your best drive against golfers from courses around the world.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

// ─── SEO PAGE 2: LONGEST DRIVES THIS WEEK ────────────────────────────────────

function PageLongestDrivesThisWeek({ entries, orgs, cvt, unitLbl, onNav }) {
  const approvedOrgs = orgs.filter(o => o.status === "approved");
  const orgFor = id => orgs.find(o => o.id === id);
  const thisWeek = nowWeek();
  const weekEntries = [...entries]
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .filter(e => sameWeek(e.date, thisWeek))
    .sort((a, b) => b.dist - a.dist)
    .slice(0, 20);

  return (
    <SeoPage title="Longest Golf Drives Submitted This Week | Ripping Bombs" description="See the longest golf drives submitted this week from clubs and tournaments worldwide. Updated weekly on the Ripping Bombs global longest drive leaderboard.">
      <SeoH1>Longest Golf Drives This Week</SeoH1>
      <SeoP>Updated every week, this page shows the longest verified competition drives submitted to the Ripping Bombs global database from registered clubs and tournament organisers around the world.</SeoP>
      <SeoP>All entries are verified longest drive winners from official events — not just practice shots. Every distance represents the best drive from a real competition.</SeoP>

      <SeoH2>{weekLabel(thisWeek)}</SeoH2>
      <div style={{ overflowX: "auto", border: `1px solid ${BDR}`, background: BG2, marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
          <thead><tr>{["Rank","Player","Distance","Course","Location","Date"].map(h => <th key={h} style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: ORG, textTransform: "uppercase", textAlign: "left", borderBottom: `2px solid ${BDR}`, background: BG3 }}>{h}</th>)}</tr></thead>
          <tbody>
            {weekEntries.map((e, i) => {
              const org = orgFor(e.orgId);
              return <tr key={e.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 13, color: MUT }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: TXT }}>{e.player}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: ORG }}>{cvt(e.dist)} <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: MUT }}>{unitLbl}</span></td>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 12, color: MUT }}>{org?.courseName || "—"}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 12, color: MUT }}>{org?.location || "—"}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 11, color: DIM }}>{fmtDate(e.date)}</td>
              </tr>;
            })}
            {weekEntries.length === 0 && <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: 13, color: DIM }}>No drives submitted this week yet</td></tr>}
          </tbody>
        </table>
      </div>

      <SeoH2>How Are These Drives Verified?</SeoH2>
      <SeoP>Every drive on Ripping Bombs is submitted by a registered club or tournament organiser. Entries must be the official longest drive winner of an event or designated competition hole, supported by photo evidence, and submitted by the organiser — not self-reported by individual players.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

// ─── SEO PAGE 3: HOW TO HIT A GOLF BALL FARTHER ──────────────────────────────

function PageHowToHitFarther({ entries, onNav }) {
  const approved = entries.filter(e => e.dist > 0);
  const topClubs = Object.entries(
    approved.reduce((acc, e) => { const brand = e.club.split(" ")[0]; acc[brand] = (acc[brand] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <SeoPage title="How To Hit a Golf Ball Farther | Ripping Bombs" description="Practical tips on how to hit a golf ball farther. Learn the techniques used by the biggest hitters in the game, backed by real competition data.">
      <SeoH1>How To Hit A Golf Ball Farther</SeoH1>
      <SeoP>Driving distance is one of the most sought-after improvements in golf. Whether you're a beginner trying to reach the fairway or a single-figure handicapper chasing another 20 yards, the fundamentals are the same. Here's what the data — and the game's biggest hitters — tell us works.</SeoP>

      <SeoH2>1. Increase Your Swing Speed</SeoH2>
      <SeoP>Ball speed is the single biggest driver of distance. Ball speed is roughly 1.5x your swing speed for a well-struck shot. Increasing swing speed through strength training, flexibility work, and speed training protocols (like SuperSpeed Golf) is the most direct path to more distance. Even 5mph more clubhead speed can add 15–20 yards.</SeoP>

      <SeoH2>2. Optimise Your Launch Conditions</SeoH2>
      <SeoP>The ideal launch conditions for maximum distance are a launch angle of 12–15 degrees with spin rates of 2,000–2,500 rpm. Too much spin kills distance — a high-spinning ball balloons and drops short. Getting fitted for the right driver loft and shaft can unlock significant extra yardage without changing your swing at all.</SeoP>

      <SeoH2>3. Hit Up On The Ball</SeoH2>
      <SeoP>Teeing the ball higher and positioning it forward in your stance encourages an upward angle of attack. Hitting up on the driver by even 3–4 degrees can add 20+ yards by reducing spin and increasing launch angle simultaneously. This is one of the most underrated distance gains available to amateur golfers.</SeoP>

      <SeoH2>4. Improve Your Contact</SeoH2>
      <SeoP>Striking the ball on the centre of the clubface — or slightly towards the heel-high area of the face — maximises smash factor. Off-centre hits lose significant ball speed even with a fast swing. Face tape or foot powder spray can help you identify your strike pattern during practice.</SeoP>

      <SeoH2>5. Upgrade Your Equipment</SeoH2>
      <SeoP>Modern drivers are significantly more forgiving and faster than clubs from even 5 years ago. Looking at the biggest hitters in competition data on Ripping Bombs, the most popular driver brands among long hitters are:</SeoP>
      <SeoTable
        headers={["Brand", "Appearances in Top Drives"]}
        rows={topClubs.map(([brand, count]) => [brand, count])}
      />
      <SeoP>That said, a properly fitted older driver will outperform a brand new one that doesn't suit your swing. Always get fitted before buying.</SeoP>

      <SeoH2>6. Flexibility & Rotation</SeoH2>
      <SeoP>A full shoulder turn with a stable lower body creates the tension needed for an explosive downswing. Hip mobility and thoracic spine rotation are key limiting factors for many golfers. Targeted stretching and mobility work — particularly for the hips, thoracic spine and shoulders — can add meaningful yards with no other changes.</SeoP>

      <SeoH2>See How You Compare</SeoH2>
      <SeoP>The Ripping Bombs leaderboard shows verified competition longest drives from clubs and events worldwide. If your club runs a longest drive competition, register free and see how your best hitters compare globally.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

// ─── SEO PAGE 4: AVERAGE GOLF DRIVE DISTANCE ─────────────────────────────────

function PageAvgGolfDrive({ entries, onNav }) {
  const approved = entries.filter(e => e.dist > 0);
  const ageBrackets = [
    { label: "Under 25",  filter: e => e.age < 25 },
    { label: "25–40",     filter: e => e.age >= 25 && e.age < 40 },
    { label: "40–55",     filter: e => e.age >= 40 && e.age < 55 },
    { label: "55+",       filter: e => e.age >= 55 },
  ];
  const ageRows = ageBrackets.map(b => {
    const g = approved.filter(b.filter);
    const avg = g.length ? Math.round(g.reduce((s, e) => s + e.dist, 0) / g.length) : null;
    return [b.label, avg ? `${avg} yds` : "—", g.length];
  });
  const genderRows = ["male","female"].map(gender => {
    const g = approved.filter(e => e.gender === gender);
    const avg = g.length ? Math.round(g.reduce((s, e) => s + e.dist, 0) / g.length) : null;
    return [gender === "male" ? "♂ Male" : "♀ Female", avg ? `${avg} yds` : "—", g.length];
  });

  return (
    <SeoPage title="Average Golf Drive Distance | Ripping Bombs" description="What is the average golf drive distance? See real data broken down by age and gender from verified competition results on Ripping Bombs.">
      <SeoH1>Average Golf Drive Distance</SeoH1>
      <SeoP>The average golf drive distance varies widely depending on age, gender, skill level, and whether we're talking about recreational rounds or competition shots. Here we break it down using verified competition data from the Ripping Bombs global database.</SeoP>
      <SeoP>Note that all figures here represent competition longest drive results — the best single drive from an official event — not average drives per round. These numbers will be higher than a typical golfer's average round distance.</SeoP>

      <SeoH2>Average Competition Drive By Age</SeoH2>
      <SeoTable headers={["Age Group", "Avg Competition Drive", "Entries"]} rows={ageRows}/>

      <SeoH2>Average Competition Drive By Gender</SeoH2>
      <SeoTable headers={["Gender", "Avg Competition Drive", "Entries"]} rows={genderRows}/>

      <SeoH2>How Does This Compare To Tour Averages?</SeoH2>
      <SeoP>On the PGA Tour, the average driving distance is around 295–315 yards. The LPGA Tour average sits around 245–265 yards. For amateur club golfers, studies suggest average driving distances of around 195–220 yards for men and 140–175 yards for women across all ability levels.</SeoP>
      <SeoP>Competition longest drives, as shown here, represent peak performance shots rather than average drives — so they skew higher. A golfer who averages 250 yards might hit a 290-yard bomb in ideal conditions at a longest drive competition.</SeoP>

      <SeoH2>Track Your Club's Longest Drives</SeoH2>
      <SeoP>Ripping Bombs is free for clubs and tournament organisers to join. Register your course and submit your competition longest drive winners to appear on the global leaderboard.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

// ─── SEO PAGE 5: LONGEST GOLF DRIVE EVER ─────────────────────────────────────

function PageLongestDriveEver({ entries, orgs, cvt, unitLbl, onNav }) {
  const approvedOrgs = orgs.filter(o => o.status === "approved");
  const orgFor = id => orgs.find(o => o.id === id);
  const allTimeBest = [...entries]
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .sort((a, b) => b.dist - a.dist)
    .slice(0, 10);

  return (
    <SeoPage title="Longest Golf Drive Ever | World Records | Ripping Bombs" description="What is the longest golf drive ever hit? Explore world records, professional long drive records, and the top verified competition drives on Ripping Bombs.">
      <SeoH1>Longest Golf Drive Ever</SeoH1>
      <SeoP>The longest golf drive ever recorded in competition is a topic that captures the imagination of every golfer who has ever stood on a tee and tried to stripe one. From professional long drive champions to amateur club golfers, the pursuit of distance is universal.</SeoP>

      <SeoH2>The World Long Drive Record</SeoH2>
      <SeoP>The world record for the longest drive in a sanctioned long drive competition is held by Mike Austin, who hit a drive of 515 yards at the US Senior National Open Qualifier in 1974 — a record that stood for decades. In professional long drive competition, drives of 400+ yards are common among the elite, with the longest verified shots in World Long Drive Association events exceeding 480 yards.</SeoP>
      <SeoP>In regular professional golf, the longest measured drive on the PGA Tour is generally accepted to be around 420 yards, aided by significant downhill terrain and altitude. Under normal conditions, PGA Tour professionals average 295–315 yards off the tee.</SeoP>

      <SeoH2>Top 10 Longest Drives On Ripping Bombs</SeoH2>
      <SeoP>The following are the top 10 verified competition longest drives currently registered on the Ripping Bombs global database, submitted by registered clubs and tournament organisers:</SeoP>
      <div style={{ overflowX: "auto", border: `1px solid ${BDR}`, background: BG2, marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead><tr>{["Rank","Player","Distance","Course","Club Used"].map(h => <th key={h} style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: ORG, textTransform: "uppercase", textAlign: "left", borderBottom: `2px solid ${BDR}`, background: BG3 }}>{h}</th>)}</tr></thead>
          <tbody>
            {allTimeBest.map((e, i) => {
              const org = orgFor(e.orgId);
              return <tr key={e.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 13, color: MUT }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontWeight: 700, color: TXT }}>{e.player}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: ORG }}>{cvt(e.dist)} <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: MUT }}>{unitLbl}</span></td>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 12, color: MUT }}>{org?.courseName || "—"}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 12, color: MUT }}>{e.club}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      <SeoH2>What Makes A Drive Go Far?</SeoH2>
      <SeoP>The longest drives in history share common factors: high swing speed (130mph+), an upward angle of attack, optimal launch conditions (low spin, high launch), and ideal weather conditions. Professional long drive competitors train specifically for maximum speed, often swinging at 140–150mph with custom equipment.</SeoP>
      <SeoP>For club golfers, realistic gains come from swing speed training, proper fitting, and technique improvements. Even gaining 10mph of swing speed can add 30+ yards to your drives.</SeoP>

      <SeoH2>Submit Your Club's Longest Drive</SeoH2>
      <SeoP>Is someone at your club hitting bombs? Register on Ripping Bombs and submit your competition results to appear on the global leaderboard. It's completely free for clubs and tournament organisers.</SeoP>
      <SeoCTA onNav={onNav}/>
    </SeoPage>
  );
}

// ─── SEO PAGE 6: HOW TO PROMOTE YOUR GOLF EVENT ──────────────────────────────

function PagePromoteGolfEvent({ onNav }) {
  const [reqForm, setReqForm] = useState({ name:"", email:"", event:"", location:"", date:"" });
  const [reqStatus, setReqStatus] = useState(null);

  async function submitRequest() {
    if (!reqForm.name || !reqForm.email || !reqForm.event) { setReqStatus("invalid"); return; }
    setReqStatus("sending");
    const ok = await sendEmail(
      `Event Registration Request: ${reqForm.event}`,
      `A golfer has requested an event be added to Ripping Bombs:\n\n` +
      `Event: ${reqForm.event}\n` +
      `Location: ${reqForm.location || "—"}\n` +
      `Date: ${reqForm.date || "—"}\n` +
      `Submitted by: ${reqForm.name}\n` +
      `Email: ${reqForm.email}\n\n` +
      `Contact the organiser and invite them to register at https://www.rippingbombs.com`,
      EJS_TEMPLATE_CONTACT
    );
    setReqStatus(ok ? "success" : "error");
  }

  return (
    <SeoPage title="How To Promote Your Golf Event | Ripping Bombs" description="Learn how to promote your golf event and give it global exposure. Ripping Bombs connects golf events with players worldwide through verified longest drive leaderboards.">
      <SeoH1>How To Promote Your Golf Event</SeoH1>
      <SeoP>Running a golf event is one thing — getting the right players to hear about it, and giving participants something to remember and share, is another. Here's how forward-thinking tournament organisers and golf clubs are using Ripping Bombs to give their events a global audience.</SeoP>

      <SeoH2>What Is Ripping Bombs?</SeoH2>
      <SeoP>Ripping Bombs is the global database for verified competition longest drives. Golf clubs, driving ranges, and tournament organisers register free and submit their longest drive competition results — which then appear on a public global leaderboard, searchable by country, handicap, age, and more.</SeoP>
      <SeoP>Every registered event gets its own permanent page on the platform, indexed by Google and discoverable by golfers searching for events, clubs, and distance records worldwide.</SeoP>

      <SeoH2>Why Add Your Event To Ripping Bombs?</SeoH2>
      <SeoTable
        headers={["Benefit", "What It Means For Your Event"]}
        rows={[
          ["Global Leaderboard Exposure", "Your event's longest drive appears on a worldwide leaderboard seen by golfers in 50+ countries"],
          ["Dedicated Event Page", "A permanent URL for your event — shareable on social media, WhatsApp, and email"],
          ["Google Indexed", "Your event page is indexed by Google so players searching for events in your area can find you"],
          ["Player Engagement", "Participants can share their result directly from the leaderboard, extending your event's reach organically"],
          ["Sponsorship Appeal", "A verified, data-rich longest drive leaderboard adds value for distance-related sponsors (drivers, balls, equipment)"],
          ["It's Free", "No cost to register. No cost to submit results. Free for clubs and organisers during launch."],
        ]}
      />

      <SeoH2>How It Works</SeoH2>
      <SeoP>Register your club or event free at Ripping Bombs. Once approved, you'll receive login credentials to submit your longest drive competition results after each event. Results appear on the global leaderboard within minutes and your event page is live permanently.</SeoP>
      <SeoP>Each submission requires the player's name, distance, club used, handicap, age, and a photo of the drive marker or scorecard as verification. This keeps the leaderboard accurate and trustworthy.</SeoP>

      <SeoH2>Upcoming Events</SeoH2>
      <SeoP>Ripping Bombs is currently onboarding clubs and events ahead of the official platform launch in September 2026. As registered events go live, their results will appear on the global leaderboard. If you know of a golf event that should be on Ripping Bombs, use the form below to let us know and we'll reach out to the organisers directly.</SeoP>

      <SeoCTA onNav={onNav}/>

      {/* Request an event form */}
      <div style={{ background: BG2, border: `1px solid ${BDR}`, padding: "32px 28px", marginTop: 8 }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: TXT, letterSpacing: 1, marginBottom: 6 }}>Request An Event</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginBottom: 24 }}>Know of a golf event or club that should be on Ripping Bombs? Tell us about it and we'll contact the organisers directly.</div>

        {reqStatus === "success"
          ? <div style={{ background: "rgba(163,230,53,0.1)", border: `1px solid rgba(163,230,53,0.3)`, padding: 16, fontFamily: SANS, fontSize: 13, color: ORG }}>
              ✓ Request received! We'll reach out to the event organisers.
            </div>
          : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Your Name <span style={{ color: ORG }}>*</span></label>
                <input value={reqForm.name} onChange={e => setReqForm({ ...reqForm, name: e.target.value })} placeholder="Your full name"
                  style={{ width: "100%", background: BG3, border: `1px solid ${BDR}`, padding: "10px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Your Email <span style={{ color: ORG }}>*</span></label>
                <input type="email" value={reqForm.email} onChange={e => setReqForm({ ...reqForm, email: e.target.value })} placeholder="your@email.com"
                  style={{ width: "100%", background: BG3, border: `1px solid ${BDR}`, padding: "10px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Event / Club Name <span style={{ color: ORG }}>*</span></label>
                <input value={reqForm.event} onChange={e => setReqForm({ ...reqForm, event: e.target.value })} placeholder="e.g. Wentworth Charity Classic, Royal Troon Golf Club"
                  style={{ width: "100%", background: BG3, border: `1px solid ${BDR}`, padding: "10px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
              </div>
              <div>
                <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Location</label>
                <input value={reqForm.location} onChange={e => setReqForm({ ...reqForm, location: e.target.value })} placeholder="City, Country"
                  style={{ width: "100%", background: BG3, border: `1px solid ${BDR}`, padding: "10px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
              </div>
              <div>
                <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Event Date</label>
                <input type="date" value={reqForm.date} onChange={e => setReqForm({ ...reqForm, date: e.target.value })}
                  style={{ width: "100%", background: BG3, border: `1px solid ${BDR}`, padding: "10px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
              </div>
              {reqStatus === "invalid" && <div style={{ gridColumn: "1/-1", fontFamily: SANS, fontSize: 11, color: "#f87171" }}>Please fill in all required fields</div>}
              {reqStatus === "error" && <div style={{ gridColumn: "1/-1", fontFamily: SANS, fontSize: 11, color: "#f87171" }}>Something went wrong — please try again</div>}
              <div style={{ gridColumn: "1/-1" }}>
                <button onClick={submitRequest} disabled={reqStatus === "sending"}
                  style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: "11px 28px", cursor: "pointer", letterSpacing: .5, opacity: reqStatus === "sending" ? .6 : 1 }}>
                  {reqStatus === "sending" ? "SENDING..." : "SUBMIT REQUEST →"}
                </button>
              </div>
            </div>
        }
      </div>
    </SeoPage>
  );
}

// ─── FILTERED LEADERBOARD PAGE ───────────────────────────────────────────────

function FilteredLeaderboardPage({ title, metaDesc, heading, intro, filter, entries, orgs, cvt, unitLbl, onNav }) {
  useEffect(() => {
    document.title = `${title} | Ripping Bombs`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", metaDesc);
    window.scrollTo(0, 0);
  }, [title]);

  const approvedOrgs = orgs.filter(o => o.status === "approved");
  const orgFor = id => orgs.find(o => o.id === id);
  const filtered = [...entries]
    .filter(e => approvedOrgs.find(o => o.id === e.orgId))
    .filter(filter)
    .sort((a, b) => b.dist - a.dist);

  return (
    <div style={{ padding: "28px 18px 80px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: "uppercase", marginBottom: 10 }}>Global Leaderboard</div>
      <h1 style={{ fontFamily: DISP, fontSize: "clamp(28px,5vw,48px)", color: TXT, letterSpacing: 1, marginBottom: 12, lineHeight: 1.1 }}>{heading}</h1>
      <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 28, maxWidth: 640 }}>{intro}</p>

      {/* Top 3 podium */}
      {filtered.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 28 }}>
        {filtered.slice(0, 3).map((e, i) => {
          const org = orgFor(e.orgId);
          const medals = ["🥇","🥈","🥉"];
          return (
            <div key={e.id} style={{ background: BG2, border: `1px solid ${i === 0 ? "rgba(163,230,53,0.3)" : BDR}`, padding: "20px 20px 18px", position: "relative" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{medals[i]}</div>
              <div style={{ fontFamily: DISP, fontSize: 40, color: ORG, letterSpacing: 1, lineHeight: 1 }}>{cvt(e.dist)}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: DIM, marginBottom: 6 }}>{unitLbl}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: TXT }}>{e.player}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, marginTop: 3 }}>{org?.courseName}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 2 }}>{e.club} · HCP {e.hcp}</div>
            </div>
          );
        })}
      </div>}

      {/* Full table */}
      <div style={{ overflowX: "auto", border: `1px solid ${BDR}`, background: BG2, marginBottom: 32 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
          <thead>
            <tr>{["Rank","Player","Distance","Club Used","HCP","Age","Course","Date"].map(h => (
              <th key={h} style={{ padding: "10px 14px", fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: ORG, textTransform: "uppercase", textAlign: "left", borderBottom: `2px solid ${BDR}`, background: BG3 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => {
              const org = orgFor(e.orgId);
              return (
                <tr key={e.id} style={{ borderBottom: `1px solid ${BDR}` }}>
                  <td style={{ padding: "10px 14px", fontFamily: SANS, fontSize: 12, color: DIM }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</td>
                  <td style={{ padding: "10px 14px", fontFamily: SANS, fontWeight: 700, fontSize: 14, color: TXT }}>{e.player}{org?.country&&countryFlag(org.country)}</td>
                  <td style={{ padding: "10px 14px", fontFamily: DISP, fontSize: 20, color: ORG }}>{cvt(e.dist)} <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>{unitLbl}</span></td>
                  <td style={{ padding: "10px 14px", fontFamily: SANS, fontSize: 12, color: MUT }}>{e.club}</td>
                  <td style={{ padding: "10px 14px", fontFamily: SANS, fontSize: 12, color: MUT }}>{e.hcp}</td>
                  <td style={{ padding: "10px 14px", fontFamily: SANS, fontSize: 12, color: MUT }}>{e.age}</td>
                  <td style={{ padding: "10px 14px", fontFamily: SANS, fontSize: 12, color: MUT }}>{org?.courseName || "—"}</td>
                  <td style={{ padding: "10px 14px", fontFamily: SANS, fontSize: 11, color: DIM }}>{fmtDate(e.date)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "48px 0", textAlign: "center", fontFamily: SANS, fontSize: 13, color: DIM }}>No entries yet in this category</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div style={{ background: "#0e0e0e", border: `1px solid rgba(163,230,53,0.2)`, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: DISP, fontSize: 24, color: "#fff", letterSpacing: 1, marginBottom: 8 }}>DOES YOUR CLUB HAVE A BIG HITTER?</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 18 }}>Register free and submit your competition longest drive results to the global leaderboard.</div>
        <button onClick={() => onNav("register")} style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: "12px 28px", cursor: "pointer", letterSpacing: .5 }}>
          REGISTER YOUR CLUB FREE →
        </button>
      </div>
    </div>
  );
}

// ─── DRIVE PAGE ──────────────────────────────────────────────────────────────

function DrivePage({ entries, orgs, cvt, unitLbl, onNav }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = entries.find(e => e.id === id);
  const org = orgs.find(o => o.id === entry?.orgId);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (entry) {
      document.title = `${entry.player} — ${cvt(entry.dist)} ${unitLbl} | Ripping Bombs`;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", `${entry.player} hit ${cvt(entry.dist)} ${unitLbl} at ${org?.courseName||"a course"} on ${fmtDate(entry.date)}. Verified competition drive on Ripping Bombs.`);
    }
    window.scrollTo(0, 0);
  }, [entry]);

  if (!entry) return (
    <div style={{padding:"80px 18px",textAlign:"center",maxWidth:600,margin:"0 auto"}}>
      <div style={{fontFamily:DISP,fontSize:32,color:TXT,letterSpacing:1,marginBottom:12}}>Drive Not Found</div>
      <div style={{fontFamily:SANS,fontSize:14,color:MUT,marginBottom:24}}>This drive may have been removed or the link may be incorrect.</div>
      <button onClick={()=>navigate("/")} style={{background:"transparent",border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:"11px 24px",cursor:"pointer",letterSpacing:.5}}>
        ← Back to Leaderboard
      </button>
    </div>
  );

  return (
    <div style={{padding:"28px 18px 80px",maxWidth:680,margin:"0 auto"}}>
      <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",color:ORG,fontFamily:SANS,fontWeight:600,fontSize:13,cursor:"pointer",padding:"0 0 22px",display:"flex",alignItems:"center",gap:6}}>
        ← Back
      </button>

      {/* Hero card */}
      <div style={{background:BG2,border:`1px solid rgba(163,230,53,0.25)`,padding:"32px 28px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,width:200,height:200,background:"rgba(163,230,53,0.03)",borderRadius:"0 0 0 200px"}}/>
        <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:"uppercase",marginBottom:12}}>
          Verified Competition Drive
        </div>
        <div style={{fontFamily:DISP,fontSize:"clamp(28px,6vw,42px)",color:TXT,letterSpacing:.5,lineHeight:1.1,marginBottom:6}}>
          {entry.player}
          {org?.country&&countryFlag(org.country)}
        </div>
        <div style={{fontFamily:SANS,fontSize:13,color:MUT,marginBottom:24}}>
          {org?.courseName}{entry.tournament?` · ${entry.tournament}`:""} · {fmtDate(entry.date)}
        </div>

        {/* Big distance */}
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
          <span style={{fontFamily:DISP,fontSize:"clamp(64px,12vw,96px)",color:ORG,letterSpacing:2,lineHeight:1}}>{cvt(entry.dist)}</span>
          <span style={{fontFamily:SANS,fontSize:18,color:MUT}}>{unitLbl}</span>
        </div>
        <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:ORG,marginBottom:24}}>{tier(entry.dist)}</div>

        {/* Stats grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}}>
          {[
            ["Club", entry.club],
            ["Handicap", entry.hcp],
            ["Age", `${entry.age} yrs`],
            ["Gender", entry.gender==="female"?"♀ Female":"♂ Male"],
            ["Course", org?.courseName||"—"],
            ["Location", org?.location||"—"],
          ].map(([k,v])=>(
            <div key={k} style={{background:BG3,padding:"10px 14px"}}>
              <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1.2,marginBottom:3,textTransform:"uppercase"}}>{k}</div>
              <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:TXT}}>{String(v)}</div>
            </div>
          ))}
        </div>

        {/* Badge */}
        {org?.badge&&<div style={{marginBottom:16}}><BadgePill badge={org.badge}/></div>}

        {/* Photo */}
        {entry.photo&&<img src={entry.photo} alt="Drive evidence" style={{width:"100%",maxHeight:240,objectFit:"cover",marginBottom:16}}/>}

        {/* Share button */}
        <button onClick={()=>setShareOpen(true)}
          style={{background:`linear-gradient(135deg,${ORG},#bef264)`,border:"none",color:"#111",fontFamily:SANS,fontWeight:700,fontSize:13,padding:"14px 24px",cursor:"pointer",letterSpacing:.5,width:"100%"}}>
          ↗ SHARE THIS DRIVE
        </button>
        {shareOpen&&<ShareModal entry={entry} org={org} cvt={cvt} unitLbl={unitLbl} onClose={()=>setShareOpen(false)}/>}
      </div>

      {/* Club link */}
      {org&&<div style={{background:BG2,border:`1px solid ${BDR}`,padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}
        onClick={()=>navigate(`/clubs/${toSlug(org.courseName)}`)}>
        <div>
          <div style={{fontFamily:SANS,fontWeight:700,fontSize:14,color:TXT}}>{org.courseName}</div>
          <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginTop:2}}>{org.location} — View all drives from this club</div>
        </div>
        <span style={{color:ORG,fontSize:18}}>›</span>
      </div>}

      {/* CTA */}
      <div style={{background:"#0e0e0e",border:`1px solid rgba(163,230,53,0.2)`,padding:"24px 20px",textAlign:"center"}}>
        <div style={{fontFamily:DISP,fontSize:22,color:"#fff",letterSpacing:1,marginBottom:8}}>GOT A BIG HITTER AT YOUR CLUB?</div>
        <div style={{fontFamily:SANS,fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:16}}>Register free and submit your competition results to the global leaderboard.</div>
        <button onClick={()=>onNav("register")} style={{background:"transparent",border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:"11px 24px",cursor:"pointer",letterSpacing:.5}}>
          REGISTER YOUR CLUB FREE →
        </button>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────

function ContactPage({ onNav }) {
  const [form, setForm] = useState({ name: "", email: "", type: "general", message: "" });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    document.title = "Contact Us | Ripping Bombs";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Get in touch with the Ripping Bombs team. Contact us for general enquiries, partnerships, sponsorships or press.");
    window.scrollTo(0, 0);
  }, []);

  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) { setStatus("invalid"); return; }
    setStatus("sending");
    const typeLabel = { general: "General Enquiry", partnership: "Partnership / Sponsorship", press: "Press Enquiry", club: "Club Registration Query" }[form.type] || "Enquiry";
    const ok = await sendEmail(
      `${typeLabel}: ${form.name}`,
      `Type: ${typeLabel}\nName: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
      EJS_TEMPLATE_CONTACT
    );
    setStatus(ok ? "success" : "error");
    if (ok) setForm({ name: "", email: "", type: "general", message: "" });
  }

  const inp = (val, onChange, placeholder, type = "text") => (
    <input type={type} value={val} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", background: BG2, border: `1px solid ${BDR}`, padding: "11px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", boxSizing: "border-box" }}
      onFocus={e => e.target.style.borderColor = ORG} onBlur={e => e.target.style.borderColor = BDR}/>
  );

  return (
    <div style={{ padding: "28px 18px 80px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: ORG, textTransform: "uppercase", marginBottom: 10 }}>Get In Touch</div>
      <h1 style={{ fontFamily: DISP, fontSize: "clamp(28px,5vw,48px)", color: TXT, letterSpacing: 1, marginBottom: 12, lineHeight: 1.1 }}>Contact Ripping Bombs</h1>
      <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, lineHeight: 1.85, marginBottom: 40, maxWidth: 580 }}>
        Whether you're a golf club looking to register, a brand interested in partnership opportunities, or a journalist covering the launch — we'd love to hear from you.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>

        {/* Left — form */}
        <div>
          <div style={{ fontFamily: DISP, fontSize: 22, color: TXT, letterSpacing: 1, marginBottom: 20 }}>SEND A MESSAGE</div>

          {status === "success"
            ? <div style={{ background: "rgba(163,230,53,0.1)", border: `1px solid rgba(163,230,53,0.3)`, padding: "20px 24px", fontFamily: SANS, fontSize: 14, color: ORG, fontWeight: 600 }}>
                ✓ Message sent! We'll be in touch shortly.
              </div>
            : <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Enquiry Type</label>
                  <div style={{ position: "relative" }}>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                      style={{ width: "100%", background: BG2, border: `1px solid ${BDR}`, padding: "11px 36px 11px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", appearance: "none", boxSizing: "border-box" }}>
                      <option value="general">General Enquiry</option>
                      <option value="partnership">Partnership / Sponsorship</option>
                      <option value="press">Press Enquiry</option>
                      <option value="club">Club Registration Query</option>
                    </select>
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: DIM, fontSize: 10 }}>▾</span>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Your Name <span style={{ color: ORG }}>*</span></label>
                  {inp(form.name, e => setForm({ ...form, name: e.target.value }), "Full name")}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Email Address <span style={{ color: ORG }}>*</span></label>
                  {inp(form.email, e => setForm({ ...form, email: e.target.value }), "your@email.com", "email")}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 600, color: MUT, marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>Message <span style={{ color: ORG }}>*</span></label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Your message..." rows={5}
                    style={{ width: "100%", background: BG2, border: `1px solid ${BDR}`, padding: "11px 14px", color: TXT, fontFamily: SANS, fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = ORG} onBlur={e => e.target.style.borderColor = BDR}/>
                </div>

                {status === "invalid" && <div style={{ fontFamily: SANS, fontSize: 11, color: "#f87171", marginBottom: 10 }}>Please fill in all required fields</div>}
                {status === "error" && <div style={{ fontFamily: SANS, fontSize: 11, color: "#f87171", marginBottom: 10 }}>Something went wrong — please email team@rippingbombs.com directly</div>}

                <button onClick={handleSubmit} disabled={status === "sending"}
                  style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: "13px 32px", cursor: "pointer", letterSpacing: .5, opacity: status === "sending" ? .6 : 1 }}>
                  {status === "sending" ? "SENDING..." : "SEND MESSAGE →"}
                </button>
              </>
          }
        </div>

        {/* Right — info + map */}
        <div>
          <div style={{ fontFamily: DISP, fontSize: 22, color: TXT, letterSpacing: 1, marginBottom: 20 }}>OUR DETAILS</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Email", value: "team@rippingbombs.com", href: "mailto:team@rippingbombs.com" },
              { label: "Instagram", value: "@rippingbombs", href: "https://www.instagram.com/rippingbombs/" },
              { label: "Facebook", value: "Ripping Bombs", href: "https://www.facebook.com/rippingbombs/" },
              { label: "Head Office", value: "Munich, Bavaria, Germany" },
            ].map(({ label, value, href }) => (
              <div key={label} style={{ borderBottom: `1px solid ${BDR}`, paddingBottom: 14 }}>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: DIM, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                {href
                  ? <a href={href} target="_blank" rel="noreferrer" style={{ fontFamily: SANS, fontSize: 14, color: ORG, textDecoration: "none" }}>{value}</a>
                  : <div style={{ fontFamily: SANS, fontSize: 14, color: TXT }}>{value}</div>
                }
              </div>
            ))}
          </div>

          {/* Register CTA */}
          <div style={{ background: "#0e0e0e", border: `1px solid rgba(163,230,53,0.2)`, padding: "20px", marginBottom: 24 }}>
            <div style={{ fontFamily: DISP, fontSize: 18, color: "#fff", letterSpacing: 1, marginBottom: 6 }}>REGISTER YOUR CLUB</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Free to join. Start submitting your competition results to the global leaderboard.</div>
            <button onClick={() => onNav("register")} style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: "10px 20px", cursor: "pointer", letterSpacing: .5 }}>
              REGISTER FREE →
            </button>
          </div>
        </div>
      </div>

      {/* Full width map */}
      <div style={{ border: `1px solid ${BDR}`, overflow: "hidden", height: 340, marginTop: 8 }}>
        <iframe
          title="Ripping Bombs HQ Munich"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d85464.29936539!2d11.4907!3d48.1351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479e75f9a38c5fd9%3A0x10cb84a150bedc!2sMunich%2C%20Germany!5e0!3m2!1sen!2sde!4v1234567890"
          width="100%" height="340" style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
          allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div style={{ fontFamily: SANS, fontSize: 11, color: DIM, marginTop: 6 }}>Munich, Bavaria, Germany — European HQ</div>
    </div>
  );
}

// ─── LAUNCH MODAL ─────────────────────────────────────────────────────────────

function LaunchModal({ onClose, onNav }) {
  const LAUNCH = new Date("2026-09-01T00:00:00");
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    function calc() {
      const diff = LAUNCH - new Date();
      if (diff <= 0) { setTimeLeft({ d:0,h:0,m:0,s:0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2,"0");

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#1a1a1a",border:`1px solid rgba(163,230,53,0.25)`,width:"100%",maxWidth:560,padding:"40px 36px",position:"relative",boxShadow:"0 0 80px rgba(163,230,53,0.08)"}}>
        
        {/* Close */}
        <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"none",border:"none",color:MUT,fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>

        {/* Launching label */}
        <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:"uppercase",marginBottom:16}}>
          Official Platform Launch
        </div>

        {/* Headline */}
        <div style={{fontFamily:"'Bebas Neue','Arial Black',sans-serif",fontSize:"clamp(32px,7vw,52px)",color:"#fff",letterSpacing:2,lineHeight:1,marginBottom:28}}>
          LAUNCHING<br/>SEPTEMBER 2026
        </div>

        {/* Countdown */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:28}}>
          {[["DAYS",timeLeft.d],["HRS",timeLeft.h],["MIN",timeLeft.m],["SEC",timeLeft.s]].map(([label,val])=>(
            <div key={label} style={{background:"#242424",border:`1px solid rgba(163,230,53,0.15)`,padding:"16px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue','Arial Black',sans-serif",fontSize:36,color:ORG,letterSpacing:2,lineHeight:1}}>{pad(val??0)}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:700,letterSpacing:2,color:MUT,marginTop:5,textTransform:"uppercase"}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Body text */}
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.8,marginBottom:24}}>
          Ripping Bombs is currently onboarding participating courses, clubs and launch events worldwide ahead of the official platform launch. Global rankings will be built through verified real-world competition results once events begin going live.
        </p>

        {/* Buttons */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>{onClose();onNav("register");}} style={{background:"transparent",border:`1px solid ${ORG}`,color:ORG,fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,padding:"13px 24px",cursor:"pointer",letterSpacing:.5,transition:"opacity .15s"}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            REGISTER YOUR CLUB →
          </button>
          <button onClick={()=>{onClose();document.querySelector("footer")?.scrollIntoView({behavior:"smooth"});}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:13,padding:"13px 24px",cursor:"pointer",letterSpacing:.5,transition:"opacity .15s"}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            CONTACT / PARTNERSHIPS →
          </button>
        </div>

        <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:DIM,marginTop:16,textAlign:"center"}}>
          Commercial partnerships, launch sponsorships and prize collaboration opportunities are now open.
        </div>
      </div>
    </div>
  );
}

function SiteFooter({ onNav }) {
  const [enquiry, setEnquiry] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  async function sendEnquiry() {
    if (!enquiry.name || !enquiry.email || !enquiry.message) return;
    const subject = `Ripping Bombs Enquiry from ${enquiry.name}`;
    const message = `Name: ${enquiry.name}\nEmail: ${enquiry.email}\n\nMessage:\n${enquiry.message}`;
    const ok = await sendEmail(subject, message, EJS_TEMPLATE_CONTACT);
    setSent(ok ? "success" : "error");
    if (ok) setEnquiry({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  }

  const inp = (val, onChange, placeholder, type="text", multiline=false) => {
    const base = {
      width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:8, padding:"9px 12px", color:"#fff", fontFamily:SANS, fontSize:13,
      outline:"none", boxSizing:"border-box", resize:"none",
      transition:"border-color .2s"
    };
    return multiline
      ? <textarea value={val} onChange={onChange} placeholder={placeholder} rows={3}
          style={base}
          onFocus={e=>e.target.style.borderColor=ORG} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}/>
      : <input type={type} value={val} onChange={onChange} placeholder={placeholder}
          style={base}
          onFocus={e=>e.target.style.borderColor=ORG} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}/>;
  };

  return (
    <footer style={{ background: "#0e0e0e", borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 60 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "52px 18px 32px" }}>

        {/* 4-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 36, marginBottom: 40 }}>

          {/* Col 1 — Brand + main nav */}
          <div>
            <RB_LOGO_SVG_WHITE />
            <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 14, marginBottom: 20, lineHeight: 1.7 }}>
              The global home of competition longest drives. Free to join, free to submit.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Leaderboard", "leaderboard"],
                ["Clubs & Events Directory", "clubs"],
                ["Register Your Course", "register"],
                ["Organiser Login", "login"],
                ["Contact Us", "contact"],
              ].map(([label, id]) => (
                <span key={id} onClick={() => onNav(id)} style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "color .15s" }}
                  onMouseEnter={e=>e.target.style.color=ORG} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.55)"}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2 — Leaderboards */}
          <div>
            <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1.5,color:DIM,marginBottom:12,textTransform:"uppercase"}}>Leaderboards</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {[
                ["Global Leaderboard",              "/leaderboard"],
                ["Longest Men's Drives",            "/longest-mens-drive"],
                ["Longest Women's Drives",          "/longest-womens-drive"],
                ["Low Handicap",                    "/longest-drive-low-handicap"],
                ["Mid Handicap",                    "/longest-drive-mid-handicap"],
                ["High Handicap",                   "/longest-drive-high-handicap"],
                ["Seniors (55+)",                   "/longest-drive-seniors"],
                ["Juniors (U12)",                   "/longest-drive-juniors-u12"],
                ["Youth (13–16)",                   "/longest-drive-juniors-13-16"],
                ["Cadets (17–18)",                  "/longest-drive-juniors-17-18"],
              ].map(([label,path])=>(
                <a key={path} href={path} style={{display:"block",fontFamily:SANS,fontSize:11,color:"rgba(255,255,255,0.4)",textDecoration:"none",transition:"color .15s"}}
                  onMouseEnter={e=>e.target.style.color=ORG} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3 — Golf Guides + Instagram */}
          <div>
            <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1.5,color:DIM,marginBottom:12,textTransform:"uppercase"}}>Golf Guides</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:24}}>
              {[
                ["Avg Distance By Handicap",              "/average-driver-distance-by-handicap"],
                ["Longest Drives This Week",               "/longest-drives-this-week"],
                ["How To Hit Farther",                     "/how-to-hit-a-golf-ball-farther"],
                ["Average Golf Drive Distance",            "/average-golf-drive-distance"],
                ["Longest Golf Drive Ever",                "/longest-golf-drive-ever"],
                ["What Is A Good Drive In Golf?",          "/what-is-a-good-drive-in-golf"],
                ["Golf Longest Drive Competition",         "/golf-longest-drive-competition"],
                ["Club Competition Ideas",                 "/golf-club-longest-drive-competition-ideas"],
                ["Long Drive Equipment",                   "/long-drive-golf-equipment"],
                ["Handicap & Driving Distance",            "/golf-handicap-driving-distance"],
                ["Promote Your Golf Event",                "/how-to-promote-your-golf-event"],
              ].map(([label, path]) => (
                <a key={path} href={path} style={{display:"block",fontFamily:SANS,fontSize:11,color:"rgba(255,255,255,0.4)",textDecoration:"none",transition:"color .15s"}}
                  onMouseEnter={e=>e.target.style.color=ORG} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>
                  {label}
                </a>
              ))}
            </div>
            <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:1.5,color:DIM,marginBottom:10,textTransform:"uppercase"}}>Follow Us</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <a href="https://www.instagram.com/rippingbombs/" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", padding: "9px 14px", textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: "#fff" }}>Instagram</span>
            </a>
            <a href="https://www.facebook.com/rippingbombs/" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1877F2", padding: "9px 14px", textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: "#fff" }}>Facebook</span>
            </a>
            </div>
          </div>

          {/* Col 4 — Enquiry form */}
          <div>
            <div style={{ fontFamily: DISP, fontSize: 18, color: "#fff", letterSpacing: 1, marginBottom: 14 }}>GET IN TOUCH</div>
            {sent==="success"
              ? <div style={{ background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.3)", padding: "16px", fontFamily: SANS, fontSize: 13, color: GRN }}>
                  ✓ Message sent successfully!
                </div>
              : sent==="error"
              ? <div style={{ background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", padding: "16px", fontFamily: SANS, fontSize: 13, color: "#f87171" }}>
                  ✕ Failed to send — please try again or email team@rippingbombs.com
                </div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {inp(enquiry.name, e=>setEnquiry({...enquiry,name:e.target.value}), "Your name")}
                  {inp(enquiry.email, e=>setEnquiry({...enquiry,email:e.target.value}), "Your email", "email")}
                  {inp(enquiry.message, e=>setEnquiry({...enquiry,message:e.target.value}), "Your message...", "text", true)}
                  <button onClick={sendEnquiry}
                    style={{ background: "transparent", border: `1px solid ${ORG}`, color: ORG, fontFamily: SANS, fontWeight: 700, fontSize: 12, padding: "10px 20px", borderRadius: 0, cursor: "pointer", letterSpacing: .5, marginTop: 2 }}>
                    Send Enquiry →
                  </button>
                </div>
            }
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            Copyright © 2026 rippingbombs.com · Powered by the HRH Collective LTD
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            The global home of competition longest drives
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App(){
  const navigate = useNavigate();
  const [orgs,    setOrgs]    = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("home");
  const [toastMsg,setToastMsg]= useState(null);
  const [detEnt,  setDetEnt]  = useState(null);
  const [shareEnt, setShareEnt] = useState(null);
  const [showAdmin,setShowAdmin]=useState(()=>localStorage.getItem("rb_admin_auth")==="1");
  const [adminPw, setAdminPw] = useState({show:false,val:""});
  const [loggedOrg,setLoggedOrg]=useState(null);
  const [showDemo,setShowDemo]= useState(false);
  const [menuOpen,setMenuOpen]= useState(false);
  const [showLaunch,setShowLaunch] = useState(()=>!sessionStorage.getItem("rb_launch_seen"));

  // ── UNIT STATE ──────────────────────────────────────────────────────────────
  const [unit, setUnit] = useState("yds"); // "yds" | "m"
  const cvt    = d => unit === "m" ? Math.round(d * 0.9144) : d;
  const unitLbl = unit === "m" ? "m" : "yds";

  // week + filters
  const [week,    setWeek]    = useState(nowWeek());
  const [allTime, setAllTime] = useState(false);
  const [fCountry,setFCountry]= useState("");
  const [fHcp,    setFHcp]    = useState("");
  const [fAge,    setFAge]    = useState("");
  const [fClub,   setFClub]   = useState("");
  const [fPlayer, setFPlayer] = useState("");
  const [fGender, setFGender] = useState("");
  const [sortBy,  setSortBy]  = useState("dist");
  const [selectedClubId, setSelectedClubId] = useState(null);

  // forms
  const [reg,  setReg]  = useState({fullName:"",position:"",courseName:"",location:"",country:"",email:"",pw:"",logo:""});
  const [lgn,  setLgn]  = useState({email:"",pw:""});
  const [form, setForm] = useState({player:"",dist:"",club:"",hcp:"",age:"",photo:"",date:todayStr(),tournament:"",gender:"male"});

  useEffect(()=>{
    initData().then(({orgs,entries})=>{ setOrgs(orgs); setEntries(entries); setLoading(false); });
  },[]);

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

  useEffect(()=>{
    const link=document.querySelector("link[rel~='icon']")||document.createElement('link');
    link.rel='icon'; link.type='image/svg+xml'; link.href='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20841.89%20595.28%22%3E%3Cpolygon%20fill%3D%22%23111111%22%20points%3D%22146.662%2C300.557%2022.035%2C521.864%20155.217%2C521.864%20279.933%2C300.406%20216.568%2C188.458%20369.538%2C188.458%20421.032%2C72.414%2017.521%2C72.414%22%2F%3E%3Cpolygon%20fill%3D%22%23111111%22%20points%3D%22695.492%2C293.872%20824.537%2C72.414%20820.016%2C72.414%20820.029%2C72.414%20686.834%2C72.414%20686.834%2C72.414%20421.032%2C72.414%20472.527%2C188.458%20621.49%2C188.458%20562.133%2C293.872%20623.367%2C405.807%20472.527%2C405.807%20421.032%2C521.864%20686.834%2C521.851%20686.834%2C521.864%20820.029%2C521.864%20820.016%2C521.851%20824.537%2C521.851%22%2F%3E%3C%2Fsvg%3E';
    document.head.appendChild(link);
  },[]);

  const toast = msg => setToastMsg(msg);
  const approvedOrgs = orgs.filter(o=>o.status==="approved");
  const orgFor = id => orgs.find(o=>o.id===id);
  const pendingCount = orgs.filter(o=>o.status==="pending").length;

  const hcpIn=(hcp,b)=>{ if(!b) return true; if(b==="scratch") return hcp<=0; if(b==="low") return hcp>0&&hcp<=5; if(b==="mid") return hcp>5&&hcp<=14; if(b==="high") return hcp>14&&hcp<=28; if(b==="beginner") return hcp>28; return true; };
  const ageIn=(age,b)=>{ if(!b) return true; if(b==="u25") return age<25; if(b==="25-40") return age>=25&&age<40; if(b==="40-55") return age>=40&&age<55; if(b==="55+") return age>=55; return true; };

  const tableRows = entries
    .filter(e=>approvedOrgs.find(o=>o.id===e.orgId))
    .filter(e=>allTime||sameWeek(e.date,week))
    .filter(e=>!fCountry||(orgFor(e.orgId)?.location||"").toLowerCase().includes(fCountry.toLowerCase()))
    .filter(e=>!fPlayer||e.player.toLowerCase().includes(fPlayer.toLowerCase()))
    .filter(e=>!fGender||e.gender===fGender)
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
    if(!reg.fullName||!reg.position||!reg.courseName||!reg.location||!reg.country||!reg.email||!reg.pw){ toast("Fill all required fields"); return; }
    if(orgs.find(o=>o.email===reg.email)){ toast("Email already registered"); return; }
    const newOrg={id:Date.now().toString(),fullName:reg.fullName,position:reg.position,courseName:reg.courseName,location:reg.location,country:reg.country,email:reg.email,pw:reg.pw,logo:reg.logo,status:"pending",badge:null};
    const up=[...orgs,newOrg]; setOrgs(up); await db.set(ORGS_KEY,up);
    await sendRegistrationNotification(newOrg);
    setReg({fullName:"",position:"",courseName:"",location:"",country:"",email:"",pw:"",logo:""});
    toast("Registration submitted — awaiting admin approval"); navTo("leaderboard");
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
    const e={id:Date.now().toString(),orgId:loggedOrg.id,player:form.player,dist:Number(form.dist),club:form.club,hcp:Number(form.hcp),age:Number(form.age),photo:form.photo,date:form.date,tournament:form.tournament,gender:form.gender};
    const up=[...entries,e]; setEntries(up); await db.set(ENT_KEY,up);
    setForm({player:"",dist:"",club:"",hcp:"",age:"",photo:"",date:todayStr(),tournament:"",gender:"male"});
    toast("Drive submitted to the World Registry!"); setTab("leaderboard");
  }

  if(loading) return <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:SANS,color:MUT,fontSize:13,letterSpacing:2}}>LOADING…</div></div>;

  if(showAdmin) return <AdminPanel orgs={orgs} entries={entries} setOrgs={setOrgs} setEntries={setEntries} toast={toast} onClose={()=>{setShowAdmin(false);localStorage.removeItem("rb_admin_auth");}} cvt={cvt} unitLbl={unitLbl}/>;

  const location = useLocation();
  const SEO_ROUTES = [
    "/clubs","/drive","/leaderboard","/register","/login","/submit","/contact",
    "/longest-mens-drive","/longest-womens-drive","/longest-drive-high-handicap",
    "/longest-drive-mid-handicap","/longest-drive-low-handicap","/longest-drive-seniors",
    "/longest-drive-juniors-u12","/longest-drive-juniors-13-16","/longest-drive-juniors-17-18",
    "/longest-drive-scratch-golfer","/longest-drive-over-50","/longest-drive-amateur",
    "/longest-drive-by-country",
    "/longest-drive-uk","/longest-drive-ireland","/longest-drive-usa",
    "/longest-drive-australia","/longest-drive-south-africa","/longest-drive-japan",
    "/longest-drive-germany","/longest-drive-sweden","/longest-drive-india",
    "/longest-drive-portugal","/longest-drive-nigeria","/longest-drive-china",
    "/average-driver-distance-by-handicap","/longest-drives-this-week",
    "/how-to-hit-a-golf-ball-farther","/average-golf-drive-distance",
    "/longest-golf-drive-ever","/how-to-promote-your-golf-event",
    "/golf-longest-drive-competition","/what-is-a-good-drive-in-golf",
    "/golf-club-longest-drive-competition-ideas","/long-drive-golf-equipment",
    "/golf-handicap-driving-distance",
  ];
  const isRouted = SEO_ROUTES.some(r => location.pathname.startsWith(r));

  function navTo(id) {
    const routeMap = {
      home: "/", leaderboard: "/leaderboard", clubs: "/clubs",
      register: "/register", login: "/login", submit: "/submit", contact: "/contact",
    };
    const path = routeMap[id] || "/";
    navigate(path);
    setMenuOpen(false);
    window.scrollTo(0,0);
  }

  const NavBtn=({id,label})=>(
    <button onClick={()=>navTo(id)} style={{background:tab===id?ORG:"transparent",border:tab===id?"none":"1px solid rgba(255,255,255,0.15)",color:tab===id?"#fff":"rgba(255,255,255,0.7)",fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 16px",borderRadius:0,cursor:"pointer",transition:"all .15s",letterSpacing:.3}}>{label}</button>
  );

  return <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:SANS}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      input::placeholder,select option{color:#666666!important}
      select{appearance:none}
      ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#1a1a1a}::-webkit-scrollbar-thumb{background:#2e2e2e;border-radius:3px}
      @keyframes su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fi{from{opacity:0}to{opacity:1}}
      @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      .desktop-nav{display:flex}
      .burger-btn{display:none}
      @media(max-width:680px){.desktop-nav{display:none}.burger-btn{display:flex;align-items:center;justify-content:center}}
      .site-header{padding:16px 22px!important;min-height:64px}
      @media(max-width:680px){.site-header{padding:12px 16px!important;min-height:60px;box-sizing:border-box}}
      @media(max-width:680px){.site-header svg{height:28px!important}}
    `}</style>

    {/* ── HEADER ── */}
    <div className="site-header" style={{borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(14,14,14,0.97)",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(16px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>navTo("home")}>
        <RB_LOGO_SVG_WHITE/>
      </div>

      {/* Desktop nav */}
      <div className="desktop-nav" style={{gap:10,alignItems:"center"}}>
        {/* ── UNIT TOGGLE ── */}
        <UnitToggle unit={unit} setUnit={setUnit}/>

        <NavBtn id="leaderboard" label="Leaderboard"/>
        <NavBtn id="contact" label="Contact"/>
        <button onClick={()=>setShowDemo(true)} style={{background:"transparent",border:`1px solid rgba(163,230,53,0.4)`,color:ORG,fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 14px",borderRadius:0,cursor:"pointer",letterSpacing:.3}}>Try Demo</button>
        {loggedOrg
          ?<><NavBtn id="submit" label="Submit Drive"/>
            <button onClick={()=>{setLoggedOrg(null);navTo("home");}} style={{background:"none",border:"1px solid rgba(220,80,80,0.3)",borderRadius:0,color:"#f87171",fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 14px",cursor:"pointer"}}>Log Out</button></>
          :<><NavBtn id="login" label="Organiser Login"/>
            <button onClick={()=>navTo("register")} style={{background:"transparent",border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:"7px 16px",borderRadius:0,cursor:"pointer"}}>Register Course</button></>
        }
        <button onClick={()=>setAdminPw({show:true,val:""})} title="Admin" style={{position:"relative",background:"none",border:"1px solid rgba(255,255,255,0.15)",borderRadius:0,color:"rgba(255,255,255,0.5)",fontSize:14,padding:"6px 10px",cursor:"pointer"}}>
          ⚙{pendingCount>0&&<span style={{position:"absolute",top:-4,right:-4,width:9,height:9,background:ORG,borderRadius:"50%",display:"block"}}/>}
        </button>
      </div>

      {/* Burger button */}
      <button className="burger-btn" onClick={()=>setMenuOpen(m=>!m)} style={{background:"none",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 10px",cursor:"pointer",flexDirection:"column",gap:4,alignItems:"center",justifyContent:"center"}}>
        <span style={{display:"block",width:18,height:2,background:"#fff",borderRadius:2,transition:"all .2s",transform:menuOpen?"rotate(45deg) translate(4px,4px)":"none"}}/>
        <span style={{display:"block",width:18,height:2,background:"#fff",borderRadius:2,transition:"all .2s",opacity:menuOpen?0:1}}/>
        <span style={{display:"block",width:18,height:2,background:"#fff",borderRadius:2,transition:"all .2s",transform:menuOpen?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
      </button>
    </div>

    {/* Mobile menu dropdown */}
    {menuOpen&&<div style={{position:"fixed",top:62,left:0,right:0,background:"rgba(14,14,14,0.98)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.08)",zIndex:99,padding:"16px 22px 20px",display:"flex",flexDirection:"column",gap:10,animation:"slideDown .2s ease"}}>
      {/* Unit toggle in mobile menu */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
        <span style={{fontFamily:SANS,fontSize:13,color:"rgba(255,255,255,0.5)"}}>Distance unit:</span>
        <UnitToggle unit={unit} setUnit={setUnit}/>
      </div>
      {[["leaderboard","Leaderboard"],["contact","Contact"],["login","Organiser Login"],["register","Register Course"]].map(([id,label])=>(
        <button key={id} onClick={()=>navTo(id)} style={{background:tab===id?ORG:"transparent",border:tab===id?"none":"1px solid rgba(255,255,255,0.12)",color:tab===id?"#fff":"rgba(255,255,255,0.8)",fontFamily:SANS,fontWeight:600,fontSize:14,padding:"12px 16px",borderRadius:0,cursor:"pointer",textAlign:"left"}}>
          {label}
        </button>
      ))}
      <button onClick={()=>navTo("clubs")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.8)",fontFamily:SANS,fontWeight:600,fontSize:14,padding:"12px 16px",borderRadius:0,cursor:"pointer",textAlign:"left"}}>Clubs &amp; Events</button>
      <button onClick={()=>{setShowDemo(true);setMenuOpen(false);}} style={{background:"transparent",border:`1px solid rgba(163,230,53,0.4)`,color:ORG,fontFamily:SANS,fontWeight:600,fontSize:14,padding:"12px 16px",borderRadius:0,cursor:"pointer",textAlign:"left"}}>Try Demo</button>
      {loggedOrg&&<>
        <button onClick={()=>navTo("submit")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.8)",fontFamily:SANS,fontWeight:600,fontSize:14,padding:"12px 16px",borderRadius:0,cursor:"pointer",textAlign:"left"}}>Submit Drive</button>
        <button onClick={()=>{setLoggedOrg(null);navTo("home");}} style={{background:"none",border:"1px solid rgba(220,80,80,0.3)",borderRadius:0,color:"#f87171",fontFamily:SANS,fontWeight:600,fontSize:14,padding:"12px 16px",cursor:"pointer",textAlign:"left"}}>Log Out</button>
      </>}
    </div>}

    <div style={{maxWidth:1000,margin:"0 auto",padding:tab==="home"&&!isRouted?"0 0 80px":"28px 18px 80px",animation:"fi .35s ease"}}>

      {/* ── TAB CONTENT (hidden on routed pages) ── */}
      {!isRouted && <>
      {/* ── HOME ── */}
      {tab==="home"&&<HomePage onNav={id=>{ navTo(id); }} entries={entries} orgs={orgs}/>}
      </> /* end !isRouted */}


      {/* ── ROUTED PAGES ── */}
      <Routes>
        {/* Core pages */}
        <Route path="/leaderboard" element={<div style={{padding:"28px 18px 80px"}}>
          <div style={{background:"#0e0e0e",border:`1px solid rgba(163,230,53,0.2)`,padding:"28px 28px 24px",marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:20}}>
              <div style={{flex:1,minWidth:220}}>
                <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:3,color:ORG,textTransform:"uppercase",marginBottom:8}}>Sample Data — Launching September 2026</div>
                <div style={{fontFamily:DISP,fontSize:"clamp(18px,3vw,28px)",color:"#fff",letterSpacing:.5,lineHeight:1.15,marginBottom:10}}>IS YOUR CLUB'S BIGGEST HITTER ON THE LEADERBOARD?</div>
                <div style={{fontFamily:SANS,fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,maxWidth:480}}>Register your club or event free on Ripping Bombs. Submit your longest drive competition winner to the global leaderboard.</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,flexShrink:0}}>
                <button onClick={()=>navTo("register")} style={{background:"transparent",border:`1px solid ${ORG}`,color:ORG,fontFamily:SANS,fontWeight:700,fontSize:12,padding:"12px 24px",cursor:"pointer",letterSpacing:.5}}>REGISTER YOUR CLUB FREE →</button>
                <button onClick={()=>navTo("register")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontFamily:SANS,fontWeight:600,fontSize:12,padding:"12px 24px",cursor:"pointer",letterSpacing:.5}}>SUBMIT AN EVENT RESULT →</button>
              </div>
            </div>
          </div>
          {allTimeBest[0]&&<div style={{background:"linear-gradient(135deg,rgba(163,230,53,0.12),rgba(163,230,53,0.04))",border:"1px solid rgba(163,230,53,0.25)",padding:"24px 28px",marginBottom:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:18}}>
            <div>
              <div style={{fontFamily:SANS,fontSize:10,fontWeight:700,letterSpacing:2,color:ORG,marginBottom:8,textTransform:"uppercase"}}>🏆 All-Time Record</div>
              <div style={{fontFamily:DISP,fontSize:34,color:TXT,letterSpacing:.5}}>{allTimeBest[0].player}</div>
              <div style={{fontFamily:SANS,fontSize:12,color:MUT,marginTop:4}}>{orgFor(allTimeBest[0].orgId)?.courseName} · {allTimeBest[0].club} · HCP {allTimeBest[0].hcp}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:DISP,fontSize:56,color:tierClr(allTimeBest[0].dist),letterSpacing:1,lineHeight:1}}>{cvt(allTimeBest[0].dist)}</div>
              <div style={{fontFamily:SANS,fontSize:14,color:MUT,marginTop:2}}>{unitLbl}</div>
            </div>
          </div>}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
            <button onClick={()=>setAllTime(v=>!v)} style={{background:allTime?ORG:"transparent",border:`1px solid ${allTime?ORG:BDR}`,color:allTime?"#111":MUT,fontFamily:SANS,fontWeight:600,fontSize:12,padding:"7px 14px",cursor:"pointer"}}>
              {allTime?"All Time ✓":"All Time"}
            </button>
            {!allTime&&<>
              <button onClick={()=>setWeek(prevWeek(week))} style={{background:"transparent",border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:13,padding:"7px 12px",cursor:"pointer"}}>‹</button>
              <span style={{fontFamily:SANS,fontSize:13,color:TXT,fontWeight:600}}>{weekLabel(week)}</span>
              <button onClick={()=>setWeek(nextWeek(week))} style={{background:"transparent",border:`1px solid ${BDR}`,color:MUT,fontFamily:SANS,fontSize:13,padding:"7px 12px",cursor:"pointer"}}>›</button>
            </>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:20}}>
            {[
              {label:"Search Player",val:fPlayer,set:setFPlayer,ph:"Player name"},
              {label:"Gender",val:fGender,set:setFGender,ph:"All",opts:[["","All"],["male","♂ Male"],["female","♀ Female"]]},
              {label:"Country/Region",val:fCountry,set:setFCountry,ph:"Filter by location"},
              {label:"Handicap",val:fHcp,set:setFHcp,ph:"All",opts:[["","All"],["scratch","Scratch (0 & under)"],["low","Low (1–5)"],["mid","Mid (6–14)"],["high","High (15–28)"],["beginner","Beginner (28+)"]]},
              {label:"Age Group",val:fAge,set:setFAge,ph:"All",opts:[["","All"],["u25","Under 25"],["25-40","25–40"],["40-55","40–55"],["55+","55+"]]},
              {label:"Club Brand",val:fClub,set:setFClub,ph:"e.g. TaylorMade"},
              {label:"Sort By",val:sortBy,set:setSortBy,ph:"Distance",opts:[["dist","Distance"],["date","Date"],["hcp","Handicap"],["age","Age"],["club","Club"]]},
            ].map(({label,val,set,ph,opts})=>(
              <div key={label}>
                <div style={{fontFamily:SANS,fontSize:9,fontWeight:700,color:DIM,letterSpacing:1.2,marginBottom:5,textTransform:"uppercase"}}>{label}</div>
                {opts
                  ?<div style={{position:"relative"}}><select value={val} onChange={e=>set(e.target.value)} style={{width:"100%",background:BG2,border:`1px solid ${BDR}`,padding:"8px 28px 8px 10px",color:val?TXT:DIM,fontFamily:SANS,fontSize:13,outline:"none",cursor:"pointer",appearance:"none"}}>
                    {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select><span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:DIM,fontSize:10}}>▾</span></div>
                  :<input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",background:BG2,border:`1px solid ${BDR}`,padding:"8px 10px",color:TXT,fontFamily:SANS,fontSize:13,outline:"none"}}/>
                }
              </div>
            ))}
          </div>
          <LeaderTable rows={tableRows} orgFor={orgFor} onView={setDetEnt} onShare={e=>setShareEnt(e)} cvt={cvt} unitLbl={unitLbl}/>
        </div>}/>

        <Route path="/register" element={<RegisterPage reg={reg} setReg={setReg} doRegister={doRegister}/>}/>
        <Route path="/login" element={<LoginPage lgn={lgn} setLgn={setLgn} doLogin={doLogin} onNav={navTo}/>}/>
        <Route path="/submit" element={<SubmitPage loggedOrg={loggedOrg} form={form} setForm={setForm} doSubmit={doSubmit} cvt={cvt} unitLbl={unitLbl}/>}/>
        <Route path="/clubs" element={<div style={{padding:"28px 18px 80px",maxWidth:1000,margin:"0 auto"}}><ClubsDirectory orgs={orgs} entries={entries}/></div>}/>
        <Route path="/clubs/:slug" element={<div style={{padding:"28px 18px 80px",maxWidth:1000,margin:"0 auto"}}><ClubPage orgs={orgs} entries={entries} cvt={cvt} unitLbl={unitLbl}/></div>}/>
        <Route path="/drive/:id" element={<DrivePage entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-mens-drive" element={<FilteredLeaderboardPage title="Longest Men's Golf Drive" metaDesc="See the longest men's golf drives recorded in competition worldwide." heading="Longest Men's Golf Drives" intro="The longest verified men's competition drives from registered clubs worldwide." filter={e=>e.gender==="male"||!e.gender} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-womens-drive" element={<FilteredLeaderboardPage title="Longest Women's Golf Drive" metaDesc="See the longest women's golf drives recorded in competition worldwide." heading="Longest Women's Golf Drives" intro="The longest verified women's competition drives from registered clubs worldwide." filter={e=>e.gender==="female"} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-scratch-golfer" element={<FilteredLeaderboardPage title="Longest Drive Scratch Golfers" metaDesc="Longest golf drives by scratch golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Scratch Golfers (HCP 0 & Under)" intro="The elite end of the leaderboard. Verified competition longest drives from scratch and plus-handicap golfers." filter={e=>e.hcp<=0} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-low-handicap" element={<FilteredLeaderboardPage title="Longest Golf Drive Low Handicap (0–5)" metaDesc="Longest golf drives by low handicap golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Low Handicap (0–5)" intro="Skill meets power. The longest verified competition drives from low handicap golfers." filter={e=>e.hcp>=0&&e.hcp<=5} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-mid-handicap" element={<FilteredLeaderboardPage title="Longest Golf Drive Mid Handicap (6–14)" metaDesc="Longest golf drives by mid handicap golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Mid Handicap (6–14)" intro="Where the game is won and lost. The longest verified competition drives from mid handicap golfers." filter={e=>e.hcp>=6&&e.hcp<=14} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-high-handicap" element={<FilteredLeaderboardPage title="Longest Golf Drive High Handicap (15+)" metaDesc="Longest golf drives by high handicap golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — High Handicap (15+)" intro="Proof that big drives aren't just for low handicappers. Verified competition longest drives from high handicap golfers." filter={e=>e.hcp>=15} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-amateur" element={<FilteredLeaderboardPage title="Longest Drive Amateur Golfers (HCP 10+)" metaDesc="Longest golf drives by amateur golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Amateur Golfers (HCP 10+)" intro="Verified competition longest drives from amateur golfers with handicap 10 and above." filter={e=>e.hcp>=10} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-seniors" element={<FilteredLeaderboardPage title="Longest Golf Drive Seniors (55+)" metaDesc="Longest golf drives by senior golfers. Verified competition results on Ripping Bombs." heading="Longest Drives — Seniors (55+)" intro="Age is just a number. Verified competition drives from senior golfers aged 55 and above." filter={e=>e.age>=55} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-over-50" element={<FilteredLeaderboardPage title="Longest Golf Drive Over 50" metaDesc="Longest golf drives by golfers aged 50 and over. Verified competition results on Ripping Bombs." heading="Longest Drives — Over 50s" intro="The longest verified competition drives from golfers aged 50 and above." filter={e=>e.age>=50} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-juniors-u12" element={<FilteredLeaderboardPage title="Longest Golf Drive Juniors Under 12" metaDesc="Longest golf drives by junior golfers under 12. Verified competition results on Ripping Bombs." heading="Longest Drives — Juniors (Under 12)" intro="The next generation of big hitters. Verified results from junior golfers aged 11 and under." filter={e=>e.age<=11} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-juniors-13-16" element={<FilteredLeaderboardPage title="Longest Golf Drive Youth (13–16)" metaDesc="Longest golf drives by youth golfers aged 13–16. Verified competition results on Ripping Bombs." heading="Longest Drives — Youth (13–16)" intro="Verified competition drives from youth golfers aged 13–16." filter={e=>e.age>=13&&e.age<=16} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-juniors-17-18" element={<FilteredLeaderboardPage title="Longest Golf Drive Cadets (17–18)" metaDesc="Longest golf drives by cadet golfers aged 17–18. Verified competition results on Ripping Bombs." heading="Longest Drives — Cadets (17–18)" intro="Verified competition drives from cadet golfers aged 17–18." filter={e=>e.age>=17&&e.age<=18} entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-uk" element={<CountryLeaderboardPage countryCode="GB" countryName="The United Kingdom" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-ireland" element={<CountryLeaderboardPage countryCode="IE" countryName="Ireland" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-usa" element={<CountryLeaderboardPage countryCode="US" countryName="The United States" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-australia" element={<CountryLeaderboardPage countryCode="AU" countryName="Australia" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-south-africa" element={<CountryLeaderboardPage countryCode="ZA" countryName="South Africa" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-japan" element={<CountryLeaderboardPage countryCode="JP" countryName="Japan" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-germany" element={<CountryLeaderboardPage countryCode="DE" countryName="Germany" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-sweden" element={<CountryLeaderboardPage countryCode="SE" countryName="Sweden" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-india" element={<CountryLeaderboardPage countryCode="IN" countryName="India" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-portugal" element={<CountryLeaderboardPage countryCode="PT" countryName="Portugal" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-nigeria" element={<CountryLeaderboardPage countryCode="NG" countryName="Nigeria" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-china" element={<CountryLeaderboardPage countryCode="CN" countryName="China" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-mexico" element={<CountryLeaderboardPage countryCode="MX" countryName="Mexico" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-canada" element={<CountryLeaderboardPage countryCode="CA" countryName="Canada" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/longest-drive-uae" element={<CountryLeaderboardPage countryCode="AE" countryName="The UAE" entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/average-driver-distance-by-handicap" element={<PageAvgDistByHandicap entries={entries} onNav={navTo}/>}/>
        <Route path="/longest-drives-this-week" element={<PageLongestDrivesThisWeek entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/how-to-hit-a-golf-ball-farther" element={<PageHowToHitFarther entries={entries} onNav={navTo}/>}/>
        <Route path="/average-golf-drive-distance" element={<PageAvgGolfDrive entries={entries} onNav={navTo}/>}/>
        <Route path="/longest-golf-drive-ever" element={<PageLongestDriveEver entries={entries} orgs={orgs} cvt={cvt} unitLbl={unitLbl} onNav={navTo}/>}/>
        <Route path="/how-to-promote-your-golf-event" element={<PagePromoteGolfEvent onNav={navTo}/>}/>
        <Route path="/golf-longest-drive-competition" element={<PageGolfLongestDriveCompetition onNav={navTo}/>}/>
        <Route path="/what-is-a-good-drive-in-golf" element={<PageWhatIsGoodDrive entries={entries} onNav={navTo}/>}/>
        <Route path="/golf-club-longest-drive-competition-ideas" element={<PageClubCompetitionIdeas onNav={navTo}/>}/>
        <Route path="/long-drive-golf-equipment" element={<PageLongDriveEquipment entries={entries} onNav={navTo}/>}/>
        <Route path="/golf-handicap-driving-distance" element={<PageHandicapDrivingDistance entries={entries} onNav={navTo}/>}/>
        <Route path="/contact" element={<ContactPage onNav={navTo}/>}/>
      </Routes>

    </div>

    {/* ── MODALS ── */}
    {detEnt&&<EntryModal entry={detEnt} org={orgFor(detEnt.orgId)} onClose={()=>setDetEnt(null)} cvt={cvt} unitLbl={unitLbl}/>}

    {shareEnt&&<ShareModal entry={shareEnt} org={orgFor(shareEnt.orgId)} cvt={cvt} unitLbl={unitLbl} onClose={()=>setShareEnt(null)}/>}

    {showDemo&&<DemoSubmit onClose={()=>setShowDemo(false)} entries={entries} setEntries={setEntries} orgs={orgs} toast={toast} cvt={cvt} unitLbl={unitLbl}/>}

    {adminPw.show&&<Overlay onClose={()=>setAdminPw({show:false,val:""})}>
      <div style={{fontFamily:DISP,fontSize:24,color:TXT,letterSpacing:1,marginBottom:20}}>Admin Access</div>
      <Field label="Password" type="password" value={adminPw.val} onChange={e=>setAdminPw({...adminPw,val:e.target.value})} placeholder="Enter admin password"/>
      <Btn full onClick={()=>{ if(adminPw.val===ADMIN_PW){setShowAdmin(true);localStorage.setItem("rb_admin_auth","1");setAdminPw({show:false,val:""});}else{toast("Incorrect password");} }}>Enter Dashboard →</Btn>
    </Overlay>}

    {toastMsg&&<Toast msg={toastMsg} onDone={()=>setToastMsg(null)}/>}

    {showLaunch&&<LaunchModal onClose={()=>{setShowLaunch(false);sessionStorage.setItem("rb_launch_seen","1");}} onNav={navTo}/>}

    <SiteFooter onNav={id=>navTo(id)}/>
  </div>;
}
