"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { DeformationMap } from "@/components/industrial/DeformationMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map as MapIcon,
  Compass,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  Info,
  TrendingDown,
  Radio,
  Sliders,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DeformationMapPage() {
  const { nodes, telemetry, predictions, selectedNodeId, setSelectedNodeId } = useTelemetryContext();
  const [selectedPanel, setSelectedPanel] = useState<string>("ALL");

  const filteredNodes = selectedPanel === "ALL" ? nodes : nodes.filter((n) => n.panelId === selectedPanel);

  // Surface subsidence elevation cross-section data (Profile across extraction centerline)
  const profileData = [
    { distance: "0m (Barrier)", baselineElev: 218.0, currentElev: 218.0, subsidenceMm: 0 },
    { distance: "100m (Pillar)", baselineElev: 217.5, currentElev: 217.4, subsidenceMm: 1.2 },
    { distance: "200m (Flank)", baselineElev: 216.0, currentElev: 215.1, subsidenceMm: 9.0 },
    { distance: "300m (Face)", baselineElev: 214.5, currentElev: 212.8, subsidenceMm: 17.0 },
    { distance: "400m (Trough)", baselineElev: 213.0, currentElev: 210.1, subsidenceMm: 29.0 },
    { distance: "500m (Trough Edge)", baselineElev: 214.0, currentElev: 212.4, subsidenceMm: 16.0 },
    { distance: "600m (Goaf Boundary)", baselineElev: 216.0, currentElev: 215.3, subsidenceMm: 7.0 },
    { distance: "700m (Barrier East)", baselineElev: 217.5, currentElev: 217.5, subsidenceMm: 0 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <MapIcon className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Deformation & Risk Map
              </h1>
              <p className="text-xs text-slate-500">
                Live Geotechnical Surface Displacement & Subsidence Contours · DGMS Coalfield Grid
              </p>
            </div>
          </div>
        </div>

        {/* Panel Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {["ALL", "PANEL-4A", "PANEL-4B"].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={selectedPanel === p ? "default" : "ghost"}
              onClick={() => setSelectedPanel(p)}
              className="h-7 px-3 text-xs font-semibold rounded-lg"
            >
              {p === "ALL" ? "All Panels" : p}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Interactive Map Component */}
      <DeformationMap
        nodes={filteredNodes}
        telemetry={telemetry}
        predictions={predictions}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        className="min-h-[520px]"
      />

      {/* Surface Elevation & Subsidence Trough Cross-Section Profile */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/70 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="size-4 text-orange-600" />
                Surface Elevation & Subsidence Trough Cross-Section (West-East Profile)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Comparing pre-mining surface baseline elevation vs current active ground depression
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono bg-white">
              Centerline Profile AA'
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profileData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="subsidenceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baselineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="distance" tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis domain={[208, 220]} tick={{ fontSize: 10, fill: "#64748B" }} unit="m" />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    borderRadius: "12px",
                    backgroundColor: "#1E293B",
                    color: "#F8FAFC",
                    border: "none",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="baselineElev"
                  name="Pre-Mining Baseline (m)"
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="url(#baselineFill)"
                />
                <Area
                  type="monotone"
                  dataKey="currentElev"
                  name="Current Surface Elevation (m)"
                  stroke="#EA580C"
                  strokeWidth={2.5}
                  fill="url(#subsidenceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Maximum Trough Depth</span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">2.90 m</span>
              <span className="text-[10px] text-slate-400">At Distance 400m (Extraction Face)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Angle of Draw</span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">26.5°</span>
              <span className="text-[10px] text-slate-400">DGMS Standard Coalfield Envelope</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Critical Strain Zone</span>
              <span className="text-lg font-bold font-mono text-rose-700 mt-0.5 block">Nodes 03 & 04</span>
              <span className="text-[10px] text-slate-400">Active High-Hazard Inspection Area</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
