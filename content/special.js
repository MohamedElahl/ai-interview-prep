const R = String.raw;

export default [
  {
    id: 'cv-basics', title: 'Image processing and CNNs', tracks: ['cv', 'auto', 'mle'],
    tasks: [
      {
        id: 'cv-outsize', title: 'Convolution output size',
        prompt: `Write \`conv_output_size(n, k, stride=1, padding=0)\`: the output width of a convolution on an input of width \`n\` with kernel \`k\`.

\`out = floor((n + 2 * padding - k) / stride) + 1\``,
        starter: R`def conv_output_size(n, k, stride=1, padding=0):
    pass

print(conv_output_size(224, 7, 2, 3))  # 112
`,
        solution: R`def conv_output_size(n, k, stride=1, padding=0):
    return (n + 2 * padding - k) // stride + 1
`,
        tests: [
          { name: 'ResNet first layer', code: R`assert conv_output_size(224, 7, 2, 3) == 112, '224 input, 7x7 kernel, stride 2, padding 3 gives 112'` },
          { name: 'Same padding', code: R`assert conv_output_size(32, 3, 1, 1) == 32, 'A 3x3 kernel with padding 1 keeps the size'` },
          { name: 'Floor division', code: R`assert conv_output_size(5, 2, 2, 0) == 2 and conv_output_size(7, 3) == 5, 'Round down when the stride does not fit exactly'` }
        ]
      },
      {
        id: 'cv-conv2d', title: '2-D convolution from scratch',
        prompt: `Write \`conv2d(image, kernel, stride=1, padding=0)\` for a single-channel image, as deep-learning frameworks compute it (cross-correlation: the kernel is **not** flipped).

Zero-pad the image by \`padding\` on every side, slide the kernel with the given stride and return the 2-D result as a numpy array.`,
        starter: R`import numpy as np

def conv2d(image, kernel, stride=1, padding=0):
    image = np.asarray(image, dtype=float)
    kernel = np.asarray(kernel, dtype=float)
    pass

print(conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, -1]]))
`,
        solution: R`import numpy as np

def conv2d(image, kernel, stride=1, padding=0):
    image = np.asarray(image, dtype=float)
    kernel = np.asarray(kernel, dtype=float)
    if padding:
        image = np.pad(image, padding)
    kh, kw = kernel.shape
    oh = (image.shape[0] - kh) // stride + 1
    ow = (image.shape[1] - kw) // stride + 1
    out = np.zeros((oh, ow))
    for i in range(oh):
        for j in range(ow):
            patch = image[i * stride:i * stride + kh, j * stride:j * stride + kw]
            out[i, j] = (patch * kernel).sum()
    return out
`,
        tests: [
          { name: 'Basic', code: R`assert close(conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, -1]]), [[-4, -4], [-4, -4]]), 'Expected [[-4, -4], [-4, -4]]'` },
          { name: 'Padding', code: R`import numpy as np
assert close(conv2d(np.ones((3, 3)), np.ones((3, 3)), padding=1), [[4, 6, 4], [6, 9, 6], [4, 6, 4]]), 'With zero padding 1, a 3x3 box filter on ones gives [[4,6,4],[6,9,6],[4,6,4]]'` },
          { name: 'Stride', code: R`import numpy as np
assert close(conv2d(np.arange(16).reshape(4, 4), [[1]], stride=2), [[0, 2], [8, 10]]), 'Stride 2 with a 1x1 kernel picks every second pixel'` },
          { name: 'Kernel is not flipped', code: R`assert close(conv2d([[1, 2], [3, 4]], [[0, 1], [0, 0]]), [[2]]), 'Use cross-correlation: do not flip the kernel'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why do CNNs need far fewer parameters than fully connected networks on images?', options: ['They use smaller images', 'Weight sharing: the same small kernel is applied at every position', 'They skip training', 'They use integer weights'], answer: 1, why: 'Sharing also gives translation equivariance: a feature is detected wherever it appears.', level: 'easy' },
      { q: 'A depthwise separable convolution (MobileNet) replaces a standard convolution with…', options: ['Two pooling layers', 'A per-channel spatial convolution followed by a 1×1 convolution', 'A fully connected layer', 'A transformer block'], answer: 1, why: 'This cuts parameters and compute by roughly a factor of the kernel area, which is why it is used on embedded devices.', level: 'medium' },
      { q: 'What do residual (skip) connections solve?', options: ['Overfitting', 'Degradation and vanishing gradients in very deep networks', 'Class imbalance', 'Slow data loading'], answer: 1, why: 'The layer learns a correction to the identity, and gradients flow through the shortcut.', level: 'easy' },
      { q: 'U-Net is well suited to segmentation because…', options: ['It has no pooling', 'Skip connections bring fine spatial detail from the encoder to the decoder', 'It is the smallest network', 'It uses only 1×1 convolutions'], answer: 1, why: 'The encoder captures context, the decoder restores resolution, and skips preserve edges.', level: 'easy' },
      { q: 'Which augmentation would be harmful for reading traffic signs?', options: ['Small brightness change', 'Horizontal flip', 'Slight rotation', 'Small crop'], answer: 1, why: 'Flipping changes the meaning of arrows and text. Augmentations must keep the label valid.', level: 'medium' },
      { q: 'What does a pooling layer do?', options: ['Adds new learnable kernels', 'Converts the image to greyscale', 'Shrinks feature maps by summarising small regions', 'Assigns a label to each pixel'], answer: 2, why: 'Max or average pooling reduces the spatial size and adds a little tolerance to shifts.', level: 'easy' },
      { q: 'A convolution layer has 32 input channels, 16 output channels and 5×5 kernels. How many weights does it have, ignoring biases?', options: ['800', '25,600', '12,800', '512'], answer: 2, why: '5 × 5 × 32 × 16 = 12,800.', level: 'medium' },
      { q: 'Training accuracy is 99% and validation accuracy is 70%. What is the best first remedy?', options: ['Train for many more epochs', 'Remove the validation set', 'Raise the learning rate tenfold', 'Add data augmentation and regularisation'], answer: 3, why: 'A large gap means overfitting, which more variety in the data and regularisation address.', level: 'medium' },
      { q: 'A 64-pixel-wide input passes through two identical layers, each with kernel 5, stride 2 and padding 2. What is the output width?', options: ['32', '15', '14', '16'], answer: 3, why: 'Each layer gives (64 + 4 − 5) // 2 + 1 = 32 and then (32 + 4 − 5) // 2 + 1 = 16.', level: 'hard' },
      { q: 'Two stacked 3×3 convolutions cover the same 5×5 receptive field as one 5×5. Why are they usually preferred?', options: ['They are always faster on every device', 'They have a larger receptive field', 'Fewer weights (18 against 25 per channel pair) and an extra non-linearity', 'They need no activation function'], answer: 2, why: 'The stack is cheaper and more expressive, which is why VGG-style networks use 3×3 kernels.', level: 'hard' },
      { q: 'A model scores 95% on saved test images but behaves badly on a live camera feed. What should you check first?', options: ['Colour channel order, resizing and normalisation in the live pipeline', 'Whether the GPU driver is recent', 'The file extension of the saved images', 'The number of layers'], answer: 0, why: 'A preprocessing mismatch between training and deployment is the most common silent cause.', level: 'hard' },
      { q: 'Why is a batch size of 1 a problem for batch normalisation during training?', options: ['It makes the convolution kernels larger', 'It requires labelled masks', 'It forbids the use of ReLU', 'The mean and variance estimated from one example are extremely noisy'], answer: 3, why: 'Group or layer normalisation avoid this dependence on the batch.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain how a convolutional layer works and why it suits images.', points: [['A small kernel slides over the image computing local weighted sums', ['kernel', 'filter', 'slide', 'local']], ['Weights are shared across positions', ['shar']], ['Translation equivariance, far fewer parameters', ['translation', 'fewer parameter', 'equivarian', 'invarian']], ['Stacking layers grows the receptive field and builds a feature hierarchy', ['receptive field', 'hierarch', 'edges', 'deeper']]], model: 'A convolutional layer slides a small learnable kernel across the image and at each position computes a weighted sum of the local patch, producing a feature map. Because the same kernel is used everywhere, the layer has few parameters and detects a pattern regardless of where it appears. This matches the structure of images, where nearby pixels are related and the same edges and textures recur. Stacking layers with stride or pooling increases the receptive field, so early layers find edges, middle layers find parts and deep layers find objects.' },
      { q: 'How would you make a vision model run in real time on an embedded device?', points: [['Choose an efficient architecture', ['mobilenet', 'efficient', 'small', 'lightweight', 'depthwise', 'yolo']], ['Quantise to 8-bit', ['quanti', 'int8', '8-bit', '8 bit']], ['Prune or distil', ['prun', 'distil']], ['Reduce input resolution or frame rate', ['resolution', 'frame rate', 'input size']], ['Use the hardware runtime and measure latency on the target', ['tensorrt', 'tflite', 'onnx', 'npu', 'latency', 'profil', 'target', 'c code']]], model: 'I start from an architecture designed for efficiency, such as MobileNet or a small YOLO variant, and choose the smallest input resolution that still meets the accuracy requirement. Then I compress: post-training or quantisation-aware 8-bit quantisation, pruning of redundant channels and, if needed, distillation from a larger teacher. I export to the target runtime, for example TensorRT, TFLite or generated C code for a microcontroller, and I profile on the real hardware, because latency depends on which operators the accelerator supports. I verify that accuracy after conversion matches the original model on a validation set, and I check memory and worst-case timing.' },
      { q: 'Describe a computer vision project you built end to end.', points: [['The problem and why it mattered', ['problem', 'goal', 'customer', 'need']], ['Data: collection, labelling, splits', ['data', 'label', 'annotat', 'split']], ['Model choice and training', ['model', 'train', 'architecture', 'cnn', 'yolo', 'u-net', 'unet']], ['Evaluation with the right metric', ['metric', 'map', 'iou', 'precision', 'recall', 'accuracy', 'f1']], ['Deployment and a measured result', ['deploy', 'result', 'latency', 'fps', 'improv', 'production']]], model: 'Use one real project and keep to a clear structure. State the problem and constraints, for example detecting exterior car damage from photos, or stitching fisheye cameras into a surround view in real time. Explain the data: how it was collected and labelled, how you split it to avoid leakage, and what was hard about it. Describe the model and why you chose it over alternatives, then the metric and the baseline. Finish with deployment, the constraints you met such as frame rate or memory, the measured result, and one thing you would do differently.' }
    ]
  },

  {
    id: 'cv-detection', title: 'Object detection and segmentation', tracks: ['cv', 'auto', 'mle'],
    tasks: [
      {
        id: 'cv-iou', title: 'Intersection over union',
        prompt: `Write \`iou(a, b)\` for two boxes given as \`[x1, y1, x2, y2]\` with \`x1 < x2\` and \`y1 < y2\`. Return intersection area divided by union area. Boxes that do not overlap have IoU 0.`,
        starter: R`def iou(a, b):
    pass

print(iou([0, 0, 2, 2], [1, 1, 3, 3]))  # 1/7
`,
        solution: R`def iou(a, b):
    w = min(a[2], b[2]) - max(a[0], b[0])
    h = min(a[3], b[3]) - max(a[1], b[1])
    if w <= 0 or h <= 0:
        return 0.0
    inter = w * h
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    return inter / (area_a + area_b - inter)
`,
        tests: [
          { name: 'Partial overlap', code: R`assert close(iou([0, 0, 2, 2], [1, 1, 3, 3]), 1/7), 'Intersection 1, union 7'` },
          { name: 'Identical boxes', code: R`assert close(iou([1, 2, 5, 9], [1, 2, 5, 9]), 1.0), 'A box with itself has IoU 1'` },
          { name: 'No overlap', code: R`assert close(iou([0, 0, 1, 1], [2, 2, 3, 3]), 0.0) and close(iou([0, 0, 1, 1], [1, 0, 2, 1]), 0.0), 'Separate or merely touching boxes have IoU 0 (never negative)'` },
          { name: 'One inside the other', code: R`assert close(iou([0, 0, 4, 4], [1, 1, 3, 3]), 0.25), 'Inner area 4 over outer area 16'` }
        ]
      },
      {
        id: 'cv-nms', title: 'Non-maximum suppression',
        prompt: `Detectors output many overlapping boxes for one object. Write \`nms(boxes, scores, threshold)\`:

1. Take the remaining box with the highest score and keep it.
2. Remove every remaining box whose IoU with it is **greater than** \`threshold\`.
3. Repeat until no boxes remain.

Return the indices of the kept boxes, in the order they were kept.`,
        starter: R`def iou(a, b):
    pass

def nms(boxes, scores, threshold):
    pass
`,
        solution: R`def iou(a, b):
    w = min(a[2], b[2]) - max(a[0], b[0])
    h = min(a[3], b[3]) - max(a[1], b[1])
    if w <= 0 or h <= 0:
        return 0.0
    inter = w * h
    return inter / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter)

def nms(boxes, scores, threshold):
    order = sorted(range(len(boxes)), key=lambda i: -scores[i])
    keep = []
    while order:
        best = order.pop(0)
        keep.append(best)
        order = [i for i in order if iou(boxes[best], boxes[i]) <= threshold]
    return keep
`,
        tests: [
          { name: 'Suppresses the duplicate', code: R`boxes = [[0, 0, 2, 2], [0.1, 0.1, 2, 2], [5, 5, 6, 6]]
assert list(nms(boxes, [0.9, 0.8, 0.7], 0.5)) == [0, 2], 'Box 1 overlaps box 0 heavily and is removed'` },
          { name: 'Highest score wins', code: R`boxes = [[0, 0, 2, 2], [0.1, 0.1, 2, 2], [5, 5, 6, 6]]
assert list(nms(boxes, [0.8, 0.9, 0.7], 0.5)) == [1, 2], 'Now box 1 has the highest score and is kept'` },
          { name: 'High threshold keeps both', code: R`boxes = [[0, 0, 2, 2], [0.1, 0.1, 2, 2], [5, 5, 6, 6]]
assert list(nms(boxes, [0.9, 0.8, 0.7], 0.95)) == [0, 1, 2], 'IoU 0.9025 is below 0.95, so nothing is removed'` },
          { name: 'Empty input', code: R`assert list(nms([], [], 0.5)) == [], 'No boxes in, no boxes out'` }
        ]
      }
    ],
    quiz: [
      { q: 'mAP@0.5 counts a detection as correct when…', options: ['Its score is above 0.5', 'Its IoU with a ground-truth box of the same class is at least 0.5', 'Half the image is covered', 'Recall is 0.5'], answer: 1, why: 'Average precision is the area under the precision-recall curve for one class; mAP averages over classes.', level: 'easy' },
      { q: 'One-stage detectors such as YOLO differ from two-stage detectors such as Faster R-CNN by…', options: ['Using no convolution', 'Predicting boxes and classes directly in one pass, without a separate proposal stage', 'Needing no labels', 'Working only on video'], answer: 1, why: 'One-stage is faster and suits real-time use; two-stage was historically more accurate on small objects.', level: 'easy' },
      { q: 'Semantic versus instance segmentation?', options: ['They are the same', 'Semantic labels every pixel by class; instance also separates individual objects', 'Instance has no classes', 'Semantic is for video only'], answer: 1, why: 'Panoptic segmentation combines both.', level: 'easy' },
      { q: 'Your detector misses small, distant objects. A reasonable first step?', options: ['Lower the learning rate', 'Increase input resolution or use multi-scale features, and check the labels for small objects', 'Remove augmentation', 'Train fewer epochs'], answer: 1, why: 'Small objects vanish when the image is downsampled. Feature pyramids and tiling help.', level: 'medium' },
      { q: 'Dice loss is popular for segmentation because…', options: ['It is faster than convolution', 'It handles class imbalance between a small foreground and a large background', 'It needs no labels', 'It only works on RGB'], answer: 1, why: 'It optimises overlap directly, so the background does not dominate.', level: 'medium' },
      { q: 'What does intersection over union (IoU) measure?', options: ['Image brightness', 'Training speed', 'The overlap between two boxes divided by their combined area', 'The number of classes'], answer: 2, why: 'It is 1 for a perfect match and 0 for no overlap.', level: 'easy' },
      { q: 'You raise the NMS IoU threshold from 0.5 to 0.9. What usually happens?', options: ['More overlapping duplicate boxes survive', 'Fewer boxes survive', 'Training becomes faster', 'Classes are merged'], answer: 0, why: 'Boxes are only removed when they overlap the kept box by more than the threshold.', level: 'medium' },
      { q: 'A box is [100, 50, 300, 150] in corner format. What is its area?', options: ['15,000', '30,000', '20,000', '40,000'], answer: 2, why: '(300 − 100) × (150 − 50) = 200 × 100.', level: 'medium' },
      { q: 'Box A is [0, 0, 4, 4] and box B is [1, 1, 5, 5]. What is their IoU?', options: ['9/32 ≈ 0.28', '1/2', '1/4', '9/23 ≈ 0.39'], answer: 3, why: 'The intersection is 3 × 3 = 9 and the union is 16 + 16 − 9 = 23.', level: 'hard' },
      { q: 'A detector has mAP@0.5 of 0.80 but mAP@0.5:0.95 of only 0.35. What should you focus on?', options: ['More training images of the same class only', 'Tighter localisation: a better box loss such as CIoU, higher resolution and cleaner box labels', 'Raising the confidence threshold', 'Using fewer classes'], answer: 1, why: 'Objects are found, but the boxes are loose at strict IoU thresholds.', level: 'hard' },
      { q: 'A one-stage detector sees about 10,000 background locations for every object, and easy background dominates the loss. Which technique helps?', options: ['Larger batches of the same images', 'Removing augmentation', 'Focal loss or hard-negative mining', 'Lowering the input resolution'], answer: 2, why: 'Both focus the training signal on the hard examples.', level: 'hard' },
      { q: 'Validation mAP is 0.62 but field mAP is 0.30, and frames from the same videos appear in both training and validation. What is wrong?', options: ['The learning rate is too low', 'The model is too small', 'Validation sets should be empty', 'Near-duplicate frames leak into validation, so split by video or location'], answer: 3, why: 'Consecutive frames are almost identical, which inflates the validation score.', level: 'hard' }
    ],
    interview: [
      { q: 'How does YOLO detect objects, and how is it evaluated?', points: [['Single pass: predicts boxes, objectness and classes on a grid or per point', ['single', 'one pass', 'one stage', 'one-stage', 'grid', 'directly']], ['Multi-scale feature maps for different object sizes', ['scale', 'feature pyramid', 'fpn', 'multi-scale']], ['Non-maximum suppression removes duplicates', ['non-max', 'nms', 'suppress']], ['Evaluated with IoU and mean average precision', ['map', 'average precision', 'iou']]], model: 'YOLO is a one-stage detector. A convolutional backbone extracts features, a neck combines them at several scales, and the head predicts, for each location, a bounding box, a confidence and class probabilities, all in a single forward pass, which makes it fast enough for real time. Because many locations fire for the same object, non-maximum suppression keeps the highest-scoring box and removes overlapping ones. We evaluate with intersection over union to decide whether a prediction matches a ground-truth box, and report mean average precision, the area under the precision-recall curve averaged over classes and often over IoU thresholds, together with latency.' },
      { q: 'Your detector works in the lab but fails in the field. What do you check?', points: [['Distribution shift: lighting, weather, camera, viewpoint', ['distribution', 'shift', 'lighting', 'weather', 'domain', 'different camera']], ['Collect and label failure cases', ['collect', 'failure', 'hard example', 'label']], ['Augmentation and retraining or fine-tuning', ['augment', 'retrain', 'fine-tun', 'finetun']], ['Check preprocessing parity between training and deployment', ['preprocess', 'normali', 'resize', 'color', 'colour', 'parity', 'quanti']], ['Monitor and re-evaluate by slice', ['monitor', 'slice', 'per condition', 'per-class', 'breakdown']]], model: 'The usual cause is a difference between training data and field data: other lighting, weather, camera optics or mounting angle. I first rule out a deployment bug by checking that preprocessing is identical, including colour order, resizing and normalisation, and that quantisation did not cost accuracy. Then I collect field failures, label them and break performance down by condition to see where it drops. I add those cases to training with targeted augmentation, fine-tune, and re-evaluate on a held-out field set. Longer term I set up monitoring so that new failure modes are found and fed back into the dataset.' },
      { q: 'Explain how you would evaluate a segmentation model.', points: [['IoU or Dice per class', ['iou', 'dice', 'jaccard']], ['Mean over classes, because of class imbalance', ['mean', 'miou', 'imbalance', 'per class', 'per-class']], ['Boundary quality matters for some tasks', ['boundar', 'edge']], ['Qualitative review and task-level metric', ['visual', 'qualitative', 'task', 'downstream', 'look at']]], model: 'Pixel accuracy is misleading because the background dominates, so I use intersection over union or the Dice coefficient per class and report the mean. I look at per-class numbers, since a rare but important class such as pedestrians can hide behind a good average. If boundaries matter, as in stitching or drivable-area estimation, I add a boundary metric. I always inspect predictions visually on hard cases, and I measure the metric of the task that consumes the mask, plus latency on the target.' }
    ]
  },

  {
    id: 'cv-geometry', title: 'Camera geometry and stitching', tracks: ['cv', 'auto'],
    tasks: [
      {
        id: 'geo-project', title: 'Pinhole projection',
        prompt: `Write \`project(point, f, cx, cy)\` that projects a 3-D point \`(X, Y, Z)\` in camera coordinates (Z forward) to pixel coordinates \`(u, v)\`:

\`u = f * X / Z + cx\`, \`v = f * Y / Z + cy\`

Return \`None\` if the point is not in front of the camera (\`Z <= 0\`).`,
        starter: R`def project(point, f, cx, cy):
    pass

print(project((1, 2, 4), 800, 320, 240))  # (520.0, 640.0)
`,
        solution: R`def project(point, f, cx, cy):
    X, Y, Z = point
    if Z <= 0:
        return None
    return f * X / Z + cx, f * Y / Z + cy
`,
        tests: [
          { name: 'Off-axis point', code: R`assert close(project((1, 2, 4), 800, 320, 240), [520, 640]), 'Expected (520, 640)'` },
          { name: 'On the optical axis', code: R`assert close(project((0, 0, 5), 800, 320, 240), [320, 240]), 'A point on the axis lands on the principal point'` },
          { name: 'Farther means closer to the centre', code: R`u1, _ = project((1, 0, 2), 500, 0, 0); u2, _ = project((1, 0, 10), 500, 0, 0)
assert close(u1, 250) and close(u2, 50), 'The same offset appears smaller when farther away'` },
          { name: 'Behind the camera', code: R`assert project((1, 1, 0), 800, 320, 240) is None and project((1, 1, -3), 800, 320, 240) is None, 'Z <= 0 is not visible: return None'` }
        ]
      },
      {
        id: 'geo-homography', title: 'Apply a homography',
        prompt: `A homography is a 3×3 matrix that maps points between two views of a plane. It is the core of image stitching.

Write \`apply_homography(H, points)\`. For each \`(x, y)\`, compute \`[x', y', w] = H @ [x, y, 1]\` and return \`(x'/w, y'/w)\`. Return a list of tuples.`,
        starter: R`import numpy as np

def apply_homography(H, points):
    H = np.asarray(H, dtype=float)
    pass

print(apply_homography([[1, 0, 5], [0, 1, -2], [0, 0, 1]], [(1, 1)]))  # [(6.0, -1.0)]
`,
        solution: R`import numpy as np

def apply_homography(H, points):
    H = np.asarray(H, dtype=float)
    out = []
    for x, y in points:
        xp, yp, w = H @ np.array([x, y, 1.0])
        out.append((xp / w, yp / w))
    return out
`,
        tests: [
          { name: 'Translation', code: R`assert close(apply_homography([[1, 0, 5], [0, 1, -2], [0, 0, 1]], [(1, 1), (0, 0)]), [[6, -1], [5, -2]]), 'A pure translation adds (5, -2)'` },
          { name: 'Projective division', code: R`assert close(apply_homography([[1, 0, 0], [0, 1, 0], [0.5, 0, 1]], [(2, 4)]), [[1, 2]]), 'Divide by w = 0.5*2 + 1 = 2: expected (1, 2)'` },
          { name: 'Scale invariance', code: R`import numpy as np
H = np.array([[2.0, 0.3, 4.0], [0.1, 1.5, -3.0], [0.001, 0.002, 1.0]])
assert close(apply_homography(H, [(10, 20)]), apply_homography(3 * H, [(10, 20)]), 1e-9), 'H and 3*H describe the same mapping'` }
        ]
      },
      {
        id: 'geo-dice', title: 'Dice coefficient',
        prompt: `Write \`dice(pred, target)\` for two binary masks of the same shape (nested lists or arrays of 0 and 1):

\`dice = 2 * |pred ∩ target| / (|pred| + |target|)\`

If both masks are empty, return \`1.0\`.`,
        starter: R`import numpy as np

def dice(pred, target):
    pass

print(dice([[1, 1], [0, 0]], [[1, 0], [0, 0]]))  # 0.667
`,
        solution: R`import numpy as np

def dice(pred, target):
    p = np.asarray(pred).astype(bool)
    t = np.asarray(target).astype(bool)
    total = p.sum() + t.sum()
    if total == 0:
        return 1.0
    return 2.0 * (p & t).sum() / total
`,
        tests: [
          { name: 'Partial overlap', code: R`assert close(dice([[1, 1], [0, 0]], [[1, 0], [0, 0]]), 2/3), 'Intersection 1, sizes 2 and 1: 2*1/3'` },
          { name: 'Perfect and disjoint', code: R`assert close(dice([[1, 0], [1, 0]], [[1, 0], [1, 0]]), 1.0) and close(dice([[1, 0]], [[0, 1]]), 0.0), 'Identical masks give 1, disjoint masks give 0'` },
          { name: 'Both empty', code: R`assert close(dice([[0, 0], [0, 0]], [[0, 0], [0, 0]]), 1.0), 'Two empty masks agree perfectly: 1.0'` }
        ]
      }
    ],
    quiz: [
      { q: 'Camera intrinsics describe…', options: ['Where the camera is mounted', 'Focal length, principal point and lens distortion', 'Exposure time', 'The scene depth'], answer: 1, why: 'Extrinsics are the rotation and translation that place the camera in the world or vehicle frame.', level: 'easy' },
      { q: 'A homography exactly relates two images when…', options: ['Always', 'The scene is planar, or the camera only rotates about its centre', 'The images are greyscale', 'The cameras are identical'], answer: 1, why: 'With translation and depth variation you get parallax, which a single homography cannot model. That causes ghosting in stitched images.', level: 'medium' },
      { q: 'Why do surround-view systems use fisheye lenses?', options: ['They are sharper', 'A field of view near 180° lets four cameras cover 360° around the car', 'They need no calibration', 'They remove distortion'], answer: 1, why: 'The cost is strong distortion, which needs a fisheye model, not the plain pinhole model.', level: 'easy' },
      { q: 'RANSAC is used in feature-based stitching to…', options: ['Sharpen the image', 'Estimate the transform while rejecting wrong feature matches', 'Blend the seam', 'Detect corners'], answer: 1, why: 'It repeatedly fits a model to a random minimal subset and keeps the one with most inliers.', level: 'easy' },
      { q: 'Minimum number of point correspondences to estimate a homography?', options: ['2', '3', '4', '8'], answer: 2, why: 'It has 8 degrees of freedom and each point pair gives 2 equations.', level: 'easy' },
      { q: 'f = 800 pixels. A point at (X, Y, Z) = (2, 0, 8) lies how many pixels from the principal point horizontally?', options: ['100', '400', '50', '200'], answer: 3, why: '800 × 2 / 8 = 200.', level: 'medium' },
      { q: 'A pedestrian 1.7 m tall appears 85 pixels tall in an image with f = 1000 pixels. About how far away is the pedestrian?', options: ['10 m', '20 m', '50 m', '1.7 m'], answer: 1, why: 'distance = f × real height / pixel height = 1000 × 1.7 / 85.', level: 'medium' },
      { q: 'The lens of a camera is replaced by one with a different focal length. What must be recalibrated?', options: ['Only the colour correction', 'Nothing, the pinhole model adapts', 'The intrinsics and distortion coefficients', 'Only the frame rate'], answer: 2, why: 'Focal length and distortion are properties of the lens.', level: 'medium' },
      { q: 'An image is 1000 pixels wide and f = 500 pixels. What is the horizontal field of view?', options: ['60°', '90°', '45°', '120°'], answer: 1, why: '2 × atan(1000 / (2 × 500)) = 2 × 45°.', level: 'hard' },
      { q: 'A camera is 2 m high. The top of a 1 m post is 3 m away horizontally. Where does it land in a ground-plane top-down view?', options: ['3 m', '4.5 m', '9 m', '6 m'], answer: 3, why: 'Similar triangles: 3 × 2 / (2 − 1) = 6 m, which is why tall objects stretch away from the camera.', level: 'hard' },
      { q: 'Reprojection error is 0.2 pixels, yet straight lines remain curved near the corners of test images. What is the likely cause?', options: ['The calibration images did not cover the corners, so distortion is poorly constrained there', 'The focal length is too large', 'The checkerboard was too flat', 'The sensor is monochrome'], answer: 0, why: 'A low error on the calibration set can hide a model that is poor where it saw no data.', level: 'hard' },
      { q: 'Half of the matches are outliers. RANSAC draws a random sample of 4 matches. What is the probability that all four are inliers?', options: ['1/4', '1/8', '1/16', '1/2'], answer: 2, why: '(1/2)^4 = 1/16, so about 16 draws find a clean sample on average.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain the steps of image stitching.', points: [['Calibrate and undistort', ['calibrat', 'undistort', 'distortion']], ['Find and match features', ['feature', 'match', 'sift', 'orb', 'keypoint']], ['Estimate the transform robustly (homography with RANSAC)', ['homograph', 'ransac']], ['Warp images to a common surface', ['warp', 'project', 'common']], ['Blend the seam and correct exposure', ['blend', 'seam', 'exposure']]], model: 'First I calibrate each camera and remove lens distortion. Then I detect keypoints, compute descriptors and match them between overlapping images. From the matches I estimate a homography with RANSAC to reject wrong correspondences. I warp the images onto a common surface, a plane, cylinder or bowl depending on the application, and finally I hide the seam: choose a seam path through low-difference regions, compensate exposure and blend. In a vehicle the cameras are fixed, so the geometry comes from offline extrinsic calibration instead of live feature matching, and the challenge becomes parallax for objects that are not on the ground plane.' },
      { q: 'What are the limits of geometric stitching, and how can deep learning help?', points: [['Parallax: one homography fails with depth variation', ['parallax', 'depth', 'single homography', 'one homography']], ['Artefacts: ghosting and misalignment', ['ghost', 'misalign', 'artifact', 'artefact', 'double']], ['Learned methods predict flexible warps or blend seams', ['learn', 'network', 'mesh', 'flow', 'udis', 'unsupervised', 'u-net', 'unet']], ['Hybrid: geometry for global alignment, network for local refinement', ['hybrid', 'combin', 'refin']], ['Constraint: real-time on embedded hardware', ['real-time', 'real time', 'embedded', 'latency', 'fps']]], model: 'A homography assumes a planar scene or a purely rotating camera. Vehicle cameras are far apart, so objects off the ground plane appear in different places in each view, which gives ghosting and broken edges at the seam. Deep learning helps in two places. A network can predict a more flexible warp, such as a mesh or flow field, trained without labels by making the warped overlap regions agree, as in unsupervised deep stitching. And a segmentation-style network can learn a seam mask and blending that hides remaining misalignment. In practice I would combine them: calibrated geometry for stable global alignment and a small network for local refinement, sized to meet the frame-rate budget on the embedded target.' },
      { q: 'How do you calibrate a camera, and how do you know the calibration is good?', points: [['Capture a known pattern (checkerboard) from many poses', ['checkerboard', 'pattern', 'chessboard', 'target']], ['Solve for intrinsics and distortion', ['intrinsic', 'distortion', 'focal']], ['Extrinsics relative to the vehicle or other sensors', ['extrinsic', 'rotation', 'translation']], ['Check the reprojection error', ['reprojection']], ['Validate on independent data, watch for drift', ['valid', 'independent', 'drift', 'online']]], model: 'For intrinsics I capture a known pattern such as a checkerboard at many positions and angles covering the whole image, detect its corners and solve for focal length, principal point and distortion coefficients, using a fisheye model for wide lenses. For extrinsics I place targets at known positions relative to the vehicle, or align against another sensor, and solve for rotation and translation. I judge quality by the reprojection error, which should be well under a pixel, and by an independent check such as whether straight lines are straight and whether projected lidar or radar points land on the right objects. In production I monitor for drift and use online calibration to correct it.' }
    ]
  },

  {
    id: 'nlp', title: 'Classic NLP and text metrics', tracks: ['nlp', 'genai', 'ds'],
    tasks: [
      {
        id: 'nlp-tfidf', title: 'TF-IDF',
        prompt: `Write \`tfidf(docs)\` where \`docs\` is a list of token lists. Return a list with one dict per document mapping each of its terms to its TF-IDF weight:

- \`tf = count of term in doc / number of tokens in doc\`
- \`idf = ln(N / df)\`, where \`N\` is the number of documents and \`df\` the number of documents containing the term`,
        starter: R`import math

def tfidf(docs):
    pass

print(tfidf([["a", "b"], ["a", "c", "c"]]))
`,
        solution: R`import math
from collections import Counter

def tfidf(docs):
    n = len(docs)
    df = Counter(term for doc in docs for term in set(doc))
    out = []
    for doc in docs:
        counts = Counter(doc)
        out.append({t: (c / len(doc)) * math.log(n / df[t]) for t, c in counts.items()})
    return out
`,
        tests: [
          { name: 'Common term scores zero', code: R`r = tfidf([["a", "b"], ["a", "c", "c"]])
assert close(r[0]["a"], 0.0) and close(r[1]["a"], 0.0), 'A term in every document has idf = ln(1) = 0'` },
          { name: 'Rare terms score higher', code: R`import math
r = tfidf([["a", "b"], ["a", "c", "c"]])
assert close(r[0]["b"], 0.5 * math.log(2)), 'tf = 1/2, idf = ln 2'
assert close(r[1]["c"], (2 / 3) * math.log(2)), 'tf = 2/3, idf = ln 2'` },
          { name: 'Only the document’s own terms', code: R`r = tfidf([["x"], ["y", "y"], ["z"]])
assert set(r[1].keys()) == {"y"} and len(r) == 3, 'Each dict contains only the terms of that document'` }
        ]
      },
      {
        id: 'nlp-rouge', title: 'ROUGE-L with dynamic programming',
        prompt: `ROUGE-L scores a summary by its longest common subsequence (LCS) with a reference. Write \`rouge_l(candidate, reference)\`:

- Lowercase both strings and split on whitespace.
- \`lcs\` = length of the longest common subsequence of the two token lists (use dynamic programming).
- \`precision = lcs / len(candidate)\`, \`recall = lcs / len(reference)\`, return their F1.
- If either is empty or \`lcs\` is 0, return \`0.0\`.`,
        starter: R`def rouge_l(candidate, reference):
    pass

print(rouge_l("the cat sat on the mat", "the cat is on the mat"))  # 0.833
`,
        solution: R`def rouge_l(candidate, reference):
    c, r = candidate.lower().split(), reference.lower().split()
    if not c or not r:
        return 0.0
    dp = [[0] * (len(r) + 1) for _ in range(len(c) + 1)]
    for i in range(1, len(c) + 1):
        for j in range(1, len(r) + 1):
            if c[i - 1] == r[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    lcs = dp[-1][-1]
    if lcs == 0:
        return 0.0
    p, rec = lcs / len(c), lcs / len(r)
    return 2 * p * rec / (p + rec)
`,
        tests: [
          { name: 'Typical summary', code: R`assert close(rouge_l("the cat sat on the mat", "the cat is on the mat"), 5/6), 'LCS is "the cat on the mat" (5 tokens): F1 = 5/6'` },
          { name: 'Order matters', code: R`assert close(rouge_l("a b c", "c b a"), 1/3), 'Reversed order shares a subsequence of length 1 only'` },
          { name: 'Identical and unrelated', code: R`assert close(rouge_l("Hello World", "hello world"), 1.0) and close(rouge_l("a b", "c d"), 0.0), 'Case-insensitive; no shared tokens gives 0'` },
          { name: 'Different lengths', code: R`assert close(rouge_l("the cat", "the big cat sat"), 2/3), 'LCS 2: precision 1, recall 1/2, F1 = 2/3'
assert close(rouge_l("", "a"), 0.0), 'Empty candidate gives 0.0'` }
        ]
      }
    ],
    quiz: [
      { q: 'Main weakness of bag-of-words and TF-IDF?', options: ['Too slow', 'They ignore word order and meaning: "good" and "great" are unrelated', 'They need a GPU', 'They cannot handle English'], answer: 1, why: 'Embeddings place similar meanings close together.', level: 'easy' },
      { q: 'ROUGE is mainly used to evaluate…', options: ['Classification', 'Summarisation, by overlap with reference summaries', 'Speech recognition', 'Image captioning only'], answer: 1, why: 'ROUGE is recall-oriented. BLEU is precision-oriented and comes from machine translation.', level: 'easy' },
      { q: 'Why can a summary score low on ROUGE and still be good?', options: ['ROUGE is random', 'It measures word overlap, so a correct paraphrase is penalised', 'ROUGE needs images', 'It only counts stop-words'], answer: 1, why: 'Complement it with embedding-based metrics, an LLM judge or human review.', level: 'medium' },
      { q: 'Sub-word tokenisation (BPE, WordPiece) helps with…', options: ['Speed only', 'Rare and unseen words, which are split into known pieces', 'Removing punctuation', 'Translation only'], answer: 1, why: 'It is especially valuable for morphologically rich languages such as Arabic.', level: 'medium' },
      { q: 'A particular challenge of Arabic NLP?', options: ['No data exists', 'Rich morphology, optional diacritics and many dialects next to Modern Standard Arabic', 'It has no verbs', 'It cannot be tokenised'], answer: 1, why: 'A model trained on MSA often performs worse on Egyptian dialect text.', level: 'medium' },
      { q: 'What is tokenisation?', options: ['Splitting text into units such as words or sub-words', 'Translating text into another language', 'Removing all vowels', 'Sorting documents by length'], answer: 0, why: 'Models work on tokens, not raw characters or sentences.', level: 'easy' },
      { q: 'Which words does TF-IDF give the lowest weight?', options: ['Rare words', 'Very long words', 'Numbers only', 'Words that appear in almost every document'], answer: 3, why: 'Their IDF is close to zero because they do not help to tell documents apart.', level: 'easy' },
      { q: 'You must find documents similar in meaning to a query, even when they share no words with it. What is the best tool?', options: ['Exact keyword matching', 'Counting characters', 'Sentence embeddings compared with cosine similarity', 'Sorting alphabetically'], answer: 2, why: 'Embeddings place similar meanings close together.', level: 'medium' },
      { q: 'What is the cosine similarity of [3, 4] and [4, 3]?', options: ['0.8', '1.0', '0.6', '0.96'], answer: 3, why: 'The dot product is 24 and both lengths are 5, so 24 / 25.', level: 'hard' },
      { q: 'LoRA with rank 4 is applied to one 1000 × 1000 weight matrix. How many parameters are trained for that matrix?', options: ['4,000', '16,000', '8,000', '1,000,000'], answer: 2, why: 'Two matrices, 1000 × 4 and 4 × 1000, give 8,000, against 1,000,000 in the full matrix.', level: 'hard' },
      { q: 'Only 1% of emails are spam. A model always predicts "not spam". What are its accuracy and spam recall?', options: ['99% accuracy and 0% spam recall', '99% accuracy and 100% spam recall', '1% accuracy and 0% spam recall', '50% accuracy and 50% spam recall'], answer: 0, why: 'Accuracy hides the failure, so look at per-class recall.', level: 'hard' },
      { q: 'A fine-tuned summariser has higher ROUGE than the base model, but users report invented facts. What should you do?', options: ['Ship it, because ROUGE is higher', 'Lower the ROUGE target', 'Remove the complaints from the data', 'Add a faithfulness evaluation against the source and fix the invented facts'], answer: 3, why: 'Overlap metrics do not detect hallucination.', level: 'hard' }
    ],
    interview: [
      { q: 'How would you fine-tune a language model for summarisation with limited compute?', points: [['Start from a pre-trained sequence-to-sequence or instruction model', ['pre-train', 'pretrain', 't5', 'bart', 'flan', 'base model']], ['Parameter-efficient fine-tuning such as LoRA', ['lora', 'peft', 'adapter', 'parameter-efficient']], ['Data preparation: prompt template, tokenisation, truncation', ['template', 'token', 'truncat', 'prompt', 'dataset']], ['Evaluate with ROUGE and human or LLM review, against the base model', ['rouge', 'human', 'baseline', 'base model', 'compare']], ['Watch for overfitting and hallucination', ['overfit', 'hallucin', 'faithful', 'validation']]], model: 'I would start from a pre-trained model suited to the task, such as FLAN-T5, and use parameter-efficient fine-tuning with LoRA, which trains small low-rank matrices in the attention layers while the base weights stay frozen, so it fits on a single modest GPU. I prepare the data with a consistent instruction template, tokenise with truncation and hold out validation and test sets. I train with a low learning rate and early stopping on validation loss. I evaluate against the untuned model using ROUGE, and because ROUGE only measures word overlap, I add a human or LLM-judge check for faithfulness. I save only the adapter weights, which makes deployment and rollback simple.' },
      { q: 'How have text representations evolved from bag-of-words to today?', points: [['Bag-of-words and TF-IDF: sparse counts, no meaning', ['bag', 'tf-idf', 'tfidf', 'sparse', 'count']], ['Word embeddings: dense vectors, one per word', ['word2vec', 'glove', 'embedding', 'dense']], ['Contextual embeddings from transformers', ['context', 'bert', 'transformer']], ['Sentence embeddings for retrieval; LLMs for generation', ['sentence', 'retriev', 'llm', 'generat']]], model: 'We began with bag-of-words and TF-IDF: sparse vectors of word counts that ignore order and meaning but remain strong, cheap baselines. Word2vec and GloVe introduced dense embeddings in which similar words are close, but each word had a single vector whatever the context. Transformers such as BERT produce contextual embeddings, so "bank" differs in "river bank" and "bank account". Sentence-embedding models built on them power semantic search and RAG, and large generative models now handle most tasks through prompting. I still try TF-IDF with a linear model first when I need something fast and explainable.' },
      { q: 'How would you build a text classifier with very little labelled data?', points: [['Zero-shot or few-shot with an LLM', ['zero-shot', 'zero shot', 'few-shot', 'few shot', 'llm', 'prompt']], ['Embeddings plus a simple classifier', ['embedding', 'logistic', 'simple classifier']], ['Fine-tune a small pre-trained model', ['fine-tun', 'finetun', 'pre-train', 'pretrain']], ['Grow the data: weak labels, augmentation, active learning', ['active learning', 'augment', 'weak', 'synthetic', 'label more']], ['Keep a clean test set', ['test set', 'evaluat', 'held-out', 'held out']]], model: 'With a handful of examples I would start with a zero-shot or few-shot prompt to an LLM, which gives a strong baseline in an afternoon. With a few hundred examples, sentence embeddings plus logistic regression is cheap and robust, and fine-tuning a small pre-trained transformer usually beats it once there are a thousand or so. To grow the data I would use the LLM to pre-label, with humans correcting the uncertain cases, which is active learning. Throughout I keep a clean, human-labelled test set that the model never sees, and I may later distil the LLM into a small model for cost and latency.' }
    ]
  }
];
