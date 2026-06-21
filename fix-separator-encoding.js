const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'pages');

let fixed = 0;

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.jsx')) continue;
  const fp = path.join(dir, file);
  let src = fs.readFileSync(fp, 'utf8');
  const before = src;

  // Replace any mojibake/unicode middot separator with a safe ASCII one
  src = src.replace(/\{'\s*(┬╖|·)\s*'\}/g, "{' | '}");

  if (src !== before) {
    fs.writeFileSync(fp, src, 'utf8');
    console.log('Cleaned separator in:', file);
    fixed++;
  }
}

console.log(`\nDone. Cleaned ${fixed} file(s).`);
console.log('Note: this only fixes the link-block separator. If other em-dashes');
console.log('elsewhere in your content show as "ΓÇö", that is pre-existing and');
console.log('not something this script touches - those need ASCII-safe HTML');
console.log('entities (e.g. &mdash;) per your existing project convention.');
