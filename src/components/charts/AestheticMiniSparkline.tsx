"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";

interface AestheticMiniSparklineProps {
  data: number[];
  color?: string;
  gradientId?: string;
  height?: number;
  showDot?: boolean;
  strokeWidth?: number;
  className?: string;
}

export function AestheticMiniSparkline({
  data = [],
  color = "#F97316",
  gradientId = "sparkline-grad",
  height = 36,
  showDot = true,
  strokeWidth = 2,
  className = "",
}: AestheticMiniSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg ${className}`}
        style={{ height }}
      >
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          — No Stream —
        </span>
      </div>
    );
  }

  const chartData = data.map((val, idx) => ({ i: idx, val: isNaN(val) ? 0 : val }));
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const padding = (maxVal - minVal) * 0.1 || 1;

  const uniqueId = `${gradientId}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <YAxis domain={[minVal - padding, maxVal + padding]} hide />
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${uniqueId})`}
            isAnimationActive={false}
            dot={
              showDot
                ? ({ cx = 0, cy = 0, index = 0 }: { cx?: number; cy?: number; index?: number }) => {
                    if (index === chartData.length - 1) {
                      return (
                        <g key="latest-dot">
                          <circle
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill={color}
                            opacity={0.3}
                            className="animate-ping"
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={3}
                            fill={color}
                            stroke="#ffffff"
                            strokeWidth={1.5}
                          />
                        </g>
                      );
                    }
                    return <React.Fragment key={index} />;
                  }
                : false
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
