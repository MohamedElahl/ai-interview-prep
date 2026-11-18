const R = String.raw;

export default [
  {
    id: 'timeseries', title: 'Time series fundamentals', tracks: ['ds', 'mle', 'auto', 'da', 'mlops'],
    tasks: [
      {
        id: 'ts-windows', title: 'Sliding windows',
        prompt: `Turn a series into supervised training pairs. Write \`make_windows(series, lookback, horizon)\` returning \`(X, y)\`:

- \`X[i]\` is the list of \`lookback\` consecutive values starting at position \`i\`.
- \`y[i]\` is the value \`horizon\` steps after the end of that window (\`horizon=1\` is the very next value).
- Return empty lists if the series is too short.`,
        starter: R`def make_windows(series, lookback, horizon):
    pass

print(make_windows([1, 2, 3, 4, 5], 2, 1))  # ([[1, 2], [2, 3], [3, 4]], [3, 4, 5])
`,
        solution: R`def make_windows(series, lookback, horizon):
    X, y = [], []
    for i in range(len(series) - lookback - horizon + 1):
        X.append(list(series[i:i + lookback]))
        y.append(series[i + lookback + horizon - 1])
    return X, y
`,
        tests: [
          { name: 'One step ahead', code: R`X, y = make_windows([1, 2, 3, 4, 5], 2, 1)
assert [list(r) for r in X] == [[1, 2], [2, 3], [3, 4]] and list(y) == [3, 4, 5], 'Expected X = [[1,2],[2,3],[3,4]], y = [3,4,5]'` },
          { name: 'Two steps ahead', code: R`X, y = make_windows([1, 2, 3, 4, 5], 2, 2)
assert [list(r) for r in X] == [[1, 2], [2, 3]] and list(y) == [4, 5], 'With horizon 2 the target is two steps after the window'` },
          { name: 'Too short', code: R`X, y = make_windows([1, 2], 2, 1)
assert list(X) == [] and list(y) == [], 'No full window plus target fits: return empty lists'` },
          { name: 'Exact fit', code: R`X, y = make_windows([7, 8, 9], 2, 1)
assert [list(r) for r in X] == [[7, 8]] and list(y) == [9], 'Exactly one window fits'` }
        ]
      },
      {
        id: 'ts-ses', title: 'Exponential smoothing',
        prompt: `Write \`ses(series, alpha)\` for simple exponential smoothing. Return the list of smoothed values:

- \`s[0] = x[0]\`
- \`s[t] = alpha * x[t] + (1 - alpha) * s[t-1]\``,
        starter: R`def ses(series, alpha):
    pass

print(ses([10, 20, 30], 0.5))  # [10, 15.0, 22.5]
`,
        solution: R`def ses(series, alpha):
    out = []
    for x in series:
        out.append(x if not out else alpha * x + (1 - alpha) * out[-1])
    return out
`,
        tests: [
          { name: 'Basic', code: R`assert close(ses([10, 20, 30], 0.5), [10, 15, 22.5]), 'Expected [10, 15, 22.5]'` },
          { name: 'Alpha 1 follows the data', code: R`assert close(ses([3, 9, 1], 1.0), [3, 9, 1]), 'With alpha = 1 the output equals the input'` },
          { name: 'Alpha 0 never moves', code: R`assert close(ses([3, 9, 1], 0.0), [3, 3, 3]), 'With alpha = 0 the output stays at the first value'` },
          { name: 'Empty series', code: R`assert list(ses([], 0.3)) == [], 'An empty series gives an empty list'` }
        ]
      },
      {
        id: 'ts-mase', title: 'MASE: beat the naive forecast',
        prompt: `Write \`mase(actual, forecast, train)\`, the mean absolute scaled error:

- Numerator: mean absolute error of \`forecast\` against \`actual\`.
- Denominator: mean absolute error of the **naive** one-step forecast on the training series, that is the mean of \`|train[t] - train[t-1]|\`.

Below 1 means you beat the naive "tomorrow equals today" forecast.`,
        starter: R`def mase(actual, forecast, train):
    pass

print(mase([5, 6], [5, 7], [1, 2, 3, 4]))  # 0.5
`,
        solution: R`def mase(actual, forecast, train):
    mae = sum(abs(a - f) for a, f in zip(actual, forecast)) / len(actual)
    naive = sum(abs(train[t] - train[t - 1]) for t in range(1, len(train))) / (len(train) - 1)
    return mae / naive
`,
        tests: [
          { name: 'Better than naive', code: R`assert close(mase([5, 6], [5, 7], [1, 2, 3, 4]), 0.5), 'MAE 0.5 divided by naive MAE 1.0'` },
          { name: 'Perfect forecast', code: R`assert close(mase([5, 6], [5, 6], [1, 2, 3, 4]), 0.0), 'A perfect forecast scores 0'` },
          { name: 'Scale free', code: R`a = mase([5, 6], [5, 7], [1, 2, 3, 4]); b = mase([500, 600], [500, 700], [100, 200, 300, 400])
assert close(a, b), 'Multiplying everything by 100 must not change MASE'` },
          { name: 'Worse than naive', code: R`assert close(mase([10, 10], [14, 6], [0, 2, 0, 2]), 2.0), 'MAE 4 divided by naive MAE 2'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why is a random train/test split wrong for time series?', options: ['It is slower', 'The model trains on the future and is tested on the past, so the score is too optimistic', 'It uses too much memory', 'Random splits need more data'], answer: 1, why: 'Always split by time, and use rolling-origin (walk-forward) validation.', level: 'easy' },
      { q: 'A series whose mean and variance do not change over time is called…', options: ['Seasonal', 'Stationary', 'Cyclic', 'Autoregressive'], answer: 1, why: 'Many classical models assume it. Differencing and log transforms help achieve it.', level: 'easy' },
      { q: 'What should every forecasting model be compared with first?', options: ['A transformer', 'A naive baseline such as last value or last season', 'An LSTM', 'Nothing'], answer: 1, why: 'Many complex models fail to beat seasonal naive. MASE builds this comparison in.', level: 'easy' },
      { q: 'You compute a 7-day rolling mean feature that includes today, to predict today. This is…', options: ['Good practice', 'Leakage: the feature contains the target', 'Regularisation', 'Differencing'], answer: 1, why: 'Shift features so they use only data available before the prediction time.', level: 'medium' },
      { q: 'What is seasonality in a time series?', options: ['A long-term upward drift', 'Random variation', 'A pattern that repeats at a fixed period', 'A sudden outlier'], answer: 2, why: 'For example daily, weekly or yearly cycles.', level: 'easy' },
      { q: 'Hourly electricity data. Which lags are usually the most useful beyond the last few hours?', options: ['Lag 24 and lag 168 hours', 'A single lag of 1,000 hours', 'A randomly chosen lag', 'Lag 0'], answer: 0, why: 'They capture the daily and weekly cycles.', level: 'medium' },
      { q: 'A series is 3, 5, 9, 15. What is its second difference?', options: ['2, 4, 6', '4, 6', '1, 2', '2, 2'], answer: 3, why: 'First differences are 2, 4, 6; differencing again gives 2, 2.', level: 'medium' },
      { q: 'A promotion planned for next week is known today. May it be a feature in a forecast made today?', options: ['Yes, because it is known when the forecast is made', 'No, because it is in the future', 'Only during training', 'Only on weekdays'], answer: 0, why: 'Planned, known-in-advance covariates are legitimate inputs.', level: 'medium' },
      { q: 'A model forecasts 110, 95 and 120 for actuals of 100, 100 and 100. The naive MAE on the same data is 8. What is the MASE?', options: ['0.69', '1.46', '1.25', '11.67'], answer: 1, why: 'The model MAE is (10 + 5 + 20) / 3 = 11.67; divided by 8 it is 1.46.', level: 'hard' },
      { q: 'Nominal 90% prediction intervals contain only 60% of actuals in a backtest. What should you do?', options: ['Narrow them', 'Ignore it, because only the point forecast matters', 'Widen or recalibrate them, for example from backtest residual quantiles', 'Switch to MAPE'], answer: 2, why: 'The intervals are overconfident.', level: 'hard' },
      { q: 'You forecast log(y) and take exp of the prediction. Which statistic of y do you get, roughly?', options: ['The mean, exactly', 'The maximum', 'The mode of the noise', 'The median, which sits below the mean for skewed data'], answer: 3, why: 'Back-transforming the log-mean gives the median, so a bias correction may be needed.', level: 'hard' },
      { q: 'When is a sliding training window preferable to an expanding one in walk-forward validation?', options: ['When old data come from a different regime and should be dropped', 'When the dataset is tiny', 'Always', 'When there is no seasonality'], answer: 0, why: 'A sliding window forgets the outdated past.', level: 'hard' }
    ],
    interview: [
      { q: 'How do you validate a forecasting model?', level: 'hard', points: [['Split by time, never randomly', ['time', 'chronolog', 'not random', 'never random']], ['Rolling-origin / walk-forward validation', ['rolling', 'walk-forward', 'walk forward', 'expanding', 'backtest']], ['Compare with naive baselines', ['naive', 'baseline', 'seasonal']], ['Appropriate metrics: MAE, MASE, sMAPE', ['mae', 'mase', 'mape', 'rmse']], ['Match the horizon and avoid leakage in features', ['horizon', 'leak']]], model: 'I split by time: train on the past, validate on the future, never at random. To get a stable estimate I use rolling-origin evaluation, also called walk-forward or backtesting: train up to a cut-off, forecast the next horizon, move the cut-off forward and repeat. I evaluate at the horizon the business actually needs, with metrics such as MAE and MASE, and always against naive and seasonal-naive baselines. I check that every feature uses only information available at prediction time, including lags and rolling statistics, and I look at errors by horizon and by segment, not only the average.' },
      { q: 'Explain trend, seasonality and stationarity, and why they matter.', level: 'medium', points: [['Trend: long-term increase or decrease', ['trend', 'long-term', 'long term']], ['Seasonality: a repeating pattern with a fixed period', ['season', 'repeat', 'period', 'weekly', 'daily']], ['Stationary: statistical properties constant over time', ['stationar', 'constant']], ['Make stationary by differencing or transforms; or model components explicitly', ['differenc', 'log', 'decompos', 'transform']]], model: 'Trend is the long-term direction of the series. Seasonality is a pattern that repeats with a fixed period, such as daily, weekly or yearly. A series is stationary when its mean, variance and autocorrelation do not change over time. Classical models such as ARIMA assume stationarity, so we remove trend by differencing, stabilise variance with a log transform, and remove seasonality with seasonal differencing or decomposition. Even with machine-learning models these ideas guide feature design: lags at the seasonal period, calendar features and detrended targets.' },
      { q: 'When would you choose ARIMA, gradient-boosted trees, or a neural network for forecasting?', level: 'medium', points: [['Classical models: few series, little data, need interpretability', ['arima', 'ets', 'classical', 'little data', 'few series', 'interpret']], ['Boosted trees with lag features: many series, rich covariates', ['tree', 'boost', 'lightgbm', 'xgboost', 'lag feature', 'covariate']], ['Neural networks: large data, many related series, long or complex patterns', ['neural', 'lstm', 'transformer', 'deep', 'large', 'many series']], ['Start simple and compare by backtesting', ['baseline', 'simple', 'backtest', 'compare']]], model: 'For a single series or a few, with limited history, classical models such as exponential smoothing or ARIMA are strong, fast and interpretable. When I have many series with useful extra features, such as price, promotions or weather, gradient-boosted trees on lag and calendar features are usually the best trade-off and have won many forecasting competitions. Neural models, such as LSTMs, temporal convolution or transformers, pay off with large amounts of data, many related series trained together, long horizons or high-frequency sensor data. Whatever I choose, I start with a seasonal-naive baseline and let backtesting decide.' },
      { q: 'Why should you start with a naive or seasonal-naive baseline when forecasting?', level: 'easy', points: [['Naive repeats the last value; seasonal naive repeats the value from the same point in the last season', ['last value', 'repeat', 'same period', 'last season', 'same time', 'seasonal naive']], ['Gives a benchmark any model must beat', ['benchmark', 'beat', 'reference', 'compare', 'bar']], ['Strong baselines are surprisingly hard to beat on many series', ['hard to beat', 'strong', 'surprising', 'competitive', 'often']], ['Report skill as improvement over the baseline, for example MASE', ['mase', 'improvement', 'relative', 'skill', 'scaled']]], model: 'A naive forecast says tomorrow will equal today, and a seasonal naive forecast says next Monday will equal last Monday. They take seconds to build and give me a benchmark. If a complex model cannot beat them, it is not adding value, however sophisticated it looks. On many real series, especially with strong weekly or yearly patterns, a seasonal naive baseline is surprisingly hard to beat, which also protects me from evaluation mistakes. Comparing against it also helps me communicate: instead of saying the error is twelve units, I can say the model cuts the error by thirty percent versus the baseline. Metrics like MASE build exactly that comparison in, by scaling the error with the naive forecast’s error.' },
      { q: 'What are lag features and rolling statistics, and how do you build them safely?', level: 'easy', points: [['Lag features are earlier values of the target, such as yesterday and last week', ['lag', 'previous', 'earlier', 'yesterday', 'last week', 'shift']], ['Rolling statistics summarise a window, such as a seven-day mean', ['rolling', 'moving average', 'window', 'mean', 'std', 'summar']], ['Use only information available at prediction time, so shift before rolling', ['shift', 'leak', 'available', 'future', 'only past', 'prediction time']], ['Allows tabular models such as gradient boosting to forecast', ['tabular', 'gradient boost', 'xgboost', 'lightgbm', 'regression', 'supervised']]], model: 'Lag features are the target’s own past values placed as columns, like sales one day ago, seven days ago and fourteen days ago. Rolling statistics summarise a recent window, such as the seven-day average or the standard deviation over the last thirty days. Together they turn a forecasting problem into an ordinary supervised table, so I can use gradient-boosted trees or linear models. The danger is leakage. A rolling mean that includes the current day uses the answer to predict itself. So I shift the series first and compute the window on the shifted data, so every feature uses only information that would really be known at prediction time. I also remember that for multi-step forecasts, future lags are not yet known.' },
      { q: 'Which error metrics do you use for forecasts, and what is wrong with MAPE?', level: 'easy', points: [['MAE and RMSE are in the units of the series; RMSE penalises large errors', ['mae', 'rmse', 'units', 'penalis', 'penaliz', 'large']], ['MAPE is a percentage error, easy to communicate', ['mape', 'percentage', 'percent', 'relative']], ['MAPE breaks when actuals are zero or near zero and is asymmetric', ['zero', 'near zero', 'asymmetr', 'undefined', 'explode', 'infinite', 'over-forecast', 'under-forecast']], ['Alternatives: sMAPE, WAPE, or MASE which is scaled by a naive baseline', ['smape', 'wape', 'mase', 'scaled', 'weighted', 'baseline']]], model: 'For point forecasts I usually report MAE, the average absolute error in the series’ own units, and sometimes RMSE if large misses are especially costly. Many stakeholders prefer a percentage, so MAPE is popular, but it has real problems. If an actual value is zero, or very small, the percentage is undefined or enormous, so a handful of low-volume points can dominate. It is also asymmetric, because over-forecasting can produce errors above a hundred percent while under-forecasting is capped at a hundred. Better choices are WAPE, which divides total absolute error by total actuals, and MASE, which scales the error by that of a naive forecast, making it comparable across series. I choose the metric to match the business cost.' },
      { q: 'What is autocorrelation, and how do the ACF and PACF plots help you choose a model?', level: 'medium', points: [['Autocorrelation is correlation of a series with its own lagged values', ['lag', 'itself', 'own past', 'correlation', 'self']], ['ACF shows correlation at each lag; spikes reveal seasonality', ['acf', 'seasonal', 'spike', 'repeat', 'period']], ['PACF shows the direct effect of a lag after removing shorter lags', ['pacf', 'partial', 'direct', 'after removing', 'controlling']], ['Used to pick AR and MA orders in ARIMA, and to check residuals are white noise', ['arima', 'ar', 'ma', 'order', 'residual', 'white noise', 'p and q']]], model: 'Autocorrelation measures how strongly a series is correlated with its own past values at a given lag. The ACF plot shows that correlation for every lag, and regular spikes, for example at seven and fourteen for daily data, reveal seasonality. The partial autocorrelation plot shows the correlation at a lag after removing the effect of the shorter lags, so it isolates the direct link. Classically, a sharp cutoff in the PACF suggests the order of the autoregressive part of an ARIMA model, and a sharp cutoff in the ACF suggests the moving-average order. They are guides, not rules, and I usually confirm with an information criterion and validation. After fitting, I check the ACF of the residuals: if it still shows structure, the model has missed something.' },
      { q: 'How do you deal with missing timestamps, irregular sampling and gaps in a time series?', level: 'medium', points: [['Decide whether a gap is a missing record or a true zero', ['missing', 'zero', 'no event', 'true zero', 'not recorded', 'sensor']], ['Reindex to a regular frequency with resampling', ['resample', 'reindex', 'regular', 'frequency', 'fixed interval']], ['Fill with forward fill, interpolation or model-based imputation, only using past values for forecasting', ['forward fill', 'interpol', 'impute', 'past', 'leak', 'ffill']], ['Flag imputed points and aggregate irregular events to a fixed interval', ['flag', 'indicator', 'aggregate', 'irregular', 'bucket', 'mask']]], model: 'First I work out what the gap means. For sales, a missing day may be a true zero, while for a sensor it is a missing reading, and those need different handling. Then I put the data on a regular grid with resampling or reindexing to a fixed frequency, aggregating irregular events into hourly or daily buckets. For gaps I choose the filling method by purpose. Forward fill suits slowly changing values, interpolation suits smooth signals, and seasonal or model-based imputation suits long gaps. For forecasting I make sure the fill uses only past values, because interpolating between the past and the future leaks information. I often add a flag column marking imputed points, and some models can handle masks directly.' },
      { q: 'You need to forecast demand for thousands of products, many with short histories. How do you approach it?', level: 'hard', points: [['Global model trained across all series, with series identifiers or attributes as features', ['global', 'across series', 'all series', 'one model', 'shared', 'pooled', 'identifier']], ['Compare with local per-series models, which do not share information', ['local', 'per-series', 'per series', 'individual', 'arima', 'ets']], ['Handle cold starts using product attributes, hierarchies or similar items', ['cold start', 'new product', 'attributes', 'hierarch', 'similar', 'category']], ['Hierarchical reconciliation and aggregation so totals agree', ['hierarch', 'reconcil', 'aggregate', 'bottom-up', 'top-down', 'total']], ['Intermittent demand needs special handling, and evaluation by series group', ['intermittent', 'sparse', 'croston', 'zero', 'segment', 'group', 'scaled']]], model: 'With thousands of series, fitting a separate model to each is laborious and weak for short histories. I prefer a global model, for example gradient boosting or a neural forecaster, trained on all series together with lag features, calendar features and product attributes such as category, price and store. It learns shared patterns, like seasonality and promotion effects, and borrows strength across products. Classical local models remain a useful baseline for long, stable series. For cold starts, new items rely on attributes and similar products, since there is no history. If totals matter, I forecast on a hierarchy and reconcile so product, category and overall forecasts agree. Sparse items with many zero days need intermittent-demand methods or probabilistic output, and I evaluate by segment with scaled metrics.' },
      { q: 'Forecast accuracy drops sharply after a holiday period or a business change. What could be happening and what do you do?', level: 'hard', points: [['Structural break or regime change: the pattern differs from training data', ['structural break', 'regime', 'change point', 'changepoint', 'shift', 'level shift']], ['Holiday and event effects missing from features', ['holiday', 'event', 'promotion', 'calendar', 'feature', 'moving holiday']], ['Detect with residual monitoring, drift tests and change-point detection', ['residual', 'monitor', 'drift', 'change-point', 'detect', 'cusum', 'alert']], ['Respond by adding event regressors, retraining on recent data or weighting recent observations', ['regressor', 'retrain', 'recent', 'weight', 'window', 'adapt', 'refit']], ['Use prediction intervals, and a fallback baseline or human override during the transition', ['interval', 'uncertain', 'fallback', 'override', 'baseline', 'probabilistic']]], model: 'I would first look at the residuals over time to see whether the error rose at a particular date and for which series. A sudden change suggests a structural break, such as a new pricing policy, a store opening, or behaviour shifting after the event, so history is no longer representative. Another cause is that the model does not know about the holiday: moving holidays, promotions and special events need explicit calendar features. I would add those regressors, and then adapt to the new regime by retraining on recent data, down-weighting older observations, or using a shorter training window, while checking that I am not just chasing noise. Meanwhile I widen the prediction intervals, set up monitoring and change-point alerts, and use a simple baseline fallback.' }
    ]
  },

  {
    id: 'rnn', title: 'RNN, LSTM and GRU', tracks: ['mle', 'nlp', 'auto', 'ds'],
    tasks: [
      {
        id: 'rnn-forward', title: 'RNN forward pass',
        prompt: `Write \`rnn_forward(xs, h0, Wx, Wh, b)\` for a vanilla RNN:

\`h_t = tanh(x_t @ Wx + h_{t-1} @ Wh + b)\`

- \`xs\`: array \`(T, input_dim)\`, \`h0\`: \`(hidden,)\`, \`Wx\`: \`(input_dim, hidden)\`, \`Wh\`: \`(hidden, hidden)\`, \`b\`: \`(hidden,)\`.
- Return all hidden states as an array of shape \`(T, hidden)\`.`,
        starter: R`import numpy as np

def rnn_forward(xs, h0, Wx, Wh, b):
    pass
`,
        solution: R`import numpy as np

def rnn_forward(xs, h0, Wx, Wh, b):
    xs, h = np.asarray(xs, float), np.asarray(h0, float)
    Wx, Wh, b = np.asarray(Wx, float), np.asarray(Wh, float), np.asarray(b, float)
    out = []
    for x in xs:
        h = np.tanh(x @ Wx + h @ Wh + b)
        out.append(h)
    return np.array(out)
`,
        tests: [
          { name: 'No recurrence', code: R`import math
hs = rnn_forward([[0], [1]], [0], [[1]], [[0]], [0])
assert close(hs, [[0], [math.tanh(1)]]), 'With Wh = 0 each state depends only on its input'` },
          { name: 'State carries forward', code: R`import math
hs = rnn_forward([[1], [0]], [0], [[1]], [[1]], [0])
assert close(hs, [[math.tanh(1)], [math.tanh(math.tanh(1))]]), 'The second state must use the first state through Wh'` },
          { name: 'Initial state is used', code: R`import math
hs = rnn_forward([[0]], [2], [[1]], [[0.5]], [0.1])
assert close(hs, [[math.tanh(1.1)]]), 'h1 = tanh(0*1 + 2*0.5 + 0.1)'` },
          { name: 'Shapes', code: R`import numpy as np
rng = np.random.default_rng(0)
hs = rnn_forward(rng.normal(size=(5, 3)), np.zeros(4), rng.normal(size=(3, 4)), rng.normal(size=(4, 4)), np.zeros(4))
assert np.asarray(hs).shape == (5, 4) and np.all(np.abs(hs) <= 1), 'Output should be (T, hidden) with values in [-1, 1]'` }
        ]
      },
      {
        id: 'rnn-lstm', title: 'One LSTM step',
        prompt: `Write \`lstm_step(x, h, c, W, U, b)\` for a hidden size \`H\`.

1. \`z = x @ W + h @ U + b\`, a vector of length \`4H\`.
2. Split \`z\` into four parts in this order: input gate \`i\`, forget gate \`f\`, candidate \`g\`, output gate \`o\`.
3. \`i, f, o\` use sigmoid; \`g\` uses tanh.
4. \`c_new = f * c + i * g\`, \`h_new = o * tanh(c_new)\`.

Return \`(h_new, c_new)\`.`,
        starter: R`import numpy as np

def lstm_step(x, h, c, W, U, b):
    pass
`,
        solution: R`import numpy as np

def lstm_step(x, h, c, W, U, b):
    x, h, c = np.asarray(x, float), np.asarray(h, float), np.asarray(c, float)
    z = x @ np.asarray(W, float) + h @ np.asarray(U, float) + np.asarray(b, float)
    H = h.shape[0]
    sig = lambda v: 1 / (1 + np.exp(-v))
    i, f, g, o = sig(z[:H]), sig(z[H:2 * H]), np.tanh(z[2 * H:3 * H]), sig(z[3 * H:])
    c_new = f * c + i * g
    return o * np.tanh(c_new), c_new
`,
        tests: [
          { name: 'All-zero weights', code: R`import math, numpy as np
h, c = lstm_step([1.0], [0.0], [2.0], np.zeros((1, 4)), np.zeros((1, 4)), np.zeros(4))
assert close(c, [1.0]) and close(h, [0.5 * math.tanh(1.0)]), 'Gates are 0.5 and the candidate is 0: c = 0.5*2 = 1, h = 0.5*tanh(1)'` },
          { name: 'Open forget gate keeps the memory', code: R`import numpy as np
h, c = lstm_step([0.0], [0.0], [3.0], np.zeros((1, 4)), np.zeros((1, 4)), np.array([-50.0, 50.0, 0.0, 0.0]))
assert close(c, [3.0], 1e-6), 'Forget gate near 1 and input gate near 0 should leave c unchanged'` },
          { name: 'Input gate writes the candidate', code: R`import math, numpy as np
h, c = lstm_step([1.0], [0.0], [5.0], np.array([[0.0, 0.0, 2.0, 0.0]]), np.zeros((1, 4)), np.array([50.0, -50.0, 0.0, 50.0]))
assert close(c, [math.tanh(2.0)], 1e-6) and close(h, [math.tanh(math.tanh(2.0))], 1e-6), 'Forget closed, input open: c = tanh(2); output open: h = tanh(c)'` },
          { name: 'Hidden size 2', code: R`import numpy as np
rng = np.random.default_rng(1)
W, U, b = rng.normal(size=(3, 8)), rng.normal(size=(2, 8)), rng.normal(size=8)
x, h0, c0 = rng.normal(size=3), rng.normal(size=2), rng.normal(size=2)
z = x @ W + h0 @ U + b; s = lambda v: 1 / (1 + np.exp(-v))
ce = s(z[2:4]) * c0 + s(z[0:2]) * np.tanh(z[4:6]); he = s(z[6:8]) * np.tanh(ce)
h, c = lstm_step(x, h0, c0, W, U, b)
assert close(c, ce, 1e-9) and close(h, he, 1e-9), 'Check the gate order i, f, g, o and the slice positions'` }
        ]
      }
    ],
    quiz: [
      { q: 'What problem do LSTMs solve compared with vanilla RNNs?', options: ['They train without data', 'Vanishing gradients over long sequences, by using a gated cell state', 'They remove the need for backpropagation', 'They are always smaller'], answer: 1, why: 'The cell state is updated additively, so gradients can flow across many steps.', level: 'easy' },
      { q: 'How does a GRU differ from an LSTM?', options: ['It has no gates', 'It merges cell and hidden state and uses two gates, so it has fewer parameters', 'It is bidirectional by definition', 'It cannot process sequences'], answer: 1, why: 'Update and reset gates. Performance is usually similar, with less compute.', level: 'medium' },
      { q: 'Exploding gradients in an RNN are commonly handled by…', options: ['Adding layers', 'Gradient clipping', 'Removing the bias', 'A larger learning rate'], answer: 1, why: 'Clip the gradient norm to a maximum value.', level: 'easy' },
      { q: 'Why did transformers largely replace RNNs for language?', options: ['RNNs cannot read text', 'They process all positions in parallel and connect distant tokens directly', 'Transformers need less data', 'RNNs have no parameters'], answer: 1, why: 'RNNs are still useful for streaming and small embedded models.', level: 'medium' },
      { q: 'What is the hidden state of an RNN?', options: ['The loss value', 'The batch size', 'The label', 'A vector summarising the sequence so far'], answer: 3, why: 'It is the network’s memory.', level: 'easy' },
      { q: 'Which LSTM gate decides what to erase from the cell state?', options: ['Output gate', 'Input gate', 'Forget gate', 'Reset gate'], answer: 2, why: 'A value near 0 erases, near 1 keeps.', level: 'easy' },
      { q: 'Why must the hidden state be carried between calls when streaming sensor data one sample at a time?', options: ['It is the only memory of earlier samples', 'It saves disk space', 'It resets the loss', 'It sets the batch size'], answer: 0, why: 'Without it every call starts blind.', level: 'medium' },
      { q: 'A review classifier uses right-padded batches and reads the output at the last position. What goes wrong?', options: ['Nothing, since padding helps', 'For shorter reviews it reads a padded position, not the last real word', 'The output has the wrong data type', 'The model ignores the first word'], answer: 1, why: 'Index by true length or pack the sequences.', level: 'medium' },
      { q: 'How many parameters does nn.LSTM(input_size=16, hidden_size=32) have in PyTorch (two bias vectors)?', options: ['6,272', '4,800', '6,400', '5,120'], answer: 2, why: '4 × 32 × (16 + 32 + 2) = 6,400.', level: 'hard' },
      { q: 'A gradient is multiplied by 0.9 at each of 50 steps. About how much of it remains?', options: ['About 10%', 'About 45%', 'About 0.0001%', 'About 0.5%'], answer: 3, why: '0.9^50 ≈ 0.005.', level: 'hard' },
      { q: 'Why initialise the LSTM forget-gate bias to about 1?', options: ['So the cell retains memory at the start and gradients flow across steps', 'To make the outputs larger', 'To speed up softmax', 'To reduce the number of parameters'], answer: 0, why: 'A forget gate near 1 keeps the cell state intact early in training.', level: 'hard' },
      { q: 'What is the main downside of teacher forcing?', options: ['It uses more memory', 'It cannot be batched', 'Exposure bias: the model never sees its own mistakes in training', 'It needs labels at inference'], answer: 2, why: 'Train and inference conditions differ.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain how an LSTM works.', level: 'medium', points: [['A cell state carries long-term memory', ['cell state', 'memory', 'long-term', 'long term']], ['Forget gate decides what to erase', ['forget']], ['Input gate decides what to write', ['input gate', 'write', 'candidate']], ['Output gate decides what to expose as the hidden state', ['output gate', 'hidden state']], ['Additive update lets gradients flow, reducing vanishing gradients', ['additive', 'vanish', 'gradient']]], model: 'An LSTM keeps two states: a hidden state and a cell state that acts as long-term memory. At each step three gates, each a sigmoid layer over the current input and the previous hidden state, control the memory. The forget gate decides which parts of the cell state to erase. The input gate decides how much of a new candidate value, computed with tanh, to write. The cell state becomes the forgotten old state plus the gated candidate. The output gate then decides how much of the cell state to expose as the new hidden state. Because the cell state is updated by addition and not by repeated multiplication through a squashing function, gradients survive across many time steps.' },
      { q: 'Why do vanilla RNNs struggle with long sequences?', level: 'medium', points: [['Backpropagation through time multiplies gradients at every step', ['backpropagation through time', 'bptt', 'multipl', 'every step', 'each step']], ['Gradients vanish or explode', ['vanish', 'explod']], ['Early inputs are effectively forgotten', ['forget', 'early', 'long-range', 'long range', 'dependenc']], ['Fixes: gates (LSTM/GRU), clipping, attention', ['lstm', 'gru', 'gate', 'clip', 'attention']]], model: 'An RNN applies the same weights at every time step, so backpropagation through time multiplies the gradient by the recurrent weight matrix and the activation derivative once per step. Over a long sequence that product shrinks toward zero or grows without bound: vanishing or exploding gradients. With vanishing gradients the network cannot learn dependencies between distant positions. Exploding gradients are handled with clipping. Vanishing gradients are addressed by gated architectures such as LSTM and GRU, and ultimately by attention, which connects any two positions directly.' },
      { q: 'When would you still choose an RNN over a transformer today?', level: 'hard', points: [['Streaming or online inference, one step at a time', ['stream', 'online', 'one step', 'real-time', 'real time']], ['Small models for embedded or low-power devices', ['embedded', 'small', 'edge', 'low-power', 'microcontroller', 'memory']], ['Limited data', ['little data', 'limited data', 'small data']], ['Constant memory per step, no growing context', ['constant', 'state', 'context']]], model: 'RNNs remain a good choice when data arrives as a stream and I must produce an output at every step with constant memory and compute, because the hidden state summarises the past without re-reading it. They also fit small embedded targets, where a GRU with a few thousand parameters can run on a microcontroller for tasks like sensor signal classification or keyword spotting. With limited data, their stronger sequential bias can help. For long contexts, large datasets and parallel training on GPUs, I would choose a transformer.' },
      { q: 'What is a recurrent neural network, and what is the hidden state?', level: 'easy', points: [['Processes a sequence one step at a time', ['one step', 'step by step', 'sequential', 'time step', 'one at a time']], ['Hidden state carries a summary of what has been seen so far', ['hidden state', 'memory', 'summary', 'carry', 'previous']], ['Same weights are reused at every step', ['same weights', 'shared', 'reuse', 'weight sharing', 'parameter']], ['Can handle variable-length inputs', ['variable', 'length', 'any length', 'different length']]], model: 'A recurrent neural network reads a sequence one element at a time. At each step it takes the current input and the previous hidden state, and combines them to produce a new hidden state and, optionally, an output. The hidden state is the network’s memory: a vector that summarises what it has seen so far. Importantly, the same weights are reused at every time step, so the model has the same number of parameters whether the sequence has ten steps or a thousand, and it naturally handles variable-length inputs. That makes it suitable for text, audio and sensor data. The drawbacks are that steps must run in order, so it is slow to train in parallel, and plain RNNs forget information from far back.' },
      { q: 'What is the difference between sequence-to-one, one-to-sequence and sequence-to-sequence tasks? Give examples.', level: 'easy', points: [['Sequence-to-one: read a sequence and output one label or value, like sentiment classification', ['sequence-to-one', 'many to one', 'many-to-one', 'sentiment', 'classification', 'one output']], ['One-to-sequence: generate a sequence from a single input, like image captioning', ['one-to-sequence', 'one to many', 'one-to-many', 'caption', 'generate', 'music']], ['Sequence-to-sequence: map an input sequence to an output sequence, like translation', ['sequence-to-sequence', 'seq2seq', 'translation', 'many to many', 'many-to-many', 'encoder']], ['Aligned versus unaligned outputs, such as tagging versus translation', ['aligned', 'tagging', 'per step', 'length differ', 'different length', 'speech']]], model: 'It describes the shape of inputs and outputs. Sequence-to-one reads a whole sequence and produces a single result, for example classifying the sentiment of a review or predicting whether a machine will fail from a window of sensor readings. One-to-sequence starts from a single input and produces a sequence, such as generating a caption from an image or music from a seed. Sequence-to-sequence maps an input sequence to an output sequence, as in translation or summarisation, where the lengths can differ and an encoder-decoder design is typical. There is also the aligned version, where the model outputs a label at every step, as in part-of-speech tagging. Knowing the shape tells me which architecture and which loss to use.' },
      { q: 'How do you handle variable-length sequences in a batch?', level: 'easy', points: [['Pad shorter sequences to the same length', ['pad', 'padding', 'same length', 'fill', 'zeros']], ['Use a mask so padded positions are ignored in the loss and attention', ['mask', 'ignore', 'loss', 'padding mask', 'attention']], ['Pack the sequences, or bucket by similar length to waste less compute', ['pack', 'bucket', 'sort', 'similar length', 'efficien']], ['Truncate very long sequences or split into windows', ['truncate', 'window', 'chunk', 'cut', 'max length']]], model: 'Batched tensors need a rectangular shape, so I pad the shorter sequences with a special value up to the length of the longest one in the batch. But padding must not influence the result, so I use a mask: the loss ignores padded positions, and in attention models the padded tokens are masked out. For recurrent networks, packing padded sequences lets the framework skip the padding when running the cell. To waste less computation, I group sequences of similar length into the same batch, called bucketing. Very long sequences are truncated to a maximum length or split into overlapping windows. I also decide whether to pad at the end or the start, because for some recurrent models the last positions matter most.' },
      { q: 'How does a GRU differ from an LSTM, and how do you choose between them?', level: 'medium', points: [['GRU has two gates, update and reset, while LSTM has input, forget and output gates plus a cell state', ['two gates', 'update', 'reset', 'three gates', 'forget', 'cell state', 'input gate']], ['GRU has fewer parameters and trains faster', ['fewer', 'faster', 'simpler', 'lighter', 'parameters']], ['Performance is usually similar', ['similar', 'comparable', 'no clear', 'depends', 'empirical']], ['Try both on validation data; LSTM may suit longer dependencies and more data', ['validation', 'try both', 'longer', 'tune', 'data']]], model: 'Both are gated recurrent units designed to keep gradients flowing across many steps. An LSTM has a separate cell state and three gates, input, forget and output, that control what is written, kept and exposed. A GRU simplifies this: it merges the cell and hidden state and uses just two gates, an update gate that decides how much of the old state to keep, and a reset gate that decides how much of the past to use when computing the new candidate. So a GRU has fewer parameters, trains a bit faster and is easier to fit on small datasets. In published comparisons their accuracy is usually close, so I treat it as a hyperparameter: I try both on a validation set, and start with a GRU when speed or data is limited.' },
      { q: 'What is truncated backpropagation through time, and why is it used?', level: 'medium', points: [['Backpropagation through time unrolls the network over the sequence and backpropagates through every step', ['unroll', 'through time', 'every step', 'bptt', 'backpropagat']], ['For long sequences this is costly in memory and compute and gradients vanish or explode', ['costly', 'memory', 'long sequences', 'vanish', 'explod', 'expensive']], ['Truncated version splits the sequence into chunks and backpropagates only within each chunk', ['truncat', 'chunk', 'segment', 'window', 'limited', 'k steps']], ['Hidden state is carried across chunks, but gradients are cut; gradient clipping helps', ['carry', 'detach', 'cut', 'clip', 'stateful', 'pass the state']]], model: 'To train an RNN, I unroll it across the time steps and backpropagate through all of them, which is called backpropagation through time. For a sequence of thousands of steps that needs a lot of memory, is slow, and makes vanishing or exploding gradients far worse. Truncated BPTT limits this by cutting the sequence into chunks of, say, a hundred steps. I run forward and backward within each chunk, update the weights, and then move on to the next chunk, carrying the hidden state forward but detaching it from the graph so gradients do not flow back across the boundary. The cost is that the network cannot learn dependencies longer than the chunk through gradients. I combine it with gradient clipping to keep updates stable.' },
      { q: 'What are teacher forcing and exposure bias in sequence generation, and how do you mitigate them?', level: 'hard', points: [['Teacher forcing feeds the true previous token during training instead of the model’s own prediction', ['teacher forcing', 'true previous', 'ground truth', 'correct token', 'feed the']], ['It speeds up and stabilises training', ['faster', 'stable', 'stabil', 'converge', 'parallel']], ['At inference the model sees its own predictions, a mismatch called exposure bias', ['exposure bias', 'mismatch', 'own prediction', 'own output', 'distribution shift', 'inference']], ['Errors compound over long outputs', ['compound', 'accumulate', 'drift', 'snowball', 'error propagation']], ['Mitigations: scheduled sampling, beam search, sequence-level training, reinforcement learning', ['scheduled sampling', 'beam', 'sequence-level', 'reinforcement', 'rl', 'minimum risk']]], model: 'With teacher forcing, during training I feed the decoder the correct previous token at every step rather than its own prediction. This makes training faster and more stable, because an early mistake does not derail all later steps, and it allows parallel computation in transformers. The problem is exposure bias: at inference time the model has to consume its own outputs, which it has never seen during training, so one mistake can push it into territory it does not know and errors compound over a long output. Mitigations include scheduled sampling, which gradually replaces some true tokens with the model’s predictions during training, using beam search to explore better sequences, and sequence-level training objectives, including reinforcement learning on a metric. Evaluating with free-running generation is essential.' },
      { q: 'Explain how attention fixed the bottleneck in encoder-decoder RNN models.', level: 'hard', points: [['Plain seq2seq compresses the whole input into one fixed-size vector', ['fixed-size', 'fixed size', 'single vector', 'bottleneck', 'compress', 'context vector']], ['Long inputs lose information, and quality drops with length', ['long', 'lose', 'forget', 'drop', 'degrade']], ['Attention lets the decoder look at all encoder states at each step with learned weights', ['all encoder', 'every encoder', 'look back', 'weights', 'alignment', 'each step', 'softmax']], ['Gives better accuracy on long sequences and interpretable alignments, and led to the transformer', ['long sequences', 'interpret', 'alignment', 'transformer', 'self-attention', 'parallel']]], model: 'In the original encoder-decoder design the encoder reads the entire input and squeezes it into a single fixed-size vector, the final hidden state, which the decoder must use to generate the whole output. That is a severe bottleneck: the longer the input, the more information is lost, and translation quality drops for long sentences. Attention removes the bottleneck. The encoder keeps all its hidden states, and at every decoding step the decoder computes a score between its current state and each encoder state, applies softmax to get weights, and takes the weighted sum as a context vector for that step. So the decoder can look back at the most relevant input words each time. This improved accuracy on long sequences, gave interpretable alignments, and inspired the transformer.' }
    ]
  },

  {
    id: 'ts-transformers', title: 'Transformers for time series', tracks: ['mle', 'ds', 'auto', 'genai'],
    tasks: [
      {
        id: 'tst-mask', title: 'Causal mask',
        prompt: `A forecasting model must not look at the future. Write \`causal_mask(n)\` returning an \`n × n\` matrix (list of lists or array) where entry \`[i][j]\` is \`1\` if position \`i\` may attend to position \`j\` (that is, \`j <= i\`) and \`0\` otherwise.`,
        starter: R`def causal_mask(n):
    pass

print(causal_mask(3))  # [[1, 0, 0], [1, 1, 0], [1, 1, 1]]
`,
        solution: R`def causal_mask(n):
    return [[1 if j <= i else 0 for j in range(n)] for i in range(n)]
`,
        tests: [
          { name: 'Size 3', code: R`assert close(causal_mask(3), [[1, 0, 0], [1, 1, 0], [1, 1, 1]]), 'Expected a lower-triangular matrix of ones'` },
          { name: 'Size 1', code: R`assert close(causal_mask(1), [[1]]), 'A single position attends to itself'` },
          { name: 'No future access', code: R`m = causal_mask(6)
assert all(m[i][j] == 0 for i in range(6) for j in range(i + 1, 6)) and all(m[i][j] == 1 for i in range(6) for j in range(i + 1)), 'Entries above the diagonal must be 0, the rest 1'` }
        ]
      },
      {
        id: 'tst-patch', title: 'Patch a series',
        prompt: `PatchTST-style models split a long series into short patches and treat each patch as a token. Write \`patchify(series, patch_len, stride)\` returning the list of patches (each a list). Drop an incomplete patch at the end.`,
        starter: R`def patchify(series, patch_len, stride):
    pass

print(patchify(list(range(10)), 4, 2))
`,
        solution: R`def patchify(series, patch_len, stride):
    series = list(series)
    return [series[i:i + patch_len] for i in range(0, len(series) - patch_len + 1, stride)]
`,
        tests: [
          { name: 'Overlapping patches', code: R`assert [list(p) for p in patchify(list(range(10)), 4, 2)] == [[0, 1, 2, 3], [2, 3, 4, 5], [4, 5, 6, 7], [6, 7, 8, 9]], 'Stride 2 with length 4 gives four overlapping patches'` },
          { name: 'Non-overlapping, tail dropped', code: R`assert [list(p) for p in patchify(list(range(5)), 2, 2)] == [[0, 1], [2, 3]], 'The incomplete last patch is dropped'` },
          { name: 'Too short', code: R`assert list(patchify([1, 2], 4, 1)) == [], 'A series shorter than one patch gives no patches'` },
          { name: 'Token count', code: R`assert len(patchify(list(range(512)), 16, 8)) == 63, '512 points with patches of 16 and stride 8 give 63 tokens'` }
        ]
      },
      {
        id: 'tst-time', title: 'Cyclical time features',
        prompt: `Hour 23 and hour 0 are neighbours, but as plain numbers they are far apart. Encode them on a circle.

Write \`time_features(hour, weekday)\` returning the list
\`[sin(2π·hour/24), cos(2π·hour/24), sin(2π·weekday/7), cos(2π·weekday/7)]\`.`,
        starter: R`import math

def time_features(hour, weekday):
    pass

print(time_features(6, 0))  # [1.0, ~0, 0.0, 1.0]
`,
        solution: R`import math

def time_features(hour, weekday):
    a, b = 2 * math.pi * hour / 24, 2 * math.pi * weekday / 7
    return [math.sin(a), math.cos(a), math.sin(b), math.cos(b)]
`,
        tests: [
          { name: 'Midnight on day 0', code: R`assert close(time_features(0, 0), [0, 1, 0, 1]), 'Angle 0 gives sin 0 and cos 1'` },
          { name: 'Six in the morning', code: R`assert close(time_features(6, 0), [1, 0, 0, 1], 1e-9), 'A quarter of the day: sin 1, cos 0'` },
          { name: 'Hour 23 is close to hour 0', code: R`import math
a, b, c = time_features(23, 0), time_features(0, 0), time_features(12, 0)
assert math.dist(a, b) < 0.3 < math.dist(c, b), 'On the circle, 23:00 must be near 00:00 and 12:00 far from it'` },
          { name: 'Weekday', code: R`import math
assert close(time_features(0, 3)[2:], [math.sin(6 * math.pi / 7), math.cos(6 * math.pi / 7)]), 'Weekday uses a period of 7'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why split a time series into patches before a transformer?', options: ['To add noise', 'Fewer tokens, so attention is cheaper, and each token carries local shape', 'To remove seasonality', 'Patches are required by PyTorch'], answer: 1, why: 'A single time step carries little meaning; a patch is like a "word".', level: 'easy' },
      { q: 'What stops a forecasting transformer from seeing the future during training?', options: ['Dropout', 'A causal (look-ahead) mask, or an encoder that only sees the history', 'Batch norm', 'A smaller learning rate'], answer: 1, why: 'Without it the model simply copies the answer.', level: 'medium' },
      { q: 'A simple linear model beat several transformer forecasters on standard benchmarks. The lesson?', options: ['Transformers never work', 'Always compare with strong simple baselines; architecture alone does not guarantee gains', 'Linear models cannot forecast', 'Benchmarks are useless'], answer: 1, why: 'This result (DLinear) pushed the field toward patching and better evaluation.', level: 'medium' },
      { q: 'What is a time-series foundation model?', options: ['A model trained on one series', 'A model pre-trained on many series from many domains that can forecast new series zero-shot', 'A database', 'An ARIMA variant'], answer: 1, why: 'Examples include Chronos, TimesFM and Moirai. Evaluate them against your own baselines.', level: 'easy' },
      { q: 'What does a positional encoding give a time-series transformer?', options: ['The class label', 'Information about where each token sits in time', 'The patch size', 'The loss'], answer: 1, why: 'Attention alone is order-blind.', level: 'easy' },
      { q: 'Why encode hour of day with sine and cosine?', options: ['To compress the data', 'To remove the trend', 'To speed up training', 'So that hour 23 and hour 0 end up as neighbours'], answer: 3, why: 'Time lives on a circle.', level: 'easy' },
      { q: 'A 336-point window is cut into patches of length 16 with stride 8. How many tokens?', options: ['21', '41', '42', '336'], answer: 1, why: '(336 - 16) / 8 + 1 = 41.', level: 'medium' },
      { q: 'Series levels drift between periods. Which technique helps a transformer cope?', options: ['A larger vocabulary', 'Removing positional encodings', 'Normalising each input window and reversing it on the output', 'A higher learning rate'], answer: 2, why: 'Instance normalisation separates the shape from the level.', level: 'medium' },
      { q: 'Why can a channel-independent model beat a channel-mixing model on a dataset with 321 variables and limited history?', options: ['Shared weights see 321 times more sequences and avoid spurious cross-variable relations', 'It adds attention across variables', 'It has more parameters', 'It needs no normalisation'], answer: 0, why: 'Fewer assumptions mean less overfitting.', level: 'hard' },
      { q: '30 tokens of dimension 32 are flattened and mapped by one linear layer (with bias) to a 48-step forecast. How many parameters does this head have?', options: ['46,080', '46,128', '1,440', '46,176'], answer: 1, why: '(30 × 32) × 48 + 48 = 46,128.', level: 'hard' },
      { q: 'A transformer is 2% better than seasonal naive on average, but worse on 40% of the series. What is the best next step?', options: ['Ship it, because the average is better', 'Discard it', 'Analyse by segment, check significance across windows, and consider routing or ensembling', 'Train for more epochs'], answer: 2, why: 'Averages hide segments where the model loses.', level: 'hard' },
      { q: 'Validation windows with stride 1 are drawn at random from the same period as the training windows. Why is the score inflated?', options: ['Stride 1 hides the trend', 'Random sampling removes noise', 'It forces a causal mask', 'Neighbouring windows share almost all values, so validation windows are near copies of training windows'], answer: 3, why: 'Split by time and leave a gap.', level: 'hard' }
    ],
    interview: [
      { q: 'How do you adapt a transformer to time-series forecasting?', level: 'hard', points: [['Tokenise: patches or time steps embedded as vectors', ['patch', 'token', 'embed']], ['Positional and time features', ['position', 'time feature', 'calendar', 'timestamp']], ['Prevent look-ahead: causal mask or encoder on history only', ['causal', 'mask', 'look-ahead', 'future', 'history']], ['Normalise each series (for example per-window)', ['normali', 'scal', 'instance']], ['Output the whole horizon or autoregress; compare with baselines', ['horizon', 'autoregress', 'baseline', 'direct']]], model: 'First I decide what a token is. Single time steps carry little information and make sequences long, so I group consecutive points into patches and embed each patch as one token, as in PatchTST. I add positional encodings and, where useful, calendar features encoded cyclically. To avoid leaking the future I either use an encoder that sees only the history window and predicts the full horizon directly, or a decoder with a causal mask. I normalise each input window, because scale and level shift over time. I train across many related series, and I always benchmark against seasonal-naive, a linear model and gradient-boosted trees.' },
      { q: 'What are the weaknesses of transformers for time series?', level: 'medium', points: [['Need a lot of data; overfit small datasets', ['data', 'overfit']], ['Quadratic cost with sequence length', ['quadratic', 'cost', 'memory', 'long sequence']], ['Attention is permutation-invariant: order must be injected', ['order', 'permutation', 'position']], ['Often not better than simple baselines', ['baseline', 'linear', 'simple']], ['Distribution shift and non-stationarity', ['shift', 'stationar', 'drift']]], model: 'They are data-hungry and overfit when there are few series or a short history. Self-attention costs grow quadratically with sequence length, which matters for high-frequency sensor data, although patching and sparse attention help. Attention has no built-in notion of order, which is the essence of a time series, so everything depends on positional information. Several studies showed that simple linear models match or beat complex transformer forecasters on common benchmarks. And real series are non-stationary, so a model trained on one regime can fail when the level or behaviour shifts. I use them when there is enough data and I can show a gain over simple baselines.' },
      { q: 'How would you detect anomalies in multivariate sensor data?', level: 'hard', points: [['Define what an anomaly is, with domain experts', ['define', 'domain', 'expert', 'what counts']], ['Baselines: thresholds and statistics per signal', ['threshold', 'statistic', 'z-score', 'baseline', 'rule']], ['Model-based: forecast or reconstruct and score the residual', ['residual', 'reconstruct', 'forecast', 'autoencoder', 'prediction error']], ['Few labels: evaluate carefully, precision and recall on events', ['label', 'precision', 'recall', 'evaluat']], ['Deployment: thresholds, false-alarm rate, drift', ['false alarm', 'false positive', 'drift', 'deploy', 'alert']]], model: 'I start by agreeing with domain experts what counts as an anomaly and what it costs to miss one or raise a false alarm. Simple per-signal checks, such as range limits and rolling z-scores, catch a lot and are easy to explain. For subtler, multivariate behaviour I train a model on normal data to forecast the next values or reconstruct the window, for example an autoencoder, an LSTM or a transformer, and use the residual as an anomaly score. Labels are scarce, so I evaluate on known events with event-level precision and recall, and review top-scoring windows with experts. In deployment I set thresholds to meet a false-alarm budget, smooth the score to avoid flicker, and monitor for drift.' },
      { q: 'What are the lookback window and the forecast horizon?', level: 'easy', points: [['Lookback window is the amount of recent history given to the model as input', ['lookback', 'look-back', 'history', 'input window', 'context length', 'past']], ['Horizon is how many future steps are predicted', ['horizon', 'future', 'steps ahead', 'predict', 'ahead']], ['Longer horizons are harder and uncertainty grows', ['harder', 'uncertain', 'error grows', 'accumulate', 'difficult']], ['Choose them from the use case and data; test different lookbacks', ['use case', 'decision', 'tune', 'seasonal', 'validation', 'cover']]], model: 'The lookback window, sometimes called context length, is how much recent history the model receives as input, for example the last five hundred and twelve hours. The forecast horizon is how many steps into the future it must predict, such as the next ninety-six hours. The horizon comes from the decision being supported, for example how far ahead a planner needs to order stock. The lookback should be long enough to cover the important patterns, like at least a full weekly or daily cycle, but a very long window adds noise and cost. Longer horizons are harder, because uncertainty grows with distance. I choose both with validation experiments and evaluate error separately for near and far steps.' },
      { q: 'What is the difference between a point forecast and a probabilistic forecast?', level: 'easy', points: [['Point forecast gives a single value for each future step', ['single value', 'one number', 'point', 'single']], ['Probabilistic forecast gives a distribution or quantiles', ['distribution', 'quantile', 'interval', 'range', 'percentile']], ['Needed when decisions depend on risk, such as stock levels or energy capacity', ['risk', 'decision', 'safety stock', 'capacity', 'uncertain', 'inventory']], ['Trained with quantile or pinball loss, or by predicting distribution parameters', ['quantile loss', 'pinball', 'parameters', 'gaussian', 'negative log', 'likelihood']]], model: 'A point forecast gives one number per future step, usually the mean or median. A probabilistic forecast describes the uncertainty, either as a full distribution or as several quantiles, for example the tenth, fiftieth and ninetieth percentile. That matters whenever the decision depends on risk. A retailer deciding how much stock to hold needs the upper quantile, not just the average, and a grid operator needs to know how bad the peak could be. Models produce this in two main ways: by training with a quantile or pinball loss at each target quantile, or by predicting the parameters of a distribution, such as a mean and variance, and minimising the negative log-likelihood. I then check that the intervals have the right coverage.' },
      { q: 'What is patching in time-series transformers, and why is it useful?', level: 'easy', points: [['Split the series into short segments called patches and treat each patch as a token', ['patch', 'segment', 'chunk', 'token', 'subseries']], ['Shortens the sequence, so attention costs less and a longer lookback fits', ['shorter', 'fewer tokens', 'cost', 'quadratic', 'longer lookback', 'efficien']], ['Each token carries local context, which is more meaningful than a single point', ['local', 'semantic', 'context', 'information', 'meaningful', 'neighbour']], ['PatchTST is an example, often with channel independence', ['patchtst', 'channel independen', 'example']]], model: 'In a time-series transformer, a single time step carries very little information, and using each one as a token makes the sequence long and attention expensive. Patching groups consecutive points, for instance sixteen steps at a time, into a patch, and each patch is embedded as one token. This cuts the number of tokens by the patch length, so the quadratic attention cost drops and I can afford a much longer lookback window. It also gives each token local context, like a short shape or trend, which is more meaningful to relate with other tokens than a lone number. PatchTST is the well-known example, and it combines patching with channel independence, where each variable is treated as its own univariate series.' },
      { q: 'What is channel independence versus channel mixing in multivariate time-series models?', level: 'medium', points: [['Channel independence processes each variable separately with shared weights', ['independen', 'separately', 'each variable', 'shared weights', 'univariate', 'each channel']], ['Channel mixing models interactions between variables in the model', ['mixing', 'mix', 'interaction', 'cross-variable', 'cross-channel', 'dependenc']], ['Independence is robust, simple and often performs well, with fewer parameters', ['robust', 'simple', 'overfit', 'fewer', 'less', 'strong baseline']], ['Mixing helps when variables are strongly related, such as physical sensors', ['related', 'sensor', 'correlat', 'physical', 'lead', 'lag']]], model: 'In a multivariate dataset there are several channels, for example temperature, pressure and vibration. Channel independence treats each channel as a separate univariate series, passes it through the same shared model weights, and never lets the channels interact. Channel mixing lets the model see the relationships between channels, for instance through attention across variables or by embedding all variables at each time step into one token. Surprisingly, channel independence is often a strong baseline: it has fewer parameters, overfits less, and is robust when variables have different behaviours. Mixing earns its place when the variables genuinely drive each other, as in physical systems where one sensor leads another. I compare both on validation data, and sometimes use a hybrid.' },
      { q: 'How do you include known future covariates such as calendar features, prices or promotions in a transformer forecaster?', level: 'medium', points: [['Distinguish past-only covariates from known-future covariates', ['known future', 'known-future', 'past only', 'past-only', 'future', 'observed']], ['Embed calendar and promotion inputs and give them to the model over the horizon', ['embed', 'calendar', 'promotion', 'price', 'horizon', 'holiday']], ['Combine them with the target through concatenation, projection or a decoder or cross-attention', ['concatenat', 'project', 'decoder', 'cross-attention', 'cross attention', 'combine', 'add']], ['Static features describe each series; avoid leaking unknowable future values', ['static', 'series id', 'leak', 'unknown', 'not known', 'availab']]], model: 'First I classify each input. Past-only covariates, such as observed temperature, are only known up to the forecast origin. Known-future covariates, such as the calendar, public holidays, planned promotions or published prices, are available for the whole horizon. Static features, such as store type or product category, describe the series itself. I embed the categorical ones and project the numerical ones to the model dimension. The past inputs go into the encoder along with the target history, and the known-future covariates for the horizon are fed to the decoder or attended to by cross-attention, so the model can tie future events to forecasts. The key check is that I never give the model something not really known at forecast time.' },
      { q: 'When might you use a pretrained time-series foundation model, and what are its limits?', level: 'medium', points: [['Zero-shot or few-shot forecasting without training on the target data', ['zero-shot', 'zero shot', 'few-shot', 'no training', 'out of the box', 'pretrained']], ['Useful with little history, many different series, or for quick baselines', ['little history', 'cold start', 'quick', 'baseline', 'many series', 'small data']], ['Limits: domain mismatch, covariates support and cost', ['domain', 'mismatch', 'covariate', 'cost', 'latency', 'size', 'limited']], ['Compare against a tuned simple model and fine-tune if needed', ['compare', 'tuned', 'baseline', 'fine-tune', 'fine tune', 'benchmark', 'evaluate']]], model: 'A time-series foundation model is pretrained on a very large and varied collection of series, so it can forecast a new series zero-shot, with no training on my data. I would consider one when I have little history per series, many different series to cover, or I need a strong baseline quickly without building a pipeline. The limitations are that its pretraining data may not resemble my domain, support for extra covariates and special events is often limited, and inference can be heavier than a small specialist model. So I never assume it wins. I benchmark it on a time-based validation set against a seasonal naive baseline and a tuned gradient-boosted or classical model, and I fine-tune it if I have enough domain data.' },
      { q: 'How do you evaluate a probabilistic forecast?', level: 'hard', points: [['Pinball or quantile loss measures accuracy of each quantile', ['pinball', 'quantile loss', 'quantile', 'weighted']], ['CRPS scores the whole predictive distribution', ['crps', 'continuous ranked', 'distribution', 'proper scoring']], ['Coverage: the share of actuals inside the interval should match the nominal level', ['coverage', 'nominal', 'inside', 'interval', 'calibrat', '80 percent', '90 percent']], ['Also look at sharpness, the interval width, and compare across horizons and segments', ['sharpness', 'width', 'narrow', 'wide', 'horizon', 'segment']]], model: 'A single error number is not enough, because I want both accurate and honest uncertainty. For individual quantiles I use pinball loss, which penalises over- and under-prediction asymmetrically according to the quantile level. To score the whole predictive distribution I use CRPS, a proper scoring rule that rewards forecasts that are both well-centred and appropriately spread. I also check calibration directly through coverage: a ninety percent interval should contain the actual value about ninety percent of the time, and if it contains only seventy percent the model is overconfident. Calibration alone is not enough, since a very wide interval is always calibrated, so I also look at sharpness, meaning how narrow the intervals are. I break these down by horizon and by segment.' }
    ]
  }
];
