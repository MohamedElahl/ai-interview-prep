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
      { q: 'Explain backpropagation.', points: [['Forward pass computes the loss', ['forward']], ['Chain rule propagates gradients backwards layer by layer', ['chain rule', 'backward']], ['Reuses intermediate results, so it is efficient', ['reuse', 'efficient', 'cache', 'intermediate', 'once']], ['Gradients drive the weight update', ['update', 'optimi', 'gradient descent']]], model: 'Backpropagation is how we compute the gradient of the loss with respect to every weight. We run a forward pass, storing each layer’s activations, and compute the loss. Then we apply the chain rule from the output back to the input: each layer receives the gradient of the loss with respect to its output, and from it computes the gradient for its weights and for its input, which it passes back. Because each intermediate gradient is computed once and reused, the cost is about the same as the forward pass. An optimiser then uses the gradients to update the weights.' },
      { q: 'What are vanishing and exploding gradients, and how do you address them?', points: [['Gradients shrink or grow multiplicatively through layers', ['multipl', 'product', 'many layers', 'deep']], ['Vanishing: early layers stop learning', ['vanish', 'stop learning', 'small']], ['Fixes: ReLU, residual connections, normalisation, careful initialisation', ['relu', 'residual', 'skip', 'normali', 'initiali']], ['Exploding: use gradient clipping', ['clip']]], model: 'In a deep network the gradient at an early layer is a product of many terms. If those terms are below one it shrinks towards zero and early layers stop learning: vanishing gradients. If they are above one it blows up and training diverges: exploding gradients. For vanishing gradients we use ReLU-family activations, residual connections, normalisation layers and good initialisation such as He or Xavier. For exploding gradients, common in recurrent networks, we clip the gradient norm and lower the learning rate.' },
      { q: 'Your model trains but validation loss starts rising while training loss keeps falling. What do you do?', points: [['This is overfitting', ['overfit']], ['Early stopping, keep the best checkpoint', ['early stop', 'checkpoint']], ['Regularise: dropout, weight decay, augmentation', ['dropout', 'weight decay', 'augment', 'regulari']], ['More data or a smaller model', ['more data', 'smaller', 'reduce']]], model: 'That pattern is overfitting: the model is memorising the training set. First I keep the checkpoint with the best validation loss and use early stopping. Then I add regularisation, such as dropout, weight decay and data augmentation, or reduce model capacity. If possible I get more data or use a pre-trained model and fine-tune fewer layers. I also check that the validation set comes from the same distribution as training and that nothing leaked.' }
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
      { q: 'Explain self-attention and why it replaced recurrent networks.', points: [['Each token computes a weighted mix of all tokens', ['weighted', 'all tokens', 'every token', 'each token', 'every other']], ['Uses queries, keys and values', ['query', 'key', 'value']], ['Processes the sequence in parallel', ['parallel']], ['Handles long-range dependencies directly', ['long-range', 'long range', 'long-term', 'distance', 'dependenc']]], model: 'In self-attention every token builds a new representation as a weighted sum of all tokens in the sequence. Each token is projected into a query, a key and a value; the weight between two tokens is the softmax of the scaled dot product of one token’s query with the other’s key. Compared with recurrent networks, the whole sequence is processed in parallel, which makes training on GPUs far faster, and any two positions are connected in one step, so long-range dependencies are learned much more easily. The cost is quadratic in sequence length.' },
      { q: 'Describe the components of a transformer block.', points: [['Multi-head self-attention', ['multi-head', 'multi head', 'attention']], ['Feed-forward network', ['feed-forward', 'feed forward', 'mlp']], ['Residual connections', ['residual', 'skip']], ['Layer normalisation', ['layer norm', 'normali']], ['Positional information added to the inputs', ['position']]], model: 'A transformer block has two sub-layers. The first is multi-head self-attention, where several attention heads run in parallel so the model can attend to different relations at once. The second is a position-wise feed-forward network applied to each token. Each sub-layer is wrapped in a residual connection and layer normalisation, which keep gradients stable in deep stacks. Token embeddings are combined with positional encodings at the input, because attention itself has no sense of order. Decoder blocks add a causal mask, and encoder-decoder models add cross-attention.' },
      { q: 'What is the difference between encoder-only, decoder-only and encoder-decoder models?', points: [['Encoder-only (BERT): bidirectional, for understanding', ['bert', 'bidirectional', 'understanding', 'classification', 'embedding']], ['Decoder-only (GPT): causal, for generation', ['gpt', 'causal', 'autoregress', 'generat']], ['Encoder-decoder (T5): sequence to sequence', ['t5', 'translation', 'sequence to sequence', 'seq2seq', 'cross-attention', 'cross attention']]], model: 'Encoder-only models such as BERT see the whole input in both directions and are trained with masked-token prediction; they are good for classification, retrieval embeddings and extraction. Decoder-only models such as GPT use a causal mask and predict the next token, which makes them natural generators and is the architecture of today’s large language models. Encoder-decoder models such as T5 encode an input and generate an output with cross-attention, which suits translation and summarisation.' }
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
      { q: 'Your model’s loss is not decreasing. How do you debug it?', points: [['Overfit a tiny batch first', ['tiny batch', 'small batch', 'single batch', 'overfit a', 'few examples', 'one batch']], ['Check the data and labels', ['data', 'label']], ['Check learning rate and initialisation', ['learning rate']], ['Inspect gradients and loss function', ['gradient', 'loss function', 'nan']], ['Compare against a simple baseline', ['baseline', 'simpler']]], model: 'I work from simple to complex. First I try to overfit one small batch; if the loss does not go to near zero there is a bug. I inspect the data pipeline by eye: are inputs and labels aligned, normalised and shuffled correctly. I check the loss matches the output layer, for example not applying softmax twice. Then I sweep the learning rate over several orders of magnitude and look at gradient norms for vanishing, exploding or NaN values. I also confirm the model is in training mode and parameters are actually registered with the optimiser. Finally I compare with a simple baseline to see what performance to expect.' },
      { q: 'How do you choose and tune hyperparameters?', points: [['Start from known good defaults', ['default', 'paper', 'known']], ['Learning rate matters most', ['learning rate']], ['Random or Bayesian search beats grid search', ['random search', 'bayesian', 'optuna']], ['Use a validation set, not the test set', ['validation']], ['Track experiments', ['track', 'mlflow', 'weights and biases', 'wandb', 'log']]], model: 'I start from defaults that are known to work for the architecture and tune the learning rate first, since it has the largest effect, usually on a log scale with a short run. Then I tune batch size, weight decay and model size. For the search I prefer random search or Bayesian optimisation with early stopping of bad runs over a grid, because only a few hyperparameters really matter. Everything is selected on a validation set and the test set is touched once. I log every run with its config and metrics in a tracker so results are reproducible.' },
      { q: 'What is transfer learning and when would you fine-tune instead of training from scratch?', points: [['Reuse a model pre-trained on a large dataset', ['pre-train', 'pretrain', 'reuse']], ['Needs far less data and compute', ['less data', 'small data', 'compute', 'faster', 'cheaper']], ['Options: freeze the backbone, or fine-tune with a low learning rate', ['freeze', 'low learning rate', 'small learning rate', 'lower learning rate']], ['Parameter-efficient methods such as LoRA', ['lora', 'adapter', 'parameter-efficient', 'peft']]], model: 'Transfer learning starts from a model pre-trained on a large general dataset and adapts it to my task. I almost always prefer it, because pre-trained features mean I need far less labelled data and compute. With very little data I freeze the backbone and train a new head. With more data I unfreeze and fine-tune the whole model with a low learning rate. For large language models I use parameter-efficient methods such as LoRA. I would train from scratch only if my domain is very different from anything pre-trained and I have a lot of data.' }
    ]
  }
];
