=== linear-algebra ===
# Why it matters

Data, weights and embeddings are all arrays of numbers. A vector is a point or an arrow, a matrix is a table that also acts as a **transformation** (stretch, rotate, project). A neural-network layer is one matrix multiplication plus a bias.

# Core objects

| Idea | Meaning | ML use |
| --- | --- | --- |
| Dot product | Multiply matching entries and add | Similarity, neuron pre-activation, attention scores |
| Norm | Length: L2 is the root of the sum of squares, L1 the sum of absolute values | Regularisation, distances |
| Cosine | Dot product divided by both lengths: the angle | Embedding search |
| Matrix product | (n x k)(k x m) gives n x m; inner sizes must match | Layers, batches |
| Transpose | Swap rows and columns | Normal equation, covariance |

Matrix multiplication is not commutative: `AB` is usually not `BA`.

# Rank, inverse and linear systems

- **Rank** is the number of independent columns. Full rank means invertible (determinant not zero).
- Solve `Ax = b` with a factorisation (`np.linalg.solve`, `lstsq`), not by computing the inverse.
- Collinear features make `X^T X` nearly singular, so weights become unstable. Ridge regularisation fixes this.

# Eigenvectors and SVD

- `A v = lambda v`: a direction that is only scaled. The covariance matrix has eigenvectors that are the principal components of PCA.
- **SVD** writes any matrix as `U Sigma V^T`. Keeping the top k singular values gives the best rank-k approximation, used for compression, recommenders, latent semantic analysis and LoRA.

# Quick checks

- Parameters of a dense layer: inputs x outputs + outputs.
- Cosine of [1, 0] and [1, 1] is 0.71.
- Exact search over N vectors of dimension d costs N x d multiplications per query, so large systems use approximate indexes.

=== calculus ===
# The idea

A **derivative** is the slope of a function at a point. For many inputs, the **gradient** is the vector of partial derivatives: it points uphill, so training steps the opposite way.

# Rules you need

- Power rule: `d/dx x^n = n x^(n-1)`.
- **Chain rule:** `d/dx f(g(x)) = f'(g(x)) * g'(x)`. Backpropagation is the chain rule applied through a computation graph, storing forward values and multiplying local derivatives backwards.
- Sigmoid: `s' = s (1 - s)`, at most 0.25.
- Squared error `(p - y)^2` has gradient `2 (p - y)` with respect to `p`.
- Softmax with cross-entropy: gradient with respect to the logits is `p - y`.

# Gradient descent

`w = w - lr * gradient`

| Variant | Idea |
| --- | --- |
| Batch | Whole dataset per step: exact, slow |
| SGD / mini-batch | A few examples per step: noisy, fast, GPU-friendly |
| Momentum | Running average of gradients: damps zigzags |
| Adam | Momentum plus a per-parameter step scaled by recent squared gradients |

**Learning rate:** too high and the loss oscillates or diverges (on `f(w) = w^2`, rate 1.0 flips `w` between 1 and -1 forever); too low and training crawls. Search on a log scale and use warm-up and decay.

# Landscape

- **Convex** losses (linear and logistic regression) have no bad local minima.
- Deep nets are non-convex. In high dimensions **saddle points** and flat plateaus matter more than bad local minima.
- The **Jacobian** holds all first derivatives of a vector function. The **Hessian** holds second derivatives (curvature) and is too large to use for big networks.
- **Gradient check:** compare with `(f(x + h) - f(x - h)) / 2h`.
- Vanishing or exploding gradients come from multiplying many factors: use ReLU, good initialisation, normalisation, residual connections and gradient clipping.

=== probability ===
# Random variables

A random variable maps outcomes to numbers. **Expectation** `E[X]` is the probability-weighted average; **variance** `Var(X) = E[(X - E[X])^2]`. Expectation is linear. `Var(aX + b) = a^2 Var(X)`, and variances add for independent variables.

# Common distributions

| Distribution | Models | Mean / variance |
| --- | --- | --- |
| Bernoulli(p) | One yes or no | p / p(1 - p) |
| Binomial(n, p) | Successes in n trials | np / np(1 - p) |
| Poisson(lambda) | Events per fixed window | lambda / lambda |
| Uniform(a, b) | Equally likely in a range | (a + b) / 2 |
| Normal(mu, sigma) | Sums of many small effects | mu / sigma^2 |
| Exponential(lambda) | Waiting time, memoryless | 1 / lambda |

For a normal, 68% of values lie within 1 sigma and 95% within 2.

# Joint, conditional, Bayes

- `P(A | B) = P(A and B) / P(B)`.
- Independent: `P(A and B) = P(A) P(B)`.
- **Bayes:** `P(A | B) = P(B | A) P(A) / P(B)`. With a rare event the prior dominates: a 90% sensitive test with a 9% false positive rate on a 1% condition gives only about 9% after a positive result.

# Likelihood and information

- **Maximum likelihood:** choose parameters that make the data most probable; minimise the negative log-likelihood. Bernoulli or categorical labels give cross-entropy, Gaussian noise gives mean squared error. The MLE of a normal mean is the sample mean; its variance divides by `n`.
- **Entropy** `H(p)`: average surprise (a fair coin has 1 bit).
- **Cross-entropy** `H(p, q)`: average bits when coding p with a model q.
- **KL divergence** `KL(p || q) = H(p, q) - H(p)`: never negative, zero only when p = q, not symmetric.
- A true class given probability 0.25 costs `-ln 0.25 = 1.39`.

# Sampling

Draw a uniform number and apply the inverse CDF, or use rejection or importance sampling. Language models sample tokens from a softmax over logits; **temperature** divides the logits (low is sharp, high is flat), and top-k or top-p cut the unlikely tail.
