"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { MeshNode, NodeTelemetry, SubsidencePrediction } from "@/types";
import {
  Layers,
  Eye,
  Radio,
  Compass,
  Activity,
  AlertTriangle,
  Battery,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SensorNodeSymbol } from "./SensorNodeSymbol";

interface DeformationMapProps {
  nodes: MeshNode[];
  telemetry: Record<string, NodeTelemetry>;
  predictions: Record<string, SubsidencePrediction>;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  className?: string;
  isCompact?: boolean;
}

export function DeformationMap({
  nodes,
  telemetry,
  predictions,
  selectedNodeId,
  onSelectNode,
  className,
  isCompact = false,
}: DeformationMapProps) {
  const [showMeshEdges, setShowMeshEdges] = useState(true);
  const [showRiskHalos, setShowRiskHalos] = useState(true);
  const [showUndergroundGoaf, setShowUndergroundGoaf] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Gateway Base Station position
  const gatewayPos = { x: 10, y: 12, label: "RPi4 Gateway (Base Station)" };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const selectedTel = telemetry[selectedNodeId] || null;
  const selectedPred = predictions[selectedNodeId] || null;

  // Active risk count
  const criticalCount = nodes.filter((n) => n.riskSeverity === "CRITICAL").length;
  const watchCount = nodes.filter((n) => n.riskSeverity === "WATCH").length;

  return (
    <div className={cn("relative rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex flex-col", className)}>
      {/* Map Control Toolbar */}
      {!isCompact && (
        <div className="p-3.5 bg-slate-50/90 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Layers className="size-4 text-primary" />
              <span>Surface Mesh Sensor Grid · Panel 4A/4B</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={criticalCount > 0 ? "destructive" : "secondary"} className="h-5 text-[10px]">
                {criticalCount} Critical Trough
              </Badge>
              <Badge variant="outline" className="h-5 text-[10px] bg-amber-50 text-amber-800 border-amber-300">
                {watchCount} Watch Area
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Layer Toggles */}
            <Button
              size="sm"
              variant={showRiskHalos ? "default" : "outline"}
              onClick={() => setShowRiskHalos(!showRiskHalos)}
              className="h-7 px-2 text-[11px]"
            >
              Risk Heat Halos
            </Button>
            <Button
              size="sm"
              variant={showMeshEdges ? "default" : "outline"}
              onClick={() => setShowMeshEdges(!showMeshEdges)}
              className="h-7 px-2 text-[11px]"
            >
              LoRa Mesh Links
            </Button>
            <Button
              size="sm"
              variant={showUndergroundGoaf ? "default" : "outline"}
              onClick={() => setShowUndergroundGoaf(!showUndergroundGoaf)}
              className="h-7 px-2 text-[11px]"
            >
              Underground Goaf
            </Button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Zoom Controls */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(1)}
              className="h-7 w-7 p-0"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Map Viewport & Side Drawer */}
      <div className="relative flex-1 min-h-[360px] bg-[#F8FAFC] flex overflow-hidden">
        {/* SVG Canvas */}
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
          <svg
            viewBox="0 0 1000 650"
            className="w-full h-full max-h-[550px] transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <defs>
              {/* Grid Background Pattern */}
              <pattern id="mineGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
              </pattern>
              <pattern id="subGrid" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
              </pattern>

              {/* Radial Gradients for Subsidence Halos */}
              <radialGradient id="criticalHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#FB7185" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="watchHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
              </radialGradient>

              {/* Goaf Hatch Pattern */}
              <pattern id="goafHatch" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="20" stroke="#F1F5F9" strokeWidth="6" />
                <line x1="0" y1="0" x2="0" y2="20" stroke="#E2E8F0" strokeWidth="1.5" />
              </pattern>
            </defs>

            {/* Base Grid Background */}
            <rect width="1000" height="650" fill="url(#mineGrid)" />
            <rect width="1000" height="650" fill="url(#subGrid)" />

            {/* Underground Coal Panels (Goaf Extraction Boundary) */}
            {showUndergroundGoaf && (
              <g id="undergroundGoafLayer">
                {/* Panel 4A Active Extraction Trough Boundary */}
                <rect
                  x="280"
                  y="240"
                  width="360"
                  height="300"
                  rx="12"
                  fill="url(#goafHatch)"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text x="300" y="270" fill="#64748B" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                  UNDERGROUND COAL PANEL 4A (Active Extraction Goaf)
                </text>
                <text x="300" y="290" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                  Depth: 185m · Longwall Retreating Face
                </text>

                {/* Panel 4B Adjacent Barrier */}
                <rect
                  x="680"
                  y="180"
                  width="260"
                  height="380"
                  rx="8"
                  fill="#F1F5F9"
                  fillOpacity="0.4"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x="700" y="210" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  PANEL 4B (Unmined Barrier)
                </text>
              </g>
            )}

            {/* Geological Subsidence Risk Halos */}
            {showRiskHalos && (
              <g id="riskHalosLayer">
                {nodes.map((node) => {
                  const cx = (node.position.gridX / 100) * 850 + 75;
                  const cy = (node.position.gridY / 100) * 520 + 60;

                  if (node.riskSeverity === "CRITICAL") {
                    return (
                      <circle
                        key={`halo-${node.id}`}
                        cx={cx}
                        cy={cy}
                        r="140"
                        fill="url(#criticalHalo)"
                        className="animate-pulse"
                      />
                    );
                  }
                  if (node.riskSeverity === "WATCH") {
                    return (
                      <circle
                        key={`halo-${node.id}`}
                        cx={cx}
                        cy={cy}
                        r="95"
                        fill="url(#watchHalo)"
                      />
                    );
                  }
                  return null;
                })}
              </g>
            )}

            {/* LoRa Mesh Network Links & Topology Edges */}
            {showMeshEdges && (
              <g id="meshEdgesLayer">
                {nodes.map((node) => {
                  const targetX = (node.position.gridX / 100) * 850 + 75;
                  const targetY = (node.position.gridY / 100) * 520 + 60;

                  let sourceX = (gatewayPos.x / 100) * 850 + 75;
                  let sourceY = (gatewayPos.y / 100) * 520 + 60;

                  if (node.link.parentHopId) {
                    const parent = nodes.find((n) => n.id === node.link.parentHopId);
                    if (parent) {
                      sourceX = (parent.position.gridX / 100) * 850 + 75;
                      sourceY = (parent.position.gridY / 100) * 520 + 60;
                    }
                  }

                  const isLinkActive = node.status !== "OFFLINE";

                  return (
                    <g key={`edge-${node.id}`}>
                      <line
                        x1={sourceX}
                        y1={sourceY}
                        x2={targetX}
                        y2={targetY}
                        stroke={node.riskSeverity === "CRITICAL" ? "#F43F5E" : "#3B82F6"}
                        strokeWidth={node.link.hops === 1 ? "2.5" : "1.8"}
                        strokeDasharray={node.link.hops > 1 ? "5 4" : "none"}
                        strokeOpacity="0.65"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Gateway Base Station Icon */}
            <g transform={`translate(${(gatewayPos.x / 100) * 850 + 75}, ${(gatewayPos.y / 100) * 520 + 60})`}>
              <circle r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <Radio className="size-5 text-emerald-400 -translate-x-2.5 -translate-y-2.5" />
              <text x="28" y="5" fill="#1E293B" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                RPi4 Edge Gateway
              </text>
              <text x="28" y="18" fill="#64748B" fontSize="9" fontFamily="sans-serif">
                Base Station · 8 Active Routes
              </text>
            </g>

            {/* Sensor Nodes Markers on Grid */}
            <g id="sensorNodesLayer">
              {nodes.map((node) => {
                const cx = (node.position.gridX / 100) * 850 + 75;
                const cy = (node.position.gridY / 100) * 520 + 60;
                const isSelected = node.id === selectedNodeId;
                const isHovered = node.id === hoveredNodeId;
                const tel = telemetry[node.id];

                const color = node.riskSeverity === "CRITICAL" ? "#E11D48" : node.riskSeverity === "WATCH" ? "#D97706" : "#059669";

                return (
                  <g
                    key={`node-${node.id}`}
                    transform={`translate(${cx}, ${cy})`}
                    onClick={() => onSelectNode(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer"
                  >
                    {/* Selected Ring */}
                    {isSelected && (
                      <circle r="26" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="4 2" className="animate-spin" />
                    )}

                    {/* Outer Pin Circle */}
                    <circle
                      r="18"
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="shadow-md transition-transform duration-150 hover:scale-110"
                    />

                    {/* Node Text Label */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.id.replace("NODE-", "N")}
                    </text>

                    {/* Label Banner Under Node */}
                    <rect
                      x="-38"
                      y="22"
                      width="76"
                      height="16"
                      rx="4"
                      fill="#1E293B"
                      fillOpacity="0.85"
                    />
                    <text
                      x="0"
                      y="33"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {tel ? `Δ+${tel.displacement.deltaMm}mm` : node.id}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3 text-[11px] shadow-sm space-y-1.5 pointer-events-auto">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Compass className="size-3 text-primary" />
              <span>Mine Panel Map Legend</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Stable Barrier Zone (Nominal)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Watch Zone (Tilt &gt; 2.0° / Disp &gt; 10mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">Critical Subsidence Trough</span>
            </div>
          </div>
        </div>

        {/* Selected Node Quick Inspection Drawer (Right Side) */}
        {!isCompact && selectedNode && (
          <div className="w-80 border-l border-slate-200/80 bg-white p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{selectedNode.id}</span>
                    <Badge
                      variant={selectedNode.riskSeverity === "CRITICAL" ? "destructive" : "outline"}
                      className={cn(
                        "text-[10px]",
                        selectedNode.riskSeverity === "WATCH" && "bg-amber-50 text-amber-800 border-amber-300"
                      )}
                    >
                      {selectedNode.riskSeverity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedNode.label}</p>
                </div>
              </div>

              {/* Sensor Live Readouts */}
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ground Tilt (MPU6050)</span>
                    <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                      {selectedTel ? `${selectedTel.tilt.totalTiltDeg.toFixed(2)}°` : "—"}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>Roll: {selectedTel?.tilt.rollDeg.toFixed(1)}°</div>
                    <div>Pitch: {selectedTel?.tilt.pitchDeg.toFixed(1)}°</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subsidence (HC-SR04)</span>
                    <span className="text-xl font-bold font-mono text-rose-700 mt-0.5 block">
                      {selectedTel ? `+${selectedTel.displacement.deltaMm.toFixed(1)} mm` : "—"}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>Rate: {selectedTel?.displacement.rateMmPerHour} mm/hr</div>
                    <div>Baseline: 50.0 cm</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tension Crack Sensor</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                      {selectedTel?.crack.detected ? `${selectedTel.crack.widthEstimateMm.toFixed(1)} mm` : "NO CRACK"}
                    </span>
                  </div>
                  <Badge variant={selectedTel?.crack.detected ? "destructive" : "secondary"} className="text-[10px]">
                    {selectedTel?.crack.detected ? "FRACTURED" : "INTACT"}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Micro-Vibrations (SW420)</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                      {selectedTel ? `${selectedTel.vibration.eventCount} Events` : "—"}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>Intensity: {selectedTel?.vibration.intensity}%</div>
                  </div>
                </div>
              </div>

              {/* AI Stability Index Card */}
              {selectedPred && (
                <div className="mt-4 p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/70">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-orange-600" />
                      AI Stability Index
                    </span>
                    <span className="text-sm font-bold font-mono text-orange-900">
                      {selectedPred.stabilityIndex.toFixed(1)}%
                    </span>
                  </div>
                  {selectedPred.factors.length > 0 && (
                    <p className="text-[11px] text-orange-900 mt-1.5 font-medium leading-tight">
                      {selectedPred.factors[0]}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Link Status */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>LoRa Mesh Hop:</span>
                <span className="font-bold text-slate-800">{selectedNode.link.hops} Hop(s)</span>
              </div>
              <div className="flex justify-between">
                <span>RSSI / SNR:</span>
                <span className="font-mono text-slate-800">{selectedNode.link.rssi} dBm / {selectedNode.link.snr} dB</span>
              </div>
              <div className="flex justify-between">
                <span>Battery Level:</span>
                <span className="font-bold text-slate-800">{selectedNode.battery.percentage}% ({selectedNode.battery.voltage}V)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
