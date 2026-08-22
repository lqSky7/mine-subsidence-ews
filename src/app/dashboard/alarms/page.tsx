"use client";

import React, { useState, useMemo } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, AlertTriangle, Filter, CheckCircle2, MessageSquare, Bell } from "lucide-react";
import type { Alarm, AlarmSeverity, AlarmState } from "@/types";
import { cn } from "@/lib/utils";

export default function AlarmsPage() {
  const { alarms, acknowledgeAlarm } = useTelemetryContext();

  const [severityFilter, setSeverityFilter] = useState<AlarmSeverity | "ALL">("ALL");
  const [stateFilter, setStateFilter] = useState<AlarmState | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Acknowledge Dialog State
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [ackNotes, setAckNotes] = useState("");

  const filteredAlarms = useMemo(() => {
    return alarms.filter((alarm) => {
      const matchSeverity = severityFilter === "ALL" || alarm.severity === severityFilter;
      const matchState = stateFilter === "ALL" || alarm.state === stateFilter;
      const matchCategory = categoryFilter === "ALL" || alarm.category === categoryFilter;
      const matchSearch =
        alarm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.sourceLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.source.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSeverity && matchState && matchCategory && matchSearch;
    });
  }, [alarms, severityFilter, stateFilter, categoryFilter, searchTerm]);

  const handleOpenAckDialog = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setAckNotes("");
  };

  const handleConfirmAck = () => {
    if (selectedAlarm) {
      acknowledgeAlarm(selectedAlarm.id, ackNotes);
      setSelectedAlarm(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shadow-xs">
              <Bell className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Early Warning Alerts & Hazard Logs
              </h1>
              <p className="text-xs text-slate-500">
                DGMS Mine Safety Alarms · Geotechnical Threshold Breaches · Operator Acknowledgment Workflow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end justify-between">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <Label htmlFor="search" className="text-xs font-semibold text-slate-600">
              Search Alert Logs
            </Label>
            <Input
              id="search"
              placeholder="Filter by description, node ID, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 text-xs h-9 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Severity */}
          <div>
            <Label className="text-xs font-semibold text-slate-600">Severity</Label>
            <div className="flex gap-1.5 mt-1">
              {["ALL", "CRITICAL", "WARNING", "INFO"].map((sev) => (
                <Button
                  key={sev}
                  variant={severityFilter === sev ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeverityFilter(sev as any)}
                  className="h-8 text-xs font-semibold"
                >
                  {sev}
                </Button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs font-semibold text-slate-600">Hazard Type</Label>
            <div className="flex gap-1.5 mt-1">
              {["ALL", "DISPLACEMENT", "TILT", "CRACK", "AI_PREDICTION"].map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className="h-8 text-xs font-semibold"
                >
                  {cat === "AI_PREDICTION" ? "AI Model" : cat}
                </Button>
              ))}
            </div>
          </div>

          {/* State */}
          <div>
            <Label className="text-xs font-semibold text-slate-600">State</Label>
            <div className="flex gap-1.5 mt-1">
              {["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"].map((st) => (
                <Button
                  key={st}
                  variant={stateFilter === st ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStateFilter(st as any)}
                  className="h-8 text-xs font-semibold"
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alarm Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-[100px]">Alarm ID</TableHead>
                <TableHead className="w-[170px]">Timestamp</TableHead>
                <TableHead className="w-[110px]">Severity</TableHead>
                <TableHead className="w-[120px]">Hazard Type</TableHead>
                <TableHead className="w-[160px]">Sensor Node</TableHead>
                <TableHead className="w-[110px]">Trigger Value</TableHead>
                <TableHead>Geotechnical Description</TableHead>
                <TableHead className="w-[120px]">State</TableHead>
                <TableHead className="w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlarms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                    No early warning alerts match the specified filter criteria.
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
                          ? "bg-rose-50/40 hover:bg-rose-50/60"
                          : "bg-amber-50/40 hover:bg-amber-50/60"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <TableCell className="font-mono font-bold text-slate-900">
                      {alarm.id}
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-[11px]">
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
                          alarm.severity === "WARNING" && "bg-amber-100 text-amber-900 border-amber-300"
                        )}
                      >
                        {alarm.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 font-semibold">
                      {alarm.category}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {alarm.sourceLabel}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-rose-700">
                      {alarm.value}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
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
                          className="text-xs h-7 px-2.5 bg-white border-amber-300 text-amber-900 hover:bg-amber-50 font-bold"
                        >
                          Ack
                        </Button>
                      ) : alarm.notes ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 size-8 outline-none cursor-pointer">
                            <MessageSquare className="size-3.5 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[220px]">
                            <div className="p-2 text-xs">
                              <span className="font-bold block text-slate-700">Officer Notes:</span>
                              <p className="mt-1 text-slate-600 font-sans leading-relaxed">{alarm.notes}</p>
                              {alarm.acknowledgedBy && (
                                <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">
                                  Ack by {alarm.acknowledgedBy}
                                </span>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Acknowledgement Dialog Modal */}
      <Dialog open={selectedAlarm !== null} onOpenChange={(open) => !open && setSelectedAlarm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <AlertTriangle className="size-5 text-amber-500" />
              Acknowledge Hazard Alert {selectedAlarm?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm safety alert receipt and record mandatory field inspection remarks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1.5">
              <div>
                <span className="text-slate-500">Sensor Location:</span>{" "}
                <span className="font-bold text-slate-900">{selectedAlarm?.sourceLabel}</span>
              </div>
              <div>
                <span className="text-slate-500">Hazard Description:</span>{" "}
                <span className="font-medium text-slate-900">{selectedAlarm?.description}</span>
              </div>
              <div>
                <span className="text-slate-500">Trigger Reading:</span>{" "}
                <span className="font-mono font-bold text-rose-700">{selectedAlarm?.value}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                Safety Officer Log Remarks / Action Taken
              </Label>
              <Input
                id="notes"
                placeholder="e.g. Field inspection team dispatched to benchmark pillars..."
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAlarm(null)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleConfirmAck} className="text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold">
              Confirm Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
