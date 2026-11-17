=== timeseries ===
# What makes time series different

Observations are ordered and depend on each other. You may only use the past to predict the future. Most mistakes come from forgetting that.

# Components

- **Trend:** long-term direction.
- **Seasonality:** a pattern with a fixed period (daily, weekly, yearly).
- **Noise:** what is left.
- **Stationary** series have constant mean, variance and autocorrelation. Differencing and log transforms help.

# Baselines you must beat

| Baseline | Forecast |
| --- | --- |
| Naive | The last observed value |
| Seasonal naive | The value one season ago |
| Moving average | Mean of the last k values |
| Exponential smoothing | `s[t] = alpha * x[t] + (1 - alpha) * s[t-1]` |

# Turning a series into a supervised problem

Slide a window: the last `lookback` values are the features, the value `horizon` steps ahead is the target.

Useful features: lags (1, 7, 365), rolling mean and standard deviation (shifted so they exclude the target), calendar features, holidays, known future covariates such as price.

# Validation

- Split by time. Never shuffle.
- **Walk-forward (rolling origin):** train to a cut-off, forecast the horizon, move forward, repeat.
- Leave a gap if features use information that arrives late.

# Metrics

- **MAE** and **RMSE**: in the units of the data.
- **MAPE**: percentage, breaks near zero.
- **sMAPE**: bounded version.
- **MASE**: MAE divided by the naive forecast's MAE. Below 1 beats naive, and it is comparable across series.

# Model families

- **Classical:** exponential smoothing (ETS), ARIMA, SARIMA, Prophet. Good for few series.
- **Machine learning:** gradient-boosted trees on lag features. Strong for many series with covariates.
- **Deep learning:** LSTM, temporal convolution, N-BEATS, transformers. Need more data.

# Common traps

Leakage through rolling features, random splits, evaluating at the wrong horizon, and ignoring a changed regime (drift).

=== rnn ===
# The idea

A recurrent network reads a sequence one step at a time and keeps a **hidden state** that summarises everything so far.

```
h_t = tanh(x_t @ Wx + h_{t-1} @ Wh + b)
```

The same weights are used at every step.

# Training

**Backpropagation through time (BPTT):** unroll the network across time steps and backpropagate. Long sequences are cut into chunks (truncated BPTT).

The gradient is multiplied by the recurrent weights at every step, so it **vanishes** or **explodes**. Clipping handles explosion. Gates handle vanishing.

# LSTM

Adds a **cell state** `c` as long-term memory, controlled by three gates:

```
i = sigmoid(...)   # input gate: what to write
f = sigmoid(...)   # forget gate: what to erase
o = sigmoid(...)   # output gate: what to expose
g = tanh(...)      # candidate values
c = f * c + i * g
h = o * tanh(c)
```

The additive update of `c` lets gradients flow across many steps.

# GRU

Two gates (update and reset), no separate cell state, fewer parameters. Similar accuracy in most tasks.

# Variants

- **Bidirectional:** reads both directions; needs the whole sequence, so not for streaming.
- **Stacked:** several recurrent layers.
- **Sequence-to-sequence:** an encoder RNN and a decoder RNN, later improved with attention.

# Input and output shapes

Many-to-one (classification), many-to-many (tagging, forecasting), one-to-many (generation).

# RNNs today

Transformers replaced them for language. RNNs remain useful for streaming inference, small embedded models and sensor signals, where constant memory per step matters.

=== ts-transformers ===
# Why transformers for sequences of numbers

Attention links any two time steps directly, so long-range patterns and many related series can be modelled together. The catch: they need plenty of data and careful design.

# Design choices

- **Tokens.** One time step is a poor token. **Patching** groups consecutive points into one token (PatchTST): fewer tokens, more meaning per token.
- **Order.** Attention ignores order, so add positional encodings and time features (hour, weekday) encoded as sine and cosine.
- **No peeking.** Use an encoder on the history only, or a decoder with a **causal mask**.
- **Normalisation.** Scale each input window (instance normalisation) to cope with level shifts.
- **Output.** Predict the whole horizon at once (direct) or one step at a time (autoregressive).
- **Channels.** Treat each variable independently, or model interactions between variables.

# Models to know

| Model | Idea |
| --- | --- |
| Informer / Autoformer | Efficient attention for long sequences |
| Temporal Fusion Transformer | Mixes static, known-future and observed inputs; interpretable |
| PatchTST | Patching and channel independence |
| iTransformer | Each variable is a token |
| Chronos, TimesFM, Moirai | Pre-trained foundation models, zero-shot forecasting |

# A reality check

A one-layer linear model (DLinear) matched or beat several transformer forecasters on standard benchmarks. Always compare with seasonal naive, linear and gradient-boosted trees.

# Where they do well

Large datasets, many related series, long horizons, rich covariates, and pre-trained models applied to new series.

# Beyond forecasting

Anomaly detection (score the reconstruction or forecast error), classification of sensor windows, imputation of missing values.

# Deployment notes

Sequence length drives cost. Patching, shorter context, quantisation and distillation make edge deployment feasible.
