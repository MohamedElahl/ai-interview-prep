const R = String.raw;

export default [
  {
    id: 'nn-basics', title: 'Neural network basics', tracks: ['mle', 'ds', 'genai', 'nlp', 'cv'],
    tasks: [
      {
        id: 'nn-softmax', title: 'Softmax cross-entropy',
        prompt: `Write \`softmax_cross_entropy(logits, labels)\`.

- \`logits\`: array of shape \`(n, classes)\`. \`labels\`: \`n\` integer class ids.
- Return \`(loss, grad)\`: the mean cross-entropy loss, and its gradient with respect to the logits, which is \`(softmax - one_hot) / n\`.
- It must be numerically stable for large logits. Subtract the row maximum before \`exp\`.`,
        starter: R`import numpy as np

def softmax_cross_entropy(logits, labels):
    logits = np.asarray(logits, dtype=float)
    labels = np.asarray(labels)
    pass

print(softmax_cross_entropy([[0, 0]], [0]))  # loss about 0.693
`,
        solution: R`import numpy as np

def softmax_cross_entropy(logits, labels):
    logits = np.asarray(logits, dtype=float)
    labels = np.asarray(labels)
    n = logits.shape[0]
    z = logits - logits.max(axis=1, keepdims=True)
    log_probs = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    loss = -log_probs[np.arange(n), labels].mean()
    grad = np.exp(log_probs)
    grad[np.arange(n), labels] -= 1
    return loss, grad / n
`,
        tests: [
          { name: 'Uniform logits', code: R`import math
loss, grad = softmax_cross_entropy([[0, 0]], [0])
assert close(loss, math.log(2)), 'Loss should be ln(2) = 0.693'
assert close(grad, [[-0.5, 0.5]]), 'Gradient should be [[-0.5, 0.5]]'` },
          { name: 'Two samples, three classes', code: R`loss, grad = softmax_cross_entropy([[1, 2, 3], [1, 2, 3]], [2, 0])
assert close(loss, 1.40760596, 1e-5), 'Mean loss should be about 1.4076'
assert close(grad[0], [0.04501529, 0.12236424, -0.16737952], 1e-5), 'Check grad = (softmax - one_hot) / n'` },
          { name: 'Stable for large logits', code: R`import math
loss, grad = softmax_cross_entropy([[1000.0, 0.0], [0.0, 1000.0]], [0, 0])
assert math.isfinite(float(loss)), 'Loss overflowed: subtract the row max before exp'
assert close(loss, 500.0, 1e-6), 'Expected mean loss 500'` },
          { name: 'Gradient rows sum to zero', code: R`import numpy as np
rng = np.random.default_rng(0)
loss, grad = softmax_cross_entropy(rng.normal(size=(5, 4)), [0, 1, 2, 3, 0])
assert close(np.asarray(grad).sum(axis=1), [0] * 5, 1e-9), 'Each row of the gradient sums to 0'` }
        ]
      },
      {
        id: 'nn-dense', title: 'Dense layer backward pass',
        prompt: `Implement a fully connected layer \`y = x @ W + b\`, where \`x\` is \`(n, in)\`, \`W\` is \`(in, out)\` and \`b\` is \`(out,)\`.

- \`dense_forward(x, W, b)\` returns \`y\`.
- \`dense_backward(dout, x, W)\` receives \`dout = dL/dy\` and returns \`(dx, dW, db)\`.`,
        starter: R`import numpy as np

def dense_forward(x, W, b):
    pass

def dense_backward(dout, x, W):
    pass
`,
        solution: R`import numpy as np

def dense_forward(x, W, b):
    return np.asarray(x, float) @ np.asarray(W, float) + np.asarray(b, float)

def dense_backward(dout, x, W):
    dout, x, W = np.asarray(dout, float), np.asarray(x, float), np.asarray(W, float)
    dx = dout @ W.T
    dW = x.T @ dout
    db = dout.sum(axis=0)
    return dx, dW, db
`,
        tests: [
          { name: 'Forward', code: R`y = dense_forward([[1, 2]], [[1, 2, 3], [4, 5, 6]], [0.1, 0.2, 0.3])
assert close(y, [[9.1, 12.2, 15.3]]), 'Expected [[9.1, 12.2, 15.3]]'` },
          { name: 'Backward', code: R`dx, dW, db = dense_backward([[1, 0, -1]], [[1, 2]], [[1, 2, 3], [4, 5, 6]])
assert close(dx, [[-2, -2]]), 'dx = dout @ W.T should be [[-2, -2]]'
assert close(dW, [[1, 0, -1], [2, 0, -2]]), 'dW = x.T @ dout'
assert close(db, [1, 0, -1]), 'db = dout summed over the batch'` },
          { name: 'Matches a numerical gradient', code: R`import numpy as np
rng = np.random.default_rng(1)
x, W, b = rng.normal(size=(3, 4)), rng.normal(size=(4, 2)), rng.normal(size=2)
dout = rng.normal(size=(3, 2))
dx, dW, db = dense_backward(dout, x, W)
eps = 1e-6
Wp = W.copy(); Wp[1, 0] += eps
num = ((dense_forward(x, Wp, b) - dense_forward(x, W, b)) * dout).sum() / eps
assert abs(num - np.asarray(dW)[1, 0]) < 1e-4, 'dW does not match the numerical gradient'
assert np.asarray(db).shape == (2,), 'db should have shape (out,)'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why do neural networks need non-linear activation functions?', options: ['To run faster', 'Without them, stacked layers collapse into one linear transformation', 'To reduce memory', 'To make gradients zero'], answer: 1, why: 'A composition of linear maps is linear. Non-linearity gives depth its power.', level: 'easy' },
      { q: 'A main reason ReLU replaced sigmoid in hidden layers?', options: ['It is bounded', 'It does not saturate for positive inputs, so gradients do not vanish as easily', 'It outputs probabilities', 'It is smoother'], answer: 1, why: 'Sigmoid gradients are at most 0.25 and shrink through many layers.', level: 'medium' },
      { q: 'Dropout at inference time is…', options: ['Applied with the same rate', 'Turned off', 'Doubled', 'Applied to the output only'], answer: 1, why: 'Use model.eval(). Forgetting it is a classic bug.', level: 'easy' },
      { q: 'Batch normalisation mainly helps by…', options: ['Adding parameters', 'Stabilising activation scales so training tolerates higher learning rates', 'Removing the need for data', 'Encrypting activations'], answer: 1, why: 'It also behaves differently in train and eval mode, which interviewers like to ask about.', level: 'medium' },
      { q: 'What does a loss function measure?', options: ['How far the predictions are from the targets', 'The size of the dataset', 'The number of layers', 'The speed of training'], answer: 0, why: 'Training tries to make this number small.', level: 'easy' },
      { q: 'During one epoch the model sees…', options: ['One random sample', 'Only the test set', 'Every training sample once', 'Only the misclassified samples'], answer: 2, why: 'An epoch is one full pass over the training data.', level: 'easy' },
      { q: 'A dense layer maps 100 inputs to 50 outputs, with biases. How many parameters does it have?', options: ['5,000', '150', '5,100', '5,050'], answer: 3, why: '100 × 50 weights plus 50 biases.', level: 'medium' },
      { q: 'A 10-class classifier’s loss at step 0 is about 2.3. What does that suggest?', options: ['Normal: ln(10) ≈ 2.3 is the loss of a uniform guess', 'The learning rate is too high', 'The labels are wrong', 'The model has overfitted'], answer: 0, why: 'A loss near ln(K) at the start is a healthy sign.', level: 'medium' },
      { q: 'Training loss is 0.02 while validation loss is 1.4 and rising. Which change is least likely to help?', options: ['Adding more layers', 'Adding dropout', 'Early stopping', 'Collecting more training data'], answer: 0, why: 'The model already overfits, so extra capacity makes it worse.', level: 'hard' },
      { q: 'A sigmoid’s derivative is at most 0.25. Through 6 sigmoid layers, the derivative factors alone shrink a gradient to at most about…', options: ['0.25', '0.0015', '0.0002 (1/4096)', '0.06'], answer: 2, why: '0.25 to the power 6 is 1/4,096, which is why deep sigmoid networks stall.', level: 'hard' },
      { q: 'A network with batch norm gives erratic results when run in training mode with a batch of one. Why?', options: ['Dropout is switched off', 'The learning rate is too high', 'Batch norm cannot process more than 32 samples', 'Statistics from a single sample are meaningless; use eval mode and the running averages'], answer: 3, why: 'At inference use the running statistics collected during training.', level: 'hard' },
      { q: 'A network has layers 20 → 30 → 10 with biases. How many parameters does it have in total?', options: ['900', '930', '940', '1,000'], answer: 2, why: '(20×30 + 30) + (30×10 + 10) = 630 + 310.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain backpropagation.', level: 'medium', points: [['Forward pass computes the loss', ['forward']], ['Chain rule propagates gradients backwards layer by layer', ['chain rule', 'backward']], ['Reuses intermediate results, so it is efficient', ['reuse', 'efficient', 'cache', 'intermediate', 'once']], ['Gradients drive the weight update', ['update', 'optimi', 'gradient descent']]], model: 'Backpropagation is how we compute the gradient of the loss with respect to every weight. We run a forward pass, storing each layer’s activations, and compute the loss. Then we apply the chain rule from the output back to the input: each layer receives the gradient of the loss with respect to its output, and from it computes the gradient for its weights and for its input, which it passes back. Because each intermediate gradient is computed once and reused, the cost is about the same as the forward pass. An optimiser then uses the gradients to update the weights.' },
      { q: 'What are vanishing and exploding gradients, and how do you address them?', level: 'medium', points: [['Gradients shrink or grow multiplicatively through layers', ['multipl', 'product', 'many layers', 'deep']], ['Vanishing: early layers stop learning', ['vanish', 'stop learning', 'small']], ['Fixes: ReLU, residual connections, normalisation, careful initialisation', ['relu', 'residual', 'skip', 'normali', 'initiali']], ['Exploding: use gradient clipping', ['clip']]], model: 'In a deep network the gradient at an early layer is a product of many terms. If those terms are below one it shrinks towards zero and early layers stop learning: vanishing gradients. If they are above one it blows up and training diverges: exploding gradients. For vanishing gradients we use ReLU-family activations, residual connections, normalisation layers and good initialisation such as He or Xavier. For exploding gradients, common in recurrent networks, we clip the gradient norm and lower the learning rate.' },
      { q: 'Your model trains but validation loss starts rising while training loss keeps falling. What do you do?', level: 'hard', points: [['This is overfitting', ['overfit']], ['Early stopping, keep the best checkpoint', ['early stop', 'checkpoint']], ['Regularise: dropout, weight decay, augmentation', ['dropout', 'weight decay', 'augment', 'regulari']], ['More data or a smaller model', ['more data', 'smaller', 'reduce']]], model: 'That pattern is overfitting: the model is memorising the training set. First I keep the checkpoint with the best validation loss and use early stopping. Then I add regularisation, such as dropout, weight decay and data augmentation, or reduce model capacity. If possible I get more data or use a pre-trained model and fine-tune fewer layers. I also check that the validation set comes from the same distribution as training and that nothing leaked.' },
      { q: 'What is an activation function, and why do networks need non-linear ones?', level: 'easy', points: [['Applied to each neuron’s weighted sum to produce its output', ['weighted sum', 'neuron', 'output', 'applied', 'each']], ['Without non-linearity, stacked layers collapse into one linear transformation', ['collapse', 'linear', 'single layer', 'one layer', 'composition', 'stack']], ['Non-linearity lets the network learn complex patterns', ['complex', 'curve', 'non-linear', 'nonlinear', 'pattern', 'xor']], ['Examples: ReLU, sigmoid, tanh, softmax', ['relu', 'sigmoid', 'tanh', 'softmax', 'gelu']]], model: 'An activation function is applied to the weighted sum at each neuron to decide its output. The reason we need non-linear ones is that a stack of linear layers is still just one linear function, because multiplying matrices together gives another matrix. No matter how deep, the network could only draw straight lines or flat planes. A non-linear activation between the layers breaks that, so the network can build up curved decision boundaries and complex features. ReLU, which outputs zero for negatives and the input for positives, is the common default in hidden layers. Sigmoid squashes to zero to one for binary probabilities, and softmax turns a vector of scores into a probability distribution across classes.' },
      { q: 'What do epoch, batch size and iteration mean in neural network training?', level: 'easy', points: [['An epoch is one full pass through the training data', ['epoch', 'full pass', 'whole dataset', 'entire']], ['Batch size is how many examples are used per update', ['batch size', 'examples per', 'mini-batch', 'minibatch', 'per update']], ['An iteration is one update step; iterations per epoch equals data size divided by batch size', ['iteration', 'step', 'divided', 'per epoch', 'update']], ['Batch size affects speed, memory and gradient noise', ['memory', 'noise', 'speed', 'gpu', 'generalis', 'generaliz']]], model: 'One epoch means the model has seen every training example once. Because processing the whole dataset for each gradient step is slow, I split it into mini-batches. The batch size is how many examples go through the network before one weight update, and each update is called an iteration or step. So the number of iterations per epoch is the dataset size divided by the batch size. If I have ten thousand examples and a batch size of one hundred and twenty-eight, that is about seventy-eight steps per epoch. Batch size is a trade-off. Larger batches use the hardware efficiently and give smoother gradients but need more memory, while smaller batches are noisier, which can act as a mild regulariser.' },
      { q: 'How do you choose a loss function for regression, binary classification and multi-class classification?', level: 'easy', points: [['Regression: mean squared error or mean absolute error, or Huber', ['mse', 'mean squared', 'mae', 'absolute', 'huber']], ['Binary: binary cross-entropy with a sigmoid output', ['binary cross', 'sigmoid', 'log loss', 'bce']], ['Multi-class: categorical cross-entropy with softmax', ['categorical', 'softmax', 'cross-entropy', 'cross entropy']], ['Match the output layer and loss; consider class imbalance with weights', ['output layer', 'weight', 'imbalanc', 'logits', 'match']]], model: 'The loss has to match the output and the problem. For regression I usually use mean squared error, or mean absolute error or Huber loss when outliers are a concern, with a linear output layer. For binary classification I use binary cross-entropy with a single sigmoid output that gives the probability of the positive class. For multi-class classification with one correct label, I use categorical cross-entropy with a softmax over the classes. In practice frameworks often combine the final activation and the loss and take raw logits, which is more numerically stable. If classes are imbalanced I can weight the loss per class. The loss is what the optimiser minimises, so it should align as closely as possible with the metric I care about.' },
      { q: 'Why does weight initialisation matter, and what are Xavier and He initialisation?', level: 'medium', points: [['Bad initial weights cause vanishing or exploding activations and gradients', ['vanish', 'explod', 'activation', 'gradient', 'signal']], ['All-zero or identical weights make neurons learn the same thing', ['zero', 'identical', 'symmetry', 'same thing']], ['Xavier keeps variance stable for tanh or sigmoid', ['xavier', 'glorot', 'tanh', 'sigmoid', 'variance']], ['He initialisation is scaled for ReLU layers', ['he ', 'kaiming', 'relu', 'fan-in', 'fan in', 'two over']]], model: 'The starting weights decide whether signals and gradients survive the trip through many layers. If the weights are too large the activations and gradients explode, and if they are too small they shrink to nothing. If I set everything to zero, or to the same value, every neuron in a layer computes the same thing and gets the same gradient, so they never become different. The fix is random initialisation scaled to the layer size. Xavier or Glorot initialisation keeps the variance of the activations roughly constant across layers for tanh or sigmoid. He initialisation uses a larger variance, scaled by two over the number of inputs, because ReLU zeroes out half the activations. Frameworks usually apply sensible defaults, but it matters in custom or very deep networks.' },
      { q: 'Compare SGD with momentum and Adam. When would you use each?', level: 'medium', points: [['SGD updates with the gradient of a mini-batch; momentum smooths with a running average', ['sgd', 'momentum', 'running average', 'velocity', 'smooth']], ['Adam keeps per-parameter adaptive learning rates using first and second moments', ['adam', 'adaptive', 'per-parameter', 'second moment', 'first moment', 'rmsprop']], ['Adam converges quickly with little tuning; good default', ['default', 'quick', 'little tuning', 'fast', 'robust']], ['SGD with momentum sometimes generalises better in vision; AdamW decouples weight decay', ['generalis', 'generaliz', 'vision', 'adamw', 'weight decay', 'decoupl']]], model: 'Plain stochastic gradient descent moves the weights against the gradient of each mini-batch. Adding momentum keeps a running average of past gradients, which smooths the noise and speeds progress along consistent directions. Adam goes further: it keeps running averages of both the gradient and its square, and gives each parameter its own adaptive step size, so parameters with small or rare gradients move faster. Adam usually converges fast with little tuning, so it is my default, especially for transformers and when I want a quick result. SGD with momentum and a tuned schedule often generalises slightly better, which is why it is still used in many vision models. For Adam I prefer the AdamW variant, which applies weight decay properly.' },
      { q: 'How does batch normalisation work, why does it help, and where does it cause trouble?', level: 'hard', points: [['Normalises each feature across the batch to zero mean and unit variance, then applies learned scale and shift', ['normalis', 'normaliz', 'zero mean', 'unit variance', 'scale and shift', 'gamma', 'beta']], ['Stabilises and speeds up training and allows higher learning rates', ['stabil', 'faster', 'higher learning rate', 'smooth', 'converge']], ['At inference uses running statistics from training', ['inference', 'running', 'moving average', 'statistics', 'eval mode']], ['Problems with small batches, sequences or distribution mismatch; layer norm is an alternative', ['small batch', 'layer norm', 'sequence', 'rnn', 'transformer', 'mismatch', 'group norm']]], model: 'Batch normalisation takes the activations of a layer, computes their mean and variance across the current batch, and rescales them to zero mean and unit variance, then applies a learned scale and shift so the layer can still represent what it needs. It makes the inputs to each layer more stable, which lets me use higher learning rates, speeds up convergence, makes training less sensitive to initialisation, and gives a mild regularising effect. At inference time there may be only one example, so it uses running averages of the statistics collected during training, and forgetting to switch to evaluation mode is a classic bug. It struggles with very small batches or with sequence models, where the statistics are noisy, so transformers use layer normalisation, which normalises across features within each example.' },
      { q: 'How do batch size and learning rate interact, and what do warm-up and learning-rate schedules do?', level: 'hard', points: [['Larger batches give less noisy gradients, so a larger learning rate is often possible', ['larger batch', 'less noisy', 'less noise', 'scale the learning rate', 'linear scaling', 'square root']], ['Very large batches can hurt generalisation or need careful tuning', ['generalis', 'generaliz', 'sharp', 'tuning', 'hurt']], ['Warm-up starts with a small learning rate to avoid early instability', ['warm-up', 'warmup', 'warm up', 'early', 'instabil', 'small learning rate']], ['Decay schedules such as cosine or step reduce the rate to settle into a minimum', ['decay', 'cosine', 'step', 'schedule', 'anneal', 'reduce']]], model: 'The learning rate and batch size are linked through gradient noise. A larger batch gives a more accurate gradient estimate, so I can usually take bigger steps, and a common rule is to scale the learning rate up with the batch size, linearly or by the square root. Very large batches can still generalise worse or need extra care. Early in training the weights are random and gradients can be erratic, so I use a warm-up: start with a tiny learning rate and ramp it up over the first few hundred or thousand steps, which is especially important with Adam and transformers. Afterwards I decay the rate, for instance with a cosine or step schedule, so that training settles into a good minimum instead of bouncing around it.' }
    ]
  },

  {
    id: 'transformers', title: 'Transformers and attention', tracks: ['mle', 'genai', 'nlp', 'cv'],
    tasks: [
      {
        id: 'tf-attention', title: 'Scaled dot-product attention',
        prompt: `Write \`attention(Q, K, V, mask=None)\`.

- \`Q\` is \`(n_q, d)\`, \`K\` is \`(n_k, d)\`, \`V\` is \`(n_k, d_v)\`.
- Scores are \`Q @ K.T / sqrt(d)\`. Apply softmax over the keys.
- If \`mask\` is given (shape \`(n_q, n_k)\`, 1 = may attend, 0 = blocked), blocked positions get weight 0. Add a large negative number to their scores before softmax.
- Return \`(output, weights)\`.`,
        starter: R`import numpy as np

def attention(Q, K, V, mask=None):
    Q, K, V = (np.asarray(a, dtype=float) for a in (Q, K, V))
    pass
`,
        solution: R`import numpy as np

def attention(Q, K, V, mask=None):
    Q, K, V = (np.asarray(a, dtype=float) for a in (Q, K, V))
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    if mask is not None:
        scores = np.where(np.asarray(mask) == 0, -1e9, scores)
    scores = scores - scores.max(axis=-1, keepdims=True)
    weights = np.exp(scores)
    weights = weights / weights.sum(axis=-1, keepdims=True)
    return weights @ V, weights
`,
        tests: [
          { name: 'Weights and output', code: R`import math
out, w = attention([[1, 0]], [[1, 0], [0, 1]], [[1, 2], [3, 4]])
a = math.exp(1 / math.sqrt(2)); a = a / (a + 1)
assert close(w, [[a, 1 - a]], 1e-6), 'Weights should be softmax of [1/sqrt(2), 0]'
assert close(out, [[a * 1 + (1 - a) * 3, a * 2 + (1 - a) * 4]], 1e-6), 'Output is the weighted sum of V'` },
          { name: 'Mask blocks a key', code: R`out, w = attention([[1, 0]], [[1, 0], [0, 1]], [[1, 2], [3, 4]], mask=[[0, 1]])
assert close(w, [[0, 1]], 1e-6) and close(out, [[3, 4]], 1e-4), 'With the first key blocked, all weight goes to the second'` },
          { name: 'Rows sum to one', code: R`import numpy as np
rng = np.random.default_rng(0)
out, w = attention(rng.normal(size=(3, 8)), rng.normal(size=(5, 8)), rng.normal(size=(5, 2)))
assert np.asarray(out).shape == (3, 2) and np.asarray(w).shape == (3, 5), 'Output should be (3, 2) and weights (3, 5)'
assert close(np.asarray(w).sum(axis=1), [1, 1, 1], 1e-9), 'Each row of weights must sum to 1'` }
        ]
      },
      {
        id: 'tf-posenc', title: 'Sinusoidal positional encoding',
        prompt: `Write \`positional_encoding(max_len, d_model)\` returning an array of shape \`(max_len, d_model)\` (\`d_model\` is even):

- \`PE[pos, 2i] = sin(pos / 10000 ** (2i / d_model))\`
- \`PE[pos, 2i + 1] = cos(pos / 10000 ** (2i / d_model))\``,
        starter: R`import numpy as np

def positional_encoding(max_len, d_model):
    pass

print(positional_encoding(2, 4))
`,
        solution: R`import numpy as np

def positional_encoding(max_len, d_model):
    pos = np.arange(max_len)[:, None]
    i = np.arange(0, d_model, 2)[None, :]
    angle = pos / (10000 ** (i / d_model))
    pe = np.zeros((max_len, d_model))
    pe[:, 0::2] = np.sin(angle)
    pe[:, 1::2] = np.cos(angle)
    return pe
`,
        tests: [
          { name: 'Shape and position 0', code: R`import numpy as np
pe = np.asarray(positional_encoding(4, 6))
assert pe.shape == (4, 6), 'Shape should be (max_len, d_model)'
assert close(pe[0], [0, 1, 0, 1, 0, 1]), 'Position 0 is sin(0), cos(0) repeated'` },
          { name: 'First frequency', code: R`import math
pe = positional_encoding(4, 6)
assert close(pe[1][0], math.sin(1)) and close(pe[1][1], math.cos(1)), 'PE[1, 0] = sin(1), PE[1, 1] = cos(1)'` },
          { name: 'Higher dimensions use lower frequencies', code: R`import math
pe = positional_encoding(4, 6)
assert close(pe[3][2], math.sin(3 / 10000 ** (2 / 6))), 'PE[3, 2] = sin(3 / 10000^(2/6))'
assert close(pe[3][5], math.cos(3 / 10000 ** (4 / 6))), 'PE[3, 5] = cos(3 / 10000^(4/6))'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why divide attention scores by sqrt(d)?', options: ['To save memory', 'Dot products grow with dimension; scaling keeps softmax out of its saturated region', 'To make weights negative', 'It is only a convention'], answer: 1, why: 'Without scaling, large scores make softmax nearly one-hot and gradients tiny.', level: 'medium' },
      { q: 'Self-attention cost for a sequence of length n?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'], answer: 2, why: 'Every token attends to every other token. This is why context length is expensive.', level: 'easy' },
      { q: 'What makes a decoder-only model (GPT style) autoregressive?', options: ['Bidirectional attention', 'A causal mask so each token only attends to earlier tokens', 'Convolutions', 'No positional information'], answer: 1, why: 'The mask stops the model seeing the future during training.', level: 'medium' },
      { q: 'Why do transformers need positional information?', options: ['Attention is order-invariant by itself', 'To speed up training', 'To reduce parameters', 'For tokenisation'], answer: 0, why: 'Without positions, "dog bites man" and "man bites dog" look identical to attention.', level: 'easy' },
      { q: 'What three vectors does each token produce in attention?', options: ['Query, key and value', 'Input, hidden and output', 'Mean, median and mode', 'Encoder, decoder and head'], answer: 0, why: 'Queries are matched against keys, and the weights mix the values.', level: 'easy' },
      { q: 'Which family does BERT belong to?', options: ['Decoder-only', 'Encoder-decoder', 'Encoder-only', 'Recurrent'], answer: 2, why: 'BERT is an encoder trained with masked-token prediction.', level: 'easy' },
      { q: 'An image of 224×224 pixels is cut into 32×32 patches for a vision transformer. How many tokens?', options: ['64', '49', '196', '224'], answer: 1, why: '(224 / 32) squared = 7 × 7.', level: 'medium' },
      { q: 'A chatbot must give the same answer every time for the same prompt. Which decoding setting fits best?', options: ['Very high temperature', 'A large top-p with temperature 2', 'A beam of 1,000 sampled randomly', 'Greedy decoding or temperature near 0'], answer: 3, why: 'Low temperature makes the highest-probability token almost always win.', level: 'medium' },
      { q: 'Attention scores overflow to NaN in float16 at long context. What is the best fix?', options: ['Add more heads', 'Remove the scaling', 'Increase the learning rate', 'Compute the scores and softmax in float32 or use bfloat16'], answer: 3, why: 'float16 tops out at 65,504; wider ranges avoid the overflow.', level: 'hard' },
      { q: 'A model has 24 layers, 16 key/value heads, head dimension 64 and float16 values. How many bytes of KV cache does one token need?', options: ['49,152', '98,304', '196,608', '24,576'], answer: 1, why: '2 (K and V) × 24 × 16 × 64 × 2 bytes = 98,304.', level: 'hard' },
      { q: 'Why does grouped-query attention speed up decoding with long contexts?', options: ['Fewer key/value heads shrink the KV cache and the memory traffic', 'It removes the softmax', 'It shortens the context', 'It adds more layers'], answer: 0, why: 'Several query heads share one key/value head.', level: 'hard' },
      { q: 'Why do very deep transformers often prefer pre-norm layer normalisation?', options: ['It uses fewer parameters', 'It removes the need for attention', 'The residual path stays a clean identity, so gradients flow more stably', 'It makes layer norm unnecessary'], answer: 2, why: 'Post-norm often needs careful warm-up to train at depth.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain self-attention and why it replaced recurrent networks.', level: 'medium', points: [['Each token computes a weighted mix of all tokens', ['weighted', 'all tokens', 'every token', 'each token', 'every other']], ['Uses queries, keys and values', ['query', 'key', 'value']], ['Processes the sequence in parallel', ['parallel']], ['Handles long-range dependencies directly', ['long-range', 'long range', 'long-term', 'distance', 'dependenc']]], model: 'In self-attention every token builds a new representation as a weighted sum of all tokens in the sequence. Each token is projected into a query, a key and a value; the weight between two tokens is the softmax of the scaled dot product of one token’s query with the other’s key. Compared with recurrent networks, the whole sequence is processed in parallel, which makes training on GPUs far faster, and any two positions are connected in one step, so long-range dependencies are learned much more easily. The cost is quadratic in sequence length.' },
      { q: 'Describe the components of a transformer block.', level: 'medium', points: [['Multi-head self-attention', ['multi-head', 'multi head', 'attention']], ['Feed-forward network', ['feed-forward', 'feed forward', 'mlp']], ['Residual connections', ['residual', 'skip']], ['Layer normalisation', ['layer norm', 'normali']], ['Positional information added to the inputs', ['position']]], model: 'A transformer block has two sub-layers. The first is multi-head self-attention, where several attention heads run in parallel so the model can attend to different relations at once. The second is a position-wise feed-forward network applied to each token. Each sub-layer is wrapped in a residual connection and layer normalisation, which keep gradients stable in deep stacks. Token embeddings are combined with positional encodings at the input, because attention itself has no sense of order. Decoder blocks add a causal mask, and encoder-decoder models add cross-attention.' },
      { q: 'What is the difference between encoder-only, decoder-only and encoder-decoder models?', level: 'hard', points: [['Encoder-only (BERT): bidirectional, for understanding', ['bert', 'bidirectional', 'understanding', 'classification', 'embedding']], ['Decoder-only (GPT): causal, for generation', ['gpt', 'causal', 'autoregress', 'generat']], ['Encoder-decoder (T5): sequence to sequence', ['t5', 'translation', 'sequence to sequence', 'seq2seq', 'cross-attention', 'cross attention']]], model: 'Encoder-only models such as BERT see the whole input in both directions and are trained with masked-token prediction; they are good for classification, retrieval embeddings and extraction. Decoder-only models such as GPT use a causal mask and predict the next token, which makes them natural generators and is the architecture of today’s large language models. Encoder-decoder models such as T5 encode an input and generate an output with cross-attention, which suits translation and summarisation.' },
      { q: 'What are queries, keys and values in attention?', level: 'easy', points: [['Each token is projected into a query, a key and a value', ['project', 'linear', 'three', 'each token', 'vector']], ['Query asks what I am looking for; key says what I contain', ['query', 'key', 'match', 'look for', 'contain', 'compare']], ['Dot product of query and key gives scores that are softmaxed into weights', ['dot product', 'score', 'softmax', 'weight', 'similarity']], ['Output is the weighted sum of the values', ['weighted sum', 'weighted average', 'values', 'blend', 'combine']]], model: 'In self-attention each token’s vector is multiplied by three learned matrices to produce a query, a key and a value. You can think of the query as what this token is looking for, the key as what each token offers to be matched against, and the value as the information it actually passes along. I take the dot product of one token’s query with every key to get similarity scores, scale them, and apply softmax to turn them into weights that sum to one. The output for that token is the weighted sum of all the value vectors. So the token pulls in information mostly from the positions most relevant to it, and the weights are computed freshly for every input.' },
      { q: 'What is tokenisation, and why do modern models use subword tokens?', level: 'easy', points: [['Splits text into units that the model maps to integer IDs', ['split', 'units', 'ids', 'integer', 'vocabulary', 'map']], ['Word-level vocabularies are huge and cannot handle unseen words', ['unseen', 'out of vocabulary', 'oov', 'huge', 'rare word', 'vocabulary size']], ['Subwords such as BPE or WordPiece balance vocabulary size and coverage', ['bpe', 'byte pair', 'wordpiece', 'subword', 'sentencepiece', 'merge']], ['Tokenisation affects sequence length, cost and quirks with numbers or other languages', ['length', 'cost', 'number', 'language', 'context', 'spelling']]], model: 'Tokenisation splits raw text into pieces called tokens, which are mapped to integer ids and then to embedding vectors. Using whole words would need an enormous vocabulary and fail on any word it has not seen, while using single characters makes sequences very long. Subword methods such as byte pair encoding, WordPiece and SentencePiece find a middle ground: common words are single tokens, and rare words are broken into smaller reusable pieces, so nothing is truly out of vocabulary. Tokenisation has practical effects. It determines the sequence length and so the cost and how much fits in the context window, and it can cause quirks, such as numbers being split in odd ways or other languages needing many more tokens per word.' },
      { q: 'Why do transformers need positional encoding?', level: 'easy', points: [['Self-attention has no built-in sense of order', ['order', 'permutation', 'no notion', 'set', 'unordered', 'position']], ['Word order changes meaning', ['meaning', 'dog bites', 'sequence', 'word order', 'different']], ['Add or inject position information into the token embeddings', ['add', 'inject', 'embedding', 'combine', 'sum']], ['Variants: sinusoidal, learned, rotary or relative', ['sinusoid', 'learned', 'rotary', 'rope', 'relative', 'alibi']]], model: 'Self-attention treats its input as a set. If I shuffle the tokens, each token still attends to the same others and the outputs are just shuffled too, so the layer itself has no idea about order. But order changes meaning: dog bites man is not man bites dog. So I inject position information. The original transformer added fixed sinusoidal vectors to the token embeddings, and many models use learned position embeddings instead. Modern large language models often use relative schemes, like rotary position embeddings or ALiBi, which encode the distance between tokens inside the attention computation and extrapolate better to longer sequences. Recurrent networks get order for free, but transformers need to be told explicitly.' },
      { q: 'Why does a transformer use multi-head attention instead of a single attention?', level: 'medium', points: [['Several heads run attention in parallel with different learned projections', ['parallel', 'several', 'multiple', 'different projection', 'subspace']], ['Each head can focus on a different relationship or pattern', ['different', 'relationship', 'pattern', 'syntax', 'focus', 'specialis']], ['Outputs are concatenated and projected back to the model dimension', ['concatenat', 'project', 'combine', 'merge', 'output matrix']], ['Cost is similar because each head uses a smaller dimension', ['smaller dimension', 'cost', 'same', 'split', 'divided', 'd_model']]], model: 'A single attention operation produces one weighted average per token, which limits it to one pattern of relevance at a time. With multi-head attention I split the model dimension into several smaller heads, each with its own learned query, key and value projections, and run attention in parallel. Different heads can specialise: one might track the previous word, another might link a verb to its subject, another might attend to matching brackets or earlier mentions of an entity. The outputs of all the heads are concatenated and passed through a final linear layer to return to the model dimension. The cost is about the same as one big head, because each head works in a lower-dimensional space, so it adds expressiveness cheaply.' },
      { q: 'How does masked self-attention work, and how does a decoder generate text one token at a time?', level: 'medium', points: [['Causal mask blocks attention to future positions', ['causal', 'mask', 'future', 'block', 'triangular', 'only previous']], ['Allows training on all positions in parallel with teacher forcing', ['parallel', 'teacher forcing', 'all positions', 'one pass', 'efficient']], ['Generation is autoregressive: predict next token, append, repeat', ['autoregress', 'next token', 'append', 'repeat', 'one at a time', 'loop']], ['Decoding strategy and temperature control randomness; KV cache avoids recomputation', ['temperature', 'sampling', 'greedy', 'top-k', 'top-p', 'beam', 'kv cache', 'cache']]], model: 'In a decoder, each position is only allowed to attend to itself and earlier positions. I enforce this with a causal mask that sets the attention scores for future positions to minus infinity before the softmax. That means that during training I can feed the whole sequence in one pass and have the model predict every next token simultaneously, which is efficient. At generation time the model is autoregressive: it predicts a probability distribution over the next token, I pick one, append it to the input and repeat. How I pick is the decoding strategy: greedy takes the most likely token, while sampling with temperature, top-k or top-p adds controlled randomness. A key-value cache stores earlier keys and values so each step does not recompute them.' },
      { q: 'Attention cost grows quadratically with sequence length. What causes that, and how do people deal with long contexts?', level: 'hard', points: [['Every token attends to every other, so compute and memory scale with n squared', ['n squared', 'quadratic', 'every token', 'all pairs', 'n^2', 'square']], ['Efficient kernels such as FlashAttention reduce memory traffic without changing results', ['flash', 'kernel', 'memory traffic', 'io-aware', 'exact', 'tiling']], ['Sparse, local or sliding-window attention restrict which tokens are attended to', ['sparse', 'local', 'sliding', 'window', 'longformer', 'restrict']], ['Alternatives: retrieval, chunking and summarisation, state-space models', ['retrieval', 'rag', 'chunk', 'summaris', 'summariz', 'state space', 'mamba', 'linear attention']], ['KV cache memory grows with context during inference', ['kv cache', 'cache', 'inference', 'memory', 'grouped', 'multi-query']]], model: 'The attention score matrix has one entry for every pair of tokens, so doubling the sequence length quadruples both the compute and, if stored naively, the memory. For long contexts there are several levers. FlashAttention computes exact attention in tiles that stay in fast on-chip memory, so it avoids writing the huge matrix and is much faster in practice, though the compute is still quadratic. Sparse patterns, such as local or sliding-window attention with a few global tokens, cut the cost to roughly linear, at the price of some long-range interaction. Another route is not to put everything in context: retrieval and chunking bring in only relevant pieces. During inference, the key-value cache also grows with length, so techniques like grouped-query attention reduce its size.' },
      { q: 'How would you fine-tune a large transformer when you only have a single GPU with limited memory?', level: 'hard', points: [['Parameter-efficient fine-tuning such as LoRA or adapters train few parameters', ['lora', 'adapter', 'parameter-efficient', 'peft', 'low-rank', 'few parameters']], ['Quantise the base model, as in QLoRA, to cut memory', ['quantis', 'quantiz', '4-bit', '8-bit', 'qlora', 'lower precision']], ['Mixed precision, gradient accumulation and gradient checkpointing', ['mixed precision', 'bf16', 'fp16', 'accumulation', 'checkpointing', 'activation']], ['Smaller batches, shorter sequences, or a smaller base model', ['smaller', 'batch', 'sequence length', 'distill', 'smaller model']], ['Evaluate against the base model and watch for forgetting', ['evaluate', 'baseline', 'forgetting', 'validation', 'compare']]], model: 'Memory goes to the weights, the gradients, the optimiser state and the activations, so I attack each one. Rather than updating every weight, I use parameter-efficient fine-tuning such as LoRA, which freezes the base model and trains small low-rank matrices, often well under one percent of the parameters, which removes most of the gradient and optimiser memory. I can also load the frozen base model in four-bit or eight-bit precision, which is the idea of QLoRA. Mixed precision with bfloat16 halves activation memory, gradient checkpointing recomputes activations instead of storing them, and gradient accumulation gives a large effective batch from small micro-batches. If that is still too much, I use a smaller base model. Then I compare against the original model on a held-out set to check for gains and forgetting.' }
    ]
  },

  {
    id: 'training', title: 'Training and debugging models', tracks: ['mle', 'genai', 'nlp', 'cv', 'mlops'],
    tasks: [
      {
        id: 'tr-schedule', title: 'Warm-up and cosine schedule',
        prompt: `Write \`lr_at(step, base_lr, warmup, total)\`.

- During warm-up (\`step < warmup\`): linear increase, \`base_lr * (step + 1) / warmup\`.
- Afterwards: cosine decay to 0, \`0.5 * base_lr * (1 + cos(pi * progress))\`, where \`progress = (step - warmup) / (total - warmup)\`.`,
        starter: R`import math

def lr_at(step, base_lr, warmup, total):
    pass

print([round(lr_at(s, 1.0, 10, 100), 3) for s in (0, 9, 10, 55, 100)])
`,
        solution: R`import math

def lr_at(step, base_lr, warmup, total):
    if step < warmup:
        return base_lr * (step + 1) / warmup
    progress = (step - warmup) / max(1, total - warmup)
    return 0.5 * base_lr * (1 + math.cos(math.pi * progress))
`,
        tests: [
          { name: 'Warm-up', code: R`assert close(lr_at(0, 1.0, 10, 100), 0.1) and close(lr_at(4, 1.0, 10, 100), 0.5) and close(lr_at(9, 1.0, 10, 100), 1.0), 'Warm-up should rise linearly: 0.1 at step 0, 1.0 at step 9'` },
          { name: 'Peak after warm-up', code: R`assert close(lr_at(10, 2.0, 10, 100), 2.0), 'At the first step after warm-up the rate equals base_lr'` },
          { name: 'Cosine midpoint and end', code: R`assert close(lr_at(55, 1.0, 10, 100), 0.5), 'Halfway through the decay the rate is half of base_lr'
assert abs(lr_at(100, 1.0, 10, 100)) < 1e-9, 'At the final step the rate is 0'` }
        ]
      },
      {
        id: 'tr-adam', title: 'One Adam step',
        prompt: `Write \`adam_step(param, grad, m, v, t, lr=1e-3, b1=0.9, b2=0.999, eps=1e-8)\` and return the new \`(param, m, v)\`. \`t\` starts at 1.

- \`m = b1*m + (1-b1)*grad\`, \`v = b2*v + (1-b2)*grad**2\`
- Bias-corrected: \`m_hat = m / (1 - b1**t)\`, \`v_hat = v / (1 - b2**t)\`
- \`param = param - lr * m_hat / (sqrt(v_hat) + eps)\``,
        starter: R`import math

def adam_step(param, grad, m, v, t, lr=1e-3, b1=0.9, b2=0.999, eps=1e-8):
    pass

print(adam_step(1.0, 0.5, 0.0, 0.0, 1))
`,
        solution: R`import math

def adam_step(param, grad, m, v, t, lr=1e-3, b1=0.9, b2=0.999, eps=1e-8):
    m = b1 * m + (1 - b1) * grad
    v = b2 * v + (1 - b2) * grad ** 2
    m_hat = m / (1 - b1 ** t)
    v_hat = v / (1 - b2 ** t)
    param = param - lr * m_hat / (math.sqrt(v_hat) + eps)
    return param, m, v
`,
        tests: [
          { name: 'First step', code: R`p, m, v = adam_step(1.0, 0.5, 0.0, 0.0, 1)
assert close(m, 0.05) and close(v, 0.00025), 'After one step m = 0.05 and v = 0.00025'
assert close(p, 0.999, 1e-7), 'The first step moves the parameter by about lr: expected 0.999'` },
          { name: 'Second step', code: R`p, m, v = adam_step(1.0, 0.5, 0.0, 0.0, 1)
p, m, v = adam_step(p, -1.0, m, v, 2)
assert close(m, -0.055) and close(v, 0.00124975), 'Second step: m = -0.055, v = 0.00124975'
assert close(p, 0.9993661, 1e-6), 'Second step: param should be about 0.9993661'` },
          { name: 'Step size is independent of gradient scale', code: R`p1, _, _ = adam_step(0.0, 1e-4, 0.0, 0.0, 1, eps=0.0)
p2, _, _ = adam_step(0.0, 1e4, 0.0, 0.0, 1, eps=0.0)
assert close(p1, -1e-3) and close(p2, -1e-3), 'On the first step Adam moves by lr whatever the gradient size'` }
        ]
      }
    ],
    quiz: [
      { q: 'Loss becomes NaN in the first few hundred steps. Most likely cause?', options: ['Too little data', 'Learning rate too high or a numerical issue such as log(0)', 'Too much regularisation', 'Batch size of 32'], answer: 1, why: 'Lower the learning rate, add warm-up and gradient clipping, and check for divide-by-zero or log of zero.', level: 'medium' },
      { q: 'A good first sanity check for a new training pipeline?', options: ['Train for a week', 'Overfit a single small batch to near-zero loss', 'Tune the learning rate schedule', 'Add dropout'], answer: 1, why: 'If the model cannot memorise ten examples, there is a bug in the model, loss or data.', level: 'easy' },
      { q: 'AdamW differs from Adam with L2 because…', options: ['It has no momentum', 'Weight decay is applied directly to the weights, decoupled from the adaptive gradient', 'It uses second-order information', 'It needs no learning rate'], answer: 1, why: 'Decoupled decay regularises more consistently and is the default for transformers.', level: 'medium' },
      { q: 'Mixed-precision training mainly gives you…', options: ['Higher accuracy', 'Lower memory use and faster training on GPUs', 'Better generalisation', 'Smaller datasets'], answer: 1, why: 'Half-precision activations with a gradient scaler roughly halve memory.', level: 'easy' },
      { q: 'What is an epoch?', options: ['One full pass over the training data', 'One weight update', 'One batch', 'One layer'], answer: 0, why: 'An epoch consists of many steps.', level: 'easy' },
      { q: 'Which dataset should you use to choose hyperparameters?', options: ['The test set', 'Production data', 'The validation set', 'The training set'], answer: 2, why: 'The test set is kept for the final estimate.', level: 'easy' },
      { q: 'You use 4 GPUs, 16 samples per GPU and 8 gradient-accumulation steps. What is the effective batch size?', options: ['512', '128', '64', '2,048'], answer: 0, why: '16 × 4 × 8.', level: 'medium' },
      { q: 'Fine-tuning all layers of a pre-trained model at learning rate 1e-3 makes validation accuracy worse. What is the first change to try?', options: ['Train for more epochs', 'Add more layers', 'Remove the validation set', 'Lower the learning rate, especially for the pre-trained layers'], answer: 3, why: 'Large updates destroy pre-trained features.', level: 'medium' },
      { q: 'A run is resumed from a checkpoint that holds only model weights, and the loss spikes before recovering. Why?', options: ['The optimiser state and the schedule position were lost', 'Dropout was reset', 'The batch size doubled', 'The gradients vanished'], answer: 0, why: 'Save the optimiser and scheduler state too.', level: 'hard' },
      { q: 'Warm-up lasts 1,000 steps to a peak of 6e-4, then cosine decay reaches 0 at step 11,000. What is the learning rate at step 6,000?', options: ['6e-4', '1.5e-4', '3e-4', '4.5e-4'], answer: 2, why: 'Step 6,000 is halfway through the decay, where cosine gives half the peak.', level: 'hard' },
      { q: 'A 3-billion-parameter model is trained with AdamW, with weights, gradients and both Adam moments in float32. How much memory do these four need, ignoring activations?', options: ['12 GB', '24 GB', '36 GB', '48 GB'], answer: 3, why: '3e9 × 16 bytes = 48 GB.', level: 'hard' },
      { q: 'Why do very large batch sizes usually come with a larger learning rate and a warm-up?', options: ['Gradients are less noisy, so larger steps are tolerable, but the first steps are unstable', 'GPUs need a higher learning rate to wake up', 'To reduce memory use', 'Because the validation set grows too'], answer: 0, why: 'Warm-up protects the early steps.', level: 'hard' }
    ],
    interview: [
      { q: 'Your model’s loss is not decreasing. How do you debug it?', level: 'hard', points: [['Overfit a tiny batch first', ['tiny batch', 'small batch', 'single batch', 'overfit a', 'few examples', 'one batch']], ['Check the data and labels', ['data', 'label']], ['Check learning rate and initialisation', ['learning rate']], ['Inspect gradients and loss function', ['gradient', 'loss function', 'nan']], ['Compare against a simple baseline', ['baseline', 'simpler']]], model: 'I work from simple to complex. First I try to overfit one small batch; if the loss does not go to near zero there is a bug. I inspect the data pipeline by eye: are inputs and labels aligned, normalised and shuffled correctly. I check the loss matches the output layer, for example not applying softmax twice. Then I sweep the learning rate over several orders of magnitude and look at gradient norms for vanishing, exploding or NaN values. I also confirm the model is in training mode and parameters are actually registered with the optimiser. Finally I compare with a simple baseline to see what performance to expect.' },
      { q: 'How do you choose and tune hyperparameters?', level: 'medium', points: [['Start from known good defaults', ['default', 'paper', 'known']], ['Learning rate matters most', ['learning rate']], ['Random or Bayesian search beats grid search', ['random search', 'bayesian', 'optuna']], ['Use a validation set, not the test set', ['validation']], ['Track experiments', ['track', 'mlflow', 'weights and biases', 'wandb', 'log']]], model: 'I start from defaults that are known to work for the architecture and tune the learning rate first, since it has the largest effect, usually on a log scale with a short run. Then I tune batch size, weight decay and model size. For the search I prefer random search or Bayesian optimisation with early stopping of bad runs over a grid, because only a few hyperparameters really matter. Everything is selected on a validation set and the test set is touched once. I log every run with its config and metrics in a tracker so results are reproducible.' },
      { q: 'What is transfer learning and when would you fine-tune instead of training from scratch?', level: 'medium', points: [['Reuse a model pre-trained on a large dataset', ['pre-train', 'pretrain', 'reuse']], ['Needs far less data and compute', ['less data', 'small data', 'compute', 'faster', 'cheaper']], ['Options: freeze the backbone, or fine-tune with a low learning rate', ['freeze', 'low learning rate', 'small learning rate', 'lower learning rate']], ['Parameter-efficient methods such as LoRA', ['lora', 'adapter', 'parameter-efficient', 'peft']]], model: 'Transfer learning starts from a model pre-trained on a large general dataset and adapts it to my task. I almost always prefer it, because pre-trained features mean I need far less labelled data and compute. With very little data I freeze the backbone and train a new head. With more data I unfreeze and fine-tune the whole model with a low learning rate. For large language models I use parameter-efficient methods such as LoRA. I would train from scratch only if my domain is very different from anything pre-trained and I have a lot of data.' },
      { q: 'What is early stopping, and how does it work?', level: 'easy', points: [['Monitor validation loss during training', ['validation', 'monitor', 'watch', 'held-out']], ['Stop when validation stops improving for a set number of epochs, the patience', ['patience', 'stops improving', 'no improvement', 'stop']], ['Restore the best checkpoint rather than the last', ['best', 'checkpoint', 'restore', 'weights']], ['Acts as regularisation, preventing overfitting and saving compute', ['regulari', 'overfit', 'compute', 'time', 'save']]], model: 'Early stopping watches a validation metric, usually the validation loss, while the model trains. Training loss usually keeps falling, but at some point validation loss stops improving and starts to rise, which means the model has begun to memorise the training data. I set a patience, for example five epochs, and if there is no improvement in that time I stop. Crucially, I restore the weights from the best epoch, not the last one, which means I save checkpoints as I go. It works as a simple, effective form of regularisation, and it saves compute. The validation set used for stopping is slightly used up by this choice, so the final unbiased number should come from a separate test set.' },
      { q: 'What is data augmentation, and when does it help?', level: 'easy', points: [['Creates modified copies of training examples, such as flips, crops, noise or synonyms', ['flip', 'crop', 'rotate', 'noise', 'copy', 'variation', 'modif', 'transform']], ['Teaches the model invariances and reduces overfitting', ['invarian', 'overfit', 'regulari', 'generalis', 'generaliz', 'robust']], ['Useful when data is limited', ['limited', 'small dataset', 'little data', 'more data', 'expand']], ['Transformations must preserve the label', ['preserve', 'label', 'realistic', 'sensible', 'valid']]], model: 'Data augmentation applies random, label-preserving changes to training examples so the model sees many variations of the same data. For images that means flips, crops, small rotations and colour changes. For text it can be synonym replacement or back-translation, and for audio adding noise or shifting pitch. It teaches the model that irrelevant changes should not alter the prediction, which reduces overfitting and improves robustness, and it is most valuable when the dataset is small. The key constraint is that the transformation must keep the label valid and the data realistic. Flipping a photo of a cat is fine, but flipping the digit six makes a different digit. I apply augmentation to training data only, not to validation or test.' },
      { q: 'What should you save in a checkpoint so that you can resume training properly?', level: 'easy', points: [['Model weights', ['weight', 'model', 'parameters', 'state dict']], ['Optimiser state such as momentum or Adam statistics', ['optimi', 'adam', 'momentum', 'state']], ['Epoch or step count and learning rate scheduler state', ['epoch', 'step', 'scheduler', 'learning rate', 'counter']], ['Random seeds and best-metric information; also config', ['seed', 'random', 'rng', 'config', 'best', 'metric']]], model: 'To resume training exactly where it stopped, saving the model weights alone is not enough. I also save the optimiser state, because Adam keeps running averages of gradients, and restarting without them causes a loss spike. I save the epoch or step counter and the state of the learning rate scheduler, so the schedule continues from the right point instead of restarting warm-up. For reproducibility I store the random number generator states, or at least the seed, and the configuration used, including hyperparameters and the code version. I also keep track of the best validation score and keep the best checkpoint separately from the latest, since the final model I deploy is often the best one, not the last.' },
      { q: 'How do learning-rate schedules and warm-up work, and why do they matter?', level: 'medium', points: [['A constant learning rate is often not optimal; large at first and smaller later', ['constant', 'large at first', 'smaller later', 'decay', 'reduce']], ['Common schedules: step decay, cosine annealing, reduce on plateau', ['step', 'cosine', 'plateau', 'exponential', 'one-cycle', 'one cycle']], ['Warm-up ramps up from a small value to avoid early instability', ['warm-up', 'warmup', 'warm up', 'ramp', 'early', 'instab']], ['Find a good peak learning rate with a range test', ['range test', 'lr finder', 'sweep', 'peak', 'find', 'search']]], model: 'The learning rate is often the most important hyperparameter, and a constant value is rarely best. A large rate makes quick progress early, but a smaller one is needed later to settle into a good minimum instead of bouncing around it. Schedules automate that. Step decay drops the rate at fixed epochs, cosine annealing reduces it smoothly following a cosine curve, and reduce-on-plateau cuts it when the validation metric stalls. Warm-up starts with a tiny rate and ramps up over the first steps, which avoids instability while the weights are random and optimiser statistics are still inaccurate. It is standard for transformers. To pick the peak rate I run a quick range test, increasing it over a short run and choosing a value just before the loss diverges.' },
      { q: 'What is mixed-precision training and what are its benefits and risks?', level: 'medium', points: [['Uses 16-bit floats for most computation and 32-bit for sensitive parts', ['16-bit', 'fp16', 'bf16', 'half precision', '32-bit', 'fp32', 'float']], ['Faster and uses less memory, allowing larger batches or models', ['faster', 'memory', 'larger batch', 'tensor core', 'throughput']], ['Keeps a master copy of weights in 32-bit', ['master', 'copy', 'fp32 weights', '32-bit weights', 'accumulat']], ['Loss scaling avoids underflow with fp16; bf16 has wider range', ['loss scaling', 'underflow', 'overflow', 'range', 'bf16', 'gradscaler', 'nan']]], model: 'Mixed-precision training runs most of the forward and backward computation in 16-bit floating point and keeps sensitive operations, such as the weight updates and some reductions, in 32-bit. On modern GPUs that makes training much faster, thanks to tensor cores, and cuts memory use roughly in half for activations, so I can use bigger batches or bigger models. Frameworks keep a 32-bit master copy of the weights so tiny updates are not lost. The main risk is numerical: standard 16-bit floats have a small range, so small gradients can underflow to zero. Loss scaling multiplies the loss to prevent that. The bfloat16 format has the same range as 32-bit, which avoids most of these issues, so I use it when the hardware supports it.' },
      { q: 'Your training loss suddenly turns into NaN halfway through training. How do you find the cause?', level: 'hard', points: [['Find the first step where it happens by checking and logging loss and gradient norms', ['first step', 'log', 'gradient norm', 'grad norm', 'detect', 'anomaly']], ['Common causes: learning rate too high, exploding gradients, numerical issues like log of zero or division by zero', ['learning rate', 'explod', 'log of zero', 'divide', 'division', 'overflow', 'numerical']], ['Bad data: NaN or extreme values in a batch', ['bad data', 'nan in', 'inf', 'outlier', 'corrupt', 'batch']], ['Fixes: gradient clipping, lower learning rate, warm-up, stable loss functions, bf16 or loss scaling', ['clip', 'lower', 'warm', 'epsilon', 'stable', 'loss scaling', 'bf16']], ['Reproduce from the last good checkpoint with the same data order', ['checkpoint', 'reproduc', 'seed', 'same batch', 'resume']]], model: 'I start by finding exactly when it happens: log the loss and the gradient norm every step, and turn on anomaly detection to locate the operation that first produces a NaN or infinity. A gradient norm that climbs for many steps before the failure points to instability, usually a learning rate that is too high, a missing warm-up, or exploding gradients, so I add gradient clipping and lower the rate. If it happens at one step, I inspect that batch for corrupt data, NaNs, or extreme values. Numerical bugs are another cause: log of zero, division by zero, or a softmax overflow, which I fix with epsilons or stable fused loss functions. With half precision I check loss scaling or switch to bfloat16. I reproduce from the last good checkpoint.' },
      { q: 'What are the main ways to train a model across multiple GPUs, and what pitfalls should you watch for?', level: 'hard', points: [['Data parallelism copies the model to each GPU and splits the batch, averaging gradients', ['data parallel', 'copy', 'split the batch', 'all-reduce', 'average gradient', 'ddp', 'replica']], ['Model or pipeline parallelism splits the model across devices when it does not fit', ['model parallel', 'pipeline', 'tensor parallel', 'split the model', 'does not fit', 'shard', 'fsdp', 'zero']], ['Communication overhead and batch size effects limit scaling', ['communication', 'overhead', 'bandwidth', 'interconnect', 'scaling', 'effective batch']], ['Adjust learning rate and keep randomness, data sharding and batch norm statistics correct', ['learning rate', 'sampler', 'shard', 'batch norm', 'seed', 'duplicate']]], model: 'The simplest approach is data parallelism: each GPU holds a full copy of the model, processes a different slice of the batch, and the gradients are averaged across GPUs, usually with an all-reduce, before every update. It scales well as long as the model fits in one GPU. When it does not, I shard the model: pipeline parallelism puts different layers on different devices, tensor parallelism splits individual matrices, and approaches like FSDP or ZeRO shard the parameters, gradients and optimiser state. Pitfalls include communication overhead, which can make scaling far from linear, and the larger effective batch size, which means I should adjust the learning rate and warm up. I also need to make sure each GPU sees different data through a distributed sampler, and that batch normalisation statistics and random seeds are handled deliberately.' }
    ]
  }
];
