const R = String.raw;

export default [
  {
    id: 'linear-algebra', title: 'Linear algebra for ML', tracks: ['ds', 'mle', 'genai', 'nlp', 'cv', 'auto'],
    uses: [
      'Embedding search: documents, images and queries become vectors and are ranked by cosine similarity in vector databases and retrieval for LLMs',
      'Every neural-network layer is a matrix multiplication run on GPUs, while PCA, SVD and matrix factorisation compress data and power recommender systems'
    ],
    tasks: [
      {
        id: 'mx-cosine', title: 'Cosine similarity', level: 'easy',
        prompt: `Write \`cosine_similarity(a, b)\` for two equal-length vectors (lists or numpy arrays).

- It is the dot product divided by the product of the two lengths (L2 norms).
- If either vector has length 0, return \`0.0\` instead of dividing by zero.`,
        starter: R`import numpy as np

def cosine_similarity(a, b):
    pass

print(cosine_similarity([1, 0], [1, 1]))  # about 0.7071
`,
        solution: R`import numpy as np

def cosine_similarity(a, b):
    a = np.asarray(a, dtype=float)
    b = np.asarray(b, dtype=float)
    na = np.sqrt(np.sum(a * a))
    nb = np.sqrt(np.sum(b * b))
    if na == 0 or nb == 0:
        return 0.0
    return float(np.sum(a * b) / (na * nb))
`,
        tests: [
          { name: 'Same direction', code: R`assert close(cosine_similarity([1, 2, 3], [2, 4, 6]), 1.0), 'Vectors pointing the same way have cosine 1'` },
          { name: 'Orthogonal', code: R`assert close(cosine_similarity([1, 0], [0, 5]), 0.0), 'Perpendicular vectors have cosine 0'` },
          { name: '45 degrees', code: R`assert close(cosine_similarity([1, 0], [1, 1]), 2 ** -0.5), 'Expected 1 / sqrt(2) = 0.7071'` },
          { name: 'Opposite', code: R`assert close(cosine_similarity([1, 1], [-2, -2]), -1.0), 'Opposite vectors have cosine -1'` },
          { name: 'Zero vector', code: R`assert cosine_similarity([0, 0], [1, 2]) == 0.0, 'A zero vector should give 0.0, not an error or nan'` }
        ]
      },
      {
        id: 'mx-matmul', title: 'Matrix multiplication from scratch', level: 'medium',
        prompt: `Write \`matmul(A, B)\` for matrices given as lists of lists, **without** using \`np.matmul\`, \`@\` or \`np.dot\`.

- \`A\` is n x k and \`B\` is k x m. The result is n x m, where \`C[i][j]\` is the dot product of row \`i\` of \`A\` and column \`j\` of \`B\`.
- If the inner sizes do not match, raise \`ValueError\`.
- Return a list of lists.`,
        starter: R`def matmul(A, B):
    pass

print(matmul([[1, 2], [3, 4]], [[5, 6], [7, 8]]))  # [[19, 22], [43, 50]]
`,
        solution: R`def matmul(A, B):
    n, k = len(A), len(A[0])
    if len(B) != k:
        raise ValueError('shape mismatch')
    m = len(B[0])
    C = [[0] * m for _ in range(n)]
    for i in range(n):
        for j in range(m):
            total = 0
            for t in range(k):
                total += A[i][t] * B[t][j]
            C[i][j] = total
    return C
`,
        tests: [
          { name: 'Square', code: R`assert matmul([[1, 2], [3, 4]], [[5, 6], [7, 8]]) == [[19, 22], [43, 50]], 'Expected [[19, 22], [43, 50]]'` },
          { name: 'Rectangular', code: R`assert matmul([[1, 2, 3], [4, 5, 6]], [[1], [0], [2]]) == [[7], [16]], '2x3 times 3x1 should give a 2x1 result [[7], [16]]'` },
          { name: 'Identity', code: R`assert matmul([[2, 3], [4, 5]], [[1, 0], [0, 1]]) == [[2, 3], [4, 5]], 'Multiplying by the identity changes nothing'` },
          { name: 'Order matters', code: R`assert matmul([[1, 2], [3, 4]], [[0, 1], [1, 0]]) == [[2, 1], [4, 3]], 'Expected the columns of A swapped'` },
          { name: 'Shape mismatch', code: R`try:
    matmul([[1, 2]], [[1, 2]])
    ok = False
except ValueError:
    ok = True
assert ok, '1x2 times 1x2 is invalid: raise ValueError'` }
        ]
      },
      {
        id: 'mx-power-iter', title: 'Dominant eigenvector by power iteration', level: 'hard',
        prompt: `Write \`power_iteration(A, iters=200)\` returning \`(eigenvalue, eigenvector)\` for the eigenvalue of **largest absolute value** of a square numpy matrix \`A\`.

1. Start with \`v = np.ones(n)\` scaled to length 1.
2. Repeat \`iters\` times: \`v = A @ v\`, then divide \`v\` by its L2 norm.
3. The eigenvalue is the Rayleigh quotient \`v @ A @ v\` (valid because \`v\` has length 1).

Return the eigenvalue as a float and the unit vector as a numpy array.`,
        starter: R`import numpy as np

def power_iteration(A, iters=200):
    pass

val, vec = power_iteration(np.array([[2.0, 1.0], [1.0, 2.0]]))
print(val, vec)  # 3.0 and about [0.707, 0.707]
`,
        solution: R`import numpy as np

def power_iteration(A, iters=200):
    A = np.asarray(A, dtype=float)
    n = A.shape[0]
    v = np.ones(n) / np.sqrt(n)
    for _ in range(iters):
        v = A @ v
        v = v / np.sqrt(np.sum(v * v))
    return float(v @ A @ v), v
`,
        tests: [
          { name: 'Diagonal matrix', code: R`val, vec = power_iteration(np.array([[2.0, 0.0], [0.0, 1.0]]))
assert close(val, 2.0, 1e-6), 'Largest eigenvalue of diag(2, 1) is 2'` },
          { name: 'Symmetric 2x2', code: R`val, vec = power_iteration(np.array([[2.0, 1.0], [1.0, 2.0]]))
assert close(val, 3.0, 1e-6), 'Eigenvalues are 3 and 1, so expect 3'
assert close(np.abs(vec), np.array([2 ** -0.5, 2 ** -0.5]), 1e-6), 'Eigenvector should be about [0.707, 0.707]'` },
          { name: 'Non-symmetric', code: R`val, vec = power_iteration(np.array([[4.0, 1.0], [2.0, 3.0]]))
assert close(val, 5.0, 1e-6), 'Eigenvalues of [[4,1],[2,3]] are 5 and 2'` },
          { name: 'Three by three', code: R`A = np.array([[2.0, 0.0, 0.0], [0.0, 3.0, 0.0], [0.0, 0.0, 1.0]])
val, vec = power_iteration(A)
assert close(val, 3.0, 1e-6), 'Largest eigenvalue is 3'
assert close(np.abs(vec), np.array([0.0, 1.0, 0.0]), 1e-6), 'Eigenvector should point along the second axis'` },
          { name: 'Unit length and eigen-equation', code: R`A = np.array([[4.0, 1.0], [2.0, 3.0]])
val, vec = power_iteration(A)
assert close(float(np.sqrt(np.sum(vec * vec))), 1.0, 1e-6), 'Return a unit-length vector'
assert close(A @ vec, val * vec, 1e-5), 'A @ v should equal eigenvalue * v'` }
        ]
      }
    ],
    quiz: [
      { q: 'What is the dot product of [1, 2, 3] and [4, 5, 6]?', options: ['32', '21', '15', '28'], answer: 0, why: 'Multiply matching entries and add: 4 + 10 + 18 = 32.', level: 'easy' },
      { q: 'A has shape 3 x 2 and B has shape 2 x 4. What is the shape of A @ B?', options: ['2 x 2', '3 x 4', '4 x 3', 'It is not defined'], answer: 1, why: 'The inner sizes (2 and 2) match and vanish, leaving rows of A by columns of B.', level: 'easy' },
      { q: 'What does the transpose of a matrix do?', options: ['Swaps its rows and columns', 'Multiplies every entry by -1', 'Inverts every entry', 'Sorts its rows'], answer: 0, why: 'Entry (i, j) of the transpose is entry (j, i) of the original.', level: 'easy' },
      { q: 'What is the L2 norm (length) of the vector [3, 4]?', options: ['7', '5', '25', '1'], answer: 1, why: 'The square root of 9 + 16 is 5.', level: 'easy' },
      { q: 'What is the cosine similarity of [1, 0] and [1, 1]?', options: ['0', '1', 'about 0.71', 'about 1.41'], answer: 2, why: 'Dot product 1 divided by lengths 1 and sqrt(2) gives 0.707.', level: 'medium' },
      { q: 'Which matrix has no inverse?', options: ['[[1, 2], [3, 4]]', '[[2, 0], [0, 5]]', '[[1, 2], [2, 4]]', '[[0, 1], [1, 0]]'], answer: 2, why: 'The second row is twice the first, so the determinant 1*4 - 2*2 is 0 and the rank is 1.', level: 'medium' },
      { q: 'A = [[2, 1], [1, 2]]. What are its eigenvalues?', options: ['2 and 1', '4 and 0', '3 and 1', '2 and 2'], answer: 2, why: 'The trace is 4 and the determinant is 3, so the eigenvalues are 3 and 1.', level: 'medium' },
      { q: 'Solve A x = b for A = [[2, 0], [0, 4]] and b = [6, 8]. What is x?', options: ['[3, 2]', '[12, 32]', '[2, 3]', '[4, 4]'], answer: 0, why: 'Each row is separate: 2 x1 = 6 gives 3, and 4 x2 = 8 gives 2.', level: 'medium' },
      { q: 'You centre a data matrix X (1000 samples, 50 features). Which vectors are the principal components?', options: ['The rows of X with the largest norm', 'Eigenvectors of the covariance matrix, which are the right singular vectors of X', 'Eigenvectors of X itself', 'The columns with the highest mean'], answer: 1, why: 'PCA directions are the covariance eigenvectors, equal to the right singular vectors from the SVD of the centred data.', level: 'hard' },
      { q: 'A dense layer maps 512 inputs to 256 outputs with a bias vector. How many parameters does it have?', options: ['131,072', '768', '131,328', '262,144'], answer: 2, why: 'The weight matrix has 512 x 256 = 131,072 entries and the bias adds 256.', level: 'hard' },
      { q: 'What does truncated SVD with the top k singular values give you?', options: ['The best rank-k approximation in the least-squares sense', 'An exact copy of the matrix with k entries removed', 'The k rows with the largest norms', 'A sparse version of the matrix'], answer: 0, why: 'The Eckart-Young theorem says keeping the top k singular triplets minimises the squared reconstruction error among all rank-k matrices.', level: 'hard' },
      { q: 'Linear regression with two almost identical features gives unstable weights. What is the linear-algebra reason?', options: ['X is too tall', 'The columns are nearly dependent, so X^T X is close to singular and ill-conditioned', 'The transpose is not defined', 'The eigenvalues are all negative'], answer: 1, why: 'Nearly dependent columns make X^T X almost non-invertible, so tiny noise changes the solution a lot; ridge regularisation fixes it.', level: 'hard' }
    ],
    interview: [
      {
        q: 'What is a dot product and what does it tell you?', level: 'easy',
        points: [['Multiply matching entries and sum', ['multipl', 'sum', 'add']], ['Equals the product of lengths and the cosine of the angle', ['cosine', 'angle', 'length', 'norm']], ['Large when vectors point the same way, zero when perpendicular', ['perpendicular', 'orthogonal', 'same direction', 'similar']], ['Used everywhere: similarity, neuron pre-activations', ['similar', 'neuron', 'layer', 'weighted']]],
        model: 'The dot product multiplies two vectors entry by entry and adds the results. Geometrically it equals the length of one vector times the length of the other times the cosine of the angle between them. So it is large and positive when the vectors point the same way, zero when they are perpendicular, and negative when they point apart. In machine learning it is a similarity score, and a neuron is just a dot product between its weights and the inputs, plus a bias. Attention in transformers also scores queries against keys with dot products.'
      },
      {
        q: 'What is an eigenvector of a matrix, in plain words?', level: 'easy',
        points: [['A direction the matrix only stretches, not rotates', ['stretch', 'direction', 'scale', 'same direction']], ['A v = lambda v, with eigenvalue lambda', ['lambda', 'eigenvalue', 'a v', 'scalar']], ['Eigenvalue says how much it is stretched or flipped', ['stretch', 'flip', 'factor', 'magnitude']], ['Example use: PCA, stability, PageRank', ['pca', 'pagerank', 'principal', 'covariance']]],
        model: 'An eigenvector of a matrix is a special direction that the matrix does not turn. When you apply the matrix to it, the result lies on the same line, just scaled by a number called the eigenvalue. In symbols, A times v equals lambda times v. If lambda is 2 the vector doubles, if it is negative the vector flips. Eigenvectors matter in machine learning because the covariance matrix has eigenvectors that are the principal components, and they also describe long-run behaviour, such as in PageRank.'
      },
      {
        q: 'What is the difference between the L1 and L2 norm, and why does it matter in ML?', level: 'easy',
        points: [['L1 is the sum of absolute values, L2 the root of the sum of squares', ['absolute', 'square', 'sum']], ['L1 regularisation pushes weights to exactly zero (sparsity)', ['sparse', 'sparsity', 'zero', 'lasso', 'feature selection']], ['L2 shrinks weights smoothly and penalises large ones more', ['shrink', 'smooth', 'ridge', 'weight decay', 'large']], ['Also used as distances', ['distance', 'manhattan', 'euclid']]],
        model: 'The L1 norm adds up the absolute values of the entries, and the L2 norm is the square root of the sum of squares, which is the ordinary length. As penalties on weights they behave differently. L1 regularisation, as in lasso, tends to drive many weights to exactly zero, so it performs feature selection and gives sparse models. L2 regularisation, ridge or weight decay, shrinks all weights smoothly and punishes large ones heavily, but rarely makes them exactly zero. As distances, L1 is the Manhattan distance and L2 the straight-line Euclidean distance.'
      },
      {
        q: 'Why is cosine similarity often preferred to Euclidean distance for embeddings?', level: 'medium',
        points: [['Cosine compares direction and ignores length', ['direction', 'angle', 'ignore', 'length', 'magnitude']], ['Vector length often reflects things like text length or frequency, not meaning', ['frequency', 'text length', 'magnitude', 'norm']], ['If vectors are normalised, cosine equals the dot product and ranks like Euclidean distance', ['normalis', 'normaliz', 'unit', 'dot product']], ['Efficient in vector search', ['search', 'index', 'ann', 'fast']]],
        model: 'Cosine similarity measures the angle between two vectors, so it looks at direction and ignores length. For many embeddings the direction carries the meaning, while the length can reflect incidental things such as how long a document was or how frequent a word is. Euclidean distance would punish those length differences. A practical bonus is that if you normalise every vector to length one, cosine similarity becomes a plain dot product and ranks neighbours exactly like Euclidean distance, which makes approximate nearest-neighbour search simple and fast.'
      },
      {
        q: 'What are rank and invertibility, and why do they matter for linear regression?', level: 'medium',
        points: [['Rank is the number of independent rows or columns', ['independent', 'linearly', 'dimension', 'number of']], ['A square matrix is invertible only when it has full rank (determinant not zero)', ['full rank', 'determinant', 'invertible', 'singular']], ['Collinear features make X^T X singular or ill-conditioned', ['collinear', 'multicollinear', 'singular', 'ill-condition', 'redundant']], ['Fix with dropping or combining features, or ridge regularisation, or the pseudo-inverse', ['ridge', 'regulari', 'pseudo', 'drop', 'lstsq']]],
        model: 'Rank counts how many rows or columns are genuinely independent. A square matrix can be inverted only if it has full rank, which also means its determinant is not zero. In linear regression the normal equation needs X transpose X to be invertible. If two features are duplicates, or one is a combination of others, the matrix loses rank and there is no unique solution. Even near duplicates make it ill-conditioned, so the weights swing wildly. We handle that by removing redundant features, adding ridge regularisation, or using a least-squares solver based on the SVD.'
      },
      {
        q: 'How are PCA, covariance and eigenvectors connected?', level: 'medium',
        points: [['Centre the data first', ['centre', 'center', 'mean', 'subtract']], ['Compute the covariance matrix', ['covariance']], ['Eigenvectors are the principal directions, eigenvalues the variance along them', ['eigenvector', 'eigenvalue', 'variance']], ['Keep the top k and project to reduce dimension', ['top k', 'project', 'reduce', 'dimension', 'largest']], ['Equivalent to SVD of the centred data', ['svd', 'singular']]],
        model: 'PCA first centres the data by subtracting the mean of each feature. Then it looks at the covariance matrix. The eigenvectors of that matrix are the principal directions, and each eigenvalue is the variance of the data along its direction. We sort them from largest to smallest, keep the top k, and project the data onto those k directions, which reduces dimension while keeping as much variance as possible. In practice we get the same result from the SVD of the centred data matrix, which is numerically more stable.'
      },
      {
        q: 'A dense layer takes a batch of 32 inputs with 100 features and has 64 units. Walk through the shapes.', level: 'medium',
        points: [['Input X is 32 x 100', ['32', '100']], ['Weight matrix W is 100 x 64, bias has 64 values', ['64', 'weight', 'bias']], ['Output is X @ W + b with shape 32 x 64, bias broadcast over rows', ['broadcast', '32 x 64', '32x64', 'output']], ['Parameter count 100 x 64 + 64 = 6,464', ['6464', '6,464', 'parameter']]],
        model: 'The batch X has shape 32 by 100: 32 examples, 100 features each. The weight matrix W has shape 100 by 64, so that the inner sizes match, and there is a bias vector of 64 numbers. Multiplying X by W gives 32 by 64, and the bias is broadcast, meaning added to every row. So the output has one row per example and one column per unit. The layer has 100 times 64 plus 64, which is 6,464 parameters, and the whole forward pass is one matrix multiplication, which GPUs do very efficiently.'
      },
      {
        q: 'Explain the SVD and give two uses in machine learning.', level: 'hard',
        points: [['Factorises any matrix as U Sigma V^T: rotate, scale, rotate', ['rotate', 'u sigma', 'factor', 'decompos', 'orthogonal']], ['Singular values are sorted by importance', ['singular value', 'sorted', 'importance', 'largest']], ['Truncating gives the best low-rank approximation', ['low-rank', 'low rank', 'truncat', 'eckart', 'approximat']], ['Uses: PCA, compression, recommenders, latent semantic analysis, LoRA', ['pca', 'compress', 'recommend', 'latent', 'lora', 'denois']], ['Works for non-square matrices and is stable', ['stable', 'rectangular', 'any matrix', 'non-square']]],
        model: 'The singular value decomposition writes any matrix as U times Sigma times V transpose: a rotation, a stretch along the axes by the singular values, and another rotation. The singular values are sorted, so keeping only the top k gives the best rank-k approximation, which is the Eckart-Young result. That powers PCA, image and embedding compression, noise removal, latent semantic analysis, and matrix factorisation for recommenders, where users and items share a small latent space. LoRA fine-tuning is built on the same low-rank idea. Unlike eigendecomposition it works for any rectangular matrix and is numerically stable.'
      },
      {
        q: 'You must find the nearest neighbours of a query among 10 million 768-dimensional embeddings. How would you approach it?', level: 'hard',
        points: [['Brute force is a huge matrix multiplication, about 7.7 billion multiply-adds per query', ['brute', 'matrix', 'billion', 'exact']], ['Normalise vectors so cosine becomes a dot product', ['normalis', 'normaliz', 'dot product', 'unit']], ['Use approximate nearest-neighbour indexes such as HNSW or IVF', ['hnsw', 'ivf', 'approximate', 'ann', 'faiss', 'index']], ['Compress with product quantisation or lower dimension (PCA)', ['quantis', 'quantiz', 'compress', 'pca', 'dimension', 'float16']], ['Measure recall against exact search and tune the trade-off with latency', ['recall', 'latency', 'trade', 'tune']]],
        model: 'Exact search means one dot product per vector, 10 million times 768, about 7.7 billion multiply-adds for each query. That is fine for batch jobs on a GPU but slow for live traffic. So I normalise the vectors, which turns cosine into a dot product, and build an approximate nearest-neighbour index such as HNSW graphs or IVF clusters, for example with FAISS. I can shrink memory with product quantisation, half precision, or PCA to fewer dimensions. Then I measure recall against exact search on a sample and tune the index so I hit the latency target with acceptable recall.'
      },
      {
        q: 'Why do numerical libraries solve A x = b without computing the inverse of A?', level: 'hard',
        points: [['Factorisations like LU, QR or Cholesky are faster than inverting', ['lu', 'qr', 'cholesky', 'factoris', 'factoriz', 'faster']], ['Inverses are less accurate and amplify rounding error', ['accura', 'rounding', 'error', 'stable', 'numerical']], ['The condition number measures how sensitive the solution is', ['condition number', 'sensitive', 'ill-condition']], ['Regularisation or the pseudo-inverse handles singular or tall systems', ['ridge', 'regulari', 'pseudo', 'least squares', 'lstsq']]],
        model: 'Forming the inverse costs more and is less accurate than solving directly. Libraries factorise the matrix, with LU, QR or Cholesky, and then solve by cheap forward and back substitution. The explicit inverse accumulates rounding error, and for ill-conditioned matrices, where the condition number is huge, a tiny change in b or A changes x a lot. For regression with more rows than columns we use least squares through QR or the SVD, and when the matrix is nearly singular we add ridge regularisation, which makes the problem well-conditioned. In code that means calling solve or lstsq, never inv.'
      }
    ]
  }
,
  {
    id: 'calculus', title: 'Calculus and optimisation for ML', tracks: ['ds', 'mle', 'genai', 'nlp', 'cv', 'auto'],
    uses: [
      'Backpropagation: deep-learning frameworks apply the chain rule over a computation graph to get the gradient of the loss for millions or billions of weights',
      'Optimisers such as SGD with momentum and Adam, with learning-rate schedules, train everything from logistic regression to large language models'
    ],
    tasks: [
      {
        id: 'mx-numderiv', title: 'Numerical derivative', level: 'easy',
        prompt: `Write \`numerical_derivative(f, x, h=1e-5)\` that estimates the derivative of a function \`f\` at \`x\` with the **central difference**:

\`(f(x + h) - f(x - h)) / (2 * h)\`

It is more accurate than the one-sided version because the error terms cancel.`,
        starter: R`def numerical_derivative(f, x, h=1e-5):
    pass

print(numerical_derivative(lambda t: t ** 2, 3.0))  # about 6.0
`,
        solution: R`def numerical_derivative(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)
`,
        tests: [
          { name: 'Square', code: R`assert close(numerical_derivative(lambda t: t ** 2, 3.0), 6.0, 1e-6), 'd/dx x^2 at 3 is 6'` },
          { name: 'Cube', code: R`assert close(numerical_derivative(lambda t: t ** 3, 2.0), 12.0, 1e-6), 'd/dx x^3 at 2 is 3 * 4 = 12'` },
          { name: 'Sine at zero', code: R`import math
assert close(numerical_derivative(math.sin, 0.0), 1.0, 1e-6), 'cos(0) = 1'` },
          { name: 'Constant', code: R`assert abs(numerical_derivative(lambda t: 7.0, 5.0)) < 1e-6, 'The derivative of a constant is 0'` },
          { name: 'Negative slope', code: R`assert close(numerical_derivative(lambda t: -4 * t + 1, 10.0), -4.0, 1e-6), 'The slope of -4x + 1 is -4'` }
        ]
      },
      {
        id: 'mx-gradcheck', title: 'Gradient check', level: 'medium',
        prompt: `Backprop bugs are silent, so engineers compare an analytical gradient with a numerical one.

Write \`grad_check(f, grad, x, eps=1e-5)\`:

- \`f(x)\` returns a scalar for a 1-D numpy array \`x\`; \`grad(x)\` returns the analytical gradient as an array of the same shape.
- Estimate each partial derivative with the central difference (change one coordinate by \`+eps\` and \`-eps\`).
- Return the **largest absolute difference** between the numerical and analytical gradient, as a float.
- Do not leave \`x\` modified: work on a copy.`,
        starter: R`import numpy as np

def grad_check(f, grad, x, eps=1e-5):
    pass

x = np.array([1.0, 2.0])
print(grad_check(lambda v: np.sum(v ** 2), lambda v: 2 * v, x))  # tiny, about 1e-10
`,
        solution: R`import numpy as np

def grad_check(f, grad, x, eps=1e-5):
    x = np.array(x, dtype=float)
    numeric = np.zeros_like(x)
    for i in range(len(x)):
        up = x.copy()
        down = x.copy()
        up[i] += eps
        down[i] -= eps
        numeric[i] = (f(up) - f(down)) / (2 * eps)
    return float(np.max(np.abs(numeric - grad(x))))
`,
        tests: [
          { name: 'Correct gradient', code: R`err = grad_check(lambda v: np.sum(v ** 2), lambda v: 2 * v, np.array([1.0, -2.0, 3.0]))
assert err < 1e-6, 'A correct gradient should give a tiny difference, got %s' % err` },
          { name: 'Wrong gradient is caught', code: R`err = grad_check(lambda v: np.sum(v ** 2), lambda v: 3 * v, np.array([1.0, -2.0, 3.0]))
assert err > 1.0, 'The wrong gradient 3x should differ clearly, got %s' % err` },
          { name: 'Cross terms', code: R`f = lambda v: v[0] * v[1] + v[1] ** 2
g = lambda v: np.array([v[1], v[0] + 2 * v[1]])
assert grad_check(f, g, np.array([2.0, 3.0])) < 1e-6, 'f = x0*x1 + x1^2 has gradient [x1, x0 + 2*x1]'` },
          { name: 'Input not modified', code: R`x = np.array([1.0, 2.0])
grad_check(lambda v: np.sum(v ** 2), lambda v: 2 * v, x)
assert list(x) == [1.0, 2.0], 'grad_check must not change the array it was given'` },
          { name: 'Returns a float', code: R`err = grad_check(lambda v: np.sum(v), lambda v: np.ones_like(v), np.array([0.5, 0.5]))
assert isinstance(err, float), 'Return a plain float'` }
        ]
      },
      {
        id: 'mx-linfit-gd', title: 'Fit a line with gradient descent and momentum', level: 'hard',
        prompt: `Write \`fit_line(x, y, lr, steps, momentum=0.0)\` that fits \`y = w * x + b\` by minimising the mean squared error with gradient descent. Start from \`w = 0, b = 0\`. Use numpy only.

For each step:

1. \`err = w * x + b - y\`
2. Gradients: \`gw = 2 * mean(err * x)\` and \`gb = 2 * mean(err)\`
3. Velocities: \`vw = momentum * vw - lr * gw\` and \`vb = momentum * vb - lr * gb\` (both start at 0)
4. Update: \`w += vw\` and \`b += vb\`

With \`momentum=0\` this is plain gradient descent. Return \`(w, b)\` as floats.`,
        starter: R`import numpy as np

def fit_line(x, y, lr, steps, momentum=0.0):
    pass

x = [0, 1, 2, 3, 4]
y = [1, 3, 5, 7, 9]
print(fit_line(x, y, 0.05, 2000))  # about (2.0, 1.0)
`,
        solution: R`import numpy as np

def fit_line(x, y, lr, steps, momentum=0.0):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    w = b = 0.0
    vw = vb = 0.0
    for _ in range(steps):
        err = w * x + b - y
        gw = 2 * np.mean(err * x)
        gb = 2 * np.mean(err)
        vw = momentum * vw - lr * gw
        vb = momentum * vb - lr * gb
        w += vw
        b += vb
    return float(w), float(b)
`,
        tests: [
          { name: 'Recovers a clean line', code: R`w, b = fit_line([0, 1, 2, 3, 4], [1, 3, 5, 7, 9], 0.05, 2000)
assert close(w, 2.0, 1e-3) and close(b, 1.0, 1e-3), 'Expected about (2, 1), got (%s, %s)' % (w, b)` },
          { name: 'Zero steps', code: R`assert fit_line([1, 2], [3, 4], 0.1, 0) == (0.0, 0.0), 'With no steps the parameters stay at 0'` },
          { name: 'One step by hand', code: R`w, b = fit_line([1, 2], [2, 4], 0.1, 1)
# err = [-2, -4]; gw = 2 * mean([-2, -8]) = -10; gb = 2 * mean([-2, -4]) = -6
assert close(w, 1.0) and close(b, 0.6), 'After one step expect w = 1.0 and b = 0.6, got (%s, %s)' % (w, b)` },
          { name: 'Momentum converges', code: R`w, b = fit_line([0, 1, 2, 3, 4], [1, 3, 5, 7, 9], 0.01, 2000, momentum=0.9)
assert close(w, 2.0, 1e-3) and close(b, 1.0, 1e-3), 'Momentum 0.9 should still reach (2, 1), got (%s, %s)' % (w, b)` },
          { name: 'Matches least squares on noisy data', code: R`xs = [0, 1, 2, 3, 4, 5]
ys = [0.9, 3.2, 4.8, 7.1, 9.2, 10.8]
w, b = fit_line(xs, ys, 0.02, 20000)
pw, pb = np.polyfit(xs, ys, 1)
assert close(w, pw, 1e-3) and close(b, pb, 1e-3), 'Gradient descent should approach the least-squares line (%s, %s), got (%s, %s)' % (pw, pb, w, b)` }
        ]
      }
    ],
    quiz: [
      { q: 'What is the derivative of f(x) = x^3 at x = 2?', options: ['8', '6', '12', '4'], answer: 2, why: 'The derivative of x^3 is 3x^2, which is 3 * 4 = 12 at x = 2.', level: 'easy' },
      { q: 'What is the gradient of a function of several variables?', options: ['The vector of its partial derivatives', 'Its largest value', 'The average of its inputs', 'A single second derivative'], answer: 0, why: 'It collects the slope along each input axis and points in the direction of steepest increase.', level: 'easy' },
      { q: 'In which direction does gradient descent move the parameters?', options: ['Along the gradient', 'Opposite to the gradient', 'Perpendicular to the gradient', 'Randomly'], answer: 1, why: 'The gradient points uphill, so stepping against it lowers the loss.', level: 'easy' },
      { q: 'What usually happens if the learning rate is far too large?', options: ['Training becomes slower but safe', 'The loss oscillates or diverges', 'The model memorises the data', 'The gradient becomes zero'], answer: 1, why: 'Steps overshoot the minimum, so the loss bounces or grows.', level: 'easy' },
      { q: 'f(x, y) = x^2 * y. What is the partial derivative with respect to x at the point (2, 3)?', options: ['4', '12', '6', '18'], answer: 1, why: 'The partial derivative is 2xy, which is 2 * 2 * 3 = 12.', level: 'medium' },
      { q: 'y = (3x + 1)^2. What is dy/dx at x = 1?', options: ['8', '16', '24', '12'], answer: 2, why: 'Chain rule: 2(3x + 1) * 3 = 2 * 4 * 3 = 24.', level: 'medium' },
      { q: 'The sigmoid is s(z) = 1 / (1 + e^-z) and its derivative is s(z)(1 - s(z)). What is the derivative at z = 0?', options: ['0.5', '1', '0', '0.25'], answer: 3, why: 's(0) = 0.5, so the derivative is 0.5 * 0.5 = 0.25, its maximum.', level: 'medium' },
      { q: 'Squared error L = (p - y)^2 with prediction p = 3 and target y = 5. What is dL/dp?', options: ['-4', '4', '-2', '2'], answer: 0, why: 'dL/dp = 2(p - y) = 2 * (-2) = -4, so increasing p lowers the loss.', level: 'medium' },
      { q: 'Which statement about a convex loss function is true?', options: ['It has no minimum', 'Every local minimum is a global minimum', 'Gradient descent cannot be used', 'Its gradient is always zero'], answer: 1, why: 'Convexity means the surface is bowl-shaped, so there are no separate bad valleys.', level: 'hard' },
      { q: 'In a very high-dimensional loss surface, why are saddle points a bigger practical worry than bad local minima?', options: ['The gradient is zero there but some directions still go downhill, so progress stalls', 'The loss is infinite there', 'Saddle points are always the global minimum', 'They make the loss convex'], answer: 0, why: 'At a saddle the gradient vanishes while the Hessian has both positive and negative eigenvalues; for a real minimum all directions must curve up.', level: 'hard' },
      { q: 'Gradient descent on f(w) = w^2 starts at w = 1 with learning rate 1.0. What is w after 3 steps?', options: ['1', '0', '-1', '0.125'], answer: 2, why: 'Each step does w - 1.0 * 2w = -w, so w goes 1, -1, 1, -1 and never settles.', level: 'hard' },
      { q: 'Softmax outputs p = [0.7, 0.2, 0.1] and the true class is the first. The cross-entropy gradient with respect to the logits is p minus the one-hot label. What is it?', options: ['[0.7, 0.2, 0.1]', '[0.3, -0.2, -0.1]', '[-0.3, 0.2, 0.1]', '[-0.7, 0.8, 0.9]'], answer: 2, why: 'Subtract [1, 0, 0] from p: [0.7 - 1, 0.2, 0.1] = [-0.3, 0.2, 0.1].', level: 'hard' }
    ],
    interview: [
      {
        q: 'What is a gradient and why does machine learning need it?', level: 'easy',
        points: [['Vector of partial derivatives of the loss with respect to each parameter', ['partial', 'derivative', 'vector']], ['Points in the direction of steepest increase', ['steepest', 'uphill', 'increase', 'direction']], ['We step the opposite way to reduce the loss', ['opposite', 'descent', 'reduce', 'minimi']], ['Tells us how much each parameter matters', ['sensitiv', 'each parameter', 'matters', 'how much']]],
        model: 'The gradient is a vector containing the partial derivative of the loss with respect to every parameter. Each entry tells us how the loss changes if we nudge that one parameter, and together they point in the direction of steepest increase. Training wants to reduce the loss, so we move the parameters a small step in the opposite direction. This gives a cheap, general recipe to improve any model whose loss is differentiable, even with billions of parameters, because backpropagation computes the whole gradient in roughly the cost of a couple of forward passes.'
      },
      {
        q: 'Explain gradient descent in your own words.', level: 'easy',
        points: [['Start from some parameters and compute the loss gradient', ['start', 'initial', 'gradient']], ['Update: parameters minus learning rate times gradient', ['learning rate', 'minus', 'subtract', 'update']], ['Repeat until the loss stops improving', ['repeat', 'iterat', 'converge', 'stop']], ['Like walking downhill in fog, feeling the slope', ['downhill', 'hill', 'valley', 'slope']]],
        model: 'Gradient descent is like walking downhill in fog. At your current position you feel the slope, which is the gradient of the loss, and take a step in the downhill direction. The size of the step is the learning rate. In symbols, new parameters equal old parameters minus learning rate times gradient. You repeat that many times until the loss stops improving, meaning you have reached a minimum or a flat region. It is simple, but it is the engine behind training almost every modern model.'
      },
      {
        q: 'What does the learning rate do, and how do you choose it?', level: 'easy',
        points: [['It scales the step size', ['step', 'size', 'scale']], ['Too high: loss oscillates or diverges; too low: slow, may stall', ['diverge', 'oscillat', 'slow', 'overshoot']], ['Tune on a log scale, try 1e-1 to 1e-5', ['log', '1e-', 'search', 'range', 'grid']], ['Use schedules or warm-up, watch the training curve', ['schedule', 'warm', 'decay', 'curve']]],
        model: 'The learning rate is the size of each gradient step. If it is too high the updates overshoot the minimum, so the loss bounces around or even explodes. If it is too low, training is painfully slow and can get stuck on plateaus. I search for it on a logarithmic scale, say from 0.1 down to 0.00001, watching the loss curve over a short run. For deep nets I often use warm-up followed by a decay schedule such as cosine, and adaptive optimisers like Adam are less sensitive to the starting value.'
      },
      {
        q: 'Explain backpropagation and the chain rule.', level: 'medium',
        points: [['A network is a chain or graph of simple functions', ['graph', 'chain', 'composition', 'layers']], ['Chain rule multiplies local derivatives along the path', ['multipl', 'local', 'chain rule']], ['Forward pass stores values, backward pass sends gradients from loss to inputs', ['forward', 'backward', 'store', 'cache']], ['Reuses intermediate results so cost is about that of a forward pass', ['reuse', 'efficient', 'cost', 'automatic differentiation', 'autograd']]],
        model: 'A network is a composition of simple operations, which we can draw as a computation graph. The chain rule says the derivative of a composition is the product of the local derivatives along the path. In the forward pass we compute and store every intermediate value. In the backward pass we start with the derivative of the loss, which is one, and move backwards through the graph, multiplying by each operation local derivative and adding contributions where paths merge. Because intermediate results are reused, the full gradient costs only about as much as a forward pass. Autograd frameworks automate exactly this.'
      },
      {
        q: 'Compare batch, stochastic and mini-batch gradient descent.', level: 'medium',
        points: [['Batch uses all data per step: exact but slow', ['all data', 'full', 'exact', 'slow']], ['Stochastic uses one example: cheap, noisy', ['one example', 'single', 'noisy', 'noise']], ['Mini-batch is the compromise, using 32 to 1024 examples', ['mini', 'compromise', 'batch size', '32', '256']], ['Noise can help escape poor regions, GPUs like batches', ['escape', 'gpu', 'parallel', 'generalis', 'generaliz']], ['Larger batches allow bigger learning rates but need tuning', ['learning rate', 'larger batch', 'scale']]],
        model: 'Full-batch gradient descent computes the gradient on the whole dataset for every step. It is exact, but each step is expensive and we may not even fit the data in memory. Stochastic gradient descent uses a single example, which is cheap but very noisy. Mini-batch sits in between, using something like 32 to 1024 examples, giving a good gradient estimate and taking full advantage of GPU parallelism. The noise is not all bad, since it can help the optimiser escape sharp or poor regions and often improves generalisation. With bigger batches you can raise the learning rate, but it needs retuning.'
      },
      {
        q: 'How do momentum and Adam improve on plain gradient descent?', level: 'medium',
        points: [['Momentum keeps a running average of gradients, like a rolling ball', ['running average', 'velocity', 'ball', 'inertia', 'accumulate']], ['It damps oscillation and speeds up along consistent directions', ['damp', 'oscillat', 'speed', 'consistent', 'ravine']], ['Adam also tracks a running average of squared gradients to scale each parameter step', ['squared', 'per-parameter', 'adaptive', 'scale', 'second moment']], ['Bias correction and defaults such as beta 0.9 and 0.999', ['bias', '0.9', '0.999', 'default']]],
        model: 'Plain gradient descent zigzags in narrow valleys. Momentum keeps a running average of past gradients, a bit like a heavy ball with inertia, so it cancels the oscillating components and builds speed along directions where gradients agree. Adam adds a second running average, of the squared gradients, and divides the step by its square root. That gives each parameter its own adaptive step size, so rarely updated weights move more. It also bias-corrects the early averages, and the usual defaults of 0.9 and 0.999 work well. That is why Adam is a strong default, though well-tuned SGD with momentum can generalise better on some vision models.'
      },
      {
        q: 'What is the gradient of the logistic or softmax cross-entropy loss with respect to the logits, and why is it so convenient?', level: 'medium',
        points: [['It equals predicted probabilities minus the one-hot labels', ['minus', 'p - y', 'difference', 'predicted', 'one-hot']], ['The sigmoid and softmax derivatives cancel with the log', ['cancel', 'log', 'simplif']], ['No vanishing gradient from saturation when the model is confidently wrong', ['saturat', 'vanish', 'confident', 'wrong']], ['Gradient is large when the error is large', ['error', 'large', 'proportional']]],
        model: 'For softmax with cross-entropy, or sigmoid with binary cross-entropy, the gradient with respect to the logits is simply the predicted probability minus the true label. The derivative of the activation and the derivative of the log cancel each other, which leaves that clean expression. It is convenient because it is proportional to the error, so a confidently wrong prediction gets a large gradient and learns fast. If you used squared error with a sigmoid instead, saturation would multiply the gradient by a tiny number and training would stall. This is a key reason cross-entropy is the standard classification loss.'
      },
      {
        q: 'What are vanishing and exploding gradients, and how do you fight them?', level: 'hard',
        points: [['Backprop multiplies many local derivatives', ['multipl', 'product', 'chain rule', 'many layers']], ['Factors below 1 shrink to zero, above 1 blow up', ['shrink', 'zero', 'blow', 'explod', 'vanish']], ['Causes: sigmoid or tanh saturation, poor initialisation, long sequences', ['sigmoid', 'tanh', 'saturat', 'initialis', 'initializ', 'sequence']], ['Fixes: ReLU, careful initialisation, normalisation, residual connections, gradient clipping, LSTMs', ['relu', 'normalis', 'normaliz', 'residual', 'skip', 'clipping', 'lstm', 'init']]],
        model: 'Backpropagation multiplies one local derivative per layer or time step. If those factors are mostly below one, the product shrinks towards zero and early layers barely learn, which is the vanishing problem. If they are above one, the product blows up and training diverges. Saturating activations such as sigmoid and tanh, bad initialisation and long sequences make it worse. The standard fixes are ReLU-style activations, variance-preserving initialisation such as He or Xavier, batch or layer normalisation, residual connections that give the gradient a shortcut, gradient clipping for explosions, and gated cells like LSTMs for sequences.'
      },
      {
        q: 'Are local minima and saddle points a problem when training deep networks?', level: 'hard',
        points: [['The loss is non-convex, so there is no guarantee of a global minimum', ['non-convex', 'nonconvex', 'convex', 'guarantee']], ['In high dimensions saddle points are far more common than bad local minima', ['saddle', 'high dimension', 'common']], ['Saddles and flat plateaus slow training because the gradient is near zero', ['plateau', 'flat', 'near zero', 'slow', 'stall']], ['Noise from SGD, momentum and Adam help to escape; many minima generalise similarly', ['noise', 'momentum', 'adam', 'escape', 'generalis', 'generaliz']]],
        model: 'Deep network losses are non-convex, so we have no guarantee of reaching the global minimum. In practice, though, bad local minima turn out to be rare in very high dimensions. To be a minimum, the surface must curve upwards in every one of millions of directions, which is unlikely unless the loss is already low. Saddle points, where some directions curve up and others down, are much more common and the near-zero gradient there causes plateaus. Mini-batch noise, momentum and Adam help to slip off saddles, and empirically many different minima found by SGD give similar test performance, so I mostly worry about learning rate and data quality.'
      },
      {
        q: 'How would you verify that a hand-written gradient is correct, and what do the Hessian and second-order methods add?', level: 'hard',
        points: [['Gradient check: compare with a central-difference numerical gradient', ['numerical', 'central', 'finite difference', 'gradient check']], ['Use a small step, such as 1e-5, and compare relative error', ['1e-5', 'relative', 'small', 'tolerance']], ['Hessian holds second derivatives, describing curvature', ['hessian', 'second derivative', 'curvature']], ['Newton methods use curvature but cost O(n squared) memory, so deep learning avoids them', ['newton', 'expensive', 'memory', 'n squared', 'quasi', 'bfgs', 'adam', 'approximate']]],
        model: 'I would run a gradient check: perturb each parameter by a small epsilon, say 1e-5, up and down, compute the central-difference slope of the loss, and compare it with the analytical gradient using the relative error. It should be around 1e-7 or better, and I do it on a tiny model in double precision. The Hessian is the matrix of second derivatives and describes curvature. Newton-style methods use it to take better-scaled steps, but with n parameters it has n squared entries, impossible for large networks. So deep learning relies on first-order methods with cheap curvature hints, like the running averages in Adam, or quasi-Newton methods on small problems.'
      }
    ]
  }
,
  {
    id: 'probability', title: 'Probability and distributions for ML', tracks: ['ds', 'mle', 'genai', 'nlp', 'cv', 'auto'],
    uses: [
      'Language models output a probability distribution over the next token, are trained with cross-entropy (maximum likelihood) and generate text by sampling with a temperature',
      'Fraud and anomaly detection model normal behaviour with distributions such as Poisson counts or Gaussians and flag events with very low likelihood, using Bayes’ rule to account for rare base rates'
    ],
    tasks: [
      {
        id: 'mx-expectation', title: 'Expectation and variance', level: 'easy',
        prompt: `Write \`mean_var(values, probs)\` for a discrete random variable that takes \`values[i]\` with probability \`probs[i]\`.

- Return \`(expectation, variance)\`.
- Expectation is the sum of \`value * prob\`. Variance is the expected squared distance from the expectation: \`E[(X - mean)^2]\`.`,
        starter: R`def mean_var(values, probs):
    pass

print(mean_var([1, 2, 3, 4, 5, 6], [1/6] * 6))  # (3.5, 2.9166...)
`,
        solution: R`def mean_var(values, probs):
    mean = sum(v * p for v, p in zip(values, probs))
    var = sum(p * (v - mean) ** 2 for v, p in zip(values, probs))
    return mean, var
`,
        tests: [
          { name: 'Fair die', code: R`m, v = mean_var([1, 2, 3, 4, 5, 6], [1 / 6] * 6)
assert close(m, 3.5) and close(v, 35 / 12), 'Fair die: mean 3.5, variance 35/12'` },
          { name: 'Bernoulli', code: R`m, v = mean_var([0, 1], [0.7, 0.3])
assert close(m, 0.3) and close(v, 0.21), 'Bernoulli(0.3): mean 0.3, variance p(1-p) = 0.21'` },
          { name: 'Constant', code: R`m, v = mean_var([5], [1.0])
assert close(m, 5.0) and close(v, 0.0), 'A constant has variance 0'` },
          { name: 'Uneven', code: R`m, v = mean_var([0, 10], [0.9, 0.1])
assert close(m, 1.0) and close(v, 9.0), 'Mean 1, variance 0.9*1 + 0.1*81 = 9'` }
        ]
      },
      {
        id: 'mx-bayes', title: 'Bayes’ rule with repeated tests', level: 'medium',
        prompt: `Write \`posterior(prior, sensitivity, fpr, n=1)\`: the probability that a case is truly positive after \`n\` **independent** positive test results.

- \`prior\` = P(positive case), \`sensitivity\` = P(test positive | positive case), \`fpr\` = P(test positive | negative case).
- Each test result is independent given the true state, so the likelihoods multiply: \`sensitivity ** n\` and \`fpr ** n\`.
- Apply Bayes’ rule and return a float.`,
        starter: R`def posterior(prior, sensitivity, fpr, n=1):
    pass

print(posterior(0.01, 0.9, 0.09))  # about 0.0917
`,
        solution: R`def posterior(prior, sensitivity, fpr, n=1):
    pos = prior * sensitivity ** n
    neg = (1 - prior) * fpr ** n
    return pos / (pos + neg)
`,
        tests: [
          { name: 'Rare condition', code: R`assert close(posterior(0.01, 0.9, 0.09), 0.009 / 0.0981), 'Expected 0.009 / (0.009 + 0.0891), about 0.0917'` },
          { name: 'Two positive tests', code: R`assert close(posterior(0.01, 0.9, 0.09, 2), 0.0081 / (0.0081 + 0.99 * 0.0081)), 'Two independent positives: use sensitivity^2 and fpr^2'` },
          { name: 'Useless test keeps the prior', code: R`assert close(posterior(0.3, 0.5, 0.5), 0.3), 'If sensitivity equals fpr the test tells you nothing'` },
          { name: 'Perfect test', code: R`assert close(posterior(0.2, 1.0, 0.0), 1.0), 'No false positives means a positive is certain'` },
          { name: 'Zero prior', code: R`assert close(posterior(0.0, 0.9, 0.1), 0.0), 'A prior of 0 stays 0'` }
        ]
      },
      {
        id: 'mx-fit-normal', title: 'Maximum-likelihood fit of a normal', level: 'hard',
        prompt: `Write \`fit_normal(data)\` that fits a normal distribution by **maximum likelihood** and returns \`(mu, sigma, nll)\`.

- \`mu\` is the sample mean. \`sigma\` is the square root of the **average** squared deviation (divide by \`n\`, not \`n - 1\`: that is what maximises the likelihood).
- \`nll\` is the negative log-likelihood of the data at those parameters: the sum over points of \`0.5 * log(2 * pi * sigma**2) + (x - mu)**2 / (2 * sigma**2)\`.
- Assume the data are not all equal. Use numpy or \`math\`.`,
        starter: R`import numpy as np

def fit_normal(data):
    pass

print(fit_normal([1, 2, 3, 4, 5]))  # (3.0, 1.414..., about 8.04)
`,
        solution: R`import numpy as np

def fit_normal(data):
    x = np.asarray(data, dtype=float)
    mu = float(np.mean(x))
    sigma = float(np.sqrt(np.mean((x - mu) ** 2)))
    nll = float(np.sum(0.5 * np.log(2 * np.pi * sigma ** 2) + (x - mu) ** 2 / (2 * sigma ** 2)))
    return mu, sigma, nll
`,
        tests: [
          { name: 'Mean and spread', code: R`mu, sigma, nll = fit_normal([1, 2, 3, 4, 5])
assert close(mu, 3.0), 'mu should be the mean, 3'
assert close(sigma, 2 ** 0.5), 'sigma should divide by n: sqrt(10 / 5) = 1.414, not sqrt(10 / 4)'` },
          { name: 'Negative log-likelihood', code: R`import math
mu, sigma, nll = fit_normal([1, 2, 3, 4, 5])
assert close(nll, 2.5 * math.log(2 * math.pi * 2) + 2.5), 'At the MLE the squared-error term sums to n / 2, so nll = n/2 * log(2 pi sigma^2) + n/2'` },
          { name: 'Symmetric data', code: R`mu, sigma, nll = fit_normal([2, 2, 4, 4])
assert close(mu, 3.0) and close(sigma, 1.0), 'Expected mu 3 and sigma 1'` },
          { name: 'MLE beats other parameters', code: R`data = [0.5, 1.5, 2.0, 4.0, 7.0]
mu, sigma, nll = fit_normal(data)
x = np.array(data)
def other(m, s):
    return float(np.sum(0.5 * np.log(2 * np.pi * s ** 2) + (x - m) ** 2 / (2 * s ** 2)))
assert nll <= other(mu + 0.3, sigma) and nll <= other(mu, sigma * 1.2) and nll <= other(mu, sigma * 0.8), 'The fitted parameters should give the lowest nll'` }
        ]
      }
    ],
    quiz: [
      { q: 'What is the expected value of one roll of a fair six-sided die?', options: ['3', '3.5', '4', '21'], answer: 1, why: 'The average of 1 to 6 is 21 / 6 = 3.5.', level: 'easy' },
      { q: 'If events A and B are independent, what is P(A and B)?', options: ['P(A) + P(B)', 'P(A) / P(B)', 'P(A) * P(B)', 'P(A) - P(B)'], answer: 2, why: 'Independence means knowing one tells you nothing about the other, so probabilities multiply.', level: 'easy' },
      { q: 'Which distribution models the number of events (such as support tickets) in a fixed time window at a steady average rate?', options: ['Uniform', 'Poisson', 'Exponential', 'Bernoulli'], answer: 1, why: 'The Poisson distribution counts events per interval; the exponential models the waiting time between them.', level: 'easy' },
      { q: 'About what fraction of a normal distribution lies within one standard deviation of the mean?', options: ['50%', '68%', '95%', '99.7%'], answer: 1, why: 'The 68-95-99.7 rule gives 68% within one, 95% within two and 99.7% within three.', level: 'easy' },
      { q: 'X is Binomial with n = 10 and p = 0.3. What is its mean?', options: ['0.3', '3', '7', '10'], answer: 1, why: 'The mean of a binomial is n * p = 3.', level: 'medium' },
      { q: 'P(spam) = 0.4, P(word | spam) = 0.5 and P(word | not spam) = 0.1. What is P(spam | word)?', options: ['0.20', '0.50', '0.40', 'about 0.77'], answer: 3, why: 'Bayes: 0.2 / (0.2 + 0.6 * 0.1) = 0.2 / 0.26 = 10/13, about 0.77.', level: 'medium' },
      { q: 'What is the variance of a Bernoulli variable with p = 0.2?', options: ['0.2', '0.04', '0.16', '0.8'], answer: 2, why: 'The variance is p(1 - p) = 0.2 * 0.8 = 0.16.', level: 'medium' },
      { q: 'Var(X) = 4. What is Var(2X + 3)?', options: ['16', '11', '8', '19'], answer: 0, why: 'Adding a constant changes nothing and scaling by 2 multiplies the variance by 4, giving 16.', level: 'medium' },
      { q: 'A classifier gives the true class probability 0.25 on one example. What is its cross-entropy loss (natural log)?', options: ['0.25', '0.75', 'about 1.39', 'about 0.29'], answer: 2, why: 'The loss is -ln(0.25) = ln 4, about 1.386.', level: 'hard' },
      { q: 'Event counts in four hours were 2, 4, 3 and 3. What is the maximum-likelihood estimate of the Poisson rate per hour-block?', options: ['2', '4', '3.5', '3'], answer: 3, why: 'The Poisson MLE is the sample mean: (2 + 4 + 3 + 3) / 4 = 3.', level: 'hard' },
      { q: 'Which statement about KL divergence KL(p || q) is correct?', options: ['It is symmetric in p and q', 'It can be negative', 'It is never negative and is zero only when p = q', 'It equals the cross-entropy H(p, q)'], answer: 2, why: 'KL is non-negative, not symmetric, and equals H(p, q) - H(p).', level: 'hard' },
      { q: 'Waiting time X is exponential with rate 2 per minute. You have already waited 1 minute. What is P(X > 1.5 | X > 1)?', options: ['e^-1, about 0.37', 'e^-3, about 0.05', '1.5 / 2', 'e^-2, about 0.14'], answer: 0, why: 'The exponential is memoryless, so it equals P(X > 0.5) = e^(-2 * 0.5) = e^-1.', level: 'hard' }
    ],
    interview: [
      {
        q: 'What are expectation and variance, and how do you compute them?', level: 'easy',
        points: [['Expectation is the probability-weighted average', ['weighted', 'average', 'mean', 'sum']], ['Variance is the expected squared distance from the mean', ['squared', 'distance', 'spread', 'deviation']], ['Standard deviation is its square root, in the original units', ['standard deviation', 'square root', 'units']], ['Linearity: E of a sum is the sum of Es; variances add for independent variables', ['linear', 'independent', 'add']]],
        model: 'The expectation of a random variable is the average of its possible values, each weighted by its probability. The variance measures spread: it is the expected squared distance from the mean, which also equals E of X squared minus the square of E of X. Its square root, the standard deviation, is back in the original units. Expectation is linear, so the mean of a sum is the sum of the means even when variables depend on each other, while variances only add when the variables are independent. A fair die has mean 3.5 and variance about 2.92.'
      },
      {
        q: 'What do conditional probability and independence mean?', level: 'easy',
        points: [['P(A given B) is the probability of A once we know B happened', ['given', 'know', 'restrict', 'condition']], ['P(A | B) = P(A and B) / P(B)', ['joint', 'divide', 'p(a and b)', 'ratio']], ['Independent means P(A | B) = P(A), so joint equals product', ['product', 'multipl', 'no information', 'unchanged']], ['Example: features independent given the class in naive Bayes', ['naive bayes', 'example', 'conditionally']]],
        model: 'Conditional probability is the chance of A once we know B has happened. We restrict attention to the cases where B holds and ask how many of them also have A, so P of A given B equals P of A and B divided by P of B. Two events are independent when learning one tells you nothing about the other: P of A given B equals P of A, and so the joint probability is just the product. Independence is rare in real data, which is why naive Bayes, assuming features are independent given the class, is a deliberate simplification.'
      },
      {
        q: 'State Bayes’ rule and give an example of why it matters.', level: 'easy',
        points: [['P(A | B) = P(B | A) P(A) / P(B)', ['p(b | a)', 'likelihood', 'prior', 'posterior']], ['Prior times likelihood, normalised by the evidence', ['evidence', 'normalis', 'normaliz', 'denominator']], ['Reverses the direction of conditioning', ['revers', 'flip', 'invert']], ['Base-rate example such as a medical test or spam filter', ['base rate', 'rare', 'disease', 'spam', 'test']]],
        model: 'Bayes’ rule says the posterior equals the likelihood times the prior, divided by the evidence: P of A given B is P of B given A times P of A over P of B. It lets us reverse the direction of conditioning, from how likely a symptom is given a disease to how likely the disease is given the symptom. It matters because people forget the prior. If a disease affects one person in a hundred and a test is 90 percent sensitive with a 9 percent false positive rate, a positive result means only about a 9 percent chance of disease. Spam filters use the same rule.'
      },
      {
        q: 'Which distribution would you use for clicks per visitor, tickets per hour, waiting time and heights, and why?', level: 'medium',
        points: [['Bernoulli for a yes or no, binomial for the count of successes out of n', ['bernoulli', 'binomial', 'success']], ['Poisson for event counts in a fixed window', ['poisson', 'count', 'rate']], ['Exponential for the waiting time between events, memoryless', ['exponential', 'waiting', 'memoryless']], ['Normal for sums and averages of many small effects (central limit theorem)', ['normal', 'gaussian', 'central limit']], ['Uniform when every value in a range is equally likely, for example random initialisation', ['uniform', 'equal', 'random']]],
        model: 'Whether one visitor clicks is Bernoulli, and the number of clicks among n visitors is binomial. Tickets per hour at a steady average rate is a Poisson count, and the waiting time between tickets is exponential, which is memoryless. Heights, measurement noise and averages of many small effects are close to normal because of the central limit theorem. A uniform distribution fits when every value in a range is equally likely, for instance when drawing a random seed or an initial weight. In practice I check the choice against a histogram, and watch for overdispersion in counts, where the variance exceeds the mean.'
      },
      {
        q: 'What is maximum likelihood estimation, and how does it connect to the losses we train with?', level: 'medium',
        points: [['Choose parameters that make the observed data most probable', ['most probable', 'maximis', 'maximiz', 'likelihood']], ['Take logs so a product becomes a sum, then minimise the negative log-likelihood', ['log', 'sum', 'negative']], ['Bernoulli or categorical gives cross-entropy loss', ['cross-entropy', 'cross entropy', 'bernoulli', 'categorical']], ['Gaussian noise gives mean squared error', ['gaussian', 'squared', 'mse']], ['Examples: the MLE of a mean is the sample mean', ['sample mean', 'example', 'average']]],
        model: 'Maximum likelihood picks the parameters under which the data we actually saw would be most probable. For independent examples the likelihood is a product, so we take logs, turning it into a sum, and minimise the negative log-likelihood. This explains our usual losses. If the labels are modelled as Bernoulli or categorical, the negative log-likelihood is exactly cross-entropy. If the target is the prediction plus Gaussian noise, it becomes mean squared error. Simple closed forms exist too: the MLE of a normal mean is the sample mean, and of a Poisson rate is the average count.'
      },
      {
        q: 'Explain entropy, cross-entropy and KL divergence intuitively.', level: 'medium',
        points: [['Entropy is the average surprise or bits needed under the true distribution', ['surprise', 'bits', 'uncertainty', 'average']], ['Cross-entropy is the average bits when coding with the wrong model q', ['wrong', 'model', 'coding', 'q']], ['KL is the extra bits: cross-entropy minus entropy', ['extra', 'difference', 'minus', 'excess']], ['KL is non-negative, zero only if equal, and not symmetric', ['non-negative', 'not symmetric', 'asymmetric', 'zero']], ['Minimising cross-entropy against fixed data equals minimising KL', ['minimis', 'minimiz', 'fixed', 'same']]],
        model: 'Entropy measures the average surprise of outcomes drawn from a distribution p, or the bits needed to encode them with the best code for p. A fair coin has one bit, a heavily biased coin much less. Cross-entropy is the average number of bits if we encode data from p using a code built for a different model q, so it is always at least the entropy. KL divergence is exactly that extra cost: cross-entropy minus entropy. It is zero only when q equals p, never negative, and not symmetric. Since the entropy of the labels is fixed, minimising cross-entropy loss is the same as minimising the KL to the data.'
      },
      {
        q: 'How does a naive Bayes classifier work and when does it do well?', level: 'medium',
        points: [['Use Bayes’ rule: P(class | features) is proportional to P(class) times P(features | class)', ['bayes', 'prior', 'proportional', 'posterior']], ['Assume features are independent given the class so likelihoods multiply', ['independen', 'multipl', 'naive']], ['Estimate the probabilities by counting, with smoothing for unseen values', ['count', 'smooth', 'laplace', 'zero']], ['Work in log space to avoid underflow', ['log', 'underflow']], ['Strong for text with many features and little data; probabilities are poorly calibrated', ['text', 'spam', 'fast', 'calibrat', 'little data']]],
        model: 'Naive Bayes applies Bayes’ rule: the probability of a class given the features is proportional to the class prior times the likelihood of the features given that class. The naive step is assuming the features are independent given the class, so the likelihood becomes a product of simple per-feature terms that we estimate by counting. We add Laplace smoothing so an unseen word does not zero everything out, and we sum log probabilities to avoid underflow. It is fast, needs little data and works well for text classification such as spam, even though the independence assumption is false and the probabilities are poorly calibrated.'
      },
      {
        q: 'Show why minimising cross-entropy is maximum likelihood, and mean squared error is too under Gaussian noise.', level: 'hard',
        points: [['Likelihood of independent labels is the product of model probabilities of each true label', ['product', 'independent', 'likelihood']], ['Taking negative log gives the sum of minus log p of the true class: cross-entropy', ['negative log', 'sum', 'cross-entropy', 'cross entropy']], ['Gaussian: log density has a squared error term divided by two sigma squared', ['gaussian', 'squared', 'sigma', 'density']], ['Constants and fixed sigma do not change the arg-min', ['constant', 'fixed', 'arg', 'same minimum', 'drop']], ['Other noise gives other losses, for example Laplace gives absolute error', ['laplace', 'absolute', 'l1', 'other']]],
        model: 'For independent examples, the likelihood of the labels is the product of the probability the model gives to each true label. Taking the negative log turns that into the sum of minus log probabilities of the true classes, which is exactly the cross-entropy loss, so minimising one maximises the other. For regression, assume the target is the prediction plus Gaussian noise with fixed variance. The log density is minus the squared error over two sigma squared plus a constant, and those constants do not change where the minimum is, so maximum likelihood equals minimising mean squared error. Laplace noise would give absolute error instead.'
      },
      {
        q: 'How do you sample from a distribution, and what does temperature do in an LLM?', level: 'hard',
        points: [['Inverse CDF: draw a uniform number and push it through the inverse cumulative distribution', ['inverse', 'cdf', 'uniform']], ['Rejection or importance sampling when the inverse is unavailable', ['rejection', 'importance', 'mcmc', 'accept']], ['Categorical sampling from a softmax over logits', ['softmax', 'logit', 'categorical', 'token']], ['Temperature divides logits: low is sharper and near greedy, high is flatter and more random', ['divid', 'sharp', 'flat', 'greedy', 'random', 'temperature']], ['Top-k or top-p truncate unlikely tokens', ['top-k', 'top-p', 'nucleus', 'truncat']]],
        model: 'The basic method is inverse transform sampling: draw a uniform random number between zero and one and push it through the inverse cumulative distribution function. When that is not available we use rejection sampling, importance sampling or MCMC. A language model produces logits, and softmax turns them into a categorical distribution over tokens, from which we draw one token. Temperature divides the logits before the softmax. Low temperature makes the distribution sharper, close to greedy decoding, while high temperature flattens it and makes output more varied but riskier. Top-k and top-p sampling additionally cut off the unlikely tail.'
      },
      {
        q: 'A fraud model catches 99 percent of fraud and wrongly flags 1 percent of genuine transactions. Fraud is 0.1 percent of all transactions. Is it a good model?', level: 'hard',
        points: [['Apply Bayes: precision = true flags over all flags', ['bayes', 'precision', 'posterior']], ['Per 100,000 transactions: 100 fraud, 99 caught; 99,900 genuine, 999 flagged', ['99', '999', '100,000', 'per']], ['Precision is about 9 percent, so most alerts are false', ['9%', '9 percent', 'nine', 'most alerts', 'false']], ['Base rate dominates when the event is rare', ['base rate', 'rare', 'imbalance', 'prior']], ['Judge by precision-recall, cost of reviews and thresholds, not accuracy', ['precision-recall', 'precision recall', 'threshold', 'cost', 'accuracy']]],
        model: 'It sounds excellent, but the base rate decides. Take 100,000 transactions. About 100 are fraud and the model catches 99. Of the 99,900 genuine ones, 1 percent are flagged, which is 999. So the model raises 1,098 alerts and only 99 are real fraud, a precision of roughly 9 percent: nine out of ten alerts are false alarms. That is Bayes’ rule with a tiny prior. Whether it is acceptable depends on the cost of a review versus the cost of missed fraud. So I would judge it with precision-recall curves and tune the threshold to the review capacity, not quote accuracy.'
      }
    ]
  }
];
