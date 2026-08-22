"use client";

import React from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Battery, Sun, Zap, ShieldCheck, Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PowerAnalyticsPage() {
  const { nodes } = useTelemetryContext();

  const batteryProfile = [
    { hour: "00:00", voltage: 3.82, solarMa: 0 },
    { hour: "03:00", voltage: 3.79, solarMa: 0 },
    { hour: "06:00", voltage: 3.76, solarMa: 15 },
    { hour: "09:00", voltage: 3.88, solarMa: 75 },
    { hour: "12:00", voltage: 4.12, solarMa: 140 },
    { hour: "15:00", voltage: 4.05, solarMa: 90 },
    { hour: "18:00", voltage: 3.94, solarMa: 20 },
    { hour: "21:00", voltage: 3.86, solarMa: 0 },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Zap className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Node Battery & Solar Power Lifecycle
              </h1>
              <p className="text-xs text-slate-500">
                Low-Power Harvesting Analytics · 3.7V LiFePO4 Energy Autonomy & Solar Yield
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mean Battery Rail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-slate-900">3.88 V</div>
            <p className="text-xs text-slate-500 mt-1">Safe Operating Range: 3.4V – 4.2V</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimated Autonomy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-emerald-700">~ 24 Days</div>
            <p className="text-xs text-slate-500 mt-1">Without Direct Sunlight (15mA Sleep)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Solar Peak Current
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-amber-600">140 mA</div>
            <p className="text-xs text-slate-500 mt-1">Monocrystalline 5V 1W Surface Panel</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deep Sleep Duty Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-slate-900">96.8%</div>
            <p className="text-xs text-slate-500 mt-1">ESP32 ULP Sensor Sampling Ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* 24-Hour Solar & Battery Yield Chart */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sun className="size-4 text-amber-600" />
            24-Hour Battery Voltage & Solar Float Charge Profile
          </CardTitle>
          <CardDescription className="text-xs">
            Continuous daytime solar energy generation balancing nighttime LoRa transmission consumption
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={batteryProfile} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" domain={[3.6, 4.3]} tick={{ fontSize: 10 }} unit="V" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="mA" />
                <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace", borderRadius: "10px" }} />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="solarMa"
                  name="Solar Influx (mA)"
                  stroke="#F59E0B"
                  fill="url(#solarYield)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="voltage"
                  name="Battery Voltage (V)"
                  stroke="#10B981"
                  fill="none"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
