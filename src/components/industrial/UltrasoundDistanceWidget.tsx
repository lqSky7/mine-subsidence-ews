"use client";

import React, { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Dot, StatusBadge } from "@/components/uber/dashboard-primitives";
import { cn } from "@/lib/utils";

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

type WallStatus = "OFFLINE" | "STABLE" | "WATCH" | "CRITICAL";

function getStatus(distance: number | null, warning: number, critical: number): WallStatus {
  if (distance === null) return "OFFLINE";
  if (distance <= critical) return "CRITICAL";
  if (distance <= warning) return "WATCH";
  return "STABLE";
}

function statusTone(status: WallStatus) {
  if (status === "CRITICAL") return "critical";
  if (status === "WATCH") return "watch";
  if (status === "STABLE") return "live";
  return "neutral";
}

function beamColor(status: WallStatus) {
  if (status === "CRITICAL") return "#d1242f";
  if (status === "WATCH") return "#d97706";
  if (status === "STABLE") return "#000000";
  return "#767676";
}

export function UltrasoundDistanceWidget({
  distanceCm,
  baselineCm = 225,
  deltaCm,
  approachRateCmPerMin,
  warningThresholdCm = 50,
  criticalThresholdCm = 25,
  nodeId = "ESP-NODE-01",
  className,
}: UltrasoundDistanceWidgetProps) {
  const gradientId = useId().replace(/:/g, "");
  const [customBaseline, setCustomBaseline] = useState<number | null>(null);

  const currentDistance = distanceCm ?? null;
  const activeBaseline = customBaseline ?? baselineCm ?? 225;
  const displacement =
    currentDistance !== null
      ? Math.round((activeBaseline - currentDistance) * 10) / 10
      : deltaCm ?? 0;
  const status = getStatus(currentDistance, warningThresholdCm, criticalThresholdCm);
  const tone = statusTone(status);
  const color = beamColor(status);

  const maxRange = Math.max(300, activeBaseline + 50);
  const wallPct = currentDistance !== null ? Math.min(100, Math.max(15, (currentDistance / maxRange) * 100)) : 75;
  const baselinePct = Math.min(100, Math.max(15, (activeBaseline / maxRange) * 100));
  const targetX = 58 + (wallPct / 100) * 226;
  const baselineX = 58 + (baselinePct / 100) * 226;

  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:radar-bold-duotone" className="size-4 text-neutral-500" />
            <h3 className="text-base font-semibold text-black dark:text-white">Ultrasound distance</h3>
            <StatusBadge tone={tone}>{status === "STABLE" ? "Stable" : status}</StatusBadge>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {nodeId} / HC-SR04 wall clearance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-2">
            <Dot tone={tone} />
            Warning {warningThresholdCm} cm
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>Critical {criticalThresholdCm} cm</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <svg viewBox="0 0 340 150" className="h-48 w-full text-neutral-400">
            <defs>
              <linearGradient id={`${gradientId}-beam`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <stop offset="70%" stopColor={color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={color} stopOpacity="0.55" />
              </linearGradient>
              <pattern id={`${gradientId}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.18" />
              </pattern>
            </defs>

            <rect width="340" height="150" fill={`url(#${gradientId}-grid)`} />
            <rect x="14" y="28" width="28" height="94" rx="4" fill="currentColor" opacity="0.35" />
            <path d="M 42 52 L 57 62 L 57 88 L 42 98 Z" fill="currentColor" opacity="0.55" />
            <circle cx="58" cy="67" r="5" fill="#000000" opacity="0.85" />
            <circle cx="58" cy="83" r="5" fill="#000000" opacity="0.85" />
            <text x="28" y="140" fill="currentColor" textAnchor="middle" fontSize="9" fontWeight="600">NODE</text>

            {currentDistance !== null && (
              <g opacity="0.75">
                <path d="M 64 65 A 12 12 0 0 1 64 85" fill="none" stroke={color} strokeWidth="1.4" />
                <path d="M 72 58 A 20 20 0 0 1 72 92" fill="none" stroke={color} strokeWidth="1.4" />
                <path d="M 80 51 A 28 28 0 0 1 80 99" fill="none" stroke={color} strokeWidth="1.4" />
              </g>
            )}

            <polygon points={`58,75 ${targetX},40 ${targetX},110`} fill={`url(#${gradientId}-beam)`} />
            <line x1="58" y1="75" x2={targetX} y2="75" stroke={color} strokeWidth="1.5" strokeDasharray="5 4" />

            <g transform={`translate(${targetX}, 0)`}>
              <rect x="0" y="22" width="24" height="106" rx="3" fill="#000000" opacity="0.82" />
              <path d="M 5 32 L 18 42 M 5 56 L 18 66 M 5 80 L 18 90 M 5 104 L 18 114" stroke="#ffffff" strokeOpacity="0.24" strokeWidth="1" />
              <text x="12" y="140" fill="currentColor" textAnchor="middle" fontSize="9" fontWeight="600">WALL</text>
            </g>

            <line x1={baselineX} y1="18" x2={baselineX} y2="132" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
            <text x={baselineX} y="16" fill="currentColor" textAnchor="middle" fontSize="9" fontWeight="600">
              BASE {activeBaseline.toFixed(0)}
            </text>

            <g transform={`translate(${(58 + targetX) / 2}, 66)`}>
              <rect x="-45" y="-15" width="90" height="28" rx="14" fill="#000000" />
              <text x="0" y="3" fill="#ffffff" textAnchor="middle" fontWeight="700" fontSize="12">
                {currentDistance !== null ? `${currentDistance.toFixed(1)} cm` : "NO SIGNAL"}
              </text>
            </g>
          </svg>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 sm:grid-cols-2 lg:grid-cols-1">
          <Metric label="Clearance" value={currentDistance !== null ? currentDistance.toFixed(1) : "--"} unit="cm" />
          <Metric label="Baseline" value={activeBaseline.toFixed(1)} unit="cm" />
          <Metric
            label="Convergence"
            value={displacement > 0 ? `+${displacement.toFixed(1)}` : displacement.toFixed(1)}
            unit="cm"
            tone={displacement > 10 ? "critical" : displacement > 2 ? "watch" : "live"}
          />
          <Metric
            label="Approach rate"
            value={approachRateCmPerMin !== undefined && approachRateCmPerMin !== null ? approachRateCmPerMin.toFixed(2) : "0.00"}
            unit="cm/min"
          />
        </div>
      </div>

      {currentDistance !== null && (
        <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Baseline is used as the zero displacement reference for convergence.
          </p>
          <Button size="sm" variant="outline" onClick={() => setCustomBaseline(currentDistance)}>
            <Icon icon="solar:restart-bold" className="size-3.5" />
            Set current as base
          </Button>
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  tone = "neutral",
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "neutral" | "live" | "watch" | "critical";
}) {
  return (
    <div className="bg-white p-3 dark:bg-neutral-950">
      <div className="text-[11px] font-semibold uppercase text-neutral-500 dark:text-neutral-400">{label}</div>
      <div
        className={cn(
          "mt-1 flex items-baseline gap-1 text-black dark:text-white",
          tone === "live" && "text-emerald-700 dark:text-emerald-300",
          tone === "watch" && "text-amber-700 dark:text-amber-300",
          tone === "critical" && "text-red-700 dark:text-red-300"
        )}
      >
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{unit}</span>
      </div>
    </div>
  );
}
