"use client";

import React, { useState, useEffect } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Sliders,
  Orbit,
  Zap,
  Layers,
  Terminal,
  Activity,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Compass,
} from "lucide-react";

interface StreamLogEntry {
  id: string;
  time: string;
  nodeId: string;
  stabilityIndex: number;
  score: number;
  severity: string;
  factors: string[];
  tilt: number;
  dispMm: number;
  crackMm: number;
}

export default function PredictivePage() {
  const { nodes, telemetry, predictions, selectedNodeId, triggerFaultSimulation } = useTelemetryContext();

  const [streamLogs, setStreamLogs] = useState<StreamLogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const tel = telemetry[selectedNodeId] || (selectedNode ? telemetry[selectedNode.id] : null);
  const pred = predictions[selectedNodeId] || (selectedNode ? predictions[selectedNode.id] : null);

  const stability = pred?.stabilityIndex ?? 92.4;
  const score = pred?.deformationScore ?? 0.45;
  const severity = pred?.severity ?? "STABLE";
  const factors = pred?.factors ?? [];

  // Stream accumulation
  useEffect(() => {
    if (isPaused || !pred || !tel) return;

    const entry: StreamLogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      nodeId: selectedNode?.id || "NODE-04",
      stabilityIndex: pred.stabilityIndex,
      score: pred.deformationScore,
      severity: pred.severity,
      factors: [...pred.factors],
      tilt: tel.tilt.totalTiltDeg,
      dispMm: tel.displacement.deltaMm,
      crackMm: tel.crack.widthEstimateMm,
    };

    setStreamLogs((prev) => [entry, ...prev].slice(0, 30));
  }, [pred, tel, isPaused, selectedNode?.id]);

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-700">
            <Bot className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Subsidence Predictive AI & Early Warning
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Edge Isolation Forest Model · Multi-Sensor Subsidence Pattern Recognition · Live 1 Hz Inference
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              severity === "STABLE"
                ? "bg-emerald-100 text-emerald-800"
                : severity === "WATCH"
                ? "bg-amber-100 text-amber-900"
                : "bg-rose-100 text-rose-900"
            }`}
          >
            {severity === "STABLE" ? "Overburden Stable" : severity === "WATCH" ? "Subsidence Watch" : "Critical Subsidence Anomaly"}
          </span>
        </div>
      </div>

      {/* Top 4 Key Geotechnical AI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Stability Index */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">Stability Index</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold tracking-tight tabular-nums font-mono ${stability > 75 ? "text-emerald-700" : stability > 50 ? "text-amber-700" : "text-rose-700"}`}>
              {stability.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">%</span>
          </div>
          <div className="mt-3">
            <Progress
              value={stability}
              className={`h-1.5 bg-orange-200/50 ${
                stability > 75
                  ? "[&>div]:bg-emerald-600"
                  : stability > 50
                  ? "[&>div]:bg-amber-500"
                  : "[&>div]:bg-rose-500"
              }`}
            />
          </div>
        </div>

        {/* Metric 2: Isolation Forest Anomaly Score */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">Deformation Score (S)</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Sliders className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-mono">Baseline Safe: S &ge; 0.00</p>
        </div>

        {/* Metric 3: Time to Critical Envelope */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">Estimated Time to Crit</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Orbit className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {pred?.estimatedTimeToCriticalHours ? `~ ${pred.estimatedTimeToCriticalHours}` : "> 500"}
            </span>
            <span className="text-xs font-bold text-slate-500">Hours</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Geotechnical Failure Horizon</p>
        </div>

        {/* Metric 4: Edge Inference Latency */}
        <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F5E6DA] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900/70 tracking-wider uppercase">Edge Inference Latency</span>
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Zap className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              12.4
            </span>
            <span className="text-xs font-bold text-slate-500">ms</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">RPi4 On-Premises Isolation Forest</p>
        </div>
      </div>

      {/* Middle Section: Extracted Multi-Dimensional Geotechnical Feature Vector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Extracted Feature Matrix (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Layers className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Extracted Geotechnical Feature Vector</h2>
                <p className="text-xs text-slate-500">
                  Real-time sensor signals evaluated by 200-Tree Isolation Forest
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Resultant Tilt</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {tel ? `${tel.tilt.totalTiltDeg.toFixed(2)}°` : "—"}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Threshold: &lt; 2.0°</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs text-slate-500 block">Vertical Displacement</span>
                <span className="text-lg font-bold font-mono text-rose-700 mt-0.5 block">
                  {tel ? `+${tel.displacement.deltaMm.toFixed(1)} mm` : "—"}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Rate: {tel?.displacement.rateMmPerHour} mm/hr</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs text-slate-500 block">Tension Crack Aperture</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {tel?.crack.detected ? `${tel.crack.widthEstimateMm.toFixed(1)} mm` : "0.0 mm"}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Sensor: {tel?.crack.detected ? "Fractured" : "Intact"}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs text-slate-500 block">Micro-Seismic Events (10m)</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {tel ? `${tel.vibration.eventCount} pulses` : "—"}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">SW420 Trigger Rate</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs text-slate-500 block">DC Power Supply</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {selectedNode?.battery.voltage.toFixed(2)} V
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Battery: {selectedNode?.battery.percentage}%</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs text-slate-500 block">LoRa Link Quality</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {selectedNode?.link.rssi} dBm
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Hops: {selectedNode?.link.hops}H (SNR +{selectedNode?.link.snr}dB)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Advisory Card (4 Cols) */}
        <div className="lg:col-span-4">
          <div
            className={`p-6 rounded-2xl border shadow-xs h-full flex flex-col justify-between ${
              severity === "CRITICAL"
                ? "bg-[#FFF5F5] border-[#FEE2E2]"
                : severity === "WATCH"
                ? "bg-[#FFFBF0] border-[#FBEEC8]"
                : "bg-[#F3FAF5] border-[#E0EFE5]"
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 pb-4 border-b border-black/[0.05]">
                <div
                  className={`size-8 rounded-xl flex items-center justify-center ${
                    severity === "CRITICAL"
                      ? "bg-rose-100 text-rose-800"
                      : severity === "WATCH"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  <AlertTriangle className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {severity === "CRITICAL" ? "Subsidence Warning" : severity === "WATCH" ? "Deformation Advisory" : "Overburden Nominal"}
                  </h2>
                  <p className="text-xs text-slate-500">Real-Time Risk Advisory</p>
                </div>
              </div>

              <div className="mt-4">
                {factors.length > 0 ? (
                  <div className="p-3.5 bg-white/90 border border-rose-200/80 rounded-xl space-y-1.5 text-xs text-rose-950">
                    <span className="font-bold text-rose-900 block">Deformation Signatures Detected:</span>
                    <ul className="space-y-1 pl-4 list-disc text-rose-900 font-medium">
                      {factors.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-4 bg-white/80 border border-black/[0.04] rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">Subsidence Envelope Stable</span>
                      <p className="text-slate-500 leading-relaxed">
                        All mesh telemetry channels conform to baseline surface contours without significant vertical sag.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-black/[0.05] space-y-1.5 text-xs text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>Model Architecture:</span>
                <span className="font-bold text-slate-800">Isolation Forest (200 Trees)</span>
              </div>
              <div className="flex justify-between">
                <span>Contamination Ratio:</span>
                <span className="font-bold text-slate-800">0.05 (5% Hazard Envelope)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Live 1 Hz Model Inference Stream */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700">
              <Terminal className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Edge AI Model Inference Stream (1 Hz)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuous on-device geotechnical anomaly detection output with feature vector diagnostics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerFaultSimulation("SUBSIDENCE_SURGE")}
              className="h-7 px-2.5 text-xs bg-white text-rose-700 border-rose-200 hover:bg-rose-50 rounded-lg font-semibold"
            >
              <Activity className="size-3 mr-1" /> Subsidence Surge
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerFaultSimulation("CRACK_BURST")}
              className="h-7 px-2.5 text-xs bg-white text-amber-800 border-amber-200 hover:bg-amber-50 rounded-lg font-semibold"
            >
              <AlertTriangle className="size-3 mr-1" /> Overburden Crack
            </Button>
            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
              className="h-7 px-2.5 text-xs bg-white rounded-lg font-semibold"
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRawJson(!showRawJson)}
              className="h-7 px-2.5 text-xs bg-white rounded-lg font-semibold"
            >
              {showRawJson ? "Table View" : "JSON Stream"}
            </Button>
          </div>
        </div>

        {/* Stream Content */}
        <div>
          {showRawJson ? (
            <div className="p-5 bg-slate-900 text-slate-100 text-xs max-h-[340px] overflow-y-auto font-mono">
              <pre className="text-emerald-400 font-normal leading-relaxed">
                {JSON.stringify(
                  {
                    timestamp: new Date().toISOString(),
                    nodeId: selectedNode?.id || "NODE-04",
                    stabilityIndex: stability,
                    deformationScore: score,
                    isAnomaly: severity !== "STABLE",
                    severity,
                    factors,
                    instantaneousFeatureVector: {
                      total_tilt_deg: tel?.tilt.totalTiltDeg,
                      displacement_delta_mm: tel?.displacement.deltaMm,
                      crack_aperture_mm: tel?.crack.widthEstimateMm,
                      vibration_pulses_10m: tel?.vibration.eventCount,
                      battery_voltage_v: selectedNode?.battery.voltage,
                      lora_rssi_dbm: selectedNode?.link.rssi,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Node</th>
                    <th className="py-3 px-4">Stability Index</th>
                    <th className="py-3 px-4">Score (S)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Tilt Angle</th>
                    <th className="py-3 px-4">Displacement</th>
                    <th className="py-3 px-4">Crack</th>
                    <th className="py-3 px-4">Contributing Factors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {streamLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={
                        idx === 0
                          ? "bg-orange-50/40"
                          : log.severity === "CRITICAL"
                          ? "bg-rose-50/40"
                          : log.severity === "WATCH"
                          ? "bg-amber-50/30"
                          : "hover:bg-slate-50"
                      }
                    >
                      <td className="py-2.5 px-4 text-slate-500 font-mono">{log.time}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{log.nodeId}</td>
                      <td className="py-2.5 px-4">
                        <span className={`font-mono font-bold ${log.stabilityIndex > 75 ? "text-emerald-700" : log.stabilityIndex > 50 ? "text-amber-700" : "text-rose-700"}`}>
                          {log.stabilityIndex.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-800">
                        {log.score > 0 ? `+${log.score.toFixed(2)}` : log.score.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.severity === "STABLE"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.severity === "WATCH"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-rose-100 text-rose-900"
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono">{log.tilt.toFixed(2)}°</td>
                      <td className="py-2.5 px-4 font-mono text-rose-700 font-bold">+{log.dispMm.toFixed(1)}mm</td>
                      <td className="py-2.5 px-4 font-mono">{log.crackMm > 0 ? `${log.crackMm.toFixed(1)}mm` : "None"}</td>
                      <td className="py-2.5 px-4">
                        {log.factors.length > 0 ? (
                          <span className="text-amber-900 font-medium">{log.factors.join("; ")}</span>
                        ) : (
                          <span className="text-slate-400">Nominal baseline</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
