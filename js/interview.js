// Voice mock interview. Speaks questions (speechSynthesis), listens (SpeechRecognition),
// and scores answers with the built-in rubric or, if set up, an AI provider.
import { store } from './store.js';
import { esc, md } from './md.js';
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

const TRANSCRIPT_NOTE = `The answer was transcribed by speech recognition, so some words are misheard (for example "cash" for "cache", "rescues" for "recursion", "downstarts" for "top-down"). Work out the intended technical term from context and judge the substance. Never quote, praise or criticise a misheard word; if you mention the idea, use the correct term.`;

const GRADER = `You are a senior interviewer hiring for AI and machine learning roles, and a strict but fair grader. ${TRANSCRIPT_NOTE}
Reply with JSON only, in this shape:
{"score": <integer 0-10>, "strengths": ["..."], "improvements": ["..."], "spoken": "<one or two natural sentences you would say aloud in reaction>", "follow_up": "<one short follow-up question that probes deeper, or an empty string>"}
Scoring, be calibrated:
- 9-10: rare. Covers every key point correctly, with a concrete example or trade-off, clearly structured. If you list any substantial improvement, the score must be 8 or lower.
- 7-8: correct and covers most key points, missing some depth, an example or a trade-off.
- 5-6: partly correct; important points missing or vague.
- 3-4: mostly vague, or contains a significant error.
- 0-2: off-topic, wrong or empty.
Strengths must name real ideas the candidate expressed, not words they used. Keep each list to at most three short, specific items.
Never give feedback about spelling, wording, transcription or "terminology errors" caused by misheard words: the candidate spoke correctly and cannot control the transcript. Only comment on terms if the idea itself was wrong.`;

const COACH = `You are a friendly, honest interview coach for AI and machine learning roles. The candidate has just done a mock interview and wants to talk about it. The context below has the questions, their answers, the scores and the feedback. ${TRANSCRIPT_NOTE}
Help them improve: explain concepts, say what a stronger answer would include, rewrite their answer when asked, suggest how to say it out loud, and answer related questions. Be concise: under 180 words unless they ask for more. Use short paragraphs or bullet points.`;

const clip = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; };

/** One answered question as plain text for the coach. `full` adds key points and the model answer. */
function turnText(t, full) {
  return [`Question (${t.topic}${t.follow ? ', follow-up' : ''}): ${t.q}`,
    full && t.keyPoints ? `Key points a good answer covers: ${t.keyPoints}` : '',
    `Candidate's answer: ${clip(t.answer, full ? 1500 : 500)}`,
    t.score != null ? `Score: ${t.score}/10 (${t.source})` : '',
    t.strengths?.length ? `What worked: ${t.strengths.join('; ')}` : '',
    t.improvements?.length ? `To improve: ${t.improvements.join('; ')}` : '',
    full && t.model ? `Model answer: ${clip(t.model, 900)}` : ''].filter(Boolean).join('\n');
}

/** A chat with the coach. `thread` is a persistent array of {role, content}; `contextFn` builds the context each time. */
function chatBox({ title, contextFn, thread, onChange, open }) {
  const el = document.createElement('details');
  el.className = 'coach';
  if (open) el.open = true;
  el.innerHTML = `<summary>${esc(title)}</summary><div class="msgs" aria-live="polite"></div>
    <div class="row chatrow"><textarea rows="2" placeholder="Ask anything about this…" aria-label="Your message to the coach"></textarea><button class="primary">Send</button></div>
    <p class="muted small">Try: <a href="#" data-q="How would a strong candidate answer this?">a strong answer</a> · <a href="#" data-q="What exactly did I get wrong or miss, and why does it matter?">what I missed</a> · <a href="#" data-q="Rewrite my answer so it is clear and complete, in a way I could say out loud.">rewrite my answer</a> · <a href="#" data-q="Ask me a harder follow-up question.">a harder follow-up</a></p>`;
  const msgs = el.querySelector('.msgs'), ta = el.querySelector('textarea'), btn = el.querySelector('button');
  const draw = () => {
    msgs.innerHTML = thread.map(m => `<div class="msg ${m.role}${m.err ? ' err' : ''}"><b>${m.role === 'user' ? 'You' : 'Coach'}</b>${m.role === 'user' ? `<p>${esc(m.content)}</p>` : md(m.content)}</div>`).join('');
  };
  const send = async raw => {
    const text = String(raw || '').trim();
    if (!text || btn.disabled) return;
    if (!hasProvider()) { msgs.insertAdjacentHTML('beforeend', '<p class="warn small">The coach needs an AI provider. <a href="#/settings">Set one up in Settings</a>.</p>'); return; }
    thread.push({ role: 'user', content: text });
    ta.value = ''; draw(); onChange?.();
    btn.disabled = true; btn.textContent = 'Thinking…';
    let history = thread.filter(m => !m.err).slice(-10);
    while (history[0]?.role === 'assistant') history = history.slice(1);
    try {
      const { text: reply } = await chat({ system: COACH + '\n\nContext:\n' + contextFn(), messages: history.map(m => ({ role: m.role, content: m.content })) });
      thread.push({ role: 'assistant', content: reply });
    } catch (e) {
      thread.push({ role: 'assistant', content: 'Sorry, I could not reach the AI provider: ' + e.message, err: true });
    }
    btn.disabled = false; btn.textContent = 'Send'; draw(); onChange?.();
    msgs.lastElementChild?.scrollIntoView({ block: 'nearest' });
  };
  btn.onclick = () => send(ta.value);
  ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); } };
  el.querySelectorAll('[data-q]').forEach(a => a.onclick = e => { e.preventDefault(); send(a.dataset.q); });
  draw();
  return el;
}

/** Context for the whole interview: every answer in brief. */
const interviewContext = (label, log) => `Interview: ${label}\n\n` + log.map((t, i) => `${i + 1}. ${turnText(t, false)}`).join('\n\n');

// Small models still comment on misheard words despite the instructions; drop those remarks.
const TRANSCRIPT_TALK = /spell|garbl|transcri|mishear|typo|terminolog|speech[- ]to[- ]text|wording/i;

async function aiGrade(question, keyPoints, answer, wantFollow) {
  const user = `Question: ${question}\n${keyPoints ? 'Key points a good answer covers: ' + keyPoints + '\n' : ''}Candidate's answer: ${answer}\n${wantFollow ? '' : 'Do not ask a follow-up; return an empty string for follow_up.'}`;
  const { text, provider } = await chat({ system: GRADER, messages: [{ role: 'user', content: user }] });
  const j = parseJson(text);
  return {
    score: Math.max(0, Math.min(10, Math.round(Number(j.score) || 0))),
    strengths: [].concat(j.strengths || []).map(String).filter(x => !TRANSCRIPT_TALK.test(x)).slice(0, 3),
    improvements: [].concat(j.improvements || []).map(String).filter(x => !TRANSCRIPT_TALK.test(x)).slice(0, 3),
    spoken: String(j.spoken || '').split(/(?<=[.!?])s+/).filter(x => !TRANSCRIPT_TALK.test(x)).join(' '), follow: String(j.follow_up || ''), provider
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
      qs: picked, i: 0, results: [], cur: null, log: []
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
    <p class="muted small">Speech recognition mishears technical words. Fix any misheard words (for example "cash" to "cache") before you submit.</p>
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
  // Remember the exchange so the coach can discuss it, now and later from Scores.
  const turn = {
    topic: cur.item.topic.title, q: cur.asked, follow: isFollow,
    keyPoints: isFollow ? '' : q.points.map(p => p[0]).join('; '), model: isFollow ? '' : q.model,
    answer: clip(text, 1500), score: res.score, source: res.source,
    strengths: res.strengths || [], improvements: res.improvements || (rub ? rub.hits.filter(h => !h.hit).map(h => 'Missing: ' + h.label) : []),
    chat: []
  };
  const log = S.log;
  log.push(turn);
  if (hasProvider()) card.append(chatBox({
    title: 'Discuss this answer with the coach', thread: turn.chat,
    contextFn: () => [...log.filter(t => t !== turn).slice(-4).map(t => 'Earlier: ' + turnText(t, false)), 'Answer under discussion:\n' + turnText(turn, true)].join('\n\n')
  }));
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
  const record = { date: new Date().toISOString(), label: S.label, topicId: S.topicId, score, n: results.length, mode: S.mode, log: S.log, chat: [] };
  if (results.length) store.addInterview(record);
  root.innerHTML = `
  <h1>Interview results</h1>
  <div class="card"><div class="bigscore">${results.length ? score.toFixed(1) : '–'} <span class="muted small">/ 10</span></div>
    <p class="muted">${answered.length} of ${S.qs.length} questions answered · ${esc(S.label)}</p></div>
  ${results.length ? `<ul class="tests">${results.map(r => `<li><span class="score">${r.skipped ? 'skipped' : r.score + '/10'}</span> · ${esc(r.item.q.q)} <a class="small" href="#/topic/${r.item.topic.id}/interview">review</a></li>`).join('')}</ul>` : ''}
  <div id="coach"></div>
  <div class="row"><button class="primary" id="again">New interview</button><a class="btn" href="#/dashboard">Scores</a></div>`;
  if (results.length && record.log.length && hasProvider()) root.querySelector('#coach').append(chatBox({
    title: 'Ask the coach about this interview', open: true, thread: record.chat,
    contextFn: () => interviewContext(record.label, record.log), onChange: () => store.save()
  }));
  if (results.length) store.save(); // keeps per-answer chats from this interview
  const params = new URLSearchParams(S.topicId ? { topic: S.topicId } : {});
  S = null;
  root.querySelector('#again').onclick = () => renderInterview(root, params);
}

/** Reopen a saved interview: answers, feedback and the coach conversations, which can continue. */
export function renderPastInterview(root, date) {
  stopSpeech(); S = null;
  const rec = store.state.interviews.find(i => i.date === date);
  if (!rec) { root.innerHTML = '<h1>Interview not found</h1><p><a href="#/dashboard">Back to Scores</a></p>'; return; }
  const log = rec.log || [];
  const list = (title, items, cls) => items?.length ? `<p><b>${title}</b></p><ul>${items.map(x => `<li class="${cls}">${esc(x)}</li>`).join('')}</ul>` : '';
  root.innerHTML = `<a class="back" href="#/dashboard">← Scores</a>
  <h1>${esc(rec.label)}</h1>
  <p class="muted">${new Date(rec.date).toLocaleString()} · ${rec.score.toFixed(1)} / 10 · ${rec.n} question${rec.n === 1 ? '' : 's'}</p>
  ${log.length ? '' : '<p class="muted">This interview was recorded before answers were saved, so only the score is available.</p>'}
  <div id="turns"></div><div id="coach"></div>`;
  log.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="row between"><b>${t.follow ? 'Follow-up' : esc(t.topic)}</b>${t.score != null ? `<span class="score">${t.score} / 10</span>` : ''}</div>
      <p><b>${esc(t.q)}</b></p><p class="muted">${esc(t.answer)}</p>
      ${list('What worked', t.strengths, 'ok')}${list('What to improve', t.improvements, '')}`;
    if (hasProvider() || t.chat?.length) card.append(chatBox({
      title: 'Discuss this answer with the coach', thread: (t.chat ||= []), open: !!t.chat.length,
      contextFn: () => [...log.filter(x => x !== t).slice(-4).map(x => 'Earlier: ' + turnText(x, false)), 'Answer under discussion:\n' + turnText(t, true)].join('\n\n'),
      onChange: () => store.save()
    }));
    root.querySelector('#turns').append(card);
  });
  if (log.length) root.querySelector('#coach').append(chatBox({
    title: 'Ask the coach about this interview', open: true, thread: (rec.chat ||= []),
    contextFn: () => interviewContext(rec.label, log), onChange: () => store.save()
  }));
}
