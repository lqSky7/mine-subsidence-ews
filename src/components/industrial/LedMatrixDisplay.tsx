"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { LedMatrixPattern } from "@/types";
import { cn } from "@/lib/utils";

interface LedMatrixDisplayProps {
  pattern?: LedMatrixPattern;
  isActive?: boolean;
  color?: "red" | "amber" | "green" | "blue";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onPatternChange?: (pattern: LedMatrixPattern) => void;
  className?: string;
}

export const PATTERNS: Record<LedMatrixPattern, number[][]> = {
  IDLE: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  NORMAL_CHECK: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  WARNING_PULSE: [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  DANGER_FLASH: [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ],
  EVACUATE_ARROW: [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
  ],
};

export function LedMatrixDisplay({
  pattern = "IDLE",
  isActive = true,
  size = "md",
  interactive = false,
  onPatternChange,
  className = "",
}: LedMatrixDisplayProps) {
  const [flashState, setFlashState] = useState(true);

  useEffect(() => {
    if (pattern === "DANGER_FLASH" || pattern === "WARNING_PULSE") {
      const interval = setInterval(() => {
        setFlashState((prev) => !prev);
      }, pattern === "DANGER_FLASH" ? 350 : 600);
      return () => clearInterval(interval);
    }
  }, [pattern]);

  const matrix = PATTERNS[pattern] || PATTERNS.IDLE;

  const activeDiodeCount = useMemo(() => {
    let count = 0;
    matrix.forEach((row) => {
      row.forEach((val) => {
        if (val === 1) count++;
      });
    });
    return count;
  }, [matrix]);

  // Diode sizing based on prop
  const dotSizeClass =
    size === "sm"
      ? "size-2 rounded-xs"
      : size === "lg"
      ? "size-5 sm:size-6 rounded-sm"
      : "size-3.5 sm:size-4 rounded-xs";

  const gapClass = size === "sm" ? "gap-1" : size === "lg" ? "gap-2" : "gap-1.5";

  const getDotStyle = (active: boolean) => {
    if (!active || !isActive || !flashState) {
      return "bg-neutral-900/90 border border-neutral-800/60 shadow-inner";
    }

    if (pattern === "DANGER_FLASH" || pattern === "EVACUATE_ARROW") {
      return "bg-red-500 border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.95)]";
    }
    if (pattern === "WARNING_PULSE") {
      return "bg-amber-400 border border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.95)]";
    }
    if (pattern === "NORMAL_CHECK") {
      return "bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.95)]";
    }
    return "bg-neutral-100 border border-white shadow-[0_0_6px_rgba(255,255,255,0.9)]";
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Industrial Chassis */}
      <div className="relative rounded-lg border border-neutral-800 bg-neutral-950 p-3 shadow-lg select-none">
        {/* Top Hardware Header Strip */}
        <div className="mb-2.5 flex items-center justify-between border-b border-neutral-800/80 pb-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full",
                isActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"
              )}
            />
            <span className="font-semibold uppercase tracking-wider text-neutral-300">
              8×8 FLASH LED
            </span>
          </div>
          <span className="rounded bg-neutral-900 px-1.5 py-0.5 font-bold uppercase tracking-tight text-neutral-400">
            {pattern}
          </span>
        </div>

        {/* 8x8 Diode Grid Container */}
        <div className={cn("grid grid-cols-8 rounded-md bg-black/90 p-1.5", gapClass)}>
          {matrix.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={cn(
                  dotSizeClass,
                  "transition-all duration-150 ease-out",
                  getDotStyle(val === 1)
                )}
              />
            ))
          )}
        </div>

        {/* Sub-telemetry strip for md/lg sizes */}
        {size !== "sm" && (
          <div className="mt-2.5 flex items-center justify-between border-t border-neutral-800/80 pt-1.5 text-[9px] font-mono text-neutral-500">
            <span>WS2812 RGB (8×8) · 64-BIT</span>
            <span>{activeDiodeCount}/64 ACTIVE</span>
          </div>
        )}
      </div>

      {/* Interactive Pattern Controls */}
      {interactive && onPatternChange && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {(Object.keys(PATTERNS) as LedMatrixPattern[]).map((pKey) => {
            const isSelected = pattern === pKey;
            return (
              <Button
                key={pKey}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => onPatternChange(pKey)}
                className={cn(
                  "h-7 px-2.5 text-[11px] font-mono font-medium transition-all",
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
                )}
              >
                {pKey.replace("_", " ")}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
