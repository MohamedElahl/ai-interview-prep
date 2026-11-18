import { store } from './store.js';
import { md, esc } from './md.js';
import { MODULES, TOPICS, ROLES, PROJECTS, topicById, projectById, roleById, roleTopics, loadLesson, stepById } from './content.js';
import { playLesson, stopPlayer } from './learn.js';
import { practiceSet, hasPractice } from './practice.js';
import { parseJson } from './llm.js';
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
  view++; stopSpeech(); stopPlayer();
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  const q = new URLSearchParams(query || '');
  const page = parts[0] || '';
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.nav === (page === 'topic' ? '' : page)));
  window.scrollTo(0, 0);
  if (!page) home();
  else if (page === 'topic') topicView(parts[1], parts[2] || '', q);
  else if (page === 'review') reviewView();
  else if (page === 'project') projectView(parts[1]);
  else if (page === 'playground') playground();
  else if (page === 'interview') renderInterview(app, q);
  else if (page === 'dashboard') dashboard();
  else if (page === 'settings') renderSettings(app);
  else app.innerHTML = '<h1>Page not found</h1><p><a href="#/">Back to topics</a></p>';
}
window.addEventListener('hashchange', route);

/* ---------- Home: job picker and job roadmap ---------- */
const openLesson = t => t.path.findIndex((l, k) => !store.lessonDone(`${t.id}:${k}`));
const nextLesson = topics => {
  const t = topics.find(x => store.topicScore(x).pathDone && openLesson(x) >= 0) || topics.find(x => openLesson(x) >= 0);
  return t ? { t, i: openLesson(t) } : null;
};
const projectPct = p => Math.round(100 * store.projectDone(p.id, p.steps.length) / p.steps.length);
const topicsOf = role => roleTopics(role).map(topicById).filter(Boolean);
function readiness(role) {
  const topicPct = avg(topicsOf(role).map(t => store.topicScore(t).pct));
  const projPct = avg(role.projects.map(projectById).filter(Boolean).map(projectPct));
  return Math.round(0.7 * topicPct + 0.3 * projPct);
}
function statsStrip(label, pct) {
  const st = store.state, goal = st.goal || 30, today = store.todayXp();
  return `<div class="stats game">
    <div class="stat"><b>🔥 ${store.streak()}</b><span class="muted small">day streak</span></div>
    <div class="stat"><b>${st.xp} XP</b><span class="muted small">Level ${store.level()}</span></div>
    <div class="stat"><b>${Math.min(today, goal)} / ${goal} XP</b><span class="muted small">today's goal</span>${bar(Math.min(100, Math.round(100 * today / goal)))}</div>
    <div class="stat"><b>${pct}%</b><span class="muted small">${label}</span>${bar(pct)}</div>
  </div>`;
}
function actionRow(topics) {
  const next = nextLesson(topics), reviewN = Object.keys(store.state.review).length;
  return `<div class="row">
    ${next ? `<a class="btn primary big" href="#/topic/${next.t.id}/learn?l=${next.i}">${store.topicScore(next.t).pathDone ? 'Continue' : 'Start'}: ${esc(next.t.title)}</a>` : ''}
    ${reviewN ? `<a class="btn" href="#/review">Review ${reviewN} mistake${reviewN > 1 ? 's' : ''}</a>` : ''}
    <a class="btn" href="#/interview">Mock interview</a></div>`;
}
function bindTracks() {
  app.querySelectorAll('[data-track]').forEach(b => b.onclick = () => { store.state.track = b.dataset.track; store.save(); home(); window.scrollTo(0, 0); });
}
function home() {
  const role = roleById(store.state.track);
  if (role) roleHome(role); else jobPicker();
}
function jobPicker() {
  const overall = Math.round(avg(TOPICS.map(t => store.topicScore(t).pct)));
  app.innerHTML = `
  <h1>Which job do you want?</h1>
  <p class="muted">Pick a target job. You get an ordered roadmap of every topic it needs, taught from zero in short interactive lessons, and portfolio projects built on use cases that companies run in production.</p>
  <div class="grid roles">${ROLES.map(r => {
    const pct = readiness(r);
    return `<button class="topic role" data-track="${r.id}"><b>${esc(r.title)}</b><span class="muted small">${esc(r.about)}</span>
      <span class="small">${roleTopics(r).length} topics · ${r.projects.length} projects${pct ? ` · ${pct}% ready` : ''}</span></button>`;
  }).join('')}</div>
  ${store.state.xp ? statsStrip('all topics', overall) + actionRow(TOPICS) : ''}
  <h2>Or browse every topic</h2>
  ${MODULES.map(m => {
    const ts = TOPICS.filter(t => t.module === m.id);
    return ts.length ? `<h3>${m.title}</h3><div class="grid">${ts.map(card).join('')}</div>` : '';
  }).join('')}`;
  bindTracks();
}
function roleHome(role) {
  const ts = topicsOf(role);
  app.innerHTML = `
  <button class="ghost back" data-track="all">← Change target job</button>
  <h1>${esc(role.title)}</h1>
  <p class="muted">${esc(role.about)}</p>
  ${statsStrip('job readiness', readiness(role))}
  ${actionRow(ts)}
  <details><summary>What the interviews for this job look like</summary><ol>${role.rounds.map(r => `<li>${esc(r)}</li>`).join('')}</ol></details>
  <h2>Your roadmap</h2>
  <p class="muted">Work through the stages in order. Each topic goes from zero to interview level.</p>
  ${role.stages.map(st => ({ ...st, ts: st.topics.map(topicById).filter(Boolean) })).filter(st => st.ts.length).map((st, i) => `<h3>Stage ${i + 1} · ${esc(st.name)}</h3><div class="grid">${st.ts.map(card).join('')}</div>`).join('')}
  <h2>Projects that prove it</h2>
  <p class="muted">Each project is built on a use case that companies run in production, with a well-known public dataset. Finish them and you have evidence to show, not only claims.</p>
  <div class="grid">${role.projects.map(projectById).filter(Boolean).map(projectCard).join('')}</div>`;
  bindTracks();
}
function card(t) {
  const { pct, started, pathDone } = store.topicScore(t);
  const bits = [t.path.length && `${pathDone}/${t.path.length} lessons`, t.tasks.length && `${t.tasks.length} coding task${t.tasks.length > 1 ? 's' : ''}`, t.quiz.length && 'quiz'].filter(Boolean).join(' · ');
  return `<a class="topic" href="#/topic/${t.id}"><b>${esc(t.title)}</b><span class="muted small">${bits}</span>
    ${bar(pct)}<span class="small ${started ? '' : 'muted'}">${started ? pct + '%' : 'Not started'}</span></a>`;
}
function projectCard(p) {
  const done = store.projectDone(p.id, p.steps.length);
  return `<a class="topic" href="#/project/${p.id}"><span><span class="badge">${p.level} project</span></span><b>${esc(p.title)}</b>
    <span class="muted small">${esc(p.build)}</span>${bar(projectPct(p))}<span class="small ${done ? '' : 'muted'}">${done} of ${p.steps.length} milestones</span></a>`;
}

/* ---------- Project ---------- */
function projectView(id) {
  const p = projectById(id);
  if (!p) { app.innerHTML = '<h1>Project not found</h1><p><a href="#/">Back</a></p>'; return; }
  const jobs = ROLES.filter(r => r.projects.includes(id)).map(r => r.title);
  const list = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  app.innerHTML = `<a class="back" href="#/">← Back to roadmap</a>
  <h1>${esc(p.title)}</h1>
  <p><span class="badge">${p.level} project</span> <span class="muted small">For: ${jobs.map(esc).join(', ')}</span></p>
  <div class="lesson">
  <h2>A proven use case</h2><p>${esc(p.useCase)}</p>
  <h2>What you build</h2><p>${esc(p.build)}</p>
  <h2>Data</h2><p>${esc(p.data)}</p>
  <h2>Milestones</h2>
  <ul class="tests">${p.steps.map((s, i) => `<li><label><input type="checkbox" data-i="${i}" ${store.milestone(p.id, i) ? 'checked' : ''}> <span>${esc(s)}</span></label></li>`).join('')}</ul>
  <p class="muted small" id="pstat"></p>
  <h2>Proof to publish</h2>${list(p.proof)}
  <h2>How to talk about it in an interview</h2>${list(p.talk)}
  </div>
  <h2>Topics you need for this project</h2>
  <div class="grid">${p.topics.map(topicById).filter(Boolean).map(card).join('')}</div>`;
  const stat = () => { app.querySelector('#pstat').textContent = `${store.projectDone(p.id, p.steps.length)} of ${p.steps.length} done. Each milestone earns 10 XP the first time you tick it.`; };
  app.querySelectorAll('[data-i]').forEach(c => c.onchange = () => { store.toggleMilestone(p.id, +c.dataset.i); stat(); });
  stat();
}

/* ---------- Topic ---------- */
async function topicView(id, tab, q) {
  const t = topicById(id);
  if (!t) { app.innerHTML = '<h1>Topic not found</h1><p><a href="#/">Back to topics</a></p>'; return; }
  const tabs = [t.path.length && ['learn', 'Learn'], ['lesson', 'Summary'], t.tasks.length && ['practice', `Code (${t.tasks.length})`],
    (t.quiz.length || t.path.length) && ['quiz', 'Quizzes'], t.interview.length && ['interview', 'Interview questions']].filter(Boolean);
  if (tab === 'drill') return drillView(t, +q.get('level'));
  if (!tabs.some(x => x[0] === tab)) tab = tabs[0][0];
  const nextTab = tabs[tabs.findIndex(x => x[0] === tab) + 1];
  if (tab === 'learn' && q.has('l') && t.path[+q.get('l')]) return lessonView(t, +q.get('l'));
  if (tab === 'quiz' && q.has('level')) return quizRun(t, q.get('level'));
  app.innerHTML = `<a class="back" href="#/">← All topics</a><h1>${esc(t.title)}</h1>
    <nav class="tabs">${tabs.map(([k, label]) => `<a class="${k === tab ? 'on' : ''}" href="#/topic/${t.id}/${k}">${label}</a>`).join('')}</nav><div id="pane"></div>`;
  const pane = app.querySelector('#pane');
  const nextLink = nextTab ? `<p><a class="btn primary" href="#/topic/${t.id}/${nextTab[0]}">Next: ${nextTab[1]}</a></p>` : '';
  if (tab === 'learn') pathView(pane, t);
  else if (tab === 'lesson') {
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
    ${t.interview.map((x, i) => `<div class="q"><b>${i + 1}. ${esc(x.q)}</b>${x.level ? ` <span class="lv lv-${x.level}">${x.level}</span>` : ''}
      <details><summary>Key points and model answer</summary><ul>${x.points.map(p => `<li>${esc(p[0])}</li>`).join('')}</ul><p>${esc(x.model)}</p></details></div>`).join('')}`;
  }
}

/* ---------- Learning path ---------- */
const LEVEL_NAMES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const QUIZ_LEVELS = [
  ['easy', 'Easy', 'Definitions and basics'],
  ['medium', 'Medium', 'Apply the ideas to short scenarios'],
  ['hard', 'Hard', 'Reasoning, trade-offs, debugging and calculations'],
  ['mixed', 'Mixed', 'Everything, easy to hard: the final check']
];
const quizBest = (t, lv) => store.state.quizLv?.[t.id]?.[lv];
const shuffled = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
const drillCard = t => hasPractice(t.id) ? `<div class="card"><b>Endless practice</b> <span class="muted">Fresh questions with new numbers every round.</span>
    <div class="row">${['Easy', 'Medium', 'Hard'].map((n, i) => `<a class="btn" href="#/topic/${t.id}/drill?level=${i + 1}">${n}</a>`).join('')}</div></div>` : '';

function pathView(pane, t) {
  const n = t.path.length;
  const cur = t.path.findIndex((l, i) => !store.lessonDone(`${t.id}:${i}`));
  let k = 0;
  const node = (href, dot, title, sub, cls = '') => `<a class="node ${cls}" style="--o:${[0, 1, 2, 1][k++ % 4]}" href="${href}"><span class="dot">${dot}</span><span><b>${esc(title)}</b><small>${sub}</small></span></a>`;
  const allDone = cur < 0;
  const projs = PROJECTS.filter(p => p.topics.includes(t.id));
  const real = t.uses.length || projs.length ? `<div class="card"><b>Where this is used</b>
    ${t.uses.length ? `<ul>${t.uses.map(u => `<li>${esc(u)}</li>`).join('')}</ul>` : ''}
    ${projs.length ? `<p class="small">Prove it with a project: ${projs.map(p => `<a href="#/project/${p.id}">${esc(p.title)}</a>`).join(' · ')}</p>` : ''}</div>` : '';
  // Lessons in four levels, each closed by a checkpoint quiz at the matching difficulty.
  const groups = [[], [], [], []];
  t.path.forEach((l, i) => groups[Math.min(3, Math.floor(i * 4 / Math.max(n, 1)))].push(i));
  const body = groups.map((g, gi) => {
    if (!g.length) return '';
    const [lv, lvName] = QUIZ_LEVELS[gi], best = quizBest(t, lv);
    return `<div class="lvl"><span class="badge">${LEVEL_NAMES[gi]}</span></div>` +
      g.map(i => { const done = store.lessonDone(`${t.id}:${i}`); return node(`#/topic/${t.id}/learn?l=${i}`, done ? '✓' : i + 1, t.path[i].title, `${t.path[i].steps.length} steps${i === cur ? ' · <b>start here</b>' : ''}`, (done ? 'done ' : '') + (i === cur ? 'cur' : '')); }).join('') +
      node(`#/topic/${t.id}/quiz?level=${lv}`, '★', `Checkpoint: ${lvName} quiz`, best != null ? `Best ${Math.round(best * 100)}%` : '10 questions · pass with 80%', best >= 0.8 ? 'done' : '');
  }).join('');
  pane.innerHTML = `${real}<p class="muted">Work down the path from Beginner to Expert. Each lesson takes about five minutes; each level ends with a checkpoint quiz.</p><div class="path">
    ${body}
    <div class="lvl"><span class="badge">Prove it</span></div>
    ${t.tasks.length ? node(`#/topic/${t.id}/practice`, '⌨', 'Write real code', `${t.tasks.filter(x => store.task(x.id).best === 1).length} of ${t.tasks.length} tasks solved`, t.tasks.every(x => store.task(x.id).best === 1) ? 'done' : allDone ? 'cur' : '') : ''}
    ${t.interview.length ? node(`#/interview?topic=${t.id}`, '🎙', 'Say it out loud', 'Voice mock interview on this topic') : ''}
  </div>
  ${drillCard(t)}
  <div class="card"><b>Want more?</b> <span class="muted">Generate fresh exercises on this topic with your AI provider.</span>
    <div class="row"><select id="ai-level"><option>Beginner</option><option selected>Intermediate</option><option>Advanced</option><option>Interview level</option></select>
    <button id="ai-more">Generate extra practice</button><span id="ai-status" class="small muted"></span></div></div>`;
  pane.querySelector('#ai-more').onclick = () => aiPractice(t, pane.querySelector('#ai-level').value, pane.querySelector('#ai-status'));
}

function lessonView(t, i) {
  const l = t.path[i], more = i + 1 < t.path.length;
  playLesson(app, {
    title: `${t.title} · ${l.title}`, steps: l.steps, lessonId: `${t.id}:${i}`, backHref: `#/topic/${t.id}/learn`,
    nextHref: more ? `#/topic/${t.id}/learn?l=${i + 1}` : t.tasks.length ? `#/topic/${t.id}/practice` : t.quiz.length ? `#/topic/${t.id}/quiz` : '',
    nextLabel: more ? 'Next lesson' : t.tasks.length ? 'Now write real code' : 'Take the quiz'
  });
}

function reviewView() {
  const ids = Object.keys(store.state.review);
  const steps = [];
  for (const id of ids) { const s = stepById(id); if (s) steps.push(s); else store.clearReview(id); }
  if (!steps.length) { app.innerHTML = '<h1>Review</h1><p class="muted">Nothing to review. Steps you get wrong in lessons are collected here.</p><p><a class="btn" href="#/">Back to topics</a></p>'; return; }
  playLesson(app, { title: 'Review your mistakes', steps: steps.sort(() => Math.random() - 0.5).slice(0, 12), lessonId: 'review', backHref: '#/', review: true });
}

async function aiPractice(t, level, status) {
  if (!hasProvider()) { status.innerHTML = 'Needs an AI provider. <a href="#/settings">Set up a free one</a>.'; return; }
  const mine = view;
  status.textContent = 'Writing exercises…';
  try {
    const { text } = await chat({
      system: `You write practice exercises for engineers preparing for AI job interviews. Reply with JSON only, in this shape:
{"steps":[{"t":"mc","q":"question","o":["the correct answer","wrong","wrong","wrong"],"w":"one-sentence explanation"},{"t":"tf","q":"a statement","a":true,"w":"one-sentence explanation"},{"t":"type","q":"question whose answer is one word or number","a":["answer","accepted alternative"],"w":"one-sentence explanation"}]}
Rules: write exactly 8 exercises, mostly "mc". In "mc" the FIRST option must be the correct one and all options must be short. Every exercise must be factually correct and unambiguous. Vary the sub-topics. No markdown outside inline code in backticks.`,
      messages: [{ role: 'user', content: `Topic: ${t.title}. Difficulty: ${level}. Cover these lesson themes: ${t.path.map(l => l.title).join('; ') || t.title}.` }]
    });
    const steps = (parseJson(text).steps || []).filter(s =>
      (s.t === 'mc' && s.q && Array.isArray(s.o) && s.o.length >= 2) || (s.t === 'tf' && s.q && typeof s.a === 'boolean') || (s.t === 'type' && s.q && [].concat(s.a || []).length))
      .map(s => ({ ...s, o: s.o?.map(String), a: s.t === 'type' ? [].concat(s.a).map(String) : s.a }));
    if (mine !== view) return;
    if (!steps.length) throw new Error('the model returned no usable exercises');
    playLesson(app, { title: `${t.title} · AI practice (${level})`, steps, lessonId: `${t.id}:ai`, backHref: `#/topic/${t.id}/learn`, noReview: true });
  } catch (e) { if (mine === view) status.textContent = 'Could not generate: ' + e.message; }
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
  <div class="chips">${t.tasks.map((k, i) => { const b = store.task(k.id).best; return `<a class="pill ${i === idx ? 'on' : ''} ${b === 1 ? 'done' : ''}" href="#/topic/${t.id}/practice?i=${i}">${i + 1}. ${esc(k.title)}${k.level ? ` <span class="lv lv-${k.level}">${k.level}</span>` : ''}${b === 1 ? ' ✓' : ''}</a>`; }).join('')}</div>
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

/** 10 questions for a quiz level: the question bank first, then generated exercises, then lesson steps of that level. */
function quizSteps(t, level, n = 10) {
  const L = { easy: 1, medium: 2, hard: 3 };
  const toMc = x => ({ t: 'mc', q: x.q, o: [x.options[x.answer], ...x.options.filter((_, j) => j !== x.answer)], w: x.why, nr: true, lv: x.level || 'medium' });
  const bank = t.quiz.filter(x => level === 'mixed' || (x.level || 'medium') === level).map(toMc);
  const N = t.path.length, band = i => (i / Math.max(N, 1) < 1 / 3 ? 'easy' : i / Math.max(N, 1) < 2 / 3 ? 'medium' : 'hard');
  const fromPath = t.path.flatMap((l, li) => (level === 'mixed' || band(li) === level)
    ? l.steps.map((s, si) => ({ ...s, _id: `${t.id}:${li}:${si}`, lv: band(li) })).filter(s => s.t !== 'info') : []);
  const gen = !hasPractice(t.id) ? [] : level === 'mixed'
    ? [1, 2, 3].flatMap(v => practiceSet(t.id, v, 1).map(s => ({ ...s, lv: ['easy', 'medium', 'hard'][v - 1] })))
    : practiceSet(t.id, L[level], 3).map(s => ({ ...s, lv: level }));
  const out = [...shuffled(bank).slice(0, level === 'mixed' ? 5 : 4), ...gen];
  out.push(...shuffled(fromPath).slice(0, Math.max(0, n - out.length)));
  const rank = { easy: 0, medium: 1, hard: 2 };
  // Mixed runs from easy to hard; a single level is shuffled.
  return level === 'mixed' ? shuffled(out.slice(0, n)).sort((a, b) => rank[a.lv] - rank[b.lv]) : shuffled(out).slice(0, n);
}

function quiz(pane, t) {
  pane.innerHTML = `<p class="muted">Each quiz has 10 questions drawn from the question bank, the lessons${hasPractice(t.id) ? ' and freshly generated exercises' : ''}. Score 80% to pass a level, then move up.</p>
  <div class="grid">${QUIZ_LEVELS.map(([lv, name, desc]) => {
    const best = quizBest(t, lv);
    return `<a class="topic" href="#/topic/${t.id}/quiz?level=${lv}"><b>${name}</b><span class="muted small">${desc}</span>
      ${bar(Math.round((best || 0) * 100))}<span class="small ${best != null ? (best >= 0.8 ? 'ok' : '') : 'muted'}">${best != null ? `Best ${Math.round(best * 100)}%${best >= 0.8 ? ' · passed' : ''}` : 'Not taken'}</span></a>`;
  }).join('')}</div>
  ${drillCard(t)}
  <p><a class="btn" href="#/interview?topic=${t.id}">Next: practise interview questions out loud</a></p>`;
}

function quizRun(t, level) {
  const i = QUIZ_LEVELS.findIndex(x => x[0] === level);
  const [lv, name] = QUIZ_LEVELS[i < 0 ? 3 : i], next = QUIZ_LEVELS[(i < 0 ? 3 : i) + 1];
  playLesson(app, {
    title: `${t.title} · ${name} quiz`, steps: quizSteps(t, lv), lessonId: `quiz:${t.id}:${lv}`,
    backHref: `#/topic/${t.id}/quiz`, backLabel: 'All quiz levels',
    nextHref: next ? `#/topic/${t.id}/quiz?level=${next[0]}` : `#/topic/${t.id}/learn`, nextLabel: next ? `Try the ${next[1]} quiz` : 'Back to the path',
    onDone: acc => store.setQuizLevel(t.id, lv, acc),
    doneTitle: acc => acc >= 0.8 ? `${name} quiz passed` : `${name} quiz: keep practising`
  });
}

function drillView(t, level) {
  const lv = Math.min(3, Math.max(1, level || 1)), name = ['Easy', 'Medium', 'Hard'][lv - 1];
  const steps = practiceSet(t.id, lv, 10);
  if (!steps.length) { location.hash = `#/topic/${t.id}/learn`; return; }
  playLesson(app, {
    title: `${t.title} · ${name} practice`, steps, lessonId: `drill:${t.id}:${lv}`, noReview: true,
    backHref: `#/topic/${t.id}/learn`, nextHref: `#/topic/${t.id}/drill?level=${lv}&r=${Date.now()}`, nextLabel: 'Another round',
    doneTitle: acc => acc === 1 ? 'Flawless round' : 'Round complete'
  });
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
