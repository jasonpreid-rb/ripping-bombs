// lib/venueDisplayData.js
//
// Shared data layer for the venue TV/screen leaderboard display.
// Used by:
//   - pages/api/venue-display/[slug].js  (client polling, JSON)
//   - pages/venue-display/[slug].jsx     (SSR first paint)
//
// SCHEMA THIS IS WRITTEN AGAINST (confirmed from real table dumps):
//
// entries: id, orgId, player, dist, club, hcp, age, photo, date,
//          tournament, gender, is_simulator, facility, venueId, avatarUrl
//   - orgId   -> clubs.id : the account that OWNS this entry (individual
//                player's own account, or the club account that logged it).
//                This is what carries country/location.
//   - venueId -> clubs.id : the physical venue the drive was played at.
//                This is what a venue's TV display should filter on.
//                Can be null (e.g. a home-simulator entry with no venue
//                attached) - in that case we fall back to orgId, since for
//                a club-submitted entry orgId usually *is* the venue.
//
// clubs: id, fullName, position, courseName, location, country, email, pw,
//        logo, status, badge, accountType, simulator, gender,
//        is_founding_member, profile_consent, instagram, tiktok, twitter,
//        youtube, profileConsent, created_at, avatarUrl, customSlug,
//        sponsorName, sponsorLogoUrl, sponsorLink
//   - This table holds BOTH individual "simulator" accounts and "club"
//     venue accounts (accountType distinguishes them).
//   - country is a 2-letter code (e.g. "US") - matches the FLAGS map below.
//   - courseName is the venue/course display name for club accounts;
//     falls back to fullName for individual accounts.
//   - sponsorName/sponsorLogoUrl/sponsorLink: set by a club/venue account
//     from their dashboard, used to render an optional sponsor banner at
//     the top of that venue's TV display. Never set for entries lookups —
//     only relevant for the venue's own club row.
//
// No column names are quoted in the queries below - the Supabase JS client
// takes plain column name strings, not raw SQL identifiers. (An earlier
// draft of this file wrapped names in literal quote characters, which is
// wrong for postgrest and would have silently broken every query - fixed.)

export const FLAGS_SOURCE_NOTE = 'country comes from clubs.country via entries.orgId';

const ROWS_PER_COLUMN = 5;

// Division definitions - edit this array to add/remove divisions.
// Keep in sync with whatever the weekly social image system uses, so the
// TV display and the Monday social cards agree with each other.
export const DIVISIONS = [
  {
    key: 'overall',
    label: 'Overall',
    title: 'Longest Drives',
    sub: 'This week · Overall division',
    filter: () => true,
  },
  {
    key: 'low',
    label: 'Low Handicap',
    title: 'Low HCP Division',
    sub: 'HCP 0–16',
    filter: (e) => e.hcp != null && e.hcp <= 16,
  },
  {
    key: 'women',
    label: 'Women',
    title: "Women's Division",
    sub: 'This week · All handicaps',
    filter: (e) => e.gender === 'female',
  },
  {
    key: 'seniors',
    label: 'Seniors',
    title: 'Seniors Division',
    sub: 'This week · Age 55+',
    filter: (e) => e.age != null && e.age >= 55,
  },
];

// ISO week number, e.g. 32
export function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Monday 00:00:00 UTC -> Sunday 23:59:59 UTC for the current ISO week
export function currentWeekRange(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 1); // Monday this week
  const start = new Date(d);
  const end = new Date(d);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

function effectiveVenueId(entry) {
  return entry.venueId || entry.orgId;
}

function topN(entries, filterFn, n = ROWS_PER_COLUMN) {
  return entries
    .filter(filterFn)
    .sort((a, b) => b.dist - a.dist)
    .slice(0, n);
}

function toRow(entry, { showVenueMeta = false } = {}) {
  return {
    name: entry.player,
    countryCode: entry.country || null,
    meta: showVenueMeta
      ? entry.venueLabel || ''
      : (entry.hcp != null ? `HCP ${entry.hcp}` : ''),
    distance: entry.dist,
    photo: entry.avatarUrl || entry.photo || null,
  };
}

/**
 * Fetches everything the TV display needs for one venue:
 * this-week venue entries, this-week global entries, and all-time
 * venue entries, each pre-split into the configured divisions, plus
 * the venue's own sponsor banner settings (if any).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} clubId - clubs.id for the venue this display belongs to
 * @param {string} venueName
 */
export async function getVenueDisplayData(supabase, clubId, venueName) {
  const { start, end } = currentWeekRange();

  const [weekRes, allTimeRes, venueRowRes] = await Promise.all([
    // Every entry this week, across all venues. We slice this in JS into
    // "this venue" vs "global" so we only hit the DB once for both.
    supabase
      .from('entries')
      .select('id, orgId, player, dist, hcp, age, gender, photo, avatarUrl, venueId, date')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString()),

    // All-time entries for just this venue. venueId is the primary match;
    // entries with no venueId fall back to orgId === clubId (a club account
    // logging its own drives directly has no separate "venue" record).
    supabase
      .from('entries')
      .select('id, orgId, player, dist, hcp, age, gender, photo, avatarUrl, date')
      .or(`venueId.eq.${clubId},and(venueId.is.null,orgId.eq.${clubId})`),

    // The venue's own row, for sponsor banner settings.
    supabase
      .from('clubs')
      .select('sponsorName, sponsorLogoUrl, sponsorLink')
      .eq('id', clubId)
      .single(),
  ]);

  const weekEntries = weekRes.data || [];
  const allTimeEntries = allTimeRes.data || [];
  const sponsor = venueRowRes.data || null;

  // Resolve country + venue display name for every distinct account we saw,
  // in one batch query, rather than one lookup per entry.
  const idsNeeded = new Set();
  weekEntries.forEach((e) => {
    idsNeeded.add(e.orgId);
    idsNeeded.add(effectiveVenueId(e));
  });
  allTimeEntries.forEach((e) => idsNeeded.add(e.orgId));

  const { data: accounts } = await supabase
    .from('clubs')
    .select('id, courseName, fullName, location, country')
    .in('id', Array.from(idsNeeded).filter(Boolean));

  const accountMap = new Map((accounts || []).map((a) => [a.id, a]));

  function labelFor(id) {
    const acc = accountMap.get(id);
    if (!acc) return '';
    const name = acc.courseName || acc.fullName || '';
    const place = [acc.location, acc.country].filter(Boolean).join(', ');
    return place || name;
  }

  const enrichedWeek = weekEntries.map((e) => ({
    ...e,
    country: accountMap.get(e.orgId)?.country || null,
    venueLabel: labelFor(effectiveVenueId(e)),
  }));

  const enrichedAllTime = allTimeEntries.map((e) => ({
    ...e,
    country: accountMap.get(e.orgId)?.country || null,
  }));

  const venueWeek = enrichedWeek.filter((e) => effectiveVenueId(e) === clubId);
  const globalWeek = enrichedWeek;

  const divisions = DIVISIONS.map((div) => ({
    key: div.key,
    eyebrow: div.label,
    title: div.title,
    sub: div.sub,
    unit: 'YDS',
    venue: topN(venueWeek, div.filter).map((e) => toRow(e)),
    global: topN(globalWeek, div.filter).map((e) => toRow(e, { showVenueMeta: true })),
    allTime: topN(enrichedAllTime, div.filter).map((e) => ({
      ...toRow(e),
      meta: e.date
        ? `Set ${new Date(e.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
        : '',
    })),
  }));

  return {
    week: isoWeek(new Date()),
    venueName,
    divisions,
    sponsor: sponsor && sponsor.sponsorLogoUrl
      ? {
          name: sponsor.sponsorName || null,
          logoUrl: sponsor.sponsorLogoUrl,
          link: sponsor.sponsorLink || null,
        }
      : null,
    fetchedAt: new Date().toISOString(),
  };
}
