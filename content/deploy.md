=== quantization ===
# The idea

Store and compute with small integers instead of 32-bit floats. An 8-bit model is about 4 times smaller and runs faster on CPUs, microcontrollers and accelerators.

# Affine quantisation

```
q = clip(round(x / scale) + zero_point, qmin, qmax)
x ≈ (q - zero_point) * scale
```

- `scale = (xmax - xmin) / (qmax - qmin)`
- The **zero point** is the integer that represents 0.0 exactly. Padding and ReLU depend on it.
- **Symmetric** (zero point 0) is used for weights. **Asymmetric** is used for activations such as ReLU outputs.
- **Per-channel** scales for convolution weights, **per-tensor** for activations.

# Two workflows

| | Post-training (PTQ) | Quantisation-aware training (QAT) |
| --- | --- | --- |
| Needs | A few hundred calibration samples | Training data and time |
| How | Measure activation ranges, pick scales | Simulate rounding during training |
| Use when | Accuracy drop is acceptable | PTQ loses too much, or below 8 bits |

Range selection: min and max, percentile clipping, or entropy (KL) calibration. Outliers waste resolution.

# Integer-only inference

A real-valued scale is replaced by an integer multiplier and a right shift. Accumulators are 32-bit. Rounding and saturation are explicit.

# Fixed point (Q format)

In Q15 an `int16` value `v` means `v / 32768`. Multiply, then shift right by 15 with rounding and saturation.

# Debugging accuracy loss

1. Compare float and quantised outputs layer by layer.
2. Check that the calibration set is representative.
3. Try per-channel weights and a clipped range.
4. Keep the first, last or other sensitive layers in higher precision.
5. Move to QAT.

# LLMs

4-bit and 8-bit weight quantisation (GGUF, GPTQ, AWQ, bitsandbytes) is what lets large models run on one GPU or a laptop.

=== cpp-deploy ===
# Why C and C++

Production perception, robotics and embedded systems run in C or C++ for speed, memory control and predictable timing. Python trains the model; C++ serves it.

# The route

1. **Export** from PyTorch to ONNX (or TorchScript). Fix input shapes where you can.
2. **Check** the exported model in Python against the original.
3. **Load** in C++ with a runtime: ONNX Runtime (portable), TensorRT (NVIDIA), OpenVINO (Intel), LibTorch, TFLite.
4. **Reimplement** preprocessing and postprocessing.
5. **Verify** tensor by tensor against Python.
6. **Profile** and tune.

# An inference loop

```cpp
Ort::Env env;
Ort::Session session(env, "model.onnx", options);        // create once
std::vector<float> input(1 * 3 * 224 * 224);             // allocate once

while (camera.read(frame)) {
    preprocess(frame, input);                            // BGR->RGB, resize, HWC->CHW, normalise
    auto out = session.Run(run_opts, in_names, &tensor, 1, out_names, 1);
    postprocess(out);
}
```

# Preprocessing parity checklist

- Channel order: OpenCV gives BGR, most models expect RGB.
- Layout: HWC in memory, CHW for the model.
- Resize interpolation and aspect-ratio handling.
- Scaling to 0..1 and per-channel mean and standard deviation.
- Data type: uint8 to float32.

# C++ you will be asked about

- **RAII:** a resource is released by its owner's destructor.
- **Smart pointers:** `unique_ptr` by default, `shared_ptr` when ownership is shared.
- **Move semantics** and passing by `const&` to avoid copying tensors.
- **No allocation in the hot loop.** Reuse buffers.
- `const` correctness, `std::vector`, `std::array`, `std::span`.
- Undefined behaviour: out-of-bounds access, signed overflow, dangling references.

# Plain C for microcontrollers

Tree models become nested `if` statements. Small networks become loops over static arrays. No heap, fixed-point arithmetic, MISRA C.

# Tooling

CMake, warnings as errors, address and undefined-behaviour sanitizers, clang-tidy, unit tests with recorded test vectors.

=== cuda-gpu ===
# Why GPUs

A CPU has a few fast cores. A GPU has thousands of simple cores that apply the same operation to many data elements at once. Matrix multiplication and convolution fit this perfectly.

# The CUDA model

- **Host** is the CPU and its memory. **Device** is the GPU and its memory.
- A **kernel** is a function launched from the host that runs on the device in many **threads**.
- Threads are grouped in **blocks**; blocks form a **grid**.
- Each thread computes its index and handles one element.

```cpp
__global__ void add(const float* a, const float* b, float* c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];          // bounds check: the grid is rounded up
}
// host side
int threads = 256;
int blocks = (n + threads - 1) / threads;
add<<<blocks, threads>>>(d_a, d_b, d_c, n);
```

# Memory

- Host and device memory are separate. Copies cross the bus and are slow.
- Keep data on the GPU, batch transfers, use pinned host memory for faster copies.

# What matters in deep learning practice

Most engineers do not write kernels; they use libraries (cuDNN, PyTorch). What you need:

- `tensor.to("cuda")`, and keeping model and data on the same device.
- GPU calls are **asynchronous**. Synchronise before timing.
- **Batching** raises throughput; it also raises latency.
- **Mixed precision (FP16)** halves memory.
- **Data loading** is the usual bottleneck when utilisation is low.
- **Out of memory:** smaller batch, gradient accumulation, mixed precision, checkpointing.

# Inference engines

TensorRT compiles a model for a specific GPU: layer fusion, FP16 or INT8, and tuned kernels. ONNX Runtime can use CUDA or TensorRT as a backend.

# Monitoring

`nvidia-smi` for utilisation and memory. A profiler to split time between data loading, transfer and compute.

# Amdahl's law

If a fraction `p` of the work is sped up `n` times, the total speed-up is `1 / ((1 - p) + p / n)`. The part left on the CPU sets the limit.

=== ecu-deploy ===
# The environment

An ECU (electronic control unit) is an embedded computer in a vehicle. Small ECUs use microcontrollers with kilobytes to a few megabytes of memory. Driver-assistance computers use multi-core processors with accelerators.

# Constraints

- **Memory:** flash for code and constants, RAM for data, limited stack.
- **Timing:** tasks run on fixed cycles (for example every 10 ms). Worst-case execution time must fit.
- **No dynamic allocation** in safety-related code. No recursion. Bounded loops.
- **Numerics:** often fixed point. Overflow and saturation are designed explicitly.

# Software architecture

| | AUTOSAR Classic | AUTOSAR Adaptive |
| --- | --- | --- |
| Hardware | Microcontrollers | High-performance processors |
| Style | Static, signal-based | Service-oriented, dynamic |
| OS | OSEK-style real-time OS | POSIX (Linux, QNX) |
| Typical use | Body, powertrain, sensors | Perception, planning, connectivity |

In Classic, application code lives in software components with **runnables**, connected through the run-time environment (RTE).

# Communication

- **CAN / CAN FD:** frames of up to 8 or 64 bytes, signals defined by start bit, length, scale and offset (DBC files).
- **Automotive Ethernet / SOME/IP:** for high-data-rate sensors and services.
- **LIN, FlexRay** for specific uses.

# The test ladder

MIL (model in the loop), SIL (software), PIL (processor), HIL (hardware), then vehicle. Recorded drives are replayed for regression testing.

# Standards

- **MISRA C / C++:** coding rules.
- **Automotive SPICE (ASPICE):** process capability, traceability.
- **ISO 26262:** functional safety, ASIL A to D.
- **ISO 21448 (SOTIF):** safety of the intended function, important for ML performance limits.
- **ISO/SAE 21434:** cybersecurity.

# Putting a model on an ECU

1. Fit the budget: small model, quantised or fixed point.
2. Convert to C. Verify back to back against the reference.
3. Wrap as a software component with defined inputs, outputs and timing.
4. Measure WCET, stack and memory on target.
5. Add input plausibility checks, output monitoring and a safe state.

=== cloud-deploy ===
# The building blocks

- **Container (Docker):** your code, dependencies and system libraries in one image.
- **Registry:** where images are stored.
- **Orchestrator (Kubernetes):** runs containers, restarts them, scales them, routes traffic.
- **Managed ML services:** SageMaker (AWS), Vertex AI (Google Cloud), Azure Machine Learning.
- **Serverless:** functions or containers that scale to zero and bill per request.

# A minimal model service

```python
from fastapi import FastAPI
app = FastAPI()
model = load_model()                 # once, at start-up

@app.get("/health")
def health(): return {"ok": True}

@app.post("/predict")
def predict(item: Item): return {"score": float(model.predict(item.features))}
```

```dockerfile
FROM python:3.12-slim
COPY requirements.txt . && RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
```

# Choosing where to run

| Option | Good for | Watch out for |
| --- | --- | --- |
| Serverless | Low or spiky traffic, small models | Cold starts, limits, GPUs |
| Managed endpoint | Getting live fast, built-in scaling | Unit cost, less control |
| Kubernetes | Many services, GPUs, full control | Needs operating skills |
| Batch job | Predictions that can wait | Not for interactive use |

# Scaling

- **Horizontal:** more replicas. `desired = ceil(current * metric / target)`.
- **Vertical:** bigger machines.
- Scale on a metric that tracks load: requests per second, queue length, GPU utilisation.
- Readiness probes keep traffic away until the model is loaded.

# Reliability and release

Load balancer, health checks, rate limiting, timeouts and retries. Release with rolling, blue-green or canary deployments. Define infrastructure as code (Terraform) and deploy through CI/CD.

# Cost

Right-size, autoscale, scale to zero. Spot instances for training and batch work. Cheaper models: quantise, distil, batch, cache.

# Security

Secrets in a secret manager, least-privilege roles, private networking, authentication on every endpoint, no personal data in logs.

# GPUs in the cloud

Expensive and sometimes scarce. Use dynamic batching, share them between models where possible and shut them down when idle.
