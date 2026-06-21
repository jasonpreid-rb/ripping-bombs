/**
 * add-internal-links.js
 * One-time codemod: adds contextual in-paragraph links + a bottom
 * "Explore Related Pages" block to every SEO page in /pages.
 *
 * USAGE (from project root, C:\dev\rippingbombs):
 *   node add-internal-links.js
 *
 * Safe to re-run — pages already processed (containing the
 * "Explore Related Pages" marker) are skipped automatically.
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(process.cwd(), 'pages');
const MARKER = 'Explore Related Pages';

// ---------------------------------------------------------------
// 1. Page registry — file, human label, and category tags.
//    A page links to other pages that share at least one tag.
// ---------------------------------------------------------------
const REGISTRY = [
  ['average-driver-distance-by-handicap.jsx', 'Average Driver Distance By Handicap', ['handicap','distance','data']],
  ['average-golf-drive-distance.jsx', 'Average Golf Drive Distance', ['distance','data']],
  ['golf-club-longest-drive-competition-ideas.jsx', 'Longest Drive Competition Ideas', ['organizer','competition']],
  ['golf-handicap-driving-distance.jsx', 'Golf Handicap And Driving Distance', ['handicap','distance','data']],
  ['golf-longest-drive-competition.jsx', 'Golf Longest Drive Competition', ['competition','organizer']],
  ['how-is-golf-evolving.jsx', 'How Is Golf Evolving', ['trends']],
  ['how-to-hit-a-golf-ball-farther.jsx', 'How To Hit A Golf Ball Farther', ['technique','distance']],
  ['how-to-promote-your-golf-event.jsx', 'How To Promote Your Golf Event', ['organizer','competition']],
  ['long-drive-golf-equipment.jsx', 'Long Drive Golf Equipment', ['equipment','technique']],
  ['longest-drive-amateur.jsx', 'Longest Drive Amateur', ['amateur','competition']],
  ['longest-drive-australia.jsx', 'Longest Drive Australia', ['country']],
  ['longest-drive-canada.jsx', 'Longest Drive Canada', ['country']],
  ['longest-drive-china.jsx', 'Longest Drive China', ['country']],
  ['longest-drive-germany.jsx', 'Longest Drive Germany', ['country']],
  ['longest-drive-high-handicap.jsx', 'Longest Drive High Handicap', ['handicap']],
  ['longest-drive-india.jsx', 'Longest Drive India', ['country']],
  ['longest-drive-ireland.jsx', 'Longest Drive Ireland', ['country']],
  ['longest-drive-japan.jsx', 'Longest Drive Japan', ['country']],
  ['longest-drive-juniors-13-16.jsx', 'Longest Drive Juniors 13-16', ['junior']],
  ['longest-drive-juniors-17-18.jsx', 'Longest Drive Juniors 17-18', ['junior']],
  ['longest-drive-juniors-u12.jsx', 'Longest Drive Juniors U12', ['junior']],
  ['longest-drive-low-handicap.jsx', 'Longest Drive Low Handicap', ['handicap']],
  ['longest-drive-mexico.jsx', 'Longest Drive Mexico', ['country']],
  ['longest-drive-mid-handicap.jsx', 'Longest Drive Mid Handicap', ['handicap']],
  ['longest-drive-nigeria.jsx', 'Longest Drive Nigeria', ['country']],
  ['longest-drive-over-50.jsx', 'Longest Drive Over 50', ['senior']],
  ['longest-drive-portugal.jsx', 'Longest Drive Portugal', ['country']],
  ['longest-drive-scratch-golfer.jsx', 'Longest Drive Scratch Golfer', ['handicap','amateur']],
  ['longest-drive-seniors.jsx', 'Longest Drive Seniors', ['senior']],
  ['longest-drive-south-africa.jsx', 'Longest Drive South Africa', ['country']],
  ['longest-drive-sweden.jsx', 'Longest Drive Sweden', ['country']],
  ['longest-drive-uae.jsx', 'Longest Drive UAE', ['country']],
  ['longest-drive-uk.jsx', 'Longest Drive UK', ['country']],
  ['longest-drive-usa.jsx', 'Longest Drive USA', ['country']],
  ['longest-golf-drive-ever.jsx', 'Longest Golf Drive Ever', ['record','amateur']],
  ['longest-mens-drive.jsx', 'Longest Mens Drive', ['gender']],
  ['longest-womens-drive.jsx', 'Longest Womens Drive', ['gender']],
  ['popularity-of-golf.jsx', 'Popularity Of Golf', ['trends']],
  ['recommended-range-finders.jsx', 'Recommended Range Finders', ['equipment']],
  ['sim-distance-real-or-fake.jsx', 'Is Your Sim Distance Real Or Fake', ['simulator','technique']],
  ['simulator-golf-league.jsx', 'Simulator Golf League', ['simulator','competition']],
  ['supported-simulators.jsx', 'Supported Simulators', ['simulator','equipment']],
  ['how-far-do-i-drive-compared-to-others.jsx', 'Driving Distance Percentile Calculator', ['distance','data']],
  ['hall-of-fame.jsx', 'Hall Of Fame', ['record','amateur']],
  ['what-is-a-good-drive-in-golf.jsx', 'What Is A Good Drive In Golf', ['distance','technique']],
];

const byFile = new Map(REGISTRY.map(r => [r[0], { label: r[1], tags: r[2] }]));

// ---------------------------------------------------------------
// 2. Keyword -> target file, for in-paragraph contextual links.
//    Only the FIRST matching, not-already-linked occurrence per
//    keyword per file is converted, max 3 per file.
// ---------------------------------------------------------------
const KEYWORD_LINKS = [
  [/\bhandicap\b/i, 'golf-handicap-driving-distance.jsx', 'handicap'],
  [/\bsimulator(s)?\b/i, 'supported-simulators.jsx', 'simulator'],
  [/\bjunior(s)?\b/i, 'longest-drive-juniors-13-16.jsx', 'junior'],
  [/\bsenior(s)?\b/i, 'longest-drive-seniors.jsx', 'senior'],
  [/\baverage (driver|drive) distance\b/i, 'average-golf-drive-distance.jsx', 'distance'],
  [/\bpercentile\b|\bcompared to others\b/i, 'how-far-do-i-drive-compared-to-others.jsx', 'distance'],
  [/\bregister\b/i, 'register.jsx', null],
  [/\bleaderboard\b/i, 'leaderboard.jsx', null],
];

// ---------------------------------------------------------------
// 3. Helpers
// ---------------------------------------------------------------
function relatedPages(file, max = 6) {
  const me = byFile.get(file);
  if (!me) return [];
  const scored = REGISTRY
    .filter(([f]) => f !== file)
    .map(([f, label, tags]) => ({
      file: f,
      label,
      score: tags.filter(t => me.tags.includes(t)).length,
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, max);
}

function toRoute(file) {
  return '/' + file.replace(/\.jsx$/, '');
}

function ensureLinkImport(src) {
  if (/from ['"]next\/link['"]/.test(src)) return src;
  return `import Link from 'next/link';\n${src}`;
}

function ensureLinkStyle(src) {
  if (/const linkStyle/.test(src)) return src;
  if (!/from ['"]\.\.\/lib\/constants['"]/.test(src)) {
    // inject ORG import right after the SeoPageLayout import line
    src = src.replace(
      /(import\s*{[^}]*}\s*from\s*['"]\.\.\/components\/SeoPageLayout['"];?\n)/,
      `$1import { ORG } from '../lib/constants';\n`
    );
  }
  src = src.replace(
    /(export default function Page\(\))/,
    `const linkStyle = { color: ORG, textDecoration: 'underline' };\n\n$1`
  );
  return src;
}

function addContextualLinks(src, file) {
  let count = 0;
  for (const [regex, targetFile, ] of KEYWORD_LINKS) {
    if (count >= 3) break;
    if (targetFile === file) continue; // don't link to self
    if (!byFile.has(targetFile) && targetFile !== 'register.jsx' && targetFile !== 'leaderboard.jsx') continue;

    // skip if this exact target already linked somewhere in file
    const route = toRoute(targetFile);
    if (src.includes(`href="${route}"`)) continue;

    // only replace inside <SeoP>...</SeoP> blocks, first match, not already inside a <Link>
    const seoPRegex = /(<SeoP>)([^]*?)(<\/SeoP>)/;
    let replaced = false;
    src = src.replace(seoPRegex, (full, open, body, close) => {
      if (replaced || body.includes('<Link')) return full;
      if (regex.test(body)) {
        const newBody = body.replace(regex, (m) => `<Link href="${route}" style={linkStyle}>${m}</Link>`);
        if (newBody !== body) {
          replaced = true;
          count++;
          return open + newBody + close;
        }
      }
      return full;
    });
  }
  return src;
}

function buildExploreBlock(file) {
  const related = relatedPages(file);
  if (related.length === 0) return null;
  const links = related
    .map(r => `        <Link href="${toRoute(r.file)}" style={linkStyle}>${r.label}</Link>`)
    .join(`{' · '}\n`);
  return `
      <SeoH2>${MARKER}</SeoH2>
      <SeoP>
${links}
      </SeoP>`;
}

function insertExploreBlock(src, file) {
  if (src.includes(MARKER)) return src; // already processed
  const block = buildExploreBlock(file);
  if (!block) return src;

  if (src.includes('<SeoCTA')) {
    src = src.replace(/(<SeoCTA\s*\/>)/, `${block}\n      $1`);
  } else {
    // fallback: insert before closing </SeoPage>
    src = src.replace(/(<\/SeoPage>)/, `${block}\n    $1`);
  }
  return src;
}

// ---------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------
function main() {
  if (!fs.existsSync(PAGES_DIR)) {
    console.error(`Could not find pages/ at ${PAGES_DIR}. Run this from your project root.`);
    process.exit(1);
  }

  let touched = 0, skipped = 0, missing = 0;

  for (const [file] of REGISTRY) {
    const fp = path.join(PAGES_DIR, file);
    if (!fs.existsSync(fp)) {
      console.log(`SKIP (not found): ${file}`);
      missing++;
      continue;
    }

    let src = fs.readFileSync(fp, 'utf8');

    if (src.includes(MARKER)) {
      console.log(`SKIP (already linked): ${file}`);
      skipped++;
      continue;
    }

    src = ensureLinkImport(src);
    src = ensureLinkStyle(src);
    src = addContextualLinks(src, file);
    src = insertExploreBlock(src, file);

    fs.writeFileSync(fp, src, 'utf8');
    console.log(`UPDATED: ${file}`);
    touched++;
  }

  console.log(`\nDone. Updated ${touched}, skipped ${skipped}, missing ${missing}.`);
  console.log(`Review with: git diff pages/`);
}

main();
