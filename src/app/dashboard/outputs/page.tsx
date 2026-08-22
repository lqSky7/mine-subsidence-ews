"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Grid3X3, Zap, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
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

  const node = selectedNode || nodes[0];
  const tel = selectedTelemetry || (node ? telemetry[node.id] : null);

  const [testPattern, setTestPattern] = useState<LedMatrixPattern>(
    tel?.actuators.ledMatrixPattern || "NORMAL_CHECK"
  );

  const handlePatternSelect = (pattern: LedMatrixPattern) => {
    setTestPattern(pattern);
    triggerActuatorTest("ledMatrix", pattern);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shadow-xs">
              <Volume2 className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Alert Actuators & Output Devices
              </h1>
              <p className="text-xs text-slate-500">
                8x8 Flash LED Matrix & High-Decibel Buzzer Controller · Station-Level Emergency Alerting
              </p>
            </div>
          </div>
        </div>
        {/* Node Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Station:</span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {nodes.length > 0 ? (
              nodes.map((n) => (
                <Button
                  key={n.id}
                  size="sm"
                  variant={selectedNodeId === n.id ? "default" : "ghost"}
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`h-7 px-3 text-xs font-bold rounded-lg ${
                    selectedNodeId === n.id ? "bg-orange-600 hover:bg-orange-700 text-white" : "text-slate-700"
                  }`}
                >
                  {n.id}
                </Button>
              ))
            ) : (
              <span className="text-xs font-semibold text-slate-400 px-2 py-0.5">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Actuators Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8x8 Flash LED Matrix Controller (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Grid3X3 className="size-4 text-orange-600" />
                    8x8 Flash LED Matrix Display
                  </CardTitle>
                  <CardDescription className="text-xs">
                    MAX7219 / SPI 64-LED Visual Beacon on {node?.id || "-"}
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
                isActive={tel?.actuators?.ledMatrixActive ?? false}
                size="lg"
              />

              {/* Pattern Selection Buttons */}
              <div className="w-full space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Select Visual Alert Pattern (Manual Override / Test):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    variant={tel?.actuators?.ledMatrixPattern === "NORMAL_CHECK" ? "default" : "outline"}
                    size="sm"
                    disabled={!tel}
                    onClick={() => handlePatternSelect("NORMAL_CHECK")}
                    className="text-xs font-semibold justify-start"
                  >
                    <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-600" />
                    NORMAL_CHECK
                  </Button>
                  <Button
                    variant={tel?.actuators?.ledMatrixPattern === "WARNING_PULSE" ? "default" : "outline"}
                    size="sm"
                    disabled={!tel}
                    onClick={() => handlePatternSelect("WARNING_PULSE")}
                    className="text-xs font-semibold justify-start"
                  >
                    <AlertTriangle className="size-3.5 mr-1.5 text-amber-500" />
                    WARNING_PULSE
                  </Button>
                  <Button
                    variant={tel?.actuators?.ledMatrixPattern === "DANGER_FLASH" ? "default" : "outline"}
                    size="sm"
                    disabled={!tel}
                    onClick={() => handlePatternSelect("DANGER_FLASH")}
                    className="text-xs font-semibold justify-start"
                  >
                    <Zap className="size-3.5 mr-1.5 text-rose-600" />
                    DANGER_FLASH
                  </Button>
                  <Button
                    variant={tel?.actuators?.ledMatrixPattern === "EVACUATE_ARROW" ? "default" : "outline"}
                    size="sm"
                    disabled={!tel}
                    onClick={() => handlePatternSelect("EVACUATE_ARROW")}
                    className="text-xs font-semibold justify-start"
                  >
                    <Shield className="size-3.5 mr-1.5 text-rose-600" />
                    EVACUATE_ARROW
                  </Button>
                  <Button
                    variant={tel?.actuators?.ledMatrixPattern === "IDLE" ? "default" : "outline"}
                    size="sm"
                    disabled={!tel}
                    onClick={() => handlePatternSelect("IDLE")}
                    className="text-xs font-semibold justify-start"
                  >
                    <Grid3X3 className="size-3.5 mr-1.5 text-slate-400" />
                    IDLE (BOX)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Buzzer Siren & Linkage Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Buzzer Siren Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Volume2 className="size-4 text-orange-600" />
                Audible Piezo Buzzer Siren
              </CardTitle>
              <CardDescription className="text-xs">
                Emergency evacuation buzzer on {node?.id || "-"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center ${
                      tel?.actuators?.buzzerActive
                        ? "bg-rose-100 text-rose-700 animate-pulse"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {tel?.actuators?.buzzerActive ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {tel?.actuators ? (tel.actuators.buzzerActive ? "SIREN SOUNDING" : "Buzzer Inactive") : "-"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {tel?.actuators ? (tel.actuators.buzzerActive ? "Tone: 2.8 kHz @ 85 dB" : "Armed & Ready") : "Awaiting backend data"}
                    </span>
                  </div>
                </div>
                <Button
                  disabled={!tel}
                  variant={tel?.actuators?.buzzerActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => triggerActuatorTest("buzzer")}
                  className="font-bold text-xs"
                >
                  {tel?.actuators?.buzzerActive ? "Silence Siren" : "Sound Buzzer Test"}
                </Button>
              </div>

              {/* Automatic Safety Linkage Details */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Automatic Alarm Triggers:</span>
                <ul className="space-y-1.5 text-slate-600 pl-4 list-disc font-medium">
                  <li>
                    <span className="font-semibold text-slate-800">MQ2 Gas &gt; 800 ppm:</span> Buzzer continuous + LED DANGER_FLASH
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800">Wall Clearance &lt; 15 cm:</span> Buzzer pulsed + LED EVACUATE_ARROW
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800">Tilt Angle &gt; 7.0°:</span> Buzzer siren + LED DANGER_FLASH
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
