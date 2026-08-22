"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Compass, RotateCw, AlertTriangle, ShieldCheck } from "lucide-react";

interface TiltInclinometer3DProps {
  rollDeg?: number;
  pitchDeg?: number;
  totalTiltDeg?: number;
  accelX?: number;
  accelY?: number;
  accelZ?: number;
  maxAngle?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  className?: string;
}

export function TiltInclinometer3D({
  rollDeg = 0,
  pitchDeg = 0,
  totalTiltDeg = 0,
  accelX = 0,
  accelY = 0,
  accelZ = 9.81,
  maxAngle = 10,
  warningThreshold = 2.0,
  criticalThreshold = 4.5,
  className,
}: TiltInclinometer3DProps) {
  const isCritical = totalTiltDeg >= criticalThreshold;
  const isWarning = !isCritical && totalTiltDeg >= warningThreshold;

  // Normalized bubble level coordinates (-1 to 1)
  const normX = Math.min(1, Math.max(-1, rollDeg / maxAngle));
  const normY = Math.min(1, Math.max(-1, pitchDeg / maxAngle));

  const bubbleX = 50 + normX * 38;
  const bubbleY = 50 + normY * 38;

  const color = isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600";
  const bgBadge = isCritical ? "bg-rose-50 border-rose-200 text-rose-800" : isWarning ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800";

  return (
    <div className={cn("p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
            <Compass className="size-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">MPU6050 Dual-Axis Inclinometer</h3>
            <p className="text-xs text-slate-500">Surface Ground Tilt & Orientation</p>
          </div>
        </div>
        <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", bgBadge)}>
          {isCritical ? "CRITICAL TILT" : isWarning ? "WARNING TILT" : "STABLE"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 items-center">
        {/* Left: 2D/3D Electronic Bubble Level Target */}
        <div className="relative flex flex-col items-center justify-center p-2">
          <div className="relative size-44 rounded-full border-2 border-slate-300 bg-slate-50 flex items-center justify-center shadow-inner">
            {/* Concentric Tolerance Rings */}
            <div className="absolute size-32 rounded-full border border-dashed border-slate-300" />
            <div className="absolute size-20 rounded-full border border-amber-300/80 bg-amber-50/20" />
            <div className="absolute size-10 rounded-full border border-emerald-400 bg-emerald-50/30" />

            {/* Crosshairs */}
            <div className="absolute w-full h-px bg-slate-300" />
            <div className="absolute h-full w-px bg-slate-300" />

            {/* Inclinometer Bubble Indicator */}
            <div
              className={cn(
                "absolute size-7 rounded-full shadow-md transition-all duration-200 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-2 border-white",
                isCritical
                  ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                  : isWarning
                  ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                  : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              )}
              style={{ left: `${bubbleX}%`, top: `${bubbleY}%` }}
            >
              <div className="size-2 rounded-full bg-white/70" />
            </div>

            {/* Degree Ring Labels */}
            <span className="absolute top-1 text-[9px] font-mono text-slate-400">N (-P)</span>
            <span className="absolute bottom-1 text-[9px] font-mono text-slate-400">S (+P)</span>
            <span className="absolute left-1 text-[9px] font-mono text-slate-400">W (-R)</span>
            <span className="absolute right-1 text-[9px] font-mono text-slate-400">E (+R)</span>
          </div>

          <span className="text-[11px] text-slate-400 mt-2 font-mono">Full Scale: ±{maxAngle}°</span>
        </div>

        {/* Right: Numerical Breakdown */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Total Resultant Tilt Angle</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={cn("text-3xl font-bold font-mono tracking-tight", color)}>
                {totalTiltDeg.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-500">°</span>
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Warn: {warningThreshold}°</span>
              <span>Crit: {criticalThreshold}°</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Roll Axis (X)</span>
              <span className="text-lg font-bold font-mono text-slate-800 mt-0.5 block">
                {rollDeg > 0 ? `+${rollDeg.toFixed(2)}` : rollDeg.toFixed(2)}°
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">aX: {accelX.toFixed(3)}g</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pitch Axis (Y)</span>
              <span className="text-lg font-bold font-mono text-slate-800 mt-0.5 block">
                {pitchDeg > 0 ? `+${pitchDeg.toFixed(2)}` : pitchDeg.toFixed(2)}°
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">aY: {accelY.toFixed(3)}g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
