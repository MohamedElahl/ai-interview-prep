import { store } from './store.js';
import { esc } from './md.js';
import { PRESETS, config, listModels, testProvider } from './llm.js';

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
        say(models.length ? `${models.length} models found. Click the model box to choose one.` : 'No models found.', models.length ? 'ok' : 'warn');
      } catch (e) { say(e.message + (id === 'ollama' && /reach/.test(e.message) ? '. Is Ollama running? If you just ran setx, quit Ollama from the system tray (right-click the icon, Quit) and start it again, then allow local network access if the browser asks.' : ''), 'err'); }
    };
    card.querySelector('[data-a=test]').onclick = async () => {
      say('Testing…');
      try { await testProvider(id); say('Working.', 'ok'); }
      catch (e) { say(e.message + (id === 'ollama' && /reach/.test(e.message) ? '. Is Ollama running? If you just ran setx, quit Ollama from the system tray (right-click the icon, Quit) and start it again, then allow local network access if the browser asks.' : ''), 'err'); }
    };
  });
}
