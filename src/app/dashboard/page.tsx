"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AestheticAreaTrendChart, AestheticMiniSparkline, SeriesConfig } from "@/components/charts";
import { LedMatrixDisplay } from "@/components/industrial/LedMatrixDisplay";
import { TiltInclinometer3D } from "@/components/industrial/TiltInclinometer3D";
import { UltrasoundDistanceWidget } from "@/components/industrial/UltrasoundDistanceWidget";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dot,
  EmptyState,
  MetricTile,
  PageHeader,
  PageShell,
  SectionHeader,
  StatStrip,
  StatusBadge,
  Toolbar,
} from "@/components/uber/dashboard-primitives";
import type { TelemetryDataPoint } from "@/types";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "live" | "watch" | "critical";

const toneFromRisk = (risk?: string | null): Tone => {
  if (risk === "CRITICAL" || risk === "SEVERE" || risk === "HIGH") return "critical";
  if (risk === "WATCH" || risk === "MODERATE" || risk === "WARNING") return "watch";
  if (risk === "LOW" || risk === "STABLE" || risk === "NORMAL") return "live";
  return "neutral";
};

const placeholder = "\u2014";

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
  const activeAlarms = alarms.filter((alarm) => alarm.state === "ACTIVE");
  const criticalAlarms = activeAlarms.filter((alarm) => alarm.severity === "CRITICAL");
  const watchAlarms = activeAlarms.filter((alarm) => alarm.severity === "WARNING");

  const [isManualAlarmOpen, setIsManualAlarmOpen] = useState(false);
  const [manualNodeId, setManualNodeId] = useState(selectedNodeId || "ESP-NODE-01");
  const [manualDesc, setManualDesc] = useState("");
  const [manualSev, setManualSev] = useState<"CRITICAL" | "WARNING" | "INFO">("CRITICAL");
  const [isRaising, setIsRaising] = useState(false);
  const [nodeHistory, setNodeHistory] = useState<TelemetryDataPoint[]>([]);
  const [fleetHistoryMap, setFleetHistoryMap] = useState<Record<string, TelemetryDataPoint[]>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadHistories() {
      if (node?.id) {
        const hist = await fetchNodeHistory(node.id, 20);
        if (isMounted) setNodeHistory(hist);
      }

      const map: Record<string, TelemetryDataPoint[]> = {};
      for (const fleetNode of nodes) {
        map[fleetNode.id] = await fetchNodeHistory(fleetNode.id, 24);
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

  const gasSparkline = useMemo(
    () => nodeHistory.map((d) => Number(d.gasPpm) || 0).filter((value) => !Number.isNaN(value)),
    [nodeHistory]
  );
  const distSparkline = useMemo(
    () => nodeHistory.map((d) => Number(d.wallDistanceCm) || 0).filter((value) => !Number.isNaN(value)),
    [nodeHistory]
  );
  const mpu1Sparkline = useMemo(
    () => nodeHistory.map((d) => Number(d.tiltMpu1) || 0).filter((value) => !Number.isNaN(value)),
    [nodeHistory]
  );
  const mpu2Sparkline = useMemo(
    () => nodeHistory.map((d) => Number(d.tiltMpu2) || 0).filter((value) => !Number.isNaN(value)),
    [nodeHistory]
  );
  const vibSparkline = useMemo(
    () => nodeHistory.map((d) => Number(d.vibrationIntensity) || 0).filter((value) => !Number.isNaN(value)),
    [nodeHistory]
  );
  const tempSparkline = useMemo(
    () => nodeHistory.map((d) => Number(d.temperatureC) || 0).filter((value) => !Number.isNaN(value)),
    [nodeHistory]
  );
  const humSparkline = useMemo(
    () => nodeHistory.map((d) => Number(d.humidityPct) || 0).filter((value) => !Number.isNaN(value)),
    [nodeHistory]
  );

  const fleetSeries: SeriesConfig[] = useMemo(() => {
    const palette = ["#000000", "#5e5e5e", "#afafaf", "#d97706", "#d1242f", "#15803d"];
    return nodes.map((fleetNode, index) => ({
      key: fleetNode.id,
      name: fleetNode.id,
      color: palette[index % palette.length],
      strokeWidth: index === 0 ? 2.4 : 1.8,
    }));
  }, [nodes]);

  const fleetStreamData = useMemo(() => {
    if (nodes.length === 0) return [];
    const firstNodeHistory = fleetHistoryMap[nodes[0].id] || [];
    return firstNodeHistory.map((point, index) => {
      const row: Record<string, string | number | undefined> = {
        time: point.time || point.timestamp,
      };
      nodes.forEach((fleetNode) => {
        const hist = fleetHistoryMap[fleetNode.id] || [];
        row[fleetNode.id] = Number(hist[index]?.gasPpm) || undefined;
      });
      return row;
    });
  }, [nodes, fleetHistoryMap]);

  const healthScore = mineHealth ? Math.round(mineHealth.overallScore) : null;
  const riskTone = toneFromRisk(tel?.anomaly?.level || mineHealth?.riskLevel || node?.riskSeverity);
  const gasTone: Tone =
    tel?.gas?.status === "DANGER" ? "critical" : tel?.gas?.status === "WARNING" ? "watch" : tel?.gas ? "live" : "neutral";
  const wallTone: Tone =
    tel?.ultrasound?.distanceCm === undefined
      ? "neutral"
      : tel.ultrasound.distanceCm <= thresholds.wallDistanceMinCriticalCm
      ? "critical"
      : tel.ultrasound.distanceCm <= thresholds.wallDistanceMinWarningCm
      ? "watch"
      : "live";
  const vibrationTone: Tone =
    tel?.vibration?.triggered ? "critical" : tel?.vibration ? "live" : "neutral";

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
    <PageShell>
      <PageHeader
        eyebrow="Command"
        title="Mine command"
        description="Live risk, sensor evidence, and physical outputs for the selected monitoring station."
        meta={<StatusBadge tone={isConnected ? "live" : "neutral"}>{isConnected ? "Gateway live" : "Gateway offline"}</StatusBadge>}
        actions={
          <>
            {activeAlarms.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolveActiveAlarms("Control Room Officer", "Mass hazard resolution")}
                className="border-neutral-300 bg-white text-black hover:bg-neutral-100 dark:border-neutral-700 dark:bg-black dark:text-white"
              >
                Clear active
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsManualAlarmOpen(true)}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-white dark:hover:bg-red-400"
            >
              <Icon icon="solar:danger-triangle-bold" className="size-3.5" />
              Manual alarm
            </Button>
          </>
        }
      />

      <Toolbar>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Station</span>
          {nodes.length > 0 ? (
            nodes.map((fleetNode) => (
              <Button
                key={fleetNode.id}
                size="sm"
                variant={selectedNodeId === fleetNode.id ? "default" : "outline"}
                onClick={() => setSelectedNodeId(fleetNode.id)}
                className={cn(
                  selectedNodeId === fleetNode.id
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border-neutral-300 bg-white text-black hover:bg-neutral-100 dark:border-neutral-700 dark:bg-black dark:text-white"
                )}
              >
                {fleetNode.id.replace("ESP-", "")}
              </Button>
            ))
          ) : (
            <span className="text-sm text-neutral-500">No nodes online</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-2"><Dot tone={riskTone} /> {node?.riskSeverity || "No risk state"}</span>
          <span>{node?.location || "No location"}</span>
          {node?.lastSeen && <span>Last seen {new Date(node.lastSeen).toLocaleTimeString()}</span>}
        </div>
      </Toolbar>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg bg-black p-5 text-white dark:bg-white dark:text-black">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-white/60 dark:text-black/60">Current risk</div>
              <div className="mt-3 flex items-end gap-4">
                <span className="text-6xl font-semibold leading-none tabular-nums">
                  {healthScore ?? placeholder}
                </span>
                <div className="pb-1">
                  <div className="text-xl font-semibold">{tel?.anomaly?.level || mineHealth?.riskLevel || "Collecting"}</div>
                  <div className="text-sm text-white/60 dark:text-black/60">Health index</div>
                </div>
              </div>
            </div>
            <StatusBadge tone={riskTone === "critical" ? "critical" : riskTone === "watch" ? "watch" : "inverse"}>
              {criticalAlarms.length > 0 ? `${criticalAlarms.length} critical` : watchAlarms.length > 0 ? `${watchAlarms.length} watch` : "Nominal"}
            </StatusBadge>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-lg bg-white/20 dark:bg-black/20 sm:grid-cols-3">
            <div className="bg-black px-3 py-3 dark:bg-white">
              <div className="text-[11px] font-semibold uppercase text-white/50 dark:text-black/50">Evidence</div>
              <div className="mt-1 text-sm font-medium">
                {tel?.anomaly?.contributors?.length
                  ? tel.anomaly.contributors.map((item) => item.feature).slice(0, 3).join(", ")
                  : "—"}
              </div>
            </div>
            <div className="bg-black px-3 py-3 dark:bg-white">
              <div className="text-[11px] font-semibold uppercase text-white/50 dark:text-black/50">Score</div>
              <div className="mt-1 text-sm font-medium tabular-nums">{tel?.anomaly?.score != null ? tel.anomaly.score.toFixed(3) : "—"}</div>
            </div>
            <div className="bg-black px-3 py-3 dark:bg-white">
              <div className="text-[11px] font-semibold uppercase text-white/50 dark:text-black/50">Action</div>
              <div className="mt-1 text-sm font-medium">{tel?.anomaly?.recommendation || (node?.id === "ESP-NODE-02" ? "—" : "Continue monitoring")}</div>
            </div>
          </div>
        </div>

        <StatStrip
          className="lg:grid-cols-2"
          items={[
            { label: "Active nodes", value: nodes.filter((n) => n.status !== "OFFLINE").length, tone: isConnected ? "live" : "neutral" },
            { label: "Critical", value: criticalAlarms.length, tone: criticalAlarms.length > 0 ? "critical" : "neutral" },
            { label: "Watch", value: watchAlarms.length, tone: watchAlarms.length > 0 ? "watch" : "neutral" },
            { label: "Baseline", value: anomalyModel ? `${anomalyModel.baselineSamples} samples` : "Pending" },
          ]}
        />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <MetricTile
          label="Gas"
          value={tel?.gas?.mq2Ppm ?? placeholder}
          unit={tel?.gas?.mq2Ppm !== undefined ? "ppm" : undefined}
          tone={gasTone}
          sparkline={<AestheticMiniSparkline data={gasSparkline} color={gasTone === "critical" ? "#d1242f" : "#000000"} height={28} />}
          detail={<span>Limit {thresholds.gasPpmCritical} ppm / {tel?.gas?.status || "No data"}</span>}
        />
        <MetricTile
          label="Wall"
          value={tel?.ultrasound?.distanceCm !== undefined ? tel.ultrasound.distanceCm.toFixed(1) : placeholder}
          unit={tel?.ultrasound?.distanceCm !== undefined ? "cm" : undefined}
          tone={wallTone}
          sparkline={<AestheticMiniSparkline data={distSparkline} color={wallTone === "critical" ? "#d1242f" : "#5e5e5e"} height={28} />}
          detail={<span>Min {thresholds.wallDistanceMinCriticalCm} cm / delta {tel?.ultrasound?.deltaCm ?? placeholder}</span>}
        />
        <MetricTile
          label="Temp"
          value={tel?.environment?.temperatureC !== undefined && tel.environment.temperatureC !== null ? tel.environment.temperatureC.toFixed(1) : placeholder}
          unit={tel?.environment?.temperatureC !== undefined && tel.environment.temperatureC !== null ? "°C" : undefined}
          tone={tel?.environment?.temperatureC !== undefined && tel.environment.temperatureC !== null && thresholds.tempCWarning && tel.environment.temperatureC >= thresholds.tempCWarning ? "watch" : "neutral"}
          sparkline={<AestheticMiniSparkline data={tempSparkline} color="#059669" height={28} />}
          detail={<span>Limit {thresholds.tempCWarning ?? 38} °C / DHT11</span>}
        />
        <MetricTile
          label="Humidity"
          value={tel?.environment?.humidityPct !== undefined && tel.environment.humidityPct !== null ? tel.environment.humidityPct.toFixed(1) : placeholder}
          unit={tel?.environment?.humidityPct !== undefined && tel.environment.humidityPct !== null ? "%" : undefined}
          tone="neutral"
          sparkline={<AestheticMiniSparkline data={humSparkline} color="#0284c7" height={28} />}
          detail={<span>Relative Humidity</span>}
        />
        <MetricTile
          label="Tilt A"
          value={tel?.imu1?.totalTiltDeg !== undefined ? tel.imu1.totalTiltDeg.toFixed(1) : placeholder}
          unit={tel?.imu1?.totalTiltDeg !== undefined ? "deg" : undefined}
          tone={tel?.imu1?.totalTiltDeg !== undefined && tel.imu1.totalTiltDeg >= thresholds.tiltDegCritical ? "critical" : "neutral"}
          sparkline={<AestheticMiniSparkline data={mpu1Sparkline} color="#000000" height={28} />}
          detail={<span>R {tel?.imu1?.rollDeg?.toFixed(1) ?? placeholder} / P {tel?.imu1?.pitchDeg?.toFixed(1) ?? placeholder}</span>}
        />
        <MetricTile
          label="Tilt B"
          value={tel?.imu2?.totalTiltDeg !== undefined ? tel.imu2.totalTiltDeg.toFixed(1) : placeholder}
          unit={tel?.imu2?.totalTiltDeg !== undefined ? "deg" : undefined}
          tone={tel?.imu2?.totalTiltDeg !== undefined && tel.imu2.totalTiltDeg >= thresholds.tiltDegCritical ? "critical" : "neutral"}
          sparkline={<AestheticMiniSparkline data={mpu2Sparkline} color="#5e5e5e" height={28} />}
          detail={<span>R {tel?.imu2?.rollDeg?.toFixed(1) ?? placeholder} / P {tel?.imu2?.pitchDeg?.toFixed(1) ?? placeholder}</span>}
        />
        <MetricTile
          label="Vibration"
          value={tel?.vibration?.intensity !== undefined ? tel.vibration.intensity : placeholder}
          unit={tel?.vibration?.intensity !== undefined ? "%" : undefined}
          tone={vibrationTone}
          sparkline={<AestheticMiniSparkline data={vibSparkline} color={vibrationTone === "critical" ? "#d1242f" : "#000000"} height={28} />}
          detail={<span>{tel?.vibration?.eventCount ?? placeholder} pulses / {tel?.vibration?.triggered ? "active" : "quiet"}</span>}
        />
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Wall clearance"
          description="Ultrasonic distance, convergence, and approach rate for the selected station."
        />
        <UltrasoundDistanceWidget
          distanceCm={tel?.ultrasound?.distanceCm}
          baselineCm={tel?.ultrasound?.baselineCm ?? 225}
          deltaCm={tel?.ultrasound?.deltaCm}
          approachRateCmPerMin={tel?.ultrasound?.approachRateCmPerMin}
          warningThresholdCm={thresholds.wallDistanceMinWarningCm}
          criticalThresholdCm={thresholds.wallDistanceMinCriticalCm}
          nodeId={node?.id || selectedNodeId || "ESP-NODE-01"}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <SectionHeader title="Physical tilt" description="Two perpendicular IMUs shown without extra commentary." />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Sensor A</span>
                <StatusBadge>Horizontal</StatusBadge>
              </div>
              <TiltInclinometer3D
                rollDeg={tel?.imu1?.rollDeg}
                pitchDeg={tel?.imu1?.pitchDeg}
                totalTiltDeg={tel?.imu1?.totalTiltDeg}
                accelX={tel?.imu1?.accelX}
                accelY={tel?.imu1?.accelY}
                accelZ={tel?.imu1?.accelZ}
                slot="imu1"
                nodeId={selectedNodeId}
                warningThreshold={thresholds.tiltDegWarning}
                criticalThreshold={thresholds.tiltDegCritical}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Sensor B</span>
                <StatusBadge>Vertical</StatusBadge>
              </div>
              <TiltInclinometer3D
                rollDeg={tel?.imu2?.rollDeg}
                pitchDeg={tel?.imu2?.pitchDeg}
                totalTiltDeg={tel?.imu2?.totalTiltDeg}
                accelX={tel?.imu2?.accelX}
                accelY={tel?.imu2?.accelY}
                accelZ={tel?.imu2?.accelZ}
                slot="imu2"
                nodeId={selectedNodeId}
                warningThreshold={thresholds.tiltDegWarning}
                criticalThreshold={thresholds.tiltDegCritical}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <SectionHeader
            title="Outputs"
            action={
              <Link href="/dashboard/outputs" className="text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                Open
              </Link>
            }
          />
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-center rounded-lg bg-neutral-100 p-4 dark:bg-neutral-900">
              <LedMatrixDisplay
                pattern={tel?.actuators?.ledMatrixPattern || "IDLE"}
                isActive={tel?.actuators?.ledMatrixActive ?? true}
                size="sm"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-black dark:text-white">Siren</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {tel?.actuators?.buzzerActive ? "Sounding" : "Standby"}
                </div>
              </div>
              <Button size="sm" variant={tel?.actuators?.buzzerActive ? "destructive" : "outline"} onClick={() => triggerActuatorTest("buzzer")}>
                {tel?.actuators?.buzzerActive ? "Silence" : "Test"}
              </Button>
            </div>
          </div>

          <SectionHeader title="Recent alerts" />
          <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-950">
            {alarms.length === 0 ? (
              <div className="p-4 text-sm text-neutral-500">No alerts recorded.</div>
            ) : (
              alarms.slice(0, 4).map((alarm) => (
                <div key={alarm.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={alarm.severity === "CRITICAL" ? "critical" : alarm.severity === "WARNING" ? "watch" : "neutral"}>
                        {alarm.severity}
                      </StatusBadge>
                      <span className="font-medium text-black dark:text-white">{alarm.sourceLabel}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-600 dark:text-neutral-400">{alarm.description}</p>
                  </div>
                  {alarm.state === "ACTIVE" ? (
                    <div className="flex shrink-0 gap-1">
                      <Button size="xs" variant="outline" onClick={() => acknowledgeAlarm(alarm.id, "Safety Officer")}>
                        Ack
                      </Button>
                      <Button size="xs" onClick={() => resolveAlarm(alarm.id, "Safety Officer", "Resolved via Command Center")}>
                        Resolve
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">{alarm.state}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {fleetStreamData.length > 0 ? (
        <AestheticAreaTrendChart
          title="Gas trend by node"
          description="MQ2 ppm compared across active stations with warning and critical thresholds."
          data={fleetStreamData}
          series={fleetSeries}
          unit="ppm"
          height={300}
          thresholds={{
            warning: thresholds.gasPpmWarning,
            critical: thresholds.gasPpmCritical,
            warningLabel: `Watch ${thresholds.gasPpmWarning} ppm`,
            criticalLabel: `Critical ${thresholds.gasPpmCritical} ppm`,
          }}
        />
      ) : (
        <EmptyState title="No fleet trend yet" description="Gas history appears here after the gateway returns recent readings." />
      )}

      <Dialog open={isManualAlarmOpen} onOpenChange={setIsManualAlarmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual alarm</DialogTitle>
            <DialogDescription className="text-sm">
              Broadcast a selected warning state to a station or the full fleet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target</Label>
                <Select value={manualNodeId} onValueChange={(value) => value && setManualNodeId(value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLEET_WIDE">Fleet wide</SelectItem>
                    {nodes.map((fleetNode) => (
                      <SelectItem key={fleetNode.id} value={fleetNode.id}>
                        {fleetNode.id}
                      </SelectItem>
                    ))}
                    {nodes.length === 0 && <SelectItem value="ESP-NODE-01">ESP-NODE-01</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Severity</Label>
                <Select value={manualSev} onValueChange={(value) => value && setManualSev(value as typeof manualSev)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="WARNING">Watch</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manualDesc" className="text-xs font-semibold">Observation</Label>
              <Input
                id="manualDesc"
                placeholder="Reason for alarm"
                value={manualDesc}
                onChange={(event) => setManualDesc(event.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsManualAlarmOpen(false)} disabled={isRaising}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmManualAlarm}
              disabled={!manualDesc.trim() || isRaising}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isRaising ? "Broadcasting" : "Broadcast alarm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
