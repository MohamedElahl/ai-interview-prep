const R = String.raw;

export default [
  {
    id: 'sensors', title: 'Automotive sensors: camera, radar, lidar, ultrasonic', tracks: ['auto', 'cv'],
    tasks: [
      {
        id: 'sen-ultrasonic', title: 'Ultrasonic time of flight',
        prompt: `A parking sensor sends an ultrasonic pulse and times the echo. Write \`ultrasonic_distance(echo_time_s, temp_c=20.0)\` that returns the distance to the obstacle in metres.

- Speed of sound in air: \`331.3 + 0.606 * temp_c\` m/s.
- The pulse travels to the obstacle **and back**.`,
        starter: R`def ultrasonic_distance(echo_time_s, temp_c=20.0):
    pass

print(ultrasonic_distance(0.01))  # about 1.717 m
`,
        solution: R`def ultrasonic_distance(echo_time_s, temp_c=20.0):
    speed = 331.3 + 0.606 * temp_c
    return speed * echo_time_s / 2
`,
        tests: [
          { name: 'Room temperature', code: R`assert close(ultrasonic_distance(0.01), 1.7171, 1e-4), '10 ms echo at 20 °C is about 1.717 m (remember the pulse goes there and back)'` },
          { name: 'Cold air is slower', code: R`assert close(ultrasonic_distance(0.0058, 0.0), 0.96077, 1e-4), 'At 0 °C the speed of sound is 331.3 m/s'` },
          { name: 'Zero time', code: R`assert close(ultrasonic_distance(0.0, 35.0), 0.0), 'Zero echo time means zero distance'` }
        ]
      },
      {
        id: 'sen-radar-frame', title: 'Radar detection to vehicle frame',
        prompt: `A radar reports a detection in its own polar frame: range \`r\` (m) and azimuth (degrees, positive to the left). The radar is mounted on the car at \`(mount_x, mount_y)\` and rotated by \`mount_yaw_deg\` (positive to the left).

Write \`radar_to_ego(r, azimuth_deg, mount_x, mount_y, mount_yaw_deg)\` that returns the detection as \`(x, y)\` in the vehicle frame, where x points forward and y points left.`,
        starter: R`import math

def radar_to_ego(r, azimuth_deg, mount_x, mount_y, mount_yaw_deg):
    pass

print(radar_to_ego(10, 0, 3.5, 0, 0))  # (13.5, 0.0)
`,
        solution: R`import math

def radar_to_ego(r, azimuth_deg, mount_x, mount_y, mount_yaw_deg):
    angle = math.radians(azimuth_deg + mount_yaw_deg)
    return mount_x + r * math.cos(angle), mount_y + r * math.sin(angle)
`,
        tests: [
          { name: 'Front radar, straight ahead', code: R`assert close(radar_to_ego(10, 0, 3.5, 0, 0), [13.5, 0.0]), 'A front radar 3.5 m ahead of the origin seeing 10 m ahead gives (13.5, 0)'` },
          { name: 'Target to the left', code: R`assert close(radar_to_ego(10, 90, 0, 0, 0), [0.0, 10.0], 1e-6), 'Azimuth +90° is to the left: (0, 10)'` },
          { name: 'Corner radar facing right', code: R`assert close(radar_to_ego(10, 0, 3.5, -0.8, -90), [3.5, -10.8], 1e-6), 'A radar yawed -90° looks to the right: expected (3.5, -10.8)'` },
          { name: 'Yaw and azimuth add', code: R`import math
assert close(radar_to_ego(math.sqrt(2), 45, 1, 1, 45), [1.0, 1 + math.sqrt(2)], 1e-6), 'Azimuth 45° on a sensor yawed 45° points along +y'` }
        ]
      },
      {
        id: 'sen-doppler', title: 'Radar Doppler velocity',
        prompt: `Radar measures speed directly from the Doppler shift. Write \`radial_velocity(doppler_hz, carrier_hz=77e9)\` that returns the radial velocity in m/s:

\`v = doppler * c / (2 * carrier)\`, with \`c = 299792458\` m/s.`,
        starter: R`C = 299_792_458

def radial_velocity(doppler_hz, carrier_hz=77e9):
    pass

print(radial_velocity(5137.0))  # about 10 m/s
`,
        solution: R`C = 299_792_458

def radial_velocity(doppler_hz, carrier_hz=77e9):
    return doppler_hz * C / (2 * carrier_hz)
`,
        tests: [
          { name: '77 GHz automotive radar', code: R`assert close(radial_velocity(2 * 77e9 / 299792458), 1.0, 1e-9), 'A shift of 513.7 Hz at 77 GHz is 1 m/s'
assert close(radial_velocity(5137.0), 10.0002, 1e-4), '5137 Hz is about 10 m/s'` },
          { name: 'Sign and zero', code: R`assert close(radial_velocity(0.0), 0.0), 'No shift means no radial motion'
assert radial_velocity(-1000.0) < 0, 'A negative shift is a negative (receding) velocity'` },
          { name: '24 GHz radar', code: R`assert close(radial_velocity(1600.0, 24e9), 9.993082, 1e-6), '1600 Hz at 24 GHz is about 9.993 m/s'` }
        ]
      }
    ],
    quiz: [
      { q: 'Which sensor measures relative speed directly in a single measurement?', options: ['Camera', 'Radar, through the Doppler shift', 'Ultrasonic', 'A standard time-of-flight lidar'], answer: 1, why: 'Camera and standard lidar infer speed from change in position over frames. FMCW lidar can measure Doppler but is less common.' },
      { q: 'Heavy fog. Which sensor degrades least?', options: ['Camera', 'Lidar', 'Radar', 'All equally'], answer: 2, why: 'Millimetre waves pass through fog, rain and dust. Light, used by camera and lidar, is scattered.' },
      { q: 'Which sensor is best at reading a traffic sign or lane colour?', options: ['Radar', 'Ultrasonic', 'Lidar', 'Camera'], answer: 3, why: 'Only the camera sees colour and fine texture. It has poor direct depth, which is why it is fused with radar or lidar.' },
      { q: 'Typical useful range of automotive ultrasonic sensors?', options: ['A few metres', '50 m', '150 m', '300 m'], answer: 0, why: 'They are cheap and precise at very short range, so they are used for parking.' },
      { q: 'A radar cover (radome) is coated with mud. What is the expected symptom?', options: ['Higher resolution', 'Blockage: fewer detections, reduced range and weaker returns', 'Colour shift', 'Faster frame rate'], answer: 1, why: 'Blockage detection uses statistics such as detection count, signal strength and range over time, often with a classifier.' }
    ],
    interview: [
      { q: 'Compare camera, radar, lidar and ultrasonic sensors for driver assistance.', points: [['Camera: rich texture and colour, weak depth, affected by light and weather', ['camera', 'colour', 'color', 'texture', 'classif']], ['Radar: range and velocity, robust in bad weather, low angular resolution', ['radar', 'velocity', 'doppler', 'weather']], ['Lidar: accurate 3D geometry, costly, degraded by fog and rain', ['lidar', '3d', 'point cloud']], ['Ultrasonic: cheap, very short range, parking', ['ultrasonic', 'parking', 'short range']], ['They are complementary, so we fuse them', ['complement', 'fus', 'redundan']]], model: 'A camera gives dense colour and texture, so it is the best sensor for classification, lanes and signs, but it has no direct depth and suffers at night, in glare and in bad weather. Radar measures range and radial velocity directly through Doppler and keeps working in rain, fog and darkness, but its angular resolution is low and it struggles with stationary clutter. Lidar gives an accurate 3D point cloud and precise shape, at higher cost and with degradation in heavy rain or fog. Ultrasonic sensors are cheap and accurate within a few metres, which suits parking. Their strengths and failure modes are complementary, which is why production systems fuse them and gain redundancy for safety.' },
      { q: 'How does an FMCW radar measure range, velocity and angle?', points: [['Transmits a frequency chirp', ['chirp', 'frequency modulated', 'fmcw', 'sweep']], ['Range from the beat frequency between sent and received signal', ['beat frequency', 'frequency difference', 'range']], ['Velocity from the phase change across chirps (Doppler)', ['doppler', 'phase', 'across chirps']], ['Angle from phase differences across antennas', ['antenna', 'angle', 'array', 'mimo']], ['Range-Doppler map, then CFAR detection', ['range-doppler', 'range doppler', 'cfar', 'fft']]], model: 'An FMCW radar transmits chirps whose frequency rises linearly. The echo is mixed with the transmitted signal, producing a beat frequency proportional to the round-trip delay, so an FFT over one chirp gives range. Motion changes the phase from chirp to chirp, so a second FFT across chirps gives Doppler, which is radial velocity. Several receive antennas see the echo with different phases, and from those differences we estimate the angle of arrival, with MIMO used to enlarge the virtual array. The result is a range-Doppler map on which a CFAR detector picks out targets above the noise, and those detections go to clustering and tracking.' },
      { q: 'How would you detect that a radar is blocked by mud or ice?', points: [['Symptoms: fewer detections, lower signal strength, shorter maximum range', ['fewer', 'signal', 'rcs', 'range', 'snr', 'power']], ['Build features over a time window', ['feature', 'window', 'statistic', 'over time']], ['Train a classifier and validate across conditions', ['classif', 'random forest', 'cnn', 'model', 'valid']], ['Avoid false alarms in empty scenes, for example an open road', ['false', 'empty', 'open road', 'desert', 'scene']], ['Embedded constraints: memory, latency, fixed-point or C code', ['embedded', 'memory', 'latency', 'c code', 'fixed', 'real-time', 'real time']]], model: 'Blockage shows up as a drop in the number of detections, lower received power and a shorter maximum detection range, sustained over time. I would compute statistical features over a sliding window, such as detection count, mean signal strength, range of the farthest stable target and how many tracked objects are confirmed, then train a classifier such as a random forest or a small CNN on labelled drives with clean, partially blocked and fully blocked sensors. The hard part is separating blockage from a genuinely empty scene such as an open desert road, so I add context features like vehicle speed and returns from the road surface, and I validate across weather and road types. Because it runs on the radar ECU, the model must be small and deterministic, so I convert it to C and check that the outputs match the Python model.' }
    ]
  },

  {
    id: 'kalman', title: 'Kalman filters and tracking', tracks: ['auto', 'cv', 'mle'],
    tasks: [
      {
        id: 'kf-fuse', title: 'Fuse two measurements',
        prompt: `A radar and a camera both measure the distance to the same car. Each gives a value and a variance. Write \`fuse(m1, var1, m2, var2)\` that returns the best combined estimate \`(mean, variance)\`.

For two independent Gaussian measurements the optimal fusion weights each by the inverse of its variance:

- \`variance = 1 / (1/var1 + 1/var2)\`
- \`mean = variance * (m1/var1 + m2/var2)\``,
        starter: R`def fuse(m1, var1, m2, var2):
    pass

print(fuse(10.0, 1.0, 12.0, 1.0))  # (11.0, 0.5)
`,
        solution: R`def fuse(m1, var1, m2, var2):
    variance = 1.0 / (1.0 / var1 + 1.0 / var2)
    mean = variance * (m1 / var1 + m2 / var2)
    return mean, variance
`,
        tests: [
          { name: 'Equal confidence', code: R`assert close(fuse(10.0, 1.0, 12.0, 1.0), [11.0, 0.5]), 'Two equally noisy sensors: the mean is the average and the variance halves'` },
          { name: 'Trust the better sensor', code: R`assert close(fuse(10.0, 1.0, 20.0, 9.0), [11.0, 0.9]), 'The result should sit close to the low-variance sensor: (11.0, 0.9)'` },
          { name: 'Fused variance is smaller than both', code: R`m, v = fuse(5.0, 0.3, 5.5, 2.0)
assert v < 0.3 and 5.0 < m < 5.5, 'Fusion always reduces variance, and the mean lies between the inputs'` }
        ]
      },
      {
        id: 'kf-1d', title: '1-D Kalman filter step',
        prompt: `Write \`kalman_1d(x, P, z, R, Q)\` for a quantity assumed constant between steps. \`x\` is the estimate, \`P\` its variance, \`z\` the new measurement with variance \`R\`, and \`Q\` the process noise.

1. Predict: \`P = P + Q\`
2. Gain: \`K = P / (P + R)\`
3. Update: \`x = x + K * (z - x)\`, \`P = (1 - K) * P\`

Return the new \`(x, P)\`.`,
        starter: R`def kalman_1d(x, P, z, R, Q):
    pass

print(kalman_1d(0.0, 1.0, 10.0, 1.0, 0.0))  # (5.0, 0.5)
`,
        solution: R`def kalman_1d(x, P, z, R, Q):
    P = P + Q
    K = P / (P + R)
    x = x + K * (z - x)
    P = (1 - K) * P
    return x, P
`,
        tests: [
          { name: 'Equal uncertainty', code: R`assert close(kalman_1d(0.0, 1.0, 10.0, 1.0, 0.0), [5.0, 0.5]), 'With P = R the estimate moves halfway: (5.0, 0.5)'` },
          { name: 'Process noise raises the gain', code: R`assert close(kalman_1d(0.0, 1.0, 10.0, 1.0, 1.0), [20/3, 2/3]), 'With Q = 1, P becomes 2 before the update, so K = 2/3'` },
          { name: 'Noisy sensor is trusted less', code: R`x, P = kalman_1d(0.0, 1.0, 10.0, 99.0, 0.0)
assert close(x, 0.1) and close(P, 0.99), 'With R = 99 the gain is 0.01'` },
          { name: 'Converges over many steps', code: R`x, P = 0.0, 1.0
for _ in range(60):
    x, P = kalman_1d(x, P, 5.0, 1.0, 0.01)
assert abs(x - 5.0) < 0.1, 'Repeated measurements of 5.0 should pull the estimate to about 5.0'` }
        ]
      },
      {
        id: 'kf-cv', title: 'Constant-velocity Kalman filter',
        prompt: `Track an object with state \`x = [position, velocity]\` and covariance \`P\` (2×2). Position is measured, velocity is not.

- \`kf_predict(x, P, dt, q)\`: \`F = [[1, dt], [0, 1]]\`, \`x = F @ x\`, \`P = F @ P @ F.T + q * I\`
- \`kf_update(x, P, z, r)\`: \`H = [1, 0]\`, \`S = P[0,0] + r\`, \`K = P[:, 0] / S\`, \`x = x + K * (z - x[0])\`, \`P = (I - K H) @ P\`

Both return \`(x, P)\` as numpy arrays.`,
        starter: R`import numpy as np

def kf_predict(x, P, dt, q):
    x, P = np.asarray(x, float), np.asarray(P, float)
    pass

def kf_update(x, P, z, r):
    x, P = np.asarray(x, float), np.asarray(P, float)
    pass
`,
        solution: R`import numpy as np

def kf_predict(x, P, dt, q):
    x, P = np.asarray(x, float), np.asarray(P, float)
    F = np.array([[1.0, dt], [0.0, 1.0]])
    return F @ x, F @ P @ F.T + q * np.eye(2)

def kf_update(x, P, z, r):
    x, P = np.asarray(x, float), np.asarray(P, float)
    H = np.array([[1.0, 0.0]])
    S = P[0, 0] + r
    K = P[:, 0] / S
    x = x + K * (z - x[0])
    P = (np.eye(2) - np.outer(K, H)) @ P
    return x, P
`,
        tests: [
          { name: 'Predict', code: R`x, P = kf_predict([0, 2], [[1, 0], [0, 1]], 0.5, 0.0)
assert close(x, [1, 2]), 'Position advances by velocity * dt'
assert close(P, [[1.25, 0.5], [0.5, 1.0]]), 'P = F P F^T should be [[1.25, 0.5], [0.5, 1]]'` },
          { name: 'Update', code: R`x, P = kf_update([1, 2], [[1.25, 0.5], [0.5, 1.0]], 2.0, 1.0)
assert close(x, [14/9, 20/9], 1e-6), 'x should be about [1.5556, 2.2222]: the velocity is corrected too'
assert close(P, [[5/9, 2/9], [2/9, 8/9]], 1e-6), 'P should be about [[0.556, 0.222], [0.222, 0.889]]'` },
          { name: 'Learns velocity from position only', code: R`import numpy as np
x, P = np.array([0.0, 0.0]), np.eye(2) * 10
for k in range(1, 60):
    x, P = kf_predict(x, P, 0.1, 1e-4)
    x, P = kf_update(x, P, 3.0 * 0.1 * k, 0.01)
assert abs(x[1] - 3.0) < 0.1, 'After tracking a target moving at 3 m/s the velocity estimate should be near 3'` }
        ]
      }
    ],
    quiz: [
      { q: 'A Kalman gain close to 1 means the filter…', options: ['Ignores the measurement', 'Trusts the measurement much more than its prediction', 'Has diverged', 'Has zero process noise'], answer: 1, why: 'K = P / (P + R). When prediction uncertainty P is large compared with measurement noise R, K approaches 1.' },
      { q: 'You increase the process noise Q. The filter becomes…', options: ['Smoother and slower', 'More responsive to measurements and noisier', 'Unstable', 'Unchanged'], answer: 1, why: 'A larger Q says "my motion model is less reliable", so the gain rises.' },
      { q: 'Radar measures range and azimuth, but the state is Cartesian. The standard filter needs…', options: ['No change', 'Linearisation (EKF) or sigma points (UKF)', 'A larger Q only', 'Two radars'], answer: 1, why: 'The measurement function is non-linear. The EKF linearises it with a Jacobian; the UKF propagates sigma points.' },
      { q: 'What does the innovation (residual) tell you?', options: ['The Kalman gain', 'The difference between the measurement and the predicted measurement', 'The process noise', 'The frame rate'], answer: 1, why: 'It drives the update, and its statistics are used for gating and for checking filter consistency.' },
      { q: 'A track gets no measurement for a few frames (occlusion). A good tracker…', options: ['Deletes it immediately', 'Keeps predicting (coasting) with growing uncertainty, then deletes it if it stays unmatched', 'Freezes the position', 'Resets all tracks'], answer: 1, why: 'Track management uses confirm and delete counters so that brief dropouts do not lose the object.' }
    ],
    interview: [
      { q: 'Explain the Kalman filter in simple terms.', points: [['Two steps: predict with a motion model, update with a measurement', ['predict', 'update', 'correct']], ['Keeps an estimate and its uncertainty (covariance)', ['uncertain', 'covariance', 'variance']], ['The gain weights prediction against measurement by their uncertainties', ['gain', 'weight', 'trust']], ['Optimal for linear models with Gaussian noise', ['linear', 'gaussian', 'optimal']]], model: 'A Kalman filter estimates a state that we cannot observe perfectly, such as the position and velocity of a car. It alternates two steps. In the predict step it uses a motion model to move the state forward in time and grows the uncertainty. In the update step it compares the predicted measurement with the real one and corrects the state. The Kalman gain decides how much to trust each: if the sensor is precise the estimate moves toward the measurement, and if the sensor is noisy it stays near the prediction. For linear models with Gaussian noise this is the optimal estimator, and it is cheap enough to run on an embedded controller.' },
      { q: 'How do you tune Q and R, and what happens if they are wrong?', points: [['R from sensor characterisation or data sheets', ['sensor', 'datasheet', 'data sheet', 'measur', 'characteri']], ['Q reflects how much the model can be wrong, such as unmodelled acceleration', ['model', 'accelerat', 'manoeuvr', 'maneuver', 'process']], ['Q too small: slow, lags manoeuvres; too large: noisy', ['lag', 'slow', 'noisy', 'jitter', 'smooth']], ['Check innovation statistics or tune on recorded data', ['innovation', 'residual', 'nis', 'recorded', 'ground truth', 'consisten']]], model: 'R is the measurement noise, which I get from the sensor specification or by measuring the spread against ground truth. Q is the process noise, which represents what the motion model does not capture, such as unknown acceleration, so I size it from the largest manoeuvre I expect. If Q is too small or R too large the filter is over-confident in its model: the output is smooth but lags when the target brakes. If Q is too large the output follows the noise. I tune on recorded drives with reference data, look at the error, and check that the innovations are zero-mean with the covariance the filter predicts.' },
      { q: 'When would you use an EKF or UKF instead of a linear Kalman filter?', points: [['When motion or measurement models are non-linear', ['non-linear', 'nonlinear']], ['Example: radar polar measurements or turning motion models', ['polar', 'range', 'azimuth', 'turn', 'ctrv', 'bearing']], ['EKF linearises with Jacobians', ['jacobian', 'lineari']], ['UKF propagates sigma points, better for strong non-linearity', ['sigma point', 'unscented']]], model: 'The linear Kalman filter assumes linear motion and measurement models. Real sensors often break that: a radar measures range, azimuth and radial velocity, which are non-linear functions of a Cartesian state, and a turning vehicle follows a non-linear motion model. The extended Kalman filter handles this by linearising around the current estimate using Jacobians. The unscented Kalman filter avoids Jacobians by pushing a small set of sigma points through the true non-linear function, which is more accurate when the non-linearity is strong, at a similar cost. For multi-modal or very non-Gaussian problems I would move to a particle filter.' }
    ]
  },

  {
    id: 'fusion-arch', title: 'Sensor fusion architectures', tracks: ['auto', 'cv', 'mle'],
    tasks: [
      {
        id: 'fu-associate', title: 'Associate detections to tracks',
        prompt: `Before a tracker can update, each new detection must be matched to an existing track. Write \`associate(tracks, detections, gate)\` using greedy nearest-neighbour matching.

- \`tracks\` and \`detections\` are lists of \`(x, y)\` positions.
- Repeatedly pick the unmatched track/detection pair with the smallest Euclidean distance. Stop when the smallest distance is larger than \`gate\`.
- Return \`(matches, unmatched_tracks, unmatched_detections)\`: \`matches\` is a list of \`(track_index, detection_index)\` sorted by track index; the other two are sorted lists of indices.`,
        starter: R`import math

def associate(tracks, detections, gate):
    pass

print(associate([(0, 0), (10, 0)], [(9.5, 0), (0.4, 0), (50, 50)], 2.0))
`,
        solution: R`import math

def associate(tracks, detections, gate):
    pairs = sorted(
        (math.dist(t, d), i, j)
        for i, t in enumerate(tracks)
        for j, d in enumerate(detections)
    )
    used_t, used_d, matches = set(), set(), []
    for dist, i, j in pairs:
        if dist > gate:
            break
        if i in used_t or j in used_d:
            continue
        used_t.add(i); used_d.add(j)
        matches.append((i, j))
    unmatched_t = [i for i in range(len(tracks)) if i not in used_t]
    unmatched_d = [j for j in range(len(detections)) if j not in used_d]
    return sorted(matches), unmatched_t, unmatched_d
`,
        tests: [
          { name: 'Two matches and a new object', code: R`m, ut, ud = associate([(0, 0), (10, 0)], [(9.5, 0), (0.4, 0), (50, 50)], 2.0)
assert [tuple(p) for p in m] == [(0, 1), (1, 0)], 'Track 0 matches detection 1, track 1 matches detection 0'
assert list(ut) == [] and list(ud) == [2], 'Detection 2 is unmatched: it starts a new track'` },
          { name: 'Closest pair wins a conflict', code: R`m, ut, ud = associate([(0, 0), (1, 0)], [(0.9, 0)], 5.0)
assert [tuple(p) for p in m] == [(1, 0)] and list(ut) == [0] and list(ud) == [], 'The single detection goes to the nearer track 1'` },
          { name: 'Gate rejects far detections', code: R`m, ut, ud = associate([(0, 0)], [(3, 0)], 2.0)
assert list(m) == [] and list(ut) == [0] and list(ud) == [0], 'Distance 3 is outside gate 2, so nothing matches'` },
          { name: 'Empty inputs', code: R`m, ut, ud = associate([], [(1, 1)], 2.0)
assert list(m) == [] and list(ut) == [] and list(ud) == [0], 'No tracks: every detection is unmatched'` }
        ]
      },
      {
        id: 'fu-timesync', title: 'Align measurements in time',
        prompt: `Sensors sample at different times. To fuse a camera frame at time \`t\` with radar, you interpolate the radar track to \`t\`.

Write \`interpolate(t, t0, p0, t1, p1)\` that linearly interpolates a position between \`p0\` at time \`t0\` and \`p1\` at time \`t1\`. Positions are tuples of any length. If \`t\` is outside the interval, extrapolate along the same line. If \`t0 == t1\`, return \`p0\`.`,
        starter: R`def interpolate(t, t0, p0, t1, p1):
    pass

print(interpolate(0.05, 0.0, (10.0, 0.0), 0.1, (12.0, 1.0)))  # (11.0, 0.5)
`,
        solution: R`def interpolate(t, t0, p0, t1, p1):
    if t1 == t0:
        return tuple(p0)
    a = (t - t0) / (t1 - t0)
    return tuple(x0 + a * (x1 - x0) for x0, x1 in zip(p0, p1))
`,
        tests: [
          { name: 'Midpoint', code: R`assert close(interpolate(0.05, 0.0, (10.0, 0.0), 0.1, (12.0, 1.0)), [11.0, 0.5]), 'Halfway in time is halfway in position'` },
          { name: 'Endpoints', code: R`assert close(interpolate(2.0, 2.0, (1.0, 2.0, 3.0), 4.0, (5.0, 6.0, 7.0)), [1, 2, 3]) and close(interpolate(4.0, 2.0, (1.0, 2.0, 3.0), 4.0, (5.0, 6.0, 7.0)), [5, 6, 7]), 'At t0 return p0, at t1 return p1 (any number of dimensions)'` },
          { name: 'Extrapolation', code: R`assert close(interpolate(0.2, 0.0, (0.0,), 0.1, (1.0,)), [2.0]), 'Past t1, continue along the same line'` },
          { name: 'Identical timestamps', code: R`assert close(interpolate(1.0, 1.0, (3.0, 4.0), 1.0, (9.0, 9.0)), [3.0, 4.0]), 'If t0 == t1 return p0 (no division by zero)'` }
        ]
      }
    ],
    quiz: [
      { q: 'Early (low-level) fusion means…', options: ['Combining final object lists from each sensor', 'Combining raw or low-level data before detection, for example painting lidar points with image features', 'Using one sensor', 'Fusing after the planner'], answer: 1, why: 'Early fusion keeps the most information but needs tight calibration and synchronisation. Late fusion combines object lists and is more modular.' },
      { q: 'What is extrinsic calibration?', options: ['The focal length of a camera', 'The position and orientation of a sensor relative to the vehicle or another sensor', 'The radar frequency', 'White balance'], answer: 1, why: 'Intrinsics describe the sensor itself; extrinsics place it in the vehicle frame so data from different sensors can be aligned.' },
      { q: 'A camera runs at 30 Hz and a radar at 20 Hz, unsynchronised. Before fusing you must…', options: ['Drop the radar', 'Bring measurements to a common timestamp, by prediction or interpolation', 'Average the frame rates', 'Nothing'], answer: 1, why: 'At 30 m/s a 50 ms offset is 1.5 m of error.' },
      { q: 'The Hungarian algorithm is used in tracking to…', options: ['Calibrate cameras', 'Find the globally cheapest one-to-one assignment of detections to tracks', 'Compress point clouds', 'Estimate velocity'], answer: 1, why: 'Greedy matching is simpler but can be sub-optimal in dense scenes.' },
      { q: 'Why is redundancy across sensor types important for safety?', options: ['It lowers cost', 'Different physics means they rarely fail in the same way at the same time', 'It increases frame rate', 'It removes the need for testing'], answer: 1, why: 'Camera and radar disagreeing is itself a useful signal for plausibility checks.' }
    ],
    interview: [
      { q: 'Compare early, mid-level and late fusion.', points: [['Early: fuse raw data, most information, needs precise calibration and sync', ['early', 'raw', 'low-level', 'low level']], ['Late: fuse object lists from each sensor, modular and robust', ['late', 'object list', 'object-level', 'object level', 'high-level', 'high level', 'modular']], ['Mid-level: fuse learned features, for example in bird’s-eye view', ['feature', 'mid', 'bird', 'bev']], ['Trade-off: accuracy against complexity, redundancy and validation effort', ['trade', 'redundan', 'complex', 'validat', 'safety']]], model: 'Early fusion combines raw or low-level data, for example projecting lidar points into the image before detection. It keeps the most information and gives the best accuracy, but depends on precise calibration and time synchronisation, and one bad sensor can corrupt everything. Late fusion runs a full detection pipeline per sensor and fuses the resulting object lists in a tracker. It is modular, easier to validate and degrades gracefully when a sensor fails, but information is lost before fusion. Mid-level fusion merges learned feature maps, commonly in a bird’s-eye-view grid, and is the approach of many modern networks. In production I choose based on the safety concept, the compute budget and how the supplier interfaces are split.' },
      { q: 'Describe a multi-object tracking pipeline.', points: [['Predict existing tracks to the measurement time', ['predict']], ['Gating and data association', ['gat', 'associat', 'match', 'hungarian', 'nearest']], ['Update matched tracks with a Kalman filter', ['update', 'kalman']], ['Track management: create, confirm, delete', ['creat', 'confirm', 'delet', 'new track', 'initi', 'manag']], ['Handle clutter, occlusion and different sensor noise', ['clutter', 'occlu', 'false', 'noise']]], model: 'Each cycle starts by predicting every existing track to the timestamp of the new measurements using its motion model. Then comes association: I gate, discarding detections that are statistically too far from a track, and solve the assignment with nearest neighbour or the Hungarian algorithm on a cost such as Mahalanobis distance. Matched tracks are updated with a Kalman filter, using the noise model of the sensor that produced the detection. Unmatched detections start tentative tracks, which are confirmed after several hits, and tracks without matches coast on prediction and are deleted after several misses. This logic filters clutter and bridges short occlusions.' },
      { q: 'Camera and radar disagree about an object. How do you handle it?', points: [['Check calibration and time alignment first', ['calibrat', 'time', 'sync', 'align']], ['Weight each sensor by its uncertainty for each quantity', ['uncertain', 'covariance', 'weight', 'confidence', 'trust']], ['Use each sensor for what it does best: radar range and speed, camera class and lateral position', ['range', 'velocity', 'speed', 'class', 'lateral']], ['Safety: existence probability, plausibility checks, degrade gracefully', ['existence', 'plausib', 'safety', 'degrad', 'fallback', 'conservative']]], model: 'First I rule out system problems: a calibration error or a timestamp offset shows up as a consistent disagreement. If the system is healthy, I let each sensor contribute in proportion to its uncertainty for each quantity: radar is trusted for range and radial speed, the camera for classification and lateral position. Fusion keeps an existence probability for each object, raised when sensors agree and lowered when only one reports it, taking into account whether the object is inside each sensor’s field of view and whether a sensor is degraded, for example a camera at night. For a safety function I define what happens when confidence stays low: usually a conservative reaction or a controlled degradation of the feature.' }
    ]
  }
];
