/**
 * Mock Data & Geotechnical Subsidence Simulation Engine
 * Indigenous Mine Subsidence Early Warning System (EWS)
 * Simulates localized wireless surface mesh sensor nodes over underground coal mine panels.
 */

import type {
  MeshNode,
  NodeTelemetry,
  SubsidencePrediction,
  Alarm,
  AlarmSeverity,
  MeshDiagnostics,
  AlertThresholdConfig,
  TelemetryDataPoint,
  HazardSeverity,
} from "@/types";

// ---- Global Simulation State ----
let tick = 0;
let simulationSpeed = 1;
let simulatedEventActive: "NONE" | "SUBSIDENCE_SURGE" | "CRACK_BURST" | "SEISMIC_EVENT" = "NONE";
let simulatedEventTicks = 0;

// Configurable Alert Thresholds
export let activeThresholds: AlertThresholdConfig = {
  tiltDegWarning: 2.0,
  tiltDegCritical: 4.5,
  displacementMmWarning: 10.0,
  displacementMmCritical: 25.0,
  vibrationCountThreshold: 10,
  crackWidthMmWarning: 1.5,
  crackWidthMmCritical: 4.0,
  batteryLowVoltage: 3.4,
  notificationChannels: {
    sms: true,
    email: true,
    sound: true,
    webhook: false,
  },
};

const alarmHistory: Alarm[] = [];
let alarmIdCounter = 1000;

// ---- Fixed Base Fleet Topology across Mine Panel 4A / 4B ----
const initialFleetData: Array<{
  id: string;
  label: string;
  panelId: string;
  gridX: number;
  gridY: number;
  lat: number;
  lng: number;
  elevationMeters: number;
  hops: number;
  parentHopId?: string;
  isSubsidenceZone: boolean;
}> = [
  { id: "NODE-01", label: "Panel 4A — North Pillar", panelId: "PANEL-4A", gridX: 20, gridY: 20, lat: 23.7845, lng: 86.4182, elevationMeters: 215.4, hops: 1, isSubsidenceZone: false },
  { id: "NODE-02", label: "Panel 4A — NW Boundary", panelId: "PANEL-4A", gridX: 45, gridY: 18, lat: 23.7852, lng: 86.4195, elevationMeters: 216.1, hops: 1, isSubsidenceZone: false },
  { id: "NODE-03", label: "Panel 4A — Extraction Face", panelId: "PANEL-4A", gridX: 35, gridY: 48, lat: 23.7831, lng: 86.4190, elevationMeters: 212.8, hops: 1, isSubsidenceZone: true },
  { id: "NODE-04", label: "Panel 4A — Central Trough", panelId: "PANEL-4A", gridX: 55, gridY: 52, lat: 23.7828, lng: 86.4208, elevationMeters: 210.5, hops: 2, parentHopId: "NODE-03", isSubsidenceZone: true },
  { id: "NODE-05", label: "Panel 4A — South Barrier", panelId: "PANEL-4A", gridX: 75, gridY: 35, lat: 23.7840, lng: 86.4225, elevationMeters: 217.3, hops: 2, parentHopId: "NODE-02", isSubsidenceZone: false },
  { id: "NODE-06", label: "Panel 4B — Overburden East", panelId: "PANEL-4B", gridX: 85, gridY: 65, lat: 23.7820, lng: 86.4240, elevationMeters: 218.0, hops: 3, parentHopId: "NODE-05", isSubsidenceZone: false },
  { id: "NODE-07", label: "Panel 4A — Goaf Perimeter", panelId: "PANEL-4A", gridX: 40, gridY: 78, lat: 23.7812, lng: 86.4196, elevationMeters: 211.9, hops: 2, parentHopId: "NODE-03", isSubsidenceZone: true },
  { id: "NODE-08", label: "Panel 4B — SE Outlier", panelId: "PANEL-4B", gridX: 70, gridY: 82, lat: 23.7808, lng: 86.4230, elevationMeters: 215.7, hops: 3, parentHopId: "NODE-07", isSubsidenceZone: false },
];

// ---- Math Utilities ----
function noise(amplitude: number): number {
  return (Math.random() - 0.5) * 2 * amplitude;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sinWave(period: number, amplitude: number, offset: number = 0): number {
  return Math.sin(((tick * simulationSpeed) / period) * Math.PI * 2 + offset) * amplitude;
}

function isoNow(): string {
  return new Date().toISOString();
}

// ---- Live Fleet Generator ----
export function generateMeshFleet(): MeshNode[] {
  return initialFleetData.map((node) => {
    // Determine risk status based on subsidence progression in active zones
    let riskSeverity: HazardSeverity = "STABLE";
    let status: import("@/types").NodeStatus = "ONLINE";

    if (node.isSubsidenceZone) {
      if (node.id === "NODE-04") {
        riskSeverity = simulatedEventActive !== "NONE" ? "CRITICAL" : "WATCH";
      } else if (node.id === "NODE-03") {
        riskSeverity = simulatedEventActive === "SUBSIDENCE_SURGE" || simulatedEventActive === "SEISMIC_EVENT" ? "CRITICAL" : "WATCH";
      } else if (node.id === "NODE-07") {
        riskSeverity = simulatedEventActive !== "NONE" ? "WATCH" : "STABLE";
      }
    }

    if (riskSeverity === "CRITICAL") status = "CRITICAL";
    else if (riskSeverity === "WATCH") status = "WARNING";

    // Battery voltage simulation (3.7V nominal, slight solar charge cycle)
    const solarFactor = Math.max(0, sinWave(300, 0.4, 0.5));
    const baseVoltage = 3.85 - (node.hops * 0.05) + solarFactor * 0.25 + noise(0.02);
    const voltage = clamp(baseVoltage, 3.3, 4.2);
    const percentage = Math.round(((voltage - 3.3) / 0.9) * 100);

    // LoRa link metrics
    const baseRssi = -70 - (node.hops * 7) + noise(2);
    const baseSnr = 10.5 - (node.hops * 1.5) + noise(0.5);

    return {
      id: node.id,
      label: node.label,
      panelId: node.panelId,
      status,
      riskSeverity,
      position: {
        gridX: node.gridX,
        gridY: node.gridY,
        elevationMeters: Math.round((node.elevationMeters - (node.isSubsidenceZone ? 0.015 * (tick % 100) : 0)) * 10) / 10,
        lat: node.lat,
        lng: node.lng,
      },
      lastSeen: isoNow(),
      firmware: "ESP32-MESH-v2.1.0",
      battery: {
        voltage: Math.round(voltage * 100) / 100,
        percentage: clamp(percentage, 10, 100),
        chargeState: solarFactor > 0.1 ? "CHARGING" : percentage < 20 ? "LOW" : "DISCHARGING",
        solarCurrentMa: solarFactor > 0.1 ? Math.round(solarFactor * 85) : 0,
      },
      link: {
        rssi: Math.round(baseRssi),
        snr: Math.round(baseSnr * 10) / 10,
        packetLoss: Math.round((0.1 * node.hops + Math.max(0, noise(0.2))) * 10) / 10,
        hops: node.hops,
        parentHopId: node.parentHopId,
      },
    };
  });
}

// ---- Per-Node Telemetry Generator ----
export function generateNodeTelemetry(nodeId: string): NodeTelemetry {
  const nodeDef = initialFleetData.find((n) => n.id === nodeId) || initialFleetData[0];
  const isTargetZone = nodeDef.isSubsidenceZone;

  // Base ground stability vs Subsidence zone drift
  let baseTilt = isTargetZone ? 2.4 : 0.25;
  let baseDispMm = isTargetZone ? 14.5 : 1.2;
  let baseCrackWidth = isTargetZone ? 1.8 : 0.0;
  let vibTriggerCount = isTargetZone ? 8 : 1;

  if (nodeDef.id === "NODE-04") {
    baseTilt = 4.8;
    baseDispMm = 28.6;
    baseCrackWidth = 3.9;
    vibTriggerCount = 22;
  }

  // Active interactive event escalation
  if (simulatedEventActive === "SUBSIDENCE_SURGE" && isTargetZone) {
    baseTilt += 2.2;
    baseDispMm += 16.0;
    baseCrackWidth += 2.1;
  } else if (simulatedEventActive === "CRACK_BURST" && isTargetZone) {
    baseCrackWidth += 3.5;
    baseTilt += 1.5;
  } else if (simulatedEventActive === "SEISMIC_EVENT") {
    vibTriggerCount += 35;
    baseTilt += 0.8;
  }

  // MPU6050 Accelerometer / Tilt math
  const roll = baseTilt + sinWave(40, 0.3) + noise(0.08);
  const pitch = (baseTilt * 0.8) + sinWave(45, 0.25) + noise(0.08);
  const totalTilt = Math.sqrt(roll * roll + pitch * pitch);

  // Accel vector (1G total vector)
  const radRoll = (roll * Math.PI) / 180;
  const radPitch = (pitch * Math.PI) / 180;
  const accelX = Math.sin(radRoll) + noise(0.005);
  const accelY = Math.sin(radPitch) + noise(0.005);
  const accelZ = Math.cos(Math.max(radRoll, radPitch)) * 9.81 + noise(0.02);

  // HC-SR04 displacement sensor
  const baselineCm = 50.0;
  const currentDeltaMm = Math.max(0, baseDispMm + sinWave(60, 0.6) + noise(0.15));
  const distanceCm = baselineCm + (currentDeltaMm / 10.0);
  const rateMmPerHour = isTargetZone ? (0.4 + (baseDispMm > 20 ? 0.8 : 0.1) + noise(0.05)) : 0.02;

  // SW420 Vibration Switch
  const isVibTriggered = (isTargetZone && Math.random() < 0.35) || simulatedEventActive === "SEISMIC_EVENT";
  const vibIntensity = isTargetZone ? clamp(35 + (baseTilt * 8) + noise(5), 5, 100) : clamp(8 + noise(3), 2, 20);

  // Crack Sensor
  const crackDetected = baseCrackWidth > 0.5;
  const crackWidth = crackDetected ? Math.max(0.2, baseCrackWidth + sinWave(50, 0.15) + noise(0.05)) : 0.0;

  return {
    nodeId,
    timestamp: isoNow(),
    tilt: {
      rollDeg: Math.round(roll * 100) / 100,
      pitchDeg: Math.round(pitch * 100) / 100,
      totalTiltDeg: Math.round(totalTilt * 100) / 100,
      accelX: Math.round(accelX * 1000) / 1000,
      accelY: Math.round(accelY * 1000) / 1000,
      accelZ: Math.round(accelZ * 100) / 100,
      gyroX: Math.round(noise(1.5) * 10) / 10,
      gyroY: Math.round(noise(1.5) * 10) / 10,
      gyroZ: Math.round(noise(1.0) * 10) / 10,
    },
    vibration: {
      triggered: isVibTriggered,
      eventCount: Math.round(vibTriggerCount + (tick % 5)),
      intensity: Math.round(vibIntensity),
      peakFreqHz: isTargetZone ? 18.5 : 4.2,
    },
    displacement: {
      distanceCm: Math.round(distanceCm * 100) / 100,
      baselineCm,
      deltaMm: Math.round(currentDeltaMm * 10) / 10,
      rateMmPerHour: Math.round(rateMmPerHour * 100) / 100,
    },
    crack: {
      detected: crackDetected,
      widthEstimateMm: Math.round(crackWidth * 10) / 10,
      resistanceOhms: crackDetected ? Math.round(4500 + crackWidth * 1200) : 120,
    },
    environment: {
      ambientTemp: Math.round((31.5 + sinWave(200, 3) + noise(0.4)) * 10) / 10,
      humidity: Math.round((62 + sinWave(250, 8) + noise(1)) * 10) / 10,
    },
  };
}

// ---- All Nodes Telemetry Map Generator ----
export function generateAllNodesTelemetry(): Record<string, NodeTelemetry> {
  tick++;
  if (simulatedEventActive !== "NONE") {
    simulatedEventTicks++;
    if (simulatedEventTicks > 25) {
      simulatedEventActive = "NONE";
      simulatedEventTicks = 0;
    }
  }

  const map: Record<string, NodeTelemetry> = {};
  for (const node of initialFleetData) {
    map[node.id] = generateNodeTelemetry(node.id);
  }
  return map;
}

// ---- Subsidence AI Prediction Generator ----
export function generateSubsidencePrediction(nodeTelemetry: NodeTelemetry): SubsidencePrediction {
  const tilt = nodeTelemetry.tilt.totalTiltDeg;
  const dispMm = nodeTelemetry.displacement.deltaMm;
  const crackMm = nodeTelemetry.crack.widthEstimateMm;
  const vibCount = nodeTelemetry.vibration.eventCount;

  // Calculate Geotechnical Stability Index (100 = safe, 0 = imminent failure)
  let stability = 100.0 - (tilt * 7.5) - (dispMm * 1.4) - (crackMm * 6.5) - (vibCount * 0.4);
  stability = clamp(stability, 8.0, 99.5);

  const isCritical = stability < 55 || tilt > activeThresholds.tiltDegCritical || dispMm > activeThresholds.displacementMmCritical;
  const isWarning = !isCritical && (stability < 80 || tilt > activeThresholds.tiltDegWarning || dispMm > activeThresholds.displacementMmWarning || crackMm > activeThresholds.crackWidthMmWarning);

  const severity: HazardSeverity = isCritical ? "CRITICAL" : isWarning ? "WATCH" : "STABLE";
  const deformationScore = isCritical ? -0.74 : isWarning ? -0.18 : +0.62;

  const factors: string[] = [];
  if (tilt > activeThresholds.tiltDegCritical) {
    factors.push(`Ground tilt (${tilt.toFixed(1)}°) exceeds critical limit of ${activeThresholds.tiltDegCritical}°`);
  } else if (tilt > activeThresholds.tiltDegWarning) {
    factors.push(`Ground inclination (${tilt.toFixed(1)}°) elevated above baseline`);
  }

  if (dispMm > activeThresholds.displacementMmCritical) {
    factors.push(`Vertical displacement (${dispMm.toFixed(1)} mm) exceeds safe envelope`);
  } else if (dispMm > activeThresholds.displacementMmWarning) {
    factors.push(`Ground subsidence progression (+${dispMm.toFixed(1)} mm) detected`);
  }

  if (crackMm > activeThresholds.crackWidthMmWarning) {
    factors.push(`Surface crack initiation/widening (${crackMm.toFixed(1)} mm)`);
  }

  if (vibCount > activeThresholds.vibrationCountThreshold) {
    factors.push(`Micro-seismic vibration burst count elevated (${vibCount} events)`);
  }

  const estimatedTimeToCriticalHours = isCritical ? 14 : isWarning ? 78 : undefined;

  return {
    nodeId: nodeTelemetry.nodeId,
    timestamp: isoNow(),
    stabilityIndex: Math.round(stability * 10) / 10,
    deformationScore: Math.round(deformationScore * 100) / 100,
    isAnomaly: severity !== "STABLE",
    severity,
    factors,
    estimatedTimeToCriticalHours,
    features: {
      total_tilt_deg: tilt,
      tilt_rate_10m: nodeTelemetry.displacement.rateMmPerHour * 0.4,
      disp_delta_mm: dispMm,
      disp_slope_30m: nodeTelemetry.displacement.rateMmPerHour,
      vib_event_count_10m: vibCount,
      crack_width_mm: crackMm,
      battery_v: 3.8,
      link_rssi: -76,
    },
  };
}

// ---- All Predictions Map Generator ----
export function generateAllPredictions(telemetryMap: Record<string, NodeTelemetry>): Record<string, SubsidencePrediction> {
  const predictions: Record<string, SubsidencePrediction> = {};
  for (const [nodeId, tel] of Object.entries(telemetryMap)) {
    predictions[nodeId] = generateSubsidencePrediction(tel);
  }
  return predictions;
}

// ---- Early Warning Alarm Engine ----
export function checkAndGenerateAlarms(
  telemetryMap: Record<string, NodeTelemetry>,
  predictions: Record<string, SubsidencePrediction>
): Alarm[] {
  const newAlarms: Alarm[] = [];

  for (const [nodeId, tel] of Object.entries(telemetryMap)) {
    const nodeDef = initialFleetData.find((n) => n.id === nodeId);
    const label = nodeDef?.label || nodeId;

    // Critical Tilt
    if (tel.tilt.totalTiltDeg >= activeThresholds.tiltDegCritical) {
      newAlarms.push(createAlarm(nodeId, label, "CRITICAL", "TILT", `${tel.tilt.totalTiltDeg}°`, `Ground tilt exceeded critical safe limit of ${activeThresholds.tiltDegCritical}°`));
    } else if (tel.tilt.totalTiltDeg >= activeThresholds.tiltDegWarning && !hasRecentAlarm(nodeId, "TILT")) {
      newAlarms.push(createAlarm(nodeId, label, "WARNING", "TILT", `${tel.tilt.totalTiltDeg}°`, `Ground inclination elevated at ${tel.tilt.totalTiltDeg}°`));
    }

    // Displacement Subsidence
    if (tel.displacement.deltaMm >= activeThresholds.displacementMmCritical) {
      newAlarms.push(createAlarm(nodeId, label, "CRITICAL", "DISPLACEMENT", `+${tel.displacement.deltaMm} mm`, `Severe surface subsidence detected (+${tel.displacement.deltaMm} mm)`));
    } else if (tel.displacement.deltaMm >= activeThresholds.displacementMmWarning && !hasRecentAlarm(nodeId, "DISPLACEMENT")) {
      newAlarms.push(createAlarm(nodeId, label, "WARNING", "DISPLACEMENT", `+${tel.displacement.deltaMm} mm`, `Subsidence threshold warning (+${tel.displacement.deltaMm} mm)`));
    }

    // Crack widening
    if (tel.crack.widthEstimateMm >= activeThresholds.crackWidthMmCritical) {
      newAlarms.push(createAlarm(nodeId, label, "CRITICAL", "CRACK", `${tel.crack.widthEstimateMm} mm`, `Major surface tension fracture detected (${tel.crack.widthEstimateMm} mm)`));
    } else if (tel.crack.widthEstimateMm >= activeThresholds.crackWidthMmWarning && !hasRecentAlarm(nodeId, "CRACK")) {
      newAlarms.push(createAlarm(nodeId, label, "WARNING", "CRACK", `${tel.crack.widthEstimateMm} mm`, `Early crack initiation detected on overburden`));
    }

    // AI Anomaly Alarm
    const pred = predictions[nodeId];
    if (pred && pred.severity === "CRITICAL" && !hasRecentAlarm(nodeId, "AI_PREDICTION")) {
      newAlarms.push(createAlarm(nodeId, label, "CRITICAL", "AI_PREDICTION", `Score: ${pred.deformationScore}`, `AI Early Warning: Multi-parameter subsidence pattern identified`));
    }
  }

  // Prepend new alarms and cap history
  newAlarms.forEach((a) => alarmHistory.unshift(a));
  if (alarmHistory.length > 250) alarmHistory.length = 250;

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
  category: "TILT" | "DISPLACEMENT" | "CRACK" | "VIBRATION" | "BATTERY" | "NETWORK" | "AI_PREDICTION",
  value: string,
  description: string
): Alarm {
  return {
    id: `EWS-${++alarmIdCounter}`,
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
  // Pre-seed some realistic historical alarms if empty
  if (alarmHistory.length === 0) {
    alarmHistory.push(
      {
        id: "EWS-0997",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        source: "NODE-04",
        sourceLabel: "Panel 4A — Central Trough",
        severity: "CRITICAL",
        category: "DISPLACEMENT",
        value: "+26.2 mm",
        description: "Vertical ground displacement surpassed 25 mm safe tolerance",
        state: "ACTIVE",
      },
      {
        id: "EWS-0998",
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        source: "NODE-04",
        sourceLabel: "Panel 4A — Central Trough",
        severity: "WARNING",
        category: "TILT",
        value: "3.8°",
        description: "Ground inclination elevated along main fault line",
        state: "ACKNOWLEDGED",
        acknowledgedBy: "SAFETY_OFFICER_01",
        acknowledgedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        notes: "Field survey team dispatched to inspect overburden benchmarks.",
      },
      {
        id: "EWS-0999",
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        source: "NODE-03",
        sourceLabel: "Panel 4A — Extraction Face",
        severity: "WARNING",
        category: "CRACK",
        value: "2.1 mm",
        description: "Early crack initiation detected on overburden",
        state: "RESOLVED",
        resolvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    );
  }
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

// ---- Mesh Diagnostics Generator ----
export function generateMeshDiagnostics(): MeshDiagnostics {
  const total = 14500 + tick * 4;
  const crc = Math.floor(total * 0.001) + Math.round(noise(1));
  const lost = Math.floor(total * 0.003) + Math.round(noise(2));
  const successful = total - crc - lost;

  return {
    gatewayId: "RPI4-MESH-GW-01",
    gatewayStatus: "ONLINE",
    ipAddress: "192.168.4.1",
    totalPackets: total,
    successfulPackets: successful,
    packetLossRate: Math.round(((lost + crc) / total) * 1000) / 10,
    crcErrors: Math.max(0, crc),
    avgHopCount: 1.75,
    activeRoutes: 8,
    meshDutyCyclePercent: 4.8,
    lastSyncTime: isoNow(),
  };
}

// ---- Telemetry History Generator ----
export function generateTelemetryHistory(
  variable: "displacement" | "tilt" | "vibration" | "crack",
  nodeId: string = "NODE-04",
  points: number = 60
): TelemetryDataPoint[] {
  const data: TelemetryDataPoint[] = [];
  const now = Date.now();
  const isSubsidence = nodeId === "NODE-04" || nodeId === "NODE-03";

  for (let i = 0; i < points; i++) {
    const t = now - (points - i) * 60000; // 1 minute per point
    const progress = i / points;

    let val = 0;
    if (variable === "displacement") {
      val = isSubsidence ? 12.0 + (progress * 16.0) + Math.sin(i / 5) * 0.8 + noise(0.2) : 1.0 + noise(0.1);
    } else if (variable === "tilt") {
      val = isSubsidence ? 1.5 + (progress * 3.2) + Math.sin(i / 6) * 0.3 + noise(0.05) : 0.3 + noise(0.04);
    } else if (variable === "vibration") {
      val = isSubsidence ? Math.floor(4 + (progress * 18) + (Math.random() > 0.8 ? 8 : 0)) : Math.floor(1 + Math.random() * 2);
    } else if (variable === "crack") {
      val = isSubsidence ? Math.max(0, 0.4 + (progress * 3.4) + noise(0.1)) : 0;
    }

    data.push({
      timestamp: new Date(t).toISOString(),
      time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: Math.round(val * 100) / 100,
    });
  }

  return data;
}

// ---- Interactive Fault Simulator Actions ----
export function triggerSimulatedEvent(type: "SUBSIDENCE_SURGE" | "CRACK_BURST" | "SEISMIC_EVENT"): void {
  simulatedEventActive = type;
  simulatedEventTicks = 0;
}

export function updateAlertThresholds(newThresholds: Partial<AlertThresholdConfig>): void {
  activeThresholds = { ...activeThresholds, ...newThresholds };
}

