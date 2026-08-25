# PROJECT BRAIN — Ripping Bombs Platform

## 🧠 Overview
Ripping Bombs is a Next.js web platform for registering golf clubs and players, submitting longest drive competition results, and viewing a live global leaderboard. It is hosted on Vercel and connected to a Supabase backend.

The platform is currently in pre-launch demo mode (launching September 2026) with real submissions already coming in.

---

## ⚙️ Tech Stack
- Framework: Next.js (Pages Router)
- Hosting: Vercel (auto-deploys from GitHub on push)
- Database: Supabase (Postgres) — LIVE
- Image Storage: Supabase Storage (planned) — private bucket, signed URLs, path convention `verification-photos/{playerId}/{submissionId}.jpg`
- AI Photo Verification: Claude Haiku (vision) via Anthropic API (planned) — extracts distance from submission screenshot, flags mismatches for manual review
- Email: Resend (via `pages/api/send-email.js`) — API key stored in Vercel env as `RESEND_API_KEY`
- Analytics: Google Analytics GA4 (ID: G-5RCJDKVBER) — injected via next/script in _app.jsx

---

## 🗄️ Database Tables (Supabase)

### `clubs` table
Stores registered organisations (golf clubs, events, simulator accounts).

| column      | type | notes |
|-------------|------|-------|
| id          | text | primary key (e.g. "o6") |
| fullName    | text | person's full name |
| position    | text | role at club |
| courseName  | text | club/course name |
| location    | text | city/region |
| country     | text | two-letter country code (e.g. "gb") |
| email       | text | login email |
| pw          | text | plain-text password (legacy) |
| logo        | text | image URL (optional) |
| status      | text | "pending" or "approved" |
| badge       | text | null or "simulator" |
| accountType | text | "club" or "simulator" |
| simulator   | text | simulator brand/model (simulator accounts only) |
| gender      | text | "male" or "female" (simulator accounts only) |

### `entries` table
Stores individual drive submissions.

| column       | type    | notes |
|--------------|---------|-------|
| id           | text    | primary key |
| orgId        | text    | foreign key → clubs.id |
| player       | text    | player full name |
| dist         | numeric | distance in yards (may be stored as string in some legacy entries — always use Number() when sorting) |
| club         | text    | club brand and model (e.g. "TaylorMade Stealth 2") |
| hcp          | numeric | handicap index |
| age          | numeric | player age |
| photo        | text    | base64 image string or empty string |
| date         | text    | ISO date string "YYYY-MM-DD" |
| tournament   | text    | event name or empty string |
| gender       | text    | "male" or "female" |
| is_simulator | boolean | true for simulator submissions |

#### Important notes on entries:
- `dist` should always be cast with `Number()` before sorting — some entries have it as a string
- `is_simulator: true` entries are valid and appear on the all-time leaderboard
- Demo entries use IDs prefixed `demo_` and can be bulk-deleted with: `DELETE FROM entries WHERE id LIKE 'demo_%';`
- Foreign key constraint on `orgId` — must reference a real clubs.id
- **Planned columns (not yet added)** for AI photo verification: `ai_extracted_distance`, `ai_verification_confidence`, `ai_verification_flag` (bool), `ai_verification_notes`

---

## 📁 File Structure

### Core App Files
```
_app.jsx            — root app, GA4 scripts, shared state, login/register/submit logic
_document.jsx       — custom Next.js document
middleware.js       — blocks AI crawlers at the edge (GPTBot, ClaudeBot, etc.)
                      does NOT affect GA4 (client-side) or normal users
```

### pages/ — Core Routes
```
index.jsx                         — homepage: weekly + all-time category leaders, hero, FAQ
leaderboard.jsx                   — full leaderboard with filters, week nav, all-time hero
submit.jsx                        — drive submission form (simulator weekly limit enforced)
register.jsx                      — club/simulator registration
login.jsx                         — login page
dashboard.jsx                     — user/club dashboard
contact.jsx                       — contact page
longest-drives-this-week.jsx      — this week's top drives
how-to-register-page.jsx          — registration guide
                                    ⚠️ URL is /how-to-register-page (note trailing -page)
test-db.jsx                       — dev/debug page ⚠️ remove or protect before launch

drive/
  [id].jsx                        — individual drive page (rippingbombs.com/drive/[id])

clubs/
  index.jsx                       — clubs listing page
  [slug].jsx                      — individual club page (rippingbombs.com/clubs/[slug])
```

### pages/api/
```
send-email.js       — Resend email handler. Accepts POST with { type, ...payload }.
                      Supported types:
                        'registration' — sends notification to team@ + welcome to registrant
                        'approval'     — sends approval confirmation to club email
                        'contact'      — sends contact/enquiry notification to team@
                      All emails send from team@rippingbombs.com (domain verified via Cloudflare)
```

### pages/ — SEO Content Pages
These pages target organic search traffic for golf-related keywords:
```
average-driver-distance-by-handicap.jsx
average-golf-drive-distance.jsx
golf-club-longest-drive-competition-ideas.jsx
golf-handicap-driving-distance.jsx
golf-longest-drive-competition.jsx
how-is-golf-evolving.jsx
how-to-hit-a-golf-ball-farther.jsx
how-to-promote-your-golf-event.jsx
long-drive-golf-equipment.jsx
longest-drive-amateur.jsx
longest-drive-australia.jsx
longest-drive-canada.jsx
longest-drive-china.jsx
longest-drive-germany.jsx
longest-drive-high-handicap.jsx
longest-drive-india.jsx
longest-drive-ireland.jsx
longest-drive-japan.jsx
longest-drive-juniors-13-16.jsx
longest-drive-juniors-17-18.jsx
longest-drive-juniors-u12.jsx
longest-drive-low-handicap.jsx
longest-drive-mexico.jsx
longest-drive-mid-handicap.jsx
longest-drive-nigeria.jsx
longest-drive-over-50.jsx
longest-drive-portugal.jsx
longest-drive-scratch-golfer.jsx
longest-drive-seniors.jsx
longest-drive-south-africa.jsx
longest-drive-sweden.jsx
longest-drive-uae.jsx
longest-drive-uk.jsx
longest-drive-usa.jsx
longest-golf-drive-ever.jsx
longest-mens-drive.jsx
longest-womens-drive.jsx
popularity-of-golf.jsx
recommended-range-finders.jsx
what-is-a-good-drive-in-golf.jsx
```

### components/
```
Layout.jsx          — site-wide nav and footer (footer has inline enquiry form → send-email API)
AdminPanel.jsx      — admin dashboard (password protected, has logout button)
EntryModal.jsx      — drive detail popup
ShareModal.jsx      — social share popup with canvas image generation
UI.jsx              — shared UI primitives (Card, Field, Btn, Overlay, BadgePill, countryFlag)
EmailSignup.jsx     — email capture component (sends to team@ via send-email API)
DemoSubmit.jsx      — demo drive submission (no login required)
LaunchModal.jsx     — launch announcement modal
Logo.jsx            — logo component
SeoPageLayout.jsx   — shared layout wrapper for SEO content pages
```

### lib/
```
data.js             — initData(), db.insertOrg(), db.insertEntry()
supabaseClient.js   — Supabase client initialisation
constants.js        — design tokens (SANS, DISP, ORG, TXT, MUT, BG2, BG3, BDR, DIM)
                      utility functions (todayStr, fmtDate, tier, toB64, nowWeek,
                      weekLabel, prevWeek, nextWeek, sameWeek)
                      ⚠️ EJS constants have been removed — do not re-add
email.js            — sendRegistrationNotification(), sendApprovalEmail()
                      Both call /api/send-email internally via fetch — no client-side secrets
```

### public/
```
robots.txt          — allows all crawlers except blocked AI agents (handled in middleware)
```

---

## 🧱 Core Features

### 1. Club / Simulator Registration
- Two account types: `club` (requires admin approval) and `simulator` (auto-approved)
- Simulator accounts are limited to one submission per week
- On registration: team@ gets a notification, registrant gets a welcome email
- On club approval: club gets an approval confirmation email

### 2. Drive Submission
- Club accounts: submit for named players with tournament, club, hcp, age, gender, photo
- Simulator accounts: player name and tournament locked to account values
- Photo evidence required for all submissions
- Consent checkbox required before submitting

### 3. Leaderboard
- Weekly view (default) and all-time toggle
- Filters: player name, gender, country, handicap band, age group, club brand, entry type, sort order
- All-time hero block shows record holder (including simulators) — clickable with flag, opens EntryModal, has share button
- Week navigation (prev/next arrows)

### 4. Homepage Category Leaders
- **Weekly leaders** (primary): best drive per category for the current ISO week
- **All-time leaders** (secondary): record holder per category across all time
- Categories:
  - Men (age 16–54, hcp < 20)
  - Men High Handicap (age 16–54, hcp ≥ 20)
  - Women (age 16–54, hcp < 20)
  - Women High Handicap (age 16–54, hcp ≥ 20)
  - Youth (age < 16)
  - Senior (age ≥ 55)

### 5. Admin Panel
- Password protected (stored in localStorage as `rb_admin_auth`)
- Accessible via hidden nav trigger
- Has logout button in header bar
- Manages pending club approvals and entry moderation

### 6. Social Sharing
- ShareModal generates a 1080×1080 canvas image with drive stats
- Share to WhatsApp, Facebook, Instagram (download), or copy link
- Each drive has a unique URL: `rippingbombs.com/drive/[id]`

### 7. AI Photo Verification (planned, not yet built)
- On submission, the uploaded screenshot is sent to Claude Haiku (vision) via a new API route, e.g. `pages/api/verify-drive-photo.js`
- Haiku extracts the distance shown in the screenshot and compares it to the value the player typed
- Mismatches or low-confidence extractions are flagged for manual admin review — never auto-rejected, to avoid false positives against legitimate submissions
- Also does a basic sanity check that the image looks like a real sim/launch monitor UI (Trackman, GCQuad, Foresight, etc.) rather than an unrelated or obviously edited image
- Estimated cost: ~$0.0025 per verification call (Haiku pricing $1/M input, $5/M output) — negligible until volume reaches thousands of submissions/month
- Depends on the Supabase Storage migration below (needs a stable image URL/signed URL to pass to the API, rather than base64)

### 8. Email System (Resend)
- All emails sent server-side via `pages/api/send-email.js`
- Sending domain: `rippingbombs.com` — verified via Cloudflare DNS auto-config
- From address: `team@rippingbombs.com`
- API key stored in Vercel environment variables as `RESEND_API_KEY`
- Also add to `.env.local` for local development
- Three email types: `registration`, `approval`, `contact`

---

## 🌱 Demo Data Conventions
Reference this section to generate/insert new demo entries without needing the full DB dump shared each time.

### `entries` table — demo row conventions
- `id`: string, prefixed `demo_` + incrementing number (e.g. `demo_1045`). **Always check the current max `demo_` id in the live DB before inserting a new batch** — a CSV export can be stale and cause a duplicate-key error. Run this first: `SELECT id FROM entries WHERE id LIKE 'demo_%' ORDER BY CAST(SUBSTRING(id FROM 6) AS INTEGER) DESC LIMIT 1;` then start the new batch at least 100+ above that number to leave headroom.
- `orgId`: must be a real `clubs.id`. Known-valid club IDs already used by demo data: `o1, o3, o4, o5, o6, o7, o8, o9, o10, o12, o14, o15, o16`. `o6` is the primary demo club and can be reused most often; spread the rest across the others for variety.
- `photo`: empty string `''` for demo rows (no fake base64 images).
- `is_simulator`: `false` for standard club demo rows (`true` is reserved for realistic simulator-account submissions like the few real/live entries).
- `facility`, `venueId`, `avatarUrl`, `venue_id`, `facility_name`, `player_email`: leave empty for demo rows.
- `tournament`: pick from existing pool — `Weekly Open, Club Championship, End of Month Cup, Founders Cup, July Invitational, Members Cup, Mid-Month Classic, Spring Classic, Summer Series, Summer Slam, Weekend Skins, Simulator Series`.
- `club`: realistic current driver models, e.g. TaylorMade Stealth 2/Qi10, Callaway Paradym/Rogue ST, Titleist TSR2/TSR3, Ping G425/G430, Cobra Darkspeed, Mizuno ST-Z 230, Wilson Dynapower, Srixon ZX5.
- `date`: ISO `YYYY-MM-DD`, spread across the demo period (Jan–Aug 2026 so far) rather than clustering on one day.

### Category definitions (mirrors homepage/leaderboard logic)
| Category | Age | Handicap | Gender |
|---|---|---|---|
| Men | 16–54 | < 20 | male |
| Men High Handicap | 16–54 | ≥ 20 | male |
| Women | 16–54 | < 20 | female |
| Women High Handicap | 16–54 | ≥ 20 | female |
| Youth | < 16 | any | any |
| Senior | ≥ 55 | any | any |

### Realistic "not huge" distance ranges (yards) for demo rows
Keep demo drives modest/plausible — avoid record-setting numbers so they don't distort the all-time leaderboard:
- Men: 195–260
- Women: 160–215
- Men High Handicap: 150–205
- Women High Handicap: 125–175
- Youth: 95–165
- Senior: 150–215

### Bulk operations
- Delete all demo data: `DELETE FROM entries WHERE id LIKE 'demo_%';`
- To add a new batch: generate rows following the ranges/conventions above, continuing the `demo_` id sequence, and insert via SQL (`INSERT INTO entries (id, "orgId", player, dist, club, hcp, age, photo, date, tournament, gender, is_simulator) VALUES (...)`) or the Supabase table editor — no need to share the live DB export to do this, this section has what's needed.

---

## 🚨 Known Issues & Legacy Items
- `how-to-register-page.jsx` has a `-page` suffix in the filename, making its URL `/how-to-register-page` not `/how-to-register` — rename if needed
- `test-db.jsx` is a dev page — remove or password-protect before launch
- Passwords stored in plain text in Supabase (no auth system yet)
- Photos stored as base64 strings in the database (not cloud storage)
- No real-time updates — page must be refreshed to see new entries
- Some legacy `dist` values stored as strings — always use `Number(e.dist)` when sorting

---

## 🔄 Development Rules
1. Keep changes minimal and incremental
2. Do not introduce unnecessary complexity
3. Avoid replacing architecture unless explicitly requested
4. Preserve current UI/UX unless redesign is requested
5. Ask before introducing new infrastructure (auth, DB changes, new tables)
6. Always use `Number()` when comparing or sorting `dist` or any numeric field from entries
7. Never import `sendEmail` or any EJS constants — these have been removed. Use `sendRegistrationNotification` or `sendApprovalEmail` from `lib/email.js`, or fetch `/api/send-email` directly with a `type` of `contact`

---

## 🧠 AI Development Instructions
- Always read this file first before making any changes
- Do not assume missing context — ask for the relevant file
- Do not redesign the system unless asked
- Prioritise consistency with existing structure (inline styles, design tokens from constants.js)
- The site uses a dark theme throughout — background #0e0e0e, accent colour #a3e635 (ORG)

---

## 🎯 Launch & Roadmap
- **Launch date**: September 2026
- **Current state**: Live on Vercel with demo data, accepting real submissions
- **Next priorities**:
  - Proper image storage via Supabase Storage buckets — private bucket, signed URLs, replaces base64-in-DB
  - AI photo verification (Claude Haiku vision) — flags distance mismatches for manual admin review; depends on Storage migration above
  - Authentication system to replace plain-text passwords
  - Real-time updates (Supabase subscriptions)
  - Individual player profile pages (`/drive/[id]`) ← drive/[id].jsx already exists
