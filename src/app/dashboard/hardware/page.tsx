"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { AestheticHardwareCostDonut } from "@/components/charts";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";

export default function HardwarePage() {
  const { thresholds, toggleEmailKillSwitch } = useTelemetryContext();
  const [isToggling, setIsToggling] = useState(false);

  // Email alerts enabled state (default to true if not explicitly false)
  const isEmailEnabled = thresholds?.alertEmailsEnabled !== false;

  const handleKillSwitchToggle = async () => {
    setIsToggling(true);
    try {
      await toggleEmailKillSwitch(!isEmailEnabled);
    } finally {
      setIsToggling(false);
    }
  };

  const hardwareBOM = [
    {
      component: "Main MCU",
      part: "ESP32-WROOM-32D (Dual-Core 240MHz)",
      interface: "I2C / SPI / GPIO / ADC / Wi-Fi",
      costInr: "₹240",
      role: "Core station controller, sensor sampling loop, threshold evaluations, and actuator signaling",
    },
    {
      component: "MPU #1 (Horizontal)",
      part: "Gy87 AXL385 (3-Axis Accel + Gyro)",
      interface: "I2C (SDA: GPIO21, SCL: GPIO22 · Addr 0x68)",
      costInr: "₹180",
      role: "Measures lateral / horizontal inclination, ground tilt vectors, and vibration dynamics",
    },
    {
      component: "MPU #2 (Vertical)",
      part: "Gy87 AXL385 (3-Axis Accel + Gyro)",
      interface: "I2C (SDA: GPIO21, SCL: GPIO22 · Addr 0x69)",
      costInr: "₹180",
      role: "Mounted perpendicular to MPU #1 for true 3D orthogonal tilt and structural shift monitoring",
    },
    {
      component: "Wall Clearance Sensor",
      part: "Ultrasound Transducer Module",
      interface: "Digital (Trig: GPIO5, Echo: GPIO18)",
      costInr: "₹95",
      role: "Measures real-time distance from front rock wall; detects convergence and collapse approach",
    },
    {
      component: "Micro-Vibration Sensor",
      part: "High-Sensitivity Vibration Switch",
      interface: "Digital Interrupt (GPIO19)",
      costInr: "₹45",
      role: "Captures micro-seismic shockwaves, drilling vibrations, and pre-failure rock tremors",
    },
    {
      component: "Flammable Gas Sensor",
      part: "MQ-2 Gas Sensor Module",
      interface: "Analog ADC (GPIO34 / ADC1_CH6)",
      costInr: "₹110",
      role: "Detects explosive methane, LPG, smoke, and combustible gas accumulation in mine chambers",
    },
    {
      component: "Audible Siren Actuator",
      part: "Active Piezo Buzzer Module (85dB)",
      interface: "Digital PWM (GPIO25)",
      costInr: "₹35",
      role: "High-decibel audible emergency siren triggered automatically on hazardous safety breaches",
    },
    {
      component: "Visual Beacon Matrix",
      part: "8x8 Flash LED Dot Matrix (MAX7219)",
      interface: "SPI (DIN: GPIO23, CS: GPIO15, CLK: GPIO14)",
      costInr: "₹130",
      role: "High-visibility flashing alert beacon rendering emergency symbols (Check, Danger, Arrows)",
    },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center shadow-xs">
              <Icon icon="solar:layers-minimalistic-bold-duotone" className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                ESP Sensor Station Hardware BOM & Architecture
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Component Bill of Materials (BOM), Microcontroller Interface Mapping & Notification Controls
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Email Alert Dispatch Kill Switch */}
      <Card
        className={`rounded-2xl border transition-all shadow-xs overflow-hidden ${
          isEmailEnabled
            ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20"
            : "border-rose-300 bg-rose-50/60 dark:border-rose-900/80 dark:bg-rose-950/30"
        }`}
      >
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`size-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isEmailEnabled
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white animate-pulse"
              }`}
            >
              <Icon
                icon={isEmailEnabled ? "solar:letter-bold-duotone" : "solar:letter-cross-bold-duotone"}
                className="size-6"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Automated Alert Email Dispatch Kill Switch
                </h3>
                <Badge
                  variant={isEmailEnabled ? "default" : "destructive"}
                  className={`text-[10px] font-bold ${
                    isEmailEnabled
                      ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                      : "bg-rose-600 hover:bg-rose-600 text-white"
                  }`}
                >
                  {isEmailEnabled ? "ACTIVE DISPATCH" : "KILL SWITCH ENGAGED"}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isEmailEnabled
                  ? "SMTP gateway is armed: Real-time critical safety breach emails are actively dispatched to safety officers and engineers."
                  : "Kill switch is engaged: ALL automated email notifications are completely halted. No emails will be sent on safety breaches."}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {isEmailEnabled ? "Sending Enabled" : "Sending Stopped"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isEmailEnabled}
              disabled={isToggling}
              onClick={handleKillSwitchToggle}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                isEmailEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isEmailEnabled ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Station Unit Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-200 tabular-nums">
              ₹1,015
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">&lt; $13 USD · Low-Cost Mine Safety Station</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sensors per Node
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              5 Sensors
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2x MPU + Ultrasound + MQ2 + Vibration</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alert Actuators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400 tabular-nums">
              2 Outputs
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Piezo Buzzer + 8x8 Flash LED Matrix</p>
          </CardContent>
        </Card>
      </div>

      {/* Aesthetic Hardware Cost Donut Chart */}
      <AestheticHardwareCostDonut />

      {/* Hardware BOM Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Station Hardware Component Breakdown & ESP32 Pin Connections
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Standardized pinout utilized across every identical ESP monitoring node
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Subsystem</th>
                <th className="py-3 px-4">Hardware Component</th>
                <th className="py-3 px-4">ESP32 Pin Interface</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4">Functional Role in Mine Safety</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
              {hardwareBOM.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{item.component}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{item.part}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] font-medium">{item.interface}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{item.costInr}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 leading-relaxed">{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
