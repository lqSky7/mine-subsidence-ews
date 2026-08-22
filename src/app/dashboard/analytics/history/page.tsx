"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Download, Search, Filter, Calendar, FileSpreadsheet } from "lucide-react";

interface HistoricalEvent {
  id: string;
  timestamp: string;
  panelId: string;
  nodeId: string;
  eventType: "SUBSIDENCE_STEP" | "CRACK_INITIATION" | "TILT_DRIFT" | "MESH_HEALING" | "BATTERY_WARNING";
  description: string;
  metricValue: string;
  operatorAction: string;
}

const mockHistoricalLogs: HistoricalEvent[] = [
  {
    id: "EVT-8801",
    timestamp: "2026-08-22 18:40:12",
    panelId: "PANEL-4A",
    nodeId: "NODE-04",
    eventType: "SUBSIDENCE_STEP",
    description: "Vertical ground subsidence exceeded 25mm threshold during face advance",
    metricValue: "+28.6 mm",
    operatorAction: "Acknowledged; Surface barricades placed along extraction perimeter",
  },
  {
    id: "EVT-8802",
    timestamp: "2026-08-22 17:15:30",
    panelId: "PANEL-4A",
    nodeId: "NODE-03",
    eventType: "TILT_DRIFT",
    description: "Dual-axis inclination slope accelerated above 2.0°/hr threshold",
    metricValue: "3.4° tilt",
    operatorAction: "Notified underground colliery safety manager",
  },
  {
    id: "EVT-8803",
    timestamp: "2026-08-22 14:02:11",
    panelId: "PANEL-4A",
    nodeId: "NODE-04",
    eventType: "CRACK_INITIATION",
    description: "Tension crack sensor resistance jumped 4.8kΩ indicating surface rupture",
    metricValue: "3.9 mm width",
    operatorAction: "Visual survey verified 4mm fissure along goaf margin",
  },
  {
    id: "EVT-8804",
    timestamp: "2026-08-22 11:20:00",
    panelId: "PANEL-4B",
    nodeId: "NODE-08",
    eventType: "MESH_HEALING",
    description: "LoRa mesh re-routed through NODE-07 after temporary link fade",
    metricValue: "3 Hops (RSSI -88dBm)",
    operatorAction: "Auto-reconfigured by ESP-NOW routing daemon",
  },
  {
    id: "EVT-8805",
    timestamp: "2026-08-22 09:30:45",
    panelId: "PANEL-4A",
    nodeId: "NODE-02",
    eventType: "BATTERY_WARNING",
    description: "Node solar float charging resumed following morning sunlight exposure",
    metricValue: "3.92 V (+65mA)",
    operatorAction: "System nominal",
  },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPanel, setSelectedPanel] = useState("ALL");

  const filteredLogs = mockHistoricalLogs.filter((log) => {
    const matchSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPanel = selectedPanel === "ALL" || log.panelId === selectedPanel;
    return matchSearch && matchPanel;
  });

  const handleExportCsv = () => {
    const headers = ["Event ID", "Timestamp", "Panel", "Node", "Type", "Description", "Value", "Action"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.panelId,
      l.nodeId,
      l.eventType,
      `"${l.description}"`,
      l.metricValue,
      `"${l.operatorAction}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mine_subsidence_historical_events.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-700">
              <History className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Historical Event Replay & Logs
              </h1>
              <p className="text-xs text-slate-500">
                Permanent Statutory Audit Trail · Subsidence Progression Records & Inspection Actions
              </p>
            </div>
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={handleExportCsv} className="h-9 px-3 gap-1.5 text-xs bg-white font-semibold">
          <FileSpreadsheet className="size-3.5 text-emerald-600" /> Export Full Audit CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[240px] max-w-sm relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search historical logs by description, node..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Panel:</span>
            {["ALL", "PANEL-4A", "PANEL-4B"].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={selectedPanel === p ? "default" : "outline"}
                onClick={() => setSelectedPanel(p)}
                className="h-7 px-2.5 text-xs font-semibold rounded-lg"
              >
                {p}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Event Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-[110px]">Event ID</TableHead>
                <TableHead className="w-[160px]">Timestamp</TableHead>
                <TableHead className="w-[100px]">Node</TableHead>
                <TableHead className="w-[140px]">Event Classification</TableHead>
                <TableHead>Geotechnical Observations</TableHead>
                <TableHead className="w-[120px]">Value</TableHead>
                <TableHead className="w-[240px]">Mitigation & Action Recorded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="text-xs hover:bg-slate-50">
                  <TableCell className="font-mono font-bold text-slate-900">{log.id}</TableCell>
                  <TableCell className="text-slate-500 font-mono text-[11px]">{log.timestamp}</TableCell>
                  <TableCell className="font-mono font-bold">{log.nodeId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {log.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">{log.description}</TableCell>
                  <TableCell className="font-mono font-bold text-rose-700">{log.metricValue}</TableCell>
                  <TableCell className="text-slate-600 text-[11px]">{log.operatorAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
