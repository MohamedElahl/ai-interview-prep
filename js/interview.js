// Voice mock interview. Speaks questions (speechSynthesis), listens (SpeechRecognition),
// and scores answers with the built-in rubric or, if set up, an AI provider.
import { store } from './store.js';
import { esc } from './md.js';
import { TOPICS, TRACKS, inTrack, topicById } from './content.js';
import { chat, hasProvider, parseJson } from './llm.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, recording = false, recStart = 0, tick = null, S = null;

export function stopSpeech() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  stopRec();
  clearInterval(tick);
}

function speak(text, onend) {
  const v = store.state.voice;
  if (!v.tts || !window.speechSynthesis) { onend?.(); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = speechSynthesis.getVoices().find(x => x.name === v.name);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || 'en-US'; u.rate = v.rate || 1;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}

function stopRec() {
  if (recording && S?.cur) S.cur.speakMs += Date.now() - recStart;
  recording = false;
  try { rec?.stop(); } catch { /* ignore */ }
  rec = null;
}

/** Built-in scoring: which key points did the answer mention? */
export function rubricScore(q, text) {
  const t = ' ' + text.toLowerCase() + ' ';
  const hits = q.points.map(([label, kws]) => ({ label, hit: kws.some(k => t.includes(k.toLowerCase())) }));
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const coverage = hits.length ? hits.filter(h => h.hit).length / hits.length : 0;
  const score = Math.round(10 * coverage * (words < 25 ? 0.7 : 1));
  return { score, hits, words };
}

const GRADER = `You are a senior interviewer hiring for AI and machine learning roles. You evaluate a candidate's spoken answer, transcribed by speech recognition, so ignore transcription slips and judge the substance.
Reply with JSON only, in this shape:
{"score": <integer 0-10>, "strengths": ["..."], "improvements": ["..."], "spoken": "<one or two natural sentences you would say aloud in reaction>", "follow_up": "<one short follow-up question that probes deeper, or an empty string>"}
Scoring: 9-10 is a strong hire answer, 6-8 is solid with gaps, 3-5 is partial, 0-2 is off-topic or empty. Keep each list to at most three short items. Be specific and direct.`;

async function aiGrade(question, keyPoints, answer, wantFollow) {
  const user = `Question: ${question}\n${keyPoints ? 'Key points a good answer covers: ' + keyPoints + '\n' : ''}Candidate's answer: ${answer}\n${wantFollow ? '' : 'Do not ask a follow-up; return an empty string for follow_up.'}`;
  const { text, provider } = await chat({ system: GRADER, messages: [{ role: 'user', content: user }] });
  const j = parseJson(text);
  return {
    score: Math.max(0, Math.min(10, Math.round(Number(j.score) || 0))),
    strengths: [].concat(j.strengths || []).slice(0, 3).map(String),
    improvements: [].concat(j.improvements || []).slice(0, 3).map(String),
    spoken: String(j.spoken || ''), follow: String(j.follow_up || ''), provider
  };
}

const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtTime = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

export function renderInterview(root, params) {
  stopSpeech(); S = null;
  const track = store.state.track;
  const pool = TOPICS.filter(t => t.interview.length && inTrack(t, track));
  const pre = params.get('topic') || '';
  const ai = hasProvider();
  root.innerHTML = `
  <h1>Mock interview</h1>
  <p class="muted">The interviewer asks each question aloud. Answer by speaking, as you would on a real call, then get a score and feedback.</p>
  <div class="card">
    <div class="row">
      <label>Topic <select id="iv-topic"><option value="">Mixed: ${esc(TRACKS.find(t => t.id === track)?.name || 'All roles')}</option>
        ${pool.map(t => `<option value="${t.id}" ${t.id === pre ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select></label>
      <label>Questions <select id="iv-n"><option>3</option><option selected>5</option><option>8</option><option>10</option></select></label>
      <label>Difficulty <select id="iv-lv"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="mixed" selected>Mixed, easy to hard</option></select></label>
    </div>
    <div class="row">
      <label><input type="radio" name="mode" value="free" ${ai ? '' : 'checked'}> Built-in scoring</label>
      <label><input type="radio" name="mode" value="ai" ${ai ? 'checked' : 'disabled'}> AI interviewer with follow-ups</label>
      ${ai ? '' : '<a class="small" href="#/settings">Set up a free AI provider</a>'}
    </div>
    <div class="row"><button class="primary" id="iv-start">Start interview</button></div>
    ${SR ? '' : '<p class="warn small">This browser has no speech recognition, so you will type your answers. Use Chrome or Edge to answer by voice.</p>'}
  </div>
  <p class="muted small">Tip: use headphones so the microphone does not pick up the interviewer's voice.</p>`;

  root.querySelector('#iv-start').onclick = () => {
    const tid = root.querySelector('#iv-topic').value;
    const n = +root.querySelector('#iv-n').value;
    const src = tid ? [topicById(tid)] : pool;
    const lv = root.querySelector('#iv-lv').value, rank = { easy: 0, medium: 1, hard: 2 };
    const all = src.flatMap(t => t.interview.map(q => ({ topic: t, q })));
    // Questions without a level count as medium. If a level has too few, fill from the whole pool.
    let picked = shuffle(all.filter(x => lv === 'mixed' || (x.q.level || 'medium') === lv)).slice(0, n);
    if (picked.length < n) picked = [...picked, ...shuffle(all.filter(x => !picked.includes(x)))].slice(0, n);
    if (lv === 'mixed') picked.sort((a, b) => rank[a.q.level || 'medium'] - rank[b.q.level || 'medium']);
    const lvName = { easy: 'easy', medium: 'medium', hard: 'hard', mixed: 'mixed' }[lv];
    S = {
      root, label: `${tid ? topicById(tid).title : 'Mixed'} · ${lvName}`, topicId: tid,
      mode: root.querySelector('[name=mode]:checked').value,
      qs: picked, i: 0, results: [], cur: null
    };
    if (!S.qs.length) return;
    showQuestion(true);
  };
}

function showQuestion(first) {
  const { root } = S, item = S.qs[S.i];
  S.cur = { item, stage: 'main', speakMs: 0, t0: Date.now(), parts: [] };
  root.innerHTML = `
  <div class="row between"><b>Question ${S.i + 1} of ${S.qs.length}</b><span class="muted">${esc(item.topic.title)} · <span id="timer">0:00</span></span></div>
  <div class="card interviewer"><div class="who">Interviewer</div><p id="qtext"></p>
    <button id="replay" class="small">Repeat question</button></div>
  <div class="card" id="answer">
    <div class="row"><button id="mic" class="primary">Start answering</button><span id="recstate" class="muted small"></span></div>
    <textarea id="ans" placeholder="Your words appear here as you speak. You can also type or fix the text."></textarea>
    <div class="row"><button class="primary" id="submit">Submit answer</button><button id="skip">Skip</button>
      <button id="end" class="ghost">End interview</button></div>
  </div>
  <div id="fb"></div>`;
  const $ = id => root.querySelector(id);
  clearInterval(tick);
  tick = setInterval(() => { const el = $('#timer'); if (el) el.textContent = fmtTime(Date.now() - S.cur.t0); else clearInterval(tick); }, 1000);

  const micUI = () => { const b = $('#mic'); if (!b) return; b.classList.toggle('rec', recording); b.textContent = recording ? 'Stop recording' : 'Start answering'; if (recording) $('#recstate').textContent = 'Listening…'; else if ($('#recstate').textContent === 'Listening…') $('#recstate').textContent = ''; };
  const startRec = () => {
    const ta = $('#ans'), state = $('#recstate');
    if (!ta || recording) return;
    if (!SR) { state.textContent = 'Voice input is not supported here. Type your answer instead.'; ta.focus(); return; }
    let base = ta.value.trim() ? ta.value.trim() + ' ' : '', finalText = '';
    try {
      rec = new SR();
      rec.lang = store.state.voice.lang || 'en-US'; rec.continuous = true; rec.interimResults = true;
      rec.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText += r[0].transcript + ' '; else interim += r[0].transcript;
        }
        ta.value = base + finalText + interim;
      };
      rec.onerror = e => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { stopRec(); micUI(); state.textContent = 'Microphone is blocked. Allow it in the address bar, or type your answer.'; }
        else if (e.error === 'network') { stopRec(); micUI(); state.textContent = 'Speech recognition needs an internet connection. Type your answer instead.'; }
      };
      rec.onend = () => { if (recording && rec) { base = ta.value.trim() ? ta.value.trim() + ' ' : ''; finalText = ''; try { rec.start(); } catch { /* ignore */ } } };
      window.speechSynthesis?.cancel();
      rec.start(); recording = true; recStart = Date.now(); micUI();
    } catch { state.textContent = 'Could not start the microphone. Type your answer instead.'; }
  };
  S.startRec = startRec; S.micUI = micUI;

  const ask = (text, intro = '') => {
    $('#qtext').textContent = text;
    S.cur.asked = text;
    speak(intro + text, () => { if (store.state.voice.auto && S?.cur?.asked === text && !recording) startRec(); });
  };
  const hello = first ? `Hi, thanks for joining. I'll ask you ${S.qs.length} questions. Take your time and think out loud. First question. ` : '';
  ask(item.q.q, hello);

  $('#replay').onclick = () => { stopRec(); micUI(); speak(S.cur.asked); };
  $('#mic').onclick = () => { if (recording) { stopRec(); micUI(); } else startRec(); };
  $('#skip').onclick = () => { stopSpeech(); S.results.push({ item, score: 0, skipped: true }); next(); };
  $('#end').onclick = () => { stopSpeech(); summary(); };
  $('#submit').onclick = () => submit(ask);
}

async function submit(ask) {
  const { root, cur } = S, $ = id => root.querySelector(id);
  stopRec(); S.micUI(); window.speechSynthesis?.cancel();
  const text = $('#ans').value.trim();
  if (!text) { $('#recstate').textContent = 'Say or type an answer first, or press Skip.'; return; }
  const btn = $('#submit'); btn.disabled = true; btn.textContent = 'Scoring…';
  const q = cur.item.q, isFollow = cur.stage === 'follow';
  const words = text.split(/\s+/).length;
  const wpm = cur.speakMs > 8000 ? Math.round(words / (cur.speakMs / 60000)) : null;
  const fillers = (text.toLowerCase().match(/\b(um+|uh+|erm+|you know|kind of|sort of|basically)\b/g) || []).length;
  const rub = isFollow ? null : rubricScore(q, text);
  let res = { score: rub?.score ?? null, source: 'built-in' }, note = '';

  if (S.mode === 'ai') {
    try {
      const g = await aiGrade(cur.asked, isFollow ? '' : q.points.map(p => p[0]).join('; '), text, !isFollow);
      res = { ...g, source: g.provider };
    } catch (e) {
      note = `AI scoring was unavailable (${e.message}). ${isFollow ? 'This follow-up was not scored.' : 'Used built-in scoring instead.'}`;
    }
  }
  if (!S || S.cur !== cur) return; // user left while scoring
  if (res.score !== null) cur.parts.push(res.score);

  const delivery = [`${words} words`, wpm ? `${wpm} words per minute${wpm > 180 ? ' (a little fast)' : wpm < 100 ? ' (a little slow)' : ''}` : '', fillers ? `${fillers} filler word${fillers > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
  const list = (title, items, cls) => items?.length ? `<p><b>${title}</b></p><ul>${items.map(x => `<li class="${cls}">${esc(x)}</li>`).join('')}</ul>` : '';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="row between"><b>${isFollow ? 'Follow-up' : 'Your answer'}</b>
      ${res.score !== null ? `<span class="score">${res.score} / 10 <span class="badge">${esc(res.source)}</span></span>` : ''}</div>
    ${note ? `<p class="warn small">${esc(note)}</p>` : ''}
    ${res.spoken ? `<p>${esc(res.spoken)}</p>` : ''}
    ${list('What worked', res.strengths, 'ok')}${list('What to improve', res.improvements, '')}
    ${rub ? `<p><b>Key points</b></p><ul class="tests">${rub.hits.map(h => `<li class="${h.hit ? 'ok' : 'muted'}">${h.hit ? '✓' : '○'} ${esc(h.label)}</li>`).join('')}</ul>` : ''}
    <p class="muted small">${delivery}</p>
    ${isFollow ? '' : `<details><summary>Model answer</summary><p>${esc(q.model)}</p></details>`}`;
  $('#fb').append(card);

  const follow = !isFollow && res.follow;
  if (follow) {
    cur.stage = 'follow'; cur.speakMs = 0;
    $('#ans').value = ''; btn.disabled = false; btn.textContent = 'Submit answer';
    $('#skip').textContent = 'Skip follow-up';
    $('#skip').onclick = () => { stopSpeech(); finish(); };
    ask(res.follow, res.spoken ? res.spoken + ' ' : '');
    card.scrollIntoView({ block: 'nearest' });
    return;
  }
  if (!isFollow) speak(res.spoken || (res.score >= 7 ? 'Good answer.' : 'Thanks. Have a look at the key points you missed.'));
  finish(card);
}

function finish(card) {
  const { root, cur } = S;
  const score = cur.parts.length ? Math.round(cur.parts.reduce((a, b) => a + b, 0) / cur.parts.length) : 0;
  S.results.push({ item: cur.item, score });
  root.querySelector('#answer').remove();
  const nav = document.createElement('div');
  nav.className = 'row';
  nav.innerHTML = `<button class="primary" id="next">${S.i + 1 < S.qs.length ? 'Next question' : 'See results'}</button>`;
  root.querySelector('#fb').append(nav);
  nav.querySelector('#next').onclick = () => { stopSpeech(); next(); };
  (card || nav).scrollIntoView({ block: 'nearest' });
}

function next() {
  S.i++;
  if (S.i < S.qs.length) showQuestion(false); else summary();
}

function summary() {
  const { root, results } = S;
  clearInterval(tick);
  const answered = results.filter(r => !r.skipped);
  const score = results.length ? Math.round(10 * results.reduce((a, r) => a + r.score, 0) / results.length) / 10 : 0;
  if (results.length) store.addInterview({ date: new Date().toISOString(), label: S.label, topicId: S.topicId, score, n: results.length, mode: S.mode });
  root.innerHTML = `
  <h1>Interview results</h1>
  <div class="card"><div class="bigscore">${results.length ? score.toFixed(1) : '–'} <span class="muted small">/ 10</span></div>
    <p class="muted">${answered.length} of ${S.qs.length} questions answered · ${esc(S.label)}</p></div>
  ${results.length ? `<ul class="tests">${results.map(r => `<li><span class="score">${r.skipped ? 'skipped' : r.score + '/10'}</span> · ${esc(r.item.q.q)} <a class="small" href="#/topic/${r.item.topic.id}/interview">review</a></li>`).join('')}</ul>` : ''}
  <div class="row"><button class="primary" id="again">New interview</button><a class="btn" href="#/dashboard">Scores</a></div>`;
  const params = new URLSearchParams(S.topicId ? { topic: S.topicId } : {});
  S = null;
  root.querySelector('#again').onclick = () => renderInterview(root, params);
}
