const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'pages');

let fixed = 0;
let problems = [];

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.jsx')) continue;
  const fp = path.join(dir, file);
  let src = fs.readFileSync(fp, 'utf8');

  const usesOrgUnqualified = /[^.]\bORG\b/.test(src.replace(/['"`].*?ORG.*?['"`]/g, '')); // rough: ORG used as identifier
  if (!/\bORG\b/.test(src)) continue; // doesn't use ORG at all, skip

  // Does it have ORG actually imported (from constants, in any import statement)?
  const importLines = src.match(/^import\s*{[^}]*}\s*from\s*['"][^'"]+['"];?/gm) || [];
  const hasOrgImport = importLines.some(line => /\bORG\b/.test(line) && line.includes('lib/constants'));

  if (hasOrgImport) continue; // fine

  // Broken: uses ORG, no import. Fix directly: insert right at top of file.
  src = `import { ORG } from '../lib/constants';\n` + src;
  fs.writeFileSync(fp, src, 'utf8');
  console.log('FORCE-FIXED (prepended import):', file);
  fixed++;
}

console.log(`\nDone. Fixed ${fixed} file(s).`);
