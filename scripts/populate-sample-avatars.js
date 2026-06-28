/**
 * Populates avatarUrl for sample/seed accounts in the `clubs` table
 * using randomuser.me — deterministic per-account via the `seed` param,
 * so re-running this script always assigns the same photo to the same account.
 *
 * Gender-matched: uses the account's `gender` column (simulator accounts
 * only) to request a male or female photo from randomuser.me, so the
 * avatar always matches the account's stated gender.
 *
 * Usage:
 *   node scripts/populate-sample-avatars.js
 *
 * IMPORTANT: adjust the WHERE filter below (see "TARGET FILTER") so this
 * only touches your sample/seed accounts, not real registered users who
 * may have already uploaded their own photo.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DELAY_MS = 250; // be polite to the free API — ~4 req/sec

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRandomUserPhoto(seed, gender) {
  const params = new URLSearchParams({ seed });
  if (gender === 'male' || gender === 'female') {
    params.set('gender', gender);
  }

  const res = await fetch(`https://randomuser.me/api/?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`randomuser.me request failed: ${res.status}`);
  }

  const data = await res.json();
  const user = data.results?.[0];
  if (!user?.picture?.large) {
    throw new Error('No picture returned for seed: ' + seed);
  }

  return user.picture.large;
}

async function main() {
  // ── TARGET FILTER ────────────────────────────────────────────────
  // Adjust this to match however your sample/seed accounts are identified.
  // Examples:
  //   .eq('is_sample', true)              -- if you have a sample flag
  //   .like('email', '%@example.com')      -- if seed accounts share a domain
  //   .is('avatarUrl', null)                -- only fill in accounts with no photo yet (safe default)
  const { data: clubs, error } = await supabase
    .from('clubs')
    .select('id, fullName, accountType, gender')
    .is('avatarUrl', null)
    .eq('accountType', 'simulator'); // individual player accounts only — clubs use org.logo instead

  if (error) {
    console.error('Failed to fetch clubs:', error.message);
    process.exit(1);
  }

  console.log(`Found ${clubs.length} accounts without an avatar.`);

  let success = 0;
  let failed = 0;
  let skippedNoGender = 0;

  for (const club of clubs) {
    try {
      // Use the account's own gender field so the avatar matches.
      // Falls back to letting randomuser.me pick at random only if
      // gender is missing/unset on this row (logged below so you can
      // spot data-quality gaps in your seed data).
      if (club.gender !== 'male' && club.gender !== 'female') {
        skippedNoGender++;
        console.warn(`⚠ ${club.fullName} (${club.id}) has no valid gender set — photo will be randomly picked`);
      }

      const avatarUrl = await fetchRandomUserPhoto(club.id, club.gender);

      const { error: updateError } = await supabase
        .from('clubs')
        .update({ avatarUrl })
        .eq('id', club.id);

      if (updateError) {
        console.error(`Failed to update ${club.fullName}:`, updateError.message);
        failed++;
      } else {
        console.log(`✓ ${club.fullName} (${club.gender || 'unknown'}) → ${avatarUrl}`);
        success++;
      }
    } catch (err) {
      console.error(`Error for ${club.fullName}:`, err.message);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${success} updated, ${failed} failed, ${skippedNoGender} had no gender set.`);
}

main();
