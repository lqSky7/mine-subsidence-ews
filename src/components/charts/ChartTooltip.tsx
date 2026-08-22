"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  unit?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  unit?: string;
  formatter?: (value: number | string, name: string) => string;
  statusChecker?: (value: number, name: string) => "NORMAL" | "WARNING" | "CRITICAL" | null;
}

export function AestheticChartTooltip({
  active,
  payload,
  label,
  unit,
  formatter,
  statusChecker,
}: CustomChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="min-w-[180px] max-w-[280px] rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 transition-all">
      {label && (
        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Telemetry
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const rawValue = typeof item.value === "number" ? item.value : parseFloat(item.value as string);
          const displayVal = formatter
            ? formatter(item.value, item.name)
            : typeof item.value === "number"
            ? item.value.toFixed(1)
            : item.value;

          const itemUnit = item.unit || unit || "";
          const status = statusChecker && !isNaN(rawValue) ? statusChecker(rawValue, item.name) : null;

          return (
            <div key={index} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="size-2.5 rounded-full shrink-0 shadow-xs"
                  style={{
                    backgroundColor: item.color || "#F97316",
                    boxShadow: `0 0 8px ${item.color || "#F97316"}80`,
                  }}
                />
                <span className="truncate font-medium text-slate-700 dark:text-slate-200 text-[11px]">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {displayVal}
                </span>
                {itemUnit && (
                  <span className="text-[10px] text-slate-400 font-medium">{itemUnit}</span>
                )}
                {status && status !== "NORMAL" && (
                  <Badge
                    variant={status === "CRITICAL" ? "destructive" : "outline"}
                    className={`h-4 px-1 text-[8px] font-bold ${
                      status === "WARNING"
                        ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                        : ""
                    }`}
                  >
                    {status}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
