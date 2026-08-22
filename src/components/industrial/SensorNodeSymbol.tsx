"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { MeshNode, NodeTelemetry } from "@/types";
import { Activity, Radio, Battery, Compass, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface SensorNodeSymbolProps {
  node: MeshNode;
  telemetry?: NodeTelemetry | null;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SensorNodeSymbol({
  node,
  telemetry,
  isSelected = false,
  onClick,
  size = "md",
  className,
}: SensorNodeSymbolProps) {
  const isOnline = node.status !== "OFFLINE";
  const isCritical = node.riskSeverity === "CRITICAL";
  const isWatch = node.riskSeverity === "WATCH";

  const sizeClasses = {
    sm: "w-28 p-2 text-xs",
    md: "w-36 p-3 text-xs",
    lg: "w-48 p-4 text-sm",
  };

  const riskBadgeStyles = isCritical
    ? "bg-rose-500/15 text-rose-700 border-rose-500/40"
    : isWatch
    ? "bg-amber-500/15 text-amber-800 border-amber-500/40"
    : "bg-emerald-500/15 text-emerald-800 border-emerald-500/40";

  const statusDotColor = isCritical
    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]"
    : isWatch
    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
    : isOnline
    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
    : "bg-slate-400";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl border transition-all duration-200 cursor-pointer select-none bg-white shadow-xs",
        isSelected
          ? "ring-2 ring-primary border-primary shadow-md"
          : isCritical
          ? "border-rose-300 hover:border-rose-400 hover:shadow-sm"
          : isWatch
          ? "border-amber-300 hover:border-amber-400 hover:shadow-sm"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
        sizeClasses[size],
        className
      )}
    >
      {/* Top Row: Node ID + Status Dot */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-800">
          <Radio className="size-3.5 text-slate-500" />
          <span>{node.id}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn("size-2 rounded-full", statusDotColor)} />
          <span className="text-[10px] font-semibold text-slate-500">{node.link.hops}H</span>
        </div>
      </div>

      {/* Sensor Micro-Readouts */}
      <div className="mt-2 space-y-1.5 font-mono text-[11px]">
        {/* Tilt Angle */}
        <div className="flex justify-between items-center text-slate-700">
          <span className="text-slate-400 font-sans text-[10px] flex items-center gap-1">
            <Compass className="size-2.5" /> Tilt
          </span>
          <span className={cn("font-bold tabular-nums", (telemetry?.tilt.totalTiltDeg ?? 0) > 2 ? "text-amber-700" : "text-slate-800")}>
            {telemetry ? `${telemetry.tilt.totalTiltDeg.toFixed(1)}°` : "—"}
          </span>
        </div>

        {/* Displacement Delta */}
        <div className="flex justify-between items-center text-slate-700">
          <span className="text-slate-400 font-sans text-[10px] flex items-center gap-1">
            <Activity className="size-2.5" /> Disp
          </span>
          <span className={cn("font-bold tabular-nums", (telemetry?.displacement.deltaMm ?? 0) > 10 ? "text-rose-700" : "text-slate-800")}>
            {telemetry ? `+${telemetry.displacement.deltaMm.toFixed(1)}mm` : "—"}
          </span>
        </div>

        {/* Crack Badge / Indicator */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-sans text-[10px]">Crack</span>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded text-[9px] font-sans font-bold",
              telemetry?.crack.detected
                ? "bg-rose-100 text-rose-800"
                : "bg-slate-100 text-slate-500"
            )}
          >
            {telemetry?.crack.detected ? `${telemetry.crack.widthEstimateMm.toFixed(1)}mm` : "NONE"}
          </span>
        </div>
      </div>

      {/* Footer: Battery & Risk Badge */}
      <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1 text-slate-500">
          <Battery className={cn("size-3", node.battery.percentage < 20 ? "text-rose-500" : "text-emerald-600")} />
          <span className="tabular-nums font-mono">{node.battery.voltage.toFixed(1)}V</span>
        </div>
        <span className={cn("px-1.5 py-0.5 rounded-full font-bold border text-[9px]", riskBadgeStyles)}>
          {node.riskSeverity}
        </span>
      </div>
    </div>
  );
}
