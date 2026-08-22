"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  lowThreshold?: number;
  highThreshold?: number;
  className?: string;
}

export function RadialGauge({
  value,
  min,
  max,
  unit,
  label,
  lowThreshold,
  highThreshold,
  className,
}: RadialGaugeProps) {
  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = (clampedValue - min) / (max - min);

  // Gauge spans 180 degrees: from 180° (left) to 0° (right)
  const needleAngleDeg = 180 - (percentage * 180);

  const cx = 120;
  const cy = 120;
  const r = 80;
  const arcWidth = 18;

  // Helper to convert percentage (0-1) to point on semi-circle
  const pctToXY = (pct: number, radius: number) => {
    const angleDeg = 180 - (pct * 180);
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy - radius * Math.sin(angleRad),
    };
  };

  // Create SVG arc path
  const makePath = (startPct: number, endPct: number, radius: number) => {
    const start = pctToXY(startPct, radius);
    const end = pctToXY(endPct, radius);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  };

  // Color zones aligned with tick marks:
  // Green: 0 to 1000 (0% to 50%)
  // Yellow: 1000 to 1500 (50% to 75%)
  // Red: 1500 to 2000 (75% to 100%)
  const greenEnd = 0.50;    // 1000 RPM
  const yellowEnd = 0.75;   // 1500 RPM

  // Tick marks at 0, 500, 1000, 1500, 2000
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    pct,
    value: min + pct * (max - min),
  }));

  // Status
  const isHigh = highThreshold !== undefined && value >= highThreshold;
  const isLow = lowThreshold !== undefined && value <= lowThreshold;
  const statusLabel = isHigh ? "HIGH" : isLow ? "LOW" : "NORMAL";
  const statusClass = isHigh
    ? "bg-rose-50 text-rose-700 border-rose-500"
    : isLow
    ? "bg-amber-50 text-amber-700 border-amber-500"
    : "bg-emerald-50 text-emerald-700 border-emerald-500";

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-white rounded-lg border border-slate-300 shadow-md p-4",
        className
      )}
    >
      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
        {label}
      </span>

      <svg width="240" height="150" viewBox="0 0 240 150">
        {/* Background track */}
        <path
          d={makePath(0, 1, r)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={arcWidth}
          strokeLinecap="round"
        />

        {/* Green zone (0 to 1000 RPM = 50%) */}
        <path
          d={makePath(0, greenEnd, r)}
          fill="none"
          stroke="#10b981"
          strokeWidth={arcWidth}
          strokeLinecap="butt"
        />

        {/* Yellow zone (1000 to 1500 RPM = 50% to 75%) */}
        <path
          d={makePath(greenEnd, yellowEnd, r)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={arcWidth}
          strokeLinecap="butt"
        />

        {/* Red zone (1500 to 2000 RPM = 75% to 100%) - FLAT END */}
        <path
          d={makePath(yellowEnd, 1, r)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={arcWidth}
          strokeLinecap="butt"
        />

        {/* Tick marks and labels */}
        {ticks.map(({ pct, value }, i) => {
          const inner = pctToXY(pct, r - arcWidth / 2 - 2);
          const outer = pctToXY(pct, r + arcWidth / 2 + 4);
          const labelPos = pctToXY(pct, r + arcWidth / 2 + 18);
          return (
            <g key={i}>
              {/* Tick line */}
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#334155"
                strokeWidth={2.5}
              />
              {/* Tick label */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] font-mono font-bold fill-slate-700"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Needle group */}
        <g
          style={{
            transform: `rotate(${needleAngleDeg}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Main needle blade */}
          <polygon
            points={`${cx + r - arcWidth - 10},${cy} ${cx + 10},${cy - 5} ${cx + 10},${cy + 5}`}
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth={1.5}
          />
          {/* Counter weight */}
          <polygon
            points={`${cx - 12},${cy} ${cx + 10},${cy - 4} ${cx + 10},${cy + 4}`}
            fill="#64748b"
          />
        </g>

        {/* Center hub */}
        <circle cx={cx} cy={cy} r={12} fill="#1e293b" stroke="#0f172a" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={5} fill="#ef4444" />
      </svg>

      {/* Digital readout */}
      <div className="mt-2 bg-slate-50 rounded-lg px-6 py-3 border border-slate-300 min-w-[140px] text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span
            className={cn(
              "text-3xl font-mono font-bold tabular-nums",
              isHigh ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-900"
            )}
          >
            {value.toFixed(0)}
          </span>
          <span className="text-base font-semibold text-slate-500 uppercase">{unit}</span>
        </div>
      </div>

      {/* Status pill */}
      <div className={cn("mt-3 px-4 py-1.5 rounded-full text-xs font-bold border-2", statusClass)}>
        ● {statusLabel}
      </div>
    </div>
  );
}
