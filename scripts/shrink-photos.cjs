// scripts/shrink-photos.cjs
//
// One-off: shrinks the existing drive evidence photos in entries.photo.
// They were stored as raw base64 data URIs with no resizing, so each drive
// popup downloaded several MB. New uploads are already compressed in the
// browser (lib/image.js); this brings the old ones into line.
//
// SAFE BY DEFAULT: it only reports what it WOULD do. Nothing is written until
// you pass --apply. With --apply, every original photo is saved to
// ./photo-backups/<entry id>.txt BEFORE the row is updated, so any single
// photo can be restored.
//
// Setup (once):   npm install --save-dev sharp
// Dry run:        node scripts\shrink-photos.cjs
// Try 3 first:    node scripts\shrink-photos.cjs --apply --limit=3
// Do them all:    node scripts\shrink-photos.cjs --apply
//
// Options:
//   --apply        actually write changes (default is a dry run)
//   --limit=N      stop after N photos have been (or would be) shrunk
//   --min-kb=400   skip photos already smaller than this (default 400)
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — read from
// .env.local in the project folder, same as the API routes.
// Add `photo-backups/` to .gitignore so the backups never get pushed.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const MAX_DIM = 1600;
const QUALITY = 78;
const MIN_SAVING = 0.8; // only replace if the new file is under 80% of the old size

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = path.join(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

function parseArgs() {
  const args = { apply: false, limit: Infinity, minKb: 400 };
  for (const a of process.argv.slice(2)) {
    if (a === '--apply') args.apply = true;
    else if (a.startsWith('--limit=')) args.limit = Number(a.split('=')[1]) || Infinity;
    else if (a.startsWith('--min-kb=')) args.minKb = Number(a.split('=')[1]) || 400;
  }
  return args;
}

const kb = (n) => `${Math.round(n / 1024)} KB`;

// Returns { uri, bytes } for the shrunk JPEG, or null if the photo can't be
// parsed or wouldn't get meaningfully smaller.
async function shrink(photo, minBytes) {
  const m = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/is.exec(photo || '');
  if (!m) return { skip: 'not a base64 image' };
  const original = Buffer.from(m[2], 'base64');
  if (original.length <= minBytes) return { skip: 'already small', originalBytes: original.length };

  const out = await sharp(original, { failOn: 'none' })
    .rotate() // apply EXIF orientation, since the metadata is dropped below
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  if (out.length > original.length * MIN_SAVING) return { skip: 'no meaningful saving', originalBytes: original.length };
  return { uri: `data:image/jpeg;base64,${out.toString('base64')}`, originalBytes: original.length, newBytes: out.length };
}

async function main() {
  loadEnv();
  const { apply, limit, minKb } = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (expected in .env.local)');
  const supabase = createClient(url, key);

  console.log(apply ? 'APPLY MODE — photos will be updated (originals backed up first)\n' : 'DRY RUN — nothing will be changed. Re-run with --apply to write.\n');

  // 1) All entry ids that have a photo (ids only — cheap), paged.
  const ids = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('entries').select('id').not('photo', 'is', null).order('id').range(from, from + 999);
    if (error) throw error;
    ids.push(...data.map((r) => r.id));
    if (data.length < 1000) break;
  }
  console.log(`${ids.length} entries have a photo.\n`);

  const backupDir = path.join(process.cwd(), 'photo-backups');
  if (apply) fs.mkdirSync(backupDir, { recursive: true });

  let shrunk = 0, before = 0, after = 0, skipped = 0, failed = 0;

  // 2) One at a time — these rows are big, so no parallel fetching.
  for (const id of ids) {
    if (shrunk >= limit) break;
    try {
      const { data, error } = await supabase.from('entries').select('photo').eq('id', id).single();
      if (error) throw error;

      const r = await shrink(data.photo, minKb * 1024);
      if (!r.uri) { skipped++; continue; }

      console.log(`${id}: ${kb(r.originalBytes)} -> ${kb(r.newBytes)}`);
      before += r.originalBytes; after += r.newBytes; shrunk++;

      if (apply) {
        fs.writeFileSync(path.join(backupDir, `${String(id).replace(/[^\w.-]/g, '_')}.txt`), data.photo);
        const { error: upErr } = await supabase.from('entries').update({ photo: r.uri }).eq('id', id);
        if (upErr) throw upErr;
      }
    } catch (err) {
      failed++;
      console.error(`${id}: FAILED — ${err.message || err}`);
    }
  }

  console.log(`\n${apply ? 'Shrunk' : 'Would shrink'} ${shrunk} photo(s): ${kb(before)} -> ${kb(after)} (saves ${kb(before - after)}).`);
  console.log(`Skipped ${skipped} (already small / not a base64 image / no saving). Failed: ${failed}.`);
  if (apply && shrunk) console.log(`Originals saved in ${backupDir}`);
}

module.exports = { shrink };

if (require.main === module) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
