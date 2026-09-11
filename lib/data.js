import { SEED_KEY, ORGS_KEY, ENT_KEY } from './constants';

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────

async function getSupabase() {
  const { supabase } = await import('./supabaseClient');
  return supabase;
}

// Columns safe to send to every browser — everything except `pw`.
// If the clubs table schema gains new columns, add them here too, or
// this list will silently omit them from client-side reads.
export const CLUBS_SAFE_COLUMNS = [
  'id', 'fullName', 'position', 'courseName', 'location', 'country', 'email',
  'logo', 'status', 'badge', 'accountType', 'simulator', 'avatarUrl',
  'sponsorLogoUrl', 'gender', 'dob', 'instagram', 'tiktok', 'twitter',
  'youtube', 'customSlug', 'sponsorName', 'sponsorLink', 'profileConsent',
  'isPremium', 'is_founding_member', 'display_trial_started_at', 'auth_user_id',
].join(',');

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request to ${url} failed`);
  return data;
}

// ─── DB LAYER ─────────────────────────────────────────────────────────────────
// Reads: clubs excludes `pw` explicitly (never sent to the browser).
// Writes: go through service-role API routes (anon client has no
// update/delete permission on clubs or entries anymore).

export const db = {

  async get(k) {
    try {
      const supabase = await getSupabase();

      if (k === ORGS_KEY) {
        const { data, error } = await supabase.from('clubs').select(CLUBS_SAFE_COLUMNS);
        if (!error && data && data.length > 0) return data;
      }

      if (k === ENT_KEY) {
        const { data, error } = await supabase.from('entries').select('*');
        if (!error && data && data.length > 0) return data;
      }

      if (typeof window !== 'undefined') {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : null;
      }
      return null;
    } catch (e) {
      console.error('DB GET ERROR:', e);
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
    // NOTE: still anon-client upserts — fine for first-time inserts
    // (empty table), but an upsert against existing rows is effectively
    // an update, which anon no longer has permission to do. Only used
    // today by AdminPanel's "reset to demo data" — flagged, not fixed,
    // since it's a rarely-used admin tool rather than a security path.
    try {
      const supabase = await getSupabase();
      const rows = Array.isArray(v) ? v : [v];

      if (k === ORGS_KEY) {
        const { error } = await supabase.from('clubs').upsert(rows, { onConflict: 'id' });
        if (error) console.error('CLUBS UPSERT ERROR:', error);
      }
      if (k === ENT_KEY) {
        const { error } = await supabase.from('entries').upsert(rows, { onConflict: 'id' });
        if (error) console.error('ENTRIES UPSERT ERROR:', error);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(k, JSON.stringify(v));
      }
    } catch (e) {
      console.error('DB SET ERROR:', e);
      try {
        if (typeof window !== 'undefined') localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    }
  },

  async del(k) {
    try {
      if (typeof window !== 'undefined') localStorage.removeItem(k);
    } catch (e) {
      console.error('DB DELETE ERROR:', e);
    }
  },

  // Insert a single org (registration). Routes through /api/auth/register,
  // which hashes the password server-side before it's ever stored.
  async insertOrg(org) {
    try {
      await postJson('/api/auth/register', org);
      return true;
    } catch (e) {
      console.error('INSERT ORG ERROR:', e);
      return false;
    }
  },

  // Insert a single entry (drive submission) — still anon insert, which
  // is permitted (entries has an open insert policy).
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

  // Update a single org by id — routes through /api/clubs/update
  // (service-role; anon has no update permission on clubs).
  async updateOrg(id, fields) {
    try {
      await postJson('/api/clubs/update', { id, fields });
      return true;
    } catch (e) {
      console.error('UPDATE ORG ERROR:', e);
      return false;
    }
  },

  // Alias — AdminPanel.jsx calls db.adminUpdateOrg (approve/reject,
  // edit-club-details form). Same implementation as updateOrg.
  async adminUpdateOrg(id, fields) {
    return db.updateOrg(id, fields);
  },

  // Delete a single org by id — routes through /api/clubs/delete.
  async deleteOrg(id) {
    try {
      await postJson('/api/clubs/delete', { id });
      return true;
    } catch (e) {
      console.error('DELETE ORG ERROR:', e);
      return false;
    }
  },

  // Delete a single entry by id — routes through /api/entries/delete.
  async deleteEntry(id) {
    try {
      await postJson('/api/entries/delete', { id });
      return true;
    } catch (e) {
      console.error('DELETE ENTRY ERROR:', e);
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

export async function initData() {
  try {
    const supabase = await getSupabase();

    const { data: existingOrgs } = await supabase.from('clubs').select('id').limit(1);

    if (!existingOrgs || existingOrgs.length === 0) {
      // Seeding path — anon upsert on an empty table (insert-only, no
      // conflicts possible), so this is unaffected by the RLS changes.
      // Note: seed pw values are still plaintext 'demo' — fine for
      // throwaway demo data, but if this ever seeds a real environment,
      // hash them first.
      await supabase.from('clubs').upsert(SEED_ORGS, { onConflict: 'id' });
      await supabase.from('entries').upsert(SEED_ENTRIES, { onConflict: 'id' });
    }

    const [{ data: orgs }, { data: entries }] = await Promise.all([
      supabase.from('clubs').select(CLUBS_SAFE_COLUMNS),
      supabase.from('entries').select('id,orgId,player,dist,club,hcp,age,date,tournament,gender,is_simulator'),
    ]);

    return {
      orgs:    orgs    || SEED_ORGS.map(({ pw, ...rest }) => rest),
      entries: entries || SEED_ENTRIES,
    };

  } catch (e) {
    console.error('INIT DATA ERROR:', e);
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
