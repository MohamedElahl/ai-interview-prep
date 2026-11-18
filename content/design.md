=== design-cases ===
# How to use these cases

Each case applies the framework from the ML system design topic: clarify, metrics, data, baseline, model, serving, evaluation, monitoring. Practise saying each case aloud in about 15 minutes, and always end with the biggest risk and what you would build first.

| Case | Core difficulty | First build |
| --- | --- | --- |
| Recommendation feed | Feedback loops | Popularity baseline and impression logging |
| Card fraud | Delayed, biased labels; milliseconds | Rules and shadow scoring |
| Search ranking | Position bias | BM25 and a judgement set |
| Ad click prediction | Calibration | Logistic regression with calibration |
| Arrival time | Asymmetric cost | Distance baseline and timestamps |
| Content moderation | Rare harm, human capacity | Hashing, rules, review tool |
| Document Q&A (RAG) | Permissions, stale text | Ingestion, retrieval, eval set |
| Driver-assistance perception | Safety, rare events, embedded | Baseline detector and slices |

# 1. Recommendation feed

- **Requirements:** a home feed of about 50 items, a response within 200 ms, millions of daily users.
- **Clarify:** what to optimise (purchases, watch time, return visits) and what must not get worse (complaints, latency, diversity).
- **Metrics:** business: satisfied watch time or purchases per user, with complaint rate as a guardrail. Offline: recall@k and NDCG on a time-based split.
- **Data:** impression logs with position, clicks, watch time. A non-click may mean "not seen", and you only observe what was shown.
- **Architecture:** several retrieval sources give a few hundred candidates, then filter, rank with a model on user, item and context features, then re-rank for diversity. Budget: retrieval 30 ms, features 20 ms, ranking 60 ms, re-ranking 10 ms.
- **Baseline:** popular items per region and category plus the user’s recent topics.
- **Evaluation:** offline replay, then an A/B test with a long enough window to see return behaviour.
- **Risks:** feedback loop and clickbait. Reserve logged exploration slots and add long-term metrics.

# 2. Real-time card fraud detection

- **Requirements:** decide in under 100 ms, thousands of transactions per second, fraud around 0.1%.
- **Clarify:** cost of a missed fraud against a false decline, and the actions available: approve, decline, step-up verification.
- **Metrics:** expected cost, recall at a fixed false-positive rate, PR-AUC. Never accuracy.
- **Data:** labels come from disputes weeks later. Declined payments have no label, so keep a small random approve sample.
- **Architecture:** rules for hard blocks, streaming counters (payments per card or device in the last 10 minutes) in a low-latency store, gradient-boosted trees, a threshold from costs (flag when p exceeds false-alarm cost divided by the sum of both costs), and an analyst queue for the middle band. Lookup 20 ms, model 10 ms, rules 5 ms.
- **Baseline:** velocity, amount and country rules.
- **Evaluation:** time-based splits, then shadow mode on live traffic, then gradual rollout.
- **Risks:** adaptive attackers and drift. Retrain often and monitor score distributions.

# 3. Search ranking

- **Requirements:** results for a free-text query within about 300 ms over millions of documents.
- **Clarify:** query intent (exact lookup or exploration), languages, how many results are seen, what success means.
- **Metrics:** online: search success or conversion, abandonment, zero-result rate, with latency as a guardrail. Offline: NDCG@10 on graded human judgements.
- **Data:** human grades (0 to 3) plus clicks. Clicks carry position bias, so weight them by examination probability or fix position at serving.
- **Architecture:** query understanding (spelling, language, intent), keyword plus embedding retrieval for a few thousand candidates, a learning-to-rank model (gradient-boosted trees with a ranking objective) on the top few hundred, an optional cross-encoder on the top 30, then business rules.
- **Baseline:** BM25 with tuned field boosts.
- **Evaluation:** offline NDCG, interleaving for quick comparison, then an A/B test.
- **Risks:** rich-get-richer effects from clicks and weak long-tail queries. Keep some randomised data.

# 4. Ad click-through-rate prediction

- **Requirements:** score about 500 candidate ads in 50 ms; ads are ranked by bid multiplied by predicted click probability.
- **Clarify:** auction type, whether conversions matter, advertiser budgets, where the probability is used.
- **Metrics:** business: revenue per thousand impressions with advertiser return and user complaints as guardrails. Offline: log-loss, AUC and calibration by slice.
- **Data:** clicks are 1 to 2% of impressions. Features are mostly sparse categories (ad, site, user segment), handled with hashing or embeddings. If you downsample non-clicks, correct the probabilities afterwards.
- **Architecture:** feature fetch about 15 ms, batch scoring about 20 ms, calibration layer, auction.
- **Baseline:** smoothed historical click rate, then logistic regression on hashed feature crosses.
- **Model:** a deep model with feature interactions, followed by calibration.
- **Evaluation:** future-day log-loss, then an A/B test that accounts for shared budgets, since arms compete for the same money.
- **Risks:** miscalibration, drift, and new ads never shown. Reserve exploration traffic.

# 5. Delivery or ride arrival time (ETA)

- **Requirements:** a quote at order time, refreshed every 30 seconds for all active orders (200,000 orders means about 6,700 predictions per second).
- **Clarify:** is it a promise shown to customers, an input to dispatch, or both? Lateness usually costs more than earliness.
- **Metrics:** mean absolute error, plus the share of orders later than the quoted upper bound and range coverage. Business: complaints and cancellations.
- **Data:** completed trips only, so slow cancelled orders are missing (censoring). Preparation-time timestamps are noisy because restaurants mark orders ready late.
- **Architecture:** static features (distance, restaurant history) plus live features (kitchen queue, rider supply, weather), separate prep-time and travel-time models summed with a handover buffer, quantile outputs, logging of predicted and actual times.
- **Baseline:** distance over average speed plus typical prep time by hour.
- **Evaluation:** time split, slices by city, hour and weather, then an A/B test.
- **Risks:** a short ETA wins orders but adds load, which slows deliveries. Monitor that loop.

# 6. Content moderation

- **Requirements:** about 2,000,000 posts a day, text and images, several harm categories, a fixed reviewer capacity.
- **Clarify:** the written policy by category and region, cost of wrongful removal against a miss, act before or after publishing, appeal process.
- **Metrics:** precision and recall per category and language; business: views of harmful content before action, appeal overturn rate.
- **Data:** reviewers disagree and policies change, so measure agreement. Only flagged posts get reviewed, so sample unflagged posts at random to estimate misses.
- **Architecture:** a fast text and hash check before publish (under 100 ms), image and text classifiers within seconds, two thresholds: automatic action when confident, a human queue for the middle band. At 4% sent to review, 2,000,000 posts means 80,000 reviews a day, which must match capacity.
- **Baseline:** blocklists, hash matching of known images, user reports.
- **Evaluation:** per-slice offline metrics, shadow mode, human audits.
- **Risks:** evasion by editing, over-removal in some languages and dialects. Monitor by slice.

# 7. Document question answering (RAG)

- **Requirements:** thousands of employees, hundreds of thousands of documents, answers in about 5 seconds.
- **Clarify:** who may see which document, freshness, languages, whether data can leave the company, what to do when no answer exists.
- **Metrics:** retrieval recall@k, answer faithfulness (supported by the passages), helpfulness. Business: time saved or support tickets avoided.
- **Data:** parse, chunk to a few hundred tokens, store embeddings with metadata: owner, date, version and access rules. Build the evaluation set from real questions with known source passages.
- **Architecture:** check permissions, retrieve with hybrid search filtered by permissions, re-rank 50 passages to about 5, generate with citations or abstain. Budget: retrieval 200 ms, re-rank 300 ms, generation 300 tokens at 100 tokens per second is 3 s.
- **Baseline:** hybrid search showing passages and links, no generation.
- **Evaluation:** measure retrieval and faithfulness separately so you know which stage failed; calibrate any automated judge against human checks.
- **Risks:** permission leaks (filter before the model sees text), stale versions, confident wrong answers.

# 8. Driver-assistance perception

- **Requirements:** a front camera at 30 frames per second, so 33 ms per frame, on an embedded chip, and a safety-relevant output.
- **Clarify:** the operating domain (speeds, roads, light, weather), what the function does (warn or brake), the required failure rates.
- **Metrics:** recall per class (pedestrian, vehicle, lane) by distance and condition at a fixed number of false alarms per hour; mAP offline.
- **Data:** fleet recordings skew to dry daytime. Mine rare cases, add night and rain, label with a mix of humans and auto-labelling, and evaluate every slice.
- **Architecture:** preprocessing, a quantised 8-bit detector, tracking across frames, radar fusion for distance and speed, and a safety monitor for a dirty lens or low confidence with graceful degradation.
- **Baseline:** a small pretrained detector fine-tuned on your data.
- **Evaluation:** replay recorded drives, silent shadow mode in vehicles, then closed-loop tests.
- **Risks:** rare unseen situations and false braking. Limit the operating domain and design a safe fallback.

# Closing checklist

Name the metric, the baseline, the latency budget, the label bias, the evaluation order (offline, shadow, A/B) and the biggest risk. Then say what you would build first.
