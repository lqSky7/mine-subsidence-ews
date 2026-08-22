"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Icon icon="solar:fire-bold-duotone" className="size-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block text-white">Mine EWS</span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-1">
                Multi-Node Sensor System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs h-9 px-4 gap-1.5">
                Launch Command Center <Icon icon="solar:arrow-right-linear" className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 px-3 py-1 text-xs font-semibold rounded-full">
            ESP32 Multi-Sensor Early Warning Platform
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Next-Gen Multi-Node <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">
              Mine Safety Monitoring System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Real-time hazard detection integrating Dual Gy87 AXL385 Inclinometers, Ultrasound wall clearance, MQ2 flammable gas sensors, micro-vibration detection, and automated emergency sirens.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-orange-600/25 text-sm gap-2">
                Open Command Center <Icon icon="solar:arrow-right-linear" className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard/hardware">
              <Button size="lg" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 font-semibold h-11 px-6 rounded-xl text-sm">
                Hardware Architecture
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sensor Array Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-orange-400 font-semibold mb-2">Sensor Architecture</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Standardized Multi-Sensor Suite</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl text-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="size-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Icon icon="solar:flame-bold-duotone" className="size-5 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-white">MQ2 Flammable Gas Sensor</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Continuous ppm monitoring for methane, LPG, combustible gas accumulation, and smoke in underground galleries.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl text-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Icon icon="solar:radar-2-bold-duotone" className="size-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white">Ultrasound Wall Distance</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Real-time distance clearance measurement to detect convergence, sidewall deformation, and rock displacement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl text-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Icon icon="solar:compass-bold-duotone" className="size-5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white">Dual Gy87 Inclinometers</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Two orthogonal sensors measuring horizontal (lateral) and vertical (longitudinal) tilt angles and acceleration.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl text-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Icon icon="solar:graph-up-bold-duotone" className="size-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">Micro-Vibration Sensor</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                High-sensitivity shockwave detection capturing micro-seismic vibrations and rock fracture tremors.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl text-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="size-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Icon icon="solar:volume-loud-bold-duotone" className="size-5 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-white">Audible Siren Actuator</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                High-decibel emergency siren activated automatically when critical safety thresholds are breached.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl text-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Icon icon="solar:cpu-bolt-bold-duotone" className="size-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">8x8 Flash LED Matrix</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Visual beacon displaying real-time warning patterns, evacuation arrows, and system health status.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
