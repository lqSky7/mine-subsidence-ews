"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sliders, AlertCircle } from "lucide-react";

interface ThresholdSliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  warningZone?: number;
  criticalZone?: number;
  onChange: (val: number) => void;
  className?: string;
}

export function ThresholdSlider({
  label,
  description,
  value,
  min,
  max,
  step = 0.1,
  unit = "",
  warningZone,
  criticalZone,
  onChange,
  className,
}: ThresholdSliderProps) {
  const isCritical = criticalZone !== undefined && value >= criticalZone;
  const isWarning = !isCritical && warningZone !== undefined && value >= warningZone;

  const valueColor = isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-900";

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">{label}</span>
          {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-baseline gap-1 font-mono">
          <span className={cn("text-xl font-bold tabular-nums", valueColor)}>{value.toFixed(1)}</span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>
      </div>

      <div className="space-y-1.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>{min} {unit}</span>
          {warningZone !== undefined && <span className="text-amber-600 font-bold">Warn: {warningZone}{unit}</span>}
          {criticalZone !== undefined && <span className="text-rose-600 font-bold">Crit: {criticalZone}{unit}</span>}
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
}
