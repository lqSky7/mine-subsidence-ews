"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Industrial Value Display - Matches Ignition/Siemens style
 * Clean gray box with label on top, large value in center
 * Reference: ui_demo/scada_demo1.png flow meters (17.20 GPM, 14.64 GPM)
 */

interface IndustrialValueDisplayProps {
  label: string;
  value: number | string;
  unit?: string;
  status?: "normal" | "warning" | "alarm" | "offline";
  decimals?: number;
  className?: string;
}

export function IndustrialValueDisplay({
  label,
  value,
  unit,
  status = "normal",
  decimals = 2,
  className,
}: IndustrialValueDisplayProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
  
  // Status-based styling
  const getStatusStyles = () => {
    switch (status) {
      case "alarm":
        return "bg-rose-100 border-rose-400 text-rose-800";
      case "warning":
        return "bg-amber-100 border-amber-400 text-amber-800";
      case "offline":
        return "bg-slate-200 border-slate-400 text-slate-500";
      default:
        return "bg-slate-100 border-slate-400 text-slate-800";
    }
  };

  return (
    <div className={cn("flex flex-col min-w-[120px]", className)}>
      {/* Label Header */}
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 text-center">
        {label}
      </div>
      
      {/* Value Box - Ignition Style */}
      <div className={cn(
        "border-2 rounded px-4 py-3 flex items-baseline justify-center gap-2",
        getStatusStyles()
      )}>
        <span className="text-2xl font-bold  tabular-nums">
          {typeof value === "number" ? numericValue.toFixed(decimals) : value}
        </span>
        {unit && (
          <span className="text-sm font-semibold uppercase">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
