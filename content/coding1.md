=== pat-arrays ===
# When to use it

Reach for hashing when a problem asks "have I seen this?", "how many of these match?" or "group these by a property". Reach for **prefix sums** when you need many range totals, or the number of subarrays with a given sum.

A dict or set turns a search (O(n)) into a lookup (O(1) on average), so a nested loop of O(n²) becomes one pass.

# Template: one pass with a map

```python
seen = {}
for i, x in enumerate(nums):
    if target - x in seen:        # check first
        return [seen[target - x], i]
    seen[x] = i                    # then store
```

# Template: prefix sums and counts

```python
seen = {0: 1}          # the empty prefix
running = total = 0
for x in nums:
    running += x
    total += seen.get(running - k, 0)
    seen[running] = seen.get(running, 0) + 1
```

# Complexity

| Technique | Time | Extra space |
| --- | --- | --- |
| Set or dict one-pass | O(n) | O(n) |
| Prefix sums, then range query | O(n) build, O(1) per query | O(n) |
| Group by sorted key | O(n · L log L) for words of length L | O(n · L) |

Dict lookups are O(1) on average and O(n) in the worst case when many keys collide.

# Classic problem types

- Two-sum and pair counting
- Duplicates and first unique element
- Subarray sum equals k, longest balanced subarray (map 0 to -1)
- Group anagrams (key: sorted letters or a count tuple)
- Longest consecutive run (start only where x - 1 is missing)

# Common bugs

- Inserting into the map before checking, so an item pairs with itself.
- Forgetting the `{0: 1}` seed, which loses subarrays starting at index 0.
- Using a list as a dict key: use a tuple.
- Storing the last index instead of the first when you want the longest span.
- Using a sliding window for sums when negatives are allowed.

=== pat-pointers ===
# When to use it

- **Two pointers from both ends:** sorted data, pair or triple sums, palindromes, merging, partitioning.
- **Slow and fast pointers:** removing duplicates in place, cycle detection.
- **Sliding window:** the longest, shortest or counted **contiguous** subarray or substring under a rule, such as "at most k distinct" or "sum at least s".

# Template: two pointers on sorted data

```python
lo, hi = 0, len(a) - 1
while lo < hi:
    s = a[lo] + a[hi]
    if s == target: return [lo, hi]
    if s < target: lo += 1
    else: hi -= 1
```

# Template: variable sliding window

```python
left = 0
for right, x in enumerate(items):
    add(x)                       # grow
    while window_is_invalid():   # shrink
        remove(items[left])
        left += 1
    best = max(best, right - left + 1)
```

For a fixed window of size k, add the new item and remove `items[right - k]`.

# Complexity

Each pointer only moves forward, so the total is O(n) even with a `while` inside a `for`. Three-sum is O(n²): sort, then one two-pointer sweep per first value. Extra space is O(1), or O(k) for a counts map.

# Classic problem types

- Pair sum, three-sum, container with most water
- Palindrome check, in-place dedupe, merge two sorted lists
- Longest substring without repeats, at most k distinct
- Minimum window containing a pattern
- Subarrays with exactly k distinct: `atMost(k) - atMost(k - 1)`

# Common bugs

- Using `if` instead of `while` when shrinking.
- Applying a window to sums with negative numbers, which breaks the monotonic rule.
- Not skipping duplicate values in three-sum, so triples repeat.
- Moving the wrong pointer, or `lo <= hi` instead of `lo < hi`.
- Updating the best length before the window is valid again.

=== pat-stacks ===
# When to use it

- **Stack (last in, first out):** nested or matching structures (brackets, expressions, decoding), undo, depth-first search.
- **Queue (first in, first out):** breadth-first search, scheduling, processing in arrival order.
- **Monotonic stack:** "next greater or smaller element", spans, histograms.
- **Monotonic deque:** the maximum or minimum of every sliding window.

# Template: monotonic stack (next greater)

```python
out = [0] * len(a)
stack = []                          # indexes still waiting
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:
        j = stack.pop()
        out[j] = i - j              # answer for j found
    stack.append(i)
```

# Template: monotonic deque (window maximum)

```python
from collections import deque
dq = deque()                        # indexes, values decreasing
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x:
        dq.pop()
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()                # left the window
    if i >= k - 1:
        result.append(a[dq[0]])
```

# Complexity

Each item is pushed once and popped at most once, so the loops are O(n) in total. Extra space is O(n). A two-stack queue has O(1) amortised operations. In Python use `deque.popleft()`: `list.pop(0)` is O(n).

# Classic problem types

- Valid brackets, evaluate postfix, decode strings, simplify paths
- Next greater element, daily temperatures, stock span
- Largest rectangle in a histogram, trapping rain water
- Sliding window maximum
- Queue from two stacks, min-stack

# Common bugs

- Popping with `<=` when the problem asks for strictly greater (or the reverse).
- Storing values when you need indexes, so distances and expiry are lost.
- Forgetting to flush the stack at the end (use a sentinel).
- Popping an empty stack: check `stack` first.
- Reading multi-digit numbers one digit at a time.

=== pat-search ===
# When to use it

- The data is **sorted**: find a value, its first or last position, or where it would be inserted.
- The data is sorted then **rotated**, or **mountain-shaped**.
- The question is "the smallest (or largest) value that satisfies a condition" and the condition is **monotonic**: false, false, true, true. This is **binary search on the answer**: shipping capacity, eating speed, split array, k-th smallest distance.

# Template: lower bound (first index that satisfies)

```python
lo, hi = 0, len(a)            # answer is in [lo, hi]
while lo < hi:
    mid = (lo + hi) // 2
    if a[mid] < target:       # too small: discard the left half
        lo = mid + 1
    else:
        hi = mid
return lo
```

# Template: binary search on the answer

```python
lo, hi = smallest_possible, largest_possible
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid):
        hi = mid              # mid works, try smaller
    else:
        lo = mid + 1
return lo
```

# Complexity

O(log n) for a search in an array. For binary search on the answer: O(cost of one check × log(range)), for example O(n log(sum)). Extra space is O(1).

# Classic problem types

- Search insert position, first and last occurrence
- Rotated sorted array, find the minimum
- Integer square root, peak element
- Ship packages in D days, split array largest sum, Koko eating bananas
- K-th smallest pair distance (binary search plus two pointers)

# Common bugs

- Setting `lo = mid` when mid is rounded down: infinite loop. Use `lo = mid + 1`.
- Mixing inclusive (`hi = len - 1`) and exclusive (`hi = len`) bounds in one loop.
- Using binary search when the condition is not monotonic.
- Forgetting empty input and one-element lists.
- Wrong search bounds, such as a minimum capacity below the largest item.
- Walking left or right one step at a time after finding a match, which is O(n).

=== pat-intervals ===
# When to use it

- The input is a set of **intervals, meetings, jobs or ranges**: merge, insert, count overlaps, find free time.
- You must choose items to maximise or minimise something and a **local rule** seems to work: earliest end, smallest sufficient item, farthest reach. That is a **greedy** algorithm.
- Sorting first turns a tangled problem into one ordered pass.

# Template: merge intervals

```python
out = []
for start, end in sorted(intervals):
    if out and start <= out[-1][1]:          # overlaps the last one
        out[-1][1] = max(out[-1][1], end)
    else:
        out.append([start, end])
```

# Template: keep the most non-overlapping intervals

```python
kept, last_end = 0, None
for start, end in sorted(intervals, key=lambda iv: iv[1]):
    if last_end is None or start >= last_end:
        kept += 1
        last_end = end
removed = len(intervals) - kept
```

# Template: minimum rooms (sweep)

```python
starts = sorted(s for s, e in meetings)
ends = sorted(e for s, e in meetings)
rooms = j = 0
for s in starts:
    if s < ends[j]: rooms += 1      # no room is free yet
    else: j += 1                    # reuse a freed room
```

# Complexity

Sorting costs O(n log n) and the sweep is O(n), so the total is O(n log n). Extra space is O(1) to O(n). Jump-game style greedy over a bucketed array is O(n).

# Classic problem types

- Merge or insert intervals, can attend all meetings
- Minimum meeting rooms, maximum overlap
- Non-overlapping intervals, minimum arrows to burst balloons
- Assign cookies, task scheduling, jump game, minimum taps to water a garden
- Meeting scheduling and free-slot search

# Common bugs

- Using `<` where touching endpoints should count (or the reverse): read the statement.
- Merging with the last end instead of `max(...)`.
- Sorting by start when the greedy needs sort by end.
- Changing the input list while sorting it.
- Using greedy without a proof: coins [1, 3, 4] and amount 6 break "largest first".

