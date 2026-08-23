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
  imu1Baseline: { ax: 10.833, ay: -1.350, az: -0.530 }, // Sensor A: Horizontal (0° to ground, |G|=10.93 m/s², pitch=82.38°)
  imu2Baseline: { ax: 10.351, ay: -0.410, az: 0.150 },  // Sensor B: Vertical (90° to ground, |G|=10.36 m/s², pitch=87.58°)
};

export const NODE_BASELINES: Record<string, TiltCalibrationConfig> = {
  "ESP-NODE-01": {
    imu1Baseline: { ax: 10.003, ay: -2.393, az: -2.236 },
    imu2Baseline: { ax: 9.934, ay: -2.832, az: 1.970 },
  },
  "ESP-NODE-02": {
    imu1Baseline: { ax: 1.317, ay: 8.954, az: 6.766 },
    imu2Baseline: { ax: 1.317, ay: 8.954, az: 6.766 },
  },
  "esp32_sensor_node_2": {
    imu1Baseline: { ax: 1.317, ay: 8.954, az: 6.766 },
    imu2Baseline: { ax: 1.317, ay: 8.954, az: 6.766 },
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
  const totalTiltDeg = (Math.acos(cosTheta) * 180) / Math.PI;

  return {
    rollDeg: round(rollDeg),
    pitchDeg: round(pitchDeg),
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
    const nominalBase = slot === "imu2" ? 87.58 : 82.38;
    const diff = round(Math.abs(imu.totalTiltDeg - nominalBase), 2);
    return {
      ...imu,
      rollDeg: 0,
      pitchDeg: round(wrap180((imu.pitchDeg ?? nominalBase) - nominalBase), 2),
      totalTiltDeg: diff,
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
 */
export function calibrateTelemetry(
  tel: NodeTelemetry,
  customConfig?: Partial<TiltCalibrationConfig>
): NodeTelemetry {
  const stored = getStoredCalibration(tel.nodeId);
  const nodeBaselines = NODE_BASELINES[tel.nodeId];
  const imu1Base = customConfig?.imu1Baseline ?? stored?.imu1Baseline ?? nodeBaselines?.imu1Baseline;
  const imu2Base = customConfig?.imu2Baseline ?? stored?.imu2Baseline ?? nodeBaselines?.imu2Baseline;

  const imu1 = calibrateImuReading(tel.imu1 ?? tel.mpu1, "imu1", imu1Base);
  const imu2 = calibrateImuReading(tel.imu2 ?? tel.mpu2, "imu2", imu2Base);

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
 */
export function calibrateHistoryPoint(point: TelemetryDataPoint): TelemetryDataPoint {
  let tiltMpu1 = point.tiltMpu1;
  let tiltMpu2 = point.tiltMpu2;

  // If history point has raw uncalibrated tilt values (> 45 deg)
  if (typeof tiltMpu1 === "number" && tiltMpu1 > 45) {
    tiltMpu1 = round(Math.abs(tiltMpu1 - 82.38), 2);
  }
  if (typeof tiltMpu2 === "number" && tiltMpu2 > 45) {
    tiltMpu2 = round(Math.abs(tiltMpu2 - 87.58), 2);
  }

  return {
    ...point,
    tiltMpu1,
    tiltMpu2,
  };
}
