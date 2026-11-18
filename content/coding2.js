const R = String.raw;

const TREE = R`from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(vals):
    """Build a binary tree from a level-order list; None marks a missing child."""
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    queue = deque([root])
    i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root

`;

export default [
  {
    id: 'pat-trees', title: 'Pattern: trees and recursion', group: 'coding',
    uses: [
      'File systems and the browser DOM are trees; tools that search, copy or size a folder walk them recursively, node by node',
      'Database indexes (B-trees) and decision-tree models answer a query by descending from the root, so lookups cost the height of the tree rather than the number of items'
    ],
    tasks: [
      {
        id: 'cb-trees-depth', title: 'Maximum depth', level: 'easy',
        prompt: `Write \`max_depth(root)\` that returns the number of nodes on the longest path from the root down to a leaf.

- \`root\` is a \`TreeNode\` (or \`None\` for an empty tree).
- An empty tree has depth 0; a single node has depth 1.
- The tree has up to 50,000 nodes and is not extremely lopsided.

Example: \`build_tree([3, 9, 20, None, None, 15, 7])\` has depth 3.`,
        starter: TREE + R`def max_depth(root):
    # your code here
    pass

print(max_depth(build_tree([3, 9, 20, None, None, 15, 7])))
`,
        solution: TREE + R`def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
`,
        tests: [
          { name: 'Empty tree', code: R`assert max_depth(None) == 0, 'An empty tree has depth 0'` },
          { name: 'Single node', code: R`assert max_depth(build_tree([1])) == 1, 'A single node has depth 1'` },
          { name: 'Example tree', code: R`assert max_depth(build_tree([3, 9, 20, None, None, 15, 7])) == 3, 'Expected 3 for [3, 9, 20, None, None, 15, 7]'` },
          { name: 'Lopsided tree', code: R`assert max_depth(build_tree([1, None, 2, None, 3, None, 4])) == 4, 'A chain of four nodes has depth 4'` },
          { name: 'Large complete tree', code: R`assert max_depth(build_tree(list(range(1, 2**15)))) == 15, 'A complete tree with 32767 nodes has depth 15'` }
        ]
      },
      {
        id: 'cb-trees-has-path-sum', title: 'Root-to-leaf sum', level: 'easy',
        prompt: `Write \`has_path_sum(root, target)\` that returns \`True\` if some path from the root down to a **leaf** has node values adding up to \`target\`.

- A leaf is a node with no children. A path that stops at a node that still has a child does not count.
- Values may be negative or zero.
- An empty tree has no path, so the answer is \`False\`.

Example: in \`build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1])\`, the path 5, 4, 11, 2 sums to 22, so \`has_path_sum(tree, 22)\` is \`True\`.`,
        starter: TREE + R`def has_path_sum(root, target):
    # your code here
    return False

print(has_path_sum(build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1]), 22))
`,
        solution: TREE + R`def has_path_sum(root, target):
    if root is None:
        return False
    if root.left is None and root.right is None:
        return root.val == target
    rest = target - root.val
    return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)
`,
        tests: [
          { name: 'Example path exists', code: R`t = build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1])
assert has_path_sum(t, 22) is True, 'The path 5, 4, 11, 2 sums to 22'` },
          { name: 'No such path', code: R`t = build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1])
assert has_path_sum(t, 100) is False, 'No root-to-leaf path sums to 100'` },
          { name: 'Must end at a leaf', code: R`assert has_path_sum(build_tree([1, 2]), 1) is False, 'The root has a child, so the path 1 alone does not end at a leaf'` },
          { name: 'Empty tree', code: R`assert has_path_sum(None, 0) is False, 'An empty tree has no path, even for target 0'` },
          { name: 'Negative values', code: R`assert has_path_sum(build_tree([-2, None, -3]), -5) is True, 'The path -2, -3 sums to -5'` }
        ]
      },
      {
        id: 'cb-trees-validate-bst', title: 'Is it a binary search tree?', level: 'medium',
        prompt: `Write \`is_valid_bst(root)\` that returns \`True\` if the tree is a valid binary search tree.

- For every node, **all** values in its left subtree are strictly smaller and **all** values in its right subtree are strictly larger.
- Duplicates are not allowed, so equal values make the tree invalid.
- An empty tree is valid. The tree has up to 50,000 nodes and depth under 800.

Example: \`[2, 1, 3]\` is valid; \`[5, 1, 4, None, None, 3, 6]\` is not, because 3 sits in the right subtree of 5.`,
        starter: TREE + R`def is_valid_bst(root):
    # your code here
    return True

print(is_valid_bst(build_tree([5, 1, 4, None, None, 3, 6])))
`,
        solution: TREE + R`def is_valid_bst(root):
    def check(node, low, high):
        if node is None:
            return True
        if (low is not None and node.val <= low) or (high is not None and node.val >= high):
            return False
        return check(node.left, low, node.val) and check(node.right, node.val, high)
    return check(root, None, None)
`,
        tests: [
          { name: 'Simple valid tree', code: R`assert is_valid_bst(build_tree([2, 1, 3])) is True, '[2, 1, 3] is a valid BST'` },
          { name: 'Wrong child', code: R`assert is_valid_bst(build_tree([5, 1, 4, None, None, 3, 6])) is False, '4 is smaller than the root 5 but sits on its right'` },
          { name: 'Deep violation', code: R`assert is_valid_bst(build_tree([5, 4, 6, None, None, 3, 7])) is False, '3 is in the right subtree of 5, so it must be larger than 5'` },
          { name: 'Duplicates', code: R`assert is_valid_bst(build_tree([2, 2, 2])) is False, 'Equal values are not allowed'` },
          { name: 'Empty and single', code: R`assert is_valid_bst(None) is True and is_valid_bst(build_tree([7])) is True, 'An empty tree and a single node are valid'` }
        ]
      },
      {
        id: 'cb-trees-max-path-sum', title: 'Best path sum', level: 'medium',
        prompt: `Write \`max_path_sum(root)\` that returns the largest sum of any path in the tree.

- A path is a chain of connected nodes that goes along parent-child links. It may start and end at any node and does not have to pass through the root, but each node appears at most once.
- It must contain at least one node. Values can be negative.
- The tree has up to 30,000 nodes and depth under 800.

Example: \`build_tree([-10, 9, 20, None, None, 15, 7])\` gives 42 (the path 15, 20, 7).`,
        starter: TREE + R`def max_path_sum(root):
    # your code here
    return root.val

print(max_path_sum(build_tree([-10, 9, 20, None, None, 15, 7])))
`,
        solution: TREE + R`def max_path_sum(root):
    best = [root.val]

    def down(node):
        # best sum of a chain that starts at node and goes downwards
        if node is None:
            return 0
        left = max(down(node.left), 0)
        right = max(down(node.right), 0)
        best[0] = max(best[0], node.val + left + right)
        return node.val + max(left, right)

    down(root)
    return best[0]
`,
        tests: [
          { name: 'Small tree', code: R`assert max_path_sum(build_tree([1, 2, 3])) == 6, '2 + 1 + 3 = 6'` },
          { name: 'Path avoids the root', code: R`assert max_path_sum(build_tree([-10, 9, 20, None, None, 15, 7])) == 42, 'The path 15, 20, 7 sums to 42'` },
          { name: 'Single negative node', code: R`assert max_path_sum(build_tree([-3])) == -3, 'The path must contain at least one node'` },
          { name: 'All negative', code: R`assert max_path_sum(build_tree([-2, -1])) == -1, 'Pick the single best node, -1'` },
          { name: 'Bend in the middle', code: R`assert max_path_sum(build_tree([1, -2, 3, 4, 5, -6, 2])) == 9, 'The path 5, -2, 1, 3, 2 sums to 9; a negative node in the middle can still be worth crossing'` }
        ]
      },
      {
        id: 'cb-trees-rob-tree', title: 'Robbing a tree of houses', level: 'hard',
        prompt: `Houses form a binary tree and each node holds the money in one house. Two houses that are directly linked (parent and child) have an alarm: you cannot take both.

Write \`rob(root)\` that returns the maximum money you can take.

- Values are non-negative integers; an empty tree gives 0.
- The tree can hold up to 70,000 nodes.
- A solution that re-solves the same subtrees many times will be far too slow on a large tree.

Example: \`build_tree([3, 2, 3, None, 3, None, 1])\` gives 7 (take 3 + 3 + 1).`,
        starter: TREE + R`def rob(root):
    # your code here
    return 0

print(rob(build_tree([3, 2, 3, None, 3, None, 1])))
`,
        solution: TREE + R`def rob(root):
    def go(node):
        # returns (best if node is taken, best if node is skipped)
        if node is None:
            return (0, 0)
        l_take, l_skip = go(node.left)
        r_take, r_skip = go(node.right)
        take = node.val + l_skip + r_skip
        skip = max(l_take, l_skip) + max(r_take, r_skip)
        return (take, skip)
    return max(go(root))
`,
        tests: [
          { name: 'Example', code: R`assert rob(build_tree([3, 2, 3, None, 3, None, 1])) == 7, 'Take 3 (root), 3 and 1 for 7'` },
          { name: 'Skip the root', code: R`assert rob(build_tree([3, 4, 5, 1, 3, None, 1])) == 9, 'Take 4 + 5 for 9, not the root'` },
          { name: 'Empty tree', code: R`assert rob(None) == 0, 'An empty tree gives 0'` },
          { name: 'Chain', code: R`assert rob(build_tree([2, 1, None, 7, None, 1])) == 9, 'In the chain 2, 1, 7, 1 take 2 and 7 for 9'` },
          { name: 'Large complete tree', code: R`assert rob(build_tree([1] * (2**16 - 1))) == 43690, 'A complete tree of 65535 ones: take every second level from the leaves up, 43690. A solution that re-solves subtrees is too slow here'` }
        ]
      },
      {
        id: 'cb-trees-lca-queries', title: 'Many ancestor queries', level: 'hard',
        prompt: `Write \`lca_queries(root, queries)\` where every node value in the tree is distinct and \`queries\` is a list of \`(a, b)\` pairs of values that exist in the tree. Return a list with the value of the **lowest common ancestor** of each pair.

- The lowest common ancestor of \`a\` and \`b\` is the deepest node that has both of them in its subtree. A node counts as its own descendant, so the answer for \`(5, 5)\` is 5.
- The tree can have up to 70,000 nodes and there can be up to 20,000 queries.
- Searching the whole tree afresh for every query is too slow.

Example: in \`build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])\`, the pair \`(6, 4)\` gives 5 and the pair \`(5, 1)\` gives 3.`,
        starter: TREE + R`def lca_queries(root, queries):
    # your code here
    return []

t = build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
print(lca_queries(t, [(6, 4), (5, 1)]))
`,
        solution: TREE + R`def lca_queries(root, queries):
    parent = {root.val: None}
    depth = {root.val: 0}
    queue = deque([root])
    while queue:
        node = queue.popleft()
        for child in (node.left, node.right):
            if child is not None:
                parent[child.val] = node.val
                depth[child.val] = depth[node.val] + 1
                queue.append(child)
    result = []
    for a, b in queries:
        while depth[a] > depth[b]:
            a = parent[a]
        while depth[b] > depth[a]:
            b = parent[b]
        while a != b:
            a = parent[a]
            b = parent[b]
        result.append(a)
    return result
`,
        tests: [
          { name: 'Example queries', code: R`t = build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
assert lca_queries(t, [(6, 4), (5, 1), (7, 4), (0, 8)]) == [5, 3, 2, 1], 'Expected [5, 3, 2, 1]'` },
          { name: 'Node is its own ancestor', code: R`t = build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
assert lca_queries(t, [(5, 4), (5, 5), (3, 7)]) == [5, 5, 3], 'An ancestor of the other node (or the node itself) is the answer'` },
          { name: 'Single node', code: R`assert lca_queries(build_tree([9]), [(9, 9)]) == [9], 'One node: the answer is that node'` },
          { name: 'Large tree, many queries', code: R`import random
random.seed(7)
n = 2**16 - 1
t = build_tree(list(range(1, n + 1)))
qs = [(random.randint(1, n), random.randint(1, n)) for _ in range(20000)]
def expect(a, b):
    while a != b:
        if a > b:
            a //= 2
        else:
            b //= 2
    return a
assert lca_queries(t, qs) == [expect(a, b) for a, b in qs], 'Wrong answer on a large tree (or too slow: do not search the tree again for every query)'` }
        ]
      }
    ],
    quiz: [
      { q: 'Which traversal of a binary search tree visits the values in sorted order?', options: ['In-order (left, node, right)', 'Pre-order (node, left, right)', 'Post-order (left, right, node)', 'Level-order'], answer: 0, why: 'Everything smaller lies in the left subtree and everything larger in the right, so left, node, right yields ascending order.', level: 'easy' },
      { q: 'In a recursive function on a tree, what is the usual base case?', options: ['The node is the root', 'The node has two children', 'The node is None (or a leaf)', 'The depth equals the height'], answer: 2, why: 'Recursion stops when it walks off the tree, which is a missing child, so every call can assume it has a real node.', level: 'easy' },
      { q: 'What is the time complexity of visiting every node of a binary tree with n nodes once?', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], answer: 1, why: 'Each node is entered once and does a constant amount of work.', level: 'easy' },
      { q: 'Which structure does an iterative level-order traversal use?', options: ['A stack', 'A queue', 'A heap', 'A hash set'], answer: 1, why: 'A first-in, first-out queue processes all nodes of one level before the next level.', level: 'easy' },
      { q: 'A recursive DFS runs on a tree of height h. How much extra space does the call stack use?', options: ['O(1)', 'O(h)', 'O(n) always', 'O(log n) always'], answer: 1, why: 'The stack holds one frame per level on the current path, so it is the height, which is n for a chain and about log n for a balanced tree.', level: 'medium' },
      { q: 'A validity check for a BST compares each node only with its direct children. What goes wrong?', options: ['It is too slow', 'It misses a deeper node that breaks the rule for an ancestor', 'It rejects valid trees', 'It cannot handle the empty tree'], answer: 1, why: 'The rule applies to the whole subtree, so you must pass down lower and upper bounds from the ancestors.', level: 'medium' },
      { q: 'You need each node’s answer to depend on the answers for its children. Which traversal order fits?', options: ['Pre-order', 'Post-order', 'Reverse level-order only', 'Any order works the same'], answer: 1, why: 'Post-order handles both children before the node, so their results are ready when you combine them.', level: 'medium' },
      { q: 'Why does the tree house-robber problem return a pair (take, skip) from each call?', options: ['To print both answers', 'To avoid re-solving the grandchildren, keeping the cost at O(n)', 'Because Python needs tuples', 'To handle negative values'], answer: 1, why: 'Returning both states lets the parent combine them directly, instead of calling the same subtrees again, which would be exponential.', level: 'medium' },
      { q: 'A tree of 200,000 nodes is a single long chain and you use plain recursion in Python. What happens?', options: ['It works, O(n)', 'It raises RecursionError, so use an explicit stack or a loop', 'It runs in O(log n)', 'Python grows the stack automatically'], answer: 1, why: 'The default limit is about 1000 frames, so a depth of 200,000 fails; an iterative DFS with your own stack avoids it.', level: 'hard' },
      { q: 'In the maximum path sum problem, what should a recursive call return to its parent?', options: ['The best path through this node using both children', 'The best downward chain starting at this node, using at most one child', 'The sum of the whole subtree', 'The maximum value in the subtree'], answer: 1, why: 'A path that bends at this node cannot continue up to the parent, so only a one-sided chain is extended; the two-sided sum updates a global best.', level: 'hard' },
      { q: 'About how large does the queue get in a BFS over a complete binary tree with n nodes?', options: ['O(1)', 'O(log n)', 'O(n), roughly half the nodes at the widest level', 'O(n²)'], answer: 2, why: 'The last level holds about n/2 nodes, so a breadth-first queue can be linear while a depth-first stack stays logarithmic.', level: 'hard' },
      { q: 'Finding the lowest common ancestor of two values in a BST is easier than in a general tree because:', options: ['BSTs are always balanced', 'You can walk down from the root and stop where the values split to different sides', 'You can use hashing', 'It needs no recursion at all'], answer: 1, why: 'Comparing against the node value tells you which way both targets lie, so the first node where they diverge is the answer in O(h).', level: 'hard' }
    ],
    interview: [
      { q: 'How do you decide between recursion and an iterative approach for a tree problem?', level: 'easy', points: [['Recursion is the natural fit for tree shapes', ['natural', 'recurs', 'simple', 'readable']], ['Deep trees can overflow the call stack', ['stack', 'overflow', 'depth', 'limit']], ['An explicit stack or queue replaces the call stack', ['explicit', 'own stack', 'queue', 'iterative']], ['Space is height for DFS, width for BFS', ['height', 'width', 'space']]], model: 'Recursion mirrors the shape of a tree, so I start there: handle the empty node, solve the two subtrees, combine. The risk is depth. In Python the limit is around a thousand frames, so a skewed tree with hundreds of thousands of nodes needs an explicit stack for depth-first work, or a queue for level order. I also remember the space cost: a depth-first walk needs space proportional to the height, while a breadth-first walk needs space proportional to the widest level.' },
      { q: 'Explain how you would check that a binary tree is a valid binary search tree.', level: 'medium', points: [['Compare against bounds, not only the parent', ['bound', 'range', 'min', 'max', 'low', 'high']], ['Pass bounds down, tightening them on each side', ['down', 'tighten', 'left', 'right']], ['Or check that in-order is strictly increasing', ['in-order', 'inorder', 'sorted', 'increasing']], ['O(n) time, O(h) space', ['o(n)', 'o(h)', 'linear', 'height']]], model: 'The tempting mistake is to compare each node only with its children. That misses a value deep in a subtree that breaks an ancestor’s rule. Instead I carry a lower and an upper bound down the recursion. Going left, the current value becomes the new upper bound; going right, it becomes the lower bound. Every node must lie strictly between its bounds. An alternative is an in-order walk that checks each value is larger than the previous one. Both visit each node once, so O(n) time and O(h) space, and I would ask whether duplicates are allowed.' },
      { q: 'Walk me through the maximum path sum problem and its complexity.', level: 'hard', points: [['Post-order: compute children first', ['post-order', 'postorder', 'children first', 'bottom']], ['Return the best one-sided chain to the parent', ['one side', 'one-sided', 'chain', 'downward', 'single branch']], ['Update a global answer with both sides at each node', ['global', 'both', 'bend', 'update']], ['Ignore negative branches, O(n) time', ['negative', 'zero', 'o(n)', 'linear']]], model: 'I solve it bottom-up. For each node I compute the best downward chain from the left child and from the right child, and I clamp negatives to zero because skipping a bad branch is always allowed. The best path that bends at this node is its value plus both clamped chains, and I use that to update a global maximum. But to the parent I can only return the node value plus the better single side, since a path cannot fork upwards. Each node is visited once, so O(n) time and O(h) space. The edge case is an all-negative tree, so I initialise the best with the root value, not zero.' },
      { q: 'You get a tree problem where the same subtrees seem to be solved many times. What do you do?', level: 'hard', points: [['Notice the overlap, for example parent and grandchild calls', ['overlap', 'repeat', 'same subtree', 'grandchild']], ['Return extra state from each call (tree DP)', ['pair', 'tuple', 'state', 'two values', 'dp']], ['Or memoise by node', ['memo', 'cache', 'dictionary']], ['Turns exponential into O(n)', ['exponential', 'o(n)', 'linear']]], model: 'That is a sign of tree dynamic programming. In the house robber on a tree, a naive recursion calls the grandchildren from the parent and again from the children, which grows exponentially with depth. The fix is to make each call return everything the parent needs, here a pair: best when this node is taken and best when it is skipped. The parent then combines two pairs in constant time. Memoising by node works too, but returning state is leaner and avoids a dictionary. The result is O(n) time and O(h) space, and I would test it on a complete tree with tens of thousands of nodes to confirm it is fast.' }
    ]
  },
  {
    id: 'pat-graphs', title: 'Pattern: graphs: BFS, DFS, topological sort, union-find', group: 'coding',
    uses: [
      'Build systems and package managers sort tasks and dependencies topologically, so a library is always built after the libraries it needs, and a cycle is reported as an error',
      'Social networks and network monitoring use union-find and BFS to group connected accounts or machines and to count the hops between two of them'
    ],
    tasks: [
      {
        id: 'cb-graphs-count-islands', title: 'Count the islands', level: 'easy',
        prompt: `Write \`count_islands(grid)\`. \`grid\` is a list of equal-length strings made of \`'1'\` (land) and \`'0'\` (water).

- An island is a group of land cells connected up, down, left or right (not diagonally).
- Return how many islands there are. An empty grid has 0.
- The grid can be up to 300 by 300, so a fully land grid is one huge island. Plain recursion would be too deep.

Example: \`["11000", "11000", "00100", "00011"]\` has 3 islands.`,
        starter: R`def count_islands(grid):
    # your code here
    return 0

print(count_islands(["11000", "11000", "00100", "00011"]))
`,
        solution: R`def count_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1' and not seen[r][c]:
                count += 1
                seen[r][c] = True
                stack = [(r, c)]
                while stack:
                    y, x = stack.pop()
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == '1' and not seen[ny][nx]:
                            seen[ny][nx] = True
                            stack.append((ny, nx))
    return count
`,
        tests: [
          { name: 'Example grid', code: R`assert count_islands(["11000", "11000", "00100", "00011"]) == 3, 'Expected 3 islands'` },
          { name: 'Empty grid', code: R`assert count_islands([]) == 0, 'An empty grid has no islands'` },
          { name: 'All water', code: R`assert count_islands(["000", "000"]) == 0, 'No land means no islands'` },
          { name: 'Diagonals do not connect', code: R`grid = ["10" * 20 if i % 2 == 0 else "01" * 20 for i in range(40)]
assert count_islands(grid) == 800, 'A checkerboard of 1600 land cells has 800 separate islands because diagonals do not join'` },
          { name: 'Huge single island', code: R`assert count_islands(["1" * 200] * 200) == 1, 'A 200 by 200 grid of land is one island (avoid deep recursion)'` }
        ]
      },
      {
        id: 'cb-graphs-hops', title: 'Fewest hops', level: 'easy',
        prompt: `Write \`fewest_hops(n, edges, src, dst)\`. The graph has \`n\` nodes numbered \`0\` to \`n - 1\` and undirected edges given as pairs \`(a, b)\`.

- Return the smallest number of edges on a path from \`src\` to \`dst\`.
- Return \`0\` if they are the same node and \`-1\` if there is no path.
- \`n\` can be up to 100,000.

Example: with \`n = 6\` and edges \`[(0,1),(1,2),(0,3),(3,4),(4,2),(2,5)]\`, the answer from 0 to 5 is 3 (0, 1, 2, 5).`,
        starter: R`def fewest_hops(n, edges, src, dst):
    # your code here
    return -1

print(fewest_hops(6, [(0, 1), (1, 2), (0, 3), (3, 4), (4, 2), (2, 5)], 0, 5))
`,
        solution: R`from collections import deque

def fewest_hops(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    dist = [-1] * n
    dist[src] = 0
    queue = deque([src])
    while queue:
        node = queue.popleft()
        if node == dst:
            return dist[node]
        for nxt in adj[node]:
            if dist[nxt] == -1:
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return -1
`,
        tests: [
          { name: 'Example', code: R`assert fewest_hops(6, [(0, 1), (1, 2), (0, 3), (3, 4), (4, 2), (2, 5)], 0, 5) == 3, 'The shortest route is 0, 1, 2, 5 which is 3 hops'` },
          { name: 'Same node', code: R`assert fewest_hops(3, [(0, 1)], 2, 2) == 0, 'A node is zero hops from itself'` },
          { name: 'Not connected', code: R`assert fewest_hops(4, [(0, 1), (2, 3)], 0, 3) == -1, 'There is no path between the two components'` },
          { name: 'Ring', code: R`assert fewest_hops(5, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 0)], 0, 3) == 2, 'Going backwards round the ring takes 2 hops'` },
          { name: 'Long chain', code: R`n = 50000
edges = [(i, i + 1) for i in range(n - 1)]
assert fewest_hops(n, edges, 0, n - 1) == n - 1, 'A chain of 50000 nodes needs 49999 hops (avoid recursion)'` }
        ]
      },
      {
        id: 'cb-graphs-course-order', title: 'Course schedule', level: 'medium',
        prompt: `There are \`n\` courses numbered \`0\` to \`n - 1\`. Each pair \`(a, b)\` in \`prereqs\` means you must finish course \`b\` before course \`a\`.

Write \`course_order(n, prereqs)\` that returns a list of all \`n\` courses in an order that respects every pair, or an empty list \`[]\` if no such order exists (because of a cycle).

- Any valid order is accepted.
- \`n\` can be up to 50,000 with up to 100,000 pairs.

Example: \`course_order(4, [(1, 0), (2, 0), (3, 1), (3, 2)])\` can return \`[0, 1, 2, 3]\`.`,
        starter: R`def course_order(n, prereqs):
    # your code here
    return list(range(n))

print(course_order(4, [(1, 0), (2, 0), (3, 1), (3, 2)]))
`,
        solution: R`from collections import deque

def course_order(n, prereqs):
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in prereqs:
        adj[b].append(a)
        indegree[a] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in adj[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == n else []
`,
        tests: [
          { name: 'Diamond', code: R`def valid(order, n, pre):
    if sorted(order) != list(range(n)):
        return False
    pos = {c: i for i, c in enumerate(order)}
    return all(pos[b] < pos[a] for a, b in pre)
pre = [(1, 0), (2, 0), (3, 1), (3, 2)]
assert valid(course_order(4, pre), 4, pre), 'The order must list every course once, with prerequisites first'` },
          { name: 'Cycle', code: R`assert course_order(2, [(0, 1), (1, 0)]) == [], 'Two courses that need each other cannot be ordered: return []'` },
          { name: 'No prerequisites', code: R`assert sorted(course_order(3, [])) == [0, 1, 2], 'With no pairs every course appears once'` },
          { name: 'Self dependency', code: R`assert course_order(1, [(0, 0)]) == [], 'A course that needs itself is a cycle'` },
          { name: 'Long chain', code: R`n = 20000
pre = [(i + 1, i) for i in range(n - 1)]
assert course_order(n, pre) == list(range(n)), 'A chain has exactly one valid order, 0 to n-1'` }
        ]
      },
      {
        id: 'cb-graphs-redundant-edge', title: 'The edge that closes a cycle', level: 'medium',
        prompt: `Nodes are numbered from 1. The list \`edges\` holds undirected edges \`[a, b]\` that are added one after another.

Write \`first_cycle_edge(edges)\` that returns the first edge, as a list \`[a, b]\`, whose addition connects two nodes that were already connected (so it closes a cycle). Return \`[]\` if no edge does.

- A repeated edge such as \`[1, 2]\` twice also closes a cycle.
- There can be up to 100,000 edges, so checking connectivity with a fresh search after each edge is too slow.

Example: \`[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]\` gives \`[1, 4]\`.`,
        starter: R`def first_cycle_edge(edges):
    # your code here
    return []

print(first_cycle_edge([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]))
`,
        solution: R`def first_cycle_edge(edges):
    parent = {}
    size = {}

    def find(x):
        if x not in parent:
            parent[x] = x
            size[x] = 1
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:
            parent[x], x = root, parent[x]
        return root

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        if size[ra] < size[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        size[ra] += size[rb]
    return []
`,
        tests: [
          { name: 'Triangle', code: R`assert first_cycle_edge([[1, 2], [1, 3], [2, 3]]) == [2, 3], 'The edge [2, 3] closes the triangle'` },
          { name: 'Cycle in the middle', code: R`assert first_cycle_edge([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]) == [1, 4], 'The first cycle is closed by [1, 4]'` },
          { name: 'No cycle', code: R`assert first_cycle_edge([[1, 2], [2, 3], [3, 4]]) == [], 'A path has no cycle: return []'` },
          { name: 'Repeated edge', code: R`assert first_cycle_edge([[1, 2], [3, 4], [1, 2]]) == [1, 2], 'The same edge twice closes a cycle of two'` },
          { name: 'Large graph', code: R`n = 60000
edges = [[i, i + 1] for i in range(1, n)] + [[1, n]]
assert first_cycle_edge(edges) == [1, n], 'The last edge joins the two ends of a long chain'` }
        ]
      },
      {
        id: 'cb-graphs-word-ladder', title: 'Word ladder', level: 'hard',
        prompt: `Write \`ladder_length(begin, end, words)\`. You start at the word \`begin\` and want to reach \`end\`. In each step you change exactly one letter, and every word you step onto must be in the list \`words\` (the start word does not have to be).

- Return the number of words in the shortest sequence, counting both \`begin\` and \`end\`. Return \`0\` if it is impossible.
- All words have the same length (up to 8) and \`begin\` differs from \`end\`.
- \`words\` can hold up to 20,000 words, so comparing every pair of words is too slow.

Example: \`ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])\` is 5 (hit, hot, dot, dog, cog).`,
        starter: R`def ladder_length(begin, end, words):
    # your code here
    return 0

print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))
`,
        solution: R`from collections import deque, defaultdict

def ladder_length(begin, end, words):
    allowed = set(words)
    if end not in allowed:
        return 0
    buckets = defaultdict(list)
    for w in allowed | {begin}:
        for i in range(len(w)):
            buckets[w[:i] + '*' + w[i + 1:]].append(w)
    seen = {begin}
    queue = deque([(begin, 1)])
    while queue:
        word, steps = queue.popleft()
        if word == end:
            return steps
        for i in range(len(word)):
            key = word[:i] + '*' + word[i + 1:]
            for nxt in buckets[key]:
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, steps + 1))
            buckets[key] = []
    return 0
`,
        tests: [
          { name: 'Example', code: R`assert ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]) == 5, 'hit, hot, dot, dog, cog is 5 words'` },
          { name: 'End word missing', code: R`assert ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log"]) == 0, 'The end word must be in the list'` },
          { name: 'One step', code: R`assert ladder_length("ab", "ac", ["ac"]) == 2, 'One letter change gives a sequence of 2 words'` },
          { name: 'Unreachable', code: R`assert ladder_length("aaa", "ccc", ["aab", "abb", "ccc"]) == 0, 'No chain of single changes reaches ccc'` },
          { name: 'Large word list', code: R`from itertools import product
words = [''.join(p) for p in product('abcde', repeat=6)]
assert ladder_length('aaaaaa', 'eeeeee', words) == 7, 'Six letters differ, so the shortest chain has 7 words. Comparing all pairs of 15625 words is too slow: group words by pattern such as "a*cde"'` }
        ]
      },
      {
        id: 'cb-graphs-all-connected', title: 'When is everyone connected?', level: 'hard',
        prompt: `People are numbered \`0\` to \`n - 1\`. Each log entry \`(time, a, b)\` says that \`a\` and \`b\` became friends at that time. Entries come in no particular order. Friendship is mutual and friends of friends are connected.

Write \`all_connected_time(n, logs)\` that returns the earliest time at which everyone is connected to everyone else (directly or through others), or \`-1\` if that never happens.

- If \`n\` is 1, the answer is 0.
- \`n\` can be up to 60,000 and there can be up to 150,000 log entries. Re-running a search after every entry is too slow.

Example: \`all_connected_time(4, [(3, 0, 1), (5, 2, 3), (4, 1, 2)])\` is 5.`,
        starter: R`def all_connected_time(n, logs):
    # your code here
    return -1

print(all_connected_time(4, [(3, 0, 1), (5, 2, 3), (4, 1, 2)]))
`,
        solution: R`def all_connected_time(n, logs):
    if n == 1:
        return 0
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    groups = n
    for time, a, b in sorted(logs):
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
            groups -= 1
            if groups == 1:
                return time
    return -1
`,
        tests: [
          { name: 'Example', code: R`assert all_connected_time(4, [(3, 0, 1), (5, 2, 3), (4, 1, 2)]) == 5, 'The last link that joins the groups happens at time 5'` },
          { name: 'Never connected', code: R`assert all_connected_time(3, [(1, 0, 1)]) == -1, 'Person 2 never gets a friend'` },
          { name: 'One person', code: R`assert all_connected_time(1, []) == 0, 'A single person is already connected to everyone'` },
          { name: 'Unsorted with redundant links', code: R`logs = [(9, 0, 2), (2, 1, 2), (4, 0, 1), (7, 3, 2), (1, 3, 3)]
assert all_connected_time(4, logs) == 7, 'The link (7, 3, 2) is what finally joins person 3'` },
          { name: 'Large input', code: R`import random
random.seed(3)
n = 60000
first = [(i * 7919) % 99991 + 1 for i in range(n - 1)]
logs = [(first[i], i, i + 1) for i in range(n - 1)] + [(first[i] + 200000, i, i + 1) for i in range(0, n - 1, 1)]
random.shuffle(logs)
assert all_connected_time(n, logs) == max(first), 'Expected the largest time among the chain links'` }
        ]
      }
    ],
    quiz: [
      { q: 'Which structure does breadth-first search use to find the fewest edges between two nodes?', options: ['A queue', 'A stack', 'A max-heap', 'A sorted list'], answer: 0, why: 'A queue processes nodes in order of distance, so the first time you reach a node is by a shortest path.', level: 'easy' },
      { q: 'What is the time complexity of BFS or DFS on a graph with V nodes and E edges stored as adjacency lists?', options: ['O(V)', 'O(V + E)', 'O(V * E)', 'O(E log V)'], answer: 1, why: 'Each node is visited once and each edge is looked at once or twice.', level: 'easy' },
      { q: 'A topological order exists for a directed graph only if:', options: ['It is connected', 'It has no cycle', 'It is a tree', 'All edges have weights'], answer: 1, why: 'A cycle would require a node to come before itself, so only acyclic graphs (DAGs) can be ordered.', level: 'easy' },
      { q: 'What two operations does union-find provide?', options: ['push and pop', 'find the group of an item and merge two groups', 'insert and delete the minimum', 'sort and search'], answer: 1, why: 'Find returns a representative of the item’s group and union joins two groups.', level: 'easy' },
      { q: 'In Kahn’s algorithm for topological sort, how do you detect a cycle?', options: ['A node is visited twice', 'The output has fewer than n nodes when the queue empties', 'The queue never empties', 'An edge points to the root'], answer: 1, why: 'Nodes on a cycle never reach in-degree zero, so they are never output.', level: 'medium' },
      { q: 'In BFS, when should you mark a node as visited?', options: ['When you pop it from the queue', 'When you push it onto the queue', 'After finishing all its neighbours', 'Only for the start node'], answer: 1, why: 'Marking on push stops the same node being queued many times, which would waste time and can blow up the queue.', level: 'medium' },
      { q: 'You need the shortest path between two cities where every road has a different length. Plain BFS is wrong because:', options: ['It cannot visit all nodes', 'It minimises the number of edges, not the total weight', 'It needs a recursion limit', 'It only works on trees'], answer: 1, why: 'BFS counts hops; with different weights you need Dijkstra, which uses a priority queue.', level: 'medium' },
      { q: 'A problem asks you to merge groups as pairs arrive and repeatedly ask whether two items are in the same group. Which tool fits best?', options: ['Union-find', 'A max-heap', 'Binary search', 'A trie'], answer: 0, why: 'Union-find answers both merge and same-group questions in almost constant time.', level: 'medium' },
      { q: 'Union-find with path compression and union by size has a cost per operation of about:', options: ['O(n)', 'O(log n) exactly', 'O(alpha(n)), nearly constant', 'O(n log n)'], answer: 2, why: 'The inverse Ackermann function grows so slowly that it is under 5 for any realistic input.', level: 'hard' },
      { q: 'Counting islands on a 1000 by 1000 grid with a recursive DFS in Python fails on an all-land grid because:', options: ['The grid is too wide', 'The recursion depth reaches about a million frames', 'DFS cannot find connected cells', 'Memory for the visited array runs out first'], answer: 1, why: 'A single island makes the recursion as deep as the island is large, so use an explicit stack or BFS.', level: 'hard' },
      { q: 'To detect a cycle in a directed graph with DFS you need more than a visited set because:', options: ['A node reached twice via different paths is not necessarily a cycle; you must track nodes on the current path', 'Directed graphs have no DFS', 'A visited set is enough', 'DFS only works on undirected graphs'], answer: 0, why: 'A diamond reaches a node twice without a cycle, so you need three states: unvisited, on the current path and finished.', level: 'hard' },
      { q: 'A graph has V = 10,000 nodes and E = 20,000 edges. Compared with an adjacency matrix, an adjacency list for BFS uses:', options: ['More memory and the same time', 'Far less memory (about V + E rather than V squared) and faster neighbour scans', 'The same memory', 'Less memory but slower BFS'], answer: 1, why: 'A matrix needs 100 million cells and scanning a row costs V even for a node with 2 neighbours.', level: 'hard' }
    ],
    interview: [
      { q: 'When do you choose BFS and when DFS for a graph problem?', level: 'easy', points: [['BFS for fewest edges or levels', ['shortest', 'fewest', 'level', 'distance', 'layer']], ['DFS for exploring everything, components, cycles, ordering', ['explore', 'component', 'cycle', 'topolog', 'backtrack']], ['Both are O(V + E)', ['v + e', 'v+e', 'linear']], ['Memory differs: queue width versus stack depth', ['memory', 'space', 'queue', 'stack', 'depth']]], model: 'I use BFS when the answer is about the fewest steps, because it explores in layers and the first time it reaches a node is the shortest route in an unweighted graph. I use DFS when I need to explore everything: counting components, detecting cycles, producing a topological order, or backtracking. Both run in O(V plus E). The memory differs: BFS holds a whole frontier, which can be wide, while DFS holds the current path, which can be deep, and in Python I would use an explicit stack for very deep graphs.' },
      { q: 'Explain how topological sort works and how it detects a cycle.', level: 'medium', points: [['Order nodes so every edge points forward', ['before', 'edge', 'dependency', 'forward']], ['Kahn: repeatedly remove nodes with in-degree zero', ['in-degree', 'indegree', 'kahn', 'zero']], ['Or DFS and reverse the finishing order', ['dfs', 'finish', 'reverse', 'post']], ['Fewer nodes than n means a cycle; O(V + E)', ['cycle', 'fewer', 'o(v', 'linear']]], model: 'A topological sort lists the nodes of a directed acyclic graph so that every dependency comes before the things that need it. With Kahn’s algorithm I compute each node’s in-degree, queue the nodes with in-degree zero, and repeatedly pop one, output it and lower its neighbours’ in-degrees, queueing any that reach zero. If the output has fewer than n nodes, the rest sit on a cycle, so no order exists. A DFS version outputs nodes in reverse finishing order. Either way the cost is O(V plus E).' },
      { q: 'What is union-find, and how do path compression and union by size make it fast?', level: 'medium', points: [['Tracks disjoint groups with find and union', ['disjoint', 'group', 'find', 'union', 'component']], ['Each group has a root representative in a parent array', ['parent', 'root', 'representative']], ['Path compression flattens the tree during find', ['compress', 'flatten', 'shortcut']], ['Union by size or rank keeps trees shallow; near constant time', ['size', 'rank', 'shallow', 'alpha', 'ackermann', 'constant']]], model: 'Union-find tracks which items belong to the same group. Each item points to a parent, and a group is a tree whose root is its representative. Find follows parents to the root, and union links one root under the other. Two tricks make it fast: path compression, where find points every node it passes straight at the root, and union by size, where the smaller tree goes under the larger so trees stay shallow. Together they make each operation nearly constant, the inverse Ackermann function. I reach for it when edges arrive over time and I keep asking whether two items are connected, or how many groups remain.' },
      { q: 'You are given a large list of word pairs and need the shortest transformation between two words. How do you keep it from being quadratic?', level: 'hard', points: [['Model words as nodes, one-letter changes as edges', ['node', 'edge', 'graph', 'one letter']], ['Use BFS for the shortest sequence', ['bfs', 'shortest', 'breadth']], ['Group words by wildcard patterns to find neighbours', ['pattern', 'wildcard', 'bucket', 'group', 'hash']], ['Cost about n times word length rather than n squared', ['n squared', 'n^2', 'quadratic', 'length', 'linear']]], model: 'I treat each word as a node and connect words that differ in exactly one letter, then run BFS from the start word because it gives the fewest steps. The expensive part is finding neighbours: comparing every pair of words is quadratic. Instead I build a dictionary from wildcard patterns, such as the word with one position replaced by a star, to the words that share it. Words in the same bucket are neighbours, so each word costs the word length times a lookup, and the total is about n times the length. I also clear a bucket after using it so it is not scanned again.' }
    ]
  },
  {
    id: 'pat-heaps', title: 'Pattern: heaps and top-k', group: 'coding',
    uses: [
      'Operating-system and job schedulers keep tasks in a priority queue, so the most urgent task is always the next one popped in O(log n)',
      'Search and recommendation systems keep only the k best candidates in a small heap while scanning millions of scored items, instead of sorting all of them'
    ],
    tasks: [
      {
        id: 'cb-heaps-kth-largest', title: 'The k-th largest score', level: 'easy',
        prompt: `Write \`kth_largest(nums, k)\` that returns the k-th largest value in the list (counting duplicates, so \`[7, 7, 7]\` with \`k = 2\` gives 7).

- \`1 <= k <= len(nums)\` and \`nums\` can hold 200,000 numbers.
- Aim for O(n log k): keep a heap of size k rather than sorting everything.

Example: \`kth_largest([3, 2, 1, 5, 6, 4], 2)\` is 5.`,
        starter: R`def kth_largest(nums, k):
    # your code here
    return None

print(kth_largest([3, 2, 1, 5, 6, 4], 2))
`,
        solution: R`import heapq

def kth_largest(nums, k):
    heap = []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)
    return heap[0]
`,
        tests: [
          { name: 'Example', code: R`assert kth_largest([3, 2, 1, 5, 6, 4], 2) == 5, 'The 2nd largest of [3, 2, 1, 5, 6, 4] is 5'` },
          { name: 'Duplicates count', code: R`assert kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4, 'Sorted descending: 6, 5, 5, 4, ... so the 4th is 4'` },
          { name: 'Single value', code: R`assert kth_largest([1], 1) == 1, 'One value, k = 1'` },
          { name: 'Negatives', code: R`assert kth_largest([-1, -5, -3], 3) == -5, 'The 3rd largest of three values is the smallest, -5'` },
          { name: 'Large input', code: R`import random
random.seed(1)
nums = list(range(200000))
random.shuffle(nums)
assert kth_largest(nums, 100) == 199900, 'The 100th largest of 0..199999 is 199900'` }
        ]
      },
      {
        id: 'cb-heaps-last-stone', title: 'Smashing stones', level: 'easy',
        prompt: `Write \`last_stone(stones)\` for this game. Each turn, take the two heaviest stones with weights \`x <= y\` and smash them together:

- if \`x == y\`, both are destroyed;
- otherwise the stone of weight \`y - x\` is put back.

Return the weight of the last remaining stone, or \`0\` if no stones are left. The list can be empty.

Example: \`last_stone([2, 7, 4, 1, 8, 1])\` is 1.`,
        starter: R`def last_stone(stones):
    # your code here
    return 0

print(last_stone([2, 7, 4, 1, 8, 1]))
`,
        solution: R`import heapq

def last_stone(stones):
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        y = -heapq.heappop(heap)
        x = -heapq.heappop(heap)
        if y != x:
            heapq.heappush(heap, -(y - x))
    return -heap[0] if heap else 0
`,
        tests: [
          { name: 'Example', code: R`assert last_stone([2, 7, 4, 1, 8, 1]) == 1, 'Expected 1'` },
          { name: 'One stone', code: R`assert last_stone([5]) == 5, 'A single stone is never smashed'` },
          { name: 'Equal pair', code: R`assert last_stone([5, 5]) == 0, 'Equal stones destroy each other'` },
          { name: 'Empty', code: R`assert last_stone([]) == 0, 'No stones gives 0'` },
          { name: 'Chain of smashes', code: R`assert last_stone([10, 4, 3]) == 3, '10 and 4 leave 6; then 6 and 3 leave 3'` }
        ]
      },
      {
        id: 'cb-heaps-top-frequent', title: 'Most frequent words', level: 'medium',
        prompt: `Write \`top_frequent(words, k)\` that returns the \`k\` most frequent words as a list.

- Order by count, highest first. Words with the same count are ordered alphabetically.
- If there are fewer than \`k\` distinct words, return all of them. An empty input gives an empty list.
- The input can hold 100,000 words with thousands of distinct values.

Example: \`top_frequent(["a", "b", "a", "c", "b", "a"], 2)\` is \`["a", "b"]\`.`,
        starter: R`def top_frequent(words, k):
    # your code here
    return []

print(top_frequent(["a", "b", "a", "c", "b", "a"], 2))
`,
        solution: R`import heapq
from collections import Counter

def top_frequent(words, k):
    counts = Counter(words)
    best = heapq.nsmallest(k, counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [w for w, _ in best]
`,
        tests: [
          { name: 'Example', code: R`assert top_frequent(["a", "b", "a", "c", "b", "a"], 2) == ["a", "b"], 'a appears 3 times and b twice'` },
          { name: 'Ties alphabetical', code: R`assert top_frequent(["b", "a", "c"], 2) == ["a", "b"], 'All counts are 1, so alphabetical order decides'` },
          { name: 'k larger than distinct', code: R`assert top_frequent(["x", "y", "x"], 5) == ["x", "y"], 'Return all distinct words when k is too big'` },
          { name: 'Empty', code: R`assert top_frequent([], 3) == [], 'No words gives an empty list'` },
          { name: 'Large input', code: R`import random
random.seed(5)
words = []
for j in range(300):
    words += ['w%d' % j] * (j + 1)
random.shuffle(words)
assert top_frequent(words, 3) == ['w299', 'w298', 'w297'], 'The word w299 appears 300 times, w298 299 times, and so on'` }
        ]
      },
      {
        id: 'cb-heaps-meeting-rooms', title: 'How many meeting rooms?', level: 'medium',
        prompt: `Write \`min_rooms(intervals)\` where each interval is \`[start, end]\` for a meeting. Return the smallest number of rooms needed so that no two meetings in the same room overlap.

- A meeting that ends at time 5 and one that starts at time 5 can share a room.
- Intervals are not sorted. There can be up to 100,000 of them and \`start < end\`.
- An empty list needs 0 rooms.

Example: \`min_rooms([[0, 30], [5, 10], [15, 20]])\` is 2.`,
        starter: R`def min_rooms(intervals):
    # your code here
    return 0

print(min_rooms([[0, 30], [5, 10], [15, 20]]))
`,
        solution: R`import heapq

def min_rooms(intervals):
    ends = []
    for start, end in sorted(intervals):
        if ends and ends[0] <= start:
            heapq.heapreplace(ends, end)
        else:
            heapq.heappush(ends, end)
    return len(ends)
`,
        tests: [
          { name: 'Example', code: R`assert min_rooms([[0, 30], [5, 10], [15, 20]]) == 2, 'The first meeting overlaps both others, which do not overlap each other'` },
          { name: 'No overlap, unsorted', code: R`assert min_rooms([[7, 10], [2, 4]]) == 1, 'The meetings do not overlap'` },
          { name: 'Touching meetings', code: R`assert min_rooms([[1, 5], [5, 8]]) == 1, 'A meeting may start at the moment another ends'` },
          { name: 'Empty', code: R`assert min_rooms([]) == 0, 'No meetings need no rooms'` },
          { name: 'Large input', code: R`intervals = [[i, i + 3] for i in range(100000)]
assert min_rooms(intervals) == 3, 'At any moment three meetings are running'` }
        ]
      },
      {
        id: 'cb-heaps-running-median', title: 'Running median', level: 'hard',
        prompt: `Numbers arrive one at a time. Write \`running_medians(nums)\` that returns a list with the median of the numbers seen so far after each arrival.

- The median of an odd count is the middle value; for an even count it is the average of the two middle values.
- Return numbers that compare equal to the true median (for example \`4\` or \`4.0\`).
- There can be up to 200,000 numbers. Re-sorting or inserting into a sorted list every time is too slow.

Example: \`running_medians([5, 15, 1, 3])\` is \`[5, 10, 5, 4.0]\`.`,
        starter: R`def running_medians(nums):
    # your code here
    return []

print(running_medians([5, 15, 1, 3]))
`,
        solution: R`import heapq

def running_medians(nums):
    low = []   # max-heap (negated): the smaller half
    high = []  # min-heap: the larger half
    out = []
    for x in nums:
        if not low or x <= -low[0]:
            heapq.heappush(low, -x)
        else:
            heapq.heappush(high, x)
        if len(low) > len(high) + 1:
            heapq.heappush(high, -heapq.heappop(low))
        elif len(high) > len(low):
            heapq.heappush(low, -heapq.heappop(high))
        if len(low) > len(high):
            out.append(-low[0])
        else:
            out.append((-low[0] + high[0]) / 2)
    return out
`,
        tests: [
          { name: 'Example', code: R`assert running_medians([5, 15, 1, 3]) == [5, 10, 5, 4], 'Expected [5, 10, 5, 4]'` },
          { name: 'One number', code: R`assert running_medians([2]) == [2], 'A single number is its own median'` },
          { name: 'Empty', code: R`assert running_medians([]) == [], 'No numbers gives an empty list'` },
          { name: 'Descending input', code: R`assert running_medians([4, 3, 2, 1]) == [4, 3.5, 3, 2.5], 'Expected [4, 3.5, 3, 2.5]'` },
          { name: 'Large input', code: R`c = 100000
nums = [c]
for j in range(1, 100000):
    nums += [c + j, c - j]
assert len(nums) == 199999
nums.append(c + 100000)
expected = [c if i % 2 == 0 else c + 0.5 for i in range(len(nums))]
assert running_medians(nums) == expected, 'The medians alternate between 100000 and 100000.5 (two heaps keep this fast)'` }
        ]
      },
      {
        id: 'cb-heaps-network-delay', title: 'Signal delay', level: 'hard',
        prompt: `A network has nodes \`1\` to \`n\`. Each directed edge \`(u, v, w)\` carries a signal from \`u\` to \`v\` in \`w\` time units. A signal starts at node \`src\`.

Write \`network_delay(n, edges, src)\` that returns the time when **every** node has received the signal (the largest of the shortest travel times), or \`-1\` if some node is never reached.

- All \`w\` are positive integers. \`n\` can be up to 50,000 and there can be up to 100,000 edges, in any order.
- Repeating a relaxation pass over all edges until nothing changes is too slow.

Example: \`network_delay(4, [(2, 1, 1), (2, 3, 1), (3, 4, 1)], 2)\` is 2.`,
        starter: R`def network_delay(n, edges, src):
    # your code here
    return -1

print(network_delay(4, [(2, 1, 1), (2, 3, 1), (3, 4, 1)], 2))
`,
        solution: R`import heapq

def network_delay(n, edges, src):
    adj = [[] for _ in range(n + 1)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [None] * (n + 1)
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if dist[node] is not None:
            continue
        dist[node] = d
        for nxt, w in adj[node]:
            if dist[nxt] is None:
                heapq.heappush(heap, (d + w, nxt))
    reached = dist[1:]
    if any(x is None for x in reached):
        return -1
    return max(reached)
`,
        tests: [
          { name: 'Example', code: R`assert network_delay(4, [(2, 1, 1), (2, 3, 1), (3, 4, 1)], 2) == 2, 'Node 4 hears after 1 + 1 = 2'` },
          { name: 'Unreachable node', code: R`assert network_delay(2, [(1, 2, 1)], 2) == -1, 'Node 1 can never be reached from node 2'` },
          { name: 'Single node', code: R`assert network_delay(1, [], 1) == 0, 'The source already has the signal'` },
          { name: 'Longer route is faster', code: R`assert network_delay(3, [(1, 2, 10), (1, 3, 1), (3, 2, 2)], 1) == 3, 'Node 2 is reached via node 3 in 3, not directly in 10'` },
          { name: 'Large graph', code: R`import random
random.seed(11)
n = 50000
edges = [(i, i + 1, 2) for i in range(1, n)] + [(i, i + 2, 3) for i in range(1, n - 1)]
random.shuffle(edges)
d = [0] * (n + 1)
d[1] = 0
d[2] = 2
for i in range(3, n + 1):
    d[i] = min(d[i - 1] + 2, d[i - 2] + 3)
assert network_delay(n, edges, 1) == d[n], 'Wrong delay on a large graph (use a heap, not repeated passes over all edges)'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does Python’s heapq module give you by default?', options: ['A max-heap', 'A min-heap stored in a list', 'A sorted list', 'A hash table'], answer: 1, why: 'heappop returns the smallest item; for a max-heap you push negated values.', level: 'easy' },
      { q: 'What is the cost of pushing one item onto a heap of n items?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 1, why: 'The item moves up at most the height of the tree, which is about log n.', level: 'easy' },
      { q: 'Which call reads the smallest item of a min-heap without removing it?', options: ['heap[0]', 'heap[-1]', 'heapq.peek(heap)', 'min(heap)'], answer: 0, why: 'The root of the heap is stored at index 0 and is read in O(1).', level: 'easy' },
      { q: 'A problem asks for the 10 highest-scoring items out of a stream of 50 million. What do you keep?', options: ['All 50 million items, sorted', 'A min-heap of size 10', 'A max-heap of all items', 'A hash set'], answer: 1, why: 'A min-heap of size k holds the k best so far and its root is the weakest of them, so each new item costs O(log k).', level: 'easy' },
      { q: 'What is the total cost of finding the k largest of n values with a size-k heap?', options: ['O(n)', 'O(n log k)', 'O(k log n)', 'O(n log n)'], answer: 1, why: 'Each of n items causes at most one push or replace costing O(log k).', level: 'medium' },
      { q: 'To get the k largest values with a heap of size k, which kind of heap do you use?', options: ['A max-heap, popping the largest k times', 'A min-heap, so the smallest of the current top k is easy to evict', 'Two max-heaps', 'A heap is the wrong tool'], answer: 1, why: 'The root is the item to throw away when a better one arrives, and in a min-heap the root is the smallest of the k kept.', level: 'medium' },
      { q: 'What is the cost of turning an existing list of n items into a heap with heapq.heapify?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n^2)'], answer: 0, why: 'Sifting down from the bottom level is linear overall, cheaper than n separate pushes.', level: 'medium' },
      { q: 'You push tuples (priority, task) and two tasks have the same priority. What can go wrong?', options: ['Nothing, the order is stable', 'Python compares the tasks, which may not be comparable and raises TypeError', 'The heap loses an item', 'The heap becomes a max-heap'], answer: 1, why: 'Tuples compare element by element, so add a unique counter as the second element to break ties.', level: 'medium' },
      { q: 'For the running median, why use two heaps?', options: ['A max-heap of the lower half and a min-heap of the upper half expose the middle values at their roots', 'Two heaps are faster than one for any problem', 'To store duplicates separately', 'To avoid sorting at the end'], answer: 0, why: 'Keeping the halves balanced means the median is at one or both roots, in O(log n) per insertion.', level: 'hard' },
      { q: 'Dijkstra’s algorithm with a binary heap on V nodes and E edges has time complexity:', options: ['O(V + E)', 'O((V + E) log V)', 'O(V * E)', 'O(V^2 log V) always'], answer: 1, why: 'Each edge can push one entry costing O(log V), and each node is settled once.', level: 'hard' },
      { q: 'Dijkstra’s algorithm gives wrong answers when the graph contains:', options: ['Cycles', 'Negative edge weights', 'Parallel edges', 'Disconnected nodes'], answer: 1, why: 'It assumes that a node popped with the smallest distance is final, which a later negative edge can break.', level: 'hard' },
      { q: 'You need the k-th smallest of n numbers once, and n is small and fixed. Which is simplest and fine?', options: ['Sort and index, O(n log n)', 'A segment tree', 'A trie', 'Union-find'], answer: 0, why: 'A heap helps for streams, large n with small k or repeated queries, but for a one-off on small input sorting is the clearest answer.', level: 'hard' }
    ],
    interview: [
      { q: 'What is a heap and what operations is it good at?', level: 'easy', points: [['A tree stored in an array where each parent is smaller (or larger) than its children', ['parent', 'complete', 'array', 'tree']], ['Peek the min or max in O(1)', ['o(1)', 'peek', 'root']], ['Push and pop in O(log n)', ['log n', 'push', 'pop']], ['Not good for arbitrary search or sorted iteration', ['search', 'sorted', 'arbitrary', 'lookup']]], model: 'A heap is a complete binary tree stored in an array where every parent is no larger than its children in a min-heap, or no smaller in a max-heap. The extreme item is always at the root, so I can read it in constant time, and pushing or popping costs O(log n). Building from a list with heapify is linear. It is the right structure for a priority queue. It is not good for searching an arbitrary value or iterating in sorted order, because only the root is guaranteed to be the extreme.' },
      { q: 'How would you find the k most frequent items in a very large stream, and what is the complexity?', level: 'medium', points: [['Count with a hash map', ['hash', 'counter', 'dictionary', 'map']], ['Keep a heap of size k of the best counts', ['heap of size k', 'size k', 'min-heap', 'min heap']], ['O(n log k) rather than O(n log n)', ['n log k', 'log k']], ['Memory: distinct items for counts; mention approximate sketches for huge cardinality', ['memory', 'distinct', 'sketch', 'approximate']]], model: 'First I count occurrences with a hash map. Then I scan the counts with a min-heap capped at size k: if the heap is not full I push, otherwise I replace the root when the new count is higher. That costs O(n log k) instead of sorting everything in O(n log n), and the heap needs only k entries. The counting still needs memory for each distinct item, so for a huge number of distinct items I would mention an approximate approach such as a count-min sketch. I would also settle how ties are broken.' },
      { q: 'Explain how to keep the median of a stream up to date.', level: 'hard', points: [['Max-heap for the lower half, min-heap for the upper half', ['max-heap', 'min-heap', 'two heaps', 'lower', 'upper', 'half']], ['Rebalance so sizes differ by at most one', ['balance', 'size', 'differ']], ['Median at the roots', ['root', 'top', 'peek']], ['O(log n) per insert, O(1) to read', ['log n', 'o(1)']]], model: 'I use two heaps. A max-heap holds the smaller half of the numbers and a min-heap holds the larger half. For each new number I push it to the correct side, then rebalance so the sizes differ by at most one. If one heap is larger, its root is the median; if they are equal, the median is the average of the two roots. Each insertion costs O(log n) and reading the median is constant. Sorting after every arrival would cost O(n log n) each time, and inserting into a sorted list is O(n) because of shifting.' },
      { q: 'When would you use Dijkstra with a heap, and what are its limits?', level: 'hard', points: [['Shortest path with non-negative weights', ['non-negative', 'weight', 'shortest']], ['Pop the closest unsettled node, relax its edges', ['relax', 'closest', 'smallest', 'pop']], ['O((V + E) log V) with a binary heap', ['log v', 'e log', 'v + e']], ['Fails with negative edges; BFS suffices if unweighted', ['negative', 'bellman', 'bfs', 'unweighted']]], model: 'I use Dijkstra to find shortest paths from one source when all edge weights are non-negative. I keep a heap of candidate distances; each time I pop the smallest, if that node is not yet settled I fix its distance and push the better distances of its neighbours. With a binary heap the cost is O of V plus E times log V. If every edge has the same cost, plain BFS is simpler and faster. With negative edges Dijkstra can be wrong, and I would switch to Bellman-Ford, accepting a cost of V times E.' }
    ]
  },
  {
    id: 'pat-dp', title: 'Pattern: dynamic programming', group: 'coding',
    uses: [
      'Spell checkers, diff tools and DNA alignment compute edit distance or longest common subsequence with a table, so two long texts are compared without trying every alignment',
      'Resource planning such as budget allocation, cutting stock or choosing ads for a fixed space is a knapsack-style table that finds the best total value under a limit'
    ],
    tasks: [
      {
        id: 'cb-dp-stair-ways', title: 'Climbing stairs, three step sizes', level: 'easy',
        prompt: `A staircase has \`n\` steps. You can climb 1, 2 or 3 steps at a time.

Write \`stair_ways(n)\` that returns the number of different sequences of moves that reach the top exactly.

- \`n\` is between 0 and 60. For \`n = 0\` there is 1 way (do nothing).
- The answer can be large; Python integers handle it.
- A plain recursion that recomputes the same values will be too slow for \`n = 40\`.

Example: \`stair_ways(3)\` is 4 (1+1+1, 1+2, 2+1, 3).`,
        starter: R`def stair_ways(n):
    # your code here
    return 0

print(stair_ways(3))
`,
        solution: R`def stair_ways(n):
    ways = [0] * (n + 1)
    ways[0] = 1
    for i in range(1, n + 1):
        for step in (1, 2, 3):
            if i >= step:
                ways[i] += ways[i - step]
    return ways[n]
`,
        tests: [
          { name: 'Zero steps', code: R`assert stair_ways(0) == 1, 'There is one way to climb zero steps: do nothing'` },
          { name: 'One and two', code: R`assert stair_ways(1) == 1 and stair_ways(2) == 2, 'n = 1 gives 1 way and n = 2 gives 2'` },
          { name: 'Example', code: R`assert stair_ways(3) == 4, 'n = 3 gives 1+1+1, 1+2, 2+1, 3'` },
          { name: 'Five steps', code: R`assert stair_ways(5) == 13, 'ways(5) = ways(4) + ways(3) + ways(2) = 7 + 4 + 2'` },
          { name: 'Large n', code: R`assert stair_ways(40) == 23837527729, 'stair_ways(40) should be 23837527729 (store results instead of recomputing)'` }
        ]
      },
      {
        id: 'cb-dp-max-loot', title: 'No two neighbours', level: 'easy',
        prompt: `A street has houses in a row, each holding some money. You may take from any set of houses as long as no two **adjacent** houses are both chosen.

Write \`max_loot(houses)\` that returns the largest total you can take.

- \`houses\` is a list of non-negative integers and can be empty (answer 0).
- It can hold up to 100,000 houses, so avoid deep recursion.

Example: \`max_loot([2, 7, 9, 3, 1])\` is 12 (houses 2, 9 and 1).`,
        starter: R`def max_loot(houses):
    # your code here
    return 0

print(max_loot([2, 7, 9, 3, 1]))
`,
        solution: R`def max_loot(houses):
    take, skip = 0, 0
    for money in houses:
        take, skip = skip + money, max(take, skip)
    return max(take, skip)
`,
        tests: [
          { name: 'Example', code: R`assert max_loot([2, 7, 9, 3, 1]) == 12, 'Take 2, 9 and 1 for 12'` },
          { name: 'Empty street', code: R`assert max_loot([]) == 0, 'No houses, no money'` },
          { name: 'One house', code: R`assert max_loot([5]) == 5, 'Take the only house'` },
          { name: 'Skip the middle', code: R`assert max_loot([1, 2, 3, 1]) == 4, 'Take 1 and 3'` },
          { name: 'Long street', code: R`assert max_loot([1] * 100000) == 50000, 'Every second house of 100000 gives 50000'` }
        ]
      },
      {
        id: 'cb-dp-coin-change', title: 'Fewest coins', level: 'medium',
        prompt: `Write \`fewest_coins(coins, amount)\` that returns the smallest number of coins that add up to exactly \`amount\`, or \`-1\` if it cannot be done.

- \`coins\` is a list of distinct positive integers and you have an unlimited supply of each.
- \`amount\` is between 0 and 20,000. For \`amount = 0\` the answer is 0.
- Greedy (always take the biggest coin) is not always correct.

Example: \`fewest_coins([1, 2, 5], 11)\` is 3 (5 + 5 + 1).`,
        starter: R`def fewest_coins(coins, amount):
    # your code here
    return -1

print(fewest_coins([1, 2, 5], 11))
`,
        solution: R`def fewest_coins(coins, amount):
    INF = float('inf')
    best = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return best[amount] if best[amount] != INF else -1
`,
        tests: [
          { name: 'Example', code: R`assert fewest_coins([1, 2, 5], 11) == 3, '5 + 5 + 1 uses 3 coins'` },
          { name: 'Impossible', code: R`assert fewest_coins([2], 3) == -1, 'Only even totals can be made with a coin of 2'` },
          { name: 'Zero amount', code: R`assert fewest_coins([1], 0) == 0, 'Amount 0 needs no coins'` },
          { name: 'Greedy fails', code: R`assert fewest_coins([1, 3, 4], 6) == 2, '3 + 3 is better than 4 + 1 + 1'` },
          { name: 'Large amount', code: R`assert fewest_coins([1, 5, 10, 25, 50, 100], 10000) == 100, '100 coins of 100 make 10000'` }
        ]
      },
      {
        id: 'cb-dp-edit-distance', title: 'Edit distance', level: 'medium',
        prompt: `Write \`edit_distance(a, b)\` that returns the fewest single-character operations needed to turn string \`a\` into string \`b\`. The operations are: insert a character, delete a character, replace a character.

- Both strings can be empty and are up to 600 characters long.
- The answer for an empty string and a string of length m is m.

Example: \`edit_distance("kitten", "sitting")\` is 3 (replace k with s, replace e with i, insert g).`,
        starter: R`def edit_distance(a, b):
    # your code here
    return 0

print(edit_distance("kitten", "sitting"))
`,
        solution: R`def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j - 1], prev[j], cur[j - 1])
        prev = cur
    return prev[len(b)]
`,
        tests: [
          { name: 'Example', code: R`assert edit_distance("kitten", "sitting") == 3, 'Expected 3'` },
          { name: 'Empty string', code: R`assert edit_distance("", "abc") == 3 and edit_distance("abc", "") == 3, 'Turning "" into "abc" takes 3 insertions'` },
          { name: 'Identical', code: R`assert edit_distance("same", "same") == 0, 'Equal strings need no edits'` },
          { name: 'Longer words', code: R`assert edit_distance("intention", "execution") == 5, 'Expected 5'` },
          { name: 'Long strings', code: R`assert edit_distance("ab" * 300, "ba" * 300) == 2, 'Delete the first a and add an a at the end: 2 edits'` }
        ]
      },
      {
        id: 'cb-dp-longest-increasing', title: 'Longest increasing subsequence', level: 'hard',
        prompt: `Write \`longest_increasing(nums)\` that returns the length of the longest **strictly increasing subsequence** of the list. A subsequence keeps the original order but may skip elements.

- \`nums\` can be empty (answer 0) and can hold up to 150,000 integers.
- An O(n^2) table will be too slow; an O(n log n) method exists.

Example: \`longest_increasing([10, 9, 2, 5, 3, 7, 101, 18])\` is 4 (for example 2, 3, 7, 18).`,
        starter: R`def longest_increasing(nums):
    # your code here
    return 0

print(longest_increasing([10, 9, 2, 5, 3, 7, 101, 18]))
`,
        solution: R`from bisect import bisect_left

def longest_increasing(nums):
    tails = []  # tails[i] = smallest last value of an increasing subsequence of length i + 1
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)
`,
        tests: [
          { name: 'Example', code: R`assert longest_increasing([10, 9, 2, 5, 3, 7, 101, 18]) == 4, 'Expected 4'` },
          { name: 'Empty', code: R`assert longest_increasing([]) == 0, 'An empty list has length 0'` },
          { name: 'Equal values are not increasing', code: R`assert longest_increasing([7, 7, 7, 7]) == 1, 'Strictly increasing: equal values do not count'` },
          { name: 'Decreasing', code: R`assert longest_increasing([5, 4, 3, 2, 1]) == 1, 'Any single element is a subsequence of length 1'` },
          { name: 'Large ascending input', code: R`assert longest_increasing(list(range(150000))) == 150000, 'The whole list is increasing. O(n^2) is too slow for 150000 values'` }
        ]
      },
      {
        id: 'cb-dp-segment-count', title: 'Ways to split a string into words', level: 'hard',
        prompt: `Write \`segment_count(s, words)\` that returns the number of different ways to split the string \`s\` into a sequence of words from the list \`words\` (words can be reused).

- Two splits are different if they cut the string at different places.
- An empty string has exactly 1 way. If no split exists, return 0.
- \`s\` is up to 200 characters and \`words\` has up to 50 distinct lowercase words. The count can be huge, so trying every split by recursion is too slow.

Example: \`segment_count("catsanddog", ["cat", "cats", "and", "sand", "dog"])\` is 2 (cat sand dog and cats and dog).`,
        starter: R`def segment_count(s, words):
    # your code here
    return 0

print(segment_count("catsanddog", ["cat", "cats", "and", "sand", "dog"]))
`,
        solution: R`def segment_count(s, words):
    vocab = set(words)
    lengths = sorted({len(w) for w in vocab})
    ways = [0] * (len(s) + 1)
    ways[0] = 1
    for i in range(1, len(s) + 1):
        for n in lengths:
            if n <= i and ways[i - n] and s[i - n:i] in vocab:
                ways[i] += ways[i - n]
    return ways[len(s)]
`,
        tests: [
          { name: 'Example', code: R`assert segment_count("catsanddog", ["cat", "cats", "and", "sand", "dog"]) == 2, 'cat sand dog and cats and dog'` },
          { name: 'Three ways', code: R`assert segment_count("pineapplepenapple", ["apple", "pen", "applepen", "pine", "pineapple"]) == 3, 'Expected 3 different splits'` },
          { name: 'Impossible', code: R`assert segment_count("catsandog", ["cats", "dog", "sand", "and", "cat"]) == 0, 'No split covers the whole string'` },
          { name: 'Empty string', code: R`assert segment_count("", ["a"]) == 1, 'The empty string has one split, using no words'` },
          { name: 'Exponentially many splits', code: R`a, b = 1, 1
for _ in range(79):
    a, b = b, a + b
assert segment_count("a" * 80, ["a", "aa"]) == b, 'Splitting 80 letters into a and aa has 37889062373143906 ways; count them with a table, do not list them'` }
        ]
      }
    ],
    quiz: [
      { q: 'Which two properties make a problem suitable for dynamic programming?', options: ['Overlapping subproblems and optimal substructure', 'A sorted input and a graph', 'Recursion and a loop', 'Only integer inputs'], answer: 0, why: 'The same smaller problems recur, and the best answer is built from best answers to smaller ones.', level: 'easy' },
      { q: 'What is memoisation?', options: ['Sorting the input first', 'Caching the result of each subproblem so it is computed once', 'Replacing recursion with a stack', 'Compressing the input'], answer: 1, why: 'A dictionary or array stores answers by their state, turning repeated work into a lookup.', level: 'easy' },
      { q: 'Which phrasing most often signals DP?', options: ['"Sort the list"', '"Count the number of ways" or "find the minimum cost"', '"Find a value in a sorted array"', '"Reverse the string"'], answer: 1, why: 'Counting ways, minimising a cost, maximising a value or finding a longest sequence typically decompose into smaller subproblems.', level: 'easy' },
      { q: 'What is the first thing to define when you design a DP solution?', options: ['The state: what the subproblem is and what it stores', 'The output format', 'The programming language', 'The tests'], answer: 0, why: 'Once you know exactly what dp[i] or dp[i][j] means, the recurrence and base cases follow.', level: 'easy' },
      { q: 'Naive recursive Fibonacci takes exponential time. Memoising it makes it:', options: ['O(n)', 'O(log n)', 'O(n^2)', 'Still exponential'], answer: 0, why: 'There are only n distinct states and each is computed once with constant work.', level: 'medium' },
      { q: 'DP time complexity is usually estimated as:', options: ['The number of states times the work per state', 'The depth of recursion', 'The size of the output', 'Always O(n^2)'], answer: 0, why: 'Edit distance has n times m states with constant work each, so O(nm).', level: 'medium' },
      { q: 'A bottom-up table where row i depends only on row i - 1 can usually be shrunk to:', options: ['Two rows (or one), reducing space', 'A hash set', 'A heap', 'No change is possible'], answer: 0, why: 'You keep only the previous row, so space drops from O(nm) to O(m).', level: 'medium' },
      { q: 'You want the fewest coins for a total, with arbitrary coin values. Why is a greedy choice of the largest coin unsafe?', options: ['It is too slow', 'A locally best choice can block the global best, for example 3 + 3 beats 4 + 1 + 1 for 6 with coins 1, 3, 4', 'Greedy only works on strings', 'It always overflows'], answer: 1, why: 'Greedy has no way to undo a choice, while DP compares every option for each amount.', level: 'medium' },
      { q: 'The O(n log n) method for longest increasing subsequence keeps:', options: ['A sorted list of the smallest possible tail value for each length, updated with binary search', 'A heap of all values', 'A full n by n table', 'A stack of the largest values'], answer: 0, why: 'The tails list is always sorted, so bisect finds the position to improve in O(log n).', level: 'hard' },
      { q: 'A top-down memoised solution passes small tests but raises RecursionError on n = 100,000. What is the fix?', options: ['Use a bigger dictionary', 'Convert to a bottom-up loop (or raise the limit carefully)', 'Add more base cases', 'Use floats'], answer: 1, why: 'Recursion depth equals the chain of dependent states; an iterative table has no call stack to overflow.', level: 'hard' },
      { q: 'In 0/1 knapsack with a one-dimensional array of capacities, why do you loop over capacity from high to low?', options: ['To save memory', 'So each item is used at most once', 'To sort the items', 'To allow repeats'], answer: 1, why: 'Going downwards means dp[c - weight] has not yet been updated by the current item; going upwards would reuse the item, giving the unbounded version.', level: 'hard' },
      { q: 'A DP over a string of length n with a state (i, j) takes O(n^2) memory. For n = 100,000, which is the sound reaction?', options: ['Accept it, memory is cheap', 'Look for a different state, or a rolling array, since 10^10 cells cannot be stored', 'Use recursion instead', 'Use a bigger integer type'], answer: 1, why: 'Ten billion cells is far beyond memory, so the problem needs a better formulation, such as LIS in O(n log n) or a two-row table.', level: 'hard' }
    ],
    interview: [
      { q: 'What is dynamic programming and how do you know a problem needs it?', level: 'easy', points: [['Overlapping subproblems', ['overlap', 'repeat', 'same subproblem']], ['Optimal substructure', ['optimal substructure', 'built from', 'smaller']], ['Store results to avoid recomputation', ['memo', 'cache', 'table', 'store']], ['Phrasings such as count the ways, minimum or maximum', ['ways', 'minimum', 'maximum', 'longest', 'cost']]], model: 'Dynamic programming solves a problem by combining answers to smaller versions of itself and storing each answer so it is computed once. I look for two signs: the same subproblems come up again and again, and the best answer can be built from best answers to smaller pieces. The wording helps too: count the ways, minimum cost, maximum value, longest sequence. If a brute-force recursion branches repeatedly into the same arguments, that is the cue to add a cache or a table.' },
      { q: 'Walk me through how you would solve the minimum number of coins problem.', level: 'medium', points: [['Define dp[a] as the fewest coins for amount a', ['dp[', 'state', 'fewest', 'define']], ['Recurrence: 1 + min of dp[a - coin]', ['min', 'recurrence', 'transition', 'a - coin']], ['Base case dp[0] = 0 and unreachable as infinity', ['base', 'zero', 'infinity', 'unreachable']], ['O(amount times coins) time, O(amount) space; greedy fails', ['amount', 'coins', 'o(', 'greedy']]], model: 'I define dp of a as the fewest coins that make amount a. The base case is dp of zero equals zero, and every other entry starts at infinity to mean unreachable. For each amount I try every coin that fits and take one plus dp of a minus that coin, keeping the minimum. The answer is dp of the target, or minus one if it is still infinity. Time is amount times the number of coins and space is the amount. I would point out that greedy fails, for example with coins one, three and four for a total of six.' },
      { q: 'Explain top-down memoisation versus bottom-up tabulation and when you prefer each.', level: 'medium', points: [['Top-down is recursion plus a cache', ['recurs', 'cache', 'memo']], ['Bottom-up fills a table in dependency order', ['table', 'loop', 'iterative', 'order']], ['Top-down computes only needed states and is easier to write', ['only needed', 'easier', 'natural', 'lazy']], ['Bottom-up avoids recursion limits and allows space reduction', ['recursion limit', 'stack', 'space', 'rolling']]], model: 'Top-down starts from the original problem, recurses into smaller ones and caches results. It is quick to write because it follows the recurrence directly and it only computes states that are actually reached. Bottom-up fills a table in an order where every dependency is already filled. It avoids recursion limits, which matters in Python, and often lets me keep only the last row to save space. I usually write the recurrence top-down to get it right, then convert to a table if the depth is large or memory is tight.' },
      { q: 'How would you make a longest increasing subsequence solution faster than O(n squared)?', level: 'hard', points: [['The O(n squared) table compares each element with all earlier ones', ['n squared', 'n^2', 'quadratic', 'table']], ['Keep the smallest tail value for each subsequence length', ['tail', 'smallest', 'length']], ['Tails stay sorted, so binary search finds where each number goes', ['binary search', 'bisect', 'sorted']], ['Result is the length of tails; O(n log n)', ['n log n', 'length of']]], model: 'The standard table sets dp of i to one plus the best dp of any smaller earlier value, which is O of n squared. To speed it up I keep a list where entry k is the smallest possible last value of an increasing subsequence of length k plus one. That list is always sorted. For each number I binary search for the first tail that is not smaller than it and replace that tail, or append if none exists. The length of the list at the end is the answer. Each number costs a binary search, so the total is O of n log n. The list is not itself a valid subsequence, which I would say to avoid confusion.' }
    ]
  },
  {
    id: 'pat-backtracking', title: 'Pattern: backtracking', group: 'coding',
    uses: [
      'Constraint solvers for timetables, sudoku-style puzzles and configuration problems try a choice, check the rules, and undo it when a rule breaks',
      'Regular-expression engines and parsers try one alternative at a time and step back to the last choice when a match fails'
    ],
    tasks: [
      {
        id: 'cb-backtrack-subsets', title: 'All subsets', level: 'easy',
        prompt: `Write \`all_subsets(nums)\` that returns every subset of a list of distinct integers, as a list of lists.

- Include the empty subset and the full list. The order of the subsets and of the numbers inside each one does not matter.
- \`nums\` has up to 12 items, so there are up to 4096 subsets.

Example: \`all_subsets([1, 2])\` gives \`[[], [1], [2], [1, 2]]\` in any order.`,
        starter: R`def all_subsets(nums):
    # your code here
    return []

print(all_subsets([1, 2]))
`,
        solution: R`def all_subsets(nums):
    result = []
    current = []

    def go(i):
        if i == len(nums):
            result.append(current[:])
            return
        go(i + 1)              # skip nums[i]
        current.append(nums[i])
        go(i + 1)              # take nums[i]
        current.pop()

    go(0)
    return result
`,
        tests: [
          { name: 'Empty input', code: R`assert all_subsets([]) == [[]], 'The only subset of an empty list is the empty subset'` },
          { name: 'One item', code: R`assert sorted(sorted(s) for s in all_subsets([5])) == [[], [5]], 'Expected [] and [5]'` },
          { name: 'Three items', code: R`got = sorted(sorted(s) for s in all_subsets([1, 2, 3]))
assert got == [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]], 'Expected the 8 subsets of [1, 2, 3]'` },
          { name: 'Copies, not references', code: R`got = all_subsets([1, 2, 3])
assert len(got) == 8 and all(isinstance(s, list) for s in got) and [] in got, 'Append a copy of the current list; otherwise every subset ends up empty'` },
          { name: 'Twelve items', code: R`got = all_subsets(list(range(12)))
assert len(got) == 4096 and len({tuple(sorted(s)) for s in got}) == 4096, '12 items give 4096 different subsets'` }
        ]
      },
      {
        id: 'cb-backtrack-no-adjacent-ones', title: 'Binary strings with no two 1s in a row', level: 'easy',
        prompt: `Write \`no_adjacent_ones(n)\` that returns all binary strings of length \`n\` that do not contain two \`'1'\` characters next to each other, in ascending (alphabetical) order.

- \`1 <= n <= 16\`.
- Build the strings choice by choice and stop a branch as soon as it would put two 1s together.

Example: \`no_adjacent_ones(3)\` is \`["000", "001", "010", "100", "101"]\`.`,
        starter: R`def no_adjacent_ones(n):
    # your code here
    return []

print(no_adjacent_ones(3))
`,
        solution: R`def no_adjacent_ones(n):
    result = []
    chars = []

    def go():
        if len(chars) == n:
            result.append(''.join(chars))
            return
        chars.append('0')
        go()
        chars.pop()
        if not chars or chars[-1] != '1':
            chars.append('1')
            go()
            chars.pop()

    go()
    return result
`,
        tests: [
          { name: 'One character', code: R`assert no_adjacent_ones(1) == ["0", "1"], 'Expected ["0", "1"]'` },
          { name: 'Two characters', code: R`assert no_adjacent_ones(2) == ["00", "01", "10"], '"11" has two 1s in a row'` },
          { name: 'Example', code: R`assert no_adjacent_ones(3) == ["000", "001", "010", "100", "101"], 'Expected 5 strings in ascending order'` },
          { name: 'Order and count', code: R`got = no_adjacent_ones(6)
assert len(got) == 21 and got == sorted(got), 'Length 6 has 21 valid strings, listed in ascending order'` },
          { name: 'Length sixteen', code: R`got = no_adjacent_ones(16)
assert len(got) == 2584 and all('11' not in s and len(s) == 16 for s in got), 'Length 16 has 2584 valid strings'` }
        ]
      },
      {
        id: 'cb-backtrack-distinct-permutations', title: 'Distinct permutations', level: 'medium',
        prompt: `Write \`distinct_permutations(nums)\` that returns every different ordering of a list that may contain repeated numbers.

- Two orderings that look the same must appear only once. For \`[1, 1, 2]\` that gives three results, not six.
- The order of the results does not matter.
- \`nums\` has up to 8 items. An empty list has one permutation, the empty list.

Example: \`distinct_permutations([1, 1, 2])\` gives \`[[1, 1, 2], [1, 2, 1], [2, 1, 1]]\` in any order.`,
        starter: R`def distinct_permutations(nums):
    # your code here
    return []

print(distinct_permutations([1, 1, 2]))
`,
        solution: R`from collections import Counter

def distinct_permutations(nums):
    counts = Counter(nums)
    result = []
    current = []

    def go():
        if len(current) == len(nums):
            result.append(current[:])
            return
        for value in list(counts):
            if counts[value] > 0:
                counts[value] -= 1
                current.append(value)
                go()
                current.pop()
                counts[value] += 1

    go()
    return result
`,
        tests: [
          { name: 'Example', code: R`assert sorted(distinct_permutations([1, 1, 2])) == [[1, 1, 2], [1, 2, 1], [2, 1, 1]], 'Expected the three different orderings'` },
          { name: 'All different', code: R`got = sorted(distinct_permutations([1, 2, 3]))
assert got == [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], 'Expected all 6 orderings'` },
          { name: 'Empty', code: R`assert distinct_permutations([]) == [[]], 'The empty list has one permutation: the empty list'` },
          { name: 'All equal', code: R`assert distinct_permutations([2, 2, 2]) == [[2, 2, 2]], 'Only one different ordering exists'` },
          { name: 'Eight items with repeats', code: R`got = distinct_permutations([1, 1, 2, 2, 3, 3, 4, 4])
assert len(got) == 2520 and len({tuple(p) for p in got}) == 2520, '8!/(2!2!2!2!) = 2520 different orderings, none repeated'` }
        ]
      },
      {
        id: 'cb-backtrack-combination-sum', title: 'Combinations that reach a target', level: 'medium',
        prompt: `Write \`combination_sum(candidates, target)\` that returns all different combinations of numbers from \`candidates\` that add up to \`target\`.

- \`candidates\` are distinct positive integers and each can be used any number of times.
- Combinations are lists in non-decreasing order, and \`[2, 3]\` and \`[3, 2]\` count as the same combination. Return each once, in any order.
- Return \`[]\` if there is none. \`target\` is up to 40.

Example: \`combination_sum([2, 3, 6, 7], 7)\` is \`[[2, 2, 3], [7]]\`.`,
        starter: R`def combination_sum(candidates, target):
    # your code here
    return []

print(combination_sum([2, 3, 6, 7], 7))
`,
        solution: R`def combination_sum(candidates, target):
    nums = sorted(candidates)
    result = []
    current = []

    def go(start, remaining):
        if remaining == 0:
            result.append(current[:])
            return
        for i in range(start, len(nums)):
            if nums[i] > remaining:
                break
            current.append(nums[i])
            go(i, remaining - nums[i])
            current.pop()

    go(0, target)
    return result
`,
        tests: [
          { name: 'Example', code: R`assert sorted(combination_sum([2, 3, 6, 7], 7)) == [[2, 2, 3], [7]], 'Expected [[2, 2, 3], [7]]'` },
          { name: 'Three combinations', code: R`assert sorted(combination_sum([2, 3, 5], 8)) == [[2, 2, 2, 2], [2, 3, 3], [3, 5]], 'Expected three combinations'` },
          { name: 'None possible', code: R`assert combination_sum([2], 1) == [], 'No combination of 2s makes 1'` },
          { name: 'Reuse', code: R`assert combination_sum([1], 3) == [[1, 1, 1]], 'A number may be used several times'` },
          { name: 'No duplicates in a larger case', code: R`got = combination_sum([2, 3, 5, 7], 30)
ways = [1] + [0] * 30
for c in (2, 3, 5, 7):
    for a in range(c, 31):
        ways[a] += ways[a - c]
assert len(got) == ways[30] and len({tuple(g) for g in got}) == len(got) and all(sum(g) == 30 for g in got), 'Each different combination must appear exactly once (expected %d)' % ways[30]` }
        ]
      },
      {
        id: 'cb-backtrack-n-queens', title: 'Count the queen placements', level: 'hard',
        prompt: `Write \`count_queens(n)\` that returns the number of ways to place \`n\` queens on an \`n\` by \`n\` chessboard so that no two queens attack each other (no two share a row, column or diagonal).

- \`1 <= n <= 10\`.
- Trying every placement of n queens is far too slow for \`n = 10\`. Place one queen per row and abandon a partial placement the moment it is attacked.

Example: \`count_queens(4)\` is 2.`,
        starter: R`def count_queens(n):
    # your code here
    return 0

print(count_queens(4))
`,
        solution: R`def count_queens(n):
    cols = set()
    diag1 = set()   # row - col
    diag2 = set()   # row + col

    def place(row):
        if row == n:
            return 1
        total = 0
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            total += place(row + 1)
            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)
        return total

    return place(0)
`,
        tests: [
          { name: 'One queen', code: R`assert count_queens(1) == 1, 'One queen on a 1 by 1 board: 1 way'` },
          { name: 'No solution', code: R`assert count_queens(2) == 0 and count_queens(3) == 0, 'Boards 2 and 3 have no solution'` },
          { name: 'Four queens', code: R`assert count_queens(4) == 2, 'The 4 by 4 board has 2 solutions'` },
          { name: 'Eight queens', code: R`assert count_queens(8) == 92, 'The classic 8 by 8 board has 92 solutions'` },
          { name: 'Ten queens', code: R`assert count_queens(10) == 724, 'The 10 by 10 board has 724 solutions (prune early, do not try all placements)'` }
        ]
      },
      {
        id: 'cb-backtrack-equal-groups', title: 'Split into equal groups', level: 'hard',
        prompt: `Write \`can_split(nums, k)\` that returns \`True\` if the list of positive integers can be divided into \`k\` groups (every number used exactly once) where all groups have the same sum.

- \`nums\` has up to 16 items and \`1 <= k <= 6\`.
- If the total is not divisible by \`k\`, or one number is larger than the target sum, the answer is \`False\`.
- The search must prune: a plain try-every-group search takes tens of seconds on some inputs.

Example: \`can_split([4, 3, 2, 3, 5, 2, 1], 4)\` is \`True\` (groups 5, 1+4, 2+3, 2+3).`,
        starter: R`def can_split(nums, k):
    # your code here
    return False

print(can_split([4, 3, 2, 3, 5, 2, 1], 4))
`,
        solution: R`def can_split(nums, k):
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    items = sorted(nums, reverse=True)
    if items[0] > target:
        return False
    groups = [0] * k

    def place(i):
        if i == len(items):
            return True
        tried = set()
        for g in range(k):
            if groups[g] in tried or groups[g] + items[i] > target:
                continue
            tried.add(groups[g])
            groups[g] += items[i]
            if place(i + 1):
                return True
            groups[g] -= items[i]
        return False

    return place(0)
`,
        tests: [
          { name: 'Example', code: R`assert can_split([4, 3, 2, 3, 5, 2, 1], 4) is True, 'Groups: 5, 1+4, 2+3, 2+3'` },
          { name: 'Sum not divisible', code: R`assert can_split([1, 2, 3, 4], 3) is False, 'The total 10 cannot be split into 3 equal sums'` },
          { name: 'Number too big', code: R`assert can_split([10, 10, 10], 2) is False, 'The total 30 gives a target of 15, but 10 + 10 > 15 and each 10 alone is short'` },
          { name: 'One group', code: R`assert can_split([5], 1) is True, 'A single group always works'` },
          { name: 'Hard impossible case', code: R`assert can_split([2, 9, 2, 7, 7, 7, 2, 2, 9, 9, 4, 3, 7, 6, 9], 5) is False, 'The total is 85 so each group needs 17, but no split works. Sort in descending order and skip groups with the same current sum, otherwise the search is far too slow'` }
        ]
      }
    ],
    quiz: [
      { q: 'What are the three steps inside each backtracking loop?', options: ['Sort, search, return', 'Choose, explore, un-choose (undo)', 'Split, merge, sort', 'Read, write, close'], answer: 1, why: 'You make a choice, recurse to explore what follows, then undo the choice so the next option starts from the same state.', level: 'easy' },
      { q: 'Which kind of task is typical for backtracking?', options: ['Finding the maximum of a list', 'Generating all subsets, permutations or valid arrangements', 'Looking up a key in a hash map', 'Sorting numbers'], answer: 1, why: 'Backtracking builds candidates step by step and is used when you must list or search a space of arrangements.', level: 'easy' },
      { q: 'How many subsets does a set of n distinct items have?', options: ['n', 'n squared', '2^n', 'n!'], answer: 2, why: 'Each item is either in or out, giving 2 times 2 and so on, n times.', level: 'easy' },
      { q: 'How many permutations does a list of n distinct items have?', options: ['2^n', 'n!', 'n^2', 'n log n'], answer: 1, why: 'There are n choices for the first place, n - 1 for the second and so on.', level: 'easy' },
      { q: 'What does pruning mean in backtracking?', options: ['Deleting the input', 'Abandoning a partial solution as soon as it cannot lead to a valid answer', 'Sorting the results', 'Caching answers'], answer: 1, why: 'Cutting a branch early skips every completion below it, which can turn an impossible search into a fast one.', level: 'medium' },
      { q: 'You append the current list to the results without copying it, then keep modifying it. What happens?', options: ['Nothing, it is fine', 'All stored results point to the same list and end up identical (often empty)', 'Python raises SyntaxError', 'The results are sorted'], answer: 1, why: 'Lists are references, so store current[:] or list(current) at the moment you record a result.', level: 'medium' },
      { q: 'To generate distinct permutations of [1, 1, 2] without duplicates, a clean approach is to:', options: ['Generate all 6 and remove duplicates afterwards', 'Count the remaining copies of each value and only pick a value while its count is above zero', 'Sort the result', 'Use recursion depth 1'], answer: 1, why: 'Choosing by value rather than by position never produces the same ordering twice, and no work is wasted.', level: 'medium' },
      { q: 'In combination-sum with reusable candidates, why do you pass the same start index (not start + 1) into the recursive call?', options: ['To allow the same number to be used again', 'To save memory', 'To speed up sorting', 'To avoid recursion'], answer: 0, why: 'Staying at index i lets the same candidate repeat, while moving forward only prevents going back to smaller candidates, so each combination appears once.', level: 'medium' },
      { q: 'The N-queens search with one queen per row and sets for columns and diagonals visits far fewer states than trying all placements because:', options: ['It uses more memory', 'Rows are never repeated and attacked squares are rejected immediately', 'It uses iteration instead of recursion', 'The board is smaller'], answer: 1, why: 'Without pruning there are about n^n placements; the conflict checks cut off most branches early.', level: 'hard' },
      { q: 'What is the worst-case time of generating all permutations of n items and copying each one into the results?', options: ['O(n)', 'O(n log n)', 'O(n * n!)', 'O(2^n)'], answer: 2, why: 'There are n! permutations and recording each costs O(n) to copy.', level: 'hard' },
      { q: 'Partitioning numbers into k equal-sum groups tries each number in each group. Which trick avoids the most repeated work?', options: ['Sort descending and skip a group whose current sum equals one already tried for this number', 'Use a larger recursion limit', 'Sort ascending', 'Try the groups in random order'], answer: 0, why: 'Groups with the same sum are interchangeable, so trying them again explores identical subtrees, and large numbers first fail fast.', level: 'hard' },
      { q: 'A backtracking solution passes all small tests but times out on one input with many repeated states (for example a word search on a large grid). What is the most promising fix?', options: ['Add memoisation or switch to dynamic programming if states repeat', 'Remove the base case', 'Use a global variable', 'Run it twice'], answer: 0, why: 'If different choice paths lead to the same state, cache the answer for it; if no states repeat, stronger pruning is what helps.', level: 'hard' }
    ],
    interview: [
      { q: 'What is backtracking and how is it different from brute force?', level: 'easy', points: [['Build a solution step by step with choices', ['step', 'choice', 'incremental', 'build']], ['Undo the last choice when stuck', ['undo', 'back', 'revert', 'un-choose']], ['Prune partial solutions that cannot succeed', ['prune', 'abandon', 'invalid', 'cut']], ['Still exponential in the worst case', ['exponential', 'worst', '2^n', 'n!']]], model: 'Backtracking builds a solution one choice at a time. After each choice it checks whether the partial solution can still lead to a valid answer. If not, it abandons that branch, undoes the last choice and tries the next option. Plain brute force generates every full candidate and checks it afterwards, whereas backtracking prunes early, which skips whole groups of candidates. The worst case is still exponential, for example two to the n for subsets or n factorial for permutations, so I explain what pruning I rely on.' },
      { q: 'Write down the template of a backtracking function and explain where bugs usually appear.', level: 'medium', points: [['Base case: record a result when the solution is complete', ['base case', 'complete', 'record', 'append']], ['Loop over choices, check validity, choose, recurse, undo', ['loop', 'choose', 'recurse', 'undo']], ['Copy the current path when saving it', ['copy', 'reference', 'slice']], ['Undo must restore all state; avoid duplicates with a start index or counts', ['restore', 'duplicate', 'start index', 'count']]], model: 'The function takes the current partial solution. If it is complete, I save a copy of it, and I stress the copy because otherwise every saved result points at one list that keeps changing. Otherwise I loop over the options. For each valid one I choose it, recurse, then undo it so the state is exactly as before. The common bugs are forgetting to copy, forgetting to undo one piece of state, such as a visited flag or a running sum, and producing duplicates. I avoid duplicates with a start index for combinations or by counting values for permutations with repeats.' },
      { q: 'How would you count the ways to place n queens on an n by n board, and how do you make it fast?', level: 'hard', points: [['One queen per row, choose a column', ['row', 'column']], ['Track used columns and both diagonals in sets', ['diagonal', 'set', 'row - col', 'row + col']], ['Reject a square immediately if attacked', ['reject', 'prune', 'attacked', 'conflict']], ['Roughly n factorial or less in practice; bitmasks speed it further', ['factorial', 'bitmask', 'bits', 'symmetry']]], model: 'I place one queen per row, so rows never clash. For each row I try every column, and I keep three sets: used columns, used row-minus-column diagonals and used row-plus-column diagonals. A square is allowed only if it is in none of them, which is a constant-time check. When I place a queen I add to the sets, recurse to the next row, and remove it afterwards. Reaching the last row counts one solution. The search is bounded by n factorial but pruning shrinks it enormously, and for bigger boards I could use bitmasks or mirror symmetry to halve the work.' },
      { q: 'A backtracking solution is too slow. What do you look at first?', level: 'hard', points: [['Prune earlier with a cheaper validity check', ['prune', 'early', 'check', 'bound']], ['Order choices so failures happen sooner, such as largest first', ['order', 'sort', 'largest', 'first']], ['Skip symmetric or duplicate branches', ['duplicate', 'symmetr', 'same', 'skip']], ['If states repeat, memoise or switch to dynamic programming', ['memo', 'dynamic', 'repeat', 'cache']]], model: 'I first ask where the branches are wasted. Can I reject a partial solution sooner, for example by comparing the remaining total with what is still needed? Can I order the choices so impossible cases fail high in the tree, such as placing the largest numbers first? Are there duplicate or symmetric branches I can skip, like two empty groups with the same sum? Finally I check whether different paths reach the same state. If they do, I add memoisation or move to dynamic programming, because that changes the complexity class, while pruning only improves constants in the worst case.' }
    ]
  },
];
