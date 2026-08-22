"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Thermometer } from "lucide-react";

interface ThermometerWidgetProps {
  value: number;
  min?: number;
  max?: number;
  unit?: "C" | "F";
  label?: string;
  lowThreshold?: number;
  highThreshold?: number;
  className?: string;
}

export function ThermometerWidget({
  value,
  min = 0,
  max = 120,
  unit = "C",
  label = "Temperature",
  lowThreshold = 20,
  highThreshold = 80,
  className,
}: ThermometerWidgetProps) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;

  // Mercury colour by zone
  const mercuryColor =
    value >= highThreshold ? "#dc2626" : value <= lowThreshold ? "#3b82f6" : "#8b5cf6";

  // Scale ticks — evenly spaced from min to max
  const step = (max - min) / 6;
  const ticks = Array.from({ length: 7 }, (_, i) => Math.round(min + i * step));

  // Tube geometry
  const tubeX = 42;
  const tubeW = 20;
  const tubeTop = 18;
  const tubeBot = 158;
  const tubeH = tubeBot - tubeTop; // 140px usable height
  const bulbCy = 178;
  const bulbR = 16;

  // Mercury fill (from bottom of tube upwards)
  const mercuryH = (pct / 100) * tubeH;
  const mercuryTop = tubeBot - mercuryH;

  // Status
  const isHigh = value >= highThreshold;
  const isLow = value <= lowThreshold;

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-white rounded-lg border border-slate-300 shadow-md p-4",
        className
      )}
    >
      {/* Title */}
      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Thermometer className="size-4" />
        {label}
      </span>

      <svg width="100" height="210" viewBox="0 0 100 210" className="overflow-visible">
        {/* ---- Scale markings (right side of tube) ---- */}
        <g className="font-mono text-[10px] font-bold fill-slate-600">
          {ticks.map((temp) => {
            const y = tubeBot - ((temp - min) / (max - min)) * tubeH;
            return (
              <g key={temp}>
                <line x1="66" y1={y} x2="72" y2={y} stroke="#94a3b8" strokeWidth="1.5" />
                <text x="76" y={y + 3.5} textAnchor="start">
                  {temp}
                </text>
              </g>
            );
          })}
        </g>

        {/* High-threshold marker (red dash on left) */}
        {highThreshold !== undefined && (
          <line
            x1="34"
            y1={tubeBot - ((highThreshold - min) / (max - min)) * tubeH}
            x2="40"
            y2={tubeBot - ((highThreshold - min) / (max - min)) * tubeH}
            stroke="#ef4444"
            strokeWidth="2.5"
          />
        )}

        {/* Low-threshold marker (blue dash on left) */}
        {lowThreshold !== undefined && (
          <line
            x1="34"
            y1={tubeBot - ((lowThreshold - min) / (max - min)) * tubeH}
            x2="40"
            y2={tubeBot - ((lowThreshold - min) / (max - min)) * tubeH}
            stroke="#3b82f6"
            strokeWidth="2.5"
          />
        )}

        {/* ---- Glass tube (outer) ---- */}
        <rect
          x={tubeX - 2}
          y={tubeTop - 2}
          width={tubeW + 4}
          height={tubeH + 4}
          rx="12"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {/* Inner tube background */}
        <rect
          x={tubeX}
          y={tubeTop}
          width={tubeW}
          height={tubeH}
          rx="10"
          fill="white"
        />

        {/* ---- Mercury column ---- */}
        <rect
          x={tubeX + 2}
          y={mercuryTop}
          width={tubeW - 4}
          height={mercuryH}
          rx="7"
          fill={mercuryColor}
          className="transition-all duration-500 ease-out"
        />

        {/* ---- Bulb ---- */}
        <circle
          cx={tubeX + tubeW / 2}
          cy={bulbCy}
          r={bulbR}
          fill={mercuryColor}
          stroke="#cbd5e1"
          strokeWidth="2"
          className="transition-colors duration-500"
        />

        {/* Bulb highlight */}
        <circle
          cx={tubeX + tubeW / 2 - 4}
          cy={bulbCy - 4}
          r="4"
          fill="white"
          opacity="0.35"
        />

        {/* Value inside bulb */}
        <text
          x={tubeX + tubeW / 2}
          y={bulbCy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[9px] font-mono font-bold fill-white"
        >
          {value.toFixed(1)}
        </text>

        {/* Unit below bulb */}
        <text
          x={tubeX + tubeW / 2}
          y={bulbCy + bulbR + 12}
          textAnchor="middle"
          className="text-xs font-bold fill-slate-600"
        >
          °{unit}
        </text>
      </svg>

      {/* Digital readout */}
      <div className="mt-3 bg-slate-50 rounded-lg px-6 py-3 border border-slate-300 text-center">
        <div className="flex items-baseline justify-center gap-1.5">
          <span
            className={cn(
              "text-3xl font-mono font-bold tabular-nums",
              isHigh ? "text-rose-600" : isLow ? "text-blue-600" : "text-emerald-600"
            )}
          >
            {value.toFixed(1)}
          </span>
          <span className="text-base font-semibold text-slate-500">°{unit}</span>
        </div>
      </div>

      {/* Status pill */}
      <div
        className={cn(
          "mt-3 px-4 py-1.5 rounded-full text-xs font-bold border-2",
          isHigh
            ? "bg-rose-50 text-rose-700 border-rose-500"
            : isLow
            ? "bg-blue-50 text-blue-700 border-blue-500"
            : "bg-emerald-50 text-emerald-700 border-emerald-500"
        )}
      >
        {isHigh ? "● HIGH TEMP" : isLow ? "● LOW TEMP" : "● NORMAL"}
      </div>
    </div>
  );
}
