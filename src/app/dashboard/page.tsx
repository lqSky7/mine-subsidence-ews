"use client";

import React from "react";
import Link from "next/link";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Compass,
  Activity,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";
import { TiltInclinometer3D } from "@/components/industrial/TiltInclinometer3D";
import { LedMatrixDisplay } from "@/components/industrial/LedMatrixDisplay";

export default function CommandCenterPage() {
  const {
    nodes,
    telemetry,
    alarms,
    thresholds,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    selectedTelemetry,
    triggerActuatorTest,
    acknowledgeAlarm,
  } = useTelemetryContext();

  const node = selectedNode || nodes[0];
  const tel = selectedTelemetry || (node ? telemetry[node.id] : null);

  const activeAlarms = alarms.filter((a) => a.state === "ACTIVE");
  const criticalAlarms = activeAlarms.filter((a) => a.severity === "CRITICAL");
  const hasCriticalHazard = criticalAlarms.length > 0;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Header & Station Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mine Sensor Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-Time Multi-Sensor Telemetry & Early Warning Safety System
          </p>
        </div>

        {/* Multi-Node Station Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Node:</span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {nodes.map((n) => (
              <Button
                key={n.id}
                size="sm"
                variant={selectedNodeId === n.id ? "default" : "ghost"}
                onClick={() => setSelectedNodeId(n.id)}
                className={`h-7 px-3 text-xs font-bold rounded-lg ${
                  selectedNodeId === n.id ? "bg-orange-600 hover:bg-orange-700 text-white" : "text-slate-700"
                }`}
              >
                {n.id}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Hazard Alert Banner */}
      {hasCriticalHazard && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-rose-900 text-sm block">
              CRITICAL HAZARD ALERT: Safety Threshold Breached
            </span>
            <div className="mt-1.5 space-y-1">
              {criticalAlarms.slice(0, 3).map((a) => (
                <div key={a.id} className="flex justify-between items-center text-rose-800 font-medium">
                  <span>[{a.sourceLabel}] {a.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{a.value}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlarm(a.id)}
                      className="h-6 px-2 text-[10px] bg-white border-rose-300 text-rose-900 hover:bg-rose-100 font-bold"
                    >
                      Ack
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Real-Time Sensor Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: MQ2 Gas Sensor */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MQ2 Gas Level</span>
            <div className="size-7 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
              <Flame className="size-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {tel?.gas.mq2Ppm ?? "—"}
            </span>
            <span className="text-xs font-semibold text-slate-500">ppm</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Limit: {thresholds.gasPpmCritical} ppm</span>
            <Badge
              variant={
                tel?.gas.status === "DANGER"
                  ? "destructive"
                  : tel?.gas.status === "WARNING"
                  ? "outline"
                  : "secondary"
              }
              className={`text-[9px] font-bold ${
                tel?.gas.status === "WARNING" ? "bg-amber-100 text-amber-900 border-amber-300" : ""
              }`}
            >
              {tel?.gas.status || "NORMAL"}
            </Badge>
          </div>
        </div>

        {/* Metric 2: Ultrasound Wall Distance */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Wall Clearance</span>
            <div className="size-7 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Radio className="size-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {tel?.ultrasound.distanceCm.toFixed(1) ?? "—"}
            </span>
            <span className="text-xs font-semibold text-slate-500">cm</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Min: {thresholds.wallDistanceMinCriticalCm} cm</span>
            <span
              className={`font-semibold ${
                (tel?.ultrasound.distanceCm ?? 100) <= thresholds.wallDistanceMinCriticalCm
                  ? "text-rose-600 font-bold"
                  : (tel?.ultrasound.distanceCm ?? 100) <= thresholds.wallDistanceMinWarningCm
                  ? "text-amber-600 font-bold"
                  : "text-emerald-600"
              }`}
            >
              {(tel?.ultrasound.distanceCm ?? 100) <= thresholds.wallDistanceMinCriticalCm
                ? "Critical Close"
                : "Clear"}
            </span>
          </div>
        </div>

        {/* Metric 3: MPU 1 (Horizontal Gy87) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MPU 1 (Horizontal)</span>
            <div className="size-7 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Compass className="size-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {tel?.mpu1.totalTiltDeg.toFixed(1) ?? "—"}°
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Tilt</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>R: {tel?.mpu1.rollDeg.toFixed(1)}°</span>
            <span>P: {tel?.mpu1.pitchDeg.toFixed(1)}°</span>
          </div>
        </div>

        {/* Metric 4: MPU 2 (Vertical Gy87) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MPU 2 (Vertical)</span>
            <div className="size-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Compass className="size-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {tel?.mpu2.totalTiltDeg.toFixed(1) ?? "—"}°
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Tilt</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>R: {tel?.mpu2.rollDeg.toFixed(1)}°</span>
            <span>P: {tel?.mpu2.pitchDeg.toFixed(1)}°</span>
          </div>
        </div>

        {/* Metric 5: Vibration Sensor */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Micro-Vibration</span>
            <div className="size-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Activity className="size-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {tel?.vibration.intensity ?? 0}%
            </span>
            <span className="text-xs font-semibold text-slate-500">Intensity</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{tel?.vibration.eventCount ?? 0} pulses</span>
            <span
              className={`font-semibold ${
                tel?.vibration.triggered ? "text-rose-600 font-bold" : "text-emerald-600"
              }`}
            >
              {tel?.vibration.triggered ? "Active Pulse" : "Quiet"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Row: Dual 3D Inclinometers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dual Perpendicular Inclinometers (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inclinometer 1: Horizontal Sensor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Sensor A: MPU-1 (Horizontal / Lateral Axis)
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Gy87 AXL385 #1
                </Badge>
              </div>
              <TiltInclinometer3D
                rollDeg={tel?.mpu1.rollDeg}
                pitchDeg={tel?.mpu1.pitchDeg}
                totalTiltDeg={tel?.mpu1.totalTiltDeg}
                accelX={tel?.mpu1.accelX}
                accelY={tel?.mpu1.accelY}
                accelZ={tel?.mpu1.accelZ}
              />
            </div>

            {/* Inclinometer 2: Vertical Sensor (Perpendicular) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Sensor B: MPU-2 (Vertical / Longitudinal Axis)
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Gy87 AXL385 #2 (Perpendicular)
                </Badge>
              </div>
              <TiltInclinometer3D
                rollDeg={tel?.mpu2.rollDeg}
                pitchDeg={tel?.mpu2.pitchDeg}
                totalTiltDeg={tel?.mpu2.totalTiltDeg}
                accelX={tel?.mpu2.accelX}
                accelY={tel?.mpu2.accelY}
                accelZ={tel?.mpu2.accelZ}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Actuator & Physical Output Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Actuators Control Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="size-4 text-orange-600" />
                  Alert Actuators & Outputs
                </CardTitle>
                <Link href="/dashboard/outputs" className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  Full View <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* 8x8 LED Matrix Live Rendering */}
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <LedMatrixDisplay
                  pattern={tel?.actuators.ledMatrixPattern || "IDLE"}
                  isActive={tel?.actuators.ledMatrixActive ?? true}
                  size="sm"
                />
              </div>

              {/* Buzzer Siren Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center ${
                      tel?.actuators.buzzerActive
                        ? "bg-rose-100 text-rose-700 animate-pulse"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {tel?.actuators.buzzerActive ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Audible Buzzer</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {tel?.actuators.buzzerActive ? "SIREN SOUNDING (2.8 kHz)" : "Silent / Standby"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={tel?.actuators.buzzerActive ? "destructive" : "outline"}
                  onClick={() => triggerActuatorTest("buzzer")}
                  className="h-7 text-xs font-bold"
                >
                  {tel?.actuators.buzzerActive ? "Silence" : "Test"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts Feed Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Recent Alarms ({alarms.length})
                </CardTitle>
                <Link href="/dashboard/alarms" className="text-[11px] font-semibold text-slate-500 hover:text-slate-800">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {alarms.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {alarms.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CircleDot
                            className={`size-3 ${
                              a.severity === "CRITICAL" ? "text-rose-600" : "text-amber-500"
                            }`}
                          />
                          <span className="font-bold text-slate-800">{a.sourceLabel}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-semibold">
                            {a.category}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-[11px]">{a.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">All sensor channels nominal.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
