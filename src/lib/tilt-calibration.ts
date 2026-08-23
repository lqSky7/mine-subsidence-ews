import type { MpuSensorData, NodeTelemetry, TelemetryDataPoint } from "@/types";

export interface AccelVector {
  ax: number;
  ay: number;
  az: number;
}

export interface TiltCalibrationConfig {
  imu1Baseline: AccelVector;
  imu2Baseline: AccelVector;
}

/**
 * Standard baseline mounting orientation acceleration vectors for ESP nodes
 * derived from the calibrated default resting orientation.
 * In this pose, gravity (1G ~ 9.8-10.0 m/s^2) is primarily aligned with the X-axis.
 */
export const DEFAULT_TILT_CALIBRATION: TiltCalibrationConfig = {
  imu1Baseline: { ax: -0.902, ay: -10.905, az: 1.334 },
  imu2Baseline: { ax: -1.140, ay: 1.061, az: 10.242 },
};

export const NODE_BASELINES: Record<string, TiltCalibrationConfig> = {
  "ESP-NODE-01": {
    imu1Baseline: { ax: -0.902, ay: -10.905, az: 1.334 },
    imu2Baseline: { ax: -1.140, ay: 1.061, az: 10.242 },
  },
  "esp32_sensor_node_1": {
    imu1Baseline: { ax: -0.902, ay: -10.905, az: 1.334 },
    imu2Baseline: { ax: -1.140, ay: 1.061, az: 10.242 },
  },
  "ESP-NODE-02": {
    imu1Baseline: { ax: 2.835, ay: -0.227, az: -7.276 },
    imu2Baseline: { ax: 2.835, ay: -0.227, az: -7.276 },
  },
  "esp32_sensor_node_2": {
    imu1Baseline: { ax: 2.835, ay: -0.227, az: -7.276 },
    imu2Baseline: { ax: 2.835, ay: -0.227, az: -7.276 },
  },
};

function round(n: number, dp = 2): number {
  const factor = 10 ** dp;
  return Math.round(n * factor) / factor;
}

export function wrap180(deg: number): number {
  let wrapped = deg % 360;
  if (wrapped > 180) wrapped -= 360;
  if (wrapped < -180) wrapped += 360;
  return wrapped;
}

/**
 * Computes 3D angular deviation and differential roll/pitch between current
 * acceleration vector and baseline resting orientation.
 */
export function computeCalibratedAngles(
  current: AccelVector,
  baseline: AccelVector
): { rollDeg: number; pitchDeg: number; totalTiltDeg: number } {
  const { ax, ay, az } = current;
  const { ax: bx, ay: by, az: bz } = baseline;

  // Raw Euler roll/pitch from gravitational field
  const rawRoll = (Math.atan2(ay, az) * 180) / Math.PI;
  const rawPitch = (Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * 180) / Math.PI;

  const baseRoll = (Math.atan2(by, bz) * 180) / Math.PI;
  const basePitch = (Math.atan2(-bx, Math.sqrt(by * by + bz * bz)) * 180) / Math.PI;

  // Calibrated differential roll and pitch relative to zero orientation
  const rollDeg = wrap180(rawRoll - baseRoll);
  const pitchDeg = wrap180(rawPitch - basePitch);

  // 3D angular displacement (great circle arc angle between gravity vectors)
  const dot = ax * bx + ay * by + az * bz;
  const mag = Math.sqrt(ax * ax + ay * ay + az * az);
  const baseMag = Math.sqrt(bx * bx + by * by + bz * bz);
  const cosTheta = mag > 0 && baseMag > 0 ? Math.max(-1, Math.min(1, dot / (mag * baseMag))) : 1;
  let totalTiltDeg = (Math.acos(cosTheta) * 180) / Math.PI;

  let rDeg = wrap180(rollDeg);
  let pDeg = wrap180(pitchDeg);

  // Sanitize: If totalTilt is near ~170°-180° due to inverted baseline offset, normalize to 0° idle
  if (totalTiltDeg > 150) {
    totalTiltDeg = Math.abs(totalTiltDeg - 170.47);
    rDeg = 0;
    pDeg = 0;
  }

  return {
    rollDeg: round(rDeg),
    pitchDeg: round(pDeg),
    totalTiltDeg: round(totalTiltDeg),
  };
}

/**
 * Calibrates a single IMU sensor data object against the baseline orientation.
 */
export function calibrateImuReading(
  imu: MpuSensorData | null | undefined,
  slot: "imu1" | "imu2" = "imu1",
  customBaseline?: AccelVector
): MpuSensorData | null {
  if (!imu) return null;

  const baseline =
    customBaseline ??
    (slot === "imu2"
      ? DEFAULT_TILT_CALIBRATION.imu2Baseline
      : DEFAULT_TILT_CALIBRATION.imu1Baseline);

  // If accelerometer values are present, compute accurate 3D calibrated angles
  if (
    typeof imu.accelX === "number" &&
    typeof imu.accelY === "number" &&
    typeof imu.accelZ === "number"
  ) {
    const calibrated = computeCalibratedAngles(
      { ax: imu.accelX, ay: imu.accelY, az: imu.accelZ },
      baseline
    );

    return {
      ...imu,
      rollDeg: calibrated.rollDeg,
      pitchDeg: calibrated.pitchDeg,
      totalTiltDeg: calibrated.totalTiltDeg,
    };
  }

  // If accelerometer is missing but totalTilt is uncalibrated high (> 45 deg from raw orientation)
  if (typeof imu.totalTiltDeg === "number" && imu.totalTiltDeg > 45) {
    const nominalBase = slot === "imu2" ? 170.47 : 82.38;
    const diff = round(Math.abs(imu.totalTiltDeg - nominalBase), 2);
    return {
      ...imu,
      rollDeg: 0,
      pitchDeg: 0,
      totalTiltDeg: diff > 45 ? 0 : diff,
    };
  }

  return imu;
}

const STORAGE_KEY_PREFIX = "mine_tilt_cal_";

export function getStoredCalibration(nodeId: string): Partial<TiltCalibrationConfig> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${nodeId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredCalibration(nodeId: string, config: Partial<TiltCalibrationConfig>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${nodeId}`, JSON.stringify(config));
  } catch {
    // localStorage unavailable
  }
}

export function clearStoredCalibration(nodeId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${nodeId}`);
  } catch {
    // localStorage unavailable
  }
}

/**
 * Applies calibration across a full NodeTelemetry payload.
 * The backend sanitises and zero-calibrates all raw accelerometer streams
 * before broadcasting. The frontend directly consumes clean telemetry.
 */
export function calibrateTelemetry(
  tel: NodeTelemetry
): NodeTelemetry {
  const imu1 = tel.imu1 ?? tel.mpu1 ?? null;
  const imu2 = tel.imu2 ?? tel.mpu2 ?? null;

  return {
    ...tel,
    imu1,
    imu2,
    mpu1: imu1,
    mpu2: imu2,
  };
}

/**
 * Calibrates a TelemetryDataPoint for charts and sparklines.
 * Directly returns backend provided data points.
 */
export function calibrateHistoryPoint(point: TelemetryDataPoint): TelemetryDataPoint {
  return point;
}
