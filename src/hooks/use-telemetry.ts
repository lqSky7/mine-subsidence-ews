"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type {
  EspNode,
  NodeTelemetry,
  Alarm,
  AlertThresholdConfig,
  LedMatrixPattern,
} from "@/types";
import {
  generateEspFleet,
  generateAllNodesTelemetry,
  checkAndGenerateAlarms,
  getAlarmHistory,
  acknowledgeAlarm as mockAcknowledgeAlarm,
  activeThresholds,
  updateAlertThresholds,
} from "@/data/mock-engine";

const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:3003`;
    }
  }
  return "http://localhost:3003";
};

const BACKEND_URL = getBackendUrl();
const POLL_INTERVAL = 1000;

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
  acknowledgeAlarm: (alarmId: string, notes?: string) => void;
  setThresholds: (thresholds: Partial<AlertThresholdConfig>) => void;
  triggerActuatorTest: (actuator: "buzzer" | "ledMatrix", pattern?: LedMatrixPattern) => void;
}

export function useTelemetry(): TelemetryState {
  const [nodes, setNodes] = useState<EspNode[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, NodeTelemetry>>({});
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [recentAlarms, setRecentAlarms] = useState<Alarm[]>([]);
  const [thresholds, setThresholdsState] = useState<AlertThresholdConfig>(activeThresholds);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ESP-NODE-01");

  const socketRef = useRef<Socket | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback simulator engine
  const startFallbackSimulation = useCallback(() => {
    if (fallbackIntervalRef.current) return;

    // Immediate first tick
    const telMap = generateAllNodesTelemetry();
    const fleet = generateEspFleet(telMap);
    setNodes(fleet);
    setTelemetry(telMap);
    setAlarms(getAlarmHistory());

    fallbackIntervalRef.current = setInterval(() => {
      const liveTelMap = generateAllNodesTelemetry();
      const liveFleet = generateEspFleet(liveTelMap);

      setNodes(liveFleet);
      setTelemetry(liveTelMap);

      const newAlarms = checkAndGenerateAlarms(liveTelMap);
      if (newAlarms.length > 0) {
        setRecentAlarms((prev) => [...newAlarms, ...prev].slice(0, 10));
      }
      setAlarms([...getAlarmHistory()]);
    }, POLL_INTERVAL);
  }, []);

  const stopFallbackSimulation = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // 1. Initialize Socket.IO Client connection
    const socket = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      timeout: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      stopFallbackSimulation();
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
      startFallbackSimulation();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      startFallbackSimulation();
    });

    // 2. Telemetry Listeners
    socket.on("nodes", (data: EspNode[]) => {
      if (Array.isArray(data)) setNodes(data);
    });

    socket.on("node_telemetry", (data: NodeTelemetry) => {
      if (data && data.nodeId) {
        setTelemetry((prev) => ({ ...prev, [data.nodeId]: data }));
      }
    });

    socket.on("all_telemetry", (data: Record<string, NodeTelemetry>) => {
      if (data) setTelemetry(data);
    });

    socket.on("alarm_event", (data: Alarm) => {
      setRecentAlarms((prev) => [data, ...prev].slice(0, 10));
      setAlarms((prev) => {
        const exists = prev.some((a) => a.id === data.id);
        if (exists) return prev;
        return [data, ...prev];
      });
    });

    startFallbackSimulation();

    return () => {
      socket.close();
      stopFallbackSimulation();
    };
  }, [startFallbackSimulation, stopFallbackSimulation]);

  // Acknowledge Alarm Handler
  const handleAcknowledgeAlarm = useCallback(
    (alarmId: string, notes?: string) => {
      if (isConnected && socketRef.current) {
        socketRef.current.emit("acknowledge_alarm", { alarmId, notes });
      }
      mockAcknowledgeAlarm(alarmId, notes);
      setAlarms([...getAlarmHistory()]);
    },
    [isConnected]
  );

  // Update Thresholds Handler
  const handleSetThresholds = useCallback(
    (newThresholds: Partial<AlertThresholdConfig>) => {
      updateAlertThresholds(newThresholds);
      setThresholdsState((prev) => ({ ...prev, ...newThresholds }));
      if (isConnected && socketRef.current) {
        socketRef.current.emit("update_thresholds", newThresholds);
      }
    },
    [isConnected]
  );

  // Actuator Test Trigger
  const handleTriggerActuatorTest = useCallback(
    (actuator: "buzzer" | "ledMatrix", pattern?: LedMatrixPattern) => {
      if (isConnected && socketRef.current) {
        socketRef.current.emit("actuator_test", { actuator, pattern, nodeId: selectedNodeId });
      }
      setTelemetry((prev) => {
        const nodeTel = prev[selectedNodeId];
        if (!nodeTel) return prev;
        return {
          ...prev,
          [selectedNodeId]: {
            ...nodeTel,
            actuators: {
              ...nodeTel.actuators,
              buzzerActive: actuator === "buzzer" ? !nodeTel.actuators.buzzerActive : nodeTel.actuators.buzzerActive,
              ledMatrixPattern: pattern || (actuator === "ledMatrix" ? "DANGER_FLASH" : nodeTel.actuators.ledMatrixPattern),
            },
          },
        };
      });
    },
    [isConnected, selectedNodeId]
  );

  // Derived selected node data
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  const selectedTelemetry = telemetry[selectedNodeId] || (selectedNode ? telemetry[selectedNode.id] : null) || null;

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
  };
}
