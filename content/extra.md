=== pytorch ===
# What PyTorch gives you

PyTorch is a Python library for **tensors** (n-dimensional arrays that run on CPU or GPU) and **autograd** (automatic differentiation). Most published research models and open language models are written in it.

# Tensors and shapes

- `torch.tensor([[1., 2.], [3., 4.]])` has shape `(2, 2)`.
- Operations broadcast: shapes are compared from the right, and a dimension of 1 stretches. `(32, 1) - (32,)` gives `(32, 32)`, a classic silent bug.
- `view`/`reshape` change the shape, `permute` reorders axes, `.to("cuda")` moves data to the GPU.

# Autograd

Tensors created with `requires_grad=True` record every operation in a graph. `loss.backward()` walks the graph backwards and stores gradients in `.grad`. Gradients **accumulate**, so clear them each step.

# The training loop

```python
for x, y in loader:
    opt.zero_grad()
    loss = loss_fn(model(x), y)
    loss.backward()
    opt.step()
```

| Piece | Role |
| --- | --- |
| `Dataset` / `DataLoader` | Shuffled mini-batches |
| `nn.Module` | Holds layers and defines `forward` |
| Loss function | One number to minimise |
| Optimiser | Updates weights from gradients |

# Evaluation and saving

- `model.eval()` switches dropout and batch norm to inference behaviour; `torch.no_grad()` stops graph recording.
- Save `model.state_dict()`, not the whole pickled object. Load with `map_location` if the device differs.

# Common bugs

Forgetting `zero_grad()`, forgetting `eval()`, mismatched dtypes (`long` labels for cross-entropy), mixing devices, and applying softmax before `CrossEntropyLoss`, which expects raw logits.

# Habits that save hours

Print shapes after each layer, overfit one small batch before a long run, fix random seeds for comparisons, and log training and validation loss separately. A model that cannot memorise eight examples has a bug, not a capacity problem.

=== unsupervised ===
# Learning without labels

Unsupervised learning finds structure in data that has no target column. The two workhorses are **clustering** (group similar rows) and **dimensionality reduction** (describe rows with fewer numbers).

# k-means

1. Pick k centres.
2. Assign each point to its nearest centre.
3. Move each centre to the mean of its points.
4. Repeat until nothing changes.

It minimises **inertia**, the sum of squared distances to the centres. Weaknesses: you must choose k, it assumes round, similar-sized clusters, it is sensitive to scale and outliers, and results depend on the start (use `k-means++` and several restarts).

# Choosing k

Inertia always falls as k grows, so look for the **elbow** and check the **silhouette score** (from -1 to 1; higher is better separated). Then ask whether the clusters are useful to the business.

# Other clustering

| Method | Good for |
| --- | --- |
| Hierarchical | A tree of merges, small data |
| DBSCAN | Arbitrary shapes, labels noise points |
| Gaussian mixture | Soft, elliptical clusters |

# PCA

PCA finds orthogonal directions of maximum variance (eigenvectors of the covariance matrix). Keep enough components to reach, say, 95% of explained variance.

```python
X = StandardScaler().fit_transform(X)
pca = PCA(n_components=0.95).fit(X)
print(pca.explained_variance_ratio_)
```

Always **standardise first**, otherwise the feature with the largest units dominates.

# Anomalies without labels

Define "unusual" with domain experts, then use distance to a cluster centre, Isolation Forest, or reconstruction error from PCA. Review the top-ranked cases by hand.

# Judging the result

There is no answer key, so check that clusters are stable on a second sample, large enough to matter and easy to describe. Profile each cluster by its feature means, then test whether acting on the groups changes a business outcome.

=== recsys ===
# The problem

A recommender ranks items for a user from a catalogue of thousands to millions. It powers feeds, shops and playlists, and is judged by what users do next, not by accuracy alone.

# Data

- **Explicit feedback:** ratings. Rare and biased towards extremes.
- **Implicit feedback:** clicks, views, purchases. Plentiful, but a missing click means *unknown*, not *dislike*.

# Main approaches

| Approach | Idea | Weakness |
| --- | --- | --- |
| Popularity | Show what is trending | Not personal |
| Content-based | Items similar to what you liked | Narrow taste |
| Collaborative filtering | Users who agreed before will agree again | Cold start |
| Matrix factorisation | Ratings ≈ user vector · item vector | Needs interactions |
| Two-tower / deep | Learn embeddings from features and history | Heavier to run |

# Matrix factorisation

Learn a vector for each user and item so that `p_u · q_i` predicts the rating. SGD update with error `e = r - p·q`: `p += lr * (e * q - reg * p)`.

# Retrieval then ranking

1. **Retrieval:** cheap model (embedding search) narrows millions to hundreds.
2. **Ranking:** richer model scores the hundreds.
3. **Re-ranking:** diversity, freshness, business rules.

# Evaluation

- Offline: split **by time**; recall@k, precision@k, MAP, NDCG@k.
- Online: A/B test on click-through, retention, revenue.
- Beyond accuracy: coverage, diversity, novelty.

# Pitfalls

Cold start, popularity bias, position bias in click logs, feedback loops, and random splits that leak the future.

=== rl ===
# Learning by trial and reward

In reinforcement learning an **agent** acts in an **environment**, sees a **state**, picks an **action** and receives a **reward**. The goal is a **policy** that maximises the long-term return, not the next reward.

# Vocabulary

- **Return:** `G = r0 + γ r1 + γ² r2 + ...`, with discount factor γ between 0 and 1. Small γ is short-sighted.
- **Markov property:** the next state depends only on the current state and action.
- **Value:** expected return from a state, `V(s)`, or from a state-action pair, `Q(s, a)`.

# Q-learning

```python
Q[s, a] += alpha * (r + gamma * max(Q[s2]) - Q[s, a])
```

The bracket is the **temporal-difference error**. The target uses the best next action, so Q-learning is **off-policy**: it learns the greedy policy while behaving differently.

# Exploration

With **epsilon-greedy**, pick a random action with probability ε and the best-known action otherwise. Decay ε over time.

# Bandits

A bandit has one state and many arms. Strategies: epsilon-greedy, UCB, Thompson sampling. They suit headlines, adverts and recommendations where choices do not change future states.

# Scaling up

| Idea | Example |
| --- | --- |
| Neural network for Q | DQN with replay buffer and target network |
| Learn the policy directly | REINFORCE, PPO |
| Actor-critic | A policy plus a value estimate |

# When to use it

Use RL for sequential decisions with delayed effects and a safe simulator. Avoid it when a supervised model or bandit suffices; it needs many samples and reward design is error-prone (reward hacking).

=== data-viz ===
# Look before you model

Exploratory data analysis (EDA) is how you learn what the data really contains before anyone trusts a number. Visualisation is the fastest tool for it, and also how results reach decision makers.

# A first-look routine

1. Shape, types, missing values, duplicates.
2. Summary statistics and distributions.
3. Relationships between variables.
4. Outliers and impossible values.
5. Time trends and segments.

```python
df.info(); df.describe()
df.isna().mean().sort_values()
df["income"].plot.hist(bins=30)
```

# Choosing the chart

| Question | Chart |
| --- | --- |
| Distribution of one variable | Histogram, box plot |
| Compare categories | Bar chart (axis from zero) |
| Change over time | Line chart |
| Relationship of two numbers | Scatter plot |
| Parts of a whole | Stacked bar; pie only with 2 or 3 slices |

# Statistics that mislead

- Skewed data: the median describes a typical value better than the mean.
- Outliers by IQR rule: below `Q1 - 1.5·IQR` or above `Q3 + 1.5·IQR`.
- Correlation is not causation, and an overall trend can reverse inside groups (Simpson's paradox).

# Honest charts

Start bar axes at zero, avoid dual axes and 3D, keep scales consistent between panels, and label units. The **lie factor** is the size of the effect shown divided by the size in the data; aim for 1.

# Storytelling

Start with the decision, lead with the conclusion, give each chart one message in its title, use plain business language, state uncertainty, and end with next steps.

# Reconcile before you present

Compare your total with a trusted source, report how many rows you removed and why, and check small groups before comparing their averages. A tidy chart built on duplicated rows is worse than no chart.

=== data-pipelines ===
# What a pipeline does

A data pipeline moves data from sources (databases, apps, events) to places where people and models use it, cleaning and reshaping on the way.

# Batch and streaming

| | Batch | Streaming |
| --- | --- | --- |
| Freshness | Hours or a day | Seconds |
| Complexity | Lower | Higher |
| Example | Nightly report | Fraud alert |

Choose streaming only when decisions really need data within seconds.

# ETL and ELT

**ETL** transforms before loading. **ELT** loads raw data first and transforms inside the warehouse with SQL, which keeps the raw copy for reprocessing.

# Storage

- **Warehouse:** structured, fast SQL analytics.
- **Lake:** cheap files of any shape.
- **Lakehouse:** lake storage with warehouse-style tables.

# Reliable pipelines

- **Idempotent** tasks: rerunning gives the same result. Overwrite a date partition or upsert on a key; never blind-append.
- **Partition** large tables by date so reruns touch one day.
- **Retries and backfills** that are safe by design.
- **Data-quality checks** at the edges: row counts, nulls, ranges, duplicates, freshness.

```python
assert df["id"].is_unique
assert df["amount"].between(0, 1e6).all()
```

# Orchestration

Tools such as Airflow describe tasks as a graph (DAG) with dependencies, schedules, retries and alerts. Monitor runtime, volume and failures.

# Common failures

Schema drift, late data, duplicated loads after a retry, silent null spikes, and time-zone mistakes.

# Habits that save weekends

Keep raw data untouched, version your transformations, write down what each table means and who owns it, and alert on freshness as well as failure. Test pipelines on a small sample and on an empty day before they meet production data.

=== dev-tools ===
# Why these tools matter

Teams ship software together. Git, the command line and automated tests are how you work safely with other people and reproduce your own results.

# Git essentials

```bash
git switch -c feature/clean-data
git add src/clean.py
git commit -m "Drop duplicate rows"
git push -u origin feature/clean-data
```

| Command | Use |
| --- | --- |
| `git status`, `git diff` | See what changed |
| `git log --oneline` | History |
| `git merge` | Join histories with a merge commit |
| `git rebase` | Replay your commits on a new base |
| `git revert` | Safe undo on shared branches |
| `git stash` | Park uncommitted work |

Never rewrite history that others have pulled. Resolve conflicts by editing the marked section, then `add` and continue.

# Linux basics

`ls`, `cd`, `grep`, `find`, `less`, `chmod`, pipes (`|`) and redirects (`>`). Use `ssh` to reach servers and `tmux` to keep jobs alive.

# Environments

One **virtual environment** per project, with pinned versions in `requirements.txt`, so projects cannot break each other.

# Testing

A good unit test is fast, isolated and deterministic. For ML code: test data transforms with tiny fixed inputs, check output shapes, fix random seeds, and add a smoke test that overfits one small batch.

```python
def test_scale():
    assert scale([0, 5, 10]) == [0.0, 0.5, 1.0]
```

# Continuous integration

On each pull request a server runs linting and tests. Review for correctness, tests, readability and security.

# Habits that help teams

Write commit messages that say why, keep pull requests small, never commit secrets or large data files (use `.gitignore`), and run the same tests locally that CI will run. Reproducible work is work others can trust.

=== generative-models ===
# Learning to create

Generative models learn the distribution of data so they can produce new samples: images, audio, text, molecules. Four families matter.

# The families

| Family | How it generates | Strength | Weakness |
| --- | --- | --- | --- |
| Autoencoder / VAE | Decode a sample from a latent space | Smooth latent space, stable | Blurry outputs |
| GAN | Generator fools a discriminator | Sharp images, fast sampling | Unstable, mode collapse |
| Diffusion | Remove noise step by step | Top quality, diverse | Slow sampling |
| Autoregressive | Predict the next token | Flexible, text and images | Sequential |

# VAE

Loss = reconstruction error + **KL divergence** that keeps the latent distribution close to a standard normal. Sampling uses the reparameterisation trick: `z = mu + sigma * eps`.

# GAN

A generator and a discriminator train against each other. If the generator finds a few outputs that fool the discriminator it stops varying: **mode collapse**.

# Diffusion

Training adds noise to an image in many steps, `x_t = sqrt(ā_t) x_0 + sqrt(1 - ā_t) ε`, and trains a network to **predict the noise ε**. Generation starts from pure noise and removes it repeatedly. **Classifier-free guidance** trades diversity for prompt fidelity; latent diffusion works in a compressed space to save compute.

# Multimodal

**CLIP** trains an image encoder and a text encoder contrastively so matching pairs sit close together. Vision-language models feed image embeddings into a language model so it can describe and answer questions about pictures.

# Evaluation and risks

FID and human ratings measure quality. Watch for copyright, deepfakes, bias and memorised training data.

=== responsible-ai ===
# Why it matters

Models make decisions about loans, jobs and care. They can be unfair, leak private data or be impossible to explain. Regulators and customers increasingly ask for evidence that you checked.

# Fairness

Removing the protected attribute is not enough: other features act as **proxies**. Common group metrics:

| Metric | Requires equal… |
| --- | --- |
| Demographic parity | Share of positive predictions |
| Equal opportunity | True positive rate |
| Equalised odds | True and false positive rates |
| Calibration | Meaning of a score across groups |

These can conflict, so agree with stakeholders which harm matters most.

```python
gap = rate_a - rate_b   # demographic parity gap
```

# Fixing bias

Pre-processing (reweigh, collect better data), in-processing (fairness constraints), post-processing (group thresholds). Then monitor in production.

# Privacy

- Minimise data and limit its purpose and retention.
- **k-anonymity:** every combination of quasi-identifiers appears in at least k rows.
- **Differential privacy:** adding or removing one person changes the output very little, using calibrated noise.
- Federated learning keeps raw data on devices.

# Explainability

- **Global:** what drives the model overall (feature importance).
- **Local:** why this prediction (SHAP, LIME, counterfactuals).
- SHAP values show contribution relative to a baseline; they are not causal.

# Documentation

Write a **model card** (purpose, data, metrics by group, limits) and a data sheet. Keep a human in the loop for high-stakes decisions.

# In practice

Ask early who could be harmed, measure performance for each group rather than only overall, record the limits of the model, and plan monitoring after launch. Fairness, privacy and explanation are design requirements, not final checks.

=== localization-planning ===
# The robot's three questions

Where am I? Where should I go? How do I get there? These are **localisation**, **planning** and **control**.

# Localisation

A robot estimates its pose from noisy sensors and a map.

- **Kalman filter:** Gaussian beliefs, predict then update. Optimal for linear systems.
- **Particle filter:** many pose hypotheses (particles). Move them with the motion model, weight them by how well sensor readings match the map, then **resample** in proportion to weight. Handles multiple hypotheses.
- **SLAM** builds the map while localising.

# Maps

An **occupancy grid** divides space into cells, each holding the probability that it is occupied.

# Path planning

| Method | Notes |
| --- | --- |
| Dijkstra | Shortest path, explores in all directions |
| A* | Expands lowest `f = g + h`; optimal when `h` never overestimates |
| RRT | Random trees for high-dimensional spaces |

```python
f = g + h   # cost so far + heuristic to goal
```

Manhattan distance is a valid heuristic on a 4-connected grid. Real vehicles must also respect turning limits, speed and moving obstacles, so planners add kinematic constraints and replan often.

# Control

A **PID controller** computes `u = Kp·e + Ki·∫e + Kd·de/dt`, where `e = setpoint - measurement`.

- **P** reacts to the current error.
- **I** removes steady-state error.
- **D** damps overshoot.

Tune by raising P until it oscillates, adding D to calm it, then a little I. Add anti-windup so the integral cannot grow without limit when the actuator saturates.

# Putting it together

Sense, localise, plan, control, repeat many times per second, with safety limits and a fallback stop.
