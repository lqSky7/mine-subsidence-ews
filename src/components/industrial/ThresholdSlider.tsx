"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ThresholdSliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: "amber" | "rose" | "emerald" | string;
  warningZone?: number;
  criticalZone?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function ThresholdSlider({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit = "",
  color,
  warningZone,
  criticalZone,
  onChange,
  className,
}: ThresholdSliderProps) {
  const isCritical = color === "rose" || (criticalZone !== undefined && value >= criticalZone);
  const isWarning = color === "amber" || (!isCritical && warningZone !== undefined && value >= warningZone);

  return (
    <div className={cn("space-y-2 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs", className)}>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</Label>
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-base font-bold",
              isCritical ? "text-rose-600 font-extrabold" : isWarning ? "text-amber-600 font-extrabold" : "text-slate-900"
            )}
          >
            {value.toFixed(step < 1 ? 1 : 0)}
          </span>
          {unit && <span className="text-[11px] font-semibold text-slate-400">{unit}</span>}
        </div>
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        className="py-1"
      />

      <div className="flex justify-between text-[10px] font-medium text-slate-400">
        <span>Min: {min}{unit}</span>
        <span>Max: {max}{unit}</span>
      </div>
    </div>
  );
}
