"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { AestheticChartTooltip } from "./ChartTooltip";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Inbox,
} from "lucide-react";

export interface SeriesConfig {
  key: string;
  name: string;
  color: string;
  gradientId?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

export interface ThresholdZone {
  warning?: number;
  critical?: number;
  label?: string;
  warningLabel?: string;
  criticalLabel?: string;
  inverted?: boolean;
}

interface AestheticAreaTrendChartProps {
  data: Array<Record<string, string | number | undefined>>;
  timeKey?: string;
  series: SeriesConfig[];
  unit?: string;
  title?: string;
  description?: string;
  height?: number;
  thresholds?: ThresholdZone;
  statusChecker?: (value: number, name: string) => "NORMAL" | "WARNING" | "CRITICAL" | null;
  onExportCsv?: () => void;
  className?: string;
}

export function AestheticAreaTrendChart({
  data = [],
  timeKey = "time",
  series = [],
  unit = "",
  title,
  description,
  height = 360,
  thresholds,
  statusChecker,
  onExportCsv,
  className = "",
}: AestheticAreaTrendChartProps) {
  // Active series toggle state
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    series.forEach((s) => {
      initial[s.key] = true;
    });
    return initial;
  });

  const [viewStyle, setViewStyle] = useState<"area" | "line">("area");
  const [showThresholds, setShowThresholds] = useState<boolean>(true);

  const toggleSeries = (key: string) => {
    setActiveSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAll = () => {
    const allActive = series.every((s) => activeSeries[s.key]);
    const next: Record<string, boolean> = {};
    series.forEach((s) => {
      next[s.key] = !allActive;
    });
    setActiveSeries(next);
  };

  const hasData = data && data.length > 0;

  // Compute live statistics for summary ribbon
  const stats = useMemo(() => {
    if (!hasData) return null;

    let peak = -Infinity;
    let peakSeries = "";
    let min = Infinity;
    let minSeries = "";
    let totalSum = 0;
    let count = 0;

    const firstRow = data[0];
    const lastRow = data[data.length - 1];

    let startAvg = 0;
    let endAvg = 0;
    let activeCount = 0;

    series.forEach((s) => {
      if (!activeSeries[s.key]) return;
      activeCount++;

      const startVal = Number(firstRow?.[s.key]) || 0;
      const endVal = Number(lastRow?.[s.key]) || 0;
      startAvg += startVal;
      endAvg += endVal;

      data.forEach((row) => {
        const v = Number(row[s.key]);
        if (!isNaN(v)) {
          totalSum += v;
          count++;
          if (v > peak) {
            peak = v;
            peakSeries = s.name;
          }
          if (v < min) {
            min = v;
            minSeries = s.name;
          }
        }
      });
    });

    const average = count > 0 ? totalSum / count : 0;
    const sAvg = activeCount > 0 ? startAvg / activeCount : 0;
    const eAvg = activeCount > 0 ? endAvg / activeCount : 0;
    const deltaPercent = sAvg > 0 ? ((eAvg - sAvg) / sAvg) * 100 : 0;

    return {
      peak: peak === -Infinity ? 0 : peak,
      peakSeries,
      min: min === Infinity ? 0 : min,
      minSeries,
      average,
      deltaPercent,
    };
  }, [data, series, activeSeries, hasData]);

  const ChartComponent = viewStyle === "area" ? AreaChart : LineChart;

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-all ${className}`}
    >
      {/* Chart Header Toolbar */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div>
          {title && (
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  hasData
                    ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewStyle("area")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewStyle === "area"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium"
              }`}
            >
              Glow Area
            </button>
            <button
              onClick={() => setViewStyle("line")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewStyle === "line"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium"
              }`}
            >
              Clean Lines
            </button>
          </div>

          {/* Threshold toggle if available */}
          {thresholds && (thresholds.warning || thresholds.critical) && (
            <Button
              size="sm"
              variant={showThresholds ? "default" : "outline"}
              onClick={() => setShowThresholds(!showThresholds)}
              className={`h-7 px-2.5 text-[11px] gap-1 rounded-lg font-semibold ${
                showThresholds
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <ShieldAlert className="size-3" />
              {showThresholds ? "Limits Visible" : "Limits Hidden"}
            </Button>
          )}

          {/* CSV export */}
          {onExportCsv && hasData && (
            <Button
              size="sm"
              variant="outline"
              onClick={onExportCsv}
              className="h-7 px-2.5 text-[11px] bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Summary Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Fleet Average
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {stats ? stats.average.toFixed(1) : "—"}
            </span>
            {stats && <span className="text-[10px] font-medium text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Peak Recorded
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {stats ? stats.peak.toFixed(1) : "—"}
            </span>
            {stats && <span className="text-[10px] font-medium text-slate-400">{unit}</span>}
            {stats?.peakSeries && (
              <span className="text-[9px] text-slate-400 truncate max-w-[80px]">
                ({stats.peakSeries})
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Minimum Floor
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats ? stats.min.toFixed(1) : "—"}
            </span>
            {stats && <span className="text-[10px] font-medium text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Trend Momentum
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {stats ? (
              <>
                {stats.deltaPercent >= 0 ? (
                  <TrendingUp className="size-4 text-rose-500" />
                ) : (
                  <TrendingDown className="size-4 text-emerald-500" />
                )}
                <span
                  className={`text-sm font-bold tabular-nums ${
                    stats.deltaPercent > 5
                      ? "text-rose-600 dark:text-rose-400"
                      : stats.deltaPercent < -5
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {stats.deltaPercent > 0 ? "+" : ""}
                  {stats.deltaPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">vs window start</span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-400">
                — <span className="text-[10px] font-normal text-slate-400">awaiting data</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="p-5">
        <div style={{ height, width: "100%" }}>
          {!hasData ? (
            <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 text-center p-6">
              <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <Inbox className="size-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No Telemetry Recorded Yet
              </h4>
              <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                Monitoring stations are standing by. Live historical readings will populate this graph in real time upon gateway ingestion.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  {series.map((s, idx) => {
                    const gId = s.gradientId || `grad-${s.key.replace(/[^a-zA-Z0-9]/g, "")}-${idx}`;
                    return (
                      <linearGradient key={gId} id={gId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.4} />
                        <stop offset="60%" stopColor={s.color} stopOpacity={0.08} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0.0} />
                      </linearGradient>
                    );
                  })}
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#94A3B8"
                  opacity={0.15}
                  vertical={false}
                />

                <XAxis
                  dataKey={timeKey}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#CBD5E1", strokeWidth: 1, opacity: 0.4 }}
                  tickLine={false}
                  dy={6}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  unit={unit ? ` ${unit}` : ""}
                  dx={-4}
                />

                <Tooltip
                  content={
                    <AestheticChartTooltip
                      unit={unit}
                      statusChecker={statusChecker}
                    />
                  }
                />

                {/* Threshold Zones & Lines */}
                {showThresholds && thresholds?.critical !== undefined && (
                  <ReferenceLine
                    y={thresholds.critical}
                    stroke="#E11D48"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{
                      value: thresholds.criticalLabel || `CRITICAL LIMIT (${thresholds.critical}${unit})`,
                      position: "insideTopRight",
                      fill: "#E11D48",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                )}

                {showThresholds && thresholds?.warning !== undefined && (
                  <ReferenceLine
                    y={thresholds.warning}
                    stroke="#F59E0B"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: thresholds.warningLabel || `WARNING LEVEL (${thresholds.warning}${unit})`,
                      position: "insideTopRight",
                      fill: "#D97706",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}

                {/* Render Series */}
                {series.map((s, idx) => {
                  if (!activeSeries[s.key]) return null;
                  const gId = s.gradientId || `grad-${s.key.replace(/[^a-zA-Z0-9]/g, "")}-${idx}`;

                  if (viewStyle === "area") {
                    return (
                      <Area
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.name}
                        stroke={s.color}
                        strokeWidth={s.strokeWidth || 2.2}
                        strokeDasharray={s.dashed ? "4 4" : undefined}
                        fill={`url(#${gId})`}
                        isAnimationActive={true}
                        animationDuration={750}
                        dot={false}
                        activeDot={{
                          r: 5,
                          stroke: s.color,
                          strokeWidth: 2,
                          fill: "#ffffff",
                        }}
                      />
                    );
                  }

                  return (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color}
                      strokeWidth={s.strokeWidth || 2.2}
                      strokeDasharray={s.dashed ? "4 4" : undefined}
                      isAnimationActive={true}
                      animationDuration={750}
                      dot={false}
                      activeDot={{
                        r: 5,
                        stroke: s.color,
                        strokeWidth: 2,
                        fill: "#ffffff",
                      }}
                    />
                  );
                })}
              </ChartComponent>
            </ResponsiveContainer>
          )}
        </div>

        {/* Interactive Legend & Series Selector Chips */}
        {hasData && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Active Series:</span>
              {series.map((s) => {
                const isActive = activeSeries[s.key];
                return (
                  <button
                    key={s.key}
                    onClick={() => toggleSeries(s.key)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-slate-50 dark:bg-slate-800/80 border-slate-300/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs"
                        : "bg-transparent border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600 line-through opacity-60"
                    }`}
                  >
                    <span
                      className="size-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                      style={{
                        backgroundColor: s.color,
                        boxShadow: isActive ? `0 0 6px ${s.color}80` : "none",
                      }}
                    />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={toggleAll}
              className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
            >
              {series.every((s) => activeSeries[s.key]) ? "Deselect All" : "Select All"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
