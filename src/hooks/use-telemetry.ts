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
} from "@/types";

const defaultThresholds: AlertThresholdConfig = {
  gasPpmWarning: 400,
  gasPpmCritical: 800,
  wallDistanceMinWarningCm: 35,
  wallDistanceMinCriticalCm: 20,
  tiltDegWarning: 3,
  tiltDegCritical: 7,
  vibrationIntensityThreshold: 60,
  tempCWarning: 38,
  tempCCritical: 45,
  buzzerEnabled: true,
  ledMatrixEnabled: true,
  autoTriggerActuatorsOnCritical: true,
};

const getBackendApiUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:4000/api/v1`;
    }
  }
  return "http://localhost:4000/api/v1";
};

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:4000`;
    }
  }
  return "http://localhost:4000";
};

const API_BASE = getBackendApiUrl();
const SOCKET_BASE = getSocketUrl();
const POLL_INTERVAL_MS = 2000;

export interface TelemetryState {
  nodes: EspNode[];
  telemetry: Record<string, NodeTelemetry>;
  alarms: Alarm[];
  recentAlarms: Alarm[];
  thresholds: AlertThresholdConfig;
  isConnected: boolean;
  selectedNodeId: string;

  // Selected Node Helpers
  selectedNode: EspNode | null;
  selectedTelemetry: NodeTelemetry | null;

  // Actions
  setSelectedNodeId: (id: string) => void;
  acknowledgeAlarm: (alarmId: string, officerName?: string, notes?: string) => Promise<void>;
  setThresholds: (thresholds: Partial<AlertThresholdConfig>) => Promise<void>;
  triggerActuatorTest: (actuator: "buzzer" | "ledMatrix", pattern?: LedMatrixPattern) => Promise<void>;
  fetchNodeHistory: (nodeId: string, points?: number) => Promise<TelemetryDataPoint[]>;
}

export function useTelemetry(): TelemetryState {
  const [nodes, setNodes] = useState<EspNode[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, NodeTelemetry>>({});
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [recentAlarms, setRecentAlarms] = useState<Alarm[]>([]);
  const [thresholds, setThresholdsState] = useState<AlertThresholdConfig>(defaultThresholds);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ESP-NODE-01");

  const socketRef = useRef<Socket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll backend REST endpoints for live real data
  const pollBackendData = useCallback(async () => {
    try {
      // 1. Fetch nodes
      const nodesRes = await fetch(`${API_BASE}/nodes`, { cache: "no-store" });
      if (nodesRes.ok) {
        const json = await nodesRes.json();
        if (json.ok && Array.isArray(json.data)) {
          setNodes(json.data);
          setIsConnected(true);
        }
      }

      // 2. Fetch live telemetry
      const telRes = await fetch(`${API_BASE}/telemetry/live`, { cache: "no-store" });
      if (telRes.ok) {
        const json = await telRes.json();
        if (json.ok && json.data) {
          setTelemetry(json.data);
        }
      }

      // 3. Fetch active alarms
      const alarmsRes = await fetch(`${API_BASE}/alarms`, { cache: "no-store" });
      if (alarmsRes.ok) {
        const json = await alarmsRes.json();
        if (json.ok && Array.isArray(json.data)) {
          setAlarms(json.data);
          setRecentAlarms(json.data.slice(0, 10));
        }
      }

      // 4. Fetch thresholds
      const threshRes = await fetch(`${API_BASE}/thresholds`, { cache: "no-store" });
      if (threshRes.ok) {
        const json = await threshRes.json();
        if (json.ok && json.data) {
          setThresholdsState(json.data);
        }
      }
    } catch {
      // Offline/backend down — do not inject fake data; report disconnected status
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    pollBackendData();

    // Set recurring poll
    pollTimerRef.current = setInterval(pollBackendData, POLL_INTERVAL_MS);

    // Optional Socket.IO realtime connection
    const socket = io(SOCKET_BASE, {
      reconnectionAttempts: 3,
      timeout: 3000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
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

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      socket.close();
    };
  }, [pollBackendData]);

  // Acknowledge Alarm Handler
  const handleAcknowledgeAlarm = useCallback(
    async (alarmId: string, officerName?: string, notes?: string) => {
      const by = officerName || "CONTROL_ROOM_OPERATOR";
      try {
        await fetch(`${API_BASE}/alarms/${alarmId}/acknowledge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ by, notes }),
        });
        setAlarms((prev) =>
          prev.map((a) =>
            a.id === alarmId
              ? { ...a, state: "ACKNOWLEDGED", acknowledgedBy: by, notes }
              : a
          )
        );
      } catch {
        // network error
      }
    },
    []
  );

  // Update Thresholds Handler
  const handleSetThresholds = useCallback(
    async (newThresholds: Partial<AlertThresholdConfig>) => {
      setThresholdsState((prev) => ({ ...prev, ...newThresholds }));
      try {
        await fetch(`${API_BASE}/thresholds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: actuator === "buzzer" ? "BUZZER_TEST" : "LED_TEST",
            targetNodeId: selectedNodeId,
            issuedBy: "OPERATOR",
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

  // Derived selected node and telemetry
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  const selectedTelemetry =
    (selectedNode ? telemetry[selectedNode.id] : null) || telemetry[selectedNodeId] || null;

  return {
    nodes,
    telemetry,
    alarms,
    recentAlarms,
    thresholds,
    isConnected,
    selectedNodeId,
    selectedNode,
    selectedTelemetry,
    setSelectedNodeId,
    acknowledgeAlarm: handleAcknowledgeAlarm,
    setThresholds: handleSetThresholds,
    triggerActuatorTest: handleTriggerActuatorTest,
    fetchNodeHistory: handleFetchNodeHistory,
  };
}
