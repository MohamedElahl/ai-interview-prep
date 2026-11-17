// Endless practice: every call builds a new exercise with fresh numbers.
// Answers are computed, so they are always consistent with the question.
// Level 1 = easy, 2 = medium, 3 = hard. Each generator returns one lesson step.

const rnd = Math.random;
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const round = (x, d) => Math.round((x + Number.EPSILON) * 10 ** d) / 10 ** d;
const fmt = x => Number.isInteger(x) ? String(x) : String(round(x, 4));
const sum = a => a.reduce((x, y) => x + y, 0);
const list = a => a.join(', ');
const dpText = d => d === 0 ? ' Round to the nearest whole number.' : ` Round to ${d} decimal place${d > 1 ? 's' : ''}.`;

/** A typed numeric answer. With dp, the learner rounds and is allowed one unit of slack in the last place. */
function num(q, value, w, dp, code) {
  const v = dp == null ? value : round(value, dp);
  return { t: 'type', q: q + (dp == null ? '' : dpText(dp)), num: v, tol: dp == null ? 1e-9 : 1.01 * 10 ** -dp, a: [fmt(v)], w, code };
}
/** A typed text answer, compared case-insensitively. */
const text = (q, answers, w, code) => ({ t: 'type', q, a: answers, w, code });
/** Multiple choice: first option is correct. Duplicates are dropped. */
function choice(q, correct, wrongs, w, code) {
  const seen = new Set([String(correct)]);
  const o = [String(correct)];
  for (const x of wrongs) { const s = String(x); if (!seen.has(s) && o.length < 4) { seen.add(s); o.push(s); } }
  return { t: 'mc', q, o, w, code };
}
const near = (v, spread) => [v + spread, v - spread, v * 2, v + 2 * spread].map(x => fmt(round(x, 4)));
const fromPool = pool => { const p = pick(pool); return choice(p[0], p[1], p.slice(2, 5), p[5]); };
const shapeAns = dims => { const c = dims.join(', '), t = dims.join(','); return [`(${c})`, `(${t})`, c, t, dims.join(' x '), dims.join('x')]; };

const NAMES = ['Ana', 'Ben', 'Chen', 'Dana', 'Eli', 'Fatima', 'Goran', 'Hana', 'Ivan', 'Jin', 'Kofi', 'Lena'];

function table(rows, cols) {
  const w = cols.map((c, i) => Math.max(c.length, ...rows.map(r => String(r[i]).length)));
  const line = r => r.map((v, i) => String(v).padEnd(w[i])).join(' | ');
  return [line(cols), w.map(n => '-'.repeat(n)).join('-+-'), ...rows.map(line)].join('\n');
}

function bfs(grid) {
  const R = grid.length, C = grid[0].length, dist = new Map([['0,0', 0]]), q = [[0, 0]];
  while (q.length) {
    const [r, c] = q.shift();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, k = nr + ',' + nc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc] === '#' || dist.has(k)) continue;
      dist.set(k, dist.get(r + ',' + c) + 1); q.push([nr, nc]);
    }
  }
  return dist.get(`${R - 1},${C - 1}`) ?? -1;
}
function minCoins(coins, amount) {
  const best = [0, ...Array(amount).fill(Infinity)];
  for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a) best[a] = Math.min(best[a], best[a - c] + 1);
  return best[amount] === Infinity ? -1 : best[amount];
}
function lcs(a, b) {
  const d = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]);
  return d[a.length][b.length];
}
const gini = counts => { const n = sum(counts); return 1 - sum(counts.map(c => (c / n) ** 2)); };
const cosine = (a, b) => sum(a.map((x, i) => x * b[i])) / (Math.hypot(...a) * Math.hypot(...b));
const dcg = rels => sum(rels.map((r, i) => r / Math.log2(i + 2)));

const BIG_O = [
  ['for x in items:\n    total += x', 'O(n)'],
  ['for a in items:\n    for b in items:\n        check(a, b)', 'O(n²)'],
  ['i = n\nwhile i > 1:\n    i //= 2', 'O(log n)'],
  ['items.sort()\nfor x in items:\n    print(x)', 'O(n log n)'],
  ['return table[key]   # table is a dict', 'O(1)'],
  ['for x in items:\n    for k in range(10):\n        f(x, k)', 'O(n)'],
  ['for x in items:\n    if x in seen_set:\n        hits += 1', 'O(n)'],
  ['for x in items:\n    if x in other_list:\n        hits += 1   # other_list has n items', 'O(n²)']
];
const ORDERS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];

export const GENERATORS = {
  python(L) {
    if (L === 1) {
      const a = int(7, 60), b = int(2, 7), op = pick(['//', '%']);
      return num(`What does \`${a} ${op} ${b}\` evaluate to in Python?`, op === '//' ? Math.floor(a / b) : a % b, op === '//' ? 'Floor division keeps the whole part.' : '% gives the remainder.');
    }
    if (L === 2) {
      if (rnd() < 0.5) {
        const n = int(6, 9), i = int(0, 2), j = int(i + 2, n - 1), xs = Array.from({ length: n }, (_, k) => (k + 1) * 10);
        return num(`\`xs = [${list(xs)}]\`. How many elements does \`xs[${i}:${j}]\` contain?`, j - i, 'A slice includes the start index and excludes the end index.');
      }
      const xs = Array.from({ length: int(6, 9) }, () => int(1, 6));
      return num(`What is \`len(set([${list(xs)}]))\`?`, new Set(xs).size, 'A set keeps one copy of each distinct value.');
    }
    if (rnd() < 0.5) {
      const n = int(6, 14), k = int(2, 3);
      let s = 0; for (let x = 0; x < n; x++) if (x % k === 0) s += x * x;
      return num(`What does \`sum(x * x for x in range(${n}) if x % ${k} == 0)\` return?`, s, `It squares 0, ${k}, ${2 * k}, … below ${n} and adds them.`);
    }
    const word = pick(['education', 'sequence', 'automation', 'regularise', 'evaluation', 'imputation']);
    return num(`What does \`len([c for c in "${word}" if c in "aeiou"])\` return?`, [...word].filter(c => 'aeiou'.includes(c)).length, 'It counts the vowels.');
  },

  dsa(L) {
    if (L === 1) {
      const k = int(4, 20);
      return num(`A sorted array has ${(2 ** k).toLocaleString('en')} items. Binary search halves the range at each step. How many halvings reduce it to one item?`, k, `2 to the power ${k} is ${(2 ** k).toLocaleString('en')}.`);
    }
    if (L === 2) {
      const [code, ans] = pick(BIG_O);
      return choice('What is the time complexity of this code, for n items?', ans, shuffle(ORDERS.filter(o => o !== ans)), 'Count how the work grows with n.', code);
    }
    const n = int(4, 15);
    if (rnd() < 0.5) return num('How many times is `work()` called?', n * (n - 1) / 2, `0 + 1 + … + ${n - 1} = n(n-1)/2.`, null, `n = ${n}\nfor i in range(n):\n    for j in range(i):\n        work()`);
    return num('How many times is `work()` called?', n * (n + 1) / 2, `${n} + ${n - 1} + … + 1 = n(n+1)/2.`, null, `n = ${n}\nfor i in range(n):\n    for j in range(i, n):\n        work()`);
  },

  'algo-advanced'(L) {
    if (L === 1) {
      const n = int(3, 9), f = [1, 1]; for (let i = 2; i <= n; i++) f[i] = f[i - 1] + f[i - 2];
      return num(`You climb ${n} stairs taking 1 or 2 steps at a time. In how many different ways can you reach the top?`, f[n], 'ways(n) = ways(n-1) + ways(n-2): a dynamic-programming recurrence.');
    }
    if (L === 2) {
      let grid, d;
      do {
        grid = Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => (rnd() < 0.28 ? '#' : '.')));
        grid[0][0] = grid[3][4] = '.';
        d = bfs(grid);
      } while (d < 0);
      return num('Moving up, down, left or right through `.` cells (`#` is a wall), what is the fewest number of moves from the top-left to the bottom-right cell?', d, 'Breadth-first search finds the shortest path when every move costs the same.', null, grid.map(r => r.join(' ')).join('\n'));
    }
    let coins, amount, ans;
    do { coins = pick([[1, 3, 4], [1, 5, 6, 9], [1, 4, 5], [2, 5, 7], [1, 6, 10]]); amount = int(8, 26); ans = minCoins(coins, amount); } while (ans < 0);
    return num(`Coins of value ${list(coins)}, unlimited supply. What is the fewest number of coins that make ${amount}?`, ans, 'Dynamic programming: best[a] = 1 + min(best[a - c]). Greedy can fail here.');
  },

  sql(L) {
    const depts = ['ML', 'Data', 'Web'];
    if (L <= 2) {
      const rows = Array.from({ length: int(6, 8) }, (_, i) => [i + 1, NAMES[i], pick(depts), int(3, 9) * 10000]);
      const tbl = table(rows, ['id', 'name', 'dept', 'salary']);
      if (L === 1) {
        const x = pick([40000, 50000, 60000, 70000]);
        return num(`How many rows does \`SELECT * FROM employees WHERE salary > ${x}\` return?`, rows.filter(r => r[3] > x).length, '`>` is strict: a salary equal to the limit is excluded.', null, tbl);
      }
      const c = {}; rows.forEach(r => c[r[2]] = (c[r[2]] || 0) + 1);
      return num('How many rows does `SELECT dept, COUNT(*) FROM employees GROUP BY dept HAVING COUNT(*) >= 2` return?', Object.values(c).filter(v => v >= 2).length, 'One row per department, then HAVING keeps the groups with at least two people.', null, tbl);
    }
    const counts = Array.from({ length: int(4, 6) }, () => int(0, 3));
    const desc = counts.map((n, i) => `${NAMES[i]}: ${n} order${n === 1 ? '' : 's'}`).join('\n');
    const left = rnd() < 0.6;
    return num(`Customers and how many orders each has. How many rows does \`customers ${left ? 'LEFT JOIN' : 'INNER JOIN'} orders ON orders.customer_id = customers.id\` return?`,
      left ? sum(counts.map(n => Math.max(1, n))) : sum(counts), left ? 'A LEFT JOIN keeps a customer with no orders as one row of NULLs.' : 'An INNER JOIN keeps only matching pairs.', null, desc);
  },

  stats(L) {
    if (L === 1) {
      const xs = Array.from({ length: pick([5, 7]) }, () => int(1, 30));
      if (rnd() < 0.5) return num(`What is the median of ${list(xs)}?`, [...xs].sort((a, b) => a - b)[(xs.length - 1) / 2], 'Sort, then take the middle value.');
      return num(`What is the mean of ${list(xs)}?`, sum(xs) / xs.length, 'Add them up and divide by how many there are.', 1);
    }
    if (L === 2) {
      const p = int(1, 9) / 10, n = int(2, 4);
      return num(`An event has probability ${p} on each independent try. What is the probability it happens at least once in ${n} tries?`, 1 - (1 - p) ** n, '1 minus the probability that it never happens: 1 - (1 - p)^n.', 3);
    }
    const prior = pick([0.01, 0.02, 0.05, 0.1]), sens = pick([0.9, 0.95, 0.99]), spec = pick([0.9, 0.95, 0.98]);
    return num(`A condition affects ${prior * 100}% of people. A test detects ${sens * 100}% of real cases and gives a false positive for ${round((1 - spec) * 100, 1)}% of healthy people. Someone tests positive. What is the probability they have the condition?`,
      prior * sens / (prior * sens + (1 - prior) * (1 - spec)), 'Bayes: true positives divided by all positives.', 2);
  },

  'ml-fundamentals'(L) {
    if (L === 1) { const k = pick([4, 5, 10]); return num(`In ${k}-fold cross-validation, what percentage of the data is used for validation in each round?`, 100 / k, `One fold out of ${k}.`, 1); }
    if (L === 2) {
      const kind = pick(['over', 'under', 'good']);
      const tr = kind === 'over' ? int(96, 100) : kind === 'under' ? int(58, 66) : int(90, 94);
      const va = kind === 'over' ? tr - int(15, 25) : kind === 'under' ? tr - int(0, 3) : tr - int(1, 3);
      const ans = { over: 'Overfitting', under: 'Underfitting', good: 'A reasonable fit' }[kind];
      return choice(`Training accuracy is ${tr}% and validation accuracy is ${va}%. What is the most likely situation?`, ans, ['Overfitting', 'Underfitting', 'A reasonable fit', 'The labels are shuffled'].filter(x => x !== ans), 'Compare the level of the scores and the gap between them.');
    }
    const n = pick([1000, 2000, 2500, 5000]), test = pick([0.2]), k = pick([4, 5]);
    return num(`A dataset has ${n} rows. You hold out ${test * 100}% as a test set, then run ${k}-fold cross-validation on the rest. How many rows are in each validation fold?`, n * (1 - test) / k, `${n * (1 - test)} rows split into ${k} folds.`);
  },

  metrics(L) {
    const tp = int(10, 60), fp = int(2, 30), fn = int(2, 30), tn = int(30, 150);
    if (L === 1) return num(`TP = ${tp}, FP = ${fp}, FN = ${fn}, TN = ${tn}. What is the accuracy, in percent?`, 100 * (tp + tn) / (tp + fp + fn + tn), 'Correct predictions divided by all predictions.', 1);
    if (L === 2) return rnd() < 0.5
      ? num(`TP = ${tp}, FP = ${fp}, FN = ${fn}. What is the precision?`, tp / (tp + fp), 'TP / (TP + FP): how many flagged items were right.', 2)
      : num(`TP = ${tp}, FP = ${fp}, FN = ${fn}. What is the recall?`, tp / (tp + fn), 'TP / (TP + FN): how many real positives were found.', 2);
    const p = tp / (tp + fp), r = tp / (tp + fn);
    return num(`TP = ${tp}, FP = ${fp}, FN = ${fn}. What is the F1 score?`, 2 * p * r / (p + r), 'F1 = 2PR / (P + R).', 2);
  },

  'linear-models'(L) {
    if (L === 1) { const w = int(-5, 6), b = int(-10, 10), x = int(-4, 8); return num(`A linear model has w = ${w} and b = ${b}. What does it predict for x = ${x}?`, w * x + b, 'y = w·x + b.'); }
    if (L === 2) { const w = int(1, 9), g = int(-6, 6) || 3, lr = pick([0.1, 0.01, 0.5]); return num(`w = ${w}, the gradient of the loss with respect to w is ${g}, and the learning rate is ${lr}. What is w after one gradient-descent step?`, w - lr * g, 'w ← w − learning rate × gradient.', 3); }
    const y = [int(1, 9), int(1, 9), int(1, 9)], p = y.map(v => v + int(-3, 3));
    return num(`Targets ${list(y)}, predictions ${list(p)}. What is the mean squared error?`, sum(y.map((v, i) => (p[i] - v) ** 2)) / 3, 'Average of the squared differences.', 2);
  },

  trees(L) {
    if (L === 1) { const a = int(1, 10), b = int(1, 10); return num(`A node holds ${a} samples of class A and ${b} of class B. What is its Gini impurity?`, gini([a, b]), 'Gini = 1 − sum of squared class proportions.', 2); }
    if (L === 2) { const c = [int(1, 8), int(1, 8), int(1, 8)]; return num(`A node holds ${list(c)} samples of three classes. What is its Gini impurity?`, gini(c), 'Gini = 1 − sum of squared class proportions.', 2); }
    const l = [int(1, 9), int(0, 4)], r = [int(0, 4), int(1, 9)], n = sum(l) + sum(r);
    return num(`A split sends [${list(l)}] (class A, class B) left and [${list(r)}] right. What is the weighted Gini impurity of the split?`, (sum(l) * gini(l) + sum(r) * gini(r)) / n, 'Weight each side’s Gini by its share of the samples.', 2);
  },

  'feature-eng'(L) {
    if (L === 1) { const k = int(3, 12); return num(`A column has ${k} distinct categories. One-hot encoding with one column per category creates how many columns?`, k, 'One 0/1 column for each category.'); }
    if (L === 2) { const mean = int(20, 60), sd = pick([4, 5, 8, 10]), x = mean + int(-15, 15); return num(`A feature has mean ${mean} and standard deviation ${sd}. What is the standardised value (z-score) of ${x}?`, (x - mean) / sd, 'z = (x − mean) / standard deviation.', 2); }
    const numeric = int(3, 8), cats = [int(2, 6), int(2, 8)];
    return num(`A table has ${numeric} numeric columns and two categorical columns with ${cats[0]} and ${cats[1]} categories. After one-hot encoding with drop_first=True, how many feature columns are there?`, numeric + cats[0] - 1 + cats[1] - 1, 'drop_first keeps k − 1 columns per categorical feature.');
  },

  'nn-basics'(L) {
    if (L === 1) {
      const x = [int(-3, 3), int(-3, 3)], w = [int(-2, 3), int(-2, 3)], b = int(-4, 4), z = x[0] * w[0] + x[1] * w[1] + b;
      return num(`Inputs [${list(x)}], weights [${list(w)}], bias ${b}. What does a neuron with ReLU activation output?`, Math.max(0, z), `The weighted sum is ${z}; ReLU turns negatives into 0.`);
    }
    if (L === 2) { const a = pick([16, 32, 64, 100, 128]), b = pick([10, 32, 64, 256]); return num(`A dense layer maps ${a} inputs to ${b} outputs. How many parameters does it have, including biases?`, a * b + b, 'inputs × outputs weights, plus one bias per output.'); }
    const layers = [pick([20, 32, 64]), pick([64, 128]), pick([32, 64]), pick([1, 10])];
    return num(`A network has layer sizes ${layers.join(' → ')} (fully connected, with biases). How many parameters in total?`, sum(layers.slice(1).map((o, i) => layers[i] * o + o)), 'Add inputs × outputs + outputs for each layer.');
  },

  transformers(L) {
    if (L === 1) { const n = pick([64, 128, 256, 512, 1000]); return num(`Self-attention over ${n} tokens computes one score per pair of tokens in one head. How many scores?`, n * n, 'n × n: the cost is quadratic in sequence length.'); }
    if (L === 2) { const H = pick([224, 256, 384]), P = H === 224 ? pick([14, 16, 32]) : pick([16, 32]); return num(`A vision transformer cuts a ${H}×${H} image into ${P}×${P} patches. How many patches (tokens)?`, (H / P) ** 2, `(${H}/${P}) squared.`); }
    if (rnd() < 0.5) { const d = pick([256, 512, 768]), h = pick([4, 8, 12].filter(x => d % x === 0)); return num(`d_model = ${d} with ${h} attention heads. What is the dimension of each head?`, d / h, 'The model dimension is split across the heads.'); }
    const d = pick([64, 128, 256]);
    return num(`An attention layer has Q, K, V and output projections, each a ${d}×${d} matrix plus a bias of size ${d}. How many parameters?`, 4 * (d * d + d), '4 × (d² + d).');
  },

  training(L) {
    const N = pick([10000, 12000, 50000, 60000]), B = pick([32, 64, 100, 128, 256]);
    if (L === 1) return num(`${N.toLocaleString('en')} training samples, batch size ${B}, keeping the last partial batch. How many steps per epoch?`, Math.ceil(N / B), 'Divide and round up.');
    if (L === 2) { const E = int(3, 20); return num(`${N.toLocaleString('en')} samples, batch size ${B} (last partial batch kept), ${E} epochs. How many optimisation steps in total?`, Math.ceil(N / B) * E, 'Steps per epoch times epochs.'); }
    if (rnd() < 0.5) { const b = pick([8, 16, 32]), acc = pick([2, 4, 8]), g = pick([1, 2, 4]); return num(`Batch size ${b} per GPU, gradient accumulation over ${acc} steps, ${g} GPU${g > 1 ? 's' : ''}. What is the effective batch size?`, b * acc * g, 'Multiply all three.'); }
    const W = pick([100, 500, 1000]), s = int(0, W - 1), base = pick([0.001, 0.0003, 0.01]);
    return num(`Linear warm-up over ${W} steps to a base rate of ${base}, with rate = base × (step + 1) / ${W}. What is the learning rate at step ${s}? Answer in scientific notation or as a decimal.`, base * (s + 1) / W, 'Linear ramp during warm-up.', 7);
  },

  timeseries(L) {
    const xs = Array.from({ length: 6 }, () => int(10, 40));
    if (L === 1) {
      if (rnd() < 0.5) return num(`Daily sales: ${list(xs)}. What does the naive method forecast for the next day?`, xs[5], 'Naive = the last observed value.');
      const n = pick([100, 365, 500]), lb = pick([7, 14, 30]);
      return num(`A series has ${n} points. With a look-back of ${lb} and a horizon of 1, how many training windows can you build?`, n - lb, 'n − lookback − horizon + 1.');
    }
    if (L === 2) { const k = pick([3, 4]); return num(`Values: ${list(xs)}. What is the moving average of the last ${k} values?`, sum(xs.slice(-k)) / k, 'Mean of the most recent values.', 2); }
    const a = pick([0.2, 0.3, 0.5]), s = int(10, 30), x = int(10, 40);
    return num(`Exponential smoothing with alpha = ${a}. The current smoothed value is ${s} and the new observation is ${x}. What is the new smoothed value?`, a * x + (1 - a) * s, 's = alpha·x + (1 − alpha)·s.', 2);
  },

  rnn(L) {
    const x = pick([8, 10, 16, 32]), h = pick([16, 32, 64, 128]), base = h * x + h * h + h;
    if (L === 1) return num(`A vanilla RNN layer has input size ${x} and hidden size ${h}, with one bias vector. How many parameters?`, base, 'Input weights h·x, recurrent weights h·h, bias h.');
    if (L === 2) return num(`An LSTM layer has input size ${x} and hidden size ${h}, four gates, one bias vector per gate. How many parameters?`, 4 * base, 'Four times the vanilla RNN count.');
    return num(`A GRU layer has input size ${x} and hidden size ${h}, three gates, one bias vector per gate. How many parameters?`, 3 * base, 'Three gate blocks of h·x + h·h + h.');
  },

  'ts-transformers'(L) {
    const Lw = pick([336, 512, 720]);
    if (L === 1) { const P = pick([8, 16, 24].filter(p => Lw % p === 0)); return num(`A window of ${Lw} points is cut into non-overlapping patches of ${P}. How many tokens?`, Lw / P, 'Length divided by patch length.'); }
    if (L === 2) { const P = 16, S = 8; return num(`A window of ${Lw} points, patch length ${P}, stride ${S} (drop the incomplete tail). How many patches?`, Math.floor((Lw - P) / S) + 1, 'floor((L − P) / S) + 1.'); }
    const P = pick([8, 16].filter(p => Lw % p === 0));
    return num(`Attention cost grows with the square of the number of tokens. Patching ${Lw} time steps into non-overlapping patches of ${P} cuts the cost by what factor?`, P * P, `Tokens fall by ${P}, so cost falls by ${P} squared.`);
  },

  'llm-basics'(L) {
    if (L === 1) { const R = int(1, 20) * 1000, T = int(1, 8) * 500; return num(`${R.toLocaleString('en')} requests use ${T.toLocaleString('en')} tokens each. How many million tokens is that?`, R * T / 1e6, 'Multiply, then divide by one million.', 2); }
    if (L === 2) {
      const mi = int(1, 40), mo = int(1, 10), pi = pick([0.5, 1, 2, 3]), po = pick([2, 4, 8, 15]);
      return num(`A month uses ${mi} million input tokens and ${mo} million output tokens. Input costs $${pi} and output $${po} per million tokens. What is the bill in dollars?`, mi * pi + mo * po, 'Price input and output separately, then add.', 2);
    }
    const C = pick([8000, 16000, 32000]), S = pick([1000, 2000]), A = pick([600, 800, 1500]);
    return num(`The context window is ${C.toLocaleString('en')} tokens, the system prompt uses ${S.toLocaleString('en')}, and each conversation turn adds ${A} tokens. How many complete turns fit?`, Math.floor((C - S) / A), '(window − system prompt) / tokens per turn, rounded down.');
  },

  rag(L) {
    if (L === 1) { const W = int(5, 40) * 100, s = pick([200, 300, 500]); return num(`A document has ${W.toLocaleString('en')} words. Chunks of ${s} words with no overlap: how many chunks?`, Math.ceil(W / s), 'Divide and round up: the last chunk may be short.'); }
    if (L === 2) {
      const s = pick([200, 300, 400]), o = pick([50, 100]), W = int(6, 30) * 100, step = s - o;
      return num(`A document has ${W.toLocaleString('en')} words. Chunks are ${s} words long and each starts ${step} words after the previous one (overlap ${o}), stopping once a chunk reaches the end. How many chunks?`, W <= s ? 1 : Math.ceil((W - s) / step) + 1, 'Count the starting positions until a chunk covers the last word.');
    }
    const a = [int(-3, 4), int(-3, 4), int(1, 4)], b = [int(-3, 4), int(-3, 4), int(1, 4)];
    return num(`What is the cosine similarity of [${list(a)}] and [${list(b)}]?`, cosine(a, b), 'Dot product divided by the product of the lengths.', 2);
  },

  'agents-eval'(L) {
    if (L === 1) { const P = int(3, 10), O = int(1, P); return num(`A predicted answer has ${P} tokens, and ${O} of them appear in the reference. What is the token precision?`, O / P, 'Overlap divided by predicted length.', 2); }
    if (L === 2) { const P = int(3, 10), G = int(3, 10), O = int(1, Math.min(P, G)), p = O / P, r = O / G; return num(`Prediction: ${P} tokens. Reference: ${G} tokens. Shared: ${O}. What is the token F1?`, 2 * p * r / (p + r), 'F1 of token precision and recall.', 2); }
    const vocab = ['the', 'model', 'was', 'trained', 'on', 'data', 'last', 'year', 'in', 'cairo', 'paris', 'march'];
    const g = shuffle(vocab).slice(0, int(3, 5)), pred = [...g.slice(0, int(1, g.length)), ...shuffle(vocab.filter(w => !g.includes(w))).slice(0, int(0, 3))];
    const shared = pred.filter(w => g.includes(w)).length, p = shared / pred.length, r = shared / g.length;
    return num(`Reference: "${g.join(' ')}". Prediction: "${pred.join(' ')}". What is the token F1?`, 2 * p * r / (p + r), 'Count shared tokens, then combine precision and recall.', 2);
  },

  'agent-arch'(L) {
    if (L === 1) { const p = pick([0.9, 0.95, 0.99]), n = pick([5, 10, 20]); return num(`Each step of an agent succeeds with probability ${p}, independently. What is the chance that ${n} steps in a row all succeed, in percent?`, 100 * p ** n, 'Reliability compounds: p to the power n.', 0); }
    if (L === 2) { const s = int(4, 12), t = pick([1500, 2000, 3000]), N = pick([100, 500, 1000]); return num(`An agent averages ${s} steps per task and ${t.toLocaleString('en')} tokens per step. How many million tokens for ${N} tasks?`, s * t * N / 1e6, 'Steps × tokens × tasks.', 2); }
    const base = pick([1000, 2000]), g = pick([300, 500, 800]), n = int(4, 10);
    return num(`Each step re-sends the whole history. Step 1 sends ${base + g} tokens, and every step adds ${g} more than the last (step k sends ${base} + ${g}·k). How many tokens are sent over ${n} steps?`, n * base + g * n * (n + 1) / 2, `${base}·n + ${g}·n(n+1)/2: history makes cost grow faster than linearly.`);
  },

  'agent-prod'(L) {
    if (L === 1) { const r = pick([100, 250, 1000]), a = pick([3, 4, 5]); return num(`${r} requests, each retried up to ${a} attempts in total. In the worst case, how many calls reach the downstream service?`, r * a, 'Every request uses every attempt.'); }
    if (L === 2) { const b = pick([0.5, 1, 2]), k = int(3, 6); return num(`Exponential back-off waits ${b} s before the first retry and doubles each time. What is the total wait before the ${k}th retry has started (sum of ${k} waits), in seconds?`, b * (2 ** k - 1), 'b + 2b + 4b + … = b(2^k − 1).', 2); }
    const C = pick([20, 50, 100]), r = pick([2, 5, 10]), T = int(1, Math.floor(C / r) - 1);
    return num(`A token bucket holds ${C} tokens and refills ${r} per second. A burst empties it at t = 0. How many more requests can be accepted during the next ${T} seconds?`, r * T, 'After a burst, throughput is limited by the refill rate.');
  },

  mlops(L) {
    if (L === 1) { const xs = Array.from({ length: pick([5, 7, 9]) }, () => int(10, 200)); return num(`Latencies in ms: ${list(xs)}. What is the median (p50)?`, [...xs].sort((a, b) => a - b)[(xs.length - 1) / 2], 'Sort and take the middle value.'); }
    if (L === 2) { const n = pick([10, 20]), xs = Array.from({ length: n }, () => int(10, 300)), s = [...xs].sort((a, b) => a - b); return num(`Latencies in ms: ${list(xs)}. Using the nearest-rank method (rank = ceil(0.9 × n)), what is the p90?`, s[Math.ceil(0.9 * n) - 1], 'Sort, then take the value at rank ceil(0.9n).'); }
    const e = 50, a = pick([60, 65, 70, 75, 80]), pe = 0.5, pa = a / 100;
    return num(`Training data: 50% of users in bin A and 50% in bin B. Production: ${a}% in A and ${100 - a}% in B. What is the PSI = Σ (actual − expected) × ln(actual / expected)?`, (pa - pe) * Math.log(pa / pe) + ((1 - pa) - (1 - pe)) * Math.log((1 - pa) / (1 - pe)), 'Below 0.1 is stable; above 0.25 is a significant shift.', 3);
  },

  'edge-deploy'(L) {
    if (L === 1) { const f = pick([10, 15, 20, 25, 30, 60]); return num(`A camera runs at ${f} frames per second. How many milliseconds can processing one frame take?`, 1000 / f, '1000 ms divided by the frame rate.', 1); }
    if (L === 2) { const p = pick([5, 12, 25, 60, 100]), [name, bytes] = pick([['float32', 4], ['float16', 2], ['int8', 1]]); return num(`A model has ${p} million parameters stored as ${name}. Roughly how many megabytes (1 MB = 1,000,000 bytes)?`, p * bytes, `${name} uses ${bytes} byte${bytes > 1 ? 's' : ''} per parameter.`); }
    const k = 3, c = pick([32, 64, 128]), o = pick([64, 128, 256]);
    return num(`A ${k}×${k} convolution maps ${c} to ${o} channels (ignore biases). By what factor does a depthwise-separable version cut the weights?`, (k * k * c * o) / (k * k * c + c * o), 'Standard k²·c·o versus k²·c + c·o.', 1);
  },

  'ml-system-design'(L) {
    const k = pick([5, 10]);
    if (L === 1) { const R = int(3, 10), f = int(1, Math.min(R, k)); return num(`A user has ${R} relevant items. ${f} of them appear in the top ${k} results. What is recall@${k}?`, f / R, 'Relevant found divided by all relevant.', 2); }
    if (L === 2) { const f = int(1, k); return num(`${f} of the top ${k} recommended items are relevant. What is precision@${k}?`, f / k, 'Relevant in the top k divided by k.', 2); }
    const rels = Array.from({ length: 3 }, () => int(0, 3));
    if (!sum(rels)) rels[2] = 2;
    return num(`Results are returned with relevance ${list(rels)} (in rank order). What is NDCG@3, with DCG = Σ rel / log2(rank + 1)?`, dcg(rels) / dcg([...rels].sort((a, b) => b - a)), 'DCG divided by the DCG of the ideal order.', 2);
  },

  quantization(L) {
    if (L === 1) { const s = pick([0.1, 0.05, 0.02]), q0 = int(-60, 60), zp = pick([0, 0, 10, -5]); const x = round(q0 * s, 4); return num(`Scale ${s}, zero point ${zp}. What int8 value represents x = ${x}? (q = round(x / scale) + zero_point)`, q0 + zp, 'Divide by the scale, round, add the zero point.'); }
    if (L === 2) { const s = pick([0.1, 0.05, 0.02, 0.5]), zp = pick([0, 10, -5, 128]), q = int(-100, 120); return num(`Scale ${s}, zero point ${zp}. What float does q = ${q} represent? (x = (q − zero_point) × scale)`, (q - zp) * s, 'Subtract the zero point, multiply by the scale.', 2); }
    const a = pick([1, 2, 3]), b = pick([3, 5, 7]), scale = (a + b) / 255;
    return num(`Unsigned 8-bit quantisation (0 to 255) of the range [−${a}, ${b}]: scale = (max − min) / 255. What is the zero point, round(−min / scale)?`, Math.round(a / scale), 'The integer that represents 0.0 exactly.');
  },

  'cpp-deploy'(L) {
    const H = pick([4, 8, 32, 224]), W = pick([6, 8, 32, 224]), C = 3;
    const h = int(0, H - 1), w = int(0, W - 1), c = int(0, C - 1);
    if (L === 1) return num(`A CHW float buffer has H = ${H}, W = ${W}. What is the flat index of channel ${c}, row ${h}, column ${w}? (index = c·H·W + h·W + w)`, c * H * W + h * W + w, 'Whole planes first, then rows, then columns.');
    if (L === 2) return num(`An HWC image (OpenCV layout) has W = ${W} and C = ${C}. What is the flat index of row ${h}, column ${w}, channel ${c}?`, (h * W + w) * C + c, '(h·W + w)·C + c: channels are interleaved.');
    const N = pick([1, 4, 8]), S = pick([32, 64, 96]);
    return num(`How many bytes does a float32 tensor of shape ${N}×3×${S}×${S} occupy?`, N * 3 * S * S * 4, 'Elements × 4 bytes.');
  },

  'cuda-gpu'(L) {
    if (L === 1) { const n = int(1, 200) * 100 + int(0, 99), t = pick([128, 256, 512]); return num(`An array has ${n.toLocaleString('en')} elements and each block has ${t} threads. How many blocks are needed (one thread per element)?`, Math.ceil(n / t), 'Ceiling division: (n + t − 1) / t.'); }
    if (L === 2) { const d = pick([128, 256, 512]), b = int(0, 40), t = int(0, d - 1); return num(`blockDim.x = ${d}. Thread ${t} of block ${b} handles which global index?`, b * d + t, 'blockIdx × blockDim + threadIdx.'); }
    const p = pick([0.5, 0.75, 0.8, 0.9, 0.95]), n = pick([4, 8, 10, 50]);
    return num(`${p * 100}% of the run time is sped up ${n} times on the GPU; the rest is unchanged. What is the overall speed-up? (Amdahl’s law)`, 1 / ((1 - p) + p / n), '1 / ((1 − p) + p / n).', 2);
  },

  'ecu-deploy'(L) {
    const [scale, offset, unit] = pick([[0.5, -40, '°C'], [0.01, 0, 'km/h'], [0.1, 0, 'V'], [0.25, -50, '°C']]);
    if (L === 1) { const raw = int(0, 250); return num(`A CAN signal has scale ${scale} and offset ${offset}. What physical value (${unit}) does raw = ${raw} encode?`, raw * scale + offset, 'physical = raw × scale + offset.', 2); }
    if (L === 2) { const raw = int(0, 250), phys = round(raw * scale + offset, 4); return num(`A CAN signal has scale ${scale} and offset ${offset}. Which raw value encodes ${phys} ${unit}?`, raw, 'raw = (physical − offset) / scale.'); }
    const tasks = [[pick([1, 2]), 10], [pick([2, 3, 5]), 20], [pick([5, 10]), 100]];
    return num(`Three periodic tasks run with worst-case times and periods (ms): ${tasks.map(([c, T]) => `${c} every ${T}`).join(', ')}. What is the CPU utilisation, in percent?`, 100 * sum(tasks.map(([c, T]) => c / T)), 'Sum of execution time divided by period.', 1);
  },

  'cloud-deploy'(L) {
    const cur = int(2, 8), m = pick([30, 45, 70, 90, 120]), t = pick([50, 60, 70]);
    if (L === 1) return num(`${cur} pods run at ${m}% CPU with a ${t}% target. How many pods does the autoscaler want? (ceil(current × metric / target))`, Math.ceil(cur * m / t), 'Scale in proportion to load, rounding up.');
    if (L === 2) { const lo = 2, hi = pick([5, 6, 8]); return num(`${cur} pods at ${m}% CPU, target ${t}%, with min ${lo} and max ${hi} replicas. How many replicas?`, Math.max(lo, Math.min(hi, Math.ceil(cur * m / t))), 'Compute the desired count, then clamp to the limits.'); }
    const peak = int(5, 40) * 100, cap = pick([50, 80, 100, 150]), u = pick([0.6, 0.7, 0.8]);
    return num(`Peak traffic is ${peak.toLocaleString('en')} requests per second. One replica handles ${cap} rps, and you plan for ${u * 100}% utilisation. How many replicas?`, Math.ceil(peak / (cap * u)), 'Peak / (capacity × target utilisation), rounded up.');
  },

  'cv-basics'(L) {
    if (L === 1) { const H = pick([28, 32, 64, 100]), W = pick([28, 32, 64, 200]), C = pick([1, 3]); return num(`An image is ${H} pixels high and ${W} wide with ${C} channel${C > 1 ? 's' : ''}. How many numbers does it contain?`, H * W * C, 'Height × width × channels.'); }
    if (L === 2) { const n = pick([28, 32, 64, 224]), k = pick([3, 5, 7]), s = pick([1, 2]), p = pick([0, 1, Math.floor(k / 2)]); return num(`Input width ${n}, kernel ${k}, stride ${s}, padding ${p}. What is the output width?`, Math.floor((n + 2 * p - k) / s) + 1, 'floor((n + 2p − k) / s) + 1.'); }
    const k = pick([1, 3, 5]), ci = pick([3, 16, 32, 64]), co = pick([16, 32, 64, 128]);
    return num(`A ${k}×${k} convolution maps ${ci} input channels to ${co} output channels. How many parameters, including biases?`, k * k * ci * co + co, 'k·k·c_in·c_out weights plus c_out biases.');
  },

  'cv-detection'(L) {
    const box = () => { const x1 = int(0, 30), y1 = int(0, 30); return [x1, y1, x1 + int(10, 40), y1 + int(10, 40)]; };
    if (L === 1) { const b = box(); return num(`What is the area of the box [${list(b)}] in corner format (x1, y1, x2, y2)?`, (b[2] - b[0]) * (b[3] - b[1]), 'width × height.'); }
    if (L === 2) {
      const a = box(), b = box(), iw = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])), ih = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
      const inter = iw * ih, area = x => (x[2] - x[0]) * (x[3] - x[1]);
      return num(`What is the IoU of boxes [${list(a)}] and [${list(b)}]?`, inter / (area(a) + area(b) - inter), 'Overlap area divided by union area.', 2);
    }
    const A = int(20, 80), B = int(20, 80), I = int(5, Math.min(A, B));
    return num(`A predicted mask has ${A} pixels, the true mask ${B}, and they share ${I}. What is the Dice score?`, 2 * I / (A + B), 'Dice = 2|A∩B| / (|A| + |B|).', 2);
  },

  'cv-geometry'(L) {
    if (L === 1) { const f = pick([500, 800, 1000]), cx = pick([320, 640]), X = int(-3, 3), Z = pick([2, 4, 5, 10]); return num(`A pinhole camera has f = ${f} px and cx = ${cx}. A point is at X = ${X} m, Z = ${Z} m. What is its u coordinate? (u = f·X/Z + cx)`, f * X / Z + cx, 'Project, then shift by the principal point.', 1); }
    if (L === 2) { const f = pick([800, 1000, 1200]), Hm = pick([1.5, 1.7, 1.8]), h = int(20, 120); return num(`Focal length ${f} px. A ${Hm} m tall pedestrian appears ${h} px tall. Roughly how far away are they, in metres? (distance = f × real height / pixel height)`, f * Hm / h, 'Similar triangles.', 1); }
    const d = pick([20, 50, 100]), deg = pick([0.5, 1, 2]);
    return num(`A camera’s yaw is off by ${deg}°. How far sideways is the error for an object ${d} m ahead, in metres?`, d * Math.tan(deg * Math.PI / 180), 'distance × tan(angle).', 2);
  },

  nlp(L) {
    if (L === 1) { const w = pick(['data', 'model', 'cat']), words = shuffle([...Array(int(1, 4)).fill(w), ...shuffle(['the', 'a', 'sat', 'on', 'big', 'new', 'old']).slice(0, 4)]); return num(`In the bag-of-words vector for "${words.join(' ')}", what is the count for "${w}"?`, words.filter(x => x === w).length, 'Bag of words counts each word.'); }
    if (L === 2) { const N = pick([10, 100, 1000]), df = pick([1, 2, 5, 10].filter(x => x <= N)); return num(`A corpus has ${N} documents and a word appears in ${df}. What is its IDF = ln(N / df)?`, Math.log(N / df), 'Rare words get a high IDF.', 2); }
    const vocab = ['a', 'b', 'c', 'd', 'e'], s1 = Array.from({ length: 5 }, () => pick(vocab)), s2 = Array.from({ length: 5 }, () => pick(vocab));
    return num(`What is the length of the longest common subsequence of "${s1.join(' ')}" and "${s2.join(' ')}"?`, lcs(s1, s2), 'Tokens in the same order, not necessarily adjacent. This drives ROUGE-L.');
  },

  sensors(L) {
    if (L === 1) { const t = int(2, 30); return num(`An ultrasonic echo returns after ${t} ms. With sound at 340 m/s, how far is the obstacle, in metres?`, 340 * t / 1000 / 2, 'speed × time / 2: the pulse goes there and back.', 2); }
    if (L === 2) { const v = int(5, 40), fd = Math.round(2 * v * 77e9 / 3e8); return num(`A 77 GHz radar measures a Doppler shift of ${fd.toLocaleString('en')} Hz. Taking c = 3×10^8 m/s, what is the radial speed in m/s? (v = f_d × c / (2 × f_carrier))`, fd * 3e8 / (2 * 77e9), 'About 513 Hz per m/s at 77 GHz.', 1); }
    const B = pick([0.5, 1, 2, 4]);
    return num(`A radar sweeps ${B} GHz of bandwidth. With c = 3×10^8 m/s, what is its range resolution in centimetres? (c / 2B)`, 3e8 / (2 * B * 1e9) * 100, 'More bandwidth, finer range resolution.', 2);
  },

  kalman(L) {
    if (L === 1) { const a = int(10, 50), b = a + int(-6, 6); return num(`Two sensors with equal variance report ${a} m and ${b} m. What is the fused estimate?`, (a + b) / 2, 'Equal trust: the plain average.', 1); }
    if (L === 2) { const P = pick([1, 2, 4, 9]), R = pick([1, 2, 3, 6]); return num(`Prediction variance P = ${P}, measurement variance R = ${R}. What is the Kalman gain K = P / (P + R)?`, P / (P + R), 'Close to 1: trust the sensor; close to 0: trust the prediction.', 2); }
    const x = int(0, 20), P = pick([1, 2, 4]), Q = pick([0.5, 1]), R = pick([1, 2, 4]), z = x + int(1, 8) * pick([-1, 1]), Pp = P + Q, K = Pp / (Pp + R);
    return num(`1-D filter: estimate x = ${x}, P = ${P}, process noise Q = ${Q}, measurement z = ${z} with R = ${R}. After predict (P += Q) and update, what is the new estimate?`, x + K * (z - x), `P becomes ${Pp}, K = ${round(K, 3)}, x' = x + K(z − x).`, 2);
  },

  'fusion-arch'(L) {
    if (L === 1) { const v = pick([10, 20, 30, 40]), dt = pick([0.02, 0.05, 0.1]); return num(`A car moves at ${v} m/s. Two sensors’ timestamps differ by ${dt} s. How many metres of position error does that cause?`, v * dt, 'speed × time offset.', 2); }
    if (L === 2) { const d = pick([30, 50, 100, 150]), deg = pick([0.5, 1, 1.5]); return num(`A ${deg}° misalignment between camera and radar. How many metres of lateral error at ${d} m?`, d * Math.tan(deg * Math.PI / 180), 'distance × tan(angle).', 2); }
    const m1 = int(20, 40), v1 = pick([1, 2, 4]), m2 = m1 + int(-5, 5), v2 = pick([4, 9, 16]);
    return num(`Radar reports ${m1} m with variance ${v1}; camera reports ${m2} m with variance ${v2}. What is the inverse-variance fused estimate?`, (m1 / v1 + m2 / v2) / (1 / v1 + 1 / v2), 'Weight each by 1 / variance.', 2);
  },

  pytorch(L) {
    if (L === 1) { const a = int(2, 8), b = int(2, 8); return text(`Tensors of shape (${a}, 1) and (1, ${b}) are added. What is the result shape? Write it like (2, 3).`, shapeAns([a, b]), 'Size-1 dimensions stretch to match.'); }
    if (L === 2) { const n = int(2, 64), k = int(2, 64), m = int(2, 64); return text(`What is the shape of a (${n}, ${k}) tensor @ a (${k}, ${m}) tensor? Write it like (2, 3).`, shapeAns([n, m]), 'Inner dimensions match and disappear.'); }
    const a = int(2, 6), b = int(2, 6), c = int(2, 6);
    return text(`Shapes (${a}, 1, ${c}) and (${b}, 1) are broadcast together. What is the result shape? Write it like (2, 3, 4).`, shapeAns([a, b, c]), 'Align from the right; each 1 stretches to the other size.');
  },

  unsupervised(L) {
    if (L === 1) {
      const p = [int(0, 10), int(0, 10)], A = [int(0, 10), int(0, 10)], B = [int(0, 10), int(0, 10)], dA = Math.hypot(p[0] - A[0], p[1] - A[1]), dB = Math.hypot(p[0] - B[0], p[1] - B[1]);
      if (Math.abs(dA - dB) < 0.5) return this.unsupervised(1);
      return text(`k-means: point (${list(p)}), centroid A at (${list(A)}), centroid B at (${list(B)}). Which centroid is the point assigned to? Answer A or B.`, [dA < dB ? 'A' : 'B'], 'Each point joins the nearest centroid.');
    }
    if (L === 2) { const xs = Array.from({ length: int(3, 5) }, () => int(1, 20)); return num(`A cluster contains the 1-D points ${list(xs)}. Where does k-means move its centroid?`, sum(xs) / xs.length, 'The new centroid is the mean of its points.', 2); }
    const ev = [int(5, 10), int(2, 5), int(1, 2), 1].sort((a, b) => b - a);
    return num(`PCA eigenvalues are ${list(ev)}. What percentage of the variance do the first two components explain?`, 100 * (ev[0] + ev[1]) / sum(ev), 'Their eigenvalues over the total.', 1);
  },

  recsys(L) {
    const U = pick([1000, 5000, 10000]), I = pick([200, 500, 2000]);
    if (L === 1) return num(`${U.toLocaleString('en')} users and ${I.toLocaleString('en')} items. How many cells does the full user–item matrix have?`, U * I, 'Users × items.');
    if (L === 2) { const r = pick([0.5, 1, 2]) * U * I / 100; return num(`${U.toLocaleString('en')} users, ${I.toLocaleString('en')} items and ${r.toLocaleString('en')} ratings. What percentage of the matrix is empty (sparsity)?`, 100 * (1 - r / (U * I)), 'Most cells are unknown: that is why matrix factorisation is used.', 1); }
    const R = int(3, 8), f = int(1, Math.min(R, 5));
    return num(`A user later engaged with ${R} items, and ${f} of them were in your top 5. What is recall@5?`, f / R, 'Relevant found in the top 5 divided by all relevant.', 2);
  },

  rl(L) {
    const r = Array.from({ length: 3 }, () => int(-2, 5));
    if (L === 1) return num(`An episode gives rewards ${list(r)}. What is the undiscounted return?`, sum(r), 'Add the rewards.');
    if (L === 2) { const g = pick([0.9, 0.5, 0.8]); return num(`Rewards ${list(r)} with discount γ = ${g}. What is the discounted return r0 + γ·r1 + γ²·r2?`, r[0] + g * r[1] + g * g * r[2], 'Later rewards count less.', 2); }
    const Q = int(0, 10), a = pick([0.1, 0.5]), g = pick([0.9, 0.99]), rew = int(-1, 5), m = int(0, 10);
    return num(`Q-learning: Q(s, a) = ${Q}, reward ${rew}, max Q(s′, ·) = ${m}, learning rate ${a}, γ = ${g}. What is the updated Q(s, a)?`, Q + a * (rew + g * m - Q), 'Q ← Q + α (r + γ max Q′ − Q).', 2);
  },

  'data-viz'(L) {
    const pools = {
      1: [['Best chart to compare sales across 6 product categories?', 'Bar chart', 'Pie chart with 6 slices', 'Scatter plot', 'Line chart', 'Bars make differences between categories easy to compare.'],
        ['Best chart to show daily active users over a year?', 'Line chart', 'Pie chart', 'Bar chart of 365 bars', 'Table only', 'Lines show trends over time.'],
        ['Best chart to see the distribution of house prices?', 'Histogram', 'Pie chart', 'Line chart', 'Stacked bar', 'A histogram shows the shape of one numeric variable.']],
      2: [['Best chart to see whether ad spend and sales move together?', 'Scatter plot', 'Pie chart', 'Histogram', 'Bar chart', 'Two numeric variables: scatter.'],
        ['A bar chart’s y-axis starts at 95 instead of 0. What is the risk?', 'Small differences look huge', 'Bars become harder to colour', 'It hides outliers', 'Nothing', 'Bar length must be proportional to the value.'],
        ['Comparing salary distributions of five teams. Good choice?', 'Box plots side by side', 'Five pie charts', 'One line chart', 'A single average per team only', 'Box plots show median, spread and outliers.']],
      3: [['A manager has 30 seconds to read your chart. What matters most?', 'A title that states the finding, and one highlighted series', 'Every data point labelled', 'Many colours', '3-D effects', 'Lead with the message.'],
        ['Averages for A/B groups differ slightly. What must the chart also show?', 'Uncertainty, such as confidence intervals', 'A pie chart', 'More decimal places', 'Nothing', 'Without uncertainty readers over-read small differences.'],
        ['A dual-axis chart shows two unrelated series rising together. The risk?', 'Readers infer a relationship the scaling created', 'It uses too little ink', 'It cannot be printed', 'None', 'Axis scales can manufacture apparent correlation.']]
    };
    return fromPool(pools[L]);
  },

  'data-pipelines'(L) {
    if (L === 1) { const d = int(2, 30); return num(`A table is partitioned by hour. How many partitions does ${d} days of data create?`, 24 * d, '24 partitions per day.'); }
    if (L === 2) { const rows = int(2, 50) * 1e6, d = pick([10, 20, 50]); return num(`${(rows / 1e6)} million rows spread evenly over ${d} daily partitions. A query filters on one day. How many rows does it read, in millions?`, rows / d / 1e6, 'Partition pruning reads only the matching partition.', 2); }
    return fromPool([
      ['A daily job is re-run after a failure and doubles the day’s rows. What property is missing?', 'Idempotency', 'Partitioning', 'Compression', 'Schema evolution', 'Re-running must give the same result, for example by overwriting the partition.'],
      ['Data must reach a fraud model within seconds of a payment. Which processing?', 'Streaming', 'Monthly batch', 'Manual export', 'Nightly batch', 'Latency requirements decide batch versus streaming.'],
      ['A source adds a column without warning and the pipeline silently drops it. What prevents surprises?', 'Schema checks and data contracts', 'More CPU', 'A bigger warehouse', 'Fewer tests', 'Validate schemas at the boundary.']]);
  },

  'dev-tools'(L) {
    const pools = {
      1: [['Which command records staged changes in Git history?', 'git commit', 'git push', 'git clone', 'git status', 'commit saves a snapshot locally; push sends it.'],
        ['Which command shows modified and staged files?', 'git status', 'git log', 'git init', 'git fetch', 'status summarises the working tree.'],
        ['What does a virtual environment isolate?', 'Python packages per project', 'The operating system', 'Git history', 'Network traffic', 'Different projects can pin different versions.']],
      2: [['Start new work without touching main. Which command?', 'git switch -c feature-x', 'git reset --hard', 'git push --force', 'git clean -fd', 'A branch isolates the change.'],
        ['Which shell command finds lines containing "error" in a log?', 'grep error app.log', 'ls error app.log', 'cd error app.log', 'mv error app.log', 'grep searches text.'],
        ['A unit test should…', 'Check one small behaviour quickly and deterministically', 'Call the production database', 'Take an hour', 'Depend on test order', 'Fast, isolated and repeatable.']],
      3: [['You committed a secret key and pushed it. First action?', 'Revoke and rotate the key, then remove it from history', 'Delete the line in a new commit only', 'Make the repo private and forget it', 'Rename the file', 'Assume it is compromised once pushed.'],
        ['git merge versus git rebase?', 'Merge keeps both histories with a merge commit; rebase replays commits on top of another branch', 'They are identical', 'Rebase deletes branches', 'Merge rewrites history always', 'Do not rebase commits others already use.'],
        ['A test passes alone but fails in the full suite. Likely cause?', 'Shared state between tests', 'The compiler', 'Too few tests', 'The test is too fast', 'Tests must not depend on each other.']]
    };
    return fromPool(pools[L]);
  },

  'generative-models'(L) {
    const pools = {
      1: [['Which model learns by pitting a generator against a discriminator?', 'GAN', 'VAE', 'Diffusion model', 'Random forest', 'Adversarial training.'],
        ['A diffusion model generates an image by…', 'Removing noise step by step', 'Sorting pixels', 'Copying a training image', 'Running a decision tree', 'It learns to reverse a noising process.'],
        ['What does a VAE encoder output?', 'Parameters of a distribution in latent space', 'A class label', 'A bounding box', 'A text prompt', 'Mean and variance of the latent code.']],
      2: [['A common GAN failure where outputs lack variety?', 'Mode collapse', 'Overfitting the tokenizer', 'Vanishing context', 'Data leakage', 'The generator finds a few outputs that fool the discriminator.'],
        ['Why are diffusion models slower at generation than GANs?', 'They need many denoising steps', 'They have no parameters', 'They only run on CPUs', 'They cannot use GPUs', 'Each step is a forward pass.'],
        ['In text-to-image models, the text usually conditions the image through…', 'Cross-attention to text embeddings', 'Changing the loss to MSE', 'Random cropping', 'Batch norm', 'Image features attend to text features.']],
      3: [['Classifier-free guidance scale is raised. Typical effect?', 'Images follow the prompt more closely but lose diversity', 'Images become random', 'Generation becomes free', 'Resolution doubles', 'A trade-off between fidelity and variety.'],
        ['Why do latent diffusion models denoise in a compressed latent space?', 'It is far cheaper than working on full-resolution pixels', 'Latents are always more accurate', 'Pixels cannot be noised', 'To avoid using a decoder', 'An autoencoder maps to and from latents.'],
        ['A vision-language model answers questions about images. A common design?', 'An image encoder whose features are projected into a language model’s input', 'A GAN with a text discriminator', 'k-means on pixels', 'An RNN over pixels only', 'Visual tokens join the text sequence.']]
    };
    return fromPool(pools[L]);
  },

  'responsible-ai'(L) {
    const a = int(100, 400), b = int(100, 400);
    if (L === 1) { const s = int(10, Math.floor(a / 2)); return num(`${s} of ${a} applicants in group A are approved. What is the selection rate, in percent?`, 100 * s / a, 'Approved divided by applicants.', 1); }
    if (L === 2) { const ra = int(20, 60), rb = int(20, 60); return num(`Group A is approved at ${ra}% and group B at ${rb}%. What is the demographic parity difference (A − B), in percentage points?`, ra - rb, 'The gap in positive rates.'); }
    const pa = int(30, 80), ta = int(20, pa), pb = int(30, 80), tb = int(10, pb);
    return num(`Among people who truly qualify, the model approves ${ta} of ${pa} in group A and ${tb} of ${pb} in group B. What is the true-positive-rate gap (A − B), in percentage points?`, 100 * (ta / pa - tb / pb), 'Equal opportunity compares true-positive rates.', 1);
  },

  'localization-planning'(L) {
    if (L === 1) { const a = [int(0, 9), int(0, 9)], b = [int(0, 9), int(0, 9)]; return num(`On a grid with 4-direction moves, what is the Manhattan distance from (${list(a)}) to (${list(b)})?`, Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), '|dx| + |dy|: an admissible A-star heuristic here.'); }
    if (L === 2) { const kp = pick([0.5, 1, 2]), kd = pick([0.1, 0.2, 0.5]), e = int(-5, 10), de = int(-4, 4); return num(`A PD controller has Kp = ${kp} and Kd = ${kd}. The error is ${e} and its rate of change is ${de}. What is the control output Kp·e + Kd·de?`, kp * e + kd * de, 'Proportional plus derivative terms.', 2); }
    const w = Array.from({ length: 4 }, () => int(1, 9)), i = int(0, 3);
    return num(`Four particles have unnormalised weights ${list(w)}. What is particle ${i + 1}’s normalised weight?`, w[i] / sum(w), 'Divide by the sum of weights.', 2);
  }
};

/** One fresh exercise for a topic at level 1, 2 or 3, or null if the topic has no generator. */
export function generate(id, level) {
  const g = GENERATORS[id];
  if (!g) return null;
  const s = g.call(GENERATORS, level);
  return s ? { ...s, gen: true, nr: true, level } : null;
}

/** n exercises with distinct questions. */
export function practiceSet(id, level, n = 10) {
  const out = [], seen = new Set();
  for (let tries = 0; out.length < n && tries < n * 8; tries++) {
    const s = generate(id, level);
    if (!s) break;
    const key = s.q + (s.code || '');
    if (seen.has(key)) continue;
    seen.add(key); out.push(s);
  }
  return out;
}

export const hasPractice = id => id in GENERATORS;
