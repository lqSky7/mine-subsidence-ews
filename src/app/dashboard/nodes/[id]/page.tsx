"use client";

import React, { use } from "react";
import Link from "next/link";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Activity,
  Radio,
  Battery,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Layers,
  Thermometer,
  Flame,
} from "lucide-react";
import { TiltInclinometer3D } from "@/components/industrial/TiltInclinometer3D";
import { generateTelemetryHistory } from "@/data/mock-engine";
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

export default function NodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const nodeId = resolvedParams.id;

  const { nodes, telemetry, predictions } = useTelemetryContext();

  const node = nodes.find((n) => n.id === nodeId) || nodes[0];
  const tel = telemetry[nodeId] || (node ? telemetry[node.id] : null);
  const pred = predictions[nodeId] || (node ? predictions[node.id] : null);

  const isCritical = node?.riskSeverity === "CRITICAL";
  const isWatch = node?.riskSeverity === "WATCH";

  // Historical telemetry curves for this node
  const dispHistory = generateTelemetryHistory("displacement", nodeId, 30);
  const tiltHistory = generateTelemetryHistory("tilt", nodeId, 30);

  const mergedHistory = dispHistory.map((d, i) => ({
    time: d.time,
    displacement: d.value,
    tilt: tiltHistory[i]?.value || 0,
  }));

  if (!node) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Node {nodeId} not found.</p>
        <Link href="/dashboard/nodes">
          <Button variant="outline" className="mt-4">Back to Fleet</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/nodes">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{node.id}</h1>
              <Badge
                variant={isCritical ? "destructive" : isWatch ? "outline" : "secondary"}
                className={isWatch ? "bg-amber-100 text-amber-900 border-amber-300" : ""}
              >
                {node.riskSeverity}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {node.panelId}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{node.label} · Grid ({node.position.gridX}, {node.position.gridY})</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-mono text-slate-600">
            Lat: {node.position.lat?.toFixed(4)}, Lng: {node.position.lng?.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Top 4 Sensor Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Displacement */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>HC-SR04 Displacement</span>
              <Activity className="size-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {tel ? `+${tel.displacement.deltaMm.toFixed(1)}` : "—"}
              </span>
              <span className="text-xs font-bold text-slate-500">mm</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-mono">
              <div>Rate: {tel?.displacement.rateMmPerHour} mm/hr</div>
              <div>Distance: {tel?.displacement.distanceCm.toFixed(1)} cm</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tilt Angle */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>MPU6050 Ground Tilt</span>
              <Compass className="size-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {tel ? `${tel.tilt.totalTiltDeg.toFixed(2)}` : "—"}
              </span>
              <span className="text-xs font-bold text-slate-500">°</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-mono">
              <div>Roll: {tel?.tilt.rollDeg.toFixed(1)}°</div>
              <div>Pitch: {tel?.tilt.pitchDeg.toFixed(1)}°</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Tension Crack Sensor */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Tension Crack Aperture</span>
              <AlertTriangle className="size-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {tel?.crack.detected ? `${tel.crack.widthEstimateMm.toFixed(1)}` : "0.0"}
              </span>
              <span className="text-xs font-bold text-slate-500">mm</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-mono">
              <div>Status: {tel?.crack.detected ? "Crack Fractured" : "Overburden Intact"}</div>
              <div>Res: {tel?.crack.resistanceOhms} Ω</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Battery & Link Health */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>LoRa Link & Battery</span>
              <Battery className="size-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {node.battery.voltage.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">V ({node.battery.percentage}%)</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-mono">
              <div>RSSI: {node.link.rssi} dBm · SNR: {node.link.snr} dB</div>
              <div>Mesh Hops: {node.link.hops} Hop(s)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Inclinometer Widget (6 cols) */}
        <div className="lg:col-span-6">
          <TiltInclinometer3D
            rollDeg={tel?.tilt.rollDeg}
            pitchDeg={tel?.tilt.pitchDeg}
            totalTiltDeg={tel?.tilt.totalTiltDeg}
            accelX={tel?.tilt.accelX}
            accelY={tel?.tilt.accelY}
            accelZ={tel?.tilt.accelZ}
          />
        </div>

        {/* Right Column: AI Model Prediction Card for Node (6 cols) */}
        <div className="lg:col-span-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="size-4 text-orange-600" />
                  Isolation Forest Subsidence AI Diagnostics
                </CardTitle>
                <Badge
                  variant={isCritical ? "destructive" : isWatch ? "outline" : "secondary"}
                  className="text-[10px]"
                >
                  Score: {pred?.deformationScore.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">Stability Index</span>
                  <span className="text-3xl font-bold font-mono text-slate-900 mt-1 block">
                    {pred ? `${pred.stabilityIndex.toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Time to Critical Envelope</span>
                  <span className="text-xl font-bold font-mono text-orange-700 mt-1 block">
                    {pred?.estimatedTimeToCriticalHours ? `~ ${pred.estimatedTimeToCriticalHours} hrs` : "> 500 hrs"}
                  </span>
                </div>
              </div>

              {pred && pred.factors.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1 text-xs text-amber-950">
                  <span className="font-bold text-amber-900 block">Identified Deformation Factors:</span>
                  {pred.factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="size-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Telemetry Overlay Chart */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Historical Sensor Overlay ({node.id} — Last 30 Minutes)
          </CardTitle>
          <CardDescription className="text-xs">
            Correlated time series showing vertical displacement vs ground tilt inclination
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} unit="mm" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="°" />
                <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="displacement"
                  name="Displacement (mm)"
                  stroke="#EA580C"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tilt"
                  name="Ground Tilt (°)"
                  stroke="#3B82F6"
                  strokeWidth={2}
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
