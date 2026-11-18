// Bite-size lesson player: one step at a time, instant feedback, missed steps come back once.
import { store } from './store.js';
import { md, inline, esc } from './md.js';
import { reportLink, stepFields } from './report.js';

const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[.;]+$/, '').trim();
/** Read a typed number: accepts 1,000 / 0,5 / 12% / 1/8 / 3.5 ms. */
export function parseNum(raw) {
  let s = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/[a-zµ°$€£]+$/, '').replace(/%$/, '');
  s = /^-?\d+,\d{1,2}$/.test(s) ? s.replace(',', '.') : s.replace(/,/g, '');
  const f = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (f) return +f[1] / +f[2];
  return s === '' ? NaN : Number(s);
}
let keyHandler = null;
const CARD = /^[\w-]+:\d+:\d+$/; // "topic:lesson:step", a question from a learning path

export function stopPlayer() {
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = null;
}

/** steps: [{t:'info'|'mc'|'tf'|'fill'|'type'|'order'|'match', ...}] */
export function playLesson(root, { title, steps, lessonId, backHref, nextHref, nextLabel, review, ahead, noReview, onDone, doneTitle, backLabel }) {
  stopPlayer();
  const queue = steps.map((s, i) => ({ ...s, _id: s._id || `${lessonId}:${i}` }));
  const total = queue.length, exercises = queue.filter(s => s.t !== 'info').length;
  const wrong = new Set();
  let done = 0;
  root.innerHTML = `<div class="player">
    <div class="row between"><a class="back" href="${backHref}">✕ Quit</a><span class="small muted">${esc(title)}</span></div>
    <div class="bar big pbar"><i style="width:0"></i></div><div id="step"></div><div id="foot"></div></div>`;
  const stepEl = root.querySelector('#step'), foot = root.querySelector('#foot'), bar = root.querySelector('.pbar i');

  keyHandler = e => {
    if (!root.isConnected) return stopPlayer();
    if (e.target.tagName === 'INPUT' && e.key !== 'Enter') return;
    if (e.key === 'Enter') { const b = foot.querySelector('button.primary:not(:disabled)'); if (b) { e.preventDefault(); b.click(); } }
    else if (/^[1-9]$/.test(e.key)) stepEl.querySelectorAll('.opt:not(:disabled),.bank .chip')[+e.key - 1]?.click();
  };
  document.addEventListener('keydown', keyHandler);

  const next = () => {
    bar.style.width = (100 * done / total) + '%';
    const s = queue.shift();
    if (!s) return finish();
    foot.innerHTML = '';
    render(s);
    window.scrollTo(0, 0);
  };

  const grade = (s, ok, answer) => {
    stepEl.querySelectorAll('button,input').forEach(b => b.disabled = true);
    // Path questions are review cards. Only the first attempt in a session counts; practising ahead
    // never pushes a card further out, but a miss still brings it back soon.
    if (!noReview && !s.nr && !s.gen && CARD.test(s._id) && !wrong.has(s._id) && !(ahead && ok)) store.srsAnswer(s._id, ok);
    if (ok) done++;
    else {
      if (wrong.has(s._id)) done++; else { wrong.add(s._id); queue.push(s); }
    }
    bar.style.width = (100 * done / total) + '%';
    foot.innerHTML = `<div class="fb ${ok ? 'good' : 'bad'}"><div><b>${ok ? 'Correct' : 'Not quite'}</b>
      ${ok || !answer ? '' : `<div class="ans">Answer: ${answer}</div>`}${s.w ? `<div>${inline(s.w)}</div>` : ''}
      <div class="small">${reportLink(title, stepFields(s))}</div></div>
      <button class="primary">Continue</button></div>`;
    foot.querySelector('button').onclick = next;
    foot.querySelector('button').focus();
  };

  const checkBtn = (s, getResult) => {
    foot.innerHTML = '<div class="fb"><span></span><button class="primary" disabled>Check</button></div>';
    const b = foot.querySelector('button');
    b.onclick = () => { const r = getResult(); if (r) grade(s, r.ok, r.answer); };
    return on => { b.disabled = !on; };
  };

  function render(s) {
    const q = s.q ? `<h2>${inline(s.q)}</h2>` : '';
    const code = s.code ? `<pre><code>${esc(s.code)}</code></pre>` : '';
    if (s.t === 'info') {
      stepEl.innerHTML = `<div class="card info"><h2>${inline(s.h)}</h2>${md(s.b)}</div>`;
      foot.innerHTML = `<div class="fb"><span class="small">${reportLink(title, stepFields(s))}</span><button class="primary">Continue</button></div>`;
      foot.querySelector('button').onclick = () => { done++; next(); };
    } else if (s.t === 'mc' || s.t === 'tf') {
      const opts = s.t === 'tf' ? [{ text: 'True', ok: s.a === true }, { text: 'False', ok: s.a === false }]
        : shuffle(s.o.map((text, i) => ({ text, ok: i === 0 })));
      stepEl.innerHTML = `${s.t === 'tf' ? '<p class="muted small">True or false?</p>' : ''}${q}${code}<div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${inline(o.text)}</button>`).join('')}</div>`;
      let sel = -1;
      const enable = checkBtn(s, () => {
        stepEl.querySelectorAll('.opt').forEach((b, i) => b.classList.add(opts[i].ok ? 'right' : i === sel ? 'wrong' : 'dim'));
        return { ok: opts[sel].ok, answer: inline(opts.find(o => o.ok).text) };
      });
      stepEl.querySelectorAll('.opt').forEach(b => b.onclick = () => { sel = +b.dataset.i; stepEl.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x === b)); enable(true); });
    } else if (s.t === 'fill') {
      const [a, b = ''] = s.q.split('___');
      const slot = '<span class="slot">&nbsp;</span>';
      stepEl.innerHTML = `<p class="muted small">Fill the blank</p>${s.code ? `<pre class="fillq"><code>${esc(a)}${slot}${esc(b)}</code></pre>` : `<h2 class="fillq">${inline(a)}${slot}${inline(b)}</h2>`}
        <div class="bank">${shuffle(s.o).map(o => `<button class="chip opt">${esc(o)}</button>`).join('')}</div>`;
      let pick = null;
      const enable = checkBtn(s, () => ({ ok: pick === s.o[0], answer: `<code>${esc(s.o[0])}</code>` }));
      stepEl.querySelectorAll('.chip').forEach(c => c.onclick = () => { pick = c.textContent; stepEl.querySelector('.slot').textContent = pick; stepEl.querySelectorAll('.chip').forEach(x => x.classList.toggle('sel', x === c)); enable(true); });
    } else if (s.t === 'type') {
      const isNum = Number.isFinite(s.num);
      stepEl.innerHTML = `<p class="muted small">Type the answer</p>${q}${code}<input class="typed" autocomplete="off" autocapitalize="off" spellcheck="false" ${isNum ? 'inputmode="decimal"' : ''} aria-label="Your answer">`;
      const inp = stepEl.querySelector('input');
      const right = () => isNum ? Math.abs(parseNum(inp.value) - s.num) <= (s.tol ?? 1e-9) + 1e-12 : s.a.some(x => norm(x) === norm(inp.value));
      const enable = checkBtn(s, () => ({ ok: right(), answer: `<code>${esc(s.a[0])}</code>` }));
      inp.oninput = () => enable(inp.value.trim() !== '');
      inp.focus();
    } else if (s.t === 'order') {
      let bank = shuffle(s.lines);
      if (s.lines.length > 1 && bank.join('\n') === s.lines.join('\n')) bank = [...bank.slice(1), bank[0]];
      const ans = [];
      stepEl.innerHTML = `<p class="muted small">Put the lines in order</p>${q}<div class="ansbox"></div><div class="bank"></div>`;
      const enable = checkBtn(s, () => ({ ok: ans.join('\n') === s.lines.join('\n'), answer: `<pre><code>${esc(s.lines.join('\n'))}</code></pre>` }));
      const draw = () => {
        stepEl.querySelector('.ansbox').innerHTML = ans.map((l, i) => `<button class="chip line" data-a="${i}">${esc(l)}</button>`).join('') || '<span class="muted small">Tap the lines below in the right order.</span>';
        stepEl.querySelector('.bank').innerHTML = bank.map((l, i) => `<button class="chip line" data-b="${i}">${esc(l)}</button>`).join('');
        stepEl.querySelectorAll('[data-b]').forEach(c => c.onclick = () => { ans.push(bank.splice(+c.dataset.b, 1)[0]); draw(); });
        stepEl.querySelectorAll('[data-a]').forEach(c => c.onclick = () => { bank.push(ans.splice(+c.dataset.a, 1)[0]); draw(); });
        enable(bank.length === 0);
      };
      draw();
    } else if (s.t === 'match') {
      const left = shuffle(s.pairs.map(p => p[0])), right = shuffle(s.pairs.map(p => p[1]));
      const map = new Map(s.pairs);
      stepEl.innerHTML = `<p class="muted small">Match the pairs</p>${q}<div class="match"><div>${left.map(x => `<button class="opt" data-l="${esc(x)}">${inline(x)}</button>`).join('')}</div><div>${right.map(x => `<button class="opt" data-r="${esc(x)}">${inline(x)}</button>`).join('')}</div></div>`;
      let cur = null, missed = false, left_n = s.pairs.length;
      stepEl.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { cur = b; stepEl.querySelectorAll('[data-l]').forEach(x => x.classList.toggle('sel', x === b)); });
      stepEl.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
        if (!cur) return;
        if (map.get(cur.dataset.l) === b.dataset.r) {
          for (const x of [cur, b]) { x.classList.remove('sel'); x.classList.add('right'); x.disabled = true; }
          cur = null;
          if (--left_n === 0) grade(s, !missed, '');
        } else { missed = true; b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 500); }
      });
    } else { done++; next(); }
  }

  function finish() {
    stopPlayer();
    const acc = exercises ? (exercises - wrong.size) / exercises : 1;
    const xp = review ? 5 + exercises : 10 + (wrong.size === 0 ? 5 : 0);
    store.completeLesson(lessonId, acc, xp);
    onDone?.(acc);
    const goal = store.state.goal || 30, today = store.todayXp();
    root.innerHTML = `<div class="player"><div class="card" style="text-align:center">
      <h1>${doneTitle ? esc(doneTitle(acc)) : wrong.size === 0 ? 'Perfect lesson' : 'Lesson complete'}</h1>
      <div class="stats"><div class="stat"><b>+${xp} XP</b><span class="muted small">earned</span></div>
        <div class="stat"><b>${Math.round(acc * 100)}%</b><span class="muted small">first-try accuracy</span></div>
        <div class="stat"><b>🔥 ${store.streak()}</b><span class="muted small">day streak</span></div></div>
      <p class="muted">${today >= goal ? 'Daily goal reached.' : `${goal - today} XP to today's goal.`}${wrong.size && !noReview && !review ? ' The questions you missed come back in your next review.' : ''}${review ? ` ${store.srsDueCount() ? `${store.srsDueCount()} more due now.` : 'All caught up for now.'}` : ''}</p>
      <div class="row" style="justify-content:center">${nextHref ? `<a class="btn primary" href="${nextHref}">${esc(nextLabel || 'Next lesson')}</a>` : ''}<a class="btn" href="${backHref}">${esc(backLabel || 'Back to path')}</a></div>
    </div></div>`;
  }

  next();
}
