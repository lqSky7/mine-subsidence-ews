"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Grid3X3, Zap, CheckCircle2, AlertTriangle, Shield, Inbox } from "lucide-react";
import { LedMatrixDisplay } from "@/components/industrial/LedMatrixDisplay";
import type { LedMatrixPattern } from "@/types";

export default function OutputsPage() {
  const {
    nodes,
    telemetry,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    selectedTelemetry,
    triggerActuatorTest,
  } = useTelemetryContext();

  const node = selectedNode || nodes[0] || null;
  const tel = selectedTelemetry || (node ? telemetry[node.id] : null) || null;

  const [testPattern, setTestPattern] = useState<LedMatrixPattern>(
    tel?.actuators?.ledMatrixPattern || "NORMAL_CHECK"
  );

  const handlePatternSelect = (pattern: LedMatrixPattern) => {
    setTestPattern(pattern);
    triggerActuatorTest("ledMatrix", pattern);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center shadow-xs">
              <Volume2 className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Alert Actuators & Output Devices
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                8x8 Flash LED Matrix & High-Decibel Buzzer Controller · Station-Level Emergency Alerting
              </p>
            </div>
          </div>
        </div>

        {/* Node Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Station:</span>
          {nodes.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {nodes.map((n) => (
                <Button
                  key={n.id}
                  size="sm"
                  variant={selectedNodeId === n.id ? "default" : "ghost"}
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`h-7 px-3 text-xs font-bold rounded-lg ${
                    selectedNodeId === n.id
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {n.id}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              — No Nodes Available —
            </div>
          )}
        </div>
      </div>

      {!node ? (
        <Card className="border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Actuator Outputs Available
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Station output controls and LED visual matrix monitors will activate once a monitoring node connects to the network.
          </p>
        </Card>
      ) : (
        /* Main 2-Column Actuators Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 8x8 Flash LED Matrix Controller (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Grid3X3 className="size-4 text-orange-600" />
                      8x8 Flash LED Matrix Display
                    </CardTitle>
                    <CardDescription className="text-xs">
                      MAX7219 / SPI 64-LED Visual Beacon on {node.id}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-semibold text-xs">
                    GPIO DIN/CS/CLK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center space-y-6">
                {/* Large 8x8 LED Matrix Rendering */}
                <LedMatrixDisplay
                  pattern={tel?.actuators?.ledMatrixPattern || testPattern}
                  isActive={tel?.actuators?.ledMatrixActive ?? true}
                  size="lg"
                />

                {/* Pattern Selector Chips */}
                <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                    Test Visual Beacon Pattern:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "NORMAL_CHECK", label: "Checkmark", icon: CheckCircle2, color: "text-emerald-600" },
                      { id: "WARNING_PULSE", label: "Warning Box", icon: AlertTriangle, color: "text-amber-600" },
                      { id: "DANGER_FLASH", label: "Hazard X", icon: AlertTriangle, color: "text-rose-600" },
                      { id: "EVACUATE_ARROW", label: "Evac Arrow", icon: Shield, color: "text-blue-600" },
                    ].map((pat) => (
                      <Button
                        key={pat.id}
                        size="sm"
                        variant={testPattern === pat.id ? "default" : "outline"}
                        onClick={() => handlePatternSelect(pat.id as LedMatrixPattern)}
                        className={`text-xs font-semibold h-8 justify-start gap-2 ${
                          testPattern === pat.id ? "bg-orange-600 hover:bg-orange-700 text-white font-bold" : ""
                        }`}
                      >
                        <pat.icon className={`size-3.5 ${testPattern === pat.id ? "text-white" : pat.color}`} />
                        {pat.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: High-Decibel Piezo Siren & Circuit Telemetry (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Buzzer Siren Controller */}
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Volume2 className="size-4 text-orange-600" />
                  High-Decibel Piezo Siren
                </CardTitle>
                <CardDescription className="text-xs">
                  Active 2.8 kHz Audible Evacuation Alarm on {node.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    tel?.actuators?.buzzerActive
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center ${
                        tel?.actuators?.buzzerActive
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {tel?.actuators?.buzzerActive ? (
                        <Volume2 className="size-5" />
                      ) : (
                        <VolumeX className="size-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                        {tel?.actuators?.buzzerActive ? "SIREN ENGAGED" : "Siren Standby"}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {tel?.actuators?.buzzerActive ? "2,800 Hz @ 85 dB Output" : "Normal Inactive State"}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={tel?.actuators?.buzzerActive ? "destructive" : "default"}
                    onClick={() => triggerActuatorTest("buzzer")}
                    className="text-xs font-bold h-8"
                  >
                    {tel?.actuators?.buzzerActive ? "Silence Siren" : "Test Siren"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Circuit Summary */}
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Actuator Circuit Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Station ID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{node.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Location</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{node.location}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">LED Matrix State</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {tel?.actuators?.ledMatrixActive ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Siren Transistor</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {tel?.actuators?.buzzerActive ? "DRIVING (3.3V HIGH)" : "LOW (OFF)"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
