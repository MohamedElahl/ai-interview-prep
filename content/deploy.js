const R = String.raw;

export default [
  {
    id: 'quantization', title: 'Quantisation in depth', tracks: ['auto', 'cv', 'mlops', 'mle', 'genai'],
    tasks: [
      {
        id: 'q-params', title: 'Scale and zero point',
        prompt: `Write \`qparams(xmin, xmax, signed=True)\` that returns \`(scale, zero_point)\` for 8-bit affine quantisation of the float range \`[xmin, xmax]\`.

1. The range must contain 0: use \`xmin = min(xmin, 0)\` and \`xmax = max(xmax, 0)\`.
2. Integer range: \`qmin, qmax = -128, 127\` if signed, else \`0, 255\`.
3. \`scale = (xmax - xmin) / (qmax - qmin)\`. If the range is empty, return \`(1.0, 0)\`.
4. \`zero_point = round(qmin - xmin / scale)\`, clipped to \`[qmin, qmax]\`, as an int.`,
        starter: R`def qparams(xmin, xmax, signed=True):
    pass

print(qparams(0.0, 6.0))  # (0.0235..., -128)
`,
        solution: R`def qparams(xmin, xmax, signed=True):
    xmin, xmax = min(xmin, 0.0), max(xmax, 0.0)
    qmin, qmax = (-128, 127) if signed else (0, 255)
    if xmax == xmin:
        return 1.0, 0
    scale = (xmax - xmin) / (qmax - qmin)
    zero_point = int(round(qmin - xmin / scale))
    return scale, max(qmin, min(qmax, zero_point))
`,
        tests: [
          { name: 'ReLU6 output, signed', code: R`s, z = qparams(0.0, 6.0)
assert close(s, 6 / 255) and z == -128, 'Range [0, 6] signed: scale 6/255, zero point -128'` },
          { name: 'Symmetric-ish range', code: R`s, z = qparams(-1.28, 1.27)
assert close(s, 0.01) and z == 0, 'Range [-1.28, 1.27]: scale 0.01, zero point 0'` },
          { name: 'Unsigned', code: R`s, z = qparams(-1.0, 3.0, signed=False)
assert close(s, 4 / 255) and z == 64, 'Unsigned [-1, 3]: scale 4/255, zero point 64'` },
          { name: 'Range is widened to include zero', code: R`s, z = qparams(1.0, 5.0)
assert close(s, 5 / 255) and z == -128, 'Zero must be exactly representable, so [1, 5] becomes [0, 5]'
assert qparams(0.0, 0.0) == (1.0, 0), 'Empty range returns (1.0, 0)'` }
        ]
      },
      {
        id: 'q-q15', title: 'Q15 fixed-point multiply',
        prompt: `Microcontrollers without a floating-point unit store fractions as integers. In **Q15**, an \`int16\` value \`v\` represents \`v / 32768\`.

Write \`q15_mul(a, b)\` that multiplies two Q15 numbers and returns a Q15 number:

1. \`product = a * b\` (fits in 32 bits)
2. Round: add \`1 << 14\`, then shift right by 15.
3. Saturate the result to \`[-32768, 32767]\`.`,
        starter: R`def q15_mul(a, b):
    pass

print(q15_mul(16384, 16384))  # 0.5 * 0.5 = 0.25 -> 8192
`,
        solution: R`def q15_mul(a, b):
    result = (a * b + (1 << 14)) >> 15
    return max(-32768, min(32767, result))
`,
        tests: [
          { name: 'Half times half', code: R`assert q15_mul(16384, 16384) == 8192, '0.5 * 0.5 = 0.25, which is 8192 in Q15'` },
          { name: 'Negative operand', code: R`assert q15_mul(16384, -16384) == -8192, '0.5 * -0.5 = -0.25'` },
          { name: 'Saturation', code: R`assert q15_mul(-32768, -32768) == 32767, '-1 * -1 = +1 cannot be represented: saturate to 32767'` },
          { name: 'Rounding', code: R`assert q15_mul(32767, 1) == 1 and q15_mul(3, 16384) == 2, 'Add 1 << 14 before shifting so the result is rounded, not truncated'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why must the float value 0.0 map exactly to an integer?', options: ['It makes training faster', 'Zero padding and ReLU outputs must stay exactly zero or errors accumulate', 'Integers cannot be negative', 'It is only a convention'], answer: 1, why: 'That is the reason for the zero point in affine quantisation.', level: 'easy' },
      { q: 'Per-channel quantisation of convolution weights helps because…', options: ['It uses fewer bits', 'Channels have very different weight ranges, so one shared scale wastes resolution', 'It removes the need for calibration', 'It makes activations symmetric'], answer: 1, why: 'Each output channel gets its own scale. It is standard for convolution weights.', level: 'medium' },
      { q: 'Post-training quantisation loses too much accuracy. Next step?', options: ['Use 4 bits', 'Quantisation-aware training, or keep sensitive layers in higher precision', 'Remove batch norm', 'Lower the learning rate'], answer: 1, why: 'QAT simulates rounding during training so the weights adapt. Mixed precision keeps the fragile layers in float or 16-bit.', level: 'medium' },
      { q: 'Which is usually most sensitive to quantisation?', options: ['The middle convolution layers', 'The first and last layers, and layers with wide outlier-heavy ranges', 'Pooling layers', 'Padding'], answer: 1, why: 'Outliers stretch the range, so most values share few integer levels.', level: 'medium' },
      { q: 'Quantisation is mainly used to…', options: ['Add more layers', 'Collect more training data', 'Increase the number of classes', 'Shrink the model and speed up inference'], answer: 3, why: 'Fewer bits per number means less memory and cheaper arithmetic.', level: 'easy' },
      { q: 'How many bytes does one int8 weight occupy?', options: ['1', '2', '4', '8'], answer: 0, why: 'Eight bits make one byte, a quarter of a float32.', level: 'easy' },
      { q: 'In q = round(x / scale) + zero_point, what does scale represent?', options: ['The size of one integer step, in float units', 'The number of bits used', 'The learning rate', 'The number of channels'], answer: 0, why: 'A larger scale means coarser steps and a wider representable range.', level: 'easy' },
      { q: 'A tensor has range [-6, 6]. Symmetric int8 uses integers -127 to 127. About what is the scale?', options: ['0.094', '0.012', '0.047', '0.5'], answer: 2, why: '6 / 127 is about 0.047.', level: 'medium' },
      { q: 'With scale 0.5 and zero point 0, the float 1.3 is quantised and then dequantised. What value comes back, and what is the error?', options: ['1.0, error 0.3', '1.5, error 0.3', '1.5, error 0.2', '2.0, error 0.7'], answer: 2, why: 'round(1.3 / 0.5) = round(2.6) = 3, and 3 × 0.5 = 1.5, which is 0.2 above 1.3.', level: 'hard' },
      { q: 'Q15 with rounding: a = 16384 (0.5) and b = -8192 (-0.25). What does (a × b + (1 << 14)) >> 15 give, using an arithmetic shift?', options: ['-4095', '4096', '-8192', '-4096'], answer: 3, why: 'The product is -134217728; adding 16384 and shifting right by 15 gives -4096, which is -0.125.', level: 'hard' },
      { q: 'int8 per-tensor quantisation badly hurts one depthwise convolution layer while the others are fine. Most likely reason and fix?', options: ['Its channels have very different ranges; use per-channel scales', 'Depthwise layers cannot be integers; always use float', 'The calibration set is too large; use fewer samples', 'Batch norm is missing; add dropout'], answer: 0, why: 'One shared scale wastes resolution on channels with small ranges.', level: 'hard' },
      { q: 'The int8 model is accurate in the Python simulation but poor on the device. Where do you look first?', options: ['The learning rate', 'The device’s integer rounding, saturation and shifts compared with the simulation, and preprocessing', 'The number of epochs', 'The dataset licence'], answer: 1, why: 'Small differences in integer arithmetic or preprocessing between simulation and target are the usual cause.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain post-training quantisation and quantisation-aware training.', points: [['Quantisation maps float weights and activations to low-bit integers', ['integer', 'int8', '8-bit', '8 bit', 'low-bit']], ['PTQ: after training, with a calibration set to find ranges', ['calibrat', 'after training', 'post-training', 'post training']], ['QAT: simulate rounding during training (fake quantisation)', ['fake', 'during training', 'simulat', 'straight-through', 'straight through']], ['Trade-off: PTQ is cheap, QAT recovers accuracy', ['accuracy', 'cheap', 'recover', 'trade']]], model: 'Quantisation replaces 32-bit floats with low-bit integers, usually 8-bit, using a scale and a zero point per tensor or per channel. Post-training quantisation takes a trained model, runs a few hundred representative samples through it to measure activation ranges, and picks the scales; it needs no retraining and often costs under one percent of accuracy. Quantisation-aware training inserts fake-quantisation operations that round in the forward pass and pass gradients straight through in the backward pass, so the weights learn to tolerate the rounding. I start with post-training quantisation and move to QAT only when the accuracy drop is too large, for example with small models or 4-bit targets.' },
      { q: 'A quantised model is much less accurate than the float model. How do you debug it?', points: [['Compare layer by layer against the float model', ['layer by layer', 'per layer', 'each layer', 'layer-wise']], ['Check the calibration data is representative', ['calibrat', 'representative']], ['Look for outliers and wide ranges; try per-channel or clipping', ['outlier', 'per-channel', 'per channel', 'clip', 'percentile', 'range']], ['Keep sensitive layers in higher precision or use QAT', ['sensitive', 'mixed precision', 'qat', 'quantisation-aware', 'quantization-aware', 'float']]], model: 'I compare the quantised and float models layer by layer on the same inputs and find where the error first becomes large. Common causes are an unrepresentative calibration set, a layer whose range is stretched by outliers, activations after an addition or concatenation with mismatched scales, and preprocessing that differs from training. I try per-channel weight quantisation, a percentile or entropy-based range instead of min and max, and batch-norm folding checks. If one or two layers are responsible, I keep them in float or 16-bit. If the loss is spread across the network, I use quantisation-aware training.' },
      { q: 'How would you run a model on a microcontroller without a floating-point unit?', points: [['Integer-only inference with fixed-point arithmetic', ['integer', 'fixed-point', 'fixed point', 'q15', 'q7']], ['Scales implemented as integer multiplier plus shift', ['multiplier', 'shift']], ['Saturation and rounding handled explicitly', ['saturat', 'round', 'overflow']], ['Verify against the float reference; measure memory and timing', ['verif', 'reference', 'bit-exact', 'memory', 'timing', 'compare']]], model: 'I convert the model to integer-only inference. Weights and activations are 8-bit or 16-bit integers, and each real-valued scale is replaced by an integer multiplier and a right shift, so no float operation remains. Accumulators are 32-bit, and I handle rounding and saturation explicitly so overflow never wraps around. For signal-processing blocks I use Q-format fixed point such as Q15. I use an optimised kernel library for the target where one exists, for example CMSIS-NN on Arm Cortex-M. Then I verify bit-exactness against a Python reference of the same integer arithmetic, check accuracy against the float model, and measure flash, RAM and worst-case execution time on the device.' }
    ]
  },

  {
    id: 'cpp-deploy', title: 'C and C++ model deployment', tracks: ['auto', 'cv', 'mlops', 'mle'],
    tasks: [
      {
        id: 'cpp-tree', title: 'Generate C code from a decision tree',
        prompt: `Small tree models are often shipped as generated C. Write \`tree_to_c(tree)\` that returns C source for a function \`float predict(const float *x)\`.

A node is either a leaf \`{"value": v}\` or a split \`{"feature": i, "threshold": t, "left": node, "right": node}\`, where \`x[i] <= t\` goes left.

Emit exactly this structure (whitespace is not checked):

\`\`\`
float predict(const float *x) {
    if (x[0] <= 2.5f) {
        return 1.0f;
    } else {
        return 0.0f;
    }
}
\`\`\`

Write floats as Python prints them, followed by \`f\`: \`2.5f\`, \`1.0f\`.`,
        starter: R`def tree_to_c(tree):
    pass

print(tree_to_c({"feature": 0, "threshold": 2.5, "left": {"value": 1.0}, "right": {"value": 0.0}}))
`,
        solution: R`def tree_to_c(tree):
    def emit(node, depth):
        pad = "    " * depth
        if "value" in node:
            return [f"{pad}return {float(node['value'])}f;"]
        lines = [f"{pad}if (x[{node['feature']}] <= {float(node['threshold'])}f) {{"]
        lines += emit(node["left"], depth + 1)
        lines.append(f"{pad}}} else {{")
        lines += emit(node["right"], depth + 1)
        lines.append(f"{pad}}}")
        return lines
    return "\n".join(["float predict(const float *x) {"] + emit(tree, 1) + ["}"])
`,
        tests: [
          { name: 'Single split', code: R`out = tree_to_c({"feature": 0, "threshold": 2.5, "left": {"value": 1.0}, "right": {"value": 0.0}})
exp = "float predict(const float *x) { if (x[0] <= 2.5f) { return 1.0f; } else { return 0.0f; } }"
assert " ".join(out.split()) == exp, 'Generated code differs. Got: ' + " ".join(out.split())` },
          { name: 'Leaf only', code: R`out = tree_to_c({"value": 3})
assert " ".join(out.split()) == "float predict(const float *x) { return 3.0f; }", 'A single leaf returns its value; integers print as 3.0f'` },
          { name: 'Nested tree', code: R`t = {"feature": 2, "threshold": 0.5,
     "left": {"feature": 0, "threshold": -1.0, "left": {"value": 0.25}, "right": {"value": 0.75}},
     "right": {"value": 1.0}}
exp = ("float predict(const float *x) { if (x[2] <= 0.5f) { if (x[0] <= -1.0f) { return 0.25f; } else { return 0.75f; } }"
       " else { return 1.0f; } }")
assert " ".join(tree_to_c(t).split()) == exp, 'Nested splits must nest the if/else blocks'` }
        ]
      },
      {
        id: 'cpp-chw', title: 'Preprocess: HWC to CHW',
        prompt: `Cameras and OpenCV give images as height × width × channel (HWC) bytes. Most inference engines want channel-first (CHW) floats. Getting this wrong is the most common C++ deployment bug.

Write \`hwc_to_chw(image, mean, std)\`:

- \`image\`: array of shape \`(H, W, 3)\`, values 0 to 255.
- Scale to 0..1, then normalise each channel: \`(x / 255 - mean[c]) / std[c]\`.
- Return a float32 numpy array of shape \`(3, H, W)\`.`,
        starter: R`import numpy as np

def hwc_to_chw(image, mean, std):
    pass
`,
        solution: R`import numpy as np

def hwc_to_chw(image, mean, std):
    x = np.asarray(image, dtype=np.float32) / 255.0
    x = (x - np.asarray(mean, dtype=np.float32)) / np.asarray(std, dtype=np.float32)
    return np.ascontiguousarray(x.transpose(2, 0, 1), dtype=np.float32)
`,
        tests: [
          { name: 'Shape and type', code: R`import numpy as np
out = hwc_to_chw(np.zeros((4, 6, 3), dtype=np.uint8), [0, 0, 0], [1, 1, 1])
assert out.shape == (3, 4, 6), 'Output shape must be (3, H, W), got ' + str(out.shape)
assert out.dtype == np.float32, 'Output must be float32'` },
          { name: 'Channels end up in the right place', code: R`import numpy as np
img = np.zeros((2, 2, 3), dtype=np.uint8); img[..., 0] = 255; img[..., 2] = 51
out = hwc_to_chw(img, [0, 0, 0], [1, 1, 1])
assert close(out[0], [[1, 1], [1, 1]]) and close(out[1], [[0, 0], [0, 0]]) and close(out[2], [[0.2, 0.2], [0.2, 0.2]], 1e-5), 'Channel 0 should be all 1.0, channel 2 all 0.2'` },
          { name: 'Per-channel normalisation', code: R`import numpy as np
img = np.full((1, 1, 3), 255, dtype=np.uint8)
out = hwc_to_chw(img, [0.5, 0.25, 0.0], [0.5, 0.25, 2.0])
assert close(out.reshape(3), [1.0, 3.0, 0.5], 1e-5), 'Expected [1.0, 3.0, 0.5] for a white pixel'` },
          { name: 'Pixel positions preserved', code: R`import numpy as np
img = np.arange(24, dtype=np.uint8).reshape(2, 4, 3)
out = hwc_to_chw(img, [0, 0, 0], [1, 1, 1])
assert close(out[1, 1, 2] * 255, img[1, 2, 1], 1e-4), 'out[c, h, w] must equal image[h, w, c]'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does RAII give you in C++ inference code?', options: ['Faster maths', 'Resources such as buffers and sessions are released automatically when their owner goes out of scope', 'Automatic GPU use', 'Dynamic typing'], answer: 1, why: 'Tie a resource to an object lifetime: no leaks on early return or exception.', level: 'easy' },
      { q: 'std::unique_ptr versus std::shared_ptr?', options: ['They are the same', 'unique_ptr has one owner and no overhead; shared_ptr is reference-counted for shared ownership', 'shared_ptr is faster', 'unique_ptr can be copied'], answer: 1, why: 'Default to unique_ptr. Use shared_ptr only when ownership is truly shared.', level: 'easy' },
      { q: 'Why avoid heap allocation inside a real-time inference loop?', options: ['It is illegal C++', 'Allocation time is unpredictable and fragments memory; allocate once and reuse buffers', 'The heap is read-only', 'It disables SIMD'], answer: 1, why: 'Pre-allocate input and output tensors at start-up.', level: 'medium' },
      { q: 'Your C++ pipeline gives different predictions from Python on the same image. First suspect?', options: ['The compiler', 'Preprocessing: channel order (BGR or RGB), layout (HWC or CHW), resize method, normalisation', 'The CPU', 'The model weights'], answer: 1, why: 'Dump the preprocessed tensor from both and compare element by element.', level: 'medium' },
      { q: 'What does a parameter of type const Tensor& promise?', options: ['No copy is made and the function will not modify the tensor', 'The tensor is copied and then modified', 'The tensor lives on the GPU', 'The tensor is deleted afterwards'], answer: 0, why: 'A const reference avoids a copy and forbids modification.', level: 'easy' },
      { q: 'ONNX is best described as…', options: ['A C++ compiler', 'A GPU driver', 'An open, framework-neutral format for model graphs and weights', 'A Python web framework'], answer: 2, why: 'It lets you train in one framework and run in another runtime.', level: 'easy' },
      { q: 'A detector in your C++ app labels red cars as blue cars but is otherwise accurate. Likely cause?', options: ['The red and blue channels are swapped: OpenCV’s BGR was not converted to RGB', 'The model is too small', 'The batch size is 1', 'The GPU is too slow'], answer: 0, why: 'A channel-order mismatch swaps colours but keeps the shapes right.', level: 'medium' },
      { q: 'Why is reading a row-major image row by row faster than column by column?', options: ['Columns need more arithmetic', 'Rows are processed by the GPU', 'Consecutive addresses use each loaded cache line fully, while column steps jump across memory', 'Compilers refuse column loops'], answer: 2, why: 'Cache lines are loaded in blocks of neighbouring bytes.', level: 'medium' },
      { q: 'A 1920 × 1080 RGB uint8 frame is converted to float32 CHW. About how large is the float tensor (1 MB = 1,000,000 bytes)?', options: ['6.2 MB', '24.9 MB', '49.8 MB', '8.3 MB'], answer: 1, why: '1920 × 1080 × 3 × 4 bytes is about 24.9 MB, four times the uint8 frame.', level: 'hard' },
      { q: 'You keep float* p = v.data() for a std::vector v, then call v.push_back(x) and read through p. What is the risk?', options: ['p may dangle if push_back reallocated the storage', 'push_back always keeps the same address', 'p becomes const', 'The vector shrinks'], answer: 0, why: 'Growing a vector can move its storage and invalidate pointers into it.', level: 'hard' },
      { q: 'Why can a move constructor that is not marked noexcept slow down std::vector growth?', options: ['It forbids vectors of floats', 'It makes every element 8 bytes', 'It disables inlining', 'The vector may copy elements on reallocation instead of moving them'], answer: 3, why: 'To keep its exception guarantee, vector moves only when the move cannot throw.', level: 'hard' },
      { q: 'The release build crashes but the debug build works, and the compiler shows no warnings. Best first step?', options: ['Raise the optimisation level', 'Delete the failing input', 'Build with AddressSanitizer and UndefinedBehaviorSanitizer, reproduce, and read the first report', 'Add more threads'], answer: 2, why: 'Release-only failures are often undefined behaviour, which sanitizers detect.', level: 'hard' }
    ],
    interview: [
      { q: 'How do you deploy a PyTorch model in a C++ application?', points: [['Export the model: ONNX or TorchScript', ['onnx', 'torchscript', 'export']], ['Load it with a runtime: ONNX Runtime, TensorRT, LibTorch, OpenVINO', ['onnx runtime', 'tensorrt', 'libtorch', 'openvino', 'runtime']], ['Reimplement preprocessing and postprocessing identically', ['preprocess', 'postprocess', 'normali', 'resize']], ['Verify outputs match Python on the same inputs', ['verif', 'match', 'compare', 'same input', 'parity']], ['Manage memory and threads; measure latency', ['memory', 'thread', 'latency', 'buffer', 'profil']]], model: 'I export the trained model to an exchange format, usually ONNX, with fixed or well-defined dynamic shapes, and check the exported graph in Python first. In C++ I load it with a runtime suited to the target: ONNX Runtime for portability, TensorRT on NVIDIA GPUs, OpenVINO on Intel, or LibTorch if I need TorchScript. I create the session once, allocate input and output buffers once and reuse them. The risky part is preprocessing and postprocessing, which I reimplement in C++ and verify against Python by comparing tensors on the same test images. Finally I profile latency, including the tail, and tune threads and batch size.' },
      { q: 'What C++ features and practices matter most for production inference code?', points: [['RAII and smart pointers for ownership', ['raii', 'smart pointer', 'unique_ptr', 'ownership']], ['Avoid copies: references, move semantics, spans', ['move', 'reference', 'copy', 'span', 'const']], ['No allocation in the hot loop; reuse buffers', ['alloc', 'reuse', 'pre-alloc', 'buffer']], ['Const correctness, error handling, tests', ['const', 'error', 'test', 'exception']], ['Build and tooling: CMake, sanitizers, static analysis', ['cmake', 'sanitiz', 'static analysis', 'clang-tidy', 'valgrind']]], model: 'Ownership first: every resource, such as a session, buffer or file, is owned by an object and released by its destructor, with unique_ptr as the default smart pointer. Second, avoid needless copies of large tensors by passing const references or views and using move semantics. Third, keep the hot loop free of heap allocation by pre-allocating and reusing buffers, which also keeps timing predictable. I write const-correct interfaces, check every error path, and unit-test pre- and postprocessing against reference data. The build uses CMake with warnings as errors, and I run address and undefined-behaviour sanitizers and static analysis in CI.' },
      { q: 'You converted a Python model to C and the outputs differ slightly. How do you find the cause?', points: [['Compare intermediate values stage by stage', ['intermediate', 'stage', 'layer by layer', 'step by step']], ['Float precision: float32 versus Python float64', ['float32', 'float64', 'double', 'precision']], ['Operator differences: rounding, resize, padding, maths functions', ['round', 'resize', 'padding', 'operator', 'function']], ['Define a tolerance and automate back-to-back tests', ['tolerance', 'back-to-back', 'automat', 'test vector', 'regression']]], model: 'I run the same input through both and dump intermediate values after each stage: preprocessing, each layer or tree, postprocessing. The first stage that differs beyond tolerance is where to look. Typical causes are Python using 64-bit doubles where C uses 32-bit floats, a different rounding mode, a different resize or padding convention, integer overflow, or a library maths function that differs slightly. Once fixed, I define an acceptable tolerance, or bit-exactness for integer code, and add automated back-to-back tests with recorded test vectors so that any later change is caught.' }
    ]
  },

  {
    id: 'cuda-gpu', title: 'GPU and CUDA fundamentals', tracks: ['mle', 'cv', 'mlops', 'auto', 'genai'],
    tasks: [
      {
        id: 'gpu-index', title: 'Blocks, threads and the global index',
        prompt: `A CUDA kernel runs on a grid of blocks, each with the same number of threads. To process an array of \`n\` elements with one thread each:

- \`num_blocks(n, threads_per_block)\`: the number of blocks needed (round up).
- \`global_index(block_idx, block_dim, thread_idx)\`: the array index a thread works on, \`block_idx * block_dim + thread_idx\`.
- \`active(block_idx, block_dim, thread_idx, n)\`: \`True\` if that index is inside the array. Threads beyond \`n\` must do nothing.`,
        starter: R`def num_blocks(n, threads_per_block):
    pass

def global_index(block_idx, block_dim, thread_idx):
    pass

def active(block_idx, block_dim, thread_idx, n):
    pass
`,
        solution: R`def num_blocks(n, threads_per_block):
    return (n + threads_per_block - 1) // threads_per_block

def global_index(block_idx, block_dim, thread_idx):
    return block_idx * block_dim + thread_idx

def active(block_idx, block_dim, thread_idx, n):
    return global_index(block_idx, block_dim, thread_idx) < n
`,
        tests: [
          { name: 'Number of blocks rounds up', code: R`assert num_blocks(1000, 256) == 4 and num_blocks(1024, 256) == 4 and num_blocks(1025, 256) == 5 and num_blocks(1, 256) == 1, 'Use ceiling division: 1000 elements with 256 threads per block need 4 blocks'` },
          { name: 'Global index', code: R`assert global_index(0, 256, 5) == 5 and global_index(3, 256, 10) == 778, 'index = block_idx * block_dim + thread_idx'` },
          { name: 'Bounds check', code: R`assert active(3, 256, 231, 1000) is True and active(3, 256, 232, 1000) is False, 'With n = 1000 the last valid index is 999; thread 232 of block 3 is index 1000'` },
          { name: 'Every element covered exactly once', code: R`n, tpb = 1000, 256
seen = [global_index(b, tpb, t) for b in range(num_blocks(n, tpb)) for t in range(tpb) if active(b, tpb, t, n)]
assert sorted(seen) == list(range(n)), 'Active threads must cover indices 0..n-1 exactly once'` }
        ]
      },
      {
        id: 'gpu-amdahl', title: "Amdahl's law",
        prompt: `Only part of a program can be parallelised. Write \`amdahl(p, n)\`: the overall speed-up when a fraction \`p\` of the run time is sped up \`n\` times.

\`speedup = 1 / ((1 - p) + p / n)\``,
        starter: R`def amdahl(p, n):
    pass

print(amdahl(0.9, 10))  # about 5.26
`,
        solution: R`def amdahl(p, n):
    return 1.0 / ((1.0 - p) + p / n)
`,
        tests: [
          { name: 'Typical case', code: R`assert close(amdahl(0.9, 10), 1 / 0.19), '90% parallel with 10x speed-up gives about 5.26x'` },
          { name: 'Fully parallel and fully serial', code: R`assert close(amdahl(1.0, 8), 8.0) and close(amdahl(0.0, 100), 1.0), 'p = 1 gives n; p = 0 gives 1'` },
          { name: 'The serial part sets the limit', code: R`assert amdahl(0.9, 1e9) < 10.0001 and amdahl(0.9, 1e9) > 9.99, 'With 10% serial work the speed-up can never exceed 10x'` }
        ]
      }
    ],
    quiz: [
      { q: 'Why are GPUs faster than CPUs for neural networks?', options: ['Higher clock speed', 'Thousands of cores run the same simple operation on many data elements in parallel', 'They have more RAM', 'They use Python'], answer: 1, why: 'Matrix multiplication and convolution are data-parallel, which fits the GPU design.', level: 'easy' },
      { q: 'Your GPU utilisation is 30% during training. Most likely bottleneck?', options: ['The GPU is broken', 'Data loading and preprocessing on the CPU', 'Too many parameters', 'The loss function'], answer: 1, why: 'More loader workers, pinned memory, caching or GPU-side augmentation usually help.', level: 'medium' },
      { q: 'Why is copying data between CPU and GPU expensive?', options: ['It is encrypted', 'They have separate memories; each transfer crosses the bus and can stall the pipeline', 'CPUs are 8-bit', 'It is free'], answer: 1, why: 'Keep tensors on the device, batch transfers and avoid calling .cpu() or .item() inside hot loops.', level: 'easy' },
      { q: 'What does mixed-precision (FP16) inference or training give?', options: ['Higher accuracy', 'About half the memory and faster maths on modern GPUs, with small numerical risk', 'Larger models', 'Slower training'], answer: 1, why: 'Use automatic mixed precision; a gradient scaler prevents underflow during training.', level: 'medium' },
      { q: 'In CUDA, a kernel is…', options: ['A function launched from the host and run by many GPU threads in parallel', 'The operating system core', 'A type of GPU memory', 'A compression format'], answer: 0, why: 'You launch it with a grid of blocks of threads.', level: 'easy' },
      { q: 'On NVIDIA GPUs, a warp is…', options: ['A block of 1024 threads', 'A GPU driver', 'A group of 32 threads that execute together', 'A kind of memory'], answer: 2, why: 'Threads of a warp follow the same instruction at the same time.', level: 'easy' },
      { q: 'A kernel is launched with 3 blocks of 128 threads for 400 elements. What happens?', options: ['All elements are processed', 'The kernel crashes at launch', 'Threads wrap around and process some elements twice', 'Only 384 elements are covered, so the last 16 are never processed'], answer: 3, why: '3 × 128 = 384, which is fewer than 400; round the block count up.', level: 'medium' },
      { q: 'A job must score a million images overnight, and nobody waits for individual results. Which batch setting suits it?', options: ['A large batch that maximises throughput', 'Batch size 1 to minimise latency', 'No batching at all', 'Random batch sizes'], answer: 0, why: 'When latency does not matter, big batches use the GPU best.', level: 'medium' },
      { q: '80% of a program is parallelised and sped up 4 times. What is the overall speed-up (Amdahl’s law)?', options: ['3.2×', '4×', '2.5×', '1.25×'], answer: 2, why: '1 / (0.2 + 0.8 / 4) = 1 / 0.4 = 2.5.', level: 'hard' },
      { q: 'Your timer says one forward pass takes 0.2 ms, yet the end-to-end loop is far slower. What is the likely measurement error?', options: ['The GPU clock runs backwards', 'The clock was read without synchronising, so only the launch was timed', 'Python rounds times down', 'The model has no layers'], answer: 1, why: 'GPU calls return immediately; synchronise before reading the clock.', level: 'hard' },
      { q: 'Threads of one warp take different sides of an if/else. What is the effect?', options: ['The GPU picks the faster branch', 'The kernel fails to compile', 'Half the threads are deleted', 'Both paths run one after another with some threads idle, so time is lost'], answer: 3, why: 'This is warp divergence.', level: 'hard' },
      { q: 'You need an effective batch of 64 but only 16 samples fit in GPU memory. What do you do?', options: ['Move the model to the CPU', 'Train for four times as many epochs', 'Accumulate gradients over 4 batches of 16 before each optimiser step', 'Use batch size 1'], answer: 2, why: 'Gradient accumulation gives the same effective batch with less memory.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain the CUDA execution model: kernels, threads, blocks and grids.', points: [['A kernel is a function executed by many GPU threads in parallel', ['kernel']], ['Threads are grouped into blocks, blocks into a grid', ['block', 'grid']], ['Each thread computes its own index and processes its element', ['index', 'element', 'blockidx', 'threadidx']], ['Host and device have separate memory; data must be copied', ['host', 'device', 'copy', 'transfer', 'memory']]], model: 'In CUDA the CPU is the host and the GPU is the device, each with its own memory. A kernel is a function that the host launches on the device, where it is executed by many threads at once. Threads are organised into blocks, and blocks into a grid. Each thread reads its block index and thread index, computes a global index and works on that element, with a bounds check because the grid is usually rounded up beyond the data size. Threads in a block can share fast shared memory and synchronise. A typical program allocates device memory, copies inputs to it, launches kernels and copies results back, trying to minimise those transfers.' },
      { q: 'Inference on the GPU is slower than you expected. What do you check?', points: [['Measure correctly: warm-up and synchronise before timing', ['warm', 'synchroni', 'measure', 'profil']], ['CPU-side bottlenecks: preprocessing, data transfer', ['preprocess', 'transfer', 'cpu', 'copy']], ['Batch size and throughput versus latency', ['batch']], ['Optimised runtime and precision: TensorRT, FP16 or INT8', ['tensorrt', 'fp16', 'int8', 'half', 'onnx', 'quanti']], ['Memory: avoid reallocations and host-device ping-pong', ['memory', 'alloc', 'pinned']]], model: 'First I make sure I am measuring correctly: GPU calls are asynchronous, so I warm up and synchronise before reading the clock, and I use a profiler to split time between preprocessing, transfer, inference and postprocessing. Often the model is fast and the CPU work around it is slow. Then I look at batch size, since a larger batch raises throughput at the cost of latency. I export the model to an optimised engine such as TensorRT, enable FP16 or INT8, and fix input shapes where possible. I avoid repeated allocations and unnecessary copies between host and device, use pinned memory for transfers, and move preprocessing to the GPU if it dominates.' },
      { q: 'You run out of GPU memory during training. What are your options?', points: [['Smaller batch with gradient accumulation', ['batch', 'accumulat']], ['Mixed precision', ['mixed precision', 'fp16', 'half', 'amp']], ['Gradient checkpointing or a smaller model or input', ['checkpoint', 'smaller', 'resolution', 'sequence length']], ['Free what you do not need: no_grad for evaluation, do not keep graph references', ['no_grad', 'detach', 'release', 'graph', 'eval']]], model: 'The quickest fix is a smaller batch size, with gradient accumulation to keep the effective batch the same. Mixed precision roughly halves activation memory. Gradient checkpointing trades compute for memory by recomputing activations in the backward pass. I can also reduce input resolution or sequence length, or use a smaller model or parameter-efficient fine-tuning. I check for avoidable waste: evaluation without no_grad, storing the loss tensor with its graph instead of a plain number, or keeping large tensors alive. If it still does not fit, I move to multiple GPUs or a larger instance.' }
    ]
  },

  {
    id: 'ecu-deploy', title: 'ECU and automotive software deployment', tracks: ['auto', 'mlops'],
    tasks: [
      {
        id: 'ecu-can', title: 'Decode a CAN signal',
        prompt: `ECUs exchange data in CAN frames of up to 8 bytes. A signal is a group of bits with a scale and an offset.

Write \`decode_signal(data, start_bit, length, scale, offset, signed=False)\` for little-endian (Intel) signals:

1. Treat \`data\` (a list of byte values) as one little-endian integer.
2. \`raw = (value >> start_bit) & ((1 << length) - 1)\`
3. If \`signed\` and the top bit of \`raw\` is set, subtract \`1 << length\` (two's complement).
4. Return \`raw * scale + offset\`.`,
        starter: R`def decode_signal(data, start_bit, length, scale, offset, signed=False):
    pass

print(decode_signal([0x10, 0x27, 0, 0, 0, 0, 0, 0], 0, 16, 0.01, 0))  # 100.0
`,
        solution: R`def decode_signal(data, start_bit, length, scale, offset, signed=False):
    value = int.from_bytes(bytes(data), "little")
    raw = (value >> start_bit) & ((1 << length) - 1)
    if signed and raw & (1 << (length - 1)):
        raw -= 1 << length
    return raw * scale + offset
`,
        tests: [
          { name: '16-bit speed signal', code: R`assert close(decode_signal([0x10, 0x27, 0, 0, 0, 0, 0, 0], 0, 16, 0.01, 0), 100.0), '0x2710 = 10000, times 0.01 = 100.0'` },
          { name: 'Signal in the second byte', code: R`assert close(decode_signal([0x10, 0x27, 0, 0], 8, 8, 1, 0), 39), 'Bits 8..15 are the second byte: 0x27 = 39'` },
          { name: 'Scale and offset', code: R`assert close(decode_signal([0x64], 0, 8, 0.5, -40), 10.0), 'Raw 100 * 0.5 - 40 = 10 (a typical temperature encoding)'` },
          { name: 'Signed value', code: R`assert close(decode_signal([0xFF], 0, 8, 1, 0, signed=True), -1) and close(decode_signal([0xFF], 0, 8, 1, 0), 255), '0xFF is -1 when signed and 255 when unsigned'` },
          { name: 'Signal across a byte boundary', code: R`assert close(decode_signal([0xF0, 0x0A], 4, 8, 1, 0), 0xAF), 'Bits 4..11 of 0x0AF0 are 0xAF = 175'` }
        ]
      },
      {
        id: 'ecu-ring', title: 'Fixed-memory moving average',
        prompt: `Embedded code cannot grow lists for ever. Write a class \`MovingAverage(size)\` with a method \`update(x)\` that returns the average of the last \`size\` values seen (or of all values so far, if fewer).

Use a fixed-size ring buffer and a running sum: each update must be O(1) and must not allocate.`,
        starter: R`class MovingAverage:
    def __init__(self, size):
        pass

    def update(self, x):
        pass

m = MovingAverage(3)
print([m.update(v) for v in [3, 6, 9, 12]])  # [3.0, 4.5, 6.0, 9.0]
`,
        solution: R`class MovingAverage:
    def __init__(self, size):
        self.buf = [0.0] * size
        self.size = size
        self.count = 0
        self.head = 0
        self.total = 0.0

    def update(self, x):
        if self.count == self.size:
            self.total -= self.buf[self.head]
        else:
            self.count += 1
        self.buf[self.head] = x
        self.total += x
        self.head = (self.head + 1) % self.size
        return self.total / self.count
`,
        tests: [
          { name: 'Warm-up then steady state', code: R`m = MovingAverage(3)
assert close([m.update(v) for v in [3, 6, 9, 12]], [3.0, 4.5, 6.0, 9.0]), 'Expected [3.0, 4.5, 6.0, 9.0]'` },
          { name: 'Window of one', code: R`m = MovingAverage(1)
assert close([m.update(v) for v in [5, 7, -2]], [5, 7, -2]), 'With size 1 the average is the latest value'` },
          { name: 'Long run stays correct', code: R`m = MovingAverage(4)
out = [m.update(v) for v in range(1000)]
assert close(out[-1], (996 + 997 + 998 + 999) / 4), 'After many updates the average must cover only the last 4 values'` },
          { name: 'Independent instances', code: R`a, b = MovingAverage(2), MovingAverage(2)
a.update(10); a.update(20)
assert close(b.update(1), 1.0), 'Two filters must not share state'` }
        ]
      }
    ],
    quiz: [
      { q: 'AUTOSAR Classic versus AUTOSAR Adaptive?', options: ['They are the same', 'Classic: static, real-time software on microcontrollers. Adaptive: service-oriented, POSIX-based, for high-performance computers', 'Adaptive is older', 'Classic runs only on Linux'], answer: 1, why: 'Perception networks usually run on Adaptive-class or Linux/QNX computers; small models can run on Classic ECUs.', level: 'easy' },
      { q: 'What is the difference between MIL, SIL, PIL and HIL testing?', options: ['They test four different cars', 'Model, software, processor and hardware in the loop: each step brings the test closer to the real ECU', 'They are coding standards', 'They are CAN message types'], answer: 1, why: 'MIL tests the model, SIL the compiled code on a PC, PIL the code on the target processor, HIL the real ECU with simulated surroundings.', level: 'medium' },
      { q: 'Why does MISRA C restrict dynamic memory allocation?', options: ['malloc is slow on PCs', 'To avoid fragmentation, leaks and unpredictable timing in safety-related code', 'It saves flash', 'C does not support it'], answer: 1, why: 'Memory is allocated statically so behaviour is deterministic and analysable.', level: 'medium' },
      { q: 'ASIL in ISO 26262 describes…', options: ['The CPU speed', 'The required safety integrity level of a function, from A (lowest) to D (highest)', 'The size of the flash', 'A bus protocol'], answer: 1, why: 'It is derived from severity, exposure and controllability, and sets how rigorous development must be.', level: 'easy' },
      { q: 'ECU stands for…', options: ['Engine Cooling Unit', 'Electronic Control Unit', 'External Computing Utility', 'Embedded Cable Unit'], answer: 1, why: 'A car has dozens of them.', level: 'easy' },
      { q: 'What does a DBC file describe?', options: ['The layout of signals in CAN messages: start bit, length, scale and offset', 'The wiring harness colours', 'The ECU flash map', 'The test report'], answer: 0, why: 'Tools use it to decode raw frames into physical values.', level: 'easy' },
      { q: 'What is the purpose of a watchdog in an ECU?', options: ['Increase the CAN speed', 'Store the model', 'Detect that the software has stopped running normally and trigger a reset or safe state', 'Encrypt messages'], answer: 2, why: 'The software must keep servicing it in time.', level: 'medium' },
      { q: 'Three cyclic tasks need 1 ms every 5 ms, 2 ms every 10 ms and 3 ms every 20 ms. What is the CPU utilisation?', options: ['45%', '65%', '100%', '55%'], answer: 3, why: '0.2 + 0.2 + 0.15 = 0.55.', level: 'medium' },
      { q: 'A moving average sums 8 samples of an unsigned 16-bit signal (maximum 65535). What type must the running sum have?', options: ['16-bit unsigned', '8-bit unsigned', 'At least 32-bit unsigned', '16-bit signed'], answer: 2, why: '8 × 65535 = 524,280, which does not fit in 16 bits.', level: 'hard' },
      { q: 'A 10-bit unsigned signal has scale 0.25 and offset -20. The raw value is 1023. What is the physical value?', options: ['255.75', '235.75', '-20.25', '1003'], answer: 1, why: '1023 × 0.25 = 255.75, and 255.75 - 20 = 235.75.', level: 'hard' },
      { q: 'Which test level shows timing problems caused by the real processor’s pipeline and caches before a full vehicle exists?', options: ['Model-in-the-loop', 'Code review', 'Software-in-the-loop on a PC', 'Processor-in-the-loop on the target processor'], answer: 3, why: 'Only the real processor shows its true timing and numerics.', level: 'hard' },
      { q: 'On a microcontroller without a floating-point unit, why is float arithmetic costly?', options: ['Operations are emulated in software, so they are slower and add code to flash', 'Floats are not allowed in C', 'Floats need more RAM than integers of the same size', 'It disables interrupts'], answer: 0, why: 'Fixed-point integer arithmetic maps directly onto the hardware.', level: 'hard' }
    ],
    interview: [
      { q: 'Walk me through deploying an ML model on an automotive ECU.', points: [['Requirements and constraints: memory, timing, safety level', ['requirement', 'constraint', 'memory', 'timing', 'asil', 'safety']], ['Shrink the model: small architecture, quantisation, fixed point', ['quanti', 'fixed', 'small', 'prun']], ['Generate or write C code that meets the coding standard', ['c code', 'misra', 'generat', 'autosar']], ['Verify: back-to-back tests, SIL, PIL, HIL', ['back-to-back', 'sil', 'hil', 'pil', 'verif']], ['Integrate with the software architecture and measure on target', ['integrat', 'wcet', 'on target', 'measure', 'runnable', 'component']]], model: 'I start from the requirements: what the function must do, its safety level, and the budget for flash, RAM and execution time on the chosen microcontroller. I design or shrink the model to fit, using a small architecture, quantisation and, if there is no floating-point unit, fixed-point arithmetic. I convert it to C that complies with the project coding standard, either generated or hand-written, and wrap it as a software component in the architecture, for example an AUTOSAR runnable with defined inputs and outputs. Verification goes step by step: back-to-back comparison with the Python reference, software-in-the-loop on a PC, processor-in-the-loop for timing and numerics, then hardware-in-the-loop and vehicle tests. I measure worst-case execution time and stack use on the target, and document everything with traceability to the requirements.' },
      { q: 'How do you test software that will run in a car before the car exists?', points: [['Model-in-the-loop and software-in-the-loop on a PC', ['mil', 'sil', 'model-in-the-loop', 'software-in-the-loop', 'simulation']], ['Recorded data replay (re-simulation)', ['record', 'replay', 'resim', 're-sim', 'log']], ['Hardware-in-the-loop with simulated sensors and bus', ['hil', 'hardware-in-the-loop', 'simulated']], ['Unit and integration tests with traceability to requirements', ['unit test', 'integration', 'traceab', 'requirement', 'coverage']]], model: 'We climb a ladder of test environments. First the algorithm is tested as a model, and then the compiled code runs on a PC in software-in-the-loop, fed by simulation or by replaying recorded sensor data, which lets us run thousands of scenarios overnight. Processor-in-the-loop runs the same code on the target processor to check timing and numerical behaviour. Hardware-in-the-loop connects the real ECU to a simulator that emulates sensors, actuators and bus traffic, including fault injection. At every level there are unit and integration tests traced to requirements, with coverage measured. Only then do we go to test tracks and public roads.' },
      { q: 'What changes when your Python prototype has to become safety-related embedded code?', points: [['Determinism: static memory, bounded loops, no recursion', ['static', 'determin', 'bounded', 'no dynamic', 'recursion']], ['Coding and process standards: MISRA, ASPICE, ISO 26262', ['misra', 'aspice', '26262']], ['Numerics: fixed point, overflow, saturation', ['fixed', 'overflow', 'saturat']], ['Verification effort: reviews, coverage, traceability', ['review', 'coverage', 'traceab', 'verif']], ['Fault handling and safe states', ['fault', 'safe state', 'fallback', 'plausib', 'monitor']]], model: 'Almost everything around the algorithm changes. The code must be deterministic: statically allocated memory, bounded loops, no recursion, and a known worst-case execution time. It follows a coding standard such as MISRA C and a process such as Automotive SPICE, with requirements traced to design, code and tests. Numerics need care: fixed-point scaling, overflow and saturation are designed explicitly. Verification is far heavier, with reviews, static analysis, structural coverage and back-to-back tests against the reference. And the function must handle faults: plausibility checks on inputs, monitoring of the model output, and a defined safe state when something is wrong.' }
    ]
  },

  {
    id: 'cloud-deploy', title: 'Cloud deployment for ML', tracks: ['mlops', 'mle', 'genai', 'ds'],
    tasks: [
      {
        id: 'cloud-hpa', title: 'Autoscaling: how many replicas?',
        prompt: `The Kubernetes Horizontal Pod Autoscaler chooses the replica count from a metric such as CPU or requests per pod:

\`desired = ceil(current_replicas * current_metric / target_metric)\`

Write \`desired_replicas(current, metric, target, min_r, max_r)\` and clamp the result to \`[min_r, max_r]\`.`,
        starter: R`import math

def desired_replicas(current, metric, target, min_r, max_r):
    pass

print(desired_replicas(4, 90, 60, 1, 10))  # 6
`,
        solution: R`import math

def desired_replicas(current, metric, target, min_r, max_r):
    desired = math.ceil(current * metric / target)
    return max(min_r, min(max_r, desired))
`,
        tests: [
          { name: 'Scale up', code: R`assert desired_replicas(4, 90, 60, 1, 10) == 6, '4 pods at 90% with a 60% target need 6 pods'` },
          { name: 'Scale down, limited by the minimum', code: R`assert desired_replicas(4, 30, 60, 2, 10) == 2 and desired_replicas(4, 10, 60, 2, 10) == 2, 'Half the load needs 2 pods; never go below min_r'` },
          { name: 'Limited by the maximum', code: R`assert desired_replicas(10, 200, 50, 1, 20) == 20, '40 would be needed but max_r is 20'` },
          { name: 'Round up and steady state', code: R`assert desired_replicas(3, 61, 60, 1, 10) == 4 and desired_replicas(3, 60, 60, 1, 10) == 3, 'Slightly over target rounds up; exactly on target stays the same'` }
        ]
      },
      {
        id: 'cloud-bucket', title: 'Token-bucket rate limiter',
        prompt: `APIs protect themselves, and control cost, with rate limits. Write a class \`TokenBucket(rate, capacity)\`:

- The bucket starts full with \`capacity\` tokens and refills at \`rate\` tokens per second, never above \`capacity\`.
- \`allow(now)\` receives the current time in seconds (non-decreasing). Refill for the time passed since the last call, then if at least one token is available, take one and return \`True\`; otherwise return \`False\`.`,
        starter: R`class TokenBucket:
    def __init__(self, rate, capacity):
        pass

    def allow(self, now):
        pass
`,
        solution: R`class TokenBucket:
    def __init__(self, rate, capacity):
        self.rate = rate
        self.capacity = capacity
        self.tokens = float(capacity)
        self.last = None

    def allow(self, now):
        if self.last is not None:
            self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
`,
        tests: [
          { name: 'Burst up to capacity', code: R`b = TokenBucket(1, 2)
assert [b.allow(0), b.allow(0), b.allow(0)] == [True, True, False], 'A full bucket of 2 allows two requests, then refuses'` },
          { name: 'Refills over time', code: R`b = TokenBucket(1, 2)
b.allow(0); b.allow(0)
assert [b.allow(1.0), b.allow(1.5), b.allow(2.0)] == [True, False, True], 'One token per second: allowed at t=1, not at t=1.5, allowed at t=2'` },
          { name: 'Never exceeds capacity', code: R`b = TokenBucket(10, 3)
b.allow(0)
assert [b.allow(100), b.allow(100), b.allow(100), b.allow(100)] == [True, True, True, False], 'After a long idle time the bucket holds only capacity tokens'` },
          { name: 'Fractional rate', code: R`b = TokenBucket(0.5, 1)
assert [b.allow(0), b.allow(1), b.allow(2)] == [True, False, True], 'At 0.5 tokens per second a new token takes 2 seconds'` }
        ]
      }
    ],
    quiz: [
      { q: 'What does a container image give you for ML deployment?', options: ['Free GPUs', 'The code, dependencies and system libraries packaged so it runs the same everywhere', 'Automatic scaling', 'A database'], answer: 1, why: 'It removes "works on my machine". Scaling comes from the orchestrator, such as Kubernetes.', level: 'easy' },
      { q: 'A model is called a few times an hour and takes 200 ms. Most cost-effective hosting?', options: ['A dedicated GPU cluster', 'Serverless or scale-to-zero, accepting an occasional cold start', 'Ten always-on replicas', 'A mainframe'], answer: 1, why: 'You pay per request. For steady high traffic, always-on instances are cheaper.', level: 'medium' },
      { q: 'What is a cold start?', options: ['A GPU overheating', 'The delay when a new instance must start and load the model before serving', 'Training from scratch', 'A failed deployment'], answer: 1, why: 'Large models make it worse. Mitigate with a minimum number of warm instances or smaller images.', level: 'easy' },
      { q: 'Readiness probe versus liveness probe in Kubernetes?', options: ['They are identical', 'Readiness: can this pod receive traffic yet? Liveness: is it stuck and in need of a restart?', 'Liveness checks the GPU', 'Readiness restarts the pod'], answer: 1, why: 'A model server should report ready only after the model is loaded.', level: 'medium' },
      { q: 'What is a Dockerfile?', options: ['A log of container errors', 'A running container', 'A text recipe describing how to build an image', 'A Kubernetes cluster'], answer: 2, why: 'Each instruction becomes a layer of the image.', level: 'easy' },
      { q: 'Horizontal scaling means…', options: ['Adding more replicas of the service', 'Giving one machine more CPU and RAM', 'Moving the service to a new region', 'Compressing the model'], answer: 0, why: 'Giving one machine more resources is vertical scaling.', level: 'easy' },
      { q: 'A pod restarts repeatedly and its status shows OOMKilled. What happened?', options: ['The GPU overheated', 'The image was too old', 'The container exceeded its memory limit and was killed', 'The health endpoint returned 200'], answer: 2, why: 'Raise the limit, reduce memory use, or run fewer workers per pod.', level: 'medium' },
      { q: 'Traffic jumps every weekday at 09:00. What helps most?', options: ['Scale to zero overnight and nothing else', 'Raise the minimum replicas, or scale on a schedule, shortly before 09:00, in addition to autoscaling', 'Increase the log level', 'Use a larger Docker image'], answer: 1, why: 'Reactive autoscaling lags a sudden spike, so prepare capacity in advance.', level: 'medium' },
      { q: 'Out of 1,000 requests, 20 take 3 s and 980 take 50 ms. Which statement is right?', options: ['The mean and p99 are both about 50 ms', 'The mean is 3 s', 'The p99 is 50 ms because most requests are fast', 'The mean is about 109 ms but p99 is about 3 s, so the mean hides the tail'], answer: 3, why: 'The slowest 2% exceed the top 1%, so p99 lands among the slow requests.', level: 'hard' },
      { q: 'A dependency becomes slow and every client retries immediately, three times per failure. What is the likely effect and the fix?', options: ['Load multiplies and the outage worsens: use capped exponential back-off with jitter', 'Load drops, because retries are cheap', 'Nothing changes', 'Latency falls because retries are parallel'], answer: 0, why: 'Unlimited immediate retries turn a slowdown into an outage.', level: 'hard' },
      { q: 'A canary gets 5% of traffic. The overall error rate rises from 0.1% to 0.5%. Assuming the other 95% still has 0.1% errors, roughly what is the canary’s error rate?', options: ['About 0.5%', 'About 8%', 'About 4%', 'About 0.1%'], answer: 1, why: '0.95 × 0.1% + 0.05 × x = 0.5% gives x of about 8%.', level: 'hard' },
      { q: 'How can spot or preemptible instances still serve part of a production inference API?', options: ['They never can', 'They have no memory limit', 'They are never interrupted', 'With several replicas, graceful draining on the interruption notice, and on-demand capacity as a fallback'], answer: 3, why: 'Interruption is expected, so the design must tolerate it.', level: 'hard' }
    ],
    interview: [
      { q: 'How would you deploy an ML model as an API in the cloud?', points: [['Wrap the model in an API service', ['api', 'fastapi', 'rest', 'grpc', 'endpoint']], ['Package in a container', ['container', 'docker', 'image']], ['Run on a managed service or Kubernetes with autoscaling', ['kubernetes', 'managed', 'autoscal', 'sagemaker', 'vertex', 'azure', 'serverless']], ['CI/CD and infrastructure as code', ['ci', 'pipeline', 'terraform', 'infrastructure as code', 'deploy']], ['Observability, security and cost', ['monitor', 'log', 'secur', 'cost', 'auth']]], model: 'I wrap the model in a small service with a health endpoint and a prediction endpoint, validate inputs, and load the model once at start-up. I package it in a container image with pinned dependencies and store it in a registry. For hosting I choose by traffic: a managed endpoint or serverless container for simple or bursty workloads, Kubernetes when I need control, GPUs or many services. I add autoscaling, readiness checks, and a load balancer with authentication and rate limiting. A CI/CD pipeline tests, builds and rolls out the image gradually, and the infrastructure is defined as code. I monitor latency percentiles, errors, cost and model quality, and keep rollback simple.' },
      { q: 'How do you control the cost of ML workloads in the cloud?', points: [['Right-size and autoscale, scale to zero when idle', ['right-siz', 'autoscal', 'scale to zero', 'idle']], ['Cheaper capacity: spot or reserved instances', ['spot', 'reserved', 'preemptible', 'commit']], ['Make the model cheaper: quantise, distil, batch, cache', ['quanti', 'distil', 'batch', 'cache']], ['Measure cost per request and set budgets and alerts', ['cost per', 'budget', 'alert', 'tag', 'measure']]], model: 'I first make cost visible: tag resources, track cost per request or per training run, and set budgets with alerts. For serving, I right-size instances, autoscale on a meaningful metric and scale to zero where latency allows. I use reserved capacity for steady load and spot instances for fault-tolerant work such as training and batch inference. Then I reduce the work itself: quantise or distil the model, batch requests on GPUs, cache repeated results, and for LLM applications trim prompts, cache prefixes and route easy requests to a smaller model. I also clean up idle endpoints, old snapshots and oversized storage.' },
      { q: 'When would you choose serverless, containers on Kubernetes, or a managed ML endpoint?', points: [['Serverless: bursty or low traffic, minimal operations, cold starts and limits', ['serverless', 'burst', 'cold start', 'low traffic']], ['Managed endpoint: quick, built-in scaling and monitoring, less control', ['managed', 'sagemaker', 'vertex', 'azure ml', 'built-in']], ['Kubernetes: full control, GPUs, many services, needs a platform team', ['kubernetes', 'control', 'gpu', 'team']], ['Decide by traffic pattern, latency, team skills and cost', ['traffic', 'latency', 'team', 'cost', 'depends']]], model: 'Serverless fits spiky or low traffic and small models: there is nothing to operate and you pay per request, but cold starts, time limits and limited GPU support restrict it. A managed ML endpoint gets a model online quickly with autoscaling, versioning and monitoring built in, at a higher unit price and with less flexibility. Kubernetes gives full control over hardware, networking and rollout strategies and is efficient at scale, but it needs people who can run it. I decide from the traffic pattern, latency target, whether GPUs are needed, the team’s operating skills and total cost, and I avoid adopting Kubernetes for a single small service.' }
    ]
  }
];
