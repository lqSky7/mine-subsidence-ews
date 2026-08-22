"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Cpu, Radio, Compass, Activity, ShieldCheck, Flame, Volume2, Grid3X3, CheckCircle2 } from "lucide-react";

export default function HardwarePage() {
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
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shadow-xs">
              <Layers className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                ESP Sensor Station Hardware BOM & Architecture
              </h1>
              <p className="text-xs text-slate-500">
                Single/Multi-Node Station Specification · Dual Gy87 MPU + Ultrasound + MQ2 + Vibration + Buzzer + 8x8 LED Matrix
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs bg-emerald-50/50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Station Unit Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-emerald-900">₹1,015</div>
            <p className="text-xs text-emerald-700 mt-1">&lt; $13 USD · Low-Cost Mine Safety Station</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sensors per Node
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-slate-900">5 Sensors</div>
            <p className="text-xs text-slate-500 mt-1">2x MPU + Ultrasound + MQ2 + Vibration</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Alert Actuators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-orange-600">2 Outputs</div>
            <p className="text-xs text-slate-500 mt-1">Piezo Buzzer + 8x8 Flash LED Matrix</p>
          </CardContent>
        </Card>
      </div>

      {/* Hardware BOM Table */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900">
            Station Hardware Component Breakdown & ESP32 Pin Connections
          </CardTitle>
          <CardDescription className="text-xs">
            Standardized pinout utilized across every identical ESP monitoring node
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subsystem</th>
                <th className="py-3 px-4">Hardware Component</th>
                <th className="py-3 px-4">ESP32 Pin Interface</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4">Functional Role in Mine Safety</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {hardwareBOM.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.component}</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{item.part}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{item.interface}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{item.costInr}</td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed">{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
