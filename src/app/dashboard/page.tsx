"use client";

import React from "react";
import Link from "next/link";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Activity,
  Sparkles,
  AlertTriangle,
  Radio,
  BellRing,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  Bot,
  Map as MapIcon,
  Layers,
  RotateCcw,
  Zap,
  Flame,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import { DeformationMap } from "@/components/industrial/DeformationMap";

export default function CommandCenterPage() {
  const {
    nodes,
    telemetry,
    predictions,
    alarms,
    selectedNodeId,
    setSelectedNodeId,
    triggerFaultSimulation,
  } = useTelemetryContext();

  const activeAlarms = alarms.filter((a) => a.state === "ACTIVE");
  const criticalAlarms = activeAlarms.filter((a) => a.severity === "CRITICAL");
  const hasCriticalHazard = criticalAlarms.length > 0;

  // Aggregate Key Geotechnical Metrics across fleet
  const maxDispMm = Math.max(
    ...Object.values(telemetry).map((t) => t.displacement.deltaMm),
    0
  );
  const maxTiltDeg = Math.max(
    ...Object.values(telemetry).map((t) => t.tilt.totalTiltDeg),
    0
  );
  const maxCrackMm = Math.max(
    ...Object.values(telemetry).map((t) => t.crack.widthEstimateMm),
    0
  );

  // Overall Mine Panel Stability Index (weighted minimum of active extraction nodes)
  const lowestStability = Math.min(
    ...Object.values(predictions).map((p) => p.stabilityIndex),
    100
  );
  const criticalNode = nodes.find((n) => n.riskSeverity === "CRITICAL") || nodes[0];
  const criticalPred = predictions[criticalNode?.id] || null;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mine Subsidence Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-Enabled Low-Cost Wireless Surface Mesh Early-Warning System · Panel 4A / 4B
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/map">
            <Button size="sm" className="h-8 gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-xs">
              <MapIcon className="size-3.5" /> Full Deformation Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Hazard Alert Banner */}
      {hasCriticalHazard && (
        <div className="bg-[#FFF5F5] border border-[#FEE2E2] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-rose-900 text-sm block">
              Subsidence Hazard Alert: Critical Threshold Exceeded
            </span>
            <div className="mt-1.5 space-y-1">
              {criticalAlarms.slice(0, 3).map((a) => (
                <div key={a.id} className="flex justify-between text-rose-800 font-medium">
                  <span>[{a.sourceLabel}] {a.description} ({a.value})</span>
                  <span className="text-rose-500 font-mono">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Key Geotechnical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Peak Subsidence Displacement */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">Max Displacement</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              +{maxDispMm.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">mm</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Critical: &gt; 25.0 mm</span>
            <span className={maxDispMm > 25 ? "font-bold text-rose-700" : "font-semibold text-emerald-700"}>
              {maxDispMm > 25 ? "Critical Trough" : "Within Envelope"}
            </span>
          </div>
        </div>

        {/* Metric 2: Peak Ground Tilt */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">Peak Ground Tilt</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Compass className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {maxTiltDeg.toFixed(1)}°
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Limit: &lt; 4.5°</span>
            <span className={maxTiltDeg > 4.5 ? "font-bold text-rose-700" : "font-semibold text-emerald-700"}>
              {maxTiltDeg > 4.5 ? "High Incline" : "Stable Slope"}
            </span>
          </div>
        </div>

        {/* Metric 3: Tension Crack Width */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">Surface Fractures</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <ShieldAlert className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {maxCrackMm > 0 ? `${maxCrackMm.toFixed(1)} mm` : "0.0 mm"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Overburden Status</span>
            <span className={maxCrackMm > 1.5 ? "font-bold text-rose-700" : "font-semibold text-emerald-700"}>
              {maxCrackMm > 1.5 ? "Crack Widening" : "No Cracks"}
            </span>
          </div>
        </div>

        {/* Metric 4: AI Stability Index */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">AI Stability Index</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {lowestStability.toFixed(1)}%
            </span>
          </div>
          <div className="mt-3">
            <Progress
              value={lowestStability}
              className={`h-1.5 bg-orange-200/50 ${
                lowestStability > 75
                  ? "[&>div]:bg-emerald-600"
                  : lowestStability > 50
                  ? "[&>div]:bg-amber-500"
                  : "[&>div]:bg-rose-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Deformation Map & Interactive Test Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Surface Deformation Map Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Surface Deformation & Risk Zones</h2>
              </div>
              <Link href="/dashboard/map" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                Open Full Map <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <DeformationMap
              nodes={nodes}
              telemetry={telemetry}
              predictions={predictions}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              isCompact={false}
            />
          </div>

          {/* Interactive Fault Simulation Controls */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-orange-600" />
                <h3 className="text-sm font-bold text-slate-900">Geotechnical Fault & Event Simulator</h3>
              </div>
              <span className="text-[11px] text-slate-400">Live testbed simulation triggers</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerFaultSimulation("SUBSIDENCE_SURGE")}
                className="h-8 px-3 text-xs bg-white border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold"
              >
                <Activity className="size-3.5 mr-1.5" /> Simulate Rapid Subsidence (+16mm)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerFaultSimulation("CRACK_BURST")}
                className="h-8 px-3 text-xs bg-white border-amber-200 text-amber-800 hover:bg-amber-50 rounded-xl font-semibold"
              >
                <AlertTriangle className="size-3.5 mr-1.5" /> Simulate Overburden Crack
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerFaultSimulation("SEISMIC_EVENT")}
                className="h-8 px-3 text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-semibold"
              >
                <Radio className="size-3.5 mr-1.5" /> Simulate Micro-Seismic Swarm
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Geotechnical Advisor & Recent Alarms (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Geotechnical Prediction Card */}
          <div
            className={`p-6 rounded-2xl border shadow-xs transition-all ${
              criticalPred?.severity === "CRITICAL"
                ? "bg-[#FFF5F5] border-[#FEE2E2]"
                : criticalPred?.severity === "WATCH"
                ? "bg-[#FFFBF0] border-[#FBEEC8]"
                : "bg-[#F3FAF5] border-[#E0EFE5]"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`size-8 rounded-xl flex items-center justify-center ${
                    criticalPred?.severity === "CRITICAL"
                      ? "bg-rose-100 text-rose-800"
                      : criticalPred?.severity === "WATCH"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  <Bot className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {criticalPred?.severity === "CRITICAL"
                      ? "Critical Subsidence Anomaly"
                      : criticalPred?.severity === "WATCH"
                      ? "Elevated Geotechnical Watch"
                      : "Overburden Nominal"}
                  </h2>
                  <p className="text-xs text-slate-500">Isolation Forest Edge Subsidence Model</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  criticalPred?.severity === "CRITICAL"
                    ? "bg-rose-100 text-rose-900"
                    : criticalPred?.severity === "WATCH"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {criticalPred?.severity || "STABLE"}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-black/[0.04]">
                <div>
                  <span className="text-xs text-slate-500 block">Deformation Score</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                    {criticalPred?.deformationScore !== undefined ? `${criticalPred.deformationScore > 0 ? "+" : ""}${criticalPred.deformationScore.toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Stability Index</span>
                  <span
                    className={`text-2xl font-bold font-mono mt-0.5 block tabular-nums ${
                      criticalPred?.severity === "CRITICAL"
                        ? "text-rose-700"
                        : criticalPred?.severity === "WATCH"
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {criticalPred ? `${criticalPred.stabilityIndex.toFixed(1)}%` : "—"}
                  </span>
                </div>
              </div>

              {/* Diagnostic Factors */}
              {criticalPred && criticalPred.factors.length > 0 ? (
                <div className="p-3.5 bg-white/90 border border-rose-200/80 rounded-xl space-y-1.5 text-xs text-rose-950">
                  <span className="font-bold text-rose-900 block">Early Warning Contributing Factors:</span>
                  {criticalPred.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium px-1">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Ground movement rates within safe DGMS statutory envelope</span>
                </div>
              )}

              <Link
                href="/dashboard/analytics/predictive"
                className="inline-flex items-center justify-center w-full gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-orange-100/90 text-orange-950 hover:bg-orange-200/90 transition-colors"
              >
                <span>Inspect Live Model Inference Stream</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Recent Early Warning Alerts */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <BellRing className="size-4.5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Recent Early Warning Alerts</h2>
              </div>
              <Link href="/dashboard/alarms" className="text-xs text-slate-500 hover:text-slate-800 font-semibold">
                View All ({alarms.length})
              </Link>
            </div>

            <div className="mt-4">
              {alarms.length > 0 ? (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {alarms.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CircleDot
                            className={`size-3 ${
                              a.severity === "CRITICAL" ? "text-rose-600" : "text-amber-500"
                            }`}
                          />
                          <span className="font-bold text-slate-800">{a.sourceLabel}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                            {a.category}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-[11px]">{a.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No active alarms logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
