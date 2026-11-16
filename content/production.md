=== mlops ===
# What interviewers check

Companies hire people who can ship. Expect questions about deployment, monitoring and what you do when a production model degrades.

# The lifecycle

Data, training, evaluation, packaging, deployment, monitoring, retraining. MLOps makes each step repeatable and automated.

# Reproducibility

- **Code** in Git. **Data** versioned (DVC or a catalogue). **Experiments** tracked (MLflow, Weights and Biases).
- **Environment** pinned in a container image.
- A model registry records which model version is live.

# Serving patterns

| Pattern | Use when | Example |
| --- | --- | --- |
| Batch | Predictions can be precomputed | Nightly churn scores |
| Online API | Response needed in milliseconds | Fraud check at payment |
| Streaming | Continuous events | Sensor anomaly detection |
| Edge | No network, privacy, or hard real time | In-vehicle perception |

A typical online stack: FastAPI inside Docker, on Kubernetes or a managed endpoint.

# Safe releases

- **Shadow:** the new model runs silently next to the old one.
- **Canary:** a small share of traffic first.
- **A/B test:** measure business impact.
- Always keep a fast rollback.

# Monitoring

- **Service:** p50, p95 and p99 latency, error rate, throughput.
- **Data:** schema, missing values, drift (PSI, KS test).
- **Model:** prediction distribution, then real metrics when labels arrive.
- Alerts with thresholds, and a runbook.

# Two failure modes to name

- **Training-serving skew:** features computed differently online and offline.
- **Drift:** the world changes. Data drift is a change in inputs; concept drift is a change in the relation between inputs and the target.

=== edge-deploy ===
# What interviewers check

Automotive, robotics and IoT teams need models that run on small processors with hard deadlines. This is a rare and valuable skill.

# The constraints

- Limited flash and RAM, often no GPU, sometimes no floating-point unit.
- Real-time deadlines: worst-case execution time matters, not the average.
- Coding standards (MISRA C) and process standards (ASPICE, ISO 26262).

# Making a model smaller and faster

| Technique | What it does | Typical gain |
| --- | --- | --- |
| Quantisation | Float32 to int8 | About 4× smaller, faster |
| Pruning | Removes weights or channels | Depends on sparsity support |
| Distillation | Small student learns from a large teacher | Large |
| Efficient architecture | Depthwise separable convolutions, smaller input | Large |

# Quantisation in brief

```
q = round(x / scale) + zero_point      # clip to [-128, 127]
x ≈ (q - zero_point) * scale
```

- **Post-training:** needs a small calibration set to find activation ranges.
- **Quantisation-aware training:** simulates rounding during training; use it when post-training loses too much accuracy.

# Getting to the target

- Export through ONNX, then TensorRT, TFLite or a vendor toolchain.
- For microcontrollers, generate C code. Tree models become nested `if` statements or tables.
- **Back-to-back testing:** the same inputs through the Python and C versions must agree within a tolerance.

# What to measure on the device

Flash, RAM, stack, worst-case execution time, and accuracy after conversion.

# A good interview story

"The model was accurate but too slow. I measured, found the bottleneck, applied these changes, verified equivalence and met the timing budget." Bring numbers.

=== ml-system-design ===
# What interviewers check

Mid-level and senior interviews include a 45-minute open design question. They are judging structure and trade-offs, not a single right answer.

# A framework you can reuse

1. **Clarify.** Goal, users, scale, latency, constraints. Ask before designing.
2. **Metrics.** One business metric, one offline metric, guardrails.
3. **Data.** Sources, labels, freshness, privacy, biases.
4. **Baseline.** Rules or a simple model. State what it would achieve.
5. **Model.** Features, architecture, training, why this over alternatives.
6. **Serving.** Batch or online, latency budget, caching, cost.
7. **Evaluation.** Offline split that respects time, then an A/B test.
8. **Monitoring and iteration.** Drift, feedback loops, retraining.

Spend the first five minutes on steps 1 and 2. Say your assumptions aloud.

# Patterns worth knowing

- **Two-stage retrieval and ranking** for search and recommendations.
- **Feature store** for consistent offline and online features.
- **RAG** for question answering over documents.
- **Human in the loop** for high-risk decisions and for labelling.
- **Cascade:** a cheap model handles easy cases, an expensive one the rest.

# Trade-offs to discuss

- Accuracy against latency and cost.
- Freshness against complexity (batch or streaming).
- Precision against recall, tied to the cost of each error.
- Build against buy.

# Common questions

Recommendation feed, search ranking, fraud detection, demand forecasting, document question answering, content moderation, and for automotive roles a perception or driver-monitoring pipeline.

# Closing well

Summarise the design, name the biggest risk and say what you would build first.
