=== llm-basics ===
# What interviewers check

GenAI roles are the fastest-growing part of the market, including remote roles. You need to explain how LLMs work without hand-waving.

# From text to text

1. **Tokenise.** Text is split into sub-word tokens (byte-pair encoding). One token is about four characters of English. Arabic often uses more tokens per word.
2. **Predict.** A decoder-only transformer outputs a probability for every possible next token.
3. **Sample.** One token is chosen and appended. Repeat until a stop token.

# Decoding settings

- **Temperature** divides the logits. Low is focused and repeatable, high is varied.
- **Top-k** keeps the k most likely tokens. **Top-p** keeps the smallest set whose probability adds up to p.
- Use low temperature for extraction and code, higher for brainstorming.

Try it: move the sliders and watch the distribution change.

[[demo:sampling]]

# Adapting a model

| Approach | What changes | Use when |
| --- | --- | --- |
| Prompting | Only the input | Always try first |
| RAG | Adds retrieved context | The model lacks private or fresh knowledge |
| Fine-tuning (LoRA) | A small set of weights | You need a style, a format or a cheaper small model |

# Prompting practices that work

- State the role, the task, the constraints and the output format.
- Give a few examples.
- Put long documents first and the question last.
- Ask for structured output and validate it.

# Limits to mention

Hallucination, a fixed context window, a knowledge cut-off, cost and latency per token, and sensitivity to wording.

=== rag ===
# What interviewers check

Retrieval-augmented generation is the most common GenAI system in production. Expect a design question and a debugging question.

# The pipeline

**Offline (indexing)**

1. Load and clean documents.
2. Split into chunks, for example 300 to 800 tokens with 10 to 20 percent overlap.
3. Embed each chunk and store vectors with metadata.

**Online (query)**

1. Embed the question.
2. Retrieve the top-k chunks by cosine similarity. Hybrid search adds keyword matching (BM25).
3. Re-rank with a cross-encoder.
4. Build the prompt: instructions, retrieved context, question.
5. Generate an answer with citations.

```python
def cosine(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
```

# What goes wrong and the usual fix

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Right document never retrieved | Chunking or embedding model | Change chunk size, hybrid search, query rewriting |
| Retrieved but ranked low | Weak ranking | Add a re-ranker, retrieve more candidates |
| Retrieved, answer still wrong | Generation | Tighter prompt, less noise in context, stronger model |
| Answer ignores sources | No grounding instruction | "Answer only from the context", require citations |

# Evaluate the two stages separately

- **Retrieval:** recall@k, MRR.
- **Generation:** faithfulness to sources, answer relevance, correctness.

# Design points to raise

Access control at retrieval time, keeping the index fresh, caching, cost per query and multilingual data (Arabic and English).

=== agents-eval ===
# What interviewers check

Teams want engineers who can ship LLM features reliably. That means tool use, structured output, evaluation and safety.

# Tool calling

1. You describe tools: name, description, JSON schema of arguments.
2. The model returns a structured call.
3. Your code validates and runs it.
4. The result goes back to the model. Repeat until it answers.

An **agent** is this loop with the model choosing the next step. A **workflow** is a fixed sequence of calls. Prefer a workflow when the steps are known: it is cheaper and more predictable.

# Making agents reliable

- Few, well-described tools.
- Validate arguments and return errors to the model so it can recover.
- Cap steps, time and spend.
- Log every step.
- Ask a human before irreversible actions.

# Evaluation

- Build a test set from real cases, including failures.
- **Reference metrics:** exact match, token F1, schema validity.
- **LLM as judge:** a clear rubric, checked against human labels.
- Run the suite on every prompt or model change. Track quality, latency and cost together.

# Safety

- **Prompt injection.** Text the model reads can contain instructions. Treat tool output and documents as data, never as commands.
- **Least privilege.** Give tools only the access they need.
- **Privacy.** Keep personal data out of prompts and logs where you can.

# Useful vocabulary

MCP (a standard way to expose tools to models), function calling, structured outputs, guardrails, tracing, red-teaming.
