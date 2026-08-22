"use client";

import React, { useState, useMemo } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Download, Layers } from "lucide-react";
import { generateTelemetryHistory } from "@/data/mock-engine";

export default function TrendsPage() {
  const { nodes } = useTelemetryContext();
  const [metric, setMetric] = useState<"gasPpm" | "wallDistanceCm" | "tiltMpu1" | "tiltMpu2" | "vibrationIntensity">("gasPpm");
  const [timeRange, setTimeRange] = useState("1h");

  // Generate comparison history across nodes
  const node01History = useMemo(() => generateTelemetryHistory("ESP-NODE-01", 30), [metric, timeRange]);
  const node02History = useMemo(() => generateTelemetryHistory("ESP-NODE-02", 30), [metric, timeRange]);
  const node03History = useMemo(() => generateTelemetryHistory("ESP-NODE-03", 30), [metric, timeRange]);
  const node04History = useMemo(() => generateTelemetryHistory("ESP-NODE-04", 30), [metric, timeRange]);

  const combinedData = useMemo(() => {
    return node01History.map((d, idx) => ({
      time: d.time,
      "ESP-NODE-01 (Chamber 1)": d[metric] as number,
      "ESP-NODE-02 (Chamber 2)": (node02History[idx]?.[metric] as number) || 0,
      "ESP-NODE-03 (Chamber 3)": (node03History[idx]?.[metric] as number) || 0,
      "ESP-NODE-04 (Chamber 4)": (node04History[idx]?.[metric] as number) || 0,
    }));
  }, [node01History, node02History, node03History, node04History, metric]);

  const metricLabel =
    metric === "gasPpm"
      ? "MQ2 Gas Level (ppm)"
      : metric === "wallDistanceCm"
      ? "Ultrasound Wall Clearance (cm)"
      : metric === "tiltMpu1"
      ? "MPU-1 Horizontal Tilt (°)"
      : metric === "tiltMpu2"
      ? "MPU-2 Vertical Tilt (°)"
      : "Micro-Vibration Intensity (%)";

  const unit =
    metric === "gasPpm"
      ? "ppm"
      : metric === "wallDistanceCm"
      ? "cm"
      : metric === "tiltMpu1" || metric === "tiltMpu2"
      ? "°"
      : "%";

  const handleExportCsv = () => {
    const headers = ["Timestamp", "ESP-NODE-01", "ESP-NODE-02", "ESP-NODE-03", "ESP-NODE-04"];
    const rows = combinedData.map((d) => [
      d.time,
      d["ESP-NODE-01 (Chamber 1)"],
      d["ESP-NODE-02 (Chamber 2)"],
      d["ESP-NODE-03 (Chamber 3)"],
      d["ESP-NODE-04 (Chamber 4)"],
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mine_${metric}_trends.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shadow-xs">
              <TrendingUp className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Multi-Sensor Geotechnical Trends
              </h1>
              <p className="text-xs text-slate-500">
                Comparative Time-Series Overlay across ESP Node Stations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <Select value={metric} onValueChange={(val: any) => setMetric(val)}>
            <SelectTrigger className="w-[200px] text-xs font-semibold bg-white">
              <SelectValue placeholder="Select Sensor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasPpm">MQ2 Gas (ppm)</SelectItem>
              <SelectItem value="wallDistanceCm">Wall Clearance (cm)</SelectItem>
              <SelectItem value="tiltMpu1">MPU-1 Horizontal Tilt (°)</SelectItem>
              <SelectItem value="tiltMpu2">MPU-2 Vertical Tilt (°)</SelectItem>
              <SelectItem value="vibrationIntensity">Vibration Intensity (%)</SelectItem>
            </SelectContent>
          </Select>

          {/* Time range */}
          <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val || "1h")}>
            <SelectTrigger className="w-[120px] text-xs font-semibold bg-white">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">Last 15 Mins</SelectItem>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" onClick={handleExportCsv} className="h-9 px-3 gap-1.5 text-xs bg-white font-semibold">
            <Download className="size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main Trends Chart Card */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="size-4 text-orange-600" />
            Cross-Station Overlay: {metricLabel}
          </CardTitle>
          <CardDescription className="text-xs">
            Comparing working face stations (ESP-01, ESP-02) vs return airway and intake shaft (ESP-03, ESP-04)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit={unit} />
                <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace", borderRadius: "10px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line
                  type="monotone"
                  dataKey="ESP-NODE-02 (Chamber 2)"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ESP-NODE-01 (Chamber 1)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ESP-NODE-03 (Chamber 3)"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ESP-NODE-04 (Chamber 4)"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
