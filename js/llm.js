// Optional AI providers. Keys are typed by the user in Settings and stay in this browser.
// Requests go straight from the browser to the provider chosen; nothing passes through a server of ours.
// Every provider here speaks the OpenAI-compatible chat API.
import { store } from './store.js';

export const PRESETS = {
  groq: { name: 'Groq', base: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-120b', keyUrl: 'https://console.groq.com/keys', note: 'Free tier and very fast, so it suits voice interviews.' },
  ollama: { name: 'Ollama (local, offline)', base: 'http://localhost:11434/v1', model: '', noKey: true, editBase: true, note: 'Runs Qwen, Llama or any model on your own PC. No key, no limits.' },
  gemini: { name: 'Google Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash', keyUrl: 'https://aistudio.google.com/apikey', note: 'Free tier.' },
  openrouter: { name: 'OpenRouter', base: 'https://openrouter.ai/api/v1', model: '', keyUrl: 'https://openrouter.ai/keys', note: 'One key for many models, some of them free.' },
  custom: { name: 'Custom (OpenAI-compatible)', base: '', model: '', editBase: true, noKey: true, note: 'LM Studio, vLLM, or any other compatible endpoint.' }
};

// Model names a provider has shut down. A saved one is dropped so the current default is used instead.
const RETIRED = { groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'qwen/qwen3-32b', 'qwen-qwq-32b', 'gemma2-9b-it', 'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'] };

export function config(id) {
  const p = PRESETS[id], u = store.state.providers[id] || {};
  if (u.model && RETIRED[id]?.includes(u.model)) { delete u.model; store.save(); }
  return { id, ...p, enabled: !!u.enabled, key: u.key || '', base: (u.base || p.base).replace(/\/+$/, ''), model: u.model || p.model, think: !!u.think };
}
const usable = c => c.enabled && c.base && c.model && (c.noKey || c.key);

/** Enabled providers, primary first, then the rest in list order. */
export function activeProviders() {
  const all = Object.keys(PRESETS).map(config).filter(usable);
  return all.sort((a, b) => (b.id === store.state.primary) - (a.id === store.state.primary));
}
export const hasProvider = () => activeProviders().length > 0;

async function http(url, opts, ms = 60000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = null; }
    if (!r.ok) {
      const msg = data?.error?.message || data?.error || text.slice(0, 200) || r.statusText;
      throw new Error(`${r.status} ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('timed out');
    if (e instanceof TypeError) throw new Error('could not reach the provider (network, CORS, or it is not running)');
    throw e;
  } finally { clearTimeout(t); }
}

const auth = c => (c.key ? { authorization: 'Bearer ' + c.key } : {});

async function call(c, system, messages) {
  const data = await http(c.base + '/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth(c) },
    // Local "thinking" models (for example Qwen 3.x) can think for minutes. Unless the user turned thinking on
    // in Settings, ask Ollama to answer directly; with thinking on, wait much longer for the reply.
    body: JSON.stringify({ model: c.model, messages: [{ role: 'system', content: system }, ...messages], ...(c.id === 'ollama' && !c.think ? { reasoning_effort: 'none' } : c.id === 'groq' && /gpt-oss/.test(c.model) ? { reasoning_effort: 'low' } : {}) })
  }, c.id === 'ollama' && c.think ? 600000 : 120000);
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string') throw new Error('empty reply');
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim(); // some local models print their reasoning
}

// Providers retire models, so a saved or default model name can stop working. When that happens,
// pick the best chat model the provider still lists, save it, and try again once.
const GONE = /model.{0,80}(not (be )?found|does not exist|decommissioned|deprecated|no longer|not supported|does not support chat|invalid)|unknown model|not a chat model/i;
const NOT_CHAT = /whisper|tts|guard|embed|audio|speech|moderation|orpheus|playai|image|vision-preview|distil/i;
const PREFER = [/gpt-oss-120b|llama-4-maverick|llama-3.d-70b|qwen3?-?(32b|235b)|kimi|gemini-[d.]+-flash$/i, /120b|70b|72b|32b|maverick|flash/i, /llama|qwen|gpt-oss|gemma|mistral|gemini/i];
async function pickModel(c) {
  const list = (await listModels(c.id)).filter(m => !NOT_CHAT.test(m) && m !== c.model);
  for (const re of PREFER) { const m = list.find(x => re.test(x)); if (m) return m; }
  return list[0] || '';
}
async function callWithFix(c, system, messages) {
  try { return { text: await call(c, system, messages) }; }
  catch (e) {
    if (!GONE.test(e.message)) throw e;
    const m = await pickModel(c).catch(() => '');
    if (!m) throw e;
    const text = await call({ ...c, model: m }, system, messages);
    (store.state.providers[c.id] ||= {}).model = m; store.save();
    return { text, switched: m };
  }
}

/** Try each enabled provider in order. Returns {text, provider}. Throws if none works. */
export async function chat({ system, messages }) {
  const list = activeProviders();
  if (!list.length) throw new Error('No AI provider is set up');
  const errors = [];
  for (const c of list) {
    try {
      const { text } = await callWithFix(c, system, messages);
      if (text) return { text, provider: c.name };
      errors.push(`${c.name}: empty reply`);
    } catch (e) { errors.push(`${c.name}: ${e.message}`); }
  }
  throw new Error(errors.join(' | '));
}

export async function testProvider(id) {
  const c = config(id);
  if (!c.base) throw new Error('Add the server URL first');
  if (!c.model) throw new Error('Choose a model first');
  if (!c.noKey && !c.key) throw new Error('Add your API key first');
  return callWithFix(c, 'You are a connection test.', [{ role: 'user', content: 'Reply with the single word: ready' }]);
}

export async function listModels(id) {
  const c = config(id);
  if (!c.base) throw new Error('Add the server URL first');
  if (!c.noKey && !c.key) throw new Error('Add your API key first');
  const data = await http(c.base + '/models', { headers: auth(c) }, 20000);
  return (data?.data || []).map(m => String(m.id).replace(/^models\//, '')).sort();
}

/** Pull the first JSON object out of a model reply. */
export function parseJson(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('reply was not JSON');
  return JSON.parse(text.slice(a, b + 1));
}
