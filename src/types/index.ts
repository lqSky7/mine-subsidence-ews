// ============================================================
// Indigenous Mine Subsidence Early Warning System (EWS)
// Shared Type Definitions for Wireless Surface Mesh Platform
// ============================================================

export type NodeStatus = "ONLINE" | "WARNING" | "OFFLINE" | "CRITICAL";
export type HazardSeverity = "STABLE" | "WATCH" | "CRITICAL";
export type AlarmSeverity = "CRITICAL" | "WARNING" | "INFO";
export type AlarmState = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
export type UserRole = "ADMIN" | "SAFETY_OFFICER" | "MINING_ENGINEER" | "OPERATOR" | "VIEWER";

// ---- Mesh Node Entity ----
export interface MeshNode {
  id: string; // e.g. "NODE-01"
  label: string; // e.g. "Panel 4A — North Zone"
  panelId: string; // e.g. "PANEL-4A"
  status: NodeStatus;
  riskSeverity: HazardSeverity;
  position: {
    gridX: number; // 0 to 100 on surface schematic
    gridY: number; // 0 to 100 on surface schematic
    elevationMeters?: number;
    lat?: number;
    lng?: number;
  };
  lastSeen: string;
  firmware: string;
  battery: {
    voltage: number; // 3.3V to 4.2V
    percentage: number; // 0 to 100%
    chargeState: "CHARGING" | "DISCHARGING" | "LOW";
    solarCurrentMa?: number;
  };
  link: {
    rssi: number; // dBm (e.g. -78)
    snr: number; // dB (e.g. 9.2)
    packetLoss: number; // % (e.g. 0.2)
    hops: number; // 1 = direct to RPi4 gateway, 2+ = multi-hop mesh
    parentHopId?: string; // ID of upstream mesh repeater node
  };
}

// ---- Live Node Sensor Telemetry ----
export interface NodeTelemetry {
  nodeId: string;
  timestamp: string;
  tilt: {
    rollDeg: number;
    pitchDeg: number;
    totalTiltDeg: number;
    accelX: number;
    accelY: number;
    accelZ: number;
    gyroX: number;
    gyroY: number;
    gyroZ: number;
  };
  vibration: {
    triggered: boolean;
    eventCount: number;
    intensity: number; // 0 to 100 normalized
    peakFreqHz?: number;
  };
  displacement: {
    distanceCm: number;
    baselineCm: number;
    deltaMm: number; // positive = ground subsidence / dropping
    rateMmPerHour: number;
  };
  crack: {
    detected: boolean;
    widthEstimateMm: number;
    resistanceOhms?: number;
  };
  environment: {
    ambientTemp: number;
    humidity: number;
  };
}

// ---- AI/ML Subsidence Risk Prediction ----
export interface SubsidencePrediction {
  nodeId: string;
  timestamp: string;
  stabilityIndex: number; // 0 (imminent collapse) to 100% (fully stable)
  deformationScore: number; // -1.0 (severe anomaly) to +1.0 (nominal baseline)
  isAnomaly: boolean;
  severity: HazardSeverity;
  factors: string[]; // e.g. ["Tilt angle rate > 0.4°/hr", "Displacement +14.2mm"]
  estimatedTimeToCriticalHours?: number; // Estimated hours before exceeding safe subsidence envelope
  features?: {
    total_tilt_deg?: number;
    tilt_rate_10m?: number;
    disp_delta_mm?: number;
    disp_slope_30m?: number;
    vib_event_count_10m?: number;
    crack_width_mm?: number;
    battery_v?: number;
    link_rssi?: number;
  };
}

// ---- Early Warning Alarm ----
export interface Alarm {
  id: string;
  timestamp: string;
  source: string; // e.g. "NODE-03"
  sourceLabel: string;
  severity: AlarmSeverity;
  category: "TILT" | "DISPLACEMENT" | "CRACK" | "VIBRATION" | "BATTERY" | "NETWORK" | "AI_PREDICTION";
  value: string;
  description: string;
  state: AlarmState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
}

// ---- Mesh Network Diagnostics ----
export interface MeshDiagnostics {
  gatewayId: string;
  gatewayStatus: "ONLINE" | "OFFLINE";
  ipAddress: string;
  totalPackets: number;
  successfulPackets: number;
  packetLossRate: number;
  crcErrors: number;
  avgHopCount: number;
  activeRoutes: number;
  meshDutyCyclePercent: number;
  lastSyncTime: string;
}

// ---- Safety Alert Thresholds ----
export interface AlertThresholdConfig {
  tiltDegWarning: number; // default 2.0°
  tiltDegCritical: number; // default 4.5°
  displacementMmWarning: number; // default 10.0 mm
  displacementMmCritical: number; // default 25.0 mm
  vibrationCountThreshold: number; // default 10 events / 10m
  crackWidthMmWarning: number; // default 1.5 mm
  crackWidthMmCritical: number; // default 4.0 mm
  batteryLowVoltage: number; // default 3.4 V
  notificationChannels: {
    sms: boolean;
    email: boolean;
    sound: boolean;
    webhook: boolean;
  };
}

// ---- Telemetry History Point ----
export interface TelemetryDataPoint {
  timestamp: string;
  [key: string]: string | number | undefined;
}

// ---- User / Auth ----
export interface User {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
}
