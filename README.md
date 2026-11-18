# AI Interview Prep

Free, fast interview preparation for AI jobs in Egypt and remote roles you can do from Egypt.

Each topic has a short lesson, coding tasks with automatic tests, a quiz and interview questions you can practise out loud in a voice mock interview. Scores are saved in your browser.

## What is inside

- **Pick a target job** (nine AI roles, from Data Analyst to Perception / ADAS Engineer) and get a staged roadmap of every topic it needs.
- **64 topics**, including maths for ML, 10 coding-pattern topics, SQL practice and 8 worked system-design cases, each taught from zero to interview level in **8 bite-size lessons** grouped Beginner, Intermediate, Advanced and Expert: more than 3,300 interactive steps with instant feedback (multiple choice, true or false, fill the blank, type the answer, order code lines, match pairs).
- **Levelled quizzes**: Easy, Medium, Hard and Mixed for every topic, drawn from a bank of 12 questions per topic, the lessons and generated exercises. Pass a level with 80%.
- **Endless practice**: generated exercises with fresh numbers every round, at three difficulties, for 62 topics. Answers are computed, so they always match the question.
- **24 portfolio projects** built on use cases that companies run in production, each with a public dataset, milestones, what to publish and how to discuss it in an interview.
- **197 coding tasks** in Python and SQL that run in the browser, with visible and hidden tests, labelled easy, medium or hard: 60 algorithm problems by pattern, 33 SQL problems and ML-from-scratch tasks.
- **XP, levels, a daily goal, streaks** and a review pile of the steps you missed.
- **Interactive demos** in the summaries: gradient descent, decision thresholds, graph search, convolution filters, box overlap, token sampling, sensor coverage and a radar-camera Kalman filter.
- **Voice mock interviews**: 10 levelled questions per topic, read aloud; spoken answers scored on key points, pace and filler words. Choose Easy, Medium, Hard or Mixed.
- **Optional AI provider** (your own key for Groq, Google Gemini or OpenRouter, a local Ollama model, or any OpenAI-compatible endpoint) for extra generated exercises, an interviewer with follow-up questions, and code hints.

## Privacy

There is no server and no account. Progress and settings stay in your browser's local storage. API keys, if you add any, are stored only in your browser and sent only to the provider you choose.

## Run locally

It is a static site with no build step. Serve the folder with any web server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Browser support

Everything works in current Chrome, Edge, Firefox and Safari. Answering by voice needs speech recognition, which Chrome and Edge provide; elsewhere you can type your answers.

## Add or edit a topic

1. Add a topic object to the matching file in `content/` (for example `content/ml.js`): `id`, `title`, `tracks`, and any of `tasks`, `quiz`, `interview`.
2. Add a `=== your-topic-id ===` section with the summary in Markdown to the `.md` file with the same name.
3. Add a learning path under the same topic id in `content/paths/`, built with the helpers in `content/_h.js` (`L`, `info`, `mc`, `tf`, `fill`, `fillc`, `type`, `order`, `match`). For `mc` and `fill` the first option is the correct one; options are shuffled when shown.
4. Follow the writing rules in `tools/content-guide.md`, then check the content: `node tools/check.mjs --lessons 8 content/paths/*.js`, `node tools/check.mjs --quiz 12 content/<module>.js` and `node tools/check.mjs --practice`. Then open `selftest.html` in the browser: it runs every reference solution against its tests.

Quiz questions take a `level` of `easy`, `medium` or `hard`. To add endless practice for a topic, add a generator to `js/practice.js`.

A Python task has `prompt`, `starter`, `solution` and `tests` (each test is Python code using `assert`; a helper `close(a, b, tol)` compares numbers, lists and arrays). An SQL task has `lang: 'sql'`, `setup`, optional `hiddenSetup`, `starter` and `solution`.

To embed a demo in a lesson, put `[[demo:name]]` on its own line. Demos live in `js/demos.js`.

## Built with

Plain HTML, CSS and JavaScript modules. Python runs through [Pyodide](https://pyodide.org), SQL through [sql.js](https://sql.js.org), and the editor is [CodeMirror](https://codemirror.net). These load from public CDNs the first time they are needed.
