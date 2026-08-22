"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TiltInclinometer3DProps {
  rollDeg?: number; // X-axis tilt in degrees (-90 to +90)
  pitchDeg?: number; // Y-axis tilt in degrees (-90 to +90)
  totalTiltDeg?: number;
  accelX?: number;
  accelY?: number;
  accelZ?: number;
  maxAngle?: number; // Full scale display limit (default 15°)
  className?: string;
}

export function TiltInclinometer3D({
  rollDeg,
  pitchDeg,
  totalTiltDeg,
  accelX,
  accelY,
  accelZ,
  maxAngle = 15,
  className,
}: TiltInclinometer3DProps) {
  const hasData = totalTiltDeg !== undefined && totalTiltDeg !== null;

  // Normalize bubble offset in percentage (-50% to +50%)
  const safeRoll = rollDeg ?? 0;
  const safePitch = pitchDeg ?? 0;
  const safeTotalTilt = totalTiltDeg ?? 0;

  const clampRoll = Math.max(-maxAngle, Math.min(maxAngle, safeRoll));
  const clampPitch = Math.max(-maxAngle, Math.min(maxAngle, safePitch));

  const bubbleX = hasData ? (clampRoll / maxAngle) * 38 : 0;
  const bubbleY = hasData ? (clampPitch / maxAngle) * 38 : 0;

  // Determine hazard color state
  const isCritical = hasData && safeTotalTilt >= 7.0;
  const isWarning = hasData && safeTotalTilt >= 3.0 && !isCritical;
  const color = !hasData
    ? "text-slate-400 border-slate-300 bg-slate-100"
    : isCritical
    ? "text-rose-600 border-rose-500 bg-rose-500/10"
    : isWarning
    ? "text-amber-600 border-amber-500 bg-amber-500/10"
    : "text-emerald-600 border-emerald-500 bg-emerald-500/10";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs font-sans",
        className
      )}
    >
      <div className="flex items-center justify-between w-full pb-3 mb-3 border-b border-slate-100 text-xs">
        <span className="font-bold text-slate-800">Dual-Axis Inclinometer Target</span>
        <span className="text-[11px] font-semibold text-slate-500">Gy87 AXL385</span>
      </div>

      <div className="relative flex items-center justify-center size-44 sm:size-48 my-2">
        {/* Outer Circular Gauge Dial */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center shadow-inner">
          {/* Concentric Degree Ring 1: 10° */}
          <div className="size-32 rounded-full border border-slate-300/80 flex items-center justify-center">
            {/* Concentric Degree Ring 2: 5° Warning limit */}
            <div className="size-20 rounded-full border border-amber-300/80 bg-amber-50/20 flex items-center justify-center">
              {/* Concentric Degree Ring 3: Center Safe Zone */}
              <div className="size-8 rounded-full border border-emerald-400/80 bg-emerald-50/40" />
            </div>
          </div>

          {/* Crosshairs */}
          <div className="absolute inset-x-0 h-px bg-slate-300/80" />
          <div className="absolute inset-y-0 w-px bg-slate-300/80" />

          {/* Cardinal Orientation Axis Labels */}
          <span className="absolute top-1.5 text-[10px] font-bold text-slate-400">N (-P)</span>
          <span className="absolute bottom-1.5 text-[10px] font-bold text-slate-400">S (+P)</span>
          <span className="absolute left-1.5 text-[10px] font-bold text-slate-400">W (-R)</span>
          <span className="absolute right-1.5 text-[10px] font-bold text-slate-400">E (+R)</span>
        </div>

        {/* Dynamic Inclination Bubble Indicator */}
        <div
          className={cn(
            "relative size-9 rounded-full border-2 shadow-md transition-all duration-200 flex items-center justify-center",
            !hasData
              ? "bg-slate-300 border-slate-400 shadow-slate-200 opacity-50"
              : isCritical
              ? "bg-rose-500 border-rose-600 shadow-rose-300"
              : isWarning
              ? "bg-amber-400 border-amber-500 shadow-amber-200"
              : "bg-emerald-500 border-emerald-600 shadow-emerald-200"
          )}
          style={{
            transform: `translate(${bubbleX}px, ${bubbleY}px)`,
          }}
        >
          <div className="size-2.5 rounded-full bg-white/90 shadow-xs" />
        </div>
      </div>

      <span className="text-[11px] text-slate-400 mt-1 font-semibold">Full Scale: ±{maxAngle}°</span>

      {/* Telemetry Numeric Readout */}
      <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Tilt</span>
          <span className={cn("text-xl font-extrabold tracking-tight", color)}>
            {hasData ? `${safeTotalTilt.toFixed(2)}°` : "-"}
          </span>
          <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>R: {rollDeg !== undefined && rollDeg !== null ? `${rollDeg.toFixed(1)}°` : "-"}</span>
            <span>P: {pitchDeg !== undefined && pitchDeg !== null ? `${pitchDeg.toFixed(1)}°` : "-"}</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gravity Vector</span>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight block">
            {accelZ !== undefined && accelZ !== null ? (
              <>
                {accelZ.toFixed(2)} <span className="text-xs text-slate-400 font-normal">m/s²</span>
              </>
            ) : (
              "-"
            )}
          </span>
          <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>aX: {accelX !== undefined && accelX !== null ? accelX.toFixed(2) : "-"}</span>
            <span>aY: {accelY !== undefined && accelY !== null ? accelY.toFixed(2) : "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
