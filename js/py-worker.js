// Runs Python in a Web Worker (Pyodide) so a runaway loop can be killed from the page.
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

const HARNESS = String.raw`
import sys, io, json, traceback

def close(a, b, tol=1e-6):
    """Approximate equality for numbers, nested lists and numpy arrays."""
    if hasattr(a, 'tolist'): a = a.tolist()
    if hasattr(b, 'tolist'): b = b.tolist()
    seq = (list, tuple)
    if isinstance(a, seq) and isinstance(b, seq):
        return len(a) == len(b) and all(close(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, seq) or isinstance(b, seq):
        return False
    try:
        return abs(float(a) - float(b)) <= tol * (1 + abs(float(b)))
    except (TypeError, ValueError):
        return False

def _fmt():
    parts = traceback.format_exception(*sys.exc_info())
    return ''.join(p for p in parts if 'File "<exec>"' not in p)

def __run(user_code, tests_json):
    tests = json.loads(tests_json)
    out = io.StringIO()
    old = (sys.stdout, sys.stderr)
    sys.stdout = sys.stderr = out
    res = {'error': None, 'tests': []}
    ns = {'__name__': '__main__', 'close': close}
    try:
        try:
            exec(compile(user_code, '<solution>', 'exec'), ns)
        except BaseException:
            res['error'] = _fmt()
        for t in tests:
            if res['error'] is not None:
                res['tests'].append({'name': t['name'], 'ok': False, 'msg': 'Your code raised an error before the tests ran.'})
                continue
            try:
                exec(compile(t['code'], '<test>', 'exec'), dict(ns))
                res['tests'].append({'name': t['name'], 'ok': True})
            except AssertionError as e:
                res['tests'].append({'name': t['name'], 'ok': False, 'msg': str(e) or 'Wrong result.'})
            except BaseException as e:
                res['tests'].append({'name': t['name'], 'ok': False, 'msg': type(e).__name__ + ': ' + str(e)})
    finally:
        sys.stdout, sys.stderr = old
    res['stdout'] = out.getvalue()[-20000:]
    return json.dumps(res)
`;

const ready = (async () => {
  self.pyodide = await loadPyodide();
  await self.pyodide.runPythonAsync(HARNESS);
})();

self.onmessage = async e => {
  const { id, code, tests } = e.data;
  try {
    postMessage({ id, stage: 'loading' });
    await ready;
    await self.pyodide.loadPackagesFromImports(code + '\n' + tests.map(t => t.code).join('\n'));
    postMessage({ id, stage: 'running' });
    const run = self.pyodide.globals.get('__run');
    const json = run(code, JSON.stringify(tests));
    run.destroy();
    postMessage({ id, result: JSON.parse(json) });
  } catch (err) {
    postMessage({ id, fatal: String(err && err.message || err) });
  }
};
