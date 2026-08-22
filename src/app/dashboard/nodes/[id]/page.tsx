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
  ArrowLeft,
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

  const { nodes, telemetry } = useTelemetryContext();

  const node = nodes.find((n) => n.id === nodeId) || nodes[0];
  const tel = telemetry[nodeId] || (node ? telemetry[node.id] : null);

  const isCritical = node?.riskSeverity === "CRITICAL";
  const isWatch = node?.riskSeverity === "WATCH";

  const historyData: Array<{ time: string; gasPpm: number; wallDistanceCm: number; tiltMpu1: number }> = [];

  if (!node) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Node {nodeId} not found. Awaiting data from backend.</p>
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
              <Badge variant="outline" className="font-semibold text-xs">
                {node.location}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{node.label} · IP: {node.ipAddress}</p>
          </div>
        </div>
      </div>

      {/* Top 4 Sensor Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MQ2 Gas Sensor */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>MQ2 Gas Sensor</span>
              <Flame className="size-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {tel?.gas?.mq2Ppm != null ? tel.gas.mq2Ppm : "-"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {tel?.gas?.mq2Ppm != null ? "ppm" : ""}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-medium">
              <div>Status: {tel?.gas?.status || "-"}</div>
              <div>Raw ADC: {tel?.gas?.rawAdc != null ? `${tel.gas.rawAdc} / 4095` : "-"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Ultrasound Wall Distance */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Ultrasound Wall Distance</span>
              <Radio className="size-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {tel?.ultrasound?.distanceCm != null ? `${tel.ultrasound.distanceCm.toFixed(1)}` : "-"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {tel?.ultrasound?.distanceCm != null ? "cm" : ""}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-medium">
              <div>Baseline: {tel?.ultrasound?.baselineCm != null ? `${tel.ultrasound.baselineCm} cm` : "-"}</div>
              <div>Delta: {tel?.ultrasound?.deltaCm != null ? `-${tel.ultrasound.deltaCm} cm` : "-"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: MPU 1 (Horizontal) */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>MPU 1 (Horizontal Gy87)</span>
              <Compass className="size-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {tel?.mpu1?.totalTiltDeg != null ? `${tel.mpu1.totalTiltDeg.toFixed(2)}` : "-"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {tel?.mpu1?.totalTiltDeg != null ? "°" : ""}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-medium">
              <div>
                Roll: {tel?.mpu1?.rollDeg != null ? `${tel.mpu1.rollDeg.toFixed(1)}°` : "-"} · Pitch: {tel?.mpu1?.pitchDeg != null ? `${tel.mpu1.pitchDeg.toFixed(1)}°` : "-"}
              </div>
              <div>Accel Z: {tel?.mpu1?.accelZ != null ? `${tel.mpu1.accelZ.toFixed(2)} m/s²` : "-"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: MPU 2 (Vertical Perpendicular) */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>MPU 2 (Vertical Gy87)</span>
              <Compass className="size-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {tel?.mpu2?.totalTiltDeg != null ? `${tel.mpu2.totalTiltDeg.toFixed(2)}` : "-"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {tel?.mpu2?.totalTiltDeg != null ? "°" : ""}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-medium">
              <div>
                Roll: {tel?.mpu2?.rollDeg != null ? `${tel.mpu2.rollDeg.toFixed(1)}°` : "-"} · Pitch: {tel?.mpu2?.pitchDeg != null ? `${tel.mpu2.pitchDeg.toFixed(1)}°` : "-"}
              </div>
              <div>Accel Z: {tel?.mpu2?.accelZ != null ? `${tel.mpu2.accelZ.toFixed(2)} m/s²` : "-"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dual Inclinometer Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700">Sensor A: Horizontal MPU (Gy87 AXL385)</span>
          <TiltInclinometer3D
            rollDeg={tel?.mpu1?.rollDeg}
            pitchDeg={tel?.mpu1?.pitchDeg}
            totalTiltDeg={tel?.mpu1?.totalTiltDeg}
            accelX={tel?.mpu1?.accelX}
            accelY={tel?.mpu1?.accelY}
            accelZ={tel?.mpu1?.accelZ}
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700">Sensor B: Vertical MPU (Perpendicular Gy87 AXL385)</span>
          <TiltInclinometer3D
            rollDeg={tel?.mpu2?.rollDeg}
            pitchDeg={tel?.mpu2?.pitchDeg}
            totalTiltDeg={tel?.mpu2?.totalTiltDeg}
            accelX={tel?.mpu2?.accelX}
            accelY={tel?.mpu2?.accelY}
            accelZ={tel?.mpu2?.accelZ}
          />
        </div>
      </div>

      {/* Historical Telemetry Overlay Chart */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Real-Time Telemetry History ({node.id})
          </CardTitle>
          <CardDescription className="text-xs">
            Correlated multi-sensor time-series showing Gas (ppm), Wall Clearance (cm), and Tilt (°)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {historyData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} unit="ppm" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="cm" />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="gasPpm"
                    name="MQ2 Gas (ppm)"
                    stroke="#EA580C"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="wallDistanceCm"
                    name="Wall Clearance (cm)"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tiltMpu1"
                    name="MPU-1 Tilt (°)"
                    stroke="#8B5CF6"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 w-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <span>-</span>
              <span className="text-[11px] text-slate-400 mt-1 font-medium">Awaiting backend historical telemetry data</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
