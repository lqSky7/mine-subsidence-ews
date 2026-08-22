"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VibrationDisplay3DProps {
  intensity?: number; // 0 to 100
  peakFreqHz?: number;
  eventCount?: number;
  rmsVelocityMms?: number;
  peakAccelG?: number;
  dominantAxis?: "X" | "Y" | "Z";
  isTriggered?: boolean;
  className?: string;
}

export function VibrationDisplay3D({
  intensity = 0,
  peakFreqHz = 0,
  eventCount = 0,
  rmsVelocityMms = 0,
  peakAccelG = 0,
  dominantAxis = "Z",
  isTriggered = false,
  className,
}: VibrationDisplay3DProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getSeverityLevel = (val: number) => {
    if (val >= 70) return { label: "CRITICAL", color: "text-rose-600", bg: "bg-rose-500" };
    if (val >= 40) return { label: "WARNING", color: "text-amber-600", bg: "bg-amber-500" };
    return { label: "NORMAL", color: "text-emerald-600", bg: "bg-emerald-500" };
  };

  const severity = getSeverityLevel(intensity);

  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs font-sans",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Micro-Vibration Sensor Monitor
          </h3>
          <p className="text-xs text-slate-500">
            SW420 High-Sensitivity Dynamic Shockwave Analysis
          </p>
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold",
            intensity >= 70
              ? "bg-rose-100 text-rose-900"
              : intensity >= 40
              ? "bg-amber-100 text-amber-900"
              : "bg-emerald-100 text-emerald-800"
          )}
        >
          {severity.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Metric 1: Overall Intensity */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
          <span className="text-xs text-slate-500 block font-medium">Vibration Intensity</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-3xl font-bold tracking-tight", severity.color)}>
              {intensity}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", severity.bg)}
              style={{ width: `${intensity}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Triggered Events Count */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
          <span className="text-xs text-slate-500 block font-medium">Pulse Event Count</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {eventCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">Pulses</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-3 block font-medium">
            Status: {isTriggered ? "Sensor Active Pulse" : "Quiet Baseline"}
          </span>
        </div>
      </div>
    </div>
  );
}
