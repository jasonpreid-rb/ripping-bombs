const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'pages');

let fixed = 0;
let alreadyOk = 0;

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.jsx')) continue;
  const fp = path.join(dir, file);
  let src = fs.readFileSync(fp, 'utf8');

  // Only care about files that actually use linkStyle/ORG
  if (!src.includes('linkStyle') && !/\bORG\b/.test(src)) continue;

  // Find an existing import from '../lib/constants'
  const importRegex = /import\s*{\s*([^}]*)\s*}\s*from\s*['"]\.\.\/lib\/constants['"];?/;
  const match = src.match(importRegex);

  if (match) {
    const names = match[1].split(',').map(s => s.trim()).filter(Boolean);
    const hasOrg = names.some(n => n === 'ORG');
    if (hasOrg) {
      alreadyOk++;
      continue;
    }
    // Add ORG into the existing destructure list
    const newNames = [...names, 'ORG'].join(', ');
    const newImportLine = `import { ${newNames} } from '../lib/constants';`;
    src = src.replace(importRegex, newImportLine);
    fs.writeFileSync(fp, src, 'utf8');
    console.log('Fixed (merged into existing import):', file);
    fixed++;
  } else {
    // No constants import at all yet - add one after the SeoPageLayout import
    if (src.includes("from '../components/SeoPageLayout'")) {
      src = src.replace(
        /(import\s*{[^}]*}\s*from\s*['"]\.\.\/components\/SeoPageLayout['"];?\n)/,
        `$1import { ORG } from '../lib/constants';\n`
      );
      fs.writeFileSync(fp, src, 'utf8');
      console.log('Fixed (added new import):', file);
      fixed++;
    } else {
      console.log('MANUAL CHECK NEEDED (no SeoPageLayout import found):', file);
    }
  }
}

console.log(`\nDone. Fixed ${fixed} file(s). ${alreadyOk} already had ORG imported correctly.`);
