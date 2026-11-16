import { store } from './store.js';
import { md, esc } from './md.js';
import { MODULES, TOPICS, TRACKS, topicById, inTrack, loadLesson } from './content.js';
import { runPython, runSql, gradeSql } from './runner.js';
import { createEditor } from './editor.js';
import { renderInterview, stopSpeech } from './interview.js';
import { renderSettings } from './settings.js';
import { chat, hasProvider } from './llm.js';
import { mountDemos } from './demos.js';

const app = document.getElementById('app');
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const bar = (pct, big) => `<div class="bar ${big ? 'big' : ''}" role="img" aria-label="${pct}% complete"><i style="width:${pct}%"></i></div>`;
let view = 0; // bumps on every navigation so late async work can tell it is stale

document.getElementById('theme').onclick = () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  store.state.theme = document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  store.save();
};

function route() {
  view++; stopSpeech();
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  const q = new URLSearchParams(query || '');
  const page = parts[0] || '';
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.nav === (page === 'topic' ? '' : page)));
  window.scrollTo(0, 0);
  if (!page) home();
  else if (page === 'topic') topicView(parts[1], parts[2] || 'lesson', q);
  else if (page === 'playground') playground();
  else if (page === 'interview') renderInterview(app, q);
  else if (page === 'dashboard') dashboard();
  else if (page === 'settings') renderSettings(app);
  else app.innerHTML = '<h1>Page not found</h1><p><a href="#/">Back to topics</a></p>';
}
window.addEventListener('hashchange', route);

/* ---------- Home ---------- */
function home() {
  const track = store.state.track;
  const topics = TOPICS.filter(t => inTrack(t, track));
  const overall = Math.round(avg(topics.map(t => store.topicScore(t).pct)));
  app.innerHTML = `
  <h1>Get interview-ready for AI jobs</h1>
  <p class="muted">For roles in Egypt and remote roles you can do from Egypt. Each topic has a short lesson, coding tasks with tests, a quiz and voice interview questions.</p>
  <div class="chips" role="group" aria-label="Role">${TRACKS.map(t => `<button class="chip ${t.id === track ? 'on' : ''}" data-track="${t.id}">${t.name}</button>`).join('')}</div>
  <div class="row"><span class="score">${overall}%</span> ${bar(overall, true)} <a class="btn primary" href="#/interview">Start a mock interview</a></div>
  ${MODULES.map(m => {
    const ts = topics.filter(t => t.module === m.id);
    return ts.length ? `<h2>${m.title}</h2><div class="grid">${ts.map(card).join('')}</div>` : '';
  }).join('')}`;
  app.querySelectorAll('[data-track]').forEach(b => b.onclick = () => { store.state.track = b.dataset.track; store.save(); home(); });
}
function card(t) {
  const { pct, started } = store.topicScore(t);
  const bits = [t.tasks.length && `${t.tasks.length} task${t.tasks.length > 1 ? 's' : ''}`, t.quiz.length && 'quiz', t.interview.length && `${t.interview.length} interview Qs`].filter(Boolean).join(' · ');
  return `<a class="topic" href="#/topic/${t.id}"><b>${esc(t.title)}</b><span class="muted small">${bits}</span>
    ${bar(pct)}<span class="small ${started ? '' : 'muted'}">${started ? pct + '%' : 'Not started'}</span></a>`;
}

/* ---------- Topic ---------- */
async function topicView(id, tab, q) {
  const t = topicById(id);
  if (!t) { app.innerHTML = '<h1>Topic not found</h1><p><a href="#/">Back to topics</a></p>'; return; }
  const tabs = [['lesson', 'Lesson'], t.tasks.length && ['practice', `Practice (${t.tasks.length})`],
    t.quiz.length && ['quiz', 'Quiz'], t.interview.length && ['interview', 'Interview questions']].filter(Boolean);
  if (!tabs.some(x => x[0] === tab)) tab = 'lesson';
  const nextTab = tabs[tabs.findIndex(x => x[0] === tab) + 1];
  app.innerHTML = `<a class="back" href="#/">← All topics</a><h1>${esc(t.title)}</h1>
    <nav class="tabs">${tabs.map(([k, label]) => `<a class="${k === tab ? 'on' : ''}" href="#/topic/${t.id}/${k}">${label}</a>`).join('')}</nav><div id="pane"></div>`;
  const pane = app.querySelector('#pane');
  const nextLink = nextTab ? `<p><a class="btn primary" href="#/topic/${t.id}/${nextTab[0]}">Next: ${nextTab[1]}</a></p>` : '';
  if (tab === 'lesson') {
    const mine = view;
    pane.innerHTML = '<p class="muted">Loading…</p>';
    const text = await loadLesson(t);
    if (mine !== view) return;
    pane.innerHTML = `<article class="lesson">${md(text)}</article>${nextLink}`;
    mountDemos(pane);
  } else if (tab === 'practice') practice(pane, t, Math.min(t.tasks.length - 1, Math.max(0, +q.get('i') || 0)));
  else if (tab === 'quiz') quiz(pane, t);
  else {
    pane.innerHTML = `<p><a class="btn primary" href="#/interview?topic=${t.id}">Practise these out loud</a></p>
    ${t.interview.map((x, i) => `<div class="q"><b>${i + 1}. ${esc(x.q)}</b>
      <details><summary>Key points and model answer</summary><ul>${x.points.map(p => `<li>${esc(p[0])}</li>`).join('')}</ul><p>${esc(x.model)}</p></details></div>`).join('')}`;
  }
}

function resultTable(r) {
  if (!r || r.error) return r?.error ? `<pre class="out err">${esc(r.error)}</pre>` : '';
  if (!r.columns.length) return '<p class="muted">Query ran. No rows returned.</p>';
  const rows = r.rows.slice(0, 50);
  return `<table><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(v => `<td>${v === null ? '<span class="muted">NULL</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</table>${r.rows.length > 50 ? `<p class="muted small">Showing 50 of ${r.rows.length} rows.</p>` : ''}`;
}
function pyOutput(r) {
  if (r.fatal) return `<pre class="out err">${esc(r.fatal)}</pre>`;
  if (r.timeout) return '<pre class="out err">Stopped: your code ran for more than 15 seconds. Check for an infinite loop or a slow algorithm.</pre>';
  return (r.stdout ? `<pre class="out">${esc(r.stdout)}</pre>` : '') + (r.error ? `<pre class="out err">${esc(r.error)}</pre>` : '');
}
const stageText = s => s === 'loading' ? 'Loading Python (the first run takes a few seconds)…' : 'Running…';

function practice(pane, t, idx) {
  const task = t.tasks[idx], sql = task.lang === 'sql';
  const saved = store.state.tasks[task.id];
  pane.innerHTML = `
  <div class="chips">${t.tasks.map((k, i) => { const b = store.task(k.id).best; return `<a class="pill ${i === idx ? 'on' : ''} ${b === 1 ? 'done' : ''}" href="#/topic/${t.id}/practice?i=${i}">${i + 1}. ${esc(k.title)}${b === 1 ? ' ✓' : ''}</a>`; }).join('')}</div>
  <div class="prompt">${md(task.prompt)}</div>
  ${sql ? `<details><summary>Show the tables</summary><pre><code>${esc(task.setup.trim())}</code></pre></details>` : ''}
  <div class="editor" id="ed"></div>
  <div class="row"><button data-a="run">Run</button><button class="primary" data-a="submit">Submit</button>
    <button data-a="reset">Reset</button><button data-a="solution">Show solution</button><button data-a="hint">AI hint</button>
    <span id="status" class="muted small" aria-live="polite"></span></div>
  <div id="out"></div><div id="extra"></div>
  ${idx + 1 < t.tasks.length ? `<p><a class="btn" href="#/topic/${t.id}/practice?i=${idx + 1}">Next task</a></p>` : t.quiz.length ? `<p><a class="btn" href="#/topic/${t.id}/quiz">Next: Quiz</a></p>` : ''}`;
  const $ = s => pane.querySelector(s);
  const ed = createEditor($('#ed'), { value: saved?.code ?? task.starter, mode: sql ? 'sql' : 'python', onChange: v => store.setTaskCode(task.id, v) });
  const out = $('#out'), status = $('#status'), extra = $('#extra');
  const buttons = pane.querySelectorAll('[data-a=run],[data-a=submit]');
  let lastOutput = '';
  const busy = on => buttons.forEach(b => b.disabled = on);

  const testList = tests => {
    const pass = tests.filter(x => x.ok).length;
    return `<p class="score ${pass === tests.length ? 'ok' : ''}">${pass} of ${tests.length} tests passed · score ${Math.round(100 * pass / tests.length)}%</p>
    <ul class="tests">${tests.map(x => `<li class="${x.ok ? 'ok' : 'err'}">${x.ok ? '✓' : '✗'} ${esc(x.name)}${x.ok || !x.msg ? '' : `<div class="small">${esc(x.msg)}</div>`}</li>`).join('')}</ul>`;
  };

  async function go(withTests) {
    const mine = view, code = ed.get();
    busy(true); status.textContent = sql ? 'Running…' : stageText('loading');
    let html, tests = null;
    if (sql) {
      if (withTests) { const g = await gradeSql(task, code); tests = g.tests; html = resultTable(g.result); }
      else html = resultTable(await runSql(task.setup, code));
    } else {
      const r = await runPython(code, withTests ? task.tests : [], { onStage: s => { if (mine === view) status.textContent = stageText(s); } });
      html = pyOutput(r);
      if (withTests) tests = r.tests?.length ? r.tests : task.tests.map(x => ({ name: x.name, ok: false, msg: r.timeout ? 'Timed out.' : 'Did not run.' }));
      else if (!html) html = '<p class="muted">Ran with no output. Use print() to see values.</p>';
    }
    if (mine !== view) return;
    busy(false); status.textContent = '';
    if (tests) {
      store.setTaskScore(task.id, tests.filter(x => x.ok).length / tests.length);
      html = testList(tests) + html;
    }
    out.innerHTML = html;
    lastOutput = out.innerText.slice(0, 3000);
  }

  $('[data-a=run]').onclick = () => go(false);
  $('[data-a=submit]').onclick = () => go(true);
  $('[data-a=reset]').onclick = () => { if (confirm('Replace your code with the starter code?')) ed.set(task.starter); };
  $('[data-a=solution]').onclick = () => {
    extra.innerHTML = `<div class="card"><b>Reference solution</b><p class="muted small">Try for at least ten minutes first. Reading a solution is not the same as writing one.</p><pre><code>${esc(task.solution.trim())}</code></pre></div>`;
  };
  $('[data-a=hint]').onclick = async e => {
    if (!hasProvider()) { extra.innerHTML = '<div class="card">AI hints need a provider. <a href="#/settings">Set up a free one in Settings</a>.</div>'; return; }
    const mine = view; e.target.disabled = true;
    extra.innerHTML = '<div class="card muted">Thinking…</div>';
    try {
      const { text, provider } = await chat({
        system: 'You are a coding interview coach. Give one short, concrete hint (at most 120 words) that moves the candidate forward. Point at the bug or the missing idea. Do not write the full solution.',
        messages: [{ role: 'user', content: `Task:\n${task.prompt}\n\nMy code:\n${ed.get()}\n\nLatest output:\n${lastOutput || '(not run yet)'}` }]
      });
      if (mine === view) extra.innerHTML = `<div class="card"><b>Hint</b> <span class="badge">${esc(provider)}</span>${md(text)}</div>`;
    } catch (err) {
      if (mine === view) extra.innerHTML = `<div class="card err">Could not get a hint: ${esc(err.message)}</div>`;
    }
    e.target.disabled = false;
  };
}

function quiz(pane, t) {
  const best = store.state.quiz[t.id]?.best;
  pane.innerHTML = `${best !== undefined ? `<p class="muted">Best score so far: ${Math.round(best * 100)}%</p>` : ''}
  <form id="quiz">${t.quiz.map((x, i) => `<fieldset class="q"><legend>${i + 1}. ${esc(x.q)}</legend>
    ${x.options.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"> <span>${esc(o)}</span></label>`).join('')}<div class="why"></div></fieldset>`).join('')}
  <div class="row"><button class="primary">Check answers</button><span id="qres" class="score" aria-live="polite"></span></div></form>
  <p><a class="btn" href="#/interview?topic=${t.id}">Next: practise interview questions out loud</a></p>`;
  const form = pane.querySelector('#quiz');
  form.onsubmit = e => {
    e.preventDefault();
    let right = 0;
    t.quiz.forEach((x, i) => {
      const fs = form.querySelectorAll('fieldset')[i];
      const chosen = form.querySelector(`[name=q${i}]:checked`);
      const ok = chosen && +chosen.value === x.answer;
      if (ok) right++;
      fs.querySelectorAll('label').forEach((l, j) => l.className = j === x.answer ? 'right' : (chosen && +chosen.value === j ? 'wrong' : ''));
      fs.querySelector('.why').innerHTML = `<span class="${ok ? 'ok' : 'err'}">${ok ? 'Correct.' : chosen ? 'Not quite.' : 'Not answered.'}</span> ${esc(x.why)}`;
    });
    store.setQuiz(t.id, right / t.quiz.length);
    pane.querySelector('#qres').textContent = `${right} of ${t.quiz.length} correct · ${Math.round(100 * right / t.quiz.length)}%`;
  };
}

/* ---------- Playground ---------- */
function playground() {
  app.innerHTML = `<h1>Playground</h1>
  <p class="muted">A scratch pad for Python. numpy, pandas and scikit-learn load automatically when you import them.</p>
  <div class="editor" id="ed"></div>
  <div class="row"><button class="primary" id="run">Run</button><span id="status" class="muted small" aria-live="polite"></span></div><div id="out"></div>`;
  const starter = 'import numpy as np\n\nx = np.array([1, 2, 3, 4])\nprint("mean:", x.mean())\n';
  const ed = createEditor(app.querySelector('#ed'), { value: store.state.scratch || starter, onChange: v => { store.state.scratch = v; store.saveSoon(); } });
  const run = app.querySelector('#run'), status = app.querySelector('#status');
  run.onclick = async () => {
    const mine = view;
    run.disabled = true; status.textContent = stageText('loading');
    const r = await runPython(ed.get(), [], { onStage: s => { if (mine === view) status.textContent = stageText(s); }, timeout: 30000 });
    if (mine !== view) return;
    run.disabled = false; status.textContent = '';
    app.querySelector('#out').innerHTML = pyOutput(r).replace('15 seconds', '30 seconds') || '<p class="muted">Ran with no output. Use print() to see values.</p>';
  };
}

/* ---------- Scores ---------- */
function dashboard() {
  const s = store.state;
  const rows = TOPICS.map(t => ({ t, ...store.topicScore(t) }));
  const started = rows.filter(r => r.started);
  const overall = Math.round(avg(rows.map(r => r.pct)));
  const solved = TOPICS.flatMap(t => t.tasks).filter(k => store.task(k.id).best === 1).length;
  const total = TOPICS.flatMap(t => t.tasks).length;
  const weak = started.filter(r => r.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 5);
  const ivAvg = s.interviews.length ? (avg(s.interviews.slice(0, 5).map(i => i.score))).toFixed(1) : '–';
  app.innerHTML = `<h1>Scores</h1>
  <div class="stats">
    <div class="stat"><b>${overall}%</b><span class="muted small">Overall</span></div>
    <div class="stat"><b>${started.length} / ${TOPICS.length}</b><span class="muted small">Topics started</span></div>
    <div class="stat"><b>${solved} / ${total}</b><span class="muted small">Coding tasks solved</span></div>
    <div class="stat"><b>${ivAvg}</b><span class="muted small">Interview average (last 5), out of 10</span></div>
  </div>
  ${weak.length ? `<h2>Work on these next</h2><ul>${weak.map(r => `<li><a href="#/topic/${r.t.id}">${esc(r.t.title)}</a> · ${r.pct}%</li>`).join('')}</ul>` : ''}
  <h2>By topic</h2>
  <table><tr><th>Topic</th><th>Coding</th><th>Quiz</th><th>Score</th></tr>
  ${MODULES.map(m => `<tr><th colspan="4">${m.title}</th></tr>` + rows.filter(r => r.t.module === m.id).map(({ t, pct, started }) => {
    const done = t.tasks.filter(k => store.task(k.id).best === 1).length;
    const qz = s.quiz[t.id];
    return `<tr><td><a href="#/topic/${t.id}">${esc(t.title)}</a></td><td>${t.tasks.length ? `${done} / ${t.tasks.length}` : '–'}</td><td>${qz ? Math.round(qz.best * 100) + '%' : '–'}</td><td>${started ? pct + '%' : '<span class="muted">Not started</span>'}</td></tr>`;
  }).join('')).join('')}</table>
  <h2>Mock interviews</h2>
  ${s.interviews.length ? `<table><tr><th>Date</th><th>Topic</th><th>Questions</th><th>Scoring</th><th>Score</th></tr>${s.interviews.slice(0, 15).map(i => `<tr><td>${new Date(i.date).toLocaleDateString()}</td><td>${esc(i.label)}</td><td>${i.n}</td><td>${i.mode === 'ai' ? 'AI' : 'Built-in'}</td><td>${i.score.toFixed(1)} / 10</td></tr>`).join('')}</table>` : '<p class="muted">None yet. <a href="#/interview">Start one</a>.</p>'}
  <h2>Your data</h2>
  <p class="muted small">Progress is saved in this browser only. Export it to move to another device. API keys are never included.</p>
  <div class="row"><button id="exp">Export progress</button><button id="imp">Import progress</button><button id="rst">Reset progress</button><input type="file" id="file" accept="application/json" hidden></div>`;
  const $ = id => app.querySelector(id);
  $('#exp').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.export()], { type: 'application/json' }));
    a.download = 'ai-interview-prep-progress.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { store.import(await f.text()); dashboard(); } catch (err) { alert('Could not import: ' + err.message); }
  };
  $('#rst').onclick = () => { if (confirm('Delete all scores, saved code and interview history in this browser? This cannot be undone.')) { store.reset(); dashboard(); } };
}

route();
