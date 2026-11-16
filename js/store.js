// All progress lives in this browser's localStorage. No account, no server.
const KEY = 'aiprep.v1';
const defaults = () => ({
  theme: '', track: 'all', tasks: {}, quiz: {}, interviews: [],
  providers: {}, primary: 'groq',
  voice: { tts: true, auto: true, rate: 1, lang: 'en-US', name: '' },
  scratch: ''
});
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

let s = defaults();
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  s = { ...s, ...saved, voice: { ...s.voice, ...(saved.voice || {}) } };
} catch { /* storage blocked: run in memory */ }
let timer;

export const store = {
  get state() { return s; },
  save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } },
  saveSoon() { clearTimeout(timer); timer = setTimeout(() => this.save(), 400); },

  task(id) { return s.tasks[id] || { best: 0, attempts: 0 }; },
  setTaskScore(id, score) {
    const t = s.tasks[id] ||= { best: 0, attempts: 0 };
    t.attempts++; t.last = score; t.best = Math.max(t.best, score);
    this.save();
  },
  setTaskCode(id, code) { (s.tasks[id] ||= { best: 0, attempts: 0 }).code = code; this.saveSoon(); },
  setQuiz(id, score) {
    const q = s.quiz[id] ||= { best: 0, attempts: 0 };
    q.attempts++; q.last = score; q.best = Math.max(q.best, score);
    this.save();
  },
  // Topic score = average of (coding tasks, quiz), each 0..1, whichever the topic has.
  topicScore(t) {
    const parts = [];
    if (t.tasks.length) parts.push(avg(t.tasks.map(k => this.task(k.id).best)));
    if (t.quiz.length) parts.push(s.quiz[t.id]?.best || 0);
    const started = t.tasks.some(k => s.tasks[k.id]?.attempts) || !!s.quiz[t.id];
    return { pct: Math.round(100 * avg(parts)), started };
  },
  addInterview(r) { s.interviews.unshift(r); s.interviews = s.interviews.slice(0, 50); this.save(); },

  // API keys are never exported.
  export() {
    const c = JSON.parse(JSON.stringify(s));
    for (const p of Object.values(c.providers)) delete p.key;
    return JSON.stringify(c, null, 2);
  },
  import(text) {
    const d = JSON.parse(text);
    if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('Not a progress file');
    const keys = Object.entries(s.providers).map(([k, v]) => [k, v.key]);
    s = { ...defaults(), ...d, voice: { ...defaults().voice, ...(d.voice || {}) } };
    for (const [k, key] of keys) if (key) (s.providers[k] ||= {}).key = key;
    this.save();
  },
  reset() {
    const keep = { providers: s.providers, primary: s.primary, theme: s.theme, voice: s.voice };
    s = { ...defaults(), ...keep };
    this.save();
  }
};
