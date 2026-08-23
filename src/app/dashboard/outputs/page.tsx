"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LedMatrixDisplay } from "@/components/industrial/LedMatrixDisplay";
import {
  EmptyState,
  PageHeader,
  PageShell,
  SectionHeader,
  StatStrip,
  StatusBadge,
  Toolbar,
} from "@/components/uber/dashboard-primitives";
import type { LedMatrixPattern } from "@/types";
import { cn } from "@/lib/utils";

interface PatternOption {
  id: LedMatrixPattern;
  label: string;
  code: string;
  description: string;
  icon: string;
  tone: "live" | "watch" | "critical" | "neutral";
}

const PATTERN_OPTIONS: PatternOption[] = [
  {
    id: "NORMAL_CHECK",
    label: "Normal Check",
    code: "0x01_CHECK",
    description: "System nominal, green safety checkmark",
    icon: "solar:check-circle-bold",
    tone: "live",
  },
  {
    id: "WARNING_PULSE",
    label: "Warning Box",
    code: "0x02_WARN",
    description: "Approaching threshold, pulsing amber beacon",
    icon: "solar:danger-triangle-bold",
    tone: "watch",
  },
  {
    id: "DANGER_FLASH",
    label: "Hazard X",
    code: "0x03_DANGER",
    description: "Active hazard breach, flashing emergency X",
    icon: "solar:danger-bold",
    tone: "critical",
  },
  {
    id: "EVACUATE_ARROW",
    label: "Evac Arrow",
    code: "0x04_EVAC",
    description: "Urgent evacuation directional beacon",
    icon: "solar:shield-warning-bold",
    tone: "critical",
  },
  {
    id: "IDLE",
    label: "Standby Frame",
    code: "0x00_IDLE",
    description: "Idle perimeter indicator",
    icon: "solar:stop-circle-bold",
    tone: "neutral",
  },
];

export default function OutputsPage() {
  const {
    nodes,
    telemetry,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    selectedTelemetry,
    triggerActuatorTest,
    isConnected,
  } = useTelemetryContext();

  const node = selectedNode || nodes[0] || null;
  const tel = selectedTelemetry || (node ? telemetry[node.id] : null) || null;

  const [selectedPattern, setSelectedPattern] = useState<LedMatrixPattern>(
    tel?.actuators?.ledMatrixPattern || "NORMAL_CHECK"
  );
  const [isTriggeringPattern, setIsTriggeringPattern] = useState(false);
  const [isTriggeringSiren, setIsTriggeringSiren] = useState(false);
  const [lastActionTimestamp, setLastActionTimestamp] = useState<string | null>(null);

  const handlePatternSelect = async (pattern: LedMatrixPattern) => {
    setSelectedPattern(pattern);
    setIsTriggeringPattern(true);
    try {
      await triggerActuatorTest("ledMatrix", pattern);
      setLastActionTimestamp(new Date().toLocaleTimeString());
    } finally {
      setIsTriggeringPattern(false);
    }
  };

  const handleSirenToggle = async () => {
    setIsTriggeringSiren(true);
    try {
      await triggerActuatorTest("buzzer");
      setLastActionTimestamp(new Date().toLocaleTimeString());
    } finally {
      setIsTriggeringSiren(false);
    }
  };

  const isBuzzerActive = tel?.actuators?.buzzerActive ?? false;
  const isMatrixActive = tel?.actuators?.ledMatrixActive ?? true;
  const currentPattern = tel?.actuators?.ledMatrixPattern || selectedPattern;

  return (
    <PageShell>
      {/* Uber Base Page Header */}
      <PageHeader
        eyebrow="Actuators & Alerting"
        title="Emergency outputs"
        description="Station-level active visual beacons and high-decibel audible alerts. Test display patterns, sound sirens, and monitor GPIO actuator telemetry."
        meta={isBuzzerActive ? <StatusBadge tone="critical">Siren Engaged</StatusBadge> : undefined}
      />

      {/* Station Selector & Context Toolbar */}
      <Toolbar>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Station
          </span>
          {nodes.length > 0 ? (
            nodes.map((fleetNode) => (
              <Button
                key={fleetNode.id}
                size="sm"
                variant={selectedNodeId === fleetNode.id ? "default" : "outline"}
                onClick={() => setSelectedNodeId(fleetNode.id)}
                className={cn(
                  "font-mono text-xs",
                  selectedNodeId === fleetNode.id
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
                )}
              >
                {fleetNode.id}
              </Button>
            ))
          ) : (
            <span className="text-xs text-neutral-500">No active stations</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          <span>Loc: {node?.location || "Unassigned"}</span>
          <span>•</span>
          <span>Last command: {lastActionTimestamp || "None during session"}</span>
        </div>
      </Toolbar>

      {!node ? (
        <EmptyState
          title="No Station Selected"
          description="Select a registered station above to manage actuator drivers, trigger test patterns, and test emergency sirens."
        />
      ) : (
        <>
          {/* Actuator Status Summary Strip */}
          <StatStrip
            items={[
              {
                label: "Output Bus State",
                value: isConnected ? "Armed & Live" : "Offline",
                tone: isConnected ? "live" : "neutral",
              },
              {
                label: "Visual Beacon (8×8)",
                value: isMatrixActive ? currentPattern : "Standby",
                tone: currentPattern === "DANGER_FLASH" || currentPattern === "EVACUATE_ARROW" ? "critical" : currentPattern === "WARNING_PULSE" ? "watch" : "live",
              },
              {
                label: "Audible Siren",
                value: isBuzzerActive ? "Sounding (85 dB)" : "Standby",
                tone: isBuzzerActive ? "critical" : "neutral",
              },
              {
                label: "Actuator Latency",
                value: "<15 ms (Direct GPIO)",
              },
            ]}
          />

          {/* 2-Column Actuator Command Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: 8×8 Flash LED Matrix Controller (7 cols) */}
            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex flex-col gap-2 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-900">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
                      64-bit (8×8) WS2812 RGB LED Matrix Controller
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      WS2812B 800 kHz High-Speed Single-Wire TrueColor Visual Beacon on {node.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[10px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                      WS2812B · GPIO 15 · 24-bit RGB
                    </span>
                  </div>
                </div>

                {/* Large LED Matrix Live Preview */}
                <div className="my-6 flex flex-col items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50/70 p-6 dark:border-neutral-900 dark:bg-neutral-900/30">
                  <LedMatrixDisplay
                    pattern={currentPattern}
                    isActive={isMatrixActive}
                    size="lg"
                  />
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Rendering pattern: <strong>{currentPattern}</strong></span>
                  </div>
                </div>

                {/* Pattern Selection Grid */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Select Test Pattern
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Click to flash on hardware
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {PATTERN_OPTIONS.map((pat) => {
                      const isCurrent = currentPattern === pat.id;
                      return (
                        <button
                          key={pat.id}
                          type="button"
                          onClick={() => handlePatternSelect(pat.id)}
                          disabled={isTriggeringPattern}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                            isCurrent
                              ? "border-black bg-neutral-950 text-white shadow-xs dark:border-white dark:bg-white dark:text-black"
                              : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
                          )}
                        >
                          <Icon
                            icon={pat.icon}
                            className={cn(
                              "mt-0.5 size-4 shrink-0 transition-colors",
                              isCurrent
                                ? "text-white dark:text-black"
                                : "text-neutral-500 dark:text-neutral-400"
                            )}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold leading-none">{pat.label}</span>
                              <span
                                className={cn(
                                  "font-mono text-[9px]",
                                  isCurrent ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-400 dark:text-neutral-500"
                                )}
                              >
                                {pat.code}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "mt-1 text-[11px] leading-tight",
                                isCurrent ? "text-neutral-300 dark:text-neutral-700" : "text-neutral-500 dark:text-neutral-400"
                              )}
                            >
                              {pat.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hardware Bus Pinout Specs */}
                <div className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-900">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Hardware Bus Configuration
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="rounded border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <div className="text-[10px] text-neutral-400 uppercase">DIN (Data In)</div>
                      <div className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">GPIO 15 (Pin 15)</div>
                    </div>
                    <div className="rounded border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <div className="text-[10px] text-neutral-400 uppercase">Power VCC</div>
                      <div className="mt-0.5 font-bold text-neutral-900 dark:text-neutral-100">+5.0V DC</div>
                    </div>
                    <div className="rounded border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <div className="text-[10px] text-neutral-400 uppercase">Timing / Bus</div>
                      <div className="mt-0.5 font-bold text-neutral-900 dark:text-neutral-100">800 kHz NRZ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Decibel Siren & Circuit Diagnostics (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              {/* Piezo Siren Controller */}
              <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-900">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
                      High-Decibel Piezo Siren
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Active 2.8 kHz Audible Evacuation Alarm on {node.id}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isBuzzerActive ? "bg-red-500 animate-ping" : "bg-neutral-400"
                    )}
                  />
                </div>

                {/* Alarm Status Tile */}
                <div
                  className={cn(
                    "mt-4 rounded-lg border p-4 transition-colors",
                    isBuzzerActive
                      ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
                      : "border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg border",
                          isBuzzerActive
                            ? "border-red-500 bg-red-600 text-white animate-pulse"
                            : "border-neutral-300 bg-neutral-200 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                        )}
                      >
                        <Icon
                          icon={isBuzzerActive ? "solar:volume-loud-bold" : "solar:volume-cross-bold"}
                          className="size-5"
                        />
                      </div>
                      <div>
                        <div
                          className={cn(
                            "text-sm font-semibold",
                            isBuzzerActive ? "text-red-700 dark:text-red-300" : "text-neutral-900 dark:text-neutral-100"
                          )}
                        >
                          {isBuzzerActive ? "SIREN ACTIVE — SOUNDING" : "Siren Standby"}
                        </div>
                        <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {isBuzzerActive ? "2,800 Hz @ 85 dB SPL" : "Circuit armed, ready to trigger"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trigger / Silence Action Button */}
                  <div className="mt-4">
                    <Button
                      size="sm"
                      onClick={handleSirenToggle}
                      disabled={isTriggeringSiren}
                      className={cn(
                        "w-full font-semibold transition-all",
                        isBuzzerActive
                          ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                          : "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-white dark:hover:bg-red-400"
                      )}
                    >
                      <Icon
                        icon={isBuzzerActive ? "solar:volume-cross-bold" : "solar:volume-loud-bold"}
                        className="mr-1.5 size-4"
                      />
                      {isBuzzerActive ? "Silence Siren" : "Test Siren (Sound Alarm)"}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Failsafe note: Siren test automatically silences after safety interval. Manual trigger sends high-priority command over WebSocket.
                </div>
              </div>

              {/* Actuator Circuit Telemetry */}
              <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                  Actuator Circuit Telemetry
                </h3>
                <div className="mt-3 divide-y divide-neutral-100 text-xs dark:divide-neutral-900">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Station Node ID</span>
                    <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{node.id}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Mine Sector</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{node.location}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-500 dark:text-neutral-400">LED Bus Driver</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">WS2812B (GPIO 15)</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Siren Driver Transistor</span>
                    <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {isBuzzerActive ? "MOSFET ON (3.3V/5V HIGH)" : "MOSFET OFF (0V LOW)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Siren Pin Mapping</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">GPIO 19 (Pin 19 · PWM)</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Failsafe Interlock</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">AUTOMATIC TIMEOUT ARMED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
