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
  Search,
  LayoutGrid,
  List,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MeshFleetPage() {
  const { nodes, telemetry, isConnected } = useTelemetryContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchSearch =
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSev = severityFilter === "ALL" || node.riskSeverity === severityFilter;
      return matchSearch && matchSev;
    });
  }, [nodes, searchTerm, severityFilter]);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 dark:text-slate-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center shadow-xs">
              <Cpu className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  ESP Sensor Node Fleet
                </h1>
                <Badge
                  variant={isConnected ? "outline" : "secondary"}
                  className={`text-[10px] font-bold ${
                    isConnected
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {nodes.length} Nodes Registered
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-Node Mine Monitoring Stations · Identical Dual MPU + Ultrasound + MQ2 + Vibration + Actuators
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${
                viewMode === "table" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold" : ""
              }`}
            >
              <List className="size-3.5 mr-1" /> Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${
                viewMode === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold" : ""
              }`}
            >
              <LayoutGrid className="size-3.5 mr-1" /> Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[220px] max-w-sm relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by Node ID, sector, chamber..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Severity Filter:</span>
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

      {/* Empty State when no nodes registered */}
      {nodes.length === 0 ? (
        <Card className="border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No ESP Sensor Nodes Discovered
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Monitoring nodes will register automatically upon sending their initial MQTT heartbeat to the gateway.
          </p>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredNodes.map((node) => {
            const tel = telemetry[node.id];
            const isCrit = node.riskSeverity === "CRITICAL";
            const isWarn = node.riskSeverity === "WATCH";

            return (
              <Card
                key={node.id}
                className={cn(
                  "border rounded-2xl shadow-xs transition-all hover:shadow-md",
                  isCrit
                    ? "border-rose-300 bg-rose-50/20 dark:bg-rose-950/20"
                    : isWarn
                    ? "border-amber-300 bg-amber-50/20 dark:bg-amber-950/20"
                    : "border-slate-200 dark:border-slate-800"
                )}
              >
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">{node.id}</CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{node.label}</p>
                    </div>
                    <Badge
                      variant={isCrit ? "destructive" : isWarn ? "outline" : "secondary"}
                      className={cn(
                        "text-[10px] font-bold",
                        isWarn && "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                      )}
                    >
                      {node.riskSeverity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">MQ2 Gas</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {tel?.gas?.mq2Ppm !== undefined ? `${tel.gas.mq2Ppm} ppm` : "—"}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Wall Clearance</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {tel?.ultrasound?.distanceCm !== undefined ? `${tel.ultrasound.distanceCm.toFixed(1)} cm` : "—"}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">MPU-1 Tilt</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {tel?.imu1?.totalTiltDeg !== undefined ? `${tel.imu1.totalTiltDeg.toFixed(1)}°` : "—"}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">MPU-2 Tilt</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {tel?.imu2?.totalTiltDeg !== undefined ? `${tel.imu2.totalTiltDeg.toFixed(1)}°` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-[11px]">
                      {tel?.actuators?.buzzerActive && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 font-semibold">
                          BUZZER
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold">
                        {tel?.actuators?.ledMatrixPattern || "IDLE"}
                      </Badge>
                    </div>
                    <Link href={`/dashboard/nodes/${node.id}`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold gap-1 text-orange-600 hover:text-orange-700">
                        Inspect <ArrowUpRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                <TableRow>
                  <TableHead className="w-[120px]">ESP Node ID</TableHead>
                  <TableHead className="w-[200px]">Station Location</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[110px]">MQ2 Gas</TableHead>
                  <TableHead className="w-[120px]">Wall Clearance</TableHead>
                  <TableHead className="w-[110px]">MPU 1 (H)</TableHead>
                  <TableHead className="w-[110px]">MPU 2 (V)</TableHead>
                  <TableHead className="w-[110px]">Vibration</TableHead>
                  <TableHead className="w-[140px]">Actuators</TableHead>
                  <TableHead className="w-[80px] text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-slate-400 text-xs">
                      No ESP sensor nodes match your search filter.
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
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                          {node.id}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                          <div>{node.label}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{node.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isCritical ? "destructive" : isWatch ? "outline" : "secondary"}
                            className={cn(
                              "text-[10px] font-bold",
                              isWatch && "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                            )}
                          >
                            {node.riskSeverity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {tel?.gas?.mq2Ppm !== undefined ? `${tel.gas.mq2Ppm} ppm` : "—"}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {tel?.ultrasound?.distanceCm !== undefined ? `${tel.ultrasound.distanceCm.toFixed(1)} cm` : "—"}
                        </TableCell>
                        <TableCell className="font-bold tabular-nums">
                          {tel?.imu1?.totalTiltDeg !== undefined ? `${tel.imu1.totalTiltDeg.toFixed(1)}°` : "—"}
                        </TableCell>
                        <TableCell className="font-bold tabular-nums">
                          {tel?.imu2?.totalTiltDeg !== undefined ? `${tel.imu2.totalTiltDeg.toFixed(1)}°` : "—"}
                        </TableCell>
                        <TableCell className="font-semibold tabular-nums">
                          {tel?.vibration?.intensity !== undefined ? `${tel.vibration.intensity}%` : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {tel?.actuators?.buzzerActive && (
                              <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 font-semibold">
                                BUZZER
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold">
                              {tel?.actuators?.ledMatrixPattern || "IDLE"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/nodes/${node.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
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
