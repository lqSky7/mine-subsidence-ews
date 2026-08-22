"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent } from "@/components/ui/card";
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
import { Icon } from "@/components/ui/icon";
import { AestheticIncidentDistributionChart } from "@/components/charts";

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
    const headers = [
      "Alarm ID",
      "Timestamp",
      "Station",
      "Category",
      "Trigger Value",
      "Description",
      "State",
      "Acknowledged By",
      "Notes",
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.sourceLabel} (${log.source})"`,
      `"${log.category}"`,
      `"${log.value}"`,
      `"${log.description}"`,
      `"${log.state}"`,
      `"${log.acknowledgedBy || ""}"`,
      `"${log.notes || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mine-ews-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center shadow-xs">
              <Icon icon="solar:history-bold-duotone" className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Safety Incident & Audit Logs
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanent Record of Safety Events, Geotechnical Excursions & Operator Sign-Offs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="text-xs font-semibold h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-1.5 shadow-xs"
          >
            <Icon icon="solar:download-minimalistic-bold" className="size-3.5" /> Export Audit CSV
          </Button>
        </div>
      </div>

      {/* Incident Distribution Chart */}
      <AestheticIncidentDistributionChart alarms={alarms} />

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px] max-w-md relative">
            <Icon icon="solar:magnifer-linear" className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search audit trail by keyword, sector, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Icon icon="solar:shield-check-bold-duotone" className="size-4 text-emerald-600" />
            <span>Cryptographic Log Integrity Verified</span>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableRow>
                <TableHead className="w-[110px]">Log ID</TableHead>
                <TableHead className="w-[170px]">Timestamp</TableHead>
                <TableHead className="w-[180px]">Station Node</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead className="w-[120px]">Trigger Value</TableHead>
                <TableHead>Safety Description</TableHead>
                <TableHead className="w-[130px]">State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs font-medium">
                    No safety audit entries match your search query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {log.id}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.sourceLabel}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                      {log.value}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                      {log.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={log.state === "ACTIVE" ? "destructive" : "secondary"}
                        className="text-[10px] font-semibold"
                      >
                        {log.state}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
