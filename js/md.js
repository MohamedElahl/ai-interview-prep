// Tiny Markdown renderer: headings, lists, tables, fenced code, inline code/bold/italic/links.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function inline(s) {
  s = esc(s);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[i]}</code>`);
}

const BLOCK = /^(#{1,4}\s|```|\s*[-*]\s+|\s*\d+\.\s+|\|)/;

export function md(src) {
  const lines = String(src ?? '').replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  const take = re => { const items = []; while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, '')); return items; };
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
    } else if (/^#{1,4}\s/.test(l)) {
      const h = l.match(/^(#{1,4})\s+(.*)/);
      out.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`); i++;
    } else if (/^\s*[-*]\s+/.test(l)) {
      out.push('<ul>' + take(/^\s*[-*]\s+/).map(x => `<li>${inline(x)}</li>`).join('') + '</ul>');
    } else if (/^\s*\d+\.\s+/.test(l)) {
      out.push('<ol>' + take(/^\s*\d+\.\s+/).map(x => `<li>${inline(x)}</li>`).join('') + '</ol>');
    } else if (/^\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = r => r.replace(/^\||\|\s*$/g, '').split('|').map(c => inline(c.trim()));
      const body = rows.filter(r => !/^\|[\s:|-]+$/.test(r));
      out.push('<table>' + body.map((r, n) => '<tr>' + cells(r).map(c => n ? `<td>${c}</td>` : `<th>${c}</th>`).join('') + '</tr>').join('') + '</table>');
    } else if (/^\[\[demo:[\w-]+\]\]\s*$/.test(l)) {
      out.push(`<div class="demo" data-demo="${l.match(/demo:([\w-]+)/)[1]}"></div>`); i++;
    } else if (!l.trim()) {
      i++;
    } else {
      const p = [lines[i++]];
      while (i < lines.length && lines[i].trim() && !BLOCK.test(lines[i])) p.push(lines[i++]);
      out.push(`<p>${inline(p.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}
