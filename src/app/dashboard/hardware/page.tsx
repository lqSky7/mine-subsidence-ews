"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Cpu, Radio, Compass, Activity, ShieldCheck, Sun, Zap, CheckCircle2 } from "lucide-react";

export default function HardwarePage() {
  const hardwareBOM = [
    {
      component: "Main Processing MCU",
      part: "ESP32-WROOM-32D (Dual-Core 240MHz)",
      interface: "SPI / I2C / UART / ADC",
      costInr: "₹240",
      role: "Ultra-low-power sleep control, digital signal sampling, ESP-NOW / LoRa mesh routing",
    },
    {
      component: "Ground Tilt & Inclination",
      part: "MPU6050 (3-Axis Accel + 3-Axis Gyro)",
      interface: "I2C (SDA: GPIO21, SCL: GPIO22)",
      costInr: "₹110",
      role: "Measures micro-degree ground tilt and resultant surface inclination vectors",
    },
    {
      component: "Vertical Displacement Sensor",
      part: "HC-SR04 Ultrasonic Transducer",
      interface: "Digital (Trig: GPIO5, Echo: GPIO18)",
      costInr: "₹85",
      role: "Continuous benchmark distance measurement; computes vertical ground depression delta",
    },
    {
      component: "Micro-Vibration Switch",
      part: "SW420 High-Sensitivity Vibration Module",
      interface: "GPIO Interrupt (GPIO19)",
      costInr: "₹55",
      role: "Detects pre-failure rockburst micro-seismic vibrations and fault sliding pulses",
    },
    {
      component: "Tension Crack Sensor",
      part: "Custom Fabricated Conductive Grid",
      interface: "ADC Analog (GPIO34)",
      costInr: "₹35",
      role: "Detects surface tensile fracture aperture widening through resistance impedance shift",
    },
    {
      component: "Long-Range Mesh Transceiver",
      part: "Semtech SX1276 (865-867 MHz IN865)",
      interface: "SPI (SCK: 14, MISO: 12, MOSI: 13, CS: 15)",
      costInr: "₹320",
      role: "Multi-hop wireless mesh packet relay up to 2.5 km line-of-sight per node link",
    },
    {
      component: "Power & Solar Harvesting",
      part: "18650 3.7V 2600mAh + TP4056 + 5V 1W Solar Panel",
      interface: "DC Rail + ADC Voltage Divider",
      costInr: "₹280",
      role: "Complete 24/7 autonomous energy harvesting for remote coal mine surface deployment",
    },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-700">
              <Layers className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Hardware Architecture & Low-Cost BOM
              </h1>
              <p className="text-xs text-slate-500">
                Indigenous Made in India Smart Sensor Node Bill of Materials · Under ₹1,150 (~$13.50) per Node
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost & Innovation Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs bg-emerald-50/50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Node Unit Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-emerald-900">₹1,125</div>
            <p className="text-xs text-emerald-700 mt-1">&lt; $14 USD · Student Prototype Friendly</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Commercial Imported Equivalent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-slate-900">₹45,000+</div>
            <p className="text-xs text-slate-500 mt-1">~ 97.5% Cost Reduction achieved</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Surface Mesh Scalability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-orange-600">64 Nodes / GW</div>
            <p className="text-xs text-slate-500 mt-1">Coverage across 2.5 km² Panel</p>
          </CardContent>
        </Card>
      </div>

      {/* Complete Hardware BOM Table */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900">
            Smart Surface Sensor Node Component Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Open-source hardware specification utilizing readily available COTS components
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subsystem</th>
                <th className="py-3 px-4">Hardware Component</th>
                <th className="py-3 px-4">Pin Interface</th>
                <th className="py-3 px-4">Approx Cost</th>
                <th className="py-3 px-4">Geotechnical Sensing Role</th>
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
