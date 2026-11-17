// Content registry. To add a topic: add an object to a file in /content, a
// "=== topic-id ===" section to the matching .md file, and (optionally) a learning
// path under the same topic id in /content/paths. No other code changes needed.
import foundations from '../content/foundations.js';
import ml from '../content/ml.js';
import dl from '../content/dl.js';
import sequence from '../content/sequence.js';
import genai from '../content/genai.js';
import agents from '../content/agents.js';
import production from '../content/production.js';
import deploy from '../content/deploy.js';
import special from '../content/special.js';
import fusion from '../content/fusion.js';
import career from '../content/career.js';

import pFoundations from '../content/paths/foundations.js';
import pMl from '../content/paths/ml.js';
import pDl from '../content/paths/dl.js';
import pSequence from '../content/paths/sequence.js';
import pGenai from '../content/paths/genai.js';
import pAgents from '../content/paths/agents.js';
import pProduction from '../content/paths/production.js';
import pDeploy from '../content/paths/deploy.js';
import pSpecial from '../content/paths/special.js';
import pFusion from '../content/paths/fusion.js';
import pCareer from '../content/paths/career.js';

const PATHS = { ...pFoundations, ...pMl, ...pDl, ...pSequence, ...pGenai, ...pAgents, ...pProduction, ...pDeploy, ...pSpecial, ...pFusion, ...pCareer };

export const MODULES = [
  { id: 'foundations', title: 'Foundations', topics: foundations },
  { id: 'ml', title: 'Core machine learning', topics: ml },
  { id: 'dl', title: 'Deep learning', topics: dl },
  { id: 'sequence', title: 'Time series and sequence models', topics: sequence },
  { id: 'genai', title: 'GenAI and LLMs', topics: genai },
  { id: 'agents', title: 'AI agents', topics: agents },
  { id: 'production', title: 'MLOps and system design', topics: production },
  { id: 'deploy', title: 'Deployment: C++, GPU, ECU and cloud', topics: deploy },
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
  tasks: [], quiz: [], interview: [], tracks: ['all'], ...t, module: m.id, path: PATHS[t.id] || []
})));

export const LEVELS = ['Zero', 'Core', 'Advanced', 'Hero'];
export const levelOf = (i, n) => LEVELS[Math.min(3, Math.floor(i * 4 / Math.max(n, 1)))];

export const topicById = id => TOPICS.find(t => t.id === id);
export const inTrack = (t, tr) => tr === 'all' || t.tracks.includes('all') || t.tracks.includes(tr);

/** Look up one path step from its id "topic:lesson:step" (used by the review pile). */
export function stepById(id) {
  const [tid, li, si] = id.split(':');
  const s = topicById(tid)?.path[+li]?.steps[+si];
  return s && s.t !== 'info' ? { ...s, _id: id } : null;
}

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
  try { return (await cache[t.module])[t.id] || '*Summary coming soon.*'; }
  catch (e) { delete cache[t.module]; return 'Could not load this summary (' + e.message + '). Check your connection and reload.'; }
}
