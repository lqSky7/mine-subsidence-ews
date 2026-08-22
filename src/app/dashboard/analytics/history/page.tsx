"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
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
import { History, Download, Search, FileSpreadsheet, ShieldCheck } from "lucide-react";

export default function HistoryPage() {
  const { alarms } = useTelemetryContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = alarms.filter((log) => {
    return (
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sourceLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExportCsv = () => {
    const headers = ["Alarm ID", "Timestamp", "Station", "Category", "Trigger Value", "Description", "State", "Acknowledged By"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.sourceLabel}"`,
      l.category,
      `"${l.value}"`,
      `"${l.description}"`,
      l.state,
      `"${l.acknowledgedBy || "N/A"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mine_safety_audit_logs.csv`);
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
            <div className="size-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shadow-xs">
              <History className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Safety Incident & Event Audit Logs
              </h1>
              <p className="text-xs text-slate-500">
                Real-Time Historical Log Generated from Station Sensor Threshold Events
              </p>
            </div>
          </div>
        </div>

        {filteredLogs.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleExportCsv} className="h-9 px-3 gap-1.5 text-xs bg-white font-semibold">
            <FileSpreadsheet className="size-3.5 text-emerald-600" /> Export Audit CSV
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[240px] max-w-sm relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search audit logs by description, node, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Historical Event Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Historical Incidents Recorded</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                All monitoring stations are operating within standard safety thresholds. As threshold events occur, they will be logged here in real time.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="w-[110px]">Event ID</TableHead>
                  <TableHead className="w-[170px]">Timestamp</TableHead>
                  <TableHead className="w-[180px]">Station Node</TableHead>
                  <TableHead className="w-[140px]">Category</TableHead>
                  <TableHead className="w-[120px]">Trigger Value</TableHead>
                  <TableHead>Safety Description</TableHead>
                  <TableHead className="w-[130px]">State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="text-xs hover:bg-slate-50">
                    <TableCell className="font-bold text-slate-900">{log.id}</TableCell>
                    <TableCell className="text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">{log.sourceLabel}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-rose-700">{log.value}</TableCell>
                    <TableCell className="font-medium text-slate-700">{log.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={log.state === "ACTIVE" ? "destructive" : "secondary"}
                        className="text-[10px] font-semibold"
                      >
                        {log.state}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
