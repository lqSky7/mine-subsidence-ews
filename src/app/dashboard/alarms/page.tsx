"use client";

import React, { useState, useMemo } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import type { Alarm, AlarmSeverity, AlarmState } from "@/types";
import { cn } from "@/lib/utils";

export default function AlarmsPage() {
  const { alarms, acknowledgeAlarm } = useTelemetryContext();

  const [severityFilter, setSeverityFilter] = useState<AlarmSeverity | "ALL">("ALL");
  const [stateFilter, setStateFilter] = useState<AlarmState | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAlarmForAck, setSelectedAlarmForAck] = useState<Alarm | null>(null);
  const [ackOfficerName, setAckOfficerName] = useState("");
  const [ackNotes, setAckNotes] = useState("");

  const filteredAlarms = useMemo(() => {
    return alarms.filter((a) => {
      const matchSeverity = severityFilter === "ALL" || a.severity === severityFilter;
      const matchState = stateFilter === "ALL" || a.state === stateFilter;
      const matchCategory = categoryFilter === "ALL" || a.category === categoryFilter;
      const matchSearch =
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.sourceLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchSeverity && matchState && matchCategory && matchSearch;
    });
  }, [alarms, severityFilter, stateFilter, categoryFilter, searchTerm]);

  const activeCriticalCount = alarms.filter(
    (a) => a.state === "ACTIVE" && a.severity === "CRITICAL"
  ).length;
  const activeWarningCount = alarms.filter(
    (a) => a.state === "ACTIVE" && a.severity === "WARNING"
  ).length;

  const handleOpenAckDialog = (alarm: Alarm) => {
    setSelectedAlarmForAck(alarm);
    setAckOfficerName("");
    setAckNotes("");
  };

  const handleConfirmAck = () => {
    if (!selectedAlarmForAck) return;
    acknowledgeAlarm(selectedAlarmForAck.id, ackOfficerName || "Safety Officer", ackNotes);
    setSelectedAlarmForAck(null);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <Icon icon="solar:bell-bold-duotone" className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Early Warning Safety Alerts
                </h1>
                {activeCriticalCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] font-bold animate-pulse">
                    {activeCriticalCount} CRITICAL
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-Sensor Threshold Trigger Log & Real-Time Incident Response
              </p>
            </div>
          </div>
        </div>

        {/* Quick Summary Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <span className="size-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold text-rose-800 dark:text-rose-300 tabular-nums">
              {activeCriticalCount} Critical
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="font-bold text-amber-800 dark:text-amber-300 tabular-nums">
              {activeWarningCount} Warnings
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[220px] max-w-sm relative">
              <Icon icon="solar:magnifer-linear" className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search alerts by station, hazard type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Severity:</span>
              {(["ALL", "CRITICAL", "WARNING"] as const).map((sev) => (
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

            {/* State Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1">State:</span>
              {(["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"] as const).map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={stateFilter === st ? "default" : "outline"}
                  onClick={() => setStateFilter(st)}
                  className="h-7 px-2.5 text-xs font-semibold rounded-lg"
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alarms Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableRow>
                <TableHead className="w-[110px]">Alert ID</TableHead>
                <TableHead className="w-[160px]">Timestamp</TableHead>
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead className="w-[140px]">Hazard Category</TableHead>
                <TableHead className="w-[180px]">Station Node</TableHead>
                <TableHead className="w-[120px]">Trigger Value</TableHead>
                <TableHead>Safety Description</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlarms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs font-medium">
                    No hazard alerts match the specified filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlarms.map((alarm) => (
                  <TableRow
                    key={alarm.id}
                    className={cn(
                      "text-xs transition-colors",
                      alarm.state === "ACTIVE"
                        ? alarm.severity === "CRITICAL"
                          ? "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/60 dark:hover:bg-rose-950/40"
                          : "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/40"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                  >
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {alarm.id}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                      {new Date(alarm.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          alarm.severity === "CRITICAL"
                            ? "destructive"
                            : alarm.severity === "WARNING"
                            ? "outline"
                            : "secondary"
                        }
                        className={cn(
                          "text-[10px] font-bold",
                          alarm.severity === "WARNING" && "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                        )}
                      >
                        {alarm.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300 font-semibold">
                      {alarm.category}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      {alarm.sourceLabel}
                    </TableCell>
                    <TableCell className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                      {alarm.value}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                      {alarm.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-semibold uppercase text-[10px]">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            alarm.state === "ACTIVE"
                              ? alarm.severity === "CRITICAL"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                              : alarm.state === "ACKNOWLEDGED"
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                          )}
                        />
                        <span>{alarm.state}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {alarm.state === "ACTIVE" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAckDialog(alarm)}
                          className="text-xs h-7 px-2.5 bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-50 font-bold"
                        >
                          Ack
                        </Button>
                      ) : alarm.notes ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 size-8 outline-none cursor-pointer">
                            <Icon icon="solar:chat-round-line-linear" className="size-3.5 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[220px]">
                            <div className="p-2 text-xs">
                              <span className="font-bold block text-slate-700 dark:text-slate-300">Officer Notes:</span>
                              <p className="mt-1 text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{alarm.notes}</p>
                              {alarm.acknowledgedBy && (
                                <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">
                                  Ack by {alarm.acknowledgedBy}
                                </span>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Acknowledge Dialog */}
      <Dialog open={!!selectedAlarmForAck} onOpenChange={(open) => !open && setSelectedAlarmForAck(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <Icon icon="solar:danger-triangle-bold" className="size-5" />
              Acknowledge Early Warning Hazard
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sign off on alert #{selectedAlarmForAck?.id} from {selectedAlarmForAck?.sourceLabel}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs font-sans">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900">
              <span className="font-bold text-rose-900 dark:text-rose-200 block">
                {selectedAlarmForAck?.description}
              </span>
              <span className="text-rose-700 dark:text-rose-300 font-semibold block mt-0.5">
                Trigger Reading: {selectedAlarmForAck?.value}
              </span>
            </div>

            <div className="space-y-1">
              <Label htmlFor="officerName" className="text-xs font-semibold">
                Officer In-Charge Name
              </Label>
              <Input
                id="officerName"
                placeholder="e.g. Chief Safety Engineer"
                value={ackOfficerName}
                onChange={(e) => setAckOfficerName(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs font-semibold">
                Dispatch / Corrective Action Notes
              </Label>
              <Input
                id="notes"
                placeholder="e.g. Ventilation team dispatched to Chamber 4B"
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAlarmForAck(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmAck}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Sign & Acknowledge Hazard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
