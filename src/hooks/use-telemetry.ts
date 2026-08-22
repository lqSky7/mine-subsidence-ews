"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type {
  EspNode,
  NodeTelemetry,
  Alarm,
  AlertThresholdConfig,
  LedMatrixPattern,
  TelemetryDataPoint,
  MineHealthScore,
  MinePhoto,
  AnomalyModelStatus,
  AlarmSeverity,
} from "@/types";

const defaultThresholds: AlertThresholdConfig = {
  gasPpmWarning: 450,
  gasPpmCritical: 700,
  wallDistanceMinWarningCm: 2.5,
  wallDistanceMinCriticalCm: 1.5,
  tiltDegWarning: 14,
  tiltDegCritical: 18,
  vibrationIntensityThreshold: 60,
  tempCWarning: 38,
  tempCCritical: 45,
  buzzerEnabled: true,
  ledMatrixEnabled: true,
  autoTriggerActuatorsOnCritical: true,
  alertEmailsEnabled: true,
};

const DEFAULT_REMOTE_BACKEND = "https://commute-overrule-employer.ngrok-free.dev";

const getBackendApiUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000/api/v1";
    }
  }
  return `${DEFAULT_REMOTE_BACKEND}/api/v1`;
};

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000";
    }
  }
  return DEFAULT_REMOTE_BACKEND;
};

const API_BASE = getBackendApiUrl();
const SOCKET_BASE = getSocketUrl();
const POLL_INTERVAL_MS = 2500;

const DEFAULT_FETCH_HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "1",
  "Accept": "application/json",
};

export interface TelemetryState {
  nodes: EspNode[];
  telemetry: Record<string, NodeTelemetry>;
  alarms: Alarm[];
  recentAlarms: Alarm[];
  thresholds: AlertThresholdConfig;
  mineHealth: MineHealthScore | null;
  anomalyModel: AnomalyModelStatus | null;
  photos: MinePhoto[];
  isConnected: boolean;
  selectedNodeId: string;

  // Selected Node Helpers
  selectedNode: EspNode | null;
  selectedTelemetry: NodeTelemetry | null;

  // Actions
  setSelectedNodeId: (id: string) => void;
  acknowledgeAlarm: (alarmId: string, officerName?: string, notes?: string) => Promise<void>;
  resolveAlarm: (alarmId: string, officerName?: string, notes?: string) => Promise<void>;
  resolveActiveAlarms: (officerName?: string, notes?: string, nodeId?: string) => Promise<void>;
  raiseManualAlarm: (
    nodeId: string,
    description: string,
    severity?: AlarmSeverity,
    issuedBy?: string,
    nodeLabel?: string
  ) => Promise<{ alarm: Alarm } | null>;
  setThresholds: (thresholds: Partial<AlertThresholdConfig>) => Promise<void>;
  triggerActuatorTest: (actuator: "buzzer" | "ledMatrix", pattern?: LedMatrixPattern) => Promise<void>;
  fetchNodeHistory: (nodeId: string, points?: number) => Promise<TelemetryDataPoint[]>;
  fetchHealthHistory: (limit?: number) => Promise<MineHealthScore[]>;
  fetchPhotos: (limit?: number) => Promise<MinePhoto[]>;
  ingestPhoto: (input: {
    title: string;
    nodeId?: string;
    location?: string;
    category?: MinePhoto["category"];
    metadata?: Record<string, unknown>;
  }) => Promise<MinePhoto | null>;
  uploadPhoto: (formData: FormData) => Promise<MinePhoto | null>;
  toggleEmailKillSwitch: (enabled: boolean) => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

export function useTelemetry(): TelemetryState {
  const [nodes, setNodes] = useState<EspNode[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, NodeTelemetry>>({});
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [recentAlarms, setRecentAlarms] = useState<Alarm[]>([]);
  const [thresholds, setThresholdsState] = useState<AlertThresholdConfig>(defaultThresholds);
  const [mineHealth, setMineHealth] = useState<MineHealthScore | null>(null);
  const [anomalyModel, setAnomalyModel] = useState<AnomalyModelStatus | null>(null);
  const [photos, setPhotos] = useState<MinePhoto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ESP-NODE-01");

  const socketRef = useRef<Socket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll backend REST endpoints for live real data
  const pollBackendData = useCallback(async () => {
    try {
      // 1. Fetch nodes
      const nodesRes = await fetch(`${API_BASE}/nodes`, {
        headers: DEFAULT_FETCH_HEADERS,
        cache: "no-store",
      });
      if (nodesRes.ok) {
        const json = await nodesRes.json();
        if (json.ok && Array.isArray(json.data)) {
          setNodes(json.data);
          setIsConnected(true);
        }
      }

      // 2. Fetch live telemetry
      const telRes = await fetch(`${API_BASE}/telemetry/live`, {
        headers: DEFAULT_FETCH_HEADERS,
        cache: "no-store",
      });
      if (telRes.ok) {
        const json = await telRes.json();
        if (json.ok && json.data) {
          setTelemetry(json.data);
        }
      }

      // 3. Fetch active & historical alarms
      const alarmsRes = await fetch(`${API_BASE}/alarms`, {
        headers: DEFAULT_FETCH_HEADERS,
        cache: "no-store",
      });
      if (alarmsRes.ok) {
        const json = await alarmsRes.json();
        if (json.ok && Array.isArray(json.data)) {
          setAlarms(json.data);
          setRecentAlarms(json.data.slice(0, 10));
        }
      }

      // 4. Fetch thresholds
      const threshRes = await fetch(`${API_BASE}/thresholds`, {
        headers: DEFAULT_FETCH_HEADERS,
        cache: "no-store",
      });
      if (threshRes.ok) {
        const json = await threshRes.json();
        if (json.ok && json.data) {
          setThresholdsState(json.data);
        }
      }

      // 5. Fetch AI Mine Health / Heartbeat score
      const healthRes = await fetch(`${API_BASE}/health/mine`, {
        headers: DEFAULT_FETCH_HEADERS,
        cache: "no-store",
      });
      if (healthRes.ok) {
        const json = await healthRes.json();
        if (json.ok && json.data) {
          setMineHealth(json.data);
        }
      }

      const anomalyRes = await fetch(`${API_BASE}/health/anomaly`, {
        headers: DEFAULT_FETCH_HEADERS,
        cache: "no-store",
      });
      if (anomalyRes.ok) {
        const json = await anomalyRes.json();
        if (json.ok && json.data) setAnomalyModel(json.data);
      }

      // 6. Fetch latest photos
      const photosRes = await fetch(`${API_BASE}/photos?limit=20`, {
        headers: DEFAULT_FETCH_HEADERS,
        cache: "no-store",
      });
      if (photosRes.ok) {
        const json = await photosRes.json();
        if (json.ok && Array.isArray(json.data)) {
          setPhotos(json.data);
        }
      }
    } catch {
      // Offline/backend unreachable
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    pollBackendData();

    // Set recurring poll
    pollTimerRef.current = setInterval(pollBackendData, POLL_INTERVAL_MS);

    // Optional Socket.IO realtime connection
    try {
      const socket = io(SOCKET_BASE, {
        reconnectionAttempts: 3,
        timeout: 3000,
        autoConnect: true,
        transports: ["websocket", "polling"],
        extraHeaders: {
          "ngrok-skip-browser-warning": "1",
        },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("connect_error", () => {
        // Fall back gracefully to REST polling without throwing unhandled errors
      });

      socket.on("disconnect", () => {
        // Fall back to polling
      });

      socket.on("node_telemetry", (data: NodeTelemetry) => {
        if (data?.nodeId) {
          setTelemetry((prev) => ({ ...prev, [data.nodeId]: data }));
        }
      });

      socket.on("alarm_event", (alarm: Alarm) => {
        if (alarm?.id) {
          setAlarms((prev) => [alarm, ...prev.filter((a) => a.id !== alarm.id)]);
          setRecentAlarms((prev) => [alarm, ...prev.filter((a) => a.id !== alarm.id)].slice(0, 10));
        }
      });
    } catch {
      // Socket.io initialization non-fatal; polling remains active
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [pollBackendData]);

  // Acknowledge Alarm Handler
  const handleAcknowledgeAlarm = useCallback(
    async (alarmId: string, officerName?: string, notes?: string) => {
      const by = officerName || "CONTROL_ROOM_OPERATOR";
      try {
        const res = await fetch(`${API_BASE}/alarms/${alarmId}/acknowledge`, {
          method: "POST",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ by, notes }),
        });
        if (res.ok) {
          setAlarms((prev) =>
            prev.map((a) =>
              a.id === alarmId
                ? { ...a, state: "ACKNOWLEDGED", acknowledgedBy: by, notes }
                : a
            )
          );
        }
      } catch {
        // network error
      }
    },
    []
  );

  // Resolve Single Alarm Handler
  const handleResolveAlarm = useCallback(
    async (alarmId: string, officerName?: string, notes?: string) => {
      const by = officerName || "CONTROL_ROOM_OPERATOR";
      try {
        const res = await fetch(`${API_BASE}/alarms/${alarmId}/resolve`, {
          method: "POST",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ by, notes }),
        });
        if (res.ok) {
          setAlarms((prev) =>
            prev.map((a) =>
              a.id === alarmId
                ? { ...a, state: "RESOLVED", resolvedBy: by, resolvedAt: new Date().toISOString(), notes }
                : a
            )
          );
          pollBackendData();
        }
      } catch {
        // network error
      }
    },
    [pollBackendData]
  );

  // Mass Resolve All Active Alarms
  const handleResolveActiveAlarms = useCallback(
    async (officerName?: string, notes?: string) => {
      const by = officerName || "CONTROL_ROOM_OPERATOR";
      try {
        const res = await fetch(`${API_BASE}/alarms/resolve-active`, {
          method: "POST",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ by, notes: notes || "Cleared by control room operator" }),
        });
        if (res.ok) {
          setAlarms((prev) =>
            prev.map((a) =>
              a.state === "ACTIVE"
                ? { ...a, state: "RESOLVED", resolvedBy: by, resolvedAt: new Date().toISOString(), notes }
                : a
            )
          );
          pollBackendData();
        }
      } catch {
        // network error
      }
    },
    [pollBackendData]
  );

  // Raise Manual Remote Emergency Alarm
  const handleRaiseManualAlarm = useCallback(
    async (
      nodeId: string,
      description: string,
      severity: AlarmSeverity = "CRITICAL",
      issuedBy: string = "CONTROL_ROOM_OPERATOR",
      nodeLabel?: string
    ) => {
      try {
        const res = await fetch(`${API_BASE}/alarms/manual`, {
          method: "POST",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeId,
            nodeLabel,
            description,
            severity,
            issuedBy,
            category: "MANUAL",
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data?.alarm) {
            setAlarms((prev) => [json.data.alarm, ...prev]);
            pollBackendData();
            return json.data;
          }
        }
      } catch {
        // network error
      }
      return null;
    },
    [pollBackendData]
  );

  // Update Thresholds Handler (using PUT to match backend routes)
  const handleSetThresholds = useCallback(
    async (newThresholds: Partial<AlertThresholdConfig>) => {
      setThresholdsState((prev) => ({ ...prev, ...newThresholds }));
      try {
        await fetch(`${API_BASE}/thresholds`, {
          method: "PUT",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newThresholds),
        });
      } catch {
        // network error
      }
    },
    []
  );

  // Actuator Remote Command
  const handleTriggerActuatorTest = useCallback(
    async (actuator: "buzzer" | "ledMatrix", pattern?: LedMatrixPattern) => {
      try {
        await fetch(`${API_BASE}/commands`, {
          method: "POST",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: actuator === "buzzer" ? "BUZZER_TEST" : "LED_TEST",
            targetNodeId: selectedNodeId,
            issuedBy: "CONTROL_ROOM_OPERATOR",
            payload: { pattern: pattern || "DANGER_FLASH" },
          }),
        });
      } catch {
        // network error
      }
    },
    [selectedNodeId]
  );

  // Fetch real node historical points for graphs
  const handleFetchNodeHistory = useCallback(
    async (nodeId: string, points = 50): Promise<TelemetryDataPoint[]> => {
      try {
        const res = await fetch(`${API_BASE}/telemetry/${nodeId}/history?points=${points}`, {
          headers: DEFAULT_FETCH_HEADERS,
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch {
        // offline
      }
      return [];
    },
    []
  );

  // Fetch Health Score History
  const handleFetchHealthHistory = useCallback(
    async (limit = 30): Promise<MineHealthScore[]> => {
      try {
        const res = await fetch(`${API_BASE}/health/mine/history?limit=${limit}`, {
          headers: DEFAULT_FETCH_HEADERS,
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch {
        // offline
      }
      return [];
    },
    []
  );

  // Fetch Photos
  const handleFetchPhotos = useCallback(
    async (limit = 50): Promise<MinePhoto[]> => {
      try {
        const res = await fetch(`${API_BASE}/photos?limit=${limit}`, {
          headers: DEFAULT_FETCH_HEADERS,
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data)) {
            setPhotos(json.data);
            return json.data;
          }
        }
      } catch {
        // offline
      }
      return [];
    },
    []
  );

  // Ingest Photo
  const handleIngestPhoto = useCallback(
    async (input: {
      title: string;
      nodeId?: string;
      location?: string;
      category?: MinePhoto["category"];
      metadata?: Record<string, unknown>;
    }): Promise<MinePhoto | null> => {
      try {
        const res = await fetch(`${API_BASE}/photos`, {
          method: "POST",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            setPhotos((prev) => [json.data, ...prev]);
            return json.data;
          }
        }
      } catch {
        // offline
      }
      return null;
    },
    []
  );

  // Upload Photo (multipart to S3)
  const handleUploadPhoto = useCallback(
    async (formData: FormData): Promise<MinePhoto | null> => {
      try {
        const res = await fetch(`${API_BASE}/photos/upload`, {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
          body: formData,
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            setPhotos((prev) => [json.data, ...prev]);
            return json.data;
          }
        }
      } catch {
        // offline
      }
      return null;
    },
    []
  );

  // Email Alert Dispatch Kill Switch Handler
  const handleToggleEmailKillSwitch = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      setThresholdsState((prev) => ({ ...prev, alertEmailsEnabled: enabled }));
      try {
        const res = await fetch(`${API_BASE}/mail/kill-switch`, {
          method: "POST",
          headers: {
            ...DEFAULT_FETCH_HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && typeof json.enabled === "boolean") {
            setThresholdsState((prev) => ({ ...prev, alertEmailsEnabled: json.enabled }));
            return json.enabled;
          }
        }
      } catch {
        // network error
      }
      return enabled;
    },
    []
  );

  // Helper to check if data is fresh within the last 30 seconds
  const isFresh = (timestamp?: string | null) => {
    if (!timestamp) return false;
    return Date.now() - new Date(timestamp).getTime() <= 30_000;
  };

  // Filter out any stale telemetry entries older than 30s
  const liveTelemetry: Record<string, NodeTelemetry> = {};
  for (const [id, tel] of Object.entries(telemetry)) {
    if (isFresh(tel?.timestamp)) {
      liveTelemetry[id] = tel;
    }
  }

  // Derive live nodes with 30s offline threshold
  const liveNodes = nodes.map((n) => {
    if (!isFresh(n.lastSeen)) {
      return { ...n, status: "OFFLINE" as const };
    }
    return n;
  });

  // Derived selected node and telemetry
  const selectedNode = liveNodes.find((n) => n.id === selectedNodeId) || liveNodes[0] || null;
  const rawSelectedTelemetry =
    (selectedNode ? liveTelemetry[selectedNode.id] : null) || liveTelemetry[selectedNodeId] || null;
  const selectedTelemetry = isFresh(rawSelectedTelemetry?.timestamp) ? rawSelectedTelemetry : null;
  const activeMineHealth = isFresh(mineHealth?.timestamp) ? mineHealth : null;

  return {
    nodes: liveNodes,
    telemetry: liveTelemetry,
    alarms,
    recentAlarms,
    thresholds,
    mineHealth: activeMineHealth,
    anomalyModel,
    photos,
    isConnected,
    selectedNodeId,
    selectedNode,
    selectedTelemetry,
    setSelectedNodeId,
    acknowledgeAlarm: handleAcknowledgeAlarm,
    resolveAlarm: handleResolveAlarm,
    resolveActiveAlarms: handleResolveActiveAlarms,
    raiseManualAlarm: handleRaiseManualAlarm,
    setThresholds: handleSetThresholds,
    triggerActuatorTest: handleTriggerActuatorTest,
    fetchNodeHistory: handleFetchNodeHistory,
    fetchHealthHistory: handleFetchHealthHistory,
    fetchPhotos: handleFetchPhotos,
    ingestPhoto: handleIngestPhoto,
    uploadPhoto: handleUploadPhoto,
    toggleEmailKillSwitch: handleToggleEmailKillSwitch,
    refreshAll: pollBackendData,
  };
}
