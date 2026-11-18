=== pat-trees ===
# Trees and recursion

## When to use it
A problem gives you a tree (or a nested structure such as folders, JSON or an expression) and asks for a count, a height, a path, a check or a combined value. If the answer for a node can be built from the answers for its children, recursion fits.

## Template
```python
def solve(node):
    if node is None:          # base case: walked off the tree
        return BASE
    left = solve(node.left)
    right = solve(node.right)
    return combine(node.val, left, right)
```
- **Pre-order**: use information coming down (bounds, running sum) as arguments.
- **Post-order**: use information coming up (heights, sums) as return values.
- **Level-order**: a queue, when the answer is about levels or the nearest node.

## Complexity
| Approach | Time | Extra space |
| --- | --- | --- |
| DFS on n nodes, height h | O(n) | O(h) |
| BFS | O(n) | O(widest level) |
| BST search or insert | O(h) | O(1) iterative |

h is about log n for a balanced tree and n for a chain.

## Classic problems
- Maximum depth, balanced check, diameter
- Validate a BST (pass bounds down)
- Root-to-leaf path sums
- Maximum path sum (return one side, update a global with both)
- Lowest common ancestor
- Tree DP such as house robber: return a pair (taken, skipped)
- Level-order and zigzag traversals

## Common bugs
- Forgetting the empty tree (`None`) as input.
- Comparing a BST node only with its children instead of passing bounds.
- Returning the two-sided path to the parent in a path-sum problem.
- Solving the same subtree twice, which turns O(n) into exponential.
- Plain recursion on a chain of 100,000 nodes: Python raises RecursionError, so use an explicit stack.

=== pat-graphs ===
# Graphs: BFS, DFS, topological sort, union-find

## When to use it
Items with pairwise links: roads, friendships, dependencies, grid cells, words that differ by one letter. Ask which of four questions you have:
- **Fewest steps** between two nodes in an unweighted graph: BFS.
- **Explore everything**, count components, find cycles: DFS (or BFS).
- **Order with dependencies**: topological sort.
- **Groups that merge over time**: union-find.

## Templates
```python
# BFS: mark when you push, not when you pop
queue = deque([start]); seen = {start}
while queue:
    node = queue.popleft()
    for nxt in adj[node]:
        if nxt not in seen:
            seen.add(nxt); queue.append(nxt)

# Kahn topological sort
queue = deque(n for n in nodes if indegree[n] == 0)
# pop, output, decrement neighbours, push those that reach 0
# fewer outputs than nodes means a cycle

# Union-find
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
```

## Complexity
- BFS, DFS, Kahn: O(V + E) time with adjacency lists.
- Union-find with path compression and union by size: nearly O(1) per operation.
- Adjacency matrix: O(V squared) space, usually too big.

## Classic problems
Number of islands, fewest hops, course schedule, redundant connection, word ladder, clone a graph, bipartite check, connected components after merges.

## Common bugs
- Marking visited on pop, so nodes enter the queue many times.
- Using a visited set for cycle detection in a directed graph (you need an "on the current path" state).
- Recursive DFS on a huge grid: use a stack.
- Using BFS when edges have different weights (use Dijkstra).
- Forgetting disconnected parts: loop over every start node.

=== pat-heaps ===
# Heaps and top-k

## When to use it
You repeatedly need the smallest or largest item while items arrive or change. Phrases: "k largest", "k most frequent", "closest k", "merge k sorted lists", "schedule the next task", "running median", "cheapest next step".

## Template
```python
import heapq

heap = []                     # min-heap
heapq.heappush(heap, x)       # O(log n)
smallest = heapq.heappop(heap)  # O(log n)
peek = heap[0]                # O(1)
heapq.heapify(items)          # O(n)

# top k largest in O(n log k): keep a min-heap of size k
for x in stream:
    if len(heap) < k:
        heapq.heappush(heap, x)
    elif x > heap[0]:
        heapq.heapreplace(heap, x)
```
For a max-heap push negated values. For ties or objects push tuples such as `(priority, counter, item)`.

## Complexity
| Task | Time |
| --- | --- |
| Top k of n with a size-k heap | O(n log k) |
| Sort everything | O(n log n) |
| Heapify a list | O(n) |
| Dijkstra with a heap | O((V + E) log V) |

## Classic problems
Kth largest, last stone weight, top k frequent words, meeting rooms, merge k sorted lists, running median (two heaps), Dijkstra, task scheduling.

## Common bugs
- Expecting a max-heap: heapq is a min-heap.
- Pushing tuples whose second field cannot be compared when the first fields tie.
- Using a heap of size n when a heap of size k is enough.
- Removing an arbitrary item (heaps cannot): use lazy deletion by skipping stale entries.
- Using Dijkstra with negative weights.
- Treating `heap` as sorted: only `heap[0]` is guaranteed.

=== pat-dp ===
# Dynamic programming

## When to use it
Brute force recursion branches again and again into the same arguments, and the best answer is built from best answers to smaller cases. Signals: "number of ways", "minimum or maximum cost", "longest", "can it be done", on sequences, grids, strings or a budget.

## Template
1. Define the **state**: what does `dp[i]` (or `dp[i][j]`) mean in words?
2. Write the **transition**: how does a state follow from smaller ones?
3. Set the **base cases** and the order of filling.
4. Return the right cell.

```python
# fewest coins for an amount
best = [0] + [INF] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            best[a] = min(best[a], best[a - c] + 1)
```
Top-down: recursion plus a cache (`functools.lru_cache`). Bottom-up: a loop that fills the table.

## Complexity
Time is the number of states times the work per state. Examples: coin change O(amount times coins); edit distance O(n m); longest increasing subsequence O(n log n) with binary search over tails. Space can often drop to one or two rows.

## Classic problems
Climbing stairs, house robber, coin change, longest common subsequence, edit distance, knapsack, longest increasing subsequence, word break, grid paths.

## Common bugs
- A vague state, so the transition is wrong.
- Wrong base case, such as dp[0] for an empty prefix.
- Using greedy where a choice cannot be undone.
- Infinity arithmetic: check for unreachable before adding one.
- Looping in the wrong direction in a one-dimensional knapsack.
- Deep recursion in the top-down version: use a loop for large n.

=== pat-backtracking ===
# Backtracking

## When to use it
You must list or search all arrangements that satisfy rules: subsets, permutations, combinations that reach a target, placements on a board, a partition into groups. The input is small (often up to about 10 to 20 items) because the space is exponential.

## Template
```python
def solve(path, choices_left):
    if is_complete(path):
        result.append(path[:])      # copy!
        return
    for choice in options(path, choices_left):
        if not valid(path, choice):
            continue                # prune
        path.append(choice)         # choose
        solve(path, ...)            # explore
        path.pop()                  # un-choose
```
To avoid duplicates, pass a start index (combinations) or count remaining copies of each value (permutations with repeats).

## Complexity
| Problem | Size of the search |
| --- | --- |
| Subsets | 2^n |
| Permutations | n! (times n to copy each) |
| N-queens | below n!, thanks to pruning |
| Combination sum | depends on target and candidates |

Pruning does not change the worst case but often decides whether a test finishes in milliseconds or hours.

## Classic problems
Subsets, permutations, combination sum, generate parentheses, N-queens, sudoku, word search, partition into k equal groups.

## Common bugs
- Saving `path` instead of a copy.
- Forgetting to undo one piece of state (a visited flag, a running sum).
- Producing duplicates: missing start index, or no handling of repeated values.
- Pruning too late, after the expensive work.
- Not trying the most constrained choice first (largest numbers first in partition problems).
- Missing memoisation when many paths reach the same state: then it is really a DP problem.
