"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export interface SetpointSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  showTrend?: boolean;
  currentValue?: number;
  className?: string;
}

export function SetpointSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  disabled = false,
  showTrend = false,
  currentValue,
  className,
}: SetpointSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  // Convert disabled to explicit boolean to prevent hydration mismatch
  const isDisabled = Boolean(disabled);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = Number(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    } else {
      setInputValue(value.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
      e.currentTarget.blur();
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const currentPercentage = currentValue !== undefined 
    ? ((currentValue - min) / (max - min)) * 100 
    : null;

  const trend = currentValue !== undefined && showTrend
    ? currentValue < value ? "increasing" : currentValue > value ? "decreasing" : "stable"
    : null;

  // Pre-calculate disabled states to prevent hydration issues
  const decrementDisabled = Boolean(isDisabled || value <= min);
  const incrementDisabled = Boolean(isDisabled || value >= max);

  return (
    <Card className={cn("bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs", className)}>
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Icon icon="solar:target-bold-duotone" className="size-4 text-neutral-500 dark:text-neutral-400" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDecrement}
            disabled={decrementDisabled}
            className="h-12 w-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 shadow-xs disabled:opacity-30"
            size="icon"
          >
            <Icon icon="solar:minus-bold" className="size-5" />
          </Button>

          <div className="flex-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-center border-0 bg-transparent tabular-nums p-0 h-auto focus-visible:ring-0"
            />
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">{unit}</div>
          </div>

          <Button
            onClick={handleIncrement}
            disabled={incrementDisabled}
            className="h-12 w-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 shadow-xs disabled:opacity-30"
            size="icon"
          >
            <Icon icon="solar:add-bold" className="size-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            disabled={isDisabled}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <div className="flex justify-between text-xs font-semibold text-slate-500 tabular-nums">
            <span>{min} {unit}</span>
            <span>{max} {unit}</span>
          </div>
        </div>

        {showTrend && currentValue !== undefined && (
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Current Value</span>
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold uppercase",
                  trend === "increasing" ? "text-emerald-600" :
                  trend === "decreasing" ? "text-rose-600" :
                  "text-slate-600"
                )}>
                  {trend === "increasing" && <Icon icon="solar:chart-2-bold-duotone" className="size-3" />}
                  {trend === "decreasing" && <Icon icon="solar:chart-2-bold-duotone" className="size-3 rotate-180" />}
                  {trend}
                </div>
              )}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {currentValue.toFixed(0)} <span className="text-xs text-slate-500 font-normal">{unit}</span>
            </div>

            <div className="relative h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              {currentPercentage !== null && (
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    trend === "increasing" ? "bg-emerald-500" :
                    trend === "decreasing" ? "bg-rose-500" :
                    "bg-orange-500"
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, currentPercentage))}%` }}
                />
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "MIN", value: min },
            { label: "25%", value: min + (max - min) * 0.25 },
            { label: "50%", value: min + (max - min) * 0.5 },
            { label: "MAX", value: max },
          ].map((preset) => (
            <Button
              key={preset.label}
              onClick={() => onChange(preset.value)}
              disabled={isDisabled}
              variant="outline"
              className="h-7 text-xs font-bold"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
