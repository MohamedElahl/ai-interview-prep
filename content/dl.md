=== nn-basics ===
# What interviewers check

You should be able to explain a forward and backward pass on a whiteboard and implement a layer in numpy.

# The building blocks

- **Layer.** `y = x @ W + b`, followed by a non-linear activation.
- **Activations.** ReLU `max(0, x)` is the default for hidden layers. Sigmoid for a binary output, softmax for multi-class.
- **Loss.** Cross-entropy for classification, MSE for regression.
- **Backpropagation.** The chain rule applied from the loss back to each weight.

# Backward pass of a dense layer

Given `dout = dL/dy`:

```python
dx = dout @ W.T      # passed to the previous layer
dW = x.T @ dout      # gradient for the weights
db = dout.sum(axis=0)
```

# Softmax with cross-entropy

Combined, the gradient with respect to the logits is simply `softmax - one_hot`. Subtract the maximum logit before `exp` to avoid overflow.

# Why training can fail

- **Vanishing gradients.** Fix with ReLU, residual connections, normalisation and He or Xavier initialisation.
- **Exploding gradients.** Fix with gradient clipping and a lower learning rate.
- **Dead ReLUs.** Units stuck at zero; try a lower learning rate or Leaky ReLU.

# Regularisation

- **Dropout** randomly zeroes activations during training. It is off at inference.
- **Weight decay** penalises large weights.
- **Batch norm** behaves differently in training and evaluation mode. Forgetting `model.eval()` is a classic bug.

=== transformers ===
# What interviewers check

Transformers are behind every modern language and vision model. Be ready to derive attention and to explain each part of a block.

# Attention in three lines

```python
scores = Q @ K.T / sqrt(d)        # how relevant is each key to each query
weights = softmax(scores)         # each row sums to 1
output = weights @ V              # weighted mix of the values
```

- In **self-attention**, Q, K and V all come from the same sequence.
- Dividing by `sqrt(d)` stops softmax from saturating.
- **Multi-head** attention runs several of these in parallel so the model can track different relations.
- Cost is O(n²) in sequence length.

# A transformer block

1. Multi-head self-attention
2. Add and layer-normalise (residual connection)
3. Feed-forward network on each position
4. Add and layer-normalise

Positions are injected at the input, because attention has no sense of order. Options: sinusoidal, learned, or rotary (RoPE).

# Three families

| Family | Example | Attention | Good for |
| --- | --- | --- | --- |
| Encoder-only | BERT | Bidirectional | Classification, embeddings, extraction |
| Decoder-only | GPT | Causal mask | Text generation, today's LLMs |
| Encoder-decoder | T5 | Both, plus cross-attention | Translation, summarisation |

# Beyond text

A **Vision Transformer** cuts an image into patches and treats each patch as a token.

# Common follow-ups

- Why layer norm and not batch norm? It does not depend on batch statistics and works with variable-length sequences.
- What is the KV cache? Stored keys and values from earlier tokens, so generation does not recompute them.

=== training ===
# What interviewers check

Senior interviewers care less about theory than about whether you can make a model train. Debugging stories carry a lot of weight.

# Optimisers

- **SGD with momentum.** Simple, strong for vision.
- **Adam.** Adapts the step per parameter using running averages of the gradient and its square.
- **AdamW.** Adam with decoupled weight decay. The default for transformers.

# Learning rate

- The most important hyperparameter. Search on a log scale.
- **Warm-up** avoids instability at the start. **Cosine decay** is a common schedule afterwards.

# A debugging routine

1. **Overfit one small batch.** If loss does not reach near zero, there is a bug.
2. **Look at the data.** Print a few inputs and labels after preprocessing.
3. **Check the loss.** Does it match the output layer? No double softmax?
4. **Sweep the learning rate.** Too high gives NaN, too low gives a flat line.
5. **Watch gradient norms.** Clip if they explode.
6. **Check modes.** `model.train()` for training, `model.eval()` for validation.

# Reading loss curves

- Train falls, validation rises: overfitting.
- Both flat and high: underfitting, a bug, or a learning rate that is too low.
- Loss is NaN: learning rate too high, `log(0)` or division by zero.

# Practical tools

- **Transfer learning**: fine-tune a pre-trained model with a low learning rate.
- **Mixed precision** halves memory. **Gradient accumulation** simulates a larger batch.
- **Experiment tracking** (MLflow, Weights and Biases) and fixed seeds make runs reproducible.
