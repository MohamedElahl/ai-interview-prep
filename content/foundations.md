=== python ===
# What interviewers check

Almost every AI interview starts with 20 to 40 minutes of Python. They want clean, correct code and a clear explanation of the trade-offs, not tricks.

# Core ideas to know cold

- **Built-in structures.** `list` (ordered, mutable), `tuple` (immutable, hashable), `set` (unique, O(1) membership), `dict` (key to value, O(1) lookup).
- **Comprehensions.** `[f(x) for x in xs if cond]` is clearer and faster than a loop with `append`.
- **Generators.** A function with `yield` produces values lazily. Use them for large files and batching.
- **`collections`.** `Counter` for counting, `defaultdict` for grouping, `deque` for queues.
- **Sorting.** `sorted(items, key=lambda x: (-x.score, x.name))` sorts by several keys at once.
- **Mutability traps.** Default arguments are created once: never write `def f(x, seen=[])`.

```python
from collections import Counter, defaultdict

counts = Counter(words)            # word -> count
top3 = counts.most_common(3)

groups = defaultdict(list)         # group rows by key
for row in rows:
    groups[row["user"]].append(row)
```

# Performance talking points

- Membership in a list is O(n); in a set or dict it is O(1).
- The GIL stops threads running Python bytecode in parallel. Use threads for I/O, processes or vectorised numpy for CPU work.
- Vectorised numpy is often 10 to 100 times faster than a Python loop.

# In the interview

Say your plan before typing, name the complexity, and test with one normal case and one edge case (empty input, one item, duplicates).

=== dsa ===
# What interviewers check

Most AI roles ask one or two algorithm questions at easy to medium level. Recognising the pattern matters more than memorising solutions.

# The patterns that cover most questions

| Pattern | Use it when | Typical cost |
| --- | --- | --- |
| Hash map or set | "Have I seen this before?", counting, pairs | O(n) |
| Two pointers | Sorted array, pairs, in-place edits | O(n) |
| Sliding window | Best contiguous substring or subarray | O(n) |
| Stack | Matching brackets, "next greater" | O(n) |
| Binary search | Sorted data, or a yes/no answer that flips once | O(log n) |
| Heap | Top-k, streaming, merging sorted lists | O(n log k) |
| BFS / DFS | Grids, graphs, trees, shortest path in steps | O(V + E) |
| Dynamic programming | Overlapping subproblems, "count the ways", "best total" | varies |

# Complexity in one minute

- O(1) hash lookup, O(log n) binary search, O(n) one pass, O(n log n) sorting, O(n²) nested loops.
- With n around 100,000, O(n²) is too slow and O(n log n) is fine.

# A method that works under pressure

1. Restate the problem and ask about constraints and edge cases.
2. Solve a small example by hand.
3. Describe the brute-force solution and its cost.
4. Find the bottleneck and remove it with one of the patterns above.
5. Code it while explaining, then dry-run an example.
6. State time and space complexity.

=== algo-advanced ===
# What interviewers check

Graph search and dynamic programming separate medium from easy questions. They also sit underneath real systems: path planning, tracking, sequence alignment and text metrics.

# Graph search

Click cells to build walls, then run the search and watch it spread in layers.

[[demo:bfs]]

| Algorithm | Finds | Structure | Cost |
| --- | --- | --- | --- |
| BFS | Shortest path, equal edge costs | Queue | O(V + E) |
| DFS | Components, cycles, topological order | Stack or recursion | O(V + E) |
| Dijkstra | Shortest path, non-negative weights | Min-heap | O((V + E) log V) |
| A* | Shortest path to one goal, faster | Min-heap plus heuristic | Depends on heuristic |

```python
from collections import deque

def bfs(start, neighbours):
    dist = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in neighbours(node):
            if nxt not in dist:
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return dist
```

# Dynamic programming

Use it when the best answer is built from best answers to smaller problems, and those smaller problems repeat.

1. Define the **state** (what a subproblem is).
2. Write the **transition** (how a state depends on smaller ones).
3. Set the **base cases**.
4. Fill a table bottom-up, or recurse with memoisation.

```python
# fewest coins to make each amount
best = [0] + [float("inf")] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            best[a] = min(best[a], best[a - c] + 1)
```

Classic problems: coin change, longest common subsequence, edit distance, knapsack, longest increasing subsequence.

# Where these appear in AI work

- **A-star** and Dijkstra in robot and vehicle path planning.
- **Hungarian algorithm** for matching detections to tracks.
- **Longest common subsequence** in the ROUGE-L metric.
- **Viterbi and beam search** in sequence decoding.

=== sql ===
# What interviewers check

Data scientist, analyst and many ML engineer interviews include live SQL. Expect joins, grouping and one window-function question.

# Order of execution

`FROM` and `JOIN`, then `WHERE`, then `GROUP BY`, then `HAVING`, then `SELECT`, then `ORDER BY`, then `LIMIT`. This is why you cannot use an aggregate in `WHERE`, and why `HAVING` exists.

# Joins

- `INNER JOIN`: only rows that match on both sides.
- `LEFT JOIN`: every row from the left table; `NULL` where the right has no match.
- Find rows with no match: `LEFT JOIN ... WHERE right.id IS NULL`.

# Aggregation

```sql
SELECT dept, COUNT(*) AS n, AVG(salary) AS avg_salary
FROM employees
WHERE salary > 0            -- filters rows
GROUP BY dept
HAVING COUNT(*) >= 2        -- filters groups
ORDER BY avg_salary DESC;
```

# Window functions

They compute across related rows without collapsing them.

```sql
SELECT name, dept, salary,
       DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r,
       salary - LAG(salary) OVER (PARTITION BY dept ORDER BY salary) AS gap
FROM employees;
```

- `ROW_NUMBER` never ties, `RANK` leaves gaps after ties, `DENSE_RANK` does not.
- `SUM(x) OVER (ORDER BY day)` is a running total.

# Performance talking points

Index the columns you filter and join on, read the plan with `EXPLAIN`, avoid `SELECT *`, and pre-aggregate heavy dashboard queries.

The practice tasks here run on SQLite in your browser.

=== stats ===
# What interviewers check

They want to know you can reason about uncertainty: read an A/B test, avoid common traps and explain results in plain language.

# Probability

- **Bayes' rule.** P(A | B) = P(B | A) P(A) / P(B). With a rare condition, most positive tests are false positives even with an accurate test.
- **Expectation and variance.** E[aX + b] = aE[X] + b. Var(aX) = a² Var(X). Variances of independent variables add.
- **Distributions to recognise.** Bernoulli and binomial (conversions), Poisson (counts per interval), normal (averages), exponential (waiting times).

# Inference

- **Central limit theorem.** The mean of many independent samples is approximately normal. This justifies z and t tests.
- **p-value.** The probability of data at least this extreme if the null hypothesis were true. It is not the probability that the null is true.
- **Confidence interval.** A range of plausible values for the true effect. Report it alongside the p-value.
- **Errors.** Type I is a false positive (rate α). Type II is a missed effect (rate β). Power is 1 − β.

# A/B testing checklist

1. One primary metric and a minimum effect worth detecting.
2. Compute the sample size for that effect at 80% power.
3. Randomise by user, run for full weeks, do not stop on a peek.
4. Test, report the interval, check guardrail metrics.
5. Correct for multiple comparisons if you test many metrics.

# Common traps

Simpson's paradox (a trend reverses when groups are combined), survivorship bias, and reading causation into correlation.
