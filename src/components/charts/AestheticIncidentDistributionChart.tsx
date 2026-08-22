"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AestheticChartTooltip } from "./ChartTooltip";
import { Alarm } from "@/types";
import { Icon } from "@/components/ui/icon";

interface AestheticIncidentDistributionChartProps {
  alarms?: Alarm[];
  height?: number;
  className?: string;
}

export function AestheticIncidentDistributionChart({
  alarms = [],
  height = 240,
  className = "",
}: AestheticIncidentDistributionChartProps) {
  // Aggregate alarms by station node and severity
  const { chartData, severityTotals } = useMemo(() => {
    const stationMap: Record<
      string,
      { station: string; critical: number; warning: number; info: number; total: number }
    > = {
      "ESP-01": { station: "ESP-01 (Chamber 1)", critical: 0, warning: 0, info: 0, total: 0 },
      "ESP-02": { station: "ESP-02 (Chamber 2)", critical: 0, warning: 0, info: 0, total: 0 },
      "ESP-03": { station: "ESP-03 (Chamber 3)", critical: 0, warning: 0, info: 0, total: 0 },
      "ESP-04": { station: "ESP-04 (Chamber 4)", critical: 0, warning: 0, info: 0, total: 0 },
    };

    let critTotal = 0;
    let warnTotal = 0;
    let infoTotal = 0;

    alarms.forEach((a) => {
      let key = "ESP-01";
      if (a.source.includes("02") || a.sourceLabel.includes("Chamber 2")) key = "ESP-02";
      else if (a.source.includes("03") || a.sourceLabel.includes("Chamber 3")) key = "ESP-03";
      else if (a.source.includes("04") || a.sourceLabel.includes("Chamber 4")) key = "ESP-04";

      if (!stationMap[key]) {
        stationMap[key] = { station: a.sourceLabel || key, critical: 0, warning: 0, info: 0, total: 0 };
      }

      if (a.severity === "CRITICAL") {
        stationMap[key].critical++;
        critTotal++;
      } else if (a.severity === "WARNING") {
        stationMap[key].warning++;
        warnTotal++;
      } else {
        stationMap[key].info++;
        infoTotal++;
      }
      stationMap[key].total++;
    });

    return {
      chartData: Object.values(stationMap),
      severityTotals: {
        critical: critTotal,
        warning: warnTotal,
        info: infoTotal,
        total: critTotal + warnTotal + infoTotal,
      },
    };
  }, [alarms]);

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Safety Breach & Incident Distribution by Station
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Breakdown of threshold breaches categorized by severity tier
          </p>
        </div>

        {/* Severity Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold">
            <Icon icon="solar:shield-warning-bold-duotone" className="size-3.5" />
            <span>{severityTotals.critical} Critical</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-bold">
            <Icon icon="solar:danger-triangle-bold" className="size-3.5" />
            <span>{severityTotals.warning} Warning</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-5">
        <div style={{ height, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }} barSize={32}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#94A3B8"
                opacity={0.15}
                vertical={false}
              />
              <XAxis
                dataKey="station"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={{ stroke: "#CBD5E1", strokeWidth: 1, opacity: 0.4 }}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                dx={-4}
              />
              <Tooltip
                content={
                  <AestheticChartTooltip
                    formatter={(val) => `${val} events`}
                  />
                }
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                formatter={(val) => (
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                    {val}
                  </span>
                )}
              />
              <Bar
                dataKey="critical"
                name="Critical Hazards"
                stackId="a"
                fill="#E11D48"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="warning"
                name="Warning Triggers"
                stackId="a"
                fill="#F59E0B"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="info"
                name="Advisory / Normal Events"
                stackId="a"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
