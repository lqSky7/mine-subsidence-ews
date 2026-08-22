"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type {
  MeshNode,
  NodeTelemetry,
  SubsidencePrediction,
  Alarm,
  MeshDiagnostics,
  AlertThresholdConfig,
} from "@/types";
import {
  generateMeshFleet,
  generateAllNodesTelemetry,
  generateAllPredictions,
  checkAndGenerateAlarms,
  generateMeshDiagnostics,
  getAlarmHistory,
  acknowledgeAlarm as mockAcknowledgeAlarm,
  activeThresholds,
  updateAlertThresholds,
  triggerSimulatedEvent as mockTriggerSimulatedEvent,
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
  nodes: MeshNode[];
  telemetry: Record<string, NodeTelemetry>;
  predictions: Record<string, SubsidencePrediction>;
  alarms: Alarm[];
  recentAlarms: Alarm[];
  diagnostics: MeshDiagnostics | null;
  thresholds: AlertThresholdConfig;
  isConnected: boolean;
  selectedNodeId: string;

  // Selected Node Helpers
  selectedNode: MeshNode | null;
  selectedTelemetry: NodeTelemetry | null;
  selectedPrediction: SubsidencePrediction | null;

  // Actions
  setSelectedNodeId: (id: string) => void;
  acknowledgeAlarm: (alarmId: string, notes?: string) => void;
  setThresholds: (thresholds: Partial<AlertThresholdConfig>) => void;
  triggerFaultSimulation: (type: "SUBSIDENCE_SURGE" | "CRACK_BURST" | "SEISMIC_EVENT") => void;
}

export function useTelemetry(): TelemetryState {
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, NodeTelemetry>>({});
  const [predictions, setPredictions] = useState<Record<string, SubsidencePrediction>>({});
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [recentAlarms, setRecentAlarms] = useState<Alarm[]>([]);
  const [diagnostics, setDiagnostics] = useState<MeshDiagnostics | null>(null);
  const [thresholds, setThresholdsState] = useState<AlertThresholdConfig>(activeThresholds);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("NODE-04");

  const socketRef = useRef<Socket | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback engine setup
  const startFallbackSimulation = useCallback(() => {
    if (fallbackIntervalRef.current) return;
    console.log("Mine EWS Edge Bridge offline. Running client-side geotechnical simulation.");

    // Immediate first tick
    const fleet = generateMeshFleet();
    const telMap = generateAllNodesTelemetry();
    const predMap = generateAllPredictions(telMap);
    setNodes(fleet);
    setTelemetry(telMap);
    setPredictions(predMap);
    setDiagnostics(generateMeshDiagnostics());
    setAlarms(getAlarmHistory());

    fallbackIntervalRef.current = setInterval(() => {
      const liveFleet = generateMeshFleet();
      const liveTelMap = generateAllNodesTelemetry();
      const livePredMap = generateAllPredictions(liveTelMap);
      const liveDiag = generateMeshDiagnostics();

      setNodes(liveFleet);
      setTelemetry(liveTelMap);
      setPredictions(livePredMap);
      setDiagnostics(liveDiag);

      const newAlarms = checkAndGenerateAlarms(liveTelMap, livePredMap);
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
    // 1. Initialize Socket.IO Client connection to RPi4 gateway bridge
    const socket = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      timeout: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Mine Subsidence EWS Gateway bridge.");
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

    // 2. Mesh Telemetry Listeners
    socket.on("mesh_nodes", (data: MeshNode[]) => {
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

    socket.on("subsidence_predictions", (data: Record<string, SubsidencePrediction>) => {
      if (data) setPredictions(data);
    });

    socket.on("mesh_diagnostics", (data: MeshDiagnostics) => {
      if (data) setDiagnostics(data);
    });

    socket.on("alarm_event", (data: Alarm) => {
      setRecentAlarms((prev) => [data, ...prev].slice(0, 10));
      setAlarms((prev) => {
        const exists = prev.some((a) => a.id === data.id);
        if (exists) return prev;
        return [data, ...prev];
      });
    });

    // Initial fallback startup
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
  const handleSetThresholds = useCallback((newThresholds: Partial<AlertThresholdConfig>) => {
    updateAlertThresholds(newThresholds);
    setThresholdsState((prev) => ({ ...prev, ...newThresholds }));
    if (isConnected && socketRef.current) {
      socketRef.current.emit("update_thresholds", newThresholds);
    }
  }, [isConnected]);

  // Trigger Fault Simulation
  const handleTriggerFaultSimulation = useCallback(
    (type: "SUBSIDENCE_SURGE" | "CRACK_BURST" | "SEISMIC_EVENT") => {
      mockTriggerSimulatedEvent(type);
    },
    []
  );

  // Derived selected node data
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  const selectedTelemetry = telemetry[selectedNodeId] || (selectedNode ? telemetry[selectedNode.id] : null) || null;
  const selectedPrediction = predictions[selectedNodeId] || (selectedNode ? predictions[selectedNode.id] : null) || null;

  return {
    nodes,
    telemetry,
    predictions,
    alarms,
    recentAlarms,
    diagnostics,
    thresholds,
    isConnected,
    selectedNodeId,
    selectedNode,
    selectedTelemetry,
    selectedPrediction,
    setSelectedNodeId,
    acknowledgeAlarm: handleAcknowledgeAlarm,
    setThresholds: handleSetThresholds,
    triggerFaultSimulation: handleTriggerFaultSimulation,
  };
}

