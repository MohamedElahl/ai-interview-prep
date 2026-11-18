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
      { q: 'What is the difference between a list, a tuple, a set and a dictionary, and when would you use each?', level: 'easy', points: [['List is ordered and mutable', ['mutable', 'ordered', 'append']], ['Tuple is immutable', ['immutable', 'cannot change', "can't change", 'hashable']], ['Set holds unique items with fast lookup', ['unique', 'duplicate', 'membership']], ['Dict maps keys to values with O(1) lookup', ['key', 'hash', 'constant time', 'o(1)']]], model: 'A list is an ordered, mutable sequence, my default for collections I loop over. A tuple is immutable, so it is safe as a dictionary key or a fixed record. A set stores unique hashable items with constant-time membership tests, good for de-duplication. A dictionary maps keys to values, also with constant-time lookup, and is what I use for counting, caching and joining data by key.' },
      { q: 'Explain generators and when you would use one in a machine learning pipeline.', level: 'medium', points: [['Uses yield and is lazy', ['yield', 'lazy', 'on demand']], ['Saves memory', ['memory']], ['Good for streaming or batching large data', ['batch', 'stream', 'large', 'data loader', 'dataloader']], ['Can only be iterated once', ['once', 'single pass', 'exhaust']]], model: 'A generator is a function that uses yield to produce values one at a time, keeping its state between calls. Nothing is computed until you ask for the next item, so memory stays constant however large the data is. In ML I use them to read a huge file line by line or to feed mini-batches to a model. The trade-off is that a generator is single-pass: once exhausted you have to create it again.' },
      { q: 'What is the Global Interpreter Lock and how do you work around it?', level: 'hard', points: [['Only one thread runs Python bytecode at a time', ['one thread', 'single thread', 'bytecode', 'at a time']], ['Threads are still fine for I/O', ['i/o', 'io', 'network', 'waiting']], ['Use multiprocessing for CPU-bound work', ['multiprocessing', 'process']], ['Native libraries release it', ['numpy', 'native', 'c extension', 'release', 'vectoriz']]], model: 'The GIL is a lock in CPython that lets only one thread execute Python bytecode at a time, so threads do not speed up CPU-bound Python code. Threads or asyncio still help for I/O such as API calls. For CPU-heavy work I use multiprocessing, or better, push the work into vectorised numpy or PyTorch, which release the GIL in native code.' },
      { q: 'What is a list comprehension, and when would you avoid one?', level: 'easy', points: [['Compact way to build a list from an iterable', ['build', 'create', 'iterable', 'loop', 'one line', 'compact']], ['Can include a condition or a transformation', ['condition', 'filter', 'if ', 'transform', 'expression']], ['Readable and usually faster than an append loop', ['readab', 'faster', 'speed', 'append']], ['Avoid when logic is nested or large data should be lazy', ['nested', 'complex', 'generator', 'memory', 'lazy', 'unreadable']]], model: 'A list comprehension is a compact way to build a new list from any iterable, with an optional filter. For example, squares of the even numbers is one line instead of a loop with append. It is usually a little faster than the loop and easier to read when the logic is simple. I avoid it when the expression gets complicated, for example nested loops with several conditions, because then a normal loop with a clear name is easier to debug. I also avoid it when the list could be huge and I only need to iterate once. In that case a generator expression keeps memory flat, because it yields items lazily instead of storing them all.' },
      { q: 'What do *args and **kwargs do in a function signature?', level: 'easy', points: [['*args collects extra positional arguments into a tuple', ['tuple', 'positional', 'extra arguments']], ['**kwargs collects extra keyword arguments into a dict', ['dict', 'keyword', 'named']], ['Used for wrappers, decorators and flexible APIs', ['wrapper', 'decorator', 'flexible', 'forward', 'pass through', 'pass along']], ['Can unpack with * and ** when calling', ['unpack', 'spread', 'star']]], model: '*args collects any extra positional arguments into a tuple, and **kwargs collects extra keyword arguments into a dictionary. They let a function accept a flexible number of inputs. I use them mostly in wrappers and decorators, where the wrapper does not know the signature of the function it wraps and simply passes everything along. The same stars work in reverse at the call site: star unpacks a list into positional arguments, and double star unpacks a dictionary into keyword arguments. One caution is that overusing them hides the real signature, so for a public function I prefer explicit named parameters and keep kwargs for forwarding options to another call.' },
      { q: 'What is a decorator, and where might you use one in an ML codebase?', level: 'medium', points: [['A function that wraps another function to add behaviour', ['wrap', 'function that takes', 'takes a function', 'adds behaviour', 'add behaviour', 'add behavior']], ['Applied with the @ syntax without changing the original code', ['@', 'syntax', 'without changing', 'original']], ['Use functools.wraps to keep metadata', ['wraps', 'metadata', 'name', 'docstring']], ['ML uses: timing, logging, caching, retries', ['timing', 'timer', 'log', 'cach', 'retry', 'retries', 'validate']]], model: 'A decorator is a function that takes another function, wraps it with extra behaviour, and returns the new version. The at-sign syntax applies it without touching the original code. In an ML codebase I use decorators to time training steps, log inputs and outputs, cache expensive feature computations with lru_cache, or retry flaky calls to a data source or model API. A good decorator uses functools.wraps so the wrapped function keeps its name and docstring, which matters for debugging and for tools that inspect functions. Decorators that take arguments need one more level of nesting, which is the part people usually trip over, so I keep them small and well tested.' },
      { q: 'What is the difference between a shallow copy and a deep copy, and how can it cause a bug?', level: 'medium', points: [['Shallow copy copies the outer object but shares inner objects', ['shallow', 'share', 'same inner', 'reference', 'nested']], ['Deep copy recursively copies everything', ['deep', 'recursive', 'independent', 'fully']], ['Changing a nested item in a shallow copy changes the original', ['change', 'mutate', 'modif', 'original', 'affect']], ['Tools: copy.copy, copy.deepcopy, list slicing, dataframe copy', ['copy.copy', 'deepcopy', 'slice', '.copy', 'dataframe']]], model: 'A shallow copy creates a new outer container, but the items inside are still the same objects as in the original. A deep copy copies everything recursively, so the two structures are fully independent. The classic bug is copying a list of lists with slicing or the copy method, then modifying an inner list and finding the original changed as well. Another is a config dictionary shared between experiments, where one run quietly edits another run’s settings. I use copy.deepcopy when I need real independence, and in pandas I call dot copy before modifying a slice so I avoid chained-assignment warnings and accidental changes to the source frame.' },
      { q: 'Why is a vectorised NumPy or pandas operation faster than a Python loop, and how do you vectorise code?', level: 'medium', points: [['Loops run in the interpreter, vectorised code runs in compiled C', ['interpreter', 'compiled', 'c code', 'native', 'overhead']], ['Operates on whole arrays at once', ['whole array', 'element-wise', 'elementwise', 'at once', 'array']], ['Techniques: broadcasting, boolean masks, built-in aggregations', ['broadcast', 'mask', 'boolean', 'aggregat', 'built-in', 'where']], ['Trade-off: memory for large intermediate arrays', ['memory', 'intermediate', 'chunk', 'copy']]], model: 'A Python loop pays interpreter overhead on every iteration: type checks, object creation, function calls. A vectorised NumPy operation hands the whole array to compiled C code that runs a tight loop over contiguous memory, often fifty to a hundred times faster. To vectorise, I express the logic as whole-array operations: arithmetic between arrays, broadcasting to combine shapes, boolean masks or np.where instead of if statements, and built-in aggregations like sum and mean with an axis. The trade-off is memory, because vectorised code can create large intermediate arrays. For very large data I process in chunks. When the logic cannot be vectorised, I consider numba or rewriting the hot loop.' },
      { q: 'How does Python manage memory, and how would you track down a memory leak in a long-running service?', level: 'hard', points: [['Reference counting frees objects when the count reaches zero', ['reference count', 'refcount', 'count reaches zero', 'count hits zero']], ['Cyclic garbage collector handles reference cycles', ['cycle', 'cyclic', 'garbage collect', 'gc']], ['Leaks come from lingering references: globals, caches, closures', ['global', 'cache', 'closure', 'growing list', 'lingering', 'keep reference', 'held']], ['Tools: tracemalloc, objgraph, memory profiler, compare snapshots', ['tracemalloc', 'objgraph', 'memory_profiler', 'profil', 'snapshot']], ['Fixes: bounded caches, weak references, restart workers', ['bounded', 'weakref', 'weak reference', 'lru', 'restart', 'limit']]], model: 'CPython frees most objects through reference counting: when the count hits zero the memory is released immediately. A separate cyclic garbage collector cleans up reference cycles. A real leak in Python usually means something still holds a reference, such as an ever-growing global list, an unbounded cache, a closure, or logged objects. To find it, I watch resident memory over time, then use tracemalloc to take snapshots and compare which lines allocate the growth, or objgraph to see which object types keep increasing. Fixes include bounded caches like lru_cache with a maximum size, weak references, clearing buffers, and as a safety net restarting workers after a fixed number of requests. I confirm the fix by seeing memory flatten under load.' },
      { q: 'A data-processing script takes 40 minutes. How do you find out why and make it faster?', level: 'hard', points: [['Measure first with a profiler, not guesses', ['profil', 'cprofile', 'measure', 'timeit', 'benchmark']], ['Find the hot spot and decide whether it is CPU, I/O or memory bound', ['hot spot', 'bottleneck', 'cpu', 'i/o', 'io bound', 'memory bound']], ['Fix: better algorithm or data structure, vectorise, avoid repeated work', ['algorithm', 'data structure', 'vectori', 'cache', 'repeated', 'avoid']], ['Scale out if needed: multiprocessing, chunking, a faster format like parquet', ['multiprocess', 'parallel', 'chunk', 'parquet', 'dask', 'batch']], ['Re-measure and keep a test for correctness', ['re-measure', 'remeasure', 'again', 'test', 'correct', 'same output']]], model: 'I start by measuring, because guessing usually targets the wrong thing. I run cProfile or a line profiler on a smaller sample to find the hot spot, and I check whether the time goes to computation, waiting on disk or network, or memory pressure. Then I fix the biggest cost first. Often that is a better algorithm or data structure, such as a dictionary lookup instead of scanning a list, removing repeated work with caching, or replacing a row-by-row loop with vectorised pandas. If it is I/O bound I read in chunks or switch from CSV to parquet. If it is CPU bound and cannot be vectorised, I use multiprocessing. After each change I re-measure and check that the output is identical.' }
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
      { q: 'How does a hash map work, and what is its time complexity?', level: 'easy', points: [['A hash function maps the key to a bucket', ['hash function', 'bucket', 'index']], ['Average O(1) insert and lookup', ['o(1)', 'constant']], ['Collisions are handled by chaining or probing', ['collision', 'chain', 'probing']], ['Worst case O(n), tables resize as they fill', ['worst', 'o(n)', 'resize', 'load factor']]], model: 'A hash map applies a hash function to the key to pick a bucket in an array. Insert, lookup and delete are constant time on average. Two keys can land in the same bucket, a collision, which is handled by chaining or open addressing. If many keys collide the worst case degrades to linear, so the table resizes and rehashes when its load factor gets high.' },
      { q: 'Walk me through how you approach a coding problem you have not seen before.', level: 'medium', points: [['Clarify inputs, outputs and constraints', ['clarify', 'constraint', 'ask', 'input']], ['Work through examples and edge cases', ['example', 'edge case']], ['Start with a brute force, then optimise', ['brute force', 'naive', 'optimi']], ['State the complexity', ['complexity', 'big o', 'o(n']], ['Test the code', ['test', 'walk through', 'dry run']]], model: 'First I restate the problem and ask about input size, edge cases and the expected output. I work a small example by hand, then describe a brute-force solution and its complexity so we have a baseline. I look for the bottleneck and a structure that removes it, such as a hash map, two pointers or a heap. I explain the plan before coding, write clean code while talking, then dry-run it on an example and an edge case, and finish by stating time and space complexity.' },
      { q: 'When would you choose a heap over sorting?', level: 'medium', points: [['Top-k or streaming data', ['top k', 'top-k', 'stream', 'largest', 'smallest']], ['O(n log k) instead of O(n log n)', ['log k', 'n log n']], ['Push and pop are O(log n)', ['log n', 'logarithmic', 'push', 'pop']]], model: 'A heap is the better choice when I only need the smallest or largest few items, or when data arrives as a stream. Keeping a heap of size k costs n log k rather than n log n for a full sort, and I never hold all the data in memory. It is also the right structure for a priority queue, for example in Dijkstra or when merging k sorted lists.' },
      { q: 'What is the difference between an array and a linked list?', level: 'easy', points: [['Array stores items contiguously with O(1) index access', ['contiguous', 'index', 'o(1)', 'random access', 'constant']], ['Linked list stores nodes with pointers; access is O(n)', ['pointer', 'node', 'next', 'o(n)', 'traverse']], ['Insert or delete in the middle is cheap in a linked list once you hold the node', ['insert', 'delete', 'middle', 'splice', 'shift']], ['Arrays are cache-friendly, so usually faster in practice', ['cache', 'locality', 'faster in practice', 'memory overhead']]], model: 'An array stores its items in one contiguous block, so reading any index is constant time. The cost is that inserting or deleting in the middle means shifting everything after it. A linked list stores each item in a node with a pointer to the next, so inserting or deleting is cheap if you already hold the node, but finding the nth item means walking the list, which is linear. In practice arrays win most of the time because contiguous memory is cache-friendly, while linked lists carry pointer overhead. I reach for a linked list when I need constant-time splicing, for example inside an LRU cache, and otherwise use a dynamic array like a Python list.' },
      { q: 'Explain Big-O notation and give an example each of O(1), O(n), O(n log n) and O(n squared).', level: 'easy', points: [['Big-O describes how cost grows with input size, ignoring constants', ['grow', 'scale', 'input size', 'upper bound', 'ignore constant', 'worst case']], ['O(1) such as a dictionary lookup or array index', ['o(1)', 'lookup', 'index', 'constant']], ['O(n) such as one scan; O(n log n) such as efficient sorting', ['o(n)', 'scan', 'linear', 'n log n', 'sort']], ['O(n squared) such as nested loops comparing all pairs', ['squared', 'n^2', 'nested', 'pairs', 'quadratic']]], model: 'Big-O describes how the running time or memory of an algorithm grows as the input size grows, ignoring constant factors and focusing on the dominant term. Looking up a key in a hash map or reading an array index is O(1): it does not depend on size. A single pass through a list to find the maximum is O(n). Sorting with merge sort or Python’s built-in sort is O(n log n). Comparing every pair of items with two nested loops is O(n squared). I use it to decide whether an approach will survive realistic data: n squared is fine for a thousand items and hopeless for ten million, while n log n stays comfortable.' },
      { q: 'Compare a stack and a queue, and give a practical use of each.', level: 'medium', points: [['Stack is last in, first out; queue is first in, first out', ['lifo', 'fifo', 'last in', 'first in']], ['Stack uses: undo, bracket matching, DFS, call stack', ['undo', 'bracket', 'dfs', 'depth', 'recursion', 'call stack']], ['Queue uses: BFS, task scheduling, message buffers', ['bfs', 'breadth', 'schedul', 'buffer', 'message', 'task']], ['Implementation: list or deque, with O(1) push and pop at the ends', ['deque', 'o(1)', 'list', 'linked', 'ends']]], model: 'A stack is last in, first out, so the most recent item comes out first. A queue is first in, first out, so items leave in arrival order. Stacks are used for undo history, checking balanced brackets, depth-first search and the function call stack. Queues are used for breadth-first search, job scheduling and buffering messages between producer and consumer services. In Python I use a list as a stack, since append and pop at the end are constant time, and collections.deque as a queue, because popping from the front of a list is linear. A priority queue is a related variant where the next item out is the one with the highest priority rather than the oldest.' },
      { q: 'Explain the two-pointer and sliding-window techniques, and when each applies.', level: 'medium', points: [['Two pointers move through a sorted array or from both ends', ['two pointer', 'both ends', 'sorted', 'left', 'right']], ['Sliding window maintains a contiguous range as it moves', ['window', 'contiguous', 'subarray', 'substring', 'range']], ['Both reduce a nested O(n squared) search to O(n)', ['o(n)', 'linear', 'single pass', 'one pass', 'reduce']], ['Example problems: two-sum on sorted input, longest substring without repeats', ['two-sum', 'two sum', 'longest substring', 'max sum', 'duplicate']]], model: 'Both techniques replace a nested loop with a single pass. With two pointers I keep an index at each end, or a slow and a fast one, and move them based on a comparison. Two-sum on a sorted array is the classic case: if the sum is too small I move the left pointer up, and if it is too large I move the right one down. A sliding window is for contiguous subarrays or substrings. I grow the window on the right, and shrink from the left when a condition breaks, keeping a running count or sum. Longest substring without repeats and maximum sum of k consecutive items are standard examples. Each pointer only moves forward, so the total work is linear.' },
      { q: 'Compare quicksort, merge sort and heapsort. Which would you pick and why?', level: 'hard', points: [['Quicksort: average O(n log n), worst O(n squared), in place', ['quicksort', 'quick sort', 'worst case', 'in place', 'pivot']], ['Merge sort: guaranteed O(n log n), stable, needs extra memory', ['merge', 'stable', 'extra memory', 'extra space', 'guaranteed']], ['Heapsort: guaranteed O(n log n), in place, not stable, poor cache use', ['heapsort', 'heap sort', 'not stable', 'cache']], ['Practical choice: library hybrid sort like Timsort or introsort', ['timsort', 'introsort', 'hybrid', 'built-in', 'library', 'standard']]], model: 'Quicksort is usually fastest in practice because it works in place and is cache-friendly, but a bad pivot gives a quadratic worst case. Merge sort guarantees n log n and is stable, meaning equal items keep their order, but it needs extra memory proportional to the input. Heapsort also guarantees n log n and is in place, but it is not stable and jumps around memory, so it is slower in practice. For real work I use the built-in sort. Python uses Timsort, a hybrid of merge and insertion sort that is stable and very fast on partly sorted data, and C++ typically uses introsort. I would only write my own for a special constraint, like external sorting of data bigger than memory.' },
      { q: 'How would you design an LRU cache with constant-time get and put?', level: 'hard', points: [['Needs fast lookup and fast reordering by recency', ['lookup', 'recency', 'order', 'recent']], ['Hash map from key to node', ['hash map', 'dictionary', 'hashmap', 'key to node', 'dict']], ['Doubly linked list keeps usage order with O(1) move and remove', ['doubly', 'linked list', 'move to front', 'move to head', 'head', 'tail']], ['On capacity overflow evict the least recently used at the tail', ['evict', 'capacity', 'tail', 'least recently', 'remove oldest']], ['In Python OrderedDict or functools.lru_cache', ['ordereddict', 'ordered dict', 'lru_cache', 'functools']]], model: 'I need two things in constant time: finding an entry by key, and tracking which one was used least recently. A hash map gives me the lookup, mapping each key to a node. A doubly linked list keeps the nodes in order of use, with the most recent at the head and the oldest at the tail. On every get or put I move that node to the head, which is constant time because the map hands me the node directly and a doubly linked list can unlink it without a search. When the cache exceeds its capacity, I remove the tail node and delete its key from the map. In Python I can get the same behaviour from OrderedDict, or use functools.lru_cache for function results.' },
      { q: 'You have a stream of a billion log lines that does not fit in memory. How do you find the ten most frequent items?', level: 'hard', points: [['Exact counting is a hash map if the distinct keys fit in memory', ['hash map', 'dictionary', 'counter', 'distinct', 'fit in memory']], ['Keep top k with a min-heap of size k', ['min-heap', 'min heap', 'heap', 'size k']], ['If not, partition by hash and count each shard, or process in chunks and merge', ['partition', 'shard', 'hash', 'chunk', 'merge', 'map reduce', 'mapreduce', 'spark']], ['Approximate options: count-min sketch or space-saving', ['count-min', 'count min', 'sketch', 'approximate', 'space-saving', 'probabilistic']], ['State the accuracy and memory trade-off', ['trade-off', 'tradeoff', 'accuracy', 'error', 'memory']]], model: 'First I ask how many distinct items there are. If the distinct keys fit in memory, one pass with a counter dictionary works, and I keep the top ten with a min-heap of size ten. If they do not fit, I hash each item to one of many partitions on disk, so all copies of an item land in the same partition. Then I count each partition separately, take its local top ten, and merge those results, which is how a MapReduce or Spark job does it. If an approximate answer is acceptable, a count-min sketch or space-saving algorithm gives frequent items in fixed memory, with a small, bounded overcount. The trade-off is memory and speed against exactness.' }
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
      { q: 'Explain dynamic programming and how you recognise a DP problem.', level: 'medium', points: [['Break the problem into overlapping subproblems', ['subproblem', 'overlap']], ['Optimal substructure: build from smaller optimal answers', ['optimal substructure', 'smaller', 'build']], ['Store results: memoisation or a table', ['memo', 'table', 'cache', 'store']], ['Define state and transition, then check complexity', ['state', 'transition', 'recurrence', 'complexity']]], model: 'Dynamic programming solves a problem by combining solutions to smaller subproblems and storing them so that each is computed only once. I look for two signs: the optimal answer can be built from optimal answers to smaller instances, and the same subproblems recur. Typical phrasings are "count the ways", "minimum cost" or "longest". My method is to define the state, write the recurrence that relates a state to smaller ones, set the base cases, and then implement it top-down with memoisation or bottom-up with a table. The complexity is the number of states times the work per state.' },
      { q: 'When would you use BFS, DFS, Dijkstra or A*?', level: 'medium', points: [['BFS: shortest path with equal edge costs, level order', ['bfs', 'breadth', 'unweighted', 'level']], ['DFS: exhaustive exploration, cycles, topological order', ['dfs', 'depth', 'cycle', 'topolog', 'backtrack']], ['Dijkstra: non-negative weighted shortest path', ['dijkstra', 'weight']], ['A*: Dijkstra guided by a heuristic toward the goal', ['a*', 'a star', 'heuristic']]], model: 'BFS explores in layers, so it finds the shortest path when every edge has the same cost, for example moves on a grid. DFS goes deep first and suits tasks that need to explore everything: connected components, cycle detection, topological sorting and backtracking. Dijkstra finds shortest paths when edges have different non-negative weights, using a priority queue. A-star is Dijkstra plus a heuristic that estimates the remaining distance, so it expands far fewer nodes when there is a single goal; it is the standard choice in path planning for robots and vehicles.' },
      { q: 'Tell me about an algorithm you optimised and how you measured the improvement.', level: 'hard', points: [['The original bottleneck', ['bottleneck', 'slow', 'profil', 'too long']], ['How you found it: profiling or complexity analysis', ['profil', 'measure', 'complexity', 'big o', 'timing']], ['The change: better algorithm, data structure or vectorisation', ['vectoriz', 'vectoris', 'hash', 'cache', 'index', 'algorithm', 'data structure', 'c code']], ['Before and after numbers', ['from', 'reduced', 'faster', 'x faster', 'ms', 'seconds', '%']]], model: 'Use a real case with numbers. Describe the bottleneck and how you located it, with a profiler or by reasoning about complexity, not by guessing. Explain the change: replacing a nested loop with a hash lookup, vectorising with numpy, caching repeated work, or moving a hot path to C. Give the before and after, for example from 2 seconds to 40 milliseconds per frame, and say how you checked that the output stayed correct.' },
      { q: 'How do you represent a graph in code, and what are the trade-offs between an adjacency list and an adjacency matrix?', level: 'easy', points: [['Adjacency list maps each node to its neighbours', ['adjacency list', 'neighbour', 'neighbor', 'dictionary', 'list of']], ['Adjacency matrix is a two-dimensional grid of edges', ['matrix', 'grid', 'two-dimensional', '2d', 'row and column']], ['Matrix uses O(V squared) memory, good for dense graphs and constant edge lookup', ['v squared', 'v^2', 'dense', 'edge lookup', 'constant']], ['List uses O(V plus E), good for sparse graphs', ['v plus e', 'v + e', 'sparse', 'o(v+e)', 'memory']]], model: 'A graph is a set of nodes and the edges between them. The two standard representations are an adjacency list and an adjacency matrix. An adjacency list stores, for each node, the list of its neighbours, so memory is proportional to nodes plus edges and iterating over neighbours is fast. An adjacency matrix is a grid where cell i, j says whether an edge exists, so it uses memory proportional to the square of the node count but gives constant-time edge lookup. Most real graphs, like road networks or social graphs, are sparse, so I default to the list, usually a dictionary of lists. I choose a matrix for small, dense graphs or when I need matrix operations.' },
      { q: 'What is the difference between top-down memoisation and bottom-up tabulation in dynamic programming?', level: 'easy', points: [['Top-down is recursion with a cache of results', ['recursion', 'recursive', 'cache', 'memo', 'top-down', 'top down']], ['Bottom-up fills a table iteratively from base cases', ['table', 'iterative', 'loop', 'base case', 'bottom-up', 'bottom up']], ['Both avoid recomputing overlapping subproblems', ['overlap', 'recomput', 'repeated', 'same subproblem']], ['Bottom-up avoids recursion limits and can save space; top-down computes only needed states', ['recursion limit', 'stack', 'save space', 'only needed', 'rolling', 'needed states']]], model: 'Both are ways to implement dynamic programming, and both avoid solving the same subproblem twice. Top-down starts from the original problem, recurses, and stores each result in a cache, so a repeated call returns instantly. It is often the easiest to write because it follows the recurrence directly, and it only computes states that are actually needed. Bottom-up goes the other way: I fill a table iteratively from the base cases up to the answer. It avoids recursion depth limits and makes it easy to keep only the last row or two, cutting memory. I usually write the recursive version first to get the recurrence right, then convert if depth or memory becomes a problem.' },
      { q: 'What is a greedy algorithm, and how do you tell whether greedy is enough or you need dynamic programming?', level: 'easy', points: [['Greedy takes the locally best choice at each step', ['locally best', 'local', 'best choice', 'each step', 'never reconsider']], ['It works only if the greedy-choice property holds', ['greedy-choice', 'greedy choice', 'optimal substructure', 'proof', 'exchange argument']], ['Counter-example: coins like 1, 3, 4 break greedy', ['counter', 'coin', '1, 3, 4', 'fails', 'breaks']], ['DP considers all subproblem options and is safer', ['dynamic', 'all options', 'every option', 'safer', 'explore']]], model: 'A greedy algorithm builds a solution by always taking the best-looking choice right now and never going back. It is fast and simple, but it is only correct when local choices provably lead to a global optimum, which you can usually show with an exchange argument. Interval scheduling by earliest finish time and Dijkstra’s algorithm are examples. To test whether greedy is enough I try small counter-examples. Coin change with coins one, three and four and amount six shows it: greedy picks four plus two ones, three coins, while the optimum is two threes. If I find a counter-example or cannot prove the property, I use dynamic programming, which considers every option for each subproblem.' },
      { q: 'What is a topological sort, and where would you use it?', level: 'medium', points: [['Orders nodes of a directed acyclic graph so every edge goes forward', ['directed acyclic', 'dag', 'order', 'before', 'dependency']], ['Only exists if there is no cycle', ['no cycle', 'cycle', 'acyclic', 'detect']], ['Methods: Kahn’s algorithm with in-degrees, or DFS finishing order', ['kahn', 'in-degree', 'indegree', 'dfs', 'finish']], ['Uses: build systems, task schedulers, ML pipeline steps, course prerequisites', ['build', 'schedul', 'pipeline', 'prerequisite', 'airflow', 'dependenc']]], model: 'A topological sort lists the nodes of a directed acyclic graph so that every node comes before the nodes that depend on it. It only exists when there is no cycle, so a failed sort is also a way of detecting circular dependencies. The usual method is Kahn’s algorithm: compute each node’s in-degree, put the nodes with zero in-degree in a queue, repeatedly remove one, and decrease the in-degree of its neighbours. A depth-first search that records nodes in reverse finishing order also works. I use it for task schedulers, build systems, course prerequisites, and ordering the steps of an ML pipeline so each step runs after the inputs it needs.' },
      { q: 'Walk me through solving the edit distance problem with dynamic programming.', level: 'medium', points: [['State: dp[i][j] is the cost to convert the first i characters to the first j', ['dp[i][j]', 'prefix', 'first i', 'state', 'subproblem']], ['Base cases: converting to or from an empty string costs its length', ['base case', 'empty', 'length']], ['Transition: match costs nothing, otherwise min of insert, delete, replace plus one', ['insert', 'delete', 'replace', 'substitut', 'minimum', 'min of']], ['Complexity O(m times n), reducible to one row for memory', ['m times n', 'm*n', 'o(mn)', 'one row', 'two rows', 'space']]], model: 'Edit distance is the minimum number of insertions, deletions and replacements to turn one string into another. I define dp i, j as the cost to turn the first i characters of the first string into the first j characters of the second. The base cases are that turning a prefix into an empty string costs its length, and the reverse. For the transition, if the current characters match, the cost is the same as dp i minus one, j minus one. Otherwise it is one plus the minimum of the three neighbours, which stand for delete, insert and replace. The answer is the bottom-right cell. Time and space are the product of the lengths, and I can keep only two rows to cut memory.' },
      { q: 'How would you compute shortest routes on a road network with tens of millions of nodes in real time?', level: 'hard', points: [['Plain Dijkstra is too slow at that scale', ['too slow', 'dijkstra', 'explore', 'whole graph', 'scale']], ['A* uses a heuristic to guide the search toward the target', ['a*', 'a star', 'heuristic', 'guide', 'straight-line']], ['Bidirectional search or preprocessing like contraction hierarchies or landmarks', ['bidirectional', 'contraction', 'landmark', 'preprocess', 'hierarch']], ['Handle live traffic by reweighting edges and caching common routes', ['traffic', 'weight', 'cach', 'update', 'live']]], model: 'Plain Dijkstra explores outward in every direction, which is far too much work on a huge map. First I would use A star with an admissible heuristic such as straight-line distance, so the search leans toward the destination. Next, bidirectional search runs from both ends and meets in the middle, cutting the explored area sharply. For real-time services the big wins come from preprocessing: contraction hierarchies or landmark-based bounds precompute shortcuts, so queries touch only a few thousand nodes. Live traffic changes edge weights, so I either update weights in the preprocessed structure or fall back to a lighter method for recent changes. I would also cache common routes and partition the map by region.' },
      { q: 'Your dynamic programming solution is correct but uses too much memory and time on large inputs. What do you do?', level: 'hard', points: [['Check the state space size and remove redundant dimensions', ['state', 'dimension', 'redundant', 'size of the table', 'states']], ['Keep only the rows the recurrence needs, a rolling array', ['rolling', 'previous row', 'one row', 'two rows', 'last row']], ['Use a better recurrence, prune unreachable states, or use a hash map for sparse states', ['prune', 'sparse', 'unreachable', 'hash map', 'recurrence', 'better']], ['Consider a different algorithm: greedy, binary search or approximation', ['greedy', 'binary search', 'approximat', 'different algorithm', 'heuristic']], ['Profile and test against the original', ['profile', 'test', 'compare', 'brute force', 'verify']]], model: 'First I count the states and the work per state, since the cost is their product. Then I look for waste. If each row of the table depends only on the previous one, I keep a rolling pair of rows and cut memory from the full table to one dimension. If many states are unreachable, I switch from a dense table to a memoised dictionary that stores only visited states. I check whether a dimension is redundant or the recurrence can be reformulated to do less work per state. If the problem has more structure, a greedy approach, binary search on the answer or an approximation might replace DP entirely. Throughout, I compare against the original solution on small random inputs to make sure the optimisation did not change the answers.' }
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
      { q: 'Explain the difference between an inner join, a left join and a full outer join.', level: 'easy', points: [['Inner join keeps only matching rows', ['only match', 'both tables', 'intersection']], ['Left join keeps all rows from the left table', ['all rows from the left', 'all of the left', 'left table', 'everything from the left']], ['Unmatched columns become NULL', ['null']], ['Full outer keeps unmatched rows from both sides', ['both sides', 'both tables', 'either']]], model: 'An inner join returns only rows that match in both tables. A left join returns every row from the left table and fills the right-hand columns with NULL where there is no match, which is useful for finding missing records. A full outer join keeps unmatched rows from both sides. I choose based on which side I cannot afford to lose rows from.' },
      { q: 'What are window functions, and give an example where you would use one.', level: 'medium', points: [['Compute across related rows without collapsing them', ['without collapsing', 'keep', 'each row', 'not group', "doesn't group", 'without group']], ['OVER with PARTITION BY and ORDER BY', ['over', 'partition']], ['Examples: ranking, running total, previous row', ['rank', 'running', 'lag', 'lead', 'row_number', 'row number', 'moving average']]], model: 'A window function computes a value over a set of rows related to the current row, defined with OVER, PARTITION BY and ORDER BY, without collapsing rows the way GROUP BY does. I use ROW_NUMBER or DENSE_RANK to pick the top item per group, SUM OVER for running totals, and LAG to compare a row with the previous one, for example day-over-day change in active users.' },
      { q: 'A query that powers a dashboard has become slow. How do you investigate?', level: 'hard', points: [['Read the execution plan', ['explain', 'execution plan', 'query plan']], ['Check indexes on filter and join columns', ['index']], ['Reduce data early: filter, select fewer columns', ['filter', 'select *', 'fewer columns', 'partition']], ['Pre-aggregate or cache', ['materiali', 'pre-aggregat', 'cache', 'summary table']]], model: 'I start with EXPLAIN to see whether it is doing full scans or an expensive join. I check that filter and join columns are indexed, or partitioned in a warehouse, and that statistics are fresh. Then I reduce the work: filter early, select only needed columns, avoid functions on indexed columns. If it is still heavy and the data changes slowly, I pre-aggregate into a materialised view or summary table that the dashboard reads.' },
      { q: 'What are a primary key and a foreign key, and why do they matter?', level: 'easy', points: [['Primary key uniquely identifies each row and cannot be null', ['unique', 'identif', 'not null', 'cannot be null', 'primary']], ['Foreign key references the primary key of another table', ['foreign', 'reference', 'another table', 'link', 'point']], ['Enforces integrity so no orphan rows', ['integrity', 'orphan', 'constraint', 'consistent', 'valid']], ['Primary keys are indexed, which makes joins and lookups fast', ['index', 'join', 'lookup', 'fast']]], model: 'A primary key is a column, or a set of columns, that uniquely identifies each row in a table. It must be unique and can never be null. A foreign key is a column that references the primary key of another table, for example an orders table holding a customer id. Together they model relationships and let the database enforce integrity, so you cannot insert an order for a customer who does not exist, and you cannot delete a customer who still has orders unless you cascade. Primary keys are indexed automatically, so lookups and joins on them are fast. For analytics, I always check the grain of a table, meaning what one row represents, before I join it.' },
      { q: 'How does GROUP BY work with aggregate functions, and how are NULLs treated?', level: 'easy', points: [['GROUP BY collapses rows with the same key into one row per group', ['one row per group', 'collapse', 'group', 'same value', 'distinct combination']], ['Aggregates like COUNT, SUM, AVG, MIN, MAX run per group', ['count', 'sum', 'avg', 'min', 'max', 'aggregate']], ['Selected columns must be grouped or aggregated', ['must be', 'non-aggregated', 'every column', 'selected column', 'either']], ['Aggregates ignore NULLs except COUNT(*); NULL values form their own group', ['ignore null', 'null', 'count(*)', 'own group', 'skip']]], model: 'GROUP BY collapses all rows that share the same value in the grouping columns into a single output row, and aggregate functions such as count, sum, average, min and max are computed separately for each group. Every column in the select list must either be in the group by clause or be wrapped in an aggregate, otherwise the query does not make sense. NULLs need care: aggregate functions like sum, average and count of a column skip NULL values, while count star counts every row. Rows where the grouping column is NULL form a group of their own. If I want a filter on the aggregated result, such as groups with more than ten orders, I use HAVING rather than WHERE.' },
      { q: 'What is the difference between a CTE, a subquery and a temporary table, and when do you use each?', level: 'medium', points: [['Subquery is a query nested inside another, good for simple one-off filters', ['subquery', 'nested', 'inline', 'one-off', 'simple']], ['CTE names a step with WITH, improves readability and allows recursion', ['cte', 'with', 'readab', 'recursive', 'name']], ['Temp table materialises results, useful for reuse and indexing', ['temp', 'materialis', 'materializ', 'reuse', 'index', 'stored']], ['Performance depends on the engine; check the plan', ['plan', 'explain', 'engine', 'optimi', 'performance']]], model: 'A subquery is a query inside another query, perfect for a simple one-off filter or scalar value. A common table expression, written with WITH, gives a name to an intermediate step, so a long query reads top to bottom as a series of steps, and it also supports recursion. A temporary table physically stores the intermediate result, so it can be reused many times in one session and even indexed, which helps when a heavy step feeds several later queries. Readability is the main difference between the first two, because many engines treat them similarly. I default to CTEs for clarity, use a temp table when I reuse an expensive result, and look at the execution plan when performance matters.' },
      { q: 'How do you find and remove duplicate rows in a table?', level: 'medium', points: [['Find duplicates with GROUP BY and HAVING COUNT greater than one', ['group by', 'having', 'count', 'greater than 1', '> 1']], ['Decide what counts as a duplicate: which columns define identity', ['define', 'identity', 'which columns', 'key', 'same']], ['Keep one row with ROW_NUMBER partitioned by those columns', ['row_number', 'row number', 'partition', 'window']], ['Delete rows with number above one; use a unique constraint to prevent it', ['delete', 'rn > 1', 'unique constraint', 'prevent', 'distinct']]], model: 'First I decide what makes two rows duplicates, which columns define identity. To find them, I group by those columns and keep the groups having a count above one. To remove them, I use a window function: row_number partitioned by the identity columns and ordered by something sensible, such as the latest updated time. Row number one is the one I keep, and I delete or filter out the rest. For a one-off analysis, select distinct or a row-number filter in a CTE is enough. For a permanent fix, I add a unique constraint or fix the upstream job, because otherwise the duplicates return. I always count rows before and after to confirm only the intended rows disappeared.' },
      { q: 'How would you get the top three products by revenue in each category?', level: 'medium', points: [['Aggregate revenue per product first', ['aggregate', 'sum', 'group by', 'revenue per product']], ['Rank within each category using a window function with PARTITION BY', ['partition by', 'window', 'rank', 'row_number', 'dense_rank']], ['Filter rank less than or equal to three in an outer query or CTE', ['outer query', 'cte', 'filter', '<= 3', 'subquery', 'wrap']], ['Choose RANK, DENSE_RANK or ROW_NUMBER based on how ties should behave', ['tie', 'rank', 'dense', 'row_number', 'same revenue']]], model: 'I do it in two steps. First I aggregate revenue per product within a category, using group by. Then I rank the products inside each category with a window function: rank or row_number over a partition by category, ordered by revenue descending. A window function cannot be filtered in the same select, so I wrap the ranked result in a CTE or subquery and keep rows where the rank is three or less. The choice of ranking function matters for ties. Row number always returns exactly three, breaking ties arbitrarily. Rank can return more than three if there are ties and leaves gaps, while dense rank returns all tied products without gaps. I choose according to what the business wants.' },
      { q: 'How does a database index work, and when can an index hurt?', level: 'hard', points: [['Index is a sorted structure, usually a B-tree, that lets the engine find rows without scanning', ['b-tree', 'btree', 'sorted', 'tree', 'scan']], ['Speeds up filters, joins and ordering on the indexed columns', ['filter', 'join', 'order by', 'where', 'lookup']], ['Composite index order matters: leftmost prefix', ['composite', 'leftmost', 'prefix', 'order of columns', 'multi-column']], ['Costs: slower writes and more storage', ['write', 'insert', 'update', 'storage', 'space', 'maintain']], ['Not used when functions wrap the column or selectivity is low', ['function', 'low selectivity', 'selectivity', 'wildcard', 'cast', 'not used', 'low cardinality']]], model: 'An index is a separate, sorted structure, typically a B-tree, that maps column values to row locations. With it the engine can jump to matching rows instead of scanning the whole table, which speeds up filters, joins and sorts on those columns. For a composite index the column order matters, because it can be used for the leftmost prefix of the columns. Indexes cost something, though. Every insert, update and delete must maintain them, so too many slow down writes, and they take storage. They also may not help: a function wrapped around the column, a leading wildcard, or a low-selectivity column like a yes-no flag can make the engine ignore the index. I check the query plan before and after.' },
      { q: 'How would you compute 7-day retention from an events table, and how do you avoid double counting?', level: 'hard', points: [['Define the cohort: users by first activity date', ['cohort', 'first', 'signup', 'sign-up', 'first activity', 'first event']], ['Join to later activity where the activity date is exactly day seven or within the window', ['day 7', 'day seven', '7 days', 'date diff', 'interval', 'within']], ['Count distinct users, not events', ['distinct', 'unique user', 'not events', 'count distinct']], ['Divide retained users by cohort size, using a left join to keep non-returners', ['left join', 'divide', 'ratio', 'cohort size', 'denominator', 'non-returning']], ['Watch time zones, incomplete cohorts and fan-out from joins', ['time zone', 'timezone', 'incomplete', 'fan-out', 'fan out', 'duplicate', 'mature']]], model: 'First I define the cohort: each user’s first activity date, taken as the minimum event date per user. Then I join the cohort back to the events table on user id and keep activity that happened exactly seven days after the first date, or within days one to seven, depending on the retention definition. The key to avoiding double counting is to count distinct users rather than events, because one user can have many events and the join fans out. I use a left join from the cohort so that users who never returned still appear in the denominator. Retention is retained users divided by cohort size. I also exclude cohorts that are not seven days old yet, and fix the time zone so day boundaries are consistent.' }
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
      { q: 'How would you design and analyse an A/B test for a new recommendation model?', level: 'hard', points: [['Define a primary metric and hypothesis', ['metric', 'hypothesis']], ['Randomise users into control and treatment', ['random', 'control']], ['Compute sample size or power up front', ['sample size', 'power']], ['Use a significance test and confidence interval', ['p-value', 'p value', 'significan', 'confidence interval']], ['Watch for pitfalls: peeking, novelty, guardrail metrics', ['peek', 'novelty', 'guardrail', 'multiple']]], model: 'I would pick one primary metric, such as click-through or conversion, plus guardrail metrics like latency and revenue. I would randomise at user level into control and treatment, and calculate the sample size needed for the smallest effect worth shipping at 80% power. I run the test for the planned duration, covering at least one full week, without stopping early on a peek. Then I compare with a two-proportion or t-test, report the confidence interval and not only the p-value, and check for novelty effects and segment differences before deciding.' },
      { q: 'Explain a p-value and a confidence interval to a non-technical product manager.', level: 'medium', points: [['P-value: how surprising the data is if there were no real effect', ['no effect', 'no real', 'by chance', 'null', 'no difference']], ['It is not the probability the hypothesis is true', ['not the probability', "doesn't mean", 'does not mean']], ['Confidence interval: a range of plausible values for the true effect', ['range', 'plausible', 'interval']], ['Width reflects uncertainty and sample size', ['uncertain', 'sample size', 'narrow', 'wide']]], model: 'The p-value answers: if the change really did nothing, how often would we see a difference this big just by luck? A small value means luck is an unlikely explanation. It does not tell us the chance that the change works. The confidence interval is more useful for decisions: it is the range in which the true lift plausibly sits, for example between 0.5 and 3 percent. A wide range means we need more data.' },
      { q: 'What is the difference between correlation and causation, and how do you establish causation?', level: 'medium', points: [['Correlation is association only', ['associat', 'move together', 'related']], ['Confounders can explain it', ['confound', 'third variable', 'hidden']], ['Randomised experiments establish causation', ['random', 'experiment', 'a/b']], ['Otherwise use causal inference methods', ['causal inference', 'instrument', 'difference in difference', 'matching', 'natural experiment']]], model: 'Correlation means two things move together; causation means changing one changes the other. A correlation can come from a confounder that drives both, from reverse causality, or from chance. The clean way to establish causation is a randomised experiment, because randomisation balances confounders. When I cannot experiment, I use causal inference methods such as difference-in-differences, matching or instrumental variables, and I state the assumptions they depend on.' },
      { q: 'What is the difference between the mean, median and mode, and when would you use each?', level: 'easy', points: [['Mean is the average; the median is the middle value; the mode is the most frequent', ['average', 'middle', 'most frequent', 'most common', 'sum divided']], ['Mean is sensitive to outliers; median is robust', ['outlier', 'robust', 'skew', 'sensitive', 'extreme']], ['Use median for skewed data such as income or latency', ['skew', 'income', 'latency', 'house price', 'salary', 'response time']], ['Mode suits categorical data', ['categor', 'mode', 'label', 'class']]], model: 'The mean is the sum divided by the count, the median is the middle value once sorted, and the mode is the most frequent value. The mean uses every value, so it is pulled by outliers. The median ignores how extreme the extremes are, so it is robust. For skewed data like incomes, house prices or response times, I report the median, because a few huge values make the mean unrepresentative. For roughly symmetric data they are close and the mean is fine, and it is easier to use in further calculations. The mode is useful for categorical data, like the most common product category, or for spotting multi-modal distributions. I usually look at both mean and median, because a big gap tells me the data is skewed.' },
      { q: 'What is the normal distribution, and what does the 68-95-99.7 rule say?', level: 'easy', points: [['Symmetric bell-shaped distribution defined by mean and standard deviation', ['bell', 'symmetric', 'mean', 'standard deviation']], ['About 68 percent within one standard deviation', ['68', 'one standard deviation', '1 standard deviation', 'one sigma']], ['About 95 percent within two and 99.7 within three', ['95', '99.7', 'two standard', 'three standard', '2 and 3']], ['Used for z-scores, outlier flags and the central limit theorem', ['z-score', 'z score', 'outlier', 'central limit', 'standardis', 'standardiz']]], model: 'The normal distribution is the symmetric bell-shaped curve fully described by its mean and its standard deviation. The rule of thumb is that about 68 percent of values fall within one standard deviation of the mean, about 95 percent within two, and about 99.7 percent within three. That makes it easy to judge how unusual a value is. A z-score tells me how many standard deviations a value sits from the mean, and anything beyond three is rare enough to flag as a possible outlier. The normal also matters because of the central limit theorem: averages of many independent observations tend to be roughly normal even when the underlying data is not, which is why many tests and confidence intervals work.' },
      { q: 'What is the difference between a population and a sample, and why does sample size matter?', level: 'easy', points: [['Population is everyone of interest; sample is the subset we measure', ['population', 'sample', 'subset', 'everyone', 'all']], ['We use sample statistics to estimate population parameters', ['estimate', 'parameter', 'statistic', 'infer', 'generali']], ['Larger samples reduce the standard error', ['standard error', 'larger', 'precision', 'narrower', 'variance', 'more data']], ['Sample must be representative; size does not fix bias', ['represent', 'random', 'bias', 'selection', 'biased']]], model: 'The population is the whole group I care about, for example all customers. A sample is the subset I actually measure. I use sample statistics, like the sample mean, to estimate population parameters, and the uncertainty in that estimate is captured by the standard error. A bigger sample shrinks the standard error, so estimates get more precise, roughly in proportion to one over the square root of the sample size. So to halve the error, I need four times the data. But size is not everything. If the sample is not representative, for example only the users who answered a survey, then even a huge sample gives a confident wrong answer. Random sampling matters at least as much as sample size.' },
      { q: 'Explain Bayes’ theorem in plain words, with an example.', level: 'medium', points: [['Updates a prior belief with new evidence to give a posterior', ['prior', 'posterior', 'update', 'evidence', 'belief']], ['Formula: P(A given B) equals P(B given A) times P(A) divided by P(B)', ['p(a|b)', 'times', 'divided', 'likelihood', 'formula']], ['Example: a rare disease and a positive test, where most positives are false', ['disease', 'test', 'positive', 'false positive', 'medical', 'spam']], ['Base rate matters; ignoring it is the base-rate fallacy', ['base rate', 'base-rate', 'prevalence', 'rare', 'fallacy']]], model: 'Bayes’ theorem tells me how to update a belief when I see new evidence. The posterior probability equals the likelihood of the evidence given the hypothesis, times the prior, divided by the overall probability of the evidence. A good example is a medical test. Suppose one percent of people have a disease, and the test catches ninety percent of cases but also gives a nine percent false positive rate. Out of a thousand people, nine of the ten sick people test positive, and about eighty-nine of the healthy ones do too, so only around nine percent of positives are truly sick. The lesson is that the base rate matters. Ignoring it is the base-rate fallacy, and the same logic underlies spam filters and naive Bayes.' },
      { q: 'How do you decide how many users you need for an A/B test?', level: 'medium', points: [['Choose the minimum detectable effect that matters to the business', ['minimum detectable', 'mde', 'effect size', 'smallest effect', 'meaningful']], ['Set significance level and power, typically 5 percent and 80 percent', ['significance', 'alpha', 'power', '0.05', '80']], ['Estimate baseline rate and variance from historical data', ['baseline', 'variance', 'historical', 'standard deviation', 'rate']], ['Smaller effects and noisier metrics need far more samples; plan duration to cover weekly cycles', ['smaller', 'noisier', 'more samples', 'weekly', 'duration', 'cycle', 'week']]], model: 'I start with the business question: what is the smallest change worth detecting, called the minimum detectable effect. Then I set the false positive rate, usually five percent, and the power, usually eighty percent, which is the chance of catching a real effect of that size. I estimate the baseline metric and its variance from historical data. A power calculation from those four ingredients gives the sample size per group. The key intuition is that sample size scales with the inverse square of the effect, so detecting an effect half as big needs four times the users. Noisy metrics also need more. I then convert that to a duration, making sure the test runs at least one or two full weeks to cover weekday patterns.' },
      { q: 'Your A/B test shows a significant lift in the primary metric, but a guardrail metric dropped. What do you do?', level: 'hard', points: [['Check test validity first: sample ratio mismatch, instrumentation, novelty effects', ['sample ratio', 'srm', 'instrument', 'novelty', 'validity', 'bug', 'logging']], ['Check whether the guardrail drop is statistically real and not multiple-testing noise', ['multiple', 'significan', 'noise', 'confidence interval', 'false positive', 'correction']], ['Segment to understand who is affected and why', ['segment', 'subgroup', 'cohort', 'who', 'break down']], ['Weigh trade-off using business value of each metric; do not ship on the primary metric alone', ['trade-off', 'tradeoff', 'business', 'value', 'weigh', 'decision', 'cost']], ['Follow up with a variant or longer run', ['follow-up', 'iterate', 'variant', 'longer', 'rerun', 'holdout']]], model: 'First I check the experiment is trustworthy: the split matches the design with no sample ratio mismatch, logging is correct, and the effect is not a short-lived novelty. Next I ask whether the guardrail movement is real. With many metrics, some will look significant by chance, so I look at the confidence interval and the size of the drop, and whether I have corrected for multiple comparisons. Then I segment, to see whether a particular group or platform drives either change. Finally I weigh the trade-off with the product owner: how much is the lift worth against the guardrail cost, for example latency or complaints? If the drop is real and material I do not ship as is. I iterate on the variant, or run a longer test or a holdout.' },
      { q: 'What goes wrong with an A/B test when users influence each other, as in a marketplace or social network, and how do you handle it?', level: 'hard', points: [['Interference violates the assumption that one unit’s treatment does not affect another', ['interference', 'spillover', 'spill over', 'independence', 'sutva', 'affect each other', 'network effect']], ['Naive test biases the estimate, often overstating or understating effect', ['bias', 'overstat', 'understat', 'wrong', 'contaminat']], ['Randomise at cluster level, such as region, community or time slice', ['cluster', 'region', 'geo', 'community', 'switchback', 'time slice', 'time-based']], ['Trade-off: fewer independent units, so lower power', ['power', 'fewer', 'variance', 'sample', 'wider']]], model: 'A standard test assumes each user’s outcome depends only on their own assignment. In a marketplace or social network that breaks. If treated riders get more drivers, control riders get fewer, so the measured difference exaggerates the true effect, and a feature that spreads between friends contaminates the control group. To handle it, I randomise at a coarser level so that the interference stays inside a unit: whole cities or regions, friend clusters, or time blocks in a switchback design where the same market alternates between treatment and control. The cost is statistical power, because I have far fewer independent units, so I need longer runs and wider confidence intervals. I would also monitor for spillover with a known network-based diagnostic.' }
    ]
  }
];
