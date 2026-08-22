"use client";

import React from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Battery,
  Radio,
  Cpu,
  Wifi,
  Sun,
  Clock,
  HardDrive,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NodeHealthPage() {
  const { nodes, diagnostics } = useTelemetryContext();

  const avgBatteryV =
    nodes.reduce((sum, n) => sum + n.battery.voltage, 0) / (nodes.length || 1);
  const avgRssi =
    nodes.reduce((sum, n) => sum + n.link.rssi, 0) / (nodes.length || 1);
  const totalCharging = nodes.filter((n) => n.battery.chargeState === "CHARGING").length;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Mesh Connectivity & Battery Health
              </h1>
              <p className="text-xs text-slate-500">
                Low-Power ESP32 Solar/Battery Lifecycle · LoRa Mesh Signal Quality & Routing Diagnostics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fleet Battery Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {avgBatteryV.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">V (Nominal 3.7V)</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <Sun className="size-3 text-amber-500" />
              <span>{totalCharging} Nodes on Solar Float Charge</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mean RSSI Signal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {avgRssi.toFixed(0)}
              </span>
              <span className="text-xs font-bold text-slate-500">dBm</span>
            </div>
            <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Wifi className="size-3" />
              <span>Solid Link Margin (&gt; 15 dB SNR)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              RPi4 Edge Gateway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-emerald-700">
                ONLINE
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono">
              IP: {diagnostics?.ipAddress || "192.168.4.1"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mesh Packet Loss Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {diagnostics?.packetLossRate || 0.3}%
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono">
              {diagnostics?.successfulPackets.toLocaleString()} Packets OK
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Node Health Detail Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900">
            Per-Node Power & Radio Telemetry
          </CardTitle>
          <CardDescription className="text-xs">
            Individual battery levels, solar charging state, LoRa signal-to-noise ratio, and hop routing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[100px]">Node ID</TableHead>
                <TableHead className="w-[160px]">Sector</TableHead>
                <TableHead className="w-[180px]">Battery Level</TableHead>
                <TableHead className="w-[130px]">Power State</TableHead>
                <TableHead className="w-[150px]">LoRa RSSI Signal</TableHead>
                <TableHead className="w-[100px]">SNR</TableHead>
                <TableHead className="w-[130px]">Routing</TableHead>
                <TableHead className="w-[120px]">Firmware</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes.map((node) => (
                <TableRow key={node.id} className="text-xs hover:bg-slate-50/80">
                  <TableCell className="font-mono font-bold text-slate-900">
                    {node.id}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {node.label}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span>{node.battery.voltage.toFixed(2)}V</span>
                        <span className="font-bold">{node.battery.percentage}%</span>
                      </div>
                      <Progress
                        value={node.battery.percentage}
                        className={cn(
                          "h-1.5 bg-slate-100",
                          node.battery.percentage > 50
                            ? "[&>div]:bg-emerald-500"
                            : node.battery.percentage > 20
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-rose-500"
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold",
                        node.battery.chargeState === "CHARGING" && "bg-amber-50 text-amber-900 border-amber-300",
                        node.battery.chargeState === "LOW" && "bg-rose-50 text-rose-800 border-rose-300"
                      )}
                    >
                      {node.battery.chargeState}
                      {node.battery.solarCurrentMa ? ` (+${node.battery.solarCurrentMa}mA)` : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span>{node.link.rssi} dBm</span>
                      </div>
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.max(10, Math.min(100, ((node.link.rssi + 110) / 60) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    +{node.link.snr.toFixed(1)} dB
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {node.link.hops === 1 ? (
                      <span className="text-emerald-700 font-bold">Direct GW (1H)</span>
                    ) : (
                      <span>Via {node.link.parentHopId} ({node.link.hops}H)</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-slate-500">
                    {node.firmware}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
