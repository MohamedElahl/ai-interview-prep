=== sensors ===
# What interviewers check

Automotive and robotics teams (driver assistance, parking, in-cabin) expect you to know what each sensor measures, where it fails and why they are combined.

# The four sensors

| Sensor | Measures | Strong at | Weak at | Typical range |
| --- | --- | --- | --- | --- |
| Camera | Colour image | Classification, lanes, signs, texture | Depth, night, glare, fog | Up to about 150 m |
| Radar | Range, radial speed, angle | Speed, bad weather, long range | Angular resolution, stationary clutter | 0.2 to 250 m |
| Lidar | 3-D point cloud | Precise shape and distance | Cost, heavy rain and fog | Up to about 200 m |
| Ultrasonic | Distance | Very short range, low cost | Range, speed, wind | 0.2 to 5 m |

# Explore the scene

Switch sensors on and off, change the weather and move the lead car. See which objects each sensor still detects.

[[demo:sensors]]

# Key formulas

- **Ultrasonic time of flight:** `distance = speed_of_sound * time / 2`.
- **Radar Doppler:** `v = f_doppler * c / (2 * f_carrier)`. At 77 GHz, 1 m/s is about 514 Hz.
- **Radar range resolution:** `c / (2 * bandwidth)`. A 1 GHz sweep resolves 15 cm.
- **Camera depth from size:** `distance = focal_length * real_height / pixel_height`.

# Radar signal chain

Chirp, mix, FFT over samples for range, FFT over chirps for Doppler, angle estimation across antennas, CFAR detection, clustering, tracking.

# Coordinate frames

Every sensor reports in its own frame. Convert to the vehicle frame (x forward, y left) with the sensor's mounting position and rotation, the **extrinsic calibration**.

# Sensor health

Real systems monitor blockage (mud, ice), misalignment and interference. Blockage detection is commonly a classifier on windowed statistics such as detection count and signal strength.

=== kalman ===
# What interviewers check

The Kalman filter is the standard tool for tracking and fusion. You should be able to explain it without equations, then write them.

# The idea

Keep an estimate and how uncertain it is. Repeat two steps:

1. **Predict.** Move the state forward with a motion model. Uncertainty grows.
2. **Update.** Compare the predicted measurement with the real one. Correct the state. Uncertainty shrinks.

The **Kalman gain** decides how far to move toward the measurement: `K = P / (P + R)` in one dimension.

# Try it

A car drives away from you. Radar and camera both measure its distance, with different noise. Change the noise levels and watch the fused estimate.

[[demo:kalman]]

# The equations

```python
# predict
x = F @ x
P = F @ P @ F.T + Q
# update
y = z - H @ x                  # innovation
S = H @ P @ H.T + R
K = P @ H.T @ np.linalg.inv(S)
x = x + K @ y
P = (I - K @ H) @ P
```

- `F` motion model, `H` measurement model.
- `Q` process noise: how wrong the model can be. `R` measurement noise: how noisy the sensor is.

# Tuning intuition

- Larger `Q` or smaller `R`: follows measurements faster, noisier output.
- Smaller `Q` or larger `R`: smoother, lags when the target manoeuvres.

# Fusing two sensors

Run one update per measurement, each with its own `H` and `R`. Two independent measurements combine by inverse-variance weighting, and the result is always more certain than either one.

# Non-linear cases

- **EKF:** linearise with Jacobians. Used for radar's range and angle measurements.
- **UKF:** propagate sigma points. Better for strong non-linearity.
- **Particle filter:** for multi-modal problems.

=== fusion-arch ===
# What interviewers check

Beyond the filter, they want to know you understand the whole system: calibration, timing, association and what happens when sensors disagree.

# Where to fuse

| Level | What is combined | Advantage | Cost |
| --- | --- | --- | --- |
| Early | Raw data (pixels, points, radar cubes) | Most information | Tight calibration and sync, heavy compute |
| Mid | Learned features, often in bird's-eye view | Strong accuracy | Trained end to end, harder to validate |
| Late | Object lists per sensor | Modular, robust to a failed sensor | Information lost before fusion |

# Preconditions for any fusion

- **Extrinsic calibration.** Where each sensor sits and points. A 1° yaw error is 1.7 m sideways at 100 m.
- **Intrinsic calibration.** Camera focal length, principal point and lens distortion.
- **Time alignment.** Timestamp at capture, then predict or interpolate to a common time. At 30 m/s, 50 ms is 1.5 m.

# The tracking loop

1. Predict all tracks to the measurement time.
2. **Gate:** ignore detections too far from a track.
3. **Associate:** nearest neighbour or the Hungarian algorithm on a distance cost.
4. Update matched tracks with a Kalman filter.
5. **Manage tracks:** start tentative tracks, confirm after several hits, delete after several misses.

# When sensors disagree

- Weight by uncertainty per quantity: radar for range and speed, camera for class and lateral position.
- Keep an existence probability per object.
- Consider field of view and sensor health before counting a "miss".

# Learned fusion

Modern networks lift camera features into a bird's-eye-view grid and merge them with lidar or radar features there (for example BEVFusion). Radar-camera fusion is attractive for cost.

# Safety vocabulary

ASIL levels (ISO 26262), SOTIF for performance limits, redundancy, plausibility checks, graceful degradation.
