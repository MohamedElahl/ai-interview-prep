# AI Interview Prep

Free, fast interview preparation for AI jobs in Egypt and remote roles you can do from Egypt.

Each topic has a short lesson, coding tasks with automatic tests, a quiz and interview questions you can practise out loud in a voice mock interview. Scores are saved in your browser.

## What is inside

- **28 topics** in 8 modules: foundations, core ML, deep learning, GenAI and LLMs, MLOps and system design, computer vision and NLP, sensor fusion and perception, and interview skills.
- **56 coding tasks** in Python and SQL that run in the browser, with visible and hidden tests.
- **Interactive demos** inside lessons: gradient descent, decision thresholds, graph search, convolution filters, box overlap, token sampling, a sensor coverage scene and a radar-camera Kalman filter.
- **Voice mock interview**: questions are read aloud, you answer by speaking, and you get a score, the key points you covered, pace and filler-word counts, and a model answer.
- **Role tracks**: ML Engineer, Data Scientist, GenAI / LLM Engineer, MLOps, NLP, Computer Vision, Automotive / Perception, Data Analyst.
- **Optional AI interviewer** with follow-up questions and written feedback, using your own key for Groq, Google Gemini or OpenRouter, a local Ollama model, or any OpenAI-compatible endpoint.

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
2. Add a `=== your-topic-id ===` section with the lesson in Markdown to the `.md` file with the same name.
3. Open `selftest.html` in the browser. It runs every reference solution against its tests and reports problems.

A Python task has `prompt`, `starter`, `solution` and `tests` (each test is Python code using `assert`; a helper `close(a, b, tol)` compares numbers, lists and arrays). An SQL task has `lang: 'sql'`, `setup`, optional `hiddenSetup`, `starter` and `solution`.

To embed a demo in a lesson, put `[[demo:name]]` on its own line. Demos live in `js/demos.js`.

## Built with

Plain HTML, CSS and JavaScript modules. Python runs through [Pyodide](https://pyodide.org), SQL through [sql.js](https://sql.js.org), and the editor is [CodeMirror](https://codemirror.net). These load from public CDNs the first time they are needed.
