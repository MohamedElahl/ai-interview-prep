// Code editor: a plain textarea immediately, upgraded to CodeMirror when it has loaded.
import { loadScript } from './runner.js';
const CM = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/';
let cmReady;
function loadCM() {
  return cmReady ??= (async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = CM + 'codemirror.min.css';
    document.head.prepend(link);
    await loadScript(CM + 'codemirror.min.js');
    await Promise.all([loadScript(CM + 'mode/python/python.min.js'), loadScript(CM + 'mode/sql/sql.min.js')]);
    return window.CodeMirror;
  })().catch(e => { cmReady = null; throw e; });
}

export function createEditor(host, { value = '', mode = 'python', onChange } = {}) {
  const ta = document.createElement('textarea');
  ta.className = 'code'; ta.value = value; ta.spellcheck = false;
  ta.setAttribute('aria-label', 'Code editor');
  host.append(ta);
  let cm = null;
  ta.addEventListener('input', () => onChange?.(ta.value));
  ta.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || e.shiftKey) return;
    e.preventDefault();
    const a = ta.selectionStart;
    ta.setRangeText('    ', a, ta.selectionEnd, 'end');
    onChange?.(ta.value);
  });
  loadCM().then(CodeMirror => {
    if (!ta.isConnected) return;
    cm = CodeMirror.fromTextArea(ta, {
      mode: mode === 'sql' ? 'text/x-sql' : 'python', lineNumbers: true, indentUnit: 4, viewportMargin: Infinity,
      extraKeys: { Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('    ') }
    });
    cm.on('change', () => onChange?.(cm.getValue()));
  }).catch(() => { /* keep the textarea */ });
  return {
    get: () => cm ? cm.getValue() : ta.value,
    set: v => { if (cm) cm.setValue(v); else ta.value = v; onChange?.(v); }
  };
}
