import { SEED_KEY, ORGS_KEY, ENT_KEY } from './constants';

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────

async function getSupabase() {
  const { supabase } = await import('./supabaseClient');
  return supabase;
}

// ─── DB LAYER ─────────────────────────────────────────────────────────────────
// Reads from Supabase first, falls back to localStorage.
// Writes go to both Supabase and localStorage.

export const db = {

  async get(k) {
    try {
      const supabase = await getSupabase();

      if (k === ORGS_KEY) {
        const { data, error } = await supabase.from('clubs').select('*');
        if (!error && data && data.length > 0) return data;
      }

      if (k === ENT_KEY) {
        const { data, error } = await supabase.from('entries').select('*');
        if (!error && data && data.length > 0) return data;
      }

      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : null;
      }

      return null;
    } catch (e) {
      console.error('DB GET ERROR:', e);
      // Fallback to localStorage on any error
      try {
        if (typeof window !== 'undefined') {
          const v = localStorage.getItem(k);
          return v ? JSON.parse(v) : null;
        }
      } catch {}
      return null;
    }
  },

  async set(k, v) {
    try {
      const supabase = await getSupabase();
      const rows = Array.isArray(v) ? v : [v];

      if (k === ORGS_KEY) {
        const { error } = await supabase
          .from('clubs')
          .upsert(rows, { onConflict: 'id' });
        if (error) console.error('CLUBS UPSERT ERROR:', error);
      }

      if (k === ENT_KEY) {
        const { error } = await supabase
          .from('entries')
          .upsert(rows, { onConflict: 'id' });
        if (error) console.error('ENTRIES UPSERT ERROR:', error);
      }

      // Also write to localStorage as cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(k, JSON.stringify(v));
      }

    } catch (e) {
      console.error('DB SET ERROR:', e);
      // Fallback — at least save locally
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(k, JSON.stringify(v));
        }
      } catch {}
    }
  },

  async del(k) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(k);
      }
    } catch (e) {
      console.error('DB DELETE ERROR:', e);
    }
  },

  // Insert a single org (registration)
  async insertOrg(org) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('clubs').insert(org);
      if (error) { console.error('INSERT ORG ERROR:', error); return false; }
      return true;
    } catch (e) {
      console.error('INSERT ORG EXCEPTION:', e);
      return false;
    }
  },

  // Insert a single entry (drive submission)
  async insertEntry(entry) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('entries').insert(entry);
      if (error) { console.error('INSERT ENTRY ERROR:', error); return false; }
      return true;
    } catch (e) {
      console.error('INSERT ENTRY EXCEPTION:', e);
      return false;
    }
  },

  // Update a single org by id (admin approve/reject/badge)
  async updateOrg(id, fields) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('clubs').update(fields).eq('id', id);
      if (error) { console.error('UPDATE ORG ERROR:', error); return false; }
      return true;
    } catch (e) {
      console.error('UPDATE ORG EXCEPTION:', e);
      return false;
    }
  },

  // Delete a single org by id
  async deleteOrg(id) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('clubs').delete().eq('id', id);
      if (error) { console.error('DELETE ORG ERROR:', error); return false; }
      return true;
    } catch (e) {
      console.error('DELETE ORG EXCEPTION:', e);
      return false;
    }
  },

  // Delete a single entry by id
  async deleteEntry(id) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('entries').delete().eq('id', id);
      if (error) { console.error('DELETE ENTRY ERROR:', error); return false; }
      return true;
    } catch (e) {
      console.error('DELETE ENTRY EXCEPTION:', e);
      return false;
    }
  },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const SEED_ORGS = [
  { id:'o1',  fullName:'James Hargreaves', position:'Club Secretary',      courseName:'Royal Birkdale Golf Club',  location:'Southport, England',     country:'GB', email:'james@royalbirkdale.com',  pw:'demo', logo:'', status:'approved', badge:'platinum', accountType:'club', simulator:'' },
  { id:'o2',  fullName:"Caitlin O'Brien",  position:'Tournament Director',  courseName:'Lahinch Golf Club',         location:'Lahinch, Ireland',        country:'IE', email:'caitlin@lahinch.ie',       pw:'demo', logo:'', status:'approved', badge:'tour',     accountType:'club', simulator:'' },
  { id:'o3',  fullName:'Magnus Lindqvist', position:'Head Professional',    courseName:'Barseback G&CC',            location:'Malmo, Sweden',           country:'SE', email:'magnus@barseback.se',      pw:'demo', logo:'', status:'approved', badge:'platinum', accountType:'club', simulator:'' },
  { id:'o4',  fullName:'Hiroshi Tanaka',   position:'General Manager',      courseName:'Hirono Golf Club',          location:'Kobe, Japan',             country:'JP', email:'hiroshi@hirono.jp',        pw:'demo', logo:'', status:'approved', badge:'tour',     accountType:'club', simulator:'' },
  { id:'o5',  fullName:'Priya Nair',       position:'Events Coordinator',   courseName:'Royal Calcutta Golf Club',  location:'Kolkata, India',          country:'IN', email:'priya@rcgc.in',            pw:'demo', logo:'', status:'approved', badge:'amateur',  accountType:'club', simulator:'' },
  { id:'o6',  fullName:'Dylan Schwartz',   position:'Club Manager',         courseName:'Bethpage Black',            location:'New York, USA',           country:'US', email:'dylan@bethpage.com',       pw:'demo', logo:'', status:'approved', badge:'platinum', accountType:'club', simulator:'' },
  { id:'o7',  fullName:'Amara Diallo',     position:'Tournament Organiser', courseName:'Leopard Creek CC',          location:'Malelane, South Africa',  country:'ZA', email:'amara@leopardcreek.co.za', pw:'demo', logo:'', status:'approved', badge:'tour',     accountType:'club', simulator:'' },
  { id:'o8',  fullName:'Sofia Reyes',      position:'Head Pro',             courseName:'Club de Golf Chapultepec',  location:'Mexico City, Mexico',     country:'MX', email:'sofia@chapultepec.mx',     pw:'demo', logo:'', status:'approved', badge:'amateur',  accountType:'club', simulator:'' },
  { id:'o9',  fullName:'Hans Brauer',      position:'Head Professional',    courseName:'Golf Club Bad Griesbach',   location:'Bavaria, Germany',        country:'DE', email:'hans@gcbg.de',             pw:'demo', logo:'', status:'approved', badge:'tour',     accountType:'club', simulator:'' },
  { id:'o10', fullName:'Will Cartwright',  position:'General Manager',      courseName:'Carnoustie Golf Links',     location:'Carnoustie, Scotland',    country:'GB', email:'will@carnoustie.co.uk',    pw:'demo', logo:'', status:'approved', badge:'platinum', accountType:'club', simulator:'' },
  { id:'o11', fullName:'Nadia Okonkwo',    position:'Club Director',        courseName:'Ikoyi Golf Club',           location:'Lagos, Nigeria',          country:'NG', email:'nadia@ikoyi.ng',           pw:'demo', logo:'', status:'approved', badge:'amateur',  accountType:'club', simulator:'' },
  { id:'o12', fullName:'Pedro Almeida',    position:'Tournament Director',  courseName:'Quinta do Lago Golf',       location:'Algarve, Portugal',       country:'PT', email:'pedro@qdl.pt',             pw:'demo', logo:'', status:'approved', badge:'tour',     accountType:'club', simulator:'' },
  { id:'o13', fullName:'Chen Wei',         position:'Head Professional',    courseName:'Mission Hills Golf Club',   location:'Shenzhen, China',         country:'CN', email:'chen@missionhills.cn',     pw:'demo', logo:'', status:'approved', badge:'platinum', accountType:'club', simulator:'' },
  { id:'o14', fullName:'Aiden Murphy',     position:'Events Manager',       courseName:'K Club Golf Resort',        location:'Straffan, Ireland',       country:'IE', email:'aiden@kclub.ie',           pw:'demo', logo:'', status:'approved', badge:'tour',     accountType:'club', simulator:'' },
  { id:'o15', fullName:'Fatima Al-Rashid', position:'Club Secretary',       courseName:'Abu Dhabi Golf Club',       location:'Abu Dhabi, UAE',          country:'AE', email:'fatima@adgc.ae',           pw:'demo', logo:'', status:'pending',  badge:null,       accountType:'club', simulator:'' },
  { id:'o16', fullName:'Marco Rossi',      position:'General Manager',      courseName:'Golf Club Milano',          location:'Milan, Italy',            country:'IT', email:'marco@gcmilano.it',        pw:'demo', logo:'', status:'pending',  badge:null,       accountType:'club', simulator:'' },
];

export const SEED_ENTRIES = [
  { id:'e01', orgId:'o6', player:'Marcus Webb',      dist:267, club:'TaylorMade Stealth 2',            hcp:2,  age:34, date:daysAgo(0),  photo:'', gender:'male'   },
  { id:'e02', orgId:'o1', player:'Tom Ashworth',     dist:251, club:'Callaway Paradym',                hcp:7,  age:28, date:daysAgo(0),  photo:'', gender:'male'   },
  { id:'e03', orgId:'o4', player:'Kenji Mori',       dist:243, club:'Ping G430 LST',                   hcp:0,  age:41, date:daysAgo(0),  photo:'', gender:'male'   },
  { id:'e04', orgId:'o7', player:'Sipho Dlamini',    dist:218, club:'Cobra Aerojet LS',                hcp:14, age:22, date:daysAgo(0),  photo:'', gender:'male'   },
  { id:'e05', orgId:'o2', player:"Fiona O'Sullivan", dist:196, club:'Titleist TSR3',                   hcp:5,  age:37, date:daysAgo(0),  photo:'', gender:'female' },
  { id:'e06', orgId:'o3', player:'Erik Johansson',   dist:258, club:'TaylorMade Qi10 LS',             hcp:1,  age:29, date:daysAgo(1),  photo:'', gender:'male'   },
  { id:'e07', orgId:'o8', player:'Carlos Mendoza',   dist:231, club:'Callaway Paradym Ai Smoke',       hcp:9,  age:45, date:daysAgo(1),  photo:'', gender:'male'   },
  { id:'e08', orgId:'o5', player:'Priya Sharma',     dist:187, club:'Srixon ZX5 Mk II',               hcp:3,  age:31, date:daysAgo(1),  photo:'', gender:'female' },
  { id:'e09', orgId:'o6', player:'Tyler Briggs',     dist:198, club:'Cleveland Launcher XL2',          hcp:18, age:55, date:daysAgo(1),  photo:'', gender:'male'   },
  { id:'e10', orgId:'o1', player:'Oliver Crane',     dist:247, club:'Titleist TSi3',                   hcp:4,  age:26, date:daysAgo(1),  photo:'', gender:'male'   },
  { id:'e11', orgId:'o4', player:'Ryo Fujiwara',     dist:262, club:'Ping G430 Max 10K',              hcp:0,  age:24, date:daysAgo(2),  photo:'', gender:'male'   },
  { id:'e12', orgId:'o2', player:'Declan Murphy',    dist:214, club:'TaylorMade Stealth HD',           hcp:11, age:48, date:daysAgo(2),  photo:'', gender:'male'   },
  { id:'e13', orgId:'o7', player:'Thandeka Nkosi',   dist:201, club:'Cobra Darkspeed X',              hcp:6,  age:33, date:daysAgo(2),  photo:'', gender:'female' },
  { id:'e14', orgId:'o8', player:'Valentina Cruz',   dist:183, club:'Mizuno ST-X 230',                hcp:16, age:62, date:daysAgo(2),  photo:'', gender:'female' },
  { id:'e15', orgId:'o3', player:'Lars Eklund',      dist:255, club:'Callaway Paradym Triple Diamond', hcp:2,  age:38, date:daysAgo(2),  photo:'', gender:'male'   },
  { id:'e16', orgId:'o5', player:'Rohit Menon',      dist:224, club:'Wilson Dynapower',               hcp:8,  age:44, date:daysAgo(3),  photo:'', gender:'male'   },
  { id:'e17', orgId:'o1', player:'James Whitfield',  dist:261, club:'TaylorMade Qi10',                hcp:0,  age:27, date:daysAgo(3),  photo:'', gender:'male'   },
  { id:'e18', orgId:'o6', player:'DeShawn Porter',   dist:249, club:'Ping G430 Max',                  hcp:5,  age:19, date:daysAgo(3),  photo:'', gender:'male'   },
  { id:'e19', orgId:'o2', player:'Cormac Byrne',     dist:178, club:'Titleist TSR2',                   hcp:20, age:67, date:daysAgo(3),  photo:'', gender:'male'   },
  { id:'e20', orgId:'o4', player:'Takeshi Ono',      dist:244, club:'Srixon ZX7 Mk II',               hcp:3,  age:35, date:daysAgo(3),  photo:'', gender:'male'   },
  { id:'e21', orgId:'o7', player:'Bongani Zulu',     dist:233, club:'Cobra Aerojet Max',              hcp:12, age:40, date:daysAgo(4),  photo:'', gender:'male'   },
  { id:'e22', orgId:'o3', player:'Bjorn Magnusson',  dist:257, club:'TaylorMade Stealth 2+',          hcp:1,  age:30, date:daysAgo(4),  photo:'', gender:'male'   },
  { id:'e23', orgId:'o8', player:'Sofia Vargas',     dist:192, club:'Callaway Rogue ST LS',           hcp:7,  age:52, date:daysAgo(4),  photo:'', gender:'female' },
  { id:'e24', orgId:'o5', player:'Ananya Pillai',    dist:179, club:'Titleist TSR1',                   hcp:10, age:28, date:daysAgo(4),  photo:'', gender:'female' },
  { id:'e25', orgId:'o6', player:'Ryan Kowalski',    dist:246, club:'Mizuno ST-Z 230',                hcp:4,  age:23, date:daysAgo(4),  photo:'', gender:'male'   },
  { id:'e26', orgId:'o9', player:'Hans Brauer',      dist:252, club:'TaylorMade Stealth 2+',          hcp:2,  age:44, date:daysAgo(2),  photo:'', gender:'male'   },
  { id:'e27', orgId:'o10',player:'Alistair MacLeod', dist:259, club:'Cobra Darkspeed LS',             hcp:0,  age:38, date:daysAgo(1),  photo:'', gender:'male'   },
  { id:'e28', orgId:'o11',player:'Emeka Osei',       dist:228, club:'TaylorMade Qi10 Max',            hcp:8,  age:29, date:daysAgo(1),  photo:'', gender:'male'   },
  { id:'e29', orgId:'o12',player:'Joao Silva',       dist:241, club:'Callaway Paradym Ai Smoke',      hcp:3,  age:33, date:daysAgo(2),  photo:'', gender:'male'   },
  { id:'e30', orgId:'o13',player:'Zhang Wei',        dist:253, club:'Ping G430 LST',                   hcp:1,  age:26, date:daysAgo(0),  photo:'', gender:'male'   },
  { id:'e31', orgId:'o14',player:'Conor Gallagher',  dist:237, club:'Titleist TSR3',                   hcp:6,  age:31, date:daysAgo(3),  photo:'', gender:'male'   },
];

// ─── INIT ─────────────────────────────────────────────────────────────────────
// On first load, checks if Supabase has data.
// If empty, seeds it. Always returns live Supabase data.

export async function initData() {
  try {
    const supabase = await getSupabase();

    // Check if clubs table has data
    const { data: existingOrgs } = await supabase.from('clubs').select('id').limit(1);

    if (!existingOrgs || existingOrgs.length === 0) {
      // Seed Supabase with demo data
      await supabase.from('clubs').upsert(SEED_ORGS, { onConflict: 'id' });
      await supabase.from('entries').upsert(SEED_ENTRIES, { onConflict: 'id' });
    }

    // Always fetch live data from Supabase
    const { data: orgs }    = await supabase.from('clubs').select('*');
    const { data: entries } = await supabase.from('entries').select('*');

    return {
      orgs:    orgs    || SEED_ORGS,
      entries: entries || SEED_ENTRIES,
    };

  } catch (e) {
    console.error('INIT DATA ERROR:', e);

    // Full fallback to localStorage
    try {
      if (typeof window !== 'undefined') {
        const orgs    = JSON.parse(localStorage.getItem('rb_orgs')    || 'null');
        const entries = JSON.parse(localStorage.getItem('rb_entries') || 'null');
        return { orgs: orgs || SEED_ORGS, entries: entries || SEED_ENTRIES };
      }
    } catch {}

    return { orgs: SEED_ORGS, entries: SEED_ENTRIES };
  }
}
