=== ml-fundamentals ===
# What interviewers check

These questions appear in every AI interview, at every level. You need crisp definitions and a real example for each.

# Bias and variance

- **High bias (underfitting).** Training and validation scores are both poor. Fix with a richer model or better features.
- **High variance (overfitting).** Training score is high, validation score is much lower. Fix with more data, regularisation, a simpler model or early stopping.

# Splitting data properly

- Train, validation, test. The test set is used once, at the end.
- **k-fold cross-validation** gives a more stable estimate on small data.
- Stratify for imbalanced classes. Split by **time** for time series and by **group** when one user has many rows.

# Data leakage

Leakage is training on information you will not have at prediction time. Typical causes:

- Fitting a scaler, imputer or encoder on the full dataset before splitting.
- A feature that is recorded after the outcome.
- Duplicates or the same user in both train and test.

The rule: split first, then fit every preprocessing step on the training fold only.

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

model = make_pipeline(StandardScaler(), LogisticRegression())
scores = cross_val_score(model, X, y, cv=5)   # scaler is re-fitted inside each fold
```

# Regularisation

- **L2 (ridge)** shrinks weights smoothly.
- **L1 (lasso)** pushes some weights to zero, which selects features.
- Dropout, early stopping and data augmentation play the same role in deep learning.

# Model choice

Start with a simple baseline. Add complexity only when it buys a measurable gain on the metric that matters.

=== metrics ===
# What interviewers check

Choosing the wrong metric is a classic way to fail a case question. Always tie the metric to the business cost of each kind of error.

# Classification

| Metric | Formula | Use when |
| --- | --- | --- |
| Accuracy | correct / all | Classes are balanced |
| Precision | TP / (TP + FP) | False alarms are costly |
| Recall | TP / (TP + FN) | Misses are costly |
| F1 | harmonic mean of the two | You need one number for both |
| ROC AUC | P(random positive ranks above random negative) | Comparing rankers |
| PR AUC | area under precision-recall | Positives are rare |

- The **threshold** trades precision against recall. Choose it from the cost of errors.

Move the threshold and watch the confusion matrix change.

[[demo:threshold]]

- On imbalanced data, accuracy is misleading: predicting the majority class already scores high.
- **Calibration** matters when the probability itself is used, for example expected revenue.

# Regression

- **MAE**: average absolute error, robust to outliers, in the target's units.
- **RMSE**: penalises large errors more.
- **R²**: share of variance explained. It can look good with a poor model on trending data.

# Ranking and generation

- **Recall@k, NDCG** for search and recommendation.
- **Exact match, F1, BLEU, ROUGE** for text, plus human or LLM-judge evaluation for open-ended output.

# Offline and online

An offline metric is a proxy. Confirm with an A/B test on the business metric, and monitor after launch.

=== linear-models ===
# What interviewers check

Linear models are the standard "implement it from scratch" question, and the base for understanding neural networks.

# Linear regression

- Model: `y_hat = X @ w + b`. Loss: mean squared error.
- Gradient: `dw = (2/n) * X.T @ (y_hat - y)`.
- Closed form exists (`w = (XᵀX)⁻¹ Xᵀy`), but gradient descent scales better.

```python
for _ in range(epochs):
    err = X @ w + b - y
    w -= lr * (2 / n) * (X.T @ err)
    b -= lr * (2 / n) * err.sum()
```

# Logistic regression

- Model: `p = sigmoid(X @ w + b)`. Loss: log-loss (cross-entropy).
- Gradient has the same shape: `dw = X.T @ (p - y) / n`.
- Coefficients are changes in **log-odds**. `exp(coef)` is the odds ratio.
- The decision boundary is linear.

# Gradient descent

- **Learning rate** too high diverges, too low crawls. Try it:

[[demo:gd]]

- **Batch** uses all data per step, **stochastic** one sample, **mini-batch** a small batch (the usual choice).
- Scale features first: it makes the loss surface well conditioned.

# Regularisation

- Ridge adds `lambda * sum(w²)`, lasso adds `lambda * sum(|w|)`.
- Tune `lambda` by cross-validation.

# Assumptions to mention

Linearity, independent errors with constant variance, and no strong multicollinearity. Check with residual plots.

=== trees ===
# What interviewers check

Gradient-boosted trees win most tabular problems in industry, so expect to explain how they work and how to tune them.

# Decision trees

- At each node, try candidate thresholds on each feature and take the split that most reduces impurity.
- **Gini**: `1 - sum(p²)`. **Entropy**: `-sum(p * log2 p)`. Regression trees reduce variance.
- Greedy and recursive. Control overfitting with `max_depth`, `min_samples_leaf` and pruning.
- No scaling needed. Easy to explain. A single tree has high variance.

# Random forest (bagging)

- Train many deep trees on bootstrap samples, each split considering a random subset of features.
- Average the trees. This reduces variance.
- Hard to get badly wrong, parallel, gives out-of-bag error for free.

# Gradient boosting

- Train shallow trees one after another. Each fits the residual errors (negative gradient) of the ensemble.
- This reduces bias. Libraries: XGBoost, LightGBM, CatBoost.
- Key settings: learning rate, number of trees (with early stopping), depth, row and column subsampling.

| | Random forest | Gradient boosting |
| --- | --- | --- |
| Trees built | Independently | Sequentially |
| Mainly reduces | Variance | Bias |
| Tuning effort | Low | Higher |
| Typical accuracy | Good | Usually best on tabular data |

# Feature importance

Split-based importance is biased towards high-cardinality features. Prefer permutation importance or SHAP values, and say so in the interview.

=== feature-eng ===
# What interviewers check

Good features beat clever models on tabular data. You will be asked how you treat messy data and to write pandas live.

# pandas you must be fluent in

```python
df.groupby("user_id")["amount"].agg(n="count", total="sum", avg="mean").reset_index()
df.merge(users, on="user_id", how="left")
df["month"] = pd.to_datetime(df["ts"]).dt.month
df.sort_values("ts").groupby("user_id")["amount"].rolling(3).mean()
df.pivot_table(index="user", columns="category", values="amount", aggfunc="sum", fill_value=0)
```

# Missing values

- Ask why they are missing. It is often a signal.
- Impute with the median or mode, and add an "is missing" flag.
- Fit the imputer on training data only.

# Categorical features

- **One-hot** for few categories.
- **Ordinal** when there is a real order.
- **Target or frequency encoding** for many categories, computed inside the training fold.
- **Embeddings** in deep models.

# Numeric features

- Scale for linear models, k-NN, SVMs and neural networks. Trees do not need it.
- Log-transform skewed values such as income.
- Clip or winsorise extreme outliers.

# Features that often help

- Aggregates per entity: counts, sums, averages, recency.
- Ratios and differences: this week against last month.
- Date parts: hour, weekday, holiday.

# The leakage test

For every feature ask: "Would I know this value at the moment I make the prediction?" If not, remove it.
