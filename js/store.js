// All progress lives in this browser's localStorage. No account, no server.
const KEY = 'aiprep.v1';
const defaults = () => ({
  theme: '', track: 'all', tasks: {}, quiz: {}, interviews: [],
  providers: {}, primary: 'groq',
  voice: { tts: true, auto: true, rate: 1, lang: 'en-US', name: '' },
  scratch: '',
  xp: 0, days: {}, lessons: {}, review: {}, goal: 30, projects: {}
});
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

let s = defaults();
const merge = saved => ({ ...defaults(), ...saved, voice: { ...defaults().voice, ...(saved.voice || {}) } });
try { s = merge(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { /* storage blocked: run in memory */ }
let timer;

export const store = {
  get state() { return s; },
  save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } },
  saveSoon() { clearTimeout(timer); timer = setTimeout(() => this.save(), 400); },

  // XP, daily goal and streak
  addXp(n) { s.xp += n; s.days[dayKey()] = (s.days[dayKey()] || 0) + n; this.save(); },
  todayXp() { return s.days[dayKey()] || 0; },
  streak() {
    const d = new Date();
    if (!s.days[dayKey(d)]) d.setDate(d.getDate() - 1); // today not done yet: streak still alive
    let n = 0;
    while (s.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
  level() { return Math.floor(s.xp / 100) + 1; },

  // Path lessons and the review pile
  lessonDone(id) { return !!s.lessons[id]; },
  completeLesson(id, acc, xp) {
    const l = s.lessons[id] ||= { n: 0, best: 0 };
    l.n++; l.best = Math.max(l.best, acc);
    this.addXp(xp);
  },
  addReview(id) { s.review[id] = 1; this.save(); },
  clearReview(id) { delete s.review[id]; this.save(); },

  // Levelled quizzes: best score per level. The topic’s quiz score weights harder levels more.
  setQuizLevel(id, level, acc) {
    const q = (s.quizLv ||= {})[id] ||= {};
    q[level] = Math.max(q[level] || 0, acc);
    this.setQuiz(id, acc * ({ easy: 0.6, medium: 0.8 }[level] || 1));
  },

  // Project milestones: ticking one earns XP the first time only.
  milestone(pid, i) { return !!s.projects[pid]?.[i]; },
  projectDone(pid, n) { let c = 0; for (let i = 0; i < n; i++) if (s.projects[pid]?.[i]) c++; return c; },
  toggleMilestone(pid, i) {
    const p = s.projects[pid] ||= {};
    if (p[i]) delete p[i];
    else { p[i] = 1; if (!p['xp' + i]) { p['xp' + i] = 1; this.addXp(10); } }
    this.save();
  },

  task(id) { return s.tasks[id] || { best: 0, attempts: 0 }; },
  setTaskScore(id, score) {
    const t = s.tasks[id] ||= { best: 0, attempts: 0 };
    if (score === 1 && t.best < 1) this.addXp(20);
    t.attempts++; t.last = score; t.best = Math.max(t.best, score);
    this.save();
  },
  setTaskCode(id, code) { (s.tasks[id] ||= { best: 0, attempts: 0 }).code = code; this.saveSoon(); },
  setQuiz(id, score) {
    const q = s.quiz[id] ||= { best: 0, attempts: 0 };
    if (score >= 0.8 && q.best < 0.8) this.addXp(10);
    q.attempts++; q.last = score; q.best = Math.max(q.best, score);
    this.save();
  },
  // Topic score = average of (path lessons, coding tasks, quiz), each 0..1, whichever the topic has.
  topicScore(t) {
    const parts = [];
    const pathDone = (t.path || []).filter((l, i) => s.lessons[`${t.id}:${i}`]).length;
    if (t.path?.length) parts.push(pathDone / t.path.length);
    if (t.tasks.length) parts.push(avg(t.tasks.map(k => this.task(k.id).best)));
    if (t.quiz.length) parts.push(s.quiz[t.id]?.best || 0);
    const started = pathDone > 0 || t.tasks.some(k => s.tasks[k.id]?.attempts) || !!s.quiz[t.id];
    return { pct: Math.round(100 * avg(parts)), started, pathDone };
  },
  addInterview(r) { s.interviews.unshift(r); s.interviews = s.interviews.slice(0, 50); this.addXp(15); },

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
    s = merge(d);
    for (const [k, key] of keys) if (key) (s.providers[k] ||= {}).key = key;
    this.save();
  },
  reset() {
    const keep = { providers: s.providers, primary: s.primary, theme: s.theme, voice: s.voice };
    s = { ...defaults(), ...keep };
    this.save();
  }
};
