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
      { q: 'Explain the bias-variance trade-off.', level: 'medium', points: [['Bias: error from a model that is too simple (underfitting)', ['underfit', 'too simple', 'bias']], ['Variance: sensitivity to the training data (overfitting)', ['overfit', 'variance', 'sensitiv']], ['More complexity lowers bias and raises variance', ['complex', 'trade']], ['Ways to control it: regularisation, more data, ensembling', ['regulari', 'more data', 'ensembl', 'cross-valid', 'cross valid']]], model: 'Prediction error splits into bias, variance and noise. Bias is error from wrong assumptions: a model too simple to capture the pattern underfits. Variance is how much the model changes with different training samples: a very flexible model fits noise and overfits. Increasing complexity reduces bias and increases variance, so we look for the point with the lowest validation error. In practice I diagnose with learning curves, then reduce variance with more data, regularisation or ensembling, or reduce bias with a richer model or better features.' },
      { q: 'How do you detect and fix overfitting?', level: 'medium', points: [['Gap between training and validation performance', ['gap', 'validation', 'training']], ['Regularisation or a simpler model', ['regulari', 'simpler', 'dropout', 'weight decay']], ['More or augmented data', ['more data', 'augment']], ['Early stopping and cross-validation', ['early stop', 'cross-valid', 'cross valid']]], model: 'I detect it by comparing training and validation metrics: a model that keeps improving on training while validation stalls or gets worse is overfitting. To fix it I first check for leakage and that the split is representative. Then I add data or augmentation, apply regularisation such as L2, dropout or tree depth limits, simplify the model or reduce features, and use early stopping. I confirm the fix with cross-validation and not a single lucky split.' },
      { q: 'What is data leakage? Give an example and how you prevent it.', level: 'hard', points: [['Information unavailable at prediction time gets into training', ['not available', 'unavailable', 'future', 'prediction time', 'test set', 'information from']], ['A concrete example', ['scal', 'target', 'duplicate', 'timestamp', 'future', 'after the event']], ['Split first, then fit preprocessing on training only', ['split first', 'training only', 'train only', 'pipeline', 'fit on the train']], ['Suspiciously high scores are a warning sign', ['too good', 'suspicious', 'unrealistic']]], model: 'Leakage is when the model is trained with information it would not have at prediction time, so offline scores look great and production performance collapses. Examples: fitting a scaler or imputer on the full dataset before splitting, a feature that is recorded after the outcome, or the same customer appearing in both train and test. I prevent it by splitting first, by group or by time where relevant, putting all preprocessing in a pipeline fitted on the training fold only, and being suspicious of any result that looks too good.' },
      { q: 'How would you choose between a simple model and a complex one for a business problem?', level: 'hard', points: [['Start with a simple baseline', ['baseline', 'simple']], ['Consider interpretability and regulation', ['interpret', 'explain']], ['Consider data size, latency and cost', ['latency', 'cost', 'data size', 'amount of data', 'inference']], ['Only add complexity if the metric gain justifies it', ['justif', 'worth', 'gain', 'improve']]], model: 'I always start with a simple baseline, such as logistic regression or gradient-boosted trees, because it is quick, debuggable and often close to the best. Then I weigh the constraints: how much data we have, latency and serving cost, how much the business needs to explain decisions, and how often we must retrain. I only move to something more complex if it gives a meaningful lift on the metric that matters and the team can maintain it.' },
      { q: 'What is the difference between supervised, unsupervised and reinforcement learning?', level: 'easy', points: [['Supervised learns from labelled examples', ['label', 'supervised', 'target', 'input and output']], ['Unsupervised finds structure without labels, such as clustering', ['unsupervised', 'cluster', 'without label', 'no label', 'structure', 'dimension']], ['Reinforcement learns by acting and receiving rewards', ['reinforcement', 'reward', 'agent', 'environment', 'action']], ['Give an example of each', ['spam', 'segment', 'game', 'robot', 'recommend', 'price']]], model: 'In supervised learning I have inputs and the correct answers, the labels, and the model learns to predict them. Predicting house prices or flagging spam are examples. In unsupervised learning there are no labels, so the model looks for structure on its own, for instance clustering customers into segments or reducing dimensions to visualise data. In reinforcement learning an agent takes actions in an environment and receives rewards, and it learns a policy that maximises long-term reward, as in game-playing or robot control. In practice most business problems are supervised, unsupervised methods are often used for exploration or feature building, and reinforcement learning is used where decisions affect future states.' },
      { q: 'What is the difference between a parameter and a hyperparameter?', level: 'easy', points: [['Parameters are learned from data during training', ['learned', 'learn', 'training', 'weights', 'coefficient']], ['Hyperparameters are set before training', ['before training', 'set by', 'choose', 'chosen', 'configur', 'set in advance']], ['Examples: weights versus learning rate, tree depth, regularisation strength', ['learning rate', 'depth', 'regulari', 'number of', 'k ', 'layers']], ['Hyperparameters are tuned on a validation set, not the test set', ['validation', 'tune', 'tuning', 'search', 'cross-valid', 'not the test']]], model: 'Parameters are the values the model learns from the data, like the coefficients in a linear regression or the weights in a neural network. Hyperparameters are the settings I choose before training that control how the learning happens, such as the learning rate, the maximum depth of a tree, the number of neighbours in k-nearest neighbours, or the strength of regularisation. The training algorithm optimises parameters automatically, but hyperparameters have to be chosen by me, usually by searching over values and measuring performance on a validation set or with cross-validation. I never tune them on the test set, because that would leak information and make the final score optimistic.' },
      { q: 'Why do we split data into training, validation and test sets?', level: 'easy', points: [['Training set fits the model', ['training', 'fit', 'learn']], ['Validation set is for tuning and model selection', ['validation', 'tune', 'tuning', 'select', 'choose']], ['Test set is used once at the end for an unbiased estimate', ['test', 'once', 'unbiased', 'final', 'unseen', 'held out', 'hold out']], ['Reusing the test set repeatedly leaks information', ['leak', 'optimistic', 'repeated', 'overfit to the test', 'peek']]], model: 'The goal is to estimate how the model will behave on data it has never seen. The training set is used to fit the parameters. The validation set is used to compare models and tune hyperparameters, since each choice I make based on it slightly overfits to it. The test set is kept locked away and used once at the end to give an unbiased estimate of real-world performance. If I keep going back to the test set to adjust things, it stops being independent and my score becomes optimistic. For small datasets I replace a single validation set with cross-validation, and for time-ordered data I split by time, not randomly.' },
      { q: 'Explain k-fold cross-validation and where it can go wrong.', level: 'medium', points: [['Split data into k folds; train on k minus one and validate on the remaining fold, rotating', ['k folds', 'k-fold', 'rotate', 'each fold', 'k minus', 'remaining']], ['Average the scores for a more stable estimate', ['average', 'mean', 'stable', 'variance', 'less noisy']], ['Use stratified folds for imbalanced classes', ['stratif', 'imbalanc', 'class proportion', 'class balance']], ['Pitfalls: leakage from preprocessing outside the folds, time-series order, grouped samples', ['leak', 'preprocess', 'pipeline', 'time', 'group', 'same user', 'order']]], model: 'In k-fold cross-validation I split the training data into k equal parts. I train on k minus one of them, validate on the held-out part, and repeat k times so each part is used once for validation. Averaging the k scores gives a more stable estimate than a single split, and the spread tells me about variance. For imbalanced classification I use stratified folds so each fold has the same class proportions. It can go wrong in a few ways. Fitting a scaler or imputer on all data before splitting leaks information, so preprocessing must sit inside a pipeline fitted per fold. Time series need forward-chaining splits, and records from the same user or patient must stay in the same fold.' },
      { q: 'You are given a new prediction problem. How do you go from the data to a first working model?', level: 'medium', points: [['Clarify the business goal, target and success metric', ['business', 'goal', 'target', 'metric', 'success', 'objective']], ['Explore and clean the data, check for leakage and imbalance', ['explor', 'eda', 'clean', 'leak', 'imbalanc', 'missing']], ['Build a simple baseline first', ['baseline', 'simple', 'logistic', 'dummy', 'linear', 'heuristic']], ['Iterate with cross-validation, error analysis and feature work', ['cross-valid', 'error analysis', 'iterate', 'feature', 'validation']], ['Plan how it will be deployed and monitored', ['deploy', 'monitor', 'production', 'serve', 'drift']]], model: 'I start with the question: what decision does this support, what exactly is the target, and which metric tells me success? Then I look at the data, its size, missing values, class balance, and above all whether any column would not be available at prediction time. I set up a proper split, then build a very simple baseline, a rule or a logistic regression, so I know what any complex model must beat. After that I iterate: try stronger models like gradient boosting, engineer features, use cross-validation to compare, and do error analysis to see where the model fails. In parallel I think about deployment, latency, monitoring and how I will retrain, because a model that cannot ship has no value.' },
      { q: 'A model performed well in testing but its accuracy has dropped after a few months in production. What could be happening and how do you respond?', level: 'hard', points: [['Data drift: input distribution has changed', ['data drift', 'input distribution', 'covariate', 'distribution shift', 'population']], ['Concept drift: the relationship between inputs and target changed', ['concept drift', 'relationship', 'behaviour', 'behavior', 'seasonal', 'world changed']], ['Pipeline problems such as broken features or training-serving skew', ['pipeline', 'skew', 'broken', 'schema', 'upstream', 'missing feature', 'bug']], ['Monitor inputs, predictions and delayed labels; alert on thresholds', ['monitor', 'alert', 'dashboard', 'labels', 'psi', 'ks', 'threshold']], ['Retrain on recent data or on a schedule, and validate before release', ['retrain', 'recent', 'schedule', 'champion', 'challenger', 'shadow', 'roll back']]], model: 'First I rule out boring causes: a broken upstream feed, a changed schema, or a feature computed differently in production than in training. Then I look for drift. Data drift means the inputs now look different from the training data, for example new customer segments. Concept drift means the relationship between inputs and the target changed, for instance after a pricing change or a seasonal shift. I compare recent feature distributions with the training distributions using simple statistics, and track performance once true labels arrive. The response depends on the cause: fix the pipeline, retrain on recent data, or redesign features. Long term I set up monitoring with alerts, a scheduled retraining policy, and a shadow or champion-challenger comparison before releasing a new model.' }
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
      { q: 'How do you evaluate a classifier on a heavily imbalanced dataset?', level: 'hard', points: [['Accuracy is misleading', ['accuracy', 'mislead']], ['Use precision, recall and F1', ['precision', 'recall', 'f1']], ['PR-AUC or ROC-AUC, with a threshold chosen for the business cost', ['pr-auc', 'pr auc', 'precision-recall curve', 'precision recall curve', 'threshold', 'auc']], ['Stratified splits and a confusion matrix', ['stratif', 'confusion matrix']], ['Handling: class weights or resampling', ['class weight', 'resampl', 'oversampl', 'undersampl', 'smote']]], model: 'Accuracy is misleading because predicting the majority class already scores high. I look at the confusion matrix, precision and recall for the minority class, and the precision-recall curve, since PR-AUC reflects performance on the rare class better than ROC-AUC. I choose the decision threshold from the business cost of a false positive versus a false negative. I use stratified splits so every fold has positives, and on the training side I try class weights or resampling.' },
      { q: 'Explain precision and recall, and when you would favour one over the other.', level: 'medium', points: [['Precision: of predicted positives, how many are right', ['predicted positive', 'of the ones', 'flagged', 'how many are correct', 'how many were actually']], ['Recall: of actual positives, how many were found', ['actual positive', 'found', 'caught', 'missed', 'detected']], ['Favour precision when false positives are costly', ['false positive', 'spam', 'costly']], ['Favour recall when misses are costly', ['false negative', 'miss', 'medical', 'fraud', 'cancer']]], model: 'Precision is the share of the items we flagged that were truly positive. Recall is the share of all true positives that we managed to flag. They trade off through the decision threshold. I favour precision when a false alarm is expensive, for example blocking a legitimate payment or marking a real email as spam. I favour recall when a miss is expensive, such as disease screening or fraud detection, and then use a second step to filter the false alarms.' },
      { q: 'What does ROC AUC measure, and when can it mislead you?', level: 'medium', points: [['Ranking quality across all thresholds', ['threshold', 'rank']], ['True-positive rate against false-positive rate', ['true positive rate', 'false positive rate', 'tpr', 'fpr']], ['0.5 is random, 1.0 is perfect', ['random', '0.5', 'perfect']], ['Can look good on imbalanced data; use PR-AUC', ['imbalance', 'pr-auc', 'pr auc', 'precision-recall', 'precision recall']]], model: 'The ROC curve plots true-positive rate against false-positive rate at every threshold, and the area under it is the probability that a random positive is ranked above a random negative. 0.5 is random and 1.0 is perfect. It is threshold-independent, which is useful for comparing models. It can mislead on heavily imbalanced data, because the false-positive rate stays small even when most flagged items are wrong. There I rely on the precision-recall curve.' },
      { q: 'What is a confusion matrix and what can you read from it?', level: 'easy', points: [['Table of predicted versus actual classes', ['predicted', 'actual', 'table', 'versus', 'grid']], ['Four cells: true positives, false positives, true negatives, false negatives', ['true positive', 'false positive', 'true negative', 'false negative', 'tp', 'fp', 'tn', 'fn']], ['Metrics like accuracy, precision, recall come from it', ['accuracy', 'precision', 'recall', 'derive', 'metric']], ['Shows which kinds of mistakes the model makes', ['mistake', 'error type', 'kind of error', 'where', 'type of error']]], model: 'A confusion matrix is a table that compares the model’s predicted classes with the actual ones. For a binary problem it has four cells: true positives, where I predicted positive and it was positive, false positives, true negatives, and false negatives. From those counts I can compute accuracy, precision, which is true positives over everything I predicted positive, and recall, which is true positives over everything that really was positive. The big advantage over a single number is that it shows what kind of mistakes the model makes. Missing a fraud case and flagging a good customer have very different costs, and the matrix shows me the balance between them. For multiple classes it becomes a grid that shows which classes get confused.' },
      { q: 'What are MAE, MSE and RMSE, and how do you choose between them for regression?', level: 'easy', points: [['MAE is the average absolute error, in the same units as the target', ['mae', 'absolute', 'average error', 'same unit']], ['MSE averages squared errors, penalising large errors more', ['mse', 'squared', 'penalis', 'penaliz', 'large error', 'outlier']], ['RMSE is the square root of MSE, back in target units', ['rmse', 'root', 'square root', 'units']], ['Choose by cost of large errors; MAE is more robust to outliers', ['robust', 'outlier', 'cost', 'business', 'sensitive']]], model: 'MAE, the mean absolute error, is the average size of the mistakes, in the same units as the target, so it is easy to explain: on average we are off by about this much. MSE averages the squared errors, so big mistakes are punished much more than small ones. RMSE is the square root of MSE, which brings the number back into the target’s units while keeping that emphasis on large errors. I choose based on what the business cares about. If a few large misses are especially costly, RMSE is appropriate. If the data has outliers I do not want to dominate the score, MAE is more robust. I often report both, and compare them against a simple baseline.' },
      { q: 'What does R-squared tell you, and what are its limits?', level: 'easy', points: [['Share of the variance in the target explained by the model', ['variance', 'explained', 'proportion', 'share', 'fraction']], ['Compared with predicting the mean; 0 is no better, 1 is perfect', ['mean', 'baseline', 'zero', 'one', '1', '0']], ['Always rises when features are added; adjusted R-squared penalises that', ['adjusted', 'always increase', 'always rise', 'more features', 'penalis']], ['Does not show bias, causation or whether the fit is appropriate', ['causation', 'bias', 'residual', 'nonlinear', 'not show', 'plot']]], model: 'R-squared is the proportion of the variance in the target that the model explains, compared with the simplest model that always predicts the mean. A value of zero means no better than the mean, and one means a perfect fit. It is handy for a quick feel, but it has limits. It never decreases when I add more features, even useless ones, so adjusted R-squared is better for comparing models of different sizes. A high value does not mean the model is correct, because the relationship may be non-linear or driven by outliers, and it says nothing about causation. On test data it can even be negative, which means the model is worse than predicting the mean. I always check residual plots as well.' },
      { q: 'What is the F1 score, why is it a harmonic mean, and when would you use F-beta instead?', level: 'medium', points: [['F1 combines precision and recall into one number', ['combine', 'precision', 'recall', 'single', 'balance']], ['Harmonic mean punishes a big gap between the two', ['harmonic', 'punish', 'low value', 'gap', 'imbalance between', 'dominated']], ['F-beta weights recall more when beta is above one', ['beta', 'weight', 'favour', 'favor', 'more weight', 'recall more']], ['It ignores true negatives and depends on the threshold', ['true negative', 'threshold', 'ignore', 'positive class']]], model: 'F1 is a single score that combines precision and recall. It uses the harmonic mean rather than the ordinary average because the harmonic mean is dragged down by whichever of the two is low. With precision of one and recall of zero point one, the average would look decent, but F1 is about zero point one eight, which tells the truth. If recall matters more than precision, such as screening for a disease, I use F-beta with beta above one, for example F2. If precision matters more I use beta below one. Remember that F1 ignores true negatives and depends on the decision threshold, so I report the threshold I used and often check precision and recall separately.' },
      { q: 'How do you choose the classification threshold for a probabilistic model?', level: 'medium', points: [['The default 0.5 is rarely optimal', ['0.5', 'default', 'arbitrary', 'not optimal', 'rarely']], ['Use the precision-recall or ROC curve on validation data', ['curve', 'precision-recall', 'roc', 'validation']], ['Pick the point using the costs of false positives and false negatives or a required recall or precision', ['cost', 'false positive', 'false negative', 'business', 'required', 'constraint', 'target recall']], ['Fix the threshold on validation data and recheck it after drift', ['validation', 'not the test', 'monitor', 'recheck', 'drift', 'recalibrat']]], model: 'The model outputs a probability, and the threshold is a business decision that turns it into an action. The default of zero point five is rarely right, especially with imbalanced classes. I take the validation predictions and compute precision and recall at many thresholds, plotting a precision-recall curve. Then I pick the point that matches the costs: if a missed case costs ten times more than a false alarm I pick a lower threshold, or if the review team can only handle a hundred alerts a day I set the threshold to produce that volume. I choose it on validation data, never the test set, and I monitor it in production because a shift in the score distribution changes what a given threshold means.' },
      { q: 'What is model calibration, how do you check it, and how do you fix a poorly calibrated model?', level: 'hard', points: [['Calibrated means predicted probabilities match real frequencies', ['match', 'frequenc', 'actual rate', 'reliable', 'probabilit']], ['Check with a reliability diagram or Brier score or expected calibration error', ['reliability', 'calibration curve', 'brier', 'log loss', 'ece', 'expected calibration']], ['Some models are overconfident or underconfident, such as boosted trees or neural networks', ['overconfident', 'underconfident', 'boost', 'neural', 'random forest', 'naive bayes']], ['Fix with Platt scaling or isotonic regression on held-out data', ['platt', 'isotonic', 'sigmoid', 'temperature', 'held-out', 'holdout']], ['Matters when probabilities drive decisions, such as pricing or risk', ['decision', 'risk', 'pricing', 'threshold', 'expected value', 'cost']]], model: 'A model is calibrated if, among all cases where it says seventy percent, about seventy percent are actually positive. Ranking metrics like AUC do not tell me that, so a model can rank well and still give misleading probabilities. I check with a reliability diagram, which plots predicted probability bins against the observed rate, and with the Brier score or expected calibration error. Boosted trees, random forests and large neural networks are often miscalibrated, for example overconfident. The fix is to learn a mapping from raw scores to probabilities on held-out data, using Platt scaling, which is logistic regression on the scores, or isotonic regression if there is enough data. It matters whenever the probability feeds a decision, like expected loss, pricing or risk.' },
      { q: 'How would you evaluate a recommendation or ranking system, offline and online?', level: 'hard', points: [['Ranking metrics offline: precision at k, recall at k, NDCG, MAP, MRR', ['precision at k', 'recall at k', 'ndcg', 'map', 'mrr', 'top-k', 'top k', 'rank']], ['Use time-based splits and avoid leakage of future interactions', ['time', 'future', 'leak', 'split', 'temporal']], ['Offline metrics are proxies; check coverage, diversity and novelty too', ['proxy', 'coverage', 'diversity', 'novelty', 'popularity', 'bias']], ['Validate with online A/B tests on business metrics such as click-through, conversion or retention', ['a/b', 'online', 'click', 'conversion', 'retention', 'experiment']], ['Watch position bias and feedback loops', ['position bias', 'feedback loop', 'exposure', 'selection bias', 'counterfactual']]], model: 'Offline, I measure how well the system puts relevant items at the top using ranking metrics such as precision and recall at k, mean reciprocal rank, and NDCG, which rewards putting the best items highest. I split by time, so I train on the past and evaluate on later interactions, to avoid leaking the future. But offline numbers are only a proxy, so I also check coverage, diversity, novelty and popularity bias. The logs are biased too, because users only interact with what they were shown, so position bias can mislead. The real test is an online A/B experiment on metrics the business cares about, such as click-through, conversion or retention, with guardrails like latency and long-term satisfaction, and I watch for feedback loops where the model reinforces its own choices.' }
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
      { q: 'Explain how gradient descent works and how the learning rate affects it.', level: 'medium', points: [['Iteratively move against the gradient of the loss', ['gradient', 'opposite', 'against', 'downhill', 'negative']], ['Learning rate sets the step size', ['step size', 'step']], ['Too high diverges or oscillates; too low is slow', ['diverge', 'oscillat', 'overshoot', 'slow']], ['Variants: mini-batch, momentum, Adam', ['mini-batch', 'mini batch', 'stochastic', 'momentum', 'adam']]], model: 'Gradient descent minimises a loss by repeatedly computing its gradient with respect to the parameters and stepping in the opposite direction. The learning rate is the step size. If it is too large the loss oscillates or diverges; if it is too small training is very slow or stalls. In practice we use mini-batches for a cheap, noisy gradient estimate, and optimisers like momentum or Adam that adapt the step, often with a warm-up and decay schedule.' },
      { q: 'What is regularisation, and how do L1 and L2 differ?', level: 'medium', points: [['A penalty on weights that reduces overfitting', ['penalty', 'penali', 'overfit']], ['L2 shrinks weights smoothly (ridge)', ['l2', 'ridge', 'square']], ['L1 produces sparse weights and selects features (lasso)', ['l1', 'lasso', 'sparse', 'zero', 'feature selection']], ['Strength is a hyperparameter tuned by validation', ['hyperparameter', 'lambda', 'alpha', 'tune', 'cross-valid']]], model: 'Regularisation adds a penalty on the size of the weights to the loss, which discourages the model from fitting noise. L2, or ridge, penalises squared weights: it shrinks all of them smoothly and handles correlated features well. L1, or lasso, penalises absolute values, which pushes some weights exactly to zero, so it also performs feature selection. The penalty strength is a hyperparameter I tune with cross-validation; features should be scaled first so the penalty is fair.' },
      { q: 'What are the assumptions of linear regression, and what do you do when they fail?', level: 'hard', points: [['Linear relationship', ['linear']], ['Independent errors with constant variance', ['independen', 'homosced', 'constant variance']], ['No strong multicollinearity', ['multicollinear', 'correlated features', 'collinear']], ['Fixes: transform features, regularise, or use another model', ['transform', 'log', 'regulari', 'tree', 'robust', 'residual']]], model: 'Linear regression assumes the target is a linear function of the features, that errors are independent with constant variance and roughly normal, and that features are not strongly collinear. I check with residual plots. If the relationship is non-linear I add transformations or interactions, or move to trees. For non-constant variance I transform the target or use robust standard errors. For multicollinearity I drop or combine features or use ridge.' },
      { q: 'How does linear regression find its coefficients, and what does least squares mean?', level: 'easy', points: [['Models the target as a weighted sum of features plus an intercept', ['weighted sum', 'linear combination', 'intercept', 'straight line', 'coefficient']], ['Least squares minimises the sum of squared residuals', ['squared', 'residual', 'sum of squares', 'minimi', 'error']], ['Solved with the normal equation or gradient descent', ['normal equation', 'gradient descent', 'closed form', 'closed-form', 'analytic']], ['Each coefficient is the change in the target per unit of that feature, holding others fixed', ['per unit', 'holding', 'other features', 'constant', 'interpret']]], model: 'Linear regression predicts the target as a weighted sum of the features plus an intercept. To choose the weights, ordinary least squares minimises the sum of the squared residuals, which are the differences between the actual and predicted values. Squaring means large errors are punished more and the problem has a single, smooth minimum. For small and medium data it can be solved directly with the normal equation. For large data or with regularisation I use gradient descent. Once fitted, each coefficient says how much the target changes per unit of that feature while the other features are held fixed, which is why the model is so easy to explain. That interpretation gets shaky when features are strongly correlated.' },
      { q: 'How does logistic regression turn a linear score into a probability, and how do you read its coefficients?', level: 'easy', points: [['Computes a linear score, then applies the sigmoid function', ['sigmoid', 'logistic function', 'squash', 'linear score', 'between 0 and 1']], ['Output is the probability of the positive class; threshold gives the class', ['probability', 'threshold', 'positive class', 'decision']], ['Coefficients are changes in log-odds', ['log-odds', 'log odds', 'logit']], ['Exponentiating a coefficient gives an odds ratio', ['odds ratio', 'exponent', 'multiplicative', 'odds']]], model: 'Logistic regression first computes the same linear score as linear regression, a weighted sum of the features. It then passes that score through the sigmoid function, which squashes any number into the range zero to one, and I read the result as the probability of the positive class. A threshold, often zero point five but tuned to the problem, converts it into a class. The coefficients are changes in the log-odds of the positive class per unit of the feature. If I exponentiate a coefficient I get an odds ratio, for example a value of one point five means the odds go up by fifty percent for each extra unit. That gives me an interpretable model that is a strong baseline for classification.' },
      { q: 'What does a coefficient in a linear model tell you, and why do you need to be careful interpreting it?', level: 'easy', points: [['Effect of a one-unit change in the feature on the prediction, others fixed', ['one unit', 'one-unit', 'per unit', 'others fixed', 'holding', 'constant']], ['Scale of the feature changes the size of the coefficient; standardise to compare', ['scale', 'standardis', 'standardiz', 'unit', 'compare']], ['Correlated features make coefficients unstable', ['correlat', 'collinear', 'unstable', 'multicollinear']], ['Association, not causation', ['causation', 'causal', 'association', 'confound']]], model: 'A coefficient says how much the prediction changes when that feature goes up by one unit while all the other features stay the same. So I can say each extra bedroom adds a certain amount to the predicted price. I need care in several ways. The size depends on the units of the feature, so a coefficient on income in dollars looks tiny next to one on age, and I standardise features before comparing their importance. If features are strongly correlated, the model can split the effect between them in arbitrary ways and the coefficients become unstable, even flipping sign. And a coefficient describes association in the data, not causation, because an unmeasured factor may drive both.' },
      { q: 'Why do you scale features for linear models, and which methods does it matter for?', level: 'medium', points: [['Gradient descent converges faster when features are on similar scales', ['gradient descent', 'converge', 'faster', 'similar scale', 'contours', 'zig']], ['Regularisation penalises coefficients, so scale changes who gets penalised', ['regulari', 'penalty', 'penalis', 'l1', 'l2', 'ridge', 'lasso', 'fair']], ['Standardisation: subtract mean and divide by standard deviation', ['standardis', 'standardiz', 'mean', 'standard deviation', 'z-score', 'min-max']], ['Fit the scaler on training data only', ['training data only', 'fit on train', 'leak', 'pipeline', 'training set']]], model: 'Scaling matters in two situations. First, when training with gradient descent, features with very different ranges create a stretched error surface, so the optimiser zig-zags and needs a smaller learning rate. Putting features on similar scales makes convergence much faster. Second, with regularisation such as ridge or lasso, the penalty is applied to the size of coefficients. A feature measured in tiny units needs a huge coefficient and would be penalised unfairly, so the penalty would depend on arbitrary units. I usually standardise, subtracting the mean and dividing by the standard deviation. Plain least squares via the normal equation does not need scaling for correctness. I always fit the scaler on training data only, inside a pipeline, to avoid leakage.' },
      { q: 'How do you choose the regularisation strength, and when would you use elastic net?', level: 'medium', points: [['Treat the strength as a hyperparameter and tune it with cross-validation', ['hyperparameter', 'cross-valid', 'tune', 'search', 'grid', 'validation']], ['Larger penalty means simpler model: more bias, less variance', ['bias', 'variance', 'simpler', 'shrink', 'underfit', 'overfit']], ['Plot validation error against the penalty and pick the sweet spot, or one-standard-error rule', ['curve', 'sweet spot', 'one standard error', 'plot', 'path']], ['Elastic net mixes L1 and L2, helps with correlated features and sparsity', ['elastic', 'mix', 'both', 'correlated', 'group', 'sparse', 'l1 and l2']]], model: 'The penalty strength is a hyperparameter, so I choose it with cross-validation over a grid of values on a log scale. As the penalty grows the coefficients shrink, which lowers variance but adds bias, so the validation error typically makes a U-shape and I pick near the bottom. Sometimes I choose the simplest model within one standard error of the best, for stability. Elastic net combines the L1 and L2 penalties. L1 alone can zero out coefficients but behaves erratically when features are highly correlated, picking one of a group arbitrarily. L2 alone keeps all features. Elastic net keeps the sparsity of L1 and the stability of L2, so I use it when I have many correlated features and want some selection.' },
      { q: 'Why does logistic regression use cross-entropy loss rather than mean squared error?', level: 'hard', points: [['Cross-entropy comes from maximum likelihood for a Bernoulli outcome', ['maximum likelihood', 'likelihood', 'bernoulli', 'probabilistic', 'log loss']], ['With sigmoid, squared error is non-convex and gives flat gradients when confidently wrong', ['non-convex', 'not convex', 'flat', 'saturat', 'vanish', 'plateau', 'confident']], ['Cross-entropy gradient is simply prediction minus label times the feature', ['prediction minus', 'error times', 'gradient', 'simple', 'clean']], ['Penalises confident wrong predictions heavily', ['penalis', 'penaliz', 'confident', 'heavily', 'infinite', 'log']]], model: 'Cross-entropy, also called log loss, is exactly the negative log-likelihood of the data when the label is a Bernoulli outcome, so minimising it is maximum likelihood estimation, a principled choice. It also behaves well with the sigmoid. If I used squared error on a sigmoid output, the loss surface is no longer convex, and when the model is confidently wrong the sigmoid is saturated, so the gradient is almost zero and learning stalls. With cross-entropy the gradient simplifies to the prediction minus the label, times the feature, so a bigger mistake gives a bigger gradient. It also punishes confident wrong predictions very strongly, because the log of a tiny probability is a large negative number, which is what I want from probabilistic outputs.' },
      { q: 'You add a feature to a linear model and several existing coefficients change sign and the standard errors blow up. What is going on and what do you do?', level: 'hard', points: [['Multicollinearity: the new feature is highly correlated with existing ones', ['multicollinear', 'collinear', 'correlated', 'redundant', 'linear combination']], ['Detect with correlation matrix or variance inflation factor', ['vif', 'variance inflation', 'correlation matrix', 'condition number', 'heatmap']], ['Predictions may stay fine but coefficients become unreliable', ['predict', 'unreliable', 'unstable', 'interpret', 'coefficient']], ['Fix: drop or combine features, use PCA, or apply ridge regularisation', ['drop', 'combine', 'pca', 'ridge', 'regulari', 'remove', 'principal']]], model: 'This looks like multicollinearity. The new feature is highly correlated with one or more existing features, so the model cannot tell which one deserves the credit. Many different coefficient combinations fit almost equally well, so the estimates become unstable, with large standard errors and sometimes flipped signs. I would confirm by checking the correlation matrix and computing the variance inflation factor, where values above roughly five to ten are a warning. Importantly, predictive accuracy can stay fine, so the problem matters mostly when I need to interpret coefficients. The fixes are to drop or merge redundant features, use dimensionality reduction like PCA, or apply ridge regularisation, which stabilises the estimates by shrinking correlated coefficients together.' }
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
      { q: 'Compare random forests and gradient boosting.', level: 'medium', points: [['Random forest: bagging, trees built independently', ['bagging', 'bootstrap', 'independent', 'parallel']], ['Boosting: trees built sequentially on errors', ['sequential', 'residual', 'previous', 'errors']], ['Forest reduces variance; boosting reduces bias', ['variance', 'bias']], ['Boosting is usually more accurate but needs more tuning', ['tuning', 'tune', 'overfit', 'learning rate', 'accura']]], model: 'Both are ensembles of decision trees. A random forest uses bagging: many deep trees are trained independently on bootstrap samples with random feature subsets and averaged, which reduces variance and is hard to get badly wrong. Gradient boosting trains shallow trees one after another, each fitting the residual errors of the ensemble, which reduces bias. Boosting, for example XGBoost or LightGBM, is usually more accurate on tabular data but is more sensitive to hyperparameters like learning rate, depth and number of trees, so it needs early stopping.' },
      { q: 'How does a decision tree decide where to split?', level: 'medium', points: [['Tries candidate features and thresholds', ['threshold', 'candidate', 'each feature', 'every feature']], ['Chooses the split with the largest impurity reduction', ['impurity', 'information gain', 'gini', 'entropy']], ['For regression it reduces variance or MSE', ['variance', 'mse', 'squared error']], ['Greedy and recursive until a stopping rule', ['greedy', 'recursive', 'depth', 'stopping', 'min samples']]], model: 'At each node the tree evaluates candidate splits across features and thresholds and picks the one that most reduces impurity, measured by Gini or entropy for classification and by variance for regression. It then repeats recursively on each child. The procedure is greedy, so it is not guaranteed to be globally optimal. Growth stops at a maximum depth, a minimum number of samples per leaf, or when no split improves purity, and these limits are how we control overfitting.' },
      { q: 'Why do gradient-boosted trees still beat deep learning on many tabular problems?', level: 'hard', points: [['Handle mixed feature types and scales without preprocessing', ['scal', 'mixed', 'categorical', 'preprocess']], ['Work well with small or medium data', ['small', 'medium', 'less data', 'amount of data']], ['Robust to irrelevant features and outliers', ['irrelevant', 'outlier', 'robust', 'missing']], ['Fast to train and tune', ['fast', 'cheap', 'quick', 'tun']]], model: 'Tabular data usually has heterogeneous features with different scales, missing values and irregular, non-smooth relationships. Trees split on thresholds, so they handle all of that without careful preprocessing and ignore uninformative features. They need far less data than neural networks, train in minutes on a CPU and have few hyperparameters. Deep learning wins when there is structure to exploit, such as images, text or sequences, or very large datasets.' },
      { q: 'What is a decision tree, and how does it make a prediction?', level: 'easy', points: [['Series of yes-no questions on features that split the data', ['question', 'split', 'if', 'rule', 'yes', 'branch']], ['Prediction follows a path from root to a leaf', ['root', 'leaf', 'path', 'follow', 'node']], ['Leaf gives the majority class or the mean value', ['majority', 'mean', 'average', 'class', 'value']], ['Easy to interpret and handles non-linear relationships', ['interpret', 'explain', 'non-linear', 'nonlinear', 'visual']]], model: 'A decision tree is a set of nested if-else questions learned from the data. Each internal node tests a feature, for example is age above thirty, and sends the example down one branch. To predict, I start at the root and follow the answers down to a leaf. For classification the leaf outputs the majority class of the training examples that landed there, or a probability from their proportions. For regression it outputs their average. Trees are popular because they are easy to explain and draw, they capture non-linear relationships and interactions without extra work, and they need little preprocessing. Their weakness is that a single deep tree overfits and changes a lot with small changes in the data.' },
      { q: 'What is bagging, and why does it reduce variance?', level: 'easy', points: [['Train many models on bootstrap samples of the data', ['bootstrap', 'resample', 'sample with replacement', 'subsets', 'many models']], ['Average or vote across the predictions', ['average', 'vote', 'aggregate', 'combine']], ['Averaging independent noisy models cancels out errors, lowering variance', ['variance', 'noise', 'cancel', 'stabil', 'smooth']], ['Random forest adds random feature selection to decorrelate trees', ['random forest', 'random feature', 'decorrelat', 'subset of features', 'max_features']]], model: 'Bagging stands for bootstrap aggregating. I draw many random samples from the training set, with replacement, train a separate model on each, and combine them by averaging for regression or voting for classification. A single deep tree has low bias but high variance: small changes in the data give a very different tree. Averaging many such trees cancels out much of their individual noise, so the ensemble has much lower variance while keeping the low bias. The more different the trees are from each other, the better the averaging works. That is why a random forest also picks a random subset of features at each split, which decorrelates the trees. A bonus is the out-of-bag samples, which give a free validation estimate.' },
      { q: 'Do tree-based models need feature scaling, and how do they handle categorical and missing values?', level: 'easy', points: [['No scaling needed because splits depend only on order of values', ['no scaling', 'not needed', 'order', 'monotonic', 'threshold', 'invariant']], ['Categorical variables usually need encoding, though some libraries support them natively', ['encod', 'categorical', 'native', 'lightgbm', 'catboost', 'one-hot']], ['Some implementations handle missing values natively by learning a default direction', ['missing', 'native', 'default direction', 'xgboost', 'lightgbm', 'surrogate']], ['Tree models cannot extrapolate beyond the training range', ['extrapolat', 'range', 'outside', 'beyond']]], model: 'Tree models do not need feature scaling, because a split is just a threshold on a feature and only the ordering of values matters, so standardising or taking monotonic transforms changes nothing. For categorical features, scikit-learn trees need them encoded, for example one-hot or ordinal, while libraries like LightGBM and CatBoost can handle categories natively. For missing values, XGBoost and LightGBM learn a default direction for missing entries at each split, whereas with other tools I impute first. One thing to remember is that trees cannot extrapolate. A tree predicts a constant per leaf, so if the test data goes beyond the training range, for example in a trending series, predictions flatten at the edge of what it has seen.' },
      { q: 'How do you stop a decision tree from overfitting?', level: 'medium', points: [['Limit the depth, the number of leaves, or require a minimum samples per leaf or split', ['max depth', 'depth', 'min samples', 'minimum samples', 'leaf', 'limit']], ['Prune the tree, either pre-pruning or cost-complexity post-pruning', ['prun', 'cost complexity', 'ccp', 'alpha']], ['Use ensembles such as random forests or boosting with regularisation', ['ensemble', 'random forest', 'boost', 'regulari']], ['Tune with cross-validation', ['cross-valid', 'validation', 'tune', 'grid']]], model: 'An unconstrained tree keeps splitting until each leaf is nearly pure, which memorises the training data. I control that in a few ways. Pre-pruning limits growth: a maximum depth, a maximum number of leaves, and a minimum number of samples required to split or to sit in a leaf. Post-pruning grows the tree fully and then removes branches that do not improve validation performance enough, using cost-complexity pruning with a penalty on the number of leaves. All these settings are hyperparameters, so I choose them with cross-validation. In practice the most effective solution is often to move to an ensemble, such as a random forest, which averages away variance, or boosting with shallow trees, a small learning rate and early stopping.' },
      { q: 'How would you tune a gradient-boosted tree model such as XGBoost or LightGBM?', level: 'medium', points: [['Use early stopping on a validation set to choose the number of trees', ['early stopping', 'number of trees', 'n_estimators', 'validation', 'rounds']], ['Lower learning rate with more trees', ['learning rate', 'eta', 'shrinkage', 'small']], ['Control complexity: tree depth or leaves, minimum child weight, regularisation', ['depth', 'num_leaves', 'leaves', 'min_child', 'regulari', 'lambda', 'gamma']], ['Row and column subsampling for variance reduction', ['subsample', 'colsample', 'sampling', 'bagging fraction', 'feature fraction']], ['Search with random search or Bayesian optimisation under cross-validation', ['random search', 'bayesian', 'optuna', 'cross-valid', 'grid']]], model: 'I start with sensible defaults and a moderate learning rate such as zero point one, and use early stopping on a validation set so the number of trees is chosen automatically rather than guessed. Then I tune complexity: the maximum depth or number of leaves, the minimum samples or hessian weight per leaf, and the regularisation terms. Row subsampling and column subsampling add randomness that reduces variance. Once I have found a good region, I lower the learning rate and let early stopping add more trees, which usually gives a small final gain. I search with random search or a Bayesian tool like Optuna under cross-validation, and keep the test set untouched. I also check the learning curves to see whether I am fighting bias or variance.' },
      { q: 'Explain how gradient boosting works, step by step.', level: 'hard', points: [['Start with a simple initial prediction such as the mean', ['initial', 'mean', 'constant', 'start', 'base']], ['Each new tree is fit to the residuals, the negative gradient of the loss', ['residual', 'negative gradient', 'gradient', 'errors', 'mistakes']], ['Add the tree to the ensemble scaled by a learning rate', ['learning rate', 'shrinkage', 'scaled', 'add', 'small step']], ['Repeat sequentially; reduces bias, so shallow trees are used', ['sequential', 'repeat', 'bias', 'shallow', 'weak learner', 'stump']], ['Overfits if run too long, so use early stopping and regularisation', ['overfit', 'early stopping', 'regulari', 'too many trees']]], model: 'Gradient boosting builds an ensemble one small tree at a time. It starts with a constant prediction, such as the mean of the target. Then it measures how wrong the current model is, using the negative gradient of the loss, which for squared error is just the residuals. It fits a shallow tree to predict those residuals, adds that tree to the model scaled by a small learning rate, and repeats. Each step nudges the predictions in the direction that reduces the loss, a form of gradient descent in function space. Because every tree corrects the previous errors, boosting mostly reduces bias, so I use weak learners like trees of depth three to six. If it runs too long it overfits, so I use early stopping and regularisation.' },
      { q: 'Why can impurity-based feature importance from a tree model mislead you, and what do you use instead?', level: 'hard', points: [['Impurity importance is biased toward high-cardinality or continuous features', ['cardinality', 'continuous', 'biased', 'many values', 'bias']], ['Correlated features split the importance between them', ['correlat', 'split', 'share', 'dilute', 'redundant']], ['Computed on training data so it reflects overfitting', ['training data', 'training set', 'overfit', 'not on test', 'in-sample']], ['Permutation importance on held-out data measures real predictive impact', ['permutation', 'held-out', 'held out', 'validation', 'shuffle']], ['SHAP values give per-prediction attributions', ['shap', 'per prediction', 'per-prediction', 'local', 'attribution']]], model: 'The default importance in tree libraries adds up how much each feature reduced impurity across all splits. It has problems. It favours features with many distinct values, because they offer more candidate split points, so a random ID column can look important. When features are correlated the importance is shared between them or credited to whichever the tree happened to pick. And it is computed on the training data, so it also rewards features that only help the model overfit. A better approach is permutation importance on held-out data: shuffle one feature and see how much the validation score drops. For understanding individual predictions and interactions I use SHAP values. Neither shows causation, so I treat them as diagnostics.' }
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
      { q: 'How do you handle missing values?', level: 'medium', points: [['First understand why values are missing', ['why', 'reason', 'pattern', 'mechanism', 'random']], ['Options: drop, impute with median or mode, or model-based', ['impute', 'median', 'mean', 'mode', 'drop']], ['Add a missing indicator', ['indicator', 'flag', 'is missing', 'was missing']], ['Fit imputation on training data only', ['training only', 'train only', 'leak', 'training data', 'training set']]], model: 'I start by asking why the data is missing, because missingness can itself carry signal, for example a customer who never filled in a field. If very few rows are affected I may drop them. Otherwise I impute: median for skewed numeric features, mode or a separate "unknown" category for categoricals, and I add a binary indicator that the value was missing. Tree models such as XGBoost can handle missing values natively. Any imputer is fitted on the training fold only, to avoid leakage.' },
      { q: 'How do you encode categorical features, especially ones with many categories?', level: 'medium', points: [['One-hot for low cardinality', ['one-hot', 'one hot', 'dummy']], ['Ordinal encoding when there is a natural order', ['ordinal', 'order']], ['Target or frequency encoding for high cardinality', ['target encod', 'frequency', 'mean encod', 'count encod']], ['Embeddings or hashing for very large vocabularies', ['embedding', 'hash']], ['Guard against leakage and unseen categories', ['leak', 'unseen', 'unknown', 'smooth']]], model: 'For a handful of categories I one-hot encode. If the categories have a natural order, like education level, I use ordinal encoding. For high cardinality, such as city or product ID, one-hot becomes too wide, so I use frequency encoding or target encoding with smoothing, computed inside each training fold to avoid leaking the label. With deep models I learn embeddings, and for very large or changing vocabularies I use the hashing trick. I always plan for categories that were not seen in training.' },
      { q: 'Tell me about feature engineering that made a real difference in a project.', level: 'hard', points: [['Context: the problem and the baseline', ['baseline', 'problem', 'project', 'goal']], ['The feature idea and where it came from', ['feature', 'domain', 'idea', 'noticed', 'aggregat', 'ratio', 'window']], ['How you validated it', ['validat', 'cross-valid', 'a/b', 'ablation', 'test']], ['A measured result', ['improv', 'increase', 'reduc', 'percent', '%', 'lift']]], model: 'A strong answer uses a real project in STAR form. For example: on a churn model the baseline with raw account fields had an AUC of 0.71. Talking to the support team, I learned that customers who churn usually reduce usage weeks before. I built rolling-window features: sessions in the last 7 days against the previous 30, and days since last login, computed strictly from data before the prediction date. Cross-validation by time showed AUC rising to 0.79, and the retention campaign that used the model reduced churn by a measurable amount. Name the idea, how you checked it and the number.' },
      { q: 'What is the difference between standardisation and min-max scaling, and when do you scale at all?', level: 'easy', points: [['Standardisation subtracts the mean and divides by the standard deviation', ['standardis', 'standardiz', 'mean', 'standard deviation', 'z-score']], ['Min-max rescales to a fixed range such as zero to one', ['min-max', 'minmax', 'range', 'zero to one', '0 to 1', '0 and 1']], ['Needed for distance-based and gradient-based models, regularised models and neural networks', ['distance', 'knn', 'svm', 'gradient', 'neural', 'regulari', 'pca']], ['Not needed for tree models; fit the scaler on training data only', ['tree', 'not needed', 'training data', 'leak', 'fit on train']]], model: 'Standardisation subtracts the mean and divides by the standard deviation, so each feature has mean zero and unit spread. Min-max scaling squeezes values into a fixed range, usually zero to one, using the minimum and maximum. Standardisation is my default, because min-max is sensitive to outliers: one extreme value squashes everyone else. I scale when the algorithm depends on distances or on the size of coefficients: k-nearest neighbours, SVMs, PCA, clustering, regularised linear models and neural networks. Tree-based models do not need it. Whichever I use, I fit the scaler on the training data only and then apply it to validation and test data, ideally inside a pipeline, so no information leaks from the test set.' },
      { q: 'How do you spot and handle outliers?', level: 'easy', points: [['Detect with plots and rules such as box plots, z-scores or the interquartile range', ['box plot', 'boxplot', 'z-score', 'iqr', 'interquartile', 'histogram', 'plot']], ['First decide whether it is an error or a real extreme value', ['error', 'real', 'valid', 'genuine', 'mistake', 'data entry', 'investigate']], ['Options: fix, cap or winsorise, transform with a log, or keep', ['cap', 'winsor', 'clip', 'log', 'transform', 'remove', 'keep']], ['Use robust models or metrics when outliers are real and important', ['robust', 'median', 'tree', 'huber', 'mae', 'fraud']]], model: 'I begin by looking: histograms, box plots, and rules such as values beyond one and a half times the interquartile range or more than three standard deviations from the mean. Then the key question is whether the outlier is an error, like a typo or a sensor fault, or a genuine extreme, like a very large customer. Errors I fix or remove. For genuine extremes the choices depend on the goal. I can cap values at a percentile, known as winsorising, apply a log transform to compress a long tail, or keep them and use robust methods such as tree models, the median, or a Huber loss. If the rare extreme is the thing I want to predict, like fraud, removing it would destroy the signal.' },
      { q: 'What is the difference between feature selection and feature extraction?', level: 'easy', points: [['Selection keeps a subset of the original features', ['subset', 'keep', 'select', 'drop', 'original']], ['Extraction creates new features from combinations, such as PCA or embeddings', ['new feature', 'pca', 'combination', 'embedding', 'transform', 'project']], ['Selection methods: filter, wrapper, embedded such as L1 or tree importance', ['filter', 'wrapper', 'embedded', 'l1', 'lasso', 'importance', 'recursive']], ['Reasons: less overfitting, faster training, easier interpretation', ['overfit', 'faster', 'interpret', 'simpler', 'curse', 'noise']]], model: 'Feature selection chooses a subset of the existing features and drops the rest, so the remaining ones keep their meaning. Feature extraction builds new features from the originals, for example principal components, which are combinations of many columns, or learned embeddings. People select or extract to reduce overfitting, speed up training, cut serving costs and make the model easier to understand. For selection I can use filter methods, like correlation or mutual information with the target, wrapper methods like recursive feature elimination, or embedded ones, such as L1 regularisation or tree importance. Extraction usually improves compactness but costs interpretability. In both cases I do the selection inside cross-validation, otherwise the choice itself leaks information.' },
      { q: 'How do you create useful features from date and time columns?', level: 'medium', points: [['Extract components: hour, day of week, month, weekend, holiday', ['hour', 'day of week', 'weekday', 'month', 'weekend', 'holiday', 'component']], ['Cyclical encoding with sine and cosine for periodic values', ['cyclic', 'sine', 'cosine', 'sin', 'cos', 'periodic', 'wrap']], ['Elapsed time features such as days since signup or since last event', ['days since', 'elapsed', 'recency', 'time since', 'difference', 'age']], ['Rolling or lag aggregates, built using only past data', ['rolling', 'lag', 'aggregate', 'window', 'past', 'leak']]], model: 'I first break the timestamp into components that carry signal, such as hour, day of week, month, whether it is a weekend or holiday. For periodic values like hour or month, I can use sine and cosine encoding so that twenty-three and zero are close together, which matters for linear models and neural networks. Trees can cope with plain integers. Next come elapsed-time features, such as days since signup, time since the last purchase, or account age, which are often the strongest. Finally rolling and lag aggregates, like the number of orders in the last seven days. The important rule is that they are computed using only information available before the prediction time, and I split train and test chronologically to avoid leakage.' },
      { q: 'What problems can happen when you merge tables in pandas, and how do you guard against them?', level: 'medium', points: [['Many-to-many or duplicate keys multiply rows', ['duplicate', 'many-to-many', 'multiply', 'row count', 'explode', 'fan']], ['Wrong join type drops or keeps unmatched rows', ['inner', 'left', 'how=', 'unmatched', 'drop', 'nan']], ['Use validate argument and check row counts and uniqueness before and after', ['validate', 'row count', 'unique', 'shape', 'assert', 'before and after', 'check']], ['Mismatched key types or whitespace and case', ['dtype', 'type', 'whitespace', 'case', 'strip', 'mismatch']]], model: 'The classic problem is a silent change in the number of rows. If the key is duplicated in the right-hand table, each matching left row is repeated, so a one-to-many or many-to-many merge inflates counts and makes later sums wrong. The second is picking the wrong join type: an inner join quietly drops unmatched rows, while a left join fills missing values with NaN. The third is keys that look equal but are not, such as integers versus strings, trailing spaces or different capitalisation. To guard against these, I check key uniqueness first, use the validate argument in merge, such as one-to-one or many-to-one, and assert the row count and the number of missing matches before and after. The indicator option also shows which rows matched.' },
      { q: 'How do you use target encoding without leaking the label?', level: 'hard', points: [['Target encoding replaces a category with the average target for that category', ['average target', 'mean target', 'replace', 'category', 'mean of the target']], ['Naive version leaks the row’s own label and overfits, especially for rare categories', ['leak', 'own label', 'overfit', 'rare', 'small categories']], ['Compute out-of-fold, so each row is encoded using other folds', ['out-of-fold', 'out of fold', 'k-fold', 'cross-fit', 'folds', 'other rows']], ['Smooth toward the global mean and add noise', ['smooth', 'shrink', 'global mean', 'prior', 'noise', 'regulari']], ['Fit encoder on training only and apply it to test', ['training only', 'pipeline', 'test set', 'apply', 'fit on train']]], model: 'Target encoding replaces each category with the average target value of that category, which is powerful for high-cardinality features. The danger is that a row’s own label contributes to its encoding. For rare categories, with one or two rows, the encoding practically equals the label, so the model learns to trust it and overfits badly. To avoid this I compute the encoding out-of-fold: split the training data into folds, and encode each fold using statistics from the other folds only. I also smooth the category mean toward the global mean, with more weight on the global mean when the category has few examples, and sometimes add a little noise. For the test set I use the encoding fitted on the full training data, and all this lives inside a pipeline.' },
      { q: 'How do you make sure features are computed identically at training time and in production?', level: 'hard', points: [['Training-serving skew is a common silent failure', ['skew', 'mismatch', 'differ', 'silent', 'inconsisten']], ['Use one shared code path or a feature store for both', ['same code', 'shared', 'feature store', 'single', 'reuse', 'library']], ['Point-in-time correct data to avoid future information', ['point-in-time', 'point in time', 'as of', 'future', 'leak', 'timestamp']], ['Log served features and compare distributions to training', ['log', 'compare', 'distribution', 'monitor', 'drift', 'validate']], ['Version and test the transformations', ['version', 'unit test', 'test', 'schema', 'contract']]], model: 'The risk is training-serving skew: the offline pipeline computes a feature one way and the online service computes it slightly differently, so the model sees inputs it was never trained on, and accuracy drops without any error message. The best defence is to share the logic, either by packaging the transformation code as one library used in both places, or with a feature store that serves the same definitions offline and online. Training data must also be point-in-time correct, meaning each row’s features are computed as of the prediction time, with no future information. In production I log the features actually served, compare their distributions with the training set, and alert on differences. Finally, transformations are versioned and unit tested, with schema checks on missing or unexpected values.' }
    ]
  }
];
