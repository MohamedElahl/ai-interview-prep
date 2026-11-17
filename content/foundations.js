const R = String.raw;

export default [
  {
    id: 'python', title: 'Python essentials', tracks: ['all'],
    tasks: [
      {
        id: 'py-topk', title: 'Top-k words',
        prompt: `Write \`top_k_words(text, k)\`.

- Lowercase the text. A word is a run of the letters a to z; everything else separates words.
- Return a list of \`(word, count)\` tuples for the \`k\` most frequent words.
- Sort by count, highest first. Break ties alphabetically.`,
        starter: R`def top_k_words(text, k):
    # your code here
    pass

print(top_k_words("the cat and the hat", 2))
`,
        solution: R`import re
from collections import Counter

def top_k_words(text, k):
    words = re.findall(r"[a-z]+", text.lower())
    counts = Counter(words)
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:k]
`,
        tests: [
          { name: 'Most frequent word', code: R`assert list(map(tuple, top_k_words("the cat and the hat", 1))) == [("the", 2)], 'top_k_words("the cat and the hat", 1) should be [("the", 2)]'` },
          { name: 'Ties break alphabetically', code: R`assert list(map(tuple, top_k_words("b a b a c", 2))) == [("a", 2), ("b", 2)], 'With equal counts, "a" comes before "b"'` },
          { name: 'Case and punctuation', code: R`assert list(map(tuple, top_k_words("Hello, hello! World.", 2))) == [("hello", 2), ("world", 1)], 'Lowercase the text and ignore punctuation'` },
          { name: 'Empty text', code: R`assert list(top_k_words("", 3)) == [], 'Empty text should give an empty list'` }
        ]
      },
      {
        id: 'py-batches', title: 'Batch generator',
        prompt: `Write a generator \`batches(items, size)\` that yields lists of \`size\` items. The last batch may be smaller.

It must work on any iterable (including one you can only loop over once) and must not load everything into memory first. This is how data loaders feed a model.`,
        starter: R`def batches(items, size):
    # use yield
    pass

for b in batches(range(7), 3):
    print(b)
`,
        solution: R`def batches(items, size):
    batch = []
    for x in items:
        batch.append(x)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch
`,
        tests: [
          { name: 'Uneven split', code: R`assert [list(b) for b in batches([1, 2, 3, 4, 5], 2)] == [[1, 2], [3, 4], [5]], 'Expected [[1, 2], [3, 4], [5]]'` },
          { name: 'Exact split', code: R`assert [list(b) for b in batches(iter(range(4)), 4)] == [[0, 1, 2, 3]], 'A one-shot iterator of 4 items with size 4 gives one batch'` },
          { name: 'Empty input', code: R`assert list(batches([], 3)) == [], 'No items means no batches'` },
          { name: 'Is a lazy generator', code: R`import types
assert isinstance(batches([1], 1), types.GeneratorType), 'Use yield so batches are produced lazily'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does `def f(x, cache=[])` risk?', options: ['Nothing, it is idiomatic', 'The same list is shared across every call', 'A syntax error', 'The list is copied on each call, wasting memory'], answer: 1, why: 'Default values are created once, when the function is defined. Use None and create the list inside.', level: 'medium' },
      { q: 'Which is true of a generator compared with a list?', options: ['It can be indexed', 'It computes items on demand and can be consumed once', 'It is always faster', 'It stores all items up front'], answer: 1, why: 'Generators are lazy and single-pass, which keeps memory flat for large data.', level: 'easy' },
      { q: 'Average time to check `x in s` for a set of n items?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 2, why: 'Sets and dicts are hash tables: average constant-time lookup. A list is O(n).', level: 'easy' },
      { q: 'Why does the GIL matter for ML code?', options: ['It makes numpy slow', 'Threads cannot run Python bytecode in parallel, so CPU-bound work needs processes or native code', 'It blocks all I/O', 'It prevents use of GPUs'], answer: 1, why: 'Threads still help for I/O. numpy and PyTorch release the GIL inside native code.', level: 'hard' },
      { q: 'Which of these types is immutable?', options: ['list', 'dict', 'tuple', 'set'], answer: 2, why: 'Tuples cannot be changed after creation.', level: 'easy' },
      { q: 'What does len({1, 2, 2, 3}) return?', options: ['3', '4', '2', '1'], answer: 0, why: 'A set keeps one copy of each value.', level: 'easy' },
      { q: 'What is [x * x for x in range(4) if x % 2 == 0]?', options: ['[0, 1, 4, 9]', '[1, 9]', '[0, 2]', '[0, 4]'], answer: 3, why: 'Only x = 0 and x = 2 pass the filter.', level: 'medium' },
      { q: 'What is the idiomatic way to read a file so it is always closed?', options: ['f = open(path) and never close it', 'with open(path) as f: …', 'f = read(path)', 'import file'], answer: 1, why: 'The context manager closes the file even on an error.', level: 'medium' },
      { q: 'After running d["a"] = d.get("a", 0) + 1 three times on an empty dict d, what is d?', options: ['{"a": 1}', '{"a": 3}', '{}', '{"a": 0}'], answer: 1, why: 'get returns 0 the first time, then the stored count.', level: 'medium' },
      { q: 'What does this print?\nfs = [lambda: i for i in range(3)]\nprint([f() for f in fs])', options: ['[0, 1, 2]', '[0, 0, 0]', '[1, 2, 3]', '[2, 2, 2]'], answer: 3, why: 'Closures look up i when called, after the loop ended with i = 2.', level: 'hard' },
      { q: 'What is the time complexity of list.insert(0, x) on a list of n items?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], answer: 0, why: 'Every existing item must shift one place.', level: 'hard' },
      { q: 'Why is "".join(parts) preferred over s += part inside a loop?', options: ['join uses less memory for a single part', 'The += operator is not allowed on strings', 'Repeated concatenation can copy the growing string each time, which is quadratic; join builds it once', 'join sorts the parts first'], answer: 2, why: 'Build a list and join once.', level: 'hard' }
    ],
    interview: [
      { q: 'What is the difference between a list, a tuple, a set and a dictionary, and when would you use each?', points: [['List is ordered and mutable', ['mutable', 'ordered', 'append']], ['Tuple is immutable', ['immutable', 'cannot change', "can't change", 'hashable']], ['Set holds unique items with fast lookup', ['unique', 'duplicate', 'membership']], ['Dict maps keys to values with O(1) lookup', ['key', 'hash', 'constant time', 'o(1)']]], model: 'A list is an ordered, mutable sequence, my default for collections I loop over. A tuple is immutable, so it is safe as a dictionary key or a fixed record. A set stores unique hashable items with constant-time membership tests, good for de-duplication. A dictionary maps keys to values, also with constant-time lookup, and is what I use for counting, caching and joining data by key.' },
      { q: 'Explain generators and when you would use one in a machine learning pipeline.', points: [['Uses yield and is lazy', ['yield', 'lazy', 'on demand']], ['Saves memory', ['memory']], ['Good for streaming or batching large data', ['batch', 'stream', 'large', 'data loader', 'dataloader']], ['Can only be iterated once', ['once', 'single pass', 'exhaust']]], model: 'A generator is a function that uses yield to produce values one at a time, keeping its state between calls. Nothing is computed until you ask for the next item, so memory stays constant however large the data is. In ML I use them to read a huge file line by line or to feed mini-batches to a model. The trade-off is that a generator is single-pass: once exhausted you have to create it again.' },
      { q: 'What is the Global Interpreter Lock and how do you work around it?', points: [['Only one thread runs Python bytecode at a time', ['one thread', 'single thread', 'bytecode', 'at a time']], ['Threads are still fine for I/O', ['i/o', 'io', 'network', 'waiting']], ['Use multiprocessing for CPU-bound work', ['multiprocessing', 'process']], ['Native libraries release it', ['numpy', 'native', 'c extension', 'release', 'vectoriz']]], model: 'The GIL is a lock in CPython that lets only one thread execute Python bytecode at a time, so threads do not speed up CPU-bound Python code. Threads or asyncio still help for I/O such as API calls. For CPU-heavy work I use multiprocessing, or better, push the work into vectorised numpy or PyTorch, which release the GIL in native code.' }
    ]
  },

  {
    id: 'dsa', title: 'Data structures and algorithms', tracks: ['all'],
    tasks: [
      {
        id: 'dsa-twosum', title: 'Two sum',
        prompt: `Write \`two_sum(nums, target)\` that returns the indices \`[i, j]\` with \`i < j\` of the two numbers that add up to \`target\`. Exactly one answer exists.

Aim for O(n) time. A hidden test uses 200,000 numbers.`,
        starter: R`def two_sum(nums, target):
    pass

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
`,
        solution: R`def two_sum(nums, target):
    seen = {}
    for j, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], j]
        seen[x] = j
`,
        tests: [
          { name: 'Basic case', code: R`assert list(two_sum([2, 7, 11, 15], 9)) == [0, 1], 'two_sum([2, 7, 11, 15], 9) should be [0, 1]'` },
          { name: 'Answer not at the start', code: R`assert list(two_sum([3, 2, 4], 6)) == [1, 2], 'two_sum([3, 2, 4], 6) should be [1, 2]'` },
          { name: 'Duplicate values', code: R`assert list(two_sum([3, 3], 6)) == [0, 1], 'The same value can appear twice at different indices'` },
          { name: 'Large input (needs O(n))', code: R`n = 200000
assert list(two_sum(list(range(n)), 2 * n - 3)) == [n - 2, n - 1], 'Wrong answer on the large input'` }
        ]
      },
      {
        id: 'dsa-brackets', title: 'Valid brackets',
        prompt: `Write \`is_valid(s)\` that returns \`True\` if every bracket in \`s\` is closed by the same type in the correct order. \`s\` contains only \`()[]{}\`.`,
        starter: R`def is_valid(s):
    pass

print(is_valid("([]{})"))  # True
`,
        solution: R`def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack
`,
        tests: [
          { name: 'Nested brackets', code: R`assert is_valid("([]{})") is True, '"([]{})" is valid'` },
          { name: 'Wrong order', code: R`assert is_valid("([)]") is False, '"([)]" is not valid'` },
          { name: 'Unclosed bracket', code: R`assert is_valid("((") is False, '"((" is not valid'` },
          { name: 'Closing without opening', code: R`assert is_valid("]") is False, '"]" is not valid'` },
          { name: 'Empty string', code: R`assert is_valid("") is True, 'An empty string is valid'` }
        ]
      }
    ],
    quiz: [
      { q: 'You need the k largest items from a stream of n items. Best structure?', options: ['Sort everything: O(n log n)', 'A min-heap of size k: O(n log k)', 'A hash map', 'A linked list'], answer: 1, why: 'Keep a min-heap of the k best so far; pop the smallest whenever it grows past k.', level: 'medium' },
      { q: 'Binary search requires that the data is…', options: ['Stored in a hash table', 'Sorted (or monotonic in the property you test)', 'Unique', 'Numeric'], answer: 1, why: 'You halve the search space by comparing with the middle, which only works with an ordering.', level: 'easy' },
      { q: 'BFS on an unweighted graph gives you…', options: ['A topological order', 'The shortest path in number of edges', 'The minimum spanning tree', 'All cycles'], answer: 1, why: 'BFS explores in layers of increasing distance from the start.', level: 'easy' },
      { q: 'Which approach fits "longest substring without repeating characters"?', options: ['Sliding window with a set or map', 'Sorting', 'Recursion with memoisation only', 'Union-find'], answer: 0, why: 'Grow the window on the right and shrink from the left when a repeat appears: O(n).', level: 'medium' },
      { q: 'Which structure gives first-in, first-out order?', options: ['A stack', 'A heap', 'A set', 'A queue'], answer: 3, why: 'BFS uses one.', level: 'easy' },
      { q: 'What is the time complexity of binary search on a sorted array of n items?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 1, why: 'The range halves each step.', level: 'easy' },
      { q: 'You must check whether a string of brackets is balanced. Which structure fits?', options: ['A queue', 'A heap', 'A stack', 'A hash set'], answer: 2, why: 'The most recent opener must be closed first.', level: 'medium' },
      { q: 'How do you detect a duplicate in a list in O(n) time?', options: ['Scan the list and add each item to a set, stopping when one is already there', 'Sort and compare pairs', 'Compare every pair of items', 'Use binary search on the unsorted list'], answer: 0, why: 'Set membership is O(1) on average.', level: 'medium' },
      { q: 'You merge k sorted lists with n items in total using a heap. What is the time complexity?', options: ['O(n log n)', 'O(n × k)', 'O(k log n)', 'O(n log k)'], answer: 3, why: 'The heap holds one item per list.', level: 'hard' },
      { q: 'Two-sum on a sorted array with O(1) extra memory. Which technique?', options: ['A hash map of every value', 'Two pointers moving inwards from both ends', 'Recursion with memoisation', 'A max-heap'], answer: 1, why: 'Move the left pointer up when the sum is too small, the right pointer down when too large.', level: 'hard' },
      { q: 'What are the average and worst-case times of quickselect (the k-th smallest item)?', options: ['O(log n) on average and O(n) worst', 'O(n) on average and O(n²) in the worst case', 'O(n log n) always', 'O(n) always'], answer: 1, why: 'Bad pivots degrade it.', level: 'hard' },
      { q: 'Which algorithm finds the maximum-sum contiguous subarray in O(n) time?', options: ['Binary search on the answer', 'Sorting the array first', 'Breadth-first search', 'Kadane’s algorithm: keep the best sum ending at each position'], answer: 3, why: 'best_ending_here = max(x, best_ending_here + x).', level: 'hard' }
    ],
    interview: [
      { q: 'How does a hash map work, and what is its time complexity?', points: [['A hash function maps the key to a bucket', ['hash function', 'bucket', 'index']], ['Average O(1) insert and lookup', ['o(1)', 'constant']], ['Collisions are handled by chaining or probing', ['collision', 'chain', 'probing']], ['Worst case O(n), tables resize as they fill', ['worst', 'o(n)', 'resize', 'load factor']]], model: 'A hash map applies a hash function to the key to pick a bucket in an array. Insert, lookup and delete are constant time on average. Two keys can land in the same bucket, a collision, which is handled by chaining or open addressing. If many keys collide the worst case degrades to linear, so the table resizes and rehashes when its load factor gets high.' },
      { q: 'Walk me through how you approach a coding problem you have not seen before.', points: [['Clarify inputs, outputs and constraints', ['clarify', 'constraint', 'ask', 'input']], ['Work through examples and edge cases', ['example', 'edge case']], ['Start with a brute force, then optimise', ['brute force', 'naive', 'optimi']], ['State the complexity', ['complexity', 'big o', 'o(n']], ['Test the code', ['test', 'walk through', 'dry run']]], model: 'First I restate the problem and ask about input size, edge cases and the expected output. I work a small example by hand, then describe a brute-force solution and its complexity so we have a baseline. I look for the bottleneck and a structure that removes it, such as a hash map, two pointers or a heap. I explain the plan before coding, write clean code while talking, then dry-run it on an example and an edge case, and finish by stating time and space complexity.' },
      { q: 'When would you choose a heap over sorting?', points: [['Top-k or streaming data', ['top k', 'top-k', 'stream', 'largest', 'smallest']], ['O(n log k) instead of O(n log n)', ['log k', 'n log n']], ['Push and pop are O(log n)', ['log n', 'logarithmic', 'push', 'pop']]], model: 'A heap is the better choice when I only need the smallest or largest few items, or when data arrives as a stream. Keeping a heap of size k costs n log k rather than n log n for a full sort, and I never hold all the data in memory. It is also the right structure for a priority queue, for example in Dijkstra or when merging k sorted lists.' }
    ]
  },

  {
    id: 'algo-advanced', title: 'Graphs and dynamic programming', tracks: ['all'],
    tasks: [
      {
        id: 'alg-grid', title: 'Shortest path in a grid (BFS)',
        prompt: `Write \`shortest_path(grid)\`. \`grid\` is a list of strings where \`.\` is open and \`#\` is a wall. You start at the top-left cell and want to reach the bottom-right cell, moving up, down, left or right.

Return the smallest number of moves, or \`-1\` if there is no path. The start cell is always open.`,
        starter: R`from collections import deque

def shortest_path(grid):
    pass

print(shortest_path(["..#", "#..", "..."]))  # 4
`,
        solution: R`from collections import deque

def shortest_path(grid):
    rows, cols = len(grid), len(grid[0])
    if grid[rows - 1][cols - 1] == "#":
        return -1
    seen = {(0, 0)}
    queue = deque([(0, 0, 0)])
    while queue:
        r, c, d = queue.popleft()
        if (r, c) == (rows - 1, cols - 1):
            return d
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "." and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc, d + 1))
    return -1
`,
        tests: [
          { name: 'Open grid', code: R`assert shortest_path(["..", ".."]) == 2, 'A 2x2 open grid needs 2 moves'` },
          { name: 'Around walls', code: R`assert shortest_path(["..#", "#..", "..."]) == 4, 'Expected 4 moves'
assert shortest_path([".#...", ".#.#.", ".#.#.", "...#."]) == 13, 'The only route snakes around the walls: 13 moves'` },
          { name: 'No path', code: R`assert shortest_path([".#", "#."]) == -1 and shortest_path(["..", ".#"]) == -1, 'Return -1 when the goal cannot be reached'` },
          { name: 'Single cell and large grid', code: R`assert shortest_path(["."]) == 0, 'Start equals goal: 0 moves'
assert shortest_path(["." * 300] * 300) == 598, 'A 300x300 open grid needs 598 moves (use a visited set and a queue)'` }
        ]
      },
      {
        id: 'alg-coins', title: 'Coin change (dynamic programming)',
        prompt: `Write \`min_coins(coins, amount)\` that returns the fewest coins needed to make \`amount\`, using each coin value as many times as you like. Return \`-1\` if it cannot be made.

A greedy approach fails here: for coins \`[1, 3, 4]\` and amount 6 the answer is 2 (3 + 3), not 3 (4 + 1 + 1).`,
        starter: R`def min_coins(coins, amount):
    pass

print(min_coins([1, 3, 4], 6))  # 2
`,
        solution: R`def min_coins(coins, amount):
    INF = float("inf")
    best = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return best[amount] if best[amount] != INF else -1
`,
        tests: [
          { name: 'Standard case', code: R`assert min_coins([1, 2, 5], 11) == 3, '11 = 5 + 5 + 1'` },
          { name: 'Greedy fails', code: R`assert min_coins([1, 3, 4], 6) == 2, '6 = 3 + 3, which beats 4 + 1 + 1'` },
          { name: 'Impossible and zero', code: R`assert min_coins([2], 3) == -1, 'An odd amount cannot be made from 2s'
assert min_coins([5], 0) == 0, 'Amount 0 needs 0 coins'` },
          { name: 'Larger amount', code: R`assert min_coins([186, 419, 83, 408], 6249) == 20, 'Expected 20 coins'` }
        ]
      },
      {
        id: 'alg-dijkstra', title: 'Dijkstra shortest paths',
        prompt: `Write \`dijkstra(graph, source)\`. \`graph\` maps each node to a list of \`(neighbour, weight)\` pairs with non-negative weights.

Return a dict with the shortest distance from \`source\` to every node that can be reached (including \`source\` itself at distance 0). Use a heap.`,
        starter: R`import heapq

def dijkstra(graph, source):
    pass

g = {"A": [("B", 1), ("C", 4)], "B": [("C", 2)], "C": []}
print(dijkstra(g, "A"))  # {'A': 0, 'B': 1, 'C': 3}
`,
        solution: R`import heapq

def dijkstra(graph, source):
    dist = {source: 0}
    heap = [(0, source)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float("inf")):
            continue
        for nxt, w in graph.get(node, []):
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(heap, (nd, nxt))
    return dist
`,
        tests: [
          { name: 'Indirect route is shorter', code: R`g = {"A": [("B", 1), ("C", 4)], "B": [("C", 2)], "C": []}
assert dict(dijkstra(g, "A")) == {"A": 0, "B": 1, "C": 3}, 'A to C through B costs 3, less than the direct edge 4'` },
          { name: 'Unreachable nodes are left out', code: R`g = {1: [(2, 5)], 2: [], 3: [(1, 1)]}
assert dict(dijkstra(g, 1)) == {1: 0, 2: 5}, 'Node 3 cannot be reached from 1, so it is not in the result'` },
          { name: 'Cycle and many paths', code: R`g = {"s": [("a", 7), ("b", 2)], "b": [("a", 3), ("c", 8)], "a": [("c", 1), ("s", 1)], "c": []}
assert dict(dijkstra(g, "s")) == {"s": 0, "b": 2, "a": 5, "c": 6}, 'Expected s:0, b:2, a:5, c:6'` },
          { name: 'Long chain', code: R`n = 20000
g = {i: [(i + 1, 1)] for i in range(n)}
g[n] = []
assert dijkstra(g, 0)[n] == n, 'Distance along a chain of 20000 edges should be 20000'` }
        ]
      }
    ],
    quiz: [
      { q: 'BFS versus Dijkstra?', options: ['They are identical', 'BFS finds shortest paths when all edges cost the same; Dijkstra handles different non-negative weights', 'Dijkstra works only on trees', 'BFS needs a heap'], answer: 1, why: 'BFS is Dijkstra with a plain queue, valid because every step costs one.', level: 'easy' },
      { q: 'Two signs that a problem suits dynamic programming?', options: ['It is about strings', 'Overlapping subproblems and optimal substructure', 'It needs sorting', 'It has a graph'], answer: 1, why: 'The best answer is built from best answers to smaller problems, and those smaller problems repeat.', level: 'easy' },
      { q: 'Dijkstra with a binary heap runs in…', options: ['O(V²) always', 'O((V + E) log V)', 'O(E)', 'O(V!)'], answer: 1, why: 'Each edge can push to the heap once, and each push or pop costs log V.', level: 'medium' },
      { q: 'Dijkstra can give wrong answers when…', options: ['The graph has cycles', 'Some edge weights are negative', 'The graph is directed', 'There are more than 100 nodes'], answer: 1, why: 'It assumes a settled node cannot be improved later. Use Bellman-Ford for negative weights.', level: 'medium' },
      { q: 'The Hungarian algorithm, used to match detections to tracks, solves…', options: ['Shortest path', 'The assignment problem: a minimum-cost one-to-one matching', 'Sorting', 'Minimum spanning tree'], answer: 1, why: 'It runs in O(n³) and gives the globally best matching, unlike a greedy approach.', level: 'hard' },
      { q: 'What is memoisation?', options: ['Caching the results of function calls so they are not recomputed', 'Sorting the input', 'Using a queue', 'Compressing the output'], answer: 0, why: 'It turns exponential recursion into polynomial time when subproblems repeat.', level: 'easy' },
      { q: 'In BFS on a grid, which structure holds the frontier?', options: ['A stack', 'A max-heap', 'A queue', 'A sorted list'], answer: 2, why: 'FIFO order explores by distance.', level: 'easy' },
      { q: 'Coins are [1, 5, 10] and the amount is 12. What is the minimum number of coins?', options: ['2', '4', '12', '3'], answer: 3, why: '10 + 1 + 1.', level: 'medium' },
      { q: 'How many states does a dynamic programme over an R × C grid have, if each cell is one state?', options: ['R + C', 'R × C', 'R²', '2^(R × C)'], answer: 1, why: 'One answer per cell.', level: 'medium' },
      { q: 'Coins are [1, 3, 4] and the amount is 6. What do greedy (largest first) and the optimum give?', options: ['Both use 2 coins', 'Both use 3 coins', 'Greedy uses 3 coins (4 + 1 + 1); the optimum uses 2 (3 + 3)', 'Greedy uses 2 and the optimum uses 3'], answer: 2, why: 'Greedy fails for some coin systems.', level: 'hard' },
      { q: 'Which algorithm can detect a negative cycle in a weighted graph?', options: ['Bellman-Ford', 'Dijkstra', 'Breadth-first search', 'Binary search'], answer: 0, why: 'If an edge still relaxes after V - 1 rounds, a negative cycle exists.', level: 'hard' },
      { q: 'Dijkstra with a heap may hold stale entries for a node. How are they handled?', options: ['Rebuild the heap each time', 'Delete the node from the graph', 'Run the algorithm twice', 'Skip any popped entry whose distance is larger than the best known distance'], answer: 3, why: 'This is lazy deletion.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain dynamic programming and how you recognise a DP problem.', points: [['Break the problem into overlapping subproblems', ['subproblem', 'overlap']], ['Optimal substructure: build from smaller optimal answers', ['optimal substructure', 'smaller', 'build']], ['Store results: memoisation or a table', ['memo', 'table', 'cache', 'store']], ['Define state and transition, then check complexity', ['state', 'transition', 'recurrence', 'complexity']]], model: 'Dynamic programming solves a problem by combining solutions to smaller subproblems and storing them so that each is computed only once. I look for two signs: the optimal answer can be built from optimal answers to smaller instances, and the same subproblems recur. Typical phrasings are "count the ways", "minimum cost" or "longest". My method is to define the state, write the recurrence that relates a state to smaller ones, set the base cases, and then implement it top-down with memoisation or bottom-up with a table. The complexity is the number of states times the work per state.' },
      { q: 'When would you use BFS, DFS, Dijkstra or A*?', points: [['BFS: shortest path with equal edge costs, level order', ['bfs', 'breadth', 'unweighted', 'level']], ['DFS: exhaustive exploration, cycles, topological order', ['dfs', 'depth', 'cycle', 'topolog', 'backtrack']], ['Dijkstra: non-negative weighted shortest path', ['dijkstra', 'weight']], ['A*: Dijkstra guided by a heuristic toward the goal', ['a*', 'a star', 'heuristic']]], model: 'BFS explores in layers, so it finds the shortest path when every edge has the same cost, for example moves on a grid. DFS goes deep first and suits tasks that need to explore everything: connected components, cycle detection, topological sorting and backtracking. Dijkstra finds shortest paths when edges have different non-negative weights, using a priority queue. A-star is Dijkstra plus a heuristic that estimates the remaining distance, so it expands far fewer nodes when there is a single goal; it is the standard choice in path planning for robots and vehicles.' },
      { q: 'Tell me about an algorithm you optimised and how you measured the improvement.', points: [['The original bottleneck', ['bottleneck', 'slow', 'profil', 'too long']], ['How you found it: profiling or complexity analysis', ['profil', 'measure', 'complexity', 'big o', 'timing']], ['The change: better algorithm, data structure or vectorisation', ['vectoriz', 'vectoris', 'hash', 'cache', 'index', 'algorithm', 'data structure', 'c code']], ['Before and after numbers', ['from', 'reduced', 'faster', 'x faster', 'ms', 'seconds', '%']]], model: 'Use a real case with numbers. Describe the bottleneck and how you located it, with a profiler or by reasoning about complexity, not by guessing. Explain the change: replacing a nested loop with a hash lookup, vectorising with numpy, caching repeated work, or moving a hot path to C. Give the before and after, for example from 2 seconds to 40 milliseconds per frame, and say how you checked that the output stayed correct.' }
    ]
  },

  {
    id: 'sql', title: 'SQL for data and ML roles', tracks: ['ds', 'da', 'mle', 'mlops'],
    tasks: [
      {
        id: 'sql-agg', title: 'Group and filter', lang: 'sql', ordered: true,
        prompt: `Table \`employees(id, name, dept, salary)\`.

For each department with **at least 2 employees**, return \`dept\`, the number of employees as \`n\`, and the average salary as \`avg_salary\`. Order by \`avg_salary\`, highest first.`,
        setup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'Mona','ML',42000),(2,'Omar','ML',55000),(3,'Sara','Data',38000),
 (4,'Ali','Data',39000),(5,'Nour','ML',56000),(6,'Hany','Platform',47000);`,
        hiddenSetup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'A','X',10),(2,'B','X',30),(3,'C','Y',100),(4,'D','Z',50),(5,'E','Z',70),(6,'F','Z',90),(7,'G','W',5),(8,'H','W',6);`,
        starter: R`SELECT dept
FROM employees;
`,
        solution: R`SELECT dept, COUNT(*) AS n, AVG(salary) AS avg_salary
FROM employees
GROUP BY dept
HAVING COUNT(*) >= 2
ORDER BY avg_salary DESC;`
      },
      {
        id: 'sql-window', title: 'Top earner per department', lang: 'sql', ordered: true,
        prompt: `Table \`employees(id, name, dept, salary)\`.

Return \`dept\`, \`name\`, \`salary\` for the highest-paid employee in each department. If several people tie for the top salary, return all of them. Order by \`dept\`, then \`name\`.

Hint: a window function such as \`DENSE_RANK() OVER (PARTITION BY ...)\`.`,
        setup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'Mona','ML',42000),(2,'Omar','ML',55000),(3,'Sara','Data',38000),
 (4,'Ali','Data',38000),(5,'Nour','ML',55000),(6,'Hany','Platform',47000);`,
        hiddenSetup: R`CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES
 (1,'A','X',10),(2,'B','X',30),(3,'C','Y',100),(4,'D','Z',90),(5,'E','Z',70),(6,'F','Z',90),(7,'G','X',30);`,
        starter: R`SELECT dept, name, salary
FROM employees;
`,
        solution: R`SELECT dept, name, salary
FROM (
  SELECT *, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r
  FROM employees
)
WHERE r = 1
ORDER BY dept, name;`
      },
      {
        id: 'sql-antijoin', title: 'Customers with no orders', lang: 'sql', ordered: true,
        prompt: `Tables \`customers(id, name)\` and \`orders(id, customer_id, amount)\`.

Return the \`name\` of every customer who has never placed an order, in alphabetical order.`,
        setup: R`CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL);
INSERT INTO customers VALUES (1,'Yara'),(2,'Karim'),(3,'Laila'),(4,'Tamer');
INSERT INTO orders VALUES (1,1,120.0),(2,1,80.0),(3,3,40.5);`,
        hiddenSetup: R`CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL);
INSERT INTO customers VALUES (1,'Zed'),(2,'Amr'),(3,'Bob'),(4,'Cat'),(5,'Dan');
INSERT INTO orders VALUES (1,5,1.0),(2,3,2.0),(3,3,3.0);`,
        starter: R`SELECT name
FROM customers;
`,
        solution: R`SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL
ORDER BY c.name;`
      }
    ],
    quiz: [
      { q: 'WHERE versus HAVING?', options: ['They are interchangeable', 'WHERE filters rows before grouping; HAVING filters groups after aggregation', 'HAVING runs first', 'WHERE only works with joins'], answer: 1, why: 'You cannot use an aggregate such as COUNT(*) in WHERE because groups do not exist yet.', level: 'easy' },
      { q: 'A LEFT JOIN from A to B returns…', options: ['Only matching rows', 'All rows of A, with NULLs where B has no match', 'All rows of B', 'The Cartesian product'], answer: 1, why: 'Unmatched rows from the left table are kept, which is how you find "missing" records.', level: 'easy' },
      { q: 'RANK() versus DENSE_RANK() after a tie for first place?', options: ['Both give 1, 1, 2', 'RANK gives 1, 1, 3 and DENSE_RANK gives 1, 1, 2', 'RANK gives 1, 2, 3', 'DENSE_RANK skips numbers'], answer: 1, why: 'RANK leaves gaps after ties; DENSE_RANK does not; ROW_NUMBER never ties.', level: 'medium' },
      { q: 'A query filtering on `user_id` scans the whole table. First thing to check?', options: ['Add more RAM', 'Whether there is an index on user_id', 'Rewrite it in Python', 'Use SELECT *'], answer: 1, why: 'An index turns a full scan into a lookup. Confirm with EXPLAIN.', level: 'medium' },
      { q: 'Which keyword removes duplicate rows from a result?', options: ['UNIQUE ROWS', 'DISTINCT', 'GROUP', 'LIMIT'], answer: 1, why: 'SELECT DISTINCT city FROM users.', level: 'easy' },
      { q: 'What does ORDER BY price DESC return first?', options: ['The rows with the lowest price', 'The rows with the highest price', 'Rows in random order', 'Only distinct prices'], answer: 1, why: 'DESC means descending.', level: 'easy' },
      { q: 'How does COUNT(email) differ from COUNT(*)?', options: ['They are identical', 'COUNT(email) counts duplicates twice', 'COUNT(*) skips NULL rows', 'COUNT(email) skips rows where email is NULL'], answer: 3, why: 'COUNT(*) counts rows.', level: 'medium' },
      { q: 'What does WHERE col = NULL return?', options: ['No rows: NULL is never equal to anything, so use IS NULL', 'All rows with a missing col', 'An error always', 'All rows'], answer: 0, why: 'The comparison is unknown, which filters the row out.', level: 'medium' },
      { q: 'Why can NOT IN (subquery) return no rows at all?', options: ['NOT IN is not valid SQL', 'The subquery is run twice', 'If the subquery returns a NULL, every comparison becomes unknown', 'NOT IN only works on numbers'], answer: 2, why: 'Prefer NOT EXISTS or a LEFT JOIN with IS NULL.', level: 'hard' },
      { q: 'What is the default window frame for SUM(x) OVER (ORDER BY d)?', options: ['Only the current row', 'The whole partition', 'The previous row only', 'From the start of the partition to the current row (with ties included)'], answer: 3, why: 'This gives a running total.', level: 'hard' },
      { q: 'Each order has 3 items. After joining orders to items, SUM(orders.total) is three times too large. Why?', options: ['SUM counts NULLs', 'The join repeats each order row once per item', 'GROUP BY was missing a column name', 'Items are stored as text'], answer: 1, why: 'Aggregate before joining, or sum at the right grain.', level: 'hard' },
      { q: 'WHERE DATE(created_at) = "2025-03-01" is slow on a large indexed table. Why?', options: ['DATE is deprecated', 'Indexes do not work with dates', 'The function on the column prevents the index from being used; use a range on created_at', 'The table needs another column'], answer: 2, why: 'Compare the raw column with a start and end timestamp.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain the difference between an inner join, a left join and a full outer join.', points: [['Inner join keeps only matching rows', ['only match', 'both tables', 'intersection']], ['Left join keeps all rows from the left table', ['all rows from the left', 'all of the left', 'left table', 'everything from the left']], ['Unmatched columns become NULL', ['null']], ['Full outer keeps unmatched rows from both sides', ['both sides', 'both tables', 'either']]], model: 'An inner join returns only rows that match in both tables. A left join returns every row from the left table and fills the right-hand columns with NULL where there is no match, which is useful for finding missing records. A full outer join keeps unmatched rows from both sides. I choose based on which side I cannot afford to lose rows from.' },
      { q: 'What are window functions, and give an example where you would use one.', points: [['Compute across related rows without collapsing them', ['without collapsing', 'keep', 'each row', 'not group', "doesn't group", 'without group']], ['OVER with PARTITION BY and ORDER BY', ['over', 'partition']], ['Examples: ranking, running total, previous row', ['rank', 'running', 'lag', 'lead', 'row_number', 'row number', 'moving average']]], model: 'A window function computes a value over a set of rows related to the current row, defined with OVER, PARTITION BY and ORDER BY, without collapsing rows the way GROUP BY does. I use ROW_NUMBER or DENSE_RANK to pick the top item per group, SUM OVER for running totals, and LAG to compare a row with the previous one, for example day-over-day change in active users.' },
      { q: 'A query that powers a dashboard has become slow. How do you investigate?', points: [['Read the execution plan', ['explain', 'execution plan', 'query plan']], ['Check indexes on filter and join columns', ['index']], ['Reduce data early: filter, select fewer columns', ['filter', 'select *', 'fewer columns', 'partition']], ['Pre-aggregate or cache', ['materiali', 'pre-aggregat', 'cache', 'summary table']]], model: 'I start with EXPLAIN to see whether it is doing full scans or an expensive join. I check that filter and join columns are indexed, or partitioned in a warehouse, and that statistics are fresh. Then I reduce the work: filter early, select only needed columns, avoid functions on indexed columns. If it is still heavy and the data changes slowly, I pre-aggregate into a materialised view or summary table that the dashboard reads.' }
    ]
  },

  {
    id: 'stats', title: 'Probability and statistics', tracks: ['ds', 'da', 'mle'],
    tasks: [
      {
        id: 'stats-bayes', title: 'Bayes: positive test',
        prompt: `Write \`posterior(prior, sensitivity, specificity)\` that returns the probability a person has a condition **given a positive test**.

- \`prior\`: P(condition)
- \`sensitivity\`: P(positive | condition)
- \`specificity\`: P(negative | no condition)`,
        starter: R`def posterior(prior, sensitivity, specificity):
    pass

print(posterior(0.01, 0.99, 0.95))
`,
        solution: R`def posterior(prior, sensitivity, specificity):
    true_pos = prior * sensitivity
    false_pos = (1 - prior) * (1 - specificity)
    return true_pos / (true_pos + false_pos)
`,
        tests: [
          { name: 'Rare condition', code: R`assert close(posterior(0.01, 0.99, 0.95), 1/6, 1e-4), 'posterior(0.01, 0.99, 0.95) should be about 0.1667'` },
          { name: 'Balanced prior', code: R`assert close(posterior(0.5, 0.9, 0.9), 0.9), 'posterior(0.5, 0.9, 0.9) should be 0.9'` },
          { name: 'Very rare, perfect sensitivity', code: R`assert close(posterior(0.001, 1.0, 0.99), 0.001 / (0.001 + 0.999 * 0.01)), 'Check the false-positive term: (1 - prior) * (1 - specificity)'` }
        ]
      },
      {
        id: 'stats-ztest', title: 'A/B test z-score',
        prompt: `Write \`two_proportion_z(x1, n1, x2, n2)\` for an A/B test where group 1 had \`x1\` conversions out of \`n1\` and group 2 had \`x2\` out of \`n2\`.

Return \`(z, p_value)\`:

- Pooled rate \`p = (x1 + x2) / (n1 + n2)\`
- Standard error \`sqrt(p * (1 - p) * (1/n1 + 1/n2))\`
- \`z = (p1 - p2) / se\`
- Two-sided p-value from the standard normal. Tip: its CDF is \`0.5 * (1 + math.erf(z / sqrt(2)))\`.`,
        starter: R`import math

def two_proportion_z(x1, n1, x2, n2):
    pass

print(two_proportion_z(120, 1000, 100, 1000))
`,
        solution: R`import math

def two_proportion_z(x1, n1, x2, n2):
    p1, p2 = x1 / n1, x2 / n2
    p = (x1 + x2) / (n1 + n2)
    se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (p1 - p2) / se
    cdf = 0.5 * (1 + math.erf(abs(z) / math.sqrt(2)))
    return z, 2 * (1 - cdf)
`,
        tests: [
          { name: 'z-score', code: R`z, p = two_proportion_z(120, 1000, 100, 1000)
assert close(z, 1.4293, 1e-3), 'z should be about 1.429 for 120/1000 vs 100/1000'` },
          { name: 'p-value', code: R`from statistics import NormalDist
z, p = two_proportion_z(120, 1000, 100, 1000)
assert close(p, 2 * (1 - NormalDist().cdf(abs(z))), 1e-6), 'p-value should be two-sided: 2 * (1 - cdf(|z|))'
assert 0.14 < p < 0.17, 'p should be about 0.153'` },
          { name: 'No difference', code: R`z, p = two_proportion_z(50, 500, 100, 1000)
assert close(z, 0.0) and close(p, 1.0), 'Equal rates give z = 0 and p = 1'` },
          { name: 'Sign flips when groups swap', code: R`z1, p1 = two_proportion_z(30, 200, 50, 220)
z2, p2 = two_proportion_z(50, 220, 30, 200)
assert close(z1, -z2) and close(p1, p2), 'Swapping groups flips the sign of z and keeps p'` }
        ]
      }
    ],
    quiz: [
      { q: 'A p-value of 0.03 means…', options: ['There is a 3% chance the null hypothesis is true', 'If the null were true, data this extreme would occur about 3% of the time', 'The effect is large', 'The result will replicate 97% of the time'], answer: 1, why: 'It is a statement about the data given the null, not about the probability of the hypothesis.', level: 'medium' },
      { q: 'You run 20 A/B test metrics at α = 0.05 with no real effects. Expected false positives?', options: ['0', 'About 1', 'About 5', '20'], answer: 1, why: '20 × 0.05 = 1. Correct for multiple comparisons, for example with Bonferroni.', level: 'medium' },
      { q: 'The central limit theorem says…', options: ['All data is normal', 'The mean of many independent samples is approximately normal, whatever the source distribution', 'Large samples have no variance', 'Medians are unbiased'], answer: 1, why: 'This is why z and t tests on means work for non-normal data with enough samples.', level: 'easy' },
      { q: 'Type II error is…', options: ['Rejecting a true null', 'Failing to detect a real effect', 'Using the wrong test', 'A data-entry mistake'], answer: 1, why: 'Its probability is β; power is 1 − β. Type I is the false positive.', level: 'easy' },
      { q: 'Which is more robust to outliers: the mean or the median?', options: ['The median', 'The mean', 'They are equally robust', 'Neither can be affected'], answer: 0, why: 'One huge value shifts the mean but barely moves the median.', level: 'easy' },
      { q: 'What does the standard deviation measure?', options: ['The middle value', 'The most common value', 'The number of rows', 'The typical spread of values around the mean'], answer: 3, why: 'It has the same units as the data.', level: 'easy' },
      { q: 'P(A) = 0.3 and P(B) = 0.5, and the events are independent. What is P(A and B)?', options: ['0.8', '0.15', '0.2', '0.35'], answer: 1, why: 'Multiply for independent events.', level: 'medium' },
      { q: 'A 95% confidence interval means…', options: ['There is a 95% chance the true value is in this one interval, as a fact about the data', 'If we repeated the procedure many times, about 95% of such intervals would contain the true value', '95% of the data lies in the interval', 'The result is 95% accurate'], answer: 1, why: 'The 95% describes the method, not one interval.', level: 'medium' },
      { q: 'A disease affects 1% of people. A test has 90% sensitivity and a 9% false-positive rate. About what share of positive tests are real?', options: ['About 90%', 'About 50%', 'About 1%', 'About 9%'], answer: 3, why: '0.009 / (0.009 + 0.0891) ≈ 9%.', level: 'hard' },
      { q: 'To halve the margin of error of a survey estimate, the sample size must be…', options: ['Multiplied by about 4', 'Doubled', 'Halved', 'Multiplied by 8'], answer: 0, why: 'The margin shrinks with the square root of n.', level: 'hard' },
      { q: 'You check an A/B test every day and stop as soon as p < 0.05. What is the effect?', options: ['It lowers the false-positive rate', 'It has no effect', 'The false-positive rate rises well above 5%', 'It makes the test more powerful at no cost'], answer: 2, why: 'Repeated looks give many chances for noise to cross the threshold.', level: 'hard' },
      { q: 'A treatment looks better in every subgroup yet worse when the groups are combined. What is this called?', options: ['The law of large numbers', 'Regression to the mean', 'The central limit theorem', 'Simpson’s paradox'], answer: 3, why: 'Group sizes differ between treatments, so the combined rate is dominated by the mix.', level: 'hard' }
    ],
    interview: [
      { q: 'How would you design and analyse an A/B test for a new recommendation model?', points: [['Define a primary metric and hypothesis', ['metric', 'hypothesis']], ['Randomise users into control and treatment', ['random', 'control']], ['Compute sample size or power up front', ['sample size', 'power']], ['Use a significance test and confidence interval', ['p-value', 'p value', 'significan', 'confidence interval']], ['Watch for pitfalls: peeking, novelty, guardrail metrics', ['peek', 'novelty', 'guardrail', 'multiple']]], model: 'I would pick one primary metric, such as click-through or conversion, plus guardrail metrics like latency and revenue. I would randomise at user level into control and treatment, and calculate the sample size needed for the smallest effect worth shipping at 80% power. I run the test for the planned duration, covering at least one full week, without stopping early on a peek. Then I compare with a two-proportion or t-test, report the confidence interval and not only the p-value, and check for novelty effects and segment differences before deciding.' },
      { q: 'Explain a p-value and a confidence interval to a non-technical product manager.', points: [['P-value: how surprising the data is if there were no real effect', ['no effect', 'no real', 'by chance', 'null', 'no difference']], ['It is not the probability the hypothesis is true', ['not the probability', "doesn't mean", 'does not mean']], ['Confidence interval: a range of plausible values for the true effect', ['range', 'plausible', 'interval']], ['Width reflects uncertainty and sample size', ['uncertain', 'sample size', 'narrow', 'wide']]], model: 'The p-value answers: if the change really did nothing, how often would we see a difference this big just by luck? A small value means luck is an unlikely explanation. It does not tell us the chance that the change works. The confidence interval is more useful for decisions: it is the range in which the true lift plausibly sits, for example between 0.5 and 3 percent. A wide range means we need more data.' },
      { q: 'What is the difference between correlation and causation, and how do you establish causation?', points: [['Correlation is association only', ['associat', 'move together', 'related']], ['Confounders can explain it', ['confound', 'third variable', 'hidden']], ['Randomised experiments establish causation', ['random', 'experiment', 'a/b']], ['Otherwise use causal inference methods', ['causal inference', 'instrument', 'difference in difference', 'matching', 'natural experiment']]], model: 'Correlation means two things move together; causation means changing one changes the other. A correlation can come from a confounder that drives both, from reverse causality, or from chance. The clean way to establish causation is a randomised experiment, because randomisation balances confounders. When I cannot experiment, I use causal inference methods such as difference-in-differences, matching or instrumental variables, and I state the assumptions they depend on.' }
    ]
  }
];
