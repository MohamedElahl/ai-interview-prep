// Content registry. To add a topic: add an object to a file in /content and a
// "=== topic-id ===" section to the matching .md file. No other code changes needed.
import foundations from '../content/foundations.js';
import ml from '../content/ml.js';
import dl from '../content/dl.js';
import genai from '../content/genai.js';
import production from '../content/production.js';
import special from '../content/special.js';
import fusion from '../content/fusion.js';
import career from '../content/career.js';

export const MODULES = [
  { id: 'foundations', title: 'Foundations', topics: foundations },
  { id: 'ml', title: 'Core machine learning', topics: ml },
  { id: 'dl', title: 'Deep learning', topics: dl },
  { id: 'genai', title: 'GenAI and LLMs', topics: genai },
  { id: 'production', title: 'MLOps and system design', topics: production },
  { id: 'special', title: 'Computer vision and NLP', topics: special },
  { id: 'fusion', title: 'Sensor fusion and perception', topics: fusion },
  { id: 'career', title: 'Interview skills, Egypt and remote', topics: career }
];

export const TRACKS = [
  { id: 'all', name: 'All roles' },
  { id: 'mle', name: 'ML Engineer' },
  { id: 'ds', name: 'Data Scientist' },
  { id: 'genai', name: 'GenAI / LLM Engineer' },
  { id: 'mlops', name: 'MLOps' },
  { id: 'nlp', name: 'NLP' },
  { id: 'cv', name: 'Computer Vision' },
  { id: 'auto', name: 'Automotive / Perception' },
  { id: 'da', name: 'Data Analyst' }
];

export const TOPICS = MODULES.flatMap(m => m.topics.map(t => ({
  tasks: [], quiz: [], interview: [], tracks: ['all'], ...t, module: m.id
})));

export const topicById = id => TOPICS.find(t => t.id === id);
export const inTrack = (t, tr) => tr === 'all' || t.tracks.includes('all') || t.tracks.includes(tr);

const cache = {};
export async function loadLesson(t) {
  cache[t.module] ??= fetch(`content/${t.module}.md`)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(text => {
      const parts = text.split(/^===\s*([\w-]+)\s*===\s*$/m);
      const map = {};
      for (let i = 1; i < parts.length; i += 2) map[parts[i]] = parts[i + 1].trim();
      return map;
    });
  try { return (await cache[t.module])[t.id] || '*Lesson coming soon.*'; }
  catch (e) { delete cache[t.module]; return 'Could not load this lesson (' + e.message + '). Check your connection and reload.'; }
}
