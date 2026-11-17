// Target jobs, their roadmaps, portfolio projects and real-world use cases.
// A roadmap is an ordered list of stages; each stage lists topic ids in learning order.

const INTERVIEW = { name: 'Get hired', topics: ['behavioral', 'egypt-remote'] };

export const ROLES = [
  {
    id: 'mle', title: 'Machine Learning Engineer',
    about: 'Builds, ships and maintains ML models in production. The most common AI job title: part data scientist, part software engineer.',
    rounds: ['Coding: data structures and algorithms in Python', 'ML fundamentals and metrics', 'ML system design', 'A past project in depth', 'Behavioural'],
    stages: [
      { name: 'Programming foundations', topics: ['python', 'dev-tools', 'dsa', 'algo-advanced', 'sql', 'stats'] },
      { name: 'Core machine learning', topics: ['ml-fundamentals', 'metrics', 'linear-models', 'trees', 'feature-eng', 'unsupervised'] },
      { name: 'Deep learning', topics: ['nn-basics', 'pytorch', 'training', 'transformers'] },
      { name: 'Modern AI systems', topics: ['llm-basics', 'rag', 'timeseries', 'ts-transformers', 'recsys', 'rl'] },
      { name: 'Production', topics: ['data-pipelines', 'mlops', 'cloud-deploy', 'ml-system-design', 'quantization', 'responsible-ai'] },
      INTERVIEW
    ],
    projects: ['churn-prediction', 'fraud-detection', 'model-api', 'recsys', 'fairness-audit', 'rl-agent']
  },
  {
    id: 'ds', title: 'Data Scientist',
    about: 'Turns data into decisions: analysis, experiments and predictive models, explained clearly to the business.',
    rounds: ['SQL and Python on real data', 'Statistics and A/B testing', 'ML fundamentals and metrics', 'A business case study', 'Behavioural'],
    stages: [
      { name: 'Data foundations', topics: ['python', 'dev-tools', 'sql', 'stats', 'data-viz'] },
      { name: 'Core machine learning', topics: ['ml-fundamentals', 'metrics', 'linear-models', 'trees', 'feature-eng', 'unsupervised'] },
      { name: 'Forecasting and deep learning', topics: ['timeseries', 'ts-transformers', 'recsys', 'nn-basics', 'pytorch', 'llm-basics'] },
      { name: 'From model to impact', topics: ['data-pipelines', 'mlops', 'ml-system-design', 'responsible-ai'] },
      INTERVIEW
    ],
    projects: ['churn-prediction', 'ab-test', 'customer-segmentation', 'demand-forecast', 'fraud-detection', 'fairness-audit']
  },
  {
    id: 'da', title: 'Data Analyst',
    about: 'Answers business questions with SQL, statistics and clear reporting. A common entry point into data and AI careers.',
    rounds: ['Live SQL', 'Statistics and experiment reading', 'A take-home analysis with a short presentation', 'Behavioural'],
    stages: [
      { name: 'Tools', topics: ['sql', 'python', 'dev-tools', 'feature-eng'] },
      { name: 'Reasoning with data', topics: ['stats', 'data-viz', 'metrics'] },
      { name: 'First models', topics: ['ml-fundamentals', 'linear-models', 'unsupervised', 'timeseries'] },
      INTERVIEW
    ],
    projects: ['sql-analytics', 'ab-test', 'customer-segmentation', 'demand-forecast']
  },
  {
    id: 'genai', title: 'GenAI / LLM Engineer',
    about: 'Builds products on large language models: retrieval, agents, evaluation and safe deployment.',
    rounds: ['Coding in Python', 'LLM fundamentals: tokens, prompting, RAG, fine-tuning', 'Design an LLM application', 'Evaluation and safety', 'Behavioural'],
    stages: [
      { name: 'Programming foundations', topics: ['python', 'dev-tools', 'dsa'] },
      { name: 'ML and deep learning essentials', topics: ['ml-fundamentals', 'metrics', 'nn-basics', 'pytorch', 'transformers'] },
      { name: 'LLM applications', topics: ['llm-basics', 'rag', 'agents-eval', 'nlp', 'generative-models'] },
      { name: 'Agents', topics: ['agent-arch', 'agent-prod'] },
      { name: 'Production', topics: ['cloud-deploy', 'mlops', 'quantization', 'ml-system-design', 'responsible-ai'] },
      INTERVIEW
    ],
    projects: ['rag-assistant', 'lora-summariser', 'tool-agent', 'fairness-audit']
  },
  {
    id: 'mlops', title: 'MLOps Engineer',
    about: 'Owns the platform that trains, deploys and monitors models: pipelines, infrastructure, reliability and cost.',
    rounds: ['Coding and scripting', 'Containers, cloud and CI/CD', 'Design a training and serving platform', 'Monitoring and incident scenarios', 'Behavioural'],
    stages: [
      { name: 'Programming foundations', topics: ['python', 'dev-tools', 'dsa', 'sql'] },
      { name: 'Enough ML to operate it', topics: ['ml-fundamentals', 'metrics', 'pytorch', 'training'] },
      { name: 'Platform', topics: ['data-pipelines', 'mlops', 'cloud-deploy', 'ml-system-design'] },
      { name: 'Performance and cost', topics: ['cuda-gpu', 'quantization', 'edge-deploy', 'agent-prod'] },
      INTERVIEW
    ],
    projects: ['model-api', 'ml-pipeline', 'fraud-detection']
  },
  {
    id: 'cv', title: 'Computer Vision Engineer',
    about: 'Builds systems that understand images and video: classification, detection, segmentation and geometry, often in real time.',
    rounds: ['Coding in Python (often with numpy)', 'Deep learning and CNN fundamentals', 'Detection, segmentation and metrics', 'Camera geometry', 'A past project and deployment constraints'],
    stages: [
      { name: 'Programming foundations', topics: ['python', 'dev-tools', 'dsa', 'algo-advanced'] },
      { name: 'ML and deep learning', topics: ['ml-fundamentals', 'metrics', 'nn-basics', 'pytorch', 'training'] },
      { name: 'Vision', topics: ['cv-basics', 'cv-detection', 'cv-geometry', 'transformers', 'generative-models'] },
      { name: 'Deployment', topics: ['quantization', 'edge-deploy', 'cpp-deploy', 'cuda-gpu'] },
      INTERVIEW
    ],
    projects: ['image-classifier', 'object-detector', 'segmentation', 'edge-vision']
  },
  {
    id: 'nlp', title: 'NLP Engineer',
    about: 'Builds systems that understand and generate language: classification, extraction, summarisation, translation and search.',
    rounds: ['Coding in Python', 'Text representations and transformers', 'Fine-tuning and evaluation', 'Design a language system', 'Behavioural'],
    stages: [
      { name: 'Programming foundations', topics: ['python', 'dev-tools', 'dsa', 'stats'] },
      { name: 'ML and deep learning', topics: ['ml-fundamentals', 'metrics', 'nn-basics', 'pytorch', 'training'] },
      { name: 'Language', topics: ['nlp', 'rnn', 'transformers', 'llm-basics'] },
      { name: 'Applications', topics: ['rag', 'agents-eval', 'mlops', 'responsible-ai'] },
      INTERVIEW
    ],
    projects: ['text-classifier', 'lora-summariser', 'rag-assistant']
  },
  {
    id: 'auto', title: 'Perception / ADAS Engineer',
    about: 'Builds the perception stack for driver assistance, robots and drones: detection, tracking and sensor fusion on embedded hardware.',
    rounds: ['Coding in Python and C++', 'Deep learning and detection', 'Kalman filtering and tracking', 'Sensors and fusion architecture', 'Embedded deployment and safety'],
    stages: [
      { name: 'Programming foundations', topics: ['python', 'dev-tools', 'dsa', 'algo-advanced'] },
      { name: 'ML and deep learning', topics: ['ml-fundamentals', 'metrics', 'nn-basics', 'pytorch', 'training'] },
      { name: 'Vision', topics: ['cv-basics', 'cv-detection', 'cv-geometry'] },
      { name: 'Sensors, tracking and fusion', topics: ['sensors', 'kalman', 'fusion-arch', 'localization-planning'] },
      { name: 'Embedded deployment', topics: ['quantization', 'cpp-deploy', 'edge-deploy', 'ecu-deploy'] },
      INTERVIEW
    ],
    projects: ['kalman-tracker', 'object-detector', 'sensor-fusion']
  },
  {
    id: 'edge', title: 'Embedded / Edge AI Engineer',
    about: 'Makes models run on small, cheap, low-power hardware: microcontrollers, phones, cameras and vehicle ECUs.',
    rounds: ['Coding in C or C++ and Python', 'ML fundamentals', 'Quantisation and model compression', 'Embedded constraints: memory, timing, fixed point', 'A deployment you have done'],
    stages: [
      { name: 'Programming foundations', topics: ['python', 'dev-tools', 'dsa'] },
      { name: 'Models that fit small devices', topics: ['ml-fundamentals', 'metrics', 'trees', 'nn-basics', 'pytorch', 'training'] },
      { name: 'Signals and images', topics: ['timeseries', 'rnn', 'cv-basics'] },
      { name: 'Deployment', topics: ['quantization', 'edge-deploy', 'cpp-deploy', 'cuda-gpu', 'ecu-deploy'] },
      INTERVIEW
    ],
    projects: ['tree-to-c', 'keyword-spotting', 'edge-vision', 'predictive-maintenance']
  }
];

const std = repo => [`A public repository with a clear README: problem, approach, results, how to run`, repo, 'A short write-up of what worked, what did not and what you would do next'];

export const PROJECTS = [
  {
    id: 'churn-prediction', title: 'Customer churn prediction', level: 'Starter', topics: ['feature-eng', 'trees', 'metrics', 'ml-fundamentals'],
    useCase: 'Telecoms, banks and subscription services score every customer for the risk of leaving, then target retention offers at the riskiest. It is one of the most widely deployed ML applications in business.',
    build: 'A model that predicts which customers will cancel, with an explanation of the main drivers and a recommended threshold for a retention campaign.',
    data: 'Telco Customer Churn (IBM sample data, on Kaggle). About 7,000 customers with contract, billing and service features.',
    steps: ['Explore the data and write down the churn rate and obvious patterns', 'Split the data, then build a preprocessing pipeline with no leakage', 'Train a logistic regression baseline and record precision, recall and PR-AUC', 'Train gradient-boosted trees and compare with cross-validation', 'Explain the model with permutation importance or SHAP', 'Choose a threshold from campaign cost and customer value, and estimate the benefit'],
    proof: std('A results table comparing the baseline and the final model'),
    talk: ['Why accuracy is the wrong metric here and what you used instead', 'How you chose the threshold from business costs', 'What the model says drives churn, and why that is not proof of causation']
  },
  {
    id: 'fraud-detection', title: 'Card fraud detection', level: 'Core', topics: ['metrics', 'trees', 'feature-eng', 'mlops'],
    useCase: 'Every card network and payment company scores transactions for fraud in real time. The problem is defined by extreme class imbalance and a hard latency limit.',
    build: 'A fraud classifier evaluated the way a bank would: precision at a fixed review capacity, with a time-based split and a latency measurement.',
    data: 'Credit Card Fraud Detection (ULB, on Kaggle): about 285,000 European card transactions, of which fewer than 0.2% are fraud.',
    steps: ['Split by time, not at random, and explain why', 'Build a baseline and report PR-AUC and recall at a fixed false-positive budget', 'Try class weights and resampling, and compare them fairly', 'Train gradient-boosted trees with early stopping', 'Pick an operating threshold for a team that can review a fixed number of alerts per day', 'Measure prediction latency and wrap the model in a small scoring function'],
    proof: std('A precision-recall curve with the chosen operating point marked'),
    talk: ['Why PR-AUC and not ROC-AUC or accuracy', 'How you avoided leakage with a time-based split', 'How you would monitor drift as fraud patterns change']
  },
  {
    id: 'demand-forecast', title: 'Retail demand forecasting', level: 'Core', topics: ['timeseries', 'feature-eng', 'trees', 'stats'],
    useCase: 'Retailers forecast demand per product and store to plan stock and staffing. Better forecasts mean fewer empty shelves and less waste.',
    build: 'A forecasting pipeline that beats a seasonal-naive baseline, validated by walk-forward backtesting.',
    data: 'M5 Forecasting (Walmart, on Kaggle) or Rossmann Store Sales (Kaggle). Start with a subset of stores or products.',
    steps: ['Plot the series: trend, weekly and yearly seasonality, holidays', 'Implement naive and seasonal-naive baselines and compute MASE', 'Build lag, rolling and calendar features without leakage', 'Train gradient-boosted trees as one global model', 'Evaluate with walk-forward validation at the business horizon', 'Analyse errors by product and by horizon'],
    proof: std('A backtest table: baseline against model, per horizon'),
    talk: ['Why a random split would be wrong', 'Which features carried the most signal', 'When you would choose a classical model or a neural one instead']
  },
  {
    id: 'recsys', title: 'Two-stage recommender', level: 'Capstone', topics: ['ml-system-design', 'metrics', 'feature-eng', 'trees'],
    useCase: 'Streaming, shopping and social platforms pick a handful of items from millions for each user, in milliseconds, using candidate retrieval followed by ranking.',
    build: 'A recommender with a retrieval stage and a ranking stage, evaluated with ranking metrics on a time-based split.',
    data: 'MovieLens (GroupLens). Start with the 100K or 1M ratings set.',
    steps: ['Build a popularity baseline and measure recall@k and NDCG@k', 'Train an embedding model (matrix factorisation or two-tower) for retrieval', 'Retrieve candidates with nearest-neighbour search', 'Train a ranking model on user, item and context features', 'Evaluate on a split by time and compare every stage with the baseline', 'Describe how you would serve it and handle new users and items'],
    proof: std('A diagram of the two-stage architecture with latency budget per stage'),
    talk: ['Why two stages and not one model', 'Cold start for new users and items', 'Offline metrics against an online A/B test']
  },
  {
    id: 'sql-analytics', title: 'E-commerce analytics in SQL', level: 'Starter', topics: ['sql', 'stats', 'feature-eng'],
    useCase: 'Every online business tracks revenue, retention and delivery performance from its order tables. Analysts answer these questions daily in SQL.',
    build: 'A set of SQL queries and a short report answering real business questions: revenue trends, repeat purchase, delivery delays, best and worst categories.',
    data: 'Brazilian E-Commerce Public Dataset by Olist (Kaggle): orders, items, customers, payments and reviews in linked tables.',
    steps: ['Load the tables and draw the relationships between them', 'Monthly revenue and order count with a running total', 'Top categories by revenue and by review score', 'Customer cohorts: what share buy again within 90 days', 'Delivery time against review score: is there a relationship', 'Write a one-page summary with three recommendations'],
    proof: std('The SQL file with commented queries and a chart for each finding'),
    talk: ['A query where a join silently duplicated rows and how you caught it', 'How you defined "repeat customer" and why', 'Which finding you would act on first']
  },
  {
    id: 'ab-test', title: 'A/B test analysis', level: 'Core', topics: ['stats', 'python', 'metrics'],
    useCase: 'Product companies run thousands of controlled experiments a year to decide which changes to ship. Reading them correctly is a core data skill.',
    build: 'A complete analysis of an experiment: sample-size check, significance test, confidence interval, segment breakdown and a ship or do-not-ship recommendation.',
    data: 'A public A/B testing dataset such as the Udacity landing-page experiment or the Cookie Cats mobile game test (both on Kaggle).',
    steps: ['State the hypothesis, the primary metric and guardrail metrics', 'Check randomisation and data quality, such as users in both groups', 'Compute the required sample size for a minimum effect', 'Run the test and report the effect with a confidence interval', 'Break results down by segment and discuss multiple comparisons', 'Write the recommendation for a non-technical reader'],
    proof: std('A one-page decision memo'),
    talk: ['What a p-value does and does not mean', 'Why you must not stop a test early', 'A case where the result was significant and still not worth shipping']
  },
  {
    id: 'model-api', title: 'Model as a production API', level: 'Core', topics: ['mlops', 'cloud-deploy', 'python'],
    useCase: 'Most models reach users as a web service behind an API. Packaging, testing and deploying one is the everyday work of ML and MLOps engineers.',
    build: 'A trained model served by a FastAPI application in a Docker container, with tests, continuous integration and a public deployment.',
    data: 'Any small tabular dataset; reuse your churn or fraud model.',
    steps: ['Write a prediction service with input validation and a health endpoint', 'Add unit tests for preprocessing and the endpoint', 'Write a Dockerfile and run the container locally', 'Set up CI that runs tests and builds the image on every push', 'Deploy to a free cloud tier and call it from the internet', 'Load-test it and report p50, p95 and p99 latency'],
    proof: ['A public repository with a README and a passing CI badge', 'A live endpoint or a recorded demo', 'A latency report'],
    talk: ['How you keep preprocessing identical in training and serving', 'Where the time goes in a request', 'How you would release a new model version safely']
  },
  {
    id: 'ml-pipeline', title: 'Training pipeline with monitoring', level: 'Capstone', topics: ['mlops', 'cloud-deploy', 'ml-system-design', 'metrics'],
    useCase: 'Companies with models in production automate retraining and watch for drift, because a model that was right last year degrades silently.',
    build: 'An automated pipeline: data validation, training, evaluation gate, model registry and a drift monitor that triggers retraining.',
    data: 'A dataset with a time dimension, such as NYC Taxi trips, so you can simulate data arriving month by month.',
    steps: ['Version the data and track experiments with a tool such as MLflow', 'Build the pipeline: validate, train, evaluate', 'Add a gate: promote only if better than the current model', 'Register and serve the promoted model', 'Compute drift (for example PSI) between training data and new data', 'Simulate several months, trigger retraining on drift and chart the results'],
    proof: std('A chart of model quality and drift over simulated time'),
    talk: ['Data drift against concept drift', 'What happens when labels arrive late', 'How you would roll back a bad model']
  },
  {
    id: 'rag-assistant', title: 'Document question-answering assistant (RAG)', level: 'Core', topics: ['rag', 'llm-basics', 'agents-eval'],
    useCase: 'Retrieval-augmented generation is the most widely deployed LLM pattern: support bots, internal knowledge search and policy assistants all answer from company documents with citations.',
    build: 'An assistant that answers questions from a document collection with citations, plus an evaluation set that measures retrieval and answer quality.',
    data: 'Any public documentation set you know well, for example the docs of an open-source library, or a set of public reports.',
    steps: ['Load, clean and chunk the documents', 'Embed the chunks and build a vector index', 'Answer questions from retrieved chunks, with citations', 'Write 30 or more test questions with the expected source passage', 'Measure retrieval recall@k and answer faithfulness', 'Improve one thing at a time: chunking, hybrid search, re-ranking, prompt'],
    proof: std('An evaluation table showing each improvement and its effect'),
    talk: ['How you told retrieval failures from generation failures', 'Your chunking choices and their trade-offs', 'How you would enforce document permissions']
  },
  {
    id: 'lora-summariser', title: 'Fine-tune a summariser with LoRA', level: 'Core', topics: ['nlp', 'transformers', 'training', 'llm-basics'],
    useCase: 'Teams fine-tune small models for a narrow task when they need lower cost, lower latency or data that must stay in-house. LoRA made this practical on a single GPU.',
    build: 'A small sequence-to-sequence model fine-tuned for summarisation with LoRA, compared against the untuned base model.',
    data: 'SAMSum (dialogue summaries) or CNN/DailyMail (news), both on Hugging Face. FLAN-T5 small or base as the starting model.',
    steps: ['Evaluate the base model zero-shot and record ROUGE', 'Prepare the data with a consistent prompt template', 'Attach LoRA adapters and train on a free GPU notebook', 'Track training and validation loss; stop early', 'Compare ROUGE before and after, and read 20 outputs by hand', 'Report the trainable-parameter share and the adapter size'],
    proof: std('A before-and-after table with example outputs'),
    talk: ['Why LoRA instead of full fine-tuning', 'What ROUGE misses and how you checked faithfulness', 'When you would use prompting or RAG instead']
  },
  {
    id: 'tool-agent', title: 'A tool-using agent with evaluation', level: 'Capstone', topics: ['agent-arch', 'agent-prod', 'agents-eval'],
    useCase: 'Coding assistants, support agents and research assistants are all a model in a loop with tools. Making one reliable and safe is the hard, valuable part.',
    build: 'An agent with three or four well-designed tools that completes multi-step tasks, with limits, error handling, tracing and an evaluation suite that checks outcomes.',
    data: 'A small sandbox you control, for example a to-do or ticket database with search, create and update operations.',
    steps: ['Define the tools with precise descriptions and schemas', 'Implement the loop with step, time and cost limits', 'Validate arguments and return useful errors to the model', 'Write 20 or more tasks with a programmatic check of the final state', 'Run each task several times and report success rate, steps and cost', 'Add a guardrail: approval for destructive actions; test a prompt-injection case'],
    proof: std('An evaluation report: success rate, average steps and cost per task'),
    talk: ['Why you chose an agent over a fixed workflow, or the reverse', 'How errors compound over steps and what you did about it', 'Your defence against prompt injection']
  },
  {
    id: 'text-classifier', title: 'Text classification: baseline to transformer', level: 'Starter', topics: ['nlp', 'metrics', 'training'],
    useCase: 'Routing support tickets, detecting spam and tagging content are text classification. It is the most common NLP task in industry.',
    build: 'A classifier built twice: a TF-IDF baseline and a fine-tuned transformer, with an honest comparison of accuracy, speed and cost.',
    data: 'AG News (topic classification) or IMDb reviews (sentiment), both on Hugging Face.',
    steps: ['Train TF-IDF with logistic regression and record the scores', 'Inspect the errors of the baseline', 'Fine-tune a small pre-trained encoder such as DistilBERT', 'Compare macro-F1, inference time and model size', 'Test on a few examples you write yourself', 'State which model you would deploy, and why'],
    proof: std('A comparison table: quality, latency and size'),
    talk: ['Why a strong simple baseline matters', 'What kinds of example the transformer fixed', 'The cost of that improvement in latency']
  },
  {
    id: 'image-classifier', title: 'Image classifier with transfer learning', level: 'Starter', topics: ['cv-basics', 'training', 'nn-basics'],
    useCase: 'Quality inspection, medical triage and product tagging all start with image classification. Fine-tuning a pre-trained network is how it is done in practice.',
    build: 'An image classifier fine-tuned from a pre-trained network, with augmentation, a confusion matrix and an error analysis.',
    data: 'Oxford-IIIT Pet (37 breeds) or CIFAR-10. Both are available in torchvision.',
    steps: ['Load the data and look at the classes and image sizes', 'Train only a new head on a frozen pre-trained backbone', 'Unfreeze and fine-tune with a low learning rate', 'Add augmentation and compare validation accuracy', 'Plot the confusion matrix and inspect the worst mistakes', 'Export the model and measure inference time'],
    proof: std('A confusion matrix and a gallery of failure cases'),
    talk: ['Why transfer learning beats training from scratch here', 'Which augmentations helped and which would be harmful', 'What the failure cases have in common']
  },
  {
    id: 'object-detector', title: 'Real-time object detector', level: 'Core', topics: ['cv-detection', 'cv-basics', 'edge-deploy', 'training'],
    useCase: 'Detection powers driver assistance, retail analytics, drones and safety monitoring. Production detectors must be accurate and fast.',
    build: 'A detector fine-tuned for a specific set of classes, evaluated with mAP, exported to ONNX and benchmarked for speed.',
    data: 'A subset of COCO, or a driving dataset such as BDD100K or KITTI. A small custom dataset you label yourself is also strong evidence.',
    steps: ['Prepare the dataset and check label quality by eye', 'Fine-tune a small one-stage detector', 'Report mAP@0.5 and mAP@0.5:0.95 per class', 'Analyse failures: small objects, occlusion, lighting', 'Export to ONNX and verify outputs match', 'Measure frames per second and try a lower resolution or quantisation'],
    proof: std('A demo video and a table of accuracy against speed'),
    talk: ['How IoU, NMS and mAP work', 'The accuracy and speed trade-offs you measured', 'How you would fix the main failure mode']
  },
  {
    id: 'segmentation', title: 'Semantic segmentation with U-Net', level: 'Core', topics: ['cv-detection', 'cv-basics', 'training'],
    useCase: 'Segmentation finds the drivable road for vehicles, outlines organs and tumours in medical scans, and measures land use from satellites.',
    build: 'A U-Net that labels every pixel, evaluated with IoU and Dice, with an analysis of boundary quality.',
    data: 'Oxford-IIIT Pet (pet masks) to start, or Cityscapes for street scenes.',
    steps: ['Load images and masks and check they align', 'Implement or adapt a U-Net with a pre-trained encoder', 'Train with cross-entropy, then try Dice loss', 'Report per-class IoU and mean IoU', 'Visualise predictions against ground truth, especially at boundaries', 'Measure inference speed at two resolutions'],
    proof: std('Side-by-side images: input, ground truth, prediction'),
    talk: ['Why pixel accuracy misleads', 'What the skip connections do', 'How loss choice changed small-object results']
  },
  {
    id: 'edge-vision', title: 'Deploy a vision model on an edge device', level: 'Capstone', topics: ['quantization', 'cpp-deploy', 'edge-deploy', 'cuda-gpu'],
    useCase: 'Smart cameras, phones and vehicles run vision models on-device for latency, privacy and cost. Getting a model to meet a frame-rate budget on real hardware is a sought-after skill.',
    build: 'A classifier or detector quantised to int8 and run from C++ (or on a Raspberry Pi or Jetson), with a verified accuracy and latency report.',
    data: 'Reuse your image classifier or detector project.',
    steps: ['Set a budget: target device, latency, memory, minimum accuracy', 'Export the model to ONNX and validate the export', 'Quantise with a calibration set and measure the accuracy drop', 'Write the inference loop in C++ with matching preprocessing', 'Compare C++ and Python outputs on the same images', 'Profile end to end and report latency percentiles before and after each optimisation'],
    proof: std('A table: model variant against size, accuracy and latency'),
    talk: ['How you proved preprocessing parity', 'Where the time went, and the optimisation that mattered most', 'What you would do if accuracy dropped too far after quantisation']
  },
  {
    id: 'kalman-tracker', title: 'Multi-object tracker', level: 'Starter', topics: ['kalman', 'fusion-arch', 'algo-advanced'],
    useCase: 'Radar, lidar and camera systems all turn noisy detections into stable object tracks with a Kalman filter and data association. It is the core of every perception stack.',
    build: 'A tracker for several moving objects in a 2-D simulation: constant-velocity Kalman filters, gating, association and track management.',
    data: 'A simulation you write: objects moving with noise, missed detections and false alarms.',
    steps: ['Simulate objects and noisy detections with dropouts and clutter', 'Implement a constant-velocity Kalman filter for one object', 'Add gating and nearest-neighbour association for several', 'Replace it with the Hungarian algorithm and compare', 'Add track creation, confirmation and deletion', 'Measure position error and identity switches while varying the noise'],
    proof: std('An animation of true paths, detections and tracks'),
    talk: ['How Q and R change the behaviour', 'What happens during occlusion', 'Greedy matching against the Hungarian algorithm']
  },
  {
    id: 'sensor-fusion', title: 'Camera and lidar or radar fusion', level: 'Capstone', topics: ['sensors', 'kalman', 'fusion-arch', 'cv-geometry'],
    useCase: 'Driver-assistance and robot perception fuse sensors because each fails differently. Projecting data between sensor frames and fusing object lists is daily work in the field.',
    build: 'A late-fusion pipeline on a public driving dataset: project lidar or radar points into the camera image, associate them with detections and track fused objects.',
    data: 'nuScenes mini or KITTI, which provide calibrated camera, lidar and (nuScenes) radar data.',
    steps: ['Load a scene and understand the coordinate frames and calibration', 'Project lidar or radar points into the camera image and check alignment', 'Run a 2-D detector on the images', 'Associate points with boxes to estimate each object’s distance', 'Track fused objects over time with a Kalman filter', 'Compare distance error for camera only, range sensor only and fused'],
    proof: std('A video overlay of projected points and fused tracks'),
    talk: ['How calibration and time alignment affect the result', 'Early against late fusion and why you chose one', 'What you do when the sensors disagree']
  },
  {
    id: 'tree-to-c', title: 'From a Python model to embedded C', level: 'Starter', topics: ['trees', 'cpp-deploy', 'ecu-deploy'],
    useCase: 'Small classifiers on sensor ECUs and microcontrollers are usually trained in Python and shipped as generated C. Verifying that both agree is standard practice.',
    build: 'A tree-based classifier on sensor data, converted to dependency-free C, with a back-to-back test proving identical predictions.',
    data: 'UCI HAR (human activity recognition from phone sensors) or any tabular sensor dataset.',
    steps: ['Train a small random forest and record accuracy and size', 'Write a generator that emits C code for the trees', 'Compile it and run the test set through the C version', 'Compare predictions with Python: they must match', 'Reduce depth or tree count and chart accuracy against code size', 'Estimate flash and worst-case execution path'],
    proof: std('A chart of accuracy against generated code size'),
    talk: ['How you verified equivalence', 'The accuracy and size trade-off you chose', 'What would change for a safety-related ECU']
  },
  {
    id: 'keyword-spotting', title: 'Keyword spotting on a microcontroller budget', level: 'Core', topics: ['quantization', 'rnn', 'edge-deploy', 'ecu-deploy'],
    useCase: 'Wake words in earbuds and speakers run on microcontrollers using a few kilobytes of memory. It is the classic TinyML application.',
    build: 'A tiny audio model that recognises a few spoken words, quantised to int8 and evaluated against a memory and latency budget.',
    data: 'Speech Commands (Google), available through TensorFlow Datasets and torchaudio.',
    steps: ['Convert audio to spectrogram or MFCC features', 'Train a small CNN or GRU and record accuracy', 'Set a budget, for example under 100 kB and 20 ms', 'Quantise to int8 and re-measure accuracy', 'Run it with a microcontroller runtime or in integer-only Python', 'Report size, RAM estimate and inference time'],
    proof: std('A table: float against int8 model in size, accuracy and speed'),
    talk: ['How you fitted the budget', 'Post-training quantisation against quantisation-aware training', 'How you would handle false wake-ups in a product']
  },
  {
    id: 'predictive-maintenance', title: 'Predictive maintenance from sensor data', level: 'Core', topics: ['timeseries', 'rnn', 'ts-transformers', 'metrics'],
    useCase: 'Airlines, factories and wind farms predict equipment failure from sensor streams so they can service machines before they break.',
    build: 'A model that estimates remaining useful life from multivariate sensor histories, compared with a simple baseline.',
    data: 'NASA C-MAPSS turbofan engine degradation simulation data set.',
    steps: ['Understand the data: engines, cycles, sensors, operating conditions', 'Build windows and a remaining-useful-life target without leakage', 'Baseline: a linear or tree model on window statistics', 'Train an LSTM or small transformer on the sequences', 'Evaluate by engine, not by row, and compare with the baseline', 'Discuss the cost of predicting too early against too late'],
    proof: std('A plot of predicted against true remaining life for held-out engines'),
    talk: ['Why you split by engine', 'Whether the neural model earned its complexity', 'How asymmetric error costs change the design']
  },
  {
    id: 'customer-segmentation', title: 'Customer segmentation', level: 'Starter', topics: ['unsupervised', 'feature-eng', 'data-viz'],
    useCase: 'Retailers, banks and telecoms group customers by behaviour to tailor offers, pricing and service. Segmentation built on recency, frequency and monetary value (RFM) is a long-standing marketing practice.',
    build: 'Customer segments built from purchase behaviour, profiled and named so a marketing team can act on them.',
    data: 'Online Retail II (UCI Machine Learning Repository): two years of transactions from an online retailer.',
    steps: ['Clean the transactions: returns, missing customer ids, duplicates', 'Compute recency, frequency and monetary value per customer', 'Scale the features and choose k with the elbow and silhouette methods', 'Cluster with k-means and compare with one other method', 'Profile each segment with charts and give it a business name', 'Recommend one action per segment and how you would measure it'],
    proof: std('A one-page segment profile with a chart per segment'),
    talk: ['Why you scaled the features and how k was chosen', 'How you checked the segments are stable', 'How a marketing team would use them']
  },
  {
    id: 'rl-agent', title: 'Train a reinforcement-learning agent', level: 'Core', topics: ['rl', 'pytorch', 'nn-basics'],
    useCase: 'Reinforcement learning optimises sequences of decisions: robot control, game playing, recommendation and resource scheduling. CartPole and LunarLander are the standard first benchmarks.',
    build: 'An agent that learns to balance a pole (CartPole) with tabular Q-learning on a discretised state, then with a small DQN, compared against a random policy.',
    data: 'Gymnasium environments CartPole-v1 and, as a stretch, LunarLander.',
    steps: ['Run a random policy and record the average episode return', 'Discretise the state and train tabular Q-learning', 'Plot returns per episode and tune the exploration schedule', 'Replace the table with a small neural network (DQN) with replay and a target network', 'Compare learning curves over several random seeds', 'Record a video of the trained agent'],
    proof: std('Learning curves averaged over seeds, against the random baseline'),
    talk: ['Exploration against exploitation and your epsilon schedule', 'Why DQN needs replay and a target network', 'Why results vary between seeds and how you reported that']
  },
  {
    id: 'fairness-audit', title: 'Fairness audit of a classifier', level: 'Core', topics: ['responsible-ai', 'metrics', 'trees'],
    useCase: 'Lenders, insurers and hiring platforms must show their models do not treat groups unfairly; regulators and courts increasingly expect such audits.',
    build: 'An income classifier audited across groups, with a mitigation and an honest account of the accuracy cost.',
    data: 'Adult (Census Income) dataset from the UCI Machine Learning Repository.',
    steps: ['Train a gradient-boosted classifier and record overall metrics', 'Slice selection rate, true-positive rate and false-positive rate by group', 'Add confidence intervals so small groups are not over-read', 'Investigate proxies for the protected attribute', 'Apply one mitigation, such as reweighting or group thresholds', 'Write a model card with the trade-offs'],
    proof: std('A model card with per-group metrics before and after mitigation'),
    talk: ['Which fairness criterion you chose and why', 'Why removing the protected column is not enough', 'The accuracy cost of mitigation and who should decide it']
  }
];

// Where each topic is used in real products.
export const USES = {
  python: ['Data pipelines and model training at nearly every AI team', 'Glue code for APIs, automation and analysis'],
  dsa: ['Coding interviews at almost every software and AI employer', 'Efficient data processing: hashing, heaps and search in production code'],
  'algo-advanced': ['Route planning in maps, robots and vehicles (Dijkstra, A-star)', 'Matching detections to tracks; text metrics such as ROUGE-L'],
  sql: ['Business reporting and dashboards', 'Building training datasets from warehouse tables'],
  stats: ['A/B testing of product changes', 'Quality control and risk estimation'],
  'ml-fundamentals': ['Every supervised model in production, from credit scoring to spam filters'],
  metrics: ['Fraud and medical screening thresholds', 'Search and recommendation ranking quality'],
  'linear-models': ['Credit scoring and risk models where decisions must be explained', 'Fast baselines and click-through prediction at scale'],
  trees: ['Fraud detection, pricing and churn models on tabular data', 'Small classifiers on embedded sensors'],
  'feature-eng': ['Customer behaviour features for churn and marketing', 'Risk features in lending and insurance'],
  'nn-basics': ['The base of every vision, speech and language model'],
  transformers: ['Chat assistants and code assistants', 'Translation, search ranking and vision models'],
  training: ['Fine-tuning pre-trained models for a company’s own data'],
  timeseries: ['Demand and energy forecasting', 'Anomaly detection on sensors and server metrics'],
  rnn: ['Keyword spotting and sensor classification on small devices', 'Streaming signal processing'],
  'ts-transformers': ['Large-scale forecasting across many products or sites', 'Pre-trained forecasting models used zero-shot'],
  'llm-basics': ['Chat assistants, drafting, summarising and extraction'],
  rag: ['Customer-support bots that answer from help-centre articles', 'Internal knowledge search with citations'],
  'agents-eval': ['Assistants that look up orders, book meetings or query databases', 'Regression testing of prompts before release'],
  'agent-arch': ['Coding assistants that edit files and run tests', 'Research assistants that search, read and summarise'],
  'agent-prod': ['Customer-service agents with approval steps for refunds', 'Tool integrations through the Model Context Protocol'],
  mlops: ['Automated retraining and monitoring of production models'],
  'edge-deploy': ['On-device vision in phones and cameras', 'Perception in vehicles and robots'],
  'ml-system-design': ['Recommendation feeds and search ranking', 'Fraud and risk decision systems'],
  quantization: ['Running LLMs on laptops and phones', 'Vision and audio models on microcontrollers'],
  'cpp-deploy': ['Perception stacks in vehicles and robots', 'High-throughput inference servers and game engines'],
  'cuda-gpu': ['Training and serving deep models', 'Real-time video analytics'],
  'ecu-deploy': ['Driver-assistance functions in production vehicles', 'Sensor diagnostics on microcontrollers'],
  'cloud-deploy': ['Model APIs behind web and mobile products', 'Autoscaled LLM and vision services'],
  'cv-basics': ['Visual quality inspection in factories', 'Photo search and product tagging'],
  'cv-detection': ['Pedestrian and vehicle detection', 'Retail shelf monitoring; medical image segmentation'],
  'cv-geometry': ['Surround-view parking cameras', 'Augmented reality and robot navigation'],
  nlp: ['Ticket routing and sentiment analysis', 'Document summarisation and translation'],
  sensors: ['Adaptive cruise control and emergency braking', 'Parking assistance'],
  kalman: ['Object tracking in radar and camera systems', 'GPS and inertial navigation in phones, drones and aircraft'],
  'fusion-arch': ['Driver-assistance and autonomous-vehicle perception', 'Robot localisation'],
  behavioral: ['Every interview loop includes at least one behavioural round'],
  'egypt-remote': ['Finding and negotiating local and remote roles']
};

export const projectById = id => PROJECTS.find(p => p.id === id);
export const roleById = id => ROLES.find(r => r.id === id);
export const roleTopics = r => r.stages.flatMap(s => s.topics);
