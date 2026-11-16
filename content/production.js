const R = String.raw;

export default [
  {
    id: 'mlops', title: 'MLOps and model deployment', tracks: ['mlops', 'mle', 'genai', 'ds'],
    tasks: [
      {
        id: 'ops-psi', title: 'Drift: population stability index',
        prompt: `PSI measures how far a feature's distribution in production has moved from training. Write \`psi(expected_counts, actual_counts, eps=1e-6)\` for two lists of counts over the same bins.

- Convert each list to proportions.
- Replace any proportion below \`eps\` with \`eps\` (avoids log of zero).
- \`psi = sum((a - e) * ln(a / e))\`

Rule of thumb: below 0.1 is stable, above 0.25 is a significant shift.`,
        starter: R`import math

def psi(expected_counts, actual_counts, eps=1e-6):
    pass

print(psi([50, 50], [70, 30]))  # about 0.169
`,
        solution: R`import math

def psi(expected_counts, actual_counts, eps=1e-6):
    te, ta = sum(expected_counts), sum(actual_counts)
    total = 0.0
    for e, a in zip(expected_counts, actual_counts):
        pe = max(e / te, eps)
        pa = max(a / ta, eps)
        total += (pa - pe) * math.log(pa / pe)
    return total
`,
        tests: [
          { name: 'Identical distributions', code: R`assert close(psi([10, 20, 30], [100, 200, 300]), 0.0), 'Same proportions give 0, whatever the sample size'` },
          { name: 'Shifted distribution', code: R`assert close(psi([50, 50], [70, 30]), 0.1694596, 1e-5), 'Expected about 0.1695'` },
          { name: 'Symmetric', code: R`assert close(psi([50, 50], [70, 30]), psi([70, 30], [50, 50])), 'PSI is the same in both directions'` },
          { name: 'Empty bin does not crash', code: R`import math
v = psi([50, 50, 0], [40, 40, 20])
assert math.isfinite(v) and v > 0.25, 'An empty bin must be clipped to eps, and this shift is significant'` }
        ]
      },
      {
        id: 'ops-percentile', title: 'Latency percentile',
        prompt: `Service latency is reported as p50, p95 and p99, not as the mean. Write \`percentile(values, q)\` using the nearest-rank method:

- Sort the values.
- \`rank = ceil(q * n / 100)\`, with a minimum of 1.
- Return the value at that rank (rank 1 is the smallest).`,
        starter: R`import math

def percentile(values, q):
    pass

print(percentile([120, 80, 95, 300, 110], 95))  # 300
`,
        solution: R`import math

def percentile(values, q):
    ordered = sorted(values)
    rank = max(1, math.ceil(q * len(ordered) / 100))
    return ordered[rank - 1]
`,
        tests: [
          { name: 'p95 of 1..100', code: R`assert percentile(list(range(1, 101)), 95) == 95, 'The 95th percentile of 1..100 is 95'` },
          { name: 'Median of unsorted values', code: R`assert percentile([5, 1, 3], 50) == 3, 'Sort first: the median of [5, 1, 3] is 3'` },
          { name: 'Tail is dominated by outliers', code: R`assert percentile([120, 80, 95, 300, 110], 95) == 300 and percentile([120, 80, 95, 300, 110], 100) == 300, 'With five values p95 is the largest'` },
          { name: 'Edge cases', code: R`assert percentile([10], 99) == 10 and percentile([4, 2, 9], 0) == 2, 'One value returns itself; q = 0 returns the minimum'` }
        ]
      }
    ],
    quiz: [
      { q: 'Data drift versus concept drift?', options: ['They are the same', 'Data drift: inputs change. Concept drift: the relation between inputs and target changes', 'Concept drift only affects images', 'Data drift is a bug'], answer: 1, why: 'Input drift can be detected without labels; concept drift usually needs fresh labels or proxy metrics.' },
      { q: 'A model has great offline metrics but performs badly once deployed. A common cause?', options: ['Too many tests', 'Training-serving skew: features are computed differently online', 'Using Docker', 'A slow GPU'], answer: 1, why: 'Share feature code between training and serving, or use a feature store, and log online features.' },
      { q: 'Safest way to roll out a new model version?', options: ['Replace the old one at midnight', 'Shadow or canary deployment with monitoring and a fast rollback', 'Email the model to users', 'Deploy on Friday'], answer: 1, why: 'Shadow mode compares predictions without affecting users; canary exposes a small share of traffic.' },
      { q: 'What must be versioned to reproduce a model?', options: ['Only the code', 'Code, data, configuration and the environment', 'Only the weights', 'Nothing'], answer: 1, why: 'Tools: Git, DVC or a data catalogue, MLflow, container images.' },
      { q: 'Why monitor p95 or p99 latency and not the mean?', options: ['The mean is illegal', 'A few slow requests ruin user experience and are hidden by the mean', 'Percentiles are easier to compute', 'The mean is always higher'], answer: 1, why: 'Service-level objectives are normally set on tail latency.' }
    ],
    interview: [
      { q: 'Walk me through taking a model from a notebook to production.', points: [['Package the code and pin the environment', ['package', 'docker', 'container', 'environment', 'refactor']], ['Tests and a reproducible training pipeline', ['test', 'pipeline', 'reproduc', 'ci']], ['Serve: API, batch or edge, to meet latency needs', ['api', 'serv', 'batch', 'endpoint', 'fastapi']], ['Roll out gradually: shadow or canary', ['shadow', 'canary', 'gradual', 'a/b', 'rollback']], ['Monitor quality, drift and latency; plan retraining', ['monitor', 'drift', 'retrain', 'alert']]], model: 'I move the notebook code into versioned, tested modules and make training a reproducible pipeline with pinned dependencies, versioned data and tracked experiments. I register the model with its metrics and package the inference code in a container, served as an API for real-time use or as a batch job if latency does not matter. CI/CD runs tests and builds the image. I release in shadow mode or as a canary, compare against the current model and keep a rollback ready. In production I monitor latency, errors, input drift and prediction quality, and I define when to retrain. Ownership and documentation are part of the job.' },
      { q: 'How do you monitor a model in production?', points: [['System metrics: latency, throughput, errors', ['latency', 'error', 'throughput', 'uptime']], ['Input data quality and drift', ['drift', 'data quality', 'distribution', 'schema', 'missing']], ['Prediction distribution', ['prediction', 'output distribution', 'score distribution']], ['Real performance once labels arrive, or proxies', ['label', 'ground truth', 'proxy', 'business metric', 'feedback']], ['Alerts and a retraining or rollback plan', ['alert', 'retrain', 'rollback', 'threshold']]], model: 'I monitor at four levels. Service health: latency percentiles, error rate and throughput. Data quality: schema checks, missing values and drift in feature distributions against the training baseline, using measures such as PSI. Model outputs: the distribution of predictions and confidence. And true performance: when labels arrive, even with a delay, I compute the real metrics, and until then I watch proxy and business metrics. Each has thresholds and alerts, with a runbook that says when to investigate, roll back or retrain.' },
      { q: 'How would you serve a model that must answer in under 50 milliseconds?', points: [['Measure first: where the time goes', ['measure', 'profil', 'bottleneck']], ['Make the model cheaper: smaller, quantised, distilled', ['quanti', 'distil', 'smaller', 'prun']], ['Optimised runtime and hardware', ['onnx', 'tensorrt', 'gpu', 'runtime', 'compiled']], ['Precompute and cache features or results', ['cache', 'precompute', 'feature store']], ['Batching, autoscaling, tail latency', ['batch', 'autoscal', 'p99', 'p95', 'tail', 'replica']]], model: 'I start by profiling the whole request to see how much time is network, feature lookup, preprocessing and model inference. Often the model is not the bottleneck. I precompute features and cache hot results. For the model I use an optimised runtime such as ONNX Runtime or TensorRT, quantise it, and if needed distil to a smaller architecture. I choose hardware to fit, use dynamic batching if throughput matters, keep instances warm and autoscale. I track p95 and p99, not the average, and I have a fallback, such as a simpler model, for when the budget is exceeded.' }
    ]
  },

  {
    id: 'edge-deploy', title: 'Embedded and edge deployment', tracks: ['auto', 'cv', 'mlops', 'mle'],
    tasks: [
      {
        id: 'edge-quant', title: 'Int8 quantisation',
        prompt: `Affine quantisation maps a float to an 8-bit integer. Write two functions:

- \`quantize(values, scale, zero_point)\` returns a list of ints: \`q = round(x / scale) + zero_point\`, clipped to the range -128 to 127.
- \`dequantize(q_values, scale, zero_point)\` returns floats: \`x = (q - zero_point) * scale\`.`,
        starter: R`def quantize(values, scale, zero_point):
    pass

def dequantize(q_values, scale, zero_point):
    pass

print(quantize([0.0, 0.5, -0.5, 100.0], 0.01, 0))  # [0, 50, -50, 127]
`,
        solution: R`def quantize(values, scale, zero_point):
    return [int(max(-128, min(127, round(x / scale) + zero_point))) for x in values]

def dequantize(q_values, scale, zero_point):
    return [(q - zero_point) * scale for q in q_values]
`,
        tests: [
          { name: 'Quantise and clip', code: R`assert [int(v) for v in quantize([0.0, 0.5, -0.5, 100.0], 0.01, 0)] == [0, 50, -50, 127], 'Expected [0, 50, -50, 127]: values beyond the range saturate'
assert [int(v) for v in quantize([-9.0], 0.01, 0)] == [-128], 'Large negative values saturate at -128'` },
          { name: 'Zero point', code: R`assert [int(v) for v in quantize([0.1, 0.0], 0.05, 10)] == [12, 10], 'q = round(0.1 / 0.05) + 10 = 12; zero maps to the zero point'` },
          { name: 'Dequantise', code: R`assert close(dequantize([12, 10, -128], 0.05, 10), [0.1, 0.0, -6.9]), 'x = (q - zero_point) * scale'` },
          { name: 'Round-trip error is at most half a step', code: R`xs = [0.013, -0.247, 0.5, 0.999]
back = dequantize(quantize(xs, 0.01, 3), 0.01, 3)
assert all(abs(a - b) <= 0.005 + 1e-9 for a, b in zip(xs, back)), 'Quantise then dequantise should be within scale / 2'` }
        ]
      },
      {
        id: 'edge-params', title: 'Standard vs depthwise separable convolution',
        prompt: `Count parameters, **including biases**.

- \`conv_params(c_in, c_out, k)\`: a standard \`k×k\` convolution.
- \`separable_params(c_in, c_out, k)\`: a depthwise \`k×k\` convolution (one filter per input channel, with a bias per channel) followed by a pointwise 1×1 convolution to \`c_out\` channels (with biases).`,
        starter: R`def conv_params(c_in, c_out, k):
    pass

def separable_params(c_in, c_out, k):
    pass

print(conv_params(32, 64, 3), separable_params(32, 64, 3))  # 18496 2432
`,
        solution: R`def conv_params(c_in, c_out, k):
    return k * k * c_in * c_out + c_out

def separable_params(c_in, c_out, k):
    depthwise = k * k * c_in + c_in
    pointwise = c_in * c_out + c_out
    return depthwise + pointwise
`,
        tests: [
          { name: 'Standard convolution', code: R`assert conv_params(32, 64, 3) == 18496 and conv_params(3, 16, 5) == 1216, 'k*k*c_in*c_out weights plus c_out biases'` },
          { name: 'Separable convolution', code: R`assert separable_params(32, 64, 3) == 2432, 'Depthwise 9*32 + 32, pointwise 32*64 + 64'` },
          { name: 'Saving grows with kernel size', code: R`assert conv_params(64, 64, 5) / separable_params(64, 64, 5) > 15, 'A 5x5 separable convolution should be more than 15 times smaller here'` }
        ]
      }
    ],
    quiz: [
      { q: 'Post-training quantisation to int8 typically gives…', options: ['Higher accuracy', 'About 4× smaller model and faster inference, with a small accuracy loss', 'Slower inference', 'A larger model'], answer: 1, why: 'Weights go from 32-bit floats to 8-bit integers. Quantisation-aware training recovers accuracy when the loss is too large.' },
      { q: 'What is a calibration dataset used for in quantisation?', options: ['Training from scratch', 'Estimating activation ranges to choose scales and zero points', 'Labelling', 'Testing latency'], answer: 1, why: 'It should be representative of real inputs, or the ranges will clip.' },
      { q: 'After converting a model to C for a microcontroller, the first thing to verify is…', options: ['The font of the code', 'That outputs match the reference model on the same inputs, within tolerance', 'That it uses recursion', 'That it prints logs'], answer: 1, why: 'Bit-exact or tolerance-based back-to-back tests catch conversion and fixed-point errors.' },
      { q: 'Knowledge distillation trains…', options: ['A large model from a small one', 'A small student to match the outputs of a large teacher', 'Two identical models', 'Only the last layer'], answer: 1, why: 'The soft targets carry more information than hard labels.' },
      { q: 'Why is worst-case execution time important in embedded automotive software?', options: ['It reduces memory', 'Real-time tasks must always finish inside their time slot', 'It improves accuracy', 'It is a marketing number'], answer: 1, why: 'Average latency is not enough: a missed deadline can be a safety issue.' }
    ],
    interview: [
      { q: 'How do you deploy a Python-trained model to an embedded target in C?', points: [['Simplify and fix the model: supported operators, fixed input size', ['simplif', 'supported', 'operator', 'fixed', 'freeze']], ['Convert: code generation or a hand-written inference in C', ['convert', 'generat', 'c code', 'port', 'export']], ['Quantise or use fixed-point arithmetic', ['quanti', 'fixed-point', 'fixed point', 'int8']], ['Verify equivalence with the Python model', ['verif', 'equivalen', 'match', 'compare', 'back-to-back', 'same output']], ['Measure memory, timing and integrate with the existing software', ['memory', 'ram', 'timing', 'latency', 'integrat', 'stack']]], model: 'I first make the model deployable: a small architecture, only operations the target supports and fixed input shapes. For a tree model I generate nested if-else code or lookup tables; for a neural network I use a code generator or write the inference loops in C. I convert to fixed-point or 8-bit integers if the processor has no fast floating point. Then I prove equivalence by running the same test vectors through the Python and C versions and comparing outputs within a tolerance. Finally I measure flash, RAM, stack and worst-case execution time on the target, integrate with the surrounding modules, and follow the coding standard and process the project requires, such as MISRA and ASPICE.' },
      { q: 'What techniques reduce model size and latency, and what are the trade-offs?', points: [['Quantisation', ['quanti']], ['Pruning', ['prun']], ['Distillation', ['distil']], ['Efficient architectures or smaller inputs', ['mobilenet', 'efficient', 'architecture', 'depthwise', 'resolution']], ['Trade-off: accuracy, and hardware support', ['accuracy', 'trade', 'hardware', 'support']]], model: 'There are four main levers. Quantisation stores weights and activations as 8-bit integers, giving about four times less memory and faster inference for a small accuracy loss. Pruning removes weights or whole channels; structured pruning gives real speed-ups, unstructured pruning needs sparse support. Distillation trains a small student to imitate a large teacher. And architecture choices, such as depthwise separable convolutions or a lower input resolution, reduce compute at the source. Each trades some accuracy for efficiency, and what helps depends on the hardware, so I always measure on the target device.' },
      { q: 'How do you ensure quality for ML software in a regulated automotive project?', points: [['Requirements with traceability to tests', ['requirement', 'traceab']], ['Process standards: ASPICE, ISO 26262, SOTIF', ['aspice', '26262', 'sotif', 'misra', 'standard']], ['Data management: versioned, documented datasets', ['data', 'dataset', 'version']], ['Verification at several levels, including on target', ['verif', 'unit test', 'integration', 'hil', 'on target', 'validation']], ['Reviews and configuration management', ['review', 'configuration', 'baseline', 'change']]], model: 'Quality starts with clear, testable requirements, each traced to design, implementation and test cases, as Automotive SPICE requires. For the ML part I treat data as a controlled work product: datasets are versioned, their coverage of operating conditions is documented and the split is frozen. Verification happens at several levels: unit tests of the code, back-to-back tests between the reference model and the embedded implementation, performance evaluation on a held-out set, and integration and vehicle tests. Changes go through review and configuration management. Where the function is safety-relevant, ISO 26262 and SOTIF analyses define what the model may and may not be trusted for.' }
    ]
  },

  {
    id: 'ml-system-design', title: 'ML system design', tracks: ['mle', 'genai', 'ds', 'mlops'],
    tasks: [
      {
        id: 'sd-ndcg', title: 'NDCG@k for ranking',
        prompt: `Ranking systems (search, recommendations) are scored with NDCG. Write \`ndcg_at_k(relevances, k)\`, where \`relevances\` are the graded relevance scores of the results in the order the system ranked them.

- \`DCG@k = sum(rel_i / log2(i + 2))\` for positions \`i = 0 .. k-1\`
- Ideal DCG is the DCG of the same scores sorted from highest to lowest.
- \`NDCG = DCG / ideal DCG\`. If the ideal DCG is 0, return \`0.0\`.`,
        starter: R`import math

def ndcg_at_k(relevances, k):
    pass

print(ndcg_at_k([0, 1], 2))  # about 0.631
`,
        solution: R`import math

def ndcg_at_k(relevances, k):
    def dcg(rels):
        return sum(r / math.log2(i + 2) for i, r in enumerate(rels[:k]))
    ideal = dcg(sorted(relevances, reverse=True))
    return dcg(relevances) / ideal if ideal > 0 else 0.0
`,
        tests: [
          { name: 'Perfect order', code: R`assert close(ndcg_at_k([3, 2, 1], 3), 1.0), 'Already sorted by relevance gives 1.0'` },
          { name: 'Relevant item ranked second', code: R`assert close(ndcg_at_k([0, 1], 2), 0.6309298, 1e-6), '1/log2(3) = 0.631'` },
          { name: 'Cut-off at k', code: R`assert close(ndcg_at_k([1, 0, 2], 2), 0.3800944, 1e-6), 'Only the first two positions count; the ideal order is [2, 1]'` },
          { name: 'Nothing relevant', code: R`assert close(ndcg_at_k([0, 0, 0], 3), 0.0), 'No relevant results gives 0.0 (no division by zero)'` }
        ]
      }
    ],
    quiz: [
      { q: 'First step in an ML system design interview?', options: ['Pick a model', 'Clarify the goal, users, scale and constraints', 'Draw the neural network', 'Choose a cloud provider'], answer: 1, why: 'Jumping to a model is the most common mistake. Agree the problem and the success metric first.' },
      { q: 'A recommender must choose from 10 million items in 100 ms. Standard architecture?', options: ['Score all items with a deep model', 'Two stages: cheap candidate retrieval, then a precise ranking model on a few hundred', 'Random sampling', 'One SQL query'], answer: 1, why: 'Retrieval (embeddings and approximate nearest neighbours) narrows the set; ranking uses rich features.' },
      { q: 'Why keep a simple baseline in a design discussion?', options: ['To waste time', 'It sets the bar, ships fast and shows whether complexity is worth it', 'Interviewers require it by law', 'It is always the best model'], answer: 1, why: 'For example popularity-based recommendations or a rules engine.' },
      { q: 'A feature store mainly solves…', options: ['GPU shortages', 'Consistent features between training and serving, and reuse across teams', 'Model interpretability', 'Labelling'], answer: 1, why: 'It prevents training-serving skew and provides point-in-time correct features.' },
      { q: 'A new model improves the offline metric but the A/B test is flat. Likely reason?', options: ['A/B tests are wrong', 'The offline metric is a weak proxy for the business goal, or there is feedback-loop bias in the logged data', 'Too many users', 'The model is too fast'], answer: 1, why: 'Logged data reflects what the old model showed. Validate proxies against online results.' }
    ],
    interview: [
      { q: 'Design a recommendation system for an e-commerce app.', points: [['Clarify goal, metric and scale', ['goal', 'metric', 'scale', 'clarif', 'requirement']], ['Data and features: users, items, interactions', ['interaction', 'click', 'purchase', 'feature', 'history']], ['Two-stage: candidate retrieval then ranking', ['candidate', 'retriev', 'rank', 'two-stage', 'two stage']], ['Cold start for new users and items', ['cold start', 'new user', 'new item', 'popular']], ['Evaluation offline and online, plus monitoring', ['a/b', 'online', 'offline', 'ndcg', 'monitor']]], model: 'I begin by clarifying the goal, for example increasing purchases, the surfaces involved, the scale and the latency budget. Data comes from interaction logs, such as views, carts and purchases, plus user and item attributes. I start with a popularity and co-purchase baseline. The target design has two stages: candidate retrieval with a two-tower embedding model and approximate nearest-neighbour search to get a few hundred items, then a ranking model, such as gradient-boosted trees or a neural ranker, using rich user, item and context features. I handle cold start with content features and popularity. I evaluate offline with recall at k and NDCG on a time-based split, then with an A/B test on conversion, and I monitor drift, diversity and feedback loops.' },
      { q: 'Design a system that answers employee questions from internal company documents.', points: [['Clarify users, document types, languages and security', ['clarif', 'security', 'access', 'language', 'document type', 'permission']], ['Ingestion: parse, chunk, embed, index', ['chunk', 'embed', 'index', 'ingest']], ['Retrieval with access control, hybrid search and re-ranking', ['retriev', 'hybrid', 're-rank', 'rerank', 'access control']], ['Generation grounded in sources, with citations', ['citation', 'cite', 'ground', 'source']], ['Evaluation, monitoring, cost and latency', ['evaluat', 'monitor', 'cost', 'latency', 'feedback']]], model: 'I would clarify who uses it, what documents exist, in which languages, how fresh they must be and what access rules apply. The design is retrieval-augmented generation. An ingestion pipeline parses documents, chunks them, embeds them and stores vectors with metadata, including permissions, and re-indexes on change. At query time I retrieve with hybrid search filtered by the user’s permissions, re-rank and pass the top passages to the model with instructions to answer only from them and cite the source. If data cannot leave the company, I serve a local model. I build an evaluation set with real questions, measure retrieval recall and answer faithfulness, collect user feedback, and track cost and latency.' },
      { q: 'How do you decide whether a problem needs machine learning at all?', points: [['Is there a clear business goal and metric', ['goal', 'metric', 'value', 'business']], ['Can rules or a simple heuristic solve it', ['rule', 'heuristic', 'simple']], ['Is there enough data of good quality, with labels', ['data', 'label']], ['Cost of errors and of maintenance', ['cost', 'maintain', 'error', 'risk']]], model: 'I ask four questions. Is there a clear outcome we want to improve and a way to measure it? Could rules or a simple heuristic get most of the value, and if so I start there. Do we have, or can we collect, enough representative data with reliable labels? And what do mistakes cost, and can we afford to monitor and maintain a model for years? ML is the right tool when the pattern is too complex for rules, data is available and the value clearly exceeds the running cost. Otherwise the simple solution is the better engineering decision.' }
    ]
  }
];
