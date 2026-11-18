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
import extra from '../content/extra.js';
import math from '../content/math.js';
import coding1 from '../content/coding1.js';
import coding2 from '../content/coding2.js';
import sqlbank from '../content/sqlbank.js';
import design from '../content/design.js';

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
import pExtra1 from '../content/paths/extra1.js';
import pExtra2 from '../content/paths/extra2.js';
import pMath from '../content/paths/math.js';
import pCoding1 from '../content/paths/coding1.js';
import pCoding2 from '../content/paths/coding2.js';
import pSqlbank from '../content/paths/sqlbank.js';
import pDesign from '../content/paths/design.js';
import { ROLES, USES } from '../content/roles.js';

const PATHS = { ...pFoundations, ...pMl, ...pDl, ...pSequence, ...pGenai, ...pAgents, ...pProduction, ...pDeploy, ...pSpecial, ...pFusion, ...pCareer, ...pExtra1, ...pExtra2,
  ...pMath, ...pCoding1, ...pCoding2, ...pSqlbank, ...pDesign };

export const MODULES = [
  { id: 'foundations', title: 'Foundations', topics: foundations },
  { id: 'math', title: 'Maths for ML', topics: math },
  { id: 'coding', title: 'Coding interview practice', topics: [] },
  { id: 'ml', title: 'Core machine learning', topics: ml },
  { id: 'dl', title: 'Deep learning', topics: dl },
  { id: 'sequence', title: 'Time series and sequence models', topics: sequence },
  { id: 'genai', title: 'GenAI and LLMs', topics: genai },
  { id: 'agents', title: 'AI agents', topics: agents },
  { id: 'production', title: 'MLOps and system design', topics: production },
  { id: 'deploy', title: 'Deployment: C++, GPU, ECU and cloud', topics: deploy },
  { id: 'special', title: 'Computer vision and NLP', topics: special },
  { id: 'fusion', title: 'Sensor fusion and perception', topics: fusion },
  { id: 'career', title: 'Interview skills and job search', topics: career },
  // Topics added from course curricula; each sets `group` to appear in the module it belongs to.
  { id: 'extra', title: 'More topics', topics: extra },
  { id: 'coding1', title: 'Coding patterns', topics: coding1 },
  { id: 'coding2', title: 'Coding patterns', topics: coding2 },
  { id: 'sqlbank', title: 'SQL practice', topics: sqlbank },
  { id: 'design', title: 'System design cases', topics: design }
];

export { ROLES, PROJECTS, projectById, roleById, roleTopics } from '../content/roles.js';

// "All roles" plus one entry per target job. A topic belongs to a job if the job's roadmap lists it.
export const TRACKS = [{ id: 'all', name: 'All roles' }, ...ROLES.map(r => ({ id: r.id, name: r.title }))];

// A topic may set `group` to appear under another module; its summary still loads from its own file.
export const TOPICS = MODULES.flatMap(m => m.topics.map(t => ({
  tasks: [], quiz: [], interview: [], ...t, module: t.group || m.id, file: m.id,
  path: PATHS[t.id] || [], uses: t.uses || USES[t.id] || []
})));

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
export const levelOf = (i, n) => LEVELS[Math.min(3, Math.floor(i * 4 / Math.max(n, 1)))];

export const topicById = id => TOPICS.find(t => t.id === id);
export const inTrack = (t, tr) => {
  if (tr === 'all') return true;
  const r = ROLES.find(x => x.id === tr);
  return !r || r.stages.some(st => st.topics.includes(t.id));
};

/** Look up one path step from its id "topic:lesson:step" (used by the review pile). */
export function stepById(id) {
  const [tid, li, si] = id.split(':');
  const s = topicById(tid)?.path[+li]?.steps[+si];
  return s && s.t !== 'info' ? { ...s, _id: id } : null;
}

const cache = {};
export async function loadLesson(t) {
  cache[t.file] ??= fetch(`content/${t.file}.md`)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(text => {
      const parts = text.split(/^===\s*([\w-]+)\s*===\s*$/m);
      const map = {};
      for (let i = 1; i < parts.length; i += 2) map[parts[i]] = parts[i + 1].trim();
      return map;
    });
  try { return (await cache[t.file])[t.id] || '*Summary coming soon.*'; }
  catch (e) { delete cache[t.file]; return 'Could not load this summary (' + e.message + '). Check your connection and reload.'; }
}
