"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { AestheticChartTooltip } from "./ChartTooltip";

interface ComponentCostItem {
  name: string;
  category: string;
  costInr: number;
  color: string;
  percentage?: number;
}

const hardwareCostData: ComponentCostItem[] = [
  { name: "Main ESP32 MCU", category: "Compute & Comm", costInr: 240, color: "#EA580C" },
  { name: "MPU #1 (Horizontal)", category: "Sensors", costInr: 180, color: "#8B5CF6" },
  { name: "MPU #2 (Vertical)", category: "Sensors", costInr: 180, color: "#6366F1" },
  { name: "8x8 LED Matrix", category: "Actuators", costInr: 130, color: "#EC4899" },
  { name: "MQ-2 Gas Sensor", category: "Sensors", costInr: 110, color: "#F59E0B" },
  { name: "Ultrasound Transducer", category: "Sensors", costInr: 95, color: "#3B82F6" },
  { name: "Vibration Sensor", category: "Sensors", costInr: 45, color: "#10B981" },
  { name: "Piezo Buzzer (85dB)", category: "Actuators", costInr: 35, color: "#06B6D4" },
];

export function AestheticHardwareCostDonut({ className = "" }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalCost = hardwareCostData.reduce((acc, item) => acc + item.costInr, 0);

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Hardware Component Cost Allocation
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Breakdown of ₹{totalCost} total BOM per station
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ₹{totalCost} INR
          </span>
          <span className="text-[10px] text-slate-400 block">&lt; $13 USD Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center p-5 gap-6">
        {/* Donut Chart with Center Label */}
        <div className="relative h-60 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={
                  <AestheticChartTooltip
                    formatter={(val) => `₹${val} (${(((Number(val) || 0) / totalCost) * 100).toFixed(1)}%)`}
                  />
                }
              />
              <Pie
                data={hardwareCostData}
                dataKey="costInr"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                cornerRadius={4}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {hardwareCostData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    stroke="none"
                    className="transition-all duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {activeIndex !== null ? hardwareCostData[activeIndex].name : "Station BOM"}
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              ₹{activeIndex !== null ? hardwareCostData[activeIndex].costInr : totalCost}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {activeIndex !== null
                ? `${((hardwareCostData[activeIndex].costInr / totalCost) * 100).toFixed(1)}% of total`
                : "Complete Unit"}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-1.5 text-xs">
          {hardwareCostData.map((item, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-100 dark:bg-slate-800 scale-[1.02]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ₹{item.costInr}
                  </span>
                  <span className="text-[10px] text-slate-400 w-10 text-right">
                    {((item.costInr / totalCost) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
