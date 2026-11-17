// Content checker. Run from the project root:
//   node tools/check.mjs [--lessons N] [--quiz N] [--practice] file...
// Path files (content/paths/*.js) are checked step by step; topic files (content/*.js)
// are checked for quiz, interview and task shape. --practice checks the generators in js/practice.js.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
let minLessons = 0, quizSize = 0, practice = false;
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--lessons') minLessons = +args[++i];
  else if (args[i] === '--quiz') quizSize = +args[++i];
  else if (args[i] === '--practice') practice = true;
  else files.push(args[i]);
}

let bad = 0, steps = 0, quizN = 0;
const fail = (where, msg) => { bad++; console.log('FAIL', where, '-', msg); };
const distinct = (a, exact) => new Set(a.map(x => exact ? String(x) : String(x).trim().toLowerCase())).size === a.length;
const load = async f => (await import(pathToFileURL(resolve(f)).href)).default;

function checkStep(s, w) {
  switch (s.t) {
    case 'info': if (!(s.h && s.b)) fail(w, 'info needs a heading and a body'); break;
    case 'mc': if (!s.q || !Array.isArray(s.o) || s.o.length < 3 || !distinct(s.o)) fail(w, 'mc needs a question and 3+ distinct options'); break;
    case 'tf': if (!s.q || typeof s.a !== 'boolean') fail(w, 'tf needs a statement and a boolean'); break;
    case 'fill': if (!s.q || s.q.split('___').length !== 2 || !Array.isArray(s.o) || s.o.length < 2 || !distinct(s.o)) fail(w, 'fill needs exactly one ___ and 2+ distinct options'); break;
    case 'type': if (!s.q || !(s.a?.length || Number.isFinite(s.num))) fail(w, 'type needs accepted answers'); break;
    case 'order': if (!s.q || !Array.isArray(s.lines) || s.lines.length < 3 || s.lines.length > 9 || !distinct(s.lines, true)) fail(w, 'order needs 3 to 9 distinct lines'); break;
    case 'match': if (!s.pairs || s.pairs.length < 3 || !distinct(s.pairs.map(p => p[0])) || !distinct(s.pairs.map(p => p[1]))) fail(w, 'match needs 3+ pairs with distinct left and right sides'); break;
    default: fail(w, 'unknown step type ' + s.t);
  }
  if (s.t !== 'info' && s.t !== 'match' && !s.w) fail(w, 'missing explanation (why)');
}

for (const f of files) {
  let mod;
  try { mod = await load(f); } catch (e) { fail(f, 'cannot load: ' + e.message); continue; }
  if (f.replace(/\\/g, '/').includes('/paths/')) {
    for (const [id, lessons] of Object.entries(mod)) {
      if (lessons.length < minLessons) fail(id, `${lessons.length} lessons, need ${minLessons}`);
      const seen = new Set();
      lessons.forEach((l, li) => {
        if (!l.title) fail(`${id} lesson ${li}`, 'no title');
        if (l.steps.length < 6) fail(`${id} lesson ${li}`, `only ${l.steps.length} steps`);
        if (!l.steps.some(s => s.t === 'info')) fail(`${id} lesson ${li}`, 'no info card');
        l.steps.forEach((s, si) => {
          steps++;
          checkStep(s, `${id} ${li}:${si}`);
          const key = ((s.q || s.h || '') + (s.code || '') + JSON.stringify(s.pairs || s.lines || '')).trim().toLowerCase();
          if (key && seen.has(key)) fail(`${id} ${li}:${si}`, 'repeats an earlier question in this topic');
          seen.add(key);
        });
      });
    }
  } else {
    for (const t of mod) {
      if (!t.id || !t.title) { fail(f, 'topic without id or title'); continue; }
      const levels = { easy: 0, medium: 0, hard: 0 };
      (t.quiz || []).forEach((q, i) => {
        quizN++;
        const w = `${t.id} quiz ${i}`;
        if (!q.q || !Array.isArray(q.options) || q.options.length < 3 || !distinct(q.options)) fail(w, 'needs a question and 3+ distinct options');
        if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.options || []).length)) fail(w, 'answer index out of range');
        if (!q.why) fail(w, 'missing why');
        if (q.level !== undefined && !(q.level in levels)) fail(w, 'level must be easy, medium or hard');
        if (q.level in levels) levels[q.level]++;
      });
      if (quizSize) {
        if ((t.quiz || []).length < quizSize) fail(t.id, `quiz has ${(t.quiz || []).length} questions, need ${quizSize}`);
        for (const [lv, n] of Object.entries(levels)) if (n < Math.floor(quizSize / 3)) fail(t.id, `only ${n} ${lv} quiz questions, need ${Math.floor(quizSize / 3)}`);
      }
      (t.interview || []).forEach((q, i) => { if (!(q.q && q.points?.length && q.model)) fail(`${t.id} interview ${i}`, 'needs q, points and model'); });
      (t.tasks || []).forEach((k, i) => { if (!(k.id && k.title && k.prompt && k.starter && k.solution && (k.lang === 'sql' || k.tests?.length))) fail(`${t.id} task ${i}`, 'incomplete task'); });
    }
  }
}

if (practice) {
  const { GENERATORS, generate } = await import(pathToFileURL(resolve('js/practice.js')).href);
  let n = 0;
  for (const id of Object.keys(GENERATORS)) for (const level of [1, 2, 3]) for (let k = 0; k < 40; k++) {
    const s = generate(id, level);
    n++;
    if (!s) { fail(`practice ${id}`, 'returned nothing'); break; }
    checkStep(s, `practice ${id} L${level}`);
    if (s.t === 'type' && s.num !== undefined && !Number.isFinite(s.num)) fail(`practice ${id} L${level}`, 'non-finite answer');
    if (s.t === 'mc' && !distinct(s.o)) fail(`practice ${id} L${level}`, 'duplicate options: ' + s.o.join(' | '));
  }
  console.log(`practice: ${Object.keys(GENERATORS).length} generators, ${n} samples`);
}

console.log(`${files.length} file(s), ${steps} path steps, ${quizN} quiz questions, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
