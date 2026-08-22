"use client";

import React from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Wifi,
  Network,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoRaNetworkPage() {
  const { nodes, diagnostics } = useTelemetryContext();

  const directHopNodes = nodes.filter((n) => n.link.hops === 1);
  const multiHopNodes = nodes.filter((n) => n.link.hops > 1);

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs">
              <Radio className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                LoRa Surface Mesh Topology
              </h1>
              <p className="text-xs text-slate-500">
                Wireless Geotechnical Sensor Mesh · IN865 Band (865–867 MHz) · RPi4 Edge Bridge
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Radio Spectrum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">865.2 MHz</div>
            <p className="text-xs text-slate-500 mt-1">IN865 License-Free Band (India)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Mesh Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              {nodes.length} Active Links
            </div>
            <p className="text-xs text-slate-500 mt-1">3 Direct H1 · 5 Multi-Hop Repeaters</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gateway Packet Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {diagnostics?.successfulPackets.toLocaleString() || "14,520"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              CRC Error Rate: {diagnostics?.crcErrors || 0} pkts (0.01%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Spreading Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">SF7 / 125 kHz</div>
            <p className="text-xs text-slate-500 mt-1">High-Throughput Short-Range Profile</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Mesh Topology Hierarchy Diagram */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900">
            Multi-Hop Routing Hierarchy & Signal Strength
          </CardTitle>
          <CardDescription className="text-xs">
            Visualizing packet relay paths from remote boundary nodes through mesh repeaters to the edge gateway
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Level 0: Gateway Base Station */}
            <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-900 text-white shadow-md min-w-[180px]">
              <Radio className="size-8 text-emerald-400 mb-2" />
              <span className="font-bold text-sm">RPi4 Base Station</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Gateway GW-01</span>
              <span className="mt-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                ROOT RECEPTOR
              </span>
            </div>

            <ArrowRight className="size-6 text-slate-300 hidden md:block shrink-0" />

            {/* Level 1: Direct 1-Hop Relay Nodes */}
            <div className="space-y-3 flex-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                1-Hop Direct Links (H1)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {directHopNodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs font-mono">{node.id}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">{node.link.rssi} dBm</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{node.label}</p>
                    <div className="mt-2 text-[10px] font-mono text-slate-400">
                      SNR: +{node.link.snr} dB
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ArrowRight className="size-6 text-slate-300 hidden md:block shrink-0" />

            {/* Level 2 & 3: Multi-Hop Nodes */}
            <div className="space-y-3 flex-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Multi-Hop Repeaters (H2 & H3)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {multiHopNodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs font-mono">{node.id}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {node.link.hops} Hops
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{node.label}</p>
                    <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Via {node.link.parentHopId}</span>
                      <span>{node.link.rssi} dBm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
