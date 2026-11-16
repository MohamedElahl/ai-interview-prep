=== cv-basics ===
# What interviewers check

Vision roles test whether you understand convolution itself, the classic architectures and how to make models small enough for real hardware.

# Convolution

A small kernel slides over the image. At each position it computes a weighted sum of the pixels under it.

Pick a filter and see what it does to the image.

[[demo:conv]]

- **Output size:** `(n + 2 * padding - k) // stride + 1`.
- **Parameters:** `k * k * c_in * c_out + c_out`. They do not depend on image size.
- **Receptive field** grows with depth, stride and dilation.

# Classic image processing (OpenCV)

- Smoothing: Gaussian and median blur.
- Edges: Sobel, Canny.
- Thresholding, morphology (erode, dilate), contours.
- Colour spaces: BGR, HSV, greyscale. Histogram equalisation for contrast.

# Architectures to know

| Model | Key idea | Used for |
| --- | --- | --- |
| VGG | Stacks of 3×3 convolutions | Simple baseline |
| ResNet | Skip connections | Default backbone |
| MobileNet | Depthwise separable convolutions | Embedded and mobile |
| EfficientNet | Balanced scaling of depth, width, resolution | Accuracy per compute |
| U-Net | Encoder-decoder with skips | Segmentation |
| Vision Transformer | Image patches as tokens | Large-scale pre-training |

# Training practice

- Start from pre-trained weights and fine-tune.
- Augment: flips, crops, colour jitter, mixup. Keep the label valid.
- Normalise inputs the same way in training and deployment.

# Efficiency

Depthwise separable convolution splits a standard convolution into a per-channel spatial filter and a 1×1 channel mixer, cutting compute by roughly the kernel area.

=== cv-detection ===
# What interviewers check

Detection and segmentation are the core of most applied vision jobs. Expect to code IoU or NMS and to explain mAP.

# Intersection over union

IoU is overlap area divided by union area. It decides whether a prediction matches a ground-truth box.

Drag the dashed box and watch the IoU change.

[[demo:iou]]

# Detectors

- **Two-stage (Faster R-CNN):** propose regions, then classify and refine. Accurate, slower.
- **One-stage (YOLO, SSD, RetinaNet):** predict boxes and classes in one pass. Real-time.
- **Transformer-based (DETR):** set prediction with no NMS.

A modern YOLO has a backbone (features), a neck (multi-scale fusion) and a head (boxes, objectness, classes).

# Non-maximum suppression

Sort by score, keep the best, drop boxes that overlap it above a threshold, repeat.

# Metrics

- **Precision and recall** at a score threshold and an IoU threshold.
- **AP:** area under the precision-recall curve for one class.
- **mAP@0.5** and **mAP@0.5:0.95** average over classes and IoU thresholds.

# Segmentation

- **Semantic:** a class for every pixel. **Instance:** separates objects. **Panoptic:** both.
- Models: U-Net, DeepLab, Mask R-CNN.
- Losses and metrics: cross-entropy, Dice, IoU.

# Typical failure modes

Small objects, occlusion, class imbalance, label noise and domain shift between training data and the field.

=== cv-geometry ===
# What interviewers check

Automotive, robotics and AR roles need geometry as well as deep learning. Surround view, calibration and stitching come up often.

# The pinhole model

A 3-D point `(X, Y, Z)` in camera coordinates projects to:

```
u = f * X / Z + cx
v = f * Y / Z + cy
```

- **Intrinsics:** focal length `f`, principal point `(cx, cy)`, distortion coefficients.
- **Extrinsics:** rotation and translation from the world or vehicle frame to the camera frame.

# Lens distortion and fisheye

Wide lenses bend straight lines. Standard lenses use radial and tangential coefficients. Fisheye lenses (about 180°) need a dedicated model such as equidistant projection, `r = f * theta`.

# Homography

A 3×3 matrix that maps points between two views of a plane, up to scale. It has 8 degrees of freedom, so 4 point pairs define it.

It is exact only for a planar scene or a camera that purely rotates. Otherwise objects at different depths shift differently: **parallax**.

# Stitching pipeline

1. Calibrate and undistort.
2. Detect and match features (SIFT, ORB).
3. Estimate the homography with RANSAC.
4. Warp to a common surface (plane, cylinder, bowl).
5. Find the seam, compensate exposure, blend.

# Surround view in a vehicle

Four fisheye cameras, fixed extrinsics from factory calibration, projection onto a ground plane or bowl, and blending in the overlap zones. Objects above the ground cause ghosting.

# Where learning helps

- Networks that predict a flexible warp (mesh or flow), trained without labels by matching the overlap region.
- Segmentation-style networks (U-Net) that predict the seam mask and blend.
- A hybrid of calibrated geometry and a small refinement network is a practical real-time design.

=== nlp ===
# What interviewers check

Even in the LLM era you are expected to know the classic toolbox, the metrics and how to fine-tune.

# Text to numbers

- **Bag-of-words and TF-IDF.** Sparse counts. `tf * ln(N / df)` down-weights words that appear everywhere.
- **Word embeddings** (word2vec, GloVe). One dense vector per word.
- **Contextual embeddings** (BERT). The vector depends on the sentence.
- **Sentence embeddings.** One vector per passage, for search and clustering.

# Tasks and baselines

| Task | Strong simple baseline | Modern approach |
| --- | --- | --- |
| Classification | TF-IDF + logistic regression | Fine-tuned encoder or LLM prompt |
| Named entities | CRF | Fine-tuned encoder |
| Summarisation | Extractive (TextRank) | Seq2seq or LLM |
| Translation | | Seq2seq transformer or LLM |

# Metrics for generated text

- **BLEU:** n-gram precision, from translation.
- **ROUGE-1, ROUGE-2, ROUGE-L:** n-gram and longest-common-subsequence recall, for summarisation.
- Both reward word overlap, so they punish good paraphrases. Add human or LLM-judge review.

# Fine-tuning with limited compute

- Start from a pre-trained model (for example FLAN-T5).
- **LoRA / PEFT:** freeze the base, train small low-rank adapters.
- Use a consistent prompt template, a low learning rate and early stopping.
- Compare against the base model on a held-out set.

# Arabic

Rich morphology, optional diacritics, dialects that differ from Modern Standard Arabic and mixed Arabic-English text. Check that your tokenizer and embedding model handle them.
