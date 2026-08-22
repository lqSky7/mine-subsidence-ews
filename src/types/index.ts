// ============================================================
// Mine IoT Early Warning System (EWS)
// Shared Type Definitions for Multi-Node ESP Sensor System
// Hardware: 2x Gy87 AXL385 MPU (Perpendicular), Ultrasound,
// Vibration, MQ2 Gas Sensor, Buzzer & 8x8 Flash LED Matrix
// ============================================================

export type NodeStatus = "ONLINE" | "WARNING" | "OFFLINE" | "CRITICAL";
export type HazardSeverity = "STABLE" | "WATCH" | "CRITICAL";
export type AlarmSeverity = "CRITICAL" | "WARNING" | "INFO";
export type AlarmState = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
export type LedMatrixPattern = "IDLE" | "NORMAL_CHECK" | "WARNING_PULSE" | "DANGER_FLASH" | "EVACUATE_ARROW";

// ---- Single MPU Sensor Readings (Gy87 AXL385) ----
export interface MpuSensorData {
  accelX: number; // m/s^2 or g
  accelY: number;
  accelZ: number;
  gyroX: number;  // deg/s
  gyroY: number;
  gyroZ: number;
  rollDeg: number;
  pitchDeg: number;
  totalTiltDeg: number;
}

// ---- Multi-Node ESP Unit Entity ----
export interface EspNode {
  id: string; // e.g. "ESP-NODE-01"
  label: string; // e.g. "Tunnel Section 3 — Face North"
  location: string; // e.g. "Chamber 4B"
  status: NodeStatus;
  riskSeverity: HazardSeverity;
  ipAddress: string;
  lastSeen: string;
  firmware: string;
  rssi?: number;
}

// ---- Live Node Sensor Telemetry ----
export interface NodeTelemetry {
  nodeId: string;
  timestamp: string;

  // Dual Perpendicular MPU Sensors (Gy87 AXL385)
  mpu1: MpuSensorData; // Sensor A - Horizontal / Lateral Plane
  mpu2: MpuSensorData; // Sensor B - Vertical / Longitudinal Plane (Perpendicular)

  // Ultrasound Distance Sensor (Front Wall Clearance)
  ultrasound: {
    distanceCm: number;
    baselineCm: number;
    deltaCm: number;
    approachRateCmPerMin: number;
  };

  // Micro-Vibration Sensor
  vibration: {
    triggered: boolean;
    eventCount: number;
    intensity: number; // 0 - 100 normalized
  };

  // MQ2 Gas Sensor (Flammable Gas / Smoke / Methane)
  gas: {
    mq2Ppm: number;
    rawAdc: number;
    status: "NORMAL" | "WARNING" | "DANGER";
  };

  // Alert Actuators / Outputs
  actuators: {
    buzzerActive: boolean;
    buzzerFrequencyHz?: number;
    ledMatrixPattern: LedMatrixPattern;
    ledMatrixActive: boolean;
  };
}

// ---- Early Warning Alarm ----
export interface Alarm {
  id: string;
  timestamp: string;
  source: string; // e.g. "ESP-NODE-01"
  sourceLabel: string;
  severity: AlarmSeverity;
  category: "GAS" | "TILT_MPU1" | "TILT_MPU2" | "WALL_DISTANCE" | "VIBRATION" | "SYSTEM";
  value: string;
  description: string;
  state: AlarmState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
}

// ---- Safety Alert Thresholds ----
export interface AlertThresholdConfig {
  // Gas (MQ2) Thresholds (ppm)
  gasPpmWarning: number;   // default: 400 ppm
  gasPpmCritical: number;  // default: 800 ppm

  // Wall Distance Clearance (Ultrasound) (cm)
  wallDistanceMinWarningCm: number;  // default: 30 cm
  wallDistanceMinCriticalCm: number; // default: 15 cm

  // Tilt Thresholds for MPU 1 & MPU 2 (deg)
  tiltDegWarning: number;  // default: 3.0 deg
  tiltDegCritical: number; // default: 7.0 deg

  // Vibration Threshold (events / intensity)
  vibrationIntensityThreshold: number; // default: 60

  // Actuator Trigger Settings
  buzzerEnabled: boolean;
  ledMatrixEnabled: boolean;
  autoTriggerActuatorsOnCritical: boolean;
}

// ---- Telemetry History Point ----
export interface TelemetryDataPoint {
  timestamp: string;
  time: string;
  [key: string]: string | number | boolean | undefined;
}
