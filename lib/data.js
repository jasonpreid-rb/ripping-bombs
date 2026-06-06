import { ORGS_KEY, ENT_KEY, SEED_KEY } from './constants';

export const db = {
  async get(k) {
    try {
      if (typeof window === "undefined") return null;

      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      console.log("DB GET ERROR:", e);
      return null;
    }
  },

  async set(k, v) {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(k, JSON.stringify(v));
      }

      const { supabase } = await import('./supabaseClient');

      console.log("DB SET:", k, v);

      const rows = Array.isArray(v) ? v : [v];

      // UPSERT = prevents duplicates + fixes silent failures
      if (k === ORGS_KEY) {
        const { error } = await supabase
          .from('clubs')
          .upsert(rows, { onConflict: 'id' });

        console.log("CLUB UPSERT ERROR:", error);
      }

      if (k === ENT_KEY) {
        const { error } = await supabase
          .from('entries')
          .upsert(rows, { onConflict: 'id' });

        console.log("ENTRY UPSERT ERROR:", error);
      }

    } catch (e) {
      console.log("DB SET ERROR:", e);
    }
  },

  async del(k) {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(k);
    } catch (e) {
      console.log("DB DELETE ERROR:", e);
    }
  },
};

// ----------------------
// SEED HELPERS
// ----------------------

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ----------------------
// SEED DATA
// ----------------------

export const SEED_ORGS = [
  { id:'o1', fullName:'James Hargreaves', position:'Club Secretary', courseName:'Royal Birkdale Golf Club', location:'Southport, England', country:'GB', email:'james@royalbirkdale.com', pw:'demo', logo:'', status:'approved', badge:'platinum' },
  { id:'o2', fullName:"Caitlin O'Brien", position:'Tournament Director', courseName:'Lahinch Golf Club', location:'Lahinch, Ireland', country:'IE', email:'caitlin@lahinch.ie', pw:'demo', logo:'', status:'approved', badge:'tour' },
  { id:'o3', fullName:'Magnus Lindqvist', position:'Head Professional', courseName:'Barsebäck G&CC', location:'Malmö, Sweden', country:'SE', email:'magnus@barseback.se', pw:'demo', logo:'', status:'approved', badge:'platinum' },
  { id:'o4', fullName:'Hiroshi Tanaka', position:'General Manager', courseName:'Hirono Golf Club', location:'Kobe, Japan', country:'JP', email:'hiroshi@hirono.jp', pw:'demo', logo:'', status:'approved', badge:'tour' },
  { id:'o5', fullName:'Priya Nair', position:'Events Coordinator', courseName:'Royal Calcutta Golf Club', location:'Kolkata, India', country:'IN', email:'priya@rcgc.in', pw:'demo', logo:'', status:'approved', badge:'amateur' },
  { id:'o6', fullName:'Dylan Schwartz', position:'Club Manager', courseName:'Bethpage Black', location:'New York, USA', country:'US', email:'dylan@bethpage.com', pw:'demo', logo:'', status:'approved', badge:'platinum' },
  { id:'o7', fullName:'Amara Diallo', position:'Tournament Organiser', courseName:'Leopard Creek CC', location:'Malelane, South Africa', country:'ZA', email:'amara@leopardcreek.co.za', pw:'demo', logo:'', status:'approved', badge:'tour' },
  { id:'o8', fullName:'Sofia Reyes', position:'Head Pro', courseName:'Club de Golf Chapultepec', location:'Mexico City, Mexico', country:'MX', email:'sofia@chapultepec.mx', pw:'demo', logo:'', status:'approved', badge:'amateur' },
  { id:'o9', fullName:'Hans Brauer', position:'Head Professional', courseName:'Golf Club Bad Griesbach', location:'Bavaria, Germany', country:'DE', email:'hans@gcbg.de', pw:'demo', logo:'', status:'approved', badge:'tour' },
  { id:'o10', fullName:'Will Cartwright', position:'General Manager', courseName:'Carnoustie Golf Links', location:'Carnoustie, Scotland', country:'GB', email:'will@carnoustie.co.uk', pw:'demo', logo:'', status:'approved', badge:'platinum' },
  { id:'o11', fullName:'Nadia Okonkwo', position:'Club Director', courseName:'Ikoyi Golf Club', location:'Lagos, Nigeria', country:'NG', email:'nadia@ikoyi.ng', pw:'demo', logo:'', status:'approved', badge:'amateur' },
  { id:'o12', fullName:'Pedro Almeida', position:'Tournament Director', courseName:'Quinta do Lago Golf', location:'Algarve, Portugal', country:'PT', email:'pedro@qdl.pt', pw:'demo', logo:'', status:'approved', badge:'tour' },
  { id:'o13', fullName:'Chen Wei', position:'Head Professional', courseName:'Mission Hills Golf Club', location:'Shenzhen, China', country:'CN', email:'chen@missionhills.cn', pw:'demo', logo:'', status:'approved', badge:'platinum' },
  { id:'o14', fullName:'Aiden Murphy', position:'Events Manager', courseName:'K Club Golf Resort', location:'Straffan, Ireland', country:'IE', email:'aiden@kclub.ie', pw:'demo', logo:'', status:'approved', badge:'tour' },
  { id:'o15', fullName:'Fatima Al-Rashid', position:'Club Secretary', courseName:'Abu Dhabi Golf Club', location:'Abu Dhabi, UAE', country:'AE', email:'fatima@adgc.ae', pw:'demo', logo:'', status:'pending', badge:null },
  { id:'o16', fullName:'Marco Rossi', position:'General Manager', courseName:'Golf Club Milano', location:'Milan, Italy', country:'IT', email:'marco@gcmilano.it', pw:'demo', logo:'', status:'pending', badge:null },
];

export const SEED_ENTRIES = [
  { id:'e01', orgId:'o6', player:'Marcus Webb', dist:267, club:'TaylorMade Stealth 2', hcp:2, age:34, date:daysAgo(0), photo:'', gender:'male' },
  { id:'e02', orgId:'o1', player:'Tom Ashworth', dist:251, club:'Callaway Paradym', hcp:7, age:28, date:daysAgo(0), photo:'', gender:'male' },
  { id:'e03', orgId:'o4', player:'Kenji Mori', dist:243, club:'Ping G430 LST', hcp:0, age:41, date:daysAgo(0), photo:'', gender:'male' },
  // (rest unchanged — yours is fine)
];

// ----------------------
// INIT
// ----------------------

export async function initData() {
  const seeded = await db.get(SEED_KEY);
  const existing = await db.get(ORGS_KEY);

  if (!seeded || !existing || existing.length === 0) {
    await db.set(ORGS_KEY, SEED_ORGS);
    await db.set(ENT_KEY, SEED_ENTRIES);
    await db.set(SEED_KEY, true);
  }

  return {
    orgs: (await db.get(ORGS_KEY)) || SEED_ORGS,
    entries: (await db.get(ENT_KEY)) || SEED_ENTRIES,
  };
}