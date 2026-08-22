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
import { TrendingUp, Download, Layers, Activity, Compass, AlertTriangle } from "lucide-react";
import { generateTelemetryHistory } from "@/data/mock-engine";

export default function TrendsPage() {
  const { nodes } = useTelemetryContext();
  const [metric, setMetric] = useState<"displacement" | "tilt" | "vibration" | "crack">("displacement");
  const [timeRange, setTimeRange] = useState("1h");

  // Generate comparison history across key representative nodes
  const node01History = useMemo(() => generateTelemetryHistory(metric, "NODE-01", 30), [metric, timeRange]);
  const node03History = useMemo(() => generateTelemetryHistory(metric, "NODE-03", 30), [metric, timeRange]);
  const node04History = useMemo(() => generateTelemetryHistory(metric, "NODE-04", 30), [metric, timeRange]);
  const node07History = useMemo(() => generateTelemetryHistory(metric, "NODE-07", 30), [metric, timeRange]);

  const combinedData = useMemo(() => {
    return node01History.map((d, idx) => ({
      time: d.time,
      "NODE-01 (North Barrier)": d.value,
      "NODE-03 (Extraction Face)": node03History[idx]?.value || 0,
      "NODE-04 (Central Trough)": node04History[idx]?.value || 0,
      "NODE-07 (Goaf Perimeter)": node07History[idx]?.value || 0,
    }));
  }, [node01History, node03History, node04History, node07History]);

  const unit = metric === "displacement" ? "mm" : metric === "tilt" ? "°" : metric === "vibration" ? "pulses" : "mm";

  const handleExportCsv = () => {
    const headers = ["Timestamp", "NODE-01", "NODE-03", "NODE-04", "NODE-07"];
    const rows = combinedData.map((d) => [
      d.time,
      d["NODE-01 (North Barrier)"],
      d["NODE-03 (Extraction Face)"],
      d["NODE-04 (Central Trough)"],
      d["NODE-07 (Goaf Perimeter)"],
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mine_subsidence_${metric}_trends.csv`);
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
            <div className="size-8 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-700">
              <TrendingUp className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Multi-Node Geotechnical Trends
              </h1>
              <p className="text-xs text-slate-500">
                Comparative Time-Series Overlay across Mine Extraction Panels
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <Select value={metric} onValueChange={(val: any) => setMetric(val)}>
            <SelectTrigger className="w-[180px] text-xs font-semibold bg-white">
              <SelectValue placeholder="Select Variable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="displacement">Displacement (mm)</SelectItem>
              <SelectItem value="tilt">Ground Tilt (°)</SelectItem>
              <SelectItem value="vibration">Vibration Events</SelectItem>
              <SelectItem value="crack">Crack Aperture (mm)</SelectItem>
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
            Cross-Sector Overlay: {metric.toUpperCase()} ({unit})
          </CardTitle>
          <CardDescription className="text-xs">
            Comparing stable barrier benchmarks (NODE-01) vs extraction trough centers (NODE-03, NODE-04, NODE-07)
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
                  dataKey="NODE-04 (Central Trough)"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="NODE-03 (Extraction Face)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="NODE-07 (Goaf Perimeter)"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="NODE-01 (North Barrier)"
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
