"use client";

import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface VibrationDisplay3DProps {
  accelX: number | string;
  accelY: number | string;
  accelZ: number | string;
  gyroX: number | string;
  gyroY: number | string;
  gyroZ: number | string;
  className?: string;
}

export function VibrationDisplay3D({
  accelX,
  accelY,
  accelZ,
  gyroX,
  gyroY,
  gyroZ,
  className,
}: VibrationDisplay3DProps) {
  const hasData = typeof accelX === "number" && typeof accelY === "number" && typeof accelZ === "number";

  // Calculate RMS magnitude for overall vibration severity
  const rms = useMemo(() => {
    if (!hasData) return null;
    const x = typeof accelX === "number" ? accelX : 0;
    const y = typeof accelY === "number" ? accelY : 0;
    const z = typeof accelZ === "number" ? accelZ : 0;
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  }, [accelX, accelY, accelZ, hasData]);

  // Determine severity based on RMS
  const getSeverity = () => {
    if (rms === null) return { label: "N/A", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-300" };
    if (rms > 5) return { label: "HIGH", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-500" };
    if (rms > 2) return { label: "MODERATE", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-500" };
    return { label: "LOW", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-500" };
  };

  const severity = getSeverity();

  return (
    <div className={cn("flex flex-col bg-white rounded-lg border border-slate-300 shadow-md p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <Activity className="size-4" />
          MPU6050 6-Axis IMU
        </span>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold border-2",
          severity.bg,
          severity.color,
          severity.border
        )}>
          {severity.label}
        </div>
      </div>

      {/* RMS Magnitude Display */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-300 mb-4">
        <div className="text-center">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            RMS Magnitude
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className={cn("text-3xl font-mono font-bold tabular-nums", severity.color)}>
              {rms !== null ? rms.toFixed(2) : "-"}
            </span>
            <span className="text-sm font-semibold text-slate-500">g</span>
          </div>
        </div>
      </div>

      {/* 6-Axis Data Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Accelerometer X */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-300">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Accel X
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
              {typeof accelX === "number" ? accelX.toFixed(2) : "-"}
            </span>
            <span className="text-xs text-slate-500">g</span>
          </div>
          {/* Mini bar indicator */}
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: typeof accelX === "number" ? `${Math.min(100, Math.abs(accelX) * 20)}%` : "0%" }}
            />
          </div>
        </div>

        {/* Accelerometer Y */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-300">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Accel Y
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
              {typeof accelY === "number" ? accelY.toFixed(2) : "-"}
            </span>
            <span className="text-xs text-slate-500">g</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: typeof accelY === "number" ? `${Math.min(100, Math.abs(accelY) * 20)}%` : "0%" }}
            />
          </div>
        </div>

        {/* Accelerometer Z */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-300">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Accel Z
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
              {typeof accelZ === "number" ? accelZ.toFixed(2) : "-"}
            </span>
            <span className="text-xs text-slate-500">g</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: typeof accelZ === "number" ? `${Math.min(100, Math.abs(accelZ) * 20)}%` : "0%" }}
            />
          </div>
        </div>

        {/* Gyroscope X */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-300">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Gyro X
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
              {typeof gyroX === "number" ? gyroX.toFixed(1) : "-"}
            </span>
            <span className="text-xs text-slate-500">°/s</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: typeof gyroX === "number" ? `${Math.min(100, Math.abs(gyroX) / 2)}%` : "0%" }}
            />
          </div>
        </div>

        {/* Gyroscope Y */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-300">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Gyro Y
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
              {typeof gyroY === "number" ? gyroY.toFixed(1) : "-"}
            </span>
            <span className="text-xs text-slate-500">°/s</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: typeof gyroY === "number" ? `${Math.min(100, Math.abs(gyroY) / 2)}%` : "0%" }}
            />
          </div>
        </div>

        {/* Gyroscope Z */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-300">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Gyro Z
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
              {typeof gyroZ === "number" ? gyroZ.toFixed(1) : "-"}
            </span>
            <span className="text-xs text-slate-500">°/s</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: typeof gyroZ === "number" ? `${Math.min(100, Math.abs(gyroZ) / 2)}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="size-3 bg-blue-500 rounded"></div>
          <span>Accelerometer</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 bg-purple-500 rounded"></div>
          <span>Gyroscope</span>
        </div>
      </div>
    </div>
  );
}
