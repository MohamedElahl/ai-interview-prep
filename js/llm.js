// Optional AI providers. Keys are typed by the user in Settings and stay in this browser.
// Requests go straight from the browser to the provider chosen; nothing passes through a server of ours.
// Every provider here speaks the OpenAI-compatible chat API.
import { store } from './store.js';

export const PRESETS = {
  groq: { name: 'Groq', base: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', keyUrl: 'https://console.groq.com/keys', note: 'Free tier and very fast, so it suits voice interviews.' },
  ollama: { name: 'Ollama (local, offline)', base: 'http://localhost:11434/v1', model: '', noKey: true, editBase: true, note: 'Runs Qwen, Llama or any model on your own PC. No key, no limits.' },
  gemini: { name: 'Google Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash', keyUrl: 'https://aistudio.google.com/apikey', note: 'Free tier.' },
  openrouter: { name: 'OpenRouter', base: 'https://openrouter.ai/api/v1', model: '', keyUrl: 'https://openrouter.ai/keys', note: 'One key for many models, some of them free.' },
  custom: { name: 'Custom (OpenAI-compatible)', base: '', model: '', editBase: true, noKey: true, note: 'LM Studio, vLLM, or any other compatible endpoint.' }
};

export function config(id) {
  const p = PRESETS[id], u = store.state.providers[id] || {};
  return { id, ...p, enabled: !!u.enabled, key: u.key || '', base: (u.base || p.base).replace(/\/+$/, ''), model: u.model || p.model };
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
    body: JSON.stringify({ model: c.model, messages: [{ role: 'system', content: system }, ...messages] })
  }, 120000);
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string') throw new Error('empty reply');
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim(); // some local models print their reasoning
}

/** Try each enabled provider in order. Returns {text, provider}. Throws if none works. */
export async function chat({ system, messages }) {
  const list = activeProviders();
  if (!list.length) throw new Error('No AI provider is set up');
  const errors = [];
  for (const c of list) {
    try {
      const text = await call(c, system, messages);
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
  return call(c, 'You are a connection test.', [{ role: 'user', content: 'Reply with the single word: ready' }]);
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
