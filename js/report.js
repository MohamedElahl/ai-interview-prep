// "Report a mistake" links: open a pre-filled GitHub issue in a new tab.
// Nothing is sent until the person reviews the issue and submits it on GitHub.
import { esc } from './md.js';

const REPO = 'https://github.com/MohamedElahl/ai-interview-prep';
const MAX = 7000; // maximum encoded URL length, well under browser and GitHub limits

const block = (label, value) => value === undefined || value === null || value === '' ? '' : `**${label}:**\n${String(value).includes('\n') ? '```\n' + value + '\n```' : value}\n\n`;

/** Build the issue URL. `where` names the place; `fields` is an ordered list of [label, value]. */
export function reportUrl(where, fields = []) {
  let body = `**Where:** ${where}\n**Page:** ${location.href}\n\n` + fields.map(([k, v]) => block(k, v)).join('') +
    '**What is wrong?**\n<!-- Describe the mistake and, if you know it, the correct answer. -->\n';
  const title = `[Content] ${where}`.slice(0, 120);
  const url = b => `${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(b)}`;
  // Trim the body until the encoded URL is short enough for browsers and GitHub.
  const full = body;
  let cut = full.length;
  while (url(body).length > MAX && cut > 200) { cut = Math.floor(cut * 0.85); body = full.slice(0, cut) + '\n…(trimmed)\n'; }
  return url(body);
}

export const reportLink = (where, fields, label = 'Report a mistake') =>
  `<a class="report" href="${esc(reportUrl(where, fields))}" target="_blank" rel="noopener" title="Opens a pre-filled GitHub issue in a new tab">⚑ ${esc(label)}</a>`;

/** Fields describing one lesson or quiz step, including what the site considers correct. */
export function stepFields(s) {
  const f = [['Question', s.q || s.h], ['Code', s.code]];
  if (s.t === 'info') f.push(['Card text', s.b]);
  if (s.t === 'mc') f.push(['Options (first is marked correct)', s.o.map((o, i) => `${i ? '-' : '✓'} ${o}`).join('\n')]);
  if (s.t === 'fill') f.push(['Options (first is marked correct)', s.o.map((o, i) => `${i ? '-' : '✓'} ${o}`).join('\n')]);
  if (s.t === 'tf') f.push(['Marked correct', s.a ? 'True' : 'False']);
  if (s.t === 'type') f.push(['Accepted answers', (s.a || []).join(' | ') + (Number.isFinite(s.num) ? ` (numeric ${s.num}, tolerance ${s.tol})` : '')]);
  if (s.t === 'order') f.push(['Order marked correct', s.lines.join('\n')]);
  if (s.t === 'match') f.push(['Pairs marked correct', s.pairs.map(p => `${p[0]} → ${p[1]}`).join('\n')]);
  f.push(['Explanation shown', s.w], ['Step id', s._id], ['Type', s.gen ? `${s.t} (generated exercise, level ${s.level})` : s.t]);
  return f;
}
