"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { AestheticAreaTrendChart, SeriesConfig, ThresholdZone } from "@/components/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import type { TelemetryDataPoint } from "@/types";

export default function TrendsPage() {
  const { nodes, thresholds, fetchNodeHistory } = useTelemetryContext();
  const [metric, setMetric] = useState<
    "gasPpm" | "wallDistanceCm" | "tiltMpu1" | "tiltMpu2" | "vibrationIntensity"
  >("gasPpm");
  const [timeRange, setTimeRange] = useState<"15m" | "1h" | "6h" | "24h">("1h");

  // Sample points count based on time range
  const sampleCount = timeRange === "15m" ? 15 : timeRange === "1h" ? 30 : timeRange === "6h" ? 60 : 96;

  const [fleetHistoryMap, setFleetHistoryMap] = useState<Record<string, TelemetryDataPoint[]>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadHistories() {
      const map: Record<string, TelemetryDataPoint[]> = {};
      for (const n of nodes) {
        const hist = await fetchNodeHistory(n.id, sampleCount);
        map[n.id] = hist;
      }
      if (isMounted) {
        setFleetHistoryMap(map);
      }
    }

    loadHistories();
    const interval = setInterval(loadHistories, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [nodes, sampleCount, fetchNodeHistory]);

  const series: SeriesConfig[] = useMemo(() => {
    const palette = ["#F97316", "#E11D48", "#8B5CF6", "#10B981", "#3B82F6", "#EC4899"];
    return nodes.map((n, idx) => ({
      key: n.id,
      name: `${n.id} · ${n.label}`,
      color: palette[idx % palette.length],
      strokeWidth: idx === 0 ? 2.4 : 2.0,
      dashed: idx === 3,
    }));
  }, [nodes]);

  const combinedData = useMemo(() => {
    if (nodes.length === 0) return [];
    const firstNodeHistory = fleetHistoryMap[nodes[0].id] || [];
    return firstNodeHistory.map((d, idx) => {
      const row: Record<string, string | number | undefined> = {
        time: d.time || d.timestamp,
      };
      nodes.forEach((n) => {
        const hist = fleetHistoryMap[n.id] || [];
        const val = hist[idx]?.[metric];
        row[n.id] = typeof val === "number" ? val : typeof val === "string" ? Number(val) : undefined;
      });
      return row;
    });
  }, [nodes, fleetHistoryMap, metric]);

  const metricDetails = useMemo(() => {
    switch (metric) {
      case "gasPpm":
        return {
          title: "Cross-Station Geotechnical Trends: MQ2 Flammable Gas",
          unit: "ppm",
          thresholds: {
            warning: thresholds.gasPpmWarning,
            critical: thresholds.gasPpmCritical,
            warningLabel: `WARNING (${thresholds.gasPpmWarning} ppm)`,
            criticalLabel: `CRITICAL DANGER (${thresholds.gasPpmCritical} ppm)`,
          } as ThresholdZone,
        };
      case "wallDistanceCm":
        return {
          title: "Cross-Station Geotechnical Trends: Rock Wall Clearance",
          unit: "cm",
          thresholds: {
            warning: thresholds.wallDistanceMinWarningCm,
            critical: thresholds.wallDistanceMinCriticalCm,
            warningLabel: `CONVERGENCE WARNING (${thresholds.wallDistanceMinWarningCm} cm)`,
            criticalLabel: `COLLAPSE DANGER (${thresholds.wallDistanceMinCriticalCm} cm)`,
            inverted: true,
          } as ThresholdZone,
        };
      case "tiltMpu1":
        return {
          title: "Cross-Station Geotechnical Trends: MPU-1 Horizontal Incline",
          unit: "°",
          thresholds: {
            warning: thresholds.tiltDegWarning,
            critical: thresholds.tiltDegCritical,
            warningLabel: `INCLINE WARN (${thresholds.tiltDegWarning}°)`,
            criticalLabel: `STRUCTURAL RISK (${thresholds.tiltDegCritical}°)`,
          } as ThresholdZone,
        };
      case "tiltMpu2":
        return {
          title: "Cross-Station Geotechnical Trends: MPU-2 Vertical Incline",
          unit: "°",
          thresholds: {
            warning: thresholds.tiltDegWarning,
            critical: thresholds.tiltDegCritical,
            warningLabel: `INCLINE WARN (${thresholds.tiltDegWarning}°)`,
            criticalLabel: `STRUCTURAL RISK (${thresholds.tiltDegCritical}°)`,
          } as ThresholdZone,
        };
      case "vibrationIntensity":
        return {
          title: "Cross-Station Geotechnical Trends: Micro-Seismic Vibration",
          unit: "%",
          thresholds: {
            warning: thresholds.vibrationIntensityThreshold,
            critical: 90,
            warningLabel: `VIBRATION SPIKE (${thresholds.vibrationIntensityThreshold}%)`,
            criticalLabel: `SEVERE IMPACT (90%)`,
          } as ThresholdZone,
        };
    }
  }, [metric, thresholds]);

  // CSV Export Handler
  const handleExportCsv = () => {
    if (combinedData.length === 0) return;
    const headers = ["Timestamp", ...nodes.map((n) => `"${n.id} (${n.label}) - ${metricDetails.unit}"`)];
    const rows = combinedData.map((d) => [
      d.time,
      ...nodes.map((n) => d[n.id] ?? ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mine-trends-${metric}-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center shadow-xs">
              <Icon icon="solar:chart-2-bold-duotone" className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Geotechnical Multi-Station Trends
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-Resolution Comparative Overlay across all Mine Monitoring Stations
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <Select
            value={metric}
            onValueChange={(val) => {
              if (val) setMetric(val as typeof metric);
            }}
          >
            <SelectTrigger className="w-[210px] text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Select Sensor Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasPpm">
                <span className="flex items-center gap-2">
                  <Icon icon="solar:flame-bold-duotone" className="size-3.5 text-orange-500" /> MQ2 Gas (ppm)
                </span>
              </SelectItem>
              <SelectItem value="wallDistanceCm">
                <span className="flex items-center gap-2">
                  <Icon icon="solar:radar-2-bold-duotone" className="size-3.5 text-blue-500" /> Wall Clearance (cm)
                </span>
              </SelectItem>
              <SelectItem value="tiltMpu1">
                <span className="flex items-center gap-2">
                  <Icon icon="solar:compass-bold-duotone" className="size-3.5 text-purple-500" /> MPU-1 Horizontal Tilt (°)
                </span>
              </SelectItem>
              <SelectItem value="tiltMpu2">
                <span className="flex items-center gap-2">
                  <Icon icon="solar:compass-bold-duotone" className="size-3.5 text-indigo-500" /> MPU-2 Vertical Tilt (°)
                </span>
              </SelectItem>
              <SelectItem value="vibrationIntensity">
                <span className="flex items-center gap-2">
                  <Icon icon="solar:graph-up-bold-duotone" className="size-3.5 text-emerald-500" /> Vibration Intensity (%)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Time Range Selector */}
          <Select
            value={timeRange}
            onValueChange={(val) => {
              if (val) setTimeRange(val as typeof timeRange);
            }}
          >
            <SelectTrigger className="w-[130px] text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">Last 15 Mins</SelectItem>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Comparative Trend Chart */}
      <AestheticAreaTrendChart
        title={metricDetails.title}
        description={`Comparative real-time telemetry stream · Interval: ${timeRange} · Multi-Station Convergence Visualizer`}
        data={combinedData}
        series={series}
        unit={metricDetails.unit}
        height={380}
        thresholds={metricDetails.thresholds}
        onExportCsv={handleExportCsv}
      />
    </div>
  );
}
