"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface UltrasoundDistanceWidgetProps {
  distanceCm?: number | null;
  baselineCm?: number | null;
  deltaCm?: number | null;
  approachRateCmPerMin?: number | null;
  warningThresholdCm?: number;
  criticalThresholdCm?: number;
  nodeId?: string;
  className?: string;
}

export function UltrasoundDistanceWidget({
  distanceCm,
  baselineCm = 225.0,
  deltaCm,
  approachRateCmPerMin,
  warningThresholdCm = 50.0,
  criticalThresholdCm = 25.0,
  nodeId = "ESP-NODE-01",
  className,
}: UltrasoundDistanceWidgetProps) {
  const [customBaseline, setCustomBaseline] = useState<number | null>(null);

  const currentDist = distanceCm ?? null;
  const activeBaseline = customBaseline ?? baselineCm ?? 225.0;

  // Calculate convergence delta: displacement = baseline - current
  const displacement =
    currentDist !== null && activeBaseline !== null
      ? Math.round((activeBaseline - currentDist) * 10) / 10
      : deltaCm ?? 0;

  // Safety status determination
  const status =
    currentDist === null
      ? "OFFLINE"
      : currentDist <= criticalThresholdCm
      ? "CRITICAL"
      : currentDist <= warningThresholdCm
      ? "WARNING"
      : "STABLE";

  const statusColor =
    status === "CRITICAL"
      ? "text-red-500 bg-red-500/10 border-red-500/30"
      : status === "WARNING"
      ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
      : status === "OFFLINE"
      ? "text-slate-400 bg-slate-500/10 border-slate-500/30"
      : "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";

  const beamColor =
    status === "CRITICAL"
      ? "#ef4444"
      : status === "WARNING"
      ? "#f59e0b"
      : status === "OFFLINE"
      ? "#64748b"
      : "#10b981";

  // Graphical visualization calculations for wall position (max 300cm range)
  const maxRange = Math.max(300, activeBaseline + 50);
  const wallPct = currentDist !== null ? Math.min(100, Math.max(15, (currentDist / maxRange) * 100)) : 75;
  const targetX = 60 + (wallPct / 100) * 220; // SVG coordinates from x=60 (sensor) to x=280 (max wall)

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 font-sans transition-all",
        className
      )}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/10 dark:text-cyan-400 border border-cyan-500/20">
            <Icon icon="solar:radar-bold-duotone" className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Wall Distance & Convergence
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                HC-SR04 Dual
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Ultrasonic Acoustic Pulse • Node: {nodeId}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-xs font-bold font-mono px-3 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5",
            statusColor
          )}
        >
          <span
            className={cn("size-2 rounded-full animate-pulse", {
              "bg-emerald-500": status === "STABLE",
              "bg-amber-500": status === "WARNING",
              "bg-red-500": status === "CRITICAL",
              "bg-slate-400": status === "OFFLINE",
            })}
          />
          {status === "STABLE" ? "SAFE CLEARANCE" : status}
        </span>
      </div>

      {/* SVG Acoustic Beam & Wall Displacement Graphic */}
      <div className="relative w-full h-44 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex items-center justify-center p-2 mb-4">
        <svg viewBox="0 0 340 140" className="w-full h-full font-mono text-[10px]">
          <defs>
            {/* Ultrasonic Acoustic Beam Gradient */}
            <linearGradient id="ultrasoundBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={beamColor} stopOpacity="0.8" />
              <stop offset="70%" stopColor={beamColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={beamColor} stopOpacity="0.9" />
            </linearGradient>

            {/* Grid Pattern */}
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="340" height="140" fill="url(#gridPattern)" />

          {/* Left Wall / Sensor Mount */}
          <rect x="10" y="20" width="30" height="100" rx="4" fill="#334155" />
          <path d="M 40 45 L 55 55 L 55 85 L 40 95 Z" fill="#475569" />
          {/* Transducer Lenses */}
          <circle cx="55" cy="62" r="5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="55" cy="78" r="5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
          <text x="25" y="132" fill="#94a3b8" textAnchor="middle" className="text-[9px]">ESP NODE</text>

          {/* Acoustic Wave Emission Arcs */}
          {currentDist !== null && (
            <g opacity="0.6">
              <path d="M 62 60 A 10 10 0 0 1 62 80" fill="none" stroke={beamColor} strokeWidth="1.5" className="animate-pulse" />
              <path d="M 70 54 A 18 18 0 0 1 70 86" fill="none" stroke={beamColor} strokeWidth="1.5" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
              <path d="M 78 48 A 26 26 0 0 1 78 92" fill="none" stroke={beamColor} strokeWidth="1.5" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
            </g>
          )}

          {/* Main Ultrasonic Cone Beam */}
          <polygon
            points={`55,70 ${targetX},35 ${targetX},105`}
            fill="url(#ultrasoundBeamGrad)"
            opacity="0.25"
          />

          {/* Center Laser Measurement Line */}
          <line
            x1="55"
            y1="70"
            x2={targetX}
            y2="70"
            stroke={beamColor}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Target Wall (Moving Rockface) */}
          <g transform={`translate(${targetX}, 0)`}>
            <rect x="0" y="15" width="24" height="110" rx="3" fill="#1e293b" stroke={beamColor} strokeWidth="2" />
            <path d="M 5 25 L 18 35 M 5 50 L 18 60 M 5 75 L 18 85 M 5 100 L 18 110" stroke="#475569" strokeWidth="1" />
            <text x="12" y="132" fill="#94a3b8" textAnchor="middle" className="text-[9px]">ROCKFACE</text>
          </g>

          {/* Distance Callout Badge */}
          <g transform={`translate(${(55 + targetX) / 2}, 60)`}>
            <rect x="-42" y="-16" width="84" height="24" rx="12" fill="#0f172a" stroke={beamColor} strokeWidth="1.5" />
            <text x="0" y="0" fill="#f8fafc" textAnchor="middle" fontWeight="bold" fontSize="11">
              {currentDist !== null ? `${currentDist.toFixed(1)} cm` : "NO SIGNAL"}
            </text>
          </g>

          {/* Baseline Reference Line & Displacement Marker */}
          {activeBaseline && (
            <g transform={`translate(${60 + Math.min(100, Math.max(15, (activeBaseline / maxRange) * 100)) / 100 * 220}, 0)`}>
              <line x1="0" y1="10" x2="0" y2="130" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="0" y="12" fill="#94a3b8" textAnchor="middle" fontSize="8">BASE: {activeBaseline}cm</text>
            </g>
          )}
        </svg>
      </div>

      {/* Numerical Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Distance Metric */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Wall Clearance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
              {currentDist !== null ? currentDist.toFixed(1) : "--"}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">cm</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            {currentDist !== null ? `(${(currentDist / 100).toFixed(2)} m)` : "Sensor offline"}
          </span>
        </div>

        {/* Baseline Distance Metric */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Calibrated Base
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
              {activeBaseline.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">cm</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            Zero Displacement Reference
          </span>
        </div>

        {/* Displacement Delta (Δd) Metric */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Convergence (Δd)
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={cn("text-xl font-black font-mono", {
                "text-emerald-500": displacement <= 2.0,
                "text-amber-500": displacement > 2.0 && displacement <= 10.0,
                "text-red-500": displacement > 10.0,
              })}
            >
              {displacement > 0 ? `+${displacement.toFixed(1)}` : displacement.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">cm</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            {displacement > 0 ? "Inward Wall Movement" : "Stable Position"}
          </span>
        </div>

        {/* Convergence Approach Rate Metric */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Approach Speed
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
              {approachRateCmPerMin !== undefined && approachRateCmPerMin !== null
                ? approachRateCmPerMin.toFixed(2)
                : "0.00"}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">cm/min</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            Real-time Strain Velocity
          </span>
        </div>
      </div>

      {/* Quick Recalibration Controls */}
      {currentDist !== null && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Safety Clearance Limits: Min Warning: <strong className="text-slate-700 dark:text-slate-300">{warningThresholdCm} cm</strong> | Critical: <strong className="text-red-500">{criticalThresholdCm} cm</strong>
          </span>
          <button
            onClick={() => setCustomBaseline(currentDist)}
            className="text-xs font-semibold font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Icon icon="solar:restart-bold" className="size-3.5" />
            Set Current as Base
          </button>
        </div>
      )}
    </div>
  );
}
