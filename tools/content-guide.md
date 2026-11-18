# Content guide

How topics are written. Check your work with `tools/check.mjs` (see the usage line at its top) and, for coding tasks, run them as described below.

## Where things live

| File | Holds |
| --- | --- |
| `content/<module>.js` | Topic objects: `id`, `title`, optional `group`, `uses`, `tasks`, `quiz`, `interview` |
| `content/<module>.md` | One summary per topic: a line `=== topic-id ===`, then Markdown |
| `content/paths/<file>.js` | Learning paths: `{ 'topic-id': [ L(...), ... ] }` built with the helpers in `content/_h.js` |
| `content/roles.js` | Job roadmaps and portfolio projects |

Good models to copy: `content/sequence.js`, `content/sequence.md`, `content/paths/foundations.js` (topic `python`).

## Style

- Generic: any job seeker, any country. Never describe a specific person, CV, employer or country as the reader's own.
- British spelling, plain direct sentences, no emojis. Do not name commercial AI assistants or model vendors; say "an LLM provider" if one must be mentioned.
- Every fact, number and code result must be correct. Compute numeric answers carefully; prefer round numbers. No legal, tax or salary figures.
- Write problems and explanations in your own words. Classic problem ideas are fine; do not copy text from other sites.
- JavaScript strings: inside single quotes use the typographic ’ for apostrophes; use `\n` for new lines; do not put `*` inside `**bold**`.

## Topic object

```js
{
  id: 'topic-id', title: 'Readable title', group: 'module-id-to-show-under',   // group is optional
  uses: ['A real, proven industry use', 'Another one'],
  tasks: [ /* coding tasks, see below */ ],
  quiz: [ /* see below */ ],
  interview: [ /* see below */ ]
}
```

## Quiz questions

`{ q, options: [4 distinct strings], answer: <index of the correct option>, why: 'one sentence', level: 'easy' | 'medium' | 'hard' }`

Vary which index is correct. Easy = recall a definition; medium = apply a concept to a short scenario; hard = reasoning, trade-offs, debugging or a calculation.

## Interview questions

`{ q, level, points: [[label, [keywords]], ...], model }`

- `level`: `easy` (define or explain one idea), `medium` (apply, compare, walk through), `hard` (design, debug, trade-offs, follow-ups).
- `points`: 3 to 5 key points a strong spoken answer covers. `keywords` are lowercase substrings matched against the transcript of the spoken answer, so include stems and synonyms (`'regulari'` matches regularise and regularization).
- `model`: an 80 to 140 word spoken-style model answer.

## Coding tasks (Python)

```js
{ id: 'unique-id', title, level: 'easy' | 'medium' | 'hard', prompt: `Markdown`, starter: R`...`, solution: R`...`,
  tests: [{ name, code: R`assert ..., 'helpful message'` }] }
```

- `R` is `String.raw` (declare `const R = String.raw;` at the top of the file). Inside `R` and template strings, never write a backtick or `${`.
- 3 to 5 tests per task, each an `assert` with a message that tells the learner what is wrong. A helper `close(a, b, tol=1e-6)` is available in tests for approximate comparison of numbers, lists and numpy arrays.
- Tasks run in the browser with Pyodide: standard library and numpy only. Keep each test fast (well under half a second in normal Python), because the browser is several times slower.
- The starter must not pass the tests.
- Verify with local Python before finishing: run the solution followed by each test (with `close` defined) and confirm all pass; run the starter and confirm it fails. Put scratch scripts outside the repository or delete them.

`close` for local verification:

```python
def close(a, b, tol=1e-6):
    a = a.tolist() if hasattr(a, 'tolist') else a
    b = b.tolist() if hasattr(b, 'tolist') else b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(close(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, (list, tuple)) or isinstance(b, (list, tuple)):
        return False
    return abs(float(a) - float(b)) <= tol * (1 + abs(float(b)))
```

## Coding tasks (SQL)

```js
{ id, title, level, lang: 'sql', ordered: true | false, prompt, setup: R`CREATE TABLE ...; INSERT ...;`, hiddenSetup: R`...`, starter: R`SELECT ...`, solution: R`SELECT ...` }
```

The learner's query and the solution both run on `setup` and on `hiddenSetup` (SQLite); results must match in columns, rows and values (numbers compared to 4 decimal places). Set `ordered: true` only if the prompt specifies the order. The hidden data should catch common mistakes (ties, NULLs, duplicates, empty groups). Use SQLite syntax only (`strftime`, no `DATE_TRUNC`). Verify with Python’s `sqlite3`: the solution runs on both setups and returns rows; the starter returns a different result on at least one.

## Lessons

`L('Title', ...steps)` with 8 to 10 steps, including 2 `info(heading, markdownBody)` cards that teach before testing. Within a lesson go from easier to harder. Make it engaging: short concrete scenarios, real numbers, small code to read. Mix step types:

- `mc(question, options, why, optionalCode)`: the first option is correct (shuffled when shown); 4 distinct, plausible options.
- `tf(statement, bool, why)`
- `fill(sentenceWith___, options, why)` / `fillc(codeWith___, options, why)`: exactly one `___`; first option correct.
- `type(question, [acceptedAnswers], why)`: only for a short unambiguous number or word; list every reasonable spelling.
- `order(prompt, linesInCorrectOrder, why)`: 4 to 8 lines.
- `match(prompt, [[left, right] x4])`: distinct left and right sides.

Every `why` is one sentence. No question may repeat within a topic.

## Summaries

250 to 450 words of Markdown per topic: `#` headings, short lists, a table or code block where it helps. Like `content/sequence.md`.
