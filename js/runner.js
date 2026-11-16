// Code execution: Python via a Pyodide worker, SQL via sql.js. Both load only on first use.
const SQL_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';

export function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
    document.head.append(s);
  });
}

let worker = null, seq = 0;
const pending = new Map();

function boot() {
  worker = new Worker('js/py-worker.js');
  worker.onmessage = e => {
    const m = e.data, p = pending.get(m.id);
    if (!p) return;
    if (m.stage) {
      p.onStage?.(m.stage);
      if (m.stage === 'running') p.timer = setTimeout(() => kill(m.id, { timeout: true }), p.timeout);
      return;
    }
    clearTimeout(p.timer); pending.delete(m.id);
    p.resolve(m.fatal ? { fatal: m.fatal } : m.result);
  };
  worker.onerror = e => {
    for (const [id] of pending) kill(id, { fatal: 'Python failed to load: ' + (e.message || 'network error') });
  };
}
function kill(id, result) {
  const p = pending.get(id);
  worker?.terminate(); worker = null;
  for (const [k, q] of pending) { clearTimeout(q.timer); if (k !== id) q.resolve({ fatal: 'Run cancelled.' }); }
  pending.clear();
  p?.resolve(result);
}

/** Run code, then each test ({name, code}) against it. Resolves to
 *  {stdout, error, tests:[{name, ok, msg}]} or {timeout:true} or {fatal:string}. */
export function runPython(code, tests = [], { onStage, timeout = 15000 } = {}) {
  if (!worker) boot();
  const id = ++seq;
  return new Promise(resolve => {
    pending.set(id, { resolve, onStage, timeout });
    worker.postMessage({ id, code, tests });
  });
}

let sqlReady;
const sqlLib = () => sqlReady ??= loadScript(SQL_CDN + 'sql-wasm.js')
  .then(() => window.initSqlJs({ locateFile: f => SQL_CDN + f }))
  .catch(e => { sqlReady = null; throw e; });

export async function runSql(setup, query) {
  let SQL;
  try { SQL = await sqlLib(); } catch (e) { return { error: 'SQL engine failed to load: ' + e.message }; }
  const db = new SQL.Database();
  try {
    db.run(setup);
    const r = db.exec(query);
    const last = r[r.length - 1];
    return { columns: last?.columns || [], rows: last?.values || [] };
  } catch (e) {
    return { error: String(e.message || e) };
  } finally { db.close(); }
}

const norm = (rows, ordered) => {
  const out = rows.map(r => JSON.stringify(r.map(v => typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v === null ? null : String(v))));
  return ordered ? out : out.sort();
};

/** Compare the user's query with the reference query on the visible and hidden datasets. */
export async function gradeSql(task, query) {
  const sets = [['Sample data', task.setup], ['Hidden data', task.hiddenSetup]].filter(s => s[1]);
  const tests = [];
  let first = null;
  for (const [name, setup] of sets) {
    const got = await runSql(setup, query);
    first ??= got;
    const want = await runSql(setup, task.solution);
    let ok = false, msg = '';
    if (got.error) msg = got.error;
    else if (got.columns.length !== want.columns.length) msg = `Expected ${want.columns.length} column(s), got ${got.columns.length}.`;
    else if (got.rows.length !== want.rows.length) msg = `Expected ${want.rows.length} row(s), got ${got.rows.length}.`;
    else {
      ok = JSON.stringify(norm(got.rows, task.ordered)) === JSON.stringify(norm(want.rows, task.ordered));
      if (!ok) msg = task.ordered ? 'Rows differ from the expected result (order matters).' : 'Rows differ from the expected result.';
    }
    tests.push({ name: name + ' matches expected result', ok, msg });
  }
  return { tests, result: first };
}
