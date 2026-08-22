"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number;
  min?: number;
  max?: number;
  title: string;
  unit?: string;
  size?: "sm" | "md" | "lg";
  ranges?: {
    normal?: [number, number];
    warning?: [number, number];
    critical?: [number, number];
  };
  className?: string;
}

export function RadialGauge({
  value,
  min = 0,
  max = 100,
  title,
  unit = "",
  size = "md",
  ranges = {
    normal: [0, 60],
    warning: [60, 80],
    critical: [80, 100],
  },
  className,
}: RadialGaugeProps) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);

  // SVG Gauge calculations (240 degree arc)
  const startAngle = -120;
  const endAngle = 120;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + percentage * totalAngle;

  const radius = size === "sm" ? 45 : size === "lg" ? 85 : 65;
  const strokeWidth = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  const center = radius + strokeWidth + 5;
  const svgSize = (center) * 2;

  // Arc paths helper
  const describeArc = (start: number, end: number) => {
    const startRad = (start - 90) * (Math.PI / 180);
    const endRad = (end - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = end - start <= 180 ? "0" : "1";
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const getStatusColor = () => {
    if (ranges.critical && value >= ranges.critical[0]) return "#E11D48";
    if (ranges.warning && value >= ranges.warning[0]) return "#F59E0B";
    return "#10B981";
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs font-sans", className)}>
      <span className="text-xs font-bold text-slate-700 mb-1">{title}</span>
      <div className="relative flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          {/* Background Arc */}
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <path
            d={describeArc(startAngle, Math.max(startAngle + 0.1, currentAngle))}
            fill="none"
            stroke={getStatusColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {value.toFixed(1)}
          </span>
          {unit && <span className="text-[10px] font-semibold text-slate-400">{unit}</span>}
        </div>
      </div>
      <div className="flex justify-between w-full text-[10px] font-semibold text-slate-400 px-2 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
