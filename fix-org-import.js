const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'pages');

let fixed = 0;

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.jsx')) continue;
  const fp = path.join(dir, file);
  let src = fs.readFileSync(fp, 'utf8');

  if (src.includes('linkStyle') && !src.includes("from '../lib/constants'")) {
    src = src.replace(
      /(import\s*{[^}]*}\s*from\s*['"]\.\.\/components\/SeoPageLayout['"];?\n)/,
      `$1import { ORG } from '../lib/constants';\n`
    );
    fs.writeFileSync(fp, src, 'utf8');
    console.log('Fixed:', file);
    fixed++;
  }
}

console.log(`\nDone. Fixed ${fixed} file(s).`);
