"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TiltInclinometer3D } from "@/components/industrial/TiltInclinometer3D";
import { LedMatrixDisplay } from "@/components/industrial/LedMatrixDisplay";
import {
  AestheticMiniSparkline,
  AestheticAreaTrendChart,
  SeriesConfig,
} from "@/components/charts";
import type { TelemetryDataPoint } from "@/types";

export default function CommandCenterPage() {
  const {
    nodes,
    telemetry,
    alarms,
    thresholds,
    mineHealth,
    anomalyModel,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    selectedTelemetry,
    triggerActuatorTest,
    acknowledgeAlarm,
    resolveAlarm,
    resolveActiveAlarms,
    raiseManualAlarm,
    fetchNodeHistory,
    isConnected,
  } = useTelemetryContext();

  const node = selectedNode || nodes[0] || null;
  const tel = selectedTelemetry || (node ? telemetry[node.id] : null) || null;

  const activeAlarms = alarms.filter((a) => a.state === "ACTIVE");
  const criticalAlarms = activeAlarms.filter((a) => a.severity === "CRITICAL");
  const hasCriticalHazard = criticalAlarms.length > 0;

  // Manual Alarm Dialog State
  const [isManualAlarmOpen, setIsManualAlarmOpen] = useState(false);
  const [manualNodeId, setManualNodeId] = useState(selectedNodeId || "ESP-NODE-01");
  const [manualDesc, setManualDesc] = useState("");
  const [manualSev, setManualSev] = useState<"CRITICAL" | "WARNING" | "INFO">("CRITICAL");
  const [isRaising, setIsRaising] = useState(false);

  // Real historical data fetched from backend
  const [nodeHistory, setNodeHistory] = useState<TelemetryDataPoint[]>([]);
  const [fleetHistoryMap, setFleetHistoryMap] = useState<Record<string, TelemetryDataPoint[]>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadHistories() {
      if (node?.id) {
        const hist = await fetchNodeHistory(node.id, 20);
        if (isMounted) setNodeHistory(hist);
      }

      // Fetch histories for all registered nodes
      const map: Record<string, TelemetryDataPoint[]> = {};
      for (const n of nodes) {
        const h = await fetchNodeHistory(n.id, 24);
        map[n.id] = h;
      }
      if (isMounted) setFleetHistoryMap(map);
    }

    loadHistories();

    const interval = setInterval(loadHistories, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [node?.id, nodes, fetchNodeHistory]);

  const gasSparkline: number[] = useMemo(
    () => nodeHistory.map((d) => Number(d.gasPpm) || 0).filter((v) => !isNaN(v)),
    [nodeHistory]
  );
  const distSparkline: number[] = useMemo(
    () => nodeHistory.map((d) => Number(d.wallDistanceCm) || 0).filter((v) => !isNaN(v)),
    [nodeHistory]
  );
  const mpu1Sparkline: number[] = useMemo(
    () => nodeHistory.map((d) => Number(d.tiltMpu1) || 0).filter((v) => !isNaN(v)),
    [nodeHistory]
  );
  const mpu2Sparkline: number[] = useMemo(
    () => nodeHistory.map((d) => Number(d.tiltMpu2) || 0).filter((v) => !isNaN(v)),
    [nodeHistory]
  );
  const vibSparkline: number[] = useMemo(
    () => nodeHistory.map((d) => Number(d.vibrationIntensity) || 0).filter((v) => !isNaN(v)),
    [nodeHistory]
  );

  // Dynamic Fleet Series & Stream Data from real backend nodes
  const fleetSeries: SeriesConfig[] = useMemo(() => {
    const palette = ["#F97316", "#E11D48", "#8B5CF6", "#10B981", "#3B82F6", "#EC4899"];
    return nodes.map((n, idx) => ({
      key: n.id,
      name: `${n.id} · ${n.label}`,
      color: palette[idx % palette.length],
      strokeWidth: idx === 0 ? 2.4 : 1.8,
    }));
  }, [nodes]);

  const fleetStreamData = useMemo(() => {
    if (nodes.length === 0) return [];
    const firstNodeHistory = fleetHistoryMap[nodes[0].id] || [];
    return firstNodeHistory.map((pt, idx) => {
      const row: Record<string, string | number | undefined> = {
        time: pt.time || pt.timestamp,
      };
      nodes.forEach((n) => {
        const hist = fleetHistoryMap[n.id] || [];
        row[n.id] = Number(hist[idx]?.gasPpm) || undefined;
      });
      return row;
    });
  }, [nodes, fleetHistoryMap]);

  const handleConfirmManualAlarm = async () => {
    if (!manualDesc.trim()) return;
    setIsRaising(true);
    try {
      const target = nodes.find((n) => n.id === manualNodeId);
      await raiseManualAlarm(manualNodeId, manualDesc.trim(), manualSev, "CONTROL_ROOM_OPERATOR", target?.label);
      setIsManualAlarmOpen(false);
      setManualDesc("");
    } finally {
      setIsRaising(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Header & Station Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Mine Sensor Command Center
            </h1>
            <Badge
              variant={isConnected ? "outline" : "secondary"}
              className={`text-[10px] font-bold ${
                isConnected
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isConnected ? "GATEWAY LIVE" : "OFFLINE / STANDBY"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-Time Multi-Sensor Telemetry & Early Warning Safety System
          </p>
        </div>

        {/* Action Controls & Multi-Node Station Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setIsManualAlarmOpen(true)}
            className="h-8 px-3 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5 shadow-xs"
          >
            <Icon icon="solar:danger-triangle-bold" className="size-3.5" /> Raise Manual Alarm
          </Button>

          {activeAlarms.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => resolveActiveAlarms("Control Room Officer", "Mass hazard resolution")}
              className="h-8 px-3 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 gap-1.5"
            >
              <Icon icon="solar:check-circle-bold-duotone" className="size-3.5 text-emerald-600" /> Clear Active
            </Button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1.5">Station:</span>
            {nodes.length > 0 ? (
              nodes.map((n) => (
                <Button
                  key={n.id}
                  size="sm"
                  variant={selectedNodeId === n.id ? "default" : "ghost"}
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`h-7 px-3 text-xs font-bold rounded-lg ${
                    selectedNodeId === n.id
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {n.id}
                </Button>
              ))
            ) : (
              <div className="text-xs font-medium text-slate-400 px-2 py-0.5">
                No Nodes Online
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Mine Heartbeat & Safety Index Card */}
      {mineHealth && (
        <Link
          href="/dashboard/ai-logs"
          className={`group w-full max-w-xs sm:w-72 md:w-80 min-h-[140px] p-5 rounded-2xl shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer ${
            mineHealth.overallScore >= 75
              ? "bg-emerald-500"
              : mineHealth.overallScore >= 50
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
        >
          {/* Left: Health Number & Active Nodes Count */}
          <div className="flex flex-col justify-between h-full py-0.5">
            <span className="text-5xl font-black text-white tracking-tight tabular-nums leading-none">
              {Math.round(mineHealth.overallScore)}
            </span>
            <span className="mt-4 text-xs font-semibold text-white/90">
              {nodes.filter((n) => n.status !== "OFFLINE").length}{" "}
              {nodes.filter((n) => n.status !== "OFFLINE").length === 1 ? "node active" : "nodes active"}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px bg-white/25 self-stretch my-1 mx-4" />

          {/* Right: Arrow to Live AI Logs */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="size-11 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 group-hover:scale-105 transition-all shadow-xs">
              <Icon icon="solar:arrow-right-linear" className="size-6 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] font-semibold text-white/80 mt-1.5 whitespace-nowrap">
              AI Logs
            </span>
          </div>
        </Link>
      )}

      {tel?.anomaly && (
        <Link
          href="/dashboard/ai-logs"
          className={`block border rounded-2xl px-4 py-3 transition-colors ${
            tel.anomaly.level === "CRITICAL"
              ? "border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
              : tel.anomaly.level === "WATCH"
              ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center">
                <Icon icon="solar:graph-new-up-bold-duotone" className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Baseline anomaly monitor: {tel.anomaly.level}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{tel.anomaly.recommendation}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Anomaly score</p>
                <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{tel.anomaly.score.toFixed(3)}</p>
              </div>
              <div className="max-w-64 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Evidence:</span> {tel.anomaly.contributors.map((item) => item.feature).join(", ") || "Collecting baseline"}
              </div>
              {anomalyModel && <Badge variant="outline" className="text-[10px]">{anomalyModel.baselineSamples} baseline samples</Badge>}
            </div>
          </div>
        </Link>
      )}

      {/* Critical Hazard Alert Banner */}
      {hasCriticalHazard && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <Icon icon="solar:danger-triangle-bold" className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 dark:text-rose-200 text-sm block">
                CRITICAL HAZARD ALERT: Safety Threshold Breached ({criticalAlarms.length} Active)
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolveActiveAlarms("Safety Officer", "Resolved critical hazards")}
                className="h-6 px-2.5 text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-700 border-none"
              >
                Resolve All Active
              </Button>
            </div>
            <div className="mt-2 space-y-1.5">
              {criticalAlarms.slice(0, 4).map((a) => (
                <div key={a.id} className="flex justify-between items-center text-rose-800 dark:text-rose-300 font-medium bg-white/60 dark:bg-slate-900/60 p-1.5 rounded-lg border border-rose-200/60 dark:border-rose-900/60">
                  <span>
                    [{a.sourceLabel}] {a.description}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold tabular-nums text-rose-900 dark:text-rose-100">{a.value}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlarm(a.id, "Safety Officer")}
                      className="h-6 px-2 text-[10px] bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 font-bold"
                    >
                      Ack
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => resolveAlarm(a.id, "Safety Officer", "Resolved via Command Center")}
                      className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Real-Time Sensor Metric Cards with Aesthetic Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: MQ2 Gas Sensor */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MQ2 Gas Level
              </span>
              <div className="size-7 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600">
                <Icon icon="solar:flame-bold-duotone" className="size-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.gas?.mq2Ppm !== undefined ? tel.gas.mq2Ppm : "—"}
              </span>
              {tel?.gas?.mq2Ppm !== undefined && (
                <span className="text-xs font-semibold text-slate-500">ppm</span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <AestheticMiniSparkline data={gasSparkline} color="#EA580C" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Limit: {thresholds.gasPpmCritical} ppm</span>
              <Badge
                variant={
                  tel?.gas?.status === "DANGER"
                    ? "destructive"
                    : tel?.gas?.status === "WARNING"
                    ? "outline"
                    : "secondary"
                }
                className={`text-[9px] font-bold ${
                  tel?.gas?.status === "WARNING"
                    ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                    : ""
                }`}
              >
                {tel?.gas?.status || "NO DATA"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metric 2: Ultrasound Wall Distance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Wall Clearance
              </span>
              <div className="size-7 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                <Icon icon="solar:radar-2-bold-duotone" className="size-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.ultrasound?.distanceCm !== undefined
                  ? tel.ultrasound.distanceCm.toFixed(1)
                  : "—"}
              </span>
              {tel?.ultrasound?.distanceCm !== undefined && (
                <span className="text-xs font-semibold text-slate-500">cm</span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <AestheticMiniSparkline data={distSparkline} color="#3B82F6" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Min: {thresholds.wallDistanceMinCriticalCm} cm</span>
              <span
                className={`font-semibold ${
                  tel?.ultrasound?.distanceCm === undefined
                    ? "text-slate-400"
                    : tel.ultrasound.distanceCm <= thresholds.wallDistanceMinCriticalCm
                    ? "text-rose-600 font-bold"
                    : tel.ultrasound.distanceCm <= thresholds.wallDistanceMinWarningCm
                    ? "text-amber-600 font-bold"
                    : "text-emerald-600"
                }`}
              >
                {tel?.ultrasound?.distanceCm === undefined
                  ? "Standby"
                  : tel.ultrasound.distanceCm <= thresholds.wallDistanceMinCriticalCm
                  ? "Critical Close"
                  : "Clear"}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: MPU 1 (Horizontal Gy87) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MPU 1 (Horizontal)
              </span>
              <div className="size-7 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                <Icon icon="solar:compass-bold-duotone" className="size-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.imu1?.totalTiltDeg !== undefined ? `${tel.imu1.totalTiltDeg.toFixed(1)}°` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Tilt</span>
            </div>
          </div>

          <div className="mt-3">
            <AestheticMiniSparkline data={mpu1Sparkline} color="#8B5CF6" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>R: {tel?.imu1?.rollDeg !== undefined ? `${tel.imu1.rollDeg.toFixed(1)}°` : "—"}</span>
              <span>P: {tel?.imu1?.pitchDeg !== undefined ? `${tel.imu1.pitchDeg.toFixed(1)}°` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Metric 4: MPU 2 (Vertical Gy87) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MPU 2 (Vertical)
              </span>
              <div className="size-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                <Icon icon="solar:compass-bold-duotone" className="size-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.imu2?.totalTiltDeg !== undefined ? `${tel.imu2.totalTiltDeg.toFixed(1)}°` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Tilt</span>
            </div>
          </div>

          <div className="mt-3">
            <AestheticMiniSparkline data={mpu2Sparkline} color="#6366F1" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>R: {tel?.imu2?.rollDeg !== undefined ? `${tel.imu2.rollDeg.toFixed(1)}°` : "—"}</span>
              <span>P: {tel?.imu2?.pitchDeg !== undefined ? `${tel.imu2.pitchDeg.toFixed(1)}°` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Metric 5: Vibration Sensor */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Micro-Vibration
              </span>
              <div className="size-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <Icon icon="solar:graph-up-bold-duotone" className="size-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.vibration?.intensity !== undefined ? `${tel.vibration.intensity}%` : "—"}
              </span>
              <span className="text-xs font-semibold text-slate-500">Intensity</span>
            </div>
          </div>

          <div className="mt-3">
            <AestheticMiniSparkline data={vibSparkline} color="#10B981" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">
                {tel?.vibration?.eventCount !== undefined ? `${tel.vibration.eventCount} pulses` : "—"}
              </span>
              <span
                className={`font-semibold ${
                  tel?.vibration?.triggered ? "text-rose-600 font-bold" : "text-emerald-600"
                }`}
              >
                {!tel?.vibration ? "Standby" : tel.vibration.triggered ? "Active Pulse" : "Quiet"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row: Dual 3D Inclinometers & Actuators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dual Perpendicular Inclinometers (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inclinometer 1: Horizontal Sensor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sensor A: MPU-1 (Horizontal / Lateral Axis)
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Primary IMU #1
                </Badge>
              </div>
              <TiltInclinometer3D
                rollDeg={tel?.imu1?.rollDeg}
                pitchDeg={tel?.imu1?.pitchDeg}
                totalTiltDeg={tel?.imu1?.totalTiltDeg}
                accelX={tel?.imu1?.accelX}
                accelY={tel?.imu1?.accelY}
                accelZ={tel?.imu1?.accelZ}
              />
            </div>

            {/* Inclinometer 2: Vertical Sensor (Perpendicular) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sensor B: MPU-2 (Vertical / Longitudinal Axis)
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Secondary IMU #2 (Perpendicular)
                </Badge>
              </div>
              <TiltInclinometer3D
                rollDeg={tel?.imu2?.rollDeg}
                pitchDeg={tel?.imu2?.pitchDeg}
                totalTiltDeg={tel?.imu2?.totalTiltDeg}
                accelX={tel?.imu2?.accelX}
                accelY={tel?.imu2?.accelY}
                accelZ={tel?.imu2?.accelZ}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Actuator & Physical Output Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Actuators Control Card */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Icon icon="solar:bolt-bold-duotone" className="size-4 text-orange-600" />
                  Alert Actuators & Outputs
                </CardTitle>
                <Link
                  href="/dashboard/outputs"
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  Full View <Icon icon="solar:arrow-right-up-linear" className="size-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* 8x8 LED Matrix Live Rendering */}
              <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <LedMatrixDisplay
                  pattern={tel?.actuators?.ledMatrixPattern || "IDLE"}
                  isActive={tel?.actuators?.ledMatrixActive ?? true}
                  size="sm"
                />
              </div>

              {/* Buzzer Siren Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center ${
                      tel?.actuators?.buzzerActive
                        ? "bg-rose-100 text-rose-700 animate-pulse"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {tel?.actuators?.buzzerActive ? (
                      <Icon icon="solar:volume-loud-bold-duotone" className="size-4 text-rose-700" />
                    ) : (
                      <Icon icon="solar:volume-cross-bold-duotone" className="size-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Audible Buzzer
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {tel?.actuators?.buzzerActive ? "SIREN SOUNDING (2.8 kHz)" : "Silent / Standby"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={tel?.actuators?.buzzerActive ? "destructive" : "outline"}
                  onClick={() => triggerActuatorTest("buzzer")}
                  className="h-7 text-xs font-bold"
                >
                  {tel?.actuators?.buzzerActive ? "Silence" : "Test"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts Feed Card */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Recent Alarms ({alarms.length})
                </CardTitle>
                <Link
                  href="/dashboard/alarms"
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {alarms.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {alarms.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 bg-slate-50/80 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="solar:record-circle-bold-duotone"
                            className={`size-3.5 ${
                              a.severity === "CRITICAL" ? "text-rose-600" : "text-amber-500"
                            }`}
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {a.sourceLabel}
                          </span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-semibold">
                            {a.category}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">
                          {a.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {new Date(a.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">All sensor channels nominal.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fleet-Wide Real-Time Telemetry Stream Chart */}
      <AestheticAreaTrendChart
        title="Live Fleet-Wide Telemetry Stream: MQ2 Gas (ppm)"
        description="Synchronized real-time comparison across all chamber stations with dynamic threshold safety envelopes"
        data={fleetStreamData}
        series={fleetSeries}
        unit="ppm"
        height={320}
        thresholds={{
          warning: thresholds.gasPpmWarning,
          critical: thresholds.gasPpmCritical,
          warningLabel: `WARNING (${thresholds.gasPpmWarning} ppm)`,
          criticalLabel: `CRITICAL (${thresholds.gasPpmCritical} ppm)`,
        }}
      />

      {/* Raise Manual Emergency Alarm Dialog */}
      <Dialog open={isManualAlarmOpen} onOpenChange={setIsManualAlarmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Icon icon="solar:danger-triangle-bold" className="size-5" />
              Raise Manual Emergency Hazard Alarm
            </DialogTitle>
            <DialogDescription className="text-xs">
              Remotely trigger an emergency alert and siren/LED pattern across selected mine stations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Target Node / Area</Label>
                <Select value={manualNodeId} onValueChange={(val) => val && setManualNodeId(val)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Target Station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLEET_WIDE">Mine-Wide (All Stations)</SelectItem>
                    {nodes.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.id} ({n.label})
                      </SelectItem>
                    ))}
                    {nodes.length === 0 && (
                      <>
                        <SelectItem value="ESP-NODE-01">ESP-NODE-01</SelectItem>
                        <SelectItem value="ESP-NODE-02">ESP-NODE-02</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Severity Tier</Label>
                <Select value={manualSev} onValueChange={(val) => val && setManualSev(val as typeof manualSev)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Severity Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">CRITICAL (Sirens + Red Matrix)</SelectItem>
                    <SelectItem value="WARNING">WARNING (Pulse Yellow)</SelectItem>
                    <SelectItem value="INFO">INFO (Advisory Log)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="manualDesc" className="text-xs font-semibold">
                Hazard Observation & Reason
              </Label>
              <Input
                id="manualDesc"
                placeholder="e.g. Geotechnical shift or gas odor observed at working face"
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManualAlarmOpen(false)}
              className="text-xs"
              disabled={isRaising}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmManualAlarm}
              disabled={!manualDesc.trim() || isRaising}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5"
            >
              {isRaising ? "Broadcasting Alarm..." : "Trigger Emergency Alarm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
