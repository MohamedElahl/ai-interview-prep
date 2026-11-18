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
      { q: 'Which sensor measures relative speed directly in a single measurement?', options: ['Camera', 'Radar, through the Doppler shift', 'Ultrasonic', 'A standard time-of-flight lidar'], answer: 1, why: 'Camera and standard lidar infer speed from change in position over frames. FMCW lidar can measure Doppler but is less common.', level: 'easy' },
      { q: 'Heavy fog. Which sensor degrades least?', options: ['Camera', 'Lidar', 'Radar', 'All equally'], answer: 2, why: 'Millimetre waves pass through fog, rain and dust. Light, used by camera and lidar, is scattered.', level: 'medium' },
      { q: 'Which sensor is best at reading a traffic sign or lane colour?', options: ['Radar', 'Ultrasonic', 'Lidar', 'Camera'], answer: 3, why: 'Only the camera sees colour and fine texture. It has poor direct depth, which is why it is fused with radar or lidar.', level: 'easy' },
      { q: 'Typical useful range of automotive ultrasonic sensors?', options: ['A few metres', '50 m', '150 m', '300 m'], answer: 0, why: 'They are cheap and precise at very short range, so they are used for parking.', level: 'easy' },
      { q: 'A radar cover (radome) is coated with mud. What is the expected symptom?', options: ['Higher resolution', 'Blockage: fewer detections, reduced range and weaker returns', 'Colour shift', 'Faster frame rate'], answer: 1, why: 'Blockage detection uses statistics such as detection count, signal strength and range over time, often with a classifier.', level: 'medium' },
      { q: 'What does FMCW stand for in automotive radar?', options: ['Fast multi-channel wave', 'Fixed-modulation carrier wave', 'Frequency-modulated continuous wave', 'Frequency-measured coherent wave'], answer: 2, why: 'The transmitted frequency is swept (a chirp) and the echo is mixed with it to get range.', level: 'easy' },
      { q: 'A 77 GHz radar measures a Doppler shift of 15.4 kHz. Using v = f_doppler × c / (2 × f_carrier), the radial speed is…', options: ['30 m/s', '15 m/s', '60 m/s', '7.5 m/s'], answer: 0, why: '15,400 × 3e8 / (2 × 77e9) = 30 m/s.', level: 'medium' },
      { q: 'A lidar in heavy rain reports many weak, isolated points in the air ahead. The most likely cause is…', options: ['A calibration error in yaw', 'Radar interference', 'Wrong time of flight units', 'Returns from raindrops'], answer: 3, why: 'Droplets reflect part of the laser pulse; filtering on intensity and isolation removes most of them.', level: 'medium' },
      { q: 'You need to separate two objects 0.1 m apart in range. The minimum radar bandwidth, from c / (2 × bandwidth), is about…', options: ['150 MHz', '1.5 GHz', '15 GHz', '15 MHz'], answer: 1, why: '3e8 / (2 × 0.1) = 1.5e9 Hz.', level: 'hard' },
      { q: 'A radar designer must choose between a wide and a narrow beam. What is the trade-off?', options: ['Wide gives better angular resolution and range', 'A narrow beam always sees more', 'Narrow gives finer angular resolution but covers a smaller field of view or needs more antennas', 'There is no trade-off'], answer: 2, why: 'Angular resolution depends on the antenna aperture; a larger aperture narrows the beam.', level: 'hard' },
      { q: 'Radar and camera objects are offset sideways, and the offset grows in proportion to range. The most likely cause is…', options: ['A small yaw misalignment in the extrinsic calibration', 'A wrong time of flight constant', 'Radar blockage', 'A low frame rate'], answer: 0, why: 'An angular error produces a lateral error of range × angle, so it grows with distance.', level: 'hard' },
      { q: 'An ultrasonic sensor works at -10 °C but the software uses 343 m/s. The echo time is 0.02 s. The reported distance is…', options: ['About 0.18 m too short', 'About 0.18 m too long', 'Exactly right', 'About 1.8 m too long'], answer: 1, why: 'Sound is about 325 m/s at -10 °C, so the true distance is 3.25 m but 3.43 m is reported.', level: 'hard' }
    ],
    interview: [
      { q: 'Compare camera, radar, lidar and ultrasonic sensors for driver assistance.', level: 'easy', points: [['Camera: rich texture and colour, weak depth, affected by light and weather', ['camera', 'colour', 'color', 'texture', 'classif']], ['Radar: range and velocity, robust in bad weather, low angular resolution', ['radar', 'velocity', 'doppler', 'weather']], ['Lidar: accurate 3D geometry, costly, degraded by fog and rain', ['lidar', '3d', 'point cloud']], ['Ultrasonic: cheap, very short range, parking', ['ultrasonic', 'parking', 'short range']], ['They are complementary, so we fuse them', ['complement', 'fus', 'redundan']]], model: 'A camera gives dense colour and texture, so it is the best sensor for classification, lanes and signs, but it has no direct depth and suffers at night, in glare and in bad weather. Radar measures range and radial velocity directly through Doppler and keeps working in rain, fog and darkness, but its angular resolution is low and it struggles with stationary clutter. Lidar gives an accurate 3D point cloud and precise shape, at higher cost and with degradation in heavy rain or fog. Ultrasonic sensors are cheap and accurate within a few metres, which suits parking. Their strengths and failure modes are complementary, which is why production systems fuse them and gain redundancy for safety.' },
      { q: 'How does an FMCW radar measure range, velocity and angle?', level: 'medium', points: [['Transmits a frequency chirp', ['chirp', 'frequency modulated', 'fmcw', 'sweep']], ['Range from the beat frequency between sent and received signal', ['beat frequency', 'frequency difference', 'range']], ['Velocity from the phase change across chirps (Doppler)', ['doppler', 'phase', 'across chirps']], ['Angle from phase differences across antennas', ['antenna', 'angle', 'array', 'mimo']], ['Range-Doppler map, then CFAR detection', ['range-doppler', 'range doppler', 'cfar', 'fft']]], model: 'An FMCW radar transmits chirps whose frequency rises linearly. The echo is mixed with the transmitted signal, producing a beat frequency proportional to the round-trip delay, so an FFT over one chirp gives range. Motion changes the phase from chirp to chirp, so a second FFT across chirps gives Doppler, which is radial velocity. Several receive antennas see the echo with different phases, and from those differences we estimate the angle of arrival, with MIMO used to enlarge the virtual array. The result is a range-Doppler map on which a CFAR detector picks out targets above the noise, and those detections go to clustering and tracking.' },
      { q: 'How would you detect that a radar is blocked by mud or ice?', level: 'hard', points: [['Symptoms: fewer detections, lower signal strength, shorter maximum range', ['fewer', 'signal', 'rcs', 'range', 'snr', 'power']], ['Build features over a time window', ['feature', 'window', 'statistic', 'over time']], ['Train a classifier and validate across conditions', ['classif', 'random forest', 'cnn', 'model', 'valid']], ['Avoid false alarms in empty scenes, for example an open road', ['false', 'empty', 'open road', 'desert', 'scene']], ['Embedded constraints: memory, latency, fixed-point or C code', ['embedded', 'memory', 'latency', 'c code', 'fixed', 'real-time', 'real time']]], model: 'Blockage shows up as a drop in the number of detections, lower received power and a shorter maximum detection range, sustained over time. I would compute statistical features over a sliding window, such as detection count, mean signal strength, range of the farthest stable target and how many tracked objects are confirmed, then train a classifier such as a random forest or a small CNN on labelled drives with clean, partially blocked and fully blocked sensors. The hard part is separating blockage from a genuinely empty scene such as an open desert road, so I add context features like vehicle speed and returns from the road surface, and I validate across weather and road types. Because it runs on the radar ECU, the model must be small and deterministic, so I convert it to C and check that the outputs match the Python model.' },
      { q: 'How does a lidar measure distance, and what do you get from it?', level: 'easy', points: [['It emits short laser pulses and times the reflection', ['pulse', 'laser', 'time of flight', 'tof', 'reflect', 'echo', 'light']], ['Distance is speed of light times time, divided by two', ['speed of light', 'divided by two', 'half', 'round trip', 'time']], ['Scanning builds a 3D point cloud', ['point cloud', '3d', 'scan', 'points', 'spinning', 'solid state']], ['Strengths: precise geometry and shape', ['precise', 'accurate', 'geometry', 'shape', 'resolution', 'depth']], ['Weaknesses: cost, rain, fog, dust and dark or shiny surfaces', ['cost', 'expensive', 'rain', 'fog', 'dust', 'snow', 'weather', 'reflective', 'shiny']]], model: 'A lidar sends out very short laser pulses and measures how long each one takes to bounce back from a surface. Distance is the speed of light multiplied by that time, divided by two, because the pulse travels out and back. By scanning the beam across the scene, either with a spinning head or a solid-state design, it builds a three-dimensional point cloud of the surroundings. That gives very accurate shape and distance, which is why it is good for detecting objects and free space. The downsides are cost, and degraded performance in heavy rain, fog, snow or dust, plus trouble with very dark or highly reflective surfaces. So it is usually combined with radar and cameras.' },
      { q: 'Why are ultrasonic sensors used for parking but not for highway driving?', level: 'easy', points: [['They use sound, which is slow compared with light or radio', ['sound', 'acoustic', 'slow', '343', 'speed of sound']], ['Useful range is only a few metres', ['few metres', 'few meters', 'short range', 'range', 'two to five', 'centimet']], ['Cheap, robust and accurate at very close distance', ['cheap', 'low cost', 'robust', 'accurate', 'close', 'small']], ['Slow update rate and wide beam, so poor for fast moving traffic', ['update rate', 'wide', 'beam', 'slow', 'fast', 'speed', 'latency', 'angular']], ['Speed of sound depends on temperature, so compensate', ['temperature', 'compensat', 'calibrat', 'correct']]], model: 'Ultrasonic sensors send a burst of sound and time the echo. Sound is slow, about three hundred and forty metres per second, so each measurement takes a while and the update rate is low. Their useful range is only a few metres and the beam is wide, so they cannot see far enough ahead or separate objects well at speed. At parking speeds that is perfect: they are cheap, robust and accurate over a few centimetres to a few metres, which is what you need to avoid a bumper hitting a wall. Because the speed of sound changes with temperature, good systems compensate for it. For highway driving we rely on radar, camera and lidar.' },
      { q: 'What is the Doppler effect and how does a radar use it?', level: 'medium', points: [['A moving target shifts the frequency of the reflected wave', ['shift', 'frequency', 'moving', 'motion', 'change']], ['The shift is proportional to radial velocity', ['proportional', 'radial', 'velocity', 'speed', 'relative']], ['Radar gets velocity in a single measurement, no tracking needed', ['single', 'directly', 'instant', 'one measurement', 'without tracking', 'direct']], ['Only the component along the line of sight is measured', ['line of sight', 'radial', 'along', 'component', 'tangential', 'cross']], ['Helps separate moving objects from static clutter', ['static', 'clutter', 'stationary', 'separate', 'moving', 'ego']]], model: 'The Doppler effect means that a wave reflected from a moving object comes back at a shifted frequency. The shift is proportional to the relative speed along the line of sight, so the radar can read the radial velocity of a target directly from one measurement, without having to track it over several frames. With an FMCW radar this appears as a phase change from chirp to chirp. Two things to remember: it only measures the component towards or away from the sensor, so a car crossing in front of you shows a small value, and we must subtract our own motion to tell which objects are really moving. It also helps separate moving vehicles from static clutter.' },
      { q: 'How can a camera estimate the distance to the car ahead?', level: 'medium', points: [['Monocular geometry: known object size or the ground plane', ['monocular', 'known size', 'ground plane', 'bounding box', 'geometry', 'horizon', 'pinhole']], ['Stereo cameras use disparity and a baseline', ['stereo', 'disparity', 'baseline', 'two cameras', 'triangulat']], ['Learned depth networks from motion or from training data', ['learned', 'neural', 'deep', 'depth network', 'structure from motion', 'optical flow', 'motion']], ['Accuracy falls with distance and depends on calibration', ['accuracy', 'error', 'far', 'distance', 'calibrat', 'pitch']], ['Fuse with radar or lidar for a direct range', ['radar', 'lidar', 'fuse', 'fusion', 'direct', 'complement']]], model: 'A camera has no direct depth, so we infer it. With one camera we can use geometry: if we know the typical width of a car, its width in pixels gives the range through the pinhole model, or we can use where its bottom edge touches the road, assuming a flat ground plane. With two cameras, stereo disparity and the known baseline let us triangulate. Neural networks can also learn depth from a single image or from motion. All of these get less accurate with distance and are sensitive to calibration and to the vehicle pitching. That is why we normally fuse the camera with radar or lidar, which measure range directly.' },
      { q: 'What is a point cloud and how would you process lidar data for object detection?', level: 'medium', points: [['A point cloud is a set of 3D points with intensity', ['3d', 'points', 'intensity', 'xyz', 'set of points', 'coordinates']], ['Preprocess: motion compensation, crop, downsample with voxels', ['motion', 'compensat', 'crop', 'downsampl', 'voxel', 'filter', 'noise']], ['Remove the ground plane', ['ground', 'plane', 'ransac', 'road']], ['Cluster the rest into objects, or use a neural detector', ['cluster', 'segment', 'dbscan', 'euclidean', 'pointpillars', 'neural', 'network', 'detector', 'voxelnet']], ['Fit boxes, classify and pass to tracking', ['box', 'bounding', 'classif', 'track', 'size', 'orientation']]], model: 'A point cloud is simply a large set of three-dimensional points, each with a position and often an intensity, produced by one or more laser scans. To detect objects I would first clean it: correct for the vehicle’s motion during the scan, crop to the area of interest and downsample with a voxel grid to save compute. Then I would remove the ground, for example by fitting a plane with RANSAC. The remaining points can be clustered into objects, or I can feed voxels or pillars into a neural network that predicts boxes and classes directly. Finally I fit oriented boxes and hand the detections to the tracker.' },
      { q: 'A radar reports a stationary object in the road that is not really there, for example under a bridge or because of multipath. How do you deal with ghost detections?', level: 'hard', points: [['Understand the cause: multipath reflections, overhead structures, metal on the road', ['multipath', 'reflection', 'bridge', 'overhead', 'sign', 'manhole', 'guard rail', 'ghost', 'bounce']], ['Use elevation, height and the radar cross section to classify', ['elevation', 'height', 'rcs', 'cross section', 'vertical', 'classif']], ['Check consistency over time and with the ego motion, since ghosts do not behave like real objects', ['consisten', 'over time', 'track', 'ego', 'persist', 'motion', 'history']], ['Confirm with another sensor, such as the camera or lidar', ['camera', 'lidar', 'confirm', 'another sensor', 'fus', 'cross-check', 'second']], ['Balance missed objects against false braking; test on recorded edge cases', ['false', 'brak', 'miss', 'trade', 'edge case', 'recorded', 'scenario', 'validat', 'threshold']]], model: 'First I would understand why it happens. Stationary returns under bridges, signs or big metal objects, and multipath bounces off guard rails, can all create something that looks like an obstacle. I would use extra information: elevation or height if the radar provides it, the radar cross section, and the signature over time, since real obstacles follow the geometry implied by our own motion and ghosts often jump or fade. Then I would confirm with another sensor, for example only allowing strong braking when the camera or lidar agrees. The trade-off is false braking versus missing a real stopped vehicle, so I would tune thresholds on recorded edge-case scenarios and measure both error types.' },
      { q: 'How would you choose the sensor set for a highway driving assistant, and justify it?', level: 'hard', points: [['Start from the use case, speed, range and required field of view', ['use case', 'requirement', 'range', 'field of view', 'speed', 'coverage', 'operational']], ['Forward radar for long range and velocity, camera for lanes and classification', ['radar', 'camera', 'lane', 'classif', 'long range', 'velocity']], ['Add redundancy and diversity: different physics, overlapping coverage', ['redundan', 'divers', 'overlap', 'physics', 'independent', 'fail']], ['Corner radars or lidar for blind spots, cut-ins and extra confidence', ['corner', 'blind spot', 'lidar', 'side', 'rear', 'cut-in', 'surround']], ['Cost, packaging, compute and safety integrity level', ['cost', 'packag', 'compute', 'power', 'asil', 'safety', 'integrity', 'weather', 'clean']]], model: 'I would start from the requirements: speeds, how far ahead we must see, what manoeuvres are supported and the safety target. For a highway assistant I would put a long-range forward radar for range and velocity, and a forward camera for lanes, signs and classification. Their failure modes differ, which gives diversity. Corner or side radars cover blind spots and cars cutting in, and I would add a lidar if the safety case needs a second independent range source. Then I would check overlap in coverage, weather behaviour, sensor cleaning, cost, packaging and compute budget, and map each safety goal to what happens when one sensor fails. The final set is a balance between safety integrity and cost.' }
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
      { q: 'A Kalman gain close to 1 means the filter…', options: ['Ignores the measurement', 'Trusts the measurement much more than its prediction', 'Has diverged', 'Has zero process noise'], answer: 1, why: 'K = P / (P + R). When prediction uncertainty P is large compared with measurement noise R, K approaches 1.', level: 'easy' },
      { q: 'You increase the process noise Q. The filter becomes…', options: ['Smoother and slower', 'More responsive to measurements and noisier', 'Unstable', 'Unchanged'], answer: 1, why: 'A larger Q says "my motion model is less reliable", so the gain rises.', level: 'medium' },
      { q: 'Radar measures range and azimuth, but the state is Cartesian. The standard filter needs…', options: ['No change', 'Linearisation (EKF) or sigma points (UKF)', 'A larger Q only', 'Two radars'], answer: 1, why: 'The measurement function is non-linear. The EKF linearises it with a Jacobian; the UKF propagates sigma points.', level: 'medium' },
      { q: 'What does the innovation (residual) tell you?', options: ['The Kalman gain', 'The difference between the measurement and the predicted measurement', 'The process noise', 'The frame rate'], answer: 1, why: 'It drives the update, and its statistics are used for gating and for checking filter consistency.', level: 'easy' },
      { q: 'A track gets no measurement for a few frames (occlusion). A good tracker…', options: ['Deletes it immediately', 'Keeps predicting (coasting) with growing uncertainty, then deletes it if it stays unmatched', 'Freezes the position', 'Resets all tracks'], answer: 1, why: 'Track management uses confirm and delete counters so that brief dropouts do not lose the object.', level: 'medium' },
      { q: 'In the predict step of a Kalman filter, the uncertainty…', options: ['Grows', 'Shrinks to zero', 'Stays the same', 'Becomes the sensor noise'], answer: 0, why: 'Moving the state forward with an imperfect model adds process noise.', level: 'easy' },
      { q: 'What does the process noise Q represent?', options: ['The noise of the sensor', 'The time step', 'The number of states', 'How much the motion model can be wrong between steps'], answer: 3, why: 'R is the sensor noise; Q is the model’s own uncertainty.', level: 'easy' },
      { q: 'The prediction has P = 9 and the sensor R = 1. The estimate is 10 and the measurement is 20. The updated estimate is…', options: ['10.9', '15', '19', '20'], answer: 2, why: 'K = 9 / 10 = 0.9, so x = 10 + 0.9 × 10 = 19.', level: 'medium' },
      { q: 'A filter’s covariance shrinks towards zero and it stops reacting to measurements. A likely bug is…', options: ['R is too large', 'Q is not added in the predict step', 'The state has too many dimensions', 'dt is too small'], answer: 1, why: 'Without Q the filter grows overconfident, so the gain falls to zero.', level: 'hard' },
      { q: 'The normalised innovation squared is much larger than expected on average. The most likely meaning is…', options: ['The filter is optimistic: Q or R too small, or the model is wrong', 'The filter is perfectly tuned', 'The sensor is too accurate', 'dt is negative'], answer: 0, why: 'Real errors exceed what the covariance claims: the filter is inconsistent.', level: 'hard' },
      { q: 'P = 4 and R = 1. After the update, the new variance P = (1 - K) × P is…', options: ['2.0', '0.4', '1.6', '0.8'], answer: 3, why: 'K = 0.8, so P = 0.2 × 4 = 0.8.', level: 'hard' },
      { q: 'A camera frame arrives 60 ms late, after a radar update was already applied. The best treatment is…', options: ['Apply it at the current time as if it were fresh', 'Re-order it using a short buffer, or roll back and re-predict, so it is applied at its own timestamp', 'Discard all later data', 'Set R to zero'], answer: 1, why: 'A late measurement applied at the wrong time biases the estimate.', level: 'hard' }
    ],
    interview: [
      { q: 'Explain the Kalman filter in simple terms.', level: 'easy', points: [['Two steps: predict with a motion model, update with a measurement', ['predict', 'update', 'correct']], ['Keeps an estimate and its uncertainty (covariance)', ['uncertain', 'covariance', 'variance']], ['The gain weights prediction against measurement by their uncertainties', ['gain', 'weight', 'trust']], ['Optimal for linear models with Gaussian noise', ['linear', 'gaussian', 'optimal']]], model: 'A Kalman filter estimates a state that we cannot observe perfectly, such as the position and velocity of a car. It alternates two steps. In the predict step it uses a motion model to move the state forward in time and grows the uncertainty. In the update step it compares the predicted measurement with the real one and corrects the state. The Kalman gain decides how much to trust each: if the sensor is precise the estimate moves toward the measurement, and if the sensor is noisy it stays near the prediction. For linear models with Gaussian noise this is the optimal estimator, and it is cheap enough to run on an embedded controller.' },
      { q: 'How do you tune Q and R, and what happens if they are wrong?', level: 'medium', points: [['R from sensor characterisation or data sheets', ['sensor', 'datasheet', 'data sheet', 'measur', 'characteri']], ['Q reflects how much the model can be wrong, such as unmodelled acceleration', ['model', 'accelerat', 'manoeuvr', 'maneuver', 'process']], ['Q too small: slow, lags manoeuvres; too large: noisy', ['lag', 'slow', 'noisy', 'jitter', 'smooth']], ['Check innovation statistics or tune on recorded data', ['innovation', 'residual', 'nis', 'recorded', 'ground truth', 'consisten']]], model: 'R is the measurement noise, which I get from the sensor specification or by measuring the spread against ground truth. Q is the process noise, which represents what the motion model does not capture, such as unknown acceleration, so I size it from the largest manoeuvre I expect. If Q is too small or R too large the filter is over-confident in its model: the output is smooth but lags when the target brakes. If Q is too large the output follows the noise. I tune on recorded drives with reference data, look at the error, and check that the innovations are zero-mean with the covariance the filter predicts.' },
      { q: 'When would you use an EKF or UKF instead of a linear Kalman filter?', level: 'medium', points: [['When motion or measurement models are non-linear', ['non-linear', 'nonlinear']], ['Example: radar polar measurements or turning motion models', ['polar', 'range', 'azimuth', 'turn', 'ctrv', 'bearing']], ['EKF linearises with Jacobians', ['jacobian', 'lineari']], ['UKF propagates sigma points, better for strong non-linearity', ['sigma point', 'unscented']]], model: 'The linear Kalman filter assumes linear motion and measurement models. Real sensors often break that: a radar measures range, azimuth and radial velocity, which are non-linear functions of a Cartesian state, and a turning vehicle follows a non-linear motion model. The extended Kalman filter handles this by linearising around the current estimate using Jacobians. The unscented Kalman filter avoids Jacobians by pushing a small set of sigma points through the true non-linear function, which is more accurate when the non-linearity is strong, at a similar cost. For multi-modal or very non-Gaussian problems I would move to a particle filter.' },
      { q: 'What are the state vector and the covariance matrix in a Kalman filter?', level: 'easy', points: [['The state holds the quantities we want to know, such as position and velocity', ['state', 'position', 'velocity', 'quantities', 'estimate', 'variables']], ['The covariance describes the uncertainty of the state', ['covariance', 'uncertainty', 'variance', 'confidence', 'how sure']], ['Diagonal entries are variances, off-diagonals show correlation between states', ['diagonal', 'variance', 'correlat', 'off-diagonal', 'off diagonal']], ['Both are updated at every predict and update step', ['predict', 'update', 'every', 'each', 'step', 'cycle', 'recursive']]], model: 'The state vector is the list of things we want to know about the object, for example position and velocity in x and y. The Kalman filter never gives just a number; it also carries a covariance matrix that says how uncertain each state is. The diagonal entries are variances, so a large value means we are unsure, and the off-diagonal entries capture correlations, for example between position and velocity errors. At each predict step the uncertainty grows because the model is imperfect, and at each update step it shrinks because a measurement adds information. That pairing of an estimate with its uncertainty is what lets the filter weigh sources sensibly.' },
      { q: 'Why does a tracker usually keep velocity in its state even when the sensor only measures position?', level: 'easy', points: [['Velocity is needed to predict where the object will be next', ['predict', 'next', 'motion model', 'future', 'where']], ['It can be estimated from successive position measurements', ['successive', 'estimate', 'infer', 'derive', 'differenc', 'over time', 'hidden', 'unobserved']], ['It smooths noisy measurements and bridges gaps', ['smooth', 'noise', 'gap', 'occlusion', 'miss', 'coast']], ['Useful downstream for planning and collision checks', ['plan', 'collision', 'downstream', 'time to', 'risk', 'behaviour', 'behavior']]], model: 'The filter needs to predict where an object will be at the next time step, and that depends on how fast it is moving. Even if the sensor only reports position, velocity is a hidden state the Kalman filter can estimate from how the positions change over time, together with the motion model. Having it smooths out noisy measurements, and it lets the track coast through a few frames of occlusion or missed detections instead of freezing in place. It is also directly useful downstream: planning and collision checks care about how fast something is approaching, not only where it is right now.' },
      { q: 'Walk me through one predict and update cycle of a Kalman filter.', level: 'medium', points: [['Predict the state with the motion model, x equals F times x', ['predict', 'motion model', 'transition', 'f x', 'state transition', 'prior']], ['Predict the covariance and add process noise Q', ['covariance', 'process noise', 'q', 'p equals', 'grows', 'uncertainty increases']], ['Compute the innovation, the difference between measurement and predicted measurement', ['innovation', 'residual', 'difference', 'measurement minus', 'z minus', 'h x']], ['Compute the Kalman gain from P, H and R', ['gain', 'k equals', 'measurement noise', 'r', 'weight']], ['Update the state and shrink the covariance', ['update', 'correct', 'shrink', 'reduce', 'posterior', 'decrease']]], model: 'In the predict step I push the previous estimate forward with the motion model, so the new state is F times the old state, and I propagate the covariance, adding process noise Q because the model is not perfect. That makes the uncertainty larger. When a measurement arrives, I compute the innovation, which is the measurement minus what I expected to measure. The Kalman gain is built from the predicted covariance and the measurement noise R, and it decides how much to trust the measurement. I add gain times innovation to the state and reduce the covariance. If there is no measurement in a frame, I simply skip the update and let the uncertainty keep growing.' },
      { q: 'What is the innovation, and how is it used for gating and for checking the filter?', level: 'medium', points: [['The innovation is the measurement minus the predicted measurement', ['measurement minus', 'predicted measurement', 'difference', 'residual', 'innovation']], ['Its expected covariance is S, from the prediction uncertainty plus R', ['covariance', 's matrix', 'h p h', 'plus r', 'expected', 'uncertainty']], ['Mahalanobis distance or normalised innovation squared turns it into a gate', ['mahalanobis', 'normalis', 'normaliz', 'nis', 'chi', 'gate', 'gating', 'threshold']], ['Over time, innovations should be zero-mean and white; otherwise the model or noise is wrong', ['zero mean', 'zero-mean', 'white', 'consistent', 'bias', 'tune', 'unbiased', 'wrong']], ['Large values can indicate an outlier or a wrong association', ['outlier', 'association', 'wrong', 'reject', 'mismatch']]], model: 'The innovation is how surprised the filter is: the actual measurement minus the measurement the filter predicted. Its expected covariance, usually called S, combines the prediction uncertainty and the sensor noise. Dividing by it, we get the normalised innovation squared, or Mahalanobis distance, which should follow a chi-squared distribution. That gives me a statistical gate: if a detection is outside the gate, I do not associate it with the track. I also monitor innovations over time. If they are zero-mean and uncorrelated, the filter is consistent; a bias or a persistent trend tells me that the model or the noise settings are wrong. Very large values can signal an outlier or a wrong association.' },
      { q: 'Your tracker lags behind a car that brakes hard, and the estimated speed overshoots. How do you debug it?', level: 'hard', points: [['Check whether the motion model fits, for example constant velocity versus acceleration', ['motion model', 'constant velocity', 'acceleration', 'model', 'mismatch', 'ca model', 'constant acceleration']], ['Process noise Q is probably too small, so the filter trusts its prediction', ['process noise', 'q', 'too small', 'trust', 'prediction', 'increase']], ['Inspect the innovations and the gain over time', ['innovation', 'residual', 'gain', 'plot', 'consisten', 'nis', 'log']], ['Consider adaptive noise or multiple models such as IMM', ['adaptive', 'imm', 'interacting', 'multiple model', 'switch']], ['Verify timestamps, latency and measurement noise R', ['timestamp', 'latency', 'delay', 'synchron', 'r', 'measurement noise', 'sensor']]], model: 'I would first look at the logs: plot the innovations and the Kalman gain during the braking. A constant-velocity model assumes no acceleration, so when the car brakes the prediction is wrong; if Q is small the filter still believes its prediction and lags. If the innovations are large, biased and correlated, that confirms a model mismatch. Fixes are to increase Q, or better, to add acceleration to the state, or use adaptive noise or an interacting multiple model that switches between motion models. I would also rule out other causes: timestamp errors or latency, which look like a lag, and an over-optimistic R. Finally I would replay the scenario and compare metrics before and after.' },
      { q: 'Measurements arrive late or out of order, for example a camera frame with a long processing delay. How does the filter cope?', level: 'hard', points: [['Always use the measurement timestamp, not the arrival time', ['timestamp', 'time stamp', 'measurement time', 'arrival', 'capture time']], ['Predict the state to the exact measurement time', ['predict', 'propagate', 'to the time', 'variable', 'dt', 'delta']], ['Out-of-order: buffer and re-process, or retrodict', ['buffer', 'reprocess', 're-process', 'replay', 'rewind', 'out of order', 'out-of-order', 'retrodict', 'smoothing', 'roll back']], ['Or discard measurements that are too old, based on a latency budget', ['discard', 'drop', 'too old', 'latency budget', 'ignore', 'stale']], ['Account for the delay in the design and test with recorded data', ['test', 'recorded', 'simulat', 'latency', 'budget', 'delay']]], model: 'The key rule is to use the time at which the measurement was taken, not the time it arrived. The filter predicts to that timestamp with a variable time step. If a measurement arrives after we already processed newer ones, we have two choices. One is to keep a short buffer of past states, roll back to the right moment, apply the late measurement and re-run the later updates. The other is to discard anything older than a latency budget, which is simpler and often acceptable for slow sensors. I would pick based on how valuable the late data is and how much compute I have, and test it with recorded data and artificial delays.' },
      { q: 'A vehicle sometimes drives straight and sometimes turns. How do you track both with a Kalman-style filter?', level: 'hard', points: [['A single constant-velocity model fits straight driving but not turns', ['constant velocity', 'single model', 'straight', 'turn', 'does not fit', 'mismatch']], ['Use a turn-rate model such as constant turn rate and velocity, which is non-linear', ['turn rate', 'ctrv', 'ctra', 'bicycle', 'curvature', 'non-linear', 'nonlinear', 'yaw']], ['Therefore use an EKF or UKF for that model', ['ekf', 'ukf', 'extended', 'unscented', 'linearis', 'lineariz', 'jacobian']], ['Run several models and blend them with an IMM', ['imm', 'interacting', 'multiple model', 'blend', 'switch', 'mode probabilit', 'bank']], ['Model probabilities adapt to which manoeuvre is happening', ['probabilit', 'weight', 'adapt', 'likelihood', 'manoeuvre', 'maneuver']]], model: 'A single constant-velocity model works on a straight road but it lags in a turn, and a single turning model is wrong when the car goes straight. I would use a turn-rate model, for example constant turn rate and velocity, which is non-linear, so I need an extended or unscented Kalman filter. To cover both behaviours I would run an interacting multiple model filter: several filters with different motion models in parallel, each with a probability based on how well it explains the latest measurements. The output is a blend weighted by those probabilities, so the track adapts smoothly when the driver starts turning. I would tune the transition probabilities on recorded driving.' }
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
      { q: 'Early (low-level) fusion means…', options: ['Combining final object lists from each sensor', 'Combining raw or low-level data before detection, for example painting lidar points with image features', 'Using one sensor', 'Fusing after the planner'], answer: 1, why: 'Early fusion keeps the most information but needs tight calibration and synchronisation. Late fusion combines object lists and is more modular.', level: 'easy' },
      { q: 'What is extrinsic calibration?', options: ['The focal length of a camera', 'The position and orientation of a sensor relative to the vehicle or another sensor', 'The radar frequency', 'White balance'], answer: 1, why: 'Intrinsics describe the sensor itself; extrinsics place it in the vehicle frame so data from different sensors can be aligned.', level: 'easy' },
      { q: 'A camera runs at 30 Hz and a radar at 20 Hz, unsynchronised. Before fusing you must…', options: ['Drop the radar', 'Bring measurements to a common timestamp, by prediction or interpolation', 'Average the frame rates', 'Nothing'], answer: 1, why: 'At 30 m/s a 50 ms offset is 1.5 m of error.', level: 'medium' },
      { q: 'The Hungarian algorithm is used in tracking to…', options: ['Calibrate cameras', 'Find the globally cheapest one-to-one assignment of detections to tracks', 'Compress point clouds', 'Estimate velocity'], answer: 1, why: 'Greedy matching is simpler but can be sub-optimal in dense scenes.', level: 'easy' },
      { q: 'Why is redundancy across sensor types important for safety?', options: ['It lowers cost', 'Different physics means they rarely fail in the same way at the same time', 'It increases frame rate', 'It removes the need for testing'], answer: 1, why: 'Camera and radar disagreeing is itself a useful signal for plausibility checks.', level: 'medium' },
      { q: 'Data association in a tracker decides…', options: ['The radar frequency', 'The camera exposure', 'The frame rate', 'Which detection belongs to which track'], answer: 3, why: 'Each cycle a new list of detections must be matched to the existing tracks.', level: 'easy' },
      { q: 'Radar objects arrive with 150 ms latency and camera objects with 50 ms. A car closes at 20 m/s. Without compensation the two lists disagree by about…', options: ['2 m', '20 cm', '20 m', '0 m'], answer: 0, why: '0.1 s × 20 m/s = 2 m.', level: 'medium' },
      { q: 'Two overlapping radars each report the same car and the tracker shows two objects. The correct fix is…', options: ['Remove one radar', 'Increase the radar power', 'Transform both to one frame and associate their detections before they create tracks', 'Delete tracks older than a second'], answer: 2, why: 'Duplicates come from missing association between sensors.', level: 'medium' },
      { q: 'Per-sensor tracks that share earlier information are fused as if independent. The result is…', options: ['Overconfident: the fused covariance is too small', 'Less accurate but honest', 'Exactly optimal', 'A crash'], answer: 0, why: 'Correlated errors are counted twice, so uncertainty is underestimated.', level: 'hard' },
      { q: 'A detection is 2 m from the predicted position and the innovation standard deviation is 0.5 m. With a 3-sigma gate, what happens?', options: ['It is accepted as a match', 'It is rejected: it lies 4 sigma away, so a new track may start while the old one coasts', 'The gate widens', 'Both tracks merge'], answer: 1, why: '2 / 0.5 = 4, outside the gate.', level: 'hard' },
      { q: 'Your fusion has high precision overall but misses pedestrians at night. What is the most useful next step?', options: ['Report the average precision only', 'Add more cameras at once', 'Remove the night recordings', 'Evaluate recall per condition, collect more night data and check which sensor misses them'], answer: 3, why: 'Averages hide failure in specific conditions; stratify the evaluation.', level: 'hard' },
      { q: 'A supplier delivers only camera object lists and another only radar object lists. Which choice best reflects the trade-off?', options: ['Late fusion: modular and testable, but information is lost before fusion', 'Early fusion with raw data', 'No fusion', 'Delete the lists'], answer: 0, why: 'Interfaces decide what can be fused; late fusion costs some accuracy for modularity.', level: 'hard' }
    ],
    interview: [
      { q: 'Compare early, mid-level and late fusion.', level: 'medium', points: [['Early: fuse raw data, most information, needs precise calibration and sync', ['early', 'raw', 'low-level', 'low level']], ['Late: fuse object lists from each sensor, modular and robust', ['late', 'object list', 'object-level', 'object level', 'high-level', 'high level', 'modular']], ['Mid-level: fuse learned features, for example in bird’s-eye view', ['feature', 'mid', 'bird', 'bev']], ['Trade-off: accuracy against complexity, redundancy and validation effort', ['trade', 'redundan', 'complex', 'validat', 'safety']]], model: 'Early fusion combines raw or low-level data, for example projecting lidar points into the image before detection. It keeps the most information and gives the best accuracy, but depends on precise calibration and time synchronisation, and one bad sensor can corrupt everything. Late fusion runs a full detection pipeline per sensor and fuses the resulting object lists in a tracker. It is modular, easier to validate and degrades gracefully when a sensor fails, but information is lost before fusion. Mid-level fusion merges learned feature maps, commonly in a bird’s-eye-view grid, and is the approach of many modern networks. In production I choose based on the safety concept, the compute budget and how the supplier interfaces are split.' },
      { q: 'Describe a multi-object tracking pipeline.', level: 'medium', points: [['Predict existing tracks to the measurement time', ['predict']], ['Gating and data association', ['gat', 'associat', 'match', 'hungarian', 'nearest']], ['Update matched tracks with a Kalman filter', ['update', 'kalman']], ['Track management: create, confirm, delete', ['creat', 'confirm', 'delet', 'new track', 'initi', 'manag']], ['Handle clutter, occlusion and different sensor noise', ['clutter', 'occlu', 'false', 'noise']]], model: 'Each cycle starts by predicting every existing track to the timestamp of the new measurements using its motion model. Then comes association: I gate, discarding detections that are statistically too far from a track, and solve the assignment with nearest neighbour or the Hungarian algorithm on a cost such as Mahalanobis distance. Matched tracks are updated with a Kalman filter, using the noise model of the sensor that produced the detection. Unmatched detections start tentative tracks, which are confirmed after several hits, and tracks without matches coast on prediction and are deleted after several misses. This logic filters clutter and bridges short occlusions.' },
      { q: 'Camera and radar disagree about an object. How do you handle it?', level: 'hard', points: [['Check calibration and time alignment first', ['calibrat', 'time', 'sync', 'align']], ['Weight each sensor by its uncertainty for each quantity', ['uncertain', 'covariance', 'weight', 'confidence', 'trust']], ['Use each sensor for what it does best: radar range and speed, camera class and lateral position', ['range', 'velocity', 'speed', 'class', 'lateral']], ['Safety: existence probability, plausibility checks, degrade gracefully', ['existence', 'plausib', 'safety', 'degrad', 'fallback', 'conservative']]], model: 'First I rule out system problems: a calibration error or a timestamp offset shows up as a consistent disagreement. If the system is healthy, I let each sensor contribute in proportion to its uncertainty for each quantity: radar is trusted for range and radial speed, the camera for classification and lateral position. Fusion keeps an existence probability for each object, raised when sensors agree and lowered when only one reports it, taking into account whether the object is inside each sensor’s field of view and whether a sensor is degraded, for example a camera at night. For a safety function I define what happens when confidence stays low: usually a conservative reaction or a controlled degradation of the feature.' },
      { q: 'What is sensor fusion and why do we need it?', level: 'easy', points: [['Combining data from several sensors into one estimate of the world', ['combin', 'several sensors', 'multiple sensors', 'merge', 'one estimate', 'integrat', 'fuse']], ['Each sensor has strengths and weaknesses', ['strength', 'weakness', 'limit', 'fail', 'complement', 'noise']], ['The result is more accurate and more complete than any single sensor', ['accurate', 'complete', 'better', 'more information', 'precision', 'uncertainty']], ['It adds redundancy and robustness for safety', ['redundan', 'robust', 'safety', 'backup', 'fail']]], model: 'Sensor fusion means combining measurements from several sensors into a single, consistent estimate of what is around the vehicle. We need it because every sensor has weaknesses: a camera lacks direct depth and struggles in the dark, radar has coarse angular resolution, lidar degrades in fog. Their errors are different, so combining them gives an estimate that is more accurate, more complete and has well-defined uncertainty. It also adds redundancy: if one sensor is degraded, the others can still support the decision. That robustness is as important for safety as the accuracy gain, and it is why almost every assisted or automated driving system uses fusion.' },
      { q: 'What are intrinsic and extrinsic calibration?', level: 'easy', points: [['Intrinsic calibration describes the sensor itself, such as focal length and distortion', ['intrinsic', 'focal', 'distortion', 'principal point', 'lens', 'internal']], ['Extrinsic calibration gives the position and rotation of a sensor relative to the vehicle or another sensor', ['extrinsic', 'position', 'rotation', 'pose', 'mounting', 'relative', 'transform', 'external']], ['Needed to put all measurements in one common coordinate frame', ['common', 'frame', 'coordinate', 'transform', 'same']], ['Errors cause objects from different sensors to be misaligned', ['misalign', 'error', 'offset', 'wrong', 'ghost', 'duplicate', 'drift']]], model: 'Intrinsic calibration describes the sensor on its own, for example a camera’s focal length, principal point and lens distortion. Extrinsic calibration describes where the sensor sits and how it is rotated relative to the vehicle or to another sensor. Fusion needs both: intrinsics to interpret each measurement correctly, and extrinsics to transform everything into one common coordinate frame. If the extrinsics are slightly wrong, the same car appears at two places, so you get duplicate objects or failed associations, and the error grows with distance. Calibration is therefore done carefully in the factory and often monitored and refined while driving.' },
      { q: 'What is the difference between redundancy and diversity in a sensor setup?', level: 'easy', points: [['Redundancy means more than one sensor covers the same area', ['redundan', 'more than one', 'overlap', 'duplicate', 'same area', 'backup']], ['Diversity means different sensing principles, like radar and camera', ['divers', 'different', 'principle', 'physics', 'technology', 'modalit']], ['Diversity protects against common-cause failures such as weather', ['common cause', 'common-cause', 'same failure', 'weather', 'fog', 'glare', 'failure']], ['Both support safety goals and graceful degradation', ['safety', 'degrad', 'fallback', 'fail', 'availability', 'asil']]], model: 'Redundancy means that more than one sensor can observe the same thing, so if one fails we still have another. Diversity goes further: the sensors use different physics, for example radar and camera. Two identical cameras are redundant, but they can both be blinded by the same sun glare. A radar and a camera fail in different conditions, so they are much less likely to fail together, which protects against common-cause failures. For safety we usually want both, together with monitoring that detects degraded sensors, so the system can fall back to a safe behaviour or hand control back instead of failing silently.' },
      { q: 'Why does time synchronisation matter in fusion, and how do you handle it?', level: 'medium', points: [['Sensors run at different rates and with different latencies', ['rate', 'latency', 'delay', 'different', 'hz', 'asynchronous']], ['At speed, a small time error becomes a large position error', ['position error', 'speed', 'small', 'metres', 'meters', 'offset', 'error', 'moves']], ['Use a common clock and timestamp at capture', ['clock', 'timestamp', 'time stamp', 'ptp', 'gps', 'capture', 'hardware', 'common']], ['Predict tracks to the measurement time, or interpolate', ['predict', 'interpolat', 'compensat', 'propagate', 'measurement time', 'ego motion']], ['Check with recorded data and monitor drift', ['test', 'recorded', 'monitor', 'drift', 'verify', 'log']]], model: 'Sensors run at different rates and have different processing delays, so a measurement that arrives now may describe the world some tens of milliseconds ago. At motorway speed a car covers more than a metre in forty milliseconds, so ignoring that causes a visible position error and wrong associations. The solution is a common clock, with each measurement stamped at the moment of capture, ideally in hardware, and not at arrival. In the fusion I predict the tracks to the timestamp of each measurement, or interpolate between states, and I compensate for the ego vehicle’s motion during a scan. I would verify this with recorded data and monitor clock drift.' },
      { q: 'How do you decide which detection belongs to which track? Describe some association methods.', level: 'medium', points: [['Gating: only consider detections near the predicted track, using Mahalanobis distance', ['gat', 'mahalanobis', 'distance', 'near', 'threshold', 'chi']], ['Nearest neighbour is simple but greedy', ['nearest', 'greedy', 'simple', 'closest']], ['Global nearest neighbour with the Hungarian algorithm gives the best overall assignment', ['hungarian', 'global', 'assignment', 'cost matrix', 'optimal', 'gnn', 'munkres']], ['Probabilistic methods such as JPDA handle clutter and close objects', ['jpda', 'probabilistic', 'pda', 'soft', 'mht', 'multiple hypothes', 'clutter']], ['Use more than position: size, class, velocity, appearance', ['class', 'size', 'velocity', 'appearance', 'feature', 'iou', 'embedding']]], model: 'First I gate: for each track I only consider detections inside a statistical distance, such as a Mahalanobis threshold, around its prediction. Among the candidates, the simplest rule is nearest neighbour, but it is greedy and can steal a detection from another track. A better approach is global nearest neighbour: build a cost matrix and solve the assignment with the Hungarian algorithm, so the total cost is minimal. In clutter or when objects are close together, probabilistic methods such as JPDA or multiple hypothesis tracking keep several possibilities alive. The cost can combine more than distance: velocity, size, class and appearance features all help avoid swaps.' },
      { q: 'Calibration drifts over the lifetime of a vehicle. How would you detect and correct it?', level: 'hard', points: [['Monitor consistency: the same object seen by two sensors should align', ['consisten', 'align', 'same object', 'residual', 'offset', 'mismatch', 'compare', 'systematic']], ['Use features such as lane lines, road edges or static landmarks', ['lane', 'landmark', 'road edge', 'static', 'feature', 'target', 'edge']], ['Estimate the extrinsics online and filter them over time', ['online', 'estimate', 'optimis', 'optimiz', 'filter', 'over time', 'self-calibrat', 'refine']], ['Flag or degrade the function when error is too large', ['flag', 'degrade', 'warn', 'fallback', 'limit', 'threshold', 'disable', 'diagnos']], ['Validate against ground truth and avoid wrongly correcting on bad data', ['validate', 'ground truth', 'test', 'reliab', 'bad data', 'robust', 'outlier', 'statistic']]], model: 'I would treat it as a monitoring problem plus an estimation problem. For monitoring, I look at systematic residuals: if a radar and a camera see the same static objects but the offset between them keeps growing in one direction, calibration has probably drifted. For correction, online self-calibration can use features such as lane markings, road edges or static landmarks to estimate the extrinsic parameters, and I filter the estimate over long periods so single bad scenes do not change it. If the estimated error exceeds a safe limit, the system should flag it, limit the function or request service. I would validate the whole approach against reference data, and protect against correcting wrongly.' },
      { q: 'How would you evaluate a sensor fusion and tracking system?', level: 'hard', points: [['Use ground truth from a reference sensor or labelled data', ['ground truth', 'reference', 'label', 'annotat', 'benchmark']], ['Detection and tracking metrics: precision, recall, position error, id switches, track fragmentation', ['precision', 'recall', 'mota', 'motp', 'id switch', 'identity', 'ospa', 'rmse', 'error', 'fragment']], ['Check by distance, speed, weather and object class, not only on average', ['distance', 'weather', 'class', 'slice', 'breakdown', 'condition', 'segment', 'night']], ['Safety-critical cases: false positives causing braking, and misses', ['false positive', 'false negative', 'miss', 'brak', 'critical', 'safety', 'rare']], ['Closed-loop and scenario tests, regression on every change, latency', ['scenario', 'regression', 'simulat', 'latency', 'closed loop', 'replay', 'ci', 'every change', 'real time']]], model: 'I need a reference: ground truth from labelled data or a high-grade reference sensor. Then I compute detection metrics, such as precision and recall, and tracking metrics, such as position error, identity switches and fragmentation, with measures such as MOTA or OSPA. A single average hides the problems, so I break it down by distance, speed, object class, lighting and weather. Safety cares about the tails: false tracks that cause braking, and missed objects. I would also measure latency and run scenario-based and simulated closed-loop tests. Everything should be a regression suite that runs on every software change, so I see immediately when a modification makes a rare case worse.' }
    ]
  }
];
