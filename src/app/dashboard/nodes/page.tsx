"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cpu,
  Radio,
  Compass,
  Activity,
  Battery,
  Search,
  LayoutGrid,
  List,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { SensorNodeSymbol } from "@/components/industrial/SensorNodeSymbol";
import { cn } from "@/lib/utils";

export default function MeshFleetPage() {
  const { nodes, telemetry, predictions, selectedNodeId, setSelectedNodeId } = useTelemetryContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [panelFilter, setPanelFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchSearch =
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPanel = panelFilter === "ALL" || node.panelId === panelFilter;
      const matchSev = severityFilter === "ALL" || node.riskSeverity === severityFilter;
      return matchSearch && matchPanel && matchSev;
    });
  }, [nodes, searchTerm, panelFilter, severityFilter]);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-700">
              <Cpu className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Surface Mesh Node Fleet
              </h1>
              <p className="text-xs text-slate-500">
                Fleet Roster · Real-Time Geotechnical Telemetry & LoRa Link Diagnostics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-7 px-2.5 text-xs font-semibold rounded-lg"
            >
              <List className="size-3.5 mr-1" /> Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="h-7 px-2.5 text-xs font-semibold rounded-lg"
            >
              <LayoutGrid className="size-3.5 mr-1" /> Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[220px] max-w-sm relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by Node ID, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Panel:</span>
            {["ALL", "PANEL-4A", "PANEL-4B"].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={panelFilter === p ? "default" : "outline"}
                onClick={() => setPanelFilter(p)}
                className="h-7 px-2.5 text-xs font-semibold rounded-lg"
              >
                {p}
              </Button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <span className="text-slate-500 font-semibold">Severity:</span>
            {["ALL", "CRITICAL", "WATCH", "STABLE"].map((sev) => (
              <Button
                key={sev}
                size="sm"
                variant={severityFilter === sev ? "default" : "outline"}
                onClick={() => setSeverityFilter(sev)}
                className="h-7 px-2.5 text-xs font-semibold rounded-lg"
              >
                {sev}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roster Display */}
      {viewMode === "grid" ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredNodes.map((node) => {
            const tel = telemetry[node.id];
            return (
              <Link key={node.id} href={`/dashboard/nodes/${node.id}`}>
                <SensorNodeSymbol
                  node={node}
                  telemetry={tel}
                  size="lg"
                  className="w-full h-full hover:shadow-md transition-shadow"
                />
              </Link>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="w-[110px]">Node ID</TableHead>
                  <TableHead className="w-[180px]">Deployment Sector</TableHead>
                  <TableHead className="w-[100px]">Panel</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[110px]">Geotech Risk</TableHead>
                  <TableHead className="w-[110px]">Ground Tilt</TableHead>
                  <TableHead className="w-[120px]">Displacement</TableHead>
                  <TableHead className="w-[100px]">Crack State</TableHead>
                  <TableHead className="w-[100px]">Battery</TableHead>
                  <TableHead className="w-[120px]">LoRa Signal</TableHead>
                  <TableHead className="w-[80px] text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-slate-400 text-xs">
                      No mesh nodes match your search filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNodes.map((node) => {
                    const tel = telemetry[node.id];
                    const isCritical = node.riskSeverity === "CRITICAL";
                    const isWatch = node.riskSeverity === "WATCH";

                    return (
                      <TableRow
                        key={node.id}
                        className={cn(
                          "text-xs transition-colors",
                          isCritical
                            ? "bg-rose-50/30 hover:bg-rose-50/50"
                            : isWatch
                            ? "bg-amber-50/30 hover:bg-amber-50/50"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <TableCell className="font-mono font-bold text-slate-900">
                          {node.id}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {node.label}
                        </TableCell>
                        <TableCell className="font-mono text-slate-500">
                          {node.panelId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                node.status === "ONLINE" ? "bg-emerald-500" : "bg-rose-500"
                              )}
                            />
                            <span>{node.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isCritical ? "destructive" : isWatch ? "outline" : "secondary"}
                            className={cn(
                              "text-[10px] font-bold",
                              isWatch && "bg-amber-100 text-amber-900 border-amber-300"
                            )}
                          >
                            {node.riskSeverity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-bold">
                          {tel ? `${tel.tilt.totalTiltDeg.toFixed(2)}°` : "—"}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-rose-700">
                          {tel ? `+${tel.displacement.deltaMm.toFixed(1)} mm` : "—"}
                        </TableCell>
                        <TableCell>
                          {tel?.crack.detected ? (
                            <span className="font-bold text-rose-700 font-mono">
                              {tel.crack.widthEstimateMm.toFixed(1)} mm
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">None</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {node.battery.voltage.toFixed(1)}V ({node.battery.percentage}%)
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-slate-500">
                          {node.link.rssi} dBm · {node.link.hops}H
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/nodes/${node.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900">
                              <ArrowUpRight className="size-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
