"use client";

import React, { useMemo } from "react";
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
  const hasData = totalTiltDeg !== undefined && !Number.isNaN(totalTiltDeg);

  const r = rollDeg ?? 0;
  const p = pitchDeg ?? 0;

  // Severity thresholds
  const isCritical = hasData && (totalTiltDeg ?? 0) >= 7.0;
  const isWarning = hasData && (totalTiltDeg ?? 0) >= 3.0 && !isCritical;

  const tone = !hasData ? "neutral" : isCritical ? "critical" : isWarning ? "watch" : "live";

  // SVG Geometry calculations
  const size = 200;
  const center = size / 2;
  const maxRadius = 78; // px corresponding to maxAngle (15°)

  // Clamped angle ratios (-1 to +1)
  const clampedRollRatio = Math.max(-1, Math.min(1, r / maxAngle));
  const clampedPitchRatio = Math.max(-1, Math.min(1, p / maxAngle));

  // Bubble target center coordinates (X: Roll, Y: Pitch)
  const targetX = center + clampedRollRatio * maxRadius;
  const targetY = center + clampedPitchRatio * maxRadius;

  // Concentric ring radii for 5°, 10°, 15°
  const radius5Deg = (5 / maxAngle) * maxRadius;
  const radius10Deg = (10 / maxAngle) * maxRadius;
  const radius15Deg = maxRadius;

  // Calculate Net Acceleration magnitude: sqrt(ax^2 + ay^2 + az^2)
  const netAccel = useMemo(() => {
    if (accelX === undefined || accelY === undefined || accelZ === undefined) {
      return accelZ;
    }
    return Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
  }, [accelX, accelY, accelZ]);

  // Drift vector length from origin
  const driftDistance = Math.hypot(targetX - center, targetY - center);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-neutral-200 bg-white p-4 font-sans text-neutral-950 transition-colors dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
        className
      )}
    >
      {/* Precision Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-900">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Dual-Axis Inclinometer Target
          </div>
          <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            Full Scale: ±{maxAngle}° · Res: 0.05°
          </div>
        </div>
        <div>
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-md border px-2 text-[10px] font-mono font-semibold uppercase tracking-normal",
              tone === "live" && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
              tone === "watch" && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
              tone === "critical" && "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300",
              tone === "neutral" && "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
            )}
          >
            {hasData ? (isCritical ? "Limit Breach" : isWarning ? "Drift Warning" : "IMU Calibrated") : "Standby"}
          </span>
        </div>
      </div>

      {/* Aerospace Reticle HUD Dial */}
      <div className="relative my-3 flex items-center justify-center">
        <div className="relative size-48 sm:size-52">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="size-full select-none"
            aria-label="Inclinometer Target Reticle"
          >
            <defs>
              {/* Radial gradient for safe center pocket */}
              <radialGradient id={`safe-glow-${maxAngle}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="currentColor" className="text-emerald-500/10 dark:text-emerald-400/10" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>

              {/* Warning zone gradient */}
              <radialGradient id={`warning-ring-${maxAngle}`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="transparent" />
                <stop offset="100%" stopColor="currentColor" className="text-amber-500/15 dark:text-amber-400/10" />
              </radialGradient>
            </defs>

            {/* Dial Background Base */}
            <circle
              cx={center}
              cy={center}
              r={radius15Deg}
              className="fill-neutral-50/80 stroke-neutral-200/90 dark:fill-neutral-900/40 dark:stroke-neutral-800"
              strokeWidth="1"
            />

            {/* Safe Center Fill (0° - 5°) */}
            <circle
              cx={center}
              cy={center}
              r={radius5Deg}
              fill={`url(#safe-glow-${maxAngle})`}
            />

            {/* Warning Ring (5° - 10°) */}
            <circle
              cx={center}
              cy={center}
              r={radius10Deg}
              fill={`url(#warning-ring-${maxAngle})`}
              className="stroke-amber-500/30 dark:stroke-amber-400/20"
              strokeWidth="0.75"
              strokeDasharray="2 2"
            />

            {/* 5° Safe Zone Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius5Deg}
              className="fill-none stroke-emerald-500/40 dark:stroke-emerald-400/30"
              strokeWidth="0.75"
            />

            {/* 10° Intermediate Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius10Deg}
              className="fill-none stroke-neutral-300 dark:stroke-neutral-700"
              strokeWidth="0.75"
            />

            {/* 15° Outer Boundary Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius15Deg}
              className="fill-none stroke-neutral-400 dark:stroke-neutral-600"
              strokeWidth="1.2"
            />

            {/* Fine Azimuth Crosshairs */}
            <line
              x1={center - radius15Deg - 4}
              y1={center}
              x2={center + radius15Deg + 4}
              y2={center}
              className="stroke-neutral-300 dark:stroke-neutral-700"
              strokeWidth="0.75"
            />
            <line
              x1={center}
              y1={center - radius15Deg - 4}
              x2={center}
              y2={center + radius15Deg + 4}
              className="stroke-neutral-300 dark:stroke-neutral-700"
              strokeWidth="0.75"
            />

            {/* Center Bore Cross Reticle [ + ] */}
            <line
              x1={center - 5}
              y1={center}
              x2={center + 5}
              y2={center}
              className="stroke-neutral-900 dark:stroke-neutral-100"
              strokeWidth="1.5"
            />
            <line
              x1={center}
              y1={center - 5}
              x2={center}
              y2={center + 5}
              className="stroke-neutral-900 dark:stroke-neutral-100"
              strokeWidth="1.5"
            />

            {/* Angle Marker Ring Ticks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = center + Math.cos(rad) * (radius15Deg - 3);
              const y1 = center + Math.sin(rad) * (radius15Deg - 3);
              const x2 = center + Math.cos(rad) * radius15Deg;
              const y2 = center + Math.sin(rad) * radius15Deg;
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-neutral-400 dark:stroke-neutral-500"
                  strokeWidth="1"
                />
              );
            })}

            {/* Radial Ring Degree Notation (5°, 10°) */}
            <text
              x={center + radius5Deg + 2}
              y={center - 3}
              className="fill-neutral-400 text-[8px] font-mono dark:fill-neutral-500"
            >
              5°
            </text>
            <text
              x={center + radius10Deg + 2}
              y={center - 3}
              className="fill-neutral-400 text-[8px] font-mono dark:fill-neutral-500"
            >
              10°
            </text>

            {/* Dynamic Vector Ray (from origin to current tilt coordinate) */}
            {hasData && driftDistance > 3 && (
              <line
                x1={center}
                y1={center}
                x2={targetX}
                y2={targetY}
                className={cn(
                  "transition-all duration-300",
                  isCritical
                    ? "stroke-red-500/80 stroke-[1.5]"
                    : isWarning
                    ? "stroke-amber-500/80 stroke-[1.5]"
                    : "stroke-emerald-600/60 dark:stroke-emerald-400/60 stroke-[1.2]"
                )}
                strokeDasharray={isCritical ? "none" : "2 2"}
              />
            )}

            {/* Laser Target Collimator / Pip */}
            <g
              transform={`translate(${hasData ? targetX : center}, ${hasData ? targetY : center})`}
              className="transition-transform duration-200 ease-out"
            >
              {/* Outer Target Ring */}
              <circle
                r="11"
                className={cn(
                  "fill-transparent transition-colors",
                  !hasData
                    ? "stroke-neutral-400 dark:stroke-neutral-600"
                    : isCritical
                    ? "stroke-red-600 dark:stroke-red-400"
                    : isWarning
                    ? "stroke-amber-500 dark:stroke-amber-400"
                    : "stroke-emerald-600 dark:stroke-emerald-400"
                )}
                strokeWidth="1.5"
              />

              {/* Target Micro-Ticks (Crosshair reticle on the pip) */}
              <line x1="-14" y1="0" x2="-8" y2="0" className={cn(isCritical ? "stroke-red-600" : isWarning ? "stroke-amber-500" : "stroke-neutral-800 dark:stroke-neutral-200")} strokeWidth="1" />
              <line x1="8" y1="0" x2="14" y2="0" className={cn(isCritical ? "stroke-red-600" : isWarning ? "stroke-amber-500" : "stroke-neutral-800 dark:stroke-neutral-200")} strokeWidth="1" />
              <line x1="0" y1="-14" x2="0" y2="-8" className={cn(isCritical ? "stroke-red-600" : isWarning ? "stroke-amber-500" : "stroke-neutral-800 dark:stroke-neutral-200")} strokeWidth="1" />
              <line x1="0" y1="8" x2="0" y2="14" className={cn(isCritical ? "stroke-red-600" : isWarning ? "stroke-amber-500" : "stroke-neutral-800 dark:stroke-neutral-200")} strokeWidth="1" />

              {/* Inner Solid Target Dot */}
              <circle
                r="3.5"
                className={cn(
                  "transition-colors",
                  !hasData
                    ? "fill-neutral-400 dark:fill-neutral-600"
                    : isCritical
                    ? "fill-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                    : isWarning
                    ? "fill-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    : "fill-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                )}
              />
            </g>
          </svg>

          {/* Cardinal Orientation Labels */}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold tracking-tight text-neutral-500 dark:text-neutral-400">
            N (-P)
          </span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold tracking-tight text-neutral-500 dark:text-neutral-400">
            S (+P)
          </span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold tracking-tight text-neutral-500 dark:text-neutral-400">
            W (-R)
          </span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold tracking-tight text-neutral-500 dark:text-neutral-400">
            E (+R)
          </span>
        </div>
      </div>

      {/* High-Density Tabular Telemetry Grid */}
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-900">
        {/* Total Tilt Readout */}
        <div className="rounded-md border border-neutral-100 bg-neutral-50/60 p-2.5 dark:border-neutral-900 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Total Tilt
            </span>
            <span
              className={cn(
                "size-1.5 rounded-full",
                tone === "critical"
                  ? "bg-red-500 animate-pulse"
                  : tone === "watch"
                  ? "bg-amber-500"
                  : tone === "live"
                  ? "bg-emerald-500"
                  : "bg-neutral-400"
              )}
            />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={cn(
                "text-2xl font-semibold leading-none tabular-nums tracking-tight",
                tone === "critical"
                  ? "text-red-600 dark:text-red-400"
                  : tone === "watch"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-neutral-950 dark:text-neutral-50"
              )}
            >
              {hasData ? totalTiltDeg.toFixed(2) : "—"}
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">°</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
            <span>R: {rollDeg !== undefined ? `${rollDeg.toFixed(1)}°` : "—"}</span>
            <span>P: {pitchDeg !== undefined ? `${pitchDeg.toFixed(1)}°` : "—"}</span>
          </div>
        </div>

        {/* Gravity Vector Readout */}
        <div className="rounded-md border border-neutral-100 bg-neutral-50/60 p-2.5 dark:border-neutral-900 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Gravity Vector
            </span>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">1G ref</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold leading-none tabular-nums tracking-tight text-neutral-950 dark:text-neutral-50">
              {netAccel !== undefined ? netAccel.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">m/s²</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
            <span>aX: {accelX !== undefined ? accelX.toFixed(2) : "—"}</span>
            <span>aY: {accelY !== undefined ? accelY.toFixed(2) : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
