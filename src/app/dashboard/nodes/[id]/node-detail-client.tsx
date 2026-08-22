"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { TiltInclinometer3D } from "@/components/industrial/TiltInclinometer3D";
import { AestheticMultiMetricChart, AestheticMiniSparkline } from "@/components/charts";
import type { TelemetryDataPoint } from "@/types";

export default function NodeDetailClient({ nodeId }: { nodeId: string }) {
  const { nodes, telemetry, fetchNodeHistory } = useTelemetryContext();

  const node = nodes.find((n) => n.id === nodeId) || null;
  const tel = telemetry[nodeId] || null;

  const isCritical = node?.riskSeverity === "CRITICAL";
  const isWatch = node?.riskSeverity === "WATCH";

  const [historyData, setHistoryData] = useState<TelemetryDataPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const hist = await fetchNodeHistory(nodeId, 30);
      if (isMounted) setHistoryData(hist);
    }
    load();
    const interval = setInterval(load, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [nodeId, fetchNodeHistory]);

  // Extract sparkline historical arrays
  const gasHistory: number[] = useMemo(
    () => historyData.map((d) => Number(d.gasPpm) || 0).filter((v) => !isNaN(v)),
    [historyData]
  );
  const distHistory: number[] = useMemo(
    () => historyData.map((d) => Number(d.wallDistanceCm) || 0).filter((v) => !isNaN(v)),
    [historyData]
  );
  const mpu1History: number[] = useMemo(
    () => historyData.map((d) => Number(d.tiltMpu1) || 0).filter((v) => !isNaN(v)),
    [historyData]
  );
  const mpu2History: number[] = useMemo(
    () => historyData.map((d) => Number(d.tiltMpu2) || 0).filter((v) => !isNaN(v)),
    [historyData]
  );

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/nodes">
            <Button size="sm" variant="outline" className="size-9 p-0 rounded-xl bg-white dark:bg-slate-900">
              <Icon icon="solar:arrow-left-linear" className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {nodeId}
              </h1>
              {node && (
                <>
                  <Badge
                    variant={isCritical ? "destructive" : isWatch ? "outline" : "secondary"}
                    className={`font-bold ${
                      isWatch
                        ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                        : ""
                    }`}
                  >
                    {node.riskSeverity}
                  </Badge>
                  <Badge variant="outline" className="font-semibold text-xs bg-slate-50 dark:bg-slate-800">
                    {node.location}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {node ? `${node.label} · IP: ${node.ipAddress || "—"} · Live Polling Gateway` : "Station not registered"}
            </p>
          </div>
        </div>
      </div>

      {/* Sensor evidence summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Baseline Anomaly</span>
              <div className="size-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Icon icon="solar:graph-new-up-bold-duotone" className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">{tel?.anomaly?.score?.toFixed(3) ?? "—"}</span>
              <span className="text-xs font-semibold text-slate-500">score</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            <p className="font-bold text-slate-700 dark:text-slate-300">{tel?.anomaly?.level ?? "Awaiting model"}</p>
            <p className="mt-1 line-clamp-2">{tel?.anomaly?.contributors.map((item) => item.feature).join(", ") || "No evidence available"}</p>
          </div>
        </div>
        {/* Card 1: MQ2 Gas Sensor */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MQ2 Gas Sensor
              </span>
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:flame-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.gas?.mq2Ppm !== undefined ? tel.gas.mq2Ppm : "—"}
              </span>
              {tel?.gas?.mq2Ppm !== undefined && (
                <span className="text-xs font-semibold text-slate-500">ppm</span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <AestheticMiniSparkline data={gasHistory} color="#EA580C" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>Status: <strong className="text-slate-700 dark:text-slate-300">{tel?.gas?.status || "—"}</strong></span>
              <span>ADC: {tel?.gas?.rawAdc !== undefined ? `${tel.gas.rawAdc}/4095` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ultrasound Wall Distance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Wall Clearance
              </span>
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:radar-2-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.ultrasound?.distanceCm !== undefined ? `${tel.ultrasound.distanceCm.toFixed(1)}` : "—"}
              </span>
              {tel?.ultrasound?.distanceCm !== undefined && (
                <span className="text-xs font-semibold text-slate-500">cm</span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <AestheticMiniSparkline data={distHistory} color="#3B82F6" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>Base: {tel?.ultrasound?.baselineCm !== undefined ? `${tel.ultrasound.baselineCm} cm` : "—"}</span>
              <span>Delta: {tel?.ultrasound?.deltaCm !== undefined ? `-${tel.ultrasound.deltaCm} cm` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Card 3: MPU 1 (Horizontal) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MPU 1 (Horizontal)
              </span>
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:compass-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.imu1?.totalTiltDeg !== undefined ? `${tel.imu1.totalTiltDeg.toFixed(2)}` : "—"}
              </span>
              {tel?.imu1?.totalTiltDeg !== undefined && (
                <span className="text-xs font-semibold text-slate-500">°</span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <AestheticMiniSparkline data={mpu1History} color="#8B5CF6" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>R: {tel?.imu1?.rollDeg !== undefined ? `${tel.imu1.rollDeg.toFixed(1)}°` : "—"} · P: {tel?.imu1?.pitchDeg !== undefined ? `${tel.imu1.pitchDeg.toFixed(1)}°` : "—"}</span>
              <span>Z: {tel?.imu1?.accelZ !== undefined ? `${tel.imu1.accelZ.toFixed(1)} m/s²` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Card 4: MPU 2 (Vertical Perpendicular) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MPU 2 (Vertical)
              </span>
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:compass-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tel?.imu2?.totalTiltDeg !== undefined ? `${tel.imu2.totalTiltDeg.toFixed(2)}` : "—"}
              </span>
              {tel?.imu2?.totalTiltDeg !== undefined && (
                <span className="text-xs font-semibold text-slate-500">°</span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <AestheticMiniSparkline data={mpu2History} color="#6366F1" height={28} />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>R: {tel?.imu2?.rollDeg !== undefined ? `${tel.imu2.rollDeg.toFixed(1)}°` : "—"} · P: {tel?.imu2?.pitchDeg !== undefined ? `${tel.imu2.pitchDeg.toFixed(1)}°` : "—"}</span>
              <span>Z: {tel?.imu2?.accelZ !== undefined ? `${tel.imu2.accelZ.toFixed(1)} m/s²` : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Inclinometer Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-900 dark:text-neutral-100">Sensor A: Primary Inclinometer</span>
            <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[9px] font-semibold text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
              HORIZONTAL
            </span>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-900 dark:text-neutral-100">Sensor B: Orthogonal Inclinometer</span>
            <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[9px] font-semibold text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
              VERTICAL
            </span>
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

      {/* Flagship Aesthetic Correlated Multi-Sensor Chart */}
      <AestheticMultiMetricChart
        nodeId={node?.id || nodeId}
        nodeLabel={node?.label}
        data={historyData}
        height={320}
      />
    </div>
  );
}
