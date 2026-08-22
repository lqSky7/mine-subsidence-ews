"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { AestheticChartTooltip } from "./ChartTooltip";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { TelemetryDataPoint } from "@/types";

export interface NodeHistoryDataPoint {
  time?: string;
  timestamp?: string;
  gasPpm?: number | string;
  wallDistanceCm?: number | string;
  tiltMpu1?: number | string;
  tiltMpu2?: number | string;
  vibrationIntensity?: number | string;
  [key: string]: string | number | boolean | undefined;
}

interface AestheticMultiMetricChartProps {
  data: Array<TelemetryDataPoint | NodeHistoryDataPoint | Record<string, string | number | boolean | undefined>>;
  nodeId: string;
  nodeLabel?: string;
  height?: number;
  showThresholds?: boolean;
}

type FocusTab = "all" | "gas" | "distance" | "tilt";

export function AestheticMultiMetricChart({
  data = [],
  nodeId,
  nodeLabel,
  height = 360,
  showThresholds = true,
}: AestheticMultiMetricChartProps) {
  const [tab, setTab] = useState<FocusTab>("all");
  const [thresholdsEnabled, setThresholdsEnabled] = useState<boolean>(showThresholds);

  const hasData = data && data.length > 0;

  // Compute peaks for summary snapshot
  const summary = useMemo(() => {
    if (!hasData) return null;

    let maxGas = 0;
    let minDist = Infinity;
    let maxTilt = 0;

    data.forEach((d) => {
      const g = Number(d.gasPpm) || 0;
      const dist = Number(d.wallDistanceCm);
      const tilt = Number(d.tiltMpu1) || 0;

      if (g > maxGas) maxGas = g;
      if (!isNaN(dist) && dist < minDist) minDist = dist;
      if (tilt > maxTilt) maxTilt = tilt;
    });

    return {
      maxGas,
      minDist: minDist === Infinity ? 0 : minDist,
      maxTilt,
    };
  }, [data, hasData]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                hasData
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                  : "bg-slate-400"
              }`}
            />
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Correlated Multi-Sensor Timeline · {nodeLabel || nodeId}
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
              {nodeId}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronous Multi-Axis Sensor History (MQ2 Gas ppm, Ultrasound Clearance cm, MPU-6050 Inclinometer °)
          </p>
        </div>

        {/* View Focus Mode Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setTab("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tab === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon icon="solar:layers-minimalistic-bold-duotone" className="size-3.5 inline-block mr-1" />
              All Correlated
            </button>
            <button
              onClick={() => setTab("gas")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tab === "gas"
                  ? "bg-orange-500 text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-orange-600 font-medium"
              }`}
            >
              <Icon icon="solar:flame-bold-duotone" className="size-3.5 inline-block mr-1" />
              Gas Focus
            </button>
            <button
              onClick={() => setTab("distance")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tab === "distance"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium"
              }`}
            >
              <Icon icon="solar:radar-2-bold-duotone" className="size-3.5 inline-block mr-1" />
              Clearance
            </button>
            <button
              onClick={() => setTab("tilt")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                tab === "tilt"
                  ? "bg-purple-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-purple-600 font-medium"
              }`}
            >
              <Icon icon="solar:compass-bold-duotone" className="size-3.5 inline-block mr-1" />
              Tilt
            </button>
          </div>

          <button
            onClick={() => setThresholdsEnabled(!thresholdsEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              thresholdsEnabled
                ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/40 dark:border-orange-900/60 dark:text-orange-300"
                : "bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
            }`}
            title="Toggle Safety Limit Bands"
          >
            <Icon icon="solar:shield-warning-bold-duotone" className="size-4" />
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-3 gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-xs">
        <div
          onClick={() => setTab("gas")}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            tab === "gas" || tab === "all"
              ? "border-orange-200 bg-orange-50/40 dark:border-orange-900/50 dark:bg-orange-950/20"
              : "border-transparent opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
              MQ2 Gas Peak
            </span>
            <Icon icon="solar:flame-bold-duotone" className="size-3.5 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {summary ? summary.maxGas : "—"}
            </span>
            {summary && <span className="text-[10px] font-semibold text-slate-500">ppm</span>}
          </div>
        </div>

        <div
          onClick={() => setTab("distance")}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            tab === "distance" || tab === "all"
              ? "border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/20"
              : "border-transparent opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Min Wall Clearance
            </span>
            <Icon icon="solar:radar-2-bold-duotone" className="size-3.5 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {summary ? summary.minDist.toFixed(1) : "—"}
            </span>
            {summary && <span className="text-[10px] font-semibold text-slate-500">cm</span>}
          </div>
        </div>

        <div
          onClick={() => setTab("tilt")}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            tab === "tilt" || tab === "all"
              ? "border-purple-200 bg-purple-50/40 dark:border-purple-900/50 dark:bg-purple-950/20"
              : "border-transparent opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              Max Incline Tilt
            </span>
            <Icon icon="solar:compass-bold-duotone" className="size-3.5 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {summary ? `${summary.maxTilt.toFixed(1)}°` : "—"}
            </span>
            {summary && <span className="text-[10px] font-semibold text-slate-500">tilt</span>}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-5">
        <div style={{ height, width: "100%" }}>
          {!hasData ? (
            <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 text-center p-6">
              <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <Icon icon="solar:inbox-line-linear" className="size-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Awaiting Telemetry Stream
              </h4>
              <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                No telemetry packets recorded for node {nodeId} yet. When online, real-time sensor streams will appear here.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="grad-gas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity={0.4} />
                    <stop offset="70%" stopColor="#EA580C" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity={0.0} />
                  </linearGradient>

                  <linearGradient id="grad-distance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="70%" stopColor="#2563EB" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>

                  <linearGradient id="grad-tilt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="70%" stopColor="#7C3AED" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#94A3B8"
                  opacity={0.15}
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#CBD5E1", strokeWidth: 1, opacity: 0.4 }}
                  tickLine={false}
                  dy={6}
                />

                {/* Primary Axis: Gas (ppm) */}
                {(tab === "all" || tab === "gas") && (
                  <YAxis
                    yAxisId="gas"
                    orientation="left"
                    tick={{ fontSize: 11, fill: "#EA580C" }}
                    axisLine={false}
                    tickLine={false}
                    unit=" ppm"
                    domain={[0, "auto"]}
                  />
                )}

                {/* Secondary Axis: Distance (cm) */}
                {(tab === "all" || tab === "distance") && (
                  <YAxis
                    yAxisId="distance"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#2563EB" }}
                    axisLine={false}
                    tickLine={false}
                    unit=" cm"
                    domain={[0, "auto"]}
                    dx={tab === "distance" ? 0 : 25}
                  />
                )}

                {/* Tertiary Axis: Incline Tilt (deg) */}
                {tab === "tilt" && (
                  <YAxis
                    yAxisId="tilt"
                    orientation="left"
                    tick={{ fontSize: 11, fill: "#7C3AED" }}
                    axisLine={false}
                    tickLine={false}
                    unit="°"
                    domain={[0, 15]}
                  />
                )}

                <Tooltip
                  content={
                    <AestheticChartTooltip
                      statusChecker={(val, name) => {
                        if (name.includes("Gas") && val > 700) return "CRITICAL";
                        if (name.includes("Gas") && val > 400) return "WARNING";
                        if (name.includes("Clearance") && val < 20) return "CRITICAL";
                        if (name.includes("Clearance") && val < 35) return "WARNING";
                        if (name.includes("Tilt") && val > 6) return "CRITICAL";
                        if (name.includes("Tilt") && val > 3) return "WARNING";
                        return "NORMAL";
                      }}
                    />
                  }
                />

                {/* Safety Threshold Reference Lines */}
                {thresholdsEnabled && (tab === "all" || tab === "gas") && (
                  <ReferenceLine
                    yAxisId="gas"
                    y={800}
                    stroke="#E11D48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "GAS CRITICAL (800 ppm)",
                      position: "insideTopLeft",
                      fill: "#E11D48",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                )}

                {thresholdsEnabled && (tab === "all" || tab === "distance") && (
                  <ReferenceLine
                    yAxisId="distance"
                    y={20}
                    stroke="#E11D48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "CLEARANCE CRITICAL (20 cm)",
                      position: "insideBottomRight",
                      fill: "#E11D48",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                )}

                {/* MQ2 Gas Area Series */}
                {(tab === "all" || tab === "gas") && (
                  <Area
                    yAxisId="gas"
                    type="monotone"
                    dataKey="gasPpm"
                    name="MQ2 Gas Concentration"
                    stroke="#EA580C"
                    strokeWidth={2.4}
                    fill="url(#grad-gas)"
                    isAnimationActive={true}
                    animationDuration={600}
                    unit="ppm"
                    dot={false}
                    activeDot={{ r: 5, stroke: "#EA580C", strokeWidth: 2, fill: "#ffffff" }}
                  />
                )}

                {/* Ultrasound Clearance Area Series */}
                {(tab === "all" || tab === "distance") && (
                  <Area
                    yAxisId="distance"
                    type="monotone"
                    dataKey="wallDistanceCm"
                    name="Rock Wall Clearance"
                    stroke="#2563EB"
                    strokeWidth={2.2}
                    fill="url(#grad-distance)"
                    isAnimationActive={true}
                    animationDuration={600}
                    unit="cm"
                    dot={false}
                    activeDot={{ r: 5, stroke: "#2563EB", strokeWidth: 2, fill: "#ffffff" }}
                  />
                )}

                {/* Inclinometer Tilt Area Series */}
                {(tab === "all" || tab === "tilt") && (
                  <Area
                    yAxisId={tab === "tilt" ? "tilt" : "distance"}
                    type="monotone"
                    dataKey="tiltMpu1"
                    name="MPU-1 Horizontal Incline"
                    stroke="#7C3AED"
                    strokeWidth={1.8}
                    fill="url(#grad-tilt)"
                    isAnimationActive={true}
                    animationDuration={600}
                    unit="°"
                    dot={false}
                    activeDot={{ r: 5, stroke: "#7C3AED", strokeWidth: 2, fill: "#ffffff" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        {hasData && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-orange-600 shadow-[0_0_6px_rgba(234,88,12,0.8)]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  MQ2 Gas Sensor (ppm)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Ultrasound Clearance (cm)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-purple-600 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  MPU-1 Horizontal Tilt (°)
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              Auto-refresh: Real-Time Stream
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
