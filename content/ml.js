const R = String.raw;

export default [
  {
    id: 'ml-fundamentals', title: 'ML fundamentals', tracks: ['mle', 'ds', 'genai', 'mlops', 'nlp', 'cv', 'da'],
    tasks: [
      {
        id: 'ml-kfold', title: 'K-fold indices',
        prompt: `Write \`kfold_indices(n, k)\` that splits the indices \`0..n-1\` into \`k\` consecutive folds, without shuffling.

Return a list of \`(train_indices, val_indices)\` pairs, one per fold. If \`n\` is not divisible by \`k\`, the first \`n % k\` folds get one extra item (this matches scikit-learn).`,
        starter: R`def kfold_indices(n, k):
    pass

for train, val in kfold_indices(6, 3):
    print(train, val)
`,
        solution: R`def kfold_indices(n, k):
    sizes = [n // k + (1 if i < n % k else 0) for i in range(k)]
    folds, start = [], 0
    for size in sizes:
        val = list(range(start, start + size))
        train = list(range(0, start)) + list(range(start + size, n))
        folds.append((train, val))
        start += size
    return folds
`,
        tests: [
          { name: 'Even split', code: R`f = [(list(t), list(v)) for t, v in kfold_indices(6, 3)]
assert f == [([2, 3, 4, 5], [0, 1]), ([0, 1, 4, 5], [2, 3]), ([0, 1, 2, 3], [4, 5])], 'kfold_indices(6, 3) gives validation folds [0,1], [2,3], [4,5]'` },
          { name: 'Uneven split', code: R`f = kfold_indices(7, 3)
assert [len(v) for t, v in f] == [3, 2, 2], 'With n=7, k=3 the validation sizes are 3, 2, 2'` },
          { name: 'Every index validated exactly once', code: R`f = kfold_indices(11, 4)
allval = sorted(i for t, v in f for i in v)
assert allval == list(range(11)), 'Each index must appear in exactly one validation fold'` },
          { name: 'No train/validation overlap', code: R`for t, v in kfold_indices(10, 5):
    assert not set(t) & set(v), 'Train and validation overlap'
    assert len(t) + len(v) == 10, 'Train plus validation should cover all items'` }
        ]
      },
      {
        id: 'ml-standardize', title: 'Standardise without leakage',
        prompt: `Write \`standardize(train, test)\`. Both are 2-D lists (rows are samples, columns are features).

- Compute each column's mean and standard deviation **from the training data only**.
- Use the population standard deviation (numpy's default). If a column's deviation is 0, use 1.
- Return \`(train_scaled, test_scaled)\`.`,
        starter: R`import numpy as np

def standardize(train, test):
    pass

print(standardize([[1, 10], [3, 10]], [[5, 20]]))
`,
        solution: R`import numpy as np

def standardize(train, test):
    train = np.asarray(train, dtype=float)
    test = np.asarray(test, dtype=float)
    mu = train.mean(axis=0)
    sd = train.std(axis=0)
    sd[sd == 0] = 1.0
    return (train - mu) / sd, (test - mu) / sd
`,
        tests: [
          { name: 'Training data is scaled', code: R`tr, te = standardize([[1, 10], [3, 10]], [[5, 20]])
assert close(tr, [[-1, 0], [1, 0]]), 'Scaled training data should be [[-1, 0], [1, 0]]'` },
          { name: 'Test data uses training statistics', code: R`tr, te = standardize([[1, 10], [3, 10]], [[5, 20]])
assert close(te, [[3, 10]]), 'Test must be scaled with the training mean and deviation: expected [[3, 10]]'` },
          { name: 'Zero-variance column', code: R`import math
tr, te = standardize([[2, 5], [2, 7]], [[2, 6]])
vals = [float(x) for row in list(tr) + list(te) for x in row]
assert all(math.isfinite(v) for v in vals), 'A constant column must not produce NaN or inf'
assert close(te, [[0, 0]]), 'Expected [[0, 0]] for the test row'` }
        ]
      }
    ],
    quiz: [
      { q: 'Training accuracy is 99% and validation accuracy is 72%. Most likely?', options: ['Underfitting', 'Overfitting', 'Data leakage', 'A perfect model'], answer: 1, why: 'A large train/validation gap is high variance. Add data or regularisation, or simplify the model.', level: 'easy' },
      { q: 'Which is data leakage?', options: ['Using dropout', 'Fitting the scaler on all data before splitting', 'Using cross-validation', 'Shuffling the training set'], answer: 1, why: 'Statistics from the test set leak into training. Fit preprocessing on the training fold only.', level: 'easy' },
      { q: 'L1 regularisation tends to…', options: ['Shrink all weights equally', 'Drive some weights exactly to zero', 'Increase variance', 'Only work for trees'], answer: 1, why: 'L1 gives sparse solutions and acts as feature selection. L2 shrinks weights smoothly.', level: 'easy' },
      { q: 'For time-series data you should validate with…', options: ['Random k-fold', 'A split that respects time: train on the past, validate on the future', 'Leave-one-out', 'No validation'], answer: 1, why: 'Random splits let the model see the future, which inflates the score.', level: 'medium' },
      { q: 'What is a hyperparameter?', options: ['A weight the model learns from the data', 'A column of the dataset', 'A setting you choose before training, such as the learning rate', 'The score on the test set'], answer: 2, why: 'Parameters are learned; hyperparameters are set by you and tuned on validation data.', level: 'easy' },
      { q: 'Only 5% of rows are positive, and a random split gives a validation set with no positives at all. What prevents this?', options: ['A stratified split', 'Feature scaling', 'Dropout', 'Early stopping'], answer: 0, why: 'Stratification keeps the class proportions in every split.', level: 'medium' },
      { q: 'Each patient has about 40 scans in the data, and a random split puts scans of the same patient in train and test. Best fix?', options: ['Add more scans', 'Use a larger test set', 'Standardise the pixels', 'Split by patient (group k-fold)'], answer: 3, why: 'Otherwise the model can recognise patients and the score is inflated.', level: 'medium' },
      { q: 'Training error is 30% and validation error is 31%; both stay flat as you add data. What helps?', options: ['Much more data', 'A richer model or better features', 'Stronger regularisation', 'Early stopping'], answer: 1, why: 'Close and high errors mean high bias: the model cannot capture the pattern.', level: 'medium' },
      { q: 'You try 200 hyperparameter settings with cross-validation and report the best score as your expected performance. What is wrong?', options: ['Nothing, cross-validation is always unbiased', 'The score is biased upwards by the selection; confirm on untouched data or with nested cross-validation', 'Cross-validation cannot be used for tuning', 'The best setting is always the worst on new data', 'The score is biased downwards'], answer: 1, why: 'Picking the maximum of many noisy scores overstates the truth.', level: 'hard' },
      { q: 'Training error is 2% and validation error is 15%, and validation error keeps falling as you add data. Which lever is most reliable?', options: ['Make the model deeper', 'Remove all regularisation', 'Train for more epochs', 'Collect more training data'], answer: 3, why: 'A large gap that shrinks with data is a variance problem.', level: 'hard' },
      { q: 'A model trained on January to June data with a random 80/20 split scores AUC 0.94, but 0.81 in July. Best explanation?', options: ['The random split hid drift: validation rows came from the same period as training rows', 'AUC is unreliable', 'July has fewer rows', 'The model was too small', 'The learning rate was too low'], answer: 0, why: 'Validate on later data than you train on.', level: 'hard' },
      { q: 'Expected squared error is 25. Bias² is 9 and irreducible noise is 4. What is the variance?', options: ['16', '9', '12', '21'], answer: 2, why: '25 = bias² + variance + noise, so variance = 25 - 9 - 4.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain the bias-variance trade-off.', points: [['Bias: error from a model that is too simple (underfitting)', ['underfit', 'too simple', 'bias']], ['Variance: sensitivity to the training data (overfitting)', ['overfit', 'variance', 'sensitiv']], ['More complexity lowers bias and raises variance', ['complex', 'trade']], ['Ways to control it: regularisation, more data, ensembling', ['regulari', 'more data', 'ensembl', 'cross-valid', 'cross valid']]], model: 'Prediction error splits into bias, variance and noise. Bias is error from wrong assumptions: a model too simple to capture the pattern underfits. Variance is how much the model changes with different training samples: a very flexible model fits noise and overfits. Increasing complexity reduces bias and increases variance, so we look for the point with the lowest validation error. In practice I diagnose with learning curves, then reduce variance with more data, regularisation or ensembling, or reduce bias with a richer model or better features.' },
      { q: 'How do you detect and fix overfitting?', points: [['Gap between training and validation performance', ['gap', 'validation', 'training']], ['Regularisation or a simpler model', ['regulari', 'simpler', 'dropout', 'weight decay']], ['More or augmented data', ['more data', 'augment']], ['Early stopping and cross-validation', ['early stop', 'cross-valid', 'cross valid']]], model: 'I detect it by comparing training and validation metrics: a model that keeps improving on training while validation stalls or gets worse is overfitting. To fix it I first check for leakage and that the split is representative. Then I add data or augmentation, apply regularisation such as L2, dropout or tree depth limits, simplify the model or reduce features, and use early stopping. I confirm the fix with cross-validation and not a single lucky split.' },
      { q: 'What is data leakage? Give an example and how you prevent it.', points: [['Information unavailable at prediction time gets into training', ['not available', 'unavailable', 'future', 'prediction time', 'test set', 'information from']], ['A concrete example', ['scal', 'target', 'duplicate', 'timestamp', 'future', 'after the event']], ['Split first, then fit preprocessing on training only', ['split first', 'training only', 'train only', 'pipeline', 'fit on the train']], ['Suspiciously high scores are a warning sign', ['too good', 'suspicious', 'unrealistic']]], model: 'Leakage is when the model is trained with information it would not have at prediction time, so offline scores look great and production performance collapses. Examples: fitting a scaler or imputer on the full dataset before splitting, a feature that is recorded after the outcome, or the same customer appearing in both train and test. I prevent it by splitting first, by group or by time where relevant, putting all preprocessing in a pipeline fitted on the training fold only, and being suspicious of any result that looks too good.' },
      { q: 'How would you choose between a simple model and a complex one for a business problem?', points: [['Start with a simple baseline', ['baseline', 'simple']], ['Consider interpretability and regulation', ['interpret', 'explain']], ['Consider data size, latency and cost', ['latency', 'cost', 'data size', 'amount of data', 'inference']], ['Only add complexity if the metric gain justifies it', ['justif', 'worth', 'gain', 'improve']]], model: 'I always start with a simple baseline, such as logistic regression or gradient-boosted trees, because it is quick, debuggable and often close to the best. Then I weigh the constraints: how much data we have, latency and serving cost, how much the business needs to explain decisions, and how often we must retrain. I only move to something more complex if it gives a meaningful lift on the metric that matters and the team can maintain it.' }
    ]
  },

  {
    id: 'metrics', title: 'Evaluation metrics', tracks: ['mle', 'ds', 'da', 'nlp', 'cv', 'genai'],
    tasks: [
      {
        id: 'metrics-prf', title: 'Precision, recall, F1',
        prompt: `Write \`precision_recall_f1(y_true, y_pred)\` for binary labels (0 or 1). Return \`(precision, recall, f1)\`.

If a denominator is zero, that value is \`0.0\`.`,
        starter: R`def precision_recall_f1(y_true, y_pred):
    pass

print(precision_recall_f1([1, 0, 1, 1, 0], [1, 1, 1, 0, 0]))
`,
        solution: R`def precision_recall_f1(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1
`,
        tests: [
          { name: 'Mixed predictions', code: R`assert close(precision_recall_f1([1, 0, 1, 1, 0], [1, 1, 1, 0, 0]), [2/3, 2/3, 2/3]), 'Expected precision = recall = F1 = 0.667'` },
          { name: 'Perfect predictions', code: R`assert close(precision_recall_f1([1, 0, 1], [1, 0, 1]), [1, 1, 1]), 'Perfect predictions give 1, 1, 1'` },
          { name: 'No positive predictions', code: R`assert close(precision_recall_f1([1, 1, 0], [0, 0, 0]), [0, 0, 0]), 'With no positive predictions all three are 0.0 (no division by zero)'` },
          { name: 'Precision differs from recall', code: R`assert close(precision_recall_f1([1, 1, 1, 1, 0], [1, 0, 0, 0, 0]), [1.0, 0.25, 0.4]), 'Expected precision 1.0, recall 0.25, F1 0.4'` }
        ]
      },
      {
        id: 'metrics-auc', title: 'ROC AUC from scratch',
        prompt: `Write \`roc_auc(y_true, scores)\`.

AUC is the probability that a randomly chosen positive example gets a higher score than a randomly chosen negative one. Count a tie as half. Assume both classes are present.`,
        starter: R`def roc_auc(y_true, scores):
    pass

print(roc_auc([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8]))  # 0.75
`,
        solution: R`def roc_auc(y_true, scores):
    pos = [s for y, s in zip(y_true, scores) if y == 1]
    neg = [s for y, s in zip(y_true, scores) if y == 0]
    wins = sum(1.0 if p > n else 0.5 if p == n else 0.0 for p in pos for n in neg)
    return wins / (len(pos) * len(neg))
`,
        tests: [
          { name: 'Textbook example', code: R`assert close(roc_auc([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8]), 0.75), 'Expected 0.75'` },
          { name: 'Perfect ranking', code: R`assert close(roc_auc([0, 1, 0, 1], [0.1, 0.9, 0.2, 0.8]), 1.0), 'All positives above all negatives gives 1.0'` },
          { name: 'All scores tied', code: R`assert close(roc_auc([0, 1, 1, 0], [0.5, 0.5, 0.5, 0.5]), 0.5), 'Ties count as half, so this is 0.5'` },
          { name: 'Reversed ranking', code: R`assert close(roc_auc([1, 1, 0], [0.1, 0.2, 0.9]), 0.0), 'All positives below negatives gives 0.0'` }
        ]
      }
    ],
    quiz: [
      { q: 'Fraud is 0.5% of transactions. A model predicts "not fraud" for everything. Its accuracy?', options: ['0.5%', '50%', '99.5%', 'Undefined'], answer: 2, why: 'Which is why accuracy is useless on imbalanced data. Look at precision, recall and PR-AUC.', level: 'medium' },
      { q: 'Missing a cancer case is far worse than a false alarm. Optimise for…', options: ['Precision', 'Recall', 'Accuracy', 'Specificity'], answer: 1, why: 'Recall is the share of real positives you catch. Lower the threshold to raise it.', level: 'medium' },
      { q: 'ROC AUC of 0.5 means…', options: ['Perfect model', 'No better than random ranking', 'All predictions are wrong', '50% accuracy'], answer: 1, why: 'AUC is the probability a random positive outranks a random negative.', level: 'easy' },
      { q: 'Which regression metric is most sensitive to outliers?', options: ['MAE', 'RMSE', 'Median absolute error', 'They are equal'], answer: 1, why: 'Squaring the errors magnifies large ones.', level: 'easy' },
      { q: 'Precision answers which question?', options: ['Of all real positives, how many were found?', 'How many predictions were correct overall?', 'How many negatives were cleared?', 'Of everything flagged positive, how much was truly positive?'], answer: 3, why: 'Precision = TP / (TP + FP).', level: 'easy' },
      { q: 'What is a false positive?', options: ['Predicted negative, but actually positive', 'Predicted positive, but actually negative', 'Predicted positive and actually positive', 'A prediction that was never made'], answer: 1, why: 'A false alarm.', level: 'easy' },
      { q: 'TP = 30, FP = 10 and FN = 20. What is the recall?', options: ['0.75', '0.5', '0.6', '0.3'], answer: 2, why: '30 / (30 + 20).', level: 'medium' },
      { q: 'Cases scored 0.8 turn out positive only 50% of the time. The model is…', options: ['Overconfident: poorly calibrated', 'Perfectly calibrated', 'Underfitted', 'Using the wrong loss'], answer: 0, why: 'Calibration compares predicted probabilities with observed frequencies.', level: 'medium' },
      { q: 'Precision is 0.5 and recall is 1.0. What is F1?', options: ['0.75', '0.5', '1.0', 'About 0.67'], answer: 3, why: '2 × 0.5 × 1.0 / 1.5.', level: 'hard' },
      { q: 'A missed positive costs 9 and a false alarm costs 1. With calibrated probabilities, you should flag a case when p exceeds…', options: ['0.5', '0.1', '0.9', '0.01'], answer: 1, why: 'Flag if 9p > 1 - p, which means p > 1/10.', level: 'hard' },
      { q: 'With a 0.1% positive rate, a model has ROC AUC 0.98 but only 2% precision at 50% recall. Why is this consistent?', options: ['AUC is computed wrongly on rare classes', 'There are about 1,000 negatives per positive, so even a tiny false-positive rate gives far more false alarms than hits', 'Precision is always low at 50% recall', 'The model ranks negatives above positives', 'ROC curves ignore the positive class'], answer: 1, why: 'The false-positive rate is relative to a huge negative class.', level: 'hard' },
      { q: 'On 200 test cases two models score 86% and 88% accuracy. What is a sound conclusion?', options: ['The 88% model is clearly better', 'The 86% model is better because it is simpler', 'Accuracy cannot be compared', 'The gap is within sampling noise (about ±2 points each), so you cannot call a winner', 'Both are equal because both are above 80%'], answer: 3, why: 'The standard error of each accuracy is about √(0.87 × 0.13 / 200) ≈ 2.4 points.', level: 'hard' }
    ],
    interview: [
      { q: 'How do you evaluate a classifier on a heavily imbalanced dataset?', points: [['Accuracy is misleading', ['accuracy', 'mislead']], ['Use precision, recall and F1', ['precision', 'recall', 'f1']], ['PR-AUC or ROC-AUC, with a threshold chosen for the business cost', ['pr-auc', 'pr auc', 'precision-recall curve', 'precision recall curve', 'threshold', 'auc']], ['Stratified splits and a confusion matrix', ['stratif', 'confusion matrix']], ['Handling: class weights or resampling', ['class weight', 'resampl', 'oversampl', 'undersampl', 'smote']]], model: 'Accuracy is misleading because predicting the majority class already scores high. I look at the confusion matrix, precision and recall for the minority class, and the precision-recall curve, since PR-AUC reflects performance on the rare class better than ROC-AUC. I choose the decision threshold from the business cost of a false positive versus a false negative. I use stratified splits so every fold has positives, and on the training side I try class weights or resampling.' },
      { q: 'Explain precision and recall, and when you would favour one over the other.', points: [['Precision: of predicted positives, how many are right', ['predicted positive', 'of the ones', 'flagged', 'how many are correct', 'how many were actually']], ['Recall: of actual positives, how many were found', ['actual positive', 'found', 'caught', 'missed', 'detected']], ['Favour precision when false positives are costly', ['false positive', 'spam', 'costly']], ['Favour recall when misses are costly', ['false negative', 'miss', 'medical', 'fraud', 'cancer']]], model: 'Precision is the share of the items we flagged that were truly positive. Recall is the share of all true positives that we managed to flag. They trade off through the decision threshold. I favour precision when a false alarm is expensive, for example blocking a legitimate payment or marking a real email as spam. I favour recall when a miss is expensive, such as disease screening or fraud detection, and then use a second step to filter the false alarms.' },
      { q: 'What does ROC AUC measure, and when can it mislead you?', points: [['Ranking quality across all thresholds', ['threshold', 'rank']], ['True-positive rate against false-positive rate', ['true positive rate', 'false positive rate', 'tpr', 'fpr']], ['0.5 is random, 1.0 is perfect', ['random', '0.5', 'perfect']], ['Can look good on imbalanced data; use PR-AUC', ['imbalance', 'pr-auc', 'pr auc', 'precision-recall', 'precision recall']]], model: 'The ROC curve plots true-positive rate against false-positive rate at every threshold, and the area under it is the probability that a random positive is ranked above a random negative. 0.5 is random and 1.0 is perfect. It is threshold-independent, which is useful for comparing models. It can mislead on heavily imbalanced data, because the false-positive rate stays small even when most flagged items are wrong. There I rely on the precision-recall curve.' }
    ]
  },

  {
    id: 'linear-models', title: 'Linear and logistic regression', tracks: ['mle', 'ds', 'da'],
    tasks: [
      {
        id: 'lin-gd', title: 'Linear regression by gradient descent',
        prompt: `Write \`fit_linear(X, y, lr=0.1, epochs=1000)\` that fits \`y ≈ X @ w + b\` by batch gradient descent on mean squared error.

- Start from \`w = 0\`, \`b = 0\`.
- Gradients of MSE: \`dw = (2/n) * X.T @ (pred - y)\`, \`db = (2/n) * sum(pred - y)\`.
- Return \`(w, b)\`.`,
        starter: R`import numpy as np

def fit_linear(X, y, lr=0.1, epochs=1000):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    pass

print(fit_linear([[0], [1], [2], [3]], [1, 3, 5, 7]))  # about ([2.], 1.0)
`,
        solution: R`import numpy as np

def fit_linear(X, y, lr=0.1, epochs=1000):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(epochs):
        err = X @ w + b - y
        w -= lr * (2 / n) * (X.T @ err)
        b -= lr * (2 / n) * err.sum()
    return w, b
`,
        tests: [
          { name: 'One feature', code: R`w, b = fit_linear([[0], [1], [2], [3]], [1, 3, 5, 7])
assert close(list(w), [2.0], 1e-3) and close(b, 1.0, 1e-3), 'Expected w about [2] and b about 1'` },
          { name: 'Two features', code: R`import numpy as np
X = np.array([[1, 2], [2, 1], [3, 4], [4, 3], [0, 0]], dtype=float)
y = 1.0 * X[:, 0] - 2.0 * X[:, 1] + 0.5
w, b = fit_linear(X, y, lr=0.05, epochs=5000)
assert close(X @ np.asarray(w) + b, y, 1e-2), 'Predictions should match y = x1 - 2*x2 + 0.5'` },
          { name: 'Zero epochs returns zeros', code: R`w, b = fit_linear([[1.0, 2.0]], [3.0], epochs=0)
assert close(list(w), [0, 0]) and close(b, 0), 'Weights start at zero'` }
        ]
      },
      {
        id: 'lin-logistic', title: 'Logistic regression step',
        prompt: `Write \`logistic_step(w, b, X, y, lr)\` that performs **one** gradient-descent step for logistic regression on mean log-loss and returns the new \`(w, b)\`.

- \`p = sigmoid(X @ w + b)\`
- \`dw = X.T @ (p - y) / n\`, \`db = mean(p - y)\``,
        starter: R`import numpy as np

def logistic_step(w, b, X, y, lr):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    w = np.asarray(w, dtype=float)
    pass

print(logistic_step([0, 0], 0.0, [[1, 2], [3, 4]], [0, 1], 0.1))
`,
        solution: R`import numpy as np

def logistic_step(w, b, X, y, lr):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    w = np.asarray(w, dtype=float)
    p = 1 / (1 + np.exp(-(X @ w + b)))
    err = p - y
    return w - lr * (X.T @ err) / len(y), b - lr * err.mean()
`,
        tests: [
          { name: 'One step from zero', code: R`w, b = logistic_step([0, 0], 0.0, [[1, 2], [3, 4]], [0, 1], 0.1)
assert close(list(w), [0.05, 0.05]) and close(b, 0.0), 'Expected w = [0.05, 0.05], b = 0'` },
          { name: 'Bias moves toward the majority class', code: R`w, b = logistic_step([0], 0.0, [[0], [0], [0]], [1, 1, 0], 1.0)
assert close(b, 1/6), 'With p = 0.5 and labels [1, 1, 0], b should become 1/6'` },
          { name: 'Repeated steps separate the classes', code: R`import numpy as np
X = np.array([[0.0], [1.0], [2.0], [3.0]]); y = np.array([0, 0, 1, 1])
w, b = np.zeros(1), 0.0
for _ in range(2000):
    w, b = logistic_step(w, b, X, y, 0.5)
pred = (X @ np.asarray(w) + b > 0).astype(int)
assert pred.tolist() == [0, 0, 1, 1], 'After training, predictions should be [0, 0, 1, 1]'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why is logistic regression trained with log-loss and not squared error?', options: ['Squared error is illegal', 'Log-loss is convex for this model and matches maximum likelihood', 'Log-loss is faster to type', 'Squared error cannot be differentiated'], answer: 1, why: 'Squared error on a sigmoid output is non-convex and gives weak gradients for confident wrong predictions.', level: 'hard' },
      { q: 'Two features are almost perfectly correlated in a linear regression. What happens?', options: ['Predictions become wrong', 'Coefficients become unstable and hard to interpret', 'Training fails', 'Nothing'], answer: 1, why: 'Multicollinearity inflates coefficient variance. Predictions can still be fine. Ridge helps.', level: 'medium' },
      { q: 'Why scale features before gradient descent?', options: ['It changes the optimum', 'It makes the loss surface better conditioned so training converges faster', 'It removes outliers', 'It is only cosmetic'], answer: 1, why: 'Unscaled features create a stretched loss surface that forces a tiny learning rate.', level: 'medium' },
      { q: 'In logistic regression, a coefficient of 0.7 on a feature means…', options: ['Probability rises by 0.7', 'Log-odds rise by 0.7 per unit of the feature', 'Accuracy is 70%', 'The feature is 70% important'], answer: 1, why: 'The model is linear in log-odds; exp(0.7) ≈ 2 is the odds ratio.', level: 'medium' },
      { q: 'In y = 3x + 2, what is the slope?', options: ['3', '2', '5', '0'], answer: 0, why: 'The slope is the weight on x.', level: 'easy' },
      { q: 'The sigmoid function maps any real number to…', options: ['A value between -1 and 1', 'A positive integer', 'A value between 0 and 1', 'A value above 1'], answer: 2, why: 'That is why its output can be read as a probability.', level: 'easy' },
      { q: 'Ordinary least squares minimises…', options: ['The sum of absolute weights', 'The number of features', 'The number of rows', 'The sum of squared errors'], answer: 3, why: 'Hence the name.', level: 'easy' },
      { q: 'Gradient descent updates the weights by moving…', options: ['In the direction of the gradient', 'In the direction opposite to the gradient', 'At random', 'Towards the largest feature'], answer: 1, why: 'The gradient points uphill, so we go the other way.', level: 'easy' },
      { q: 'The residual plot of a linear model forms a clear U shape. What does it suggest?', options: ['The model is perfect', 'The learning rate is too high', 'A missing non-linear term, so add a polynomial feature or transform', 'The classes are imbalanced'], answer: 2, why: 'Residuals should show no pattern.', level: 'medium' },
      { q: 'In logistic regression z = ln 3 (about 1.0986). What probability does the sigmoid give?', options: ['0.75', '0.67', '0.9', '0.5'], answer: 0, why: 'The odds are e^z = 3, so p = 3 / (3 + 1).', level: 'hard' },
      { q: 'What happens to the weights of ridge regression as λ grows very large?', options: ['They grow without limit', 'They all become equal to one', 'They become exactly zero at once for every λ', 'They shrink towards zero, so the model approaches predicting the mean'], answer: 3, why: 'The penalty dominates the data term.', level: 'hard' },
      { q: 'You have 100,000 rows and 10,000 features. Why is the normal equation a poor choice?', options: ['It cannot fit a bias', 'It needs to solve a 10,000 × 10,000 system, which costs roughly d³ operations and a lot of memory', 'It only works for classification', 'It needs a learning rate'], answer: 1, why: 'Mini-batch gradient descent scales better.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain how gradient descent works and how the learning rate affects it.', points: [['Iteratively move against the gradient of the loss', ['gradient', 'opposite', 'against', 'downhill', 'negative']], ['Learning rate sets the step size', ['step size', 'step']], ['Too high diverges or oscillates; too low is slow', ['diverge', 'oscillat', 'overshoot', 'slow']], ['Variants: mini-batch, momentum, Adam', ['mini-batch', 'mini batch', 'stochastic', 'momentum', 'adam']]], model: 'Gradient descent minimises a loss by repeatedly computing its gradient with respect to the parameters and stepping in the opposite direction. The learning rate is the step size. If it is too large the loss oscillates or diverges; if it is too small training is very slow or stalls. In practice we use mini-batches for a cheap, noisy gradient estimate, and optimisers like momentum or Adam that adapt the step, often with a warm-up and decay schedule.' },
      { q: 'What is regularisation, and how do L1 and L2 differ?', points: [['A penalty on weights that reduces overfitting', ['penalty', 'penali', 'overfit']], ['L2 shrinks weights smoothly (ridge)', ['l2', 'ridge', 'square']], ['L1 produces sparse weights and selects features (lasso)', ['l1', 'lasso', 'sparse', 'zero', 'feature selection']], ['Strength is a hyperparameter tuned by validation', ['hyperparameter', 'lambda', 'alpha', 'tune', 'cross-valid']]], model: 'Regularisation adds a penalty on the size of the weights to the loss, which discourages the model from fitting noise. L2, or ridge, penalises squared weights: it shrinks all of them smoothly and handles correlated features well. L1, or lasso, penalises absolute values, which pushes some weights exactly to zero, so it also performs feature selection. The penalty strength is a hyperparameter I tune with cross-validation; features should be scaled first so the penalty is fair.' },
      { q: 'What are the assumptions of linear regression, and what do you do when they fail?', points: [['Linear relationship', ['linear']], ['Independent errors with constant variance', ['independen', 'homosced', 'constant variance']], ['No strong multicollinearity', ['multicollinear', 'correlated features', 'collinear']], ['Fixes: transform features, regularise, or use another model', ['transform', 'log', 'regulari', 'tree', 'robust', 'residual']]], model: 'Linear regression assumes the target is a linear function of the features, that errors are independent with constant variance and roughly normal, and that features are not strongly collinear. I check with residual plots. If the relationship is non-linear I add transformations or interactions, or move to trees. For non-constant variance I transform the target or use robust standard errors. For multicollinearity I drop or combine features or use ridge.' }
    ]
  },

  {
    id: 'trees', title: 'Trees and ensembles', tracks: ['mle', 'ds', 'da'],
    tasks: [
      {
        id: 'tree-gini', title: 'Gini impurity',
        prompt: `Write \`gini(labels)\` that returns the Gini impurity of a list of class labels: \`1 - sum(p_c ** 2)\` over the classes. An empty list has impurity \`0.0\`.`,
        starter: R`def gini(labels):
    pass

print(gini([0, 0, 1, 2]))  # 0.625
`,
        solution: R`from collections import Counter

def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    return 1.0 - sum((c / n) ** 2 for c in Counter(labels).values())
`,
        tests: [
          { name: 'Pure node', code: R`assert close(gini([1, 1, 1]), 0.0), 'A pure node has impurity 0'` },
          { name: 'Two balanced classes', code: R`assert close(gini([0, 1]), 0.5), 'Two balanced classes give 0.5'` },
          { name: 'Three classes', code: R`assert close(gini([0, 0, 1, 2]), 0.625), 'gini([0, 0, 1, 2]) should be 0.625'` },
          { name: 'Empty and string labels', code: R`assert close(gini([]), 0.0), 'Empty list gives 0.0'
assert close(gini(["a", "b", "b", "b"]), 0.375), 'Labels can be strings: expected 0.375'` }
        ]
      },
      {
        id: 'tree-split', title: 'Best split on one feature',
        prompt: `Write \`best_split(x, y)\` for one numeric feature \`x\` and class labels \`y\`.

- Candidate thresholds are the midpoints between consecutive **distinct** sorted values of \`x\`.
- A threshold \`t\` sends \`x <= t\` left and the rest right.
- Score = weighted average of the two sides' Gini impurity.
- Return \`(threshold, score)\` with the lowest score. On a tie, the smallest threshold wins. If \`x\` has only one distinct value, return \`(None, gini(y))\`.`,
        starter: R`def gini(labels):
    pass

def best_split(x, y):
    pass

print(best_split([1, 2, 3, 4], [0, 0, 1, 1]))  # (2.5, 0.0)
`,
        solution: R`from collections import Counter

def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    return 1.0 - sum((c / n) ** 2 for c in Counter(labels).values())

def best_split(x, y):
    values = sorted(set(x))
    if len(values) < 2:
        return None, gini(y)
    best_t, best_score = None, float("inf")
    for a, b in zip(values, values[1:]):
        t = (a + b) / 2
        left = [yi for xi, yi in zip(x, y) if xi <= t]
        right = [yi for xi, yi in zip(x, y) if xi > t]
        score = (len(left) * gini(left) + len(right) * gini(right)) / len(y)
        if score < best_score - 1e-12:
            best_t, best_score = t, score
    return best_t, best_score
`,
        tests: [
          { name: 'Perfect split', code: R`t, s = best_split([1, 2, 3, 4], [0, 0, 1, 1])
assert close(t, 2.5) and close(s, 0.0), 'Expected threshold 2.5 with score 0.0'` },
          { name: 'Imperfect split', code: R`t, s = best_split([1, 2, 3, 4, 5], [0, 1, 0, 1, 1])
assert close(t, 3.5) and close(s, 4/15), 'Expected threshold 3.5 with score about 0.2667'` },
          { name: 'Unsorted input', code: R`t, s = best_split([4, 1, 3, 2], [1, 0, 1, 0])
assert close(t, 2.5) and close(s, 0.0), 'Input may be unsorted: expected (2.5, 0.0)'` },
          { name: 'Constant feature', code: R`t, s = best_split([7, 7, 7, 7], [0, 1, 0, 1])
assert t is None and close(s, 0.5), 'With one distinct value return (None, gini(y))'` }
        ]
      }
    ],
    quiz: [
      { q: 'Random forests reduce variance mainly by…', options: ['Training deeper trees', 'Averaging many de-correlated trees built on bootstrap samples and random feature subsets', 'Using a lower learning rate', 'Pruning'], answer: 1, why: 'Bagging plus feature subsampling makes the trees differ, so their errors average out.', level: 'medium' },
      { q: 'Gradient boosting builds trees…', options: ['Independently in parallel', 'Sequentially, each fitting the errors of the ensemble so far', 'On random labels', 'Without a loss function'], answer: 1, why: 'Each new tree fits the negative gradient (residuals) of the loss.', level: 'easy' },
      { q: 'Which usually needs feature scaling?', options: ['Decision trees', 'Random forests', 'Gradient-boosted trees', 'k-nearest neighbours'], answer: 3, why: 'Trees split on thresholds, so scale does not matter. Distance-based models need it.', level: 'easy' },
      { q: 'A boosted model overfits. Which change helps most directly?', options: ['More trees with the same learning rate', 'Lower learning rate with early stopping, shallower trees', 'Remove the validation set', 'Increase tree depth'], answer: 1, why: 'Shrinkage, depth limits, subsampling and early stopping are the main controls.', level: 'medium' },
      { q: 'What is a leaf in a decision tree?', options: ['The first question', 'A node with no further split, which holds the prediction', 'A feature column', 'A bootstrap sample'], answer: 1, why: 'The leaf is where prediction happens.', level: 'easy' },
      { q: 'A random forest is built by averaging many…', options: ['Linear models on the same data', 'Trees trained on the test set', 'Clusters', 'Trees, each trained on a bootstrap sample'], answer: 3, why: 'Different samples give different trees.', level: 'easy' },
      { q: 'You raise min_samples_leaf from 1 to 20. What is the most likely effect?', options: ['The tree becomes simpler and overfits less', 'The tree becomes deeper', 'Training accuracy rises to 100%', 'The tree needs scaling'], answer: 0, why: 'Small leaves are forbidden, so the tree cannot memorise single rows.', level: 'medium' },
      { q: 'Why is the out-of-bag score of a random forest useful?', options: ['It measures training time', 'It replaces the test set for final reporting in every case', 'It estimates performance on unseen rows without a separate validation set', 'It tunes the learning rate'], answer: 2, why: 'Each tree has rows it never saw.', level: 'medium' },
      { q: 'Two features are almost identical copies. What happens to their importance in a random forest?', options: ['Both are doubled', 'One is always zero', 'The model fails to train', 'The importance is shared between them, so each looks smaller than it should'], answer: 3, why: 'The trees pick either one at random.', level: 'hard' },
      { q: 'A node holds 30 samples of class A and 10 of class B. A split sends 20 A and 0 B to the left, and 10 A and 10 B to the right. What is the weighted Gini of the two children?', options: ['0.5', '0.25', '0.375', '0'], answer: 1, why: 'Left (20 rows) has Gini 0 and right (20 rows) has Gini 0.5, so 0.5 × 0 + 0.5 × 0.5.', level: 'hard' },
      { q: 'Validation loss of a boosted model is lowest at tree 150 out of 1,000 (learning rate 0.1). What do you do?', options: ['Keep all 1,000 trees', 'Raise the learning rate to 1', 'Stop near 150 trees with early stopping, because later trees fit noise', 'Delete the validation set'], answer: 2, why: 'More trees after the minimum overfit.', level: 'hard' },
      { q: 'Why do trees need many splits to model a diagonal boundary such as x1 + x2 > 10?', options: ['Each split is axis-aligned, so the boundary is approximated by a staircase', 'Trees cannot use two features', 'Trees need scaled inputs', 'Diagonal boundaries are not allowed'], answer: 0, why: 'A linear model captures it with one weight per feature.', level: 'hard' }
    ],
    interview: [
      { q: 'Compare random forests and gradient boosting.', points: [['Random forest: bagging, trees built independently', ['bagging', 'bootstrap', 'independent', 'parallel']], ['Boosting: trees built sequentially on errors', ['sequential', 'residual', 'previous', 'errors']], ['Forest reduces variance; boosting reduces bias', ['variance', 'bias']], ['Boosting is usually more accurate but needs more tuning', ['tuning', 'tune', 'overfit', 'learning rate', 'accura']]], model: 'Both are ensembles of decision trees. A random forest uses bagging: many deep trees are trained independently on bootstrap samples with random feature subsets and averaged, which reduces variance and is hard to get badly wrong. Gradient boosting trains shallow trees one after another, each fitting the residual errors of the ensemble, which reduces bias. Boosting, for example XGBoost or LightGBM, is usually more accurate on tabular data but is more sensitive to hyperparameters like learning rate, depth and number of trees, so it needs early stopping.' },
      { q: 'How does a decision tree decide where to split?', points: [['Tries candidate features and thresholds', ['threshold', 'candidate', 'each feature', 'every feature']], ['Chooses the split with the largest impurity reduction', ['impurity', 'information gain', 'gini', 'entropy']], ['For regression it reduces variance or MSE', ['variance', 'mse', 'squared error']], ['Greedy and recursive until a stopping rule', ['greedy', 'recursive', 'depth', 'stopping', 'min samples']]], model: 'At each node the tree evaluates candidate splits across features and thresholds and picks the one that most reduces impurity, measured by Gini or entropy for classification and by variance for regression. It then repeats recursively on each child. The procedure is greedy, so it is not guaranteed to be globally optimal. Growth stops at a maximum depth, a minimum number of samples per leaf, or when no split improves purity, and these limits are how we control overfitting.' },
      { q: 'Why do gradient-boosted trees still beat deep learning on many tabular problems?', points: [['Handle mixed feature types and scales without preprocessing', ['scal', 'mixed', 'categorical', 'preprocess']], ['Work well with small or medium data', ['small', 'medium', 'less data', 'amount of data']], ['Robust to irrelevant features and outliers', ['irrelevant', 'outlier', 'robust', 'missing']], ['Fast to train and tune', ['fast', 'cheap', 'quick', 'tun']]], model: 'Tabular data usually has heterogeneous features with different scales, missing values and irregular, non-smooth relationships. Trees split on thresholds, so they handle all of that without careful preprocessing and ignore uninformative features. They need far less data than neural networks, train in minutes on a CPU and have few hyperparameters. Deep learning wins when there is structure to exploit, such as images, text or sequences, or very large datasets.' }
    ]
  },

  {
    id: 'feature-eng', title: 'Feature engineering with pandas', tracks: ['ds', 'da', 'mle'],
    tasks: [
      {
        id: 'fe-groupby', title: 'Per-user features',
        prompt: `Write \`user_features(df)\`. \`df\` is a pandas DataFrame with columns \`user_id\` and \`amount\` (one row per order).

Return a DataFrame with one row per user, sorted by \`user_id\`, with exactly these columns in this order: \`user_id\`, \`n_orders\`, \`total_amount\`, \`avg_amount\`. Use a clean 0..n-1 index.

The first run loads pandas, which takes several seconds.`,
        starter: R`import pandas as pd

def user_features(df):
    pass

df = pd.DataFrame({"user_id": [2, 1, 2, 3], "amount": [10.0, 5.0, 20.0, 7.0]})
print(user_features(df))
`,
        solution: R`import pandas as pd

def user_features(df):
    out = df.groupby("user_id")["amount"].agg(
        n_orders="count", total_amount="sum", avg_amount="mean"
    ).reset_index()
    return out.sort_values("user_id").reset_index(drop=True)
`,
        tests: [
          { name: 'Columns and order', code: R`import pandas as pd
df = pd.DataFrame({"user_id": [2, 1, 2, 3, 1, 2], "amount": [10.0, 5.0, 20.0, 7.0, 15.0, 30.0]})
out = user_features(df)
assert list(out.columns) == ["user_id", "n_orders", "total_amount", "avg_amount"], 'Columns must be user_id, n_orders, total_amount, avg_amount (got ' + str(list(out.columns)) + ')'
assert out["user_id"].tolist() == [1, 2, 3], 'One row per user, sorted by user_id'` },
          { name: 'Aggregates', code: R`import pandas as pd
df = pd.DataFrame({"user_id": [2, 1, 2, 3, 1, 2], "amount": [10.0, 5.0, 20.0, 7.0, 15.0, 30.0]})
out = user_features(df)
assert out["n_orders"].tolist() == [2, 3, 1], 'n_orders should be [2, 3, 1]'
assert close(out["total_amount"].tolist(), [20, 60, 7]), 'total_amount should be [20, 60, 7]'
assert close(out["avg_amount"].tolist(), [10, 20, 7]), 'avg_amount should be [10, 20, 7]'` },
          { name: 'Clean index', code: R`import pandas as pd
df = pd.DataFrame({"user_id": [9, 4], "amount": [1.0, 2.0]})
out = user_features(df)
assert list(out.index) == [0, 1] and out["user_id"].tolist() == [4, 9], 'Index should be 0..n-1 after sorting'` }
        ]
      },
      {
        id: 'fe-onehot', title: 'One-hot encoding',
        prompt: `Write \`one_hot(values)\` without pandas or scikit-learn.

Return \`(categories, matrix)\` where \`categories\` is the sorted list of distinct values and \`matrix\` is a list of rows, each a list of 0s and 1s with a single 1 in the column for that row's category.`,
        starter: R`def one_hot(values):
    pass

print(one_hot(["b", "a", "b"]))  # (['a', 'b'], [[0, 1], [1, 0], [0, 1]])
`,
        solution: R`def one_hot(values):
    categories = sorted(set(values))
    index = {c: i for i, c in enumerate(categories)}
    matrix = []
    for v in values:
        row = [0] * len(categories)
        row[index[v]] = 1
        matrix.append(row)
    return categories, matrix
`,
        tests: [
          { name: 'Two categories', code: R`cats, m = one_hot(["b", "a", "b"])
assert list(cats) == ["a", "b"] and [list(r) for r in m] == [[0, 1], [1, 0], [0, 1]], 'Expected (["a", "b"], [[0, 1], [1, 0], [0, 1]])'` },
          { name: 'Three categories', code: R`cats, m = one_hot(["cairo", "giza", "alex", "cairo"])
assert list(cats) == ["alex", "cairo", "giza"], 'Categories must be sorted'
assert [list(r) for r in m] == [[0, 1, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]], 'Each row has a single 1 in its category column'` },
          { name: 'Empty input', code: R`cats, m = one_hot([])
assert list(cats) == [] and list(m) == [], 'Empty input gives ([], [])'` }
        ]
      }
    ],
    quiz: [
      { q: 'A categorical feature has 50,000 distinct values. One-hot encoding is a poor choice because…', options: ['It is illegal', 'It creates a huge sparse matrix; use target, frequency or embedding encodings', 'It loses information', 'It only works for numbers'], answer: 1, why: 'High cardinality needs a compact encoding. Target encoding must be fitted inside the training fold to avoid leakage.', level: 'medium' },
      { q: 'A feature is 40% missing. A sensible first approach?', options: ['Drop every row with a missing value', 'Impute and add a "was missing" indicator, then test whether the feature helps', 'Fill with zero and move on', 'Delete the dataset'], answer: 1, why: 'Missingness is often informative. Fit the imputer on training data only.', level: 'medium' },
      { q: 'Income is heavily right-skewed. A common transformation?', options: ['Square it', 'Log transform', 'One-hot encode it', 'Reverse it'], answer: 1, why: 'A log compresses the long tail, which helps linear models and distance-based methods.', level: 'easy' },
      { q: 'You compute "average spend in the next 30 days" as a feature to predict churn today. This is…', options: ['Good practice', 'Target leakage', 'Regularisation', 'Feature scaling'], answer: 1, why: 'It uses information from after the prediction time. Features must be computed from data available at that moment.', level: 'medium' },
      { q: 'Which call counts missing values per column?', options: ['df.shape', 'df.describe(include="none")', 'df.unique()', 'df.isna().sum()'], answer: 3, why: 'isna marks missing cells, sum counts them.', level: 'easy' },
      { q: 'One-hot encoding a column with 5 categories produces…', options: ['One column with values 1 to 5', 'Five 0/1 columns', 'Two columns', 'Five rows'], answer: 1, why: 'Each row has a single 1.', level: 'easy' },
      { q: 'What does df.shape return?', options: ['The column names', 'A (rows, columns) tuple', 'The data types', 'The first five rows'], answer: 1, why: 'For example (1000, 12).', level: 'easy' },
      { q: 'You build "orders in the last 7 days" for each user as of a given date. What must you be careful about?', options: ['Use as many future days as possible', 'Sort the users alphabetically', 'Convert all counts to text', 'Only use orders dated before that date'], answer: 3, why: 'Anything later is not known at prediction time.', level: 'medium' },
      { q: 'Training features use data up to the end of the label day, but at serving time only data up to the start of the day exists. What follows?', options: ['Training-serving mismatch: live performance will be worse than offline', 'Nothing, they are equivalent', 'Live performance will be better', 'The model underfits'], answer: 0, why: 'Offline and online features must use the same cut-off.', level: 'hard' },
      { q: 'A target encoding is smoothed with strength m = 16. A category has only 2 rows. Where does its encoding end up?', options: ['At the category’s own mean', 'At zero', 'Very close to the global mean', 'At the maximum target value'], answer: 2, why: 'With n small against m, the global mean dominates.', level: 'hard' },
      { q: 'Daily sales are [10, 20, 60, 40]. A rolling 3-day mean that excludes the current day (shift by one, then roll) is computed. What is its value on day 4?', options: ['40', '43.3', '23.3', '30'], answer: 3, why: 'It averages days 1 to 3: (10 + 20 + 60) / 3.', level: 'hard' },
      { q: 'Why do you need both sin and cos to encode the hour of the day?', options: ['Because sin is slower to compute', 'One of them alone gives two different hours the same value', 'To make the values larger', 'Hours cannot be encoded with one function at all, even in theory'], answer: 1, why: 'The pair places each hour at a unique point on a circle.', level: 'hard' }
    ],
    interview: [
      { q: 'How do you handle missing values?', points: [['First understand why values are missing', ['why', 'reason', 'pattern', 'mechanism', 'random']], ['Options: drop, impute with median or mode, or model-based', ['impute', 'median', 'mean', 'mode', 'drop']], ['Add a missing indicator', ['indicator', 'flag', 'is missing', 'was missing']], ['Fit imputation on training data only', ['training only', 'train only', 'leak', 'training data', 'training set']]], model: 'I start by asking why the data is missing, because missingness can itself carry signal, for example a customer who never filled in a field. If very few rows are affected I may drop them. Otherwise I impute: median for skewed numeric features, mode or a separate "unknown" category for categoricals, and I add a binary indicator that the value was missing. Tree models such as XGBoost can handle missing values natively. Any imputer is fitted on the training fold only, to avoid leakage.' },
      { q: 'How do you encode categorical features, especially ones with many categories?', points: [['One-hot for low cardinality', ['one-hot', 'one hot', 'dummy']], ['Ordinal encoding when there is a natural order', ['ordinal', 'order']], ['Target or frequency encoding for high cardinality', ['target encod', 'frequency', 'mean encod', 'count encod']], ['Embeddings or hashing for very large vocabularies', ['embedding', 'hash']], ['Guard against leakage and unseen categories', ['leak', 'unseen', 'unknown', 'smooth']]], model: 'For a handful of categories I one-hot encode. If the categories have a natural order, like education level, I use ordinal encoding. For high cardinality, such as city or product ID, one-hot becomes too wide, so I use frequency encoding or target encoding with smoothing, computed inside each training fold to avoid leaking the label. With deep models I learn embeddings, and for very large or changing vocabularies I use the hashing trick. I always plan for categories that were not seen in training.' },
      { q: 'Tell me about feature engineering that made a real difference in a project.', points: [['Context: the problem and the baseline', ['baseline', 'problem', 'project', 'goal']], ['The feature idea and where it came from', ['feature', 'domain', 'idea', 'noticed', 'aggregat', 'ratio', 'window']], ['How you validated it', ['validat', 'cross-valid', 'a/b', 'ablation', 'test']], ['A measured result', ['improv', 'increase', 'reduc', 'percent', '%', 'lift']]], model: 'A strong answer uses a real project in STAR form. For example: on a churn model the baseline with raw account fields had an AUC of 0.71. Talking to the support team, I learned that customers who churn usually reduce usage weeks before. I built rolling-window features: sessions in the last 7 days against the previous 30, and days since last login, computed strictly from data before the prediction date. Cross-validation by time showed AUC rising to 0.79, and the retention campaign that used the model reduced churn by a measurable amount. Name the idea, how you checked it and the number.' }
    ]
  }
];
