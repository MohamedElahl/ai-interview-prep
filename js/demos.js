// Interactive demos embedded in lessons with a line like [[demo:name]].
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const colors = () => ({ fg: cssVar('--fg'), muted: cssVar('--muted'), line: cssVar('--line'), accent: cssVar('--accent'), bad: cssVar('--bad'), ok: cssVar('--ok'), bg: cssVar('--code-bg') });
const SENSOR = { camera: '#3b82c4', radar: '#d9822b', lidar: '#8e5bd0', ultrasonic: '#2f9e77' };

function mkCanvas(host, w, h) {
  const c = document.createElement('canvas'), r = window.devicePixelRatio || 1;
  c.width = w * r; c.height = h * r;
  c.style.cssText = `width:100%;max-width:${w}px;aspect-ratio:${w}/${h};display:block;touch-action:none`;
  const g = c.getContext('2d'); g.scale(r, r);
  host.append(c);
  return [c, g];
}
const pointer = (c, e, w) => { const b = c.getBoundingClientRect(), s = w / b.width; return [(e.clientX - b.left) * s, (e.clientY - b.top) * s]; };
function rng(seed) { // small seeded generator, so a run can be redrawn identically
  let a = seed >>> 0;
  const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { u, n: () => Math.sqrt(-2 * Math.log(u() || 1e-9)) * Math.cos(2 * Math.PI * u()) };
}

const DEMOS = {
  gd(el) {
    el.innerHTML = `<b>Gradient descent on f(x) = x²</b>
      <div class="row"><label>Learning rate <input type="range" min="0.02" max="1.1" step="0.02" value="0.1"> <output></output></label>
      <button data-a="step">Step</button><button data-a="run">Run 20 steps</button><button data-a="reset">Reset</button></div>
      <div class="cv"></div><p class="small" data-info></p>`;
    const [, g] = mkCanvas(el.querySelector('.cv'), 560, 240);
    const range = el.querySelector('input'), out = el.querySelector('output'), info = el.querySelector('[data-info]');
    let xs = [-4];
    const X = x => 280 + x * 50, Y = y => 225 - Math.min(y, 26) * 8;
    const draw = () => {
      const k = colors(), lr = +range.value;
      out.textContent = lr.toFixed(2);
      g.clearRect(0, 0, 560, 240);
      g.strokeStyle = k.line; g.lineWidth = 1; g.beginPath(); g.moveTo(20, 225); g.lineTo(540, 225); g.stroke();
      g.strokeStyle = k.muted; g.lineWidth = 2; g.beginPath();
      for (let x = -5.1; x <= 5.1; x += 0.1) g.lineTo(X(x), Y(x * x));
      g.stroke();
      const vis = xs.filter(x => Math.abs(x) <= 5.2);
      g.strokeStyle = k.accent; g.lineWidth = 1.5; g.beginPath(); vis.forEach(x => g.lineTo(X(x), Y(x * x))); g.stroke();
      vis.forEach((x, i) => { g.fillStyle = i === vis.length - 1 ? k.accent : k.muted; g.beginPath(); g.arc(X(x), Y(x * x), i === vis.length - 1 ? 6 : 3, 0, 7); g.fill(); });
      const x = xs[xs.length - 1];
      const verdict = lr > 1 ? 'Diverging: every step overshoots further than the last.' : lr === 1 ? 'Stuck: it jumps between two points for ever.' : lr > 0.5 ? 'Overshoots and oscillates, but still converges.' : lr < 0.06 ? 'Converges, but very slowly.' : 'Converges smoothly.';
      info.textContent = `Step ${xs.length - 1}: x = ${Math.abs(x) > 1e6 ? x.toExponential(1) : x.toFixed(4)}, loss = ${x * x > 1e6 ? (x * x).toExponential(1) : (x * x).toFixed(4)}. ${verdict}`;
    };
    const step = n => { for (let i = 0; i < n; i++) { const x = xs[xs.length - 1]; xs.push(x - +range.value * 2 * x); } draw(); };
    el.querySelector('[data-a=step]').onclick = () => step(1);
    el.querySelector('[data-a=run]').onclick = () => step(20);
    el.querySelector('[data-a=reset]').onclick = () => { xs = [-4]; draw(); };
    range.oninput = () => { xs = [-4]; draw(); };
    draw();
  },

  threshold(el) {
    const r = rng(7), clamp = v => Math.min(0.98, Math.max(0.02, v));
    const pos = Array.from({ length: 30 }, () => clamp(0.66 + 0.17 * r.n())), neg = Array.from({ length: 30 }, () => clamp(0.36 + 0.17 * r.n()));
    el.innerHTML = `<b>Decision threshold</b>
      <div class="row"><label>Threshold <input type="range" min="0.05" max="0.95" step="0.01" value="0.5"> <output></output></label></div>
      <div class="cv"></div><p class="small" data-info></p>`;
    const [, g] = mkCanvas(el.querySelector('.cv'), 560, 150);
    const range = el.querySelector('input'), out = el.querySelector('output'), info = el.querySelector('[data-info]');
    const draw = () => {
      const k = colors(), t = +range.value, X = s => 20 + s * 520;
      out.textContent = t.toFixed(2);
      g.clearRect(0, 0, 560, 150);
      g.fillStyle = k.bg; g.fillRect(X(t), 0, 540 - X(t), 150);
      g.font = '12px system-ui'; g.fillStyle = k.muted;
      g.fillText('Actual positives', 20, 16); g.fillText('Actual negatives', 20, 86); g.fillText('predicted positive →', Math.min(X(t) + 6, 420), 146);
      const dots = (arr, y, good) => arr.forEach((s, i) => { g.fillStyle = (s >= t) === good ? k.ok : k.bad; g.beginPath(); g.arc(X(s), y + (i % 3) * 11, 4.5, 0, 7); g.fill(); });
      dots(pos, 32, true); dots(neg, 102, false);
      g.strokeStyle = k.fg; g.lineWidth = 2; g.beginPath(); g.moveTo(X(t), 0); g.lineTo(X(t), 150); g.stroke();
      const tp = pos.filter(s => s >= t).length, fp = neg.filter(s => s >= t).length, fn = 30 - tp, tn = 30 - fp;
      const p = tp + fp ? tp / (tp + fp) : 0, rc = tp / 30, f1 = p + rc ? 2 * p * rc / (p + rc) : 0;
      info.textContent = `TP ${tp} · FP ${fp} · FN ${fn} · TN ${tn}   |   precision ${p.toFixed(2)} · recall ${rc.toFixed(2)} · F1 ${f1.toFixed(2)}. Green dots are classified correctly.`;
    };
    range.oninput = draw; draw();
  },

  bfs(el) {
    const R = 10, C = 18, S = 30;
    el.innerHTML = `<b>Breadth-first search on a grid</b>
      <div class="row"><button class="primary" data-a="run">Run search</button><button data-a="clear">Clear walls</button><span class="small muted">Click or drag on cells to draw walls.</span></div>
      <div class="cv"></div><p class="small" data-info></p>`;
    const [c, g] = mkCanvas(el.querySelector('.cv'), C * S, R * S), info = el.querySelector('[data-info]');
    let walls = new Set(), seen = new Map(), path = [], timer = null, paint = null;
    for (let r = 1; r < 8; r++) walls.add(r * C + 6);
    for (let r = 3; r < 10; r++) walls.add(r * C + 12);
    const draw = () => {
      const k = colors();
      g.clearRect(0, 0, C * S, R * S);
      for (let r = 0; r < R; r++) for (let q = 0; q < C; q++) {
        const id = r * C + q;
        g.globalAlpha = 1;
        if (walls.has(id)) g.fillStyle = k.fg;
        else if (path.includes(id)) g.fillStyle = k.ok;
        else if (seen.has(id)) { g.fillStyle = k.accent; g.globalAlpha = 0.15 + 0.5 * Math.min(1, seen.get(id) / 30); }
        else g.fillStyle = k.bg;
        g.fillRect(q * S + 1, r * S + 1, S - 2, S - 2);
      }
      g.globalAlpha = 1; g.fillStyle = k.fg; g.font = 'bold 14px system-ui';
      if (!walls.has(0)) g.fillText('S', 10, 21);
      g.fillText('G', (C - 1) * S + 9, (R - 1) * S + 21);
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const reset = () => { stop(); seen = new Map(); path = []; info.textContent = ''; draw(); };
    const run = () => {
      reset();
      const dist = new Map([[0, 0]]), par = new Map(), order = [0], queue = [0], goal = R * C - 1;
      while (queue.length) {
        const id = queue.shift(), r = Math.floor(id / C), q = id % C;
        if (id === goal) break;
        for (const [dr, dq] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nq = q + dq, n = nr * C + nq;
          if (nr < 0 || nq < 0 || nr >= R || nq >= C || walls.has(n) || dist.has(n)) continue;
          dist.set(n, dist.get(id) + 1); par.set(n, id); order.push(n); queue.push(n);
        }
      }
      let i = 0;
      timer = setInterval(() => {
        if (!c.isConnected) return stop();
        for (let s = 0; s < 4 && i < order.length; s++, i++) seen.set(order[i], dist.get(order[i]));
        if (i >= order.length) {
          stop();
          if (dist.has(goal)) { for (let n = goal; n !== undefined; n = par.get(n)) path.push(n); info.textContent = `Shortest path: ${dist.get(goal)} moves. The search visited ${order.length} cells, in order of distance from the start.`; }
          else info.textContent = `No path. The search visited all ${order.length} reachable cells.`;
        }
        draw();
      }, 25);
    };
    const cell = e => { const [x, y] = pointer(c, e, C * S); return Math.floor(y / S) * C + Math.floor(x / S); };
    const edit = id => { if (id <= 0 || id >= R * C - 1) return; if (paint) walls.add(id); else walls.delete(id); };
    c.onpointerdown = e => { reset(); const id = cell(e); paint = !walls.has(id); edit(id); draw(); c.setPointerCapture(e.pointerId); };
    c.onpointermove = e => { if (paint === null || !e.buttons) return; edit(cell(e)); draw(); };
    c.onpointerup = () => { paint = null; };
    el.querySelector('[data-a=run]').onclick = run;
    el.querySelector('[data-a=clear]').onclick = () => { walls = new Set(); reset(); };
    draw();
  },

  conv(el) {
    const N = 64, K = {
      'Identity': [0, 0, 0, 0, 1, 0, 0, 0, 0], 'Blur (box)': Array(9).fill(1 / 9), 'Sharpen': [0, -1, 0, -1, 5, -1, 0, -1, 0],
      'Sobel X (vertical edges)': [-1, 0, 1, -2, 0, 2, -1, 0, 1], 'Sobel Y (horizontal edges)': [-1, -2, -1, 0, 0, 0, 1, 2, 1], 'Laplacian (all edges)': [0, 1, 0, 1, -4, 1, 0, 1, 0]
    };
    const src = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = 60 + x * 1.2;
      if (x > 8 && x < 28 && y > 10 && y < 34) v = 225;
      if ((x - 44) ** 2 + (y - 22) ** 2 < 130) v = 25;
      if (Math.abs(x - y + 8) < 2 && y > 38) v = 240;
      if (y > 52 && Math.floor(x / 4) % 2) v = 200;
      src[y * N + x] = v;
    }
    el.innerHTML = `<b>What a convolution kernel does</b>
      <div class="row"><label>Kernel <select>${Object.keys(K).map(n => `<option>${n}</option>`).join('')}</select></label></div>
      <div class="row" style="align-items:flex-start"><figure><canvas width="${N}" height="${N}" class="px"></canvas><figcaption class="small muted">Input</figcaption></figure>
      <table class="kernel"></table><figure><canvas width="${N}" height="${N}" class="px"></canvas><figcaption class="small muted">Output</figcaption></figure></div>
      <p class="small muted">Each output pixel is the sum of the 3×3 neighbourhood multiplied by the kernel. Edge filters show the absolute value.</p>`;
    const [a, b] = el.querySelectorAll('canvas'), sel = el.querySelector('select'), tbl = el.querySelector('table');
    const put = (cv, data) => { const g = cv.getContext('2d'), img = g.createImageData(N, N); for (let i = 0; i < N * N; i++) { const v = Math.max(0, Math.min(255, data[i])); img.data.set([v, v, v, 255], i * 4); } g.putImageData(img, 0, 0); };
    const draw = () => {
      const k = K[sel.value], out = new Float32Array(N * N), edge = Math.abs(k.reduce((s, v) => s + v, 0)) < 1e-6;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let s = 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += k[(j + 1) * 3 + i + 1] * src[Math.min(N - 1, Math.max(0, y + j)) * N + Math.min(N - 1, Math.max(0, x + i))];
        out[y * N + x] = edge ? Math.abs(s) : s;
      }
      put(b, out);
      tbl.innerHTML = [0, 1, 2].map(r => '<tr>' + [0, 1, 2].map(q => `<td>${+k[r * 3 + q].toFixed(2)}</td>`).join('') + '</tr>').join('');
    };
    put(a, src); sel.onchange = draw; draw();
  },

  iou(el) {
    const W = 420, H = 250, A = [90, 60, 250, 200], B = { x: 170, y: 100, w: 160, h: 110 };
    el.innerHTML = `<b>Intersection over union</b><div class="cv"></div>
      <div class="row"><label>Move box: x <input type="range" data-k="x" min="0" max="${W - B.w}" value="${B.x}"></label><label>y <input type="range" data-k="y" min="0" max="${H - B.h}" value="${B.y}"></label></div>
      <p class="small" data-info></p>`;
    const [c, g] = mkCanvas(el.querySelector('.cv'), W, H), info = el.querySelector('[data-info]');
    const sl = Object.fromEntries([...el.querySelectorAll('input')].map(i => [i.dataset.k, i]));
    const draw = () => {
      const k = colors(), b = [B.x, B.y, B.x + B.w, B.y + B.h];
      const iw = Math.min(A[2], b[2]) - Math.max(A[0], b[0]), ih = Math.min(A[3], b[3]) - Math.max(A[1], b[1]);
      const inter = iw > 0 && ih > 0 ? iw * ih : 0, uni = (A[2] - A[0]) * (A[3] - A[1]) + B.w * B.h - inter, v = inter / uni;
      g.clearRect(0, 0, W, H); g.fillStyle = k.bg; g.fillRect(0, 0, W, H);
      if (inter) { g.fillStyle = k.accent; g.globalAlpha = 0.35; g.fillRect(Math.max(A[0], b[0]), Math.max(A[1], b[1]), iw, ih); g.globalAlpha = 1; }
      g.lineWidth = 2.5; g.strokeStyle = k.accent; g.setLineDash([]); g.strokeRect(A[0], A[1], A[2] - A[0], A[3] - A[1]);
      g.strokeStyle = k.fg; g.setLineDash([7, 5]); g.strokeRect(B.x, B.y, B.w, B.h); g.setLineDash([]);
      g.fillStyle = k.muted; g.font = '12px system-ui'; g.fillText('ground truth', A[0] + 4, A[1] - 6); g.fillText('prediction (drag me)', B.x + 4, B.y + B.h + 15);
      info.textContent = `IoU = ${inter.toFixed(0)} / ${uni.toFixed(0)} = ${v.toFixed(3)}. ${v >= 0.5 ? 'Counts as a correct detection at the usual 0.5 threshold.' : 'Below 0.5: this would count as a miss plus a false alarm.'}`;
    };
    let drag = null;
    c.onpointerdown = e => { const [x, y] = pointer(c, e, W); if (x >= B.x && x <= B.x + B.w && y >= B.y && y <= B.y + B.h) { drag = [x - B.x, y - B.y]; c.setPointerCapture(e.pointerId); } };
    c.onpointermove = e => { if (!drag) return; const [x, y] = pointer(c, e, W); B.x = Math.max(0, Math.min(W - B.w, x - drag[0])); B.y = Math.max(0, Math.min(H - B.h, y - drag[1])); sl.x.value = B.x; sl.y.value = B.y; draw(); };
    c.onpointerup = () => { drag = null; };
    for (const key of ['x', 'y']) sl[key].oninput = () => { B[key] = +sl[key].value; draw(); };
    draw();
  },

  sampling(el) {
    const toks = ['the', 'a', 'cat', 'dog', 'pizza', 'quantum'], logits = [3.0, 2.4, 1.6, 1.2, 0.3, -0.8];
    el.innerHTML = `<b>Next-token probabilities</b>
      <div class="row"><label>Temperature <input type="range" data-k="t" min="0.1" max="2" step="0.1" value="1"> <output data-o="t"></output></label>
      <label>Top-k <input type="range" data-k="k" min="1" max="6" step="1" value="6"> <output data-o="k"></output></label><button>Sample 12 tokens</button></div>
      <div class="bars"></div><p class="small" data-info></p>`;
    const q = s => el.querySelector(s), bars = q('.bars');
    let probs = [];
    const draw = () => {
      const t = +q('[data-k=t]').value, k = +q('[data-k=k]').value;
      q('[data-o=t]').textContent = t.toFixed(1); q('[data-o=k]').textContent = k;
      const z = logits.map((l, i) => i < k ? l / t : -Infinity), m = Math.max(...z), e = z.map(v => Math.exp(v - m)), s = e.reduce((x, y) => x + y, 0);
      probs = e.map(v => v / s);
      bars.innerHTML = toks.map((tok, i) => `<div class="barrow"><span>${tok}</span><div class="bar"><i style="width:${(probs[i] * 100).toFixed(1)}%"></i></div><span>${(probs[i] * 100).toFixed(1)}%</span></div>`).join('');
      q('[data-info]').textContent = t <= 0.3 ? 'Low temperature: almost always the top token.' : t >= 1.5 ? 'High temperature: unlikely tokens get real probability.' : '';
    };
    q('button').onclick = () => {
      const out = [];
      for (let n = 0; n < 12; n++) { let u = Math.random(), i = 0; while (i < probs.length - 1 && (u -= probs[i]) > 0) i++; out.push(toks[i]); }
      q('[data-info]').textContent = 'Sampled: ' + out.join(' ');
    };
    el.querySelectorAll('input').forEach(i => i.oninput = draw);
    draw();
  },

  sensors(el) {
    const W = 560, H = 380, EX = 280, EY = 356, sc = m => 22 * Math.sqrt(m);
    const SPEC = [
      { id: 'camera', name: 'Camera', range: 150, fov: 50, f: { clear: 1, night: 0.35, fog: 0.25, rain: 0.5 } },
      { id: 'radar', name: 'Radar', range: 200, fov: 20, f: { clear: 1, night: 1, fog: 0.95, rain: 0.9 } },
      { id: 'lidar', name: 'Lidar', range: 120, fov: 360, f: { clear: 1, night: 1, fog: 0.35, rain: 0.5 } },
      { id: 'ultrasonic', name: 'Ultrasonic', range: 5, fov: 360, f: { clear: 1, night: 1, fog: 1, rain: 1 } }
    ];
    el.innerHTML = `<b>Which sensor sees what?</b>
      <div class="row">${SPEC.map(s => `<label><input type="checkbox" data-s="${s.id}" checked> <span style="color:${SENSOR[s.id]}">■</span> ${s.name}</label>`).join('')}</div>
      <div class="row"><label>Conditions <select><option value="clear">Clear day</option><option value="night">Night</option><option value="fog">Fog</option><option value="rain">Heavy rain</option></select></label>
      <label>Lead car distance <input type="range" min="4" max="200" value="60"> <output></output></label></div>
      <div class="cv"></div><div data-table></div>
      <p class="small muted">Top view, car at the bottom. Distances are compressed (square-root scale) so that 1 m and 200 m fit together. Ranges are typical values for illustration.</p>`;
    const [, g] = mkCanvas(el.querySelector('.cv'), W, H);
    const sel = el.querySelector('select'), dist = el.querySelector('input[type=range]'), out = el.querySelector('output');
    const draw = () => {
      const k = colors(), cond = sel.value, d = +dist.value;
      out.textContent = d + ' m';
      const objs = [{ n: 'Lead car', d, a: 0 }, { n: 'Pedestrian', d: 15, a: -20 }, { n: 'Motorcycle', d: 70, a: 12 }, { n: 'Kerb', d: 1.2, a: 85 }];
      const on = SPEC.filter(s => el.querySelector(`[data-s=${s.id}]`).checked);
      const sees = (s, o) => o.d <= s.range * s.f[cond] && Math.abs(o.a) <= s.fov / 2;
      g.clearRect(0, 0, W, H); g.fillStyle = k.bg; g.fillRect(0, 0, W, H);
      for (const s of on) {
        const r = sc(s.range * s.f[cond]), half = s.fov / 2 * Math.PI / 180;
        g.beginPath();
        if (s.fov >= 360) g.arc(EX, EY, r, 0, 2 * Math.PI); else { g.moveTo(EX, EY); g.arc(EX, EY, r, -Math.PI / 2 - half, -Math.PI / 2 + half); g.closePath(); }
        g.fillStyle = SENSOR[s.id]; g.globalAlpha = 0.13; g.fill(); g.globalAlpha = 0.9; g.strokeStyle = SENSOR[s.id]; g.lineWidth = 1.5; g.stroke(); g.globalAlpha = 1;
      }
      g.fillStyle = k.muted; g.font = '11px system-ui';
      for (const m of [5, 25, 50, 100, 200]) { g.fillRect(EX - 4, EY - sc(m), 8, 1); g.fillText(m + ' m', EX + 8, EY - sc(m) + 4); }
      g.fillStyle = k.fg; g.fillRect(EX - 7, EY - 4, 14, 22);
      const rows = objs.map(o => {
        const rad = o.a * Math.PI / 180, x = EX - Math.sin(rad) * sc(o.d), y = EY - Math.cos(rad) * sc(o.d);
        const by = on.filter(s => sees(s, o));
        g.fillStyle = by.length ? k.ok : k.bad; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill();
        g.fillStyle = k.fg; g.font = '12px system-ui'; g.fillText(o.n, x + 10, y + 4);
        return `<tr><td>${o.n} (${o.d} m)</td>${SPEC.map(s => `<td>${!on.includes(s) ? '<span class="muted">off</span>' : sees(s, o) ? '✓' : '–'}</td>`).join('')}<td class="${by.length ? (by.length > 1 ? 'ok' : 'warn') : 'err'}">${by.length ? by.length + (by.length > 1 ? ' sensors (redundant)' : ' sensor only') : 'Not detected'}</td></tr>`;
      });
      el.querySelector('[data-table]').innerHTML = `<table><tr><th>Object</th>${SPEC.map(s => `<th>${s.name}</th>`).join('')}<th>Fused result</th></tr>${rows.join('')}</table>`;
    };
    el.querySelectorAll('input,select').forEach(i => i.oninput = draw);
    draw();
  },

  kalman(el) {
    const W = 560, H = 260, N = 120, dt = 0.1;
    el.innerHTML = `<b>Fusing radar and camera with a Kalman filter</b>
      <div class="row"><label><span style="color:${SENSOR.radar}">●</span> Radar noise <input type="range" data-k="r" min="0.2" max="5" step="0.1" value="1"> <output data-o="r"></output></label>
      <label><span style="color:${SENSOR.camera}">●</span> Camera noise <input type="range" data-k="c" min="0.2" max="8" step="0.1" value="3"> <output data-o="c"></output></label></div>
      <div class="row"><label><input type="checkbox" data-k="drop"> Radar drops out from 4 s to 8 s</label><button>New run</button></div>
      <div class="cv"></div><p class="small" data-info></p>
      <p class="small muted">The plot shows the error of each distance measurement against the true distance over 12 seconds. The thick line is the fused estimate.</p>`;
    const [, g] = mkCanvas(el.querySelector('.cv'), W, H), q = s => el.querySelector(s);
    let seed = 3, noise;
    const gen = () => { const r = rng(seed); noise = { a: Array.from({ length: N }, r.n), r: Array.from({ length: N }, r.n), c: Array.from({ length: N }, r.n) }; };
    const draw = () => {
      const k = colors(), sr = +q('[data-k=r]').value, sc2 = +q('[data-k=c]').value, drop = q('[data-k=drop]').checked;
      q('[data-o=r]').textContent = sr.toFixed(1) + ' m'; q('[data-o=c]').textContent = sc2.toFixed(1) + ' m';
      let p = 10, v = 6, x = [10, 0], P = [[25, 0], [0, 25]];
      const qa = 6.25, Q = [[dt ** 4 / 4 * qa, dt ** 3 / 2 * qa], [dt ** 3 / 2 * qa, dt * dt * qa]];
      const er = [], ec = [], ef = [];
      const update = (z, R) => { const S = P[0][0] + R, K0 = P[0][0] / S, K1 = P[1][0] / S, y = z - x[0]; x = [x[0] + K0 * y, x[1] + K1 * y]; P = [[(1 - K0) * P[0][0], (1 - K0) * P[0][1]], [P[1][0] - K1 * P[0][0], P[1][1] - K1 * P[0][1]]]; };
      for (let i = 0; i < N; i++) {
        v += noise.a[i] * 0.25; p += v * dt;
        x = [x[0] + dt * x[1], x[1]];
        const a = P[0][0] + dt * (P[1][0] + P[0][1]) + dt * dt * P[1][1], b = P[0][1] + dt * P[1][1], c2 = P[1][0] + dt * P[1][1];
        P = [[a + Q[0][0], b + Q[0][1]], [c2 + Q[1][0], P[1][1] + Q[1][1]]];
        const zr = p + noise.r[i] * sr, zc = p + noise.c[i] * sc2, off = drop && i >= 40 && i < 80;
        if (!off) update(zr, sr * sr);
        update(zc, sc2 * sc2);
        er.push(off ? null : zr - p); ec.push(zc - p); ef.push(x[0] - p);
      }
      const X = i => 36 + i * (W - 50) / (N - 1), Y = e => H / 2 - Math.max(-9, Math.min(9, e)) * (H / 2 - 14) / 9;
      g.clearRect(0, 0, W, H); g.fillStyle = k.bg; g.fillRect(0, 0, W, H);
      if (drop) { g.fillStyle = k.line; g.fillRect(X(40), 0, X(80) - X(40), H); }
      g.strokeStyle = k.muted; g.lineWidth = 1; g.beginPath(); g.moveTo(36, H / 2); g.lineTo(W - 14, H / 2); g.stroke();
      g.fillStyle = k.muted; g.font = '11px system-ui';
      for (const e of [-6, -3, 0, 3, 6]) g.fillText((e > 0 ? '+' : '') + e + ' m', 2, Y(e) + 4);
      g.fillText('true distance', W - 90, H / 2 - 5);
      const dots = (arr, col) => { g.fillStyle = col; g.globalAlpha = 0.75; arr.forEach((e, i) => { if (e !== null) { g.beginPath(); g.arc(X(i), Y(e), 2.4, 0, 7); g.fill(); } }); g.globalAlpha = 1; };
      dots(ec, SENSOR.camera); dots(er, SENSOR.radar);
      g.strokeStyle = k.fg; g.lineWidth = 2.5; g.beginPath(); ef.forEach((e, i) => g.lineTo(X(i), Y(e))); g.stroke();
      const rmse = a => { const s = a.filter(e => e !== null).slice(10); return Math.sqrt(s.reduce((t, e) => t + e * e, 0) / s.length); };
      const best = rmse(ef) < Math.min(rmse(er), rmse(ec));
      q('[data-info]').textContent = `Typical error (RMSE): radar ${rmse(er).toFixed(2)} m · camera ${rmse(ec).toFixed(2)} m · fused ${rmse(ef).toFixed(2)} m. ${best ? 'The fused estimate beats both sensors because it also uses the motion model.' : 'Here the filter is not better than the best sensor: its fixed motion model is the limit.'}`;
    };
    el.querySelectorAll('input').forEach(i => i.oninput = draw);
    q('button').onclick = () => { seed++; gen(); draw(); };
    gen(); draw();
  }
};

export function mountDemos(root) {
  root.querySelectorAll('[data-demo]').forEach(el => {
    const f = DEMOS[el.dataset.demo];
    if (!f) return;
    el.classList.add('card');
    try { f(el); } catch (e) { el.textContent = 'This demo could not start.'; console.error(e); }
  });
}
