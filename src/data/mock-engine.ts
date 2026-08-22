/**
 * Real-Time Telemetry Engine for Mine IoT Early Warning System
 * Hardware Per Node:
 * - 2x Gy87 AXL385 MPU Sensors (Perpendicular: Horizontal & Vertical)
 * - 1x Ultrasound Sensor (Wall Distance / Clearance)
 * - 1x Micro-Vibration Sensor
 * - 1x MQ2 Gas Sensor (Flammable Gas / Smoke / Methane)
 * - 1x Buzzer (Audible Alarm)
 * - 1x 8x8 Flash LED Matrix (Visual Alarm)
 */

import type {
  EspNode,
  NodeTelemetry,
  MpuSensorData,
  Alarm,
  AlarmSeverity,
  AlertThresholdConfig,
  TelemetryDataPoint,
  HazardSeverity,
  LedMatrixPattern,
} from "@/types";

let tick = 0;

// Configurable Safety Thresholds
export let activeThresholds: AlertThresholdConfig = {
  gasPpmWarning: 400,
  gasPpmCritical: 800,
  wallDistanceMinWarningCm: 35.0,
  wallDistanceMinCriticalCm: 20.0,
  tiltDegWarning: 3.0,
  tiltDegCritical: 7.0,
  vibrationIntensityThreshold: 60,
  buzzerEnabled: true,
  ledMatrixEnabled: true,
  autoTriggerActuatorsOnCritical: true,
};

const alarmHistory: Alarm[] = [];
let alarmIdCounter = 100;

// ---- Fleet of Multi-Node ESP Sensor Units ----
export const initialFleetData: Array<{
  id: string;
  label: string;
  location: string;
  ipAddress: string;
}> = [
  { id: "ESP-NODE-01", label: "Chamber 1 — Working Face North", location: "Gallery North AA", ipAddress: "192.168.1.101" },
  { id: "ESP-NODE-02", label: "Chamber 2 — Central Extraction Header", location: "Header Section 4B", ipAddress: "192.168.1.102" },
  { id: "ESP-NODE-03", label: "Chamber 3 — Return Airway Intersection", location: "Airway Crosscut 2", ipAddress: "192.168.1.103" },
  { id: "ESP-NODE-04", label: "Chamber 4 — Intake Shaft Boundary", location: "Intake Pillar 7", ipAddress: "192.168.1.104" },
];

function noise(amplitude: number): number {
  return (Math.random() - 0.5) * 2 * amplitude;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sinWave(period: number, amplitude: number, offset: number = 0): number {
  return Math.sin(((tick) / period) * Math.PI * 2 + offset) * amplitude;
}

function isoNow(): string {
  return new Date().toISOString();
}

// Generate single MPU sensor data (Gy87 AXL385)
function generateMpuData(baseRoll: number, basePitch: number, isVerticalAxis: boolean = false): MpuSensorData {
  const roll = baseRoll + sinWave(30, 0.4, isVerticalAxis ? 1.5 : 0) + noise(0.08);
  const pitch = basePitch + sinWave(35, 0.35, isVerticalAxis ? 2.0 : 0.5) + noise(0.08);
  const totalTilt = Math.sqrt(roll * roll + pitch * pitch);

  const radRoll = (roll * Math.PI) / 180;
  const radPitch = (pitch * Math.PI) / 180;

  let accelX = Math.sin(radRoll) + noise(0.01);
  let accelY = Math.sin(radPitch) + noise(0.01);
  let accelZ = Math.cos(Math.max(Math.abs(radRoll), Math.abs(radPitch))) * 9.81 + noise(0.03);

  if (isVerticalAxis) {
    const tmp = accelX;
    accelX = accelZ;
    accelZ = tmp;
  }

  return {
    rollDeg: Math.round(roll * 100) / 100,
    pitchDeg: Math.round(pitch * 100) / 100,
    totalTiltDeg: Math.round(totalTilt * 100) / 100,
    accelX: Math.round(accelX * 1000) / 1000,
    accelY: Math.round(accelY * 1000) / 1000,
    accelZ: Math.round(accelZ * 100) / 100,
    gyroX: Math.round(noise(1.8) * 10) / 10,
    gyroY: Math.round(noise(1.8) * 10) / 10,
    gyroZ: Math.round(noise(1.2) * 10) / 10,
  };
}

// ---- Per-Node Live Telemetry Generator ----
export function generateNodeTelemetry(nodeId: string): NodeTelemetry {
  const isNode2 = nodeId === "ESP-NODE-02";
  const isNode3 = nodeId === "ESP-NODE-03";

  // MPU 1: Horizontal plane
  const baseRoll1 = isNode2 ? 3.4 : isNode3 ? 1.8 : 0.6;
  const basePitch1 = isNode2 ? 2.8 : isNode3 ? 1.4 : 0.4;
  const mpu1 = generateMpuData(baseRoll1, basePitch1, false);

  // MPU 2: Vertical plane (perpendicular mounting)
  const baseRoll2 = isNode2 ? 4.1 : isNode3 ? 1.2 : 0.8;
  const basePitch2 = isNode2 ? 3.1 : isNode3 ? 0.9 : 0.5;
  const mpu2 = generateMpuData(baseRoll2, basePitch2, true);

  // Ultrasound sensor (Distance to front wall in cm)
  const baselineCm = 80.0;
  const baseDelta = isNode2 ? 52.0 : isNode3 ? 24.0 : 6.0;
  const deltaCm = Math.max(0, baseDelta + sinWave(40, 2.0) + noise(0.5));
  const currentDistanceCm = clamp(baselineCm - deltaCm, 8.0, 150.0);
  const approachRate = isNode2 ? 1.4 : 0.1;

  // Micro-Vibration sensor
  const vibTriggered = isNode2 || Math.random() < 0.2;
  const vibIntensity = isNode2 ? Math.round(clamp(65 + sinWave(20, 15) + noise(5), 20, 95)) : Math.round(clamp(15 + noise(8), 2, 35));
  const vibEventCount = isNode2 ? 42 + (tick % 8) : 6 + (tick % 3);

  // MQ2 Gas Sensor (ppm)
  const baseGasPpm = isNode2 ? 520 : isNode3 ? 280 : 140;
  const gasPpm = Math.round(clamp(baseGasPpm + sinWave(25, 40) + noise(15), 50, 1200));
  const rawAdc = Math.round((gasPpm / 1200) * 4095);
  const gasStatus: "NORMAL" | "WARNING" | "DANGER" =
    gasPpm >= activeThresholds.gasPpmCritical
      ? "DANGER"
      : gasPpm >= activeThresholds.gasPpmWarning
      ? "WARNING"
      : "NORMAL";

  // Actuators & Alerts
  const isCriticalHazard =
    gasPpm >= activeThresholds.gasPpmCritical ||
    currentDistanceCm <= activeThresholds.wallDistanceMinCriticalCm ||
    mpu1.totalTiltDeg >= activeThresholds.tiltDegCritical ||
    mpu2.totalTiltDeg >= activeThresholds.tiltDegCritical;

  const isWarningHazard =
    !isCriticalHazard &&
    (gasPpm >= activeThresholds.gasPpmWarning ||
      currentDistanceCm <= activeThresholds.wallDistanceMinWarningCm ||
      mpu1.totalTiltDeg >= activeThresholds.tiltDegWarning ||
      mpu2.totalTiltDeg >= activeThresholds.tiltDegWarning ||
      vibIntensity >= activeThresholds.vibrationIntensityThreshold);

  let ledMatrixPattern: LedMatrixPattern = "IDLE";
  let buzzerActive = false;

  if (isCriticalHazard && activeThresholds.autoTriggerActuatorsOnCritical) {
    ledMatrixPattern = "DANGER_FLASH";
    buzzerActive = activeThresholds.buzzerEnabled;
  } else if (isWarningHazard) {
    ledMatrixPattern = "WARNING_PULSE";
    buzzerActive = false;
  } else {
    ledMatrixPattern = "NORMAL_CHECK";
    buzzerActive = false;
  }

  return {
    nodeId,
    timestamp: isoNow(),
    mpu1,
    mpu2,
    ultrasound: {
      distanceCm: Math.round(currentDistanceCm * 10) / 10,
      baselineCm,
      deltaCm: Math.round(deltaCm * 10) / 10,
      approachRateCmPerMin: Math.round(approachRate * 100) / 100,
    },
    vibration: {
      triggered: vibTriggered,
      eventCount: vibEventCount,
      intensity: vibIntensity,
    },
    gas: {
      mq2Ppm: gasPpm,
      rawAdc,
      status: gasStatus,
    },
    actuators: {
      buzzerActive,
      buzzerFrequencyHz: buzzerActive ? 2800 : undefined,
      ledMatrixPattern,
      ledMatrixActive: activeThresholds.ledMatrixEnabled,
    },
  };
}

// ---- All Fleet Nodes Telemetry Map ----
export function generateAllNodesTelemetry(): Record<string, NodeTelemetry> {
  tick++;
  const map: Record<string, NodeTelemetry> = {};
  for (const node of initialFleetData) {
    map[node.id] = generateNodeTelemetry(node.id);
  }
  return map;
}

// ---- Fleet Node Status Generator ----
export function generateEspFleet(telemetryMap?: Record<string, NodeTelemetry>): EspNode[] {
  const telMap = telemetryMap || generateAllNodesTelemetry();

  return initialFleetData.map((node) => {
    const tel = telMap[node.id];
    let riskSeverity: HazardSeverity = "STABLE";
    let status: import("@/types").NodeStatus = "ONLINE";

    if (tel) {
      const isCrit =
        tel.gas.mq2Ppm >= activeThresholds.gasPpmCritical ||
        tel.ultrasound.distanceCm <= activeThresholds.wallDistanceMinCriticalCm ||
        tel.mpu1.totalTiltDeg >= activeThresholds.tiltDegCritical ||
        tel.mpu2.totalTiltDeg >= activeThresholds.tiltDegCritical;

      const isWarn =
        tel.gas.mq2Ppm >= activeThresholds.gasPpmWarning ||
        tel.ultrasound.distanceCm <= activeThresholds.wallDistanceMinWarningCm ||
        tel.mpu1.totalTiltDeg >= activeThresholds.tiltDegWarning ||
        tel.mpu2.totalTiltDeg >= activeThresholds.tiltDegWarning ||
        tel.vibration.intensity >= activeThresholds.vibrationIntensityThreshold;

      if (isCrit) {
        riskSeverity = "CRITICAL";
        status = "CRITICAL";
      } else if (isWarn) {
        riskSeverity = "WATCH";
        status = "WARNING";
      }
    }

    return {
      id: node.id,
      label: node.label,
      location: node.location,
      status,
      riskSeverity,
      ipAddress: node.ipAddress,
      lastSeen: isoNow(),
      firmware: "ESP32-EWS-v3.2.0",
      rssi: -62 + Math.round(noise(4)),
    };
  });
}

// ---- Automatic Threshold & Alarm Engine ----
export function checkAndGenerateAlarms(telemetryMap: Record<string, NodeTelemetry>): Alarm[] {
  const newAlarms: Alarm[] = [];

  for (const [nodeId, tel] of Object.entries(telemetryMap)) {
    const nodeDef = initialFleetData.find((n) => n.id === nodeId);
    const label = nodeDef?.label || nodeId;

    // 1. MQ2 Gas Alarms
    if (tel.gas.mq2Ppm >= activeThresholds.gasPpmCritical) {
      newAlarms.push(
        createAlarm(
          nodeId,
          label,
          "CRITICAL",
          "GAS",
          `${tel.gas.mq2Ppm} ppm`,
          `MQ2 Gas level (${tel.gas.mq2Ppm} ppm) breached critical threshold (${activeThresholds.gasPpmCritical} ppm)`
        )
      );
    } else if (tel.gas.mq2Ppm >= activeThresholds.gasPpmWarning && !hasRecentAlarm(nodeId, "GAS")) {
      newAlarms.push(
        createAlarm(
          nodeId,
          label,
          "WARNING",
          "GAS",
          `${tel.gas.mq2Ppm} ppm`,
          `MQ2 Gas concentration elevated at ${tel.gas.mq2Ppm} ppm`
        )
      );
    }

    // 2. Ultrasound Wall Distance Alarms
    if (tel.ultrasound.distanceCm <= activeThresholds.wallDistanceMinCriticalCm) {
      newAlarms.push(
        createAlarm(
          nodeId,
          label,
          "CRITICAL",
          "WALL_DISTANCE",
          `${tel.ultrasound.distanceCm} cm`,
          `Ultrasound front-wall clearance dropped to critical level (${tel.ultrasound.distanceCm} cm)`
        )
      );
    } else if (
      tel.ultrasound.distanceCm <= activeThresholds.wallDistanceMinWarningCm &&
      !hasRecentAlarm(nodeId, "WALL_DISTANCE")
    ) {
      newAlarms.push(
        createAlarm(
          nodeId,
          label,
          "WARNING",
          "WALL_DISTANCE",
          `${tel.ultrasound.distanceCm} cm`,
          `Front-wall distance approaching warning threshold (${tel.ultrasound.distanceCm} cm)`
        )
      );
    }

    // 3. MPU 1 Tilt (Horizontal)
    if (tel.mpu1.totalTiltDeg >= activeThresholds.tiltDegCritical) {
      newAlarms.push(
        createAlarm(
          nodeId,
          label,
          "CRITICAL",
          "TILT_MPU1",
          `${tel.mpu1.totalTiltDeg}°`,
          `MPU-1 (Horizontal) tilt inclination reached critical angle (${tel.mpu1.totalTiltDeg}°)`
        )
      );
    }

    // 4. MPU 2 Tilt (Vertical / Perpendicular)
    if (tel.mpu2.totalTiltDeg >= activeThresholds.tiltDegCritical) {
      newAlarms.push(
        createAlarm(
          nodeId,
          label,
          "CRITICAL",
          "TILT_MPU2",
          `${tel.mpu2.totalTiltDeg}°`,
          `MPU-2 (Vertical) tilt inclination reached critical angle (${tel.mpu2.totalTiltDeg}°)`
        )
      );
    }

    // 5. Micro-Vibration Alarms
    if (tel.vibration.intensity >= activeThresholds.vibrationIntensityThreshold && !hasRecentAlarm(nodeId, "VIBRATION")) {
      newAlarms.push(
        createAlarm(
          nodeId,
          label,
          "WARNING",
          "VIBRATION",
          `${tel.vibration.intensity}%`,
          `Micro-vibration burst intensity exceeded normal profile`
        )
      );
    }
  }

  newAlarms.forEach((a) => alarmHistory.unshift(a));
  if (alarmHistory.length > 200) alarmHistory.length = 200;

  return newAlarms;
}

function hasRecentAlarm(source: string, category: string): boolean {
  const fiveMinAgo = Date.now() - 300000;
  return alarmHistory.some(
    (a) => a.source === source && a.category === category && a.state === "ACTIVE" && new Date(a.timestamp).getTime() > fiveMinAgo
  );
}

function createAlarm(
  source: string,
  sourceLabel: string,
  severity: AlarmSeverity,
  category: "GAS" | "TILT_MPU1" | "TILT_MPU2" | "WALL_DISTANCE" | "VIBRATION" | "SYSTEM",
  value: string,
  description: string
): Alarm {
  return {
    id: `ALM-${++alarmIdCounter}`,
    timestamp: isoNow(),
    source,
    sourceLabel,
    severity,
    category,
    value,
    description,
    state: "ACTIVE",
  };
}

export function getAlarmHistory(): Alarm[] {
  return alarmHistory;
}

export function acknowledgeAlarm(alarmId: string, notes?: string): void {
  const alarm = alarmHistory.find((a) => a.id === alarmId);
  if (alarm) {
    alarm.state = "ACKNOWLEDGED";
    alarm.acknowledgedBy = "MINE_SAFETY_OFFICER";
    alarm.acknowledgedAt = isoNow();
    alarm.notes = notes;
  }
}

export function updateAlertThresholds(newThresholds: Partial<AlertThresholdConfig>): void {
  activeThresholds = { ...activeThresholds, ...newThresholds };
}

// Generate multi-sensor time-series history
export function generateTelemetryHistory(
  nodeId: string = "ESP-NODE-01",
  points: number = 30
): TelemetryDataPoint[] {
  const data: TelemetryDataPoint[] = [];
  const now = Date.now();
  const isNode2 = nodeId === "ESP-NODE-02";

  for (let i = 0; i < points; i++) {
    const t = now - (points - i) * 60000;
    const progress = i / points;

    const gasVal = isNode2 ? 320 + progress * 210 + Math.sin(i / 3) * 20 : 120 + progress * 20 + noise(5);
    const wallDistVal = isNode2 ? 70 - progress * 42 + Math.sin(i / 4) * 2 : 78 - progress * 5 + noise(0.5);
    const tilt1Val = isNode2 ? 1.5 + progress * 2.1 + Math.sin(i / 5) * 0.2 : 0.6 + noise(0.04);
    const tilt2Val = isNode2 ? 1.8 + progress * 2.4 + Math.sin(i / 5) * 0.25 : 0.8 + noise(0.05);
    const vibVal = isNode2 ? Math.round(35 + progress * 35 + (Math.random() > 0.8 ? 15 : 0)) : Math.round(10 + Math.random() * 10);

    data.push({
      timestamp: new Date(t).toISOString(),
      time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      gasPpm: Math.round(gasVal),
      wallDistanceCm: Math.round(wallDistVal * 10) / 10,
      tiltMpu1: Math.round(tilt1Val * 100) / 100,
      tiltMpu2: Math.round(tilt2Val * 100) / 100,
      vibrationIntensity: vibVal,
    });
  }

  return data;
}
