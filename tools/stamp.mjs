// Build the published copy of the site with version-stamped file names, so browsers never mix old and new files.
//   node tools/stamp.mjs <outDir> [version]
// Copies the site into outDir, then:
//  - adds ?v=<hash of the file> to every script, style and content file the site loads (an import map covers
//    the modules that import each other), so a changed file gets a new address and unchanged ones stay cached;
//  - writes version.json and a matching <meta name="app-version"> that the page uses to offer a reload
//    when a newer version is published.
// The repository itself stays unstamped, so the site still runs as-is from a local server.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const out = process.argv[2];
if (!out) { console.error('usage: node tools/stamp.mjs <outDir> [version]'); process.exit(1); }
const SITE = ['index.html', 'selftest.html', '.nojekyll', 'css', 'js', 'content'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of SITE) cpSync(join(root, f), join(out, f), { recursive: true });

const files = [];
const walk = d => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
walk(out);
const rel = p => relative(out, p).split(sep).join('/');
const hash = buf => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const hashes = Object.fromEntries(files.map(p => [rel(p), hash(readFileSync(p))]));
const version = process.argv[3] || hash(Object.entries(hashes).sort().map(e => e.join('=')).join('\n'));
const v = f => `${f}?v=${hashes[f]}`;

// Module scripts import each other by relative path; the import map points each one at its stamped address.
const modules = Object.keys(hashes).filter(f => /^(js|content)\/.*\.js$/.test(f) && f !== 'js/py-worker.js').sort();

const edit = (f, pairs) => {
  const p = join(out, f);
  let s = readFileSync(p, 'utf8');
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(`${f}: expected to find ${a}`);
    s = s.replace(a, b);
  }
  writeFileSync(p, s);
};
// Edit the files that load others first, then the page, whose stamps must reflect those edits.
edit('js/runner.js', [[`new Worker('js/py-worker.js')`, `new Worker('${v('js/py-worker.js')}')`]]);
edit('js/content.js', [['fetch(`content/${t.file}.md`)', 'fetch(`content/${t.file}.md?v=' + version + '`)']]);
for (const f of ['js/runner.js', 'js/content.js']) hashes[f] = hash(readFileSync(join(out, f)));
const importMap = JSON.stringify({ imports: Object.fromEntries(modules.map(f => ['./' + f, './' + v(f)])) });

edit('index.html', [
  ['<link rel="stylesheet" href="css/style.css">',
   `<meta name="app-version" content="${version}">\n<script type="importmap">${importMap}</script>\n<link rel="stylesheet" href="${v('css/style.css')}">`],
  ['<script type="module" src="js/app.js"></script>', `<script type="module" src="${v('js/app.js')}"></script>`]
]);
writeFileSync(join(out, 'version.json'), JSON.stringify({ version }) + '\n');
console.log(`stamped ${modules.length} modules, version ${version}`);
