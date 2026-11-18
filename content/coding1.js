const R = String.raw;

export default [
  {
    id: 'pat-arrays', title: 'Pattern: arrays and hashing', group: 'coding',
    uses: [
      'Fraud and deduplication systems keep a hash set of seen transaction ids so each new event is checked in constant time',
      'Analytics engines compute running totals (prefix sums) so that any date-range total is one subtraction instead of a re-scan'
    ],
    tasks: [
      {
        id: 'cb-first-unique', title: 'First unique character', level: 'easy',
        prompt: `Write \`first_unique(s)\` that returns the index of the first character of \`s\` that appears exactly once in the whole string, or \`-1\` if there is none.

- Input: a string of lowercase letters, length 0 to 100,000.
- Output: an integer index.
- Aim for O(n) time.

Example: \`first_unique("loveleetcode")\` is \`2\` (the letter \`v\`).`,
        starter: R`def first_unique(s):
    # your code here
    pass

print(first_unique("loveleetcode"))  # 2
`,
        solution: R`from collections import Counter

def first_unique(s):
    counts = Counter(s)
    for i, ch in enumerate(s):
        if counts[ch] == 1:
            return i
    return -1
`,
        tests: [
          { name: 'Example', code: R`assert first_unique("loveleetcode") == 2, 'In "loveleetcode" the first letter that occurs once is "v" at index 2'` },
          { name: 'First letter is unique', code: R`assert first_unique("abcab") == 2, 'In "abcab" only "c" occurs once, at index 2'` },
          { name: 'Nothing unique', code: R`assert first_unique("aabb") == -1, 'Every letter repeats, so return -1'` },
          { name: 'Empty string', code: R`assert first_unique("") == -1, 'An empty string has no unique character'` },
          { name: 'Single character', code: R`assert first_unique("z") == 0, 'A single character is unique at index 0'` }
        ]
      },
      {
        id: 'cb-count-pairs', title: 'Count pairs with a target sum', level: 'easy',
        prompt: `Write \`count_pairs(nums, target)\` that returns how many index pairs \`i < j\` satisfy \`nums[i] + nums[j] == target\`.

- Input: a list of integers (may include negatives and repeats), length 0 to 100,000, and an integer target.
- Output: the number of pairs.
- Aim for O(n) time.

Example: \`count_pairs([1, 1, 1], 2)\` is \`3\`, because every pair of positions works.`,
        starter: R`def count_pairs(nums, target):
    # your code here
    pass

print(count_pairs([1, 1, 1], 2))  # 3
`,
        solution: R`def count_pairs(nums, target):
    seen = {}
    total = 0
    for x in nums:
        total += seen.get(target - x, 0)
        seen[x] = seen.get(x, 0) + 1
    return total
`,
        tests: [
          { name: 'Example', code: R`assert count_pairs([1, 1, 1], 2) == 3, 'Three equal values give 3 pairs'` },
          { name: 'Mixed values', code: R`assert count_pairs([1, 5, 3, 3, 3], 6) == 4, '(1,5) once and (3,3) three times make 4'` },
          { name: 'Negatives and zeros', code: R`assert count_pairs([-1, 1, 0, 0], 0) == 2, '(-1,1) and (0,0) make 2'` },
          { name: 'Empty and single', code: R`assert count_pairs([], 5) == 0 and count_pairs([4], 8) == 0, 'Fewer than two numbers means no pairs'` },
          { name: 'All equal, even count', code: R`assert count_pairs([2, 2, 2, 2], 4) == 6, 'Four equal values give 4 choose 2 = 6 pairs'` }
        ]
      },
      {
        id: 'cb-subarray-sum-k', title: 'Subarrays with sum k', level: 'medium',
        prompt: `Write \`count_subarrays(nums, k)\` that returns the number of contiguous, non-empty subarrays whose sum equals \`k\`.

- Input: a list of integers that may be negative, length 0 to 100,000, and an integer \`k\`.
- Output: the count.
- A sliding window does not work here because of the negatives. Aim for O(n) time.

Example: \`count_subarrays([1, 2, 3], 3)\` is \`2\` (the subarrays \`[1, 2]\` and \`[3]\`).`,
        starter: R`def count_subarrays(nums, k):
    # your code here
    pass

print(count_subarrays([1, 2, 3], 3))  # 2
`,
        solution: R`def count_subarrays(nums, k):
    seen = {0: 1}
    total = 0
    running = 0
    for x in nums:
        running += x
        total += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return total
`,
        tests: [
          { name: 'Example', code: R`assert count_subarrays([1, 2, 3], 3) == 2, '[1,2] and [3] both sum to 3'` },
          { name: 'Overlapping answers', code: R`assert count_subarrays([1, 1, 1], 2) == 2, '[1,1] appears at two positions'` },
          { name: 'Negatives and zero', code: R`assert count_subarrays([1, -1, 0], 0) == 3, '[1,-1], [0] and [1,-1,0] all sum to 0'` },
          { name: 'Longer mix', code: R`assert count_subarrays([3, 4, 7, 2, -3, 1, 4, 2], 7) == 4, 'Expected 4: [3,4], [7], [7,2,-3,1] and [1,4,2]'` },
          { name: 'Empty list', code: R`assert count_subarrays([], 0) == 0, 'No elements means no non-empty subarray'` }
        ]
      },
      {
        id: 'cb-group-anagrams', title: 'Group the anagrams', level: 'medium',
        prompt: `Write \`group_anagrams(words)\` that groups words that are anagrams of each other (same letters, any order).

- Input: a list of lowercase words (an empty string is allowed), length 0 to 10,000.
- Output: a list of groups, each a list of words. Order the groups by the first appearance of any of their words, and keep the words inside a group in their original order.

Example: \`group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])\` is \`[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]\`.`,
        starter: R`def group_anagrams(words):
    # your code here
    pass

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
`,
        solution: R`def group_anagrams(words):
    groups = {}
    for w in words:
        key = "".join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())
`,
        tests: [
          { name: 'Example', code: R`assert group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]) == [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]], 'Groups must follow first appearance, words keep their order'` },
          { name: 'Different lengths', code: R`assert group_anagrams(["ab", "ba", "abc", "cab", "bca"]) == [["ab", "ba"], ["abc", "cab", "bca"]], 'Words of different lengths are never anagrams'` },
          { name: 'Empty string', code: R`assert group_anagrams([""]) == [[""]], 'An empty string forms its own group'` },
          { name: 'Empty list', code: R`assert group_anagrams([]) == [], 'No words means no groups'` },
          { name: 'Repeated word', code: R`assert group_anagrams(["a", "b", "a"]) == [["a", "a"], ["b"]], 'Identical words belong to the same group'` }
        ]
      },
      {
        id: 'cb-longest-consecutive', title: 'Longest consecutive run', level: 'hard',
        prompt: `Write \`longest_run(nums)\` that returns the length of the longest set of values that form consecutive integers (such as 4, 5, 6, 7), no matter where they sit in the list.

- Input: an unsorted list of integers with possible repeats, length 0 to 100,000.
- Output: the length of the longest run of consecutive values.
- Aim for O(n) time. A hidden test uses 100,000 numbers, so scanning upwards from every number will time out.

Example: \`longest_run([100, 4, 200, 1, 3, 2])\` is \`4\` (the values 1, 2, 3, 4).`,
        starter: R`def longest_run(nums):
    # your code here
    pass

print(longest_run([100, 4, 200, 1, 3, 2]))  # 4
`,
        solution: R`def longest_run(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 not in values:
            end = x
            while end + 1 in values:
                end += 1
            best = max(best, end - x + 1)
    return best
`,
        tests: [
          { name: 'Example', code: R`assert longest_run([100, 4, 200, 1, 3, 2]) == 4, 'The values 1, 2, 3, 4 form a run of length 4'` },
          { name: 'Duplicates and negatives', code: R`assert longest_run([9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]) == 7, 'The values 3 to 9 form a run of length 7'` },
          { name: 'Repeats do not extend a run', code: R`assert longest_run([1, 2, 0, 1]) == 3, 'The values 0, 1, 2 give 3; the repeated 1 must not count twice'` },
          { name: 'Empty and single', code: R`assert longest_run([]) == 0 and longest_run([5]) == 1, 'Empty gives 0, a single value gives 1'` },
          { name: 'Large input (100,000 numbers)', code: R`import random
data = list(range(100000))
random.Random(1).shuffle(data)
assert longest_run(data) == 100000, 'Expected 100000; start counting only from numbers whose predecessor is missing, or this is O(n^2)'` }
        ]
      },
      {
        id: 'cb-longest-balanced', title: 'Longest balanced bit run', level: 'hard',
        prompt: `Write \`longest_balanced(bits)\` that returns the length of the longest contiguous subarray containing the same number of \`0\`s and \`1\`s.

- Input: a list of \`0\` and \`1\` values, length 0 to 100,000.
- Output: the length (0 if no balanced subarray exists).
- Aim for O(n) time. A hidden test uses 100,000 values, so checking every start and end will time out.

Example: \`longest_balanced([0, 1, 0])\` is \`2\`.`,
        starter: R`def longest_balanced(bits):
    # your code here
    pass

print(longest_balanced([0, 1, 0]))  # 2
`,
        solution: R`def longest_balanced(bits):
    first = {0: -1}
    balance = 0
    best = 0
    for i, b in enumerate(bits):
        balance += 1 if b == 1 else -1
        if balance in first:
            best = max(best, i - first[balance])
        else:
            first[balance] = i
    return best
`,
        tests: [
          { name: 'Example', code: R`assert longest_balanced([0, 1, 0]) == 2, '[0,1] or [1,0] is balanced, length 2'` },
          { name: 'Whole array', code: R`assert longest_balanced([0, 0, 1, 0, 0, 0, 1, 1]) == 6, 'Indexes 2 to 7 hold three 0s and three 1s, length 6'` },
          { name: 'No balanced run', code: R`assert longest_balanced([1, 1, 1]) == 0 and longest_balanced([]) == 0, 'All equal bits or no bits give 0'` },
          { name: 'Pair only', code: R`assert longest_balanced([0, 1]) == 2 and longest_balanced([1, 0, 0, 0]) == 2, 'The longest balanced run can be just two long'` },
          { name: 'Large input (100,000 bits)', code: R`assert longest_balanced([0] * 50000 + [1] * 50000) == 100000, 'The whole array is balanced; use prefix balances and a first-seen map'` }
        ]
      }
    ],
    quiz: [
      { q: 'A problem asks "have I already seen this value?" for each of n items. Which structure answers it in O(1) on average?', options: ['A sorted list', 'A set or dict', 'A stack', 'A linked list'], answer: 1, why: 'Hash tables give average constant-time membership tests.', level: 'easy' },
      { q: 'What is the average cost of one dict lookup in Python?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 2, why: 'A hash table jumps straight to the bucket for a key.', level: 'easy' },
      { q: 'With prefix sums, the sum of nums[i:j] equals…', options: ['prefix[j] - prefix[i]', 'prefix[j] + prefix[i]', 'prefix[i] - prefix[j]', 'prefix[j] * i'], answer: 0, why: 'prefix[j] holds the sum of the first j items, so subtracting the first i leaves the slice.', level: 'easy' },
      { q: 'Which clue most strongly suggests a hash map?', options: ['"The array is sorted"', '"Find a pair or count something that matches an earlier item"', '"Return the k-th largest"', '"Visit every cell of a grid"'], answer: 1, why: 'Matching against earlier items is a lookup, which a dict does in O(1).', level: 'easy' },
      { q: 'Why does a sliding window fail for "count subarrays with sum k" when numbers can be negative?', options: ['Windows cannot be moved', 'Adding an element no longer always increases the sum, so you cannot decide when to shrink', 'The answer is always zero', 'Python lists forbid negatives'], answer: 1, why: 'The window needs a monotonic sum; negatives break it, so use prefix sums and a map instead.', level: 'medium' },
      { q: 'In the prefix-sum-and-map solution, why do we start with seen = {0: 1}?', options: ['To avoid a KeyError on the first value', 'So subarrays that start at index 0 are counted', 'To store the array length', 'It is only a style choice'], answer: 1, why: 'The empty prefix has sum 0, and a subarray from the start needs it as its left edge.', level: 'medium' },
      { q: 'To group anagrams, which key is correct?', options: ['len(word)', 'The first letter', 'tuple(sorted(word))', 'The set of letters'], answer: 2, why: 'Sorted letters keep repeats; a set would wrongly merge "aab" and "abb".', level: 'medium' },
      { q: 'In one-pass two-sum you must check the map before inserting the current item. Why?', options: ['Inserting first is slower', 'Otherwise an item could pair with itself, for example 3 + 3 = 6 with a single 3', 'The map would overflow', 'Dicts cannot be changed while reading'], answer: 1, why: 'Checking first only matches earlier items, never the same position.', level: 'medium' },
      { q: 'You want to group items by their letter counts. Why can a list not be the dict key?', options: ['Lists are too long', 'Lists are mutable and unhashable; use a tuple', 'Lists cannot hold integers', 'Dict keys must be strings'], answer: 1, why: 'Only hashable (immutable) values can be keys.', level: 'hard' },
      { q: 'For "longest subarray with equal 0s and 1s", you map 0 to -1 and track prefix balances. For each balance, which index should the map keep?', options: ['The last index', 'The first index', 'The average index', 'Every index'], answer: 1, why: 'The earliest left edge gives the longest subarray when the same balance appears again.', level: 'hard' },
      { q: 'Longest consecutive run, O(n): why only start counting at numbers whose predecessor is missing?', options: ['It saves memory', 'Each run is then walked once in total, instead of once per member', 'Sorting needs it', 'It handles negatives'], answer: 1, why: 'Without the guard, a run of length m is re-walked from each element, giving O(n²) on long runs.', level: 'hard' },
      { q: 'A colleague says "dict lookups are O(1)". What is the most accurate statement?', options: ['Always O(1)', 'Average O(1), worst case O(n) if many keys collide', 'O(log n) because of the tree inside', 'O(1) only for integer keys'], answer: 1, why: 'Hash collisions can degrade a lookup, which is why interviewers say "amortised" or "average".', level: 'hard' }
    ],
    interview: [
      { q: 'Explain how you turn an O(n²) pair-search problem into O(n) with a hash map. Use two-sum as the example.', level: 'easy', points: [['Brute force checks every pair, O(n²)', ['every pair', 'o(n^2)', 'o(n²)', 'quadratic', 'nested']], ['Store what you have seen in a dict or set', ['hash', 'dict', 'map', 'set', 'seen']], ['Look up the complement target minus x in O(1)', ['complement', 'target -', 'lookup', 'look up']], ['One pass, O(n) time, O(n) extra space', ['one pass', 'o(n)', 'linear', 'space']]], model: 'The brute force checks every pair of positions, which is O(n squared). Instead I walk the list once and keep a hash map of values I have already seen. For each number x, the partner I need is target minus x, and I can look that up in constant time. If it is in the map I have my answer, otherwise I store x and move on. That gives one pass, linear time, and linear extra space, so I am trading memory for speed. I check the map before inserting, so a number never pairs with itself.' },
      { q: 'Walk me through counting subarrays whose sum equals k when the array has negative numbers.', level: 'medium', points: [['Sliding window fails with negatives', ['negative', 'sliding window', 'shrink']], ['Use prefix sums: sum of a slice is a difference of two prefixes', ['prefix', 'running sum', 'difference']], ['Map each prefix value to how often it occurred', ['map', 'dict', 'count', 'frequency']], ['Seed with prefix 0 once, then add seen[prefix - k] at each step', ['seed', 'zero', 'empty prefix', 'prefix - k', 'running - k']]], model: 'A sliding window needs the sum to grow when I add an element, and negatives break that, so I use prefix sums. A subarray ends at the current index and has sum k exactly when an earlier prefix equals the current prefix minus k. So I keep a dict from prefix value to how many times it occurred, seeded with zero once for the empty prefix. At each element I update the running sum, add the dict count for running minus k to the answer, then record the running sum. It is one pass, O(n) time and O(n) space.' },
      { q: 'You solved the problem with a hash map. The interviewer asks about complexity and trade-offs. What do you say?', level: 'medium', points: [['Time is O(n) average, with O(1) lookups', ['o(n)', 'linear', 'average', 'constant']], ['Space is O(n) for the map', ['space', 'memory', 'o(n)']], ['Worst case lookups can degrade with collisions', ['collision', 'worst case', 'degrade']], ['Alternative: sort and use two pointers, O(n log n) time but O(1) extra space', ['sort', 'two pointers', 'log n', 'o(1)']]], model: 'Time is linear on average because each lookup and insert is constant time on average. Space is also linear since the map can hold every element. In the worst case many keys collide and a lookup can degrade, though in practice that is rare. If memory is tight, I can sort the data first and use two pointers instead. That costs n log n time but needs almost no extra space. I would pick the hash map when speed matters and memory is fine, and the sorted approach when memory is the constraint or the data is already sorted.' },
      { q: 'How would you find the longest run of consecutive integers in an unsorted array in linear time? What can go wrong?', level: 'hard', points: [['Put all values in a set', ['set', 'hash']], ['Start only where x - 1 is missing', ['predecessor', 'x - 1', 'x-1', 'start of a run', 'missing']], ['Walk upwards while the next value exists', ['walk', 'upward', 'while', 'next', 'extend']], ['Each element is visited a constant number of times, so O(n)', ['o(n)', 'linear', 'once', 'amortis', 'amortiz']], ['Without the guard it degrades to O(n^2); sorting is O(n log n)', ['o(n^2)', 'o(n²)', 'quadratic', 'sort']]], model: 'I put all numbers in a set, which also removes duplicates. Then for each value x I check whether x minus one is in the set. If it is, x is in the middle of a run and I skip it. If not, x starts a run, so I walk upwards while the next number exists and track the length. Every number is touched at most twice overall, so it is O(n). The common mistake is to skip the start check: then every member of a long run walks the rest of it and the total becomes quadratic. Sorting is a simpler alternative at O(n log n).' }
    ]
  },
  {
    id: 'pat-pointers', title: 'Pattern: two pointers and sliding window', group: 'coding',
    uses: [
      'Network monitors and rate limiters slide a time window over request logs to count events in the last N seconds without re-scanning old data',
      'Stream processors compute rolling averages and moving maxima over sensor or price data with a window that adds the newest value and drops the oldest'
    ],
    tasks: [
      {
        id: 'cb-clean-palindrome', title: 'Palindrome ignoring noise', level: 'easy',
        prompt: `Write \`is_clean_palindrome(s)\` that returns \`True\` if \`s\` reads the same forwards and backwards after you ignore every character that is not a letter or digit and ignore case.

- Input: a string of length 0 to 100,000 with any characters.
- Output: a boolean.
- Use two pointers and O(1) extra space (do not build a reversed copy).

Example: \`is_clean_palindrome("A man, a plan, a canal: Panama")\` is \`True\`.`,
        starter: R`def is_clean_palindrome(s):
    # your code here
    pass

print(is_clean_palindrome("A man, a plan, a canal: Panama"))  # True
`,
        solution: R`def is_clean_palindrome(s):
    lo, hi = 0, len(s) - 1
    while lo < hi:
        while lo < hi and not s[lo].isalnum():
            lo += 1
        while lo < hi and not s[hi].isalnum():
            hi -= 1
        if s[lo].lower() != s[hi].lower():
            return False
        lo += 1
        hi -= 1
    return True
`,
        tests: [
          { name: 'Example', code: R`assert is_clean_palindrome("A man, a plan, a canal: Panama") is True, 'Ignoring spaces, punctuation and case this is a palindrome'` },
          { name: 'Not a palindrome', code: R`assert is_clean_palindrome("race a car") is False, '"raceacar" is not a palindrome'` },
          { name: 'Only noise', code: R`assert is_clean_palindrome(" .,! ") is True, 'With nothing left to compare the answer is True'` },
          { name: 'Empty and single', code: R`assert is_clean_palindrome("") is True and is_clean_palindrome("x") is True, 'Empty and one-character strings are palindromes'` },
          { name: 'Digits count', code: R`assert is_clean_palindrome("0P") is False and is_clean_palindrome("1a2 2A1") is True, 'Digits are kept: "0p" is not a palindrome, "1a22a1" is'` }
        ]
      },
      {
        id: 'cb-dedupe-sorted', title: 'Remove duplicates in place', level: 'easy',
        prompt: `Write \`dedupe(nums)\` for a list sorted in ascending order. Modify the list in place so its first \`k\` items are the distinct values in order, and return \`k\`. What sits after position \`k\` does not matter.

- Input: a sorted list of integers, length 0 to 100,000.
- Output: the integer \`k\` (the list is changed in place).
- Use two pointers, O(n) time and O(1) extra space.

Example: for \`[1, 1, 2, 3, 3]\` return \`3\` and leave \`[1, 2, 3, ...]\` at the front.`,
        starter: R`def dedupe(nums):
    # your code here
    pass

data = [1, 1, 2, 3, 3]
k = dedupe(data)
print(k, data[:k])  # 3 [1, 2, 3]
`,
        solution: R`def dedupe(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write
`,
        tests: [
          { name: 'Example', code: R`d = [1, 1, 2, 3, 3]
k = dedupe(d)
assert k == 3 and d[:k] == [1, 2, 3], 'Expected k = 3 and the first three items [1, 2, 3]'` },
          { name: 'All the same', code: R`d = [7, 7, 7, 7]
k = dedupe(d)
assert k == 1 and d[:k] == [7], 'Four equal values leave one'` },
          { name: 'Already distinct', code: R`d = [1, 2, 3]
k = dedupe(d)
assert k == 3 and d[:k] == [1, 2, 3], 'Nothing to remove'` },
          { name: 'Empty list', code: R`d = []
assert dedupe(d) == 0, 'An empty list gives 0'` },
          { name: 'Negatives', code: R`d = [-3, -3, -1, 0, 0, 0, 4]
k = dedupe(d)
assert k == 4 and d[:k] == [-3, -1, 0, 4], 'Expected [-3, -1, 0, 4]'` }
        ]
      },
      {
        id: 'cb-three-sum', title: 'Triplets that sum to zero', level: 'medium',
        prompt: `Write \`three_sum(nums)\` that returns every distinct triple of values from \`nums\` that adds up to \`0\`. Each triple uses three different positions, but two triples with the same values count once.

- Input: a list of integers, length 0 to 3,000.
- Output: a list of triples (each sorted ascending), with the list of triples also sorted ascending.
- Aim for O(n²) time.

Example: \`three_sum([-1, 0, 1, 2, -1, -4])\` is \`[[-1, -1, 2], [-1, 0, 1]]\`.`,
        starter: R`def three_sum(nums):
    # your code here
    pass

print(three_sum([-1, 0, 1, 2, -1, -4]))  # [[-1, -1, 2], [-1, 0, 1]]
`,
        solution: R`def three_sum(nums):
    nums = sorted(nums)
    out = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([nums[i], nums[lo], nums[hi]])
                lo += 1
                hi -= 1
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1
    return out
`,
        tests: [
          { name: 'Example', code: R`assert three_sum([-1, 0, 1, 2, -1, -4]) == [[-1, -1, 2], [-1, 0, 1]], 'Expected [[-1, -1, 2], [-1, 0, 1]]'` },
          { name: 'Repeated zeros', code: R`assert three_sum([0, 0, 0, 0]) == [[0, 0, 0]], 'Four zeros give one triple, not four'` },
          { name: 'No answer', code: R`assert three_sum([1, 2, 3]) == [] and three_sum([]) == [], 'Nothing sums to zero'` },
          { name: 'Pairs of equal values', code: R`assert three_sum([-2, 0, 1, 1, 2]) == [[-2, 0, 2], [-2, 1, 1]], 'Expected [[-2, 0, 2], [-2, 1, 1]]'` },
          { name: 'Many duplicates', code: R`assert three_sum([-4, -1, -1, 0, 1, 2, 2, 2, -4]) == [[-4, 2, 2], [-1, -1, 2], [-1, 0, 1]], 'Duplicates must not create repeated triples'` }
        ]
      },
      {
        id: 'cb-k-distinct', title: 'Longest window with at most k distinct', level: 'medium',
        prompt: `Write \`longest_k_distinct(s, k)\` that returns the length of the longest substring of \`s\` containing at most \`k\` different characters.

- Input: a string of length 0 to 100,000 and an integer \`k\` from 0 upwards.
- Output: the length.
- Aim for O(n) time.

Example: \`longest_k_distinct("eceba", 2)\` is \`3\` (the substring \`"ece"\`).`,
        starter: R`def longest_k_distinct(s, k):
    # your code here
    pass

print(longest_k_distinct("eceba", 2))  # 3
`,
        solution: R`def longest_k_distinct(s, k):
    counts = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        while len(counts) > k:
            counts[s[left]] -= 1
            if counts[s[left]] == 0:
                del counts[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best
`,
        tests: [
          { name: 'Example', code: R`assert longest_k_distinct("eceba", 2) == 3, '"ece" has two distinct letters and length 3'` },
          { name: 'One distinct', code: R`assert longest_k_distinct("aa", 1) == 2, 'Both letters are "a"'` },
          { name: 'k is zero', code: R`assert longest_k_distinct("abc", 0) == 0, 'No characters are allowed, so the length is 0'` },
          { name: 'Empty string', code: R`assert longest_k_distinct("", 3) == 0, 'Empty input gives 0'` },
          { name: 'Window must shrink', code: R`assert longest_k_distinct("aabbcc", 2) == 4 and longest_k_distinct("abcabcabc", 3) == 9, 'Check that the left edge moves when there are too many distinct letters'` }
        ]
      },
      {
        id: 'cb-min-window', title: 'Smallest window covering a pattern', level: 'hard',
        prompt: `Write \`min_window(s, t)\` that returns the shortest substring of \`s\` that contains every character of \`t\`, counting repeats (if \`t\` has two \`a\`s, the window needs two). If there is none, return \`""\`. If several windows tie, return the leftmost.

- Input: strings \`s\` (length up to 100,000) and \`t\` (length up to 1,000).
- Output: a string.
- Aim for O(len(s) + len(t)) time. A hidden test uses 100,000 characters, so checking every substring will time out.

Example: \`min_window("ADOBECODEBANC", "ABC")\` is \`"BANC"\`.`,
        starter: R`def min_window(s, t):
    # your code here
    pass

print(min_window("ADOBECODEBANC", "ABC"))  # BANC
`,
        solution: R`from collections import Counter

def min_window(s, t):
    if not t or len(t) > len(s):
        return ""
    need = Counter(t)
    missing = len(t)
    left = 0
    best_len = len(s) + 1
    best_start = 0
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        if missing == 0:
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_start = left
            need[s[left]] += 1
            missing += 1
            left += 1
    return "" if best_len > len(s) else s[best_start:best_start + best_len]
`,
        tests: [
          { name: 'Example', code: R`assert min_window("ADOBECODEBANC", "ABC") == "BANC", 'The shortest window with A, B and C is "BANC"'` },
          { name: 'Whole string', code: R`assert min_window("a", "a") == "a", 'One character matches itself'` },
          { name: 'Repeats in t', code: R`assert min_window("a", "aa") == "" and min_window("aabdec", "abc") == "abdec", 'Counts matter: "aa" does not fit in "a", and "abdec" is the shortest window for "abc"'` },
          { name: 'Short pattern', code: R`assert min_window("ab", "b") == "b" and min_window("xyz", "q") == "", 'Return "b", and "" when a letter never occurs'` },
          { name: 'Large input (100,000 characters)', code: R`s = "a" * 99999 + "b"
assert min_window(s, "ab") == "ab", 'Expected "ab" at the very end; use a sliding window with counts, not substring checks'` }
        ]
      },
      {
        id: 'cb-exact-k-distinct', title: 'Subarrays with exactly k distinct values', level: 'hard',
        prompt: `Write \`count_exact_k(nums, k)\` that returns how many contiguous subarrays contain exactly \`k\` different values.

- Input: a list of positive integers, length 0 to 100,000, and \`k\` of 1 or more.
- Output: the count of subarrays.
- Hint: counting "at most k" is a plain sliding window. Aim for O(n) time. A hidden test uses 100,000 values, so checking every subarray will time out.

Example: \`count_exact_k([1, 2, 1, 2, 3], 2)\` is \`7\`.`,
        starter: R`def count_exact_k(nums, k):
    # your code here
    pass

print(count_exact_k([1, 2, 1, 2, 3], 2))  # 7
`,
        solution: R`def count_exact_k(nums, k):
    def at_most(m):
        counts = {}
        left = 0
        total = 0
        for right, x in enumerate(nums):
            counts[x] = counts.get(x, 0) + 1
            while len(counts) > m:
                counts[nums[left]] -= 1
                if counts[nums[left]] == 0:
                    del counts[nums[left]]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)
`,
        tests: [
          { name: 'Example', code: R`assert count_exact_k([1, 2, 1, 2, 3], 2) == 7, 'Expected 7 subarrays with exactly 2 distinct values'` },
          { name: 'Three distinct', code: R`assert count_exact_k([1, 2, 1, 3, 4], 3) == 3, 'Expected 3: [1,2,1,3], [2,1,3] and [1,3,4]'` },
          { name: 'All equal', code: R`assert count_exact_k([1, 1], 1) == 3, 'Every subarray of [1, 1] has one distinct value'` },
          { name: 'Too few distinct or empty', code: R`assert count_exact_k([1, 2], 3) == 0 and count_exact_k([], 1) == 0, 'Not enough distinct values gives 0'` },
          { name: 'Large input (100,000 values)', code: R`nums = [1, 2] * 50000
assert count_exact_k(nums, 2) == 100000 * 99999 // 2, 'Every subarray of length 2 or more has exactly 2 distinct values: n(n-1)/2'` }
        ]
      }
    ],
    quiz: [
      { q: 'Sorted array, two pointers at the ends, and the current pair sums to more than the target. What do you do?', options: ['Move the left pointer right', 'Move the right pointer left', 'Move both outward', 'Restart with the middle'], answer: 1, why: 'Lowering the right value is the only move that can shrink a too-large sum.', level: 'easy' },
      { q: 'Which clue points to a sliding window?', options: ['"Find the k-th largest"', '"Longest or shortest contiguous subarray or substring with a condition"', '"Count all subsets"', '"Find the shortest path in a graph"'], answer: 1, why: 'Contiguous ranges that grow and shrink are exactly what a window tracks.', level: 'easy' },
      { q: 'What is the usual time complexity of a sliding window over n items?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'], answer: 0, why: 'Each of the two edges only moves forward, at most n times each.', level: 'easy' },
      { q: 'Pair-sum with two pointers from both ends normally needs the array to be…', options: ['Unique', 'Sorted', 'Of even length', 'Non-negative'], answer: 1, why: 'Sorted order is what tells you which pointer to move.', level: 'easy' },
      { q: 'A sliding window contains a for loop with a while loop inside. Why is it still O(n)?', options: ['The while loop never runs', 'The left pointer only moves forward, so across the whole run it moves at most n times', 'Python optimises loops', 'It is actually O(n²)'], answer: 1, why: 'Total work is the sum of right moves plus left moves, each bounded by n.', level: 'medium' },
      { q: 'In "longest substring without repeating characters", what do you do when the new character is already in the window?', options: ['Clear the whole window', 'Advance the left edge until the duplicate is gone', 'Skip the character', 'Stop and return'], answer: 1, why: 'Shrinking from the left restores validity while keeping the longest window ending here.', level: 'medium' },
      { q: 'Why does three-sum sort first and then use two pointers for each fixed first value?', options: ['It reaches O(n²) overall instead of O(n³)', 'It finds only one triple', 'It avoids using extra memory for the answer', 'It makes values positive'], answer: 0, why: 'Sorting costs O(n log n); each fixed value then needs a linear two-pointer sweep.', level: 'medium' },
      { q: 'In three-sum, why skip a first value equal to the previous one?', options: ['To save memory', 'To avoid reporting the same triple twice', 'Because sorted lists forbid repeats', 'To keep the pointers apart'], answer: 1, why: 'The same value would find the same pairs again and duplicate every triple.', level: 'medium' },
      { q: 'How do you count subarrays with exactly k distinct values using a sliding window?', options: ['One window that stops at exactly k', 'atMost(k) minus atMost(k - 1)', 'atMost(k) plus atMost(k - 1)', 'Sort the array first'], answer: 1, why: '"Exactly k" is not monotonic, but "at most k" is, and the difference removes the smaller counts.', level: 'hard' },
      { q: 'Why can a plain sliding window not find the shortest subarray with sum at least k when negatives are allowed?', options: ['Windows need positive lengths', 'Removing an item can raise the sum and adding can lower it, so you cannot decide which edge to move', 'The answer is always one element', 'Negatives overflow'], answer: 1, why: 'The window needs a monotonic sum; with negatives use prefix sums with a monotonic deque.', level: 'hard' },
      { q: 'In minimum window substring, why keep a single "missing" counter instead of comparing two dictionaries each step?', options: ['Dictionaries cannot be compared', 'The comparison would cost up to O(alphabet) per step, while the counter is O(1)', 'It reduces memory to O(1)', 'It makes the answer unique'], answer: 1, why: 'Updating one integer as counts cross zero keeps every step constant time.', level: 'hard' },
      { q: 'A window shrinks with "if too_many: remove(left)" instead of "while too_many". What goes wrong?', options: ['Nothing, they are equivalent', 'One removal may not restore validity, so the window stays invalid', 'The loop runs forever', 'The right edge stops moving'], answer: 1, why: 'Removing one item can leave the window still invalid (for example a long repeat of a letter); loop until valid.', level: 'hard' }
    ],
    interview: [
      { q: 'What is the difference between two pointers and a sliding window, and how do you recognise each?', level: 'easy', points: [['Two pointers: usually ends move inward on sorted data, or fast and slow', ['sorted', 'both ends', 'inward', 'fast', 'slow']], ['Sliding window: a contiguous range that grows and shrinks', ['contiguous', 'range', 'grow', 'shrink', 'window']], ['Clues: pair or sum in sorted data versus longest or shortest substring or subarray', ['pair', 'longest', 'shortest', 'substring', 'subarray']], ['Both are O(n) because pointers only move one way', ['o(n)', 'linear', 'forward', 'one way']]], model: 'Two pointers usually means one pointer at each end of a sorted array that move inward, or a slow and fast pair walking in the same direction. I reach for it when I see a pair or a sum in sorted data, or a palindrome check. A sliding window is a contiguous range with a left and a right edge: the right edge grows, and the left edge shrinks when the window breaks a rule. I use it for longest or shortest substring or subarray questions. Both run in linear time because the pointers only ever move forward.' },
      { q: 'Walk me through finding the longest substring with at most k distinct characters.', level: 'medium', points: [['Window with left and right edges and a count map', ['left', 'right', 'count', 'map', 'dict']], ['Add the right character and update the count', ['add', 'right character', 'increment']], ['While distinct count exceeds k, remove the left character and move left', ['while', 'shrink', 'exceed', 'remove']], ['Delete a key when its count hits zero, record the best length each step', ['zero', 'delete', 'best', 'max']], ['O(n) time, O(k) space', ['o(n)', 'o(k)', 'linear']]], model: 'I keep a dictionary of character counts for the current window and two indexes, left and right. For each right index I add that character to the counts. While the dictionary has more than k keys, I decrement the character at left, delete the key if its count reaches zero, and move left forward. After that the window is valid, so I update the best length with right minus left plus one. Each index moves forward at most n times, so it is O(n) time, and the dictionary holds at most k plus one keys, so space is O(k).' },
      { q: 'Your sliding window code has a while loop inside a for loop. The interviewer says that looks quadratic. How do you respond?', level: 'medium', points: [['Left pointer never moves backwards', ['never', 'backward', 'forward only', 'only moves forward']], ['Each element is added once and removed at most once', ['once', 'added', 'removed', 'each element']], ['So total work is about 2n, which is O(n)', ['2n', 'o(n)', 'linear', 'amortis', 'amortiz']], ['It would be quadratic only if left reset each time', ['reset', 'restart', 'o(n^2)', 'o(n²)']]], model: 'The inner loop does not restart for each right index. The left pointer only moves forward and never goes back. So every element is added to the window once and removed at most once, which means the total number of steps over the whole run is about two n. That is linear time. The analysis is amortised: some iterations do more work, but the sum is bounded. It would only be quadratic if I reset the left pointer each time, which a correct window never does.' },
      { q: 'Explain the minimum window substring problem: your approach, complexity, and the bugs you would watch for.', level: 'hard', points: [['Count what t needs, expand right until all needs are met', ['count', 'need', 'expand', 'counter']], ['Track how many requirements are still missing in O(1)', ['missing', 'formed', 'satisf', 'o(1)']], ['When valid, shrink from the left to the smallest window and record it', ['shrink', 'smallest', 'record', 'minimum']], ['O(len(s) + len(t)) time, O(alphabet) space', ['o(n', 'linear', 'space', 'alphabet']], ['Bugs: ignoring duplicate counts in t, letters not in t, and the case with no window', ['duplicate', 'repeat', 'multiplicity', 'no window', 'empty', 'not in t']]], model: 'I count the characters t needs, then expand the right edge. A counter called missing starts at the length of t and drops each time a needed character arrives, so checking validity is constant time. When missing hits zero the window is valid, so I shrink from the left while it stays valid, record the shortest, and then drop one needed character to continue. Time is linear in both strings and space is the alphabet size. The bugs I watch for are forgetting that t can repeat letters, counting letters that are not in t, and returning something sensible when no window exists.' }
    ]
  },
  {
    id: 'pat-stacks', title: 'Pattern: stacks, queues and monotonic stacks', group: 'coding',
    uses: [
      'Compilers, calculators and spreadsheet engines evaluate nested expressions with a stack, and editors use one for undo history',
      'Trading and monitoring dashboards use a monotonic deque to report the maximum of a rolling window in constant amortised time per update'
    ],
    tasks: [
      {
        id: 'cb-backspace-compare', title: 'Typed text with backspaces', level: 'easy',
        prompt: `Two people type into a text box. The character \`#\` means backspace: it deletes the previous character if there is one, and does nothing on empty text.

Write \`same_text(a, b)\` that returns \`True\` if the final text is the same for both typed strings.

- Input: two strings of lowercase letters and \`#\`, each of length 0 to 100,000.
- Output: a boolean.
- Aim for O(n) time.

Example: \`same_text("ab#c", "ad#c")\` is \`True\` (both end as \`"ac"\`).`,
        starter: R`def same_text(a, b):
    # your code here
    pass

print(same_text("ab#c", "ad#c"))  # True
`,
        solution: R`def same_text(a, b):
    def build(s):
        stack = []
        for ch in s:
            if ch == "#":
                if stack:
                    stack.pop()
            else:
                stack.append(ch)
        return stack
    return build(a) == build(b)
`,
        tests: [
          { name: 'Example', code: R`assert same_text("ab#c", "ad#c") is True, 'Both end as "ac"'` },
          { name: 'Double backspace', code: R`assert same_text("ab##", "c#d#") is True, 'Both end as the empty string'` },
          { name: 'Different', code: R`assert same_text("a#c", "b") is False, '"c" is not "b"'` },
          { name: 'Backspace on empty text', code: R`assert same_text("y#fo##f", "y#f#o##f") is True and same_text("###", "") is True, 'A backspace on empty text does nothing'` },
          { name: 'Both empty', code: R`assert same_text("", "") is True, 'Two empty strings are equal'` }
        ]
      },
      {
        id: 'cb-eval-rpn', title: 'Evaluate postfix notation', level: 'easy',
        prompt: `Write \`eval_postfix(tokens)\` that evaluates an arithmetic expression in postfix (reverse Polish) notation.

- Input: a list of strings, each an integer (possibly negative) or one of \`+\`, \`-\`, \`*\`, \`/\`. The expression is always valid. Division of integers truncates towards zero (so \`7 / -2\` is \`-3\`). Length 1 to 10,000.
- Output: the integer result.

Example: \`eval_postfix(["2", "1", "+", "3", "*"])\` is \`9\`, because \`(2 + 1) * 3\`.`,
        starter: R`def eval_postfix(tokens):
    # your code here
    pass

print(eval_postfix(["2", "1", "+", "3", "*"]))  # 9
`,
        solution: R`def eval_postfix(tokens):
    stack = []
    for tok in tokens:
        if tok in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if tok == "+":
                stack.append(a + b)
            elif tok == "-":
                stack.append(a - b)
            elif tok == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(tok))
    return stack[0]
`,
        tests: [
          { name: 'Example', code: R`assert eval_postfix(["2", "1", "+", "3", "*"]) == 9, '(2 + 1) * 3 = 9'` },
          { name: 'Division', code: R`assert eval_postfix(["4", "13", "5", "/", "+"]) == 6, '4 + (13 / 5) = 4 + 2 = 6'` },
          { name: 'Truncate towards zero', code: R`assert eval_postfix(["7", "-2", "/"]) == -3, '7 / -2 truncates to -3, not -4'` },
          { name: 'Longer expression', code: R`assert eval_postfix(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]) == 22, 'Expected 22'` },
          { name: 'Single number', code: R`assert eval_postfix(["5"]) == 5 and eval_postfix(["-3"]) == -3, 'One token is just a number'` }
        ]
      },
      {
        id: 'cb-warmer-days', title: 'Days until a warmer day', level: 'medium',
        prompt: `Write \`days_until_warmer(temps)\` that returns, for each day, how many days you must wait for a strictly warmer temperature. If there is no warmer day later, the answer for that day is \`0\`.

- Input: a list of integers, length 0 to 100,000.
- Output: a list of the same length.
- Aim for O(n) time.

Example: \`days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73])\` is \`[1, 1, 4, 2, 1, 1, 0, 0]\`.`,
        starter: R`def days_until_warmer(temps):
    # your code here
    pass

print(days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73]))
`,
        solution: R`def days_until_warmer(temps):
    out = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            out[j] = i - j
        stack.append(i)
    return out
`,
        tests: [
          { name: 'Example', code: R`assert days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73]) == [1, 1, 4, 2, 1, 1, 0, 0], 'Expected [1, 1, 4, 2, 1, 1, 0, 0]'` },
          { name: 'Rising', code: R`assert days_until_warmer([30, 40, 50, 60]) == [1, 1, 1, 0], 'Each day is followed by a warmer one except the last'` },
          { name: 'Equal temperatures', code: R`assert days_until_warmer([5, 5, 5]) == [0, 0, 0], 'Equal is not warmer'` },
          { name: 'Falling and empty', code: R`assert days_until_warmer([9, 8, 7]) == [0, 0, 0] and days_until_warmer([]) == [], 'No warmer day later means 0'` },
          { name: 'Large input (100,000 days)', code: R`n = 100000
t = list(range(n, 0, -1))
assert days_until_warmer(t) == [0] * n, 'A strictly falling series has no warmer day; do not scan forward from every day'` }
        ]
      },
      {
        id: 'cb-decode-string', title: 'Decode a repeated string', level: 'medium',
        prompt: `Write \`decode(s)\` that expands an encoded string. The form \`k[text]\` means \`text\` repeated \`k\` times, and groups can be nested.

- Input: a valid string of lowercase letters, digits and square brackets. Numbers can have several digits. The decoded result has at most 100,000 characters.
- Output: the decoded string.

Example: \`decode("3[a2[c]]")\` is \`"accaccacc"\`.`,
        starter: R`def decode(s):
    # your code here
    pass

print(decode("3[a2[c]]"))  # accaccacc
`,
        solution: R`def decode(s):
    stack = []
    current = ""
    num = 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == "[":
            stack.append((current, num))
            current, num = "", 0
        elif ch == "]":
            prev, k = stack.pop()
            current = prev + current * k
        else:
            current += ch
    return current
`,
        tests: [
          { name: 'Example', code: R`assert decode("3[a2[c]]") == "accaccacc", 'Expected "accaccacc"'` },
          { name: 'Two groups', code: R`assert decode("3[a]2[bc]") == "aaabcbc", 'Expected "aaabcbc"'` },
          { name: 'Text around groups', code: R`assert decode("2[abc]3[cd]ef") == "abcabccdcdcdef", 'Expected "abcabccdcdcdef"'` },
          { name: 'Multi-digit count', code: R`assert decode("10[x]") == "x" * 10, 'The count 10 must be read as ten, not one and zero'` },
          { name: 'No brackets, and empty', code: R`assert decode("abc") == "abc" and decode("") == "", 'Plain text and an empty string pass through'` }
        ]
      },
      {
        id: 'cb-largest-rectangle', title: 'Largest rectangle in a histogram', level: 'hard',
        prompt: `A histogram has bars of width 1 and the given heights. Write \`largest_rectangle(heights)\` that returns the area of the largest rectangle that fits inside the bars (its height is limited by the shortest bar it covers).

- Input: a list of non-negative integers, length 0 to 100,000.
- Output: the maximum area (0 for an empty list).
- Aim for O(n) time. A hidden test uses 100,000 bars, so expanding left and right from every bar will time out.

Example: \`largest_rectangle([2, 1, 5, 6, 2, 3])\` is \`10\` (heights 5 and 6, width 2).`,
        starter: R`def largest_rectangle(heights):
    # your code here
    pass

print(largest_rectangle([2, 1, 5, 6, 2, 3]))  # 10
`,
        solution: R`def largest_rectangle(heights):
    stack = []
    best = 0
    for i, h in enumerate(heights + [0]):
        start = i
        while stack and stack[-1][1] >= h:
            idx, height = stack.pop()
            best = max(best, height * (i - idx))
            start = idx
        stack.append((start, h))
    return best
`,
        tests: [
          { name: 'Example', code: R`assert largest_rectangle([2, 1, 5, 6, 2, 3]) == 10, 'Bars 5 and 6 give a 5 x 2 rectangle of area 10'` },
          { name: 'Two bars', code: R`assert largest_rectangle([2, 4]) == 4, 'Either the 4-bar alone or two 2-bars: area 4'` },
          { name: 'Empty and single', code: R`assert largest_rectangle([]) == 0 and largest_rectangle([5]) == 5, 'Empty is 0, a single bar is its height'` },
          { name: 'Valley', code: R`assert largest_rectangle([6, 2, 5, 4, 5, 1, 6]) == 12, 'The bars 2,5,4,5 give 4 x 3 = 12'` },
          { name: 'Large input (100,000 bars)', code: R`assert largest_rectangle([3] * 100000) == 300000, 'All bars equal: one rectangle across everything'` }
        ]
      },
      {
        id: 'cb-window-max', title: 'Maximum of every window', level: 'hard',
        prompt: `Write \`window_max(nums, k)\` that returns the maximum of every contiguous window of \`k\` items, from left to right.

- Input: a list of integers (length 1 to 100,000) and \`k\` with \`1 <= k <= len(nums)\`.
- Output: a list of \`len(nums) - k + 1\` maximums.
- Aim for O(n) time using a deque. A hidden test uses 100,000 numbers with a window of 50,000, so recomputing the maximum of each window will time out.

Example: \`window_max([1, 3, -1, -3, 5, 3, 6, 7], 3)\` is \`[3, 3, 5, 5, 6, 7]\`.`,
        starter: R`def window_max(nums, k):
    # your code here
    pass

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
`,
        solution: R`from collections import deque

def window_max(nums, k):
    dq = deque()
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out
`,
        tests: [
          { name: 'Example', code: R`assert window_max([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7], 'Expected [3, 3, 5, 5, 6, 7]'` },
          { name: 'Window of one', code: R`assert window_max([9, 8, 7], 1) == [9, 8, 7], 'With k = 1 the answer is the list itself'` },
          { name: 'Window is the whole list', code: R`assert window_max([1, 2, 3], 3) == [3] and window_max([4, -2], 2) == [4], 'One window covers everything'` },
          { name: 'Falling values', code: R`assert window_max([5, 4, 3, 2, 1], 2) == [5, 4, 3, 2], 'The old maximum must leave the window when it expires'` },
          { name: 'Large input (100,000 numbers)', code: R`n = 100000
k = 50000
assert window_max(list(range(n)), k) == list(range(k - 1, n)), 'For rising values each window maximum is its last item'` }
        ]
      }
    ],
    quiz: [
      { q: 'Which structure fits "match every closing bracket with the most recent unmatched opening bracket"?', options: ['Queue', 'Stack', 'Heap', 'Set'], answer: 1, why: 'Last in, first out matches the most recent opener first.', level: 'easy' },
      { q: 'Which structure gives first-in, first-out order, as used by breadth-first search?', options: ['Stack', 'Queue', 'Hash map', 'Sorted list'], answer: 1, why: 'A queue serves items in the order they arrived.', level: 'easy' },
      { q: 'What does a monotonic stack typically find?', options: ['The median of a list', 'For each item, the next greater or smaller item', 'All duplicates', 'The shortest path'], answer: 1, why: 'Keeping the stack sorted lets smaller or larger items pop as soon as the answer appears.', level: 'easy' },
      { q: 'In Python, which gives O(1) removal from the front of a queue?', options: ['list.pop(0)', 'collections.deque.popleft()', 'list.remove(x)', 'sorted(list)'], answer: 1, why: 'A list shifts every item on pop(0), costing O(n); a deque does not.', level: 'easy' },
      { q: 'A monotonic stack solution has a while loop inside a for loop. Why is it O(n)?', options: ['The while loop is short', 'Each item is pushed once and popped at most once', 'Python optimises it', 'It is really O(n²)'], answer: 1, why: 'Total pushes plus pops is at most 2n.', level: 'medium' },
      { q: 'In "days until a warmer day", the stack holds indexes rather than temperatures. Why?', options: ['Indexes sort faster', 'You need the position to compute the distance and to write the answer', 'Temperatures cannot be stored', 'It saves memory'], answer: 1, why: 'Popping day j at day i gives i - j, and the result goes into out[j].', level: 'medium' },
      { q: 'While decoding "3[a2[c]]", what do you push when you read "["?', options: ['Only the number', 'The text built so far and the repeat count', 'Nothing', 'The whole string'], answer: 1, why: 'On the matching "]" you pop them and append the repeated inner text to the saved text.', level: 'medium' },
      { q: 'A queue is built from two stacks (push into one, pop from the other, refilling only when empty). What is the amortised cost per operation?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 2, why: 'Each item moves between stacks at most once, so the total over n operations is O(n).', level: 'medium' },
      { q: 'In the largest-rectangle problem, why do many solutions append a bar of height 0 at the end?', options: ['To double the area', 'To force every remaining bar off the stack so it is measured', 'To avoid negative heights', 'To sort the bars'], answer: 1, why: 'The sentinel is smaller than everything, so it pops all bars still waiting.', level: 'hard' },
      { q: 'In sliding-window maximum with a deque, why store indexes rather than values?', options: ['Values are not comparable', 'You must know when the front item has left the window', 'Indexes use less memory', 'The deque requires integers'], answer: 1, why: 'The front is removed when its index is at or before i - k.', level: 'hard' },
      { q: 'For "next strictly warmer day", you pop while temps[top] < t. What goes wrong if you pop while temps[top] <= t?', options: ['Nothing', 'Equal temperatures get an answer even though they are not warmer', 'The loop never ends', 'Rising days are missed'], answer: 1, why: 'A day equal in temperature would wrongly be marked as having found a warmer day.', level: 'hard' },
      { q: 'Sliding-window maximum implemented with list.pop(0) instead of deque.popleft() costs…', options: ['Still O(n) overall', 'Up to O(n) per pop, so O(n·k) or worse overall', 'O(1) per pop', 'O(log n) per pop'], answer: 1, why: 'Every pop(0) shifts the remaining items, which can turn a linear solution quadratic.', level: 'hard' }
    ],
    interview: [
      { q: 'When would you choose a stack over a queue, and what are the classic problems for each?', level: 'easy', points: [['Stack is last in, first out; queue is first in, first out', ['lifo', 'fifo', 'last in', 'first in']], ['Stack: brackets, undo, expression evaluation, DFS', ['bracket', 'undo', 'expression', 'dfs', 'depth']], ['Queue: BFS, scheduling, streams in order', ['bfs', 'breadth', 'schedul', 'order of arrival']], ['In Python use a list for a stack and deque for a queue', ['deque', 'list', 'append', 'popleft']]], model: 'A stack is last in, first out, so I use it when the most recent item must be handled first: matching brackets, evaluating expressions, undo history and depth-first search. A queue is first in, first out, which suits breadth-first search, task scheduling and processing events in arrival order. In Python a plain list works as a stack with append and pop, both constant time. For a queue I use collections.deque with popleft, because pop zero on a list is linear time since it shifts everything.' },
      { q: 'Explain the monotonic stack with the "next greater element" problem, and why it is O(n).', level: 'medium', points: [['Keep a stack of indexes whose answers are still unknown, in decreasing order of value', ['index', 'decreasing', 'monotonic', 'unknown', 'waiting']], ['A new bigger value pops smaller ones and resolves their answers', ['pop', 'resolve', 'bigger', 'greater', 'answer']], ['Then push the current index', ['push', 'append']], ['Each item is pushed once and popped once, so O(n)', ['once', 'o(n)', 'linear', '2n']], ['Items left on the stack have no greater element', ['left', 'remain', 'no greater', 'zero', '-1']]], model: 'I keep a stack of indexes of items still waiting for a bigger value, so their values are in decreasing order from bottom to top. When a new value arrives, I pop every index whose value is smaller; the new value is the answer for each of them. Then I push the new index. Whatever is left at the end has no greater element. The while loop inside the for loop looks quadratic, but each index is pushed once and popped at most once, so the total work is at most two n, which is linear.' },
      { q: 'Walk me through sliding window maximum using a deque. Why not just take max() of each window?', level: 'medium', points: [['Taking max of each window costs O(n·k)', ['o(n·k)', 'o(nk)', 'n * k', 'n*k', 'k each', 'recompute']], ['Deque of indexes with values in decreasing order', ['decreasing', 'index', 'indexes', 'deque']], ['Pop from the back while the new value is bigger or equal', ['back', 'pop', 'smaller', 'bigger']], ['Pop from the front when it leaves the window', ['front', 'expire', 'leaves', 'out of the window', 'popleft']], ['The front is the maximum; O(n) total', ['front', 'maximum', 'o(n)', 'linear']]], model: 'Recomputing max for every window costs about n times k, which is too slow for big inputs. Instead I keep a deque of indexes whose values are in decreasing order. For each new item I pop smaller or equal values from the back, because they can never be a maximum while the new item is in the window. Then I push the new index. If the front index has left the window, I pop it from the front. The front of the deque is always the current maximum. Each index enters and leaves once, so the whole run is linear.' },
      { q: 'Describe how you would solve the largest rectangle in a histogram. What are the complexity and the common mistakes?', level: 'hard', points: [['Brute force expands from each bar, O(n²)', ['o(n^2)', 'o(n²)', 'quadratic', 'expand', 'each bar']], ['Stack of increasing heights; a shorter bar pops taller ones', ['stack', 'increasing', 'shorter', 'pop']], ['Width is from the new left boundary to the current index', ['width', 'left boundary', 'start index', 'i -']], ['Sentinel zero or a final flush pops what is left', ['sentinel', 'flush', 'zero', 'remaining', 'end']], ['O(n) time and O(n) space; mistakes with equal heights and off-by-one widths', ['o(n)', 'linear', 'equal', 'off-by-one', 'off by one', 'width']]], model: 'The brute force expands left and right from every bar, which is quadratic. Instead I keep a stack of bars with increasing heights. When a shorter bar arrives, I pop each taller bar, compute its area using its height and the width from where it could start to the current index, and the new bar inherits the start of the last bar popped. I add a bar of height zero at the end to flush the stack. It is linear time and linear space. The mistakes I watch for are the width off by one and mishandling equal heights.' }
    ]
  },
  {
    id: 'pat-search', title: 'Pattern: binary search', group: 'coding',
    uses: [
      'Databases and search indexes keep keys in sorted order and use binary search (or B-tree descent) to find a row among billions in a few dozen steps',
      'Release engineering tools such as automated bisect find the first bad build or commit by testing the middle of the range, halving it each time'
    ],
    tasks: [
      {
        id: 'cb-search-insert', title: 'Where does it belong?', level: 'easy',
        prompt: `Write \`insert_position(nums, target)\` for a list sorted in ascending order without duplicates. Return the index of \`target\` if it is present, or the index where it would have to be inserted to keep the list sorted.

- Input: a sorted list of integers, length 0 to 100,000, and an integer target.
- Output: an index from 0 to \`len(nums)\`.
- Use binary search: O(log n) time.

Example: \`insert_position([1, 3, 5, 6], 2)\` is \`1\`.`,
        starter: R`def insert_position(nums, target):
    # your code here
    pass

print(insert_position([1, 3, 5, 6], 2))  # 1
`,
        solution: R`def insert_position(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
`,
        tests: [
          { name: 'Example', code: R`assert insert_position([1, 3, 5, 6], 2) == 1, '2 belongs between 1 and 3, at index 1'` },
          { name: 'Present', code: R`assert insert_position([1, 3, 5, 6], 5) == 2, '5 is at index 2'` },
          { name: 'After the end', code: R`assert insert_position([1, 3, 5, 6], 7) == 4, 'A value larger than all goes at len(nums)'` },
          { name: 'Before the start', code: R`assert insert_position([1, 3, 5, 6], 0) == 0, 'A value smaller than all goes at index 0'` },
          { name: 'Empty list', code: R`assert insert_position([], 3) == 0, 'In an empty list the position is 0'` }
        ]
      },
      {
        id: 'cb-int-sqrt', title: 'Integer square root', level: 'easy',
        prompt: `Write \`isqrt(n)\` that returns the largest integer \`r\` with \`r * r <= n\`, without using \`math.sqrt\`, \`math.isqrt\`, \`**0.5\` or any library root function.

- Input: an integer \`n\` from 0 to \`10**18\`.
- Output: the integer \`r\`.
- Use binary search on the answer: O(log n) time. Counting up one by one will never finish for large \`n\`.

Example: \`isqrt(8)\` is \`2\`.`,
        starter: R`def isqrt(n):
    # your code here
    pass

print(isqrt(8))  # 2
`,
        solution: R`def isqrt(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo
`,
        tests: [
          { name: 'Example', code: R`assert isqrt(8) == 2, '2 * 2 = 4 <= 8 and 3 * 3 = 9 > 8'` },
          { name: 'Perfect square', code: R`assert isqrt(16) == 4, '4 * 4 = 16'` },
          { name: 'Zero and one', code: R`assert isqrt(0) == 0 and isqrt(1) == 1, 'Check the smallest inputs'` },
          { name: 'Large perfect square', code: R`assert isqrt(10**18) == 10**9, 'The root of 10**18 is 10**9'` },
          { name: 'Just below a square', code: R`assert isqrt(10**18 - 1) == 10**9 - 1, 'One less than a perfect square rounds down'` }
        ]
      },
      {
        id: 'cb-first-last', title: 'First and last position', level: 'medium',
        prompt: `Write \`find_range(nums, target)\` for a list sorted in ascending order that may contain duplicates. Return \`[first, last]\`, the first and last index of \`target\`, or \`[-1, -1]\` if it is absent.

- Input: a sorted list of integers, length 0 to 100,000, and a target.
- Output: a list of two integers.
- Use two binary searches: O(log n) time.

Example: \`find_range([5, 7, 7, 8, 8, 10], 8)\` is \`[3, 4]\`.`,
        starter: R`def find_range(nums, target):
    # your code here
    pass

print(find_range([5, 7, 7, 8, 8, 10], 8))  # [3, 4]
`,
        solution: R`def find_range(nums, target):
    def lower(x):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        return lo
    first = lower(target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    return [first, lower(target + 1) - 1]
`,
        tests: [
          { name: 'Example', code: R`assert find_range([5, 7, 7, 8, 8, 10], 8) == [3, 4], '8 occupies indexes 3 and 4'` },
          { name: 'Absent', code: R`assert find_range([5, 7, 7, 8, 8, 10], 6) == [-1, -1], '6 is not in the list'` },
          { name: 'Empty list', code: R`assert find_range([], 0) == [-1, -1], 'Nothing to find in an empty list'` },
          { name: 'All the same', code: R`assert find_range([2, 2, 2], 2) == [0, 2], 'The range covers the whole list'` },
          { name: 'Single value', code: R`assert find_range([1], 1) == [0, 0] and find_range([1], 2) == [-1, -1], 'One-element lists'` }
        ]
      },
      {
        id: 'cb-rotated-search', title: 'Search a rotated list', level: 'medium',
        prompt: `A list of distinct integers that was sorted in ascending order has been rotated at an unknown position (for example \`[0, 1, 2, 4, 5, 6, 7]\` became \`[4, 5, 6, 7, 0, 1, 2]\`).

Write \`search_rotated(nums, target)\` that returns the index of \`target\`, or \`-1\` if it is absent.

- Input: a rotated list of distinct integers, length 1 to 100,000, and a target.
- Output: an index or \`-1\`.
- Use binary search: O(log n) time.

Example: \`search_rotated([4, 5, 6, 7, 0, 1, 2], 0)\` is \`4\`.`,
        starter: R`def search_rotated(nums, target):
    # your code here
    pass

print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))  # 4
`,
        solution: R`def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
`,
        tests: [
          { name: 'Example', code: R`assert search_rotated([4, 5, 6, 7, 0, 1, 2], 0) == 4, '0 is at index 4'` },
          { name: 'Absent', code: R`assert search_rotated([4, 5, 6, 7, 0, 1, 2], 3) == -1, '3 is not in the list'` },
          { name: 'Target in the left part', code: R`assert search_rotated([4, 5, 6, 7, 0, 1, 2], 5) == 1, '5 is at index 1'` },
          { name: 'Single element', code: R`assert search_rotated([1], 0) == -1 and search_rotated([1], 1) == 0, 'One-element lists'` },
          { name: 'Two elements', code: R`assert search_rotated([3, 1], 1) == 1 and search_rotated([3, 1], 3) == 0, 'With two elements the left half can be a single item'` }
        ]
      },
      {
        id: 'cb-split-array', title: 'Split to minimise the largest part', level: 'hard',
        prompt: `Write \`min_largest_sum(nums, m)\` that splits \`nums\` into exactly \`m\` non-empty contiguous parts so that the largest part sum is as small as possible, and returns that smallest possible largest sum.

- Input: a list of positive integers, length 1 to 100,000, and \`m\` with \`1 <= m <= len(nums)\`.
- Output: the minimised largest sum.
- Binary search on the answer, with a greedy check that counts parts: O(n log(sum)). A hidden test uses 100,000 numbers, so trying every possible answer one by one will time out.

Example: \`min_largest_sum([7, 2, 5, 10, 8], 2)\` is \`18\` (parts \`[7, 2, 5]\` and \`[10, 8]\`).`,
        starter: R`def min_largest_sum(nums, m):
    # your code here
    pass

print(min_largest_sum([7, 2, 5, 10, 8], 2))  # 18
`,
        solution: R`def min_largest_sum(nums, m):
    def parts_needed(limit):
        parts, current = 1, 0
        for x in nums:
            if current + x > limit:
                parts += 1
                current = x
            else:
                current += x
        return parts
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if parts_needed(mid) <= m:
            hi = mid
        else:
            lo = mid + 1
    return lo
`,
        tests: [
          { name: 'Example', code: R`assert min_largest_sum([7, 2, 5, 10, 8], 2) == 18, 'Best split is [7,2,5] and [10,8], largest sum 18'` },
          { name: 'Increasing', code: R`assert min_largest_sum([1, 2, 3, 4, 5], 2) == 9, 'Best split is [1,2,3] and [4,5], largest sum 9'` },
          { name: 'One part per item', code: R`assert min_largest_sum([1, 4, 4], 3) == 4, 'Each item alone: the largest is 4'` },
          { name: 'One part', code: R`assert min_largest_sum([5], 1) == 5 and min_largest_sum([3, 4, 5], 1) == 12, 'A single part is the total'` },
          { name: 'Large input (100,000 numbers)', code: R`assert min_largest_sum([1] * 100000, 2) == 50000, 'Two equal halves of 50,000'` }
        ]
      },
      {
        id: 'cb-kth-pair-distance', title: 'K-th smallest pair distance', level: 'hard',
        prompt: `The distance of a pair of positions \`i < j\` is \`abs(nums[i] - nums[j])\`. Write \`kth_distance(nums, k)\` that returns the \`k\`-th smallest distance among all pairs (counting from 1, and counting equal distances separately).

- Input: a list of integers, length 2 to 100,000, and \`k\` with \`1 <= k <= n * (n - 1) / 2\`.
- Output: the k-th smallest distance.
- Sort, then binary search on the distance and count pairs with two pointers: O(n log n + n log(range)). A hidden test uses 100,000 numbers (about 5 billion pairs), so listing all distances will fail.

Example: \`kth_distance([1, 3, 1], 2)\` is \`2\` (the distances are 0, 2, 2).`,
        starter: R`def kth_distance(nums, k):
    # your code here
    pass

print(kth_distance([1, 3, 1], 2))  # 2
`,
        solution: R`def kth_distance(nums, k):
    a = sorted(nums)
    n = len(a)

    def pairs_within(d):
        count = 0
        left = 0
        for right in range(n):
            while a[right] - a[left] > d:
                left += 1
            count += right - left
        return count

    lo, hi = 0, a[-1] - a[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if pairs_within(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo
`,
        tests: [
          { name: 'Example', code: R`assert kth_distance([1, 3, 1], 2) == 2, 'Distances are 0, 2, 2; the second is 2'` },
          { name: 'Smallest', code: R`assert kth_distance([1, 3, 1], 1) == 0, 'The smallest distance is 0 (the two 1s)'` },
          { name: 'Wide gaps', code: R`assert kth_distance([1, 6, 1], 3) == 5, 'Distances are 0, 5, 5; the third is 5'` },
          { name: 'Longer list', code: R`assert kth_distance([9, 10, 7, 10, 6, 1, 5, 4, 9, 8], 18) == 2, 'Expected 2'` },
          { name: 'Large input (100,000 numbers)', code: R`nums = list(range(100000))
assert kth_distance(nums, 99999) == 1 and kth_distance(nums, 100000) == 2, 'There are 99,999 pairs at distance 1, so the 100,000th pair has distance 2'` }
        ]
      }
    ],
    quiz: [
      { q: 'Binary search needs the data (or the property being tested) to be…', options: ['Unique', 'Sorted or monotonic', 'Numeric', 'Stored in a dict'], answer: 1, why: 'Discarding half the range is only valid when the test changes from false to true once.', level: 'easy' },
      { q: 'What is the time complexity of binary search on n sorted items?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1, why: 'The range halves on every step.', level: 'easy' },
      { q: 'About how many steps does binary search need for 1,000,000 sorted items?', options: ['About 20', 'About 1,000', 'About 500,000', 'About 100'], answer: 0, why: 'log2 of a million is just under 20.', level: 'easy' },
      { q: 'What does bisect_left(a, x) return for a sorted list a?', options: ['The index of the last x', 'The first index where x could be inserted while keeping order', 'The number of items larger than x', 'Always -1 when x is absent'], answer: 1, why: 'It is the lower bound: the first position whose value is at least x.', level: 'easy' },
      { q: 'In "while lo < hi: mid = (lo + hi) // 2; if ok(mid): hi = mid else: lo = mid + 1", why is it lo = mid + 1 and not lo = mid?', options: ['Style only', 'lo = mid could loop forever when hi = lo + 1', 'It makes the answer larger', 'Python forbids lo = mid'], answer: 1, why: 'With mid rounded down, lo = mid would never advance when the range has two items.', level: 'medium' },
      { q: 'Which problem is solved by binary searching on the answer?', options: ['Smallest capacity so that all packages ship in D days', 'Count the words in a text', 'Reverse a string', 'Find duplicates'], answer: 0, why: 'Feasibility is monotonic: if a capacity works, every larger one works too.', level: 'medium' },
      { q: 'How do you find the first occurrence of x in a sorted list with duplicates?', options: ['Binary search for any x, then walk left one by one', 'Use the lower bound: first index with value at least x', 'Sort again', 'Use a hash set'], answer: 1, why: 'Walking left is O(n) in the worst case; the lower bound stays O(log n).', level: 'medium' },
      { q: 'In a rotated sorted list (distinct values), how do you decide which half of [lo, hi] is sorted?', options: ['Compare nums[lo] with nums[mid]', 'Compare nums[mid] with the target', 'Always the left half', 'Count the items'], answer: 0, why: 'If nums[lo] <= nums[mid], the left part has no rotation point inside it.', level: 'medium' },
      { q: 'Why do Java and C++ programmers write lo + (hi - lo) / 2 instead of (lo + hi) / 2?', options: ['It is faster', 'lo + hi can overflow a fixed-size integer', 'It rounds up', 'It avoids negative numbers'], answer: 1, why: 'Python integers do not overflow, but the safe form is a good habit.', level: 'hard' },
      { q: 'Binary search on the answer where each feasibility check is O(n) and the answer lies in a range of size R. Total cost?', options: ['O(n)', 'O(n log R)', 'O(R)', 'O(n · R)'], answer: 1, why: 'There are about log R checks, each costing O(n).', level: 'hard' },
      { q: 'You binary search on the answer but your feasibility function is not monotonic (true, false, true as the value grows). What happens?', options: ['The search still works', 'It may return a wrong answer because discarding half is invalid', 'It runs in O(n²)', 'It raises an exception'], answer: 1, why: 'The halving logic assumes one switch from false to true.', level: 'hard' },
      { q: 'For the k-th smallest pair distance, why is binary search on the distance better than listing all pair distances?', options: ['There are O(n²) pairs; counting pairs within d takes O(n) with two pointers', 'Distances are always sorted', 'It uses no sorting', 'It only works for small n'], answer: 0, why: 'You never build the O(n²) list; you only count how many pairs have distance at most d.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain binary search and the invariant you keep so that you avoid off-by-one errors.', level: 'easy', points: [['Needs sorted or monotonic data', ['sorted', 'monotonic', 'order']], ['Halve the range by comparing the middle', ['half', 'middle', 'mid', 'halving']], ['State an invariant such as the answer lies in lo to hi', ['invariant', 'answer lies', 'range', 'lo and hi', 'inclusive', 'exclusive']], ['O(log n) time, O(1) space', ['o(log n)', 'log n', 'logarithmic']], ['Move lo to mid + 1 so the loop always progresses', ['mid + 1', 'mid+1', 'progress', 'infinite']]], model: 'Binary search needs sorted or monotonic data. I compare the middle with the target and throw away the half that cannot contain the answer, which gives O of log n time and constant space. To avoid off-by-one errors I decide the invariant first, for example that the answer lies in the half-open range from lo to hi, and I keep it true. When I discard the middle I move lo to mid plus one, so the range always shrinks and the loop cannot run forever. Then I test with an empty list, one item, and a target below and above everything.' },
      { q: 'What does "binary search on the answer" mean? Use shipping packages within D days as an example.', level: 'medium', points: [['Search over possible answers, not over array positions', ['possible answers', 'answer space', 'range of answers', 'not the array']], ['Needs a feasibility check that is monotonic', ['monotonic', 'feasible', 'check', 'larger capacity']], ['Bounds: largest item to total weight', ['largest', 'maximum item', 'sum', 'total']], ['Check greedily in O(n); total O(n log range)', ['greedy', 'o(n)', 'log']]], model: 'Instead of searching an array, I search the range of possible answers. For shipping, the capacity is at least the heaviest package and at most the total weight. For a given capacity I can check in linear time, greedily, whether the packages fit in D days. If a capacity works, any larger one works too, so feasibility is monotonic and I can binary search for the smallest capacity that works. If it works I move hi to mid, otherwise lo to mid plus one. The total cost is O of n times log of the range.' },
      { q: 'How would you search for a value in a rotated sorted array, and what are the edge cases?', level: 'medium', points: [['At least one half around mid is sorted', ['one half', 'sorted half', 'one side']], ['Compare lo and mid to find which half is sorted', ['nums[lo]', 'compare', 'lo and mid', 'left half']], ['Check if the target lies in the sorted half, else go to the other', ['range', 'lies', 'within', 'other half']], ['O(log n); duplicates can force O(n)', ['o(log n)', 'duplicate', 'worst case']], ['Edge cases: single or two elements, not rotated', ['single', 'two element', 'not rotated', 'one element']]], model: 'After picking the middle, at least one half is still sorted. I compare the value at lo with the value at mid to see which half that is. If the target lies inside the range of the sorted half, I search it, otherwise I search the other half. That gives O of log n time. With duplicates I cannot always tell which half is sorted, so the worst case becomes linear. I check edge cases: one element, two elements where the left half is a single item, and a list that is not rotated at all.' },
      { q: 'You are given a monotonic condition that is expensive to evaluate and an unbounded or very large range. How do you find the boundary, and what are the trade-offs?', level: 'hard', points: [['Binary search the boundary: halve the range each time', ['binary search', 'halve', 'boundary', 'bisect']], ['If the upper bound is unknown, double until the condition flips', ['double', 'exponential', 'galloping', 'unbounded']], ['Number of expensive calls is about log of the range', ['log', 'few calls', 'number of calls']], ['Needs a monotonic condition; otherwise it can miss the answer', ['monotonic', 'wrong answer', 'not monotonic']], ['Cache or cheapen the check; consider early exit', ['cache', 'memo', 'early', 'cheap']]], model: 'I binary search the boundary where the condition flips, which needs only about log of the range evaluations, a big win when each one is expensive, like building and testing a commit. If there is no upper bound, I first double the probe point until the condition flips, which is exponential search, then binary search inside that range. The key assumption is monotonicity; if the condition is not monotonic, discarding half can hide the answer. To lower cost I cache results and make the check exit early when it already knows the outcome.' }
    ]
  },
  {
    id: 'pat-intervals', title: 'Pattern: sorting, intervals and greedy', group: 'coding',
    uses: [
      'Calendar and room-booking systems merge busy periods and count overlapping events to find free slots and the number of rooms needed',
      'Job schedulers and CDNs use greedy rules such as earliest deadline first or longest-reach-first to pick the next task or edge server'
    ],
    tasks: [
      {
        id: 'cb-can-attend', title: 'Can one person attend every meeting?', level: 'easy',
        prompt: `Write \`can_attend_all(meetings)\` that returns \`True\` if one person can attend every meeting. Each meeting is \`[start, end]\`. A meeting that ends at time \`t\` does not clash with one that starts at \`t\`.

- Input: a list of \`[start, end]\` pairs with \`start < end\`, in any order, length 0 to 100,000.
- Output: a boolean.
- Aim for O(n log n) time.

Example: \`can_attend_all([[0, 30], [5, 10], [15, 20]])\` is \`False\`.`,
        starter: R`def can_attend_all(meetings):
    # your code here
    pass

print(can_attend_all([[0, 30], [5, 10], [15, 20]]))  # False
`,
        solution: R`def can_attend_all(meetings):
    ordered = sorted(meetings)
    for i in range(1, len(ordered)):
        if ordered[i][0] < ordered[i - 1][1]:
            return False
    return True
`,
        tests: [
          { name: 'Example', code: R`assert can_attend_all([[0, 30], [5, 10], [15, 20]]) is False, '[5,10] sits inside [0,30]'` },
          { name: 'Unsorted but free', code: R`assert can_attend_all([[7, 10], [2, 4]]) is True, 'The meetings do not overlap'` },
          { name: 'Touching meetings', code: R`assert can_attend_all([[1, 2], [2, 3]]) is True, 'A meeting ending at 2 and one starting at 2 do not clash'` },
          { name: 'Empty and single', code: R`assert can_attend_all([]) is True and can_attend_all([[1, 5]]) is True, 'Zero or one meeting never clashes'` },
          { name: 'Overlap found only after sorting', code: R`assert can_attend_all([[10, 12], [1, 3], [2, 4]]) is False, '[1,3] and [2,4] overlap'` }
        ]
      },
      {
        id: 'cb-assign-cookies', title: 'Assign cookies to children', level: 'easy',
        prompt: `Each child has a greed value: the smallest cookie size that will satisfy them. Each cookie has a size and can go to at most one child, and each child gets at most one cookie.

Write \`max_content(greed, sizes)\` that returns the largest number of children that can be satisfied.

- Input: two lists of positive integers, each of length 0 to 100,000.
- Output: the count.
- Aim for O(n log n) time (sort, then a greedy sweep).

Example: \`max_content([1, 2, 3], [1, 1])\` is \`1\`.`,
        starter: R`def max_content(greed, sizes):
    # your code here
    pass

print(max_content([1, 2, 3], [1, 1]))  # 1
`,
        solution: R`def max_content(greed, sizes):
    greed = sorted(greed)
    sizes = sorted(sizes)
    child = 0
    for cookie in sizes:
        if child < len(greed) and cookie >= greed[child]:
            child += 1
    return child
`,
        tests: [
          { name: 'Example', code: R`assert max_content([1, 2, 3], [1, 1]) == 1, 'Only the child with greed 1 can be satisfied'` },
          { name: 'Plenty of cookies', code: R`assert max_content([1, 2], [1, 2, 3]) == 2, 'Both children can be satisfied'` },
          { name: 'Unsorted input', code: R`assert max_content([10, 9, 8, 7], [5, 6, 7, 8]) == 2, 'Cookies 7 and 8 satisfy the children with greed 7 and 8'` },
          { name: 'Nothing to give or nobody to feed', code: R`assert max_content([], [1]) == 0 and max_content([5], []) == 0, 'Empty lists give 0'` },
          { name: 'Cookies too small', code: R`assert max_content([4, 5], [1, 2, 3]) == 0, 'No cookie is big enough'` }
        ]
      },
      {
        id: 'cb-merge-intervals', title: 'Merge overlapping intervals', level: 'medium',
        prompt: `Write \`merge(intervals)\` that merges all overlapping intervals. Intervals \`[a, b]\` and \`[c, d]\` overlap when they share at least one point, so \`[1, 4]\` and \`[4, 5]\` merge into \`[1, 5]\`.

- Input: a list of \`[start, end]\` pairs with \`start <= end\`, in any order, length 0 to 100,000.
- Output: the merged intervals as a list of \`[start, end]\` lists sorted by start.
- Aim for O(n log n) time.

Example: \`merge([[1, 3], [2, 6], [8, 10], [15, 18]])\` is \`[[1, 6], [8, 10], [15, 18]]\`.`,
        starter: R`def merge(intervals):
    # your code here
    pass

print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))
`,
        solution: R`def merge(intervals):
    out = []
    for start, end in sorted(intervals):
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out
`,
        tests: [
          { name: 'Example', code: R`assert merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]], 'Expected [[1, 6], [8, 10], [15, 18]]'` },
          { name: 'Touching intervals', code: R`assert merge([[1, 4], [4, 5]]) == [[1, 5]], 'Intervals that share the point 4 merge'` },
          { name: 'One swallows the rest', code: R`assert merge([[5, 6], [1, 10], [2, 3]]) == [[1, 10]], 'The end must be the maximum of the ends, not the last end'` },
          { name: 'Empty and single', code: R`assert merge([]) == [] and merge([[1, 2]]) == [[1, 2]], 'Empty gives empty; one interval is unchanged'` },
          { name: 'Does not change the input', code: R`data = [[3, 4], [1, 2]]
assert merge(data) == [[1, 2], [3, 4]] and data == [[3, 4], [1, 2]], 'Return a new list and leave the argument alone'` }
        ]
      },
      {
        id: 'cb-min-removals', title: 'Fewest intervals to remove', level: 'medium',
        prompt: `Write \`min_removals(intervals)\` that returns the fewest intervals you must remove so that the remaining ones do not overlap. Intervals that only touch at an end (such as \`[1, 2]\` and \`[2, 3]\`) do not overlap.

- Input: a list of \`[start, end]\` pairs with \`start < end\`, length 0 to 100,000.
- Output: the number to remove.
- Aim for O(n log n) time. Hint: keep as many intervals as possible by always choosing the one that ends earliest.

Example: \`min_removals([[1, 2], [2, 3], [3, 4], [1, 3]])\` is \`1\` (remove \`[1, 3]\`).`,
        starter: R`def min_removals(intervals):
    # your code here
    pass

print(min_removals([[1, 2], [2, 3], [3, 4], [1, 3]]))  # 1
`,
        solution: R`def min_removals(intervals):
    kept = 0
    last_end = None
    for start, end in sorted(intervals, key=lambda iv: iv[1]):
        if last_end is None or start >= last_end:
            kept += 1
            last_end = end
    return len(intervals) - kept
`,
        tests: [
          { name: 'Example', code: R`assert min_removals([[1, 2], [2, 3], [3, 4], [1, 3]]) == 1, 'Remove [1,3] and the rest fit'` },
          { name: 'Identical intervals', code: R`assert min_removals([[1, 2], [1, 2], [1, 2]]) == 2, 'Keep only one of three identical intervals'` },
          { name: 'Already disjoint', code: R`assert min_removals([[1, 2], [2, 3]]) == 0, 'Touching intervals do not overlap'` },
          { name: 'Empty', code: R`assert min_removals([]) == 0, 'Nothing to remove'` },
          { name: 'One long interval', code: R`assert min_removals([[1, 100], [11, 22], [1, 11], [2, 12]]) == 2, 'Keep [1,11] and [11,22]; remove the other two'` }
        ]
      },
      {
        id: 'cb-min-rooms', title: 'Minimum meeting rooms', level: 'hard',
        prompt: `Write \`min_rooms(meetings)\` that returns the smallest number of rooms needed to hold all meetings. A room can be reused when a meeting ends at the exact time the next one starts.

- Input: a list of \`[start, end]\` pairs with \`start < end\`, length 0 to 100,000.
- Output: the number of rooms.
- Aim for O(n log n) time (sort the starts and ends, or use a heap of end times). A hidden test uses 100,000 meetings, so counting overlaps for every meeting will time out.

Example: \`min_rooms([[0, 30], [5, 10], [15, 20]])\` is \`2\`.`,
        starter: R`def min_rooms(meetings):
    # your code here
    pass

print(min_rooms([[0, 30], [5, 10], [15, 20]]))  # 2
`,
        solution: R`def min_rooms(meetings):
    starts = sorted(s for s, e in meetings)
    ends = sorted(e for s, e in meetings)
    rooms = 0
    j = 0
    for s in starts:
        if s < ends[j]:
            rooms += 1
        else:
            j += 1
    return rooms
`,
        tests: [
          { name: 'Example', code: R`assert min_rooms([[0, 30], [5, 10], [15, 20]]) == 2, '[5,10] and [15,20] can share a room, [0,30] needs another'` },
          { name: 'No overlap', code: R`assert min_rooms([[7, 10], [2, 4]]) == 1, 'One room is enough'` },
          { name: 'Back to back', code: R`assert min_rooms([[1, 5], [5, 9]]) == 1, 'A meeting starting at 5 can use the room freed at 5'` },
          { name: 'Empty and all at once', code: R`assert min_rooms([]) == 0 and min_rooms([[1, 4], [1, 4], [1, 4]]) == 3, 'No meetings need 0 rooms; three identical meetings need 3'` },
          { name: 'Large input (100,000 meetings)', code: R`meetings = [[i, i + 50000] for i in range(100000)]
assert min_rooms(meetings) == 50000, 'At any time at most 50,000 meetings overlap; count overlaps with a sweep, not pairwise'` }
        ]
      },
      {
        id: 'cb-min-taps', title: 'Fewest taps to water a garden', level: 'hard',
        prompt: `A garden is the line from \`0\` to \`n\`. There is a tap at every integer position \`0..n\`; the tap at position \`i\` waters the segment \`[i - ranges[i], i + ranges[i]]\`.

Write \`min_taps(n, ranges)\` that returns the fewest taps to open so the whole segment \`[0, n]\` is watered, or \`-1\` if that is impossible.

- Input: an integer \`n\` from 0 to 100,000 and a list \`ranges\` of \`n + 1\` non-negative integers.
- Output: the smallest number of taps, or \`-1\`.
- Aim for O(n) or O(n log n) time. A hidden test uses \`n = 100000\`, so trying all combinations or an O(n²) search will time out.

Example: \`min_taps(5, [3, 4, 1, 1, 0, 0])\` is \`1\` (the tap at position 1 waters \`[-3, 5]\`).`,
        starter: R`def min_taps(n, ranges):
    # your code here
    pass

print(min_taps(5, [3, 4, 1, 1, 0, 0]))  # 1
`,
        solution: R`def min_taps(n, ranges):
    reach = [0] * (n + 1)
    for i, r in enumerate(ranges):
        left = max(0, i - r)
        reach[left] = max(reach[left], min(n, i + r))
    taps = 0
    end = 0
    far = 0
    for i in range(n):
        far = max(far, reach[i])
        if i == end:
            if far <= i:
                return -1
            taps += 1
            end = far
    return taps
`,
        tests: [
          { name: 'Example', code: R`assert min_taps(5, [3, 4, 1, 1, 0, 0]) == 1, 'One tap at position 1 covers everything'` },
          { name: 'Impossible', code: R`assert min_taps(3, [0, 0, 0, 0]) == -1, 'Taps with range 0 water nothing'` },
          { name: 'Several taps', code: R`assert min_taps(7, [1, 2, 1, 0, 2, 1, 0, 1]) == 3, 'Expected 3 taps'` },
          { name: 'Tiny garden', code: R`assert min_taps(0, [0]) == 0 and min_taps(1, [0, 1]) == 1, 'A garden of length 0 needs no taps; length 1 needs one'` },
          { name: 'Large input (n = 100,000)', code: R`n = 100000
assert min_taps(n, [1] * (n + 1)) == 50000, 'Each tap covers length 2, so 50,000 taps cover 100,000'` }
        ]
      }
    ],
    quiz: [
      { q: 'What is almost always the first step in an interval problem?', options: ['Build a graph', 'Sort the intervals (usually by start)', 'Use recursion', 'Hash the endpoints'], answer: 1, why: 'Sorted order puts neighbouring overlaps next to each other, so one pass is enough.', level: 'easy' },
      { q: 'What is a greedy algorithm?', options: ['It tries every possibility', 'It makes the locally best choice at each step and never revisits it', 'It always uses recursion', 'It always sorts descending'], answer: 1, why: 'Greedy works when local choices can be proved to lead to a global optimum.', level: 'easy' },
      { q: 'Sorting n intervals and sweeping once costs…', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 1, why: 'The sort dominates; the sweep is linear.', level: 'easy' },
      { q: 'When are sorted intervals [a, b] and [c, d] (with a <= c) merged into one?', options: ['When c <= b', 'When c > b', 'When d == b', 'Never'], answer: 0, why: 'The next interval starts before or at the current end, so they share a point.', level: 'easy' },
      { q: 'To keep the maximum number of non-overlapping intervals, which sort order does the greedy use?', options: ['By start time', 'By end time (earliest finish first)', 'By length', 'Random'], answer: 1, why: 'Finishing earliest leaves the most room for the rest.', level: 'medium' },
      { q: 'When merging, you extend the last merged interval with end = max(last_end, new_end). Why max?', options: ['The new interval could lie entirely inside the last one', 'To sort the ends', 'To avoid duplicates', 'Because ends are always larger'], answer: 0, why: 'For [1,10] followed by [2,3], using 3 would shrink the interval.', level: 'medium' },
      { q: 'How does the sorted starts and ends sweep find the minimum meeting rooms?', options: ['If the next start is before the earliest remaining end, add a room; otherwise reuse one', 'It sorts by length', 'It uses recursion', 'It builds a graph'], answer: 0, why: 'A meeting that starts before any room frees up needs a new room.', level: 'medium' },
      { q: 'In "assign cookies", which greedy is right?', options: ['Give the biggest cookie to the greediest child', 'Give each child the smallest cookie that satisfies them, moving through both sorted lists', 'Give cookies in random order', 'Give every child the biggest cookie left'], answer: 1, why: 'Wasting a big cookie on a small appetite can leave a greedier child unserved.', level: 'medium' },
      { q: 'Why does sorting by start time fail for "maximum number of non-overlapping intervals"?', options: ['A long interval that starts first can block many short ones, e.g. [1,10], [2,3], [4,5]', 'Start times are never sorted', 'It always works', 'It only fails for equal starts'], answer: 0, why: 'Taking [1,10] first allows only one interval, while [2,3] and [4,5] allow two.', level: 'hard' },
      { q: 'Coins [1, 3, 4] and amount 6. The greedy "largest coin first" gives 4 + 1 + 1. What is the lesson?', options: ['Greedy is always best', 'Greedy can fail without a proof (exchange argument); here 3 + 3 uses fewer coins, so dynamic programming is needed', 'Use smaller coins first', 'Coins must be sorted ascending'], answer: 1, why: 'A greedy rule needs a proof or you must find a counterexample.', level: 'hard' },
      { q: 'Minimum meeting rooms with a heap of end times: what is the complexity, and what edge case matters?', options: ['O(n log n); a meeting that starts exactly when another ends can reuse the room', 'O(n); touching meetings need separate rooms', 'O(n²); there is no edge case', 'O(log n); only empty input matters'], answer: 0, why: 'Sorting and heap operations are O(n log n); use start >= earliest end when popping.', level: 'hard' },
      { q: 'In the watering-garden problem, each position is first turned into the farthest right point reachable from each left edge. Why does that give O(n)?', options: ['Each tap is looked at once and then a single sweep jumps to the farthest reach, like jump game', 'It sorts the taps by range', 'It uses binary search', 'It tries all subsets'], answer: 0, why: 'After bucketing by left edge, one pass picks the farthest-reaching tap at each step.', level: 'hard' }
    ],
    interview: [
      { q: 'Walk me through merging overlapping intervals and give the complexity.', level: 'easy', points: [['Sort by start', ['sort', 'start']], ['Compare each interval with the last merged one', ['last', 'compare', 'previous', 'current']], ['If start is at most the last end, extend the end with max', ['max', 'extend', 'overlap', 'merge']], ['Otherwise start a new interval; O(n log n) time', ['new interval', 'append', 'o(n log n)', 'n log n']]], model: 'First I sort the intervals by start time. Then I walk through them, keeping a list of merged intervals. For each interval, if its start is at or before the end of the last merged interval, they overlap, so I extend the last end to the maximum of the two ends. I use max because the new interval can sit entirely inside the old one. Otherwise I start a new merged interval. The sort costs n log n and the sweep is linear, so the total is n log n time, and the output takes linear extra space.' },
      { q: 'How do you compute the minimum number of meeting rooms? Compare two approaches.', level: 'medium', points: [['Brute force compares every pair, O(n²)', ['o(n^2)', 'o(n²)', 'every pair', 'quadratic']], ['Min-heap of end times: pop the earliest end if it is free', ['heap', 'priority queue', 'end times', 'earliest end']], ['Sorted starts and ends with two pointers, or a sweep line of events', ['two pointers', 'sweep', 'events', 'sorted starts']], ['Both O(n log n); touching meetings can share a room', ['o(n log n)', 'n log n', 'touching', 'same time', 'back to back']]], model: 'The brute force checks every pair for overlap, which is quadratic. A better way is to sort by start and keep a min-heap of end times: if the earliest ending meeting is over by the time the next one starts, I reuse that room by popping it, then I push the new end. The heap size is the number of rooms. Another way is to sort starts and ends separately and sweep with two pointers, adding a room only when a start comes before the earliest end. Both are n log n. I make sure a meeting starting exactly at an end time can reuse the room.' },
      { q: 'Why does picking the interval that ends earliest give the maximum number of non-overlapping intervals?', level: 'medium', points: [['Sort by end time and pick greedily', ['sort', 'end time', 'earliest end', 'earliest finish']], ['An exchange argument: swapping any optimal first choice for the earliest end never hurts', ['exchange', 'swap', 'replace', 'proof']], ['It leaves the most room for the remaining intervals', ['room', 'most space', 'leaves']], ['Sorting by start or by length fails on counterexamples', ['counterexample', 'start time', 'length', 'fails']]], model: 'I sort by end time and take each interval that does not overlap the last one I kept. The reason it works is an exchange argument: in any optimal solution, if the first interval is not the one that ends earliest, I can swap it for the earliest-ending interval without causing any new overlap, because that one finishes sooner. So some optimal answer starts with the earliest end, and I can repeat the argument on the rest. Sorting by start time fails: one long interval that starts first can block many short ones. Sorting by length also has counterexamples.' },
      { q: 'How do you decide between a greedy solution and dynamic programming, and how do you convince an interviewer that a greedy is correct?', level: 'hard', points: [['Greedy needs the greedy-choice property and optimal substructure', ['greedy choice', 'optimal substructure', 'property']], ['Try to find a counterexample on small inputs first', ['counterexample', 'small input', 'brute force']], ['Prove it with an exchange argument or a stay-ahead argument', ['exchange', 'stay ahead', 'proof', 'prove']], ['If choices interact or values vary, use dynamic programming, e.g. coin change with arbitrary coins', ['dynamic programming', 'dp', 'coin', 'knapsack']], ['Compare costs: greedy is usually O(n log n), dp may be O(n·m)', ['o(n log n)', 'cost', 'complexity', 'faster']]], model: 'Greedy works when a locally best choice never prevents a globally best answer. I first try to break it: I think of small inputs and compare against brute force. Coin change with coins one, three and four and amount six breaks the largest-coin rule. If I cannot break it, I give an exchange argument: take any optimal solution and show I can swap its first choice for the greedy choice without making it worse. If choices interact, as in knapsack, I use dynamic programming instead. Greedy is usually n log n because of sorting, while dynamic programming can cost more time and memory.' }
    ]
  }
];
