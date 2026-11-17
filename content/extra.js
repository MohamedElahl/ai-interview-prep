const R = String.raw;

export default [
  {
    id: 'pytorch', title: 'PyTorch in practice', group: 'dl',
    uses: ['Training and fine-tuning most published research models and open language models', 'Production vision and recommendation models exported to TorchScript or ONNX'],
    tasks: [
      {
        id: 'x-pt-broadcast', title: 'Broadcast two shapes',
        prompt: `PyTorch and NumPy combine tensors of different shapes by **broadcasting**. Write \`broadcast_shape(a, b)\` for two shapes given as tuples of positive integers:

- Align the shapes from the **right**; pad the shorter one with 1s on the left.
- Two sizes are compatible if they are equal or one of them is 1. The result takes the larger.
- Return the resulting shape as a tuple, or \`None\` if the shapes cannot be broadcast.`,
        starter: R`def broadcast_shape(a, b):
    pass

print(broadcast_shape((3, 1), (1, 4)))  # (3, 4)
print(broadcast_shape((2, 3), (3, 2)))  # None
`,
        solution: R`def broadcast_shape(a, b):
    a, b = list(a), list(b)
    n = max(len(a), len(b))
    a = [1] * (n - len(a)) + a
    b = [1] * (n - len(b)) + b
    out = []
    for x, y in zip(a, b):
        if x != y and x != 1 and y != 1:
            return None
        out.append(max(x, y))
    return tuple(out)
`,
        tests: [
          { name: 'Column plus row', code: R`assert tuple(broadcast_shape((3, 1), (1, 4))) == (3, 4), 'A (3, 1) column and a (1, 4) row give (3, 4)'` },
          { name: 'Different number of dimensions', code: R`assert tuple(broadcast_shape((5, 3), (3,))) == (5, 3) and tuple(broadcast_shape((), (4,))) == (4,), 'Pad the shorter shape with 1s on the left'` },
          { name: 'Incompatible shapes', code: R`assert broadcast_shape((2, 3), (3, 2)) is None, '3 against 2 cannot be broadcast: return None'` },
          { name: 'Matches NumPy', code: R`import numpy as np
for a, b in [((8, 1, 6, 1), (7, 1, 5)), ((32, 1), (32,)), ((4, 1, 1), (2, 3))]:
    assert tuple(broadcast_shape(a, b)) == np.broadcast_shapes(a, b), 'Result differs from NumPy for ' + str((a, b))` }
        ]
      },
      {
        id: 'x-pt-sgd', title: 'One training step by hand',
        prompt: `Do by hand what \`loss.backward()\` and \`optimizer.step()\` do for linear regression. Write \`sgd_step(w, b, X, y, lr)\`:

1. Prediction: \`pred = X @ w + b\`.
2. Loss: mean squared error \`mean((pred - y) ** 2)\`.
3. Gradients: \`dw = 2 * X.T @ (pred - y) / n\` and \`db = 2 * mean(pred - y)\`.
4. Update: \`w - lr * dw\`, \`b - lr * db\`.

Return \`(new_w, new_b, loss)\`, where \`loss\` is the loss **before** the update.`,
        starter: R`import numpy as np

def sgd_step(w, b, X, y, lr):
    pass
`,
        solution: R`import numpy as np

def sgd_step(w, b, X, y, lr):
    X, y, w = np.asarray(X, float), np.asarray(y, float), np.asarray(w, float)
    err = X @ w + b - y
    loss = float(np.mean(err ** 2))
    dw = 2 * X.T @ err / len(y)
    db = 2 * float(np.mean(err))
    return w - lr * dw, b - lr * db, loss
`,
        tests: [
          { name: 'One sample', code: R`w, b, loss = sgd_step([0.0], 0.0, [[1.0]], [2.0], 0.1)
assert close(w, [0.4]) and close(b, 0.4) and close(loss, 4.0), 'Error -2: loss 4, both gradients -4, so w and b move to 0.4'` },
          { name: 'Perfect fit does not move', code: R`w, b, loss = sgd_step([2.0], 1.0, [[1.0], [2.0]], [3.0, 5.0], 0.5)
assert close(w, [2.0]) and close(b, 1.0) and close(loss, 0.0), 'Zero error means zero gradient and zero loss'` },
          { name: 'Two features', code: R`w, b, loss = sgd_step([1.0, -1.0], 0.5, [[1.0, 2.0], [3.0, 4.0]], [0.0, 1.0], 0.01)
assert close(w, [1.05, -0.93]) and close(b, 0.52) and close(loss, 1.25), 'Expected w = [1.05, -0.93], b = 0.52, loss = 1.25'` },
          { name: 'Repeated steps learn y = 2x + 1', code: R`w, b = [0.0], 0.0
X, y = [[0.0], [1.0], [2.0], [3.0]], [1.0, 3.0, 5.0, 7.0]
first = None
for _ in range(2000):
    w, b, loss = sgd_step(w, b, X, y, 0.05)
    first = loss if first is None else first
assert close(w, [2.0], 1e-3) and close(b, 1.0, 1e-3) and loss < first, 'After many steps w should approach 2 and b should approach 1'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does `loss.backward()` do?', options: ['Updates the weights', 'Computes the gradient of the loss for every tensor that requires grad and adds it to `.grad`', 'Resets the gradients to zero', 'Moves the model to the GPU'], answer: 1, why: 'It only fills `.grad`. The optimiser changes the weights in `optimizer.step()`.', level: 'easy' },
      { q: 'Why call `optimizer.zero_grad()` in every iteration?', options: ['Gradients accumulate across `backward()` calls unless they are cleared', 'It saves the model', 'It shuffles the data', 'It sets the weights to zero'], answer: 0, why: 'Without it each step uses the sum of all earlier gradients.', level: 'easy' },
      { q: 'A tensor of shape (32, 1) is subtracted from one of shape (32,). The result has shape…', options: ['(32,)', '(32, 1)', '(32, 32)', 'An error is raised'], answer: 2, why: 'Broadcasting aligns from the right. This silent bug often hides inside a loss function.', level: 'hard' },
      { q: 'What does `model.eval()` change?', options: ['It disables gradient tracking', 'It freezes all weights permanently', 'It switches layers such as dropout and batch norm to inference behaviour', 'It moves the model to the CPU'], answer: 2, why: 'Gradient tracking is turned off separately with `torch.no_grad()`.', level: 'medium' },
      { q: 'What does `requires_grad=True` on a tensor tell PyTorch?', options: ['To move it to the GPU', 'To record operations on it so gradients can be computed', 'To make it read-only', 'To convert it to integers'], answer: 1, why: 'Only tensors that track gradients receive a `.grad` after `backward()`.', level: 'easy' },
      { q: 'Plain gradient descent updates a weight `w` with learning rate `lr` as…', options: ['w = w − lr × grad', 'w = w + lr × grad', 'w = w × lr', 'w = w − grad / lr'], answer: 0, why: 'We step against the gradient to reduce the loss.', level: 'easy' },
      { q: 'Your training loss turns to NaN after a few steps. What is a sensible first move?', options: ['Raise the learning rate', 'Train for more epochs', 'Remove the optimiser', 'Lower the learning rate and check the inputs for NaN or infinite values'], answer: 3, why: 'Exploding updates or bad inputs are the usual causes.', level: 'medium' },
      { q: 'Which pattern is correct for evaluating on validation data?', options: ['model.train() with gradients on', 'Call optimizer.step() on every batch', 'model.eval() together with torch.no_grad()', 'Call zero_grad() only'], answer: 2, why: 'Evaluation needs inference behaviour for layers and no gradient bookkeeping.', level: 'medium' },
      { q: 'A batch of images has shape (64, 3, 32, 32). What does 64 represent?', options: ['The number of colour channels', 'The batch size', 'The image height', 'The number of classes'], answer: 1, why: 'PyTorch image tensors are (batch, channels, height, width).', level: 'medium' },
      { q: 'w = 2.0, x = 3.0, target y = 10, prediction = w·x and loss = (pred − y)². What is dLoss/dw?', options: ['−24', '24', '−8', '−12'], answer: 0, why: 'pred = 6, so the gradient is 2 × (6 − 10) × 3 = −24 and w should increase.', level: 'hard' },
      { q: 'You forgot optimizer.zero_grad(). Each step produces a gradient of 2.0 for a weight. What does `.grad` hold at the third step, just before `step()`?', options: ['2.0', '4.0', '0.0', '6.0'], answer: 3, why: 'Gradients accumulate: 2 + 2 + 2.', level: 'hard' },
      { q: 'Tensors of shape (8, 1, 5) and (3, 1) are added. What is the result shape?', options: ['(8, 1, 5)', '(3, 5)', '(8, 3, 5)', 'An error is raised'], answer: 2, why: 'The second shape is padded to (1, 3, 1), and broadcasting then expands size-1 dimensions.', level: 'hard' }
    ],
    interview: [
      { q: 'Walk me through a PyTorch training loop.', points: [['Dataset and DataLoader give shuffled mini-batches', ['dataloader', 'data loader', 'batch', 'dataset']], ['Move the model and each batch to the same device', ['device', 'gpu', 'cuda']], ['Forward pass and loss', ['forward', 'loss']], ['zero_grad, backward, optimiser step', ['zero_grad', 'zero grad', 'backward', 'step']], ['Validation with eval mode and no_grad', ['eval', 'no_grad', 'no grad', 'validat']], ['Checkpoint the best model', ['checkpoint', 'save', 'state_dict', 'state dict']]], model: 'I wrap the data in a Dataset and a DataLoader, which gives shuffled mini-batches. I create the model, a loss function and an optimiser, and move the model to the device. For each epoch I call model.train(), then for each batch I move the batch to the same device, run the forward pass, compute the loss, call optimizer.zero_grad(), loss.backward() to compute gradients and optimizer.step() to update the weights. After each epoch I call model.eval() and evaluate on the validation set inside torch.no_grad(), log both losses, step the learning-rate scheduler and save a checkpoint of the state_dict when the validation metric improves.' },
      { q: 'How does autograd work?', points: [['Records operations in a computation graph during the forward pass', ['graph', 'record', 'forward']], ['The graph is dynamic: rebuilt on every forward pass', ['dynamic', 'define-by-run', 'each forward', 'every forward', 'on the fly']], ['backward applies the chain rule from the loss to the leaves', ['chain rule', 'backward', 'reverse']], ['Gradients accumulate in .grad of leaf tensors', ['.grad', 'accumulat', 'leaf']], ['no_grad or detach stop tracking', ['no_grad', 'no grad', 'detach']]], model: 'Every tensor with requires_grad set to true remembers the operation that created it. During the forward pass PyTorch records these operations in a computation graph, built on the fly, so ordinary Python control flow works. Calling backward on a scalar loss walks the graph in reverse and applies the chain rule, which is reverse-mode automatic differentiation. The result for each leaf tensor, such as a weight, is added to its .grad attribute, which is why gradients must be zeroed between steps. The graph is freed after backward. For inference I wrap the code in torch.no_grad(), and I use detach when a value should be treated as a constant.' },
      { q: 'How do you save and load a model, and what goes wrong with devices?', points: [['Save the state_dict, not the whole pickled object', ['state_dict', 'state dict']], ['Checkpoint also holds optimiser state and epoch to resume training', ['optimi', 'epoch', 'resume', 'checkpoint']], ['map_location when loading on a different device', ['map_location', 'map location']], ['Model and inputs must be on the same device', ['same device', 'device', '.to(']], ['Call eval before inference', ['eval']]], model: 'I save the state_dict, a dictionary of parameter tensors, because pickling the whole model ties the file to the exact class and folder layout. To load, I build the model from code, call load_state_dict and then eval for inference. To resume training, the checkpoint also stores the optimiser state, the epoch and the scheduler. For devices, the model and every input tensor must be on the same device, so I define one device variable and move both to it. A checkpoint saved on a GPU needs map_location to load on a CPU-only machine. For deployment outside Python I export to TorchScript or ONNX.' }
    ]
  },

  {
    id: 'unsupervised', title: 'Unsupervised learning: clustering and PCA', group: 'ml',
    uses: ['Customer segmentation for marketing and product decisions', 'Fraud and equipment-fault detection where no labels exist'],
    tasks: [
      {
        id: 'x-un-kmeans', title: 'One k-means iteration',
        prompt: `Write \`kmeans_step(X, centroids)\` that performs one iteration of k-means:

1. **Assign** each point to the nearest centroid (Euclidean distance; on a tie choose the lowest index).
2. **Update** each centroid to the mean of its points. A centroid with no points stays where it is.

Return \`(labels, new_centroids)\`.`,
        starter: R`import numpy as np

def kmeans_step(X, centroids):
    pass
`,
        solution: R`import numpy as np

def kmeans_step(X, centroids):
    X, C = np.asarray(X, float), np.asarray(centroids, float)
    d = ((X[:, None, :] - C[None, :, :]) ** 2).sum(axis=2)
    labels = d.argmin(axis=1)
    new = C.copy()
    for j in range(len(C)):
        if np.any(labels == j):
            new[j] = X[labels == j].mean(axis=0)
    return labels, new
`,
        tests: [
          { name: 'Two clear groups', code: R`labels, C = kmeans_step([[0, 0], [0, 2], [10, 0], [10, 2]], [[1, 1], [9, 1]])
assert list(labels) == [0, 0, 1, 1] and close(C, [[0, 1], [10, 1]]), 'Expected labels [0, 0, 1, 1] and centroids [[0, 1], [10, 1]]'` },
          { name: 'Empty cluster keeps its centroid', code: R`labels, C = kmeans_step([[0, 0], [1, 0]], [[0, 0], [100, 100]])
assert list(labels) == [0, 0] and close(C, [[0.5, 0], [100, 100]]), 'A centroid with no points must not move (and must not become NaN)'` },
          { name: 'Tie goes to the lowest index', code: R`labels, C = kmeans_step([[5, 0]], [[0, 0], [10, 0]])
assert list(labels) == [0] and close(C, [[5, 0], [10, 0]]), 'A point at equal distance belongs to centroid 0'` },
          { name: 'A converged solution is stable', code: R`X = [[0, 0], [0, 2], [10, 0], [10, 2]]
_, C1 = kmeans_step(X, [[1, 1], [9, 1]])
labels, C2 = kmeans_step(X, C1)
assert close(C1, C2) and list(labels) == [0, 0, 1, 1], 'Repeating the step after convergence changes nothing'` }
        ]
      },
      {
        id: 'x-un-pca', title: 'Explained variance of PCA',
        prompt: `Write \`explained_variance_ratio(X)\` for a data matrix \`X\` with one row per sample:

1. Centre each column (subtract its mean).
2. Compute the covariance matrix \`Xc.T @ Xc / (n - 1)\`.
3. Take its eigenvalues, sorted from largest to smallest.
4. Return each eigenvalue divided by their sum.

The result says what share of the total variance each principal component keeps.`,
        starter: R`import numpy as np

def explained_variance_ratio(X):
    pass
`,
        solution: R`import numpy as np

def explained_variance_ratio(X):
    X = np.asarray(X, float)
    Xc = X - X.mean(axis=0)
    cov = Xc.T @ Xc / (len(X) - 1)
    vals = np.linalg.eigvalsh(cov)[::-1]
    return vals / vals.sum()
`,
        tests: [
          { name: 'Points on a line', code: R`assert close(explained_variance_ratio([[0, 0], [1, 1], [2, 2], [3, 3]]), [1, 0], 1e-9), 'All variance lies along one direction: expected [1, 0]'` },
          { name: 'Variances 4 to 1', code: R`assert close(explained_variance_ratio([[2, 0], [-2, 0], [0, 1], [0, -1]]), [0.8, 0.2]), 'Variances 8/3 and 2/3 give ratios [0.8, 0.2]'` },
          { name: 'Sorted and sums to one', code: R`import numpy as np
r = np.asarray(explained_variance_ratio(np.random.default_rng(0).normal(size=(50, 3)) * [3, 1, 0.2]))
assert r.shape == (3,) and close(r.sum(), 1.0) and r[0] >= r[1] >= r[2], 'Return one ratio per feature, largest first, summing to 1'` },
          { name: 'Shifting the data changes nothing', code: R`import numpy as np
X = np.random.default_rng(1).normal(size=(30, 2))
assert close(explained_variance_ratio(X), explained_variance_ratio(X + 100), 1e-6), 'Centre the data first: adding a constant must not change the result'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does k-means minimise?', options: ['The number of clusters', 'The sum of squared distances from each point to its cluster centre', 'The distance between cluster centres', 'The silhouette score'], answer: 1, why: 'This is the within-cluster sum of squares, also called inertia.', level: 'easy' },
      { q: 'Inertia always falls as k grows. How do you still choose k?', options: ['Take the k with the lowest inertia', 'Always use k = 2', 'Look for the elbow, compare silhouette scores and check that the clusters are useful', 'Use the number of features'], answer: 2, why: 'With k equal to the number of points, inertia is zero and the clustering is useless.', level: 'medium' },
      { q: 'Which algorithm finds clusters of arbitrary shape and labels isolated points as noise?', options: ['DBSCAN', 'k-means', 'PCA', 'Linear regression'], answer: 0, why: 'It groups dense regions and needs no number of clusters in advance.', level: 'easy' },
      { q: 'Why standardise features before PCA?', options: ['PCA only accepts integers', 'It makes PCA non-linear', 'It removes outliers', 'Otherwise the feature with the largest scale dominates the components'], answer: 3, why: 'PCA follows variance, and variance depends on units.', level: 'medium' },
      { q: 'What training data does unsupervised learning use?', options: ['Data with a label for every row', 'Data without labels', 'Only images', 'Only rewards'], answer: 1, why: 'It looks for structure such as groups or directions of variation.', level: 'easy' },
      { q: 'What does PCA produce?', options: ['New axes, ordered by how much variance they capture', 'A set of class labels', 'Cluster centres', 'A decision tree'], answer: 0, why: 'The first component captures the most variance, the second the most of what remains.', level: 'easy' },
      { q: 'Customers have income (about 50,000) and visits per month (about 4). k-means groups them almost only by income. What is the fix?', options: ['Increase k to 100', 'Drop the visits column', 'Use more iterations', 'Standardise the features before clustering'], answer: 3, why: 'Distances are dominated by the feature with the largest scale.', level: 'medium' },
      { q: 'Your data forms two interleaved crescent shapes. Which method is a better first try than k-means?', options: ['PCA with one component', 'Linear regression', 'DBSCAN', 'k-means with k = 1'], answer: 2, why: 'Density-based clustering follows arbitrary shapes; k-means assumes round clusters.', level: 'medium' },
      { q: 'PCA eigenvalues are 6, 3 and 1. What share of the variance do the first two components explain?', options: ['60%', '90%', '30%', '75%'], answer: 1, why: 'The total is 10, and (6 + 3) / 10 = 0.9.', level: 'hard' },
      { q: 'One-dimensional points 1, 2, 9, 10 start with centres at 0 and 12. After one assignment and update step, the centres are…', options: ['1.5 and 9.5', '3 and 9', '1.5 and 12', '5.5 and 5.5'], answer: 0, why: '1 and 2 go to centre 0; 9 and 10 are nearer to 12, so the means are 1.5 and 9.5.', level: 'hard' },
      { q: 'A point has a silhouette value close to −1. What does that suggest?', options: ['It is perfectly clustered', 'It lies exactly on a boundary', 'It is noise in DBSCAN', 'It is probably assigned to the wrong cluster'], answer: 3, why: 'It is closer to another cluster than to its own.', level: 'hard' },
      { q: 'Why can PCA throw away information that a classifier needs?', options: ['It always removes the label', 'It only keeps one feature', 'It keeps high-variance directions, which need not be the ones that predict the label', 'It shuffles the rows'], answer: 2, why: 'PCA is unsupervised: variance is not the same as usefulness.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain k-means and its weaknesses.', points: [['Assign each point to the nearest centroid, then move centroids to the mean; repeat', ['assign', 'nearest', 'mean', 'centroid']], ['Minimises within-cluster sum of squares', ['sum of squares', 'inertia', 'within-cluster', 'squared distance']], ['Must choose k; sensitive to initialisation (k-means++)', ['choose k', 'elbow', 'silhouette', 'initiali', 'k-means++']], ['Assumes round, similar-sized clusters; needs scaled features', ['spherical', 'round', 'shape', 'scal']], ['Sensitive to outliers', ['outlier']]], model: 'K-means starts with k centroids, then repeats two steps until nothing changes: assign every point to its nearest centroid, and move each centroid to the mean of its points. Each step lowers the within-cluster sum of squared distances, so it converges, but only to a local minimum. That is why I use k-means++ initialisation and several restarts. Its weaknesses: I must choose k, for example with the elbow method or silhouette score; it assumes roughly round clusters of similar size, so it fails on elongated or nested shapes; it needs scaled features because it uses Euclidean distance; and outliers pull the centroids. For other shapes I would try DBSCAN or a Gaussian mixture.' },
      { q: 'What is PCA and when would you use it?', points: [['Finds orthogonal directions of maximum variance', ['variance', 'direction', 'orthogonal']], ['Eigenvectors of the covariance matrix, or SVD of centred data', ['eigen', 'covariance', 'svd']], ['Uses: dimensionality reduction, visualisation, noise removal, decorrelation', ['reduc', 'visuali', 'noise', 'compress', 'decorrelat']], ['Choose components by explained variance', ['explained variance', 'scree', 'cumulative']], ['Limits: linear, scale-sensitive, harder to interpret', ['linear', 'scal', 'standardi', 'interpret']]], model: 'PCA finds new axes for the data: the first principal component is the direction of maximum variance, the second is the direction of most remaining variance at right angles to the first, and so on. Mathematically these are the eigenvectors of the covariance matrix, usually computed with an SVD of the centred data. I keep the first few components, chosen by cumulative explained variance, to reduce dimensionality, visualise data in two dimensions, remove noise or decorrelate features before another model. I standardise first, because PCA is sensitive to scale. Its limits are that it is linear, it ignores the target, and the components are mixtures of features, so they are harder to interpret.' },
      { q: 'How would you detect anomalies when you have no labels?', points: [['Define what an anomaly means with domain experts', ['define', 'domain', 'expert', 'business']], ['Simple statistics first: z-score, IQR, thresholds', ['z-score', 'iqr', 'threshold', 'statistic', 'rule']], ['Models: isolation forest, density or distance, reconstruction error', ['isolation forest', 'density', 'distance', 'reconstruct', 'autoencoder', 'lof']], ['Evaluate with the few known cases and expert review', ['review', 'known', 'precision', 'evaluat']], ['Threshold from an alert budget; monitor drift', ['budget', 'false alarm', 'false positive', 'drift']]], model: 'I first agree with domain experts what an anomaly is and what a false alarm costs. Then I start simple: per-feature z-scores or IQR fences catch many problems and are easy to explain. For patterns across several features I use an isolation forest, which isolates unusual points with few random splits, or a density method such as local outlier factor, or the reconstruction error of PCA or an autoencoder trained on normal data. Without labels I cannot compute accuracy, so I collect the few known incidents, check they score highly, and ask experts to review the top-ranked cases. I set the threshold from the number of alerts the team can handle and monitor for drift.' }
    ]
  },

  {
    id: 'recsys', title: 'Recommender systems', group: 'ml',
    uses: ['Home feeds of video and music streaming services', 'Product recommendations in online retail'],
    tasks: [
      {
        id: 'x-rec-ndcg', title: 'NDCG at k',
        prompt: `Write \`ndcg_at_k(rels, k)\`. \`rels\` lists the true relevance of the recommended items **in the order they were shown**.

- \`DCG@k\` is the sum over the first \`k\` positions of \`rel / log2(position + 1)\`, with positions counted from 1.
- \`IDCG@k\` is the DCG of the same items sorted from most to least relevant.
- Return \`DCG / IDCG\`, or \`0.0\` when \`IDCG\` is 0.`,
        starter: R`import math

def ndcg_at_k(rels, k):
    pass

print(ndcg_at_k([0, 0, 1], 3))  # 0.5
`,
        solution: R`import math

def ndcg_at_k(rels, k):
    def dcg(r):
        return sum(x / math.log2(i + 2) for i, x in enumerate(r[:k]))
    ideal = dcg(sorted(rels, reverse=True))
    return dcg(list(rels)) / ideal if ideal > 0 else 0.0
`,
        tests: [
          { name: 'Perfect order', code: R`assert close(ndcg_at_k([3, 2, 1], 3), 1.0), 'Items already sorted by relevance score 1'` },
          { name: 'Relevant item in third place', code: R`assert close(ndcg_at_k([0, 0, 1], 3), 0.5), 'DCG = 1 / log2(4) = 0.5 and the ideal DCG is 1'` },
          { name: 'Nothing relevant', code: R`assert close(ndcg_at_k([0, 0, 0], 3), 0.0), 'Return 0.0 when the ideal DCG is 0'` },
          { name: 'Cut-off k', code: R`import math
assert close(ndcg_at_k([0, 1, 1], 1), 0.0) and close(ndcg_at_k([1, 0, 1], 2), 1 / (1 + 1 / math.log2(3))), 'Only the first k shown items count; the ideal list uses the best k of all items'` }
        ]
      },
      {
        id: 'x-rec-mf', title: 'Matrix factorisation update',
        prompt: `In matrix factorisation a rating is predicted as the dot product of a user vector \`p\` and an item vector \`q\`. Write \`mf_sgd_step(p, q, r, lr, reg)\` for one observed rating \`r\`:

- error \`e = r - p @ q\`
- \`p_new = p + lr * (e * q - reg * p)\`
- \`q_new = q + lr * (e * p - reg * q)\`

Both updates use the **old** values of \`p\` and \`q\`. Return \`(p_new, q_new)\`.`,
        starter: R`import numpy as np

def mf_sgd_step(p, q, r, lr, reg):
    pass
`,
        solution: R`import numpy as np

def mf_sgd_step(p, q, r, lr, reg):
    p, q = np.asarray(p, float), np.asarray(q, float)
    e = r - p @ q
    return p + lr * (e * q - reg * p), q + lr * (e * p - reg * q)
`,
        tests: [
          { name: 'Basic update', code: R`p, q = mf_sgd_step([1.0, 0.0], [0.0, 1.0], 1.0, 0.1, 0.0)
assert close(p, [1.0, 0.1]) and close(q, [0.1, 1.0]), 'Error 1: p moves toward q and q moves toward p'` },
          { name: 'No error, no regularisation', code: R`p, q = mf_sgd_step([1.0, 2.0], [3.0, 1.0], 5.0, 0.1, 0.0)
assert close(p, [1.0, 2.0]) and close(q, [3.0, 1.0]), 'The prediction is already 5, so nothing changes'` },
          { name: 'Regularisation shrinks the vectors', code: R`p, q = mf_sgd_step([2.0, 0.0], [1.0, 0.0], 2.0, 0.5, 0.1)
assert close(p, [1.9, 0.0]) and close(q, [0.95, 0.0]), 'With zero error only the reg term acts: p * (1 - lr * reg)'` },
          { name: 'Both updates use the old vectors', code: R`p, q = mf_sgd_step([1.0], [1.0], 3.0, 0.5, 0.0)
assert close(p, [2.0]) and close(q, [2.0]), 'Do not use the new p when updating q: both should become 2'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does collaborative filtering rely on?', options: ['Item descriptions and metadata', 'Patterns in the interactions of many users', 'Hand-written rules', 'The price of each item'], answer: 1, why: 'Users who behaved alike in the past tend to like the same items.', level: 'easy' },
      { q: 'A new item has no interactions yet. This is called…', options: ['Overfitting', 'Popularity bias', 'Position bias', 'The cold-start problem'], answer: 3, why: 'Content features, popularity and exploration help until interactions arrive.', level: 'easy' },
      { q: 'Why do large recommenders split the work into retrieval and ranking?', options: ['A cheap model narrows millions of items to hundreds, then an expensive model orders them', 'Retrieval is more accurate than ranking', 'Ranking cannot use features', 'It avoids the need for training data'], answer: 0, why: 'Scoring every item with a heavy model would be far too slow.', level: 'medium' },
      { q: 'A user did not click an item. With implicit feedback this means…', options: ['They dislike it', 'The item is broken', 'Unknown: they may never have seen it', 'They already own it'], answer: 2, why: 'Missing interactions are not negatives; models sample negatives and correct for exposure.', level: 'medium' },
      { q: 'What is content-based filtering?', options: ['Recommending only the most expensive items', 'Recommending items whose features resemble items the user liked', 'Copying another user’s list exactly', 'Choosing items at random'], answer: 1, why: 'It uses item attributes rather than other users’ behaviour.', level: 'easy' },
      { q: 'What does matrix factorisation do in a recommender?', options: ['It gives users and items short vectors whose dot product predicts the rating', 'It sorts items by price', 'It deletes rare users', 'It clusters words'], answer: 0, why: 'The vectors are learned from observed interactions.', level: 'easy' },
      { q: 'A new user has just signed up and has no history. What is a sensible first strategy?', options: ['Show nothing', 'Show the same item every time', 'Wait a year', 'Show popular items and ask for a few preferences'], answer: 3, why: 'Popularity and onboarding questions bridge the cold start.', level: 'medium' },
      { q: 'A list of 10 recommended items contains 3 that the user finds relevant. What is precision@10?', options: ['0.1', '3.0', '0.3', '0.7'], answer: 2, why: 'Precision is relevant items shown divided by items shown.', level: 'medium' },
      { q: 'The system ranks items with relevance [0, 2, 3] while the best order is [3, 2, 0]. Using gain = relevance and discount log2(rank + 1), NDCG is about…', options: ['1.00', '0.65', '0.50', '0.85'], answer: 1, why: 'DCG = 2/1.585 + 3/2 = 2.76 and ideal DCG = 3 + 1.26 = 4.26, giving 0.65.', level: 'hard' },
      { q: 'User vector (1, 2), item vector (3, 1), true rating 4, learning rate 0.1. Using u ← u + lr × error × v, what is the new user vector?', options: ['(0.7, 1.9)', '(1.3, 2.1)', '(0.9, 1.9)', '(1, 2)'], answer: 0, why: 'The prediction is 5, so the error is 4 − 5 = −1, and the update is (1, 2) + 0.1 × (−1) × (3, 1).', level: 'hard' },
      { q: 'A model trained on clicks keeps recommending the most popular items, and niche items rarely get shown. What helps?', options: ['Train for more epochs on clicks', 'Remove all popular items', 'Use a larger learning rate', 'Re-rank for diversity or correct for exposure when training'], answer: 3, why: 'Feedback loops reinforce popularity; exposure and diversity controls break them.', level: 'hard' },
      { q: 'Offline NDCG rose by 3% but an A/B test showed fewer purchases. What is a likely reason?', options: ['A/B tests are always wrong', 'NDCG cannot be computed', 'Logged data reflects the old recommender’s exposure, so the offline metric is biased and may not match the business goal', 'Users dislike every change'], answer: 2, why: 'Offline evaluation only sees what the old system showed.', level: 'hard' }
    ],
    interview: [
      { q: 'Design a recommender for a catalogue of millions of items.', points: [['Clarify the goal, the surface and the metric', ['goal', 'objective', 'metric', 'clarify']], ['Candidate retrieval: two-tower embeddings with approximate nearest neighbours', ['two-tower', 'two tower', 'retriev', 'candidate', 'nearest neighbour', 'nearest neighbor', 'ann']], ['Ranking model with rich features', ['rank', 'feature', 'boost']], ['Re-ranking: diversity, freshness, business rules', ['divers', 'fresh', 'business rule', 're-rank', 'rerank']], ['Cold start and exploration', ['cold start', 'cold-start', 'explor']], ['Offline metrics, then an online A/B test', ['a/b', 'online', 'ndcg', 'recall']]], model: 'I first clarify the goal and the metric, for example long-term engagement, not only clicks. Scoring millions of items per request is too slow, so I use stages. Retrieval: a two-tower model embeds users and items in the same space, and an approximate nearest-neighbour index returns a few hundred candidates, joined by candidates from popularity and recent history. Ranking: a heavier model, such as gradient-boosted trees or a neural network, scores the candidates with user, item and context features. Re-ranking then applies diversity, freshness and business rules. I handle cold start with content features and some exploration, evaluate offline with recall and NDCG on a time-based split, and decide with an online A/B test.' },
      { q: 'Compare collaborative filtering with content-based recommendation.', points: [['Collaborative: learns from user-item interactions only', ['interaction', 'behaviour', 'behavior', 'rating', 'click']], ['Content-based: uses item and user features', ['feature', 'metadata', 'description', 'content', 'attribute']], ['Collaborative finds surprising items but has cold start', ['cold start', 'cold-start', 'serendip', 'surpris']], ['Content-based handles new items but stays close to past taste', ['new item', 'similar', 'narrow', 'bubble']], ['Hybrids combine both', ['hybrid', 'combin', 'both']]], model: 'Collaborative filtering learns only from interactions: ratings, clicks, purchases. It assumes that users who agreed in the past will agree again, and it can surface surprising items that share no obvious attribute with what the user saw before. Its weakness is cold start: a new user or item has no interactions. Content-based methods describe items by features such as text, category or image embeddings and recommend items similar to those the user liked. They work for new items at once and are easy to explain, but they stay close to past taste and depend on good features. In practice I use a hybrid: a model that takes both interaction history and content features.' },
      { q: 'How do you evaluate a recommender system?', points: [['Offline: split by time, ranking metrics such as recall@k, NDCG, MAP', ['recall@', 'recall at', 'ndcg', 'map', 'precision@', 'offline']], ['Split by time to avoid leakage', ['time', 'chronolog', 'leak']], ['Offline data is biased by what the old system showed', ['bias', 'exposure', 'position', 'logged']], ['Online A/B test on the business metric', ['a/b', 'online', 'experiment']], ['Beyond accuracy: diversity, coverage, novelty, long-term effects', ['divers', 'coverage', 'novel', 'long-term', 'long term', 'retention']]], model: 'Offline, I hold out each user’s most recent interactions, splitting by time so the model never trains on the future. I measure whether held-out items appear near the top with recall at k for retrieval and NDCG or MAP for ranking, compared with a popularity baseline. Offline results are biased, because the logs only contain items the old system chose to show, so I treat them as a filter for candidates. The real decision comes from an online A/B test on the metric the business cares about, such as retention or purchases, with guardrails. I also track coverage, diversity and novelty, because optimising clicks alone tends to produce a narrow, popularity-driven feed.' }
    ]
  },

  {
    id: 'rl', title: 'Reinforcement learning basics', group: 'ml',
    uses: ['Game-playing agents that beat human champions at Go, chess and video games', 'Bandit algorithms that choose headlines, adverts and recommendations online'],
    tasks: [
      {
        id: 'x-rl-returns', title: 'Discounted returns',
        prompt: `The **return** from time step \`t\` is the discounted sum of future rewards:

\`G_t = r_t + gamma * r_{t+1} + gamma² * r_{t+2} + …\`

Write \`returns(rewards, gamma)\` that returns the list of \`G_t\` for every step of one episode. Hint: work backwards with \`G_t = r_t + gamma * G_{t+1}\`.`,
        starter: R`def returns(rewards, gamma):
    pass

print(returns([1, 1, 1], 0.5))  # [1.75, 1.5, 1.0]
`,
        solution: R`def returns(rewards, gamma):
    out, g = [], 0.0
    for r in reversed(rewards):
        g = r + gamma * g
        out.append(g)
    return out[::-1]
`,
        tests: [
          { name: 'Discount 0.5', code: R`assert close(returns([1, 1, 1], 0.5), [1.75, 1.5, 1.0]), 'Expected [1.75, 1.5, 1.0]'` },
          { name: 'Gamma 0 is short-sighted', code: R`assert close(returns([3, 0, 5], 0.0), [3, 0, 5]), 'With gamma = 0 each return is just the immediate reward'` },
          { name: 'Gamma 1 sums everything', code: R`assert close(returns([1, 2, 3], 1.0), [6, 5, 3]), 'With gamma = 1 the return is the plain sum of future rewards'` },
          { name: 'Empty episode', code: R`assert list(returns([], 0.9)) == [], 'No rewards give an empty list'` }
        ]
      },
      {
        id: 'x-rl-qupdate', title: 'Q-learning update',
        prompt: `\`Q\` is a table (list of lists): \`Q[state][action]\`. Write \`q_update(Q, s, a, r, s_next, alpha, gamma, done)\` that applies one Q-learning update and returns the table:

- target = \`r\` if \`done\`, otherwise \`r + gamma * max(Q[s_next])\`
- \`Q[s][a] = Q[s][a] + alpha * (target - Q[s][a])\`

No other entry may change.`,
        starter: R`def q_update(Q, s, a, r, s_next, alpha, gamma, done):
    return Q
`,
        solution: R`def q_update(Q, s, a, r, s_next, alpha, gamma, done):
    target = r if done else r + gamma * max(Q[s_next])
    Q[s][a] = Q[s][a] + alpha * (target - Q[s][a])
    return Q
`,
        tests: [
          { name: 'Bootstraps from the best next action', code: R`Q = q_update([[0.0, 0.0], [1.0, 2.0]], 0, 1, 1.0, 1, 0.5, 0.9, False)
assert close(Q[0][1], 1.4), 'Target 1 + 0.9 * 2 = 2.8; halfway from 0 is 1.4'` },
          { name: 'Terminal step ignores the next state', code: R`Q = q_update([[0.0, 0.0], [1.0, 2.0]], 0, 1, 1.0, 1, 0.5, 0.9, True)
assert close(Q[0][1], 0.5), 'When done, the target is the reward alone'` },
          { name: 'Alpha 1 replaces the old value', code: R`Q = q_update([[5.0, 0.0], [0.0, 3.0]], 0, 0, 0.0, 1, 1.0, 0.5, False)
assert close(Q[0][0], 1.5), 'With alpha = 1 the entry becomes the target 0 + 0.5 * 3'` },
          { name: 'Only one entry changes', code: R`Q = q_update([[0.0, 0.0], [1.0, 2.0]], 0, 1, 1.0, 1, 0.5, 0.9, False)
assert close(Q[0][0], 0.0) and close(Q[1], [1.0, 2.0]) and not close(Q[0][1], 0.0), 'Update Q[s][a] and nothing else'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does the Markov property say?', options: ['Rewards are always positive', 'The next state depends only on the current state and action, not on the earlier history', 'The agent knows the environment model', 'Every episode has the same length'], answer: 1, why: 'The state must contain everything relevant for predicting what happens next.', level: 'easy' },
      { q: 'A discount factor gamma close to 0 makes the agent…', options: ['Short-sighted: it cares mostly about immediate reward', 'Far-sighted', 'Explore more', 'Learn faster in every case'], answer: 0, why: 'Future rewards are multiplied by powers of gamma, so they vanish quickly.', level: 'medium' },
      { q: 'Why is Q-learning called off-policy?', options: ['It needs no rewards', 'It cannot explore', 'It only works offline', 'Its target uses the best next action, whatever action the behaviour policy actually takes'], answer: 3, why: 'It learns about the greedy policy while following an exploring one.', level: 'medium' },
      { q: 'With epsilon-greedy and epsilon = 0.1 the agent…', options: ['Picks a random action 90% of the time', 'Never explores', 'Picks a random action 10% of the time and the best-known action otherwise', 'Always picks the action with the lowest value'], answer: 2, why: 'A small amount of random exploration keeps the value estimates improving.', level: 'easy' },
      { q: 'What is the reward in reinforcement learning?', options: ['The model’s weights', 'A scalar feedback signal the environment gives after an action', 'A list of states', 'The number of episodes'], answer: 1, why: 'The agent’s goal is to maximise the total reward over time.', level: 'easy' },
      { q: 'What is a policy?', options: ['A rule that chooses an action in each state', 'A table of rewards', 'The learning rate', 'The environment’s code'], answer: 0, why: 'It can be deterministic or a probability distribution over actions.', level: 'easy' },
      { q: 'Rewards of 1, 1 and 1 arrive on three steps with gamma = 0.5. What is the discounted return from the first step?', options: ['3', '1.5', '2.25', '1.75'], answer: 3, why: '1 + 0.5 + 0.25 = 1.75.', level: 'medium' },
      { q: 'A three-armed bandit agent always pulls the arm that paid best on its first try. What goes wrong?', options: ['It learns too fast', 'It forgets the reward', 'It may never discover a better arm because it does not explore', 'Nothing: greedy is optimal'], answer: 2, why: 'Exploration is needed to correct early, noisy estimates.', level: 'medium' },
      { q: 'Q(s, a) = 2, reward = 1, gamma = 0.9, max Q(s′, ·) = 4 and alpha = 0.5. What is the new Q(s, a)?', options: ['4.6', '3.3', '2.6', '3.8'], answer: 1, why: 'Target = 1 + 0.9 × 4 = 4.6; Q = 2 + 0.5 × (4.6 − 2) = 3.3.', level: 'hard' },
      { q: 'Rewards 0, 0 and 10 arrive on three steps with gamma = 0.9. What is the return from the first step?', options: ['8.1', '9.0', '10', '7.29'], answer: 0, why: 'Only the last reward counts, discounted by 0.9² = 0.81.', level: 'hard' },
      { q: 'In the cliff-walking example, Q-learning learns the path along the cliff edge while SARSA learns a safer one. Why?', options: ['SARSA has no reward', 'Q-learning cannot see the cliff', 'SARSA uses a larger gamma', 'Q-learning’s target assumes greedy behaviour; SARSA’s target includes the exploratory slips the agent really makes'], answer: 3, why: 'On-policy learning accounts for the risk of exploration; off-policy learning does not.', level: 'hard' },
      { q: 'A robot is rewarded each time it moves closer to the goal, and it learns to step back and forth to collect that reward. What happened?', options: ['Gamma was too small', 'The state space is too small', 'Reward hacking: the shaping reward can be farmed, so use potential-based shaping', 'The policy is deterministic'], answer: 2, why: 'Badly shaped rewards create loops that pay more than reaching the goal.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain Q-learning.', points: [['Q(s, a): expected discounted return of taking a in s and acting well afterwards', ['expected', 'return', 'action-value', 'action value', 'q-value', 'q value']], ['Update toward r + gamma * max Q(next state)', ['max', 'target', 'bellman', 'gamma']], ['Temporal-difference error and learning rate', ['temporal difference', 'temporal-difference', 'td', 'learning rate', 'alpha']], ['Exploration, for example epsilon-greedy', ['epsilon', 'explor']], ['Off-policy; tables do not scale, so use function approximation (DQN)', ['off-policy', 'off policy', 'dqn', 'neural', 'function approx']]], model: 'Q-learning learns an action-value function Q(s, a): the expected discounted return if I take action a in state s and act optimally afterwards. The agent acts, observes the reward and the next state, and moves Q(s, a) a small step, set by the learning rate alpha, toward the target: reward plus gamma times the maximum Q-value in the next state. The difference between target and current estimate is the temporal-difference error. Because the target uses the maximum, Q-learning is off-policy: it learns the greedy policy while behaving with an exploring one, typically epsilon-greedy. A table works for small problems; for large state spaces a neural network approximates Q, as in DQN, with a replay buffer and a target network for stability.' },
      { q: 'What is the exploration-exploitation trade-off and how do you handle it?', points: [['Exploit: choose the best-known action; explore: try others to learn', ['exploit', 'explor', 'best-known', 'best known']], ['Too little exploration locks in a poor policy; too much wastes reward', ['stuck', 'suboptimal', 'sub-optimal', 'waste', 'local']], ['Epsilon-greedy with decay', ['epsilon', 'decay', 'anneal']], ['Optimism, UCB, Thompson sampling', ['ucb', 'upper confidence', 'thompson', 'optimis']], ['Entropy bonus or noise for policy methods', ['entropy', 'noise', 'stochastic']]], model: 'An agent can exploit, choosing the action it currently believes is best, or explore, trying something else to learn more. Exploiting only can lock in a poor choice, because the agent never finds out that another action is better. Exploring too much wastes reward. The simplest method is epsilon-greedy: act at random with probability epsilon, and decay epsilon as estimates improve. Better methods direct exploration to where uncertainty is high: upper confidence bound adds a bonus to rarely tried actions, and Thompson sampling samples from the posterior over values. In policy-gradient methods the policy is stochastic and an entropy bonus keeps it from collapsing too early. In production I also limit exploration to safe actions.' },
      { q: 'When would you use reinforcement learning, and when not?', points: [['Sequential decisions with delayed consequences', ['sequential', 'delayed', 'long-term', 'long term']], ['A simulator or cheap, safe interaction is available', ['simulat', 'cheap', 'safe']], ['Costs: sample inefficiency, unstable training, reward design', ['sample', 'unstable', 'reward design', 'reward function', 'reward shaping']], ['Prefer supervised learning or bandits when they fit', ['supervised', 'bandit', 'simpler']], ['Offline RL or imitation when exploration is unsafe', ['offline', 'imitation', 'logged']]], model: 'Reinforcement learning fits problems where decisions are sequential, each action changes what happens later, and the feedback is a reward and not a correct label: games, robot control, resource scheduling. It works best with a fast, accurate simulator, because it needs a very large number of interactions. I would avoid it when a simpler formulation exists. If actions do not affect future states, a contextual bandit is enough. If I have labelled examples of good decisions, supervised or imitation learning is cheaper and more stable. Reinforcement learning is sample-inefficient, sensitive to hyperparameters and to the reward design, and exploration can be unsafe in the real world, where offline methods on logged data are a safer start.' }
    ]
  },

  {
    id: 'data-viz', title: 'Data exploration, visualisation and storytelling', group: 'foundations',
    uses: ['Business dashboards that track key metrics for decision makers', 'Experiment and analysis reports that drive product decisions'],
    tasks: [
      {
        id: 'x-viz-outliers', title: 'Outliers by the IQR rule',
        prompt: `A box plot marks points beyond its whiskers as outliers. Write \`iqr_outliers(xs)\`:

- \`q1\` and \`q3\` are the 25th and 75th percentiles (use \`np.percentile\`, which interpolates linearly).
- \`iqr = q3 - q1\`.
- Return, in their original order, the values **strictly** below \`q1 - 1.5 * iqr\` or above \`q3 + 1.5 * iqr\`.`,
        starter: R`import numpy as np

def iqr_outliers(xs):
    pass

print(iqr_outliers([1, 2, 3, 4, 100]))  # [100]
`,
        solution: R`import numpy as np

def iqr_outliers(xs):
    q1, q3 = np.percentile(xs, [25, 75])
    lo, hi = q1 - 1.5 * (q3 - q1), q3 + 1.5 * (q3 - q1)
    return [x for x in xs if x < lo or x > hi]
`,
        tests: [
          { name: 'One high outlier', code: R`assert list(iqr_outliers([1, 2, 3, 4, 100])) == [100], 'Q1 = 2, Q3 = 4, fences -1 and 7: only 100 is outside'` },
          { name: 'No outliers', code: R`assert list(iqr_outliers([10, 11, 12, 13, 14])) == [], 'Evenly spread values have no outliers'` },
          { name: 'Both sides, original order', code: R`assert list(iqr_outliers([60, 1, 2, 3, 4, 5, -50])) == [60, -50], 'Q1 = 1.5, Q3 = 4.5, fences -3 and 9; keep the input order'` },
          { name: 'A value on the fence is not an outlier', code: R`assert list(iqr_outliers([1, 2, 3, 4, 7])) == [], 'The upper fence is exactly 7; only values strictly beyond it count'` }
        ]
      },
      {
        id: 'x-viz-lie', title: 'Lie factor of a truncated axis',
        prompt: `A bar chart whose axis does not start at zero exaggerates differences. Tufte’s **lie factor** measures by how much:

\`lie factor = (relative change shown in the graphic) / (relative change in the data)\`

Two bars show values \`v1\` and \`v2\`, and the axis starts at \`baseline\`, so the drawn bar heights are \`v1 - baseline\` and \`v2 - baseline\`.

Write \`lie_factor(v1, v2, baseline)\`, where a relative change is \`(new - old) / old\`. A value of 1 is honest. Assume \`v1 != v2\` and \`baseline < v1\`.`,
        starter: R`def lie_factor(v1, v2, baseline):
    pass

print(lie_factor(50, 55, 45))  # 10.0
`,
        solution: R`def lie_factor(v1, v2, baseline):
    h1, h2 = v1 - baseline, v2 - baseline
    shown = (h2 - h1) / h1
    real = (v2 - v1) / v1
    return shown / real
`,
        tests: [
          { name: 'Axis from zero is honest', code: R`assert close(lie_factor(50, 55, 0), 1.0), 'With a zero baseline the bars show the true 10% change'` },
          { name: 'Truncated axis', code: R`assert close(lie_factor(50, 55, 45), 10.0), 'Bars of height 5 and 10 show +100% for a real +10%'` },
          { name: 'Another baseline', code: R`assert close(lie_factor(100, 120, 80), 5.0), 'Bars of 20 and 40 show +100% for a real +20%'` },
          { name: 'Works for a decrease', code: R`assert close(lie_factor(200, 150, 100), 2.0), 'Shown -50%, real -25%'` }
        ]
      }
    ],
    quiz: [
      { q: 'Which chart shows the distribution of one numeric variable?', options: ['Pie chart', 'Histogram', 'Line chart', 'Stacked bar chart'], answer: 1, why: 'It shows shape, centre, spread and outliers. A box plot is a compact alternative.', level: 'easy' },
      { q: 'Why should the value axis of a bar chart start at zero?', options: ['Bar length encodes the value, so a cut axis exaggerates differences', 'Software requires it', 'It makes the chart smaller', 'It hides outliers'], answer: 0, why: 'A line chart may zoom in, because position, not length, carries the value.', level: 'medium' },
      { q: 'Incomes are strongly right-skewed. Which summary describes a typical person best?', options: ['Mean', 'Maximum', 'Median', 'Standard deviation'], answer: 2, why: 'A few very large values pull the mean up; the median is robust.', level: 'medium' },
      { q: 'You present an analysis to senior managers. What comes first?', options: ['The data-cleaning steps', 'The model architecture', 'Every chart you made', 'The conclusion and the recommended action'], answer: 3, why: 'Lead with the answer, then give the supporting evidence.', level: 'easy' },
      { q: 'Which chart type is usually best for change over time?', options: ['Pie chart', 'Line chart', 'Scatter plot of two unrelated variables', 'Stacked 3D bars'], answer: 1, why: 'A line makes the trend and its direction easy to follow.', level: 'easy' },
      { q: 'What is an outlier?', options: ['A value far from the bulk of the data', 'The average value', 'A missing value', 'The most common value'], answer: 0, why: 'Outliers can be errors or real, important events; investigate before removing them.', level: 'easy' },
      { q: 'The first quartile is 10 and the third quartile is 20. Which value does the 1.5 × IQR rule flag as an outlier?', options: ['30', '34', '5', '40'], answer: 3, why: 'The fences are 10 − 15 = −5 and 20 + 15 = 35, so only 40 lies outside.', level: 'medium' },
      { q: 'A scatter plot of 100,000 points is one solid blob. What is a good fix?', options: ['Make every point larger', 'Use a pie chart', 'Use transparency, a hexbin plot or a 2D histogram', 'Delete half the points without telling anyone'], answer: 2, why: 'Showing density restores the information hidden by overlap.', level: 'medium' },
      { q: 'Values 50 and 55 are a 10% rise, but the bars are drawn 5 cm and 10 cm tall because the axis was cut. What is the lie factor?', options: ['1', '10', '2', '0.1'], answer: 1, why: 'The graphic shows a 100% change for a 10% data change: 100 / 10 = 10.', level: 'hard' },
      { q: 'A treatment looks better overall, but the other treatment is better in each of two patient subgroups. What is this?', options: ['Simpson’s paradox: the subgroup sizes differ, so the aggregate misleads', 'A rounding error', 'A sign of a perfect trial', 'Overfitting'], answer: 0, why: 'Always check the result within segments before drawing a conclusion.', level: 'hard' },
      { q: 'Ice cream sales and drowning incidents correlate at 0.9. A manager proposes banning ice cream. What is your answer?', options: ['Ban it immediately', 'Correlation proves cause', 'The data must be wrong', 'A third factor, hot weather, drives both; correlation is not causation'], answer: 3, why: 'Seek confounders before acting on a correlation.', level: 'hard' },
      { q: 'Why are dual-axis line charts risky?', options: ['They use too little ink', 'They cannot show time', 'Scaling each axis separately can create crossings and apparent relationships that are not in the data', 'They always hide outliers'], answer: 2, why: 'Designers control where the lines cross by choosing the scales.', level: 'hard' }
    ],
    interview: [
      { q: 'How do you explore a dataset you have never seen before?', points: [['Understand the question and how the data was collected', ['question', 'goal', 'collected', 'source', 'context']], ['Structure: rows, columns, types, grain, keys', ['type', 'shape', 'column', 'grain', 'key', 'row']], ['Quality: missing values, duplicates, impossible values', ['missing', 'duplicate', 'null', 'quality', 'impossible']], ['Univariate: distributions and outliers', ['distribution', 'histogram', 'outlier', 'skew']], ['Relationships: with the target, between features, over time, by segment', ['correlat', 'relationship', 'target', 'segment', 'over time', 'scatter']], ['Write down findings and check them with domain experts', ['domain', 'expert', 'document', 'finding']]], model: 'I start with the question the data should answer and how it was collected, because that decides what matters. Then I check structure: size, column types, what one row represents and which key identifies it. Next comes quality: missing values, duplicates, impossible values and inconsistent categories. I look at each variable alone with summary statistics and histograms to see skew and outliers, then at relationships: each feature against the target, correlations between features, trends over time and differences between segments. I plot before I trust a number, since summary statistics hide shape. I write down findings and surprises, and confirm them with someone who knows the domain before I model anything.' },
      { q: 'How do you present results to a non-technical audience?', points: [['Start from what the audience must decide', ['decision', 'decide', 'audience', 'care about']], ['Lead with the conclusion and recommendation', ['conclusion', 'recommend', 'headline', 'answer first', 'lead with']], ['One message per chart, clear titles, little clutter', ['one message', 'title', 'clutter', 'simple', 'annotat']], ['Plain language and business units, no jargon', ['plain', 'jargon', 'business', 'money', 'units']], ['State uncertainty and limits honestly', ['uncertain', 'confidence', 'limit', 'caveat', 'assumption']], ['End with next steps', ['next step', 'action']]], model: 'I start from the decision the audience has to make and build everything around it. I lead with the conclusion and my recommendation in one or two sentences, then show only the evidence needed to trust it. Each chart carries one message, stated in its title, with clutter removed and the key point annotated. I use plain language and translate metrics into business terms: money, time saved, customers affected, not AUC. I am honest about uncertainty and limits, using ranges and stating the main assumption. I finish with clear next steps and what I need from them, and keep the technical detail in an appendix for questions.' },
      { q: 'How can a chart mislead, and how do you prevent it?', points: [['Truncated or inconsistent axes', ['truncat', 'axis', 'zero', 'scale']], ['Dual axes and cherry-picked time ranges', ['dual', 'two axes', 'cherry', 'time range', 'window']], ['Area, 3D and pie distortions', ['3d', 'area', 'pie']], ['Aggregates hiding subgroups (Simpson’s paradox); correlation shown as causation', ['simpson', 'subgroup', 'aggregat', 'causation', 'causal']], ['Prevention: honest scales, show uncertainty and sample size, label clearly', ['uncertain', 'sample size', 'label', 'error bar', 'honest']]], model: 'Common ways are a bar-chart axis that does not start at zero, which exaggerates small differences; two different y-axes arranged to suggest a relationship; a time range chosen to hide the wider trend; and 3D or area effects, where the eye judges size poorly. Charts can also mislead through the data behind them: an average that hides opposite trends in subgroups, known as Simpson’s paradox, or a correlation presented as cause. To prevent this I start bars at zero, keep scales consistent across panels, show the full relevant period, add sample sizes and uncertainty, label axes and units, and ask whether a reader would reach the same conclusion from the raw numbers.' }
    ]
  },

  {
    id: 'data-pipelines', title: 'Data pipelines and engineering basics', group: 'production',
    uses: ['Nightly warehouse loads that feed reports and model training', 'Streaming event pipelines for fraud detection and live metrics'],
    tasks: [
      {
        id: 'x-pipe-quality', title: 'Data quality report',
        prompt: `Before loading a batch, check it. Write \`quality_report(rows, key, required)\`:

- \`rows\` is a list of dicts, \`key\` the name of the primary-key column, \`required\` a list of column names.
- Return a dict with:
  - \`'rows'\`: the number of rows
  - \`'duplicates'\`: how many rows repeat a key value that appeared earlier
  - \`'nulls'\`: a dict mapping each required column to the number of rows where it is \`None\` or missing`,
        starter: R`def quality_report(rows, key, required):
    pass

rows = [{'id': 1, 'city': 'A'}, {'id': 1, 'city': None}]
print(quality_report(rows, 'id', ['city']))  # {'rows': 2, 'duplicates': 1, 'nulls': {'city': 1}}
`,
        solution: R`def quality_report(rows, key, required):
    seen, duplicates = set(), 0
    nulls = {c: 0 for c in required}
    for row in rows:
        k = row.get(key)
        if k in seen:
            duplicates += 1
        seen.add(k)
        for c in required:
            if row.get(c) is None:
                nulls[c] += 1
    return {'rows': len(rows), 'duplicates': duplicates, 'nulls': nulls}
`,
        tests: [
          { name: 'Clean batch', code: R`rep = quality_report([{'id': 1, 'v': 5}, {'id': 2, 'v': 6}], 'id', ['v'])
assert rep == {'rows': 2, 'duplicates': 0, 'nulls': {'v': 0}}, 'A clean batch has no duplicates and no nulls'` },
          { name: 'Duplicates', code: R`rep = quality_report([{'id': 1}, {'id': 1}, {'id': 2}, {'id': 1}], 'id', [])
assert rep['rows'] == 4 and rep['duplicates'] == 2 and rep['nulls'] == {}, 'Key 1 appears three times: two of those rows are duplicates'` },
          { name: 'None and missing columns', code: R`rep = quality_report([{'id': 1, 'a': None, 'b': 2}, {'id': 2, 'b': 0}, {'id': 3, 'a': 'x'}], 'id', ['a', 'b'])
assert rep['nulls'] == {'a': 2, 'b': 1}, 'Count None and absent columns as null; 0 is a valid value'` },
          { name: 'Empty batch', code: R`assert quality_report([], 'id', ['a']) == {'rows': 0, 'duplicates': 0, 'nulls': {'a': 0}}, 'An empty batch still reports every required column'` }
        ]
      },
      {
        id: 'x-pipe-upsert', title: 'Idempotent upsert',
        prompt: `A job that can safely run twice is **idempotent**. Appending is not; an **upsert** (update or insert by key) is.

Write \`upsert(table, batch, key)\`:

- \`table\` and \`batch\` are lists of dicts.
- A batch row whose key exists in the table **replaces** that row, in the same position.
- A row with a new key is **appended**.
- If the batch contains the same key twice, the last one wins.
- Return a new list; do not modify \`table\`.`,
        starter: R`def upsert(table, batch, key):
    return table + batch
`,
        solution: R`def upsert(table, batch, key):
    out = [dict(r) for r in table]
    pos = {r[key]: i for i, r in enumerate(out)}
    for row in batch:
        if row[key] in pos:
            out[pos[row[key]]] = dict(row)
        else:
            pos[row[key]] = len(out)
            out.append(dict(row))
    return out
`,
        tests: [
          { name: 'Update and insert', code: R`t = [{'id': 1, 'v': 'a'}, {'id': 2, 'v': 'b'}]
assert upsert(t, [{'id': 2, 'v': 'B'}, {'id': 3, 'v': 'c'}], 'id') == [{'id': 1, 'v': 'a'}, {'id': 2, 'v': 'B'}, {'id': 3, 'v': 'c'}], 'Row 2 is replaced in place and row 3 is appended'` },
          { name: 'Running twice equals running once', code: R`t = [{'id': 1, 'v': 'a'}]
b = [{'id': 1, 'v': 'z'}, {'id': 5, 'v': 'n'}]
once = upsert(t, b, 'id')
assert upsert(once, b, 'id') == once and len(once) == 2, 'Re-running the same batch must not add or change rows'` },
          { name: 'Input table is not modified', code: R`t = [{'id': 1, 'v': 'a'}]
upsert(t, [{'id': 1, 'v': 'z'}, {'id': 2, 'v': 'y'}], 'id')
assert t == [{'id': 1, 'v': 'a'}], 'Return a new list and leave the original table as it was'` },
          { name: 'Last duplicate in the batch wins', code: R`assert upsert([], [{'id': 7, 'v': 1}, {'id': 7, 'v': 2}], 'id') == [{'id': 7, 'v': 2}], 'The same key twice in one batch must give one row with the last value'` }
        ]
      }
    ],
    quiz: [
      { q: 'What is the difference between ETL and ELT?', options: ['ETL is for streaming, ELT for batch', 'ETL transforms before loading; ELT loads raw data first and transforms inside the warehouse', 'ELT never transforms data', 'They are the same thing'], answer: 1, why: 'Cheap, scalable warehouses made ELT the common pattern.', level: 'easy' },
      { q: 'A job is idempotent when…', options: ['It runs only once', 'It never fails', 'Running it again with the same input leaves the same result', 'It is faster than a normal job'], answer: 2, why: 'Retries and backfills are then safe.', level: 'easy' },
      { q: 'Why partition a large table by date?', options: ['Queries and reruns can read or replace only the dates they need', 'It encrypts the data', 'It removes duplicates', 'It makes every query scan the whole table'], answer: 0, why: 'This is called partition pruning, and it makes overwrite-by-partition reruns simple.', level: 'medium' },
      { q: 'When is streaming worth its extra complexity?', options: ['Always', 'For monthly reports', 'When the data is small', 'When decisions need data that is seconds old, such as fraud checks'], answer: 3, why: 'If hourly or daily freshness is enough, batch is simpler and cheaper.', level: 'medium' },
      { q: 'What does the “T” in ETL stand for?', options: ['Transfer', 'Transform', 'Test', 'Table'], answer: 1, why: 'Extract, Transform, Load.', level: 'easy' },
      { q: 'What is a backfill?', options: ['Running the pipeline again for past dates', 'Deleting old data', 'Adding a new column', 'Speeding up a query'], answer: 0, why: 'Backfills fill gaps or fix history after a bug; idempotent tasks make them safe.', level: 'easy' },
      { q: 'A load that inserts rows with no key fails at 03:00 and is retried at 04:00 after partly succeeding. What is the likely result?', options: ['Perfect data', 'An empty table', 'Faster queries', 'Duplicate rows'], answer: 3, why: 'A blind insert repeats the rows that were already written.', level: 'medium' },
      { q: 'At noon the dashboard still shows yesterday’s numbers although the data was due at 07:00. What do you check first?', options: ['The chart colours', 'The company logo', 'Whether the scheduled run finished, and the data freshness monitor', 'The office Wi-Fi'], answer: 2, why: 'Stale data is usually a failed or late run.', level: 'medium' },
      { q: 'A 20 million row table changes by 2% a day. Over 5 days, how many times fewer rows does an incremental extract read than a full reload each day?', options: ['5', '50', '20', '100'], answer: 1, why: 'Full: 5 × 20M = 100M. Incremental: 5 × 0.4M = 2M. The ratio is 50.', level: 'hard' },
      { q: 'Orders worth 10, 20 and 30 are joined to payments. Order 2 has two payment rows. What does SUM(order_amount) return after the join?', options: ['80', '60', '70', '90'], answer: 0, why: 'Order 2 appears twice: 10 + 20 + 20 + 30 = 80, not 60.', level: 'hard' },
      { q: 'A queue delivers each card-charge message at least once. How do you stop customers being charged twice?', options: ['Hope for no retries', 'Use a faster queue', 'Charge twice the price', 'Make the consumer idempotent with a unique key per charge'], answer: 3, why: 'Duplicates are normal, so deduplicate on a key.', level: 'hard' },
      { q: 'A stream job uses a 5-minute watermark, but events arrive 20 minutes late. What happens?', options: ['They are counted twice', 'The job stops', 'Those events are dropped or sent aside, so window counts are too low', 'They are counted correctly'], answer: 2, why: 'Lengthen the allowed lateness, or accept more latency, or fix late events in a batch run.', level: 'hard' }
    ],
    interview: [
      { q: 'How do you make a daily batch pipeline reliable?', points: [['Idempotent tasks: overwrite a partition or upsert, never blind append', ['idempot', 'overwrite', 'upsert', 'merge']], ['Orchestrator with dependencies, retries and alerts', ['orchestrat', 'airflow', 'dag', 'retry', 'retries', 'alert']], ['Data quality checks that stop bad data', ['quality', 'check', 'validat', 'schema', 'test']], ['Parameterise by run date so backfills work', ['backfill', 'run date', 'execution date', 'parameter', 'logical date']], ['Monitoring: freshness, row counts, lineage', ['monitor', 'freshness', 'row count', 'lineage', 'sla']]], model: 'I make every task idempotent: it takes the run date as a parameter, reads only that slice and overwrites that date partition or upserts by key, so a retry or backfill cannot create duplicates. An orchestrator such as Airflow runs the tasks as a dependency graph with retries, timeouts and alerts. Between steps I run data quality checks: schema, row counts against recent days, null rates, unique keys and value ranges. A failed check stops the pipeline before bad data reaches reports or models. I keep raw data unchanged so I can reprocess it, monitor freshness and duration, record lineage, and keep the transformation code in version control with tests.' },
      { q: 'Batch or streaming: how do you decide?', points: [['Start from the freshness the use case really needs', ['fresh', 'latency', 'how soon', 'requirement', 'real-time', 'real time']], ['Batch: simpler, cheaper, easy to rerun', ['simple', 'cheap', 'rerun', 'reprocess', 'batch']], ['Streaming: low latency, but ordering, late data and state are hard', ['late', 'order', 'state', 'window', 'watermark']], ['Delivery guarantees: at-least-once plus idempotent consumers', ['at-least-once', 'at least once', 'exactly-once', 'exactly once', 'dedup', 'idempot']], ['Micro-batch as a middle path', ['micro-batch', 'micro batch', 'minutes', 'hybrid']]], model: 'I start from how fresh the data must be for the decision it supports. A daily report or a nightly model retrain needs batch, which is simpler to build, cheaper to run and easy to rerun when something breaks. Fraud checks, live dashboards and alerts need data within seconds, which justifies streaming. Streaming brings harder problems: events arrive late and out of order, so I need event-time windows and watermarks; state must survive restarts; and delivery is usually at-least-once, so consumers must be idempotent or deduplicate. If minutes are good enough, frequent micro-batches give most of the benefit for much less complexity. Many systems use both: a stream for the fresh view and batch for the complete, corrected history.' },
      { q: 'Explain data warehouses, data lakes and lakehouses.', points: [['Warehouse: structured, schema on write, fast SQL analytics', ['warehouse', 'structured', 'sql', 'schema on write', 'schema-on-write']], ['Lake: raw files of any type in cheap object storage, schema on read', ['lake', 'raw', 'object stor', 'schema on read', 'schema-on-read', 'files']], ['Lakehouse: table formats add transactions and schema to lake files', ['lakehouse', 'delta', 'iceberg', 'transaction', 'acid']], ['Columnar formats such as Parquet', ['parquet', 'columnar', 'column']], ['Layers from raw to cleaned to curated', ['layer', 'bronze', 'staging', 'curated', 'medallion']]], model: 'A data warehouse stores structured, cleaned tables with a schema enforced on write and is optimised for SQL analytics, using columnar storage. A data lake stores raw files of any type, such as logs, images and Parquet, in cheap object storage, and the schema is applied when the data is read. Lakes are flexible and good for machine learning, but without discipline they become a swamp. A lakehouse combines the two: open table formats such as Delta Lake or Iceberg add transactions, schema enforcement and time travel on top of files in the lake. In all of them I organise data in layers, from raw to cleaned to curated business tables, and partition large tables, usually by date.' }
    ]
  },

  {
    id: 'dev-tools', title: 'Developer tools: Git, Linux, testing', group: 'foundations',
    uses: ['Pull-request workflows with automated tests in continuous integration', 'Reproducible training and serving environments on Linux servers'],
    tasks: [
      {
        id: 'x-dev-merge3', title: 'Three-way merge',
        prompt: `Git merges two branches by comparing each with their common ancestor (the **base**). Model a file as a dict of settings and write \`merge3(base, ours, theirs)\`.

For every key in any of the three dicts (a missing key means "not present"):

- If both sides have the same value, take it.
- If only one side changed it from the base, take that side’s change (this includes adding or deleting the key).
- If both sides changed it in different ways, it is a **conflict**: keep our version and record the key.

Return \`(merged, conflicts)\`, where \`conflicts\` is a sorted list of keys.`,
        starter: R`def merge3(base, ours, theirs):
    return dict(ours), []
`,
        solution: R`def merge3(base, ours, theirs):
    MISSING = object()
    merged, conflicts = {}, []
    for k in sorted(set(base) | set(ours) | set(theirs)):
        b, o, t = base.get(k, MISSING), ours.get(k, MISSING), theirs.get(k, MISSING)
        if o == t or t == b:
            v = o
        elif o == b:
            v = t
        else:
            conflicts.append(k)
            v = o
        if v is not MISSING:
            merged[k] = v
    return merged, conflicts
`,
        tests: [
          { name: 'Changes to different keys merge cleanly', code: R`m, c = merge3({'a': 1, 'b': 2}, {'a': 10, 'b': 2}, {'a': 1, 'b': 20})
assert m == {'a': 10, 'b': 20} and list(c) == [], 'Each side changed a different key: take both changes'` },
          { name: 'Conflict', code: R`m, c = merge3({'a': 1}, {'a': 2}, {'a': 3})
assert m == {'a': 2} and list(c) == ['a'], 'Both sides changed the same key differently: keep ours and report the conflict'` },
          { name: 'The same change on both sides', code: R`m, c = merge3({'a': 1}, {'a': 5}, {'a': 5})
assert m == {'a': 5} and list(c) == [], 'Identical changes are not a conflict'` },
          { name: 'Additions and deletions', code: R`m, c = merge3({'a': 1, 'b': 2}, {'a': 1}, {'a': 1, 'b': 2, 'c': 3})
assert m == {'a': 1, 'c': 3} and list(c) == [], 'We deleted b, they added c: the result has a and c'` }
        ]
      },
      {
        id: 'x-dev-runner', title: 'A tiny test runner',
        prompt: `Write \`run_tests(func, cases)\`, a miniature version of what pytest does.

- \`cases\` is a list of \`(args, expected)\` pairs, where \`args\` is a tuple of arguments.
- A case passes if \`func(*args) == expected\`.
- A case that raises an exception **fails**; it must not stop the run.

Return \`{'passed': number_passed, 'failed': [indices of failed cases]}\`.`,
        starter: R`def run_tests(func, cases):
    pass

print(run_tests(abs, [((-2,), 2), ((3,), -3)]))  # {'passed': 1, 'failed': [1]}
`,
        solution: R`def run_tests(func, cases):
    passed, failed = 0, []
    for i, (args, expected) in enumerate(cases):
        try:
            ok = func(*args) == expected
        except Exception:
            ok = False
        if ok:
            passed += 1
        else:
            failed.append(i)
    return {'passed': passed, 'failed': failed}
`,
        tests: [
          { name: 'All pass', code: R`assert run_tests(abs, [((-2,), 2), ((3,), 3)]) == {'passed': 2, 'failed': []}, 'Both cases are correct'` },
          { name: 'A wrong result fails', code: R`assert run_tests(abs, [((-2,), 2), ((3,), -3), ((0,), 0)]) == {'passed': 2, 'failed': [1]}, 'Case 1 expects -3 but abs(3) is 3'` },
          { name: 'An exception is a failure, not a crash', code: R`div = lambda a, b: a / b
assert run_tests(div, [((1, 0), 0), ((6, 3), 2)]) == {'passed': 1, 'failed': [0]}, 'Division by zero must be caught and counted as a failed case'` },
          { name: 'Several arguments and no cases', code: R`assert run_tests(max, [((1, 5, 3), 5)]) == {'passed': 1, 'failed': []} and run_tests(abs, []) == {'passed': 0, 'failed': []}, 'Unpack the argument tuple; an empty list gives zero passed'` }
        ]
      }
    ],
    quiz: [
      { q: 'What is the main difference between `git merge` and `git rebase`?', options: ['Merge deletes the branch', 'Merge joins two histories with a merge commit; rebase replays your commits on top of the other branch, rewriting them', 'Rebase works only on the main branch', 'They produce identical history'], answer: 1, why: 'Because rebase rewrites commits, do not rebase commits other people already use.', level: 'easy' },
      { q: 'A bad commit is already on the shared main branch. What is the safe way to undo it?', options: ['`git reset --hard` and force-push', 'Delete the repository', 'Edit the history by hand', '`git revert`, which adds a new commit that undoes it'], answer: 3, why: 'Revert keeps the shared history intact for everyone else.', level: 'medium' },
      { q: 'Why use one virtual environment per project?', options: ['Each project gets its own package versions, so projects cannot break each other', 'It makes Python faster', 'It encrypts the code', 'Git requires it'], answer: 0, why: 'Together with a pinned requirements or lock file it makes the setup reproducible.', level: 'easy' },
      { q: 'Which describes a good unit test?', options: ['It calls the production database', 'It passes or fails depending on the time of day', 'It is fast, isolated and deterministic, and checks one behaviour', 'It tests the whole system at once'], answer: 2, why: 'Slow or flaky tests get ignored, which defeats their purpose.', level: 'medium' },
      { q: 'What does `git clone` do?', options: ['Deletes the remote repository', 'Copies a remote repository with its history to your machine', 'Merges two branches', 'Runs the tests'], answer: 1, why: 'It is normally the first command on a new project.', level: 'easy' },
      { q: 'What is a pull request?', options: ['A request to merge a branch, which enables review and automated checks', 'A download of the repository', 'A way to delete a branch', 'A type of test'], answer: 0, why: 'It is where teams discuss, test and approve changes.', level: 'easy' },
      { q: '`git pull` is a shortcut for which two actions?', options: ['Commit then push', 'Stash then reset', 'Clone then delete', 'Fetch from the remote, then merge (or rebase) into your branch'], answer: 3, why: 'You can run them separately to look before you merge.', level: 'medium' },
      { q: 'You committed a large data file locally but have not pushed. What is the best fix?', options: ['Push it and tell nobody', 'Delete the repository', 'Undo the local commit, add the file to .gitignore and commit again', 'Rename the file'], answer: 2, why: 'History that was never shared can be safely rewritten.', level: 'medium' },
      { q: 'Ours changed lines 3 and 9. Theirs changed line 3 to the same text and also changed line 20. How many conflicts arise?', options: ['1', '0', '2', '3'], answer: 1, why: 'Identical changes merge cleanly, and lines 9 and 20 are changed by one side only.', level: 'hard' },
      { q: 'A test passes alone but fails when the full suite runs. What is the likely cause?', options: ['Shared state or order dependence between tests', 'pytest is out of date', 'The test is too short', 'Git is broken'], answer: 0, why: 'Tests must set up and clean their own state.', level: 'hard' },
      { q: 'A bug appeared somewhere in 64 commits between a good one and a bad one. What is the maximum number of builds that `git bisect` needs?', options: ['8', '32', '64', '6'], answer: 3, why: 'Binary search halves the range each time and log2(64) = 6.', level: 'hard' },
      { q: 'Why is `git push --force-with-lease` safer than `--force` after a rebase?', options: ['It is faster', 'It encrypts the push', 'It refuses to overwrite remote commits you have not seen', 'It skips tests'], answer: 2, why: 'It protects teammates’ new commits from being erased.', level: 'hard' }
    ],
    interview: [
      { q: 'Describe your Git workflow for a new feature.', points: [['Create a branch from an up-to-date main', ['branch', 'main', 'pull']], ['Small, focused commits with clear messages', ['small', 'commit', 'message']], ['Push and open a pull request', ['pull request', 'merge request', 'push']], ['Automated tests in CI and code review', ['ci', 'test', 'review']], ['Keep the branch current by merging or rebasing; resolve conflicts', ['rebase', 'conflict', 'up to date', 'up-to-date']], ['Merge, then delete the branch', ['merge', 'delete', 'squash']]], model: 'I update main, then create a short-lived branch named after the feature. I work in small, focused commits with messages that say what changed and why. I push the branch and open a pull request early, with a description of the change and how I tested it. Continuous integration runs the linter and the tests on every push, and at least one colleague reviews the code. If main moves on, I rebase my branch or merge main into it and resolve any conflicts locally, running the tests again. Once the checks pass and the review is approved, I merge, often as a squash commit, and delete the branch.' },
      { q: 'How do you test machine-learning code?', points: [['Unit tests for data transforms and feature code, with small fixed inputs', ['unit test', 'transform', 'feature', 'preprocess', 'fixed input', 'small input']], ['Check shapes, value ranges and edge cases', ['shape', 'range', 'edge case', 'empty', 'nan']], ['Fix random seeds; compare floats with a tolerance', ['seed', 'determin', 'tolerance', 'approx']], ['Quick training checks: overfit one small batch, loss decreases', ['overfit', 'one batch', 'small batch', 'loss decreas', 'smoke']], ['Data validation and model-quality thresholds in CI', ['data validation', 'schema', 'threshold', 'ci', 'regression']]], model: 'I test the deterministic parts like any other code: unit tests for data transforms, feature functions and metrics, with small hand-made inputs whose correct output I know, including edge cases such as empty input and missing values. For model code I test properties, not exact numbers: output shapes, value ranges, that probabilities sum to one. I fix random seeds and compare floats with a tolerance. A quick smoke test trains for a few steps and checks that the loss decreases, or that the model can overfit one small batch. Around the code I add data validation for the schema and distributions, and a gate in continuous integration that fails if model quality on a fixed evaluation set drops below a threshold.' },
      { q: 'What do you look for in a code review?', points: [['Correctness, including edge cases', ['correct', 'edge case', 'bug']], ['Tests exist and cover the change', ['test']], ['Readability: naming, structure, simplicity', ['readab', 'naming', 'name', 'simple', 'clear']], ['Design and maintainability; fits the codebase', ['design', 'maintain', 'duplicat', 'architecture']], ['Security and performance where relevant', ['security', 'secret', 'performance']], ['Constructive tone; small pull requests', ['constructive', 'kind', 'respect', 'small pull', 'question']]], model: 'First I make sure I understand what the change is meant to do, then I check that it does it correctly, including edge cases and error handling. I look for tests that cover the new behaviour and would fail without the change. I read for clarity: names, function size, and whether a simpler design would do. I check that it fits the existing codebase, avoids duplication, and does not leak secrets or add an obvious performance problem. Style is left to the linter. I keep comments specific and constructive, ask questions where I am unsure, separate must-fix issues from suggestions, and say what is good. As an author I keep pull requests small so they can be reviewed properly.' }
    ]
  },

  {
    id: 'generative-models', title: 'Generative models: VAEs, GANs, diffusion, multimodal', group: 'genai',
    uses: ['Text-to-image tools used for design, advertising and concept art', 'Vision-language assistants that read documents, charts and photos'],
    tasks: [
      {
        id: 'x-gen-qsample', title: 'Diffusion: add noise in one jump',
        prompt: `The forward process of a diffusion model adds a little Gaussian noise at each step, set by a schedule \`betas\`. Thanks to a closed form you can jump straight to step \`t\`:

- \`alpha_bar_t\` = product of \`(1 - beta)\` for steps \`0\` to \`t\` inclusive
- \`x_t = sqrt(alpha_bar_t) * x0 + sqrt(1 - alpha_bar_t) * eps\`

Write \`q_sample(x0, t, betas, eps)\`, where \`x0\` is the clean data and \`eps\` is noise of the same shape. Return \`x_t\` as an array.`,
        starter: R`import numpy as np

def q_sample(x0, t, betas, eps):
    pass
`,
        solution: R`import numpy as np

def q_sample(x0, t, betas, eps):
    alpha_bar = np.prod(1 - np.asarray(betas, float)[:t + 1])
    return np.sqrt(alpha_bar) * np.asarray(x0, float) + np.sqrt(1 - alpha_bar) * np.asarray(eps, float)
`,
        tests: [
          { name: 'One step', code: R`import math
assert close(q_sample([2.0], 0, [0.5], [0.0]), [2 * math.sqrt(0.5)]) and close(q_sample([0.0], 0, [0.5], [2.0]), [2 * math.sqrt(0.5)]), 'With beta 0.5 both the signal and the noise are scaled by sqrt(0.5)'` },
          { name: 'Zero betas add no noise', code: R`assert close(q_sample([1.0, -3.0], 1, [0.0, 0.0], [9.0, 9.0]), [1.0, -3.0]), 'With beta = 0 the data is unchanged'` },
          { name: 'Cumulative product up to t', code: R`import math
assert close(q_sample([1.0, 0.0], 1, [0.19, 0.19, 0.9], [0.0, 1.0]), [0.81, math.sqrt(1 - 0.6561)]), 'alpha_bar at t = 1 is 0.81 * 0.81 = 0.6561; later betas must not be used'` },
          { name: 'Late steps are almost pure noise', code: R`out = q_sample([1.0, -1.0], 39, [0.5] * 40, [0.3, 0.7])
assert close(out, [0.3, 0.7], 1e-4), 'After many steps alpha_bar is near 0, so x_t is nearly eps'` }
        ]
      },
      {
        id: 'x-gen-kl', title: 'The KL term of a VAE',
        prompt: `A VAE encoder outputs a mean \`mu\` and a log-variance \`logvar\` for each latent dimension. The loss includes the KL divergence from that Gaussian to the standard normal:

\`KL = -0.5 * sum(1 + logvar - mu² - exp(logvar))\`

Write \`kl_gaussian(mu, logvar)\` returning this as a float.`,
        starter: R`import numpy as np

def kl_gaussian(mu, logvar):
    pass
`,
        solution: R`import numpy as np

def kl_gaussian(mu, logvar):
    mu, logvar = np.asarray(mu, float), np.asarray(logvar, float)
    return float(-0.5 * np.sum(1 + logvar - mu ** 2 - np.exp(logvar)))
`,
        tests: [
          { name: 'Standard normal costs nothing', code: R`assert close(kl_gaussian([0.0, 0.0], [0.0, 0.0]), 0.0, 1e-9), 'mu = 0 and logvar = 0 is exactly the prior: KL = 0'` },
          { name: 'Shifted mean', code: R`assert close(kl_gaussian([1.0], [0.0]), 0.5) and close(kl_gaussian([1.0, -2.0], [0.0, 0.0]), 2.5), 'Each dimension adds mu squared divided by 2'` },
          { name: 'Wider variance', code: R`import math
assert close(kl_gaussian([0.0], [math.log(4.0)]), 0.5 * (3 - math.log(4.0))), 'With variance 4: -0.5 * (1 + ln 4 - 4)'` },
          { name: 'Never negative', code: R`import numpy as np
rng = np.random.default_rng(0)
assert all(kl_gaussian(rng.normal(size=5), rng.normal(size=5)) >= 0 for _ in range(50)), 'A KL divergence cannot be negative'` }
        ]
      }
    ],
    quiz: [
      { q: 'Which two networks does a GAN train against each other?', options: ['An encoder and a decoder', 'A generator and a discriminator', 'A teacher and a student', 'An actor and a critic'], answer: 1, why: 'The generator makes fakes; the discriminator tries to tell them from real data.', level: 'easy' },
      { q: 'What is a diffusion model trained to do?', options: ['Classify images', 'Compress images into a single number', 'Predict the noise that was added to a training example at a random step', 'Fool a discriminator'], answer: 2, why: 'Generation then starts from pure noise and removes the predicted noise step by step.', level: 'easy' },
      { q: 'A GAN produces only a few kinds of image, however the input noise varies. This is called…', options: ['Mode collapse', 'Posterior collapse', 'Overfitting', 'Vanishing gradients'], answer: 0, why: 'The generator found a few outputs that fool the discriminator and ignores the rest of the data.', level: 'medium' },
      { q: 'How is CLIP trained?', options: ['To generate images from noise', 'To predict the next word', 'To reconstruct masked pixels', 'Contrastively, so matching images and captions get similar embeddings'], answer: 3, why: 'The shared image-text space enables zero-shot classification and guides text-to-image models.', level: 'medium' },
      { q: 'What is the latent space of a VAE?', options: ['The dataset’s folder', 'A compact space of codes from which the decoder builds data', 'The set of labels', 'The GPU memory'], answer: 1, why: 'Nearby codes decode to similar data.', level: 'easy' },
      { q: 'What does FID measure?', options: ['The distance between real and generated image feature distributions; lower is better', 'The number of pixels', 'The training time', 'The classifier accuracy'], answer: 0, why: 'It is the most common score for image generators.', level: 'easy' },
      { q: 'After training a VAE, how do you generate a new sample?', options: ['Run the discriminator', 'Encode a blank image', 'Average the dataset', 'Draw a code from N(0, I) and decode it'], answer: 3, why: 'The KL term made normal codes valid inputs for the decoder.', level: 'medium' },
      { q: 'A text-to-image result ignores half of the prompt. Which setting should you raise?', options: ['The image file size', 'The batch size', 'The guidance scale', 'The random seed only'], answer: 2, why: 'Higher classifier-free guidance follows the prompt more closely.', level: 'medium' },
      { q: 'What is the KL term 0.5 × (mu² + sigma² − 1 − ln sigma²) for mu = 1 and sigma = 1?', options: ['0', '0.5', '1', '2'], answer: 1, why: '0.5 × (1 + 1 − 1 − 0) = 0.5.', level: 'hard' },
      { q: 'With a_bar = 0.36, x0 = 1 and eps = 1, what is x_t = sqrt(a_bar) × x0 + sqrt(1 − a_bar) × eps?', options: ['1.4', '1.0', '1.8', '0.8'], answer: 0, why: 'sqrt(0.36) = 0.6 and sqrt(0.64) = 0.8, so 0.6 + 0.8 = 1.4.', level: 'hard' },
      { q: 'A GAN’s discriminator loss falls to nearly zero in the first epoch and the generator produces noise. What do you try?', options: ['Train the discriminator longer', 'Remove the generator', 'Use fewer real images', 'Weaken the discriminator: lower its learning rate, add label smoothing or noise'], answer: 3, why: 'A balanced game is needed so the generator receives useful gradients.', level: 'hard' },
      { q: 'What typically happens if you raise the guidance scale from 3 to 20?', options: ['The images become more diverse', 'Sampling gets faster', 'The image follows the prompt more strictly but is less varied and may be oversaturated', 'The model forgets the prompt'], answer: 2, why: 'Guidance trades diversity for prompt fidelity.', level: 'hard' }
    ],
    interview: [
      { q: 'Compare VAEs, GANs and diffusion models.', points: [['VAE: encoder-decoder with a probabilistic latent space; reconstruction plus KL loss', ['vae', 'latent', 'kl', 'reconstruct']], ['VAE: stable and fast, but blurry samples', ['blur']], ['GAN: generator against discriminator; sharp and fast, but unstable with mode collapse', ['gan', 'discriminator', 'mode collapse', 'unstable', 'adversarial']], ['Diffusion: learns to denoise; best quality and coverage, stable training', ['diffusion', 'denois', 'noise']], ['Diffusion is slow: many sampling steps', ['slow', 'steps', 'iterative']]], model: 'A VAE encodes data into a distribution over a latent space and decodes samples from it, trained with a reconstruction loss plus a KL term that keeps the latent space close to a standard normal. Training is stable and sampling is fast, but outputs tend to be blurry. A GAN trains a generator against a discriminator. It gives sharp samples in a single forward pass, but training is unstable and can suffer mode collapse. A diffusion model learns to remove noise step by step. It trains stably with a simple regression loss and gives the best quality and diversity, at the cost of slow, iterative sampling. Modern image systems combine them: diffusion running in the latent space of a VAE.' },
      { q: 'How does a text-to-image diffusion model generate an image?', points: [['Start from random noise', ['random noise', 'pure noise', 'gaussian noise']], ['A network (U-Net or transformer) predicts the noise at each step', ['u-net', 'unet', 'predict', 'transformer']], ['Remove noise iteratively following a schedule', ['iterat', 'step', 'schedule', 'sampler']], ['Text encoder conditions the network through cross-attention', ['text encoder', 'cross-attention', 'cross attention', 'condition', 'clip']], ['Classifier-free guidance strengthens the prompt', ['classifier-free', 'classifier free', 'guidance']], ['Works in a VAE latent space, decoded at the end', ['latent', 'vae', 'decode']]], model: 'The prompt is turned into embeddings by a text encoder such as CLIP or T5. Generation starts from pure Gaussian noise, in latent diffusion a small latent tensor and not full-resolution pixels. At each of a few dozen steps a denoising network, a U-Net or a transformer, receives the noisy latent, the step number and the text embeddings through cross-attention, and predicts the noise. The sampler removes part of that noise according to the schedule. Classifier-free guidance runs the network with and without the prompt and pushes the result toward the conditioned prediction, trading diversity for prompt fidelity. After the last step, the VAE decoder turns the clean latent into the final image.' },
      { q: 'How do vision-language models work?', points: [['Contrastive models such as CLIP align image and text embeddings', ['clip', 'contrastive', 'align', 'shared space', 'shared embedding']], ['Vision encoder turns image patches into tokens', ['vision encoder', 'patch', 'vit', 'image token']], ['A projection layer maps image features into the language model’s token space', ['project', 'adapter', 'connector', 'map']], ['The language model reads image and text tokens together and generates text', ['language model', 'llm', 'generat', 'token']], ['Limits: hallucination, small text, counting and spatial reasoning', ['hallucinat', 'counting', 'spatial', 'small text', 'limit']]], model: 'There are two main families. Contrastive models such as CLIP train an image encoder and a text encoder so that matching images and captions get similar embeddings. That gives a shared space for zero-shot classification and image search. Generative vision-language models connect a vision encoder to a large language model: the image is cut into patches, a vision transformer turns them into feature vectors, and a projection layer maps those into the language model’s token space. The language model then reads image tokens and text tokens together and generates an answer, so it can caption, answer questions and read documents. Typical weaknesses are hallucinated details, small text, counting and precise spatial reasoning, so I evaluate on my own task.' }
    ]
  },

  {
    id: 'responsible-ai', title: 'Responsible AI: fairness, privacy, explainability', group: 'production',
    uses: ['Fairness audits of credit-scoring and hiring models', 'Model documentation and explanations required in regulated sectors'],
    tasks: [
      {
        id: 'x-rai-parity', title: 'Demographic parity gap',
        prompt: `**Demographic parity** asks that each group receives positive predictions at the same rate.

Write \`parity_gap(y_pred, group)\`:

- \`y_pred\` is a list of 0/1 predictions and \`group\` the group label of each person.
- Compute the positive rate (share of 1s) in each group.
- Return the largest rate minus the smallest rate. 0 means parity.`,
        starter: R`def parity_gap(y_pred, group):
    pass

print(parity_gap([1, 1, 0, 0], ['a', 'a', 'b', 'b']))  # 1.0
`,
        solution: R`def parity_gap(y_pred, group):
    total, positive = {}, {}
    for p, g in zip(y_pred, group):
        total[g] = total.get(g, 0) + 1
        positive[g] = positive.get(g, 0) + (1 if p == 1 else 0)
    rates = [positive[g] / total[g] for g in total]
    return max(rates) - min(rates)
`,
        tests: [
          { name: 'Maximum disparity', code: R`assert close(parity_gap([1, 1, 0, 0], ['a', 'a', 'b', 'b']), 1.0), 'Group a always gets 1 and group b never does'` },
          { name: 'Equal rates', code: R`assert close(parity_gap([1, 0, 0, 1], ['a', 'a', 'b', 'b']), 0.0), 'Both groups have a positive rate of 0.5'` },
          { name: 'Groups of different size', code: R`assert close(parity_gap([1, 0, 1, 1, 0, 0, 0, 0, 1], ['a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b']), 1 / 3), 'Rates are 2/3 for a and 2/6 for b'` },
          { name: 'Three groups', code: R`assert close(parity_gap([1, 1, 1, 0, 0, 0], ['x', 'x', 'y', 'y', 'z', 'z']), 1.0) and close(parity_gap([1, 0], ['x', 'x']), 0.0), 'Use the largest minus the smallest rate; one group alone gives 0'` }
        ]
      },
      {
        id: 'x-rai-kanon', title: 'k-anonymity',
        prompt: `Removing names does not make data anonymous: a combination of **quasi-identifiers** such as postcode, birth year and gender can still single out a person.

A table is **k-anonymous** if every combination of quasi-identifier values that occurs is shared by at least \`k\` rows.

Write \`k_anonymity(rows, quasi)\` that returns the largest such \`k\`: the size of the smallest group of rows sharing the same values in the \`quasi\` columns. Return 0 for an empty table.`,
        starter: R`def k_anonymity(rows, quasi):
    pass

rows = [{'zip': '11', 'age': 30}, {'zip': '11', 'age': 30}, {'zip': '22', 'age': 41}]
print(k_anonymity(rows, ['zip', 'age']))  # 1
`,
        solution: R`def k_anonymity(rows, quasi):
    counts = {}
    for row in rows:
        key = tuple(row[c] for c in quasi)
        counts[key] = counts.get(key, 0) + 1
    return min(counts.values()) if counts else 0
`,
        tests: [
          { name: 'One unique person', code: R`rows = [{'zip': '11', 'age': 30}, {'zip': '11', 'age': 30}, {'zip': '22', 'age': 41}]
assert k_anonymity(rows, ['zip', 'age']) == 1, 'The third row is the only one with its combination, so k = 1'` },
          { name: 'Every group has two rows', code: R`rows = [{'zip': '11', 'age': 30, 'd': 'x'}, {'zip': '11', 'age': 30, 'd': 'y'}, {'zip': '22', 'age': 41, 'd': 'x'}, {'zip': '22', 'age': 41, 'd': 'z'}]
assert k_anonymity(rows, ['zip', 'age']) == 2, 'Only the quasi-identifier columns count; column d is ignored'` },
          { name: 'Fewer columns give larger groups', code: R`rows = [{'zip': '11', 'age': 30}, {'zip': '11', 'age': 31}, {'zip': '11', 'age': 32}]
assert k_anonymity(rows, ['zip']) == 3 and k_anonymity(rows, ['zip', 'age']) == 1, 'Adding a quasi-identifier can only make groups smaller'` },
          { name: 'Empty table', code: R`assert k_anonymity([], ['zip']) == 0, 'Return 0 when there are no rows'` }
        ]
      }
    ],
    quiz: [
      { q: 'A model is trained without the protected attribute. Is it therefore fair?', options: ['Yes, always', 'No: other features can act as proxies for it', 'Yes, if accuracy is high', 'Only for linear models'], answer: 1, why: 'Postcode, name or purchase history can encode the attribute. Measure outcomes per group.', level: 'medium' },
      { q: 'Equal opportunity requires that groups have the same…', options: ['True positive rate', 'Number of members', 'Share of positive predictions', 'Average feature values'], answer: 0, why: 'Among people who truly qualify, each group should be accepted at the same rate.', level: 'easy' },
      { q: 'What does differential privacy guarantee?', options: ['The data is encrypted', 'The model has no bias', 'Nobody can access the model', 'The output changes very little whether or not any one person’s data is included'], answer: 3, why: 'Calibrated noise bounds what can be learned about any individual.', level: 'easy' },
      { q: 'What do SHAP values give you?', options: ['The causal effect of each feature', 'A guarantee of fairness', 'The contribution of each feature to one prediction, relative to a baseline', 'The training loss'], answer: 2, why: 'They explain the model, not the world: an attribution is not a causal claim.', level: 'medium' },
      { q: 'What is a protected attribute?', options: ['A password field', 'A characteristic such as gender or ethnicity that must not unfairly drive decisions', 'A column that is encrypted', 'A feature with high importance'], answer: 1, why: 'Fairness checks compare outcomes across such groups.', level: 'easy' },
      { q: 'What is a model card?', options: ['A short document on a model’s purpose, data, per-group metrics and limits', 'A GPU specification', 'A billing statement', 'A neural network layer'], answer: 0, why: 'It makes strengths and weaknesses visible to users and reviewers.', level: 'easy' },
      { q: 'Group A has a selection rate of 0.5 and group B has 0.3. Which fairness criterion compares these numbers?', options: ['Equal opportunity', 'Calibration', 'Differential privacy', 'Demographic parity'], answer: 3, why: 'It asks for equal shares of positive decisions in each group.', level: 'medium' },
      { q: 'A published table is 1-anonymous. What does that mean?', options: ['Everyone is hidden perfectly', 'All names are removed', 'At least one person is unique in their combination of quasi-identifiers', 'Every group has 1,000 people'], answer: 2, why: 'k = 1 gives no protection against re-identification.', level: 'medium' },
      { q: 'Selection rates are 0.50 and 0.38. Under the four-fifths rule, what is the verdict?', options: ['The ratio is 1.32, so it passes', 'The ratio is 0.76, below 0.8, so it is flagged', 'The ratio is 0.12, so it passes', 'The rule does not apply to rates'], answer: 1, why: '0.38 / 0.50 = 0.76, which is under the 0.8 threshold.', level: 'hard' },
      { q: 'A count query has sensitivity 1 and uses Laplace noise with scale = sensitivity / epsilon. What is the scale for epsilon = 0.1?', options: ['10', '0.1', '1', '0.01'], answer: 0, why: '1 / 0.1 = 10, so noise is large and privacy is strong.', level: 'hard' },
      { q: 'Group A has TPR 0.9 and FPR 0.1; group B has TPR 0.7 and FPR 0.1. What holds?', options: ['Equalised odds', 'Equal opportunity', 'Demographic parity is guaranteed', 'Equal false positive rates, but neither equal opportunity nor equalised odds'], answer: 3, why: 'Equal opportunity needs equal TPRs, and equalised odds needs both rates equal.', level: 'hard' },
      { q: 'After launch the fairness gap grows from 0.05 to 0.15 although overall accuracy is flat. What does this show?', options: ['The model improved', 'Accuracy is the only metric needed', 'One group’s data has shifted, which is why metrics must be monitored per group', 'The gap is random noise by definition'], answer: 2, why: 'Overall averages can hide a drift that affects one group.', level: 'hard' }
    ],
    interview: [
      { q: 'How would you check a model for bias, and what would you do about it?', points: [['Define the protected groups and the harm with stakeholders', ['group', 'protected', 'harm', 'stakeholder']], ['Compare metrics per group: selection rate, TPR, FPR, calibration', ['per group', 'by group', 'each group', 'true positive', 'false positive', 'selection rate', 'calibrat', 'slice']], ['Choose the fairness criterion deliberately; they conflict', ['demographic parity', 'equal opportunity', 'equalised odds', 'equalized odds', 'trade-off', 'tradeoff', 'conflict']], ['Find the source: sampling, labels, proxies', ['label', 'proxy', 'proxies', 'represent', 'sampling', 'historical']], ['Mitigate: data, training constraints, thresholds', ['reweigh', 'resampl', 'constraint', 'threshold', 'collect']], ['Monitor after launch; document', ['monitor', 'document', 'model card']]], model: 'I start by agreeing with stakeholders which groups matter and what harm looks like in this use case. Then I slice the evaluation by group and compare selection rate, true and false positive rates and calibration, with confidence intervals because small groups are noisy. The fairness criteria conflict, so I choose deliberately: equal opportunity where missing qualified people is the harm, for example. If I find a gap I look for the cause: under-representation, biased historical labels or proxy features. I mitigate by collecting or reweighting data, adding constraints in training or adjusting thresholds, and I measure the cost in accuracy. I document the result in a model card and keep monitoring per-group metrics in production.' },
      { q: 'How do you explain a model’s predictions?', points: [['Who needs the explanation: global or local', ['global', 'local', 'audience', 'who']], ['Prefer an interpretable model when the stakes are high', ['interpretable', 'linear', 'small tree', 'simple model', 'logistic']], ['Global: permutation importance, partial dependence', ['permutation', 'partial dependence', 'importance']], ['Local: SHAP, LIME, counterfactuals', ['shap', 'lime', 'counterfactual']], ['Caveats: attribution is not causation; correlated features; check stability', ['causa', 'correlated', 'stab', 'faithful', 'sanity']]], model: 'I first ask who needs the explanation and why: a developer debugging, a regulator, or a customer who was refused. For high-stakes decisions I prefer an inherently interpretable model, such as logistic regression or a small tree, if it performs nearly as well. For complex models I use global methods, such as permutation importance and partial dependence, to see what drives the model overall, and local methods such as SHAP values to show how each feature moved one prediction from the baseline. For a customer, a counterfactual is clearest: what would need to change for a different outcome. I keep the caveats in mind: attributions describe the model, not causality, and correlated features can make them unstable.' },
      { q: 'How do you protect privacy when building ML systems?', points: [['Data minimisation and purpose limitation', ['minimi', 'purpose', 'only what', 'need']], ['Legal basis, consent, retention and deletion', ['consent', 'legal', 'gdpr', 'retention', 'delet', 'regulat']], ['Pseudonymise; removing names is not anonymisation', ['pseudonym', 'anonym', 're-identif', 'reidentif', 'quasi']], ['Access control, encryption, audit', ['access', 'encrypt', 'audit']], ['Models memorise: differential privacy, federated learning, output filtering', ['memoris', 'memoriz', 'differential privacy', 'federated', 'membership']]], model: 'I collect only the data the purpose needs, check there is a legal basis such as consent, and set retention and deletion rules from the start. Direct identifiers are removed or pseudonymised, but I remember that this is not anonymisation: combinations of quasi-identifiers such as postcode and birth date can re-identify people, so I generalise or aggregate where possible. Data is encrypted, access is limited by role and logged. Models themselves can leak, because they memorise rare training examples, so for sensitive data I consider differential privacy in training, federated learning to keep raw data on devices, and I never put personal data into prompts or logs without need. I also plan how to honour a deletion request.' }
    ]
  },

  {
    id: 'localization-planning', title: 'Localisation, path planning and control', group: 'fusion',
    uses: ['Navigation of robot vacuum cleaners and warehouse robots', 'Lane keeping and adaptive cruise control in driver-assistance systems'],
    tasks: [
      {
        id: 'x-loc-astar', title: 'A* on an occupancy grid',
        prompt: `\`grid\` is a list of rows; \`0\` is free and \`1\` is an obstacle. The robot moves one cell up, down, left or right per step.

Write \`astar(grid, start, goal)\` with \`start\` and \`goal\` as \`(row, col)\` tuples. Return the number of steps on a shortest path, or \`-1\` if the goal cannot be reached.

Use the Manhattan distance to the goal as the heuristic, and a priority queue ordered by \`f = g + h\` (\`heapq\`).`,
        starter: R`import heapq

def astar(grid, start, goal):
    pass

print(astar([[0, 0], [0, 0]], (0, 0), (1, 1)))  # 2
`,
        solution: R`import heapq

def astar(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    h = lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1])
    best = {start: 0}
    heap = [(h(start), 0, start)]
    while heap:
        f, g, p = heapq.heappop(heap)
        if p == goal:
            return g
        if g > best.get(p, float('inf')):
            continue
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q = (p[0] + dr, p[1] + dc)
            if 0 <= q[0] < rows and 0 <= q[1] < cols and grid[q[0]][q[1]] == 0:
                if g + 1 < best.get(q, float('inf')):
                    best[q] = g + 1
                    heapq.heappush(heap, (g + 1 + h(q), g + 1, q))
    return -1
`,
        tests: [
          { name: 'Open grid', code: R`assert astar([[0, 0, 0], [0, 0, 0], [0, 0, 0]], (0, 0), (2, 2)) == 4, 'Without obstacles the answer is the Manhattan distance, 4'` },
          { name: 'Detour around a wall', code: R`assert astar([[0, 1, 0], [0, 1, 0], [0, 0, 0]], (0, 0), (0, 2)) == 6, 'The wall forces a path down, across and back up: 6 steps'` },
          { name: 'Unreachable goal', code: R`assert astar([[0, 1, 0], [0, 1, 0], [0, 1, 0]], (0, 0), (0, 2)) == -1, 'A full wall separates start and goal: return -1'` },
          { name: 'Start equals goal, and a longer maze', code: R`maze = [[0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 1, 1, 1], [0, 0, 0, 0]]
assert astar(maze, (1, 3), (1, 3)) == 0 and astar(maze, (0, 0), (4, 3)) == 13, 'Zero steps when already at the goal; the snake-shaped maze needs 13'` }
        ]
      },
      {
        id: 'x-loc-pid', title: 'One PID controller step',
        prompt: `A PID controller turns an error (target minus measurement) into a command. Write \`pid_step(error, integral, prev_error, kp, ki, kd, dt)\`:

1. \`integral = integral + error * dt\`
2. \`derivative = (error - prev_error) / dt\`
3. \`output = kp * error + ki * integral + kd * derivative\`

Return \`(output, integral)\` with the **updated** integral.`,
        starter: R`def pid_step(error, integral, prev_error, kp, ki, kd, dt):
    pass

print(pid_step(2.0, 0.0, 2.0, 3.0, 0.0, 0.0, 0.1))  # (6.0, 0.2)
`,
        solution: R`def pid_step(error, integral, prev_error, kp, ki, kd, dt):
    integral = integral + error * dt
    derivative = (error - prev_error) / dt
    return kp * error + ki * integral + kd * derivative, integral
`,
        tests: [
          { name: 'Proportional only', code: R`out, integ = pid_step(2.0, 0.0, 2.0, 3.0, 0.0, 0.0, 0.1)
assert close(out, 6.0) and close(integ, 0.2), 'Output kp * error = 6; the integral still accumulates to 0.2'` },
          { name: 'Integral term', code: R`out, integ = pid_step(1.0, 0.5, 1.0, 0.0, 2.0, 0.0, 0.5)
assert close(integ, 1.0) and close(out, 2.0), 'Integral 0.5 + 1 * 0.5 = 1.0, and the output uses the updated integral'` },
          { name: 'Derivative term', code: R`out, integ = pid_step(1.0, 0.0, 3.0, 0.0, 0.0, 0.5, 0.1)
assert close(out, -10.0), 'The error fell by 2 in 0.1 s: derivative -20, times kd 0.5'` },
          { name: 'All three terms', code: R`out, integ = pid_step(2.0, 1.0, 1.0, 1.0, 0.5, 0.1, 0.5)
assert close(out, 3.2) and close(integ, 2.0), 'P = 2, I = 0.5 * 2 = 1, D = 0.1 * 2 = 0.2'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does the resampling step of a particle filter do?', options: ['Moves every particle with the motion model', 'Draws a new set of particles in proportion to their weights, so likely ones multiply and unlikely ones die out', 'Deletes the map', 'Resets all particles to the origin'], answer: 1, why: 'It concentrates the particles where the measurements say the robot probably is.', level: 'medium' },
      { q: 'When is A* guaranteed to return a shortest path?', options: ['Always, with any heuristic', 'Only on empty grids', 'When the heuristic never overestimates the true remaining cost', 'When the heuristic is zero only'], answer: 2, why: 'Such a heuristic is called admissible. Straight-line distance is the classic example.', level: 'medium' },
      { q: 'Which term of a PID controller removes a constant steady-state error?', options: ['The integral term', 'The proportional term', 'The derivative term', 'None of them'], answer: 0, why: 'It keeps growing while any error remains, until the error is gone.', level: 'easy' },
      { q: 'What does each cell of an occupancy grid store?', options: ['The colour of the floor', 'The robot’s speed', 'The planned path', 'The probability that the cell is occupied by an obstacle'], answer: 3, why: 'Sensor readings update each cell’s probability, usually in log-odds form.', level: 'easy' },
      { q: 'What is wheel odometry?', options: ['Reading GPS', 'Estimating movement from how far the wheels turned', 'Finding obstacles with a camera', 'Planning a path'], answer: 1, why: 'It is smooth but drifts as wheels slip.', level: 'easy' },
      { q: 'What does the heuristic h in A* estimate?', options: ['The remaining cost from a node to the goal', 'The cost so far', 'The number of obstacles', 'The robot’s speed'], answer: 0, why: 'A* orders nodes by g + h.', level: 'easy' },
      { q: 'Wheel odometry drifts. Which input can correct the pose using a known map?', options: ['More wheel counts', 'Raising the motor power', 'A larger grid', 'Lidar scans matched to the map'], answer: 3, why: 'Matching what the sensor sees to the map removes accumulated drift.', level: 'medium' },
      { q: 'A PID-controlled speed oscillates with growing amplitude. Which gain do you reduce first?', options: ['The setpoint', 'The sensor’s sample rate to zero', 'The proportional gain Kp', 'The map resolution'], answer: 2, why: 'Too high a P gain makes the loop unstable.', level: 'medium' },
      { q: 'Kp = 1, Ki = 0.2, Kd = 0.5, current error 4, previous error 6, dt = 1, integral before this step 3. What is u?', options: ['5.4', '4.4', '4.0', '3.4'], answer: 1, why: 'Integral = 3 + 4 = 7; derivative = (4 − 6)/1 = −2; u = 4 + 0.2 × 7 + 0.5 × (−2) = 4.4.', level: 'hard' },
      { q: 'A* on a 4-connected grid: start (0, 0), goal (3, 2). The cell (1, 1) has g = 2. With a Manhattan heuristic, what is f for (1, 1)?', options: ['5', '3', '2', '6'], answer: 0, why: 'h = |3 − 1| + |2 − 1| = 3, so f = 2 + 3 = 5.', level: 'hard' },
      { q: 'A particle filter with 1,000 particles has an effective sample size of 40. What should it do?', options: ['Delete the map', 'Do nothing', 'Stop using the sensor', 'Resample, because the weights have become concentrated on few particles'], answer: 3, why: 'A low effective sample size signals degeneracy.', level: 'hard' },
      { q: 'You multiply an admissible heuristic by 2 to speed up A*. What do you give up?', options: ['Nothing', 'The ability to find any path', 'The guarantee of an optimal path: it may be up to twice as long', 'The goal test'], answer: 2, why: 'An inflated heuristic overestimates, trading optimality for speed.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain how a particle filter localises a robot.', points: [['Particles are hypotheses of the pose, spread over the map', ['particle', 'hypothes', 'pose', 'sample']], ['Predict: move each particle with the motion model plus noise', ['predict', 'motion model', 'odometry', 'noise']], ['Update: weight each particle by how well the measurement matches the map', ['weight', 'likelihood', 'measurement', 'sensor', 'match']], ['Resample in proportion to weight', ['resampl']], ['Handles non-linear, multi-modal beliefs; cost grows with particles and dimensions', ['multi-modal', 'multimodal', 'non-linear', 'nonlinear', 'non-gaussian', 'dimension', 'cost']]], model: 'A particle filter represents the belief about the robot’s pose as a set of particles, each a hypothesis of position and heading. At the start they are spread over the map. In the prediction step every particle is moved according to the motion model, using odometry plus random noise. In the update step each particle gets a weight: the likelihood of the actual sensor measurement, for example lidar ranges, if the robot were at that pose on the map. Then the particles are resampled in proportion to their weights, so good hypotheses multiply and poor ones disappear. The estimate is the weighted mean or the densest cluster. Unlike a Kalman filter it handles non-linear models and several competing hypotheses, but the cost grows with the number of particles.' },
      { q: 'How does A* work, and how is planning for a real vehicle different?', points: [['Expands the node with lowest f = g + h', ['g + h', 'g plus h', 'f =', 'lowest', 'priority queue', 'open list']], ['g is cost so far, h a heuristic estimate to the goal', ['heuristic', 'cost so far', 'estimate']], ['Admissible heuristic gives an optimal path', ['admissible', 'never overestimate', 'optimal', 'underestimat']], ['A vehicle cannot follow grid paths: kinematic constraints', ['kinematic', 'turning radius', 'non-holonomic', 'nonholonomic', 'steer', 'curvature']], ['Hybrid A*, state lattices or sampling planners, then smoothing', ['hybrid', 'lattice', 'rrt', 'smooth', 'motion primitive']]], model: 'A* searches a graph from the start, always expanding the node with the lowest f = g + h, where g is the cost of the path so far and h is a heuristic estimate of the remaining cost. With an admissible heuristic, one that never overestimates, the first time it reaches the goal the path is optimal, and it expands far fewer nodes than Dijkstra. On a grid the result is a chain of cells with sharp turns, which a car cannot follow because of its minimum turning radius. So vehicle planners search over feasible motions: hybrid A* expands short arcs with continuous heading, and a state lattice connects poses with precomputed motion primitives. The result is then smoothed and checked for collisions and comfort.' },
      { q: 'Explain PID control and how you tune it.', points: [['Error = setpoint minus measurement', ['error', 'setpoint', 'target', 'reference']], ['P reacts to the present error', ['proportional']], ['I removes steady-state error', ['integral', 'steady-state', 'steady state']], ['D damps overshoot by reacting to the rate of change', ['derivative', 'damp', 'overshoot', 'rate of change']], ['Tuning: raise P, add D, then I; watch overshoot and oscillation', ['tun', 'oscillat', 'ziegler', 'step response']], ['Practical issues: integral windup, noisy derivative, actuator limits', ['windup', 'wind-up', 'noise', 'filter', 'saturat', 'limit']]], model: 'A PID controller computes a command from the error between the setpoint and the measurement. The proportional term reacts to the current error: more gain means a faster response, but too much causes oscillation. The integral term sums the error over time and removes steady-state error, such as a constant offset from a slope. The derivative term reacts to how fast the error changes and damps overshoot. To tune by hand I start with P alone and raise it until the response is fast but begins to oscillate, add D to damp it, then add a little I to remove the remaining offset, checking the step response each time. In practice I add anti-windup for actuator limits and filter the derivative, because it amplifies sensor noise.' }
    ]
  }
];
