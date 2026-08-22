// ============================================================
// Mine IoT Early Warning System (EWS)
// Canonical Shared Type Definitions for Multi-Node ESP Sensor System
// Hardware: 2x Gy87 AXL385 / MPU-6050, Ultrasound, Vibration,
// MQ2 Gas Sensor, Buzzer & 8x8 Flash LED Matrix
// ============================================================

export type NodeStatus = "ONLINE" | "WARNING" | "OFFLINE" | "CRITICAL";
export type HazardSeverity = "STABLE" | "WATCH" | "CRITICAL";
export type AlarmSeverity = "CRITICAL" | "WARNING" | "INFO";
export type AlarmState = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
export type LedMatrixPattern = "IDLE" | "NORMAL_CHECK" | "WARNING_PULSE" | "DANGER_FLASH" | "EVACUATE_ARROW";

// ---- Single MPU Sensor Readings (Gy87 AXL385 / MPU6050) ----
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
  ipAddress?: string;
  lastSeen: string | null;
  firmware?: string;
  rssi?: number;
  capabilities?: string[];
}

// ---- Live Node Sensor Telemetry ----
export interface NodeTelemetry {
  nodeId: string;
  timestamp: string;
  seq?: number;

  // Dual IMU / MPU Inclinometer Sensors (both aliases supported for seamless backend compatibility)
  mpu1?: MpuSensorData | null;
  mpu2?: MpuSensorData | null;
  imu1?: MpuSensorData | null;
  imu2?: MpuSensorData | null;

  // Ultrasound Distance Sensor (Front Wall Clearance)
  ultrasound?: {
    distanceCm: number;
    baselineCm: number;
    deltaCm: number;
    approachRateCmPerMin: number;
  } | null;

  // Micro-Vibration Sensor
  vibration?: {
    triggered: boolean;
    eventCount: number;
    intensity: number; // 0 - 100 normalized
  } | null;

  // MQ2 Gas Sensor (Flammable Gas / Smoke / Methane)
  gas?: {
    mq2Ppm: number;
    rawAdc: number;
    status: "NORMAL" | "WARNING" | "DANGER";
  } | null;

  // Environment (Temperature & Humidity)
  environment?: {
    temperatureC: number | null;
    humidityPct: number | null;
  } | null;

  anomaly?: {
    score: number;
    level: "NORMAL" | "WATCH" | "CRITICAL";
    sustained: boolean;
    consecutiveAnomalies: number;
    threshold: number;
    contributors: Array<{ feature: string; deviation: number }>;
    recommendation: string;
    modelVersion: string;
  } | null;

  // Alert Actuators / Outputs
  actuators?: {
    buzzerActive: boolean;
    buzzerFrequencyHz?: number;
    ledMatrixPattern: LedMatrixPattern;
    ledMatrixActive: boolean;
  };
}

export type AlarmCategory =
  | "GAS"
  | "TILT_MPU1"
  | "TILT_MPU2"
  | "WALL_DISTANCE"
  | "VIBRATION"
  | "ENVIRONMENT"
  | "SYSTEM"
  | "MANUAL"
  | string;

// ---- Early Warning Alarm ----
export interface Alarm {
  id: string;
  timestamp: string;
  source: string; // e.g. "ESP-NODE-01" or "FLEET_WIDE"
  sourceLabel: string;
  severity: AlarmSeverity;
  category: AlarmCategory;
  value: string;
  description: string;
  state: AlarmState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  raisedBy?: "SYSTEM" | "TECHNICIAN" | string;
}

// ---- Safety Alert Thresholds ----
export interface AlertThresholdConfig {
  // Gas (MQ2) Thresholds (ppm)
  gasPpmWarning: number;   // default: 450 ppm
  gasPpmCritical: number;  // default: 700 ppm

  // Wall Distance Clearance (Ultrasound) (cm)
  wallDistanceMinWarningCm: number;  // default: 2.5 cm
  wallDistanceMinCriticalCm: number; // default: 1.5 cm

  // Tilt Thresholds for MPU 1 & MPU 2 (deg)
  tiltDegWarning: number;  // default: 14.0 deg
  tiltDegCritical: number; // default: 18.0 deg

  // Vibration Threshold (events / intensity)
  vibrationIntensityThreshold: number; // default: 60

  // Environment Thresholds
  tempCWarning?: number;
  tempCCritical?: number;

  // Actuator & Alert Notification Trigger Settings
  buzzerEnabled: boolean;
  ledMatrixEnabled: boolean;
  autoTriggerActuatorsOnCritical: boolean;
  alertEmailsEnabled?: boolean;
}

// ---- Telemetry History Point ----
export interface TelemetryDataPoint {
  timestamp: string;
  time: string;
  [key: string]: string | number | boolean | undefined;
}

// ---- AI Mine Heartbeat / Risk Score (ML pipeline output) ----
export interface MineHealthScore {
  id: string;
  timestamp: string;
  overallScore: number; // 0-100, higher = healthier
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "SEVERE" | "NO_DATA" | "OFFLINE";
  contributingFactors?: Array<{ factor: string; impact: number; nodeId?: string }>;
  modelVersion: string;
  summary: string;
}

export interface AnomalyModelStatus {
  ready: boolean;
  modelVersion: string;
  baselineSamples: number;
  features: string[];
  warningThreshold: number;
  criticalThreshold: number;
  source: string;
}

// ---- Outbound Remote Command (backend -> Pi4 -> ESP) ----
export interface RemoteCommand {
  id: string;
  type: "RAISE_ALARM" | "CLEAR_ALARM" | "BUZZER_TEST" | "LED_TEST" | string;
  targetNodeId: string | "ALL";
  payload?: Record<string, unknown>;
  issuedBy: string;
  issuedAt: string;
  status: "PENDING" | "DELIVERED" | "ACKED" | "FAILED";
  deliveredAt?: string;
}

// ---- Mine Tunnel Inspection & Camera Photos ----
export interface MinePhoto {
  id: string;
  timestamp: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  nodeId?: string;
  location?: string;
  category?: "TUNNEL" | "WORKING_FACE" | "SUBSIDENCE_SURFACE" | "THERMAL_SCAN" | "INSPECTION";
  metadata?: Record<string, unknown>;
}
