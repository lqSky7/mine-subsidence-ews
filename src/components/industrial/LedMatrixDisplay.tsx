"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { LedMatrixPattern } from "@/types";

interface LedMatrixDisplayProps {
  pattern?: LedMatrixPattern;
  isActive?: boolean;
  color?: "red" | "amber" | "green" | "blue";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onPatternChange?: (pattern: LedMatrixPattern) => void;
  className?: string;
}

const PATTERNS: Record<LedMatrixPattern, number[][]> = {
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
    setFlashState(true);
  }, [pattern]);

  const matrix = PATTERNS[pattern] || PATTERNS.IDLE;

  const dotSizeClass =
    size === "sm" ? "size-2.5 rounded-xs" : size === "lg" ? "size-6 rounded-md" : "size-4 rounded-sm";

  const getDotStyle = (active: boolean) => {
    if (!active || !isActive || !flashState) {
      return "bg-slate-900/90 border border-slate-800 shadow-inner";
    }

    if (pattern === "DANGER_FLASH") {
      return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] border border-rose-400";
    }
    if (pattern === "WARNING_PULSE") {
      return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] border border-amber-300";
    }
    if (pattern === "NORMAL_CHECK") {
      return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] border border-emerald-300";
    }
    if (pattern === "EVACUATE_ARROW") {
      return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] border border-rose-400";
    }
    return "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)] border border-orange-300";
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 8x8 Hardware Matrix Shell */}
      <div className="p-3 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-xl inline-block">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <span className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
            8x8 FLASH LED
          </span>
          <span className="text-slate-400 font-bold uppercase">{pattern}</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5 p-1 bg-black/80 rounded-xl">
          {matrix.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`${dotSizeClass} transition-all duration-150 ${getDotStyle(val === 1)}`}
              />
            ))
          )}
        </div>
      </div>

      {interactive && onPatternChange && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
          {(Object.keys(PATTERNS) as LedMatrixPattern[]).map((pKey) => (
            <Button
              key={pKey}
              size="sm"
              variant={pattern === pKey ? "default" : "outline"}
              onClick={() => onPatternChange(pKey)}
              className="h-6 px-2 text-[10px] font-bold"
            >
              {pKey}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
