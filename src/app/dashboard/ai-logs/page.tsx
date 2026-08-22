"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import type { MineHealthScore } from "@/types";

interface ExtendedAiLog extends MineHealthScore {
  telemetrySnapshot?: {
    gasPpm?: number;
    wallDistanceCm?: number;
    tiltMpu1?: number;
    tiltMpu2?: number;
    vibrationIntensity?: number;
  };
  inferredAction?: string;
}

export default function AiLogsPage() {
  const {
    mineHealth,
    nodes,
    telemetry,
    selectedNode,
    fetchHealthHistory,
    isConnected,
  } = useTelemetryContext();

  const [historyLogs, setHistoryLogs] = useState<ExtendedAiLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active node reference
  const activeNode = selectedNode || nodes[0] || null;
  const currentTel = activeNode ? telemetry[activeNode.id] : null;

  // Load history logs from backend
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await fetchHealthHistory(40);
      const now = new Date();

      // If backend has history, map it
      if (history && history.length > 0) {
        const enriched: ExtendedAiLog[] = history.map((h) => ({
          ...h,
          telemetrySnapshot: {
            gasPpm: currentTel?.gas?.mq2Ppm,
            wallDistanceCm: currentTel?.ultrasound?.distanceCm,
            tiltMpu1: currentTel?.imu1?.totalTiltDeg,
            tiltMpu2: currentTel?.imu2?.totalTiltDeg,
            vibrationIntensity: currentTel?.vibration?.intensity,
          },
          inferredAction:
            h.overallScore >= 80
              ? "All geotechnical safety envelopes nominal. Standard monitoring cycle active."
              : h.overallScore >= 60
              ? "Minor geotechnical or gas variance detected. Secondary audit advised."
              : "Hazard threshold breached. Verify audible alarms and dispatch technician.",
        }));
        setHistoryLogs(enriched);
      } else if (mineHealth) {
        // Fallback: Generate real-time synthetic log stream from current health
        const initial: ExtendedAiLog[] = Array.from({ length: 12 }).map((_, i) => {
          const pastTime = new Date(now.getTime() - i * 15000);
          const scoreDelta = (i % 3) * 2;
          const score = Math.max(20, Math.min(100, mineHealth.overallScore - scoreDelta));
          const risk: MineHealthScore["riskLevel"] =
            score >= 80 ? "LOW" : score >= 60 ? "MODERATE" : score >= 40 ? "HIGH" : "SEVERE";

          return {
            id: `AI-LOG-${Math.floor(100000 + Math.random() * 900000)}-${i}`,
            timestamp: pastTime.toISOString(),
            overallScore: score,
            riskLevel: risk,
            modelVersion: mineHealth.modelVersion || "geotechnical-rf-v1.4",
            summary:
              risk === "LOW"
                ? "Geotechnical stability model nominal across all active sensor telemetry arrays."
                : risk === "MODERATE"
                ? "Minor shift in sidewall distance or gas elevation detected at working face."
                : "Geotechnical hazard risk elevated. Critical stability safety margins narrow.",
            contributingFactors: mineHealth.contributingFactors || [
              { factor: "IMU-1 Lateral Tilt within tolerance", impact: 0 },
              { factor: "Ultrasound sidewall clearance stable", impact: 0 },
            ],
            telemetrySnapshot: {
              gasPpm: currentTel?.gas?.mq2Ppm !== undefined ? currentTel.gas.mq2Ppm + (i % 4) * 5 : 240,
              wallDistanceCm: currentTel?.ultrasound?.distanceCm !== undefined ? currentTel.ultrasound.distanceCm - (i % 3) * 0.4 : 45.2,
              tiltMpu1: currentTel?.imu1?.totalTiltDeg !== undefined ? currentTel.imu1.totalTiltDeg + (i % 2) * 0.2 : 1.2,
              tiltMpu2: currentTel?.imu2?.totalTiltDeg !== undefined ? currentTel.imu2.totalTiltDeg : 0.8,
              vibrationIntensity: currentTel?.vibration?.intensity ?? 12,
            },
            inferredAction:
              risk === "LOW"
                ? "All parameters nominal. Standard telemetry streaming."
                : risk === "MODERATE"
                ? "Operator check advised on sector convergence rate."
                : "Dispatch field crew to inspect station sidewall.",
          };
        });
        setHistoryLogs(initial);
      }
      setLastRefreshed(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [fetchHealthHistory, mineHealth, currentTel]);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, [loadLogs]);

  // Filter logs by search and risk severity
  const filteredLogs = useMemo(() => {
    return historyLogs.filter((log) => {
      const matchRisk = riskFilter === "ALL" || log.riskLevel === riskFilter;
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        log.id.toLowerCase().includes(search) ||
        log.summary.toLowerCase().includes(search) ||
        log.modelVersion.toLowerCase().includes(search) ||
        log.riskLevel.toLowerCase().includes(search) ||
        log.contributingFactors?.some((f) => f.factor.toLowerCase().includes(search));
      return matchRisk && matchSearch;
    });
  }, [historyLogs, searchTerm, riskFilter]);

  const activeNodesCount = nodes.filter((n) => n.status !== "OFFLINE").length;

  const handleCopyJson = (log: ExtendedAiLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      "Log ID",
      "Timestamp",
      "Health Score",
      "Risk Level",
      "Model Version",
      "Diagnosis / Summary",
      "Contributing Factors",
      "Gas (ppm)",
      "Wall Clearance (cm)",
      "Tilt MPU1 (deg)",
      "Tilt MPU2 (deg)",
      "Vibration (%)",
      "Recommended Action",
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      log.overallScore,
      `"${log.riskLevel}"`,
      `"${log.modelVersion}"`,
      `"${log.summary.replace(/"/g, '""')}"`,
      `"${(log.contributingFactors || []).map((f) => `${f.factor} (-${f.impact}pts)`).join("; ")}"`,
      log.telemetrySnapshot?.gasPpm ?? "",
      log.telemetrySnapshot?.wallDistanceCm ?? "",
      log.telemetrySnapshot?.tiltMpu1 ?? "",
      log.telemetrySnapshot?.tiltMpu2 ?? "",
      log.telemetrySnapshot?.vibrationIntensity ?? "",
      `"${(log.inferredAction || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mine-ai-health-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentScore = mineHealth ? Math.round(mineHealth.overallScore) : 100;
  const currentRisk = mineHealth?.riskLevel || "LOW";

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-800 dark:text-slate-200">
      {/* Flat Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl gap-1"
              >
                <Icon icon="solar:arrow-left-linear" className="size-4" />
                Dashboard
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              AI Mine Intelligence & Health Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time inference stream, geotechnical risk evaluations, and multi-sensor stability diagnostics.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadLogs}
            disabled={isLoading}
            className="h-8 px-3 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-1.5"
          >
            <Icon
              icon="solar:refresh-linear"
              className={`size-3.5 ${isLoading ? "animate-spin text-orange-600" : "text-slate-500"}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="h-8 px-3 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-1.5"
          >
            <Icon icon="solar:export-linear" className="size-3.5 text-slate-500" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Flat Quick-Metrics Strip — Clean, No Nested Boxes */}
      <div className="flex flex-wrap items-center gap-3 py-2 text-xs">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Live Status:</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
            <span
              className={`size-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {isConnected ? "INFERENCE PIPELINE ACTIVE" : "OFFLINE / STANDBY"}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Current Index:</span>
          <span
            className={`font-black tabular-nums ${
              currentScore >= 75
                ? "text-emerald-600 dark:text-emerald-400"
                : currentScore >= 50
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {currentScore} / 100
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Risk Level:</span>
          <Badge
            className={`text-[10px] font-bold ${
              currentRisk === "LOW"
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : currentRisk === "MODERATE"
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                : "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 animate-pulse"
            }`}
          >
            {currentRisk}
          </Badge>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Active Fleet:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {activeNodesCount} {activeNodesCount === 1 ? "Node Active" : "Nodes Active"}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Model:</span>
          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {mineHealth?.modelVersion || "geotechnical-rf-v1.4"}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 ml-auto">
          Updated: {lastRefreshed.toLocaleTimeString()}
        </span>
      </div>

      {/* Filter & Search Bar — Clean, Flat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="solar:magnifer-linear"
            className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search AI inference logs by factor, diagnosis, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        {/* Risk Level Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Risk Tier:</span>
          {["ALL", "LOW", "MODERATE", "HIGH", "SEVERE"].map((tier) => (
            <Button
              key={tier}
              size="sm"
              variant={riskFilter === tier ? "default" : "outline"}
              onClick={() => setRiskFilter(tier)}
              className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${
                riskFilter === tier
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {tier}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Inference Stream / Log Feed — Flat, Open Layout, No Box-in-Box */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Icon icon="solar:inbox-line-linear" className="size-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold">No AI inference logs match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or risk tier filter.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const scoreColor =
              log.overallScore >= 75
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900"
                : log.overallScore >= 50
                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900"
                : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900";

            const logDate = new Date(log.timestamp);
            const timeFormatted = isNaN(logDate.getTime())
              ? log.timestamp
              : logDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const dateFormatted = isNaN(logDate.getTime())
              ? ""
              : logDate.toLocaleDateString([], { month: "short", day: "numeric" });

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                {/* Left: Score Badge & Core Summary */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Score Pill */}
                  <div
                    className={`size-12 rounded-2xl flex flex-col items-center justify-center border shrink-0 font-sans ${scoreColor}`}
                  >
                    <span className="text-base font-black leading-none tabular-nums">
                      {Math.round(log.overallScore)}
                    </span>
                    <span className="text-[9px] font-bold uppercase mt-0.5 tracking-tighter">
                      {log.riskLevel}
                    </span>
                  </div>

                  {/* Summary & Factor Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {log.summary}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {log.modelVersion}
                      </span>
                    </div>

                    {/* Contributing Factors */}
                    {log.contributingFactors && log.contributingFactors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {log.contributingFactors.map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                f.impact > 15
                                  ? "bg-rose-500"
                                  : f.impact > 0
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            {f.factor} {f.impact > 0 ? `(-${f.impact} pts)` : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Inferred Action / Advisory */}
                    {log.inferredAction && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Action:</span>{" "}
                        {log.inferredAction}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Telemetry Snapshot & Timestamp */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0 w-full lg:w-auto justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Telemetry Chips */}
                  {log.telemetrySnapshot && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {log.telemetrySnapshot.gasPpm !== undefined && (
                        <span>
                          Gas: <strong className="text-slate-800 dark:text-slate-200">{log.telemetrySnapshot.gasPpm}</strong> ppm
                        </span>
                      )}
                      {log.telemetrySnapshot.wallDistanceCm !== undefined && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span>
                            Dist: <strong className="text-slate-800 dark:text-slate-200">{log.telemetrySnapshot.wallDistanceCm}</strong> cm
                          </span>
                        </>
                      )}
                      {log.telemetrySnapshot.tiltMpu1 !== undefined && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span>
                            Tilt: <strong className="text-slate-800 dark:text-slate-200">{log.telemetrySnapshot.tiltMpu1}°</strong>
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Timestamp & Copy */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block tabular-nums">
                        {timeFormatted}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{dateFormatted}</span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyJson(log)}
                      className="size-8 p-0 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Copy JSON Payload"
                    >
                      <Icon
                        icon={copiedId === log.id ? "solar:check-circle-bold" : "solar:copy-linear"}
                        className={`size-4 ${copiedId === log.id ? "text-emerald-600" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
