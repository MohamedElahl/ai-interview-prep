import { store } from './store.js';
import { esc } from './md.js';
import { PRESETS, config, listModels, testProvider } from './llm.js';

// Notes for the model dropdown. g: 0 recommended, 1 other chat model, 2 not usable for interviews.
// Free-tier notes reflect Groq's free plan in late 2026, where gpt-oss and Qwen 27B share the same limits.
const MODEL_NOTES = [
  [/safeguard|guard/i, 2, 'Safety filter'],
  [/whisper|transcri/i, 2, 'Speech to text'],
  [/tts|orpheus|playai|speech/i, 2, 'Text to speech'],
  [/embed/i, 2, 'Embeddings'],
  [/gpt-oss-120b/i, 0, 'Recommended: best answers on the free tier'],
  [/gpt-oss-20b/i, 0, 'Faster and lighter, a little less sharp'],
  [/qwen.*(27b|32b|235b)/i, 0, 'Good alternative, free tier'],
  [/compound/i, 1, 'Agent with web search: slower, fewer free requests a day'],
  [/kimi/i, 1, 'Strong, but may not be on the free tier'],
  [/llama-4/i, 1, 'May not be on the free tier'],
  [/allam/i, 1, 'Arabic focused'],
  [/gemini.*flash-lite/i, 0, 'Fastest Gemini, free tier'],
  [/gemini.*flash/i, 0, 'Recommended: free tier'],
  [/gemini.*pro/i, 1, 'Strongest Gemini, tighter free limits'],
  [/:free$/i, 0, 'Free']
];
const rateModel = m => { const r = MODEL_NOTES.find(([re]) => re.test(m)); return r ? { g: r[1], note: r[2] } : { g: 1, note: '' }; };
function modelOptions(models, current) {
  const groups = [[], [], []];
  for (const m of models) groups[rateModel(m).g].push(m);
  groups[0].sort((a, b) => MODEL_NOTES.findIndex(([re]) => re.test(a)) - MODEL_NOTES.findIndex(([re]) => re.test(b)));
  const opt = (m, off) => { const n = rateModel(m).note; return `<option value="${esc(m)}" ${m === current ? 'selected' : ''} ${off ? 'disabled' : ''}>${esc(m)}${n ? ' · ' + esc(n) : ''}</option>`; };
  const head = models.includes(current) && rateModel(current).g < 2 ? '' : `<option value="" selected>${current ? esc(current) + (models.includes(current) ? ' (not a chat model)' : ' (not in the list)') : 'Pick one'}</option>`;
  return head + [['Recommended', 0], ['Other chat models', 1], ['Not for interviews', 2]]
    .filter(([, g]) => groups[g].length).map(([label, g]) => `<optgroup label="${label}">${groups[g].map(m => opt(m, g === 2)).join('')}</optgroup>`).join('');
}

export function renderSettings(root) {
  const s = store.state;
  const origin = location.origin;
  root.innerHTML = `
  <h1>Settings</h1>

  <h2>Voice</h2>
  <div class="card">
    <div class="row">
      <label><input type="checkbox" id="v-tts" ${s.voice.tts ? 'checked' : ''}> Read questions aloud</label>
      <label><input type="checkbox" id="v-auto" ${s.voice.auto ? 'checked' : ''}> Start listening after each question</label>
    </div>
    <div class="row">
      <label>Interviewer voice <select id="v-name"><option value="">Browser default</option></select></label>
      <label>Speed <input type="range" id="v-rate" min="0.7" max="1.3" step="0.05" value="${s.voice.rate}"></label>
      <label>Your accent <select id="v-lang">${['en-US', 'en-GB', 'en-IN', 'en-AU'].map(l => `<option ${l === s.voice.lang ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <button id="v-test">Test voice</button>
    </div>
    <p class="muted small">Listening uses your browser's speech recognition. It works in Chrome and Edge; in other browsers you can type your answers.</p>
  </div>

  <h2>AI interviewer (optional)</h2>
  <p class="muted">Without this, mock interviews use the built-in question bank and key-point scoring. Turn on a provider to get follow-up questions, written feedback and code hints. Keys are stored only in this browser and sent only to the provider you choose.</p>
  <div class="row"><label>Try first <select id="primary">${Object.entries(PRESETS).map(([id, p]) => `<option value="${id}" ${id === s.primary ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
  <span class="muted small">If it fails, the other enabled providers are tried in the order below, then built-in scoring.</span></div>
  ${Object.keys(PRESETS).map(id => {
    const c = config(id);
    return `<div class="card prov" data-p="${id}">
      <div class="row between">
        <label><input type="checkbox" data-f="enabled" ${c.enabled ? 'checked' : ''}> <b>${esc(c.name)}</b></label>
        ${c.keyUrl ? `<a class="small" href="${c.keyUrl}" target="_blank" rel="noopener">Get a key</a>` : ''}
      </div>
      <div class="muted small">${esc(c.note)}</div>
      <div class="fields">
        ${c.editBase ? `<input data-f="base" placeholder="Server URL, e.g. http://localhost:11434/v1" value="${esc(store.state.providers[id]?.base || c.base)}" aria-label="Server URL">` : ''}
        <input data-f="key" type="password" autocomplete="off" placeholder="${c.noKey ? 'API key (optional)' : 'API key'}" value="${esc(c.key)}" aria-label="API key">
        <input data-f="model" list="models-${id}" placeholder="Model name" value="${esc(c.model)}" aria-label="Model name"><datalist id="models-${id}"></datalist>
      </div>
      <label class="pick" hidden>Choose a model <select data-a="pick"></select></label>
      <div class="row"><button data-a="models">Load models</button><button data-a="test">Test</button><span class="status small"></span></div>
      ${id === 'ollama' ? `<label class="small"><input type="checkbox" data-f="think" ${store.state.providers.ollama?.think ? 'checked' : ''}> Let the model think before answering. Slower (can take minutes on a laptop) and sometimes more careful on hard questions. Only affects models that can think, such as Qwen 3.x.</label>` : ''}
      ${id === 'ollama' ? `<details><summary>How to set up Ollama</summary>
        <ol><li>Install Ollama from <a href="https://ollama.com" target="_blank" rel="noopener">ollama.com</a> and pull a model, for example <code>ollama pull qwen2.5:7b</code> (use any Qwen or Llama version you like).</li>
        <li>Allow this site to call it. In PowerShell run <code>setx OLLAMA_ORIGINS "${esc(origin)}"</code>, then quit Ollama from the system tray and start it again.</li>
        <li>Press <b>Load models</b>, pick your model, tick the box, then <b>Test</b>.</li></ol>
        <p class="muted small">Ollama only works on the computer where it is running.</p></details>` : ''}
    </div>`;
  }).join('')}
  <p class="muted small">Default model names can go out of date. If a test fails with "model not found", press Load models and pick one from the list.</p>`;

  // Voice
  const v = s.voice, $ = id => root.querySelector(id);
  const fillVoices = () => {
    const voices = (window.speechSynthesis?.getVoices() || []).filter(x => x.lang.startsWith('en'));
    $('#v-name').innerHTML = '<option value="">Browser default</option>' + voices.map(x => `<option ${x.name === v.name ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  };
  fillVoices();
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = fillVoices;
  $('#v-tts').onchange = e => { v.tts = e.target.checked; store.save(); };
  $('#v-auto').onchange = e => { v.auto = e.target.checked; store.save(); };
  $('#v-name').onchange = e => { v.name = e.target.value; store.save(); };
  $('#v-rate').onchange = e => { v.rate = +e.target.value; store.save(); };
  $('#v-lang').onchange = e => { v.lang = e.target.value; store.save(); };
  $('#v-test').onclick = () => {
    if (!window.speechSynthesis) return alert('This browser cannot speak text.');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('Hi, thanks for joining. Tell me about a machine learning project you are proud of.');
    const voice = speechSynthesis.getVoices().find(x => x.name === v.name);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || 'en-US'; u.rate = v.rate;
    speechSynthesis.speak(u);
  };

  // Providers
  $('#primary').onchange = e => { s.primary = e.target.value; store.save(); };
  root.querySelectorAll('.prov').forEach(card => {
    const id = card.dataset.p, status = card.querySelector('.status');
    const say = (text, cls = '') => { status.className = 'status small ' + cls; status.textContent = text; };
    card.querySelectorAll('[data-f]').forEach(inp => {
      inp.addEventListener('change', () => {
        const u = s.providers[id] ||= {};
        u[inp.dataset.f] = inp.type === 'checkbox' ? inp.checked : inp.value.trim();
        store.save();
      });
    });
    card.querySelector('[data-a=models]').onclick = async () => {
      say('Loading…');
      try {
        const models = await listModels(id);
        card.querySelector('datalist').innerHTML = models.map(m => `<option value="${esc(m)}">`).join('');
        const box = card.querySelector('[data-f=model]'), pick = card.querySelector('[data-a=pick]');
        pick.innerHTML = modelOptions(models, box.value);
        pick.parentElement.hidden = !models.length;
        pick.onchange = () => { if (!pick.value) return; box.value = pick.value; box.dispatchEvent(new Event('change')); say(`Model set to ${pick.value}. Press Test to check it.`, 'ok'); };
        const bad = rateModel(box.value);
        if (bad.g === 2) { say(`${box.value} is not a chat model (${bad.note.toLowerCase()}). Choose one from the list above.`, 'warn'); return; }
        say(models.length ? `${models.length} models found. Choose one from the list above.` : 'No models found.', models.length ? 'ok' : 'warn');
      } catch (e) { say(e.message + (id === 'ollama' && /reach/.test(e.message) ? '. Is Ollama running? If you just ran setx, quit Ollama from the system tray (right-click the icon, Quit) and start it again, then allow local network access if the browser asks.' : ''), 'err'); }
    };
    card.querySelector('[data-a=test]').onclick = async () => {
      say('Testing…');
      try {
        const r = await testProvider(id);
        if (r.switched) card.querySelector('[data-f=model]').value = r.switched;
        say(r.switched ? `Working. The model you had is no longer available, so it now uses ${r.switched}.` : 'Working.', 'ok');
      }
      catch (e) { say(e.message + (id === 'ollama' && /reach/.test(e.message) ? '. Is Ollama running? If you just ran setx, quit Ollama from the system tray (right-click the icon, Quit) and start it again, then allow local network access if the browser asks.' : ''), 'err'); }
    };
  });
}
